import { useState, useCallback } from 'react';
import { pitchAPI } from '../services/api';

const usePitch = () => {
  const [pitch, setPitch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generatePitch = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await pitchAPI.generate(payload);
      setPitch(result);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to generate pitch');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearPitch = useCallback(() => {
    setPitch(null);
    setError(null);
  }, []);

  return { pitch, loading, error, generatePitch, clearPitch };
};

export default usePitch;
