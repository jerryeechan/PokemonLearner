import { useState, useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import vocabData from '../../data/pokemon_vocab.json';

interface ClozeProps {
  vocab: {
    japanese: string;
    hiragana: string;
    zh_tw: string;
    example_sentence?: string;
    example_sentence_zh?: string;
  };
  options: string[];
  onNext: (correct: boolean) => void;
}

// Helper to find zh_tw of a Japanese word from vocabData
const getZhTw = (japanese: string): string | null => {
  const found = (vocabData as any[]).find((v) => v.japanese === japanese);
  return found ? found.zh_tw : null;
};

export function ClozeMode({ vocab, options, onNext }: ClozeProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);

  // Reset state when vocab changes (for continuous play)
  useEffect(() => {
    setSelected(null);
    setHasAnswered(false);
    setShowTranslation(false);
    setIsCorrectAnswer(false);
  }, [vocab.japanese]);

  const playAudio = () => {
    if (!vocab.example_sentence) return;
    const utterance = new SpeechSynthesisUtterance(vocab.example_sentence);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.9; // Slightly slower for sentences
    window.speechSynthesis.speak(utterance);
  };

  const handleSelect = (option: string) => {
    if (hasAnswered) return;
    setSelected(option);
    setHasAnswered(true);
    setShowTranslation(true); // Auto-reveal translation after answering

    const isCorrect = option === vocab.japanese;
    setIsCorrectAnswer(isCorrect);

    if (isCorrect) {
      playAudio();
    }
  };

  // Replace occurrences of the vocabulary word in the example sentence with blanks
  const sentence = vocab.example_sentence || '';
  let maskedSentence = sentence;
  if (sentence.includes(vocab.japanese)) {
    maskedSentence = sentence.split(vocab.japanese).join('____');
  } else if (sentence.includes(vocab.hiragana)) {
    maskedSentence = sentence.split(vocab.hiragana).join('____');
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex justify-between items-center w-full mb-6 relative">
        <h2 className="text-xl font-bold text-gray-700">填空測驗</h2>
        <button 
          onClick={playAudio}
          className="p-3 bg-blue-50 text-blue-500 rounded-2xl hover:bg-blue-100 transition-colors"
          title="播放例句"
        >
          <Volume2 className="w-6 h-6" />
        </button>
      </div>
      
      <div className="card w-full p-6 mb-6 text-center bg-gray-50 border-2 border-gray-100 min-h-[120px] flex flex-col justify-center items-center">
        <h3 className="text-2xl font-black text-gray-800 mb-4 leading-relaxed tracking-wide">
          {maskedSentence}
        </h3>
        {vocab.example_sentence_zh && (
          <div className="mt-1 text-md font-medium min-h-[24px]">
            {showTranslation ? (
              <p className="text-gray-500">翻譯：{vocab.example_sentence_zh}</p>
            ) : (
              <button 
                onClick={() => setShowTranslation(true)}
                className="text-blue-400 hover:text-blue-500 underline underline-offset-4 decoration-dotted transition-colors cursor-pointer"
              >
                點我顯示翻譯
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 w-full">
        {options.map((option, idx) => {
          const zh = getZhTw(option);
          const isCorrectOption = option === vocab.japanese;
          const isSelected = selected === option;

          let containerClass = "w-full text-left rounded-2xl border-2 px-5 py-3 transition-all shadow-sm font-bold cursor-pointer";
          let textClass = "text-gray-700";
          let subTextClass = "text-gray-400";

          if (hasAnswered) {
            if (isCorrectOption) {
              containerClass += " border-green-500 bg-green-50";
              textClass = "text-green-700";
              subTextClass = "text-green-500";
            } else if (isSelected) {
              containerClass += " border-red-500 bg-red-50";
              textClass = "text-red-700";
              subTextClass = "text-red-400";
            } else {
              containerClass += " border-gray-200 bg-white opacity-60";
            }
          } else {
            containerClass += " border-gray-200 bg-white hover:bg-gray-50 active:scale-95";
          }

          return (
            <button
              key={idx}
              disabled={hasAnswered}
              className={containerClass}
              onClick={() => handleSelect(option)}
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-start">
                  <span className={`text-lg ${textClass}`}>{option}</span>
                  {hasAnswered && zh && (
                    <span className={`text-sm mt-0.5 ${subTextClass}`}>{zh}</span>
                  )}
                </div>
                {hasAnswered && isCorrectOption && (
                  <span className="text-green-500 text-2xl font-black ml-4">✓</span>
                )}
                {hasAnswered && isSelected && !isCorrectOption && (
                  <span className="text-red-500 text-2xl font-black ml-4">✗</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {hasAnswered && (
        <button
          onClick={() => onNext(isCorrectAnswer)}
          className={`w-full mt-6 py-4 text-xl font-black rounded-2xl transition-all active:translate-y-1 ${
            isCorrectAnswer
              ? 'bg-green-500 text-white shadow-[0_6px_0_0_rgba(22,163,74,1)]'
              : 'bg-blue-500 text-white shadow-[0_6px_0_0_rgba(29,78,216,1)]'
          }`}
        >
          繼續
        </button>
      )}
    </div>
  );
}

