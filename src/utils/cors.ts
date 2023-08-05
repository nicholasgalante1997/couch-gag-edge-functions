export const withCorsHeaders = (
  headers: Record<string, string | string[]>
) => ({
  ...headers,
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': process.env.VERCEL_COUCH_GAG_HOST ?? ''
});
