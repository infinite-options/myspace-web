import {
  Button,
  Box,
  ThemeProvider,
  Grid,
  Paper,
  Stack,
  Typography,
  Container,
  Backdrop,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import { ReactComponent as HomeIcon } from "../../images/home_icon.svg";
import { ReactComponent as CalendarIcon } from "../../images/calendar_icon.svg";
import { useMediaQuery } from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import theme from "../../theme/theme";
import { useUser } from "../../contexts/UserContext";
import APIConfig from "../../utils/APIConfig";
import Chart from "react-apexcharts";
import WorkerMaintenanceStatusTable from "../Maintenance/Worker/WorkerMaintenanceStatusTable";
import { format, isEqual, isAfter, parseISO, set } from "date-fns";
import useSessionStorage from "../Maintenance/useSessionStorage";
import WorkerMaintenanceRequestDetail from "../Maintenance/Worker/WorkerMaintenanceRequestDetail";
import { useLocation } from "react-router-dom";
import SelectMonthComponent from "../SelectMonthComponent";
import SelectPropertyFilter from "../SelectPropertyFilter/SelectPropertyFilter";
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../utils/httpMiddleware";

export default function MaintenanceDashboard2() {
  const location = useLocation();
  const { user, getProfileId, selectedRole } = useUser();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [showSpinner, setShowSpinner] = useState(false);
  const [maintenanceRequests, setMaintenanceRequests] = useState({});
  const [maintenanceStatusRequests, setMaintenanceStatusRequests] = useState({});
  const [graphData, setGraphData] = useState([]);
  const [cashflowData, setcashflowData] = useState([]);
  const [revenueData, setrevenueData] = useState([]);
  const [todayData, settodayData] = useState([]);
  const [nextScheduleData, setnextScheduleData] = useState([]);

  const [workerMaintenanceView, setWorkerMaintenanceView] = useState(false);
  const [showMaintenanceDetail, setShowMaintenanceDetail] = useState(workerMaintenanceView);

  const [sessionData, setSessionData] = useState({
    maintenance_request_index: null,
    propstatus: null,
    propmaintenanceItemsForStatus: null,
    alldata: null,
    maintenance_request_uid: null,
  });

  let dataLoaded = false;
  const [userState, setUserState] = useState(user);
  const prevUserStateRef = useRef();

  let dashboard_id = getProfileId();
  if (selectedRole === "MAINT_EMPLOYEE") dashboard_id = user.businesses?.MAINTENANCE?.business_uid || user?.maint_supervisor;

  const getMaintenanceData = async () => {
    if (dashboard_id == null) {
      return;
    }

    if (getProfileId() != null) {
      setShowSpinner(true);

      const response = await fetch(`${APIConfig.baseURL.dev}/dashboard/${dashboard_id}`);
      // const response = await fetch(`${APIConfig.baseURL.dev}/dashboard/600-000012`);
      const data = await response.json();

      const statusresponse = await fetch(`${APIConfig.baseURL.dev}/maintenanceStatus/${dashboard_id}`);
      //const response = await fetch(`${APIConfig.baseURL.dev}/maintenanceStatus/600-000012`);
      const statusdata = await statusresponse.json();

      const currentActivities = data.currentActivities?.result ?? [];
      const CurrentQuotes = data.currentQuotes?.result ?? [];

      const currentgraphData = [
        {
          "Quotes Requested": [],
          "Quotes Submitted": [],
          "Quotes Accepted": [],
          Scheduled: [],
          Finished: [],
          Paid: [],
        },
      ];
      currentActivities
        .map((item) => {
          const statusMapping = theme.colorStatusMM.find((statusObj) => statusObj.mapping === item.maintenance_status);
          if (statusMapping) {
            currentgraphData[0][statusMapping.status].push({
              value: item.num,
              label: statusMapping.status,
              color: statusMapping.color,
            });
          }
          return null;
        })
        .filter((item) => item !== null);

      const maintainance_info = {
        REQUESTED: [],
        SUBMITTED: [],
        ACCEPTED: [],
        SCHEDULED: [],
        FINISHED: [],
        PAID: [],
      };

      currentActivities.forEach((item) => {
        const status = item.maintenance_status;
        if (maintainance_info[status]) {
          const maintenanceInfo = JSON.parse(item.maintenance_request_info);
          const mergedItems = maintenanceInfo.map((info) => ({
            maintenance_status: status,
            ...info,
          }));
          maintainance_info[status].push(...mergedItems);
        }
      });

      await setMaintenanceRequests(maintainance_info);
      await setMaintenanceStatusRequests(statusdata);

      const today = new Date().toISOString().split("T")[0];

      const parseDate = (dateString) => {
        const [month, day, year] = dateString.split("-");
        return `${year}-${month}-${day}`;
      };
      // Filter the data
      const currentDateData = maintainance_info.SCHEDULED.filter((item) => parseDate(item.maintenance_scheduled_date) === today);

      let filteredTodayData = [];
      let filteredData = [];

      if (currentDateData.length > 0) {
        filteredTodayData = currentDateData;
      } else {
        filteredData = maintainance_info.SCHEDULED.filter((item) => {
          return isAfter(parseISO(parseDate(item.maintenance_scheduled_date)), parseISO(today));
        }).sort((a, b) => new Date(parseDate(a.maintenance_scheduled_date)) - new Date(parseDate(b.maintenance_scheduled_date)));
      }

      const fixedOrder = [
        { label: "Quotes Requested", color: "#DB9687" },
        { label: "Quotes Submitted", color: "#CEA892" },
        { label: "Quotes Accepted", color: "#BAAC7A" },
        { label: "Scheduled", color: "#D4C28D" },
        { label: "Finished", color: "#598A96" },
        { label: "Paid", color: "#6B8E23" },
      ];

      const sortedData = fixedOrder.map((status) => {
        const statusData = currentgraphData[0][status.label];
        return statusData.length > 0 ? statusData[0] : { value: 0, label: status.label, color: status.color }; // default color if no data
      });
      await setGraphData(sortedData);
      await setcashflowData(currentActivities);
      await setrevenueData(CurrentQuotes);
      await settodayData(filteredTodayData);
      await setnextScheduleData(filteredData);
      setShowSpinner(false);
      dataLoaded = true;
    }
  };

  const emp_verification = async () => {
    try {
      const response = await fetch(`${APIConfig.baseURL.dev}/profile/${getProfileId()}`);
      // const response = await fetch(`${APIConfig.baseURL.dev}/profile/600-000003`);
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      const employee = data?.profile?.result[0]; // Assuming there's only one employee
      //   console.log("employee?.employee_verification - ", employee?.employee_verification)
      if (employee?.employee_verification == null) {
        navigate("/emp_waiting");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // useEffect(() => {
  // 	console.log('location.state?.key useeffect----');
  // 	if (location.state?.key || !location.state) {
  // 		if (selectedRole === "MAINT_EMPLOYEE" && getProfileId() != null) {
  // 			emp_verification();
  // 			setShowSpinner(false);
  // 		}
  // 		console.log('key is it in useeffect if----', location.state?.key );
  // 		getMaintenanceData(); // Fetch data on navigation
  // 	}
  // }, [location.state?.key]); // The effect will trigger when `key` changes or if location.state is empty

  useEffect(() => {
    setShowSpinner(true);
    if (selectedRole === "MAINT_EMPLOYEE" && getProfileId() != null) {
      emp_verification();
    }
    getMaintenanceData();
    setShowSpinner(false);
  }, []);

  // useEffect(() => {
  // 	prevUserStateRef.current = userState;
  // }, [userState]);

  useEffect(() => {
    setUserState(user);
  }, [user]);

  useEffect(() => {
    // console.log("dataLoaded - ", dataLoaded);
    // console.log("user - ", user);
    if (prevUserStateRef.current !== userState) {
      prevUserStateRef.current = userState;
      // console.log("User state has deeply changed:", userState);
      if (dataLoaded === false) {
        setShowSpinner(true);
        if (selectedRole === "MAINT_EMPLOYEE") dashboard_id = user.businesses?.MAINTENANCE?.business_uid || user?.maint_supervisor;
        if (selectedRole === "MAINT_EMPLOYEE" && getProfileId() != null) {
          emp_verification();
          setShowSpinner(false);
        }

        getMaintenanceData();
      }
    }
  }, [userState]);

  const handleWorkerMaintenanceRequestSelected = (maintenance_request_index, propstatus, propmaintenanceItemsForStatus, alldata, maintenance_request_uid) => {
    console.log( " === calling itemof status, all data - ", propmaintenanceItemsForStatus, alldata)
    setSessionData({
      maintenance_request_index,
      propstatus,
      propmaintenanceItemsForStatus,
      alldata,
      maintenance_request_uid,
    });
    setShowMaintenanceDetail(true);
  };

  useEffect(()=>{
    console.log(" session data after refresh - ", sessionData)
  }, [sessionData])

  const refreshMaintenanceData = () => {
    getMaintenanceData();
    // setShowMaintenanceDetail(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
        <CircularProgress color='inherit' />
      </Backdrop>
      <Container maxWidth='lg' sx={{ paddingTop: "10px", paddingBottom: "50px" }}>
        <Grid container rowSpacing={2} columnSpacing={10}>
          <Grid item xs={12}>
            <Box
              sx={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                justifyContent: isMobile ? "center" : "left",
                paddingLeft: "10px",
                paddingRight: "10px",
                alignText: "center",
                alignContent: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: "22px", sm: "28px", md: "32px" },
                  fontWeight: "600",
                }}
              >
                Welcome, {user.first_name}.
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <WorkOrdersWidget
              maintenanceRequests={maintenanceRequests}
              todayData={todayData}
              nextScheduleData={nextScheduleData}
              allMaintenanceStatusData={maintenanceStatusRequests}
              onSelectRequest={handleWorkerMaintenanceRequestSelected}
              setSessionData = {setSessionData}
              showMaintenanceDetail={showMaintenanceDetail}
            />
          </Grid>

          {showMaintenanceDetail ? (
            <Grid item xs={12} md={8} columnSpacing={6} sx={{ position: "relative" }}>
              <WorkerMaintenanceRequestDetail
                maintenance_request_index={sessionData.maintenance_request_index}
                propstatus={sessionData.propstatus}
                propmaintenanceItemsForStatus={sessionData.propmaintenanceItemsForStatus}
                alldata={sessionData.alldata}
                maintenance_request_uid={sessionData.maintenance_request_uid}
                setShowMaintenanceDetail={setShowMaintenanceDetail}
                refreshMaintenanceData={refreshMaintenanceData}
              />
            </Grid>
          ) : (
            <>
              {/* <Grid item xs={12} md={8} columnSpacing={6} rowGap={4} sx={{ position: "relative" }}> */}
              <Grid item xs={12} md={8} columnSpacing={6} rowGap={4}>
                <Grid item xs={12} sx={{ backgroundColor: "#F2F2F2", borderRadius: "10px", height: "400px" }}>
                  <Stack direction='row' justifyContent='center' width='100%' sx={{ marginBottom: "15px", marginTop: "0px" }}>
                    <Typography variant='h5' sx={{ fontWeight: "bold", color: "#160449", marginTop: "20px" }}>
                      Current Activity
                    </Typography>
                  </Stack>
                  <Grid
                    container
                    sx={{
                      display: "flex",
                      flexDirection: isMobile ? "column" : "row", // Switch layout direction based on screen size
                      justifyContent: "space-between",
                    }}
                    rowSpacing={isMobile ? 30 : 200} // Add spacing between rows in mobile
                    columnSpacing={isMobile ? 0 : 10} // Remove column spacing in mobile
                  >
                    <Grid item xs={12} md={6} sx={{ marginBottom: "0px", marginTop: "0px" }}>
                      <RadialBarChart data={graphData} />
                    </Grid>
                    {!isMobile && (
                      <Grid item xs={12} md={6} sx={{ marginBottom: "15px", marginTop: "25px" }}>
                        <MaintenanceCashflowWidget data={cashflowData} />
                      </Grid>
                    )}
                  </Grid>
                </Grid>
                {isMobile && (
                  <Grid
                    item
                    xs={12}
                    sx={{
                      backgroundColor: "#F2F2F2",
                      display: "flex",
                      justifyContent: "center", // Horizontally center the widget
                      alignItems: "center", // Vertically center the widget
                      borderRadius: "10px",
                      marginTop: "20px",
                    }}
                  >
                    <MaintenanceCashflowWidget data={cashflowData} />
                  </Grid>
                )}
                <Grid item xs={12} sx={{ backgroundColor: "#F2F2F2", borderRadius: "10px", height: "600px" }}>
                  <Stack direction='row' justifyContent='center' width='100%' sx={{ marginBottom: "15px", marginTop: "15px" }}>
                    <Typography variant='h5' sx={{ fontWeight: "bold", color: "#160449", marginTop: "20px" }}>
                      Revenue
                    </Typography>
                  </Stack>
                  <RevenueTable data={revenueData}></RevenueTable>
                </Grid>
              </Grid>
            </>
          )}
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

const WorkOrdersWidget = ({ maintenanceRequests, todayData, nextScheduleData, allMaintenanceStatusData, onSelectRequest, setSessionData, showMaintenanceDetail }) => {
  let navigate = useNavigate();
  const colorStatus = theme.colorStatusMM;
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [showSpinner, setShowSpinner] = useState(true);
  const convertTimeTo12HourFormat = (time) => {
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);

    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
  };

  const colors = ["#B33A3A", "#FFAA00", "#FFC107"];

  const [showSelectMonth, setShowSelectMonth] = useState(false);
  const [showPropertyFilter, setShowPropertyFilter] = useState(false);
  const [month, setMonth] = useState(null);
  const [year, setYear] = useState(null);
  const [filterPropertyList, setFilterPropertyList] = useState([]);
  const [filteredMaintenanceRequests, setFilteredMaintenanceRequests] = useState({})

  useEffect(() => {
    if (allMaintenanceStatusData) {
      const propertyList = [];
      const addedAddresses = [];
      for (const key in allMaintenanceStatusData?.result) {
        for (const item of allMaintenanceStatusData.result[key]?.maintenance_items) {
          if (!addedAddresses.includes(item.property_address)) {
            addedAddresses.push(item.property_address);
            if (!propertyList.includes(item.property_address)) {
              propertyList.push({
                address: item.property_address,
                checked: true,
              });
            }
          }
        }
      }
      setFilterPropertyList(propertyList);
    }
  }, [allMaintenanceStatusData]);

  function clearFilters() {
    setMonth(null);
    setYear(null);
    // setFilterPropertyList([]);
  }

  function displayFilterString(month, year) {
    if (month && year) {
      return month + " " + year;
    }else if(!month && year){
      return "All Of " + year;
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

  const filterCheckedAddresses = (requests, filterList) => {
    // console.log("--- inside filter function - ", requests)
    const checkedAddresses = new Set(filterList.filter((property) => property.checked).map((property) => property.address));

    // const filteredRequests = {};
    // for (const status in requests) {
    //   filteredRequests[status] = requests[status].filter((item) => checkedAddresses.has(item.property_address));
    // }
    const filteredRequests = {};

    const requestResult = requests?.result;

    for (const status in requestResult) {

        const seenKeys = new Set();

        filteredRequests[status] = requestResult[status].maintenance_items?.filter((item) => {
            
            const addressMatches = checkedAddresses.has(item.property_address);

            let dateMatches = true;

            if (month && year) {
                const filterFormatDate = convertToStandardFormat(month, year);
                dateMatches =
                    item.maintenance_request_created_date?.split("-")[0] === filterFormatDate?.split("-")[1] && 
                    item.maintenance_request_created_date?.split("-")[2] === filterFormatDate?.split("-")[0];
            } else if (!month && year) {
                dateMatches =
                    item.maintenance_request_created_date?.split("-")[2] === String(year);
            }

            const uniqueKey = `${item.maintenance_request_uid}-${item.maintenance_quote_uid}`;
            const isUnique = !seenKeys.has(uniqueKey);

            if (addressMatches && dateMatches && isUnique) {
                seenKeys.add(uniqueKey);
                return true; 
            }
            
            return false; 
        });
    }

    return filteredRequests;

  };

  useEffect(()=>{

    setShowSpinner(true)
    setFilteredMaintenanceRequests(filterCheckedAddresses(allMaintenanceStatusData, filterPropertyList))
    setShowSpinner(false)

  }, [allMaintenanceStatusData, filterPropertyList, month, year])
  // const filteredMaintenanceRequests = filterCheckedAddresses(allMaintenanceStatusData, filterPropertyList);

  const [maintenanceRequestsByQuoteStatus, setMaintenanceRequestsByQuoteStatus] = useState({}); // Quotes Requested, Quotes submitted etc.
  const [maintenanceRequestsByStatus, setMaintenanceRequestsByStatus] = useState({}); // ACCEPTED, FINISHED etc.

  const filterAllMaintenanceData = (filteredAllMaintenanceRequests) => {
    // if(filteredMaintenanceRequests == null || Object.keys(filteredMaintenanceRequests)?.length === 0){
    //   return;
    // }
    try {
      //const response = await fetch(`${APIConfig.baseURL.dev}/maintenanceStatus/${getProfileId()}`);
      //const response = await fetch(`${APIConfig.baseURL.dev}/maintenanceStatus/600-000012`);
      //const data = await response.json();
      //console.log('-----data inside workerMaintenanceTable----', data);

      const addresses = new Set();
      for (const status in filteredAllMaintenanceRequests.result) {
        if (Array.isArray(filteredAllMaintenanceRequests.result[status]?.maintenance_items)) {
          filteredAllMaintenanceRequests.result[status]?.maintenance_items.forEach((item) => {
            addresses.add(item.property_address);
          });
        }
      }

      const filterMaintenanceRequests = (allMaintenanceStatusData, address) => {
        const filteredRequests = {};
        const seenKeys = new Set();

        for (const status in allMaintenanceStatusData.result) {
          // Check if maintenance_items exists and is an array
          if (allMaintenanceStatusData.result[status].maintenance_items.length > 0) {
            filteredRequests[status] = {
              ...allMaintenanceStatusData.result[status],
              // maintenance_items: allMaintenanceStatusData.result[status].maintenance_items.filter((item) => address.includes(item.property_address) && filteredMaintenanceRequests[status]?.some(filteredItem => JSON.stringify(filteredItem) === JSON.stringify(item))),
                maintenance_items: allMaintenanceStatusData.result[status].maintenance_items.filter((item) => {
                  const uniqueKey = `${item.maintenance_request_uid}-${item.maintenance_quote_uid}`;

                  const isUnique =
                      !seenKeys.has(uniqueKey) &&
                      address.includes(item.property_address) &&
                      filteredMaintenanceRequests[status]?.some(filteredItem => JSON.stringify(filteredItem) === JSON.stringify(item));

                  if (isUnique) {
                    seenKeys.add(uniqueKey); 
                    return true; 
                  }

                  return false; 
              }),
            };
          } else {
            filteredRequests[status] = {
              ...allMaintenanceStatusData.result[status],
              maintenance_items: [],
            };
          }
        }
        return filteredRequests;
      };

      const data = filterMaintenanceRequests(filteredAllMaintenanceRequests, Array.from(addresses));

      // console.log('-----data inside workerMaintenanceTable----', data);
      // console.log('-----filteredRequests inside workerMaintenanceTable----', filteredMaintenanceRequests);

      const statusMappings = [
        { status: "Quotes Requested", mapping: "REQUESTED" },
        { status: "Quotes Submitted", mapping: "SUBMITTED" },
        { status: "Quotes Accepted", mapping: "ACCEPTED" },
        { status: "Scheduled", mapping: "SCHEDULED" },
        { status: "Finished", mapping: "FINISHED" },
        { status: "Paid", mapping: "PAID" },
      ];

      const result = {};
      const tempdata = {};

      statusMappings.forEach((mapping) => {
        const key = mapping.mapping;
        if (data[key]) {
          result[mapping.status] = data[key].maintenance_items;
          tempdata[key] = data[key].maintenance_items;
        }
      });
      // console.log('status table---', result);

      setMaintenanceRequestsByQuoteStatus(result);
      setMaintenanceRequestsByStatus(tempdata);

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    // console.log("---- here here here ---- ")
    setShowSpinner(true)

    filterAllMaintenanceData(allMaintenanceStatusData);
    
    setShowSpinner(false)

  }, [filteredMaintenanceRequests])

  useEffect(()=>{

    if(showMaintenanceDetail){
      setSessionData((prev) => ({
        ...prev,
        propmaintenanceItemsForStatus: maintenanceRequestsByQuoteStatus[prev.propstatus], 
        alldata: maintenanceRequestsByStatus, 
      }));
    }

  }, [maintenanceRequestsByQuoteStatus, maintenanceRequestsByStatus])
  

  // console.log('----filteredMaintenanceRequests-----', allMaintenanceStatusData, filteredMaintenanceRequests);

  async function handleRequestDetailPage(maintenance_request_index, mapping, property_uid, maintenance_request_uid) {
    const colorStatusItem = colorStatus?.find((item) => item.mapping === mapping);
    const status = colorStatusItem.status;

    //console.log("maintenance_request_index", maintenance_request_index)
    //console.log("status", status);
    //console.log("maintenanceItemsForStatus", maintenanceItemsForStatus);
    //console.log("inside func allMaintenanceData", allMaintenanceData);
    if (isMobile) {
      navigate(`/workerMaintenance/detail`, {
        state: {
          maintenance_request_index,
          status,
          maintenanceItemsForStatus: maintenanceRequestsByQuoteStatus[status],
          maintenanceRequestsByStatus,
          maintenance_request_uid,
        },
      });
    } else {
      onSelectRequest(maintenance_request_index, status, maintenanceRequestsByQuoteStatus[status], maintenanceRequestsByStatus, maintenance_request_uid);
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
        <CircularProgress color='inherit' />
      </Backdrop>
      <Container sx={{ height: "100%", backgroundColor: "#F2F2F2", borderRadius: "10px", padding: "5px" }}>
        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          <Grid container item xs={12} rowSpacing={0} sx={{ marginTop: "15px" }}>
            <Stack direction='row' justifyContent='center' width='100%' sx={{ marginBottom: "0px" }}>
              <Typography variant='h5' sx={{ fontWeight: "bold", color: "#160449" }}>
                Work Orders
              </Typography>
            </Stack>
            <Grid item container xs={12}>
              <Box component='span' m={2} display='flex' justifyContent='space-between' alignItems='center' width='100%'>
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

                <Box sx={{ flex: 1 }} />

                {/* property Button */}
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

                <SelectMonthComponent month={month} showSelectMonth={showSelectMonth} setShowSelectMonth={setShowSelectMonth} setMonth={setMonth} setYear={setYear} />
                <SelectPropertyFilter
                  showPropertyFilter={showPropertyFilter}
                  setShowPropertyFilter={setShowPropertyFilter}
                  filterList={filterPropertyList}
                  setFilterList={setFilterPropertyList}
                />

              </Box>      

              <Box 
                component="span" 
                m={2} 
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                width="100%"
              >
                <Typography
                  sx={{
                    display: "flex",
                    alignItems: "center", 
                    gap: "4px",
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
                        minWidth: 0, // Removes extra padding from the button
                        opacity: 1, 
                        pointerEvents: "auto",
                      }}
                    >
                      <CloseIcon sx={{ color: theme.typography.common.blue, fontSize: "14px" }} />
                    </Button>
                  )}
                </Typography>
              </Box>
              
            </Grid>

            <Grid item xs={12}>
              <WorkOrdersAccordion
                maintenanceRequests={filteredMaintenanceRequests}
                allMaintenanceStatusData={allMaintenanceStatusData}
                onSelectRequest={onSelectRequest}
                maintenanceRequestsByQuoteStatus={maintenanceRequestsByQuoteStatus}
                maintenanceRequestsByStatus={maintenanceRequestsByStatus}
              />
            </Grid>

            {/* work order today */}
            <Grid item xs={12} sx={{ padding: "20px 0px 20px 0px" }}>
              <Paper
                elevation={0}
                style={{
                  borderRadius: "5px",
                  backgroundColor: "#FFFFFF",
                  height: isMobile || todayData?.length === 0 ? 150 : 460,
                  width: "85%",
                  margin: "auto",
                  padding: "10px",
                }}
              >
                <Grid item xs={12}>
                  <Typography align='center' sx={{ fontSize: "24px", fontWeight: "bold", color: "#160449" }}>
                    Work Orders Today
                  </Typography>
                  {todayData.length === 0 ? (
                    <Typography align='center' sx={{ fontSize: "20px", fontWeight: "bold", color: "#3D5CAC" }}>
                      None
                    </Typography>
                  ) : (
                    todayData.map((row, index) => {
                      const formattedTime = convertTimeTo12HourFormat(row.maintenance_scheduled_time);
                      return (
                        <>
                          <Grid
                            container
                            key={index}
                            sx={{
                              backgroundColor: colors[index % colors.length], // Background color based on index
                              color: "white",
                              borderRadius: "10px",
                              marginBottom: 2,
                              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // Shadow for better appearance
                              padding: 2, // Add padding for spacing inside the Grid item
                            }}
                            onClick={() => {
                              const key = row.maintenance_status;
                              const index = filteredMaintenanceRequests[key].findIndex((item) => item.maintenance_request_uid === row.maintenance_request_uid);
                              handleRequestDetailPage(index, row.maintenance_status, row.maintenance_property_id, row.maintenance_request_uid);
                            }}
                          >
                            <Grid item xs={12} sm={3} display='flex' alignItems='center'>
                              <Typography sx={{ fontWeight: "bold", fontSize: "1rem" }}>{formattedTime}</Typography>
                            </Grid>

                            <Grid container item xs={12} sm={9} direction='row' sx={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                              <Grid container item xs={12} direction='row' sx={{ overflow: "hidden" }}>
                                <Grid item xs={3}>
                                  <Typography sx={{ fontSize: "0.8rem" }}>
                                    <strong>Address:</strong>
                                  </Typography>
                                </Grid>
                                <Grid container item direction='column' xs={9}>
                                  <Typography sx={{ marginLeft: 1, fontSize: "0.8rem" }}>{row.property_address}</Typography>
                                  <Typography sx={{ marginLeft: 1, fontSize: "0.8rem" }}>
                                    {row.property_city}, {row.property_state} {row.property_zip}
                                  </Typography>
                                </Grid>
                              </Grid>
                              <Grid container item xs={12} direction='row' sx={{ overflow: "hidden" }}>
                                <Grid item xs={3}>
                                  <Typography sx={{ fontSize: "0.8rem" }}>
                                    <strong>Issue:</strong>
                                  </Typography>
                                </Grid>
                                <Grid container item direction='column' xs={9}>
                                  <Typography sx={{ marginLeft: 1, fontSize: "0.8rem" }}>{row.maintenance_title}</Typography>
                                </Grid>
                              </Grid>
                            </Grid>
                          </Grid>
                        </>
                      );
                    })
                  )}
                  {nextScheduleData.length > 0 && (
                    <>
                      <Typography align='left' sx={{ fontSize: "20px", fontWeight: "bold", color: "#3D5CAC" }}>
                        Next Appointment: {nextScheduleData[0].maintenance_scheduled_date}
                      </Typography>
                      {nextScheduleData.map((row, index) => {
                        const formattedTime = convertTimeTo12HourFormat(row.maintenance_scheduled_time);
                        return (
                          <Box
                            key={index}
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              backgroundColor: colors[index % colors.length], // Use the desired background color
                              color: "white", // Use the desired text color
                              borderRadius: "10px",
                              marginBottom: 2,
                              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // Add shadow for better appearance
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "flex-start",
                                alignItems: "center",
                              }}
                            >
                              <Typography sx={{ fontWeight: "bold", fontSize: "1rem" }}>{formattedTime}</Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  maxWidth: "calc(100% - 4rem)", // Adjust based on the layout needs

                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  marginLeft: 1,
                                }}
                              >
                                <Typography sx={{ marginLeft: 6, fontSize: "0.8rem" }}>
                                  <strong>Address:</strong> {row.property_address}, {row.property_city}, {row.property_state} {row.property_zip}
                                </Typography>
                                <Typography
                                  sx={{
                                    marginLeft: 6,
                                    marginTop: 1,
                                    fontSize: "0.8rem",
                                  }}
                                >
                                  <strong>Issue:</strong> {row.maintenance_title}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        );
                      })}
                    </>
                  )}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
};

const WorkOrdersAccordion = ({ maintenanceRequests, maintenanceRequestsByQuoteStatus, maintenanceRequestsByStatus, allMaintenanceStatusData, onSelectRequest }) => {
  const colorStatus = theme.colorStatusMM;
  const [query, setQuery] = useState("");

  // function handleFilter(filterString, searchArray) {
  //   let filteredArray = [];
  //   if (filterString === "All" || filterString === "") {
  //     filteredArray = searchArray;
  //   } else {
  //     filteredArray = searchArray.filter((item) => item.maintenance_title === filterString);
  //   }
  //   return filteredArray;
  // }

  return (
    <>
      <Grid item xs={12} sx={{ width: "90%", margin: "auto" }}>
        {colorStatus.map((item, index) => {
          let mappingKey = item.mapping;
          let maintenanceArray = maintenanceRequests[mappingKey] || [];
          // let filteredArray = handleFilter(query, maintenanceRequests[mappingKey]);

          return (
            <WorkerMaintenanceStatusTable
              key={index}
              status={item.status}
              color={item.color}
              maintenanceItemsForStatus={maintenanceArray}
              allMaintenanceData={maintenanceRequests}
              maintenanceRequestsByQuoteStatus={maintenanceRequestsByQuoteStatus}
              maintenanceRequestsByStatus={maintenanceRequestsByStatus}
              allMaintenanceStatusData={allMaintenanceStatusData}
              maintenanceRequestsCount={maintenanceArray}
              onSelectRequest={onSelectRequest}
            />
          );
        })}
      </Grid>
    </>
  );
};

const RadialBarChart = ({ data }) => {
  const originalValues = data.map((d) => d.value);

  const maxSeriesValue = Math.max(...data.map((d) => d.value));
  const series = data.map((d) => (d.value / maxSeriesValue) * 100);
  const labels = data.map((d) => d.label);
  const colors = data.map((d) => d.color);

  const options = {
    series: series,
    chart: {
      height: 390,
      type: "radialBar",
    },
    plotOptions: {
      radialBar: {
        offsetY: 0,
        startAngle: 0,
        endAngle: 270,
        hollow: {
          margin: 5,
          size: "30%",
          background: "transparent",
          image: undefined,
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            show: false,
          },
        },
        barLabels: {
          enabled: true,
          useSeriesColors: true,
          margin: 8,
          fontSize: "15px",
          formatter: function (seriesName, opts) {
            return seriesName + ":  " + originalValues[opts.seriesIndex];
          },
        },
      },
    },
    colors: colors,
    labels: labels,
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            show: false,
          },
        },
      },
    ],
  };

  return <Chart options={options} series={series} type='radialBar' height={390} />;
};

const MaintenanceCashflowWidget = ({ data }) => {
  let submitted = 0;
  let accepted = 0;
  let scheduled = 0;
  let finished = 0;

  data.forEach((item) => {
    if (item.total_estimate !== null) {
      switch (item.maintenance_status) {
        case "SUBMITTED":
          submitted += item.total_estimate;
          break;
        case "ACCEPTED":
          accepted += item.total_estimate;
          break;
        case "SCHEDULED":
          scheduled += item.total_estimate;
          break;
        case "FINISHED":
          finished += item.total_estimate;
          break;
        default:
          break;
      }
    }
  });

  return (
    <Grid
      item
      xs={11}
      sx={{
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F2F2F2",
      }}
    >
      <Grid container direction='column' columnGap={1} rowGap={5}>
        <Grid
          item
          xs={10}
          sx={{
            backgroundColor: "#CEA892",
            textTransform: "none",
            borderRadius: "10px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography sx={{ color: "#FFFFFF", fontWeight: theme.typography.primary.fontWeight, fontSize: "16px" }}>Quotes Submitted Cashflow</Typography>
          <Typography sx={{ color: "#FFFFFF", fontWeight: theme.typography.primary.fontWeight, fontSize: "20px" }}>${submitted}</Typography>
        </Grid>
        <Grid
          item
          xs={10}
          sx={{
            backgroundColor: "#BAAC7A",
            textTransform: "none",
            borderRadius: "10px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography sx={{ color: "#FFFFFF", fontWeight: theme.typography.primary.fontWeight, fontSize: "16px" }}>Quotes Accepted Cashflow</Typography>
          <Typography sx={{ color: "#FFFFFF", fontWeight: theme.typography.primary.fontWeight, fontSize: "20px" }}>${accepted}</Typography>
        </Grid>

        <Grid
          item
          xs={10}
          sx={{
            backgroundColor: "#959A76",
            textTransform: "none",
            borderRadius: "10px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography sx={{ color: "#FFFFFF", fontWeight: theme.typography.primary.fontWeight, fontSize: "16px" }}>Quotes Scheduled Cashflow</Typography>
          <Typography sx={{ color: "#FFFFFF", fontWeight: theme.typography.primary.fontWeight, fontSize: "20px" }}>${scheduled}</Typography>
        </Grid>

        <Grid
          item
          xs={10}
          sx={{
            backgroundColor: "#598A96",
            textTransform: "none",
            borderRadius: "10px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography sx={{ color: "#FFFFFF", fontWeight: theme.typography.primary.fontWeight, fontSize: "16px" }}>Quotes Finished Cashflow</Typography>
          <Typography sx={{ color: "#FFFFFF", fontWeight: theme.typography.primary.fontWeight, fontSize: "20px" }}>${finished}</Typography>
        </Grid>
      </Grid>
    </Grid>
  );
};

const RevenueTable = ({ data }) => {
  return (
    <Box sx={{ backgroundColor: "#F2F2F2", borderRadius: "10px", p: 3 }}>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "10px",
          maxHeight: "500px", // Adjust the height as needed
          maxWidth: "100%", // Adjust the width as needed
          overflowX: "scroll",
          overflowY: "auto",
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ borderBottom: "1px solid #4A4A4A", backgroundColor: "#F2F2F2" }}>
              <TableCell
                sx={{
                  position: "sticky",
                  top: 0,
                  backgroundColor: "#F2F2F2",
                  borderBottom: "1px solid #4A4A4A",
                  zIndex: 1,
                  padding: "10px 20px",
                  whiteSpace: "nowrap",
                }}
              >
                <Typography variant='body1' sx={{ fontWeight: "bold", color: "#3D5CAC" }}>
                  {" "}
                  QuoteID
                </Typography>
              </TableCell>
              <TableCell
                sx={{
                  position: "sticky",
                  top: 0,
                  backgroundColor: "#F2F2F2",
                  borderBottom: "1px solid #4A4A4A",
                  zIndex: 1,
                  padding: "10px 20px",
                  whiteSpace: "nowrap",
                }}
              >
                <Typography variant='body1' sx={{ fontWeight: "bold", color: "#3D5CAC" }}>
                  BusinessID
                </Typography>
              </TableCell>
              <TableCell
                sx={{
                  position: "sticky",
                  top: 0,
                  backgroundColor: "#F2F2F2",
                  borderBottom: "1px solid #4A4A4A",
                  zIndex: 1,
                  padding: "10px 20px",
                  whiteSpace: "nowrap",
                }}
              >
                <Typography variant='body1' sx={{ fontWeight: "bold", color: "#3D5CAC" }}>
                  Business Name
                </Typography>
              </TableCell>
              <TableCell
                sx={{
                  position: "sticky",
                  top: 0,
                  backgroundColor: "#F2F2F2",
                  borderBottom: "1px solid #4A4A4A",
                  zIndex: 1,
                  padding: "10px 20px",
                  whiteSpace: "nowrap",
                }}
              >
                <Typography variant='body1' sx={{ fontWeight: "bold", color: "#3D5CAC" }}>
                  Status
                </Typography>
              </TableCell>
              <TableCell
                sx={{
                  position: "sticky",
                  top: 0,
                  backgroundColor: "#F2F2F2",
                  borderBottom: "1px solid #4A4A4A",
                  zIndex: 1,
                  padding: "10px 20px",
                  whiteSpace: "nowrap",
                }}
              >
                <Typography variant='body1' sx={{ fontWeight: "bold", color: "#3D5CAC" }}>
                  Maintenance Description
                </Typography>
              </TableCell>
              <TableCell
                sx={{
                  position: "sticky",
                  top: 0,
                  backgroundColor: "#F2F2F2",
                  borderBottom: "1px solid #4A4A4A",
                  zIndex: 1,
                  padding: "10px 20px",
                  whiteSpace: "nowrap",
                }}
              >
                <Typography variant='body1' sx={{ fontWeight: "bold", color: "#3D5CAC" }}>
                  Property Address
                </Typography>
              </TableCell>
              <TableCell
                sx={{
                  position: "sticky",
                  top: 0,
                  backgroundColor: "#F2F2F2",
                  borderBottom: "1px solid #4A4A4A",
                  zIndex: 1,
                  padding: "10px 20px",
                  whiteSpace: "nowrap",
                }}
              >
                <Typography variant='body1' sx={{ fontWeight: "bold", color: "#3D5CAC" }}>
                  Due Date
                </Typography>
              </TableCell>
              <TableCell
                sx={{
                  position: "sticky",
                  top: 0,
                  backgroundColor: "#F2F2F2",
                  borderBottom: "1px solid #4A4A4A",
                  zIndex: 1,
                  padding: "10px 20px",
                  whiteSpace: "nowrap",
                }}
              >
                <Typography variant='body1' sx={{ fontWeight: "bold", color: "#3D5CAC" }}>
                  Amount
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody sx={{ backgroundColor: "#F2F2F2" }}>
            {data.map((row, index) => (
              <TableRow key={index} sx={{ borderBottom: "1px solid #4A4A4A" }}>
                <TableCell sx={{ whiteSpace: "nowrap", padding: "10px 20px" }}>
                  <Typography sx={{ color: "#160449" }}>{row.maintenance_quote_uid}</Typography>
                </TableCell>

                <TableCell sx={{ whiteSpace: "nowrap", padding: "10px 20px" }}>
                  <Typography sx={{ color: "#160449" }}>{row.business_uid}</Typography>
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap", padding: "10px 20px" }}>
                  <Typography sx={{ color: "#160449" }}>{row.business_name}</Typography>
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap", padding: "10px 20px" }}>
                  <Typography sx={{ color: "#160449" }}>{row.maintenance_status}</Typography>
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap", padding: "10px 20px" }}>
                  <Typography sx={{ color: "#160449" }}>{row.maintenance_title}</Typography>
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap", padding: "10px 20px" }}>
                  <Typography sx={{ color: "#160449" }}>
                    {row.property_address}, {row.property_city}, {row.property_state} {row.property_zip}
                  </Typography>
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap", padding: "10px 20px" }}>
                  <Typography sx={{ color: "#160449" }}>
                    {row.maintenance_scheduled_date && row.maintenance_scheduled_date !== "null" ? row.maintenance_scheduled_date : "N/A"}
                  </Typography>
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap", padding: "10px 20px" }}>
                  <Typography sx={{ color: "#160449" }}>{row.quote_total_estimate}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
