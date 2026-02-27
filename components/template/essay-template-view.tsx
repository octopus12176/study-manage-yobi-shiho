'use client';

import { useState } from 'react';
import { X, ChevronDown, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Chip } from '@/components/ui/chip';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import {
  createEssayTemplateAction,
  deleteEssayTemplateAction,
  updateEssayTemplateAction,
} from '@/app/template/actions';
import { SUBJECTS } from '@/lib/constants';
import { sanitizeHtml } from '@/lib/sanitize';
import type { EssayTemplateRow } from '@/lib/supabase/queries';

type EssayTemplateViewProps = {
  templates: EssayTemplateRow[];
};

const ALL_SUBJECT = 'all';
const ALL_RANK = 'all';
const RANKS = ['A', 'B', 'C'] as const;

// 科目ごとの色マッピング
const SUBJECT_COLOR_MAP: Record<string, string> = {
  '憲法': 'text-accent',           // 現在の色のまま
  '行政法': 'text-red-600',
  '民法': 'text-blue-600',
  '商法': 'text-amber-600',
  '民訴法': 'text-green-600',
  '刑法': 'text-purple-600',
  '刑訴法': 'text-pink-600',
  '実務基礎': 'text-teal-600',
};

// 科目に応じた色クラスを取得
function getSubjectColorClass(subject: string): string {
  return SUBJECT_COLOR_MAP[subject] || 'text-accent';
}

// ヘルパー関数: HTMLか plain text かを判別して表示
function renderContent(content: string | null): React.ReactNode {
  if (!content) return null;
  // HTML タグで始まる場合はリッチテキストとしてレンダリング
  const isHtml = content.trimStart().startsWith('<');
  if (isHtml) {
    return (
      <div
        className='rich-text-content rounded bg-white p-3 border border-border'
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
      />
    );
  }
  // plain text（既存データ）は whitespace-pre-wrap で表示
  return (
    <div className='whitespace-pre-wrap rounded bg-white p-3 text-sm text-text border border-border'>
      {content}
    </div>
  );
}

