const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

// Google OAuth Strategy Configuration
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleCallbackUrl =
  process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback";

if (googleClientId && googleClientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: googleCallbackUrl,
        proxy: true,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email =
            profile.emails && profile.emails[0]
              ? profile.emails[0].value.toLowerCase().trim()
              : null;

          if (!email) {
            return done(new Error("No email address returned from Google profile."), null);
          }

          // 1. Check if user with this email already exists
          let user = await User.findOne({ email });

          if (user) {
            // User exists (signed up via email/password or previous Google login)
            // Link Google ID if not already attached
            let modified = false;
            if (!user.googleId) {
              user.googleId = profile.id;
              modified = true;
            }
            if (!user.isEmailVerified) {
              user.isEmailVerified = true;
              modified = true;
            }
            if (profile.photos && profile.photos[0] && !user.avatar) {
              user.avatar = profile.photos[0].value;
              modified = true;
            }
            if (modified) {
              await user.save();
            }
            return done(null, user);
          }

          // 2. If no user exists, create a new user with Google profile
          const displayName =
            profile.displayName ||
            (profile.name
              ? `${profile.name.givenName || ""} ${profile.name.familyName || ""}`.trim()
              : "Google User");

          const avatar =
            profile.photos && profile.photos[0] ? profile.photos[0].value : "";

          user = await User.create({
            name: displayName || "FoodFusion User",
            email: email,
            googleId: profile.id,
            avatar: avatar,
            isEmailVerified: true,
            isPhoneVerified: false,
          });

          return done(null, user);
        } catch (error) {
          console.error("Passport Google Strategy error:", error);
          return done(error, null);
        }
      }
    )
  );
} else {
  console.warn(
    "⚠️ Google OAuth: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not configured in .env. Google login will show configuration guide if triggered."
  );
}

// Session Serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select("-password");
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
