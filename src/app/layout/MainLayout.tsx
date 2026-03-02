import { Outlet } from 'react-router-dom';
import { TabBar } from '../components/TabBar';

export function MainLayout() {
  return (
    <div className="app-shell">
      <header className="top-nav">
        <strong>커피 줄이기 챌린지</strong>
        <span className="top-nav-caption">라이트모드</span>
      </header>
      <main className="screen-content">
        <Outlet />
      </main>
      <TabBar />
    </div>
  );
}
