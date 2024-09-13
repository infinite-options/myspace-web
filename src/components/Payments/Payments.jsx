import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Paper, TextField, Radio, RadioGroup, Button, Box, Stack, Typography, FormControlLabel, Grid, FormControl, Divider, Container, ThemeProvider } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import theme from "../../theme/theme";
import { alpha, makeStyles } from "@material-ui/core/styles";
import axios, { all } from "axios";
import { useUser } from "../../contexts/UserContext";
import BackIcon from "./backIcon.png";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { DataGrid } from "@mui/x-data-grid";

import APIConfig from "../../utils/APIConfig";

import ManagerCashflowWidget from "../Dashboard-Components/Cashflow/ManagerCashflowWidget";
import AccountBalanceWidget from "./AccountBalanceWidget";
import { AccountBalance } from "@mui/icons-material";
import useMediaQuery from "@mui/material/useMediaQuery";
import CircleIcon from "@mui/icons-material/Circle";
import documentIcon from "../../images/Subtract.png";

// Payment Icons
import PayPal from "../../images/PayPal.png";
import Zelle from "../../images/Zelle.png";
import Venmo from "../../images/Venmo.png";
import Chase from "../../images/Chase.png";
import CreditCardIcon from "../../images/ion_card.png";
import BankIcon from "../../images/mdi_bank.png";
import Stripe from "../../images/Stripe.png";
import ApplePay from "../../images/ApplePay.png";

import StripePayment from "../Settings/StripePayment";
import StripeFeesDialog from "../Settings/StripeFeesDialog";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import SelectPayment from "../Settings/SelectPayment";
import PaymentMethodSelector from "../Settings/PaymentMethodSelector";

const useStyles = makeStyles((theme) => ({
  input: {
    background: "#000000",
  },
}));

function DashboardTab(props) {
  return (
    <Box
      sx={{
        backgroundColor: "#F2F2F2",
        borderRadius: "10px",
        marginTop: "7px",
        marginBottom: "7px",
        boxShadow: "0px 2px 4px #00000040",
        height: props.fullHeight ? "90%" : "auto",
      }}
    >
      {props.children}
    </Box>
  );
}

