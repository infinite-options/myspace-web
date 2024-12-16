import React, { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import theme from "../../../theme/theme";
// import "./../../css/contacts.css";
import { ThemeProvider, Box, Paper, Stack, Typography, Button, InputAdornment, TextField, Card, CardContent, Accordion, AccordionSummary, AccordionDetails, Chip } from "@mui/material";
// import { Message, Search } from "@mui/icons-material";
// import { getStatusColor } from "../ContactsFunction";
// import axios from "axios";
// import { useUser } from "../../../contexts/UserContext";
// import Backdrop from "@mui/material/Backdrop";
// import CircularProgress from "@mui/material/CircularProgress";
import CryptoJS from "crypto-js";
import {
  Container,
  Grid,
  Tabs,
  Tab,
  Badge,
  Switch,
} from "@mui/material";
// import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
// import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
// import defaultHouseImage from "../../Property/defaultHouseImage.png";
// import { DataGrid } from '@mui/x-data-grid';
// import useMediaQuery from "@mui/material/useMediaQuery";
// import SearchIcon from '@mui/icons-material/Search';
import EmailIcon from "../../Property/messageIconDark.png";
import PhoneIcon from "../../Property/phoneIconDark.png";
import AddressIcon from "../../Property/addressIconDark.png";
// import maintenanceIcon from "../../Property/maintenanceIcon.png";
// import User_fill from "../../../images/User_fill_dark.png";
import { maskSSN, maskEIN, formattedPhoneNumber } from "../../utils/privacyMasking";
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../../utils/httpMiddleware";


// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import dayjs from "dayjs";

import AES from "crypto-js/aes";

// import APIConfig from "../../../utils/APIConfig";

const ProfileInformation = ({ contactDetails, type }) => {
    // console.log("ProfileInformation - props.type - ", type)
    const [ paymentMethods, setPaymentMethods ] = useState([]);  
  
    useEffect( () => {
      console.log("ProfileInformation - contactDetails - ", contactDetails);                        
      setPaymentMethods( JSON.parse(contactDetails?.payment_method || '[]') );    
    }, [contactDetails]);
  
    useEffect( () => {        
      console.log("ProfileInformation - paymentMethods - ", paymentMethods);        
    }, [paymentMethods]);
  
    const formatPaymentMethodType = (type) => {
      return type
        .toLowerCase()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };  
  
    const getDecryptedSSN = (encryptedSSN) => {
      try {
        const decrypted = AES.decrypt(encryptedSSN, process.env.REACT_APP_ENKEY).toString(CryptoJS.enc.Utf8);
        // console.log("getDecryptedSSN - decrypted - ", decrypted.toString());
        return "***-**-" + decrypted.toString().slice(-4);
      } catch (error) {
        console.error('Error decrypting SSN:', error);
        return '';
      }
    };
    
    return (
      <Container disableGutters sx={{ height: '100%' }}>
        <Grid container xs={12} sx={{ padding: '10px' }}>      
          <Grid item xs={12}>
            <Typography sx={{ fontSize: '20px', fontWeight: 'bold', color: '#160449', }} textAlign={"center"}>
              CONTACT INFORMATION
            </Typography>
          </Grid>

          {/* email section */}
          <Grid container direction='row' item xs={12} alignContent='center' marginTop={"10px"}>
            <img src={EmailIcon} alt="email" />        
            <Typography sx={{color: '#160449', fontSize: "15px"}} paddingLeft={"5px"}>
              {type == "owner" && contactDetails?.owner_email}
              {type == "tenant" && contactDetails?.tenant_email}
              {(type === "maintenance" || type === "manager") && contactDetails?.business_email}
              {type == "employee" && contactDetails?.employee_email}
            </Typography>
          </Grid>

          {/* phone number */}
          <Grid container direction='row' item xs={12} alignContent='center' marginTop={"5px"}>
            <img src={PhoneIcon} alt="phone" />        
            <Typography sx={{color: '#160449', fontSize:"15px"}} paddingLeft={"5px"}>
              {/* { contactDetails?.owner_phone_number} */}
              {type == "owner" && contactDetails?.owner_phone_number}
              {type == "tenant" && contactDetails?.tenant_phone_number}
              {(type === "maintenance" || type === "manager") && contactDetails?.business_phone_number}
              {type == "employee" && contactDetails?.employee_phone_number}
              
            </Typography>
          </Grid>

          {/* address section */}
          <Grid container direction='row' item xs={12} alignItems='center' wrap="nowrap" marginTop={"5px"}>
              <img src={AddressIcon} alt="address" />
              
              <Typography sx={{ color: '#160449', fontSize:"15px"}} paddingLeft={"5px"}>
              {type === "owner" &&
                (contactDetails?.owner_address && contactDetails?.owner_city && contactDetails?.owner_state && contactDetails?.owner_zip
                  ? `${contactDetails.owner_address}, ${contactDetails.owner_city}, ${contactDetails.owner_state}, ${contactDetails.owner_zip}`
                  : "No address provided")}

              {type === "tenant" &&
                (contactDetails?.tenant_address && contactDetails?.tenant_city && contactDetails?.tenant_state && contactDetails?.tenant_zip
                  ? `${contactDetails.tenant_address}, ${contactDetails.tenant_city}, ${contactDetails.tenant_state}, ${contactDetails.tenant_zip}`
                  : "No address provided")}

              {(type === "maintenance" || type === "manager") &&
                (contactDetails?.business_address && contactDetails?.business_city && contactDetails?.business_state && contactDetails?.business_zip
                  ? `${contactDetails.business_address}, ${contactDetails.business_city}, ${contactDetails.business_state}, ${contactDetails.business_zip}`
                  : "No address provided")}

              {type === "employee" &&
                (contactDetails?.employee_address || contactDetails?.employee_city || contactDetails?.employee_state || contactDetails?.employee_zip
                  ? `${contactDetails.employee_address || '-'}, ${contactDetails.employee_city || '-'}, ${contactDetails.employee_state || '-'}, ${contactDetails.employee_zip || '-'}`
                  : "No address provided")}
            </Typography>

          </Grid>
        </Grid>

        <Grid container item xs={12} sx={{ marginTop: '10px', paddingLeft: '10px' }}>      
          <Grid item xs={12}>
            <Typography sx={{ fontSize: '20px', fontWeight: 'bold', color: '#160449', }}>
              CONFIDENTIAL INFORMATION
            </Typography>
          </Grid>
          <Grid container item xs={12} marginTop={"10px"}>
            <Grid item xs={6}>
                  <Typography sx={{ fontSize: "15px", fontWeight: "600", color: "#160449" }}>SSN</Typography>
                  <Typography sx={{ fontSize: "15px", color: "#160449" }}>
                    {/* {contactDetails && contactDetails[index]?.owner_ssn ? maskSSN(contactDetails[index]?.owner_ssn) : "No SSN provided"} */}
                    {type == "owner" && (contactDetails?.owner_ssn ? (getDecryptedSSN(contactDetails?.owner_ssn)) : "No SSN provided")}
                    {type == "tenant" && (contactDetails?.tenant_ssn ? (getDecryptedSSN(contactDetails?.tenant_ssn)) : "No SSN provided")}                
                    {type == "employee" && (contactDetails?.employee_ssn ? (getDecryptedSSN(contactDetails?.employee_ssn)) : "No SSN provided")}
                    {type == "manager" && "No SSN"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography sx={{ color: "#160449", fontWeight: "600" }}>EIN</Typography>
                  <Typography sx={{ fontSize: "15px", color: "#160449" }}>
                    {contactDetails?.business_ein_number? getDecryptedSSN(contactDetails?.business_ein_number) : "No EIN provided"} 
                  </Typography>
                </Grid>
          
            
              {/* {
                (type != "maintenance" && type != "manager")  && (
                  <Grid container item xs={12} md={6}>
                    <Grid item xs={5} sx={{padding: '0px',}}>
                      <Typography sx={{fontSize: '15px', fontWeight: "bold", color: '#160449', }} textAlign={"center"}>
                        SSN
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={4}>
                      <Typography sx={{ fontSize: '15px', color: '#160449' }}> */}
                        {/* {contactDetails?.owner_ssn ? (getDecryptedSSN(contactDetails?.owner_ssn)) : "No SSN provided"} */}
  
                        {/* {type == "owner" && (contactDetails?.owner_ssn ? (getDecryptedSSN(contactDetails?.owner_ssn)) : "No SSN provided")}
                        {type == "tenant" && (contactDetails?.tenant_ssn ? (getDecryptedSSN(contactDetails?.tenant_ssn)) : "No SSN provided")}                
                        {type == "employee" && (contactDetails?.employee_ssn ? (getDecryptedSSN(contactDetails?.employee_ssn)) : "No SSN provided")}                
                        
                      </Typography>
                    </Grid>            
                  </Grid>
                )
              }                         */}
            
  
            {/* <Grid container item xs={12} md={6}>
              <Grid item xs={5}>
                <Typography sx={{color: '#160449', fontWeight: '600', }}>
                  EIN
                </Typography>                            
              </Grid>
              <Grid item xs={5}>
                <Typography sx={{ fontSize: '15px', color: '#160449',}}>
                  {contactDetails?.owner_ein_number? maskEIN(contactDetails?.owner_ein_number) : "No EIN provided"}                
                </Typography>
              </Grid>
            </Grid> */}
  
            
          </Grid>
        </Grid>  
        
        {/* payment section */}
        <Grid item xs={12} sx={{ marginTop: '15px', paddingLeft: '10px' }}>
          <Typography sx={{ fontSize: '20px', fontWeight: 'bold', color: '#160449', }}>
            PAYMENT METHODS
          </Typography>
        </Grid>

        <Grid container item xs={12}  marginTop={"10px"} paddingLeft={"10px"}>
          <Grid item xs={6}>
            <Typography sx={{fontSize: '15px', fontWeight: '600', color: '#160449', }}>
              Active {`(${paymentMethods.filter( method => method.paymentMethod_status === "Active").length})`}
            </Typography>
            {paymentMethods
              .filter( method => method.paymentMethod_status === "Active")
              .map( (method, index) => {
                // console.log("payment method - ", method);
                return (
                  <Typography key={index} sx={{ fontSize: '15px', color: '#160449',}}>
                    {formatPaymentMethodType(method.paymentMethod_type)}
                  </Typography>
                )
            })}
            
            
          </Grid>
          <Grid item xs={6}>
            <Typography sx={{fontSize: '15px', color: '#160449', fontWeight: '600', }}>
              Inactive {`(${paymentMethods.filter( method => method.paymentMethod_status === "Inactive").length})`}
            </Typography>
            {paymentMethods
              .filter( method => method.paymentMethod_status === "Inactive")
              .map( (method, index) => {
                return (
                  <Typography key={index} sx={{ fontSize: '15px', color: '#160449',}}>
                    {formatPaymentMethodType(method.paymentMethod_type)}
                  </Typography>
                )
            })}
            
          </Grid>
        
        </Grid>
  
      </Container>
    )
  
  }

  export default ProfileInformation;