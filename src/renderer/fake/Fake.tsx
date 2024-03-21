import { useState } from 'react';
import { Button, Card } from '@mui/joy';

export default () => {
  const [counter, setCounter] = useState<number>(0);

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
    </div>

  </Card>;
};
