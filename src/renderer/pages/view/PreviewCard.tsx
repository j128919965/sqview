import React, { useState } from 'react';
import { Card, Typography } from '@mui/joy';
import EditableText from '../../components/EditableText';
import Image from '../../components/Image';
import { Delete, Person, VisibilityOff, Label } from '@mui/icons-material';
import { metaFirstPicPath } from '../../utils/metaUtils';
import { MenuItemData, ProjectIndexData, ProjectMeta } from '../../data';
import MenuContainer from '../../components/MenuContainer';
import Toast from '../../components';
import TagManager from '../../components/TagManager';

export default (props: {
  md: ProjectIndexData,
  updateMeta: (md: ProjectIndexData, refreshList: boolean) => Promise<void>,
  selectMd: (md: ProjectIndexData) => void,
  deleteMd: (md: ProjectIndexData) => void,
  allTags: string[]
}) => {

  const { updateMeta, selectMd, deleteMd, allTags } = props;
  const [md, setMd] = useState<ProjectIndexData>(props.md);

  const updateMd = async (refreshList: boolean) => {
    await updateMeta(md, refreshList);
    setMd({ ...md });
  };

  const menu: MenuItemData[] = [
    {
      icon: <Person />,
      content: <div style={{ display: 'flex', alignItems: 'center' }}>
        <span>作者：</span>
        <EditableText defaultValue={md.artist}
                      placeHolder='请输入作者'
                      onSave={async str => {
                        md.artist = str;
                        await updateMd(true);
                      }} /></div>
    },
    {
      icon: <Label />,
      content: <TagManager
        currentTags={md.tags || []}
        availableTags={allTags}
        onTagsChange={async (tags) => {
          md.tags = tags;
          await updateMd(true);
        }}
      />,
      notCloseAfterClick: true
    },
    {
      icon: <VisibilityOff />,
      content: md.hide ? '取消隐藏' : '隐藏此项',
      onClick: async () => {
        md.hide = !md.hide;
        await updateMeta(md, true);
      }
    },
    {
      icon: <Delete />,
      content: '删除',
      ignore: !md.hide,
      onClick: async () => {
        const doDelete = await Toast.confirm('删除确认', <div style={{display: 'flex', flexDirection: 'column', alignItems:'center'}}>
          <span>确定要删除 "{md.name}" {md.artist ? <span>(作者：{md.artist}) </span> : ''} 吗 </span>
          <div style={{height: 20}}/>
          <Image fd={md.previewImage} fileType='dataUrl' height={228} width={160} />
        </div>)
        if (doDelete) {
          deleteMd(md)
        }
      }
    }
  ];

  return <MenuContainer menu={menu}>
    <Card sx={{ width: 160 }}>
      <div>
        <EditableText defaultValue={md.name} onSave={async str => {
          md.name = str;
          await updateMd(false);
        }} />
        <Typography level='body-sm'>{new Date(md.createdAt).toLocaleString()}</Typography>
      </div>
      <div style={{ width: 160, display: 'flex', justifyContent: 'center' }}
           className='p-v-showbtn'
           onClick={async () => {
             selectMd(md);
             md.lastOpen = Date.now();
             await updateMeta(md, true);
           }}
      >
        <Image fd={md.previewImage} fileType='dataUrl' height={228} width={160} />
      </div>
    </Card>

  </MenuContainer>;
};
