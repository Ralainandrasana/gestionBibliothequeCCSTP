import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
  createTableCacheKey,
  getTableCache,
  invalidateTableCache,
  isTableCacheFresh,
  setTableCache,
} from '../utils/tableCache';

function usePaginatedTable(endpoint, { initialPageSize = 20, transformData, extraParams = {} } = {}) {
  const transformRef = useRef(transformData);
  transformRef.current = transformData;
  const extraParamsRef = useRef(extraParams);
  extraParamsRef.current = extraParams;

  const [data, setTableData] = useState([]);
  const dataRef = useRef([]);
  const activeCacheKeyRef = useRef(null);
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
    const requestParams = {
      page: currentPage,
      pageSize: currentPageSize,
      search: debouncedSearch,
      ...extraParamsRef.current,
    };
    const cacheKey = createTableCacheKey(endpoint, requestParams);
    activeCacheKeyRef.current = cacheKey;
    const cached = getTableCache(cacheKey);

    if (cached) {
      dataRef.current = cached.data;
      setTableData(cached.data);
      setPagination(current => ({ ...current, ...cached.pagination }));
      setLoading(false);
    }

    const load = async () => {
      if (!cached) setLoading(true);
      try {
        const response = await axios.get(endpoint, {
          signal: controller.signal,
          params: requestParams
        });
        const rows = transformRef.current
          ? response.data.data.map(transformRef.current)
          : response.data.data;
        dataRef.current = rows;
        setTableData(rows);
        setPagination(current => ({ ...current, ...response.data.pagination }));
        setTableCache(cacheKey, { data: rows, pagination: response.data.pagination });
      } catch (error) {
        if (error.code !== 'ERR_CANCELED') {
          console.error(`Erreur lors du chargement de ${endpoint} :`, error);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    if (!isTableCacheFresh(cached)) load();
    return () => controller.abort();
  }, [endpoint, currentPage, currentPageSize, debouncedSearch, refreshKey, extraParamsKey]);

  const setData = useCallback((updater) => {
    const currentData = dataRef.current;
    const nextData = typeof updater === 'function' ? updater(currentData) : updater;
    const normalizedData = Array.isArray(nextData) ? nextData : [];
    const lengthDifference = normalizedData.length - currentData.length;
    dataRef.current = normalizedData;
    setTableData(normalizedData);

    setPagination(current => {
      const nextPagination = {
        ...current,
        total: Math.max(0, Number(current.total || 0) + lengthDifference),
      };
      const cacheKey = activeCacheKeyRef.current;
      if (cacheKey && getTableCache(cacheKey)) {
        setTableCache(cacheKey, { data: normalizedData, pagination: nextPagination });
      }
      return nextPagination;
    });
  }, []);

  const handleTableChange = useCallback((nextPagination) => {
    setPagination(current => ({
      ...current,
      current: nextPagination.current || 1,
      pageSize: nextPagination.pageSize || current.pageSize
    }));
  }, []);

  const refresh = useCallback(() => {
    invalidateTableCache(endpoint);
    setRefreshKey(current => current + 1);
  }, [endpoint]);

  return { data, setData, loading, searchTerm, setSearchTerm, pagination, handleTableChange, refresh };
}

export default usePaginatedTable;
