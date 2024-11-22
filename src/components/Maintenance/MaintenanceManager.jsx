import React, { useEffect, useState } from "react";
import { Typography, Box, Stack, Paper, Button, ThemeProvider, Grid, Tabs, Tab, Backdrop, CircularProgress, Container } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import { useLocation, useNavigate } from "react-router-dom";
import { useMediaQuery } from "@mui/material";
import theme from "../../theme/theme";
import MaintenanceStatusTable from "./MaintenanceStatusTable";
import MaintenanceRequestDetailNew from "./MaintenanceRequestDetailNew";
import SelectMonthComponent from "../SelectMonthComponent";
import SelectPropertyFilter from "../SelectPropertyFilter/SelectPropertyFilter";
import { useUser } from "../../contexts/UserContext";
import APIConfig from "../../utils/APIConfig";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import QuoteRequestForm from "./Manager/QuoteRequestForm";
import QuoteAcceptForm from "./Manager/QuoteAcceptForm";
import PayMaintenanceForm from "./Manager/PayMaintenanceForm";
import RescheduleMaintenance from "./Manager/RescheduleMaintenance";
import useSessionStorage from "./useSessionStorage";
import { useCookies } from "react-cookie";
import AddMaintenanceItem from "./AddMaintenanceItem";
import EditMaintenanceItem from "./EditMaintenanceItem";
import { gridColumnsTotalWidthSelector } from "@mui/x-data-grid";

import { useMaintenance } from "../../contexts/MaintenanceContext";

export async function maintenanceManagerDataCollectAndProcess(maintenanceData, setMaintenanceData, setShowSpinner, setDisplayMaintenanceData, profileId, selectedStatus,  setSelectedStatus, setMaintenanceItemsForStatus, setAllMaintenanceData) {
  // console.log('is it in maintenanceManagerDataCollectAndProcess----');
  const dataObject = {};
  
  function dedupeQuotes(array) {
    const mapping = {};
    const dedupeArray = [];

    for (const item of array) {
      if (!mapping[item.maintenance_request_uid]) {
        mapping[item.maintenance_request_uid] = [];
      }
      mapping[item.maintenance_request_uid].push(item);
    }

    for (const key in mapping) {
      if (mapping[key].length > 0) {
        const quotes = [];
        for (const item of mapping[key]) {
          const keys = Object.keys(item).filter((key) => key.startsWith("quote_"));
          const quoteObject = {};
          for (const key of keys) {
            quoteObject[key] = item[key];
          }
          quotes.push(quoteObject);
        }
        mapping[key][0].quotes = quotes;
        const keysToDelete = Object.keys(mapping[key][0]).filter((key) => key.startsWith("quote_"));
        keysToDelete.forEach((e) => delete mapping[key][0][e]);
        for (const keyToDelete in keysToDelete) {
          delete mapping[key][0][keyToDelete];
        }
        dedupeArray.push(mapping[key][0]);
      }
    }
    return dedupeArray;
  }

  const getMaintenanceData = async () => {
    setShowSpinner(true);
    // console.log('is it in getMaintenanceData----');
    const maintenanceRequests = await fetch(`${APIConfig.baseURL.dev}/maintenanceStatus/${profileId}`);
    const maintenanceRequestsData = await maintenanceRequests.json();

    let array1 = maintenanceRequestsData.result["NEW REQUEST"]?.maintenance_items;
    let array2 = 
      Array.isArray(maintenanceRequestsData.result["QUOTES REQUESTED"]?.maintenance_items) &&
      maintenanceRequestsData.result["QUOTES REQUESTED"].maintenance_items.length > 0
        ? dedupeQuotes(maintenanceRequestsData.result["QUOTES REQUESTED"].maintenance_items)
        : [];
    let array3 = maintenanceRequestsData.result["QUOTES ACCEPTED"]?.maintenance_items || [];
    let array4 = maintenanceRequestsData.result["SCHEDULED"]?.maintenance_items;
    let array5 = maintenanceRequestsData.result["COMPLETED"]?.maintenance_items;
    let array6 = maintenanceRequestsData.result["PAID"]?.maintenance_items || [];

    dataObject["NEW REQUEST"] = array1 || [];
    dataObject["QUOTES REQUESTED"] = array2 || [];
    dataObject["QUOTES ACCEPTED"] = array3 || [];
    dataObject["SCHEDULED"] = array4 || [];
    dataObject["COMPLETED"] = array5 || [];
    dataObject["PAID"] = array6 || [];

    await setMaintenanceData((prevData) => ({
      ...prevData,
      ...dataObject,
    }));
    await setDisplayMaintenanceData((prevData) => ({
      ...prevData,
      ...dataObject,
    }));

    // Determine the initial status based on the arrays
    const initialStatus = determineInitialStatus(array1, array2, array3, array4, array5, array6);
    if(selectedStatus === ''){
      setSelectedStatus(initialStatus);
      setMaintenanceItemsForStatus(dataObject[initialStatus]);
    } else {
      setMaintenanceItemsForStatus(dataObject[getKeyForSelectedStatus(selectedStatus)]);
    }
    // console.log('---what is set here---', maintenanceData);
    
    setAllMaintenanceData(dataObject);

    setShowSpinner(false);
  };

  getMaintenanceData();
}

