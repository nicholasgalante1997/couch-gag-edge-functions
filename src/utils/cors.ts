export const withCorsHeaders = (
  headers: Record<string, string | string[]>
) => ({
  ...headers,
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': process.env.VERCEL_COUCH_GAG_HOST ?? '',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
});
