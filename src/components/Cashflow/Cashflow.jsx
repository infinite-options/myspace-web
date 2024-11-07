import React, { useEffect, useState } from "react";
import {
  Paper,
  DialogContent,
  Grid,
  Box,
  Modal,
  Stack,
  ThemeProvider,
  Button,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Dialog,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Container,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import CloseIcon from "@mui/icons-material/Close";
import theme from "../../theme/theme";
// import RevenueTable from "./RevenueTable";
// import ExpectedRevenueTable from "./ExpectedRevenueTable";
// import SelectMonthComponent from "../SelectMonthComponent";
// import ExpenseTable from "./ExpenseTable";
// import ExpectedExpenseTable from "./ExpectedExpenseTable";
import MixedChart from "../Graphs/OwnerCashflowGraph";
// import SelectProperty from "../Leases/SelectProperty";
import AddRevenueIcon from "../../images/AddRevenueIcon.png";
import AllOwnerIcon from "../Rent/RentComponents/AllOwnerIcon.png";
import { useUser } from "../../contexts/UserContext"; // Import the UserContext
import Backdrop from "@mui/material/Backdrop";
// import DeleteIcon from "@mui/icons-material/Delete";
// import EditIcon from "@mui/icons-material/Edit";
import CircularProgress from "@mui/material/CircularProgress";
import useMediaQuery from "@mui/material/useMediaQuery";
import "../../css/selectMonth.css";

import CashflowWidget from "../Dashboard-Components/Cashflow/CashflowWidget";
import AddRevenue from "./AddRevenue";
import AddExpense from "./AddExpense";


import {
  getTotalRevenueByType,
  getTotalExpenseByType,
  fetchCashflow2,
  getTotalExpenseByMonthYear,
  getTotalRevenueByMonthYear,
  getTotalExpectedRevenueByMonthYear,
  getTotalExpectedExpenseByMonthYear,
  getPast12MonthsCashflow,
  getNext12MonthsCashflow,
  getRevenueList,
  getExpenseList,
  getDataByProperty,
  getTotalRevenueByTypeByProperty,
  getTotalExpenseByTypeByProperty
} from "../Cashflow/CashflowFetchData2";

import axios from "axios";

export default function Cashflow() {
  const location = useLocation();

  const { user, getProfileId } = useUser(); // Access the user object from UserContext

  const profileId = getProfileId();
  const [showSpinner, setShowSpinner] = useState(true);

  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const date = new Date();
  console.log("month fetch - ", location.state.month)
  const [month, setMonth] = useState(location.state.month || "January");
  const [year, setYear] = useState(location.state.year || "2024");
  const currentMonth = monthNames[date.getMonth()];
  const currentYear = date.getFullYear();


  const [cashflowData, setCashflowData] = useState(null); // Cashflow data from API
  const [cashflowData2, setCashflowData2] = useState(location.state?.cashFlowData?location.state?.cashFlowData : null); // Cashflow data from API
  // console.log(location.state?.cashFlowData);

  const [expectedRevenueByMonth, setExpectedRevenueByMonth] = useState(0);
  const [expectedExpenseByMonth, setExpectedExpenseByMonth] = useState(0);

  const [totalRevenueByMonth, setTotalRevenueByMonth] = useState(0);

  const [totalExpenseByMonth, setTotalExpenseByMonth] = useState(0);

  const [expenseList, setExpenseList] = useState([]);
  const [revenueList, setRevenueList] = useState([]);

  const [revenueByType, setRevenueByType] = useState({});
  const [expenseByType, setExpenseByType] = useState({});
  const [expectedRevenueByType, setExpectedRevenueByType] = useState([]);
  const [expectedExpenseByType, setExpectedExpenseByType] = useState([]);

  const [last12Months, setLast12Months] = useState([]);
  const [next12Months, setNext12Months] = useState([]);
  const [revenueByTypeByProperty, setRevenueByTypeByProperty] = useState([])
  const [expenseByTypeByProperty, setExpenseByTypeByProperty] = useState([])
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const displays = ["Cashflow", "ExpectedCashflow"];

  const [currentWindow, setCurrentWindow] = useState(location.state?.currentWindow || "CASHFLOW_DETAILS");
  const [originalCashFlowData, setOriginalCashFlowData] = useState(null)
  const [propertyList, setPropertyList] = useState(location.state.propertyList? location.state.propertyList : []);
  const [selectedProperty, setSelectedProperty] = useState(location.state.selectedProperty ? location.state.selectedProperty : "All Properties");

  // useEffect(() => {
  //   fetchCashflow(profileId)
  //     .then((data) => {
  //       setCashflowData(data);
  //       // let currentMonthYearRevenueExpected = get
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching cashflow data:", error);
  //     });
  // }, []);

  // async function fetchProperties(userProfileId, month, year) {
  //   try {
  //     // const cashflow = await axios.get(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/cashflowByOwner/${userProfileId}/TTM`);
  //     // const cashflow = await axios.get(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/cashflowByOwner/${userProfileId}/TTM`);
  //     // const cashflow = await axios.get(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/cashflow/${userProfileId}/TTM`);
  //     // const cashflow = await axios.get(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/cashflow/110-000003/TTM`);
  //     const properties = await axios.get(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/properties/${userProfileId}`);
  //     // console.log("Owner Properties: ", properties.data);
  //     return properties.data;
  //   } catch (error) {
  //     console.error("Error fetching properties data:", error);
  //   }
  // }
  
  // Again fetch data when change window from expense to cashFlow
  useEffect(()=>{
    // setShowSpinner(true)
    if(currentWindow === "CASHFLOW_DETAILS"){
      fetchCashflow2(profileId)
      .then((data) => {
        // console.log("yes window is change")

        setOriginalCashFlowData(data)

        if(selectedProperty === "All Properties"){
          setCashflowData2(data);
    
        }else{
          const dataByProperty = getDataByProperty(data, selectedProperty);
          setCashflowData2(dataByProperty);
        }
        // setCashflowData2(data);
        // let currentMonthYearRevenueExpected = get
      })
      .catch((error) => {
        console.error("Error fetching cashflow data:", error);
      });
    }
    setShowSpinner(false)
    
  }, [currentWindow])

  // Fetch data and properties
  // useEffect(() => {
  //   // fetchProperties(profileId)
  //   //   .then((data) => {
  //   //     setPropertyList(data?.Property?.result);
  //   //   })
  //   //   .catch((error) => {
  //   //     console.error("Error fetching PropertyList:", error);
  //   //   });
  // }, []);

  useEffect(() => {
    setShowSpinner(true)
    if (cashflowData2 !== null && cashflowData2 !== undefined) {
      let currentMonthYearTotalRevenue = getTotalRevenueByMonthYear(cashflowData2, month, year);
      let currentMonthYearTotalExpense = getTotalExpenseByMonthYear(cashflowData2, month, year);
      let currentMonthYearExpectedRevenue = getTotalExpectedRevenueByMonthYear(cashflowData2, month, year);
      let currentMonthYearExpectedExpense = getTotalExpectedExpenseByMonthYear(cashflowData2, month, year);
      setTotalRevenueByMonth(currentMonthYearTotalRevenue); // currently using sum(total_paid)
      setTotalExpenseByMonth(currentMonthYearTotalExpense); // currently using sum(total_paid)
      setExpectedRevenueByMonth(currentMonthYearExpectedRevenue);
      setExpectedExpenseByMonth(currentMonthYearExpectedExpense);
      // setExpectedRevenueByMonth(currentMonthYearExpectedRevenue);
      // setExpectedExpenseByMonth(currentMonthYearExpectedExpense);
      
      let revenuelist = getRevenueList(cashflowData2);
      let expenselist = getExpenseList(cashflowData2);

      setRevenueList(revenuelist);
      setExpenseList(expenselist);

      const revenueByProperty = revenuelist?.reduce((acc, item) => {
        if (item.cf_month !== month || item.cf_year !== year) {
          return acc; 
        }

        const propertyUID = item.pur_property_id;
        const propertyInfo = {
          property_id: item.pur_property_id,
          property_address: item.property_address,
          property_unit: item.property_unit,
        };
  
        const totalExpected = parseFloat(item.expected) || 0;
        const totalActual = parseFloat(item.actual) || 0;
  
        if (!acc[propertyUID]) {
          // acc[propertyUID] = [];
          acc[propertyUID] = {
            propertyInfo: propertyInfo,
            revenueItems: [],
            RevenueByType: {},
            expectedRevenueByType: {},
            totalExpected: 0,
            totalActual: 0,
          };
        }
  
        acc[propertyUID].revenueItems.push(item);

        
        acc[propertyUID].totalExpected += totalExpected;
        acc[propertyUID].totalActual += totalActual;

        return acc;
      }, {});

      Object.keys(revenueByProperty).forEach((propertyUID) => {
        const property = revenueByProperty[propertyUID];
        const revenueItems = property.revenueItems;
    
        const RevenueByType = getTotalRevenueByTypeByProperty({ result: revenueItems }, month, year, false, propertyUID);
        // const ExpenseByType = getTotalExpenseByTypeByProperty({ result: revenueItems }, month, year, false, propertyUID);
      
        const expectedRevenueByType = getTotalRevenueByTypeByProperty({ result: revenueItems }, month, year, true, propertyUID);
        // const expectedExpenseByType = getTotalExpenseByTypeByProperty({ result: revenueItems }, month, year, true, propertyUID);
     
        revenueByProperty[propertyUID].RevenueByType = RevenueByType;
        // revenueByProperty[propertyUID].ExpenseByType = ExpenseByType;
        revenueByProperty[propertyUID].expectedRevenueByType = expectedRevenueByType;
        // revenueByProperty[propertyUID].expectedExpenseByType = expectedExpenseByType;
      });

      setRevenueByTypeByProperty(revenueByProperty)

      const expenseByProperty = expenselist?.reduce((acc, item) => {
        const propertyUID = item.pur_property_id;
        const propertyInfo = {
          property_id: item.pur_property_id,
          property_address: item.property_address,
          property_unit: item.property_unit,
        };
  
        const totalExpected = parseFloat(item.expected) || 0;
        const totalActual = parseFloat(item.actual) || 0;
  
        if (!acc[propertyUID]) {
          // acc[propertyUID] = [];
          acc[propertyUID] = {
            propertyInfo: propertyInfo,
            expenseItems: [],
            ExpenseByType: {},
            expectedExpenseByType: {},
            totalExpected: 0,
            totalActual: 0,
          };
        }
  
        acc[propertyUID].expenseItems.push(item);
        acc[propertyUID].totalExpected += totalExpected;
        acc[propertyUID].totalActual += totalActual;

        return acc;
      }, {});

      Object.keys(expenseByProperty).forEach((propertyUID) => {
        const property = expenseByProperty[propertyUID];
        const expenseItems = property.expenseItems;
    
        // const RevenueByType = getTotalRevenueByTypeByProperty({ result: expe }, month, year, false, propertyUID);
        const ExpenseByType = getTotalExpenseByTypeByProperty({ result: expenseItems }, month, year, false, propertyUID);
        // console.log("inside expense by property - ", ExpenseByType)
      
        // const expectedRevenueByType = getTotalRevenueByTypeByProperty({ result: revenueItems }, month, year, true, propertyUID);
        const expectedExpenseByType = getTotalExpenseByTypeByProperty({ result: expenseItems }, month, year, true, propertyUID);
     
        expenseByProperty[propertyUID].ExpenseByType = ExpenseByType;
        // revenueByProperty[propertyUID].ExpenseByType = ExpenseByType;
        expenseByProperty[propertyUID].expectedExpenseByType = expectedExpenseByType;
        // revenueByProperty[propertyUID].expectedExpenseByType = expectedExpenseByType;
      });

      setExpenseByTypeByProperty(expenseByProperty)


      let revenueMapping = getTotalRevenueByType(cashflowData2, month, year, false);
      let expenseMapping = getTotalExpenseByType(cashflowData2, month, year, false);
      // console.log("revenueMapping", revenueMapping)
      // console.log("expenseMapping", expenseMapping)
      setRevenueByType(revenueMapping);
      setExpenseByType(expenseMapping);

      let expectedRevenueByType = getTotalRevenueByType(cashflowData2, month, year, true);
      let expectedExpenseByType = getTotalExpenseByType(cashflowData2, month, year, true);
      // console.log("expectedRevenueByType", expectedRevenueByType)
      // console.log("expectedExpenseByType", expectedExpenseByType)
      setExpectedRevenueByType(expectedRevenueByType);
      setExpectedExpenseByType(expectedExpenseByType);

      let last12months = getPast12MonthsCashflow(cashflowData2, month, year);
      let next12Months = getNext12MonthsCashflow(cashflowData2, month, year);

      setLast12Months(last12months);
      setNext12Months(next12Months);
    }
    setShowSpinner(false)
  }, [month, year, cashflowData2]);

  const getPropertyName = (propertyUID) => {
    if (propertyUID === "All Properties") {
      return "All Properties";
    } else {
      const property = propertyList.find(p => p.property_uid === propertyUID);
      if (property) {
        return property.property_address;
      } else {
        return "Property not found"; // Return a fallback message if no match is found
      }
    }
  }

  // useEffect(() => {
  //   console.log("propertyList - ", propertyList);
  // }, [propertyList]);

  // useEffect(() => {
  //   console.log("cashflowData2 - ", cashflowData2);
  // }, [cashflowData2]);

  return (
    <ThemeProvider theme={theme}>
      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
        <CircularProgress color='inherit' />
      </Backdrop>

      <Container maxWidth='lg' sx={{ paddingTop: "10px", height: "90vh" }}>
        <Grid container spacing={6} sx={{ height: "90%", marginBottom:"10px"}}>
          <Grid item xs={12} md={4}>
            <CashflowWidget
              data={cashflowData2}
              monthForData={month}
              yearForData={year}
              setData={setCashflowData2}
              setCurrentWindow={setCurrentWindow}
              page='OwnerCashflow'
              allProperties={propertyList}
              originalData={originalCashFlowData}
              window={currentWindow}
              // propertyList={propertyList}
              selectedProperty={selectedProperty}
              setSelectedProperty={setSelectedProperty}
            />
          </Grid>

          <Grid container item xs={12} md={8} columnSpacing={6}>
            {currentWindow === "CASHFLOW_DETAILS" && (
              <CashflowDetails
                uid={revenueByType ? revenueByType : expenseByType}
                month={month}
                setCurrentWindow={setCurrentWindow}
                setMonth={setMonth}
                year={year}
                setYear={setYear}
                currentMonth={currentMonth}
                currentYear={currentYear}
                expectedExpenseByMonth={expectedExpenseByMonth}
                totalExpenseByMonth={totalExpenseByMonth}
                expectedRevenueByMonth={expectedRevenueByMonth}
                totalRevenueByMonth={totalRevenueByMonth}
                expectedRevenueByType={expectedRevenueByType}
                expectedExpenseByType={expectedExpenseByType}
                revenueByType={revenueByType}
                expenseByType={expenseByType}
                revenueList={revenueList}
                expenseList={expenseList}
                last12Months={last12Months}
                next12Months={next12Months}
                revenueByTypeByProperty={revenueByTypeByProperty}
                expenseByTypeByProperty={expenseByTypeByProperty}
                selectedPropertyName={getPropertyName(selectedProperty)}
                isMobile={isMobile}
              />
            )}

            {currentWindow === "ADD_REVENUE" && <AddRevenue propertyList={propertyList} setCurrentWindow={setCurrentWindow} />}

            {currentWindow === "ADD_EXPENSE" && <AddExpense propertyList={propertyList} setCurrentWindow={setCurrentWindow} />}
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}


const CashflowDetails = ({
  uid,
  month,
  selectedPropertyName,
  setMonth,
  setCurrentWindow,
  year,
  setYear,
  currentMonth,
  currentYear,
  expectedExpenseByMonth,
  totalExpenseByMonth,
  expectedRevenueByMonth,
  totalRevenueByMonth,
  expectedRevenueByType,
  revenueByType,
  expectedExpenseByType,
  expenseByType,
  revenueList,
  expenseList,
  last12Months,
  next12Months,
  revenueByTypeByProperty,
  expenseByTypeByProperty,
  isMobile

}) => {
  const navigate = useNavigate();
  const { user, getProfileId } = useUser();

  const profileId = getProfileId();
  const selectedRole = user.selectedRole;

  const [showSelectMonth, setShowSelectMonth] = useState(false);
  const [openSelectProperty, setOpenSelectProperty] = useState(false);

  const [activeButton, setActiveButton] = useState("Cashflow");

  const [showChart, setShowChart] = useState("Current");
  const [tab, setTab] = useState("by_month");
  const [headerTab, setHeaderTab] = useState("current_month");

  const handleSelectTab = (tab_name) => {
    setTab(tab_name);
  };

  return (
    <>
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          width: "100%", // Take up full screen width
        }}
      >
        <Paper
          sx={{
            // marginTop: "30px",
            padding: theme.spacing(2),
            backgroundColor: activeButton === "Cashflow" ? theme.palette.primary.main : theme.palette.primary.secondary,
            width: "95%", // Occupy full width with 25px margins on each side
            // [theme.breakpoints.down("sm")]: {
            //   width: "80%",
            // },
            // [theme.breakpoints.up("sm")]: {
            //   width: "50%",
            // },
          }}
        >
          <Stack direction='row' justifyContent='center'>
            <Typography sx={{ color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}>
              {month} {year} Cashflow
            </Typography>
          </Stack>

          {/* -- Select Month and property component-- */}
          <Box component='span' m={2} display='flex' justifyContent='space-between' alignItems='center' marginY={"20px"}>
            
            {/* All 3 filter button last_month, current_mont and select date */}
            <Box
              sx={{
                width: "100%",
                display:"flex",
                flexDirection:"row",
              }}
            >
              <Button 
                sx={{
                  marginRight: isMobile? "10px" :"30px",
                  backgroundColor: headerTab === "select_month_year" ? "#3D5CAC" : "#9EAED6",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: headerTab === "select_month_year" ? "#3D5CAC" : "#9EAED6",
                  },
                }}
                onClick={() => {
                  setHeaderTab("select_month_year")
                  setShowSelectMonth(true)
                }}
              >
                <CalendarTodayIcon sx={{ color: "#160449" , fontWeight: theme.typography.common.fontWeight, fontSize: "12px", margin: "5px"}} />
                <Typography sx={{ fontSize: "12px", fontWeight: "bold", color: "#160449" }}>Select Month / Year</Typography>
              </Button>
              <Button
                sx={{
                  marginRight: isMobile? "10px" :"30px",
                  backgroundColor: headerTab === "last_month" ? "#3D5CAC" : "#9EAED6",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: headerTab === "last_month" ? "#3D5CAC" : "#9EAED6",
                  },
                }}
                onClick={() => {
                  const monthNames = [
                    "January", "February", "March", "April", "May", "June", 
                    "July", "August", "September", "October", "November", "December"
                  ];

                  let monthIndex = monthNames.indexOf(currentMonth);

                  if (monthIndex === 0) { // If current month is January
                    setMonth("December");
                    setYear((currentYear - 1).toString());
                  } else {
                    setMonth(monthNames[monthIndex - 1]);
                    setYear(currentYear.toString());
                  }
                
                  setHeaderTab("last_month")
                  
                }}
              >
                <Typography sx={{ fontSize: "12px", fontWeight: "bold", color: "#160449" }}>Last Month</Typography>
              </Button>
              <Button
                sx={{
                  marginRight: isMobile? "10px" :"30px",
                  backgroundColor: headerTab === "current_month" ? "#3D5CAC" : "#9EAED6",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: headerTab === "current_month" ? "#3D5CAC" : "#9EAED6",
                  },
                }}
                onClick={() => {
                  setHeaderTab("current_month")
                  setMonth(currentMonth)
                  setYear(currentYear.toString())
                }}
              >
                <Typography sx={{ fontSize: "12px", fontWeight: "bold", color: "#160449" }}>{currentMonth}</Typography>
              </Button>
              <Button
                sx={{
                  marginRight: isMobile? "10px" :"30px",
                  backgroundColor: headerTab === "next_month" ? "#3D5CAC" : "#9EAED6",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: headerTab === "next_month" ? "#3D5CAC" : "#9EAED6",
                  },
                }}
                onClick={() => {
                  const monthNames = [
                    "January", "February", "March", "April", "May", "June", 
                    "July", "August", "September", "October", "November", "December"
                  ];

                  let monthIndex = monthNames.indexOf(currentMonth);

                  if (monthIndex === 11) { // If current month is January
                    setMonth("January");
                    setYear((currentYear + 1).toString());
                  } else {
                    setMonth(monthNames[monthIndex + 1]);
                    setYear(currentYear.toString());
                  }
                
                  setHeaderTab("next_month")
                  
                }}
              >
                <Typography sx={{ fontSize: "12px", fontWeight: "bold", color: "#160449" }}>Next Month</Typography>
              </Button>
            </Box>

            {/* For display months and year as well as selected month and year */}
            <SelectMonthComponentTest
              selectedMonth={month}
              selectedYear={year}
              setMonth={setMonth}
              setYear={setYear}
              showSelectMonth={showSelectMonth}
              setShowSelectMonth={setShowSelectMonth}
            />
            {selectedRole === "MANAGER" && (
              <Button sx={{ textTransform: "capitalize" }} onClick={() => {}}>
                <img src={AllOwnerIcon} alt='All Owners' style={{ width: "10px", height: "10px" }} />
                <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight, fontSize: "14px" }}>All Owners</Typography>
              </Button>
            )}

            {/* <Button sx={{ textTransform: "capitalize" }} onClick={() => setOpenSelectProperty(true)}>
              <HomeWorkIcon sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight, fontSize: theme.typography.smallFont, margin: "5px" }} />
              <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight, fontSize: "13px" }}>Property</Typography>
            </Button> */}
            <Box display='flex' justifyContent='flex-end' alignItems='center' sx={{ width: "270px", marginRight:"14px"}}>
              <HomeWorkIcon sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight, fontSize: theme.typography.smallFont, margin: "5px" }} />
              <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight, fontSize: "13px" }}>{selectedPropertyName}</Typography>
            </Box>

          </Box>

          {/* -- For header of table Actual And Expected-- */}
          <Box
            component='span'
            marginY={3}
            padding={3}
            display='flex'
            justifyContent="space-between"
            alignItems='center'
          >
            <Box
              sx={{
                flex: isMobile? 0.75 : 0.9,
                display:"flex",
                flexDirection:"row",
              }}
            >
              <Button
                sx={{
                  width: isMobile? "80px" : "100px",
                  marginRight: isMobile ? "10px" : "30px",
                  backgroundColor: tab === "by_month" ? "#3D5CAC" : "#9EAED6",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: tab === "by_month" ? "#3D5CAC" : "#9EAED6",
                  },
                }}
                onClick={() => handleSelectTab("by_month")}
              >
                <Typography sx={{ fontSize: "12px", fontWeight: "bold", color: "#160449" }}>By Month</Typography>
              </Button>
              <Button
                sx={{
                  width: isMobile? "90px" : "100px",
                  backgroundColor: tab === "by_property" ? "#3D5CAC" : "#9EAED6",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: tab === "by_property" ? "#3D5CAC" : "#9EAED6",
                  },
                }}
                onClick={() => handleSelectTab("by_property")}
              >
                <Typography sx={{ fontSize: "12px", fontWeight: "bold", color: "#160449" }}>By Property</Typography>
              </Button>
            </Box>
            <Box sx={{display: "flex", flexDirection:"row", justifyContent: "space-between", flex : isMobile ? 0.49 : 0.34}}>
              <Typography sx={{ color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize: isMobile? "" : theme.typography.largeFont }}>Expected</Typography>
              <Typography sx={{ color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize: isMobile? "" : theme.typography.largeFont }}>Actual</Typography>
            </Box>
          </Box>
          
          {/* -- Display Total CashFlow-- */}
          <Box
            component='span'
            marginY={2}
            padding={2}
            display='flex'
            justifyContent='space-between'
            alignItems='center'
            // onClick={() => setActiveButton('ExpectedCashflow')}
            style={{
              backgroundColor: theme.palette.custom.blue,
              borderRadius: "5px",
            }}
          >
            <Grid container item xs={12}>
                <Grid container justifyContent='flex-start' item xs={isMobile? 6: 8}>
                  <Grid container direction='row' alignContent='center' sx={{ height: "35px" }}>
                    <Typography sx={{color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, ...(isMobile ? {} : { fontSize: theme.typography.largeFont }) }}>
                      Cashflow
                    </Typography>
                  </Grid>
                </Grid>
                <Grid container alignContent='center' justifyContent='flex-end' item xs={isMobile? 3 : 2}>
                  <Typography sx={{color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, ...(isMobile ? {} : { fontSize: theme.typography.largeFont })}}>
                    $
                    {expectedRevenueByMonth !== null && expectedRevenueByMonth !== undefined && expectedExpenseByMonth !== null && expectedExpenseByMonth !== undefined
                      ? (expectedRevenueByMonth - expectedExpenseByMonth).toFixed(2)
                      : "0.00"}
                  </Typography>
                </Grid>
                <Grid container alignContent='center' justifyContent='flex-end' item xs={isMobile? 3 : 2}>
                  <Typography sx={{ color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, ...(isMobile ? {} : { fontSize: theme.typography.largeFont }) }}>
                    $
                    {totalRevenueByMonth !== null && totalRevenueByMonth !== undefined && totalExpenseByMonth !== null && totalExpenseByMonth !== undefined
                      ? (totalRevenueByMonth - totalExpenseByMonth).toFixed(2)
                      : "0.00"}
                  </Typography>
                </Grid>
              </Grid>

          </Box>

          {tab === "by_month" && <>
            {/* For Revenue */}
            <Accordion
              sx={{
                backgroundColor: theme.palette.primary.main,
                boxShadow: "none",
              }}
            >
              <Grid container item xs={12}>
                <Grid container justifyContent='flex-start' item xs={isMobile? 6: 8}>
                  <Grid container direction='row' alignContent='center' sx={{ height: "35px" }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight }}>{month} Revenue</Typography>
                    </AccordionSummary>
                  </Grid>
                </Grid>
                <Grid container alignContent='center' justifyContent='flex-end' item xs={isMobile? 3 : 2}>
                  <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight }}>
                      ${" "}
                      {"ExpectedCashflow" === "Cashflow"
                        ? totalRevenueByMonth
                          ? totalRevenueByMonth.toFixed(2)
                          : "0.00"
                        : expectedRevenueByMonth
                        ? expectedRevenueByMonth.toFixed(2)
                        : "0.00"}
                  </Typography>
                </Grid>
                <Grid container alignContent='center' justifyContent='flex-end' item xs={isMobile? 3 : 2}>
                <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight }}>
                    ${" "}
                    {"Cashflow" === "Cashflow" ? (totalRevenueByMonth ? totalRevenueByMonth.toFixed(2) : "0.00") : expectedRevenueByMonth ? expectedRevenueByMonth.toFixed(2) : "0.00"}
                  </Typography>
                </Grid>
              </Grid>


              <AccordionDetails>
                {/* <RevenueTable totalRevenueByType={revenueByType} expectedRevenueByType={expectedRevenueByType} revenueList={revenueList} activeView={activeButton}/>             */}
                <StatementTable
                  uid={uid}
                  isMobile={isMobile}
                  categoryTotalMapping={revenueByType}
                  allItems={revenueList}
                  activeView={"ExpectedCashflow"}
                  tableType='Revenue'
                  categoryExpectedTotalMapping={expectedRevenueByType}
                  month={month}
                  year={year}
                />
              </AccordionDetails>
            </Accordion>

            {/* For expense */}
            <Accordion
              sx={{
                backgroundColor: theme.palette.primary.main,
                boxShadow: "none",
              }}
            >
              <Grid container item xs={12}>
                <Grid container justifyContent='flex-start' item xs={isMobile? 6: 8}>
                  <Grid container direction='row' alignContent='center' sx={{ height: "35px" }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight }}>{month} Expense</Typography>
                    </AccordionSummary>
                  </Grid>
                </Grid>
                <Grid container alignContent='center' justifyContent='flex-end' item xs={isMobile? 3 : 2}>
                  <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight }}>
                    ${" "}
                    {"ExpectedCashflow" === "Cashflow"
                      ? totalExpenseByMonth
                        ? totalExpenseByMonth.toFixed(2)
                        : "0.00"
                      : expectedExpenseByMonth
                      ? expectedExpenseByMonth.toFixed(2)
                      : "0.00"}
                  </Typography>
                </Grid>
                <Grid container alignContent='center' justifyContent='flex-end' item xs={isMobile? 3 : 2}>
                  <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight }}>
                    ${" "}
                    {"Cashflow" === "Cashflow"
                      ? totalExpenseByMonth
                        ? totalExpenseByMonth.toFixed(2)
                        : "0.00"
                      : expectedExpenseByMonth
                      ? expectedExpenseByMonth.toFixed(2)
                      : "0.00"}
                  </Typography>
                </Grid>
              </Grid>

              <AccordionDetails>
                <StatementTable
                  isMobile={isMobile}
                  categoryTotalMapping={expenseByType}
                  allItems={expenseList}
                  activeView={"ExpectedCashflow"}
                  tableType='Expense'
                  categoryExpectedTotalMapping={expectedExpenseByType}
                  month={month}
                  year={year}
                />
              </AccordionDetails>
            </Accordion>
          </>}

          {tab === "by_property" && <>
            {/* For Revenue */}
            <Accordion
              sx={{
                backgroundColor: theme.palette.primary.main,
                boxShadow: "none",
              }}
            >
              <Grid container item xs={12}>
                <Grid container justifyContent='flex-start' item xs={isMobile? 6: 8}>
                  <Grid container direction='row' alignContent='center' sx={{ height: "35px" }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight }}>{month} Revenue</Typography>
                    </AccordionSummary>
                  </Grid>
                </Grid>
                <Grid container alignContent='center' justifyContent='flex-end' item xs={isMobile? 3 : 2}>
                  <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight }}>
                      ${" "}
                      {"ExpectedCashflow" === "Cashflow"
                        ? totalRevenueByMonth
                          ? totalRevenueByMonth.toFixed(2)
                          : "0.00"
                        : expectedRevenueByMonth
                        ? expectedRevenueByMonth.toFixed(2)
                        : "0.00"}
                  </Typography>
                </Grid>
                <Grid container alignContent='center' justifyContent='flex-end' item xs={isMobile? 3 : 2}>
                <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight }}>
                    ${" "}
                    {"Cashflow" === "Cashflow" ? (totalRevenueByMonth ? totalRevenueByMonth.toFixed(2) : "0.00") : expectedRevenueByMonth ? expectedRevenueByMonth.toFixed(2) : "0.00"}
                  </Typography>
                </Grid>
              </Grid>

              <AccordionDetails>
                {/* <RevenueTable totalRevenueByType={revenueByType} expectedRevenueByType={expectedRevenueByType} revenueList={revenueList} activeView={activeButton}/>             */}
                {revenueByTypeByProperty && Object.keys(revenueByTypeByProperty).map((propertyUID, index) => {
                  const property = revenueByTypeByProperty[propertyUID];
                  // console.log("property - ", property);
                  return (
                    <>
                      <Accordion
                        sx={{
                          backgroundColor: theme.palette.primary.main,
                          boxShadow: "none",
                        }}
                        key={index}
                      >
                        <Grid container item xs={12}>
                          <Grid container justifyContent='flex-start' item xs={isMobile? 6: 8}>
                            <Grid container direction='row' alignContent='center' sx={{ height: "35px" }}>
                              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography sx={{ color: theme.typography.primary.black, cursor:"pointer", fontWeight: theme.typography.common.fontWeight, ...(isMobile? {fontSize: "12px", width: "150px", } :{}) }} 
                                  onClick={(e) => {navigate("/properties", { state: { currentProperty: property?.propertyInfo?.property_id } });}}
                                >
                                  {`${property?.propertyInfo?.property_address}`} {property?.propertyInfo?.property_unit && ", Unit - "}
                                  {property?.propertyInfo?.property_unit && property?.propertyInfo?.property_unit}
                                </Typography>
                              </AccordionSummary>
                            </Grid>
                          </Grid>
                          <Grid container alignContent='center' justifyContent='flex-end' item xs={isMobile? 3: 2}>
                            <Typography sx={{ color: theme.typography.primary.black, fontWeight: theme.typography.common.fontWeight, ...(isMobile? {fontSize: "12px" } :{}) }}>
                              ${property?.totalExpected ? property?.totalExpected?.toFixed(2) : "0.00"}
                            </Typography>
                          </Grid>
                          <Grid container alignContent='center' justifyContent='flex-end' item xs={isMobile? 3: 2}>
                            <Typography sx={{ color: theme.typography.primary.black, fontWeight: theme.typography.common.fontWeight, ...(isMobile? {fontSize: "12px" } :{}) }}>
                              ${property?.totalActual? property?.totalActual?.toFixed(2) : "0.00"}
                            </Typography>
                          </Grid>
                        </Grid>
                        <AccordionDetails>
                          <StatementTable
                            isMobile={isMobile}
                            categoryTotalMapping={property?.RevenueByType}
                            allItems={property?.revenueItems}
                            activeView={"ExpectedCashflow"}
                            tableType='Revenue'
                            categoryExpectedTotalMapping={property?.expectedRevenueByType}
                            month={month}
                            year={year}
                          />
                        </AccordionDetails>
                      </Accordion>
                    </>
                      );
                })}
                {/* <StatementTable
                  uid={uid}
                  categoryTotalMapping={revenueByType}
                  allItems={revenueList}
                  activeView={"ExpectedCashflow"}
                  tableType='Revenue'
                  categoryExpectedTotalMapping={expectedRevenueByType}
                  month={month}
                  year={year}
                /> */}
              </AccordionDetails>
            </Accordion>

            {/* For expense */}
            <Accordion
              sx={{
                backgroundColor: theme.palette.primary.main,
                boxShadow: "none",
              }}
            >
              {/* <Box component='span' m={3} display='flex' justifyContent='space-between' alignItems='center'>
                <Box display='flex' justifyContent='flex-start' alignItems='center' sx={{ width: "270px" }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight }}>{month} Expense</Typography>
                  </AccordionSummary>
                </Box>
                <Box display='flex' justifyContent='center' alignItems='center' sx={{ width: "200px" }}>
                  <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight }}>
                    ${" "}
                    {"ExpectedCashflow" === "Cashflow"
                      ? totalExpenseByMonth
                        ? totalExpenseByMonth.toFixed(2)
                        : "0.00"
                      : expectedExpenseByMonth
                      ? expectedExpenseByMonth.toFixed(2)
                      : "0.00"}
                  </Typography>
                </Box>
                <Box display='flex' justifyContent='flex-end' alignItems='center' sx={{ width: "200px" }}>
                  <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight }}>
                    ${" "}
                    {"Cashflow" === "Cashflow"
                      ? totalExpenseByMonth
                        ? totalExpenseByMonth.toFixed(2)
                        : "0.00"
                      : expectedExpenseByMonth
                      ? expectedExpenseByMonth.toFixed(2)
                      : "0.00"}
                  </Typography>
                </Box>
              </Box> */}
              <Grid container item xs={12}>
                <Grid container justifyContent='flex-start' item xs={isMobile? 6: 8}>
                  <Grid container direction='row' alignContent='center' sx={{ height: "35px" }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight }}>{month} Expense</Typography>
                    </AccordionSummary>
                  </Grid>
                </Grid>
                <Grid container alignContent='center' justifyContent='flex-end' item xs={isMobile? 3 : 2}>
                  <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight }}>
                    ${" "}
                    {"ExpectedCashflow" === "Cashflow"
                      ? totalExpenseByMonth
                        ? totalExpenseByMonth.toFixed(2)
                        : "0.00"
                      : expectedExpenseByMonth
                      ? expectedExpenseByMonth.toFixed(2)
                      : "0.00"}
                  </Typography>
                </Grid>
                <Grid container alignContent='center' justifyContent='flex-end' item xs={isMobile? 3 : 2}>
                  <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight }}>
                    ${" "}
                    {"Cashflow" === "Cashflow"
                      ? totalExpenseByMonth
                        ? totalExpenseByMonth.toFixed(2)
                        : "0.00"
                      : expectedExpenseByMonth
                      ? expectedExpenseByMonth.toFixed(2)
                      : "0.00"}
                  </Typography>
                </Grid>
              </Grid>

              <AccordionDetails>
                {expenseByTypeByProperty && Object.keys(expenseByTypeByProperty).map((propertyUID, index) => {
                  const property = expenseByTypeByProperty[propertyUID];
                  return (
                    <>
                      <Accordion
                        sx={{
                          backgroundColor: theme.palette.primary.main,
                          boxShadow: "none",
                        }}
                        key={index}
                      >
                        <Grid container item xs={12}>
                          <Grid container justifyContent='flex-start' item xs={isMobile? 6: 8}>
                            <Grid container direction='row' alignContent='center' sx={{ height: "35px" }}>
                              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography sx={{ color: theme.typography.primary.black, fontWeight: theme.typography.common.fontWeight, ...(isMobile? {fontSize: "12px" } :{}) }}>
                                  {`${property?.propertyInfo?.property_address}`} {property?.propertyInfo?.property_unit && ", Unit - "}
                                  {property?.propertyInfo?.property_unit && property?.propertyInfo?.property_unit}
                                </Typography>
                                <Button
                                  sx={{
                                    padding: "0px",
                                    marginLeft: "10px",
                                    color: "#160449",
                                    "&:hover": {
                                      color: "#FFFFFF",
                                    },
                                  }}
                                  onClick={(e) => {navigate("/properties", { state: { currentProperty: property?.propertyInfo?.property_id } });}}
                                >
                                  <Typography sx={{ fontWeight: theme.typography.common.fontWeight, textTransform: "none", ...(isMobile? {fontSize: "12px" } :{}) }}>View</Typography>
                                </Button>
                              </AccordionSummary>
                            </Grid>
                          </Grid>
                          <Grid container alignContent='center' justifyContent='flex-end' item xs={isMobile? 3: 2}>
                            <Typography sx={{ color: theme.typography.primary.black, fontWeight: theme.typography.common.fontWeight, ...(isMobile? {fontSize: "12px" } :{})}}>
                              ${property?.totalExpected ? property?.totalExpected?.toFixed(2) : "0.00"}
                            </Typography>
                          </Grid>
                          <Grid container alignContent='center' justifyContent='flex-end' item xs={isMobile? 3: 2}>
                            <Typography sx={{ color: theme.typography.primary.black, fontWeight: theme.typography.common.fontWeight, ...(isMobile? {fontSize: "12px" } :{}) }}>
                              ${property?.totalActual? property?.totalActual?.toFixed(2) : "0.00"}
                            </Typography>
                          </Grid>
                        </Grid>
                        <AccordionDetails>
                          <StatementTable
                            isMobile={isMobile}
                            categoryTotalMapping={property?.ExpenseByType}
                            allItems={property?.expenseItems}
                            activeView={"ExpectedCashflow"}
                            tableType='Expense'
                            categoryExpectedTotalMapping={property?.expectedExpenseByType}
                            month={month}
                            year={year}
                          />
                        </AccordionDetails>
                      </Accordion>
                    </>
                      );
                })}
              </AccordionDetails>
            </Accordion>
          </>}

          {/* GRAPH Component and "Show Expected" Button starts */}
          <Stack direction='row' justifyContent='center'>
            <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight, fontSize: theme.typography.largeFont, marginTop:"10px"}}>
              {showChart} Cashflow and Revenue
            </Typography>
          </Stack>

          <Stack direction='row' justifyContent='center' height={300}>
            {showChart === "Current" ? (
              <MixedChart revenueCashflowByMonth={last12Months} activeButton={activeButton} showChart={showChart}></MixedChart>
            ) : (
              <MixedChart revenueCashflowByMonth={next12Months} activeButton={activeButton} showChart={showChart}></MixedChart>
            )}
          </Stack>

          <Stack sx={{marginTop : "10px"}} direction='row' justifyContent='center' textTransform={"none"}>
            <Button onClick={() => setShowChart(showChart === "Current" ? "Expected" : "Current")} variant='outlined'>
              <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight, fontSize: "14px" }}>
                {showChart === "Current" ? "Show Future Cashflow" : "Show Current Cashflow"}
              </Typography>
            </Button>
          </Stack>
        </Paper>
        
        {/* "Add Revenue" and "Add Expense" component */}
        {/* <Paper
          sx={{
            margin: "2px",
            padding: theme.spacing(2),
            boxShadow: "none",
            width: "85%",
          }}
        >
          <Box component='span' m={2} marginTop={15} marginBottom={30} display='flex' justifyContent='space-between' alignItems='center'>
            <Button
              sx={{
                color: theme.typography.primary.black,
                fontWeight: theme.typography.primary.fontWeight,
                fontSize: theme.typography.smallFont,
                backgroundColor: theme.palette.primary.main,
                borderRadius: 3,
                textTransform: "none",
              }}
              onClick={() => {
                setCurrentWindow("ADD_REVENUE")
              }}
            >
              {" "}
              <img src={AddRevenueIcon}></img> Revenue
            </Button>
            <Button
              sx={{
                color: theme.typography.primary.black,
                fontWeight: theme.typography.primary.fontWeight,
                fontSize: theme.typography.smallFont,
                backgroundColor: theme.palette.primary.main,
                borderRadius: 3,
                textTransform: "none",
              }}
              onClick={() => {
                setCurrentWindow("ADD_EXPENSE")
              }}
            >
              {" "}
              <img src={AddRevenueIcon}></img> Expense
            </Button>
          </Box>
        </Paper> */}
      </Box>
    </>
  );
};

