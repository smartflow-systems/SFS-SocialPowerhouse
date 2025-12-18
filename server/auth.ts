import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { type Express } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import createMemoryStore from "memorystore";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import type { User } from "@shared/schema";
import { db } from "@db/drizzle";

const PgStore = connectPgSimple(session);
const MemoryStore = createMemoryStore(session);

export function setupAuth(app: Express) {
  // Determine which session store to use based on environment
  const sessionStore = process.env.NODE_ENV === 'production' || process.env.USE_PG_SESSIONS === 'true'
    ? new PgStore({
        // @ts-ignore - Pool from Neon serverless is compatible
        pool: db,
        tableName: 'session',
        createTableIfMissing: true,
        pruneSessionInterval: 60 * 15, // Prune every 15 minutes
        ttl: 7 * 24 * 60 * 60 // 7 days in seconds
      })
    : new MemoryStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      });

  // Session configuration
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "sfs-powerhouse-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      store: sessionStore,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? 'strict' : 'lax',
      },
    })
  );

  console.log(`Using ${process.env.NODE_ENV === 'production' || process.env.USE_PG_SESSIONS === 'true' ? 'PostgreSQL' : 'Memory'} session store`);

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport local strategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user) {
            return done(null, false, { message: "Invalid email or password" });
          }

          const isValidPassword = await bcrypt.compare(password, user.password);
          if (!isValidPassword) {
            return done(null, false, { message: "Invalid email or password" });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, (user as User).id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}

// Middleware to check if user is authenticated
export function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized", message: "Please log in to access this resource" });
}
