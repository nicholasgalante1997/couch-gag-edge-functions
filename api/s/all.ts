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

  let error: Error | null = null;
  let data: any | null = null;

  try {
    const { rows } = await sql`select * from shelves;`;
    data = rows;
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
