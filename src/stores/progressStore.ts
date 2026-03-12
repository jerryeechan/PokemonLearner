import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface VocabProgress {
  id: string;
  level: number; // 0 = not started, 1-5 = SRS levels
  nextReviewTime: number; // timestamp
  consecutiveCorrect: number;
  hasSeenFlashcard?: boolean;
}

interface ProgressState {
  xp: number;
  streak: number;
  hearts: number;
  maxHearts: number;
  lastPlayedDate: string; // YYYY-MM-DD
  vocabProgress: Record<string, VocabProgress>;
  unlockedChapters: number[];
  
  // Actions
  addXp: (amount: number) => void;
  loseHeart: () => void;
  refillHearts: () => void;
  updateStreak: () => void;
  updateVocabReview: (id: string, correct: boolean) => void;
  markFlashcardSeen: (id: string) => void;
  unlockChapter: (chapterId: number) => void;
}

const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      xp: 0,
      streak: 0,
      hearts: 5,
      maxHearts: 5,
      lastPlayedDate: '',
      vocabProgress: {},
      unlockedChapters: [1], // Start with chapter 1 unlocked

      addXp: (amount) => set((state) => ({ xp: state.xp + amount })),
      
      loseHeart: () => set((state) => ({ 
        hearts: Math.max(0, state.hearts - 1) 
      })),
      
      refillHearts: () => set((state) => ({ 
        hearts: state.maxHearts 
      })),

      updateStreak: () => set((state) => {
        const today = getTodayDateString();
        if (state.lastPlayedDate === today) {
          return state; // Already played today
        }
        
        // Basic streak logic: if played yesterday, increment; else reset to 1
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let newStreak = state.streak;
        if (state.lastPlayedDate === yesterdayStr) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }

        return { streak: newStreak, lastPlayedDate: today };
      }),

      updateVocabReview: (id, correct) => set((state) => {
        const vocab = state.vocabProgress[id] || { 
          id, level: 0, nextReviewTime: 0, consecutiveCorrect: 0, hasSeenFlashcard: false
        };

        let newLevel = vocab.level;
        let newConsecutive = vocab.consecutiveCorrect;
        let newHasSeenFlashcard = vocab.hasSeenFlashcard !== undefined ? vocab.hasSeenFlashcard : true;

        if (correct) {
          // Level up immediately on correct answer
          newLevel = Math.min(5, newLevel + 1);
          newConsecutive = 0;
        } else {
          // Bad answer drops level heavily
          newLevel = Math.max(0, newLevel - 1);
          newConsecutive = 0;
          newHasSeenFlashcard = false; // Reset flashcard flag so they see it again
        }

        // Calculate next review time based on level (SRS intervals)
        // Level 0: Next day
        // Level 1: 1 day
        // Level 2: 3 days
        // Level 3: 7 days
        // Level 4: 14 days
        // Level 5: 30 days
        const intervals = [1, 1, 3, 7, 14, 30];
        const daysToWait = intervals[newLevel];
        const nextReviewTime = Date.now() + daysToWait * 24 * 60 * 60 * 1000;

        return {
          vocabProgress: {
            ...state.vocabProgress,
            [id]: {
              ...vocab,
              level: newLevel,
              consecutiveCorrect: newConsecutive,
              nextReviewTime,
              hasSeenFlashcard: newHasSeenFlashcard
            }
          }
        };
      }),

      markFlashcardSeen: (id) => set((state) => {
        const vocab = state.vocabProgress[id] || { 
          id, level: 0, nextReviewTime: 0, consecutiveCorrect: 0, hasSeenFlashcard: false
        };
        return {
          vocabProgress: {
            ...state.vocabProgress,
            [id]: { ...vocab, hasSeenFlashcard: true }
          }
        };
      }),

      unlockChapter: (chapterId) => set((state) => ({
        unlockedChapters: state.unlockedChapters.includes(chapterId) 
          ? state.unlockedChapters 
          : [...state.unlockedChapters, chapterId]
      }))
    }),
    {
      name: 'pokemon-learner-storage', // unique name
    }
  )
);
