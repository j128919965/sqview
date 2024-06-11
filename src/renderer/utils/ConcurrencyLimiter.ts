export default class ConcurrencyLimiter {
  private readonly maxConcurrent: number;
  private currentConcurrent = 0;
  private readonly queue = new Array<() => Promise<void>>();

  constructor(maxConcurrent: number) {
    if (maxConcurrent <= 0) {
      throw new Error('maxConcurrent must be a positive integer');
    }
    this.maxConcurrent = maxConcurrent;
  }

  // 尝试执行任务，如果当前并发量未达到上限，则立即执行；否则加入队列等待
  async execute<T>(realTask: () => Promise<T>): Promise<T> {
    return new Promise<T>(async (resolve, reject) => {
      // 封装任务以处理错误，并确保dequeue被调用
      const wrappedTask = async () => {
        try {
          this.currentConcurrent++;
          const result = await realTask();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.currentConcurrent--;
          this.dequeue();
        }
      };

      // 如果当前并发量未达到上限，则直接执行
      if (this.currentConcurrent < this.maxConcurrent) {
        wrappedTask().catch(console.error); // 错误处理，确保不会阻塞队列
      } else {
        // 否则加入队列等待
        this.queue.push(wrappedTask);
      }
    });
  }

  // 从队列中取出并立即执行一个任务（如果有的话）
  private dequeue() {
    if (this.queue.length > 0 && this.currentConcurrent < this.maxConcurrent) {
      const task = this.queue.shift()!;
      task().catch(console.error); // 错误处理，确保不会阻塞队列
    }
  }
}
