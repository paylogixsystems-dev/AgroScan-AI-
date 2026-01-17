
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
      value: history.length ? `${Math.round(history.reduce((a, b) => a + (b.confidenceScore || 0), 0) / history.length)}%` : '0%', 
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

  const recentScans = (history || []).slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Farm Overview</h1>
          <p className="text-sm md:text-base text-slate-500">Real-time agriculture telemetry and AI results.</p>
        </div>
        {history.length > 0 && (
          <button 
            onClick={onClearAll}
            className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium text-xs md:text-sm self-start md:self-auto"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear History</span>
          </button>
        )}
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-2">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-4">
            <div className={`p-2 md:p-3 rounded-xl ${stat.bg} shrink-0`}>
              <stat.icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.color}`} />
            </div>
            <div className="text-center md:text-left">
              <p className="text-[10px] md:text-sm font-medium text-slate-500 whitespace-nowrap">{stat.label}</p>
              <p className="text-lg md:text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 px-2">
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-base md:text-lg font-semibold mb-6">Crop Species Detected</h3>
          <div className="h-[250px] md:h-[300px]">
            {speciesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={speciesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 italic text-sm">No species data.</div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-base md:text-lg font-semibold mb-6">Health Distribution</h3>
          <div className="h-[250px] md:h-[300px] flex items-center">
             {healthData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={healthData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
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
              <div className="flex items-center justify-center w-full text-slate-400 italic text-center px-4 text-sm">
                No health metrics yet.
              </div>
             )}
          </div>
        </div>
      </div>

      {/* Recent Scans List */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mx-2">
          <div className="p-4 md:p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-base md:text-lg font-semibold text-slate-900">Recent Inspections</h3>
            <Link to="/history" className="text-emerald-600 hover:text-emerald-700 font-medium text-xs md:text-sm flex items-center space-x-1">
              <span>View History</span>
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
                <div className="flex items-center space-x-3 md:space-x-4 min-w-0">
                  <img src={scan.imageUrl} className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover border border-slate-100 shrink-0" alt="" />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-xs md:text-sm truncate">{scan.plantType}</p>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className={`text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        scan.healthStatus === 'Healthy' ? 'bg-emerald-50 text-emerald-600' : scan.healthStatus === 'Stressed' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {scan.healthStatus}
                      </span>
                      <span className="text-[9px] md:text-[10px] text-slate-400 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(scan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1 md:space-x-2">
                  <div className="p-1.5 text-emerald-600 md:opacity-0 group-hover:opacity-100 transition-all rounded-lg bg-emerald-50">
                    <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(scan.id);
                    }}
                    className="p-1.5 text-slate-300 hover:text-red-500 md:opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Result Modal - Optimized for Mobile */}
      {selectedScan && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-hidden">
          <div className="bg-white w-full max-w-2xl rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">
            <div className="relative h-40 sm:h-64 shrink-0">
              <img src={selectedScan.imageUrl} className="w-full h-full object-cover" alt="" />
              <button 
                onClick={() => setSelectedScan(null)}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full text-slate-900 hover:text-red-600 shadow-lg z-10"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <div className="absolute bottom-4 left-6 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-xl">
                 <p className="text-white font-bold text-xs sm:text-sm tracking-wide">{selectedScan.confidenceScore}% Confidence</p>
              </div>
            </div>

            <div className="p-5 sm:p-10 overflow-y-auto space-y-5 sm:space-y-6 flex-grow overscroll-contain">
              <div className="flex justify-between items-start gap-4">
                <div className="max-w-[70%]">
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight break-words">{selectedScan.plantType}</h2>
                  <h3 className="text-lg sm:text-xl font-bold text-emerald-600 mt-1 break-words">{selectedScan.plantTypeTamil}</h3>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest shrink-0 ${
                  selectedScan.healthStatus === 'Healthy' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {selectedScan.healthStatus}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Findings / ஆய்வு</h4>
                  <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">{selectedScan.description}</p>
                  <p className="text-emerald-700 leading-relaxed text-xs sm:text-sm mt-2 font-medium italic">{selectedScan.descriptionTamil}</p>
                </div>

                <div className="bg-slate-50 p-5 sm:p-6 rounded-2xl border border-slate-100 space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest flex items-center">
                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 text-emerald-600" />
                    Recommendations
                  </h4>
                  <div className="space-y-4">
                    {(selectedScan.recommendations || []).map((rec, i) => (
                      <div key={i} className="space-y-1">
                        <p className="text-[11px] sm:text-xs text-slate-700">• {rec}</p>
                        <p className="text-[10px] sm:text-[11px] text-emerald-700 font-medium pl-3 italic">{selectedScan.recommendationsTamil?.[i] || ''}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedScan(null)}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-colors mt-4 shrink-0"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Quick Action */}
      {!history.length && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 md:p-10 text-center space-y-4 mx-2">
          <div className="bg-emerald-100 w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto">
            <Camera className="w-7 h-7 md:w-10 md:h-10 text-emerald-600" />
          </div>
          <h2 className="text-lg md:text-2xl font-bold text-emerald-900">Sync Drone Data</h2>
          <p className="text-xs md:text-base text-emerald-700 max-w-md mx-auto">Upload drone aerial imagery to identify plant species and detect disease patterns automatically.</p>
          <button 
            onClick={() => window.location.hash = '#/analyzer'}
            className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 w-full md:w-auto"
          >
            Start First Inspection
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
