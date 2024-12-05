import { Box, Typography, Button, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState, useEffect} from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import theme from "../../../theme/theme";

export default function RevenueWidget({ revenueData, cashflowStatusData }) {
  // console.log("In Revenue Widget ", revenueData);

  const navigate = useNavigate();  
  let currentDate = new Date();
  let currentMonth = currentDate.toLocaleString("default", { month: "long" });  
  let currentYear = currentDate.getFullYear().toString();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [currentMonthExpense, setCurrentMonthExpense] = useState(null);
  const [currentMonthRevenue, setCurrentMonthRevenue] = useState(null);
  const [currentMonthProfit, setCurrentMonthProfit] = useState(null);



  useEffect(() => {
    console.log("ROHIT - cashflowStatusData", cashflowStatusData);

    let revenue = { total_paid: 0, pur_amount_due: 0 };
    let expense = { total_paid: 0, pur_amount_due: 0 };
    let profit = { total_paid: 0, pur_amount_due: 0 };

    cashflowStatusData.forEach((item) => {
      const isCurrentMonth = item.cf_month === currentMonth;
      const isCurrentYear = item.cf_year === currentYear;

      if (isCurrentMonth && isCurrentYear) {
        if (item.pur_cf_type === "revenue" && item.purchase_type?.toUpperCase() !== "DEPOSIT" && item.purchase_type?.toUpperCase() !== "MANAGEMENT" && item.purchase_type?.toUpperCase() !== "MAINTENANCE") {
          revenue.total_paid += parseFloat(item.total_paid || 0);
          revenue.pur_amount_due += parseFloat(item.pur_amount_due || 0);
        } 
        
        if (item.pur_cf_type === "expense" || item.purchase_type?.toUpperCase() === "MANAGEMENT" || item.purchase_type?.toUpperCase() === "MAINTENANCE") {
          if (item.purchase_type?.toUpperCase() === "MANAGEMENT" || (item.purchase_type?.toUpperCase() === "MAINTENANCE" && item.pur_payer.startsWith("110"))) {
            expense.total_paid -= parseFloat(item.total_paid || 0);
            expense.pur_amount_due -= parseFloat(item.pur_amount_due || 0);
          } else {
            expense.total_paid += parseFloat(item.total_paid || 0);
            expense.pur_amount_due += parseFloat(item.pur_amount_due || 0);
          }
        } 
        
        // for profit
        if (item.purchase_type?.toUpperCase() === "MANAGEMENT") {
          profit.total_paid += parseFloat(item.total_paid || 0);
          profit.pur_amount_due += parseFloat(item.pur_amount_due || 0);
        }
      }
    });

    setCurrentMonthRevenue(revenue);
    setCurrentMonthExpense(expense);
    setCurrentMonthProfit(profit);

    // const expenseCurrentMonth = cashflowStatusData?.find((item) => item.cf_month === currentMonth && item.cf_year === currentYear && item.pur_cf_type === "expense");
    // const revenueCurrentMonth = cashflowStatusData?.find((item) => item.cf_month === currentMonth && item.cf_year === currentYear && item.pur_cf_type === "revenue");
    // const profitCurrentMonth = {
    //   pur_amount_due: (revenueCurrentMonth?.pur_amount_due || 0.00) - (expenseCurrentMonth?.pur_amount_due || 0.00),
    //   total_paid: (revenueCurrentMonth?.total_paid || 0.00) - (expenseCurrentMonth?.total_paid || 0.00 ),
    // }
  
    // // console.log("ROHIT - expenseCurrentMonth", expenseCurrentMonth);
    // // console.log("ROHIT - revenueCurrentMonth", revenueCurrentMonth);
    // // console.log("ROHIT - profitCurrentMonth", profitCurrentMonth);
    
    // setCurrentMonthExpense(expenseCurrentMonth);
    // setCurrentMonthRevenue(revenueCurrentMonth);
    // setCurrentMonthProfit(profitCurrentMonth);

    
  }, [cashflowStatusData]);

  return (
    <>
      <Grid
        onClick={() => navigate("/managerCashflow", { state: { currentWindow: "PROFITABILITY", month: currentMonth, year: currentYear } })}
        container
        sx={{ backgroundColor: "#f0f0f0", borderRadius: "10px", cursor: "pointer" }}
      >
        <Grid container item xs={12} md={9} spacing={2} sx={{ padding: "20px" }}>
          <Grid
            item
            xs={12}
            sx={{
              width: "100%",
              backgroundColor: "#160449",
              color: "#FFFFFF",
              fontWeight: "bold",
              marginBottom: "10px",
              borderRadius: "5px",
              padding: "5px",
            }}
          >
            <Grid container>
              <Grid item xs={isMobile? 6.8: 8}>
                <Typography sx={{width:"100%", textAlign: "left", fontWeight: "bold" }}>{currentMonth} Profit (Expected vs Actual)</Typography>
              </Grid>
              <Grid item xs={isMobile? 2.5 : 2}>
                {/* <Typography sx={{ fontWeight: "bold" }}>{profit? profit.toFixed(2) : '0.00'}</Typography> */}
                <Typography sx={{width:"100%", textAlign: "right", fontWeight: "bold" }}>{currentMonthProfit?.pur_amount_due?.toFixed(2) || '0.00'}</Typography>
              </Grid>
              <Grid item xs={isMobile? 2.5 : 2}>
                {/* <Typography sx={{ fontWeight: "bold" }}>{profitReceived? profitReceived.toFixed(2) : '0.00'}</Typography> */}
                <Typography sx={{width:"100%", textAlign: "right", fontWeight: "bold" }}>{currentMonthProfit?.total_paid?.toFixed(2) || '0.00'}</Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid
            item
            xs={12}
            sx={{
              width: "100%",
              backgroundColor: "#9EAED6",
              marginBottom: "10px",
              borderRadius: "5px",
              padding: "5px",
            }}
          >
            <Grid container>
              <Grid item xs={isMobile? 6.8: 8}>
                <Typography sx={{width:"100%", textAlign: "left", fontWeight: "bold" }}>{currentMonth} Revenue (Expected vs Actual)</Typography>
              </Grid>
              <Grid item xs={isMobile? 2.5: 2}>
                {/* <Typography sx={{ fontWeight: "bold" }}>{revenue ? revenue : '0.00'}</Typography> */}
                <Typography sx={{width:"100%", textAlign: "right", fontWeight: "bold" }}>{currentMonthRevenue?.pur_amount_due?.toFixed(2) || '0.00'}</Typography>
              </Grid>
              <Grid item xs={isMobile? 2.5: 2}>
                {/* <Typography sx={{ fontWeight: "bold" }}>{revenueReceived ? revenueReceived : '0.00'}</Typography> */}
                <Typography sx={{width:"100%", textAlign: "right", fontWeight: "bold" }}>{currentMonthRevenue?.total_paid?.toFixed(2) || '0.00'}</Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid
            item
            xs={12}
            sx={{
              width: "100%",
              backgroundColor: "#979797",
              borderRadius: "5px",
              padding: "5px",
            }}
          >
            <Grid container>
              <Grid item xs={isMobile? 6.8: 8}>
                <Typography sx={{width:"100%", textAlign: "left", fontWeight: "bold" }}>{currentMonth} Expenses (Expected vs Actual)</Typography>
              </Grid>
              <Grid item xs={isMobile? 2.5: 2}>
                {/* <Typography sx={{ fontWeight: "bold" }}>{expenses ? expenses : '0.00'}</Typography> */}
                <Typography sx={{width:"100%", textAlign: "right", fontWeight: "bold" }}>{currentMonthExpense?.pur_amount_due?.toFixed(2) || '0.00'}</Typography>
              </Grid>
              <Grid item xs={isMobile? 2.5: 2}>
                {/* <Typography sx={{ fontWeight: "bold" }}>{expensesReceived ? expensesReceived : '0.00'}</Typography> */}
                <Typography sx={{width:"100%", textAlign: "right", fontWeight: "bold" }}>{currentMonthExpense?.total_paid?.toFixed(2) || '0.00'}</Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid container item xs={12} md={3} direction='row' justifyContent='space-evenly' alignItems="center" sx={{ padding: "10px" }}>
          <Grid item xs={3} md={12} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Button
              variant='contained'
              sx={{
                width: isMobile? "90%" : "60%",
                // marginTop: '10px',
                backgroundColor: "#A9AAAB",
                color: "#19084B",
                fontWeight: "bold",
                fontSize: '12px',
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#A9AAAB",
                },
              }}
              onClick={(e) => {
                e.stopPropagation();
                // navigate("/payments")
                // navigate("/managerCashflow", { state: { currentWindow: "PAYMENTS" } });
                navigate("/paymentProcessing", { state: { currentWindow: "PAY_BILLS" } });
              }}
            >
              Pay Bills
            </Button>
          </Grid>
          <Grid item xs={4} md={12} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                // navigate("/managerCashflow", { state: { currentWindow: "TRANSACTIONS" } });
                navigate("/paymentProcessing", { state: { currentWindow: "TRANSACTIONS" } });
              }}
              variant='contained'
              sx={{
                width: isMobile? "90%" : "60%",
                // marginTop: '10px',
                backgroundColor: "#A9AAAB",
                color: "#19084B",
                fontWeight: "bold",
                fontSize: '12px',
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#A9AAAB",
                },
              }}
            >
              Transactions!
            </Button>
          </Grid>
          <Grid item xs={5} md={12} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Button
              onClick={(e) => {
                e.stopPropagation();                
                // navigate("/paymentVerification");                
                navigate("/paymentProcessing", { state: { currentWindow: "VERIFY_PAYMENTS" } });
              }}
              variant='contained'
              sx={{
                width: isMobile? "90%" : "60%",
                // marginTop: '10px',
                backgroundColor: "#A9AAAB",
                color: "#19084B",
                fontWeight: "bold",
                fontSize: '12px',
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#A9AAAB",
                },
              }}
            >
              Verify Payments
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
