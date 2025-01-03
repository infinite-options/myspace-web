import React, { useEffect, useState } from 'react';
import theme from '../../../theme/theme';
import {
    ThemeProvider,
    Box,
    Paper,
    Stack,
    Typography,
    Button,
} from '@mui/material';
import { getStatusColor } from '../ContactsFunction';
import { Email, Message, Phone } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { maskSSN, maskEIN, formattedPhoneNumber } from '../../utils/privacyMasking';
import { useUser } from "../../../contexts/UserContext";
import User_fill from '../../../images/User_fill_dark.png'

const MaintenanceContactDetails = (props) => {
    const { selectedRole } = useUser();
    const navigate = useNavigate();
    const location = useLocation();
    const contactDetails = location.state.dataDetails;
    const contactsTab = location.state.tab;
    // const selectedData = location.state.selectedData;
    // const index = location.state.index;
    const [index, setIndex] = useState(location.state.index);
    // const passedData = location.state.viewData;

    useEffect(() => {
        //console.log("INDEX UPDATED - ", index);
        // location.state.index = index;
        //console.log("DATA DETAILS", contactDetails[index])
    }, [index]);

    // const [currentViewData, setCurrentViewData] = useState();

    //console.log(contactDetails);
    // //console.log(selectedData);
    //console.log("INDEX", index);
    //console.log('SELECTED ROLE - ', selectedRole);


    // const uniqueValues = {};

    // const uniqueContacts = contactDetails.filter((item) => {
    //     if (
    //         !uniqueValues[item.tenant_uid] &&
    //         item.contract_status !== 'TERMINATED'
    //     ) {
    //         uniqueValues[item.tenant_uid] = item;
    //         return true;
    //     }
    //     return false;
    // });

    // //console.log(uniqueContacts);

    // const tenant_object = Object.values(uniqueValues)[index];

    // //console.log(tenant_object);

    const handleBackBtn = () => {
        // navigate('/contacts');
        navigate(-1);
    };

    // useEffect(() => {
    //     setCurrentViewData(selectedData);
    // }, []);

    return (
        <ThemeProvider theme={theme}>
            <Box
                style={{
                    display: 'flex',
                    fontFamily: 'Source Sans Pro',
                    justifyContent: 'center',
                    width: '100%', // Take up full screen width
                    minHeight: '90vh', // Set the Box height to full height
                    marginTop: theme.spacing(2), // Set the margin to 20px
                }}
            >
                <Paper
                    style={{
                        margin: '30px',
                        padding: theme.spacing(2),
                        backgroundColor: theme.palette.primary.main,
                        width: '85%', // Occupy full width with 25px margins on each side
                        [theme.breakpoints.down('sm')]: {
                            width: '80%',
                        },
                        [theme.breakpoints.up('sm')]: {
                            width: '50%',
                        },
                        paddingTop: '10px',
                    }}
                >
                    <Stack alignItems="center">
                        <Typography
                            sx={{
                                color: theme.typography.primary.black,
                                fontSize: theme.typography.largeFont.fontSize,
                                fontWeight: theme.typography.primary.fontWeight,
                            }}
                        >
                            Maintenance Contact
                        </Typography>
                        <Stack flexDirection="row" justifyContent="center">
                            <Button
                                sx={{ padding: '0', minWidth: '50px' }}
                                onClick={handleBackBtn}
                            >
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M4 8L2.58579 9.41421L1.17157 8L2.58579 6.58579L4 8ZM9 21C7.89543 21 7 20.1046 7 19C7 17.8954 7.89543 17 9 17L9 21ZM7.58579 14.4142L2.58579 9.41421L5.41421 6.58579L10.4142 11.5858L7.58579 14.4142ZM2.58579 6.58579L7.58579 1.58579L10.4142 4.41421L5.41421 9.41421L2.58579 6.58579ZM4 6L14.5 6L14.5 10L4 10L4 6ZM14.5 21L9 21L9 17L14.5 17L14.5 21ZM22 13.5C22 17.6421 18.6421 21 14.5 21L14.5 17C16.433 17 18 15.433 18 13.5L22 13.5ZM14.5 6C18.6421 6 22 9.35786 22 13.5L18 13.5C18 11.567 16.433 10 14.5 10L14.5 6Z"
                                        fill="#3D5CAC"
                                    />
                                </svg>
                            </Button>
                            <Typography
                                sx={{
                                    color: theme.typography.common.blue,
                                    fontSize:
                                        theme.typography.smallFont.fontSize,
                                }}
                                onClick={handleBackBtn}
                            >
                                Return to Viewing All Listings
                            </Typography>
                        </Stack>
                    </Stack>
                    <Paper
                        sx={{
                            margin: '10px',
                            borderRadius: '10px',
                            backgroundColor: theme.palette.form.main,
                            paddingBottom: '25px',
                        }}
                    >
                        <Stack
                            sx={{
                                color: theme.typography.secondary.white,
                                backgroundColor: getStatusColor(contactsTab),
                                borderRadius: '10px 10px 0 0',
                            }}
                        >
                            <Stack
                                flexDirection="row"
                                justifyContent="space-between"
                                sx={{
                                    padding: '5px 10px',
                                }}
                            >
                                <Box onClick={() => {
                                        //console.log("Previous button clicked. INDEX - ", index);
                                        index > 0? setIndex(index-1) : setIndex(contactDetails.length - 1)
                                    }}
                                >
                                    <svg
                                        width="33"
                                        height="33"
                                        viewBox="0 0 33 33"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M5.5 16.5L4.08579 15.0858L2.67157 16.5L4.08579 17.9142L5.5 16.5ZM26.125 18.5C27.2296 18.5 28.125 17.6046 28.125 16.5C28.125 15.3954 27.2296 14.5 26.125 14.5V18.5ZM12.3358 6.83579L4.08579 15.0858L6.91421 17.9142L15.1642 9.66421L12.3358 6.83579ZM4.08579 17.9142L12.3358 26.1642L15.1642 23.3358L6.91421 15.0858L4.08579 17.9142ZM5.5 18.5H26.125V14.5H5.5V18.5Z"
                                            fill={
                                                theme.typography.secondary.white
                                            }
                                        />
                                    </svg>
                                </Box>
                                <Box>
                                    <Typography
                                        sx={{
                                            fontWeight:
                                                theme.typography.primary
                                                    .fontWeight,
                                        }}
                                    >
                                        {index + 1} of {contactDetails.length} Contacts 
                                        {/* {contactsTab} */}
                                    </Typography>
                                </Box>
                                <Box onClick={() => {
                                        //console.log("Next button clicked. INDEX - ", index);
                                        (index < contactDetails.length - 1) ? setIndex(index+1) : setIndex(0)
                                    }}
                                >
                                    <svg
                                        width="33"
                                        height="33"
                                        viewBox="0 0 33 33"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M27.5 16.5L28.9142 17.9142L30.3284 16.5L28.9142 15.0858L27.5 16.5ZM6.875 14.5C5.77043 14.5 4.875 15.3954 4.875 16.5C4.875 17.6046 5.77043 18.5 6.875 18.5L6.875 14.5ZM20.6642 26.1642L28.9142 17.9142L26.0858 15.0858L17.8358 23.3358L20.6642 26.1642ZM28.9142 15.0858L20.6642 6.83579L17.8358 9.66421L26.0858 17.9142L28.9142 15.0858ZM27.5 14.5L6.875 14.5L6.875 18.5L27.5 18.5L27.5 14.5Z"
                                            fill={
                                                theme.typography.secondary.white
                                            }
                                        />
                                    </svg>
                                </Box>
                            </Stack>
                            <Stack
                                alignItems="center"
                                sx={{
                                    backgroundColor:
                                        getStatusColor(contactsTab),
                                    paddingBottom: '70px',
                                    boxShadow: '0 4px 2px 0 #00000025',
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontWeight:
                                            theme.typography.common.fontWeight,
                                    }}
                                >
                                    {/* {selectedData.contact_first_name}{' '}
                                    {selectedData.contact_last_name} */}
                                    {`
                                        ${contactDetails[index].contact_first_name? contactDetails[index].contact_first_name : '<FIRST_NAME>'}
                                        ${contactDetails[index].contact_last_name? contactDetails[index].contact_last_name : '<LAST_NAME>'}
                                    `}
                                </Typography>
                            </Stack>
                        </Stack>
                        <Stack justifyContent="center" alignItems="center">
                            <Box
                                sx={{
                                    backgroundColor: '#A9A9A9',
                                    height: '68px',
                                    width: '68px',
                                    borderRadius: '68px',
                                    marginTop: '-34px',
                                }}
                            >
                                <img
                                    src={contactDetails[index].contact_photo_url? contactDetails[index].contact_photo_url : User_fill}
                                    alt="profile"
                                    style={{
                                        height: '60px',
                                        width: '60px',
                                        borderRadius: '68px',
                                        margin: '4px',
                                    }}
                                />
                            </Box>
                        </Stack>
                        <Stack sx={{ padding: '10px 15px 0' }}>
                            <Box>
                                <Message
                                    sx={{
                                        color: theme.typography.common.blue,
                                        fontSize: '18px',
                                    }}
                                />
                            </Box>
                        </Stack>
                        <Stack
                            flexDirection="row"
                            justifyContent="space-between"
                            sx={{ padding: '0 15px' }}
                        >
                            <Stack>
                                <Stack flexDirection="row">
                                    <Email
                                        sx={{
                                            color: '#160449',
                                            fontSize: '18px',
                                            paddingRight: '5px',
                                        }}
                                    />
                                    <Typography
                                        sx={{
                                            fontSize: '13px',
                                        }}
                                    >
                                        {/* {selectedData.contact_email} */}
                                        { contactDetails[index].contact_email? contactDetails[index].contact_email : '<EMAIL>' }
                                    </Typography>
                                </Stack>
                                <Stack flexDirection="row">
                                    <Phone
                                        sx={{
                                            color: '#160449',
                                            fontSize: '18px',
                                            paddingRight: '5px',
                                        }}
                                    />
                                    <Typography
                                        sx={{
                                            fontSize: '13px',
                                        }}
                                    >
                                        {/* {selectedData.contact_phone_number} */}
                                        { contactDetails[index].contact_phone_number? formattedPhoneNumber(contactDetails[index].contact_phone_number) : '<PHONE_NUMBER>' }
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Stack>
                        
                        <Stack spacing={3} sx={{ paddingLeft: '15px', paddingTop: '10px', }}>
                            <Stack>
                                <Typography sx={{ fontSize: '13px',fontWeight: theme.typography.primary.fontWeight, }}>{`Category:`}</Typography>
                                
                            </Stack>
                            <Stack>
                                <Typography sx={{ fontSize: '13px',fontWeight: theme.typography.primary.fontWeight, }}>{`Areas of Service:`}</Typography>
                                {JSON.parse(contactDetails[index].contact_business_locations).map((location, index) => (
                                    <Typography key={index} sx={{ fontSize: '13px' }}>{`${location.location} | +- ${location.distance} miles |`}</Typography>
                                ))}
                            </Stack>
                            <Stack>
                                <Typography sx={{ fontSize: '13px',fontWeight: theme.typography.primary.fontWeight, }}>{`Notes:`}</Typography>
                            </Stack>
                        </Stack>
                        <Stack sx={{ padding: '5px' }}>
                            <Stack flexDirection="row" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                    <Stack
                                        flexDirection="row"
                                        alignItems="center"
                                    >
                                        <Box sx={{ padding: '0 10px' }}>
                                            <img
                                                src={require('../../Profile/Images/PaypalIcon.png')}
                                                alt="chase"
                                                style={{
                                                    height: '25px',
                                                }}
                                            />
                                        </Box>
                                        <Stack>
                                            <Typography
                                                sx={{
                                                    fontSize: '12px',
                                                }}
                                            >
                                                {contactDetails[index].contact_paypal? contactDetails[index].contact_paypal :'<PAYPAL>'}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </Box>
                                
                            </Stack>
                            <Stack 
                                flexDirection="row"
                                justifyContent="space-between"
                                alignItems="flex-start"
                            >
                                <Box>
                                    <Stack
                                        flexDirection="row"
                                        alignItems="center"
                                    >
                                        <Box sx={{ padding: '0 10px' }}>
                                            <img
                                                src={require('../../Profile/Images/VenmoIcon.png')}
                                                alt="venmo"
                                                style={{
                                                    height: '25px',
                                                }}
                                            />
                                        </Box>
                                        <Stack>
                                            <Typography
                                                sx={{
                                                    fontSize: '12px',
                                                }}
                                            >
                                                {/* {selectedData.contact_venmo} */}
                                                {contactDetails[index].contact_venmo? contactDetails[index].contact_venmo : '<VENMO>'}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </Box>
                            </Stack>
                            <Stack spacing={3} sx={{ paddingLeft: '15px', paddingTop: '10px', }}>
                                <Stack>
                                    <Typography sx={{ fontSize: '13px',fontWeight: theme.typography.primary.fontWeight, }}>{`Previous Jobs:`}</Typography>
                                    
                                </Stack>
                            </Stack>
                        </Stack>
                    </Paper>
                </Paper>
            </Box>
        </ThemeProvider>
    );
};

export default MaintenanceContactDetails;
