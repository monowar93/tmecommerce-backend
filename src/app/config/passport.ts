import bcryptjs from "bcryptjs";
import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import { IAuthProvider, IsActive, Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import { envVars } from "./env";
import { v2 as cloudinary } from "cloudinary";

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Local Strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email: string, password: string, done) => {
      try {
        const isUserExist = await User.findOne({ email });
        if (!isUserExist) {
          return done(null, false, { message: "User not found" });
        }

        // if (!isUserExist.isVerified) {
        //   return done(null, false, { message: "User is not Verified" });
        // }

        if (isUserExist.isActive === IsActive.BLOCKED) {
          return done(null, false, {
            message: `User is Blocked, Please contact out support team`,
          });
        }

        const externalProvider = isUserExist.auths.find(
          (auth) =>
            auth.provider === "google" ||
            auth.provider === "facebook" ||
            auth.provider === "github",
        );

        if (externalProvider && !isUserExist.password) {
          return done(null, false, {
            message: `You have authenticated through ${capitalize(
              externalProvider.provider,
            )}. For login with credentials, please first login with ${
              externalProvider.provider
            } and then set a password for your email.`,
          });
        }

        if (!isUserExist.password) {
          return done(null, false, {
            message: "No password set for this user.",
          });
        }

        const isMatch = await bcryptjs.compare(
          password as string,
          isUserExist.password as string,
        );

        if (!isMatch) {
          return done(null, false, { message: "Incorrect password" });
        }

        return done(null, isUserExist);
      } catch (err) {
        console.log(err);
        return done(err);
      }
    },
  ),
);

//Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      callbackURL: envVars.GOOGLE_CALLBACK_URL,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback,
    ) => {
      try {
        const email = profile.emails?.[0].value.toLowerCase();
        if (!email) {
          return done(null, false, { message: "No Email Found" });
        }

        let user = await User.findOne({ email });

        if (!user) {
          const uploadedResponse = await cloudinary.uploader.upload(
            profile.photos?.[0].value!,
            {
              folder: "tm_ecommerce/profile_image",
            },
          );

          const { public_id, secure_url } = uploadedResponse;

          user = new User({
            name: profile.displayName,
            email: email,
            picture: {
              public_id,
              url: secure_url,
            },
            role: Role.USER,
            isVerified: true,
            auths: [
              {
                provider: "google",
                providerId: profile.id,
              },
            ],
          });
          await user.save();
        }

        if (user) {
          if (user.isActive === IsActive.BLOCKED) {
            return done(null, false, {
              message: "You are Blocked, Please contact helpline",
            });
          }

          if (!user.isVerified) {
            user.isVerified = true;
          }

          const hasGoogleAuth = user.auths.some(
            (auth) => auth.provider === "google",
          );

          if (!hasGoogleAuth) {
            const newAuth: IAuthProvider = {
              provider: "google",
              providerId: profile.id,
            };
            user.auths = [...user.auths, newAuth];
          }

          await user.save();
        }

        return done(null, user);
      } catch (err) {
        console.log("Google Strategy Error", err);
        return done(err, false);
      }
    },
  ),
);

// Serialize & Deserialize
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});
