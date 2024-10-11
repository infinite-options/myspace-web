import React, { useEffect, useState, useMemo  } from "react";
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
import APIConfig from "../../utils/APIConfig";
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
  cashFlowData,
  cashFlowtotal,
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
  revenueByType,
  expenseByType,
  expectedExpenseByType,
  expectedRevenueByType,
  revenueList,
  expenseList,
  revenueByMonthByType,
  expenseByMonthByType,
  getTotalValueByTypeMapping,
  getExpectedTotalByTypeMapping,
  allProfitDataItems,
  getSortedExpectedTotalByMapping,
  getSortedTotalValueByMapping,
  totalDeposit,
  totalDepositByProperty,
  revenueDataForManager,
  selectedProperty,
  fecthPaymentVerification,
  totalRevenueData
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
  const [headerTab, setHeaderTab] = useState("current_month");
  const [ total, setTotal] = useState();
  const [paymentNotes, setPaymentNotes] = useState("");
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
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedPayments, setSelectedPayments] = useState([]);

  const [sortBy, setSortBy] = useState("");

  const handleSelectTab = (tab_name) => {
    setTab(tab_name);
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const month = propsMonth || "July"; //fix
  const year = propsYear || "2024";
  const date = new Date();
  const currentMonth = monthNames[date.getMonth()];
  const currentYear = date.getFullYear();

  const handleViewPropertyClick = (e, property_uid) => {
    e.stopPropagation();
    navigate("/properties", { state: { currentProperty: property_uid } });
  };

  const getVerificationForManagerPayment = (pur) => {
    const total_paid = pur.total_paid ? parseFloat(pur.total_paid) : 0;
    let pur_amount_due = pur.pur_amount_due ? parseFloat(pur.pur_amount_due) : 0;
    if (pur_amount_due < 0) {
      pur_amount_due *= -1;
    }

    if (total_paid < pur_amount_due) {
      return "manager";
    } else if (total_paid > pur_amount_due) {
      return "investigate";
    } else if (total_paid === pur_amount_due) {
      return "-";
    }
  };

  const getVerificationForOwnerPayment = (pur) => {
    const total_paid = pur.total_paid ? parseFloat(pur.total_paid) : 0;
    const pur_amount_due = pur.pur_amount_due ? parseFloat(pur.pur_amount_due) : 0;
    if (total_paid < pur_amount_due) {
      return "owner";
    } else if (total_paid > pur_amount_due) {
      return "investigate";
    } else if (total_paid === pur_amount_due) {
      return "-";
    }
  };

  const getVerificationForTenantPayment = (pur) => {
    const total_paid = pur.total_paid ? parseFloat(pur.total_paid) : 0;
    const pur_amount_due = pur.pur_amount_due ? parseFloat(pur.pur_amount_due) : 0;
    if (total_paid < pur_amount_due) {
      return "tenant";
    } else if (total_paid > pur_amount_due) {
      return "investigate";
    } else if (total_paid === pur_amount_due) {
      if (pur.verified) {
        if (pur.verified === "verified") {
          return "verified";
        }
      }
      return "not verified";
    }
  };

  const getVerificationStatus = (purchase) => {
    // console.log("getVerificationStatus - purchase - ", purchase);
    if (purchase.pur_payer?.startsWith("600")) {
      return getVerificationForManagerPayment(purchase);
    } else if (purchase.pur_payer?.startsWith("110")) {
      return getVerificationForOwnerPayment(purchase);
    } else if (purchase.pur_payer?.startsWith("350")) {
      return getVerificationForTenantPayment(purchase);
    } else {
      return "invalid payer";
    }
  };

  const getVerificationStatusColor = (status) => {
    switch (status) {
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
  };

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
                color: fontColor,
                cursor: verificationStatus === "not verified" ? "pointer" : "auto",
              }}
              onClick={() => {
                if (verificationStatus === "not verified") {
                  navigate("/paymentProcessing", { state: { currentWindow: "VERIFY_PAYMENTS", selectedPurchaseGroup: params.row.pur_group } });
                }
              }}
            >
              {/* {params.row.verified !== null ? params.row.verified : "-"} */}
              {verificationStatus}
            </Typography>
          </Tooltip>
        );
      },
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
    },
    {
      field: "pur_amount_due",
      headerName: "Expected",
      flex: 1,
      renderCell: (params) => <span>$ {params.row.pur_amount_due !== null ? parseFloat(params.row.pur_amount_due).toFixed(2) : parseFloat(0).toFixed(2)}</span>,
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
    },
    {
      field: "total_paid",
      headerName: "Actual",
      flex: 1,
      renderCell: (params) => (
        <span style={{ textAlign: "right", display: "block" }}>$ {params.row.total_paid !== null ? parseFloat(params.row.total_paid).toFixed(2) : parseFloat(0).toFixed(2)}</span>
      ),
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
    },
  ];

  const getRowWithIds = (data) => {
    const sortedData = data?.sort((a, b) => {
      const groupComparison = a.pur_group?.localeCompare(b.pur_group) || 0;

      if (groupComparison !== 0) {
        return groupComparison;
      } else {
        return a.pur_payer?.localeCompare(b.pur_payer) || 0;
      }
    });

    const rowsId = sortedData?.map((row, index) => ({
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

  // const newTransactionColumn = [
  //   {
  //     field: "purchase_date",
  //     headerName: "Purchase Date",
  //     flex: 1.5,
  //     renderCell: (params) => <span>{params.row.purchase_date !== null ? params.row.purchase_date.split(" ")[0] : "-"}</span>,
  //     renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
  //   },
  //   {
  //     field: "purchase_type",
  //     headerName: "Purchase Type",
  //     flex: 1.5,
  //     renderCell: (params) => <span>{params.row.purchase_type !== null ? params.row.purchase_type : "-"}</span>,
  //     renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
  //   },
  //   {
  //     field: "expected",
  //     headerName: "Expected",
  //     flex: 1,
  //     renderCell: (params) => (
  //       <span style={{ textAlign: "right", display: "block" }}>$ {params.row.expected !== null ? parseFloat(params.row.expected).toFixed(2) : parseFloat(0).toFixed(2)}</span>
  //     ),
  //     renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
  //   },
  //   {
  //     field: "payment_status",
  //     headerName: "Payment Status",
  //     flex: 1.5,
  //     renderCell: (params) => <span>{params.row.payment_status !== null ? params.row.payment_status : "-"}</span>,
  //     renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
  //   },
  // ]
  const commonStyles = {
    color: theme.typography.primary.black,
    fontWeight: theme.typography.light.fontWeight,
    fontSize: theme.typography.smallFont,
  };

  const newTransactionColumn = [
    {
      field: "payment_status",
      headerName: "Status",
      flex: 1.2,
      renderCell: (params) => <Box sx={commonStyles}>{params.row.payment_status !== null ? params.row.payment_status : "-"}</Box>,
      renderHeader: (params) => <Box sx={{fontSize: theme.typography.smallFont,}}><strong>{params.colDef.headerName}</strong></Box>,
    },    
    {
      field: "purchase_type",
      headerName: "Type",
      flex: 0.8,
      renderCell: (params) => <Box sx={commonStyles}>{params.value}</Box>,
      renderHeader: (params) => <Box sx={{fontSize: theme.typography.smallFont,}}><strong>{params.colDef.headerName}</strong></Box>,
    },
    {
      field: "purchase_group",
      headerName: "Group",
      flex: 1,
      renderCell: (params) => <Box sx={commonStyles}>{params.value}</Box>,
      renderHeader: (params) => <Box sx={{fontSize: theme.typography.smallFont,}}><strong>{params.colDef.headerName}</strong></Box>,
    },
    {
      field: "month",
      headerName: "Month",
      flex: 0.7,
      renderCell: (params) => <Box sx={commonStyles}>{params.value}</Box>,
      renderHeader: (params) => <Box sx={{fontSize: theme.typography.smallFont,}}><strong>{params.colDef.headerName}</strong></Box>,
    },
    {
      field: "year",
      headerName: "Year",
      flex: 0.5,
      renderCell: (params) => <Box sx={commonStyles}>{params.value}</Box>,
      renderHeader: (params) => <Box sx={{fontSize: theme.typography.smallFont,}}><strong>{params.colDef.headerName}</strong></Box>,
    },
    {
      field: "purchase_date",
      headerName: "Purchase Date",
      flex: 1,
      renderCell: (params) => <Box sx={commonStyles}>{params.row.purchase_date !== null ? params.row.purchase_date.split(" ")[0] : "-"}</Box>,
      renderHeader: (params) => <Box sx={{fontSize: theme.typography.smallFont,}}><strong>{params.colDef.headerName}</strong></Box>,
    },
    {
      field: "expected",
      headerName: "Expected",
      flex: 0.7,
      renderCell: (params) => <Box sx={commonStyles}>{parseFloat(params.value).toFixed(2)}</Box>,
      renderHeader: (params) => <Box sx={{fontSize: theme.typography.smallFont,}}><strong>{params.colDef.headerName}</strong></Box>,
    },
    {
      field: "owner_payment",
      headerName: "Owner Payment",
      flex: 0.7,
      renderCell: (params) => <Box sx={commonStyles}>{parseFloat(params.value).toFixed(2)}</Box>,
      renderHeader: (params) => <Box sx={{fontSize: theme.typography.smallFont,}}><strong>{params.colDef.headerName}</strong></Box>,
    },
    {
      field: "management_fee",
      headerName: "Management Fee",
      flex: 0.7,
      renderCell: (params) => <Box sx={commonStyles}>{parseFloat(params.value).toFixed(2)}</Box>,
      renderHeader: (params) => <Box sx={{fontSize: theme.typography.smallFont,}}><strong>{params.colDef.headerName}</strong></Box>,
    },
  ];

  const getNewRowWithIds = (data) => {
    // const revenueData = data?.filter((item) => item.pur_payer.startsWith("350"))
    


    const rowsId = data?.map((row, index) => ({
      ...row,
      id: row.id ? index : index,
    }));

    return rowsId;
  }

  const GetNewDataGrid = (data) => {
    const filteredData = data?.filter((item) => item.payment_status === "UNPAID" || item.payment_status === "PARTIALLY PAID")

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
      const has350Payer = groupedData[group].some(item => item.pur_payer.startsWith("350"));
    
      // If all items are paid, skip this group
      // if (allPaid) {
      //   return acc;
      // }

      if (!has350Payer) {
        return acc;
      }
    
    
      let allTransactions = []
      let purchase_ids = []
      let purchase_group;
      let purchase_type;
      let purchase_date;
      let month, year;
      let payment_status;

      groupedData[group].forEach(item => {
        const pur_payer = item.pur_payer;
        const pur_type = item.purchase_type;
    
        if (pur_payer.startsWith("350")) {
          purchase_type = item.purchase_type;
          purchase_date = item.purchase_date;
          month = item.cf_month;
          year = item.cf_year;
          payment_status = item.payment_status
          if(item.payment_status === "PARTIALLY PAID"){
            expected += parseFloat(item.amt_remaining)
          }else{

            expected += parseFloat(item.pur_amount_due?item.pur_amount_due : "0.00");
          }
        }
    
        else if (pur_payer.startsWith("110") && pur_type === "Management") {
          management_fee += parseFloat(item.pur_amount_due?item.pur_amount_due : "0.00");
        }
    
        else if (pur_payer.startsWith("110") && pur_type !== "Management") {
          other_expense += parseFloat(item.pur_amount_due?item.pur_amount_due : "0.00");
        }

        purchase_ids.push(item.purchase_uid)
        allTransactions.push(item)
        purchase_group = item.pur_group;
      });
    
      const owner_payment = parseFloat(expected - management_fee - other_expense);
    
      // Push the aggregated object for this group into the result if it passes the conditions
      acc.push({
        pur_group: group,
        expected,
        management_fee,
        other_expense,
        owner_payment,
        purchase_type: purchase_type,
        purchase_ids : JSON.stringify(purchase_ids),
        allTransactions,
        purchase_group,
        purchase_date : purchase_date,
        payment_status,
        month,
        year
      });
    
      return acc;
    }, []);


    const rows = getNewRowWithIds(result);

    if(rows?.length > 0){
      return (
        
          <DataGrid
            rows={rows}
            columns={newTransactionColumn}
            hideFooter={true}
            autoHeight
            rowHeight={35}
            sx={{
              marginTop: "10px",
              "& .MuiDataGrid-columnHeaders": {
                minHeight: "35px !important",
                maxHeight: "35px !important",
                height: 35,
              }
              
            }}
          />
      );
    }else{
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '7px',
            width: '100%',
            height:"30px"
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
        
}


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
          <Box component='span' m={2} marginTop={10} display='flex' justifyContent='space-between' alignItems='center'>
            {/* <Button sx={{ textTransform: "capitalize" }} onClick={() => setShowSelectMonth(true)}>
              <CalendarTodayIcon sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight, fontSize: theme.typography.smallFont }} />
              <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight, fontSize: "14px" }}>Select Month / Year</Typography>
            </Button> */}

            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "row",
              }}
            >
              <Button
                sx={{
                  marginRight: "30px",
                  backgroundColor: headerTab === "select_month_year" ? "#3D5CAC" : "#9EAED6",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: headerTab === "select_month_year" ? "#3D5CAC" : "#9EAED6",
                  },
                }}
                onClick={() => {
                  setHeaderTab("select_month_year");
                  setShowSelectMonth(true);
                }}
              >
                <CalendarTodayIcon sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight, fontSize: "12px", margin: "5px" }} />
                <Typography sx={{ fontSize: "12px", fontWeight: "bold", color: "#160449" }}>Select Month / Year</Typography>
              </Button>
              <Button
                sx={{
                  marginRight: "30px",
                  backgroundColor: headerTab === "last_month" ? "#3D5CAC" : "#9EAED6",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: headerTab === "last_month" ? "#3D5CAC" : "#9EAED6",
                  },
                }}
                onClick={() => {
                  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

                  let monthIndex = monthNames.indexOf(currentMonth);

                  if (monthIndex === 0) {
                    // If current month is January
                    setMonth("December");
                    setYear((currentYear - 1).toString());
                  } else {
                    setMonth(monthNames[monthIndex - 1]);
                    setYear(currentYear.toString());
                  }

                  setHeaderTab("last_month");
                }}
              >
                <Typography sx={{ fontSize: "12px", fontWeight: "bold", color: "#160449" }}>Last Month</Typography>
              </Button>
              <Button
                sx={{
                  backgroundColor: headerTab === "current_month" ? "#3D5CAC" : "#9EAED6",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: headerTab === "current_month" ? "#3D5CAC" : "#9EAED6",
                  },
                }}
                onClick={() => {
                  setHeaderTab("current_month");
                  setMonth(currentMonth);
                  setYear(currentYear.toString());
                }}
              >
                <Typography sx={{ fontSize: "12px", fontWeight: "bold", color: "#160449" }}>{currentMonth}</Typography>
              </Button>
            </Box>

            <SelectMonthComponentTest
              selectedMonth={month}
              selectedYear={year}
              setMonth={setMonth}
              setYear={setYear}
              showSelectMonth={showSelectMonth}
              setShowSelectMonth={setShowSelectMonth}
            />
            {selectedRole === "MANAGER" && (
              <Button sx={{ textTransform: "capitalize", width: "150px" }} onClick={() => {}}>
                <img src={AllOwnerIcon} alt='All Owners' style={{ width: "10px", height: "10px" }} />
                <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight, fontSize: "14px" }}>All Owners</Typography>
              </Button>
            )}
          </Box>

          {/* Filter buttons */}
          <Grid container item xs={12} marginTop={15} marginBottom={5}>
            <Grid container item xs={8} display={"flex"} direction={"row"}>
              
              <Grid container justifyContent='center' item xs={2} marginRight={6}>
                <Button
                  sx={{
                    width: "200px",
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
              <Grid container justifyContent='center' item xs={2} marginRight={6}>
                <Button
                  sx={{
                    width: "200px",
                    backgroundColor: tab === "by_type" ? "#3D5CAC" : "#9EAED6",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: tab === "by_type" ? "#3D5CAC" : "#9EAED6",
                    },
                  }}
                  onClick={() => handleSelectTab("by_type")}
                >
                  <Typography sx={{ fontSize: "12px", fontWeight: "bold", color: "#160449" }}>By Type</Typography>
                </Button>
              </Grid>
              <Grid container justifyContent='center' item xs={2} marginRight={6}>
                <Button
                  sx={{
                    width: "90px",
                    backgroundColor: tab === "by_sort" ? "#3D5CAC" : "#9EAED6",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: tab === "by_sort" ? "#3D5CAC" : "#9EAED6",
                    },
                  }}
                  onClick={() => handleSelectTab("by_sort")}
                >
                  <Typography sx={{ fontSize: "12px", fontWeight: "bold", color: "#160449" }}>By Sort</Typography>
                </Button>
              </Grid>
              <Grid container justifyContent='center' item xs={2} marginRight={6}>
                <Button
                  sx={{
                    width: "90px",
                    backgroundColor: tab === "by_cashflow" ? "#3D5CAC" : "#9EAED6",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: tab === "by_cashflow" ? "#3D5CAC" : "#9EAED6",
                    },
                  }}
                  onClick={() => handleSelectTab("by_cashflow")}
                >
                  <Typography sx={{ fontSize: "12px", fontWeight: "bold", color: "#160449" }}>By Cashflow</Typography>
                </Button>
              </Grid>
              <Grid container justifyContent='center' item xs={2}>
                <Button
                  sx={{
                    width: "70px",
                    backgroundColor: tab === "view" ? "#3D5CAC" : "#9EAED6",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: tab === "view" ? "#3D5CAC" : "#9EAED6",
                    },
                  }}
                  onClick={() => handleSelectTab("view")}
                >
                  <Typography sx={{ fontSize: "12px", fontWeight: "bold", color: "#160449" }}>View</Typography>
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

          {tab === "by_cashflow" && (
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
                        <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>{month} CashFlow</Typography>
                      </AccordionSummary>
                    </Grid>
                  </Grid>
                  {/* <Box display="flex" justifyContent="flex-start" alignItems="center" sx={{ width: '200px',}}> */}
                  <Grid container alignContent='center' justifyContent='flex-end' item xs={2}>
                    <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>
                      ${cashFlowtotal && cashFlowtotal?.totalExpectedProfit ? cashFlowtotal?.totalExpectedProfit?.toFixed(2) : "0.00"}
                    </Typography>
                  </Grid>
                  <Grid container alignContent='center' justifyContent='flex-end' item xs={2}>
                    <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>
                      ${cashFlowtotal && cashFlowtotal?.totalActualProfit ? cashFlowtotal?.totalActualProfit?.toFixed(2) : "0.00"}
                    </Typography>
                  </Grid>
                </Grid>

                <AccordionDetails>
                  {cashFlowData &&
                    Object.keys(cashFlowData)?.map((propertyUID, index) => {
                      const property = cashFlowData[propertyUID];
                      // console.log("property - ", property);
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
                                  //             <Grid container  justifyContent='flex-end' item xs={2}><Typography>${item.total_paid? item.actual : parseFloat(0).toFixed(2)}</Typography></Grid>
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

          {tab === "by_property" && (
            <>
              <Accordion
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  boxShadow: "none",
                }}
                expanded={profitsExpanded}
                onChange={() => setProfitsExpanded((prevState) => !prevState)}
              >
                <Grid container item xs={12}>
                  <Grid container justifyContent='flex-start' item xs={8}>
                    <Grid container direction='row' alignContent='center' sx={{ height: "35px" }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>{month}</Typography>
                      </AccordionSummary>
                    </Grid>
                  </Grid>
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
                      // console.log("property - ", property);
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
                                    <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight, fontSize: theme.typography.smallFont }}>
                                      {`${property?.propertyInfo?.property_address}`} {property?.propertyInfo?.property_unit && ", Unit - "}
                                      {property?.propertyInfo?.property_unit && property?.propertyInfo?.property_unit}
                                    </Typography>
                                    <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight, marginLeft: 10, fontSize: theme.typography.smallFont }}>
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
                                      <Typography sx={{ fontWeight: theme.typography.common.fontWeight, textTransform: "none", fontSize: theme.typography.smallFont }}>
                                        View
                                      </Typography>
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
                                {getDataGrid(property?.profitItems)}
                              </Grid>
                            </AccordionDetails>
                          </Accordion>
                        </>
                      );
                    })}
                </AccordionDetails>
              </Accordion>

              <Box width={"100%"} height={"20px"}>
                <hr></hr>
              </Box>

              <Accordion
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  boxShadow: "none",
                }}
                expanded={revenueExpanded}
                onChange={() => setRevenueExpanded((prevState) => !prevState)}
              >
                <Grid container item xs={12}>
                  <Grid container justifyContent='flex-start' item xs={8}>
                    <Grid container direction='row' alignContent='center' sx={{ height: "35px" }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>Deposits Collected</Typography>
                      </AccordionSummary>
                    </Grid>
                  </Grid>
                  <Grid container alignContent='center' justifyContent='flex-end' item xs={2}>
                    <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>
                      ${totalDeposit && totalDeposit?.totalExpected ? totalDeposit?.totalExpected?.toFixed(2) : "0.00"}
                    </Typography>
                  </Grid>
                  <Grid container alignContent='center' justifyContent='flex-end' item xs={2}>
                    <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>
                      ${totalDeposit && totalDeposit?.totalActual ? totalDeposit?.totalActual?.toFixed(2) : "0.00"}
                    </Typography>
                  </Grid>
                </Grid>

                <AccordionDetails>
                  {totalDepositByProperty &&
                    Object.keys(totalDepositByProperty)?.map((propertyUID, index) => {
                      const property = totalDepositByProperty[propertyUID];
                      // console.log("property - ", property);
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
                                    <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight, fontSize: theme.typography.smallFont }}>
                                      {`${property?.propertyInfo?.property_address}`} {property?.propertyInfo?.property_unit && ", Unit - "}
                                      {property?.propertyInfo?.property_unit && property?.propertyInfo?.property_unit}
                                    </Typography>
                                    <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight, marginLeft: 10, fontSize: theme.typography.smallFont }}>
                                      {`${property?.propertyInfo?.property_id}`}
                                    </Typography>
                                    <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight, marginLeft: 10, fontSize: theme.typography.smallFont }}>
                                      {`(${property?.rentItems[0]?.cf_month} ${property?.rentItems[0]?.cf_year})`}
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
                                      <Typography sx={{ fontWeight: theme.typography.common.fontWeight, textTransform: "none", fontSize: theme.typography.smallFont }}>
                                        View
                                      </Typography>
                                    </Button>
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
                                {getDataGrid(property?.rentItems)}
                              </Grid>
                            </AccordionDetails>
                          </Accordion>
                        </>
                      );
                    })}
                </AccordionDetails>
              </Accordion>

              {/* <Accordion
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  boxShadow: "none",
                }}
                expanded={revenueExpanded}
                onChange={() => setRevenueExpanded((prevState) => !prevState)}
              >
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

                <AccordionDetails>
                  {revenueByMonthByType &&
                    Object.keys(revenueByMonthByType).map((month, monthIndex) => {
                      const monthData = revenueByMonthByType[month];
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

                          <AccordionDetails>
                            <StatementTable
                              categoryTotalMapping={monthData?.RevenueByType}
                              allItems={monthData?.revenueItems}
                              activeView={"ExpectedCashflow"}
                              tableType="Revenue"
                              categoryExpectedTotalMapping={monthData?.expectedRevenueByType}
                              month={month}
                              year={year}
                            />
                          </AccordionDetails>
                        </Accordion>
                      );
                    })}
                </AccordionDetails>
              </Accordion> */}

              {/* <Accordion
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  boxShadow: "none",
                }}
                expanded={expenseExpanded}
                onChange={() => setExpenseExpanded((prevState) => !prevState)}
              >
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

                                    <AccordionDetails>
                                      <Grid container item xs={12}>
                                        {
                                          getDataGrid(property?.profitItems)
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
              </Accordion> */}
            </>
          )}

          {tab === "by_type" && (
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
                        <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>{month}</Typography>
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
                  <StatementTable
                    categoryTotalMapping={getTotalValueByTypeMapping}
                    allItems={allProfitDataItems}
                    activeView={"ExpectedCashflow"}
                    tableType='Profit'
                    categoryExpectedTotalMapping={getExpectedTotalByTypeMapping}
                    month={month}
                    year={year}
                  />
                </AccordionDetails>
              </Accordion>

              {/*<Accordion
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

                <AccordionDetails> */}
              {/* <RevenueTable totalRevenueByType={revenueByType} expectedRevenueByType={expectedRevenueByType} revenueList={revenueList} activeView={activeButton}/> */}
              {/* <StatementTable
                    categoryTotalMapping={revenueByType}
                    allItems={revenueList}
                    activeView={"ExpectedCashflow"}
                    tableType="Revenue"
                    categoryExpectedTotalMapping={expectedRevenueByType}
                    month={month}
                    year={year}
                  />
                  
                </AccordionDetails>
              </Accordion> */}

              {/* <Accordion
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
                  <StatementTable
                    categoryTotalMapping={expenseByType}
                    allItems={expenseList}
                    activeView={"ExpectedCashflow"}
                    tableType='Expense'
                    categoryExpectedTotalMapping={expectedExpenseByType}
                    month={month}
                    year={year}
                  />
                </AccordionDetails>
              </Accordion> */}
            </>
          )}

          {tab === "by_sort" && (
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
                        <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>{month}</Typography>
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
                  <StatementTable
                    categoryTotalMapping={getSortedTotalValueByMapping}
                    allItems={allProfitDataItems}
                    activeView={"ExpectedCashflow"}
                    tableType='Profit'
                    categoryExpectedTotalMapping={getSortedExpectedTotalByMapping}
                    month={month}
                    year={year}
                  />
                </AccordionDetails>
              </Accordion>

              {/*<Accordion
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

                <AccordionDetails> */}
              {/* <RevenueTable totalRevenueByType={revenueByType} expectedRevenueByType={expectedRevenueByType} revenueList={revenueList} activeView={activeButton}/> */}
              {/* <StatementTable
                    categoryTotalMapping={revenueByType}
                    allItems={revenueList}
                    activeView={"ExpectedCashflow"}
                    tableType="Revenue"
                    categoryExpectedTotalMapping={expectedRevenueByType}
                    month={month}
                    year={year}
                  />
                  
                </AccordionDetails>
              </Accordion> */}

              {/* <Accordion
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
                  <StatementTable
                    categoryTotalMapping={expenseByType}
                    allItems={expenseList}
                    activeView={"ExpectedCashflow"}
                    tableType='Expense'
                    categoryExpectedTotalMapping={expectedExpenseByType}
                    month={month}
                    year={year}
                  />
                </AccordionDetails>
              </Accordion> */}
            </>
          )}

          {tab === "view" && (<>
            <Accordion
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  boxShadow: "none",
                }}
                expanded={profitsExpanded}
                onChange={() => setProfitsExpanded((prevState) => !prevState)}
              >
                <Grid container item xs={12}>
                  <Grid container justifyContent='flex-start' item xs={8}>
                    <Grid container direction='row' alignContent='center' sx={{ height: "35px" }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>{month}</Typography>
                      </AccordionSummary>
                    </Grid>
                  </Grid>
                  <Grid container alignContent='center' justifyContent='flex-end' item xs={2}>
                    <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>
                      ${totalRevenueData && totalRevenueData?.totalExpected ? totalRevenueData?.totalExpected?.toFixed(2) : "0.00"}
                    </Typography>
                  </Grid>
                  <Grid container alignContent='center' justifyContent='flex-end' item xs={2}>
                    <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight }}>
                      ${totalRevenueData && totalRevenueData?.totalActual ? totalRevenueData?.totalActual?.toFixed(2) : "0.00"}
                    </Typography>
                  </Grid>
                </Grid>

                <AccordionDetails>
                  {revenueDataForManager &&
                    Object.keys(revenueDataForManager)?.map((propertyUID, index) => {
                      const property = revenueDataForManager[propertyUID];
                      // console.log("property - ", property);
                      return (
                        <>
                          <Accordion
                            sx={{
                              backgroundColor: theme.palette.primary.main,
                              boxShadow: "none",
                              marginY: "10px"
                            }}
                            key={index}
                          >
                            <Grid container item xs={12}>
                              <Grid container justifyContent='flex-start' item xs={8}>
                                <Grid container direction='row' alignContent='center' sx={{ height: "35px" }}>
                                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight}}>
                                      {`${property?.propertyInfo?.property_address}`} {property?.propertyInfo?.property_unit && ", Unit - "}
                                      {property?.propertyInfo?.property_unit && property?.propertyInfo?.property_unit}
                                    </Typography>
                                    <Typography sx={{ color: "#160449", fontWeight: theme.typography.common.fontWeight, marginLeft: 10, fontSize: theme.typography.smallFont }}>
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

                            {/* <AccordionDetails>
                              <Grid container item xs={12}>
                                <Grid item xs={12}>
                                    <Typography sx={{fontWeight: 'bold', color: "#160449"}}>
                                        Unpaid Rent
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                  {getNewDataGrid(property?.rentItems)}
                                </Grid>
                              </Grid>
                              <Grid container item xs={12}>
                                <Grid item xs={12}>
                                    <Typography sx={{fontWeight: 'bold', color: "#160449"}}>
                                        Unverified
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} marginY={10}>
                                  <BalanceDetailsTable data={property?.payments} selectedPurchaseRow={""} setPaymentData={setPaymentData} setSelectedPayments={setSelectedPayments} selectedProperty={selectedProperty} sortBy={sortBy}/>
                                </Grid>
                              </Grid>
                              <Grid container item xs={12}>
                                <Grid item xs={12}>
                                    <Typography sx={{fontWeight: 'bold', color: "#160449"}}>
                                        Pay Owner
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} marginY={10}>
                                  <TransactionsTable data={property.rentItems} total={total} setTotal={setTotal} setPaymentData={setPaymentData} setSelectedItems={setSelectedItems}/>
                                </Grid>
                              </Grid>
                            </AccordionDetails> */}
                            <AccordionDetails>
                              <Grid container item xs={12} direction="column" justifyContent="space-between" style={{ height: '100%' }}>
                                
                                {/* Unpaid Rent Section */}
                                <Grid container item marginY={10}>
                                  <Typography sx={{ fontWeight: 'bold', color: theme.typography.common.blue, fontSize: theme.typography.smallFont }}>
                                    Unpaid Rent
                                  </Typography>
                                  <Grid item xs={12} sx={{ overflowX: "auto" }}>
                                    {GetNewDataGrid(property?.rentItems)}
                                  </Grid>
                                </Grid>

                                {/* Unverified Section */}
                                <Grid container item marginY={10}>
                                  <Typography sx={{ fontWeight: 'bold', color: theme.typography.common.blue, fontSize: theme.typography.smallFont }}>
                                    Unverified
                                  </Typography>
                                  <BalanceDetailsTable 
                                    data={property?.payments !== undefined ? property?.payments : []} 
                                    revenueData={property?.rentItems}
                                    selectedPurchaseRow={""} 
                                    setPaymentData={setPaymentData} 
                                    setSelectedPayments={setSelectedPayments} 
                                    selectedProperty={selectedProperty}
                                    fetchPaymentsData={fecthPaymentVerification} 
                                    sortBy={sortBy}
                                  />
                                </Grid>

                                {/* Pay Owner Section */}
                                <Grid container item>
                                  <Typography sx={{ fontWeight: 'bold', color: theme.typography.common.blue, fontSize: theme.typography.smallFont }}>
                                    Pay Owner
                                  </Typography>
                                  <TransactionsTable 
                                    data={property?.rentItems? property.rentItems : []} 
                                    total={total} 
                                    setTotal={setTotal} 
                                    setPaymentData={setPaymentData} 
                                    setSelectedItems={setSelectedItems}
                                  />
                                </Grid>

                              </Grid>
                            </AccordionDetails>
                          </Accordion>
                        </>
                      );
                    })
                  }
                </AccordionDetails>

              </Accordion>
          </>)}
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
  const yearsNames = [lastYear, currentYear, nextYear];

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
        <Box marginBottom={"40px"}>
          <Typography sx={{ fontWeight: "bold", color: "#160449", textAlign: "center" }} marginBottom={"10px"}>
            Months
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
            {monthNames.map((month, index) => {
              return (
                <Typography textAlign={"center"} className={props.selectedMonth === month ? "selected" : "unselected"} key={index} onClick={() => props.setMonth(month)}>
                  {month}
                </Typography>
              );
            })}
          </Box>
        </Box>
        <Box marginBottom={"10px"}>
          <Typography sx={{ fontWeight: "bold", color: "#160449", textAlign: "center" }} marginBottom={"10px"}>
            Years
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
            {yearsNames.map((year, index) => {
              return (
                <Typography
                  textAlign={"center"}
                  className={props.selectedYear === year.toString() ? "selected" : "unselected"}
                  onClick={() => props.setYear(year.toString())}
                  key={index}
                >
                  {year}
                </Typography>
              );
            })}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

