import { geolocation, ipAddress } from '@vercel/edge';
import { sql } from '@vercel/postgres';
import { HmacSHA256, enc } from 'crypto-js';
import { withCorsHeaders } from '../../src/utils';

export const config = {
  runtime: 'edge'
};

export default async function handler(request: Request) {
  /**
   * Get uuid from params
   */
  const urlParams = new URL(request.url).searchParams;
  const query = Object.fromEntries(urlParams);
  const uuid = query.uuid;
  const tag = query.tag ?? 'no-tag';

  /**
   * construct headers
   */
  const headers = withCorsHeaders({
    'content-type': 'application/json',
    'x-edge-token': process.env.VERCEL_EDGE_HEADER_TOKEN ?? ''
  });

  /**
   * Check to see if we have a valid uuid
   */
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
    );
  }

  /**
   * Get the metadata of the request needed to construct a shelf key
   */
  const { latitude, longitude, countryRegion, city, country, region } =
    geolocation(request);
  const ip = ipAddress(request) || null;

  if (!ip) {
    return new Response(
      JSON.stringify({
        ok: false,
        data: null,
        error: 'VercelEdgeFunctionException::MissingGeoLocationData'
      }),
      {
        status: 500,
        statusText: 'ServerException',
        headers
      }
    );
  }

  /**
   * See if we have an existing shelf with this ipAddress
   */
  try {
    const { rows } = await sql`select * from shelves where ip_address = ${ip};`;
    if (rows.length) {
      return new Response(
        JSON.stringify({
          ok: true,
          data: rows[0],
          error: null
        }),
        {
          headers,
          status: 200,
          statusText: 'OK::ShelfExists'
        }
      );
    }
  } catch (e: unknown) {
    return new Response(
      JSON.stringify({
        ok: false,
        data: null,
        error: (e as Error).message
      })
    );
  }

  const message = JSON.stringify([
    uuid,
    latitude,
    longitude,
    country,
    countryRegion,
    city,
    region,
    ip
  ]);
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
