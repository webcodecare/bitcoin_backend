import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

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
  ];

  for (const user of users) {
    const hashed = bcrypt.hashSync(user.password, 10);
    await pool.query(
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
        subscription_ends_at = EXCLUDED.subscription_ends_at`,
      [
        user.email,
        hashed,
        user.role,
        user.firstName,
        user.lastName,
        user.subscriptionTier,
        user.subscriptionStatus,
        user.subscriptionEndsAt,
      ]
    );
    console.log(`✅ User "${user.email}" inserted or updated.`);
  }

  await pool.end();
  console.log("🎉 All users seeded.");
}

seedUsers().catch((err) => {
  console.error("❌ Error seeding users:", err);
  pool.end();
});


