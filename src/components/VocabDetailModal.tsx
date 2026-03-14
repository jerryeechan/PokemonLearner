import { Volume2, X } from 'lucide-react';
import type { VocabContent } from '../types/vocab';

interface VocabItem extends VocabContent {
  id: string;
  category: string;
}

interface Props {
  vocab: VocabItem | null;
  level: number;
  onClose: () => void;
}

export function VocabDetailModal({ vocab, level, onClose }: Props) {
  if (!vocab) return null;

  const playAudio = (text: string, rate = 1) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = rate;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Sheet */}
      <div
        className="relative bg-white rounded-t-3xl max-w-md w-full mx-auto max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        <div className="px-5 pb-8 pt-2">
          {/* Front: Japanese + audio */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-400 font-bold">{vocab.hiragana}</p>
              <h2 className="text-4xl font-black text-gray-800">{vocab.japanese}</h2>
            </div>
            <button
              onClick={() => playAudio(vocab.hiragana)}
              className="p-3 bg-blue-50 text-blue-500 rounded-2xl hover:bg-blue-100 transition-colors mt-1"
            >
              <Volume2 className="w-6 h-6" />
            </button>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100 mb-4" />

          {/* Back: content card */}
          <div className="bg-blue-500 text-white rounded-2xl p-4 flex flex-col gap-3">
            <h3 className="text-2xl font-black">{vocab.zh_tw}</h3>

            <p className="text-sm font-bold bg-white/20 p-3 rounded-xl leading-relaxed">
              {vocab.explanation}
            </p>

            {vocab.etymology && (
              <p className="text-xs opacity-90 leading-relaxed">
                <span className="font-black">✎ 典故：</span>{vocab.etymology}
              </p>
            )}

            {vocab.example_sentence && (
              <div className="bg-white/10 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <p className="text-xs font-black mb-1">🗣 例句</p>
                    <p className="text-sm italic opacity-90 leading-relaxed">{vocab.example_sentence}</p>
                  </div>
                  <button
                    onClick={() => playAudio(vocab.example_sentence ?? '', 0.85)}
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

          {/* Level indicator */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs font-black text-orange-500 uppercase tracking-wider bg-orange-100 px-3 py-1.5 rounded-full">
              Level {level}
            </span>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map(l => (
                <div
                  key={l}
                  className={`w-4 h-4 rounded-full ${l <= level ? 'bg-orange-400' : 'bg-gray-200'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
