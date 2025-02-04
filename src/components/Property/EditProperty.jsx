import React, { useState, useEffect, Fragment, useRef, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
	Typography,
	Box,
	Stack,
	Paper,
	Button,
	ThemeProvider,
	TextField,
	MenuItem,
	Select,
	Grid,
	Checkbox,
	FormControlLabel,
	CardMedia,
	InputAdornment,
	Radio,
	Menu,
} from '@mui/material';
import theme from '../../theme/theme';
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
// import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ImageUploader from '../ImageUploader';
// import dataURItoBlob from '../utils/dataURItoBlob';
// import defaultHouseImage from './defaultHouseImage.png';
// import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
// import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { useUser } from '../../contexts/UserContext';
import IconButton from '@mui/material/IconButton';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
// import { Assessment } from '@mui/icons-material';
// import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { getLatLongFromAddress } from '../../utils/geocode';
import AddressAutocompleteInput from './AddressAutocompleteInput';
import { useCookies } from 'react-cookie';

import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';

import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import APIConfig from '../../utils/APIConfig';
// import PropertyNavigator from './PropertyNavigator';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import PropertiesContext from '../../contexts/PropertiesContext';
import AddIcon from '@mui/icons-material/Add';
import defaultHouseImage from "./defaultHouseImage.png";
import ListsContext from '../../contexts/ListsContext';
import { fetchMiddleware as fetch, axiosMiddleware } from "../../utils/httpMiddleware";
import axios from 'axios';
import RapidAPIIcon from "../../images/RapidAPIIcon.png";
import GenericDialog from '../GenericDialog';

