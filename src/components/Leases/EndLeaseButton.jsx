import React, { useState, useEffect } from 'react';
import {
    Button, Typography, Box, Grid, Paper, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio,
    FormGroup, Checkbox, TextField, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Alert
} from '@mui/material';
import dayjs from 'dayjs';
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useUser } from "../../contexts/UserContext";
// import axios from 'axios';
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../utils/httpMiddleware";
import APIConfig from '../../utils/APIConfig';


const EndLeaseButton = ({ theme, leaseDetails, selectedLeaseId, setIsEndClicked, handleUpdate, fromProperties = false }) => {
    const [open, setOpen] = useState(false);
    const [confirmationText, setConfirmationText] = useState("")
    const [showSpinner, setShowSpinner] = useState(false);
    const [selectedValue, setSelectedValue] = useState('');
    const [moveOutDate, setMoveOutDate] = useState(null);
    const [moveOutReason, setMoveOutReason] = useState("");
    const [endLeaseStatus, setEndLeaseStatus] = useState('');
    const [selectedOption2Checkbox, setSelectedOption2Checkbox] = useState('');
    const [selectedOption3Checkbox, setSelectedOption3Checkbox] = useState('');
    const [selectedId, setSelectedId] = useState(null);
    const [leaseData, setLeaseData] = useState({});
    const [error, setError] = useState([]);
    const [success, setSuccess] = useState([]);
    const { selectedRole } = useUser();
    const color = theme.palette.form.main;

    useEffect(() => {
        if (fromProperties) {
            setLeaseData(leaseDetails);
        } else {

            const filtered = leaseDetails.find(lease => lease.lease_uid === selectedLeaseId);
            // //console.log('filtered', filtered);
            setLeaseData(filtered);
        }
    }, [selectedId])

    const getEndLeaseConfirmation = () => {
        const currentDate = new Date();
        // const currentDateFormatted = dayjs(currentDate).format("MM-DD-YYYY");
        const noticePeriod = leaseData.lease_end_notice_period ? leaseData.lease_end_notice_period : 30; //30 by default
        const leaseEndDate = new Date(leaseData.lease_end);
        const leaseEndDateFormatted = dayjs(leaseEndDate).format("MM-DD-YYYY");

        //console.log("Current Date: ", currentDate);
        //console.log("Notice Period: ", noticePeriod);
        //console.log("Lease End Date: ", leaseEndDate);

        const noticeDate = new Date(leaseEndDate);
        noticeDate.setDate(leaseEndDate.getDate() - noticePeriod);
        // const noticeDateFormatted = dayjs(noticeDate).format("MM-DD-YYYY");
        const lowerBoundNoticeDate = new Date(noticeDate);
        lowerBoundNoticeDate.setDate(noticeDate.getDate() - noticePeriod);
        const lowerBoundNoticeDateFormatted = dayjs(lowerBoundNoticeDate).format("MM-DD-YYYY");
        //console.log("Notice Date: ", noticeDate);
        //console.log("lowerBoundNoticeDateFormatted: ", lowerBoundNoticeDateFormatted);
        let role = "";
        if (selectedRole === "MANAGER") {
            role = "Tenant";
        } else {
            role = "Property Manager";
        }

        if (leaseData.lease_status === "ACTIVE" || leaseData.lease_status === "ACTIVE M2M") {
            if (selectedId === 2) {
                setEndLeaseStatus("TERMINATED");
                return `This lease will be terminated immediately, effective from today. Are you sure you want to terminate the lease?`;
            } else if (currentDate <= noticeDate && currentDate >= lowerBoundNoticeDate) {
                //console.log("Inside normal end processing - Ending status");
                setEndLeaseStatus("ENDING")
                return `Your lease will end on ${leaseEndDateFormatted} and 
                you are responsible for rent payments until the end of the lease. Are you sure you want to end the lease?`;
            } else {

                //console.log("Inside early end processing - EarlyTermination status");
                setEndLeaseStatus("EARLY TERMINATION")
                return `Notice for ending the lease must be provided ${noticePeriod} days in advance. 
                Ending the lease early will require approval from the ${role}. Are you sure you want to end the lease?`;
            }
        } else {
            return 'ERROR: lease status is not "ACTIVE" or "ACTIVE-M2M"';
        }
    };


    const handleClickOpen = async () => {
        const newError = [];
        if (moveOutDate === null) newError.push("Move Out Date is required");
        if (moveOutReason === "") newError.push("Move Out Reason is required");
        //console.log('moveOutReason', moveOutReason);
        if (newError.length === 0) {
            setError([]);
            const confirmationText = getEndLeaseConfirmation();
            await setConfirmationText(confirmationText);
            setOpen(true);
        } else {
            setError(newError);
        }
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleConfirm = async () => {
        await handleEndLease();
        setOpen(false);
        await handleUpdate();
        await setIsEndClicked(false);
    };

    const handleRadioChange = (event, id) => {
        //console.log('event1', event);
        if (id == 0 || id == 3) {
            setMoveOutReason(event.target.value);
        } else {
            setMoveOutReason("");
        }
        setSelectedValue(event.target.value);
        setSelectedId(id);
    };

    const handleOption2CheckboxChange = (event, label) => {
        //console.log('event', event);
        setSelectedOption2Checkbox(event.target.value);
        setMoveOutReason(label);
    };

    const handleOption3CheckboxChange = (event, label) => {
        //console.log('event', event);
        setSelectedOption3Checkbox(event.target.value);
        setMoveOutReason(label);
    };

    const handleCancel = () => {
        setIsEndClicked(false);
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        //console.log('check date', dateString, date)
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}-${day}-${year}`;
    }

    const handleEndLease = () => {
        setShowSpinner(true);
        const headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Credentials": "*",
        };

        const leaseApplicationFormData = new FormData();
        const formattedMoveOutDate = formatDate(moveOutDate);;
        leaseApplicationFormData.append("lease_uid", leaseData.lease_uid);
        leaseApplicationFormData.append("move_out_date", formattedMoveOutDate);
        leaseApplicationFormData.append("lease_renew_status", endLeaseStatus);
        leaseApplicationFormData.append("lease_end_reason", moveOutReason);
        if (endLeaseStatus === "EARLY TERMINATION") {
            const currentDate = new Date();
            const currentDateFormatted = dayjs(currentDate).format("MM-DD-YYYY");
            leaseApplicationFormData.append("lease_early_end_date", currentDateFormatted);
        }

        //console.log('leaseApplicationFormData', leaseData.lease_uid, formattedMoveOutDate, endLeaseStatus, moveOutReason);
        //console.log('end form', leaseApplicationFormData);
        axios
            .put(`${APIConfig.baseURL.dev}/leaseApplication`, leaseApplicationFormData, headers)
            .then((response) => {
                setShowSpinner(false);
                //console.log("Data updated successfully", response);
                setSuccess(`Your lease has been moved to ${endLeaseStatus} status.`, "success");
            })
            .catch((error) => {
                if (error.response) {
                    setError(["Cannot End the lease. Please Try Again"]);
                    //console.log(error.response.data);
                }
            });
    }

    return (
        <Box
            style={{
                display: "flex",
                justifyContent: "center",
                // width: "100%",
                height: "100%",
            }}
        >
            <Paper
                style={{
                    // marginTop: "10px",
                    backgroundColor: theme.palette.primary.main,
                    // width: "100%", // Occupy full width with 25px margins on each side
                }}
            >
                <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
                    <CircularProgress color="inherit" />
                </Backdrop>
                <Grid container sx={{ marginTop: '1px', marginBottom: '15px', alignItems: 'center', justifyContent: 'center' }} rowSpacing={4}>
                    <Grid item xs={12} md={12}>
                        <Typography
                            sx={{
                                color: "#160449",
                                fontWeight: theme.typography.primary.fontWeight,
                                fontSize: theme.typography.largeFont,
                                textAlign: 'center'
                            }}
                        >
                            End Lease
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={12}>
                        <Typography
                            sx={{
                                color: "#160449",
                                fontWeight: theme.typography.primary.fontWeight,
                                fontSize: theme.typography.smallFont,
                                textAlign: 'center'
                            }}
                        >
                            Please provide a reason for why you are ending the tenant’s lease.
                        </Typography>
                    </Grid>
                    {success.length > 0 && (
                        <Box>
                            <Alert severity="success">
                                {success}
                            </Alert>
                        </Box>
                    )}
                    {error.length > 0 && (
                        <Box>
                            <Alert severity="error">
                                <ul>
                                    {error.map((err, index) => (
                                        <li key={index}>{err}</li>
                                    ))}
                                </ul>
                            </Alert>
                        </Box>
                    )}
                    <Grid item xs={12} md={12}>
                        <Paper sx={{ padding: "10px", backgroundColor: color, width: "auto", margin: '10px 10px 0px 10px' }} >
                            <FormControl sx={{ width: '100%' }}>
                                <RadioGroup
                                    aria-labelledby="demo-controlled-radio-buttons-group"
                                    name="controlled-radio-buttons-group"
                                    value={selectedValue}
                                    onChange={(event) => handleRadioChange(event, 0)}
                                    id='0'
                                    sx={{ marginLeft: '5px', width: '100%' }}
                                >
                                    <FormControlLabel
                                        id='0'
                                        value="The tenant does not plan on living here next year."
                                        control={<Radio sx={{ '&.Mui-checked': { color: "#3D5CAC" } }} />}
                                        label={
                                            <Box sx={{ display: 'block', marginLeft: '10px' }}>
                                                <Typography
                                                    sx={{
                                                        color: "#160449",
                                                        fontWeight: theme.typography.primary.fontWeight,
                                                        fontSize: theme.typography.smallFont,
                                                    }}
                                                >
                                                    The tenant does not plan on living here next year.
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </RadioGroup>
                            </FormControl>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={12}>
                        <Paper sx={{ padding: "10px", backgroundColor: color, width: "auto", margin: '10px 10px 0px 10px' }} >
                            <FormControl sx={{ width: '100%' }}>
                                <RadioGroup
                                    aria-labelledby="demo-controlled-radio-buttons-group"
                                    name="controlled-radio-buttons-group"
                                    value={selectedValue}
                                    onChange={(event) => handleRadioChange(event, 1)}
                                    id='1'
                                    sx={{ marginLeft: '5px', width: '100%' }}
                                >
                                    <FormControlLabel
                                        id='1'
                                        value="The tenant has a personal reason(s) for terminating the lease early."
                                        control={<Radio sx={{ '&.Mui-checked': { color: "#3D5CAC" } }} />}
                                        label={
                                            <Box sx={{ display: 'block' }}>
                                                <Typography
                                                    sx={{
                                                        color: "#160449",
                                                        fontWeight: theme.typography.primary.fontWeight,
                                                        fontSize: theme.typography.smallFont,
                                                    }}
                                                >
                                                    The tenant has a personal reason(s) for terminating the lease early.
                                                </Typography>

                                                {selectedValue === 'The tenant has a personal reason(s) for terminating the lease early.' && (
                                                    <>
                                                        <Typography
                                                            sx={{
                                                                color: "#3D5CAC",
                                                                fontWeight: theme.typography.primary.fontWeight,
                                                                fontSize: '14px',
                                                                marginTop: '10px'
                                                            }}
                                                        >
                                                            Please specify the reason.
                                                        </Typography>
                                                        <FormGroup>
                                                            <FormControlLabel control={<Checkbox checked={selectedOption2Checkbox === 'property'}
                                                                onChange={(event) => handleOption2CheckboxChange(event, "The tenant is moving into another property.")}
                                                                value="property" />} label="The tenant is moving into another property." />
                                                            <FormControlLabel control={<Checkbox checked={selectedOption2Checkbox === 'area'}
                                                                onChange={(event) => handleOption2CheckboxChange(event, "The tenant is moving out of the area.")}
                                                                value="area" />} label="The tenant is moving out of the area." />
                                                            <FormControlLabel control={<Checkbox checked={selectedOption2Checkbox === 'rent'}
                                                                onChange={(event) => handleOption2CheckboxChange(event, "The tenant is unable to pay rent.")}
                                                                value="rent" />} label="The tenant is unable to pay rent." />
                                                            <FormControlLabel control={<Checkbox checked={selectedOption2Checkbox === 'military'}
                                                                onChange={(event) => handleOption2CheckboxChange(event, "The tenant is starting active military duty.")}
                                                                value="military" />} label="The tenant is starting active military duty." />
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <FormControlLabel control={<Checkbox checked={selectedOption2Checkbox === 'other'}
                                                                    onChange={(event) => handleOption2CheckboxChange(event, "Other")}
                                                                    value="other" />} label="Other:" />
                                                                <TextField
                                                                    onChange={(e) => setMoveOutReason(`other: ${e.target.value}`)}
                                                                    label="Please provide a reason."
                                                                    variant="outlined"
                                                                    fullWidth
                                                                />
                                                            </Box>
                                                        </FormGroup>
                                                    </>
                                                )}
                                            </Box>
                                        }
                                    />
                                </RadioGroup>
                            </FormControl>
                        </Paper>
                    </Grid>


                    <Grid item xs={12} md={12}>
                        <Paper sx={{ padding: "10px", backgroundColor: color, width: "auto", margin: '10px 10px 0px 10px' }} >
                            <FormControl sx={{ width: '100%' }}>
                                <RadioGroup
                                    aria-labelledby="demo-controlled-radio-buttons-group"
                                    name="controlled-radio-buttons-group"
                                    value={selectedValue}
                                    onChange={(event) => handleRadioChange(event, 2)}
                                    id='2'
                                    sx={{ marginLeft: '5px', width: '100%' }}
                                >
                                    <FormControlLabel
                                        id='2'
                                        value="The tenant is currently undergoing a legal issue(s)."
                                        control={<Radio sx={{ '&.Mui-checked': { color: "#3D5CAC" } }} />}
                                        sx={{ marginBottom: '10px' }}
                                        label={
                                            <Box sx={{ display: 'block' }}>
                                                <Typography
                                                    sx={{
                                                        color: "#160449",
                                                        fontWeight: theme.typography.primary.fontWeight,
                                                        fontSize: theme.typography.smallFont,
                                                    }}
                                                >
                                                    The tenant is currently undergoing a legal issue(s).
                                                </Typography>

                                                {selectedValue === 'The tenant is currently undergoing a legal issue(s).' && (
                                                    <>
                                                        <Typography
                                                            sx={{
                                                                color: "#3D5CAC",
                                                                fontWeight: theme.typography.primary.fontWeight,
                                                                fontSize: '14px',
                                                                marginTop: '10px'
                                                            }}
                                                        >
                                                            Please specify the reason.
                                                        </Typography>
                                                        <FormGroup>
                                                            <FormControlLabel control={<Checkbox checked={selectedOption3Checkbox === 'crime'}
                                                                onChange={(event) => handleOption3CheckboxChange(event, "The tenant has committed a crime.")}
                                                                value="crime" />} label="The tenant has committed a crime." />
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <FormControlLabel control={<Checkbox checked={selectedOption3Checkbox === 'other'}
                                                                    onChange={(event) => handleOption3CheckboxChange(event, "Other")}
                                                                    value="other" />} label="Other:" />
                                                                <TextField
                                                                    onChange={(e) => setMoveOutReason(`other: ${e.target.value}`)}
                                                                    label="Please provide a reason."
                                                                    variant="outlined"
                                                                    fullWidth
                                                                />
                                                            </Box>
                                                        </FormGroup>
                                                    </>
                                                )}
                                            </Box>
                                        }
                                    />
                                </RadioGroup>
                            </FormControl>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={12}>
                        <Paper sx={{ padding: "10px", backgroundColor: color, width: "auto", margin: '10px 10px 0px 10px' }} >
                            <FormControl sx={{ width: '100%' }}>
                                <RadioGroup
                                    aria-labelledby="demo-controlled-radio-buttons-group"
                                    name="controlled-radio-buttons-group"
                                    value={selectedValue}
                                    onChange={(event) => handleRadioChange(event, 3)}
                                    id='3'
                                    sx={{ marginLeft: '5px', width: '100%' }}
                                >
                                    <FormControlLabel
                                        id='3'
                                        value="The property has been deemed unsafe or uninhabitable."
                                        control={<Radio sx={{ '&.Mui-checked': { color: "#3D5CAC" } }} />}
                                        label={
                                            <Box sx={{ display: 'block' }}>
                                                <Typography
                                                    sx={{
                                                        color: "#160449",
                                                        fontWeight: theme.typography.primary.fontWeight,
                                                        fontSize: theme.typography.smallFont,
                                                    }}
                                                >
                                                    The property has been deemed unsafe or uninhabitable.
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </RadioGroup>
                            </FormControl>
                        </Paper>
                    </Grid>
                </Grid>

                <Grid container sx={{ margin: "10px 0px", alignItems: "center", justifyContent: "center" }}>
                    <Grid item xs={5} sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        paddingRight: "10px"
                    }}>
                        <Typography sx={{ fontSize: "14px", fontWeight: "bold", color: "#3D5CAC", textAlign: 'center' }}>Move-Out Date</Typography>
                    </Grid>
                    <Grid item xs={7} sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        paddingLeft: "10px"
                    }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                value={moveOutDate}
                                onChange={e => {
                                    const formattedDate = e ? e.format("MM-DD-YYYY") : null;
                                    setMoveOutDate(dayjs(formattedDate));
                                }}
                                sx={{ marginRight: "10px" }}
                            />
                        </LocalizationProvider>
                    </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '10px' }}>
                    <Button
                        sx={{
                            marginRight: '5px', background: "#D4736D",
                            color: "#160449",
                            cursor: "pointer",
                            width: "100px",
                            height: "31px",
                            fontWeight: theme.typography.secondary.fontWeight,
                            fontSize: theme.typography.smallFont,
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: '#DEA19C',
                            },
                        }}
                        onClick={handleCancel}
                        color="primary">
                        Cancel
                    </Button>
                    <Button
                        sx={{
                            background: "#6788B3",
                            color: "#160449",
                            cursor: "pointer",
                            width: "100px",
                            height: "31px",
                            fontWeight: theme.typography.secondary.fontWeight,
                            fontSize: theme.typography.smallFont,
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: '#92A9CB',
                            },
                        }}
                        onClick={handleClickOpen}
                        color="secondary">
                        Confirm
                    </Button>
                </Box>
                <Dialog
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    maxWidth="md"
                >
                    <DialogTitle id="alert-dialog-title">{"End Lease Confirmation"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            {confirmationText}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
                        <Button onClick={handleClose} sx={{
                            background: "#D4736D",
                            color: "#160449",
                            cursor: "pointer",
                            fontWeight: theme.typography.secondary.fontWeight,
                            fontSize: theme.typography.smallFont,
                            textTransform: "none",
                            '&:hover': {
                                background: '#DEA19C',
                            },
                        }}
                            size="small">
                            Cancel
                        </Button>
                        <Button onClick={handleConfirm} autoFocus variant="outlined"
                            sx={{
                                background: "#6788B3",
                                color: "#160449",
                                cursor: "pointer",
                                fontWeight: theme.typography.secondary.fontWeight,
                                fontSize: theme.typography.smallFont,
                                textTransform: "none",
                                '&:hover': {
                                    background: '#92A9CB',
                                },
                            }}
                            size="small">
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>
            </Paper>
        </Box>

    );
};

export default EndLeaseButton;
