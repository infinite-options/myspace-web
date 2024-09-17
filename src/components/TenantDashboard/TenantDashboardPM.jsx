import React, { useState, useCallback, useEffect } from 'react';
import { Grid, Container, Paper, Typography, Button, Stack, Divider, IconButton, Box, Menu, MenuItem, CardMedia } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CircleIcon from '@mui/icons-material/Circle';
import { List, ListItem } from '@mui/material';
import defaultHouseImage from "../Property/defaultHouseImage.png";
import { useUser } from '../../contexts/UserContext'; 
import APIConfig from "../../utils/APIConfig";
import ArrowDropDown from '@mui/icons-material/ArrowDropDown';
import theme from "../../theme/theme";
import { DataGrid } from "@mui/x-data-grid";
import MaintenanceWidget from '../Dashboard-Components/Maintenance/MaintenanceWidget';
import { PropertyListings } from '../Property/PropertyListings';

const TenantDashboardPM = () => {
    const { user } = useUser(); 
    const { getProfileId } = useUser();
  
    const [propertyListingData, setPropertyListingData] = useState([]);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [leaseDetails, setLeaseDetails] = useState(null);
    const [announcements, setAnnouncements] = useState(null);
    const [maintenanceRequests, setMaintenanceRequests] = useState(null);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [showPaymentHistory, setShowPaymentHistory] = useState(false);
      
    useEffect(() => {
        async function fetchData() {
          try {
            // Fetching dashboard data
            const dashboardResponse = await fetch(`${APIConfig.baseURL.dev}/dashboard/${getProfileId()}`);
            const dashboardData = await dashboardResponse.json();
    
            // Parsing dashboard data
            if (dashboardData) {
              setPropertyListingData(dashboardData.property?.result || []);
              setLeaseDetails(dashboardData.leaseDetails?.result[0]); 
              setAnnouncements(dashboardData.announcements?.result);
              setMaintenanceRequests(dashboardData.maintenanceRequests?.result);
      
              // Set the first property as the selected one
              if (dashboardData.property?.result?.length > 0) {
                setSelectedProperty(dashboardData.property?.result[0]);
              }
            }
          } catch (error) {
            console.error("Error fetching data: ", error);
          }
        }
      
        fetchData();
    }, [getProfileId]);

    const handleSelectProperty = (property) => {
        setSelectedProperty(property); 
        fetchPaymentHistory(property.property_uid); // Fetch payment history for the selected property
    };
    
    // Fetch payment history for a specific property
    const fetchPaymentHistory = async (propertyId) => {
        try {
            const paymentsResponse = await fetch(`${APIConfig.baseURL.dev}/paymentStatus/${getProfileId()}`);
            const paymentsData = await paymentsResponse.json();
          
            // Filter payments based on the selected property's property_uid
            const paymentsReceivedData = paymentsData?.MoneyPaid?.result?.filter(payment => payment.pur_property_id === propertyId) || [];
            setPaymentHistory(paymentsReceivedData);
        } catch (error) {
            console.error("Error fetching payment history: ", error);
        }
    };

    const handlePaymentHistoryNavigate = () => {
        setShowPaymentHistory(true); // Show payment history when button is clicked
    };

    const handleBackToDetails = () => {
        setShowPaymentHistory(false); // Back to lease details, maintenance, and management
    };

    return (
        <Box sx={{ backgroundColor: '#fff', minHeight: '100vh', paddingY: 5 }}>
          <Container maxWidth="lg">
            <Grid container spacing={3}>
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
                  //onclick here for listings
                >
                <SearchIcon />
                  {"Search Property"}
                </Button>
              </Grid>
  
              {/* Left-hand side: Account Balance */}
              <Grid item xs={12} md={4}>
                <TenantAccountBalance 
                  propertyData={propertyListingData} 
                  selectedProperty={selectedProperty}
                  setSelectedProperty={handleSelectProperty}
                  leaseDetails={leaseDetails}
                  onPaymentHistoryNavigate={handlePaymentHistoryNavigate}
                />
              </Grid>
  
              {/* Right-hand side */}
              <Grid item xs={12} md={8}>
                {/* Top section: Announcements */}
                <Grid item xs={12}>
                  <Announcements />
                </Grid>
  
                {/* Bottom section: Lease Details & Maintenance/Management or Payment History */}
                <Grid container spacing={3} sx={{ marginTop: '20px' }}>
                  {!showPaymentHistory ? (
                    <>
                      {/* Left column: Lease Details */}
                      <Grid item xs={12} md={6}>
                        <LeaseDetails leaseDetails={leaseDetails} />
                      </Grid>
                      {/* Right column: Maintenance & Management */}
                      <Grid item xs={12} md={6}>
                        <Grid container spacing={3}>
                          {/* Maintenance Details */}
                          <Grid item xs={12}>
                            <MaintenanceDetails maintenanceRequests={maintenanceRequests} />
                          </Grid>
                          {/* Management Details */}
                          <Grid item xs={12}>
                            <ManagementDetails leaseDetails={leaseDetails} />
                          </Grid>
                        </Grid>
                      </Grid>
                    </>
                  ) : (
                    <Grid item xs={12}>
                      {/* Payment History */}
                      <TenantPaymentHistoryTable data={paymentHistory} />
                      <Button onClick={handleBackToDetails} variant="outlined" sx={{ marginTop: 2 }}>
                        Back to Lease Details
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Container>
        </Box>
      );
    };

  
const TenantAccountBalance = ({ propertyData, selectedProperty, setSelectedProperty, leaseDetails, onPaymentHistoryNavigate }) => {
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
            PROCESSING: '#00D100',
            REJECTED: '#FA0202',
            ENDED: '#000000',
            RESCIND: '#FF8832',
        };
        return status ? statusColorMapping[status] : '#ddd';
    };

    return (
        <Box sx={{ padding: '10px', flex: 1, backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
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
                        {`${selectedProperty?.property_address} ${selectedProperty?.property_unit}`}
                        <KeyboardArrowDownIcon onClick={handleOpen} />
                    </Typography>
                    <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                        {propertyData?.map((property) => (
                            <MenuItem key={property.property_uid} onClick={() => setSelectedProperty(property)}>
                                {`${property.property_address} ${property.property_unit}`}
                            </MenuItem>
                        ))}
                    </Menu>
                </Box>

                {/* Total Balance */}
                <Typography
                    variant="h4"
                    sx={{
                        color: balanceDue > 0 ? 'red' : '#3D5CAC', 
                        fontWeight: 'bold',
                        marginTop: '10px',
                    }}
                >
                    ${balanceDue.toFixed(2)}
                </Typography>

                {/* Conditionally Show Due Date */}
                {balanceDue > 0 && (
                    <Typography sx={{ fontSize: '20px', fontWeight: '600', color: '#160449', opacity: '50%' }}>
                        Due: {leaseDetails?.lease_start || 'No Data'}
                    </Typography>
                )}

                {/* Make Payment Button */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px' }}>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: balanceDue > 0 ? 'red' : '#3D5CAC', 
                            color: '#fff',
                            fontWeight: 'bold',
                        }}
                        disabled={balanceDue === 0}
                    >
                        {balanceDue > 0 ? 'Make a Payment' : 'No Payment Due'}
                    </Button>
                </Box>

                {/* Balance Details */}
                <Box sx={{ padding: '20px' }}>
                    <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: '#160449' }}>Balance Details</Typography>
                    <Grid container spacing={1}>
                        <Grid item xs={6}>
                            <Typography>Rent:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography align="right">${selectedProperty?.property_listed_rent}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography>Late Fees:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography align="right">$0</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography>Utility:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography align="right">$0</Typography>
                        </Grid>
                    </Grid>
                </Box>

                {/* Payment History Button */}
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                    <Button
                        variant="outlined"
                        sx={{ color: '#3D5CAC', borderColor: '#3D5CAC', fontWeight: 'bold' }}
                        onClick={onPaymentHistoryNavigate} // Navigate to payment history when clicked
                    >
                        View Payment History
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};
  
