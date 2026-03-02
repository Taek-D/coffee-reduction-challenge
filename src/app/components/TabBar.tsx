import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/today', label: '오늘' },
  { to: '/calendar', label: '달력' },
  { to: '/settings', label: '설정' },
];

export function TabBar() {
  return (
    <nav className="tabbar" aria-label="메인 탭">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) => (isActive ? 'tabbar-link active' : 'tabbar-link')}
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
