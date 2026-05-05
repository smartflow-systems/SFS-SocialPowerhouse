/**
 * SFS Shared Auth Middleware
 *
 * Drop this file into any SFS repo: server/middleware/sfs-auth.ts
 * Requires: npm install jsonwebtoken @types/jsonwebtoken
 * Requires env: SFS_JWT_SECRET (same value as SFS-Backend)
 *
 * Usage:
 *   import { requireSFSAuth, requireRole, requireProduct } from './middleware/sfs-auth'
 *   router.get('/dashboard', requireSFSAuth, requireProduct('social-powerhouse'), handler)
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface SFSTokenPayload {
  userId: string;
  orgId: string;
  email: string;
  role: "owner" | "admin" | "member";
  plan: "free" | "starter" | "pro" | "enterprise";
}

declare global {
  namespace Express {
    interface Request {
      sfsUser?: SFSTokenPayload;
    }
  }
}

const SFS_BACKEND_URL = process.env.SFS_BACKEND_URL || "https://sfs-backend.replit.app";

/**
 * requireSFSAuth — validates a JWT issued by SFS-Backend.
 * Use this instead of the local passport requireAuth when you want
 * cross-product SSO via the central SFS-Backend hub.
 */
export function requireSFSAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const secret = process.env.SFS_JWT_SECRET;
  if (!secret) {
    console.error("SFS_JWT_SECRET env var is missing — cannot validate SFS SSO tokens");
    return res.status(500).json({ error: "Server misconfiguration: missing SFS_JWT_SECRET" });
  }

  try {
    req.sfsUser = jwt.verify(token, secret) as SFSTokenPayload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(...roles: SFSTokenPayload["role"][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.sfsUser || !roles.includes(req.sfsUser.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}

export function requirePlan(...plans: SFSTokenPayload["plan"][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.sfsUser || !plans.includes(req.sfsUser.plan)) {
      return res.status(403).json({ error: "Upgrade required", requiredPlans: plans });
    }
    next();
  };
}

/**
 * requireProduct — verifies the org has an active subscription to a specific SFS product.
 * Makes an outbound call to SFS-Backend. Use sparingly on sensitive routes only.
 */
export function requireProduct(productSlug: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.sfsUser) return res.status(401).json({ error: "Unauthorized" });

    try {
      const token = req.headers.authorization?.split(" ")[1];
      const response = await fetch(`${SFS_BACKEND_URL}/api/products/${productSlug}/access`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json() as { hasAccess: boolean };
      if (!data.hasAccess) return res.status(403).json({ error: "No active subscription to this product" });
      next();
    } catch {
      res.status(503).json({ error: "Could not verify product access" });
    }
  };
}
