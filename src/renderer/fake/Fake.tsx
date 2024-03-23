import { useState } from 'react';
import { Button, Card, Input } from '@mui/joy';
import { useNavigate } from 'react-router-dom';

export default () => {
  const [counter, setCounter] = useState<number>(0);

  const [url, setUrl] = useState<string>();

  const [dataUrl, setDataUrl] = useState<string>();

  const navigate = useNavigate()

  const saveCompress = async () => {
    // if (!url) return;
    // if (counter == 3 && url === 'sqview') {
      navigate('/view');
    // }
    setDataUrl(url);
  };


  return <div  className='center-container'>
    <Card sx={{ width: 320 }}>
      <div>
        <h1 style={{ textAlign: 'center' }}>{counter}</h1>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Button
          variant='solid'
          size='md'
          color='primary'
          onClick={() => setCounter(counter + 1)}
          sx={{ alignSelf: 'center', fontWeight: 600 }}
        >
          count++
        </Button>
        <Input value={url || ''} onChange={(e) => {
          setUrl(e.target.value);
        }} />
        <Button onClick={saveCompress}>
          测试设置字符串
        </Button>
        <Button onClick={()=>navigate('/fetch')}>
          测试设置字符串W
        </Button>
        <br />
        <div>
          {dataUrl}
        </div>


      </div>

    </Card>
  </div>;
};
