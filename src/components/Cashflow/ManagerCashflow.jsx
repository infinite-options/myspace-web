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
// import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
// import HomeWorkIcon from "@mui/icons-material/HomeWork";
// import CloseIcon from "@mui/icons-material/Close";
import theme from "../../theme/theme";
// import RevenueTable from "./RevenueTable";
// import ExpectedRevenueTable from "./ExpectedRevenueTable";
// import SelectMonthComponent from "../SelectMonthComponent";
// import ExpenseTable from "./ExpenseTable";
// import ExpectedExpenseTable from "./ExpectedExpenseTable";
// import MixedChart from "../Graphs/OwnerCashflowGraph";
// import SelectProperty from "../Leases/SelectProperty";
// import AddRevenueIcon from "../../images/AddRevenueIcon.png";
// import AllOwnerIcon from "../Rent/RentComponents/AllOwnerIcon.png";
import { useUser } from "../../contexts/UserContext"; // Import the UserContext
import Backdrop from "@mui/material/Backdrop";
// import DeleteIcon from "@mui/icons-material/Delete";
// import EditIcon from "@mui/icons-material/Edit";
import CircularProgress from "@mui/material/CircularProgress";
import "../../css/selectMonth.css";

import ManagerCashflowWidget from "../Dashboard-Components/Cashflow/ManagerCashflowWidget";
import ManagerProfitability from "./ManagerProfitability";
import ManagerTransactions from "./ManagerTransactions";
import PaymentsManager from "../Payments/PaymentsManager";
import MakePayment from "./MakePayment";
import AddRevenue from "./AddRevenue";
import AddExpense from "./AddExpense";

import axios from "axios";

// import {
//   getTotalRevenueByType,
//   getTotalExpenseByType,
//   fetchCashflow2,
//   getTotalExpenseByMonthYear,
//   getTotalRevenueByMonthYear,
//   getTotalExpectedRevenueByMonthYear,
//   getTotalExpectedExpenseByMonthYear,
//   getPast12MonthsCashflow,
//   getNext12MonthsCashflow,
//   getRevenueList,
//   getExpenseList,
// } from "../Cashflow/CashflowFetchData2";

