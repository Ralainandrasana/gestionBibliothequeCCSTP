import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';

const SEARCH_DELAY_MS = 300;

function useDebouncedRemoteOptions({ endpoint, valueKey, labelKey }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);
  const controllerRef = useRef(null);

  const cancelPendingSearch = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    controllerRef.current?.abort();
    timerRef.current = null;
    controllerRef.current = null;
  }, []);

  const search = useCallback((rawQuery) => {
    cancelPendingSearch();
    const query = String(rawQuery || '').trim();

    if (!query) {
      setOptions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    timerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      controllerRef.current = controller;

      try {
        const response = await axios.get(endpoint, {
          params: { search: query },
          signal: controller.signal,
        });
        setOptions((Array.isArray(response.data) ? response.data : []).map((item) => ({
          value: item[valueKey],
          label: item[labelKey],
        })));
      } catch (error) {
        if (!axios.isCancel(error) && error.code !== 'ERR_CANCELED') {
          setOptions([]);
          console.error('Erreur lors du chargement des suggestions :', error);
        }
      } finally {
        if (controllerRef.current === controller) {
          controllerRef.current = null;
          setLoading(false);
        }
      }
    }, SEARCH_DELAY_MS);
  }, [cancelPendingSearch, endpoint, labelKey, valueKey]);

  useEffect(() => cancelPendingSearch, [cancelPendingSearch]);

  return { options, loading, search };
}

export default useDebouncedRemoteOptions;
