import { useState } from 'react';
import { Volume2 } from 'lucide-react';

interface FlashcardProps {
  vocab: {
    japanese: string;
    hiragana: string;
    zh_tw: string;
    explanation: string;
    etymology?: string;
    example_sentence?: string;
    example_sentence_zh?: string;
  };
  onNext: (correct: boolean) => void;
}

export function FlashcardMode({ vocab, onNext }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);
  const [hasClicked, setHasClicked] = useState(false);

  const playAudio = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(vocab.hiragana);
    utterance.lang = 'ja-JP';
    window.speechSynthesis.speak(utterance);
  };

  const handleCardClick = () => {
    // If user is selecting text, don't flip
    if (window.getSelection()?.toString().length) {
      return;
    }
    
    if (!hasClicked) {
      playAudio();
    }
    
    setFlipped(!flipped);
    setHasClicked(true);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <h2 className="text-xl font-bold text-gray-700 mb-6 w-full text-left">學習新單字！</h2>
      
      <div 
        className="relative w-full aspect-[4/5] perspective-1000 cursor-pointer"
        onClick={handleCardClick}
      >
        <div className={`w-full h-full transition-transform duration-500 transform-style-3d ${flipped ? 'rotate-y-180' : ''}`}>
          
          {/* Front */}
          <div className="absolute inset-0 backface-hidden bg-white rounded-3xl border-2 border-gray-200 shadow-sm flex flex-col items-center justify-center p-6">
            <button 
              onClick={playAudio}
              className="absolute top-4 right-4 p-3 bg-blue-50 text-blue-500 rounded-2xl hover:bg-blue-100 transition-colors"
            >
              <Volume2 className="w-6 h-6" />
            </button>
            <p className="text-2xl text-gray-500 font-bold mb-4">{vocab.hiragana}</p>
            <h3 className="text-5xl font-black text-gray-800">{vocab.japanese}</h3>
            
            <p className="absolute bottom-6 text-gray-400 font-bold animate-pulse text-sm">點擊翻面</p>
          </div>

          {/* Back */}
          <div className="absolute inset-0 backface-hidden bg-blue-500 text-white rounded-3xl shadow-sm rotate-y-180 flex flex-col items-center justify-center p-6 text-center">
            <button 
              onClick={playAudio}
              className="absolute top-4 right-4 p-3 bg-white/20 rounded-2xl hover:bg-white/30 transition-colors"
            >
              <Volume2 className="w-6 h-6" />
            </button>
            <h3 className="text-4xl font-black mb-6">{vocab.zh_tw}</h3>
            <p className="text-lg font-bold mb-4 bg-white/20 p-3 rounded-xl">{vocab.explanation}</p>
            {vocab.etymology && (
              <p className="text-sm opacity-90 mb-4 text-left w-full"><span className="font-black">✎ 典故：</span>{vocab.etymology}</p>
            )}
            {vocab.example_sentence && (
              <p className="text-sm italic opacity-80 text-left w-full"><span className="font-black">🗣 例句：</span>{vocab.example_sentence}</p>
            )}
            {vocab.example_sentence_zh && (
              <p className="text-sm italic opacity-70 text-left w-full"><span className="font-black">🇹🇼 翻譯：</span>{vocab.example_sentence_zh}</p>
            )}
          </div>
        </div>
      </div>

      <div className="w-full mt-8">
        <button 
          disabled={!hasClicked}
          onClick={() => onNext(true)}
          className={`btn-primary w-full py-4 text-xl shadow-[0_6px_0_0_rgba(34,197,94,1)] active:translate-y-2 ${!hasClicked ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
        >
          我學會了！
        </button>
      </div>
    </div>
  );
}
