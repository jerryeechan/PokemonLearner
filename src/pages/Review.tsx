import { useProgressStore } from '../stores/progressStore';
import vocabData from '../data/pokemon_vocab.json';
import { chapters } from '../data/chapters';

export function Review() {
  const { vocabProgress } = useProgressStore();

  const now = Date.now();
  
  // Find words that need review (level > 0 and past their review time)
  const wordsToReview = Object.values(vocabProgress).filter(
    (progress) => progress.level > 0 && progress.nextReviewTime <= now
  );

  return (
    <div className="w-full pb-20">
      <h1 className="text-2xl font-black text-center mb-6 text-gray-800">間隔複習 (SRS)</h1>
      
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
      
      <div className="flex flex-col gap-6">
        {chapters.map((chapter) => {
           const chapterVocab = vocabData.filter((v: any) => chapter.vocabIds.includes(v.id));
           
           // Check if there's any progress in this chapter
           const hasProgress = chapterVocab.some(word => vocabProgress[word.id]);
           
           if (!hasProgress) return null; // Only show chapters the user has started learning

           return (
             <div key={chapter.id} className="bg-white rounded-2xl p-5 border-2 border-gray-100 shadow-sm">
                <div className="mb-4 text-center">
                  <h4 className="font-black text-gray-700 text-lg">Unit {chapter.id}: {chapter.title}</h4>
                  <p className="text-sm font-bold text-gray-400">{chapter.desc}</p>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {chapterVocab.map((word: any) => {
                    const progress = vocabProgress[word.id];
                    const level = progress ? progress.level : 0;
                    
                    return (
                      <div key={word.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex flex-col">
                          <span className="font-black text-xl text-gray-800">{word.japanese}</span>
                          <span className="text-xs font-bold text-gray-500">{word.zh_tw}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs font-black text-orange-500 uppercase tracking-wider bg-orange-100 px-2 py-1 rounded-full">
                             Level {level}
                          </span>
                          <div className="flex gap-1 mt-1">
                            {/* 5 SRS Levels */}
                            {[1,2,3,4,5].map(l => (
                              <div 
                                key={l} 
                                className={`w-3 h-3 rounded-full ${l <= level ? 'bg-orange-400' : 'bg-gray-200'}`}
                              ></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
             </div>
           );
        })}
        {Object.keys(vocabProgress).length === 0 && (
           <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500 font-bold">還沒有學習紀錄！<br/>快去首頁開始冒險吧！</p>
           </div>
        )}
      </div>
    </div>
  );
}
