import NextAuth from 'next-auth';
import SpotifyProvider from 'next-auth/providers/spotify';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) return null;
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;
        return { id: String(user.id), email: user.email, name: user.name, provider: 'credentials' };
      }
    }),
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
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'none',
        path: '/',
        secure: true,
      },
    },
  },
  callbacks: {
    async jwt({ token, account, user }) {
      console.log('==== [NextAuth][jwt callback] ====');
      console.log('account:', account);
      console.log('user:', user);
      console.log('token (before):', token);
      if (account?.provider === 'spotify') {
        token.accessToken = account.access_token;
        token.provider = 'spotify';
      }
      if (user && (user as any).provider === 'credentials') {
        token.provider = 'credentials';
      }
      console.log('token (after):', token);
      console.log('===============================');
      return token;
    },
    async session({ session, token }) {
      console.log('==== [NextAuth][session callback] ====');
      console.log('token:', token);
      console.log('session (before):', session);
      if (typeof token.accessToken === 'string') {
        session.accessToken = token.accessToken;
      }
      session.provider = token.provider;
      console.log('session (after):', session);
      console.log('===============================');
      return session;
    },
  },
});

export { handler as GET, handler as POST }; 