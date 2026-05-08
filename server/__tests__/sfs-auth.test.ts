/**
 * Tests for server/middleware/sfs-auth.ts
 * Covers: requireSFSAuth, requireRole, requirePlan
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Set secret before importing module
process.env.SFS_JWT_SECRET = "test-secret-key";

import {
  requireSFSAuth,
  requireRole,
  requirePlan,
  SFSTokenPayload,
} from "../middleware/sfs-auth";

const SECRET = "test-secret-key";

function makePayload(overrides: Partial<SFSTokenPayload> = {}): SFSTokenPayload {
  return {
    userId: "user-1",
    orgId: "org-1",
    email: "test@example.com",
    role: "member",
    plan: "starter",
    ...overrides,
  };
}

function makeToken(payload: object = makePayload(), secret = SECRET): string {
  return jwt.sign(payload, secret);
}

function makeMocks() {
  const req: Partial<Request> = {
    headers: {},
  };
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next: NextFunction = jest.fn();
  return { req: req as Request, res: res as Response, next };
}

describe("requireSFSAuth", () => {
  it("returns 401 when no Authorization header", () => {
    const { req, res, next } = makeMocks();
    requireSFSAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 for a malformed token", () => {
    const { req, res, next } = makeMocks();
    req.headers = { authorization: "Bearer not.a.valid.token" };
    requireSFSAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 for a token signed with the wrong secret", () => {
    const { req, res, next } = makeMocks();
    const token = makeToken(makePayload(), "wrong-secret");
    req.headers = { authorization: `Bearer ${token}` };
    requireSFSAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next() and attaches sfsUser for a valid token", () => {
    const { req, res, next } = makeMocks();
    const payload = makePayload({ role: "admin", plan: "pro" });
    const token = makeToken(payload);
    req.headers = { authorization: `Bearer ${token}` };
    requireSFSAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect((req as any).sfsUser).toMatchObject({ userId: "user-1", role: "admin" });
  });

  it("returns 500 when SFS_JWT_SECRET is missing", () => {
    const original = process.env.SFS_JWT_SECRET;
    delete process.env.SFS_JWT_SECRET;

    const { req, res, next } = makeMocks();
    const token = makeToken();
    req.headers = { authorization: `Bearer ${token}` };
    requireSFSAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);

    process.env.SFS_JWT_SECRET = original;
  });
});

describe("requireRole", () => {
  it("returns 403 if req.sfsUser is missing", () => {
    const { req, res, next } = makeMocks();
    const middleware = requireRole("admin");
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 403 if user role is not in the allowed list", () => {
    const { req, res, next } = makeMocks();
    (req as any).sfsUser = makePayload({ role: "member" });
    const middleware = requireRole("admin", "owner");
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("calls next() if user role matches", () => {
    const { req, res, next } = makeMocks();
    (req as any).sfsUser = makePayload({ role: "owner" });
    const middleware = requireRole("admin", "owner");
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe("requirePlan", () => {
  it("returns 403 if req.sfsUser is missing", () => {
    const { req, res, next } = makeMocks();
    const middleware = requirePlan("pro");
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("returns 403 if user plan is not in the allowed list", () => {
    const { req, res, next } = makeMocks();
    (req as any).sfsUser = makePayload({ plan: "free" });
    const middleware = requirePlan("pro", "enterprise");
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect((res.json as jest.Mock).mock.calls[0][0]).toMatchObject({ requiredPlans: ["pro", "enterprise"] });
  });

  it("calls next() if user plan matches", () => {
    const { req, res, next } = makeMocks();
    (req as any).sfsUser = makePayload({ plan: "enterprise" });
    const middleware = requirePlan("pro", "enterprise");
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
