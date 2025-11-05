import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  console.log('👤 Creating admin user...\n');

  const adminEmail = 'admin@constructai.local'; // Using email format for Supabase Auth
  const adminPassword = 'admin123';

  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        name: 'Admin User',
        username: 'admin'
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('⚠️  Admin user already exists');
        
        // Get existing user and update password
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        const existingUser = users?.find(u => u.email === adminEmail);
        
        if (existingUser) {
          // Update password
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            { password: adminPassword }
          );

          if (updateError) {
            console.log(`❌ Failed to update password: ${updateError.message}`);
          } else {
            console.log('✓ Password updated for existing admin user');
          }

          // Update profile
          const { error: profileError } = await supabase
            .from('users')
            .upsert({
              id: existingUser.id,
              email: adminEmail,
              name: 'Admin User',
              role: 'System Administrator',
              department: 'IT Administration',
              location: 'System',
              permissions: ['full_access', 'system_config', 'user_manage', 'project_create', 'team_manage', 'budget_view']
            });

          if (profileError) {
            console.log(`⚠️  Profile update failed: ${profileError.message}`);
          } else {
            console.log('✓ Profile updated');
          }
        }
      } else {
        console.log(`❌ Auth error: ${authError.message}`);
        process.exit(1);
      }
    } else {
      console.log('✓ Auth user created');

      // Create user profile in users table
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: adminEmail,
          name: 'Admin User',
          role: 'System Administrator',
          department: 'IT Administration',
          location: 'System',
          permissions: ['full_access', 'system_config', 'user_manage', 'project_create', 'team_manage', 'budget_view']
        });

      if (profileError) {
        console.log(`⚠️  Profile creation failed: ${profileError.message}`);
      } else {
        console.log('✓ Profile created');
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ Admin User Credentials');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✓ Admin user is ready! You can now sign in.');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

createAdminUser();
