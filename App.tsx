
import React, { useState, useEffect, useContext, createContext } from 'react';
import { View, User, SavedReport, Language, UserRole, AIStrategy } from './types';
import { Hero } from './components/Hero';
import ToolsHub from './components/ToolsHub';
import ChatBot from './components/ChatBot';
import SearchTool from './components/SearchTool';
import Analyzer from './components/Analyzer';
import Weather from './components/Weather';
import NutrientCalculator from './components/NutrientCalculator';
import BiocontrolGuide from './components/BiocontrolGuide';
import SoilGuide from './components/SoilGuide';
import PlantDefenseGuide from './components/PlantDefenseGuide';
import PesticideExpert from './components/PesticideExpert';
import SoilExpert from './components/SoilExpert';
import YieldCalculator from './components/YieldCalculator';
import AIYieldPredictor from './components/AIYieldPredictor';
import { CropDiseaseLibrary } from './components/CropDiseaseLibrary';
import QRGenerator from './components/QRGenerator';
import FieldMonitoring from './components/FieldMonitoring';
import LeafColorChart from './components/LeafColorChart';
import LearningCenter from './components/LearningCenter';
import UserProfile from './components/UserProfile';
import About from './components/About';
import FlashcardView from './components/FlashcardView';
import TaskScheduler from './components/TaskScheduler';
import FAQ from './components/FAQ';
import CropCalendar from './components/CropCalendar';
import AgriPodcast from './components/AgriPodcast';
import CABIDiagnosisTraining from './components/CABIDiagnosisTraining';
import FieldMap from './components/FieldMap';
import Sidebar from './components/Sidebar';
import { WeatherHorizontal } from './components/WeatherHorizontal';
import { MarketPriceHorizontal } from './components/MarketPriceHorizontal';
import { FeatureHighlights } from './components/FeatureHighlights';
import { NewsTicker, StatsSection, FeaturedCourses, MissionSection, ContactFooter } from './components/HomeSections';
import { Logo } from './components/Logo';
import { FarmerAvatar } from './components/FarmerAvatar';
import ShareDialog from './components/ShareDialog';
import { syncUserProfile, saveReportToSupabase } from './services/supabase';

interface SpeechContextType {
  playSpeech: (text: string) => void;
  stopSpeech: () => void;
  isSpeaking: boolean;
  speechEnabled: boolean;
  setSpeechEnabled: (enabled: boolean) => void;
}

const SpeechContext = createContext<SpeechContextType | null>(null);