function TenantPaymentHistoryTable(props) {
    console.log("In Tenant Payment History Table from Stack", props);
    const isMobile = props.isMobile;
    const isMedium = props.isMedium;
  
    const mobileColumnsList = [
      {
        field: "latest_date",
        headerName: "Date",
        flex: 1,
        renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value ? params.value : params.row.pur_due_date}</Box>,
      },
  
      {
        field: "purchase_type",
        headerName: "Type",
        flex: 0,
        renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
      },
      {
        field: "payment_status",
        headerName: "Status",
        flex: 1,
        headerStyle: {
          fontWeight: "bold",
        },
        renderCell: (params) => (
          <Box
            sx={{
              backgroundColor: theme.colorStatusPaymentHistoryTenant.find((item) => item.status === params.value)?.color,
              textTransform: "none",
              fontWeight: "bold",
              width: "100px",
              height: "20px",
              borderRadius: "4px",
              alignItems: "center",
              textAlign: "center",
              alignContent: "center",
              color: "#FFFFFF",
            }}
          >
            {params.value}
          </Box>
        ),
      },
  
      {
        field: "total_paid",
        headerName: "Total Paid",
        flex: 0.7,
        headerStyle: {
          fontWeight: "bold",
        },
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
            $ {params.value === null || parseFloat(params.value) === 0 ? "0.00" : parseFloat(params.value).toFixed(2)}
          </Box>
        ),
      },
    ];
  
    const desktopColumnsList = [
      {
        field: "purchase_uid",
        headerName: "Purchase (400)",
        flex: 1,
        align: "right",
        renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value.slice(-4)}</Box>,
      },
      {
        field: "payer_profile_uid",
        headerName: "Payer (350)",
        flex: 1,
        align: "right",
        renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value.slice(-4)}</Box>,
      },
      // {
      //   field: "payer_user_name",
      //   headerName: "Payer Name",
      //   flex: 2,
      //   renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
      // },
      {
        field: "pur_description",
        headerName: "Description",
        flex: 2,
        renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
      },
      // {
      //   field: "pur_property_id",
      //   headerName: "Property (200)",
      //   flex: 1,
      //   align: "right",
      //   renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value.slice(-4)}</Box>,
      // },
    ];
  
    const columnList = () => {
      if (isMobile || isMedium) {
        return mobileColumnsList;
      } else {
        return mobileColumnsList.concat(desktopColumnsList);
      }
    };
  
    if (props.data && props.data.length > 0) {
      // console.log("In Tenant Payment History Table from Stack - Displaying Info");
      return (
        <DataGrid
          rows={props.data}
          columns={columnList()}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
          getRowId={(row) => row.purchase_uid}
          pageSizeOptions={[5, 10, 25, 100]}
        />
      );
    } else {
      return (
        <Box sx={{ display: "flex", alignItems: "center", alignContent: "center", justifyContent: "center", minHeight: "200px" }}>
          <Typography sx={{ fontSize: { xs: "16px", sm: "16px", md: "16px", lg: "16px" } }}>No Payment History Available</Typography>
        </Box>
      );
    }
  }  

