/**
 * Rate limiters
 * --------------
 * Centralised express-rate-limit configurations. Wire each one to the
 * specific route(s) where it makes sense rather than applying globally,
 * so admin tools and authenticated reads aren't accidentally throttled.
 *
 * Run `npm install` after pulling this file in for the first time so
 * express-rate-limit is added.
 */
const rateLimit = require('express-rate-limit');

// Tight limiter: login / password attempts. Discourages brute-force.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,           // 15 minutes
  max: 10,                            // 10 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many login attempts. Please try again in 15 minutes.'
  }
});

// Looser limiter: registration. Real users register once.
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,           // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many registration attempts. Please try again later.'
  }
});

// Public form limiter: tutor request form is unauthenticated, so it's
// the prime target for spam. Stricter caps with a short window.
const publicFormLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,           // 10 minutes
  max: 5,                             // 5 submissions per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many submissions from this IP. Please try again shortly.'
  }
});

// General search limiter: prevents abusive scraping of the tutor list
// while still allowing legitimate "type-as-you-search" UX.
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,                // 1 minute
  max: 60,                            // 60 requests / minute / IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many search requests. Please slow down.'
  }
});

module.exports = {
  authLimiter,
  registerLimiter,
  publicFormLimiter,
  searchLimiter
};
