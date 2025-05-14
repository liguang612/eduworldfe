import { lazy, Suspense } from 'react';

const SurveyComponent = lazy(() => import("@/components/Survey"));

export default function QuestionBank() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SurveyComponent />
    </Suspense>
  );
}

