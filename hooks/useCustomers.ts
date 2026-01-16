import { useEffect, useState } from 'react';
import { useAction } from '../lib/convexHooks';
import { api } from '../convex/_generated/api';
import { isConvexConfigured } from '../lib/convexClient';

export interface Customer {
  sysId: string;
  name: string;
  businessId?: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  billingMethod: 'email' | 'e-invoice' | 'mail';
  billingAddress?: string;
  tags: string[];
  active: boolean;
  deleted: boolean;
  props?: any;
}

interface UseCustomersOptions {
  filter?: {
    active?: boolean;
    sysId?: string | number;
    sysIds?: (string | number)[];
    businessId?: string;
    deleted?: boolean;
  };
  enabled?: boolean;
}

export function useCustomers(options: UseCustomersOptions = {}) {
  const { filter, enabled = true } = options;
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getCustomersAction = useAction(api?.thingService?.getCustomers);

  useEffect(() => {
    if (!enabled || !isConvexConfigured || !getCustomersAction) {
      return;
    }

    const fetchCustomers = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await getCustomersAction({ filter });
        setCustomers(result || []);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch customers');
        setError(error);
        console.error('Error fetching customers:', error);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [enabled, isConvexConfigured, getCustomersAction, JSON.stringify(filter)]);

  const refetch = async () => {
    if (!enabled || !isConvexConfigured || !getCustomersAction) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await getCustomersAction({ filter });
      setCustomers(result || []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch customers');
      setError(error);
      console.error('Error fetching customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  return { customers, loading, error, refetch };
}
