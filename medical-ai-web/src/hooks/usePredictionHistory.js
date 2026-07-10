import { useState, useCallback, useEffect } from 'react';
import predictionApi from '../api/predictionApi';

/**
 * Custom Hook - Lịch sử dự đoán (health trend)
 * @returns { predictions, loading, error, fetch }
 */
export const usePredictionHistory = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async (options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const data = await predictionApi.getPredictionHistory(options);
      setPredictions(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch prediction history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch({ limit: 12 });
  }, []);

  return {
    predictions,
    loading,
    error,
    fetch,
  };
};

export default usePredictionHistory;
