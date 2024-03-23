import { useEffect, useState } from 'react';
import { Button, Card, Input } from '@mui/joy';
import { useNavigate } from 'react-router-dom';

export default () => {
  const [counter, setCounter] = useState<number>(0);

  const [code, setCode] = useState<string>();

  const [showStr, setShowStr] = useState<string>();

  const navigate = useNavigate();

  const navigateToView = async () => {
    if (!code) return;
    if (counter == 1 && code === 'view') {
      navigate('/view');
    } else {
      setShowStr('test1');
    }
  };

  const navigateToFetch = async () => {
    if (!code) return;
    if (counter == 2 && code === 'fetch') {
      navigate('/fetch');
    } else {
      setShowStr('test2');
    }
  };


  const navigateToImport = async () => {
    if (!code) return;
    if (counter == 3 && code === 'import') {
      navigate('/import');
    } else {
      setShowStr('test3');
    }
  };

  useEffect(() => {
    window.electron.ipcRenderer.on('back_to_root', (args: string[]) => {
      navigate('/');
    });
  }, []);

  return <div className='center-container'>
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
        <Input value={code || ''} onChange={(e) => {
          setCode(e.target.value);
        }} />
        <Button onClick={navigateToView}>
          测试设置字符串1
        </Button>
        <Button onClick={navigateToFetch}>
          测试设置字符串2
        </Button>
        <Button onClick={navigateToImport}>
          测试设置字符串3
        </Button>
        <br />
        <div>
          {showStr}
        </div>
      </div>

    </Card>
  </div>;
};
