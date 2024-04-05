import React, { useState } from 'react';
import { Done } from '@mui/icons-material';
import { Input } from '@mui/joy';

export default (props: { defaultValue?: string, onSave: (str: string) => void, placeHolder?: string }) => {
  const { defaultValue, onSave, placeHolder } = props;
  const [focus, setFocus] = useState(false);
  const [temp, setTemp] = useState(defaultValue);

  return <Input variant='plain' value={temp ?? ''} placeholder={placeHolder ?? '请输入'}
                onChange={(e) => {
                  setTemp(e.target.value);
                  setFocus(true);
                  e.target.onkeydown = (keyboardTarget) => {
                    if (keyboardTarget.key == 'Enter') {
                      onSave(e.target.value);
                      setFocus(false);
                    }
                  };
                }}
                onBlur={() => {
                  setTimeout(() => {
                    setFocus(false);
                    setTemp(defaultValue);
                  }, 300);
                }}
                endDecorator={focus ? <Done className='p-v-showbtn'
                                            onClick={() => {
                                              if (temp) {
                                                onSave(temp);
                                              }
                                            }} /> : <></>} />;
}
