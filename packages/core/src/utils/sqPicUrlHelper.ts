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
    return url.slice(0, lastSplitter + 1) + '{}' + url.slice(lastDot);
  }

  static urls(url: string): Array<string> {
    const lastDot = url.lastIndexOf('.');
    const lastSplitter = url.lastIndexOf('/');
    const indexString = url.substring(lastSplitter + 1, lastDot);
    const fillZero = indexString[0] === '0';

    const size = SqPicUrlHelper.size(url);
    const template = SqPicUrlHelper.replaceSizeToTemplate(url);

    function getRealUrl(index: number) {
      const s = (index + 1).toString();
      return fillZero ? s.padStart(indexString.length, '0') : s;
    }

    return Array.from({ length: size }, (_, index) => template.replace('{}', getRealUrl(index)));
  }

  static toggleSuffix(suffix: string): string {
    return suffix === 'jpg' ? 'webp' : 'jpg';
  }
}
