import { TextDecoder, TextEncoder } from 'node:util';
import { dataUrlCache } from '../renderer/utils/cache/dataUrlCache';
import { readFileBytes } from '../renderer/utils/fileUtils';

jest.mock('../renderer/utils/fileUtils', () => ({ readFileBytes: jest.fn() }));
jest.mock('../renderer/utils/zstdUtils', () => ({ decompress: async (bytes: Uint8Array) => bytes }));
jest.mock('../renderer/utils/imgUtils', () => ({ parseDataUrl: () => 'data:image/png;base64,loaded' }));

beforeEach(() => jest.clearAllMocks());
beforeAll(() => Object.defineProperty(global, 'TextDecoder', { configurable: true, value: TextDecoder }));

it('reads a file again after a failed load instead of caching the failure', async () => {
  (readFileBytes as jest.Mock).mockResolvedValueOnce(undefined).mockResolvedValueOnce(new Uint8Array([1]));
  expect(await dataUrlCache.get('/retry-image')).toBeUndefined();
  expect(await dataUrlCache.get('/retry-image')).toBe('data:image/png;base64,loaded');
  expect(readFileBytes).toHaveBeenCalledTimes(2);
});

it('shares an in-flight image request and separates binary images from data URLs', async () => {
  (readFileBytes as jest.Mock).mockResolvedValue(new TextEncoder().encode('data:image/jpeg;base64,thumbnail'));
  const images = await Promise.all([dataUrlCache.get('/shared'), dataUrlCache.get('/shared')]);
  expect(images).toEqual(['data:image/png;base64,loaded', 'data:image/png;base64,loaded']);
  expect(readFileBytes).toHaveBeenCalledTimes(1);
  expect(await dataUrlCache.get('/shared', 'dataUrl')).toBe('data:image/jpeg;base64,thumbnail');
  expect(readFileBytes).toHaveBeenCalledTimes(2);
});
