import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Stack,
  Paper,
  Button,
  ThemeProvider,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Backdrop,
  CircularProgress,
  Container,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
import QuoteRequestForm from "./Manager/QuoteRequestForm";
import QuoteAcceptForm from "./Manager/QuoteAcceptForm";
import PayMaintenanceForm from "./Manager/PayMaintenanceForm";
import RescheduleMaintenance from "./Manager/RescheduleMaintenance";
import useSessionStorage from "./useSessionStorage";
import { useCookies, Cookies } from "react-cookie";
import AddMaintenanceItem from "./AddMaintenanceItem";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditMaintenanceItem from "./EditMaintenanceItem";
import { useMaintenance } from "../../contexts/MaintenanceContext";
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../utils/httpMiddleware";

export async function maintenanceOwnerDataCollectAndProcess(setMaintenanceData, setShowSpinner, profileId, setSelectedStatus, setMaintenanceItemsForStatus, setAllMaintenanceData) {
  const dataObject = {};

  const getMaintenanceData = async () => {
    setShowSpinner(true);
    const maintenanceRequests = await fetch(`${APIConfig.baseURL.dev}/maintenanceStatus/${profileId}`);
    const maintenanceRequestsData = await maintenanceRequests.json();

    let array1 = maintenanceRequestsData.result["NEW REQUEST"]?.maintenance_items;
    let array2 = maintenanceRequestsData.result["INFO REQUESTED"]?.maintenance_items;
    let array3 = maintenanceRequestsData.result["PROCESSING"]?.maintenance_items;
    let array4 = maintenanceRequestsData.result["SCHEDULED"]?.maintenance_items;
    let array5 = maintenanceRequestsData.result["COMPLETED"]?.maintenance_items;
    let array6 = maintenanceRequestsData.result["CANCELLED"]?.maintenance_items;

    dataObject["NEW REQUEST"] = [];
    dataObject["INFO REQUESTED"] = [];
    dataObject["PROCESSING"] = [];
    dataObject["SCHEDULED"] = [];
    dataObject["COMPLETED"] = [];
    dataObject["CANCELLED"] = [];

    for (const item of array1) {
      dataObject["NEW REQUEST"].push(item);
    }
    for (const item of array2) {
      dataObject["INFO REQUESTED"].push(item);
    }
    for (const item of array3) {
      dataObject["PROCESSING"].push(item);
    }
    for (const item of array4) {
      dataObject["SCHEDULED"].push(item);
    }
    for (const item of array5) {
      dataObject["COMPLETED"].push(item);
    }
    for (const item of array6) {
      dataObject["CANCELLED"].push(item);
    }

    await setMaintenanceData((prevData) => ({
      ...prevData,
      ...dataObject,
    }));

    const initialStatus = determineInitialStatus(array1, array2, array3, array4, array5, array6);
    setSelectedStatus(initialStatus);
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
    return "INFO REQUESTED";
  } else if (array3 && array3.length > 0) {
    return "PROCESSING";
  } else if (array4 && array4.length > 0) {
    return "SCHEDULED";
  } else if (array5 && array5.length > 0) {
    return "COMPLETED";
  } else if (array6 && array6.length > 0) {
    return "CANCELLED";
  } else {
    return "NEW REQUEST"; // Default to "NEW REQUEST" if all arrays are empty
  }
}

