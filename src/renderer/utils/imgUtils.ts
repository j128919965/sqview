export const parseDataUrl = (buf: Buffer): string => {
  const s = `data:image/jpeg;base64,${uint8ArrayToBase64(buf)}`;
  console.log(s);
  return s;
};


function uint8ArrayToBase64(u8Array: Uint8Array) {
  const chunkSize = 0x8000; // 大约每次转换0.98MB
  let result = '';

  for (let i = 0; i < u8Array.length; i += chunkSize) {
    let slice = u8Array.subarray(i, Math.min(i + chunkSize, u8Array.length));
    // @ts-ignore
    result += String.fromCharCode.apply(null, slice);
  }

  return btoa(result); // 转换为base64
}
