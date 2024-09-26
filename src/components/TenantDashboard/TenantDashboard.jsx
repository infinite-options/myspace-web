import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { Accordion, AccordionSummary, AccordionDetails, Collapse, ThemeProvider, Grid, Container, Paper, Typography, Button, Stack, Divider, IconButton, Box, Menu, MenuItem, CardMedia, Backdrop, CircularProgress, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { alpha, makeStyles } from "@material-ui/core/styles";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CircleIcon from '@mui/icons-material/Circle';
import PlaceholderImage from "./MaintenanceIcon.png";
import { List, ListItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Table, TableHead, TableBody, TableRow, TableCell, TableContainer } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import defaultHouseImage from "../Property/defaultHouseImage.png";
import { useUser } from '../../contexts/UserContext'; 
import APIConfig from "../../utils/APIConfig";
import ArrowDropDown from '@mui/icons-material/ArrowDropDown';
import theme from "../../theme/theme";
import { DataGrid, GridRow } from "@mui/x-data-grid";
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
import Announcements from "../Announcement/Announcements";
import EditMaintenanceItem from "../Maintenance/EditMaintenanceItem";
import EditIcon from '@mui/icons-material/Edit';
import TenantMaintenanceItemDetail from '../Maintenance/TenantMaintenanceItemDetail';
import TenantAccountBalance from '../Payments/TenantAccountBalance';

const useStyles = makeStyles((theme) => ({
  input: {
    background: "#000000",
  },
}));

const TenantDashboard = () => {
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
    const [reload, setReload] = useState(false);

    // const fetchCashflowDetails = async () => {
    //     try {
    //         const response = await fetch(`${APIConfig.baseURL.dev}/cashflowTransactions/${getProfileId()}/all`);
    //         const data = await response.json();
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

            // console.log("Dashboard data", dashboardData);

            if (dashboardData) {
                // console.log("Dashboard inside check", dashboardData);
                setPropertyListingData(dashboardData.property?.result);
                setLeaseDetailsData(dashboardData.leaseDetails?.result);
                setMaintenanceRequestsNew(dashboardData.maintenanceRequestsNew?.result);
                setMaintenanceStatus(dashboardData.maintenanceStatus?.result);
                setAnnouncements(dashboardData.announcementsReceived?.result); 

                // Set first property as selected, if available
                // const firstProperty = dashboardData.property?.result[0];
                // console.log("property", firstProperty.property_uid);
                // if (firstProperty) {
                //     setSelectedProperty(firstProperty.property_uid);
                //     handleSelectProperty(firstProperty.property_uid);
                // }
                const allBalanceDetails = dashboardData.tenantTransactions?.result.map(payment => ({ //here
                    purchase_uid: payment.purchase_uid,
                    propertyUid: payment.pur_property_id,
                    purchaseType: payment.purchase_type,
                    dueDate: payment.pur_due_date,
                    amountDue: parseFloat(payment.pur_amount_due || 0),
                    totalPaid: parseFloat(payment.total_paid || 0),
                    description: payment.pur_description || 'N/A',
                    purchaseStatus: payment.purchase_status,
                    purchaseDate: payment.pur_due_date,
                    pur_cf_type: payment.pur_cf_type,
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
        setReload(false);
    }, [reload]);

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
        // fetchCashflowDetails();
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

        if (rightPane?.type === 'paymentHistory') {
          const updatedPaymentHistory = allBalanceDetails.filter(
            (detail) => detail.propertyUid === property.property_uid
          );
          setRightPane({
            type: 'paymentHistory',
            state: { data: updatedPaymentHistory },
          });
        }
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
        // console.log("testing", paymentHistoryForProperty);
        setRightPane({ type: 'paymentHistory', state: { data: paymentHistoryForProperty } });
    };

    const handleMakePayment = () => {
        const paymentHistoryForProperty = allBalanceDetails.filter(
            (detail) => detail.propertyUid === selectedProperty.property_uid
        );

        // console.log("Payment History for Make Payment:", paymentHistoryForProperty);
        setRightPane({
            type: "payment",
            state: {
                data: paymentHistoryForProperty,
            },
        });
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
                    return <TenantPaymentHistoryTable data={rightPane.state.data} setRightPane={setRightPane} onBack={handleBack} />;
                case "listings":
                    return <PropertyListings setRightPane={setRightPane} />;
                case "propertyInfo":
                    return <PropertyInfo {...rightPane.state} setRightPane={setRightPane} />;
                case "tenantApplication":
                    return <TenantApplication {...rightPane.state} setRightPane={setRightPane} setReload={setReload}/>;
                case "tenantApplicationEdit":
                    return <TenantApplicationEdit {...rightPane.state} setRightPane={setRightPane} />;
                case "tenantLeases":
                    return <TenantLeases {...rightPane.state} setRightPane={setRightPane} setReload={setReload}/>;
                case "payment":
                    return <PaymentsPM data={rightPane.state.data} setRightPane={setRightPane} selectedProperty={selectedProperty} leaseDetails={leaseDetails} balanceDetails={balanceDetails}/>;
                case "addtenantmaintenance":
                    return <AddTenantMaintenanceItem {...rightPane.state} setRightPane={setRightPane} setReload={setReload}/>;
                case "propertyMaintenanceRequests":
                    return (
                    <PropertyMaintenanceRequests
                        maintenanceStatus={rightPane.state.data}
                        propertyId={rightPane.state.propertyId}
                        onAdd={handleAddMaintenanceClick}
                        setRightPane={setRightPane}
                        selectedProperty={selectedProperty}
                    />
                );
                case "editmaintenance":
                  return (
                    <EditMaintenanceItem
                      setRightPane={setRightPane}
                      maintenanceRequest={rightPane.state.maintenanceRequest}
                      currentPropertyId={rightPane.state.currentPropertyId}
                      propertyAddress={rightPane.state.propertyAddress}
                    />
                  );
                case "announcements":
                    return <Announcements setRightPane={setRightPane} />;
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
        <Box sx={{ backgroundColor: '#fff', minHeight: '100vh'}}>
            <Container>
                <Grid container spacing={3} sx={{height: '100vh'}}>
                    {/* Top Section: Welcome Message and Search Icon */}
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <Typography
                        sx={{
                          fontSize: { xs: "22px", sm: "28px", md: "32px" },
                          fontWeight: "600",
                        }}
                      >
                        Welcome, {user.first_name}
                      </Typography>
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
    
                    <Grid container spacing={3} sx={{ height: 'calc(100vh - 100px)', alignItems: 'stretch'}}>
                        {/* Left-hand side: Account Balance */}
                        <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column'}}>
                            <TenantAccountBalance
                            propertyData={propertyListingData}
                            selectedProperty={selectedProperty}
                            setSelectedProperty={handleSelectProperty}
                            leaseDetails={leaseDetails}
                            leaseDetailsData={leaseDetailsData}
                            onPaymentHistoryNavigate={handlePaymentHistoryNavigate}
                            setRightPane={setRightPane}
                            balanceDetails={balanceDetails}
                            handleMakePayment={handleMakePayment}
                            sx={{ flex: 1 }} // Ensures this grows to match the height of the right-hand side
                            />
                        </Grid>

                        {/* Right-hand side */}
                        <Grid item xs={12} md={8} x={{ display: 'flex', flexDirection: 'column'}}>
                            {/* Top section: Announcements */}
                            <Grid item xs={12}>
                            <AnnouncementsPM announcements={announcements} setRightPane={setRightPane}/>
                            </Grid>

                            {/* Bottom section containing Lease, Maintenance, and Management Details */}
                            <Grid container spacing={3} sx={{ marginTop: '5px'}}>
                            {rightPane?.type ? (
                                /* Render the rightPane component if available */
                                <Grid item xs={12} sx={{ flex:1}}>
                                {renderRightPane()}
                                </Grid>
                            ) : (
                                <>
                                {/* Lease Details: Aligns with Account Balance */}
                                <Grid item xs={12} md={6} sx={{flex:1}}>
                                    <LeaseDetails leaseDetails={leaseDetails}/>
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
  
// const TenantAccountBalance = ({ propertyData, selectedProperty, setSelectedProperty, leaseDetails, leaseDetailsData, balanceDetails, onPaymentHistoryNavigate, handleMakePayment, setRightPane }) => {
//     const [anchorEl, setAnchorEl] = useState(null);
//     const open = Boolean(anchorEl);
//     const balanceDue = parseFloat(selectedProperty?.balance || 0);
//     // console.log("propertyData", propertyData);
//     // console.log(selectedProperty);

//     const handleOpen = (event) => {
//         setAnchorEl(event.currentTarget);
//     };

//     const handleClose = () => {
//         setAnchorEl(null);
//     };

//     const returnLeaseStatusColor = (status) => {
//         const statusColorMapping = {
//             ACTIVE: '#3D5CAC',
//             REFUSED: '#FF8832',
//             WITHDRAWN: '#FF8832',
//             NEW: '#FAD102',
//             PROCESSING: '#76B148',
//             APPROVED: '#FAD102',
//             REJECTED: '#FA0202',
//             ENDED: '#000000',
//             RESCIND: '#FF8832',
//         };
//         return status ? statusColorMapping[status] : '#ddd';
//     };

//     const handleViewTenantApplication = () => {
//         setRightPane({
//             type: "tenantApplication",
//             state: {
//                 data: leaseDetails,
//                 lease: leaseDetails,
//                 status: leaseDetails?.lease_status,
//             },
//         });
//     };

//     const getButtonColor = () => {
//         if (leaseDetails?.lease_status === 'NEW') return '#FAD102'; // Green for NEW
//         if (leaseDetails?.lease_status === 'PROCESSING') return '#76B148'; // Yellow for PROCESSING
//         return balanceDue > 0 ? '#A52A2A' : '#3D5CAC'; // Red for balance due, default for no balance
//     };

//     return (
//         <Paper sx={{ padding: '30px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
//                 <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#160449' }}>
//                     Account Balance
//                 </Typography>

//                 {/* Property Image */}
//                 <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
//                     <CardMedia
//                         component="img"
//                         image={selectedProperty?.property_favorite_image || defaultHouseImage}
//                         alt="property image"
//                         sx={{ width: '100%', height: 'auto', maxHeight: '150px' }}
//                     />
//                 </Box>

//                 {/* Property Address */}
//                 <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
//                     <CircleIcon
//                         sx={{
//                             color: returnLeaseStatusColor(leaseDetails?.lease_status),
//                             marginRight: '8px',
//                             fontSize: '16px',
//                         }}
//                     />
//                     <Typography sx={{ fontSize: '22px', fontWeight: '600', color: '#3D5CAC' }}>
//                         {`${selectedProperty?.property_address}`} 
//                         <KeyboardArrowDownIcon onClick={handleOpen} />
//                     </Typography>
//                     <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
//                         {propertyData?.map((property) => {
//                             const propertyLease = leaseDetailsData.find(ld => ld.property_uid === property.property_uid);
//                             const propertyStatusColor = returnLeaseStatusColor(propertyLease?.lease_status);

//                             return (
//                                 <MenuItem
//                                     key={property.property_uid}
//                                     onClick={() => setSelectedProperty(property)}
//                                     sx={{ display: 'flex', alignItems: 'center' }}
//                                 >
//                                     <CircleIcon
//                                         sx={{
//                                             color: propertyStatusColor,
//                                             marginRight: '8px',
//                                             fontSize: '16px',
//                                         }}
//                                     />
//                                     {`${property.property_address} ${property.property_unit}`}
//                                 </MenuItem>
//                             );
//                         })}
//                     </Menu>
//                 </Box>

//                 {/* Total Balance */}
//                 <Typography
//                     variant="h4"
//                     sx={{
//                         color: balanceDue > 0 ? '#A52A2A' : '#3D5CAC',
//                         fontWeight: 'bold',
//                         marginTop: '10px',
//                     }}
//                 >
//                     ${balanceDue.toFixed(2)}
//                 </Typography>

//                 <Typography>
//                     {`${selectedProperty?.property_uid}`}
//                 </Typography>

//                 {/* Payment or Application Button */}
//                 <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px' }}>
//                     <Button
//                         variant="contained"
//                         sx={{
//                             backgroundColor: getButtonColor(), // Dynamically set button color
//                             color: '#fff',
//                             fontWeight: 'bold',
//                         }}
//                         onClick={
//                             leaseDetails?.lease_status === 'NEW' || leaseDetails?.lease_status === 'PROCESSING'
//                                 ? handleViewTenantApplication
//                                 : handleMakePayment
//                         }
//                     >
//                         {leaseDetails?.lease_status === 'NEW'
//                             ? `Applied ${leaseDetails?.lease_application_date}`
//                             : leaseDetails?.lease_status === 'PROCESSING'
//                             ? `Approved ${leaseDetails?.lease_application_date}`
//                             : balanceDue > 0
//                             ? 'Make a Payment'
//                             : 'No Payment Due'}
//                     </Button>
//                 </Box>

//                 {/* Payment Details and Management Details for NEW or PROCESSING status */}
//                 {(leaseDetails?.lease_status === 'NEW' || leaseDetails?.lease_status === 'PROCESSING') && (
//                     <Box sx={{ padding: '20px'}}>
//                         <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: '#160449' }}>
//                             Payment Details
//                         </Typography>
//                         <Grid container spacing={1}>
//                             <Grid item xs={6}>
//                                 <Typography>Rent:</Typography>
//                             </Grid>
//                             <Grid item xs={6}>
//                                 <Typography align="right">${leaseDetails?.property_listed_rent || 'N/A'}</Typography>
//                             </Grid>
//                             <Grid item xs={6}>
//                                 <Typography>Deposit:</Typography>
//                             </Grid>
//                             <Grid item xs={6}>
//                                 <Typography align="right">${leaseDetails?.property_deposit || 'N/A'}</Typography>
//                             </Grid>
//                         </Grid>

//                         {/* Management Details */}
//                         <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: '#160449', marginTop: '20px' }}>
//                             Management Details
//                         </Typography>
//                         <Grid container spacing={1}>
//                             <Grid item xs={6}>
//                                 <Typography>Name:</Typography>
//                             </Grid>
//                             <Grid item xs={6}>
//                                 <Typography align="right">{leaseDetails?.business_name || 'N/A'}</Typography>
//                             </Grid>
//                             <Grid item xs={6}>
//                                 <Typography>Email:</Typography>
//                             </Grid>
//                             <Grid item xs={6}>
//                                 <Typography align="right">{leaseDetails?.business_email || 'N/A'}</Typography>
//                             </Grid>
//                             <Grid item xs={6}>
//                                 <Typography>Phone:</Typography>
//                             </Grid>
//                             <Grid item xs={6}>
//                                 <Typography align="right">{leaseDetails?.business_phone_number || 'N/A'}</Typography>
//                             </Grid>
//                         </Grid>
//                     </Box>
//                 )}

//                 {/* Balance Details */}
//                 {balanceDue > 0 && !(leaseDetails?.lease_status === 'NEW' || leaseDetails?.lease_status === 'PROCESSING') && (
//                 <Box sx={{ padding: '10px', height: '250px', overflowY: 'auto' }}>
//                     <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: '#160449' }}>
//                     Balance Details
//                     </Typography>
//                     <Table sx={{ '& .MuiTableCell-root': { padding: '10px' } }}>
//                     <TableHead>
//                         <TableRow>
//                         <TableCell sx={{ padding: '4px' }}>Type</TableCell>
//                         <TableCell align="right" sx={{ padding: '4px' }}>Amount</TableCell>
//                         <TableCell sx={{ padding: '4px' }}>Description</TableCell>
//                         </TableRow>
//                     </TableHead>
//                     <TableBody>
//                         {balanceDetails.map((detail, index) => (
//                         <TableRow key={index}>
//                             <TableCell sx={{ padding: '4px' }}>{detail.purchaseType}</TableCell>
//                             <TableCell align="right" sx={{ padding: '4px' }}>
//                             ${detail.amountDue.toFixed(2)}
//                             </TableCell>
//                             <TableCell sx={{ padding: '4px' }}>{detail.description}</TableCell>
//                         </TableRow>
//                         ))}
//                     </TableBody>
//                     </Table>
//                 </Box>
//                 )}


//                 {leaseDetails?.lease_status === 'PROCESSING' && (
//                         <Button
//                         variant="contained"
//                         sx={{
//                             marginTop: '10px',
//                             backgroundColor: '#FFC319', 
//                             color: '#fff', 
//                             fontWeight: 'bold',
//                             borderRadius: '5px', 
//                             padding: '8px 16px', 
//                             minWidth: '120px', 
//                             boxShadow: 'none', 
//                             textTransform: 'none', 
//                             fontSize: '13px', 
//                             '&:hover': {
//                                 backgroundColor: '#3D5CAC', 
//                             },
//                         }}
//                             onClick={handleViewTenantApplication}
//                         >
//                             VIEW APPLICATION
//                         </Button>
//                 )}

//                 {/* Payment History Button */}
//                 {leaseDetails?.lease_status === "ACTIVE" && (
//                     <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
//                         <Button
//                             variant="outlined"
//                             sx={{
//                                 marginTop: '10px',
//                                 backgroundColor: '#3D5CAC', 
//                                 color: '#fff', 
//                                 fontWeight: 'bold',
//                                 borderRadius: '5px', 
//                                 padding: '8px 16px', 
//                                 minWidth: '120px', 
//                                 boxShadow: 'none', 
//                                 textTransform: 'none', 
//                                 fontSize: '13px', 
//                                 '&:hover': {
//                                     backgroundColor: '#4B6DB8', 
//                                 },
//                             }}
//                             onClick={onPaymentHistoryNavigate}
//                         >
//                             VIEW PAYMENT HISTORY
//                         </Button>
//                     </Box>
//                 )}
//             </Box>
//         </Paper>
//     );
// };

function TenantPaymentHistoryTable({ data, setRightPane, onBack }) {
    // console.log("data tenantpaymenthistorytable", data);
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

const AnnouncementsPM = ({ announcements, setRightPane }) => {
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

    const handleViewAllClick = () => {
      setRightPane({ type: 'announcements', state: { data: announcements } });
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
          <Button 
            sx={{ color: '#3D5CAC', fontSize: '14px'}}
            onClick={handleViewAllClick}
          >
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
                {new Date(announcements[currentIndex]?.announcement_date).toLocaleString()}{" announcement_uid : "}{announcements[currentIndex].announcement_uid}
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
    // console.log("Lease Details", leaseDetails);
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
    // console.log("Maintenance Requests:", maintenanceRequests);
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

    // console.log("selected property", selectedProperty, leaseDetails);

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

const PropertyMaintenanceRequests = ({ maintenanceStatus, selectedProperty, propertyId, onAdd, setRightPane }) => {
  // console.log("maintenancestatus", maintenanceStatus);
  const [expandedRows, setExpandedRows] = useState({});

  const filteredRequests = maintenanceStatus.filter(
    (request) => request.maintenance_property_id === propertyId
  );

  const toggleAccordion = (rowId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  const getColorForPriority = (priority) => {
    switch (priority) {
      case 'Low':
        return '#FFFF00';
      case 'Medium':
        return '#FFA500';
      case 'High':
        return '#FF0000';
      default:
        return '#FFFFFF';
    }
  };

  const handleEditClick = (request) => {
    // Placeholder function - add your logic here
    // console.log("edit clicked", request.maintenance_request_type);
    setRightPane({
      type: "editmaintenance",
      state: {
        maintenanceRequest: request,
        currentPropertyId: propertyId,
        propertyAddress: selectedProperty.property_address,
      }
    })
    // console.log('Edit clicked for:', request);
  };

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
      <Stack direction='row' justifyContent='space-between' alignItems='center' mb={2}>
        <Typography variant='h6'>Maintenance Requests for Property {propertyId}</Typography>
        <Button variant='outlined' onClick={onAdd}>
          +
        </Button>
      </Stack>
      <TableContainer component={Paper}>
        <Table aria-label="maintenance requests table">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell align="center">Created Date</TableCell>
              <TableCell align="center">Images</TableCell>
              <TableCell align="center">Scheduled Date & Time</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRequests.map((request) => (
              <React.Fragment key={request.maintenance_request_uid}>
                <TableRow>
                  <TableCell>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        background: getColorForPriority(request.maintenance_priority),
                        padding: '5px',
                        color: '#000',
                        borderRadius: '4px',
                      }}
                      onClick={() => toggleAccordion(request.maintenance_request_uid)}
                    >
                      {request.maintenance_title}
                    </Box>
                  </TableCell>
                  <TableCell align="center">{request.maintenance_request_created_date || '-'}</TableCell>
                  <TableCell align="center">
                    <img src={request.maintenance_favorite_image || PlaceholderImage} alt='Maintenance' style={{ width: '60px', height: '55px' }} />
                  </TableCell>
                  <TableCell align="center">
                    {request.maintenance_scheduled_date
                      ? `${request.maintenance_scheduled_date} ${request.maintenance_scheduled_time || '--'}`
                      : '--'}
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1}>
                      <IconButton onClick={() => toggleAccordion(request.maintenance_request_uid)}>
                        {expandedRows[request.maintenance_request_uid] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                      <IconButton onClick={() => handleEditClick(request)}>
                        <EditIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                    <Collapse in={expandedRows[request.maintenance_request_uid]} timeout="auto" unmountOnExit>
                      <Box margin={1}>
                        <Typography variant="subtitle1" gutterBottom component="div">
                          <strong>Frequency:</strong> {request.maintenance_frequency || 'N/A'}
                        </Typography>
                        <Typography variant="subtitle1" gutterBottom component="div">
                          <strong>Status:</strong> {request.maintenance_request_status || 'N/A'}
                        </Typography>
                        <Typography variant="subtitle1" gutterBottom component="div">
                          <strong>Type:</strong> {request.maintenance_request_type || 'N/A'}
                        </Typography>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

function PaymentsPM({ data, setRightPane, selectedProperty, leaseDetails, balanceDetails }) {
  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, getProfileId, roleName, selectedRole } = useUser();

  // Log incoming data
  // useEffect(() => {
  //   console.log('Received payment history:', data);
  // }, [data]);

  const [showSpinner, setShowSpinner] = useState(false);
  const [paymentNotes, setPaymentNotes] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalToBePaid, setTotalToBePaid] = useState(0);
  const [totalPayable, setTotalPayable] = useState(0);
  const [totalToBeReceived, setTotalToBeReceived] = useState(0);
  const [paymentMethodInfo, setPaymentMethodInfo] = useState({});
  const managerCashflowWidgetData = location.state?.managerCashflowWidgetData || {};

  const [paymentData, setPaymentData] = useState({
    currency: "usd",
    customer_uid: getProfileId(),
    business_code: paymentNotes,
    item_uid: "320-000054",
    balance: "0.0",
    purchase_uids: [],
  });

  const [unpaidData, setUnpaidData] = useState([]);

  // Calculate totals from the filtered unpaid data
  useEffect(() => {
    const filteredUnpaidData = data.filter(item => item.purchaseStatus === 'UNPAID');
    setUnpaidData(filteredUnpaidData);

    const moneyToBePaidData = filteredUnpaidData.filter(item => item.purchaseType === 'Rent');
    const moneyPayableData = filteredUnpaidData.filter(item => item.purchaseType === 'Deposit');

    setTotalToBePaid(moneyToBePaidData.reduce((acc, item) => acc + parseFloat(item.amountDue || 0), 0));
    setTotalPayable(moneyPayableData.reduce((acc, item) => acc + parseFloat(item.amountDue || 0), 0));
    setTotal(unpaidData.reduce((acc, item) => acc + parseFloat(item.amountDue || 0), 0));
  }, [data]);

  const handlePaymentNotesChange = (event) => {
    setPaymentNotes(event.target.value);
  };

  return (
    <>
      <ThemeProvider theme={theme}>
        <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <Container>
          <Grid container spacing={6} sx={{ height: "90%" }}>
            <Grid container>
              <Paper
                component={Stack}
                direction="column"
                justifyContent="center"
                style={{
                  justifyContent: "center",
                  width: "100%",
                  boxShadow: "none",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#160449",
                    padding: "5px",
                  }}
                >
                </Box>

                <Paper
                  sx={{
                    margin: "10px",
                    padding: 20,
                    backgroundColor: theme.palette.primary.main,
                  }}
                >
                  <Stack direction="row" justifyContent="left" m={2}>
                    <Typography sx={{ color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}>
                      Balance
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="center" m={2}>
                    <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                      <Grid item xs={6}>
                        <Typography sx={{ marginLeft: "20px", color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight, fontSize: "26px" }}>
                          ${total.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          disabled={total <= 0}
                          sx={{
                            backgroundColor: "#3D5CAC",
                            borderRadius: "10px",
                            color: "#FFFFFF",
                            width: "100%",
                          }}
                          onClick={() => {
                            const updatedPaymentData = { ...paymentData, business_code: paymentNotes };
                            navigate("/selectPayment", {
                              state: {
                                paymentData: updatedPaymentData,
                                total: total,
                                selectedItems: selectedItems,
                                selectedProperty: selectedProperty,
                                leaseDetails: leaseDetails,
                                balanceDetails: balanceDetails,
                              },
                            });
                          }}
                        >
                          <Typography
                            variant="outlined"
                            style={{
                              textTransform: "none",
                              color: "#FFFFFF",
                              fontSize: "18px",
                              fontFamily: "Source Sans Pro",
                              fontWeight: "600",
                            }}
                          >
                            Select Payment
                          </Typography>
                        </Button>
                      </Grid>
                    </Grid>
                  </Stack>

                  <Stack direction="row" justifyContent="center" m={2} sx={{ paddingTop: "25px", paddingBottom: "15px" }}>
                    <TextField variant="filled" fullWidth={true} multiline={true} value={paymentNotes} onChange={handlePaymentNotesChange} label="Payment Notes" />
                  </Stack>
                </Paper>

                {/* Balance Details */}
                <Paper
                  sx={{
                    margin: "10px",
                    padding: 20,
                    backgroundColor: theme.palette.primary.main,
                  }}
                >
                  <Stack direction="row" justifyContent="space-between">
                    <Typography sx={{ color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}>
                      Balance Details - Money Payable
                    </Typography>
                  </Stack>

                  <Stack>
                    {/* Pass only the filtered unpaid data */}
                    <TenantBalanceTablePM data={unpaidData} total={total} setTotal={setTotal} setPaymentData={setPaymentData} setSelectedItems={setSelectedItems} />
                  </Stack>
                </Paper>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </ThemeProvider>
    </>
  );
}

function TenantBalanceTablePM(props) {
  const [data, setData] = useState(props.data);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [paymentDueResult, setPaymentDueResult] = useState([]);

  useEffect(() => {
    setData(props.data);
  }, [props.data]);

  useEffect(() => {
    if (data && data.length > 0) {
      setSelectedRows(data.map((row) => row.purchase_uid));
      setPaymentDueResult(
        data.map((item) => ({
          ...item,
          pur_amount_due: parseFloat(item.amountDue),
        }))
      );
    }
  }, [data]);

  useEffect(() => {
    let total = 0;
    let purchase_uid_mapping = [];

    for (const item of selectedRows) {
      let paymentItemData = paymentDueResult.find((element) => element.purchase_uid === item);
      purchase_uid_mapping.push({ purchase_uid: item, pur_amount_due: paymentItemData.pur_amount_due.toFixed(2) });

      // Adjust total based on pur_cf_type
      if (paymentItemData.pur_cf_type === "revenue") {
        total += parseFloat(paymentItemData.pur_amount_due);
      } else if (paymentItemData.pur_cf_type === "expense") {
        total -= parseFloat(paymentItemData.pur_amount_due);
      }
    }

    props.setTotal(total);
    props.setPaymentData((prevPaymentData) => ({
      ...prevPaymentData,
      balance: total.toFixed(2),
      purchase_uids: purchase_uid_mapping,
    }));
  }, [selectedRows, paymentDueResult, props]);

  useEffect(() => {
    props.setSelectedItems(selectedPayments);
  }, [selectedPayments, props]);

  const handleSelectionModelChange = (newRowSelectionModel) => {
    const addedRows = newRowSelectionModel.filter((rowId) => !selectedRows.includes(rowId));
    const removedRows = selectedRows.filter((rowId) => !newRowSelectionModel.includes(rowId));

    if (addedRows.length > 0) {
      let newPayments = [];
      addedRows.forEach((item) => {
        const addedPayment = paymentDueResult.find((row) => row.purchase_uid === item);
        newPayments.push(addedPayment);
      });

      setSelectedPayments((prevState) => [...prevState, ...newPayments]);
    }

    if (removedRows.length > 0) {
      setSelectedPayments((prevState) => prevState.filter((payment) => !removedRows.includes(payment.purchase_uid)));
    }

    setSelectedRows(newRowSelectionModel);
  };

  const columnsList = [
    {
      field: "description",
      headerName: "Description",
      flex: 2,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },
    {
      field: "propertyUid",
      headerName: "Property UID",
      flex: 1,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },
    {
      field: "purchaseStatus",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },
    {
      field: "purchaseDate",
      headerName: "Due Date",
      flex: 1,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    },
    {
      field: "pur_amount_due",
      headerName: "Amount Due",
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
          {params.row.pur_cf_type === "revenue"
            ? `$ ${parseFloat(params.value).toFixed(2)}`
            : `($ ${parseFloat(params.value).toFixed(2)})`}
        </Box>
      ),
    },
  ];

  return (
    <>
      {paymentDueResult.length > 0 && (
        <DataGrid
          rows={paymentDueResult}
          columns={columnsList}
          pageSizeOptions={[10, 50, 100]}
          checkboxSelection
          disableRowSelectionOnClick
          rowSelectionModel={selectedRows}
          onRowSelectionModelChange={handleSelectionModelChange}
          getRowId={(row) => row.purchase_uid}
        />
      )}
    </>
  );
}

export default TenantDashboard;
