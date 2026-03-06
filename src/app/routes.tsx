import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from './layout/MainLayout';
import { useAppContext } from '../state/AppContext';

const OnboardingPage = lazy(() =>
  import('../pages/OnboardingPage').then((module) => ({ default: module.OnboardingPage })),
);
const LoginPage = lazy(() =>
  import('../pages/LoginPage').then((module) => ({ default: module.LoginPage })),
);
const GoalSetupPage = lazy(() =>
  import('../pages/GoalSetupPage').then((module) => ({ default: module.GoalSetupPage })),
);
const TodayPage = lazy(() =>
  import('../pages/TodayPage').then((module) => ({ default: module.TodayPage })),
);
const CalendarPage = lazy(() =>
  import('../pages/CalendarPage').then((module) => ({ default: module.CalendarPage })),
);
const PremiumPage = lazy(() =>
  import('../pages/PremiumPage').then((module) => ({ default: module.PremiumPage })),
);
const MonthlyReportPage = lazy(() =>
  import('../pages/MonthlyReportPage').then((module) => ({ default: module.MonthlyReportPage })),
);
const QuarterlyReportPage = lazy(() =>
  import('../pages/QuarterlyReportPage').then((module) => ({ default: module.QuarterlyReportPage })),
);
const RoutineTemplatesPage = lazy(() =>
  import('../pages/RoutineTemplatesPage').then((module) => ({ default: module.RoutineTemplatesPage })),
);
const SettingsPage = lazy(() =>
  import('../pages/SettingsPage').then((module) => ({ default: module.SettingsPage })),
);
const TermsPage = lazy(() =>
  import('../pages/TermsPage').then((module) => ({ default: module.TermsPage })),
);
const PrivacyPage = lazy(() =>
  import('../pages/PrivacyPage').then((module) => ({ default: module.PrivacyPage })),
);

function RootRedirect() {
  const { onboardingCompleted } = useAppContext();
  return <Navigate to={onboardingCompleted ? '/today' : '/onboarding/1'} replace />;
}

export function AppRoutes() {
  return (
    <Suspense fallback={<div className="boot-screen">불러오는 중이에요...</div>}>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/onboarding/:step" element={<OnboardingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/goal/setup" element={<GoalSetupPage />} />

        <Route element={<MainLayout />}>
          <Route path="/today" element={<TodayPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/premium" element={<PremiumPage />} />
          <Route path="/report/monthly" element={<MonthlyReportPage />} />
          <Route path="/report/quarterly" element={<QuarterlyReportPage />} />
          <Route path="/routine-templates" element={<RoutineTemplatesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
