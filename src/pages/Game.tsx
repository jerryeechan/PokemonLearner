import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X } from 'lucide-react';
import vocabData from '../data/pokemon_vocab.json';
import { FlashcardMode } from '../components/game/FlashcardMode';
import { QuizMode } from '../components/game/QuizMode';
import { SpellingMode } from '../components/game/SpellingMode';
import { MatchMode } from '../components/game/MatchMode';
import { chapters } from '../data/chapters';
import { useProgressStore } from '../stores/progressStore';

// Define a type for the Game Question
type QuestionType = 'flashcard' | 'quiz_zh_to_ja' | 'spelling' | 'match';

interface GameSessionItem {
  type: QuestionType;
  vocabId?: string; // Optional for match mode which takes an array
  vocabIds?: string[];
  options?: string[];
}

export function Game() {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const { addXp, updateVocabReview, loseHeart, hearts } = useProgressStore();
  
  const [sessionQueue, setSessionQueue] = useState<GameSessionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0 });

  // Initialize Session
  useEffect(() => {
    const chapter = chapters.find(c => c.id === Number(chapterId));
    if (!chapter) {
       navigate('/');
       return;
    }

    // Get the vocabulary for this specific chapter
    const chapterVocab = vocabData.filter((v: any) => chapter.vocabIds.includes(v.id));
    
    // Pick 5-7 random words from this chapter for the session
    const sessionSize = Math.min(6, chapterVocab.length);
    const shuffledVal = [...chapterVocab].sort(() => 0.5 - Math.random()).slice(0, sessionSize);
    
    const newQueue: GameSessionItem[] = [];
    
    shuffledVal.forEach(vocab => {
      // Check user progress for this vocab using getState() to avoid dependency re-renders
      const progress = useProgressStore.getState().vocabProgress[vocab.id];
      const level = progress ? progress.level : 0;
      
      // If level is 0 or no progress, always show Flashcard first
      if (level === 0) {
         newQueue.push({ type: 'flashcard', vocabId: vocab.id });
      }

      // Randomize the test type based on progress
      const testTypes: QuestionType[] = ['quiz_zh_to_ja'];
      // Only allow spelling for words with > 1 char if level > 0
      if (level > 0 && vocab.hiragana && vocab.hiragana.length > 1) {
         testTypes.push('spelling');
      }

      // Sometimes show flashcard even if level > 0 as a quick review
      if (level > 0 && Math.random() > 0.7) {
         newQueue.push({ type: 'flashcard', vocabId: vocab.id });
      }

      const selectedType = testTypes[Math.floor(Math.random() * testTypes.length)];

      if (selectedType === 'quiz_zh_to_ja') {
        // Collect 3 wrong options from the ENTIRE dataset to make it challenging
        const wrongOptions = vocabData
          .filter((v: any) => v.id !== vocab.id)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3)
          .map((v: any) => v.japanese);
        
        const options = [...wrongOptions, vocab.japanese].sort(() => 0.5 - Math.random());
        newQueue.push({ type: 'quiz_zh_to_ja', vocabId: vocab.id, options });
      } else if (selectedType === 'spelling') {
        newQueue.push({ type: 'spelling', vocabId: vocab.id });
      }
    });

    // Add 1 Match Mode at the end containing 4 vocab items from this chapter
    const matchVocabs = [...chapterVocab].sort(() => 0.5 - Math.random()).slice(0, 4);
    if (matchVocabs.length >= 2) { // Need at least 2 for a match game
      newQueue.push({
        type: 'match',
        vocabIds: matchVocabs.map(v => v.id)
      });
    }

    setSessionQueue(newQueue);
  }, [chapterId, navigate]);

  const handleNext = (correct: boolean) => {
    const currentItem = sessionQueue[currentIndex];
    
    // Only track real answers, not flashcards
    if (currentItem.type !== 'flashcard' && currentItem.type !== 'match') {
      if (correct) {
        setSessionStats(s => ({ ...s, correct: s.correct + 1 }));
        addXp(10);
        if (currentItem.vocabId) updateVocabReview(currentItem.vocabId, true);
      } else {
        setSessionStats(s => ({ ...s, wrong: s.wrong + 1 }));
        loseHeart();
        if (currentItem.vocabId) updateVocabReview(currentItem.vocabId, false);
      }
    } else if (currentItem.type === 'match') {
      if (correct) {
        setSessionStats(s => ({ ...s, correct: s.correct + 1 }));
        addXp(20);
        currentItem.vocabIds?.forEach(vid => updateVocabReview(vid, true));
      }
    }

    if (hearts === 0 && !correct) {
      alert("生命值歸零！請休息一下！");
      navigate('/');
      return;
    }

    if (currentIndex + 1 >= sessionQueue.length) {
      setIsGameOver(true);
      
      // Auto-unlock next chapter based on progress or XP fallback
      const currentChapterId = Number(chapterId);
      const chapter = chapters.find(c => c.id === currentChapterId);
      
      if (chapter) {
         // Check if at least 70% of vocab in this chapter reached Level 1+
         const learnedCount = chapter.vocabIds.filter(id => {
            const progress = useProgressStore.getState().vocabProgress[id];
            return progress && progress.level >= 1;
         }).length;
         
         const threshold = Math.ceil(chapter.vocabIds.length * 0.7);
         
         // Alternatively, if user gained decent XP during this session (let's say over 50), 
         // or XP naturally accumulated over threshold, we can also be more generous.
         const isProficient = learnedCount >= threshold;
         
         if (isProficient) {
           useProgressStore.getState().unlockChapter(currentChapterId + 1);
         }
      }
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (sessionQueue.length === 0) return <div>Loading...</div>;

  if (isGameOver) {
    return (
      <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-black text-yellow-500 mb-6">課程完成！</h1>
        <div className="card w-full flex justify-between p-6 mb-8 text-center text-lg font-bold">
          <div className="text-green-500">
            <p className="text-3xl">✓</p>
            <p>答對 {sessionStats.correct} 題</p>
          </div>
          <div className="text-blue-500">
            <p className="text-3xl">⭐</p>
            <p>獲得 +{sessionStats.correct * 10} XP</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="btn-primary w-full py-4 text-xl shadow-[0_6px_0_0_rgba(34,197,94,1)]"
        >
          繼續
        </button>
      </div>
    );
  }

  const currentItem = sessionQueue[currentIndex];
  // Match mode doesn't rely on a single vocab
  const vocab = currentItem.vocabId ? vocabData.find(v => v.id === currentItem.vocabId) : null;
  // If not match mode and no vocab, return null
  if (currentItem.type !== 'match' && !vocab) return null;

  const progressPercent = ((currentIndex) / sessionQueue.length) * 100;

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col items-center">
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between p-4 px-6 pt-6 mb-4">
        <button 
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-8 h-8" strokeWidth={3} />
        </button>
        <div className="flex-1 mx-4 h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 rounded-full transition-all duration-300" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      <div className="flex-1 w-full max-w-sm px-6 flex flex-col items-center">
        {currentItem.type === 'flashcard' && vocab && (
          <FlashcardMode vocab={vocab} onNext={handleNext} />
        )}
        {currentItem.type === 'quiz_zh_to_ja' && vocab && currentItem.options && (
          <QuizMode vocab={vocab} options={currentItem.options} onNext={handleNext} />
        )}
        {currentItem.type === 'spelling' && vocab && (
          <SpellingMode vocab={vocab} onNext={handleNext} />
        )}
        {currentItem.type === 'match' && currentItem.vocabIds && (
          <MatchMode vocabIds={currentItem.vocabIds} onNext={handleNext} />
        )}
      </div>
    </div>
  );
}
