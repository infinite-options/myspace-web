
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
import CheckIcon from '@mui/icons-material/Check';
import theme from '../../../theme/theme';

import React, {useState} from "react";

import PaymentInfoModal from "../../PaymentInfoModal";
import { useUser } from '../../../contexts/UserContext';

import APIConfig from "../../../utils/APIConfig";
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../../utils/httpMiddleware";

export default function MarkPaidButton({maintenanceItem, disabled}){

    const [showModal, setShowModal] = useState(false);
    const { getProfileId } = useUser(); 

    function handleMarkPaid(){
        setShowModal(true);   
    }

    const handleSubmitMarkPaid = async ({ checkNumber, amount, id }) => {
        //console.log("handleMarkPaid", checkNumber, amount, id, getProfileId());

        try {
            fetch(`${APIConfig.baseURL.dev}/makePayment`, {
                method: "POST", 
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    pay_purchase_id: [{"purchase_uid": maintenanceItem.purchase_uid, "pur_amount_due": amount}],
                    pay_fee: 0,
                    pay_charge_id: "stripe transaction key",
                    pay_amount: amount,
                    pay_total: amount,
                    payment_type: checkNumber ? "check" : "cash",
                    payment_verify: "Unverified",
                    payment_notes: "manual payment",
                    paid_by: maintenanceItem.business_name,
                    payment_intent: checkNumber ? "manual payment check" : "manual payment cash",
                    payment_method: checkNumber ? "manual payment check" : "manual payment cash",

                }),

            })
        } catch (error) {
            //console.log(error);
        }
    }

    return (
        <Grid item xs={6} sx={{
            alignItems: "center",
            justifyContent: "center",
        }}>
            <Button
                variant="contained"
                disabled={disabled}
                sx={{
                    backgroundColor: "#FFFFFF",
                    textTransform: "none",
                    borderRadius: "10px",
                    display: 'flex',
                    width: "100%",
                }}
                onClick={() => handleMarkPaid()}
            >   
                <CheckIcon sx={{color: "#3D5CAC"}}/>
                <Typography sx={{color: "#3D5CAC", fontWeight: theme.typography.primary.fontWeight, fontSize:theme.typography.smallFont}}>
                   Mark Paid
                </Typography>
            </Button>
            <PaymentInfoModal open={showModal} setOpenModal={setShowModal} maintenanceItem={maintenanceItem} handleSubmit={handleSubmitMarkPaid}/>
        </Grid> 
    )
}