import React, { useState, useCallback, useEffect } from 'react';
import { Grid, Container, Paper, Typography, Button, Stack, Divider, IconButton, Box, Menu, MenuItem, CardMedia, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CircleIcon from '@mui/icons-material/Circle';
import PlaceholderImage from "./MaintenanceIcon.png";
import { List, ListItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import defaultHouseImage from "../Property/defaultHouseImage.png";
import { useUser } from '../../contexts/UserContext'; 
import APIConfig from "../../utils/APIConfig";
import ArrowDropDown from '@mui/icons-material/ArrowDropDown';
import theme from "../../theme/theme";
import { DataGrid } from "@mui/x-data-grid";
import MaintenanceWidget from '../Dashboard-Components/Maintenance/MaintenanceWidget';
import { PropertyListings } from '../Property/PropertyListings';
import PropertyInfo from '../Property/PropertyInfo';
import TenantApplication from '../Applications/TenantApplication';
import TenantApplicationEdit from '../Applications/TenantApplicationEdit';
import TenantLeases from '../Leases/TenantLeases/TenantLeases';
import Payments from '../Payments/Payments';
import AddTenantMaintenanceItem from '../Maintenance/AddTenantMaintenanceItem';
import FlipIcon from './FlipImage.png'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';



const TenantDashboardPM = () => {
    const { user } = useUser(); 
    const { getProfileId } = useUser();
  
    const [propertyListingData, setPropertyListingData] = useState([]);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [leaseDetails, setLeaseDetails] = useState(null);
    const [leaseDetailsData, setLeaseDetailsData] = useState(null);
    const [announcements, setAnnouncements] = useState(null);
    const [maintenanceRequestsNew, setMaintenanceRequestsNew] = useState(null);
    const [maintenanceStatus, setMaintenanceStatus] = useState([]);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [showPaymentHistory, setShowPaymentHistory] = useState(false);

    const [showPropertyListings, setShowPropertyListings] = useState(false); 
    const [rightPane, setRightPane] = useState("");
    const [loading, setLoading] = useState(true);
    const [balanceDetails, setBalanceDetails] = useState([]); 
    const [filteredMaintenanceRequests, setFilteredMaintenanceRequests] = useState([]);
    const [allBalanceDetails, setAllBalanceDetails] = useState([]);

    // const fetchBalanceDetails = async (propertyUid) => {
    //     try {
    //         const response = await fetch(`${APIConfig.baseURL.dev}/cashflowRevised/${getProfileId()}`);
    //         const data = await response.json();
            
    //         const balanceBreakdown = data.result.flatMap(item => {
    //             const properties = JSON.parse(item.property);
    //             return properties
    //                 .filter(prop => prop.property_uid === propertyUid) 
    //                 .flatMap(prop => prop.individual_purchase.map(purchase => ({
    //                     purchaseType: item.purchase_type,
    //                     amountDue: parseFloat(purchase.pur_amount_due || 0),
    //                     totalPaid: parseFloat(purchase.total_paid || 0),
    //                     description: purchase.pur_description
    //                 })));
    //         });
    
    //         setBalanceDetails(balanceBreakdown);
    //     } catch (error) {
    //         console.error("Error fetching balance details: ", error);
    //     }
    // };
    
    const fetchData = async () => {
        try {
            setLoading(true); // Set loading to true before fetching data
            const profileId = getProfileId();
            if (!profileId) return;

            const dashboardResponse = await fetch(`${APIConfig.baseURL.dev}/dashboard/${profileId}`);
            const dashboardData = await dashboardResponse.json();

            console.log("Dashboard data", dashboardData);

            if (dashboardData) {
                console.log("Dashboard inside check", dashboardData);
                setPropertyListingData(dashboardData.property?.result);
                setLeaseDetailsData(dashboardData.leaseDetails?.result);
                setMaintenanceRequestsNew(dashboardData.maintenanceRequestsNew?.result);
                setMaintenanceStatus(dashboardData.maintenanceStatus?.result);
                setAnnouncements(dashboardData.announcements?.result); 

                // Set first property as selected, if available
                // const firstProperty = dashboardData.property?.result[0];
                // console.log("property", firstProperty.property_uid);
                // if (firstProperty) {
                //     setSelectedProperty(firstProperty.property_uid);
                //     handleSelectProperty(firstProperty.property_uid);
                // }
                const allBalanceDetails = dashboardData.tenantPayments?.result.map(payment => ({
                    purchase_uid: payment.purchase_uid,
                    propertyUid: payment.pur_property_id,
                    purchaseType: payment.purchase_type,
                    amountDue: parseFloat(payment.pur_amount_due || 0),
                    totalPaid: parseFloat(payment.total_paid || 0),
                    description: payment.pur_description || 'N/A',
                    purchaseStatus: payment.purchase_status,
                    purchaseDate: payment.pur_due_date,
                }));
    
                // Save all balance details to state
                setAllBalanceDetails(allBalanceDetails);
            }
        } catch (error) {
            console.error("Error fetching data: ", error);
        } finally {
            setLoading(false); 
        }
    };

    useEffect(() => {
        fetchData();
    }, [getProfileId]);

    useEffect(() => {
        if (propertyListingData.length > 0 && !selectedProperty) {
            const firstProperty = propertyListingData[0];
            setSelectedProperty(firstProperty);
            handleSelectProperty(firstProperty);
        }
    }, [propertyListingData]);

    const handleSelectProperty = (property) => {
        setSelectedProperty(property); 
        updateLeaseDetails(property.property_uid);
        // fetchPaymentHistory(property.property_uid);
        // fetchBalanceDetails(property.property_uid);

        const filteredBalanceDetails = allBalanceDetails.filter(
            (detail) => detail.propertyUid === property.property_uid && detail.purchaseStatus === 'UNPAID'
        );
        setBalanceDetails(filteredBalanceDetails);

        const filteredRequests = maintenanceRequestsNew.filter(
            (request) => request.lease_property_id === property.property_uid
        );
        setFilteredMaintenanceRequests(filteredRequests);
    };

    const updateLeaseDetails = (propertyUid) => {
        const leaseForProperty = leaseDetailsData.find(ld => ld.property_uid === propertyUid);
        setLeaseDetails(leaseForProperty);

        if (leaseForProperty?.lease_status === "NEW") {
            setRightPane({type: "tenantApplication", state: {
                data: leaseForProperty,
                status: leaseForProperty.lease_status,
                lease: leaseForProperty,
                from: "accwidget",
            }});
        }
        else if (leaseForProperty?.lease_status === "PROCESSING") {
            setRightPane({type: "tenantLeases", state: {
                data: leaseForProperty,
                status: leaseForProperty.lease_status,
                lease: leaseForProperty,
                from: "accwidget",
            }});
        }
        else {
            setRightPane("");
        }
    };
    
    // Fetch payment history for a specific property
    // const fetchPaymentHistory = async (propertyId) => {
    //     try {
    //         const paymentsResponse = await fetch(`${APIConfig.baseURL.dev}/paymentStatus/${getProfileId()}`);
    //         const paymentsData = await paymentsResponse.json();
          
    //         // Filter payments based on the selected property's property_uid
    //         const paymentsReceivedData = paymentsData?.MoneyPaid?.result?.filter(payment => payment.pur_property_id === propertyId) || [];
    //         setPaymentHistory(paymentsReceivedData);

    //         //setRightPane({type: 'paymentHistory', state: {data: paymentsReceivedData}});
    //     } catch (error) {
    //         console.error("Error fetching payment history: ", error);
    //     }
    // };

    const handlePaymentHistoryNavigate = () => {
        const paymentHistoryForProperty = allBalanceDetails.filter(
            (detail) => detail.propertyUid === selectedProperty.property_uid
        );
        console.log("testing", paymentHistoryForProperty);
        setRightPane({ type: 'paymentHistory', state: { data: paymentHistoryForProperty } });
    };

    const handleMaintenanceLegendClick = () => {
        setRightPane({
            type: 'propertyMaintenanceRequests',
            state: { data: maintenanceStatus, propertyId: selectedProperty?.property_uid }
        });
    };

    const handleBack = () => {
        setRightPane("");
    };

    const renderRightPane = () => {
        if (rightPane?.type) {
            switch (rightPane.type) {
                case "paymentHistory":
                    return <TenantPaymentHistoryTable data={rightPane.state.data} onBack={handleBack} />;
                case "listings":
                    return <PropertyListings setRightPane={setRightPane} />;
                case "propertyInfo":
                    return <PropertyInfo {...rightPane.state} setRightPane={setRightPane} />;
                case "tenantApplication":
                    return <TenantApplication {...rightPane.state} setRightPane={setRightPane} />;
                case "tenantApplicationEdit":
                    return <TenantApplicationEdit {...rightPane.state} setRightPane={setRightPane} />;
                case "tenantLeases":
                    return <TenantLeases {...rightPane.state} setRightPane={setRightPane} />;
                case "payment":
                    return <Payments {...rightPane.state} setRightPane={setRightPane} />;
                case "propertyMaintenanceRequests":
                    return (
                    <PropertyMaintenanceRequests
                        maintenanceStatus={rightPane.state.data}
                        propertyId={rightPane.state.propertyId}
                        onBack={handleBack}
                    />
                );
                case "addtenantmaintenance":
                    return <AddTenantMaintenanceItem {...rightPane.state} setRightPane={setRightPane}/>;
                default:
                    return null;
            }
        }
        return null;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }
    
    return (
        <Box sx={{ backgroundColor: '#fff', minHeight: '100vh', paddingY: 5 }}>
            <Container maxWidth="lg">
                <Grid container spacing={3} sx={{height: '100vh'}}>
                    {/* Top Section: Welcome Message and Search Icon */}
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px' }}>
                        <Typography variant="h4">{`Welcome, ${user.first_name}`}</Typography>
                        <Button
                            variant='contained'
                            sx={{
                                backgroundColor: "#97A7CF",
                                color: theme.typography.secondary.white,
                                textTransform: "none",
                                whiteSpace: "nowrap",
                            }}
                            onClick={() => setRightPane({ type: "listings" })}
                        >
                            <SearchIcon />
                            {"Search Property"}
                        </Button>
                    </Grid>
    
                    <Grid container spacing={3} sx={{ height: 'calc(100vh - 100px)' }}>
                        {/* Left-hand side: Account Balance */}
                        <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', height: '95%' }}>
                            <TenantAccountBalance
                            propertyData={propertyListingData}
                            selectedProperty={selectedProperty}
                            setSelectedProperty={handleSelectProperty}
                            leaseDetails={leaseDetails}
                            leaseDetailsData={leaseDetailsData}
                            onPaymentHistoryNavigate={handlePaymentHistoryNavigate}
                            setRightPane={setRightPane}
                            balanceDetails={balanceDetails}
                            sx={{ flex: 1 }} // Ensures this grows to match the height of the right-hand side
                            />
                        </Grid>

                        {/* Right-hand side */}
                        <Grid item xs={12} md={8}>
                            {/* Top section: Announcements */}
                            <Grid item xs={12}>
                            <Announcements announcements={announcements}/>
                            </Grid>

                            {/* Bottom section containing Lease, Maintenance, and Management Details */}
                            <Grid container spacing={3} sx={{ marginTop: '20px', flex: 1 }}>
                            {rightPane?.type ? (
                                /* Render the rightPane component if available */
                                <Grid item xs={12} sx={{ height: '100%' }}>
                                {renderRightPane()}
                                </Grid>
                            ) : (
                                <>
                                {/* Lease Details: Aligns with Account Balance */}
                                <Grid item xs={12} md={6}>
                                    <LeaseDetails leaseDetails={leaseDetails} sx={{ flex: 1 }} />
                                </Grid>

                                {/* Maintenance and Management Details: Match height with Lease Details */}
                                <Grid item xs={12} md={6}>
                                    <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <MaintenanceDetails
                                        maintenanceRequests={filteredMaintenanceRequests}
                                        selectedProperty={selectedProperty}
                                        leaseDetails={leaseDetails}
                                        onPropertyClick={handleMaintenanceLegendClick}
                                        setRightPane={setRightPane}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sx={{ marginTop: '10px'}}>
                                        <ManagementDetails leaseDetails={leaseDetails} />
                                    </Grid>
                                    </Grid>
                                </Grid>
                                </>
                            )}
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}    
  
const TenantAccountBalance = ({ propertyData, selectedProperty, setSelectedProperty, leaseDetails, leaseDetailsData, balanceDetails, onPaymentHistoryNavigate, setRightPane }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const balanceDue = parseFloat(selectedProperty?.balance || 0);

    const handleOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const returnLeaseStatusColor = (status) => {
        const statusColorMapping = {
            ACTIVE: '#3D5CAC',
            REFUSED: '#FF8832',
            WITHDRAWN: '#FF8832',
            NEW: '#FAD102',
            PROCESSING: '#76B148',
            APPROVED: '#FAD102',
            REJECTED: '#FA0202',
            ENDED: '#000000',
            RESCIND: '#FF8832',
        };
        return status ? statusColorMapping[status] : '#ddd';
    };

    const handleViewTenantApplication = () => {
        setRightPane({
            type: "tenantApplication",
            state: {
                data: leaseDetails,
                lease: leaseDetails,
                status: leaseDetails?.lease_status,
            },
        });
    };

    const handleMakePayment = () => {
        console.log("selectedProperty in handlemakepayment", selectedProperty);
        setRightPane({
            type: "payment",
            state: {
                data: selectedProperty,
            },
        });
    };

    const getButtonColor = () => {
        if (leaseDetails?.lease_status === 'NEW') return '#FAD102'; // Green for NEW
        if (leaseDetails?.lease_status === 'PROCESSING') return '#76B148'; // Yellow for PROCESSING
        return balanceDue > 0 ? '#A52A2A' : '#3D5CAC'; // Red for balance due, default for no balance
    };

    return (
        <Paper sx={{ padding: '20px', flex: 1, backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#160449' }}>
                    Account Balance
                </Typography>

                {/* Property Image */}
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                    <CardMedia
                        component="img"
                        image={selectedProperty?.property_favorite_image || defaultHouseImage}
                        alt="property image"
                        sx={{ width: '100%', height: 'auto', maxHeight: '150px' }}
                    />
                </Box>

                {/* Property Address */}
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
                    <CircleIcon
                        sx={{
                            color: returnLeaseStatusColor(leaseDetails?.lease_status),
                            marginRight: '8px',
                            fontSize: '16px',
                        }}
                    />
                    <Typography sx={{ fontSize: '22px', fontWeight: '600', color: '#3D5CAC' }}>
                        {`${selectedProperty?.property_address}`} 
                        <KeyboardArrowDownIcon onClick={handleOpen} />
                    </Typography>
                    <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                        {propertyData?.map((property) => {
                            const propertyLease = leaseDetailsData.find(ld => ld.property_uid === property.property_uid);
                            const propertyStatusColor = returnLeaseStatusColor(propertyLease?.lease_status);

                            return (
                                <MenuItem
                                    key={property.property_uid}
                                    onClick={() => setSelectedProperty(property)}
                                    sx={{ display: 'flex', alignItems: 'center' }}
                                >
                                    <CircleIcon
                                        sx={{
                                            color: propertyStatusColor,
                                            marginRight: '8px',
                                            fontSize: '16px',
                                        }}
                                    />
                                    {`${property.property_address} ${property.property_unit}`}
                                </MenuItem>
                            );
                        })}
                    </Menu>
                </Box>

                {/* Total Balance */}
                <Typography
                    variant="h4"
                    sx={{
                        color: balanceDue > 0 ? '#A52A2A' : '#3D5CAC',
                        fontWeight: 'bold',
                        marginTop: '10px',
                    }}
                >
                    ${balanceDue.toFixed(2)}
                </Typography>

                <Typography>
                    {`${selectedProperty?.property_uid}`}
                </Typography>

                {/* Payment or Application Button */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px' }}>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: getButtonColor(), // Dynamically set button color
                            color: '#fff',
                            fontWeight: 'bold',
                        }}
                        onClick={
                            leaseDetails?.lease_status === 'NEW' || leaseDetails?.lease_status === 'PROCESSING'
                                ? handleViewTenantApplication
                                : handleMakePayment
                        }
                    >
                        {leaseDetails?.lease_status === 'NEW'
                            ? `Applied ${leaseDetails?.lease_application_date}`
                            : leaseDetails?.lease_status === 'PROCESSING'
                            ? `Approved ${leaseDetails?.lease_application_date}`
                            : balanceDue > 0
                            ? 'Make a Payment'
                            : 'No Payment Due'}
                    </Button>
                </Box>

                {/* Payment Details and Management Details for NEW or PROCESSING status */}
                {(leaseDetails?.lease_status === 'NEW' || leaseDetails?.lease_status === 'PROCESSING') && (
                    <Box sx={{ padding: '20px'}}>
                        <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: '#160449' }}>
                            Payment Details
                        </Typography>
                        <Grid container spacing={1}>
                            <Grid item xs={6}>
                                <Typography>Rent:</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography align="right">${leaseDetails?.property_listed_rent || 'N/A'}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography>Deposit:</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography align="right">${leaseDetails?.property_deposit || 'N/A'}</Typography>
                            </Grid>
                        </Grid>

                        {/* Management Details */}
                        <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: '#160449', marginTop: '20px' }}>
                            Management Details
                        </Typography>
                        <Grid container spacing={1}>
                            <Grid item xs={6}>
                                <Typography>Name:</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography align="right">{leaseDetails?.business_name || 'N/A'}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography>Email:</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography align="right">{leaseDetails?.business_email || 'N/A'}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography>Phone:</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography align="right">{leaseDetails?.business_phone_number || 'N/A'}</Typography>
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {/* Balance Details */}
                {balanceDue > 0 && !(leaseDetails?.lease_status === 'NEW' || leaseDetails?.lease_status === 'PROCESSING') && (
                <Box sx={{ padding: '10px', height: '250px', overflowY: 'auto' }}>
                    <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: '#160449' }}>
                    Balance Details
                    </Typography>
                    <Table sx={{ '& .MuiTableCell-root': { padding: '10px' } }}>
                    <TableHead>
                        <TableRow>
                        <TableCell sx={{ padding: '4px' }}>Type</TableCell>
                        <TableCell align="right" sx={{ padding: '4px' }}>Amount</TableCell>
                        <TableCell sx={{ padding: '4px' }}>Description</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {balanceDetails.map((detail, index) => (
                        <TableRow key={index}>
                            <TableCell sx={{ padding: '4px' }}>{detail.purchaseType}</TableCell>
                            <TableCell align="right" sx={{ padding: '4px' }}>
                            ${detail.amountDue.toFixed(2)}
                            </TableCell>
                            <TableCell sx={{ padding: '4px' }}>{detail.description}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </Box>
                )}


                {leaseDetails?.lease_status === 'PROCESSING' && (
                        <Button
                        variant="contained"
                        sx={{
                            marginTop: '10px',
                            backgroundColor: '#FFC319', 
                            color: '#fff', 
                            fontWeight: 'bold',
                            borderRadius: '5px', 
                            padding: '8px 16px', 
                            minWidth: '120px', 
                            boxShadow: 'none', 
                            textTransform: 'none', 
                            fontSize: '13px', 
                            '&:hover': {
                                backgroundColor: '#3D5CAC', 
                            },
                        }}
                            onClick={handleViewTenantApplication}
                        >
                            VIEW APPLICATION
                        </Button>
                )}

                {/* Payment History Button */}
                {leaseDetails?.lease_status === "ACTIVE" && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                        <Button
                            variant="outlined"
                            sx={{
                                marginTop: '10px',
                                backgroundColor: '#3D5CAC', 
                                color: '#fff', 
                                fontWeight: 'bold',
                                borderRadius: '5px', 
                                padding: '8px 16px', 
                                minWidth: '120px', 
                                boxShadow: 'none', 
                                textTransform: 'none', 
                                fontSize: '13px', 
                                '&:hover': {
                                    backgroundColor: '#4B6DB8', 
                                },
                            }}
                            onClick={onPaymentHistoryNavigate}
                        >
                            VIEW PAYMENT HISTORY
                        </Button>
                    </Box>
                )}
            </Box>
        </Paper>
    );
};


function TenantPaymentHistoryTable({ data, onBack }) {
    console.log("data tenantpaymenthistorytable", data);
    const columns = [
        {
            field: "description",
            headerName: "Description",
            flex: 2,
            renderCell: (params) => (
                <Box sx={{ fontWeight: "bold" }}>
                    {params.value || '-'}
                </Box>
            ),
        },
        {
            field: "purchaseType",
            headerName: "Type",
            flex: 1,
            renderCell: (params) => (
                <Box sx={{ fontWeight: "bold" }}>
                    {params.value || '-'}
                </Box>
            ),
        },
        {
            field: "purchaseStatus",
            headerName: "Status",
            flex: 1,
            renderCell: (params) => (
                <Box
                    sx={{
                        backgroundColor: params.value === "PAID" ? "#76B148" : "#A52A2A",
                        textTransform: "none",
                        fontWeight: "bold",
                        width: "100px",
                        height: "20px",
                        borderRadius: "4px",
                        alignItems: "center",
                        textAlign: "center",
                        color: "#FFFFFF",
                    }}
                >
                    {params.value || '-'}
                </Box>
            ),
        },
        {
            field: "purchaseDate",
            headerName: "Date",
            flex: 1,
            renderCell: (params) => (
                <Box sx={{ fontWeight: "bold" }}>
                    {params.value || '-'}
                </Box>
            ),
        },
        {
            field: "amountDue",
            headerName: "Amount",
            flex: 1,
            renderCell: (params) => (
                <Box
                    sx={{
                        fontWeight: "bold",
                        width: "100%",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "flex-end",
                    }}
                >
                    ${params.value ? parseFloat(params.value).toFixed(2) : "0.00"}
                </Box>
            ),
        },
    ];

    return (
        <Paper
            sx={{
                padding: '20px',
                backgroundColor: '#f0f0f0', // Grey background to match other components
                borderRadius: '12px',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                margin: '20px 0',
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' }}>
                {/* Back Button */}
                <Button
                    variant="outlined"
                    onClick={onBack}
                    sx={{ color: '#3D5CAC', borderColor: '#3D5CAC', fontWeight: 'bold' }}
                >
                    Back
                </Button>
            </Box>

            {/* Payment History Table */}
            {data && data.length > 0 ? (
                <DataGrid
                    rows={data}
                    columns={columns}
                    pageSizeOptions={[5, 10, 25, 100]}
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: 5 },
                        },
                    }}
                    getRowId={(row) => row.purchase_uid} // Use purchase_uid as the unique identifier
                    sx={{
                        backgroundColor: '#f0f0f0', // Ensure consistent grey background within the DataGrid
                    }}
                />
            ) : (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "200px" }}>
                    <Typography sx={{ fontSize: "16px" }}>No Payment History Available</Typography>
                </Box>
            )}
        </Paper>
    );
}




