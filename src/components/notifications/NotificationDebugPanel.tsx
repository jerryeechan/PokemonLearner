import { useState } from 'react';
import { notificationCharacters } from '../../data/notificationCharacters';
import { isNotificationSupported, requestNotificationPermission } from '../../services/notificationPermission';
import { registerServiceWorker, scheduleNextNotification } from '../../services/notificationScheduler';
import { useNotificationStore } from '../../stores/notificationStore';
import { useProgressStore } from '../../stores/progressStore';

type StreakScenario = 'streakAtRisk' | 'streakBroken' | 'longStreak' | 'comeBack';

function getDateString(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

export function NotificationDebugPanel() {
  const progressStore = useProgressStore();
  const notifStore = useNotificationStore();
  const [testResult, setTestResult] = useState('');

  const scenarios: { label: string; scenario: StreakScenario; desc: string }[] = [
    { label: '🔥 連勝危機', scenario: 'streakAtRisk', desc: '昨天有練習，今天還沒' },
    { label: '💔 連勝中斷', scenario: 'streakBroken', desc: '前天有練習，昨天沒練' },
    { label: '🏆 長連勝', scenario: 'longStreak', desc: '連勝 ≥7 天' },
    { label: '👋 久違回歸', scenario: 'comeBack', desc: '超過 3 天沒來' },
  ];

  const simulateScenario = (scenario: StreakScenario) => {
    switch (scenario) {
      case 'streakAtRisk':
        // Played yesterday, not today → streak at risk
        useProgressStore.setState({
          lastSessionDate: getDateString(1),
          streak: 3,
        });
        break;
      case 'streakBroken':
        // Played 2 days ago, missed yesterday → streak broken
        useProgressStore.setState({
          lastSessionDate: getDateString(2),
          streak: 1,
        });
        break;
      case 'longStreak':
        // Long streak, played today
        useProgressStore.setState({
          lastSessionDate: getDateString(0),
          streak: 10,
        });
        break;
      case 'comeBack':
        // Haven't played in days
        useProgressStore.setState({
          lastSessionDate: getDateString(5),
          streak: 0,
        });
        break;
    }
    // Reset banner dismissal so it shows again
    useNotificationStore.setState({ lastBannerDismissed: '' });
    setTestResult(`已模擬「${scenario}」情境。回首頁查看橫幅！`);
  };

  const resetBanner = () => {
    useNotificationStore.setState({ lastBannerDismissed: '' });
    setTestResult('橫幅已重置，回首頁即可看到');
  };

  const sendTestNotification = async () => {
    if (!isNotificationSupported()) {
      setTestResult('此瀏覽器不支援通知');
      return;
    }

    const permission = await requestNotificationPermission();
    if (!permission) {
      setTestResult('通知權限未授予');
      return;
    }

    notifStore.setPermissionGranted(true);

    const reg = await registerServiceWorker();
    if (!reg) {
      setTestResult('Service Worker 註冊失敗');
      return;
    }

    // Wait for SW to be active
    if (!reg.active) {
      await new Promise<void>((resolve) => {
        const w = reg.installing || reg.waiting;
        if (w) {
          w.addEventListener('statechange', () => {
            if (w.state === 'activated') resolve();
          });
        } else {
          resolve();
        }
      });
    }

    // Send notification with 3 second delay
    const eligible = notificationCharacters.filter(
      (c) => c.unlockedByChapter <= Math.max(...progressStore.unlockedChapters)
    );
    const char = eligible[Math.floor(Math.random() * eligible.length)] || notificationCharacters[0];
    const msgs = char.messages.streakAtRisk;
    const msg = msgs[Math.floor(Math.random() * msgs.length)];

    reg.active?.postMessage({
      type: 'SCHEDULE_NOTIFICATION',
      title: `${char.emoji} ${char.nameJa} (${char.nameZh})`,
      body: msg,
      delayMs: 3000,
      tag: 'pokemon-learner-test',
    });

    setTestResult(`3 秒後將收到 ${char.nameZh} 的通知...`);
  };

  const testSchedule = async () => {
    const reg = await registerServiceWorker();
    if (!reg) {
      setTestResult('SW 註冊失敗');
      return;
    }
    if (!reg.active) {
      await new Promise<void>((resolve) => {
        const w = reg.installing || reg.waiting;
        if (w) w.addEventListener('statechange', () => { if (w.state === 'activated') resolve(); });
        else resolve();
      });
    }
    notifStore.setEnabled(true);
    scheduleNextNotification(reg);
    setTestResult(`已排程通知，預計 ${notifStore.preferredHour}:00 發送（SW 可能被瀏覽器提早終止）`);
  };

  const resetAll = () => {
    useNotificationStore.setState({
      permissionGranted: false,
      hasBeenAsked: false,
      dismissCount: 0,
      lastDismissDate: '',
      enabled: false,
      lastBannerDismissed: '',
    });
    setTestResult('通知設定已全部重置');
  };

  const today = new Date().toISOString().split('T')[0];
  const browserPerm = 'Notification' in window ? Notification.permission : 'unsupported';

  return (
    <div className="mt-8">
      <h3 className="font-bold text-red-500 mb-4 px-2">🛠 Debug 面板</h3>

      {/* Current State */}
      <div className="card p-3 mb-4 text-xs space-y-1 font-mono">
        <p className="font-bold text-gray-600 text-sm mb-2">狀態一覽</p>
        <p>today: {today}</p>
        <p>lastSessionDate: <span className="text-blue-600">{progressStore.lastSessionDate || '(empty)'}</span></p>
        <p>lastPlayedDate: <span className="text-blue-600">{progressStore.lastPlayedDate || '(empty)'}</span></p>
        <p>streak: <span className="text-orange-500 font-bold">{progressStore.streak}</span></p>
        <p>xp: {progressStore.xp}</p>
        <p>unlockedChapters: [{progressStore.unlockedChapters.join(', ')}]</p>
        <hr className="my-2" />
        <p>browserPermission: <span className={browserPerm === 'granted' ? 'text-green-600' : 'text-red-500'}>{browserPerm}</span></p>
        <p>notif.enabled: {String(notifStore.enabled)}</p>
        <p>notif.permissionGranted: {String(notifStore.permissionGranted)}</p>
        <p>notif.hasBeenAsked: {String(notifStore.hasBeenAsked)}</p>
        <p>notif.dismissCount: {notifStore.dismissCount}</p>
        <p>notif.lastBannerDismissed: {notifStore.lastBannerDismissed || '(empty)'}</p>
        <p>notif.preferredHour: {notifStore.preferredHour}:00</p>
      </div>

      {/* Scenario Simulation */}
      <div className="card p-3 mb-4">
        <p className="font-bold text-sm mb-3">模擬橫幅情境</p>
        <div className="grid grid-cols-2 gap-2">
          {scenarios.map((s) => (
            <button
              key={s.scenario}
              onClick={() => simulateScenario(s.scenario)}
              className="text-left p-2 rounded-xl bg-gray-50 hover:bg-gray-100 active:scale-[0.98] transition-all border"
            >
              <p className="text-sm font-bold">{s.label}</p>
              <p className="text-xs text-gray-400">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="card p-3 mb-4 space-y-2">
        <p className="font-bold text-sm mb-2">測試動作</p>
        <button
          onClick={resetBanner}
          className="w-full text-left p-2 rounded-xl bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 text-sm"
        >
          🔄 重置橫幅（不改變情境）
        </button>
        <button
          onClick={sendTestNotification}
          className="w-full text-left p-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-sm"
        >
          🔔 發送測試通知（3秒後）
        </button>
        <button
          onClick={testSchedule}
          className="w-full text-left p-2 rounded-xl bg-green-50 hover:bg-green-100 border border-green-200 text-sm"
        >
          ⏰ 排程通知（到 preferredHour）
        </button>
        <button
          onClick={resetAll}
          className="w-full text-left p-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-sm"
        >
          🗑 重置所有通知設定
        </button>
      </div>

      {/* Test Result */}
      {testResult && (
        <div className="card p-3 bg-green-50 border-green-200">
          <p className="text-sm text-green-700">{testResult}</p>
        </div>
      )}
    </div>
  );
}
