import { useState } from 'react';
import { Button, Card } from '@mui/joy';
import { readFileBytesRenderer, writeFileBytesRenderer } from '../utils/fileUtils';
import { compress, decompress } from '../utils/zstdUtils';
import { parseDataUrl } from '../utils/imgUtils';

export default () => {
  const [counter, setCounter] = useState<number>(0);

  const [dataUrl, setDataUrl] = useState<string>();

  const saveCompress = async () => {
    const path = 'C:\\Users\\85368\\Pictures\\Camera Roll\\safepoint.png';

    const buf = await readFileBytesRenderer(path);
    const compressed = await compress(buf);
    const compressPath = path + '.compressed';
    await writeFileBytesRenderer(compressPath, compressed);

    const buf2 = await readFileBytesRenderer(compressPath);
    const buf3 = await decompress(buf2)
    setDataUrl(parseDataUrl(buf3));

  };


  return <Card sx={{ width: 320 }}>
    <div>
      <h1 style={{ textAlign: 'center' }}>{counter}</h1>
    </div>
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <Button
        variant='solid'
        size='md'
        color='primary'
        onClick={() => setCounter(counter + 1)}
        sx={{ alignSelf: 'center', fontWeight: 600 }}
      >
        count++
      </Button>
      <Button onClick={saveCompress}>
        compress
      </Button>
      {dataUrl && <img src={dataUrl} alt='啊这' />}


    </div>

  </Card>;
};
