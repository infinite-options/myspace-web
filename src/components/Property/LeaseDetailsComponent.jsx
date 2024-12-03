import React, { useEffect, useState, useContext } from "react";
import { Box, Grid, Typography, Button, IconButton, Badge, Card, CardContent, Dialog, DialogActions, DialogTitle, DialogContent, ToolTip } from "@mui/material";
import { RadioGroup, FormControlLabel, Radio } from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { DataGrid } from "@mui/x-data-grid";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import theme from "../../theme/theme";
import FilePreviewDialog from "../Leases/FilePreviewDialog";
import { useNavigate } from "react-router-dom";

import { datePickerSlotProps } from "../../styles";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { ReactComponent as CalendarIcon } from "../../images/datetime.svg";
import useMediaQuery from "@mui/material/useMediaQuery";

import axios from "axios";
import APIConfig from "../../utils/APIConfig";
import { useUser } from "../../contexts/UserContext";
import PropertiesContext from "../../contexts/PropertiesContext";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EndLeaseButton from "../Leases/EndLeaseButton";
import EarlyTerminationDialog from "../Leases/EarlyTerminationDialog";
import FlipIcon from "../TenantDashboard/FlipImage.png"
import { getFeesDueBy, getFeesAvailableToPay, getFeesLateBy, } from "../../utils/fees";


