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


export default function PaymentVerification() {
  const [showSpinner, setShowSpinner] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
        <CircularProgress color='inherit' />
      </Backdrop>    
      <Container maxWidth='lg' sx={{ paddingTop: "10px", height: "90vh" }}>
        <Grid container spacing={6} sx={{ height: "90%" }}>
          <Grid container item xs={12} md={12} columnSpacing={6}>
            <VerifyPayments  />
          </Grid>          
        </Grid>
      </Container>
    </ThemeProvider>
  );
}
