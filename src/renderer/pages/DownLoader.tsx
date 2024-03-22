import { Home } from "@mui/icons-material"
import { Button, Input, List, ListItem, ListItemContent, ListItemDecorator } from "@mui/joy"
import { useState } from "react"
import { mkdirs, writeFileBytesRenderer } from "../utils/fileUtils"
import { compressImage } from "../utils/imgUtils"
import { SqPicUrlHelper, sendPicRequest } from "../utils/picDownloader"
import { compress, randomUUID } from "../utils/zstdUtils"

export const DownLoader = () => {

  const [logs, setLogs] = useState<string[]>([])


  const [lastUrl, setLastUrl] = useState<string>()

  const [loading, setLoading] = useState(false)


  // useEffect(()=>{
  //   if (!lastUrl) {

  //   }
  // }, [lastUrl])

  const getUrls = async () => {
    if (!lastUrl) {
      return
    }
    const urls = SqPicUrlHelper.urls(lastUrl)
    console.log(urls)
    if (!urls || urls.length == 0) {
      return
    }
    setLoading(true)

    const taskId: number = Date.now()
    const indexToFileName = []
    const indexToSmallFileName = []
    const dirPath = `${window.globalState['root_dir']}\\${taskId}`
    mkdirs(dirPath)


    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      setLogs([...logs, `正在加载第${i + 1}张图片，url： ${url}`])
      const buf: Buffer | undefined = await sendPicRequest(url);
      if (buf) {
        try {
          const compressed = await compress(buf)
          const uuid = randomUUID()
          indexToFileName[i] = uuid
          const path = `${dirPath}\\${uuid}`
          await writeFileBytesRenderer(path, compressed)

          const smallUUID = randomUUID()
          indexToSmallFileName[i] = smallUUID
          const compressedImage = await compressImage(buf);

          const smallImg = await compress(compressedImage!!)
          const smallPath = `${dirPath}\\${smallUUID}`
          await writeFileBytesRenderer(smallPath, smallImg)
          setLogs([...logs, `第${i + 1}张图片，下载成功`])
        } catch (err) {
          indexToFileName[i] = undefined;
          setLogs([...logs, `第${i + 1}张图片，失败，已跳过`])
        }
      } else {
        setLogs([...logs, `第${i + 1}张图片，失败，已跳过`])
      }
    }

    const path = `${dirPath}\\meta.json`
    await writeFileBytesRenderer(path, JSON.stringify({ indexToFileName, indexToSmallFileName }))


  }


  return <>
    <Input value={lastUrl} onChange={(e) => {
      setLastUrl(e.target.value)
    }} />
    <Button onClick={getUrls}>下载</Button>
    {
      <List>
        {
          logs.map((log: string) => <ListItem variant='soft' key={log}>
            <ListItemDecorator> <Home /> </ListItemDecorator>
            <ListItemContent>{log}</ListItemContent>
          </ListItem>
          )
        }
      </List>
    }
  </>
}
