import React from 'react';
import { useState } from 'react';
import Landing from './components/Landing';
import Whiteboard from './components/Whiteboard';

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'whiteboard'>('landing');
  const [currentRoomId, setCurrentRoomId] = useState<string>('');

  const handleEnterRoom = (roomId: string) => {
    setCurrentRoomId(roomId);
    setCurrentView('whiteboard');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    setCurrentRoomId('');
  };

  if (currentView === 'whiteboard' && currentRoomId) {
    return <Whiteboard roomId={currentRoomId} onBack={handleBackToLanding} />;
  }

  return <Landing onEnterRoom={handleEnterRoom} />;
}

export default App;