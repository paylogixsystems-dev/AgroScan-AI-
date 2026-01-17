
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Camera, 
  History, 
  Menu, 
  X,
  Sprout,
  LogOut,
  BookOpen,
  Loader2,
  AlertTriangle,
  ExternalLink,
  Settings,
  ShieldAlert
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Analyzer from './components/Analyzer';
import HistoryView from './components/HistoryView';
import Login from './components/Login';
import RealtimeGuide from './components/RealtimeGuide';
import { NavigationTab, PlantAnalysis } from './types';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';

const Navigation = ({ onLogout, userName }: { onLogout: () => void, userName: string }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const tabs = [
    { id: NavigationTab.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: NavigationTab.ANALYZER, label: 'Run AI Scan', icon: Camera, path: '/analyzer' },
    { id: NavigationTab.HISTORY, label: 'History', icon: History, path: '/history' },
    { id: NavigationTab.GUIDE, label: 'Setup Guide', icon: BookOpen, path: '/guide' },
  ];

  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <nav className="bg-emerald-800 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Sprout className="w-8 h-8 text-emerald-400" />
            <span className="text-xl font-bold tracking-tight">AgroScan AI</span>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <div className="flex space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = location.pathname === tab.path;
                return (
                  <Link
                    key={tab.id}
                    to={tab.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive ? 'bg-emerald-700 text-white' : 'hover:bg-emerald-700/50 text-emerald-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </Link>
                );
              })}
            </div>
            
            <div className="h-6 w-[1px] bg-emerald-700/50" />

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-700/30 rounded-full">
                <div className="w-6 h-6 bg-emerald-50 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm">{userInitial}</div>
                <span className="text-xs font-medium text-emerald-100">{userName}</span>
              </div>
              <button 
                onClick={onLogout}
                className="text-emerald-100 hover:text-white p-2 hover:bg-emerald-700 rounded-lg transition-colors flex items-center space-x-1"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md hover:bg-emerald-700">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-emerald-900 border-t border-emerald-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <div className="px-3 py-3 border-b border-emerald-800 flex items-center space-x-3 mb-2">
               <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-sm font-bold">{userInitial}</div>
               <div>
                  <p className="font-bold text-white">{userName}</p>
                  <p className="text-xs text-emerald-400">Farm Admin</p>
               </div>
            </div>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.id}
                  to={tab.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-3 py-3 rounded-md text-emerald-100 hover:bg-emerald-700"
                >
                  <Icon className="w-6 h-6" />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
            <button 
                onClick={onLogout}
                className="w-full flex items-center space-x-3 px-3 py-3 rounded-md text-red-400 hover:bg-red-900/20"
              >
                <LogOut className="w-6 h-6" />
                <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

const App: React.FC = () => {
  const [history, setHistory] = useState<PlantAnalysis[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userName, setUserName] = useState<string>(() => localStorage.getItem('agroscan_user') || 'Farmer');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('agroscan_auth') === 'true';
  });

  const fetchHistory = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inspections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const mappedData: PlantAnalysis[] = (data || []).map(item => ({
        id: item.id,
        timestamp: item.created_at,
        imageUrl: item.image_url,
        plantType: item.plant_type,
        plantTypeTamil: item.plant_type_tamil,
        healthStatus: item.health_status,
        description: item.description,
        descriptionTamil: item.description_tamil,
        confidenceScore: item.confidence_score,
        recommendations: item.recommendations || [],
        recommendationsTamil: item.recommendations_tamil || []
      }));
      
      setHistory(mappedData);
    } catch (err) {
      console.error('Error fetching from Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    }
  }, [isAuthenticated]);

  const addToHistory = (analysis: PlantAnalysis) => {
    setHistory(prev => [analysis, ...prev]);
  };

  const deleteFromHistory = async (id: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('inspections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting from Supabase:', err);
      alert('Failed to delete from cloud database.');
    }
  };

  const clearHistory = async () => {
    if (!supabase) return;
    if (window.confirm('Clear all cloud history? This cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('inspections')
          .delete()
          .not('id', 'is', null);

        if (error) throw error;
        setHistory([]);
      } catch (err) {
        console.error('Error clearing Supabase history:', err);
      }
    }
  };

  const handleLogin = (name: string) => {
    setUserName(name);
    setIsAuthenticated(true);
    localStorage.setItem('agroscan_auth', 'true');
    localStorage.setItem('agroscan_user', name);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('agroscan_auth');
    localStorage.removeItem('agroscan_user');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // Show configuration screen if Supabase or API Key is missing
  const isApiConfigured = !!import.meta.env.VITE_GEMINI_API_KEY;
  if (!isSupabaseConfigured || !isApiConfigured) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-8 md:p-10 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8 md:w-10 md:h-10 text-amber-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900">Missing Configuration</h2>
            <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
              Environment variables are missing in Vercel. You must add them to enable AI analysis and Cloud Storage.
            </p>
          </div>
          <div className="bg-slate-50 p-4 md:p-5 rounded-2xl text-left font-mono text-[10px] md:text-xs space-y-3 border border-slate-100">
             <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Status Check:</p>
             <div className="space-y-2">
               <div className="flex justify-between items-center">
                 <span>API_KEY</span>
                 <span className={isApiConfigured ? 'text-emerald-600' : 'text-red-500'}>{isApiConfigured ? '✓ Set' : '✗ Missing'}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span>SUPABASE_URL</span>
                 <span className={!!process.env.SUPABASE_URL ? 'text-emerald-600' : 'text-red-500'}>{!!process.env.SUPABASE_URL ? '✓ Set' : '✗ Missing'}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span>SUPABASE_ANON_KEY</span>
                 <span className={!!process.env.SUPABASE_ANON_KEY ? 'text-emerald-600' : 'text-red-500'}>{!!process.env.SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'}</span>
               </div>
             </div>
          </div>
          <div className="flex flex-col gap-3">
            <a 
              href="https://vercel.com/dashboard" 
              target="_blank"
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-slate-800 transition-colors text-sm"
            >
              <span>Vercel Settings</span>
              <Settings className="w-4 h-4" />
            </a>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors text-sm"
            >
              Retry Connection
            </button>
          </div>
          <p className="text-[10px] text-slate-400">
            Open <strong>DEPLOYMENT_GUIDE.txt</strong> for a step-by-step setup walkthrough.
          </p>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navigation onLogout={handleLogout} userName={userName} />
        <main className="flex-grow max-w-7xl mx-auto w-full px-2 md:px-4 py-6 md:py-8">
          {loading ? (
             <div className="h-64 flex flex-col items-center justify-center space-y-4">
               <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
               <p className="text-slate-500 font-medium text-sm md:text-base">Syncing cloud telemetry...</p>
             </div>
          ) : (
            <Routes>
              <Route path="/" element={<Dashboard history={history} onDelete={deleteFromHistory} onClearAll={clearHistory} />} />
              <Route path="/analyzer" element={<Analyzer onAnalysisComplete={addToHistory} userName={userName} />} />
              <Route path="/history" element={<HistoryView history={history} onDelete={deleteFromHistory} />} />
              <Route path="/guide" element={<RealtimeGuide />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </main>
        <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 mt-auto">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Sprout className="w-5 h-5 text-emerald-500" />
              <span className="text-white font-semibold">AgroScan Systems</span>
            </div>
            <p className="text-[10px] md:text-sm text-center">© 2024 Precision AgTech Solutions. Cloud Powered.</p>
            <div className="flex space-x-6 text-[10px] md:text-sm">
              <a href="#" className="hover:text-emerald-400">Security</a>
              <a href="#" className="hover:text-emerald-400">Privacy</a>
              <a href="#" className="hover:text-emerald-400">Support</a>
            </div>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
