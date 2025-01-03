import { Chart } from "react-google-charts";
import { Button, Box, ThemeProvider, Grid, Container, Paper, Typography, IconButton } from "@mui/material";
import { PieChart, Pie, Legend, Cell } from "recharts";
import CashflowWidget from "../Dashboard-Components/Cashflow/CashflowWidget";
import MaintenanceWidget from "../Dashboard-Components/Maintenance/MaintenanceWidget";
import "../../css/maintenance.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import theme from "../../theme/theme";
import Dollar from "../../images/Dollar.png";
import File_dock_fill from "../../images/File_dock_fill.png";
import User_fill_dark from "../../images/User_fill_dark.png";
import { useUser } from "../../contexts/UserContext";
import OwnerPropertyRentWidget from "./OwnerPropertyRentWidget";
import LeaseWidget from "../Dashboard-Components/Lease/LeaseWidget";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { makeStyles } from "@material-ui/core";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import useMediaQuery from "@mui/material/useMediaQuery";
import NewCardSlider from "../Announcement/NewCardSlider";
import APIConfig from "../../utils/APIConfig";
import Announcements from "../Announcement/Announcements";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Import the back arrow icon
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../utils/httpMiddleware";
import { ListsProvider } from "../../contexts/ListsContext";

const useStyles = makeStyles({
  button: {
    width: "100%",
    fontSize: "13px",
    marginBottom: "10px",
  },
  container: {
    width: "90%",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: "25px",
  },
  row: {
    marginBottom: "20px",
  },
});

