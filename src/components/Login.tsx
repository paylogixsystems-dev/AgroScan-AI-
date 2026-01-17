
import React, { useState } from 'react';
import { Sprout, ShieldCheck, Zap, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

interface Props {
  onLogin: (name: string) => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('John Doe');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== 'admin') {
      setError('Access Denied. Password must be "admin"');
      return;
    }

    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      onLogin(name);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-4xl w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100">
        {/* Left Side: Branding */}
        <div className="md:w-1/2 bg-emerald-800 p-12 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-8">
              <Sprout className="w-10 h-10 text-emerald-400" />
              <span className="text-2xl font-bold tracking-tight">AgroScan AI</span>
            </div>
            <h1 className="text-4xl font-bold leading-tight mb-6">
              The future of <span className="text-emerald-400">precision farming</span> is here.
            </h1>
            <p className="text-emerald-100 text-lg opacity-80">
              Monitor your land, identify crops, and detect diseases using advanced drone-vision AI.
            </p>
          </div>
          
          <div className="space-y-4 pt-12">
            <div className="flex items-center space-x-3 text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Enterprise-grade security</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <Zap className="w-5 h-5 text-emerald-400" />
              <span>Real-time Gemini Flash analysis</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-1/2 p-12 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
            <p className="text-slate-500 mb-8">Sign in to your farm dashboard</p>
            
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-5 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (hint: admin)"
                  className="w-full px-5 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center space-x-2 active:scale-[0.98]"
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <span>Enter Dashboard</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
