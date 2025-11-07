import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { createWorker } from 'tesseract.js';
import { writeFile, mkdir, readFile, stat } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AIWorkflowOrchestrator } from '@/lib/ai-workflow-orchestrator';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    let projectId: string | undefined = (formData.get('projectId') as string | null) || undefined;
    const category = formData.get('category') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // If no project ID provided, fetch or create a default project for this user
    if (!projectId || projectId === 'default-project' || projectId === 'null' || projectId === 'undefined') {
      // Try to get user's first project
      const { data: projects, error: fetchError } = await supabaseAdmin
        .from('projects')
        .select('id')
        .eq('created_by', session.user.id)
        .limit(1);

      if (projects && projects.length > 0) {
        projectId = projects[0].id;
      } else {
        // Create a default project if none exists
        const { data: newProject, error: projectError } = await supabaseAdmin
          .from('projects')
          .insert({
            name: 'Default Project',
            description: 'Auto-created default project for uploads',
            created_by: session.user.id
          })
          .select('id')
          .single();

        if (projectError || !newProject) {
          console.error('Failed to create default project:', projectError);
          return NextResponse.json(
            { error: 'Failed to create default project', details: projectError?.message },
            { status: 500 }
          );
        }

        projectId = newProject.id;
      }
    }

    // Validate file size (500MB limit)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 500MB.' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/tiff',
      'application/dwg',
      'application/dxf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];

    const fileType = file.type || getFileTypeFromExtension(file.name);
    if (!allowedTypes.includes(fileType) && !isCADFile(file.name)) {
      return NextResponse.json(
        { error: 'Unsupported file type' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileId = uuidv4();
    const fileExtension = path.extname(file.name);
    const fileName = `${fileId}${fileExtension}`;
    
    // Create project-specific upload directory
    const uploadDir = path.join(process.cwd(), 'uploads', projectId || 'uncategorized');
    const filePath = path.join(uploadDir, fileName);

    // Ensure upload directory exists (creates nested directories)
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Save file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Insert document record into database
    const documentData = {
      id: fileId,
      name: file.name,
      type: fileType,
      status: 'uploaded' as const,
      size: file.size,
      url: `/uploads/${projectId || 'uncategorized'}/${fileName}`,
      project_id: projectId,
      uploaded_by: session.user.id,
      category: category || 'Uncategorized'
    };

    const { data: document, error: dbError } = await supabaseAdmin
      .from('documents')
      .insert(documentData)
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save document record' },
        { status: 500 }
      );
    }

    // Helper function to trigger AI workflow
    const triggerAIWorkflow = async () => {
      try {
        const orchestrator = AIWorkflowOrchestrator.getInstance();
        const workflowResult = await orchestrator.handleDocumentUpload(fileId, {
          userId: session.user.id,
          projectId: projectId,
          documentId: fileId
        });

        // Execute any generated actions
        if (workflowResult.success && workflowResult.actions && workflowResult.actions.length > 0) {
          await orchestrator.executeActions(workflowResult.actions, {
            userId: session.user.id,
            projectId: projectId,
            documentId: fileId
          });
        }
      } catch (error) {
        console.error('AI workflow orchestration failed:', error);
      }
    };

    // Start OCR processing for supported files
    if (isImageFile(file.name) || file.type === 'application/pdf') {
      console.log(`[UPLOAD] File requires OCR processing: ${fileId}, type: ${file.type}`);
      
      // Immediately update status to 'processing' before starting OCR
      await supabaseAdmin
        .from('documents')
        .update({
          status: 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', fileId);

      console.log(`[UPLOAD] Status updated to 'processing' for: ${fileId}`);

      // Start OCR in background
      processOCR(fileId, filePath, file.type)
        .then(async ({ extractedText, confidence }) => {
          console.log(`[UPLOAD] OCR succeeded, updating to completed: ${fileId}`);
          
          // Update document with OCR results
          await supabaseAdmin
            .from('documents')
            .update({
              status: 'completed',
              extracted_text: extractedText,
              confidence: confidence,
              updated_at: new Date().toISOString()
            })
            .eq('id', fileId);

          console.log(`[UPLOAD] Document marked as completed: ${fileId}`);

          // Trigger AI workflow orchestration
          await triggerAIWorkflow();
        })
        .catch(async (error) => {
          console.error(`[UPLOAD] OCR failed for ${fileId}:`, error);
          
          // Update document status to error
          await supabaseAdmin
            .from('documents')
            .update({
              status: 'error',
              updated_at: new Date().toISOString()
            })
            .eq('id', fileId);

          console.log(`[UPLOAD] Document marked as error: ${fileId}`);
        });
    } else {
      console.log(`[UPLOAD] File does not require OCR: ${fileId}`);
      
      // Mark as completed for non-OCR files
      await supabaseAdmin
        .from('documents')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', fileId);

      // Trigger AI workflow orchestration for non-OCR files
      await triggerAIWorkflow();
    }

    console.log(`[UPLOAD] Returning response for: ${fileId}`);

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        name: document.name,
        type: document.type,
        status: isImageFile(file.name) || file.type === 'application/pdf' ? 'processing' : 'completed',
        size: document.size,
        url: document.url,
        category: document.category,
        uploadedAt: document.created_at
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
function getFileTypeFromExtension(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const typeMap: { [key: string]: string } = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.tiff': 'image/tiff',
    '.tif': 'image/tiff',
    '.dwg': 'application/dwg',
    '.dxf': 'application/dxf',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.csv': 'text/csv'
  };
  return typeMap[ext] || 'application/octet-stream';
}

function isCADFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return ['.dwg', '.dxf'].includes(ext);
}

function isImageFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.tiff', '.tif'].includes(ext);
}

