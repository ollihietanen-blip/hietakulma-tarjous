import React, { useState, useRef, useEffect } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import Breadcrumb from '../Layout/Breadcrumb';
import { ArrowRight, Ruler, Home, Box, Layers, PenTool, CheckCircle, Upload, FileText, X, Sparkles, Loader2, AlertCircle, Plus, Calculator, Building2, DollarSign } from 'lucide-react';
import { useAction } from 'convex/react';
import { isConvexConfigured } from '../../lib/convexClient';

// Conditional import for Convex API (handles missing generated files in build)
// @ts-ignore - Generated file may not exist in build
import { api } from '../../convex/_generated/api.js';

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

// Sähköinen määrälaskentalomake - uudet tyypit
interface ElementOpening {
  id: string;
  type: 'ikkuna' | 'ovi' | 'muu';
  quantity: number;
  area: number; // m² per kpl
  description?: string;
}

interface ElementBeam {
  id: string;
  dimensions: string; // esim. "90x90", "115x115"
  quantity: number;
  description?: string;
}

interface QuantityElement {
  id: string;
  elementType: string; // esim. "US-198", "US-148"
  elementCount: number; // ELEMENTTIEN MÄÄRÄ
  packages: number; // PAKETIT
  openings: ElementOpening[];
  beams: ElementBeam[];
  description?: string;
}

interface NettoWallAreas {
  usSuora: number; // m²
  usVino: number; // m²
  varasto: number; // m²
  valiseinat: number; // m²
  hvs: number; // m²
}

interface StructuralParts {
  raystaselementit: { quantity: number; unit: 'jm' | 'kpl' };
  villanpidatyslevy: number; // m²
  sivuraystat: number; // jm
  panelointi: number; // m²
  panelointiPaadyt: number; // m²
  maalaus: number; // m²
  katonNelio: number; // m²
  terassit: number; // m²
  nurkkalaudatJaSaumat: number; // jm
  sisanurkat: number; // €/KPL
  ristikot: number; // kpl
  palokatkot: { quantity: number; unit: 'jm' | 'kpl' };
  paadyt: number; // kpl
  pilarit: {
    pilarit90x90: number; // kpl
    pilarit115x115: number; // kpl
    pilarit140x140: number; // kpl
  };
}

interface SpecialProducts {
  palkit: Array<{ id: string; dimensions: string; quantity: number }>;
  ylapohja: {
    puhallusvilla: number; // m²
    levyvilla100mm: number; // m²
    hoyrynsulku: number; // m²
    koolaus: number; // m²
    mdfLevyKipsilevy: number; // m²
  };
  valiseina: {
    alaJaYlapuu: number; // jm (42x66)
    kpTolppa: number; // kpl (39x66)
    eriste50mm: number; // m²
    kipsilevy: number; // m²
  };
  rahti: number; // €
}

interface Pricing {
  asennus: number; // €
  elementMaalaus: number; // €
  ristikot: number; // €
  suunnittelu: number; // €
  tukityot: number; // €
}

