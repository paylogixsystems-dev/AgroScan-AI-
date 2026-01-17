
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
    if (!supabase) {
      setError("Database is not connected. Please check your Supabase configuration.");
      return;
    }
    
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
          image_url: preview,
          description: aiResponse.description,
          description_tamil: aiResponse.descriptionTamil,
          recommendations: aiResponse.recommendations,
          recommendations_tamil: aiResponse.recommendationsTamil
        }])
        .select();

      if (dbError) throw dbError;
      if (!dbData || dbData.length === 0) throw new Error("Database did not return saved record.");

      const savedItem = dbData[0];
      const newAnalysis: PlantAnalysis = {
        id: savedItem.id,
        timestamp: savedItem.created_at,
        imageUrl: savedItem.image_url,
        plantType: savedItem.plant_type,
        plantTypeTamil: savedItem.plant_type_tamil,
        healthStatus: savedItem.health_status,
        confidenceScore: savedItem.confidence_score,
        description: savedItem.description,
        descriptionTamil: savedItem.description_tamil,
        recommendations: savedItem.recommendations || [],
        recommendationsTamil: savedItem.recommendations_tamil || []
      };
      
      setResult(newAnalysis);
      onAnalysisComplete(newAnalysis);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Analysis failed. Check your Supabase URL/Key or Gemini API status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="text-center space-y-3 px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">AI Drone Inspection</h1>
        <p className="text-slate-500 text-sm md:text-lg max-w-2xl mx-auto">
          Remote sensing with cloud persistence via <span className="text-blue-600 font-semibold mx-1">Supabase</span>.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 overflow-hidden relative">
            <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-8">
              <div className="md:w-1/2 space-y-6">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-[2rem] p-4 md:p-8 text-center cursor-pointer transition-all aspect-square flex items-center justify-center ${
                    preview ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50'
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    capture="environment"
                    onChange={handleFileChange} 
                  />
                  {preview ? (
                    <img src={preview} alt="Preview" className="rounded-2xl w-full h-full object-cover shadow-md" />
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-slate-100 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto">
                        <Upload className="w-6 h-6 md:w-8 md:h-8 text-slate-500" />
                      </div>
                      <p className="text-sm md:text-lg font-semibold text-slate-700">Upload or Capture</p>
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
                  {loading ? <><Loader2 className="w-6 h-6 animate-spin" /><span>Processing...</span></> : <><RefreshCw className="w-6 h-6" /><span>Analyze & Save</span></>}
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
                    <h3 className="font-bold text-blue-900">Cloud Sync</h3>
                  </div>
                  <p className="text-xs md:text-sm text-blue-800/80 leading-relaxed">
                    Inspections are instantly saved to your global account for monitoring.
                  </p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-xs md:text-sm text-slate-600 space-y-2">
                  <p className="font-bold text-slate-900">Mobile Tips:</p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Use "environment" camera for best focus</li>
                    <li>Ensure even lighting on plants</li>
                    <li>Check data connection for AI sync</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8 flex flex-col min-h-[400px]">
          {!result && !loading && (
            <div className="flex-grow flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center">
                <Languages className="w-6 h-6 md:w-8 md:h-8 text-slate-200" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-400">Analysis Pending</p>
                <p className="text-[10px] md:text-xs text-slate-400 uppercase">Awaiting drone telemetry</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex-grow flex flex-col items-center justify-center space-y-6 text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
              <div className="space-y-2">
                <h3 className="font-bold text-slate-800">Reading Pixels...</h3>
                <p className="text-[10px] md:text-xs text-slate-500 font-medium uppercase">Gemini AI Engine running</p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300 overflow-y-auto max-h-[600px] pr-2">
              <div className="flex justify-between items-start">
                <div className="max-w-[70%]">
                  <p className="text-[10px] font-bold text-emerald-600 tracking-widest mb-1 uppercase">Cloud Synced</p>
                  <h2 className="text-lg md:text-xl font-bold text-slate-900 break-words">{result.plantType}</h2>
                  <h2 className="text-base md:text-lg font-bold text-emerald-600 break-words">{result.plantTypeTamil}</h2>
                </div>
                <div className="bg-emerald-50 px-2 md:px-3 py-1 rounded-full border border-emerald-100 text-[10px] md:text-xs font-bold text-emerald-700">
                  {result.confidenceScore}%
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Health Status</p>
                <div className="flex items-center space-x-2">
                  <CheckCircle className={`w-4 h-4 ${result.healthStatus === 'Healthy' ? 'text-emerald-500' : 'text-amber-500'}`} />
                  <span className="font-bold text-slate-800 text-sm">{result.healthStatus}</span>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Findings</h4>
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed mb-2">{result.description}</p>
                <p className="text-emerald-700 text-xs md:text-sm font-medium leading-relaxed italic">{result.descriptionTamil}</p>
              </div>

              <div className="space-y-3 bg-emerald-50/50 p-4 md:p-5 rounded-2xl border border-emerald-100">
                <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Recommendations</h4>
                <div className="space-y-4">
                  {(result.recommendations || []).map((rec, i) => (
                    <div key={i} className="space-y-1">
                      <p className="text-[11px] md:text-xs text-slate-700 font-medium leading-snug">• {rec}</p>
                      <p className="text-[10px] md:text-[11px] text-emerald-700 font-medium pl-3 italic">{result.recommendationsTamil?.[i] || ''}</p>
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
