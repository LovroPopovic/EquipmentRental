import React, { createContext, useContext, useState, useCallback } from 'react';

const BookingContext = createContext();

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Trigger refresh for all booking-related screens
  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
    console.log('Global booking refresh triggered');
  }, []);

  const value = {
    refreshTrigger,
    triggerRefresh,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};