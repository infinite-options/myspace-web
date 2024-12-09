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
import { DataGrid } from "@mui/x-data-grid";
import MuiAccordion from "@material-ui/core/Accordion";
import { withStyles } from "@material-ui/core/styles";
import { useNavigate, useLocation } from "react-router-dom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
// import HomeWorkIcon from "@mui/icons-material/HomeWork";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import theme from "../../theme/theme";
// import RevenueTable from "./RevenueTable";
// import ExpectedRevenueTable from "./ExpectedRevenueTable";
// import SelectMonthComponent from "../SelectMonthComponent";
// import ExpenseTable from "./ExpenseTable";
// import ExpectedExpenseTable from "./ExpectedExpenseTable";
// import MixedChart from "../Graphs/OwnerCashflowGraph";
// import SelectProperty from "../Leases/SelectProperty";
// import AddRevenueIcon from "../../images/AddRevenueIcon.png";
import AllOwnerIcon from "../Rent/RentComponents/AllOwnerIcon.png";
import { useUser } from "../../contexts/UserContext"; // Import the UserContext
import Backdrop from "@mui/material/Backdrop";
// import DeleteIcon from "@mui/icons-material/Delete";
// import EditIcon from "@mui/icons-material/Edit";
import CircularProgress from "@mui/material/CircularProgress";
import "../../css/selectMonth.css";

// import ManagerCashflowWidget from "../Dashboard-Components/Cashflow/ManagerCashflowWidget";

import axios from "axios";

// import {
//   getTotalRevenueByType,
//   getTotalExpenseByType,
//   fetchCashflow2,
//   getTotalExpenseByMonthYear,
//   getTotalRevenueByMonthYear,
//   getTotalExpectedRevenueByMonthYear,
//   getTotalExpectedExpenseByMonthYear,
//   getPast12MonthsCashflow,
//   getNext12MonthsCashflow,
//   getRevenueList,
//   getExpenseList,
// } from "../Cashflow/CashflowFetchData2";

// const Accordion = withStyles({
//   root: {
//     "&$expanded": {
//       margin: "auto"
//     }
//   },
//   expanded: {}
// })(MuiAccordion);

