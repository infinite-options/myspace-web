import React, { useEffect, useState } from 'react';
import {
    Button, Typography, Box, Grid, Paper, FormControl, RadioGroup, FormControlLabel, Radio,
    Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, FormGroup, Checkbox, TextField,
} from '@mui/material';
import Backdrop from "@mui/material/Backdrop";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import theme from "../../theme/theme";
import dayjs from 'dayjs';
import { useUser } from "../../contexts/UserContext";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import APIConfig from "../../utils/APIConfig";
import axios from 'axios';
import { PortableWifiOffSharp } from '@mui/icons-material';

const TenantEndLeaseButton = ({ leaseDetails, setRightPane, isMobile, setViewRHS, page, onClose, setReload }) => {
    const leaseData = leaseDetails;
    console.log("data", leaseData);
    const [open, setOpen] = useState(false);
    const { getProfileId } = useUser();
    const [confirmationText, setConfirmationText] = useState("");
    const [showSpinner, setShowSpinner] = useState(false);
    const [selectedValue, setSelectedValue] = useState('');
    const [moveOutDate, setMoveOutDate] = useState(dayjs().format("MM-DD-YYYY"));
    const [selectedOption2Checkbox, setSelectedOption2Checkbox] = useState('');
    const [selectedOption3Checkbox, setSelectedOption3Checkbox] = useState('');
    const [moveOutReason, setMoveOutReason] = useState("");
    const [endLeaseStatus, setEndLeaseStatus] = useState('');
    const [leaseEarlyEndDate, setLeaseEarlyEndDate] = useState(dayjs().format("MM-DD-YYYY"));
    const [error, setError] = useState([]);
    const [success, setSuccess] = useState([]);
    const [isTerminateEndLease, setIsTerminateEndLease] = useState(false);
    const color = theme.palette.form.main;


    const statusToCheckboxValueMap = {
        "The tenant is moving into another property.": 'property',
        "The tenant is moving out of the area.": 'area',
        "The tenant is unable to pay rent.": 'rent',
        "The tenant is starting active military duty.": 'military',
    };


    useEffect(() => {
        if (leaseData.lease_end_reason !== null && leaseData.lease_end_reason !== "") {
            console.log('inside use effect');
            setMoveOutReason(leaseData?.lease_end_reason);
            setMoveOutDate(leaseData?.move_out_date);
            setLeaseEarlyEndDate(leaseData?.lease_early_end_date);
            if (leaseData?.lease_end_reason === "I/We do not plan on living here next year." || leaseData?.lease_end_reason === "I/We have deemed the property unsafe or uninhabitable.") {
                setSelectedValue(leaseData.lease_end_reason)
            } else {
                setSelectedValue("I/We has a personal reason(s) for terminating the lease early.");
                setSelectedOption2Checkbox(statusToCheckboxValueMap[leaseData.lease_end_reason] ? statusToCheckboxValueMap[leaseData.lease_end_reason] : "other");
            }
        }
    }, [])



    const getEndLeaseConfirmation = () => {
        const currentDate = new Date();
        const noticePeriod = leaseData?.lease_end_notice_period || 30;
        const leaseEndDate = new Date(leaseData?.lease_end);
        const leaseEndDateFormatted = dayjs(leaseEndDate).format("MM-DD-YYYY");

        const noticeDate = new Date(leaseEndDate);
        noticeDate.setDate(leaseEndDate.getDate() - noticePeriod);
        const lowerBoundNoticeDate = new Date(noticeDate);
        lowerBoundNoticeDate.setDate(noticeDate.getDate() - noticePeriod);

        if (leaseData?.lease_status === "ACTIVE" || leaseData?.lease_status === "ACTIVE M2M") {
            if (selectedValue === "terminate") {
                setEndLeaseStatus("TERMINATED");
                return `This lease will be terminated immediately, effective from today. Are you sure you want to terminate the lease?`;
            } else if (currentDate <= noticeDate && currentDate >= lowerBoundNoticeDate) {
                setEndLeaseStatus("ENDING");
                return `Your lease will end on ${leaseEndDateFormatted}, and you are responsible for rent payments until the end of the lease. Are you sure you want to end the lease?`;
            } else {
                setEndLeaseStatus("EARLY TERMINATION");
                return `Notice for ending the lease must be provided ${noticePeriod} days in advance. Ending the lease early may require additional approval. Are you sure you want to end the lease?`;
            }
        } else {
            return 'ERROR: lease status is not "ACTIVE" or "ACTIVE-M2M"';
        }
    };

    const handleClickOpen = () => {
        if (isTerminateEndLease === false) {
            console.log('checking dates', leaseEarlyEndDate, moveOutDate);
            const newError = [];
            if (moveOutDate === null) newError.push("Move Out Date is required");
            if (leaseEarlyEndDate === null) newError.push("Lease End Date is required");
            if (moveOutReason === "") newError.push("Move Out Reason is required");
            if (leaseEarlyEndDate < moveOutDate) newError.push("Move Out date must be on/before Lease End date");

            if (newError.length === 0) {
                setError([]);
                const confirmationText = getEndLeaseConfirmation();
                setConfirmationText(confirmationText);
                setOpen(true);
            } else {
                setError(newError);
            }
        } else {
            setConfirmationText("Do you want to terminate your End Lease Request?");
            setOpen(true);
        }
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleConfirm = () => {
        if (isTerminateEndLease === true) {
            handleTerminateEndRequest();
            setIsTerminateEndLease(false);
        } else {
            handleEndLease();
        }
        setOpen(false);
    };

    const handleRadioChange = (event, id) => {
        console.log('event1', event);
        if (id === 3) {
            setIsTerminateEndLease(true);
        } else {
            setIsTerminateEndLease(false);
            if (id == 0 || id == 2) {
                setMoveOutReason(event.target.value);
            } else {
                setMoveOutReason("");
            }
            // setSelectedId(id);
        }
        setSelectedValue(event.target.value);
    };

    const handleOption2CheckboxChange = (event, label) => {
        console.log('event', event);
        setSelectedOption2Checkbox(event.target.value);
        setMoveOutReason(label);
    };

    const handleOption3CheckboxChange = (event, label) => {
        console.log('event', event);
        setSelectedOption3Checkbox(event.target.value);
        setMoveOutReason(label);
    };

    const handleCancel = () => {
        if (isMobile) {
            setViewRHS(false)
        }
        setRightPane("");
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}-${day}-${year}`;
    };

    const handleEndLease = () => {
        setShowSpinner(true);

        const leaseApplicationFormData = new FormData();
        const formattedMoveOutDate = formatDate(moveOutDate);
        leaseApplicationFormData.append("lease_uid", leaseData?.lease_uid);
        leaseApplicationFormData.append("move_out_date", formattedMoveOutDate);
        leaseApplicationFormData.append("lease_renew_status", endLeaseStatus);
        leaseApplicationFormData.append("lease_end_reason", moveOutReason !== "" ? moveOutReason : leaseData.lease_end_reason);

        // if (endLeaseStatus === "EARLY TERMINATION") {
        //     const currentDate = new Date();
        //     const currentDateFormatted = dayjs(currentDate).format("MM-DD-YYYY");
        //     leaseApplicationFormData.append("lease_early_end_date", currentDateFormatted);
        // }
        const formattedLeaseEndDate = formatDate(leaseEarlyEndDate);
        leaseApplicationFormData.append("lease_early_end_date", formattedLeaseEndDate);

        for (let pair of leaseApplicationFormData.entries()) {
            console.log(pair[0] + ": " + pair[1]);
        }

        // API call (commented for now)
        axios
            .put(`${APIConfig.baseURL.dev}/leaseApplication`, leaseApplicationFormData)
            .then(async (response) => {
                setShowSpinner(false);
                setSuccess(`Your lease has been moved to ${endLeaseStatus} status.`);
                await setReload(true)
                if (isMobile) {
                    setViewRHS(false)
                }
                setRightPane("");
            })
            .catch((error) => {
                if (error.response) {
                    setError(["Cannot end the lease. Please try again."]);
                }
            });
    };

    const handleTerminateEndRequest = () => {
        setShowSpinner(true);

        const leaseApplicationFormData = new FormData();
        leaseApplicationFormData.append("lease_uid", leaseData?.lease_uid);
        leaseApplicationFormData.append("move_out_date", "");
        leaseApplicationFormData.append("lease_renew_status", "");
        leaseApplicationFormData.append("lease_end_reason", "");
        leaseApplicationFormData.append("lease_early_end_date", "");

        // API call 
        axios
            .put(`${APIConfig.baseURL.dev}/leaseApplication`, leaseApplicationFormData)
            .then(async (response) => {
                setShowSpinner(false);
                setSuccess(`Your End request has been terminated.`);
                await setReload(true)
                if (isMobile) {
                    setViewRHS(false)
                }
                setRightPane("");
            })
            .catch((error) => {
                if (error.response) {
                    setError(["Cannot end the lease. Please try again."]);
                }
            });
    }

    const handleBack = () => {
        if (isMobile) {
            setViewRHS(false)
        }
        setRightPane("");
    };

    return (
        <Box
            style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                // height: "100%",
            }}
        >
            <Paper
                style={{
                    marginTop: "10px",
                    backgroundColor: theme.palette.primary.main,
                    width: "100%", // Occupy full width with 25px margins on each side
                }}
            >
                <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
                    <CircularProgress color="inherit" />
                </Backdrop>
                <Grid container sx={{ marginTop: '1px', marginBottom: '15px', alignItems: 'center', justifyContent: 'center' }} rowSpacing={4}>
                    <Grid item xs={12} md={12} display={"flex"} direction={"row"} justifyContent={"center"}>
                        <Grid container sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>

                            {isMobile && (
                                <Grid item xs={1}>
                                    <Button onClick={handleBack}>
                                        <ArrowBackIcon
                                            sx={{
                                                color: "#160449",
                                                fontSize: "25px",
                                                padding: "0px"
                                            }}
                                        />
                                    </Button>
                                </Grid>)}

                            <Grid item xs={11} md={12}>
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
                        </Grid>
                        {/* {isMobile && (<Button onClick={handleBack}>
                            <ArrowBackIcon
                                sx={{
                                    color: "#160449",
                                    fontSize: "25px",
                                    // margin: "5px",
                                }}
                            />
                        </Button>)}
                        <Typography
                            sx={{
                                color: "#160449",
                                fontWeight: theme.typography.primary.fontWeight,
                                fontSize: theme.typography.largeFont,
                                textAlign: 'center'
                            }}
                        >
                            End Lease
                        </Typography> */}
                    </Grid>

                    <Grid item xs={12} md={12}>
                        <Typography
                            sx={{
                                ...(isMobile ? { padding: "2px" } : {}),
                                color: "#160449",
                                fontWeight: theme.typography.primary.fontWeight,
                                fontSize: theme.typography.smallFont,
                                textAlign: 'center'
                            }}
                        >
                            Please provide a reason for why you are ending "{leaseData.property_address}" lease.
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
                        <Paper sx={{ padding: "10px", backgroundColor: color, width: '95%', margin: isMobile ? "10px 10px 0px 0px" : '10px 10px 0px 10px' }} >
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
                                        value="I/We do not plan on living here next year."
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
                                                    I/We do not plan on living here next year.
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </RadioGroup>
                            </FormControl>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={12}>
                        <Paper sx={{ padding: "10px", backgroundColor: color, width: '95%', margin: isMobile ? "10px 10px 0px 0px" : '10px 10px 0px 10px' }} >
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
                                        value="I/We has a personal reason(s) for terminating the lease early."
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
                                                    I/We has a personal reason(s) for terminating the lease early.
                                                </Typography>

                                                {selectedValue === 'I/We has a personal reason(s) for terminating the lease early.' && (
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
                                                                value="property" />} label="I/We is/are moving into another property." />
                                                            <FormControlLabel control={<Checkbox checked={selectedOption2Checkbox === 'area'}
                                                                onChange={(event) => handleOption2CheckboxChange(event, "The tenant is moving out of the area.")}
                                                                value="area" />} label="I/We is/are moving out of the area." />
                                                            <FormControlLabel control={<Checkbox checked={selectedOption2Checkbox === 'rent'}
                                                                onChange={(event) => handleOption2CheckboxChange(event, "The tenant is unable to pay rent.")}
                                                                value="rent" />} label="I/We is/are unable to pay rent." />
                                                            <FormControlLabel control={<Checkbox checked={selectedOption2Checkbox === 'military'}
                                                                onChange={(event) => handleOption2CheckboxChange(event, "The tenant is starting active military duty.")}
                                                                value="military" />} label="I/We is/are starting active military duty." />
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <FormControlLabel control={<Checkbox checked={selectedOption2Checkbox === 'other'}
                                                                    onChange={(event) => handleOption2CheckboxChange(event, "Other")}
                                                                    value="other" />} label="Other:" />
                                                                <TextField
                                                                    onChange={(e) => setMoveOutReason(`other: ${e.target.value}`)}
                                                                    label="Please provide a reason."
                                                                    variant="outlined"
                                                                    fullWidth
                                                                    value={selectedOption2Checkbox === "other" ? leaseData?.lease_end_reason?.split(":")[1] : ""}
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
                        <Paper sx={{ padding: "10px", backgroundColor: color, width: '95%', margin: isMobile ? "10px 10px 0px 0px" : '10px 10px 0px 10px' }} >
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
                                        value="I/We have deemed the property unsafe or uninhabitable."
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
                                                    I/We have deemed the property unsafe or uninhabitable.
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </RadioGroup>
                            </FormControl>
                        </Paper>
                    </Grid>

                    {leaseData?.lease_renew_status === "EARLY TERMINATION" && (
                        <Grid item xs={12} md={12}>
                            <Paper sx={{ padding: "10px", backgroundColor: color, width: '95%', margin: isMobile ? "10px 10px 0px 0px" : '10px 10px 0px 10px' }} >
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
                                            value="I/We wish to terminate End Request"
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
                                                        I/We wish to terminate End Request.
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </RadioGroup>
                                </FormControl>
                            </Paper>
                        </Grid>
                    )}
                </Grid>

                {
                    (leaseData?.lease_status === "ACTIVE" || leaseData?.lease_status === "ACTIVE M2M") && (
                        <>
                            <Grid container spacing={4} sx={{ marginBottom: "5px", alignItems: "center", marginTop: isMobile ? "20px" : "10px" }}>
                                <Grid item xs={4} md={5}>
                                    <Typography sx={{ fontSize: "14px", fontWeight: "bold", color: "#3D5CAC", textAlign: "right" }}>Lease End Date</Typography>
                                </Grid>
                                <Grid item xs={8} md={7}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            value={dayjs(leaseEarlyEndDate)}
                                            onChange={e => {
                                                const formattedDate = e ? e.format("MM-DD-YYYY") : null;
                                                setLeaseEarlyEndDate(formattedDate);
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Grid>
                            </Grid>
                            <Grid container spacing={4} sx={{ marginBottom: "5px", alignItems: "center", marginTop: isMobile ? "20px" : "10px" }}>
                                <Grid item xs={4} md={5}>
                                    <Typography sx={{ fontSize: "14px", fontWeight: "bold", color: "#3D5CAC", textAlign: "right" }}>Move-Out Date</Typography>
                                </Grid>
                                <Grid item xs={8} md={7}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            value={dayjs(moveOutDate)}
                                            onChange={e => {
                                                const formattedDate = e ? e.format("MM-DD-YYYY") : null;
                                                console.log('formattedDate--', formattedDate);
                                                setMoveOutDate(formattedDate);
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Grid>
                            </Grid>
                        </>
                    )
                }


                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '10px', marginTop: isMobile ? "20px" : "0px" }}>
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
                        <Button onClick={handleConfirm} autoFocus variant="contained"
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

export default TenantEndLeaseButton;