async function processOCR(fileId: string, filePath: string, fileType: string): Promise<{ extractedText: string; confidence: number }> {
  console.log(`[OCR] Starting OCR processing for file: ${fileId}, type: ${fileType}`);

  try {
    let extractedText = '';
    let confidence = 0;

    if (fileType === 'application/pdf') {
      // Use pdfjs-dist for reliable PDF text extraction
      console.log(`[OCR] Processing PDF file with pdfjs-dist: ${fileId}`);
      try {
        const dataBuffer = await readFile(filePath);
        
        // Import pdfjs-dist legacy build for Node.js (avoids DOMMatrix errors)
        // Legacy build provides polyfills for browser APIs like DOMMatrix, Canvas, etc.
        const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
        
        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(dataBuffer),
          useSystemFonts: true,
        });
        
        const pdfDocument = await loadingTask.promise;
        const numPages = pdfDocument.numPages;
        
        console.log(`[OCR] PDF loaded: ${numPages} pages`);
        
        // Extract text from all pages
        const textPromises = [];
        for (let i = 1; i <= numPages; i++) {
          textPromises.push(
            pdfDocument.getPage(i).then(async (page) => {
              const textContent = await page.getTextContent();
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              return textContent.items.map((item: any) => item.str).join(' ');
            })
          );
        }
        
        const pageTexts = await Promise.all(textPromises);
        extractedText = pageTexts.join('\n\n').trim();
        confidence = extractedText.length > 0 ? 95 : 50;
        
        console.log(`[OCR] PDF parsed successfully: ${extractedText.length} characters, ${numPages} pages`);
      } catch (pdfError) {
        console.error(`[OCR] PDF parsing failed: ${pdfError}`);
        
        // Provide helpful metadata even if text extraction fails
        const stats = await stat(filePath);
        const errorMsg = pdfError instanceof Error ? pdfError.message : 'Unknown error';
        
        extractedText = `PDF Document Information:
- Filename: ${path.basename(filePath)}
- File Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB
- Status: Text extraction failed (${errorMsg})
- Recommendation: This PDF may contain complex graphics, scanned images, or require advanced parsing. Consider manual review or using specialized PDF tools.
- Note: Document has been uploaded successfully and is available for download and manual review.`;
        
        confidence = 0;
      }
    } else {
      // Process image files with Tesseract
      console.log(`[OCR] Processing image file with Tesseract: ${fileId}`);
      try {
        // Configure Tesseract worker for Node.js
        // In Node.js, Tesseract automatically uses local paths from node_modules
        // DO NOT use CDN URLs (workerPath, corePath, langPath) in Node.js - causes ERR_WORKER_PATH
        const worker = await createWorker('eng', 1, {
          logger: (m) => console.log(`[OCR-Tesseract] ${m.status}: ${m.progress ? (m.progress * 100).toFixed(0) + '%' : ''}`),
        });
        
        // Recognize text from the image file
        const { data: { text, confidence: ocrConfidence } } = await worker.recognize(filePath);
        extractedText = text.trim();
        confidence = Math.round(ocrConfidence);
        
        // Terminate worker to free resources
        await worker.terminate();
        
        console.log(`[OCR] Tesseract succeeded: ${extractedText.length} characters, ${confidence}% confidence`);
      } catch (tesseractError) {
        console.error(`[OCR] Tesseract failed: ${tesseractError}`);
        const errorMsg = tesseractError instanceof Error ? tesseractError.message : 'Unknown error';
        extractedText = `Image file uploaded. OCR processing failed: ${errorMsg}`;
        confidence = 0;
      }
    }

    console.log(`[OCR] ✓ OCR completed for file: ${fileId}, confidence: ${confidence}%, text length: ${extractedText.length}`);

    return {
      extractedText,
      confidence
    };

  } catch (error) {
    console.error(`[OCR] ✗ OCR processing failed for file ${fileId}:`, error);
    // Return fallback instead of throwing
    return {
      extractedText: `Document uploaded. OCR processing encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      confidence: 0
    };
  }
}

// GET endpoint to retrieve documents
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: documents, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      documents: documents || []
    });

  } catch (error) {
    console.error('Fetch documents error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
