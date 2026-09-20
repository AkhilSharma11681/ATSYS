import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { query } from '../db';

export const contactRequestsRouter = Router();

/**
 * Middleware to enforce 'brand' role
 */
const requireBrandRole = (req: Request, res: Response, next: Function) => {
  if (req.user?.role !== 'brand') {
    return res.status(403).json({ error: 'Forbidden: Access restricted to brands only.' });
  }
  next();
};

/**
 * POST /contact-requests
 * Sends a message from the authenticated brand to a specific athlete.
 */
contactRequestsRouter.post(
  '/',
  authenticateToken,
  requireBrandRole,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { athlete_id, message } = req.body;

      // Validate inputs
      if (!athlete_id || typeof athlete_id !== 'string') {
        res.status(400).json({ error: 'Valid athlete_id is required.' });
        return;
      }

      if (!message || typeof message !== 'string' || !message.trim()) {
        res.status(400).json({ error: 'Message cannot be empty.' });
        return;
      }

      // Check if brand profile is complete
      const brandRes = await query(
        `SELECT id, company_name, category, contact_name
         FROM brand_profiles
         WHERE user_id = $1`,
        [userId]
      );

      if (brandRes.rows.length === 0) {
        res.status(400).json({
          error: 'Brand profile must be completed first.',
          code: 'INCOMPLETE_BRAND_PROFILE'
        });
        return;
      }

      const brandProfile = brandRes.rows[0];
      if (!brandProfile.company_name || !brandProfile.category || !brandProfile.contact_name) {
        res.status(400).json({
          error: 'Brand profile must be completed first.',
          code: 'INCOMPLETE_BRAND_PROFILE'
        });
        return;
      }

      const brandId = brandProfile.id;

      // Validate athlete profile is complete & consented
      const athleteQuery = `
        SELECT id FROM athlete_profiles
        WHERE id = $1
          AND consent_given = true
          AND name IS NOT NULL AND name != ''
          AND city IS NOT NULL AND city != ''
          AND sport_type IS NOT NULL AND sport_type != ''
          AND upcoming_event IS NOT NULL AND upcoming_event != ''
          AND event_date IS NOT NULL
          AND available_body_parts IS NOT NULL
          AND jsonb_array_length(available_body_parts) > 0
      `;

      try {
        const athleteRes = await query(athleteQuery, [athlete_id]);

        if (athleteRes.rows.length === 0) {
          res.status(404).json({ error: 'Athlete profile not found or is incomplete.' });
          return;
        }
      } catch (err: any) {
        // Handle malformed UUID error for athlete_id safely
        if (err.code === '22P02') {
          res.status(404).json({ error: 'Athlete profile not found or is incomplete.' });
          return;
        }
        throw err;
      }

      // Insert into contact_requests
      const insertRes = await query(
        `INSERT INTO contact_requests (brand_id, athlete_id, message)
         VALUES ($1, $2, $3)
         RETURNING id, brand_id, athlete_id, message, created_at`,
        [brandId, athlete_id, message.trim()]
      );

      res.status(201).json({
        message: 'Contact request sent successfully.',
        contact_request: insertRes.rows[0]
      });
    } catch (error) {
      console.error('Error in POST /contact-requests:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
);
