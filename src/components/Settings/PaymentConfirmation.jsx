import React, { Component, useEffect, useState, useRef } from "react";
import {
  Paper,
  Radio,
  RadioGroup,
  Button,
  Box,
  Stack,
  ThemeProvider,
  Checkbox,
  Typography,
  TextField,
  FormControlLabel,
  AccordionDetails,
  Grid,
} from "@mui/material";
import theme from "../../theme/theme";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { useLocation, useNavigate } from "react-router-dom";
import { alpha, makeStyles } from "@material-ui/core/styles";
import { useUser } from "../../contexts/UserContext";
import APIConfig from "../../utils/APIConfig";
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../utils/httpMiddleware";


const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiFilledInput-root": {
      backgroundColor: "#D6D5DA", // Update the background color here
      borderRadius: 10,
      height: 30,
      marginBlock: 10,
    },
  },
  typography: {
    backgroundColor: "#D6D5DA",
    borderRadius: 10,
    height: 30,
    marginBlock: 10,
    display: "flex",
    alignItems: "center",
  },
}));

export default function PaymentConfirmation() {
  const location=useLocation()
  const { getProfileId, paymentRoutingBasedOnSelectedRole, selectedRole } = useUser();
  const hasRun = useRef(false);

  const [showSpinner, setShowSpinner] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false)
  const [FailedMessage, setFailedMessage] = useState("")

  const classes = useStyles();
  const navigate = useNavigate();

  async function getPaymentStatus(){
    setShowSpinner(true)

    const headers = {
      "Content-Type": "application/json",
    };

    const data = {
      session_id : localStorage.getItem("session_id"),
      business_code: localStorage.getItem("payment_notes")
    }

    try {
      const response = await fetch("https://huo8rhh76i.execute-api.us-west-1.amazonaws.com/dev/api/v2/createEasyACHPaymentIntent", {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
      });

      let resultOfResponse = await response.json()    

      if (response.ok && resultOfResponse.status === "succeeded") {
        handleSubmit(resultOfResponse.client_secret, resultOfResponse.payment_method)

      } else if(resultOfResponse.status === "processing"){
          await new Promise(resolve => setTimeout(resolve, 3000));
          await getPaymentStatus();
      
      }else{
        setFailedMessage(resultOfResponse.failure_message)
        setPaymentFailed(true)
      }
    } catch (error) {
      console.error("An error occurred while making the POST request", error);
    }

    // setPaymentProcess(false)

    setShowSpinner(false)
  }

  useEffect(()=>{
    if (hasRun.current) {
      return; 
    }
    hasRun.current = true;

    getPaymentStatus()

  }, [])

  const handleSubmit = async (paymentIntent, paymentMethod, e) => {
    setShowSpinner(true)

    let paymentData = {
      pay_purchase_id: JSON.parse(localStorage.getItem("pay_purchase_id")),
      pay_fee: parseFloat(localStorage.getItem("pay_fee")),
      pay_total: parseFloat(localStorage.getItem("pay_total")),
      // cashflow_total: localStorage.getItem("cashflow_total"),    //payment.balance
      cashflow_total: undefined,
      payment_notes: localStorage.getItem("payment_notes"),
      pay_charge_id: "stripe transaction key",
      payment_type: localStorage.getItem("payment_type"),
      payment_verify: "Unverified",
      paid_by: getProfileId(),
      payment_intent: paymentIntent,
      payment_method: paymentMethod,
    };

    await fetch(`${APIConfig.baseURL.dev}/makePayment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),

    }).then((e) => {
      if(selectedRole === "MANAGER"){
        navigate("/managerDashboard")
      }else if(selectedRole === "TENANT"){
        navigate("/tenantDashboard", {state: {selectedProperty: JSON.parse(localStorage.getItem("selectedProperty"))}})
      }else{
        navigate("/ownerDashboard")
      }
      // setShowSpinner(false)
    });

    setShowSpinner(false)
  
  }

  return (
    <div>
      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
          <CircularProgress color='inherit' />
      </Backdrop>

      <Grid container xs={12}>
        <Grid container item xs={12} display={"flex"} justifyContent={"center"} alignItems={"center"}>
          {paymentFailed && (<Box>
            <Typography>Payment has Failed!!</Typography>
            <Typography>{FailedMessage}</Typography>
            <Button
              variant='contained'
              onClick={()=>{navigate("/tenantDashboard")}}
              sx={{
                backgroundColor: "#3D5CAC",
                color: theme.palette.background.default,
                width: "200px", // Center the button horizontally
                borderRadius: "10px", // Rounded corners
                margin: "10px", // Add some spacing to the top
              }}
            >
              Go To Dashboard
            </Button>
          </Box>)}
        </Grid>
      </Grid>
    </div>
  );
}
