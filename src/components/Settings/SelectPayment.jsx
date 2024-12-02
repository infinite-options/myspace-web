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

import ManagerCashflowWidget from "../Dashboard-Components/Cashflow/ManagerCashflowWidget";
import AccountBalanceWidget from "../Payments/TenantAccountBalance";
import TenantAccountBalance from "../Payments/TenantAccountBalance";

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

export default function SelectPayment(props) {
  const location = useLocation();
  const { getProfileId, paymentRoutingBasedOnSelectedRole, selectedRole } = useUser();
  // console.log("--DEBUG-- props", props);
  // console.log("--DEBUG-- location.state", location.state);

  const managerCashflowWidgetData = location.state?.managerCashflowWidgetData;
  const accountBalanceWidgetData = location.state?.accountBalanceWidgetData;
  // console.log("SelectPayment -  managerCashflowWidgetData - ", managerCashflowWidgetData);
  // console.log("selectedRole - ", selectedRole);

  const classes = useStyles();
  const navigate = useNavigate();
  const [showSpinner, setShowSpinner] = useState(true);
  // const [balance, setBalance] = useState(parseFloat(location.state.paymentData?.balance));
  const [paymentData, setPaymentData] = useState(location.state.paymentData);
  const [paymentMethodInfo, setPaymentMethodInfo] = useState(location.state.paymentMethodInfo || {});
  const [paymentMethods, setPaymentMethods] = useState([]);
  // console.log("--DEBUG-- paymentData", paymentData);
  const [balance, setBalance] = useState(parseFloat(location.state.paymentData?.balance));
  const [purchaseUID, setPurchaseUID] = useState(location.state.paymentData.purchase_uids[0]?.purchase_uid);
  const [purchaseUIDs, setPurchaseUIDs] = useState(location.state.paymentData.purchase_uids);
  const [selectedItems, setSelectedItems] = useState(location.state.selectedItems);
  const cashFlowTotal = location.state?.cashFlowTotal;

  const receiverId = location.state?.receiverId;
  const [receiverPaymentMethods, setReceiverPaymentMethods] = useState([])
  const [receiverProfile, setReceiverProfile] = useState({})

  const [convenience_fee, setFee] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState(""); // Initial selection
  const [totalBalance, setTotalBalance] = useState(balance + convenience_fee); // Initial selection

  // Confirmation Box State
  const [confirmationNumber, setConfirmationNumber] = useState("");
  const [isMakePaymentDisabled, setIsMakePaymentDisabled] = useState(true); // State to control the disabled status of the Make Payment button

  //   console.log("DEBUG BALANCE IN SELECT PAYMENT", balance);
  // console.log("--debug-- PAYMENT DATA IN SELECT PAYMENT", paymentData);
  // console.log("--debug-- PURCHASE UIDS IN PAYMENT DATA IN SELECT PAYMENT purchase_uid", paymentData.purchase_uids);
  // console.log("--debug-- location.state", location.state);
  // console.log("---debug--- convenience_fee", convenience_fee);

  useEffect(() => {
    setShowSpinner(true)
    // Fetch the profile data and set payment methods
    const fetchProfileData = async () => {
      try {
        const response = await fetch(`${APIConfig.baseURL.dev}/profile/${getProfileId()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch profile data");
        }
        const profileData = await response.json();

        console.log("profile data", profileData.profile.result);

        // Initialize an array to hold all parsed payment methods
        let allPaymentMethods = [];

        // Iterate over each object in the result array
        profileData.profile.result.forEach((item) => {
          // Parse the paymentMethods string in each object and add to the array
          const parsedMethods = JSON.parse(item.paymentMethods);
          allPaymentMethods = [...allPaymentMethods, ...parsedMethods];
        });

        // Set the combined payment methods array
        setPaymentMethods(allPaymentMethods);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    const fetchReceiverProfileData = async () => {
      try {
        const response = await fetch(`${APIConfig.baseURL.dev}/profile/${receiverId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch profile data");
        }
        const profileData = await response.json();

        console.log("profile data", profileData.profile.result);

        // Initialize an array to hold all parsed payment methods
        let allPaymentMethods = [];

        setReceiverProfile(profileData.profile?.result[0])

        // Iterate over each object in the result array
        profileData.profile.result.forEach((item) => {
          // Parse the paymentMethods string in each object and add to the array
          const parsedMethods = JSON.parse(item.paymentMethods);
          allPaymentMethods = [...allPaymentMethods, ...parsedMethods];
        });

        // Set the combined payment methods array
        setReceiverPaymentMethods(allPaymentMethods)

      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();

    fetchReceiverProfileData();

    setShowSpinner(false)
  }, [getProfileId, receiverId]);

  useEffect(() => {
    console.log("test", location.state.leaseDetails);
  }, []);

  useEffect(() => {
    console.log("In new UseEffect Current Balance is: ", totalBalance);
  }, [totalBalance]);

  const [stripePayment, setStripePayment] = useState(false);
  const [stripeResponse, setStripeResponse] = useState(null);
  const [applePay, setApplePay] = useState(false);
  const [paymentConfirm, setPaymentConfirm] = useState(false);

  useEffect(() => {
    // Check if selectedMethod is not empty and confirmationNumber is not empty for Zelle and method for payment is selected
    if (
      (selectedMethod === "zelle" && confirmationNumber === "") ||
      !selectedMethod ||
      (selectedMethod === "paypal" && confirmationNumber === "") ||
      (selectedMethod === "venmo" && confirmationNumber === "")
    ) {
      setIsMakePaymentDisabled(true); // Disable button if conditions not met
    } else {
      setIsMakePaymentDisabled(false); // Enable button if conditions met
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

  const [stripePromise, setStripePromise] = useState(null);

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

  const submit = async (paymentIntent, paymentMethod) => {
    console.log("In Submit Function");
    console.log("paymentData", paymentData);
    console.log("in submit in SelectPayment.jsx", convenience_fee);
    setPaymentConfirm(true);

    console.log("--DEBUG-- in submit in SelectPayment.jsx paymentIntent output", paymentIntent);
    console.log("--DEBUG-- in submit in SelectPayment.jsx paymentMethod output", paymentMethod);

    paymentIntent = paymentIntent === undefined ? "Zelle" : paymentIntent;
    paymentMethod = paymentMethod === undefined ? "Zelle" : paymentMethod;
    console.log("Re-Setting PI and PM: ", paymentIntent, paymentMethod);
    // AT THIS POINT THE STRIPE TRANSACTION IS COMPLETE AND paymentIntent AND paymentMethod ARE KNOWN
    setShowSpinner(true);

    let payment_request_payload = {
      pay_purchase_id: paymentData.purchase_uids,
      pay_fee: convenience_fee,
      pay_total: totalBalance,
      cashflow_total: cashFlowTotal,
      payment_notes: paymentData.business_code,
      pay_charge_id: "stripe transaction key",
      payment_type: selectedMethod,
      payment_verify: "Unverified",
      paid_by: getProfileId(),
      payment_intent: paymentIntent,
      payment_method: paymentMethod,
    };
    if (paymentMethod == "Zelle" || paymentMethod == "Paypal" || paymentMethod == "Venmo" || paymentMethod == "ApplePay")
      payment_request_payload.payment_intent = confirmationNumber;
    // if (paymentMethod == "Stripe"){
    //   payment_request_payload.payment_intent =  paymentIntent;
    // } else {
    //   payment_request_payload.payment_intent =  confirmationNumber;
    // }

    await fetch(`${APIConfig.baseURL.dev}/makePayment`, {
      // await fetch("http://localhost:4000/makePayment2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payment_request_payload),
    });

    // let routingString = paymentRoutingBasedOnSelectedRole();
    // navigate(routingString);

    // navigate("/payments")
    navigate(-1);

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
    let payment = {...paymentData,
      payment_summary: {
        ...paymentData.payment_summary,
        total: parseFloat(totalBalance.toFixed(2))
      },
      site: window.location.hostname === "localhost" ? "LOCAL_PM" : "PM"
    }

    let resultOfResponse;

    setShowSpinner(true);
    try {
      const response = await fetch(payment_url[selectedMethod], {
        // Use http instead of https
        method: "POST",
        headers,
        body: JSON.stringify(payment),
      });

      resultOfResponse = await response.json()    // because response has only url so we can't convert into json
      // console.log(resultOfResponse)

      if (response.ok) {

        
        console.log("Post request was successful - ", resultOfResponse);
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
    localStorage.setItem('pay_purchase_id', JSON.stringify(payment.purchase_uids));
    localStorage.setItem('pay_fee', convenience_fee);
    localStorage.setItem('pay_total', totalBalance);
    localStorage.setItem('cashflow_total', cashFlowTotal);
    localStorage.setItem('payment_notes', payment.business_code);
    localStorage.setItem('payment_type', selectedMethod);
    localStorage.setItem('session_id', resultOfResponse.id);

    if (resultOfResponse){ 
      window.location.href = resultOfResponse.url
    }

    // let paymentIntent = "BankTransfer";
    // let paymentMethod = "BankTransfer";

    // let payment_request_payload = {
    //   pay_purchase_id: payment.purchase_uids,
    //   pay_fee: convenience_fee,
    //   pay_total: totalBalance,
    //   cashflow_total: cashFlowTotal,    //payment.balance
    //   payment_notes: payment.business_code,
    //   pay_charge_id: "stripe transaction key",
    //   payment_type: selectedMethod,
    //   payment_verify: "Unverified",
    //   paid_by: getProfileId(),
    //   payment_intent: paymentIntent,
    //   payment_method: paymentMethod,
    // };

    // navigate("/PaymentConfirmation", { state: { paymentData: payment_request_payload } });
  }

  function update_fee(e) {
    // console.log("--debug update_fee -->", selectedMethod);
    let fee = 0;
    if (e.target.value === "Bank Transfer") {
      fee = Math.min(parseFloat((balance * 0.008).toFixed(2)), 5);
    } else if (e.target.value === "Credit Card") {
      fee = parseFloat((balance * 0.03).toFixed(2));
    }
    setFee(fee);
    setTotalBalance(balance + fee);
  }

  const [selectedValue, setSelectedValue] = useState(""); // Holds the full value like "zelle-123"
  const [selectedZelleId, setSelectedZelleId] = useState(null);

  const handleChange = (event) => {
    const selectedValue = event.target.value; // This could be "zelle-123"
    const [methodType, methodId] = selectedValue.split("-"); // Extracts method type and unique ID

    setSelectedMethod(methodType); // Set the cleaned method type (e.g., "zelle")
    setSelectedValue(selectedValue); // Set the exact value to ensure correct radio selection

    // Set the specific Zelle ID only if the method is Zelle
    if (methodType === "zelle") {
      setSelectedZelleId(methodId); // Set the selected Zelle ID
    } else {
      setSelectedZelleId(null);
      setConfirmationNumber("");
    }

    update_fee(event);
  };

  const handleSubmit = async (e) => {
    console.log("selectedMethod", selectedMethod);
    console.log("Payment total", totalBalance);
    console.log("Convenience Fee", convenience_fee);
    console.log("PaymentData: ", { total: parseFloat(totalBalance.toFixed(2)) });

    // e.preventDefault();
    // setPaymentData({ ...paymentData, total: parseFloat(totalBalance.toFixed(2)) });
    // paymentData.payment_summary.total = parseFloat(totalBalance.toFixed(2));

    setPaymentData({
      ...paymentData,
      payment_summary: {
        ...paymentData.payment_summary,
        total: parseFloat(totalBalance.toFixed(2))
      }
    });

    if (selectedMethod === "Bank Transfer") bank_transfer_handler();
    else if (selectedMethod === "Credit Card") {
      // console.log("Credit Card Selected");
      // toggleKeys();

      setStripeDialogShow(true);
    }
    // credit_card_handler(paymentData.business_code);
    else if (selectedMethod === "zelle") {
      // console.log("Zelle Selected");
      let payment_intent = "Zelle";
      let payment_method = "Zelle";
      console.log("Setting PI and PM: ", payment_intent, payment_method);
      submit(payment_intent, payment_method);
      // toggleKeys();
    } else if (selectedMethod === "paypal") {
      let payment_intent = "Paypal";
      let payment_method = "Paypal";
      console.log("Setting PI and PM: (Paypal) ", payment_intent, payment_method);
      submit(payment_intent, payment_method);
    } else if (selectedMethod === "venmo") {
      let payment_intent = "Venmo";
      let payment_method = "Venmo";
      console.log("Setting PI and PM: Venmo ", payment_intent, payment_method);
      submit(payment_intent, payment_method);
    } else if (selectedMethod === "apple_pay") {
      let payment_intent = "ApplePay";
      let payment_method = "ApplePay";
      console.log("Setting PI and PM: ApplePay ", payment_intent, payment_method);
      submit(payment_intent, payment_method);
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
        : // : "https://t00axvabvb.execute-api.us-west-1.amazonaws.com/dev/stripe_key/PMTEST";
          "https://t00axvabvb.execute-api.us-west-1.amazonaws.com/dev/stripe_key/PM";

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
    // <div style={{ padding: "30px" }}>
    <>
      <ThemeProvider theme={theme}>
        <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
          <CircularProgress color='inherit' />
        </Backdrop>

        {receiverId && <Container disableGutters maxWidth='lg' sx={{ paddingTop: "10px", height: "90vh" }}>
          <Grid container spacing={6} sx={{ height: "90%" }}>
            <Grid container item xs={12} md={12} justifyContent={"center"}>
              <StripeFeesDialog stripeDialogShow={stripeDialogShow} setStripeDialogShow={setStripeDialogShow} toggleKeys={toggleKeys} setStripePayment={setStripePayment} />

              {/* select payment method 2 heading */}
              <Grid container item xs={12} justifyContent='center'>
                <Typography
                  sx={{
                    justifySelf: "center",
                    color: theme.typography.common.blue,
                    fontWeight: theme.typography.primary.fontWeight,
                    fontSize: theme.typography.largeFont,
                  }}
                >
                  Select Payment Method (NEW)
                </Typography>
                {/* </Stack> */}
              </Grid>
              
              {/* balance top card */}
              <Paper
                style={{
                  width: "100%",
                  margin: "25px",
                  marginBottom: "0px",
                  padding: "10px",
                  backgroundColor: theme.palette.primary.main,
                  // height: "25%",
                  // [theme.breakpoints.down("sm")]: {
                  //   width: "80%",
                  // },
                  // [theme.breakpoints.up("sm")]: {
                  //   width: "50%",
                  // },
                }}
              >
                {/* total balance */}
                <Stack direction='row' justifyContent='center' sx={{ paddingBottom: "5px" }}>
                  <Typography
                    sx={{
                      justifySelf: "center",
                      color: "#160449",
                      fontWeight: theme.typography.medium.fontWeight,
                      fontSize: theme.typography.largeFont,
                    }}
                  >
                    Total Balance
                  </Typography>
                </Stack>
                
                {/* total balance value */}
                <Stack direction='row' justifyContent='center' sx={{ paddingBottom: "5px" }}>
                  <Typography
                    sx={{
                      justifySelf: "center",
                      color: "#7A9AEA",
                      fontWeight: theme.typography.medium.fontWeight,
                      fontSize: theme.typography.largeFont,
                    }}
                  >
                    {"$" + (balance + convenience_fee).toFixed(2)}
                  </Typography>
                </Stack>
                <Divider light />

                {/* balance, convenience fee value */}
                <Stack>
                  <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                    <Grid item xs={6} justifyContent='center' alignItems='center'>
                      <Typography
                        sx={{
                          justifySelf: "center",
                          color: "#160449",
                          fontWeight: theme.typography.light.fontWeight,
                          fontSize: theme.typography.smallFont,
                        }}
                      >
                        Balance
                      </Typography>
                    </Grid>

                    <Grid container item xs={6} justifyContent='flex-end'>
                      <Typography
                        sx={{
                          justifySelf: "flex-end",
                          // width: '100px',
                          color: "#160449",
                          fontWeight: theme.typography.light.fontWeight,
                          fontSize: theme.typography.smallFont,
                        }}
                      >
                        {"$" + balance.toFixed(2)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6} alignItems='center'>
                      <Typography
                        sx={{
                          justifySelf: "center",
                          color: "#160449",
                          fontWeight: theme.typography.light.fontWeight,
                          fontSize: theme.typography.smallFont,
                        }}
                      >
                        Convenience Fees
                      </Typography>
                    </Grid>

                    <Grid container item xs={6} justifyContent='flex-end'>
                      <Typography
                        sx={{
                          justifySelf: "center",
                          color: "#160449",
                          fontWeight: theme.typography.light.fontWeight,
                          fontSize: theme.typography.smallFont,
                        }}
                      >
                        {"$" + convenience_fee.toFixed(2)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6} alignItems='center'>
                      <Typography
                        sx={{
                          justifySelf: "center",
                          color: "#160449",
                          fontWeight: theme.typography.medium.fontWeight,
                          fontSize: theme.typography.smallFont,
                        }}
                      >
                        Total
                      </Typography>
                    </Grid>
                    <Grid container item xs={6} justifyContent='flex-end'>
                      <Typography
                        sx={{
                          justifySelf: "center",
                          color: "#160449",
                          fontWeight: theme.typography.medium.fontWeight,
                          fontSize: theme.typography.smallFont,
                        }}
                      >
                        {"$" + (balance + convenience_fee).toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Stack>
              </Paper>
              
              {/* payment methods card */}
              <Paper
                style={{
                  margin: "25px",
                  padding: "20px",
                  backgroundColor: theme.palette.primary.main,
                  // height: '25%',
                  [theme.breakpoints.down("sm")]: {
                    width: "80%",
                  },
                  [theme.breakpoints.up("sm")]: {
                    width: "50%",
                  },
                }}
              >
                <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}>
                  Payment Methods
                </Typography>
                <Divider light />

                {/* bank & credit card */}
                <FormControl component='fieldset'>
                  <RadioGroup aria-label='Number' name='number' value={selectedMethod} onChange={handleChange}>
                    <FormControlLabel
                      value='Bank Transfer'
                      control={
                        <Radio
                          sx={{
                            color: selectedMethod === "Zelle" ? "#3D5CAC" : "#000000", // Blue when selected, black otherwise
                            "&.Mui-checked": {
                              color: "#3D5CAC", // Blue color for the selected state
                            },
                          }}
                        />
                      }
                      label={
                        <>
                          <div style={{ display: "flex", alignItems: "center", paddingTop: "10px" }}>
                            <img src={BankIcon} alt='Chase' style={{ marginRight: "8px", height: "24px" }} />
                            <Typography sx={{ color: theme.typography.common.blue, fontWeight: 800, fontSize: theme.typography.mediumFont }}>Bank Transfer</Typography>
                          </div>
                          <div sx={{ paddingTop: "10px", paddingLeft: "20px" }}>
                            <Typography sx={{ color: theme.typography.common.gray, fontWeight: 400, fontSize: theme.typography.smallFont }}>
                              .08% Convenience Fee - max $5
                            </Typography>
                          </div>
                        </>
                      }
                    />
                    <FormControlLabel
                      value='Credit Card'
                      control={
                        <Radio
                          sx={{
                            color: selectedMethod === "Zelle" ? "#3D5CAC" : "#000000", // Blue when selected, black otherwise
                            "&.Mui-checked": {
                              color: "#3D5CAC", // Blue color for the selected state
                            },
                          }}
                        />
                      }
                      label={
                        <>
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <img src={CreditCardIcon} alt='Chase' style={{ marginRight: "8px", height: "24px" }} />
                            Credit Card
                          </div>
                          <div sx={{ paddingTop: "10px", paddingLeft: "20px" }}>
                            <Typography sx={{ color: theme.typography.common.gray, fontWeight: 400, fontSize: theme.typography.smallFont }}>3% Convenience Fee</Typography>
                          </div>
                        </>
                      }
                    />
                  </RadioGroup>
                </FormControl>

                <Typography sx={{ color: theme.typography.common.blue, fontWeight: 800, fontSize: theme.typography.secondaryFont, marginTop: "10px"}}>Other Payment Methods</Typography>
                <Typography sx={{ color: theme.typography.common.blue, fontWeight: 400, fontSize: "16px" }}>
                  Payment Instructions for Paypal, Apple Pay Zelle, and Venmo: Please make payment via 3rd party app and record payment information here. If you are using Zelle,
                  please include the transaction confirmation number.
                </Typography>

                <Divider light sx={{marginBottom: "10px"}}/>

                {/* <FormControl component='fieldset'>
                  <RadioGroup
                    aria-label='Number'
                    name='number'
                    value={selectedValue} // Binding this to selectedValue, not selectedMethod
                    onChange={handleChange}
                  >
                    {paymentMethods.map((method) => {
                      const uniqueValue = `${method.paymentMethod_type}-${method.paymentMethod_uid}`; // Unique value for each, looks like zelle-123

                      return (
                        <FormControlLabel
                          key={method.paymentMethod_uid}
                          value={uniqueValue}
                          control={
                            <Radio
                              sx={{
                                color: selectedValue === uniqueValue ? "#3D5CAC" : "#000000",
                                "&.Mui-checked": {
                                  color: "#3D5CAC",
                                },
                              }}
                            />
                          }
                          label={
                            <div style={{ display: "flex", alignItems: "center" }}>
                              <img
                                src={
                                  method.paymentMethod_type === "zelle"
                                    ? Zelle
                                    : method.paymentMethod_type === "credit_card"
                                    ? CreditCardIcon
                                    : method.paymentMethod_type === "paypal"
                                    ? PayPal
                                    : method.paymentMethod_type === "venmo"
                                    ? Venmo
                                    : method.paymentMethod_type === "apple_pay"
                                    ? ApplePay
                                    : method.paymentMethod_type === "stripe"
                                    ? Stripe
                                    : BankIcon
                                }
                                alt={method.paymentMethod_type}
                                style={{ marginRight: "8px", height: "24px" }}
                              />
                              <Typography
                                sx={{
                                  color: selectedMethod === method.paymentMethod_type ? "#3D5CAC" : "#000000",
                                }}
                              >
                                {method.paymentMethod_name}
                              </Typography>
                              {/* Show confirmation number input only for the selected non-Stripe method */}
                              {/*{selectedValue === uniqueValue && selectedMethod !== "stripe" && (
                                <TextField
                                  id={`confirmation-number-${method.paymentMethod_uid}`} // Unique ID for each input
                                  label='Confirmation Number'
                                  variant='outlined'
                                  size='small'
                                  value={confirmationNumber}
                                  sx={{
                                    marginLeft: "10px",
                                    input: {
                                      color: "#000000",
                                    },
                                    "& .MuiOutlinedInput-root": {
                                      "& fieldset": {
                                        borderColor: "#000000",
                                      },
                                      "&.Mui-focused fieldset": {
                                        borderColor: "#3D5CAC",
                                      },
                                    },
                                  }}
                                  InputLabelProps={{
                                    shrink: true,
                                    style: { color: "#000000" },
                                  }}
                                  onChange={(e) => setConfirmationNumber(e.target.value)}
                                />
                              )}
                            </div>
                          }
                        />
                      );
                    })}
                  </RadioGroup>
                </FormControl> */}

                <FormControl component='fieldset'>
                  <RadioGroup
                    aria-label='Number'
                    name='number'
                    value={selectedValue} // Binding this to selectedValue, not selectedMethod
                    onChange={handleChange}
                  >
                    {paymentMethods.map((method) => {
                      const uniqueValue = `${method.paymentMethod_type}-${method.paymentMethod_uid}`; // Unique value for each, looks like zelle-123
                      
                      // Check if the method exists in receiverPaymentMethods
                      const isMethodInReceiver = receiverPaymentMethods.some(
                        (receiverMethod) => receiverMethod.paymentMethod_type === method.paymentMethod_type
                      );

                      return (
                        <FormControlLabel
                          key={method.paymentMethod_uid}
                          value={uniqueValue}
                          control={
                            <Radio
                              disabled={!isMethodInReceiver} // Disable if not present in receiverPaymentMethods
                              sx={{
                                color: selectedValue === uniqueValue ? "#3D5CAC" : "#000000",
                                "&.Mui-checked": {
                                  color: "#3D5CAC",
                                },
                              }}
                            />
                          }
                          label={
                            <div style={{ display: "flex", alignItems: "center" }}>
                              <img
                                src={
                                  method.paymentMethod_type === "zelle"
                                    ? Zelle
                                    : method.paymentMethod_type === "credit_card"
                                    ? CreditCardIcon
                                    : method.paymentMethod_type === "paypal"
                                    ? PayPal
                                    : method.paymentMethod_type === "venmo"
                                    ? Venmo
                                    : method.paymentMethod_type === "apple_pay"
                                    ? ApplePay
                                    : method.paymentMethod_type === "stripe"
                                    ? Stripe
                                    : BankIcon
                                }
                                alt={method.paymentMethod_type}
                                style={{ marginRight: "8px", height: "24px" }}
                              />
                              <Typography
                                sx={{
                                  color: selectedMethod === method.paymentMethod_type ? "#3D5CAC" : "#000000",
                                }}
                              >
                                {method.paymentMethod_name}
                              </Typography>

                              {/* If the payment method is selected and not Stripe, show the Confirmation Number input */}
                              {selectedValue === uniqueValue && selectedMethod !== "stripe" && (
                                <TextField
                                  id={`confirmation-number-${method.paymentMethod_uid}`} // Unique ID for each input
                                  label='Confirmation Number'
                                  variant='outlined'
                                  size='small'
                                  value={confirmationNumber}
                                  sx={{
                                    marginLeft: "10px",
                                    input: {
                                      color: "#000000",
                                    },
                                    "& .MuiOutlinedInput-root": {
                                      "& fieldset": {
                                        borderColor: "#000000",
                                      },
                                      "&.Mui-focused fieldset": {
                                        borderColor: "#3D5CAC",
                                      },
                                    },
                                  }}
                                  InputLabelProps={{
                                    shrink: true,
                                    style: { color: "#000000" },
                                  }}
                                  onChange={(e) => setConfirmationNumber(e.target.value)}
                                />
                              )}

                              {/* If the payment method is available in both paymentMethods and receiverPaymentMethods, show receiver's name */}
                              {isMethodInReceiver && receiverProfile && receiverPaymentMethods.length > 0 && (
                                <Typography
                                  sx={{
                                    marginLeft: "10px",
                                    fontSize: "16px",
                                    fontWeight: "bold",
                                    color: "#000000",
                                  }}
                                >
                                  To: 
                                  <span style={{color: "#888888", paddingLeft: "10px", fontSize: "14px", fontWeight: "bold"}}>
                                  {receiverId?.startsWith('600')? receiverProfile?.business_name : receiverProfile?.owner_first_name + " " + receiverProfile?.owner_last_name} ({receiverPaymentMethods.find((receiverMethod) => receiverMethod.paymentMethod_type === method.paymentMethod_type)?.paymentMethod_name})
                                  </span>
                                </Typography>
                              )}

                              {!isMethodInReceiver && receiverProfile && (
                                <Typography
                                  sx={{
                                    marginLeft: "10px",
                                    fontSize: "14px",
                                    color: "#888888",
                                  }}
                                > 
                                  ( {receiverId?.startsWith('600')? receiverProfile?.business_name : receiverProfile?.owner_first_name + " " + receiverProfile?.owner_last_name} does not accept {method.paymentMethod_type} )
                                </Typography>
                              )}
                            </div>
                          }
                        />
                      );
                    })}
                  </RadioGroup>
                </FormControl>

                <Button
                  variant='contained'
                  onClick={handleSubmit}
                  sx={{
                    backgroundColor: "#3D5CAC",
                    color: theme.palette.background.default,
                    width: "100%", // Center the button horizontally
                    borderRadius: "10px", // Rounded corners
                    marginTop: "20px", // Add some spacing to the top
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
        </Container>}
      </ThemeProvider>

      {/* </div> */}
    </>
  );
}
