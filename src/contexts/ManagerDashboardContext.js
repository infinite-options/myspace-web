import React, { createContext, useState, useEffect, useMemo } from 'react';
import APIConfig from '../utils/APIConfig';
import { useUser } from './UserContext';
import { HealthAndSafety } from '@mui/icons-material';



export const ManagerDashboardContext = createContext();

export const ManagerDashboardProvider = ({ children }) => {
  const { getProfileId } = useUser(); // Ensure this hook is correctly imported and used
  const [dataLoaded, setDataLoaded] = useState(false);

  // Memoize the context value to avoid unnecessary re-renders
  const dataLoadedContextValue = useMemo(() => ({ dataLoaded, setDataLoaded }), [dataLoaded]);

  // Optional: useEffect to log changes to dataLoaded
  useEffect(() => {
    console.log("ROHIT - 19 - ManagerDashboardProvider - dataLoaded - ", dataLoaded);
  }, [dataLoaded]);

  // This function can be used to update dataLoaded and log the change
  const handleSetDataLoaded = (value) => {
    setDataLoaded(value);
    console.log("ROHIT - setDataLoaded called with: ", value);
  };

  return (
    <ManagerDashboardContext.Provider
      value={{
        dataLoaded,
        setDataLoaded,
      }}
    >
      {children}
    </ManagerDashboardContext.Provider>
  );
};

export default ManagerDashboardContext;
