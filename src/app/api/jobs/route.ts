import { NextRequest, NextResponse } from 'next/server';
import { jobQueue, JobStatus, JobType } from '@/lib/job-queue';
import { getUserIdFromSession } from '@/lib/supabase';

// GET /api/jobs - List all jobs
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as JobStatus | null;
    const type = searchParams.get('type') as JobType | null;

    const jobs = jobQueue.getJobs({ 
      ...(status && { status }), 
      ...(type && { type }) 
    });
    const stats = jobQueue.getStats();

    return NextResponse.json({ jobs, stats });
  } catch (error) {
    console.error('Error listing jobs:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