function EditProperty(props) {
	// //console.log("In Edit Property");
	const { state } = useLocation();
	let navigate = useNavigate();
	const { getProfileId } = useUser();

	const propertiesContext = useContext(PropertiesContext);
	const {
		propertyList: propertyListFromContext,
		setPropertyList: setPropertyListFromContext,
		fetchProperties: fetchPropertiesFromContext,
		allRentStatus: allRentStatusFromContext,
		returnIndex: returnIndexFromContext,
	} = propertiesContext || {};

	const propertyList = propertyListFromContext || [];
	const setPropertyList = setPropertyListFromContext;
	const fetchProperties = fetchPropertiesFromContext;
	const allRentStatus = allRentStatusFromContext || [];
	const returnIndex = returnIndexFromContext || 0;

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
	onBackClick();
	};

	const discardChange = () => {
	setIsDialogOpen(false);
	}


	// Check with Laysa
	// replaced with line below
	// let { index, propertyList, page, isDesktop, allRentStatus,rawPropertyData } = state || editPropertyState;
	// let { index, page, isDesktop, onBackClick, } = props;
	let { page, isDesktop, onBackClick } = props;

	let index = returnIndex;

	const { getList, } = useContext(ListsContext);
	const typesOfProperty = getList("propertyType");

	const [isSaveDisabled, setIsSaveDisabled] = useState(true);
	const [isReturnDisabled, setIsReturnDisabled] = useState(false);
	const [saveButtonText, setSaveButtonText] = useState('Save and Return to Dashboard');

	const [cookies, setCookie] = useCookies(['default_form_vals']);
	const cookiesData = cookies['default_form_vals'];

	const [propertyData, setPropertyData] = useState(propertyList[index]);
	// //console.log("Property propertyData---", propertyData)
	// //console.log("Property Data in Edit Property", propertyData);
	const { user, selectedRole, selectRole, Name } = useUser();
	const [showSpinner, setShowSpinner] = useState(false);

	const [address, setAddress] = useState('');
	const [city, setCity] = useState('');
	const [propertyState, setPropertyState] = useState('');
	const [zip, setZip] = useState('');
	const [propertyType, setPropertyType] = useState('');
	const [squareFootage, setSquareFootage] = useState('');
	const [bedrooms, setBedrooms] = useState('');
	const [bathrooms, setBathrooms] = useState('');
	const [isListed, setListed] = useState(false);
	const [activeDate, setActiveDate] = useState(null);
	const [description, setDescription] = useState('');
	const [selectedImageList, setSelectedImageList] = useState('');
	const [imageState, setImageState] = useState([]);
	const [deletedImageList, setDeletedImageList] = useState([]);
	const [favImage, setFavImage] = useState('');
	const [activeStep, setActiveStep] = useState(0);
	const [maxSteps, setMaxSteps] = useState(0);
	const [notes, setNotes] = useState('');
	const [unit, setUnit] = useState('');
	const [propertyValue, setPropertyValue] = useState('');
	const [assessmentYear, setAssessmentYear] = useState('');
	const [deposit, setDeposit] = useState('');
	const [listedRent, setListedRent] = useState('');
	const [petsAllowed, setPetsAllowed] = useState(false);
	const [depositForRent, setDepositForRent] = useState(false);
	const [taxes, setTaxes] = useState('');
	const [mortgages, setMortgages] = useState('');
	const [insurance, setInsurance] = useState('');
	const [communityAmenities, setCommunityAmenities] = useState('');
	const [unitAmenities, setUnitAmenities] = useState('');
	const [nearbyAmenities, setNearbyAmenities] = useState('');
	// const [page, setPage] = useState("Edit");
	const [initialData, setInitialData] = useState({});

	const [initaddress, setInitAddress] = useState('');
	const [initcity, setInitCity] = useState('');
	const [initpropertyState, setInitPropertyState] = useState('');
	const [initzip, setInitZip] = useState('');
	const [initpropertyType, setInitPropertyType] = useState('');
	const [initsquareFootage, setInitSquareFootage] = useState('');
	const [initbedrooms, setInitBedrooms] = useState('');
	const [initbathrooms, setInitBathrooms] = useState('');
	const [initisListed, setInitListed] = useState(false);
	const [initnotes, setInitNotes] = useState('');
	const [initunit, setInitUnit] = useState('');
	const [initpropertyValue, setInitPropertyValue] = useState('');
	const [initassessmentYear, setInitAssessmentYear] = useState('');
	const [initselectedImageList, setInitSelectedImageList] = useState('');
	const [initfavImage, setInitFavImage] = useState('');

	const [hasChanges, setHasChanges] = useState(false);
	const [imagesTobeDeleted, setImagesTobeDeleted] = useState([]);
	const [deletedIcons, setDeletedIcons] = useState(
		propertyData?.property_images ? new Array(JSON.parse(propertyData.property_images).length).fill(false) : []
	);
	// const [favoriteIcons, setFavoriteIcons] = useState(
	// 	propertyData?.property_images
	// 		? JSON.parse(propertyData.property_images).map((image) => image === propertyData.property_favorite_image)
	// 		: []
	// );


	const [initialPropertyCodes, setInitialPropertyCodes] = useState([
		{ description: '', code: '', startTime: '', endTime: '', days: '' },
	]);
	const [initialPropertyAmenities, setInitialPropertyAmenities] = useState([
		{ description: '', startTime: '', endTime: '', days: '' },
	]);
	const [initialOtherDetails, setInitialOtherDetails] = useState([{ description: '', days: '' }]);

	// Track if changes occurred
	const [hasPropertyDetailsChanged, setHasPropertyDetailsChanged] = useState(false);
	const [parcelId, setParcelId] = useState("");
	const [zestimate, setZestimate] = useState("");
	const [yearBuit, setYearBuilt] = useState("");
	const [rentZestimate, setRentZestimate] = useState("");


	// Update the initial states when component mounts
	useEffect(() => {
		if (propertyData && propertyData.property_details) {
			const details = JSON.parse(propertyData.property_details);
			setPropertyCodes(details.propertyCodes || [{ description: '', code: '', startTime: '', endTime: '', days: '' }]);
			setPropertyAmenities(details.propertyAmenities || [{ description: '', startTime: '', endTime: '', days: '' }]);
			setOtherDetails(details.otherDetails || [{ description: '', days: '' }]);
		}
	}, [propertyData]);

	//   useEffect(() => {
	// 	//console.log("assessmentYear - ", assessmentYear);
	//   }, [assessmentYear]);

	const sortByFavImage = (favImage, imageList) => {
		if (!favImage || !imageList || !imageList.includes(favImage)) return imageList;

		const sortedImages = [favImage, ...imageList.filter((img) => img !== favImage)];
		return sortedImages;
	};

	const favPropImage = propertyData.property_favorite_image;
	const sortedByFavImgLst = sortByFavImage(favPropImage, JSON.parse(propertyData.property_images));
	const [favoriteIcons, setFavoriteIcons] = useState(
		propertyData?.property_images
			? sortedByFavImgLst.map((image) => image === favPropImage)
			: []
	);
	const [sortedImgLst, setSortedImgLst] = useState(sortedByFavImgLst);
	const [initialSortedImgList, setInitialSortedImgList] = useState(sortedImgLst);
	const [zillowPhotos, setZillowPhotos] = useState([]);
	const [isRapidImages, setIsRapidImages] = useState(false);
	const [canDelImages, setCanDelImages] = useState([]);

	useEffect(() => {
		const property = propertyList[index];
		setInitialData(property);
		//console.log('Intial data', initialData);
		setPropertyData(property);
		setAddress(property.property_address);
		setInitAddress(property.property_address);
		setCity(property.property_city);
		setInitCity(property.property_city);
		setPropertyState(property.property_state);
		setInitPropertyState(property.property_state);
		setZip(property.property_zip);
		setInitZip(property.property_zip);
		setPropertyType(property.property_type);
		setInitPropertyType(property.property_type);
		setSquareFootage(property.property_area);
		setInitSquareFootage(property.property_area);
		setBedrooms(property.property_num_beds);
		setInitBedrooms(property.property_num_beds);
		setBathrooms(property.property_num_baths);
		setInitBathrooms(property.property_num_baths);
		setListed(property.property_available_to_rent === 1 ? true : false);
		setInitListed(property.property_available_to_rent === 1 ? true : false);
		setActiveDate(property.property_active_date);
		setDescription(property.property_description);
		setSelectedImageList(sortedImgLst);
		setInitSelectedImageList(JSON.parse(property.property_images));
		setFavImage(property.property_favorite_image);
		setInitFavImage(property.property_favorite_image);
		setMaxSteps(selectedImageList?.length);
		setNotes(property.property_notes);
		setInitNotes(property.property_notes);
		setUnit(property.property_unit);
		setInitUnit(property.property_unit);
		setPropertyValue(property.property_value);
		setInitPropertyValue(property.property_value);
		setAssessmentYear(property.property_value_year);
		setInitAssessmentYear(property.property_value_year);
		setDeposit(property.property_deposit);
		setListedRent(property.property_listed_rent);
		setPetsAllowed(property.property_pets_allowed === 1 ? true : false);
		setDepositForRent(property.property_deposit_for_rent === 1 ? true : false);
		setTaxes(property.property_taxes);
		setMortgages(property.property_mortgages);
		setInsurance(property.property_insurance);
		setCommunityAmenities(property.property_amenities_community);
		setUnitAmenities(property.property_amenities_unit);
		setNearbyAmenities(property.property_amenities_nearby);
		setInitialSortedImgList(sortedImgLst);
	}, [index]);

	const getChangedFields = () => {
		const changes = {};
		if (parseInt(bedrooms) !== parseInt(initialData.property_num_beds)) changes.property_num_beds = bedrooms;
		if (address !== initialData.property_address) changes.property_address = address;
		if (city !== initialData.property_city) changes.property_city = city;
		if (propertyState !== initialData.property_state) changes.property_state = propertyState;
		if (zip !== initialData.property_zip) changes.property_zip = zip;
		if (propertyType !== initialData.property_type) changes.property_type = propertyType;
		if (parseFloat(squareFootage) !== parseFloat(initialData.property_area)) changes.property_area = squareFootage;
		if (parseInt(bathrooms) !== parseInt(initialData.property_num_baths)) changes.property_num_baths = bathrooms;
		if (isListed !== (initialData.property_available_to_rent === 1))
			changes.property_available_to_rent = isListed ? 1 : 0;
		if (description !== initialData.property_description) changes.property_description = description;
		if (notes !== initialData.property_notes) changes.property_notes = notes;
		if (unit !== initialData.property_unit) changes.property_unit = unit;
		if (parseInt(propertyValue) !== parseInt(initialData.property_value)) changes.property_value = propertyValue;
		if (assessmentYear !== initialData.property_value_year) changes.property_value_year = assessmentYear;
		if (deposit !== initialData.property_deposit) changes.property_deposit = deposit;
		if (listedRent !== initialData.property_listed_rent) changes.property_listed_rent = listedRent;
		if (petsAllowed !== (initialData.property_pets_allowed === 1))
			changes.property_pets_allowed = petsAllowed ? 1 : 0;
		if (depositForRent !== (initialData.property_deposit_for_rent === 1))
			changes.property_deposit_for_rent = depositForRent ? 1 : 0;
		if (taxes !== initialData.property_taxes) changes.property_taxes = taxes;
		if (mortgages !== initialData.property_mortgages) changes.property_mortgages = mortgages;
		if (insurance !== initialData.property_insurance) changes.property_insurance = insurance;
		if (communityAmenities !== initialData.property_amenities_community)
			changes.property_amenities_community = communityAmenities;
		if (unitAmenities !== initialData.property_amenities_unit) changes.property_amenities_unit = unitAmenities;
		if (nearbyAmenities !== initialData.property_amenities_nearby)
			changes.property_amenities_nearby = nearbyAmenities;
		if (favImage !== initialData.property_favorite_image) changes.property_favorite_image = favImage;

		//console.log('changes - ', changes);

		return changes;
	};

	useEffect(() => {
		const hasImageChanges =
			imageState.length > 0 || deletedImageList.length > 0 || favImage !== propertyData.property_favorite_image || JSON.stringify(initialSortedImgList) != JSON.stringify(sortedImgLst);
		const otherChanges = Object.keys(getChangedFields()).length > 0;

		const hasUnsavedChanges = hasImageChanges || otherChanges || hasPropertyDetailsChanged;

		// Update states based on unsaved changes
		setHasChanges(hasUnsavedChanges);
		setIsSaveDisabled(!hasUnsavedChanges);
		setIsReturnDisabled(false);
		setSaveButtonText(hasUnsavedChanges ? 'Save and Return to Dashboard' : 'Return to Dashboard');
	}, [
		imageState,
		deletedImageList,
		favImage,
		address,
		city,
		propertyState,
		zip,
		propertyType,
		squareFootage,
		bedrooms,
		bathrooms,
		isListed,
		description,
		notes,
		unit,
		propertyValue,
		assessmentYear,
		deposit,
		listedRent,
		depositForRent,
		hasPropertyDetailsChanged,
		sortedImgLst,
	]);

	useEffect(() => {
		if (isRapidImages === false) {
			setSortedImgLst(initialSortedImgList);
		} else {
			setImageState([]);
		}
	}, [isRapidImages]);

	// useEffect(() => {
	// 	//console.log('Size of selectedImageList:', selectedImageList.length);
	// 	//console.log('Contents of selectedImageList:', selectedImageList);
	// }, [selectedImageList]);

	const handleUnitChange = (event) => {
		//console.log('handleUnitChange', event.target.value);
		setUnit(event.target.value);
	};

	const handleBackButton = (e) => {
		//console.log('close clicked');
		e.preventDefault();
		
		if (hasChanges){
			openDialog("Unsaved Changes", "You have unsaved changes", "warning");
		}else{
			onBackClick();
		}
	};

	const handleListedChange = (event) => {
		setListed(event.target.checked);
	};

	const handleSubmit = async (event, hasChanges) => {
		event.preventDefault();
		//console.log('handleSubmit');

		if (!hasChanges && !hasPropertyDetailsChanged) {
			navigateBackToDashboard();
			return;
		}

		setShowSpinner(true);
		const changedFields = getChangedFields();
		if (Object.keys(changedFields).length === 0 && imageState.length === 0 && imagesTobeDeleted.length === 0 && !hasPropertyDetailsChanged) {
			setHasChanges(false);
			//console.log('No changes detected.');
			return;
		}




		setIsSaveDisabled(true);
		setSaveButtonText('Return to Dashboard');
		setIsReturnDisabled(false);

		const formData = new FormData();

		for (const [key, value] of Object.entries(changedFields)) {
			formData.append(key, value);
		}

		// If property details have changed, append them to formData
		if (hasPropertyDetailsChanged) {
			const property_details = {
				propertyCodes: propertyCodes.map((code) => ({
					description: code.description,
					code: code.code,
					startTime: code.startTime,
					endTime: code.endTime,
					days: code.days,
				})),
				propertyAmenities: propertyAmenities.map((amenity) => ({
					description: amenity.description,
					startTime: amenity.startTime,
					endTime: amenity.endTime,
					days: amenity.days,
				})),
				otherDetails: otherDetails.map((detail) => ({
					description: detail.description,
					days: detail.days,
				})),
			};

			formData.append('property_details', JSON.stringify(property_details));
		}

		const currentDate = new Date();
		const formattedDate = `${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(
			currentDate.getDate()
		).padStart(2, '0')}-${currentDate.getFullYear()}`;

		const promises = [];
		const promises_added = []; // debug

		const fullAddress = `${address}, ${city}, ${propertyState}, ${zip}`;

		const coordinates = await getLatLongFromAddress(fullAddress);

		//console.log('EditProperty - handleSubmit - coordinates - ', coordinates);

		if (propertyData.property_uid) {
			formData.append('property_uid', propertyData.property_uid);
		}

		if (changedFields.property_address && coordinates) {
			formData.append('property_latitude', coordinates.latitude);
			formData.append('property_longitude', coordinates.longitude);
		}

		let updatedImagesToBeDeleted = [...imagesTobeDeleted];
		let updatedZillowPhotos = [...zillowPhotos];
		if (imagesTobeDeleted.length > 0) {
			if (isRapidImages === true) {
				const newZillowImagesToDel = imagesTobeDeleted.filter(img => zillowPhotos.includes(img) && !initialSortedImgList.includes(img));

				// Update zillowPhotos by removing the deleted images
				updatedZillowPhotos = zillowPhotos.filter(img => !newZillowImagesToDel.includes(img));
				updatedImagesToBeDeleted = imagesTobeDeleted.filter(img => !newZillowImagesToDel.includes(img));
			}

			if (updatedImagesToBeDeleted.length > 0) {
				let updatedImages = JSON.parse(propertyData.property_images);
				updatedImages = updatedImages.filter((image) => !updatedImagesToBeDeleted.includes(image));
				propertyData.property_images = JSON.stringify(updatedImages);
				formData.append('delete_images', JSON.stringify(updatedImagesToBeDeleted));
			}
		}
		////console.log("--debug selectedImageList--", selectedImageList, selectedImageList.length);
		if (updatedZillowPhotos.length > 0 && isRapidImages) {
			const propertyImages = propertyData.property_images && propertyData.property_images.length > 0 ? JSON.parse(propertyData.property_images) : []
			const combined = [...new Set([...propertyImages, ...updatedZillowPhotos])];
			formData.append('property_images', (combined.length > 0) ? JSON.stringify(combined) : defaultHouseImage);
		} else {
			formData.append('property_images', (propertyData.property_images && propertyData.property_images.length > 0) ? propertyData.property_images : defaultHouseImage);
		}

		// if (favImage) {
		// 	formData.append('property_favorite_image', favImage);
		// }

		if (favImage && updatedImagesToBeDeleted.includes(favImage)) {
			formData.append('property_favorite_image', null);
		} else if (favImage) {
			formData.append('property_favorite_image', favImage);
		}

		// const files = imageState;
		if (isRapidImages === false) {
			let i = 0;
			for (const file of imageState) {
				let key = `img_${i++}`;
				if (file.file !== null) {
					formData.append(key, file.file);
				} else {
					formData.append(key, file.image);
				}
				if (file.coverPhoto) {
					formData.set('property_favorite_image', key);
				}
			}

		} else {
			formData.append("property_rentZestimate", rentZestimate);
			formData.append("property_yearBuilt", yearBuit);
			formData.append("property_zestimate", zestimate);
			formData.append("property_parcelid", parcelId);
		}

		////console.log('---FavImage----', favImage);

		if (deletedImageList.length > 0) {
			formData.append('deleted_images', JSON.stringify(deletedImageList));
		}

		// for (let [key, value] of formData.entries()) {
		// 	//console.log(key, value);
		// }

		const putData = async () => {
			promises.push(
				// fetch(`http://localhost:4000/properties`, {
				fetch(`${APIConfig.baseURL.dev}/properties`, {
					method: 'PUT',
					body: formData,
				})
			);
			// setShowSpinner(false);
			setImageState([]);
			setZillowPhotos([]);
			setIsRapidImages(false);
			setCanDelImages([]);
		};

		const autoUpdate = async () => {
			const updateResponse = await fetch(
				`${APIConfig.baseURL.dev}/properties/${propertyData.property_uid}`
			);

			const updatedJson = await updateResponse.json();
			const updatedProperty = updatedJson.Property.result[0];
			const newPropertyList = propertyList.map((property) => {
				if (property.property_uid === updatedProperty.property_uid) {
					return { ...property, ...updatedProperty };
				} else {
					return property;
				}
			});

			setPropertyData(newPropertyList[index]);
			setPropertyList(newPropertyList);

			// Reset the image delete/favorite icons after update
			setDeletedIcons(new Array(JSON.parse(updatedProperty.property_images).length).fill(false));
			setFavoriteIcons(
				JSON.parse(updatedProperty.property_images).map(
					(image) => image === updatedProperty.property_favorite_image
				)
			);

			return newPropertyList[index];
		};

		putData();
		try {
			await Promise.all(promises);
			await autoUpdate();
			navigateBackToDashboard();
			setShowSpinner(false);
		} catch (error) {
			console.error('Error:', error);
			setShowSpinner(false);
		}
	};

	const navigateBackToDashboard = () => {
		if (isDesktop) {
			props.setRHS('PropertyNavigator');
			navigate('/properties', { state: { index, propertyList } });
		} else {
			navigate('/properties', {
				// state: { index, propertyList, allRentStatus, isDesktop, rawPropertyData },
				state: { index, propertyList, allRentStatus, isDesktop, propertyList },
			});
		}
	};

	const isCoverPhoto = (link) => {
		if (link === favImage) {
			return true;
		}
		return false;
	};

	const handleAddressSelect = (address) => {
		//console.log('handleAddressSelect', address);
		setAddress(address.street ? address.street : '');
		setCity(address.city ? address.city : '');
		setPropertyState(address.state ? address.state : '');
		setZip(address.zip ? address.zip : '');
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
		const updatedDeletedIcons = [...deletedIcons];
		updatedDeletedIcons[index] = !updatedDeletedIcons[index];
		setDeletedIcons(updatedDeletedIcons);

		// const imageToDelete = JSON.parse(propertyData.property_images)[index];
		const imageToDelete = sortedImgLst[index];

		setImagesTobeDeleted((prev) => {
			let updatedImagesToBeDeleted;
			if (updatedDeletedIcons[index]) {
				updatedImagesToBeDeleted = [...prev, imageToDelete];
			} else {
				// Remove image from the delete list if the delete icon is toggled off
				updatedImagesToBeDeleted = prev.filter((image) => image !== imageToDelete);
			}

			const hasImageChanges =
				updatedImagesToBeDeleted.length > 0 ||
				imageState.length > 0 ||
				favImage !== propertyData.property_favorite_image;
			const otherChanges = Object.keys(getChangedFields()).length > 0;
			const hasUnsavedChanges = hasImageChanges || otherChanges;

			setHasChanges(hasUnsavedChanges);
			setIsSaveDisabled(!hasUnsavedChanges);
			setIsReturnDisabled(false);
			setSaveButtonText(hasUnsavedChanges ? 'Save and Return to Dashboard' : 'Return to Dashboard');

			return updatedImagesToBeDeleted;
		});

		//console.log('Delete image at index:', JSON.stringify(updatedDeletedIcons));
	};

	const handleFavorite = (index) => {
		const updatedFavoriteIcons = new Array(sortedImgLst.length).fill(false);
		updatedFavoriteIcons[index] = true;
		setFavoriteIcons(updatedFavoriteIcons);

		const newFavImage = sortedImgLst[index];
		// console.log('newFavImage', newFavImage)
		setFavImage(newFavImage);
		setSelectedImageList((prevState) =>
			prevState.map((file, i) => ({
				...file,
				coverPhoto: i === index,
			}))
		);

		//console.log(`Favorite image at index: ${index}`);
		setHasChanges(true);
		setIsSaveDisabled(false);
		setIsReturnDisabled(false);
		setSaveButtonText('Save and Return to Dashboard');
	};

	const handleUpdateFavoriteIcons = () => {
		setFavoriteIcons(new Array(favoriteIcons.length).fill(false));
	};

	// State for dynamic rows in each section
	const [propertyCodes, setPropertyCodes] = useState([
		{ description: '', code: '', startTime: '', endTime: '', days: '' },
	]);
	const [propertyAmenities, setPropertyAmenities] = useState([
		{ description: '', startTime: '', endTime: '', days: '' },
	]);
	const [otherDetails, setOtherDetails] = useState([{ description: '', days: '' }]);

	// Add new row to Property Codes section
	const handleAddPropertyCode = () => {
		setPropertyCodes([...propertyCodes, { description: '', code: '', startTime: '', endTime: '', days: '' }]);
	};

	// Add new row to Property Amenities section
	const handleAddPropertyAmenity = () => {
		setPropertyAmenities([...propertyAmenities, { description: '', startTime: '', endTime: '', days: '' }]);
	};

	// Add new row to Other Details section
	const handleAddOtherDetail = () => {
		setOtherDetails([...otherDetails, { description: '', days: '' }]);
	};

	const handlePropertyCodeChange = (index, event) => {
		const { name, value } = event.target;
		const updatedCodes = [...propertyCodes];
		updatedCodes[index][name] = value;
		setPropertyCodes(updatedCodes);
		checkForPropertyDetailsChanges(updatedCodes, initialPropertyCodes, propertyAmenities, initialPropertyAmenities, otherDetails, initialOtherDetails);
	};

	const handlePropertyAmenityChange = (index, event) => {
		const { name, value } = event.target;
		const updatedAmenities = [...propertyAmenities];
		updatedAmenities[index][name] = value;
		setPropertyAmenities(updatedAmenities);
		checkForPropertyDetailsChanges(propertyCodes, initialPropertyCodes, updatedAmenities, initialPropertyAmenities, otherDetails, initialOtherDetails);
	};

	const handleOtherDetailChange = (index, event) => {
		const { name, value } = event.target;
		const updatedDetails = [...otherDetails];
		updatedDetails[index][name] = value;
		setOtherDetails(updatedDetails);
		checkForPropertyDetailsChanges(propertyCodes, initialPropertyCodes, propertyAmenities, initialPropertyAmenities, updatedDetails, initialOtherDetails);
	};

	// Function to check for changes
	const checkForPropertyDetailsChanges = (newPropertyCodes, initialPropertyCodes, newPropertyAmenities, initialPropertyAmenities, newOtherDetails, initialOtherDetails) => {
		if (JSON.stringify(newPropertyCodes) !== JSON.stringify(initialPropertyCodes) ||
			JSON.stringify(newPropertyAmenities) !== JSON.stringify(initialPropertyAmenities) ||
			JSON.stringify(newOtherDetails) !== JSON.stringify(initialOtherDetails)) {
			setHasPropertyDetailsChanged(true);
		} else {
			setHasPropertyDetailsChanged(false);
		}
	};

	const propertyTypeMapping = {
		MULTI_FAMILY: "Multi Family",
		SINGLE_FAMILY: "Single Family",
		CONDO: "Condo",
		APARTMENT: "Apartment",
	};

	const getRapidApiData = async () => {
		setShowSpinner(true);
		//Get property details from Zillow Rapid API 
		const fullAddress = `${address}, ${city}, ${propertyState}, ${zip}`;
		const options = {
			method: 'GET',
			url: 'https://zillow-working-api.p.rapidapi.com/pro/byaddress',
			params: {
				propertyaddress: fullAddress
			},
			headers: {
				'x-rapidapi-key': process.env.REACT_APP_RAPID_API_KEY,
				'x-rapidapi-host': process.env.REACT_APP_RAPID_API_HOST
			}
		};

		try {
			const response = await axios.request(options);
			// console.log('Rapid API result', response.data, response.status);
			const statusCode = response.data.message.split(":")[0].trim();
			if (statusCode === "200") {
				response.data.propertyDetails.description && setNotes(response.data.propertyDetails.description);
				response.data.propertyDetails.livingArea && setSquareFootage(response.data.propertyDetails.livingArea);
				response.data.propertyDetails.bathrooms && setBathrooms(response.data.propertyDetails.bathrooms);
				response.data.propertyDetails.bedrooms && setBedrooms(response.data.propertyDetails.bedrooms);
				response.data.propertyDetails.zestimate && setPropertyValue(response.data.propertyDetails.zestimate);

				response.data.propertyDetails.parcelId && setParcelId(response.data.propertyDetails.parcelId);
				response.data.propertyDetails.zestimate && setZestimate(response.data.propertyDetails.zestimate);
				response.data.propertyDetails.yearBuit && setYearBuilt(response.data.propertyDetails.yearBuit);
				response.data.propertyDetails.rentZestimate && setRentZestimate(response.data.propertyDetails.rentZestimate);

				const homeType = propertyTypeMapping[response.data.propertyDetails.homeType] || "Other";
				setPropertyType(homeType);
				const zillowPhotos = response.data.propertyDetails.originalPhotos.map((file) => file?.mixedSources?.jpeg?.[1]?.url);

				// console.log('zillowPhotos', zillowPhotos);
				const sortedImgLstSet = [...new Set(sortedImgLst)];
				const filteredZillowPhotos = zillowPhotos.filter(
					(photo) => !sortedImgLstSet.includes(photo)
				);
				const updatedImagesFromRapid = [
					...sortedImgLst,
					...filteredZillowPhotos
				];

				const rapidApiCanDelImages = [
					...sortedImgLst.map(() => false),
					...filteredZillowPhotos.map(() => true)
				];

				setSortedImgLst(updatedImagesFromRapid);
				setZillowPhotos(zillowPhotos);
				setCanDelImages(rapidApiCanDelImages);

				// console.log('updatedImages', updatedImages);
				setIsRapidImages(true);
			}
			setShowSpinner(false);
		} catch (error) {
			console.error(error);
			setShowSpinner(false);
		}
	}


	return (
		<ThemeProvider theme={theme}>
			<Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
				<CircularProgress color="inherit" />
			</Backdrop>
			<Paper
				style={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'flex-start',
					alignItems: 'center',
					width: '100%',
					paddingBottom: '25px',
				}}
			>
				<Paper
					style={{
						// marginTop: '15px',
						backgroundColor: theme.palette.form.main,
						// width: '100%', 
						padding: '15px',
						boxShadow: theme.shadows[3],
					}}
				>
					<Stack direction="row" justifyContent="center" alignItems="center" position="relative">
						<Box direction="row" justifyContent="center" alignItems="center">
							{page === 'edit_property' && (
								<Typography
									sx={{
										color: theme.typography.primary.black,
										fontWeight: theme.typography.primary.fontWeight,
										fontSize: theme.typography.largeFont,
										marginTop: '10px',
									}}
								>
									Edit Property
								</Typography>
							)}
							{page === 'add_listing' && (
								<Typography
									sx={{
										color: theme.typography.primary.black,
										fontWeight: theme.typography.primary.fontWeight,
										fontSize: theme.typography.largeFont,
									}}
								>
									Create Listing
								</Typography>
							)}
							{page === 'edit_listing' && (
								<Typography
									sx={{
										color: theme.typography.primary.black,
										fontWeight: theme.typography.primary.fontWeight,
										fontSize: theme.typography.largeFont,
									}}
								>
									Edit Listing
								</Typography>
							)}
						</Box>
						<Box position="absolute" right={0}>
							<Button onClick={(e) => handleBackButton(e)}>
								<CloseIcon
									sx={{ color: theme.typography.common.blue, fontSize: '30px', margin: '5px' }}
								/>
							</Button>
						</Box>
					</Stack>

					<Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off" id="editPropertyForm">
						<Grid container columnSpacing={12} rowSpacing={6}>
							<Grid item xs={12}>
								<Box
									sx={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										padding: 2,
									}}
								>
									<IconButton onClick={() => handleScroll('left')} disabled={scrollPosition === 0}>
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
												maxWidth: "600px",
											}}
										>
											<ImageList
												ref={scrollRef}
												sx={{ display: 'flex', flexWrap: 'nowrap' }}
												cols={5}
											>
												{sortedImgLst?.map((image, index) => (
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
															alt={`property-${index}`}
															style={{
																height: '150px',
																width: '150px',
																objectFit: 'cover',
															}}
														/>
														<Box sx={{ position: 'absolute', top: 0, right: 0 }}>
															{((!isRapidImages) || (isRapidImages && canDelImages[index])) && (
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
															)}
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

							<Grid item xs={10} md={10}>
								<ImageUploader
									selectedImageList={imageState}
									setSelectedImageList={setImageState}
									setDeletedImageList={setDeletedImageList}
									page={page}
									setFavImage={setFavImage}
									favImage={favImage}
									updateFavoriteIcons={handleUpdateFavoriteIcons}
									setIsRapidImages={setIsRapidImages}
								/>
							</Grid>
							<Grid
								item
								xs={0.5}
								md={0.5}
								sx={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center"
								}}
							>
								<h4 style={{ textAlign: "center" }}>OR</h4>
							</Grid>
							<Grid item xs={1.5} md={1.5}>
								<Button
									onClick={() => {
										getRapidApiData()
									}}
									sx={{
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										padding: 0,
										margin: 0,
										width: "100%",
										height: "100%",
									}}
								>
									<img
										src={RapidAPIIcon}
										alt="Rapid API Icon"
										style={{
											cursor: "pointer",
											width: "100%",
											maxWidth: "50px",
											height: "auto",
										}}
									/>
								</Button>
							</Grid>

							<Grid item xs={12}>
								<Typography
									sx={{
										color: theme.typography.common.blue,
										fontWeight: theme.typography.primary.fontWeight,
										fontSize: theme.typography.mediumFont,
									}}
								>
									Address
								</Typography>
								<AddressAutocompleteInput
									onAddressSelect={handleAddressSelect}
									defaultValue={`${address}, ${city}, ${propertyState}`}
									gray={0}
								/>
							</Grid>

							<Grid item xs={6}>
								<Typography
									sx={{
										color: theme.typography.common.blue,
										fontWeight: theme.typography.primary.fontWeight,
										fontSize: theme.typography.mediumFont,
									}}
								>
									Unit
								</Typography>
								<TextField
									onChange={(e) => setUnit(e.target.value)}
									sx={{
										backgroundColor: 'white',
										borderColor: 'black',
										borderRadius: '7px',
									}}
									placeholder={unit}
									value={unit}
									size="small"
									fullWidth
								/>
							</Grid>

							<Grid item xs={6}>
								<Typography
									sx={{
										color: theme.typography.common.blue,
										fontWeight: theme.typography.primary.fontWeight,
										fontSize: theme.typography.mediumFont,
									}}
								>
									Zip Code
								</Typography>
								<TextField
									fullWidth
									sx={{
										backgroundColor: 'white',
										borderColor: 'black',
										borderRadius: '7px',
									}}
									size="small"
									onChange={(e) => setZip(e.target.value)}
									value={zip}
									disabled
								/>
							</Grid>

							<Grid item xs={6}>
								<Typography
									sx={{
										color: theme.typography.common.blue,
										fontWeight: theme.typography.primary.fontWeight,
										fontSize: theme.typography.mediumFont,
									}}
								>
									Type
								</Typography>
								<Select
									sx={{
										backgroundColor: 'white',
										borderColor: 'black',
										borderRadius: '7px',
									}}
									size="small"
									fullWidth
									onChange={(e) => setPropertyType(e.target.value)}
									value={propertyType}
								>
									{
										typesOfProperty?.map(type => (
											<MenuItem key={type.list_uid} value={type.list_item}>{type.list_item}</MenuItem>
										))
									}
								</Select>
							</Grid>

							<Grid item xs={6}>
								<Typography
									sx={{
										color: theme.typography.common.blue,
										fontWeight: theme.typography.primary.fontWeight,
										fontSize: theme.typography.mediumFont,
									}}
								>
									Square Footage
								</Typography>
								<TextField
									fullWidth
									sx={{
										backgroundColor: 'white',
										borderColor: 'black',
										borderRadius: '7px',
									}}
									size="small"
									placeholder={squareFootage}
									onChange={(e) => setSquareFootage(e.target.value)}
									value={squareFootage}
								/>
							</Grid>

							<Grid item xs={6}>
								<Typography
									sx={{
										color: theme.typography.common.blue,
										fontWeight: theme.typography.primary.fontWeight,
										fontSize: theme.typography.mediumFont,
									}}
								>
									Bedrooms
								</Typography>
								<TextField
									fullWidth
									sx={{
										backgroundColor: 'white',
										borderColor: 'black',
										borderRadius: '7px',
									}}
									size="small"
									placeholder={bedrooms}
									onChange={(e) => setBedrooms(e.target.value)}
									value={bedrooms}
								/>
							</Grid>

							<Grid item xs={6}>
								<Typography
									sx={{
										color: theme.typography.common.blue,
										fontWeight: theme.typography.primary.fontWeight,
										fontSize: theme.typography.mediumFont,
									}}
								>
									Bathrooms
								</Typography>
								<TextField
									fullWidth
									sx={{
										backgroundColor: 'white',
										borderColor: 'black',
										borderRadius: '7px',
									}}
									size="small"
									placeholder={bathrooms}
									onChange={(e) => setBathrooms(e.target.value)}
									value={bathrooms}
								/>
							</Grid>
							<Grid item xs={6}>
								<Typography
									sx={{
										color: theme.typography.common.blue,
										fontWeight: theme.typography.primary.fontWeight,
										fontSize: theme.typography.mediumFont,
									}}
								>
									Property Value
								</Typography>
								<TextField
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
									onChange={(e) => setPropertyValue(e.target.value)}
									value={propertyValue}
								/>
							</Grid>
							<Grid item xs={6}>
								<Typography
									sx={{
										color: theme.typography.common.blue,
										fontWeight: theme.typography.primary.fontWeight,
										fontSize: theme.typography.mediumFont,
									}}
								>
									Assessment Year
								</Typography>
								<LocalizationProvider dateAdapter={AdapterDayjs}>
									<DatePicker
										// label="Year"
										value={assessmentYear ? dayjs(assessmentYear) : null}
										views={['year']}
										format="YYYY"
										maxDate={dayjs(new Date())}
										onChange={(e) => {
											const formattedDate = e ? e.format('YYYY') : null;
											setAssessmentYear(formattedDate);
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
							<Grid item xs={12}>
								<Typography
									sx={{
										color: theme.typography.common.blue,
										fontWeight: theme.typography.primary.fontWeight,
										fontSize: theme.typography.mediumFont,
									}}
								>
									Owner Notes
								</Typography>
								<TextField
									fullWidth
									sx={{
										backgroundColor: 'white',
										borderColor: 'black',
										borderRadius: '7px',
									}}
									size="small"
									multiline={true}
									placeholder={notes}
									onChange={(e) => setNotes(e.target.value)}
									value={notes}
								/>
							</Grid>
							<Grid item xs={12}>
								{page === 'add_listing' || page === 'edit_listing' ? (
									<Stack direction="column" justifyContent="left" padding="15px" width="85%">
										<FormControlLabel
											control={<Checkbox checked={isListed} onChange={handleListedChange} />}
											label="Available to rent"
										/>
									</Stack>
								) : (
									<div></div>
								)}
							</Grid>
						</Grid>
					</Box>
				</Paper>
				<Paper
					style={{
						// marginTop: '15px',
						backgroundColor: theme.palette.form.main,
						// width: '100%', // Adjust width as needed
						padding: '15px',
						boxShadow: theme.shadows[3],
					}}
				>
					<Stack direction="row" justifyContent="center" alignItems="center" position="relative">
						<Typography
							sx={{
								color: theme.typography.primary.black,
								fontWeight: theme.typography.primary.fontWeight,
								fontSize: theme.typography.largeFont,
							}}
						>
							PROPERTY DETAILS
						</Typography>
					</Stack>

					<Box component="form" noValidate autoComplete="off">
						<Grid container columnSpacing={6} rowSpacing={4}>
							{/* Property Codes Section */}
							<Grid item xs={11}>
								<Typography sx={{ fontWeight: 'bold', color: theme.typography.common.blue, marginBottom: '8px', }}>
									Property Codes
								</Typography>
							</Grid>
							<Grid item xs={1}>
								<IconButton onClick={handleAddPropertyCode}>
									<AddIcon />
								</IconButton>
							</Grid>

							{propertyCodes.map((code, index) => (
								<React.Fragment key={index}>
									<Grid item md={3.5} xs={12}>
										<TextField
											fullWidth
											placeholder="Enter description"
											size="small"
											name="description"
											value={code.description}
											onChange={(e) => handlePropertyCodeChange(index, e)}
											sx={{
												backgroundColor: 'white',
												borderColor: 'black',
												borderRadius: '7px',
											}}
										/>
									</Grid>
									<Grid item md={2.3} xs={12}>
										<TextField
											fullWidth
											placeholder="Enter code"
											size="small"
											name="code"
											value={code.code}
											onChange={(e) => handlePropertyCodeChange(index, e)}
											sx={{
												backgroundColor: 'white',
												borderColor: 'black',
												borderRadius: '7px',
											}}
										/>
									</Grid>
									<Grid item md={2} xs={12}>
										<TextField
											fullWidth
											placeholder="Start Time"
											size="small"
											name="startTime"
											value={code.startTime}
											onChange={(e) => handlePropertyCodeChange(index, e)}
											sx={{
												backgroundColor: 'white',
												borderColor: 'black',
												borderRadius: '7px',
											}}
										/>
									</Grid>
									<Grid item md={2} xs={12}>
										<TextField
											fullWidth
											placeholder="End Time"
											size="small"
											name="endTime"
											value={code.endTime}
											onChange={(e) => handlePropertyCodeChange(index, e)}
											sx={{
												backgroundColor: 'white',
												borderColor: 'black',
												borderRadius: '7px',
											}}
										/>
									</Grid>
									<Grid item md={2.2} xs={12}>
										<TextField
											fullWidth
											placeholder="Enter days"
											size="small"
											name="days"
											value={code.days}
											onChange={(e) => handlePropertyCodeChange(index, e)}
											sx={{
												backgroundColor: 'white',
												borderColor: 'black',
												borderRadius: '7px',
											}}
										/>
									</Grid>
								</React.Fragment>
							))}


							{/* Property Amenities Section */}
							<Grid item xs={11}>
								<Typography sx={{
									fontWeight: 'bold', color: theme.typography.common.blue, marginTop: '20px',  // Add more space before the next title
									marginBottom: '8px',
								}}>
									Property Amenities
								</Typography>
							</Grid>

							<Grid item xs={1}>
								<IconButton onClick={handleAddPropertyAmenity} sx={{
									marginTop: '20px',  // Add more space before the next title
								}}>
									<AddIcon />
								</IconButton>
							</Grid>
							{propertyAmenities.map((amenity, index) => (
								<React.Fragment key={index}>
									<Grid item md={4} xs={12}>
										<TextField
											fullWidth
											placeholder="Enter a description"
											size="small"
											name="description"  // Name matches the state property
											value={amenity.description}
											onChange={(e) => handlePropertyAmenityChange(index, e)}
											sx={{
												backgroundColor: 'white',
												borderColor: 'black',
												borderRadius: '7px',
											}}
										/>
									</Grid>
									<Grid item md={2} xs={12}>
										<TextField
											fullWidth
											placeholder="Start Time"
											size="small"
											name="startTime"  // Name matches the state property
											value={amenity.startTime}
											onChange={(e) => handlePropertyAmenityChange(index, e)}
											sx={{
												backgroundColor: 'white',
												borderColor: 'black',
												borderRadius: '7px',
											}}
										/>
									</Grid>
									<Grid item md={2} xs={12}>
										<TextField
											fullWidth
											placeholder="End Time"
											size="small"
											name="endTime"  // Name matches the state property
											value={amenity.endTime}
											onChange={(e) => handlePropertyAmenityChange(index, e)}
											sx={{
												backgroundColor: 'white',
												borderColor: 'black',
												borderRadius: '7px',
											}}
										/>
									</Grid>
									<Grid item md={3} xs={12}>
										<TextField
											fullWidth
											placeholder="Enter days"
											size="small"
											name="days"  // Name matches the state property
											value={amenity.days}
											onChange={(e) => handlePropertyAmenityChange(index, e)}
											sx={{
												backgroundColor: 'white',
												borderColor: 'black',
												borderRadius: '7px',
											}}
										/>
									</Grid>
								</React.Fragment>
							))}


							{/* Other Details Section */}
							<Grid item xs={11}>
								<Typography sx={{ fontWeight: 'bold', color: theme.typography.common.blue, marginTop: '20px', }}>
									Other Details
								</Typography>
							</Grid>

							<Grid item xs={1}>
								<IconButton onClick={handleAddOtherDetail} sx={{ marginTop: '20px', }}>

									<AddIcon />
								</IconButton>
							</Grid>
							{otherDetails.map((detail, index) => (
								<React.Fragment key={index}>
									<Grid item md={6} xs={12}>
										<TextField
											fullWidth
											placeholder="Enter a description"
											size="small"
											name="description"  // Name matches the state property
											value={detail.description}
											onChange={(e) => handleOtherDetailChange(index, e)}
											sx={{
												backgroundColor: 'white',
												borderColor: 'black',
												borderRadius: '7px',
											}}
										/>
									</Grid>
									<Grid item md={3} xs={12}>
										<TextField
											fullWidth
											placeholder="Enter days"
											size="small"
											name="days"  // Name matches the state property
											value={detail.days}
											onChange={(e) => handleOtherDetailChange(index, e)}
											sx={{
												backgroundColor: 'white',
												borderColor: 'black',
												borderRadius: '7px',
											}}
										/>
									</Grid>
								</React.Fragment>
							))}

						</Grid>

					</Box>
				</Paper>
				<Box
					sx={{
						width: '100%',
					}}
				>
					<Stack direction="row" spacing={6} justifyContent="center" sx={{ marginTop: '20px' }}>
						<Button
							variant="contained"
							sx={{ backgroundColor: "#3D5CAC" }}
							onClick={(event) => handleSubmit(event, hasChanges)}
							disabled={false} // The button should always be enabled
						>
							<Typography
								sx={{
									color: '#FFFFFF',
									fontWeight: theme.typography.primary.fontWeight,
									fontSize: theme.typography.mediumFont,
								}}
							>
								{hasChanges ? 'Save and Return to Dashboard' : 'Return to Dashboard'}
							</Typography>
						</Button>
					</Stack>
				</Box>
			</Paper>
			<GenericDialog
				isOpen={isDialogOpen}
				title={dialogTitle}
				contextText={dialogMessage}
				actions={[
					{
					label: "Discard Changes",
					onClick: closeDialog,
					},
					{
					label: "Return To Edit",
					onClick: discardChange,
					}
				]}
				severity={dialogSeverity}
			/>
		</ThemeProvider>
	);
}

export default EditProperty;
