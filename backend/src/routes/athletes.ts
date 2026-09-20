import { Router, Request, Response } from 'express';
import { query } from '../db';

export const athletesRouter = Router();

/**
 * Helper to build the base WHERE clause for a complete athlete profile
 */
const getCompleteProfileConditions = () => `
  consent_given = true
  AND name IS NOT NULL AND name != ''
  AND city IS NOT NULL AND city != ''
  AND sport_type IS NOT NULL AND sport_type != ''
  AND upcoming_event IS NOT NULL AND upcoming_event != ''
  AND event_date IS NOT NULL
  AND available_body_parts IS NOT NULL
  AND jsonb_array_length(available_body_parts) > 0
`;

/**
 * GET /athletes
 * Public route to list all "complete" athlete profiles.
 * Supports filters: ?event=, ?city=, ?sport_type=
 */
athletesRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { event, city, sport_type } = req.query;

    let sql = `
      SELECT
        id, name, city, sport_type, upcoming_event, event_date,
        instagram_handle, available_body_parts, photo_url, created_at
      FROM athlete_profiles
      WHERE ${getCompleteProfileConditions()}
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (typeof event === 'string' && event.trim() !== '') {
      sql += ` AND upcoming_event ILIKE '%' || $${paramIndex} || '%'`;
      params.push(event.trim());
      paramIndex++;
    }

    if (typeof city === 'string' && city.trim() !== '') {
      sql += ` AND city ILIKE '%' || $${paramIndex} || '%'`;
      params.push(city.trim());
      paramIndex++;
    }

    if (typeof sport_type === 'string' && sport_type.trim() !== '') {
      sql += ` AND sport_type ILIKE '%' || $${paramIndex} || '%'`;
      params.push(sport_type.trim());
      paramIndex++;
    }

    // Optional: ORDER BY recently updated or created
    sql += ` ORDER BY created_at DESC`;

    const result = await query(sql, params);

    res.json({ athletes: result.rows });
  } catch (error) {
    console.error('Error fetching athletes list:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

/**
 * GET /athletes/:id
 * Public route to get a single full public profile by athlete_profiles.id
 * Returns 404 if incomplete or missing
 */
athletesRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT
        id, name, city, sport_type, upcoming_event, event_date,
        instagram_handle, available_body_parts, photo_url, created_at
      FROM athlete_profiles
      WHERE id = $1 AND ${getCompleteProfileConditions()}
    `;

    const result = await query(sql, [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Athlete profile not found or incomplete.' });
      return;
    }

    res.json({ athlete: result.rows[0] });
  } catch (error: any) {
    // If it's a UUID syntax error, just return 404 cleanly instead of 500
    if (error.code === '22P02') {
      res.status(404).json({ error: 'Athlete profile not found or incomplete.' });
      return;
    }
    console.error('Error fetching single athlete:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});