const ElementCalculatorView: React.FC<ElementCalculatorViewProps> = ({ onComplete }) => {
  const { addElement, quotation, saveQuotation } = useQuotation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Safely get the action - ensure api and nested properties exist
  const generateWithImagesAction = (api && api.gemini && api.gemini.generateWithImages) ? api.gemini.generateWithImages : undefined;
  const generateWithImages = useAction(generateWithImagesAction);
  
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

  // Sähköinen määrälaskentalomake - state-tilat
  const [showElectricForm, setShowElectricForm] = useState(false); // Näytetäänkö sähköinen lomake
  const [basicInfo, setBasicInfo] = useState({
    customer: '',
    address: '',
    hvs: 0,
    us1: 0,
    us2: 0,
    us3: 0,
    total: 0,
    area: '' // Piiri
  });

  // Elementit (dynaamiset)
  const [quantityElements, setQuantityElements] = useState<QuantityElement[]>([
    {
      id: '1',
      elementType: 'US-198',
      elementCount: 1,
      packages: 1,
      openings: [],
      beams: [],
      description: ''
    }
  ]);

  // Netto seinäneliöt
  const [nettoWallAreas, setNettoWallAreas] = useState<NettoWallAreas>({
    usSuora: 0,
    usVino: 0,
    varasto: 0,
    valiseinat: 0,
    hvs: 0
  });

  // Rakenneosat
  const [structuralParts, setStructuralParts] = useState<StructuralParts>({
    raystaselementit: { quantity: 0, unit: 'jm' },
    villanpidatyslevy: 0,
    sivuraystat: 0,
    panelointi: 0,
    panelointiPaadyt: 0,
    maalaus: 0,
    katonNelio: 0,
    terassit: 0,
    nurkkalaudatJaSaumat: 0,
    sisanurkat: 0,
    ristikot: 0,
    palokatkot: { quantity: 0, unit: 'jm' },
    paadyt: 0,
    pilarit: {
      pilarit90x90: 0,
      pilarit115x115: 0,
      pilarit140x140: 0
    }
  });

  // Erityistuotteet
  const [specialProducts, setSpecialProducts] = useState<SpecialProducts>({
    palkit: [],
    ylapohja: {
      puhallusvilla: 0,
      levyvilla100mm: 0,
      hoyrynsulku: 0,
      koolaus: 0,
      mdfLevyKipsilevy: 0
    },
    valiseina: {
      alaJaYlapuu: 0,
      kpTolppa: 0,
      eriste50mm: 0,
      kipsilevy: 0
    },
    rahti: 0
  });

  // Hintalaskenta
  const [pricing, setPricing] = useState<Pricing>({
    asennus: 0,
    elementMaalaus: 0,
    ristikot: 0,
    suunnittelu: 0,
    tukityot: 0
  });

  // Keskiarvoinen aukko-koko (käytetään AUKOT YHTEENSÄ laskennassa)
  const AVERAGE_OPENING_SIZE = 1.5; // m²

  // Calculations - Vanha lomake
  const perimeter = (dims.width + dims.length) * 2;
  const wallAreaGross = perimeter * dims.height * dims.floors;
  const totalOpeningArea = openings.reduce((sum, opening) => sum + (opening.area * opening.quantity), 0);
  const wallAreaNet = wallAreaGross - totalOpeningArea;
  const floorArea = dims.width * dims.length * dims.floors;
  const totalOpeningCount = openings.reduce((sum, opening) => sum + opening.quantity, 0);

  // Calculations - Sähköinen lomake
  // Pääelementit - automaattiset laskennat
  const calculateElementsBrutto = (element: QuantityElement) => {
    return element.elementCount * element.packages;
  };

  const calculateTotalElementsBrutto = () => {
    return quantityElements.reduce((sum, el) => sum + calculateElementsBrutto(el), 0);
  };

  // Aukot yhteensä per elementti
  const calculateElementOpeningsTotal = (element: QuantityElement) => {
    const openingsArea = element.openings.reduce((sum, o) => sum + (o.area * o.quantity), 0);
    const windowsCount = element.openings.filter(o => o.type === 'ikkuna').reduce((sum, o) => sum + o.quantity, 0);
    const doorsCount = element.openings.filter(o => o.type === 'ovi').reduce((sum, o) => sum + o.quantity, 0);
    const averageOpeningArea = (windowsCount + doorsCount) * AVERAGE_OPENING_SIZE;
    return openingsArea + averageOpeningArea;
  };

  // Netto seinäneliöt yhteensä
  const calculateNettoWallAreasTotal = () => {
    const total = nettoWallAreas.usSuora + nettoWallAreas.usVino + nettoWallAreas.varasto + 
                  nettoWallAreas.valiseinat + nettoWallAreas.hvs;
    const totalOpeningsArea = quantityElements.reduce((sum, el) => sum + calculateElementOpeningsTotal(el), 0);
    return Math.max(0, total - totalOpeningsArea);
  };

  // Hintalaskenta - yhteensä
  const calculateTotalPrice = () => {
    return pricing.asennus + pricing.elementMaalaus + pricing.ristikot + pricing.suunnittelu + pricing.tukityot;
  };

  // File handling
  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) {
      console.warn('No files provided to handleFileSelect');
      return;
    }
    
    const validFiles: UploadedDocument[] = [];
    
    Array.from(files).forEach(file => {
      // Check if file is valid image (Claude API supports only images)
      const isImage = file.type.startsWith('image/');
      const supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const isValidImage = isImage && (supportedTypes.includes(file.type) || file.type === 'image/*');
      
      if (isValidImage) {
        const doc: UploadedDocument = {
          id: `doc-${Date.now()}-${Math.random()}`,
          file,
          category: 'muu',
          preview: URL.createObjectURL(file)
        };
        validFiles.push(doc);
      } else {
        console.warn(`File rejected: ${file.name} (type: ${file.type})`);
        if (file.name.match(/\.pdf$/i)) {
          alert(`PDF-tiedosto ${file.name} ei ole tuettu Claude API:n kautta. Muunna PDF kuvaksi (PNG/JPG) ennen lataamista.`);
        } else {
          alert(`Tiedosto ${file.name} ei ole tuettu. Tuetut muodot: PNG, JPG, GIF, WebP`);
        }
      }
    });
    
    if (validFiles.length > 0) {
      setUploadedDocs(prev => [...prev, ...validFiles]);
      console.log(`Added ${validFiles.length} file(s) to uploadedDocs`);
    }
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
      // Claude Sonnet supports only images: PNG, JPG, GIF, WebP
      // PDF files are not supported via image API - they need to be converted to images first
      const imagePromises = uploadedDocs
        .filter(doc => {
          // Only process actual image files
          const isImage = doc.file.type.startsWith('image/');
          if (!isImage) {
            console.warn(`Tiedosto ${doc.file.name} (${doc.file.type}) ei ole kuvatiedosto. Claude API tukee vain kuvatiedostoja (PNG, JPG, GIF, WebP).`);
          }
          return isImage;
        })
        .slice(0, 3) // Claude supports max 3 images per request
        .map(doc => {
          return new Promise<{ mimeType: string; base64Data: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const base64 = (reader.result as string).split(',')[1];
              // Ensure we have a valid image MIME type
              const mimeType = doc.file.type || 'image/png';
              // Validate MIME type is supported by Claude
              const supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
              if (!supportedTypes.includes(mimeType)) {
                reject(new Error(`Kuvatiedostomuoto ${mimeType} ei ole tuettu. Tuetut muodot: PNG, JPG, GIF, WebP`));
                return;
              }
              resolve({
                mimeType: mimeType,
                base64Data: base64
              });
            };
            reader.onerror = reject;
            reader.readAsDataURL(doc.file);
          });
        });

      if (imagePromises.length === 0) {
        const hasPDFs = uploadedDocs.some(doc => doc.file.name.match(/\.pdf$/i));
        if (hasPDFs) {
          alert('PDF-tiedostot eivät ole tuettuja Claude API:n kautta. Muunna PDF-tiedostot kuviksi (PNG/JPG) ennen analysointia.');
        } else {
          alert('Ei analysoitavia kuvatiedostoja. Lataa kuvatiedostoja (PNG, JPG, GIF, WebP).');
        }
        setIsAnalyzing(false);
        return;
      }

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

**TÄRKEÄÄ: Palauta VAIN JSON-objekti, ei mitään muuta tekstiä. Älä lisää selityksiä, kommentteja tai muuta tekstiä JSON-objektin ympärille.**

**JSON-SYNTAKSI: Varmista että JSON on syntaktisesti oikein:**
- Jokainen avaava aaltosulje { tarvitsee vastaavan sulkevan aaltosulkeen }
- Jokainen avaava hakasulje [ tarvitsee vastaavan sulkevan hakasulkeen ]
- Käytä pilkkua (,) elementtien välissä, mutta EI viimeisen elementin jälkeen
- Käytä lainausmerkkejä ("") avainten ja merkkijonojen ympärillä