export default function ManagerCashflow() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, getProfileId } = useUser(); // Access the user object from UserContext

  const profileId = getProfileId();
  const selectedRole = user.selectedRole; // Get the selected role from user object
  const [showSpinner, setShowSpinner] = useState(false);

  const [activeButton, setActiveButton] = useState("Cashflow");

  const [showChart, setShowChart] = useState("Current");

  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear().toString();

  const [month, setMonth] = useState(location.state?.month || currentMonth);
  const [year, setYear] = useState(location.state?.year || currentYear);  
  const cashflowWidgetData = location.state?.cashflowWidgetData;

  const [cashflowData, setCashflowData] = useState(null); // Cashflow data from API

  const [cashflowTransactionsData, setCashflowTransactionsData] = useState(null); // Cashflow data from API

  const [rentsByProperty, setRentsByProperty] = useState([]); //current month
  const [profits, setProfits] = useState([]); //current month
  const [payouts, setPayouts] = useState([]); //current month

  const [profitsTotal, setProfitsTotal] = useState({}); //current month
  const [rentsTotal, setRentsTotal] = useState({}); //current month
  const [payoutsTotal, setPayoutsTotal] = useState({}); //current month
  const [unsortedPayouts, setUnsortedPayouts] = useState([])
  const [unsortedRentsData, setUnsortedRentsData] = useState([])

  const [profitabilityData, setProfitabilityData] = useState([]);
  const [transactionsData, setTransactionsData] = useState([]);

  const [currentWindow, setCurrentWindow] = useState(location.state?.currentWindow || "PROFITABILITY");

  const [selectedPayment, setSelectedPayment] = useState(null);

  const [propertyList, setPropertyList] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState("ALL");

  //ROHIT - remove this function
  // async function fetchCashflow(userProfileId, month, year) {
  //   setShowSpinner(true);
  //   try {
  //     // const cashflow = await axios.get(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/cashflowByOwner/${userProfileId}/TTM`);
  //     // const cashflow = await axios.get(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/cashflowByOwner/${userProfileId}/TTM`);
  //     // const cashflow = await axios.get(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/cashflow/${userProfileId}/TTM`);
  //     // const cashflow = await axios.get(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/cashflow/110-000003/TTM`);
  //     const cashflow = await axios.get(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/cashflowRevised/${userProfileId}`);
  //     console.log("Manager Cashflow Data: ", cashflow.data);
  //     setShowSpinner(false);
  //     return cashflow.data;
  //   } catch (error) {
  //     console.error("Error fetching cashflow data:", error);
  //     setShowSpinner(false);
  //   }
  // }

  async function fetchCashflowTransactions(userProfileId, month, year) {
    setShowSpinner(true);
    try {

      const cashflow = await axios.get(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/cashflowTransactions/${userProfileId}/new`);
      console.log("Manager Cashflow Data: ", cashflow.data);
      setShowSpinner(false);
      return cashflow.data;
    } catch (error) {
      console.error("Error fetching cashflow data:", error);
      setShowSpinner(false);
    }
  }

  async function fetchProperties(userProfileId, month, year) {
    setShowSpinner(true);
    try {
      // const cashflow = await axios.get(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/cashflowByOwner/${userProfileId}/TTM`);
      // const cashflow = await axios.get(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/cashflowByOwner/${userProfileId}/TTM`);
      // const cashflow = await axios.get(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/cashflow/${userProfileId}/TTM`);
      // const cashflow = await axios.get(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/cashflow/110-000003/TTM`);
      const properties = await axios.get(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/properties/${userProfileId}`);
      // console.log("Manager Properties: ", properties.data);
      setShowSpinner(false);
      return properties.data;
    } catch (error) {
      console.error("Error fetching properties data:", error);
      setShowSpinner(false);
    }
  }

  // useEffect(() => {
  //   console.log("ROHIT - currentWindow - ", currentWindow);
  // }, [currentWindow]);

  useEffect(() => {
    // console.log("cashflowData - ", cashflowData);
  }, [cashflowData]);

  useEffect(() => {
    // console.log("propertyList - ", propertyList);
  }, [propertyList]);

  useEffect(() => {
    // console.log("ManagerCashflow - selectedProperty - ", selectedProperty);
  }, [selectedProperty]);

  useEffect(() => {
    console.log("ROHIT - cashflowTransactionsData - ", cashflowTransactionsData);
  }, [cashflowTransactionsData]);
  

  //   useEffect(() => {
  //     console.log("rentsByProperty - ", rentsByProperty);
  //   }, [rentsByProperty]);

  //   useEffect(() => {
  //     console.log("profits - ", profits);
  //   }, [profits]);
  //   useEffect(() => {
  //     console.log("payouts - ", payouts);
  //   }, [payouts]);

  useEffect(() => {
    // fetchCashflow(profileId)
    //   .then((data) => {
    //     setCashflowData(data);
    //     setProfitabilityData(data?.Profit);
    //     setTransactionsData(data?.Transactions);
    //     // let currentMonthYearRevenueExpected = get
    //   })
    //   .catch((error) => {
    //     console.error("Error fetching cashflow data:", error);
    //   });

      fetchCashflowTransactions(profileId)
      .then((data) => {        
        setCashflowTransactionsData(data);
        setCashflowData(data);
        // setProfitabilityData(data?.Profit);
        // setTransactionsData(data?.Transactions);
        // let currentMonthYearRevenueExpected = get
      })
      .catch((error) => {
        console.error("Error fetching cashflow data:", error);
      });

    

    fetchProperties(profileId)
      .then((data) => {
        setPropertyList(data?.Property?.result);
      })
      .catch((error) => {
        console.error("Error fetching PropertyList:", error);
      });
  }, []);

  const refreshCashflowData = () => {
    // fetchCashflow(profileId)
    //   .then((data) => {
    //     setCashflowData(data);
    //     setProfitabilityData(data?.Profit);
    //     setTransactionsData(data?.Transactions);
    //     // let currentMonthYearRevenueExpected = get
    //   })
    //   .catch((error) => {
    //     console.error("Error fetching cashflow data:", error);
    //   });
    fetchCashflowTransactions(profileId)
      .then((data) => {
        
        setCashflowTransactionsData(data?.Transactions);        
      })
      .catch((error) => {
        console.error("Error fetching cashflow transactions data:", error);
      });
  };

  useEffect(() => {
    //PROFITS
    const allProfitData = cashflowData?.result;
    let filteredProfitData = [];
    if (selectedProperty === "ALL") {
      filteredProfitData = allProfitData;
      // console.log("filteredProfitData - ", filteredProfitData);
    } else {
      filteredProfitData = allProfitData?.filter((item) => item.pur_property_id === selectedProperty);
      // console.log("filteredProfitData - ", filteredProfitData);
    }
    
    // const profitDatacurrentMonth = filteredProfitData;
    const profitDatacurrentMonth = filteredProfitData?.filter((item) => item.cf_month === month && item.cf_year === year); 
    // const profitDatacurrentMonth = filteredProfitData?.filter( item => item.cf_month != null && item.cf_year != null); // testing - uncomment to test last 12 months

    // console.table("226 - profitDatacurrentMonth - ", profitDatacurrentMonth)
    
    
    // const rentDataCurrentMonth = filteredProfitData?.filter((item) => (item.purchase_type === "Rent" || item.purchase_type === "Late Fee") && item.pur_cf_type === "revenue");
    // const rentDataCurrentMonth = profitDatacurrentMonth?.filter((item) => (item.purchase_type === "Rent" || item.purchase_type === "Late Fee") && item.pur_cf_type === "revenue");
    // const rentDataCurrentMonth = profitDatacurrentMonth?.filter((item) => item.pur_payer?.startsWith("350") && item.pur_receiver?.startsWith("600"));
    const rentDataCurrentMonth = profitDatacurrentMonth?.filter((item) => item.pur_receiver?.startsWith("600"));

    
    // const payoutsCurrentMonth = filteredProfitData?.filter((item) => (item.purchase_type === "Rent" || item.purchase_type === "Late Fee") && item.pur_cf_type === "expense");    
    // const payoutsCurrentMonth = profitDatacurrentMonth?.filter((item) => (item.purchase_type === "Rent" || item.purchase_type === "Late Fee") && item.pur_cf_type === "expense");
    // const payoutsCurrentMonth = profitDatacurrentMonth?.filter((item) => item.pur_payer?.startsWith("600") && item.pur_receiver?.startsWith("110"));
    const payoutsCurrentMonth = profitDatacurrentMonth?.filter((item) => item.pur_payer?.startsWith("600"));


    const payoutsByProperty = payoutsCurrentMonth?.reduce((acc, item) => {
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
          payoutItems: [],
          totalExpected: 0,
          totalActual: 0,
        };
      }

      acc[propertyUID].payoutItems.push(item);
      acc[propertyUID].totalExpected += totalExpected;
      acc[propertyUID].totalActual += totalActual;
      return acc;
    }, {});

    // setPayouts(payoutsByProperty);
    setUnsortedPayouts(payoutsByProperty)

    const totalPayouts = payoutsByProperty
      ? Object.values(payoutsByProperty).reduce(
          (acc, property) => {
            acc.totalExpected += property.totalExpected;
            acc.totalActual += property.totalActual;
            return acc;
          },
          { totalExpected: 0, totalActual: 0 }
        )
      : { totalExpected: 0, totalActual: 0 };

    setPayoutsTotal(totalPayouts);

    // const profitsCurrentMonth = profitDatacurrentMonth?.filter(item => item.purchase_type === "Management" || item.purchase_type === "Management - Late Fees");
    // const profitsCurrentMonth = profitDatacurrentMonth?.filter(item => item.purchase_type === "Management" || item.purchase_type === "Management - Late Fees");
    // const profitsCurrentMonth = profitDatacurrentMonth?.filter((item) => item.pur_payer?.startsWith("110") && item.pur_receiver?.startsWith("600"));
    // // const profitsCurrentMonth = filteredProfitData?.filter((item) => item.pur_payer?.startsWith("110") && item.pur_receiver?.startsWith("600"));
  
    

    const rentsDataByProperty = rentDataCurrentMonth?.reduce((acc, item) => {
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
          rentItems: [],
          totalExpected: 0,
          totalActual: 0,
        };
      }

      acc[propertyUID].rentItems.push(item);
      acc[propertyUID].totalExpected += totalExpected;
      acc[propertyUID].totalActual += totalActual;
      return acc;
    }, {});

    setUnsortedRentsData(rentsDataByProperty)

    const totalRents = rentsDataByProperty
      ? Object.values(rentsDataByProperty).reduce(
          (acc, property) => {
            acc.totalExpected += property.totalExpected;
            acc.totalActual += property.totalActual;
            return acc;
          },
          { totalExpected: 0, totalActual: 0 }
        )
      : { totalExpected: 0, totalActual: 0 };

    setRentsTotal(totalRents);

    // console.log(rentsDataByProperty)

  }, [month, year, cashflowData, selectedProperty]);

  useEffect(() => {
    if(unsortedPayouts && unsortedRentsData){

      // sort payouts

      const payoutsArray = Object.entries(unsortedPayouts);
      const sortedPayoutsArray = payoutsArray.sort((a, b) => {
        return a[0].localeCompare(b[0]);  // a[0] and b[0] represent propertyUID keys
      });

      const sortedPayoutsByProperty = Object.fromEntries(sortedPayoutsArray);
      console.log("payouts - ", sortedPayoutsByProperty)
      setPayouts(sortedPayoutsByProperty);


      // sort rent data

      const rentArray = Object.entries(unsortedRentsData);

      const sortedRentArray = rentArray.sort((a, b) => {
        return a[0].localeCompare(b[0]);  // a[0] and b[0] represent propertyUID keys
      });

      const sortedRentData = Object.fromEntries(sortedRentArray);
      console.log("rent data - ", sortedRentData)
      setRentsByProperty(sortedRentData)

      const profitDataByProperty = calculateProfitsByProperty(rentsByProperty, payouts);
      setProfits(profitDataByProperty);

      const totalProfits = Object.values(profitDataByProperty).reduce(
        (acc, property) => {
          acc.totalExpectedProfit += property.expectedProfit;
          acc.totalActualProfit += property.actualProfit;
          return acc;
        },
        { totalExpectedProfit: 0, totalActualProfit: 0 }
      );

      setProfitsTotal(totalProfits);
    }
  }, [unsortedPayouts, unsortedRentsData])

  const calculateProfitsByProperty = (rentsDataByProperty, payoutsByProperty) => {
    const profitDataByProperty = {};
  
    Object.keys(rentsDataByProperty).forEach((propertyUID) => {
      const rentData = rentsDataByProperty[propertyUID];
      const payoutData = payoutsByProperty[propertyUID] || {
        totalExpected: 0,
        totalActual: 0,
        payoutItems: [],
      };
  
      const totalRentExpected = rentData.totalExpected || 0;
      const totalRentActual = rentData.totalActual || 0;
  
      const totalPayoutExpected = payoutData.totalExpected || 0;
      const totalPayoutActual = payoutData.totalActual || 0;
  
      const profitRentItems = rentData.rentItems.filter(
        (item) => parseFloat(item.expected) > 0 || parseFloat(item.actual) > 0
      );
  
      const profitPayoutItems = payoutData.payoutItems.filter(
        (item) => parseFloat(item.expected) > 0 || parseFloat(item.actual) > 0
      );
  
      const expectedProfit = totalRentExpected - totalPayoutExpected;
      const actualProfit = totalRentActual - totalPayoutActual;

      profitDataByProperty[propertyUID] = {
        propertyInfo: rentData.propertyInfo,
        totalRentExpected,
        totalRentActual,
        totalPayoutExpected,
        totalPayoutActual,
        expectedProfit,
        actualProfit,
        profitItems: [...profitRentItems, ...profitPayoutItems],
      };
    });
  
    Object.keys(payoutsByProperty).forEach((propertyUID) => {
      if (!profitDataByProperty[propertyUID]) {
        const payoutData = payoutsByProperty[propertyUID];
        const totalPayoutExpected = payoutData.totalExpected || 0;
        const totalPayoutActual = payoutData.totalActual || 0;
  
        const totalRentExpected = 0;
        const totalRentActual = 0;
  
        const profitPayoutItems = payoutData.payoutItems.filter(
          (item) => parseFloat(item.expected) > 0 || parseFloat(item.actual) > 0
        );
  
        const expectedProfit = totalRentExpected - totalPayoutExpected;
        const actualProfit = totalRentActual - totalPayoutActual;
  
        profitDataByProperty[propertyUID] = {
          propertyInfo: payoutData.propertyInfo,
          totalRentExpected,
          totalRentActual,
          totalPayoutExpected,
          totalPayoutActual,
          expectedProfit,
          actualProfit,
          profitItems: profitPayoutItems,
        };
      }
    });
  
    return profitDataByProperty;
  };

  // useEffect(() => {
  //     console.log("revenueByType", revenueByType)
  //     console.log("expenseByType", expenseByType)
  // }, [revenueByType, expenseByType])

  return (
    <ThemeProvider theme={theme}>
      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
        <CircularProgress color='inherit' />
      </Backdrop>

      <Container maxWidth='lg' sx={{ paddingTop: "10px", height: "90vh" }}>
        <Grid container spacing={6} sx={{ height: "90%" }}>
          <Grid item xs={12} md={4}>
            <ManagerCashflowWidget
              propsMonth={month}
              propsYear={year}
              profitsTotal={profitsTotal}
              rentsTotal={rentsTotal}
              payoutsTotal={payoutsTotal}
              graphData={cashflowTransactionsData?.result}
              setCurrentWindow={setCurrentWindow}
              propertyList={propertyList}
              selectedProperty={selectedProperty}
              setSelectedProperty={setSelectedProperty}
            />
          </Grid>

          <Grid container item xs={12} md={8} columnSpacing={6}>
            {currentWindow === "PROFITABILITY" && (
              <ManagerProfitability
                propsMonth={month}
                propsYear={year}
                profitsTotal={profitsTotal}
                profits={profits}
                rentsTotal={rentsTotal}
                rentsByProperty={rentsByProperty}
                payoutsTotal={payoutsTotal}
                payouts={payouts}
                setMonth={setMonth}
                setYear={setYear}
              />
            )}
            {currentWindow === "TRANSACTIONS" && (
              <ManagerTransactions
                propsMonth={month}
                propsYear={year}
                setMonth={setMonth}
                setYear={setYear}
                // transactionsData={transactionsData}
                transactionsData={cashflowTransactionsData}
                setSelectedPayment={setSelectedPayment}
                setCurrentWindow={setCurrentWindow}
                selectedProperty={selectedProperty}
              />
            )}
            {currentWindow === "PAYMENTS" && <PaymentsManager />}
            {currentWindow === "MAKE_PAYMENT" && <MakePayment selectedPayment={selectedPayment} refreshCashflowData={refreshCashflowData} setCurrentWindow={setCurrentWindow} />}
            {currentWindow === "ADD_REVENUE" && <AddRevenue propertyList={propertyList} setCurrentWindow={setCurrentWindow} />}
            {currentWindow === "ADD_EXPENSE" && <AddExpense propertyList={propertyList} setCurrentWindow={setCurrentWindow} />}
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

// This is the function that controls what and how the cashflow data is displayed
function StatementTable(props) {
  console.log("In Statement Table: ", props);
  const navigate = useNavigate();

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
    console.log(item);
    navigate(type, { state: { itemToEdit: item, edit: true } });
  }

  // console.log("--debug-- tableType categoryTotalMapping", tableType, categoryTotalMapping)
  // console.log("activeView", activeView)
  // console.log("statement table year/month", year, month)

  function getCategoryCount(category) {
    console.log("getCategoryCount - allItems - ", allItems);
    let items = allItems.filter((item) => item.purchase_type.toUpperCase() === category.toUpperCase() && item.cf_month === month && item.cf_year === year);
    return "(" + items.length + ")";
  }

  function getCategoryItems(category, type) {
    let filteredIitems = allItems.filter((item) => item.purchase_type.toUpperCase() === category.toUpperCase() && item.cf_month === month && item.cf_year === year);
    let items = filteredIitems?.map((item) => ({ ...item, property: JSON.parse(item.property) }));

    console.log("getCategoryItems", items);
    var key = "total_paid";
    if (activeView === "Cashflow") {
      key = "total_paid";
    } else {
      key = "pur_amount_due";
    }
    return (
      <>
        {items.map((item, index) => {
          return activeView === "Cashflow" ? (
            <TableRow key={index} onClick={() => handleNavigation(type, item)}>
              <TableCell></TableCell>
              <TableCell>
                <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
                  {" "}
                  {item.property_address} {item.property_unit}{" "}
                </Typography>
              </TableCell>
              {/* <TableCell>
                <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>${item[key] ? item[key] : 0}</Typography>
              </TableCell> */}
              <TableCell>
                <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
                  ${item["pur_amount_due"] ? item["pur_amount_due"] : 0}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
                  ${item["total_paid"] ? item["total_paid"] : 0}
                </Typography>
              </TableCell>
              {/* <TableCell align="right">
                <DeleteIcon />
              </TableCell> */}
            </TableRow>
          ) : (
            //   <>
            //   <Accordion
            //       sx={{
            //         backgroundColor: theme.palette.custom.pink,
            //         boxShadow: "none",
            //       }}
            //       key={category}
            //     >
            //       <AccordionSummary sx={{ flexDirection: "space-between" }} expandIcon={<ExpandMoreIcon />} onClick={(e) => e.stopPropagation()}>
            //         <TableRow key={index}>
            //           <TableCell>{item.purchase_uid}</TableCell>
            //           <TableCell>{item.pur_property_id}</TableCell>
            //           <TableCell>{item.pur_payer}</TableCell>
            //           <TableCell>
            //             <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
            //               {" "}
            //               {item.property_address} {item.property_unit}{" "}
            //             </Typography>
            //           </TableCell>
            //           <TableCell>{item.pur_notes}</TableCell>
            //           <TableCell>{item.pur_description}</TableCell>
            //           <TableCell>
            //             <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
            //               ${item["pur_amount_due"] ? item["pur_amount_due"] : 0}
            //             </Typography>
            //           </TableCell>
            //           <TableCell>
            //             <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
            //               ${item["total_paid"] ? item["total_paid"] : 0}
            //             </Typography>
            //           </TableCell>
            //           {/* <TableCell align="right">
            //             <EditIcon />
            //           </TableCell> */}
            //         </TableRow>
            //       </AccordionSummary>
            //       <AccordionDetails>
            //           {
            //             item?.property?.map( property => {
            //               return (
            //                 <TableRow>
            //                   <TableCell>
            //                     <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
            //                       {property.property_uid}
            //                     </Typography>
            //                   </TableCell>
            //                   <TableCell>
            //                     <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
            //                       {property.property_address}
            //                     </Typography>
            //                   </TableCell>
            //                   <TableCell>
            //                     <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
            //                       {property.property_unit}
            //                     </Typography>
            //                   </TableCell>
            //                   <TableCell>
            //                     <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
            //                       ${property.individual_purchase[0]?.pur_amount_due? property.individual_purchase[0]?.pur_amount_due : 0}
            //                     </Typography>
            //                   </TableCell>
            //                   <TableCell>
            //                     <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
            //                       ${property.individual_purchase[0]?.total_paid? property.individual_purchase[0]?.total_paid : 0}
            //                     </Typography>
            //                   </TableCell>

            //                 </TableRow>
            //               );
            //             })
            //           }
            //       </AccordionDetails>
            //     </Accordion>

            // </>
            <>
              <TableRow>
                <TableCell>
                  <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight, marginLeft: "25px" }}>Property UID</Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>Property Address</Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>Property Unit</Typography>
                </TableCell>
                <TableCell align='right'>
                  <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>Expected</Typography>
                </TableCell>
                <TableCell align='right'>
                  <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight, marginRight: "25px" }}>Actual</Typography>
                </TableCell>
              </TableRow>

              {item?.property?.map((property) => {
                return (
                  <TableRow sx={{}}>
                    <TableCell>
                      <Typography sx={{ fontSize: theme.typography.smallFont, marginLeft: "25px" }}>{property.property_uid}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: theme.typography.smallFont }}>{property.property_address}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: theme.typography.smallFont }}>{property.property_unit}</Typography>
                    </TableCell>
                    <TableCell align='right'>
                      <Typography sx={{ fontSize: theme.typography.smallFont }}>
                        ${property.individual_purchase[0]?.pur_amount_due ? property.individual_purchase[0]?.pur_amount_due : 0}
                      </Typography>
                    </TableCell>
                    <TableCell align='right'>
                      <Typography sx={{ fontSize: theme.typography.smallFont, marginRight: "25px" }}>
                        ${property.individual_purchase[0]?.total_paid ? property.individual_purchase[0]?.total_paid : 0}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </>
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
                <AccordionSummary sx={{ flexDirection: "row-reverse" }} expandIcon={<ExpandMoreIcon />} onClick={(e) => e.stopPropagation()}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
                            {" "}
                            {category} {getCategoryCount(category)}{" "}
                          </Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>${value ? value : 0}</Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>${value ? value : 0}</Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                  </Table>
                </AccordionSummary>
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
                <AccordionSummary sx={{ flexDirection: "space-between" }} expandIcon={<ExpandMoreIcon />} onClick={(e) => e.stopPropagation()}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: "150px" }}>
                          <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
                            {" "}
                            {category} {getCategoryCount(category)}{" "}
                          </Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight, width: "250px" }}>
                            ${value ? value : 0}
                          </Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
                            ${categoryTotalMapping[category] ? categoryTotalMapping[category] : 0}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                  </Table>
                </AccordionSummary>
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
