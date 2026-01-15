import { useState, useEffect } from 'react';
import { externalApi, ExternalProject } from '../services/externalApi';

export function useProject(projectId: string | null) {
  const [project, setProject] = useState<ExternalProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!projectId) {
      setProject(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    externalApi.getProject(projectId)
      .then(setProject)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [projectId]);

  return { project, loading, error };
}
