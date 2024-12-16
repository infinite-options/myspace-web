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
import { useNavigate } from 'react-router-dom';
import APIConfig from '../../utils/APIConfig';


const EarlyTerminationDialog = ({ theme, leaseDetails, selectedLeaseId, setIsEndClicked, handleUpdate, isTerminatingRenewedLease, renewedLease }) => {
    // console.log("17 - leaseDetails - ", leaseDetails);    
    const [confirmationText, setConfirmationText] = useState("")
    const [showSpinner, setShowSpinner] = useState(false); 
    const navigate = useNavigate();              

    const handleRejectEndRequest = async () => {
        setShowSpinner(true);
        const headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Credentials": "*",
        };

        const lease = isTerminatingRenewedLease === true ? renewedLease : leaseDetails;

        const leaseApplicationFormData = new FormData();        
        leaseApplicationFormData.append("lease_uid", lease.lease_uid);        
        leaseApplicationFormData.append("lease_renew_status", "EARLY TERMINATION REJECTED");        

        // console.log('leaseApplicationFormData', leaseDetails.lease_uid);
        // console.log('end form', leaseApplicationFormData);                
        axios
            .put(`${APIConfig.baseURL.dev}/leaseApplication`, leaseApplicationFormData, headers)
            .then((response) => {
                setShowSpinner(false);
                console.log("Data updated successfully", response);                
            })
            .catch((error) => {
                if (error.response) {                    
                    console.log(error.response.data);
                }
            }); 

        await handleUpdate();
        await setIsEndClicked(false);
        navigate("/managerDashboard")
    };

    const handleApproveEndRequest = async () => {
        setShowSpinner(true);
        const headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Credentials": "*",
        };

        const lease = isTerminatingRenewedLease === true ? renewedLease : leaseDetails;

        const today = new Date();
        const formattedDate = `${(today.getMonth() + 1)}-${today.getDate()}-${today.getFullYear()}`;
        console.log("ROHIT - 66 - formattedDate - ", formattedDate);        

        const leaseApplicationFormData = new FormData();        
        leaseApplicationFormData.append("lease_uid", lease.lease_uid);        
        
        if(isTerminatingRenewedLease === true){
            leaseApplicationFormData.append("lease_status", "ENDED");
            // leaseApplicationFormData.append("lease_end", formattedDate);
        } else {
            leaseApplicationFormData.append("lease_renew_status", "ENDING");
            leaseApplicationFormData.append("lease_end", lease.move_out_date);                    
        }
        

        // console.log('leaseApplicationFormData', leaseDetails.lease_uid, leaseDetails.move_out_date);
        // console.log('end form', leaseApplicationFormData);        
        
        axios
            .put(`${APIConfig.baseURL.dev}/leaseApplication`, leaseApplicationFormData, headers)
            .then((response) => {
                setShowSpinner(false);
                console.log("Data updated successfully", response);                
            })
            .catch((error) => {
                if (error.response) {                    
                    console.log(error.response.data);
                }
            });        
        await handleUpdate();
        await setIsEndClicked(false);
        navigate("/managerDashboard")
    };

    const handleCancel = () => {
        setIsEndClicked(false);
    }    

    return (
        <Box
            style={{
                display: "flex",
                // justifyContent: "center",
                // width: "100%",
                height: "100%",
            }}
        >
            <Paper
                style={{
                    // marginTop: "10px",
                    backgroundColor: theme.palette.primary.main,
                    width: "100%", // Occupy full width with 25px margins on each side
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
                            {isTerminatingRenewedLease === true ? "Lease Renewal Cancellation" : "Early Termination Request"}
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={12}>
                        <Typography
                            sx={{
                                color: "#160449",
                                fontWeight: theme.typography.primary.fontWeight,
                                fontSize: theme.typography.smallFont,
                                marginLeft: '10px',
                                // textAlign: 'center'
                            }}
                        >
                            {isTerminatingRenewedLease === true ? "The tenant would like to cancel the renewed lease." : "The tenant has requested for early termination of the lease."}
                            
                        </Typography>
                    </Grid>                                                           
                </Grid>
                <Grid container sx={{padding: '5px',}}>
                    <Grid item xs={3}>
                        <Typography
                            sx={{
                                color: "#160449",
                                fontWeight: theme.typography.primary.fontWeight,
                                fontSize: theme.typography.smallFont,
                                marginLeft: '10px',
                                // textAlign: 'center'
                            }}
                        >
                            Requested on:
                        </Typography>
                    </Grid>
                    <Grid item xs={9}>
                        <Typography
                            sx={{
                                color: "#160449",
                                fontWeight: theme.typography.primary.fontWeight,
                                fontSize: theme.typography.smallFont,
                                marginLeft: '10px',
                                // textAlign: 'center'
                            }}
                        >
                            {isTerminatingRenewedLease === false ? leaseDetails.lease_early_end_date : renewedLease?.lease_early_end_date}
                        </Typography>
                    </Grid>
                </Grid> 
                {
                    isTerminatingRenewedLease === false && (
                        <Grid container sx={{padding: '5px',}}>
                            <Grid item xs={3}>
                                <Typography
                                    sx={{
                                        color: "#160449",
                                        fontWeight: theme.typography.primary.fontWeight,
                                        fontSize: theme.typography.smallFont,
                                        marginLeft: '10px',
                                        // textAlign: 'center'
                                    }}
                                >
                                    Move-out date:
                                </Typography>
                            </Grid>
                            <Grid item xs={9}>
                                <Typography
                                    sx={{
                                        color: "#160449",
                                        fontWeight: theme.typography.primary.fontWeight,
                                        fontSize: theme.typography.smallFont,
                                        marginLeft: '10px',
                                        // textAlign: 'center'
                                    }}
                                >
                                    {leaseDetails.move_out_date}
                                </Typography>
                            </Grid>
                        </Grid> 
                    )
                }                
                <Grid container sx={{padding: '5px',}}>
                    <Grid item xs={3}>
                        <Typography
                            sx={{
                                color: "#160449",
                                fontWeight: theme.typography.primary.fontWeight,
                                fontSize: theme.typography.smallFont,
                                marginLeft: '10px',
                                // textAlign: 'center'
                            }}
                        >
                            Lease End Date:
                        </Typography>
                    </Grid>
                    <Grid item xs={9}>
                        <Typography
                            sx={{
                                color: "#160449",
                                fontWeight: theme.typography.primary.fontWeight,
                                fontSize: theme.typography.smallFont,
                                marginLeft: '10px',
                                // textAlign: 'center'
                            }}
                        >
                            {isTerminatingRenewedLease === false ? leaseDetails.lease_end : renewedLease?.lease_end}
                        </Typography>
                    </Grid>
                </Grid>                     
                <Grid container sx={{padding: '5px',}}>
                    <Grid item xs={3}>
                        <Typography
                            sx={{
                                color: "#160449",
                                fontWeight: theme.typography.primary.fontWeight,
                                fontSize: theme.typography.smallFont,
                                marginLeft: '10px',
                                // textAlign: 'center'
                            }}
                        >
                            Notice Period:
                        </Typography>
                    </Grid>
                    <Grid item xs={9}>
                        <Typography
                            sx={{
                                color: "#160449",
                                fontWeight: theme.typography.primary.fontWeight,
                                fontSize: theme.typography.smallFont,
                                marginLeft: '10px',
                                // textAlign: 'center'
                            }}
                        >
                            {isTerminatingRenewedLease === false && (leaseDetails.lease_end_notice_period ? `${leaseDetails.lease_end_notice_period} days` : 'Not specified')}
                            {isTerminatingRenewedLease === true && renewedLease?.lease_end_notice_period ? `${renewedLease?.lease_end_notice_period} days` : 'Not specified'}
                        </Typography>
                    </Grid>
                </Grid>                     
                <Grid container sx={{padding: '5px',}}>
                    <Grid item xs={3}>
                        <Typography
                            sx={{
                                color: "#160449",
                                fontWeight: theme.typography.primary.fontWeight,
                                fontSize: theme.typography.smallFont,
                                marginLeft: '10px',
                                // textAlign: 'center'
                            }}
                        >
                            Reason:
                        </Typography>
                    </Grid>
                    <Grid item xs={9}>
                        <Typography
                            sx={{
                                color: "#160449",
                                fontWeight: theme.typography.primary.fontWeight,
                                fontSize: theme.typography.smallFont,
                                marginLeft: '10px',
                                // textAlign: 'center'
                            }}
                        >
                            {isTerminatingRenewedLease === false ? leaseDetails.lease_end_reason : renewedLease?.lease_end_reason}                            
                        </Typography>
                    </Grid>
                </Grid>
                {/* <Grid container sx={{padding: '5px',}}>
                    <Grid item xs={3}>
                        <Typography
                            sx={{
                                color: "#160449",
                                fontWeight: theme.typography.primary.fontWeight,
                                fontSize: theme.typography.smallFont,
                                marginLeft: '10px',
                                // textAlign: 'center'
                            }}
                        >
                            Notice Period:
                        </Typography>
                    </Grid>
                    <Grid item xs={9}>
                        <Typography
                            sx={{
                                color: "#160449",
                                fontWeight: theme.typography.primary.fontWeight,
                                fontSize: theme.typography.smallFont,
                                marginLeft: '10px',
                                // textAlign: 'center'
                            }}
                        >
                            {leaseDetails.lease_end_notice_period ? `${leaseDetails.lease_end_notice_period} days` : 'Not specified'}
                        </Typography>
                    </Grid>
                </Grid>                      */}

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
                        Close
                    </Button>
                    <Button
                        sx={{
                            marginRight: '5px',
                            background: "#A52A2A",
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
                        onClick={handleRejectEndRequest}
                        color="secondary">
                        Reject
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
                        onClick={handleApproveEndRequest}
                        color="secondary">
                        Approve
                    </Button>
                </Box>                
            </Paper>
        </Box>        

    );
};

export default EarlyTerminationDialog;
