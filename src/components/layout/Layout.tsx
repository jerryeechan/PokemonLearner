import { Outlet } from 'react-router-dom';
import { ReturnBanner } from '../notifications/ReturnBanner';
import { BottomNav } from './BottomNav';
import { Header } from './Header';

export function Layout() {
  return (
    <div className="min-h-screen pb-20 max-w-md mx-auto bg-pokemon-bg shadow-xl">
      <Header />
      <ReturnBanner />
      <main className="p-4 flex flex-col items-center">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
