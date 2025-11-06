import { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth/next';
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
          let emailToUse = credentials.email;
          
          // If input doesn't contain @, treat it as a username and convert to email format
          if (!credentials.email.includes('@')) {
            emailToUse = `${credentials.email}@constructai.local`;
            console.log('🔄 Converting username to email format:', emailToUse);
          }

          // Authenticate against Supabase Auth
          const { data, error } = await supabaseAdmin.auth.signInWithPassword({
            email: emailToUse,
            password: credentials.password,
          });

          if (error) {
            console.log('❌ Supabase auth error:', error.message);
            return null;
          }

          if (!data.user) {
            console.log('❌ No user returned from Supabase');
            return null;
          }

          // Fetch user profile from database
          const { data: profile, error: profileError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profileError || !profile) {
            console.log('⚠️ User authenticated but profile not found, creating default profile');
            
            // Create a default profile for the user
            const { data: newProfile, error: createError } = await supabaseAdmin
              .from('users')
              .insert({
                id: data.user.id,
                email: data.user.email || credentials.email,
                name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
                role: 'team_member',
                department: 'general',
                permissions: []
              })
              .select()
              .single();

            if (createError) {
              console.error('❌ Failed to create user profile:', createError);
              return null;
            }

            console.log('✅ Authentication successful for:', data.user.email);
            return {
              id: newProfile.id,
              email: newProfile.email,
              name: newProfile.name,
              role: newProfile.role,
              department: newProfile.department,
              permissions: newProfile.permissions || []
            };
          }

          console.log('✅ Authentication successful for:', profile.email);
          return {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            role: profile.role,
            department: profile.department,
            permissions: profile.permissions || []
          };
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
      if (user) {
        token.role = user.role;
        token.department = user.department;
        token.permissions = user.permissions;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.department = token.department as string;
        session.user.permissions = token.permissions as string[];
      }
      return session;
    },

    async signIn({ user, account, profile }) {
      return true;
    },

    async redirect({ url, baseUrl }) {
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

  // Events disabled to prevent excessive logging and re-renders
  // events: {
  //   async signIn(message) {
  //     console.log('🎉 User signed in:', message.user?.email);
  //   },
  //   async signOut(message) {
  //     console.log('👋 User signed out:', message.session?.user?.email);
  //   },
  //   async createUser(message) {
  //     console.log('👤 User created:', message.user.email);
  //   },
  //   async session(message) {
  //     console.log('📋 Session accessed:', message.session?.user?.email);
  //   },
  // },
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

// Helper to get session in API routes
export async function getSession() {
  return await getServerSession(authOptions);
}
