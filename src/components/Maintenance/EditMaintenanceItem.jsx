import {
	Typography,
	Box,
	Stack,
	Paper,
	Button,
	ThemeProvider,
	Form,
	TextField,
	ToggleButton,
	ToggleButtonGroup,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	Grid,
	Input,
	Container,
	Radio,
	FormLabel,
	FormControlLabel,
	RadioGroup,
	UploadFile,
	InputAdornment,
} from '@mui/material';

import { darken } from '@mui/system';

import { useEffect, useState, useRef, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FormHelperText from '@mui/material/FormHelperText';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ImageUploader from '../ImageUploader';

import theme from '../../theme/theme';
import dataURItoBlob from '../utils/dataURItoBlob';
import { useUser } from '../../contexts/UserContext';
import { get } from '../utils/api';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { useMediaQuery } from '@mui/material';
import APIConfig from '../../utils/APIConfig';

import DeleteIcon from '@mui/icons-material/Delete';
import FavoriteIcon from '@mui/icons-material/Favorite';

import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import IconButton from '@mui/material/IconButton';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';

import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useMaintenance } from '../../contexts/MaintenanceContext';
import ListsContext from '../../contexts/ListsContext';
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../utils/httpMiddleware";

export default function EditMaintenanceItem({ setRefersh, setRightPane, maintenanceRequest, propertyAddress, setViewRHS }) {
	//console.log("inside edit component");
	const location = useLocation();
	const { getList, } = useContext(ListsContext);
	//console.log("location state", maintenanceRequest);

	const maintenanceIssues = getList("maintenance");
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

	// let testIssue1, testProperty1, testIssueItem1, testCost1;
	// let testTitle1, testPriority1, completionStatus1;
	// let requestUid1, propID1, maintainanceImages, maintainanceFavImage;

	// const {
	// 	testIssue,
	// 	testProperty,
	// 	testIssueItem,
	// 	testCost,
	// 	testTitle,
	// 	testPriority,
	// 	completionStatus,
	// 	requestUid,
	// 	propID,
	// 	maintainanceImages: contextmaintainanceImages,
	// 	maintainanceFavImage: contextmaintainanceFavImage,
	// 	setEditMaintenanceView,
	// 	setMaintainanceImages,
	//   } = useMaintenance();

	//   if (isMobile) {
	// 	// Use location state in mobile
	// 	testIssue1 = location.state.testIssue;
	// 	testProperty1 = location.state.testProperty;
	// 	testIssueItem1 = location.state.testIssueItem;
	// 	testCost1 = location.state.testCost;
	// 	testTitle1 = location.state.testTitle;
	// 	testPriority1 = location.state.testPriority;
	// 	completionStatus1 = location.state.completionStatus;
	// 	requestUid1 = location.state.requestUid;
	// 	propID1 = location.state.propID;
	// 	maintainanceImages = location.state.maintainanceImages;
	// 	maintainanceFavImage= location.state.maintainanceFavImage;
	//   } else {
	// 	// Use context state in desktop view
	// 	testIssue1 = testIssue;
	// 	testProperty1 = testProperty;
	// 	testIssueItem1 = testIssueItem;
	// 	testCost1 = testCost;
	// 	testTitle1 = testTitle;
	// 	testPriority1 = testPriority;
	// 	completionStatus1 = completionStatus;
	// 	requestUid1 = requestUid;
	// 	propID1 = propID;
	// 	maintainanceImages = contextmaintainanceImages;
	// 	maintainanceFavImage = contextmaintainanceFavImage;
	//   }

	let testIssue1 = maintenanceRequest?.maintenance_desc || location.state?.testIssue || '';
	let testProperty1 = propertyAddress || location.state?.testProperty || '';
	let testIssueItem1 = maintenanceRequest?.maintenance_request_type || location.state?.testIssueItem || '';
	let testCost1 = maintenanceRequest?.maintenance_estimated_cost || location.state?.testCost || '';
	let testTitle1 = maintenanceRequest?.maintenance_title || location.state?.testTitle || '';
	let testPriority1 = maintenanceRequest?.maintenance_priority || location.state?.testPriority || '';
	let completionStatus1 = maintenanceRequest?.maintenance_request_status || location.state?.completionStatus || '';
	let requestUid1 = maintenanceRequest?.maintenance_request_uid || location.state?.requestUid || '';
	let propID1 = maintenanceRequest?.maintenance_property_id || location.state?.propID || '';
	let maintainanceImages = maintenanceRequest?.maintenance_images || location.state?.maintainanceImages || '[]';
	let maintainanceFavImage = maintenanceRequest?.maintenance_favorite_image || location.state?.maintainanceFavImage || '';

	const {
		testIssue,
		testProperty,
		testIssueItem,
		testCost,
		testTitle,
		testPriority,
		completionStatus,
		requestUid,
		propID,
		maintainanceImages: contextmaintainanceImages,
		maintainanceFavImage: contextmaintainanceFavImage,
		setEditMaintenanceView,
		setMaintainanceImages,
	} = useMaintenance();

	// if (!isMobile && !maintenanceRequest) {
	//     // Use context state in desktop view when maintenanceRequest is not provided
	//     testIssue1 = testIssue;
	//     testProperty1 = testProperty;
	//     testIssueItem1 = testIssueItem;
	//     testCost1 = testCost;
	//     testTitle1 = testTitle;
	//     testPriority1 = testPriority;
	//     completionStatus1 = completionStatus;
	//     requestUid1 = requestUid;
	//     propID1 = propID;
	//     maintainanceImages = contextmaintainanceImages;
	//     maintainanceFavImage = contextmaintainanceFavImage;
	// }
	if (!maintenanceRequest) {
		// Use context state in desktop view when maintenanceRequest is not provided
		testIssue1 = testIssue;
		testProperty1 = testProperty;
		testIssueItem1 = testIssueItem;
		testCost1 = testCost;
		testTitle1 = testTitle;
		testPriority1 = testPriority;
		completionStatus1 = completionStatus;
		requestUid1 = requestUid;
		propID1 = propID;
		maintainanceImages = contextmaintainanceImages;
		maintainanceFavImage = contextmaintainanceFavImage;
	}

	// setCost(testCost1);
	// cost = testCost1;
	// setTitle(location.state.testTitle);
	// title = testTitle1;

	// setPriority(testPriority1);

	// setCompleted(completionStatus1);
	// //console.log("completed>>>",completed);


	let navigate = useNavigate();
	const { user, getProfileId, maintenanceRoutingBasedOnSelectedRole, selectedRole } = useUser();
	const [propertyId, setPropertyId] = useState(propID1);
	const [properties, setProperties] = useState([]);
	const [property, setProperty] = useState(testProperty1);
	const [issue, setIssue] = useState(testIssueItem1);
	const [toggleGroupValue, setToggleGroupValue] = useState('tenant');
	const [toggleAlignment, setToggleAlignment] = useState('low');
	const [priority, setPriority] = useState(testPriority1);
	const [completed, setCompleted] = useState('');
	const [cost, setCost] = useState(testCost1);
	const [title, setTitle] = useState(testTitle1);
	const [description, setDescription] = useState(testIssue1);
	const [selectedImageList, setSelectedImageList] = useState([]);
	const [showSpinner, setShowSpinner] = useState(false);
	const [change, setChange] = useState(false)

	const [deletedImageList, setDeletedImageList] = useState([]);
	const [favImage, setFavImage] = useState(maintainanceFavImage);

	const profileId = getProfileId();

	const [imagesTobeDeleted, setImagesTobeDeleted] = useState([]);
	// const parsedMaintainanceImages = maintainanceImages ? JSON.parse(maintainanceImages) : [];
	let parsedMaintainanceImages = [];
	if (maintainanceImages) {
		try {
			parsedMaintainanceImages = JSON.parse(maintainanceImages);
		} catch (error) {
			console.error("Error parsing maintainanceImages:", error);
			parsedMaintainanceImages = [];
		}
	}

	const [deletedIcons, setDeletedIcons] = useState(
		parsedMaintainanceImages.length > 0 ? new Array(parsedMaintainanceImages.length).fill(false) : []
	);

	const [favoriteIcons, setFavoriteIcons] = useState(
		parsedMaintainanceImages.map(image => image === maintainanceFavImage)
	);

	const handlePropertyChange = (event) => {
		setChange(true)
		//console.log('handlePropertyChange', event.target.value);
		setProperty(event.target.value);
		setPropertyId(event.target.value);
	};

	const handleIssueChange = (event) => {
		setChange(true)
		//console.log('handleIssueCategoryChange', event.target.value);
		setIssue(event.target.value);
	};

	const handleCostChange = (event) => {
		setChange(true)
		//console.log('handleCostChange', event.target.value);
		setCost(event.target.value);
	};

	const handleTitleChange = (event) => {
		setChange(true)
		//console.log('handleTitleChange', event.target.value);
		setTitle(event.target.value);
	};

	const handleDescriptionChange = (event) => {
		setChange(true)
		//console.log('handleDescriptionChange', event.target.value);
		setDescription(event.target.value);
	};

	// const handlePriorityChange = (event, newToggleGroupValue) => {
	//     //console.log("handlePriorityChange", event.target.value)
	//     // //console.log("handleToggleGroupChange", newToggleGsroupValue)
	//     setPriority(event.target.value)
	//     // setPriority(testPriority1)
	//     // setToggleGroupValue(newToggleGroupValue);
	//     // setToggleAlignment(newToggleGroupValue);
	// };
	const handlePriorityChange = (priority) => {
		setChange(true)
		setToggleAlignment(priority);
		setToggleGroupValue(priority);
		setPriority(priority);

		// Update styles for all toggle buttons based on the selected priority
		const buttons = document.querySelectorAll('.MuiToggleButton-root');
		buttons.forEach((button) => {
			const buttonPriority = button.getAttribute('value');

			if (buttonPriority === priority) {
				// Set white border for the selected button
				button.style.borderColor = 'white';
			} else {
				// Reset border color for other buttons
				button.style.borderColor = '';
			}
		});
	};

	const handleCompletedChange = (event, newToggleGroupValue) => {
		setChange(true)
		//console.log('handleToggleGroupChange', newToggleGroupValue);
		setCompleted(event.target.value);
		//console.log('completed>>>,>>', completed);
	};

	const handleBackButton = () => {
		//console.log('handleBackButton');
		if (isMobile) {
			if (setViewRHS) {
				setViewRHS(false)
			}

			if (selectedRole === "TENANT") {

				setRightPane({ type: "" })
			}

			setEditMaintenanceView(false);
			// navigate(-1);
			// setRightPane("");
		} else {
			if (selectedRole === "TENANT") {

				setRightPane({ type: "" })
			}

			setEditMaintenanceView(false);
		}
	};

	useEffect(() => {
		//console.log(user.owner_id);

		const getProperties = async () => {
			setShowSpinner(true);
			const response = await fetch(`${APIConfig.baseURL.dev}/properties/${getProfileId()}`);

			const propertyData = await response.json();
			//console.log('inside edit property useEffect');
			// const propertyData = data.Property.result
			//console.log('properties', propertyData);
			// setProperties(properties)
			setProperties([...propertyData['Property'].result]);
			setShowSpinner(false);
		};

		getProperties();
	}, []);

	const handleSubmit = async (event) => {
		event.preventDefault();

		if (!change && selectedImageList.length === 0) {
			alert("you didn't change anything...");
			setChange(false)
			return;
		}

		setShowSpinner(true);

		const editFormData = new FormData();

		const currentDate = new Date();
		// const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
		const formattedDate = `${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(
			currentDate.getDate()
		).padStart(2, '0')}-${currentDate.getFullYear()}`;

		//console.log('toggleAlignment', toggleAlignment);
		//console.log('*************propertyId******************* ', propertyId);
		//console.log('*************description******************* ', description);
		editFormData.append('maintenance_request_uid', requestUid1);
		editFormData.append('maintenance_property_id', propertyId);
		// editFormData.append("maintenance_property_id", propID1);
		editFormData.append('maintenance_title', title);
		editFormData.append('maintenance_desc', description);
		editFormData.append('maintenance_request_type', issue);
		// editFormData.append('maintenance_request_created_by', getProfileId()); // problem is here it was 600-000003, changed it 600-000012
		editFormData.append('maintenance_priority', priority);
		editFormData.append('maintenance_can_reschedule', 1);
		editFormData.append('maintenance_assigned_business', null);
		editFormData.append('maintenance_assigned_worker', null);
		editFormData.append('maintenance_scheduled_date', null);
		editFormData.append('maintenance_scheduled_time', null);
		editFormData.append('maintenance_frequency', 'One Time');
		editFormData.append('maintenance_notes', null);
		// editFormData.append('maintenance_request_created_date', formattedDate); // Convert to ISO string format
		editFormData.append('maintenance_request_closed_date', null);
		editFormData.append('maintenance_request_adjustment_date', null);

		if (imagesTobeDeleted.length > 0) {
			//console.log('-----deleted_images----', imagesTobeDeleted);

			let updatedImages = JSON.parse(maintainanceImages);
			updatedImages = updatedImages.filter(image => !imagesTobeDeleted.includes(image));
			maintainanceImages = JSON.stringify(updatedImages);
			editFormData.append('delete_images', JSON.stringify(imagesTobeDeleted));
		}

		editFormData.append('maintenance_images', maintainanceImages);
		editFormData.append('maintenance_favorite_image', favImage);

		let i = 0;
		for (const file of selectedImageList) {
			// let key = file.coverPhoto ? "img_cover" : `img_${i++}`;
			let key = `img_${i++}`;
			if (file.file !== null) {
				// newProperty[key] = file.file;
				editFormData.append(key, file.file);
			} else {
				// newProperty[key] = file.image;
				editFormData.append(key, file.image);
			}
			if (file.coverPhoto) {
				editFormData.set('maintenance_favorite_image', key);
			}
		}

		// for (let i = 0; i < selectedImageList.length; i++) {
		// 	try {
		// 		let key = i === 0 ? 'img_cover' : `img_${i - 1}`;

		// 		if (selectedImageList[i].startsWith('data:image')) {
		// 			const imageBlob = dataURItoBlob(selectedImageList[i]);
		// 			editFormData.append(key, imageBlob);
		// 		} else {
		// 			editFormData.append(key, selectedImageList[i]);
		// 		}
		// 	} catch (error) {
		// 		//console.log('Error uploading images', error);
		// 	}
		// }
		//console.log('editFormData>>>>>>');
		for (let [key, value] of editFormData.entries()) {
			//console.log(key, value);
		}

		const putData = async () => {
			
			try {
				const response = await fetch(`${APIConfig.baseURL.dev}/maintenanceRequests`, {
					method: 'PUT',
					// 	// headers: {
					// 	//     'Content-Type': 'application/json',
					// 	// },
					// 	// body : JSON.stringify({
					// 	//     "maintenance_property_id" : propertyId,
					// 	//     "maintenance_title": title,
					// 	//     "maintenance_desc": description,
					// 	//     "maintenance_request_type": issue,
					// 	//     "maintenance_request_created_by": getProfileId(),  // problem is here it was 600-000003, changed it 600-000012
					// 	//     "maintenance_priority": priority,
					// 	//     "maintenance_can_reschedule": 1,
					// 	//     "maintenance_assigned_business": null,
					// 	//     "maintenance_assigned_worker": null,
					// 	//     "maintenance_scheduled_date": null,
					// 	//     "maintenance_scheduled_time": null,
					// 	//     "maintenance_frequency": "One Time",
					// 	//     "maintenance_notes": null,
					// 	//     "maintenance_request_created_date": formattedDate, // Convert to ISO string format
					// 	//     "maintenance_request_closed_date": null,
					// 	//     "maintenance_request_adjustment_date": null
					// 	// })
					// 	// body: JSON.stringify(editFormData)
					body: editFormData,
				});
				const data = await response.json();
				//console.log('data response', data);
			} catch (err) {
				console.error('Error: ', err.message);
			}
			
		};

		await putData(); //undo

		// setSelectedImageList([])
		// setProperty('')
		// setIssue('')
		// setToggleGroupValue('')
		// setToggleAlignment('')
		// setCost('')
		// setTitle('')
		// setDescription('')

		//undo
		if (setRefersh) {
			setRefersh(true);
		}
		setShowSpinner(false);

		if (selectedRole === "TENANT") {
			handleBackButton();
		} else {
			setEditMaintenanceView(false);
			navigate(maintenanceRoutingBasedOnSelectedRole());
		}
	};

	const [scrollPosition, setScrollPosition] = useState(0);
	const scrollRef = useRef(null);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollLeft = scrollPosition;
		}
	}, [scrollPosition]);

	const handleScroll = (direction) => {
		if (scrollRef.current) {
			const scrollAmount = 200;
			setScrollPosition((prevScrollPosition) => {
				const currentScrollPosition = scrollRef.current.scrollLeft;
				let newScrollPosition;

				if (direction === 'left') {
					newScrollPosition = Math.max(currentScrollPosition - scrollAmount, 0);
				} else {
					newScrollPosition = currentScrollPosition + scrollAmount;
				}

				return newScrollPosition;
			});
		}
	};

	const handleDelete = (index) => {
		setChange(true)
		const updatedDeletedIcons = [...deletedIcons];
		updatedDeletedIcons[index] = !updatedDeletedIcons[index];
		setDeletedIcons(updatedDeletedIcons);

		const imageToDelete = JSON.parse(maintainanceImages)[index];
		setImagesTobeDeleted((prev) => [...prev, imageToDelete]);

		//console.log('Delete image at index:', JSON.stringify(deletedIcons));
	};



	const handleFavorite = (index) => {
		setChange(true)
		const updatedFavoriteIcons = new Array(favoriteIcons.length).fill(false);
		updatedFavoriteIcons[index] = true;
		setFavoriteIcons(updatedFavoriteIcons);

		const newFavImage = JSON.parse(maintainanceImages)[index];
		setFavImage(newFavImage);
		setSelectedImageList(prevState =>
			prevState.map((file, i) => ({
				...file,
				coverPhoto: i === index
			}))
		);

		//console.log(`Favorite image at index: ${index}`);
	};

	const handleUpdateFavoriteIcons = () => {
		setChange(true)
		setFavoriteIcons(new Array(favoriteIcons.length).fill(false));
	};

	return (
		<ThemeProvider theme={theme}>
			<Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
				<CircularProgress color="inherit" />
			</Backdrop>
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					width: "100%",
					minHeight: "100vh",
					position: "relative",
				}}
			>
				<Paper
					sx={{
						// margin: "5px",
						backgroundColor: theme.palette.primary.main,
						width: "100%",
						// paddingTop: "10px",
						// paddingBottom: "30px",
						borderRadius: "10px"
					}}
				>
					<Stack direction="row" justifyContent="center" alignItems="center" position="relative" sx={{marginTop:"10px"}}>
						<Box direction="row" justifyContent="center" alignItems="center">
							<Typography
								sx={{
									color: theme.typography.primary.black,
									fontWeight: theme.typography.primary.fontWeight,
									fontSize: theme.typography.largeFont,
								}}
							>
								Edit Maintenance
							</Typography>
						</Box>
						<Box position="absolute" left={0}>
							<Button onClick={() => handleBackButton()}>
								<ArrowBackIcon
									sx={{ color: "#160449", fontSize: '30px', margin: '5px' }}
								/>
							</Button>
						</Box>
					</Stack>
					<Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off">
						<Grid container columnSpacing={12} rowSpacing={6} sx={{padding: "0px 10px 0px 10px"}}>
							{/* Select Field for Property */}
							<Grid item xs={12}>
								<Box
									sx={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										padding: 2,
									}}
								>
									<IconButton
										onClick={() => handleScroll('left')}
										disabled={scrollPosition === 0}
									>
										<ArrowBackIosIcon />
									</IconButton>
									<Box
										sx={{
											display: 'flex',
											overflowX: 'auto',
											scrollbarWidth: 'none',
											msOverflowStyle: 'none',
											'&::-webkit-scrollbar': {
												display: 'none',
											},
										}}
									>
										<Box
											sx={{
												display: 'flex',
												overflowX: 'auto',
												scrollbarWidth: 'none',
												msOverflowStyle: 'none',
												'&::-webkit-scrollbar': {
													display: 'none',
												},
											}}
										>
											<ImageList
												ref={scrollRef}
												sx={{ display: 'flex', flexWrap: 'nowrap' }} cols={5}>
												{parsedMaintainanceImages?.map((image, index) => (
													<ImageListItem
														key={index}
														sx={{
															width: 'auto',
															flex: '0 0 auto',
															border: '1px solid #ccc',
															margin: '0 2px',
															position: 'relative', // Added to position icons
														}}
													>
														<img
															src={image}
															alt={`maintenance-${index}`}
															style={{
																height: '150px',
																width: '150px',
																objectFit: 'cover',
															}}
														/>
														<Box sx={{ position: 'absolute', top: 0, right: 0 }}>
															<IconButton
																onClick={() => handleDelete(index)}
																sx={{
																	color: deletedIcons[index] ? 'red' : 'black',
																	backgroundColor: 'rgba(255, 255, 255, 0.7)',
																	'&:hover': {
																		backgroundColor: 'rgba(255, 255, 255, 0.9)',
																	},
																	margin: '2px',
																}}
															>
																<DeleteIcon />
															</IconButton>
														</Box>
														<Box sx={{ position: 'absolute', bottom: 0, left: 0 }}>
															<IconButton
																onClick={() => handleFavorite(index)}
																sx={{
																	color: favoriteIcons[index] ? 'red' : 'black',
																	backgroundColor: 'rgba(255, 255, 255, 0.7)',
																	'&:hover': {
																		backgroundColor: 'rgba(255, 255, 255, 0.9)',
																	},
																	margin: '2px',
																}}
															>
																{favoriteIcons[index] ? (
																	<FavoriteIcon />
																) : (
																	<FavoriteBorderIcon />
																)}
															</IconButton>
														</Box>
													</ImageListItem>
												))}
											</ImageList>
										</Box>
									</Box>
									<IconButton onClick={() => handleScroll('right')}>
										<ArrowForwardIosIcon />
									</IconButton>
								</Box>



							</Grid>

							<Grid item xs={12}>
								<ImageUploader
									selectedImageList={selectedImageList}
									setSelectedImageList={setSelectedImageList}
									page={'QuoteRequestForm'}

									setDeletedImageList={setDeletedImageList}
									setFavImage={setFavImage}
									favImage={favImage}
									updateFavoriteIcons={handleUpdateFavoriteIcons}
								/>
							</Grid>
							<Grid item xs={12}>
								<Typography
									sx={{
										color: theme.typography.common.blue,
										fontWeight: theme.typography.primary.fontWeight,
										fontSize: theme.typography.mediumFont,
									}}
								>
									Property
								</Typography>
								<FormControl
									fullWidth
									sx={{
										backgroundColor: 'white',
										borderColor: 'black',
									}}
									size="small"
								>
									{/* <Tooltip title={testProperty1} style={{ zIndex: '1' }}>   */}
									<InputLabel hidden={true} shrink={false}>
										{testProperty1}
									</InputLabel>
									<Select
										// value={testProperty1}
										// display={" "}
										// onFocus={true}
										onChange={handlePropertyChange}
										disabled={selectedRole === "TENANT"}
										MenuProps={{
											PaperProps: {
												style: {
													maxHeight: '250px', // you can adjust this value as needed
													overflow: 'auto',
												},
											},
										}}
									>
										{properties?.map((property) => (
											<MenuItem key={property.property_uid} value={property.property_uid}>
												{property.property_address} {property?.property_unit}
											</MenuItem>
										))}
									</Select>
									{/* </Tooltip> */}
								</FormControl>
							</Grid>


							{/* Select Field for Issue and Cost Estimate */}
							<Grid item xs={6}>
								<Typography
									sx={{
										color: theme.typography.common.blue,
										fontWeight: theme.typography.primary.fontWeight,
										fontSize: theme.typography.mediumFont,
									}}
								>
									Issue
								</Typography>
								<FormControl
									fullWidth
									sx={{
										backgroundColor: 'white',
										borderColor: 'black',
										borderRadius: '7px',
									}}
									size="small"
								>
									<Select onChange={handleIssueChange} defaultValue={testIssueItem1}>
										{
											maintenanceIssues?.map((freq) => (
												<MenuItem key={freq.list_uid} value={freq.list_item}>{freq.list_item}</MenuItem>
											))
										}
									</Select>
								</FormControl>
							</Grid>
							{selectedRole !== "TENANT" && (
								<Grid item xs={6}>
									<Typography
										sx={{
											color: theme.typography.common.blue,
											fontWeight: theme.typography.primary.fontWeight,
											fontSize: theme.typography.mediumFont,
										}}
									>
										Estimated Cost
									</Typography>
									<TextField
										placeholder={testCost1}
										defaultValue={testCost1}
										fullWidth
										sx={{
											backgroundColor: 'white',
											borderColor: 'black',
											borderRadius: '7px',
										}}
										size="small"
										InputProps={{
											startAdornment: <InputAdornment position="start">$</InputAdornment>,
										}}
										onChange={handleCostChange}
									/>
								</Grid>

							)}{/* Text Field for Title */}
							<Grid item xs={12}>
								<Typography
									sx={{
										color: theme.typography.common.blue,
										fontWeight: theme.typography.primary.fontWeight,
										fontSize: theme.typography.mediumFont,
									}}
								>
									Title
								</Typography>
								<TextField
									placeholder={testTitle1}
									defaultValue={testTitle1}
									onChange={handleTitleChange}
									sx={{
										backgroundColor: 'white',
										borderColor: 'black',
										borderRadius: '7px',
									}}
									size="small"
									fullWidth
								/>
							</Grid>

							{/* Priority Toggle Field */}
							<Grid item xs={12}>
								<Typography
									sx={{
										color: theme.typography.common.blue,
										fontWeight: theme.typography.primary.fontWeight,
										fontSize: theme.typography.mediumFont,
									}}
								>
									Priority
								</Typography>
								<ToggleButtonGroup
									exclusive
									fullWidth
									value={testPriority1}
									// value={toggleAlignment}
									// onChange={handlePriorityChange}
									onChange={(event, value) => handlePriorityChange(value)}
									aria-label="Priority"
									size="small"
									sx={{
										'& .MuiToggleButton-root.Mui-selected': {
											// backgroundColor: 'transparent', // Selected background color
											color: 'white', // Selected text color
										},
										'&.Mui-selected + .MuiToggleButton-root': {
											// borderLeftColor: 'white',
										},
										// display: "grid",
										// gridTemplateColumns: "auto auto auto auto",
										// gridGap: "50px",
										// padding: "10px",
									}}
								>
									<ToggleButton
										// value="Low"
										key={'Low'}
										value={'Low'}
										sx={{
											backgroundColor: theme.palette.priority.low,
											borderRadius: '20px',
											color: 'white',
											marginRight: '10px',
											borderWidth: '3px',
											borderColor: theme.palette.priority.low,
											'&.Mui-selected': {
												borderColor: 'white',
												color: 'white',
												backgroundColor: theme.palette.priority.low,
												borderWidth: '3px', // Ensure consistent border width
											},
											'&:hover': {
												borderColor: 'white',
												backgroundColor: darken(theme.palette.priority.low, 0.3),
											},
										}}
										onClick={() => handlePriorityChange('Low')}
										isSelected={toggleAlignment === 'Low'}
									>
										Low
									</ToggleButton>
									<ToggleButton
										// value="Medium"
										key={'Medium'}
										value={'Medium'}
										sx={{
											backgroundColor: theme.palette.priority.medium,
											borderRadius: '20px',
											color: 'white',
											marginRight: '10px',
											borderWidth: '3px',
											borderColor: theme.palette.priority.medium,
											'&.Mui-selected': {
												borderColor: 'white',
												color: 'white',
												backgroundColor: theme.palette.priority.medium,
												borderWidth: '3px', // Ensure consistent border width
											},
											'&:hover': {
												borderColor: 'white',
												backgroundColor: darken(theme.palette.priority.medium, 0.3),
											},
											'&.Mui-selected + .MuiToggleButton-root': {
												borderLeftColor: 'white',
											},
										}}
										onClick={() => handlePriorityChange('Medium')}
										isSelected={toggleAlignment === 'Medium'}
									>
										Medium
									</ToggleButton>
									<ToggleButton
										key={'High'}
										value={'High'}
										// value="High"
										sx={{
											backgroundColor: theme.palette.priority.high,
											borderRadius: '20px',
											color: 'white',
											marginRight: '10px',
											borderWidth: '3px',
											borderColor: theme.palette.priority.high,
											'&.Mui-selected': {
												borderColor: 'white',
												color: 'white',
												backgroundColor: theme.palette.priority.high,
												borderWidth: '3px', // Ensure consistent border width
											},
											'&:hover': {
												borderColor: 'white',
												backgroundColor: darken(theme.palette.priority.high, 0.3),
											},
											'&.Mui-selected + .MuiToggleButton-root': {
												borderLeftColor: 'white',
											},
										}}
										onClick={() => handlePriorityChange('High')}
										isSelected={toggleAlignment === 'High'}
									>
										High
									</ToggleButton>
								</ToggleButtonGroup>
							</Grid>

							{/* Text Field for Description */}
							<Grid item xs={12}>
								<Typography
									sx={{
										color: theme.typography.common.blue,
										fontWeight: theme.typography.primary.fontWeight,
										fontSize: theme.typography.mediumFont,
									}}
								>
									Description
								</Typography>
								<TextField
									fullWidth
									// label="Description"
									size="small"
									multiline
									placeholder={testIssue1}
									defaultValue={testIssue1}
									onChange={handleDescriptionChange}
									sx={{
										width: '100%',
										backgroundColor: 'white',
									}}
								/>
							</Grid>

							{/* Radio Button for Already Completed */}
							{selectedRole !== "TENANT" && (
								<Grid item xs={12}>
									<Typography
										sx={{
											color: theme.typography.common.blue,
											fontWeight: theme.typography.primary.fontWeight,
											fontSize: theme.typography.mediumFont,
										}}
									>
										Already Completed?
									</Typography>
									<FormControl component="fieldset">
										<RadioGroup
											column
											onChange={handleCompletedChange}
											defaultValue={completionStatus1}
										>
											<FormControlLabel 
												value="yes" 
												control={
													<Radio 
														sx={{
															color: theme.typography.common.blue,
															'&.Mui-checked': {
																color: theme.typography.common.blue,
															},
														}}
													/>
												} 
												label="Yes" />
											<FormControlLabel 
												value="no" 
												control={
													<Radio
														sx={{
															color: theme.typography.common.blue,
															'&.Mui-checked': {
																color: theme.typography.common.blue,
															},
														}}
													/>
												} 
												label="No" />
										</RadioGroup>
									</FormControl>
								</Grid>

							)}{/* File Upload Field */}


							{/* Submit Button */}
							<Grid item xs={12} display={"flex"} justifyContent={"center"} sx={{margin:"0px 0px 10px 0px"}}>
								<Button
									variant="contained"
									color="primary"
									type="submit"
									sx={{ backgroundColor: '#9EAED6' }}
								>
									<Typography
										sx={{
											color: theme.typography.common.blue,
											fontWeight: theme.typography.primary.fontWeight,
											fontSize: theme.typography.mediumFont,
										}}
									>
										Save Maintenance
									</Typography>
									<input type="file" hidden />
								</Button>
							</Grid>
						</Grid>
					</Box>

				</Paper>
			</Box>
		</ThemeProvider>
	);
}
