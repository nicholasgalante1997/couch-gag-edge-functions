import { ipAddress } from '@vercel/edge';
import { sql } from '@vercel/postgres';
import { getLib } from '../../lib';

export const config = {
  runtime: 'edge'
};

export default async function handler(request: Request) {
  const { http } = getLib();

  const origin = request.headers.get('Origin') || request.headers.get('origin');

  if (!http.cors(origin ?? '')) {
    return new Response(
      JSON.stringify({
        ok: false,
        data: null,
        error: 'CORSException::BanishedOrigin'
      })
    );
  }

  const headers = http.getHeaders();
  const urlParams = new URL(request.url).searchParams;
  const query = Object.fromEntries(urlParams);
  const uuid = query.uuid;
  const hash = query.shelfKey;
  const ip = ipAddress(request);

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

  const column = uuid ? 'uuid' : hash ? 'hash' : 'ip_address';
  const value = uuid ? uuid : hash ? hash : ip;

  try {
    const { rows } = await sql`select * from shelves;`;
    if (rows.length) {
      const row = rows.find((qRow) => qRow[column] === value);
      if (!row) {
        throw new Error('ShelfDoesNotExist');
      }
      data = row;
    } else {
      throw new Error('ShelfDoesNotExist');
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
            error
          }
    ),
    {
      status: failed ? 500 : 200,
      headers
    }
  );
}
