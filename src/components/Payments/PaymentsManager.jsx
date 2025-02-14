import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  ThemeProvider,
  Paper,
  Button,
  Typography,
  Stack,
  Grid,
  TextField,
  IconButton,
  Divider,
  Checkbox,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import theme from "../../theme/theme";
import { alpha, makeStyles } from "@material-ui/core/styles";
// import axios, { all } from "axios";
import { useUser } from "../../contexts/UserContext";
import StripePayment from "../Settings/StripePayment";
import BackIcon from "./backIcon.png";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { DataGrid } from "@mui/x-data-grid";
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../utils/httpMiddleware";
import APIConfig from "../../utils/APIConfig";

import ManagerCashflowWidget from "../Dashboard-Components/Cashflow/ManagerCashflowWidget";
import AccountBalanceWidget from "./TenantAccountBalance";
import { AccountBalance, CollectionsBookmarkRounded, ConstructionOutlined, ContactSupportOutlined } from "@mui/icons-material";
import useMediaQuery from "@mui/material/useMediaQuery";
import CircleIcon from "@mui/icons-material/Circle";
import documentIcon from "../../images/Subtract.png";

const useStyles = makeStyles((theme) => ({
  input: {
    background: "#000000",
  },
}));

const groupDataByKey = (data, key, byOwner=false, byRecipient = false, managerId) => {
  const groupedByKey = {};

  if (!byOwner && !byRecipient) {

    data?.forEach((payment) => {
      const dataKey = payment[key];
      if (!groupedByKey[dataKey]) {
        groupedByKey[dataKey] = [];
      }
      groupedByKey[dataKey].push(payment);
    });

  } else if (byOwner) {

    data?.forEach((item) => {
      const ownerId = item.property_owner_id;
      const propertyId = item.pur_property_id;

      if (ownerId.startsWith("110")) {
        if (!groupedByKey[ownerId]) {
          groupedByKey[ownerId] = {};
        }

        if (!groupedByKey[ownerId][propertyId]) {
          groupedByKey[ownerId][propertyId] = [];
        }

        groupedByKey[ownerId][propertyId].push(item);
      }
    });

  } else if (byRecipient) {

    // data?.forEach((item) => {
    //   let recipientId = item.pur_receiver;

    //   if (recipientId === managerId) {
    //     recipientId = item.pur_payer;
    //   }

    //   if(recipientId !== "STRIPE" && recipientId !== managerId){
    //     const propertyId = item.pur_property_id;
  
    //     if (!groupedByKey[recipientId]) {
    //       groupedByKey[recipientId] = {};
    //     }
  
    //     if (!groupedByKey[recipientId][propertyId]) {
    //       groupedByKey[recipientId][propertyId] = [];
    //     }
  
    //     groupedByKey[recipientId][propertyId].push(item);
    //   }
    // });

    const groupedByPurGroup = data.reduce((acc, item) => {
      const groupKey = item.pur_group;
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(item);
      return acc;
    }, {});
  
    Object.values(groupedByPurGroup).forEach((group) => {
      const validRecipients = group
        .map((item) => [item.pur_receiver, item.pur_payer])
        .flat()
        .filter(
          (id) => id !== managerId && !id.startsWith("350") && id !== "STRIPE"
        );
  
      const uniqueRecipients = Array.from(new Set(validRecipients));

      if (uniqueRecipients.length === 0) return;
  
      uniqueRecipients.forEach((recipientId) => {
        group.forEach((item) => {
          const propertyId = item.pur_property_id;
  
          if (!groupedByKey[recipientId]) {
            groupedByKey[recipientId] = {};
          }
  
          if (!groupedByKey[recipientId][propertyId]) {
            groupedByKey[recipientId][propertyId] = [];
          }
  
          groupedByKey[recipientId][propertyId].push(item);
        });
      });

    });

  }

  return groupedByKey;
};


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

