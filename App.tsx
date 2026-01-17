
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
  BookOpen
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Analyzer from './components/Analyzer';
import HistoryView from './components/HistoryView';
import Login from './components/Login';
import RealtimeGuide from './components/RealtimeGuide';
import { NavigationTab, PlantAnalysis } from './types';

const Navigation = ({ onLogout, userName }: { onLogout: () => void, userName: string }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const tabs = [
    { id: NavigationTab.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: NavigationTab.ANALYZER, label: 'Run AI Scan', icon: Camera, path: '/analyzer' },
    { id: NavigationTab.HISTORY, label: 'History', icon: History, path: '/history' },
    { id: NavigationTab.GUIDE, label: 'How it Works', icon: BookOpen, path: '/guide' },
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

          {/* Desktop Menu */}
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
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm">{userInitial}</div>
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

          {/* Mobile button */}
          <div className="md:hidden flex items-center space-x-2">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md hover:bg-emerald-700">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
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
  const [userName, setUserName] = useState<string>(() => localStorage.getItem('agroscan_user') || 'Farmer');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('agroscan_auth') === 'true';
  });

  useEffect(() => {
    const saved = localStorage.getItem('agroscan_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const addToHistory = (analysis: PlantAnalysis) => {
    const updated = [analysis, ...history];
    setHistory(updated);
    localStorage.setItem('agroscan_history', JSON.stringify(updated));
  };

  const deleteFromHistory = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('agroscan_history', JSON.stringify(updated));
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all inspection history?')) {
      setHistory([]);
      localStorage.removeItem('agroscan_history');
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

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navigation onLogout={handleLogout} userName={userName} />
        <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard history={history} onDelete={deleteFromHistory} onClearAll={clearHistory} />} />
            <Route path="/analyzer" element={<Analyzer onAnalysisComplete={addToHistory} />} />
            <Route path="/history" element={<HistoryView history={history} onDelete={deleteFromHistory} />} />
            <Route path="/guide" element={<RealtimeGuide />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Sprout className="w-5 h-5 text-emerald-500" />
              <span className="text-white font-semibold">AgroScan Systems</span>
            </div>
            <p className="text-sm">© 2024 Precision AgTech Solutions. All rights reserved.</p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="hover:text-emerald-400">Terms</a>
              <a href="#" className="hover:text-emerald-400">Privacy</a>
              <a href="#" className="hover:text-emerald-400">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