Palauta vastaus JSON-muodossa seuraavalla rakenteella (HUOM: älä duplikaa aaltosulkeita):
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

**TÄRKEÄÄ - KYSYMYKSET:**
Kysy kysymyksiä VAIN jos ne vaikuttavat suoraan määrälaskentaan tai tarjouksen laskemiseen. Älä kysy:
- Yleisiä kysymyksiä rakennuksen käyttötarkoituksesta (jos se ei vaikuta elementtityyppeihin)
- Kysymyksiä, jotka eivät vaikuta elementtien määriin, kokoihin tai tyyppeihin
- Kysymyksiä, jotka eivät vaikuta hinnoitteluun

Kysy kysymyksiä VAIN jos ne liittyvät:
- Elementtien määriin (esim. "Kuinka monta kerrosta rakennuksessa on?")
- Elementtien kokoihin (esim. "Mikä on rakennuksen korkeus?")
- Elementtien tyyppeihin (esim. "Käytetäänkö erityistä eristysratkaisua?")
- Ristikoiden jännevälien tai tyyppien määrittämiseen
- Aukkojen määriin tai kokoihin, jotka vaikuttavat elementtien laskentaan

Jos tarvitset lisätietoja tarkempaa määrälaskentaa varten, lisää 1-3 kysymystä "questions"-kenttään. 
Kussakin kysymyksessä anna 3 vaihtoehtoa (a, b, c). 
Jos sinulla on tarpeeksi tietoa analysoida piirustukset ja laskea määrät, jätä "questions" tyhjäksi taulukoksi.

Ole tarkka mitoissa ja anna realistisia määriä.

