interface CouchGagHttpShape {
    getHeaders(): Record<string, string>;
    getHeadersAsString(headers: Headers): string;
    cors(origin: string): boolean;
}

export { type CouchGagHttpShape };