import { 
    Typography,
    Button,
    Grid,
} from "@mui/material";
import theme from '../../../theme/theme';
import { useUser } from "../../../contexts/UserContext"
import CancelTicket from "../../utils/CancelTicket";
import CancelQuote from "../../utils/CancelQuote";
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from "react-router-dom";

export default function CancelButton(props){
    const { maintenanceRoutingBasedOnSelectedRole } = useUser();
    let navigate = useNavigate();

    let maintenanceItem = props.maintenanceItem;
    let setShowMessage = props.setShowMessage;
    let setMessage = props.setMessage;
    let quotes = props.quotes;

    function handleCancel(id, quotes){
        if (quotes && quotes.length > 0){
            for (let i = 0; i < quotes.length; i++){
                CancelQuote(quotes[i].maintenance_quote_uid);
            }
        }
        let response = CancelTicket(id);
        //console.log("handleCancel", response)
        if (response){
            //console.log("Ticket Cancelled")
            setShowMessage(true);
            setMessage("Ticket Cancelled!! Maintenance Status changed to CANCELLED");
            navigate(maintenanceRoutingBasedOnSelectedRole())
        } else{
            //console.log("Ticket Not Cancelled")
            setShowMessage(true);
            setMessage("Error: Ticket Not Cancelled")
        }
    }

    return (
        <Grid item xs={6} sx={{
            alignItems: "center",
            justifyContent: "center",
            // backgroundColor : "lightred"
        }}>
            <Button
                variant="contained"
                
                sx={{
                    backgroundColor: "#FFFFFF",
                    // backgroundColor: 'transparent',
                    textTransform: "none",
                    borderRadius: "10px",
                    display: 'flex',
                    width: "100%",
                }}
                onClick={() => handleCancel(maintenanceItem.maintenance_request_uid, quotes)}
            >   
                <CloseIcon sx={{color: "#3D5CAC"}}/>
                <Typography sx={{color: "#3D5CAC", fontWeight: theme.typography.primary.fontWeight, fontSize:theme.typography.smallFont}}>
                    Cancel Ticket
                </Typography>
            </Button>
        </Grid>
    )

}