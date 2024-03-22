

export class SqPicUrlHelper {
  static suffix(url: string): string {
    return url.split('.').pop() ?? '';
  }

  static size(url: string): number {
    const lastDot = url.lastIndexOf('.');
    const lastSplitter = url.lastIndexOf('/');
    return parseInt(url.substring(lastSplitter + 1, lastDot));
  }

  static replaceSizeToTemplate(url: string): string {
    const lastDot = url.lastIndexOf('.');
    const lastSplitter = url.lastIndexOf('/');
    return url.slice(0, lastSplitter + 1) + "{}" + url.slice(lastDot);
  }

  static urls(url: string): Array<string> {
    const size = SqPicUrlHelper.size(url);
    const template = SqPicUrlHelper.replaceSizeToTemplate(url);
    return Array.from({ length: size }, (_, index) => template.replace("{}", (index + 1).toString()));
  }

  static toggleSuffix(suffix: string): string {
    return suffix === "jpg" ? "png" : "jpg";
  }
}

export const sendPicRequest = async (str: string): Promise<Buffer | undefined> => {
  return window.electron.ipcRenderer
    .invoke('sendPicRequest', str)
    .catch(err => {
      console.error(err)
      return undefined
    })
}
