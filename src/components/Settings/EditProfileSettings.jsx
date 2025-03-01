import React, { Component, useState, useEffect  } from 'react';
import { Paper, Box, Grid, Stack, ThemeProvider, TextField, Button, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import theme from '../../theme/theme';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import UTurnLeftIcon from '@mui/icons-material/UTurnLeft';
import PhotoIcon from '@mui/icons-material/Photo';
import { alpha, makeStyles } from "@material-ui/core/styles";
import { useNavigate, useLocation } from "react-router-dom";
// import axios from "axios";
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../utils/httpMiddleware";
import CryptoJS from "crypto-js"; 
import APIConfig from '../../utils/APIConfig';

const useStyles = makeStyles((theme) => ({
    root: {
      "& .MuiFilledInput-root": {
        backgroundColor: "#D6D5DA", // Update the background color here
        borderRadius: 10,
        height: 30,
        marginBlock: 10,
      },
    },
  }));

export default function EditProfileSettings() {
    const classes = useStyles();
    const navigate = useNavigate();

    const location = useLocation();
    let   owner_data = location.state.owner_data;
    const [modifiedData, setModifiedData] = useState({ 'owner_uid': owner_data?.owner_uid, });
    const [isEdited, setIsEdited] = useState(false);
    const [firstName, setFirstName] = useState(owner_data.owner_first_name? owner_data.owner_first_name : '');
    const [lastName, setLastName] = useState(owner_data.owner_last_name? owner_data.owner_last_name : '');
    const [emailAddress, setEmailAddress] = useState(owner_data.owner_email? owner_data.owner_email : '');
    const [phoneNumber, setPhoneNumber] = useState(owner_data.owner_phone_number? owner_data.owner_phone_number : '');
    const [address, setAddress] = useState(owner_data.owner_address? owner_data.owner_address : '');
    const [unit, setUnit] = useState(owner_data.owner_unit? owner_data.owner_unit : '');
    const [city, setCity] = useState(owner_data.owner_city? owner_data.owner_city : '');
    const [state, setState] = useState(owner_data.owner_state? owner_data.owner_state : '');
    const [zipCode, setZipCode] = useState(owner_data.owner_zip? owner_data.owner_zip : '');
    const [EIN, setEIN] = useState(owner_data.owner_ein_number? owner_data.owner_ein_number : '');
    const [SSN, setSSN] = useState('');
    const [uploadedImage, setUploadedImage] = useState(null);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
    
        let encryptedValue = value;
    
        if (name === 'owner_ssn') {
            encryptedValue = CryptoJS.AES.encrypt(value, process.env.REACT_APP_ENKEY).toString();
        }
    
        setModifiedData((prevData) => {
            const newData = { ...prevData };
    
            if (name === 'owner_ssn') {
                newData[name] = encryptedValue;
            } else {
                newData[name] = value;
            }
    
            return newData;
        });
        if (name === 'owner_first_name') {
            setFirstName(value);
        } else if (name === 'owner_last_name') {
            setLastName(value);
        } else if (name === 'owner_email') {
            setEmailAddress(value);
        } else if (name === 'owner_phone_number') {
            setPhoneNumber(value);
        } else if (name === 'owner_address') {
            setAddress(value);
        } else if (name === 'owner_unit') {
            setUnit(value);
        } else if (name === 'owner_city') {
            setCity(value);
        } else if (name === 'owner_state') {
            setState(value);
        } else if (name === 'owner_zip') {
            setZipCode(value);
        } else if (name === 'owner_ein_number') {
            setEIN(value);
        } else if (name === 'owner_ssn') {
            setSSN(value);
        }

        setIsEdited(true);
    }

    const handleProfileImageUpload = (file) => {
        setUploadedImage(file);
        setIsEdited(true);
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        //console.log("FORM SUBMITTED");
        //console.log(modifiedData);

        const formData = new FormData();
        for (const key in modifiedData) {
            if (Object.hasOwnProperty.call(modifiedData, key)) {
                const value = modifiedData[key];
                
                // Check if the value is a non-null object (excluding arrays)
                const serializedValue = (value !== null && typeof value === 'object')
                    ? JSON.stringify(value)
                    : String(value);
    
                formData.append(key, serializedValue);
            }
        }
        if(uploadedImage){
            formData.append("owner_photo", uploadedImage);
        }

        const headers = { 
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Credentials":"*"
        };

        if(isEdited){
            //console.log("EDITED")
            // axios.put('http://localhost:4000/ownerProfile', modifiedData, headers)
            axios.put(`${APIConfig.baseURL.dev}/profile`, formData, headers)
            .then((response) => {
                //console.log('Data updated successfully');
                setIsEdited(false); // Reset the edit status
                navigate(-1)
            })
            .catch((error) => {
                if(error.response){
                    //console.log(error.response.data);
                }
            });
        }
    }

    return (
        <ThemeProvider theme={theme}>
          <Box
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%', // Take up full screen width
                height: '100vh', // Set the Box height to full view height
                justifyContent: 'flex-start', // Align items at the top
            }}
          >
            <Box
            style={{
                width: '100%',
                backgroundColor: theme.palette.custom.bgBlue,
                height: '25%', // 25% of the container's height
            }}>
                <Box
                component="span"
                display= 'flex'
                margin='10px'
                justifyContent= 'center'
                alignItems= 'center'
                position= 'relative'>
                    <UTurnLeftIcon 
                    sx={{
                        transform: "rotate(90deg)", 
                        color: theme.typography.secondary.white, 
                        fontWeight: theme.typography.primary.fontWeight, 
                        fontSize:theme.typography.largeFont, 
                        padding: 5,
                        position: 'absolute',
                        left: 0
                        }}
                    onClick={()=>{navigate(-1)}}/>
                    <Typography 
                    sx={{
                        justifySelf: 'center',
                        color: theme.typography.secondary.white, 
                        fontWeight: theme.typography.primary.fontWeight, 
                        fontSize:theme.typography.largeFont}}>
                    Settings
                    </Typography>
                </Box>
            <Paper
              style={{
                margin: '30px', // Margin around the paper
                padding: theme.spacing(2),
                backgroundColor: theme.palette.primary.main,
                width: '85%', // Occupy full width with 25px margins on each side
                [theme.breakpoints.down('sm')]: {
                    width: '80%',
                },
                [theme.breakpoints.up('sm')]: {
                    width: '50%',
                },
              }}
            >
                <Box
                component="span"
                display= 'flex'
                justifyContent= 'center'
                alignItems= 'center'
                position= 'relative'
                flexDirection="column">
                    {owner_data.owner_photo_url !== null ? (
                        <img
                            src={owner_data.owner_photo_url}
                            alt="Profile"
                            style={{
                                borderRadius: '50%',
                                color: theme.typography.common.blue,
                                width: 45,
                                height: 45,
                                position: 'absolute',
                                left: 0
                            }}
                        />
                    ) : (
                        <AccountCircleIcon
                            sx={{
                                color: theme.typography.common.blue,
                                width: 45,
                                height: 45,
                                position: 'absolute',
                                left: 0
                            }}
                        />
                    )}
                    <>
                    <Stack
                    direction="row"
                    justifyContent="center"
                    >
                    <Typography 
                    sx={{
                        justifySelf: 'center',
                        color: '#3D5CAC', 
                        fontWeight: theme.typography.primary.fontWeight, 
                        fontSize:theme.typography.largeFont}}>
                    {owner_data.owner_first_name? owner_data.owner_first_name : '<FIRST_NAME>'} {owner_data.owner_last_name? owner_data.owner_last_name : '<LAST_NAME>'}
                    </Typography>
                    </Stack>
                    <Stack
                    direction="row"
                    justifyContent="center"
                    >
                    <Typography 
                    sx={{
                        justifySelf: 'center',
                        color: theme.typography.common.blue, 
                        fontWeight: theme.typography.light.fontWeight, 
                        fontSize:theme.typography.primary.smallFont}}>
                    Owner Profile
                    </Typography>
                    </Stack>
                    </>
                </Box>
                <hr/>
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    noValidate
                    autoComplete="off"
                    id="editProfileForm"
                >
                    <label htmlFor="file-upload">
                        <Paper
                        elevation={0}
                        variant="outlined"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            borderStyle: 'dashed',
                            borderWidth: '2px',
                            borderColor: theme.typography.common.blue, // Border color changed to blue
                            padding: '10px',
                            width: '200px',
                            margin: '20px auto',
                            backgroundColor: theme.palette.primary.main, // Background color changed to light blue
                        }}
                        >
                        <Box>
                            <PhotoIcon sx={{ fontSize: theme.typography.largeFont, color: theme.typography.common.blue }} />
                        </Box>
                        <Typography
                            component="div"
                            style={{
                            textAlign: 'center',
                            flex: 1,
                            color: theme.typography.common.blue, // Text color changed to blue
                            }}
                        >
                            New Profile Picture
                        </Typography>
                        </Paper>
                    </label>
                    <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => handleProfileImageUpload(e.target.files[0])}
                    />
                    <hr/>

                    <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                    <Grid item xs={6}>
                        <Stack spacing={-2} m={2}>
                        <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight }}>First Name</Typography>
                        <TextField name="owner_first_name" value={firstName} onChange={handleInputChange} variant="filled" fullWidth placeholder="3" className={classes.root}></TextField>
                        </Stack>
                    </Grid>
                    <Grid item xs={6}>
                        <Stack spacing={-2} m={2}>
                        <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight }}>Last Name</Typography>
                        <TextField name="owner_last_name" value={lastName} onChange={handleInputChange} variant="filled" fullWidth placeholder="3" className={classes.root}></TextField>
                        </Stack>
                    </Grid>
                    
                    
                    </Grid>

                    <Stack spacing={-2} m={5}>
                    <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight }}>Email Address</Typography>
                    <TextField name="owner_email" value={emailAddress} onChange={handleInputChange} variant="filled" fullWidth placeholder="abbeyroad1969@gmail.com" className={classes.root}></TextField>
                    </Stack>

                    <Stack spacing={-2} m={5}>
                    <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight }}>Phone Number</Typography>
                    <TextField name="owner_phone_number" value={phoneNumber} onChange={handleInputChange} variant="filled" fullWidth placeholder="(408)555-4823" className={classes.root}></TextField>
                    </Stack>
                    <hr/>
                
                    <Stack spacing={-2} m={5}>
                    <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight }}>Address</Typography>
                    <TextField name="owner_address" value={address} onChange={handleInputChange} variant="filled" fullWidth placeholder="1065 Melancholy Lane" className={classes.root}></TextField>
                    </Stack>
                
                    <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                    <Grid item xs={6}>
                        <Stack spacing={-2} m={2}>
                        <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight }}>Unit #</Typography>
                        <TextField name="owner_unit" value={unit} onChange={handleInputChange} variant="filled" fullWidth placeholder="3" className={classes.root}></TextField>
                        </Stack>
                    </Grid>
                    <Grid item xs={6}>
                        <Stack spacing={-2} m={2}>
                        <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight }}>City</Typography>
                        <TextField name="owner_city" value={city} onChange={handleInputChange} variant="filled" fullWidth placeholder="San Jose" className={classes.root}></TextField>
                        </Stack>
                    </Grid>
                    <Grid item xs={6}>
                        <Stack spacing={-2} m={2}>
                        <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight }}>State</Typography>
                        <TextField name="owner_state" value={state} onChange={handleInputChange} variant="filled" fullWidth placeholder="CA" className={classes.root}></TextField>
                        </Stack>
                    </Grid>
                    <Grid item xs={6}>
                        <Stack spacing={-2} m={2}>
                        <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight }}>Zip code</Typography>
                        <TextField name="owner_zip" value={zipCode} onChange={handleInputChange} variant="filled" fullWidth placeholder="92034" className={classes.root}></TextField>
                        </Stack>
                    </Grid>
                    </Grid>
                    <hr/>

                    <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                    <Grid item xs={6}>
                        <Stack spacing={-2} m={5}>
                        <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight }}>SSN</Typography>
                        <TextField name="owner_ssn" value={SSN} onChange={handleInputChange} variant="filled" fullWidth placeholder="Enter SSN" className={classes.root}></TextField>
                        </Stack>
                    </Grid>
                    <Grid item xs={6}>
                        <Stack spacing={-2} m={5}>
                        <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight }}>EIN</Typography>
                        <TextField name="owner_ein_number" value={EIN} onChange={handleInputChange} variant="filled" fullWidth placeholder="Enter EIN" className={classes.root}></TextField>
                        </Stack>
                    </Grid>
                    </Grid>

                    <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} sx={{padding: '10px',}}>
                        <Button 
                            variant="contained"
                            type="submit"
                            form="editProfileForm"  
                            sx=
                                {{ 
                                    width: '100%',
                                    backgroundColor: '#3D5CAC',
                                    '&:hover': {
                                        backgroundColor: '#3D5CAC',
                                    },
                                    borderRadius: '10px',
                                }}
                        >
                            <Typography sx={{ textTransform: 'none', color: "white", fontWeight: theme.typography.primary.fontWeight, fontSize:theme.typography.mediumFont}}>
                                Save And Submit
                            </Typography>
                        </Button>
                    </Grid>
                </Box>

            </Paper>
            </Box>
            </Box>
        </ThemeProvider>
    )
}