export default function PaymentsManager(props) {
  //console.log("In Payments.jsx");
  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, getProfileId, roleName, selectedRole } = useUser();

  const { setSelectedPayment, setCurrentWindow, page } = props;

  const managerCashflowWidgetData = location.state?.managerCashflowWidgetData;
  const accountBalanceWidgetData = location.state?.accountBalanceWidgetData;
  // //console.log("managerCashflowWidgetData - ", managerCashflowWidgetData);

  // //console.log("selectedRole - ", selectedRole);

  const [moneyPaid, setMoneyPaid] = useState([]);
  const [moneyReceived, setMoneyReceived] = useState([]);
  const [moneyToBePaid, setMoneyToBePaid] = useState([]);
  const [moneyToBeReceived, setMoneyToBeReceived] = useState([]);
  const [moneyPayable, setMoneyPayable] = useState([]);
  const [selectedRowsForTransaction, setSelectedRowsForTransaction] = useState(props.selectedRowsForPayBills || []);

  const [transactionsData, setTransactionsData] = useState([]);
  const [totalTransactions, setTotalTransactions] = useState(0);

  const [showSpinner, setShowSpinner] = useState(false);
  const [paymentNotes, setPaymentNotes] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [globalTotal, setGlobalTotal] = useState({});
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalReceived, setTotalReceived] = useState(0);
  const [totalToBePaid, setTotalToBePaid] = useState(0);
  const [totalToBeReceived, setTotalToBeReceived] = useState(0);
  const [totalPayable, setTotalPayable] = useState(0);
  const [isHeaderChecked, setIsHeaderChecked] = useState(true);
  const [paymentMethodInfo, setPaymentMethodInfo] = useState({});
  const [tab, setTab] = useState("by_property");
  const [sortBy, setSortBy] = useState("by_property");
  const [cashFlowTotal, setCashFlowTotal] = useState(0);
  const [globalCashFlowTotal, setGlobalCashFlowTotal] = useState({});
  const [isDeselecting, setIsDeselecting] = useState(false);

  const [transactionDataByProeprty, setTransactionDataByProeprty] = useState({});
  const [transactionDataByOwner, setTransactionDataByOwner] = useState({});
  const [transactionDataByRecipient, setTransactionDataByRecipient] = useState({});

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

  const [globalPaymentData, setGlobalPaymentData] = useState({
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
  });

  useEffect(()=>{
    // //console.log(" == DHYEY == seletedItems - ", selectedItems)
  }, [selectedItems])

  useEffect(() => {
    // //console.log("ROHIT - 96 - paymentData - ", paymentData);
  }, [paymentData]);

  let customer_uid = getProfileId();
  let customer_role = customer_uid.substring(0, 3);
  // //console.log("Profile Info: ", getProfileId());
  // //console.log("Customer UID: ", customer_uid);
  // //console.log("Customer Role: ", customer_role);
  // //console.log("Customer UID: ", paymentData);
  // //console.log("Customer UID: ", paymentData.customer_uid);
  // //console.log("User Info: ", user);

  // function totalPaidUpdate(paidItems) {
  //   var total = 0;
  //   for (const item of paidItems) {
  //     total += parseFloat(item.pur_amount_due);
  //   }
  //   setTotalPaid(total);
  // }

  // useEffect(() => {
  //   //console.log("transactionsData - ", transactionsData);
  // }, [transactionsData]);

  const handleTotalChange = (propertyId, newTotal) => {
    setGlobalTotal((prevTotals) => {
      const updatedTotals = {
        ...prevTotals,
        [propertyId]: newTotal,
      };

      const updatedTotal = Object.values(updatedTotals).reduce((acc, val) => acc + val, 0);
      setTotal(updatedTotal);

      return updatedTotals;
    });
  };

  const handlePaymentDataChange = (propertyId, newTotal, newPurchaseIds) => {
    setGlobalPaymentData((prevTotals) => {
      const updatedPaymentData = {
        ...prevTotals,
        [propertyId]: {
          balance: newTotal,
          purchase_uids: [...newPurchaseIds],
        },
      };

      const updatedOverallBalance = Object.values(updatedPaymentData).reduce((acc, data) => acc + parseFloat(data.balance || 0), 0);

      // const allPurchaseIdsSet = new Set([...allPurchaseIds, ...newPurchaseIds]);
      // //console.log("check here .... - ", updatedPaymentData)
      const updatedPurchaseIds = Object.values(updatedPaymentData).reduce((acc, data) => {
        return [...acc, ...(Array.isArray(data.purchase_uids) ? data.purchase_uids : [])];
      }, []);

      setPaymentData((prevData) => ({
        ...prevData,
        balance: updatedOverallBalance,
        purchase_uids: updatedPurchaseIds,
      }));

      return updatedPaymentData;
    });
  };

  const handleTotalCashFlowChange = (propertyId, newTotal) => {
    setGlobalCashFlowTotal((prevTotals) => {
      const updatedTotals = {
        ...prevTotals,
        [propertyId]: newTotal,
      };

      const updatedTotal = Object.values(updatedTotals).reduce((acc, val) => acc + val, 0);
      setCashFlowTotal(updatedTotal);

      return updatedTotals;
    });
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
    //console.log("In totalMoneyPayable: ", moneyPayable);
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

  function getTransactionsTotal(data) {
    const verifiedPurGroups = [];

    data.forEach((transaction) => {
      if (!verifiedPurGroups.includes(transaction.pur_group) && transaction.verified && transaction.verified.toLowerCase() === "verified") {
        verifiedPurGroups.push(transaction.pur_group);
      }
    });

    // //console.log("ROHIT - 179 - verifiedPurGroups - ", verifiedPurGroups);

    const transactions = data
      // .filter(item => (item.verified && item.verified.toLowerCase() === "verified"));
      .filter((item) => verifiedPurGroups.includes(item.pur_group))
      .filter((item) => item.pur_payer.startsWith("600") || item.pur_payer.startsWith("110"))
      .filter((item) => {
        const total_paid = parseFloat(item.total_paid ? item.total_paid : "0");
        const pur_amount_due = parseFloat(item.pur_amount_due ? item.pur_amount_due : "0");

        return total_paid !== pur_amount_due;
      });

    var total = 0;
    for (const item of transactions) {
      if (item.pur_payer.startsWith("110")) {
        total -= parseFloat(item.pur_amount_due);
      } else if (item.pur_payer.startsWith("600")) {
        total += parseFloat(item.pur_amount_due);
      }
    }
    return total;
  }

  const fetchPaymentsData = async () => {
    //console.log("In fetchPaymensData");
    setShowSpinner(true);
    try {
      const res = await axios.get(`${APIConfig.baseURL.dev}/paymentStatus/${getProfileId()}`);
      // const paymentStatusData = res.data.PaymentStatus.result;
      // const paidStatusData = res.data.PaidStatus.result;

      const moneyPaidData = res.data.MoneyPaid.result;
      const moneyReceivedData = res.data.MoneyReceived.result;
      const moneyToBePaidData = res.data.MoneyToBePaid.result;
      const moneyToBeReceivedData = res.data.MoneyToBeReceived.result;
      const moneyPayableData = res.data.MoneyPayable.result;

      setMoneyPaid(moneyPaidData);
      setMoneyReceived(moneyReceivedData);
      setMoneyToBePaid(moneyToBePaidData);
      setMoneyToBeReceived(moneyToBeReceivedData);
      setMoneyPayable(moneyPayableData);

      // //console.log("Money To Be Paid: ", moneyToBePaid);
      // //console.log("Money To Be Paid: ", moneyToBePaid[0].ps);

      totalMoneyPaidUpdate(moneyPaidData);
      totalMoneyReceivedUpdate(moneyReceivedData);
      totalMoneyToBePaidUpdate(moneyToBePaidData);
      totalMoneyToBeReceivedUpdate(moneyToBeReceivedData);
      totalMoneyPayable(moneyPayableData);

      // //console.log("--> initialSelectedItems", initialSelectedItems);
    } catch (error) {
      console.error("Error fetching payment data:", error);
    }
    setShowSpinner(false);
  };

  const fetchTransactionsData = () => {
    // //console.log("In fetchTransactionsData");
    setShowSpinner(true);
    try {
      // const res = await axios.get(`${APIConfig.baseURL.dev}/cashflowTransactions/${getProfileId()}/payment`);

      // const data = res.data?.result;

      // const dataWithIndex = data?.map((item, index) => (
      //   {
      //     ...item,
      //     'index': index,
      //   }
      // ))

      const dataWithIndex = props.transactionsData;

      // //console.log("setting transactions data - ", dataWithIndex);
      setTransactionsData(dataWithIndex);
      const total = getTransactionsTotal(dataWithIndex);
      setTotalTransactions(total);

      const dataByProperty = groupDataByKey(dataWithIndex, "pur_property_id", false, false);
      const dataByOwner = groupDataByKey(dataWithIndex, "pur_receiver", true, false);
      const dataByRecipient = groupDataByKey(dataWithIndex, "pur_payer", false, true, getProfileId()) 
      //console.log("---dhyey--- successfully filter data - ", dataByProperty, dataByOwner, dataByRecipient);
      setTransactionDataByProeprty(dataByProperty);
      setTransactionDataByOwner(dataByOwner);
      setTransactionDataByRecipient(dataByRecipient);

      // totalMoneyPaidUpdate(moneyPaidData);
    } catch (error) {
      console.error("Error fetching transactions data:", error);
    }
    setShowSpinner(false);
  };

  const columnsList = [
    {
      field: "pur_payer",
      headerName: "Pur Payer",
      flex: 1.5,
      renderCell: (params) => <Box>{params.value}</Box>,
    },
    {
      field: "pur_receiver",
      headerName: "Pur Receiver",
      flex: 1.5,
      renderCell: (params) => <Box>{params.value}</Box>,
    },
    {
      field: "pur_group",
      headerName: "Pur Group",
      flex: 1.5,
      renderCell: (params) => <Box>{params.value}</Box>,
    },
    {
      field: "pur_property_id",
      headerName: "Property UID",
      flex: 1.5,
      renderCell: (params) => <Box>{params.value}</Box>,
    },
    {
      field: "property_address",
      headerName: "Address",
      flex: 1.5,
      renderCell: (params) => <Box>{params.value}</Box>,
    },
    {
      field: "property_unit",
      headerName: "Unit",
      flex: 0.5,
      renderCell: (params) => <Box>{params.value}</Box>,
    },
    {
      field: "pur_amount_due",
      headerName: "Expected",
      flex: 1.5,
      headerStyle: {
        fontWeight: "bold", // Apply inline style to the header cell
      },
      renderCell: (params) => (
        <Box
          sx={{
            fontWeight: "bold",
            width: "100%",
            textAlign: "right",
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
            color: params.row.pur_payer.startsWith("600") ? "red" : "green",
          }}
        >
          {params.row.pur_payer.startsWith("600") ? `${parseFloat(params.value).toFixed(2)}` : `(${parseFloat(params.value).toFixed(2)})`}
        </Box>
      ),
      headerAlign: "right",
    },
    {
      field: "total_paid",
      headerName: "Actual",
      flex: 1,
      headerStyle: {
        fontWeight: "bold", // Apply inline style to the header cell
      },
      renderCell: (params) => (
        <Box
          sx={{
            fontWeight: "bold",
            width: "100%",
            textAlign: "right",
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          {params.value ? `${parseFloat(params.value).toFixed(2)}` : "0"}
        </Box>
      ),
      headerAlign: "right",
    },
    {
      field: "amt_remaining",
      headerName: "Amt Remaining",
      flex: 1.5,
      headerStyle: {
        fontWeight: "bold", // Apply inline style to the header cell
      },
      renderCell: (params) => (
        <Box
          sx={{
            fontWeight: "bold",
            width: "100%",
            textAlign: "right",
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          {params.value ? `${parseFloat(params.value).toFixed(2)}` : "0"}
        </Box>
      ),
      headerAlign: "right",
    },
  ];

  // useEffect(() => {
  //   fetchPaymentsData();
  // }, []);

  useEffect(() => {
    fetchTransactionsData();
  }, []);

  useEffect(() => {
    fetchTransactionsData();
  }, [props.transactionsData]);

  const handlePaymentNotesChange = (event) => {
    setPaymentNotes(event.target.value);
  };

  // const API_CALL = "https://huo8rhh76i.execute-api.us-west-1.amazonaws.com/dev/api/v2/createEasyACHPaymentIntent";

  // const handleStripePayment = async (e) => {
  //   setShowSpinner(true);
  //   //console.log("Stripe Payment");
  //   try {
  //     // Update paymentData with the latest total value
  //     const updatedPaymentData = {
  //       ...paymentData,
  //       business_code: paymentNotes,
  //       payment_summary: {
  //         total: total.toFixed(2), // Format the total as a string with 2 decimal places
  //       },
  //     };

  //     //console.log("Updated Payment Data: ", updatedPaymentData);

  //     //const stripe = await stripePromise;
  //     const response = await fetch(API_CALL, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(updatedPaymentData),
  //     });
  //     const checkoutURL = await response.text();
  //     ////console.log(response.text());
  //     window.location.href = checkoutURL;
  //   } catch (error) {
  //     //console.log(error);
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

  return (
    <>
      <ThemeProvider theme={theme}>
        <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
          <CircularProgress color='inherit' />
        </Backdrop>

        <Container maxWidth='lg' sx={{ height: "90vh" }}>
          <Grid container spacing={6} sx={{ height: "90%" }}>
            <Grid container item xs={12} columnSpacing={6}>
              <Paper
                component={Stack}
                direction='column'
                justifyContent='center'
                style={{
                  justifyContent: "center",
                  width: "100%", // Take up full screen width
                  // marginTop: "20px", // Set the margin to 20px
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
                      //console.log("Navigate to Property or Tenant Profile");
                    }}
                  ></Box>
                  <Box
                    sx={{
                      fontSize: "11px",
                      fontWeight: "600",
                    }}
                  ></Box>
                </Box>

                {/* balance, payment button section */}
                <Paper
                  style={{
                    margin: "25px",
                    padding: "20px",
                    backgroundColor: theme.palette.primary.main,
                    // height: "25%",
                    [theme.breakpoints.down("sm")]: {
                      width: "80%",
                    },
                    [theme.breakpoints.up("sm")]: {
                      width: "50%",
                    },
                  }}
                >
                  <Stack direction='row' justifyContent='left' m={2}>
                    <Typography sx={{ color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}>
                      Balance
                    </Typography>
                  </Stack>

                  {/* button and balance value */}
                  <Stack direction='row' justifyContent='center' m={2}>
                    <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                      <Grid item xs={6}>
                        <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight, fontSize: "26px" }}>
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
                            "&:hover": {
                              backgroundColor: "#2A488A",
                              color: "#FFD700",
                            },
                          }}
                          onClick={() => {
                            // paymentData.business_code = paymentNotes;
                            const updatedPaymentData = { ...paymentData, business_code: paymentNotes };
                            // //console.log("In Payments.jsx and passing paymentData to SelectPayment.jsx: ", paymentData);
                            // //console.log("In Payments.jsx and passing paymentMethodInfo to SelectPayment.jsx: ", paymentMethodInfo);
                            // //console.log("cashflow - ", selectedItems);
                            // if(page != null && page === "paymentProcessing"){
                            //   setSelectedPayment({ paymentData: updatedPaymentData, total: total, selectedItems: selectedItems, paymentMethodInfo: paymentMethodInfo });
                            //   setCurrentWindow("MAKE_PAYMENT");
                            // }
                            // else {

                            navigate("/selectPayment", {
                              state: {
                                paymentData: updatedPaymentData,
                                total: total,
                                cashFlowTotal: cashFlowTotal,
                                selectedItems: selectedItems,
                                paymentMethodInfo: paymentMethodInfo,
                                managerCashflowWidgetData: managerCashflowWidgetData,
                                accountBalanceWidgetData: accountBalanceWidgetData,
                                receiverId: selectedItems[0]?.pur_payer === getProfileId() ? selectedItems[0]?.pur_receiver : selectedItems[0]?.pur_payer
                              },
                            });
                          }}
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
                  
                  {/* payment notes */}
                  <Stack
                    direction='row'
                    justifyContent='center'
                    m={2}
                    sx={{
                      paddingTop: "25px",
                      paddingBottom: "15px",
                    }}
                  >
                    <TextField variant='filled' fullWidth={true} multiline={true} value={paymentNotes} onChange={handlePaymentNotesChange} label='Payment Notes' InputLabelProps={{
                        sx: {
                          '&.Mui-focused': {
                            color: '#160449', // Label color when focused
                          },
                        },
                      }} 
                    />
                  </Stack>
                  
                  {/* SELECTED PAYMENT GRID */}
                  <Stack direction='row' justifyContent='center' m={2}>
                    <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                      <Grid item xs={12}>
                        <Typography sx={{ color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}>
                          Selected Payment
                        </Typography>
                      </Grid>
                      <Grid item xs={12} marginTop={"10px"}>
                        <DataGrid
                          rows={selectedItems}
                          columns={columnsList}
                          initialState={{
                            pagination: {
                              paginationModel: {
                                pageSize: 5,
                              },
                              sorting: {
                                sortModel: [
                                  { field: "pur_group", sort: "asc" },
                                  { field: "pur_payer", sort: "asc" },
                                ],
                              },
                            },
                          }}
                          sx={{
                            minHeight: "170px",
                            '& .MuiDataGrid-root': {
                                boxShadow: 'none',
                            },
                            '& .MuiDataGrid-cell': {
                                color: '#160449', 
                                borderBottom: 'none',                                       
                            },                                    
                            '& .MuiDataGrid-columnHeaderTitle': {
                                lineHeight: 'normal',
                                fontWeight: 'bold',
                                color: '#160449',
                            },
                          }}
                          getRowId={(row) => row.index}
                          pageSizeOptions={(() => {
                            const baseOptions = [5, 7, 10];
                            const allRowsOption = selectedItems.length;
                            const uniqueOptions = Array.from(new Set([...baseOptions, allRowsOption]));
                            return uniqueOptions.sort((a, b) => a - b);
                          })()} 
                        />
                      </Grid>
                    </Grid>
                  </Stack>

                </Paper>

                {/* What is shown in Balance Details Depends on Role */}
                {customer_role === "350" ? (
                  <Paper
                    style={{
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
                  // <Paper
                  //   style={{
                  //     margin: "25px",
                  //     padding: 20,
                  //     backgroundColor: theme.palette.primary.main,
                  //     // height: "25%",
                  //   }}
                  // >
                  //   <Stack direction='row' justifyContent='space-between'>
                  //     <Typography sx={{ color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}>
                  //       Balance Details - Money Payable
                  //     </Typography>
                  //     <Typography
                  //       sx={{ marginLeft: "20px", color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}
                  //     >
                  //       ${totalPayable.toFixed(2)}
                  //     </Typography>
                  //   </Stack>

                  //   <Stack>
                  //     <BalanceDetailsTable data={moneyPayable} total={total} setTotal={setTotal} setPaymentData={setPaymentData} setSelectedItems={setSelectedItems} />
                  //   </Stack>
                  // </Paper>
                  <Paper
                    style={{
                      margin: "25px",
                      padding: 20,
                      backgroundColor: theme.palette.primary.main,
                      // height: "25%",
                    }}
                  >
                    {/* transaction and filter button */}
                    <Stack direction='row' justifyContent='space-between'>
                      <Typography sx={{ color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}>
                        Transactions
                      </Typography>
                      <Button
                        sx={{
                          width: "150px",
                          backgroundColor: tab === "by_property" ? "#3D5CAC" : "#9EAED6",
                          textTransform: "none",
                          "&:hover": {
                            backgroundColor: tab === "by_property" ? "#3D5CAC" : "#9EAED6",
                          },
                        }}
                        onClick={() => {
                          setSortBy("by_property");
                          setTab("by_property");
                        }}
                      >
                        <Typography sx={{ fontSize: "12px", fontWeight: "bold", color: "#160449" }}>By Property</Typography>
                      </Button>
                      <Button
                        sx={{
                          width: "150px",
                          backgroundColor: tab === "by_owner" ? "#3D5CAC" : "#9EAED6",
                          textTransform: "none",
                          "&:hover": {
                            backgroundColor: tab === "by_owner" ? "#3D5CAC" : "#9EAED6",
                          },
                        }}
                        onClick={() => {
                          setSortBy("by_owner");
                          setTab("by_owner");
                        }}
                      >
                        <Typography sx={{ fontSize: "12px", fontWeight: "bold", color: "#160449" }}>By Owner</Typography>
                      </Button>
                      <Button
                        sx={{
                          width: "150px",
                          backgroundColor: tab === "by_recipient" ? "#3D5CAC" : "#9EAED6",
                          textTransform: "none",
                          "&:hover": {
                            backgroundColor: tab === "by_recipient" ? "#3D5CAC" : "#9EAED6",
                          },
                        }}
                        onClick={() => {
                          setSortBy("by_recipient");
                          setTab("by_recipient");
                        }}
                      >
                        <Typography sx={{ fontSize: "12px", fontWeight: "bold", color: "#160449" }}>By Recipient</Typography>
                      </Button>

                      <Typography
                        sx={{ marginLeft: "20px", color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}
                      >
                        ${totalTransactions.toFixed(2)}
                      </Typography>
                    </Stack>

                    <Stack>
                      {tab === "by_property" &&
                        Object.values(transactionDataByProeprty)?.map((propertyPayments) => (
                          <>
                            <br />
                            <Grid item xs={12} marginBottom={10}>
                              <Typography sx={{ fontWeight: "bold", color: "#160449" }}>Property: {propertyPayments[0].property_address} ({propertyPayments[0].pur_property_id})</Typography>
                            </Grid>
                            <TransactionsTable
                              data={propertyPayments}
                              profileId={getProfileId()}
                              selectedItems={selectedItems}
                              isDeselecting={isDeselecting}
                              setIsDeselecting={setIsDeselecting}
                              cashFlowTotal={globalCashFlowTotal[propertyPayments[0].pur_property_id]}
                              setCashFlowTotal={(newTotal) => handleTotalCashFlowChange(propertyPayments[0].pur_property_id, newTotal)}
                              total={globalTotal[propertyPayments[0].pur_property_id]}
                              setTotal={(newTotal) => handleTotalChange(propertyPayments[0].pur_property_id, newTotal)}
                              setPaymentData={(newTotal, purchase_ids) => handlePaymentDataChange(propertyPayments[0].pur_property_id, newTotal, purchase_ids)}
                              setSelectedItems={setSelectedItems}
                              selectedRowsForTransaction={selectedRowsForTransaction}
                            />
                            <br />
                          </>
                        ))}
                      {/* {tab === "by_owner" && (
                        Object.keys(transactionDataByOwner)?.map((ownerID, index) => (
                          <>
                              <br />
                              <Grid item xs={12} marginBottom={10}>
                                  <Typography sx={{fontWeight: 'bold', color: "#160449"}}>
                                      Owner ID: {ownerID}
                                  </Typography>
                              </Grid>
                              <TransactionsTable data={transactionDataByOwner[ownerID]} total={total} setTotal={setTotal} setPaymentData={setPaymentData} setSelectedItems={setSelectedItems} />
                              <br />
                          </>
                        ))
                      )} */}
                      {tab === "by_owner" &&
                        Object.keys(transactionDataByOwner)?.map((ownerID, index) => (
                          <React.Fragment key={ownerID}>
                            <br />
                            <Grid item xs={12} marginBottom={10}>
                              <Typography sx={{ fontWeight: "bold", color: "#160449" }}>Owner ID: {ownerID}</Typography>
                            </Grid>

                            {Object.keys(transactionDataByOwner[ownerID])?.map((propertyID) => (
                              <Accordion
                                sx={{
                                  backgroundColor: theme.palette.primary.main,
                                  boxShadow: "none",
                                  marginY: "10px",
                                }}
                                key={propertyID}
                              >
                                <Grid container justifyContent='flex-start' item xs={8}>
                                  <Grid container direction='row' alignContent='center' sx={{ height: "35px" }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`panel-${propertyID}-content`} id={`panel-${propertyID}-header`}>
                                      <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight }}>
                                        Property: {transactionDataByOwner[ownerID][propertyID][0].property_address} ({transactionDataByOwner[ownerID][propertyID][0].pur_property_id})
                                      </Typography>
                                    </AccordionSummary>
                                  </Grid>
                                </Grid>

                                <AccordionDetails>
                                  <TransactionsTable
                                    data={transactionDataByOwner[ownerID][propertyID]}
                                    profileId={getProfileId()}
                                    isDeselecting={isDeselecting}
                                    setIsDeselecting={setIsDeselecting}
                                    cashFlowTotal={globalCashFlowTotal[transactionDataByOwner[ownerID][propertyID][0].pur_property_id]}
                                    setCashFlowTotal={(newTotal) => handleTotalCashFlowChange(transactionDataByOwner[ownerID][propertyID][0].pur_property_id, newTotal)}
                                    total={globalTotal[transactionDataByOwner[ownerID][propertyID][0].pur_property_id]}
                                    setTotal={(newTotal) => handleTotalChange(transactionDataByOwner[ownerID][propertyID][0].pur_property_id, newTotal)}
                                    setPaymentData={(newTotal, purchase_ids) =>
                                      handlePaymentDataChange(transactionDataByOwner[ownerID][propertyID][0].pur_property_id, newTotal, purchase_ids)
                                    }
                                    setSelectedItems={setSelectedItems}
                                    selectedItems={selectedItems}
                                    selectedRowsForTransaction={selectedRowsForTransaction}
                                  />
                                </AccordionDetails>
                              </Accordion>
                            ))}

                            <br />
                          </React.Fragment>
                        ))}

                      {tab === "by_recipient" &&
                        Object.keys(transactionDataByRecipient)?.map((recpId, index) => (
                          <React.Fragment key={recpId}>
                            <br />
                            <Grid item xs={12} marginBottom={10}>
                              <Typography sx={{ fontWeight: "bold", color: "#160449" }}>Recipient ID: {recpId}</Typography>
                            </Grid>

                            {Object.keys(transactionDataByRecipient[recpId])?.map((propertyID) => (
                              <Accordion
                                sx={{
                                  backgroundColor: theme.palette.primary.main,
                                  boxShadow: "none",
                                  marginY: "10px",
                                }}
                                key={propertyID}
                              >
                                <Grid container justifyContent='flex-start' item xs={8}>
                                  <Grid container direction='row' alignContent='center' sx={{ height: "35px" }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`panel-${propertyID}-content`} id={`panel-${propertyID}-header`}>
                                      <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight }}>
                                        Property: {transactionDataByRecipient[recpId][propertyID][0].property_address} ({transactionDataByRecipient[recpId][propertyID][0].pur_property_id})
                                      </Typography>
                                    </AccordionSummary>
                                  </Grid>
                                </Grid>

                                <AccordionDetails>
                                  <TransactionsTableForRecipient
                                    data={transactionDataByRecipient[recpId][propertyID]}
                                    profileId={getProfileId()}
                                    recpId={recpId}
                                    isDeselecting={isDeselecting}
                                    setIsDeselecting={setIsDeselecting}
                                    cashFlowTotal={globalCashFlowTotal[transactionDataByRecipient[recpId][propertyID][0].pur_property_id]}
                                    setCashFlowTotal={(newTotal) => handleTotalCashFlowChange(transactionDataByRecipient[recpId][propertyID][0].pur_property_id, newTotal)}
                                    total={globalTotal[transactionDataByRecipient[recpId][propertyID][0].pur_property_id]}
                                    setTotal={(newTotal) => handleTotalChange(transactionDataByRecipient[recpId][propertyID][0].pur_property_id, newTotal)}
                                    setPaymentData={(newTotal, purchase_ids) =>
                                      handlePaymentDataChange(transactionDataByRecipient[recpId][propertyID][0].pur_property_id, newTotal, purchase_ids)
                                    }
                                    setSelectedItems={setSelectedItems}
                                    selectedItems={selectedItems}
                                    selectedRowsForTransaction={selectedRowsForTransaction}
                                  />
                                </AccordionDetails>
                              </Accordion>
                            ))}

                            <br />
                          </React.Fragment>
                        ))}
                    </Stack>
                  </Paper>
                )}

                {/* Conditional rendering for Money To Be Paid section */}
                {/* {customer_role !== "350" && (
                  <Paper
                    style={{
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
                )} */}

                {/* All Roles show Money Paid */}
                {/* <Paper
                  style={{
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
                </Paper> */}

                {/* Conditional rendering for Money Received section */}
                {/* {paymentData.customer_uid.substring(0, 3) !== "350" && (
                  <Paper
                    style={{
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
                )} */}

                {/* Conditional rendering for Money To Be Received section */}
                {/* {paymentData.customer_uid.substring(0, 3) !== "350" && (
                  <Paper
                    style={{
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
                )} */}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </ThemeProvider>
    </>
  );
}

function TransactionsTable(props) {
  // //console.log("In BalanceDetailTable", props);
  const [data, setData] = useState([]);
  const currentUserId = props?.profileId;
  const [filteredData, setFilteredData] = useState([])
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [paymentDueResult, setPaymentDueResult] = useState([]);
  const [paymentDueResultMap, setPaymentDueResultMap] = useState([]); // index to row mapping for quick lookup.

  const [sortModel, setSortModel] = useState([
    { field: "pur_group", sort: "asc" },
    { field: "pur_payer", sort: "asc" },
  ]);

  const filterTransactions = (data) => {
    const verifiedPurGroups = [];

    data.forEach((transaction) => {
      if (!verifiedPurGroups.includes(transaction.pur_group) && transaction.verified && transaction.verified.toLowerCase() === "verified") {
        verifiedPurGroups.push(transaction.pur_group);
      }
    });

    // //console.log("ROHIT - 631 - verifiedPurGroups - ", verifiedPurGroups);

    const newData = data.reduce((acc, item) => {
      if (!acc[item.pur_group]) {
        acc[item.pur_group] = [];
      }
      acc[item.pur_group].push(item);
      return acc;
    }, {});

    //console.log(" === according to pur group == ", newData)

    const filteredValues = Object.keys(newData).reduce((acc, key) => {
      const hasNon350Payer = newData[key].every((item) => !item.pur_payer.startsWith("350"));

      if (hasNon350Payer) {
        acc.push(...newData[key]); // Push the values instead of key-value pairs
      }

      return acc;
    }, []);

    filteredValues.forEach((transaction) => {
      if (transaction.pur_payer.startsWith("110") && !verifiedPurGroups.includes(transaction.pur_group) && transaction.payment_status?.toLowerCase() === "unpaid") {
        verifiedPurGroups.push(transaction.pur_group);
      }
    });

    // //console.log(" == debug == data ", data, verifiedPurGroups)

    return (
      data
        // .filter(item => (item.verified && item.verified.toLowerCase() === "verified"));
        .filter((item) => verifiedPurGroups.includes(item.pur_group))
        .filter((item) => item.pur_payer.startsWith("600") || item.pur_payer.startsWith("110"))
        .filter((item) => {
          const total_paid = parseFloat(item.total_paid ? item.total_paid : "0");
          const pur_amount_due = parseFloat(item.pur_amount_due ? item.pur_amount_due : "0");

          return total_paid !== pur_amount_due;
        })
    );
  };

  useEffect(() => {
    setData(props.data);
  }, [props.data]);

  // useEffect(() => {
  //   // //console.log("ROHIT - selectedRows - ", selectedRows);
  // }, [selectedRows]);

  useEffect(() => {
    if (data && data.length > 0) {
      // //console.log("ROHIT - 814 - without filteredData - ", data, " for property - ", data[0].pur_property_id);
      const filteredData = filterTransactions(data);

      setFilteredData(filteredData)
      // setSelectedRows(filteredData.map((row) => row.index));
      // setSelectedRows([]);
      // if (props.selectedRowsForTransaction && props.selectedRowsForTransaction !== "" && props.selectedRowsForTransaction?.length > 0) {
      //   // const filtereRow = filteredData.filter((row) => props.selectedRowsForTransaction.includes(row.pur_group)).map((row) => row.index);
      //   const givenIds = props.selectedRowsForTransaction;

      //   const preselectedRows = filteredData.filter((row) => {
      //     const uniqueIds = new Set([ row.pur_payer, row.pur_receiver, ...givenIds, currentUserId]);
      //     return uniqueIds.size === 2; // Allow only rows with exactly two unique IDs
      //   });

      //   setSelectedRows(preselectedRows.map((row) => row.index));
      //   // setSelectedRows((prevSelectedRows) => {
      //   //   const combinedRows = [...prevSelectedRows, ...filtereRow];
      //   //   // Remove duplicates if needed
      //   //   //console.log("previous row - ", prevSelectedRows)
      //   //   return Array.from(new Set(combinedRows));
      //   // });

      //   props.setSelectedItems((prevState) => {
      //     const addedItems = preselectedRows.map((row) => ({
      //       index: row.index,
      //       ...row,
      //     }));
    
      //     // Merge preselected rows with the global state
      //     const updatedState = [...prevState, ...addedItems];
      //     return Array.from(new Set(updatedState.map((item) => item.index))).map((index) =>
      //       updatedState.find((item) => item.index === index)
      //     );
      //   });

      //   // //console.log("after set selected rows inside data useeffect - ", selectedRows);
      // } else {

      //   setSelectedRows([]);
      // }

      // Determine rows to preselect from props.selectedRowsForTransaction
      let preselectedRows = [];
      if (props.selectedRowsForTransaction && props.selectedRowsForTransaction.length > 0) {
        const givenIds = props.selectedRowsForTransaction;

        preselectedRows = filteredData.filter((row) => {
          const uniqueIds = new Set([row.pur_payer, row.pur_receiver, ...givenIds, currentUserId]);
          return uniqueIds.size === 2; // Allow only rows with exactly two unique IDs
        });

      }

      const representativeItem = props.selectedItems?.[0] || null;

      // Include rows related to the selectedItems
      let relatedRowsFromSelectedItems = [];
      if (representativeItem) {
        relatedRowsFromSelectedItems = filteredData.filter((row) => {
          const uniqueIds = new Set([row.pur_payer, row.pur_receiver, representativeItem.pur_payer, representativeItem.pur_receiver]);
          return uniqueIds.size === 2;
        });
      }

      // Combine preselected rows and relatedrows to the selecteditems
      const allPreselectedRows = [...preselectedRows, ...relatedRowsFromSelectedItems];

      // Deduplicate rows
      const uniquePreselectedRows = Array.from(new Set(allPreselectedRows.map((row) => row.index)))
        .map((index) => allPreselectedRows.find((row) => row.index === index));

      // Update selected rows locally
      setSelectedRows(uniquePreselectedRows.map((row) => row.index));

      props.setSelectedItems((prevState) => {
        const addedItems = uniquePreselectedRows.map((row) => ({
          index: row.index,
          ...row,
        }));

        // Merge with previous state and deduplicate
        const updatedState = [...prevState, ...addedItems];
        return Array.from(new Set(updatedState.map((item) => item.index))).map((index) =>
          updatedState.find((item) => item.index === index)
        );
      });

      setPaymentDueResult(
        filteredData.map((item) => ({
          ...item,
          pur_amount_due: parseFloat(item.pur_amount_due),
        }))
      );
    }
  }, [data]);

  useEffect(()=>{
    if(props.isDeselecting){
      return;
    }

    const representativeItem = props.selectedItems?.[0] || null;

      // Include rows related to the selectedItems
      let relatedRowsFromSelectedItems = [];
      if (representativeItem) {
        relatedRowsFromSelectedItems = filteredData.filter((row) => {
          const uniqueIds = new Set([row.pur_payer, row.pur_receiver, representativeItem.pur_payer, representativeItem.pur_receiver]);
          return uniqueIds.size === 2;
        });
      }

      // Combine preselected rows and relatedrows to the selecteditems
      const allPreselectedRows = [...relatedRowsFromSelectedItems];

      // Deduplicate rows
      const uniquePreselectedRows = Array.from(new Set(allPreselectedRows.map((row) => row.index)))
        .map((index) => allPreselectedRows.find((row) => row.index === index));

      // Update selected rows locally
      setSelectedRows(uniquePreselectedRows.map((row) => row.index));

      props.setSelectedItems((prevState) => {
        const addedItems = uniquePreselectedRows.map((row) => ({
          index: row.index,
          ...row,
        }));

        // Merge with previous state and deduplicate
        const updatedState = [...prevState, ...addedItems];
        const deduplicatedState =  Array.from(new Set(updatedState.map((item) => item.index))).map((index) =>
          updatedState.find((item) => item.index === index)
        );

        if (JSON.stringify(deduplicatedState) !== JSON.stringify(prevState)) {
          return deduplicatedState;
        }
        return prevState;

      });

  },[props.selectedItems])

  useEffect(() => {
    var total = 0;
    var cashflow = 0;

    let purchase_uid_mapping = [];

    for (const item of selectedRows) {
      let paymentItemData = paymentDueResult.find((element) => element.index === item);
      // //console.log("ROHIT - 687 - paymentItemData - ", paymentItemData);
      // const purchaseIDs = paymentItemData.purchase_uid;

      // JSON.parse(paymentItemData?.transactions).forEach(element => {
      //   if(purchaseIDs.includes(element.purchase_uid)){
      //     purchase_uid_mapping.push({ purchase_uid: element.purchase_uid, pur_amount_due: element.pur_amount_due.toFixed(2) });
      //   }
      // });
      const purchaseIDs = paymentItemData.purchase_uid;
      purchase_uid_mapping.push({ purchase_uid: purchaseIDs, pur_amount_due: paymentItemData.pur_amount_due.toFixed(2) });

      // purchaseIDs.forEach( purID => {
      // });

      //console.log("payment item data", paymentItemData);

      cashflow += parseFloat(paymentItemData.amt_remaining);
      // Adjust total based on pur_cf_type
      if (paymentItemData.pur_payer.startsWith("110")) {
        total -= parseFloat(paymentItemData.amt_remaining);
      } else if (paymentItemData.pur_payer.startsWith("600")) {
        total += parseFloat(paymentItemData.amt_remaining);
      }

      // total += parseFloat(paymentItemData.pur_amount_due)
    }
    //console.log("selectedRows useEffect - total - ", total);
    //console.log("selectedRows useEffect - cashFlow total - ", cashflow);
    //console.log("selectedRows useEffect - purchase_uid_mapping - ", purchase_uid_mapping);

    props.setTotal(total);
    props.setCashFlowTotal(cashflow);
    props.setPaymentData(total.toFixed(2), purchase_uid_mapping);
  }, [selectedRows]);

  // useEffect(() => {
  //   //console.log("selectedPayments - ", selectedPayments);
  //   props.setSelectedItems(selectedPayments);
  // }, [selectedPayments]);

  useEffect(() => {
    const map = paymentDueResult.reduce((acc, row) => {
      acc[row.index] = row;
      return acc;
    }, {});
    setPaymentDueResultMap(map);
  }, [paymentDueResult]);

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
      field: "pur_payer",
      headerName: "Pur Payer",
      flex: 1.5,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },
    {
      field: "pur_receiver",
      headerName: "Pur Receiver",
      flex: 1.5,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },
    {
      field: "pur_group",
      headerName: "Pur Group",
      flex: 1.5,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },
    {
      field: "pur_property_id",
      headerName: "Property UID",
      flex: 1.5,
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
    // {
    //   field: "property_owner_id",
    //   headerName: "Owner UID",
    //   flex: 1,
    //   renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    // },
    {
      field: "pur_amount_due",
      headerName: "Expected",
      flex: 1.3,
      headerStyle: {
        fontWeight: "bold", // Apply inline style to the header cell
      },
      renderCell: (params) => (
        <Box
          sx={{
            fontWeight: "bold",
            width: "100%",
            display: "flex",
            textAlign: "right",
            flexDirection: "row",
            justifyContent: "flex-end",
            color: params.row.pur_payer.startsWith("600") ? "red" : "green",
          }}
        >
          {params.row.pur_payer.startsWith("600") ? `${parseFloat(params.value).toFixed(2)}` : `(${parseFloat(params.value).toFixed(2)})`}
        </Box>
      ),
      headerAlign: "right",
    },
    {
      field: "total_paid",
      headerName: "Actual",
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
            textAlign: "right",
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          {params.value ? `${parseFloat(params.value).toFixed(2)}` : "0"}
        </Box>
      ),
      headerAlign: "right",
    },
    {
      field: "amt_remaining",
      headerName: "Amt Remaining",
      flex: 1.5,
      headerStyle: {
        fontWeight: "bold", // Apply inline style to the header cell
      },
      renderCell: (params) => (
        <Box
          sx={{
            fontWeight: "bold",
            width: "100%",
            textAlign: "right",
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          {params.value ? `${parseFloat(params.value).toFixed(2)}` : "0"}
        </Box>
      ),
      headerAlign: "right",
    },
  ];

  const handleSelectionModelChange = (newRowSelectionModel) => {
    props.setIsDeselecting(false)

    const addedRows = newRowSelectionModel.filter((rowId) => !selectedRows.includes(rowId));
    const removedRows = selectedRows.filter((rowId) => !newRowSelectionModel.includes(rowId));

    let updatedRowSelectionModel = [...newRowSelectionModel];

    if (addedRows.length > 0) {
      // //console.log("Added rows: ", addedRows);
      let newPayments = [];

      addedRows.forEach((item, index) => {
        // const addedPayment = paymentDueResult.find((row) => row.purchase_uid === addedRows[index]);
        const addedPayment = paymentDueResult.find((row) => row.index === item);

        if (addedPayment) {
          // const relatedPayments = paymentDueResult.filter((row) => row.pur_group === addedPayment.pur_group);

          const relatedPayments = paymentDueResult.filter((row) => {
            const uniqueIds = new Set([row.pur_payer, row.pur_receiver, addedPayment.pur_payer, addedPayment.pur_receiver]);
            return uniqueIds.size === 2; 
          });



        //     newPayments = [...newPayments, ...relatedPayments];
        //     const relatedRowIds = relatedPayments.map((payment) => payment.index);
        //     updatedRowSelectionModel = [...new Set([...updatedRowSelectionModel, ...relatedRowIds])];
        //   }
        // });

          if (relatedPayments.length > 0) {
            // Remove previously selected rows

            // updatedRowSelectionModel = relatedPayments.map((payment) => payment.index);
            const relatedRowIds = relatedPayments.map((payment) => payment.index);
            const deselectedRowIds = selectedRows.filter((rowId) => !relatedRowIds.includes(rowId));

            // props.setSelectedItems((prevState) =>
            //   prevState.filter((item) => !deselectedRowIds.includes(item.index))
            // );
            
            // if(props.selectedItems.length > 0){
            //   props.setIsDeselecting(true)
            // }

            props.setSelectedItems([])

            updatedRowSelectionModel = relatedRowIds;

            newPayments = [...relatedPayments];
          }
        }
      });

      // //console.log("newPayments - ", newPayments);
      // setSelectedPayments((prevState) => {
      //   return [...prevState, ...newPayments];
      // });
      
      setSelectedPayments(newPayments);

      props.setSelectedItems((prevState) => {
        const addedItems = newPayments.map((payment) => ({
          index: payment.index,
          ...payment,
        }));
  
        // Merge added items with existing global state, ensuring no duplicates
        const updatedState = [...prevState, ...addedItems];
        return Array.from(new Set(updatedState.map((item) => item.index))).map((index) =>
          updatedState.find((item) => item.index === index)
        );
      });
    }

    if (removedRows.length > 0) {
      props.setIsDeselecting(true)
      // //console.log("Removed rows: ", removedRows);
      let removedPayments = [];
      let relatedRows = [];

      removedRows.forEach((item, index) => {
        let removedPayment = paymentDueResult.find((row) => row.index === item);

        // we don't want to deselect all rows which are related to purchase_group because for maintenance 
        // let relatedPayments = [];

        // if (removedPayment) {
        //   relatedPayments = paymentDueResult.filter((row) => row.pur_group === removedPayment.pur_group);
        //   relatedRows = relatedPayments.map((payment) => payment.index);
        // }

        removedPayments.push(removedPayment);
        // removedPayments.push(relatedPayments);
      });
      // //console.log("removedPayments - ", removedPayments);
      const allRowRemove = [...new Set([...removedRows, ...relatedRows])];

      updatedRowSelectionModel = updatedRowSelectionModel.filter((payment) => !allRowRemove.includes(payment));
      setSelectedPayments((prevState) => prevState.filter((payment) => !allRowRemove.includes(payment.index)));

      props.setSelectedItems((prevState) =>
        prevState.filter((item) => !allRowRemove.includes(item.index))
      );
    }
    
    // setSelectedRows(newRowSelectionModel);
    setSelectedRows(updatedRowSelectionModel);
  };

  if (paymentDueResult.length > 0) {
    // //console.log("Passed Data ", paymentDueResult);
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
              sorting: {
                sortModel: [
                  { field: "pur_group", sort: "asc" },
                  { field: "pur_payer", sort: "asc" },
                ],
              },
            },
          }}
          // getRowId={(row) => row.purchase_uid}
          getRowId={(row) => row.index}
          pageSizeOptions={[10, 50, 100]}
          checkboxSelection
          // disableRowSelectionOnClick
          rowSelectionModel={selectedRows}
          onRowSelectionModelChange={handleSelectionModelChange}
          sortModel={sortModel}
          onSortModelChange={(newSortModel) => setSortModel(newSortModel)}
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
              ${" "}
              {selectedRows
                .reduce((total, selectedIndex) => {
                  // const payment = paymentDueResult.find((row) => row.index === selectedIndex);
                  const payment = paymentDueResultMap[selectedIndex];
                  if (payment) {
                    const amountDue = parseFloat(payment?.amt_remaining);
                    // const isExpense = payment.pur_cf_type === "expense";

                    // Adjust the total based on whether the payment is an expense or revenue
                    // return total + (isExpense ? -amountDue : amountDue);

                    if (payment.pur_payer.startsWith("110")) {
                      return total - amountDue;
                    } else if (payment.pur_payer.startsWith("600")) {
                      return total + amountDue;
                    }
                    // return total + 0;
                  }
                  return total + 0;
                }, 0)
                ?.toFixed(2)}
            </Typography>
          </Grid>
        </Grid>
      </>
    );
  } else {
    return (
      <>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "7px",
            width: "100%",
            height: "70px",
          }}
        >
          <Typography
            sx={{
              color: "#A9A9A9",
              fontWeight: theme.typography.primary.fontWeight,
              fontSize: "15px",
            }}
          >
            No Transactions
          </Typography>
        </Box>
      </>
    );
  }
}

