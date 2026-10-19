import React from 'react';
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import DetailView from '../renderer/pages/view/DetailView';
import { dataUrlCache } from '../renderer/utils/cache/dataUrlCache';
import { ProjectMeta } from '../renderer/data';
import { imageSize, turnPageForWheel, WheelGesture } from '../renderer/pages/view/readerUtils';

jest.mock('../renderer/utils/cache/dataUrlCache', () => ({ dataUrlCache: { get: jest.fn() } }));

const meta: ProjectMeta = {
  createdAt: 1, lastOpen: 1, name: '测试图集',
  indexToFileName: Array.from({ length: 300 }, (_, page) => `image-${page}`),
  indexToSmallFileName: [],
};

const bounds = (top: number, width = 800, height = 600) => ({
  top, bottom: top + height, left: 0, right: width, width, height, x: 0, y: top, toJSON: () => ({}),
});

beforeAll(() => {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof IntersectionObserver;
  jest.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(800);
  jest.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(600);
  jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function getBounds(this: HTMLElement) {
    if (this.dataset.readerPage !== undefined) {
      const siblings = Array.from(this.parentElement!.children) as HTMLElement[];
      const top = siblings.slice(0, Number(this.dataset.readerPage)).reduce((sum, element) => sum + parseFloat(element.style.height) + 16, 16);
      return bounds(top - this.closest('.p-d-main')!.scrollTop, parseFloat(this.style.width), parseFloat(this.style.height));
    }
    return bounds(0);
  });
});

beforeEach(() => {
  window.globalState = { root_dir: '/library', path_sep: '/' };
  (dataUrlCache.get as jest.Mock).mockResolvedValue('data:image/png;base64,AAAA');
});

function openReader(extra: Partial<React.ComponentProps<typeof DetailView>> = {}) {
  return render(<DetailView md={meta} defaultDirShow='id' onChangeDirShow={jest.fn()} onCloseDetail={jest.fn()} {...extra} />);
}

function jump(page: number) {
  fireEvent.change(screen.getByRole('spinbutton', { name: '页码' }), { target: { value: String(page) } });
  fireEvent.submit(screen.getByRole('spinbutton', { name: '页码' }).closest('form')!);
}

function expectPageAligned(page: number) {
  const element = document.querySelector<HTMLElement>(`[data-reader-page="${page - 1}"]`)!;
  expect(element.getBoundingClientRect().top).toBeCloseTo(16);
  expect(screen.getByRole('spinbutton', { name: '页码' })).toHaveValue(page);
}

it('keeps the current page when switching modes and supports distant jumps in both directions', async () => {
  openReader();
  jump(150);
  fireEvent.click(screen.getByRole('button', { name: '滚动' }));
  expectPageAligned(150);
  for (const page of [290, 3, 300, 1, 200]) {
    fireEvent.click(screen.getByRole('button', { name: `跳到第 ${page} 页` }));
    expectPageAligned(page);
    expect(document.querySelectorAll('[data-reader-page]')).toHaveLength(300);
  }
  fireEvent.click(screen.getByRole('button', { name: '翻页' }));
  expect(screen.getByRole('spinbutton', { name: '页码' })).toHaveValue(200);
  fireEvent.click(screen.getByRole('button', { name: '滚动' }));
  expectPageAligned(200);
  await screen.findByAltText('第 200 页');
});

it('reanchors the destination after a tall image loads and updates the current page on manual scroll', async () => {
  openReader();
  fireEvent.click(screen.getByRole('button', { name: '适应宽度' }));
  fireEvent.click(screen.getByRole('button', { name: '滚动' }));
  jump(250);
  const image = await screen.findByAltText('第 250 页');
  Object.defineProperties(image, { naturalWidth: { value: 1000 }, naturalHeight: { value: 6000 } });
  fireEvent.load(image);
  expectPageAligned(250);
  const viewport = screen.getByLabelText('阅读区域');
  fireEvent.wheel(viewport, { deltaY: -10 });
  const previous = document.querySelector<HTMLElement>('[data-reader-page="20"]')!;
  viewport.scrollTop += previous.getBoundingClientRect().top - 16;
  fireEvent.scroll(viewport);
  await waitFor(() => expect(screen.getByRole('spinbutton', { name: '页码' })).toHaveValue(21));
});

