import { Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from './layout/MainLayout';
import { CalendarPage } from '../pages/CalendarPage';
import { GoalSetupPage } from '../pages/GoalSetupPage';
import { LoginPage } from '../pages/LoginPage';
import { MonthlyReportPage } from '../pages/MonthlyReportPage';
import { OnboardingPage } from '../pages/OnboardingPage';
import { PrivacyPage } from '../pages/PrivacyPage';
import { PremiumPage } from '../pages/PremiumPage';
import { QuarterlyReportPage } from '../pages/QuarterlyReportPage';
import { RoutineTemplatesPage } from '../pages/RoutineTemplatesPage';
import { SettingsPage } from '../pages/SettingsPage';
import { TermsPage } from '../pages/TermsPage';
import { TodayPage } from '../pages/TodayPage';
import { useAppContext } from '../state/AppContext';

function RootRedirect() {
  const { onboardingCompleted } = useAppContext();
  return <Navigate to={onboardingCompleted ? '/today' : '/onboarding/1'} replace />;
}

export function AppRoutes() {
  return (
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
  );
}