const Announcements = ({ announcements }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
  
    // Handle previous announcement
    const handlePrev = () => {
      setCurrentIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : announcements.length - 1
      );
    };
  
    // Handle next announcement
    const handleNext = () => {
      setCurrentIndex((prevIndex) =>
        prevIndex < announcements.length - 1 ? prevIndex + 1 : 0
      );
    };
  
    // Check if there are announcements
    const hasAnnouncements = announcements && announcements.length > 0;
  
    return (
      <Paper
        sx={{
          padding: '10px',
          backgroundColor: '#f0f0f0',
          borderRadius: '8px',
          flex: 1,
          position: 'relative',
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ marginBottom: '10px' }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#160449' }}>
            Announcements
          </Typography>
          <Button sx={{ color: '#3D5CAC', fontSize: '14px' }}>
            View All [{announcements?.length || 0}]
          </Button>
        </Stack>
  
        {hasAnnouncements ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              paddingX: 2,
            }}
          >
            {/* Left Arrow */}
            <IconButton
              onClick={handlePrev}
              sx={{ position: 'absolute', left: 0, zIndex: 1 }}
            >
              <ArrowBackIosNewIcon sx={{ color: '#3D5CAC' }} />
            </IconButton>
  
            {/* Announcement Card */}
            <Paper
              sx={{
                padding: '20px',
                flex: 1,
                marginX: 4,
                borderRadius: '8px',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                textAlign: 'center',
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ color: '#160449', fontWeight: 'bold' }}
              >
                {announcements[currentIndex]?.announcement_title}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: '#666', marginTop: 1, textAlign: 'left' }}
              >
                {announcements[currentIndex]?.announcement_msg || 'No additional details available.'}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: '#999', marginTop: 1, textAlign: 'left' }}
              >
                {new Date(announcements[currentIndex]?.announcement_date).toLocaleString()}
              </Typography>
            </Paper>
  
            {/* Right Arrow */}
            <IconButton
              onClick={handleNext}
              sx={{ position: 'absolute', right: 0, zIndex: 1 }}
            >
              <ArrowForwardIosIcon sx={{ color: '#3D5CAC' }} />
            </IconButton>
          </Box>
        ) : (
          <Typography sx={{ marginTop: '10px', color: '#333' }}>
            No announcements available at the moment.
          </Typography>
        )}
      </Paper>
    );
  };

