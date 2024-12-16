import React, { useState, useEffect, useContext, } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import {
	TextField,
	Button,
	Grid,
	Select,
	MenuItem,
	Typography,
	FormControlLabel,
	Checkbox,
	Card,
	CardContent,
	Container,
	Box,
	ThemeProvider,
	Modal,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Stack,
	Paper,
	Radio,
	RadioGroup,
} from '@mui/material';
import { withStyles } from "@mui/styles";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from "@mui/icons-material/Close";
import { makeStyles } from '@mui/styles';
// import MapIcon from '@mui/icons-material/Map';
// import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import AddressAutocompleteInput from './AddressAutocompleteInput';
import theme from '../../theme/theme';
import { useUser } from '../../contexts/UserContext';
import ImageUploader from '../ImageUploader';
import { getLatLongFromAddress } from "../../utils/geocode";
import StaticMap from "./StaticMap"
import APIConfig from "../../utils/APIConfig";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import ReferUser from '../../components/Referral/ReferUser';
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
// import axios from "axios";
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../utils/httpMiddleware";
import { formatPhoneNumber, headers, roleMap } from "../Onboarding/helper"

import PropertiesContext from '../../contexts/PropertiesContext';
import ListsContext from '../../contexts/ListsContext';

const useStyles = makeStyles({
	card: {
		backgroundColor: '#D6D5DA', // Grey background for card
		padding: '16px',
		borderRadius: '8px', // Rounded corners for card
	},
	cardContent: {
		padding: '16px',
		backgroundColor: '#D6D5DA', // Grey background for card content
		borderRadius: '8px', // Rounded corners for card content
	},
	button: {
		height: '100%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		border: '1px dashed #ccc',
		borderRadius: '8px',
		color: '#160449',
		textTransform: 'none', // Ensure text is not transformed to uppercase
	},
	formControl: {
		minWidth: 120,
	},
	appliances: {
		display: 'flex',
		flexWrap: 'wrap',
	},
	buttonPrimary: {
		backgroundColor: '#6a5acd',
		color: '#fff',
		textTransform: 'none', // Ensure text is not transformed to uppercase
		'&:hover': {
			backgroundColor: '#483d8b',
		},
	},
	buttonSecondary: {
		backgroundColor: '#bc8f8f',
		color: '#fff',
		textTransform: 'none', // Ensure text is not transformed to uppercase
		'&:hover': {
			backgroundColor: '#8b7b8b',
		},
	},
	label: {
		display: 'flex',
		alignItems: 'center',
		fontWeight: theme.typography.primary.fontWeight,
		color: '#160449',
		fontSize: 16,
		marginBottom: '8px', // Add space below the label
	},
	inputField: {
		backgroundColor: 'white',
		borderColor: 'black',
		borderRadius: '3px',
		height: '40px', // Consistent height for all text fields
		marginTop: '8px', // Add space above the text field
	},
	autocompleteInput: {
		width: '100%',
		height: '40px', // Consistent height for the autocomplete input
		marginTop: '8px', // Add space above the autocomplete input
	},
	addPicturesButtonContainer: {
		display: 'flex',
		justifyContent: 'center', // Center horizontally
		alignItems: 'center', // Center vertically
	},
});



const PropertyForm = ({ onBack, showNewContract, property_endpoint_resp, setReloadPropertyList, setPropertyTo }) => {

	const { getList, } = useContext(ListsContext);
	const propertyTypes = getList("propertyType");
	const classes = useStyles();
	let navigate = useNavigate();
	const { getProfileId } = useUser();
	const { user, selectedRole, selectRole, Name } = useUser();

	const { setNewContractUID, setNewContractPropertyUID, fetchProperties, setNewPropertyUid, } = useContext(PropertiesContext);

	const [readOnlyNotes, setReadOnlyNotes] = useState(selectedRole === "MANAGER" ? true : false);
	const [selectedImageList, setSelectedImageList] = useState([]);
	const [referedUser, setReferedUser] = useState(false);
	const [referredOwner, setReferredOwner] = useState({});

	const location = useLocation();

	const [address, setAddress] = useState('');
	const [unit, setUnit] = useState('');
	const [city, setCity] = useState('');
	const [state, setState] = useState('');
	const [zip, setZip] = useState('');

	const [type, setType] = useState('');
	const [squareFootage, setSquareFootage] = useState('');
	const [bedrooms, setBedrooms] = useState('');
	const [bathrooms, setBathrooms] = useState('');
	const [cost, setCost] = useState('');
	const [assessmentYear, setAssessmentYear] = useState('');
	const [ownerId, setOwnerId] = useState(getProfileId());
	const [selectedOwner, setSelectedOwner] = useState('');
	const [notes, setNotes] = useState('');
	const [showSpinner, setShowSpinner] = useState(false);
	const [activeStep, setActiveStep] = useState(0);
	const [isListed, setListed] = useState(false);
	const [ownerList, setOwnerList] = useState([]);
	const [applianceList, setApplianceList] = useState([]);
	const [selectedAppliances, setSelectedAppliances] = useState([]);
	const [coordinates, setCoordinates] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);


	const [showGoBackDialog, setShowGoBackDialog] = useState(false);

	const [message, setMessage] = useState("");
	const [showEmailSentDialog, setShowEmailSentDialog] = useState(false);

	const handleCloseModal = () => {
		setIsModalOpen(false);
	};

	const handleAddressSelect = (address) => {

		setAddress(address.street ? address.street : "");
		setCity(address.city ? address.city : "");
		setState(address.state ? address.state : "");
		setZip(address.zip ? address.zip : "");
	};

	// useEffect(() => {

	// 	console.log("Address set to 23", address)
	// 	console.log("Address city set to 23", city)
	// }, [address, unit, city, state, zip]);




	// useEffect(() => {
	// 	console.log("194 - referredOwner - ", referredOwner);		
	// }, [referredOwner]);


	useEffect(() => {
		console.log("selectedOwner - ", selectedOwner);
		setReferredOwner({})
		// if(selectedOwner == null){
		// 	setIsModalOpen(false);
		// }
	}, [selectedOwner]);

	const handleUnitChange = (event) => {
		setUnit(event.target.value);
	};

	const handleCityChange = (event) => {
		setCity(event.target.value);
	};

	const handleStateChange = (event) => {
		setState(event.target.value);
	};

	const handleZipCodeChange = (event) => {
		setZip(event.target.value);
	};

	const handleTypeChange = (event) => {
		setType(event.target.value);
	};

	const handleSquareFootageChange = (event) => {
		setSquareFootage(event.target.value);
	};

	const handleBedroomsChange = (event) => {
		setBedrooms(event.target.value);
	};

	const handleBathroomsChange = (event) => {
		setBathrooms(event.target.value);
	};

	const handleCostChange = (event) => {
		setCost(event.target.value);
	};

	const handleOwnerChange = (event) => {
		if (event.target.value === 'referOwner') {
			setIsModalOpen(true);
			setSelectedOwner(null);
			setReferedUser(false);
		} else {
			setIsModalOpen(false);
			setSelectedOwner(event.target.value);
			setReferedUser(true);
		}

	};

	const handleSetSelectedOwner = (userId) => {
		setSelectedOwner(userId);
		setReferedUser(true);
		setIsModalOpen(false);
	};

	const handleListedChange = (event) => {
		setListed(event.target.checked);
	};

	const handleNotesChange = (event) => {
		setNotes(event.target.value);
	};

	const handleApplianceChange = (event) => {
		const value = event.target.value;
		setSelectedAppliances((prevSelected) => {
			if (prevSelected.includes(value)) {
				return prevSelected.filter((item) => item !== value);
			} else {
				return [...prevSelected, value];
			}
		});
	};

	//calls properties and contracts
	const handleSaveProperty = async (ownerUID) => {
		if (ownerUID == null) return;

		setShowSpinner(true);
		const formData = new FormData();

		const currentDate = new Date();
		const formattedDate = `${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}-${currentDate.getFullYear()}`;

		const fullAddress = `${address}, ${city}, ${state}, ${zip}`;

		const coordinates = await getLatLongFromAddress(fullAddress);

		//console.log("----selectedAppliances----", selectedAppliances);


		if (coordinates) {
			formData.append("property_latitude", coordinates.latitude);
			formData.append("property_longitude", coordinates.longitude);
		}

		// formData.append("property_owner_id", selectedOwner ? selectedOwner : ownerId);
		formData.append("property_owner_id", ownerUID);

		formData.append("property_active_date", formattedDate);
		formData.append("property_address", address);
		formData.append("property_unit", unit);
		formData.append("property_city", city);
		formData.append("property_state", state);
		formData.append("property_zip", zip);
		formData.append("property_type", type);
		formData.append("property_num_beds", bedrooms);
		formData.append("property_num_baths", bathrooms);
		formData.append("property_value", cost);
		formData.append("property_value_year", assessmentYear);
		formData.append("property_area", squareFootage);
		formData.append("property_listed", 0);
		formData.append("property_notes", notes);

		console.log("----selectedAppliances---", JSON.stringify(selectedAppliances));
		formData.append("appliances", JSON.stringify(selectedAppliances));
		console.log("Formdata:", formData);

		for (let [key, value] of formData.entries()) {
			console.log("Property Data entered");
			console.log(key, value);
		}

		const files = selectedImageList;
		let i = 0;
		for (const file of selectedImageList) {
			let key = `img_${i++}`;
			if (file.file !== null) {
				formData.append(key, file.file);
			} else {
				formData.append(key, file.image);
			}
			if (file.coverPhoto) {
				formData.append("img_favorite", key);
			}
		}



		let responsePropertyUID = null;
		try {
			const response = await fetch(`${APIConfig.baseURL.dev}/properties`, {
				method: "POST",
				body: formData,
			});
			const data = await response.json();
			console.log("response data", data);
			responsePropertyUID = data.property_UID;
			setNewContractPropertyUID(responsePropertyUID);
			console.log("response data - property UID: ", responsePropertyUID);

			// setReloadPropertyList(true);


			fetchProperties();
			// setPropertyTo(responsePropertyUID);
			setNewPropertyUid(responsePropertyUID)
		} catch (error) {
			console.log("Error posting data:", error);
		}

		// create new contract if profile === manager
		let responseContractUID = null;
		if (selectedRole === "MANAGER") {
			const contractFormData = new FormData();

			console.log("In Create new contract");

			const currentDate = new Date();
			const formattedDate = `${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}-${currentDate.getFullYear()}`;

			const PropertyUID = responsePropertyUID === null ? null : '["' + responsePropertyUID + '"]';
			console.log("Reformated property data: ", PropertyUID);
			contractFormData.append("contract_property_ids", PropertyUID);
			console.log("Immediately after: ", contractFormData);
			contractFormData.append("contract_business_id", getProfileId());
			contractFormData.append("contract_start_date", formattedDate);
			contractFormData.append("contract_status", "NEW");
			// console.log("Contract Formdata:", contractFormData);

			console.log("In Create new contract - contractFormData = ", contractFormData);
			if (responsePropertyUID !== null) {
				const url = `${APIConfig.baseURL.dev}/contracts`;



				try {
					const response = await fetch(url, {
						method: "POST",
						body: contractFormData,
					});

					if (!response.ok) {
						throw new Error("Network response was not ok");
					}

					const data = await response.json();
					console.log("contracts - POST - response data = ", data);

					responseContractUID = data.contract_uid;
					setNewContractUID(responseContractUID);
					console.log("response data - contract UID: ", responseContractUID);

					console.log('navigating to /pmQuotesList', responseContractUID, getProfileId(), responsePropertyUID);
					// navigate("/pmQuotesList", {
					//   state: {
					//     selectedContractUID: responseContractUID,		
					// 	selectedContractPropertyUID: responsePropertyUID[0],   
					//   },
					// });			
				} catch (error) {
					console.error("Error:", error);
				}
			}
		}


		if (selectedRole === "MANAGER" && responseContractUID != null && responsePropertyUID != null) {
			navigate("/pmQuotesList", {
				state: {
					selectedContractUID: responseContractUID,
					selectedContractPropertyUID: responsePropertyUID,
					navigatingFrom: "PropertyForm",
				},
			});
		}

		setAddress("");
		setUnit("");
		setCity("");
		setState("");
		setZip("");
		setType("");
		setSquareFootage("");
		setBedrooms("");
		setBathrooms("");
		setNotes("");
		setSelectedImageList([]);
		setActiveStep(0);
		setShowSpinner(false);



		if (selectedRole === "OWNER") {
			onBack();
		}

	};

	const handleExistingUser = async (createAccResponse) => {
		const userRolesList = createAccResponse.user_roles?.split(",");
		const userUID = createAccResponse.user_uid;

		console.log("handleExistingUser - userRolesList - ", userRolesList);
		console.log("handleExistingUser - userUID - ", userUID);

		if (userRolesList.includes('OWNER')) {
			//create property with user id
			handleSaveProperty(userUID);
		} else {
			//add role
			// create owner profile
			setShowSpinner(true);
			userRolesList.push("OWNER");
			const updatedRoles = userRolesList.join(",");
			// Send the update request to the server
			const response = await axios.put("https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/UpdateUserByUID/MYSPACE", {
				user_uid: userUID,
				role: updatedRoles,
			});
			// Check if the response is successful
			if (response.status === 200) {
				console.log("Role - \"OWNER\" added to existing user successfully");
				const payload = {
					owner_user_id: userUID,
					// owner_first_name: response.data.result?.user?.first_name,
					// owner_last_name: response.data.result?.user?.last_name,
					// owner_phone_number: response.data.result?.user?.phone_number,
					// owner_email: response.data.result?.user?.email
					owner_first_name: referredOwner?.first_name,
					owner_last_name: referredOwner?.last_name,
					owner_phone_number: referredOwner?.phone_number,
					owner_email: referredOwner?.email
				};

				const form = new FormData();
				for (let key in payload) {
					form.append(key, payload[key]);
				}

				// for (var pair of form.entries()) {
				//   console.log(pair[0]+ ', ' + pair[1]); 
				// }
				const { profileApi } = roleMap["OWNER"];

				const { data } = await axios.post(
					`${APIConfig.baseURL.dev}${profileApi}`,
					form,
					headers
				);

				// if (data.owner_uid) {
				//   updateProfileUid({ owner_id: data.owner_uid });
				// }

				// const userUID = response.data.result?.user?.user_uid;        
				// const link = `http://localhost:3000/referralSignup/${userUID}`
				const link = `https://iopropertymanagement.netlify.app/referralSignup/${userUID}`

				const emailPayload = {
					"receiver": referredOwner.email,
					"email_subject": `Owner Profile created for your account at ManifestMySpace`,
					"email_body": message + `Please Login to your account and verify your profile information.`,
				}
				const emailResponse = await axios.post(
					`${APIConfig.baseURL.dev}/sendEmail`,
					emailPayload
				);

				if (emailResponse.status === 200) {
					setShowEmailSentDialog(true);
					//   onReferralSuccess(data.owner_uid); 
					handleSetSelectedOwner(data.owner_uid);
					setReferedUser(true)
				} else {
					throw Error("Could not send an email to the new user.");
				}

				setShowSpinner(false);

				// navigate(-1);

				// console.log("data - ", data);
				if (data.owner_uid) {
					handleSaveProperty(data.owner_uid);
				}

			} else {
				alert("An error occurred while updating the roles for the new user.");
			}
		}
	}

	const isEmptyObject = (obj) => {
		return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
	};

	const handleSubmitNew = async (event) => {
		event.preventDefault();

		//checks for property fields
		if (!address) {
			alert("Address should not be empty.");
			return;
		}

		if (!type) {
			alert("Type of the property should not be empty.");
			return;
		}

		if (!squareFootage) {
			alert("Area of the property should not be empty.");
			return;
		}

		if (!bedrooms) {
			alert("No of beds should not be empty.");
			return;
		}
		if (!bathrooms) {
			alert("No of bath should not be empty.");
			return;
		}

		if (selectedRole === "MANAGER" && (selectedOwner == null || selectedOwner == '') && (isEmptyObject(referredOwner) || referredOwner == null || referredOwner == '')) {
			alert("Please select an owner (or) refer a new owner for the property");
			return;
		}
		console.log("handleSubmitNew - selectedOwner - ", selectedOwner);
		console.log("handleSubmitNew - referredOwner - ", referredOwner);

		if (selectedRole === "OWNER") {
			handleSaveProperty(ownerId);
			return;
		}

		if (selectedOwner != null) {
			// create property as usual
			handleSaveProperty(selectedOwner)
			return;
		} else {
			// referring a new owner



			handleReferOwner()
				.then(() => {
					console.log("Successfully Referred Owner ");
					//handleSaveProperty(ownerUID);
				})
				.catch(error => {
					console.error("Error referring owner:", error);
				});
		}

	};

	const handleNewUser = async (response) => {
		console.log("---response before payload---", response);
		setShowSpinner(true);
		const payload = {
			owner_user_id: response.data.result?.user?.user_uid,
			owner_first_name: referredOwner?.first_name,
			owner_last_name: referredOwner?.last_name,
			owner_phone_number: referredOwner?.phone_number,
			owner_email: referredOwner?.email
		};

		const form = new FormData();
		for (let key in payload) {
			form.append(key, payload[key]);
		}

		// for (var pair of form.entries()) {
		//   console.log(pair[0]+ ', ' + pair[1]); 
		// }
		const { profileApi } = roleMap["OWNER"];

		const { data } = await axios.post(
			`${APIConfig.baseURL.dev}${profileApi}`,
			form,
			headers
		);

		// if (data.owner_uid) {
		//   updateProfileUid({ owner_id: data.owner_uid });
		// }

		const userUID = response.data.result?.user?.user_uid;
		// const link = `http://localhost:3000/referralSignup/${userUID}`
		const link = `https://iopropertymanagement.netlify.app/referralSignup/${userUID}`

		const emailPayload = {
			"receiver": referredOwner.email,
			"email_subject": `You have been invited to join ManifestMySpace`,
			"email_body": message + ` Please sign up using the link - ${link}. Don't forget to verify your profile information and create a password to finish setting up your profile. You can also sign up using your Google Account.`,
		}
		const emailResponse = await axios.post(
			`${APIConfig.baseURL.dev}/sendEmail`,
			emailPayload
		);

		if (emailResponse.status === 200) {
			setShowEmailSentDialog(true);
			//   onReferralSuccess(data.owner_uid); 
			handleSetSelectedOwner(data.owner_uid);
			setReferedUser(true)
		} else {
			throw Error("Could not send an email to the new user.");
		}

		setShowSpinner(false);

		// navigate(-1);

		console.log("handleNewUser - data - ", data);
		if (data.owner_uid) {
			return data.owner_uid;
		}
	}

	const handleReferOwner = async () => {
		// 3 cases
		//  a - new user - create account, profile - post, properties- post
		// 	b - existing user without an owner role - createAccount, updateUserByUID, profile- post, properties - post
		//  c - existing user with an owner role - createAccount, properties - post

		setShowSpinner(true);
		// const role = roles.join(",");
		const payload = {
			"first_name": referredOwner.first_name,
			"last_name": referredOwner.last_name,
			"phone_number": referredOwner.phone_number,
			"email": referredOwner.email,
			"password": `referred by ${getProfileId()}`,
			"role": "OWNER",
			"isEmailSignup": true,
		};

		console.log("handleReferOwner - payload - ", payload)
		// return;

		// setOnboardingState({
		//   ...onboardingState,
		//   roles,
		// });
		const isEmailSignup = true
		if (isEmailSignup) {
			const response = await axios.post(
				"https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/CreateAccount/MYSPACE",
				payload
			);
			if (response.data.message === "User already exists") {
				// alert(response.data.message);
				// handleExistingUser(response.data);
				handleExistingUser(response.data)
					// .then(ownerUID => {
					// 	handleSaveProperty(ownerUID); // Use the resolved value
					// })
					.then(() => {
						console.log("handleExistingUser successful.")
					})
					.catch(error => {
						console.error("Error handling refer owner:", error);
					});
				setShowSpinner(false);
				return;
			} else {
				// setAuthData(response.data.result); 
				handleNewUser(response)
					.then(ownerUID => {
						// console.log("ownerUID from handleNewUser - ", ownerUID)
						handleSaveProperty(ownerUID);
					})
					.catch(error => {
						console.error("Error handling refer owner:", error);
					});
				setShowSpinner(false);
			}
		}

	}

	useEffect(() => {
		//This runs for a manager who wants to select an owner while adding a property
		if (selectedRole === "MANAGER") {
			console.log("MANAGER ID", ownerId);
			const getOwnerContacts = async () => {
				try {
					const response = await fetch(`${APIConfig.baseURL.dev}/contacts/${getProfileId()}`);

					if (!response.ok) {
						console.log("Error fetching owner data");
						return;
					}
					const ownerdata = await response.json();
					console.log("----ownerdata---", ownerdata);
					let contactArray = ownerdata.management_contacts.owners;
					let ownerObjList = [];
					contactArray.forEach((contact) => {
						let obj = {
							owner_id: contact.owner_uid,
							owner_name: contact.owner_first_name + " " + contact.owner_last_name,
						};
						ownerObjList.push(obj);
					});
					setOwnerList(ownerObjList);
				} catch (error) {
					console.log(error);
				}
			};
			getOwnerContacts();
		}
	}, [setAddress, setUnit, setCity, setState, setZip,]);

	const fetchAppliances = () => {
		const validAppliances = getList("appliances");
		setApplianceList(validAppliances);
	};

	useEffect(() => {
		fetchAppliances();
	}, []);

	const handleBackClick = () => {
		setShowGoBackDialog(true);
	}

	useEffect(() => {
		const fullAddress = `${address}, ${city}, ${state}, ${zip}`;

		const updateCoordinates = async () => {
			if (address && city && state && zip) {
				const coords = await getLatLongFromAddress(fullAddress);
				console.log("Updated coordinates: ", coords);
				setCoordinates(coords);
			}
		};

		updateCoordinates();
	}, [address, city, state, zip]);


	return (
		<ThemeProvider theme={theme}>
			<Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
				<CircularProgress color="inherit" />
			</Backdrop>
			<Container maxWidth="md" style={{ backgroundColor: '#F2F2F2', padding: '16px', borderRadius: '8px', marginTop: '15px', }}>
				<Grid container spacing={8}>
					<Grid item xs={2}>
						<Button onClick={handleBackClick} sx={{
							'&:hover': {
								backgroundColor: 'white',
							}
						}}>
							<ArrowBackIcon sx={{ color: theme.typography.primary.black, fontSize: "30px", marginLeft: -20 }} />
						</Button>
					</Grid>
					<Grid container justifyContent='center' item xs={8}>
						<Typography sx={{ fontSize: '24px', color: "#160449", fontWeight: 'bold' }}>
							Enter Property Details
						</Typography>
					</Grid>

					<Grid item xs={2}>

					</Grid>
				</Grid>

				<Card sx={{ backgroundColor: '#D6D5DA', marginBottom: '18px', padding: '16px', borderRadius: '8px' }}>
					<CardContent className={classes.cardContent}>
						<Grid container spacing={8}>
							<Grid item xs={12} sm={4} className={classes.addPicturesButtonContainer}>

								<StaticMap
									latitude={coordinates?.latitude}
									longitude={coordinates?.longitude}
									size="400x400"
									zoom={15}
									defaultCenter={{ lat: 37.3382, lng: -121.8863 }}
								/>
							</Grid>
							<Grid item xs={12} sm={8}>
								<Grid container spacing={3}>
									<Grid item xs={2}>
										<Typography
											sx={{
												marginTop: '4px',
												color: '#160449',
												fontWeight: theme.typography.primary.fontWeight,
												fontSize: 14,
											}}
										>
											Address
										</Typography>
									</Grid>
									<Grid item xs={10}>
										<AddressAutocompleteInput
											className={classes.autocompleteInput}
											onAddressSelect={handleAddressSelect}
											defaultValue={address}
										/>
									</Grid>
									<Grid item xs={2}>
										<Typography
											sx={{
												marginTop: '4px',
												color: '#160449',
												fontWeight: theme.typography.primary.fontWeight,
												fontSize: 14,
											}}
										>
											Unit
										</Typography>
									</Grid>
									<Grid item xs={10}>
										<TextField
											sx={{
												backgroundColor: 'white',
												borderColor: 'black',
												borderRadius: '3px',
												height: '40px', // Consistent height for all text fields
												marginTop: '4px', // Add space above the text field
											}}
											size="small"
											fullWidth
											onChange={handleUnitChange}
											placeholder="Optional"
										/>
									</Grid>
									<Grid item xs={2}>
										<Typography
											sx={{
												marginTop: '4px',
												color: '#160449',
												fontWeight: theme.typography.primary.fontWeight,
												fontSize: 14,
											}}
										>
											City
										</Typography>
									</Grid>
									<Grid item xs={10}>
										<TextField

											value={city}
											size="small"
											fullWidth
											sx={{
												backgroundColor: 'white',
												borderColor: 'black',
												borderRadius: '3px',
												height: '40px', // Consistent height for all text fields
												marginTop: '4px', // Add space above the text field
											}}
											placeholder="City"
											onChange={handleCityChange}
											disabled
										/>
									</Grid>
									<Grid item xs={2}>
										<Typography
											sx={{
												marginTop: '4px',
												color: '#160449',
												fontWeight: theme.typography.primary.fontWeight,
												fontSize: 14,
											}}
										>
											State
										</Typography>
									</Grid>
									<Grid item xs={10}>
										<TextField
											value={state}
											size="small"
											fullWidth
											sx={{
												backgroundColor: 'white',
												borderColor: 'black',
												borderRadius: '3px',
												height: '40px', // Consistent height for all text fields
												marginTop: '4px', // Add space above the text field
											}}
											placeholder="State"
											onChange={handleStateChange}
											disabled
										/>
									</Grid>
									<Grid item xs={2}>
										<Typography
											sx={{
												marginTop: '4px',
												color: '#160449',
												fontWeight: theme.typography.primary.fontWeight,
												fontSize: 14,
											}}
										>
											Zip Code
										</Typography>
									</Grid>
									<Grid item xs={10}>
										<TextField
											disabled
											value={zip}
											size="small"
											fullWidth
											sx={{
												backgroundColor: 'white',
												borderColor: 'black',
												borderRadius: '3px',
												height: '40px', // Consistent height for all text fields
												marginTop: '4px', // Add space above the text field
											}}
											placeholder="Zip Code"
											onChange={handleZipCodeChange}
										/>
									</Grid>
								</Grid>
							</Grid>
						</Grid>
					</CardContent>
				</Card>

				<Card sx={{ backgroundColor: '#D6D5DA', marginBottom: '18px', padding: '16px', borderRadius: '8px' }}>
					<CardContent className={classes.cardContent}>
						<Grid container spacing={8}>
							<Grid item xs={12} sm={4} sx={{
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
							}}>
								<ImageUploader
									selectedImageList={selectedImageList}
									setSelectedImageList={setSelectedImageList}
									page={'Add'}
								/>
							</Grid>
							<Grid item xs={12} sm={8}>
								<Grid container spacing={3} columnSpacing={12}>
									<Grid item xs={2}>
										<Typography
											sx={{
												marginTop: '4px',
												color: '#160449',
												fontWeight: theme.typography.primary.fontWeight,
												fontSize: 14,
											}}
										>
											Type
										</Typography>
									</Grid>
									<Grid item xs={10}>
										<Select
											sx={{
												backgroundColor: 'white',
												borderColor: 'black',
												borderRadius: '7px',
												marginTop: '4px',
											}}
											size="small"
											fullWidth
											onChange={handleTypeChange}
											value={type}
										>
											{
												propertyTypes?.map(type => (
													<MenuItem key={type.list_uid} value={type.list_item}>{type.list_item}</MenuItem>
												))
											}
										</Select>
									</Grid>
									<Grid item xs={2}>
										<Typography
											sx={{
												marginTop: '4px',
												color: '#160449',
												fontWeight: theme.typography.primary.fontWeight,
												fontSize: 14,
											}}
										>
											SqFt
										</Typography>
									</Grid>
									<Grid item xs={10}>
										<TextField
											size="small"
											fullWidth
											sx={{
												backgroundColor: 'white',
												borderColor: 'black',
												borderRadius: '3px',
												height: '40px', // Consistent height for all text fields
												marginTop: '4px', // Add space above the text field
											}}
											placeholder="Enter sqft"
											onChange={handleSquareFootageChange}
										/>
									</Grid>
									<Grid item xs={2}>
										<Typography
											sx={{
												marginTop: '4px',
												color: '#160449',
												fontWeight: theme.typography.primary.fontWeight,
												fontSize: 14,
											}}
										>
											Bedrooms
										</Typography>
									</Grid>
									<Grid item xs={10}>
										<TextField
											size="small"
											fullWidth
											sx={{
												backgroundColor: 'white',
												borderColor: 'black',
												borderRadius: '3px',
												height: '40px', // Consistent height for all text fields
												marginTop: '4px', // Add space above the text field
											}}
											placeholder="# of bedrooms"
											onChange={handleBedroomsChange}
										/>
									</Grid>
									<Grid item xs={2}>
										<Typography
											sx={{
												marginTop: '4px',
												color: '#160449',
												fontWeight: theme.typography.primary.fontWeight,
												fontSize: 14,
											}}
										>
											Bathrooms
										</Typography>
									</Grid>
									<Grid item xs={10}>
										<TextField
											size="small"
											fullWidth
											sx={{
												backgroundColor: 'white',
												borderColor: 'black',
												borderRadius: '3px',
												height: '40px', // Consistent height for all text fields
												marginTop: '4px', // Add space above the text field
											}}
											placeholder="# of bathrooms"
											onChange={handleBathroomsChange}
										/>
									</Grid>
									<Grid item xs={2}>
										<Typography
											sx={{
												marginTop: '4px',
												color: '#160449',
												fontWeight: theme.typography.primary.fontWeight,
												fontSize: 14,
											}}
										>
											Property Value
										</Typography>
									</Grid>
									<Grid item xs={10}>
										<TextField
											size="small"
											fullWidth
											sx={{
												backgroundColor: 'white',
												borderColor: 'black',
												borderRadius: '3px',
												height: '40px', // Consistent height for all text fields
												marginTop: '4px', // Add space above the text field
											}}
											placeholder="$"
											onChange={handleCostChange}
										/>
									</Grid>
									<Grid item xs={2.5} sx={{ padding: '2px', }}>
										<Typography
											sx={{
												marginTop: '5px',
												color: '#160449',
												fontWeight: theme.typography.primary.fontWeight,
												fontSize: 14,
											}}
										>
											Assessment Year
										</Typography>
									</Grid>
									<Grid item xs={9.5}>
										<LocalizationProvider dateAdapter={AdapterDayjs}>
											<DatePicker
												// label="Year"
												value={assessmentYear ? dayjs(assessmentYear) : null}
												views={['year']}
												format="YYYY"
												maxDate={dayjs(new Date())}
												onChange={(e) => {
													const formattedDate = e ? e.format("YYYY") : null;
													setAssessmentYear(formattedDate)
												}}
												sx={{
													backgroundColor: '#FFFFFF',
													width: '100%',
													borderRadius: '3px',
													marginTop: '5px',
													'& .MuiInputBase-input': {
														height: '30px', // Adjust the height here
														padding: '5px 10px', // Adjust padding if needed
													},
												}}
												fullWidth
												InputLabelProps={{
													sx: {
														fontSize: '10px',
														height: '40px',
													},
												}}
											/>
										</LocalizationProvider>
									</Grid>
									<Grid item xs={2}>
										<Typography
											sx={{
												marginTop: '4px',
												color: '#160449',
												fontWeight: theme.typography.primary.fontWeight,
												fontSize: 14,
											}}
										>
											$/SqFt
										</Typography>
									</Grid>
									<Grid item xs={10}>
										<Typography>{squareFootage ? Math.round(cost / squareFootage) : 0}</Typography>
									</Grid>
								</Grid>
							</Grid>
							<Grid item xs={12}>
								{selectedRole === "MANAGER" ? (
									<div>
										<Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.mediumFont }}>
											Owner
										</Typography>
										<Select
											sx={{
												backgroundColor: "white",
												borderColor: "black",
												borderRadius: "7px",
											}}
											size="small"
											fullWidth
											value={selectedOwner}
											onChange={handleOwnerChange}
											displayEmpty
										>
											<MenuItem value="" disabled>
												Select Owner
											</MenuItem>
											<MenuItem value="referOwner">Refer Owner</MenuItem>
											{ownerList.map((option, index) => (
												<MenuItem key={index} value={option.owner_id}>
													{option.owner_name}
												</MenuItem>
											))}
										</Select>

									</div>
								) : (
									<div></div>
								)}
							</Grid>
							<Grid item xs={12}>
								{selectedRole === "MANAGER" ? (
									<div>
										<FormControlLabel control={<Checkbox checked={isListed} onChange={handleListedChange} />} label="Available to rent" />
									</div>
								) : (
									<div></div>
								)}
							</Grid>
							{
								isModalOpen && (
									<Grid item xs={12}>
										<ReferOwner onClose={handleCloseModal} setReferredOwner={setReferredOwner} setSelectedOwner={setSelectedOwner} setMessage={setMessage} />
									</Grid>
								)
							}

						</Grid>
					</CardContent>
				</Card>

				<Card sx={{ backgroundColor: '#D6D5DA', marginBottom: '18px', padding: '16px', borderRadius: '8px' }}>
					<CardContent className={classes.cardContent}>
						<Grid item xs={12}>
							<Typography
								sx={{ color: '#160449', fontWeight: theme.typography.primary.fontWeight, fontSize: 14 }}
							>
								Owner Notes
							</Typography>
							<TextField
								fullWidth
								sx={{
									backgroundColor: readOnlyNotes ? theme.palette.form.main : 'white',
									borderColor: 'black',
									borderRadius: '7px',
									marginTop: '8px',
								}}
								InputProps={{
									readOnly: readOnlyNotes,
								}}
								size="small"
								multiline={true}
								onChange={handleNotesChange}
							/>
						</Grid>
						<Grid item xs={12}>
							<Typography
								sx={{ color: '#160449', fontWeight: theme.typography.primary.fontWeight, fontSize: 14 }}
							>
								Appliances Included
							</Typography>
							<Grid container spacing={0}>
								{applianceList?.map((appliance, index) => (
									<Grid item xs={6} sm={4} key={index}>
										<FormControlLabel
											control={
												<Checkbox
													value={appliance.list_uid}
													checked={selectedAppliances.includes(appliance.list_uid)}
													onChange={handleApplianceChange}
												/>
											}
											label={appliance.list_item}
										/>
									</Grid>
								))}
							</Grid>
						</Grid>
					</CardContent>
				</Card>

				<Grid container spacing={2}>
					<Grid item xs={12} sm={12}>
						<Button
							variant="contained"
							fullWidth
							sx={{
								backgroundColor: '#9EAED6',
								'&:hover': {
									backgroundColor: '#9EAED6',
								},
								color: '#160449',
								fontWeight: 'bold',
								textTransform: 'none',
							}}
							// onClick={handleSubmit}
							onClick={handleSubmitNew}
						>
							Save Property
						</Button>
					</Grid>
				</Grid>
				<Dialog
					open={showGoBackDialog}
					onClose={() => setShowGoBackDialog(false)}
					aria-labelledby='alert-dialog-title'
					aria-describedby='alert-dialog-description'
				>
					<DialogContent>
						<DialogContentText
							id='alert-dialog-description'
							sx={{
								fontWeight: theme.typography.common.fontWeight,
								paddingTop: "10px",
							}}
						>
							Are you sure you want to leave without saving the new property?
						</DialogContentText>
					</DialogContent>
					<DialogActions>
						<Box
							sx={{
								width: "100%",
								display: "flex",
								flexDirection: "row",
								justifyContent: "center",
							}}
						>
							<Button
								onClick={() => onBack()}
								sx={{
									color: "white",
									backgroundColor: "#3D5CAC80",
									":hover": {
										backgroundColor: "#3D5CAC",
									},
									marginRight: "10px",
								}}
								autoFocus
							>
								Yes
							</Button>
							<Button
								onClick={() => setShowGoBackDialog(false)}
								sx={{
									color: "white",
									backgroundColor: "#3D5CAC80",
									":hover": {
										backgroundColor: "#3D5CAC",
									},
									marginLeft: "10px",
								}}
							>
								No
							</Button>
						</Box>
					</DialogActions>
				</Dialog>

				<Dialog open={showEmailSentDialog} onClose={() => setShowEmailSentDialog(false)} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
					<DialogTitle id="alert-dialog-title">Referral Sent</DialogTitle>
					<DialogContent>
						<DialogContentText
							id="alert-dialog-description"
							sx={{
								color: theme.typography.common.blue,
								fontWeight: theme.typography.common.fontWeight,
								paddingTop: "10px",
							}}
						>
							Thank you for referring a new user to ManifestMySpace. An email has been sent to the user with a link to Sign Up.
						</DialogContentText>
					</DialogContent>
					<DialogActions>
						{/* <Button onClick={() => handleCancel(managerData)} color="primary" autoFocus> */}
						<Button
							onClick={() => setShowEmailSentDialog(false)}
							sx={{
								color: "white",
								backgroundColor: "#3D5CAC80",
								":hover": {
									backgroundColor: "#3D5CAC",
								},
							}}
							autoFocus
						>
							OK
						</Button>
					</DialogActions>
				</Dialog>

			</Container>
		</ThemeProvider>);
};

const CustomTextField = withStyles({
	root: {
		'& .MuiOutlinedInput-root': {
			border: "none",
			'&.Mui-focused fieldset': {
				borderColor: 'transparent',
			},
			'&:hover fieldset': {
				borderColor: 'transparent',
			},
		},
	},
})(TextField);

function ReferOwner({ onClose, onReferralSuccess, setReferedUser, setReferredOwner, setSelectedOwner, setMessage }) {

	const { getProfileId, } = useUser();
	// const [showSpinner, setShowSpinner] = useState(false);



	const [email, setEmail] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	// const [role, setRole] = useState("");

	useEffect(() => {
		setReferredOwner(prevState => ({
			...prevState,
			"email": email ? email : "",
			"first_name": firstName ? firstName : "",
			"last_name": lastName ? lastName : "",
			"phone_number": phoneNumber ? phoneNumber : "",
			"password": `referred by ${getProfileId()}`,
			"role": "OWNER",
			"isEmailSignup": true,
		}));
	}, [email, firstName, lastName, phoneNumber]);

	return (
		// <ThemeProvider theme={theme}>
		<>

			<Stack
				style={{
					display: "flex",
					flexDirection: "column", // Stack the content vertically
					justifyContent: "flex-start", // Start content at the top
					alignItems: "center", // Center content horizontally
					width: "100%",
					// minHeight: "100vh",
					marginTop: theme.spacing(2), // Adjust this for desired distance from the top
					// paddingBottom: "50px",
				}}
			>
				<Paper
					style={{
						margin: "10px",
						padding: theme.spacing(2),
						backgroundColor: "#F2F2F2",
						width: "100%", // Occupy full width with 25px margins on each side
						//   [theme.breakpoints.down("sm")]: {
						// 	width: "80%",
						//   },
						//   [theme.breakpoints.up("sm")]: {
						// 	width: "50%",
						//   },
						paddingTop: "10px",
					}}
				>
					<Stack direction="row" justifyContent="center" alignItems="center" position="relative">
						<Box direction="row" justifyContent="center" alignItems="center">
							<Typography sx={{ color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}>
								Refer an Owner
							</Typography>
						</Box>
						{/* <Box position="absolute" right={0}>
				<Button onClick={onClose}>
				  <CloseIcon sx={{ color: theme.typography.common.blue, fontSize: "30px", margin: "5px" }} />
				</Button>
			  </Box> */}
					</Stack>

					<Stack direction="column" justifyContent="center" alignItems="center" padding="25px">
						<Box
							// component="form"
							sx={
								{
									// '& .MuiTextField-root': { m: 1, width: '25ch' },
								}
							}
							// noValidate
							autoComplete="off"
							id="addPropertyForm"
						>
							<Grid container columnSpacing={12} rowSpacing={6}>
								<Grid item xs={12}>
									<Typography sx={{ color: theme.typography.common.blue, fontSize: theme.typography.mediumFont }}>
										First Name
									</Typography>
									<CustomTextField
										onChange={(e) => setFirstName(e.target.value)}
										sx={{
											backgroundColor: "#D9D9D9",
											border: "none",
											outline: "none",
											//   borderColor: "black",
											borderRadius: "10px",
											"&:focus-within": {
												outline: "none",
												borderColor: "transparent",
												boxShadow: "none",
											},
										}}
										size="small"
										fullWidth
									/>
								</Grid>

								<Grid item xs={12}>
									<Typography sx={{ color: theme.typography.common.blue, fontSize: theme.typography.mediumFont }}>
										Last Name
									</Typography>
									<CustomTextField
										onChange={(e) => setLastName(e.target.value)}
										sx={{
											backgroundColor: "#D9D9D9",
											border: "none",
											outline: "none",
											//   borderColor: "black",
											borderRadius: "10px",
											"&:focus-within": {
												outline: "none",
												borderColor: "transparent",
												boxShadow: "none",
											},
										}}
										size="small"
										fullWidth
									/>
								</Grid>

								<Grid item xs={12}>
									<Typography sx={{ color: theme.typography.common.blue, fontSize: theme.typography.mediumFont }}>
										Email
									</Typography>
									<CustomTextField
										onChange={(e) => setEmail(e.target.value)}
										sx={{
											backgroundColor: "#D9D9D9",
											borderColor: "black",
											borderRadius: "7px",
										}}
										size="small"
										fullWidth
									/>
								</Grid>

								<Grid item xs={12}>
									<Typography sx={{ color: theme.typography.common.blue, fontSize: theme.typography.mediumFont }}>
										{"Phone Number (Optional)"}
									</Typography>
									<CustomTextField
										type="tel"
										pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
										value={phoneNumber}
										onChange={(e) =>
											setPhoneNumber(formatPhoneNumber(e.target.value))
										}
										// placeholder="Phone Number"
										sx={{
											backgroundColor: "#D9D9D9",
											borderColor: "black",
											borderRadius: "7px",
										}}
										size="small"
										fullWidth
									/>
								</Grid>

								<Grid item xs={12}>
									<Typography sx={{ color: theme.typography.common.blue, fontSize: theme.typography.mediumFont }}>
										Message
									</Typography>
									<CustomTextField
										onChange={(e) => setMessage(e.target.value)}
										sx={{
											backgroundColor: "#D9D9D9",
											borderColor: "black",
											borderRadius: "7px",
										}}
										size="small"
										fullWidth
										multiline   // Set multiline to true
										rows={4}    // Set the number of rows you want
									/>
								</Grid>
							</Grid>
						</Box>
					</Stack>
				</Paper>

			</Stack>
		</>
		// </ThemeProvider>
	);
}

export default PropertyForm;
