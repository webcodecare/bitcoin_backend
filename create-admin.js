import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

async function createAdmin() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('Creating admin user...');
    
    // Generate proper bcrypt hash for password123
    const hashedPassword = await bcrypt.hash('password123', 12);
    console.log('Password hash generated:', hashedPassword);
    
    // Check if admin user already exists
    const existingUser = await sql`
      SELECT id, email FROM users WHERE email = 'admin@proudprofits.com'
    `;
    
    if (existingUser.length > 0) {
      console.log('Admin user already exists, updating password...');
      await sql`
        UPDATE users 
        SET hashed_password = ${hashedPassword},
            role = 'admin',
            subscription_tier = 'pro',
            subscription_status = 'active',
            is_active = true,
            updated_at = NOW()
        WHERE email = 'admin@proudprofits.com'
      `;
      console.log('✅ Admin user updated successfully');
    } else {
      console.log('Creating new admin user...');
      const result = await sql`
        INSERT INTO users (
          email, first_name, last_name, hashed_password, 
          role, subscription_tier, subscription_status, is_active,
          created_at, updated_at
        ) VALUES (
          'admin@proudprofits.com', 'Admin', 'User', ${hashedPassword},
          'admin', 'pro', 'active', true,
          NOW(), NOW()
        )
        RETURNING id
      `;
      console.log('Generated admin ID:', result[0].id);
      console.log('✅ Admin user created successfully');
    }
    
    // Verify the user was created/updated
    const verifyUser = await sql`
      SELECT id, email, role, subscription_tier, is_active 
      FROM users WHERE email = 'admin@proudprofits.com'
    `;
    
    console.log('Admin user details:', verifyUser[0]);
    console.log('\n🎉 Admin login credentials:');
    console.log('Email: admin@proudprofits.com');
    console.log('Password: password123');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdmin();