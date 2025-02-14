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
	TextField,
	MenuItem,
	Select,
	Chip,
} from '@mui/material';
import { useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import theme from '../../../theme/theme';
import ImageUploader from '../../ImageUploader';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import dataURItoBlob from '../../utils/dataURItoBlob';
import userIcon from './User_fill.png';
import { useUser } from '../../../contexts/UserContext';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import APIConfig from '../../../utils/APIConfig';
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../../utils/httpMiddleware";
import { useMaintenance } from "../../../contexts/MaintenanceContext";
import { parse } from 'date-fns';

export default function QuoteRequestEditForm({ setRefresh }) {
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const location = useLocation();
	const navigate = useNavigate();
	const { roleName, maintenanceRoutingBasedOnSelectedRole, getProfileId } = useUser();
	let maintenanceItem;
	let navigationParams;
	const { quoteRequestEditView, setQuoteRequestEditView , maintenanceData: contextMaintenanceItem, 
		navigateParams: contextNavigateParams, currentQuoteIndex, maintenanceQuotes, setMaintenanceQuotes, setMaintenanceItemsForStatus, selectedStatus, setSelectedStatus, setSelectedRequestIndex, setAllMaintenanceData } = useMaintenance();
    

	if (!isMobile && quoteRequestEditView) {
		maintenanceItem = contextMaintenanceItem;
		navigationParams = contextNavigateParams;
	} else {
		maintenanceItem = location.state.maintenanceItem;
		navigationParams = location.state.navigateParams;
	}

	const currentQuote = selectedStatus !== "New Requests" ? (maintenanceQuotes ? maintenanceQuotes[currentQuoteIndex] : null) : null;

    
	//console.log("maintenance quote from request form  - ", currentQuote);

	useEffect(() => {
		// //console.log(alreadyRequestedQuotes);
	}, []);

	const [selectedImageList, setSelectedImageList] = useState([]);
    const [parsedImageList, setParsedImageList] = useState(currentQuote?.quote_maintenance_images? JSON.parse(currentQuote?.quote_maintenance_images) : [])
	const [additionalInfo, setAdditionalInfo] = useState('');
	const [contactList, setContactList] = useState([]);
	const [maintenanceContacts, setMaintenanceContacts] = useState(new Set());
	const [loadingContacts, setLoadingContacts] = useState(true);
	const [maintenanceData, setMaintenanceData] = useState([]);
	const [success, setSuccess] = useState(false);
	const [month, setMonth] = useState(new Date().getMonth());
	const [year, setYear] = useState(new Date().getFullYear());
	const [displayImages, setDisplayImages] = useState([]);
	const [showSpinner, setShowSpinner] = useState(false);

	const handleMaintenanceChange = (event) => {
		// //console.log("handleStateChange", event.target.value);
		setMaintenanceContacts((prevContacts) => new Set([...prevContacts, event.target.value]));
	};

	function navigateToAddMaintenanceItem() {
		// //console.log("navigateToAddMaintenanceItem")
		navigate('/addMaintenanceItem', { state: { month, year } });
	}

	function handleBackButton() {
		
		// //console.log("handleBackButton")
		let maintenance_request_index = navigationParams.maintenanceRequestIndex;
		let status = navigationParams.status;
		let maintenanceItemsForStatus = navigationParams.maintenanceItemsForStatus;
		let allMaintenanceData = navigationParams.allData;

		// Set the necessary session storage items
		// sessionStorage.setItem('selectedRequestIndex', maintenance_request_index);
		// sessionStorage.setItem('selectedStatus', status);
		// sessionStorage.setItem('maintenanceItemsForStatus', JSON.stringify(maintenanceItemsForStatus));
		// sessionStorage.setItem('allMaintenanceData', JSON.stringify(allMaintenanceData));

		
		setMaintenanceItemsForStatus(maintenanceItemsForStatus);
        setAllMaintenanceData(allMaintenanceData);
        setSelectedRequestIndex(maintenance_request_index);
        setSelectedStatus(status);

		if (isMobile) {
			navigate('/maintenance/detail', {
				state: {
					maintenance_request_index,
					status,
					maintenanceItemsForStatus,
					allMaintenanceData,
				},
			});
		} else {
			// sessionStorage.removeItem('maintenanceItem');
			// sessionStorage.removeItem('navigateParams');
			// sessionStorage.removeItem('desktopView');

			setQuoteRequestEditView(false);

		}
	}

	const handleSubmit = async () => {
		// Change the maintenance request status to "PROCESSING"
		const changeMaintenanceRequestStatus = async () => {
		  setShowSpinner(true);
		  const formData = new FormData();
		  formData.append('maintenance_request_uid', maintenanceItem.maintenance_request_uid);
		  formData.append('maintenance_request_status', 'PROCESSING');
		  
		  try {
			await fetch(`${APIConfig.baseURL.dev}/maintenanceRequests`, {
			  method: 'PUT',
			  body: formData,
			});
		  } catch (error) {
			//console.log('error', error);
		  }
		  setShowSpinner(false);
		};

		// Creates a list of business_uids from the maintenanceContacts set.
		let maintenanceContactIds = [];
		for (let contact of maintenanceContacts) {
			// //console.log("maintenanceContacts[i].maintenance_contact_uid", contact.business_uid);
			maintenanceContactIds.push(contact.contact_uid);
		}
	  
		// Submit the quote request to vendors
		const submitQuoteRequest = async () => {
		  setShowSpinner(true);
		  const formData = new FormData();
          formData.append('maintenance_quote_uid', currentQuote?.maintenance_quote_uid)
          formData.append('quote_status', "REQUESTED")
          formData.append('quote_maintenance_request_id', currentQuote?.quote_maintenance_request_id)
		  formData.append('quote_pm_notes', additionalInfo);
	  
		  // Attach selected images to the request
		  selectedImageList.forEach((file, index) => {
			formData.append(`img_${index}`, file.file || file.image);
		  });
	  
		  try {
			const response = await fetch(`${APIConfig.baseURL.dev}/maintenanceQuotes`, {
			  method: 'PUT',
			  body: formData,
			});
	  
			if (response.status === 200) {
			  //console.log("Quote request sent successfully");
			  
			  // Call the function to change the maintenance request status
			  // await changeMaintenanceRequestStatus();
	  
			  // Refresh Manager Maintenance view
			  if (isMobile) {
				navigate(maintenanceRoutingBasedOnSelectedRole(), { state: { refresh: true } });
			  } else {
				// Call setRefresh to update the Manager Maintenance view
				if (setRefresh) {
				  setRefresh(true);
				}
				handleBackButton(); // Navigate back to the Manager Maintenance view
			  }
			} else {
			  console.error(`Request failed with status: ${response.status}`);
			}
		  } catch (error) {
			//console.log('An error occurred while submitting the quote:', error);
		  }
	  
		  setShowSpinner(false);
		};
	  
		const sendAnnouncement = async (maintenanceContactIds) => {
			// //console.log("sendAnnouncement - maintenanceContactIds - ", maintenanceContactIds);
			// //console.log("sendAnnouncement - maintenanceItem - ", maintenanceItem);			
			try {
				let receiverPropertyMapping = {}
				const annReceivers = []

				maintenanceContactIds?.forEach(businessID => {
					annReceivers.push(businessID)
					if (receiverPropertyMapping[businessID]) {						
						receiverPropertyMapping[businessID].push(maintenanceItem.property_uid);
					} else {						
						receiverPropertyMapping[businessID] = [maintenanceItem.property_uid];
					}
				})


				const payload = JSON.stringify({
					announcement_title: `New Request for Quote`,					
					announcement_msg: `Quote requested for maintenance item - ${maintenanceItem.maintenance_title} - (Property - ${maintenanceItem.property_address})\n localhost:3000/maintenanceDashboard2/${maintenanceItem.maintenance_request_uid}`,
					announcement_sender: getProfileId(),
					announcement_date: new Date().toDateString(),
					// announcement_properties: property.property_uid,
					announcement_properties: JSON.stringify(receiverPropertyMapping),
					announcement_mode: "MAINTENANCE",
					// announcement_receiver: [maintenanceItem?.tenant_uid],
					announcement_receiver: annReceivers,
					announcement_type: ["Email", "Text"],
				})

				// //console.log("QuoteRequestForm - receiverPropertyMapping - ", receiverPropertyMapping);
				// //console.log("QuoteRequestForm - annReceivers - ", annReceivers);
				// //console.log("QuoteRequestForm - payload - ", payload);

				await fetch(`${APIConfig.baseURL.dev}/announcements/${getProfileId()}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: payload,
				});
			} catch (error) {
				//console.log("Error in sending announcement for requesting quotes:", error);
				alert("We were unable to send a Text but we were able to send them a notification through the App");
			}
		};

		// for (let contact of maintenanceContactIds)
		
		submitQuoteRequest(); 	
		
	};
	  

	function numImages() {
		if (displayImages == null || displayImages.length == 0) {
			return 0;
		} else {
			return displayImages.length;
		}
	}


	return (
		<Box
			style={{
				display: 'flex',
				justifyContent: 'center',
				// alignItems: 'center',
				width: '100%', // Take up full screen width
				minHeight: '100vh', // Set the Box height to full height
				marginTop: theme.spacing(2), // Set the margin to 20px
			}}
		>
			<Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
				<CircularProgress color="inherit" />
			</Backdrop>
			<Paper
				style={{
					margin: '10px',
					backgroundColor: '#D6D5DA',
					width: '100%', // Occupy full width with 25px margins on each side
					paddingTop: '10px',
					paddingBottom: '30px',
				}}
			>
				<Stack
					direction="column"
					justifyContent="center"
					alignItems="center"
					sx={{
						paddingBottom: '20px',
						paddingLeft: '0px',
						paddingRight: '0px',
					}}
				>
					{/* back button and title */}
					<Stack
						direction="row"
						justifyContent="space-between"
						alignItems="center"
						sx={{
							paddingBottom: '20px',
							paddingLeft: '0px',
							paddingRight: '0px',
							width: '100%',
						}}
					>
						<Box
							position="relative"
							display="flex"
							justifyContent="flex-start"
							alignItems="center"
							flexGrow={1}
						>
							<Button onClick={() => handleBackButton()}>
								<ArrowBackIcon
									sx={{ color: theme.typography.primary.black, fontSize: '30px', margin: '5px' }}
								/>
							</Button>
						</Box>
						<Box position="relative"
							display="flex" justifyContent="center" alignItems="center" flexGrow={1} sx={{flexBasis: 'auto', textAlign: 'center', marginRight: "50px"}}>
							<Typography
								sx={{
									color: theme.typography.primary.black,
									fontWeight: theme.typography.primary.fontWeight,
									fontSize: theme.typography.largeFont,
								}}
							>
								Maintenance
							</Typography>
						</Box>
						<Box
							position="relative"
							display="flex"
							justifyContent="flex-end"
							alignItems="center"
							flexGrow={1}
						>
							{/* <Button onClick={() => navigateToAddMaintenanceItem()}>
								<AddIcon
									sx={{ color: theme.typography.primary.black, fontSize: '30px', margin: '5px' }}
								/>
							</Button> */}
						</Box>
					</Stack>

					{/* top card */}
					<Grid
						container
						spacing={6}
						alignContent="center"
						justifyContent="center"
						alignItems="center"
						direction="column"
					>
						<Grid item xs={12} container justifyContent="center" alignItems="center">
							<Card
								sx={{
									backgroundColor: '#A52A2A',
									borderRadius: '10px',
									width: '85%',
									height: '100%',
									padding: '10px',
									margin: '10px',
									paddingTop: '25px',
								}}
							>
								<Grid item xs={12}>
									<Grid container spacing={2} justifyContent="center">
										{numImages() > 0
											? Array.isArray(displayImages) && displayImages.length > 0
												? displayImages.map((image, index) => (
														<Grid item key={index}>
															<img
																src={image}
																alt={`Img ${index}`}
																style={{ width: '50px', height: '50px' }}
															/>
														</Grid>
												  ))
												: null
											: null}
									</Grid>
									<Typography
										sx={{
											color: '#FFFFFF',
											fontWeight: theme.typography.propertyPage.fontWeight,
											fontSize: '14px',
										}}
									>
										{numImages() > 0 ? numImages() + ' Images' : 'No Images'}
									</Typography>
								</Grid>
								<Grid item xs={12}>
									<Typography
										sx={{
											color: '#FFFFFF',
											fontWeight: theme.typography.propertyPage.fontWeight,
											fontSize: '14px',
										}}
									>
										<b>{maintenanceItem.maintenance_priority} Priority</b>
									</Typography>
								</Grid>

								<Grid item xs={12}>
									<Typography
										sx={{
											color: '#FFFFFF',
											fontWeight: theme.typography.propertyPage.fontWeight,
											fontSize: '14px',
										}}
									>
										<u>
											{maintenanceItem.property_address}, {maintenanceItem.property_city}{' '}
											{maintenanceItem.property_state} {maintenanceItem.property_zip}
										</u>
									</Typography>
								</Grid>

								<Grid item xs={12}>
									<Typography
										sx={{
											color: '#FFFFFF',
											fontWeight: theme.typography.propertyPage.fontWeight,
											fontSize: '14px',
										}}
									>
										<b>{maintenanceItem.maintenance_title}</b>
									</Typography>
								</Grid>
								<Grid item xs={12}>
									<Typography
										sx={{
											color: '#FFFFFF',
											fontWeight: theme.typography.propertyPage.fontWeight,
											fontSize: '14px',
										}}
									>
										<b>{maintenanceItem.maintenance_desc}</b>
									</Typography>
								</Grid>
								<Grid item xs={12}>
									<Typography
										sx={{
											color: '#FFFFFF',
											fontWeight: theme.typography.propertyPage.fontWeight,
											fontSize: '14px',
										}}
									>
										Estimated Cost: <b>${maintenanceItem.maintenance_estimated_cost}</b>
									</Typography>
								</Grid>
							</Card>
						</Grid>
					</Grid>
					
					{/* Requesting div */}
					<Grid
						container
						spacing={0}
						alignContent="center"
						justifyContent="center"
						alignItems="center"
						direction="column"
						sx={{
							backgroundColor: '#C06A6A',
						}}
					>
						<Grid item xs={12}>
							<Typography
								sx={{
									color: '#FFFFFF',
									fontWeight: theme.typography.propertyPage.fontWeight,
									fontSize: '14px',
								}}
							>
								<b>Requesting Quotes for Maintenance</b>
							</Typography>
						</Grid>
					</Grid>

					<Grid
						container
						spacing={5}
						alignContent="center"
						justifyContent="center"
						alignItems="center"
						direction="column"
					>
						{/* user image and text */}
						<Grid item xs={12} sx={{ marginTop: "20px", display: 'flex', alignItems: 'center' }}>
							<img
								src={userIcon}
								alt="User Icon"
								style={{
									marginRight: '8px',
									width: '16px',
									height: '16px',
								}}
							/>
							<Typography
								component="span"
								sx={{
									color: theme.typography.common.blue,
									fontWeight: theme.typography.primary.fontWeight,
									fontSize: theme.typography.mediumFont,
								}}
							>
								View All Maintenance Contacts
							</Typography>
						</Grid>

						<Grid item xs={12} sx={{ width: '90%' }}>
                            <Typography
                                sx={{
                                    color: theme.typography.common.blue,
                                    fontWeight: theme.typography.primary.fontWeight,
                                    fontSize: theme.typography.mediumFont,
                                }}
                            >
                                Contacts
                            </Typography>
                            <TextField
                                sx={{
                                    backgroundColor: 'white',
                                    borderColor: 'black',
                                    borderRadius: '7px',
                                    '& .MuiInputBase-input.Mui-disabled': {
                                        color: '#160449',
                                        '-webkit-text-fill-color': '#160449'
                                    },
                                }}
                                size="small"
                                fullWidth
                                disabled={true}
                                value={currentQuote?.maint_business_name ? currentQuote?.maint_business_name : ''}
                            />
						</Grid>
                        
                        {/* additionalInfo */}
						<Grid item xs={12} sx={{ width: '90%' }}>
							<Typography
								sx={{
									color: theme.typography.common.blue,
									fontWeight: theme.typography.primary.fontWeight,
									fontSize: theme.typography.mediumFont,
								}}
							>
								Additional Information
							</Typography>
							<TextField
								onChange={(e) => setAdditionalInfo(e.target.value)}
								sx={{
									backgroundColor: 'white',
									borderColor: 'black',
									borderRadius: '7px',
								}}
								placeholder={additionalInfo}
								value={additionalInfo}
								size="small"
								fullWidth
							/>
						</Grid>

                        {/* previous images */}
                        <Grid item xs={12} sx={{width: "90%"}}>
                            <Typography
								sx={{
									color: theme.typography.common.blue,
									fontWeight: theme.typography.primary.fontWeight,
									fontSize: theme.typography.mediumFont,
								}}
							>
								Previous Quote Images
							</Typography>
                            <Grid container spacing={2} marginTop={"5px"}>
                                {Array.isArray(parsedImageList) && parsedImageList.length > 0
                                    ? parsedImageList.map((image, index) => (
                                            <Grid item key={index}>
                                                <img
                                                    src={image}
                                                    alt={`Img ${index}`}
                                                    style={{ width: '70px', height: '70px' }}
                                                />
                                            </Grid>
                                        ))
                                    : null
                                }
                            </Grid>
                        </Grid>
						
						{/* image uploader */}
						<Grid item xs={12} sx={{ width: '90%' }}>
							<ImageUploader
								selectedImageList={selectedImageList}
								setSelectedImageList={setSelectedImageList}
								page={'QuoteRequestForm'}
							/>
						</Grid>

						{/* button */}
						<Grid item xs={12} sx={{ width: '90%', marginTop: "20px"}}>
							<Button
								variant="contained"
								sx={{
									backgroundColor: '#9EAED6',
									textTransform: 'none',
									borderRadius: '10px',
									display: 'flex',
									color: '#160449',
									width: '100%',
									'&:hover': {
										color: '#ffffff',
									},
								}}
								onClick={() => handleSubmit()}
							>
								<Typography
									sx={{
										fontWeight: theme.typography.primary.fontWeight,
										fontSize: '14px',
									}}
								>
									Update Quote
								</Typography>
							</Button>
						</Grid>
					</Grid>
				</Stack>
			</Paper>
		</Box>
	);
}
