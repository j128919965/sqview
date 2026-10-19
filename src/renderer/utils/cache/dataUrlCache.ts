import { LRUCache } from 'lru-cache';
import { readFileBytes } from '../fileUtils';
import { parseDataUrl } from '../imgUtils';
import { decompress } from '../zstdUtils';
import { FileType } from '../../data';

const options = {
  max: 500,
  ttl: 1000 * 60 * 30,
  updateAgeOnGet: false,
  updateAgeOnHas: false,
}

interface Optional<T> {
  data?: T
}

const cache = new LRUCache<string, Optional<string>>(options)
const pending = new Map<string, Promise<string | undefined>>();

const load = async (filePath: string, fileType: FileType = 'blob'): Promise<string | undefined> => {
  try {
    const compressed = await readFileBytes(filePath)
    if (!compressed) {
      return undefined
    }
    const buf = await decompress(compressed)
    if (fileType === 'blob') {
      return parseDataUrl(buf)
    } else {
      return new TextDecoder().decode(buf)
    }

  } catch (e) {
    console.error(e)
    return undefined
  }
}

export const dataUrlCache = {

  delete: (filePath: string, fileType: FileType = 'blob') => cache.delete(`${fileType}:${filePath}`),

  get: async (filePath: string, fileType: FileType = 'blob'): Promise<string | undefined> => {
    const key = `${fileType}:${filePath}`;
    const d = cache.get(key)
    if (d) {
      return d.data
    }
    const existing = pending.get(key);
    if (existing) return existing;
    const request = load(filePath, fileType).then(data => {
      if (data) cache.set(key, { data });
      return data;
    }).finally(() => pending.delete(key));
    pending.set(key, request);
    return request;
  }

}
