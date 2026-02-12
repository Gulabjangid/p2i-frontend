"use client";

import { useState, useRef, useEffect } from "react";

const STYLES = [
  { id: "none", label: "Normal" },
  { id: "cinematic", label: "Cinematic" },
  { id: "photorealistic", label: "Photorealistic" },
  { id: "anime", label: "Anime" },
  { id: "fantasy", label: "4k" },
];

const ASPECT_RATIOS = [
  { id: "16:9", label: "16:9 (Widescreen)" },
  { id: "9:16", label: "9:16 (Portrait)" },
  { id: "1:1", label: "1:1 (Square)" },
  { id: "4:3", label: "4:3 (Standard)" },
  { id: "21:9", label: "21:9 (Ultrawide)" },
];

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [provider] = useState<"replicate" | "a4f">("replicate");
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState(ASPECT_RATIOS[0]);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAspectRatioDropdownOpen, setIsAspectRatioDropdownOpen] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  
  // Day/Night state
  const [isDarkMode, setIsDarkMode] = useState(true);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const aspectRatioDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (aspectRatioDropdownRef.current && !aspectRatioDropdownRef.current.contains(event.target as Node)) {
        setIsAspectRatioDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please describe your vision first.");
      return;
    }
    setLoading(true);
    setError("");
    setImageUrl("");
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          provider,
          style_preset: selectedStyle.id,
          aspect_ratio: selectedAspectRatio.id,
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || err.detail || "Backend error");
      }
      const data = await response.json();
      setImageUrl(data.image_url);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleEnhance = async () => {
    if (!prompt.trim()) return;
    setEnhancing(true);
    try {
      const res = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style_preset: selectedStyle.id }),
      });
      if (!res.ok) throw new Error("Enhance failed");
      const data = await res.json();
      setPrompt(data.enhanced_prompt);
    } catch (e: any) {
      setError(e.message || "Failed to enhance prompt");
    } finally {
      setEnhancing(false);
    }
  };

  const handleDownload = async () => {
    if (!imageUrl) return;
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `creation-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      window.open(imageUrl, '_blank');
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-700 font-sans selection:bg-indigo-500/30 overflow-x-hidden ${isDarkMode ? "bg-[#020205] text-gray-200" : "bg-gray-50 text-slate-900"}`}>
      
      {/* Dynamic Background Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Animated Blobs */}
        <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] mix-blend-screen transition-colors duration-1000 ${isDarkMode ? "bg-purple-900/20" : "bg-purple-200/50"}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] mix-blend-screen transition-colors duration-1000 ${isDarkMode ? "bg-blue-900/20" : "bg-blue-200/50"}`} />
        
        {/* Main Gradient overlay */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${isDarkMode ? "opacity-100 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.12),_transparent_60%)]" : "opacity-40 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.2),_transparent_60%)]"}`} />
        
        {/* Noise Texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* Theme Toggle Button */}
      <nav className="fixed top-6 right-6 z-50">
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-3 rounded-2xl backdrop-blur-xl border transition-all duration-300 shadow-xl ${isDarkMode ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-black/5 border-black/10 hover:bg-black/10"}`}
        >
          {isDarkMode ? (
            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" /></svg>
          ) : (
            <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
          )}
        </button>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-[90vh]">
        <div className="text-center mb-12 space-y-3">
          <h1 className={`heading-slide text-5xl md:text-6xl font-bold tracking-tight transition-colors duration-500 px-12 md:px-12 ${isDarkMode ? "bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent" : "text-slate-900"}`}>
            Imagine.
          </h1>
          
          <p className={`subheading-fade text-xs md:text-sm tracking-widest uppercase font-semibold ${isDarkMode ? "text-gray-500" : "text-slate-400"}`}>
            AI Powered Creative Engine
          </p>
        </div>

        {/* Interaction Bar */}
        <div className="w-full relative group">
          <div className={`relative w-full backdrop-blur-3xl border rounded-[36px] px-6 py-5 shadow-2xl transition-all duration-500 flex flex-col md:flex-row items-stretch gap-4 ${isDarkMode ? "bg-[#030614]/60 border-white/10 group-hover:border-blue-500/50" : "bg-white/70 border-black/5 shadow-slate-200 group-hover:border-blue-400"}`}>
            
            <div className="flex-1 flex items-stretch">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your imagination..."
                className={`w-full min-h-[120px] md:min-h-[100px] text-base md:text-lg rounded-2xl px-6 py-4 border focus:outline-none resize-none scrollbar-hide font-medium transition-all duration-300 ${isDarkMode ? "bg-[#020824] text-white placeholder-gray-500 border-[#0b1536] focus:border-blue-500/50" : "bg-gray-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:border-blue-400"}`}
                disabled={loading}
              />
            </div>

            <div className="flex flex-col w-full md:w-auto gap-3" ref={dropdownRef}>
              <div className="flex gap-3 w-full md:w-[260px]">
                {/* Style Dropdown */}
                <div className="relative flex-1">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`w-full h-11 flex items-center justify-between px-4 rounded-2xl border text-xs transition-all ${isDarkMode ? "bg-[#05091e] border-[#151b3b] text-white hover:bg-[#070d27]" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"}`}
                  >
                    <span className="truncate">{selectedStyle.label}</span>
                    <svg className={`w-3 h-3 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {isDropdownOpen && (
                    <div className={`absolute left-0 right-0 mt-2 border rounded-2xl shadow-2xl overflow-hidden z-50 max-h-64 overflow-y-auto backdrop-blur-xl ${isDarkMode ? "bg-[#020617] border-white/10" : "bg-white border-slate-200"}`}>
                      <div className="p-1">
                        {STYLES.map((style) => (
                          <button
                            key={style.id}
                            onClick={() => { setSelectedStyle(style); setIsDropdownOpen(false); }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${selectedStyle.id === style.id ? (isDarkMode ? "bg-blue-600 text-white" : "bg-blue-500 text-white") : (isDarkMode ? "text-gray-400 hover:bg-white/5" : "text-slate-600 hover:bg-slate-100")}`}
                          >
                            {style.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Aspect Ratio Dropdown */}
                <div className="relative flex-1" ref={aspectRatioDropdownRef}>
                  <button
                    onClick={() => setIsAspectRatioDropdownOpen(!isAspectRatioDropdownOpen)}
                    className={`w-full h-11 flex items-center justify-between px-4 rounded-2xl border text-xs transition-all ${isDarkMode ? "bg-[#05091e] border-[#151b3b] text-white" : "bg-white border-slate-200 text-slate-700"}`}
                  >
                    <span className="truncate">{selectedAspectRatio.label}</span>
                    <svg className={`w-3 h-3 transition-transform ${isAspectRatioDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {isAspectRatioDropdownOpen && (
                    <div className={`absolute left-0 right-0 mt-2 border rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl ${isDarkMode ? "bg-[#020617] border-white/10" : "bg-white border-slate-200"}`}>
                      <div className="p-1">
                        {ASPECT_RATIOS.map((ratio) => (
                          <button
                            key={ratio.id}
                            onClick={() => { setSelectedAspectRatio(ratio); setIsAspectRatioDropdownOpen(false); }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${selectedAspectRatio.id === ratio.id ? "bg-blue-500 text-white" : (isDarkMode ? "text-gray-400 hover:bg-white/5" : "text-slate-600 hover:bg-slate-100")}`}
                          >
                            {ratio.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 w-full">
                <button
                  onClick={handleEnhance}
                  disabled={loading || enhancing || !prompt.trim()}
                  className={`h-11 px-4 rounded-2xl border flex items-center justify-center transition-all ${isDarkMode ? "bg-[#05091e] border-[#151b3b] hover:border-blue-500/50" : "bg-white border-slate-200 hover:border-blue-400"}`}
                >
                  <svg className={`w-5 h-5 ${enhancing ? "animate-spin" : "animate-pulse"}`} fill={isDarkMode ? "white" : "#3b82f6"} viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className={`flex-1 h-11 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-[1.02] active:scale-95 ${isDarkMode ? "bg-white text-black hover:bg-gray-200" : "bg-slate-900 text-white hover:bg-slate-800"}`}
                >
                  {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : "Generate"}
                </button>
              </div>
            </div>
          </div>
          {error && <p className="absolute -bottom-7 left-6 text-red-500 text-xs font-medium animate-bounce">{error}</p>}
        </div>

        {/* Result Area */}
        {imageUrl && (
          <div className="mt-16 w-full max-w-2xl animate-emerge">
             <div className={`relative rounded-lg overflow-hidden border-2 shadow-lg ${isDarkMode ? "border-gray-700" : "border-gray-300"}`}>
                <img src={imageUrl} alt="Result" className="w-full h-auto" />
                <button 
                  onClick={handleDownload} 
                  className={`absolute bottom-4 right-4 px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 shadow-md hover:shadow-lg ${isDarkMode ? "bg-gray-900 text-gray-100 border border-gray-700 hover:bg-gray-800" : "bg-gray-100 text-gray-900 border border-gray-400 hover:bg-gray-200"}`}
                >
                  ↓ Download
                </button>
             </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        @keyframes float3d { 0%, 100% { transform: translateY(0px) rotateX(0deg); } 50% { transform: translateY(-4px) rotateX(1deg); } }
        .input-3d-glow { animation: float3d 4s ease-in-out infinite; }
        .heading-slide { animation: slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}