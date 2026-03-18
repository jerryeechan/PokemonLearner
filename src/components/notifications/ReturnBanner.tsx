import { X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { chapters } from '../../data/chapters';
import { useReturnNotification } from '../../hooks/useReturnNotification';
import { useNotificationStore } from '../../stores/notificationStore';
import { useProgressStore } from '../../stores/progressStore';

export function ReturnBanner() {
  const notification = useReturnNotification();
  const dismissBanner = useNotificationStore((s) => s.dismissBanner);
  const unlockedChapters = useProgressStore((s) => s.unlockedChapters);
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (!notification || dismissed) return null;

  const { character, message, streakState } = notification;

  const handleDismiss = () => {
    setDismissed(true);
    dismissBanner();
  };

  const handlePractice = () => {
    // Navigate to the highest unlocked chapter
    const highestChapter = Math.max(...unlockedChapters);
    const chapter = chapters.find((c) => c.id === highestChapter);
    if (chapter) {
      navigate(`/game/${chapter.id}`);
    }
    handleDismiss();
  };

  const streakEmoji =
    streakState === 'streakAtRisk' ? '🔥' :
    streakState === 'streakBroken' ? '💔' :
    streakState === 'longStreak' ? '🏆' : '👋';

  return (
    <div className={`mx-4 mt-2 rounded-2xl border-2 ${character.themeColor} p-4 relative animate-fade-in`}>
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Character header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{character.emoji}</span>
        <div>
          <span className="font-black text-sm">{character.nameJa}</span>
          <span className="text-gray-500 text-xs ml-1">({character.nameZh})</span>
        </div>
        <span className="ml-auto text-lg">{streakEmoji}</span>
      </div>

      {/* Message */}
      <p className="text-sm leading-relaxed mb-3 pr-4">{message}</p>

      {/* CTA */}
      {streakState !== 'longStreak' && (
        <button
          onClick={handlePractice}
          className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded-xl text-sm hover:bg-green-600 active:scale-[0.98] transition-all shadow-[0_3px_0_0_rgba(22,163,74,1)]"
        >
          今すぐ練習！いますぐれんしゅう！
        </button>
      )}
    </div>
  );
}
