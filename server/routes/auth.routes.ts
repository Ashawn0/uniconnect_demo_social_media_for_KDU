import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authService } from '../services/auth.service';
import { AUTH } from '../constants';
import { z } from 'zod';

const router = Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: AUTH.RATE_LIMIT_WINDOW,
  max: AUTH.RATE_LIMIT_MAX,
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schemas
const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
});

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

// Extend session type
declare module 'express-session' {
    interface SessionData {
        userId: string;
    }
}

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', authLimiter, async (req, res) => {
    try {
        const validatedData = registerSchema.parse(req.body);

        const user = await authService.register(validatedData);

        // Create session
        req.session.userId = user.id;

        res.status(201).json(user);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: 'Validation error',
                errors: error.errors
            });
        }

        if (error.message === 'User with this email already exists') {
            return res.status(409).json({ message: error.message });
        }

        console.error('Error in register:', error);
        res.status(500).json({ message: 'Failed to register user' });
    }
});

/**
 * POST /api/auth/login
 * Login a user
 */
router.post('/login', authLimiter, async (req, res) => {
    try {
        const validatedData = loginSchema.parse(req.body);

        const user = await authService.login(validatedData);

        // Create session
        req.session.userId = user.id;

        res.json(user);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: 'Validation error',
                errors: error.errors
            });
        }

        if (error.message === 'Invalid email or password') {
            return res.status(401).json({ message: error.message });
        }

        console.error('Error in login:', error);
        res.status(500).json({ message: 'Failed to login' });
    }
});

/**
 * POST /api/auth/logout
 * Logout current user
 */
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ message: 'Failed to logout' });
        }

        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
    });
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', async (req, res) => {
    try {
        if (!req.session || !req.session.userId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const user = await authService.getUserById(req.session.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching current user:', error);
        res.status(500).json({ message: 'Failed to fetch user' });
    }
});

export default router;
