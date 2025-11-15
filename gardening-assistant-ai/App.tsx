
import React, { useState } from 'react';
import { Chatbot } from './components/Chatbot';
import { PlantIdentifier } from './components/PlantIdentifier';
import { Icon } from './components/Icon';

type View = 'chat' | 'plant';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('plant');

  const renderView = () => {
    switch (activeView) {
      case 'chat':
        return <Chatbot />;
      case 'plant':
        return <PlantIdentifier />;
      default:
        return <PlantIdentifier />;
    }
  };

  const NavButton = ({ view, icon, label }: { view: View, icon: string, label: string }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex-1 flex flex-col items-center justify-center p-3 text-sm transition-colors duration-200 ${
        activeView === view ? 'text-green-400' : 'text-gray-400 hover:text-green-300'
      }`}
    >
      <Icon name={icon} className="w-7 h-7 mb-1" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-900 font-sans">
      <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg p-4 z-10">
        <h1 className="text-xl font-bold text-center text-green-400">Gardening Assistant AI</h1>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 pb-24">
        {renderView()}
      </main>
      
      <footer className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 shadow-lg">
        <nav className="flex justify-around max-w-2xl mx-auto">
          <NavButton view="plant" icon="plant" label="Identify Plant" />
          <NavButton view="chat" icon="chat" label="Chat Assistant" />
        </nav>
      </footer>
    </div>
  );
};

export default App;