function TransactionsTableForRecipient(props) {
  // //console.log("In BalanceDetailTable", props);
  const [data, setData] = useState([]);
  const currentUserId = props?.profileId;
  const [filteredData, setFilteredData] = useState([])
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [paymentDueResult, setPaymentDueResult] = useState([]);
  const [paymentDueResultMap, setPaymentDueResultMap] = useState([]); // index to row mapping for quick lookup.

  const [sortModel, setSortModel] = useState([
    { field: "pur_group", sort: "asc" },
    { field: "pur_payer", sort: "asc" },
  ]);

  const filterTransactions = (data) => {
    const verifiedPurGroups = [];

    data.forEach((transaction) => {
      if (!verifiedPurGroups.includes(transaction.pur_group) && transaction.verified && transaction.verified.toLowerCase() === "verified") {
        verifiedPurGroups.push(transaction.pur_group);
      }
    });

    // //console.log("ROHIT - 631 - verifiedPurGroups - ", verifiedPurGroups);

    const newData = data.reduce((acc, item) => {
      if (!acc[item.pur_group]) {
        acc[item.pur_group] = [];
      }
      acc[item.pur_group].push(item);
      return acc;
    }, {});

    const filteredValues = Object.keys(newData).reduce((acc, key) => {
      const hasNon350Payer = newData[key].every((item) => !item.pur_payer.startsWith("350"));

      if (hasNon350Payer) {
        acc.push(...newData[key]); // Push the values instead of key-value pairs
      }

      return acc;
    }, []);

    filteredValues.forEach((transaction) => {
      if ((transaction.pur_payer === props.recpId || transaction.pur_receiver === props.recpId) && !verifiedPurGroups.includes(transaction.pur_group) && transaction.payment_status?.toLowerCase() === "unpaid") {
        verifiedPurGroups.push(transaction.pur_group);
      }
    });

    return (
      data
        // .filter(item => (item.verified && item.verified.toLowerCase() === "verified"));
        .filter((item) => verifiedPurGroups.includes(item.pur_group))
        .filter((item) => item.pur_payer === props.recpId || item.pur_receiver === props.recpId)
        .filter((item) => {
          const total_paid = parseFloat(item.total_paid ? item.total_paid : "0");
          const pur_amount_due = parseFloat(item.pur_amount_due ? item.pur_amount_due : "0");

          return total_paid !== pur_amount_due;
        })
    );
  };

  useEffect(() => {
    setData(props.data);
  }, [props.data]);

  // useEffect(() => {
  //   // //console.log("ROHIT - selectedRows - ", selectedRows);
  // }, [selectedRows]);

  useEffect(() => {
    if (data && data.length > 0) {
      // //console.log("ROHIT - 814 - without filteredData - ", data, " for property - ", data[0].pur_property_id);
      const filteredData = filterTransactions(data);

      setFilteredData(filteredData)
      // setSelectedRows(filteredData.map((row) => row.index));
      // setSelectedRows([]);
      // if (props.selectedRowsForTransaction && props.selectedRowsForTransaction !== "" && props.selectedRowsForTransaction?.length > 0) {
      //   // const filtereRow = filteredData.filter((row) => props.selectedRowsForTransaction.includes(row.pur_group)).map((row) => row.index);
      //   const givenIds = props.selectedRowsForTransaction;

      //   const preselectedRows = filteredData.filter((row) => {
      //     const uniqueIds = new Set([ row.pur_payer, row.pur_receiver, ...givenIds, currentUserId]);
      //     return uniqueIds.size === 2; // Allow only rows with exactly two unique IDs
      //   });

      //   setSelectedRows(preselectedRows.map((row) => row.index));
      //   // setSelectedRows((prevSelectedRows) => {
      //   //   const combinedRows = [...prevSelectedRows, ...filtereRow];
      //   //   // Remove duplicates if needed
      //   //   //console.log("previous row - ", prevSelectedRows)
      //   //   return Array.from(new Set(combinedRows));
      //   // });

      //   props.setSelectedItems((prevState) => {
      //     const addedItems = preselectedRows.map((row) => ({
      //       index: row.index,
      //       ...row,
      //     }));
    
      //     // Merge preselected rows with the global state
      //     const updatedState = [...prevState, ...addedItems];
      //     return Array.from(new Set(updatedState.map((item) => item.index))).map((index) =>
      //       updatedState.find((item) => item.index === index)
      //     );
      //   });

      //   // //console.log("after set selected rows inside data useeffect - ", selectedRows);
      // } else {

      //   setSelectedRows([]);
      // }

      // Determine rows to preselect from props.selectedRowsForTransaction
      let preselectedRows = [];
      if (props.selectedRowsForTransaction && props.selectedRowsForTransaction.length > 0) {
        const givenIds = props.selectedRowsForTransaction;

        preselectedRows = filteredData.filter((row) => {
          const uniqueIds = new Set([row.pur_payer, row.pur_receiver, ...givenIds, currentUserId]);
          return uniqueIds.size === 2; // Allow only rows with exactly two unique IDs
        });

      }

      const representativeItem = props.selectedItems?.[0] || null;

      // Include rows related to the selectedItems
      let relatedRowsFromSelectedItems = [];
      if (representativeItem) {
        relatedRowsFromSelectedItems = filteredData.filter((row) => {
          const uniqueIds = new Set([row.pur_payer, row.pur_receiver, representativeItem.pur_payer, representativeItem.pur_receiver]);
          return uniqueIds.size === 2;
        });
      }

      // Combine preselected rows and relatedrows to the selecteditems
      const allPreselectedRows = [...preselectedRows, ...relatedRowsFromSelectedItems];

      // Deduplicate rows
      const uniquePreselectedRows = Array.from(new Set(allPreselectedRows.map((row) => row.index)))
        .map((index) => allPreselectedRows.find((row) => row.index === index));

      // Update selected rows locally
      setSelectedRows(uniquePreselectedRows.map((row) => row.index));

      props.setSelectedItems((prevState) => {
        const addedItems = uniquePreselectedRows.map((row) => ({
          index: row.index,
          ...row,
        }));

        // Merge with previous state and deduplicate
        const updatedState = [...prevState, ...addedItems];
        return Array.from(new Set(updatedState.map((item) => item.index))).map((index) =>
          updatedState.find((item) => item.index === index)
        );
      });

      setPaymentDueResult(
        filteredData.map((item) => ({
          ...item,
          pur_amount_due: parseFloat(item.pur_amount_due),
        }))
      );
    }
  }, [data]);

  useEffect(()=>{
    if(props.isDeselecting){
      return;
    }

    const representativeItem = props.selectedItems?.[0] || null;

      // Include rows related to the selectedItems
      let relatedRowsFromSelectedItems = [];
      if (representativeItem) {
        relatedRowsFromSelectedItems = filteredData.filter((row) => {
          const uniqueIds = new Set([row.pur_payer, row.pur_receiver, representativeItem.pur_payer, representativeItem.pur_receiver]);
          return uniqueIds.size === 2;
        });
      }

      // Combine preselected rows and relatedrows to the selecteditems
      const allPreselectedRows = [...relatedRowsFromSelectedItems];

      // Deduplicate rows
      const uniquePreselectedRows = Array.from(new Set(allPreselectedRows.map((row) => row.index)))
        .map((index) => allPreselectedRows.find((row) => row.index === index));

      // Update selected rows locally
      setSelectedRows(uniquePreselectedRows.map((row) => row.index));

      props.setSelectedItems((prevState) => {
        const addedItems = uniquePreselectedRows.map((row) => ({
          index: row.index,
          ...row,
        }));

        // Merge with previous state and deduplicate
        const updatedState = [...prevState, ...addedItems];
        const deduplicatedState =  Array.from(new Set(updatedState.map((item) => item.index))).map((index) =>
          updatedState.find((item) => item.index === index)
        );

        if (JSON.stringify(deduplicatedState) !== JSON.stringify(prevState)) {
          return deduplicatedState;
        }
        return prevState;

      });

  },[props.selectedItems])

  useEffect(() => {
    var total = 0;
    var cashflow = 0;

    let purchase_uid_mapping = [];

    for (const item of selectedRows) {
      let paymentItemData = paymentDueResult.find((element) => element.index === item);
      // //console.log("ROHIT - 687 - paymentItemData - ", paymentItemData);
      // const purchaseIDs = paymentItemData.purchase_uid;

      // JSON.parse(paymentItemData?.transactions).forEach(element => {
      //   if(purchaseIDs.includes(element.purchase_uid)){
      //     purchase_uid_mapping.push({ purchase_uid: element.purchase_uid, pur_amount_due: element.pur_amount_due.toFixed(2) });
      //   }
      // });
      const purchaseIDs = paymentItemData.purchase_uid;
      purchase_uid_mapping.push({ purchase_uid: purchaseIDs, pur_amount_due: paymentItemData.pur_amount_due.toFixed(2) });

      // purchaseIDs.forEach( purID => {
      // });

      // //console.log("payment item data", paymentItemData);

      cashflow += parseFloat(paymentItemData.amt_remaining);
      // Adjust total based on pur_cf_type
      if (paymentItemData.pur_payer.startsWith("110")) {
        total -= parseFloat(paymentItemData.amt_remaining);
      } else if (paymentItemData.pur_payer.startsWith("600")) {
        total += parseFloat(paymentItemData.amt_remaining);
      }

      // total += parseFloat(paymentItemData.pur_amount_due)
    }
    //console.log("selectedRows useEffect - total - ", total);
    //console.log("selectedRows useEffect - cashFlow total - ", cashflow);
    //console.log("selectedRows useEffect - purchase_uid_mapping - ", purchase_uid_mapping);

    props.setTotal(total);
    props.setCashFlowTotal(cashflow);
    props.setPaymentData(total.toFixed(2), purchase_uid_mapping);
  }, [selectedRows]);

  // useEffect(() => {
  //   //console.log("selectedPayments - ", selectedPayments);
  //   props.setSelectedItems(selectedPayments);
  // }, [selectedPayments]);

  useEffect(() => {
    const map = paymentDueResult.reduce((acc, row) => {
      acc[row.index] = row;
      return acc;
    }, {});
    setPaymentDueResultMap(map);
  }, [paymentDueResult]);

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
      field: "pur_payer",
      headerName: "Pur Payer",
      flex: 1.5,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },
    {
      field: "pur_receiver",
      headerName: "Pur Receiver",
      flex: 1.5,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },
    {
      field: "pur_group",
      headerName: "Pur Group",
      flex: 1.5,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },
    {
      field: "pur_property_id",
      headerName: "Property UID",
      flex: 1.5,
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
    // {
    //   field: "property_owner_id",
    //   headerName: "Owner UID",
    //   flex: 1,
    //   renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    // },
    {
      field: "pur_amount_due",
      headerName: "Expected",
      flex: 1.5,
      headerStyle: {
        fontWeight: "bold", // Apply inline style to the header cell
      },
      renderCell: (params) => (
        <Box
          sx={{
            fontWeight: "bold",
            width: "100%",
            display: "flex",
            textAlign: "right",
            flexDirection: "row",
            justifyContent: "flex-end",
            color: params.row.pur_payer.startsWith("600") ? "red" : "green",
          }}
        >
          {params.row.pur_payer.startsWith("600") ? `${parseFloat(params.value).toFixed(2)}` : `(${parseFloat(params.value).toFixed(2)})`}
        </Box>
      ),
      headerAlign: "right",
    },
    {
      field: "total_paid",
      headerName: "Actual",
      flex: 1,
      headerStyle: {
        fontWeight: "bold", // Apply inline style to the header cell
      },
      renderCell: (params) => (
        <Box
          sx={{
            fontWeight: "bold",
            width: "100%",
            textAlign: "right",
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          {params.value ? `${parseFloat(params.value).toFixed(2)}` : "0"}
        </Box>
      ),
      headerAlign: "right",
    },
    {
      field: "amt_remaining",
      headerName: "Amt Remaining",
      flex: 1.5,
      headerStyle: {
        fontWeight: "bold", // Apply inline style to the header cell
      },
      renderCell: (params) => (
        <Box
          sx={{
            fontWeight: "bold",
            width: "100%",
            display: "flex",
            textAlign: "right",
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          {params.value ? `${parseFloat(params.value).toFixed(2)}` : "0"}
        </Box>
      ),
      headerAlign: "right",
    },
  ];

  const handleSelectionModelChange = (newRowSelectionModel) => {
    props.setIsDeselecting(false)

    const addedRows = newRowSelectionModel.filter((rowId) => !selectedRows.includes(rowId));
    const removedRows = selectedRows.filter((rowId) => !newRowSelectionModel.includes(rowId));

    let updatedRowSelectionModel = [...newRowSelectionModel];

    if (addedRows.length > 0) {
      // //console.log("Added rows: ", addedRows);
      let newPayments = [];

      addedRows.forEach((item, index) => {
        // const addedPayment = paymentDueResult.find((row) => row.purchase_uid === addedRows[index]);
        const addedPayment = paymentDueResult.find((row) => row.index === item);

        if (addedPayment) {
          // const relatedPayments = paymentDueResult.filter((row) => row.pur_group === addedPayment.pur_group);

          const relatedPayments = paymentDueResult.filter((row) => {
            const uniqueIds = new Set([row.pur_payer, row.pur_receiver, addedPayment.pur_payer, addedPayment.pur_receiver]);
            return uniqueIds.size === 2; 
          });



        //     newPayments = [...newPayments, ...relatedPayments];
        //     const relatedRowIds = relatedPayments.map((payment) => payment.index);
        //     updatedRowSelectionModel = [...new Set([...updatedRowSelectionModel, ...relatedRowIds])];
        //   }
        // });

          if (relatedPayments.length > 0) {
            // Remove previously selected rows

            // updatedRowSelectionModel = relatedPayments.map((payment) => payment.index);
            const relatedRowIds = relatedPayments.map((payment) => payment.index);
            const deselectedRowIds = selectedRows.filter((rowId) => !relatedRowIds.includes(rowId));

            // props.setSelectedItems((prevState) =>
            //   prevState.filter((item) => !deselectedRowIds.includes(item.index))
            // );
            
            // if(props.selectedItems.length > 0){
            //   props.setIsDeselecting(true)
            // }

            props.setSelectedItems([])

            updatedRowSelectionModel = relatedRowIds;

            newPayments = [...relatedPayments];
          }
        }
      });

      // //console.log("newPayments - ", newPayments);
      // setSelectedPayments((prevState) => {
      //   return [...prevState, ...newPayments];
      // });
      
      setSelectedPayments(newPayments);

      props.setSelectedItems((prevState) => {
        const addedItems = newPayments.map((payment) => ({
          index: payment.index,
          ...payment,
        }));
  
        // Merge added items with existing global state, ensuring no duplicates
        const updatedState = [...prevState, ...addedItems];
        return Array.from(new Set(updatedState.map((item) => item.index))).map((index) =>
          updatedState.find((item) => item.index === index)
        );
      });
    }

    if (removedRows.length > 0) {
      props.setIsDeselecting(true)
      // //console.log("Removed rows: ", removedRows);
      let removedPayments = [];
      let relatedRows = [];

      removedRows.forEach((item, index) => {
        let removedPayment = paymentDueResult.find((row) => row.index === item);

        // we don't want to deselect all rows which are related to purchase_group because for maintenance 
        // let relatedPayments = [];

        // if (removedPayment) {
        //   relatedPayments = paymentDueResult.filter((row) => row.pur_group === removedPayment.pur_group);
        //   relatedRows = relatedPayments.map((payment) => payment.index);
        // }

        removedPayments.push(removedPayment);
        // removedPayments.push(relatedPayments);
      });
      // //console.log("removedPayments - ", removedPayments);
      const allRowRemove = [...new Set([...removedRows, ...relatedRows])];

      updatedRowSelectionModel = updatedRowSelectionModel.filter((payment) => !allRowRemove.includes(payment));
      setSelectedPayments((prevState) => prevState.filter((payment) => !allRowRemove.includes(payment.index)));

      props.setSelectedItems((prevState) =>
        prevState.filter((item) => !allRowRemove.includes(item.index))
      );
    }
    
    // setSelectedRows(newRowSelectionModel);
    setSelectedRows(updatedRowSelectionModel);
  };

  if (paymentDueResult.length > 0) {
    // //console.log("Passed Data ", paymentDueResult);
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
              sorting: {
                sortModel: [
                  { field: "pur_group", sort: "asc" },
                  { field: "pur_payer", sort: "asc" },
                ],
              },
            },
          }}
          // getRowId={(row) => row.purchase_uid}
          getRowId={(row) => row.index}
          pageSizeOptions={[10, 50, 100]}
          checkboxSelection
          // disableRowSelectionOnClick
          rowSelectionModel={selectedRows}
          onRowSelectionModelChange={handleSelectionModelChange}
          sortModel={sortModel}
          onSortModelChange={(newSortModel) => setSortModel(newSortModel)}
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
              ${" "}
              {selectedRows
                .reduce((total, selectedIndex) => {
                  // const payment = paymentDueResult.find((row) => row.index === selectedIndex);
                  const payment = paymentDueResultMap[selectedIndex];
                  if (payment) {
                    const amountDue = parseFloat(payment?.amt_remaining);
                    // const isExpense = payment.pur_cf_type === "expense";

                    // Adjust the total based on whether the payment is an expense or revenue
                    // return total + (isExpense ? -amountDue : amountDue);

                    if (payment.pur_payer.startsWith("110")) {
                      return total - amountDue;
                    } else if (payment.pur_payer.startsWith("600")) {
                      return total + amountDue;
                    }
                    // return total + 0;
                  }
                  return total + 0;
                }, 0)
                ?.toFixed(2)}
            </Typography>
          </Grid>
        </Grid>
      </>
    );
  } else {
    return (
      <>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "7px",
            width: "100%",
            height: "70px",
          }}
        >
          <Typography
            sx={{
              color: "#A9A9A9",
              fontWeight: theme.typography.primary.fontWeight,
              fontSize: "15px",
            }}
          >
            No Transactions
          </Typography>
        </Box>
      </>
    );
  }
}

