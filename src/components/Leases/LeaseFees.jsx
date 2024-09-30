import { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Grid, Typography, Box, IconButton, Button, Modal, Stack, TextField, InputAdornment, Select, MenuItem } from "@mui/material";
import theme from "../../theme/theme";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import { getDateAdornmentString } from "../../utils/dates";
import { Close } from "@mui/icons-material";
import { makeStyles } from "@material-ui/core/styles";
import { ReactComponent as CalendarIcon } from "../../images/datetime.svg";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers";
import ListsContext from "../../contexts/ListsContext";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { parse } from "date-fns";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiFilledInput-root": {
      backgroundColor: "#D6D5DA !important",
      borderRadius: "10px !import",
      height: "30px !important",
      marginBlock: 10,
      paddingBottom: "15px !important",
    },
    "& input:-webkit-autofill": {
      backgroundColor: "#D6D5DA !important",
      color: "#000000 !important",
      transition: "background-color 0s 600000s, color 0s 600000s !important",
    },
    "& input:-webkit-autofill:focus": {
      transition: "background-color 0s 600000s, color 0s 600000s !important",
    },
  },
  select: {
    backgroundColor: "#D6D5DA",
    height: 30,
    borderRadius: "10px !important",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#D6D5DA",
    },
  },
}));

