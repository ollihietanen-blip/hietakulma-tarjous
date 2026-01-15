import React, { useState, useRef } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { ArrowRight, Ruler, Home, Box, Layers, PenTool, CheckCircle, Upload, FileText, X, Sparkles, Loader2 } from 'lucide-react';

interface ElementCalculatorViewProps {
  onComplete: () => void;
}

interface UploadedDocument {
  id: string;
  file: File;
  category: 'pohjapiirustus' | 'julkisivupiirustus' | 'leikkauspiirustus' | 'muu';
  preview?: string;
}

interface AIAnalysisResult {
  suggestedElements: Array<{
    type: string;
    description: string;
    quantity: number;
    specifications: Record<string, string>;
    section: string;
  }>;
  suggestedTrusses: Array<{
    type: string;
    span: number;
    quantity: number;
  }>;
  dimensions?: {
    width?: number;
    length?: number;
    height?: number;
    floors?: number;
  };
  notes: string[];
}

const ElementCalculatorView: React.FC<ElementCalculatorViewProps> = ({ onComplete }) => {
  const { addElement, quotation } = useQuotation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Basic dimensions state
  const [dims, setDims] = useState({
      width: 8,
      length: 12,
      floors: 1,
      height: 2.8,
      windowCount: 5,
      windowArea: 8,
      structureType: 'US-198'
  });

  // Document upload state
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Calculations
  const perimeter = (dims.width + dims.length) * 2;
  const wallAreaGross = perimeter * dims.height * dims.floors;
  const wallAreaNet = wallAreaGross - dims.windowArea;
  const floorArea = dims.width * dims.length * dims.floors;

  // File handling
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/') || file.name.match(/\.(pdf|dwg|dxf)$/i)) {
        const doc: UploadedDocument = {
          id: `doc-${Date.now()}-${Math.random()}`,
          file,
          category: 'muu',
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
        };
        setUploadedDocs(prev => [...prev, doc]);
      }
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const removeDocument = (id: string) => {
    setUploadedDocs(prev => {
      const doc = prev.find(d => d.id === id);
      if (doc?.preview) URL.revokeObjectURL(doc.preview);
      return prev.filter(d => d.id !== id);
    });
  };

  const updateDocumentCategory = (id: string, category: UploadedDocument['category']) => {
    setUploadedDocs(prev => prev.map(doc => doc.id === id ? { ...doc, category } : doc));
  };

  // AI Analysis with Gemini API
  const analyzeDocuments = async () => {
    if (uploadedDocs.length === 0) {
      alert('Lataa ensin piirustukset analysoitavaksi');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const apiKey = process.env.GEMINI_API_KEY || '';
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY ei ole määritelty. Tarkista .env.local tiedosto.');
      }

      // Convert images to base64
      const imagePromises = uploadedDocs
        .filter(doc => doc.file.type.startsWith('image/'))
        .slice(0, 3) // Gemini supports max 3 images per request
        .map(doc => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const base64 = (reader.result as string).split(',')[1];
              resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(doc.file);
          });
        });

      const imageData = await Promise.all(imagePromises);

      // Hae ohjetiedosto (parantuu koko ajan)
      const instruction = quotation.aiAnalysisInstruction?.instructionText || 
        `Analysoi nämä rakennussuunnitelmat (pohjapiirustus, julkisivupiirustus, leikkauspiirustus) ja anna suositukset puuelementeistä ja ristikoista.`;

      // Prepare prompt for Gemini
      const prompt = `${instruction}

Palauta vastaus JSON-muodossa seuraavalla rakenteella:
{
  "suggestedElements": [
    {
      "type": "elementin tyyppi (esim. 'Ulkoseinä US-198')",
      "description": "kuvaus",
      "quantity": määrä kpl,
      "specifications": {
        "height": "korkeus mm",
        "uValue": "U-arvo",
        "cladding": "verhous"
      },
      "section": "section-ext-walls tai section-int-walls tai section-floor tai section-roof"
    }
  ],
  "suggestedTrusses": [
    {
      "type": "ristikon tyyppi (esim. 'Harjakatto')",
      "span": jänneväli metriä,
      "quantity": määrä kpl
    }
  ],
  "dimensions": {
    "width": leveys metriä,
    "length": pituus metriä,
    "height": korkeus metriä,
    "floors": kerrokset
  },
  "notes": ["huomio1", "huomio2"]
}

Ole tarkka mitoissa ja anna realistisia määriä.`;

      // Call Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  ...imageData.map(base64 => ({
                    inline_data: {
                      mime_type: 'image/png',
                      data: base64
                    }
                  }))
                ]
              }
            ]
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API-virhe: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Parse JSON from response (might be wrapped in markdown)
      let jsonText = text;
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }

      const result: AIAnalysisResult = JSON.parse(jsonText);

      // Update dimensions if provided
      if (result.dimensions) {
        setDims(prev => ({
          ...prev,
          width: result.dimensions?.width || prev.width,
          length: result.dimensions?.length || prev.length,
          height: result.dimensions?.height || prev.height,
          floors: result.dimensions?.floors || prev.floors,
        }));
      }

      setAnalysisResult(result);
    } catch (error) {
      console.error('Analyysivirhe:', error);
      alert(`Analyysivirhe: ${error instanceof Error ? error.message : 'Tuntematon virhe'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Add single element from analysis
  const addSingleElement = (element: AIAnalysisResult['suggestedElements'][0]) => {
    addElement(element.section || 'section-ext-walls', {
      type: element.type,
      description: element.description,
      specifications: element.specifications,
      quantity: element.quantity,
      unit: 'kpl',
      unitPrice: 450,
      netArea: 0
    });
  };

  const applyAISuggestions = () => {
    if (!analysisResult) return;

    let addedCount = 0;

    // Add suggested elements
    analysisResult.suggestedElements.forEach(element => {
      addSingleElement(element);
      addedCount += element.quantity;
    });

    alert(`${addedCount} elementtiä lisätty tarjoukseen AI-ehdotusten perusteella!`);
    onComplete();
  };

  const handleApply = () => {
    // Assuming max element width ~3.0m for simple calculation
    const elementWidth = 3.0; 
    const elementCount = Math.ceil(perimeter / elementWidth); 

    if (wallAreaNet > 0) {
        // Create one batch entry for the calculated elements
        addElement('section-ext-walls', {
            type: `Ulkoseinä ${dims.structureType} (Laskettu)`,
            description: `Määrälaskennasta: Kehä ${perimeter}m, Korkeus ${dims.height}m. \nBruttoala ${wallAreaGross.toFixed(1)}m², Aukot ${dims.windowArea}m²`,
            specifications: {
                height: `${dims.height * 1000} mm`,
                uValue: dims.structureType === 'US-198' ? '0,17 W/m²K' : '0,25 W/m²K',
                cladding: 'UTW 28x195',
            },
            quantity: elementCount,
            unit: 'kpl',
            unitPrice: 450, // Base price estimate
            netArea: Number((wallAreaNet / elementCount).toFixed(1)),
            hasWindowInstall: dims.windowCount > 0,
            windowCount: Math.ceil(dims.windowCount / elementCount),
            windowInstallPrice: 45
        });
        
        alert(`${elementCount}kpl seinäelementtejä lisätty onnistuneesti tarjoukseen!`);
        onComplete();
    } else {
        alert('Ei lisättävää, tarkista syötetyt mitat.');
    }
  };

  const inputClass = "w-full bg-white border border-slate-300 text-slate-900 rounded-lg p-3 font-medium focus:border-hieta-blue focus:ring-2 focus:ring-hieta-blue/20 outline-none transition-all card-shadow";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2";

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in slide-in-from-right-4 duration-500">
      <div className="mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-3">
            <Box className="text-hieta-blue" /> Puuelementtilaskenta
        </h1>
        <p className="text-slate-500 mt-2 max-w-2xl">
            Syötä rakennuksen päämitat tai lataa piirustukset AI-analysoitavaksi. Järjestelmä laskee arvion seinäelementtien menekistä ja lisää ne tarjoukseen.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Inputs */}
          <div className="lg:col-span-7 space-y-6">
              
              {/* Document Upload Section */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 card-shadow hover-lift">
                  <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                      <FileText className="text-purple-600" /> Piirustukset (AI-analyysi)
                  </h3>
                  
                  {/* Drop Zone */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                      isDragging 
                        ? 'border-hieta-blue bg-hieta-blue/10' 
                        : 'border-slate-300 hover:border-hieta-wood-accent hover:bg-hieta-wood-light/30'
                    }`}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      handleFileSelect(e.dataTransfer.files);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mx-auto text-slate-400 mb-3" size={32} />
                    <p className="text-slate-600 font-medium mb-1">
                      Vedä piirustukset tähän tai klikkaa valitaksesi
                    </p>
                    <p className="text-xs text-slate-400">
                      Tuettu: PDF, PNG, JPG, DWG, DXF
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,.pdf,.dwg,.dxf"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </div>

                  {/* Uploaded Documents */}
                  {uploadedDocs.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {uploadedDocs.map(doc => (
                        <div key={doc.id} className="flex items-center gap-3 p-3 bg-hieta-wood-light/50 rounded-lg border border-slate-200 hover-lift">
                          <FileText size={20} className="text-hieta-blue" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{doc.file.name}</p>
                            <select
                              className="text-xs text-slate-600 mt-1 bg-white border border-slate-300 rounded px-2 py-1"
                              value={doc.category}
                              onChange={(e) => updateDocumentCategory(doc.id, e.target.value as UploadedDocument['category'])}
                            >
                              <option value="pohjapiirustus">Pohjapiirustus</option>
                              <option value="julkisivupiirustus">Julkisivupiirustus</option>
                              <option value="leikkauspiirustus">Leikkauspiirustus</option>
                              <option value="muu">Muu</option>
                            </select>
                          </div>
                          <button
                            onClick={() => removeDocument(doc.id)}
                            className="p-1 hover:bg-slate-200 rounded transition-colors"
                          >
                            <X size={16} className="text-slate-500" />
                          </button>
                        </div>
                      ))}
                      
                      <button
                        onClick={analyzeDocuments}
                        disabled={isAnalyzing}
                        className="w-full mt-4 bg-hieta-blue hover:bg-hieta-blue/90 disabled:bg-slate-400 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 card-shadow hover-lift"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="animate-spin" size={18} /> Analysoidaan...
                          </>
                        ) : (
                          <>
                            <Sparkles size={18} /> Analysoi piirustukset AI:lla
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* AI Analysis Results - Detailed List */}
                  {analysisResult && (
                    <div className="mt-4 space-y-4">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                          <Sparkles size={16} /> AI-analyysin tulokset
                        </h4>
                        <div className="space-y-2 text-sm text-green-800">
                          <p><strong>Ehdotetut elementit:</strong> {analysisResult.suggestedElements.length} tyyppiä</p>
                          <p><strong>Ehdotetut ristikot:</strong> {analysisResult.suggestedTrusses.length} tyyppiä</p>
                          {analysisResult.notes.length > 0 && (
                            <div className="mt-2">
                              <strong>Huomiot:</strong>
                              <ul className="list-disc list-inside mt-1">
                                {analysisResult.notes.map((note, i) => (
                                  <li key={i}>{note}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Analysoidut tuotteet - lista */}
                      <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <Box size={18} className="text-blue-600" /> Piirustuksista löydetyt tuotteet
                        </h4>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {/* Elementit */}
                          {analysisResult.suggestedElements.map((element, index) => (
                            <div 
                              key={`element-${index}`}
                              className="p-3 bg-hieta-wood-light/30 border border-slate-200 rounded-lg hover:border-hieta-blue hover:bg-hieta-blue/5 hover-lift transition-all cursor-pointer group"
                              onClick={() => {
                                addSingleElement(element);
                                alert(`${element.type} (${element.quantity} kpl) lisätty tarjoukseen!`);
                              }}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="font-bold text-slate-900 text-sm mb-1">{element.type}</div>
                                  <div className="text-xs text-slate-600 mb-2">{element.description}</div>
                                  <div className="flex flex-wrap gap-2 text-xs">
                                    <span className="bg-hieta-blue/10 text-hieta-blue px-2.5 py-1 rounded-md font-medium border border-hieta-blue/20">
                                      {element.quantity} kpl
                                    </span>
                                    {Object.entries(element.specifications).slice(0, 2).map(([key, value]) => (
                                      <span key={key} className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                                        {key}: {value}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <ArrowRight 
                                  size={18} 
                                  className="text-slate-400 group-hover:text-hieta-blue group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" 
                                />
                              </div>
                            </div>
                          ))}

                          {/* Ristikot */}
                          {analysisResult.suggestedTrusses.map((truss, index) => (
                            <div 
                              key={`truss-${index}`}
                              className="p-3 bg-amber-50 border border-amber-200 rounded-lg hover:border-amber-400 hover:bg-amber-100 transition-all cursor-pointer group"
                              onClick={() => {
                                // Ristikot voidaan lisätä myöhemmin ristikkolaskuriin
                                alert(`Ristikko "${truss.type}" (${truss.quantity} kpl, jänneväli ${truss.span}m) - siirry ristikkolaskuriin lisätäksesi tämän.`);
                              }}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
                                    <Layers size={14} className="text-amber-600" />
                                    {truss.type}
                                  </div>
                                  <div className="flex flex-wrap gap-2 text-xs mt-2">
                                    <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-medium">
                                      {truss.quantity} kpl
                                    </span>
                                    <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                                      Jänneväli: {truss.span}m
                                    </span>
                                  </div>
                                </div>
                                <ArrowRight 
                                  size={18} 
                                  className="text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" 
                                />
                              </div>
                            </div>
                          ))}

                          {analysisResult.suggestedElements.length === 0 && analysisResult.suggestedTrusses.length === 0 && (
                            <p className="text-sm text-slate-500 text-center py-4">
                              Ei löytynyt tuotteita analyysistä
                            </p>
                          )}
                        </div>

                        {/* Siirrä kaikki -nappi */}
                        {(analysisResult.suggestedElements.length > 0 || analysisResult.suggestedTrusses.length > 0) && (
                          <button
                            onClick={applyAISuggestions}
                            className="mt-4 w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                          >
                            <CheckCircle size={16} /> Siirrä kaikki tarjoukseen
                          </button>
                        )}
                      </div>
                    </div>
                  )}
              </div>

              {/* Dimensions Section */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 card-shadow hover-lift">
                  <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                      <Ruler className="text-blue-600" /> Geometria & Rakenne
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                      <div className="col-span-2">
                          <label className={labelClass}>Rakennetyyppi (Seinä)</label>
                          <select 
                             className={inputClass}
                             value={dims.structureType}
                             onChange={e => setDims({...dims, structureType: e.target.value})}
                          >
                              <option value="US-198">US-198 (U=0.17, 42x198)</option>
                              <option value="US-148">US-148 (U=0.25, 42x148)</option>
                          </select>
                      </div>
                      <div>
                          <label className={labelClass}>Leveys (m)</label>
                          <input type="number" step="0.1" className={inputClass} value={dims.width} onChange={e => setDims({...dims, width: Number(e.target.value)})} />
                      </div>
                      <div>
                          <label className={labelClass}>Pituus (m)</label>
                          <input type="number" step="0.1" className={inputClass} value={dims.length} onChange={e => setDims({...dims, length: Number(e.target.value)})} />
                      </div>
                      <div>
                          <label className={labelClass}>Huonekorkeus (m)</label>
                          <input type="number" step="0.1" className={inputClass} value={dims.height} onChange={e => setDims({...dims, height: Number(e.target.value)})} />
                      </div>
                      <div>
                          <label className={labelClass}>Kerrokset</label>
                          <input type="number" min="1" step="1" className={inputClass} value={dims.floors} onChange={e => setDims({...dims, floors: Number(e.target.value)})} />
                      </div>
                  </div>
              </div>

              {/* Openings */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 card-shadow hover-lift">
                  <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                      <Layers className="text-orange-500" /> Aukot
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                      <div>
                          <label className={labelClass}>Ikkunoiden määrä (kpl)</label>
                          <input type="number" min="0" className={inputClass} value={dims.windowCount} onChange={e => setDims({...dims, windowCount: Number(e.target.value)})} />
                      </div>
                      <div>
                          <label className={labelClass}>Aukkojen ala yht. (m²)</label>
                          <input type="number" min="0" step="0.1" className={inputClass} value={dims.windowArea} onChange={e => setDims({...dims, windowArea: Number(e.target.value)})} />
                      </div>
                  </div>
              </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-5 space-y-6">
              <div className="bg-hieta-black text-white p-6 rounded-xl card-shadow-lg sticky top-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-xl flex items-center gap-2">
                        <CheckCircle size={24} className="text-hieta-blue" /> Tulokset
                    </h3>
                    <span className="text-xs font-bold bg-slate-800 px-2 py-1 rounded text-slate-400">AUTO-CALC</span>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                      <div className="flex justify-between items-center py-2 border-b border-slate-700">
                          <span className="text-slate-400 flex items-center gap-2"><Layers size={14}/> Pohjan ala</span>
                          <span className="text-xl font-bold">{floorArea.toFixed(1)} m²</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-700">
                          <span className="text-slate-400 flex items-center gap-2"><PenTool size={14}/> Ulkoseinä (brutto)</span>
                          <span className="text-xl font-bold">{wallAreaGross.toFixed(1)} m²</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-700">
                          <span className="text-slate-400 flex items-center gap-2"><CheckCircle size={14}/> Ulkoseinä (netto)</span>
                          <span className="text-xl font-bold text-hieta-blue">{wallAreaNet.toFixed(1)} m²</span>
                      </div>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                      <div className="text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">Arvioidut tarvikkeet (siirtyy tarjoukseen)</div>
                      <div className="space-y-3">
                         <div className="flex items-center justify-between text-sm">
                             <div className="flex items-center gap-2 text-slate-300">
                                <Box size={16} className="text-hieta-blue"/> Seinäelementit
                             </div>
                             <span className="font-bold text-white">~{Math.ceil(perimeter / 3.0)} kpl</span>
                         </div>
                      </div>
                  </div>

                  <button 
                    onClick={handleApply}
                    className="mt-8 w-full bg-hieta-black hover:bg-slate-800 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 card-shadow-lg hover-lift active:scale-95 group"
                  >
                      Siirrä elementit tarjoukseen <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default ElementCalculatorView;