function BalanceDetailsTable(props) {
  // //console.log("In BalanceDetailTable", props);
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
      // //console.log("item in loop", item)

      let paymentItemData = paymentDueResult.find((element) => element.purchase_uid === item);
      purchase_uid_mapping.push({ purchase_uid: item, pur_amount_due: paymentItemData.pur_amount_due.toFixed(2) });
      // //console.log("payment item data", paymentItemData);

      // total += parseFloat(paymentItemData.pur_amount_due);
      // Adjust total based on pur_cf_type
      if (paymentItemData.pur_cf_type === "revenue") {
        total += parseFloat(paymentItemData.pur_amount_due);
      } else if (paymentItemData.pur_cf_type === "expense") {
        total -= parseFloat(paymentItemData.pur_amount_due);
      }
    }
    // //console.log("selectedRows useEffect - total - ", total);
    // //console.log("selectedRows useEffect - purchase_uid_mapping - ", purchase_uid_mapping);
    props.setTotal(total);
    props.setPaymentData((prevPaymentData) => ({
      ...prevPaymentData,
      balance: total.toFixed(2),
      purchase_uids: purchase_uid_mapping,
    }));
  }, [selectedRows]);

  useEffect(() => {
    //console.log("selectedPayments - ", selectedPayments);
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
            textAlign: "right",
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
    //console.log("newRowSelectionModel - ", newRowSelectionModel);

    const addedRows = newRowSelectionModel.filter((rowId) => !selectedRows.includes(rowId));
    const removedRows = selectedRows.filter((rowId) => !newRowSelectionModel.includes(rowId));

    if (addedRows.length > 0) {
      // //console.log("Added rows: ", addedRows);
      let newPayments = [];
      addedRows.forEach((item, index) => {
        const addedPayment = paymentDueResult.find((row) => row.purchase_uid === addedRows[index]);
        // setCurrentTotal(prevTotal => prevTotal + addedPayment.pur_amount_due);
        newPayments.push(addedPayment);
      });

      // //console.log("newPayments - ", newPayments);
      setSelectedPayments((prevState) => {
        return [...prevState, ...newPayments];
      });
    }

    if (removedRows.length > 0) {
      // //console.log("Removed rows: ", removedRows);
      let removedPayments = [];
      removedRows.forEach((item, index) => {
        let removedPayment = paymentDueResult.find((row) => row.purchase_uid === removedRows[index]);
        // setCurrentTotal(prevTotal => prevTotal - removedPayment.pur_amount_due);
        removedPayments.push(removedPayment);
      });
      // //console.log("removedPayments - ", removedPayments);
      setSelectedPayments((prevState) => prevState.filter((payment) => !removedRows.includes(payment.purchase_uid)));
    }
    setSelectedRows(newRowSelectionModel);
  };

  if (paymentDueResult.length > 0) {
    // //console.log("Passed Data ", paymentDueResult);
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
            // //console.log("Hello Globe");
            // //console.log("Row ID:", rowId);
            // //console.log("Row Data:", row); // Log the entire row data
            // //console.log("Row PS:", row.ps); // Log the ps field
            return rowId;
          }}
          pageSizeOptions={[10, 50, 100]}
          checkboxSelection
          disableRowSelectionOnClick
          rowSelectionModel={selectedRows}
          onRowSelectionModelChange={handleSelectionModelChange}
          onRowClick={(row) => {
            {
              //console.log("Row =", row);
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
  // //console.log("In BalanceDetailTable", props);
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
      // //console.log("item in loop", item)

      let paymentItemData = paymentDueResult.find((element) => element.purchase_uid === item);
      purchase_uid_mapping.push({ purchase_uid: item, pur_amount_due: paymentItemData.pur_amount_due.toFixed(2) });
      // //console.log("payment item data", paymentItemData);

      // total += parseFloat(paymentItemData.pur_amount_due);
      // Adjust total based on pur_cf_type
      if (paymentItemData.pur_cf_type === "revenue") {
        total += parseFloat(paymentItemData.amt_remaining);
      } else if (paymentItemData.pur_cf_type === "expense") {
        total -= parseFloat(paymentItemData.amt_remaining);
      }
    }
    // //console.log("selectedRows useEffect - total - ", total);
    // //console.log("selectedRows useEffect - purchase_uid_mapping - ", purchase_uid_mapping);
    props.setTotal(total);
    props.setPaymentData((prevPaymentData) => ({
      ...prevPaymentData,
      balance: total.toFixed(2),
      purchase_uids: purchase_uid_mapping,
    }));
  }, [selectedRows]);

  useEffect(() => {
    //console.log("selectedPayments - ", selectedPayments);
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
      field: "pur_amount_due",
      headerName: "Purchase Amount Due",
      flex: 1,
      renderCell: (params) => <Box sx={{ fontWeight: "bold", textAlign: "right", width : "100%"}}>$ ${parseFloat(params.value).toFixed(2)}</Box>,
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
            textAlign: "right",
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
    //console.log("newRowSelectionModel - ", newRowSelectionModel);

    const addedRows = newRowSelectionModel.filter((rowId) => !selectedRows.includes(rowId));
    const removedRows = selectedRows.filter((rowId) => !newRowSelectionModel.includes(rowId));

    if (addedRows.length > 0) {
      // //console.log("Added rows: ", addedRows);
      let newPayments = [];
      addedRows.forEach((item, index) => {
        const addedPayment = paymentDueResult.find((row) => row.purchase_uid === addedRows[index]);
        // setCurrentTotal(prevTotal => prevTotal + addedPayment.pur_amount_due);
        newPayments.push(addedPayment);
      });

      // //console.log("newPayments - ", newPayments);
      setSelectedPayments((prevState) => {
        return [...prevState, ...newPayments];
      });
    }

    if (removedRows.length > 0) {
      // //console.log("Removed rows: ", removedRows);
      let removedPayments = [];
      removedRows.forEach((item, index) => {
        let removedPayment = paymentDueResult.find((row) => row.purchase_uid === removedRows[index]);
        // setCurrentTotal(prevTotal => prevTotal - removedPayment.pur_amount_due);
        removedPayments.push(removedPayment);
      });
      // //console.log("removedPayments - ", removedPayments);
      setSelectedPayments((prevState) => prevState.filter((payment) => !removedRows.includes(payment.purchase_uid)));
    }
    setSelectedRows(newRowSelectionModel);
  };

  if (paymentDueResult.length > 0) {
    // //console.log("Passed Data ", paymentDueResult);
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
            // //console.log("Hello Globe");
            // //console.log("Row ID:", rowId);
            // //console.log("Row Data:", row); // Log the entire row data
            // //console.log("Row PS:", row.ps); // Log the ps field
            return rowId;
          }}
          pageSizeOptions={[10, 50, 100]}
          checkboxSelection
          disableRowSelectionOnClick
          rowSelectionModel={selectedRows}
          onRowSelectionModelChange={handleSelectionModelChange}
          onRowClick={(row) => {
            {
              //console.log("Row =", row);
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
                const amountDue = parseFloat(payment.amt_remaining);
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
  // //console.log("In MoneyReceivedTable", props);
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
            textAlign: "right",
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
            textAlign: "right",
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
              //console.log("Row =", row);
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
  // //console.log("In MoneyPaidTable", props);
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
            textAlign: "right",
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
            textAlign: "right",
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
              //console.log("Row =", row);
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
  // //console.log("In MoneyPaidTable", props);
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
            textAlign: "right",
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
              //console.log("Row =", row);
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
