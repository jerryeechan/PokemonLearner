import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Game } from './pages/Game';
import { Home } from './pages/Home';
import { Profile } from './pages/Profile';
import { Review } from './pages/Review';
import { initNotifications } from './services/notificationScheduler';
import { useProgressStore } from './stores/progressStore';

function App() {
  const { updateStreak } = useProgressStore();

  useEffect(() => {
    // Update streak logic on app launch
    updateStreak();
    // Initialize notification scheduling
    initNotifications();
  }, [updateStreak]);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="review" element={<Review />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      {/* Game page has no Layout (no BottomNav) because it's full screen */}
      <Route path="/game/:chapterId" element={<Game />} />
    </Routes>
  );
}

export default App;
