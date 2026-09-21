import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { query } from '../db';
import multer from 'multer';
import cloudinary from '../config/cloudinary';

export const athleteProfileRouter = Router();

// Configure multer to use memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (_req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG and PNG are allowed.'));
    }
  }
});

// Middleware to enforce 'athlete' role
const requireAthleteRole = (req: Request, res: Response, next: Function) => {
  if (req.user?.role !== 'athlete') {
    return res.status(403).json({ error: 'Forbidden: Access restricted to athletes only.' });
  }
  next();
};

/**
 * GET /athlete-profile/me
 * Returns the current user's athlete_profiles row.
 */
athleteProfileRouter.get('/me', authenticateToken, requireAthleteRole, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const result = await query(
      `SELECT * FROM athlete_profiles WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Athlete profile not found.' });
      return;
    }

    res.json({ profile: result.rows[0] });
  } catch (error) {
    console.error('Error fetching athlete profile:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

/**
 * PUT /athlete-profile/me
 * Creates/updates profile fields for the logged-in athlete.
 */
athleteProfileRouter.put('/me', authenticateToken, requireAthleteRole, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    // Destructure required fields per milestone rules
    const {
      name,
      city,
      sport_type,
      upcoming_event,
      event_date,
      instagram_handle,
      available_body_parts, // expected to be an array of objects [{ part: string, price: number }]
      photo_url,
      consent_given
    } = req.body;

    // We allow partial updates ONLY IF consent_given is false.
    // If they want to set consent_given = true (or it's already true), all required fields must be present.

    const isTryingToComplete = consent_given === true;

    if (isTryingToComplete) {
      // Validate all required fields
      const missing = [];
      if (!name) missing.push('name');
      if (!city) missing.push('city');
      if (!sport_type) missing.push('sport_type');
      if (!upcoming_event) missing.push('upcoming_event');
      if (!event_date) missing.push('event_date');
      if (!available_body_parts || !Array.isArray(available_body_parts) || available_body_parts.length === 0) {
        missing.push('available_body_parts');
      }

      if (missing.length > 0) {
        res.status(400).json({
          error: `Cannot mark profile complete. Missing required fields: ${missing.join(', ')}`
        });
        return;
      }
    }

    // Do the update
    const result = await query(
      `UPDATE athlete_profiles
       SET
         name = COALESCE($1, name),
         city = COALESCE($2, city),
         sport_type = COALESCE($3, sport_type),
         upcoming_event = COALESCE($4, upcoming_event),
         event_date = COALESCE($5, event_date),
         instagram_handle = COALESCE($6, instagram_handle),
         available_body_parts = COALESCE($7, available_body_parts),
         photo_url = COALESCE($8, photo_url),
         consent_given = COALESCE($9, consent_given),
         updated_at = NOW()
       WHERE user_id = $10
       RETURNING *`,
       [
         name || null,
         city || null,
         sport_type || null,
         upcoming_event || null,
         event_date || null,
         instagram_handle || null,
         available_body_parts ? JSON.stringify(available_body_parts) : null,
         photo_url || null,
         consent_given !== undefined ? consent_given : null,
         userId
       ]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Athlete profile not found for this user.' });
      return;
    }

    res.json({ message: 'Profile updated successfully', profile: result.rows[0] });

  } catch (error) {
    console.error('Error updating athlete profile:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

/**
 * POST /athlete-profile/photo
 * Uploads an image, overriding the previous image if desired.
 */
athleteProfileRouter.post('/photo', authenticateToken, requireAthleteRole, (req: Request, res: Response) => {
  upload.single('photo')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    try {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'athlete-marketplace/photos',
          public_id: `${req.user?.id}-${Date.now()}`,
          allowed_formats: ['jpg', 'png', 'jpeg'],
          format: req.file.mimetype === 'image/png' ? 'png' : 'jpg'
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return res.status(500).json({ error: 'Failed to upload photo to Cloudinary.' });
          }
          if (!result) {
            return res.status(500).json({ error: 'Failed to upload photo to Cloudinary (no result).' });
          }

          return res.json({
            message: 'Photo uploaded successfully.',
            photo_url: result.secure_url
          });
        }
      );

      stream.end(req.file.buffer);
    } catch (processError) {
      console.error('Photo processing error:', processError);
      return res.status(500).json({ error: 'Failed to process photo.' });
    }
  });
});
