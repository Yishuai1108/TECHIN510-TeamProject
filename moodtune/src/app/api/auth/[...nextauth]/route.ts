import NextAuth from 'next-auth';
import SpotifyProvider from 'next-auth/providers/spotify';

const handler = NextAuth({
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'user-read-email user-read-private user-top-read playlist-modify-public playlist-modify-private streaming user-read-playback-state user-modify-playback-state',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        console.log("🔍 Account access token:", account.access_token);
        token.accessToken = account.access_token as string;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("🔍 Token in session callback:", token.accessToken);
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
});

export { handler as GET, handler as POST }; 