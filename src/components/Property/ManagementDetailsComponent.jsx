import React, { useEffect, useState, useContext } from "react";
import { Box, Grid, Typography, Button, IconButton, Badge, Card, CardContent, Dialog, DialogActions, DialogTitle, DialogContent, ToolTip } from "@mui/material";
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
import ManagementContractContext from "../../contexts/ManagementContractContext";
import PropertiesContext from "../../contexts/PropertiesContext";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function ManagementDetailsComponent({
  activeContract,
  renewContract,
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
}) {
  console.log("---dhyey-- inside new component -", renewContract, "current property contract - ", currentProperty);
  const { defaultContractFees, allContracts, currentContractUID, currentContractPropertyUID, isChange, setIsChange, fetchContracts } = useContext(ManagementContractContext);
  const { fetchProperties } = useContext(PropertiesContext);
  const [selectedPreviewFile, setSelectedPreviewFile] = useState(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const navigate = useNavigate();
  const [showEndContractDialog, setShowEndContractDialog] = useState(false);
  const [showManagerEndContractDialog, setShowManagerEndContractDialog] = useState(false);
  const [showRenewContractDialog, setShowRenewContractDialog] = useState(false);
  const [contractEndNotice, setContractEndNotice] = useState(activeContract?.contract_end_notice_period ? Number(activeContract?.contract_end_notice_period) : 30);

  // console.log("currentProperty?.maintenance - ", currentProperty?.maintenance);

  useEffect(() => {
    // console.log("activeContract - ", activeContract);
    setContractEndNotice(activeContract?.contract_end_notice_period ? Number(activeContract?.contract_end_notice_period) : 30);
  }, [activeContract]);

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
    formData.append("contract_uid", activeContract?.contract_uid);
    formData.append("contract_renew_status", "ENDING");
    formData.append("contract_early_end_date", formattedDate);

    const url = `${APIConfig.baseURL.dev}/contracts`;
    // const url = `http://localhost:4000/contracts`;

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

  return (
    <>
      <Card sx={{ backgroundColor: theme.palette.form.main, height: "100%" }}>
        <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography
            sx={{
              color: theme.typography.primary.black,
              fontWeight: theme.typography.primary.fontWeight,
              fontSize: theme.typography.largeFont,
              textAlign: "center",
              paddingLeft: "100px",
              // flexGrow: 1
            }}
          >
            Management Details
          </Typography>
          {selectedRole === "OWNER" && (
            <Box sx={{ display: "flex", justifyContent: "space-evenly", alignItems: "center" }}>
              <IconButton
                onClick={() => {
                  handleViewPMQuotesRequested(1);
                }}
              >
                <SearchIcon />
              </IconButton>
              <IconButton
                onClick={() => {
                  // console.log("newContractCount - ", newContractCount);
                  if (newContractCount === 0) {
                    onShowSearchManager();
                  } else {
                    handleViewPMQuotesRequested(0);
                  }
                }}
                sx={{ marginRight: "10px" }}
              >
                <Badge badgeContent={newContractCount || 0} color='error' showZero />
              </IconButton>
              <IconButton
                onClick={() => {
                  if (sentContractCount && sentContractCount > 0) {
                    handleViewPMQuotesRequested(0);
                  }
                }}
                sx={{ marginRight: "10px" }}
              >
                <Badge badgeContent={sentContractCount || 0} color='warning' showZero />
              </IconButton>
            </Box>
          )}
        </Box>
        <CardContent>
          <Grid container spacing={3}>
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
                    Property Manager:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  {activeContract ? (
                    <Box display='flex' justifyContent='space-between' alignItems='center'>
                      <Typography
                        sx={{
                          color: theme.typography.primary.black,
                          fontWeight: theme.typography.light.fontWeight,
                          fontSize: theme.typography.smallFont,
                        }}
                      >
                        {activeContract?.business_name}
                      </Typography>
                      <KeyboardArrowRightIcon
                        sx={{ color: "blue", cursor: "pointer", fontSize: "18px" }}
                        onClick={() => {
                          if (activeContract && activeContract.business_uid) {
                            navigate("/ContactsPM", {
                              state: {
                                contactsTab: "Manager",
                                managerId: activeContract.business_uid,
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
                        No Manager Selected
                      </Typography>
                    </Box>
                  )}
                </Grid>
              </Grid>
            )}

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
                    Property Owner:
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
                      {currentProperty ? `${currentProperty.owner_first_name} ${currentProperty.owner_last_name}` : "-"}
                    </Typography>
                    <KeyboardArrowRightIcon
                      sx={{ color: "blue", cursor: "pointer", fontSize: "18px" }}
                      onClick={() => {
                        if (activeContract && activeContract.business_uid) {
                          navigate("/ContactsPM", {
                            state: {
                              contactsTab: "Owner",
                              ownerId: currentProperty.owner_uid,
                            },
                          });
                        }
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            )}

            {/* Contract name */}
            <Grid container item spacing={2}>
              <Grid item xs={6}>
                <Typography
                  sx={{
                    color: theme.typography.primary.black,
                    fontWeight: theme.typography.secondary.fontWeight,
                    fontSize: theme.typography.smallFont,
                  }}
                >
                  Contract Name:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Box display='flex' alignItems='center' justifyContent={"space-between"}>
                  <Typography
                    sx={{
                      color: theme.typography.primary.black,
                      fontWeight: theme.typography.light.fontWeight,
                      fontSize: theme.typography.smallFont,
                    }}
                  >
                    {activeContract?.contract_name}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Contract Status */}
            <Grid container item spacing={2}>
              <Grid item xs={6}>
                <Typography
                  sx={{
                    color: theme.typography.primary.black,
                    fontWeight: theme.typography.secondary.fontWeight,
                    fontSize: theme.typography.smallFont,
                  }}
                >
                  Contract Status:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Box display='flex' alignItems='center' justifyContent={"space-between"}>
                  {activeContract?.contract_status === "ACTIVE" ? (
                    <>
                      <Typography
                        sx={{
                          color: theme.palette.success.main,
                          fontWeight: theme.typography.secondary.fontWeight,
                          fontSize: theme.typography.smallFont,
                        }}
                      >
                        ACTIVE
                      </Typography>
                      {activeContract?.contract_renew_status && (activeContract?.contract_renew_status === "ENDING" || activeContract?.contract_renew_status.includes("EARLY") || activeContract?.contract_renew_status.includes("RENEW")) && 
                          (
                              <Typography
                                  sx={{
                                      color: activeContract?.contract_renew_status?.includes("RENEW")? "#FF8A00" : "#A52A2A",
                                      fontWeight: theme.typography.secondary.fontWeight,
                                      fontSize: theme.typography.smallFont,
                                  }}
                              >
                                  {activeContract?.contract_renew_status?.includes("RENEW") ? " RENEWING" : activeContract?.contract_renew_status }
                              </Typography>
                          )
                      }
                      {/* {activeContract?.contract_renew_status && (renewContract?.contract_status === "SENT" || renewContract?.contract_status.includes("RENEW")) && (
                        <Typography
                          sx={{
                            color: renewContract?.contract_status === "SENT" ? "#FF8A00" : "#A52A2A",
                            fontWeight: theme.typography.secondary.fontWeight,
                            fontSize: theme.typography.smallFont,
                          }}
                        >
                          {renewContract?.contract_status === "SENT" ? "RENEWING" : renewContract?.contract_status}
                        </Typography>
                      )} */}
                    </>
                  ) : (
                    <Typography
                      sx={{
                        color: "#3D5CAC",
                        fontWeight: theme.typography.secondary.fontWeight,
                        fontSize: theme.typography.smallFont,
                      }}
                    >
                      No Contract
                    </Typography>
                  )}
                  {/* {currentProperty?.contract_status === "ACTIVE" && selectedRole === "MANAGER" && 
                              <Button
                                  onClick={() => {                                    
                                          handleManageContractClick(currentProperty.contract_uid, currentProperty.contract_property_id )                                                                        
                                  }}
                                  variant='outlined'
                                  sx={{
                                      background: "#3D5CAC",
                                      color: theme.palette.background.default,
                                      cursor: "pointer",
                                      paddingX:"10px",
                                      textTransform: "none",
                                      maxWidth: "120px", // Fixed width for the button
                                      maxHeight: "100%",
                                  }}
                                  size='small'
                              >
                              <Typography
                                  sx={{
                                  textTransform: "none",
                                  color: "#FFFFFF",
                                  fontWeight: theme.typography.secondary.fontWeight,
                                  fontSize: "12px",
                                  whiteSpace: "nowrap",
                                  //   marginLeft: "1%", // Adjusting margin for icon and text
                                  }}
                              >
                                  {"Manage Contract"}
                              </Typography>
                              </Button>} */}
                </Box>
              </Grid>
            </Grid>

            {/* Contract Term */}
            {activeContract && (
              <Grid container item spacing={2}>
                <Grid item xs={6}>
                  <Typography
                    sx={{
                      color: theme.typography.primary.black,
                      fontWeight: theme.typography.secondary.fontWeight,
                      fontSize: theme.typography.smallFont,
                    }}
                  >
                    Contract Term:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    sx={{
                      color: theme.typography.primary.black,
                      fontWeight: theme.typography.light.fontWeight,
                      fontSize: theme.typography.smallFont,
                    }}
                  >
                    {activeContract?.contract_start_date}
                    <span style={{ fontWeight: "bold", margin: "0 10px" }}>to</span>
                    {activeContract?.contract_end_date}
                  </Typography>
                </Grid>
              </Grid>
            )}

            {/* contract end notice */}
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
                <Box display='flex' alignItems='center' justifyContent={"space-between"}>
                  <Typography
                    sx={{
                      color: theme.typography.primary.black,
                      fontWeight: theme.typography.light.fontWeight,
                      fontSize: theme.typography.smallFont,
                    }}
                  >
                    {activeContract?.contract_end_notice_period ? activeContract?.contract_end_notice_period : "Not Specified"}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* contract renew */}
            <Grid container item spacing={2}>
              <Grid item xs={6}>
                <Typography
                  sx={{
                    color: theme.typography.primary.black,
                    fontWeight: theme.typography.secondary.fontWeight,
                    fontSize: theme.typography.smallFont,
                  }}
                >
                  Contract Renewal:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Box display='flex' alignItems='center' justifyContent={"space-between"}>
                  <Typography
                    sx={{
                      color: theme.typography.primary.black,
                      fontWeight: theme.typography.light.fontWeight,
                      fontSize: theme.typography.smallFont,
                    }}
                  >
                    {activeContract?.contract_m2m === 1 ? "Month To Month" : "Automatic"}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {(selectedRole === "OWNER" || selectedRole === "MANAGER") && activeContract && (
              <Grid container item spacing={2} sx={{ marginTop: "3px", marginBottom: "5px" }}>
                <Grid
                  item
                  xs={6}
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <Button
                    onClick={() => {
                      if (selectedRole === "OWNER") {
                        setShowEndContractDialog(true);
                      } else if (selectedRole === "MANAGER") {
                        setShowManagerEndContractDialog(true);
                      }
                    }}
                    variant='contained'
                    sx={{
                      background: "#3D5CAC",
                      color: theme.palette.background.default,
                      cursor: "pointer",
                      paddingX: "10px",
                      textTransform: "none",
                      maxWidth: "120px", // Fixed width for the button
                      maxHeight: "100%",
                    }}
                    size='small'
                  >
                    <Typography
                      sx={{
                        textTransform: "none",
                        color: "#FFFFFF",
                        fontWeight: theme.typography.secondary.fontWeight,
                        fontSize: "12px",
                        whiteSpace: "nowrap",
                        //   marginLeft: "1%", // Adjusting margin for icon and text
                      }}
                    >
                      {"End Contract"}
                    </Typography>
                  </Button>
                </Grid>
                <Grid
                  item
                  xs={6}
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <Button
                    onClick={() => {
                      if (selectedRole === "OWNER") {
                        if (renewContract) {
                            if(renewContract.contract_status === "SENT" || renewContract.contract_status === "APPROVED"){
                              handleManageContractClick(renewContract.contract_uid, currentProperty.contract_property_id);
                            }
                        } else {
                          setShowRenewContractDialog(true);
                        }
                      } else if (selectedRole === "MANAGER") {
                        if (renewContract) {
                          handleManageContractClick(renewContract.contract_uid, currentProperty.contract_property_id);
                        } else {
                          handleManageContractClick(activeContract.contract_uid, currentProperty.contract_property_id);
                        }
                      }
                    }}
                    variant='contained'
                    disabled={(renewContract?.contract_status === "NEW" || renewContract?.contract_status === "REJECTED") && selectedRole === "OWNER"}
                    sx={{
                      background: "#3D5CAC",
                      color: theme.palette.background.default,
                      cursor: "pointer",
                      paddingX: "10px",
                      textTransform: "none",
                      maxWidth: "100%", // Fixed width for the button
                      maxHeight: "100%",
                    }}
                    size='small'
                  >
                    <Typography
                      sx={{
                        textTransform: "none",
                        color: "#FFFFFF",
                        fontWeight: theme.typography.secondary.fontWeight,
                        fontSize: "12px",
                        whiteSpace: "nowrap",
                        //   marginLeft: "1%", // Adjusting margin for icon and text
                      }}
                    >
                      {renewContract ? (renewContract?.contract_status === "SENT" ? (selectedRole === "MANAGER" ? "Edit Renew Contract" : "Manage Renew Contract") : (renewContract?.contract_status === "NEW" ? (selectedRole === "MANAGER" ? "Owner Renew Requested" : "Already Requested") : (renewContract?.contract_status === "REJECTED" ? (selectedRole === "MANAGER" ? "Edit Renew Contract" : "Rejected By Owner")  : "View Renewed Contract"))) : "Renew Contract"}
                    </Typography>
                  </Button>
                </Grid>
              </Grid>
            )}

            {/* Management Fees */}
            {activeContract && (
              <Grid item xs={12}>
                <Accordion theme={theme} sx={{ backgroundColor: "#e6e6e6", marginTop: "10px" }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='management-fees-content' id='management-fees-header'>
                    <Typography
                      sx={{
                        color: theme.typography.primary.black,
                        fontWeight: theme.typography.secondary.fontWeight,
                        fontSize: theme.typography.smallFont,
                      }}
                    >
                      Management Fees
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container item spacing={2}>
                      {activeContract?.contract_fees ? (
                        <FeesSmallDataGrid data={JSON.parse(activeContract?.contract_fees)} />
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
                              fontWeight: theme.typography.primary.fontWeight,
                              fontSize: theme.typography.smallFont,
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

            {/* Contract Documents */}
            {activeContract && (
              <Grid item xs={12}>
                {activeContract.contract_documents && activeContract.contract_documents !== "[]" ? (
                  <Accordion theme={theme} sx={{ backgroundColor: "#e6e6e6", marginTop: "10px" }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='contract-documents-content' id='contract-documents-header'>
                      <Typography
                        sx={{
                          color: theme.typography.primary.black,
                          fontWeight: theme.typography.secondary.fontWeight,
                          fontSize: theme.typography.smallFont,
                        }}
                      >
                        Contract Documents
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container item>
                        <DocumentSmallDataGrid data={JSON.parse(activeContract.contract_documents)} handleFileClick={handleFileClick} />
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ) : (
                  // <Box theme={theme} sx={{ marginTop: '10px', backgroundColor: '#e6e6e6', padding: '10px' }}>
                  //   {/* <Typography
                  //     sx={{
                  //       color: theme.typography.primary.black,
                  //       fontWeight: theme.typography.secondary.fontWeight,
                  //       fontSize: theme.typography.smallFont,
                  //     }}
                  //   >
                  //     Contract Documents
                  //   </Typography>
                  //   <Box
                  //     sx={{
                  //       display: 'flex',
                  //       justifyContent: 'center',
                  //       alignItems: 'center',
                  //       width: '100%',
                  //       height: '40px',
                  //       marginTop: '10px',
                  //     }}
                  //   >
                  //     <Typography
                  //       sx={{
                  //         color: '#A9A9A9',
                  //         fontWeight: theme.typography.primary.fontWeight,
                  //         fontSize: theme.typography.smallFont,
                  //       }}
                  //     >
                  //       No Document
                  //     </Typography>
                  //   </Box> */}
                  //   <Box
                  //     sx={{
                  //       display: 'flex',
                  //       justifyContent: 'space-between',
                  //       alignItems: 'center',
                  //       width: '100%',
                  //     }}
                  //   >
                  //     <Typography
                  //       sx={{
                  //         color: theme.typography.primary.black,
                  //         fontWeight: theme.typography.secondary.fontWeight,
                  //         fontSize: theme.typography.smallFont,
                  //       }}
                  //     >
                  //       Contract Documents
                  //     </Typography>
                  //     <Typography
                  //       sx={{
                  //         color: '#A9A9A9',
                  //         fontWeight: theme.typography.primary.fontWeight,
                  //         fontSize: theme.typography.smallFont,
                  //       }}
                  //     >
                  //       No Document
                  //     </Typography>
                  //   </Box>
                  // </Box>
                  <Accordion
                    theme={theme}
                    sx={{
                      backgroundColor: "#e6e6e6",
                      marginTop: "10px",
                      "&.Mui-disabled": {
                        backgroundColor: "#e6e6e6",
                        color: theme.typography.primary.black,
                        // opacity: 1,
                      },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={null}
                      aria-controls='contract-documents-content'
                      id='contract-documents-header'
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <Typography
                        sx={{
                          color: theme.typography.primary.black,
                          fontWeight: theme.typography.secondary.fontWeight,
                          fontSize: theme.typography.smallFont,
                        }}
                      >
                        Contract Documents
                      </Typography>
                      <Typography
                        sx={{
                          color: "#A9A9A9",
                          position: "absolute",
                          right: "15px",
                          fontWeight: theme.typography.primary.fontWeight,
                          fontSize: theme.typography.smallFont,
                        }}
                      >
                        No Document
                      </Typography>
                    </AccordionSummary>
                  </Accordion>
                )}
              </Grid>
            )}

            {/* Open Maintenance Tickets */}
            <Grid container item spacing={2} marginTop={"5px"}>
              <Grid item xs={10}>
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
              <Grid item xs={2}>
                <IconButton
                  sx={{ marginLeft: "1.5px", paddingTop: "3px" }}
                  onClick={() => {
                    handleOpenMaintenancePage();
                  }}
                >
                  <Badge badgeContent={currentProperty?.maintenance?.length || 0} color='error' showZero />
                </IconButton>
              </Grid>
            </Grid>

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
      <EndContractDialog open={showEndContractDialog} handleClose={() => setShowEndContractDialog(false)} contract={activeContract} />
      {showManagerEndContractDialog && (
        <Box>
          <ManagerEndContractDialog
            open={showManagerEndContractDialog}
            handleClose={() => setShowManagerEndContractDialog(false)}
            onEndContract={handleManagerEndContractClick}
            noticePeriod={contractEndNotice}
            fetchContracts={fetchContracts}
          />
        </Box>
      )}

      <RenewContractDialog open={showRenewContractDialog} handleClose={() => setShowRenewContractDialog(false)} contract={activeContract} fetchContracts={fetchContracts} />
    </>
  );
}

export const FeesSmallDataGrid = ({ data }) => {
  const commonStyles = {
    color: theme.typography.primary.black,
    fontWeight: theme.typography.light.fontWeight,
    fontSize: theme.typography.smallFont,
  };

  const columns = [
    {
      field: "frequency",
      headerName: "Frequency",
      flex: 1,
      renderHeader: (params) => <strong style={{ fontSize: theme.typography.smallFont }}>{params.colDef.headerName}</strong>,
      renderCell: (params) => <Typography sx={commonStyles}>{params.value}</Typography>,
    },
    {
      field: "fee_name",
      headerName: "Name",
      flex: 1.2,
      renderHeader: (params) => <strong style={{ fontSize: theme.typography.smallFont }}>{params.colDef.headerName}</strong>,
      renderCell: (params) => <Typography sx={commonStyles}>{params.value}</Typography>,
    },
    {
      field: "charge",
      headerName: "Charge",
      flex: 0.8,
      renderHeader: (params) => <strong style={{ fontSize: theme.typography.smallFont }}>{params.colDef.headerName}</strong>,
      renderCell: (params) => {
        const feeType = params.row?.fee_type;
        const charge = params.value;

        return <Typography sx={commonStyles}>{feeType === "PERCENT" ? `${charge}%` : feeType === "FLAT-RATE" ? `$${charge}` : charge}</Typography>;
      },
    },
    {
      field: "of",
      headerName: "Of",
      flex: 1,
      renderHeader: (params) => <strong style={{ fontSize: theme.typography.smallFont }}>{params.colDef.headerName}</strong>,
      renderCell: (params) => {
        const feeType = params.row?.fee_type;
        const of = params.value;

        return <Typography sx={commonStyles}>{of === null || of === undefined || of === "" ? (feeType === "FLAT-RATE" ? "Flat-Rate" : "-") : `${of}`}</Typography>;
      },
    },
  ];

  // Adding a unique id to each row using map if the data doesn't have an id field
  const rowsWithId = data.map((row, index) => ({
    ...row,
    id: row.id ? index : index,
  }));

  return (
    <DataGrid
      rows={rowsWithId}
      columns={columns}
      sx={{
        marginY: "5px",
        overflow: "auto",
        "& .MuiDataGrid-columnHeaders": {
          minHeight: "35px !important",
          maxHeight: "35px !important",
          height: 35,
        },
      }}
      autoHeight
      rowHeight={35}
      hideFooter={true} // Display footer with pagination
    />
  );
};

export const DocumentSmallDataGrid = ({ data, handleFileClick }) => {
  const commonStyles = {
    color: theme.typography.primary.black,
    fontWeight: theme.typography.light.fontWeight,
    fontSize: theme.typography.smallFont,
  };

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

const RenewContractDialog = ({ open, handleClose, contract, fetchContracts }) => {
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
    const announcementMsg = `The owner(${contract.owner_uid}) of ${contract.property_address}${propertyUnit} has requested a renewal of the management contract.`;

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
      // console.log(JSON.stringify(response.data));
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

    // put request to change renew status
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

    const currentDate = new Date();    
    const formattedDate = `${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}-${currentDate.getFullYear()}`;

  
    const NewFormData = new FormData();
    NewFormData.append("contract_property_ids", JSON.stringify([contract.contract_property_id]));
    NewFormData.append("contract_business_id", contract.contract_business_id);
    NewFormData.append("contract_start_date", formattedDate);
    NewFormData.append("contract_status", "NEW");

    const url = `${APIConfig.baseURL.dev}/contracts`;

    //post request to create new contract
    try {
      fetch(url, {
        method: "POST",
        body: NewFormData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          } else {
            console.log("Data added successfully");
            sendAnnouncement();
            fetchContracts();
          }
        })
        .catch((error) => {
          console.error("There was a problem with the fetch operation:", error);
        });
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }

    // sendAnnouncement();

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
