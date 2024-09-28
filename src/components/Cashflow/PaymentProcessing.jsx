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
import VerifyPayments from "../Payments/VerifyPayments";
import AddRevenue from "./AddRevenue";
import AddExpense from "./AddExpense";

import axios from "axios";


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
    // const [currentWindow, setCurrentWindow] = useState(location.state?.currentWindow || "VERIFY_PAYMENTS");    

    const [selectedPayment, setSelectedPayment] = useState(null);
    
    // const [selectedProperty, setSelectedProperty] = useState("ALL");

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

    const refreshCashflowData = () => {
        fetchCashflowTransactions(profileId)
          .then((data) => {
            
            setCashflowTransactionsData(data);        
          })
          .catch((error) => {
            console.error("Error fetching cashflow transactions data:", error);
          });
    };

    useEffect(() => {
        fetchCashflowTransactions(profileId)
        .then((data) => {        
        setCashflowTransactionsData(data);
        // setCashflowData(data);        
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
                    selectedProperty={"ALL"}
                  />
                )}
                {currentWindow === "PAY_BILLS" && <PaymentsManager />}
                {currentWindow === "VERIFY_PAYMENTS" && <VerifyPayments />}
                {currentWindow === "MAKE_PAYMENT" && <MakePayment selectedPayment={selectedPayment} refreshCashflowData={refreshCashflowData} setCurrentWindow={setCurrentWindow} />}                                
              </Grid>
            </Grid>
          </Container>
        </ThemeProvider>
      );

}

export default PaymentProcessing;