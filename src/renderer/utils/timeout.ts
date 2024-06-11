export const timeout = <T>(mills: number, action: () => Promise<T>): Promise<T> => {
  return new Promise((res, rej) => {
    setTimeout(() => rej(new Error('timeout')), mills);
    action().then(result => res(result));
  });
};

export const retryAble = <T>(times: number, action: () => Promise<T>): Promise<T> => {
  return new Promise(async (res, rej) => {
    for (let i = 0; i < times; i++) {
      try {
        res(action());
      } catch (e) {
        if (i == times - 1) {
          rej(e);
        }
      }
    }
  });
};
