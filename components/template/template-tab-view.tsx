'use client';

import { useState } from 'react';
import { EssayTemplateView } from '@/components/template/essay-template-view';
import { LegalConceptView } from '@/components/template/legal-concept-view';
import type { EssayTemplateRow, LegalConceptRow } from '@/lib/supabase/queries';

type Tab = 'template' | 'concept';

interface TemplateTabViewProps {
  templates: EssayTemplateRow[];
  concepts: LegalConceptRow[];
}

export function TemplateTabView({ templates, concepts }: TemplateTabViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('template');

  return (
    <div className='flex flex-col gap-4'>
      {/* Tab Buttons */}
      <div className='flex gap-2 border-b'>
        <button
          onClick={() => setActiveTab('template')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'template'
              ? 'border-b-2 border-accent text-accent'
              : 'text-muted hover:text-foreground'
          }`}
        >
          テンプレ
        </button>
        <button
          onClick={() => setActiveTab('concept')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'concept'
              ? 'border-b-2 border-accent text-accent'
              : 'text-muted hover:text-foreground'
          }`}
        >
          基礎知識
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'template' && <EssayTemplateView templates={templates} />}
        {activeTab === 'concept' && <LegalConceptView concepts={concepts} />}
      </div>
    </div>
  );
}
