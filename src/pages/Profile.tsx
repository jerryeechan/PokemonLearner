import { useProgressStore } from '../stores/progressStore';

export function Profile() {
  const { xp, streak } = useProgressStore();

  return (
    <div className="w-full">
      <h1 className="text-2xl font-black text-center mb-8">訓練家檔案</h1>

      <div className="flex justify-center mb-8">
        <div className="w-32 h-32 bg-gray-200 rounded-full border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
           <span className="text-4xl">🧢</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="card text-center border-orange-200">
          <p className="font-bold text-gray-500 text-sm">連勝天數</p>
          <p className="text-2xl font-black text-orange-500 flex items-center justify-center gap-1 mt-1">
            🔥 {streak}
          </p>
        </div>
        <div className="card text-center border-blue-200">
          <p className="font-bold text-gray-500 text-sm">總經驗值</p>
          <p className="text-2xl font-black text-blue-500 flex items-center justify-center gap-1 mt-1">
            ⭐ {xp}
          </p>
        </div>
      </div>

      <h3 className="font-bold text-gray-500 mb-4 px-2">成就徽章</h3>
      <div className="grid grid-cols-3 gap-4">
        {/* Placeholder Badges */}
        {[
          { icon: '🥉', title: '初心者', active: true },
          { icon: '🥈', title: '熟練者', active: xp > 1000 },
          { icon: '🥇', title: '大師', active: xp > 5000 },
        ].map((badge, i) => (
          <div key={i} className={`flex flex-col items-center p-3 rounded-2xl ${badge.active ? 'bg-white shadow-sm border-2 border-gray-200' : 'bg-gray-100 opacity-50 grayscale'}`}>
            <span className="text-3xl mb-2">{badge.icon}</span>
            <span className="text-xs font-bold text-gray-600">{badge.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
