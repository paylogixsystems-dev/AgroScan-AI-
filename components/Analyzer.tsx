
import React, { useState, useRef } from 'react';
import { Upload, Loader2, CheckCircle, AlertCircle, RefreshCw, ChevronRight, Info, Zap, Languages } from 'lucide-react';
import { analyzeDroneImage } from '../services/geminiService';
import { PlantAnalysis } from '../types';

interface Props {
  onAnalysisComplete: (analysis: PlantAnalysis) => void;
}

const Analyzer: React.FC<Props> = ({ onAnalysisComplete }) => {
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
      
      const newAnalysis: PlantAnalysis = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        imageUrl: preview,
        ...aiResponse
      };
      
      setResult(newAnalysis);
      onAnalysisComplete(newAnalysis);
    } catch (err) {
      console.error(err);
      setError("Failed to process image. Ensure your API key is valid and the image is clear.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="text-center space-y-3">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">AI Inspection Tool</h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Drone photos to insights via <span className="text-emerald-600 font-semibold mx-1">Gemini AI</span>.
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
                  {loading ? <><Loader2 className="w-6 h-6 animate-spin" /><span>Processing...</span></> : <><RefreshCw className="w-6 h-6" /><span>Process with AI / ஆய்வு செய்க</span></>}
                </button>
              </div>

              <div className="md:w-1/2 space-y-4">
                <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-bold text-emerald-900">Tamil Support Enabled</h3>
                  </div>
                  <p className="text-sm text-emerald-800/80 leading-relaxed">
                    ஆய்வு முடிவுகள் தமிழ் மற்றும் ஆங்கிலத்தில் வழங்கப்படும்.
                    (Results available in Tamil & English).
                  </p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-sm text-slate-600 space-y-2">
                  <p className="font-bold text-slate-900">How to test:</p>
                  <p>1. Upload a drone shot / படம் பதிவேற்றவும்.</p>
                  <p>2. Click Process / ஆய்வு செய்க.</p>
                  <p>3. Read analysis / முடிவுகளைப் படிக்கவும்.</p>
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
                <p className="text-[10px] text-slate-300 px-6">Upload a photo to see results in Tamil & English</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex-grow flex flex-col items-center justify-center space-y-6 text-center">
              <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
              <div className="space-y-2">
                <h3 className="font-bold text-slate-800">Reading Data...</h3>
                <p className="text-xs text-slate-500 font-medium">தரவு ஆய்வு செய்யப்படுகிறது...</p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300 overflow-y-auto max-h-[600px] pr-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-emerald-600 tracking-widest mb-1">SUCCESS</p>
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
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Analysis / பகுப்பாய்வு</h4>
                <p className="text-slate-600 text-sm leading-relaxed mb-2">{result.description}</p>
                <p className="text-emerald-700 text-sm font-medium leading-relaxed italic">{result.descriptionTamil}</p>
              </div>

              <div className="space-y-3 bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Recommendations / பரிந்துரைகள்</h4>
                <div className="space-y-4">
                  {result.recommendations.map((rec, i) => (
                    <div key={i} className="space-y-1">
                      <p className="text-xs text-slate-700">• {rec}</p>
                      <p className="text-xs text-emerald-700 font-medium pl-3 italic">{result.recommendationsTamil[i]}</p>
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
