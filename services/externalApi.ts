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
    this.baseUrl = baseUrl || process.env.EXTERNAL_API_URL || '';
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

  async listCustomers(filters?: { tags?: string[] }): Promise<ExternalCustomer[]> {
    // TODO: Replace with actual API call
    return [];
  }
}

export const externalApi = new ExternalApiClient();
