
import React, { useState, useRef } from 'react';
import { Upload, Loader2, CheckCircle, AlertCircle, RefreshCw, ChevronRight, Info, Zap, Languages, Database } from 'lucide-react';
import { analyzeDroneImage } from '../services/geminiService';
import { PlantAnalysis } from '../types';
import { supabase } from '../services/supabaseClient';

interface Props {
  onAnalysisComplete: (analysis: PlantAnalysis) => void;
  userName: string;
}

const Analyzer: React.FC<Props> = ({ onAnalysisComplete, userName }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlantAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setResult(null);
      setError(null);
    }
  };

  const processImage = async () => {
    if (!preview) return;
    
    setLoading(true);
    setError(null);
    try {
      const base64Data = preview.split(',')[1];
      const aiResponse = await analyzeDroneImage(base64Data);
      
      // Save to Supabase
      const { data: dbData, error: dbError } = await supabase
        .from('inspections')
        .insert([{
          user_name: userName,
          plant_type: aiResponse.plantType,
          plant_type_tamil: aiResponse.plantTypeTamil,
          health_status: aiResponse.healthStatus,
          confidence_score: aiResponse.confidenceScore,
          image_url: preview, // In production, upload to bucket first
          description: aiResponse.description,
          description_tamil: aiResponse.descriptionTamil,
          recommendations: aiResponse.recommendations,
          recommendations_tamil: aiResponse.recommendationsTamil
        }])
        .select();

      if (dbError) throw dbError;

      const savedItem = dbData[0];
      const newAnalysis: PlantAnalysis = {
        id: savedItem.id,
        timestamp: savedItem.created_at,
        imageUrl: savedItem.image_url,
        ...aiResponse
      };
      
      setResult(newAnalysis);
      onAnalysisComplete(newAnalysis);
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Check your Supabase URL/Key or Gemini API status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="text-center space-y-3">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">AI Drone Inspection</h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Remote sensing with cloud persistence via <span className="text-blue-600 font-semibold mx-1">Supabase</span>.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 overflow-hidden relative">
            <div className="relative z-10 flex flex-col md:flex-row gap-8">
              <div className="md:w-1/2 space-y-6">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-[2rem] p-8 text-center cursor-pointer transition-all aspect-square flex items-center justify-center ${
                    preview ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50'
                  }`}
                >
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  {preview ? (
                    <img src={preview} alt="Preview" className="rounded-2xl w-full h-full object-cover shadow-md" />
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                        <Upload className="w-8 h-8 text-slate-500" />
                      </div>
                      <p className="text-lg font-semibold text-slate-700">Drop drone image</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={processImage}
                  disabled={!file || loading}
                  className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 transition-all shadow-lg ${
                    !file || loading ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
                  }`}
                >
                  {loading ? <><Loader2 className="w-6 h-6 animate-spin" /><span>Syncing to Cloud...</span></> : <><RefreshCw className="w-6 h-6" /><span>Analyze & Save / ஆய்வு செய்க</span></>}
                </button>
                
                {error && (
                  <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-start space-x-2 text-red-600 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              <div className="md:w-1/2 space-y-4">
                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <Database className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-blue-900">Cloud Storage Live</h3>
                  </div>
                  <p className="text-sm text-blue-800/80 leading-relaxed">
                    Inspections are now saved to your global account for access from any device.
                  </p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-sm text-slate-600 space-y-2">
                  <p className="font-bold text-slate-900">Workflow:</p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Upload aerial photo</li>
                    <li>Gemini AI analyzes pixels</li>
                    <li>Results written to Supabase DB</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 flex flex-col min-h-[500px]">
          {!result && !loading && (
            <div className="flex-grow flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center">
                <Languages className="w-8 h-8 text-slate-200" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-400">Analysis Pending</p>
                <p className="text-xs text-slate-400">ஆய்வு நிலுவையில் உள்ளது</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex-grow flex flex-col items-center justify-center space-y-6 text-center">
              <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
              <div className="space-y-2">
                <h3 className="font-bold text-slate-800">Processing Pixels...</h3>
                <p className="text-xs text-slate-500 font-medium">Syncing results to cloud...</p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300 overflow-y-auto max-h-[600px] pr-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-emerald-600 tracking-widest mb-1">CLOUD SYNCED</p>
                  <h2 className="text-xl font-bold text-slate-900">{result.plantType}</h2>
                  <h2 className="text-lg font-bold text-emerald-600">{result.plantTypeTamil}</h2>
                </div>
                <div className="bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 text-xs font-bold text-emerald-700">
                  {result.confidenceScore}%
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Health / ஆரோக்கியம்</p>
                <div className="flex items-center space-x-2">
                  <CheckCircle className={`w-4 h-4 ${result.healthStatus === 'Healthy' ? 'text-emerald-500' : 'text-amber-500'}`} />
                  <span className="font-bold text-slate-800 text-sm">{result.healthStatus}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Findings / பகுப்பாய்வு</h4>
                <p className="text-slate-600 text-sm leading-relaxed mb-2">{result.description}</p>
                <p className="text-emerald-700 text-sm font-medium leading-relaxed italic">{result.descriptionTamil}</p>
              </div>

              <div className="space-y-3 bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Recommendations</h4>
                <div className="space-y-4">
                  {result.recommendations.map((rec, i) => (
                    <div key={i} className="space-y-1">
                      <p className="text-xs text-slate-700 font-medium leading-snug">• {rec}</p>
                      <p className="text-[11px] text-emerald-700 font-medium pl-3 italic">{result.recommendationsTamil?.[i] || ''}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analyzer;