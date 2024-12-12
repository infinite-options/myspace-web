import React, { createContext, useContext, useState } from 'react';

const MaintenanceContext = createContext();

export const useMaintenance = () => useContext(MaintenanceContext);

export const MaintenanceProvider = ({ children }) => {
  const [maintenanceData, setMaintenanceData] = useState({});
  const [selectedRequestIndex, setSelectedRequestIndex] = useState(0);
  const [selectedMaintenanceID, setSelectedMaintenanceID] = useState("");
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  // const [selectedStatus, setSelectedStatus] = useState('NEW REQUEST');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [maintenanceItemsForStatus, setMaintenanceItemsForStatus] = useState([]);
  const [allMaintenanceData, setAllMaintenanceData] = useState({});
  const [quoteRequestView, setQuoteRequestView] = useState(false);
  const [quoteRequestEditView, setQuoteRequestEditView] = useState(false);
  const [quoteAcceptView, setQuoteAcceptView] = useState(false);
  const [editMaintenanceView, setEditMaintenanceView] = useState(false);
  const [rescheduleView, setRescheduleView] = useState(false);
  const [payMaintenanceView, setPayMaintenanceView] = useState(false);
  const [maintenanceQuotes, setMaintenanceQuotes] = useState([]);
  const [navigateParams, setNavigateParams] = useState({});

  // New states that replace sessionStorage for other details
  const [testIssue, setTestIssue] = useState('');
  const [testProperty, setTestProperty] = useState('');
  const [testIssueItem, setTestIssueItem] = useState('');
  const [testCost, setTestCost] = useState('');
  const [testTitle, setTestTitle] = useState('');
  const [testPriority, setTestPriority] = useState('');
  const [completionStatus, setCompletionStatus] = useState('');
  const [requestUid, setRequestUid] = useState('');
  const [propID, setPropID] = useState('');
  const [maintainanceImages, setMaintainanceImages] = useState([]);
  const [maintainanceFavImage, setMaintainanceFavImage] = useState('');
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  return (
    <MaintenanceContext.Provider
      value={{
        maintenanceData,
        setMaintenanceData,
        selectedRequestIndex,
        setSelectedRequestIndex,
        selectedMaintenanceID, 
        setSelectedMaintenanceID,
        currentQuoteIndex,
        setCurrentQuoteIndex,
        selectedStatus,
        setSelectedStatus,
        maintenanceItemsForStatus,
        setMaintenanceItemsForStatus,
        allMaintenanceData,
        setAllMaintenanceData,
        quoteRequestView,
        setQuoteRequestView,
        quoteRequestEditView,
        setQuoteRequestEditView,
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
        testIssue,
        setTestIssue,
        testProperty,
        setTestProperty,
        testIssueItem,
        setTestIssueItem,
        testCost,
        setTestCost,
        testTitle,
        setTestTitle,
        testPriority,
        setTestPriority,
        completionStatus,
        setCompletionStatus,
        requestUid,
        setRequestUid,
        propID,
        setPropID,
        maintainanceImages,
        setMaintainanceImages,
        maintainanceFavImage,
        setMaintainanceFavImage,
        month,
        setMonth,
        year,
        setYear,
      }}
    >
      {children}
    </MaintenanceContext.Provider>
  );
};