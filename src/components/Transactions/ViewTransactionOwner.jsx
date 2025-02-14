import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    ThemeProvider,
    Paper,
    Button,
    Typography,
    Stack,
    Grid
  } from "@mui/material";
import MobileStepper from '@mui/material/MobileStepper';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import SwipeableViews from 'react-swipeable-views';
import { autoPlay } from 'react-swipeable-views-utils';
import theme from "../../theme/theme";
import UTurnLeftIcon from '@mui/icons-material/UTurnLeft';
import PayPal from '../../images/PayPal.png'
import Zelle from '../../images/Zelle.png'
import Venmo from '../../images/Venmo.png'
import Chase from '../../images/Chase.png'
import Stripe from '../../images/Stripe.png'
import ApplePay from '../../images/ApplePay.png'
import moment from 'moment';
const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

export default function ViewTransactionOwner(props) {
    const location = useLocation();
    const history = location.state.history;
    const purchase_uid = location.state.purchase_uid;
    const [rows, setRows] = useState(getInitialRows());
    
    const navigate = useNavigate();
    const [currentId, setCurrentId] = useState(purchase_uid);
    const [activeStep, setActiveStep] = useState(history.findIndex((txn) => txn.purchase_uid === purchase_uid));
    // const maxSteps = images.length;
    const maxSteps = rows.length;

    function getInitialRows() {
        const initialRows = history.map((txn) => {
            return txn
        })
        //console.log("printing - initialRows", initialRows);
        return initialRows;
    }

    useEffect(() => {
        setRows(getInitialRows());
        //console.log("printing - history, purchase_uid ", history, purchase_uid, rows)
        setActiveStep(history.findIndex((txn) => txn.purchase_uid === purchase_uid));
      }, [history, purchase_uid]);

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        setCurrentId(rows[activeStep+1].purchase_uid);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
        setCurrentId(rows[activeStep-1].purchase_uid);
    };

    const handleStepChange = (step) => {
        setActiveStep(step);
        setCurrentId(rows[step].purchase_uid);
    };


    return (
        <>
            <ThemeProvider theme={theme}>
            {/* <PropertyListData setPropertyList={setPropertyList}></PropertyListData> */}
            <Box
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    width: '100%', // Take up full screen width
                    minHeight: '100vh', // Set the Box height to full height
                    marginTop: theme.spacing(2), // Set the margin to 20px
                }}
            >
                <Paper
                    style={{
                        margin: '30px',
                        padding: 20,
                        backgroundColor: theme.palette.primary.main,
                        width: '85%', // Occupy full width with 25px margins on each side
                        [theme.breakpoints.down('sm')]: {
                            width: '80%',
                        },
                        [theme.breakpoints.up('sm')]: {
                            width: '50%',
                        },
                    }}
                >
                    <Stack
                    direction="row"
                    justifyContent="center"
                    >
                        <Typography sx={{color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize:theme.typography.largeFont}}>
                        Transaction History
                        </Typography>
                    </Stack>
                    <Stack>
                    <Button sx={{ textTransform: 'capitalize' }} onClick={()=>navigate(-1)}>
                        <UTurnLeftIcon sx={{transform: "rotate(90deg)", color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight, fontSize:theme.typography.largeFont, padding: 5}}/>
                        <Typography 
                        sx={{color: theme.typography.common.blue, fontWeight: theme.typography.common.fontWeight, fontSize:theme.typography.smallFont}}
                        >
                        Return to Viewing All Payments
                        </Typography>
                    </Button>
                    </Stack>
                    
                    <Box m={0} sx={{ flexGrow: 1 }}>
                    <Paper
                        square
                        elevation={0}
                        sx={{
                        display: 'flex',
                        alignItems: 'center',
                        pl: 2,
                        bgcolor: 'background.default',
                        }}
                    >
                    </Paper>
                    <SwipeableViews
                        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                        index={activeStep}
                        onChangeIndex={handleStepChange}
                        enableMouseEvents
                    >
                        {rows.map((txn, index) => (
                            <Paper
                                style={{
                                    // padding: 10,
                                    backgroundColor: theme.palette.primary.secondary,
                                    [theme.breakpoints.down('sm')]: {
                                        width: '80%',
                                    },
                                    [theme.breakpoints.up('sm')]: {
                                        width: '50%',
                                    },
                            }}>
                                <Box
                                sx=
                                {{
                                    height: '20vh', 
                                    backgroundColor: txn.pur_cf_type === 'expense' ? theme.palette.custom.palePink : theme.palette.custom.blue
                                }}>
                                    <Box
                                    component="span"
                                    m={0}
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    >
                                    <Button size="small" sx={{color: theme.typography.primary.black}} onClick={handleBack} disabled={activeStep === 0}>
                                        {theme.direction === 'rtl' ? (
                                        <ArrowForwardIcon />
                                        ) : (
                                        <ArrowBackIcon />
                                        )}
                                    </Button>
                                    <Typography>{index+1} of {history.length} Payments</Typography>
                                    <Button
                                        size="small"
                                        sx={{color: theme.typography.primary.black}} 
                                        onClick={handleNext}
                                        disabled={activeStep === maxSteps - 1}
                                    >
                                        {theme.direction === 'rtl' ? (
                                        <ArrowBackIcon />
                                        ) : (
                                        <ArrowForwardIcon />
                                        )}
                                    </Button>
                                    </Box>
                                    <Stack
                                    direction="row"
                                    justifyContent="center"
                                    marginTop='10px'
                                    >
                                        <Typography sx={{color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize:theme.typography.largeFont}}>
                                        {txn.payer_user_name}
                                        </Typography>
                                    </Stack>
                                    <Box
                                    component="span"
                                    m={0}
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    >
                                        <div style={{flex: 1, height: 2, backgroundColor: '#000000'}}></div>
                                        <Typography sx={{margin:'10px', color: theme.typography.primary.black}}>
                                        to
                                        </Typography>
                                        <div style={{flex: 1, height: 2, backgroundColor: '#000000'}}></div>
                                    </Box>
                                    <Stack
                                    direction="row"
                                    justifyContent="center"
                                    >
                                        <Typography sx={{color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize:theme.typography.largeFont}}>
                                        {txn.receiver_user_name}
                                        </Typography>
                                    </Stack>
                                </Box>
                                <Stack
                                direction="row"
                                justifyContent="center"
                                marginTop='30px'
                                >
                                    <Typography sx={{color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize:24}}>
                                    ${parseFloat(txn.total_paid).toFixed(2)}
                                    </Typography>
                                </Stack>
                                <Stack
                                direction="row"
                                justifyContent="center"
                                marginTop='30px'
                                >
                                    <Typography sx={{color: theme.typography.primary.black, fontSize:16}}>
                                    Date Paid: {' '}
                                    {txn.purchase_date !== null
                                                    ? moment(txn.purchase_date.substring(0, 10)).format('MM/DD/YY')
                                                    : "Not Available"}
                                    </Typography>
                                </Stack>
                                <Stack
                                direction="row"
                                justifyContent="center"
                                marginTop='30px'
                                >
                                    <Typography sx={{color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize:theme.typography.largeFont}}>
                                    {txn.purchase_type}
                                    </Typography>
                                </Stack>
                                <Stack
                                direction="row"
                                justifyContent="center"
                                marginTop='30px'
                                >
                                    <Typography sx={{color: theme.typography.common.blue, fontSize:15}}>
                                    {txn.pur_notes}
                                    </Typography>
                                </Stack>
                                <Stack
                                // direction="row"
                                justifyContent="center"
                                margin='30px'
                                >
                                    <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                                        <Grid item xs={3}>
                                            {txn.payment_type === 'STRIPE' && <img src={Stripe} alt='Stripe Logo' width='50' height='40' />}
                                            {txn.payment_type === 'PAYPAL' && <img src={PayPal} alt='PayPal Logo' width='50' height='40' />}
                                            {txn.payment_type === 'VENMO' && <img src={Venmo} alt='Venmo Logo' width='50' height='40' />}
                                            {txn.payment_type === 'ZELLE' && <img src={Zelle} alt='Zelle Logo' width='50' height='40' />}
                                            {txn.payment_type === 'CHASE' && <img src={Chase} alt='Chase Logo' width='50' height='40' />}
                                            {txn.payment_type === 'APPLE PAY' && <img src={ApplePay} alt='ApplePay Logo' width='50' height='40' />}
                                            {txn.payment_type === null && <img src={ApplePay} alt='ApplePay Logo' width='50' height='40' />}

                                        {/* {txn.payment_type === 'WELLS FARGO' && <img src={ApplePay} alt='ApplePay Logo' width='50' height='40' />}
                                        {txn.payment_type === 'BANK OF AMERICA' && <img src={ApplePay} alt='ApplePay Logo' width='50' height='40' />} */}
                                        </Grid>
                                        <Grid item xs={9}>
                                            <Stack
                                            direction="row"
                                            // justifyContent="right"
                                            >
                                                <Typography sx={{color: theme.typography.common.black, fontSize:14}}>
                                                {txn.payment_type ? txn.payment_type : "no payment type"}: {txn.total_paid ? "$" + txn.total_paid : "no payment amount"}
                                                </Typography>
                                            </Stack>
                                            <Stack
                                            direction="row"
                                            // justifyContent="left"
                                            >
                                                <Typography sx={{color: theme.typography.common.black, fontSize:14}}>
                                                {txn.pay_charge_id ? txn.pay_charge_id : "no charge id"}
                                                </Typography>
                                            </Stack>   
                                        </Grid>
                                    </Grid>                     
                                </Stack>
                                
                                <Box
                                    component="span"
                                    m={0}
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    marginTop='30px'
                                    padding='10px'
                                >
                                    <Typography sx={{color: theme.typography.common.blue, fontSize:14}}>
                                        Transaction ID: {txn.purchase_uid}
                                    </Typography>
                                    <Typography sx={{color: theme.typography.common.blue, fontSize:14}}>
                                        Recipient ID: {txn.receiver_user_id}
                                    </Typography>
                                </Box>
                            </Paper>
                        ))}
                    </SwipeableViews>
                    </Box>
                    </Paper>
                </Box>
            </ThemeProvider>
        </>
    )
}