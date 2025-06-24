import AppleStrategy from 'passport-apple';

export default function setupAppleStrategy(router, passport, baseUrl, config, onSuccess) {
  passport.use(new AppleStrategy({
    clientID: config.clientId,
    teamID: config.teamId,
    keyID: config.keyId,
    privateKey: config.privateKey,
    callbackURL: `${baseUrl}/apple/callback`,
    passReqToCallback: true
  }, (req, accessToken, refreshToken, idToken, profile, done) => {
    done(null, profile || idToken);
  }));

  router.get('/apple', passport.authenticate('apple'));
  router.post('/apple/callback',
    passport.authenticate('apple', { failureRedirect: '/auth/failure' }),
    (req, res) => onSuccess ? onSuccess(req, res, req.user) : res.json(req.user)
  );
}