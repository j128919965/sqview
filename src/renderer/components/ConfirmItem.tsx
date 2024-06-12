import { Dialog, DialogContentText } from '@mui/material';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Image from './Image';
import { metaFirstPicPath } from '../utils/metaUtils';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import React, { ReactElement, useState } from 'react';

export default (props: { onConfirm: (result: boolean) => void, title: string, content: string | ReactElement }) => {

  const [confirmOpen, setConfirmOpen] = useState(true);

  const setResult = (result: boolean) => {
    setConfirmOpen(false);
    props.onConfirm(result)
  }

  return <div><Dialog
    open={confirmOpen}
    onClose={() => setResult(false)}
    aria-labelledby='alert-dialog-title'
    aria-describedby='alert-dialog-description'
  >
    <DialogTitle id='alert-dialog-title'>
      {props.title}
    </DialogTitle>
    <DialogContent>
      {props.content}
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setResult(false)}>取消</Button>
      <Button onClick={() => {
        setResult(true);
      }} autoFocus>
        删除
      </Button>
    </DialogActions>
  </Dialog></div>;
}