export default function Payments(props) {
  console.log("In Payments.jsx", props);
  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, getProfileId, roleName, selectedRole } = useUser();

  const [showPaymentMethod, setShowPaymentMethod] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]); 

  const [selectedMethod, setSelectedMethod] = useState('');
  const [confirmationNumber, setConfirmationNumber] = useState('');


  const managerCashflowWidgetData = location.state?.managerCashflowWidgetData;
  // const accountBalanceWidgetData = location.state?.accountBalanceWidgetData;
  const accountBalanceWidgetData = props?.accountBalanceWidgetData;
  // console.log("managerCashflowWidgetData - ", managerCashflowWidgetData);

  // console.log("selectedRole - ", selectedRole);

  const [moneyPaid, setMoneyPaid] = useState([]);
  const [moneyReceived, setMoneyReceived] = useState([]);
  const [moneyToBePaid, setMoneyToBePaid] = useState([]);
  const [moneyToBeReceived, setMoneyToBeReceived] = useState([]);
  const [moneyPayable, setMoneyPayable] = useState([]);

  const [showSpinner, setShowSpinner] = useState(false);
  const [paymentNotes, setPaymentNotes] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalReceived, setTotalReceived] = useState(0);
  const [totalToBePaid, setTotalToBePaid] = useState(0);
  const [totalToBeReceived, setTotalToBeReceived] = useState(0);
  const [totalPayable, setTotalPayable] = useState(0);
  const [isHeaderChecked, setIsHeaderChecked] = useState(true);
  const [paymentMethodInfo, setPaymentMethodInfo] = useState({});

  const [paymentData, setPaymentData] = useState({
    currency: "usd",
    //customer_uid: '100-000125', // customer_uid: user.user_uid currently gives error of undefined
    customer_uid: getProfileId(),
    // customer_uid: user.user_uid,
    // business_code: "IOTEST",
    business_code: paymentNotes,
    item_uid: "320-000054",
    // payment_summary: {
    //     total: "0.0"
    // },
    balance: "0.0",
    purchase_uids: [],
  });

  let customer_uid = getProfileId();
  let customer_role = customer_uid.substring(0, 3);
  console.log("Profile Info: ", getProfileId());
  console.log("Customer UID: ", customer_uid);
  console.log("Customer Role: ", customer_role);
  console.log("NOTES BUSINESS CODE", paymentData.business_code);

  const [balance, setBalance] = useState(parseFloat(paymentData?.balance));
  const [convenience_fee, setFee] = useState(0); // Initial fee is 0
  const [totalBalance, setTotalBalance] = useState(balance + convenience_fee);
  const [paymentConfirm, setPaymentConfirm] = useState(false);
  const [stripePayment, setStripePayment] = useState(false);
  const [stripePromise, setStripePromise] = useState(null);
  // console.log("Customer UID: ", paymentData);
  // console.log("Customer UID: ", paymentData.customer_uid);
  // console.log("User Info: ", user);

  // function totalPaidUpdate(paidItems) {
  //   var total = 0;
  //   for (const item of paidItems) {
  //     total += parseFloat(item.pur_amount_due);
  //   }
  //   setTotalPaid(total);
  // }

  const handleSelectPaymentClick = () => {
    setShowPaymentMethod(true);
  };

  function totalMoneyPaidUpdate(moneyPaid) {
    var total = 0;
    for (const item of moneyPaid) {
      total += parseFloat(item.total_paid);
    }
    setTotalPaid(total);
  }

  function totalMoneyReceivedUpdate(moneyReceived) {
    var total = 0;
    for (const item of moneyReceived) {
      total += parseFloat(item.total_paid);
    }
    setTotalReceived(total);
  }

  function totalMoneyToBePaidUpdate(moneyToBePaid) {
    var total = 0;
    for (const item of moneyToBePaid) {
      if (item.pur_cf_type === "revenue") {
        total += parseFloat(item.pur_amount_due);
      } else if (item.pur_cf_type === "expense") {
        total -= parseFloat(item.pur_amount_due);
      }
    }
    setTotalToBePaid(total);
  }

  function totalMoneyPayable(moneyPayable) {
    console.log("In totalMoneyPayable: ", moneyPayable);
    var total = 0;
    for (const item of moneyPayable) {
      if (item.pur_cf_type === "revenue") {
        total += parseFloat(item.pur_amount_due);
      } else if (item.pur_cf_type === "expense") {
        total -= parseFloat(item.pur_amount_due);
      }
    }
    setTotalPayable(total);
  }

  function totalMoneyToBeReceivedUpdate(moneyToBeReceived) {
    var total = 0;
    for (const item of moneyToBeReceived) {
      total += parseFloat(item.pur_amount_due);
    }
    setTotalToBeReceived(total);
  }

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await axios.get(`${APIConfig.baseURL.dev}/paymentMethod/${getProfileId()}`);
        const availableMethods = response.data.result;
        console.log("Payment Methods:", availableMethods);
        setPaymentMethods(availableMethods);
      } catch (error) {
        console.error("Error fetching payment methods:", error);
        if (error.response) {
          console.error("Response error:", error.response.status, error.response.data);
        } else if (error.request) {
          console.error("No response received:", error.request);
        } else {
          console.error("Request setup error:", error.message);
        }
      }
    };
    

    fetchPaymentMethods();
  }, []);

  useEffect(() => {
    const fetchPaymentsData = async () => {
      setShowSpinner(true);
      try {
        const res = await axios.get(`${APIConfig.baseURL.dev}/paymentStatus/${getProfileId()}`);
  
        const moneyPaidData = res.data.MoneyPaid.result;
        const moneyToBePaidData = res.data.MoneyToBePaid.result;
  
        setMoneyPaid(moneyPaidData);
        setMoneyToBePaid(moneyToBePaidData);
  
        // Update total and balance for tenant
        const totalToBePaid = moneyToBePaidData.reduce((total, item) => {
          return item.pur_cf_type === "revenue" ? total + parseFloat(item.pur_amount_due) : total - parseFloat(item.pur_amount_due);
        }, 0);
        setTotalToBePaid(totalToBePaid);

        console.log("IN HERE", totalToBePaid);

        // Update balance in paymentData based on totalToBePaid
        setPaymentData((prevPaymentData) => ({
          ...prevPaymentData,
          balance: totalToBePaid, // Update balance to match tenant's total due
        }));
        console.log("PAYMENT DARA", paymentData);
      } catch (error) {
        console.error("Error fetching payment data:", error);
      }
      setShowSpinner(false);
    };
  
    fetchPaymentsData();
  }, []);


  const [showPaymentMethods, setShowPaymentMethods] = useState(false); // New state to control payment methods visibility

  // const API_CALL = "https://huo8rhh76i.execute-api.us-west-1.amazonaws.com/dev/api/v2/createEasyACHPaymentIntent";

  // const handleStripePayment = async (e) => {
  //   setShowSpinner(true);
  //   console.log("Stripe Payment");
  //   try {
  //     // Update paymentData with the latest total value
  //     const updatedPaymentData = {
  //       ...paymentData,
  //       business_code: paymentNotes,
  //       payment_summary: {
  //         total: total.toFixed(2), // Format the total as a string with 2 decimal places
  //       },
  //     };

  //     console.log("Updated Payment Data: ", updatedPaymentData);

  //     //const stripe = await stripePromise;
  //     const response = await fetch(API_CALL, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(updatedPaymentData),
  //     });
  //     const checkoutURL = await response.text();
  //     //console.log(response.text());
  //     window.location.href = checkoutURL;
  //   } catch (error) {
  //     console.log(error);
  //   }
  //   setShowSpinner(false);
  // };

  // Define the CSS style for the selected checkbox
  // const selectedCheckboxStyle = {
  //   color: theme.palette.custom.bgBlue, // Change the color of the tick (checked icon)
  //   borderColor: "black", // Change the border color
  //   "&.Mui-checked": {
  //     color: "gray",
  //     borderColor: "black",
  //   },
  // };

  const update_fee = (e) => {
    console.log("INSIDE FEE");
    let fee = 0;
    if (e.target.value === "Bank Transfer") {
      fee = Math.max(parseFloat((balance * 0.008).toFixed(2)), 5);
    } else if (e.target.value === "Credit Card") {
      fee = parseFloat((balance * 0.03).toFixed(2));
    }
    setFee(fee);
    setTotalBalance(balance + fee); // Update the total balance
  };
  
  const [stripeDialogShow, setStripeDialogShow] = useState(false);

  const handlePaymentNotesChange = (event) => {
    setPaymentNotes(event.target.value);
  };


  const payment_url = {
    "Credit Card": "https://huo8rhh76i.execute-api.us-west-1.amazonaws.com/dev/api/v2/createPaymentIntent", // Try this first
    "Bank Transfer": "https://huo8rhh76i.execute-api.us-west-1.amazonaws.com/dev/api/v2/createEasyACHPaymentIntent", //WON'T WORK NOW
    "Zelle": "https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/makePayment",
  };

  const toggleKeys = async () => {
    setShowSpinner(true);
    console.log("inside toggle keys");
    const url =
      paymentData.business_code === "PMTEST"
        ? // ? "https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/stripe_key/PMTEST"
          // : "https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/stripe_key/PM";
          "https://t00axvabvb.execute-api.us-west-1.amazonaws.com/dev/stripe_key/PMTEST"
        : "https://t00axvabvb.execute-api.us-west-1.amazonaws.com/dev/stripe_key/PMTEST";
    // : "https://t00axvabvb.execute-api.us-west-1.amazonaws.com/dev/stripe_key/PM";

    let response = await fetch(url);
    const responseData = await response.json();
    console.log("--DEBUG-- response data from Stripe", responseData);
    // setStripeResponse(responseData);
    const stripePromise = loadStripe(responseData.publicKey);
    setStripePromise(stripePromise);
    // console.log("--DEBUG-- stripePromise", stripePromise);
    setShowSpinner(false);
  };

  async function credit_card_handler(notes) {
    setShowSpinner(true); // Start showing the spinner
    
    let endpoint = "https://huo8rhh76i.execute-api.us-west-1.amazonaws.com/dev/api/v2/getCorrectKeys/PM";
    if (notes === "PMTEST") {
      endpoint = "https://huo8rhh76i.execute-api.us-west-1.amazonaws.com/dev/api/v2/getCorrectKeys/PMTEST";
    }
    
    try {
      const result = await axios.post(endpoint);
      
      if (result?.data?.publicKey) {
        const stripeInstance = await loadStripe(result.data.publicKey);
        setStripePromise(stripeInstance);  // Set Stripe promise for Elements provider
        setStripePayment(true);  // Open Stripe payment dialog
      } else {
        console.error("Public key not found in response:", result);
      }
    } catch (error) {
      console.error("Error fetching public key:", error);
    } finally {
      setShowSpinner(false);
    }
  }
  
  
  
  const submit = async (paymentIntent, paymentMethod) => {
    setPaymentConfirm(true);
  
    // Prepare the default paymentIntent and paymentMethod for non-Zelle payments
    let payment_intent = paymentIntent.paymentIntent;
    let payment_method = paymentIntent.paymentMethod;
  
    // If the payment method is Zelle, use the values directly as they are
    if (paymentMethod === "Zelle") {
      payment_intent = paymentIntent;
      payment_method = paymentMethod;
    }
  
    console.log("Re-Setting PI and PM: ", payment_intent, payment_method);
  
    let payment_request_payload = {
      pay_purchase_id: paymentData.purchase_uids,
      pay_fee: convenience_fee,
      pay_total: totalBalance,
      payment_notes: paymentData.business_code,
      pay_charge_id: "stripe transaction key", // Update this with the actual charge ID from Stripe
      payment_type: selectedMethod,
      payment_verify: "Unverified",
      paid_by: getProfileId(),
      payment_intent: payment_intent, // Use the appropriate value for payment_intent
      payment_method: payment_method, // Use the appropriate value for payment_method
    };
  
    // If Zelle is selected, add the confirmation number
    if (paymentMethod === "Zelle") {
      payment_request_payload.confirmation_number = confirmationNumber;
    }
  
    console.log("HERE CHECK ABHINAV");
  
    try {
      const response = await fetch(`${APIConfig.baseURL.dev}/makePayment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payment_request_payload),
      });
  
      if (response.ok) {
        navigate("/tenantDashboard");
      } else {
        console.error("Payment failed", response);
      }
    } catch (error) {
      console.error("Error making payment:", error);
    }
  
    setShowSpinner(false);
  };
  
  

  useEffect(() => {
    // Whenever paymentNotes changes, update business_code in paymentData
    setPaymentData(prevData => ({
      ...prevData,
      business_code: paymentNotes
    }));
  }, [paymentNotes]);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Ensure paymentData is updated with the latest business_code
    const updatedPaymentData = {
      ...paymentData,
      business_code: paymentNotes, // Ensure business_code is updated with paymentNotes
      total: parseFloat(totalToBePaid.toFixed(2)),
    };
  
    if (selectedMethod === "Bank Transfer") {
      bank_transfer_handler();
    } else if (selectedMethod === "Credit Card") {
      console.log("Credit card")
      setStripeDialogShow(true);
    } else if (selectedMethod === "Zelle") {
      console.log("Zelle ")
      let payment_intent = "Zelle";
      let payment_method = "Zelle";
      submit(payment_intent, payment_method); // Pass updated paymentData
    }
  };


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

  const handleChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedMethod(selectedValue);
  
    // Clear confirmation number if not Zelle
    if (selectedValue !== "Zelle") {
      setConfirmationNumber("");
    }
  
    update_fee(event);  // Call to update the convenience fee based on selected method
  };
  
  return (
    <>
      <ThemeProvider theme={theme}>
        <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
          <CircularProgress color='inherit' />
        </Backdrop>

        <Container maxWidth='lg' sx={{ paddingTop: "10px", height: "90vh" }}>
          <Grid container spacing={6} sx={{ height: "90%" }}>
            <Grid container item xs={12} md={12} columnSpacing={6}>
              <Paper
                component={Stack}
                direction='column'
                justifyContent='center'
                style={{
                  justifyContent: "center",
                  width: "100%",
                  marginBottom: "40px",
                  boxShadow: "none",
                }}
              >
                <Box component='span' display='flex' justifyContent='center' alignItems='center' position='relative'>
                  <Typography
                    sx={{
                      justifySelf: "center",
                      color: theme.typography.primary.black,
                      fontWeight: theme.typography.primary.fontWeight,
                      fontSize: theme.typography.largeFont,
                    }}
                  >
                    {roleName()} Payments
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#160449",
                    paddingTop: "10px",
                  }}
                >
                  <Box
                    sx={{
                      height: "30px",
                      width: "30px",
                      backgroundColor: "#bbb",
                      borderRadius: "50%",
                      // marginRight: "10px",
                    }}
                    onClick={() => {
                      console.log("Navigate to Property or Tenant Profile");
                    }}
                  ></Box>
                  <Box
                    sx={{
                      fontSize: "11px",
                      fontWeight: "600",
                    }}
                  ></Box>
                </Box>

                <Paper
                  sx={{
                    margin: "25px",
                    padding: "20px",
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
                  <Stack direction='row' justifyContent='left' m={2}>
                    <Typography sx={{ color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}>
                      Balance
                    </Typography>
                  </Stack>
                    <Stack direction='row' justifyContent='center' m={2}>
                      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                        <Grid item xs={6}>
                          <Typography sx={{ marginLeft: "20px", color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight, fontSize: "26px" }}>
                            ${total.toFixed(2)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Button
                            disabled={total <= 0}
                            sx={{
                              backgroundColor: "#3D5CAC",
                              borderRadius: "10px",
                              color: "#FFFFFF",
                              width: "100%",
                            }}
                            onClick={() => {setShowPaymentMethod(true);}}
                          >
                            <Typography
                              variant='outlined'
                              style={{
                                textTransform: "none",
                                color: "#FFFFFF",
                                fontSize: "18px",
                                fontFamily: "Source Sans Pro",
                                fontWeight: "600",
                              }}
                            >
                              Select Payment
                            </Typography>
                          </Button>
                        </Grid>
                      </Grid>
                    </Stack>

                  <Stack
                    direction='row'
                    justifyContent='center'
                    m={2}
                    sx={{
                      paddingTop: "25px",
                      paddingBottom: "15px",
                    }}
                  >
                    <TextField variant='filled' fullWidth={true} multiline={true} value={paymentNotes} onChange={handlePaymentNotesChange} label='Payment Notes' />
                  </Stack>
                </Paper>

                {showPaymentMethod && (
                <PaymentMethodSelector
                  paymentData={paymentData}
                  stripePromise={stripePromise}
                  convenience_fee={convenience_fee}
                  totalBalance={totalBalance}
                  confirmationNumber={confirmationNumber}
                  selectedMethod={selectedMethod}
                  setConfirmationNumber={setConfirmationNumber}
                  handleChange={handleChange}
                  handleSubmit={handleSubmit} // The function for submitting payments
                  />
                )}

                {/* What is shown in Balance Details Depends on Role */}
                {customer_role === "350" ? (
                  <Paper
                    sx={{
                      margin: "25px",
                      padding: 20,
                      backgroundColor: theme.palette.primary.main,
                      // height: "25%",
                    }}
                  >
                    <Stack direction='row' justifyContent='space-between'>
                      <Typography sx={{ color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}>
                        Balance Details - Money Payable
                    </Typography>
                      <Typography
                        sx={{ marginLeft: "20px", color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}
                      >
                        ${totalToBePaid.toFixed(2)}
                      </Typography>
                    </Stack>

                    <Stack>
                      <TenantBalanceTable data={moneyToBePaid} total={total} setTotal={setTotal} setPaymentData={setPaymentData} setSelectedItems={setSelectedItems} />
                    </Stack>
                  </Paper>
                ) : (
                  <Paper
                              sx={{
                      margin: "25px",
                      padding: 20,
                      backgroundColor: theme.palette.primary.main,
                      // height: "25%",
                    }}
                  >
                    <Stack direction='row' justifyContent='space-between'>
                      <Typography sx={{ color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}>
                        Balance Details - Money Payable
                              </Typography>
                      <Typography
                        sx={{ marginLeft: "20px", color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}
                      >
                        ${totalPayable.toFixed(2)}
                      </Typography>
                    </Stack>

                    <Stack>
                      <BalanceDetailsTable data={moneyPayable} total={total} setTotal={setTotal} setPaymentData={setPaymentData} setSelectedItems={setSelectedItems} />
                    </Stack>
                  </Paper>
                )}

                {/* Conditional rendering for Money To Be Paid section */}
                {customer_role !== "350" && (
                  <Paper
                              sx={{
                      margin: "25px",
                      padding: 20,
                      backgroundColor: theme.palette.primary.main,
                      // height: "25%",
                    }}
                  >
                    <Stack direction='row' justifyContent='space-between'>
                      <Typography sx={{ color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}>
                        Money To Be Paid
                              </Typography>
                      <Typography
                        sx={{ marginLeft: "20px", color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}
                      >
                        ${totalToBePaid.toFixed(2)}
                      </Typography>
                    </Stack>

                    <Stack>
                      <MoneyPayableTable data={moneyToBePaid} />
                    </Stack>
                  </Paper>
                )}

                {/* All Roles show Money Paid */}
                <Paper
                              sx={{
                    margin: "25px",
                    padding: 20,
                    backgroundColor: theme.palette.primary.main,
                    // height: "25%",
                  }}
                >
                  <Stack direction='row' justifyContent='space-between'>
                    <Typography sx={{ color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}>
                      Payment History - Money Paid
                    </Typography>
                    <Typography
                      sx={{ marginLeft: "20px", color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}
                    >
                      ${totalPaid.toFixed(2)}
                    </Typography>
                  </Stack>

                  <Stack>
                    <MoneyPaidTable data={moneyPaid} />
                  </Stack>
                </Paper>

                {/* Conditional rendering for Money Received section */}
                {paymentData.customer_uid.substring(0, 3) !== "350" && (
                  <Paper
                              sx={{
                      margin: "25px",
                      padding: 20,
                      backgroundColor: theme.palette.primary.main,
                      // height: "25%",
                    }}
                  >
                    <Stack direction='row' justifyContent='space-between'>
                      <Typography sx={{ color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}>
                        Money Received
                              </Typography>
                      <Typography
                        sx={{ marginLeft: "20px", color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}
                      >
                        ${totalReceived.toFixed(2)}
                      </Typography>
                    </Stack>

                    <Stack>
                      <MoneyReceivedTable data={moneyReceived} />
                    </Stack>
                  </Paper>
                )}

                {/* Conditional rendering for Money To Be Received section */}
                {paymentData.customer_uid.substring(0, 3) !== "350" && (
                  <Paper
                      sx={{
                      margin: "25px",
                      padding: 20,
                      backgroundColor: theme.palette.primary.main,
                      // height: "25%",
                    }}
                  >
                    <Stack direction='row' justifyContent='space-between'>
                      <Typography sx={{ color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}>
                        Money To Be Received
                      </Typography>
                      <Typography
                        sx={{ marginLeft: "20px", color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}
                      >
                        ${totalToBeReceived.toFixed(2)}
                      </Typography>
                    </Stack>

                    <Stack>
                      <MoneyReceivedTable data={moneyToBeReceived} />
                    </Stack>
                  </Paper>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </ThemeProvider>
    </>
  );
}

function PaymentMethodSelectorTest({
  selectedMethod,
  handleChange,
  confirmationNumber,
  setConfirmationNumber,
  paymentMethods,
  handleSubmit,
  updateFee,
}) {

  const handlePaymentMethodChange = (event) => {
    console.log("called here");
    const selectedValue = event.target.value;
    handleChange(event); // This will update the selectedMethod
    updateFee(event); // This will calculate the fee based on the selected method
    
    // Clear confirmation number if not Zelle
    if (selectedValue !== "Zelle") {
      setConfirmationNumber("");
    }
  };

  return (
    <Paper
      style={{
        margin: "25px",
        padding: "20px",
        backgroundColor: "#FFFFFF",
      }}
    >
      <Typography sx={{ color: "#3D5CAC", fontWeight: 800, fontSize: "24px" }}>
        Payment Methods
      </Typography>
      <Divider light />
      <FormControl component="fieldset">
        <RadioGroup aria-label="paymentMethod" name="paymentMethod" value={selectedMethod} onChange={handlePaymentMethodChange}>
          {/* Bank Transfer */}
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

                <Typography sx={{ color: theme.typography.common.blue, fontWeight: 800, fontSize: theme.typography.secondaryFont }}>Other Payment Methods</Typography>
                <Typography sx={{ color: theme.typography.common.blue, fontWeight: 400, fontSize: "16px" }}>
                  Payment Instructions for Paypal, Apple Pay Zelle, and Venmo: Please make payment via 3rd party app and record payment information here. If you are using Zelle,
                  please include the transaction confirmation number.
                </Typography>

          {/* Zelle with Confirmation Number */}
          <FormControlLabel
            value="Zelle"
            control={
              <Radio
                sx={{
                  color: selectedMethod === "Zelle" ? "#3D5CAC" : "#000000",
                  "&.Mui-checked": {
                    color: "#3D5CAC",
                  },
                }}
              />
            }
            label={
              <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                <img src={Zelle} alt="Zelle" style={{ marginRight: "8px", height: "24px" }} />
                <Typography sx={{ color: selectedMethod === "Zelle" ? "#3D5CAC" : "#000000" }}>
                  Zelle
                </Typography>
                {selectedMethod === "Zelle" && (
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
                  />
                )}
              </div>
            }
          />

          {/* Venmo */}
          <FormControlLabel
            value="Venmo"
            control={
              <Radio
                sx={{
                  color: selectedMethod === "Venmo" ? "#3D5CAC" : "#000000",
                  "&.Mui-checked": {
                    color: "#3D5CAC",
                  },
                }}
              />
            }
            label={
              <div style={{ display: "flex", alignItems: "center" }}>
                <img src={Venmo} alt="Venmo" style={{ marginRight: "8px", height: "24px" }} />
                Venmo
              </div>
            }
          />
        </RadioGroup>
      </FormControl>
      {selectedMethod && (
        <Box sx={{ textAlign: "center", marginTop: "20px" }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#3D5CAC",
              color: "#FFFFFF",
              "&:hover": {
                backgroundColor: "#2B4A94",
              },
            }}
            onClick={handleSubmit}
            disabled={selectedMethod === "Zelle" && !confirmationNumber}
          >
            Make Payment
          </Button>
        </Box>
      )}
    </Paper>
  );
}


function BalanceDetailsTable(props) {
  // console.log("In BalanceDetailTable", props);
  const [data, setData] = useState(props.data);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [paymentDueResult, setPaymentDueResult] = useState([]);

  useEffect(() => {
    setData(props.data);
  }, [props.data]);

  useEffect(() => {
    if (data && data.length > 0) {
      setSelectedRows(data.map((row) => row.purchase_uid));
      setPaymentDueResult(
        data.map((item) => ({
          ...item,
          pur_amount_due: parseFloat(item.pur_amount_due),
        }))
      );
    }
  }, [data]);

  useEffect(() => {
    var total = 0;

    let purchase_uid_mapping = [];

    for (const item of selectedRows) {
      // console.log("item in loop", item)

      let paymentItemData = paymentDueResult.find((element) => element.purchase_uid === item);
      purchase_uid_mapping.push({ purchase_uid: item, pur_amount_due: paymentItemData.pur_amount_due.toFixed(2) });
      // console.log("payment item data", paymentItemData);

      // total += parseFloat(paymentItemData.pur_amount_due);
      // Adjust total based on pur_cf_type
      if (paymentItemData.pur_cf_type === "revenue") {
        total += parseFloat(paymentItemData.pur_amount_due);
      } else if (paymentItemData.pur_cf_type === "expense") {
        total -= parseFloat(paymentItemData.pur_amount_due);
      }
    }
    // console.log("selectedRows useEffect - total - ", total);
    // console.log("selectedRows useEffect - purchase_uid_mapping - ", purchase_uid_mapping);
    props.setTotal(total);
    props.setPaymentData((prevPaymentData) => ({
      ...prevPaymentData,
      balance: total.toFixed(2),
      purchase_uids: purchase_uid_mapping,
    }));
  }, [selectedRows]);

  useEffect(() => {
    console.log("selectedPayments - ", selectedPayments);
    props.setSelectedItems(selectedPayments);
  }, [selectedPayments]);

  const getFontColor = (ps_value) => {
    if (ps_value === "PAID") {
      return theme.typography.primary.blue;
    } else if (ps_value === "PAID LATE") {
      return theme.typography.primary.aqua;
    } else {
      return theme.typography.primary.red; // UNPAID OR PARTIALLY PAID OR NULL
    }
  };

  const sortModel = [
    {
      field: "pgps", // Specify the field to sort by
      sort: "asc", // Specify the sort order, 'asc' for ascending
    },
  ];

  const columnsList = [
    {
      field: "pur_description",
      headerName: "Description",
      flex: 2,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },

    {
      field: "owner_uid",
      headerName: "Owner UID",
      flex: 1,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },

    {
      field: "pur_property_id",
      headerName: "Property UID",
      flex: 1,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },
    {
      field: "property_address",
      headerName: "Address",
      flex: 1,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },
    {
      field: "property_unit",
      headerName: "Unit",
      flex: 1,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },
    {
      field: "purchase_status",
      headerName: "Status",
      flex: 1,
      headerStyle: {
        fontWeight: "bold", // Apply inline style to the header cell
      },
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },

    {
      field: "pgps",
      headerName: "Rent Status",
      flex: 1,
      headerStyle: {
        fontWeight: "bold", // Apply inline style to the header cell
      },
      renderCell: (params) => {
        if (params.value === null) {
          return <div>Maintenance</div>; // Handle null values here
        }

        const trimmedValue = params.value.substring(11); // Extract characters after the first 11 characters
        return <Box sx={{ fontWeight: "bold", color: getFontColor(trimmedValue) }}>{trimmedValue}</Box>;
      },
      // renderCell: (params) => <Box sx={{ fontWeight: "bold", color: getFontColor(params.value) }}>{params.value}</Box>,
    },
    {
      field: "pur_due_date",
      headerName: "Due Date",
      flex: 1,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },

    {
      field: "pur_amount_due",
      headerName: "Amount Due",
      flex: 1,
      headerStyle: {
        fontWeight: "bold", // Apply inline style to the header cell
      },
      renderCell: (params) => (
        <Box
          sx={{
            fontWeight: "bold",
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          {/* $ {parseFloat(params.value).toFixed(2)} */}
          {/* Check pur_cf_type value */}
          {params.row.pur_cf_type === "revenue"
            ? // If pur_cf_type is 'revenue', display amount due without parentheses
              `$ ${parseFloat(params.value).toFixed(2)}`
            : // If pur_cf_type is 'expense', display amount due with parentheses
              `($ ${parseFloat(params.value).toFixed(2)})`}
        </Box>
      ),
    },
  ];

  const handleSelectionModelChange = (newRowSelectionModel) => {
    console.log("newRowSelectionModel - ", newRowSelectionModel);

    const addedRows = newRowSelectionModel.filter((rowId) => !selectedRows.includes(rowId));
    const removedRows = selectedRows.filter((rowId) => !newRowSelectionModel.includes(rowId));

    if (addedRows.length > 0) {
      // console.log("Added rows: ", addedRows);
      let newPayments = [];
      addedRows.forEach((item, index) => {
        const addedPayment = paymentDueResult.find((row) => row.purchase_uid === addedRows[index]);
        // setCurrentTotal(prevTotal => prevTotal + addedPayment.pur_amount_due);
        newPayments.push(addedPayment);
      });

      // console.log("newPayments - ", newPayments);
      setSelectedPayments((prevState) => {
        return [...prevState, ...newPayments];
      });
    }

    if (removedRows.length > 0) {
      // console.log("Removed rows: ", removedRows);
      let removedPayments = [];
      removedRows.forEach((item, index) => {
        let removedPayment = paymentDueResult.find((row) => row.purchase_uid === removedRows[index]);
        // setCurrentTotal(prevTotal => prevTotal - removedPayment.pur_amount_due);
        removedPayments.push(removedPayment);
      });
      // console.log("removedPayments - ", removedPayments);
      setSelectedPayments((prevState) => prevState.filter((payment) => !removedRows.includes(payment.purchase_uid)));
    }
    setSelectedRows(newRowSelectionModel);
  };

  if (paymentDueResult.length > 0) {
    // console.log("Passed Data ", paymentDueResult);
    return (
      <>
        <DataGrid
          rows={paymentDueResult}
          columns={columnsList}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 100,
              },
            },
          }}
          // getRowId={(row) => row.purchase_uid}
          getRowId={(row) => {
            const rowId = row.purchase_uid;
            // console.log("Hello Globe");
            // console.log("Row ID:", rowId);
            // console.log("Row Data:", row); // Log the entire row data
            // console.log("Row PS:", row.ps); // Log the ps field
            return rowId;
          }}
          pageSizeOptions={[10, 50, 100]}
          checkboxSelection
          disableRowSelectionOnClick
          rowSelectionModel={selectedRows}
          onRowSelectionModelChange={handleSelectionModelChange}
          onRowClick={(row) => {
            {
              console.log("Row =", row);
            }
            // handleOnClickNavigateToMaintenance(row);
          }}
          sortModel={sortModel} // Set the sortModel prop

          //   onRowClick={(row) => handleOnClickNavigateToMaintenance(row)}
        />
        {/* {selectedRows.length > 0 && (
          <div>Total selected amount: ${selectedRows.reduce((total, rowId) => total + parseFloat(paymentDueResult.find((row) => row.purchase_uid === rowId).pur_amount_due), 0)}</div>
        )} */}
        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} alignItems='center' sx={{ paddingTop: "15px" }}>
          <Grid item xs={1} alignItems='center'></Grid>
          <Grid item xs={9} alignItems='center'>
            <Typography
              sx={{
                color: theme.typography.primary.blue,
                // color: paymentDueResult.ps === "UNPAID" ? "green" : "red", // Set color based on condition
                fontWeight: theme.typography.medium.fontWeight,
                fontSize: theme.typography.smallFont,
                fontFamily: "Source Sans Pro",
              }}
            >
              Total To Be Paid
            </Typography>
          </Grid>

          <Grid item xs={2} alignItems='right'>
            <Typography
              sx={{
                color: theme.typography.primary.blue,
                fontWeight: theme.typography.medium.fontWeight,
                fontSize: theme.typography.smallFont,
                fontFamily: "Source Sans Pro",
              }}
            >
              {/* $ {selectedRows.reduce((total, rowId) => total + paymentDueResult.find((row) => row.purchase_uid === rowId).pur_amount_due, 0)} */}${" "}
              {selectedRows.reduce((total, rowId) => {
                const payment = paymentDueResult.find((row) => row.purchase_uid === rowId);
                const amountDue = payment.pur_amount_due;
                const isExpense = payment.pur_cf_type === "expense";

                // Adjust the total based on whether the payment is an expense or revenue
                return total + (isExpense ? -amountDue : amountDue);
              }, 0)}
            </Typography>
          </Grid>
        </Grid>
      </>
    );
  } else {
    return <></>;
  }
}

function TenantBalanceTable(props) {
  // console.log("In BalanceDetailTable", props);
  const [data, setData] = useState(props.data);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [paymentDueResult, setPaymentDueResult] = useState([]);

  useEffect(() => {
    setData(props.data);
  }, [props.data]);

  useEffect(() => {
    if (data && data.length > 0) {
      setSelectedRows(data.map((row) => row.purchase_uid));
      setPaymentDueResult(
        data.map((item) => ({
          ...item,
          pur_amount_due: parseFloat(item.pur_amount_due),
        }))
      );
    }
  }, [data]);

  useEffect(() => {
    var total = 0;

    let purchase_uid_mapping = [];

    for (const item of selectedRows) {
      // console.log("item in loop", item)

      let paymentItemData = paymentDueResult.find((element) => element.purchase_uid === item);
      purchase_uid_mapping.push({ purchase_uid: item, pur_amount_due: paymentItemData.pur_amount_due.toFixed(2) });
      // console.log("payment item data", paymentItemData);

      // total += parseFloat(paymentItemData.pur_amount_due);
      // Adjust total based on pur_cf_type
      if (paymentItemData.pur_cf_type === "revenue") {
        total += parseFloat(paymentItemData.pur_amount_due);
      } else if (paymentItemData.pur_cf_type === "expense") {
        total -= parseFloat(paymentItemData.pur_amount_due);
      }
    }
    // console.log("selectedRows useEffect - total - ", total);
    // console.log("selectedRows useEffect - purchase_uid_mapping - ", purchase_uid_mapping);
    props.setTotal(total);
    props.setPaymentData((prevPaymentData) => ({
      ...prevPaymentData,
      balance: total.toFixed(2),
      purchase_uids: purchase_uid_mapping,
    }));
  }, [selectedRows]);

  useEffect(() => {
    console.log("selectedPayments - ", selectedPayments);
    props.setSelectedItems(selectedPayments);
  }, [selectedPayments]);

  const getFontColor = (ps_value) => {
    if (ps_value === "PAID") {
      return theme.typography.primary.blue;
    } else if (ps_value === "PAID LATE") {
      return theme.typography.primary.aqua;
    } else {
      return theme.typography.primary.red; // UNPAID OR PARTIALLY PAID OR NULL
    }
  };

  const columnsList = [
    {
      field: "pur_description",
      headerName: "Description",
      flex: 2,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },

    // {
    //   field: "owner_uid",
    //   headerName: "Owner UID",
    //   flex: 1,
    //   renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    // },

    {
      field: "pur_property_id",
      headerName: "Property UID",
      flex: 1,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },
    {
      field: "property_address",
      headerName: "Address",
      flex: 1,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },
    {
      field: "property_unit",
      headerName: "Unit",
      flex: 1,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },
    {
      field: "purchase_status",
      headerName: "Status",
      flex: 1,
      headerStyle: {
        fontWeight: "bold", // Apply inline style to the header cell
      },
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },

    // {
    //   field: "pgps",
    //   headerName: "Rent Status",
    //   flex: 1,
    //   headerStyle: {
    //     fontWeight: "bold", // Apply inline style to the header cell
    //   },
    //   renderCell: (params) => {
    //     if (params.value === null) {
    //       return <div>Maintenance</div>; // Handle null values here
    //     }

    //     const trimmedValue = params.value.substring(11); // Extract characters after the first 11 characters
    //     return <Box sx={{ fontWeight: "bold", color: getFontColor(trimmedValue) }}>{trimmedValue}</Box>;
    //   },
    //   // renderCell: (params) => <Box sx={{ fontWeight: "bold", color: getFontColor(params.value) }}>{params.value}</Box>,
    // },
    {
      field: "pur_due_date",
      headerName: "Due Date",
      flex: 1,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },

    {
      field: "pur_amount_due",
      headerName: "Amount Due",
      flex: 1,
      headerStyle: {
        fontWeight: "bold", // Apply inline style to the header cell
      },
      renderCell: (params) => (
        <Box
          sx={{
            fontWeight: "bold",
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          {/* $ {parseFloat(params.value).toFixed(2)} */}
          {/* Check pur_cf_type value */}
          {params.row.pur_cf_type === "revenue"
            ? // If pur_cf_type is 'revenue', display amount due without parentheses
              `$ ${parseFloat(params.value).toFixed(2)}`
            : // If pur_cf_type is 'expense', display amount due with parentheses
              `($ ${parseFloat(params.value).toFixed(2)})`}
        </Box>
      ),
    },
  ];

  const handleSelectionModelChange = (newRowSelectionModel) => {
    console.log("newRowSelectionModel - ", newRowSelectionModel);

    const addedRows = newRowSelectionModel.filter((rowId) => !selectedRows.includes(rowId));
    const removedRows = selectedRows.filter((rowId) => !newRowSelectionModel.includes(rowId));

    if (addedRows.length > 0) {
      // console.log("Added rows: ", addedRows);
      let newPayments = [];
      addedRows.forEach((item, index) => {
        const addedPayment = paymentDueResult.find((row) => row.purchase_uid === addedRows[index]);
        // setCurrentTotal(prevTotal => prevTotal + addedPayment.pur_amount_due);
        newPayments.push(addedPayment);
      });

      // console.log("newPayments - ", newPayments);
      setSelectedPayments((prevState) => {
        return [...prevState, ...newPayments];
      });
    }

    if (removedRows.length > 0) {
      // console.log("Removed rows: ", removedRows);
      let removedPayments = [];
      removedRows.forEach((item, index) => {
        let removedPayment = paymentDueResult.find((row) => row.purchase_uid === removedRows[index]);
        // setCurrentTotal(prevTotal => prevTotal - removedPayment.pur_amount_due);
        removedPayments.push(removedPayment);
      });
      // console.log("removedPayments - ", removedPayments);
      setSelectedPayments((prevState) => prevState.filter((payment) => !removedRows.includes(payment.purchase_uid)));
    }
    setSelectedRows(newRowSelectionModel);
  };

  if (paymentDueResult.length > 0) {
    // console.log("Passed Data ", paymentDueResult);
    return (
      <>
        <DataGrid
          rows={paymentDueResult}
          columns={columnsList}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 100,
              },
            },
          }}
          // getRowId={(row) => row.purchase_uid}
          getRowId={(row) => {
            const rowId = row.purchase_uid;
            // console.log("Hello Globe");
            // console.log("Row ID:", rowId);
            // console.log("Row Data:", row); // Log the entire row data
            // console.log("Row PS:", row.ps); // Log the ps field
            return rowId;
          }}
          pageSizeOptions={[10, 50, 100]}
          checkboxSelection
          disableRowSelectionOnClick
          rowSelectionModel={selectedRows}
          onRowSelectionModelChange={handleSelectionModelChange}
          onRowClick={(row) => {
            {
              console.log("Row =", row);
            }
            // handleOnClickNavigateToMaintenance(row);
          }}

          //   onRowClick={(row) => handleOnClickNavigateToMaintenance(row)}
        />
        {/* {selectedRows.length > 0 && (
          <div>Total selected amount: ${selectedRows.reduce((total, rowId) => total + parseFloat(paymentDueResult.find((row) => row.purchase_uid === rowId).pur_amount_due), 0)}</div>
        )} */}
        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} alignItems='center' sx={{ paddingTop: "15px" }}>
          <Grid item xs={1} alignItems='center'></Grid>
          <Grid item xs={9} alignItems='center'>
            <Typography
              sx={{
                color: theme.typography.primary.blue,
                // color: paymentDueResult.ps === "UNPAID" ? "green" : "red", // Set color based on condition
                fontWeight: theme.typography.medium.fontWeight,
                fontSize: theme.typography.smallFont,
                fontFamily: "Source Sans Pro",
              }}
            >
              Total To Be Paid
            </Typography>
          </Grid>

          <Grid item xs={2} alignItems='right'>
            <Typography
              sx={{
                color: theme.typography.primary.blue,
                fontWeight: theme.typography.medium.fontWeight,
                fontSize: theme.typography.smallFont,
                fontFamily: "Source Sans Pro",
              }}
            >
              {/* $ {selectedRows.reduce((total, rowId) => total + paymentDueResult.find((row) => row.purchase_uid === rowId).pur_amount_due, 0)} */}${" "}
              {selectedRows.reduce((total, rowId) => {
                const payment = paymentDueResult.find((row) => row.purchase_uid === rowId);
                const amountDue = payment.pur_amount_due;
                const isExpense = payment.pur_cf_type === "expense";

                // Adjust the total based on whether the payment is an expense or revenue
                return total + (isExpense ? -amountDue : amountDue);
              }, 0)}
            </Typography>
          </Grid>
        </Grid>
      </>
    );
  } else {
    return <></>;
  }
}

function MoneyReceivedTable(props) {
  // console.log("In MoneyReceivedTable", props);
  const [data, setData] = useState(props.data);
  const [selectedRows, setSelectedRows] = useState([]);
  // const [selectedPayments, setSelectedPayments] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    setData(props.data);
  }, [props.data]);

  useEffect(() => {
    if (data && data.length > 0) {
      setSelectedRows(data.map((row) => row.payment_uid));
      setPayments(
        data.map((item) => ({
          ...item,
          pur_amount_due: parseFloat(item.pur_amount_due),
        }))
      );
    }
  }, [data]);

  const columnsList = [
    {
      field: "latest_date",
      headerName: "Date",
      flex: 1,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value ? params.value : params.row.pur_due_date}</Box>,
    },

    {
      field: "purchase_uid",
      headerName: "Purchase UID",
      flex: 1,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },

    {
      field: "purchase_type",
      headerName: "Purchase Type",
      flex: 1,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },

    {
      field: "pur_description",
      headerName: "Description",
      flex: 2,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },
    {
      field: "pur_property_id",
      headerName: "Property UID",
      flex: 1,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },

    {
      field: "property_address",
      headerName: "Address",
      flex: 2,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },

    {
      field: "property_unit",
      headerName: "Unit",
      flex: 1,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },
    {
      field: "payer_profile_uid",
      headerName: "Payer ID",
      flex: 1,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },

    {
      field: "payer_user_name",
      headerName: "Payer Name",
      flex: 2,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },
    {
      field: "payment_status",
      headerName: "Status",
      flex: 1,
      headerStyle: {
        fontWeight: "bold", // Apply inline style to the header cell
      },
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },

    {
      field: "pur_amount_due",
      headerName: "Amount Due",
      flex: 0.7,
      headerStyle: {
        fontWeight: "bold", // Apply inline style to the header cell
      },
      renderCell: (params) => (
        <Box
          sx={{
            fontWeight: "bold",
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          $ {parseFloat(params.value).toFixed(2)}
        </Box>
      ),
    },

    {
      field: "total_paid",
      headerName: "Total Paid",
      flex: 0.7,
      headerStyle: {
        fontWeight: "bold", // Apply inline style to the header cell
      },
      renderCell: (params) => (
        <Box
          sx={{
            fontWeight: "bold",
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          $ {params.value === null || parseFloat(params.value) === 0 ? "0.00" : parseFloat(params.value).toFixed(2)}
        </Box>
      ),
    },
  ];

  if (payments.length > 0) {
    return (
      <>
        <DataGrid
          rows={payments}
          columns={columnsList}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 100,
              },
            },
          }}
          getRowId={(row) => row.purchase_uid}
          pageSizeOptions={[10, 50, 100]}
          // checkboxSelection
          // disableRowSelectionOnClick
          // rowSelectionModel={selectedRows}
          // onRowSelectionModelChange={handleSelectionModelChange}
          onRowClick={(row) => {
            {
              console.log("Row =", row);
            }
            // handleOnClickNavigateToMaintenance(row);
          }}
          //   onRowClick={(row) => handleOnClickNavigateToMaintenance(row)}
        />
      </>
    );
  } else {
    return <></>;
  }
}

function MoneyPaidTable(props) {
  // console.log("In MoneyPaidTable", props);
  const [data, setData] = useState(props.data);
  const [selectedRows, setSelectedRows] = useState([]);
  // const [selectedPayments, setSelectedPayments] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    setData(props.data);
  }, [props.data]);

  useEffect(() => {
    if (data && data.length > 0) {
      setSelectedRows(data.map((row) => row.payment_uid));
      setPayments(
        data.map((item) => ({
          ...item,
          pur_amount_due: parseFloat(item.pur_amount_due),
        }))
      );
    }
  }, [data]);

  const columnsList = [
    {
      field: "latest_date",
      headerName: "Date",
      flex: 1,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value ? params.value : params.row.pur_due_date}</Box>,
    },

    {
      field: "purchase_uid",
      headerName: "Purchase UID",
      flex: 1,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },

    {
      field: "purchase_type",
      headerName: "Purchase Type",
      flex: 1,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },

    {
      field: "pur_description",
      headerName: "Description",
      flex: 2,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },
    {
      field: "pur_property_id",
      headerName: "Property UID",
      flex: 1,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },

    {
      field: "property_address",
      headerName: "Address",
      flex: 2,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },

    {
      field: "property_unit",
      headerName: "Unit",
      flex: 1,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },
    {
      field: "receiver_profile_uid",
      headerName: "Receiver ID",
      flex: 1,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },

    {
      field: "receiver_user_name",
      headerName: "Receiver Name",
      flex: 2,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },
    {
      field: "payment_status",
      headerName: "Status",
      flex: 1,
      headerStyle: {
        fontWeight: "bold", // Apply inline style to the header cell
      },
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },

    {
      field: "pur_amount_due",
      headerName: "Amount Due",
      flex: 0.7,
      headerStyle: {
        fontWeight: "bold", // Apply inline style to the header cell
      },
      renderCell: (params) => (
        <Box
          sx={{
            fontWeight: "bold",
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          $ {parseFloat(params.value).toFixed(2)}
        </Box>
      ),
    },

    {
      field: "total_paid",
      headerName: "Total Paid",
      flex: 0.7,
      headerStyle: {
        fontWeight: "bold", // Apply inline style to the header cell
      },
      renderCell: (params) => (
        <Box
          sx={{
            fontWeight: "bold",
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          $ {params.value === null || parseFloat(params.value) === 0 ? "0.00" : parseFloat(params.value).toFixed(2)}
        </Box>
      ),
    },
  ];

  if (payments.length > 0) {
    return (
      <>
        <DataGrid
          rows={payments}
          columns={columnsList}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 100,
              },
            },
          }}
          getRowId={(row) => row.purchase_uid}
          pageSizeOptions={[10, 50, 100]}
          // checkboxSelection
          // disableRowSelectionOnClick
          // rowSelectionModel={selectedRows}
          // onRowSelectionModelChange={handleSelectionModelChange}
          onRowClick={(row) => {
            {
              console.log("Row =", row);
            }
            // handleOnClickNavigateToMaintenance(row);
          }}
          //   onRowClick={(row) => handleOnClickNavigateToMaintenance(row)}
        />
      </>
    );
  } else {
    return <></>;
  }
}

function MoneyPayableTable(props) {
  // console.log("In MoneyPaidTable", props);
  const [data, setData] = useState(props.data);
  const [selectedRows, setSelectedRows] = useState([]);
  // const [selectedPayments, setSelectedPayments] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    setData(props.data);
  }, [props.data]);

  useEffect(() => {
    if (data && data.length > 0) {
      setSelectedRows(data.map((row) => row.payment_uid));
      setPayments(
        data.map((item) => ({
          ...item,
          pur_amount_due: parseFloat(item.pur_amount_due),
        }))
      );
    }
  }, [data]);

  const getFontColor = (ps_value) => {
    if (ps_value === "PAID") {
      return theme.typography.primary.blue;
    } else if (ps_value === "PAID LATE") {
      return theme.typography.primary.aqua;
    } else {
      return theme.typography.primary.red; // UNPAID OR PARTIALLY PAID OR NULL
    }
  };

  const sortModel = [
    {
      field: "pgps", // Specify the field to sort by
      sort: "asc", // Specify the sort order, 'asc' for ascending
    },
  ];

  const columnsList = [
    {
      field: "pur_description",
      headerName: "Description",
      flex: 2,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },

    {
      field: "owner_uid",
      headerName: "Owner UID",
      flex: 1,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },

    {
      field: "pur_property_id",
      headerName: "Property UID",
      flex: 1,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },
    {
      field: "property_address",
      headerName: "Address",
      flex: 1,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },
    {
      field: "property_unit",
      headerName: "Unit",
      flex: 1,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },
    {
      field: "purchase_status",
      headerName: "Status",
      flex: 1,
      headerStyle: {
        fontWeight: "bold", // Apply inline style to the header cell
      },
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },
    {
      field: "pgps",
      headerName: "Rent Status",
      flex: 1,
      headerStyle: {
        fontWeight: "bold", // Apply inline style to the header cell
      },
      renderCell: (params) => {
        if (params.value === null) {
          return <div>Maintenance</div>; // Handle null values here
        }

        const trimmedValue = params.value.substring(11); // Extract characters after the first 11 characters
        return <Box sx={{ fontWeight: "bold", color: getFontColor(trimmedValue) }}>{trimmedValue}</Box>;
      },
      // renderCell: (params) => <Box sx={{ fontWeight: "bold", color: getFontColor(params.value) }}>{params.value}</Box>,
    },
    {
      field: "pur_due_date",
      headerName: "Due Date",
      flex: 1,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },

    {
      field: "pur_amount_due",
      headerName: "Amount Due",
      flex: 1,
      headerStyle: {
        fontWeight: "bold", // Apply inline style to the header cell
      },
      renderCell: (params) => (
        <Box
          sx={{
            fontWeight: "bold",
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          {/* $ {parseFloat(params.value).toFixed(2)} */}
          {/* Check pur_cf_type value */}
          {params.row.pur_cf_type === "revenue"
            ? // If pur_cf_type is 'revenue', display amount due without parentheses
              `$ ${parseFloat(params.value).toFixed(2)}`
            : // If pur_cf_type is 'expense', display amount due with parentheses
              `($ ${parseFloat(params.value).toFixed(2)})`}
        </Box>
      ),
    },
  ];

  if (payments.length > 0) {
    return (
      <>
        <DataGrid
          rows={payments}
          columns={columnsList}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 100,
              },
            },
          }}
          getRowId={(row) => row.purchase_uid}
          pageSizeOptions={[10, 50, 100]}
          // checkboxSelection
          // disableRowSelectionOnClick
          // rowSelectionModel={selectedRows}
          // onRowSelectionModelChange={handleSelectionModelChange}
          onRowClick={(row) => {
            {
              console.log("Row =", row);
            }
            // handleOnClickNavigateToMaintenance(row);
          }}
          //   onRowClick={(row) => handleOnClickNavigateToMaintenance(row)}
        />
      </>
    );
  } else {
    return <></>;
  }
}

//TENANT