// Function to determine the initial status based on non-empty arrays
function determineInitialStatus(array1, array2, array3, array4, array5, array6) {
  if (array1 && array1.length > 0) {
    return "NEW REQUEST";
  } else if (array2 && array2.length > 0) {
    return "QUOTES REQUESTED";
  } else if (array3 && array3.length > 0) {
    return "QUOTES ACCEPTED";
  } else if (array4 && array4.length > 0) {
    return "SCHEDULED";
  } else if (array5 && array5.length > 0) {
    return "COMPLETED";
  } else if (array6 && array6.length > 0) {
    return "PAID";
  } else {
    return "NEW REQUEST"; // Default to "NEW REQUEST" if all arrays are empty
  }
}

const getKeyForSelectedStatus = (status) => {
  if (status === "New Requests") {
    return "NEW REQUEST";
  } else if (status === "Quotes Requested") {
    return "QUOTES REQUESTED";
  } else if (status === "Quotes Accepted") {
    return "QUOTES ACCEPTED";
  } else if (status === "Scheduled") {
    return "SCHEDULED";
  } else if (status === "Completed") {
    return "COMPLETED";
  } else if (status === "Paid") {
    return "PAID";
  } else {
    return "NEW REQUEST"; // Default to "NEW REQUEST" if all arrays are empty
  }
}