function SelectMonthComponentTest(props) {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const lastYear = new Date().getFullYear() - 1;
  const currentYear = new Date().getFullYear();
  const nextYear = new Date().getFullYear() + 1;
  const yearsNames = [lastYear, currentYear, nextYear]

  return (
    <Dialog open={props.showSelectMonth} onClose={() => props.setShowSelectMonth(false)} maxWidth='lg'>
      <DialogTitle>
        <IconButton
          aria-label='close'
          onClick={() => props.setShowSelectMonth(false)}
          sx={{
            position: "absolute",
            right: 1,
            top: 1,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box marginBottom={"40px"}>
          <Typography sx={{fontWeight: "bold", color: "#160449", textAlign:"center"}} marginBottom={"10px"}>Months</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {monthNames.map((month, index) => {
              return (
                <Typography textAlign={"center"} className={props.selectedMonth === month ? "selected" : "unselected"} key={index} onClick={() => props.setMonth(month)}>
                  {month}
                </Typography>
              );
            })}
          </Box>
        </Box>
        <Box marginBottom={"10px"}>
          <Typography sx={{fontWeight: "bold", color: "#160449", textAlign:"center"}} marginBottom={"10px"}>Years</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {yearsNames.map((year, index) => {
              return (
                <Typography textAlign={"center"} className={props.selectedYear === year.toString() ? "selected" : "unselected"} onClick={() => props.setYear(year.toString())} key={index}>
                  {year}
                </Typography>
              );
            })}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

// This is the function that controls what and how the cashflow data is displayed
function StatementTable(props) {
  // console.log(props)
  const navigate = useNavigate();

  const isMobile = props.isMobile;

  const activeView = props.activeView;
  const tableType = props.tableType;

  const month = props.month;
  const year = props.year;

  const categoryTotalMapping = props.categoryTotalMapping;
  const allItems = props.allItems;

  const categoryExpectedTotalMapping = props.categoryExpectedTotalMapping;
  const allExpectedItems = [];

  const navigateType = "/edit" + tableType;

  function handleNavigation(type, item) {
    navigate(type, { state: { itemToEdit: item, edit: true } });
  }


  function getCategoryCount(category) {
    // console.log("getCategoryCount - allItems - ", allItems);
    let filteredItems = allItems.filter((item) => item.purchase_type.toUpperCase() === category.toUpperCase() && item.cf_month === month && item.cf_year === year);
    // let items = filteredItems?.map((item) => ({ ...item, property: JSON.parse(item.property) }));
    let count = 0

    filteredItems.map((i) => {
      count += 1
    })

    return "(" + count + ")";
  }

  function getCategoryItems(category, type) {
    let filteredIitems = allItems.filter((item) => item.purchase_type.toUpperCase() === category.toUpperCase() && item.cf_month === month && item.cf_year === year);
    // let items = filteredIitems?.map((item) => ({ ...item, property: JSON.parse(item.property) }));

    return (
      <>
        {activeView !== "Cashflow" && (<TableRow>
          <TableCell>
            <Typography sx={{ fontSize: isMobile? "12px" : theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight, marginLeft: isMobile? "10px" : "25px"  }}>Property UID</Typography>
          </TableCell>
          <TableCell>
            <Typography sx={{ fontSize: isMobile? "12px" : theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>Property Address</Typography>
          </TableCell>
          <TableCell>
            <Typography sx={{ fontSize: isMobile? "12px" : theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>Property Unit</Typography>
          </TableCell>
          <TableCell align='right'>
            <Typography sx={{ fontSize: isMobile? "12px" : theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>Expected</Typography>
          </TableCell>
          <TableCell align='right'>
            <Typography sx={{ fontSize: isMobile? "12px" : theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight, marginLeft: isMobile? "10px" : "25px"  }}>Actual</Typography>
          </TableCell>
        </TableRow>)}

        {filteredIitems.map((item, index) => {
          return activeView === "Cashflow" ? (
            <TableRow key={index} onClick={() => handleNavigation(type, item)}>
              <TableCell></TableCell>
              <TableCell>
                <Typography sx={{ fontSize: isMobile? "12px" : theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }} onClick={() => {
                    navigate("/properties", {
                      state: { currentProperty: item.pur_property_id}
                    });
                  }}>
                  {" "}
                  {item.property_address} {item.property_unit}{" "}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography sx={{ fontSize: isMobile? "12px" : theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
                  ${item["expected"] ? item["expected"] : 0}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography sx={{ fontSize: isMobile? "12px" : theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
                  ${item["actual"] ? item["actual"] : 0}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            <React.Fragment key={index}>

              <TableRow key={`${item.property_uid}-${index}`} sx={{}}>
                <TableCell>
                  <Typography sx={{ fontSize: isMobile? "12px" : theme.typography.smallFont, marginLeft: isMobile? "10px" : "25px" }}>{item.pur_property_id ? item.pur_property_id : ""}</Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: isMobile? "12px" : theme.typography.smallFont, cursor:"pointer" }} onClick={() => {
                    navigate("/properties", {
                      state: { currentProperty: item.pur_property_id}
                    });
                  }}>{item.property_address? item.property_address : ""}</Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: isMobile? "12px" : theme.typography.smallFont }}>{item.property_unit ? item.property_unit : ""}</Typography>
                </TableCell>
                <TableCell align='right'>
                  {/* {property.individual_purchase.map((p) => {
                      total_amount_due += (p.pur_amount_due? p.pur_amount_due : 0)
                  })} */}
                  <Typography sx={{ fontSize: isMobile? "12px" : theme.typography.smallFont }}>
                    ${item.expected ? item.expected : 0}
                  </Typography>
                </TableCell>
                <TableCell align='right'>
                  {/* {property.individual_purchase.map((p) => {
                      total_amount_paid += (p.total_paid ? p.total_paid : 0)
                  })} */}
                  <Typography sx={{ fontSize: isMobile? "12px" : theme.typography.smallFont, marginRight: isMobile? "10px" : "25px" }}>
                    ${item.actual?item.actual:0}
                  </Typography>
                </TableCell>
              </TableRow>
            </React.Fragment>
          );
        })}
      </>
    );
  }

  return (
    <>
      {activeView === "Cashflow" ? (
        <>
          {Object.entries(categoryTotalMapping).map(([category, value]) => {
            return (
              <Accordion
                sx={{
                  backgroundColor: theme.palette.custom.pink,
                  boxShadow: "none",
                }}
                key={category}
              >
                <Grid container item xs={12}>
                  <Grid container justifyContent='flex-start' item xs={isMobile? 6: 8}>
                    <Grid container direction='row' alignContent='center' sx={{ height: "35px" }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight, ...(isMobile? {fontSize: "12px" } :{})}}>
                          {" "}
                          {category} {getCategoryCount(category)}{" "}
                        </Typography>
                      </AccordionSummary>
                    </Grid>
                  </Grid>
                  <Grid container alignContent='center' justifyContent='flex-end' item xs={isMobile? 3 : 2}>
                    <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight, ...(isMobile? {fontSize: "12px" } :{}) }}>${value ? value : 0}</Typography>
                  </Grid>
                  <Grid container alignContent='center' justifyContent='flex-end' item xs={isMobile? 3 : 2}>
                    <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight, ...(isMobile? {fontSize: "12px" } :{}) }}>${value ? value : 0}</Typography>
                  </Grid>
                </Grid>
                <AccordionDetails>
                  <Table>
                    <TableBody>{getCategoryItems(category, navigateType)}</TableBody>
                  </Table>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </>
      ) : (
        <>
          {Object.entries(categoryExpectedTotalMapping).map(([category, value]) => {
            return (
              <Accordion
                sx={{
                  backgroundColor: theme.palette.custom.pink,
                  boxShadow: "none",
                }}
                key={category}
              >
                <Grid container item xs={12}>
                  <Grid container justifyContent='flex-start' item xs={isMobile? 6: 8}>
                    <Grid container direction='row' alignContent='center' sx={{ height: "35px" }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight, ...(isMobile? {fontSize: "12px" } :{}) }}>
                          {" "}
                          {category} {getCategoryCount(category)}{" "}
                        </Typography>
                      </AccordionSummary>
                    </Grid>
                  </Grid>
                  <Grid container alignContent='center' justifyContent='flex-end' item xs={isMobile? 3 : 2}>
                    <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight, ...(isMobile? {fontSize: "12px" } :{}) }}>
                      ${value ? value : 0}
                    </Typography>
                  </Grid>
                  <Grid container alignContent='center' justifyContent='flex-end' item xs={isMobile? 3 : 2}>
                    <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight, ...(isMobile? {fontSize: "12px" } :{}) }}>
                      ${categoryTotalMapping[category] ? categoryTotalMapping[category] : 0}
                    </Typography>
                  </Grid>
                </Grid>
                <AccordionDetails>
                  <Table>
                    <TableBody>{getCategoryItems(category)}</TableBody>
                  </Table>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </>
      )}
    </>
  );
}
