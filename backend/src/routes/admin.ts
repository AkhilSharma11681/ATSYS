import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db';

export const adminRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_change_in_production';
const ADMIN_COOKIE_NAME = 'admin_token';
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Middleware to authenticate admin requests via admin_token cookie.
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies?.[ADMIN_COOKIE_NAME];

  if (!token) {
    res.status(401).json({ error: 'Unauthorized: Admin authentication required.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded || !decoded.admin) {
      res.status(401).json({ error: 'Unauthorized: Invalid admin token.' });
      return;
    }
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Admin token expired or invalid.' });
  }
};

/**
 * POST /admin/login
 * Verifies admin password and sets admin_token cookie.
 */
adminRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error('ADMIN_PASSWORD is not set in environment variables.');
    res.status(500).json({ error: 'Admin configuration error on server.' });
    return;
  }

  if (!password || password !== adminPassword) {
    res.status(401).json({ error: 'Invalid admin password.' });
    return;
  }

  const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '1d' });

  res.cookie(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
  });

  res.json({ message: 'Admin login successful.' });
});

/**
 * POST /admin/logout
 * Clears the admin_token cookie.
 */
adminRouter.post('/logout', (_req: Request, res: Response): void => {
  res.clearCookie(ADMIN_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.json({ message: 'Admin logout successful.' });
});

/**
 * GET /admin/me
 * Simple session check for admin.
 */
adminRouter.get('/me', requireAdmin, (_req: Request, res: Response): void => {
  res.json({ admin: true });
});

/**
 * GET /admin/athletes
 * Returns all athlete profiles (including incomplete ones) joined with user email.
 */
adminRouter.get('/athletes', requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const sql = `
      SELECT
        ap.id,
        ap.user_id,
        u.email,
        ap.name,
        ap.city,
        ap.sport_type,
        ap.upcoming_event,
        ap.event_date,
        ap.instagram_handle,
        ap.available_body_parts,
        ap.photo_url,
        ap.consent_given,
        ap.created_at,
        ap.updated_at
      FROM athlete_profiles ap
      LEFT JOIN users u ON ap.user_id = u.id
      ORDER BY ap.created_at DESC
    `;

    const result = await query(sql);
    res.json({ athletes: result.rows });
  } catch (error) {
    console.error('Error fetching admin athletes:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

/**
 * GET /admin/brands
 * Returns all brand profiles joined with user email.
 */
adminRouter.get('/brands', requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const sql = `
      SELECT
        bp.id,
        bp.user_id,
        u.email,
        bp.company_name,
        bp.website_url,
        bp.category,
        bp.contact_name,
        bp.looking_for,
        bp.created_at,
        bp.updated_at
      FROM brand_profiles bp
      LEFT JOIN users u ON bp.user_id = u.id
      ORDER BY bp.created_at DESC
    `;

    const result = await query(sql);
    res.json({ brands: result.rows });
  } catch (error) {
    console.error('Error fetching admin brands:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

/**
 * GET /admin/contact-requests
 * Returns all contact requests with brand company_name and athlete name.
 */
adminRouter.get('/contact-requests', requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const sql = `
      SELECT
        cr.id,
        cr.brand_id,
        bp.company_name,
        cr.athlete_id,
        ap.name AS athlete_name,
        cr.message,
        cr.created_at
      FROM contact_requests cr
      LEFT JOIN brand_profiles bp ON cr.brand_id = bp.id
      LEFT JOIN athlete_profiles ap ON cr.athlete_id = ap.id
      ORDER BY cr.created_at DESC
    `;

    const result = await query(sql);
    res.json({ contact_requests: result.rows });
  } catch (error) {
    console.error('Error fetching admin contact requests:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});