it('zooms, fits images, validates page input, and leaves typing and the sidebar independent of page turning', async () => {
  const close = jest.fn();
  openReader({ onCloseDetail: close });
  fireEvent.click(screen.getByRole('button', { name: '放大' }));
  expect(screen.getByLabelText('缩放比例')).toHaveTextContent('110%');
  fireEvent.click(screen.getByRole('button', { name: '适应宽度' }));
  expect(screen.getByLabelText('缩放比例')).toHaveTextContent('100%');
  const image = await screen.findByAltText('第 1 页');
  expect(image).toHaveStyle({ width: '768px' });
  jump(7);
  fireEvent.keyDown(screen.getByRole('spinbutton', { name: '页码' }), { key: 'Home' });
  expect(screen.getByRole('spinbutton', { name: '页码' })).toHaveValue(7);
  jump(999);
  expect(document.title).toContain('第 7 / 300 页');
  fireEvent.wheel(screen.getByLabelText('页面目录'), { deltaY: 200 });
  expect(document.title).toContain('第 7 / 300 页');
  fireEvent.keyDown(screen.getByLabelText('阅读区域'), { key: 'ArrowRight' });
  expect(screen.getByRole('spinbutton', { name: '页码' })).toHaveValue(8);
  fireEvent.keyDown(screen.getByLabelText('阅读区域'), { key: 'Escape' });
  expect(close).toHaveBeenCalledTimes(1);
  await act(async () => {});
});

it('preserves the reading mode and zoom while starting the next album at page one', async () => {
  const view = openReader();
  fireEvent.click(screen.getByRole('button', { name: '滚动' }));
  fireEvent.click(screen.getByRole('button', { name: '放大' }));
  jump(200);
  view.rerender(<DetailView md={{ ...meta, createdAt: 2, name: '下一本' }} defaultDirShow='id' onChangeDirShow={jest.fn()} onCloseDetail={jest.fn()} />);
  expectPageAligned(1);
  expect(screen.getByLabelText('缩放比例')).toHaveTextContent('110%');
  expect(screen.getByRole('button', { name: '下一图集' })).toBeDisabled();
  await screen.findByAltText('第 1 页');
});

it('turns once per touchpad gesture, including inertia, and requires a fresh gesture after scrolling a tall image', () => {
  const gesture: WheelGesture = { lastTime: 0, delta: 0, turned: false, scrolled: false };
  const turns = Array.from({ length: 20 }, (_, event) => turnPageForWheel(gesture, { deltaY: 20, deltaMode: 0, timeStamp: 1000 + event * 30 }, false, 600));
  expect(turns.reduce((sum, turn) => sum + turn, 0)).toBe(1);
  expect(turnPageForWheel(gesture, { deltaY: 100, deltaMode: 0, timeStamp: 2000 }, false, 600)).toBe(1);
  expect(turnPageForWheel(gesture, { deltaY: 100, deltaMode: 0, timeStamp: 3000 }, true, 600)).toBe(0);
  expect(turnPageForWheel(gesture, { deltaY: 100, deltaMode: 0, timeStamp: 3030 }, false, 600)).toBe(0);
  expect(turnPageForWheel(gesture, { deltaY: -4, deltaMode: 1, timeStamp: 4000 }, false, 600)).toBe(-1);
});

it('keeps the aspect ratio when fitting the viewport or width and when zooming', () => {
  const dimensions = { width: 1000, height: 2000 };
  expect(imageSize(dimensions, { width: 800, height: 600 }, 'page', 1)).toEqual({ width: 300, height: 600 });
  expect(imageSize(dimensions, { width: 800, height: 600 }, 'width', 1.5)).toEqual({ width: 1200, height: 2400 });
});
