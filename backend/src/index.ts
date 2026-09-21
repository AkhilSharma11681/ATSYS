import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { authRouter } from './routes/auth';
import { athleteProfileRouter } from './routes/athleteProfile';
import { brandProfileRouter } from './routes/brandProfile';
import { athletesRouter } from './routes/athletes';
import { contactRequestsRouter } from './routes/contactRequests';
import { adminRouter } from './routes/admin';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
const port = process.env.PORT || 4000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/auth', authRouter);
app.use('/admin', adminRouter);
app.use('/athletes', athletesRouter);
app.use('/athlete-profile', athleteProfileRouter);
app.use('/brand-profile', brandProfileRouter);
app.use('/contact-requests', contactRequestsRouter);

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (_req, res) => {
  res.json({
    message: 'Hello World from Athlete Advertising Marketplace API (Lean v1)'
  });
});

app.listen(port, () => {
  console.log(`Backend API running on http://localhost:${port}`);
});
