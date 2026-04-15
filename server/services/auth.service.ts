import bcrypt from 'bcrypt';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

const SALT_ROUNDS = 10;

export interface RegisterData {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role?: 'student' | 'faculty';
}

export interface LoginData {
    email: string;
    password: string;
}

export class AuthService {
    /**
     * Hash a password using bcrypt
     */
    async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, SALT_ROUNDS);
    }

    /**
     * Verify a password against a hash
     */
    async verifyPassword(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }

    /**
     * Register a new user
     */
    async register(data: RegisterData) {
        const { email, password, firstName, lastName, role } = data;

        // Check if user already exists
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email.toLowerCase()),
        });

        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Hash password
        const passwordHash = await this.hashPassword(password);

        // Create user
        const [newUser] = await db.insert(users).values({
            email: email.toLowerCase(),
            passwordHash,
            firstName: firstName || null,
            lastName: lastName || null,
            role: role || 'student',
        }).returning();

        // Return user without password hash
        const { passwordHash: _, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    }

    /**
     * Login a user
     */
    async login(data: LoginData) {
        const { email, password } = data;

        // Find user by email
        const user = await db.query.users.findFirst({
            where: eq(users.email, email.toLowerCase()),
        });

        if (!user) {
            throw new Error('Invalid email or password');
        }

        // Verify password
        const isValid = await this.verifyPassword(password, user.passwordHash);

        if (!isValid) {
            throw new Error('Invalid email or password');
        }

        // Return user without password hash
        const { passwordHash: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    /**
     * Get user by ID (without password hash)
     */
    async getUserById(userId: string) {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!user) {
            return null;
        }

        const { passwordHash: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}

export const authService = new AuthService();
