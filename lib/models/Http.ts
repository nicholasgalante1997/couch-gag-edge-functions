import { CouchGagHttpShape } from '../types';

class CouchGagHttp implements CouchGagHttpShape {
  static ALLOWLISTED_DOMAINS = new Set<string | undefined>([
    process.env.WEB_BETA,
    process.env.WEB_GAMMA,
    process.env.WEB_PROD,
    process.env.MINT_PROD
  ]);

  cors(origin: string) {
    if (CouchGagHttp.ALLOWLISTED_DOMAINS.has(undefined)) {
      return false;
    }
    return CouchGagHttp.ALLOWLISTED_DOMAINS.has(origin);
  }

  getHeaders(request: Request) {
    const { url } = request;
    return {
      'content-type': 'application/json',
      'x-edge-token': process.env.VERCEL_EDGE_HEADER_TOKEN ?? '',
      'cache-control': 'public, s-maxage=1200, stale-while-revalidate=600',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': CouchGagHttp.ALLOWLISTED_DOMAINS.has(url)
        ? url
        : '*' /** TODO: Remove after opening up "Write" routes. */,
      Vary: 'Origin',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers':
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    };
  }

  getHeadersAsString(headers: Headers): string {
    let headerString = '';
    for (const [k, v] of headers.entries()) {
      headerString += `${k}=${v},`;
    }
    return headerString;
  }
}

export { CouchGagHttp };