function StatementTable(props) {
  // console.log(props)
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
    navigate(type, { state: { itemToEdit: item, edit: true } });
  }

  function getCategoryCount(category, expected) {
    // console.log("getCategoryCount - category - ", category);
    let filteredItems = allItems.filter((item) => {
      if (item.purchase_type.toUpperCase() === category.toUpperCase()) {
        return item.purchase_type.toUpperCase() === category.toUpperCase() && item.cf_month === month && item.cf_year === year;
      }
      if (category === "OTHER") {
        if (expected) {
          return !categoryExpectedTotalMapping.hasOwnProperty(item.purchase_type.toUpperCase());
        } else {
          return !categoryTotalMapping.hasOwnProperty(item.purchase_type.toUpperCase());
        }
      }
    });
    // let items = filteredItems?.map((item) => ({ ...item, property: JSON.parse(item.property) }));
    let count = 0;

    filteredItems.map((i) => {
      count += 1;
    });

    return "(" + count + ")";
  }

  function getCategoryItems(category, isExpected, type) {
    // let filteredIitems = allItems.filter((item) => item.purchase_type.toUpperCase() === category.toUpperCase() && item.cf_month === month && item.cf_year === year);
    // let items = filteredIitems?.map((item) => ({ ...item, property: JSON.parse(item.property) }));

    let filteredIitems = allItems.filter((item) => {
      if (item.purchase_type.toUpperCase() === category.toUpperCase()) {
        return item.purchase_type.toUpperCase() === category.toUpperCase() && item.cf_month === month && item.cf_year === year;
      }
      if (category === "OTHER") {
        if (isExpected) {
          return !categoryExpectedTotalMapping.hasOwnProperty(item.purchase_type.toUpperCase());
        } else {
          return !categoryTotalMapping.hasOwnProperty(item.purchase_type.toUpperCase());
        }
      }
    });

    return (
      <>
        {activeView !== "Cashflow" && (
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
        )}

        {filteredIitems.map((item, index) => {
          return activeView === "Cashflow" ? (
            <TableRow key={index} onClick={() => handleNavigation(type, item)}>
              <TableCell></TableCell>
              <TableCell>
                <Typography
                  sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}
                  onClick={() => {
                    navigate("/properties", {
                      state: { currentProperty: item.pur_property_id },
                    });
                  }}
                >
                  {" "}
                  {item.property_address} {item.property_unit}{" "}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>${item["pur_amount_due"] ? item["pur_amount_due"] : 0}</Typography>
              </TableCell>
              <TableCell>
                <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>${item["total_paid"] ? item["total_paid"] : 0}</Typography>
              </TableCell>
            </TableRow>
          ) : (
            <React.Fragment key={index}>
              <TableRow key={`${item.property_uid}-${index}`} sx={{}}>
                <TableCell>
                  <Typography sx={{ fontSize: theme.typography.smallFont, marginLeft: "25px" }}>{item.pur_property_id ? item.pur_property_id : ""}</Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    sx={{ fontSize: theme.typography.smallFont, cursor: "pointer" }}
                    onClick={() => {
                      navigate("/properties", {
                        state: { currentProperty: item.pur_property_id },
                      });
                    }}
                  >
                    {item.property_address ? item.property_address : ""}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: theme.typography.smallFont }}>{item.property_unit ? item.property_unit : ""}</Typography>
                </TableCell>
                <TableCell align='right'>
                  {/* {property.individual_purchase.map((p) => {
                      total_amount_due += (p.pur_amount_due? p.pur_amount_due : 0)
                  })} */}
                  <Typography sx={{ fontSize: theme.typography.smallFont }}>${item.pur_amount_due ? item.pur_amount_due : 0}</Typography>
                </TableCell>
                <TableCell align='right'>
                  {/* {property.individual_purchase.map((p) => {
                      total_amount_paid += (p.total_paid ? p.total_paid : 0)
                  })} */}
                  <Typography sx={{ fontSize: theme.typography.smallFont, marginRight: "25px" }}>${item.total_paid ? item.total_paid : 0}</Typography>
                </TableCell>
              </TableRow>
            </React.Fragment>
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
                            {category} {getCategoryCount(category, false)}{" "}
                          </Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>${value ? parseFloat(value).toFixed(2) : 0}</Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>${value ? parseFloat(value).toFixed(2) : 0}</Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                  </Table>
                </AccordionSummary>
                <AccordionDetails>
                  <Table>
                    <TableBody>{getCategoryItems(category, false, navigateType)}</TableBody>
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
                  backgroundColor: "transparent",
                  boxShadow: "none",
                }}
                key={category}
              >
                <AccordionSummary sx={{ flexDirection: "space-between" }} expandIcon={<ExpandMoreIcon />} onClick={(e) => e.stopPropagation()}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: "500px" }}>
                          <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
                            {" "}
                            {category} {getCategoryCount(category, true)}{" "}
                          </Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Typography sx={{ textAlign: "right", fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight, width: "150px" }}>
                            ${value ? parseFloat(value).toFixed(2) : 0}
                          </Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
                            ${categoryTotalMapping[category] ? parseFloat(categoryTotalMapping[category]).toFixed(2) : 0}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                  </Table>
                </AccordionSummary>
                <AccordionDetails>
                  <Table>
                    <TableBody>{getCategoryItems(category, true)}</TableBody>
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

