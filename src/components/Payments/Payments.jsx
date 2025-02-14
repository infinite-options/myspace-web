import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, ThemeProvider, Paper, Button, Typography, Stack, Grid, TextField, IconButton, Divider, Checkbox, Container } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import theme from "../../theme/theme";
import { alpha, makeStyles } from "@material-ui/core/styles";
// import axios, { all } from "axios";
import { useUser } from "../../contexts/UserContext";
import StripePayment from "../Settings/StripePayment";
import BackIcon from "./backIcon.png";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { DataGrid } from "@mui/x-data-grid";

import APIConfig from "../../utils/APIConfig";
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../utils/httpMiddleware";

import ManagerCashflowWidget from "../Dashboard-Components/Cashflow/ManagerCashflowWidget";
import AccountBalanceWidget from "./TenantAccountBalance";
import { AccountBalance } from "@mui/icons-material";
import useMediaQuery from "@mui/material/useMediaQuery";
import CircleIcon from "@mui/icons-material/Circle";
import documentIcon from "../../images/Subtract.png";

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
  //console.log("In Payments.jsx", props);
  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, getProfileId, roleName, selectedRole } = useUser();

  const managerCashflowWidgetData = location.state?.managerCashflowWidgetData;
  // const accountBalanceWidgetData = location.state?.accountBalanceWidgetData;
  const accountBalanceWidgetData = props?.accountBalanceWidgetData;
  // //console.log("managerCashflowWidgetData - ", managerCashflowWidgetData);

  // //console.log("selectedRole - ", selectedRole);

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
  //console.log("Profile Info: ", getProfileId());
  //console.log("Customer UID: ", customer_uid);
  //console.log("Customer Role: ", customer_role);
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

  useEffect(() => {
    fetchPaymentsData();
  }, []);

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

        <Container maxWidth='lg' sx={{ paddingTop: "10px", height: "90vh" }}>
          <Grid container spacing={6} sx={{ height: "90%" }}>
            {/* <Grid item xs={12} md={4}>
              {
                selectedRole === "MANAGER" && (
                  <ManagerCashflowWidget propsMonth={managerCashflowWidgetData?.propsMonth} propsYear={managerCashflowWidgetData?.propsYear} profitsTotal={managerCashflowWidgetData?.profitsTotal} rentsTotal={managerCashflowWidgetData?.rentsTotal} payoutsTotal={managerCashflowWidgetData?.payoutsTotal} graphData={managerCashflowWidgetData?.graphData}/>
                )
              }

              {
                selectedRole === "TENANT" && (
                  <AccountBalanceWidget selectedProperty={accountBalanceWidgetData?.selectedProperty} selectedLease={accountBalanceWidgetData?.selectedLease} propertyAddr={accountBalanceWidgetData?.propertyAddr} propertyData={accountBalanceWidgetData?.propertyData} total={accountBalanceWidgetData?.total} rentFees={accountBalanceWidgetData?.rentFees} lateFees={accountBalanceWidgetData?.lateFees} utilityFees={accountBalanceWidgetData?.utilityFees} />
                )
              }
              
            </Grid> */}

            <Grid container item xs={12} md={12} columnSpacing={6}>
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
                          onClick={() => {
                            // paymentData.business_code = paymentNotes;
                            const updatedPaymentData = { ...paymentData, business_code: paymentNotes };
                            // //console.log("In Payments.jsx and passing paymentData to SelectPayment.jsx: ", paymentData);
                            // //console.log("In Payments.jsx and passing paymentMethodInfo to SelectPayment.jsx: ", paymentMethodInfo);

                            // //console.log("navigating to SelectPayment.jsx - accountBalanceWidgetData -  ", accountBalanceWidgetData);
                            navigate("/selectPayment", {
                              state: {
                                paymentData: updatedPaymentData,
                                total: total,
                                selectedItems: selectedItems,
                                paymentMethodInfo: paymentMethodInfo,
                                managerCashflowWidgetData: managerCashflowWidgetData,
                                accountBalanceWidgetData: accountBalanceWidgetData,
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
            textAlign: "right",
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
            textAlign: "right",
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
            textAlign: "right",
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
            textAlign: "right",
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
            textAlign: "right",
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
            textAlign: "right",
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
            textAlign: "right",
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

//TENANT