const LeaseFees = ({ leaseFees, isEditable, setLeaseFees, setDeleteFees }) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { getList } = useContext(ListsContext);
  const feeFrequencies = getList("frequency");
  const feeRevenues = getList("revenue");
  const [currentRow, setCurrentRow] = useState({
    fee_name: "",
    fee_type: "",
    charge: "",
    frequency: "Monthly",
    due_by: "",
    due_by_date: "",
    available_topay: "",
    late_by: "",
    late_fee: "",
    perDay_late_fee: "",
  });

  const handleClose = () => {
    setCurrentRow({
      fee_name: "",
      fee_type: "$",
      charge: "",
      frequency: "Monthly",
      due_by: "",
      due_by_date: "",
      available_topay: "",
      late_by: "",
      late_fee: "",
      perDay_late_fee: "",
    });
    setOpen(false);
  };
  // const valueToDayMap = new Map([
  //   [0, "Monday"],
  //   [1, "Tuesday"],
  //   [2, "Wednesday"],
  //   [3, "Thursday"],
  //   [4, "Friday"],
  //   [5, "Saturday"],
  //   [6, "Sunday"],
  //   [7, "Monday - Week 2"],
  //   [8, "Tuesday - Week 2"],
  //   [9, "Wednesday - Week 2"],
  //   [10, "Thursday - Week 2"],
  //   [11, "Friday - Week 2"],
  //   [12, "Saturday - Week 2"],
  //   [13, "Sunday - Week 2"],
  // ]);

  const biweeklyDueByValuetoDayMap = {
    0: "Monday - week 1",
    1: "Tuesday - week 1",
    2: "Wednesday - week 1",
    3: "Thursday - week 1",
    4: "Friday - week 1",
    5: "Saturday - week 1",
    6: "Sunday - week 1",
    7: "Monday - week 2",
    8: "Tuesday - week 2",
    9: "Wednesday - week 2",
    10: "Thursday - week 2",
    11: "Friday - week 2",
    12: "Saturday - week 2",
    13: "Sunday - week 2",
  };

  const weeklyDueByValuetoDayMap = {
    0: "Monday",
    1: "Tuesday",
    2: "Wednesday",
    3: "Thursday",
    4: "Friday",
    5: "Saturday",
    6: "Sunday",
  };

  const getFeesDueBy = (fee) => {
    if (fee.frequency === "Bi-Weekly") {
      return fee.due_by !== ""? biweeklyDueByValuetoDayMap[fee.due_by] : "-";
    } else if (fee.frequency === "Weekly") {
      return fee.due_by !== "" ? weeklyDueByValuetoDayMap[fee.due_by] : "-";
    } else if (fee.frequency === "Monthly" || fee.frequency === "Quarterly" || fee.frequency === "Semi-Monthly") {
      return fee.due_by !== "" ? `${fee.due_by}${getDateAdornmentString(fee.due_by)} of the month` : "-";
    } else if (fee.frequency === "One Time" || fee.frequency === "Annually" || fee.frequency === "Semi-Annually") {
      return fee.due_by_date !== "" ? `${fee.due_by_date}` : "No Due Date";
    } else{
      return "-";
    }
  };

  const getFeesLateBy = (fee) => {
    if (fee.frequency === "Bi-Weekly" || fee.frequency === "Weekly" || fee.frequency === "Monthly" || fee.frequency === "Annually" || fee.frequency === "One Time" || fee.frequency === "Semi-Annually" || fee.frequency === "Quarterly" || fee.frequency === "Semi-Monthly") {
      return fee.late_by !== "" ? `${fee.late_by}${getDateAdornmentString(fee.late_by)} day after due` : "-";
    } else {
      return "-";
    }
  };

  const getFeesAvailableToPay = (fee) => {
    if (fee.frequency === "Bi-Weekly" || fee.frequency === "Weekly" || fee.frequency === "Monthly" || fee.frequency === "Annually" || fee.frequency === "One Time" || fee.frequency === "Semi-Annually" || fee.frequency === "Quarterly" || fee.frequency === "Semi-Monthly") {
      return fee.available_topay !== "" ? `${fee.available_topay} days before due` : "-";
    } else {
      return "-";
    }
  };

  const dayOptionsForWeekly = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" },
  ];

  const dayOptionsForBiWeekly = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" },
    { value: "monday-week-2", label: "Monday - week 2" },
    { value: "tuesday-week-2", label: "Tuesday - week 2" },
    { value: "wednesday-week-2", label: "Wednesday - week 2" },
    { value: "thursday-week-2", label: "Thursday - week 2" },
    { value: "friday-week-2", label: "Friday - week 2" },
    { value: "saturday-week-2", label: "Saturday - week 2" },
    { value: "sunday-week-2", label: "Sunday - week 2" },
  ];

  const lateByOptionsForWeekly = [
    { value: 1, label: "1st day after due date" },
    { value: 2, label: "2nd day after due date" },
    { value: 3, label: "3rd day after due date" },
    { value: 4, label: "4th day after due date" },
    { value: 5, label: "5th day after due date" },
    { value: 6, label: "6th day after due date" },
    { value: 7, label: "7th day after due date" },
  ];

  const lateByOptionsForBiWeekly = [
    { value: 1, label: "1st day after due date" },
    { value: 2, label: "2nd day after due date" },
    { value: 3, label: "3rd day after due date" },
    { value: 4, label: "4th day after due date" },
    { value: 5, label: "5th day after due date" },
    { value: 6, label: "6th day after due date" },
    { value: 7, label: "7th day after due date" },
    { value: 8, label: "8th day after due date" },
    { value: 9, label: "9th day after due date" },
    { value: 10, label: "10th day after due date" },
    { value: 11, label: "11th day after due date" },
    { value: 12, label: "12th day after due date" },
    { value: 13, label: "13th day after due date" },
    { value: 14, label: "14th day after due date" },
  ];

  const availableToPayOptionsForWeekly = [
    { value: 1, label: "1 day before due date" },
    { value: 2, label: "2 days before due date" },
    { value: 3, label: "3 days before due date" },
    { value: 4, label: "4 days before due date" },
    { value: 5, label: "5 days before due date" },
    { value: 6, label: "6 days before due date" },
    { value: 7, label: "7 days before due date" },
  ];

  const availableToPayOptionsForBiWeekly = [
    { value: 1, label: "1 day before due date" },
    { value: 2, label: "2 days before due date" },
    { value: 3, label: "3 days before due date" },
    { value: 4, label: "4 days before due date" },
    { value: 5, label: "5 days before due date" },
    { value: 6, label: "6 days before due date" },
    { value: 7, label: "7 days before due date" },
    { value: 8, label: "8 days before due date" },
    { value: 9, label: "9 days before due date" },
    { value: 10, label: "10 days before due date" },
    { value: 11, label: "11 days before due date" },
    { value: 12, label: "12 days before due date" },
    { value: 13, label: "13 days before due date" },
    { value: 14, label: "14 days before due date" },
  ];

  const daytoValueMap = new Map([
    ["monday", 0],
    ["tuesday", 1],
    ["wednesday", 2],
    ["thursday", 3],
    ["friday", 4],
    ["saturday", 5],
    ["sunday", 6],
    ["monday-week-2", 7],
    ["tuesday-week-2", 8],
    ["wednesday-week-2", 9],
    ["thursday-week-2", 10],
    ["friday-week-2", 11],
    ["saturday-week-2", 12],
    ["sunday-week-2", 13],
  ]);

  const valueToDayMap = new Map(Array.from(daytoValueMap, ([key, value]) => [value, key]));

  const columns = isEditable
    ? [
        {
          field: "fee_name",
          headerName: "Name",
          flex: 1,
          renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
        },
        {
          field: "fee_type",
          headerName: "Type",
          flex: 1,
          renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
        },
        {
          field: "frequency",
          headerName: "Frequency",
          flex: 1,
          renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
        },
        {
          field: "charge",
          headerName: "Amount",
          flex: 0.8,
          renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
          renderCell: (params) => <Typography>{`$ ${params.row.charge}`}</Typography>,
        },
        {
          field: "due_by",
          headerName: "Due By",
          flex: 1.5,
          renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
          renderCell: (params) => (
            <Typography>
              {/* {params.row.frequency === "Monthly" && `${params.row.due_by}${getDateAdornmentString(params.row.due_by)} of every month`}
            {params.row.frequency === "One Time" && `${params.row.due_by_date}`}
            {(params.row.frequency === "Weekly"  || params.row.frequency === "Bi-Weekly") && `${valueToDayMap.get(params.row.due_by)}`} */}
              {getFeesDueBy(params.row)}
            </Typography>
          ),
        },
        {
          field: "available_topay",
          headerName: "Available To Pay",
          flex: 1.5,
          renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
          renderCell: (params) => (
            <Typography>
              {/* { (
                params.row.frequency === "Monthly" || 
                params.row.frequency === "Weekly" ||
                params.row.frequency === "Bi-Weekly" ||
                params.row.frequency === "One Time"
              )
              && `${params.row.available_topay} days before`} */}
              {getFeesAvailableToPay(params.row)}
            </Typography>
          ),
        },
        {
          field: "late_by",
          headerName: "Late By",
          flex: 1.4,
          renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
          renderCell: (params) => (
            <Typography>
              {/* {(
                params.row.frequency === "Monthly" || 
                params.row.frequency === "Weekly" ||
                params.row.frequency === "Bi-Weekly" ||
                params.row.frequency === "One Time"
              ) 
            && `${params.row.available_topay} days after`} */}
              {getFeesLateBy(params.row)}
            </Typography>
          ),
        },
        {
          field: "late_fee",
          headerName: "Late Fee",
          flex: 0.7,
          renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
          renderCell: (params) => <Typography>{params.row.late_fee !== ""  ? `$ ${params.row.late_fee}` : "-"}</Typography>,
        },
        {
          field: "perDay_late_fee",
          flex: 1,
          renderHeader: (params) => (
            <strong style={{ lineHeight: 1.2, display: "inline-block", textAlign: "center" }}>
              Late Fee <br /> Per Day
            </strong>
          ),
          renderCell: (params) => <Typography>{params.row.perDay_late_fee !== "" ? `$ ${params.row.perDay_late_fee}` : "-"}</Typography>,
        },
        {
          field: "editactions",
          headerName: "",
          flex: 0.5,
          renderCell: (params) => (
            <Box>
              <IconButton
                onClick={() => {
                  handleClickEditFee(params.row);
                }}
              >
                <EditIcon sx={{ fontSize: "19px", color: "#3D5CAC" }} />
              </IconButton>
            </Box>
          ),
        },
        {
          field: "deleteactions",
          headerName: "",
          flex: 0.5,
          renderCell: (params) => (
            <Box>
              <IconButton
                onClick={() => {
                  handleDeleteClickFee(params.row.id);
                }}
              >
                <DeleteIcon sx={{ fontSize: "19px", color: "#3D5CAC" }} />
              </IconButton>
            </Box>
          ),
        },
      ]
    : [
        {
          field: "fee_name",
          headerName: "Name",
          flex: 1,
          renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
        },
        {
          field: "fee_type",
          headerName: "Type",
          flex: 1,
          renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
        },
        {
          field: "frequency",
          headerName: "Frequency",
          flex: 1,
          renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
        },
        {
          field: "charge",
          headerName: "Amount",
          flex: 0.8,
          renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
          renderCell: (params) => <Typography>{`$ ${params.row.charge}`}</Typography>,
        },
        {
          field: "due_by",
          headerName: "Due By",
          flex: 1.5,
          renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
          renderCell: (params) => (
            <Typography>
              {/* {params.row.frequency === "Monthly" && `${params.row.due_by}${getDateAdornmentString(params.row.due_by)} of every month`}
            {params.row.frequency === "One Time" && `${params.row.due_by_date}`}
            {(params.row.frequency === "Weekly"  || params.row.frequency === "Bi-Weekly") && `${valueToDayMap.get(params.row.due_by)}`} */}
              {getFeesDueBy(params.row)}
            </Typography>
          ),
        },
        {
          field: "available_topay",
          headerName: "Available To Pay",
          flex: 1.5,
          renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
          renderCell: (params) => (
            <Typography>
              {/* { (
                params.row.frequency === "Monthly" || 
                params.row.frequency === "Weekly" ||
                params.row.frequency === "Bi-Weekly" ||
                params.row.frequency === "One Time"
              )
              && `${params.row.available_topay} days before`} */}
              {getFeesAvailableToPay(params.row)}
            </Typography>
          ),
        },
        {
          field: "late_by",
          headerName: "Late By",
          flex: 1.4,
          renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
          renderCell: (params) => (
            <Typography>
              {/* {(
                params.row.frequency === "Monthly" || 
                params.row.frequency === "Weekly" ||
                params.row.frequency === "Bi-Weekly" ||
                params.row.frequency === "One Time"
              ) 
            && `${params.row.available_topay} days after`} */}
              {getFeesLateBy(params.row)}
            </Typography>
          ),
        },
        {
          field: "late_fee",
          headerName: "Late Fee",
          flex: 0.7,
          renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
          renderCell: (params) => <Typography>{`$ ${params.row.late_fee}`}</Typography>,
        },
        {
          field: "perDay_late_fee",
          flex: 1,
          renderHeader: (params) => (
            <strong style={{ lineHeight: 1.2, display: "inline-block", textAlign: "center" }}>
              Late Fee <br /> Per Day
            </strong>
          ),
          renderCell: (params) => <Typography>{`$ ${params.row.perDay_late_fee}`}</Typography>,
        },
      ];

  const rowsWithId = leaseFees.map((row, index) => ({
    id: row.id ? index : index,
    fee_name: row.fee_name ?? "",
    fee_type: row.fee_type ?? "",
    charge: row.charge ?? "",
    frequency: row.frequency ?? "Monthly",
    due_by: row.due_by ?? "",
    due_by_date: row.due_by_date ?? "",
    available_topay: row.available_topay ?? "",
    late_by: row.late_by ?? "",
    late_fee: row.late_fee ?? "",
    perDay_late_fee: row.perDay_late_fee ?? "",
  }));

  const checkRequiredField = () => {
    if (
      currentRow.fee_name === ""||
      currentRow.fee_type === "" ||
      currentRow.charge === "" ||
      currentRow.late_fee === "" ||
      currentRow.perDay_late_fee === "" ||
      currentRow.late_by === "" ||
      currentRow.available_topay === ""
    ) {
      alert("enter all required fields");
      return false;
    }

    if (currentRow.frequency === "One Time" || currentRow.frequency === "Annually" || currentRow.frequency === "Semi-Annually") {
      if (currentRow.due_by_date && isNaN(Date.parse(currentRow.due_by_date))) {
        alert("Wrong due_by date -", currentRow.due_by_date);
        return false;
      }
    } else if (currentRow.due_by === "" || isNaN(currentRow.due_by)) {
      alert("Enter due_by in number format");
      return false;
    }

    if (isNaN(currentRow.late_by) || isNaN(currentRow.available_topay)) {
      alert("Enter numbers only for late_by or available_topay");
      return false;
    }

    return true;
  };

  const handleAddFee = () => {
    const check = checkRequiredField();

    if (check) {
      const { id, ...newFees } = currentRow;
      let newFee;

      if (currentRow.frequency === "One Time" || currentRow.frequency === "Annually" || currentRow.frequency === "Semi-Annually") {
        if (!currentRow.due_by_date) {
          newFee = {
            ...newFees,
            due_by: "",
            due_by_date: dayjs().format("MM-DD-YYYY"),
            late_by: parseInt(currentRow.late_by),
            available_topay: parseInt(currentRow.available_topay),
          };
        } else {
          newFee = {
            ...newFees,
            due_by: "",
            late_by: parseInt(currentRow.late_by),
            available_topay: parseInt(currentRow.available_topay),
          };
        }
      } else {
        newFee = {
          ...newFees,
          due_by: parseInt(currentRow.due_by),
          due_by_date: "",
          late_by: parseInt(currentRow.late_by),
          available_topay: parseInt(currentRow.available_topay),
        };
      }

      setLeaseFees((prev) => [...prev, newFee]);

      setCurrentRow({
        fee_name: "",
        fee_type: "$",
        charge: "",
        frequency: "Monthly",
        due_by: "",
        due_by_date: "",
        available_topay: "",
        late_by: "",
        late_fee: "",
        perDay_late_fee: "",
      });

      setOpen(false);
    }
  };

  const handleClickEditFee = (row) => {
    // const {id, ...currentFee} = row;
    // setCurrentEditingIndex(row.id);
    console.log("edit click ", row);
    setCurrentRow(row);
    setIsEditing(true);
    setOpen(true);
  };

  const handleDeleteClickFee = (index) => {
    if(leaseFees[index].leaseFees_uid){
      // console.log(leaseFees[index].leaseFees_uid)
      setDeleteFees((prev)=> [...prev, leaseFees[index].leaseFees_uid]);
    }
    const list = [...leaseFees];
    list.splice(index, 1);
    setLeaseFees(list);
  };

  const handleEditFee = () => {
    const check = checkRequiredField();

    if (check) {
      const { id, ...newFees } = currentRow;

      let newFee;

      if (currentRow.frequency === "One Time" || currentRow.frequency === "Annually" || currentRow.frequency === "Semi-Annually") {
        if (!currentRow.due_by_date) {
          newFee = {
            ...newFees,
            due_by: "",
            due_by_date: dayjs().format("MM-DD-YYYY"),
            late_by: parseInt(currentRow.late_by),
            available_topay: parseInt(currentRow.available_topay),
          };
        } else {
          newFee = {
            ...newFees,
            due_by: "",
            late_by: parseInt(currentRow.late_by),
            available_topay: parseInt(currentRow.available_topay),
          };
        }
      } else {
        newFee = {
          ...newFees,
          due_by: parseInt(currentRow.due_by),
          due_by_date: "",
          late_by: parseInt(currentRow.late_by),
          available_topay: parseInt(currentRow.available_topay),
        };
      }

      setLeaseFees((prev) => prev.map((fee, index) => (index === id ? newFee : fee)));

      setCurrentRow({
        fee_name: "",
        fee_type: "$",
        charge: "",
        frequency: "Monthly",
        due_by: "",
        due_by_date: "",
        available_topay: "",
        late_by: "",
        late_fee: "",
        perDay_late_fee: "",
      });
      setOpen(false);
    }
  };

  return (
    <>
      {/* Lease fees heading and add icon */}
      <Grid container item direction={"row"} xs={12}>
        <Grid item xs={11.5}>
          <Typography
            sx={{
              color: "#160449",
              fontWeight: "bold",
              fontSize: "18px",
              paddingBottom: "5px",
              paddingTop: "5px",
              marginTop: "10px",
            }}
          >
            Lease Fees:
          </Typography>
        </Grid>

        {isEditable && (
          <Grid item xs={0.5}>
            <Button
              sx={{
                "&:hover, &:focus, &:active": { background: theme.palette.primary.main },
                cursor: "pointer",
                textTransform: "none",
                minWidth: "40px",
                minHeight: "40px",
                width: "40px",
                marginTop: "5px",
                fontWeight: theme.typography.secondary.fontWeight,
                fontSize: theme.typography.smallFont,
              }}
              size='small'
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(false);
                setOpen(true);
              }}
            >
              <AddIcon sx={{ color: "#3D5CAC", fontSize: "20px" }} />
            </Button>
          </Grid>
        )}
      </Grid>

      {/* Lease fees data grid */}
      <Grid item xs={12} sx={{ overflowX: "auto" }}>
        <DataGrid
          rows={rowsWithId}
          columns={columns}
          sx={{
            marginTop: "10px",
            minWidth: "1000px",
          }}
          rowHeight={30}
          hideFooter={true}
        />
      </Grid>

      <Modal open={open} onClose={handleClose} aria-labelledby='add-document-modal' aria-describedby='add-document-description'>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 841,
            height: 500,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          {/* Close button */}
          <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
            <Typography
              id='add-document-modal'
              variant='h6'
              component='h2'
              textAlign='center'
              sx={{
                color: "#160449",
                fontWeight: theme.typography.primary.fontWeight,
                fontSize: theme.typography.small,
                flexGrow: 1,
                textAlign: "center",
              }}
            >
              Lease Fees
            </Typography>
            <Button
              onClick={handleClose}
              sx={{
                ml: "auto",
                "&:hover": {
                  "& svg": {
                    color: "#ffffff",
                  },
                },
              }}
            >
              <Close
                sx={{
                  color: theme.typography.primary.black,
                  fontSize: "20px",
                }}
              />
            </Button>
          </Box>

          {/* Container with all fields */}
          <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
            <Grid item xs={6}>
              <Stack spacing={-2} m={2}>
                <Typography
                  sx={{
                    color: theme.typography.propertyPage.color,
                    fontFamily: "Source Sans Pro",
                    fontWeight: theme.typography.common.fontWeight,
                    fontSize: theme.typography.smallFont,
                  }}
                >
                  {"Fee Name "}
                  <span style={{ color: "red" }}>*</span>
                </Typography>
                <TextField
                  name='fee_name'
                  value={currentRow.fee_name}
                  variant='filled'
                  fullWidth
                  className={classes.root}
                  onChange={(e) => {
                    setCurrentRow((prev) => {
                      return {
                        ...prev,
                        fee_name: e.target.value,
                      };
                    });
                  }}
                />
              </Stack>
            </Grid>

            <Grid item xs={6}>
              <Stack spacing={-2} m={2}>
                <Typography
                  sx={{
                    color: theme.typography.propertyPage.color,
                    fontFamily: "Source Sans Pro",
                    fontWeight: theme.typography.common.fontWeight,
                    fontSize: theme.typography.smallFont,
                    paddingBottom: 5,
                  }}
                >
                  {"Fee Type "}
                  <span style={{ color: "red" }}>*</span>
                </Typography>
                <Select
                  value={currentRow.fee_type}
                  size='small'
                  fullWidth
                  onChange={(e) => {
                    setCurrentRow((prev) => {
                      return {
                        ...prev,
                        fee_type: e.target.value,
                      };
                    });
                  }}
                  placeholder='Select Fee Type'
                  className={classes.select}
                >
                  {feeRevenues?.map((rev) => (
                    <MenuItem key={rev.list_uid} value={rev.list_item}>
                      {rev.list_item}
                    </MenuItem>
                  ))}
                </Select>
              </Stack>
            </Grid>

            <Grid item xs={6}>
              <Stack spacing={-2} m={2}>
                <Typography
                  sx={{
                    color: theme.typography.propertyPage.color,
                    fontFamily: "Source Sans Pro",
                    fontWeight: theme.typography.common.fontWeight,
                    fontSize: theme.typography.smallFont,
                  }}
                >
                  {"Charge "}
                  <span style={{ color: "red" }}>*</span>
                </Typography>
                <TextField
                  name='charge'
                  value={currentRow.charge}
                  variant='filled'
                  fullWidth
                  className={classes.root}
                  onChange={(e) => {
                    setCurrentRow((prev) => {
                      return {
                        ...prev,
                        charge: e.target.value,
                      };
                    });
                  }}
                />
              </Stack>
            </Grid>
            <Grid item xs={6}></Grid>
            <Grid item xs={6}>
              <Stack spacing={-2} m={2}>
                <Typography
                  sx={{
                    color: theme.typography.propertyPage.color,
                    fontFamily: "Source Sans Pro",
                    fontWeight: theme.typography.common.fontWeight,
                    fontSize: theme.typography.smallFont,
                    paddingBottom: 5,
                  }}
                >
                  {"Frequency "}
                  <span style={{ color: "red" }}>*</span>
                </Typography>
                <Select
                  value={currentRow.frequency}
                  size='small'
                  fullWidth
                  onChange={(e) => {
                    setCurrentRow((prev) => {
                      return {
                        ...prev,
                        frequency: e.target.value,
                      };
                    });
                  }}
                  placeholder='Select frequency'
                  className={classes.select}
                >
                  {feeFrequencies?.map((freq) => (
                    <MenuItem key={freq.list_uid} value={freq.list_item}>
                      {freq.list_item}
                    </MenuItem>
                  ))}
                </Select>
              </Stack>
            </Grid>
            <Grid item xs={6}>
              <Stack spacing={-2} m={2}>
                <Typography
                  sx={{
                    color: theme.typography.propertyPage.color,
                    fontFamily: "Source Sans Pro",
                    fontWeight: theme.typography.common.fontWeight,
                    fontSize: theme.typography.smallFont,
                  }}
                >
                  {"Due By "}
                  <span style={{ color: "red" }}>*</span>
                </Typography>
                {(currentRow.frequency === "Monthly" ||
                  currentRow.frequency === "Semi-Monthly" ||
                  currentRow.frequency === "Quarterly") && (
                  <TextField
                    name='due_by'
                    value={currentRow.due_by !== null && currentRow.due_by !== "" ? currentRow.due_by : ""}
                    variant='filled'
                    fullWidth
                    className={classes.root}
                    onChange={(e) => {
                      setCurrentRow((prev) => {
                        return {
                          ...prev,
                          due_by: e.target.value,
                        };
                      });
                    }}
                    InputProps={{
                      endAdornment: <InputAdornment position='start'>{getDateAdornmentString(currentRow.due_by)}</InputAdornment>,
                    }}
                  />
                )}
                {(currentRow.frequency === "One Time" || currentRow.frequency === "Annually" || currentRow.frequency === "Semi-Annually") && (
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      value={currentRow.due_by_date !== null && currentRow.due_by_date !== "" ? dayjs(currentRow.due_by_date) : dayjs()}
                      minDate={dayjs()}
                      onChange={(v) => {
                        setCurrentRow((prev) => {
                          console.log(v.format("MM-DD-YYYY"));
                          return {
                            ...prev,
                            due_by_date: v.format("MM-DD-YYYY"),
                          };
                        });
                      }}
                      slots={{
                        openPickerIcon: CalendarIcon,
                      }}
                      slotProps={{
                        textField: {
                          size: "small",
                          style: {
                            width: "100%",
                            fontSize: 12,
                            backgroundColor: "#F2F2F2 !important",
                            borderRadius: "10px !important",
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>
                )}
                {(currentRow.frequency === "Weekly" || currentRow.frequency === "Bi-Weekly") && (
                  <Box
                    sx={{
                      paddingTop: "10px",
                    }}
                  >
                    <Select
                      name='due_by'
                      value={currentRow.due_by !== null ? valueToDayMap.get(currentRow.due_by) : ""}
                      size='small'
                      fullWidth
                      onChange={(e) => {
                        setCurrentRow((prev) => {
                          return {
                            ...prev,
                            due_by: daytoValueMap.get(e.target.value),
                          };
                        });
                      }}
                      placeholder='Select Due By Day'
                      className={classes.select}
                      sx={{
                        margin: "auto",
                      }}
                    >
                      {currentRow.frequency &&
                        currentRow.frequency === "Weekly" &&
                        dayOptionsForWeekly.map((day) => (
                          <MenuItem key={day.value} value={day.value}>
                            {day.label}
                          </MenuItem>
                        ))}
                      {currentRow.frequency &&
                        currentRow.frequency === "Bi-Weekly" &&
                        dayOptionsForBiWeekly.map((day) => (
                          <MenuItem key={day.value} value={day.value}>
                            {day.label}
                          </MenuItem>
                        ))}
                    </Select>
                  </Box>
                )}
              </Stack>
            </Grid>
            <Grid item xs={6}>
              <Stack spacing={-2} m={2}>
                <Typography
                  sx={{
                    color: theme.typography.propertyPage.color,
                    fontFamily: "Source Sans Pro",
                    fontWeight: theme.typography.common.fontWeight,
                    fontSize: theme.typography.smallFont,
                  }}
                >
                  {"Available To Pay "}
                  <span style={{ color: "red" }}>*</span>
                </Typography>

                {(currentRow.frequency === "Monthly" ||
                  currentRow.frequency === "Semi-Monthly" ||
                  currentRow.frequency === "One Time" ||
                  currentRow.frequency === "Annually" ||
                  currentRow.frequency === "Semi-Annually" ||
                  currentRow.frequency === "Quarterly") && (
                  <TextField
                    name='available_topay'
                    value={currentRow.available_topay !== null ? currentRow.available_topay : ""}
                    variant='filled'
                    fullWidth
                    className={classes.root}
                    onChange={(e) => {
                      setCurrentRow((prev) => {
                        return {
                          ...prev,
                          available_topay: e.target.value,
                        };
                      });
                    }}
                    InputProps={{
                      endAdornment: <InputAdornment position='start'>days before</InputAdornment>,
                    }}
                  />
                )}
                {(currentRow.frequency === "Weekly" || currentRow.frequency === "Bi-Weekly") && (
                  <Box
                    sx={{
                      paddingTop: "10px",
                    }}
                  >
                    <Select
                      name='available_topay'
                      value={currentRow.available_topay !== null ? currentRow.available_topay : ""}
                      size='small'
                      fullWidth
                      onChange={(e) => {
                        setCurrentRow((prev) => {
                          return {
                            ...prev,
                            available_topay: e.target.value,
                          };
                        });
                      }}
                      placeholder='Select Available to Pay By Day'
                      className={classes.select}
                    >
                      {currentRow.frequency &&
                        currentRow.frequency === "Weekly" &&
                        availableToPayOptionsForWeekly.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      {currentRow.frequency &&
                        currentRow.frequency === "Bi-Weekly" &&
                        availableToPayOptionsForBiWeekly.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                    </Select>
                  </Box>
                )}
              </Stack>
            </Grid>
            <Grid item xs={6}>
              <Stack spacing={-2} m={2}>
                <Typography
                  sx={{
                    color: theme.typography.propertyPage.color,
                    fontFamily: "Source Sans Pro",
                    fontWeight: theme.typography.common.fontWeight,
                    fontSize: theme.typography.smallFont,
                  }}
                >
                  {"Late By "}
                  <span style={{ color: "red" }}>*</span>
                </Typography>
                {(currentRow.frequency === "Monthly" ||
                  currentRow.frequency === "Semi-Monthly" ||
                  currentRow.frequency === "One Time" ||
                  currentRow.frequency === "Annually" ||
                  currentRow.frequency === "Semi-Annually" ||
                  currentRow.frequency === "Quarterly") && (
                  <TextField
                    name='late_by'
                    value={currentRow.late_by}
                    variant='filled'
                    fullWidth
                    className={classes.root}
                    onChange={(e) => {
                      setCurrentRow((prev) => {
                        return {
                          ...prev,
                          late_by: e.target.value,
                        };
                      });
                    }}
                    InputProps={{
                      endAdornment: <InputAdornment position='start'>days after</InputAdornment>,
                    }}
                  />
                )}
                {(currentRow.frequency === "Weekly" || currentRow.frequency === "Bi-Weekly") && (
                  <Box
                    sx={{
                      paddingTop: "10px",
                    }}
                  >
                    <Select
                      name='late_by'
                      value={currentRow.late_by !== null ? currentRow.late_by : ""}
                      size='small'
                      fullWidth
                      onChange={(e) => {
                        setCurrentRow((prev) => {
                          return {
                            ...prev,
                            late_by: e.target.value,
                          };
                        });
                      }}
                      placeholder='Select Late By Day'
                      className={classes.select}
                    >
                      {currentRow.frequency &&
                        currentRow.frequency === "Weekly" &&
                        lateByOptionsForWeekly.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      {currentRow.frequency &&
                        currentRow.frequency === "Bi-Weekly" &&
                        lateByOptionsForBiWeekly.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                    </Select>
                  </Box>
                )}
              </Stack>
            </Grid>
            <Grid item xs={6}>
              <Stack spacing={-2} m={2}>
                <Typography
                  sx={{
                    color: theme.typography.propertyPage.color,
                    fontFamily: "Source Sans Pro",
                    fontWeight: theme.typography.common.fontWeight,
                    fontSize: theme.typography.smallFont,
                  }}
                >
                  {"Late Fee "}
                  <span style={{ color: "red" }}>*</span>
                </Typography>
                <TextField
                  name='late_fee'
                  value={currentRow.late_fee}
                  variant='filled'
                  fullWidth
                  className={classes.root}
                  onChange={(e) => {
                    setCurrentRow((prev) => {
                      return {
                        ...prev,
                        late_fee: e.target.value,
                      };
                    });
                  }}
                />
              </Stack>
            </Grid>
            <Grid item xs={6}>
              <Stack spacing={-2} m={2}>
                <Typography
                  sx={{
                    color: theme.typography.propertyPage.color,
                    fontFamily: "Source Sans Pro",
                    fontWeight: theme.typography.common.fontWeight,
                    fontSize: theme.typography.smallFont,
                  }}
                >
                  {"Late Fee Per Day "}
                  <span style={{ color: "red" }}>*</span>
                </Typography>
                <TextField
                  name='perDay_late_fee'
                  value={currentRow.perDay_late_fee}
                  variant='filled'
                  fullWidth
                  className={classes.root}
                  onChange={(e) => {
                    setCurrentRow((prev) => {
                      return {
                        ...prev,
                        perDay_late_fee: e.target.value,
                      };
                    });
                  }}
                />
              </Stack>
            </Grid>
          </Grid>

          {/* Save button */}
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "40px" }}>
            <Button
              onClick={isEditing ? handleEditFee : handleAddFee}
              sx={{
                background: "#3D5CAC",
                color: "#ffffff",
                marginRight: "30px",
                cursor: "pointer",
                width: "100px",
                height: "31px",
                fontWeight: theme.typography.secondary.fontWeight,
                fontSize: theme.typography.smallFont,
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#3D5CAC",
                },
              }}
            >
              {isEditing ? "Return" : "Add Fee"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default LeaseFees;
