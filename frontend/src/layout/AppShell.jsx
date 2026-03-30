import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { usePlacementStore } from '../store/usePlacementStore';

export default function AppShell() {
  const role = usePlacementStore((state) => state.role);
  const loginAsRole = usePlacementStore((state) => state.loginAsRole);
  const auth = usePlacementStore((state) => state.auth);

  return (
    <div className='flex min-h-screen bg-slate-50'>
      <Sidebar role={role} />
      <div className='flex min-w-0 flex-1 flex-col'>
        <Topbar role={role} auth={auth} loginAsRole={loginAsRole} />
        <main className='flex-1'>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
