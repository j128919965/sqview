import React, { useState } from 'react';
import { Card, Typography } from '@mui/joy';
import EditableText from '../../components/EditableText';
import Image from '../../components/Image';
import { Person, VisibilityOff } from '@mui/icons-material';
import { metaFirstPicPath } from '../../utils/metaUtils';
import { MenuItemData, ProjectMeta } from '../../data';
import MenuContainer from '../../components/MenuContainer';

export default (props: {
  md: ProjectMeta,
  updateMeta: (md: ProjectMeta, refreshList: boolean) => Promise<void>,
  selectMd: (md: ProjectMeta) => void
}) => {

  const { updateMeta, selectMd } = props;
  const [md, setMd] = useState<ProjectMeta>(props.md);

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
      icon: <VisibilityOff />,
      content: md.hide ? '取消隐藏' : '隐藏此项',
      onClick: async () => {
        md.hide = !md.hide;
        await updateMeta(md, true);
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
             await updateMeta(md, false);
           }}
      >
        <Image fd={metaFirstPicPath(md)} fileType='dataUrl' height={228} width={160} />
      </div>
    </Card>
  </MenuContainer>;
};