export default function LeaseDetailsComponent({
  currentProperty,
  currentIndex,
  selectedRole,
  handleViewPMQuotesRequested,
  newContractCount,
  sentContractCount,
  handleOpenMaintenancePage,
  onShowSearchManager,
  handleViewContractClick,
  handleManageContractClick,
  handleAppClick,
  getAppColor,
}) {
  console.log("57 - currentProperty---", currentProperty);
  // console.log("---dhyey-- inside new component -", activeLease)
  // const { defaultContractFees, allContracts, currentContractUID, currentContractPropertyUID, isChange, setIsChange, fetchContracts,  } = useContext(LeaseContractContext);
  const { fetchProperties } = useContext(PropertiesContext);
  const [selectedPreviewFile, setSelectedPreviewFile] = useState(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const navigate = useNavigate();
  const [showEndContractDialog, setShowEndContractDialog] = useState(false);
  const [showManagerEndContractDialog, setShowManagerEndContractDialog] = useState(false);
  const [showRenewContractDialog, setShowRenewContractDialog] = useState(false);
  const [showEarlyTerminationDialog, setShowEarlyTerminationDialog] = useState(false);
  const [showRenewedLeaseEarlyTerminationDialog, setShowRenewedLeaseEarlyTerminationDialog] = useState(false);
  const [contractEndNotice, setContractEndNotice] = useState(currentProperty?.lease_end_notice_period ? Number(currentProperty?.lease_end_notice_period) : 30);

  const tenant_detail =
    currentProperty && currentProperty.lease_start && currentProperty.tenant_uid ? `${currentProperty.tenant_first_name} ${currentProperty.tenant_last_name}` : "No Tenant";
  const activeLease = currentProperty?.lease_status;
  const [isChange, setIsChange] = useState(false);
  const [isEndLeasePopupOpen, setIsEndLeasePopupOpen] = useState(false);
  const [renewedLease, setRenewedLease] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  useEffect(() => {    
    let renewed = null;
    currentProperty?.applications?.forEach((application, index) => {
      // if (application.lease_status === "RENEW NEW" || application.lease_status === "RENEW PROCESSING" || application.lease_status === "APPROVED") {
      if (application.lease_status === "APPROVED") {
        console.log("73 - application - ", application);
        // console.log("88 - index - ", index);
        renewed = application;
      }
    });

    setRenewedLease(renewed);
    setIsFlipped(false);

  }, [currentProperty]);

  useEffect(() => {    
    console.log("ROHIT - 86 - renewedLease - ", renewedLease);

  }, [renewedLease]);
  // console.log("currentProperty?.maintenance - ", currentProperty?.maintenance);

  // useEffect(() => {
  //   // console.log("activeLease - ", activeLease);
  //   setContractEndNotice(currentProperty?.lease_end_notice_period ? Number(currentProperty?.lease_end_notice_period) : 30);
  // }, [activeLease]);

  const maintenanceGroupedByStatus = currentProperty?.maintenance?.reduce((acc, request) => {
    const status = request.maintenance_status;

    if (!acc[status]) {
      acc[status] = [];
    }

    acc[status].push(request);

    return acc;
  }, {});

  // console.log("maintenanceGroupedByStatus - ", maintenanceGroupedByStatus);

  const handleFileClick = (file) => {
    setSelectedPreviewFile(file);
    setPreviewDialogOpen(true);
  };

  const handlePreviewDialogClose = () => {
    setPreviewDialogOpen(false);
    setSelectedPreviewFile(null);
  };

  const handleManagerEndContractClick = (endDate) => {
    const formattedDate = endDate.format("MM-DD-YYYY");
    // console.log("handleEndContractClick - formattedDate - ", formattedDate);

    const formData = new FormData();

    // formData.append("contract_uid", currentContractUID);
    formData.append("lease_uid", currentProperty?.lease_uid);
    formData.append("lease_renew_status", "ENDING");
    formData.append("lease_early_end_date", formattedDate);

    const url = `${APIConfig.baseURL.dev}/leaseApplication`;
    // const url = `http://localhost:4000/leaseApplication`;

    fetch(url, {
      method: "PUT",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        } else {
          // console.log("Data updated successfully");
          setIsChange(false);
          fetchProperties();
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  const handleRenewLease = () => {
    let renewalApplication = null;
    let renewalApplicationIndex = null;

    currentProperty?.applications?.forEach((application, index) => {
      if (application.lease_status === "RENEW NEW" || application.lease_status === "RENEW PROCESSING" || application.lease_status === "APPROVED") {
        console.log("88 - application - ", application);
        // console.log("88 - index - ", index);
        renewalApplication = application;
        renewalApplicationIndex = index;
      }
    });

    if (renewalApplication != null && renewalApplication.lease_status === "RENEW NEW") {
      handleAppClick(renewalApplicationIndex);
    } else if (renewalApplication != null && (renewalApplication.lease_status === "RENEW PROCESSING" || renewalApplication.lease_status === "APPROVED")) {
      navigate("/tenantLease", {
        state: {
          page: "renew_lease",
          application: renewalApplication,
          property: currentProperty,
          managerInitiatedRenew: false,
        },
      });
    } else {
      navigate("/tenantLease", {
        state: {
          page: "renew_lease",
          application: currentProperty,
          property: currentProperty,
          managerInitiatedRenew: true,
        },
      });
    }
  };

  return (
    <>
      <Card sx={{ height: "100%", width: "100%" }}>
        {/* <Grid container justifyContent="center">
          <Grid
            container
            item
            xs={12} 
            sm={3.8} 
            sx={{
              display: "flex",
              alignItems: "center", // Align text and icon vertically
              justifyContent: "flex-start", // Align content to the left
              paddingLeft: isMobile? "8%": "0%",
            }}
          > */}
            {/* Title and Flip Icon */}
            {/* <Typography
              sx={{
                color: "#160449",
                fontWeight: theme.typography.primary.fontWeight,
                fontSize: theme.typography.largeFont,
                // whiteSpace: "nowrap", 
                // overflow: "hidden", 
                // textOverflow: "ellipsis", 
                // flexGrow: 1,
                textAlign: "center",
              }}
            >
              {isFlipped ? "Renewed Lease Details" : "Current Lease Details"}
            </Typography>

            <IconButton
              onClick={handleFlip}
              disabled={renewedLease == null}
              sx={{
                padding: 0,
                opacity: renewedLease == null ? 0.2 : 1,
              }}
            >
              <img src={FlipIcon} alt="Flip Icon" style={{ width: "30px", height: "30px" }} />
            </IconButton>
          </Grid>
        </Grid>  */}
        <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px"}}>
          <Typography
            sx={{
              color: theme.typography.primary.black,
              fontWeight: theme.typography.primary.fontWeight,
              fontSize: theme.typography.largeFont,
              textAlign: "center",
              flexGrow: 1,
              paddingLeft: isMobile? "25%": "7.5%",
            }}
          >
            {isFlipped ? "Renewed Lease Details" : "Current Lease Details"}
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
            <IconButton
              onClick={handleFlip}
              disabled={renewedLease == null}
              sx={{
                paddingRight: 10,
                opacity: renewedLease == null ? 0 : 1,
              }}
            >
              <img src={FlipIcon} alt="Flip Icon" style={{ width: "10px", height: "10px" }} />
            </IconButton>
          </Box>
        </Box>
        <CardContent>
          <Grid container direction="row">

          
            <Grid container spacing={3} item xs={9}>
              {/* Property Manager */}
              {selectedRole === "OWNER" && (
                <Grid container item spacing={2}>
                  <Grid item xs={6}>
                    <Typography
                      sx={{
                        color: theme.typography.primary.black,
                        fontWeight: theme.typography.secondary.fontWeight,
                        fontSize: theme.typography.smallFont,
                      }}
                    >
                      Tenant:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    {activeLease ? (
                      <Box display='flex' justifyContent='space-between' alignItems='center'>
                        <Typography
                          sx={{
                            color: theme.typography.primary.black,
                            fontWeight: theme.typography.light.fontWeight,
                            fontSize: theme.typography.smallFont,
                          }}
                        >
                          {tenant_detail}
                        </Typography>
                        <KeyboardArrowRightIcon
                          sx={{ color: "blue", cursor: "pointer" }}
                          onClick={() => {
                            if (activeLease && currentProperty.tenant_uid) {
                              navigate("/ContactsPM", {
                                state: {
                                  contactsTab: "Tenant",
                                  tenantId: currentProperty.tenant_uid,
                                  fromPage: true,
                                  index: currentIndex,
                                },
                              });
                            }
                          }}
                        />
                      </Box>
                    ) : (
                      <Box display='flex' justifyContent='space-between' alignItems='center'>
                        <Typography
                          sx={{
                            color: theme.typography.primary.black,
                            fontWeight: theme.typography.light.fontWeight,
                            fontSize: theme.typography.smallFont,
                          }}
                        >
                          No Tenant Selected
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              )}

              {/* DEBUG - Lease UID */}
              {
                (activeLease || renewedLease != null) && (
                  <Grid container item spacing={2}>
                    <Grid item xs={6}>
                      <Typography
                        sx={{
                          color: theme.typography.primary.black,
                          fontWeight: theme.typography.secondary.fontWeight,
                          fontSize: theme.typography.smallFont,
                        }}
                      >
                        Lease UID:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      {
                        isFlipped === false && (
                          <Box display='flex' alignItems='center' justifyContent={"space-between"}>
                            {currentProperty?.lease_status === "ACTIVE" || currentProperty?.lease_status === "ACTIVE M2M" ? (                    
                                <Typography
                                  sx={{
                                    color: theme.typography.primary.black,
                                    fontWeight: theme.typography.light.fontWeight,
                                    fontSize: theme.typography.smallFont,
                                  }}
                                >
                                  {currentProperty?.lease_uid}
                                </Typography>                                                                                          
                            ) : (
                              <Typography
                                sx={{
                                  color: "#3D5CAC",
                                  fontWeight: theme.typography.secondary.fontWeight,
                                  fontSize: theme.typography.smallFont,
                                }}
                              >
                                No Lease
                              </Typography>
                            )}
                          </Box>
                        )
                      }
                      {
                        isFlipped === true && (
                          <Box display='flex' alignItems='center' justifyContent={"space-between"}>
                            
                                <Typography
                                  sx={{
                                    color: theme.typography.primary.black,
                                    fontWeight: theme.typography.light.fontWeight,
                                    fontSize: theme.typography.smallFont,
                                  }}
                                >
                                  {renewedLease?.lease_uid}
                                </Typography>                                                                                                                      
                          </Box>
                        )
                      }
                      
                    </Grid>
                  </Grid>
                )
              }

              {/* Owner Info for Managers */}
              {selectedRole === "MANAGER" && (
                <Grid container item spacing={2}>
                  <Grid item xs={6}>
                    <Typography
                      sx={{
                        color: theme.typography.primary.black,
                        fontWeight: theme.typography.secondary.fontWeight,
                        fontSize: theme.typography.smallFont,
                      }}
                    >
                      Tenant:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Box display='flex' justifyContent='space-between' alignItems='center'>
                      <Typography
                        sx={{
                          color: theme.typography.primary.black,
                          fontWeight: theme.typography.light.fontWeight,
                          fontSize: theme.typography.smallFont,
                        }}
                      >
                        {tenant_detail}
                      </Typography>
                      <KeyboardArrowRightIcon
                        sx={{ color: "blue", cursor: "pointer" }}
                        onClick={() => {
                          if (activeLease && currentProperty.tenant_uid) {
                            navigate("/ContactsPM", {
                              state: {
                                contactsTab: "Tenant",
                                tenentId: currentProperty.tenant_uid,
                              },
                            });
                          }
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              )}

              <Grid container item spacing={2}>
                <Grid item xs={6}>
                  <Typography
                    sx={{
                      color: theme.typography.primary.black,
                      fontWeight: theme.typography.secondary.fontWeight,
                      fontSize: theme.typography.smallFont,
                    }}
                  >
                    Lease Name:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Box display='flex' alignItems='center' justifyContent={"space-between"}>
                    {currentProperty?.lease_status === "ACTIVE" || currentProperty?.lease_status === "ACTIVE M2M" ? (                    
                        <Typography
                          sx={{
                            color: theme.typography.primary.black,
                            fontWeight: theme.typography.light.fontWeight,
                            fontSize: theme.typography.smallFont,
                          }}
                        >
                          {currentProperty?.property_address}
                        </Typography>                                                                                          
                    ) : (
                      <Typography
                        sx={{
                          color: "#3D5CAC",
                          fontWeight: theme.typography.secondary.fontWeight,
                          fontSize: theme.typography.smallFont,
                        }}
                      >
                        No Lease
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>

              {/* Lease Status */}
              <Grid container item spacing={2}>
                <Grid item xs={6}>
                  <Typography
                    sx={{
                      color: theme.typography.primary.black,
                      fontWeight: theme.typography.secondary.fontWeight,
                      fontSize: theme.typography.smallFont,
                    }}
                  >
                    Lease Status:
                  </Typography>
                </Grid>
                {
                  isFlipped === false && (
                    <Grid item xs={6}>
                      <Box display='flex' alignItems='center' justifyContent={"space-between"}>
                        
                        {currentProperty?.lease_status === "ACTIVE" || currentProperty?.lease_status === "ACTIVE M2M" ? (
                          <>
                            <Typography
                              sx={{
                                color: theme.palette.success.main,
                                fontWeight: theme.typography.secondary.fontWeight,
                                fontSize: theme.typography.smallFont,
                              }}
                            >
                              {currentProperty?.lease_status}
                            </Typography>
                            {currentProperty?.lease_renew_status &&
                              (currentProperty?.lease_renew_status.includes("RENEW") || currentProperty?.lease_renew_status.includes("TERMINATION") || currentProperty?.lease_renew_status === "CANCEL RENEWAL") && (
                                <Typography
                                  sx={{
                                    color: currentProperty?.lease_renew_status?.includes("RENEW") ? "#FF8A00" : "#A52A2A",
                                    fontWeight: theme.typography.secondary.fontWeight,
                                    fontSize: theme.typography.smallFont,
                                  }}
                                >
                                  {currentProperty?.lease_renew_status === "RENEW REQUESTED" || currentProperty?.lease_renew_status === "PM RENEW REQUESTED"  ? "RENEWING" : ""}
                                  {currentProperty?.lease_renew_status === "RENEWED" ? "RENEWED" : ""}
                                  {currentProperty?.lease_renew_status === "EARLY TERMINATION" ? "EARLY TERMINATION" : ""}
                                  {currentProperty?.lease_renew_status === "CANCEL RENEWAL" ? "CANCEL RENEWAL" : ""}
                                </Typography>
                              )}
                              {selectedRole === "MANAGER" && currentProperty?.lease_renew_status &&
                              (currentProperty?.lease_renew_status === "EARLY TERMINATION") && (
                                <KeyboardArrowRightIcon
                                  sx={{ color: "#A52A2A", cursor: "pointer" }}
                                  onClick={() => {
                                    setShowEarlyTerminationDialog(true);
                                  }}
                                />
                              )}
                          </>
                        ) : (
                          <Typography
                            sx={{
                              color: "#3D5CAC",
                              fontWeight: theme.typography.secondary.fontWeight,
                              fontSize: theme.typography.smallFont,
                            }}
                          >
                            No Lease
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  )
                }
                {
                  isFlipped === true && (
                    <Grid item xs={6}>
                      <Box display='flex' alignItems='center' justifyContent={"space-between"}>                                                
                          <>
                            <Typography
                              sx={{
                                color: theme.palette.success.main,
                                fontWeight: theme.typography.secondary.fontWeight,
                                fontSize: theme.typography.smallFont,
                              }}
                            >
                              {renewedLease?.lease_status}
                            </Typography>
                            {renewedLease?.lease_renew_status &&
                              (renewedLease?.lease_renew_status === "EARLY TERMINATION") && (
                                <Typography
                                  sx={{
                                    color: currentProperty?.lease_renew_status?.includes("RENEW") ? "#FF8A00" : "#A52A2A",
                                    fontWeight: theme.typography.secondary.fontWeight,
                                    fontSize: theme.typography.smallFont,
                                  }}
                                >                                                                    
                                  {renewedLease?.lease_renew_status === "EARLY TERMINATION" ? "EARLY TERMINATION" : ""}
                                </Typography>
                            )}                            
                            {selectedRole === "MANAGER" && renewedLease?.lease_renew_status &&
                              (renewedLease?.lease_renew_status === "EARLY TERMINATION") && (
                                <KeyboardArrowRightIcon
                                  sx={{ color: "#A52A2A", cursor: "pointer" }}
                                  onClick={() => {
                                    setShowRenewedLeaseEarlyTerminationDialog(true);
                                  }}
                                />
                              )}
                          </>                        
                      </Box>
                    </Grid>
                  )
                }
                
              </Grid>

              

              {/* Lease Term */}
              {(activeLease || renewedLease != null ) && (
                <Grid container item spacing={2}>
                  <Grid item xs={6}>
                    <Typography
                      sx={{
                        color: theme.typography.primary.black,
                        fontWeight: theme.typography.secondary.fontWeight,
                        fontSize: theme.typography.smallFont,
                      }}
                    >
                      Lease Term:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    {
                      isFlipped === false && (
                        <Typography
                          sx={{
                            color: theme.typography.primary.black,
                            fontWeight: theme.typography.light.fontWeight,
                            fontSize: theme.typography.smallFont,
                          }}
                        >
                          {currentProperty?.lease_start}
                          <span style={{ fontWeight: "bold", margin: "0 10px" }}>to</span>
                          {currentProperty?.lease_end}
                        </Typography>
                      )
                    }
                    {
                      isFlipped === true && (
                        <Typography
                          sx={{
                            color: theme.typography.primary.black,
                            fontWeight: theme.typography.light.fontWeight,
                            fontSize: theme.typography.smallFont,
                          }}
                        >
                          {renewedLease?.lease_start}
                          <span style={{ fontWeight: "bold", margin: "0 10px" }}>to</span>
                          {renewedLease?.lease_end}
                        </Typography>
                      )
                    }                      
                  </Grid>
                </Grid>
              )}

        {(activeLease || renewedLease != null) && (
                <Grid container item spacing={2}>
                  <Grid item xs={6}>
                    <Typography
                      sx={{
                        color: theme.typography.primary.black,
                        fontWeight: theme.typography.secondary.fontWeight,
                        fontSize: theme.typography.smallFont,
                      }}
                    >
                      End Notice Period:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    {
                      isFlipped === false && (
                        <Typography
                          sx={{
                            color: theme.typography.primary.black,
                            fontWeight: theme.typography.light.fontWeight,
                            fontSize: theme.typography.smallFont,
                          }}
                        >
                          {currentProperty?.lease_end_notice_period ? `${currentProperty?.lease_end_notice_period} days` : 'Not specified'}                    
                        </Typography>
                      )
                    }

                    {
                      isFlipped === true && (
                        <Typography
                          sx={{
                            color: theme.typography.primary.black,
                            fontWeight: theme.typography.light.fontWeight,
                            fontSize: theme.typography.smallFont,
                          }}
                        >
                          {renewedLease?.lease_end_notice_period ? `${renewedLease?.lease_end_notice_period} days` : 'Not specified'}                    
                        </Typography>
                      )
                    }
                    
                  </Grid>
                </Grid>
              )}

        {(activeLease || renewedLease != null) && (
                <Grid container item spacing={2}>
                  <Grid item xs={6}>
                    <Typography
                      sx={{
                        color: theme.typography.primary.black,
                        fontWeight: theme.typography.secondary.fontWeight,
                        fontSize: theme.typography.smallFont,                        
                      }}
                    >
                      Lease Renewal:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                  <>
                  {
                    isFlipped === false && (
                      <Typography
                        sx={{
                          color: theme.typography.primary.black,
                          fontWeight: theme.typography.light.fontWeight,
                          fontSize: theme.typography.smallFont,
                        }}
                      >
                        {currentProperty?.lease_m2m == null || currentProperty?.lease_m2m === 0 ? "Not Specified" : ""}
                        {currentProperty?.lease_m2m === 1 ? "Month To Month" : ""}
                      </Typography>
                      )
                  }
                  {
                    isFlipped === true && (
                      <Typography
                        sx={{
                          color: theme.typography.primary.black,
                          fontWeight: theme.typography.light.fontWeight,
                          fontSize: theme.typography.smallFont,
                        }}
                      >
                        {renewedLease?.lease_m2m == null || renewedLease?.lease_m2m === 0 ? "Not Specified" : ""}
                        {renewedLease?.lease_m2m === 1 ? "Month To Month" : ""}
                      </Typography>
                      )
                  }
                  </>                  
                  </Grid>
                </Grid>
              )}

              

              </Grid>
            
              <Grid container item xs={3}>
              {(selectedRole === "OWNER" || selectedRole === "MANAGER") && activeLease && (
                <Grid container item spacing={2} alignContent="space-between" sx={{paddingTop: '15px', paddingBottom: '15px',}}>
                  <Grid
                    item
                    xs={12}
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      // height: "100%",
                    }}
                  >
                    <Button
                      // onClick={() => setIsEndLeasePopupOpen(true)}
                      variant='contained'
                      sx={{
                        backgroundColor: "#FFFFFF",
                        color: "#3D5CAC",
                        cursor: "pointer",
                        paddingX: "10px",
                        textTransform: "none",
                        width: '80%',
                        height: "35px",
                        "&:hover": {
                          backgroundColor: "#FFFFFF",
                        }
                      }}
                      size='small'
                    >
                      <Typography
                        sx={{
                          textTransform: "none",
                          color: "#3D5CAC",
                          fontWeight: theme.typography.secondary.fontWeight,
                          fontSize: isMobile? "10px": "12px",
                          whiteSpace: isMobile ? "normal" : "nowrap", // Allow wrapping on mobile, no wrapping on desktop
    wordWrap: isMobile ? "break-word" : "normal",
                          //   marginLeft: "1%", // Adjusting margin for icon and text
                        }}
                      >
                        {"View Full Lease"}
                      </Typography>
                    </Button>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      // height: "100%",
                    }}
                  >
                    <Button
                      onClick={() => setIsEndLeasePopupOpen(true)}
                      variant='contained'
                      sx={{
                        background: "#A52A2A",
                        color: theme.palette.background.default,
                        cursor: "pointer",
                        paddingX: "10px",
                        textTransform: "none",
                        width: '80%',
                        height: "35px",
                      }}
                      size='small'
                    >
                      <Typography
                        sx={{
                          textTransform: "none",
                          color: "#FFFFFF",
                          fontWeight: theme.typography.secondary.fontWeight,
                          fontSize: isMobile? "10px": "12px",
                          whiteSpace: isMobile ? "normal" : "nowrap", // Allow wrapping on mobile, no wrapping on desktop
    wordWrap: isMobile ? "break-word" : "normal",
                          //   marginLeft: "1%", // Adjusting margin for icon and text
                        }}
                      >
                        {"End Lease"}
                      </Typography>
                    </Button>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      // height: "100%",
                    }}
                  >
                    <Button
                      onClick={() => {
                        handleRenewLease();
                      }}
                      variant='contained'
                      sx={{
                        background: "#3D5CAC",
                        color: theme.palette.background.default,
                        cursor: "pointer",
                        paddingX: "10px",
                        textTransform: "none",
                        width: "80%", // Fixed width for the button
                        height: "35px",
                      }}
                      size='small'
                    >
                      <Typography
                        sx={{
                          textTransform: "none",
                          color: "#FFFFFF",
                          fontWeight: theme.typography.secondary.fontWeight,
                          fontSize: isMobile? "10px": "12px",
                          whiteSpace: isMobile ? "normal" : "nowrap", // Allow wrapping on mobile, no wrapping on desktop
    wordWrap: isMobile ? "break-word" : "normal", // Ensure proper word wrapping on mobile

                          //   marginLeft: "1%", // Adjusting margin for icon and text
                        }}
                      >
                        {/* {"Edit/Renew Lease"} */}
                        {currentProperty?.lease_renew_status === "RENEWED" ? "View Renewed Lease" : "Edit/Renew Lease"}
                      </Typography>
                    </Button>
                  </Grid>
                </Grid>
              )}
              </Grid>
          </Grid>
            
            <Grid container spacing={3}>
            {/* Lease Fees */}
            {isFlipped === false && activeLease && (
              <Grid item xs={12}>
                <Accordion theme={theme} sx={{ backgroundColor: "#e6e6e6", marginTop: "40px" }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='lease-fees-content' id='lease-fees-header'>
                    <Typography
                      sx={{
                        color: theme.typography.primary.black,
                        fontWeight: theme.typography.secondary.fontWeight,
                        fontSize: theme.typography.mediumFont,
                      }}
                    >
                      Lease Fees
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container item spacing={2}>
                      {currentProperty?.lease_fees ? (
                        <FeesSmallDataGrid data={JSON.parse(currentProperty?.lease_fees)} />
                      ) : (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            width: "100%",
                            height: "40px",
                            marginTop: "10px",
                          }}
                        >
                          <Typography
                            sx={{
                              color: "#A9A9A9",
                              fontWeight: theme.typography.secondary.fontWeight,
                        fontSize: theme.typography.mediumFont,
                            }}
                          >
                            No Fees
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            )}
            {isFlipped === true && renewedLease != null && (
              <Grid item xs={12}>
                <Accordion theme={theme} sx={{ backgroundColor: "#e6e6e6", marginTop: "40px" }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='lease-fees-content' id='lease-fees-header'>
                    <Typography
                      sx={{
                        color: theme.typography.primary.black,
                        fontWeight: theme.typography.secondary.fontWeight,
                        fontSize: theme.typography.mediumFont,
                      }}
                    >
                      Lease Fees
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container item spacing={2}>
                      {renewedLease?.lease_fees ? (
                        <FeesSmallDataGrid data={JSON.parse(renewedLease?.lease_fees)} />
                      ) : (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            width: "100%",
                            height: "40px",
                            marginTop: "10px",
                          }}
                        >
                          <Typography
                            sx={{
                              color: "#A9A9A9",
                              fontWeight: theme.typography.secondary.fontWeight,
                              fontSize: theme.typography.mediumFont,
                            }}
                          >
                            No Fees
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            )}

            {/* Lease Documents */}
            {isFlipped === false && activeLease && (
              <Grid item xs={12}>
                {currentProperty?.lease_documents && JSON.parse(currentProperty.lease_documents).length > 0 ? (
                  <Accordion theme={theme} sx={{ backgroundColor: "#e6e6e6", marginTop: "10px" }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='lease-documents-content' id='lease-documents-header'>
                      <Typography
                        sx={{
                          color: theme.typography.primary.black,
                          fontWeight: theme.typography.secondary.fontWeight,
                          fontSize: theme.typography.mediumFont,
                        }}
                      >
                        Lease Documents
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container item>
                        <DocumentSmallDataGrid data={JSON.parse(currentProperty.lease_documents)} handleFileClick={handleFileClick} />
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ) : (
                  <Box sx={{ marginTop: "10px" }}>
                    <Typography
                      sx={{
                        color: theme.typography.primary.black,
                        fontWeight: theme.typography.secondary.fontWeight,
                        fontSize: theme.typography.mediumFont,
                      }}
                    >
                      Lease Documents
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                        height: "40px",
                        marginTop: "10px",
                      }}
                    >
                      <Typography
                        sx={{
                          color: "#A9A9A9",
                          fontWeight: theme.typography.secondary.fontWeight,
                          fontSize: theme.typography.mediumFont,
                        }}
                      >
                        No Documents
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Grid>
            )}
            {isFlipped === true && renewedLease != null && (
              <Grid item xs={12}>
                {renewedLease?.lease_documents && JSON.parse(renewedLease.lease_documents).length > 0 ? (
                  <Accordion theme={theme} sx={{ backgroundColor: "#e6e6e6", marginTop: "10px" }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='lease-documents-content' id='lease-documents-header'>
                      <Typography
                        sx={{
                          color: theme.typography.primary.black,
                          fontWeight: theme.typography.secondary.fontWeight,
                          fontSize: theme.typography.mediumFont,
                        }}
                      >
                        Lease Documents
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container item>
                        <DocumentSmallDataGrid data={JSON.parse(renewedLease.lease_documents)} handleFileClick={handleFileClick} />
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ) : (
                  <Box sx={{ marginTop: "10px" }}>
                    <Typography
                      sx={{
                        color: theme.typography.primary.black,
                        fontWeight: theme.typography.secondary.fontWeight,
                        fontSize: theme.typography.mediumFont,
                      }}
                    >
                      Lease Documents
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                        height: "40px",
                        marginTop: "10px",
                      }}
                    >
                      <Typography
                        sx={{
                          color: "#A9A9A9",
                          fontWeight: theme.typography.secondary.fontWeight,
                          fontSize: theme.typography.mediumFont,
                        }}
                      >
                        No Documents
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Grid>
            )}

            {currentProperty && currentProperty.applications.length > 0 && (
              <>
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography
                      sx={{
                        textTransform: "none",
                        color: theme.typography.primary.black,
                        fontWeight: theme.typography.secondary.fontWeight,
                        fontSize: theme.typography.mediumFont,
                        // paddingRight: "103px",
                      }}
                    >
                      Applications:
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                    >
                      <Badge
                        color='success'
                        badgeContent={currentProperty.applications.filter((app) => ["NEW", "RENEW NEW", "PROCESSING", "RENEW PROCESSING"].includes(app.lease_status)).length}
                        showZero
                        sx={{
                          paddingRight: "50px",
                        }}
                      />
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sx={{ marginLeft: "5px" }}>
                  <Accordion theme={theme} sx={{ backgroundColor: "#e6e6e6", marginLeft: "-5px" }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='panel1-content' id='panel1-header'>
                      <Typography
                        sx={{
                          textTransform: "none",
                          color: theme.typography.primary.black,
                          fontWeight: theme.typography.secondary.fontWeight,
                          fontSize: theme.typography.mediumFont,
                        }}
                      >
                        View All Applications
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        padding: "0px 5px 5px 5px",
                      }}
                    >
                      {currentProperty.applications.map((app, index) => (
                        <Button
                          key={index}
                          onClick={() => handleAppClick(index)}
                          sx={{
                            backgroundColor: getAppColor(app),
                            color: "#FFFFFF",
                            textTransform: "none",
                            width: "100%",
                            height: "70px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            marginBottom: 2,
                            "&:hover, &:focus, &:active": {
                              backgroundColor: getAppColor(app),
                            },
                          }}
                        >
                          {/* Box for full name and date on one line */}
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              width: "100%",
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: theme.typography.smallFont,
                                mr: 1,
                              }}
                            >
                              {app.tenant_first_name + " " + app.tenant_last_name + " "}
                            </Typography>
                            <Typography
                              sx={{
                                fontWeight: "bold",
                                fontSize: theme.typography.smallFont,
                              }}
                            >
                              {app.lease_application_date}
                            </Typography>
                          </Box>

                          {/* Box for status on the next line */}
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              width: "100%",
                            }}
                          >
                            <Typography
                              sx={{
                                fontWeight: "bold",
                                fontSize: theme.typography.smallFont,
                              }}
                            >
                              {app.lease_status}
                            </Typography>
                            {
                              app.lease_status === "APPROVED" && app.lease_renew_status != null && (
                                <Typography
                                  sx={{
                                    fontWeight: "bold",
                                    fontSize: theme.typography.smallFont,
                                  }}
                                >
                                  {` - ${app.lease_renew_status}`}
                                </Typography>
                              )
                            }
                          </Box>
                        </Button>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              </>
            )}

<Grid item xs={12}>
      <UtilitiesSection utilities={currentProperty?.property_utilities} />
    </Grid>

            {isEndLeasePopupOpen && (
              <Dialog open={isEndLeasePopupOpen} onClose={() => setIsEndLeasePopupOpen(false)} maxWidth='md' fullWidth>
                <EndLeaseButton
                  theme={theme}
                  fromProperties={true}
                  leaseDetails={currentProperty} // Pass the lease details as props
                  selectedLeaseId={currentProperty?.lease_uid} // Adjust based on your lease ID reference
                  setIsEndClicked={setIsEndLeasePopupOpen} // Close popup when done
                  handleUpdate={fetchProperties} // Any update handler to refresh data
                />
              </Dialog>
            )}

            <Dialog open={showEarlyTerminationDialog} onClose={() => setShowEarlyTerminationDialog(false)} maxWidth='sm' fullWidth>
              <EarlyTerminationDialog
                theme={theme}                
                fromProperties={true}
                leaseDetails={currentProperty} // Pass the lease details as props
                selectedLeaseId={currentProperty?.lease_uid} // Adjust based on your lease ID reference
                setIsEndClicked={setShowEarlyTerminationDialog} // Close popup when done
                handleUpdate={fetchProperties} // Any update handler to refresh data
                renewedLease={renewedLease}                
                isTerminatingRenewedLease={false}
              />
            </Dialog>
            <Dialog open={showRenewedLeaseEarlyTerminationDialog} onClose={() => setShowRenewedLeaseEarlyTerminationDialog(false)} maxWidth='sm' fullWidth>
              <EarlyTerminationDialog
                theme={theme}                
                fromProperties={true}
                leaseDetails={currentProperty} // Pass the lease details as props
                selectedLeaseId={renewedLease?.lease_uid} // Adjust based on your lease ID reference
                setIsEndClicked={setShowRenewedLeaseEarlyTerminationDialog} // Close popup when done
                handleUpdate={fetchProperties} // Any update handler to refresh data
                renewedLease={renewedLease}                
                isTerminatingRenewedLease={true}
              />
            </Dialog>            

            {/* <Grid container item spacing={2}>
                        <Grid item xs={6}>
                        <Typography
                            sx={{
                                color: theme.typography.primary.black,
                                fontWeight: theme.typography.secondary.fontWeight,
                                fontSize: theme.typography.smallFont,
                            }}
                        >
                            Open Maintenance Tickets:
                        </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            {
                                maintenanceGroupedByStatus && Object.values(maintenanceGroupedByStatus)?.map( status => {
                                    return (
                                        <IconButton 
                                            sx={{marginLeft: "1.5px", paddingTop: "3px"}} 
                                            // onClick={() => {handleOpenMaintenancePage()}}
                                        >
                                            <Badge badgeContent={status?.length || 0} color="error" showZero/>
                                        </IconButton>
                                    );
                                })
                            }
                        </Grid>
                    </Grid> */}
          </Grid>
        </CardContent>
      </Card>
      {previewDialogOpen && selectedPreviewFile && <FilePreviewDialog file={selectedPreviewFile} onClose={handlePreviewDialogClose} />}
      <EndContractDialog open={showEndContractDialog} handleClose={() => setShowEndContractDialog(false)} contract={activeLease} />
      {showManagerEndContractDialog && (
        <Box>
          <ManagerEndContractDialog
            open={showManagerEndContractDialog}
            handleClose={() => setShowManagerEndContractDialog(false)}
            onEndContract={handleManagerEndContractClick}
            noticePeriod={contractEndNotice}
          />
        </Box>
      )}
      <RenewContractDialog open={showRenewContractDialog} handleClose={() => setShowRenewContractDialog(false)} contract={activeLease} />{" "}
    </>
  );
}

export const FeesSmallDataGrid = ({ data }) => {
  const commonStyles = {
    color: theme.typography.primary.black,
    fontWeight: theme.typography.light.fontWeight,
    fontSize: theme.typography.smallFont,
    whiteSpace: "wrap", // Prevents text from wrapping
  };

  const columns = [
    {
      field: "frequency",
      headerName: "Frequency",
      flex: 1.2,
      minWidth: 120, // Ensure column doesn't shrink too much
      renderHeader: (params) => <strong style={{ fontSize: theme.typography.smallFont }}>{params.colDef.headerName}</strong>,
      renderCell: (params) => <Typography sx={commonStyles}>{params.value}</Typography>,
    },
    {
      field: "fee_name",
      headerName: "Name",
      flex: 1,
      minWidth: 90,
      renderHeader: (params) => <strong style={{ fontSize: theme.typography.smallFont }}>{params.colDef.headerName}</strong>,
      renderCell: (params) => <Typography sx={commonStyles}>{params.value}</Typography>,
    },
    {
      field: "charge",
      headerName: "Charge",
      flex: 1,
      minWidth: 100,
      renderHeader: (params) => <strong style={{ fontSize: theme.typography.smallFont }}>{params.colDef.headerName}</strong>,
      renderCell: (params) => {
        const feeType = params.row?.fee_type;
        const charge = params.value;

        return <Typography sx={commonStyles}>{charge}</Typography>;
      },
    },
    {
      field: "fee_type",
      headerName: "Fee Type",
      flex: 0.8,
      minWidth: 110,
      renderHeader: (params) => <strong style={{ fontSize: theme.typography.smallFont }}>{params.colDef.headerName}</strong>,
      renderCell: (params) => {
        const feeType = params.row?.fee_type;
        const fee_type = params.value;

        return <Typography sx={commonStyles}>{fee_type}</Typography>;
      },
    },
    {
      field: "due_by",
      headerName: "Due By",
      flex: 3,
      minWidth: 130,
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
      renderCell: (params) => (
        <Typography>
          {/* {params.row.frequency === "Monthly" && `${params.row.due_by}${getDateAdornmentString(params.row.due_by)} of every month`}
        {params.row.frequency === "One Time" && `${params.row.due_by_date}`}
        {(params.row.frequency === "Weekly"  || params.row.frequency === "Bi-Weekly") && `${valueToDayMap.get(params.row.due_by)}`} */}
          {getFeesDueBy(params.row)}
          { console.log("ROHIT - 1245 - params.row - ", params.row)}
        </Typography>
      ),
    },
    {
      field: "available_topay",
      headerName: "Available To Pay",
      flex: 3,
      minWidth: 160,
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
      renderCell: (params) => (
        <Typography>
          {/* { (
            params.row.frequency === "Monthly" || 
            params.row.frequency === "Weekly" ||
            params.row.frequency === "Bi-Weekly" ||
            params.row.frequency === "One Time"
          )
          && `${params.row.available_topay} days before`} */}
          {getFeesAvailableToPay(params.row)}
        </Typography>
      ),
    },
    {
      field: "late_by",
      headerName: "Late By",
      flex: 1.4,
      minWidth: 160,
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
      renderCell: (params) => (
        <Typography>
          {/* {(
            params.row.frequency === "Monthly" || 
            params.row.frequency === "Weekly" ||
            params.row.frequency === "Bi-Weekly" ||
            params.row.frequency === "One Time"
          ) 
        && `${params.row.available_topay} days after`} */}
          {getFeesLateBy(params.row)}
        </Typography>
      ),
    },
    {
      field: "late_fee",
      headerName: "Late Fee",
      flex: 0.7,
      minWidth: 120,
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
      renderCell: (params) => <Typography>{params.row.late_fee !== ""  ? `$ ${params.row.late_fee}` : "-"}</Typography>,
    },
    {
      field: "perDay_late_fee",
      flex: 1,
      minWidth: 120,
      renderHeader: (params) => (
        <strong style={{ lineHeight: 1.2, display: "inline-block", textAlign: "center" }}>
          Late Fee <br /> Per Day
        </strong>
      ),
      renderCell: (params) => <Typography>{params.row.perDay_late_fee !== "" ? `$ ${params.row.perDay_late_fee}` : "-"}</Typography>,
    },    
  ];

  // Adding a unique id to each row using map if the data doesn't have an id field
  const rowsWithId = data.map((row, index) => ({
    ...row,
    id: row.id ? row.id : index, // Use the existing id if available
  }));

  return (
    // <div style={{ width: "100%", overflowX: "auto" }}>      
    <Grid item xs={12} sx={{ overflowX: 'auto',}}>
      <DataGrid
        rows={rowsWithId}
        columns={columns}
        sx={{
          marginY: "5px",
          "& .MuiDataGrid-columnHeaders": {
            minHeight: "35px !important",
            maxHeight: "35px !important",
            height: "auto",
          },
        }}
        autoHeight
        rowHeight={60}
        hideFooter={true} // Hides pagination
        disableColumnMenu // Disable column menu for cleaner UI
      />
    </Grid>
    
  );
};

export const DocumentSmallDataGrid = ({ data, handleFileClick }) => {
  const commonStyles = {
    color: theme.typography.primary.black,
    fontWeight: theme.typography.light.fontWeight,
    fontSize: theme.typography.smallFont,
  };

  console.log("ROHIT - 1345 - data - ", data);

  const DocColumn = [
    {
      field: "filename",
      headerName: "Filename",
      renderCell: (params) => {
        return (
          <Box
            sx={{
              ...commonStyles,
              cursor: "pointer", // Change cursor to indicate clickability
              color: "#3D5CAC",
            }}
            onClick={() => handleFileClick(params.row)}
          >
            {params.row.filename}
          </Box>
        );
      },
      flex: 2.2,
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
    },
    {
      field: "contentType",
      headerName: "Content Type",
      flex: 1.8,
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
      renderCell: (params) => <Typography sx={commonStyles}>{params.value}</Typography>,
    },
    {
      field: "fileType",
      headerName: "File Type",
      flex: 1.8,
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
      renderCell: (params) => <Typography sx={commonStyles}>{params.value}</Typography>,
    },
  ];

  const rowsWithId = data.map((row, index) => ({
    ...row,
    id: row.id ? index : index,
  }));

  return (
    <DataGrid
      rows={rowsWithId}
      columns={DocColumn}
      hideFooter={true}
      autoHeight
      rowHeight={35}
      sx={{
        marginY: "5px",
        overflow: "auto",
        "& .MuiDataGrid-columnHeaders": {
          minHeight: "35px !important",
          maxHeight: "35px !important",
          height: 35,
        },
      }}
    />
  );
};

const EndContractDialog = ({ open, handleClose, contract }) => {
  const ONE_DAY_MS = 1000 * 60 * 60 * 24;

  const [contractEndDate, setContractEndDate] = useState(contract?.contract_end_date ? new Date(contract?.contract_end_date) : null);
  const today = new Date();
  const noticePeriod = contract?.contract_notice_period || 30;
  // console.log("noticePeriod - ", noticePeriod);
  const [selectedEndDate, setSelectedEndDate] = useState(dayjs(contractEndDate));

  useEffect(() => {
    // console.log("selectedEndDate - ", selectedEndDate);
    setContractEndDate(contract?.contract_end_date ? new Date(contract?.contract_end_date) : null);
  }, [contract]);

  useEffect(() => {
    // console.log("selectedEndDate - ", selectedEndDate);
    // console.log("contractEndDate - noticePeriod - ", new Date(contractEndDate?.getTime() - noticePeriod * ONE_DAY_MS));
    setSelectedEndDate(dayjs(contractEndDate));
  }, [contractEndDate]);

  let contractRenewStatus = "";

  const handleEndContract = (event) => {
    event.preventDefault();

    if (selectedEndDate.toDate() >= contractEndDate) {
      if (today <= new Date(contractEndDate.getTime() - noticePeriod * ONE_DAY_MS)) {
        contractRenewStatus = "ENDING";
      } else {
        contractRenewStatus = "EARLY TERMINATION";
      }
    } else {
      contractRenewStatus = "EARLY TERMINATION";
    }

    const formData = new FormData();
    formData.append("contract_uid", contract.contract_uid);
    // formData.append("contract_status", "ENDING");
    formData.append("contract_renew_status", contractRenewStatus);
    if (contractRenewStatus === "EARLY TERMINATION") {
      formData.append("contract_early_end_date", selectedEndDate.format("MM-DD-YYYY"));
    }

    try {
      fetch(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/contracts`, {
        method: "PUT",
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          } else {
            console.log("Data added successfully");
          }
        })
        .catch((error) => {
          console.error("There was a problem with the fetch operation:", error);
        });
    } catch (error) {
      console.error(error);
    }

    handleClose();
  };

  return (
    <form onSubmit={handleEndContract}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth='xl'
        sx={{
          "& .MuiDialog-paper": {
            width: "60%",
            maxWidth: "none",
          },
        }}
      >
        <DialogTitle sx={{ justifyContent: "center" }}>
          End Current Contract
          <IconButton
            onClick={handleClose}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "#3D5CAC",
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container>
            <Grid container item xs={12} sx={{ marginTop: "10px" }}>
              <Grid item xs={12}>
                <Typography sx={{ fontWeight: "bold", color: "#3D5CAC" }}>This contract is scheduled to end on {contract?.contract_end_date}.</Typography>
              </Grid>
            </Grid>
            <Grid item xs={12} sx={{ marginTop: "15px" }}>
              <Typography sx={{ width: "auto" }}>Please select the desired end date.</Typography>
            </Grid>
          </Grid>
          <Grid container item xs={3} sx={{ marginTop: "10px" }}>
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: "bold", color: "#3D5CAC" }}>End Date</Typography>
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={selectedEndDate}
                  // minDate={minEndDate}
                  onChange={(v) => setSelectedEndDate(v)}
                  slots={{
                    openPickerIcon: CalendarIcon,
                  }}
                  slotProps={datePickerSlotProps}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
          <Grid container>
            <Grid container item xs={12} sx={{ marginTop: "10px" }}>
              <Grid item xs={12}>
                {/* <Typography sx={{fontWeight: 'bold', color: 'red'}}>
                                    DEBUG - notice period is 30 days by default if not specified.
                                </Typography> */}
                <Typography sx={{ fontWeight: "bold", color: "red" }}>Contract UID - {contract?.contract_uid}</Typography>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button
            type='submit'
            onClick={handleEndContract}
            sx={{
              "&:hover": {
                backgroundColor: "#160449",
              },
              backgroundColor: "#3D5CAC",
              color: "#FFFFFF",
              fontWeight: "bold",
            }}
          >
            End Contract
          </Button>
          <Button
            onClick={handleClose}
            sx={{
              "&:hover": {
                backgroundColor: "#160449",
              },
              backgroundColor: "#3D5CAC",
              color: "#FFFFFF",
              fontWeight: "bold",
            }}
          >
            Keep Existing Contract
          </Button>
        </DialogActions>
      </Dialog>
    </form>
  );
};

function ManagerEndContractDialog({ open, handleClose, onEndContract, noticePeriod }) {
  const noticePeriodDays = parseInt(noticePeriod, 10);
  const minEndDate = dayjs().add(noticePeriodDays, "day");
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  // console.log("minEndDate - ", minEndDate);
  const formattedMinEndDate = minEndDate.format("MM/DD/YYYY");

  const [earlyEndDate, setEarlyEndDate] = useState(minEndDate);

  const handleEndContract = (event) => {
    event.preventDefault();

    onEndContract(earlyEndDate);
    handleClose();
  };

  return (
    <form onSubmit={handleEndContract}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth='xl'
        sx={{
          "& .MuiDialog-paper": {
            width: isMobile ? "75%" : "60%",
            maxWidth: "none",
          },
        }}
      >
        <DialogTitle sx={{ justifyContent: "center" }}>End Current Contract</DialogTitle>
        <DialogContent>
          <Grid container>
            <Grid item xs={12}>
              {/* <Typography sx={{width: 'auto', color: 'red'}}>
                {`DEBUG - Notice period is 30 days by default if not specified.`}
            </Typography> */}
              <Typography sx={{ width: "auto" }}>
                {`The notice period to end this contract is ${noticePeriod} days. The earliest possible end date is ${formattedMinEndDate}.`}
              </Typography>
            </Grid>
            <Grid container item xs={12} md={5} sx={{ marginTop: "10px" }}>
              <Grid item xs={12}>
                <Typography sx={{ fontWeight: "bold", color: "#3D5CAC" }}>Please select contract end date</Typography>
              </Grid>
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={earlyEndDate}
                    minDate={minEndDate}
                    onChange={(v) => setEarlyEndDate(v)}
                    slots={{
                      openPickerIcon: CalendarIcon,
                    }}
                    slotProps={datePickerSlotProps}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
            <Grid item xs={12} sx={{ marginTop: "15px" }}>
              <Typography sx={{ width: "auto" }}>{`Are you sure you want to end this contract?`}</Typography>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button
            type='submit'
            onClick={handleEndContract}
            sx={{
              "&:hover": {
                backgroundColor: "#160449",
              },
              backgroundColor: "#3D5CAC",
              color: "#FFFFFF",
              fontWeight: "bold",
            }}
          >
            Yes
          </Button>
          <Button
            onClick={handleClose}
            sx={{
              "&:hover": {
                backgroundColor: "#160449",
              },
              backgroundColor: "#3D5CAC",
              color: "#FFFFFF",
              fontWeight: "bold",
            }}
          >
            No
          </Button>
        </DialogActions>
      </Dialog>
    </form>
  );
}

const RenewContractDialog = ({ open, handleClose, contract }) => {
  const { getProfileId } = useUser();
  const ONE_DAY_MS = 1000 * 60 * 60 * 24;

  const [contractEndDate, setContractEndDate] = useState(contract?.contract_end_date ? new Date(contract?.contract_end_date) : null);
  const today = new Date();
  const noticePeriod = contract?.contract_notice_period || 30;
  // console.log("noticePeriod - ", noticePeriod);
  const [selectedEndDate, setSelectedEndDate] = useState(dayjs(contractEndDate));

  useEffect(() => {
    // console.log("selectedEndDate - ", selectedEndDate);
    setContractEndDate(contract?.contract_end_date ? new Date(contract?.contract_end_date) : null);
  }, [contract]);

  useEffect(() => {
    // console.log("selectedEndDate - ", selectedEndDate);
    // console.log("contractEndDate - noticePeriod - ", new Date(contractEndDate?.getTime() - noticePeriod * ONE_DAY_MS));
    setSelectedEndDate(dayjs(contractEndDate));
  }, [contractEndDate]);

  const sendAnnouncement = async () => {
    const currentDate = new Date();
    const formattedDate = `${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}-${currentDate.getFullYear()}`;
    const announcementTitle = `Contract Renewal Request`;
    const propertyUnit = contract.property_unit ? " Unit - " + contract.property_unit : "";
    const announcementMsg = `The owner(${contract.owner_uid}) of ${contract.property_address}${propertyUnit} has requested a renewal of the Lease contract.`;

    let annProperties = JSON.stringify({ [contract.business_uid]: [contract.property_uid] });

    let announcement_data = JSON.stringify({
      announcement_title: announcementTitle,
      announcement_msg: announcementMsg,
      announcement_sender: getProfileId(),
      announcement_date: formattedDate,
      announcement_properties: annProperties,
      announcement_mode: "CONTRACT",
      announcement_receiver: [contract.business_uid],
      announcement_type: ["App", "Email", "Text"],
    });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/announcements/${getProfileId()}`,
      // url: `http://localhost:4000/announcements/${ownerId}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: announcement_data,
    };

    try {
      const response = await axios.request(config);
      console.log(JSON.stringify(response.data));
    } catch (error) {
      console.log(error);
    }
  };

  const handleRenewContract = (event) => {
    event.preventDefault();

    const contractRenewStatus = "RENEW REQUESTED";

    const formData = new FormData();
    formData.append("contract_uid", contract.contract_uid);
    formData.append("contract_renew_status", contractRenewStatus);

    try {
      fetch(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/contracts`, {
        method: "PUT",
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          } else {
            console.log("Data added successfully");
          }
        })
        .catch((error) => {
          console.error("There was a problem with the fetch operation:", error);
        });
    } catch (error) {
      console.error(error);
    }

    sendAnnouncement();

    handleClose();
  };

  return (
    <form onSubmit={handleRenewContract}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth='xl'
        sx={{
          "& .MuiDialog-paper": {
            width: "60%",
            maxWidth: "none",
          },
        }}
      >
        <DialogTitle sx={{ justifyContent: "center" }}>
          Renew Current Contract
          <IconButton
            onClick={handleClose}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "#3D5CAC",
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container>
            <Grid container item xs={12} sx={{ marginTop: "10px" }}>
              <Grid item xs={12}>
                <Typography sx={{ fontWeight: "bold", color: "#3D5CAC" }}>This contract is scheduled to end on {contract?.contract_end_date}.</Typography>
              </Grid>
            </Grid>
            <Grid item xs={12} sx={{ marginTop: "15px" }}>
              <Typography sx={{ width: "auto" }}>Would you like to renew this contract with {contract?.business_name}?</Typography>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button
            type='submit'
            onClick={handleRenewContract}
            sx={{
              "&:hover": {
                backgroundColor: "#160449",
              },
              backgroundColor: "#3D5CAC",
              color: "#FFFFFF",
              fontWeight: "bold",
            }}
          >
            Request Renewal
          </Button>
          <Button
            onClick={handleClose}
            sx={{
              "&:hover": {
                backgroundColor: "#160449",
              },
              backgroundColor: "#3D5CAC",
              color: "#FFFFFF",
              fontWeight: "bold",
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </form>
  );
};

const UtilitiesSection = ({ utilities }) => {
  if (!utilities || utilities.length === 0) {
    return (
      <Box sx={{ marginTop: "15px" }}>
        <Typography>No utilities specified.</Typography>
      </Box>
    );
  }

  // Parse the stringified JSON data
  const parsedUtilities = JSON.parse(utilities);

  return (
    <Box sx={{ marginTop: "15px" }}>
      <Typography
        sx={{
          textTransform: "none",
          fontWeight: "bold",
          fontSize: "16px",
          marginBottom: "10px",
        }}
      >
        Utilities Paid By:
      </Typography>
      <Grid container spacing={2}>
        {parsedUtilities.map((utility, index) => (
          <Grid container item spacing={2} key={index} alignItems="center">
            {/* Utility Name */}
            <Grid item xs={4}>
              <Typography
                sx={{
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                {utility.utility_desc.charAt(0).toUpperCase() + utility.utility_desc.slice(1)}
              </Typography>
            </Grid>

            {/* Radio Buttons */}
            <Grid item xs={8}>
              <RadioGroup
                row
                value={utility.utility_payer.toLowerCase()} // Set selected value
              >
                <FormControlLabel
                  value="owner"
                  control={<Radio disabled={utility.utility_payer.toLowerCase() !== "owner"} sx={{
                    color: "black", // Unselected radio button color
                    "&.Mui-checked": {
                      color: "black", // Selected radio button color
                    },
                  }}/>}
                  label="Owner"
                  
                />
                <FormControlLabel
                  value="tenant"
                  control={<Radio disabled={utility.utility_payer.toLowerCase() !== "tenant"} sx={{
                    color: "black", // Unselected radio button color
                    "&.Mui-checked": {
                      color: "black", // Selected radio button color
                    },
                  }}/>}
                  label="Tenant"
                />
              </RadioGroup>
            </Grid>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};


