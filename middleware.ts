import { next } from '@vercel/edge';

export const config = {
    matcher: ['/api/shelf/create']
};

export default function middleware(request: Request) {
    next();
}   

/**
 * @abstract
 * vercel middleware
 * - <https://vercel.com/docs/concepts/functions/edge-middleware/middleware-api>
 * - <https://vercel.com/docs/concepts/functions/edge-functions/vercel-edge-package>
 */