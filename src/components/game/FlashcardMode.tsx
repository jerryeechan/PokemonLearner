import { Volume2 } from 'lucide-react';
import { useState } from 'react';
import type { VocabContent } from '../../types/vocab';

interface FlashcardProps {
  vocab: VocabContent;
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

  const playExampleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!vocab.example_sentence) return;
    const utterance = new SpeechSynthesisUtterance(vocab.example_sentence);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  const handleCardClick = () => {
    if (window.getSelection()?.toString().length) return;
    if (!hasClicked) playAudio();
    setFlipped(!flipped);
    setHasClicked(true);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <h2 className="text-xl font-bold text-gray-700 mb-6 w-full text-left">學習新單字！</h2>

      {/* Card container with fixed height for flip animation */}
      <div
        className="relative w-full cursor-pointer"
        style={{ height: '420px', perspective: '1000px' }}
        onClick={handleCardClick}
      >
        <div
          className={`absolute inset-0 transition-transform duration-500`}
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-white rounded-3xl border-2 border-gray-200 shadow-sm flex flex-col items-center justify-center p-6"
            style={{ backfaceVisibility: 'hidden' }}
          >
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
          <div
            className="absolute inset-0 bg-blue-500 text-white rounded-3xl shadow-sm flex flex-col p-5 overflow-y-auto"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            {/* Header row: word + audio button */}
            <div className="flex items-start justify-between mb-3 flex-shrink-0">
              <h3 className="text-3xl font-black leading-tight">{vocab.zh_tw}</h3>
              <button
                onClick={playAudio}
                className="p-2.5 bg-white/20 rounded-2xl hover:bg-white/30 transition-colors flex-shrink-0 ml-3"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            {/* Explanation */}
            <p className="text-sm font-bold mb-3 bg-white/20 p-3 rounded-xl flex-shrink-0 leading-relaxed">
              {vocab.explanation}
            </p>

            {/* Etymology */}
            {vocab.etymology && (
              <p className="text-xs opacity-90 mb-3 flex-shrink-0 leading-relaxed">
                <span className="font-black">✎ 典故：</span>{vocab.etymology}
              </p>
            )}

            {/* Example sentence with audio button */}
            {vocab.example_sentence && (
              <div className="mb-2 flex-shrink-0 bg-white/10 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <p className="text-xs font-black mb-1">🗣 例句</p>
                    <p className="text-sm italic opacity-90 leading-relaxed">{vocab.example_sentence}</p>
                  </div>
                  <button
                    onClick={playExampleAudio}
                    className="p-1.5 bg-white/20 rounded-xl hover:bg-white/30 transition-colors flex-shrink-0 mt-0.5"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                {vocab.example_sentence_zh && (
                  <p className="text-xs italic opacity-70 mt-2 leading-relaxed">
                    <span className="font-black not-italic">🇹🇼 翻譯：</span>{vocab.example_sentence_zh}
                  </p>
                )}
                {vocab.example_sentence_explanation && (
                  <p className="text-xs opacity-80 mt-2 leading-relaxed">
                    <span className="font-black">📘 解析：</span>{vocab.example_sentence_explanation}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full mt-6">
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
