import { Box, ThemeProvider, createTheme } from '@mui/system';

import ChaseIcon from '../Images/ChaseIcon.png';
import VenmoIcon from '../Images/VenmoIcon.png';
import ZelleIcon from '../Images/ZelleIcon.png';
import StripeIcon from '../Images/StripeIcon.png';
import ApplePayIcon from '../Images/ApplePayIcon.png';
import PaypalIcon from '../Images/PaypalIcon.png';
import Setting_fill from '../../../images/Setting_fill.png';
import { useEffect, useState } from 'react';
// import axios from 'axios';
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../../utils/httpMiddleware";
import { useNavigate } from "react-router-dom";
import { Stack, Typography, Paper } from '@mui/material';
import theme from '../../../theme/theme';
import { useUser } from "../../../contexts/UserContext";
import Backdrop from "@mui/material/Backdrop"; 
import CircularProgress from "@mui/material/CircularProgress";

import APIConfig from '../../../utils/APIConfig';

function MaintenanceProfile() {
    const navigate = useNavigate();
    const { getProfileId, isEmployee } = useUser();
  
    const [showSpinner, setShowSpinner] = useState(false);
    const [profileData, setProfileData] = useState([]);
    const [business_service_fees, set_business_service_fees] = useState([]); // State for business_services_fees
    const [business_locations, set_business_locations] = useState([]); 
    const [payment_accounts, set_payment_accounts] = useState([]); // State for business_services_fees
  
    useEffect( () => {
      setShowSpinner(true);
      if (!isEmployee()) {
        axios
          .get(`${APIConfig.baseURL.dev}/profile/${getProfileId()}`)
          .then((res) => {
            setProfileData(res.data.profile.result[0]);
            setShowSpinner(false);
            try {
              const parsedFees = JSON.parse(res.data.profile.result[0]?.business_services_fees);
              const parsedLocations = JSON.parse(res.data.profile.result[0]?.business_locations);
              set_business_service_fees(parsedFees);
              set_business_locations(parsedLocations);
            } catch (e) {
              set_business_service_fees([]);
              set_business_locations([]);
            }
          });
      } else {
        axios
          .get(`${APIConfig.baseURL.dev}/profile/${getProfileId()}`)
          .then((res) => {
            //console.log("res is", res)
            setProfileData(res.data.result[0]);
            setShowSpinner(false);
            try {
              const parsedFees = JSON.parse(res.data.result[0]?.business_services_fees);
              const parsedLocations = JSON.parse(res.data.result[0]?.business_locations);
              set_business_service_fees(parsedFees);
              set_business_locations(parsedLocations);
            } catch (e) {
              set_business_service_fees([]);
              set_business_locations([]);
            }
          });
      }
      

        const fetchPaymentData = async () => {
            try {
              const response = await axios.get(`${APIConfig.baseURL.dev}/paymentMethod/${getProfileId()}`);
              set_payment_accounts(response.data.result);
              
              
            } catch (error) {
              set_payment_accounts([]);
              console.error('Error fetching payment accounts:', error);
            }
          };
      
          fetchPaymentData();



    }, []); // Include getProfileId in the dependencies array to avoid eslint warnings




  
    let manager_address = (
        profileData.business_address || profileData.business_unit ||
        profileData.business_city || profileData.business_state || profileData.business_zip ? 
        [
            profileData.business_address && `${profileData.business_address}`,
            profileData.business_unit && `, #${profileData.business_unit}`,
            profileData.business_city && `, ${profileData.business_city}`,
            profileData.business_state && `, ${profileData.business_state}`,
            profileData.business_zip && `, ${profileData.business_zip}`
        ].filter(Boolean).join('') 
            : 'No Address Is Not Available'
    )
  
    let paymentElements = {
      'zelle': { icon: <img src={ZelleIcon} alt="Zelle Icon" width="25" height="25" />} ,
      'apple_pay': {icon: <img src={ApplePayIcon} alt="ApplePay Icon" width="25" height="25" />},
      'stripe':{icon: <img src={StripeIcon} alt="Stripe Icon" width="25" height="25" />},
      'paypal':{icon: <img src={PaypalIcon} alt="Paypal Icon" width="25" height="25" />},
      'venmo':{ icon: <img src={VenmoIcon} alt="Venmo Icon" width="25" height="25" /> },
    };
    
    return (
        <ThemeProvider theme={theme}>
            <Backdrop
                sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={showSpinner}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            <Box
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%', // Take up full screen width
                height: '100vh', // Set the Box height to full view height
                justifyContent: 'flex-start', // Align items at the top
            }}
          >
            <Box
            style={{
                width: '100%',
                // backgroundColor: theme.palette.custom.bgBlue,
                // height: '25%', // 25% of the container's height
            }}>
                <Box
                component="span"
                display= 'flex'
                marginTop='20px'
                justifyContent= 'center'
                alignItems= 'center'
                position= 'relative'>
                    <img 
                    src={Setting_fill} 
                    alt='Settings icon'
                    style={{padding: 5,
                        marginTop: 5,
                        position: 'absolute',
                        left: 0
                    }}
                    onClick={(e) => {navigate('/settingsMaintenance' ,{state: {maintenance_data: profileData}})}}
                    ></img>
                </Box>

                {profileData.business_photo_url !== null ? (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '121px',
                            width: '121px',
                            backgroundColor: '#bbb',
                            borderRadius: '50%',
                            marginLeft: 'auto',
                            marginRight: 'auto',
                            boxShadow: '0px 4px 4px #00000032'
                        }}
                    >
                        <img
                            src={profileData.business_photo_url}
                            alt="Profile"
                            style={{
                                borderRadius: '50%',
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                    </Box>
                ) : (
                    <Box sx={{
                        justifySelf: 'center',
                        height: '121px',
                        width: '121px',
                        backgroundColor: '#bbb',
                        borderRadius: '50%',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        boxShadow: '0px 4px 4px #00000032'
                    }}>
                        
                    </Box>
                )}
                
                
                
                <Stack
                direction="row"
                justifyContent="center"
                marginTop= '10px'>
                <Typography
                sx={{
                    color: theme.typography.common.blue, 
                    fontWeight: theme.typography.common.fontWeight, 
                    fontSize:theme.typography.largeFont}}>
                    {profileData?.business_name}
                </Typography>
                </Stack>
                
                <Stack
                direction="row"
                justifyContent="center">
                <Typography
                sx={{
                    color: theme.typography.common.blue, 
                    fontWeight: theme.typography.light.fontWeight, 
                    fontSize:theme.typography.smallFont}}>
                    Maintenance Profile
                </Typography>
                </Stack>
                

                <Paper
                style={{
                    margin: '30px', // Margin around the paper
                    marginLeft:'auto', 
                    marginRight:'auto', 

                    padding: theme.spacing(2),
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
                    marginTop={5}>
                    <Typography
                    sx={{
                        color: theme.typography.common.blue, 
                        fontWeight: theme.typography.common.fontWeight, 
                        fontSize:theme.typography.smallFont}}>
                        {profileData?.business_email}
                    </Typography>
                    </Stack>
                    
                    <Stack
                    direction="row"
                    justifyContent="center">
                    <Typography
                    sx={{
                        color: theme.typography.common.blue, 
                        fontWeight: theme.typography.light.fontWeight, 
                        fontSize:theme.typography.smallFont}}>
                        Email
                    </Typography>
                    </Stack>
                    
                    <Stack
                    direction="row"
                    justifyContent="center"
                    marginTop={5}>
                    <Typography
                    sx={{
                        color: theme.typography.common.blue, 
                        fontWeight: theme.typography.common.fontWeight, 
                        fontSize:theme.typography.smallFont}}>
                        {profileData?.business_phone_number}
                    </Typography>
                    </Stack>
                    
                    <Stack
                    direction="row"
                    justifyContent="center">
                    <Typography
                    sx={{
                        color: theme.typography.common.blue, 
                        fontWeight: theme.typography.light.fontWeight, 
                        fontSize:theme.typography.smallFont}}>
                        Phone Number
                    </Typography>
                    </Stack>
                    
                    <Stack
                    direction="row"
                    justifyContent="center"
                    marginTop={5}>
                    <Typography
                    sx={{
                        color: theme.typography.common.blue, 
                        fontWeight: theme.typography.common.fontWeight, 
                        fontSize:theme.typography.smallFont}}>
                        {manager_address}
                    </Typography>
                    </Stack>
                    
                    <Stack
                    direction="row"
                    justifyContent="center">
                        <Typography
                            sx={{
                                color: theme.typography.common.blue, 
                                fontWeight: theme.typography.light.fontWeight, 
                                fontSize:theme.typography.smallFont
                            }}>
                            Address
                        </Typography>
                    </Stack>
                </Paper>
                
                <Paper
                style={{
                    margin: '30px', // Margin around the paper
                    marginLeft:'auto', 
                    marginRight:'auto', 
                    padding: theme.spacing(2),
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
                    margin={5}>
                    <Typography
                    sx={{
                        color: theme.typography.common.blue, 
                        fontWeight: theme.typography.common.fontWeight, 
                        fontSize:theme.typography.smallFont}}>
                        Account Details
                    </Typography>
                    </Stack>
                    
                    {payment_accounts.map(payment_account => <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '2px',
                    }}>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            width: '50px',
                            height: '25px',
                        }}>
                            
                        { paymentElements[payment_account.paymentMethod_type]?.icon}


                        </Box>
                        <Typography
                        sx={{
                            width: '200px',
                            color: theme.typography.common.blue, 
                            fontWeight: theme.typography.light.fontWeight, 
                            fontSize:theme.typography.smallFont}}>
                            {payment_account.paymentMethod_name}
                        </Typography>
                        <Box sx={{
                            width: '50px',
                            height: '25px',
                        }}></Box> 
                    </Box> )} 


                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '2px',
                    }}>
                    
                    </Box>
                    
                    
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '2px',
                    }}>
                    { (profileData?.business_routing_number && profileData?.business_account_number) && <>
                        <Box sx={{
                            width: '50px',
                            height: '25px',
                        }}>
                            <img src={ChaseIcon} alt="Chase Icon" width="46" height="25" />
                        </Box>
                        <Typography
                        sx={{
                            width: '200px',
                            color: theme.typography.common.blue, 
                            fontWeight: theme.typography.light.fontWeight, 
                            fontSize:theme.typography.smallFont}}>
                            {profileData?.business_routing_number + profileData?.business_account_number}
                        </Typography>
                        <Box sx={{
                            width: '50px',
                            height: '25px',
                        }}></Box>
                        </>}

                        {!payment_accounts.length && <Typography
                    sx={{
                        color: theme.typography.common.blue, 
                        fontWeight: theme.typography.common.fontWeight, 
                        fontSize:theme.typography.smallFont}}>
                            {'No Information Is Available'}
                        </Typography>}
                    </Box>
                </Paper>
                
                <Paper
                style={{
                    margin: '30px', // Margin around the paper
                    marginLeft:'auto', 
                    marginRight:'auto', 
                    padding: theme.spacing(2),
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
                    margin={5}>
                    <Typography
                    sx={{
                        color: theme.typography.common.blue, 
                        fontWeight: theme.typography.common.fontWeight, 
                        fontSize:theme.typography.smallFont}}>
                        Service Details
                    </Typography>
                    </Stack>
                    
                    
                    {
                        business_service_fees.map((fee, index)=>
                    
                            <Stack
                                direction="row"
                                justifyContent="left"
                                marginLeft={10}
                                key={index}
                            >
                            <Box
                                sx={{
                                    color: theme.typography.common.blue, 
                                    fontWeight: theme.typography.light.fontWeight, 
                                    fontSize:theme.typography.smallFont,
                                    paddingBottom: '10px'
                                }}
                            >
                                
                                <Typography
                                    sx={{
                                        color: theme.typography.common.blue, 
                                        fontWeight: 'bold', 
                                        fontSize:theme.typography.smallFont
                                    }}
                                >
                                    { `${fee.service_name}` }
                                </Typography>
                                
                                
                                <FlexBox direction="row">
                                    <Box sx={{ paddingRight: '10px' }}>
                                        <Box sx={{ fontSize: '13px' }}>No. of hours</Box>
                                        <Box sx={{ fontSize: '13px', color: '#160449' }}>{`${fee.hours ? fee.hours : '<NUM_HOURS>'}`}</Box>
                                    </Box>
                                    <Box sx={{ padding: '0 10px' }}>
                                        <Box sx={{ fontSize: '13px' }}>Charge per hour</Box>
                                        <Box sx={{ fontSize: '13px', color: '#160449' }}>{`${fee.charge ? fee.charge : '<CHARGE>'}`}</Box>
                                    </Box>
                                    <Box sx={{ paddingLeft: '10px' }}>
                                        <Box sx={{ fontSize: '13px' }}>Total Cost</Box>
                                        <Box sx={{ fontSize: '13px', color: '#160449' }}>{`${fee.total_cost ? fee.total_cost : '<TOTAL_COST>'}`}</Box>
                                    </Box>
                                </FlexBox>
                            </Box>
                            </Stack> 
                            )
                    }
                    
                    
                    
                </Paper>

                <Paper
                style={{
                    margin: '30px', // Margin around the paper
                    marginLeft:'auto', 
                    marginRight:'auto', 
                    padding: theme.spacing(2),
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
                    margin={5}>
                    <Typography
                    sx={{
                        color: theme.typography.common.blue, 
                        fontWeight: theme.typography.common.fontWeight, 
                        fontSize:theme.typography.smallFont}}>
                        Locations
                    </Typography>
                    </Stack>
                    
                    
                    {
                        business_locations.map( l=>
                    
                            <Stack
                                direction="row"
                                justifyContent="left"
                                marginLeft={10}
                            >
                            <Box
                                sx={{
                                    color: theme.typography.common.blue, 
                                    fontWeight: theme.typography.light.fontWeight, 
                                    fontSize:theme.typography.smallFont,
                                    paddingBottom: '10px'
                                }}
                            >
                                
                                <Typography
                                    sx={{
                                        color: theme.typography.common.blue, 
                                        fontWeight: 'bold', 
                                        fontSize:theme.typography.smallFont
                                    }}
                                >
                                    { `${l.address}` }
                                </Typography>
                                
                                <FlexBox direction="row">
                                    {/* <Box sx={{ paddingRight: '10px' }}>
                                        <Box sx={{ fontSize: '13px' }}>Location</Box>
                                        <Box sx={{ fontSize: '13px', color: '#160449' }}>{`${l.address ? l.address : '<ADDRESS>'}`}</Box>
                                    </Box> */}
                                    <Box sx={{ paddingRight: '10px' }}>
                                        <Box sx={{ fontSize: '13px' }}>City</Box>
                                        <Box sx={{ fontSize: '13px', color: '#160449' }}>{`${l.city ? l.city : '<CITY>'}`}</Box>
                                    </Box>
                                    <Box sx={{ padding: '0 10px' }}>
                                        <Box sx={{ fontSize: '13px' }}>State</Box>
                                        <Box sx={{ fontSize: '13px', color: '#160449' }}>{`${l.state ? l.state : '<STATE>'}`}</Box>
                                    </Box>
                                    <Box sx={{ paddingLeft: '10px' }}>
                                        <Box sx={{ fontSize: '13px' }}>Miles</Box>
                                        <Box sx={{ fontSize: '13px', color: '#160449' }}>{`${l.miles ? l.miles : '<MILES>'}`}</Box>
                                    </Box>
                                </FlexBox>
                            </Box>
                            </Stack> 
                            )
                    }
                    
                    
                    
                </Paper>
                
                <Paper
                style={{
                    margin: '30px', // Margin around the paper
                    marginLeft:'auto', 
                    marginRight:'auto', 
                    padding: theme.spacing(2),
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
                    
                    <Box sx={{marginTop: 10, marginBottom: 10}}>

                        
                        <Stack
                        direction="row"
                        justifyContent="center">
                            <Typography
                           sx={{
                        color: theme.typography.common.blue, 
                        fontWeight: theme.typography.common.fontWeight, 
                        fontSize:theme.typography.smallFont}}>
                                SSN/EIN
                            </Typography>
                        </Stack>
                        <Stack
                        direction="row"
                        justifyContent="center">
                            <Typography
                            sx={{
                                // width: '200px',
                                color: theme.typography.common.blue, 
                                fontSize: '12px'}}>
                                {profileData?.business_ein_number === "" ? "No EIN Provided" :  profileData?.business_ein_number}
                            </Typography>
                        </Stack>
                    </Box>
                </Paper>
                    
                {/* <Paper onClick={() => { navigate('/PMProfileEdit' ,{state: {manager_data: profileData}}) }} */}
                <Paper
                    style={{
                        margin: '30px', // Margin around the paper
                        marginLeft:'auto', 
                        marginRight:'auto', 
                        marginBottom:'30px',
                        padding: theme.spacing(2),
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
                    <FlexBox direction="row" >
                        <Box >
                        <Typography
                                        sx={{
                                            // width: '200px',
                                            color: theme.typography.common.blue, 
                                            fontSize: '15px',
                                            fontWeight:'bald'}}>
                                            Edit Profile
                                        </Typography>
                        </Box>
                    </FlexBox>
                </Paper> 
                    {/* <Box sx={{
                        borderRadius: "10px",
                        boxShadow: '0px 4px 4px #00000032'
                    }}>
                        <GrayBox>
                            <TextBox fontSize={'15px'} fontWeight={'bold'}>
                                Edit Profile and Password
                            </TextBox>
                        </GrayBox>
                    </Box> */}
                </Box>
            </Box>
        </ThemeProvider>
    );
}

function GrayBox(props) {
    return (
        <Box sx={{
            backgroundColor: 'background.gray',
            borderRadius: "10px",
            // margin: "18px",
            padding: '6px',
        }}>
            {props.children}
        </Box>
    );
}

function FlexBox(props) {
    return (
        <Box sx={{
            display: "flex",
            flexDirection: props.direction,
            justifyContent: 'space-evenly',
        }}>
            {props.children}
        </Box>
    );
}

function TextBox(props) {
    return (
        <Box sx={{
            display: "flex",
            flexWrap: 'wrap',
            justifyContent: 'center',
            fontSize: props.fontSize,
            fontWeight: props.fontWeight,
            textDecoration: props.decoration,
        }}>
            {props.children}
        </Box>
    );
}
export default MaintenanceProfile;