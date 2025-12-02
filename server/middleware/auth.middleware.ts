import { Request, Response, NextFunction } from 'express';

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

/**
 * Middleware that requires authentication
 * Returns 401 if user is not authenticated
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    req.userId = req.session.userId;
    next();
}

/**
 * Middleware that optionally attaches user if authenticated
 * Does not block request if user is not authenticated
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
    if (req.session && req.session.userId) {
        req.userId = req.session.userId;
    }
    next();
}
