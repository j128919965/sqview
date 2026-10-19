import React, { useState } from 'react';
import { Chip, Stack } from '@mui/joy';
import { Close } from '@mui/icons-material';
import EditableText from './EditableText';

/**
 * 标签管理组件
 * 用于在 PreviewCard 的 contextMenu 中配置标签
 * 支持从已有标签中选择或新建标签
 */
export default (props: {
  currentTags: string[],
  availableTags: string[],
  onTagsChange: (tags: string[]) => void
}) => {
  const { currentTags, availableTags, onTagsChange } = props;
  const [selectedTags, setSelectedTags] = useState<string[]>(currentTags || []);

  // 添加标签
  const addTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      const newTags = [...selectedTags, tag];
      setSelectedTags(newTags);
      onTagsChange(newTags);
    }
  };

  // 移除标签
  const removeTag = (tag: string) => {
    const newTags = selectedTags.filter(t => t !== tag);
    setSelectedTags(newTags);
    onTagsChange(newTags);
  };

  // 获取可选择的标签（排除已选择的）
  const selectableTags = availableTags.filter(tag => !selectedTags.includes(tag));

  return (
    <div style={{ padding: '4px', minWidth: '200px', maxWidth: '300px' }}>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 1 }}>
        {/* 已选择的标签 - 高亮显示，右上角有叉 */}
        {selectedTags.map(tag => (
          <Chip
            key={tag}
            variant="solid"
            color="primary"
            size="sm"
            endDecorator={<Close fontSize="small" />}
            onClick={() => removeTag(tag)}
            sx={{ cursor: 'pointer' }}
          >
            {tag}
          </Chip>
        ))}
        
        {/* 未选择的标签 - 普通显示，点击选中 */}
        {selectableTags.map(tag => (
          <Chip
            key={tag}
            variant="outlined"
            color="neutral"
            size="sm"
            onClick={() => addTag(tag)}
            sx={{ cursor: 'pointer' }}
          >
            {tag}
          </Chip>
        ))}
      </Stack>

      {/* 新建标签 - 使用 EditableText */}
      <EditableText
        placeHolder="新建标签"
        onSave={async (tagName: string) => {
          const trimmedTag = tagName.trim();
          if (trimmedTag) {
            addTag(trimmedTag);
          }
        }}
      />
    </div>
  );
};