**MUISTA: Palauta VAIN JSON-objekti, aloita vastauksesi { -merkillä ja päätä } -merkillä. Älä lisää mitään tekstiä JSON-objektin ympärille.**`;

      // Call Claude API via Convex (server-side, secure)
      if (!generateWithImages) {
        throw new Error('Convex ei ole konfiguroitu. Tarkista että VITE_CONVEX_URL on asetettu .env.local tiedostossa.');
      }

      const apiResult = await generateWithImages({
        prompt: prompt,
        images: imageData
      });

      const text = apiResult.text;

      // Parse JSON from response (might be wrapped in markdown or have extra text)
      let jsonText = text.trim();
      
      console.log('Raw AI response:', jsonText.substring(0, 500));
      
      // First, try to extract JSON from markdown code blocks
      const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1].trim();
        console.log('Extracted from code block');
      }
      
      // Remove markdown headers (lines starting with #)
      jsonText = jsonText.split('\n')
        .filter(line => !line.trim().startsWith('#'))
        .join('\n');
      
      // Remove any text before the first { and after the last }
      // This handles cases where AI adds explanatory text
      const firstBrace = jsonText.indexOf('{');
      const lastBrace = jsonText.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        // Extract only the JSON object part
        jsonText = jsonText.substring(firstBrace, lastBrace + 1);
        console.log('Extracted JSON object');
      } else {
        // If no braces found, try to find JSON array or other structures
        // But for now, we expect an object
        console.warn('No JSON object boundaries found, trying full text');
      }
      
      // Remove any leading/trailing quotes that might cause issues
      jsonText = jsonText.trim();
      if (jsonText.startsWith("'") && jsonText.endsWith("'")) {
        jsonText = jsonText.slice(1, -1);
      }
      if (jsonText.startsWith('"') && jsonText.endsWith('"')) {
        jsonText = jsonText.slice(1, -1);
      }
      
      // Final cleanup - remove any remaining non-JSON content
      jsonText = jsonText.trim();
      
      // Validate that we have something that looks like JSON
      if (!jsonText.startsWith('{') || !jsonText.endsWith('}')) {
        // Try one more time to find JSON in the original text
        const jsonObjectMatch = text.match(/\{[\s\S]*\}/);
        if (jsonObjectMatch) {
          jsonText = jsonObjectMatch[0];
          console.log('Found JSON using regex match');
        } else {
          throw new Error(`AI-vastaus ei sisällä kelvollista JSON-objektia. Vastaus alkaa: "${text.substring(0, 200)}..."`);
        }
      }

      // Try to fix common JSON errors before parsing
      const fixCommonJSONErrors = (json: string): string => {
        let fixed = json;
        
        // Fix double opening braces: {{ -> {
        fixed = fixed.replace(/\{\s*\{/g, '{');
        
        // Fix double closing braces: }} -> }
        fixed = fixed.replace(/\}\s*\}/g, '}');
        
        // Fix cases where there's an extra { after array opening [
        // Pattern: [\s\n]*{\s*\n\s*{ -> [\s\n]*{
        fixed = fixed.replace(/\[\s*\n\s*\{\s*\n\s*\{/g, '[\n    {');
        fixed = fixed.replace(/\[\s*\{\s*\{/g, '[{');
        
        // Fix missing commas between array elements
        // Pattern: }\s*\n\s*{ (in array context) -> },\n    {
        fixed = fixed.replace(/\}\s*\n\s*\{/g, '},\n    {');
        
        // Remove trailing commas before closing brackets/braces
        fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
        
        return fixed;
      };

      let analysisResult: AIAnalysisResult;
      try {
        console.log('Attempting to parse JSON:', jsonText.substring(0, 200));
        analysisResult = JSON.parse(jsonText);
        console.log('JSON parsed successfully');
      } catch (parseError) {
        // Try to fix common JSON errors
        console.log('Initial parse failed, attempting to fix common errors...');
        let fixedJson = fixCommonJSONErrors(jsonText);
        
        try {
          console.log('Retrying with fixed JSON');
          analysisResult = JSON.parse(fixedJson);
          console.log('JSON parsed successfully after fixing');
        } catch (fixError) {
          // If fixing didn't work, try to extract JSON more aggressively
          const jsonObjectMatch = text.match(/\{[\s\S]*\}/);
          if (jsonObjectMatch) {
            try {
              console.log('Retrying with regex-extracted JSON');
              let extractedJson = jsonObjectMatch[0];
              extractedJson = fixCommonJSONErrors(extractedJson);
              analysisResult = JSON.parse(extractedJson);
              console.log('JSON parsed successfully from extracted text');
            } catch (retryError) {
              console.error('JSON parse error:', parseError);
              console.error('Fix attempt error:', fixError);
              console.error('Full response:', text);
              throw new Error(`JSON-parsinta epäonnistui: ${parseError instanceof Error ? parseError.message : 'Tuntematon virhe'}. Vastaus alkaa: "${text.substring(0, 300)}..."`);
            }
          } else {
            console.error('JSON parse error:', parseError);
            console.error('Fix attempt error:', fixError);
            console.error('Full response:', text);
            throw new Error(`JSON-parsinta epäonnistui: ${parseError instanceof Error ? parseError.message : 'Tuntematon virhe'}. Vastaus alkaa: "${text.substring(0, 300)}..."`);
          }
        }
      }

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

  // Sähköinen lomake - elementtien hallinta
  const addQuantityElement = () => {
    const newElement: QuantityElement = {
      id: Date.now().toString(),
      elementType: 'US-198',
      elementCount: 1,
      packages: 1,
      openings: [],
      beams: [],
      description: ''
    };
    setQuantityElements([...quantityElements, newElement]);
  };

  const removeQuantityElement = (id: string) => {
    if (quantityElements.length > 1) {
      setQuantityElements(quantityElements.filter(el => el.id !== id));
    } else {
      alert('Vähintään yksi elementti vaaditaan.');
    }
  };

  const updateQuantityElement = (id: string, updates: Partial<QuantityElement>) => {
    setQuantityElements(quantityElements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  // Aukkojen hallinta elementtiin
  const addOpeningToElement = (elementId: string) => {
    const newOpening: ElementOpening = {
      id: Date.now().toString(),
      type: 'ikkuna',
      quantity: 1,
      area: 1.5,
      description: ''
    };
    updateQuantityElement(elementId, {
      openings: [...quantityElements.find(el => el.id === elementId)!.openings, newOpening]
    });
  };

  const removeOpeningFromElement = (elementId: string, openingId: string) => {
    const element = quantityElements.find(el => el.id === elementId);
    if (element) {
      updateQuantityElement(elementId, {
        openings: element.openings.filter(o => o.id !== openingId)
      });
    }
  };

  const updateOpeningInElement = (elementId: string, openingId: string, updates: Partial<ElementOpening>) => {
    const element = quantityElements.find(el => el.id === elementId);
    if (element) {
      updateQuantityElement(elementId, {
        openings: element.openings.map(o => 
          o.id === openingId ? { ...o, ...updates } : o
        )
      });
    }
  };

  // Palkkien hallinta elementtiin
  const addBeamToElement = (elementId: string) => {
    const newBeam: ElementBeam = {
      id: Date.now().toString(),
      dimensions: '90x90',
      quantity: 1,
      description: ''
    };
    updateQuantityElement(elementId, {
      beams: [...quantityElements.find(el => el.id === elementId)!.beams, newBeam]
    });
  };

  const removeBeamFromElement = (elementId: string, beamId: string) => {
    const element = quantityElements.find(el => el.id === elementId);
    if (element) {
      updateQuantityElement(elementId, {
        beams: element.beams.filter(b => b.id !== beamId)
      });
    }
  };

  const updateBeamInElement = (elementId: string, beamId: string, updates: Partial<ElementBeam>) => {
    const element = quantityElements.find(el => el.id === elementId);
    if (element) {
      updateQuantityElement(elementId, {
        beams: element.beams.map(b => 
          b.id === beamId ? { ...b, ...updates } : b
        )
      });
    }
  };

  // Palkkien hallinta erityistuotteisiin
  const addSpecialBeam = () => {
    const newBeam = {
      id: Date.now().toString(),
      dimensions: '90x90',
      quantity: 1
    };
    setSpecialProducts({
      ...specialProducts,
      palkit: [...specialProducts.palkit, newBeam]
    });
  };

  const removeSpecialBeam = (id: string) => {
    setSpecialProducts({
      ...specialProducts,
      palkit: specialProducts.palkit.filter(b => b.id !== id)
    });
  };

  // Tallenna sähköinen lomake tarjoukseen
  const handleSaveElectricForm = () => {
    // Lisää elementit tarjoukseen
    quantityElements.forEach(element => {
      const brutto = calculateElementsBrutto(element);
      const openingsArea = calculateElementOpeningsTotal(element);
      
      addElement('section-ext-walls', {
        type: `Ulkoseinä ${element.elementType} (Sähköinen lomake)`,
        description: element.description || `Elementtejä: ${element.elementCount}, Paketteja: ${element.packages}, Brutto: ${brutto}, Aukkoja: ${openingsArea.toFixed(1)}m²`,
        specifications: {
          elementType: element.elementType,
          elementCount: `${element.elementCount}`,
          packages: `${element.packages}`,
        },
        quantity: brutto,
        unit: 'kpl',
        unitPrice: 450,
        netArea: 0,
        hasWindowInstall: element.openings.length > 0,
        windowCount: element.openings.reduce((sum, o) => sum + o.quantity, 0),
        windowInstallPrice: 45
      });
    });

    // Lisää hintalaskenta
    const totalPrice = calculateTotalPrice();
    if (totalPrice > 0) {
      // Tallenna hintatiedot quotationiin (voi vaatia QuotationContextin laajennusta)
      alert(`Sähköinen lomake tallennettu! Yhteishinta: ${totalPrice.toFixed(2)} €`);
    } else {
      alert('Elementit lisätty tarjoukseen!');
    }

    onComplete();
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-3">
                <Box className="text-hieta-blue" /> Puuelementtilaskenta
            </h1>
            <p className="text-slate-500 mt-2 max-w-2xl">
                Syötä rakennuksen päämitat tai lataa piirustukset AI-analysoitavaksi. Järjestelmä laskee arvion seinäelementtien menekistä ja lisää ne tarjoukseen.
            </p>
          </div>
          <button
            onClick={() => setShowElectricForm(!showElectricForm)}
            className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
              showElectricForm
                ? 'bg-hieta-blue text-white hover:bg-hieta-blue/90'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            <Calculator size={18} />
            {showElectricForm ? 'Palaa perusnäkymään' : 'Sähköinen määrälaskentalomake'}
          </button>
        </div>
      </div>

      {/* Sähköinen määrälaskentalomake */}
      {showElectricForm ? (
        <div className="space-y-6">
          {/* 1. Perustiedot */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 card-shadow">
            <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="text-blue-600" /> Perustiedot
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Asiakas</label>
                <input
                  type="text"
                  className={inputClass}
                  value={basicInfo.customer}
                  onChange={e => setBasicInfo({ ...basicInfo, customer: e.target.value })}
                  placeholder="Asiakkaan nimi"
                />
              </div>
              <div>
                <label className={labelClass}>Osoite</label>
                <input
                  type="text"
                  className={inputClass}
                  value={basicInfo.address}
                  onChange={e => setBasicInfo({ ...basicInfo, address: e.target.value })}
                  placeholder="Osoite"
                />
              </div>
              <div>
                <label className={labelClass}>Piiri</label>
                <input
                  type="text"
                  className={inputClass}
                  value={basicInfo.area}
                  onChange={e => setBasicInfo({ ...basicInfo, area: e.target.value })}
                  placeholder="esim. rakennuksen osa/sijainti"
                />
              </div>
              <div className="grid grid-cols-5 gap-2">
                <div>
                  <label className={labelClass}>HVS (€)</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={basicInfo.hvs}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setBasicInfo({
                        ...basicInfo,
                        hvs: val,
                        total: val + basicInfo.us1 + basicInfo.us2 + basicInfo.us3
                      });
                    }}
                  />
                </div>
                <div>
                  <label className={labelClass}>US1 (€)</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={basicInfo.us1}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setBasicInfo({
                        ...basicInfo,
                        us1: val,
                        total: basicInfo.hvs + val + basicInfo.us2 + basicInfo.us3
                      });
                    }}
                  />
                </div>
                <div>
                  <label className={labelClass}>US2 (€)</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={basicInfo.us2}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setBasicInfo({
                        ...basicInfo,
                        us2: val,
                        total: basicInfo.hvs + basicInfo.us1 + val + basicInfo.us3
                      });
                    }}
                  />
                </div>
                <div>
                  <label className={labelClass}>US3 (€)</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={basicInfo.us3}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setBasicInfo({
                        ...basicInfo,
                        us3: val,
                        total: basicInfo.hvs + basicInfo.us1 + basicInfo.us2 + val
                      });
                    }}
                  />
                </div>
                <div>
                  <label className={labelClass}>Yhteensä (€)</label>
                  <div className="px-4 py-3 bg-slate-100 border border-slate-300 rounded-lg font-bold text-slate-900">
                    {basicInfo.total.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Pääelementit */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 card-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Box className="text-purple-600" /> Pääelementit (Automaattinen laskenta)
              </h3>
              <button
                onClick={addQuantityElement}
                className="text-xs font-bold text-hieta-blue hover:text-hieta-blue/80 flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Plus size={14} /> Lisää elementti
              </button>
            </div>

            <div className="space-y-6">
              {quantityElements.map((element, idx) => (
                <div key={element.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-slate-900">Elementti {idx + 1}</h4>
                    {quantityElements.length > 1 && (
                      <button
                        onClick={() => removeQuantityElement(element.id)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className={labelClass}>Elementin tyyppi</label>
                      <select
                        className={inputClass}
                        value={element.elementType}
                        onChange={e => updateQuantityElement(element.id, { elementType: e.target.value })}
                      >
                        <option value="US-198">US-198</option>
                        <option value="US-148">US-148</option>
                        <option value="US-173">US-173</option>
                        <option value="US-223">US-223</option>
                        <option value="HVS">HVS</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>ELEMENTTIEN MÄÄRÄ (kpl)</label>
                      <input
                        type="number"
                        min="1"
                        className={inputClass}
                        value={element.elementCount}
                        onChange={e => updateQuantityElement(element.id, { elementCount: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>PAKETIT (kpl)</label>
                      <input
                        type="number"
                        min="1"
                        className={inputClass}
                        value={element.packages}
                        onChange={e => updateQuantityElement(element.id, { packages: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-700">ELEMENTIT/BRUTTO:</span>
                      <span className="font-bold text-blue-900">{calculateElementsBrutto(element)} kpl</span>
                    </div>
                  </div>

                  {/* Aukot elementille */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-bold text-slate-700">Aukot</label>
                      <button
                        onClick={() => addOpeningToElement(element.id)}
                        className="text-xs text-hieta-blue hover:text-hieta-blue/80 flex items-center gap-1"
                      >
                        <Plus size={12} /> Lisää aukko
                      </button>
                    </div>
                    <div className="space-y-2">
                      {element.openings.map(opening => (
                        <div key={opening.id} className="flex gap-2 items-end">
                          <select
                            className="flex-1 p-2 border border-slate-300 rounded text-sm"
                            value={opening.type}
                            onChange={e => updateOpeningInElement(element.id, opening.id, { type: e.target.value as any })}
                          >
                            <option value="ikkuna">Ikkuna</option>
                            <option value="ovi">Ovi</option>
                            <option value="muu">Muu</option>
                          </select>
                          <input
                            type="number"
                            min="1"
                            placeholder="Määrä"
                            className="w-20 p-2 border border-slate-300 rounded text-sm"
                            value={opening.quantity}
                            onChange={e => updateOpeningInElement(element.id, opening.id, { quantity: Number(e.target.value) })}
                          />
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            placeholder="m²"
                            className="w-24 p-2 border border-slate-300 rounded text-sm"
                            value={opening.area}
                            onChange={e => updateOpeningInElement(element.id, opening.id, { area: Number(e.target.value) })}
                          />
                          <button
                            onClick={() => removeOpeningFromElement(element.id, opening.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                      <div className="p-2 bg-amber-50 rounded border border-amber-200">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-700">AUKOT YHTEENSÄ:</span>
                          <span className="font-bold text-amber-900">{calculateElementOpeningsTotal(element).toFixed(1)} m²</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Palkit elementille */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-bold text-slate-700">Palkit</label>
                      <button
                        onClick={() => addBeamToElement(element.id)}
                        className="text-xs text-hieta-blue hover:text-hieta-blue/80 flex items-center gap-1"
                      >
                        <Plus size={12} /> Lisää palkki
                      </button>
                    </div>
                    <div className="space-y-2">
                      {element.beams.map(beam => (
                        <div key={beam.id} className="flex gap-2 items-end">
                          <input
                            type="text"
                            placeholder="Dimensiot"
                            className="flex-1 p-2 border border-slate-300 rounded text-sm"
                            value={beam.dimensions}
                            onChange={e => updateBeamInElement(element.id, beam.id, { dimensions: e.target.value })}
                          />
                          <input
                            type="number"
                            min="1"
                            placeholder="Määrä"
                            className="w-24 p-2 border border-slate-300 rounded text-sm"
                            value={beam.quantity}
                            onChange={e => updateBeamInElement(element.id, beam.id, { quantity: Number(e.target.value) })}
                          />
                          <button
                            onClick={() => removeBeamFromElement(element.id, beam.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700">ELEMENTIT/BRUTTO YHTEENSÄ:</span>
                  <span className="font-bold text-green-900 text-lg">{calculateTotalElementsBrutto()} kpl</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Netto seinäneliöt */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 card-shadow">
            <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
              <Ruler className="text-green-600" /> Netto seinäneliöt
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>US suora (m²)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className={inputClass}
                  value={nettoWallAreas.usSuora}
                  onChange={e => setNettoWallAreas({ ...nettoWallAreas, usSuora: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className={labelClass}>US vino (m²)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className={inputClass}
                  value={nettoWallAreas.usVino}
                  onChange={e => setNettoWallAreas({ ...nettoWallAreas, usVino: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className={labelClass}>VARASTO (m²)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className={inputClass}
                  value={nettoWallAreas.varasto}
                  onChange={e => setNettoWallAreas({ ...nettoWallAreas, varasto: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className={labelClass}>VÄLISEINÄT (m²)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className={inputClass}
                  value={nettoWallAreas.valiseinat}
                  onChange={e => setNettoWallAreas({ ...nettoWallAreas, valiseinat: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className={labelClass}>HVS (m²)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className={inputClass}
                  value={nettoWallAreas.hvs}
                  onChange={e => setNettoWallAreas({ ...nettoWallAreas, hvs: Number(e.target.value) })}
                />
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700">NETTO SEINÄNELIÖT:</span>
                  <span className="font-bold text-green-900 text-lg">{calculateNettoWallAreasTotal().toFixed(1)} m²</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Rakenneosat */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 card-shadow">
            <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
              <Building2 className="text-orange-600" /> Rakenneosat
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>RÄYSTÄSELEMENTIT ({structuralParts.raystaselementit.unit})</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    className={inputClass}
                    value={structuralParts.raystaselementit.quantity}
                    onChange={e => setStructuralParts({
                      ...structuralParts,
                      raystaselementit: { ...structuralParts.raystaselementit, quantity: Number(e.target.value) }
                    })}
                  />
                  <select
                    className="w-24 p-3 border border-slate-300 rounded-lg"
                    value={structuralParts.raystaselementit.unit}
                    onChange={e => setStructuralParts({
                      ...structuralParts,
                      raystaselementit: { ...structuralParts.raystaselementit, unit: e.target.value as 'jm' | 'kpl' }
                    })}
                  >
                    <option value="jm">jm</option>
                    <option value="kpl">kpl</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>VILLANPIDÄTYSLEVY (m²)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className={inputClass}
                  value={structuralParts.villanpidatyslevy}
                  onChange={e => setStructuralParts({ ...structuralParts, villanpidatyslevy: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className={labelClass}>SIVURÄYSTÄÄT (jm)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className={inputClass}
                  value={structuralParts.sivuraystat}
                  onChange={e => setStructuralParts({ ...structuralParts, sivuraystat: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className={labelClass}>PANELOINTI (m²)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className={inputClass}
                  value={structuralParts.panelointi}
                  onChange={e => setStructuralParts({ ...structuralParts, panelointi: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className={labelClass}>PANELOINTI PÄÄDYT (m²)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className={inputClass}
                  value={structuralParts.panelointiPaadyt}
                  onChange={e => setStructuralParts({ ...structuralParts, panelointiPaadyt: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className={labelClass}>MAALAUS (m²)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className={inputClass}
                  value={structuralParts.maalaus}
                  onChange={e => setStructuralParts({ ...structuralParts, maalaus: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className={labelClass}>KATON NELIÖMÄÄRÄ (m²)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className={inputClass}
                  value={structuralParts.katonNelio}
                  onChange={e => setStructuralParts({ ...structuralParts, katonNelio: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className={labelClass}>TERASSIT (m²)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className={inputClass}
                  value={structuralParts.terassit}
                  onChange={e => setStructuralParts({ ...structuralParts, terassit: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className={labelClass}>NURKKALAUDAT JA SAUMAT (jm)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className={inputClass}
                  value={structuralParts.nurkkalaudatJaSaumat}
                  onChange={e => setStructuralParts({ ...structuralParts, nurkkalaudatJaSaumat: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className={labelClass}>SISÄNURKAT (€/KPL)</label>
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  value={structuralParts.sisanurkat}
                  onChange={e => setStructuralParts({ ...structuralParts, sisanurkat: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className={labelClass}>RISTIKOT (kpl)</label>
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  value={structuralParts.ristikot}
                  onChange={e => setStructuralParts({ ...structuralParts, ristikot: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className={labelClass}>PALOKATKOT ({structuralParts.palokatkot.unit})</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    className={inputClass}
                    value={structuralParts.palokatkot.quantity}
                    onChange={e => setStructuralParts({
                      ...structuralParts,
                      palokatkot: { ...structuralParts.palokatkot, quantity: Number(e.target.value) }
                    })}
                  />
                  <select
                    className="w-24 p-3 border border-slate-300 rounded-lg"
                    value={structuralParts.palokatkot.unit}
                    onChange={e => setStructuralParts({
                      ...structuralParts,
                      palokatkot: { ...structuralParts.palokatkot, unit: e.target.value as 'jm' | 'kpl' }
                    })}
                  >
                    <option value="jm">jm</option>
                    <option value="kpl">kpl</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>PÄÄDYT (kpl)</label>
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  value={structuralParts.paadyt}
                  onChange={e => setStructuralParts({ ...structuralParts, paadyt: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className={labelClass}>PILARIT 90x90 (kpl)</label>
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  value={structuralParts.pilarit.pilarit90x90}
                  onChange={e => setStructuralParts({
                    ...structuralParts,
                    pilarit: { ...structuralParts.pilarit, pilarit90x90: Number(e.target.value) }
                  })}
                />
              </div>
              <div>
                <label className={labelClass}>PILARIT 115x115 (kpl)</label>
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  value={structuralParts.pilarit.pilarit115x115}
                  onChange={e => setStructuralParts({
                    ...structuralParts,
                    pilarit: { ...structuralParts.pilarit, pilarit115x115: Number(e.target.value) }
                  })}
                />
              </div>
              <div>
                <label className={labelClass}>PILARIT 140x140 (kpl)</label>
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  value={structuralParts.pilarit.pilarit140x140}
                  onChange={e => setStructuralParts({
                    ...structuralParts,
                    pilarit: { ...structuralParts.pilarit, pilarit140x140: Number(e.target.value) }
                  })}
                />
              </div>
            </div>
          </div>

          {/* 5. Erityistuotteet */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 card-shadow">
            <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
              <Layers className="text-purple-600" /> Erityistuotteet
            </h3>
            
            {/* Palkit */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-slate-700">PALKIT</label>
                <button
                  onClick={addSpecialBeam}
                  className="text-xs text-hieta-blue hover:text-hieta-blue/80 flex items-center gap-1"
                >
                  <Plus size={12} /> Lisää palkki
                </button>
              </div>
              <div className="space-y-2">
                {specialProducts.palkit.map(beam => (
                  <div key={beam.id} className="flex gap-2 items-end">
                    <input
                      type="text"
                      placeholder="Dimensiot (esim. 90x90)"
                      className="flex-1 p-2 border border-slate-300 rounded text-sm"
                      value={beam.dimensions}
                      onChange={e => setSpecialProducts({
                        ...specialProducts,
                        palkit: specialProducts.palkit.map(b => b.id === beam.id ? { ...b, dimensions: e.target.value } : b)
                      })}
                    />
                    <input
                      type="number"
                      min="1"
                      placeholder="Määrä (kpl)"
                      className="w-24 p-2 border border-slate-300 rounded text-sm"
                      value={beam.quantity}
                      onChange={e => setSpecialProducts({
                        ...specialProducts,
                        palkit: specialProducts.palkit.map(b => b.id === beam.id ? { ...b, quantity: Number(e.target.value) } : b)
                      })}
                    />
                    <button
                      onClick={() => removeSpecialBeam(beam.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Yläpohja */}
            <div className="mb-6 p-4 bg-slate-50 rounded-lg">
              <h4 className="font-bold text-slate-900 mb-3">YLÄPOHJA</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Puhallusvilla (m²)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className={inputClass}
                    value={specialProducts.ylapohja.puhallusvilla}
                    onChange={e => setSpecialProducts({
                      ...specialProducts,
                      ylapohja: { ...specialProducts.ylapohja, puhallusvilla: Number(e.target.value) }
                    })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Levyvilla 100 mm (m²)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className={inputClass}
                    value={specialProducts.ylapohja.levyvilla100mm}
                    onChange={e => setSpecialProducts({
                      ...specialProducts,
                      ylapohja: { ...specialProducts.ylapohja, levyvilla100mm: Number(e.target.value) }
                    })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Höyrynsulku (m²)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className={inputClass}
                    value={specialProducts.ylapohja.hoyrynsulku}
                    onChange={e => setSpecialProducts({
                      ...specialProducts,
                      ylapohja: { ...specialProducts.ylapohja, hoyrynsulku: Number(e.target.value) }
                    })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Koolaus (m²)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className={inputClass}
                    value={specialProducts.ylapohja.koolaus}
                    onChange={e => setSpecialProducts({
                      ...specialProducts,
                      ylapohja: { ...specialProducts.ylapohja, koolaus: Number(e.target.value) }
                    })}
                  />
                </div>
                <div>
                  <label className={labelClass}>MDF-levy / Kipsilevy (m²)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className={inputClass}
                    value={specialProducts.ylapohja.mdfLevyKipsilevy}
                    onChange={e => setSpecialProducts({
                      ...specialProducts,
                      ylapohja: { ...specialProducts.ylapohja, mdfLevyKipsilevy: Number(e.target.value) }
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Väliseinä */}
            <div className="mb-6 p-4 bg-slate-50 rounded-lg">
              <h4 className="font-bold text-slate-900 mb-3">VÄLISEINÄ</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Ala- ja yläpuu 42x66 (jm)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className={inputClass}
                    value={specialProducts.valiseina.alaJaYlapuu}
                    onChange={e => setSpecialProducts({
                      ...specialProducts,
                      valiseina: { ...specialProducts.valiseina, alaJaYlapuu: Number(e.target.value) }
                    })}
                  />
                </div>
                <div>
                  <label className={labelClass}>KP-tolppa 39x66 (kpl)</label>
                  <input
                    type="number"
                    min="0"
                    className={inputClass}
                    value={specialProducts.valiseina.kpTolppa}
                    onChange={e => setSpecialProducts({
                      ...specialProducts,
                      valiseina: { ...specialProducts.valiseina, kpTolppa: Number(e.target.value) }
                    })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Eriste 50 mm (m²)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className={inputClass}
                    value={specialProducts.valiseina.eriste50mm}
                    onChange={e => setSpecialProducts({
                      ...specialProducts,
                      valiseina: { ...specialProducts.valiseina, eriste50mm: Number(e.target.value) }
                    })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Kipsilevy (m²)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className={inputClass}
                    value={specialProducts.valiseina.kipsilevy}
                    onChange={e => setSpecialProducts({
                      ...specialProducts,
                      valiseina: { ...specialProducts.valiseina, kipsilevy: Number(e.target.value) }
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Rahti */}
            <div>
              <label className={labelClass}>RAHTI (€)</label>
              <input
                type="number"
                min="0"
                className={inputClass}
                value={specialProducts.rahti}
                onChange={e => setSpecialProducts({ ...specialProducts, rahti: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* 6. Hintalaskenta */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 card-shadow">
            <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
              <DollarSign className="text-green-600" /> Hintalaskenta
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Asennus (€)</label>
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  value={pricing.asennus}
                  onChange={e => setPricing({ ...pricing, asennus: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className={labelClass}>Elementti maalaus (€)</label>
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  value={pricing.elementMaalaus}
                  onChange={e => setPricing({ ...pricing, elementMaalaus: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className={labelClass}>Ristikot (€)</label>
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  value={pricing.ristikot}
                  onChange={e => setPricing({ ...pricing, ristikot: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className={labelClass}>Suunnittelu (€)</label>
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  value={pricing.suunnittelu}
                  onChange={e => setPricing({ ...pricing, suunnittelu: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className={labelClass}>Tukityöt (€)</label>
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  value={pricing.tukityot}
                  onChange={e => setPricing({ ...pricing, tukityot: Number(e.target.value) })}
                />
              </div>
              <div className="p-4 bg-green-50 rounded-lg border-2 border-green-400">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-slate-900">HINTA €:</span>
                  <span className="font-bold text-green-900 text-2xl">{calculateTotalPrice().toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tallenna -nappi */}
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setShowElectricForm(false)}
              className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-all"
            >
              Peruuta
            </button>
            <button
              onClick={handleSaveElectricForm}
              className="px-6 py-3 bg-hieta-blue hover:bg-hieta-blue/90 text-white font-bold rounded-lg transition-all flex items-center gap-2 card-shadow hover-lift"
            >
              <CheckCircle size={18} /> Tallenna tarjoukseen
            </button>
          </div>
        </div>
      ) : (
        /* Vanha lomake */
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
                      e.stopPropagation();
                      setIsDragging(false);
                      
                      const files = e.dataTransfer.files;
                      if (files && files.length > 0) {
                        console.log(`Dropped ${files.length} file(s)`);
                        handleFileSelect(files);
                      } else {
                        console.warn('No files in dataTransfer');
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mx-auto text-slate-400 mb-3" size={32} />
                    <p className="text-slate-600 font-medium mb-1">
                      Vedä piirustukset tähän tai klikkaa valitaksesi
                    </p>
                      <p className="text-xs text-slate-400">
                      Tuettu: PNG, JPG, GIF, WebP (PDF-tiedostot täytyy muuntaa kuviksi)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
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
                      <div className={`p-4 border rounded-lg ${
                        analysisResult.suggestedElements.length === 0 && analysisResult.suggestedTrusses.length === 0
                          ? 'bg-amber-50 border-amber-200'
                          : 'bg-green-50 border-green-200'
                      }`}>
                        <h4 className={`font-bold mb-3 flex items-center gap-2 ${
                          analysisResult.suggestedElements.length === 0 && analysisResult.suggestedTrusses.length === 0
                            ? 'text-amber-900'
                            : 'text-green-900'
                        }`}>
                          <Sparkles size={16} /> AI-analyysin tulokset
                        </h4>
                        <div className={`space-y-2 text-sm ${
                          analysisResult.suggestedElements.length === 0 && analysisResult.suggestedTrusses.length === 0
                            ? 'text-amber-800'
                            : 'text-green-800'
                        }`}>
                          <p><strong>Ehdotetut elementit:</strong> {analysisResult.suggestedElements?.length || 0} tyyppiä</p>
                          <p><strong>Ehdotetut ristikot:</strong> {analysisResult.suggestedTrusses?.length || 0} tyyppiä</p>
                          {analysisResult.notes && analysisResult.notes.length > 0 && (
                            <div className="mt-2">
                              <strong>Huomiot:</strong>
                              <ul className="list-disc list-inside mt-1">
                                {analysisResult.notes.map((note, i) => (
                                  <li key={i}>{note}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {analysisResult.suggestedElements.length === 0 && analysisResult.suggestedTrusses.length === 0 && (
                            <div className="mt-2 p-2 bg-white/50 rounded border border-amber-300">
                              <p className="text-xs">
                                <strong>Vinkki:</strong> Varmista, että olet ladannut piirustukset (pohjapiirustus, julkisivupiirustus, leikkauspiirustus) ja että ne ovat selkeät ja luettavat. 
                                Jos piirustukset ovat olemassa mutta analyysi ei löytänyt elementtejä, kokeile analysoida uudelleen.
                              </p>
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
      )}
    </div>
  );
};

export default ElementCalculatorView;
