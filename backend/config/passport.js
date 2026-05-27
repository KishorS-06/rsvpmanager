import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/User.js';
import logger from '../utils/logger.js';

// JWT Strategy
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload.id).select('-password');
        if (!user) return done(null, false);
        if (!user.isActive) return done(null, false, { message: 'Account suspended' });
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists with this Google ID
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            user.lastLogin = new Date();
            await user.save();
            return done(null, user);
          }

          // Check if email already registered
          user = await User.findOne({ email: profile.emails[0].value });
          if (user) {
            user.googleId = profile.id;
            user.isEmailVerified = true;
            if (!user.profile.avatar && profile.photos[0]) {
              user.profile.avatar = profile.photos[0].value;
            }
            user.lastLogin = new Date();
            await user.save();
            return done(null, user);
          }

          // Create new user
          const username = `${profile.displayName.replace(/\s+/g, '').toLowerCase()}${Date.now().toString(36)}`;
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            username,
            password: `google_${profile.id}_${Date.now()}`, // placeholder, won't be used
            isEmailVerified: true,
            profile: {
              firstName: profile.name.givenName || '',
              lastName: profile.name.familyName || '',
              avatar: profile.photos[0]?.value || ''
            },
            lastLogin: new Date()
          });

          return done(null, user);
        } catch (error) {
          logger.error('Google OAuth error:', error);
          return done(error, false);
        }
      }
    )
  );
}

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
