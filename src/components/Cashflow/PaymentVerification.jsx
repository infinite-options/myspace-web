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
import VerifyPayments from "../Payments/VerifyPayments";


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

export default function PaymentVerification() {
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

  const [cashflowData, setCashflowData] = useState(null); // Cashflow data from API

  const [rentsByProperty, setRentsByProperty] = useState([]); //current month
  const [profits, setProfits] = useState([]); //current month
  const [payouts, setPayouts] = useState([]); //current month

  const [profitsTotal, setProfitsTotal] = useState({}); //current month
  const [rentsTotal, setRentsTotal] = useState({}); //current month
  const [payoutsTotal, setPayoutsTotal] = useState({}); //current month

  const [profitabilityData, setProfitabilityData] = useState([]);
  const [transactionsData, setTransactionsData] = useState([]);

  const [currentWindow, setCurrentWindow] = useState(location.state?.currentWindow || "PROFITABILITY");

  const [selectedPayment, setSelectedPayment] = useState(null);

  const [propertyList, setPropertyList] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState("ALL");

  async function fetchCashflow(userProfileId, month, year) {
    setShowSpinner(true);
    try {
      // const cashflow = await axios.get(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/cashflowByOwner/${userProfileId}/TTM`);
      // const cashflow = await axios.get(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/cashflowByOwner/${userProfileId}/TTM`);
      // const cashflow = await axios.get(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/cashflow/${userProfileId}/TTM`);
      // const cashflow = await axios.get(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/cashflow/110-000003/TTM`);
      const cashflow = await axios.get(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/cashflowRevised/${userProfileId}`);
    //   console.log("Manager Cashflow Data: ", cashflow.data);
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
    //   console.log("Manager Properties: ", properties.data);
      setShowSpinner(false);
      return properties.data;
    } catch (error) {
      console.error("Error fetching properties data:", error);
      setShowSpinner(false);
    }
  }

  useEffect(() => {
    // console.log("cashflowData - ", cashflowData);
  }, [cashflowData]);

  useEffect(() => {
    // console.log("propertyList - ", propertyList);
  }, [propertyList]);

  useEffect(() => {
    // console.log("ManagerCashflow - selectedProperty - ", selectedProperty);
  }, [selectedProperty]);

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
    fetchCashflow(profileId)
      .then((data) => {
        setCashflowData(data);
        setProfitabilityData(data?.Profit);
        setTransactionsData(data?.Transactions);
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
    fetchCashflow(profileId)
      .then((data) => {
        setCashflowData(data);
        setProfitabilityData(data?.Profit);
        setTransactionsData(data?.Transactions);
        // let currentMonthYearRevenueExpected = get
      })
      .catch((error) => {
        console.error("Error fetching cashflow data:", error);
      });
  };

  useEffect(() => {
    //PROFITS
    const allProfitData = cashflowData?.Profit?.result;
    let filteredProfitData = [];
    if (selectedProperty === "ALL") {
      filteredProfitData = allProfitData;
      // console.log("filteredProfitData - ", filteredProfitData);
    } else {
      filteredProfitData = allProfitData?.filter((item) => item.property_id === selectedProperty);
      // console.log("filteredProfitData - ", filteredProfitData);
    }
    
    // const profitDatacurrentMonth = filteredProfitData;
    const profitDatacurrentMonth = filteredProfitData?.filter((item) => item.cf_month === month && item.cf_year === year); 
    // const profitDatacurrentMonth = filteredProfitData?.filter( item => item.cf_month != null && item.cf_year != null); // testing - uncomment to test last 12 months

    // console.table("226 - profitDatacurrentMonth - ", profitDatacurrentMonth)
    
    
    // const rentDataCurrentMonth = filteredProfitData?.filter((item) => (item.purchase_type === "Rent" || item.purchase_type === "Late Fee") && item.pur_cf_type === "revenue");
    // const rentDataCurrentMonth = profitDatacurrentMonth?.filter((item) => (item.purchase_type === "Rent" || item.purchase_type === "Late Fee") && item.pur_cf_type === "revenue");
    const rentDataCurrentMonth = profitDatacurrentMonth?.filter((item) => item.pur_payer?.startsWith("350") && item.pur_receiver?.startsWith("600"));

    
    // const payoutsCurrentMonth = filteredProfitData?.filter((item) => (item.purchase_type === "Rent" || item.purchase_type === "Late Fee") && item.pur_cf_type === "expense");    
    // const payoutsCurrentMonth = profitDatacurrentMonth?.filter((item) => (item.purchase_type === "Rent" || item.purchase_type === "Late Fee") && item.pur_cf_type === "expense");
    const payoutsCurrentMonth = profitDatacurrentMonth?.filter((item) => item.pur_payer?.startsWith("600") && item.pur_receiver?.startsWith("110"));


    const payoutsByProperty = payoutsCurrentMonth?.reduce((acc, item) => {
      const propertyUID = item.property_id;
      const propertyInfo = {
        property_id: item.property_id,
        property_address: item.property_address,
        property_unit: item.property_unit,
      };

      const totalExpected = parseFloat(item.pur_amount_due_total) || 0;
      const totalActual = parseFloat(item.total_paid_total) || 0;

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
    setPayouts(payoutsByProperty);
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
    // console.log("totalPayouts - ", totalPayouts);
    setPayoutsTotal(totalPayouts);

    // const profitsCurrentMonth = profitDatacurrentMonth?.filter(item => item.purchase_type === "Management" || item.purchase_type === "Management - Late Fees");
    // const profitsCurrentMonth = profitDatacurrentMonth?.filter(item => item.purchase_type === "Management" || item.purchase_type === "Management - Late Fees");
    const profitsCurrentMonth = profitDatacurrentMonth?.filter((item) => item.pur_payer?.startsWith("110") && item.pur_receiver?.startsWith("600"));
    // const profitsCurrentMonth = filteredProfitData?.filter((item) => item.pur_payer?.startsWith("110") && item.pur_receiver?.startsWith("600"));
    

    const profitsByProperty = profitsCurrentMonth?.reduce((acc, item) => {
      const propertyUID = item.property_id;
      const propertyInfo = {
        property_id: item.property_id,
        property_address: item.property_address,
        property_unit: item.property_unit,
      };

      const totalExpected = parseFloat(item.pur_amount_due_total) || 0;
      const totalActual = parseFloat(item.total_paid_total) || 0;

      if (!acc[propertyUID]) {
        // acc[propertyUID] = [];
        acc[propertyUID] = {
          propertyInfo: propertyInfo,
          profitItems: [],
          totalExpected: 0,
          totalActual: 0,
        };
      }

      acc[propertyUID].profitItems.push(item);
      acc[propertyUID].totalExpected += totalExpected;
      acc[propertyUID].totalActual += totalActual;
      return acc;
    }, {});

    // console.log("profitsByProperty - ", profitsByProperty);
    setProfits(profitsByProperty);
    const totalProfits = profitsByProperty
      ? Object.values(profitsByProperty).reduce(
          (acc, property) => {
            acc.totalExpected += property.totalExpected;
            acc.totalActual += property.totalActual;
            return acc;
          },
          { totalExpected: 0, totalActual: 0 }
        )
      : { totalExpected: 0, totalActual: 0 };
    // console.log("totalProfits - ", totalProfits);
    setProfitsTotal(totalProfits);

    const rentsDataByProperty = rentDataCurrentMonth?.reduce((acc, item) => {
      const propertyUID = item.property_id;
      const propertyInfo = {
        property_id: item.property_id,
        property_address: item.property_address,
        property_unit: item.property_unit,
      };

      const totalExpected = parseFloat(item.pur_amount_due_total) || 0;
      const totalActual = parseFloat(item.total_paid_total) || 0;

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

    setRentsByProperty(rentsDataByProperty);
    // console.log("rentsDataByProperty - ", rentsDataByProperty);
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
    // console.log("totalRents - ", totalRents);
    setRentsTotal(totalRents);
  }, [month, year, cashflowData, selectedProperty]);

  // useEffect(() => {
  //     console.log("revenueByType", revenueByType)
  //     console.log("expenseByType", expenseByType)
  // }, [revenueByType, expenseByType])

  const propsForPayments = {
    profitsTotal,
    rentsTotal,
    payoutsTotal,
    propsMonth : month,
    propsYear: year,
    graphData: profitabilityData?.result,
  }

  return (
    <ThemeProvider theme={theme}>
      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
        <CircularProgress color='inherit' />
      </Backdrop>

      <Container maxWidth='lg' sx={{ paddingTop: "10px", height: "90vh" }}>
        <Grid container spacing={6} sx={{ height: "90%" }}>
          <Grid container item xs={12} md={12} columnSpacing={6}>
            <VerifyPayments managerCashflowWidgetData={propsForPayments}/>
          </Grid>
          <Grid item xs={12} md={4}>
            <ManagerCashflowWidget
              propsMonth={month}
              propsYear={year}
              profitsTotal={profitsTotal}
              rentsTotal={rentsTotal}
              payoutsTotal={payoutsTotal}
              graphData={profitabilityData?.result}
              setCurrentWindow={setCurrentWindow}
              propertyList={propertyList}
              selectedProperty={selectedProperty}
              setSelectedProperty={setSelectedProperty}
            />
          </Grid>

          {/* <Grid container item xs={12} md={12} columnSpacing={6}>
            <VerifyPayments managerCashflowWidgetData={propsForPayments}/>
          </Grid> */}
        </Grid>
      </Container>
    </ThemeProvider>
  );
}
