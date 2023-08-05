import { ipAddress } from '@vercel/edge';
import { sql } from '@vercel/postgres';
import { withCorsHeaders } from '../../src/utils';

export const config = {
  runtime: 'edge'
};

export default async function handler(request: Request) {
  const urlParams = new URL(request.url).searchParams;
  const query = Object.fromEntries(urlParams);
  const uuid = query.uuid;
  const hash = query.shelfKey;
  const ip = ipAddress(request);

  const headers = withCorsHeaders({
    'content-type': 'application/json',
    'x-edge-token': process.env.VERCEL_EDGE_HEADER_TOKEN ?? ''
  });

  if (!uuid && !hash && !ip) {
    return new Response(
      JSON.stringify({
        ok: false,
        data: null,
        error: 'VercelEdgeFunctionException::MissingShelfIdentifier'
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

  function getSqlQuery() {
    if (uuid) {
      return `select * from shelves where uuid = '${uuid}';`;
    }
    if (hash) {
      return `select * from shelves where shelfkey = '${hash}';`
    }
    return `select * from shelves where ip_address = '${ip}';`;
  }

  console.log('Query is `' + getSqlQuery() + '`');

  try {
    const { rows } = await sql`${getSqlQuery()}`;
    if (rows.length) {
      data = rows[0];
    }
  } catch (e: unknown) {
    error = e as Error;
  }

  const failed = !!error || !data;

  return new Response(
    JSON.stringify(
      failed
        ? {
            ok: false,
            data: null,
            error: error?.message
          }
        : {
            ok: true,
            data,
            error: null
          }
    ),
    {
      status: failed ? 500 : 200,
      headers
    }
  );
}