export default function ManagerTransactions({ propsMonth, propsYear, setMonth, setYear, setSelectedPayment, setCurrentWindow, selectedProperty, setSelectedPurGroup }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, getProfileId } = useUser(); // Access the user object from UserContext

  const profileId = getProfileId();
  const selectedRole = user.selectedRole; // Get the selected role from user object
  const [showSpinner, setShowSpinner] = useState(false);

  const [activeButton, setActiveButton] = useState("Cashflow");

  const [showChart, setShowChart] = useState("Current");

  const month = propsMonth || ["July"]; //fix
  const year = propsYear || ["2024"];

  const cashflowWidgetData = location.state?.cashflowWidgetData;

  const [showSelectMonth, setShowSelectMonth] = useState(false);
  const [openSelectProperty, setOpenSelectProperty] = useState(false);

  const [transactions, setTransactions] = useState([]);

  const [transactionsNew, setTransactionsNew] = useState([]);
  const [transactionsData, setTransactionsData] = useState([]);

  const getPurchaseGroupStatus = (purchaseGroup) => {
    if (purchaseGroup.pur_amount_due_total === purchaseGroup.total_paid_total) {
      return "fully_paid";
    } else if (purchaseGroup.total_paid_total === null || purchaseGroup.total_paid_total === 0) {
      return "not_paid";
    } else {
      return "partially_paid";
    }
  };

  const getVerificationForTenantPayment = (pur) => {
    const actual = pur.actual ? parseFloat(pur.actual) : 0;
    const expected = pur.expected ? parseFloat(pur.expected) : 0;
    if (actual < expected) {
      return "tenant";
    } else if (actual > expected) {
      return "investigate";
    } else if (actual === expected) {
      if (pur.verified) {
        if (pur.verified === "verified") {
          return "verified";
        }
      }
      return "not verified";
    }
  };

  const getPurGroupVerificationStatus = (purchaseGroup) => {
    const tenantPayment = purchaseGroup.transactions?.find((transaction) => transaction.pur_payer?.startsWith("350"));

    if (!tenantPayment) {
      return null;
    }

    // return tenantPayment.verified ? tenantPayment.verified : "unverified";
    return getVerificationForTenantPayment(tenantPayment);
  };

  async function fetchCashflowTransactions(userProfileId, month, year) {
    setShowSpinner(true);
    try {
      const cashflow = await axios.get(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/cashflowTransactions/${userProfileId}/new`);
      // console.log("Manager Cashflow Data: ", cashflow.data);
      setShowSpinner(false);
      return cashflow.data?.result;
    } catch (error) {
      console.error("Error fetching cashflow data:", error);
      setShowSpinner(false);
    }
  }

  useEffect(() => {
    fetchCashflowTransactions(profileId)
      .then((data) => {
        const dataWithIndex = data?.map((item, index) => ({
          ...item,
          index: index,
        }));
        setTransactionsData(dataWithIndex);
      })
      .catch((error) => {
        console.error("Error fetching cashflow data:", error);
      });
  }, []);
  //   useEffect(() => {
  //     console.log("rentsByProperty - ", rentsByProperty);
  //   }, [rentsByProperty]);

  //   useEffect(() => {
  //     console.log("profits - ", profits);
  //   }, [profits]);

  //   useEffect(() => {
  //     console.log("payouts - ", payouts);
  //   }, [payouts]);

  // useEffect(() => {
  //   console.log("transactions - ", transactions);
  // }, [transactions]);

  // useEffect(() => {
  //   console.log("transactionsNew - ", transactionsNew);
  // }, [transactionsNew]);

  const getSortOrder = (transaction) => {
    const { pur_payer, pur_receiver } = transaction;

    if (pur_payer.startsWith("350") && pur_receiver.startsWith("600")) {
      return 1;
    } else if (pur_payer.startsWith("600") && pur_receiver.startsWith("110")) {
      return 2;
    } else if (pur_payer.startsWith("110") && pur_receiver.startsWith("600")) {
      return 3;
    } else {
      return 4; // Default sort order for unspecified conditions
    }
  };

  const getTotalsForPurGroup = (group) => {
    // console.log("ROHIT - 234 - group.transactions - ", group.transactions)

    const purAmountDueTotal = group.transactions.reduce((acc, transaction) => {
      // if(transaction.pur_payer.startsWith("600")){
      //   return acc - parseFloat(transaction.expected)
      // } else if(transaction.pur_payer.startsWith("110")){
      //   return acc + parseFloat(transaction.expected)
      // }
      return acc + parseFloat(transaction.expected);
    }, 0);
    const totalPaidTotal = group.transactions.reduce((acc, transaction) => {
      // if(transaction.pur_payer.startsWith("600")){
      //   return acc - parseFloat(transaction.actual? transaction.actual : "0")
      // } else if(transaction.pur_payer.startsWith("110")){
      //   return acc + parseFloat(transaction.actual? transaction.actual : "0")
      // }
      return acc + parseFloat(transaction.actual ? transaction.actual : "0");
    }, 0);
    return { purAmountDueTotal: purAmountDueTotal, totalPaidTotal: totalPaidTotal };
  };

  useEffect(() => {
    //TRANSACTIONS
    // const allTransactionsData = transactionsData?.result;
    const allTransactionsData = transactionsData;
    // console.log("allTransactionsData - ", allTransactionsData);
    // console.log("allTransactionsData - selectedProperty", selectedProperty);
    let filteredTransactionsData = [];
    if (selectedProperty === "ALL") {
      filteredTransactionsData = allTransactionsData;
      // console.log("filteredTransactionsData - ", filteredTransactionsData);
    } else {
      filteredTransactionsData = allTransactionsData?.filter((item) => item.pur_property_id === selectedProperty);
      // console.log("filteredTransactionsData - test ", filteredTransactionsData);
    }
    const transactionsCurrentMonth = filteredTransactionsData?.filter((item) =>   month.includes(item.cf_month) && year[month.indexOf(item.cf_month)] === item.cf_year);

    // console.log("ROHIT - filteredTransactionsData - ", filteredTransactionsData);

    const sortedTransactions = transactionsCurrentMonth?.map((transaction) => {
      return {
        ...transaction,
        transactions: JSON.parse(transaction?.transactions).sort((a, b) => {
          return getSortOrder(a) - getSortOrder(b);
        }),
      };
    });

    setTransactions(sortedTransactions);

    // console.log("ROHIT - sortedTransactions - ", sortedTransactions);

    const transactionsByProperty = sortedTransactions?.reduce((acc, item) => {
      const propertyUID = item.pur_property_id;
      const propertyInfo = {
        property_id: item.pur_property_id,
        property_address: item.property_address,
        property_unit: item.property_unit,
      };

      // const totalExpected = item.purchaseGroups?.reduce( (acc, item) => {
      //   return acc + parseFloat(item.pur_amount_due_total) || 0
      // }, 0);

      // const totalActual = parseFloat(item.total_paid_total) || 0

      if (!acc[propertyUID]) {
        // acc[propertyUID] = [];
        acc[propertyUID] = {
          propertyInfo: propertyInfo,
          purchaseGroups: {},
          // totalExpected: 0,
          // totalActual: 0,
        };
      }

      const groupStatus = getPurchaseGroupStatus(item);
      if (!acc[propertyUID].purchaseGroups[item.pur_group]) {
        // acc[propertyUID] = [];
        acc[propertyUID].purchaseGroups[item.pur_group] = {
          pur_group: item.pur_group,
          transactions: [],
        };
      }
      acc[propertyUID].purchaseGroups[item.pur_group].transactions.push(item);
      // acc[propertyUID].totalExpected += totalExpected;
      // acc[propertyUID].totalActual += totalActual;

      return acc;
    }, {});

    //update pur group status for each pur group in each property

    // console.log("ROHIT - 211 - transactionsByProperty - ", transactionsByProperty);

    if (transactionsByProperty && Object.keys(transactionsByProperty).length > 0) {
      Object.keys(transactionsByProperty)?.forEach((propertyUID) => {
        const purchaseGroups = transactionsByProperty[propertyUID].purchaseGroups;
        // console.log("ROHIT - 212 - purchaseGroups - ", purchaseGroups);

        Object.keys(purchaseGroups)?.forEach((group) => {
          const purGroup = purchaseGroups[group];
          // console.log("ROHIT - 220 - purGroup - ", purGroup);
          const { purAmountDueTotal, totalPaidTotal } = getTotalsForPurGroup(purGroup);

          // Add totals to the current group object
          purGroup.pur_amount_due_total = purAmountDueTotal;
          purGroup.total_paid_total = totalPaidTotal;
          purGroup.purchaseGroupStatus = getPurchaseGroupStatus(purGroup);

          const purGroupVerificationStatus = getPurGroupVerificationStatus(purGroup);
          if (purGroupVerificationStatus) {
            purGroup.verified = purGroupVerificationStatus;
          }
        });
      });
    }

    // console.log("ROHIT - 234 - transactionsByProperty - ", transactionsByProperty);

    if (transactionsByProperty && Object.keys(transactionsByProperty).length > 0) {
      Object.keys(transactionsByProperty)?.forEach((propertyUID) => {
        const purchaseGroups = Object.values(transactionsByProperty[propertyUID].purchaseGroups);

        // console.log("ROHIT - 272 - purchaseGroups - ", purchaseGroups);

        const allFullyPaid = purchaseGroups.every((group) => group.purchaseGroupStatus === "fully_paid");
        const partiallyPaid = purchaseGroups.find((group) => group.purchaseGroupStatus === "partially_paid");
        const notPaid = purchaseGroups.find((group) => group.purchaseGroupStatus === "not_paid");

        const totalExpected = Object.values(transactionsByProperty[propertyUID].purchaseGroups)?.reduce((acc, item) => {
          return acc + parseFloat(item.pur_amount_due_total) || 0;
        }, 0);

        const totalActual = Object.values(transactionsByProperty[propertyUID].purchaseGroups)?.reduce((acc, item) => {
          return acc + parseFloat(item.total_paid_total) || 0;
        }, 0);

        if (allFullyPaid) {
          transactionsByProperty[propertyUID].propertyPurchaseStatus = "fully_paid";
        }
        if (partiallyPaid !== undefined) {
          transactionsByProperty[propertyUID].propertyPurchaseStatus = "partially_paid";
        }
        if (notPaid !== undefined) {
          transactionsByProperty[propertyUID].propertyPurchaseStatus = "not_paid";
        }

        // transactionsByProperty[propertyUID].propertyPurchaseStatus = allFullyPaid ? "fully_paid" : "not_paid";
        transactionsByProperty[propertyUID].totalExpected = totalExpected;
        transactionsByProperty[propertyUID].totalActual = totalActual;
      });
    }

    console.log(" ROHIT - 302 - transactionsByProperty - ", transactionsByProperty);

    setTransactionsNew(transactionsByProperty);
  }, [month, year, transactionsData, selectedProperty]);

  // useEffect(() => {
  //     console.log("revenueByType", revenueByType)
  //     console.log("expenseByType", expenseByType)
  // }, [revenueByType, expenseByType])

  const getCircleColor = (transaction) => {
    if (transaction.pur_amount_due_total === transaction.total_paid_total) {
      return "#76B148";
    } else if (transaction.total_paid_total === null || transaction.total_paid_total === 0) {
      return "#A52A2A";
    } else {
      return "#FFC614";
    }
  };

  const getPropertyCircleColor = (property) => {
    if (property.propertyPurchaseStatus === "fully_paid") {
      return "#76B148";
    } else if (property.propertyPurchaseStatus === "not_paid") {
      return "#A52A2A";
    } else if (property.propertyPurchaseStatus === "partially_paid") {
      return "#FFC614";
    } else {
      return "#000000";
    }
  };

  const isPurGroupPayable = (group) => {
    // if (group.pur_amount_due_total === group.total_paid_total) {
    //   return false;
    // } else if (group.total_paid_total === null) {
    //   return false;
    // } else {
    //   return true;
    // }

    if (group.total_paid_total == null || group.verified == null || group.total_paid_total >= group.pur_amount_due_total) {
      return false;
    } else if (group.total_paid_total < group.pur_amount_due_total && group.verified === "verified") {
      return true;
    } else if (group.total_paid_total > 0 && group.verified === "not verified") {
      return true;
    } else {
      return false;
    }
  };

  const isPurGroupVerified = (purGroup) => {
    // console.log("ROHIT - 356 - isPurGroupVerified - purGroup.verified - ", purGroup.verified);
    if (purGroup.verified && purGroup.verified.toLowerCase() === "verified") {
      return true;
    }
    return false;
  };

  const isPurGroupPaid = (purGroup) => {
    // console.log("ROHIT - 362 - purGroup - ", purGroup);
    if (purGroup.pur_amount_due_total && purGroup.total_paid_total) {
      if (purGroup.total_paid_total >= purGroup.pur_amount_due_total) {
        return true;
      }
    }
    return false;
  };

  const handlePayment = (purGroup) => {
    // console.log("ROHIT - 361 - handlePayment - transactions - ", purGroup.transactions);
    const purchaseUIDs = [];
    const ownerPayments = purGroup.transactions?.filter((item) => item.pur_payer === getProfileId()); //payments from 600 to 110
    const managerPayments = purGroup.transactions?.filter((item) => item.pur_receiver === getProfileId() && item.pur_payer?.startsWith("110")); //payments from 110 to 600
    // transaction.transactions.forEach(transaction => purchaseUIDs.push({ purchase_uid: transaction.purchase_uid, pur_amount_due: parseFloat(transaction.pur_amount_due)?.toFixed(2)?.toString()}))
    ownerPayments.forEach((transaction) => {
      transaction.transactions.forEach((transaction) => {
        purchaseUIDs.push({ purchase_uid: transaction.purchase_uid, pur_amount_due: parseFloat(transaction.pur_amount_due)?.toFixed(2)?.toString() });
      });
    });
    managerPayments.forEach((transaction) =>
      transaction.transactions.forEach((transaction) => {
        purchaseUIDs.push({ purchase_uid: transaction.purchase_uid, pur_amount_due: parseFloat(transaction.pur_amount_due)?.toFixed(2)?.toString() });
      })
    );

    // console.log("handlePayment - purchaseUIDs - ", purchaseUIDs);

    const totalOwnerPayment = ownerPayments.reduce((acc, transaction) => {
      return acc + transaction.expected;
    }, 0);

    const totalManagerPayment = managerPayments.reduce((acc, transaction) => {
      return acc + transaction.expected;
    }, 0);

    const total = totalOwnerPayment - totalManagerPayment;

    // console.log("handlePayment - totalOwnerPayment - ", totalOwnerPayment);
    // console.log("handlePayment - totalManagerPayment - ", totalManagerPayment);
    // console.log("handlePayment - total - ", total);
    // console.log("handlePayment - total.toFixed(1) - ", total.toFixed(1));
    // console.log("handlePayment - parseFloat(total.toFixed(1)) - ", parseFloat(total.toFixed(1)));

    const paymentData = {
      currency: "usd",
      //customer_uid: '100-000125', // customer_uid: user.user_uid currently gives error of undefined
      customer_uid: getProfileId(),
      // customer_uid: user.user_uid,
      // business_code: "IOTEST",
      business_code: "",
      item_uid: "320-000054",
      // payment_summary: {
      //     total: "0.0"
      // },

      // balance: "0.0",
      balance: total.toFixed(2).toString(),
      purchase_uids: purchaseUIDs,
    };

    // console.log("handlePayment - paymentData - ", paymentData);

    // navigate("/selectPayment", {
    //     state: { paymentData: paymentData, total: parseFloat(total.toFixed(1)), selectedItems: [], paymentMethodInfo: {} },
    // });

    setSelectedPayment({ paymentData: paymentData, total: parseFloat(total.toFixed(1)), selectedItems: [], paymentMethodInfo: {} });

    setCurrentWindow("SELECT_PAYMENT");
  };

  return (
    <ThemeProvider theme={theme}>
      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
        <CircularProgress color='inherit' />
      </Backdrop>

      <Container maxWidth='lg' sx={{ height: "90vh" }}>
        <Grid container spacing={6} sx={{ height: "90%" }}>
          <Grid container item xs={12} columnSpacing={6}>
            <Box
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                width: "100%", // Take up full screen width
              }}
            >
              <Paper
                style={{
                  // marginTop: "30px",
                  padding: theme.spacing(2),
                  backgroundColor: activeButton === "Cashflow" ? theme.palette.primary.main : theme.palette.primary.secondary,
                  width: "95%", // Occupy full width with 25px margins on each side
                  // [theme.breakpoints.down("sm")]: {
                  //   width: "80%",
                  // },
                  // [theme.breakpoints.up("sm")]: {
                  //   width: "50%",
                  // },
                }}
              >
                {/* Back button */}
                <Button
                  onClick={() => navigate(-1)}
                  startIcon={<ArrowBackIcon />}
                  sx={{
                    marginTop: "10px",
                    color: theme.typography.primary.black,
                    fontWeight: "bold",
                    fontSize: "16px",
                  }}
                ></Button>
                <Stack direction='row' justifyContent='center'>
                  <Typography sx={{ color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}>
                    {month} {year} Transactions
                  </Typography>
                </Stack>

                <Box component='span' m={2} display='flex' justifyContent='space-between' alignItems='center'>
                  <Button sx={{ textTransform: "capitalize" }} onClick={() => setShowSelectMonth(true)}>
                    <CalendarTodayIcon sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight, fontSize: theme.typography.smallFont }} />
                    <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight, fontSize: "14px" }}>Select Month / Year</Typography>
                  </Button>
                  <SelectMonthComponentTest
                    selectedMonth={month}
                    selectedYear={year}
                    setMonth={setMonth}
                    setYear={setYear}
                    showSelectMonth={showSelectMonth}
                    setShowSelectMonth={setShowSelectMonth}
                  />
                  {selectedRole === "MANAGER" && (
                    <Button sx={{ textTransform: "capitalize" }} onClick={() => {}}>
                      <img src={AllOwnerIcon} alt='All Owners' style={{ width: "10px", height: "10px" }} />
                      <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight, fontSize: "14px" }}>All Owners</Typography>
                    </Button>
                  )}
                </Box>

                <Grid container item xs={12}>
                  <Grid item xs={7}></Grid>
                  <Grid container justifyContent='flex-end' item xs={3}>
                    <Box sx={{ backgroundColor: "#FFE3AD", padding: "5px", borderRadius: "5px", width: "80px", display: "flex", justifyContent: "center" }}>
                      <Typography sx={{ color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize: "15px" }}>Expected</Typography>
                    </Box>
                  </Grid>

                  <Grid container justifyContent='flex-end' item xs={2}>
                    <Box sx={{ backgroundColor: "#8696BE", padding: "5px", borderRadius: "5px", width: "80px", display: "flex", justifyContent: "center" }}>
                      <Typography sx={{ color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize: "15px" }}>Actual</Typography>
                    </Box>
                  </Grid>
                </Grid>

                {transactionsNew &&
                  Object.keys(transactionsNew)?.map((propertyID, index) => {
                    const property = transactionsNew[propertyID];
                    return (
                      <Accordion
                        sx={{
                          backgroundColor: theme.palette.primary.main,
                          boxShadow: "none",
                          marginTop: "15px",
                        }}
                        key={propertyID}
                      >
                        <Grid container item xs={12}>
                          <Grid container justifyContent='flex-start' item xs={7}>
                            <Grid container direction='row' sx={{ height: "35px" }}>
                              <Grid container alignContent='flex-start' item xs={10}>
                                <AccordionSummary
                                  sx={{
                                    "&.Mui-expanded": {
                                      minHeight: "unset", // Override the min-height when expanded
                                    },
                                  }}
                                  expandIcon={<ExpandMoreIcon />}
                                >
                                  <Box style={{ display: "flex", alignItems: "center" }}>
                                    <Box
                                      sx={{
                                        width: "20px",
                                        height: "20px",
                                        borderRadius: "50%",
                                        backgroundColor: getPropertyCircleColor(property),
                                        marginRight: "10px",
                                      }}
                                    ></Box>
                                    <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>
                                      {`${property.propertyInfo?.property_address}, Unit - ${property.propertyInfo?.property_unit}`}
                                    </Typography>
                                  </Box>
                                </AccordionSummary>
                              </Grid>
                            </Grid>
                          </Grid>
                          <Grid container justifyContent='flex-end' alignItems='center' item xs={3}>
                            <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight }}>
                              ${property?.totalExpected ? property?.totalExpected?.toFixed(2) : "0.00"}
                            </Typography>
                          </Grid>

                          <Grid container justifyContent='flex-end' alignItems='center' item xs={2}>
                            <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight }}>
                              ${property?.totalActual ? property?.totalActual?.toFixed(2) : "0.00"}
                            </Typography>
                          </Grid>
                        </Grid>

                        <AccordionDetails>
                          {Object.values(property.purchaseGroups)?.map((purGroup, index) => {
                            const isPayable = isPurGroupPayable(purGroup);
                            const isVerified = isPurGroupVerified(purGroup);
                            // console.log("Is Verified:", isVerified);
                            const isPaid = isPurGroupPaid(purGroup);
                            return (
                              <Accordion
                                // disableGutters
                                sx={{
                                  backgroundColor: theme.palette.primary.main,
                                  boxShadow: "none",
                                  marginTop: "5px",
                                  // marginLeft: "30px",
                                  paddingLeft: "10px",
                                }}
                                key={purGroup.pur_group}
                              >
                                <Grid container item xs={12}>
                                  <Grid container justifyContent='flex-start' item xs={7}>
                                    <Grid container direction='row' sx={{ height: "35px" }}>
                                      <Grid container alignContent='flex-start' item xs={8}>
                                        <AccordionSummary
                                          sx={{
                                            "&.Mui-expanded": {
                                              minHeight: "unset", // Override the min-height when expanded
                                            },
                                          }}
                                          expandIcon={<ExpandMoreIcon />}
                                        >
                                          <Box style={{ display: "flex", alignItems: "center" }}>
                                            <Box
                                              sx={{
                                                width: "20px",
                                                height: "20px",
                                                borderRadius: "50%",
                                                backgroundColor: getCircleColor(purGroup),
                                                marginRight: "10px",
                                              }}
                                            ></Box>
                                            <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>
                                              {`Purchase Group - ${purGroup.pur_group ? purGroup.pur_group : "Maintenance"}`}
                                            </Typography>
                                          </Box>
                                        </AccordionSummary>
                                      </Grid>
                                      <Grid item xs={2}>
                                        {isPayable && (
                                          <Button
                                            onClick={() => handlePayment(purGroup)}
                                            sx={{
                                              backgroundColor: "#8696BE",
                                              color: "#160449",
                                              "&:hover": {
                                                backgroundColor: "#160449",
                                                color: "#FFFFFF",
                                              },
                                            }}
                                          >
                                            <Typography sx={{ color: "inherit", fontWeight: theme.typography.common.fontWeight, textTransform: "none", fontSize: "12px" }}>
                                              Pay
                                            </Typography>
                                          </Button>
                                        )}
                                      </Grid>
                                      <Grid item xs={2}>
                                        {
                                          // purGroup.pur_amount_due_total !== purGroup.total_paid_total && (
                                          !isPaid && isPayable && <VerifiedButton isVerified={isVerified} isPaid={isPaid} isPayable={isPayable} purGroup={purGroup} />
                                        }
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                  <Grid container justifyContent='flex-end' alignItems='center' item xs={3}>
                                    <Typography sx={{ color: "#000000", fontWeight: theme.typography.common.fontWeight }}>
                                      ${purGroup?.pur_amount_due_total ? parseFloat(purGroup?.pur_amount_due_total).toFixed(2) : "0.00"}
                                    </Typography>
                                  </Grid>

                                  <Grid container justifyContent='flex-end' alignItems='center' item xs={2}>
                                    <Typography sx={{ color: "#000000", fontWeight: theme.typography.common.fontWeight }}>
                                      ${purGroup?.total_paid_total ? parseFloat(purGroup?.total_paid_total).toFixed(2) : "0.00"}
                                    </Typography>
                                  </Grid>
                                </Grid>

                                <AccordionDetails>
                                  {/* {purGroup?.transactions?.map((purchase, index) => {
                                    return (
                                      <>
                                        <Grid container item xs={12}>
                                          <Grid container justifyContent='flex-start' item xs={7} sx={{ paddingLeft: "30px" }}>
                                            <Typography>
                                              {purchase.pur_payer?.startsWith("350") && purchase.pur_receiver?.startsWith("600") ? "Tenant Payment " : ""}
                                              {purchase.pur_payer?.startsWith("600") && purchase.pur_receiver?.startsWith("110") ? "Owner Payment " : ""}
                                              {purchase.pur_payer?.startsWith("110") && purchase.pur_receiver?.startsWith("600") ? "Manager Payment " : ""}-{" "}
                                              {purchase.purchase_type ? purchase.purchase_type : ""} - {purchase.pur_description ? purchase.pur_description : ""}
                                            </Typography>
                                          </Grid>
                                          <Grid container justifyContent='flex-end' item xs={3}>
                                            <Typography sx={{ fontWeight: theme.typography.common.fontWeight }}>                                              
                                              ${purchase?.expected ? purchase?.expected : "0"}
                                            </Typography>
                                          </Grid>

                                          <Grid container justifyContent='flex-end' item xs={2}>
                                            <Typography sx={{ fontWeight: theme.typography.common.fontWeight }}>                                              
                                              ${purchase?.actual ? purchase?.actual : "0"}
                                            </Typography>
                                          </Grid>
                                        </Grid>
                                      </>
                                    );
                                  })} */}
                                  <Box sx={{ paddingLeft: "30px" }}>
                                    <PurGroupTable data={purGroup.transactions} />
                                  </Box>
                                </AccordionDetails>
                              </Accordion>
                            );
                          })}
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

const VerifiedButton = ({ isVerified, isPaid, isPayable, purGroup }) => {
  const navigate = useNavigate();
  return (
    <Button
      onClick={() => {
        // console.log("ROHIT - purGroup - ", purGroup)
        const propertyID = purGroup.transactions[0]?.pur_property_id;
        // console.log("ROHIT - propertyID - ", propertyID)
        if (!isVerified) {
          navigate("/paymentVerification", {
            state: {
              propertyID: propertyID,
            },
          });
        }
      }}
      sx={{
        backgroundColor: "#8696BE",
        color: "#160449",
        "&:hover": {
          backgroundColor: "#160449",
          color: "#FFFFFF",
        },
      }}
    >
      <Typography sx={{ color: "inherit", fontWeight: theme.typography.common.fontWeight, textTransform: "none", fontSize: "12px" }}>
        {/* {isVerified? "Verified" : "Unverified"} */}
        {isVerified === true ? "Verified" : ""}
        {isVerified === false ? "Not verified" : ""}
      </Typography>
    </Button>
  );
};

function PurGroupTable(props) {
  const [data, setData] = useState(props.data);
  const [paymentDueResult, setPaymentDueResult] = useState([]);

  useEffect(() => {
    setData(props.data);
  }, [props.data]);

  useEffect(() => {
    if (data && data.length > 0) {
      const dataWithIndex = data?.map((item, index) => ({
        ...item,
        index: index,
      }));

      setPaymentDueResult(dataWithIndex);
    }
  }, [data]);

  const columnsList = [
    {
      field: "pur_payer",
      headerName: "Pur Payer",
      flex: 1,
      // renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
      renderCell: (params) => (
        <Box sx={{ fontWeight: "bold" }}>
          {/* {params.value} */}
          {params.value.startsWith("350") && params.row.pur_receiver?.startsWith("600") ? "Tenant Payment" : ""}
          {params.value?.startsWith("600") && params.row.pur_receiver?.startsWith("110") ? "Owner Payment" : ""}
          {params.value?.startsWith("110") && params.row.pur_receiver?.startsWith("600") ? "Manager Payment" : ""}
          {/* {params.row.purchase_type ? params.row.purchase_type : ""} - {params.row.pur_description ? params.row.pur_description : ""} */}
        </Box>
      ),
    },
    {
      field: "purchase_type",
      headerName: "Type",
      flex: 3,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },
    {
      field: "expected",
      headerName: "Expected",
      flex: 1.5,
      headerStyle: {
        fontWeight: "bold",
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
          {params.row.pur_payer.startsWith("600") ? `(${parseFloat(params.value).toFixed(2)})` : `${parseFloat(params.value).toFixed(2)}`}
        </Box>
      ),
      headerAlign: "right",
    },
    {
      field: "actual",
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

  if (paymentDueResult.length > 0) {
    // console.log("Passed Data ", paymentDueResult);
    return (
      <>
        <DataGrid
          slots={{
            columnHeaders: () => null,
          }}
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
          getRowId={(row) => row.index}
          pageSizeOptions={[10, 50, 100]}
          hideFooter={true}

          // checkboxSelection
          // disableRowSelectionOnClick
        />
      </>
    );
  } else {
    return <></>;
  }
}

function SelectMonthComponentTest(props) {
  // console.log("SelectMonthComponentTest - props - ",  props);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const lastYear = new Date().getFullYear() - 1;
  const currentYear = new Date().getFullYear();
  const nextYear = new Date().getFullYear() + 1;

  return (
    <Dialog open={props.showSelectMonth} onClose={() => props.setShowSelectMonth(false)} maxWidth='lg'>
      <DialogTitle>
        <IconButton
          aria-label='close'
          onClick={() => props.setShowSelectMonth(false)}
          sx={{
            position: "absolute",
            right: 1,
            top: 1,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box>
          {monthNames.map((month, index) => {
            return (
              <Typography className={props.selectedMonth === month ? "selected" : "unselected"} key={index} onClick={() => props.setMonth([month])}>
                {month}
              </Typography>
            );
          })}
        </Box>
        <Box>
          <Typography className={props.selectedYear === lastYear.toString() ? "selected" : "unselected"} onClick={() => props.setYear([lastYear.toString()])}>
            {lastYear}
          </Typography>
          <Typography className={props.selectedYear === currentYear.toString() ? "selected" : "unselected"} onClick={() => props.setYear([currentYear.toString()])}>
            {currentYear}
          </Typography>
          <Typography className={props.selectedYear === nextYear.toString() ? "selected" : "unselected"} onClick={() => props.setYear([nextYear.toString()])}>
            {nextYear}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

// This is the function that controls what and how the cashflow data is displayed
function StatementTable(props) {
  console.log("In Statement Table: ", props);
  const navigate = useNavigate();

  const activeView = props.activeView;
  const tableType = props.tableType;

  const month = props.month;
  const year = props.year;

  const categoryTotalMapping = props.categoryTotalMapping;
  const allItems = props.allItems;

  const categoryExpectedTotalMapping = props.categoryExpectedTotalMapping;
  const allExpectedItems = [];

  const navigateType = "/edit" + tableType;

  function handleNavigation(type, item) {
    console.log(item);
    navigate(type, { state: { itemToEdit: item, edit: true } });
  }

  // console.log("--debug-- tableType categoryTotalMapping", tableType, categoryTotalMapping)
  // console.log("activeView", activeView)
  // console.log("statement table year/month", year, month)

  function getCategoryCount(category) {
    console.log("getCategoryCount - allItems - ", allItems);
    let items = allItems.filter((item) => item.purchase_type.toUpperCase() === category.toUpperCase() &&  month.includes(item.cf_month) && year[month.indexOf(item.cf_month)] === item.cf_year);
    return "(" + items.length + ")";
  }

  function getCategoryItems(category, type) {
    let filteredIitems = allItems.filter((item) => item.purchase_type.toUpperCase() === category.toUpperCase() &&  month.includes(item.cf_month) && year[month.indexOf(item.cf_month)] === item.cf_year);
    let items = filteredIitems?.map((item) => ({ ...item, property: JSON.parse(item.property) }));

    console.log("getCategoryItems", items);
    var key = "total_paid";
    if (activeView === "Cashflow") {
      key = "total_paid";
    } else {
      key = "pur_amount_due";
    }
    return (
      <>
        {items.map((item, index) => {
          return activeView === "Cashflow" ? (
            <TableRow key={index} onClick={() => handleNavigation(type, item)}>
              <TableCell></TableCell>
              <TableCell>
                <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
                  {" "}
                  {item.property_address} {item.property_unit}{" "}
                </Typography>
              </TableCell>
              {/* <TableCell>
                <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>${item[key] ? item[key] : 0}</Typography>
              </TableCell> */}
              <TableCell>
                <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
                  ${item["pur_amount_due"] ? parseFloat(item["pur_amount_due"]).toFixed(2) : 0.00}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
                  ${item["total_paid"] ? parseFloat(item["total_paid"]).toFixed(2) : 0.00}
                </Typography>
              </TableCell>
              {/* <TableCell align="right">
                <DeleteIcon />
              </TableCell> */}
            </TableRow>
          ) : (
            //   <>
            //   <Accordion
            //       sx={{
            //         backgroundColor: theme.palette.custom.pink,
            //         boxShadow: "none",
            //       }}
            //       key={category}
            //     >
            //       <AccordionSummary sx={{ flexDirection: "space-between" }} expandIcon={<ExpandMoreIcon />} onClick={(e) => e.stopPropagation()}>
            //         <TableRow key={index}>
            //           <TableCell>{item.purchase_uid}</TableCell>
            //           <TableCell>{item.pur_property_id}</TableCell>
            //           <TableCell>{item.pur_payer}</TableCell>
            //           <TableCell>
            //             <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
            //               {" "}
            //               {item.property_address} {item.property_unit}{" "}
            //             </Typography>
            //           </TableCell>
            //           <TableCell>{item.pur_notes}</TableCell>
            //           <TableCell>{item.pur_description}</TableCell>
            //           <TableCell>
            //             <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
            //               ${item["pur_amount_due"] ? item["pur_amount_due"] : 0}
            //             </Typography>
            //           </TableCell>
            //           <TableCell>
            //             <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
            //               ${item["total_paid"] ? item["total_paid"] : 0}
            //             </Typography>
            //           </TableCell>
            //           {/* <TableCell align="right">
            //             <EditIcon />
            //           </TableCell> */}
            //         </TableRow>
            //       </AccordionSummary>
            //       <AccordionDetails>
            //           {
            //             item?.property?.map( property => {
            //               return (
            //                 <TableRow>
            //                   <TableCell>
            //                     <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
            //                       {property.property_uid}
            //                     </Typography>
            //                   </TableCell>
            //                   <TableCell>
            //                     <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
            //                       {property.property_address}
            //                     </Typography>
            //                   </TableCell>
            //                   <TableCell>
            //                     <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
            //                       {property.property_unit}
            //                     </Typography>
            //                   </TableCell>
            //                   <TableCell>
            //                     <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
            //                       ${property.individual_purchase[0]?.pur_amount_due? property.individual_purchase[0]?.pur_amount_due : 0}
            //                     </Typography>
            //                   </TableCell>
            //                   <TableCell>
            //                     <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
            //                       ${property.individual_purchase[0]?.total_paid? property.individual_purchase[0]?.total_paid : 0}
            //                     </Typography>
            //                   </TableCell>

            //                 </TableRow>
            //               );
            //             })
            //           }
            //       </AccordionDetails>
            //     </Accordion>

            // </>
            <>
              <TableRow>
                <TableCell>
                  <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight, marginLeft: "25px" }}>Property UID</Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>Property Address</Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>Property Unit</Typography>
                </TableCell>
                <TableCell align='right'>
                  <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>Expected</Typography>
                </TableCell>
                <TableCell align='right'>
                  <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight, marginRight: "25px" }}>Actual</Typography>
                </TableCell>
              </TableRow>

              {item?.property?.map((property) => {
                return (
                  <TableRow sx={{}}>
                    <TableCell>
                      <Typography sx={{ fontSize: theme.typography.smallFont, marginLeft: "25px" }}>{property.property_uid}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: theme.typography.smallFont }}>{property.property_address}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: theme.typography.smallFont }}>{property.property_unit}</Typography>
                    </TableCell>
                    <TableCell align='right'>
                      <Typography sx={{ fontSize: theme.typography.smallFont }}>
                        ${property.individual_purchase[0]?.pur_amount_due ? property.individual_purchase[0]?.pur_amount_due : 0}
                      </Typography>
                    </TableCell>
                    <TableCell align='right'>
                      <Typography sx={{ fontSize: theme.typography.smallFont, marginRight: "25px" }}>
                        ${property.individual_purchase[0]?.total_paid ? property.individual_purchase[0]?.total_paid : 0}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </>
          );
        })}
      </>
    );
  }

  return (
    <>
      {activeView === "Cashflow" ? (
        <>
          {Object.entries(categoryTotalMapping).map(([category, value]) => {
            return (
              <Accordion
                sx={{
                  backgroundColor: theme.palette.custom.pink,
                  boxShadow: "none",
                }}
                key={category}
              >
                <AccordionSummary sx={{ flexDirection: "row-reverse" }} expandIcon={<ExpandMoreIcon />} onClick={(e) => e.stopPropagation()}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
                            {" "}
                            {category} {getCategoryCount(category)}{" "}
                          </Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>${value ? value : 0}</Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>${value ? value : 0}</Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                  </Table>
                </AccordionSummary>
                <AccordionDetails>
                  <Table>
                    <TableBody>{getCategoryItems(category, navigateType)}</TableBody>
                  </Table>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </>
      ) : (
        <>
          {Object.entries(categoryExpectedTotalMapping).map(([category, value]) => {
            return (
              <Accordion
                sx={{
                  backgroundColor: theme.palette.custom.pink,
                  boxShadow: "none",
                }}
                key={category}
              >
                <AccordionSummary sx={{ flexDirection: "space-between" }} expandIcon={<ExpandMoreIcon />} onClick={(e) => e.stopPropagation()}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: "150px" }}>
                          <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
                            {" "}
                            {category} {getCategoryCount(category)}{" "}
                          </Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight, width: "250px" }}>
                            ${value ? value : 0}
                          </Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
                            ${categoryTotalMapping[category] ? categoryTotalMapping[category] : 0}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                  </Table>
                </AccordionSummary>
                <AccordionDetails>
                  <Table>
                    <TableBody>{getCategoryItems(category)}</TableBody>
                  </Table>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </>
      )}
    </>
  );
}
