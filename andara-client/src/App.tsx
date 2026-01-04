import { Routes, Route } from 'react-router-dom';
import { CharacterCreationWizard } from './components/character-creation/CharacterCreationWizard';
import { LandingPage } from './components/landing/LandingPage';
import { CharacterSheet } from './components/character-sheet/CharacterSheet';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/character-creation" element={<CharacterCreationWizard />} />
      <Route path="/character-sheet" element={<CharacterSheet />} />
      <Route path="/character-sheet/:characterId" element={<CharacterSheet />} />
      <Route path="/" element={<LandingPage />} />
    </Routes>
  );
}

export default App;
