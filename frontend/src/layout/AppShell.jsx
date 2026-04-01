import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { usePlacementStore } from '../store/usePlacementStore';

export default function AppShell() {
  const role = usePlacementStore((state) => state.role);
  const auth = usePlacementStore((state) => state.auth);
  const dataMode = usePlacementStore((state) => state.dataMode);
  const lastRefreshedAt = usePlacementStore((state) => state.lastRefreshedAt);
  const setDataMode = usePlacementStore((state) => state.setDataMode);
  const triggerRealtimeRefresh = usePlacementStore((state) => state.triggerRealtimeRefresh);

  useEffect(() => {
    void triggerRealtimeRefresh();
    const timer = setInterval(() => {
      void triggerRealtimeRefresh();
    }, 25000);

    return () => clearInterval(timer);
  }, [triggerRealtimeRefresh]);

  return (
    <div className='flex min-h-screen bg-slate-50'>
      <Sidebar role={role} />
      <div className='flex min-w-0 flex-1 flex-col'>
        <Topbar
          role={role}
          auth={auth}
          dataMode={dataMode}
          lastRefreshedAt={lastRefreshedAt}
          onModeChange={setDataMode}
          onRefresh={triggerRealtimeRefresh}
        />
        <main className='flex-1'>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