export const useSpeech = () => {
  const context = useContext(SpeechContext);
  if (!context) throw new Error("useSpeech must be used within a SpeechProvider");
  return context;
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [lang, setLang] = useState<Language>('bn');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showSpeechConsent, setShowSpeechConsent] = useState(false);

  const [user, setUser] = useState<User>({
    uid: 'guest_user_' + Math.random().toString(36).substr(2, 5),
    displayName: 'কৃষক বন্ধু',
    role: 'farmer_entrepreneur',
    progress: {
      rank: 'নবিশ কৃষক',
      level: 1,
      xp: 120,
      streak: 3,
      skills: { soil: 40, protection: 30, technology: 50 }
    },
    myCrops: [],
    savedReports: [],
    preferredCategories: ['cereals', 'vegetables'],
    settings: {
      theme: 'light',
      aiStrategy: 'hybrid',
      modelProvider: 'gemini',
      notifications: { weather: true, market: true, cropHealth: true }
    }
  });

  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => { window.speechSynthesis.getVoices(); };
    }
    const consent = localStorage.getItem('agritech_speech_consent');
    if (consent === 'true') setSpeechEnabled(true);
    else if (consent === null) setTimeout(() => setShowSpeechConsent(true), 1500);
    if (user.uid) syncUserProfile(user);
  }, []);

  const stopSpeech = () => { if (window.speechSynthesis) window.speechSynthesis.cancel(); setIsSpeaking(false); };

  const playSpeech = (text: string) => {
    if (!speechEnabled || !window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setTimeout(() => {
      const cleanText = text.replace(/[*#_~]/g, '').trim();
      if (!cleanText) return;
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
      const voices = window.speechSynthesis.getVoices();
      const targetLang = lang === 'bn' ? 'bn' : 'en';
      const preferredVoice = voices.find(v => v.lang.toLowerCase().includes(targetLang));
      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }, 100);
  };

  const handleSpeechConsent = (enabled: boolean) => {
    setSpeechEnabled(enabled);
    localStorage.setItem('agritech_speech_consent', enabled.toString());
    setShowSpeechConsent(false);
    if (enabled) playSpeech(lang === 'bn' ? "ভয়েস সার্ভিস চালু করা হয়েছে।" : "Voice service enabled.");
  };

  const handleNavigate = (view: View) => { stopSpeech(); setCurrentView(view); setIsDrawerOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const handleAction = (xp: number) => {
    setUser(prev => ({
      ...prev,
      progress: { ...prev.progress, xp: prev.progress.xp + xp, level: Math.floor((prev.progress.xp + xp) / 500) + 1 }
    }));
  };

  const handleSaveReport = async (report: Omit<SavedReport, 'id' | 'timestamp'>) => {
    const newReport: SavedReport = { ...report, id: Math.random().toString(36).substr(2, 9), timestamp: Date.now() };
    setUser(prev => ({ ...prev, savedReports: [newReport, ...prev.savedReports] }));
    if (user.uid) saveReportToSupabase(user.uid, newReport);
  };

  useEffect(() => {
    const onGlobalNav = (e: any) => handleNavigate(e.detail as View);
    window.addEventListener('agritech_navigate', onGlobalNav);
    return () => window.removeEventListener('agritech_navigate', onGlobalNav);
  }, []);

  const renderView = () => {
    switch (currentView) {
      case View.HOME:
        return (
          <div className="animate-fade-in space-y-0">
            <Hero onNavigate={handleNavigate} lang={lang} />
            <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-50 space-y-8 pb-12">
               <WeatherHorizontal lang={lang} />
               <MarketPriceHorizontal onNavigate={handleNavigate} lang={lang} />
               <NewsTicker lang={lang} />
            </div>
            <StatsSection />
            <FeatureHighlights onNavigate={handleNavigate} lang={lang} />
            <FeaturedCourses onNavigate={handleNavigate} />
            <MissionSection />
            <ContactFooter />
          </div>
        );
      case View.TOOLS: return <ToolsHub onNavigate={handleNavigate} lang={lang} />;
      case View.CHAT: return <ChatBot user={user} userRank={user.progress.rank} userCrops={user.myCrops} onBack={() => handleNavigate(View.HOME)} onAction={() => handleAction(20)} />;
      case View.SEARCH: return <SearchTool onBack={() => handleNavigate(View.HOME)} onAction={() => handleAction(10)} onSaveReport={handleSaveReport} />;
      case View.ANALYZER: return <Analyzer user={user} onBack={() => handleNavigate(View.HOME)} onAction={() => handleAction(50)} onSaveReport={handleSaveReport} onNavigate={handleNavigate} lang={lang} />;
      case View.WEATHER: return <Weather onBack={() => handleNavigate(View.HOME)} lang={lang} />;
      case View.NUTRIENT_CALC: return <NutrientCalculator user={user} onBack={() => handleNavigate(View.HOME)} onAction={() => handleAction(30)} onSaveReport={handleSaveReport} onNavigate={handleNavigate} lang={lang} />;
      case View.BIOCONTROL: return <BiocontrolGuide onBack={() => handleNavigate(View.HOME)} onAction={() => handleAction(15)} onSaveReport={handleSaveReport} />;
      case View.SOIL_GUIDE: return <SoilGuide onBack={() => handleNavigate(View.HOME)} onAction={() => handleAction(10)} onSaveReport={handleSaveReport} />;
      case View.DEFENSE_GUIDE: return <PlantDefenseGuide onBack={() => handleNavigate(View.HOME)} />;
      case View.PEST_EXPERT: return <PesticideExpert onBack={() => handleNavigate(View.HOME)} onNavigate={handleNavigate} onAction={() => handleAction(40)} onSaveReport={handleSaveReport} lang={lang} />;
      case View.SOIL_EXPERT: return <SoilExpert onBack={() => handleNavigate(View.HOME)} onAction={() => handleAction(45)} onSaveReport={handleSaveReport} lang={lang} />;
      case View.YIELD_CALCULATOR: return <YieldCalculator onBack={() => handleNavigate(View.HOME)} onAction={() => handleAction(25)} />;
      case View.AI_YIELD_PREDICTION: return <AIYieldPredictor user={user} onBack={() => handleNavigate(View.HOME)} onAction={handleAction} onSaveReport={handleSaveReport} lang={lang} />;
      case View.CROP_DISEASE_LIBRARY: return <CropDiseaseLibrary onBack={() => handleNavigate(View.HOME)} onAction={() => handleAction(15)} onSaveReport={handleSaveReport} />;
      case View.QR_GENERATOR: return <QRGenerator onBack={() => handleNavigate(View.HOME)} onAction={() => handleAction(5)} />;
      case View.MONITORING: return <FieldMonitoring onBack={() => handleNavigate(View.HOME)} onAction={() => handleAction(60)} onSaveReport={handleSaveReport} />;
      case View.LEAF_COLOR_CHART: return <LeafColorChart onBack={() => handleNavigate(View.HOME)} onAction={() => handleAction(35)} lang={lang} />;
      case View.LEARNING_CENTER: return <LearningCenter onBack={() => handleNavigate(View.HOME)} onAction={handleAction} />;
      case View.PROFILE: return <UserProfile user={user} onUpdateUser={(updates) => setUser(prev => ({ ...prev, ...updates }))} onSaveReport={handleSaveReport} onToggleSpeech={() => setSpeechEnabled(!speechEnabled)} speechEnabled={speechEnabled} onBack={() => handleNavigate(View.HOME)} lang={lang} />;
      case View.ABOUT: return <About onNavigate={handleNavigate} onBack={() => handleNavigate(View.HOME)} />;
      case View.FLASHCARDS: return <FlashcardView onBack={() => handleNavigate(View.HOME)} onAction={handleAction} />;
      case View.TASK_SCHEDULER: return <TaskScheduler user={user} onBack={() => handleNavigate(View.HOME)} onAction={() => handleAction(10)} />;
      case View.FAQ: return <FAQ onBack={() => handleNavigate(View.HOME)} />;
      case View.CROP_CALENDAR: return <CropCalendar user={user} onBack={() => handleNavigate(View.HOME)} onAction={() => handleAction(20)} onSaveReport={handleSaveReport} />;
      case View.PODCAST: return <AgriPodcast onBack={() => handleNavigate(View.HOME)} onAction={handleAction} />;
      case View.CABI_TRAINING: return <CABIDiagnosisTraining onBack={() => handleNavigate(View.HOME)} onAction={() => handleAction(100)} />;
      case View.MAPS: return <FieldMap onBack={() => handleNavigate(View.HOME)} lang={lang} />;
      default: return <Hero onNavigate={handleNavigate} lang={lang} />;
    }
  };

  return (
    <SpeechContext.Provider value={{ playSpeech, stopSpeech, isSpeaking, speechEnabled, setSpeechEnabled }}>
      <div className={`min-h-screen transition-colors duration-500 ${user.settings?.theme === 'dark' ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
        <Sidebar isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} onNavigate={handleNavigate} currentView={currentView} lang={lang} />
        {showSpeechConsent && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-[3rem] p-10 max-w-md shadow-2xl space-y-8 border-t-[12px] border-emerald-600 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
               <div className="flex items-center space-x-4 relative z-10">
                  <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-4xl shadow-inner">🔊</div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none">Enable Read Aloud?</h3>
               </div>
               <div className="space-y-4 relative z-10">
                  <p className="text-slate-600 font-medium leading-relaxed">This app can read important information aloud using built-in voice services.</p>
               </div>
               <div className="flex flex-col gap-3 relative z-10">
                  <button onClick={() => handleSpeechConsent(true)} className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl active:scale-95 border-b-4 border-emerald-800">Enable Read Aloud</button>
                  <button onClick={() => handleSpeechConsent(false)} className="w-full bg-slate-100 text-slate-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95">Not Now</button>
               </div>
            </div>
          </div>
        )}
        {isShareOpen && (
          <ShareDialog 
            isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} 
            title={lang === 'bn' ? "কৃষি এআই: স্মার্ট কৃষি ইকোসিস্টেম" : "Krishi AI: Smart Agri Ecosystem"} 
            content={lang === 'bn' ? "বাংলাদেশের কৃষকদের জন্য একটি সমন্বিত এআই ইকোসিস্টেম।" : "An integrated AI ecosystem for Bangladeshi farmers."}
            installPrompt={installPrompt}
            onInstall={() => { if (installPrompt) { installPrompt.prompt(); setInstallPrompt(null); } }}
          />
        )}
        <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 z-[100] px-4 flex items-center justify-between shadow-sm">
           <div className="flex items-center space-x-3">
             <button onClick={() => setIsDrawerOpen(true)} className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-emerald-50 transition-all shadow-sm border border-slate-100 dark:border-slate-700">
               <svg className="w-6 h-6 text-slate-800 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" /></svg>
             </button>
             <div className="flex items-center space-x-2 cursor-pointer" onClick={() => handleNavigate(View.HOME)}>
               <Logo size="sm" showText={false} />
               <span className="font-black text-lg tracking-tighter text-slate-800 dark:text-white hidden xs:block">Krishi <span className="text-emerald-600">AI</span></span>
             </div>
           </div>
           <div className="flex items-center space-x-2 md:space-x-4">
              <button onClick={() => setIsShareOpen(true)} className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-emerald-50 border border-transparent transition-all"><svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></button>
              <button onClick={() => { if (isSpeaking) stopSpeech(); setSpeechEnabled(!speechEnabled); }} className={`p-2.5 rounded-xl transition-all flex items-center space-x-2 border shadow-sm ${speechEnabled ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}><div className="relative">{speechEnabled ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>}{isSpeaking && <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>}</div></button>
              <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-full flex items-center space-x-1 border border-slate-200 dark:border-slate-700">
                <button onClick={() => setLang('bn')} className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${lang === 'bn' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 dark:text-slate-500'}`}>বাংলা</button>
                <button onClick={() => setLang('en')} className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${lang === 'en' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 dark:text-slate-500'}`}>EN</button>
              </div>
              <FarmerAvatar user={user} size="md" showProgress={true} onClick={() => handleNavigate(View.PROFILE)} />
           </div>
        </header>
        <main className="pt-16 pb-24 min-h-screen">{renderView()}</main>
        <nav className="fixed bottom-4 left-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 z-[100] px-2 py-2 flex justify-around items-center max-w-sm mx-auto rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
          <NavButton active={currentView === View.HOME} icon="🏠" label={lang === 'bn' ? "হোম" : "Home"} onClick={() => handleNavigate(View.HOME)} />
          <NavButton active={currentView === View.TOOLS} icon="🛠️" label={lang === 'bn' ? "টুলস" : "Tools"} onClick={() => handleNavigate(View.TOOLS)} />
          <div className="relative -mt-10 group"><div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 transition-opacity"></div><button onClick={() => handleNavigate(View.ANALYZER)} className={`relative w-16 h-16 rounded-[1.8rem] flex items-center justify-center text-3xl shadow-2xl transition-all duration-300 transform active:scale-90 ${currentView === View.ANALYZER ? 'bg-white text-emerald-600 border-4 border-emerald-500 rotate-12' : 'bg-emerald-600 text-white'}`}>📸</button></div>
          <NavButton active={currentView === View.LEARNING_CENTER} icon="🎓" label={lang === 'bn' ? "শিখন" : "Learn"} onClick={() => handleNavigate(View.LEARNING_CENTER)} />
          <NavButton active={currentView === View.PROFILE} icon="👤" label={lang === 'bn' ? "প্রোফাইল" : "Profile"} onClick={() => handleNavigate(View.PROFILE)} />
        </nav>
      </div>
    </SpeechContext.Provider>
  );
};

const NavButton = ({ active, icon, label, onClick }: any) => (
  <button onClick={onClick} className={`flex-1 flex flex-col items-center p-2 rounded-2xl transition-all duration-300 ${active ? 'text-[#0A8A1F] scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
    <span className="text-xl leading-none">{icon}</span>
    <span className="text-[7px] md:text-[8px] font-black uppercase mt-1 tracking-tighter">{label}</span>
  </button>
);

export default App;
