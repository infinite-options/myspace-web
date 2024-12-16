import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import theme from "../../../theme/theme";
// import "./../../css/contacts.css";
import { ThemeProvider, Box, Paper, Stack, Typography, Button, InputAdornment, TextField, Card, CardContent, Accordion, AccordionSummary, AccordionDetails, Chip } from "@mui/material";
import { Message, Search } from "@mui/icons-material";
import { getStatusColor } from "../ContactsFunction";
// import axios from "axios";
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../../utils/httpMiddleware";
import { useUser } from "../../../contexts/UserContext";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import {
  Container,
  Grid,
  Tabs,
  Tab,
  Badge,
  Switch,
} from "@mui/material";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import defaultHouseImage from "../../Property/defaultHouseImage.png";
import { DataGrid } from '@mui/x-data-grid';
import useMediaQuery from "@mui/material/useMediaQuery";
import SearchIcon from '@mui/icons-material/Search';
import EmailIcon from "../../Property/messageIconDark.png";
import PhoneIcon from "../../Property/phoneIconDark.png";
import AddressIcon from "../../Property/addressIconDark.png";
import maintenanceIcon from "../../Property/maintenanceIcon.png";
import User_fill from "../../../images/User_fill_dark.png";
import { maskSSN, maskEIN, formattedPhoneNumber } from "../../utils/privacyMasking";


import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import dayjs from "dayjs";

import AES from "crypto-js/aes";

import APIConfig from "../../../utils/APIConfig";

import ProfileInformation from "../ContactDetail/ProfileInformation";
import PaymentsInformation from "./PaymentsInformation";
import PropertiesInformation from "./PropertiesInformation";
import refundIcon from "../../Property/refundIcon.png"



