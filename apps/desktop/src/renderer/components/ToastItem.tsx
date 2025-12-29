import React from "react";
import { Snackbar, Alert } from '@mui/material';

export default (props: any) => {
  const { content, duration=3000, type } = props;
  // 开关控制：默认true,调用时会直接打开
  const [open, setOpen] = React.useState(true);
  // 关闭消息提示
  const handleClose = () => {
    setOpen(false);
  };
  return <Snackbar
    open={open}
    autoHideDuration={duration}
    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    onClose={handleClose}>
    <Alert onClose={handleClose} severity={type}>{content}</Alert>
  </Snackbar>
}
