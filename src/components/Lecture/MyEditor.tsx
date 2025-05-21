'use client';

import { withProps } from '@udecode/cn';
import React, { forwardRef, useImperativeHandle } from 'react';

import { Plate, PlateElement } from '@udecode/plate/react';
import { BulletedListPlugin, ListItemPlugin, ListPlugin, NumberedListPlugin } from '@udecode/plate-list/react';

import { Editor } from '@/components/ui/editor';
import { useCreateEditor } from '@/components/editor/use-create-editor';
import { editorPlugins, viewPlugins } from '@/components/editor/plugins/editor-plugins';
import { DndPlugin } from '@udecode/plate-dnd';
import { NodeIdPlugin } from '@udecode/plate-node-id';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { PlaceholderPlugin, VideoPlugin, AudioPlugin } from '@udecode/plate-media/react';
import { MediaVideoElement } from '@/components/ui/media-video-element';

export interface MyEditorRef {
  getValue: () => any;
}

interface MyEditorProps {
  initValue?: any[];
  editable?: boolean;
}

const MyEditor = forwardRef<MyEditorRef, MyEditorProps>(({ initValue, editable = true }, ref) => {
  const editorRef = React.useRef<any>(null);

  if (initValue != undefined) editorRef.current = initValue;

  useImperativeHandle(ref, () => ({
    getValue: () => editorRef.current
  }));

  const editor = useCreateEditor({
    plugins: [...(editable ? editorPlugins : viewPlugins), DndPlugin, NodeIdPlugin, ListPlugin, PlaceholderPlugin.configure({
      options: {
        uploadConfig: {
          video: {
            maxFileSize: "1GB",
            mediaType: VideoPlugin.key,
          },
          audio: {
            maxFileSize: "32MB",
            mediaType: AudioPlugin.key,
          },
        },
        disableEmptyPlaceholder: true,
      },
    }),],
    components: {
      [BulletedListPlugin.key]: withProps(PlateElement, { as: 'ul', className: 'list-disc pl-6 mb-4' }),
      [NumberedListPlugin.key]: withProps(PlateElement, { as: 'ol', className: 'list-decimal pl-6 mb-4' }),
      [ListItemPlugin.key]: withProps(PlateElement, { as: 'li', className: 'mb-1' }),
      [VideoPlugin.key]: MediaVideoElement,
    },
    value: initValue || basicEditorValue,
    readOnly: !editable
  });

  return (
    <div className={`border rounded-lg bg-white shadow-sm flex flex-col ${editable ? 'max-h-[800px]' : ''}`}>
      <DndProvider backend={HTML5Backend}>
        <Plate
          editor={editor}
          onChange={(value) => {
            editorRef.current = value.value;
          }}
        >
          <div className="flex-1 overflow-y-auto">
            <Editor
              placeholder="Type..."
              autoFocus={false}
              spellCheck={false}
              readOnly={!editable}
            />
          </div>
        </Plate>
      </DndProvider>
    </div>
  );
});

export default MyEditor;

export const basicEditorValue = [
  {
    id: '1',
    children: [
      {
        text: '🌳 Trình soạn thảo',
      },
    ],
    type: 'h1',
  },
  {
    id: '2',
    children: [
      {
        text: 'Dễ dàng tạo nội dung của bài giảng với các tính năng đa dạng:',
      },
    ],
    type: 'p',
  },
  {
    id: '3',
    type: BulletedListPlugin.key,
    children: [
      {
        id: '3-1',
        type: ListItemPlugin.key,
        children: [{ text: 'Tiêu đề, mục lục, văn bản & định dạng văn bản & đoạn văn.' }],
      },
      {
        id: '3-2',
        type: ListItemPlugin.key,
        children: [{ text: 'Danh sách, bảng, phương trình toán học, link.' }],
      },
      {
        id: '3-3',
        type: ListItemPlugin.key,
        children: [{ text: 'Hình ảnh, video, âm thanh, file.' }],
      },
      {
        id: '3-4',
        type: ListItemPlugin.key,
        children: [
          { text: '' },
          { text: 'Export', bold: true, italic: true },
          { text: ' & ' },
          { text: 'Import', bold: true, italic: true },
          { text: ' giúp bạn dễ dàng lưu trữ và chia sẻ bài giảng.' }
        ],
      }
    ]
  },
  {
    id: '4',
    type: 'p',
    children: [{ text: '... và các tính năng khác.' }],
  }
];
