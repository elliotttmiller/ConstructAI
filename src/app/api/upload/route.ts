import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { createWorker } from 'tesseract.js';
import { writeFile, mkdir } from 'fs/promises';
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
      processOCR(fileId, filePath, file.type)
        .then(async ({ extractedText, confidence }) => {
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

          // Trigger AI workflow orchestration
          await triggerAIWorkflow();
        })
        .catch(async (error) => {
          console.error('OCR processing failed:', error);
          // Update document status to error
          await supabaseAdmin
            .from('documents')
            .update({
              status: 'error',
              updated_at: new Date().toISOString()
            })
            .eq('id', fileId);
        });
    } else {
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

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        name: document.name,
        type: document.type,
        status: document.status,
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
  console.log(`Starting OCR processing for file: ${fileId}`);

  try {
    // Update status to processing
    await supabaseAdmin
      .from('documents')
      .update({
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', fileId);

    const worker = await createWorker('eng');

    let extractedText = '';
    let confidence = 0;

    if (fileType === 'application/pdf') {
      // For PDF files, we'd need additional processing
      // For now, we'll simulate PDF text extraction
      extractedText = 'PDF text extraction would be implemented here with a PDF parser.';
      confidence = 85;
    } else {
      // Process image files with Tesseract
      const { data: { text, confidence: ocrConfidence } } = await worker.recognize(filePath);
      extractedText = text.trim();
      confidence = Math.round(ocrConfidence);
    }

    await worker.terminate();

    console.log(`OCR completed for file: ${fileId}, confidence: ${confidence}%`);

    return {
      extractedText,
      confidence
    };

  } catch (error) {
    console.error(`OCR processing failed for file ${fileId}:`, error);
    throw error;
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
