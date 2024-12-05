import { 
    Typography,
    Button,
    Grid,
} from "@mui/material";
import theme from '../../../theme/theme';
import CompleteTicket from "../../utils/CompleteTicket";
import FinishQuote from "../../utils/FinishQuote";
import { useUser } from "../../../contexts/UserContext"
import CheckIcon from '@mui/icons-material/Check';
import { useNavigate } from "react-router-dom";
import APIConfig from "../../../utils/APIConfig";
import DateTimePickerModal from "../../DateTimePicker";
import { useState } from "react";
import CancelTicket from "../../utils/CancelTicket";
import CancelQuote from "../../utils/CancelQuote";

export default function CompleteButton(props){
    const { maintenanceRoutingBasedOnSelectedRole, getProfileId, roleName } = useUser();
    let navigate = useNavigate();

    const [showModal, setShowModal] = useState(false);
    const [cancelTicket, setCancelTicket] = useState(false);
    let maintenanceItem = props.maintenanceItem;
    console.log(" maintenace item inside complete buttonm - ", maintenanceItem)
    let setShowMessage = props.setShowMessage;
    let setMessage = props.setMessage;
    let quotes = props.quotes;
    let setRefresh = props.setRefresh; // Assuming setRefresh is passed as a prop    

    
    async function handleComplete(id, quotes, date, time){
        console.log("handleComplete quotes", quotes)
        let role = roleName();
        console.log("role name", role);

        if (role === "PM Employee" || role === "Manager"){
            let rankedQuote;

            if (quotes){
                JSON.parse(quotes).find((quote) => {
                    if (quote.quote_status === maintenanceItem.quote_status){
                        rankedQuote = quote;
                    }
                });
            }
    
            if (maintenanceItem.business_uid === getProfileId()){
                await CompleteTicket(id, date);
                await FinishQuote(rankedQuote.maintenance_quote_uid);

            } else if (maintenanceItem.business_uid !== getProfileId()){
                if (maintenanceItem.maintenance_assigned_business === null){
                    try {
                        const formData = new FormData();
                        formData.append("maintenance_assigned_business", getProfileId());
                        formData.append("maintenance_request_uid", maintenanceItem.maintenance_request_uid);
                        formData.append("maintenance_request_closed_date", date);
                        const response = await fetch(`${APIConfig.baseURL.dev}/maintenanceRequests`, {
                            method: 'PUT',
                            body: formData,
                        });
                        if (response.status === 200) {
                            await CompleteTicket(id);
                        }
                    } catch (error){
                        console.log("error", error);
                    }
                } else {
                    await CompleteTicket(id, date);
                    if (maintenanceItem.quote_status !== "FINISHED" && rankedQuote){
                        await FinishQuote(rankedQuote.maintenance_quote_uid);
                    }
                }
            }
        } else if (role === "Maintenance" || role === "Maintenance Employee"){
            await FinishQuote(maintenanceItem.maintenance_quote_uid);
            if (maintenanceItem.maintenance_assigned_business === getProfileId()){
                await CompleteTicket(id);
            }
        } else {
            console.log("Unsupported role is trying to complete a ticket");
        }

        // Call setRefresh to trigger a refresh after completion
        if (setRefresh) {
            setRefresh(true);
        }
        if(props.refreshMaintenanceData){
            props.refreshMaintenanceData();
        }        
    }

  
    async function handleCancel(id, quotes){
        if (quotes && quotes.length > 0){
            for (let i = 0; i < quotes.length; i++){
                await CancelQuote(quotes[i].maintenance_quote_uid);
            }
        }
        if(props.fetchAndUpdateQuotes){
            props.fetchAndUpdateQuotes()
        }
        
        let response = await CancelTicket(id);
        if (response){
            setShowMessage(true);
            setMessage("Ticket Cancelled!! Maintenance Status changed to CANCELLED");
            navigate(maintenanceRoutingBasedOnSelectedRole());
        } else {
            setShowMessage(true);
            setMessage("Error: Ticket Not Cancelled");
        }

        // Call setRefresh to trigger a refresh after cancellation
        if (setRefresh) {
            setRefresh(true);
        }
    }

    return (
        <>
            <Button
                variant="contained"
                sx={{
                    backgroundColor: '#FF8A00',
                    color: '#160449',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    borderRadius: '8px',
                    height: '120px',
                    width: '200px',    
                    padding: '10px',
                    '&:hover': {
                        backgroundColor: '#FF8A00',
                    },
                }}
                onClick={() => setShowModal(true)}
            >
                Close Ticket
            </Button>
        
            <DateTimePickerModal
                setOpenModal={setShowModal}
                open={showModal}
                maintenanceItem={maintenanceItem}
                date={""}
                time={""}
                completeTicket={handleComplete}
                cancelTicket={handleCancel}
                // refreshMaintenanceData={refreshMaintenanceData}
            />
        </>
    );
    // We need a modal to pop up and confirm the date the ticket was completed.
    // It can default to today and today's time, if the scheduled date doesn't exist or isn't in the past.
    // The user can change the date and time if they want.
    // There are also buttons to select that it was "done now", "done on scheduled date" (if in the past)
}