const Announcements = () => {
  return (
    <Paper elevation={3} sx={{ padding: '20px' }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#160449' }}>
        Announcements
      </Typography>
      <Typography sx={{ marginTop: '10px', color: '#333' }}>
        No announcements available at the moment.
      </Typography>
      <Button variant="contained" sx={{ backgroundColor: '#3D5CAC', color: '#fff', marginTop: '10px' }}>
        View All
      </Button>
    </Paper>
  );
};

const LeaseDetails = ({ leaseDetails }) => {
    return (
      <Paper elevation={3} sx={{ padding: '20px', backgroundColor: '#f0f0f0', height: '100%' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#160449' }}>
          Lease Details
        </Typography>
        <Stack spacing={2} sx={{ marginTop: '10px' }}>
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
      </Paper>
    );
  };

const MaintenanceDetails = ({ maintenanceRequests }) => {
    const maintenanceStatusCounts = {
        "New Requests": maintenanceRequests?.filter(item => item.maintenance_request_status === "NEW").length || 0,
        "Info Requested": maintenanceRequests?.filter(item => item.maintenance_request_status === "INFO_REQUESTED").length || 0,
        "Quotes Requested": maintenanceRequests?.filter(item => item.maintenance_request_status === "QUOTES_REQUESTED").length || 0,
        "Processing": maintenanceRequests?.filter(item => item.maintenance_request_status === "PROCESSING").length || 0,
        "Scheduled": maintenanceRequests?.filter(item => item.maintenance_request_status === "SCHEDULED").length || 0,
        "Completed": maintenanceRequests?.filter(item => item.maintenance_request_status === "COMPLETED").length || 0,
    };

    const statusColors = {
        "New Requests": '#E53935',
        "Info Requested": '#EF5350',
        "Quotes Requested": '#FF7043',
        "Processing": '#42A5F5',
        "Scheduled": '#1E88E5',
        "Completed": '#1565C0',
    };

    return (
        <Paper 
          elevation={3} 
          sx={{ 
            padding: '20px', 
            backgroundColor: '#f0f0f0', 
            borderRadius: '12px', 
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', 
            fontFamily: 'Source Sans Pro',
            maxWidth: '400px',
            margin: 'auto'
          }}>
          
          {/* Title */}
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#160449', marginBottom: '20px', fontSize: '20px', textAlign: 'center' }}>
              Maintenance
          </Typography>
          
          {/* Buttons */}
          <Grid container justifyContent="space-between" sx={{ marginBottom: '20px' }}>
          </Grid>
          
          {/* Status Sections */}
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
          padding: '20px', 
          backgroundColor: '#f0f0f0', 
          borderRadius: '12px', 
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', 
          fontFamily: 'Source Sans Pro',
          maxWidth: '400px',
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
  

export default TenantDashboardPM;
