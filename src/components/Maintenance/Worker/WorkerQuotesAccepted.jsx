
import { 
    ThemeProvider, 
    Typography,
    Box,
    Tabs,
    Tab,
    Paper,
    Card,
    CardHeader,
    Slider,
    Stack,
    Button,
    Grid,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import theme from '../../../theme/theme';
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import ChatIcon from '@mui/icons-material/Chat';
import CancelTicket from "../../utils/CancelTicket";
import CompleteTicket from "../../utils/CompleteTicket";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import QuoteDetailInfo from "./QuoteDetailInfo";
import { useUser } from "../../../contexts/UserContext";
import Backdrop from "@mui/material/Backdrop"; 
import CircularProgress from "@mui/material/CircularProgress";
import ManagerProfileLink from "../MaintenanceComponents/ManagerProfileLink";
import Scheduler from "../../utils/Scheduler";
import DateTimePickerModal from "../../DateTimePicker";
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../../utils/httpMiddleware";
import APIConfig from "../../../utils/APIConfig";

export default function WorkerQuotesAccepted({maintenanceItem, refreshMaintenanceData}){
    const navigate = useNavigate();
    const { maintenanceRoutingBasedOnSelectedRole } = useUser();
    const [showSpinner, setShowSpinner] = useState(false);
    const [showScheduler, setShowScheduler] = useState(false);
    const [schedulerDate, setSchedulerDate] = useState(maintenanceItem.quote_earliest_available_date ? maintenanceItem.quote_earliest_available_date : "");    
    const [schedulerTime, setSchedulerTime] = useState(maintenanceItem.quote_earliest_available_time ? maintenanceItem.quote_earliest_available_time : "");    
    

    function handleNavigateToQuotesRequested(){

        //console.log("NewRequestAction", maintenanceItem)
        navigate("/quoterequest", {
            state:{
                maintenanceItem
            }
        });
    }

    async function handleCancel(id){ // Change
        let response = CancelTicket(id, setShowSpinner);
        //console.log("handleCancel", response)
        if (response){
            //console.log("Ticket Cancelled")
            alert("Ticket Cancelled")
            navigate('/maintenanceDashboard2')
        } else{
            //console.log("Ticket Not Cancelled")
            alert("Error: Ticket Not Cancelled")
        }
    }

    async function handleScheduleChange(id, date, time){

        //console.log("handleScheduleChange", id, date, time)

        const changeMaintenanceRequestStatus = async () => {
            setShowSpinner(true);

            const formData = new FormData();
            formData.append("maintenance_request_uid",  maintenanceItem.maintenance_request_uid);
            formData.append("maintenance_request_status", "SCHEDULED");
            formData.append("maintenance_scheduled_date", schedulerDate); // this needs to change for the date and time picker
            formData.append("maintenance_scheduled_time", schedulerTime); // this needs to change for the date and time picker
            try {
                const response = await fetch(`${APIConfig.baseURL.dev}/maintenanceRequests`, {
                    method: 'PUT',
                    body: formData,
                });

                const responseData = await response.json();
                // //console.log(responseData);
                if (response.status === 200) {
                    //console.log("success")
                    changeQuoteStatus();
                } else{
                    //console.log("error setting status")
                }
            } catch (error){
                //console.log("error", error)
            }
            setShowSpinner(false);
        }

        const changeQuoteStatus = async () => {
            setShowSpinner(true);
            var formData = new FormData();
            formData.append("maintenance_quote_uid", maintenanceItem.maintenance_quote_uid);
            formData.append("quote_status", "SCHEDULED");
            try {
                const response = await fetch(`${APIConfig.baseURL.dev}/maintenanceQuotes`, {
                    method: 'PUT',
                    body: formData
                });
                const responseData = await response.json();
                //console.log(responseData)
                // if (responseData.code === 200){
                if (response.status === 200){
                    // //console.log("Ticket Status Changed")
                    // alert("Ticket Status Changed to SCHEDULED")
                    refreshMaintenanceData();
                    // navigate('/workerMaintenance')
                }
            } catch(error){
                //console.log("error", error)
            }
            setShowSpinner(false);
        }
        setShowScheduler(false);

        changeMaintenanceRequestStatus();        
    }

    async function handleComplete(id){
        let response = CompleteTicket(id, setShowSpinner);
        //console.log("handleComplete", response);
        if (response){
            //console.log("Ticket Completed")
            alert("Ticket Completed")
            navigate(maintenanceRoutingBasedOnSelectedRole())
        } else{
            //console.log("Ticket Not Completed")
            alert("Error: Ticket Not Completed")
        }
    }

    async function handleScheduleStatusChange(){
        setShowSpinner(true);
        try {
            //make this form data
            const response = await fetch(`${APIConfig.baseURL.dev}/maintenanceRequests`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "maintenance_request_uid": maintenanceItem.maintenance_request_uid,
                    "maintenance_request_status": "SCHEDULED"
                })
            });
            const responseData = await response.json();
            //console.log(responseData)
            if (responseData.code === 200){
                //console.log("Ticket Status Changed")
                alert("Ticket Status Changed")
                navigate(maintenanceRoutingBasedOnSelectedRole())
            }
        } catch (error){
            //console.log("error", error)
        }
        setShowSpinner(false);
    }

    return(
        <Box 
            sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
            }}
        >
            <Backdrop
                sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={showSpinner}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
              <Grid container direction="row" columnSpacing={6} rowSpacing={6}>
                <ManagerProfileLink maintenanceItem={maintenanceItem}/>
                <Grid item xs={12} sx={{
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    <Box
                        variant="contained"
                        
                        sx={{
                            flexDirection: "column",
                            backgroundColor: "#D6D5DA",
                            textTransform: "none",
                            paddingRight: "10px",
                            paddingTop: "10px",
                            paddingBottom: "10px",
                            borderRadius: "10px",
                            paddingLeft: "10px",
                            display: 'flex',
                        }}
                    >
                        <QuoteDetailInfo maintenanceItem={maintenanceItem}/>
                    </Box>
                </Grid>

                {/* notes */}
                <Grid item xs={12} sx={{
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    <Typography sx={{color: "#3D5CAC", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "16px"}}>
                        Notes
                    </Typography>
                    <Box
                        variant="contained"
                        
                        sx={{
                            backgroundColor: "#D6D5DA",
                            textTransform: "none",
                            paddingRight: "10px",
                            borderRadius: "10px",
                            paddingLeft: "10px",
                            paddingTop: "10px",
                            paddingBottom: "10px",
                            display: 'flex',
                        }}
                    >
                        <Typography sx={{color: "#3D5CAC", fontWeight: theme.typography.primary.fontWeight, fontSize: "13px"}}>
                            {maintenanceItem?.quote_notes}
                        </Typography>
                    </Box>
                </Grid>

                {/* action button */}

                {/* <Grid item xs={6} sx={{
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    <Button
                        variant="contained"
                        
                        sx={{
                            backgroundColor: "#FFFFFF",
                            textTransform: "none",
                            borderRadius: "10px",
                            display: 'flex',
                            width: "100%",
                        }}
                        onClick={() => handleCancel(maintenanceItem.maintenance_request_uid)}
                    >   
                        <CloseIcon sx={{color: "#3D5CAC"}}/>
                        <Typography sx={{color: "#3D5CAC", fontWeight: theme.typography.primary.fontWeight, fontSize:theme.typography.smallFont}}>
                           Withdraw Quote
                        </Typography>
                    </Button>
                </Grid> */}

                {/* schedule button */}
                <Grid item xs={12} sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: "#FFFFFF",
                            textTransform: "none",
                            borderRadius: "10px",
                            width: "40%",
                        }}
                        onClick={() => setShowScheduler(true)}
                    >   
                        <CalendarTodayIcon sx={{
                            color: "#3D5CAC",
                            paddingRight: "10%"
                        }}/>
                        <Typography sx={{color: "#3D5CAC", fontWeight: theme.typography.primary.fontWeight, fontSize:theme.typography.smallFont}}>
                            Schedule
                        </Typography>
                    </Button>
                </Grid> 

                <DateTimePickerModal 
                    open={showScheduler}
                    setOpenModal={setShowScheduler} 
                    date={schedulerDate} 
                    time={schedulerTime}
                    maintenanceItem={maintenanceItem}
                    handleSubmit={handleScheduleChange}
                />
            </Grid>
        </Box>
    )
}