export function MaintenanceOwner() {
  const location = useLocation();
  let navigate = useNavigate();
  const { user, getProfileId } = useUser();
  const [maintenanceData, setMaintenanceData] = useState({});
  const [propertyId, setPropertyId] = useState("200-000029");
  const colorStatus = theme.colorStatusO;

  const [refresh, setRefresh] = useState(false || location.state?.refresh);
  const [showSelectMonth, setShowSelectMonth] = useState(false);
  const [showPropertyFilter, setShowPropertyFilter] = useState(false);
  const [month, setMonth] = useState(null);
  const [year, setYear] = useState(null);
  const [showSpinner, setShowSpinner] = useState(false);
  const [filterPropertyList, setFilterPropertyList] = useState([]);
  const [viewRHS, setViewRHS] = useState(false)

  // const [selectedRequestIndex, setSelectedRequestIndex] = useState(0);
  // const [selectedStatus, setSelectedStatus] = useState("NEW REQUEST");

  const businessId = user.businesses.MAINTENANCE.business_uid;
  const propertyIdFromPropertyDetail = location.state?.propertyId || null;
  let profileId = getProfileId();

  const { selectedRequestIndex, setSelectedRequestIndex, selectedStatus, setSelectedStatus, maintenanceItemsForStatus, setMaintenanceItemsForStatus, allMaintenanceData, setAllMaintenanceData } = useMaintenance();
  const { quoteRequestView, quoteAcceptView, rescheduleView, payMaintenanceView, editMaintenanceView } = useMaintenance();


  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [cookies] = useCookies(["selectedRole"]);
  const selectedRole = cookies.selectedRole;
  const selectedProperty = location.state?.selectedProperty || null;

  // const [desktopView] = useSessionStorage("desktopView", false);
  // const [quoteAcceptView] = useSessionStorage("quoteAcceptView", false);
  // const [rescheduleView] = useSessionStorage("rescheduleView", false);
  // const [payMaintenanceView] = useSessionStorage("payMaintenanceView", false);
  // const [editMaintenanceView] = useSessionStorage("editMaintenanceView", false);
  const [showNewMaintenance, setshowNewMaintenance] = useState(location.state?.showAddMaintenance ? location.state?.showAddMaintenance :false);

  const newDataObject = {};
  newDataObject["NEW REQUEST"] = [];
  newDataObject["INFO REQUESTED"] = [];
  newDataObject["PROCESSING"] = [];
  newDataObject["SCHEDULED"] = [];
  newDataObject["COMPLETED"] = [];
  newDataObject["CANCELLED"] = [];

  function navigateToAddMaintenanceItem() {
    // if (isMobile) {
    //   navigate("/addMaintenanceItem", { state: { month, year, propertyId } });
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
      const propertyList = [];
      const addedAddresses = [];
      console.log("maintenace data owner side --- ", maintenanceData)
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

      // setFilterPropertyList(propertyList);
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
    // var filteredArray = [];

    // if (month && year) {
    //   const filterFormatDate = convertToStandardFormat(month, year);
    //   for (const item of maintenanceArray) {
    //     if (item.maintenance_request_created_date.startsWith(filterFormatDate)) {
    //       filteredArray.push(item);
    //     }
    //   }
    // } else {
    //   filteredArray = maintenanceArray;
    // }

    // if (filterPropertyList?.length > 0) {
    //   filteredArray = filteredArray.filter((item) => {
    //     for (const filterItem of filterPropertyList) {
    //       if (filterItem.property_uid === item.property_id && filterItem.checked) {
    //         return true;
    //       }
    //     }
    //     return false;
    //   });
    // }

    // return filteredArray;
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
    } else {
      return "Last 30 Days";
    }
  }

  function displayPropertyFilterTitle(filterPropertyList) {
    var count = 0;
    var displayList = [];
    for (const item of filterPropertyList) {
      if (item.checked) {
        count++;
        displayList.push(item.address);
      }
    }
    if (count === filterPropertyList.length) {
      return "All Properties";
    } else if (count < 3) {
      return displayList.join(", ");
    } else {
      return "Selected " + count + " Properties";
    }
  }

  function clearFilters() {
    setMonth(null);
    setYear(null);
    setFilterPropertyList([]);
  }

  // useEffect(() => {
  //   maintenanceOwnerDataCollectAndProcess(setMaintenanceData, setShowSpinner, profileId, setSelectedStatus, setMaintenanceItemsForStatus, setAllMaintenanceData);
  // }, []);

  useEffect(() => {
    let profileId = getProfileId();
    maintenanceOwnerDataCollectAndProcess(setMaintenanceData, setShowSpinner, profileId, setSelectedStatus, setMaintenanceItemsForStatus, setAllMaintenanceData);
    setRefresh(false);
  }, [refresh]);

  useEffect(() => {
    const handleMaintenanceUpdate = () => {
      // Using a closure to capture the current profileId when the effect runs
      const currentProfileId = profileId;
      maintenanceOwnerDataCollectAndProcess(setMaintenanceData, setShowSpinner, currentProfileId, setSelectedStatus, setMaintenanceItemsForStatus, setAllMaintenanceData);
    };

  }, []); // Empty dependency array ensures this runs only once when the component mounts

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
    //   // Save data to session storage

    //   await setSelectedRequestIndex(index);
    //   await setSelectedStatus(row.maintenance_status);
    //   setMaintenanceItemsForStatus(maintenanceData[row.maintenance_status]);
    //   setAllMaintenanceData(maintenanceData);

    // }
    // console.log("clicked on row - ", index, row, maintenanceData, newDataObject)
    
    await setSelectedRequestIndex(index);
    await setSelectedStatus(row.maintenance_status);
    await setMaintenanceItemsForStatus(maintenanceData[row.maintenance_status]);
    await setAllMaintenanceData(maintenanceData);
    if(isMobile){
      setViewRHS(true)
    }

  };

  const handleBackButton = () => {
    if (location.state && location.state.fromProperty === true) {
      const { fromProperty, index } = location.state;
      // navigate('/properties', { state: { index } }); - PM CHanged
      navigate("/properties", { state: { index } });
    } else {
      navigate(-1); // Fallback to default behavior if onBack is not provided
    }
  };

  return (
    <ThemeProvider theme={theme}>
      {showSpinner ? (
        <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={true}>
          <CircularProgress color='inherit' />
        </Backdrop>
      ): (
      <Container maxWidth='lg' sx={{ paddingTop: "10px", paddingBottom: "50px" }}>
        <Grid container sx={{ padding: "10px", flex:1 }} spacing={4}>
          {(!isMobile || !viewRHS) && (<Grid
            item
            xs={12}
            md={5}
            sx={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              minHeight: "100vh",
            }}
          >
            <Paper
                sx={{
                  // margin: "5px",
                  backgroundColor: theme.palette.primary.main,
                  width: "98%",
                  marginRight: isMobile ? "5px" : "10px",
                  // paddingTop: "10px",
                  // paddingBottom: "30px",
                  borderRadius: "10px",
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
                          color: "#160449",
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
                          color: "#160449",
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

                <div
                  style={{
                    borderRadius: "10px",

                    margin: "20px",
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
          
          {(!isMobile || viewRHS) && (<Grid item xs={12} md={7}>
              {editMaintenanceView && selectedRole === "OWNER" ? (
                <EditMaintenanceItem setRefersh = {setRefresh} />
              ) : showNewMaintenance && selectedRole === "OWNER" ? (
                <AddMaintenanceItem setRefersh = {setRefresh}  onBack={() => {setshowNewMaintenance(false); setViewRHS(false)}} />
              ) : quoteRequestView && selectedRole === "OWNER" ? (
                <>
                  <QuoteRequestForm setRefresh = {setRefresh}/>
                </>
              ) : quoteAcceptView && selectedRole === "OWNER" ? (
                <>
                  <QuoteAcceptForm setRefresh = {setRefresh}/>
                </>
              ) : rescheduleView && selectedRole === "OWNER" ? (
                <>
                  <RescheduleMaintenance setRefresh = {setRefresh}
                  />
                </>
              ) : payMaintenanceView && selectedRole === "OWNER" ? (
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
            <Grid item xs={7}>
              {editMaintenanceView && selectedRole === "OWNER" ? (
                <EditMaintenanceItem setRefersh = {setRefresh} />
              ) : showNewMaintenance && selectedRole === "OWNER" ? (
                <AddMaintenanceItem setRefersh = {setRefresh}  onBack={() => setshowNewMaintenance(false)} />
              ) : quoteRequestView && selectedRole === "OWNER" ? (
                <>
                  <QuoteRequestForm setRefresh = {setRefresh}/>
                </>
              ) : quoteAcceptView && selectedRole === "OWNER" ? (
                <>
                  <QuoteAcceptForm setRefresh = {setRefresh}/>
                </>
              ) : rescheduleView && selectedRole === "OWNER" ? (
                <>
                  <RescheduleMaintenance setRefresh = {setRefresh}
                  />
                </>
              ) : payMaintenanceView && selectedRole === "OWNER" ? (
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
      </Container>)}
    </ThemeProvider>
  );
}
