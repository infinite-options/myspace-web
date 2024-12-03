import React, { useState } from 'react';
import { Paper, Box, Stack, ThemeProvider, TextField, Button, Typography, Grid } from '@mui/material';
import theme from '../../theme/theme';
import UTurnLeftIcon from '@mui/icons-material/UTurnLeft';
import { makeStyles } from '@material-ui/core/styles';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import axios from 'axios';
import { RadioGroup, FormControl, FormControlLabel, Radio } from '@mui/material';
import { useCookies } from 'react-cookie';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GenericDialog from "../GenericDialog";

const useStyles = makeStyles(() => ({
	root: {
		'& .MuiFilledInput-root': {
			backgroundColor: '#D6D5DA', // Update the background color here
			borderRadius: 10,
			height: 30,
			marginBlock: 10,
		},
	},
}));

export default function EditUserInfo(props) {
	const classes = useStyles();
	const navigate = useNavigate();
	const { user, setUser } = useUser();

	const [cookie, setCookie] = useCookies(['user']);
	const cookiesData = cookie['user'];

	const [modifiedData, setModifiedData] = useState({ user_uid: user?.user_uid });
	const [isEdited, setIsEdited] = useState(false);

	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmNewPassword, setConfirmNewPassword] = useState('');

	const [emailAddress, setEmailAddress] = useState(cookiesData.email);
	const [firstName, setFirstName] = useState(cookiesData.first_name);
	const [lastName, setLastName] = useState(cookiesData.last_name);
	const [phoneNumber, setPhoneNumber] = useState(cookiesData.phone_number);
	const [googleAuthProvided, setGoogleAuthProvided] = useState(cookiesData.google_auth_token);

	const [isDialogOpen, setIsDialogOpen] = useState(false);
const [dialogTitle, setDialogTitle] = useState("");
const [dialogMessage, setDialogMessage] = useState("");
const [dialogSeverity, setDialogSeverity] = useState("info");

const openDialog = (title, message, severity) => {
  setDialogTitle(title); // Set custom title
  setDialogMessage(message); // Set custom message
  setDialogSeverity(severity); // Can use this if needed to control styles
  setIsDialogOpen(true);
};

const closeDialog = () => {
  setIsDialogOpen(false);
};
	const handleInputChange = (event) => {
		const { name, value } = event.target;

		if (name === 'first_name') {
			setFirstName(value);
			setModifiedData((prevData) => ({
				...prevData,
				[name]: value,
			}));
		} else if (name === 'last_name') {
			setLastName(value);
			setModifiedData((prevData) => ({
				...prevData,
				[name]: value,
			}));
		} else if (name === 'phone_number') {
			setPhoneNumber(value);
			setModifiedData((prevData) => ({
				...prevData,
				[name]: value,
			}));
		}

		setIsEdited(true);
	};

	const handleSubmit = async(event) => {
		event.preventDefault();
		const headers = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': '*',
			'Access-Control-Allow-Headers': '*',
			'Access-Control-Allow-Credentials': '*',
		};

		if (isEdited) {
			try {
				const response = await axios.put("https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/userInfo", {
				  user_uid: cookiesData.user_uid,
				  first_name: firstName,
				  last_name: lastName,
				  phone_number: phoneNumber,
				});
			
				if (response.status === 200) {
				  console.log("user Info updated successfully");

			const updatedFields = {
				first_name: firstName,
				last_name: lastName,
				phone_number: phoneNumber,
			};
				  setUser((prevUser) => {
					const newUserData = { ...prevUser, ...updatedFields};
			  
					// Perform side effects after updating state
					setCookie("user", newUserData);
			  
					// Return the new state
					return newUserData;
				  });
				  openDialog("Success", "Your profile has been successfully updated.", "success");
            
				} else {
				  console.error("Failed to update User Info");
				}
			  } catch (error) {
				console.error("Error updating User Info:", error);
			  }
		} else {
			openDialog("Warning", "You haven't made any changes to the form. Please save after changing the data.", "error");
		  }
	};

	return (
		<ThemeProvider theme={theme}>
			<Paper
				style={{
					margin: 'auto',
					padding: theme.spacing(2),
					backgroundColor: theme.palette.primary.main,
					width: '85%',
					justifyContent: 'center',
					alignItems: 'center',
					[theme.breakpoints.down('sm')]: {
						width: '80%',
					},
					[theme.breakpoints.up('sm')]: {
						width: '50%',
					},
				}}
			>
				<Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off" id="editProfileForm">
					<Box
						component="span"
						display="flex"
						margin="10px"
						justifyContent="center"
						alignItems="center"
						position="relative"
					>
						<ArrowBackIcon
    onClick={() => props.setRHS('form')}
    sx={{
        cursor: 'pointer',
        color: theme.typography.secondary.black,
        fontSize: theme.typography.largeFont,
        position: 'absolute',
        left: 0,
    }}
/>
						<Typography
							sx={{
								justifySelf: 'center',
								color: theme.typography.primary.black,
								fontWeight: theme.typography.primary.fontWeight,
								fontSize: theme.typography.largeFont,
								marginBottom: '10px',
							}}
						>
							User Information
						</Typography>
					</Box>
					<Stack spacing={2} sx={{ padding: '0 20px', marginBottom: '20px' }}>
						<Stack direction="row" justifyContent="center">
							<Typography
								sx={{
									justifySelf: 'center',
									color: theme.typography.common.black,
									fontWeight: theme.typography.light.fontWeight,
									fontSize: theme.typography.primary.smallFont,
								}}
							>
								Changing User Details Affects All Profiles
							</Typography>
						</Stack>
						<Typography
							sx={{
								color: theme.typography.common.blue,
								fontWeight: theme.typography.primary.fontWeight,
							}}
						>
							User First Name
						</Typography>
						<TextField
							name="first_name"
							value={firstName}
							onChange={handleInputChange}
							variant="filled"
							fullWidth
							placeholder="First Name"
							className={classes.root}
							InputProps={{
								style: {
									textAlign: 'center',
									paddingTop: '10px',
									paddingBottom: '25px',
									paddingBottom: '25px',
									height: '45px',
									boxSizing: 'border-box',
								},
							}}
						/>
					</Stack>

					<Stack spacing={2} sx={{ padding: '0 20px', marginBottom: '20px' }}>
						<Typography
							sx={{
								color: theme.typography.common.blue,
								fontWeight: theme.typography.primary.fontWeight,
							}}
						>
							User Last Name
						</Typography>
						<TextField
							name="last_name"
							value={lastName}
							onChange={handleInputChange}
							variant="filled"
							fullWidth
							placeholder="Last Name"
							className={classes.root}
							InputProps={{
								style: {
									textAlign: 'center',
									paddingTop: '10px',
									paddingBottom: '25px',
									height: '45px',
									boxSizing: 'border-box',
								},
							}}
						/>
					</Stack>

					<Stack spacing={2} sx={{ padding: '0 20px', marginBottom: '20px' }}>
						<Typography
							sx={{
								color: theme.typography.common.blue,
								fontWeight: theme.typography.primary.fontWeight,
							}}
						>
							Phone Number
						</Typography>
						<TextField
							name="phone_number"
							value={phoneNumber}
							onChange={handleInputChange}
							variant="filled"
							fullWidth
							placeholder="Phone Number"
							className={classes.root}
							InputProps={{
								style: {
									textAlign: 'center',
									paddingTop: '10px',
									paddingBottom: '25px',
									height: '45px',
									boxSizing: 'border-box',
								},
							}}
						/>
					</Stack>
					<Stack spacing={2} sx={{ padding: '0 20px', marginBottom: '20px' }}>
						<Typography
							sx={{
								color: theme.typography.common.blue,
								fontWeight: theme.typography.primary.fontWeight,
							}}
						>
							Email ID
						</Typography>
						<TextField
							name="email_id"
							value={emailAddress}
							onChange={handleInputChange}
							variant="filled"
							fullWidth
							disabled
							placeholder="Email"
							className={classes.root}
							InputProps={{
								style: {
									textAlign: 'center',
									paddingTop: '10px',
									paddingBottom: '25px',
									height: '45px',
									boxSizing: 'border-box',
								},
							}}
						/>
					</Stack>
					<Stack spacing={2} sx={{ padding: '0 20px', marginBottom: '20px' }}>
						<Typography
							sx={{
								color: theme.typography.common.blue,
								fontWeight: theme.typography.primary.fontWeight,
							}}
						>
							Google Authentication Provided
						</Typography>
						<FormControl>
							<RadioGroup row name="googleAuthProvided" value={googleAuthProvided ? "yes" : "no"}>
								<FormControlLabel
									value="yes"
									control={<Radio disabled sx={{
										color: "black", // Unselected radio button color
										"&.Mui-checked": {
										  color: "black", // Selected radio button color
										},
									  }}/>}
									label="Yes"
									sx={{ color: "black" }}
								/>
								<FormControlLabel
									value="no"
									control={<Radio disabled sx={{
										color: "black", // Unselected radio button color
										"&.Mui-checked": {
										  color: "black", // Selected radio button color
										},
									  }}/>}
									label="No"
									sx={{ color: "black" }}
								/>
							</RadioGroup>
						</FormControl>
					</Stack>
					<Stack spacing={2} sx={{ padding: '0 20px', marginBottom: '20px' }}>
						<Button
							variant="contained"
							type="submit"
							form="editProfileForm"
							sx={{
								width: '100%',
								backgroundColor: '#3D5CAC',
								'&:hover': {
									backgroundColor: '#3D5CAC',
								},
								borderRadius: '10px',
							}}
						>
							<Typography
								sx={{
									textTransform: 'none',
									color: 'white',
									fontWeight: theme.typography.primary.fontWeight,
									fontSize: theme.typography.mediumFont,
								}}
							>
								Save And Submit
							</Typography>
						</Button>
					</Stack>
				
					<GenericDialog
      isOpen={isDialogOpen}
      title={dialogTitle}
      contextText={dialogMessage}
      actions={[
        {
          label: "OK",
          onClick: closeDialog,
        }
      ]}
      severity={dialogSeverity}
    /></Box>
			</Paper>
		</ThemeProvider>
	);
}
