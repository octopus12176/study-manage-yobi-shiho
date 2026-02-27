'use client';

import { useState } from 'react';
import { X, ChevronDown, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Chip } from '@/components/ui/chip';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import {
  createLegalConceptAction,
  deleteLegalConceptAction,
  updateLegalConceptAction,
} from '@/app/template/actions';
import { SUBJECTS } from '@/lib/constants';
import { sanitizeHtml } from '@/lib/sanitize';
import type { LegalConceptRow } from '@/lib/supabase/queries';

type LegalConceptViewProps = {
  concepts: LegalConceptRow[];
};

const ALL_SUBJECT = 'all';
const CATEGORY_OPTIONS = [
  '判断枠組み',
  '要件事実',
  '訴訟要件',
  '基本原則',
  '審査基準',
  'その他',
] as const;

// ヘルパー関数: HTMLか plain text かを判別して表示
function renderContent(content: string | null): React.ReactNode {
  if (!content) return null;
  const isHtml = content.trimStart().startsWith('<');
  if (isHtml) {
    return (
      <div
        className='rich-text-content rounded bg-white p-3 border border-border'
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
      />
    );
  }
  return (
    <div className='whitespace-pre-wrap rounded bg-white p-3 text-sm text-text border border-border'>
      {content}
    </div>
  );
}

