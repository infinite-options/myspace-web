import React, { useState, useCallback, useEffect } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CircleIcon from '@mui/icons-material/Circle';
import { Table, TableHead, TableBody, TableRow, TableCell, TableContainer } from '@mui/material';
import { Accordion, AccordionSummary, AccordionDetails, Collapse, ThemeProvider, Grid, Container, Paper, Typography, Button, Stack, Divider, IconButton, Box, Menu, MenuItem, CardMedia, Backdrop, CircularProgress, TextField } from '@mui/material';
import defaultHouseImage from "../Property/defaultHouseImage.png";

const TenantAccountBalance = ({ propertyData, selectedProperty, setSelectedProperty, leaseDetails, leaseDetailsData, balanceDetails, onPaymentHistoryNavigate, handleMakePayment, setRightPane, from }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const balanceDue = parseFloat(selectedProperty?.balance || 0);
  console.log("balance details", balanceDetails);

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

  const handleback = () => {
    console.log("go back");
  }

  const getButtonColor = () => {
      if (leaseDetails?.lease_status === 'NEW') return '#FAD102'; // Green for NEW
      if (leaseDetails?.lease_status === 'PROCESSING') return '#76B148'; // Yellow for PROCESSING
      return balanceDue > 0 ? '#A52A2A' : '#3D5CAC'; // Red for balance due, default for no balance
  };

  return (
      <Paper sx={{ padding: '30px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
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
                  {from !== "selectPayment" && (
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
                  )}
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

              {/* <Typography>
                  {`${selectedProperty?.property_uid}`}
              </Typography> */}

              <Box sx={{ fontSize: "20px", fontWeight: "600", color: "#160449", marginLeft: "5px", opacity: "50%", alignItems: "center", alignContent: "center" }}>
                        Due: {selectedProperty?.earliest_due_date ? selectedProperty.earliest_due_date : "No Data"}
                </Box>

              {/* Payment or Application Button */}
              {from !== "selectPayment" && (
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
              )}

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
                <>
                <Typography sx={{ fontSize: '18px', fontWeight: 'bold', color: '#160449', padding: '3px' }}>
                  Balance Details
                </Typography>
                <Box sx={{ padding: '10px', maxHeight: '250px', overflowY: 'auto', backgroundColor: '#f0f0f0'}}>
                    <Table sx={{ '& .MuiTableCell-root': { padding: '8px', fontSize: '14px'} }}>
                        <TableHead>
                        <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                            <TableCell sx={{ padding: '8px', fontWeight: 'bold', color: '#160449' }}>Type</TableCell>
                            <TableCell align="right" sx={{ padding: '8px', fontWeight: 'bold', color: '#160449' }}>Amount</TableCell>
                            <TableCell sx={{ padding: '8px', fontWeight: 'bold', color: '#160449' }}>Description</TableCell>
                            <TableCell sx={{ padding: '8px', fontWeight: 'bold', color: '#160449' }}>Due</TableCell>
                        </TableRow>
                        </TableHead>
                        <TableBody>
                        {balanceDetails.map((detail, index) => (
                            <TableRow key={index}>
                            <TableCell sx={{ padding: '8px' }}>{detail.purchaseType}</TableCell>
                            <TableCell align="right" sx={{ padding: '8px' }}>
                                ${detail.amountDue.toFixed(2)}
                            </TableCell>
                            <TableCell sx={{ padding: '8px' }}>{detail.description}</TableCell>
                            <TableCell sx={{ padding: '8px' }}>{new Date(detail.dueDate).toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </Box>
                </>
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
              {from !== "selectPayment" && leaseDetails?.lease_status === "ACTIVE" && (
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
              {from === "selectPayment" && (
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
                          onClick={handleback}
                      >
                          Go back Dashboard
                      </Button>
                  </Box>
              )}
          </Box>
      </Paper>
  );
};

export default TenantAccountBalance;