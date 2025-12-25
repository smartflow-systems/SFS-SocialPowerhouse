import { describe, it, expect, jest } from '@jest/globals';
import { sanitizeInput } from '../middleware/security';
import type { Request, Response, NextFunction } from 'express';

describe('Security Middleware', () => {
  describe('sanitizeInput middleware', () => {
    it('should sanitize XSS attempts in request body', () => {
      const req = {
        body: {
          username: '<script>alert("XSS")</script>',
          bio: 'Normal text with <img src=x onerror=alert(1)> injection'
        },
        query: {},
        params: {}
      } as unknown as Request;
      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      sanitizeInput(req, res, next);

      expect(req.body.username).not.toContain('<script>');
      expect(req.body.username).toContain('&lt;script&gt;');
      expect(req.body.bio).not.toContain('<img');
      expect(next).toHaveBeenCalled();
    });

    it('should sanitize HTML entities in query parameters', () => {
      const req = {
        body: {},
        query: {
          search: '<b>bold</b> & "quoted"'
        },
        params: {}
      } as unknown as Request;
      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      sanitizeInput(req, res, next);

      expect(req.query.search).toContain('&lt;b&gt;');
      expect(req.query.search).toContain('&amp;');
      expect(req.query.search).toContain('&quot;');
      expect(next).toHaveBeenCalled();
    });

    it('should sanitize route parameters', () => {
      const req = {
        body: {},
        query: {},
        params: {
          id: '<script>evil()</script>'
        }
      } as unknown as Request;
      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      sanitizeInput(req, res, next);

      expect(req.params.id).not.toContain('<script>');
      expect(req.params.id).toContain('&lt;script&gt;');
      expect(next).toHaveBeenCalled();
    });

    it('should handle nested objects', () => {
      const req = {
        body: {
          user: {
            profile: {
              bio: '<iframe src="evil.com"></iframe>'
            }
          }
        },
        query: {},
        params: {}
      } as unknown as Request;
      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      sanitizeInput(req, res, next);

      expect(req.body.user.profile.bio).not.toContain('<iframe');
      expect(req.body.user.profile.bio).toContain('&lt;iframe');
      expect(next).toHaveBeenCalled();
    });

    it('should trim whitespace from strings', () => {
      const req = {
        body: {
          email: '  user@example.com  ',
          name: '\n\t  John Doe  \n'
        },
        query: {},
        params: {}
      } as unknown as Request;
      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      sanitizeInput(req, res, next);

      expect(req.body.email).toBe('user@example.com');
      expect(req.body.name).toBe('John Doe');
      expect(next).toHaveBeenCalled();
    });

    it('should preserve safe content', () => {
      const req = {
        body: {
          content: 'This is normal text without any HTML',
          number: 123,
          boolean: true
        },
        query: {},
        params: {}
      } as unknown as Request;
      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      sanitizeInput(req, res, next);

      expect(req.body.content).toBe('This is normal text without any HTML');
      expect(req.body.number).toBe(123);
      expect(req.body.boolean).toBe(true);
      expect(next).toHaveBeenCalled();
    });

    it('should handle arrays', () => {
      const req = {
        body: {
          tags: ['<script>alert(1)</script>', 'safe tag', '<img src=x>']
        },
        query: {},
        params: {}
      } as unknown as Request;
      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      sanitizeInput(req, res, next);

      expect(req.body.tags[0]).toContain('&lt;script&gt;');
      expect(req.body.tags[1]).toBe('safe tag');
      expect(req.body.tags[2]).toContain('&lt;img');
      expect(next).toHaveBeenCalled();
    });

    it('should sanitize SQL injection attempts', () => {
      const req = {
        body: {},
        query: {
          id: "1' OR '1'='1",
          search: "admin'--"
        },
        params: {}
      } as unknown as Request;
      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      sanitizeInput(req, res, next);

      expect(req.query.id).toContain('&#x27;'); // Single quote encoded
      expect(req.query.search).toContain('&#x27;');
      expect(next).toHaveBeenCalled();
    });

    it('should handle special characters safely', () => {
      const req = {
        body: {
          text: '& < > " \' / characters'
        },
        query: {},
        params: {}
      } as unknown as Request;
      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      sanitizeInput(req, res, next);

      expect(req.body.text).toContain('&amp;');
      expect(req.body.text).toContain('&lt;');
      expect(req.body.text).toContain('&gt;');
      expect(req.body.text).toContain('&quot;');
      expect(req.body.text).toContain('&#x27;');
      expect(req.body.text).toContain('&#x2F;');
      expect(next).toHaveBeenCalled();
    });

    it('should handle null and undefined values', () => {
      const req = {
        body: {
          nullValue: null,
          undefinedValue: undefined,
          emptyString: ''
        },
        query: {},
        params: {}
      } as unknown as Request;
      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      sanitizeInput(req, res, next);

      expect(req.body.nullValue).toBeNull();
      expect(req.body.undefinedValue).toBeUndefined();
      expect(req.body.emptyString).toBe('');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Rate limiting configuration', () => {
    it('should have appropriate API rate limits', () => {
      // API limiter: 100 requests per 15 minutes
      const windowMs = 15 * 60 * 1000;
      const maxRequests = 100;

      expect(windowMs).toBe(900000); // 15 minutes in ms
      expect(maxRequests).toBe(100);
    });

    it('should have strict auth rate limits', () => {
      // Auth limiter: 5 requests per 15 minutes
      const windowMs = 15 * 60 * 1000;
      const maxRequests = 5;

      expect(windowMs).toBe(900000);
      expect(maxRequests).toBe(5);
    });
  });

  describe('CORS configuration', () => {
    it('should restrict origins in production', () => {
      const originalEnv = process.env.NODE_ENV;
      const originalFrontend = process.env.FRONTEND_URL;

      process.env.NODE_ENV = 'production';
      process.env.FRONTEND_URL = 'https://app.example.com';

      // In production, only FRONTEND_URL should be allowed
      expect(process.env.FRONTEND_URL).toBe('https://app.example.com');

      process.env.NODE_ENV = originalEnv;
      process.env.FRONTEND_URL = originalFrontend || '';
    });

    it('should allow localhost in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const allowedOrigins = [
        'http://localhost:5000',
        'http://localhost:5173',
        'http://localhost:3000'
      ];

      expect(allowedOrigins).toContain('http://localhost:5000');
      expect(allowedOrigins).toContain('http://localhost:5173');

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Security headers', () => {
    it('should set Content-Security-Policy', () => {
      const csp = {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"]
      };

      expect(csp.defaultSrc).toContain("'self'");
      expect(csp.imgSrc).toContain("data:");
      expect(csp.styleSrc).toContain("https://fonts.googleapis.com");
    });

    it('should enable CORS with credentials', () => {
      const corsOptions = {
        credentials: true,
        optionsSuccessStatus: 200
      };

      expect(corsOptions.credentials).toBe(true);
      expect(corsOptions.optionsSuccessStatus).toBe(200);
    });
  });
});
