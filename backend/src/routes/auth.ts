import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getClient, query } from '../db';
import { authenticateToken } from '../middleware/auth';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_change_in_production';
const COOKIE_NAME = 'token';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

// Helper to validate email format
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * POST /auth/signup
 */
authRouter.post('/signup', async (req: Request, res: Response): Promise<void> => {
  const { email, password, role } = req.body;

  // Validation
  if (!email || typeof email !== 'string' || !isValidEmail(email)) {
    res.status(400).json({ error: 'Valid email is required.' });
    return;
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    return;
  }

  if (role !== 'athlete' && role !== 'brand') {
    res.status(400).json({ error: "Role must be either 'athlete' or 'brand'." });
    return;
  }

  const client = await getClient();

  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    await client.query('BEGIN');

    // Insert user
    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, $3)
       RETURNING id, email, role, created_at`,
      [email.toLowerCase().trim(), passwordHash, role]
    );

    const newUser = userResult.rows[0];

    // Insert corresponding profile
    if (role === 'athlete') {
      await client.query(
        `INSERT INTO athlete_profiles (user_id, consent_given)
         VALUES ($1, $2)`,
        [newUser.id, false]
      );
    } else if (role === 'brand') {
      await client.query(
        `INSERT INTO brand_profiles (user_id)
         VALUES ($1)`,
        [newUser.id]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'User registered successfully.',
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        created_at: newUser.created_at
      }
    });
  } catch (error: any) {
    await client.query('ROLLBACK');

    // Postgres unique constraint violation
    if (error.code === '23505') {
      res.status(409).json({ error: 'Email is already registered.' });
      return;
    }

    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error during registration.' });
  } finally {
    client.release();
  }
});

/**
 * POST /auth/login
 */
authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  try {
    const result = await query(
      `SELECT id, email, password_hash, role
       FROM users
       WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // Issue JWT
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    // Set httpOnly cookie
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE
    });

    res.json({
      message: 'Login successful.',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

/**
 * POST /auth/logout
 */
authRouter.post('/logout', (_req: Request, res: Response): void => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  res.json({ message: 'Logout successful.' });
});

/**
 * GET /auth/me (Protected Route)
 */
authRouter.get('/me', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT id, email, role, created_at
       FROM users
       WHERE id = $1`,
      [req.user?.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});
