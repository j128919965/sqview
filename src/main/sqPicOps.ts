import axios, { AxiosError } from 'axios';
import { ipcMain } from 'electron';
import { SqPicUrlHelper } from '../renderer/utils/picDownloader';

const nodeUrl = require('node:url');

const tunnel = require('tunnel');

const getDomain = (url: string): string => {
  const parsedUrl = new nodeUrl.URL(url);
  return parsedUrl.hostname;
};

export class SqPicGetter {
  public async sendRequest(url: string): Promise<Uint8Array | undefined> {
    try {
      const { code, data } = await this.doSendRequest(url);
      if (code === 200) {
        return data;
      }
      if (code === 404) {
        const suffix = SqPicUrlHelper.suffix(url);
        const toggleSuffix = SqPicUrlHelper.toggleSuffix(suffix);
        const newUrl = url.replace(new RegExp(suffix + '$'), toggleSuffix);
        return this.doSendRequest(newUrl).then(({ data }) => {
          return data;
        });
      }
    } catch (e) {
      console.error(e);
    }
    return undefined;
  }

  private async doSendRequest(url: string): Promise<{ code: number; data?: Uint8Array }> {
    console.log(`sending request ${url}`);
    try {
      const response = await axios.get<Uint8Array>(url, {
        responseType: 'arraybuffer',
        timeout: 50000,
        proxy: false,
        httpsAgent: tunnel.httpsOverHttp({
          proxy: {
            host: '127.0.0.1',
            port: 7890
          }
        }),
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'User-Agent': 'Mozilla5.0( Windows NT61;WOw64;rv:47.0) Gecko20100101Firefox/47.0',
          'Host': getDomain(url)
        }
      });
      if (response.status === 200) {
        console.log(`ping ${url} success, getting data...`);
        const blob = response.data; // Convert ArrayBuffer to binary string
        console.log(`send ${url} and get data success!`);
        return { code: 200, data: blob };
      } else {
        return { code: response.status, data: undefined };
      }
    } catch (e) {
      console.error(e);

      if (e instanceof AxiosError) {
        return {code: e.response?.status ?? 500, data: undefined}
      }
      return { code: 500, data: undefined };
    }
  }
}

export const registerSqPicModule = () => {
  ipcMain.handle('sendPicRequest', (e, str: string) => {
    return new SqPicGetter().sendRequest(str);
  });
};
