import { ProjectIndexData, ProjectMeta } from '@sqview/core/dist/types/data';
import { generateIndex as coreGenerateIndex, grouping as coreGrouping, metaFirstPicPath as coreMetaFirstPicPath } from '@sqview/core/dist/utils/metaUtils';
import { LibraryService } from '@sqview/core/dist/services/LibraryService';
import { ElectronFileSystem } from '../services/implementations';

export const metaFirstPicPath = (meta: ProjectMeta) => {
    const sep = window.globalState.path_sep;
    const root = window.globalState.root_dir;
    if (!sep || !root) return undefined;
    return coreMetaFirstPicPath(meta, root, sep);
};

export const loadAllMetas = async (): Promise<ProjectMeta[]> => {
    const root = window.globalState.root_dir;
    const sep = window.globalState.path_sep;
    if (!root || !sep) throw new Error('root dir not choosed');

    const fs = new ElectronFileSystem(sep);
    const service = new LibraryService(fs);
    return service.loadAllMetas(root);
};

export const loadIndex = async (): Promise<ProjectIndexData[] | undefined> => {
    const root = window.globalState.root_dir;
    const sep = window.globalState.path_sep;
    if (!root || !sep) throw new Error('root dir not choosed');

    const fs = new ElectronFileSystem(sep);
    const service = new LibraryService(fs);
    return service.loadIndex(root);
}

export const generateIndex = (mdList: ProjectMeta[]) : ProjectIndexData[] => {
    const root = window.globalState.root_dir;
    const sep = window.globalState.path_sep;
    if (!root || !sep) throw new Error('root dir not choosed');
    return coreGenerateIndex(mdList, root, sep);
}

export const saveIndex = async (index: ProjectIndexData[]) => {
    const root = window.globalState.root_dir;
    const sep = window.globalState.path_sep;
    if (!root || !sep) throw new Error('root dir not choosed');

    const fs = new ElectronFileSystem(sep);
    const service = new LibraryService(fs);
    return service.saveIndex(index, root);
};

export const updateSingleMeta = async (md: ProjectMeta) => {
    const root = window.globalState.root_dir;
    const sep = window.globalState.path_sep;
    if (!root || !sep) throw new Error('root dir not choosed');

    const fs = new ElectronFileSystem(sep);
    const service = new LibraryService(fs);
    return service.updateSingleMeta(md, root);
};

export const deleteSingleMeta = async (mdId: number) => {
    const root = window.globalState.root_dir;
    const sep = window.globalState.path_sep;
    if (!root || !sep) throw new Error('root dir not choosed');

    const fs = new ElectronFileSystem(sep);
    const service = new LibraryService(fs);
    return service.deleteSingleMeta(mdId, root);
}

export const grouping = coreGrouping;
