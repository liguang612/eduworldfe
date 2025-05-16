import { lazy, Suspense } from 'react';

const SurveyComponent = lazy(() => import("@/components/Survey"));

export default function ExamPages() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SurveyComponent />
    </Suspense>
  );
}