import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';


export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
 
  callbacks: {
    async session({ session, token, user }) {
     
      if (token) {
        session.user.id = token.id || token.sub; 
        session.accessToken = token.accessToken; 
      }
      
      return session;
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      if (account) { 
        token.accessToken = account.access_token;
        token.id = user?.id || profile?.sub; 
      }
      return token;
    }
  },
  

  secret: process.env.NEXTAUTH_SECRET, 

  pages: {
    
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };