import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import vocabData from '../../data/pokemon_vocab.json';

interface MatchProps {
  vocabIds: string[]; // typically 4-5 ids
  onNext: (correct: boolean) => void;
}

export function MatchMode({ vocabIds, onNext }: MatchProps) {
  const [items, setItems] = useState<{ id: string, text: string, type: 'ja' | 'zh', vocabId: string, hiragana?: string }[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]); // ids of vocab that are matched

  useEffect(() => {
    const newItems: { id: string, text: string, type: 'ja' | 'zh', vocabId: string, hiragana?: string }[] = [];
    
    vocabIds.forEach((vid, index) => {
      const vocab = vocabData.find((v: any) => v.id === vid);
      if (vocab) {
        newItems.push({ id: `ja_${index}`, text: (vocab as any).japanese || vocab.hiragana, type: 'ja', vocabId: vid, hiragana: vocab.hiragana });
        newItems.push({ id: `zh_${index}`, text: vocab.zh_tw, type: 'zh', vocabId: vid });
      }
    });

    // Shuffle the items
    setItems(newItems.sort(() => 0.5 - Math.random()));
    setSelectedId(null);
    setMatchedIds([]);
  }, [vocabIds]);

  const handleSelect = (itemId: string, vocabId: string) => {
    if (matchedIds.includes(vocabId)) return; // Already matched

    const clickedItem = items.find(i => i.id === itemId);
    
    if (clickedItem && clickedItem.type === 'ja' && clickedItem.hiragana) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(clickedItem.hiragana);
      utterance.lang = 'ja-JP';
      window.speechSynthesis.speak(utterance);
    }

    if (!selectedId) {
      setSelectedId(itemId);
      return;
    }

    if (selectedId === itemId) {
      // Deselect
      setSelectedId(null);
      return;
    }

    const selectedItem = items.find(i => i.id === selectedId);

    if (selectedItem && clickedItem && selectedItem.vocabId === clickedItem.vocabId && selectedItem.type !== clickedItem.type) {
      // Match found
      setMatchedIds([...matchedIds, vocabId]);
      setSelectedId(null);
      
      // If all matched
      if (matchedIds.length + 1 === vocabIds.length) {
        setTimeout(() => {
          onNext(true); // Complete
        }, 800);
      }
    } else {
      // Mismatch
      setSelectedId(null);
      // Play negative sound / shake effect
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <h2 className="text-xl font-bold text-gray-700 w-full text-left mb-6">配對連連看</h2>
      
      <div className="w-full grid grid-cols-2 gap-4">
        {items.map((item) => {
          const isMatched = matchedIds.includes(item.vocabId);
          const isSelected = selectedId === item.id;
          
          return (
            <button
              key={item.id}
              disabled={isMatched}
              onClick={() => handleSelect(item.id, item.vocabId)}
              className={clsx(
                "w-full py-4 px-2 rounded-2xl border-2 text-center text-lg font-bold transition-all shadow-sm active:translate-y-1 active:shadow-none",
                isMatched ? "bg-gray-100 border-gray-200 text-gray-300 shadow-none scale-95 opacity-50" :
                isSelected ? "bg-blue-100 border-blue-500 text-blue-700 ring-4 ring-blue-200" :
                "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              )}
            >
              {item.text}
            </button>
          )
        })}
      </div>
    </div>
  );
}
