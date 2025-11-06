import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders
    })
  }

  try {
    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse the form data
    const formData = await req.formData()
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string
    const category = formData.get('category') as string

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate file size (500MB limit)
    const maxSize = 500 * 1024 * 1024 // 500MB
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ error: 'File too large. Maximum size is 500MB.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Generate unique filename
    const fileId = crypto.randomUUID()
    const fileExtension = getFileExtension(file.name)
    const fileName = `${fileId}${fileExtension}`
    const filePath = `documents/${fileName}`

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return new Response(
        JSON.stringify({ error: 'Failed to upload file' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get the public URL
    const { data: { publicUrl } } = supabaseClient.storage
      .from('documents')
      .getPublicUrl(filePath)

    // Insert document record into database
    const documentData = {
      id: fileId,
      name: file.name,
      type: file.type || getFileTypeFromExtension(file.name),
      status: 'uploaded' as const,
      size: file.size,
      url: publicUrl,
      project_id: projectId || 'default-project',
      uploaded_by: 'demo-user', // In production, get from JWT
      category: category || detectFileCategory(file.name)
    }

    const { data: document, error: dbError } = await supabaseClient
      .from('documents')
      .insert(documentData)
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return new Response(
        JSON.stringify({ error: 'Failed to save document record' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Start OCR processing for supported files (simplified for Edge Function)
    if (isImageFile(file.name) || file.type === 'application/pdf') {
      // In a full implementation, you would queue this for background processing
      await processDocumentOCR(supabaseClient, fileId, publicUrl, file.type)
    } else {
      // Mark as completed for non-OCR files
      await supabaseClient
        .from('documents')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', fileId)
    }

    return new Response(
      JSON.stringify({
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
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Upload error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Helper functions
function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.')
  return lastDot !== -1 ? filename.substring(lastDot) : ''
}

function getFileTypeFromExtension(filename: string): string {
  const ext = getFileExtension(filename).toLowerCase()
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
  }
  return typeMap[ext] || 'application/octet-stream'
}

function isImageFile(filename: string): boolean {
  const ext = getFileExtension(filename).toLowerCase()
  return ['.jpg', '.jpeg', '.png', '.tiff', '.tif'].includes(ext)
}

function detectFileCategory(filename: string): string {
  const ext = getFileExtension(filename).toLowerCase()
  switch (ext.substring(1)) {
    case 'dwg':
    case 'dxf':
      return 'CAD Drawings'
    case 'pdf':
      return 'Documents'
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'tiff':
    case 'tif':
      return 'Images'
    case 'xlsx':
    case 'csv':
      return 'Spreadsheets'
    default:
      return 'Other'
  }
}

async function processDocumentOCR(supabaseClient: any, fileId: string, fileUrl: string, fileType: string) {
  try {
    // Update status to processing
    await supabaseClient
      .from('documents')
      .update({
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', fileId)

    // Simulate OCR processing (in production, you'd use a proper OCR service)
    let extractedText = ''
    let confidence = 0

    if (fileType === 'application/pdf') {
      extractedText = 'PDF text extraction would be implemented with a proper PDF parser service.'
      confidence = 85
    } else {
      extractedText = 'Image OCR processing would be implemented with a proper OCR service like Google Vision API or Tesseract.'
      confidence = 90
    }

    // Update document with OCR results
    await supabaseClient
      .from('documents')
      .update({
        status: 'completed',
        extracted_text: extractedText,
        confidence: confidence,
        updated_at: new Date().toISOString()
      })
      .eq('id', fileId)

  } catch (error) {
    console.error('OCR processing failed:', error)
    // Update document status to error
    await supabaseClient
      .from('documents')
      .update({
        status: 'error',
        updated_at: new Date().toISOString()
      })
      .eq('id', fileId)
  }
}