const LeaseDetails = ({ leaseDetails }) => {
    console.log("Lease Details", leaseDetails);
    const [isFlipped, setIsFlipped] = useState(false);

    const handleFlip = () => {
      setIsFlipped(!isFlipped);
    };
    
    return (
        <Paper
          elevation={3}
          sx={{
            padding: '20px',
            backgroundColor: '#f0f0f0',
            height: '93%',
            position: 'relative',
            borderRadius: '7px',
            // transition: 'transform 0.6s',
            // transformStyle: 'preserve-3d',
            // position: 'relative',
            // transform: isFlipped ? 'rotateY(180deg)':'rotateY(0deg)',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#160449' }}>
            {isFlipped ? 'Property Details' : 'Lease Details'}
          </Typography>
    
          <Stack spacing={2} sx={{ marginTop: '10px' }}>
            {isFlipped ? (
              <>
                {/* Property Codes Section */}
                <Stack spacing={2} sx={{ marginBottom: '15px' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#3D5CAC' }}>
                    Property Codes
                    </Typography>
                    <Stack direction="row" justifyContent="space-between">
                    <Typography>Property Description:</Typography>
                    <Typography>{leaseDetails?.property_description || 'N/A'}</Typography>
                    </Stack>
                </Stack>

                <Divider />

                {/* Property Amenities Section */}
                <Stack spacing={2} sx={{ marginY: '15px' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#3D5CAC' }}>
                    Property Amenities
                    </Typography>
                    <Stack direction="row" justifyContent="space-between">
                    <Typography>Community Amenities:</Typography>
                    <Typography>{leaseDetails?.property_amenities_community || 'N/A'}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                    <Typography>Nearby Amenities:</Typography>
                    <Typography>{leaseDetails?.property_amenities_nearby || 'N/A'}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                    <Typography>Unit Amenities:</Typography>
                    <Typography>{leaseDetails?.property_amenities_unit || 'N/A'}</Typography>
                    </Stack>
                </Stack>

                <Divider />
                <Stack spacing={2} sx={{ marginTop: '15px' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#3D5CAC' }}>
                Other Details
                </Typography>
                <Stack direction="row" justifyContent="space-between">
                <Typography>Lease Renew:</Typography>
                <Typography>{leaseDetails?.lease_end || 'N/A'}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                <Typography>Notice Period:</Typography>
                <Typography>{leaseDetails?.lease_end_notice_period || 'N/A'}</Typography>
                </Stack>
            </Stack>
              </>
            ) : (
              <>
                {/* Lease Details */}
                <Stack spacing={2} sx={{ marginBottom: '15px' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#3D5CAC' }}>
                    Rent Details
                    </Typography>
                    <Stack direction="row" justifyContent="space-between">
                        <Typography>Rent:</Typography>
                        <Typography>${leaseDetails?.property_listed_rent || 'N/A'}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                        <Typography>Start Date:</Typography>
                        <Typography>{leaseDetails?.lease_start || 'N/A'}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                        <Typography>End Date:</Typography>
                        <Typography>{leaseDetails?.lease_end || 'N/A'}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                        <Typography>Lease Status:</Typography>
                        <Typography>{leaseDetails?.lease_status || 'N/A'}</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                        <Typography>Deposit:</Typography>
                        <Typography>${leaseDetails?.property_deposit || 'N/A'}</Typography>
                        </Stack>
                    </Stack>
              </>
            )}
          </Stack>
    
          {/* Flip Icon as Toggle Button */}
          <IconButton
            onClick={handleFlip}
            sx={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              padding: 0,
            }}
          >
            <img
              src={FlipIcon}
              alt="Flip Icon"
              style={{ width: '30px', height: '30px' }}
            />
          </IconButton>
        </Paper>
      );
};

const MaintenanceDetails = ({ maintenanceRequests, onPropertyClick, selectedProperty, leaseDetails, setRightPane }) => {
    console.log("Maintenance Requests:", maintenanceRequests);
    const maintenanceStatusCounts = {
        "New Requests": maintenanceRequests
            ?.filter(item => item.maintenance_status.trim().toUpperCase() === "NEW REQUEST")
            .reduce((sum, item) => sum + (item.num || 0), 0), // Sum `num` values
        "Info Requested": maintenanceRequests
            ?.filter(item => item.maintenance_status.trim().toUpperCase() === "INFO REQUESTED")
            .reduce((sum, item) => sum + (item.num || 0), 0),
        "Processing": maintenanceRequests
            ?.filter(item => item.maintenance_status.trim().toUpperCase() === "PROCESSING")
            .reduce((sum, item) => sum + (item.num || 0), 0),
        "Scheduled": maintenanceRequests
            ?.filter(item => item.maintenance_status.trim().toUpperCase() === "SCHEDULED")
            .reduce((sum, item) => sum + (item.num || 0), 0),
        "Completed": maintenanceRequests
            ?.filter(item => item.maintenance_status.trim().toUpperCase() === "COMPLETED")
            .reduce((sum, item) => sum + (item.num || 0), 0),
        "Cancelled": maintenanceRequests
            ?.filter(item => item.maintenance_status.trim().toUpperCase() === "CANCELLED")
            .reduce((sum, item) => sum + (item.num || 0), 0),
    };

    // Define colors for each status
    const statusColors = {
        "New Requests": '#B62C2A',
        "Info Requested": '#D4736D',
        "Processing": '#DEA19C',
        "Scheduled": '#92A9CB',
        "Completed": '#6788B3',
        "Cancelled": '#3D5CAC',
    };

    const handleAddMaintenanceClick = () => {
        setRightPane({
          type: 'addtenantmaintenance',
          state: {
            newTenantMaintenanceState: {
            propertyData: selectedProperty,
            leaseData: leaseDetails,
            },
          },
        });
      };

    console.log("selected property", selectedProperty, leaseDetails);

    return (
        <Paper 
            elevation={3} 
            sx={{ 
                padding: '20px', 
                backgroundColor: '#f0f0f0', 
                borderRadius: '12px', 
                fontFamily: 'Source Sans Pro',
                maxWidth: '400px',
                margin: 'auto'
            }}
        >
            {/* Header with Title and Add Button */}
            <Grid container alignItems="center" justifyContent="space-between" mb={2}>
                <Grid item xs={10} sx={{ textAlign: 'center' }}>
                <Typography
                    variant="h6"
                    sx={{ fontWeight: 'bold', color: '#160449', fontSize: '20px' }}
                >
                    Maintenance
                </Typography>
                </Grid>
                <Grid item xs={2} sx={{ textAlign: 'right' }}>
                <IconButton
                    aria-label="add"
                    sx={{ color: '#3D5CAC' }}
                    onClick={handleAddMaintenanceClick}
                >
                    <AddIcon />
                </IconButton>
                </Grid>
            </Grid>

            {/* Legend: Display all statuses even if counts are zero */}
            <Grid item xs={12}>
                <List sx={{ padding: '0', margin: '0', borderRadius: '10px' }}>
                    {Object.entries(maintenanceStatusCounts).map(([status, count], index) => (
                        <ListItem
                            key={status}
                            sx={{
                                backgroundColor: statusColors[status],
                                color: '#FFFFFF',
                                fontFamily: 'Source Sans Pro',
                                fontSize: '14px',
                                fontWeight: 600,
                                padding: '10px 10px',
                                borderTopLeftRadius: index === 0 ? '10px' : '0',
                                borderTopRightRadius: index === 0 ? '10px' : '0',
                                borderBottomLeftRadius: index === Object.keys(maintenanceStatusCounts).length - 1 ? '10px' : '0',
                                borderBottomRightRadius: index === Object.keys(maintenanceStatusCounts).length - 1 ? '10px' : '0',
                                marginTop: '0',
                                marginBottom: '0',
                            }}
                            onClick={onPropertyClick}
                        >
                            <Grid container justifyContent='space-between' alignItems='center'>
                                <Grid item>{status}</Grid>
                                <Grid item>
                                    <Typography variant='body2' align='right'>
                                        {count}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </ListItem>
                    ))}
                </List>
            </Grid>
        </Paper>
    );
};

const ManagementDetails = ({ leaseDetails }) => {
    const { business_name, business_email, business_phone_number } = leaseDetails || {};
  
    return (
      <Paper 
        elevation={3} 
        sx={{ 
          padding: '24px', 
          backgroundColor: '#f0f0f0', 
          margin: 'auto'
        }}>
          
        {/* Title */}
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#160449', marginBottom: '20px', fontSize: '20px', textAlign: 'center' }}>
          Management Details
        </Typography>
        
        {/* Business Details */}
        <Stack spacing={2} sx={{ marginTop: '10px' }}>
          <Stack direction="row" justifyContent="space-between">
            <Typography>Name:</Typography>
            <Typography>{business_name || 'N/A'}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography>Email:</Typography>
            <Typography>{business_email || 'N/A'}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography>Phone:</Typography>
            <Typography>{business_phone_number || 'N/A'}</Typography>
          </Stack>
        </Stack>
      </Paper>
    );
};

const PropertyMaintenanceRequests = ({ maintenanceStatus, propertyId, onBack }) => {
    const filteredRequests = maintenanceStatus.filter(
      (request) => request.maintenance_property_id === propertyId
    );

  function formatTime(time) {
    if (!time || !time.includes(':')) return '-';
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  function getValidDate(date) {
    if (!date || !date.includes('-')) {
      return '-';
    }
    return date;
  }


  const getColorForStatus = (status) => {
    switch (status) {
      case 'NEW':
        return '#B62C2A';
      case 'INFO REQUESTED':
        return '#D4736D';
      case 'PROCESSING':
        return '#DEA19C';
      case 'SCHEDULED':
        return '#99CCFF';
      case 'COMPLETED':
        return '#6699FF';
      case 'CANCELLED':
        return '#0000FF';
      default:
        return '#000000';
    }
  };

  const getColorForPriority = (priority) => {
    switch (priority) {
      case 'Low':
        return '#FFFF00'; // Yellow
      case 'Medium':
        return '#FFA500'; // Orange
      case 'High':
        return '#FF0000'; // Red
      default:
        return '#FFFFFF'; // Default
    }
  };

  const columns = [
    {
      field: 'maintenance_title',
      headerName: 'Title',
      flex: 1,
      renderCell: (params) => (
        <Box
          sx={{
            fontWeight: 'bold',
            background: getColorForPriority(params.row.maintenance_priority),
            padding: '5px',
            color: '#000000',
            borderRadius: '4px',
          }}
        >
          {params.value}
        </Box>
      ),
      headerAlign: 'left', 
    },
    {
      field: 'maintenance_request_created_date',
      headerName: 'Created Date',
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ width: '100%', fontWeight: 'bold', textAlign: 'center' }}>
          {params.value ? getValidDate(params.value) : '-'}
        </Box>
      ),
      headerAlign: 'center',
    },
    {
        field: "maintenance_favorite_image",
        headerName: "Images",
        flex: 0.5,
        renderCell: (params) => {
          const imageUrl = params.value ? params.value : PlaceholderImage;
          return <img src={imageUrl} alt='Maintenance' style={{ width: "60px", height: "55px" }} />;
        },
        headerAlign: "center",
      },
    {
      field: 'scheduledDateTime',
      headerName: 'Scheduled Date & Time',
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ width: '100%', fontWeight: 'bold', textAlign: 'center' }}>
          {params.row.maintenance_scheduled_date
            ? `${getValidDate(params.row.maintenance_scheduled_date)} ${formatTime(params.row.maintenance_scheduled_time)}`
            : '-'}
        </Box>
      ),
      headerAlign: 'center',
    },
  ];
  
    return (
      <Paper
        elevation={3}
        sx={{
          padding: '20px',
          backgroundColor: '#f0f0f0',
          borderRadius: '12px',
          width: '95%', 
          margin: 'auto',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Maintenance Requests for Property {propertyId}
          </Typography>
          <Button variant="outlined" onClick={onBack}>
            Back
          </Button>
        </Stack>
        <Paper elevation={3} sx={{ padding: 2 }}>
          {filteredRequests.length > 0 ? (
            <DataGrid
              rows={filteredRequests}
              columns={columns}
              pageSize={5}
              getRowId={(row) => row.maintenance_request_uid}
              autoHeight
            />
          ) : (
            <Typography>No Maintenance Requests Available for this Property</Typography>
          )}
        </Paper>
      </Paper>
    );
};

export default TenantDashboardPM;
