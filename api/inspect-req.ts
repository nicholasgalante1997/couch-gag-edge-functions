import { geolocation, ipAddress } from '@vercel/edge';
import { getUtils } from '../utils';

export const config = {
  runtime: 'edge'
};

export default async function handler(request: Request) {
  const util = getUtils();
  const { longitude, latitude } = geolocation(request);
  const ip = ipAddress(request) || null;

  const headers = util.http.getHeaders();
  const headerString = util.http.getHeadersAsString(request.headers);

  return new Response(
    JSON.stringify({
      ok: true,
      data: {
        url: request.url,
        longitude,
        latitude,
        'user-agent': request.headers.get('user-agent'),
        ipAddress: ip,
        mode: request.mode,
        origin: request.headers.get('Origin') || request.headers.get('origin'),
        headers: headerString
      },
      error: null
    }),
    {
      status: 200,
      headers
    }
  );
}
