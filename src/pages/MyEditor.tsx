'use client';

import { withProps } from '@udecode/cn';

import { Plate, PlateElement, PlateLeaf } from '@udecode/plate/react';

import { Editor, EditorContainer } from '@/components/ui/editor';
import { TodoListElement } from '@/components/ui/todo-list-element';
import { MediaElement } from '@/components/ui/media-element';
import { MediaFileElement } from '@/components/ui/media-file-element';
import { EquationElement } from '@/components/ui/equation-element';
import { InlineEquationElement } from '@/components/ui/inline-equation-element';
import { ImageElement } from '@/components/ui/image-element';
import { useCreateEditor } from '@/components/editor/use-create-editor';
import { editorPlugins } from '@/components/editor/plugins/editor-plugins';
import { DndPlugin } from '@udecode/plate-dnd';
import { NodeIdPlugin } from '@udecode/plate-node-id';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export default function BasicPluginsComponentsDemo() {
  const editor = useCreateEditor({
    plugins: [...editorPlugins, DndPlugin, NodeIdPlugin],
    components: {
      blockquote: withProps(PlateElement, {
        as: 'blockquote',
        className: 'mb-4 border-l-4 border-[#d0d7de] pl-4 text-[#636c76]',
      }),
      bold: withProps(PlateLeaf, { as: 'strong' }),
      h1: withProps(PlateElement, {
        as: 'h1',
        className:
          'mb-4 mt-6 text-3xl font-semibold tracking-tight lg:text-4xl',
      }),
      h2: withProps(PlateElement, {
        as: 'h2',
        className: 'mb-4 mt-6 text-2xl font-semibold tracking-tight',
      }),
      h3: withProps(PlateElement, {
        as: 'h3',
        className: 'mb-4 mt-6 text-xl font-semibold tracking-tight',
      }),
      italic: withProps(PlateLeaf, { as: 'em' }),
      p: withProps(PlateElement, {
        as: 'p',
        className: 'mb-4',
      }),
      underline: withProps(PlateLeaf, { as: 'u' }),
      strikethrough: withProps(PlateLeaf, { as: 's' }),
      highlight: withProps(PlateLeaf, {
        as: 'mark',
        className: 'bg-yellow-200 dark:bg-yellow-800',
      }),
      superscript: withProps(PlateLeaf, { as: 'sup' }),
      subscript: withProps(PlateLeaf, { as: 'sub' }),
      hr: withProps(PlateElement, {
        as: 'hr',
        className: 'my-4 border-t border-gray-300',
      }),
      todo: TodoListElement,
      table: withProps(PlateElement, {
        as: 'table',
        className: 'border-collapse border border-gray-300',
      }),
      tr: withProps(PlateElement, {
        as: 'tr',
        className: 'border border-gray-300',
      }),
      td: withProps(PlateElement, {
        as: 'td',
        className: 'border border-gray-300 p-2',
      }),
      th: withProps(PlateElement, {
        as: 'th',
        className: 'border border-gray-300 p-2 bg-gray-100',
      }),
      img: ImageElement,
      video: MediaElement,
      audio: MediaElement,
      file: MediaFileElement,
      equation: EquationElement,
      inlineEquation: InlineEquationElement,
    },
    value: basicEditorValue,
  });

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="border rounded-lg shadow-sm">
        <DndProvider backend={HTML5Backend}>
          <Plate editor={editor}>
            <div className="p-4">
              <EditorContainer>
                <Editor placeholder="Type..." autoFocus={false} spellCheck={false} />
              </EditorContainer>
            </div>
          </Plate>
        </DndProvider>
      </div>
    </div>
  );
}

export const basicEditorValue = [
  {
    id: '1',
    children: [
      {
        text: '🌳 Blocks',
      },
    ],
    type: 'h1',
  },
  {
    id: '2',
    children: [
      {
        text: 'Easily create headings of various levels, from H1 to H6, to structure your content and make it more organized.',
      },
    ],
    type: 'p',
  },
  {
    id: '3',
    children: [
      {
        text: 'Create blockquotes to emphasize important information or highlight quotes from external sources.',
      },
    ],
    type: 'blockquote',
  },
  {
    id: '1',
    children: [
      {
        text: '🌱 Marks',
      },
    ],
    type: 'h1',
  },
  {
    id: '2',
    children: [
      {
        text: 'Add style and emphasis to your text using the mark plugins, which offers a variety of formatting options.',
      },
    ],
    type: 'p',
  },
  {
    id: '3',
    children: [
      {
        text: 'Make text ',
      },
      {
        bold: true,
        text: 'bold',
      },
      {
        text: ', ',
      },
      {
        italic: true,
        text: 'italic',
      },
      {
        text: ', ',
      },
      {
        text: 'underlined',
        underline: true,
      },
      {
        text: ', or apply a ',
      },
      {
        bold: true,
        italic: true,
        text: 'combination',
        underline: true,
      },
      {
        text: ' of these styles for a visually striking effect.',
      },
    ],
    type: 'p',
  },
];


