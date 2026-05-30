import React, { createContext, useContext, useReducer, useCallback } from 'react';

const PitchContext = createContext(null);

const initialState = {
  pitches: [],
  currentPitch: null,
  loading: false,
  error: null,
};

const pitchReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_CURRENT_PITCH':
      return { ...state, currentPitch: action.payload, loading: false };
    case 'ADD_PITCH':
      return { ...state, pitches: [action.payload, ...state.pitches] };
    case 'SET_PITCHES':
      return { ...state, pitches: action.payload };
    case 'CLEAR':
      return { ...state, currentPitch: null, error: null };
    default:
      return state;
  }
};

export const PitchProvider = ({ children }) => {
  const [state, dispatch] = useReducer(pitchReducer, initialState);

  const setLoading = useCallback((val) => dispatch({ type: 'SET_LOADING', payload: val }), []);
  const setError = useCallback((msg) => dispatch({ type: 'SET_ERROR', payload: msg }), []);
  const setCurrentPitch = useCallback((pitch) => dispatch({ type: 'SET_CURRENT_PITCH', payload: pitch }), []);
  const addPitch = useCallback((pitch) => dispatch({ type: 'ADD_PITCH', payload: pitch }), []);
  const setPitches = useCallback((pitches) => dispatch({ type: 'SET_PITCHES', payload: pitches }), []);
  const clearPitch = useCallback(() => dispatch({ type: 'CLEAR' }), []);

  return (
    <PitchContext.Provider value={{ ...state, setLoading, setError, setCurrentPitch, addPitch, setPitches, clearPitch }}>
      {children}
    </PitchContext.Provider>
  );
};

export const usePitchContext = () => {
  const ctx = useContext(PitchContext);
  if (!ctx) throw new Error('usePitchContext must be used within PitchProvider');
  return ctx;
};

export default PitchContext;
