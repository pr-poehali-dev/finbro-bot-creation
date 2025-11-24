import { useState, useEffect } from 'react';
import Hero from '@/components/Hero';
import Chat from '@/components/Chat';
import Auth from '@/components/Auth';

interface User {
  id: number;
  email: string;
  username: string;
  token: string;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('finbro_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleStartChat = () => {
    if (user) {
      setIsChatOpen(true);
    } else {
      setShowAuth(true);
    }
  };

  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
    setShowAuth(false);
    setIsChatOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('finbro_user');
    setUser(null);
    setIsChatOpen(false);
  };

  if (showAuth) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50 to-teal-50">
      {!isChatOpen ? (
        <Hero onStartChat={handleStartChat} user={user} onLogout={handleLogout} />
      ) : (
        <Chat onClose={() => setIsChatOpen(false)} user={user} />
      )}
    </div>
  );
};

export default Index;