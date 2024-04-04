const ffmpeg = require('fluent-ffmpeg');
import fs from 'node:fs';
import { MediaPlaylist } from 'hls-parser/types';
import { exec } from 'node:child_process';

import { parse } from 'hls-parser';

// 假设你有一个加密函数
function encryptData(data: Uint8Array): Uint8Array {
  // TODO encrypt
  return data;
}

// MP4文件路径
const mp4FilePath = 'G:\\BaiduNetdiskDownload\\挑战\\挑战.mp4';
// 输出M3U8播放列表的路径
const m3u8OutputPath = 'G:\\BaiduNetdiskDownload\\挑战\\挑战.m3u8';
// 输出TS片段的目录
const tsSegmentsDir = 'G:\\BaiduNetdiskDownload\\挑战\\';

const splitAndCompress = (path: string, distPath: string)=>{

}

const test = () => {
  exec(`ffmpeg -i ${mp4FilePath} -c:v libx264 -c:a aac -hls_list_size 0 -hls_time 30 -hls_segment_filename ${tsSegmentsDir}output_%03d.ts ${m3u8OutputPath}`,
    (error, stdout, stderr)=> {
      if (error != null) {

      }
    })
};

export default test;
