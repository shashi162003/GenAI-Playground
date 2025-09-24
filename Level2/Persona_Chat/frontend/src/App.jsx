import { useState, useEffect } from 'react';
import { fetchPersonas } from './services/api';
import Chat from './components/Chat';
import './App.css';

const PersonaSelection = ({ personas, onSelect }) => (
  <div className="app-container">
    <header className="app-header">
      <h1>Select a Persona</h1>
      <p>Choose an AI personality to start chatting with.</p>
    </header>
    <main className="persona-grid">
      {personas.map((persona) => (
        <div
          key={persona.id}
          className="persona-card"
          onClick={() => onSelect(persona)}
        >
          <img src={persona.avatar} alt={persona.name} className="persona-avatar" />
          <h2 className="persona-name">{persona.name}</h2>
          <p className="persona-title">{persona.title}</p>
          <p className="persona-bio">{persona.bio}</p>
        </div>
      ))}
    </main>
  </div>
);

function App() {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPersona, setSelectedPersona] = useState(null);

  useEffect(() => {
    const loadPersonas = async () => {
      setLoading(true);
      const data = await fetchPersonas();
      setPersonas(data);
      setLoading(false);
    };
    loadPersonas();
  }, []);

  if (selectedPersona) {
    return <Chat persona={selectedPersona} onBack={() => setSelectedPersona(null)} />;
  }

  return (
    loading
      ? <div className="loading-container"><h1>Loading Personas...</h1></div>
      : <PersonaSelection personas={personas} onSelect={setSelectedPersona} />
  );
}

export default App;