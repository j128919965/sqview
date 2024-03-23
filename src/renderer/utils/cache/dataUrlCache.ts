import { LRUCache } from 'lru-cache'
import { readFileBytes } from '../fileUtils'
import { parseDataUrl } from '../imgUtils'
import { decompress } from '../zstdUtils'

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

const load = async (filePath: string, fileType: 'blob' | 'dataUrl' = 'blob'): Promise<string | undefined> => {
  try {
    const compressed = await readFileBytes(filePath)
    if (!compressed) {
      return undefined
    }
    const buf = await decompress(compressed)
    if (fileType === 'blob') {
      const s = parseDataUrl(buf);
      console.log("load data url", s)
      return s
    } else {
      return new TextDecoder().decode(buf)
    }

  } catch (e) {
    console.error(e)
    return undefined
  }
}

export const dataUrlCache = {

  get: async (filePath: string, fileType: 'blob' | 'dataUrl' = 'blob'): Promise<string | undefined> => {
    const d = cache.get(filePath)
    if (d) {
      return d.data
    }
    const loadResult = await load(filePath, fileType)
    cache.set(filePath, { data: loadResult })
    return loadResult
  }

}