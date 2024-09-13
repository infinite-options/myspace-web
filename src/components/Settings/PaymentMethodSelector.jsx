// React & Utility Imports
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { makeStyles } from "@material-ui/core/styles";
import { Paper, TextField, Radio, RadioGroup, Button, Box, Stack, Typography, FormControlLabel, Grid, FormControl, Divider, Container, ThemeProvider } from "@mui/material";

// Stripe Imports
import StripeFeesDialog from "./StripeFeesDialog";
import StripePayment from "./StripePayment";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

// Program Imports
import theme from "../../theme/theme";
import { useUser } from "../../contexts/UserContext";

// Payment Icons
import PayPal from "../../images/PayPal.png";
import Zelle from "../../images/Zelle.png";
import Venmo from "../../images/Venmo.png";
import Chase from "../../images/Chase.png";
import CreditCardIcon from "../../images/ion_card.png";
import BankIcon from "../../images/mdi_bank.png";
import Stripe from "../../images/Stripe.png";
import ApplePay from "../../images/ApplePay.png";

import APIConfig from "../../utils/APIConfig";

export default function PaymentMethodSelector(props) {
  const { getProfileId } = useUser();
  const navigate = useNavigate();
  const [showSpinner, setShowSpinner] = useState(false);
  const [paymentData, setPaymentData] = useState(props.paymentData);
  const [convenience_fee, setFee] = useState(0);
  const [balance, setBalance] = useState(parseFloat(paymentData?.balance));
  const [totalBalance, setTotalBalance] = useState(balance + convenience_fee);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [confirmationNumber, setConfirmationNumber] = useState("");
  const [isMakePaymentDisabled, setIsMakePaymentDisabled] = useState(true);
  const [stripePromise, setStripePromise] = useState(null);
  const [stripePayment, setStripePayment] = useState(false);
  const [stripeResponse, setStripeResponse] = useState(null);
  const [applePay, setApplePay] = useState(false);
  const [paymentConfirm, setPaymentConfirm] = useState(false);

  useEffect(() => {
    if ((selectedMethod === "Zelle" && confirmationNumber === "") || !selectedMethod) {
      setIsMakePaymentDisabled(true);
    } else {
      setIsMakePaymentDisabled(false);
    }
  }, [selectedMethod, confirmationNumber]);

  useEffect(() => {
    console.log("stripe payment", stripePayment);
  }, [stripePayment]);

  const [stripeDialogShow, setStripeDialogShow] = useState(false);
  const payment_url = {
    "Credit Card": "https://huo8rhh76i.execute-api.us-west-1.amazonaws.com/dev/api/v2/createPaymentIntent",
    "Bank Transfer": "https://huo8rhh76i.execute-api.us-west-1.amazonaws.com/dev/api/v2/createEasyACHPaymentIntent",
    Zelle: "https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/makePayment",
  };

  //Credit Card Handler
  function credit_card_handler(notes) {
    if (notes === "PMTEST") {
      // Fetch public key
      console.log("fetching public key");
      setShowSpinner(true);
      axios
        .post("https://huo8rhh76i.execute-api.us-west-1.amazonaws.com/dev/api/v2/getCorrectKeys/PMTEST")
        .then((result) => {
          console.log("(1 PaymentDetails) Stripe-key then result (1): " + JSON.stringify(result));
          setShowSpinner(false);
        })
        .catch((err) => {
          console.log(err);
          if (err.response) {
            // console.log("(1 PaymentDetails) error: " + JSON.stringify(err.response));
          }
          setShowSpinner(false);
        });
    } else {
      // Fetch public key live
      setShowSpinner(true);
      // console.log("fetching public key live");
      axios
        .post("https://huo8rhh76i.execute-api.us-west-1.amazonaws.com/dev/api/v2/getCorrectKeys/PM")
        .then((result) => {
          // console.log("(2 PaymentDetails) Stripe-key then result (1): " + JSON.stringify(result));
          setSelectedMethod(result.data.publicKey);
          setShowSpinner(false);
        })
        .catch((err) => {
          console.log(err);
          if (err.response) {
            // console.log("(2 PaymentDetails) error: " + JSON.stringify(err.response));
          }
          setShowSpinner(false);
        });
    }
  }

  const submit = async ({ paymentIntent, paymentMethod }) => {
    // console.log("In Submit Function");
    // console.log("paymentData", paymentData);
    // console.log("in submit in SelectPayment.jsx", convenience_fee);
    setPaymentConfirm(true);
    console.log("PAYMENT", paymentData.business_code)
    // console.log("--DEBUG-- in submit in SelectPayment.jsx paymentIntent output", paymentIntent);
    // console.log("--DEBUG-- in submit in SelectPayment.jsx paymentMethod output", paymentMethod);

    paymentIntent = paymentIntent === undefined ? "Zelle" : paymentIntent;
    paymentMethod = paymentMethod === undefined ? "Zelle" : paymentMethod;
    console.log("Re-Setting PI and PM: ", paymentIntent, paymentMethod);
    // AT THIS POINT THE STRIPE TRANSACTION IS COMPLETE AND paymentIntent AND paymentMethod ARE KNOWN
    setShowSpinner(true);

    let payment_request_payload = {
      pay_purchase_id: paymentData.purchase_uids,
      pay_fee: convenience_fee,
      pay_total: totalBalance,
      payment_notes: paymentData.business_code,
      pay_charge_id: "stripe transaction key",
      payment_type: selectedMethod,
      payment_verify: "Unverified",
      paid_by: getProfileId(),
      payment_intent: paymentIntent,
      payment_method: paymentMethod,
    };
    if (paymentMethod == "Zelle") payment_request_payload.confirmation_number = confirmationNumber;

    await fetch(`${APIConfig.baseURL.dev}/makePayment`, {
      // await fetch("http://localhost:4000/makePayment2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payment_request_payload),
    });

    navigate("/tenantDashboard");
    setShowSpinner(false);
  };
  //CreditCardHandler

  async function bank_transfer_handler() {
    // console.log("In Bank Transfer Handler Function");
    // Set the Content-Type header
    const headers = {
      "Content-Type": "application/json",
    };

    // Make the POST request
    setShowSpinner(true);
    try {
      const response = await fetch(payment_url[selectedMethod], {
        // Use http instead of https
        method: "POST",
        headers,
        body: JSON.stringify(paymentData),
      });

      if (response.ok) {
        // console.log("Post request was successful");
        // Handle the successful response here
      } else {
        // console.error("Post request failed");
        // Handle the error here
      }
    } catch (error) {
      console.error("An error occurred while making the POST request", error);
    }
    setShowSpinner(false);
    // console.log("Completed Bank Transfer Handler Function");
    // navigate
    navigate("/PaymentConfirmation", { state: { paymentData } });
  }

  function update_fee(selectedValue) {
    let fee = 0;
    if (selectedValue === "Bank Transfer") {
      fee = Math.max(parseFloat((balance * 0.008).toFixed(2)), 5);
    } else if (selectedValue === "Credit Card") {
      fee = parseFloat((balance * 0.03).toFixed(2));
    }
    setFee(fee);
    setTotalBalance(balance + fee);
  }

  const handleChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedMethod(selectedValue);

    let fee = 0;
    if (selectedValue === "Bank Transfer") {
      fee = Math.max(parseFloat((balance * 0.008).toFixed(2)), 5);
    } else if (selectedValue === "Credit Card") {
      fee = parseFloat((balance * 0.03).toFixed(2));
    }
    setFee(fee);
    setTotalBalance(balance + fee);

    // Clear confirmation number when a different payment method is selected
    if (selectedValue !== "Zelle") {
      setConfirmationNumber("");
    }
    // update_fee(selectedValue);
  };

  const handleSubmit = async (e) => {
    // console.log("selectedMethod", selectedMethod);
    // console.log("Payment total", totalBalance);
    console.log("Convenience Fee", convenience_fee);
    // console.log("PaymentData: ", { ...paymentData, total: parseFloat(totalBalance.toFixed(2)) });

    // e.preventDefault();
    setPaymentData({ ...paymentData, total: parseFloat(totalBalance.toFixed(2)) });
    // paymentData.payment_summary.total = parseFloat(totalBalance.toFixed(2));

    if (selectedMethod === "Bank Transfer") bank_transfer_handler();
    else if (selectedMethod === "Credit Card") {
      // console.log("Credit Card Selected");
      // toggleKeys();

      setStripeDialogShow(true);
    }
    // credit_card_handler(paymentData.business_code);
    else if (selectedMethod === "Zelle") {
      // console.log("Zelle Selected");
      let payment_intent = "Zelle";
      let payment_method = "Zelle";
      // console.log("Setting PI and PM: ", payment_intent, payment_method);
      submit(payment_intent, payment_method);
      // toggleKeys();
    }
    // credit_card_handler(paymentData.business_code);
  };

  // NEED TO UNDERSTAND WHY WE ARE USING t00 keys instead of PM Keys
  const toggleKeys = async () => {
    setShowSpinner(true);
    // console.log("inside toggle keys");
    const url =
      paymentData.business_code === "PMTEST"
        ? // ? "https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/stripe_key/PMTEST"
          // : "https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/stripe_key/PM";
          "https://t00axvabvb.execute-api.us-west-1.amazonaws.com/dev/stripe_key/PMTEST"
        : "https://t00axvabvb.execute-api.us-west-1.amazonaws.com/dev/stripe_key/PMTEST";
    // : "https://t00axvabvb.execute-api.us-west-1.amazonaws.com/dev/stripe_key/PM";

    let response = await fetch(url);
    const responseData = await response.json();
    // console.log("--DEBUG-- response data from Stripe", responseData);
    // setStripeResponse(responseData);
    const stripePromise = loadStripe(responseData.publicKey);
    setStripePromise(stripePromise);
    // console.log("--DEBUG-- stripePromise", stripePromise);
    setShowSpinner(false);
  };

  return (
    <>
      <ThemeProvider theme={theme}>
        <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
          <CircularProgress color='inherit' />
        </Backdrop>
  
        <Container disableGutters maxWidth='lg' sx={{ paddingTop: "10px", height: "60vh" }}>
          <Grid container spacing={6} sx={{ height: "90%" }}>
            <Grid container item xs={12} md={12} columnSpacing={6}>
              <StripeFeesDialog stripeDialogShow={stripeDialogShow} setStripeDialogShow={setStripeDialogShow} toggleKeys={toggleKeys} setStripePayment={setStripePayment} />
  
              <Paper
                style={{
                  margin: "25px",
                  padding: "20px",
                  backgroundColor: theme.palette.primary.main,
                  width: "100%",
                }}
              >
                <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}>
                  Payment Methods
                </Typography>
                <Divider light />
  
                <FormControl component='fieldset'>
                  <RadioGroup aria-label='Number' name='number' value={selectedMethod} onChange={handleChange}>
                    <FormControlLabel
                      value='Bank Transfer'
                      control={<Radio sx={{ "&.Mui-checked": { color: "#3D5CAC" } }} />}
                      label={
                        <>
                          <div style={{ display: "flex", alignItems: "center", paddingTop: "10px" }}>
                            <img src={BankIcon} alt='Chase' style={{ marginRight: "8px", height: "24px" }} />
                            <Typography sx={{ color: theme.typography.common.blue, fontWeight: 800, fontSize: theme.typography.mediumFont }}>Bank Transfer</Typography>
                          </div>
                          <Typography sx={{ color: theme.typography.common.gray, fontWeight: 400, fontSize: theme.typography.smallFont }}>0.08% Convenience Fee - max $5</Typography>
                        </>
                      }
                    />
                    <FormControlLabel
                      value='Credit Card'
                      control={<Radio sx={{ "&.Mui-checked": { color: "#3D5CAC" } }} />}
                      label={
                        <>
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <img src={CreditCardIcon} alt='Chase' style={{ marginRight: "8px", height: "24px" }} />
                            Credit Card
                          </div>
                          <Typography sx={{ color: theme.typography.common.gray, fontWeight: 400, fontSize: theme.typography.smallFont }}>3% Convenience Fee</Typography>
                        </>
                      }
                    />
                  </RadioGroup>
                </FormControl>
  
                <Typography sx={{ color: theme.typography.common.blue, fontWeight: 800, fontSize: theme.typography.secondaryFont }}>Other Payment Methods</Typography>
                <Typography sx={{ color: theme.typography.common.blue, fontWeight: 400, fontSize: "16px" }}>
                  Please make payment via 3rd party apps and record payment info here. For Zelle, include the transaction confirmation number.
                </Typography>
  
                <Divider light />
  
                <FormControl component='fieldset'>
                  <RadioGroup aria-label='Number' name='number' value={selectedMethod} onChange={handleChange}>
                    <FormControlLabel
                      value="Zelle"
                      control={<Radio sx={{ "&.Mui-checked": { color: "#3D5CAC" } }} />}
                      label={
                        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                          <img src={Zelle} alt="Zelle" style={{ marginRight: "8px", height: "24px" }} />
                          <Typography sx={{ color: selectedMethod === "Zelle" ? "#3D5CAC" : "#000000" }}>Zelle</Typography>
                          <TextField
                            id="confirmation-number"
                            label="Confirmation Number"
                            variant="outlined"
                            size="small"
                            value={confirmationNumber}
                            onChange={(e) => setConfirmationNumber(e.target.value)}
                            sx={{
                              marginLeft: "10px",
                              input: { color: "#000000" },
                              "& .MuiOutlinedInput-root": {
                                "& fieldset": { borderColor: "#000000" },
                                "&.Mui-focused fieldset": { borderColor: "#3D5CAC" },
                              },
                            }}
                            InputLabelProps={{
                              shrink: true,
                              style: { color: "#000000" },
                            }}
                            disabled={selectedMethod !== "Zelle"}
                          />
                        </div>
                      }
                    />
                  </RadioGroup>
                </FormControl>
  
                <Button
                  variant='contained'
                  onClick={handleSubmit}
                  sx={{
                    backgroundColor: "#3D5CAC",
                    color: theme.palette.background.default,
                    width: "100%",
                    borderRadius: "10px",
                    marginTop: "20px",
                  }}
                  disabled={isMakePaymentDisabled}
                >
                  Make Payment
                </Button>
              </Paper>
  
              <Elements stripe={stripePromise}>
                <StripePayment
                  submit={submit}
                  message={paymentData.business_code}
                  amount={totalBalance}
                  paidBy={paymentData.customer_uid}
                  show={stripePayment}
                  setShow={setStripePayment}
                />
              </Elements>
            </Grid>
          </Grid>
        </Container>
      </ThemeProvider>
    </>
  );  
}
