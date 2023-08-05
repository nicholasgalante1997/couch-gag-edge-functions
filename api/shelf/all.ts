import { sql } from '@vercel/postgres';
import { withCorsHeaders } from '../../src/utils';

export const config = {
  runtime: 'edge'
};

export default async function handler(_request: Request) {
  const headers = withCorsHeaders({
    'content-type': 'application/json',
    'x-edge-token': process.env.VERCEL_EDGE_HEADER_TOKEN ?? ''
  });
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
