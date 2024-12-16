import React, { useState } from 'react';
import {
	Paper,
	Box,
	Stack,
	ThemeProvider,
	TextField,
	Button,
	Typography,
	Grid,
} from '@mui/material';
import theme from '../../theme/theme';
import UTurnLeftIcon from '@mui/icons-material/UTurnLeft';
import { makeStyles } from '@material-ui/core/styles';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
// import axios from 'axios';
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../utils/httpMiddleware";
import APIConfig from '../../utils/APIConfig';

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

export default function ChangePasswordSettingsManager(props) {
	const classes = useStyles();
	const navigate = useNavigate();
	const { user } = useUser();

	const [modifiedData, setModifiedData] = useState({ user_uid: user?.user_uid });
	const [isEdited, setIsEdited] = useState(false);

	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmNewPassword, setConfirmNewPassword] = useState('');

	const [emailAddress, setEmailAddress] = useState('');
	const [isForgotPassword, setIsForgotPassword] = useState(false);

	const handleInputChange = (event) => {
		const { name, value } = event.target;

		if (name === 'current_password') {
			setCurrentPassword(value);
			setModifiedData((prevData) => ({
				...prevData,
				[name]: value,
			}));
		} else if (name === 'new_password') {
			setNewPassword(value);
			setModifiedData((prevData) => ({
				...prevData,
				[name]: value,
			}));
		} else if (name === 'confirm_new_password') {
			setConfirmNewPassword(value);
		} else if (name === 'email_address') {
			setEmailAddress(value);
			setIsForgotPassword(true);
		}

		setIsEdited(true);
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		const headers = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': '*',
			'Access-Control-Allow-Headers': '*',
			'Access-Control-Allow-Credentials': '*',
		};
		const passwordsMatch = newPassword === confirmNewPassword;

		if (!passwordsMatch) {
			alert('Passwords do not match');
			return;
		}
		if (isEdited) {
			if (emailAddress === '') {
				axios
					.put(`${APIConfig.baseURL.dev}/password`, modifiedData, headers)
					.then((response) => {
						setIsEdited(false); // Reset the edit status
						props.setRHS('form');
					})
					.catch((error) => {
						if (error.response) {
							alert(error.response.data.message);
						}
					});
			} else {
				axios
					.post('https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/SetTempPassword/MYSPACE', {
						email: emailAddress,
					})
					.then((response) => {
						setEmailAddress('');
						if (response.data.code === 280) {
							alert('No account found with that email.');
							return;
						}
					});
			}
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
						<UTurnLeftIcon
							sx={{
								transform: 'rotate(90deg)',
								color: theme.typography.secondary.black,
								fontWeight: theme.typography.primary.fontWeight,
								fontSize: theme.typography.largeFont,
								padding: 5,
								position: 'absolute',
								left: 0,
							}}
							onClick={() => {
								props.setRHS('form');
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
							Settings
						</Typography>
					</Box>
				<Stack spacing={2} sx={{ padding: '0 20px', marginBottom: '20px' }}>
							
						<Stack
                    direction="row"
                    justifyContent="center"
                    >
                    <Typography 
                    sx={{
                        justifySelf: 'center',
                        color: theme.typography.common.black, 
                        fontWeight: theme.typography.light.fontWeight, 
                        fontSize:theme.typography.primary.smallFont}}>
                    Changing Password Affects All Profiles
                    </Typography>
                    </Stack><Typography
								sx={{
									color: theme.typography.common.blue,
									fontWeight: theme.typography.primary.fontWeight,
								}}
							>
								Old Password
							</Typography>
							<TextField
								name="current_password"
								value={currentPassword}
								onChange={handleInputChange}
								variant="filled"
								fullWidth
								placeholder="Old Password"
								type="password"
								className={classes.root}
								InputProps={{
									style: {
										textAlign: 'center',
										paddingTop: '10px',
										paddingBottom: '25px',paddingBottom: '25px',
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
								New Password
							</Typography>
							<TextField
								name="new_password"
								value={newPassword}
								onChange={handleInputChange}
								variant="filled"
								fullWidth
								placeholder="New Password"
								type="password"
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
								Confirm Password
							</Typography>
							<TextField
								name="confirm_new_password"
								value={confirmNewPassword}
								onChange={handleInputChange}
								variant="filled"
								fullWidth
								placeholder="Confirm Password"
								type="password"
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

					
						
						</Stack>
						<Stack spacing={2} sx={{ padding: '0 20px', marginBottom: '30px' }}>
							<Typography
								sx={{
									color: theme.typography.common.blue,
									fontWeight: theme.typography.primary.fontWeight,
									marginBottom: '10px',
								}}
							>
								Forgot Password?
							</Typography>
							<TextField
								name="email_address"
								value={emailAddress}
								onChange={handleInputChange}
								variant="filled"
								fullWidth
								placeholder="Enter Email"
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
							<Button
								variant="contained"
								type="submit"
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
									Send Recovery Link
								</Typography>
							</Button>
						
								</Stack>
					</Box>
				</Paper>
			
		</ThemeProvider>
	);
}
