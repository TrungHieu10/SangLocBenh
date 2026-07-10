import { useState, useCallback, useEffect } from 'react';
import clinicalApi from '../api/clinicalApi';

/**
 * Custom Hook - Quản lý lịch sử khám
 * @returns { checkups, total, page, loading, error, fetchHistory, loadMore }
 */
export const useCheckupHistory = () => {
  const [checkups, setCheckups] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await clinicalApi.getHistory({
        page: pageNum,
        pageSize,
        sortBy: '-createdAt',
      });
      
      if (pageNum === 1) {
        setCheckups(data.items);
      } else {
        setCheckups((prev) => [...prev, ...data.items]);
      }
      
      setTotal(data.total);
      setPage(pageNum);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải lịch sử khám');
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  const loadMore = useCallback(() => {
    fetchHistory(page + 1);
  }, [page, fetchHistory]);

  // Fetch lần đầu khi component mount
  useEffect(() => {
    fetchHistory(1);
  }, []);

  return {
    checkups,
    total,
    page,
    loading,
    error,
    fetchHistory,
    loadMore,
    hasMore: checkups.length < total,
  };
};

export default useCheckupHistory;
