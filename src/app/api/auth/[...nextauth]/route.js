// src/app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
// Optional: If you want to use MongoDB Adapter to store user sessions and accounts
// import { MongoDBAdapter } from "@next-auth/mongodb-adapter"
// import clientPromise from "@/lib/mongodb-client" // You'd need to create this similar to dbConnect but returning the client promise

export const authOptions = {
  // Optional: Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // ...add more providers here
  ],
  // Optional: MongoDB Adapter
  // adapter: MongoDBAdapter(clientPromise),
  // Optional: Callbacks for customizing behavior
  callbacks: {
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token and user id from a provider.
      // The `user` object is the user profile from the database if using an adapter,
      // or the raw profile from the provider if not.
      // The `token` object is the JWT token.
      if (token) {
        session.user.id = token.id || token.sub; // Add user ID to session
        session.accessToken = token.accessToken; // Example: if you need provider's access token
      }
      // console.log("Session callback:", { session, token, user });
      return session;
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account) { // `account` is only passed on initial sign-in
        token.accessToken = account.access_token;
        token.id = user?.id || profile?.sub; // user.id from adapter, profile.sub from provider
      }
      // console.log("JWT callback:", { token, user, account, profile, isNewUser });
      return token;
    }
  },
  // Optional: Add a database adapter if you want to persist users, sessions, accounts.
  // For now, we'll rely on JWT sessions which are default if no adapter is specified.
  // If you add an adapter, user profiles are saved to the DB.
  // adapter: MongoDBAdapter(clientPromise), // See note about clientPromise above

  // A database is optional, but required to persist accounts in a database
  // For this assignment, JWT sessions are fine, but a DB adapter is more robust for production.
  // If you want to store users in your MongoDB, uncomment the adapter and set it up.

  secret: process.env.NEXTAUTH_SECRET, // For JWT signing

  pages: {
    // signIn: '/auth/signin', // Optional: Custom sign-in page
    // signOut: '/auth/signout', // Optional: Custom sign-out page
    // error: '/auth/error', // Optional: Error page
    // verifyRequest: '/auth/verify-request', // Optional: Email verification page
    // newUser: '/auth/new-user' // Optional: New user page
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };