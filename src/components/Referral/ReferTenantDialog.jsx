import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Stack,
  Paper,
  Grid,
  Badge,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Snackbar,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Avatar,
  InputAdornment,
} from "@mui/material";
// import axios from "axios";
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../utils/httpMiddleware";
import theme from "../../theme/theme";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MobileStepper from "@mui/material/MobileStepper";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight"; // Ensure this is correctly imported

import CreateIcon from "@mui/icons-material/Create";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import PostAddIcon from "@mui/icons-material/PostAdd";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { DataGrid } from "@mui/x-data-grid";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useUser } from "../../contexts/UserContext";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";



import APIConfig from "../../utils/APIConfig";
import { v4 as uuidv4 } from "uuid";
import InfoIcon from "@mui/icons-material/Info";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";

import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";


import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    root: {
      "& .MuiFilledInput-root": {
        backgroundColor: "#D6D5DA",
        borderRadius: 10,
        height: '30px',
        marginBlock: 10,
        paddingBottom: "15px",        
      },
      '& input:-webkit-autofill': {
        backgroundColor: '#D6D5DA !important',
        color: '#000000 !important',
        transition: 'background-color 0s 600000s, color 0s 600000s !important',
      },
      '& input:-webkit-autofill:focus': {
        transition: 'background-color 0s 600000s, color 0s 600000s !important',
      },
    },
    errorBorder: {
      border: '1px solid red',
    },
    error: {
      color: 'red',
    },
  }));
  


const ReferTenantDialog = ({open, onClose, setShowSpinner, property}) => {

    const classes = useStyles();
    const [tenants, setTenants] = useState([
        {
            id: 1, 
            first_name: "",
            last_name: "",
            email: "",
            phone_number: "",
            lease_perc: 100,
        }
    ]);

    const addTenantRow = () => {
        const newTenant = {
            id: tenants.length + 1, 
            first_name: "",
            last_name: "",
            email: "",
            phone_number: "",
            lease_perc: 100,
        }
        setTenants(prevState => {
            return [
                ...prevState,
                newTenant,
            ]
        })
    }

    const removeTenantRow = (id) => {
        const updatedTenants = tenants.filter((tenant) => tenant.id !== id);
        setTenants(updatedTenants);            
    };

    const handleTenantChange = (event, id) => {
        const { name, value } = event.target;
    
        const updatedTenants = tenants.map((tenant) => {
          if (tenant.id === id) {
            const updatedTenant = { ...tenant, [name]: value };
    
            return updatedTenant;
          }
          return tenant;
        });
        
        setTenants(updatedTenants);
            
    };

    const sendReferrals = async () => {
        console.log("ROHIT - tenants - ", tenants);
        console.log("ROHIT - property - ", property);        

        setShowSpinner(true);

        fetch(`${APIConfig.baseURL.dev}/leaseReferal`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
                tenants: tenants,
                property_uid: property?.property_uid,
            }),
        }).then( (response) => {
            if(!response.ok){
                throw new Error("Could not send referrals.")
            }
            return response.json()
        })
        .then((data) => {
            console.log("Referrals sent successfully:", data);
        }).catch( (error) => {
            console.log("Error:", error)
        });
    }
    
    
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>
                <Typography sx={{color: '#3D5CAC', fontWeight: 'bold', fontSize: '20px',}}>
                    {tenants?.length > 1 ? 'Refer Tenants' : 'Refer Tenant'}
                </Typography>
            </DialogTitle>
            <DialogContent>
                {
                    tenants?.length > 0 && (
                        <Grid container direction='column' sx={{width: '900px', marginTop: '10px',}}>
                            <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                                <Grid item xs={2.5}>
                                    <Stack spacing={-2} m={2}>
                                    <Typography
                                        sx={{
                                        color: theme.typography.common.blue,
                                        fontWeight: theme.typography.primary.fontWeight,
                                        }}
                                    >
                                        {"First Name"}
                                    </Typography>                        
                                    </Stack>
                                </Grid>
                                <Grid item xs={2.5}>
                                    <Stack spacing={-2} m={2}>
                                    <Typography
                                        sx={{
                                        color: theme.typography.common.blue,
                                        fontWeight: theme.typography.primary.fontWeight,
                                        }}
                                    >
                                        {"Last Name"}
                                    </Typography>                        
                                    </Stack>
                                </Grid>

                                <Grid item xs={3}>
                                    <Stack spacing={-2} m={2}>
                                    <Typography
                                        sx={{
                                        color: theme.typography.common.blue,
                                        fontWeight: theme.typography.primary.fontWeight,
                                        }}
                                    >
                                        {"Email"}
                                    </Typography>                        
                                    </Stack>
                                </Grid>
                                <Grid item xs={2}>
                                    <Stack spacing={-2} m={2}>
                                    <Typography
                                        sx={{
                                            color: theme.typography.common.blue,
                                            fontWeight: theme.typography.primary.fontWeight,
                                        }}
                                    >
                                        {"Phone Number"}
                                    </Typography>                        
                                    </Stack>
                                </Grid>
                                                                    
                                
                                    
                                <Grid item xs={1.5}>
                                    <Stack spacing={-2} m={2}>
                                    <Typography
                                        sx={{
                                        color: theme.typography.common.blue,
                                        fontWeight: theme.typography.primary.fontWeight,
                                        }}
                                    >
                                        {"Lease %"}
                                    </Typography>                        
                                    </Stack>
                                </Grid>                                                                                                      
                            </Grid>
                        </Grid>
                    )
                }                    
                <Grid container direction='column' sx={{width: '900px',}}>
                    {
                        tenants?.map((row, index) => (
                            <>
                                <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} key={row.id}>
                                    <Grid item xs={2.5}>
                                        <Stack spacing={-2} m={2}>
                                        
                                        <TextField
                                            name='first_name'
                                            value={row.first_name}
                                            variant='filled'
                                            fullWidth                                            
                                            className={classes.root}                                            
                                            onChange={(e) => handleTenantChange(e, row.id)}
                                        />
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={2.5}>
                                        <Stack spacing={-2} m={2}>                                        
                                        <TextField
                                            name='last_name'
                                            value={row.last_name}
                                            variant='filled'
                                            fullWidth                                            
                                            className={classes.root}                                            
                                            onChange={(e) => handleTenantChange(e, row.id)}
                                        />
                                        </Stack>
                                    </Grid>

                                    <Grid item xs={3}>
                                        <Stack spacing={-2} m={2}>                                        
                                        <TextField
                                            name='email'
                                            value={row.email}
                                            variant='filled'
                                            fullWidth                                            
                                            className={classes.root}                                            
                                            onChange={(e) => handleTenantChange(e, row.id)}
                                        />
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Stack spacing={-2} m={2}>                                        
                                        <TextField
                                            name='phone_number'
                                            value={row.phone_number}
                                            variant='filled'
                                            fullWidth                                            
                                            className={classes.root}                                            
                                            onChange={(e) => handleTenantChange(e, row.id)}
                                        />
                                        </Stack>
                                    </Grid>
                                                                        
                                    
                                        
                                    <Grid item xs={1.5}>
                                        <Stack spacing={-2} m={2}>                                            
                                        <TextField
                                            name='lease_perc'
                                            value={row.lease_perc}
                                            variant='filled'
                                            fullWidth
                                            // placeholder='15'
                                            className={classes.root}
                                            onChange={(e) => handleTenantChange(e, row.id)}
                                            sx={{
                                                // paddingBottom: '15px',
                                            }}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment 
                                                        position='end'    
                                                        sx={{
                                                            marginTop: '15px',
                                                        }}                                                            
                                                    >
                                                        %
                                                    </InputAdornment>
                                                ),                                                        
                                                sx: {
                                                    height: '30px',
                                                }
                                            }}
                                        />
                                        </Stack>
                                    </Grid>
                                        
                                    
                                    <Grid container justifyContent='center' alignContent='center' item xs={0.5}>
                                        <Button
                                            aria-label='delete'
                                            sx={{
                                                color: "#000000",
                                                fontWeight: "bold",
                                                "&:hover": {
                                                color: "#FFFFFF",
                                                },
                                            }}
                                            onClick={() => removeTenantRow(row.id)}
                                        >
                                            <DeleteIcon sx={{ fontSize: 25, color: "#3D5CAC", }} />
                                        </Button>
                                    </Grid>                                        
                                </Grid>
                                
                            </>
                        ))
                    }
                    <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} sx={{paddingLeft: '10px',}}>
                        <IconButton 
                            aria-label='delete'
                            sx={{
                                backgroundColor: "#3D5CAC",
                                color: "#FFFFFF",
                                width: '80px',
                                borderRadius: '5px',
                                '&:hover': {
                                    backgroundColor: "#160449",                                        
                                }
                            }}
                            onClick={addTenantRow}
                        >
                            <AddIcon />
                        </IconButton>
                    </Grid>

                    <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} justifyContent='center'sx={{marginTop: '10px', }}>
                        <Button
                            aria-label='save'
                            sx={{
                                backgroundColor: "#3D5CAC",
                                color: "#FFFFFF",
                                width: '200px',
                                borderRadius: '5px',
                                '&:hover': {
                                    backgroundColor: "#160449",                                        
                                },                                    
                            }}
                            onClick={sendReferrals}
                        >
                            <Typography sx={{fontWeight: 'bold', textTransform: 'none', }}>
                                {tenants?.length > 1 ? 'Send Referrals' : 'Send Referral'}
                            </Typography>
                        </Button>
                    </Grid>
                </Grid>                
            </DialogContent>
            <DialogActions sx={{ alignContent: "center", justifyContent: "center" }}>                                          
                <IconButton onClick={onClose} sx={{ position: "absolute", top: 8, right: 8 }}>
                    <CloseIcon variant="icon"/>
                </IconButton>                    
            </DialogActions>
        </Dialog>
    );
}

export default ReferTenantDialog;