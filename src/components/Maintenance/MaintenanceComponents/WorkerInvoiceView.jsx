import React, { useState, useEffect, useRef } from 'react';
import {
  Card, 
  CardContent,
  Typography,
  Grid,
  IconButton,
  Box,
} from "@mui/material";
import theme from '../../../theme/theme';
import { DataGrid } from '@mui/x-data-grid';
import Documents from '../../Leases/Documents';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';

import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import NoImageAvailable from '../../../images/NoImageAvailable.png';

export default function WorkerInvoiceView({maintenanceItem}){
    console.log('inside workerinvoice---', maintenanceItem);

    const [scrollPosition, setScrollPosition] = useState(0);
	const scrollRef = useRef(null);

    const [totalService, setTotalService] = useState(0)
    const [totalParts, setTotalParts] = useState(0)

    useEffect(()=>{
        const partsTotal = JSON.parse(maintenanceItem?.quote_services_expenses).parts.reduce((total, part) => {
            const cost = parseFloat(part.cost);
            const quantity = parseFloat(part.quantity);
            return total + (cost * quantity);
        }, 0);

        const serviceTotal = JSON.parse(maintenanceItem?.quote_services_expenses).labor.reduce((total, part) => {
            const rate = parseFloat(part.rate || part.charge);
            const hours = parseFloat(part.hours === 0 ? 1 : part.hours);
            return total + (rate * hours);
        }, 0);

        setTotalParts(partsTotal)
        setTotalService(serviceTotal)

    }, [maintenanceItem])

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
                

                const columns = [                    
                    {
                        field: 'part',
                        headerName: 'Part',
                        width: 250,
                    //   editable: true,
                    },
                    {
                        field: 'quantity',
                        headerName: 'Quantity',
                        headerAlign: 'right',
                        width: 150,
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
                        width: 150, 
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
                        width: 160,
                        valueGetter: (params) => params.row.cost * params.row.quantity,
                        valueFormatter: (params) => `$${params.value.toFixed(2)}`,
                        renderCell: (params) => (
                            <Box sx={{ textAlign: 'right', width: '100%' }}>
                                {params.formattedValue}
                            </Box>
                        ),
                    },       
                ];

                return (
                    <Grid container item xs={12} sx={{marginTop: '10px',}}>
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
                                '& .MuiDataGrid-root': {
                                    boxShadow: 'none',
                                },
                                '& .MuiDataGrid-cell': {
                                    color: '#160449', 
                                    borderBottom: 'none',                                       
                                },                                    
                                '& .MuiDataGrid-columnHeaderTitle': {
                                    lineHeight: 'normal',
                                    fontWeight: 'bold',
                                    color: '#160449',
                                },
                            }}
                        />
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
            // console.log('Expenses:', expenses);
            const partsWithIDs = [];
            if (expenses.labor && expenses.labor.length > 0) {
                expenses.labor.forEach((lb, index) => {
                    partsWithIDs.push({
                        ...lb,
                        ID: index,
                        rate: parseFloat(lb.rate || lb.charge),
                        hours: parseFloat(lb.hours === 0? 1 : lb.hours)
                    });
                });

                console.log('expenses.parts - ', partsWithIDs);

                const columns = [
                    {
                        field: 'rate',
                        headerName: 'Charge / Hours',                     
                        width: 300,  
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
                        width: 210,
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
                    <Grid container item xs={12} sx={{marginTop: '10px', boxShadow: "none"}}>
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
                                '& .MuiDataGrid-root': {
                                    boxShadow: 'none',
                                },
                                '& .MuiDataGrid-cell': {
                                    color: '#160449',
                                    borderBottom: 'none',                                        
                                },                                    
                                '& .MuiDataGrid-columnHeaderTitle': {
                                    lineHeight: 'normal',
                                    fontWeight: 'bold',
                                    color: '#160449',
                                },
                            }}
                        />
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

    const purchaseKeys = Object.keys(maintenanceItem).filter(key => key.startsWith("pur"));
    const billKeys = Object.keys(maintenanceItem).filter(key => key.startsWith("bill"));

    return (
        
        <Grid container direction="column" columnSpacing={6} rowSpacing={6} sx={{paddingTop: "10px"}}>
            <Grid item xs={12} sx={{
                alignItems: "center",
                justifyContent: "center",
            }}>
                <Box
                    variant="contained"
                    sx={{
                        flexDirection: "column",
                        backgroundColor: "#ffffff",
                        textTransform: "none",
                        paddingRight: "10px",
                        paddingTop: "10px",
                        paddingBottom: "10px",
                        borderRadius: "10px",
                        paddingLeft: "10px",
                        display: 'flex',
                        width: 'flex',
                    }}
                >
                    {maintenanceItem.bill_uid ? (
                        <>
                           <Box sx={{ padding: 2 }}>
                                    <Grid container spacing={1}>
                                        <Grid item xs={12} marginBottom={"20px"}>
                                            <Typography variant="body1" sx={{ color: '#2c2a75', fontWeight: 'bold', textAlign: 'center', fontSize: "20px"}}>
                                                Invoice Detail - {maintenanceItem.bill_uid}
                                            </Typography>
                                        </Grid>
                                        
                                        <Grid item xs={6}>
                                            <Typography variant="body2" sx={{ color: '#2c2a75', fontWeight: "bold"}}>
                                                Description:
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" sx={{ color: '#2c2a75' }}>
                                                {maintenanceItem.bill_description}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" sx={{ color: '#2c2a75', fontWeight: "bold" }}>
                                                Due Date:
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" sx={{ color: '#2c2a75' }}>
                                                {maintenanceItem.pur_due_date}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" sx={{ color: '#2c2a75', fontWeight: "bold" }}>
                                                Invoice Status:
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" sx={{ color: '#2c2a75' }}>
                                                {maintenanceItem.purchase_status}
                                            </Typography>
                                        </Grid>

                                        {/* quote fix bid  */}
                                        <Grid item xs={12}>
                                            <Typography variant="body2" gutterBottom sx={{  color: "#160449",
                                                        fontWeight: theme.typography.primary.fontWeight,
                                                        fontSize: "18px",
                                                        paddingBottom: "5px",
                                                        paddingTop: "5px",
                                                        marginTop:"10px",}}>
                                                Estimation:
                                            </Typography>
                                            {maintenanceItem?.quote_services_expenses || JSON.parse(maintenanceItem?.quote_services_expenses)?.event_type === 'Hourly' ? renderLabourHour(maintenanceItem) : null}
                                        </Grid>

                                        {/* quote expense service for parts */}
                                        <Grid item xs={12} marginTop={"10px"}>
                                            {maintenanceItem?.quote_services_expenses ? renderParts(maintenanceItem): null}
                                        </Grid>

                                        {/* service Total */}
                                        <Grid item xs={6}></Grid>
                                        <Grid item xs={6} marginTop={"20px"} display={"flex"} flexDirection={"row"} justifyContent={'space-around'}>
                                            <Typography sx={{ color: '#2c2a75', fontSize: "14px"}}>
                                                Service Charge:
                                            </Typography>
                                            <Typography sx={{ color: '#2c2a75', fontSize: "14px", textAlign: "right"}}>
                                                ${parseFloat(totalService).toFixed(2)}
                                            </Typography>
                                        </Grid>

                                        {/* Parts Total */}
                                        <Grid item xs={6}></Grid>
                                        <Grid item xs={6} marginTop={"2px"} display={"flex"} flexDirection={"row"} justifyContent={'space-around'}>
                                            <Typography sx={{ color: '#2c2a75', fontSize: "14px"}}>
                                                Parts Charge:
                                            </Typography>
                                            <Typography sx={{ color: '#2c2a75', fontSize: "14px", textAlign: "right"}}>
                                                ${parseFloat(totalParts).toFixed(2)}
                                            </Typography>
                                        </Grid>

                                        {/* Invoice total price */}
                                        <Grid item xs={6}></Grid>
                                        <Grid item xs={6} marginTop={"2px"} display={"flex"} flexDirection={"row"} justifyContent={'space-around'}>
                                            <Typography sx={{ color: '#2c2a75' , fontWeight: 'bold' }}>
                                                Invoice Total:
                                            </Typography>
                                            <Typography sx={{ color: '#2c2a75', fontWeight: 'bold'  }}>
                                                <strong>${maintenanceItem.bill_amount ? parseFloat(maintenanceItem.bill_amount).toFixed(2) : '0.00'}</strong>
                                            </Typography>
                                        </Grid>
                                        
                                        {/* Invoice documents */}
                                        <Grid item xs={12}>
                                            <Documents isAccord={false} isEditable={false} documents={maintenanceItem?.bill_documents? JSON.parse(maintenanceItem?.bill_documents) : []} customName={"Invoice Documents"}/>
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
                                                    Invoice Images:
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
                                                            maxWidth: "600px",
                                                            scrollbarWidth: 'none',
                                                            msOverflowStyle: 'none',
                                                            '&::-webkit-scrollbar': {
                                                                display: 'none',
                                                            },
                                                        }}
                                                    >
                                                        <ImageList ref={scrollRef} sx={{ display: 'flex', flexWrap: 'nowrap' }} cols={5}>
                                                            {JSON.parse(maintenanceItem.bill_images)?.length > 0 ? (
                                                                JSON.parse(maintenanceItem.bill_images).map((image, index) => (
                                                                    <ImageListItem
                                                                        key={index}
                                                                        sx={{
                                                                            width: 'auto',
                                                                            maxWidth: "600px",
                                                                            '&::-webkit-scrollbar': {
                                                                                display: 'none',
                                                                            },
                                                                            flex: '0 0 auto',
                                                                            border: '1px solid #ccc',
                                                                            margin: '0 2px',
                                                                            position: 'relative', // Added to position icons
                                                                        }}
                                                                    >
                                                                        <img
                                                                            src={image}
                                                                            alt={`invoice-${index}`}
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
                                        
                                    </Grid>
                                </Box>
                        </>
                    ) : (
                        <Typography sx={{color: "#3D5CAC", fontWeight: theme.typography.primary.fontWeight, fontSize: "18px"}}>
                            No Invoice Created
                        </Typography>
                    )}
                </Box>
            </Grid>
        </Grid>
    )
}
