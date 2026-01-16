// External API client for fetching projects and customers
// These are read-only and fetched from an external system

export interface ExternalProject {
  number: string;
  name: string;
  address: string;
  postalCode?: string;
  city?: string;
  buildingType: 'loma-asunto' | 'omakotitalo' | 'varastohalli' | 'sauna' | 'rivitalo' | 'paritalo';
  deliveryWeek?: string;
  offerDate: Date;
  owner: string;
}

export interface ExternalCustomer {
  name: string;
  businessId?: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  billingMethod: 'email' | 'e-invoice' | 'mail';
  billingAddress?: string;
  tags: string[];
}

// Mock implementation - replace with actual API calls
export class ExternalApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || import.meta.env.VITE_EXTERNAL_API_URL || '';
  }

  async getProject(projectId: string): Promise<ExternalProject | null> {
    // TODO: Replace with actual API call
    // For now, return mock data
    return {
      number: projectId,
      name: 'Loma-asunto Levin Atrin Atmos',
      address: 'Atrinpolku 2, 99130 Kittilä',
      buildingType: 'loma-asunto',
      offerDate: new Date(),
      owner: 'Olli Hietanen'
    };
  }

  async getCustomer(customerId: string): Promise<ExternalCustomer | null> {
    // TODO: Replace with actual API call
    // For now, return mock data
    return {
      name: customerId,
      contactPerson: 'Matti Meikäläinen',
      email: 'matti.meikalainen@esimerkki.fi',
      phone: '040 123 4567',
      address: 'Esimerkkikatu 1, 00100 Helsinki',
      billingMethod: 'email',
      tags: []
    };
  }

  async listProjects(filters?: { owner?: string; status?: string }): Promise<ExternalProject[]> {
    // TODO: Replace with actual API call
    return [];
  }

  async listProductionProjects(filters?: { status?: 'active' | 'planned' | 'completed' }): Promise<Array<ExternalProject & { 
    status: 'active' | 'planned' | 'completed';
    productionStart?: Date;
    productionEnd?: Date;
    hours?: number;
    deliveryWeek?: string;
    location?: string;
  }>> {
    // TODO: Replace with actual API call to Hietakulma production database
    // For now, return mock production data
    return [
      {
        number: '11547',
        name: 'Villa Onnela',
        address: 'Onnelantie 5',
        city: 'Kirkkonummi',
        buildingType: 'omakotitalo',
        deliveryWeek: '42',
        offerDate: new Date('2025-01-15'),
        owner: 'Olli Hietanen',
        status: 'active',
        productionStart: new Date('2025-09-01'),
        productionEnd: new Date('2025-10-15'),
        hours: 320,
        location: 'Kirkkonummi',
      },
      {
        number: '11391-2',
        name: 'TR Levin Atrin Atmos',
        address: 'Atrinpolku 2',
        city: 'Levi',
        buildingType: 'loma-asunto',
        deliveryWeek: '46',
        offerDate: new Date('2025-02-01'),
        owner: 'Olli Hietanen',
        status: 'active',
        productionStart: new Date('2025-09-20'),
        productionEnd: new Date('2025-11-10'),
        hours: 108,
        location: 'Levi',
      },
      {
        number: '11637',
        name: 'Villa Harmonia (Kaipila)',
        address: 'Kaipilankatu 12',
        city: 'Nokia',
        buildingType: 'omakotitalo',
        deliveryWeek: '52',
        offerDate: new Date('2025-03-10'),
        owner: 'Pekka Projekti',
        status: 'planned',
        productionStart: new Date('2025-12-01'),
        productionEnd: new Date('2026-01-15'),
        hours: 450,
        location: 'Nokia',
      },
      {
        number: '11581',
        name: 'As Oy Käkitie',
        address: 'Käkitie 8',
        city: 'Ylöjärvi',
        buildingType: 'rivitalo',
        deliveryWeek: '3-4',
        offerDate: new Date('2025-04-05'),
        owner: 'Matti Myyjä',
        status: 'planned',
        productionStart: new Date('2026-01-20'),
        productionEnd: new Date('2026-03-15'),
        hours: 2500,
        location: 'Ylöjärvi',
      },
      {
        number: '11344',
        name: 'PT Koutakaari 14 (Mäntylä)',
        address: 'Koutakaari 14',
        city: 'Levi',
        buildingType: 'loma-asunto',
        deliveryWeek: '23',
        offerDate: new Date('2025-05-20'),
        owner: 'Olli Hietanen',
        status: 'planned',
        productionStart: new Date('2026-05-01'),
        productionEnd: new Date('2026-06-10'),
        hours: 1200,
        location: 'Levi',
      },
    ];
  }

  async listCustomers(filters?: { tags?: string[] }): Promise<ExternalCustomer[]> {
    // TODO: Replace with actual API call
    return [];
  }
}

export const externalApi = new ExternalApiClient();
