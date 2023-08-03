import { geolocation, ipAddress } from '@vercel/edge';
import { sql } from '@vercel/postgres';
import { HmacSHA256, enc } from 'crypto-js';
import { withCorsHeaders } from '@/utils/';

export const config = {
  runtime: 'edge'
};

export default async function handler(request: Request) {
  const urlParams = new URL(request.url).searchParams;
  const query = Object.fromEntries(urlParams);
  const uuid = query.uuid;
  const tag = query.tag ?? 'no-tag';

  const headers = withCorsHeaders({
    'content-type': 'application/json',
    'x-edge-token': process.env.VERCEL_EDGE_HEADER_TOKEN ?? ''
  });

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
            headers
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
        }),
        {
            status: 500,
            statusText: 'ServerException',
            headers
        }
    );
  }

  const message = JSON.stringify([uuid, latitude, longitude, country, countryRegion, city, region, ip]);
  const key = process.env.VERCEL_HMAC_KEY;

  if (!key) {
    return new Response(
        JSON.stringify({
            ok: false,
            data: null,
            error: 'VercelEdgeFunctionException::MissingEnvKey'
        }),
        {
            status: 500,
            statusText: 'ServerException',
            headers
        }
    );
  }

  const shelfKey = enc.Hex.stringify(HmacSHA256(message, key));

  let error: Error | null = null;

  try {
    await sql`insert into shelves(uuid, shelfkey, longitude, latitude, ip_address, tag, country, country_region, region) values(${uuid}, ${shelfKey}, ${longitude}, ${latitude}, ${ip}, ${tag}, ${country}, ${countryRegion}, ${region});`;
  } catch (e) {
    error = e as Error;
  } 

  if (error) {
    return new Response(
        JSON.stringify({
            ok: false,
            data: null,
            error: error.message
        }),
        {
            headers,
            status: 500,
            statusText: 'ServerException'
        }
    );
  }

  return new Response(
    JSON.stringify({
        ok: true,
        data: {
            uuid,
            shelfKey
        },
        error: null
    }),
    {
      status: 201,
      headers
    }
  );
}
