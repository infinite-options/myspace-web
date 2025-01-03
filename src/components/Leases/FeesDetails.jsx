import React, { useContext } from "react";
import { useEffect, useState, useRef } from "react";
import {
    Typography, Box, Paper, Grid, TextField, MenuItem, Button, FormControl, InputAdornment, Select, Dialog, DialogActions, DialogContentText,
    DialogContent, DialogTitle, IconButton, Snackbar, Alert, InputLabel, Accordion, AccordionSummary, AccordionDetails,
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import theme from "../../theme/theme";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Close } from '@mui/icons-material';
import { makeStyles } from "@material-ui/core/styles";
import { isValidDate } from "../../utils/dates";
import ListsContext from "../../contexts/ListsContext";

const useStyles = makeStyles((theme) => ({
    root: {
        "& .MuiOutlinedInput-input": {
            border: 0,
            borderRadius: 3,
            color: "#3D5CAC",
            fontSize: 50,
        },
    },
}));


const FeesDetails = ({ getDateAdornmentString, setLeaseFees, leaseFees, isEditable, isMobile }) => {
    const { getList, } = useContext(ListsContext);	
	const feeBases = getList("basis");
	const feeFrequencies = getList("frequency");	
    const feeTypes = getList("revenue");

    const [currentFeeRow, setcurrentFeeRow] = useState(null);
    const [isEditing, setIsFeeEditing] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [open, setOpen] = useState(false);
    const color = theme.palette.form.main;
    const classes = useStyles();
    const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);

    const feesColumns = isEditable ? [
        {
            field: "leaseFees_uid",
            headerName: "UID",
            flex: 1,
            minWidth: 100,
        },

        {
            field: "fee_name",
            headerName: "Name",
            flex: 1,
            minWidth: 150,
        },
        {
            field: "fee_type",
            headerName: "Type",
            flex: 1,
            minWidth: 100,
        },

        {
            field: "-",
            headerName: "Description",
            flex: 1,
            minWidth: 100,
        },

        {
            field: "charge",
            headerName: "Amount",
            flex: 1,
            minWidth: 100,
        },
        {
            field: "frequency",
            headerName: "Frequency",
            flex: 1,
            minWidth: 100,
        },
        {
            field: "available_topay",
            headerName: "Days In Advance",
            flex: 1,
            minWidth: 100,
        },
        {
            field: "late_by",
            headerName: "Late",
            flex: 1,
            minWidth: 100,
        },
        {
            field: "late_fee",
            headerName: "Late Fee",
            flex: 1,
            minWidth: 100,
        },
        // {
        //     field: 'actions',
        //     headerName: 'Actions',
        //     minWidth: 100,
        //     flex: 0.7,
        //     renderCell: (params) => (
        //         <Box>
        //             <IconButton
        //                 onClick={() => handleEditFeeClick(params.row)}
        //             >
        //                 <EditIcon sx={{ color: "#3D5CAC" }} />
        //             </IconButton>
        //         </Box>
        //     )
        // }
    ] : [{
        field: "leaseFees_uid",
        headerName: "UID",
        flex: 1,
        minWidth: 100,
    },
    {
        field: "fee_name",
        headerName: "Name",
        flex: 1,
        minWidth: 100,
    },
    {
        field: "fee_type",
        headerName: "Type",
        flex: 1,
        minWidth: 100,
    },

    {
        field: "-",
        headerName: "Description",
        flex: 1,
        minWidth: 100,
    },

    {
        field: "charge",
        headerName: "Amount",
        flex: 1,
        minWidth: 100,
    },
    {
        field: "frequency",
        headerName: "Frequency",
        flex: 1,
        minWidth: 100,
    },
    {
        field: "available_topay",
        headerName: "Days In Advance",
        flex: 1,
        minWidth: 100,
    },
    {
        field: "late_by",
        headerName: "Late",
        flex: 1,
        minWidth: 100,
    },
    {
        field: "late_fee",
        headerName: "Late Fee",
        flex: 1,
        minWidth: 100,
    }];

    const handleEditFeeClick = (row) => {
        setcurrentFeeRow(row);
        setIsFeeEditing(true);
        handleFeeModalOpen();
    };

    const handleAddNewFee = () => {
        //console.log('add', currentFeeRow);
        const isAllFeildsPresent = checkRequiredFields();

        if (isAllFeildsPresent === true) {
            if (isEditing === true) {
                setLeaseFees(leaseFees.map(fee => (fee.leaseFees_uid === currentFeeRow.leaseFees_uid ? currentFeeRow : fee)));
            } else {
                setLeaseFees([...leaseFees, { ...currentFeeRow, leaseFees_uid: leaseFees ? leaseFees.length : 0 }]);
            }
            handleFeeModalClose();

        } else {
            showSnackbar("Kindly enter all the required fields", "error");
            setSnackbarOpen(true);
        };

    }

    const handleFeeModalOpen = () => setOpen(true);
    const handleFeeModalClose = () => setOpen(false);
    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
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

    const handleDueByChange = (e) => {
        const value = e.target.value;
        let currFee = { ...currentFeeRow, due_by: daytoValueMap.get(value), due_by_date: null };
        //console.log('currFee', currFee, valueToDayMap);
        setcurrentFeeRow(currFee);
    }

    const handleAvailableToPayChange = (e) => {
        const value = e.target.value;
        //console.log('avlToPay', value);
        let currFee = { ...currentFeeRow, available_topay: value };
        setcurrentFeeRow(currFee);
    };

    const handleLateByChange = (e) => {
        const value = e.target.value;
        //console.log('lateby', value);
        let currFee = { ...currentFeeRow, late_by: value };
        setcurrentFeeRow(currFee);
    };

    const showSnackbar = (message, severity) => {
        //console.log('Inside show snackbar');
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleDeleteFee = () => {
        setLeaseFees(leaseFees.filter(fee => fee.leaseFees_uid != currentFeeRow.leaseFees_uid));
        handleFeeModalClose();
    }

    const handleDeleteClick = () => {
        setOpenDeleteConfirmation(true);
    };

    const handleDeleteClose = () => {
        setOpenDeleteConfirmation(false);
    };

    const handleDeleteConfirm = () => {
        handleDeleteFee();
        setOpenDeleteConfirmation(false);
    }

    const checkRequiredFields = () => {
        let retVal = true;
        if (
            currentFeeRow.fee_name === "" ||
            currentFeeRow.fee_type === "" ||
            currentFeeRow.charge === "" ||
            currentFeeRow.frequency === "" ||
            (currentFeeRow.due_by === null && (currentFeeRow.due_by_date === null || !isValidDate(currentFeeRow.due_by_date))) ||
            currentFeeRow.late_by === null ||
            currentFeeRow.late_fee === "" ||
            currentFeeRow.available_topay === null ||
            currentFeeRow.perDay_late_fee === ""
        ) {
            retVal = false;
        }
        return retVal;
    };

    return (
        <>
        {leaseFees ?      (<Accordion sx={{ backgroundColor: color }}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="occupants-content"
                    id="occupants-header"
                >
                    <Grid container>
                        <Grid item md={11.2}>
                            <Typography
                                sx={{
                                    color: "#160449",
                                    fontWeight: theme.typography.primary.fontWeight,
                                    fontSize: theme.typography.small,
                                    width: "100%",
                                    textAlign: isMobile? "left" : 'center',
                                    paddingBottom: "10px",
                                    paddingTop: "5px",
                                    flexGrow: 1,
                                    paddingLeft: isMobile ? "5px" : "50px"
                                }}
                            >
                                Fee Details
                            </Typography>
                        </Grid>
                        {/* {isEditable && <Grid item md={0.5}>
                            <Button
                                sx={{
                                    "&:hover, &:focus, &:active": { background: theme.palette.primary.main },
                                    cursor: "pointer",
                                    textTransform: "none",
                                    minWidth: "40px",
                                    minHeight: "40px",
                                    width: "40px",
                                    fontWeight: theme.typography.secondary.fontWeight,
                                    fontSize: theme.typography.smallFont,
                                }}
                                size="small"
                                onClick={() => {
                                    setcurrentFeeRow({
                                        fee_type: '',
                                        available_topay: '',
                                        charge: '',
                                        due_by: '',
                                        due_by_date: dayjs(),
                                        fee_name: '',
                                        frequency: '',
                                        late_by: '',
                                        late_fee: '',
                                        perDay_late_fee: '',
                                    });
                                    setIsFeeEditing(false);
                                    handleFeeModalOpen();
                                }}>
                                <AddIcon sx={{ color: theme.typography.primary.black, fontSize: "18px" }} />
                            </Button>
                        </Grid>} */}
                    </Grid>
                </AccordionSummary>
                <AccordionDetails>
                    {leaseFees && <>
                        <Box sx={{ width: '100%', overflowX: 'auto' }}>
                        <DataGrid
                            rows={leaseFees}
                            columns={feesColumns}
                            pageSize={10}
                            hideFooter={true}
                            rowsPerPageOptions={[10]}
                            getRowId={(row) => row.leaseFees_uid}
                            sx={{
                                minWidth: '1000px', 
                                '& .MuiDataGrid-columnHeader': {
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    color: "#160449",
                                },
                                '& .MuiDataGrid-columnHeaderTitle': {
                                    font: "bold",
                                    width: '100%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    fontWeight: "bold",
                                },
                                '& .MuiDataGrid-cell': {
                                    color: "#160449",
                                    // fontWeight: "bold",
                                },

                            }}
                        />
                        </Box>
                        <Dialog open={open} onClose={handleFeeModalClose} maxWidth="md">
                            <DialogTitle
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: "#160449",
                                    fontWeight: theme.typography.primary.fontWeight,
                                    fontSize: theme.typography.small,
                                }}
                            >
                                <span style={{ flexGrow: 1, textAlign: 'center' }}>Fee Details</span>
                                <Button onClick={handleFeeModalClose} sx={{ ml: 'auto' }}>
                                    <Close sx={{
                                        color: theme.typography.primary.black,
                                        fontSize: '20px',
                                    }} />
                                </Button>
                            </DialogTitle>
                            <DialogContent>
                                <Snackbar open={snackbarOpen} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                                    <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%', height: "100%" }}>
                                        {snackbarMessage}
                                    </Alert>
                                </Snackbar>
                                <Grid container columnSpacing={8}>
                                    <Grid item md={2} sx={{ display: 'flex', alignItems: 'center', }}>
                                        <Typography sx={{ fontSize: "14px", fontWeight: "bold", color: "#3D5CAC", }}>
                                            Fee Name
                                        </Typography>
                                        <span style={{ color: "red" }}>*</span>
                                    </Grid>
                                    <Grid item md={10}>
                                        <TextField
                                            sx={{ backgroundColor: '#D6D5DA', }}
                                            margin="dense"
                                            //label="Fee Name"
                                            placeholder = "Fee Name"
                                            fullWidth
                                            variant="outlined"
                                            value={currentFeeRow?.fee_name || ''}
                                            onChange={(e) => setcurrentFeeRow({ ...currentFeeRow, fee_name: e.target.value })}
                                        />
                                    </Grid>

                                    {/* fee type */}
                                    <Grid item md={2} sx={{ display: 'flex', alignItems: 'center', }}>
                                        <Typography sx={{ fontSize: "14px", fontWeight: "bold", color: "#3D5CAC", }}>
                                            Fee Type
                                        </Typography>
                                        <span style={{ color: "red" }}>*</span>
                                    </Grid>
                                    <Grid item md={10}>

<FormControl fullWidth>
                                                    <Select
                                                        value={currentFeeRow?.fee_type || ''}
                                                        size="small"
                                                        onChange={(e) => setcurrentFeeRow({ ...currentFeeRow, fee_type: e.target.value !== "" ? e.target.value : '$' })}
                                        fullWidth
                                                        // label="Frequency"
                                                        placeholder = "Fee Type"
                                                        className={classes.select}
                                                        sx={{
                                                            marginTop: "10px",
                                                            height: '50px',
                                                            backgroundColor: '#D6D5DA',
                                                        }}
                                                    >
                                                        {
                                                            feeTypes?.map( (freq, index) => (
                                                                <MenuItem key={index} value={freq.list_item}>{freq.list_item}</MenuItem>
                                                            ) )
                                                        }
                                                    </Select>
                                                </FormControl>
                                            
                                    </Grid>

                                    {/* Charge */}
                                    <Grid item md={2} sx={{ display: 'flex', alignItems: 'center', }}>
                                        <Typography sx={{ fontSize: "14px", fontWeight: "bold", color: "#3D5CAC", }}>
                                            Fee Amount
                                        </Typography>
                                        <span style={{ color: "red" }}>*</span>
                                    </Grid>
                                    <Grid item md={4}>
                                        <TextField
                                            sx={{ backgroundColor: '#D6D5DA', }}
                                            type="number"
                                            margin="dense"
                                            // label="Amount"
                                            placeholder = "Amount"
                                            fullWidth
                                            variant="outlined"
                                            value={currentFeeRow?.charge || ''}
                                            onChange={(e) => {
                                                if (typeof parseInt(e.target.value) === "number" && !isNaN(parseInt(e.target.value))) {
                                                    setcurrentFeeRow({ ...currentFeeRow, charge: e.target.value })
                                                } else {
                                                    setcurrentFeeRow({ ...currentFeeRow, charge: 0 })
                                                }
                                            }

                                            }
                                        />
                                    </Grid>

                                    {/* Frequency */}
                                    <Grid item md={6} sx={{ display: 'flex', alignItems: 'center', }}>
                                        <Grid container>
                                            <Grid item md={4} sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Typography sx={{ fontSize: "14px", fontWeight: "bold", color: "#3D5CAC", }}>
                                                    Frequency
                                                </Typography>
                                                <span style={{ color: "red" }}>*</span>
                                            </Grid>
                                            <Grid item md={8}>
                                                <FormControl sx={{ width: '300px', height: '70px' }}>
                                                    <Select
                                                        value={currentFeeRow?.frequency || ''}
                                                        onChange={(e) => setcurrentFeeRow({ ...currentFeeRow, frequency: e.target.value })}
                                                        size="small"
                                                        fullWidth
                                                        // label="Frequency"
                                                        placeholder = "Frequency"
                                                        className={classes.select}
                                                        sx={{
                                                            marginTop: "10px",
                                                            height: '50px',
                                                            backgroundColor: '#D6D5DA',
                                                        }}
                                                    >
                                                        {
                                                            feeFrequencies?.map( (freq, index) => (
                                                                <MenuItem key={index} value={freq.list_item}>{freq.list_item}</MenuItem>
                                                            ) )
                                                        }
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    {/* Due Date */}
                                    <Grid item md={6}>
                                        <Grid container>
                                            <Grid item md={4} sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Typography sx={{ fontSize: "14px", fontWeight: "bold", color: "#3D5CAC", }}>
                                                    Due Date
                                                </Typography>
                                                <span style={{ color: "red" }}>*</span>
                                            </Grid>
                                            <Grid item md={6}>
                                                {currentFeeRow && (currentFeeRow.frequency === "Monthly" || currentFeeRow.frequency === "") && (
                                                    <TextField
                                                        type="number"
                                                        margin="dense"
                                                        name="due_by"
                                                        value={currentFeeRow.due_by !== null && currentFeeRow.due_by !== "" ? currentFeeRow.due_by : ""}
                                                        fullWidth
                                                        variant="outlined"
                                                        onChange={(e) => setcurrentFeeRow({ ...currentFeeRow, due_by: e.target.value, due_by_date: null })}
                                                        InputProps={{
                                                            endAdornment: <InputAdornment position="start">{getDateAdornmentString(currentFeeRow.due_by)}</InputAdornment>,
                                                        }}
                                                        sx={{ marginLeft: '5px', width: '295px', backgroundColor: '#D6D5DA', }}
                                                    />
                                                )}
                                                {currentFeeRow && (currentFeeRow.frequency === "One Time" || currentFeeRow.frequency === "Semi-Monthly" || currentFeeRow.frequency === "Quarterly" || currentFeeRow.frequency === "Semi-Annually" || currentFeeRow.frequency === "Annually") && (
                                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                        <DatePicker
                                                            //label="Due By"
                                                            placeholder = "Due By"
                                                            value={currentFeeRow?.due_by_date ? dayjs(currentFeeRow.due_by_date) : null}
                                                            onChange={(e) => {
                                                                // //console.log('dueby row', e)
                                                                const formattedDate = e ? e.format("MM-DD-YYYY") : null;
                                                                setcurrentFeeRow({ ...currentFeeRow, due_by_date: formattedDate, due_by: null })
                                                            }
                                                            }
                                                            renderInput={(params) => (
                                                                <TextField
                                                                    required
                                                                    {...params}
                                                                    size="small"
                                                                    sx={{
                                                                        '& .MuiInputBase-root': {
                                                                            fontSize: '14px',
                                                                        },
                                                                        '& .MuiSvgIcon-root': {
                                                                            fontSize: '20px',
                                                                        },
                                                                    }}
                                                                />
                                                            )}
                                                            sx={{ marginTop: "10px", marginLeft: '5px', width: '295px', backgroundColor: '#D6D5DA', }}
                                                        />
                                                    </LocalizationProvider>)}

                                                {currentFeeRow && (currentFeeRow.frequency === "Weekly" || currentFeeRow.frequency === "Bi-Weekly") && (
                                                    <Box
                                                        sx={{
                                                            paddingTop: "10px",
                                                        }}
                                                    >
                                                        <Select
                                                            name="Due By"
                                                            value={currentFeeRow.due_by !== null ? valueToDayMap.get(currentFeeRow.due_by) : ""}
                                                            size="small"
                                                            fullWidth
                                                            onChange={(e) => handleDueByChange(e)}
                                                            placeholder="Select Due By Day"
                                                            className={classes.select}
                                                            sx={{ width: '295px', marginLeft: '5px', height: '40px', backgroundColor: '#D6D5DA', }}
                                                        >
                                                            {currentFeeRow.frequency &&
                                                                currentFeeRow.frequency === "Weekly" &&
                                                                dayOptionsForWeekly.map((option) => (
                                                                    <MenuItem key={option.value} value={option.value}>
                                                                        {option.label}
                                                                    </MenuItem>
                                                                ))}
                                                            {currentFeeRow.frequency &&
                                                                currentFeeRow.frequency === "Bi-Weekly" &&
                                                                dayOptionsForBiWeekly.map((option) => (
                                                                    <MenuItem key={option.value} value={option.value}>
                                                                        {option.label}
                                                                    </MenuItem>
                                                                ))}
                                                        </Select>
                                                    </Box>
                                                )}
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    {/* Bills post X days in advance */}
                                    <Grid item md={3} sx={{ display: 'flex', alignItems: 'center', }}>
                                        <Typography sx={{ fontSize: "14px", fontWeight: "bold", color: "#3D5CAC", }}>
                                            Bills Post X Days in Advance
                                        </Typography>
                                        <span style={{ color: "red" }}>*</span>
                                    </Grid>
                                    <Grid item md={3}>
                                        {currentFeeRow &&  currentFeeRow.frequency && (
                                                <TextField
                                                    type="number"
                                                    sx={{ backgroundColor: '#D6D5DA', }}
                                                    margin="dense"
                                                    //label="# Days Before"
                                                    placeholder = "# Days Before"
                                                    fullWidth
                                                    variant="outlined"
                                                    value={currentFeeRow?.available_topay || ''}
                                                    onChange={(e) => setcurrentFeeRow({ ...currentFeeRow, available_topay: e.target.value })}
                                                />)}

                                        {currentFeeRow && (currentFeeRow.frequency === "Weekly" || currentFeeRow.frequency === "Bi-Weekly") && (
                                            <Box
                                                sx={{
                                                    paddingTop: "10px",
                                                }}
                                            >
                                                <Select
                                                    sx={{ backgroundColor: '#D6D5DA', }}
                                                    name="available_topay"
                                                    value={currentFeeRow.available_topay !== null ? currentFeeRow.available_topay : ""}
                                                    size="small"
                                                    fullWidth
                                                    onChange={(e) => handleAvailableToPayChange(e)}
                                                    placeholder="Select Available to Pay By Day"
                                                >
                                                    {currentFeeRow.frequency &&
                                                        currentFeeRow.frequency === "Weekly" &&
                                                        availableToPayOptionsForWeekly.map((option) => (
                                                            <MenuItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </MenuItem>
                                                        ))}
                                                    {currentFeeRow.frequency &&
                                                        currentFeeRow.frequency === "Bi-Weekly" &&
                                                        availableToPayOptionsForBiWeekly.map((option) => (
                                                            <MenuItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </MenuItem>
                                                        ))}
                                                </Select>
                                            </Box>
                                        )}
                                    </Grid>


                                    {/* Late after x days */}
                                    <Grid item md={2} sx={{ display: 'flex', alignItems: 'center', }}>
                                        <Typography sx={{ fontSize: "14px", fontWeight: "bold", color: "#3D5CAC", }}>
                                            Late After X Days
                                        </Typography>
                                        <span style={{ color: "red" }}>*</span>
                                    </Grid>
                                    <Grid item md={4}>
                                        {currentFeeRow && currentFeeRow.frequency  && (
                                            <TextField
                                                type="number"
                                                sx={{ backgroundColor: '#D6D5DA', }}
                                                margin="dense"
                                                //label="# Days By"
                                                placeholder = "# Days BY"
                                                fullWidth
                                                variant="outlined"
                                                value={currentFeeRow?.late_by || ''}
                                                onChange={(e) => setcurrentFeeRow({ ...currentFeeRow, late_by: e.target.value })}
                                            />
                                        )}

                                        {currentFeeRow && (currentFeeRow.frequency === "Weekly" || currentFeeRow.frequency === "Bi-Weekly") && (
                                            <Box
                                                sx={{
                                                    paddingTop: "10px",
                                                }}
                                            >
                                                <Select
                                                    sx={{ backgroundColor: '#D6D5DA', }}
                                                    name="late_by"
                                                    value={currentFeeRow.late_by !== null ? currentFeeRow.late_by : ""}
                                                    size="small"
                                                    fullWidth
                                                    onChange={(e) => handleLateByChange(e)}
                                                    placeholder="Select Late By Day"
                                                >
                                                    {currentFeeRow.frequency &&
                                                        currentFeeRow.frequency === "Weekly" &&
                                                        lateByOptionsForWeekly.map((option) => (
                                                            <MenuItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </MenuItem>
                                                        ))}
                                                    {currentFeeRow.frequency &&
                                                        currentFeeRow.frequency === "Bi-Weekly" &&
                                                        lateByOptionsForBiWeekly.map((option) => (
                                                            <MenuItem key={option.value} value={option.value}>
                                                                {option.label}
                                                            </MenuItem>
                                                        ))}
                                                </Select>
                                            </Box>
                                        )}
                                    </Grid>

                                    <Grid item md={2} sx={{ display: 'flex', alignItems: 'center', }}>
                                        <Typography sx={{ fontSize: "14px", fontWeight: "bold", color: "#3D5CAC", }}>
                                            One Time Late Fee
                                        </Typography>
                                        <span style={{ color: "red" }}>*</span>
                                    </Grid>
                                    <Grid item md={4}>
                                        <TextField
                                            type="number"
                                            sx={{ backgroundColor: '#D6D5DA', }}
                                            margin="dense"
                                            //label="Amount"
                                            placeholder = "Amount"
                                            fullWidth
                                            variant="outlined"
                                            value={currentFeeRow?.late_fee || ''}
                                            onChange={(e) => {
                                                if (typeof parseInt(e.target.value) === "number" && !isNaN(parseInt(e.target.value))) {
                                                    setcurrentFeeRow({ ...currentFeeRow, late_fee: e.target.value })
                                                } else {
                                                    setcurrentFeeRow({ ...currentFeeRow, late_fee: null })
                                                }
                                            }
                                            }
                                        />
                                    </Grid>

                                    <Grid item md={6} />

                                    <Grid item md={2} sx={{ display: 'flex', alignItems: 'center', }}>
                                        <Typography sx={{ fontSize: "14px", fontWeight: "bold", color: "#3D5CAC", }}>
                                            Per Day Late Fee
                                        </Typography>
                                        <span style={{ color: "red" }}>*</span>
                                    </Grid>
                                    <Grid item md={4}>
                                        <TextField
                                            type="number"
                                            sx={{ backgroundColor: '#D6D5DA', }}
                                            margin="dense"
                                            //label="Amount"
                                            placeholder = "Amount"
                                            fullWidth
                                            variant="outlined"
                                            value={currentFeeRow?.perDay_late_fee || ''}
                                            onChange={(e) => {
                                                if (typeof parseInt(e.target.value) === "number" && !isNaN(parseInt(e.target.value))) {
                                                    setcurrentFeeRow({ ...currentFeeRow, perDay_late_fee: e.target.value })
                                                } else {
                                                    setcurrentFeeRow({ ...currentFeeRow, perDay_late_fee: null })
                                                }
                                            }
                                            }
                                        />
                                    </Grid>
                                </Grid>
                            </DialogContent>
                            <DialogActions sx={{ alignContent: "center", justifyContent: "center" }}>
                                <Button variant="contained"
                                    sx={{
                                        marginRight: '5px', background: "#FFC614",
                                        color: "#160449",
                                        cursor: "pointer",
                                        width: "100px",
                                        height: "31px",
                                        fontWeight: theme.typography.secondary.fontWeight,
                                        fontSize: theme.typography.smallFont,
                                        textTransform: 'none',
                                        '&:hover': {
                                            backgroundColor: '#fabd00',
                                        },
                                    }}
                                    onClick={handleAddNewFee}>
                                    Save
                                </Button>
                                {isEditing &&
                                    <>
                                        <Button variant="contained"
                                            sx={{
                                                background: "#F87C7A",
                                                color: "#160449",
                                                cursor: "pointer",
                                                width: "100px",
                                                height: "31px",
                                                fontWeight: theme.typography.secondary.fontWeight,
                                                fontSize: theme.typography.smallFont,
                                                textTransform: 'none',
                                                '&:hover': {
                                                    backgroundColor: '#f76462',
                                                },
                                            }}
                                            onClick={handleDeleteClick}>
                                            Delete
                                        </Button>
                                        <Dialog
                                            open={openDeleteConfirmation}
                                            onClose={handleDeleteClose}
                                            aria-labelledby="alert-dialog-title"
                                            aria-describedby="alert-dialog-description"
                                        >
                                            <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
                                            <DialogContent>
                                                <DialogContentText id="alert-dialog-description">
                                                    Are you sure you want to delete this Fee?
                                                </DialogContentText>
                                            </DialogContent>
                                            <DialogActions>
                                                <Button onClick={handleDeleteClose} color="primary" sx={{
                                                    textTransform: "none", background: "#F87C7A",
                                                    color: "#160449",
                                                    cursor: "pointer", fontWeight: theme.typography.secondary.fontWeight,
                                                    fontSize: theme.typography.smallFont, '&:hover': {
                                                        backgroundColor: '#f76462',
                                                    },
                                                }}>
                                                    Cancel
                                                </Button>
                                                <Button onClick={handleDeleteConfirm} color="primary" autoFocus sx={{
                                                    textTransform: "none", background: "#FFC614",
                                                    color: "#160449",
                                                    cursor: "pointer", fontWeight: theme.typography.secondary.fontWeight,
                                                    fontSize: theme.typography.smallFont,
                                                    '&:hover': {
                                                        backgroundColor: '#fabd00',
                                                    },
                                                }}>
                                                    Confirm
                                                </Button>
                                            </DialogActions>
                                        </Dialog>
                                    </>
                                }
                            </DialogActions>
                        </Dialog>
                    </>
                    }
                </AccordionDetails>
            </Accordion>
    ) : (
        <>
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isMobile ? 'flex-start' : 'center',
      marginBottom: '7px',
      width: '100%',
    }}
  >
    {/* Fee Details */}
    <Typography
      sx={{
        color: "#160449",
        fontWeight: theme.typography.primary.fontWeight,
        fontSize: theme.typography.small,
        textAlign: isMobile ? "left" : "center",
        paddingBottom: "10px",
        paddingTop: "5px",
        paddingLeft: isMobile ? "5px" : "10px",
      }}
    >
      Fee Details
    </Typography>

    {/* No Documents */}
    <Typography
      sx={{
        color: "#A9A9A9",
        fontWeight: theme.typography.primary.fontWeight,
        fontSize: "15px",
        textAlign: isMobile ? "left" : "center",
      }}
    >
      No Fees
    </Typography>
  </Box>
</>

      )}
        </>
    )
}

export default FeesDetails;
