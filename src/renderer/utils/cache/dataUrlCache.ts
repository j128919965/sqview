import { LRUCache } from 'lru-cache'
import { readFileBytes } from '../fileUtils'
import { parseDataUrl } from '../imgUtils'
import { decompress } from '../zstdUtils'

const options = {
  max: 500,

  // for use with tracking overall storage size
  maxSize: 5000,

  // how long to live in ms
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
      return parseDataUrl(buf)
    } else {
      return buf.toString()
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
