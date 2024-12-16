import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  Radio,
  RadioGroup,
  Card,
  CardContent,
  FormControlLabel,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { alpha, makeStyles } from "@material-ui/core/styles";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CircleIcon from "@mui/icons-material/Circle";
import PlaceholderImage from "./MaintenanceIcon.png";
import { List, ListItem } from "@mui/material";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import AddIcon from "@mui/icons-material/Add";
import { Table, TableHead, TableBody, TableRow, TableCell, TableContainer } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import defaultHouseImage from "../Property/defaultHouseImage.png";
import NewCardSlider from "../Announcement/NewCardSlider";
import { useUser } from "../../contexts/UserContext";
import APIConfig from "../../utils/APIConfig";
import ArrowDropDown from "@mui/icons-material/ArrowDropDown";
import theme from "../../theme/theme";
import { DataGrid, GridRow } from "@mui/x-data-grid";
import MaintenanceWidget from "../Dashboard-Components/Maintenance/MaintenanceWidget";
import { PropertyListings } from "../Property/PropertyListings";
import PropertyInfo from "../Property/PropertyInfo";
import useMediaQuery from "@mui/material/useMediaQuery";
import TenantApplication from "../Applications/TenantApplication";
import TenantApplicationEdit from "../Applications/TenantApplicationEdit";
import TenantLeases from "../Leases/TenantLeases/TenantLeases";
import Payments from "../Payments/Payments";
import AddTenantMaintenanceItem from "../Maintenance/AddTenantMaintenanceItem";
import FlipIcon from "./FlipImage.png";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Announcements from "../Announcement/Announcements";
import EditMaintenanceItem from "../Maintenance/EditMaintenanceItem";
import EditIcon from "@mui/icons-material/Edit";
import TenantMaintenanceItemDetail from "../Maintenance/TenantMaintenanceItemDetail";
import TenantAccountBalance from "../Payments/TenantAccountBalance";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GenericDialog from "../GenericDialog";
import TenantEndLeaseButton from "./TenantEndLeaseButton";
import FilePreviewDialog from "../Leases/FilePreviewDialog";
import CloseIcon from "@mui/icons-material/Close";
import LeaseIcon from "../Property/leaseIcon.png";
import { Type } from "ajv/dist/compile/util";
import { getFeesDueBy, getFeesAvailableToPay, getFeesLateBy } from "../../utils/fees";
import { fetchMiddleware as fetch } from "../../utils/httpMiddleware";

const useStyles = makeStyles((theme) => ({
  input: {
    background: "#000000",
  },
}));

