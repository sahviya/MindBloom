import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { OAuth2Client } from "google-auth-library";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : undefined;

export async function register(req: Request, res: Response) {
  try {
    const { email: rawEmail, password, name } = req.body as { email?: string; password?: string; name?: string };
    if (!rawEmail || !password) return res.status(400).json({ error: "Missing email or password" });
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    const email = String(rawEmail).trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "User already exists" });
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, password: hash, name } });
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
    return res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}

/**
 * Register or set password for an existing Google-created account.
 * - If user not found: create it (normal register).
 * - If user found with empty password: set provided password and log in.
 * - If user found with password: 409 conflict.
 */
export async function registerOrSet(req: Request, res: Response) {
  try {
    const { email: rawEmail, password, name } = req.body as { email?: string; password?: string; name?: string };
    if (!rawEmail || !password) return res.status(400).json({ error: "Missing email or password" });
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    const email = String(rawEmail).trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    const hash = await bcrypt.hash(password, 10);
    if (!existing) {
      const user = await prisma.user.create({ data: { email, password: hash, name } });
      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    }
    if (!existing.password || existing.password.length === 0) {
      const user = await prisma.user.update({ where: { id: existing.id }, data: { password: hash } });
      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    }
    return res.status(409).json({ error: 'User already exists' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}

/**
 * Allow an authenticated user to set or change their password so that
 * manual email/password sign-in works even if the account was created via Google.
 */
export async function setPassword(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string | undefined;
    const { password } = (req.body || {}) as { password?: string };
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.update({ where: { id: userId }, data: { password: hash } });
    return res.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update password" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email: rawEmail, password } = req.body;
    if (!rawEmail || !password) return res.status(400).json({ error: "Missing email or password" });
    const email = String(rawEmail).trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    if (!user.password || user.password.length === 0) {
      return res.status(401).json({ error: "Password not set" });
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
    return res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Missing Authorization header" });
  const parts = header.split(" ");
  const token = parts.length === 2 ? parts[1] : parts[0];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    (req as any).userId = payload.id;
    return next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export async function googleLogin(req: Request, res: Response) {
  try {
    if (!googleClient) {
      return res.status(500).json({ error: "Google client not configured" });
    }

    const { idToken } = req.body as { idToken?: string };
    if (!idToken) return res.status(400).json({ error: "Missing idToken" });

    const ticket = await googleClient.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      console.error("Google payload missing email", payload);
      return res.status(401).json({ error: "Invalid Google token" });
    }

    const email = payload.email;
    const name = payload.name || payload.given_name || null;
    const picture = payload.picture || null;

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({ data: { email, password: "", name, profileImageUrl: picture || undefined } });
    } else if (!user.profileImageUrl && picture) {
      await prisma.user.update({ where: { id: user.id }, data: { profileImageUrl: picture } });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
    return res.json({ token, user: { id: user.id, email: user.email, name: user.name, profileImageUrl: user.profileImageUrl } });
  } catch (err) {
    console.error("Google auth error:", err);
    return res.status(500).json({ error: "Google auth failed" });
  }
}



