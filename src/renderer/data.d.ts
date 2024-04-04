interface ProjectMeta {
  indexToFileName: string[],
  indexToSmallFileName: string[],
  createdAt: number,
  name: string,
  lastOpen: number,
  artist?: string,
  tags?: string[],
  hide?: boolean
}
