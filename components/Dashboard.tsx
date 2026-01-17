
import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { PlantAnalysis } from '../types';
import { 
  TrendingUp, 
  Activity, 
  Map as MapIcon, 
  AlertTriangle,
  Camera,
  Trash2,
  ChevronRight,
  Clock,
  X,
  CheckCircle,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  history: PlantAnalysis[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

const Dashboard: React.FC<Props> = ({ history, onDelete, onClearAll }) => {
  const [selectedScan, setSelectedScan] = useState<PlantAnalysis | null>(null);

  const stats = [
    { label: 'Total Scans', value: history.length, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
    { 
      label: 'Avg Confidence', 
      value: history.length ? `${Math.round(history.reduce((a, b) => a + b.confidenceScore, 0) / history.length)}%` : '0%', 
      icon: TrendingUp, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50' 
    },
    { 
      label: 'Alerts Active', 
      value: history.filter(h => h.healthStatus === 'Diseased').length, 
      icon: AlertTriangle, 
      color: 'text-red-600', 
      bg: 'bg-red-50' 
    },
    { label: 'Land Tracked', value: '450 Acres', icon: MapIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const speciesData = history.reduce((acc: any[], curr) => {
    const existing = acc.find(item => item.name === curr.plantType);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: curr.plantType, value: 1 });
    }
    return acc;
  }, []);

  const healthData = [
    { name: 'Healthy', value: history.filter(h => h.healthStatus === 'Healthy').length },
    { name: 'Stressed', value: history.filter(h => h.healthStatus === 'Stressed').length },
    { name: 'Diseased', value: history.filter(h => h.healthStatus === 'Diseased').length },
  ].filter(d => d.value > 0);

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

  const recentScans = history.slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Farm Overview</h1>
          <p className="text-slate-500">Real-time agricultural telemetry and AI analysis results.</p>
        </div>
        {history.length > 0 && (
          <button 
            onClick={onClearAll}
            className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium text-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All Data</span>
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-6">Crop Species Detected</h3>
          <div className="h-[300px]">
            {speciesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={speciesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 italic">No scan data yet. Run an AI scan to see results.</div>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-6">Crop Health Distribution</h3>
          <div className="h-[300px] flex items-center">
             {healthData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={healthData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {healthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
             ) : (
              <div className="flex items-center justify-center w-full text-slate-400 italic text-center px-10">
                Run an AI scan to visualize health metrics across your farmland.
              </div>
             )}
          </div>
        </div>
      </div>

      {/* Recent Scans List */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Recent Inspections</h3>
            <Link to="/history" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center space-x-1">
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentScans.map((scan) => (
              <div 
                key={scan.id} 
                className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer"
                onClick={() => setSelectedScan(scan)}
              >
                <div className="flex items-center space-x-4">
                  <img src={scan.imageUrl} className="w-12 h-12 rounded-lg object-cover border border-slate-100" alt="" />
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{scan.plantType}</p>
                    <div className="flex items-center space-x-3 mt-0.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        scan.healthStatus === 'Healthy' ? 'bg-emerald-50 text-emerald-600' : scan.healthStatus === 'Stressed' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {scan.healthStatus}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(scan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="p-2 text-emerald-600 opacity-0 group-hover:opacity-100 transition-all rounded-lg bg-emerald-50">
                    <Eye className="w-4 h-4" />
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(scan.id);
                    }}
                    className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50"
                    title="Delete scan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Result Modal */}
      {selectedScan && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            <div className="relative h-48 sm:h-64 shrink-0">
              <img src={selectedScan.imageUrl} className="w-full h-full object-cover" alt="" />
              <button 
                onClick={() => setSelectedScan(null)}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full text-slate-900 hover:text-red-600 shadow-lg"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="absolute bottom-4 left-6 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-xl">
                 <p className="text-white font-bold text-sm tracking-wide">{selectedScan.confidenceScore}% Confidence</p>
              </div>
            </div>

            <div className="p-6 sm:p-10 overflow-y-auto space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">{selectedScan.plantType}</h2>
                  <h3 className="text-xl font-bold text-emerald-600 mt-1">{selectedScan.plantTypeTamil}</h3>
                </div>
                <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                  selectedScan.healthStatus === 'Healthy' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {selectedScan.healthStatus}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Findings / ஆய்வு விவரம்</h4>
                  <p className="text-slate-600 leading-relaxed text-sm">{selectedScan.description}</p>
                  <p className="text-emerald-700 leading-relaxed text-sm mt-2 font-medium italic">{selectedScan.descriptionTamil}</p>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
                    Recommendations / பரிந்துரைகள்
                  </h4>
                  <div className="space-y-4">
                    {selectedScan.recommendations.map((rec, i) => (
                      <div key={i} className="space-y-1">
                        <p className="text-xs text-slate-700">• {rec}</p>
                        <p className="text-xs text-emerald-700 font-medium pl-3 italic">{selectedScan.recommendationsTamil[i]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedScan(null)}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Quick Action */}
      {!history.length && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 text-center space-y-4">
          <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            <Camera className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-emerald-900">Start Your First Inspection</h2>
          <p className="text-emerald-700 max-w-md mx-auto">Upload drone images of your land to detect plant species and monitor health statuses instantly.</p>
          <button 
            onClick={() => window.location.hash = '#/analyzer'}
            className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
          >
            Upload Drone Image
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
