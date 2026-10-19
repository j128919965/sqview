import React, { useState } from 'react';
import { Cancel, Done } from '@mui/icons-material';
import { Input } from '@mui/joy';

export default (props: { defaultValue?: string, onSave: (str: string) => Promise<void>, placeHolder?: string }) => {
  const { defaultValue, onSave, placeHolder } = props;
  const [focus, setFocus] = useState(false);
  const [temp, setTemp] = useState(defaultValue);

  const save = (value?: string) => {
    const finalTemp = value ?? temp;
    if (finalTemp) {
      // 这里触发了保存，如果成功的话，则
      onSave(finalTemp).then(() => setTemp(finalTemp));
    }
    setFocus(false);
  }

  const cancel = () => {
    setFocus(false);
    setTemp(defaultValue);
  }

  const doneIcon = () => {
    if (focus) {
      return <span>
        <Cancel className='p-v-showbtn' onClick={cancel} />
        <span>&nbsp;</span>
        <Done className='p-v-showbtn' onClick={() => save()} />
      </span>
    } else {
      return <></>
    }
  }

  return <Input variant='plain' value={temp ?? ''} placeholder={placeHolder ?? '请输入'}
    onChange={(e) => {
      setTemp(e.target.value);
      setFocus(true);
      e.target.onkeydown = (keyboardTarget) => {
        if (keyboardTarget.key == 'Enter') {
          save(e.target.value);
        }
      };
    }}
    // onBlur={() => {
    //   setTimeout(() => {

    //   }, 300);
    // }}
    endDecorator={doneIcon()} />;
}