export default function OwnerDashboard() {
  const { user, getProfileId } = useUser();
  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();

  let date = new Date();
  const [rentStatus, setRentStatus] = useState([]);
  const [leaseStatus, setLeaseStatus] = useState([]);
  const [maintenanceStatusData, setMaintenanceStatusData] = useState([]);
  const [cashflowStatusData, setCashflowStatusData] = useState([]);
  const [propertList, setPropertyList] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [showSpinner, setShowSpinner] = useState(true); // Initially set to true
  const [currentMonth, setCurrentMonth] = useState(date.getMonth() + 1);

  const [moveoutsInSixWeeks, setMoveoutsInSixWeeks] = useState(0);
  const sliceColors = ["#A52A2A", "#FF8A00", "#FFC85C", "#160449", "#3D5CAC"];

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isMedium = useMediaQuery(theme.breakpoints.down("md"));

  const [announcementSentData, setAnnouncementSentData] = useState([])
  const [announcementRecvData, setAnnouncementRecvData] = useState([])

  const [view, setView] = useState("dashboard");
  const [viewRHS, setViewRHS] = useState(false)
  const [showReferralWelcomeDialog, setShowReferralWelcomeDialog] = useState(false);
  // //console.log("getProfileId()", getProfileId());

  const fetchData = async () => {
    setShowSpinner(true); // Show spinner when data fetching starts
    if (!getProfileId()) {
      setShowSpinner(false);
      return;
    }
    // //console.log("getProfileId*", getProfileId());
    // if (!getProfileId()) {
    //   let newRole = "OWNER";
    //   navigate("/addNewRole", { state: { user_uid: user.user_uid, newRole } });
    // }
    
    const response = await fetch(`${APIConfig.baseURL.dev}/dashboard/${getProfileId()}`);
    const jsonData = await response.json();

    // const announcementsResponse = await fetch(`${APIConfig.baseURL.dev}/announcements/${getProfileId()}`);
    // const announcementsResponseData = await announcementsResponse.json();

    let announcementsReceivedData = jsonData?.announcementsReceived?.result;
    if (announcementsReceivedData && Array.isArray(announcementsReceivedData)) {
      announcementsReceivedData.sort((a, b) => new Date(b.announcement_date) - new Date(a.announcement_date));
    }    
    setAnnouncementRecvData(announcementsReceivedData || ["Card 1", "Card 2", "Card 3", "Card 4", "Card 5"]);

    setAnnouncementSentData(jsonData?.announcementsSent?.result);
    setPropertyList(jsonData?.properties?.result);

    setMaintenanceStatusData(jsonData.maintenanceStatus.result);
    setCashflowStatusData(jsonData.cashflowStatus);
    setRentStatus(jsonData.rentStatus.result);
    setLeaseStatus(jsonData.leaseStatus.result);
    setDataLoaded(true);
    setShowSpinner(false); // Hide spinner when data is loaded
  };

  useEffect(() => {    
    
    // Already called fetchData() in "user" useeffect

    // const fetchInitialData = async () => {
    //   if(!dataLoaded){
    //     await fetchData();
    //   }
    // };
  
    // fetchInitialData();

    const signedUpWithReferral = localStorage.getItem("signedUpWithReferral");
    if (signedUpWithReferral && signedUpWithReferral === "true") {
      setShowReferralWelcomeDialog(true);
      localStorage.removeItem("signedUpWithReferral");
    }

  }, []);

  useEffect(() => {    
    
    const fetchInitialData = async () => {
      await fetchData();
    };
  
    fetchInitialData();

    const signedUpWithReferral = localStorage.getItem("signedUpWithReferral");
    if (signedUpWithReferral && signedUpWithReferral === "true") {
      setShowReferralWelcomeDialog(true);
      localStorage.removeItem("signedUpWithReferral");
    }
  }, [user]);

  useEffect(() => {
    if(location?.state?.from){
      setView("dashboard")
    }
  }, [location?.state])

  return (
    <ThemeProvider theme={theme}>
      {showSpinner ? (
        <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={true}>
          <CircularProgress color='inherit' />
        </Backdrop>
      ) : (
        <Container maxWidth='lg' sx={{ paddingTop: "10px", paddingBottom: "50px" }}>
          <Grid container spacing={6}>
            {view === "dashboard" ? (
              <>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: isMobile ? "column" : "row",
                      justifyContent: isMobile ? "center" : "left",
                      paddingLeft: "10px",
                      paddingRight: "10px",
                      alignText: "center",
                      alignContent: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: { xs: "22px", sm: "28px", md: "32px" },
                        fontWeight: "600",
                      }}
                    >
                      Welcome, {user.first_name}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <CashflowWidget page={"OwnerDashboard"} allProperties={propertList} data={cashflowStatusData} originalData={cashflowStatusData}/>
                </Grid>
                <Grid container item xs={12} md={8} columnSpacing={6}>
                  <Grid item xs={12} md={6} sx={{ marginBottom: isMobile ? "10px" : "1px" }}>
                    <OwnerPropertyRentWidget rentData={rentStatus} />
                  </Grid>
                  <Grid item xs={12} md={6} sx={{ marginBottom: "1px" }}>
                    <MaintenanceWidget maintenanceData={maintenanceStatusData} />
                  </Grid>
                  <Grid item xs={12}>
                    <LeaseWidget leaseData={leaseStatus} />
                  </Grid>
                  <Grid item xs={12}>
                    <Grid item xs={12} sx={{ backgroundColor: "#F2F2F2", paddingBottom: "40px", borderRadius: "10px", height: "100%" }}>
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
                              flexGrow: 1,
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            <Typography
                              sx={{
                                color: "#160449",
                                fontSize: { xs: "24px", sm: "24px", md: "24px" },
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
                              flex: 1,
                              height: "100%",
                            }}
                          >
                            <Box
                              sx={{
                                color: "#007AFF",
                                fontSize: "15px",
                                paddingRight: "25px",
                                fontWeight: "bold",
                                cursor: "pointer"
                              }}
                              onClick={() => {
                                isMobile ? setViewRHS(true) : setViewRHS(false)
                                setView("announcements")
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
                        <Box sx={{ display: "flex", alignItems: "center", alignContent: "center", justifyContent: "center", minHeight: "235px" }}>
                          <Typography sx={{ fontSize: { xs: "18px", sm: "18px", md: "20px", lg: "24px" } }}>No Announcements</Typography>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </Grid>
              </>
            ) : (
              <>
                {(!isMobile || !viewRHS) && (<Grid item xs={12} md={4}>
                  <CashflowWidget page={"OwnerDashboard"} data={cashflowStatusData} allProperties={propertList} originalData={cashflowStatusData}/>
                </Grid>)}
                {(!isMobile || viewRHS) && (<Grid item xs={12} md={8}>
                  {/* <Box sx={{ display: "flex", alignItems: "center", paddingTop: "10px" }}>
                    <IconButton onClick={() => setView("dashboard")} sx={{ marginRight: "10px" }}>
                      <ArrowBackIcon />
                    </IconButton>
                  </Box> */}
                  <Box>
                    <Announcements sentAnnouncementData={announcementSentData} recvAnnouncementData={announcementRecvData} setView={setView}/>
                  </Box>
                </Grid>)}
              </>
            )}
          </Grid>
        </Container>
      )}

      <Dialog open={showReferralWelcomeDialog} onClose={() => setShowReferralWelcomeDialog(false)} aria-labelledby='alert-dialog-title' aria-describedby='alert-dialog-description'>
        <DialogContent>
          <DialogContentText
            id='alert-dialog-description'
            sx={{
              color: theme.typography.common.blue,
              fontWeight: theme.typography.common.fontWeight,
              paddingTop: "10px",
            }}
          >
            Hello, {user.first_name}! Welcome to ManifestMySpace. To complete your profile setup, please verify your information by clicking the profile button below. You'll need
            to add additional details such as your SSN and address. Thank you!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowReferralWelcomeDialog(false)}
            sx={{
              color: "white",
              backgroundColor: "#3D5CAC80",
              ":hover": {
                backgroundColor: "#3D5CAC",
              },
            }}
            autoFocus
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
