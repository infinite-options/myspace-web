import { Typography, Box, Stack, Paper, Button, ThemeProvider } from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import theme from "../../../theme/theme";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SelectMonthComponent from "../../SelectMonthComponent";
import SelectPropertyFilter from "../../SelectPropertyFilter/SelectPropertyFilter";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import WorkerMaintenanceStatusTable from "./WorkerMaintenanceStatusTable";
import SelectPriorityFilter from "../../SelectPriorityFilter/SelectPriorityFilter";
import { useUser } from "../../../contexts/UserContext";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../../utils/httpMiddleware";
import APIConfig from "../../../utils/APIConfig"

export default function MaintenanceWorker() {
  const { user, getProfileId } = useUser();
  const location = useLocation();
  let navigate = useNavigate();
  const [maintenanceData, setMaintenanceData] = useState({});
  const [displayMaintenanceData, setDisplayMaintenanceData] = useState([{}]);
  const colorStatus = theme.colorStatusMM;
  const [showSpinner, setShowSpinner] = useState(false);
  const [refresh, setRefresh] = useState(false || location.state?.refresh);

  const newDataObject = {};
  newDataObject["REQUESTED"] = [];
  newDataObject["SUBMITTED"] = [];
  newDataObject["ACCEPTED"] = [];
  newDataObject["SCHEDULED"] = [];
  newDataObject["FINISHED"] = [];
  newDataObject["PAID"] = [];

  const [showSelectMonth, setShowSelectMonth] = useState(false);

  const [showPropertyFilter, setShowPropertyFilter] = useState(false);
  const [showPriorityFilter, setShowPriorityFilter] = useState(false);

  const [month, setMonth] = useState(null);
  const [year, setYear] = useState(null);

  const [filterPropertyList, setFilterPropertyList] = useState([]);
  const [filterPriorityList, setFilterPriorityList] = useState([]);

  useEffect(() => {
    if (maintenanceData) {
      // //console.log("maintenanceData", maintenanceData)

      const propertyList = [];
      const priorityList = [];
      const addedAddresses = [];

      for (const key in maintenanceData) {
        for (const item of maintenanceData[key]) {
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

      priorityList.push({ priority: "High", checked: true });
      priorityList.push({ priority: "Medium", checked: true });
      priorityList.push({ priority: "Low", checked: true });
      priorityList.push({ priority: "", checked: true });

      setFilterPriorityList(priorityList);

      // //console.log("filterPropertyList", propertyList)
      setFilterPropertyList(propertyList);
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

  function handleFilter(maintenanceArray, month, year, filterPropertyList, filterPriorityList) {
    var filteredArray = [];

    // Filtering by date
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
    // Filtering by priority
    if (filterPriorityList?.length > 0) {
      //filteredArray = filteredArray.filter(item => filterPropertyList.includes(item.property_address));
      filteredArray = filteredArray.filter((item) => {
        for (const filterItem of filterPriorityList) {
          if (filterItem.priority === item.maintenance_priority && filterItem.checked) {
            return true;
          }
        }
        return false;
      });
    }

    // Filtering by property
    if (filterPropertyList?.length > 0) {
      //filteredArray = filteredArray.filter(item => filterPropertyList.includes(item.property_address));
      filteredArray = filteredArray.filter((item) => {
        for (const filterItem of filterPropertyList) {
          if (filterItem.address === item.property_address && filterItem.checked) {
            return true;
          }
        }
        return false;
      });
    }

    //setDisplayMaintenanceData(filteredArray);
    return filteredArray;
  }

  function displayFilterString(month, year) {
    if (month && year) {
      return month + " " + year;
    } else {
      return "Last 30 Days";
    }
  }

  function displayPriorityFilterTitle(filterPropertyList) {
    return "priority";
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

  useEffect(() => {
    const dataObject = {};
    const getMaintenanceData = async () => {
      setShowSpinner(true);
      //console.log("About to call maintenanceStatus endpoint Maintenance Worker");
      const maintenanceRequests = await fetch(`${APIConfig.baseURL.dev}/maintenanceStatus/${getProfileId()}`); // Change back to ${getProfileId()}
      const maintenanceRequestsData = await maintenanceRequests.json();
      // //console.log("maintenanceRequestsData", maintenanceRequestsData)

      let array1 = maintenanceRequestsData.result.REQUESTED?.maintenance_items ?? [];
      let array2 = maintenanceRequestsData.result.SUBMITTED?.maintenance_items ?? [];
      let array3 = maintenanceRequestsData.result.ACCEPTED?.maintenance_items ?? [];
      let array4 = maintenanceRequestsData.result.SCHEDULED?.maintenance_items ?? [];
      let array5 = maintenanceRequestsData.result.FINISHED?.maintenance_items ?? [];
      let array6 = maintenanceRequestsData.result.PAID?.maintenance_items ?? [];

      dataObject["REQUESTED"] = [...array1];
      dataObject["SUBMITTED"] = [...array2];
      dataObject["ACCEPTED"] = [...array3];
      dataObject["SCHEDULED"] = [...array4];
      dataObject["FINISHED"] = [...array5];
      dataObject["PAID"] = [...array6];

      // //console.log("dataObject from new api call", dataObject)
      setMaintenanceData((prevData) => ({
        ...prevData,
        ...dataObject,
      }));
      setDisplayMaintenanceData((prevData) => ({
        ...prevData,
        ...dataObject,
      }));
      setShowSpinner(false);
    };
    getMaintenanceData();
    setRefresh(false);
  }, [refresh]);

  return (
    <ThemeProvider theme={theme}>
      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Box
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%", // Take up full screen width
          // maxWidth: '60%',
          minHeight: "100%", // Set the Box height to full height
          marginTop: theme.spacing(2), // Set the margin to 20px
        }}
      >
        <Paper
          style={{
            padding: theme.spacing(2),
            backgroundColor: theme.palette.primary.main,
            width: "85%", // Occupy full width with 25px margins on each side
            // [theme.breakpoints.down('sm')]: {
            //     width: '80%',
            // },
            // [theme.breakpoints.up('sm')]: {
            //     width: '50%',
            // },
            paddingTop: "10px",
          }}
        >
          <Stack direction="row" justifyContent="center" alignItems="center" position="relative">
            <Box direction="row" justifyContent="center" alignItems="center">
              <Typography sx={{ color: theme.typography.propertyPage.color, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}>
                Maintenance
              </Typography>
            </Box>
          </Stack>
          <Box component="span" m={2} display="flex" justifyContent="space-between" alignItems="center">
            <Button sx={{ textTransform: "capitalize" }} onClick={() => setShowSelectMonth(true)}>
              <CalendarTodayIcon
                sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight, fontSize: theme.typography.smallFont, margin: "5px" }}
              />
              <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight, fontSize: theme.typography.smallFont }}>
                {displayFilterString(month, year)}
              </Typography>
            </Button>

            <Button sx={{ textTransform: "capitalize" }} onClick={() => setShowPropertyFilter(true)}>
              <HomeWorkIcon sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight, fontSize: theme.typography.smallFont, margin: "5px" }} />
              <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight, fontSize: theme.typography.smallFont }}>
                {displayPropertyFilterTitle(filterPropertyList)}
              </Typography>
            </Button>
            <Button sx={{ textTransform: "capitalize" }} onClick={() => setShowPriorityFilter(true)}>
              <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight, fontSize: theme.typography.smallFont }}>
                {displayPriorityFilterTitle(filterPriorityList)}
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
            <SelectPriorityFilter
              showPriorityFilter={showPriorityFilter}
              setShowPriorityFilter={setShowPriorityFilter}
              filterList={filterPriorityList}
              setFilterList={setFilterPriorityList}
            />
          </Box>
          <Box component="span" m={2} display="flex" justifyContent="center" alignItems="center" position="relative">
            {/* <Typography 
                                sx={{color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight, fontSize:theme.typography.smallFont}}
                            >
                                {displayFilterString(month, year)}
                                {displayFilterString(month, year) === "Last 30 Days" ? null :(
                                <Button onClick={() => clearFilters()} sx={{
                                    padding: "0px",
                                    position: "absolute", 
                                    right: 0, 
                                    opacity: displayFilterString(month, year) === "Last 30 Days" ? 0 : 1,  // Adjust opacity based on condition
                                    pointerEvents: displayFilterString(month, year) === "Last 30 Days" ? 'none' : 'auto'  // Ensure the button is not clickable when hidden
                                }}>
                                    <CloseIcon sx={{color: theme.typography.common.blue, fontSize: "14px"}}/>
                                </Button>
                            )}
                            </Typography> */}
          </Box>
          <div
            style={{
              borderRadius: "10px",
              margin: "20px",
            }}
          >
            {colorStatus.map((item, index) => {
              // construct mapping key if it doesn't exist
              // var mappingKey = ""
              // if (item.mapping === "SCHEDULED") { // a known key with color mapping
              //     mappingKey = "SCHEDULED" // a mapped key to the maintenanceData object
              // } else if (item.mapping == "PAID"){
              //     mappingKey = "PAID"
              // } else{
              //     mappingKey = item.mapping
              // }

              let mappingKey = item.mapping;

              let maintenanceArray = maintenanceData[mappingKey] || [];

              let filteredArray = handleFilter(maintenanceArray, month, year, filterPropertyList, filterPriorityList);

              for (const item of filteredArray) {
                newDataObject[mappingKey].push(item);
              }

              return (
                <WorkerMaintenanceStatusTable
                  key={index}
                  status={item.status}
                  color={item.color}
                  maintenanceItemsForStatus={filteredArray}
                  allMaintenanceData={newDataObject}
                  maintenanceRequestsCount={filteredArray}
                />
              );
            })}
          </div>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}
