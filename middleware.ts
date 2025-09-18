import { NextRequest, NextResponse, userAgent } from 'next/server'

export function middleware(request: NextRequest) {
    const { device } = userAgent(request)
    const viewport = device.type || 'desktop'

    // Ajouter le viewport dans les headers
    const response = NextResponse.next()
    response.headers.set('x-viewport', viewport)

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}