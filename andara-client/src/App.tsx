import { Routes, Route } from 'react-router-dom';
import { CharacterCreationWizard } from './components/character-creation/CharacterCreationWizard';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/character-creation" element={<CharacterCreationWizard />} />
      <Route path="/" element={<div>Welcome to Andara&apos;s World</div>} />
    </Routes>
  );
}

export default App;
