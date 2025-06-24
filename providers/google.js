import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

export default function setupGoogleStrategy(router, passport, baseUrl, config, onSuccess) {
  passport.use(new GoogleStrategy({
    clientID: config.clientId,
    clientSecret: config.clientSecret,
    callbackURL: `${baseUrl}/google/callback`
  }, (accessToken, refreshToken, profile, done) => {
    done(null, profile);
  }));

  router.get('/google', passport.authenticate('google', { scope: config.scopes || ['email'] }));
  router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/auth/failure' }),
    (req, res) => onSuccess ? onSuccess(req, res, req.user) : res.json(req.user)
  );
}