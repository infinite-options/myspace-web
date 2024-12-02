import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, Typography, Grid, Button, Box, IconButton } from '@mui/material';
import { ArrowBack, ArrowForward, Description as DescriptionIcon } from '@mui/icons-material';
import Carousel from 'react-material-ui-carousel';
import dayjs from 'dayjs';
import APIConfig from "../../../utils/APIConfig";
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';

import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import NoImageAvailable from '../../../images/NoImageAvailable.png';
import Documents from '../../Leases/Documents';
import theme from "../../../theme/theme";
import { DataGrid } from '@mui/x-data-grid';
import { useMaintenance } from '../../../contexts/MaintenanceContext';
import { useUser } from '../../../contexts/UserContext';

const QuoteDetails = ({ maintenanceItem, initialIndex, maintenanceQuotesForItem, fetchAndUpdateQuotes, setRefresh, navigateParams}) => {
    console.log('----QuoteDetails maintenanceQuotesForItem----', initialIndex, maintenanceQuotesForItem);
    const { user, getProfileId, selectedRole } = useUser(); 

    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    //console.log('currentIndex=----', currentIndex);
    const currentItem = maintenanceQuotesForItem && maintenanceQuotesForItem[initialIndex];
    console.log('currentItem=----', currentItem);
    const [showSpinner, setShowSpinner] = useState(false);


    const { setQuoteRequestEditView, setMaintenanceQuotes, setCurrentQuoteIndex, setNavigateParams, setMaintenanceData, setSelectedStatus, setSelectedRequestIndex } = useMaintenance();

    useEffect(() => {
		setCurrentIndex(initialIndex);
        setCurrentQuoteIndex(initialIndex);
	}, [initialIndex]);

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? maintenanceQuotesForItem.length - 1 : prevIndex - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex === maintenanceQuotesForItem.length - 1 ? 0 : prevIndex + 1));
    };

    const renderParts = (item) => {
        try {
            const expenses = JSON.parse(item.quote_services_expenses);
            // console.log('Expenses:', expenses);
            const partsWithIDs = [];
            if (expenses.parts && expenses.parts.length > 0) {
                expenses.parts.forEach((part, index) => {
                    partsWithIDs.push({
                        ...part,
                        ID: index,
                        cost: parseFloat(part.cost),
                    });
                });

                // console.log('expenses.parts - ', expenses.parts);
                const partsTotal = expenses.parts.reduce((total, part) => {
                    const cost = parseFloat(part.cost);
                    const quantity = parseFloat(part.quantity);
                    return total + (cost * quantity);
                }, 0);

                const columns = [                    
                    {
                      field: 'part',
                      headerName: 'Part',
                      width: 220,
                    //   editable: true,
                    },
                    {
                      field: 'quantity',
                      headerName: 'Quantity',
                      headerAlign: 'right',
                      width: 100,
                      renderCell: (params) => (
                        <Box sx={{ textAlign: 'right', width: '100%' }}>
                            {params.formattedValue}
                        </Box>
                      ),                                            
                    },
                    {
                      field: 'cost',
                      headerName: 'Cost',
                      headerAlign: 'right',                      
                      width: 100,  
                      valueFormatter: (params) => `$${params.value.toFixed(2)}`,
                      renderCell: (params) => (
                        <Box sx={{ textAlign: 'right', width: '100%' }}>
                            {params.formattedValue}
                        </Box>
                    ),                                          
                    },             
                    {
                        field: 'totalCost',
                        headerName: 'Total Cost',
                        headerAlign: 'right',
                        width: 150,
                        valueGetter: (params) => params.row.cost * params.row.quantity,
                        valueFormatter: (params) => `$${params.value.toFixed(2)}`,
                        renderCell: (params) => (
                            <Box sx={{ textAlign: 'right', width: '100%' }}>
                                {params.formattedValue}
                            </Box>
                        ),
                        // renderHeader: (params) => (
                        //     <Box sx={{ textAlign: 'right', width: '100%' }}>
                        //         Total Cost
                        //     </Box>
                        // ),
                    },       
                ];
                return (
                    <Grid container sx={{ paddingTop: '10px' }} spacing={2}>
                        {/* {expenses.parts.map((part, index) => (
                            <React.Fragment key={index}>
                                <Grid item xs={4}>
                                    <Typography variant="body2" sx={{ color: '#2c2a75' }}>
                                        Part: {part.part}
                                    </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="body2" sx={{ color: '#2c2a75' }}>
                                        Quantity: {part.quantity}
                                    </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="body2" sx={{ color: '#2c2a75' }}>
                                        Cost: ${part.cost}
                                    </Typography>
                                </Grid>
                            </React.Fragment>
                        ))} */}
                        <Grid 
                            container
                            direction='row'
                            item
                            xs={12}
                            sx={{
                                borderRadius: '5px',
                                backgroundColor: '#F2F2F2',
                                margin: '10px',                                
                            }}

                        >
                            <Grid item xs={12} sx={{margin: '10px',}}>
                                <DataGrid
                                    // rows={expenses.parts}
                                    rows={partsWithIDs}
                                    getRowId={row => row.ID}
                                    rowHeight={30}
                                    columnHeaderHeight={30}
                                    columns={columns}
                                    initialState={{
                                        pagination: {
                                            paginationModel: {
                                                pageSize: 5,
                                            },
                                        },
                                    }}
                                    pageSizeOptions={[5]}                                     
                                    hideFooter={true}                       
                                    disableRowSelectionOnClick                                
                                    sx={{
                                        '& .MuiDataGrid-cell': {
                                            color: '#160449',                                        
                                        },                                    
                                        '& .MuiDataGrid-columnHeaderTitle': {
                                            lineHeight: 'normal',
                                            fontWeight: 'bold',
                                            color: '#160449',
                                        },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sx={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingRight: '8%', marginTop: '10px', marginBottom: '10px',}}>
                                <Typography variant="body2" sx={{ color: '#2c2a75', fontWeight: 'bold', }}>
                                    Parts Total: ${partsTotal.toFixed(2)}
                                </Typography>
                            </Grid>
                        </Grid>                                                
                    </Grid>
                );
            } else {
                console.log('No parts found in expenses');
            }
        } catch (error) {
            console.error('Error parsing quote_services_expenses:', error);
        }
        return null;
    };

    const renderLabourHour = (item) => {
        try {
            const expenses = JSON.parse(item.quote_services_expenses);
            console.log('Expenses:', expenses);
            const partsWithIDs = [];
            if (expenses.labor && expenses.labor.length > 0) {
                expenses.labor.forEach((lb, index) => {
                    partsWithIDs.push({
                        ...lb,
                        ID: index,
                        rate: parseFloat(lb.rate),
                        hours: parseFloat(lb.hours)
                    });
                });

                // console.log('expenses.parts - ', expenses.parts);
                const partsTotal = expenses.labor.reduce((total, part) => {
                    const rate = parseFloat(part.rate);
                    const hours = parseFloat(part.hours);
                    return total + (rate * hours);
                }, 0);

                const columns = [
                    {
                        field: 'rate',
                        headerName: 'Charge / Hours',                     
                        width: 220,  
                        valueFormatter: (params) => `$${params.value.toFixed(2)}`,
                        renderCell: (params) => (
                          <Box sx={{ width: '100%' }}>
                              {params.formattedValue}
                          </Box>
                      ),                                          
                    },  
                    {
                      field: 'hours',
                      headerName: 'Hours',
                      headerAlign: 'center',
                      width: 200,
                      renderCell: (params) => (
                        <Box sx={{ textAlign: 'center', width: '100%' }}>
                            {params.formattedValue}
                        </Box>
                      ),                                            
                    },           
                    {
                        field: 'totalCost',
                        headerName: 'Total Cost',
                        headerAlign: 'right',
                        width: 150,
                        valueGetter: (params) => params.row.rate * params.row.hours,
                        valueFormatter: (params) => `$${params.value.toFixed(2)}`,
                        renderCell: (params) => (
                            <Box sx={{ textAlign: 'right', width: '100%' }}>
                                {params.formattedValue}
                            </Box>
                        ),
                    },       
                ];

                return (
                    <Grid container sx={{ paddingTop: '10px' }} spacing={2}>
                        <Grid 
                            container
                            direction='row'
                            item
                            xs={12}
                            sx={{
                                borderRadius: '5px',
                                backgroundColor: '#F2F2F2',
                                margin: '10px',                                
                            }}

                        >
                            <Grid item xs={12} sx={{margin: '10px',}}>
                                <DataGrid
                                    // rows={expenses.parts}
                                    rows={partsWithIDs}
                                    getRowId={row => row.ID}
                                    rowHeight={30}
                                    columnHeaderHeight={30}
                                    columns={columns}
                                    initialState={{
                                        pagination: {
                                            paginationModel: {
                                                pageSize: 5,
                                            },
                                        },
                                    }}
                                    pageSizeOptions={[5]}                                     
                                    hideFooter={true}                       
                                    disableRowSelectionOnClick                                
                                    sx={{
                                        '& .MuiDataGrid-cell': {
                                            color: '#160449',                                        
                                        },                                    
                                        '& .MuiDataGrid-columnHeaderTitle': {
                                            lineHeight: 'normal',
                                            fontWeight: 'bold',
                                            color: '#160449',
                                        },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sx={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingRight: '8%', marginTop: '10px', marginBottom: '10px',}}>
                                <Typography variant="body2" sx={{ color: '#2c2a75', fontWeight: 'bold', }}>
                                    Service Charge Total: ${partsTotal.toFixed(2)}
                                </Typography>
                            </Grid>
                        </Grid>                                                
                    </Grid>
                );
            } else {
                console.log('No Service found in expenses');
            }
        } catch (error) {
            console.error('Error parsing quote_services_expenses:', error);
        }
        return null;
    };

    const computeTotalCost = (item) => {
        if(item && item.quote_services_expenses){
            const partsTotal = JSON.parse(item.quote_services_expenses).parts.reduce((total, part) => {
                const cost = parseFloat(part.cost);
                const quantity = parseFloat(part.quantity);
                return total + (cost * quantity);
            }, 0);
    
            const serviceTotal = JSON.parse(item.quote_services_expenses).labor.reduce((total, part) => {
                const rate = parseFloat(part.rate || part.charge);
                const hours = parseFloat(part.hours);
                return total + (rate * hours);
            }, 0);
    
            return partsTotal + serviceTotal
        
        }else{
            return 0;
        }
    }
    

    const handleSubmit = (quoteStatusParam) => {
        console.log("handleSubmit", quoteStatusParam);
    
        const changeMaintenanceQuoteStatus = async (quoteStatusParam) => {
            setShowSpinner(true);
            var formData = new FormData();
    
            formData.append("maintenance_quote_uid", currentItem?.maintenance_quote_uid);
            formData.append("quote_status", quoteStatusParam);
    
            try {
                const response = await fetch(`${APIConfig.baseURL.dev}/maintenanceQuotes`, {
                    method: "PUT",
                    body: formData,
                });
                let responseData = await response.json();
                console.log(responseData);
                if (response.status === 200) {
                    console.log("success");
                    
                    // Assign the maintenance request to the business
                    await assignMaintenanceRequest(currentItem?.quote_business_id, maintenanceItem.maintenance_request_uid);
    
                    // Trigger a refresh of the maintenance manager after successful acceptance
                    if (setRefresh) {
                        setRefresh(true);  // This will trigger the refresh in Maintenance Manager
                    }
                }
            } catch (error) {
                console.log("error", error);
            }
            setShowSpinner(false);
        };
    
        const assignMaintenanceRequest = async (assigned_business, request_uid) => {
            setShowSpinner(true);
            var formData = new FormData();
            formData.append("maintenance_assigned_business", assigned_business);
            formData.append("maintenance_request_uid", request_uid);
            formData.append("maintenance_request_status", "PROCESSING");
    
            try {
                console.log("trying to put maintenance assigned business", formData);
                const response = await fetch(`${APIConfig.baseURL.dev}/maintenanceRequests`, {
                    method: "PUT",
                    body: formData,
                });
                let responseData = await response.json();
                console.log(responseData);
                if (response.status === 200) {
                    console.log("success");
                    // Call the fetch and update quotes method
                    fetchAndUpdateQuotes();
                } else {
                    console.log("error changing maintenance assigned business");
                }
            } catch (error) {
                console.log("error", error);
            }
            setShowSpinner(false);
        };
    
        changeMaintenanceQuoteStatus(quoteStatusParam);
    };

    const handleEdit = () => {
        
        if (maintenanceItem && navigateParams) {

            try {
                setMaintenanceData(maintenanceItem);
                setNavigateParams(navigateParams);
                setMaintenanceQuotes(maintenanceQuotesForItem);
                setSelectedRequestIndex(navigateParams.maintenanceRequestIndex);
                setSelectedStatus(navigateParams.status);
                setQuoteRequestEditView(true);
            } catch (error) {
                console.error('Error setting sessionStorage: ', error);
            }
        } else {
            console.error('maintenanceItem or navigateParams is undefined');
        }
    }
    

    const [scrollPosition, setScrollPosition] = useState(0);
	const scrollRef = useRef(null);

    // console.log('----QuoteDetails navigate params----', navigateParams);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollLeft = scrollPosition;
		}
	}, [scrollPosition]);

	const handleScroll = (direction) => {
		if (scrollRef.current) {
			const scrollAmount = 200;
			setScrollPosition((prevScrollPosition) => {
				const currentScrollPosition = scrollRef.current.scrollLeft;
				let newScrollPosition;
	
				if (direction === 'left') {
					newScrollPosition = Math.max(currentScrollPosition - scrollAmount, 0);
				} else {
					newScrollPosition = currentScrollPosition + scrollAmount;
				}
	
				return newScrollPosition;
			});
		}
	};

    const isAnyQuoteAccepted = maintenanceQuotesForItem.some(item => item.quote_status === 'ACCEPTED' || item.quote_status === "FINISHED");


    return (
        <Card
            variant="outlined"
            sx={{
                width: 800, // Fixed width for the main card
                margin: 'auto',
                mt: 5,
                p: 3,
                backgroundColor: '#f2f1f9',
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            }}
        >
            <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#2c2a75', fontWeight: 'bold' }}>
                    Quotes Details
                </Typography>
                
                {/* Docuement, service table, image */}
                <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', maxHeight: "500px", overflow: 'auto' }}>
                    <Card
                        variant="outlined"
                        sx={{
                            width: 650, // Slightly smaller width for the inner card
                            margin: 'auto',
                            p: 3,
                            backgroundColor: '#ffffff',
                            borderRadius: '10px',
                            // boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                            boxShadow: 'none',
                            border: 'none',
                        }}
                    >
                        <Carousel
                            navButtonsAlwaysInvisible={true}
                            autoPlay={false}
                            index={currentIndex}
                            indicators={false}
                            onChange={(now, previous) => setCurrentIndex(now)}
                            sx={{ width: '100%', 
                            height: '400px', 
                            overflow: 'auto',
                            '&::-webkit-scrollbar': {
                                width: '4px',
                                height: '4px',
                            },
                            '&::-webkit-scrollbar-track': {
                                background: 'transparent',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: '#888',
                                borderRadius: '10px',
                            },
                            '&::-webkit-scrollbar-thumb:hover': {
                                backgroundColor: '#555',
                            },
                         }}
                        >
                            {maintenanceQuotesForItem.map((item, index) => (
                                <Box key={index} sx={{ padding: 2 }}>
                                    <Grid container spacing={1}>
                                        <Grid item xs={12}>
                                            <Typography variant="body1" sx={{ color: '#2c2a75', fontWeight: 'bold' }}>
                                                {item.maint_business_name} ({item.quote_business_id})
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" sx={{ color: '#2c2a75' }}>
                                                Quote Submitted:
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" sx={{ color: '#2c2a75' }}>
                                                {item.quote_created_date}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" sx={{ color: '#2c2a75' }}>
                                                Earliest Availability
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" sx={{ color: '#2c2a75' }}>
                                                {item.quote_earliest_available_date}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" sx={{ color: '#2c2a75' }}>
                                                Diagnostic Fees Included:
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" sx={{ color: '#2c2a75' }}>
                                                Yes
                                            </Typography>
                                        </Grid>

                                        {/* quote fix bid  */}
                                        {item?.quote_services_expenses && JSON.parse(item?.quote_services_expenses)?.event_type === 'Fixed' ? (
                                                <Grid container sx={{ paddingTop: '10px' }}>
                                                    <Grid item xs={6}>
                                                        <Typography variant="body2" sx={{ color: '#2c2a75' }}>
                                                            Fixed Bid
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="body2" sx={{ color: '#2c2a75' }}>
                                                            $
                                                            {Number(JSON.parse(item?.quote_services_expenses)?.labor[0]?.rate || 0).toFixed(2)}
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                        ) : item?.quote_services_expenses && JSON.parse(item?.quote_services_expenses)?.event_type === 'Hourly' ? renderLabourHour(item) : null}

                                        {/* quote expense service for parts */}
                                        {item?.quote_services_expenses ? renderParts(item) : null}

                                        {/* quote total price */}
                                        <Grid item xs={6}>
                                            <Typography variant="body2" gutterBottom sx={{ color: '#2c2a75' , fontWeight: 'bold' }}>
                                                Quote Total:
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            {/* <Typography variant="body2" gutterBottom sx={{ color: '#2c2a75', fontWeight: 'bold'  }}>
                                                <strong>${item.quote_total_estimate ? parseFloat(item.quote_total_estimate).toFixed(2) : '0.00'}</strong>
                                            </Typography> */}
                                            <Typography variant="body2" gutterBottom sx={{ color: '#2c2a75', fontWeight: 'bold'  }}>
                                                <strong>${computeTotalCost(item)}</strong>
                                            </Typography>
                                        </Grid>

                                        {/* Quote schedule date & time */}
                                        {item?.maintenance_request_status === 'SCHEDULED' ? (
                                            <>
                                                <Grid item xs={6}>
                                                    <Typography variant="body2" gutterBottom sx={{ color: '#2c2a75' }}>
                                                        Scheduled Date: {item?.maintenance_scheduled_date}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="body2" gutterBottom sx={{ color: '#2c2a75' }}>
                                                        Scheduled Time:{' '}
                                                        {dayjs(
                                                            item?.maintenance_scheduled_time,
                                                            'HH:mm'
                                                        ).format('h:mm A')}
                                                    </Typography>
                                                </Grid>
                                            </>
                                        ) : null}
                                        
                                        {/* quote documents */}
                                        <Grid item xs={12}>
                                            <Documents isAccord={false} isEditable={false} documents={item?.quote_documents? JSON.parse(item?.quote_documents) : []} customName={"Quote Documents"}/>
                                        </Grid>

                                        {/* Quote image */}
                                        <Grid item xs={12}>
                                            <Box sx={{ paddingTop: '10px' }}>
                                                <Typography variant="body2" gutterBottom sx={{  color: "#160449",
                                                            fontWeight: theme.typography.primary.fontWeight,
                                                            fontSize: "18px",
                                                            paddingBottom: "5px",
                                                            paddingTop: "5px",
                                                            marginTop:"10px",}}>
                                                    Quote Images:
                                                </Typography>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        padding: 2,
                                                    }}
                                                >
                                                    <IconButton onClick={() => handleScroll('left')} disabled={scrollPosition === 0}>
                                                        <ArrowBackIosIcon />
                                                    </IconButton>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            overflowX: 'auto',
                                                            scrollbarWidth: 'none',
                                                            msOverflowStyle: 'none',
                                                            '&::-webkit-scrollbar': {
                                                                display: 'none',
                                                            },
                                                        }}
                                                    >
                                                        <ImageList ref={scrollRef} sx={{ display: 'flex', flexWrap: 'nowrap' }} cols={5}>
                                                            {JSON.parse(item.quote_maintenance_images)?.length > 0 ? (
                                                                JSON.parse(item.quote_maintenance_images).map((image, index) => (
                                                                    <ImageListItem
                                                                        key={index}
                                                                        sx={{
                                                                            width: 'auto',
                                                                            flex: '0 0 auto',
                                                                            border: '1px solid #ccc',
                                                                            margin: '0 2px',
                                                                            position: 'relative', // Added to position icons
                                                                        }}
                                                                    >
                                                                        <img
                                                                            src={image}
                                                                            alt={`maintenance-${index}`}
                                                                            style={{
                                                                                height: '150px',
                                                                                width: '150px',
                                                                                objectFit: 'cover',
                                                                            }}
                                                                        />
                                                                    </ImageListItem>
                                                                ))
                                                            ) : (
                                                                <ImageListItem
                                                                    sx={{
                                                                        width: 'auto',
                                                                        flex: '0 0 auto',
                                                                        border: '1px solid #ccc',
                                                                        margin: '0 2px',
                                                                        position: 'relative',
                                                                    }}
                                                                >
                                                                    <img
                                                                        src={NoImageAvailable}
                                                                        alt="No images available"
                                                                        style={{
                                                                            height: '150px',
                                                                            width: '150px',
                                                                            objectFit: 'cover',
                                                                        }}
                                                                    />
                                                                </ImageListItem>
                                                            )}
                                                        </ImageList>
                                                    </Box>
                                                    <IconButton onClick={() => handleScroll('right')}>
                                                        <ArrowForwardIosIcon />
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                        </Grid>
                                        
                                        {/* Quote more info details */}
                                        {currentItem?.quote_status === "MORE INFO" && <Grid item xs={12}>
                                            <Box sx={{ paddingTop: '10px' }}>
                                                <Typography variant="body2" gutterBottom sx={{  color: "#160449",
                                                            fontWeight: theme.typography.primary.fontWeight,
                                                            fontSize: "18px",
                                                            paddingBottom: "5px",
                                                            paddingTop: "5px",
                                                            marginTop:"10px",}}>
                                                    Quote More Info Required:
                                                </Typography>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        padding: 2,
                                                    }}
                                                >
                                                   {currentItem?.quote_mm_notes? currentItem?.quote_mm_notes : ""}
                                                </Box>
                                            </Box>
                                        </Grid>}

                                        {/* Rejection reason */}
                                        {currentItem?.quote_status === "REFUSED" && <Grid item xs={12}>
                                            <Box sx={{ paddingTop: '10px' }}>
                                                <Typography variant="body2" gutterBottom sx={{  color: "#160449",
                                                            fontWeight: theme.typography.primary.fontWeight,
                                                            fontSize: "18px",
                                                            paddingBottom: "5px",
                                                            paddingTop: "5px",
                                                            marginTop:"10px",}}>
                                                    Reason From Maintenance:
                                                </Typography>
                                                <Box
                                                    sx={{
                                                        color: "#F87C7A",
                                                        fontWeight: theme.typography.primary.fontWeight,
                                                        padding: 2,
                                                    }}
                                                >
                                                   {currentItem?.quote_notes? currentItem?.quote_notes : ""}
                                                </Box>
                                            </Box>
                                        </Grid>}
                                    </Grid>
                                </Box>
                            ))}
                        </Carousel>
                    </Card> 
                </Box>
            </CardContent>

            {/* Action button */}
            {currentItem && (
                <Box display="flex" justifyContent="space-between" p={2}>
                    {selectedRole === "MANAGER" && currentItem.quote_status === 'REQUESTED' ? (
                        <Button
                            variant="contained"
                            sx={{
                                backgroundColor: '#F87C7A',
                                '&:hover': {
                                    backgroundColor: '#F87C7A',
                                },
                                color: '#160449',
                                fontWeight: 'bold',
                                textTransform: 'none',
                            }}
                            onClick={() => handleSubmit("WITHDRAWN")}
                        >
                            Withdraw
                        </Button>
                    ) : selectedRole === "MANAGER" && currentItem.quote_status === 'SENT' ? (
                        <>
                           {!isAnyQuoteAccepted && (
                                <Button
                                    variant="contained"
                                    sx={{
                                        backgroundColor: '#9EAED6',
                                        '&:hover': {
                                            backgroundColor: '#9EAED6',
                                        },
                                        color: '#160449',
                                        fontWeight: 'bold',
                                        textTransform: 'none',
                                    }}
                                    onClick={() => handleSubmit("ACCEPTED")}
                                >
                                    Accept
                                </Button>
                            )}
                            <Button
                                variant="contained"
                                sx={{
                                    backgroundColor: '#FFC614',
                                    '&:hover': {
                                        backgroundColor: '#FFC614',
                                    },
                                    color: '#160449',
                                    fontWeight: 'bold',
                                    textTransform: 'none',
                                }}
                                onClick={() => handleSubmit("REJECTED")}
                            >
                                Decline
                            </Button>
                        </>
                    ) : selectedRole === "MANAGER" && currentItem.quote_status === 'ACCEPTED' ? (
                        <Button
                            variant="contained"
                            sx={{
                                backgroundColor: '#F87C7A',
                                '&:hover': {
                                    backgroundColor: '#F87C7A',
                                },
                                color: '#160449',
                                fontWeight: 'bold',
                                textTransform: 'none',
                            }}
                            onClick={() => handleSubmit("REJECTED")}
                        >
                            Reject
                        </Button>
                    ) : selectedRole === "MANAGER" && currentItem.quote_status === "MORE INFO" ? (
                        <Button
                            variant="contained"
                            sx={{
                                backgroundColor: '#F87C7A',
                                '&:hover': {
                                    backgroundColor: '#F87C7A',
                                },
                                color: '#160449',
                                fontWeight: 'bold',
                                textTransform: 'none',
                            }}
                            onClick={() => handleEdit()}
                        >
                            Edit Quote
                        </Button>
                    ) : null}
                </Box>
            )}
        </Card>
    );
};

export default QuoteDetails;
