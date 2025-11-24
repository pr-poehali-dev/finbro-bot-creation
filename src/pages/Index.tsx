import { useState } from 'react';
import Hero from '@/components/Hero';
import Chat from '@/components/Chat';

const Index = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50 to-teal-50">
      {!isChatOpen ? (
        <Hero onStartChat={() => setIsChatOpen(true)} />
      ) : (
        <Chat onClose={() => setIsChatOpen(false)} />
      )}
    </div>
  );
};

export default Index;
