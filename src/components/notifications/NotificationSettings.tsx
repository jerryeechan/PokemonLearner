import { getNotificationPermissionState, isNotificationSupported } from '../../services/notificationPermission';
import { useNotificationStore } from '../../stores/notificationStore';

export function NotificationSettings() {
  const { enabled, preferredHour, permissionGranted, setEnabled, setPreferredHour } = useNotificationStore();

  if (!isNotificationSupported()) {
    return (
      <div className="mt-8">
        <h3 className="font-bold text-gray-500 mb-4 px-2">通知設定</h3>
        <div className="card p-4">
          <p className="text-sm text-gray-400">此瀏覽器不支援通知功能</p>
        </div>
      </div>
    );
  }

  const browserPermission = getNotificationPermissionState();
  const isDenied = browserPermission === 'denied';

  return (
    <div className="mt-8">
      <h3 className="font-bold text-gray-500 mb-4 px-2">通知設定 🔔</h3>
      <div className="card p-4 space-y-4">
        {/* Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-sm">每日提醒</p>
            <p className="text-xs text-gray-400">讓道館館主督促你練習</p>
          </div>
          <button
            onClick={() => setEnabled(!enabled)}
            disabled={isDenied || !permissionGranted}
            className={`w-12 h-7 rounded-full transition-colors relative ${
              enabled && permissionGranted ? 'bg-green-500' : 'bg-gray-300'
            } ${isDenied || !permissionGranted ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all shadow-sm ${
                enabled && permissionGranted ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Permission status */}
        {isDenied && (
          <p className="text-xs text-red-400">
            通知已被瀏覽器封鎖。請到瀏覽器設定中重新允許此網站的通知權限。
          </p>
        )}

        {!permissionGranted && !isDenied && (
          <p className="text-xs text-gray-400">
            完成一次練習後，會出現開啟通知的提示。
          </p>
        )}

        {/* Time picker */}
        {permissionGranted && (
          <div className="flex items-center justify-between">
            <p className="font-bold text-sm">提醒時間</p>
            <select
              value={preferredHour}
              onChange={(e) => setPreferredHour(Number(e.target.value))}
              className="bg-gray-100 rounded-lg px-3 py-1.5 text-sm font-bold border-0 outline-none"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {String(i).padStart(2, '0')}:00
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
