
import React, { useState } from 'react';
import { PlantAnalysis } from '../types';
import { 
  Calendar, 
  Tag, 
  ShieldCheck, 
  AlertCircle, 
  Trash2, 
  Languages, 
  Eye, 
  X, 
  CheckCircle 
} from 'lucide-react';

interface Props {
  history: PlantAnalysis[];
  onDelete: (id: string) => void;
}

const HistoryView: React.FC<Props> = ({ history, onDelete }) => {
  const [selectedScan, setSelectedScan] = useState<PlantAnalysis | null>(null);

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Inspection History</h1>
          <p className="text-slate-500">Track your farmland health over time.</p>
        </div>
        <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
          <span className="text-emerald-700 font-bold text-sm">{history.length} Inspections Total</span>
        </div>
      </header>

      {history.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-20 text-center space-y-4 shadow-sm">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <Calendar className="w-10 h-10 text-slate-300" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">No inspections yet</h2>
          <p className="text-slate-500 max-w-sm mx-auto">Once you analyze drone footage, your records will be stored here securely.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative cursor-pointer"
              onClick={() => setSelectedScan(item)}
            >
              <div className="relative h-56 overflow-hidden">
                <img src={item.imageUrl} alt={item.plantType} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-emerald-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <div className="bg-white p-3 rounded-full text-emerald-600 shadow-xl scale-90 group-hover:scale-100 transition-transform">
                     <Eye className="w-6 h-6" />
                   </div>
                </div>

                <div className="absolute top-4 left-4 flex gap-2">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-sm backdrop-blur-md ${
                    item.healthStatus === 'Healthy' ? 'bg-emerald-500/80' : item.healthStatus === 'Stressed' ? 'bg-amber-500/80' : 'bg-red-500/80'
                  }`}>
                    {item.healthStatus}
                  </div>
                </div>
                
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                   <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                    className="bg-white/90 backdrop-blur-sm p-2 rounded-xl text-slate-400 hover:text-red-600 shadow-sm border border-slate-200 transition-colors"
                    title="Delete inspection"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20 shadow-sm">
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">{item.confidenceScore}% Accuracy</span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-lg leading-tight">{item.plantType}</h3>
                  </div>
                  <p className="text-sm font-bold text-emerald-600">{item.plantTypeTamil}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 italic">
                    "{item.description}"
                  </p>
                  <p className="text-[11px] text-emerald-700/70 font-medium line-clamp-1 italic">
                    {item.descriptionTamil}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                   <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-medium">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                   </div>
                   <div className="flex space-x-1">
                     <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                     </div>
                     <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Languages className="w-3.5 h-3.5 text-blue-600" />
                     </div>
                   </div>
                </div>
              </div>
            </div>
          ))}
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
    </div>
  );
};

export default HistoryView;
