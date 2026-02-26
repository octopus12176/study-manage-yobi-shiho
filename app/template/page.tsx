import { EssayTemplateView } from '@/components/template/essay-template-view';
import { listEssayTemplates, type EssayTemplateRow } from '@/lib/supabase/queries';

export default async function TemplatePage() {
  let templates: EssayTemplateRow[] = [];
  try {
    templates = await listEssayTemplates();
  } catch {
    templates = [];
  }

  return (
    <main className='flex flex-col gap-4'>
      <div>
        <h1 className='text-2xl font-black'>論文テンプレ</h1>
        <p className='text-sub'>論点・訴訟要件ごとに自分の型を管理</p>
      </div>

      <EssayTemplateView templates={templates} />
    </main>
  );
}
