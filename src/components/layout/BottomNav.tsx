import { Home, BookOpen, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';

export function BottomNav() {
  const navItems = [
    { to: '/', icon: Home, label: '學習' },
    { to: '/review', icon: BookOpen, label: '複習' },
    { to: '/profile', icon: User, label: '個人' },
  ];

  return (
    <nav className="fixed bottom-0 z-50 w-full bg-white border-t-2 border-gray-200 max-w-md mx-auto left-0 right-0 px-6 py-2 pb-safe">
      <ul className="flex justify-between items-center">
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  "flex flex-col items-center p-2 rounded-xl transition-colors",
                  isActive ? "text-blue-500 bg-blue-50" : "text-gray-400 hover:bg-gray-50"
                )
              }
            >
              <item.icon className="w-7 h-7 mb-1" strokeWidth={2.5} />
              <span className="text-xs font-bold">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
