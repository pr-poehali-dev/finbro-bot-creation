import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  email: string;
  username: string;
  token: string;
}

interface ChatProps {
  onClose: () => void;
  user: User | null;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const Chat = ({ onClose, user }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Привет! Я ФинБро — ваш финансовый помощник. Задайте мне любой вопрос о кредитах, долгах или банковских услугах!',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatId] = useState(() => `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, user]);

  const loadChatHistory = async () => {
    if (!user) return;

    try {
      const response = await fetch(`https://functions.poehali.dev/5d4033c7-415c-4990-b1fb-d4dd0598a771?chat_id=${chatId}`, {
        method: 'GET',
        headers: {
          'X-User-Id': user.id.toString(),
        },
      });

      const data = await response.json();
      if (data.messages && data.messages.length > 0) {
        const loadedMessages: Message[] = data.messages.map((msg: any) => ({
          id: Math.random().toString(),
          text: msg.text,
          isUser: msg.isUser,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(loadedMessages);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const saveMessage = async (text: string, isUser: boolean) => {
    if (!user) return;

    try {
      await fetch('https://functions.poehali.dev/5d4033c7-415c-4990-b1fb-d4dd0598a771', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id.toString(),
        },
        body: JSON.stringify({
          action: 'save_message',
          chat_id: chatId,
          message: text,
          is_user: isUser
        })
      });
    } catch (error) {
      console.error('Failed to save message:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    if (user) {
      saveMessage(inputValue, true);
    }

    try {
      const response = await fetch('https://functions.poehali.dev/91139989-5558-4c9f-8735-3000d48d388a', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          chat_id: chatId
        })
      });

      const data = await response.json();

      if (data.status && data.message) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.message,
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        
        if (user) {
          saveMessage(data.message, false);
        }

        if (data.command === 'operator') {
          toast({
            title: 'Требуется оператор',
            description: 'Запрос направлен на обработку оператору',
          });
        }

        if (data.media && data.media.length > 0) {
          console.log('Получены файлы:', data.media);
        }

        if (data.link) {
          console.log('Получена ссылка:', data.link);
        }

        if (data.form) {
          console.log('Получена форма:', data.form);
        }
      } else {
        throw new Error(data.error || 'Ошибка при получении ответа');
      }
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить сообщение. Попробуйте позже.',
        variant: 'destructive',
      });
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Извините, произошла ошибка. Попробуйте повторить запрос.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <Icon name="Bot" size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">ФинБро</h2>
              <p className="text-xs text-muted-foreground">Ваш финансовый помощник</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="container mx-auto max-w-3xl space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.isUser
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                <p className={`text-xs mt-1 ${message.isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {message.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-card border border-border rounded-2xl px-4 py-3">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-card border-t border-border p-4">
        <div className="container mx-auto max-w-3xl">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Напишите ваш вопрос..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={sendMessage} 
              disabled={isLoading || !inputValue.trim()}
              className="px-6"
            >
              {isLoading ? (
                <Icon name="Loader2" size={20} className="animate-spin" />
              ) : (
                <Icon name="Send" size={20} />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            ФинБро использует ИИ и может ошибаться. Проверяйте важную информацию.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;