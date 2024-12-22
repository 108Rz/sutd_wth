// pages/api/auth/[...nextauth].ts
import NextAuth, { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      // Add user ID and other custom fields to the session
      if (token.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Allow redirects to the dashboard after login
      return url.startsWith(baseUrl) ? url : baseUrl + '/dashboard'
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  }
}

export default NextAuth(authOptions)