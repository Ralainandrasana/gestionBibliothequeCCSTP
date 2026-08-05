import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';

function usePaginatedTable(endpoint, { initialPageSize = 20, transformData, extraParams = {} } = {}) {
  const transformRef = useRef(transformData);
  transformRef.current = transformData;
  const extraParamsRef = useRef(extraParams);
  extraParamsRef.current = extraParams;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [pagination, setPagination] = useState({ current: 1, pageSize: initialPageSize, total: 0 });
  const currentPage = pagination.current;
  const currentPageSize = pagination.pageSize;
  const extraParamsKey = JSON.stringify(extraParams);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPagination(current => ({ ...current, current: 1 }));
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      try {
        const response = await axios.get(endpoint, {
          signal: controller.signal,
          params: { page: currentPage, pageSize: currentPageSize, search: debouncedSearch, ...extraParamsRef.current }
        });
        const rows = transformRef.current
          ? response.data.data.map(transformRef.current)
          : response.data.data;
        setData(rows);
        setPagination(current => ({ ...current, ...response.data.pagination }));
      } catch (error) {
        if (error.code !== 'ERR_CANCELED') {
          console.error(`Erreur lors du chargement de ${endpoint} :`, error);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [endpoint, currentPage, currentPageSize, debouncedSearch, refreshKey, extraParamsKey]);

  const handleTableChange = useCallback((nextPagination) => {
    setPagination(current => ({
      ...current,
      current: nextPagination.current || 1,
      pageSize: nextPagination.pageSize || current.pageSize
    }));
  }, []);

  const refresh = useCallback(() => setRefreshKey(current => current + 1), []);

  return { data, setData, loading, searchTerm, setSearchTerm, pagination, handleTableChange, refresh };
}

export default usePaginatedTable;
