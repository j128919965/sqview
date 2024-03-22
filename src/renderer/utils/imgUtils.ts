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

export const compressImage = (buf: Buffer): Promise<string | undefined> => {
  return new Promise((resolve, reject) => {
    let data = parseDataUrl(buf)
    // 文件读取完成时触发
    const image = new Image()
    image.src = data
    image.onload = async e => {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')!!
      const { width: originWidth, height: originHeight } = image
      // 目标尺寸
      let targetWidth = 112
      let targetHeight = 160
      // 获得长宽比例
      const scale = targetWidth / targetHeight;
      canvas.width = targetWidth
      canvas.height = targetHeight
      context.clearRect(0, 0, targetWidth, targetHeight)
      context.fillStyle = '#fff'
      // 图片绘制
      context.drawImage(image, 0, 0, targetWidth, targetHeight)
      let dataUrl = canvas.toDataURL('image/jpeg', 0.2) //缩略图，直接压即可
      resolve(dataUrl)
    }
  })
};
