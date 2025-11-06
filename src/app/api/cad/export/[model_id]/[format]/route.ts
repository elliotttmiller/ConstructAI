import { NextRequest, NextResponse } from 'next/server';

const CAD_SERVICE_URL = process.env.CAD_SERVICE_URL || 'http://localhost:8001';

export async function GET(
  request: NextRequest,
  { params }: { params: { model_id: string; format: string } }
) {
  try {
    const { model_id, format } = params;
    
    const response = await fetch(
      `${CAD_SERVICE_URL}/api/cad/export/${model_id}/${format}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Model file not found' },
        { status: 404 }
      );
    }

    const blob = await response.blob();
    const headers = new Headers();
    headers.set('Content-Type', response.headers.get('Content-Type') || 'application/octet-stream');
    headers.set('Content-Disposition', `attachment; filename="${model_id}.${format}"`);

    return new NextResponse(blob, { headers });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export model' },
      { status: 500 }
    );
  }
}
