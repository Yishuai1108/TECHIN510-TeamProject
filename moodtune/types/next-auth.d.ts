import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user?: DefaultSession['user'];
    provider?: string;
    spotifyAccessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    provider?: string;
    spotifyAccessToken?: string;
  }
} 