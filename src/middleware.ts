import NextAuth from 'next-auth'
import authConfig from '../auth.config'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  // Public routes
  const publicRoutes = ['/login', '/register', '/privacy']
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/api/auth')

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL('/login', req.url))
  }

  if (isLoggedIn && (pathname === '/login' || pathname === '/register')) {
    return Response.redirect(new URL('/', req.url))
  }
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