const TenantDashboard = () => {
  const { user } = useUser();
  const { getProfileId } = useUser();
  const location = useLocation();

  const [propertyListingData, setPropertyListingData] = useState([]);
  const [listingsData, setListingsData] = useState([]);
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
  const rightPaneRef = useRef(null);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [viewRHS, setViewRHS] = useState(false);

  const [loading, setLoading] = useState(true);
  const [balanceDetails, setBalanceDetails] = useState([]);
  const [filteredMaintenanceRequests, setFilteredMaintenanceRequests] = useState([]);
  const [allBalanceDetails, setAllBalanceDetails] = useState([]);
  const [reload, setReload] = useState(true);
  const [relatedLease, setRelatedLease] = useState(null);

  const [announcementSentData, setAnnouncementSentData] = useState([]);
  const [announcementRecvData, setAnnouncementRecvData] = useState([]);
  const [firstPage, setFirstPage] = useState(false);

  const [view, setView] = useState("dashboard");

  // useEffect(() => {
  //   console.log("Listing Data: ", listingsData);
  // }, [listingsData]);

  useEffect(() => {
    // Whenever this component is mounted or navigated to, reset the right pane
    if (isMobile) {
      setViewRHS(false);
    }
    setRightPane("");
  }, [location]);
  // const fetchCashflowDetails = async () => {
  //     try {
  //         const response = await fetch(`${APIConfig.baseURL.dev}/cashflowTransactions/${getProfileId()}/all`);
  //         const data = await response.json();
  //     } catch (error) {
  //         console.error("Error fetching balance details: ", error);
  //     }
  // };

  useEffect(() => {
    console.log("=== ok success - ", location?.state?.selectedProperty);
    if (location?.state?.selectedProperty) {
      setSelectedProperty(location?.state?.selectedProperty);
      // handleSelectProperty(location?.state?.selectedProperty)
    }
  }, [location?.state?.selectedProperty]);

  useEffect(() => {
    if (leaseDetailsData != null && leaseDetailsData.length === 0) {
      setRightPane({ type: "listings" });
    }
  }, [leaseDetailsData]);

  const fetchData = async () => {
    setLoading(true);

    try {
      // Set loading to true before fetching data
      const profileId = getProfileId();
      if (!profileId) return;

      const dashboardResponse = await fetch(`${APIConfig.baseURL.dev}/dashboard/${profileId}`);
      const dashboardData = await dashboardResponse.json();

      if (dashboardData) {
        // console.log("Dashboard inside check", dashboardData.property?.result);
        setPropertyListingData(dashboardData.property?.result);

        setLeaseDetailsData(dashboardData.leaseDetails?.result);
        setMaintenanceRequestsNew(dashboardData.maintenanceRequests?.result);
        setMaintenanceStatus(dashboardData.maintenanceStatus?.result);
        setAnnouncements(dashboardData.announcementsReceived?.result);
        setPaymentHistory(dashboardData.tenantPayments?.result);
        setAnnouncementRecvData(dashboardData.announcementsReceived?.result || []);
        setAnnouncementSentData(dashboardData.announcementsSent?.result || []);

        // Set first property as selected, if available
        // const firstProperty = dashboardData.property?.result[0];
        // console.log("property", firstProperty.property_uid);
        // if (firstProperty) {
        //     setSelectedProperty(firstProperty.property_uid);
        //     handleSelectProperty(firstProperty.property_uid);
        // }
        const allBalanceDetails = dashboardData.tenantTransactions?.result.map((payment) => ({
          //here
          purchase_uid: payment.purchase_uid,
          propertyUid: payment.pur_property_id,
          purchaseType: payment.purchase_type,
          dueDate: payment.pur_due_date,
          amountDue: parseFloat(payment.amt_remaining || 0),
          totalPaid: parseFloat(payment.total_paid || 0),
          description: payment.pur_description || "N/A",
          purchaseStatus: payment.purchase_status,
          purchaseDate: payment.pur_due_date,
          pur_cf_type: payment.pur_cf_type,
          pur_receiver: payment.pur_receiver,
        }));

        // Save all balance details to state
        setAllBalanceDetails(allBalanceDetails);
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    if (reload === true) {
      fetchData();

      // if (selectedProperty) {
      //   handleSelectProperty(selectedProperty);
      // }
      //fetchCashflowDetails();
      setReload(false);
    }
  }, [reload, user]);

  useEffect(() => {
    // setLoading(true)
    // console.log("first property - ", selectedProperty)
    // console.log("propertydata test", propertyListingData);
    // console.log("property lease data - ", leaseDetailsData)
    // if (propertyListingData.length > 0 && !selectedProperty) {
    //   // const firstProperty = propertyListingData[0];
    //   const firstProperty = propertyListingData.find((property) => property.lease_status !== null);
    //   // console.log("first property", firstProperty);
    //   if (firstProperty) {
    //     setSelectedProperty(firstProperty);
    //     handleSelectProperty(firstProperty);
    //   }

    // } else if (selectedProperty) {
    //   // console.log("--DEBUG property - ", propertyListingData)
    //   const firstProperty = propertyListingData.find((property) => property.property_uid === selectedProperty.property_id);
    //   // console.log("first property", firstProperty);
    //   if (firstProperty) {
    //     setSelectedProperty(firstProperty)
    //     handleSelectProperty(firstProperty);
    //   }
    // }

    // fetch lease details from leaseDetailsData and property information as well
    if (propertyListingData.length > 0 && !selectedProperty) {
      const firstProperty = propertyListingData.find((property) => property.lease_status !== null);

      if (firstProperty) {
        const leaseDetails = leaseDetailsData.find((lease) => lease.lease_uid === firstProperty.lease_uid);

        if (leaseDetails) {
          setSelectedProperty(leaseDetails);
          handleSelectProperty(leaseDetails);
        }
      }
    } else if (selectedProperty) {
      const firstProperty = propertyListingData.find((property) => property.property_uid === selectedProperty.property_id);

      if (firstProperty) {
        const leaseDetails = leaseDetailsData.find((lease) => lease.lease_uid === firstProperty.lease_uid);

        if (leaseDetails) {
          setSelectedProperty(leaseDetails);
          handleSelectProperty(leaseDetails);
        }
      }
    }

    // setLoading(false)
  }, [propertyListingData]);

  useEffect(() => {
    if (propertyListingData && leaseDetailsData && maintenanceRequestsNew && maintenanceStatus && announcements && paymentHistory && allBalanceDetails) {
      setLoading(false);
    }
  }, [propertyListingData, leaseDetailsData, maintenanceRequestsNew, maintenanceStatus, announcements, paymentHistory, allBalanceDetails]);

  const handleSelectProperty = (property) => {
    if (property === null) {
      setLeaseDetails(null);
      setRelatedLease(null);
      return;
    }
    setSelectedProperty(property);
    updateLeaseDetails(property.property_uid);
    // console.log("leasedetailsdata", leaseDetailsData);

    if (leaseDetailsData) {
      const leasesForProperty = leaseDetailsData.filter((lease) => lease.property_uid === property.property_uid);

      // console.log("Leases for property:", leasesForProperty);

      //   const renewProcessingLease = leasesForProperty.find((lease) => lease.lease_status === "RENEW PROCESSING" || lease.lease_status === "RENEW NEW");
      //   console.log("check here", renewProcessingLease);
      //   setRelatedLease(renewProcessingLease || null);
      // }

      // Find the correct lease to set as relatedLease
      // console.log("233 - leasesForProperty - ", leasesForProperty);
      if (leasesForProperty.length > 1) {
        // const activeLease = leasesForProperty.find((lease) => lease.lease_status === "ACTIVE");
        // const renewalLease = leasesForProperty.find(lease => (lease.lease_status === "RENEW NEW" || lease.lease_status === "RENEW WITHDRAWN" || lease.lease_status === "RENEW PROCESSING"));
        const renewalLease = leasesForProperty.find((lease) => lease.lease_status === "RENEW NEW" || lease.lease_status === "RENEW PROCESSING" || lease.lease_status === "APPROVED");

        // setLeaseDetails(activeLease || null);
        setRelatedLease(renewalLease || null);
        // console.log("first lease", firstLease.lease_status, firstLease.lease_renew_status);
        // console.log("second lease", secondLease);
        // console.log("lease details check", leaseDetails);

        // if (firstLease.lease_status === "INACTIVE" && (secondLease.lease_status === "ACTIVE" || secondLease.lease_status === "ACTIVE M2M")) {
        //   setLeaseDetails(secondLease || null);
        //   console.log("here  check 2");
        // } else {
        //   setLeaseDetails(firstLease || null);
        //   setRelatedLease(secondLease || null);
        //   // console.log("here  check 1");
        // }
      } else {
        // setRelatedLease(leasesForProperty[0] || null);
        setRelatedLease(null);
      }
    }

    if (allBalanceDetails) {
      const filteredBalanceDetails = allBalanceDetails.filter(
        (detail) => detail.propertyUid === property.property_uid && (detail.purchaseStatus === "UNPAID" || detail.purchaseStatus === "PARTIALLY PAID")
      );
      setBalanceDetails(filteredBalanceDetails);
    }

    if (maintenanceRequestsNew) {
      const filteredRequests = maintenanceRequestsNew.filter((request) => request.lease_property_id === property.property_uid);
      setFilteredMaintenanceRequests(filteredRequests);
    }

    if (rightPane?.type === "paymentHistory") {
      const updatedPaymentHistory = paymentHistory.filter((detail) => detail.pur_property_id === property.property_uid);
      setRightPane({
        type: "paymentHistory",
        state: { data: updatedPaymentHistory },
      });
    }
  };

  const updateLeaseDetails = (propertyUid) => {
    const allLeasesForProperty = leaseDetailsData.filter((ld) => ld.property_uid === propertyUid);

    let leaseForProperty = null;
    if (allLeasesForProperty?.length > 1) {
      const newLease = allLeasesForProperty.find((ld) => ld.lease_status === "NEW");
      const activeLease = allLeasesForProperty.find((ld) => ld.lease_status === "ACTIVE");
      if (newLease != null) {
        leaseForProperty = newLease;
      } else {
        if (activeLease != null) {
          leaseForProperty = activeLease;
        } else {
          leaseForProperty = allLeasesForProperty[allLeasesForProperty?.length - 1];
        }
      }
    } else {
      leaseForProperty = allLeasesForProperty[0];
    }

    // const leaseForProperty = leaseDetailsData.find((ld) => ld.property_uid === propertyUid);
    console.log("property lease for property", leaseForProperty);
    setLeaseDetails(leaseForProperty);

    if (leaseForProperty?.lease_status === "NEW") {
      setRightPane({
        type: "tenantApplicationEdit",
        state: {
          data: leaseForProperty,
          status: leaseForProperty.lease_status,
          lease: leaseForProperty,
          from: "accwidget",
        },
      });
    } else if (leaseForProperty?.lease_status === "PROCESSING") {
      setRightPane({
        type: "tenantLeases",
        state: {
          data: leaseForProperty,
          status: leaseForProperty.lease_status,
          lease: leaseForProperty,
          from: "accwidget",
        },
      });
    } else {
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
    if (isMobile) {
      setViewRHS(true);
    }
    const paymentHistoryForProperty = paymentHistory.filter((detail) => detail.pur_property_id === selectedProperty.property_uid);
    // console.log("testing", paymentHistoryForProperty);
    setRightPane({ type: "paymentHistory", state: { data: paymentHistoryForProperty } });
  };

  const handleMakePayment = () => {
    if (isMobile) {
      setViewRHS(true);
    }

    const paymentHistoryForProperty = allBalanceDetails.filter((detail) => detail.propertyUid === selectedProperty.property_uid);

    // console.log("Payment History for Make Payment:", paymentHistoryForProperty);
    setRightPane({
      type: "payment",
      state: {
        data: paymentHistoryForProperty,
      },
    });

    if (rightPaneRef.current) {
      // console.log("rightPaneRef - ", rightPaneRef)
      rightPaneRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // console.log("rightPaneRef1 - ", rightPaneRef)
  useEffect(() => {
    // console.log("rightPaneRef2 - ", rightPaneRef)
    // if (rightPaneRef.current) {
    //   rightPaneRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    // }
  }, [rightPane]);

  const handleAddMaintenanceClick = () => {
    setRightPane({
      type: "addtenantmaintenance",
      state: {
        newTenantMaintenanceState: {
          propertyData: selectedProperty,
          leaseData: leaseDetails,
        },
      },
    });
  };

  const handleMaintenanceLegendClick = () => {
    if (isMobile) {
      setViewRHS(true);
    }
    setRightPane({
      type: "propertyMaintenanceRequests",
      state: { data: maintenanceStatus, propertyId: selectedProperty?.property_uid },
    });
  };

  const handleBack = () => {
    if (isMobile) {
      setViewRHS(false);
    }
    setRightPane("");
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

  const renderRightPane = () => {
    if (rightPane?.type) {
      switch (rightPane.type) {
        case "paymentHistory":
          return <TenantPaymentHistoryTable data={rightPane.state.data} setRightPane={setRightPane} onBack={handleBack} isMobile={isMobile} />;
        case "listings":
          return <PropertyListings setRightPane={setRightPane} isMobile={isMobile} setViewRHS={setViewRHS} setListingsData={setListingsData} />;
        case "propertyInfo":
          return <PropertyInfo {...rightPane.state} setRightPane={setRightPane} setFirstPage={setFirstPage} handleSelectProperty={handleSelectProperty} />;
        case "tenantApplication":
          return <TenantApplication {...rightPane.state} setRightPane={setRightPane} setReload={setReload} isMobile={isMobile} setViewRHS={setViewRHS} from={isMobile ? "accwidget" : ""} />;
        case "filePreview":
          return <DocumentPreview file={rightPane.file} onClose={rightPane.onClose} />;
        case "tenantApplicationEdit":
          return <TenantApplicationEdit {...rightPane.state} setRightPane={setRightPane} listingsData={listingsData} currentLease={leaseDetails} setReload={setReload} setFirstPage={setFirstPage} />;

        case "tenantLeases":
          return <TenantLeases {...rightPane.state} setRightPane={setRightPane} setReload={setReload} property={selectedProperty} isMobile={isMobile} setViewRHS={setViewRHS} />;
        case "payment":
          return (
            <PaymentsPM
              isMobile={isMobile}
              setViewRHS={setViewRHS}
              data={rightPane.state.data}
              setRightPane={setRightPane}
              selectedProperty={selectedProperty}
              leaseDetails={leaseDetails}
              balanceDetails={balanceDetails}
            />
          );
        case "addtenantmaintenance":
          return <AddTenantMaintenanceItem {...rightPane.state} setRightPane={setRightPane} setReload={setReload} isMobile={isMobile} setViewRHS={setViewRHS} />;
        case "propertyMaintenanceRequests":
          return (
            <PropertyMaintenanceRequests
              maintenanceStatus={rightPane.state.data}
              propertyId={rightPane.state.propertyId}
              onAdd={handleAddMaintenanceClick}
              setRightPane={setRightPane}
              selectedProperty={selectedProperty}
              isMobile={isMobile}
              setViewRHS={setViewRHS}
            />
          );
        case "editmaintenance":
          return (
            <EditMaintenanceItem
              setRightPane={setRightPane}
              setViewRHS={setViewRHS}
              setRefersh={setReload}
              maintenanceRequest={rightPane.state.maintenanceRequest}
              currentPropertyId={rightPane.state.currentPropertyId}
              propertyAddress={rightPane.state.propertyAddress}
            />
          );
        case "announcements":
          return <Announcements handleBack={handleBack} />;
        case "tenantEndLease":
          return <TenantEndLeaseButton leaseDetails={rightPane.state.leaseDetails} setRightPane={setRightPane} isMobile={isMobile} setViewRHS={setViewRHS} setReload={setReload} />;
        default:
          return null;
      }
    }
    return null;
  };

  // if (loading) {
  //   return (
  //     <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
  //       <CircularProgress />
  //     </Box>
  //   );
  // }

  return (
    // <Box sx={{ backgroundColor: "#fff", padding: isMobile ? "15px" : "30px"}}>
    <ThemeProvider theme={theme}>
      {loading ? (
        // <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        //   <CircularProgress />
        // </Box>
        <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
          <CircularProgress color='inherit' />
        </Backdrop>
      ) : (
        <Container maxWidth='lg' sx={{ paddingTop: "10px", paddingBottom: "50px" }}>
          <Grid container spacing={8} rowGap={1} sx={{ alignItems: "stretch", flexDirection: isMobile && "column" }}>
            {/* Top Section: Welcome Message and Search Icon */}
            {(!isMobile || !viewRHS) && (
              <Grid item xs={12} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
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
                  onClick={() => {
                    if (isMobile) {
                      setViewRHS(true);
                    }
                    setRightPane({ type: "listings" });
                    handleSelectProperty(null);
                  }}
                >
                  <SearchIcon />
                  {!isMobile && "Search Property"}
                </Button>
              </Grid>
            )}

            {/* Left-hand side: Account Balance */}
            <Grid item xs={12} md={4} sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <TenantAccountBalance
                isMobile={isMobile}
                viewRHS={viewRHS}
                setViewRHS={setViewRHS}
                propertyData={propertyListingData}
                selectedProperty={selectedProperty}
                firstPage={firstPage}
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
            <Grid item xs={12} md={8} sx={{ display: "flex", flexDirection: "column", flex: 1 }} rowGap={8}>
              {/* Announcements Section: Fixed Height */}
              {!isMobile && (!viewRHS || rightPane.type !== "announcements") && (
                // <Grid item xs={12} sx={{ height: "300px", flexShrink: 0, flexGrow: 0 }}>
                <Grid item xs={12} sx={{ maxHeight: "180px", backgroundColor: "#F2F2F2", borderRadius: "10px" }}>
                  <Grid
                    container
                    direction='row'
                    sx={{
                      paddingTop: "10px",
                      paddingBottom: "10px",
                    }}
                  >
                    <Grid item xs={2}></Grid>
                    <Grid item xs={8}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <Typography
                          variant='h6'
                          sx={{
                            color: "#160449",
                            fontWeight: "bold",
                          }}
                        >
                          Announcements
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={2}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          zIndex: 1,
                        }}
                      >
                        <Box
                          sx={{
                            color: "#007AFF",
                            fontSize: "15px",
                            paddingRight: "25px",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setViewRHS(true);
                            setRightPane({ type: "announcements" });
                          }}
                        >
                          {isMobile ? `(${announcementRecvData.length + announcementSentData.length})` : `View all (${announcementRecvData.length + announcementSentData.length})`}
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                  {announcementRecvData.length > 0 ? (
                    <NewCardSlider announcementList={announcementRecvData} isMobile={isMobile} />
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        alignContent: "center",
                        justifyContent: "center",
                        minHeight: "235px",
                      }}
                    >
                      <Typography sx={{ fontSize: { xs: "18px", sm: "18px", md: "20px", lg: "24px" } }}>No Announcements</Typography>
                    </Box>
                  )}
                </Grid>
              )}

              {/* Bottom Section: Flexible Space */}
              <Grid container spacing={8} rowGap={2} sx={{ flex: 1, display: "flex", flexDirection: isMobile ? "column" : "row", height: "100%" }}>
                {rightPane?.type ? (
                  <Grid item xs={12} md={12} sx={{ display: "flex", flexDirection: "column", flex: 1 }} ref={rightPaneRef} marginBottom={isMobile ? "40px" : "0px"}>
                    {renderRightPane()}
                  </Grid>
                ) : (
                  <>
                    {/* Management Details and Maintenance: Side by Side */}
                    <Grid container item xs={12} spacing={5} direction={isMobile ? "column" : "row"}>
                      <Grid item xs={12} md={6} sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
                        <ManagementDetails leaseDetails={leaseDetails} sx={{ flex: 1 }} />
                      </Grid>
                      <Grid item xs={12} md={6} sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
                        <MaintenanceDetails
                          maintenanceRequests={filteredMaintenanceRequests}
                          selectedProperty={selectedProperty}
                          leaseDetails={leaseDetails}
                          onPropertyClick={handleMaintenanceLegendClick}
                          setRightPane={setRightPane}
                          isMobile={isMobile}
                          setViewRHS={setViewRHS}
                          sx={{ flex: 1 }}
                        />
                      </Grid>
                    </Grid>

                    {/* Lease Details: Spanning Full Width */}
                    <Grid item xs={12} sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
                      <LeaseDetails
                        isMobile={isMobile}
                        setViewRHS={setViewRHS}
                        leaseDetails={leaseDetails}
                        rightPane={rightPane}
                        setRightPane={setRightPane}
                        selectedProperty={selectedProperty}
                        relatedLease={relatedLease}
                        setReload={setReload}
                        handleViewTenantApplication={handleViewTenantApplication}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Grid>
            {/* </Grid> */}
          </Grid>
        </Container>
      )}
    </ThemeProvider>
    // </Box>
  );
};

function TenantPaymentHistoryTable({ data, setRightPane, onBack, isMobile }) {
  console.log("data for table", data);

  const columns = [
    {
      field: "pur_description",
      headerName: "Description",
      flex: 1.5,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value || "-"}</Box>,
    },
    {
      field: "purchase_type",
      headerName: "Type",
      flex: 1,
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value || "-"}</Box>,
    },
    {
      field: "purchase_status",
      headerName: "Status",
      flex: 1.5,
      renderCell: (params) => (
        <Box
          sx={{
            backgroundColor: params.value === "PAID" ? "#76B148" : "#A52A2A",
            textTransform: "none",
            fontWeight: "bold",
            height: "20px",
            width: "120px",
            borderRadius: "4px",
            alignItems: "center",
            textAlign: "center",
            color: "#FFFFFF",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          {params.value || "-"}
        </Box>
      ),
    },
    {
      field: "payment_date",
      headerName: "Date",
      flex: 1,
      renderCell: (params) => {
        const date = new Date(params.value);
        return (
          <Box sx={{ fontWeight: "bold" }}>
            {date.toLocaleDateString("en-US")} {/* Format date to MM/DD/YYYY */}
          </Box>
        );
      },
    },
    {
      field: "pay_amount",
      headerName: "Total",
      flex: 1,
      renderCell: (params) => {
        const amountToDisplay = params.row.purchase_status === "UNPAID" || params.row.purchase_status === "PARTIALLY PAID" ? params.row.pay_amount : params.row.pay_amount;

        return (
          <Box
            sx={{
              fontWeight: "bold",
              display: "flex",
              flexDirection: "row",
            }}
          >
            ${amountToDisplay ? parseFloat(amountToDisplay).toFixed(2) : "0.00"}
          </Box>
        );
      },
    },
  ];

  return (
    <Grid container sx={{ flex: 1 }}>
      <Paper
        component={Stack}
        sx={{
          padding: isMobile ? "10px" : "20px",
          backgroundColor: "#f0f0f0",
          borderRadius: "8px",
          width: "100%",
          // height: "100%",
          // overflowX: "auto",
          marginBottom: isMobile ? "10px" : "0px",
        }}
      >
        <Grid Container sx={{ alignItems: "center", justifyContent: "center", display: "flex" }}>
          <Grid item xs={0.5} md={1}>
            <Button onClick={onBack}>
              <ArrowBackIcon
                sx={{
                  color: "#160449",
                  fontSize: "25px",
                  margin: "5px",
                }}
              />
            </Button>
          </Grid>
          <Grid item xs={11} md={10}>
            <Typography sx={{ color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont, textAlign: "center" }}>
              Payment History
            </Typography>
          </Grid>
          <Grid item xs={0.5} md={1} />
        </Grid>
        {data && data.length > 0 ? (
          <DataGrid
            rows={data}
            columns={columns}
            pageSizeOptions={[5, 10, 25, 100]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 5 },
              },
              sorting: {
                sortModel: [{ field: "payment_date", sort: "desc" }], // Default sorting by date
              },
            }}
            getRowId={(row) => row.payment_uid} // Use payment_uid as the unique identifier
            sx={{
              width: "100%",
              minWidth: "700px",
              backgroundColor: "#f0f0f0",
            }}
          />
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "200px" }}>
            <Typography sx={{ fontSize: "16px" }}>No Payment History Available</Typography>
          </Box>
        )}
      </Paper>
    </Grid>
  );
}

