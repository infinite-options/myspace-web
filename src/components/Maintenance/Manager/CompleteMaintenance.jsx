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
import CancelButton from "../MaintenanceComponents/CancelButton";
import CompleteButton from "../MaintenanceComponents/CompleteButton";
import { useUser } from "../../../contexts/UserContext";
import TenantProfileLink from "../../Maintenance/MaintenanceComponents/TenantProfileLink";
import OwnerProfileLink from "../../Maintenance/MaintenanceComponents/OwnerProfileLink";
import useMediaQuery from '@mui/material/useMediaQuery';
import WorkerInvoiceView from "../MaintenanceComponents/WorkerInvoiceView";

import { useMaintenance } from "../../../contexts/MaintenanceContext";
import NewManagerInvoiceView from "./NewManagerInvoice";

export default function CompleteMaintenance({maintenanceItem, navigateParams, quotes}){
    const navigate = useNavigate();
    const [showMessage, setShowMessage] = useState(false);
    const [message, setMessage] = useState("");
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const { payMaintenanceView, setPayMaintenanceView, maintenanceData: contextMaintenanceItem, 
		navigateParams: contextNavigateParams,  maintenanceQuotes, setMaintenanceQuotes, setNavigateParams, setMaintenanceData,setSelectedStatus, setSelectedRequestIndex, setAllMaintenanceData } = useMaintenance();
    
    // console.log("COMPLETE MAINTENANCE QUOTES", maintenanceItem)
    
    let finishedQuote = quotes?.find(quote => quote.quote_status === "FINISHED" || quote.quote_status === "COMPLETED")

    function handleNavigate(){
        console.log("navigate to pay Maintenance")

        if (isMobile) {
            navigate("/payMaintenance", {
            state:{
                maintenanceItem,
                navigateParams
            }
        })
    } else {
        if (maintenanceItem && navigateParams) {
            try {
                // setMaintenanceData(maintenanceItem);
                //     setNavigateParams(navigateParams);
				// 	setMaintenanceQuotes(quotes);
                //     setSelectedRequestIndex(navigateParams.maintenanceRequestIndex);
                //     setSelectedStatus(navigateParams.status);
				// 	setPayMaintenanceView(true);

                navigate("/paymentProcessing", { state: { currentWindow: "PAY_BILLS", selectedRows: [maintenanceItem.pur_receiver || maintenanceItem.bill_created_by] }});
                // navigate("/paymentProcessing", { state: { currentWindow: "PAY_BILLS"} });
            } catch (error) {
                console.error('Error setting sessionStorage: ', error);
            }
        } else {
            console.error('maintenanceItem or navigateParams is undefined');
        }
    }
    }

    function handleNavigateToQuotesAccept(){
        if (isMobile) {navigate("/quoteAccept", {
            state:{
                maintenanceItem,
                navigateParams,
                quotes
            }
        });
    }else {
        if (maintenanceItem && navigateParams) {
            try {
                const maintenanceItemStr = JSON.stringify(maintenanceItem);
                const navigateParamsStr = JSON.stringify(navigateParams);
                const quotesStr = JSON.stringify(quotes);
                console.log('Storing data in sessionStorage: ', quotesStr);

                // Save data to sessionStorage
                sessionStorage.setItem('maintenanceItem', maintenanceItemStr);
                sessionStorage.setItem('navigateParams', navigateParamsStr);
                sessionStorage.setItem('quotes', quotesStr);
                sessionStorage.setItem('selectedRequestIndex', navigateParams.maintenanceRequestIndex);
                sessionStorage.setItem('selectedStatus', navigateParams.status);
                sessionStorage.setItem('quoteAcceptView', 'true');
                window.dispatchEvent(new Event('storage'));
                setTimeout(() => {
                    window.dispatchEvent(new Event('maintenanceRequestSelected'));
                }, 0);
            } catch (error) {
                console.error('Error setting sessionStorage: ', error);
            }
        } else {
            console.error('maintenanceItem or navigateParams is undefined');
        }
    }
    }

    return(
        <Box 
            sx={{
                width: "100%",
                // padding: '20px',
            }}
        >
            <Grid container item xs={12} marginBottom={"20px"}>
                {maintenanceItem?.bill_uid && <NewManagerInvoiceView maintenanceItem={maintenanceItem}/>}      
            </Grid>
            <Grid container item xs={12} display={"flex"} flexDirection={"row"} justifyContent={"center"} alignItems={"center"}>
                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: '#FFC614',
                        color: '#160449',
                        textTransform: 'none',
                        fontWeight: 'bold',
                        borderRadius: '8px',
                        width: '160px',
                        height: '120px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        padding: '10px',
                        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.3)',
                        whiteSpace: 'normal',
                        '&:hover': {
                            backgroundColor: '#FFC614',
                        },
                    }}
                    disabled={!maintenanceItem?.bill_uid || maintenanceItem?.purchase_status === "PAID"}
                    onClick={() => handleNavigate()}
                >    
                    {finishedQuote && maintenanceItem.maintenance_status !== "CANCELLED" ? "Pay Maintenance" : "Charge Owner"}
                </Button>
            </Grid>
        </Box>
    )
}