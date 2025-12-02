import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import cookieParser from "cookie-parser";
import { FILE_UPLOAD } from "./constants";

// Import modular routes
import authRoutes from "./routes/auth.routes";
import postsRoutes from "./routes/posts.routes";
import usersRoutes from "./routes/users.routes";
import groupsRoutes from "./routes/groups.routes";
import resourcesRoutes from "./routes/resources.routes";
import notificationsRoutes from "./routes/notifications.routes";

// Import middleware
import { requireAuth } from "./middleware/auth.middleware";
import { errorHandler } from "./middleware/error.middleware";

// Set up multer for local file uploads
const ALLOWED_MIME_TYPES = new Set<string>(FILE_UPLOAD.ALLOWED_TYPES);
const uploadsDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storageConfig = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = randomUUID();
    const ext = file.originalname.split('.').pop();
    cb(null, `${uniqueSuffix}.${ext}`)
  }
});

const upload = multer({
  storage: storageConfig,
  limits: { fileSize: FILE_UPLOAD.MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(cookieParser());

  // Auth routes (public)
  app.use('/api/auth', authRoutes);

  // File Upload Route
  app.post('/api/upload', requireAuth, upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    // Return the URL path to the file
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  });

  // Protected API routes
  app.use('/api/posts', postsRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/groups', groupsRoutes);
  app.use('/api/resources', resourcesRoutes);
  app.use('/api/notifications', notificationsRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Legacy route for backward compatibility (redirect to new route)
  app.get('/api/auth/user', requireAuth, (_req, res) => {
    res.redirect(307, '/api/users/me');
  });

  // Global error handler (must be last)
  app.use(errorHandler);

  const httpServer = createServer(app);
  return httpServer;
}