export function LegalConceptView({
  concepts: initialConcepts,
}: LegalConceptViewProps) {
  const [concepts, setConcepts] = useState(initialConcepts);
  const [filterSubject, setFilterSubject] = useState(ALL_SUBJECT);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedCardIds, setExpandedCardIds] = useState<Set<string>>(
    new Set(),
  );

  // 追加モーダルのフォーム状態
  const [formData, setFormData] = useState<{
    subject: string;
    category: string;
    title: string;
    summary: string;
    framework: string;
    notes: string;
  }>({
    subject: SUBJECTS[0] as string,
    category: '判断枠組み',
    title: '',
    summary: '',
    framework: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // 編集モーダル用 state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingConcept, setEditingConcept] = useState<LegalConceptRow | null>(
    null,
  );
  const [editFormData, setEditFormData] = useState<{
    subject: string;
    category: string;
    title: string;
    summary: string;
    framework: string;
    notes: string;
  }>({
    subject: SUBJECTS[0] as string,
    category: '判断枠組み',
    title: '',
    summary: '',
    framework: '',
    notes: '',
  });
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editSubmitError, setEditSubmitError] = useState('');

  // フィルタリング
  const filteredConcepts =
    filterSubject === ALL_SUBJECT
      ? concepts
      : concepts.filter((c) => c.subject === filterSubject);

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
      subject: SUBJECTS[0] as string,
      category: '判断枠組み',
      title: '',
      summary: '',
      framework: '',
      notes: '',
    });
    setSubmitError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSubmitError('');
  };

  const handleSaveConcept = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const result = await createLegalConceptAction(formData);

      if (result.ok) {
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

  const handleOpenEditModal = (concept: LegalConceptRow) => {
    setEditingConcept(concept);
    setEditFormData({
      subject: concept.subject,
      category: concept.category,
      title: concept.title,
      summary: concept.summary ?? '',
      framework: concept.framework ?? '',
      notes: concept.notes ?? '',
    });
    setEditSubmitError('');
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingConcept(null);
    setEditSubmitError('');
  };

  const handleUpdateConcept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConcept) return;
    setEditSubmitError('');
    setIsEditSubmitting(true);

    try {
      const result = await updateLegalConceptAction(
        editingConcept.id,
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

  const handleDeleteConcept = async (id: string) => {
    if (!confirm('この基礎知識を削除しますか？')) {
      return;
    }

    try {
      const result = await deleteLegalConceptAction(id);
      if (result.ok) {
        setConcepts(concepts.filter((c) => c.id !== id));
      }
    } catch (error) {
      console.error('削除エラー:', error);
    }
  };

  return (
    <>
      {/* ボタンとフィルター */}
      <div className='flex flex-col  gap-4 mb-4'>
        <Button onClick={handleOpenModal} className='w-fit'>
          ＋ 基礎知識追加
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

      {/* カードリスト */}
      <div className='space-y-3'>
        {filteredConcepts.length === 0 ? (
          <div className='flex h-32 items-center justify-center rounded-lg border border-border bg-bg text-sub'>
            基礎知識がまだありません。「＋ 基礎知識追加」で登録しましょう。
          </div>
        ) : (
          filteredConcepts.map((concept) => {
            const isExpanded = expandedCardIds.has(concept.id);
            return (
              <div
                key={concept.id}
                className='overflow-hidden rounded-lg border border-border bg-white transition-all hover:border-text hover:shadow-md'
              >
                {/* ヘッダー（クリック可能） */}
                <button
                  type='button'
                  onClick={() => handleToggleExpand(concept.id)}
                  className='flex w-full items-center justify-between px-5 py-4 text-left'
                >
                  <div className='flex items-center gap-3 flex-1'>
                    <span className='inline-flex rounded bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent'>
                      {concept.subject}
                    </span>
                    <span className='inline-flex rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700'>
                      {concept.category}
                    </span>
                    <span className='font-semibold text-text'>
                      {concept.title}
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
                    {/* 概要 */}
                    {concept.summary && (
                      <div>
                        <div className='text-xs font-semibold uppercase tracking-wider text-sub mb-2'>
                          概要
                        </div>
                        <div className='rounded bg-white p-3 border border-border text-sm text-text'>
                          {concept.summary}
                        </div>
                      </div>
                    )}

                    {/* 型・フロー */}
                    {concept.framework && (
                      <div>
                        <div className='text-xs font-semibold uppercase tracking-wider text-sub mb-2'>
                          型・フロー
                        </div>
                        {renderContent(concept.framework)}
                      </div>
                    )}

                    {/* 注意点 */}
                    {concept.notes && (
                      <div>
                        <div className='text-xs font-semibold uppercase tracking-wider text-sub mb-2'>
                          注意点
                        </div>
                        {renderContent(concept.notes)}
                      </div>
                    )}

                    {/* 編集・削除ボタン */}
                    <div className='flex justify-end gap-2 pt-2'>
                      <Button
                        variant='secondary'
                        size='sm'
                        onClick={() => handleOpenEditModal(concept)}
                      >
                        <Pencil size={14} />
                        編集
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleDeleteConcept(concept.id)}
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
              <h2 className='text-lg font-bold text-text'>基礎知識を追加</h2>
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
            <form onSubmit={handleSaveConcept} className='space-y-4'>
              {/* 科目・カテゴリ（2カラム） */}
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
                  <Label htmlFor='category'>カテゴリ</Label>
                  <select
                    id='category'
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className='mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20'
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 概念名 */}
              <div>
                <Label htmlFor='title'>概念名</Label>
                <Input
                  id='title'
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder='例: 三段階審査論'
                  className='mt-2'
                />
              </div>

              {/* 概要 */}
              <div>
                <Label htmlFor='summary'>概要</Label>
                <textarea
                  id='summary'
                  value={formData.summary}
                  onChange={(e) =>
                    setFormData({ ...formData, summary: e.target.value })
                  }
                  placeholder='1〜2文で概要を説明'
                  className='mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none'
                  rows={2}
                />
              </div>

              {/* 型・フロー */}
              <div>
                <Label htmlFor='framework'>型・フロー</Label>
                <RichTextEditor
                  value={formData.framework}
                  onChange={(html) =>
                    setFormData({ ...formData, framework: html })
                  }
                  placeholder='①〜 → ②〜 → ③〜'
                  className='mt-2'
                  minHeight='96px'
                />
              </div>

              {/* 注意点 */}
              <div>
                <Label htmlFor='notes'>注意点</Label>
                <RichTextEditor
                  value={formData.notes}
                  onChange={(html) => setFormData({ ...formData, notes: html })}
                  placeholder='試験での注意点・落とし穴'
                  className='mt-2'
                  minHeight='80px'
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
              <h2 className='text-lg font-bold text-text'>基礎知識を編集</h2>
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

            <form onSubmit={handleUpdateConcept} className='space-y-4'>
              {/* 科目・カテゴリ（2カラム） */}
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
                  <Label htmlFor='edit-category'>カテゴリ</Label>
                  <select
                    id='edit-category'
                    value={editFormData.category}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        category: e.target.value,
                      })
                    }
                    className='mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20'
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 概念名 */}
              <div>
                <Label htmlFor='edit-title'>概念名</Label>
                <Input
                  id='edit-title'
                  value={editFormData.title}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, title: e.target.value })
                  }
                  placeholder='例: 三段階審査論'
                  className='mt-2'
                />
              </div>

              {/* 概要 */}
              <div>
                <Label htmlFor='edit-summary'>概要</Label>
                <textarea
                  id='edit-summary'
                  value={editFormData.summary}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      summary: e.target.value,
                    })
                  }
                  placeholder='1〜2文で概要を説明'
                  className='mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none'
                  rows={2}
                />
              </div>

              {/* 型・フロー */}
              <div>
                <Label htmlFor='edit-framework'>型・フロー</Label>
                <RichTextEditor
                  value={editFormData.framework}
                  onChange={(html) =>
                    setEditFormData({ ...editFormData, framework: html })
                  }
                  placeholder='①〜 → ②〜 → ③〜'
                  className='mt-2'
                  minHeight='96px'
                />
              </div>

              {/* 注意点 */}
              <div>
                <Label htmlFor='edit-notes'>注意点</Label>
                <RichTextEditor
                  value={editFormData.notes}
                  onChange={(html) =>
                    setEditFormData({ ...editFormData, notes: html })
                  }
                  placeholder='試験での注意点・落とし穴'
                  className='mt-2'
                  minHeight='80px'
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
