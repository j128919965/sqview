export const timeout = <T>(mills: number, action: () => Promise<T>): Promise<T> => {
  return new Promise((res, rej) => {
    setTimeout(() => rej(new Error('timeout')), mills);
    action().then(result => res(result));
  });
};