export function EssayTemplateView({
  templates: initialTemplates,
}: EssayTemplateViewProps) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [filterSubject, setFilterSubject] = useState(ALL_SUBJECT);
  const [filterRank, setFilterRank] = useState(ALL_RANK);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedCardIds, setExpandedCardIds] = useState<Set<string>>(
    new Set(),
  );

  // 追加モーダルのフォーム状態
  const [formData, setFormData] = useState<{
    subject: string;
    title: string;
    template: string;
    norm: string;
    pitfall: string;
    rank: string;
  }>({
    subject: SUBJECTS[0] as string,
    title: '',
    template: '',
    norm: '',
    pitfall: '',
    rank: 'C',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // 編集モーダル用 state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<EssayTemplateRow | null>(null);
  const [editFormData, setEditFormData] = useState<{
    subject: string;
    title: string;
    template: string;
    norm: string;
    pitfall: string;
    rank: string;
  }>({
    subject: SUBJECTS[0] as string,
    title: '',
    template: '',
    norm: '',
    pitfall: '',
    rank: 'C',
  });
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editSubmitError, setEditSubmitError] = useState('');

  // フィルタリング
  const filteredTemplates = templates
    .filter((t) => filterSubject === ALL_SUBJECT || t.subject === filterSubject)
    .filter((t) => filterRank === ALL_RANK || t.rank === filterRank);

  const handleFilterChange = (subject: string) => {
    setFilterSubject(subject);
  };

  const handleRankFilterChange = (rank: string) => {
    setFilterRank(rank);
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
      subject: SUBJECTS[0] as string,
      title: '',
      template: '',
      norm: '',
      pitfall: '',
      rank: 'C',
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
      setSubmitError(
        error instanceof Error ? error.message : '保存に失敗しました。',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditModal = (template: EssayTemplateRow) => {
    setEditingTemplate(template);
    setEditFormData({
      subject: template.subject,
      title: template.title,
      template: template.template ?? '',
      norm: template.norm ?? '',
      pitfall: template.pitfall ?? '',
      rank: template.rank ?? 'C',
    });
    setEditSubmitError('');
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTemplate(null);
    setEditSubmitError('');
  };

  const handleUpdateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;
    setEditSubmitError('');
    setIsEditSubmitting(true);

    try {
      const result = await updateEssayTemplateAction(
        editingTemplate.id,
        editFormData,
      );
      if (result.ok) {
        window.location.reload();
      } else {
        setEditSubmitError(result.message || 'エラーが発生しました。');
      }
    } catch (error) {
      setEditSubmitError(
        error instanceof Error ? error.message : '更新に失敗しました。',
      );
    } finally {
      setIsEditSubmitting(false);
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
      <div className='flex flex-col gap-4 mb-4'>
        <Button onClick={handleOpenModal} className='w-fit'>
          ＋ テンプレ追加
        </Button>

        {/* 科目フィルターチップ */}
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

        {/* ランクフィルターチップ */}
        <div className='flex flex-wrap gap-2'>
          <Chip
            label='すべて'
            active={filterRank === ALL_RANK}
            onClick={() => handleRankFilterChange(ALL_RANK)}
          />
          {RANKS.map((rank) => (
            <Chip
              key={rank}
              label={rank}
              active={filterRank === rank}
              onClick={() => handleRankFilterChange(rank)}
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
                    <span className={`inline-flex rounded bg-accent/10 px-2.5 py-1 text-xs font-semibold ${getSubjectColorClass(template.subject)}`}>
                      {template.subject}
                    </span>
                    <span
                      className={`inline-flex rounded px-2 py-0.5 text-xs font-bold ${
                        template.rank === 'A'
                          ? 'bg-red-100 text-red-700'
                          : template.rank === 'B'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {template.rank}
                    </span>
                    <span className='font-semibold text-text'>
                      {template.title}
                    </span>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* 展開部分 */}
                {isExpanded && (
                  <div className='border-t border-border bg-bg px-5 py-4 space-y-4'>
                    {/* ランク表示 */}
                    <div className='flex items-center gap-2'>
                      <span className='text-xs font-semibold uppercase tracking-wider text-sub'>
                        ランク:
                      </span>
                      <span
                        className={`inline-flex rounded px-3 py-1 text-sm font-bold ${
                          template.rank === 'A'
                            ? 'bg-red-100 text-red-700'
                            : template.rank === 'B'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {template.rank === 'A' && 'A - 最重要'}
                        {template.rank === 'B' && 'B - 重要'}
                        {template.rank === 'C' && 'C - 補助的'}
                      </span>
                    </div>

                    {template.template && (
                      <div>
                        <div className='text-xs font-semibold uppercase tracking-wider text-sub mb-2'>
                          論点テンプレ（要件・フロー）
                        </div>
                        {renderContent(template.template)}
                      </div>
                    )}

                    {template.norm && (
                      <div>
                        <div className='text-xs font-semibold uppercase tracking-wider text-sub mb-2'>
                          自分の言葉での規範
                        </div>
                        {renderContent(template.norm)}
                      </div>
                    )}

                    {template.pitfall && (
                      <div>
                        <div className='text-xs font-semibold uppercase tracking-wider text-sub mb-2'>
                          落とし穴・注意点
                        </div>
                        {renderContent(template.pitfall)}
                      </div>
                    )}

                    {/* 編集・削除ボタン */}
                    <div className='flex justify-end gap-2 pt-2'>
                      <Button
                        variant='secondary'
                        size='sm'
                        onClick={() => handleOpenEditModal(template)}
                      >
                        <Pencil size={14} />
                        編集
                      </Button>
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

      {/* 追加モーダル */}
      {isModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm'>
          <div className='w-full max-w-2xl rounded-2xl border border-border bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto'>
            {/* モーダルヘッダー */}
            <div className='mb-6 flex items-center justify-between'>
              <h2 className='text-lg font-bold text-text'>
                論文テンプレを追加
              </h2>
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
              {/* 科目・ランク（2カラム） */}
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
                  <Label htmlFor='rank'>ランク</Label>
                  <select
                    id='rank'
                    value={formData.rank}
                    onChange={(e) =>
                      setFormData({ ...formData, rank: e.target.value })
                    }
                    className='mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20'
                  >
                    <option value='A'>A - 最重要</option>
                    <option value='B'>B - 重要</option>
                    <option value='C'>C - 補助的</option>
                  </select>
                </div>
              </div>

              {/* 論点名 */}
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

              {/* 論点テンプレ */}
              <div>
                <Label htmlFor='template'>論点テンプレ（要件・フロー）</Label>
                <RichTextEditor
                  value={formData.template}
                  onChange={(html) =>
                    setFormData({ ...formData, template: html })
                  }
                  placeholder='①〜であること\n②〜の要件を満たすこと'
                  className='mt-2'
                  minHeight='96px'
                />
              </div>

              {/* 自分の言葉での規範 */}
              <div>
                <Label htmlFor='norm'>自分の言葉での規範</Label>
                <RichTextEditor
                  value={formData.norm}
                  onChange={(html) => setFormData({ ...formData, norm: html })}
                  placeholder='自分の言葉で規範を書く（記憶・定着用）'
                  className='mt-2'
                  minHeight='80px'
                />
              </div>

              {/* 落とし穴・注意点 */}
              <div>
                <Label htmlFor='pitfall'>落とし穴・注意点</Label>
                <RichTextEditor
                  value={formData.pitfall}
                  onChange={(html) =>
                    setFormData({ ...formData, pitfall: html })
                  }
                  placeholder='試験でよく間違える点・例外etc.'
                  className='mt-2'
                  minHeight='64px'
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
                <Button type='submit' disabled={isSubmitting}>
                  {isSubmitting ? '保存中...' : '保存する'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 編集モーダル */}
      {isEditModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm'>
          <div className='w-full max-w-2xl rounded-2xl border border-border bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto'>
            {/* ヘッダー */}
            <div className='mb-6 flex items-center justify-between'>
              <h2 className='text-lg font-bold text-text'>
                論文テンプレを編集
              </h2>
              <button
                type='button'
                onClick={handleCloseEditModal}
                className='rounded-lg bg-bg p-2 transition-colors hover:bg-border'
              >
                <X size={18} className='text-sub' />
              </button>
            </div>

            {editSubmitError && (
              <div className='mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200'>
                {editSubmitError}
              </div>
            )}

            <form onSubmit={handleUpdateTemplate} className='space-y-4'>
              {/* 科目・ランク（2カラム） */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='edit-subject'>科目</Label>
                  <select
                    id='edit-subject'
                    value={editFormData.subject}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        subject: e.target.value,
                      })
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
                  <Label htmlFor='edit-rank'>ランク</Label>
                  <select
                    id='edit-rank'
                    value={editFormData.rank}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, rank: e.target.value })
                    }
                    className='mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20'
                  >
                    <option value='A'>A - 最重要</option>
                    <option value='B'>B - 重要</option>
                    <option value='C'>C - 補助的</option>
                  </select>
                </div>
              </div>

              {/* 論点名 */}
              <div>
                <Label htmlFor='edit-title'>論点名</Label>
                <Input
                  id='edit-title'
                  value={editFormData.title}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, title: e.target.value })
                  }
                  placeholder='例: 処分性の判断基準'
                  className='mt-2'
                />
              </div>

              {/* 論点テンプレ */}
              <div>
                <Label htmlFor='edit-template'>
                  論点テンプレ（要件・フロー）
                </Label>
                <RichTextEditor
                  value={editFormData.template}
                  onChange={(html) =>
                    setEditFormData({ ...editFormData, template: html })
                  }
                  placeholder='①〜であること\n②〜の要件を満たすこと'
                  className='mt-2'
                  minHeight='96px'
                />
              </div>

              {/* 自分の言葉での規範 */}
              <div>
                <Label htmlFor='edit-norm'>自分の言葉での規範</Label>
                <RichTextEditor
                  value={editFormData.norm}
                  onChange={(html) =>
                    setEditFormData({ ...editFormData, norm: html })
                  }
                  placeholder='自分の言葉で規範を書く（記憶・定着用）'
                  className='mt-2'
                  minHeight='80px'
                />
              </div>

              {/* 落とし穴・注意点 */}
              <div>
                <Label htmlFor='edit-pitfall'>落とし穴・注意点</Label>
                <RichTextEditor
                  value={editFormData.pitfall}
                  onChange={(html) =>
                    setEditFormData({ ...editFormData, pitfall: html })
                  }
                  placeholder='試験でよく間違える点・例外etc.'
                  className='mt-2'
                  minHeight='64px'
                />
              </div>

              {/* フッターボタン */}
              <div className='flex justify-end gap-3 border-t border-border pt-4'>
                <Button
                  type='button'
                  variant='secondary'
                  onClick={handleCloseEditModal}
                  disabled={isEditSubmitting}
                >
                  キャンセル
                </Button>
                <Button type='submit' disabled={isEditSubmitting}>
                  {isEditSubmitting ? '更新中...' : '更新する'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
