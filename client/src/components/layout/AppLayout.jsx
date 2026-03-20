import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const AppLayout = () => {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <Sidebar />
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
