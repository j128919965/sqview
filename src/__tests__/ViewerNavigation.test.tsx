import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Viewer } from '../renderer/pages/view/Viewer';
import { ProjectIndexData, ProjectMeta } from '../renderer/data';
import * as metaUtils from '../renderer/utils/metaUtils';
import { getViewerConfig } from '../renderer/utils/fileUtils';

jest.mock('../renderer/utils/metaUtils', () => ({
  ...jest.requireActual('../renderer/utils/metaUtils'),
  loadIndex: jest.fn(), loadAllMetas: jest.fn(), saveIndex: jest.fn(), updateSingleMeta: jest.fn(),
}));
jest.mock('../renderer/utils/fileUtils', () => ({ getViewerConfig: jest.fn(), updateViewerConfig: jest.fn() }));
jest.mock('../renderer/pages/view/PreviewCard', () => ({ md, selectMd, updateMeta }: {
  md: ProjectIndexData; selectMd: (value: ProjectIndexData) => void;
  updateMeta: (value: ProjectIndexData, refresh: boolean) => Promise<void>;
}) => <button type='button' onClick={() => { selectMd(md); md.lastOpen = Date.now(); updateMeta(md, true); }}>{md.name}</button>);
jest.mock('../renderer/pages/view/DetailView', () => ({ md, onNextAlbum }: { md: ProjectMeta; onNextAlbum?: () => void }) =>
  <div><span>正在阅读 {md.name}</span><button type='button' disabled={!onNextAlbum} onClick={onNextAlbum}>下一图集</button></div>);
jest.mock('../renderer/components/TagFilter', () => () => <div />);

beforeEach(() => {
  jest.clearAllMocks();
  window.globalState = { root_dir: '/library', path_sep: '/' };
  const albums: ProjectMeta[] = ['A', 'Hidden', 'C', 'D'].map((name, position) => ({
    name, createdAt: position + 1, lastOpen: 10 - position, hide: name === 'Hidden',
    tags: name === 'A' ? ['a', 'z'] : ['z'], indexToFileName: ['page'], indexToSmallFileName: [],
  }));
  (metaUtils.loadIndex as jest.Mock).mockResolvedValue(albums.map(album => ({ ...album })));
  (metaUtils.loadAllMetas as jest.Mock).mockResolvedValue(albums);
  (metaUtils.saveIndex as jest.Mock).mockResolvedValue(undefined);
  (metaUtils.updateSingleMeta as jest.Mock).mockResolvedValue(undefined);
  (getViewerConfig as jest.Mock).mockResolvedValue({ grouping: 'none', dirShow: 'id', hideMode: 'hide' });
});

it('keeps the original visible order even when reading changes last-open sorting', async () => {
  render(<Viewer />);
  fireEvent.click(await screen.findByRole('button', { name: 'A' }));
  await screen.findByText('正在阅读 A');
  fireEvent.click(screen.getByRole('button', { name: '下一图集' }));
  await screen.findByText('正在阅读 C');
  fireEvent.click(screen.getByRole('button', { name: '下一图集' }));
  await screen.findByText('正在阅读 D');
  expect(screen.getByRole('button', { name: '下一图集' })).toBeDisabled();
});

it('does not repeat an album that appears in multiple tag groups', async () => {
  (getViewerConfig as jest.Mock).mockResolvedValue({ grouping: 'tags', dirShow: 'id', hideMode: 'hide' });
  render(<Viewer />);
  await waitFor(() => expect(screen.getAllByRole('button', { name: 'A' })).toHaveLength(2));
  fireEvent.click((await screen.findAllByRole('button', { name: 'A' }))[0]);
  await screen.findByText('正在阅读 A');
  fireEvent.click(screen.getByRole('button', { name: '下一图集' }));
  await screen.findByText('正在阅读 C');
});