function TransactionsTable(props) {
  // console.log("In BalanceDetailTable", props);
  const [data, setData] = useState(props.data);
  const navigate = useNavigate();
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [paymentDueResult, setPaymentDueResult] = useState([]);
  const [paymentDueResultMap, setPaymentDueResultMap] = useState([]); // index to row mapping for quick lookup.

   const [sortModel, setSortModel] = useState([
    { field: 'pur_group', sort: 'asc', },
    { field: 'pur_payer', sort: 'asc', }
  ]);

  const commonStyles = {
    color: theme.typography.primary.black,
    fontWeight: theme.typography.light.fontWeight,
    fontSize: theme.typography.smallFont,
  };

  useEffect(() => {
    setData(props.data);
  }, [props.data]);

  useEffect(() => {
    // console.log("ROHIT - selectedRows - ", selectedRows);
  }, [selectedRows]);

  const filterTransactions = (data) => {

    const verifiedPurGroups = []

    data.forEach(transaction => {
      if(!verifiedPurGroups.includes(transaction.pur_group) && transaction.verified && transaction.verified.toLowerCase() === "verified" ){
        verifiedPurGroups.push(transaction.pur_group);
      }
    })

    const groupedData = data.reduce((acc, item) => {
      if (verifiedPurGroups.includes(item.pur_group)) {
        if (!acc[item.pur_group]) {
          acc[item.pur_group] = [];
        }
        acc[item.pur_group].push(item);
      }
      return acc;
    }, {});

    console.log("ROHIT - 631 - vgroupByPurchaseGroup - ", groupedData);

    const result = Object.keys(groupedData).reduce((acc, group) => {
      let received_amt = 0;
      let management_fee = 0;
      let other_expense = 0;
    
      // Check if all items in this group have 'payment_status' === "PAID"
      const allPaid = groupedData[group].every(item => item.payment_status === "PAID");
    
      // If all items are paid, skip this group
      if (allPaid) {
        return acc;
      }

      const hasPartiallyPaid = groupedData[group].some(item => item.payment_status === "PARTIALLY PAID");

      if(hasPartiallyPaid){
        return acc;
      }
    
      let allTransactions = []
      let purchase_ids = []
      let purchase_group;
      let purchase_type;
      let month, year;
      let purchase_date;
      let pur_receiver;

      groupedData[group].forEach(item => {
        const pur_payer = item.pur_payer;
        const pur_type = item.purchase_type;
    
        if (pur_payer.startsWith("350")) {
          purchase_type = item.purchase_type;
          purchase_date = item.purchase_date;
          month = item.cf_month;
          year = item.cf_year;
          received_amt += parseFloat(item.total_paid);
        }
        else if (pur_payer.startsWith("110") && pur_type === "Management") {
          management_fee += parseFloat(item.pur_amount_due?item.pur_amount_due : "0.00");
        }
        else if (pur_payer.startsWith("110") && pur_type !== "Management") {
          other_expense += parseFloat(item.pur_amount_due?item.pur_amount_due : "0.00");
        }
        else if(pur_payer.startsWith("600")){
          pur_receiver = item.pur_receiver;
        }

        purchase_ids.push(item.purchase_uid)
        allTransactions.push(item)
        purchase_group = item.pur_group;
      });
    
      const owner_payment = parseFloat(received_amt - management_fee - other_expense);
    
      // Push the aggregated object for this group into the result if it passes the conditions
      acc.push({
        pur_group: group,
        received_amt,
        management_fee,
        other_expense,
        owner_payment,
        purchase_type: purchase_type,
        purchase_ids : JSON.stringify(purchase_ids),
        allTransactions,
        purchase_group,
        purchase_date,
        pur_receiver,
        month,
        year
      });
    
      return acc;
    }, []);

    console.log("ROHIT - 631 - result - ", result);

    return result


    // return data            
    //         // .filter(item => (item.verified && item.verified.toLowerCase() === "verified"));
    //         .filter(item => (verifiedPurGroups.includes(item.pur_group)))
    //         .filter( item => (item.pur_payer.startsWith("600") || item.pur_payer.startsWith("110")))
    //         .filter( item => {
    //           const actual = parseFloat(item.actual? item.actual : "0");
    //           const expected = parseFloat(item.expected? item.expected : "0");
              
    //           return actual !== expected;
    //         });

  }

  useEffect(() => {
    if (data && data.length > 0) {
      // console.log("ROHIT - 814 - without filteredData - ", data, " for property - ", data[0].pur_property_id);
      const filteredData = filterTransactions(data);
      // setSelectedRows(filteredData.map((row) => row.index));
      setSelectedRows([]);
      setPaymentDueResult(
        filteredData.map((item, index) => ({
          ...item,
          index : index,
        }))
      );
    }
  }, [data]);

  useEffect(() => {
    var total = 0;

    let purchase_uid_mapping = [];

    for (const item of selectedRows) {
      // console.log("item in loop", item)

      let paymentItemData = paymentDueResult.find((element) => element.index === item);
      console.log("ROHIT - 687 - paymentItemData - ", paymentItemData);
      const purchaseIDs = JSON.parse(paymentItemData.purchase_ids);
      purchaseIDs.forEach( purID => {
        purchase_uid_mapping.push({ purchase_uid: purID, pur_amount_due: paymentItemData.owner_payment.toFixed(2) });
      });
      
      // console.log("payment item data", paymentItemData);

      // total += parseFloat(paymentItemData.pur_amount_due);
      // Adjust total based on pur_cf_type
      // if (paymentItemData.pur_payer.startsWith("110")) {
      //   total -= parseFloat(paymentItemData.pur_amount_due);
      // } else if (paymentItemData.pur_payer.startsWith("600")) {
      //   total += parseFloat(paymentItemData.pur_amount_due);
      // }

      total += parseFloat(paymentItemData.owner_payment)
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
      field: "pur_receiver",
      headerName: "Owner ID",
      flex: 0.8,
      renderCell: (params) => <Box sx={commonStyles}>{params.value}</Box>,
      renderHeader: (params) => <Box sx={{fontSize: theme.typography.smallFont}}><strong>{params.colDef.headerName}</strong></Box>,
    },
    {
      field: "purchase_type",
      headerName: "Type",
      flex: 0.8,
      renderCell: (params) => <Box sx={commonStyles}>{params.value}</Box>,
      renderHeader: (params) => <Box sx={{fontSize: theme.typography.smallFont}}><strong>{params.colDef.headerName}</strong></Box>,
    },
    {
      field: "purchase_group",
      headerName: "Group",
      flex: 1,
      renderCell: (params) => <Box sx={commonStyles}>{params.value}</Box>,
      renderHeader: (params) => <Box sx={{fontSize: theme.typography.smallFont,}}><strong>{params.colDef.headerName}</strong></Box>,
    },
    {
      field: "month",
      headerName: "Month",
      flex: 0.7,
      renderCell: (params) => <Box sx={commonStyles}>{params.value}</Box>,
      renderHeader: (params) => <Box sx={{fontSize: theme.typography.smallFont,}}><strong>{params.colDef.headerName}</strong></Box>,
    },
    {
      field: "year",
      headerName: "Year",
      flex: 0.5,
      renderCell: (params) => <Box sx={commonStyles}>{params.value}</Box>,
      renderHeader: (params) => <Box sx={{fontSize: theme.typography.smallFont,}}><strong>{params.colDef.headerName}</strong></Box>,
    },
    {
      field: "purchase_date",
      headerName: "Purchase Date",
      flex: 1,
      renderCell: (params) => <Box sx={commonStyles}>{(params.value !== undefined || params.value !== null) ? params.value.split(" ")[0] : "-"}</Box>,
      renderHeader: (params) => <Box sx={{fontSize: theme.typography.smallFont,}}><strong>{params.colDef.headerName}</strong></Box>,
    },
    {
      field: "received_amt",
      headerName: "Amount Received",
      flex: 0.7,
      renderCell: (params) => <Box sx={commonStyles}>{parseFloat(params.value).toFixed(2)}</Box>,
      renderHeader: (params) => <Box sx={{fontSize: theme.typography.smallFont,}}><strong>{params.colDef.headerName}</strong></Box>,
    },
    {
      field: "owner_payment",
      headerName: "Owner Payment",
      flex: 0.7,
      renderCell: (params) => <Box sx={commonStyles}>{parseFloat(params.value).toFixed(2)}</Box>,
      renderHeader: (params) => <Box sx={{fontSize: theme.typography.smallFont,}}><strong>{params.colDef.headerName}</strong></Box>,
    },
    {
      field: "management_fee",
      headerName: "Management Fee",
      flex: 0.7,
      renderCell: (params) => <Box sx={commonStyles}>{parseFloat(params.value).toFixed(2)}</Box>,
      renderHeader: (params) => <Box sx={{fontSize: theme.typography.smallFont,}}><strong>{params.colDef.headerName}</strong></Box>,
    },
  ];

  const handleSelectionModelChange = (newRowSelectionModel) => {
    console.log("ROHIT - newRowSelectionModel - ", newRowSelectionModel);
    console.log("ROHIT - paymentDueResult - ", paymentDueResult);
    console.log("ROHIT -  selectedRows - ", selectedRows);

    const addedRows = newRowSelectionModel.filter((rowId) => !selectedRows.includes(rowId));
    const removedRows = selectedRows.filter((rowId) => !newRowSelectionModel.includes(rowId));

    let updatedRowSelectionModel = [...newRowSelectionModel];

    console.log("ROHIT -  addedRows - ", addedRows);

    if (addedRows.length > 0) {
      // console.log("Added rows: ", addedRows);
      let newPayments = [];
      
      addedRows.forEach((item, index) => {
        console.log("ROHIT - item - ", item)
        // const addedPayment = paymentDueResult.find((row) => row.purchase_uid === addedRows[index]);
        const addedPayment = paymentDueResult.find((row) => row.index === item);
        // console.log("ROHIT - addedPayment - ", addedPayment)

        if (addedPayment) {
          const relatedPayments = paymentDueResult.filter((row) => row.pur_group === addedPayment.pur_group);
          // console.log("ROHIT - relatedPayments - ", relatedPayments)

          newPayments = [...newPayments, ...relatedPayments];
          const relatedRowIds = relatedPayments.map((payment) => payment.index);
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
      removedRows.forEach((item, index) => {
        let removedPayment = paymentDueResult.find((row) => row.index === item);

        removedPayments.push(removedPayment);
      });
      // console.log("removedPayments - ", removedPayments);
      setSelectedPayments((prevState) => prevState.filter((payment) => !removedRows.includes(payment.index)));
    }
    // setSelectedRows(newRowSelectionModel);
    setSelectedRows(updatedRowSelectionModel);
  };

  if (paymentDueResult.length > 0) {
    return (
      <>
          <Grid item xs={12} sx={{ overflowX: "auto" }}>
            <DataGrid
              rows={paymentDueResult}
              columns={columnsList}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 100,
                  },
                  sorting: {
                    sortModel: [{ field: 'pur_group', sort: 'asc' }, { field: 'pur_payer', sort: 'asc' }]
                  }
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
              sx={{
                // minWidth: "700px"
              }}
            />
          </Grid>
        {/* {selectedRows.length > 0 && (
          <div>Total selected amount: ${selectedRows.reduce((total, rowId) => total + parseFloat(paymentDueResult.find((row) => row.purchase_uid === rowId).pur_amount_due), 0)}</div>
        )} */}
        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} alignItems='center' sx={{ paddingTop: "15px" }}>
          <Grid item xs={1} alignItems='center'></Grid>
          <Grid item xs={7} alignItems='center'>
            <Typography
              sx={{
                color: theme.typography.primary.blue,
                fontWeight: theme.typography.medium.fontWeight,
                fontSize: theme.typography.smallFont,
                fontFamily: "Source Sans Pro",
              }}
            >
              Total Paid: ${" "}
              {selectedRows.reduce((total, selectedIndex) => {
                // const payment = paymentDueResult.find((row) => row.index === selectedIndex);
                const payment = paymentDueResultMap[selectedIndex];
                if(payment){
                  const amountDue = payment?.owner_payment;
                  // const isExpense = payment.pur_cf_type === "expense";

                  // Adjust the total based on whether the payment is an expense or revenue
                  // return total + (isExpense ? -amountDue : amountDue);

                  // if (payment.pur_payer.startsWith("110")) {
                  //   return total - amountDue;
                  // } else if (payment.pur_payer.startsWith("600")) {
                        // return total + amountDue;
                  // }

                  return total + amountDue;
                  // return total + 0;
                }
                return total + 0
              }, 0)?.toFixed(2)}
            </Typography>
          </Grid>

          <Grid item xs={3} alignItems='right'>
            <Button
                  sx={{
                    width: "170px",
                    backgroundColor: "#3D5CAC",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "#3D5CAC",
                    },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const selectedPurchaseGroup = selectedPayments.map(payment => payment.purchase_group);
                    console.log("selected purchase group -- ", selectedPurchaseGroup)
                    navigate("/paymentProcessing", { state: { currentWindow: "PAY_BILLS", selectedRows: selectedPurchaseGroup } });
                  }}
                >
                  <Typography sx={{ fontSize: "12px", fontWeight: "bold", color: "#ffffff" }}>Pay Owner</Typography>
                </Button>
          </Grid>
        </Grid>
      </>
    );
  } else {
    return <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '7px',
          width: '100%',
          height:"30px"
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
    </>;
  }
}

function BalanceDetailsTable(props) {
  // console.log("In BalanceDetailTable", props);
  const [data, setData] = useState({});
  const selectedPurchaseGroup = props.selectedPurchaseRow || "";
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [paymentDueResult, setPaymentDueResult] = useState([]);

  const [totalVerified, setTotalVerified] = useState(0);
  const commonStyles = {
    color: theme.typography.primary.black,
    fontWeight: theme.typography.light.fontWeight,
    fontSize: theme.typography.smallFont,
  };

  const filterTransactions = (data) => {

    // const verifiedPurGroups = []

    // data.forEach(transaction => {
    //   if(!verifiedPurGroups.includes(transaction.pur_group) && transaction.verified && transaction.verified.toLowerCase() === "verified" ){
    //     verifiedPurGroups.push(transaction.pur_group);
    //   }
    // })

    const groupedData = data.reduce((acc, item) => {
      if (!acc[item.pur_group]) {
        acc[item.pur_group] = [];
      }
      acc[item.pur_group].push(item);
      return acc;
    }, {});

    // const result = Object.keys(groupedData).reduce((acc, group) => {
    //   let received_amt = 0;
    //   let management_fee = 0;
    //   let other_expense = 0;
    
    //   // Check if all items in this group have 'payment_status' === "PAID"
    //   const allPaid = groupedData[group].every(item => item.payment_status === "PAID");
    
    //   // If all items are paid, skip this group
    //   if (allPaid) {
    //     return acc;
    //   }

    //   const hasPartiallyPaid = groupedData[group].some(item => item.payment_status === "PARTIALLY PAID");

    //   if(hasPartiallyPaid){
    //     return acc;
    //   }
    
    //   let allTransactions = []
    //   let purchase_ids = []
    //   let purchase_group;
    //   let purchase_type;
    //   let month, year;
    //   let purchase_date;
    //   let pur_receiver;

    //   groupedData[group].forEach(item => {
    //     const pur_payer = item.pur_payer;
    //     const pur_type = item.purchase_type;
    
    //     if (pur_payer.startsWith("350")) {
    //       purchase_type = item.purchase_type;
    //       purchase_date = item.purchase_date;
    //       month = item.cf_month;
    //       year = item.cf_year;
    //       received_amt += parseFloat(item.actual);
    //     }
    //     else if (pur_payer.startsWith("110") && pur_type === "Management") {
    //       management_fee += parseFloat(item.expected);
    //     }
    //     else if (pur_payer.startsWith("110") && pur_type !== "Management") {
    //       other_expense += parseFloat(item.expected);
    //     }
    //     else if(pur_payer.startsWith("600")){
    //       pur_receiver = item.pur_receiver;
    //     }

    //     purchase_ids.push(...JSON.parse(item.purchase_ids))
    //     allTransactions.push(item)
    //     purchase_group = item.pur_group;
    //   });
    
    //   const owner_payment = parseFloat(received_amt - management_fee - other_expense);
    
    //   // Push the aggregated object for this group into the result if it passes the conditions
    //   acc.push({
    //     pur_group: group,
    //     received_amt,
    //     management_fee,
    //     other_expense,
    //     owner_payment,
    //     purchase_type: purchase_type,
    //     purchase_ids : JSON.stringify(purchase_ids),
    //     allTransactions,
    //     purchase_group,
    //     purchase_date,
    //     pur_receiver,
    //     month,
    //     year
    //   });
    
    //   return acc;
    // }, []);

    const result = Object.keys(groupedData).reduce((acc, group) => {
      let received_amt = 0;
      let management_fee = 0;
      let other_expense = 0;
    
      // Check if all items in this group have 'payment_status' === "PAID"
      const allPaid = groupedData[group].every(item => item.payment_status === "PAID");
    
      // If all items are paid, skip this group
      if (allPaid) {
        return acc;
      }
    
      const hasPartiallyPaid = groupedData[group].some(item => item.payment_status === "PARTIALLY PAID");
    
      if (hasPartiallyPaid) {
        return acc;
      }
    
      let purchase_type;
      let purchase_group;
      let month, year;
      let purchase_date;
      let pur_receiver;
      let purchase_ids = [];
    
      groupedData[group].forEach(item => {
        const pur_payer = item.pur_payer;
        const pur_type = item.purchase_type;
    
        if (pur_payer.startsWith("350")) {
          purchase_type = item.purchase_type;
          purchase_date = item.purchase_date;
          month = item.cf_month;
          year = item.cf_year;
          received_amt += parseFloat(item.total_paid);
        } else if (pur_payer.startsWith("110") && pur_type === "Management") {
          management_fee += parseFloat(item.pur_amount_due?item.pur_amount_due : "0.00");
        } else if (pur_payer.startsWith("110") && pur_type !== "Management") {
          other_expense += parseFloat(item.pur_amount_due?item.pur_amount_due : "0.00");
        } else if (pur_payer.startsWith("600")) {
          pur_receiver = item.pur_receiver;
        }
    
        purchase_ids.push(item.purchase_uid);
        purchase_group = item.pur_group;
      });
    
      const owner_payment = parseFloat(received_amt - management_fee - other_expense);
    
      // Assign the aggregated object for this group as a key-value pair
      acc[purchase_group] = {
        owner_payment,
        management_fee,
        other_expense
      };
    
      return acc;
    }, {});

    return result

  }

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



  // useEffect(() => {
  //   console.log("selectedPayments - ", selectedPayments);
  // }, [selectedPayments]);

  useEffect(() => {
    // console.log(" inside use effect of unverified data- ", props.data)
    setData(props.data);
  }, [props.data]);

  useEffect(() => {
    props.setSelectedPayments( (prevState) => {
        const updatedPaymentData = prevState?.filter(
            (payment) => selectedPayments.some((selected) => selected.id === payment.id)
        );

        const newPayments = selectedPayments.filter(
            (selected) => !updatedPaymentData.some((payment) => payment.id === selected.id)
          );
        return [
            ...updatedPaymentData, 
            ...newPayments,
        ];
    })
  }, [selectedPayments]);

  useEffect(() => {    
    if(props.sortBy) {
        switch(props.sortBy){
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
      // setSelectedPayments(data);
      setSelectedPayments([])
      let filteredRows = [];

      if(props.selectedProperty != null || props.selectedProperty !== "ALL"){
        filteredRows = data?.filter( item => item.pur_property_id === props.selectedProperty)
      }else {
        filteredRows = data;
      }
      
      const expense = filterTransactions(props.revenueData)

      if(selectedPurchaseGroup && selectedPurchaseGroup !== ""){
        setSelectedRows(
          filteredRows
            .filter((row) => row.pur_group === selectedPurchaseGroup)
            .map((row) => row.payment_id) 
        );
      
      }else{
        setSelectedRows([]);
      }

      setPaymentDueResult(
        data.map((item, index) => ({
          ...item,
          ...expense[item.pur_group],
          index: index,
          // pur_amount_due: parseFloat(item.pur_amount_due?item.pur_amount_due : "0.00"),
        }))
      );

      

    }else if(data && data.length === 0){
      setPaymentDueResult([])
      setSelectedPayments([])
      setSelectedRows([])
    }
  }, [data]);

  useEffect(() => {
    // console.log("selectedRows - ", selectedRows);
    const total = selectedRows?.reduce((total, rowId) => {
      const payment = paymentDueResult.find((row) => row.payment_id === rowId);
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
    
    //
    {
      field: "total_paid",
      headerName: "Total Paid",
      flex: 0.8,
      renderCell: (params) => <Box sx={commonStyles}>{parseFloat(params.value).toFixed(2) || 0.00}</Box>,
      renderHeader: (params) => <Box sx={{fontSize: theme.typography.smallFont,}}><strong>{params.colDef.headerName}</strong></Box>,
    }, 
    {
      field: "purchase_type",
      headerName: "Type",
      flex: 0.8,
      renderCell: (params) => <Box sx={commonStyles}>{params.value}</Box>,
      renderHeader: (params) => <Box sx={{fontSize: theme.typography.smallFont,}}><strong>{params.colDef.headerName}</strong></Box>,
    },
    {
      field: "pur_group",
      headerName: "Group",
      flex: 1,
      renderCell: (params) => <Box sx={commonStyles}>{params.value}</Box>,
      renderHeader: (params) => <Box sx={{fontSize: theme.typography.smallFont,}}><strong>{params.colDef.headerName}</strong></Box>,
    },
    {
      field: "cf_month",
      headerName: "Month",
      flex: 0.7,
      renderCell: (params) => <Box sx={commonStyles}>{params.value}</Box>,
      renderHeader: (params) => <Box sx={{fontSize: theme.typography.smallFont,}}><strong>{params.colDef.headerName}</strong></Box>,
    },
    {
      field: "cf_year",
      headerName: "Year",
      flex: 0.5,
      renderCell: (params) => <Box sx={commonStyles}>{params.value}</Box>,
      renderHeader: (params) => <Box sx={{fontSize: theme.typography.smallFont,}}><strong>{params.colDef.headerName}</strong></Box>,
    },
    {
        field: "payment_date",
        headerName: "Payment Date",
        flex: 1,
        renderCell: (params) => <Box sx={commonStyles}>{params.value? params.value.split(" ")[0] : "-"}</Box>,
        renderHeader: (params) => <Box sx={{fontSize: theme.typography.smallFont,}}><strong>{params.colDef.headerName}</strong></Box>,
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
    // {
    //   field: "pur_amount_due",
    //   headerName: "Amount Due",
    //   flex: 2,
    //   renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    // },
    {
      field: "pay_amount",
      headerName: "Pay Amount",
      flex: 0.7,
      renderCell: (params) => <Box sx={commonStyles}>{parseFloat(params.value).toFixed(2) || 0.00}</Box>,
      renderHeader: (params) => <Box sx={{fontSize: theme.typography.smallFont,}}><strong>{params.colDef.headerName}</strong></Box>,
    },
    
    {
      field: "owner_payment",
      headerName: "Owner Payment",
      flex: 0.7,
      renderCell: (params) => <Box sx={commonStyles}>{params.value? parseFloat(params.value).toFixed(2) : "-"}</Box>,
      renderHeader: (params) => <Box sx={{fontSize: theme.typography.smallFont,}}><strong>{params.colDef.headerName}</strong></Box>,
    },
    {
      field: "management_fee",
      headerName: "Management Fee",
      flex: 0.7,
      renderCell: (params) => <Box sx={commonStyles}>{params.value? parseFloat(params.value).toFixed(2) : "-"}</Box>,
      renderHeader: (params) => <Box sx={{fontSize: theme.typography.smallFont,}}><strong>{params.colDef.headerName}</strong></Box>,
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
    // console.log("remove rows - ", removedRows);

    let updatedRowSelectionModel = [...newRowSelectionModel];


    if (addedRows.length > 0) {
      // console.log("Added rows: ", addedRows);
      let newPayments = [];

      addedRows.forEach((item, index) => {
        // console.log("item - ", item);
        // const addedPayment = paymentDueResult.find((row) => row.purchase_uid === addedRows[index]);
        const addedPayment = paymentDueResult.find((row) => row.payment_id === item);

        if (addedPayment) {
          // const relatedPayments = paymentDueResult.filter((row) => row.payment_intent === addedPayment.payment_intent);
          const relatedPayments = paymentDueResult.filter((row) => (row.pur_payer + row.payment_date + row.payment_intent) === (addedPayment.pur_payer + addedPayment.payment_date + addedPayment.payment_intent));

          newPayments = [...newPayments, ...relatedPayments];
          const relatedRowIds = relatedPayments.map((payment) => payment.payment_id);
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
        let removedPayment = paymentDueResult.find((row) => row.payment_id === item);
        let relatedPayments = []

        if(removedPayment){
          relatedPayments = paymentDueResult.filter((row) => (row.pur_payer + row.payment_date + row.payment_intent) === (removedPayment.pur_payer + removedPayment.payment_date + removedPayment.payment_intent));
          relatedRows = relatedPayments.map((payment) => payment.payment_id);
        }

        removedPayments.push(removedPayment);
        removedPayments.push(relatedPayments)
      });
      const allRowRemove = [...new Set([...removedRows, ...relatedRows])];

      updatedRowSelectionModel = updatedRowSelectionModel.filter((payment) => !allRowRemove.includes(payment));
      setSelectedPayments((prevState) => prevState.filter((payment) => !allRowRemove.includes(payment.payment_id)));
    }

    // setSelectedRows(newRowSelectionModel);
    setSelectedRows(updatedRowSelectionModel);
  };

  const handleVerifyPayments = async () => {
    // console.log("In handleVerifyPayments");

    console.log("before pasing it selectedPayments - ", selectedPayments);
    const formData = new FormData();
    const verifiedList = selectedPayments?.map((payment) => payment.payment_id);
    // console.log("verifiedList - ", verifiedList);
    formData.append("payment_uid", JSON.stringify(verifiedList));
    formData.append("payment_verify", "Verified");

    // return;

    // for testing
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
        <Grid item xs={12} sx={{ overflowX: "auto" }}>
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
              // minWidth: "1000px"
            }}
            getRowId={(row) => row.payment_id}
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
              // handleOnClickNavigateToMaintenance(row);
            }}
              sortModel={sortModel}

            //   onRowClick={(row) => handleOnClickNavigateToMaintenance(row)}
          />
        </Grid>
        {/* {selectedRows.length > 0 && (
          <div>Total selected amount: ${selectedRows.reduce((total, rowId) => total + parseFloat(paymentDueResult.find((row) => row.purchase_uid === rowId).pur_amount_due), 0)}</div>
        )} */}
        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} alignItems='center' sx={{ paddingTop: "15px" }}>
          <Grid item xs={1} alignItems='center'></Grid>
          <Grid item xs={7} alignItems='center' display={"flex"} flexDirection={"row"}>
            <Typography
              sx={{
                color: theme.typography.primary.blue,
                // color: paymentDueResult.ps === "UNPAID" ? "green" : "red", // Set color based on condition
                fontWeight: theme.typography.medium.fontWeight,
                fontSize: theme.typography.smallFont,
                fontFamily: "Source Sans Pro",
              }}
            >
              Total Verified:
            </Typography>
            <Typography
              sx={{
                color: theme.typography.primary.blue,
                fontWeight: theme.typography.medium.fontWeight,
                fontSize: theme.typography.smallFont,
                fontFamily: "Source Sans Pro",
                marginLeft: "20px"
              }}
            >
              {/* $ {selectedRows.reduce((total, rowId) => total + paymentDueResult.find((row) => row.purchase_uid === rowId).pur_amount_due, 0)} */}$ {totalVerified}
            </Typography>
          </Grid>

          <Grid item xs={3} alignItems='right'>
          {/* <Button
              variant='outlined'
              id='complete_verification'
              // className={classes.button}
              sx={{
                // height: "100%",
                // width: "60%",
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
            </Button> */}
            <Button
              sx={{
                width: "170px",
                backgroundColor: "#3D5CAC",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#3D5CAC",
                },
              }}
              onClick={() => {
                handleVerifyPayments();
              }}
            >
              <Typography sx={{ fontSize: "12px", fontWeight: "bold", color: "#FFFFFF" }}>Verify</Typography>
            </Button>
          </Grid>
        </Grid>
      </>
    );
  } else {
    return <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '7px',
          width: '100%',
          height:"30px"
        }}
      >
        <Typography
          sx={{
            color: "#A9A9A9",
            fontWeight: theme.typography.primary.fontWeight,
            fontSize: "15px",
          }}
        >
          No Verification Remaining 
        </Typography>
      </Box>
  </>;;
  }
}



export default ManagerProfitability;
