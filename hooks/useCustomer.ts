import { useState, useEffect } from 'react';
import { externalApi, ExternalCustomer } from '../services/externalApi';

export function useCustomer(customerId: string | null) {
  const [customer, setCustomer] = useState<ExternalCustomer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!customerId) {
      setCustomer(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    externalApi.getCustomer(customerId)
      .then(setCustomer)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [customerId]);

  return { customer, loading, error };
}
