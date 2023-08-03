import { geolocation, ipAddress } from '@vercel/edge';

export const config = {
  runtime: 'edge'
};

export default async function handler(request: Request) {
  const urlParams = new URL(request.url).searchParams;
  const query = Object.fromEntries(urlParams);
  const uuid = query.uuid;
  if (!uuid) {
    return new Response(
        JSON.stringify({ 
            ok: false, 
            data: null, 
            error: 'VercelEdgeFunctionException::MissingUUID' 
        }),
        {
            status: 500,
            statusText: 'ServerException',
            headers: {
                'content-type': 'application/json',
                'x-edge-token': process.env.VERCEL_EDGE_TOKEN
            }
        }
    )
  }

  const { latitude, longitude, countryRegion } = geolocation(request);
  const ip = ipAddress(request) || 'unidentified_ip_address';


  return new Response(
    JSON.stringify({
        latitude,
        longitude,
        countryRegion,
        ipAddress: ip
    }),
    {
      status: 201,
      headers: {
        'content-type': 'application/json',
        'x-edge-token': process.env.VERCEL_EDGE_TOKEN
      }
    }
  );
}
