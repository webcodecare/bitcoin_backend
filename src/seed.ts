import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config(); // Load .env variables

// Check that JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  throw new Error('❌ JWT_SECRET is not defined in your .env file');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function seedUsers() {
  const users = [
    {
      email: 'superadmin@demo.com',
      password: 'password123',
      role: 'superuser',
      firstName: 'Super',
      lastName: 'Admin',
      subscriptionTier: 'pro',
      subscriptionStatus: 'active',
      subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
    },
    {
      email: 'admin@test.com',
      password: 'admin123',
      role: 'admin',
      firstName: 'Main',
      lastName: 'Admin',
      subscriptionTier: 'premium',
      subscriptionStatus: 'active',
      subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      email: 'user1@test.com',
      password: 'user123',
      role: 'user',
      firstName: 'Regular',
      lastName: 'User',
      subscriptionTier: 'basic',
      subscriptionStatus: 'trialing',
      subscriptionEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
    {
      email: 'user2@test.com',
      password: 'user123',
      role: 'user',
      firstName: 'Trial',
      lastName: 'User',
      subscriptionTier: 'free',
      subscriptionStatus: 'trialing',
      subscriptionEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      email: 'newuser@test.com',
      password: 'newpassword123',
      role: 'user',
      firstName: 'New',
      lastName: 'User',
      subscriptionTier: 'basic',
      subscriptionStatus: 'active',
      subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  ];

  for (const user of users) {
    const hashedPassword = bcrypt.hashSync(user.password, 10); // Hash the password
    
    const result = await pool.query(
      `INSERT INTO users (
        email, hashed_password, role, first_name, last_name, is_active,
        subscription_tier, subscription_status, subscription_ends_at,
        created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, true, $6, $7, $8, NOW(), NOW())
      RETURNING id`, // Returning id to get the auto-generated user id
      [
        user.email,
        hashedPassword,
        user.role ?? "user",
        user.firstName ?? null,
        user.lastName ?? null,
        user.subscriptionTier ?? "free",
        user.subscriptionStatus ?? null,
        user.subscriptionEndsAt ?? null,
      ]
    );

    const newUser = result.rows[0]; // The returned user data from the database

    // ✅ JWT Generation with secret guaranteed to be present
    const token = jwt.sign(
      { userId: newUser.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`✅ User "${user.email}" created with ID: ${newUser.id} and token: ${token}`);
  }

  await pool.end();
  console.log('🎉 All users seeded successfully.');
}

seedUsers().catch((err) => {
  console.error('❌ Error seeding users:', err);
  pool.end();
});