const ManagerContactDetail = ({ data, currentIndex, setCurrentIndex, propertyIndex, fromPage, setViewRHS }) => {

    const { selectedRole, getProfileId } = useUser();  
    const [ contactDetails, setContactDetails ] = useState([]);
    let navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
    useEffect(() => {
      setContactDetails(data);
    }, [data]);

    useEffect(() => {
      console.log("Manager Contact Details:", contactDetails);
      console.log("Current Index:", currentIndex);
    }, [contactDetails, currentIndex]);
  
    return (
      <Grid container sx={{backgroundColor: theme.palette.primary.main,  borderRadius: '10px', padding: '10px'}}>                
          <Grid item xs={12} container justifyContent="center" sx={{ height: '50px',  }}>
              <Button
                sx={{
                  textTransform: "none",
                  color: theme.typography.common.blue,
                  fontWeight: theme.typography.common.fontWeight,
                  fontSize: "16px",
                  "&:hover, &:focus, &:active": { background: theme.palette.primary.main },
                }}
                onClick={() => {
                  if(isMobile && setViewRHS){
                    setViewRHS(false)
                  }else if(fromPage && propertyIndex >= 0){
                    navigate("/properties", { state: { index : propertyIndex } });
                  }else{
                    navigate(-1)
                  }
                }}
              >
                <img src={refundIcon} style={{ width: "25px", height: "25px", margin: "5px" }} />
              </Button>
              <Typography sx={{fontSize: '35px', fontWeight: 'bold', color: '#160449' }}>
                  Manager Contact
              </Typography>
          </Grid>
          <Grid item xs={12} container justifyContent="center" >
              <Typography sx={{fontSize: '20px', color: '#3D5CAC'}}>
                {currentIndex + 1} of {contactDetails?.length} Managers
              </Typography>                    
          </Grid>                
          <Grid container item xs={12} direction='row' alignContent='space-between' sx={{backgroundColor: '#3D5CAC', borderRadius: '10px', marginBottom: '10px', paddingTop: '5px', paddingBottom: '10px', minHeight: '120.5px', }}>                            
              <Grid item xs={1}>
                  <Box
                      onClick={() => {
                        console.log("Previous button clicked", currentIndex, contactDetails.length);
                        currentIndex > 0 ? setCurrentIndex(currentIndex - 1) : setCurrentIndex(contactDetails.length - 1);
                      }}
                      sx={{
                        paddingLeft: '10px',
                      }}
                  >
                      <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                          d="M5.5 16.5L4.08579 15.0858L2.67157 16.5L4.08579 17.9142L5.5 16.5ZM26.125 18.5C27.2296 18.5 28.125 17.6046 28.125 16.5C28.125 15.3954 27.2296 14.5 26.125 14.5V18.5ZM12.3358 6.83579L4.08579 15.0858L6.91421 17.9142L15.1642 9.66421L12.3358 6.83579ZM4.08579 17.9142L12.3358 26.1642L15.1642 23.3358L6.91421 15.0858L4.08579 17.9142ZM5.5 18.5H26.125V14.5H5.5V18.5Z"
                          fill={theme.typography.secondary.white}
                          />
                      </svg>
                  </Box>
              </Grid>
              <Grid container direction='row' item xs={10} >
                  <Grid item xs={12} container justifyContent="center">
                    <Typography sx={{fontSize: '25px', fontWeight: 'bold', color: '#F2F2F2' }}>
                    {`${(contactDetails && contactDetails[currentIndex]?.business_name) ? contactDetails[currentIndex]?.business_name : ""}`}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} container justifyContent="center">
                    <Box
                      sx={{
                        backgroundColor: "#A9A9A9",
                        height: "68px",
                        width: "68px",
                        borderRadius: "68px",
                        // marginTop: "-34px",
                      }}
                    >
                    <img
                      src={(contactDetails && contactDetails[currentIndex]?.business_photo_url) ? contactDetails[currentIndex].business_photo_url : User_fill}
                      alt="profile placeholder"
                      style={{
                        height: "60px",
                        width: "60px",
                        borderRadius: "68px",
                        margin: "4px",
                      }}
                    />
                    </Box>
                  </Grid>
              </Grid>
              <Grid item xs={1}  container justifyContent='flex-end'>
                  <Box
                      onClick={() => {
                        console.log("Next button clicked");
                        currentIndex < contactDetails.length - 1 ? setCurrentIndex(currentIndex + 1) : setCurrentIndex(0);
                      }}
                      sx={{
                        paddingRight: '10px',
                      }}
                  >
                      <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                          d="M27.5 16.5L28.9142 17.9142L30.3284 16.5L28.9142 15.0858L27.5 16.5ZM6.875 14.5C5.77043 14.5 4.875 15.3954 4.875 16.5C4.875 17.6046 5.77043 18.5 6.875 18.5L6.875 14.5ZM20.6642 26.1642L28.9142 17.9142L26.0858 15.0858L17.8358 23.3358L20.6642 26.1642ZM28.9142 15.0858L20.6642 6.83579L17.8358 9.66421L26.0858 17.9142L28.9142 15.0858ZM27.5 14.5L6.875 14.5L6.875 18.5L27.5 18.5L27.5 14.5Z"
                          fill={theme.typography.secondary.white}
                          />
                      </svg>
                  </Box>
              </Grid>
          </Grid>
          <Grid container item xs={12} columnSpacing={1} rowSpacing={3.3}>
            {/* contact information */}
              <Grid item xs={12} md={6} >
                  <Paper
                      elevation={0}
                      style={{
                          // margin: '50p', // Add margin here
                          borderRadius: "10px",
                          backgroundColor: "#D6D5DA",
                          minHeight: "200px",
                          height:"100%",
                          padding: '10px',
                      }}
                  >
                      {
                        contactDetails && typeof currentIndex === 'number' && currentIndex >=0 ? (
                          <ProfileInformation contactDetails={contactDetails[currentIndex]} type="manager"/>
                        ) :
                        <></>
                      }
                      
                  </Paper>
              </Grid>

              {/* property information */}
              <Grid item xs={12} md={6} >
                  <Paper
                      elevation={0}
                      style={{
                          // margin: '50p', // Add margin here
                          borderRadius: "10px",
                          backgroundColor: "#D6D5DA",
                          height:"100%", 
                          minHeight: "200px",
                          padding: '10px',
                      }}
                  >
                      {
                        contactDetails && typeof currentIndex === 'number' && currentIndex >=0 ? (
                          <PropertiesInformation                           
                            ownerUID={contactDetails[currentIndex]?.contact_uid}                       
                            fromPage={"Manager"}
                            owner={contactDetails[currentIndex]}
                          />
                        ) :
                        <></>
                      }
                      
                  </Paper>
              </Grid> 

              <Grid item xs={12}>
                  <Paper
                      elevation={0}
                      style={{
                          // margin: '50p', // Add margin here
                          borderRadius: "10px",
                          backgroundColor: "#D6D5DA",
                          minHeight: 170,
                          padding: '10px',
                          // height: "100%"
                      }}
                  >
                      {
                        contactDetails && typeof currentIndex === 'number' && currentIndex >=0 ? (
                          <PaymentsInformation                                                       
                            data={contactDetails[currentIndex]?.payments}
                          />
                        ) :
                        <></>
                      }
                      
                  </Paper>
              </Grid>               
          </Grid>                     
      </Grid>    
    
    );
  }

export default ManagerContactDetail;