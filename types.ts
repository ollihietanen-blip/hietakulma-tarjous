

export interface Quotation {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  
  project: Project;
  customer: Customer;
  documents: DocumentItem[];
  elements: ElementSection[];
  products: ProductSection[];
  pricing: PricingCalculation;
  paymentSchedule: PaymentMilestone[];
  delivery: DeliveryScope;
}

export interface Project {
  number: string;
  name: string;
  address: string;
  buildingType: 'loma-asunto' | 'omakotitalo' | 'varastohalli' | 'sauna' | 'rivitalo';
  deliveryWeek?: string;
  offerDate: Date;
}

export interface Customer {
  name: string;
  businessId?: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  billingMethod: 'email' | 'e-invoice' | 'mail';
  billingAddress?: string;
}

export interface DocumentItem {
  id: string;
  category: 'pääpiirustukset' | 'rakennesuunnitelmat' | 'tekniset-liitteet' | 'myyntiaineisto';
  name: string;
  included: boolean;
  price: number;
  order: number;
}

export interface ElementSection {
  id: string;
  order: number;
  title: string;
  subtitle?: string;
  items: ElementItem[];
}

export interface ElementItem {
  id: string;
  type: string;
  description: string;
  specifications: {
    height?: string;
    uValue?: string;
    frame?: string;
    insulation?: string;
    exterior?: string;
    interior?: string;
    finish?: string;
    color?: string;
    cladding?: string;
    claddingOverhang?: string; // New: Verhouksen ylitys
    surfaceFinish?: string;
    [key: string]: string | undefined;
  };
  quantity: number;
  netArea?: number;
  unit: 'kpl' | 'm²' | 'jm' | 'm';
  unitPrice: number;
  
  hasWindowInstall?: boolean;
  windowCount?: number;
  windowInstallPrice?: number;
  
  totalPrice: number;
}

export interface ProductSection {
  id: string;
  title: string;
  items: ProductItem[];
}

export interface ProductItem {
  id: string;
  rivinro: number;
  tunnus: string;
  manufacturer?: 'Pihla Varma' | 'Pihla Patio' | 'Muu';
  type: 'window' | 'door' | 'material';
  subtype?: 'opening' | 'fixed' | 'sliding';
  width?: number;
  height?: number;
  uValue?: number;
  glassType?: string;
  glassCode?: string;
  frameInnerColor?: string;
  frameOuterColor?: string;
  frameOuterMaterial?: 'alumiini' | 'puu';
  blinds?: {
    type: 'Inka' | 'Perus' | 'Ei';
    color: string;
    position: 'Saranapuoli' | 'Oikea' | 'Vasen';
  };
  handles?: {
    color: 'Valkoinen' | 'Kromi' | 'Musta';
    type: 'Suora' | 'Ovaali';
  };
  lock?: {
    type: string;
    keyhole: boolean;
    button?: string;
  };
  orientation?: 'left' | 'right' | 'up';
  isGeneric?: boolean;
  description?: string;
  unit?: string;
  accessories: string[];
  notes?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type VatMode = 'standard' | 'construction_service';

export interface PricingCalculation {
  costPrice: number;
  markupPercentage: number;
  markupAmount: number;
  commissionPercentage: number;
  commissionAmount: number;
  subtotal: number;
  vatMode: VatMode;
  vatPercentage: number;
  vatAmount: number;
  totalWithVat: number;
  elementsTotal: number;
  productsTotal: number;
  documentsTotal: number;
  installationTotal: number; // New: Asennuksen hinta
}

export interface PaymentMilestone {
  id: string;
  order: number;
  description: string;
  trigger: 'signing' | 'pre-production' | 'factory-ready' | 'installation-start' | 'completion' | 'custom';
  percentage: number;
  amount: number;
}

export interface DeliveryScope {
  // New: Assembly Level Selection
  assemblyLevelId: 'material-only' | 'shell-and-roof' | 'exterior-complete';
  // Tracks items removed from the standard package (checked = included, unchecked in UI = in this list)
  unselectedItems: string[]; 
  // Custom added items
  customItems: string[];
  // Old granular items (kept for backward compatibility or extra generic logistics)
  logistics: LogisticsItem[];
  exclusions: string[];
}

export interface LogisticsItem {
  id: string;
  type: 'rahti' | 'nostot' | 'telineet' | 'nostimet';
  description: string;
  included: boolean;
  note?: string;
}

// --- NEW ASSEMBLY LEVEL TYPES ---

export interface AssemblyLevel {
  id: 'material-only' | 'shell-and-roof' | 'exterior-complete';
  name: string;
  shortName: string;
  description: string;
  icon: 'package' | 'frame' | 'home'; // Changed to string literals for Lucide icons
  
