import { Heart, Flame, Star } from 'lucide-react';
import { useProgressStore } from '../../stores/progressStore';

export function Header() {
  const { xp, streak, hearts } = useProgressStore();

  return (
    <header className="sticky top-0 z-50 bg-white border-b-2 border-gray-200 px-4 py-3 flex justify-between items-center max-w-md mx-auto w-full">
      <div className="flex items-center space-x-4 w-full justify-between">
        
        {/* Hearts */}
        <div className="flex items-center font-bold text-red-500">
          <Heart fill="currentColor" className="w-6 h-6 mr-1" />
          <span>{hearts}</span>
        </div>

        {/* Streak */}
        <div className="flex items-center font-bold text-orange-500">
          <Flame fill="currentColor" className="w-6 h-6 mr-1" />
          <span>{streak}</span>
        </div>

        {/* XP */}
        <div className="flex items-center font-bold text-blue-500">
          <Star fill="currentColor" className="w-6 h-6 mr-1 text-yellow-400" />
          <span>{xp}</span>
        </div>

      </div>
    </header>
  );
}
