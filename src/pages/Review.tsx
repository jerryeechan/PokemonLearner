import { clsx } from 'clsx';
import { useMemo, useState } from 'react';
import { VocabDetailModal } from '../components/VocabDetailModal';
import { chapters } from '../data/chapters';
import vocabData from '../data/pokemon_vocab.json';
import { useProgressStore } from '../stores/progressStore';

type VocabItem = typeof vocabData[0];

const CATEGORY_LABELS: Record<string, string> = {
  'Pokemon': '寶可夢',
  'Move': '招式',
  'Item': '道具',
  'Ability': '特性',
  'Location': '地點',
  'Battle': '對戰',
  'UI': '介面',
  'Dialogue': '對話',
  'Status': '狀態',
  'Type': '屬性',
};

export function Review() {
  const { vocabProgress, unlockedChapters } = useProgressStore();
  const now = Date.now();

  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<VocabItem | null>(null);

  // Words past their review time
  const wordsToReview = Object.values(vocabProgress).filter(
    (p) => p.level > 0 && p.nextReviewTime <= now
  );

  // Build word → first chapter lookup
  const wordToChapter = useMemo(() => {
    const map: Record<string, number> = {};
    for (const chapter of chapters) {
      for (const id of chapter.vocabIds) {
        if (!map[id]) map[id] = chapter.id;
      }
    }
    return map;
  }, []);

  // All unique vocab IDs from unlocked chapters
  const unlockedVocabIds = useMemo(() => {
    const ids = new Set<string>();
    for (const chapter of chapters) {
      if (unlockedChapters.includes(chapter.id)) {
        for (const id of chapter.vocabIds) ids.add(id);
      }
    }
    return ids;
  }, [unlockedChapters]);

  // All words from unlocked chapters (flat, in vocab JSON order)
  const learnedWords = useMemo(
    () => (vocabData as VocabItem[]).filter(v => unlockedVocabIds.has(v.id)),
    [unlockedVocabIds]
  );

  // Only unlocked chapters (for filter pills)
  const availableChapters = useMemo(
    () => chapters.filter(ch => unlockedChapters.includes(ch.id)),
    [unlockedChapters]
  );

  // Categories present in learned words
  const availableCategories = useMemo(
    () => [...new Set(learnedWords.map(v => v.category))],
    [learnedWords]
  );

  // Apply filters
  const filteredWords = useMemo(() => {
    let words = learnedWords;
    if (selectedChapter !== null) {
      words = words.filter(v => wordToChapter[v.id] === selectedChapter);
    }
    if (selectedCategory !== null) {
      words = words.filter(v => v.category === selectedCategory);
    }
    return words;
  }, [learnedWords, selectedChapter, selectedCategory, wordToChapter]);

  const filterActive = selectedChapter !== null || selectedCategory !== null;

  return (
    <div className="w-full pb-20">
      <h1 className="text-2xl font-black text-center mb-6 text-gray-800">間隔複習 (SRS)</h1>

      {/* Daily drill card */}
      <div className="card mb-6 bg-blue-50 border-blue-200 p-6 flex flex-col items-center">
        <h2 className="text-xl font-black text-blue-700">每日特訓時間</h2>
        <p className="text-blue-600 mt-2 mb-6 font-bold text-center">
          有 <span className="text-2xl text-blue-800">{wordsToReview.length}</span> 個單字需要特訓
        </p>
        <button
          disabled={wordsToReview.length === 0}
          className="btn-primary w-full disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed bg-blue-500 shadow-[0_6px_0_0_rgba(59,130,246,1)] border-blue-600 hover:bg-blue-400 text-xl py-4"
        >
          開始特訓
        </button>
      </div>

      <h3 className="text-xl font-black text-gray-800 mb-4 px-2 border-l-4 border-green-500 ml-1">進度管理中心</h3>

      {learnedWords.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 font-bold">還沒有學習紀錄！<br />快去首頁開始冒險吧！</p>
        </div>
      ) : (
        <>
          {/* Filter section */}
          <div className="mb-3 flex flex-col gap-2">
            {/* Chapter filters */}
            <div className="overflow-x-auto pb-1">
              <div className="flex gap-2 w-max">
                <button
                  onClick={() => setSelectedChapter(null)}
                  className={clsx(
                    'px-3 py-1.5 rounded-full text-xs font-black border-2 whitespace-nowrap transition-colors',
                    selectedChapter === null
                      ? 'bg-green-500 border-green-600 text-white'
                      : 'bg-white border-gray-200 text-gray-500'
                  )}
                >全部章節</button>
                {availableChapters.map(ch => (
                  <button
                    key={ch.id}
                    onClick={() => setSelectedChapter(selectedChapter === ch.id ? null : ch.id)}
                    className={clsx(
                      'px-3 py-1.5 rounded-full text-xs font-black border-2 whitespace-nowrap transition-colors',
                      selectedChapter === ch.id
                        ? 'bg-green-500 border-green-600 text-white'
                        : 'bg-white border-gray-200 text-gray-500'
                    )}
                  >Unit {ch.id}</button>
                ))}
              </div>
            </div>

            {/* Category filters */}
            <div className="overflow-x-auto pb-1">
              <div className="flex gap-2 w-max">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={clsx(
                    'px-3 py-1.5 rounded-full text-xs font-black border-2 whitespace-nowrap transition-colors',
                    selectedCategory === null
                      ? 'bg-purple-500 border-purple-600 text-white'
                      : 'bg-white border-gray-200 text-gray-500'
                  )}
                >全部類型</button>
                {availableCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                    className={clsx(
                      'px-3 py-1.5 rounded-full text-xs font-black border-2 whitespace-nowrap transition-colors',
                      selectedCategory === cat
                        ? 'bg-purple-500 border-purple-600 text-white'
                        : 'bg-white border-gray-200 text-gray-500'
                    )}
                  >{CATEGORY_LABELS[cat] ?? cat}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Word count */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400 font-bold">
              {filterActive ? `篩選後 ${filteredWords.length} / ${learnedWords.length} 個單字` : `共 ${learnedWords.length} 個單字`}
            </span>
            {filterActive && (
              <button
                onClick={() => { setSelectedChapter(null); setSelectedCategory(null); }}
                className="text-xs text-red-400 font-black hover:text-red-500"
              >清除篩選</button>
            )}
          </div>

          {/* Word list */}
          <div className="flex flex-col gap-2">
            {filteredWords.length === 0 ? (
              <div className="text-center py-8 text-gray-400 font-bold bg-gray-50 rounded-2xl">
                篩選結果為空
              </div>
            ) : (
              filteredWords.map(word => {
                const level = vocabProgress[word.id]?.level ?? 0;
                const chapterId = wordToChapter[word.id];

                return (
                  <button
                    key={word.id}
                    onClick={() => setSelectedWord(word)}
                    className="flex items-center justify-between p-3 bg-white rounded-xl border-2 border-gray-100 shadow-sm hover:border-green-300 hover:shadow-md transition-all text-left w-full active:scale-[0.98]"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="font-black text-xl text-gray-800">{word.japanese}</span>
                      <span className="text-xs font-bold text-gray-500">{word.zh_tw}</span>
                      <div className="flex gap-1.5 mt-1 flex-wrap">
                        {chapterId && (
                          <span className="text-[10px] font-black bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full">
                            Unit {chapterId}
                          </span>
                        )}
                        <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                          {CATEGORY_LABELS[word.category] ?? word.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-3">
                      <span className="text-xs font-black text-orange-500 uppercase tracking-wider bg-orange-100 px-2 py-1 rounded-full">
                        Level {level}
                      </span>
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map(l => (
                          <div
                            key={l}
                            className={`w-3 h-3 rounded-full ${l <= level ? 'bg-orange-400' : 'bg-gray-200'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Word detail modal */}
      <VocabDetailModal
        vocab={selectedWord}
        level={selectedWord ? (vocabProgress[selectedWord.id]?.level ?? 0) : 0}
        onClose={() => setSelectedWord(null)}
      />
    </div>
  );
}
