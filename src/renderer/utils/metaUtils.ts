export const metaFirstPicPath = (meta: ProjectMeta) => {
  return `${window.globalState.root_dir}\\${meta.createdAt}\\${meta.indexToSmallFileName[0]}`;
};
