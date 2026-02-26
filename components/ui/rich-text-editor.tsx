'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import { Bold, Italic, Underline as UnderlineIcon, Palette } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
};

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
  minHeight = '96px',
}: RichTextEditorProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, Underline, TextStyle, Color],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'outline-none focus:outline-none',
        'data-placeholder': placeholder ?? '',
      },
    },
  });

  // 外部から value が変わった際（編集モーダル開閉時）に同期
  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  // カラーピッカーのプリセットカラー
  const colors = [
    '#1f2033', // text (デフォルト)
    '#ff5b78', // accent (赤)
    '#7f5dff', // accent2 (紫)
    '#1dcad3', // accent3 (青緑)
    '#1e9d72', // success (緑)
    '#dd8d23', // warn (オレンジ)
    '#d34a57', // danger (赤)
  ];

  if (!editor) return null;

  return (
    <div
      className={cn(
        'rounded-[10px] border-[1.5px] border-border bg-white transition-colors focus-within:border-text',
        className
      )}
    >
      {/* ツールバー */}
      <div className='flex items-center gap-1 border-b border-border px-2 py-1.5'>
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            'rounded p-1.5 text-sub hover:bg-bg',
            editor.isActive('bold') && 'bg-bg text-text'
          )}
          title='太字'
        >
          <Bold size={14} />
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            'rounded p-1.5 text-sub hover:bg-bg',
            editor.isActive('italic') && 'bg-bg text-text'
          )}
          title='斜体'
        >
          <Italic size={14} />
        </button>
        <button
          type='button'
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn(
            'rounded p-1.5 text-sub hover:bg-bg',
            editor.isActive('underline') && 'bg-bg text-text'
          )}
          title='下線'
        >
          <UnderlineIcon size={14} />
        </button>

        {/* カラーピッカー */}
        <div className='relative'>
          <button
            type='button'
            onClick={() => setShowColorPicker(!showColorPicker)}
            className='rounded p-1.5 text-sub hover:bg-bg'
            title='テキスト色'
          >
            <Palette size={14} />
          </button>
          {showColorPicker && (
            <div className='absolute left-0 top-full z-10 mt-1 flex gap-1 rounded-lg border border-border bg-white p-2 shadow-md'>
              {colors.map((color) => (
                <button
                  key={color}
                  type='button'
                  onClick={() => {
                    editor.chain().focus().setColor(color).run();
                    setShowColorPicker(false);
                  }}
                  className='h-5 w-5 rounded-full border-2 border-white ring-1 ring-border hover:ring-text'
                  style={{ backgroundColor: color }}
                />
              ))}
              <button
                type='button'
                onClick={() => {
                  editor.chain().focus().unsetColor().run();
                  setShowColorPicker(false);
                }}
                className='rounded px-1 text-xs text-sub hover:bg-bg'
              >
                解除
              </button>
            </div>
          )}
        </div>
      </div>

      {/* エディター本体 */}
      <div
        className='relative px-3 py-2 text-sm text-text'
        style={{ minHeight }}
        onClick={() => editor.commands.focus()}
      >
        {/* placeholder 表示 (エディターが空の時のみ) */}
        {editor.isEmpty && placeholder && (
          <div className='pointer-events-none absolute left-3 top-2 text-sm text-muted'>
            {placeholder}
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
