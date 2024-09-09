import React, { createContext, useContext, useState } from 'react';

const MaintenanceContext = createContext();

export const useMaintenance = () => useContext(MaintenanceContext);

export const MaintenanceProvider = ({ children }) => {
  const [maintenanceData, setMaintenanceData] = useState({});
  const [selectedRequestIndex, setSelectedRequestIndex] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState('NEW REQUEST');
  const [maintenanceItemsForStatus, setMaintenanceItemsForStatus] = useState([]);
  const [allMaintenanceData, setAllMaintenanceData] = useState({});
  const [quoteRequestView, setQuoteRequestView] = useState(false);
  const [quoteAcceptView, setQuoteAcceptView] = useState(false);
  const [editMaintenanceView, setEditMaintenanceView] = useState(false);
  const [rescheduleView, setRescheduleView] = useState(false);
  const [payMaintenanceView, setPayMaintenanceView] = useState(false);
  const [maintenanceQuotes, setMaintenanceQuotes] = useState([]);
  const [navigateParams, setNavigateParams] = useState({});

  return (
    <MaintenanceContext.Provider
      value={{
        maintenanceData,
        setMaintenanceData,
        selectedRequestIndex,
        setSelectedRequestIndex,
        selectedStatus,
        setSelectedStatus,
        maintenanceItemsForStatus,
        setMaintenanceItemsForStatus,
        allMaintenanceData,
        setAllMaintenanceData,
        quoteRequestView,
        setQuoteRequestView,
        quoteAcceptView,
        setQuoteAcceptView,
        editMaintenanceView,
        setEditMaintenanceView,
        rescheduleView,
        setRescheduleView,
        payMaintenanceView,
        setPayMaintenanceView,
        maintenanceQuotes,
        setMaintenanceQuotes,
        navigateParams,
        setNavigateParams,
      }}
    >
      {children}
    </MaintenanceContext.Provider>
  );
};