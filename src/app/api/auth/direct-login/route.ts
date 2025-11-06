import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { createClient } from '@supabase/supabase-js';

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development'
);

// Initialize Supabase client for server-side authentication
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log('🔐 Direct login attempt for:', email);

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    let emailToUse = email;
    
    // If input doesn't contain @, treat it as a username and convert to email format
    if (!email.includes('@')) {
      emailToUse = `${email}@constructai.local`;
      console.log('🔄 Converting username to email format:', emailToUse);
    }

    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: emailToUse,
      password,
    });

    if (authError || !authData.user) {
      console.log('❌ Invalid credentials for direct login:', authError?.message);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Fetch user profile
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    let profile = profileData;

    if (profileError || !profile) {
      console.log('⚠️ User authenticated but profile not found');
      
      // Create default profile
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email || email,
          name: authData.user.user_metadata?.name || email.split('@')[0],
          role: 'team_member',
          department: 'general',
          permissions: []
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Failed to create user profile:', createError);
        return NextResponse.json(
          { error: 'Failed to create user profile' },
          { status: 500 }
        );
      }

      profile = newProfile;
    }

    console.log('✅ Direct login successful for:', profile.email);

    // Create JWT token
    const token = await new SignJWT({
      sub: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      department: profile.department,
      permissions: profile.permissions || [],
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);

    // Set cookie and return user data
    const response = NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        department: profile.department,
        permissions: profile.permissions || [],
      },
    });

    // Set authentication cookie
    response.cookies.set('direct-auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('🚨 Direct login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
