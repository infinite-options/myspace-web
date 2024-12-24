import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CircleIcon from "@mui/icons-material/Circle";
import { Table, TableHead, TableBody, TableRow, TableCell, TableContainer } from "@mui/material";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Collapse,
  ThemeProvider,
  Grid,
  Container,
  Paper,
  Typography,
  Button,
  Stack,
  Divider,
  IconButton,
  Box,
  Menu,
  MenuItem,
  CardMedia,
  Backdrop,
  CircularProgress,
  TextField,
} from "@mui/material";
import defaultHouseImage from "../Property/defaultHouseImage.png";
import { FirstPage } from "@mui/icons-material";

const TenantAccountBalance = ({
  propertyData,
  selectedProperty,
  setSelectedProperty,
  firstPage,
  leaseDetails,
  leaseDetailsData,
  balanceDetails,
  onPaymentHistoryNavigate,
  handleMakePayment,
  setRightPane,
  isMobile,
  viewRHS,
  setViewRHS,
  from,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [relatedLease, setRelatedLease] = useState(null);
  const navigate = useNavigate();
  const open = Boolean(anchorEl);
  const balanceDue = parseFloat(balanceDetails[0]?.amountDue || 0);
  // // //console.log()
  // //console.log("lease", leaseDetails);
  // //console.log("propertydata", propertyData);
  // //console.log("leasedetaisldata", leaseDetailsData);

  // useEffect(() => {
  //   if (selectedProperty) {
  //     // Filter the leases for the selected property
  //     const leasesForProperty = leaseDetailsData.filter(
  //       (lease) => lease.property_uid === selectedProperty.property_uid
  //     );

  //     // Find if there's a lease in the "RENEW PROCESSING" state for the selected property
  //     const renewProcessingLease = leasesForProperty.find(
  //       (lease) => lease.lease_status === "RENEW PROCESSING"
  //     );

  //     // If a renew processing lease exists, set it to relatedLease
  //     setRelatedLease(renewProcessingLease || null);
  //   }
  // }, [selectedProperty, leaseDetailsData]);

  // const handleViewRenewProcessingLease = () => {
  //   if (relatedLease) {
  //     setRightPane({
  //       type: "tenantLeases",
  //       state: {
  //         data: relatedLease,
  //         status: "RENEW PROCESSING",
  //         lease: relatedLease,
  //       },
  //     });
  //   }
  // };

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const leaseStatusPriorityMap = {
    ACTIVE: 10,
    "ACTIVE M2M": 11,
    EXPIRED: 15,
    APPROVED: 20,
    "RENEW PROCESSING": 32,
    PROCESSING: 34,
    "RENEW NEW": 42,
    NEW: 44,
    ENDED: 50,
    INACTIVE: 51,
    "RENEW REFUSED": 62,
    REFUSED: 64,
    "RENEW WITHDRAWN": 66,
    WITHDRAWN: 68,
    "RENEW REJECTED": 72,
    REJECTED: 74,
    RESCIND: 80,
  };

  const returnLeaseStatusColor = (status) => {
    // //console.log("status", status);
    const statusColorMapping = {
      ACTIVE: "#3D5CAC",
      "ACTIVE M2M": "#3D5CAC",
      EXPIRED: "#AF8DEB",
      // APPROVED: "#FAD102",
      APPROVED: "#8DA7EB",
      "RENEW PROCESSING": "#76B148",
      PROCESSING: "#76B148",
      "RENEW NEW": "#FAD102",
      NEW: "#FAD102",
      ENDED: "#000000",
      INACTIVE: "#000000",
      "RENEW REFUSED": "#FF8832",
      REFUSED: "#FF8832",
      "RENEW WITHDRAWN": "#FF8832",
      WITHDRAWN: "#FF8832",
      "RENEW REJECTED": "#FA0203",
      REJECTED: "#FA0203",
      RESCIND: "#FA0203",
    };
    return status ? statusColorMapping[status] : "#000";
  };

  const getSortedLeases = (leases) => {
    if (!leases || leases.length === 0) return [];

    const sortedLeases = [...leases].sort((a, b) => {
      // Give highest priority to "ACTIVE" and "ACTIVE M2M" leases
      const isActiveA = a.lease_status === "ACTIVE" || a.lease_status === "ACTIVE M2M";
      const isActiveB = b.lease_status === "ACTIVE" || b.lease_status === "ACTIVE M2M";

      if (isActiveA && !isActiveB) return -1;
      if (!isActiveA && isActiveB) return 1;

      //Return lease with latest date
      if (a.lease_application_date < b.lease_application_date) return 1;
      if (a.lease_application_date > b.lease_application_date) return -1;

      return 0;
    });

    return sortedLeases;
  };

  const handleViewTenantApplication = () => {
    setRightPane({
      type: "tenantApplicationEdit",
      state: {
        data: leaseDetails,
        lease: leaseDetails,
        status: leaseDetails?.lease_status,
        from: "accwidget",
      },
    });
  };

  const handleApprovedClick = () => {
    setRightPane({
      type: "tenantLeases",
      state: {
        data: leaseDetails,
        status: leaseDetails?.lease_status,
        lease: leaseDetails,
        from: "accwidget",
      },
    });
  };

  const handleback = () => {
    // //console.log("go back");
    navigate("/tenantDashboard");
  };

  const getButtonColor = () => {
    if (leaseDetails?.lease_status === "NEW") return "#FAD102"; // Green for NEW
    if (leaseDetails?.lease_status === "PROCESSING") return "#76B148"; // Yellow for PROCESSING
    return balanceDue > 0 ? "#A52A2A" : "#3D5CAC"; // Red for balance due, default for no balance
  };

  const getTextColor = () => {
    if (leaseDetails?.lease_status === "NEW") return "#000000";
    return "#FFFFFF";
  };

  const handlePropertySelect = (property) => {
    // 1
    if (property.lease_status) {
      if (isMobile) {
        setViewRHS(false);
      }
      setSelectedProperty(property);
      handleClose();
    }
  };

  // const uniquePropertiesMap = new Map();
  // propertyData.forEach((property) => {
  //   //lease_status is null don't bother
  //   if (property.lease_status) {

  //     // const propertyLease = leaseDetailsData.find((ld) => ld.property_uid === property.property_uid);
  //     const propertyLease = leaseDetailsData
  //       .filter((ld) => ld.property_uid === property.property_uid)
  //       .sort((a, b) => {
  //         if ((a.lease_status === "ACTIVE" || a.lease_status === "ACTIVE M2M") && (b.lease_status !== "ACTIVE" || b.lease_status !== "ACTIVE M2M")) {
  //           return -1;
  //         } else if ((b.lease_status === "ACTIVE" || b.lease_status === "ACTIVE M2M") && (a.lease_status !== "ACTIVE" || a.lease_status !== "ACTIVE M2M")) {
  //           return 1;
  //         }
  //         return 0;
  //       });
  //     // //console.log("after filtering", propertyLease);
  //     if (propertyLease.length > 0 && !uniquePropertiesMap.has(property.property_uid)) {
  //       uniquePropertiesMap.set(property.property_uid, propertyLease[0]);
  //     }

  //     // if (!uniquePropertiesMap.has(property.property_uid) && propertyLease.lease_status) {
  //     //   uniquePropertiesMap.set(property.property_uid, propertyLease);
  //     // }
  //   }
  // });

  // const uniqueProperties = Array.from(uniquePropertiesMap.values());
  // //console.log("unique property", uniqueProperties);
  // //console.log("lease details test", leaseDetails);

  const sortedPropertiesMap = new Map();
  propertyData.forEach((property) => {
    if (property.lease_status) {
      const propertyLeases = leaseDetailsData.filter((lease) => lease.property_uid === property.property_uid);
      const topProrityLease = getSortedLeases(propertyLeases)[0];

      if (propertyLeases.length > 0 && topProrityLease != null && !sortedPropertiesMap.has(property.property_uid)) {
        sortedPropertiesMap.set(property.property_uid, topProrityLease);
      }
    }
  });

  const sortedLeases = [...sortedPropertiesMap.values()].sort((a, b) => {
    const statusDiff = leaseStatusPriorityMap[a.lease_status] - leaseStatusPriorityMap[b.lease_status];
    if (statusDiff !== 0) return statusDiff;
    return a.lease_uid.localeCompare(b.lease_uid);
  });
  //console.log("sortedPropertiesMap", sortedPropertiesMap, sortedLeases);
  const selectedPropertyData = propertyData.find((property) => property.lt_lease_id === leaseDetails?.lease_uid);

  const earliestDueDate = selectedPropertyData?.earliest_due_date ? new Date(selectedPropertyData.earliest_due_date).toLocaleDateString() : null;

  const totalBalanceDue = balanceDetails.reduce((acc, detail) => acc + parseFloat(detail.amountDue || 0), 0);

  if (!selectedProperty || firstPage) {
    return (
      <Paper sx={{ padding: "30px", backgroundColor: "#f0f0f0", borderRadius: "8px", flex: 1 }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Property Image */}
          <Box sx={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
            <CardMedia component='img' image={selectedProperty?.property_favorite_image || defaultHouseImage} alt='property image' sx={{ width: "100%", height: "auto", maxHeight: "150px" }} />
          </Box>
          <Typography variant='h6' sx={{ fontWeight: "bold", color: "#160449" }}>
            No Property Selected
          </Typography>
          <Typography variant='body1' sx={{ marginTop: "20px", color: "#3D5CAC" }}>
            Please follow the steps below:
          </Typography>
          <ol style={{ textAlign: "left", marginTop: "20px", color: "#160449" }}>
            <li>Go to your profile and fill out your information.</li>
            <li>Search for a property that suits your needs.</li>
            <li>Submit an application for the property.</li>
            <li>Once your application is approved, you'll see your property details here.</li>
          </ol>
          <Button
            variant='contained'
            sx={{
              marginTop: "20px",
              backgroundColor: "#3D5CAC",
              color: "#fff",
              fontWeight: "bold",
            }}
            onClick={() => navigate("/profileEditor")}
          >
            Go to Profile
          </Button>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ padding: "15px", backgroundColor: "#f0f0f0", borderRadius: "8px", flex: 1 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography variant='h6' sx={{ fontWeight: "bold", color: "#160449" }}>
          Account Balance
        </Typography>

        {/* Property Image */}
        <Box sx={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <CardMedia component='img' image={selectedProperty?.property_favorite_image || defaultHouseImage} alt='property image' sx={{ width: "100%", height: "auto", maxHeight: "150px" }} />
        </Box>

        {/* Property Address */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "10px",
            position: "relative",
            width: "100%",
            paddingRight: "20px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            <CircleIcon
              sx={{
                // color: leaseDetails?.lease_status === "INACTIVE" && relatedLease?.lease_status === "ACTIVE"
                // ? returnLeaseStatusColor(relatedLease.lease_status)
                // : returnLeaseStatusColor(leaseDetails?.lease_status),
                color: returnLeaseStatusColor(selectedProperty?.lease_status),
                marginRight: "8px",
                fontSize: "16px",
                flexShrink: 0,
              }}
            />
            <Typography
              sx={{
                fontSize: "22px",
                fontWeight: "600",
                color: "#3D5CAC",
                textAlign: "center",
              }}
            >
              {`${selectedProperty?.property_address}`}
            </Typography>
          </Box>
          <IconButton
            onClick={handleOpen}
            sx={{
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              padding: 0,
            }}
          >
            <KeyboardArrowDownIcon />
          </IconButton>
          {from !== "selectPayment" && (
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
              {sortedLeases.map((property) => {
                const propertyStatusColor = returnLeaseStatusColor(property.lease_status);

                return (
                  <MenuItem key={property.property_uid} onClick={() => handlePropertySelect(property)} sx={{ display: "flex", alignItems: "center" }}>
                    <CircleIcon
                      sx={{
                        color: propertyStatusColor,
                        marginRight: "8px",
                        fontSize: "16px",
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
          variant='h4'
          sx={{
            color: totalBalanceDue > 0 ? "#A52A2A" : "#3D5CAC",
            fontWeight: "bold",
            marginTop: "10px",
          }}
        >
          ${totalBalanceDue.toFixed(2)}
        </Typography>

        <Typography>{`${selectedProperty?.property_uid}`}</Typography>

        {earliestDueDate && (
          <Box sx={{ fontSize: "20px", fontWeight: "600", color: "#160449", marginLeft: "5px", opacity: "50%", alignItems: "center", alignContent: "center" }}>Due: {earliestDueDate}</Box>
        )}

        {/* Payment or Application Button */}
        {(!isMobile || !viewRHS) && from !== "selectPayment" && (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "20px" }}>
            <Button
              variant='contained'
              sx={{
                backgroundColor: getButtonColor(), // Dynamically set button color
                // color: "#fff",
                color: getTextColor(),
                fontWeight: "bold",
                "&:hover": {
                  color: "#fff", // White text color on hover
                },
              }}
              onClick={
                leaseDetails?.lease_status === "NEW" || leaseDetails?.lease_status === "PROCESSING"
                  ? leaseDetails?.lease_status === "PROCESSING"
                    ? handleApprovedClick
                    : handleViewTenantApplication
                  : handleMakePayment
              }
            >
              {leaseDetails?.lease_status === "NEW"
                ? `Applied ${leaseDetails?.lease_application_date?.split(" ")[0]}`
                : leaseDetails?.lease_status === "PROCESSING"
                ? `Approved ${leaseDetails?.lease_application_date?.split(" ")[0]}`
                : balanceDetails?.length > 0
                ? "Make a Payment"
                : "No Payment Due"}
            </Button>
          </Box>
        )}

        {/* Balance Details */}
        {(!isMobile || !viewRHS) && balanceDetails?.length > 0 && !(leaseDetails?.lease_status === "NEW" || leaseDetails?.lease_status === "PROCESSING") && (
          <>
            <Typography sx={{ fontSize: "18px", fontWeight: "bold", color: "#160449", padding: "3px" }}>Balance Details</Typography>
            <Box sx={{ padding: "10px", maxHeight: "200px", overflowY: "auto", width: "100%", backgroundColor: "#f0f0f0", overflowX: "auto" }}>
              <Table sx={{ "& .MuiTableCell-root": { padding: "8px", fontSize: "14px" } }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
                    <TableCell sx={{ padding: "8px", fontWeight: "bold", color: "#160449" }}>Type</TableCell>
                    <TableCell align='right' sx={{ padding: "8px", fontWeight: "bold", color: "#160449" }}>
                      Amount
                    </TableCell>
                    <TableCell sx={{ padding: "8px", fontWeight: "bold", color: "#160449" }}>Description</TableCell>
                    <TableCell sx={{ padding: "8px", fontWeight: "bold", color: "#160449" }}>Due</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {balanceDetails.map((detail, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ padding: "8px" }}>{detail.purchaseType}</TableCell>
                      <TableCell align='right' sx={{ padding: "8px" }}>
                        ${detail.amountDue.toFixed(2)}
                      </TableCell>
                      <TableCell sx={{ padding: "8px" }}>{detail.description}</TableCell>
                      <TableCell sx={{ padding: "8px" }}>{new Date(detail.dueDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </>
        )}

        {(!isMobile || !viewRHS) && leaseDetails?.lease_status === "PROCESSING" && (
          <Button
            variant='contained'
            sx={{
              marginTop: "10px",
              backgroundColor: "#FFC319",
              color: "#fff",
              fontWeight: "bold",
              borderRadius: "5px",
              padding: "8px 16px",
              minWidth: "120px",
              boxShadow: "none",
              textTransform: "none",
              fontSize: "13px",
              "&:hover": {
                backgroundColor: "#3D5CAC",
              },
            }}
            onClick={handleViewTenantApplication}
          >
            VIEW APPLICATION
          </Button>
        )}

        {/* {relatedLease && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleViewRenewProcessingLease}
        >
          View Renewed Lease
        </Button>
      )} */}

        {/* Payment History Button */}
        {(!isMobile || !viewRHS) && from !== "selectPayment" && (leaseDetails?.lease_status === "ACTIVE" || leaseDetails?.lease_status === "ACTIVE M2M") && (
          <Box sx={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
            <Button
              variant='contained'
              sx={{
                marginTop: "10px",
                backgroundColor: "#3D5CAC",
                color: "#fff",
                fontWeight: "bold",
                borderRadius: "5px",
                padding: "8px 16px",
                minWidth: "120px",
                boxShadow: "none",
                textTransform: "none",
                fontSize: "13px",
                "&:hover": {
                  backgroundColor: "#4B6DB8",
                },
              }}
              onClick={onPaymentHistoryNavigate}
            >
              VIEW PAYMENT HISTORY
            </Button>
          </Box>
        )}

        {(!isMobile || !viewRHS) && from === "selectPayment" && (
          <Box sx={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
            <Button
              variant='outlined'
              sx={{
                marginTop: "10px",
                backgroundColor: "#3D5CAC",
                color: "#fff",
                fontWeight: "bold",
                borderRadius: "5px",
                padding: "8px 16px",
                minWidth: "120px",
                boxShadow: "none",
                textTransform: "none",
                fontSize: "13px",
                "&:hover": {
                  backgroundColor: "#4B6DB8",
                },
              }}
              onClick={handleback}
            >
              Go back Dashboard
            </Button>
          </Box>
        )}
      </Box>
      {/* Payment Details and Management Details for NEW or PROCESSING status */}
      {(!isMobile || !viewRHS) && (leaseDetails?.lease_status === "NEW" || leaseDetails?.lease_status === "PROCESSING") && (
        <Box sx={{ padding: "10px" }}>
          <Typography variant='h6' sx={{ fontWeight: "bold", color: "#160449", marginBottom: "20px", fontSize: "20px", textAlign: "center" }}>
            Rent Details
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography sx={{ color: "#3D5CAC" }}>Rent:</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography align='right'>${leaseDetails?.property_listed_rent || "N/A"}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography sx={{ color: "#3D5CAC" }}>Deposit:</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography align='right'>${leaseDetails?.property_deposit || "N/A"}</Typography>
            </Grid>
          </Grid>

          {/* Management Details */}
          <Typography variant='h6' sx={{ fontWeight: "bold", color: "#160449", marginBottom: "20px", marginTop: "5px", fontSize: "20px", textAlign: "center" }}>
            Management Details
          </Typography>

          {/* Business Details */}
          <Stack spacing={1}>
            <Stack direction='row' justifyContent='space-between'>
              <Typography sx={{ color: "#3D5CAC" }}>Name:</Typography>
              <Typography>{leaseDetails?.business_name || "N/A"}</Typography>
            </Stack>
            <Stack direction='row' justifyContent='space-between'>
              <Typography sx={{ color: "#3D5CAC" }}>Email:</Typography>
              <Typography>{leaseDetails?.business_email || "N/A"}</Typography>
            </Stack>
            <Stack direction='row' justifyContent='space-between'>
              <Typography sx={{ color: "#3D5CAC" }}>Phone:</Typography>
              <Typography>{leaseDetails?.business_phone_number || "N/A"}</Typography>
            </Stack>
          </Stack>
        </Box>
      )}
    </Paper>
  );
};

export default TenantAccountBalance;
