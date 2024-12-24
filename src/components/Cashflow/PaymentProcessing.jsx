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
  TextField,
  Container,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { DataGrid, } from "@mui/x-data-grid";
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
import VerifyPayments from "../Payments/VerifyPayments";
import AddRevenue from "./AddRevenue";
import AddExpense from "./AddExpense";
import ManagerSelectPayment from "./ManagerSelectPayment";

// import axios from "axios";
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../utils/httpMiddleware";
import VerifyPayments2 from "../Payments/VerifyPayments2";
import APIConfig from "../../utils/APIConfig";


const PaymentProcessing = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, getProfileId } = useUser(); // Access the user object from UserContext

    const profileId = getProfileId();
    const selectedRole = user.selectedRole; // Get the selected role from user object
    const [showSpinner, setShowSpinner] = useState(false);

    // const [activeButton, setActiveButton] = useState("Cashflow");

    // const [showChart, setShowChart] = useState("Current");

    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear().toString();

    const [month, setMonth] = useState(location.state?.month || currentMonth);
    const [year, setYear] = useState(location.state?.year || currentYear);      

    // const [cashflowData, setCashflowData] = useState(null);

    const [cashflowTransactionsData, setCashflowTransactionsData] = useState(null);

    // const [rentsByProperty, setRentsByProperty] = useState([]);
    // const [profits, setProfits] = useState([]);
    // const [payouts, setPayouts] = useState([]);

    // const [profitsTotal, setProfitsTotal] = useState({});
    // const [rentsTotal, setRentsTotal] = useState({});
    // const [payoutsTotal, setPayoutsTotal] = useState({});
    // const [unsortedPayouts, setUnsortedPayouts] = useState([])
    // const [unsortedRentsData, setUnsortedRentsData] = useState([])

    // const [profitabilityData, setProfitabilityData] = useState([]);
    // const [transactionsData, setTransactionsData] = useState([]);

    const [currentWindow, setCurrentWindow] = useState(location.state?.currentWindow || "TRANSACTIONS");
    const selectedRowsForPayBills = location.state?.selectedRows || [];
    // const [currentWindow, setCurrentWindow] = useState(location.state?.currentWindow || "VERIFY_PAYMENTS");    

    const [selectedPayment, setSelectedPayment] = useState(null);
    const [selectedPurGroup, setSelectedPurGroup] = useState(null);
    const selectedPurchasegrp = location?.state?.selectedPurchaseGroup || "";
    
    // const [selectedProperty, setSelectedProperty] = useState("ALL");

    async function fetchCashflowTransactions(userProfileId, month, year) {
        setShowSpinner(true);
        try {
    
          const cashflow = await axios.get(`${APIConfig.baseURL.dev}/cashflowTransactions/${userProfileId}/payment`);
          //console.log("Manager Cashflow Data: ", cashflow.data);
          setShowSpinner(false);
          return cashflow.data?.result;
        } catch (error) {
          console.error("Error fetching cashflow data:", error);
          setShowSpinner(false);
        }
    }

    const refreshCashflowData = () => {
        fetchCashflowTransactions(profileId)
          .then((data) => {
            const dataWithIndex = data?.map((item, index) => (
              {
                ...item,
                'index': index,
              }
            ))
            setCashflowTransactionsData(dataWithIndex);         
          })
          .catch((error) => {
            console.error("Error fetching cashflow transactions data:", error);
          });
    };

    useEffect(() => {
      setShowSpinner(true)
        
      fetchCashflowTransactions(profileId)
        .then((data) => {        
          const dataWithIndex = data?.map((item, index) => (
            {
              ...item,
              'index': index,
            }
          ))
          setShowSpinner(false)
          setCashflowTransactionsData(dataWithIndex);        
        })
        .catch((error) => {
        console.error("Error fetching cashflow data:", error);
        });                    
    }, []);



    return (
        <ThemeProvider theme={theme}>
          <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
            <CircularProgress color='inherit' />
          </Backdrop>
    
          <Container maxWidth='lg' sx={{ paddingTop: "10px", height: "90vh" }}>
            <Grid container spacing={6} sx={{ height: "90%" }}>              
              <Grid container item xs={12} columnSpacing={6}>             
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
                    setSelectedPurGroup={setSelectedPurGroup}
                    selectedProperty={"ALL"}
                  />
                )}
                {currentWindow === "PAY_BILLS" && <PaymentsManager setSelectedPayment={setSelectedPayment} setCurrentWindow={setCurrentWindow} page={"paymentProcessing"} selectedRowsForPayBills={selectedRowsForPayBills} transactionsData={cashflowTransactionsData}/>}                                
                {/* {currentWindow === "VERIFY_PAYMENTS" && <VerifyPayments />} */}
                
                {currentWindow === "MAKE_PAYMENT" && <MakePayment selectedPayment={selectedPayment} refreshCashflowData={refreshCashflowData} setCurrentWindow={setCurrentWindow} />}  
                {currentWindow === "SELECT_PAYMENT" && <ManagerSelectPayment selectedPayment={selectedPayment} selectedPurGroup={selectedPurGroup} />}                             
              </Grid>

              {currentWindow === "VERIFY_PAYMENTS" && <VerifyPayments2 selectedPurchaseRow={selectedPurchasegrp}  transactionsData={cashflowTransactionsData} />}
            </Grid>
          </Container>
        </ThemeProvider>
      );

}

export default PaymentProcessing;