export default function MaintenanceManager() {
  const location = useLocation();
  let navigate = useNavigate();
  const { user, getProfileId } = useUser();
  const [maintenanceData, setMaintenanceData] = useState({});
  const [displayMaintenanceData, setDisplayMaintenanceData] = useState([{}]);
  const [propertyId, setPropertyId] = useState("");
  const colorStatus = theme.colorStatusPMO;
  const [refresh, setRefresh] = useState(false || location.state?.refresh);

  const propertyIdFromPropertyDetail = location.state?.propertyId || null;
  const selectedProperty = location.state?.selectedProperty || null;

  const newDataObject = {};
  newDataObject["NEW REQUEST"] = [];
  newDataObject["QUOTES REQUESTED"] = [];
  newDataObject["QUOTES ACCEPTED"] = [];
  newDataObject["SCHEDULED"] = [];
  newDataObject["COMPLETED"] = [];
  newDataObject["PAID"] = [];

  const [showSelectMonth, setShowSelectMonth] = useState(false);
  const [showPropertyFilter, setShowPropertyFilter] = useState(false);
  const [month, setMonth] = useState(null);
  const [year, setYear] = useState(null);
  const [showSpinner, setShowSpinner] = useState(false);
  const [filterPropertyList, setFilterPropertyList] = useState([]);
  const [maintenanceItemQuotes, setMaintenanceItemQuotes] = useState([]);
  const [viewRHS, setViewRHS] = useState(false)

  const businessId = user.businesses.MAINTENANCE.business_uid;

  const { selectedRequestIndex, setSelectedRequestIndex, selectedStatus, setSelectedStatus, maintenanceItemsForStatus, setMaintenanceItemsForStatus, allMaintenanceData, setAllMaintenanceData } = useMaintenance();

  // console.log("selectedStatus - ", selectedStatus);

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [cookies] = useCookies(["selectedRole"]);
  const selectedRole = cookies.selectedRole;
  const { quoteRequestView, quoteAcceptView, rescheduleView, payMaintenanceView, editMaintenanceView } = useMaintenance();

  const [isAddingNewMaintenance, setIsAddingNewMaintenance] = useState(false);
  const [showNewMaintenance, setshowNewMaintenance] = useState(false);
 

  useEffect(() => {
    if (location.state?.showAddMaintenance) {
        setIsAddingNewMaintenance(true);
    }
  }, [location.state]);

  function navigateToAddMaintenanceItem() {
    // if (isMobile) {
    //   navigate("/addMaintenanceItem");
    // } else {
    //   setshowNewMaintenance(true);
    // }
    if(isMobile){
      setViewRHS(true)
    }
    setshowNewMaintenance(true);
  }

  useEffect(() => {
    if (maintenanceData) {
      console.log("maintenace data manager side --- ", maintenanceData)
      const propertyList = [];
      const addedAddresses = [];
      for (const key in maintenanceData) {
        for (const item of maintenanceData[key]) {
          if (!addedAddresses.includes(item.property_address)) {
            addedAddresses.push(item.property_address);
            if (!propertyList.includes(item.property_address)) {
              propertyList.push({
                property_uid: item.property_id,
                address: item.property_address + " " + item.property_unit,
                checked: true,
              });
            }
          }
        }
      }
      if (propertyIdFromPropertyDetail) {
        for (const property of propertyList) {
          if (property.property_uid !== propertyIdFromPropertyDetail) {
            property.checked = false;
          }
        }
      }

      if (selectedProperty === null || selectedProperty === undefined) {
        setFilterPropertyList(propertyList);
      } else {
        for (const property of propertyList) {
          if (property.property_uid !== selectedProperty.property_uid) {
            property.checked = false;
          }
        }
        setFilterPropertyList(propertyList);
      }
    }
  }, [maintenanceData]);

  function convertToStandardFormat(monthName, year) {
    const months = {
      January: "01",
      February: "02",
      March: "03",
      April: "04",
      May: "05",
      June: "06",
      July: "07",
      August: "08",
      September: "09",
      October: "10",
      November: "11",
      December: "12",
    };

    return `${year}-${months[monthName]}`;
  }

  function handleFilter(maintenanceArray, month, year, filterPropertyList) {
    // console.log(" -- DEBUG -- month, year, filter Property list - ", month, typeof year, filterPropertyList, maintenanceArray)

    var filteredArray = [];
    if (month && year) {
      const filterFormatDate = convertToStandardFormat(month, year);
      for (const item of maintenanceArray) {
        if (item.maintenance_request_created_date?.split("-")[0] === filterFormatDate?.split("-")[1] && item.maintenance_request_created_date?.split("-")[2] === filterFormatDate?.split("-")[0]) {
          filteredArray.push(item);
        }
      }
    } else if(!month && year){
      for (const item of maintenanceArray) {
        if (item.maintenance_request_created_date?.split("-")[2] === String(year)) {
          filteredArray.push(item);
        }
      }

    }else {
      filteredArray = maintenanceArray;
    }

    if (filterPropertyList?.length > 0) {
      filteredArray = filteredArray.filter((item) => {
        for (const filterItem of filterPropertyList) {
          if (filterItem.property_uid === item.property_id && filterItem.checked) {
            return true;
          }
        }
        return false;
      });
    }
    return filteredArray;
  }

  function displayFilterString(month, year) {
    if (month && year) {
      return month + " " + year;
    } else if(!month && year){
      return "All of " + year;
    } else {
      return "Last 30 Days";
    }
  }

  function displayPropertyFilterTitle(filterPropertyList) {
    var count = 0;
    for (const item of filterPropertyList) {
      if (item.checked) {
        count++;
      }
    }
    if (count === filterPropertyList.length) {
      return "All Properties";
    } else {
      return "Selected " + count + " Properties";
    }
  }

  function clearFilters() {
    setMonth(null);
    setYear(null);
    // setFilterPropertyList([]);
  }


  useEffect(() => {
    let profileId = getProfileId();
    maintenanceManagerDataCollectAndProcess(maintenanceData, setMaintenanceData, setShowSpinner, setDisplayMaintenanceData, profileId, selectedStatus, setSelectedStatus, setMaintenanceItemsForStatus, setAllMaintenanceData);
    setRefresh(false);
  }, [refresh]);

  useEffect(()=>{
    console.log(" -- inside useeffect to show data maintenanceData - ", maintenanceData, " - selectedstatus - ", selectedStatus, " - selected index - ", selectedRequestIndex)
  }, [maintenanceData, selectedStatus, allMaintenanceData, displayMaintenanceData])

  useEffect(() => {
    const handleMaintenanceUpdate = () => {
      let profileId = getProfileId();
      maintenanceManagerDataCollectAndProcess(maintenanceData, setMaintenanceData, setShowSpinner, setDisplayMaintenanceData, profileId, selectedStatus,  setSelectedStatus, setMaintenanceItemsForStatus, setAllMaintenanceData);
    };
  }, []);

  const handleRowClick = async (index, row) => {
    // if (isMobile) {
    //   navigate(`/maintenance/detail`, {
    //     state: {
    //       maintenance_request_index: index,
    //       status: row.maintenance_status,
    //       maintenanceItemsForStatus: maintenanceData[row.maintenance_status],
    //       allMaintenanceData: maintenanceData,
    //     },
    //   });
    // } else {
    //   await setSelectedRequestIndex(index);
    //   await setSelectedStatus(row.maintenance_status);
    //   setMaintenanceItemsForStatus(maintenanceData[row.maintenance_status]);
    //   setAllMaintenanceData(maintenanceData);

    // }
    // console.log("clicked on row - ", index, row, maintenanceData, newDataObject)
    await setSelectedRequestIndex(index);
    await setSelectedStatus(row.maintenance_status);
    setMaintenanceItemsForStatus(maintenanceData[row.maintenance_status]);
    setAllMaintenanceData(maintenanceData);
    if(isMobile){
      setViewRHS(true)
    }
  };
  
  const handleBackButton = () => {
    if (location.state && location.state.fromProperty === true) {
      const { fromProperty, index } = location.state;
      navigate("/properties", { state: { index } });
    } else {
      navigate(-1);
    }
  };
  
  return (
    <ThemeProvider theme={theme}>
      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
        <CircularProgress color='inherit' />
      </Backdrop>
      <Container maxWidth='lg' sx={{ paddingTop: "10px", paddingBottom: "50px" }}>
        <Grid container sx={{ padding: "10px" }}>
          {(!isMobile || !viewRHS) && (<Grid
            item
            xs={12}
            md={4}
            style={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              minHeight: "100vh",
            }}
          >
            <Paper
              style={{
                margin: "5px",
                backgroundColor: theme.palette.primary.main,
                width: "98%",
                paddingRight: isMobile ? "5px" : "10px",
                paddingTop: "10px",
                paddingBottom: "30px",
              }}
            >
              {/* back, maintenance and add icon */}
              <Stack
                direction='row'
                justifyContent='space-between'
                alignItems='center'
                sx={{
                  paddingBottom: "20px",
                  paddingLeft: "0px",
                  paddingRight: "0px",
                }}
              >
                {/* Back icon on left card */}
                <Box component='span' display='flex' justifyContent='flex-start' alignItems='flex-start' position='relative'>
                  <Button onClick={handleBackButton}>
                    <ArrowBackIcon
                      sx={{
                        color: theme.typography.common.blue,
                        fontSize: "30px",
                        margin: "5px",
                      }}
                    />
                  </Button>
                </Box>

                {/* Maintenance text */}
                <Box component='span' display='flex' justifyContent='center' alignItems='center' position='relative' flex={1}>
                  <Typography
                    sx={{
                      color: theme.typography.primary.black,
                      fontWeight: theme.typography.primary.fontWeight,
                      fontSize: theme.typography.largeFont,
                    }}
                  >
                    Maintenance
                  </Typography>
                </Box>

                {/* Add maintenance icon */}
                <Box position='relative' display='flex' justifyContent='flex-end' alignItems='center'>
                  <Button onClick={() => navigateToAddMaintenanceItem()} id='addMaintenanceButton'>
                    <AddIcon
                      sx={{
                        color: theme.typography.common.blue,
                        fontSize: "30px",
                        margin: "5px",
                      }}
                    />
                  </Button>
                </Box>
              </Stack>
              
              {/* calendar, property filter button*/}
              <Box component='span' m={2} display='flex' justifyContent='space-between' alignItems='center'>
                {/* calendar icon */}
                <Button sx={{ textTransform: "capitalize" }} onClick={() => setShowSelectMonth(true)}>
                  <CalendarTodayIcon
                    sx={{
                      color: theme.typography.common.blue,
                      fontWeight: theme.typography.common.fontWeight,
                      fontSize: theme.typography.smallFont,
                      margin: "5px",
                    }}
                  />
                  <Typography
                    sx={{
                      color: theme.typography.common.blue,
                      fontWeight: theme.typography.common.fontWeight,
                      fontSize: theme.typography.smallFont,
                    }}
                  >
                    {displayFilterString(month, year)}
                  </Typography>
                </Button>

                {/* property icon or filter */}
                <Button sx={{ textTransform: "capitalize" }} onClick={() => setShowPropertyFilter(true)}>
                  <HomeWorkIcon
                    sx={{
                      color: theme.typography.common.blue,
                      fontWeight: theme.typography.common.fontWeight,
                      fontSize: theme.typography.smallFont,
                      margin: "5px",
                    }}
                  />
                  <Typography
                    sx={{
                      color: theme.typography.common.blue,
                      fontWeight: theme.typography.common.fontWeight,
                      fontSize: theme.typography.smallFont,
                    }}
                  >
                    {displayPropertyFilterTitle(filterPropertyList)}
                  </Typography>
                </Button>
                
                {/* Month date select component */}
                <SelectMonthComponent
                  month={month}
                  showSelectMonth={showSelectMonth}
                  setShowSelectMonth={setShowSelectMonth}
                  setMonth={setMonth}
                  setYear={setYear}
                ></SelectMonthComponent>

                {/* property filter component */}
                <SelectPropertyFilter
                  showPropertyFilter={showPropertyFilter}
                  setShowPropertyFilter={setShowPropertyFilter}
                  filterList={filterPropertyList}
                  setFilterList={setFilterPropertyList}
                />
              </Box>

              {/* close icon or clear filter */}
              <Box component='span' m={2} display='flex' justifyContent='center' alignItems='center' position='relative'>
                <Typography
                  sx={{
                    color: theme.typography.common.blue,
                    fontWeight: theme.typography.common.fontWeight,
                    fontSize: theme.typography.smallFont,
                  }}
                >
                  {displayFilterString(month, year)}
                  {displayFilterString(month, year) === "Last 30 Days" ? null : (
                    <Button
                      onClick={() => clearFilters()}
                      sx={{
                        padding: "0px",
                        position: "absolute",
                        right: 0,
                        opacity: displayFilterString(month, year) === "Last 30 Days" ? 0 : 1,
                        pointerEvents: displayFilterString(month, year) === "Last 30 Days" ? "none" : "auto",
                      }}
                    >
                      <CloseIcon sx={{ color: theme.typography.common.blue, fontSize: "14px" }} />
                    </Button>
                  )}
                </Typography>
              </Box>

              {/* Maintenance table */}
              <div
                style={{
                  borderRadius: "20px",
                  margin: "10px",
                }}
              >
                {colorStatus.map((item, index) => {
                  let mappingKey = item.mapping;
                  let maintenanceArray = maintenanceData[mappingKey] || [];
                  
                  let filteredArray = handleFilter(maintenanceArray, month, year, filterPropertyList);

                  // for (const item of filteredArray) {
                  //   newDataObject[mappingKey].push(item);
                  // }
                  newDataObject[mappingKey] = filteredArray
                  

                  return (
                    <MaintenanceStatusTable
                      key={index}
                      status={item.status}
                      color={item.color}
                      maintenanceItemsForStatus={filteredArray}
                      allMaintenanceData={allMaintenanceData}
                      maintenanceRequestsCount={filteredArray}
                      onRowClick={handleRowClick}
                    />
                  );
                })}
              </div>
            </Paper>
          </Grid>)}
          
          {(!isMobile || viewRHS) && (<Grid item xs={12} md={8}>
              {editMaintenanceView && selectedRole === "MANAGER" ? (
                <EditMaintenanceItem setRefersh = {setRefresh}/>
              ) : showNewMaintenance || isAddingNewMaintenance ? (
                <AddMaintenanceItem setRefersh = {setRefresh} onBack={() => {setshowNewMaintenance(false); setIsAddingNewMaintenance(false); setViewRHS(false)}} />
              ) : quoteRequestView && selectedRole === "MANAGER" ? (
                <>
                  <QuoteRequestForm setRefresh = {setRefresh}/>
                </>
              ) : quoteAcceptView && selectedRole === "MANAGER" ? (
                <>
                  <QuoteAcceptForm  setRefresh = {setRefresh}/>
                </>
              ) : rescheduleView && selectedRole === "MANAGER" ? (
                <>
                  <RescheduleMaintenance setRefresh = {setRefresh}
                  />
                </>
              ) : payMaintenanceView && selectedRole === "MANAGER" ? (
                <>
                  <PayMaintenanceForm setRefresh = {setRefresh}
                    />
                </>
              ) : (
                Object.keys(maintenanceData).length > 0 && (
                  <MaintenanceRequestDetailNew
                    maintenance_request_index={selectedRequestIndex}
                    status={selectedStatus}
                    setViewRHS={setViewRHS}
                    maintenanceItemsForStatus={newDataObject[selectedStatus]}
                    allMaintenancefilteredData={newDataObject}
                    setRefresh = {setRefresh}
                  />
                )
              )}
          </Grid>)}
          {/* {!isMobile && (
            <Grid item xs={12} md={8}>
              {editMaintenanceView && selectedRole === "MANAGER" ? (
                <EditMaintenanceItem setRefersh = {setRefresh}/>
              ) : showNewMaintenance || isAddingNewMaintenance ? (
                <AddMaintenanceItem setRefersh = {setRefresh} onBack={() => {setshowNewMaintenance(false); setIsAddingNewMaintenance(false);}} />
              ) : quoteRequestView && selectedRole === "MANAGER" ? (
                <>
                  <QuoteRequestForm setRefresh = {setRefresh}/>
                </>
              ) : quoteAcceptView && selectedRole === "MANAGER" ? (
                <>
                  <QuoteAcceptForm  setRefresh = {setRefresh}/>
                </>
              ) : rescheduleView && selectedRole === "MANAGER" ? (
                <>
                  <RescheduleMaintenance setRefresh = {setRefresh}
                  />
                </>
              ) : payMaintenanceView && selectedRole === "MANAGER" ? (
                <>
                  <PayMaintenanceForm setRefresh = {setRefresh}
                    />
                </>
              ) : (
                Object.keys(maintenanceData).length > 0 && (
                  <MaintenanceRequestDetailNew
                    maintenance_request_index={selectedRequestIndex}
                    status={selectedStatus}
                    maintenanceItemsForStatus={maintenanceData[selectedStatus]}
                    allMaintenancefilteredData={newDataObject}
                    setRefresh = {setRefresh}
                  />
                )
              )}
            </Grid>
          )} */}
        </Grid>
      </Container>
    </ThemeProvider>
  );
}
