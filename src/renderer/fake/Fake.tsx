import { useState } from 'react';
import { Button, Card, Input } from '@mui/joy';
import { readFileBytes, writeFileBytesRenderer } from '../utils/fileUtils';
import { compress, decompress } from '../utils/zstdUtils';
import { parseDataUrl } from '../utils/imgUtils';
import { SqPicUrlHelper } from '../utils/picDownloader';

export default () => {
  const [counter, setCounter] = useState<number>(0);

  const [url, setUrl] = useState<string>();

  const [dataUrl, setDataUrl] = useState<string>();

  const saveCompress = async () => {
    if (!url) return
    const urls = SqPicUrlHelper.urls(url)
    console.log(urls)

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
      <Input value={url} onChange={(e) => {
        setUrl(e.target.value)
      }} />
      <Button onClick={saveCompress}>
        compress
      </Button>

      {dataUrl && <img src={dataUrl} alt='啊这' />}


    </div>

  </Card>;
};
