import { next } from '@vercel/edge';

export const config = {
    matcher: ['/api/example', '/api/shelf/create']
};

export default function middleware(request: Request) {
    console.log('IN MIDDLEWARE');
    console.log(request.url)
    next();
}   

/**
 * @abstract
 * vercel middleware
 * - <https://vercel.com/docs/concepts/functions/edge-middleware/middleware-api>
 * - <https://vercel.com/docs/concepts/functions/edge-functions/vercel-edge-package>
 * - 
 */