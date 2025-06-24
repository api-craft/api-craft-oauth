import { Strategy as FacebookStrategy } from 'passport-facebook';

export default function setupMetaStrategy(router, passport, baseUrl, config, onSuccess) {
  passport.use(new FacebookStrategy({
    clientID: config.clientId,
    clientSecret: config.clientSecret,
    callbackURL: `${baseUrl}/meta/callback`,
    profileFields: ['id', 'emails', 'name']
  }, (accessToken, refreshToken, profile, done) => {
    done(null, profile);
  }));

  router.get('/meta', passport.authenticate('facebook', { scope: config.scopes || ['email'] }));
  router.get('/meta/callback',
    passport.authenticate('facebook', { failureRedirect: '/auth/failure' }),
    (req, res) => onSuccess ? onSuccess(req, res, req.user) : res.json(req.user)
  );
}