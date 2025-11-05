import { NextAuthOptions } from 'next-auth';
import { SupabaseAdapter } from '@auth/supabase-adapter';
import { supabaseAdmin } from './supabase';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  // Note: Supabase adapter temporarily disabled due to type conflicts
  // adapter: SupabaseAdapter({
  //   url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  // }),

  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔐 Auth attempt for:', credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing email or password');
          return null;
        }

        try {
          // Demo credentials for platform testing
          // In production, you'd verify against Supabase Auth
          const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'ConstructAI2025!';
          
          const demoUsers = [
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

          const user = demoUsers.find(u => u.email === credentials.email);
          console.log('🔍 User found:', !!user);

          if (user && credentials.password === user.password) {
            console.log('✅ Authentication successful for:', user.email);
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              department: user.department,
              permissions: user.permissions
            };
          }

          console.log('❌ Invalid credentials');
          return null;
        } catch (error) {
          console.error('🚨 Auth error:', error);
          return null;
        }
      }
    })
  ],

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },

  callbacks: {
    async jwt({ token, user }) {
      console.log('🎫 JWT callback - user:', !!user, 'token:', !!token);
      if (user) {
        token.role = user.role;
        token.department = user.department;
        token.permissions = user.permissions;
      }
      return token;
    },

    async session({ session, token }) {
      console.log('📋 Session callback - session:', !!session, 'token:', !!token);
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.department = token.department as string;
        session.user.permissions = token.permissions as string[];
      }
      return session;
    },

    async signIn({ user, account, profile }) {
      console.log('🚪 SignIn callback - user:', !!user, 'account:', account?.provider);
      return true;
    },

    async redirect({ url, baseUrl }) {
      console.log('🔄 Redirect callback - url:', url, 'baseUrl:', baseUrl);
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',

  debug: process.env.NODE_ENV === 'development',

  events: {
    async signIn(message) {
      console.log('🎉 User signed in:', message.user?.email);
    },
    async signOut(message) {
      console.log('👋 User signed out:', message.session?.user?.email);
    },
    async createUser(message) {
      console.log('👤 User created:', message.user.email);
    },
    async session(message) {
      console.log('📋 Session accessed:', message.session?.user?.email);
    },
  },
};

// Helper functions for role-based access control
export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  return userPermissions.includes(requiredPermission);
}

export function hasRole(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole);
}

export function isProjectManager(userRole: string): boolean {
  return userRole === 'Project Manager';
}

export function isArchitect(userRole: string): boolean {
  return userRole.includes('Architect');
}

export function isEngineer(userRole: string): boolean {
  return userRole.includes('Engineer');
}