const LeaseDetails = ({ leaseDetails, rightPane, setRightPane, selectedProperty, relatedLease, isMobile, setViewRHS, setReload, handleViewTenantApplication }) => {
  // console.log("Lease Details renewal", relatedLease);
  // console.log("804 - LeaseDetails - relatedLease - ", relatedLease);
  // console.log("804 - LeaseDetails - currentLease - ", leaseDetails);
  // console.log("Lease Details ", leaseDetails);
  // console.log("selected property - ", selectedProperty)
  // console.log("Lease Details rightPane", rightPane);
  const { getProfileId, selectedRole } = useUser();
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const isRejected = leaseDetails?.lease_status === "REFUSED" || leaseDetails?.lease_status === "NEW";

  // console.log("lease details", leaseDetails);

  const currentDate = new Date();
  const leaseEndDate = new Date(leaseDetails?.lease_end);
  const noticePeriod = leaseDetails?.lease_end_notice_period ? parseInt(leaseDetails.lease_end_notice_period, 10) : 0;
  const navigate = useNavigate();

  // Calculate the number of days between the current date and the lease end date
  const timeDifference = leaseEndDate.getTime() - currentDate.getTime();
  const daysUntilLeaseEnd = Math.ceil(timeDifference / (1000 * 3600 * 24));

  // Check if Renew Lease button should be visible (if within 2x notice period)
  const showRenewLeaseButton =
    daysUntilLeaseEnd <= 2 * noticePeriod &&
    leaseDetails?.lease_renew_status !== "RENEW REQUESTED" &&
    leaseDetails?.lease_renew_status !== "PM RENEW REQUESTED" &&
    leaseDetails?.lease_renew_status !== "RENEWED" &&
    leaseDetails?.lease_renew_status !== "RENEW PROCESSING";
  const isEndingOrEarlyTermination = leaseDetails?.lease_renew_status === "ENDING" || leaseDetails?.lease_renew_status === "EARLY TERMINATION";
  const tenants = leaseDetails?.tenants ? JSON.parse(leaseDetails?.tenants) : [];
  const tenant_detail = tenants.length > 0 ? tenants[0] : null;

  const handleViewRenewProcessingLease = () => {
    if (isMobile) {
      setViewRHS(true);
    }
    if (relatedLease) {
      // console.log("877 - leaseDetails - ", leaseDetails);

      setRightPane({
        type: "tenantLeases",
        state: {
          data: relatedLease,
          status: "RENEW PROCESSING",
          lease: relatedLease,
          from: "accwidget",
          oldLeaseUid: leaseDetails.lease_uid,
        },
      });
    }
  };

  const handleViewRenewLease = () => {
    // console.log("921 - relatedLease - ", relatedLease);
    console.log("related Lease", relatedLease);
    if (isMobile) {
      setViewRHS(true);
    }
    setRightPane({
      type: "tenantApplicationEdit",
      state: {
        data: relatedLease,
        status: relatedLease.lease_status,
        lease: relatedLease,
        from: "accwidget",
      },
    });
  };

  const handleRenewLease = async () => {
    if (isMobile) {
      setViewRHS(true);
    }
    // try {
    //   const currentDate = new Date();

    //   // Send POST request to create an announcement for renewing the lease
    //   const announcementResponse = await fetch(`${APIConfig.baseURL.dev}/announcements/${getProfileId()}`, {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       announcement_title: "Renew Lease Requested",
    //       announcement_msg: "The tenant has requested to renew the lease for your property.",
    //       announcement_sender: getProfileId(),
    //       announcement_date: currentDate.toDateString(),
    //       announcement_properties: JSON.stringify(selectedProperty?.property_uid),
    //       announcement_mode: "LEASE",
    //       announcement_receiver: [leaseDetails?.contract_business_id],
    //       announcement_type: ["Email", "Text"],
    //     }),
    //   });

    //   if (!announcementResponse.ok) {
    //     throw new Error("Failed to create an announcement.");
    //   }

    //   // Display success message or perform any other action
    //   alert("Lease renewal request sent to the manager!");

    // } catch (error) {
    //   console.error("Error posting announcement: ", error);
    //   alert("Failed to send lease renewal request. Please try again.");
    // }
    setRightPane({
      type: "tenantApplicationEdit",
      state: {
        data: leaseDetails,
        status: "RENEW",
        // lease: leaseDetails,
        lease: relatedLease,
        from: "accwidget",
      },
    });
  };

  const handleEndLease = () => {
    if (isMobile) {
      setViewRHS(true);
    }
    setRightPane({
      type: "tenantEndLease",
      state: {
        leaseDetails: leaseDetails,
        selectedProperty: selectedProperty,
        // onClose: () => setRightPane(""),
      },
    });
  };

  const handleReApply = () => {
    handleViewTenantApplication();
  };

  const leaseDocumentsArray = useMemo(() => {
    try {
      return JSON.parse(leaseDetails?.lease_documents || "[]");
    } catch (error) {
      console.error("Failed to parse lease documents:", error);
      return [];
    }
  }, [leaseDetails?.lease_documents]);

  const openPreviewPane = (file) => {
    setRightPane({
      type: "filePreview",
      file: file,
      onClose: () => setRightPane({ type: "" }),
    });
  };

  return (
    <Paper
      sx={{
        // padding: "20px",
        backgroundColor: "#f0f0f0",
        position: "relative",
        height: "100%",
        width: "100%",
        borderRadius: "7px",
        flex: 1,
        // transition: 'transform 0.6s',
        // transformStyle: 'preserve-3d',
        // position: 'relative',
        // transform: isFlipped ? 'rotateY(180deg)':'rotateY(0deg)',
      }}
    >
      <Typography variant='h6' sx={{ fontWeight: "bold", color: "#160449", textAlign: "center", marginTop: "10px" }}>
        {isFlipped ? "Property Details" : "Lease Details"}
      </Typography>

      <Stack spacing={2} sx={{ marginTop: "10px" }}>
        {isFlipped ? (
          <>
            {/* Property Codes Section */}
            <Stack spacing={2} sx={{ marginBottom: "15px" }}>
              <Typography variant='subtitle1' sx={{ fontWeight: "bold", color: "#3D5CAC" }}>
                Property Codes
              </Typography>
              <Stack direction='row' justifyContent='space-between'>
                <Typography>Property Description:</Typography>
                <Typography>{leaseDetails?.property_description || "N/A"}</Typography>
              </Stack>
            </Stack>

            <Divider />

            {/* Property Amenities Section */}
            <Stack spacing={2} sx={{ marginY: "15px" }}>
              <Typography variant='subtitle1' sx={{ fontWeight: "bold", color: "#3D5CAC" }}>
                Property Amenities
              </Typography>
              <Stack direction='row' justifyContent='space-between'>
                <Typography>Community Amenities:</Typography>
                <Typography>{leaseDetails?.property_amenities_community || "N/A"}</Typography>
              </Stack>
              <Stack direction='row' justifyContent='space-between'>
                <Typography>Nearby Amenities:</Typography>
                <Typography>{leaseDetails?.property_amenities_nearby || "N/A"}</Typography>
              </Stack>
              <Stack direction='row' justifyContent='space-between'>
                <Typography>Unit Amenities:</Typography>
                <Typography>{leaseDetails?.property_amenities_unit || "N/A"}</Typography>
              </Stack>
            </Stack>

            <Divider />
            <Stack spacing={2} sx={{ marginTop: "15px" }}>
              <Typography variant='subtitle1' sx={{ fontWeight: "bold", color: "#3D5CAC" }}>
                Other Details
              </Typography>
              <Stack direction='row' justifyContent='space-between'>
                <Typography>Lease Renew:</Typography>
                <Typography>{leaseDetails?.lease_end || "N/A"}</Typography>
              </Stack>
              <Stack direction='row' justifyContent='space-between'>
                <Typography>Notice Period:</Typography>
                <Typography>{leaseDetails?.lease_end_notice_period || "N/A"}</Typography>
              </Stack>
            </Stack>
          </>
        ) : (
          // <>
          //   {/* Lease Details */}
          //   <Box sx={{ flexGrow: 1 }}>
          //     <Stack spacing={2} sx={{ marginBottom: "15px" }}>
          //       <Typography variant='subtitle1' sx={{ fontWeight: "bold", color: "#3D5CAC" }}>
          //         Rent Details
          //       </Typography>
          //       <Stack direction='row' justifyContent='space-between'>
          //         <Typography>Rent:</Typography>
          //         <Typography>${leaseDetails?.property_listed_rent || "N/A"}</Typography>
          //       </Stack>
          //       <Stack direction='row' justifyContent='space-between'>
          //         <Typography>Lease Documents:</Typography>
          //         {leaseDocumentsArray.length > 0 && (
          //           <Stack direction='row' spacing={1}>
          //             {leaseDocumentsArray.map((document, index) => (
          //               <Button
          //                 key={index}
          //                 sx={{
          //                   padding: "0px",
          //                   "&:hover": {
          //                     backgroundColor: theme.palette.form.main,
          //                   },
          //                 }}
          //                 title={document.filename} // Shows filename on hover
          //                 className='.MuiButton-icon'
          //                 onClick={() => openPreviewPane(document)}
          //               >
          //                 <img src={LeaseIcon} alt='Lease Icon' />
          //               </Button>
          //             ))}
          //           </Stack>
          //         )}
          //       </Stack>

          //       <Stack direction='row' justifyContent='space-between'>
          //         <Typography>Start Date:</Typography>
          //         <Typography>{leaseDetails?.lease_start || "N/A"}</Typography>
          //       </Stack>
          //       <Stack direction='row' justifyContent='space-between'>
          //         <Typography>End Date:</Typography>
          //         <Typography>{leaseDetails?.lease_end || "N/A"}</Typography>
          //       </Stack>
          //       <Stack direction='row' justifyContent='space-between'>
          //         <Typography>Lease Status:</Typography>
          //         <Typography>{leaseDetails?.lease_status || "N/A"}</Typography>
          //       </Stack>
          //       <Stack direction='row' justifyContent='space-between'>
          //         <Typography>Deposit:</Typography>
          //         <Typography>${leaseDetails?.property_deposit || "N/A"}</Typography>
          //       </Stack>
          //       <Stack direction='row' justifyContent='space-between'>
          //         <Typography>Notice Period:</Typography>
          //         <Typography>{noticePeriod} days</Typography>
          //       </Stack>
          //     </Stack>
          //     <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: "auto" }}>
          //       {!isEndingOrEarlyTermination && (
          //         // <Button variant='contained' onClick={handleEndLease} size='small' sx={{ padding: "5px 10px", marginRight: "10px", backgroundColor: "#3D5CAC", fontWeight: "bold"}}>
          //         <Button
          //           variant='contained'
          //           size='small'
          //           onClick={handleEndLease}
          //           sx={{
          //             fontWeight: "bold",
          //             backgroundColor: "#3D5CAC",
          //             color: "white",
          //           }}
          //         >
          //           End Lease
          //         </Button>
          //       )}

          //       {relatedLease?.lease_status === "RENEW NEW" ? (
          //         <Button
          //           variant='contained'
          //           size='small'
          //           sx={{
          //             backgroundColor: "#FFD700",
          //             color: "#FFFFF",
          //             fontWeight: "bold",
          //             textTransform: "none",
          //             marginLeft: "10px",
          //           }}
          //           onClick={handleViewRenewLease}
          //         >
          //           RENEWAL APPLICATION
          //         </Button>
          //       ) : (
          //         showRenewLeaseButton &&
          //         relatedLease?.lease_status !== "RENEW PROCESSING" && (
          //           <Button
          //             variant='contained'
          //             size='small'
          //             onClick={handleRenewLease}
          //             sx={{
          //               marginLeft: "10px",
          //               fontWeight: "bold",
          //               backgroundColor: "#3D5CAC",
          //               color: "white",
          //             }}
          //           >
          //             Renew Lease
          //           </Button>
          //         )
          //       )}

          //       {relatedLease && relatedLease.lease_status === "RENEW PROCESSING" && (
          //         <Button
          //           variant='contained'
          //           size='small'
          //           onClick={handleViewRenewProcessingLease}
          //           sx={{
          //             marginLeft: "10px",
          //             fontWeight: "bold",
          //             backgroundColor: "#76B148",
          //             color: "white",
          //           }}
          //         >
          //           View Renewal Lease
          //         </Button>
          //       )}
          //     </Box>
          //   </Box>
          // </>

          <>
            <Grid container spacing={3}>
              {/* Lease Term */}
              {leaseDetails && (
                <Grid container item spacing={2}>
                  <Grid item xs={5}>
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
                  <Grid item xs={7}>
                    <Typography
                      sx={{
                        color: theme.typography.primary.black,
                        fontWeight: theme.typography.light.fontWeight,
                        fontSize: theme.typography.smallFont,
                      }}
                    >
                      {leaseDetails?.lease_uid}
                    </Typography>
                  </Grid>
                </Grid>
              )}
              {/* Tenant Details */}
              <Grid container item spacing={2}>
                <Grid item xs={5}>
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
                <Grid item xs={5}>
                  {tenant_detail ? (
                    <Box display='flex' justifyContent='space-between' alignItems='center'>
                      <Typography
                        sx={{
                          color: theme.typography.primary.black,
                          fontWeight: theme.typography.light.fontWeight,
                          fontSize: theme.typography.smallFont,
                        }}
                      >
                        {tenant_detail?.tenant_first_name} {tenant_detail?.tenant_last_name}
                      </Typography>
                      <KeyboardArrowRightIcon
                        sx={{ color: "blue", cursor: "pointer", paddingRight: "5px" }}
                        onClick={() => {
                          if (selectedRole === "TENANT") {
                            navigate("/profileEditor");
                          } else {
                            if (tenant_detail && tenant_detail.tenant_uid) {
                              navigate("/ContactsPM", {
                                state: {
                                  contactsTab: "Tenant",
                                  tenantId: tenant_detail.tenant_uid,
                                },
                              });
                            }
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

              {/* Lease Status */}
              <Grid container item spacing={2}>
                <Grid item xs={5}>
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
                <Grid item xs={5}>
                  <Box display='flex' alignItems='center' justifyContent={"space-between"} sx={{ marginRight: "10px" }}>
                    {leaseDetails?.lease_status === "ACTIVE" || leaseDetails?.lease_status === "ACTIVE M2M" ? (
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
                        {leaseDetails?.lease_renew_status &&
                          (leaseDetails?.lease_renew_status === "PM RENEW REQUESTED" ||
                            leaseDetails?.lease_renew_status.includes("RENEW REQUESTED") ||
                            leaseDetails?.lease_renew_status === "RENEWED" ||
                            leaseDetails?.lease_renew_status === "RENEW REJECTED" ||
                            leaseDetails?.lease_renew_status === "EARLY TERMINATION" ||
                            leaseDetails?.lease_renew_status === "CANCEL RENEWAL") && (
                            <Typography
                              sx={{
                                color: leaseDetails?.lease_renew_status?.includes("RENEW") ? "#FF8A00" : "#A52A2A",
                                fontWeight: theme.typography.secondary.fontWeight,
                                fontSize: theme.typography.smallFont,
                              }}
                            >
                              {leaseDetails?.lease_renew_status == "RENEW REQUESTED" || leaseDetails?.lease_renew_status == "PM RENEW REQUESTED" ? " RENEWING" : ""}
                              {leaseDetails?.lease_renew_status === "RENEWED" ? "RENEWED" : ""}
                              {leaseDetails?.lease_renew_status === "RENEW REJECTED" ? "RENEW REJECTED" : ""}
                              {leaseDetails?.lease_renew_status == "EARLY TERMINATION" ? "END EARLY" : ""}
                              {leaseDetails?.lease_renew_status == "CANCEL RENEWAL" ? "CANCEL RENEWAL" : ""}
                            </Typography>
                          )}
                      </>
                    ) : (
                      <>
                        <Typography
                          sx={{
                            color: "#3D5CAC",
                            fontWeight: theme.typography.secondary.fontWeight,
                            fontSize: theme.typography.smallFont,
                          }}
                        >
                          {leaseDetails?.lease_status ? leaseDetails?.lease_status : "No Lease"}
                        </Typography>
                        {leaseDetails?.lease_renew_status && leaseDetails?.lease_renew_status === "EARLY TERMINATION" && (
                          <Typography
                            sx={{
                              color: leaseDetails?.lease_renew_status?.includes("RENEW") ? "#FF8A00" : "#A52A2A",
                              fontWeight: theme.typography.secondary.fontWeight,
                              fontSize: theme.typography.smallFont,
                            }}
                          >
                            {leaseDetails?.lease_renew_status == "EARLY TERMINATION" ? "CANCEL LEASE" : ""}
                          </Typography>
                        )}
                      </>
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

              {/* Lease Term */}
              {leaseDetails && (
                <Grid container item spacing={2}>
                  <Grid item xs={5}>
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
                  <Grid item xs={5}>
                    <Box display='flex' alignItems='center' justifyContent={"space-between"} sx={{ margin: "0px 10px 0px 0px" }}>
                      <>
                        <Typography
                          sx={{
                            color: theme.typography.primary.black,
                            fontWeight: theme.typography.light.fontWeight,
                            fontSize: theme.typography.smallFont,
                          }}
                        >
                          {leaseDetails?.lease_start}
                          <span style={{ fontWeight: "bold", margin: "0px 10px" }}>to</span>
                          {leaseDetails?.lease_end}
                        </Typography>
                        <Typography sx={{ fontSize: theme.typography.smallFont, color: "#A52A2A", fontWeight: theme.typography.secondary.fontWeight }}>
                          {leaseDetails?.lease_early_end_date ? leaseDetails?.lease_early_end_date : ""}
                        </Typography>
                      </>
                    </Box>
                  </Grid>
                </Grid>
              )}

              {/* Move In/Out Date */}
              {leaseDetails && (
                <Grid container item spacing={2}>
                  <Grid item xs={5}>
                    <Typography
                      sx={{
                        color: theme.typography.primary.black,
                        fontWeight: theme.typography.secondary.fontWeight,
                        fontSize: theme.typography.smallFont,
                      }}
                    >
                      Move In/Out Date:
                    </Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Box display='flex' alignItems='center' justifyContent={"space-between"} sx={{ margin: "0px 10px 0px 0px" }}>
                      <>
                        <Typography sx={{ fontSize: theme.typography.smallFont }}>{leaseDetails?.lease_move_in_date ? leaseDetails?.lease_move_in_date : ""}</Typography>

                        <Typography sx={{ fontSize: theme.typography.smallFont, color: "#A52A2A", fontWeight: theme.typography.secondary.fontWeight }}>
                          {leaseDetails?.move_out_date ? leaseDetails?.move_out_date : ""}
                        </Typography>
                      </>
                    </Box>
                  </Grid>
                </Grid>
              )}
              {/* Notice Period */}
              {leaseDetails && (
                <Grid container item spacing={2}>
                  <Grid item xs={5}>
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
                  <Grid item xs={7}>
                    <Typography
                      sx={{
                        color: theme.typography.primary.black,
                        fontWeight: theme.typography.light.fontWeight,
                        fontSize: theme.typography.smallFont,
                      }}
                    >
                      {leaseDetails?.lease_end_notice_period ? `${leaseDetails?.lease_end_notice_period} days` : "Not Specified"}
                    </Typography>
                  </Grid>
                </Grid>
              )}

              {/* Lease Renewal */}
              {leaseDetails && (
                <Grid container item spacing={2}>
                  <Grid item xs={5}>
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
                  <Grid item xs={7}>
                    <Typography
                      sx={{
                        color: theme.typography.primary.black,
                        fontWeight: theme.typography.light.fontWeight,
                        fontSize: theme.typography.smallFont,
                      }}
                    >
                      {leaseDetails?.lease_m2m == null ? "Not Specified" : ""}
                      {leaseDetails?.lease_m2m === 1 ? "Renews Month-to-Month" : ""}
                      {leaseDetails?.lease_m2m === 0 ? "Renews Automatically" : ""}
                    </Typography>
                  </Grid>
                </Grid>
              )}

              <Grid container item spacing={2} sx={{ marginTop: "3px", marginBottom: "5px" }}>
                {/* <Grid container item spacing={2} sx={{ marginTop: "3px", marginBottom: "5px", marginRight: "10px", }}>
                {relatedLease?.lease_status === "RENEW PROCESSING" &&
                  <Grid
                    item
                    xs={relatedLease?.lease_status === "RENEW PROCESSING" ? 4 : 6}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <Button
                      onClick={() => {
                        handleEndLease();
                      }}
                      variant='contained'
                      sx={{
                        background: "#3D5CAC",
                        color: theme.palette.background.default,
                        cursor: "pointer",
                        paddingX: "10px",
                        textTransform: "none",
                        // maxWidth: "120px", // Fixed width for the button
                        // maxHeight: "100%",
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
                        {"End Lease"}
                      </Typography>
                    </Button>
                  </Grid>
                } */}
                {leaseDetails?.lease_status === "ACTIVE" && (
                  <Grid
                    item
                    xs={relatedLease?.lease_status === "RENEW PROCESSING" ? 4 : 6}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <Button
                      onClick={() => {
                        handleEndLease();
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
                        {"End Lease"}
                      </Typography>
                    </Button>
                  </Grid>
                )}
                {(leaseDetails?.lease_status === "NEW" || leaseDetails?.lease_status === "PROCESSING") && (
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
                        console.log("ROHIT - 1493 - leaseDetails - ", leaseDetails);
                        handleViewTenantApplication();
                      }}
                      variant='contained'
                      sx={{
                        background: "#FFD700",
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
                        {"Update Application 1"}
                      </Typography>
                    </Button>
                  </Grid>
                )}
                {(leaseDetails?.lease_status === "WITHDRAWN" || leaseDetails?.lease_status === "REJECTED" || leaseDetails?.lease_status === "REFUSED") && (
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
                        handleReApply();
                      }}
                      variant='contained'
                      sx={{
                        background: "#FFD700",
                        color: theme.palette.background.default,
                        cursor: "pointer",
                        paddingX: "10px",
                        textTransform: "none",
                        width: "160px", // Fixed width for the button
                        maxHeight: "100%",
                      }}
                      size='small'
                    >
                      {"Re-Apply"}
                      {/* </Typography> */}
                    </Button>
                  </Grid>
                )}
                {(leaseDetails?.lease_status === "ACTIVE" || leaseDetails?.lease_status === "ACTIVE M2M") && showRenewLeaseButton && leaseDetails?.lease_renew_status !== "CANCEL RENEWAL" && (
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
                    {/* <Button
                      onClick={() => {
                        handleRenewLease();
                      }}
                      variant='contained'
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                      }}
                    > */}
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
                        {leaseDetails?.lease_renew_status === "RENEW REQUESTED" ? "Review Application" : "Renew Lease"}
                      </Typography>
                    </Button>
                  </Grid>
                )}

                {/* {console.log("1531 - relatedLease - ", relatedLease)} */}
                {relatedLease != null && (
                  <>
                    {relatedLease?.lease_status === "RENEW NEW" || relatedLease?.lease_status === "RENEW PROCESSING" ? (
                      // <Button
                      //   variant='contained'
                      //   size='small'
                      //   sx={{
                      //     backgroundColor: "#FFD700",
                      //     color: "#FFFFF",
                      //     fontWeight: "bold",
                      //     textTransform: "none",
                      //     marginLeft: "10px",
                      //   }}
                      //   onClick={handleViewRenewLease}
                      // >
                      //   RENEWAL APPLICATION
                      // </Button>
                      <Grid
                        item
                        xs={relatedLease?.lease_status === "RENEW PROCESSING" ? 4 : 6}
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: "100%",
                        }}
                      >
                        <Button
                          onClick={() => {
                            handleViewRenewLease();
                          }}
                          variant='contained'
                          sx={{
                            background: "#FFD700",
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
                            {"Update Application 2"}
                          </Typography>
                        </Button>
                      </Grid>
                    ) : (
                      showRenewLeaseButton &&
                      relatedLease?.lease_status !== "RENEW PROCESSING" &&
                      relatedLease?.lease_status !== "APPROVED" && (
                        // <Button
                        //   variant='contained'
                        //   size='small'
                        //   onClick={handleRenewLease}
                        //   sx={{
                        //     marginLeft: "10px",
                        //     fontWeight: "bold",
                        //     backgroundColor: "#3D5CAC",
                        //     color: "white",
                        //   }}
                        // >
                        //   Renew Lease
                        // </Button>
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
                              handleRenewLease();
                            }}
                            variant='contained'
                            sx={{
                              background: "#3D5CAC",
                              color: theme.palette.background.default,
                              cursor: "pointer",
                              paddingX: "10px",
                              textTransform: "none",
                              width: "100%", // Fixed width for the button
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
                              {leaseDetails?.lease_renew_status === "RENEW REQUESTED" ? "Review Application" : "Renew Lease"}
                            </Typography>
                          </Button>
                        </Grid>
                      )
                    )}
                  </>
                )}
                {console.log("ROHIT - 1780 - relatedLease - ", relatedLease)}

                {relatedLease && (relatedLease.lease_status === "RENEW PROCESSING" || relatedLease.lease_status === "APPROVED") && (
                  // <Button
                  //   variant='contained'
                  //   size='small'
                  //   onClick={handleViewRenewProcessingLease}
                  //   sx={{
                  //     marginLeft: "10px",
                  //     fontWeight: "bold",
                  //     backgroundColor: "#76B148",
                  //     color: "white",
                  //   }}
                  // >
                  //   View Renewal Lease
                  // </Button>
                  <Grid
                    item
                    xs={relatedLease?.lease_status === "RENEW PROCESSING" || relatedLease?.lease_status === "APPROVED" ? 4 : 6}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <Button
                      onClick={() => {
                        handleViewRenewProcessingLease();
                      }}
                      variant='contained'
                      sx={{
                        background: relatedLease?.lease_status === "APPROVED" ? "#3D5CAC" : "#76B148",
                        color: theme.palette.background.default,
                        cursor: "pointer",
                        paddingX: "10px",
                        textTransform: "none",
                        // maxWidth: "130px", // Fixed width for the button
                        // maxHeight: "100%",
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
                        {relatedLease.lease_status === "RENEW PROCESSING" ? "View Renewal" : ""}
                        {relatedLease.lease_status === "APPROVED" && (relatedLease.lease_status == null || relatedLease.lease_status === "EARLY TERMINATION") ? "View Renewed Lease" : ""}
                        {relatedLease.lease_status === "APPROVED" ? "View Approved Lease" : ""}
                      </Typography>
                    </Button>
                  </Grid>
                )}
              </Grid>

              {/* Lease Fees */}
              {leaseDetails && (
                <Grid container item spacing={2}>
                  <Grid item xs={6}>
                    <Typography
                      sx={{
                        color: theme.typography.primary.black,
                        fontWeight: theme.typography.secondary.fontWeight,
                        fontSize: theme.typography.smallFont,
                      }}
                    >
                      Lease Fees:
                    </Typography>
                  </Grid>
                </Grid>
              )}

              {leaseDetails && (
                <Grid container item spacing={2}>
                  {leaseDetails?.lease_fees ? (
                    <FeesSmallDataGrid data={JSON.parse(leaseDetails?.lease_fees)} isMobile={isMobile} />
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: "7px",
                        marginBottom: "10px",
                        width: "100%",
                        height: "40px",
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
              )}

              {/* Lease Documents */}
              {leaseDetails && (
                <Grid container item spacing={2}>
                  <Grid item xs={6}>
                    <Typography
                      sx={{
                        color: theme.typography.primary.black,
                        fontWeight: theme.typography.secondary.fontWeight,
                        fontSize: theme.typography.smallFont,
                      }}
                    >
                      Lease Documents:
                    </Typography>
                  </Grid>
                </Grid>
              )}

              {leaseDetails && (
                <Grid container item spacing={2}>
                  {leaseDetails?.lease_documents ? (
                    <DocumentSmallDataGrid data={JSON.parse(leaseDetails?.lease_documents)} handleFileClick={openPreviewPane} />
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: "7px",
                        marginBottom: "10px",
                        width: "100%",
                        height: "40px",
                      }}
                    >
                      <Typography
                        sx={{
                          color: "#A9A9A9",
                          fontWeight: theme.typography.primary.fontWeight,
                          fontSize: theme.typography.smallFont,
                        }}
                      >
                        No Documents
                      </Typography>
                    </Box>
                  )}
                </Grid>
              )}
            </Grid>
            {/* <Card sx={{ backgroundColor: "transparent", height: "100%", boxShadow: "none"}}>
              <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
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
                  Lease Details
                </Typography>
              </Box>
              <CardContent>
                
              </CardContent>
            </Card> */}
          </>
        )}
      </Stack>

      {/* Flip Icon as Toggle Button */}
      <IconButton
        onClick={handleFlip}
        disabled={isRejected}
        sx={{
          position: "absolute",
          top: "10px",
          right: "10px",
          padding: 0,
          opacity: isRejected ? 0 : 1,
        }}
      >
        <img src={FlipIcon} alt='Flip Icon' style={{ width: "30px", height: "30px" }} />
      </IconButton>
    </Paper>
  );
};

// export const FeesSmallDataGrid = ({ data, isMobile }) => {
//   console.log('---data---', data);
//   const commonStyles = {
//     color: theme.typography.primary.black,
//     fontWeight: theme.typography.light.fontWeight,
//     fontSize: theme.typography.smallFont,
//   };

//   const columns = [
//     {
//       field: "frequency",
//       headerName: isMobile ? "Freq" : "Frequency",
//       flex: 1,
//       renderHeader: (params) => <strong style={{ fontSize: theme.typography.smallFont }}>{params.colDef.headerName}</strong>,
//       renderCell: (params) => <Typography sx={commonStyles}>{params.value}</Typography>,
//     },
//     {
//       field: "fee_name",
//       headerName: "Name",
//       flex: isMobile ? 1 : 1.2,
//       renderHeader: (params) => <strong style={{ fontSize: theme.typography.smallFont }}>{params.colDef.headerName}</strong>,
//       renderCell: (params) => <Typography sx={commonStyles}>{params.value}</Typography>,
//     },
//     {
//       field: "charge",
//       headerName: "Charge",
//       flex: 1,
//       renderHeader: (params) => <strong style={{ fontSize: theme.typography.smallFont }}>{params.colDef.headerName}</strong>,
//       renderCell: (params) => {
//         const feeType = params.row?.fee_type;
//         const charge = params.value;

//         return <Typography sx={commonStyles}>{charge}</Typography>;
//       },
//     },
//     {
//       field: "fee_type",
//       headerName: isMobile ? "Type" : "Fee Type",
//       flex: 1,
//       renderHeader: (params) => <strong style={{ fontSize: theme.typography.smallFont }}>{params.colDef.headerName}</strong>,
//       renderCell: (params) => {
//         const feeType = params.row?.fee_type;
//         const fee_type = params.value;

//         return <Typography sx={commonStyles}>{fee_type}</Typography>;
//       },
//     },
//     {
//       field: "available_topay",
//       headerName: "Days In Advance",
//       flex: 1,
//       renderHeader: (params) => <strong style={{ fontSize: theme.typography.smallFont }}>{params.colDef.headerName}</strong>,

//   },
//   {
//       field: "late_by",
//       headerName: "Late",
//       flex: 1,
//       renderHeader: (params) => <strong style={{ fontSize: theme.typography.smallFont }}>{params.colDef.headerName}</strong>,

//   },
//   {
//       field: "late_fee",
//       headerName: "Late Fee",
//       renderHeader: (params) => <strong style={{ fontSize: theme.typography.smallFont }}>{params.colDef.headerName}</strong>,

//       flex: 1,
//   }
//   ];

//   // Adding a unique id to each row using map if the data doesn't have an id field
//   const rowsWithId = data.map((row, index) => ({
//     ...row,
//     id: row.id ? index : index,
//   }));

//   return (
//     <Box sx={{ width: "98%" }}>
//       <DataGrid
//         rows={rowsWithId}
//         columns={columns}
//         sx={{
//           marginY: "5px",
//           overflow: "auto",
//           "& .MuiDataGrid-columnHeaders": {
//             minHeight: "35px !important",
//             maxHeight: "35px !important",
//             height: 35,
//           },
//         }}
//         autoHeight
//         rowHeight={35}
//         hideFooter={true} // Display footer with pagination
//         disableColumnFilter={isMobile}
//         disableColumnSelector={isMobile}
//         disableColumnMenu={isMobile}
//       />
//     </Box>
//   );
// };

export const FeesSmallDataGrid = ({ data, isMobile }) => {
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
          {console.log("ROHIT - 1245 - params.row - ", params.row)}
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
      renderCell: (params) => <Typography>{params.row.late_fee !== "" ? `$ ${params.row.late_fee}` : "-"}</Typography>,
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
    <Box sx={{ overflowX: "auto", width: "98%" }}>
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
        rowHeight={65}
        hideFooter={true} // Display footer with pagination
        disableColumnFilter={isMobile}
        disableColumnSelector={isMobile}
        disableColumnMenu={isMobile}
      />
    </Box>
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
    <Box sx={{ width: "98%" }}>
      <DataGrid
        rows={rowsWithId}
        columns={DocColumn}
        hideFooter={true}
        autoHeight
        rowHeight={35}
        sx={{
          width: "100%",
          marginY: "5px",
          overflow: "hidden",
          "& .MuiDataGrid-columnHeaders": {
            minHeight: "35px !important",
            maxHeight: "35px !important",
            height: 35,
          },
        }}
      />
    </Box>
  );
};

const MaintenanceDetails = ({ maintenanceRequests, onPropertyClick, selectedProperty, leaseDetails, setRightPane, isMobile, setViewRHS }) => {
  // console.log("Maintenance Requests:", maintenanceRequests);
  const maintenanceStatusCounts = {
    "New Requests": maintenanceRequests?.filter((item) => item.maintenance_status.trim().toUpperCase() === "NEW REQUEST").reduce((sum, item) => sum + (item.num || 0), 0), // Sum `num` values
    "Info Requested": maintenanceRequests?.filter((item) => item.maintenance_status.trim().toUpperCase() === "INFO REQUESTED").reduce((sum, item) => sum + (item.num || 0), 0),
    Processing: maintenanceRequests?.filter((item) => item.maintenance_status.trim().toUpperCase() === "PROCESSING").reduce((sum, item) => sum + (item.num || 0), 0),
    Scheduled: maintenanceRequests?.filter((item) => item.maintenance_status.trim().toUpperCase() === "SCHEDULED").reduce((sum, item) => sum + (item.num || 0), 0),
    Completed: maintenanceRequests?.filter((item) => item.maintenance_status.trim().toUpperCase() === "COMPLETED").reduce((sum, item) => sum + (item.num || 0), 0),
    Cancelled: maintenanceRequests?.filter((item) => item.maintenance_status.trim().toUpperCase() === "CANCELLED").reduce((sum, item) => sum + (item.num || 0), 0),
  };

  // Define colors for each status
  const statusColors = {
    "New Requests": "#B62C2A",
    "Info Requested": "#D4736D",
    Processing: "#DEA19C",
    Scheduled: "#92A9CB",
    Completed: "#6788B3",
    Cancelled: "#3D5CAC",
  };

  const handleAddMaintenanceClick = () => {
    setRightPane({
      type: "addtenantmaintenance",
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
      sx={{
        backgroundColor: "#f0f0f0",
        borderRadius: "10px",
        fontFamily: "Source Sans Pro",
      }}
    >
      {/* Header with Title and Add Button */}
      <Grid container alignItems='center' justifyContent='space-between' mb={2}>
        <Grid item xs={2}></Grid>
        <Grid item xs={8} sx={{ textAlign: "center" }}>
          <Typography variant='h6' sx={{ fontWeight: "bold", color: "#160449", fontSize: "20px" }}>
            Maintenance
          </Typography>
        </Grid>
        <Grid item xs={2} sx={{ textAlign: "right" }}>
          {/* <IconButton
                    aria-label="add"
                    sx={{ color: '#3D5CAC' }}
                    onClick={handleAddMaintenanceClick}
                >
                    <AddIcon />
                </IconButton> */}
          <Button
            sx={{
              color: "#160449",
              fontSize: "30px",
              padding: "0px",
              lineHeight: "1",
              justifyContent: "center",
              "&:hover": {
                backgroundColor: "#F2F2F2",
              },
            }}
            onClick={handleAddMaintenanceClick}
          >
            {"+"}
          </Button>
        </Grid>
      </Grid>

      {/* Legend: Display all statuses even if counts are zero */}
      <Grid item xs={12}>
        <List sx={{ padding: "0", margin: "0", borderRadius: "10px" }}>
          {Object.entries(maintenanceStatusCounts).map(([status, count], index) => (
            <ListItem
              key={status}
              sx={{
                backgroundColor: statusColors[status],
                color: "#FFFFFF",
                fontFamily: "Source Sans Pro",
                fontSize: "14px",
                fontWeight: 600,
                padding: "10px 10px",
                borderTopLeftRadius: index === 0 ? "10px" : "0",
                borderTopRightRadius: index === 0 ? "10px" : "0",
                borderBottomLeftRadius: index === Object.keys(maintenanceStatusCounts).length - 1 ? "10px" : "0",
                borderBottomRightRadius: index === Object.keys(maintenanceStatusCounts).length - 1 ? "10px" : "0",
                marginTop: "0",
                marginBottom: "0",
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
      sx={{
        // padding: "24px",
        backgroundColor: "#f0f0f0",
        // margin: "auto",
        height: "100%",
        width: "100%",
        borderRadius: "7px",
        flexGrow: 1,
      }}
    >
      {/* Title */}
      <Typography variant='h6' sx={{ fontWeight: "bold", color: "#160449", marginBottom: "20px", fontSize: "20px", textAlign: "center" }}>
        Management Details
      </Typography>

      {/* Business Details */}
      <Stack spacing={2} sx={{ margin: "10px" }}>
        <Stack direction='row' justifyContent='space-between'>
          <Typography>Name:</Typography>
          <Typography>{business_name || "N/A"}</Typography>
        </Stack>
        <Stack direction='row' justifyContent='space-between'>
          <Typography>Email:</Typography>
          <Typography>{business_email || "N/A"}</Typography>
        </Stack>
        <Stack direction='row' justifyContent='space-between'>
          <Typography>Phone:</Typography>
          <Typography>{business_phone_number || "N/A"}</Typography>
        </Stack>
        <Stack direction='row' justifyContent='space-between'>
          <Typography>Emergency Phone:</Typography>
          <Typography>{business_phone_number || "N/A"}</Typography>
        </Stack>
      </Stack>
    </Paper>
  );
};

const PropertyMaintenanceRequests = ({ maintenanceStatus, selectedProperty, propertyId, onAdd, setRightPane, isMobile, setViewRHS }) => {
  console.log("maintenancestatus", maintenanceStatus);
  const [expandedRows, setExpandedRows] = useState({});

  const filteredRequests = maintenanceStatus.filter((request) => request.maintenance_property_id === propertyId);

  const toggleAccordion = (rowId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  const getColorForPriority = (priority) => {
    switch (priority) {
      case "Low":
        return "#FFFF00";
      case "Medium":
        return "#FFA500";
      case "High":
        return "#FF0000";
      default:
        return "#FFFFFF";
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
      },
    });
    // console.log('Edit clicked for:', request);
  };

  const handleBack = () => {
    if (isMobile) {
      setViewRHS(false);
    }
    setRightPane("");
  };

  // Datagrid rows
  const rows = filteredRequests.map((request) => ({
    id: request.maintenance_request_uid,
    title: request.maintenance_title,
    createdDate: request.maintenance_request_created_date || "-",
    image: request.maintenance_favorite_image || PlaceholderImage,
    scheduledDateTime:
      request.maintenance_scheduled_date && request.maintenance_scheduled_date !== "null" ? `${request.maintenance_scheduled_date} ${request.maintenance_scheduled_time || "--"}` : "--",
    status: request.maintenance_status,
    actions: request,
  }));

  // Datagrid columns
  const columns = [
    {
      field: "title",
      headerName: "Title",
      flex: 1.5,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            align: "left",
            headerAlign: "left",
            cursor: "pointer",
            background: getColorForPriority(params.row.actions.maintenance_priority),
            padding: "5px",
            color: "#000",
            borderRadius: "4px",
          }}
          onClick={() => toggleAccordion(params.row.id)}
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1.5,
      align: "left",
      headerAlign: "left",
      whiteSpace: "wrap",
    },
    {
      field: "image",
      headerName: "Images",
      flex: 1,
      align: "left",
      headerAlign: "left",
      renderCell: (params) => <img src={params.value} alt='Maintenance' style={{ width: "60px", height: "55px", objectFit: "cover" }} />,
    },
    {
      field: "scheduledDateTime",
      headerName: "Scheduled Date & Time",
      flex: 1.5,
      align: "left",
      headerAlign: "left",
      whiteSpace: "wrap",
    },
    {
      field: "createdDate",
      headerName: "Created Date",
      flex: 1.5,
      align: "left",
      headerAlign: "left",
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      align: "left",
      headerAlign: "left",
      renderCell: (params) => (
        <Stack direction='row' spacing={1}>
          <IconButton onClick={() => handleEditClick(params.row.actions)}>
            <EditIcon />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Grid container sx={{ flex: 1 }}>
      <Paper
        component={Stack}
        sx={{
          padding: isMobile ? "10px" : "20px",
          backgroundColor: "#f0f0f0",
          borderRadius: "8px",
          width: "100%",
          // height: "100%",
          // overflowX: "auto",
          marginBottom: isMobile ? "10px" : "0px",
        }}
      >
          <Grid Container sx={{ alignItems: "center", justifyContent: "center", display: "flex" }}>
            <Grid item xs={2} md={1}>
              <Button onClick={handleBack}>
                <ArrowBackIcon
                  sx={{
                    color: "#160449",
                    fontSize: "30px",
                    margin: "5px",
                  }}
                />
              </Button>
            </Grid>
            <Grid item xs={8} md={10}>
              <Typography variant='h6' sx={{ fontWeight: "bold", color: "#160449", textAlign: "center" }}>
                Maintenance Requests for Property {propertyId}
              </Typography>
            </Grid>
            <Grid item xs={2} md={1}>
              <Button onClick={onAdd}>
                <AddIcon
                  sx={{
                    color: "#160449",
                    fontSize: "30px",
                    margin: "5px",
                  }}
                />
              </Button>
            </Grid>
          </Grid>
            <DataGrid rows={rows} columns={columns} autoHeight sx={{ minWidth: "550px" }} disableColumnFilter={isMobile} disableColumnMenu={isMobile} disableColumnSelector={isMobile} />
          
        </Paper>
      </Grid>
  );
};

function PaymentsPM({ data, setRightPane, selectedProperty, leaseDetails, balanceDetails, isMobile, setViewRHS }) {
  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const { getProfileId } = useUser();

  const [showSpinner, setShowSpinner] = useState(true);
  const [paymentNotes, setPaymentNotes] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalToBePaid, setTotalToBePaid] = useState(0);
  const [totalPayable, setTotalPayable] = useState(0);
  const [partialAmount, setPartialAmount] = useState("");
  const [paymentOption, setPaymentOption] = useState("full");
  const [unpaidData, setUnpaidData] = useState([]);

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogSeverity, setDialogSeverity] = useState("error");
  // console.log(" --- check here --- ", balanceDetails, data)

  const [paymentData, setPaymentData] = useState({
    currency: "usd",
    customer_uid: getProfileId(),
    business_code: paymentNotes,
    item_uid: "320-000054",
    balance: "0.0",
    purchase_uids: [],
    payment_summary: {
      total: "17.00",
    },
  });

  useEffect(() => {
    // setShowSpinner(true)

    // console.log("data from paymentPM", selectedProperty);
    const filteredUnpaidData = data.filter((item) => item.purchaseStatus === "UNPAID" || item.purchaseStatus === "PARTIALLY PAID");
    setUnpaidData(filteredUnpaidData);

    const moneyToBePaidData = filteredUnpaidData.filter((item) => item.purchaseType === "Rent");
    const moneyPayableData = filteredUnpaidData.filter((item) => item.purchaseType === "Deposit");

    setTotalToBePaid(moneyToBePaidData.reduce((acc, item) => acc + parseFloat(item.amountDue || 0), 0));
    setTotalPayable(moneyPayableData.reduce((acc, item) => acc + parseFloat(item.amountDue || 0), 0));

    const totalAmount = filteredUnpaidData.reduce((acc, item) => acc + parseFloat(item.amountDue || 0), 0);
    if (paymentOption === "full") {
      setTotal(totalAmount);
    }

    // setShowSpinner(false)
  }, [data, paymentOption]);

  const handlePaymentNotesChange = (event) => {
    setPaymentNotes(event.target.value);
  };

  const handlePaymentOptionChange = (event) => {
    setPaymentOption(event.target.value);
    if (event.target.value === "full") {
      setPartialAmount("");
    }
  };

  const handlePartialAmountChange = (event) => {
    const value = event.target.value;
    if (value === "" || !isNaN(value)) {
      setPartialAmount(value);
    }
  };

  const handleNavigateToSelectPayment = () => {
    if (paymentOption === "partial" && parseFloat(partialAmount) > total) {
      setDialogTitle("Invalid Partial Amount");
      setDialogMessage("The partial payment amount cannot exceed the total amount.");
      setDialogOpen(true);
      return;
    }
    const updatedPaymentData = {
      ...paymentData,
      business_code: paymentNotes,
      balance: paymentOption === "partial" ? partialAmount : total, // Check here for partial amount getting passed into balance - Abhinav
    };
    console.log("check here", selectedProperty);
    navigate("/selectPayment", {
      state: {
        paymentData: updatedPaymentData,
        total: paymentOption === "partial" ? partialAmount : total,
        selectedItems: selectedItems,
        selectedProperty: selectedProperty,
        leaseDetails: leaseDetails,
        balanceDetails: balanceDetails,
        receiverId: selectedProperty?.business_uid,
      },
    });
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  const handleBackClick = () => {
    setViewRHS(false);
    setRightPane("");
  };

  return (
    <>
      <ThemeProvider theme={theme}>
        <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
          <CircularProgress color='inherit' />
        </Backdrop>

        <>
          <Grid container sx={{ flex: 1 }}>
            <Grid container>
              <Paper
                component={Stack}
                direction='column'
                justifyContent='center'
                style={{
                  width: "100%",
                  boxShadow: "none",
                }}
              >
                <Paper
                  sx={{
                    padding: "10px",
                    borderRadius: "8px",
                    backgroundColor: theme.palette.primary.main,
                  }}
                >
                  {/* <Stack direction='row'>
                    {isMobile && (
                      <Button onClick={handleBackClick}>
                        <ArrowBackIcon sx={{ color: theme.typography.primary.black, width: "20px", height: "20px", margin: "0px", marginRight: "10px" }} />
                      </Button>
                    )}
                    <Typography sx={{ color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}>
                      Payment
                    </Typography>
                  </Stack> */}
                  <Grid Container sx={{ alignItems: isMobile && "center", justifyContent: isMobile && "center", display: "flex" }}>
                    {isMobile && (
                      <Grid item xs={1} md={1}>
                        <Button onClick={handleBackClick}>
                          <ArrowBackIcon
                            sx={{
                              color: "#160449",
                              fontSize: "25px",
                              margin: "5px",
                            }}
                          />
                        </Button>
                      </Grid>
                    )}

                    <Grid item xs={10} md={10}>
                      <Typography
                        sx={{ color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont, textAlign: isMobile ? "center" : "left" }}
                      >
                        Payment
                      </Typography>
                    </Grid>
                    <Grid item xs={1} md={1} />
                  </Grid>

                  <Grid container spacing={2} alignItems='center'>
                    <Grid item xs={1}>
                      <RadioGroup aria-label='payment-option' value={paymentOption} onChange={handlePaymentOptionChange} row>
                        <FormControlLabel
                          value='full'
                          control={
                            <Radio
                              sx={{
                                color: "#3D5CAC",
                                "&.Mui-checked": {
                                  color: "#1e3a8a",
                                },
                              }}
                            />
                          }
                          label=''
                        />
                      </RadioGroup>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography sx={{ fontWeight: "bold", fontSize: isMobile ? "14px" : "18px", color: "#160449" }}>Pay Selected Balance</Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography sx={{ fontWeight: "bold", fontSize: isMobile ? "18px" : "24px", color: "#1e3a8a", textAlign: "right" }}>
                        {/* ${paymentOption === "partial" ? partialAmount || 0 : total.toFixed(2)} */}${total.toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Grid container spacing={3} alignItems='center' sx={{ justifyContent: "center" }}>
                    <Grid item xs={1}>
                      <RadioGroup aria-label='payment-option' value={paymentOption} onChange={handlePaymentOptionChange} row>
                        <FormControlLabel
                          value='partial'
                          control={
                            <Radio
                              sx={{
                                color: "#3D5CAC",
                                "&.Mui-checked": {
                                  color: "#1e3a8a",
                                },
                              }}
                            />
                          }
                          label=''
                        />
                      </RadioGroup>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography sx={{ fontWeight: "bold", fontSize: isMobile ? "14px" : "18px", color: "#160449" }}>Make Partial Payment</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      {paymentOption === "partial" && (
                        <TextField
                          value={partialAmount}
                          onChange={handlePartialAmountChange}
                          fullWidth={true}
                          label='Enter Amount'
                          variant='filled'
                          sx={{
                            height: "40px",
                            "& .MuiInputBase-root": {
                              padding: "5px",
                              color: "#00000099",
                            },
                            "& .MuiInputLabel-root": {
                              fontSize: "12px",
                              top: "-4px",
                              color: "#00000099",
                            },
                            "& .MuiInputLabel-root.Mui-focused, & .MuiInputLabel-root.MuiFormLabel-filled": {
                              color: "#00000099",
                            },
                          }}
                          InputProps={{
                            style: {
                              height: "40px",
                              fontSize: "14px",
                              color: "#000",
                            },
                          }}
                        />
                      )}
                    </Grid>
                    <Grid item xs={3}>
                      <Typography sx={{ fontWeight: "bold", fontSize: isMobile ? "18px" : "24px", color: "#1e3a8a", textAlign: "right" }}>${parseFloat(partialAmount || 0).toFixed(2)}</Typography>
                    </Grid>
                  </Grid>

                  <Stack direction='row' justifyContent='center' mt={4}>
                    <Button
                      disabled={paymentOption === "partial" && !partialAmount}
                      variant='contained'
                      sx={{
                        // marginTop: "10px",
                        backgroundColor: "#3D5CAC",
                        color: "#fff",
                        borderRadius: "5px",
                        // padding: "8px 16px",
                        minWidth: "120px",
                        boxShadow: "none",
                        textTransform: "none",
                        // fontSize: "13px",
                      }}
                      onClick={handleNavigateToSelectPayment}
                    >
                      <Typography sx={{ textTransform: "none", color: "#FFFFFF", fontSize: "15px", fontWeight: "600" }}>Make Payment</Typography>
                    </Button>
                  </Stack>
                  <Stack direction='row' justifyContent='center' m={2} sx={{ paddingTop: "15px", paddingBottom: "15px" }}>
                    <TextField
                      variant='filled'
                      fullWidth={true}
                      multiline={true}
                      rows={1} // Adjust this to control the number of rows (height)
                      value={paymentNotes}
                      onChange={handlePaymentNotesChange}
                      label='Payment Notes'
                      sx={{
                        "& .MuiInputLabel-root": {
                          color: "#00000099",
                        },
                        "& .MuiInputLabel-root.Mui-focused, & .MuiInputLabel-root.MuiFormLabel-filled": {
                          color: "#00000099",
                        },
                      }}
                    />
                  </Stack>
                </Paper>

                {/* Balance Details */}
                <Paper
                  sx={{
                    marginTop: 10,
                    padding: "20px",
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: "8px",
                  }}
                >
                  <Stack direction='row' justifyContent='space-between'>
                    <Typography sx={{ color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}>
                      Balance Details - Money Payable
                    </Typography>
                  </Stack>

                  <Stack>
                    {/* Pass only the filtered unpaid data */}
                    <TenantBalanceTablePM setShowSpinner={setShowSpinner} data={unpaidData} total={total} setTotal={setTotal} setPaymentData={setPaymentData} setSelectedItems={setSelectedItems} />
                  </Stack>
                </Paper>
              </Paper>
            </Grid>
          </Grid>
        </>
      </ThemeProvider>
      {/* Dialog for Invalid Partial Payment */}
      <GenericDialog
        isOpen={isDialogOpen}
        title={dialogTitle}
        contextText={dialogMessage}
        actions={[
          {
            label: "OK",
            onClick: closeDialog,
          },
        ]}
        severity={dialogSeverity}
      />
    </>
  );
}

function TenantBalanceTablePM(props) {
  const [data, setData] = useState(props.data);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [paymentDueResult, setPaymentDueResult] = useState([]);
  // console.log("props", data);

  useEffect(() => {
    setData(props.data);
    // console.log("props", props);
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
    props.setShowSpinner(true);

    let total = 0;
    let purchase_uid_mapping = [];

    let sortedPaymentItems = selectedRows
      .map((item) => {
        let paymentItemData = paymentDueResult.find((element) => element.purchase_uid === item);
        return {
          purchase_uid: item,
          description: paymentItemData.description,
          pur_amount_due: paymentItemData.pur_amount_due,
          pur_cf_type: paymentItemData.pur_cf_type,
          dueDate: new Date(paymentItemData.dueDate),
        };
      })
      .sort((a, b) => a.dueDate - b.dueDate);

    for (const item of sortedPaymentItems) {
      purchase_uid_mapping.push({ purchase_uid: item.purchase_uid, pur_amount_due: item.pur_amount_due.toFixed(2), description: item.description });

      // Adjust total based on pur_cf_type
      if (item.pur_cf_type === "revenue") {
        total += parseFloat(item.pur_amount_due);
      } else if (item.pur_cf_type === "expense") {
        total -= parseFloat(item.pur_amount_due);
      }
    }

    props.setTotal(total);
    props.setPaymentData((prevPaymentData) => ({
      ...prevPaymentData,
      balance: total.toFixed(2),
      purchase_uids: purchase_uid_mapping,
    }));

    props.setShowSpinner(false);
  }, [selectedRows, paymentDueResult]);

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
      field: "pur_amount_due",
      headerName: "Total",
      flex: 1,
      renderCell: (params) => {
        const total = parseFloat(params.row.pur_amount_due) + parseFloat(params.row.totalPaid);
        return <Box sx={{ fontWeight: "bold", textAlign: "right", width: "100%" }}>${total.toFixed(2)}</Box>;
      },
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
      renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value.split(" ")[0]}</Box>,
    },
    {
      field: "totalPaid",
      headerName: "Amount Paid",
      flex: 1,
      renderCell: (params) => (
        <Box
          sx={{
            fontWeight: "bold",
            width: "100%",
            display: "flex",
            textAlign: "right",
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          {params.row.pur_cf_type === "revenue" ? `$ ${parseFloat(params.value).toFixed(2)}` : `($ ${parseFloat(params.value).toFixed(2)})`}
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ width: "100%", flex: 1, overflowX: "auto" }}>
      {paymentDueResult.length > 0 && (
        <DataGrid
          sx={{
            width: "100%",
            minWidth: "700px",
          }}
          rows={paymentDueResult}
          columns={columnsList}
          pageSizeOptions={[10, 50, 100]}
          checkboxSelection
          disableRowSelectionOnClick
          rowSelectionModel={selectedRows}
          onRowSelectionModelChange={handleSelectionModelChange}
          getRowId={(row) => row.purchase_uid}
          initialState={{
            sorting: {
              sortModel: [{ field: "purchaseDate", sort: "asc" }],
            },
          }}
        />
      )}
    </Box>
  );
}

function DocumentPreview({ file, onClose }) {
  const previewRef = useRef(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    const preview = previewRef.current;
    if (preview) {
      const shiftX = e.clientX - preview.getBoundingClientRect().left;
      const shiftY = e.clientY - preview.getBoundingClientRect().top;

      setDragOffset({ x: shiftX, y: shiftY });

      const onMouseMove = (e) => {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;

        preview.style.left = `${newX}px`;
        preview.style.top = `${newY}px`;
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "220%",
        backgroundColor: "white",
        boxShadow: 3,
        borderRadius: 2, // Rounded edges for the outer box
        overflow: "hidden", // Ensures rounded corners are applied to content
      }}
      onMouseDown={handleMouseDown}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px",
          backgroundColor: "#f0f0f0",
        }}
      >
        <Typography variant='h6'>{file?.filename || "File Preview"}</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Box
        sx={{
          height: "100%",
          width: "100%",
          overflowY: "auto",
          // padding: "1px",
        }}
      >
        {file ? (
          <iframe
            src={file.link}
            width='100%'
            height='100%'
            title='File Preview'
            style={{
              border: "none",
              borderBottomLeftRadius: 8, // Rounded bottom left corner
              borderBottomRightRadius: 8, // Rounded bottom right corner
            }}
          />
        ) : (
          <Typography>No file selected</Typography>
        )}
      </Box>
    </Box>
  );
}

export default TenantDashboard;
