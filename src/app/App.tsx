import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';
import { useAppContext } from '../state/AppContext';

export function App() {
  const { ready } = useAppContext();

  if (!ready) {
    return <div className="boot-screen">초기화 중이에요...</div>;
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
