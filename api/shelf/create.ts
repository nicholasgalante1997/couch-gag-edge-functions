import { geolocation, ipAddress } from '@vercel/edge';
import { HmacSHA256, enc } from 'crypto-js';

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

  const { latitude, longitude, countryRegion, city, country, region } = geolocation(request);
  const ip = ipAddress(request) || null;

  if (!ip) {
    return new Response(
        JSON.stringify({
            ok: false,
            data: null,
            error: 'VercelEdgeFunctionException::MissingIPAddress'
        })
    );
  }

  const message = JSON.stringify([uuid, latitude, longitude, country, countryRegion, city, region, ip]);
  const key = process.env.VERCEL_HMAC_KEY;

  const shelfKey = enc.Hex.stringify(HmacSHA256(message, key));
  console.log(shelfKey);

  return new Response(
    JSON.stringify({
        latitude,
        longitude,
        countryRegion,
        country,
        region,
        city,
        ipAddress: ip,
        shelfKey
    }),
    {
      status: 201,
      headers: {
        'content-type': 'application/json',
        'x-edge-token': process.env.VERCEL_EDGE_HEADER_TOKEN
      }
    }
  );
}
