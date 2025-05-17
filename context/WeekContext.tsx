import React, { createContext, useContext, useState } from 'react';

type WeekContextType = {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
};

const WeekContext = createContext<WeekContextType | undefined>(undefined);

export const WeekProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <WeekContext.Provider value={{ selectedDate, setSelectedDate }}>
      {children}
    </WeekContext.Provider>
  );
};

export const useWeek = () => {
  const context = useContext(WeekContext);
  if (!context) {
    throw new Error('useWeek must be used within a WeekProvider');
  }
  return context;
};
