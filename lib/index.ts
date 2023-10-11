import { CouchGagHttp } from './models/index.js';
import { ILib } from './types/lib.js';

class Lib implements ILib {
  http = new CouchGagHttp();
}

let lib: Lib;

export function getLib() {
  if (!lib) {
    lib = new Lib();
  }
  return lib;
}
