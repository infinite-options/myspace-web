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
  Tooltip,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { DataGrid } from "@mui/x-data-grid";
// import HomeWorkIcon from "@mui/icons-material/HomeWork";
import CloseIcon from "@mui/icons-material/Close";
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
// import Backdrop from "@mui/material/Backdrop";
// import DeleteIcon from "@mui/icons-material/Delete";
// import EditIcon from "@mui/icons-material/Edit";
// import CircularProgress from "@mui/material/CircularProgress";
import "../../css/selectMonth.css";
import { isGridCellRoot } from "@mui/x-data-grid/utils/domUtils";
import VerificationStatus from "../PM_Emp_Dashboard/Waiting_Page";

const ManagerProfitability = ({
  propsMonth,
  propsYear,
  profitsTotal,
  profits,
  rentsTotal,
  rentsByProperty,
  payoutsTotal,
  payouts,
  setMonth,
  setYear,
  profitsCurrentYear,
  profitsTotalCurrentYear,
  rentsTotalCurrentYear,
  rentsByPropertyCurrentYear,
  payoutsCurrentYear,
  payoutsTotalCurrentYear,
}) => {
  const { user, getProfileId, selectedRole } = useUser();
  const navigate = useNavigate();
  const [activeButton, setActiveButton] = useState("Cashflow");

  const [showSelectMonth, setShowSelectMonth] = useState(false);
  const [openSelectProperty, setOpenSelectProperty] = useState(false);
  const [profitsExpanded, setProfitsExpanded] = useState(true);
  const [revenueExpanded, setRevenueExpanded] = useState(true);
  const [expenseExpanded, setExpenseExpanded] = useState(true);
  const [tab, setTab] = useState("by_property");

  const handleSelectTab = (tab_name) => {
    setTab(tab_name);
  };

  // const pastTwelveMonths = [
  //   {
  //     month: "January",
  //     year: "2023",
  //     expected_profit: 2000,
  //     profit: 1800,
  //     expected_rent: 5000,
  //     rent: 4800,
  //     expected_payouts: 3000,
  //     payouts: 3000,
  //     monthYear: "Jan 23",
  //   },
  //   {
  //     month: "February",
  //     year: "2023",
  //     expected_profit: 1500,
  //     profit: 1400,
  //     expected_rent: 4500,
  //     rent: 4300,
  //     expected_payouts: 3000,
  //     payouts: 2900,
  //     monthYear: "Feb 23",
  //   },
  //   {
  //     month: "March",
  //     year: "2023",
  //     expected_profit: 2200,
  //     profit: 2100,
  //     expected_rent: 5200,
  //     rent: 5100,
  //     expected_payouts: 3000,
  //     payouts: 3000,
  //     monthYear: "Mar 23",
  //   },
  //   {
  //     month: "April",
  //     year: "2023",
  //     expected_profit: 2400,
  //     profit: 2300,
  //     expected_rent: 5500,
  //     rent: 5300,
  //     expected_payouts: 3100,
  //     payouts: 3000,
  //     monthYear: "Apr 23",
  //   },
  //   {
  //     month: "May",
  //     year: "2023",
  //     expected_profit: 1800,
  //     profit: 1600,
  //     expected_rent: 5000,
  //     rent: 4700,
  //     expected_payouts: 3200,
  //     payouts: 3100,
  //     monthYear: "May 23",
  //   },
  //   {
  //     month: "June",
  //     year: "2023",
  //     expected_profit: 1900,
  //     profit: 1800,
  //     expected_rent: 5100,
  //     rent: 4900,
  //     expected_payouts: 3200,
  //     payouts: 3100,
  //     monthYear: "Jun 23",
  //   },
  //   {
  //     month: "July",
  //     year: "2023",
  //     expected_profit: 2100,
  //     profit: 2000,
  //     expected_rent: 5300,
  //     rent: 5100,
  //     expected_payouts: 3200,
  //     payouts: 3100,
  //     monthYear: "Jul 23",
  //   },
  //   {
  //     month: "August",
  //     year: "2023",
  //     expected_profit: 2300,
  //     profit: 2200,
  //     expected_rent: 5400,
  //     rent: 5200,
  //     expected_payouts: 3200,
  //     payouts: 3000,
  //     monthYear: "Aug 23",
  //   },
  //   {
  //     month: "September",
  //     year: "2023",
  //     expected_profit: 1700,
  //     profit: 1600,
  //     expected_rent: 5000,
  //     rent: 4700,
  //     expected_payouts: 3300,
  //     payouts: 3100,
  //     monthYear: "Sep 23",
  //   },
  //   {
  //     month: "October",
  //     year: "2023",
  //     expected_profit: 2500,
  //     profit: 2400,
  //     expected_rent: 5600,
  //     rent: 5400,
  //     expected_payouts: 3100,
  //     payouts: 3000,
  //     monthYear: "Oct 23",
  //   },
  //   {
  //     month: "November",
  //     year: "2023",
  //     expected_profit: 2000,
  //     profit: 1900,
  //     expected_rent: 5100,
  //     rent: 4900,
  //     expected_payouts: 3100,
  //     payouts: 3000,
  //     monthYear: "Nov 23",
  //   },
  //   {
  //     month: "December",
  //     year: "2023",
  //     expected_profit: 2200,
  //     profit: 2100,
  //     expected_rent: 5200,
  //     rent: 5100,
  //     expected_payouts: 3000,
  //     payouts: 3000,
  //     monthYear: "Dec 23",
  //   },
  // ];

  const month = propsMonth || "July"; //fix
  const year = propsYear || "2024";

  const handleViewPropertyClick = (e, property_uid) => {
    e.stopPropagation();
    navigate("/propertiesPM", { state: { currentProperty: property_uid } });
  };

  const getVerificationForManagerPayment = (pur) => {
    const actual = pur.actual? parseFloat(pur.actual) : 0;
    let expected = pur.expected? parseFloat(pur.expected) : 0;
    if (expected < 0){
      expected *= -1;
    } 

    if (actual < expected){
      return "manager";
    } else if( actual > expected){
      return "investigate";
    } else if (actual === expected){
      return "-"
    }
  };

  const getVerificationForOwnerPayment = (pur) => {
    const actual = pur.actual? parseFloat(pur.actual) : 0;
    const expected = pur.expected? parseFloat(pur.expected) : 0;
    if (actual < expected){
      return "owner";
    } else if( actual > expected){
      return "investigate";
    } else if (actual === expected){
      return "-"
    }
  };

  const getVerificationForTenantPayment = ( pur ) => {
    const actual = pur.actual? parseFloat(pur.actual) : 0;
    const expected = pur.expected? parseFloat(pur.expected) : 0;
    if (actual < expected){
      return "tenant";
    } else if( actual > expected){
      return "investigate";
    } else if (actual === expected){
      if( pur.verified){
        if(pur.verified === "verified"){
          return "verified"
        }        
      }
      return "not verified";      
    }

  };

  const getVerificationStatus = (purchase) => {
    // console.log("getVerificationStatus - purchase - ", purchase);
    if(purchase.pur_payer?.startsWith("600")){
      return getVerificationForManagerPayment(purchase);
    } else if(purchase.pur_payer?.startsWith("110")){
      return getVerificationForOwnerPayment(purchase);
    } else if(purchase.pur_payer?.startsWith("350")){
      return getVerificationForTenantPayment(purchase);
    } else{
      return "invalid payer";
    }
  }

  const getVerificationStatusColor = (status) => {
    switch(status){
      case "owner":
        return "#0000CC";
        break;
      case "manager":
        return "#0000CC";
        break;
      case "tenant":
        return "#FF0000";
        break;
      case "verified":
        return "#43A843";
        break;
      case "not verified":
        return "#FF8000";
        break;
      default:
        return "#000000";
        break;
    }

  }

  const transactionCoulmn = [
    {
      field: "purchase_type",
      headerName: "Purchase Type",
      flex: 1.5,
      renderCell: (params) => <span>{params.row.purchase_type !== null ? params.row.purchase_type : "-"}</span>,
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
    },
    // {
    //   field: "purchase_ids",
    //   headerName: "Purchase Ids",
    //   flex: 2,
    //   renderCell: (params) => (
    //     <Tooltip title={params.row.purchase_ids !== null ? JSON.parse(params.row.purchase_ids).join(", ") : "-"}>
    //       <Typography
    //         sx={{
    //           whiteSpace: "nowrap",
    //           overflow: "hidden",
    //           textOverflow: "ellipsis",
    //           maxWidth: "100%",
    //         }}
    //       >
    //         {params.row.purchase_ids !== null ? JSON.parse(params.row.purchase_ids).join(", ") : "-"}
    //       </Typography>
    //     </Tooltip>
    //   ),
    //   renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
    // },
    {
      field: "pur_group",
      headerName: "Purchase Group",
      flex: 1.5,
      renderCell: (params) => (
        <Tooltip title={params.row.pur_group !== null ? params.row.pur_group : "-"}>
          <Typography
            sx={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "100%",
            }}
          >
            {params.row.pur_group !== null ? params.row.pur_group : "-"}
          </Typography>
        </Tooltip>
      ),
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
    },
    {
      field: "pur_payer",
      headerName: "Payer",
      flex: 1.5,
      renderCell: (params) => (
        <Tooltip title={params.row.pur_payer !== null ? params.row.pur_payer : "-"}>
          <Typography
            sx={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "100%",
            }}
          >
            {params.row.pur_payer !== null ? params.row.pur_payer : "-"}
          </Typography>
        </Tooltip>
      ),
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
    },
    {
      field: "pur_receiver",
      headerName: "Receiver",
      flex: 1.5,
      renderCell: (params) => (
        <Tooltip title={params.row.pur_receiver !== null ? params.row.pur_receiver : "-"}>
          <Typography
            sx={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "100%",
            }}
          >
            {params.row.pur_receiver !== null ? params.row.pur_receiver : "-"}
          </Typography>
        </Tooltip>
      ),
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
    },
    {
      field: "verified",
      headerName: "Verified",
      flex: 1.5,
      renderCell: (params) => {
        const verificationStatus = getVerificationStatus(params.row);
        const fontColor = getVerificationStatusColor(verificationStatus);
        return (
          <Tooltip title={params.row.verified !== null ? params.row.verified : "-"}>
            <Typography
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "100%",
                color: fontColor
              }}
            >
              {/* {params.row.verified !== null ? params.row.verified : "-"} */}
              {verificationStatus}
            </Typography>
          </Tooltip>
      )},
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
    },
    {
      field: "expected",
      headerName: "Expected",
      flex: 1,
      renderCell: (params) => <span>$ {params.row.expected !== null ? parseFloat(params.row.expected).toFixed(2) : parseFloat(0).toFixed(2)}</span>,
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
    },
    {
      field: "actual",
      headerName: "Actual",
      flex: 1,
      renderCell: (params) => (
        <span style={{ textAlign: "right", display: "block" }}>$ {params.row.actual !== null ? parseFloat(params.row.actual).toFixed(2) : parseFloat(0).toFixed(2)}</span>
      ),
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
    },
  ];

  const getRowWithIds = (data) => {
    const rowsId = data?.map((row, index) => ({
      ...row,
      id: row.id ? index : index,
    }));

    return rowsId;
  };

  const getDataGrid = (data) => {
    const rows = getRowWithIds(data);

    return (
      <DataGrid
        rows={rows}
        columns={transactionCoulmn}
        hideFooter={true}
        autoHeight
        rowHeight={35}
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
  };

  return (
    <>
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
          <Stack direction='row' justifyContent='center'>
            <Typography sx={{ color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}>
              {month} {year} Profitability
            </Typography>
          </Stack>

          {/* Select month and all owner button */}
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

          {/* Filter buttons */}
          <Grid container item xs={12} marginTop={15} marginBottom={5}>
            <Grid container item xs={8} display={"flex"} direction={"row"}>
              <Grid container justifyContent='center' item xs={3} marginRight={15}>
                <Button
                  sx={{
                    width: "150px",
                    backgroundColor: tab === "by_property" ? "#3D5CAC" : "#9EAED6",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: tab === "by_property" ? "#3D5CAC" : "#9EAED6",
                    },
                  }}
                  onClick={() => handleSelectTab("by_property")}
                >
                  <Typography sx={{ fontSize: "12px", fontWeight: "bold", color: "#160449" }}>By Property</Typography>
                </Button>
              </Grid>
              <Grid container justifyContent='center' item xs={3}>
                <Button
                  sx={{
                    width: "200px",
                    backgroundColor: tab === "by_month" ? "#3D5CAC" : "#9EAED6",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: tab === "by_month" ? "#3D5CAC" : "#9EAED6",
                    },
                  }}
                  onClick={() => handleSelectTab("by_month")}
                >
                  <Typography sx={{ fontSize: "12px", fontWeight: "bold", color: "#160449" }}>By Month</Typography>
                </Button>
              </Grid>
            </Grid>
            <Grid container justifyContent='flex-end' item xs={2}>
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

          {tab === "by_property" && (
            <>
              <Accordion
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  boxShadow: "none",
                }}
                expanded={profitsExpanded}
                onChange={() => {
                  setProfitsExpanded((prevState) => !prevState);
                }}
              >
                {/* This is Revenue Bar underneath the Yellow Expected Cashflow box */}
                <Grid container item xs={12}>
                  <Grid container justifyContent='flex-start' item xs={8}>
                    <Grid container direction='row' alignContent='center' sx={{ height: "35px" }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>{month} Profit</Typography>
                      </AccordionSummary>
                    </Grid>
                  </Grid>
                  {/* <Box display="flex" justifyContent="flex-start" alignItems="center" sx={{ width: '200px',}}> */}
                  <Grid container alignContent='center' justifyContent='flex-end' item xs={2}>
                    <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>
                      ${profitsTotal && profitsTotal?.totalExpectedProfit ? profitsTotal?.totalExpectedProfit?.toFixed(2) : "0.00"}
                    </Typography>
                  </Grid>
                  <Grid container alignContent='center' justifyContent='flex-end' item xs={2}>
                    <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>
                      ${profitsTotal && profitsTotal?.totalActualProfit ? profitsTotal?.totalActualProfit?.toFixed(2) : "0.00"}
                    </Typography>
                  </Grid>
                </Grid>

                <AccordionDetails>
                  {profits &&
                    Object.keys(profits)?.map((propertyUID, index) => {
                      const property = profits[propertyUID];
                      console.log("property - ", property);
                      return (
                        <>
                          <Accordion
                            sx={{
                              backgroundColor: theme.palette.primary.main,
                              boxShadow: "none",
                            }}
                            key={index}
                          >
                            <Grid container item xs={12}>
                              <Grid container justifyContent='flex-start' item xs={8}>
                                <Grid container direction='row' alignContent='center' sx={{ height: "35px" }}>
                                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight }}>
                                      {`${property?.propertyInfo?.property_address}`} {property?.propertyInfo?.property_unit && ", Unit - "}
                                      {property?.propertyInfo?.property_unit && property?.propertyInfo?.property_unit}
                                    </Typography>
                                    <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight, marginLeft: 10 }}>
                                      {`${property?.propertyInfo?.property_id}`}
                                    </Typography>
                                    <Button
                                      sx={{
                                        padding: "0px",
                                        marginLeft: "10px",
                                        color: "#160449",
                                        "&:hover": {
                                          color: "#FFFFFF",
                                        },
                                      }}
                                      onClick={(e) => handleViewPropertyClick(e, property?.propertyInfo?.property_id)}
                                    >
                                      <Typography sx={{ fontWeight: theme.typography.common.fontWeight, textTransform: "none" }}>View</Typography>
                                    </Button>
                                  </AccordionSummary>
                                </Grid>
                              </Grid>
                              <Grid container alignContent='center' justifyContent='flex-end' item xs={2}>
                                <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight }}>
                                  ${property?.expectedProfit ? property?.expectedProfit?.toFixed(2) : "0.00"}
                                </Typography>
                              </Grid>
                              <Grid container alignContent='center' justifyContent='flex-end' item xs={2}>
                                <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight }}>
                                  ${property?.actualProfit ? property?.actualProfit?.toFixed(2) : "0.00"}
                                </Typography>
                              </Grid>
                            </Grid>

                            <AccordionDetails>
                              <Grid container item xs={12}>
                                {
                                  getDataGrid(property?.profitItems)

                                  // property?.profitItems?.map( (item, index) => {
                                  //     return (
                                  //         <Grid item container xs={12} key={index}>
                                  //             <Grid item xs={8}>{item.purchase_type} __ {JSON.parse(item.purchase_ids).join(", ")}</Grid>
                                  //             <Grid container  justifyContent='flex-end' item xs={2}><Typography>${item.expected? item.expected : parseFloat(0).toFixed(2)}</Typography></Grid>
                                  //             <Grid container  justifyContent='flex-end' item xs={2}><Typography>${item.actual? item.actual : parseFloat(0).toFixed(2)}</Typography></Grid>
                                  //             {/* <Grid item xs={2}>{item.pur_cf_type}</Grid> */}
                                  //         </Grid>

                                  //     );
                                  // })
                                }
                              </Grid>
                            </AccordionDetails>
                          </Accordion>
                        </>
                      );
                    })}
                </AccordionDetails>
              </Accordion>

              <Accordion
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  boxShadow: "none",
                }}
                expanded={revenueExpanded}
                onChange={() => {
                  setRevenueExpanded((prevState) => !prevState);
                }}
              >
                <Grid container item xs={12}>
                  <Grid container justifyContent='flex-start' item xs={8}>
                    <Grid container direction='row' alignContent='center' sx={{ height: "35px" }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>{month} Revenue</Typography>
                      </AccordionSummary>
                    </Grid>
                  </Grid>
                  <Grid container alignContent='center' justifyContent='flex-end' item xs={2}>
                    <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>
                      ${rentsTotal && rentsTotal?.totalExpected ? rentsTotal?.totalExpected?.toFixed(2) : "0.00"}
                    </Typography>
                  </Grid>
                  <Grid container alignContent='center' justifyContent='flex-end' item xs={2}>
                    <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>
                      ${rentsTotal && rentsTotal?.totalActual ? rentsTotal?.totalActual?.toFixed(2) : "0.00"}
                    </Typography>
                  </Grid>
                </Grid>

                <AccordionDetails>
                  {/* <RevenueTable totalRevenueByType={revenueByType} expectedRevenueByType={expectedRevenueByType} revenueList={revenueList} activeView={activeButton}/>             */}
                  {/* <StatementTable
                    categoryTotalMapping={revenueByType}
                    allItems={revenueList}
                    activeView={"ExpectedCashflow"}
                    tableType="Revenue"
                    categoryExpectedTotalMapping={expectedRevenueByType}
                    month={month}
                    year={year}
                  /> */}
                  {rentsByProperty &&
                    Object.keys(rentsByProperty)?.map((propertyUID, index) => {
                      const property = rentsByProperty[propertyUID];
                      return (
                        <>
                          <Accordion
                            sx={{
                              backgroundColor: theme.palette.primary.main,
                              boxShadow: "none",
                            }}
                          >
                            <Grid container item xs={12}>
                              <Grid container justifyContent='flex-start' item xs={8}>
                                <Grid container direction='row' alignContent='center' sx={{ height: "35px" }}>
                                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight }}>
                                      {`${property?.propertyInfo?.property_address},`} {property?.propertyInfo?.property_unit && "Unit - "}
                                      {property?.propertyInfo?.property_unit && property?.propertyInfo?.property_unit}
                                    </Typography>
                                    <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight, marginLeft: 10 }}>
                                      {`${property?.propertyInfo?.property_id}`}
                                    </Typography>
                                  </AccordionSummary>
                                </Grid>
                              </Grid>

                              <Grid container alignContent='center' justifyContent='flex-end' item xs={2}>
                                <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight }}>
                                  ${property?.totalExpected ? property?.totalExpected?.toFixed(2) : "0.00"}
                                </Typography>
                              </Grid>
                              <Grid container alignContent='center' justifyContent='flex-end' item xs={2}>
                                <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight }}>
                                  ${property?.totalActual ? property?.totalActual?.toFixed(2) : "0.00"}
                                </Typography>
                              </Grid>
                            </Grid>

                            <AccordionDetails>
                              <Grid container item xs={12}>
                                {
                                  getDataGrid(property?.rentItems)

                                  // property?.rentItems?.map( (item, index) => {
                                  //     return (
                                  //         <Grid item container xs={12} key={index}>
                                  //             <Grid item xs={8}>{item.purchase_type} __ {JSON.parse(item.purchase_ids).join(", ")}</Grid>
                                  //             <Grid container justifyContent='flex-end' item xs={2}>${item.expected? item.expected : parseFloat(0).toFixed(2)}</Grid>
                                  //             <Grid container justifyContent='flex-end' item xs={2}>${item.actual? item.actual : parseFloat(0).toFixed(2)}</Grid>
                                  //             {/* <Grid item xs={2}>{item.pur_cf_type}</Grid> */}
                                  //         </Grid>

                                  //     );
                                  // })
                                }
                              </Grid>
                            </AccordionDetails>
                          </Accordion>
                        </>
                      );
                    })}
                </AccordionDetails>
              </Accordion>

              <Accordion
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  boxShadow: "none",
                }}
                expanded={expenseExpanded}
                onChange={() => {
                  setExpenseExpanded((prevState) => !prevState);
                }}
              >
                <Grid container item xs={12}>
                  <Grid container justifyContent='flex-start' item xs={8}>
                    <Grid container direction='row' alignContent='center' sx={{ height: "35px" }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>{month} Expense</Typography>
                      </AccordionSummary>
                    </Grid>
                  </Grid>
                  <Grid container alignContent='center' justifyContent='flex-end' item xs={2}>
                    <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>
                      ${payoutsTotal && payoutsTotal?.totalExpected ? payoutsTotal?.totalExpected?.toFixed(2) : "0.00"}
                    </Typography>
                  </Grid>
                  <Grid container alignContent='center' justifyContent='flex-end' item xs={2}>
                    <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>
                      ${payoutsTotal && payoutsTotal?.totalActual ? payoutsTotal?.totalActual?.toFixed(2) : "0.00"}
                    </Typography>
                  </Grid>
                </Grid>

                <AccordionDetails>
                  {payouts &&
                    Object.keys(payouts)?.map((propertyUID, index) => {
                      const property = payouts[propertyUID];
                      return (
                        <>
                          <Accordion
                            sx={{
                              backgroundColor: theme.palette.primary.main,
                              boxShadow: "none",
                            }}
                            key={index}
                          >
                            <Grid container item xs={12}>
                              <Grid container justifyContent='flex-start' item xs={8}>
                                <Grid container direction='row' alignContent='center' sx={{ height: "35px" }}>
                                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight }}>
                                      {`${property?.propertyInfo?.property_address},`} {property?.propertyInfo?.property_unit && "Unit - "}
                                      {property?.propertyInfo?.property_unit && property?.propertyInfo?.property_unit}
                                    </Typography>
                                    <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight, marginLeft: 10 }}>
                                      {`${property?.propertyInfo?.property_id}`}
                                    </Typography>
                                  </AccordionSummary>
                                </Grid>
                              </Grid>
                              <Grid container alignContent='center' justifyContent='flex-end' item xs={2}>
                                <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight }}>
                                  ${property?.totalExpected ? property?.totalExpected?.toFixed(2) : "0.00"}
                                </Typography>
                              </Grid>
                              <Grid container alignContent='center' justifyContent='flex-end' item xs={2}>
                                <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight }}>
                                  ${property?.totalActual ? property?.totalActual?.toFixed(2) : "0.00"}
                                </Typography>
                              </Grid>
                            </Grid>

                            <AccordionDetails>
                              <Grid container item xs={12}>
                                {
                                  getDataGrid(property?.payoutItems)
                                  // property?.payoutItems?.map( (item, index) => {
                                  //     return (
                                  //         <Grid item container xs={12} key={index}>
                                  //             <Grid item xs={8}>{item.purchase_type} __ {JSON.parse(item.purchase_ids).join(", ")}</Grid>
                                  //             <Grid container justifyContent='flex-end' item xs={2}>${item.expected? item.expected : parseFloat(0).toFixed(2)}</Grid>
                                  //             <Grid container justifyContent='flex-end' item xs={2}>${item.actual? item.actual : parseFloat(0).toFixed(2)}</Grid>
                                  //             {/* <Grid item xs={2}>{item.pur_cf_type}</Grid> */}
                                  //         </Grid>

                                  //     );
                                  // })
                                }
                              </Grid>
                            </AccordionDetails>
                          </Accordion>
                        </>
                      );
                    })}
                </AccordionDetails>
              </Accordion>
            </>
          )}

          {tab === "by_month" && (
            <>
              <Accordion
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  boxShadow: "none",
                }}
                expanded={profitsExpanded}
                onChange={() => setProfitsExpanded((prevState) => !prevState)}
              >
                {/* Header of the Profit Accordion */}
                <Grid container item xs={12}>
                  <Grid container justifyContent='flex-start' item xs={8}>
                    <Grid container direction='row' alignContent='center' sx={{ height: "35px" }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>Profits</Typography>
                      </AccordionSummary>
                    </Grid>
                  </Grid>
                  <Grid container alignContent='center' justifyContent='flex-end' item xs={2}>
                    <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>
                      $ {profitsTotalCurrentYear?.totalExpectedProfit ? profitsTotalCurrentYear.totalExpectedProfit.toFixed(2) : "0.00"}
                    </Typography>
                  </Grid>
                  <Grid container alignContent='center' justifyContent='flex-end' item xs={2}>
                    <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>
                      $ {profitsTotalCurrentYear?.totalActualProfit ? profitsTotalCurrentYear.totalActualProfit.toFixed(2) : "0.00"}
                    </Typography>
                  </Grid>
                </Grid>

                {/* All Monthly Accordions inside the Profit Accordion */}
                <AccordionDetails>
                  {profitsCurrentYear &&
                    Object.keys(profitsCurrentYear).map((month, monthIndex) => {
                      const monthData = profitsCurrentYear[month];
                      return (
                        <Accordion
                          key={monthIndex}
                          sx={{
                            backgroundColor: theme.palette.primary.main,
                            boxShadow: "none",
                          }}
                          // expanded={expandedMonth === monthIndex}
                          // onChange={() => setExpandedMonth(expandedMonth === monthIndex ? null : monthIndex)}
                        >
                          {/* Header for each Month Accordion */}
                          <Grid container item xs={12}>
                            <Grid container justifyContent='flex-start' item xs={8}>
                              <Grid container direction='row' alignContent='center' sx={{ height: "35px" }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                  <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight }}>{monthData.month}</Typography>
                                </AccordionSummary>
                              </Grid>
                            </Grid>
                            <Grid container alignContent='center' justifyContent='flex-end' item xs={2}>
                              <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight }}>
                                $ {monthData.totalExpectedProfit ? monthData.totalExpectedProfit.toFixed(2) : "0.00"}
                              </Typography>
                            </Grid>
                            <Grid container alignContent='center' justifyContent='flex-end' item xs={2}>
                              <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight }}>
                                $ {monthData.totalActualProfit ? monthData.totalActualProfit.toFixed(2) : "0.00"}
                              </Typography>
                            </Grid>
                          </Grid>

                          {/* Property Accordions inside each Month Accordion */}
                          <AccordionDetails>
                            {monthData?.properties &&
                              Object.keys(monthData.properties).map((propertyUID, propertyIndex) => {
                                const property = monthData.properties[propertyUID];
                                return (
                                  <Accordion
                                    key={propertyIndex}
                                    sx={{
                                      backgroundColor: theme.palette.primary.main,
                                      boxShadow: "none",
                                    }}
                                    // expanded={expandedProperty === propertyUID}
                                    // onChange={() => setExpandedProperty(expandedProperty === propertyUID ? null : propertyUID)}
                                  >
                                    {/* Header for Property Accordion */}
                                    <Grid container item xs={12}>
                                      <Grid container justifyContent='flex-start' item xs={8}>
                                        <Grid container direction='row' alignContent='center' sx={{ height: "35px" }}>
                                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>
                                              {`${property?.propertyInfo?.property_address}, `}
                                              {property?.propertyInfo?.property_unit && `Unit - ${property?.propertyInfo?.property_unit}`}
                                            </Typography>
                                            <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight, marginLeft: 10 }}>
                                              {`${property?.propertyInfo?.property_id}`}
                                            </Typography>
                                            <Button
                                              sx={{
                                                padding: "0px",
                                                marginLeft: "10px",
                                                color: "#160449",
                                                "&:hover": {
                                                  color: "#FFFFFF",
                                                },
                                              }}
                                              onClick={(e) => handleViewPropertyClick(e, property?.propertyInfo?.property_id)}
                                            >
                                              <Typography sx={{ fontWeight: theme.typography.common.fontWeight, textTransform: "none" }}>View</Typography>
                                            </Button>
                                          </AccordionSummary>
                                        </Grid>
                                      </Grid>
                                      <Grid container alignContent='center' justifyContent='flex-end' item xs={2}>
                                        <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>
                                          $ {property?.expectedProfit ? property?.expectedProfit.toFixed(2) : "0.00"}
                                        </Typography>
                                      </Grid>
                                      <Grid container alignContent='center' justifyContent='flex-end' item xs={2}>
                                        <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>
                                          $ {property?.actualProfit ? property?.actualProfit.toFixed(2) : "0.00"}
                                        </Typography>
                                      </Grid>
                                    </Grid>

                                    {/* Profit Items inside each Property Accordion */}
                                    <AccordionDetails>
                                      <Grid container item xs={12}>
                                        {
                                          getDataGrid(property?.profitItems)
                                          // property?.profitItems?.map( (item, index) => {
                                          //     return (
                                          //         <Grid item container xs={12} key={index}>
                                          //             <Grid item xs={8}>{item.purchase_type} __ {JSON.parse(item.purchase_ids).join(", ")}</Grid>
                                          //             <Grid container  justifyContent='flex-end' item xs={2}><Typography>${item.expected? item.expected : parseFloat(0).toFixed(2)}</Typography></Grid>
                                          //             <Grid container  justifyContent='flex-end' item xs={2}><Typography>${item.actual? item.actual : parseFloat(0).toFixed(2)}</Typography></Grid>
                                          //             {/* <Grid item xs={2}>{item.pur_cf_type}</Grid> */}
                                          //         </Grid>

                                          //     );
                                          // })
                                        }
                                      </Grid>
                                    </AccordionDetails>
                                  </Accordion>
                                );
                              })}
                          </AccordionDetails>
                        </Accordion>
                      );
                    })}
                </AccordionDetails>
              </Accordion>

              <Accordion
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  boxShadow: "none",
                }}
                expanded={revenueExpanded}
                onChange={() => setRevenueExpanded((prevState) => !prevState)}
              >
                {/* Header of the Profit Accordion */}
                <Grid container item xs={12}>
                  <Grid container justifyContent='flex-start' item xs={8}>
                    <Grid container direction='row' alignContent='center' sx={{ height: "35px" }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>Revenue</Typography>
                      </AccordionSummary>
                    </Grid>
                  </Grid>
                  <Grid container alignContent='center' justifyContent='flex-end' item xs={2}>
                    <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>
                      $ {rentsTotalCurrentYear?.totalExpected ? rentsTotalCurrentYear.totalExpected.toFixed(2) : "0.00"}
                    </Typography>
                  </Grid>
                  <Grid container alignContent='center' justifyContent='flex-end' item xs={2}>
                    <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>
                      $ {rentsTotalCurrentYear?.totalActual ? rentsTotalCurrentYear.totalActual.toFixed(2) : "0.00"}
                    </Typography>
                  </Grid>
                </Grid>

                {/* All Monthly Accordions inside the Profit Accordion */}
                <AccordionDetails>
                  {rentsByPropertyCurrentYear &&
                    Object.keys(rentsByPropertyCurrentYear).map((month, monthIndex) => {
                      const monthData = rentsByPropertyCurrentYear[month];
                      return (
                        <Accordion
                          key={monthIndex}
                          sx={{
                            backgroundColor: theme.palette.primary.main,
                            boxShadow: "none",
                          }}
                          // expanded={expandedMonth === monthIndex}
                          // onChange={() => setExpandedMonth(expandedMonth === monthIndex ? null : monthIndex)}
                        >
                          {/* Header for each Month Accordion */}
                          <Grid container item xs={12}>
                            <Grid container justifyContent='flex-start' item xs={8}>
                              <Grid container direction='row' alignContent='center' sx={{ height: "35px" }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                  <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight }}>{monthData.month}</Typography>
                                </AccordionSummary>
                              </Grid>
                            </Grid>
                            <Grid container alignContent='center' justifyContent='flex-end' item xs={2}>
                              <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight }}>
                                $ {monthData.totalExpectedProfit ? monthData.totalExpectedProfit.toFixed(2) : "0.00"}
                              </Typography>
                            </Grid>
                            <Grid container alignContent='center' justifyContent='flex-end' item xs={2}>
                              <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight }}>
                                $ {monthData.totalActualProfit ? monthData.totalActualProfit.toFixed(2) : "0.00"}
                              </Typography>
                            </Grid>
                          </Grid>

                          {/* Property Accordions inside each Month Accordion */}
                          <AccordionDetails>
                            {monthData?.properties &&
                              Object.keys(monthData.properties).map((propertyUID, propertyIndex) => {
                                const property = monthData.properties[propertyUID];
                                return (
                                  <Accordion
                                    key={propertyIndex}
                                    sx={{
                                      backgroundColor: theme.palette.primary.main,
                                      boxShadow: "none",
                                    }}
                                    // expanded={expandedProperty === propertyUID}
                                    // onChange={() => setExpandedProperty(expandedProperty === propertyUID ? null : propertyUID)}
                                  >
                                    {/* Header for Property Accordion */}
                                    <Grid container item xs={12}>
                                      <Grid container justifyContent='flex-start' item xs={8}>
                                        <Grid container direction='row' alignContent='center' sx={{ height: "35px" }}>
                                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>
                                              {`${property?.propertyInfo?.property_address}, `}
                                              {property?.propertyInfo?.property_unit && `Unit - ${property?.propertyInfo?.property_unit}`}
                                            </Typography>
                                            <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight, marginLeft: 10 }}>
                                              {`${property?.propertyInfo?.property_id}`}
                                            </Typography>
                                            <Button
                                              sx={{
                                                padding: "0px",
                                                marginLeft: "10px",
                                                color: "#160449",
                                                "&:hover": {
                                                  color: "#FFFFFF",
                                                },
                                              }}
                                              onClick={(e) => handleViewPropertyClick(e, property?.propertyInfo?.property_id)}
                                            >
                                              <Typography sx={{ fontWeight: theme.typography.common.fontWeight, textTransform: "none" }}>View</Typography>
                                            </Button>
                                          </AccordionSummary>
                                        </Grid>
                                      </Grid>
                                      <Grid container alignContent='center' justifyContent='flex-end' item xs={2}>
                                        <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>
                                          $ {property?.expectedProfit ? property?.expectedProfit.toFixed(2) : "0.00"}
                                        </Typography>
                                      </Grid>
                                      <Grid container alignContent='center' justifyContent='flex-end' item xs={2}>
                                        <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>
                                          $ {property?.actualProfit ? property?.actualProfit.toFixed(2) : "0.00"}
                                        </Typography>
                                      </Grid>
                                    </Grid>

                                    {/* Profit Items inside each Property Accordion */}
                                    <AccordionDetails>
                                      <Grid container item xs={12}>
                                        {
                                          getDataGrid(property?.profitItems)
                                          // property?.profitItems?.map( (item, index) => {
                                          //     return (
                                          //         <Grid item container xs={12} key={index}>
                                          //             <Grid item xs={8}>{item.purchase_type} __ {JSON.parse(item.purchase_ids).join(", ")}</Grid>
                                          //             <Grid container  justifyContent='flex-end' item xs={2}><Typography>${item.expected? item.expected : parseFloat(0).toFixed(2)}</Typography></Grid>
                                          //             <Grid container  justifyContent='flex-end' item xs={2}><Typography>${item.actual? item.actual : parseFloat(0).toFixed(2)}</Typography></Grid>
                                          //             {/* <Grid item xs={2}>{item.pur_cf_type}</Grid> */}
                                          //         </Grid>

                                          //     );
                                          // })
                                        }
                                      </Grid>
                                    </AccordionDetails>
                                  </Accordion>
                                );
                              })}
                          </AccordionDetails>
                        </Accordion>
                      );
                    })}
                </AccordionDetails>
              </Accordion>

              <Accordion
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  boxShadow: "none",
                }}
                expanded={expenseExpanded}
                onChange={() => setExpenseExpanded((prevState) => !prevState)}
              >
                {/* Header of the Profit Accordion */}
                <Grid container item xs={12}>
                  <Grid container justifyContent='flex-start' item xs={8}>
                    <Grid container direction='row' alignContent='center' sx={{ height: "35px" }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>Expense</Typography>
                      </AccordionSummary>
                    </Grid>
                  </Grid>
                  <Grid container alignContent='center' justifyContent='flex-end' item xs={2}>
                    <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>
                      $ {payoutsTotalCurrentYear?.totalExpected ? payoutsTotalCurrentYear.totalExpected.toFixed(2) : "0.00"}
                    </Typography>
                  </Grid>
                  <Grid container alignContent='center' justifyContent='flex-end' item xs={2}>
                    <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>
                      $ {payoutsTotalCurrentYear?.totalActual ? payoutsTotalCurrentYear.totalActual.toFixed(2) : "0.00"}
                    </Typography>
                  </Grid>
                </Grid>

                {/* All Monthly Accordions inside the Profit Accordion */}
                <AccordionDetails>
                  {payoutsCurrentYear &&
                    Object.keys(payoutsCurrentYear).map((month, monthIndex) => {
                      const monthData = payoutsCurrentYear[month];
                      return (
                        <Accordion
                          key={monthIndex}
                          sx={{
                            backgroundColor: theme.palette.primary.main,
                            boxShadow: "none",
                          }}
                          // expanded={expandedMonth === monthIndex}
                          // onChange={() => setExpandedMonth(expandedMonth === monthIndex ? null : monthIndex)}
                        >
                          {/* Header for each Month Accordion */}
                          <Grid container item xs={12}>
                            <Grid container justifyContent='flex-start' item xs={8}>
                              <Grid container direction='row' alignContent='center' sx={{ height: "35px" }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                  <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight }}>{monthData.month}</Typography>
                                </AccordionSummary>
                              </Grid>
                            </Grid>
                            <Grid container alignContent='center' justifyContent='flex-end' item xs={2}>
                              <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight }}>
                                $ {monthData.totalExpectedProfit ? monthData.totalExpectedProfit.toFixed(2) : "0.00"}
                              </Typography>
                            </Grid>
                            <Grid container alignContent='center' justifyContent='flex-end' item xs={2}>
                              <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight }}>
                                $ {monthData.totalActualProfit ? monthData.totalActualProfit.toFixed(2) : "0.00"}
                              </Typography>
                            </Grid>
                          </Grid>

                          {/* Property Accordions inside each Month Accordion */}
                          <AccordionDetails>
                            {monthData?.properties &&
                              Object.keys(monthData.properties).map((propertyUID, propertyIndex) => {
                                const property = monthData.properties[propertyUID];
                                return (
                                  <Accordion
                                    key={propertyIndex}
                                    sx={{
                                      backgroundColor: theme.palette.primary.main,
                                      boxShadow: "none",
                                    }}
                                    // expanded={expandedProperty === propertyUID}
                                    // onChange={() => setExpandedProperty(expandedProperty === propertyUID ? null : propertyUID)}
                                  >
                                    {/* Header for Property Accordion */}
                                    <Grid container item xs={12}>
                                      <Grid container justifyContent='flex-start' item xs={8}>
                                        <Grid container direction='row' alignContent='center' sx={{ height: "35px" }}>
                                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>
                                              {`${property?.propertyInfo?.property_address}, `}
                                              {property?.propertyInfo?.property_unit && `Unit - ${property?.propertyInfo?.property_unit}`}
                                            </Typography>
                                            <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight, marginLeft: 10 }}>
                                              {`${property?.propertyInfo?.property_id}`}
                                            </Typography>
                                            <Button
                                              sx={{
                                                padding: "0px",
                                                marginLeft: "10px",
                                                color: "#160449",
                                                "&:hover": {
                                                  color: "#FFFFFF",
                                                },
                                              }}
                                              onClick={(e) => handleViewPropertyClick(e, property?.propertyInfo?.property_id)}
                                            >
                                              <Typography sx={{ fontWeight: theme.typography.common.fontWeight, textTransform: "none" }}>View</Typography>
                                            </Button>
                                          </AccordionSummary>
                                        </Grid>
                                      </Grid>
                                      <Grid container alignContent='center' justifyContent='flex-end' item xs={2}>
                                        <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>
                                          $ {property?.expectedProfit ? property?.expectedProfit.toFixed(2) : "0.00"}
                                        </Typography>
                                      </Grid>
                                      <Grid container alignContent='center' justifyContent='flex-end' item xs={2}>
                                        <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>
                                          $ {property?.actualProfit ? property?.actualProfit.toFixed(2) : "0.00"}
                                        </Typography>
                                      </Grid>
                                    </Grid>

                                    {/* Profit Items inside each Property Accordion */}
                                    <AccordionDetails>
                                      <Grid container item xs={12}>
                                        {/* need table */}
                                        {
                                          getDataGrid(property?.profitItems)
                                          /* {property?.profitItems?.map( (item, index) => {
                                        return (
                                            <Grid item container xs={12} key={index}>
                                                <Grid item xs={8}>{item.purchase_type} __ {JSON.parse(item.purchase_ids).join(", ")}</Grid>
                                                <Grid container  justifyContent='flex-end' item xs={2}><Typography>${item.expected? item.expected : parseFloat(0).toFixed(2)}</Typography></Grid>
                                                <Grid container  justifyContent='flex-end' item xs={2}><Typography>${item.actual? item.actual : parseFloat(0).toFixed(2)}</Typography></Grid> */
                                        }
                                        {/* <Grid item xs={2}>{item.pur_cf_type}</Grid> */}
                                        {/* </Grid>

                                        );
                                    })} */}
                                      </Grid>
                                    </AccordionDetails>
                                  </Accordion>
                                );
                              })}
                          </AccordionDetails>
                        </Accordion>
                      );
                    })}
                </AccordionDetails>
              </Accordion>
            </>
          )}
        </Paper>
      </Box>
    </>
  );
};

function SelectMonthComponentTest(props) {
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
              <Typography className={props.selectedMonth === month ? "selected" : "unselected"} key={index} onClick={() => props.setMonth(month)}>
                {month}
              </Typography>
            );
          })}
        </Box>
        <Box>
          <Typography className={props.selectedYear === lastYear.toString() ? "selected" : "unselected"} onClick={() => props.setYear(lastYear.toString())}>
            {lastYear}
          </Typography>
          <Typography className={props.selectedYear === currentYear.toString() ? "selected" : "unselected"} onClick={() => props.setYear(currentYear.toString())}>
            {currentYear}
          </Typography>
          <Typography className={props.selectedYear === nextYear.toString() ? "selected" : "unselected"} onClick={() => props.setYear(nextYear.toString())}>
            {nextYear}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default ManagerProfitability;
