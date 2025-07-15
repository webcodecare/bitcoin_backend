import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken'; // Import the jsonwebtoken library

dotenv.config();

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
      subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
    },
    {
      email: 'user1@test.com',
      password: 'user123',
      role: 'user',
      firstName: 'Regular',
      lastName: 'User',
      subscriptionTier: 'basic',
      subscriptionStatus: 'trialing',
      subscriptionEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7-day trial
    },
    {
      email: 'user2@test.com',
      password: 'user123',
      role: 'user',
      firstName: 'Trial',
      lastName: 'User',
      subscriptionTier: 'free',
      subscriptionStatus: 'trialing',
      subscriptionEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7-day trial
    },
    // New user example
    {
      email: 'newuser@test.com',
      password: 'newpassword123',
      role: 'user',
      firstName: 'New',
      lastName: 'User',
      subscriptionTier: 'basic',
      subscriptionStatus: 'active',
      subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
    },
  ];

  for (const user of users) {
    const hashedPassword = bcrypt.hashSync(user.password, 10);
    const result = await pool.query(
      `INSERT INTO users (
        email, hashed_password, role, first_name, last_name, is_active,
        subscription_tier, subscription_status, subscription_ends_at,
        created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, true, $6, $7, $8, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE
      SET 
        hashed_password = EXCLUDED.hashed_password,
        subscription_tier = EXCLUDED.subscription_tier,
        subscription_status = EXCLUDED.subscription_status,
        subscription_ends_at = EXCLUDED.subscription_ends_at,
        updated_at = NOW() RETURNING id`,
      [
        user.email,
        hashedPassword,
        user.role,
        user.firstName,
        user.lastName,
        user.subscriptionTier,
        user.subscriptionStatus,
        user.subscriptionEndsAt,
      ]
    );

    const newUser = result.rows[0];  // Retrieve the inserted or updated user ID

    // Generate JWT Token
    const token = jwt.sign(
      { userId: newUser.id, email: user.email, role: user.role },
      process.env.JWT_SECRET, // Ensure this is in your .env file
      { expiresIn: '7d' } // Token expiration
    );

    console.log(`✅ User "${user.email}" created with token: ${token}`);
  }

  await pool.end();
  console.log("🎉 All users seeded.");
}

seedUsers().catch((err) => {
  console.error("❌ Error seeding users:", err);
  pool.end();
});
