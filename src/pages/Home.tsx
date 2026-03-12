import { Play, Lock } from 'lucide-react';
import { useProgressStore } from '../stores/progressStore';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';

import { chapters } from '../data/chapters';
export function Home() {
  const { unlockedChapters } = useProgressStore();
  const navigate = useNavigate();

  const handleStartChapter = (id: number) => {
    navigate(`/game/${id}`);
  };

  return (
    <div className="w-full flex flex-col gap-6 py-6 pb-24">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-black text-gray-800 tracking-wide">學習路徑</h1>
        <p className="text-gray-500 font-bold">成為寶可夢單字大師！</p>
      </div>

      <div className="flex flex-col items-center gap-8 relative">
        {/* Simple vertical line connecting nodes */}
        <div className="absolute top-8 bottom-8 w-2 bg-gray-200 -z-10 rounded-full"></div>

        {chapters.map((chapter) => {
          const isUnlocked = unlockedChapters.includes(chapter.id);
          
          return (
            <div key={chapter.id} className="relative flex flex-col items-center w-full">
              <button 
                onClick={() => isUnlocked && handleStartChapter(chapter.id)}
                disabled={!isUnlocked}
                className={clsx(
                  "relative w-20 h-20 rounded-full flex items-center justify-center transition-all",
                  "border-b-[6px] active:border-b-0 active:translate-y-[6px]", // 3D effect
                  isUnlocked 
                    ? "bg-green-500 border-green-600 shadow-[0_4px_12px_rgba(34,197,94,0.3)] hover:brightness-110" 
                    : "bg-gray-300 border-gray-400 cursor-not-allowed opacity-80"
                )}
              >
                {isUnlocked ? (
                  <Play className="w-8 h-8 text-white ml-2" fill="currentColor" />
                ) : (
                  <Lock className="w-8 h-8 text-gray-500" />
                )}
              </button>
              
              {/* Tooltip-like title */}
              <div className="mt-4 bg-white px-4 py-2 rounded-xl border-2 border-gray-200 shadow-sm text-center">
                <h3 className="font-black text-gray-800">Unit {chapter.id}: {chapter.title}</h3>
                <p className="text-xs text-gray-500 font-bold mt-1">{chapter.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
