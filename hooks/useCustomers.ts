import { useEffect, useState, useMemo, useCallback } from 'react';
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

  // Safely get the action - ensure api and nested properties exist, wrap in useMemo for stability
  // IMPORTANT: Query must be stable to ensure consistent hook order in useAction wrapper
  // api is stable from Convex codegen, so empty deps are safe
  const getCustomersActionQuery = useMemo(() => {
    try {
      return api?.thingService?.getCustomers ?? null;
    } catch {
      return null;
    }
  }, []); // Empty deps - api is stable from Convex codegen
  const getCustomersAction = useAction(getCustomersActionQuery);

  // Stabilize filter object - convert to primitives for dependency tracking
  const stableFilter = useMemo(() => filter, [
    filter?.active,
    filter?.sysId,
    filter?.sysIds?.join(','),
    filter?.businessId,
    filter?.deleted
  ]);

  useEffect(() => {
    if (!enabled || !isConvexConfigured || !getCustomersAction) {
      return;
    }

    const fetchCustomers = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await getCustomersAction({ filter: stableFilter });
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
  }, [enabled, isConvexConfigured, getCustomersAction, stableFilter]);

  const refetch = useCallback(async () => {
    if (!enabled || !isConvexConfigured || !getCustomersAction) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await getCustomersAction({ filter: stableFilter });
      setCustomers(result || []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch customers');
      setError(error);
      console.error('Error fetching customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [enabled, isConvexConfigured, getCustomersAction, stableFilter]);

  return { customers, loading, error, refetch };
}
