// index.js
import express from 'express';
import session from 'express-session';
import passport from 'passport';

import setupGoogleStrategy from './providers/google.js';
import setupMetaStrategy from './providers/meta.js';
import setupAppleStrategy from './providers/apple.js';

/**
 * Creates an Express router with OAuth providers configured as middleware.
 *
 * @param {Object} config - Configuration object.
 * @param {string} config.baseUrl - Base URL for OAuth callbacks, e.g. 'https://yourdomain.com/auth'.
 * @param {Object} config.providers - OAuth providers config.
 * @param {Object} [config.providers.google] - Google OAuth config.
 * @param {string} config.providers.google.clientId - Google OAuth Client ID.
 * @param {string} config.providers.google.clientSecret - Google OAuth Client Secret.
 * @param {string[]} [config.providers.google.scopes] - Google OAuth scopes. Default: ['email'].
 * @param {Object} [config.providers.apple] - Apple OAuth config.
 * @param {string} config.providers.apple.clientId - Apple Service ID.
 * @param {string} config.providers.apple.teamId - Apple Team ID.
 * @param {string} config.providers.apple.keyId - Apple Key ID.
 * @param {string} config.providers.apple.privateKey - Apple Private Key (PEM format).
 * @param {Object} [config.providers.meta] - Meta (Facebook) OAuth config.
 * @param {string} config.providers.meta.clientId - Meta App ID.
 * @param {string} config.providers.meta.clientSecret - Meta App Secret.
 * @param {string[]} [config.providers.meta.scopes] - Meta OAuth scopes. Default: ['email'].
 * @param {string[]} [config.filter] - List of providers to enable. Defaults to all keys in `providers`.
 * @param {(req: import('express').Request, res: import('express').Response, user: any) => void} [config.onSuccess] - Callback after successful OAuth login.
 * @param {(req: import('express').Request, res: import('express').Response, error: Error) => void} [config.onFailure] - Callback on OAuth failure.
 *
 * @returns {import('express').Router} Express router configured with OAuth endpoints.
 *
 * @example
 * import express from 'express';
 * import { createOAuthRouter } from '@api-craft/oauth';
 *
 * const app = express();
 * const oauthRouter = createOAuthRouter({
 *   baseUrl: 'https://yourdomain.com/auth',
 *   providers: {
 *     google: {
 *       clientId: process.env.GOOGLE_CLIENT_ID,
 *       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
 *       scopes: ['profile', 'email']
 *     },
 *     apple: {
 *       clientId: process.env.APPLE_CLIENT_ID,
 *       teamId: process.env.APPLE_TEAM_ID,
 *       keyId: process.env.APPLE_KEY_ID,
 *       privateKey: process.env.APPLE_PRIVATE_KEY,
 *     },
 *     meta: {
 *       clientId: process.env.META_CLIENT_ID,
 *       clientSecret: process.env.META_CLIENT_SECRET,
 *       scopes: ['public_profile', 'email']
 *     }
 *   },
 *   filter: ['google', 'meta'],
 *   onSuccess: (req, res, user) => {
 *     // Custom post-login logic (e.g., save user, issue token)
 *     res.json({ user });
 *   },
 *   onFailure: (req, res, error) => {
 *     res.status(401).json({ error: error.message });
 *   }
 * });
 *
 * app.use('/auth', oauthRouter);
 */
export function createOAuthRouter(config) {
  const router = express.Router();
  const { baseUrl, providers = {}, filter = [], onSuccess, onFailure } = config;
  const enabled = filter.length ? filter : Object.keys(providers);

  router.use(session({ secret: 'oauth_secret', resave: false, saveUninitialized: false }));
  router.use(passport.initialize());
  router.use(passport.session());

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  if (enabled.includes('google') && providers.google) {
    setupGoogleStrategy(router, passport, baseUrl, providers.google, onSuccess);
  }

  if (enabled.includes('meta') && providers.meta) {
    setupMetaStrategy(router, passport, baseUrl, providers.meta, onSuccess);
  }

  if (enabled.includes('apple') && providers.apple) {
    setupAppleStrategy(router, passport, baseUrl, providers.apple, onSuccess);
  }

  // Failure route
  router.get('/failure', (req, res) => {
    if (onFailure) return onFailure(req, res, new Error('Authentication Failed'));
    res.status(401).json({ error: 'Authentication Failed' });
  });

  return router;
}