  included: {
    [category: string]: string[];
  };
  
  excluded: string[];
  
  responsibilities: {
    seller: string[];
    customer: string[];
  };
  
  pricing: {
    baseMultiplier: number; // 1.0, 1.2, 1.45
    assemblyAddition: number; // 0%, 20%, 45%
    note: string;
  };
  
  timeline: {
    [phase: string]: string;
  };
  
  customerWork: {
    effort: string;
    skills: string;
    estimatedTime: string;
  };

  whatIsReady?: {
    exterior?: string[];
    interior?: string[];
    readyFor?: string[];
  };
}

// --- DATA CONSTANTS ---

export const ASSEMBLY_LEVELS: AssemblyLevel[] = [
  {
    id: 'material-only',
    name: 'Materiaali',
    shortName: 'Materiaali',
    description: 'Elementit ja materiaalit toimitettuna työmaalle. Ei asennusta.',
    icon: 'package',
    
    included: {
      delivery: [
        'Elementtien ja materiaalien toimitus työmaalle',
        'Kuorman purku (1h sisältyy rahtiin)',
        'Kuljetusvakuutus'
      ],
      factoryMade: [
        'Seinäelementit (tehtaalla valmistettu)',
        'Päätyräystäselementit',
        'Kattoristikot (CE-merkityt)',
        'Päätykolmioristikot'
      ],
      products: [
        'Ikkunat (Pihla Varma)',
        'Ulko-ovet (Pihla Varma/Patio)',
        'Ikkunoiden vesipellit'
      ],
      worksiteMaterials: [
        'Ulkoverhouksen puuttuvat osat',
        'Nurkka-, sauma- ja katkaisulaudat',
        'Väliseinämateriaalit',
        'Yläpohjan eristeet ja koolaukset'
      ],
      roofing: [
        'Vesikate-materiaalit (pelti/huopa)',
        'Aluskate, ruoteet ja tuuletusrimat',
        'Kattoturvatuotteet (materiaalina)'
      ],
      documentation: [
        'Rakennesuunnitelmat',
        'Perustussuunnitelmat',
        'Energiaselvitys'
      ]
    },
    
    excluded: [
      'KAIKKI ASENNUSTYÖT',
      'Tarkistusmittaus',
      'Nostokalusto ja telineet',
      'Elementtien pystytys',
      'Vesikatteiden asennus'
    ],
    
    responsibilities: {
      seller: [
        'Elementtien valmistus ja toimitus',
        'Rakennepiirustukset'
      ],
      customer: [
        'Perustukset',
        'Nostokalusto ja telineet',
        'Kaikki asennustyöt',
        'Työmaan työturvallisuus ja vakuutus'
      ]
    },
    
    pricing: {
      baseMultiplier: 1.0,
      assemblyAddition: 0,
      note: 'Pelkkä materiaali, ei asennusta'
    },
    
    timeline: {
      delivery: '1 päivä',
      total: 'Asiakkaan aikataulun mukaan'
    },
    
    customerWork: {
      effort: 'Erittäin paljon',
      skills: 'Ammattirakentaja tai kokenut urakoitsija',
      estimatedTime: '4-10 viikkoa'
    }
  },
  {
    id: 'shell-and-roof',
    name: 'Runko ja vesikatto',
    shortName: 'Runkovalmis',
    description: 'Elementtien pystytys ja vesikatto asennetaan. Rakennus vesitiivis. Verhoukset asiakkaan vastuulla.',
    icon: 'frame',
    
    included: {
      prework: [
        'Tarkistusmittaus ja pöytäkirja',
        'Solumuovi ja alaohjauspuut'
      ],
      structureAssembly: [
        'Ulkoseinäelementit pystytys',
        'Väliseinäelementit pystytys (kantavat)',
        'Pilarit ja palkit asennus',
        'Kattoristikot ja harja asennus'
      ],
      roofingWork: [
        'Aluskate, ruoteet, tuuletusrimat',
        'Vesikate asennus',
        'Kattoturvatuotteiden asennus'
      ],
      logistics: [
        'Rahti ja nostokalusto',
        'Elementtipaketin nostot'
      ],
      safety: [
        'Putoamissuojat ja asennus',
        'Työturvallisuus asennuksen osalta'
      ],
      documentation: [
        'Asennuspöytäkirjat',
        'Tarkistusmittauspöytäkirja'
      ]
    },
    
    excluded: [
      'Ulkoverhouksen asennus',
      'Ikkunoiden ja ovien asennus työmaalla',
      'Sisäverhouksen kipsit asennus',
      'Villoitukset',
      'Telineet ja henkilönostimet (asiakas hankkii)'
    ],
    
    responsibilities: {
      seller: [
        'Rungon pystytys',
        'Vesikaton asennus',
        'Nostokalusto',
        'Asennuksen työturvallisuus'
      ],
      customer: [
        'Perustukset',
        'Telineet ja henkilönostimet',
        'Ulkoverhouksen asennus',
        'Ikkunoiden/ovien asennus',
        'Sisätyöt'
      ]
    },
    
    pricing: {
      baseMultiplier: 1.20,
      assemblyAddition: 20,
      note: 'Materiaalit + runkoasennus + vesikatto'
    },
    
    timeline: {
      frameAssembly: '3-5 päivää',
      roofing: '2-3 päivää',
      total: '7-10 työpäivää'
    },
    
    customerWork: {
      effort: 'Paljon',
      skills: 'Rakentamiskokemusta',
      estimatedTime: '3-6 viikkoa'
    }
  },
  {
    id: 'exterior-complete',
    name: 'Ulkoa valmis',
    shortName: 'Ulkovalmis',
    description: 'Rakennus täysin valmis ulkopuolelta. Sisällä kipsit asennettu. Valmis pintakäsittelyyn.',
    icon: 'home',
    
    included: {
      exteriorCladding: [
        'Ulkoverhouksen asennus (paneelit, koolaukset)',
        'Nurkka-, sauma- ja pielilaudat',
        'Räystäslaudoitukset'
      ],
      windowsAndDoors: [
        'Ikkunoiden asennus, tiivistys, pellitys',
        'Ulko-ovien asennus ja säätö'
      ],
      interiorDrywall: [
        'Sisäverhouskipsit ja koolaukset',
        'Väliseinien rakentaminen (ei-kantavat)',
        'Yläpohjan kipsit'
      ],
      insulation: [
        'Ulkoseinien lisäeristys (XPS/PIR)',
        'Yläpohjan puhallusvilla',
        'Höyrynsulut'
      ],
      equipment: [
        'Telineet ja nostimet (Hietakulma hoitaa)',
        'Nostokalusto'
      ]
    },
    
    excluded: [
      'Kipsilevyjen pintakäsittely',
      'Lattian pintamateriaali',
      'Talotekniikka (LVI-S)',
      'Kosteiden tilojen vedeneristys',
      'Sisäovet ja listat'
    ],
    
    responsibilities: {
      seller: [
        'Valmis ulkokuori',
        'Ikkunat/ovet asennettuna',
        'Kipsit ja eristeet asennettuna',
        'Telineet ja nostimet'
      ],
      customer: [
        'Perustukset',
        'Talotekniikka (LVI-S)',
        'Pintakäsittelyt',
        'Kalusteet'
      ]
    },
    
    pricing: {
      baseMultiplier: 1.45,
      assemblyAddition: 45,
      note: 'Materiaalit + runko + vesikatto + ulkoverhous + kipsit'
    },
    
    timeline: {
      total: '4-6 viikkoa'
    },
    
    customerWork: {
      effort: 'Vähän',
      skills: 'Talotekniikka ja pintakäsittely',
      estimatedTime: '2-4 viikkoa'
    },
    
    whatIsReady: {
      exterior: [
        'Ulkoverhous valmis ja maalattu',
        'Ikkunat ja ovet asennettu',
        'Vesikatto valmis'
      ],
      interior: [
        'Kipsit asennettu seiniin/kattoon',
        'Eristykset valmiina',
        'Höyrynsulut paikoillaan'
      ],
      readyFor: [
        'Sähkö- ja putkityöt',
        'Pintakäsittelyt (tasoitus/maalaus)',
        'Lattiamateriaalit'
      ]
    }
  }
];

// Helper to calculate pricing
export function calculatePricing(
  elementsTotal: number,
  productsTotal: number,
  documentsTotal: number,
  installationTotal: number, // Added installation total
  markupPercentage: number = 25,
  commissionPercentage: number = 0,
  vatMode: VatMode = 'standard'
): PricingCalculation {
  const costPrice = elementsTotal + productsTotal + documentsTotal + installationTotal;
  const markupAmount = costPrice * (markupPercentage / 100);
  const commissionAmount = costPrice * (commissionPercentage / 100);
  const subtotal = costPrice + markupAmount + commissionAmount;
  
  // Determine VAT Percentage based on mode
  const vatPercentage = vatMode === 'construction_service' ? 0 : 25.5;
  
  const vatAmount = subtotal * (vatPercentage / 100);
  const totalWithVat = subtotal + vatAmount;
  
  return {
    costPrice,
    markupPercentage,
    markupAmount,
    commissionPercentage,
    commissionAmount,
    subtotal,
    vatMode,
    vatPercentage,
    vatAmount,
    totalWithVat,
    elementsTotal,
    productsTotal,
    documentsTotal,
    installationTotal
  };
}

// Constants

export const STANDARD_DOCUMENTS: DocumentItem[] = [
  { id: '1', category: 'pääpiirustukset', name: 'Asemapiirros', included: true, price: 350, order: 1 },
  { id: '2', category: 'pääpiirustukset', name: 'Pohjapiirros', included: true, price: 450, order: 2 },
  { id: '3', category: 'pääpiirustukset', name: 'Julkisivupiirros', included: true, price: 350, order: 3 },
  { id: '4', category: 'pääpiirustukset', name: 'Leikkauspiirros', included: true, price: 250, order: 4 },
  { id: '5', category: 'pääpiirustukset', name: 'Väritetty julkisivupiirros', included: true, price: 200, order: 5 },
  { id: '6', category: 'rakennesuunnitelmat', name: 'Perustusten tasopiirros', included: true, price: 300, order: 6 },
  { id: '7', category: 'rakennesuunnitelmat', name: 'Perustussuunnitelmat', included: true, price: 400, order: 7 },
  { id: '8', category: 'rakennesuunnitelmat', name: 'Väli- ja yläpohjan tasopiirrokset', included: true, price: 350, order: 8 },
  { id: '9', category: 'rakennesuunnitelmat', name: 'Kattoristikkokaaviot ja laskelmat', included: true, price: 250, order: 9 },
  { id: '10', category: 'rakennesuunnitelmat', name: 'Väliseinien mittapiirros', included: true, price: 200, order: 10 },
  { id: '14', category: 'rakennesuunnitelmat', name: 'Elementtikuvat', included: true, price: 500, order: 10.5 },
  { id: '11', category: 'tekniset-liitteet', name: 'Kosteudenhallintaselvitys', included: true, price: 150, order: 11 },
  { id: '12', category: 'tekniset-liitteet', name: 'Energiatodistus ja energiaselvitys', included: true, price: 350, order: 12 },
  { id: '13', category: 'tekniset-liitteet', name: 'Talo-2000 kustannusarvio', included: false, price: 250, order: 13 },
  { id: '15', category: 'myyntiaineisto', name: '3D-mallinnus', included: false, price: 450, order: 14 },
  { id: '16', category: 'myyntiaineisto', name: 'Myyntikuvat', included: false, price: 250, order: 15 }
];

export const PAYMENT_SCHEDULE_TEMPLATES = {
  'loma-asunto': [
    { order: 1, description: 'Erääntyy kun toimitussopimus on allekirjoitettu', trigger: 'signing', percentage: 10 },
    { order: 2, description: 'Erääntyy 7 vrk. ennen kuin loma-asunnon valmistus alkaa tehtaalla', trigger: 'pre-production', percentage: 30 },
    { order: 3, description: 'Erääntyy 7 vrk. ennen kuin talousrakennuksen valmistus alkaa tehtaalla', trigger: 'pre-production', percentage: 20 },
    { order: 4, description: 'Erääntyy kun loma-asunnon asennus alkaa työmaalla', trigger: 'installation-start', percentage: 20 },
    { order: 5, description: 'Erääntyy kun talousrakennuksen asennus alkaa työmaalla', trigger: 'installation-start', percentage: 10 },
    { order: 6, description: 'Erääntyy kun kohde toimitussopimuksen mukaisesti valmiina', trigger: 'completion', percentage: 10 }
  ],
  'omakotitalo': [
    { order: 1, description: 'Erääntyy kun toimitussopimus on allekirjoitettu', trigger: 'signing', percentage: 25 },
    { order: 2, description: 'Erääntyy 7 vrk. ennen kuin valmistus alkaa tehtaalla', trigger: 'pre-production', percentage: 25 },
    { order: 3, description: 'Erääntyy kun elementit valmiina tehtaalla', trigger: 'factory-ready', percentage: 20 },
    { order: 4, description: 'Erääntyy kun asennus alkaa työmaalla', trigger: 'installation-start', percentage: 20 },
    { order: 5, description: 'Erääntyy kun kohde toimitussopimuksen mukaisesti valmiina', trigger: 'completion', percentage: 10 }
  ],
  'varastohalli': [
    { order: 1, description: 'Erääntyy kun toimitussopimus on allekirjoitettu', trigger: 'signing', percentage: 15 },
    { order: 2, description: 'Erääntyy 7 vrk. ennen kuin valmistus alkaa tehtaalla', trigger: 'pre-production', percentage: 30 },
    { order: 3, description: 'Erääntyy kun elementit valmiina tehtaalla', trigger: 'factory-ready', percentage: 30 },
    { order: 4, description: 'Erääntyy kun asennus alkaa työmaalla', trigger: 'installation-start', percentage: 15 },
    { order: 5, description: 'Erääntyy kun kohde toimitussopimuksen mukaisesti valmiina', trigger: 'completion', percentage: 10 }
  ],
  'sauna': [
    { order: 1, description: 'Erääntyy kun toimitussopimus on allekirjoitettu', trigger: 'signing', percentage: 10 },
    { order: 2, description: 'Erääntyy 7 vrk. ennen kuin valmistus alkaa tehtaalla', trigger: 'pre-production', percentage: 40 },
    { order: 3, description: 'Erääntyy kun elementit valmiina tehtaalla', trigger: 'factory-ready', percentage: 40 },
    { order: 4, description: 'Erääntyy kun kohde toimitussopimuksen mukaisesti valmiina', trigger: 'completion', percentage: 10 }
  ],
  'rivitalo': []
} as const;

export const STANDARD_LOGISTICS: LogisticsItem[] = [
  { id: '1', type: 'rahti', description: 'Rahti Kankaanpäästä rakennuspaikalle', included: true, note: 'Sisältää purkuaikaa 1h' },
  { id: '2', type: 'nostot', description: 'Elementtipaketin nostot', included: true },
  { id: '3', type: 'telineet', description: 'Rakennustelineet', included: false, note: 'Tilaajan vastuulla' },
  { id: '4', type: 'nostimet', description: 'Henkilönostimet', included: false, note: 'Tilaajan vastuulla' }
];

export const STANDARD_EXCLUSIONS = [
  'Toimitus ei sisällä mitään muita tarvikkeita eikä töitä kuin toimitussisällössä mainitut',
  'Elementeistä puuttuvat sisäkipsit, eristeet ja koolaukset nurkista ja elementtisaumoista sisältyvät toimitukseen',
  'Pintamaalattuna toimitettujen paneelien naulankantojen ja katkaisupintojen viimeistelymaalaus ei kuulu toimitukseen',
  'Telineiden ja henkilönostimien hankinta on tilaajan vastuulla',
  'Perustukset ja maatöötäytyy olla tilaajan toimesta valmiina'
];

export const ELEMENT_TEMPLATES = {
  // Ulkoseinät
  'US-198': {
    type: 'Ulkoseinäelementti US-198',
    description: 'Runko 42x198, U=0,17 W/m²K',
    specifications: {
      height: '2760 mm',
      uValue: '0,17 W/m²K',
      frame: '42 x 198 mm, k 600',
      insulation: 'Mineraalivilla 200 mm',
      exterior: 'UTW 28x195 asennettuna vaakaan',
      interior: 'Sisäverhouskipsilevy EK 13',
      cladding: 'UTW 28x195',
      surfaceFinish: 'Pohjamaalattu'
    },
    unit: 'kpl' as const,
    unitPrice: 450
  },
  'US-148': {
    type: 'Ulkoseinäelementti US-148',
    description: 'Runko 42x148, U=0,25 W/m²K',
    specifications: {
      height: '2250 mm',
      uValue: '0,25 W/m²K',
      frame: '42 x 148 mm, k 600',
      insulation: 'Mineraalivilla 150 mm',
      cladding: 'UTW 23x145',
      surfaceFinish: 'Pohjamaalattu'
    },
    unit: 'kpl' as const,
    unitPrice: 380
  },
  
  // Väliseinät
  'VS-92': {
    type: 'Väliseinäelementti VS-92',
    description: 'Kantava/Ei-kantava väliseinä',
    specifications: {
      frame: '42 x 92 mm, k 600',
      insulation: 'Mineraalivilla 70 mm',
      interior: 'Kipsilevy molemmin puolin'
    },
    unit: 'kpl' as const,
    unitPrice: 180
  },
  'VS-66': {
    type: 'Väliseinäelementti VS-66',
    description: 'Kevyt väliseinä',
    specifications: {
      frame: '42 x 66 mm, k 600',
      insulation: 'Mineraalivilla 50 mm',
      interior: 'Kipsilevy molemmin puolin'
    },
    unit: 'kpl' as const,
    unitPrice: 150
  },
  'HVS': {
    type: 'HVS-elementti',
    description: 'Huoneistoväliseinäelementti',
    specifications: {
      frame: 'Tuplarunko',
      soundInsulation: 'dB-vaatimus täytetty',
      interior: 'Tuplakipsilevy'
    },
    unit: 'kpl' as const,
    unitPrice: 350
  },

  // Vaakarakenteet (Lattiat/Katot)
  'VP': {
    type: 'Välipohjaelementti',
    description: 'Puuelementtirakenteinen välipohja',
    specifications: {
      frame: 'Kerto / Sahatavara rakennesuunnitelman mukaan',
      insulation: 'Äänieristysvilla',
      surface: 'Lastulevy / Vaneri'
    },
    unit: 'm²' as const,
    unitPrice: 120
  },
  'YP': {
    type: 'Yläpohjaelementti',
    description: 'Eristetty yläpohjaelementti',
    specifications: {
      uValue: '0,09 W/m²K',
      insulation: 'Puhallusvilla / Levyvilla',
      vaporBarrier: 'Höyrynsulkumuovi'
    },
    unit: 'm²' as const,
    unitPrice: 95
  },

  // Kattorakenteet ja muut
  'PAATYKOLMIO': {
    type: 'Päätykolmio',
    description: 'Ristikoiden mukainen päätykolmioelementti',
    specifications: {
      exterior: 'Ulkoverhouspaneeli',
      frame: 'Ristikkojakoa vastaava',
      ventilation: 'Tuuletusrimat',
      cladding: 'Paneeli',
      surfaceFinish: 'Pohjamaalattu'
    },
    unit: 'kpl' as const,
    unitPrice: 650
  },
  'RAYSTAS': {
    type: 'Räystäselementti',
    description: 'Päätyräystäselementti, umpiräystäs',
    specifications: {
      type: 'Umpiräystäs',
      boards: 'Hienosahattu 20x120 mm',
      finish: 'Pohja-, väli- ja pintamaalattu',
      surfaceFinish: 'Pohja-, väli- ja pintamaalattu'
    },
    unit: 'kpl' as const,
    unitPrice: 280
  },
  'RISTIKKO': {
    type: 'Kattoristikot',
    description: 'CE-merkityt kattoristikot',
    specifications: {
      type: 'CE-merkityt NR-ristikot',
      spacing: 'k-900 tai rakennesuunnitelman mukaan'
    },
    unit: 'kpl' as const,
    unitPrice: 180
  }
};

// Initial data for Worksite Deliveries
export const DEFAULT_WORKSITE_SECTIONS = [
  {
    id: 'ulkoverhous',
    title: '1. Mukaan pakattavat ulkoverhouksen osat',
    items: [
      { tunnus: 'UTW 28x195', description: 'Puuttuvat paneelit elementeistä ja ylityksistä', unit: 'jm', quantity: 0, unitPrice: 0, isGeneric: true, type: 'material' },
      { tunnus: 'Pystykoolaus', description: '25x73 / 32x73 / 32x100, k 600', unit: 'jm', quantity: 0, unitPrice: 0, isGeneric: true, type: 'material' },
      { tunnus: 'Tuulensuojakipsi', description: '9 mm', unit: 'kpl', quantity: 0, unitPrice: 0, isGeneric: true, type: 'material' },
      { tunnus: 'Nurkka/saumalaudat', description: 'Hienosahattu 20x120 ja 20x95', unit: 'jm', quantity: 0, unitPrice: 0, isGeneric: true, type: 'material' },
      { tunnus: 'Pielilaudat', description: 'Hienosahattu, leveys rungon mukaan', unit: 'jm', quantity: 0, unitPrice: 0, isGeneric: true, type: 'material' },
      { tunnus: 'Räystään aluslaudat', description: 'Hienosahattu 20x120 mm', unit: 'jm', quantity: 0, unitPrice: 0, isGeneric: true, type: 'material' },
      { tunnus: 'Räystään otsalaudat', description: 'Hienosahattu, kattorakenteen mukaan', unit: 'jm', quantity: 0, unitPrice: 0, isGeneric: true, type: 'material' }
    ]
  },
  {
    id: 'sisäverhous',
    title: '2. Sisäverhouksen materiaalit ja Alakatto',
    items: [
      { tunnus: 'Väliseinämateriaalit', description: 'KN-13 + kertopuu 39x66 + villa 50mm + KN-13', unit: 'm²', quantity: 0, unitPrice: 0, isGeneric: true, type: 'material' },
      { tunnus: 'Höyrynsulkupaketti', description: 'Höyrynsulkumuovi SFS 50v, saumateipit, läpivientikaulukset ja tiivistemassa', unit: 'erä', quantity: 0, unitPrice: 0, isGeneric: true, type: 'material' },
      { tunnus: 'Alakaton koolaus', description: 'Koolauspuu 48x48 k400 + ripustuslaudat/kiinnikkeet', unit: 'jm', quantity: 0, unitPrice: 0, isGeneric: true, type: 'material' },
      { tunnus: 'Alakaton harvalauta', description: '22x100 k300 (paneelialustaksi) tai 22x22 rima', unit: 'jm', quantity: 0, unitPrice: 0, isGeneric: true, type: 'material' },
      { tunnus: 'Sisäkoolaus', description: '2x25x73 k600 (seinät)', unit: 'jm', quantity: 0, unitPrice: 0, isGeneric: true, type: 'material' },
      { tunnus: 'Sisäverhouskipsi', description: 'EK-13 / KN-13', unit: 'kpl', quantity: 0, unitPrice: 0, isGeneric: true, type: 'material' }
    ]
  },
  {
    id: 'rakenteet',
    title: '3. Rakenteet ja Eristeet',
    items: [
      { tunnus: 'Pilarit ja palkit', description: 'Rakennesuunnitelman mukaan', unit: 'kpl', quantity: 0, unitPrice: 0, isGeneric: true, type: 'material' },
      { tunnus: 'Puhallusvilla', description: 'ASENNETTUNA, 350-450mm', unit: 'm²', quantity: 0, unitPrice: 0, isGeneric: true, type: 'material' },
      { tunnus: 'Mineraalivilla', description: '100 mm / 200 mm', unit: 'pkt', quantity: 0, unitPrice: 0, isGeneric: true, type: 'material' },
      { tunnus: 'Yläpohjan koolaus', description: '48x48 k400 / 22x100 k400', unit: 'jm', quantity: 0, unitPrice: 0, isGeneric: true, type: 'material' }
    ]
  },
  {
    id: 'vesikate',
    title: '4. Vesikate ja kattoturva',
    items: [
      { tunnus: 'Tiilikatepaketti', description: 'Ormax/Benders betonitiili, harja- ja päätytiilet, kiinnikkeet', unit: 'm²', quantity: 0, unitPrice: 0, isGeneric: true, type: 'material' },
      { tunnus: 'Tiilikaton puutavara', description: 'Korokerima 50x50 + Ruode 47x75/50x75, mitallistettu', unit: 'jm', quantity: 0, unitPrice: 0, isGeneric: true, type: 'material' },
      { tunnus: 'Lukkosaumakate', description: 'Pelti (0,6mm), harjapellit, päätypellit, ruuvit', unit: 'm²', quantity: 0, unitPrice: 0, isGeneric: true, type: 'material' },
      { tunnus: 'Muotokate (Tiilikuvio)', description: 'Pelti (0,5mm), listat ja ruuvit', unit: 'm²', quantity: 0, unitPrice: 0, isGeneric: true, type: 'material' },
      { tunnus: 'Peltikaton puutavara', description: 'Tuuletusrima 22x50 + Ruode 32x100 k350/400', unit: 'jm', quantity: 0, unitPrice: 0, isGeneric: true, type: 'material' },
      { tunnus: 'Aluskate', description: 'Kondenssisuojattu (pelti) tai aluskatemuovi (tiili)', unit: 'rll', quantity: 0, unitPrice: 0, isGeneric: true, type: 'material' },
      { tunnus: 'Kattoturvatuotteet', description: 'Tikkaat, sillat, lumiesteet (määräysten mukaiset)', unit: 'erä', quantity: 1, unitPrice: 0, isGeneric: true, type: 'material' }
    ]
  },
  {
    id: 'asennus',
    title: '5. Asennustarvikkeet',
    items: [
      { tunnus: 'Kiinnitystarvikkeet', description: 'Naulat, ruuvit, kulmaraudat, kengät', unit: 'erä', quantity: 1, unitPrice: 0, isGeneric: true, type: 'material' },
      { tunnus: 'Saumanauhat', description: 'Elementtien saumaukseen', unit: 'rll', quantity: 0, unitPrice: 0, isGeneric: true, type: 'material' }
    ]
  }
] as const;