import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, ThemeProvider, Paper, Button, Typography, Stack, Grid, Container } from "@mui/material";
import theme from "../../theme/theme";
import { makeStyles } from "@material-ui/core/styles";
// import axios, { all } from "axios";
import { useUser } from "../../contexts/UserContext";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { DataGrid } from "@mui/x-data-grid";

import APIConfig from "../../utils/APIConfig";
import { id } from "date-fns/locale";
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../utils/httpMiddleware";

const useStyles = makeStyles((theme) => ({
  input: {
    background: "#000000",
  },
}));

const groupDataByKey = (data, key) => {
  // console.log("ROHIT - data - ", data);
  const groupedByKey = {};

  data?.forEach((payment) => {
    const dataKey = payment[key];
    if (!groupedByKey[dataKey]) {
      groupedByKey[dataKey] = [];
    }
    groupedByKey[dataKey].push(payment);
  });

  return groupedByKey;
};

export default function VerifyPayments2(props) {
  //   console.log("In VerifyPayments.jsx");

  const { user, getProfileId, roleName, selectedRole } = useUser();
  const navigate = useNavigate();
  const profileId = getProfileId();

  const [selectedProperty, setSelectedProperty] = useState(props.propertyID);
  const selectedPurchaserow = props.selectedPurchaseRow || "";

  const [moneyPayable, setMoneyPayable] = useState([]);
  const [dataByProperty, setDataByProperty] = useState([]);
  const [dataByPayer, setDataByPayer] = useState([]);
  const [dataByPaymentIntent, setDataByPaymentIntent] = useState([]);
  const [unpaidRentData, setUnpaidRentData] = useState([]);
  const [unpaidRentDataByProperty, setUnpaidRentDataByProperty] = useState([]);
  const [unpaidRentDataByPayer, setUnpaidRentDataByPayer] = useState([]);
  const [unpaidRentDataTotal, setUnpaidRentDataTotal] = useState({});

  const [showSpinner, setShowSpinner] = useState(false);
  const [paymentNotes, setPaymentNotes] = useState("");
  const [totalPayable, setTotalPayable] = useState(0);
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString("default", { month: "long" });
  const currentYear = currentDate.getFullYear().toString();

  const [month, setMonth] = useState(props.month || currentMonth);
  const [year, setYear] = useState(props.year || currentYear);

  const [paymentData, setPaymentData] = useState({
    currency: "usd",
    customer_uid: getProfileId(),
    business_code: paymentNotes,
    item_uid: "320-000054",
    balance: "0.0",
    purchase_uids: [],
  });

  const [selectedPayments, setSelectedPayments] = useState([]);

  const [sortBy, setSortBy] = useState("");
  const [tab, setTab] = useState("DEFAULT");
  const [unpaidRentTab, setUnpaidRentTab] = useState("Default");

  useEffect(() => {
    console.log("Payments", moneyPayable);
  }, [moneyPayable]);

  useEffect(() => {
    // console.log("ROHIT - 74 - selectedPayments - ", selectedPayments);
  }, [selectedPayments]);

  function totalMoneyPayable(moneyPayable) {
    // console.log("In totalMoneyPayable: ", moneyPayable);
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

  const fetchPaymentsData = async () => {
    console.log("In fetchPaymensData");
    setShowSpinner(true);
    try {
      const res = await axios.get(`${APIConfig.baseURL.dev}/paymentVerification/${getProfileId()}`);
      const moneyPayableData = res.data.result;
      console.log("Verfiy Payment GET Results: ", moneyPayableData);

      setMoneyPayable(moneyPayableData);
      totalMoneyPayable(moneyPayableData);
      const groupedByProperty = groupDataByKey(moneyPayableData, "pur_property_id");
      const groupedByPayer = groupDataByKey(moneyPayableData, "pur_payer");
      const groupedByPaymentIntent = groupDataByKey(moneyPayableData, "payment_intent");
      // console.log("ROHIT - groupedByProperty - ", groupedByProperty);
      // console.log("ROHIT - groupedByPayer - ", groupedByPayer);
      setDataByProperty(groupedByProperty);
      setDataByPayer(groupedByPayer);
      setDataByPaymentIntent(groupedByPaymentIntent);
    } catch (error) {
      console.error("Error fetching payment data:", error);
    }
    setShowSpinner(false);
  };

  const fetchTransactionsData = () => {
    // if(props.transactionsData){
    //   setCashflowData(props.transactionsData);
    // }
    if (props.transactionsData) {
      const profitDataCurrentYear = props.transactionsData?.filter((item) => item.cf_year === year);

      const revenueDataForManager = profitDataCurrentYear?.filter((item) => item.pur_payer === profileId || item.pur_receiver === profileId);

      const revenueDataForManagerByProperty = revenueDataForManager?.reduce((acc, item) => {
        const propertyUID = item.pur_property_id;
        const propertyInfo = {
          property_id: item.pur_property_id,
          property_address: item.property_address,
          property_unit: item.property_unit,
        };

        // const totalExpected = parseFloat(item.pur_amount_due) || 0;
        // const totalActual = parseFloat(item.total_paid) || 0;
        let totalExpected = 0;
        let totalActual = 0;

        if (item.cf_month === month && item.cf_year === year && item.purchase_type !== "Deposit") {
          if (item.pur_payer.startsWith("110")) {
            totalActual = parseFloat(item.total_paid) || 0;
            totalExpected = parseFloat(item.pur_amount_due ? item.pur_amount_due : 0.0) || 0;
          } else {
            totalActual = 0;
            totalExpected = 0;
          }

          // if (item.pur_payer.startsWith("600")) {
          //   totalExpected = -(parseFloat(item.pur_amount_due) || 0);
          // } else {
          //   totalExpected = parseFloat(item.pur_amount_due) || 0;
          // }
        }

        if (!acc[propertyUID]) {
          // acc[propertyUID] = [];
          acc[propertyUID] = {
            propertyInfo: propertyInfo,
            rentItems: [],
            totalExpected: 0,
            totalActual: 0,
          };
        }

        acc[propertyUID].rentItems.push(item);
        acc[propertyUID].totalExpected += totalExpected;
        acc[propertyUID].totalActual += totalActual;

        return acc;
      }, {});

      const revenueDataForManagerByPayer = revenueDataForManager?.reduce((acc, item) => {
        const payerUID = item.pur_payer;

        if (!payerUID.startsWith("350")) {
          return acc;
        }

        const payerInfo = {
          payer_id: item.pur_payer, // If there's any field for payer's name, you can update this
        };

        let totalExpected = 0;
        let totalActual = 0;

        if (item.cf_month === month && item.cf_year === year && item.purchase_type !== "Deposit") {
          if (item.pur_payer.startsWith("110")) {
            totalActual = parseFloat(item.total_paid) || 0;
            totalExpected = parseFloat(item.pur_amount_due ? item.pur_amount_due : 0.0) || 0;
          } else {
            totalActual = 0;
            totalExpected = 0;
          }
        }

        if (!acc[payerUID]) {
          acc[payerUID] = {
            payerInfo: payerInfo,
            rentItems: [],
            totalExpected: 0,
            totalActual: 0,
          };
        }

        acc[payerUID].rentItems.push(item);
        acc[payerUID].totalExpected += totalExpected;
        acc[payerUID].totalActual += totalActual;

        return acc;
      }, {});

      const filteredItems = revenueDataForManager?.filter(
        (item) => item.pur_payer.startsWith("350") && (item.payment_status === "UNPAID" || item.payment_status === "PARTIALLY PAID")
      );

      const totals = filteredItems?.reduce(
        (acc, item) => {
          acc.amt_remaining += parseFloat(item.pur_amount_due) || 0;
          acc.total_paid += parseFloat(item.total_paid) || 0;
          return acc;
        },
        { amt_remaining: 0, total_paid: 0 }
      );

      setUnpaidRentDataTotal(totals);

      setUnpaidRentData(revenueDataForManager);

      setUnpaidRentDataByProperty(revenueDataForManagerByProperty);

      setUnpaidRentDataByPayer(revenueDataForManagerByPayer);

      console.log(" ---- DEBUG ---- inside VerifyPayment2 page - ", totals);
    }
  };

  const handleViewPropertyClick = (e, property_uid) => {
    e.stopPropagation();
    navigate("/properties", { state: { currentProperty: property_uid } });
  };

  const handleTenantClick = (tenantId) => {
    if (selectedRole === "MANAGER" || selectedRole === "OWNER") {
      navigate("/ContactsPM", {
        state: {
          contactsTab: "Tenant",
          tenantId: tenantId,
        },
      });
    }
  };

  useEffect(() => {
    fetchPaymentsData();
    fetchTransactionsData();
  }, []);

  useEffect(() => {
    fetchTransactionsData();
  }, [props.transactionsData]);

  const commonStyles = {
    color: theme.typography.primary.black,
    fontWeight: theme.typography.light.fontWeight,
    fontSize: theme.typography.smallFont,
  };

  const newTransactionColumn = [
    {
      field: "payment_status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => <Box sx={commonStyles}>{params.row.payment_status !== null ? params.row.payment_status : "-"}</Box>,
      renderHeader: (params) => (
        <Box sx={{ fontSize: theme.typography.smallFont }}>
          <strong>{params.colDef.headerName}</strong>
        </Box>
      ),
    },
    {
      field: "purchase_type",
      headerName: "Type",
      flex: 0.8,
      renderCell: (params) => <Box sx={commonStyles}>{params.value}</Box>,
      renderHeader: (params) => (
        <Box sx={{ fontSize: theme.typography.smallFont }}>
          <strong>{params.colDef.headerName}</strong>
        </Box>
      ),
    },
    {
      field: "property_address",
      headerName: "Property",
      flex: 1.8,
      renderCell: (params) => (
        <Box sx={{ ...commonStyles, cursor: "pointer" }} onClick={(e) => handleViewPropertyClick(e, params.row.property_uid)}>
          {params.value}
        </Box>
      ),
      renderHeader: (params) => (
        <Box sx={{ fontSize: theme.typography.smallFont }}>
          <strong>{params.colDef.headerName}</strong>
        </Box>
      ),
    },
    {
      field: "purchase_payer",
      headerName: "Tenant Id",
      flex: 0.8,
      renderCell: (params) => (
        <Box sx={{ ...commonStyles, cursor: "pointer" }} onClick={(e) => handleTenantClick(params.row.purchase_payer)}>
          {params.value}
        </Box>
      ),
      renderHeader: (params) => (
        <Box sx={{ fontSize: theme.typography.smallFont }}>
          <strong>{params.colDef.headerName}</strong>
        </Box>
      ),
    },
    {
      field: "cf_month",
      headerName: "Month",
      flex: 0.7,
      renderCell: (params) => <Box sx={commonStyles}>{params.value}</Box>,
      renderHeader: (params) => (
        <Box sx={{ fontSize: theme.typography.smallFont }}>
          <strong>{params.colDef.headerName}</strong>
        </Box>
      ),
    },
    {
      field: "cf_year",
      headerName: "Year",
      flex: 0.5,
      renderCell: (params) => <Box sx={commonStyles}>{params.value}</Box>,
      renderHeader: (params) => (
        <Box sx={{ fontSize: theme.typography.smallFont }}>
          <strong>{params.colDef.headerName}</strong>
        </Box>
      ),
    },
    {
      field: "pur_due_date",
      headerName: "Pur Due Date",
      flex: 0.8,
      renderCell: (params) => (
        <Box sx={{ ...commonStyles, color: new Date(params.row.pur_due_date) < new Date() ? "red" : "green" }}>
          {params.row.purchase_due_date !== null ? (params.row.pur_due_date.includes(" ") ? params.row.pur_due_date.split(" ")[0] : params.row.pur_due_date) : "-"}
        </Box>
      ),
      renderHeader: (params) => (
        <Box sx={{ fontSize: theme.typography.smallFont }}>
          <strong>{params.colDef.headerName}</strong>
        </Box>
      ),
    },
    {
      field: "total_amount",
      headerName: "Total Amount Due",
      flex: 1,
      headerAlign: "right",
      renderCell: (params) => (
        <Box sx={commonStyles} textAlign={"right"} width={"100%"}>
          {parseFloat(params.value).toFixed(2)}
        </Box>
      ),
      renderHeader: (params) => (
        <Box sx={{ fontSize: theme.typography.smallFont }}>
          <strong>{params.colDef.headerName}</strong>
        </Box>
      ),
    },
    {
      field: "amount_received",
      headerName: "Amount Paid",
      flex: 1,
      headerAlign: "right",
      renderCell: (params) => (
        <Box sx={commonStyles} textAlign={"right"} width={"100%"}>
          {parseFloat(params.value).toFixed(2)}
        </Box>
      ),
      renderHeader: (params) => (
        <Box sx={{ fontSize: theme.typography.smallFont }}>
          <strong>{params.colDef.headerName}</strong>
        </Box>
      ),
    },
  ];

  const getNewRowWithIds = (data) => {
    // const revenueData = data?.filter((item) => item.pur_payer.startsWith("350"))

    const rowsId = data?.map((row, index) => ({
      ...row,
      id: row.index ? index : index,
    }));

    return rowsId;
  };

  const GetNewDataGrid = (data) => {
    const filteredData = data?.filter((item) => item.payment_status === "UNPAID" || item.payment_status === "PARTIALLY PAID");

    const groupedData = filteredData.reduce((acc, item) => {
      if (!acc[item.pur_group]) {
        acc[item.pur_group] = [];
      }
      acc[item.pur_group].push(item);
      return acc;
    }, {});

    // console.log("group data - ", groupedData, " for - ", data);

    const result = Object.keys(groupedData).reduce((acc, group) => {
      let expected = 0;
      let management_fee = 0;
      let other_expense = 0;

      // Check if all items in this group have 'payment_status' === "PAID"
      // const allPaid = groupedData[group].every(item => item.purchase_type === "Deposit");
      const has350Payer = groupedData[group].some((item) => item.pur_payer.startsWith("350"));

      // If all items are paid, skip this group
      // if (allPaid) {
      //   return acc;
      // }

      if (!has350Payer) {
        return acc;
      }

      let allTransactions = [];
      let purchase_ids = [];
      let purchase_group;
      let purchase_type;
      let purchase_due_date;
      let cf_month, cf_year;
      let payment_status;
      let amount_received, amount_remaining;
      let property_address;
      let purchase_payer;
      let total_amount;
      let property_uid;

      groupedData[group].forEach((item) => {
        const pur_type = item.purchase_type;
        const pur_payer = item.pur_payer;
        property_address = item.property_address;
        property_uid = item.pur_property_id;

        if (pur_payer.startsWith("350")) {
          amount_remaining = item.amt_remaining;
          amount_received = item.total_paid ? item.total_paid : 0.0;
          total_amount = item.pur_amount_due;
          purchase_payer = item.pur_payer;
          purchase_type = item.purchase_type;
          purchase_due_date = item.pur_due_date;
          cf_month = item.cf_month;
          cf_year = item.cf_year;
          payment_status = item.payment_status;

          if (item.payment_status === "PARTIALLY PAID") {
            expected += parseFloat(item.amt_remaining);
          } else {
            expected += parseFloat(item.pur_amount_due ? item.pur_amount_due : "0.00");
          }
        } else if (pur_payer.startsWith("110") && pur_type === "Management") {
          management_fee += parseFloat(item.pur_amount_due ? item.pur_amount_due : "0.00");
        } else if (pur_payer.startsWith("110") && pur_type !== "Management") {
          other_expense += parseFloat(item.pur_amount_due ? item.pur_amount_due : "0.00");
        }

        purchase_ids.push(item.purchase_uid);
        allTransactions.push(item);
        purchase_group = item.pur_group;
      });

      const owner_payment = parseFloat(expected - management_fee - other_expense);

      // Push the aggregated object for this group into the result if it passes the conditions
      acc.push({
        purchase_type: purchase_type,
        purchase_group,
        pur_due_date: purchase_due_date,
        payment_status,
        cf_month,
        cf_year,
        amount_received,
        amount_remaining,
        property_address,
        purchase_payer,
        total_amount,
        property_uid,
      });

      return acc;
    }, []);

    const rows = getNewRowWithIds(result);

    if (rows?.length > 0) {
      return (
        <DataGrid
          rows={rows}
          columns={newTransactionColumn}
          hideFooter={true}
          autoHeight
          rowHeight={35}
          sortModel={[
            {
              field: "pur_due_date",
              sort: "asc",
            },
          ]}
          sx={{
            marginTop: "10px",
            "& .MuiDataGrid-columnHeaders": {
              minHeight: "35px !important",
              maxHeight: "35px !important",
              height: 35,
            },
          }}
        />
      );
    } else {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "7px",
            width: "100%",
            height: "30px",
          }}
        >
          <Typography
            sx={{
              color: "#A9A9A9",
              fontWeight: theme.typography.primary.fontWeight,
              fontSize: "15px",
            }}
          >
            No Unpaid Rent
          </Typography>
        </Box>
      );
    }
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
                  width: "100%", // Take up full screen width
                  // marginTop: "20px", // Set the margin to 20px
                  marginBottom: "40px",
                  boxShadow: "none",
                }}
              >
                {/* for unpaid Rent */}
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
                      Unpaid Rent
                    </Typography>
                    <Button
                      sx={{
                        width: "150px",
                        backgroundColor: unpaidRentTab === "Default" ? "#3D5CAC" : "#9EAED6",
                        textTransform: "none",
                        "&:hover": {
                          backgroundColor: unpaidRentTab === "Default" ? "#3D5CAC" : "#9EAED6",
                        },
                      }}
                      onClick={() => {
                        setUnpaidRentTab("Default");
                      }}
                    >
                      <Typography sx={{ fontSize: "12px", fontWeight: "bold", color: "#160449" }}>Default</Typography>
                    </Button>
                    <Button
                      sx={{
                        width: "150px",
                        backgroundColor: unpaidRentTab === "By_Property" ? "#3D5CAC" : "#9EAED6",
                        textTransform: "none",
                        "&:hover": {
                          backgroundColor: unpaidRentTab === "By_Property" ? "#3D5CAC" : "#9EAED6",
                        },
                      }}
                      onClick={() => {
                        setUnpaidRentTab("By_Property");
                      }}
                    >
                      <Typography sx={{ fontSize: "12px", fontWeight: "bold", color: "#160449" }}>By Property</Typography>
                    </Button>
                    <Button
                      sx={{
                        width: "150px",
                        backgroundColor: unpaidRentTab === "By_Payer" ? "#3D5CAC" : "#9EAED6",
                        textTransform: "none",
                        "&:hover": {
                          backgroundColor: unpaidRentTab === "By_Payer" ? "#3D5CAC" : "#9EAED6",
                        },
                      }}
                      onClick={() => {
                        setUnpaidRentTab("By_Payer");
                      }}
                    >
                      <Typography sx={{ fontSize: "12px", fontWeight: "bold", color: "#160449" }}>By Payer</Typography>
                    </Button>
                    <Typography
                      sx={{ marginLeft: "20px", color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}
                    >
                      ${parseFloat(unpaidRentDataTotal.amt_remaining).toFixed(2)}
                    </Typography>
                    <Typography
                      sx={{ marginLeft: "20px", color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}
                    >
                      ${parseFloat(unpaidRentDataTotal.total_paid).toFixed(2)}
                    </Typography>
                  </Stack>

                  <Stack marginTop={"20px"}>
                    {unpaidRentTab === "Default" && GetNewDataGrid(unpaidRentData)}
                    {unpaidRentTab === "By_Property" &&
                      Object.values(unpaidRentDataByProperty)?.map((property) => (
                        <>
                          <br />
                          <Grid item xs={12}>
                            <Typography sx={{ fontWeight: "bold", color: "#160449" }}>Property ID: {property.propertyInfo.property_id}</Typography>
                          </Grid>
                          {GetNewDataGrid(property.rentItems)}
                          <br />
                        </>
                      ))}
                    {unpaidRentTab === "By_Payer" &&
                      Object.values(unpaidRentDataByPayer)?.map((payer) => (
                        <>
                          <br />
                          <Grid item xs={12}>
                            <Typography sx={{ fontWeight: "bold", color: "#160449" }}>Payer ID: {payer.payerInfo.payer_id}</Typography>
                          </Grid>
                          {GetNewDataGrid(payer.rentItems)}
                          <br />
                        </>
                      ))}
                  </Stack>
                </Paper>

                {/* for Verify Payments */}
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
                      Verify Payments 2
                    </Typography>
                    <Button
                      sx={{
                        width: "150px",
                        backgroundColor: tab === "DEFAULT" ? "#3D5CAC" : "#9EAED6",
                        textTransform: "none",
                        "&:hover": {
                          backgroundColor: tab === "DEFAULT" ? "#3D5CAC" : "#9EAED6",
                        },
                      }}
                      onClick={() => {
                        setSortBy("DEFAULT");
                        setTab("DEFAULT");
                      }}
                    >
                      <Typography sx={{ fontSize: "12px", fontWeight: "bold", color: "#160449" }}>Default</Typography>
                    </Button>
                    <Button
                      sx={{
                        width: "150px",
                        backgroundColor: tab === "BY_PROPERTY" ? "#3D5CAC" : "#9EAED6",
                        textTransform: "none",
                        "&:hover": {
                          backgroundColor: tab === "BY_PROPERTY" ? "#3D5CAC" : "#9EAED6",
                        },
                      }}
                      onClick={() => {
                        setSortBy("BY_PROPERTY");
                        setTab("BY_PROPERTY");
                      }}
                    >
                      <Typography sx={{ fontSize: "12px", fontWeight: "bold", color: "#160449" }}>By Property</Typography>
                    </Button>
                    <Button
                      sx={{
                        width: "150px",
                        backgroundColor: tab === "BY_PAYER" ? "#3D5CAC" : "#9EAED6",
                        textTransform: "none",
                        "&:hover": {
                          backgroundColor: tab === "BY_PAYER" ? "#3D5CAC" : "#9EAED6",
                        },
                      }}
                      onClick={() => {
                        setSortBy("BY_PAYER");
                        setTab("BY_PAYER");
                      }}
                    >
                      <Typography sx={{ fontSize: "12px", fontWeight: "bold", color: "#160449" }}>By Payer</Typography>
                    </Button>
                    <Button
                      sx={{
                        width: "150px",
                        backgroundColor: tab === "BY_PAYMENT_INTENT" ? "#3D5CAC" : "#9EAED6",
                        textTransform: "none",
                        "&:hover": {
                          backgroundColor: tab === "BY_PAYMENT_INTENT" ? "#3D5CAC" : "#9EAED6",
                        },
                      }}
                      onClick={() => {
                        setSortBy("BY_PAYMENT_INTENT");
                        setTab("BY_PAYMENT_INTENT");
                      }}
                    >
                      <Typography sx={{ fontSize: "12px", fontWeight: "bold", color: "#160449" }}>By Payment Intent</Typography>
                    </Button>
                    <Typography
                      sx={{ marginLeft: "20px", color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}
                    >
                      ${totalPayable.toFixed(2)}
                    </Typography>
                  </Stack>

                  <Stack marginTop={"20px"}>
                    {tab === "DEFAULT" && (
                      <BalanceDetailsTable
                        data={moneyPayable}
                        selectedPurchaseRow={selectedPurchaserow}
                        setPaymentData={setPaymentData}
                        setSelectedPayments={setSelectedPayments}
                        fetchPaymentsData={fetchPaymentsData}
                        selectedProperty={selectedProperty}
                        sortBy={sortBy}
                      />
                    )}
                    {tab === "BY_PROPERTY" &&
                      Object.values(dataByProperty)?.map((propertyPayments) => (
                        <>
                          <br />
                          <Grid item xs={12}>
                            <Typography sx={{ fontWeight: "bold", color: "#160449" }}>Property ID: {propertyPayments[0].pur_property_id}</Typography>
                          </Grid>
                          <BalanceDetailsTable
                            data={propertyPayments}
                            selectedPurchaseRow={selectedPurchaserow}
                            setPaymentData={setPaymentData}
                            setSelectedPayments={setSelectedPayments}
                            fetchPaymentsData={fetchPaymentsData}
                            selectedProperty={selectedProperty}
                            sortBy={sortBy}
                          />
                          <br />
                        </>
                      ))}
                    {tab === "BY_PAYER" &&
                      Object.values(dataByPayer)?.map((paymentItems) => (
                        <>
                          <br />
                          <Grid item xs={12}>
                            <Typography sx={{ fontWeight: "bold", color: "#160449" }}>Payer ID: {paymentItems[0].pur_payer}</Typography>
                          </Grid>
                          <BalanceDetailsTable
                            data={paymentItems}
                            selectedPurchaseRow={selectedPurchaserow}
                            setPaymentData={setPaymentData}
                            setSelectedPayments={setSelectedPayments}
                            fetchPaymentsData={fetchPaymentsData}
                            selectedProperty={selectedProperty}
                            sortBy={sortBy}
                          />
                          <br />
                        </>
                      ))}
                    {tab === "BY_PAYMENT_INTENT" &&
                      Object.values(dataByPaymentIntent)?.map((paymentItems) => (
                        <>
                          <br />
                          <Grid item xs={12}>
                            <Typography sx={{ fontWeight: "bold", color: "#160449" }}>Payment Intent: {paymentItems[0].payment_intent}</Typography>
                          </Grid>
                          <BalanceDetailsTable
                            data={paymentItems}
                            selectedPurchaseRow={selectedPurchaserow}
                            setPaymentData={setPaymentData}
                            setSelectedPayments={setSelectedPayments}
                            fetchPaymentsData={fetchPaymentsData}
                            selectedProperty={selectedProperty}
                            sortBy={sortBy}
                          />
                          <br />
                        </>
                      ))}
                  </Stack>
                </Paper>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </ThemeProvider>
    </>
  );
}

function BalanceDetailsTable(props) {
  // console.log("In BalanceDetailTable", props);
  const [data, setData] = useState(props.data);
  const selectedPurchaseGroup = props.selectedPurchaseRow || "";
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [paymentDueResult, setPaymentDueResult] = useState([]);

  const [totalVerified, setTotalVerified] = useState(0);

  const defaultSortModel = [
    {
      field: "pur_property_id",
      sort: "asc",
    },
  ];

  const byPropertySortModel = [
    {
      field: "pur_property_id",
      sort: "asc",
    },
  ];

  const byPayerSortModel = [
    {
      field: "paid_by",
      sort: "asc",
    },
  ];

  const [sortModel, setSortModel] = useState([
    {
      field: "payment_uid",
      sort: "asc",
    },
  ]);

  const commonStyles = {
    color: theme.typography.primary.black,
    fontWeight: theme.typography.light.fontWeight,
    fontSize: theme.typography.smallFont,
  };

  // useEffect(() => {
  //   console.log("selectedPayments - ", selectedPayments);
  // }, [selectedPayments]);

  useEffect(() => {
    setData(props.data);
  }, [props.data]);

  useEffect(() => {
    props.setSelectedPayments((prevState) => {
      const updatedPaymentData = prevState?.filter((payment) => selectedPayments.some((selected) => selected.id === payment.id));

      const newPayments = selectedPayments.filter((selected) => !updatedPaymentData.some((payment) => payment.id === selected.id));
      return [...updatedPaymentData, ...newPayments];
    });
  }, [selectedPayments]);

  useEffect(() => {
    if (props.sortBy) {
      switch (props.sortBy) {
        case "BY_PROPERTY":
          setSortModel(byPropertySortModel);
          break;
        case "BY_PAYER":
          setSortModel(byPayerSortModel);
          break;
        default:
          setSortModel(defaultSortModel);
          break;
      }
    }
  }, [props.sortBy]);

  useEffect(() => {
    if (data && data.length > 0) {
      setSelectedPayments(data);
      let filteredRows = [];
      if (props.selectedProperty != null) {
        filteredRows = data?.filter((item) => item.pur_property_id === props.selectedProperty);
      } else {
        filteredRows = data;
      }

      if (selectedPurchaseGroup && selectedPurchaseGroup !== "") {
        setSelectedRows(filteredRows.filter((row) => row.pur_group === selectedPurchaseGroup).map((row) => row.payment_uid));
      } else {
        setSelectedRows(filteredRows.map((row) => row.payment_uid));
      }

      setPaymentDueResult(
        data.map((item) => ({
          ...item,
          pur_amount_due: parseFloat(item.pur_amount_due).toFixed(2),
          total_paid: parseFloat(item.total_paid).toFixed(2),
          pay_amount : parseFloat(item.pay_amount).toFixed(2)

        }))
      );
    }
  }, [data]);

  useEffect(() => {
    // console.log("selectedRows - ", selectedRows);
    const total = selectedRows?.reduce((total, rowId) => {
      const payment = paymentDueResult.find((row) => row.payment_uid === rowId);
      // console.log("payment - ", payment);
      if (payment) {
        const payAmount = parseFloat(payment.pay_amount);
        // const isExpense = payment.pur_cf_type === "expense";

        // Adjust the total based on whether the payment is an expense or revenue
        return total + payAmount;
      } else {
        return total + 0;
      }
    }, 0);
    setTotalVerified(total);
  }, [selectedRows]);

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
      field: "total_paid",
      headerName: "Total Paid",
      flex: 3,
      renderCell: (params) => <Box sx={{ ...commonStyles, textAlign: "right", width: "100%"}}>{params.value}</Box>,
      renderHeader: (params) => (
        <Box sx={{ fontSize: theme.typography.smallFont }}>
          <strong>{params.colDef.headerName}</strong>
        </Box>
      ),
    },
    {
      field: "payment_intent",
      headerName: "Payment Intent",
      flex: 3,
      renderCell: (params) => <Box sx={{ ...commonStyles }}>{params.value}</Box>,
      renderHeader: (params) => (
        <Box sx={{ fontSize: theme.typography.smallFont }}>
          <strong>{params.colDef.headerName}</strong>
        </Box>
      ),
    },
    {
      field: "payment_uid",
      headerName: "Payment UID",
      flex: 3,
      renderCell: (params) => <Box sx={{ ...commonStyles }}>{params.value}</Box>,
      renderHeader: (params) => (
        <Box sx={{ fontSize: theme.typography.smallFont }}>
          <strong>{params.colDef.headerName}</strong>
        </Box>
      ),
    },
    {
      field: "paid_by",
      headerName: "Paid By",
      flex: 3,
      renderCell: (params) => <Box sx={{ ...commonStyles }}>{params.value}</Box>,
      renderHeader: (params) => (
        <Box sx={{ fontSize: theme.typography.smallFont }}>
          <strong>{params.colDef.headerName}</strong>
        </Box>
      ),
    },
    {
      field: "payment_date",
      headerName: "Payment Date",
      flex: 3,
      renderCell: (params) => <Box sx={{ ...commonStyles }}>{params.value}</Box>,
      renderHeader: (params) => (
        <Box sx={{ fontSize: theme.typography.smallFont }}>
          <strong>{params.colDef.headerName}</strong>
        </Box>
      ),
    },
    {
      field: "purchase_uid",
      headerName: "Pur UID",
      flex: 2.5,
      renderCell: (params) => <Box sx={{ ...commonStyles }}>{params.value}</Box>,
      renderHeader: (params) => (
        <Box sx={{ fontSize: theme.typography.smallFont }}>
          <strong>{params.colDef.headerName}</strong>
        </Box>
      ),
    },
    {
      field: "pur_group",
      headerName: "Pur Group",
      flex: 2.5,
      renderCell: (params) => <Box sx={{ ...commonStyles }}>{params.value}</Box>,
      renderHeader: (params) => (
        <Box sx={{ fontSize: theme.typography.smallFont }}>
          <strong>{params.colDef.headerName}</strong>
        </Box>
      ),
    },
    {
      field: "pur_property_id",
      headerName: "Property UID",
      flex: 3,
      renderCell: (params) => <Box sx={{ ...commonStyles }}>{params.value}</Box>,
      renderHeader: (params) => (
        <Box sx={{ fontSize: theme.typography.smallFont }}>
          <strong>{params.colDef.headerName}</strong>
        </Box>
      ),
    },
    {
      field: "purchase_type",
      headerName: "Purchase Type",
      flex: 2,
      renderCell: (params) => <Box sx={{ ...commonStyles }}>{params.value}</Box>,
      renderHeader: (params) => (
        <Box sx={{ fontSize: theme.typography.smallFont }}>
          <strong>{params.colDef.headerName}</strong>
        </Box>
      ),
    },
    {
      field: "pur_description",
      headerName: "Description",
      flex: 2,
      renderCell: (params) => <Box sx={{ ...commonStyles }}>{params.value}</Box>,
      renderHeader: (params) => (
        <Box sx={{ fontSize: theme.typography.smallFont }}>
          <strong>{params.colDef.headerName}</strong>
        </Box>
      ),
    },
    // {
    //   field: "pur_notes",
    //   headerName: "Notes",
    //   flex: 2,
    //   renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    // },
    // {
    //   field: "payment_date",
    //   headerName: "Payment Date",
    //   flex: 2,
    //   renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    // },
    // {
    //   field: "paid_by",
    //   headerName: "Paid By",
    //   flex: 2,
    //   renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    // },
    {
      field: "payment_method",
      headerName: "Payment Method",
      flex: 2,
      renderCell: (params) => <Box sx={{ ...commonStyles }}>{params.value}</Box>,
      renderHeader: (params) => (
        <Box sx={{ fontSize: theme.typography.smallFont }}>
          <strong>{params.colDef.headerName}</strong>
        </Box>
      ),
    },
    {
      field: "pur_amount_due",
      headerName: "Amount Due",
      flex: 2.5,
      renderCell: (params) => <Box sx={{ ...commonStyles, textAlign: "right", width: "100%" }}>{params.value}</Box>,
      renderHeader: (params) => (
        <Box sx={{ fontSize: theme.typography.smallFont }}>
          <strong>{params.colDef.headerName}</strong>
        </Box>
      ),
    },
    {
      field: "pay_amount",
      headerName: "Pay Amount",
      flex: 2,
      renderCell: (params) => <Box sx={{ ...commonStyles, textAlign: "right", width: "100%" }}>{params.value}</Box>,
      renderHeader: (params) => (
        <Box sx={{ fontSize: theme.typography.smallFont }}>
          <strong>{params.colDef.headerName}</strong>
        </Box>
      ),
    },
    // {
    //     field: "payment_verify",
    //     headerName: "Payment Verify",
    //     flex: 2,
    //     renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    // },
    // {
    //     field: "pur_group",
    //     headerName: "Purchase Group",
    //     flex: 2,
    //     renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    // },
    // {
    //     field: "pur_leaseFees_id",
    //     headerName: "Purchase leaseFees ID",
    //     flex: 2,
    //     renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    // },
    // {
    //     field: "pur_bill_id",
    //     headerName: "Purchase Bill ID",
    //     flex: 2,
    //     renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    // },
  ];

  const handleSelectionModelChange = (newRowSelectionModel) => {
    // console.log("newRowSelectionModel - ", newRowSelectionModel);

    const addedRows = newRowSelectionModel.filter((rowId) => !selectedRows.includes(rowId));
    const removedRows = selectedRows.filter((rowId) => !newRowSelectionModel.includes(rowId));

    // console.log("ROHIT - addedRows - ", addedRows);

    let updatedRowSelectionModel = [...newRowSelectionModel];

    if (addedRows.length > 0) {
      // console.log("Added rows: ", addedRows);
      let newPayments = [];

      addedRows.forEach((item, index) => {
        // console.log("item - ", item);
        // const addedPayment = paymentDueResult.find((row) => row.purchase_uid === addedRows[index]);
        const addedPayment = paymentDueResult.find((row) => row.payment_uid === item);

        if (addedPayment) {
          // const relatedPayments = paymentDueResult.filter((row) => row.payment_intent === addedPayment.payment_intent);
          const relatedPayments = paymentDueResult.filter(
            (row) => row.paid_by + row.payment_date + row.payment_intent === addedPayment.paid_by + addedPayment.payment_date + addedPayment.payment_intent
          );

          newPayments = [...newPayments, ...relatedPayments];
          const relatedRowIds = relatedPayments.map((payment) => payment.payment_uid);
          updatedRowSelectionModel = [...new Set([...updatedRowSelectionModel, ...relatedRowIds])];
        }
      });

      // console.log("newPayments - ", newPayments);
      setSelectedPayments((prevState) => {
        return [...prevState, ...newPayments];
      });
    }

    if (removedRows.length > 0) {
      // console.log("Removed rows: ", removedRows);
      let removedPayments = [];
      let relatedRows = [];

      removedRows.forEach((item, index) => {
        let removedPayment = paymentDueResult.find((row) => row.payment_uid === item);
        let relatedPayments = [];

        if (removedPayment) {
          relatedPayments = paymentDueResult.filter(
            (row) => row.paid_by + row.payment_date + row.payment_intent === removedPayment.paid_by + removedPayment.payment_date + removedPayment.payment_intent
          );
          relatedRows = relatedPayments.map((payment) => payment.payment_uid);
        }

        removedPayments.push(removedPayment);
        removedPayments.push(relatedPayments);
      });
      const allRowRemove = [...new Set([...removedRows, ...relatedRows])];

      updatedRowSelectionModel = updatedRowSelectionModel.filter((payment) => !allRowRemove.includes(payment));
      // console.log("removedPayments - ", removedPayments);
      setSelectedPayments((prevState) => prevState.filter((payment) => !allRowRemove.includes(payment.payment_uid)));
    }
    // setSelectedRows(newRowSelectionModel);
    setSelectedRows(updatedRowSelectionModel);
  };

  const handleVerifyPayments = async () => {
    // console.log("In handleVerifyPayments");

    // console.log("selectedPayments - ", selectedPayments);
    const formData = new FormData();
    const verifiedList = selectedPayments?.map((payment) => payment.payment_uid);
    // console.log("verifiedList - ", verifiedList);
    formData.append("payment_uid", JSON.stringify(verifiedList));
    formData.append("payment_verify", "Verified");

    // return;

    try {
      const response = await fetch(`${APIConfig.baseURL.dev}/paymentVerification`, {
        method: "PUT",
        body: formData,
      });

      const responseData = await response.json();
      console.log(responseData);
      if (response.status === 200) {
        console.log("successfuly verified selected payments");
      } else {
        console.error("Could not update verification for selected payments ");
      }
    } catch (error) {
      console.log("error", error);
    }
    props.fetchPaymentsData();
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
          sx={{
            marginTop: "10px",
          }}
          getRowId={(row) => row.payment_uid}
          // getRowId={(row) => {
          //   const rowId = row.payment_uid;
          //   // console.log("Hello Globe");
          //   // console.log("Row ID:", rowId);
          //   // console.log("Row Data:", row); // Log the entire row data
          //   // console.log("Row PS:", row.ps); // Log the ps field
          //   return rowId;
          // }}
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
          sortModel={sortModel}

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
              Total Verified
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
              {/* $ {selectedRows.reduce((total, rowId) => total + paymentDueResult.find((row) => row.purchase_uid === rowId).pur_amount_due, 0)} */}$ {totalVerified?.toFixed(2)}
            </Typography>
          </Grid>
        </Grid>
        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} alignItems='center' sx={{ paddingTop: "15px" }}>
          <Grid item xs={6} sx={{ display: "flex", flexDirection: "row", justifyContent: "center" }}></Grid>
          <Grid item xs={6} sx={{ display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
            <Button
              variant='outlined'
              id='complete_verification'
              // className={classes.button}
              sx={{
                // height: "100%",
                width: "60%",
                backgroundColor: "#3D5CAC",
                color: "#FFFFFF",
                fontSize: "15px",
                fontWeight: "bold",
                textTransform: "none",
                marginBottom: "10px",
                borderRadius: "5px",
                "&:hover": {
                  backgroundColor: "#160449",
                },
              }}
              // sx={{

              // }}
              onClick={(e) => {
                //   e.stopPropagation();
                handleVerifyPayments();
              }}
            >
              Complete Verification
            </Button>
          </Grid>
        </Grid>
      </>
    );
  } else {
    return <></>;
  }
}
