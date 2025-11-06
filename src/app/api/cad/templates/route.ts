import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const modelType = searchParams.get('model_type');

    let query = supabase
      .from('cad_model_templates')
      .select('*')
      .eq('is_public', true)
      .order('usage_count', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    if (modelType) {
      query = query.eq('model_type', modelType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching templates:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ templates: data || [] });
  } catch (error) {
    console.error('Error in GET /api/cad/templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { templateId } = await request.json();

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    // Increment usage count
    const { error } = await supabase.rpc('increment_template_usage', {
      template_id: templateId,
    });

    if (error) {
      // If RPC doesn't exist, fall back to manual update
      await supabase
        .from('cad_model_templates')
        .update({ usage_count: supabase.raw('usage_count + 1') })
        .eq('id', templateId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/cad/templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
