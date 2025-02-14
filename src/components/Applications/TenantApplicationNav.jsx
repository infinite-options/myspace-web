import { useEffect, useState } from "react";
import { useLocation, useNavigate, use } from "react-router-dom";
import theme from "../../theme/theme";
import { ThemeProvider, Accordion, AccordionSummary, AccordionDetails, } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Avatar from "@mui/material/Avatar";
import Grid from "@mui/material/Grid";
import EmailIcon from "../Property/messageIconDark.png";
import PhoneIcon from "../Property/phoneIconDark.png";
import AES from "crypto-js/aes";
import encUtf8 from 'crypto-js/enc-utf8';
import CloseIcon from "@mui/icons-material/Close";
import Documents from "../Leases/Documents";
import WaiverForm from "../Leases/WaiverForm";
import { AdultDataGrid, ChildDataGrid, PetDataGrid, VehicleDataGrid } from "./TenantApplication";
import { DataGrid } from '@mui/x-data-grid';
import LeaseFees from "../Leases/LeaseFees";
import { useUser } from "../../contexts/UserContext";
import APIConfig from "../../utils/APIConfig";
import { fetchMiddleware as fetch } from "../../utils/httpMiddleware";

const TenantApplicationNav = (props) => {
  const navigate = useNavigate();
  const { state } = useLocation();
  //console.log('Inside TenantApplicationNav', props, state);
  const { index, property, isDesktop, propertyIndex, onBackClick } = props;
  //console.log('Inside TenantApplicationNav - property - ', property);
  //console.log('Inside TenantApplicationNav - index - ', index);
  const [allLeases, setAllLeases] = useState(property.leases);
  const [leases, setLeases] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(index || 0);
  // const [application, setApplication] = useState(leases[currentIndex]);
  const [lease, setLease] = useState([]);

  useEffect(() => {
    //Need the change the below filter in LeaseDetailsComponent and TenantApplicationNav component.
    const filteredLeases = allLeases.filter((lease) => lease.lease_status && !["ACTIVE", "ACTIVE M2M", "ENDED", "TERMINATED", "EXPIRED"].includes(lease.lease_status));
    // console.log("application - ", filteredLeases, filteredLeases);
    setLeases(filteredLeases);
    setLease(filteredLeases[currentIndex]);
  }, []);

  // //console.log("---dhyey--- in property - ", property)
  //console.log("---dhyey--- in application view - ", lease)
  const [showSpinner, setShowSpinner] = useState(false);
  const [vehicles, setVehicles] = useState(JSON.parse(lease?.lease_vehicles || '["No Vehicle Information"]'));
  const [adultOccupants, setAdultOccupants] = useState(JSON.parse(lease?.lease_adults || '["No Adult Occupants"]'));
  const [petOccupants, setPetOccupants] = useState(JSON.parse(lease?.lease_pets || '["No Pet Occupants"]'));
  const [childOccupants, setChildOccupants] = useState(JSON.parse(lease?.lease_children || '["No Child Occupants"]'));
  const [applicationDocuments, setApplicationDocuments] = useState(JSON.parse(lease?.lease_documents || '["No Lease Documents"]'));
  const [leaseFees, setLeaseFees] = useState([])
  const { selectedRole } = useUser();
  //console.log("---dhyey--- in application view 222 - ", lease)


  useEffect(() => {
    // //console.log("lease fees - ", application?.lease_fees);
    if (lease) {
      let parsedFees = []
      try {
        parsedFees = JSON.parse(lease?.lease_fees);
      } catch (error) {
        console.error("TenantApplicationNav - Error Parsing Lease Fees");
      }
      setLeaseFees(parsedFees);
      // //console.log("parsedFees - ", parsedFees);
    }
  }, [lease]);

  // useEffect(() => {
  //     //console.log("applicationDocuments - ", applicationDocuments);
  // }, [applicationDocuments]);
  function formatDocumentType(type) {
    switch (type) {
      case "income_proof":
        return "Proof of Income";
      case "bank_statement":
        return "Bank Statement";
      case "id":
        return "ID";
      case "renters_insurance_proof":
        return "Proof of Renter's Insurance";
      case "ssn":
        return "SSN";
      case "credit_report":
        return "Credit Report";
      case "reference":
        return "Reference";
      case "other":
        return "Other";

      default:
        return "";
    }
  }

  const handleNavigateToWaiverForm = () => {
    navigate("/waiverForm");
  };

  const handleNextCard = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % leases.length);
  };
  const handlePreviousCard = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + leases.length) % leases.length);
  };
  const handleRejectLease = async () => {
    const leaseApplicationFormData = new FormData();
    leaseApplicationFormData.append("lease_uid", lease.lease_uid);

    // leaseApplicationFormData.append("lease_status", "REJECTED");
    if (lease.lease_status === "NEW") {
      leaseApplicationFormData.append("lease_status", "REJECTED");
    } else { // lease_status === RENEW NEW
      leaseApplicationFormData.append("lease_status", "RENEW REJECTED");
    }

    setShowSpinner(true);
    await fetch(`${APIConfig.baseURL.dev}/leaseApplication`, {
      method: "PUT",
      body: leaseApplicationFormData,
    });

    // change old lease's renew status to RENEW REJECTED

    if (lease.lease_status === "RENEW NEW") {
      const updatePrevLeaseFormData = new FormData();
      updatePrevLeaseFormData.append("lease_uid", lease.lease_uid);
      updatePrevLeaseFormData.append("lease_renew_status", "RENEW REJECTED");

      await fetch(`${APIConfig.baseURL.dev}/leaseApplication`, {
        method: "PUT",
        body: updatePrevLeaseFormData,
      });

    }


    setShowSpinner(false);
    navigate("/managerDashboard");
  };
  const handleCreateLease = () => {
    // //console.log("application - ", application);
    // //console.log("property - ", property);
    if (lease.lease_status === "RENEW REFUSED") {
      navigate("/tenantLease", { state: { page: "edit_lease", lease, property } });
    } else {
      navigate("/tenantLease", { state: { page: "create_lease", lease, property } });
    }
  };

  const handleEditLease = () => {
    navigate("/tenantLease", { state: { page: "edit_lease", lease, property } });
  };
  const handleRenewLease = () => {
    //console.log("ROHIT - 146 - application - ", lease);
    navigate("/tenantLease", { state: { page: "renew_lease", lease, property } });
  };


  const handleWithdrawLease = async () => {
    const leaseApplicationFormData = new FormData();
    leaseApplicationFormData.append("lease_uid", lease.lease_uid);
    leaseApplicationFormData.append("lease_status", "RESCIND");

    setShowSpinner(true);
    await fetch(`${APIConfig.baseURL.dev}/leaseApplication`, {
      method: "PUT",
      body: leaseApplicationFormData,
    });
    setShowSpinner(false);
    navigate("/managerDashboard");
  };

  useEffect(() => {
    if (leases.length > 0) {
      const currApp = leases[currentIndex];
      // console.log('currApp', leases, currApp)
      setLease(currApp);
      setVehicles(JSON.parse(currApp?.lease_vehicles || '["No Vehicle Information"]'));
      setAdultOccupants(JSON.parse(currApp?.lease_adults || '["No Adult Occupants"]'));
      setPetOccupants(JSON.parse(currApp?.lease_pets || '["No Pet Occupants"]'));
      setChildOccupants(JSON.parse(currApp?.lease_children || '["No Child Occupants"]'));
      setApplicationDocuments(JSON.parse(currApp?.lease_documents));
    }
  }, [currentIndex, leases]);

  const handleCloseButton = (e) => {
    e.preventDefault();
    onBackClick();
  };

  const decryptedSSN = (() => {
    try {
      if (lease?.tenant_ssn) {
        const decrypted = AES.decrypt(lease.tenant_ssn, process.env.REACT_APP_ENKEY)?.toString(encUtf8);
        return decrypted.slice(-4); // Get the last 4 digits of the SSN
      }
      return "****"; // Fallback if tenant_ssn is not available
    } catch (error) {
      console.error("Decryption error:", error);
      return "****"; // Return masked SSN in case of an error
    }
  })();

  return (
    <ThemeProvider theme={theme}>
      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
        <CircularProgress color='inherit' />
      </Backdrop>
      {/* <Box sx={{ display: "flex", justifyContent: "center", width: "100%", minHeight: "100vh", marginTop: theme.spacing(7)}}>
        <Paper sx={{ width: "100%", paddingTop: "10px" , backgroundColor: "yellow"}}> */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          height: "100%",
        }}
      >
        <Paper
          sx={{
            backgroundColor: theme.palette.primary.main,
            width: "100%",
          }}
        >
          <Stack direction="column" justifyContent="center" alignItems="center">
            <Box sx={{ width: "90%" }}>
              {/* <Paper sx={{ backgroundColor: theme.palette.primary.white }}> */}
              <Box sx={{ flexDirection: "column", justifyContent: "center", width: "100%", marginTop: theme.spacing(2) }}>
                {/* Header with name and avatar */}
                <Box sx={{ position: "relative", backgroundColor: "#FFFFFF", borderRadius: "10px", display: "flex", flexDirection: "column", width: "100%" }}>
                  <Box sx={{ backgroundColor: "#160449", position: "relative", borderRadius: "10px 10px 0 0", paddingTop: "10px", paddingBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Button onClick={handlePreviousCard} disabled={currentIndex === 0}>
                      <ArrowBackIcon sx={{ color: currentIndex === 0 ? "#A0A0A0" : "#FFFFFF", width: "25px", height: "25px", margin: "0px" }} />
                    </Button>
                    <Box sx={{ textAlign: "center" }}>
                      <Avatar src={lease?.tenant_photo_url} sx={{ width: "60px", height: "60px", margin: "0 auto", marginBottom: "10px" }} />
                      <Typography sx={{ color: "#FFFFFF", fontSize: "16px", fontWeight: 800 }}>
                        {lease?.tenant_first_name + " " + lease?.tenant_last_name}
                      </Typography>
                      <Typography sx={{ color: "#FFFFFF", fontSize: "14px" }}>{`${currentIndex + 1} of ${leases.length} Applicants`}</Typography>
                    </Box>
                    <Button onClick={handleNextCard} disabled={currentIndex === leases.length - 1}>
                      <ArrowForwardIcon sx={{ color: currentIndex === leases.length - 1 ? "#A0A0A0" : "#FFFFFF", width: "25px", height: "25px", margin: "0px" }} />
                    </Button>
                  </Box>
                </Box>


                {/* Contact and Confidential Info */}
                <Paper sx={{ backgroundColor: theme.palette.form.main, padding: "20px", marginBottom: "10px" }}>
                  <Grid container spacing={2} sx={{ padding: "0px" }}>
                    <Grid item xs={12} sm={6}>
                      <Box >
                        <Typography sx={{ fontWeight: "bold", color: "#160449", marginBottom: "10px" }}>CONTACT INFORMATION</Typography>
                        <Typography display="block">
                          <img src={EmailIcon} alt="email" style={{ marginRight: "10px" }} />
                          {lease?.tenant_email}
                        </Typography>
                        <Typography display="block">
                          <img src={PhoneIcon} alt="phone" style={{ marginRight: "10px" }} />
                          {lease?.tenant_phone_number}
                        </Typography>
                        <Typography display="block">
                          {lease?.tenant_address}, {lease?.tenant_city}, {lease?.tenant_state} {lease?.tenant_zip}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box sx={{ padding: "10px" }}>
                        <Typography sx={{ fontWeight: "bold", color: "#160449", marginBottom: "10px" }}>CONFIDENTIAL INFO</Typography>
                        <Typography display="block" sx={{ color: "#3D5CAC" }}>SSN:</Typography>
                        <Typography display="block" sx={{ color: "#160449" }}>***-**-{decryptedSSN}</Typography>
                        <Typography display="block" sx={{ color: "#3D5CAC" }}>DL:</Typography>
                        <Typography display="block" sx={{ color: "#160449" }}>
                          {lease?.tenant_drivers_license_number
                            ? `${lease?.tenant_drivers_license_number} / ${lease?.tenant_drivers_license_state}`
                            : "Not available"}
                        </Typography></Box>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Job Details */}
                <Paper sx={{ backgroundColor: theme.palette.form.main, padding: "20px", marginBottom: "10px", borderRadius: "10px" }}>
                  <Typography sx={{ fontWeight: "bold", color: "#160449", marginBottom: "10px" }}>
                    INCOME DETAILS
                  </Typography>

                  {/* Parsing the stringified JSON data */}
                  {lease?.lease_income &&
                    (() => {
                      try {
                        const incomeData = JSON.parse(lease.lease_income);
                        return incomeData.map((income, index) => (
                          <Grid container spacing={2} key={index} sx={{ marginBottom: "10px", padding: "10px", backgroundColor: theme.palette.form.main, borderRadius: "5px" }}>
                            <Grid item xs={3}>
                              <Typography sx={{ color: "#3D5CAC" }}>Income Title</Typography>
                              <Typography>{income.jobTitle}</Typography>
                            </Grid>
                            <Grid item xs={3}>
                              <Typography sx={{ color: "#3D5CAC" }}>Amount</Typography>
                              <Typography>{income.salary}</Typography>
                            </Grid>
                            <Grid item xs={3}>
                              <Typography sx={{ color: "#3D5CAC" }}>Amount Frequency</Typography>
                              <Typography>{income.frequency}</Typography>
                            </Grid>
                            <Grid item xs={3}>
                              <Typography sx={{ color: "#3D5CAC" }}>Company Name</Typography>
                              <Typography>{income.companyName}</Typography>
                            </Grid>
                          </Grid>
                        ));
                      } catch (error) {
                        console.error("Failed to parse lease_income JSON:", error);
                        return <Typography>No income data available</Typography>;
                      }
                    })()
                  }

                </Paper>

                {/* Occupant Details */}
                <Paper elevation={2} sx={{ backgroundColor: theme.palette.form.main, padding: "20px", marginBottom: "10px" }}>
                  <Typography sx={{ fontWeight: "bold", color: "#160449", marginBottom: "10px" }}>OCCUPANT DETAILS</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={3}>
                      <Typography display="block" sx={{ color: "#3D5CAC" }}>Adults:</Typography>
                      <Typography display="block">{adultOccupants.length}</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography display="block" sx={{ color: "#3D5CAC" }}>Children:</Typography>
                      <Typography display="block">{childOccupants.length}</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography display="block" sx={{ color: "#3D5CAC" }}>Pets:</Typography>
                      <Typography display="block">{petOccupants.length}</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography display="block" sx={{ color: "#3D5CAC" }}>Vehicles:</Typography>
                      <Typography display="block">{vehicles.length}</Typography>
                    </Grid>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px', width: "100%" }}>
                      <Accordion sx={{ backgroundColor: theme.palette.form.main, width: { xs: '100%', sm: '100%', md: '100%' } }}>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls="occupants-content"
                          id="occupants-header"
                        >
                          <Typography
                            sx={{
                              justifySelf: "center",
                              color: theme.typography.primary.black,
                              fontWeight: theme.typography.primary.fontWeight,
                              fontSize: theme.typography.smallFont,
                            }}
                          >
                            Adults
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ marginBottom: "20px" }}>
                          {adultOccupants && adultOccupants?.length > 0 ? <AdultDataGrid adults={adultOccupants} /> :
                            <>
                              <Box
                                sx={{
                                  display: 'flex',
                                  flexDirection: 'row',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  marginBottom: '7px',
                                  width: '100%',
                                  height: "70px"
                                }}
                              >
                                <Typography
                                  sx={{
                                    color: "#A9A9A9",
                                    fontWeight: theme.typography.primary.fontWeight,
                                    fontSize: "15px",
                                  }}
                                >
                                  No Adults
                                </Typography>
                              </Box>
                            </>
                          }
                        </AccordionDetails>
                      </Accordion>


                      <Accordion sx={{ backgroundColor: theme.palette.form.main, width: { xs: '100%', sm: '100%', md: '100%' } }}>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls="occupants-content"
                          id="occupants-header"
                        >
                          <Typography
                            sx={{
                              justifySelf: "center",
                              color: theme.typography.primary.black,
                              fontWeight: theme.typography.primary.fontWeight,
                              fontSize: theme.typography.smallFont,
                            }}
                          >
                            Children
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          {childOccupants && childOccupants?.length > 0 ? <ChildDataGrid children={childOccupants} /> :
                            <>
                              <Box
                                sx={{
                                  display: 'flex',
                                  flexDirection: 'row',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  marginBottom: '7px',
                                  width: '100%',
                                  height: "70px"
                                }}
                              >
                                <Typography
                                  sx={{
                                    color: "#A9A9A9",
                                    fontWeight: theme.typography.primary.fontWeight,
                                    fontSize: "15px",
                                  }}
                                >
                                  No Child
                                </Typography>
                              </Box>
                            </>
                          }
                        </AccordionDetails>
                      </Accordion>
                      <Accordion sx={{ backgroundColor: theme.palette.form.main, width: { xs: '100%', sm: '100%', md: '100%' } }}>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls="occupants-content"
                          id="occupants-header"
                        >
                          <Typography
                            sx={{
                              justifySelf: "center",
                              color: theme.typography.primary.black,
                              fontWeight: theme.typography.primary.fontWeight,
                              fontSize: theme.typography.smallFont,
                            }}
                          >
                            Pets
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          {petOccupants && petOccupants?.length > 0 ? <PetDataGrid pets={petOccupants} /> :
                            <>
                              <Box
                                sx={{
                                  display: 'flex',
                                  flexDirection: 'row',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  marginBottom: '7px',
                                  width: '100%',
                                  height: "70px"
                                }}
                              >
                                <Typography
                                  sx={{
                                    color: "#A9A9A9",
                                    fontWeight: theme.typography.primary.fontWeight,
                                    fontSize: "15px",
                                  }}
                                >
                                  No Pets
                                </Typography>
                              </Box>
                            </>
                          }
                        </AccordionDetails>
                      </Accordion>
                      <Accordion sx={{ backgroundColor: theme.palette.form.main, width: { xs: '100%', sm: '100%', md: '100%' } }}>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls="occupants-content"
                          id="occupants-header"
                        >
                          <Typography
                            sx={{
                              justifySelf: "center",
                              color: theme.typography.primary.black,
                              fontWeight: theme.typography.primary.fontWeight,
                              fontSize: theme.typography.smallFont,
                            }}
                          >
                            Vehicles
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          {vehicles && vehicles?.length > 0 ? <VehicleDataGrid vehicles={vehicles} /> :
                            <>
                              <Box
                                sx={{
                                  display: 'flex',
                                  flexDirection: 'row',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  marginBottom: '7px',
                                  width: '100%',
                                  height: "70px"
                                }}
                              >
                                <Typography
                                  sx={{
                                    color: "#A9A9A9",
                                    fontWeight: theme.typography.primary.fontWeight,
                                    fontSize: "15px",
                                  }}
                                >
                                  No Vehicles
                                </Typography>
                              </Box>
                            </>
                          }
                        </AccordionDetails>
                      </Accordion>
                    </Box>
                  </Grid>
                </Paper>
                {/* Documents */}
                <Paper elevation={2} sx={{ backgroundColor: theme.palette.form.main, padding: "20px" }}>

                  <Documents setRHS={props.setRHS} setSelectedDocument={props.setSelectedDocument} documents={applicationDocuments} setDocuments={setApplicationDocuments} isEditable={false} isAccord={false} customName={"APPLICATION DOCUMENTS:"} />



                </Paper>
                {/* Action Buttons */}
                {selectedRole === "MANAGER" &&
                  <Stack direction='row' alignItems='center' justifyContent='space-around' sx={{ padding: "30px 0", paddingRight: "15px" }}>
                    {(lease?.lease_status === "NEW" || lease?.lease_status === "RENEW NEW") && (
                      <Button
                        onClick={handleRejectLease}
                        sx={{
                          backgroundColor: "#CB8E8E",
                          color: "#160449",
                          textTransform: "none",
                          width: "120px",
                          "&:hover, &:focus, &:active": {
                            backgroundColor: "#CB8E8E",
                          },
                        }}
                      >
                        {"Reject Tenant"}
                      </Button>
                    )}
                    {(lease?.lease_status === "PROCESSING" || lease?.lease_status === "RENEW PROCESSING" || lease?.lease_status === "APPROVED") && (
                      <div>
                        <Button
                          onClick={handleWithdrawLease}
                          sx={{
                            backgroundColor: "#CB8E8E",
                            color: "#FFFFFF",
                            textTransform: "none",
                            width: "160px",
                            marginRight: "10px",
                            marginRight: "30px",
                            whiteSpace: "nowrap",
                            "&:hover, &:focus, &:active": {
                              backgroundColor: "#bb6b6b",
                            },
                          }}
                        >
                          {"Withdraw Lease"}
                        </Button>
                        <Button
                          onClick={handleEditLease}
                          sx={{
                            backgroundColor: "#9EAED6",
                            color: "#FFFFFF",
                            textTransform: "none",
                            width: "120px",
                            "&:hover, &:focus, &:active": {
                              backgroundColor: "#6780bf",
                            },
                          }}
                        >
                          {"Edit Lease"}
                        </Button>
                      </div>
                    )}
                    {lease?.lease_status === "RENEW NEW" && (
                      <Button
                        onClick={handleRenewLease}
                        sx={{
                          backgroundColor: "#9EAED6",
                          color: "#160449",
                          textTransform: "none",
                          width: "120px",
                          "&:hover, &:focus, &:active": {
                            backgroundColor: "#9EAED6",
                          },
                          // visibility: selectedRole === "MANAGER" ? "visible" : "hidden"
                        }}
                      >
                        {"Renew Lease"}
                      </Button>
                    )}
                    {lease?.lease_status !== "PROCESSING" && lease?.lease_status !== "RENEW PROCESSING" && lease?.lease_status !== "RENEW NEW" && lease?.lease_status !== "APPROVED" && (
                      <Button
                        onClick={handleCreateLease}
                        sx={{
                          backgroundColor: "#9EAED6",
                          color: "#160449",
                          textTransform: "none",
                          width: "120px",
                          "&:hover, &:focus, &:active": {
                            backgroundColor: "#9EAED6",
                          },
                        }}
                      >
                        {"New Lease"}
                      </Button>
                    )}
                  </Stack>}
              </Box>
              {/* </Paper> */}
            </Box>
          </Stack>
        </Paper>
      </Box>
    </ThemeProvider>
  );

};



export default TenantApplicationNav;
