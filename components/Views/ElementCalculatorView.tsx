import React, { useState, useRef, useEffect } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import Breadcrumb from '../Layout/Breadcrumb';
import { ArrowRight, Ruler, Home, Box, Layers, PenTool, CheckCircle, Upload, FileText, X, Sparkles, Loader2, AlertCircle, Plus } from 'lucide-react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { isConvexConfigured } from '../../lib/convexClient';

interface ElementCalculatorViewProps {
  onComplete: () => void;
}

interface UploadedDocument {
  id: string;
  file: File;
  category: 'pohjapiirustus' | 'julkisivupiirustus' | 'leikkauspiirustus' | 'muu';
  preview?: string;
}

interface AIQuestion {
  question: string;
  options: {
    a: string;
    b: string;
    c: string;
  };
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
  questions?: AIQuestion[]; // Kysymykset A/B/C -vaihtoehdoilla
}

const ElementCalculatorView: React.FC<ElementCalculatorViewProps> = ({ onComplete }) => {
  const { addElement, quotation, saveQuotation } = useQuotation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generateWithImages = isConvexConfigured ? useAction(api.gemini.generateWithImages) : null;
  
  // Opening type definition
  interface Opening {
    id: string;
    type: 'window' | 'door' | 'other';
    quantity: number;
    area: number; // m²
    description?: string;
  }

  // Basic dimensions state
  const [dims, setDims] = useState({
      width: 8,
      length: 12,
      floors: 1,
      height: 2.8,
      structureType: 'US-198'
  });

  // Openings state - list of openings
  const [openings, setOpenings] = useState<Opening[]>([
    { id: '1', type: 'window', quantity: 5, area: 8, description: 'Ikkunat' }
  ]);

  // Document upload state
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // AI questions and answers
  const [aiQuestions, setAiQuestions] = useState<AIQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, 'a' | 'b' | 'c' | 'text'>>({});
  const [answerModes, setAnswerModes] = useState<Record<number, 'options' | 'text'>>({});
  const [textAnswers, setTextAnswers] = useState<Record<number, string>>({});

  // Selected items to transfer to quotation
  const [selectedItems, setSelectedItems] = useState({
    wallElements: true, // Default selected
  });


  // Calculations
  const perimeter = (dims.width + dims.length) * 2;
  const wallAreaGross = perimeter * dims.height * dims.floors;
  const totalOpeningArea = openings.reduce((sum, opening) => sum + (opening.area * opening.quantity), 0);
  const wallAreaNet = wallAreaGross - totalOpeningArea;
  const floorArea = dims.width * dims.length * dims.floors;
  const totalOpeningCount = openings.reduce((sum, opening) => sum + opening.quantity, 0);

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

  // AI Analysis with Claude API
  const analyzeDocuments = async () => {
    if (uploadedDocs.length === 0) {
      alert('Lataa ensin piirustukset analysoitavaksi');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      // Convert images to base64
      const imagePromises = uploadedDocs
        .filter(doc => doc.file.type.startsWith('image/'))
        .slice(0, 3) // Claude supports max 3 images per request
        .map(doc => {
          return new Promise<{ mimeType: string; base64Data: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const base64 = (reader.result as string).split(',')[1];
              resolve({
                mimeType: doc.file.type,
                base64Data: base64
              });
            };
            reader.onerror = reject;
            reader.readAsDataURL(doc.file);
          });
        });

      const imageData = await Promise.all(imagePromises);

      // Hae ohjetiedosto (parantuu koko ajan)
      // Lataa ohjeistus tiedostosta tai käytä tallennettua versiota
      let instruction = quotation.aiAnalysisInstruction?.instructionText;
      
      if (!instruction) {
        // Lataa oletusohjeistus tiedostosta
        try {
          const { loadAIInstruction, getAIInstructionWithContext } = await import('../../utils/loadAIInstruction');
          const baseInstruction = await loadAIInstruction();
          instruction = getAIInstructionWithContext(
            baseInstruction,
            quotation.project.buildingType,
            quotation.aiAnalysisInstruction?.examples
          );
        } catch (error) {
          console.warn('Could not load AI instruction, using fallback:', error);
          instruction = `Analysoi nämä rakennussuunnitelmat (pohjapiirustus, julkisivupiirustus, leikkauspiirustus) ja anna suositukset puuelementeistä ja ristikoista.`;
        }
      }

      // Add user answers to context if available
      let contextInfo = '';
      if (Object.keys(userAnswers).length > 0 && aiQuestions.length > 0) {
        contextInfo = '\n\nLisätietoa käyttäjältä:\n';
        Object.entries(userAnswers).forEach(([index, answer]) => {
          const questionIndex = parseInt(index);
          if (aiQuestions[questionIndex]) {
            const question = aiQuestions[questionIndex];
            const mode = answerModes[questionIndex] || 'options';
            if (mode === 'text' && textAnswers[questionIndex]) {
              contextInfo += `- Kysymys: ${question.question}\n  Vastaus: ${textAnswers[questionIndex]}\n`;
            } else if (mode === 'options' && question.options[answer]) {
              const selectedOption = question.options[answer];
              contextInfo += `- Kysymys: ${question.question}\n  Vastaus: ${answer.toUpperCase()}) ${selectedOption}\n`;
            }
          }
        });
      }

      // Prepare prompt for Claude
      const prompt = `${instruction}${contextInfo}

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
  "notes": ["huomio1", "huomio2"],
  "questions": [
    {
      "question": "Kysymys johon tarvitset vastauksen parantaaksesi analyysiä",
      "options": {
        "a": "Vaihtoehto A",
        "b": "Vaihtoehto B",
        "c": "Vaihtoehto C"
      }
    }
  ]
}

Jos tarvitset lisätietoja tarkempaa analyysiä varten, lisää 1-3 kysymystä "questions"-kenttään. 
Kussakin kysymyksessä anna 3 vaihtoehtoa (a, b, c). 
Jos sinulla on tarpeeksi tietoa analysoida piirustukset, jätä "questions" tyhjäksi taulukoksi.

Ole tarkka mitoissa ja anna realistisia määriä.`;

      // Call Claude API via Convex (server-side, secure)
      if (!generateWithImages) {
        throw new Error('Convex ei ole konfiguroitu. Tarkista että VITE_CONVEX_URL on asetettu .env.local tiedostossa.');
      }

      const apiResult = await generateWithImages({
        prompt: prompt,
        images: imageData
      });

      const text = apiResult.text;

      // Parse JSON from response (might be wrapped in markdown)
      let jsonText = text;
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }

      const analysisResult: AIAnalysisResult = JSON.parse(jsonText);

      // Check if AI has questions
      const questions = analysisResult.questions || [];
      
      if (questions.length > 0) {
        setAiQuestions(questions);
        setCurrentQuestionIndex(0);
        // Keep existing answers if re-analyzing
      } else {
        // Tyhjennä kysymykset jos uudessa analyysissä ei ole kysymyksiä
        setAiQuestions([]);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setTextAnswers({});
        setAnswerModes({});
      }

      // Update dimensions if provided
      if (analysisResult.dimensions) {
        setDims(prev => ({
          ...prev,
          width: analysisResult.dimensions?.width || prev.width,
          length: analysisResult.dimensions?.length || prev.length,
          height: analysisResult.dimensions?.height || prev.height,
          floors: analysisResult.dimensions?.floors || prev.floors,
        }));
      }

      setAnalysisResult(analysisResult);
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

    // Päivitä AI-ohjetta kohteen laskemisen jälkeen
    updateAIInstructionAfterCalculation(addedCount);

    alert(`${addedCount} elementtiä lisätty tarjoukseen AI-ehdotusten perusteella!`);
    onComplete();
  };

  // Päivitä AI-ohjetta kohteen laskemisen jälkeen
  const updateAIInstructionAfterCalculation = (elementCount: number) => {
    try {
      const currentInstruction = quotation.aiAnalysisInstruction || {
        version: 1,
        lastUpdated: new Date(),
        instructionText: '',
        examples: []
      };

      // Luo uusi ohje joka sisältää oppimisen
      const learningNote = `\n\nHuomio viimeisimmästä analyysistä:\n- Löydettiin ${elementCount} elementtiä\n- Rakennustyyppi: ${quotation.project.buildingType}\n- Mitat: ${dims.width}m x ${dims.length}m, ${dims.floors} kerrosta`;

      const updatedInstruction = {
        ...currentInstruction,
        version: currentInstruction.version + 1,
        lastUpdated: new Date(),
        instructionText: currentInstruction.instructionText + learningNote
      };

      // Tallenna päivitetty ohje (käytetään saveQuotation:ia joka päivittää myös ohjeen)
      // Tämä vaatii QuotationContextissa funktion päivittää AI-ohjetta
      // Nyt tallennetaan väliaikaisesti quotation-olioon
      saveQuotation();
    } catch (error) {
      console.warn('AI-ohjeen päivitys epäonnistui:', error);
    }
  };

  const handleApply = () => {
    // Assuming max element width ~3.0m for simple calculation
    const elementWidth = 3.0; 
    const elementCount = Math.ceil(perimeter / elementWidth); 

    if (wallAreaNet > 0) {
        let addedCount = 0;

        // Add wall elements if selected
        if (selectedItems.wallElements) {
            addElement('section-ext-walls', {
                type: `Ulkoseinä ${dims.structureType} (Laskettu)`,
                description: `Määrälaskennasta: Kehä ${perimeter}m, Korkeus ${dims.height}m. \nBruttoala ${wallAreaGross.toFixed(1)}m², Aukot ${totalOpeningArea.toFixed(1)}m²`,
                specifications: {
                    height: `${dims.height * 1000} mm`,
                    uValue: dims.structureType === 'US-198' ? '0,17 W/m²K' : '0,25 W/m²K',
                    cladding: 'UTW 28x195',
                },
                quantity: elementCount,
                unit: 'kpl',
                unitPrice: 450, // Base price estimate
                netArea: Number((wallAreaNet / elementCount).toFixed(1)),
                hasWindowInstall: totalOpeningCount > 0,
                windowCount: Math.ceil(totalOpeningCount / elementCount),
                windowInstallPrice: 45
            });
            addedCount += elementCount;
        }

        if (addedCount > 0) {
            // Päivitä AI-ohjetta kohteen laskemisen jälkeen
            updateAIInstructionAfterCalculation(addedCount);
            
            alert(`${addedCount}kpl elementtejä lisätty onnistuneesti tarjoukseen!`);
            onComplete();
        } else {
            alert('Valitse vähintään yksi tuote siirrettäväksi.');
        }
    } else {
        alert('Ei lisättävää, tarkista syötetyt mitat.');
    }
  };

  const inputClass = "w-full bg-white border border-slate-300 text-slate-900 rounded-lg p-3 font-medium focus:border-hieta-blue focus:ring-2 focus:ring-hieta-blue/20 outline-none transition-all card-shadow";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2";

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in slide-in-from-right-4 duration-500">
      <div className="mb-6">
        <Breadcrumb 
          items={[
            { label: 'Etusivu' },
            { label: 'Projektit' },
            { label: quotation.project.name || 'Nimetön Projekti' },
            { label: 'Elementtilaskuri' }
          ]}
        />
      </div>
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

                      {/* AI Questions & Answers - One question at a time with A/B/C buttons */}
                      {aiQuestions.length > 0 && currentQuestionIndex < aiQuestions.length && (
                        <div className="mt-4 p-6 bg-amber-50 border-2 border-amber-300 rounded-xl shadow-lg">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-amber-900 flex items-center gap-2">
                              <Sparkles size={18} /> Tekoälyn kysymys {currentQuestionIndex + 1}/{aiQuestions.length}
                            </h4>
                            <button
                              onClick={() => {
                                setAiQuestions([]);
                                setCurrentQuestionIndex(0);
                                setUserAnswers({});
                                setTextAnswers({});
                                setAnswerModes({});
                              }}
                              className="text-amber-700 hover:text-amber-900 transition-colors"
                              title="Ohita kysymykset"
                            >
                              <X size={18} />
                            </button>
                          </div>
                          
                          <p className="text-sm text-amber-800 mb-4">
                            Tekoäly tarvitsee lisätietoja tarkempaa analyysiä varten. Valitse vastaus:
                          </p>
                          
                          {/* Answer mode toggle */}
                          <div className="mb-4 flex gap-2">
                            <button
                              onClick={() => {
                                setAnswerModes(prev => ({ ...prev, [currentQuestionIndex]: 'options' }));
                                // Clear text answer when switching to options
                                if (textAnswers[currentQuestionIndex]) {
                                  const newTextAnswers = { ...textAnswers };
                                  delete newTextAnswers[currentQuestionIndex];
                                  setTextAnswers(newTextAnswers);
                                }
                                // Clear option answer
                                const newAnswers = { ...userAnswers };
                                delete newAnswers[currentQuestionIndex];
                                setUserAnswers(newAnswers);
                              }}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                (answerModes[currentQuestionIndex] || 'options') === 'options'
                                  ? 'bg-blue-600 text-white shadow-md'
                                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                              }`}
                            >
                              Valitse vaihtoehdoista
                            </button>
                            <button
                              onClick={() => {
                                setAnswerModes(prev => ({ ...prev, [currentQuestionIndex]: 'text' }));
                                // Clear option answer when switching to text
                                const newAnswers = { ...userAnswers };
                                delete newAnswers[currentQuestionIndex];
                                setUserAnswers(newAnswers);
                              }}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                answerModes[currentQuestionIndex] === 'text'
                                  ? 'bg-blue-600 text-white shadow-md'
                                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                              }`}
                            >
                              Kirjoita oma vastaus
                            </button>
                          </div>
                          
                          <div className="bg-white p-5 rounded-lg border border-amber-200 mb-6">
                            <p className="font-semibold text-slate-900 mb-6 text-lg">
                              {aiQuestions[currentQuestionIndex].question}
                            </p>
                            
                            {(answerModes[currentQuestionIndex] || 'options') === 'text' ? (
                              /* Text input mode */
                              <div className="space-y-3">
                                <textarea
                                  value={textAnswers[currentQuestionIndex] || ''}
                                  onChange={(e) => {
                                    setTextAnswers(prev => ({ ...prev, [currentQuestionIndex]: e.target.value }));
                                    // Mark as answered if text is not empty
                                    if (e.target.value.trim()) {
                                      setUserAnswers(prev => ({ ...prev, [currentQuestionIndex]: 'text' }));
                                    } else {
                                      const newAnswers = { ...userAnswers };
                                      delete newAnswers[currentQuestionIndex];
                                      setUserAnswers(newAnswers);
                                    }
                                  }}
                                  placeholder="Kirjoita vastauksesi tähän..."
                                  className="w-full p-4 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none min-h-[120px] text-slate-900"
                                  rows={4}
                                />
                                <p className="text-xs text-slate-500">
                                  Voit kirjoittaa vapaasti vastauksen kysymykseen.
                                </p>
                              </div>
                            ) : (
                              /* Options mode */
                              <div className="space-y-3">
                              {/* Option A */}
                              <button
                                onClick={() => {
                                  setUserAnswers(prev => ({ ...prev, [currentQuestionIndex]: 'a' }));
                                  // Auto-advance to next question after a short delay
                                  setTimeout(() => {
                                    if (currentQuestionIndex < aiQuestions.length - 1) {
                                      setCurrentQuestionIndex(prev => prev + 1);
                                    }
                                  }, 300);
                                }}
                                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                  userAnswers[currentQuestionIndex] === 'a'
                                    ? 'bg-blue-500 border-blue-600 text-white shadow-md'
                                    : 'bg-slate-50 border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-900'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className={`font-bold text-lg ${userAnswers[currentQuestionIndex] === 'a' ? 'text-white' : 'text-blue-600'}`}>
                                    A
                                  </span>
                                  <span className="flex-1">{aiQuestions[currentQuestionIndex].options.a}</span>
                                  {userAnswers[currentQuestionIndex] === 'a' && (
                                    <CheckCircle size={20} className="text-white" />
                                  )}
                                </div>
                              </button>

                              {/* Option B */}
                              <button
                                onClick={() => {
                                  setUserAnswers(prev => ({ ...prev, [currentQuestionIndex]: 'b' }));
                                  setTimeout(() => {
                                    if (currentQuestionIndex < aiQuestions.length - 1) {
                                      setCurrentQuestionIndex(prev => prev + 1);
                                    }
                                  }, 300);
                                }}
                                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                  userAnswers[currentQuestionIndex] === 'b'
                                    ? 'bg-blue-500 border-blue-600 text-white shadow-md'
                                    : 'bg-slate-50 border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-900'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className={`font-bold text-lg ${userAnswers[currentQuestionIndex] === 'b' ? 'text-white' : 'text-blue-600'}`}>
                                    B
                                  </span>
                                  <span className="flex-1">{aiQuestions[currentQuestionIndex].options.b}</span>
                                  {userAnswers[currentQuestionIndex] === 'b' && (
                                    <CheckCircle size={20} className="text-white" />
                                  )}
                                </div>
                              </button>

                              {/* Option C */}
                              <button
                                onClick={() => {
                                  setUserAnswers(prev => ({ ...prev, [currentQuestionIndex]: 'c' }));
                                  setTimeout(() => {
                                    if (currentQuestionIndex < aiQuestions.length - 1) {
                                      setCurrentQuestionIndex(prev => prev + 1);
                                    }
                                  }, 300);
                                }}
                                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                  userAnswers[currentQuestionIndex] === 'c'
                                    ? 'bg-blue-500 border-blue-600 text-white shadow-md'
                                    : 'bg-slate-50 border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-900'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className={`font-bold text-lg ${userAnswers[currentQuestionIndex] === 'c' ? 'text-white' : 'text-blue-600'}`}>
                                    C
                                  </span>
                                  <span className="flex-1">{aiQuestions[currentQuestionIndex].options.c}</span>
                                  {userAnswers[currentQuestionIndex] === 'c' && (
                                    <CheckCircle size={20} className="text-white" />
                                  )}
                                </div>
                              </button>
                            </div>

                            )}
                            
                            {/* Navigation buttons */}
                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-amber-200">
                              <button
                                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                disabled={currentQuestionIndex === 0}
                                className="px-4 py-2 text-sm font-medium text-amber-700 bg-white border border-amber-300 rounded-lg hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                              >
                                ← Edellinen
                              </button>
                              
                              <span className="text-sm text-amber-700">
                                {Object.keys(userAnswers).length} / {aiQuestions.length} vastattu
                              </span>
                              
                              <button
                                onClick={() => {
                                  if (currentQuestionIndex < aiQuestions.length - 1) {
                                    setCurrentQuestionIndex(prev => prev + 1);
                                  }
                                }}
                                disabled={currentQuestionIndex >= aiQuestions.length - 1}
                                className="px-4 py-2 text-sm font-medium text-amber-700 bg-white border border-amber-300 rounded-lg hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                              >
                                Seuraava →
                              </button>
                            </div>
                          </div>

                          {/* Analyze button - show when all questions answered */}
                          {Object.keys(userAnswers).length === aiQuestions.length && (
                            <button
                              onClick={() => {
                                // Analysoi uudelleen käyttäjän vastausten kanssa
                                analyzeDocuments();
                              }}
                              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
                            >
                              <Sparkles size={18} /> Analysoi uudelleen vastausten kanssa
                            </button>
                          )}
                        </div>
                      )}
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
                  <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                          <Layers className="text-orange-500" /> Aukot
                      </h3>
                      <button
                          onClick={() => {
                              const newOpening: Opening = {
                                  id: Date.now().toString(),
                                  type: 'window',
                                  quantity: 1,
                                  area: 1.0,
                                  description: ''
                              };
                              setOpenings([...openings, newOpening]);
                          }}
                          className="text-xs font-bold text-hieta-blue hover:text-hieta-blue/80 flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                          <Plus size={14} /> Lisää aukko
                      </button>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                      {openings.map((opening, index) => (
                          <div key={opening.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                              <div className="grid grid-cols-12 gap-3 items-end">
                                  <div className="col-span-12 sm:col-span-3">
                                      <label className={labelClass}>Tyyppi</label>
                                      <select
                                          className={inputClass}
                                          value={opening.type}
                                          onChange={(e) => {
                                              const updated = [...openings];
                                              updated[index].type = e.target.value as 'window' | 'door' | 'other';
                                              setOpenings(updated);
                                          }}
                                      >
                                          <option value="window">Ikkuna</option>
                                          <option value="door">Ovi</option>
                                          <option value="other">Muu</option>
                                      </select>
                                  </div>
                                  <div className="col-span-6 sm:col-span-2">
                                      <label className={labelClass}>Määrä (kpl)</label>
                                      <input
                                          type="number"
                                          min="1"
                                          step="1"
                                          className={inputClass}
                                          value={opening.quantity}
                                          onChange={(e) => {
                                              const updated = [...openings];
                                              updated[index].quantity = Number(e.target.value);
                                              setOpenings(updated);
                                          }}
                                      />
                                  </div>
                                  <div className="col-span-6 sm:col-span-3">
                                      <label className={labelClass}>Ala per kpl (m²)</label>
                                      <input
                                          type="number"
                                          min="0"
                                          step="0.1"
                                          className={inputClass}
                                          value={opening.area}
                                          onChange={(e) => {
                                              const updated = [...openings];
                                              updated[index].area = Number(e.target.value);
                                              setOpenings(updated);
                                          }}
                                      />
                                  </div>
                                  <div className="col-span-12 sm:col-span-3">
                                      <label className={labelClass}>Yhteensä (m²)</label>
                                      <div className="px-4 py-3 bg-slate-100 border border-slate-300 rounded-lg font-bold text-slate-900">
                                          {(opening.area * opening.quantity).toFixed(1)} m²
                                      </div>
                                  </div>
                                  <div className="col-span-12 sm:col-span-1 flex justify-end">
                                      <button
                                          onClick={() => {
                                              if (openings.length > 1) {
                                                  setOpenings(openings.filter((_, i) => i !== index));
                                              } else {
                                                  alert('Vähintään yksi aukko vaaditaan.');
                                              }
                                          }}
                                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                          title="Poista aukko"
                                      >
                                          <X size={18} />
                                      </button>
                                  </div>
                              </div>
                              {opening.description && (
                                  <div className="mt-2">
                                      <label className={labelClass}>Kuvaus (valinnainen)</label>
                                      <input
                                          type="text"
                                          className={inputClass}
                                          value={opening.description}
                                          onChange={(e) => {
                                              const updated = [...openings];
                                              updated[index].description = e.target.value;
                                              setOpenings(updated);
                                          }}
                                          placeholder="esim. Parvekeovi, Päätyikkuna..."
                                      />
                                  </div>
                              )}
                          </div>
                      ))}
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-600 font-medium">Aukkoja yhteensä:</span>
                          <span className="font-bold text-slate-900">{totalOpeningCount} kpl</span>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-1">
                          <span className="text-slate-600 font-medium">Aukkojen ala yhteensä:</span>
                          <span className="font-bold text-hieta-blue">{totalOpeningArea.toFixed(1)} m²</span>
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
                      <div className="text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">Arvioidut tarvikkeet (valitse siirrettävät)</div>
                      <div className="space-y-3">
                         <label className="flex items-center justify-between text-sm cursor-pointer hover:bg-slate-700/50 p-2 rounded-lg transition-colors group">
                             <div className="flex items-center gap-3">
                                 <input
                                     type="checkbox"
                                     checked={selectedItems.wallElements}
                                     onChange={(e) => setSelectedItems({ ...selectedItems, wallElements: e.target.checked })}
                                     className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-hieta-blue focus:ring-2 focus:ring-hieta-blue/50 focus:ring-offset-2 focus:ring-offset-slate-800 cursor-pointer"
                                 />
                                 <div className="flex items-center gap-2 text-slate-300 group-hover:text-white">
                                    <Box size={16} className="text-hieta-blue"/> 
                                    <span className="font-medium">Seinäelementit</span>
                                 </div>
                             </div>
                             <span className="font-bold text-white">~{Math.ceil(perimeter / 3.0)} kpl</span>
                         </label>
                      </div>
                      {!selectedItems.wallElements && (
                          <div className="mt-3 text-xs text-amber-400 flex items-center gap-1">
                              <AlertCircle size={12} />
                              Valitse vähintään yksi tuote
                          </div>
                      )}
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
