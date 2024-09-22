import { Box, Typography, Button, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function RevenueWidget({ revenueData }) {
  // console.log("In Revenue Widget ", revenueData);

  const navigate = useNavigate();
  const revenue = revenueData?.revenue?.result[0]?.received_expected;
  const expenses = revenueData?.expense?.result[0]?.paid_expected;
  const profit = revenue - expenses;
  const revenueReceived = revenueData?.revenue?.result[0]?.received_actual;
  const expensesReceived = revenueData?.expense?.result[0]?.paid_actual;
  const profitReceived = revenueReceived - expensesReceived;
  let currentDate = new Date();
  let currentMonth = currentDate.toLocaleString("default", { month: "long" });  
  let currentYear = currentDate.getFullYear().toString();

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
              <Grid item xs={8}>
                <Typography sx={{ fontWeight: "bold" }}>{currentMonth} Profit (Expected vs Actual)</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography sx={{ fontWeight: "bold" }}>{profit? profit.toFixed(2) : '0.00'}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography sx={{ fontWeight: "bold" }}>{profitReceived? profitReceived.toFixed(2) : '0.00'}</Typography>
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
              <Grid item xs={8}>
                <Typography sx={{ fontWeight: "bold" }}>{currentMonth} Revenue (Expected vs Actual)</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography sx={{ fontWeight: "bold" }}>{revenue ? revenue : '0.00'}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography sx={{ fontWeight: "bold" }}>{revenueReceived ? revenueReceived : '0.00'}</Typography>
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
              <Grid item xs={8}>
                <Typography sx={{ fontWeight: "bold" }}>{currentMonth} Expenses (Expected vs Actual)</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography sx={{ fontWeight: "bold" }}>{expenses ? expenses : '0.00'}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography sx={{ fontWeight: "bold" }}>{expensesReceived ? expensesReceived : '0.00'}</Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid container item xs={12} md={3} direction='row' justifyContent='center' alignItems='center' sx={{ padding: "10px" }}>
          <Grid item xs={6} md={12} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Button
              variant='contained'
              sx={{
                width: "60%",
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
                navigate("/managerCashflow", { state: { currentWindow: "PAYMENTS" } });
              }}
            >
              Pay Bills
            </Button>
          </Grid>
          <Grid item xs={6} md={12} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                navigate("/managerCashflow", { state: { currentWindow: "TRANSACTIONS" } });
              }}
              variant='contained'
              sx={{
                width: "60%",
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
          <Grid item xs={6} md={12} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                // navigate("/managerCashflow", { state: { currentWindow: "TRANSACTIONS" } });
                navigate("/paymentVerification");                
              }}
              variant='contained'
              sx={{
                width: "60%",
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
