interface CouchGagHttpShape {
  getHeaders(): Record<string, string>;
  getHeadersAsString(headers: Headers): string;
  cors(origin: string): boolean;
}

class CouchGagHttp implements CouchGagHttpShape {
  cors(origin: string) {
    if (origin === process.env.VERCEL_COUCH_GAG_HOST) return true;
    return false;
  }
  getHeaders() {
    return {
      'content-type': 'application/json',
      'x-edge-token': process.env.VERCEL_EDGE_HEADER_TOKEN ?? '',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': process.env.VERCEL_COUCH_GAG_HOST ?? '',
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

interface CouchGagUtilityShape {
  http: CouchGagHttpShape;
}

class CouchGagUtility implements CouchGagUtilityShape {
  http = new CouchGagHttp();
}

let util: CouchGagUtility;

export function getUtils() {
  if (!util) {
    util = new CouchGagUtility();
  }
  return util;
}
