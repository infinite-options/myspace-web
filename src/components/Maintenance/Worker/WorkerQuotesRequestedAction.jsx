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
import ManagerProfileLink from "../MaintenanceComponents/ManagerProfileLink";
import RequestMoreInfo from "./RequestMoreInfo";



export default function WorkerQuotesRequestedAction({maintenanceItem, refreshMaintenanceData}){
    const navigate = useNavigate();
    const [showRequestMoreInfo, setShowRequestMoreInfo] = useState(false);

    // //console.log("NewRequestAction", maintenanceItem)

    let expense;
    if(maintenanceItem.quote_services_expenses){
        expense = maintenanceItem.quote_services_expenses[0];
    }

    function declineQuote(id){

        navigate("/businessDeclineQuoteForm", {
            state:{
                maintenanceItem,
                // refreshMaintenanceDatafn: () => refreshMaintenanceData()
            }
        })
    }

    async function createQuote(id){

        navigate("/businessAcceptQuoteForm", {
            state:{
                maintenanceItem,
                // refreshMaintenanceDatafn: () => refreshMaintenanceData()
            }
        })
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
            <Grid container direction="row" columnSpacing={6} rowSpacing={6}>
                
                <ManagerProfileLink maintenanceItem={maintenanceItem}/>
                
                {/* decline quote */}
                <Grid item xs={4} sx={{
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
                        onClick={() => declineQuote(maintenanceItem.maintenance_request_uid)}
                    >   
                        <CloseIcon sx={{color: "#3D5CAC"}}/>
                        <Typography sx={{color: "#3D5CAC", fontWeight: theme.typography.primary.fontWeight, fontSize:theme.typography.smallFont}}>
                           Decline
                        </Typography>
                    </Button>
                </Grid> 
                
                {/* request more info  */}
                <Grid item xs={4} sx={{
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    <Button
                        variant="contained"
                        disabled={maintenanceItem?.quote_status === "MORE INFO"}
                        sx={{
                            backgroundColor: "#FFFFFF",
                            textTransform: "none",
                            borderRadius: "10px",
                            display: 'flex',
                            width: "100%",
                        }}
                        onClick={() => setShowRequestMoreInfo(true)}
                    >   
                       <Typography sx={{color: "#3D5CAC", fontWeight: theme.typography.primary.fontWeight, fontSize:theme.typography.smallFont}}>
                            Request more info
                        </Typography>
                    </Button>
                    <RequestMoreInfo fromQuote={true} showRequestMoreInfo={showRequestMoreInfo} setShowRequestMoreInfo={setShowRequestMoreInfo} maintenanceItem={maintenanceItem} refreshMaintenanceData={refreshMaintenanceData}/>
                </Grid> 

                {/* accept quote */}
                <Grid item xs={4} sx={{
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
                            width: "100%"
                        }}
                        // onClick={() => handleQuote(maintenanceItem.maintenance_request_uid)}
                        onClick={() => createQuote(maintenanceItem.maintenance_request_uid)}
                    >
                        <CheckIcon sx={{color: "#3D5CAC"}}/>
                        <Typography sx={{color: "#3D5CAC", fontWeight: theme.typography.primary.fontWeight, fontSize:theme.typography.smallFont}}>
                            Quote
                        </Typography>
                    </Button>
                </Grid>
            </Grid>
        </Box>
    )
}