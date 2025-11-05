import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development'
);

interface DemoUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  department: string;
  permissions: string[];
}

// Get demo password from environment variable
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'ConstructAI2025!';

const demoUsers: DemoUser[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'admin@constructai.demo',
    password: DEMO_PASSWORD,
    name: 'Alex Morgan',
    role: 'System Administrator',
    department: 'IT Administration',
    permissions: ['full_access', 'system_config', 'user_manage', 'project_create', 'team_manage', 'budget_view']
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'manager@constructai.demo',
    password: DEMO_PASSWORD,
    name: 'Jordan Chen',
    role: 'Project Manager',
    department: 'Project Management',
    permissions: ['project_create', 'team_manage', 'budget_view', 'schedule_edit']
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'architect@constructai.demo',
    password: DEMO_PASSWORD,
    name: 'Taylor Davis',
    role: 'Senior Architect',
    department: 'Design & Architecture',
    permissions: ['design_approve', 'model_edit', 'compliance_check', 'blueprint_upload']
  }
];

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

    // Find user in demo users
    const user = demoUsers.find(u => u.email === email);

    if (!user || user.password !== password) {
      console.log('❌ Invalid credentials for direct login');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('✅ Direct login successful for:', user.email);

    // Create JWT token
    const token = await new SignJWT({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      permissions: user.permissions,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);

    // Set cookie and return user data
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        permissions: user.permissions,
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
