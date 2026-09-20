import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { query } from '../db';

export const brandProfileRouter = Router();

// Middleware to enforce 'brand' role
const requireBrandRole = (req: Request, res: Response, next: Function) => {
  if (req.user?.role !== 'brand') {
    return res.status(403).json({ error: 'Forbidden: Access restricted to brands only.' });
  }
  next();
};

/**
 * GET /brand-profile/me
 * Returns the current user's brand_profiles row.
 */
brandProfileRouter.get('/me', authenticateToken, requireBrandRole, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const result = await query(
      `SELECT * FROM brand_profiles WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Brand profile not found.' });
      return;
    }

    res.json({ profile: result.rows[0] });
  } catch (error) {
    console.error('Error fetching brand profile:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

/**
 * PUT /brand-profile/me
 * Creates/updates the fields for the logged-in brand.
 */
brandProfileRouter.put('/me', authenticateToken, requireBrandRole, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { company_name, website_url, category, contact_name, looking_for } = req.body;

    // Validate required fields
    const missing = [];
    if (!company_name || typeof company_name !== 'string' || !company_name.trim()) {
      missing.push('company_name');
    }
    if (!category || typeof category !== 'string' || !category.trim()) {
      missing.push('category');
    }
    if (!contact_name || typeof contact_name !== 'string' || !contact_name.trim()) {
      missing.push('contact_name');
    }

    if (missing.length > 0) {
      res.status(400).json({
        error: `Missing or invalid required fields: ${missing.join(', ')}`
      });
      return;
    }

    const result = await query(
      `UPDATE brand_profiles
       SET
         company_name = $1,
         website_url = $2,
         category = $3,
         contact_name = $4,
         looking_for = $5,
         updated_at = NOW()
       WHERE user_id = $6
       RETURNING *`,
      [
        company_name.trim(),
        website_url ? website_url.trim() : null,
        category.trim(),
        contact_name.trim(),
        looking_for ? looking_for.trim() : null,
        userId
      ]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Brand profile not found for this user.' });
      return;
    }

    res.json({
      message: 'Brand profile updated successfully.',
      profile: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating brand profile:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});
