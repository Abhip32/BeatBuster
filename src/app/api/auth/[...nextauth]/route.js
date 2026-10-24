import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import dbConnect from "@/utils/dbconnect";
import GoogleProvider from "next-auth/providers/google";
import UserData from "@/models/UserData";

export const dynamic = "force-dynamic";

const providers = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

providers.push(
  CredentialsProvider({
    name: "Credentials",
    credentials: {},
    async authorize(credentials) {
      try {
        const conn = await dbConnect();
        if (!conn) {
          console.error("Database connection unavailable for credentials login");
          return null;
        }
        const { email, password } = credentials;
        const user = await User.findOne({ email });
        if (user && user.password && (await bcrypt.compare(password, user.password))) {
          return user;
        }
        return null;
      } catch (e) {
        console.error("Authorize error:", e);
        return null;
      }
    },
  })
);

const options = {
  providers,
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/",
  },
  session: {
    jwt: true,
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.JWT_SECRET || "musify-secret-key-32charslongdefault",

  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        try {
          const conn = await dbConnect();
          if (!conn) {
            console.error("Database connection unavailable for Google login");
            return false;
          }
          const { name, email, picture } = profile;
          const userDB = await User.findOne({ email });
          if (!userDB) {
            const userData = await UserData.create({});
            const newUser = await User.create({
              userName: name,
              email,
              imageUrl: picture,
              userData: userData._id,
              isVerified: profile.email_verified || true,
            });
            return newUser;
          }
          return userDB;
        } catch (e) {
          console.error("Google signIn callback error:", e);
          return false;
        }
      }
      return true;
    },
  },
};

const handler = (req, res) => NextAuth(req, res, options);
export { handler as GET, handler as POST };
