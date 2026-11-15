import { useCallback, useEffect, useState } from 'react';
import { getServices } from '../services/api';

// Загружает список услуг через API-слой и отдаёт состояние запроса.
// status: 'loading' | 'success' | 'error'
export function useServices() {
  const [state, setState] = useState({ status: 'loading', services: [] });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading', services: [] });

    getServices()
      .then((services) => {
        if (!cancelled) setState({ status: 'success', services });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error', services: [] });
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const reload = useCallback(() => setAttempt((value) => value + 1), []);

  return { ...state, reload };
}
