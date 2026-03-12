import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { Volume2 } from 'lucide-react';
import vocabData from '../../data/pokemon_vocab.json';

const getVocabInfo = (japanese: string): { hiragana: string | null; kanji: string | null } => {
  const found = (vocabData as any[]).find((v) => v.japanese === japanese);
  return found ? { hiragana: found.hiragana ?? null, kanji: found.kanji ?? null } : { hiragana: null, kanji: null };
};

interface QuizProps {
  vocab: {
    id: string;
    japanese: string;
    hiragana: string;
    zh_tw: string;
  };
  options: string[]; // 4 japanese options
  onNext: (correct: boolean) => void;
}

export function QuizMode({ vocab, options, onNext }: QuizProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    setSelected(null);
    setIsAnswered(false);
  }, [vocab]);

  const correctAnswer = vocab.japanese;

  const playAudio = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    window.speechSynthesis.speak(utterance);
  };

  const handleSelect = (opt: string) => {
    if (isAnswered) return;
    setSelected(opt);
    setIsAnswered(true);
    playAudio(opt);
  };

  const isCorrect = selected === correctAnswer;

  return (
    <div className="w-full flex flex-col items-center">
      <h2 className="text-xl font-bold text-gray-700 mb-6 w-full text-left">選出正確的日文</h2>

      {/* Show Chinese meaning as the question */}
      <div className="card w-full mb-8 flex flex-row items-center justify-between p-6">
        <div>
          <p className="text-sm text-gray-400 font-medium mb-1">這個中文的日文是？</p>
          <h3 className="text-4xl font-black text-gray-800">{vocab.zh_tw}</h3>
        </div>
        {isAnswered && (
          <button
            onClick={() => playAudio(correctAnswer)}
            className="p-4 bg-blue-50 text-blue-500 rounded-2xl hover:bg-blue-100 transition-colors flex-shrink-0 ml-4"
          >
            <Volume2 className="w-8 h-8" />
          </button>
        )}
      </div>

      {/* Japanese options */}
      <div className="w-full grid grid-cols-1 gap-3 mb-8">
        {options.map((opt, i) => {
          let stateClass = "border-gray-200 bg-white hover:bg-gray-50 text-gray-700";

          if (isAnswered) {
            if (opt === correctAnswer) {
              stateClass = "border-green-500 bg-green-100 text-green-700";
            } else if (opt === selected) {
              stateClass = "border-red-500 bg-red-100 text-red-700";
            } else {
              stateClass = "border-gray-200 bg-white text-gray-400 opacity-50";
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(opt)}
              disabled={isAnswered}
              className={clsx(
                "w-full text-left font-bold text-xl p-4 rounded-2xl border-2 transition-all flex items-center justify-between",
                stateClass
              )}
            >
              <span className="flex flex-col">
                <span>{opt}</span>
                {isAnswered && (() => {
                  const info = getVocabInfo(opt);
                  const sub = [info.hiragana, info.kanji].filter(Boolean).join('  /  ');
                  return sub ? <span className="text-sm font-normal mt-0.5 opacity-70">{sub}</span> : null;
                })()}
              </span>
              {isAnswered && opt === correctAnswer && <span className="text-green-500 text-2xl font-black flex-shrink-0 ml-2">✓</span>}
              {isAnswered && opt === selected && opt !== correctAnswer && <span className="text-red-500 text-2xl font-black flex-shrink-0 ml-2">✗</span>}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className="w-full">
          <button
            onClick={() => onNext(isCorrect)}
            className={clsx(
              "w-full py-4 text-xl font-bold rounded-2xl active:translate-y-1 transition-all text-white",
              isCorrect
                ? 'bg-green-500 shadow-[0_4px_0_0_rgba(34,197,94,1)]'
                : 'bg-blue-500 shadow-[0_4px_0_0_rgba(29,78,216,1)]'
            )}
          >
            繼續
          </button>
        </div>
      )}
    </div>
  );
}
