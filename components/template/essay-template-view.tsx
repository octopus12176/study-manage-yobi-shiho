'use client';

import { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Chip } from '@/components/ui/chip';
import { createEssayTemplateAction, deleteEssayTemplateAction } from '@/app/template/actions';
import { SUBJECTS } from '@/lib/constants';
import type { EssayTemplateRow } from '@/lib/supabase/queries';

type EssayTemplateViewProps = {
  templates: EssayTemplateRow[];
};

const ALL_SUBJECT = 'all';

export function EssayTemplateView({ templates: initialTemplates }: EssayTemplateViewProps) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [filterSubject, setFilterSubject] = useState(ALL_SUBJECT);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedCardIds, setExpandedCardIds] = useState<Set<string>>(new Set());

  // フォーム状態
  const [formData, setFormData] = useState<{
    subject: string;
    title: string;
    template: string;
    norm: string;
    pitfall: string;
  }>({
    subject: SUBJECTS[0] as string,
    title: '',
    template: '',
    norm: '',
    pitfall: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // フィルタリング
  const filteredTemplates =
    filterSubject === ALL_SUBJECT
      ? templates
      : templates.filter((t) => t.subject === filterSubject);

  const handleFilterChange = (subject: string) => {
    setFilterSubject(subject);
  };

  const handleToggleExpand = (id: string) => {
    const newExpanded = new Set(expandedCardIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCardIds(newExpanded);
  };

  const handleOpenModal = () => {
    setFormData({
      subject: SUBJECTS[0],
      title: '',
      template: '',
      norm: '',
      pitfall: '',
    });
    setSubmitError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSubmitError('');
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const result = await createEssayTemplateAction(formData);

      if (result.ok) {
        // ページをリロードして新しいデータを取得
        window.location.reload();
      } else {
        setSubmitError(result.message || 'エラーが発生しました。');
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '保存に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('このテンプレを削除しますか？')) {
      return;
    }

    try {
      const result = await deleteEssayTemplateAction(id);
      if (result.ok) {
        setTemplates(templates.filter((t) => t.id !== id));
      }
    } catch (error) {
      console.error('削除エラー:', error);
    }
  };

  return (
    <>
      {/* ボタンとフィルター */}
      <div className='flex flex-col gap-4'>
        <Button onClick={handleOpenModal} className='w-fit'>
          ＋ テンプレ追加
        </Button>

        {/* フィルターチップ */}
        <div className='flex flex-wrap gap-2'>
          <Chip
            label='すべて'
            active={filterSubject === ALL_SUBJECT}
            onClick={() => handleFilterChange(ALL_SUBJECT)}
          />
          {SUBJECTS.map((subject) => (
            <Chip
              key={subject}
              label={subject}
              active={filterSubject === subject}
              onClick={() => handleFilterChange(subject)}
            />
          ))}
        </div>
      </div>

      {/* テンプレカードリスト */}
      <div className='space-y-3'>
        {filteredTemplates.length === 0 ? (
          <div className='flex h-32 items-center justify-center rounded-lg border border-border bg-bg text-sub'>
            テンプレがまだありません。「＋ テンプレ追加」で登録しましょう。
          </div>
        ) : (
          filteredTemplates.map((template) => {
            const isExpanded = expandedCardIds.has(template.id);
            return (
              <div
                key={template.id}
                className='overflow-hidden rounded-lg border border-border bg-white transition-all hover:border-text hover:shadow-md'
              >
                {/* ヘッダー（クリック可能） */}
                <button
                  type='button'
                  onClick={() => handleToggleExpand(template.id)}
                  className='flex w-full items-center justify-between px-5 py-4 text-left'
                >
                  <div className='flex items-center gap-3 flex-1'>
                    <span className='inline-flex rounded bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent'>
                      {template.subject}
                    </span>
                    <span className='font-semibold text-text'>{template.title}</span>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* 展開部分 */}
                {isExpanded && (
                  <div className='border-t border-border bg-bg px-5 py-4 space-y-4'>
                    {template.template && (
                      <div>
                        <div className='text-xs font-semibold uppercase tracking-wider text-sub mb-2'>
                          論点テンプレ（要件・フロー）
                        </div>
                        <div className='whitespace-pre-wrap rounded bg-white p-3 text-sm text-text border border-border'>
                          {template.template}
                        </div>
                      </div>
                    )}

                    {template.norm && (
                      <div>
                        <div className='text-xs font-semibold uppercase tracking-wider text-sub mb-2'>
                          自分の言葉での規範
                        </div>
                        <div className='whitespace-pre-wrap rounded bg-white p-3 text-sm text-text border border-border'>
                          {template.norm}
                        </div>
                      </div>
                    )}

                    {template.pitfall && (
                      <div>
                        <div className='text-xs font-semibold uppercase tracking-wider text-sub mb-2'>
                          落とし穴・注意点
                        </div>
                        <div className='whitespace-pre-wrap rounded bg-white p-3 text-sm text-text border border-border'>
                          {template.pitfall}
                        </div>
                      </div>
                    )}

                    {/* 削除ボタン */}
                    <div className='flex justify-end pt-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        削除
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* モーダル */}
      {isModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm'>
          <div className='w-full max-w-2xl rounded-2xl border border-border bg-white p-6 shadow-2xl'>
            {/* モーダルヘッダー */}
            <div className='mb-6 flex items-center justify-between'>
              <h2 className='text-lg font-bold text-text'>論文テンプレを追加</h2>
              <button
                type='button'
                onClick={handleCloseModal}
                className='rounded-lg bg-bg p-2 transition-colors hover:bg-border'
              >
                <X size={18} className='text-sub' />
              </button>
            </div>

            {/* エラーメッセージ */}
            {submitError && (
              <div className='mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200'>
                {submitError}
              </div>
            )}

            {/* フォーム */}
            <form onSubmit={handleSaveTemplate} className='space-y-4'>
              {/* 科目・論点名（2カラム） */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='subject'>科目</Label>
                  <select
                    id='subject'
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className='mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20'
                  >
                    {SUBJECTS.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor='title'>論点名</Label>
                  <Input
                    id='title'
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder='例: 処分性の判断基準'
                    className='mt-2'
                  />
                </div>
              </div>

              {/* 論点テンプレ */}
              <div>
                <Label htmlFor='template'>論点テンプレ（要件・フロー）</Label>
                <Textarea
                  id='template'
                  value={formData.template}
                  onChange={(e) =>
                    setFormData({ ...formData, template: e.target.value })
                  }
                  placeholder='①〜であること&#10;②〜の要件を満たすこと'
                  rows={4}
                  className='mt-2'
                />
              </div>

              {/* 自分の言葉での規範 */}
              <div>
                <Label htmlFor='norm'>自分の言葉での規範</Label>
                <Textarea
                  id='norm'
                  value={formData.norm}
                  onChange={(e) =>
                    setFormData({ ...formData, norm: e.target.value })
                  }
                  placeholder='自分の言葉で規範を書く（記憶・定着用）'
                  rows={3}
                  className='mt-2'
                />
              </div>

              {/* 落とし穴・注意点 */}
              <div>
                <Label htmlFor='pitfall'>落とし穴・注意点</Label>
                <Textarea
                  id='pitfall'
                  value={formData.pitfall}
                  onChange={(e) =>
                    setFormData({ ...formData, pitfall: e.target.value })
                  }
                  placeholder='試験でよく間違える点・例外etc.'
                  rows={2}
                  className='mt-2'
                />
              </div>

              {/* フッターボタン */}
              <div className='flex justify-end gap-3 border-t border-border pt-4'>
                <Button
                  type='button'
                  variant='secondary'
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                >
                  キャンセル
                </Button>
                <Button
                  type='submit'
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '保存中...' : '保存する'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
