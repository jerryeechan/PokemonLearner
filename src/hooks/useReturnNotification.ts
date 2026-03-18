import { useMemo } from 'react';
import { notificationCharacters, type NotificationCharacter } from '../data/notificationCharacters';
import { useNotificationStore } from '../stores/notificationStore';
import { useProgressStore } from '../stores/progressStore';

export type StreakState = 'streakAtRisk' | 'streakBroken' | 'longStreak' | 'comeBack';

export interface ReturnNotification {
  character: NotificationCharacter;
  message: string;
  streakState: StreakState;
}

function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function daysSince(dateStr: string): number {
  if (!dateStr) return Infinity;
  const then = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));
}

function determineStreakState(
  lastSessionDate: string,
  streak: number,
): StreakState | null {
  const today = getDateString(new Date());

  // Already practiced today → only show if long streak
  if (lastSessionDate === today) {
    return streak >= 7 ? 'longStreak' : null;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getDateString(yesterday);

  // Played yesterday but not today → streak at risk
  if (lastSessionDate === yesterdayStr && streak > 0) {
    return 'streakAtRisk';
  }

  // Haven't played in 2+ days
  const days = daysSince(lastSessionDate);
  if (days >= 2) {
    // Had a streak that is now broken
    if (streak <= 1 && lastSessionDate !== '') {
      return 'streakBroken';
    }
    return 'comeBack';
  }

  return 'streakAtRisk';
}

function selectCharacter(unlockedChapters: number[]): NotificationCharacter {
  const eligible = notificationCharacters.filter(
    (c) => unlockedChapters.includes(c.unlockedByChapter) || c.unlockedByChapter <= Math.max(...unlockedChapters)
  );
  // Prefer more recently unlocked characters (higher weight) for variety
  if (eligible.length <= 1) return eligible[0] || notificationCharacters[0];
  return eligible[Math.floor(Math.random() * eligible.length)];
}

export function useReturnNotification(): ReturnNotification | null {
  const { lastSessionDate, streak, unlockedChapters } = useProgressStore();
  const { lastBannerDismissed } = useNotificationStore();

  return useMemo(() => {
    const today = getDateString(new Date());

    // Banner already dismissed today
    if (lastBannerDismissed === today) return null;

    const streakState = determineStreakState(lastSessionDate, streak);
    if (!streakState) return null;

    const character = selectCharacter(unlockedChapters);
    const messages = character.messages[streakState];
    const message = messages[Math.floor(Math.random() * messages.length)];

    return { character, message, streakState };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastSessionDate, streak, lastBannerDismissed]);
}
