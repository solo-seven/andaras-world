import { Routes, Route } from 'react-router-dom';
import { CharacterCreationWizard } from './components/character-creation/CharacterCreationWizard';
import { LandingPage } from './components/landing/LandingPage';
import { CharacterSheet } from './components/character-sheet/CharacterSheet';
import { AdminContentPage } from './admin/AdminContentPage';
import { GameView } from './components/game/GameView';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/character-creation" element={<CharacterCreationWizard />} />
      <Route path="/character-sheet" element={<CharacterSheet />} />
      <Route path="/character-sheet/:characterId" element={<CharacterSheet />} />
      <Route path="/game" element={<GameView />} />
      {/* TODO: Add authentication guard when auth is implemented */}
      <Route path="/admin/content" element={<AdminContentPage />} />
      <Route path="/" element={<LandingPage />} />
    </Routes>
  );
}

export default App;
