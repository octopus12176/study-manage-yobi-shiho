import { TemplateTabView } from '@/components/template/template-tab-view';
import { listEssayTemplates, type EssayTemplateRow, listLegalConcepts, type LegalConceptRow } from '@/lib/supabase/queries';

export default async function TemplatePage() {
  let templates: EssayTemplateRow[] = [];
  let concepts: LegalConceptRow[] = [];
  try {
    [templates, concepts] = await Promise.all([
      listEssayTemplates(),
      listLegalConcepts(),
    ]);
  } catch {
    templates = [];
    concepts = [];
  }

  return (
    <main className='flex flex-col gap-4'>
      <div>
        <h1 className='text-2xl font-black'>論文テンプレ</h1>
        <p className='text-sub'>論点・訴訟要件ごとに自分の型を管理</p>
      </div>

      <TemplateTabView templates={templates} concepts={concepts} />
    </main>
  );
}
