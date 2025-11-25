import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface User {
  id: number;
  email: string;
  username: string;
  token: string;
}

interface HeroProps {
  onStartChat: () => void;
  user: User | null;
  onLogout: () => void;
}

const Hero = ({ onStartChat, user, onLogout }: HeroProps) => {
  return (
    <div className="relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url('https://cdn.poehali.dev/projects/2f5a1759-a189-4fbe-b4ab-583ac85f29b3/files/e6d41c5b-ad95-4064-b05a-a8c23f250552.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      {user && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-3 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border">
          <span className="text-sm font-medium">{user.username}</span>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <Icon name="LogOut" size={16} />
          </Button>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                <Icon name="Sparkles" size={16} />
                Искусственный интеллект
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-purple-600 to-secondary bg-clip-text text-transparent leading-tight">
                Уникальный бот ФинБро
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Ваш личный финансовый помощник, который разбирается в кредитах, долгах и всех банковских нюансах. Получите экспертную консультацию мгновенно!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Button 
                  onClick={onStartChat}
                  size="lg"
                  className="text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all bg-gradient-to-r from-primary to-purple-600 hover:scale-105"
                >Начать общение</Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  className="text-lg px-8 py-6 border-2"
                ></Button>
              </div>

              <div className="flex flex-wrap gap-6 justify-center lg:justify-start pt-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle2" size={18} className="text-secondary" />
                  <span>Бесплатно навсегда</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Shield" size={18} className="text-secondary" />
                  <span>Безопасно и конфиденциально</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Zap" size={18} className="text-secondary" />
                  <span>Мгновенные ответы</span>
                </div>
              </div>
            </div>

            <div className="flex-1 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-3xl opacity-20 animate-pulse" />
                <img 
                  src="https://cdn.poehali.dev/projects/2f5a1759-a189-4fbe-b4ab-583ac85f29b3/files/a6ce2cc5-8821-4f2b-9b19-5936433b9a83.jpg"
                  alt="ФинБро"
                  className="relative w-full max-w-md rounded-3xl shadow-2xl"
                />
              </div>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card p-6 rounded-2xl shadow-lg border border-border hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Icon name="CreditCard" size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Кредиты и займы</h3>
              <p className="text-muted-foreground">
                Помощь в выборе кредита, расчёт платежей, советы по рефинансированию
              </p>
            </div>

            <div className="bg-card p-6 rounded-2xl shadow-lg border border-border hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">
                <Icon name="TrendingDown" size={24} className="text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Управление долгами</h3>
              <p className="text-muted-foreground">
                Стратегии погашения долгов, реструктуризация, защита от коллекторов
              </p>
            </div>

            <div className="bg-card p-6 rounded-2xl shadow-lg border border-border hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Icon name="Building2" size={24} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Банковские услуги</h3>
              <p className="text-muted-foreground">
                Вклады, карты, переводы — разберёмся во всех тарифах и условиях
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;