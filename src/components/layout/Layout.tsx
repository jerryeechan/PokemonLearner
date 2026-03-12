import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

export function Layout() {
  return (
    <div className="min-h-screen pb-20 max-w-md mx-auto bg-pokemon-bg shadow-xl">
      <Header />
      <main className="p-4 flex flex-col items-center">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
