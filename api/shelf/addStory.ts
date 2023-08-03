import { sql } from '@vercel/postgres';
import { withCorsHeaders } from '@/utils/';

export const config = {
  runtime: 'edge'
};

export default async function handler(request: Request) {
  const urlParams = new URL(request.url).searchParams;
  const query = Object.fromEntries(urlParams);
  const uuid = query.uuid;
  const shelfId = query.shelfId;

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

  if (!shelfId) {
    return new Response(
        JSON.stringify({
            ok: false,
            data: null,
            error: 'VercelEdgeFunctionException::MissingShelfId'
        }),
        {
            status: 500,
            statusText: 'ServerException',
            headers
        }
    );
  }

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

  let error: Error | null = null;
  let data: any | null = null;

  try {
    const { rows } = await sql`select * from shelves where uuid = ${uuid} AND shelfkey = ${shelfId}`;
    if (rows.length) {
        data = rows[0];
        console.log(data);
    }
  } catch (e) {
    error = e as Error;
  } 

  if (error) {
    return new Response(
        JSON.stringify({
            ok: false,
            data: null,
            error: error.message
        })
    );
  }

  return new Response(
    JSON.stringify({
        ok: true,
        data,
        error: null
    }),
    {
      status: 201,
      headers
    }
  );
}
