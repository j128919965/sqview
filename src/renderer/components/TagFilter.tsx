import React, { useState } from 'react';
import { Chip, Stack, Typography, Button, Divider } from '@mui/joy';
import { FilterList, Clear } from '@mui/icons-material';

/**
 * 标签筛选器组件
 * 用于在 Viewer 顶部进行多选标签筛选
 * 支持选择多个标签进行筛选，也支持清空筛选
 */
export default (props: {
  availableTags: string[],
  selectedTags: string[],
  onTagsChange: (tags: string[]) => void
}) => {
  const { availableTags, selectedTags, onTagsChange } = props;

  // 切换标签选择状态
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  // 清空所有选择
  const clearAll = () => {
    onTagsChange([]);
  };

  if (availableTags.length === 0) {
    return null;
  }

  return (
    <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px', margin: '16px 0' }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <FilterList />
        <Typography level="title-sm">标签筛选</Typography>
        {selectedTags.length > 0 && (
          <Button
            size="sm"
            variant="outlined"
            color="neutral"
            startDecorator={<Clear />}
            onClick={clearAll}
          >
            清空筛选 ({selectedTags.length})
          </Button>
        )}
      </Stack>
      
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
        {availableTags.map(tag => {
          const isSelected = selectedTags.includes(tag);
          return (
            <Chip
              key={tag}
              variant={isSelected ? "solid" : "outlined"}
              color={isSelected ? "primary" : "neutral"}
              size="sm"
              onClick={() => toggleTag(tag)}
              sx={{ cursor: 'pointer' }}
            >
              {tag}
            </Chip>
          );
        })}
      </Stack>
      
      {selectedTags.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography level="body-sm" color="neutral">
            已选择 {selectedTags.length} 个标签：{selectedTags.join(', ')}
          </Typography>
        </>
      )}
    </div>
  );
};