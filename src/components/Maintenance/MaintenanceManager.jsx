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

export async function maintenanceManagerDataCollectAndProcess(maintenanceData, setMaintenanceData, setShowSpinner, setDisplayMaintenanceData, profileId, setSelectedStatus, setMaintenanceItemsForStatus, setAllMaintenanceData) {
  
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
    setSelectedStatus(initialStatus);
    // console.log('---what is set here---', maintenanceData);
    setMaintenanceItemsForStatus(dataObject[initialStatus]);
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

  const businessId = user.businesses.MAINTENANCE.business_uid;

  const { selectedRequestIndex, setSelectedRequestIndex, selectedStatus, setSelectedStatus, maintenanceItemsForStatus, setMaintenanceItemsForStatus, allMaintenanceData, setAllMaintenanceData } = useMaintenance();

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
    if (isMobile) {
      navigate("/addMaintenanceItem");
    } else {
      setshowNewMaintenance(true);
    }
  }

  useEffect(() => {
    if (maintenanceData) {
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
    var filteredArray = [];
    if (month && year) {
      const filterFormatDate = convertToStandardFormat(month, year);
      for (const item of maintenanceArray) {
        if (item.maintenance_request_created_date.startsWith(filterFormatDate)) {
          filteredArray.push(item);
        }
      }
    } else {
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
    setFilterPropertyList([]);
  }

  useEffect(() => {
    let profileId = getProfileId();
    maintenanceManagerDataCollectAndProcess(maintenanceData, setMaintenanceData, setShowSpinner, setDisplayMaintenanceData, profileId, setSelectedStatus, setMaintenanceItemsForStatus, setAllMaintenanceData);
    setRefresh(false);
  }, [refresh]);

  useEffect(() => {
    const handleMaintenanceUpdate = () => {
      let profileId = getProfileId();
      maintenanceManagerDataCollectAndProcess(maintenanceData, setMaintenanceData, setShowSpinner, setDisplayMaintenanceData, profileId, setSelectedStatus, setMaintenanceItemsForStatus, setAllMaintenanceData);
    };
  }, []);

  const handleRowClick = async (index, row) => {
    console.log('is it coming here');
    if (isMobile) {
      navigate(`/maintenance/detail`, {
        state: {
          maintenance_request_index: index,
          status: row.maintenance_status,
          maintenanceItemsForStatus: maintenanceData[row.maintenance_status],
          allMaintenanceData: maintenanceData,
        },
      });
    } else {
      await setSelectedRequestIndex(index);
      await setSelectedStatus(row.maintenance_status);
      setMaintenanceItemsForStatus(maintenanceData[row.maintenance_status]);
      setAllMaintenanceData(maintenanceData);

    }
  };
  
  const handleBackButton = () => {
    if (location.state && location.state.fromProperty === true) {
      const { fromProperty, index } = location.state;
      navigate("/propertiesPM", { state: { index } });
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
          <Grid
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
                width: "95%",
                paddingTop: "10px",
                paddingBottom: "30px",
              }}
            >
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
              <Box component='span' m={2} display='flex' justifyContent='space-between' alignItems='center'>
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

                <SelectMonthComponent
                  month={month}
                  showSelectMonth={showSelectMonth}
                  setShowSelectMonth={setShowSelectMonth}
                  setMonth={setMonth}
                  setYear={setYear}
                ></SelectMonthComponent>
                <SelectPropertyFilter
                  showPropertyFilter={showPropertyFilter}
                  setShowPropertyFilter={setShowPropertyFilter}
                  filterList={filterPropertyList}
                  setFilterList={setFilterPropertyList}
                />
              </Box>
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
                  
                  for (const item of filteredArray) {
                    newDataObject[mappingKey].push(item);
                  }
                  

                  return (
                    <MaintenanceStatusTable
                      key={index}
                      status={item.status}
                      color={item.color}
                      maintenanceItemsForStatus={filteredArray}
                      allMaintenanceData={newDataObject}
                      maintenanceRequestsCount={filteredArray}
                      onRowClick={handleRowClick}
                    />
                  );
                })}
              </div>
            </Paper>
          </Grid>

          {!isMobile && (
            <Grid item xs={12} md={8}>
              {editMaintenanceView && selectedRole === "MANAGER" ? (
                <EditMaintenanceItem />
              ) : showNewMaintenance || isAddingNewMaintenance ? (
                <AddMaintenanceItem onBack={() => {setshowNewMaintenance(false); setIsAddingNewMaintenance(false);}} />
              ) : quoteRequestView && selectedRole === "MANAGER" ? (
                <>
                  <QuoteRequestForm />
                </>
              ) : quoteAcceptView && selectedRole === "MANAGER" ? (
                <>
                  <QuoteAcceptForm  />
                </>
              ) : rescheduleView && selectedRole === "MANAGER" ? (
                <>
                  <RescheduleMaintenance
                  />
                </>
              ) : payMaintenanceView && selectedRole === "MANAGER" ? (
                <>
                  <PayMaintenanceForm
                    maintenanceItem={JSON.parse(sessionStorage.getItem("maintenanceItem"))}
                    navigateParams={JSON.parse(sessionStorage.getItem("navigateParams"))}
                  />
                </>
              ) : (
                Object.keys(maintenanceData).length > 0 && (
                  <MaintenanceRequestDetailNew
                    maintenance_request_index={selectedRequestIndex}
                    status={selectedStatus}
                    maintenanceItemsForStatus={maintenanceData[selectedStatus]}
                    allMaintenancefilteredData={newDataObject}
                  />
                )
              )}
            </Grid>
          )}
        </Grid>
      </Container>
    </ThemeProvider>
  );
}
