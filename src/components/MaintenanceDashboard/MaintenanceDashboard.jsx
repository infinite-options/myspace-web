import { Chart } from "react-google-charts";
import { Button, Box, ThemeProvider, Grid, Paper, Stack, Typography } from "@mui/material";
import { RadialBarChart, RadialBar, Legend, LabelList } from "recharts";
import MaintenanceWidget from "../Dashboard-Components/Maintenance/MaintenanceWidget";
import "../../css/maintenance.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import theme from "../../theme/theme";
import { useUser } from "../../contexts/UserContext";

import phone from "./phone.png";
import document from "./document.png";
import card from "./card.png";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import MaintenanceWorker from "../Maintenance/Worker/MaintenanceWorker";
import MaintenanceWorkerDashboardWidget from "../Maintenance/Worker/MaintenanceWorkerDashboardWidget";
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../utils/httpMiddleware";
import APIConfig from "../../utils/APIConfig";

export default function MaintenanceDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, getProfileId, selectedRole } = useUser();
  let dashboard_id = getProfileId();
  if (selectedRole === "MAINT_EMPLOYEE") dashboard_id = user.businesses?.MAINTENANCE?.business_uid || user?.maint_supervisor;

  const [quoteRequestedCount, setQuoteRequestedCount] = useState(0);
  const [submittedCount, setSubmittedCount] = useState(0);
  const [quoteAcceptedCount, setQuoteAcceptedCount] = useState(0);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [finishedCount, setFinishedCount] = useState(0);
  const [paidCount, setPaidCount] = useState(0);
  const [showSpinner, setShowSpinner] = useState(false);
  const [quotesAcceptedCashflow, setQuotesAcceptedCashflow] = useState(0);
  const [quotesScheduledCashflow, setQuotesScheduledCashflow] = useState(0);
  const [quotesSubmittedCashflow, setQuotesSubmittedCashflow] = useState(0);
  const [quotesFinishedCashflow, setQuotesFinishedCashflow] = useState(0);
  const [api_data, set_api_data] = useState({});
  const [refresh, setRefresh] = useState(false || location.state?.refresh);
  const [chartSize, setChartSize] = useState(400);
  const data = [
    {
      name: "Quotes Requested" + "(" + quoteRequestedCount + ")",
      count: quoteRequestedCount,
      fill: "#DB9687",
    },
    {
      name: "Quotes Submitted" + "(" + submittedCount + ")",
      count: submittedCount,
      fill: "#CEA892",
    },
    {
      name: "Quotes Accepted" + "(" + quoteAcceptedCount + ")",
      count: quoteAcceptedCount,
      fill: "#BAAC7A",
    },
    {
      name: "Scheduled" + "(" + scheduledCount + ")",
      count: scheduledCount,
      fill: "#959A76",
    },
    {
      name: "Finished" + "(" + finishedCount + ")",
      count: finishedCount,
      fill: "#598A96",
    },
    {
      name: "Paid" + "(" + paidCount + ")",
      count: paidCount,
      fill: "#6588AC",
    },
  ];

  useEffect(() => {
    const handleResize = () => {
      // Calculate the minimum dimension of the screen
      const minDimension = Math.min(window.innerWidth, window.innerHeight);
      // Update the chart size based on the minimum dimension
      setChartSize(minDimension * 0.8); // Adjust the factor (0.8) as needed
    };

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Call handleResize initially to set the initial chart size
    handleResize();

    // Cleanup function to remove event listener
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Checking if the supervisor has verified the employee
  useEffect(() => {
    if (selectedRole === "MAINT_EMPLOYEE") {
      const emp_verification = async () => {
        try {
          const response = await fetch(`${APIConfig.baseURL.dev}/profile/${getProfileId()}`);
          if (!response.ok) {
            throw new Error("Failed to fetch data");
          }
          const data = await response.json();
          const employee = data.result[0]; // Assuming there's only one employee
          if (!employee?.employee_verification) {
            navigate("/emp_waiting");
          }
        } catch (error) {
          console.error(error);
        }
      };

      emp_verification();
    }
  }, []);

  useEffect(() => {
    if (!getProfileId()) {
      let newRole = "MAINTENANCE";
      navigate("/addNewRole", { state: { user_uid: user.user_uid, newRole } });
    }

    const getMaintenanceWorkerDashboardData = async () => {
      setShowSpinner(true);
      try {
        const response = await fetch(`${APIConfig.baseURL.dev}/dashboard/${dashboard_id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        set_api_data(data);

        var rejected_count = 0;

        for (const item of data.currentActivities.result) {
          switch (item.maintenance_status) {
            case "REQUESTED":
              setQuoteRequestedCount(item.num);
              break;

            case "SUBMITTED":
              setSubmittedCount(item.num);
              setQuotesSubmittedCashflow(parseInt(item.total_estimate));
              break;

            case "ACCEPTED":
              setQuoteAcceptedCount(item.num);
              setQuotesAcceptedCashflow(parseInt(item.total_estimate));
              break;

            case "SCHEDULED":
              setScheduledCount(item.num);
              setQuotesScheduledCashflow(parseInt(item.total_estimate));
              break;

            case "FINISHED":
              setFinishedCount(item.num);
              setQuotesFinishedCashflow(parseInt(item.total_estimate));
              break;

            case "PAID":
              setPaidCount(item.num);
              break;

            default:
              // Handle unexpected status or do nothing
              break;
          }
        }
      } catch (error) {
        //console.log("Error getting maintenance worker dashboard data: ", error);
      }
      setShowSpinner(false);
    };
    getMaintenanceWorkerDashboardData();
    setRefresh(false);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
        <CircularProgress color='inherit' />
      </Backdrop>
      <Stack
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          paddingBottom: "500px",
        }}
      >
        <>
          <Grid container direction='row' rowGap={5}>
            <Grid item xs={12}>
              <Box
                style={{
                  display: "flex",
                  justifyContent: "center",
                  width: "100%", // Take up full screen width
                  paddingTop: "25px",
                  paddingBottom: "25px",
                  marginTop: theme.spacing(2), // Set the margin to 20px
                }}
              >
                <Typography sx={{ color: "#000000", fontWeight: theme.typography.common.fontWeight, fontSize: "26px" }}>Hello {user.first_name}!</Typography>
              </Box>
            </Grid>
            <Grid item xs={8}>
              <Box
                style={{
                  display: "flex",
                  justifyContent: "center",
                  width: "100%", // Take up full screen width
                  marginTop: theme.spacing(2), // Set the margin to 20px
                  padding: theme.spacing(2), // Add padding to the Box component
                }}
              >
                <Paper
                  style={{
                    padding: theme.spacing(2),
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: theme.palette.primary.main,
                    width: "90%", // Occupy full width with 25px margins on each side
                    [theme.breakpoints.down("sm")]: {
                      width: "80%",
                    },
                    [theme.breakpoints.up("sm")]: {
                      width: "50%",
                    },
                    paddingTop: "10px",
                    overflow: "hidden", // Add this line to prevent content from sticking out
                  }}
                >
                  <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight, fontSize: "22px" }}>Current Activity</Typography>
                  <Box
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginTop: theme.spacing(2), // Set the margin to 20px
                      position: "relative",
                    }}
                  >
                    <RadialBarChart
                      width={chartSize}
                      height={chartSize}
                      innerRadius='10%'
                      outerRadius='90%'
                      data={data.reverse()}
                      startAngle={90}
                      endAngle={-180} // -180
                    >
                      <RadialBar minAngle={15} background clockWise={true} dataKey='count' />
                    </RadialBarChart>
                    <Legend
                      iconSize={20}
                      layout='vertical'
                      verticalAlign='middle'
                      align='right'
                      alignItems='right'
                      justifyContent='space-between'
                      wrapperStyle={{
                        position: "absolute",
                        left: "5%", // Adjusted to move the legend to the left
                        top: "50%",
                        transform: "translateY(-50%)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                      }}
                      margin={{ top: 20, left: 20, right: 20, bottom: 20 }}
                      payload={data
                        .map((item) => ({
                          value: item.name,
                          type: "square",
                          id: item.name,
                          color: item.fill,
                        }))
                        .reverse()}
                    />
                  </Box>
                </Paper>
              </Box>
            </Grid>
            <Grid
              item
              xs={4}
              sx={{
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Grid container direction='column' columnGap={5} rowGap={5}>
                <Grid item xs={12}>
                  <Box
                    variant='contained'
                    sx={{
                      flexDirection: "column",
                      backgroundColor: "#CEA892",
                      textTransform: "none",
                      paddingRight: "10px",
                      paddingTop: "10px",
                      paddingBottom: "10px",
                      borderRadius: "10px",
                      paddingLeft: "10px",
                      display: "flex",
                      width: "80%",
                      alignItems: "center",
                    }}
                  >
                    <Typography sx={{ color: "#FFFFFF", fontWeight: theme.typography.primary.fontWeight, fontSize: "16px" }}>Quotes Submitted Cashflow</Typography>
                    <Typography sx={{ color: "#FFFFFF", fontWeight: theme.typography.primary.fontWeight, fontSize: "26px" }}>${quotesSubmittedCashflow}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box
                    variant='contained'
                    sx={{
                      flexDirection: "column",
                      backgroundColor: "#BAAC7A",
                      textTransform: "none",
                      paddingRight: "10px",
                      paddingTop: "10px",
                      paddingBottom: "10px",
                      borderRadius: "10px",
                      paddingLeft: "10px",
                      display: "flex",
                      width: "80%",
                      alignItems: "center",
                    }}
                  >
                    <Typography sx={{ color: "#FFFFFF", fontWeight: theme.typography.primary.fontWeight, fontSize: "16px" }}>Quotes Accepted Cashflow</Typography>
                    <Typography sx={{ color: "#FFFFFF", fontWeight: theme.typography.primary.fontWeight, fontSize: "26px" }}>${quotesAcceptedCashflow}</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box
                    variant='contained'
                    sx={{
                      flexDirection: "column",
                      backgroundColor: "#959A76",
                      textTransform: "none",
                      paddingRight: "10px",
                      paddingTop: "10px",
                      paddingBottom: "10px",
                      borderRadius: "10px",
                      paddingLeft: "10px",
                      display: "flex",
                      width: "80%",
                      alignItems: "center",
                    }}
                  >
                    <Typography sx={{ color: "#FFFFFF", fontWeight: theme.typography.primary.fontWeight, fontSize: "16px" }}>Scheduled Cashflow</Typography>
                    <Typography sx={{ color: "#FFFFFF", fontWeight: theme.typography.primary.fontWeight, fontSize: "26px" }}>${quotesScheduledCashflow}</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box
                    variant='contained'
                    sx={{
                      flexDirection: "column",
                      backgroundColor: "#598A96",
                      textTransform: "none",
                      paddingRight: "10px",
                      paddingTop: "10px",
                      paddingBottom: "10px",
                      borderRadius: "10px",
                      paddingLeft: "10px",
                      display: "flex",
                      width: "80%",
                      alignItems: "center",
                    }}
                  >
                    <Typography sx={{ color: "#FFFFFF", fontWeight: theme.typography.primary.fontWeight, fontSize: "16px" }}>Finished Cashflow</Typography>
                    <Typography sx={{ color: "#FFFFFF", fontWeight: theme.typography.primary.fontWeight, fontSize: "26px" }}>${quotesFinishedCashflow}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid container direction='row' justifyContent='center' sx={{ paddingTop: "25px" }}>
            <Grid item xs={12}>
              <Box
                style={{
                  display: "flex",
                  justifyContent: "center",
                  width: "100%", // Take up full screen width
                  minHeight: "300px", // Set the Box height to full height
                  marginTop: theme.spacing(2), // Set the margin to 20px
                }}
              >
                <Paper
                  style={{
                    padding: theme.spacing(2),
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: theme.palette.primary.main,
                    width: "90%", // Occupy full width with 25px margins on each side
                    [theme.breakpoints.down("sm")]: {
                      width: "80%",
                    },
                    [theme.breakpoints.up("sm")]: {
                      width: "50%",
                    },
                    paddingTop: "10px",
                  }}
                >
                  <MaintenanceWorkerDashboardWidget />
                </Paper>
              </Box>
            </Grid>
          </Grid>
          <Grid container direction='row' justifyContent='center' sx={{ paddingTop: "30px" }}>
            <Grid
              item
              xs={4}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Button
                variant='contained'
                sx={{
                  backgroundColor: "#DEDFE3",
                  textTransform: "none",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  "&:hover": {
                    backgroundColor: "#C4C5C9", // Slightly darker
                  },
                  "&:active": {
                    backgroundColor: "#B1B3B6", // Even darker
                  },
                  "&:focus": {
                    backgroundColor: "#C4C5C9", // Slightly darker
                    // You might also want to adjust the outline on focus
                    outline: "none",
                    boxShadow: "0 0 0 3px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <Box
                  component='img'
                  src={document}
                  alt='Contacts'
                  sx={{
                    width: "20px",
                    height: "20px",
                    pr: "15px", // Using padding-right
                  }}
                />
                <Typography
                  sx={{
                    color: "#160449",
                    fontWeight: theme.typography.common.fontWeight,
                    fontSize: theme.typography.smallFont,
                  }}
                >
                  Documents
                </Typography>
              </Button>
            </Grid>
            <Grid
              item
              xs={4}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Button
                variant='contained'
                sx={{
                  backgroundColor: "#DEDFE3",
                  textTransform: "none",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  "&:hover": {
                    backgroundColor: "#C4C5C9", // Slightly darker
                  },
                  "&:active": {
                    backgroundColor: "#B1B3B6", // Even darker
                  },
                  "&:focus": {
                    backgroundColor: "#C4C5C9", // Slightly darker
                    // You might also want to adjust the outline on focus
                    outline: "none",
                    boxShadow: "0 0 0 3px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <Box
                  component='img'
                  src={card}
                  alt='Contacts'
                  sx={{
                    width: "28px",
                    height: "28px",
                    pr: "15px", // Using padding-right
                  }}
                />
                <Typography
                  sx={{
                    color: "#160449",
                    fontWeight: theme.typography.common.fontWeight,
                    fontSize: theme.typography.smallFont,
                  }}
                >
                  Payments
                </Typography>
              </Button>
            </Grid>
            <Grid
              item
              xs={4}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Button
                variant='contained'
                sx={{
                  backgroundColor: "#DEDFE3",
                  textTransform: "none",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  "&:hover": {
                    backgroundColor: "#C4C5C9", // Slightly darker
                  },
                  "&:active": {
                    backgroundColor: "#B1B3B6", // Even darker
                  },
                  "&:focus": {
                    backgroundColor: "#C4C5C9", // Slightly darker
                    // You might also want to adjust the outline on focus
                    outline: "none",
                    boxShadow: "0 0 0 3px rgba(0,0,0,0.1)",
                  },
                }}
                onClick={() => navigate("/maintenanceContacts")}
              >
                <Box
                  component='img'
                  src={phone}
                  alt='Contacts'
                  sx={{
                    width: "13px",
                    height: "17px",
                    pr: "15px", // Using padding-right
                  }}
                />
                <Typography
                  sx={{
                    color: "#160449",
                    fontWeight: theme.typography.common.fontWeight,
                    fontSize: theme.typography.smallFont,
                  }}
                >
                  Contacts
                </Typography>
              </Button>
            </Grid>
          </Grid>
        </>
      </Stack>
    </ThemeProvider>
  );
}
