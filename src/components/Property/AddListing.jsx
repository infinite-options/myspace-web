import React, { useState, useEffect, Fragment, useRef, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Typography,
  Box,
  Stack,
  Paper,
  Button,
  ThemeProvider,
  Form,
  TextField,
  Badge,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Grid,
  Input,
  Container,
  Checkbox,
  Radio,
  FormLabel,
  FormControlLabel,
  RadioGroup,
  UploadFile,
  CardMedia,
  InputAdornment,
  Menu,
} from "@mui/material";
import theme from "../../theme/theme";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ImageUploader from "../ImageUploader";
import defaultHouseImage from "./defaultHouseImage.png";
import { useUser } from "../../contexts/UserContext";
import IconButton from "@mui/material/IconButton";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";

import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import useMediaQuery from "@mui/material/useMediaQuery";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from 'dayjs';
import APIConfig from "../../utils/APIConfig";

import PropertiesContext from "../../contexts/PropertiesContext";
import ListsContext from "../../contexts/ListsContext";
import ManagementContractContext from '../../contexts/ManagementContractContext';
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../utils/httpMiddleware";


export default function AddListing(props) {
  const location = useLocation();
  let navigate = useNavigate();
  const { getProfileId } = useUser();
  const { dataLoaded, getList } = useContext(ListsContext);
  const { state } = useLocation();
  // const { propertyList, fetchProperties, allContracts, fetchContracts, returnIndex,  } = useContext(PropertiesContext);

  const propertiesContext = useContext(PropertiesContext);
  const {
    propertyList: propertyListFromContext,
    fetchProperties: fetchPropertiesFromContext,
    // allContracts: allContractsFromContext,
    // fetchContracts: fetchContractsFromContext,
    returnIndex: returnIndexFromContext,
  } = propertiesContext || {};

  const managementContractContext = useContext(ManagementContractContext);
  const {
    allContracts: allContractsFromContext,
    fetchContracts: fetchContractsFromContext,
  } = managementContractContext || {};


  const propertyList = propertyListFromContext || [];
  const fetchProperties = fetchPropertiesFromContext;
  const allContracts = allContractsFromContext || [];
  const fetchContracts = fetchContractsFromContext;
  const returnIndex = returnIndexFromContext || 0;

  let { page, onBackClick } = props;
  const refreshProperties = fetchProperties;
  const showPropertyNavigator = props.showPropertyNavigator;
  // const propertyData = location.state.item;
  const [propertyData, setPropertyData] = useState(propertyList[returnIndex]);
  const { user, selectedRole, selectRole, Name } = useUser();
  const [showSpinner, setShowSpinner] = useState(false);
  const [ownerId, setOwnerId] = useState(getProfileId());
  const statesList = getList("states");
  const propertyTypes = getList("propertyType");
  const [address, setAddress] = useState(propertyData.property_address);
  const [city, setCity] = useState(propertyData.property_city);
  const [propertyState, setPropertyState] = useState(propertyData.property_state);
  const [zip, setZip] = useState(propertyData.property_zip);
  const [propertyType, setPropertyType] = useState(propertyData.property_type);
  const [squareFootage, setSquareFootage] = useState(propertyData.property_area);
  const [bedrooms, setBedrooms] = useState(propertyData.property_num_beds);
  const [bathrooms, setBathrooms] = useState(propertyData.property_num_baths);

  const [description, setDescription] = useState(propertyData.property_description);
  const [deletedImageList, setDeletedImageList] = useState([]);
  const [favImage, setFavImage] = useState(propertyData.property_favorite_image);
  const [activeStep, setActiveStep] = useState(0);
  const [coverImage, setCoverImage] = useState(defaultHouseImage);
  const [notes, setNotes] = useState(propertyData.property_notes);
  const [unit, setUnit] = useState(propertyData.property_unit);
  const [propertyValue, setPropertyValue] = useState(propertyData.property_value);
  const [assessmentYear, setAssessmentYear] = useState(propertyData.property_value);
  const [deposit, setDeposit] = useState(propertyData.property_deposit);
  const [petsAllowed, setPetsAllowed] = useState(propertyData.property_pets_allowed === 1 ? true : false);
  const [depositForRent, setDepositForRent] = useState(propertyData.property_deposit_for_rent === 1 ? true : false);
  const [taxes, setTaxes] = useState(propertyData.property_taxes);
  const [mortgages, setMortgages] = useState(propertyData.property_mortgages);
  const [insurance, setInsurance] = useState(propertyData.property_insurance);
  const [rent, setRent] = useState(propertyData.property_listed_rent);
  const [communityAmenities, setCommunityAmenities] = useState(propertyData.property_amenities_community);
  const [apartmentAmenities, setApartmentAmenities] = useState(propertyData.property_amenities_unit);
  const [nearbyAmenities, setNearbyAmenities] = useState(propertyData.property_amenities_nearby);
  const [activeDate, setActiveDate] = useState(dayjs(propertyData.property_active_date));
  const [isListed, setListed] = useState(true);
  const [hasUtilitiesChanges, setHasUtilitiesChanges] = useState(false);
  const [changedSaved, setChangedSaved] = useState(false);

  const [imageState, setImageState] = useState([]);
  const [imagesTobeDeleted, setImagesTobeDeleted] = useState([]);
  const [deletedIcons, setDeletedIcons] = useState(new Array(JSON.parse(propertyData.property_images).length).fill(false));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  // useEffect(() => {
  //   //console.log("deletedImageList - ", deletedImageList);
  // }, [deletedImageList]);

  // const [utilityNames, setUtilityNames] = useState([]);
  // const [utilityEntities, setUtilityEntities] = useState([]);
  const [utilitiesObject, setUtilitiesObject] = useState(propertyData?.property_utilities != null ? JSON.parse(propertyData?.property_utilities) : []);
  const [utilityNames, setUtilityNames] = useState([]);
  const [utilityEntities, setUtilityEntities] = useState([]);
  const [utilitiesMap, setUtilitiesMap] = useState(new Map()); 
  const [entitiesMap, setEntitiesMap] = useState(new Map());
  const [reverseUtilitiesMap, setReverseUtilitiesMap] = useState(new Map()); 
  const [reverseEntitiesMap, setReverseEntitiesMap] = useState(new Map());
  const [keysNotInUtilitiesMap, setKeysNotInUtilitiesMap] = useState([]);

  const [isDefaultUtilities, setIsDefaultUtilities] = useState(false);
  const [mappedUtilitiesPaidBy, setMappedUtilitiesPaidBy] = useState({});
  const [newUtilitiesPaidBy, setNewUtilitiesPaidBy] = useState({});

  // useEffect(() => {
  //   //console.log("newUtilitiesPaidBy - ", newUtilitiesPaidBy);
  // }, [newUtilitiesPaidBy]);

  const sortByFavImage = (favImage, imageList) => {
    if (!favImage || !imageList || !imageList.includes(favImage)) return imageList;

    const sortedImages = [favImage, ...imageList.filter((img) => img !== favImage)];
    return sortedImages;
  };

  const favPropImage = propertyData.property_favorite_image;
	const sortedByFavImgLst = sortByFavImage(favPropImage, JSON.parse(propertyData.property_images));

  const [selectedImageList, setSelectedImageList] = useState(sortedByFavImgLst);
  const [favoriteIcons, setFavoriteIcons] = useState(sortedByFavImgLst.map((image) => image === propertyData.property_favorite_image));
  const maxSteps = selectedImageList.length;

  useEffect(() => {
    //console.log("ROHIT - 153 - mappedUtilitiesPaidBy - ", mappedUtilitiesPaidBy);
  }, [mappedUtilitiesPaidBy]);

  useEffect(() => {
    // //console.log("ROHIT - 153 - propertyData - ", propertyData);
    //console.log("ROHIT - 153 - propertyData.property_utilities - ", propertyData.property_utilities);
  }, [propertyData]);

  useEffect(() => {
    //console.log("ROHIT - 153 - utilitiesObject - ", utilitiesObject);
    
  }, [utilitiesObject,]);

  // const utilitiesMap = new Map([
  //   ["050-000001", "electricity"],
  //   ["050-000002", "water"],
  //   ["050-000003", "gas"],
  //   ["050-000004", "trash"],
  //   ["050-000005", "sewer"],
  //   ["050-000006", "internet"],
  //   ["050-000007", "cable"],
  //   ["050-000008", "hoa_dues"],
  //   ["050-000009", "security_system"],
  //   ["050-000010", "pest_control"],
  //   ["050-000011", "gardener"],
  //   ["050-000012", "maintenance"],
  // ]);

  // const entitiesMap = new Map([
  //   ["050-000280", "owner"],
  //   ["050-000281", "property manager"],
  //   ["050-000282", "tenant"],
  //   ["050-000289", "user"],
  // ]);

  // const reverseUtilitiesMap = new Map(Array.from(utilitiesMap, ([key, value]) => [value, key]));
  // const reverseEntitiesMap = new Map(Array.from(entitiesMap, ([key, value]) => [value, key]));

  useEffect(() => {
    const names = utilityNames?.reduce((map, item) => {
      map.set(item.list_uid, item.list_item);
      return map;
    }, new Map());
    // //console.log("278 - names - ", names)
    setUtilitiesMap(names);
  }, [utilityNames]);
  useEffect(() => {
    const entities = utilityEntities?.reduce((map, item) => {
      map.set(item.list_uid, item.list_item);
      return map;
    }, new Map());
    // //console.log("278 - entities - ", entities)
    setEntitiesMap(entities);
  }, [utilityEntities]);
  useEffect(() => {
    const reverseMap = new Map(Array.from(utilitiesMap ? utilitiesMap : [], ([key, value]) => [value, key]));
    // //console.log("296 - reverseMap - ", reverseMap)
    setReverseUtilitiesMap(reverseMap);
  }, [utilitiesMap]);
  useEffect(() => {
    const reverseMap = new Map(Array.from(entitiesMap ? entitiesMap : [], ([key, value]) => [value, key]));
    // //console.log("303 - reverseMap - ", reverseMap)
    setReverseEntitiesMap(reverseMap);

  // }, [adults, children, pets, vehicles]);
  }, [entitiesMap]);
  useEffect(() => {
    setKeysNotInUtilitiesMap(Array.from(utilitiesMap?.values()).filter((utility) => !(utility in mappedUtilitiesPaidBy)));
  }, [utilitiesMap, mappedUtilitiesPaidBy]);

  const mapUIDsToUtilities = (propertyUtilities) => {
    if (!propertyUtilities) {
      return {};
    }
    // //console.log("----- in mapUIDsToUtilities, input - ", propertyUtilities);
    const mappedUtilities = {};
    for (const key of Object.keys(propertyUtilities)) {
      const utilityName = utilitiesMap.get(key);
      const entityName = entitiesMap.get(propertyUtilities[key]);

      if (utilityName && entityName) {
        mappedUtilities[utilityName] = entityName;
      }
    }

    // //console.log("----- in mapUIDsToUtilities, mappedUtilities - ", mappedUtilities);
    return mappedUtilities;
  };

  // const utilitiesObject = JSON.parse(propertyData.property_utilities); 
  
  let utilitiesInUIDForm = {};
  let mappedUtilities2 = {};
  

  useEffect(() => {
    if (utilitiesObject && utilitiesObject?.length > 0) {
      // //console.log("*****************************************AddListing useEffect*******************************************");
      for (const utility of utilitiesObject) {
        // //console.log(utility.utility_type_id, utility.utility_payer_id);
        utilitiesInUIDForm[utility.utility_type_id] = utility.utility_payer_id;
      }
      // //console.log("UTILTIES IN UID FORM", utilitiesInUIDForm);

      mappedUtilities2 = mapUIDsToUtilities(utilitiesInUIDForm);
      // //console.log("----- Mapped UIDs to Utilities, mappedUtilities2");
      // //console.log("   ", mappedUtilities2);
      setMappedUtilitiesPaidBy(mappedUtilities2);
    } else {
      setMappedUtilitiesPaidBy(defaultUtilities);
      setIsDefaultUtilities(true);
    }
    // //console.log("************************************************AddListing useEffect***********************************");
  }, [utilitiesObject, utilitiesMap, entitiesMap,]);

  const getListDetails = () => {
    // //console.log("543 - getListDetails called");
    // const relationships = getList("relationships");
    // const states = getList("states");        
    const utilNames = getList("utilities");
    const utilEntities = getList("role");
    // //console.log("285 - utilNames - ", utilNames)
    // //console.log("285 -  utilEntities - ", utilEntities)
    // setRelationships(relationships);
    // setStates(states);
    setUtilityNames(utilNames);
    setUtilityEntities(utilEntities);

  };

  useEffect(() => {
    // //console.log("543 - dataLoaded - ", dataLoaded);
    if(dataLoaded === true){
      getListDetails();
    }    
  }, [dataLoaded, getList,]);

  const mapUtilitiesAndEntitiesToUIDs = (utilitiesObject) => {
    const mappedResults = {};

    for (const [key, value] of Object.entries(utilitiesObject)) {
      const utilityUID = reverseUtilitiesMap.get(key);
      const entityUID = reverseEntitiesMap.get(value);

      if (utilityUID && entityUID) {
        mappedResults[utilityUID] = entityUID;
      }
    }

    return mappedResults;
  };

  const handleUtilityChange = (utility, entity) => {
    const utilityObject = { [utility]: `${entity}` };
    setHasUtilitiesChanges(true);
    // //console.log("----- handleUtilityChange called - ", utilityObject);

    setMappedUtilitiesPaidBy((prevState) => ({
      ...prevState,
      [utility]: prevState.hasOwnProperty(utility) ? entity : prevState[utility],
    }));
    setNewUtilitiesPaidBy((prevState) => ({
      ...(prevState.hasOwnProperty(utility) ? { ...prevState, [utility]: entity } : prevState),
    }));
  };

  const [addUtilityAnchorElement, setAddUtilityAnchorElement] = useState(null);
  // const keysNotInUtilitiesMap = Array.from(utilitiesMap.values()).filter((utility) => !(utility in mappedUtilitiesPaidBy));

  const handleAddUtilityButtonClick = (event) => {
    setAddUtilityAnchorElement(event.currentTarget);
  };

  const handleAddUtilityClose = () => {
    setAddUtilityAnchorElement(null);
  };

  const handleAddUtility = (utility) => {
    const updatedMappedUtilities = { ...mappedUtilitiesPaidBy };
    updatedMappedUtilities[utility] = "owner";
    setMappedUtilitiesPaidBy(updatedMappedUtilities);

    const updatedNewUtilitiesMappedBy = { ...newUtilitiesPaidBy };
    updatedNewUtilitiesMappedBy[utility] = "owner";
    setNewUtilitiesPaidBy(updatedNewUtilitiesMappedBy);

    // //console.log(`Adding utility: ${utility}`);
    handleAddUtilityClose();
  };

  const handleListedChange = (event) => {
    setListed(event.target.checked);
  };

  useEffect(() => {
    // //console.log("useEffect");
    setCoverImage(selectedImageList[0] || coverImage);
  }, [selectedImageList]);

  useEffect(() => {
    // //console.log("propertyState", propertyState);
  }, [propertyState]);

  const handleBackButton = async () => {
    const hasPropertyChanges =
      propertyData.property_address !== address ||
      propertyData.property_unit !== unit ||
      propertyData.property_city !== city ||
      propertyData.property_state !== propertyState ||
      propertyData.property_zip !== zip ||
      propertyData.property_type !== propertyType ||
      propertyData.property_num_beds !== bedrooms ||
      propertyData.property_num_baths !== bathrooms ||
      propertyData.property_area !== squareFootage ||
      propertyData.property_listed_rent !== rent ||
      propertyData.property_deposit !== deposit ||
      propertyData.property_pets_allowed !== (petsAllowed ? 1 : 0) ||
      propertyData.property_deposit_for_rent !== (depositForRent ? 1 : 0) ||
      propertyData.property_taxes !== taxes ||
      propertyData.property_mortgages !== mortgages ||
      propertyData.property_insurance !== insurance ||
      propertyData.property_description !== description ||
      propertyData.property_notes !== notes ||
      propertyData.property_available_to_rent !== (isListed ? 1 : 0) ||
      propertyData.property_amenities_community !== communityAmenities ||
      propertyData.property_amenities_unit !== apartmentAmenities ||
      propertyData.property_amenities_nearby !== nearbyAmenities ||
      !dayjs
      (propertyData.property_active_date).isSame(activeDate) ||
      hasUtilitiesChanges;

    // //console.log("hasPropertyChanges:", hasPropertyChanges);
    // //console.log("Property Data:", propertyData);
    // //console.log("State Values:", {
    //   address,
    //   unit,
    //   city,
    //   propertyState,
    //   zip,
    //   propertyType,
    //   bedrooms,
    //   bathrooms,
    //   squareFootage,
    //   rent,
    //   deposit,
    //   petsAllowed,
    //   depositForRent,
    //   taxes,
    //   mortgages,
    //   insurance,
    //   description,
    //   notes,
    //   isListed,
    //   communityAmenities,
    //   apartmentAmenities,
    //   nearbyAmenities,
    // });

    if (hasPropertyChanges) {
      const confirmSave = window.confirm("You have unsaved changes. Do you want to save them before leaving?");

      if (confirmSave) {
        saveChanges(true);
      } else {
        navigate("/properties", { state: { isBack: true } });
        onBackClick();
      }
    } else {
      navigate("/properties", { state: { isBack: true } });
      onBackClick();
    }
  };

  const saveChanges = async (navigateAfterSave = true) => {
    const formData = new FormData();
    formData.append("property_uid", propertyData.property_uid);
    let hasPropertyChanges = false;

    if (propertyData.property_address !== address) {
      formData.append("property_address", address);
      hasPropertyChanges = true;
    }
    if (propertyData.property_unit !== unit) {
      formData.append("property_unit", unit);
      hasPropertyChanges = true;
    }
    if (propertyData.property_city !== city) {
      formData.append("property_city", city);
      hasPropertyChanges = true;
    }
    if (propertyData.property_state !== propertyState) {
      formData.append("property_state", propertyState);
      hasPropertyChanges = true;
    }
    if (propertyData.property_zip !== zip) {
      formData.append("property_zip", zip);
      hasPropertyChanges = true;
    }
    if (propertyData.property_type !== propertyType) {
      formData.append("property_type", propertyType);
      hasPropertyChanges = true;
    }
    if (propertyData.property_num_beds !== bedrooms) {
      formData.append("property_num_beds", bedrooms);
      hasPropertyChanges = true;
    }
    if (propertyData.property_num_baths !== bathrooms) {
      formData.append("property_num_baths", bathrooms);
      hasPropertyChanges = true;
    }
    if (propertyData.property_area !== squareFootage) {
      formData.append("property_area", squareFootage);
      hasPropertyChanges = true;
    }
    if (propertyData.property_listed_rent !== rent) {
      formData.append("property_listed_rent", rent);
      hasPropertyChanges = true;
    }
    if (propertyData.property_deposit !== deposit) {
      formData.append("property_deposit", deposit);
      hasPropertyChanges = true;
    }
    if (propertyData.property_pets_allowed !== (petsAllowed ? 1 : 0)) {
      formData.append("property_pets_allowed", petsAllowed ? 1 : 0);
      hasPropertyChanges = true;
    }
    if (propertyData.property_deposit_for_rent !== (depositForRent ? 1 : 0)) {
      formData.append("property_deposit_for_rent", depositForRent ? 1 : 0);
      hasPropertyChanges = true;
    }
    if (propertyData.property_taxes !== taxes) {
      formData.append("property_taxes", taxes ? taxes : "null");
      hasPropertyChanges = true;
    }
    if (propertyData.property_mortgages !== mortgages) {
      formData.append("property_mortgages", mortgages ? mortgages : "null");
      hasPropertyChanges = true;
    }
    if (propertyData.property_insurance !== insurance) {
      formData.append("property_insurance", insurance ? insurance : "null");
      hasPropertyChanges = true;
    }
    if (propertyData.property_description !== description) {
      formData.append("property_description", description);
      hasPropertyChanges = true;
    }
    if (propertyData.property_notes !== notes) {
      formData.append("property_notes", notes);
      hasPropertyChanges = true;
    }
    if (propertyData.property_available_to_rent !== (isListed ? 1 : 0)) {
      formData.append("property_available_to_rent", isListed ? 1 : 0);
      hasPropertyChanges = true;
    }

    const currentDate = new Date();
    const formattedDate = `${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}-${currentDate.getFullYear()}`;

    if (propertyData.property_available_to_rent !== (isListed ? 1 : 0)) {
      formData.append("property_listed_date", formattedDate);
      hasPropertyChanges = true;
    }

    if (!dayjs
      (propertyData.property_active_date).isSame(activeDate)) {
      formData.append("property_active_date",  dayjs(activeDate).format('MM-DD-YYYY'));
      hasPropertyChanges = true;
    }

    if (propertyData.property_amenities_community !== communityAmenities) {
      formData.append("property_amenities_community", communityAmenities);
      hasPropertyChanges = true;
    }
    if (propertyData.property_amenities_unit !== apartmentAmenities) {
      formData.append("property_amenities_unit", apartmentAmenities);
      hasPropertyChanges = true;
    }
    if (propertyData.property_amenities_nearby !== nearbyAmenities) {
      formData.append("property_amenities_nearby", nearbyAmenities);
      hasPropertyChanges = true;
    }

    if (imagesTobeDeleted.length > 0) {
      let updatedImages = JSON.parse(propertyData.property_images);
      updatedImages = updatedImages.filter((image) => !imagesTobeDeleted.includes(image));
      propertyData.property_images = JSON.stringify(updatedImages);
      formData.append("delete_images", JSON.stringify(imagesTobeDeleted));
      hasPropertyChanges = true;
    }
    ////console.log("--debug selectedImageList--", selectedImageList, selectedImageList.length);
    formData.append("property_images", propertyData.property_images);
    if (favImage !== propertyData.property_favorite_image) {
      formData.append("property_favorite_image", favImage);
      hasPropertyChanges = true;
    }
    let i = 0;
    for (const file of imageState) {
      let key = `img_${i++}`;
      if (file.file !== null) {
        formData.append(key, file.file);
        hasPropertyChanges = true;
      } else {
        formData.append(key, file.image);
        hasPropertyChanges = true;
      }
      if (file.coverPhoto) {
        formData.set("property_favorite_image", key);
        hasPropertyChanges = true;
      }
    }

    const putUtilitiesData = async () => {
      if (hasUtilitiesChanges) {
        const utilitiesJSONString = JSON.stringify(mapUtilitiesAndEntitiesToUIDs(mappedUtilitiesPaidBy));
        const utilitiesFormData = new FormData();
        utilitiesFormData.append("property_uid", propertyData.property_uid);
        utilitiesFormData.append("property_utility", utilitiesJSONString);

        setShowSpinner(true);
        await fetch(`${APIConfig.baseURL.dev}/utilities`, {
          method: "PUT",
          body: utilitiesFormData,
        });
        setShowSpinner(false);

        //console.log("Utilities changes saved.");
      } else {
        //console.log("No changes for utilities.");
      }
    };

    if (hasPropertyChanges || hasUtilitiesChanges) {
      try {
        setShowSpinner(true);

        if (hasPropertyChanges) {
          await fetch(`${APIConfig.baseURL.dev}/properties`, {
            method: "PUT",
            body: formData,
          });
        }

        if (hasUtilitiesChanges) {
          await putUtilitiesData();
        }

        setShowSpinner(false);
        //console.log("Changes saved successfully.");

        if (navigateAfterSave) {
          refreshProperties();
          showPropertyNavigator();
        } else {
          refreshProperties();
        }

        setChangedSaved(true);
        hasPropertyChanges = false;
        hasUtilitiesChanges = false;
      } catch (error) {
        setShowSpinner(false);
        console.error("Error saving changes:", error);
      }
    } else {
      //console.log("No changes detected.");
      setChangedSaved(true);
      if (navigateAfterSave) {
        navigate("/properties", { state: { isBack: true } });
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    //console.log("handleSubmit");

    if (!deposit) {
      alert("Deposit cannot be empty!");
      return;
    }

    if (!rent) {
      alert("Rent cannot be empty!");
      return;
    }

    await saveChanges(true);
  };

  const handleUpdateAndStay = async () => {
    //console.log("handleUpdateAndStay");
    await saveChanges(false);
    setChangedSaved(true);
  };

  const formatUtilityName = (utility) => {
    const formattedUtility = utility.replace(/_/g, " ");
    return formattedUtility.charAt(0).toUpperCase() + formattedUtility.slice(1);
  };

  const defaultUtilities = {
    electricity: "owner",
    trash: "owner",
    water: "owner",
    internet: "owner",
    gas: "owner",
  };

  const isCoverPhoto = (link) => {
    if (link === favImage) {
      return true;
    }
    return false;
  };

  // const loadImages = async () => {
  //   const files = [];
  //   const images = JSON.parse(propertyData.property_images);
  //   for (let i = 0; i < images.length; i++) {
  //     files.push({
  //       index: i,
  //       image: images[i],
  //       file: null,
  //       coverPhoto: isCoverPhoto(images[i]),
  //     });
  //   }
  //   setSelectedImageList(files);
  //   // setActiveStep(files.findIndex(file => file.coverPhoto));
  //   setActiveStep(() => {
  //     const index = files.findIndex((file) => file.coverPhoto);

  //     return index !== -1 ? index : 0;
  //   });
  // };

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

        if (direction === "left") {
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
    const imageToDelete = sortedByFavImgLst[index];
    setImagesTobeDeleted((prev) => [...prev, imageToDelete]);

    // //console.log("Delete image at index:", JSON.stringify(deletedIcons));
  };

  const handleFavorite = (index) => {
    const updatedFavoriteIcons = new Array(favoriteIcons.length).fill(false);
    updatedFavoriteIcons[index] = true;
    setFavoriteIcons(updatedFavoriteIcons);

    // const newFavImage = JSON.parse(propertyData.property_images)[index];
    const newFavImage = selectedImageList[index];
    setFavImage(newFavImage);
    setSelectedImageList((prevState) =>
      prevState.map((file, i) => ({
        ...file,
        coverPhoto: i === index,
      }))
    );

    //console.log(`Favorite image at index: ${index}`);
  };

  const handleUpdateFavoriteIcons = () => {
    setFavoriteIcons(new Array(favoriteIcons.length).fill(false));
  };

  return (
    <ThemeProvider theme={theme}>
      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
        <CircularProgress color='inherit' />
      </Backdrop>
      <Stack
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "center",
          width: "100%",
          minHeight: "100vh",
          marginTop: theme.spacing(2),
          paddingBottom: "25px",
        }}
      >
        <Paper
          style={{
            marginTop: "15px",
            // padding: theme.spacing(2),
            backgroundColor: theme.palette.form.main,
            width: "80%",
            // [theme.breakpoints.down("sm")]: {
            //   width: "80%",
            // },
            // [theme.breakpoints.up("sm")]: {
            //   width: "50%",
            // },
            // paddingTop: "10px",
            padding: "25px",
          }}
        >
          <Stack direction='row' justifyContent='center' alignItems='center' position='relative'>
            <Box direction='row' justifyContent='center' alignItems='center'>
              <Typography sx={{ color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}>
                {propertyData.property_available_to_rent !== 1 ? "Create Listing" : "Update Listing"}
              </Typography>
            </Box>
            <Box position='absolute' right={0}>
              <Button onClick={() => handleBackButton()}>
                <CloseIcon sx={{ color: theme.typography.common.blue, fontSize: "30px", margin: "5px" }} />
              </Button>
            </Box>
          </Stack>

          <Box component='form' onSubmit={handleSubmit} noValidate autoComplete='off' id='editPropertyForm'>
            <Grid container columnSpacing={12} rowSpacing={6}>
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 2,
                  }}
                >
                  <IconButton onClick={() => handleScroll("left")} disabled={scrollPosition === 0}>
                    <ArrowBackIosIcon />
                  </IconButton>
                  <Box
                    sx={{
                      display: "flex",
                      overflowX: "auto",
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                      "&::-webkit-scrollbar": {
                        display: "none",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        overflowX: "auto",
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        "&::-webkit-scrollbar": {
                          display: "none",
                        },
                      }}
                    >
                      <ImageList ref={scrollRef} sx={{ display: "flex", flexWrap: "nowrap" }} cols={5}>
                        {selectedImageList?.map((image, index) => (
                          <ImageListItem
                            key={index}
                            sx={{
                              width: "auto",
                              flex: "0 0 auto",
                              border: "1px solid #ccc",
                              margin: "0 2px",
                              position: "relative",
                            }}
                          >
                            <img
                              src={image}
                              alt={`maintenance-${index}`}
                              style={{
                                height: "150px",
                                width: "150px",
                                objectFit: "cover",
                              }}
                            />
                            <Box sx={{ position: "absolute", top: 0, right: 0 }}>
                              <IconButton
                                onClick={() => handleDelete(index)}
                                sx={{
                                  color: deletedIcons[index] ? "red" : "black",
                                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                                  "&:hover": {
                                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                                  },
                                  margin: "2px",
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                            <Box sx={{ position: "absolute", bottom: 0, left: 0 }}>
                              <IconButton
                                onClick={() => handleFavorite(index)}
                                sx={{
                                  color: favoriteIcons[index] ? "red" : "black",
                                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                                  "&:hover": {
                                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                                  },
                                  margin: "2px",
                                }}
                              >
                                {favoriteIcons[index] ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                              </IconButton>
                            </Box>
                          </ImageListItem>
                        ))}
                      </ImageList>
                    </Box>
                  </Box>
                  <IconButton onClick={() => handleScroll("right")}>
                    <ArrowForwardIosIcon />
                  </IconButton>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <ImageUploader
                  selectedImageList={imageState}
                  setSelectedImageList={setImageState}
                  setDeletedImageList={setDeletedImageList}
                  page={"Edit"}
                  setFavImage={setFavImage}
                  favImage={favImage}
                  updateFavoriteIcons={handleUpdateFavoriteIcons}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.mediumFont }}>
                  Address
                </Typography>
                <TextField
                  onChange={(e) => setAddress(e.target.value)}
                  sx={{
                    backgroundColor: "white",
                    borderColor: "black",
                    borderRadius: "7px",
                  }}
                  placeholder={address}
                  value={address}
                  size='small'
                  fullWidth
                />
              </Grid>

              <Grid item xs={6}>
                <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.mediumFont }}>Unit</Typography>
                <TextField
                  onChange={(e) => setUnit(e.target.value)}
                  sx={{
                    backgroundColor: "white",
                    borderColor: "black",
                    borderRadius: "7px",
                  }}
                  placeholder={unit}
                  value={unit}
                  size='small'
                  fullWidth
                />
              </Grid>

              <Grid item xs={6}>
                <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.mediumFont }}>City</Typography>
                <TextField
                  onChange={(e) => setCity(e.target.value)}
                  sx={{
                    backgroundColor: "white",
                    borderColor: "black",
                    borderRadius: "7px",
                  }}
                  size='small'
                  fullWidth
                  placeholder={propertyData.property_city}
                  value={city}
                />
              </Grid>

              <Grid item xs={6}>
                <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.mediumFont }}>State</Typography>
                <Select
                  sx={{
                    backgroundColor: "white",
                    borderColor: "black",
                    borderRadius: "7px",
                  }}
                  size='small'
                  fullWidth
                  onChange={(e) => setPropertyState(e.target.value)}
                  value={propertyState}
                  renderValue={(value) => (value ? `${value}` : "")}
                >
                  {statesList?.map((item) => {
                    return (
                      <MenuItem key={item.list_uid} value={item.list_item}>
                        <li>{item.list_item}</li>
                      </MenuItem>
                    );
                  })}
                </Select>
              </Grid>

              <Grid item xs={6}>
                <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.mediumFont }}>
                  Zip Code
                </Typography>
                <TextField
                  fullWidth
                  sx={{
                    backgroundColor: "white",
                    borderColor: "black",
                    borderRadius: "7px",
                  }}
                  size='small'
                  onChange={(e) => setZip(e.target.value)}
                  value={zip}
                />
              </Grid>

              <Grid item xs={6}>
                <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.mediumFont }}>Type</Typography>
                <Select
                  sx={{
                    backgroundColor: "white",
                    borderColor: "black",
                    borderRadius: "7px",
                  }}
                  size='small'
                  fullWidth
                  onChange={(e) => setPropertyType(e.target.value)}
                  value={propertyType}
                >
                  {propertyTypes?.map((type) => (
                    <MenuItem key={type.list_uid} value={type.list_item}>
                      {type.list_item}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>

              <Grid item xs={6}>
                <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.mediumFont }}>
                  Square Footage
                </Typography>
                <TextField
                  fullWidth
                  sx={{
                    backgroundColor: "white",
                    borderColor: "black",
                    borderRadius: "7px",
                  }}
                  size='small'
                  placeholder={squareFootage.toString()}
                  onChange={(e) => setSquareFootage(e.target.value)}
                  value={squareFootage}
                />
              </Grid>

              <Grid item xs={6}>
                <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.mediumFont }}>
                  Bedrooms
                </Typography>
                <TextField
                  fullWidth
                  sx={{
                    backgroundColor: "white",
                    borderColor: "black",
                    borderRadius: "7px",
                  }}
                  size='small'
                  placeholder={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  value={bedrooms}
                />
              </Grid>

              <Grid item xs={6}>
                <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.mediumFont }}>
                  Bathrooms
                </Typography>
                <TextField
                  fullWidth
                  sx={{
                    backgroundColor: "white",
                    borderColor: "black",
                    borderRadius: "7px",
                  }}
                  size='small'
                  placeholder={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  value={bathrooms}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.mediumFont }}>
                  Owner Notes
                </Typography>
                <TextField
                  fullWidth
                  sx={{
                    backgroundColor: "white",
                    borderColor: "black",
                    borderRadius: "7px",
                  }}
                  size='small'
                  multiline={true}
                  placeholder={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  value={notes}
                />
              </Grid>
              <Grid item xs={12}>
                {selectedRole === "MANAGER" || selectedRole === "OWNER" ? (
                  <Stack direction='column' justifyContent='left' padding='15px' width='85%'>
                    <FormControlLabel control={<Checkbox checked={isListed} onChange={handleListedChange} />} label='Available to rent' />
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
            // margin: "30px",
            // padding: theme.spacing(2),
            // backgroundColor: theme.palette.form.main,
            // width: "85%", // Occupy full width with 25px margins on each side
            // [theme.breakpoints.down("sm")]: {
            //   width: "80%",
            // },
            // [theme.breakpoints.up("sm")]: {
            //   width: "50%",
            // },
            // paddingTop: "10px",
            marginTop: "15px",
            // padding: theme.spacing(2),
            backgroundColor: theme.palette.form.main,
            width: "80%",
            // [theme.breakpoints.down("sm")]: {
            //   width: "80%",
            // },
            // [theme.breakpoints.up("sm")]: {
            //   width: "50%",
            // },
            // paddingTop: "10px",
            padding: "25px",
          }}
        >
          <Stack
            direction='column'
            justifyContent='center'
            alignItems='center'
            // padding='25px'
            sx={{
              display: "flex",
            }}
          >
            <Box
              sx={{
                display: "flex",
              }}
            >
              <Grid container columnSpacing={12} rowSpacing={6}>
                <Grid item xs={12}>
                  <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.mediumFont }}>
                    Active Date
                  </Typography>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          fullWidth
          sx={{
            backgroundColor: "white",
            borderColor: "black",
            borderRadius: "7px",
          }}
          size='small'
          value={activeDate}
          onChange={(newDate) => setActiveDate(newDate)} // This will update the state with the selected date
          renderInput={(params) => <TextField {...params} />}
        />
      </LocalizationProvider>
                </Grid>
                <Grid item xs={6}>
                  <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.mediumFont }}>
                    Deposit
                  </Typography>
                  <TextField
                    fullWidth
                    sx={{
                      backgroundColor: "white",
                      borderColor: "black",
                      borderRadius: "7px",
                    }}
                    size='small'
                    InputProps={{
                      startAdornment: <InputAdornment position='start'>$</InputAdornment>,
                    }}
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.mediumFont }}>Rent</Typography>
                  <TextField
                    fullWidth
                    sx={{
                      backgroundColor: "white",
                      borderColor: "black",
                      borderRadius: "7px",
                    }}
                    size='small'
                    InputProps={{
                      startAdornment: <InputAdornment position='start'>$</InputAdornment>,
                    }}
                    onChange={(e) => setRent(e.target.value)}
                    value={rent}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.mediumFont }}>
                    Deposit for Last Month's Rent
                  </Typography>
                  <Checkbox checked={depositForRent} onChange={(e) => setDepositForRent(e.target.checked)} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.mediumFont }}>
                    Pets Allowed
                  </Typography>
                  <Checkbox checked={petsAllowed} onChange={(e) => setPetsAllowed(e.target.checked)} />
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </Paper>

        <Paper
          style={{
            // margin: "30px",
            // padding: theme.spacing(2),
            // backgroundColor: theme.palette.form.main,
            // width: "85%", // Occupy full width with 25px margins on each side
            // [theme.breakpoints.down("sm")]: {
            //   width: "80%",
            // },
            // [theme.breakpoints.up("sm")]: {
            //   width: "50%",
            // },
            // paddingTop: "10px",
            marginTop: "15px",
            // padding: theme.spacing(2),
            backgroundColor: theme.palette.form.main,
            width: "80%",
            // [theme.breakpoints.down("sm")]: {
            //   width: "80%",
            // },
            // [theme.breakpoints.up("sm")]: {
            //   width: "50%",
            // },
            // paddingTop: "10px",
            padding: "25px",
          }}
        >
          <Stack
            direction='column'
            justifyContent='left'
            alignItems='left'
            // padding='25px'
            sx={{
              display: "flex",
            }}
          >
            <Box
              sx={{
                display: "flex",
                paddingBottom: "20px",
              }}
              noValidate
              autoComplete='off'
            >
              {/* {//console.log("MAPPED UTILITIES PAID BY", mappedUtilitiesPaidBy)} */}
              {/* <UtilitySelection existingSelection={mappedUtilitiesPaidBy} onChangeUtilities={handleUtilityChange}/> */}

              <Grid container columnSpacing={2} rowSpacing={3}>
                <Grid item xs={12}>
                  <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}>
                    Utilities Paid by
                  </Typography>
                </Grid>
                {/* {isDefaultUtilities && (
                  <Grid item xs={12}>
                    <Typography sx={{ fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.smallFont }}>{`<--Displaying Default Utilities-->`}</Typography>
                  </Grid>
                )} */}
                {Object.entries(mappedUtilitiesPaidBy).length > 0
                  && Object.entries(mappedUtilitiesPaidBy).map(([utility, selectedValue]) => (
                      <Fragment key={utility}>
                        <Grid item xs={5}>
                          <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.mediumFont }}>
                            {formatUtilityName(utility)}
                          </Typography>
                        </Grid>
                        <Grid item xs={7}>
                          <FormControlLabel
                            value='owner'
                            control={<Radio checked={selectedValue === "owner"} onChange={() => handleUtilityChange(utility, "owner")} />}
                            label='Owner'
                          />
                          <FormControlLabel
                            value='tenant'
                            control={<Radio checked={selectedValue === "tenant"} onChange={() => handleUtilityChange(utility, "tenant")} />}
                            label='Tenant'
                          />
                        </Grid>
                      </Fragment>
                    ))
                  }
                  
              </Grid>
            </Box>
            <Grid item xs={12}>
              <Button
                variant='outlined'
                onClick={handleAddUtilityButtonClick}
                sx={{
                  backgroundColor: "#3D5CAC",
                  fontWeight: theme.typography.primary.fontWeight,
                  fontSize: theme.typography.smallFont,
                  textTransform: "none",
                }}
              >
                Add Utility <ArrowDropDownIcon />
              </Button>
              <Menu anchorEl={addUtilityAnchorElement} open={Boolean(addUtilityAnchorElement)} onClose={handleAddUtilityClose}>
                {keysNotInUtilitiesMap.map((utility, index) => (
                  <MenuItem key={index} onClick={() => handleAddUtility(utility)}>
                    {formatUtilityName(utility)}
                  </MenuItem>
                ))}
              </Menu>
            </Grid>
          </Stack>
        </Paper>

        <Paper
          style={{
            // margin: "30px",
            // padding: theme.spacing(2),
            // backgroundColor: theme.palette.form.main,
            // width: "85%", // Occupy full width with 25px margins on each side
            // [theme.breakpoints.down("sm")]: {
            //   width: "80%",
            // },
            // [theme.breakpoints.up("sm")]: {
            //   width: "50%",
            // },
            // paddingTop: "10px",
            marginTop: "15px",
            // padding: theme.spacing(2),
            backgroundColor: theme.palette.form.main,
            width: "80%",
            // [theme.breakpoints.down("sm")]: {
            //   width: "80%",
            // },
            // [theme.breakpoints.up("sm")]: {
            //   width: "50%",
            // },
            // paddingTop: "10px",
            padding: "25px",
          }}
        >
          <Stack
            direction='column'
            justifyContent='left'
            alignItems='left'
            // padding='25px'
            sx={{
              display: "flex",
            }}
          >
            <Box
              component='form'
              sx={{
                display: "flex",
              }}
              noValidate
              autoComplete='off'
            >
              <Grid container columnSpacing={12} rowSpacing={6}>
                <Grid item xs={12}>
                  <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}>
                    Property Description
                  </Typography>
                  <TextField
                    fullWidth
                    sx={{
                      backgroundColor: "white",
                      borderColor: "black",
                      borderRadius: "7px",
                    }}
                    size='small'
                    multiline={true}
                    placeholder={description}
                    onChange={(e) => setDescription(e.target.value)}
                    value={description}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}>
                    Community Amenities
                  </Typography>
                  <TextField
                    fullWidth
                    sx={{
                      backgroundColor: "white",
                      borderColor: "black",
                      borderRadius: "7px",
                    }}
                    size='small'
                    multiline={true}
                    placeholder={communityAmenities}
                    onChange={(e) => setCommunityAmenities(e.target.value)}
                    value={communityAmenities}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}>
                    Apartment Amenities
                  </Typography>
                  <TextField
                    fullWidth
                    sx={{
                      backgroundColor: "white",
                      borderColor: "black",
                      borderRadius: "7px",
                    }}
                    size='small'
                    multiline={true}
                    placeholder={apartmentAmenities}
                    onChange={(e) => setApartmentAmenities(e.target.value)}
                    value={apartmentAmenities}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}>
                    Near By Amenities
                  </Typography>
                  <TextField
                    fullWidth
                    sx={{
                      backgroundColor: "white",
                      borderColor: "black",
                      borderRadius: "7px",
                    }}
                    size='small'
                    multiline={true}
                    placeholder={nearbyAmenities}
                    onChange={(e) => setNearbyAmenities(e.target.value)}
                    value={nearbyAmenities}
                  />
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </Paper>
        <Stack
          direction='column'
          justifyContent='center'
          alignItems='center'
          sx={{
            display: "flex",
            marginTop: "15px",
          }}
        >
          <Box
            sx={{
              marginBottom: "30px",
              width: "100%",
              paddingBottom: "30px",
            }}
          >
            <Grid container>
              <Grid item xs={12}>
                <Button variant='contained' type='submit' form='editPropertyForm' sx={{ width: "100%", backgroundColor: '#3D5CAC' }}>
                  <Typography sx={{ color: "#FFFFFF", fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.mediumFont }}>
                    {propertyData.property_available_to_rent !== 1 ? "Create Listing" : "Update Listing"}
                  </Typography>
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </Stack>
    </ThemeProvider>
  );
}
