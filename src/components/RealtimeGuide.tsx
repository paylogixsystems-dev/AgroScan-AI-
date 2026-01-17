
import React from 'react';
import { Plane, Upload, Cpu, Layout, CheckCircle, Zap, Shield, PlayCircle, Cloud, Database, Globe, Server, Code, Terminal, ExternalLink, DatabaseZap, ListTree } from 'lucide-react';

const RealtimeGuide: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Database Script Library</h1>
        <p className="text-slate-500 text-lg">Use these DDL and DML scripts to setup your production database.</p>
      </header>

      {/* DDL Section */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-8">
        <div className="flex items-center space-x-4">
          <div className="bg-emerald-600 p-3 rounded-2xl">
            <DatabaseZap className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">1. DDL (Data Definition Language)</h2>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Run this command in your Supabase SQL Editor or PostgreSQL terminal to create the required tables and schema.
          </p>
          <div className="bg-slate-900 rounded-3xl p-8 overflow-hidden relative">
            <div className="absolute top-4 right-6 text-[10px] font-mono text-slate-500 uppercase tracking-widest">PostgreSQL</div>
            <pre className="text-xs sm:text-sm text-emerald-400 font-mono overflow-x-auto leading-relaxed">
{`-- Create the inspections table
CREATE TABLE IF NOT EXISTS inspections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_name TEXT NOT NULL,
  
  -- Plant Data
  plant_type TEXT NOT NULL,
  plant_type_tamil TEXT NOT NULL,
  
  -- Analysis Results
  health_status TEXT CHECK (health_status IN ('Healthy', 'Stressed', 'Diseased', 'Unknown')),
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  
  -- Multimedia
  image_url TEXT NOT NULL,
  
  -- Detailed Findings (JSON for flexibility)
  description TEXT,
  description_tamil TEXT,
  recommendations TEXT[] DEFAULT '{}',
  recommendations_tamil TEXT[] DEFAULT '{}'
);

-- Index for faster history retrieval
CREATE INDEX idx_inspections_user ON inspections(user_name);`}
            </pre>
          </div>
        </div>
      </div>

      {/* DML Section */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-8">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-600 p-3 rounded-2xl">
            <ListTree className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">2. DML (Data Manipulation Language)</h2>
        </div>

        <div className="space-y-10">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center">
              <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-[10px] mr-2">INSERT</span>
              Saving a new analysis
            </h3>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <pre className="text-[11px] sm:text-xs text-slate-700 font-mono overflow-x-auto">
{`INSERT INTO inspections (
  user_name, plant_type, plant_type_tamil, 
  health_status, confidence_score, image_url, 
  description, description_tamil, 
  recommendations, recommendations_tamil
) VALUES (
  'John Doe', 'Coconut Palm', 'தென்னை மரம்', 
  'Healthy', 98, 'https://storage.link/img.jpg',
  'Optimal growth visible.', 'சிறந்த வளர்ச்சி தெரிகிறது.',
  ARRAY['Check water', 'Apply compost'], ARRAY['தண்ணீர் சரிபார்க்கவும்', 'உரம் இடவும்']
);`}
              </pre>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center">
              <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-[10px] mr-2">SELECT</span>
              Fetching user history
            </h3>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <pre className="text-[11px] sm:text-xs text-slate-700 font-mono overflow-x-auto">
{`-- Fetch latest 10 inspections for a specific user
SELECT * FROM inspections 
WHERE user_name = 'John Doe' 
ORDER BY created_at DESC 
LIMIT 10;`}
              </pre>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center">
              <span className="w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-[10px] mr-2">DELETE</span>
              Removing a record
            </h3>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <pre className="text-[11px] sm:text-xs text-slate-700 font-mono overflow-x-auto">
{`-- Delete a specific record by ID
DELETE FROM inspections 
WHERE id = '550e8400-e29b-41d4-a716-446655440000';`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 space-y-6">
          <div className="flex items-center space-x-3">
            <Terminal className="w-6 h-6 text-emerald-400" />
            <h2 className="text-2xl font-bold">Connecting the Frontend</h2>
          </div>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
            Once you have run the DDL above, you can use the Supabase JS library to interact with these tables. 
            Replace your <code className="text-emerald-400">addToHistory</code> function in <code>App.tsx</code> with:
          </p>
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl font-mono text-[10px] sm:text-xs text-slate-300">
{`const { data, error } = await supabase
  .from('inspections')
  .insert([ analysis_object ])`}
          </div>
          <div className="pt-4 flex items-center justify-between">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center font-bold text-[10px]">SQL</div>
              <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-slate-900 flex items-center justify-center font-bold text-[10px]">API</div>
              <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-slate-900 flex items-center justify-center font-bold text-[10px]">UI</div>
            </div>
            <button 
              onClick={() => window.location.hash = '#/'}
              className="text-emerald-400 text-sm font-bold flex items-center hover:underline"
            >
              Back to Dashboard <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for the guide link since ArrowRight wasn't imported locally
const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export default RealtimeGuide;
