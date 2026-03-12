import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Review } from './pages/Review';
import { Profile } from './pages/Profile';
import { Game } from './pages/Game';
import { useEffect } from 'react';
import { useProgressStore } from './stores/progressStore';

function App() {
  const { updateStreak } = useProgressStore();

  useEffect(() => {
    // Update streak logic on app launch
    updateStreak();
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
