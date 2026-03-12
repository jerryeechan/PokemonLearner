import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { Volume2 } from 'lucide-react';

interface QuizProps {
  vocab: {
    id: string;
    japanese: string;
    hiragana: string;
    zh_tw: string;
  };
  options: string[]; // 4 options (katakana or hiragana)
  onNext: (correct: boolean) => void;
}

export function QuizMode({ vocab, options, onNext }: QuizProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Reset state when vocab changes
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
    playAudio(opt);
    setSelected(opt);
  };

  const handleSubmit = () => {
    if (!selected) return;
    if (isAnswered) {
      onNext(selected === correctAnswer);
    } else {
      setIsAnswered(true);
      if (selected === correctAnswer) {
        playAudio(correctAnswer); // Play correct answer audio on reveal
      }
    }
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
        {/* Audio button shows after answer is revealed */}
        {isAnswered && (
          <button 
            onClick={() => playAudio(correctAnswer)}
            className="p-4 bg-blue-50 text-blue-500 rounded-2xl hover:bg-blue-100 transition-colors"
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
          } else if (opt === selected) {
            stateClass = "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200";
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(opt)}
              disabled={isAnswered}
              className={clsx(
                "w-full text-left font-bold text-xl p-4 rounded-2xl border-2 transition-all",
                stateClass,
                !isAnswered && opt === selected ? "shadow-sm" : ""
              )}
            >
              {opt}
            </button>
          )
        })}
      </div>

      <div className="w-full">
        <button 
          disabled={!selected}
          onClick={handleSubmit}
          className={clsx(
            "w-full py-4 text-xl font-bold rounded-2xl shadow-[0_6px_0_0_rgba(0,0,0,0.1)] active:translate-y-2 active:shadow-none transition-all text-white",
            !selected ? 'bg-gray-300 shadow-none cursor-not-allowed opacity-50 border-0' :
            !isAnswered ? 'bg-green-500 shadow-[0_4px_0_0_rgba(34,197,94,1)]' :
            isCorrect ? 'bg-green-500 shadow-[0_4px_0_0_rgba(34,197,94,1)]' :
            'bg-red-500 shadow-[0_4px_0_0_rgba(239,68,68,1)]'
          )}
        >
          {!isAnswered ? '檢查' : '繼續'}
        </button>
      </div>
    </div>
  );
}
