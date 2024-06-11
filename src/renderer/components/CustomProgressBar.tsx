import React from 'react';
import { LinearProgress, useTheme } from '@mui/material';


interface ProgressBarProps {
  success: number; // 成功的百分比
  failure: number;
  all: number;
}

const CustomProgressBar: React.FC<ProgressBarProps> = ({ success, failure, all }) => {
  const theme = useTheme();

  const successPercent = success / all * 100;
  const failPercent = failure / all * 100;

  return (
    <div style={{
      width: '100%',
      padding: '0 20px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-around',
      alignItems: 'center',
      height: 60
    }}>
      <span>加载进度 ： {success}个成功， {failure}个失败， {all - success - failure}个加载中</span>
      <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
        {/* 成功的进度条 */}
        <LinearProgress
          variant='determinate'
          value={100}
          sx={{ width: `${successPercent}%`, backgroundColor: theme.palette.grey[200], borderRadius: 1, height: 15 }}
        />
        {/* 失败的进度条（模拟） */}
        <LinearProgress
          variant='determinate'
          value={100}
          sx={{
            width: `${failPercent}%`,
            backgroundColor: 'red',
            height: 15
          }}
        />
      </div>
    </div>

  );
};

export default CustomProgressBar;
