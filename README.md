# @api-craft/oauth

Express middleware plugin to easily integrate OAuth login with Google, Apple, and Meta (Facebook & Instagram).  
Automatically exposes OAuth routes and callback URLs with a configurable filter for selected providers.

---

## Features

- Plug-and-play OAuth login for **Google**, **Apple**, and **Meta (Facebook + Instagram)**
- Auto-registers all necessary routes:
  - `/auth/google`, `/auth/google/callback`
  - `/auth/apple`, `/auth/apple/callback`
  - `/auth/meta`, `/auth/meta/callback`
- Filter to enable only needed providers
- Hooks to run custom logic after login success or failure
- Built on **passport.js** for extensibility and stability
- Session support included via `express-session`

---

## Installation

```bash
npm install @api-craft/oauth passport passport-google-oauth20 passport-facebook passport-apple express-session
```

## Quick Start

``` js
import express from 'express';
import { createOAuthRouter } from '@api-craft/oauth';

const app = express();

const oauthRouter = createOAuthRouter({
  baseUrl: 'https://yourdomain.com/auth',
  providers: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      scopes: ['profile', 'email']
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID,
      teamId: process.env.APPLE_TEAM_ID,
      keyId: process.env.APPLE_KEY_ID,
      privateKey: process.env.APPLE_PRIVATE_KEY,
    },
    meta: {
      clientId: process.env.META_CLIENT_ID,
      clientSecret: process.env.META_CLIENT_SECRET,
      scopes: ['public_profile', 'email']
    }
  },
  filter: ['google', 'meta'], // Only enable Google and Meta providers
  onSuccess: (req, res, user) => {
    // Custom logic after successful OAuth login
    res.json({ user });
  },
  onFailure: (req, res, error) => {
    // Handle OAuth failure
    res.status(401).json({ error: error.message });
  }
});

app.use('/auth', oauthRouter);

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
```

## Available Routes 

| Route                       | Method   | Description               |
| --------------------------- | -------- | ------------------------- |
| `/auth/{provider}`          | GET      | Initiate OAuth login flow |
| `/auth/{provider}/callback` | GET/POST | OAuth callback handler    |
| `/auth/failure`             | GET      | OAuth failure handler     |

## Example : Custom On Success

``` js
onSuccess: async (req, res, user) => {
  // Example: Save or update user in your database
  const existingUser = await User.findOne({ oauthId: user.id });
  if (!existingUser) {
    await User.create({ oauthId: user.id, profile: user });
  }

  // Issue JWT token
  const token = createJwtToken(user);

  // Send response
  res.json({ token, user });
}
```

## Licence

MIT License

## Contributions
Contributions and feedback are welcome! Feel free to open issues or pull requests.

## Author
`@api-craft/oauth` by P. Thamilselven
Feel free to reach out for any questions or customizations.