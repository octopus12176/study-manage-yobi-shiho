export type MemoFeedback = {
  id: string;
  feedback: string;
  nextTask: string;
};

export type WeeklyReview = {
  summary: string;
  gapNote: string;
  nextWeekAllocation: string;
  actionTags: string[];
};

export type RonbunDiagnosis = {
  biasSummary: string;
  actions: string[];
  templateHint: string;
};

export type ReviewInsights = {
  memoFeedbacks: MemoFeedback[];
  weeklyReview: WeeklyReview;
  ronbunDiagnosis: RonbunDiagnosis;
};
