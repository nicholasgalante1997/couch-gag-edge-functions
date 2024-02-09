interface CouchGagHttpShape {
  getHeaders(request: Request): Record<string, string>;
  getHeadersAsString(headers: Headers): string;
  cors(origin: string): boolean;
}

export { type CouchGagHttpShape };
