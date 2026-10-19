import React from 'react';
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import Image from '../renderer/components/Image';
import { dataUrlCache } from '../renderer/utils/cache/dataUrlCache';

jest.mock('../renderer/utils/cache/dataUrlCache', () => ({ dataUrlCache: { get: jest.fn(), delete: jest.fn() } }));

beforeEach(() => jest.clearAllMocks());

it('ignores an old image request that completes after the next page', async () => {
  const pending: Record<string, (url: string) => void> = {};
  (dataUrlCache.get as jest.Mock).mockImplementation(path => new Promise(resolve => { pending[path] = resolve; }));
  const view = render(<Image fd='A' fileType='blob' alt='reader' />);
  view.rerender(<Image fd='B' fileType='blob' alt='reader' />);
  await act(async () => pending.B('data:image/png;base64,B'));
  await act(async () => pending.A('data:image/png;base64,A'));
  expect(screen.getByAltText('reader')).toHaveAttribute('src', 'data:image/png;base64,B');
});

it('shows an error and retries a failed file read', async () => {
  (dataUrlCache.get as jest.Mock).mockResolvedValueOnce(undefined).mockResolvedValueOnce('data:image/png;base64,success');
  render(<Image fd='A' fileType='blob' alt='reader' />);
  fireEvent.click(await screen.findByRole('button', { name: '加载失败，重试' }));
  expect(await screen.findByAltText('reader')).toHaveAttribute('src', 'data:image/png;base64,success');
});
