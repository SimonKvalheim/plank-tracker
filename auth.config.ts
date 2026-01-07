import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export default {
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      // Authorization is handled in auth.ts (Node.js only)
      authorize: () => null,
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id as string
      return session
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl
      const isLoggedIn = !!auth?.user

      // Public routes
      const publicRoutes = ['/login', '/register', '/privacy']
      const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/api/auth')

      if (!isLoggedIn && !isPublicRoute) {
        return false
      }

      return true
    },
  },
  pages: { signIn: '/login' },
} satisfies NextAuthConfig
