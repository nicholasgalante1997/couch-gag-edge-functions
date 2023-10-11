import { CouchGagHttp } from './models';
import { ILib } from './types/lib';

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
