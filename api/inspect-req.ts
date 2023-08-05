import { geolocation, ipAddress } from '@vercel/edge';
import { withCorsHeaders } from '../src/utils';

export const config = {
  runtime: 'edge'
};

export default async function handler(request: Request) {
  const headers = withCorsHeaders({
    'content-type': 'application/json',
    'x-edge-token': process.env.VERCEL_EDGE_HEADER_TOKEN ?? ''
  });

  const { longitude, latitude } = geolocation(request);
  const ip = ipAddress(request) || null;

  return new Response(
    JSON.stringify({
        ok: true,
        data: {
            originUrl: request.url,
            longitude,
            latitude,
            "user-agent": request.headers.get('user-agent'),
        },
        error: null
    }),
    {
      status: 200,
      headers
    }
  );
}
