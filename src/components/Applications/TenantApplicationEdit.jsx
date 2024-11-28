import React, { useEffect, useState, useRef, useContext } from "react";
import {
  ThemeProvider,
  Box,
  Paper,
  Typography,
  Grid,
  Snackbar,
  Alert,
  AlertTitle,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
  Divider,
  Button,
} from "@mui/material";
import theme from "../../theme/theme";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import APIConfig from "../../utils/APIConfig";
import AdultOccupant from "../Leases/AdultOccupant";
import ChildrenOccupant from "../Leases/ChildrenOccupant";
import PetsOccupant from "../Leases/PetsOccupant";
import VehiclesOccupant from "../Leases/VehiclesOccupant";
import Documents from "../Leases/Documents";
import axios from "axios";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { useUser } from "../../contexts/UserContext";
import CloseIcon from "@mui/icons-material/Close";
import ListsContext from "../../contexts/ListsContext";
import CryptoJS from "crypto-js";
import AES from "crypto-js/aes";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import GenericDialog from "../GenericDialog";
import { json, Navigate } from "react-router-dom";

export default function TenantApplicationEdit(props) {
  const { getList } = useContext(ListsContext);
//   console.log("44 - props", props);
  console.log("ROHIT - 45 - props.status", props.status);
  // const [adults, setAdults] = useState(adultOccupants? adultOccupants : []);
  // const [children, setChildren] = useState(childOccupants? childOccupants : []);
  // const [pets, setPets] = useState(petOccupants? petOccupants : []);
  // const [vehicles, setVehicles] = useState(oldVehicles ? oldVehicles : []);
  // const [documents, setDocuments] = useState(tenantDocumentsa? tenantDocumentsa : []);
  const [vehicles, setVehicles] = useState(null);
  const [adultOccupants, setAdultOccupants] = useState(null);
  const [petOccupants, setPetOccupants] = useState(null);
  const [childOccupants, setChildOccupants] = useState(null);
  const documentsRef = useRef([]);
  // const [uploadedFiles, setuploadedFiles] = useState(extraUploadDocument? extraUploadDocument : []);
  // const [uploadedFileTypes, setUploadedFileTypes] = useState(extraUploadDocumentType? extraUploadDocumentType : []);
  const [extraUploadDocument, setExtraUploadDocument] = useState([]);
  const [extraUploadDocumentType, setExtraUploadDocumentType] = useState([]);
  // const [deletedFiles, setDeletedFiles] = useState(deleteDocuments? deleteDocuments : []);
  const [relationships, setRelationships] = useState([]);
  const [states, setStates] = useState([]);
  const [property, setProperty] = useState([]);
  const [status, setStatus] = useState("");
  const [lease, setLease] = useState([]);
  const [tenantProfile, setTenantProfile] = useState(null);
  const [formattedAddress, setFormattedAddress] = useState("");
  const [deleteDocuments, setDeleteDocuments] = useState([]);
  const [tenantDocuments, setTenantDocuments] = useState([]);
  const [isEmployeChange, setIsEmployeChange] = useState(false);

  const [modifiedData, setModifiedData] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogSeverity, setDialogSeverity] = useState("info");

  const [showSpinner, setShowSpinner] = useState(false);
  // const [lease, setLease] = useState([]);
  const { user, getProfileId, roleName } = useUser();
  const [isReload, setIsReload] = useState(false);
  const [isPreviousFileChange, setIsPreviousFileChange] = useState(false);
  const [occupantsExpanded, setOccupantsExpanded] = useState(true);
  const [employmentExpanded, setEmploymentExpanded] = useState(true);
  const [documentsExpanded, setDocumentsExpanded] = useState(true);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [propertyUtilities, setPropertyUtilities] = useState([]);

  const [employmentData, setEmploymentData] = useState([]);
  
//   useEffect(() => {
//     console.log("74 - lease - ", lease);
//   }, [lease]);

  // const getListDetails = async () => {
  //     try {
  //         const response = await fetch(`${APIConfig.baseURL.dev}/lists`);
  //         if (!response.ok) {
  //             console.log("Error fetching lists data");
  //         }
  //         const responseJson = await response.json();
  //         const relationships = responseJson.result.filter((res) => res.list_category === "relationships");
  //         const states = responseJson.result.filter((res) => res.list_category === "states");
  //         setRelationships(relationships);
  //         setStates(states);
  //     } catch (error) {
  //         console.log(error);
  //     }
  // };

  // const setProfileData = async () => {
  //     setShowSpinner(true);
  //     try {
  //         if (lease_uid) {
  //             axios.get(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/leaseDetails/${getProfileId()}`)
  //                 .then((response) => {
  //                     const fetchData = response.data["Lease_Details"].result;
  //                     const leaseData = fetchData.filter((lease) => lease.lease_uid === lease_uid)
  //                     setLease(leaseData);
  //                     setAdults(JSON.parse(leaseData[0].lease_adults) || []);
  //                     setChildren(JSON.parse(leaseData[0].lease_children) || []);
  //                     setPets(JSON.parse(leaseData[0].lease_pets) || []);
  //                     setVehicles(JSON.parse(leaseData[0].lease_vehicles) || []);

  //                     const parsedDocs = JSON.parse(leaseData[0].lease_documents);
  //                     const docs = parsedDocs
  //                         ? parsedDocs.map((doc, index) => ({
  //                             ...doc,
  //                             id: index,
  //                         }))
  //                         : [];
  //                     setDocuments(docs);
  //                     documentsRef.current = parsedDocs;
  //                     setShowSpinner(false);
  //                 })
  //         } else {
  //             const profileResponse = await axios.get(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/profile/${getProfileId()}`);
  //             const profileData = profileResponse.data.profile.result[0];
  //             setAdults(profileData && profileData.tenant_adult_occupants ? JSON.parse(profileData.tenant_adult_occupants) : []);
  //             setChildren(profileData && profileData.tenant_children_occupants ? JSON.parse(profileData.tenant_children_occupants) : []);
  //             setPets(profileData && profileData.tenant_pet_occupants ? JSON.parse(profileData.tenant_pet_occupants) : []);
  //             setVehicles(profileData && profileData.tenant_vehicle_info ? JSON.parse(profileData.tenant_vehicle_info) : []);

  //             const parsedDocs = profileData && profileData.tenant_documents ? JSON.parse(profileData.tenant_documents) : [];
  //             const docs = parsedDocs
  //                 ? parsedDocs.map((doc, index) => ({
  //                     ...doc,
  //                     id: index,
  //                 }))
  //                 : [];
  //             setDocuments(docs);
  //             documentsRef.current = parsedDocs;
  //             setShowSpinner(false);
  //         }
  //     } catch (error) {
  //         console.error("Error fetching profile data:", error);
  //         setShowSpinner(false);
  //     }
  // };

  const openDialog = (title, message, severity) => {
    setDialogTitle(title); // Set custom title
    setDialogMessage(message); // Set custom message
    setDialogSeverity(severity); // Can use this if needed to control styles
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  // useEffect(() => {
  //     // getListDetails();
  //     const docs = tenantDocuments? tenantDocuments.map((doc, index) => ({
  //                     ...doc,
  //                     id: index,
  //                 }))
  //                 : [];
  //     setDocuments(docs);
  //     documentsRef.current = tenantDocuments;

  // }, []);

  function formatAddress() {
    return `${props.data.property_address} ${props.data.property_unit} ${props.data.property_city} ${props.data.property_state} ${props.data.property_zip}`;
  }

  function formatTenantVehicleInfo() {
    // if (
    //       lease.length === 0 ||
    //       ((lease[0].lease_status === "ACTIVE" || lease[0].lease_status === "ACTIVE M2M") &&
    //         (lease[0].lease_renew_status !== "RENEW REQUESTED" || lease[0].lease_renew_status !== "PM RENEW REQUESTED"))
    //     )

    if (lease.length === 0 || lease[0].lease_status === "ACTIVE" || lease[0].lease_status === "ACTIVE M2M") {
      let info = tenantProfile && tenantProfile.tenant_vehicle_info ? JSON.parse(tenantProfile.tenant_vehicle_info) : [];
      setVehicles(info);
    } else {
      let info = JSON.parse(lease[0].lease_vehicles);
      setVehicles(info);
      // for (const vehicle of info){
      //     console.log(vehicle)
      // }
    }
    // let info = tenantProfile && tenantProfile.tenant_vehicle_info ? JSON.parse(tenantProfile.tenant_vehicle_info) : [];
    // setVehicles(info);
  }

  function formatTenantAdultOccupants() {
    if (lease.length === 0 || lease[0].lease_status === "ACTIVE" || lease[0].lease_status === "ACTIVE M2M") {
      let info = tenantProfile && tenantProfile.tenant_adult_occupants ? JSON.parse(tenantProfile.tenant_adult_occupants) : [];
      setAdultOccupants(info);
    } else {
      // console.log(tenantProfile?.tenant_adult_occupants)
      let info = JSON.parse(lease[0].lease_adults);
      setAdultOccupants(info);
      // for (const occupant of info){
      //     console.log(occupant)
      // }
    }
    // let info = tenantProfile && tenantProfile.tenant_adult_occupants ? JSON.parse(tenantProfile.tenant_adult_occupants) : [];
    // setAdultOccupants(info);
  }

  function formatTenantPetOccupants() {
    if (lease.length === 0 || lease[0].lease_status === "ACTIVE" || lease[0].lease_status === "ACTIVE M2M") {
      let info = tenantProfile && tenantProfile.tenant_pet_occupants ? JSON.parse(tenantProfile.tenant_pet_occupants) : [];
      setPetOccupants(info);
    } else {
      let info = JSON.parse(lease[0].lease_pets);
      setPetOccupants(info);
      // for (const pet of info){
      //     console.log(pet)
      // }
    }
    // let info = tenantProfile && tenantProfile.tenant_pet_occupants ? JSON.parse(tenantProfile.tenant_pet_occupants) : [];
    // setPetOccupants(info);
  }

  function formatTenantChildOccupants() {
    if (lease.length === 0 || lease[0].lease_status === "ACTIVE" || lease[0].lease_status === "ACTIVE M2M") {
      let info = tenantProfile && tenantProfile.tenant_children_occupants ? JSON.parse(tenantProfile.tenant_children_occupants) : [];
      setChildOccupants(info);
    } else {
      let info = JSON.parse(lease[0].lease_children);
      setChildOccupants(info);
      // for (const child of info){
      //     console.log(child)
      // }
    }
    // let info = tenantProfile && tenantProfile.tenant_children_occupants ? JSON.parse(tenantProfile.tenant_children_occupants) : [];
    // setChildOccupants(info);
  }

  function formatTenantEmployment() {
    // let info = tenantProfile && tenantProfile.tenant_children_occupants ? JSON.parse(tenantProfile.tenant_children_occupants) : [];
    // setChildOccupants(info);
    let info = [];
    if (lease.length === 0 || lease[0].lease_status === "ACTIVE" || lease[0].lease_status === "ACTIVE M2M") {
      info = tenantProfile && tenantProfile.tenant_employment ? JSON.parse(tenantProfile.tenant_employment) : [];
    } else {
      info = lease[0]?.lease_income ? JSON.parse(lease[0].lease_income) : [];
    }
    console.log("ROHIT - 263 - lease - ", lease);
    console.log("ROHIT - 263 - info - ", info);
    setEmploymentData(info);
  }

  useEffect(() => {
    console.log("fetch from lease endpoint");
    const fetchData = async () => {
      try {
        setShowSpinner(true); // Start the spinner before loading data

        // Fetch lease details asynchronously
        const leaseResponse = await axios.get(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/leaseDetails/${getProfileId()}`);

        const fetchedLease = leaseResponse.data["Lease_Details"].result.filter((lease) => lease.lease_uid === props.lease.lease_uid);

        console.log("fetched lease - ", fetchedLease);
        setLease(fetchedLease);

        // Fetch tenant profile information asynchronously
        const profileResponse = await fetch(`${APIConfig.baseURL.dev}/profile/${getProfileId()}`);
        const profileData = await profileResponse.json();
        setTenantProfile(profileData.profile.result[0]);

        // Set other properties after all data is fetched
        console.log("property data --- ", props.data);
        console.log("listing data --- ", props.listingsData);
        // const utilities = JSON.parse(props.data?.property_utilities).length > 0 ? JSON.parse(props.data?.property_utilities) : []
        const currentPropertyListing = props?.listingsData?.find((listing) => listing.property_uid === props.data.property_uid); // listing data for the current property
        // console.log("247 - currentPropertyListing - ", currentPropertyListing);
        let utilities = [];
        if (currentPropertyListing != null && currentPropertyListing.property_utilities != null) {
          utilities = JSON.parse(currentPropertyListing.property_utilities);
        }

        // Dhyey Code
        // let utilities;
        // if(props.from === "PropertyInfo"){
        //     utilities = JSON.parse(props.data?.property_utilities).length > 0 ? JSON.parse(props.data?.property_utilities) : []
        // }else{
        //     utilities = JSON.parse(props.data?.lease_utilities).length > 0 ? JSON.parse(props.data?.lease_utilities) : []
        // }

        setPropertyUtilities(utilities);
        setProperty(props.data);
        setStatus(props.status);

        // Format and set address
        const address = formatAddress();
        setFormattedAddress(address);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setShowSpinner(false); // Stop the spinner after all data is loaded
      }
    };

    fetchData();
  }, [props.data, props.reload]);

  useEffect(() => {
    // console.log("calling profileData useEffect");

    // setIsSave(false);
    // setProfileData();
    setShowSpinner(true);
    const getTenantProfileInformation = async () => {
      const response = await fetch(`${APIConfig.baseURL.dev}/profile/${getProfileId()}`);
      const data = await response.json();
      const tenantProfileData = data.profile.result[0];
      setTenantProfile(tenantProfileData);
      console.log("tenantProfileData", tenantProfileData);
    };
    getTenantProfileInformation();

    getListDetails();

    setShowSpinner(false);
  }, []);

  useEffect(() => {
    // console.log("---dhyey--- props data for property - ", lease)
    setShowSpinner(true);

    if (props?.vehicles) {
      setVehicles(props.vehicles);
    } else {
      formatTenantVehicleInfo();
    }

    if (props?.adultOccupants) {
      setAdultOccupants(props.adultOccupants);
    } else {
      formatTenantAdultOccupants();
    }

    if (props?.petOccupants) {
      setPetOccupants(props.petOccupants);
    } else {
      formatTenantPetOccupants();
    }

    if (props?.childOccupants) {
      setChildOccupants(props.childOccupants);
    } else {
      formatTenantChildOccupants();
    }

    if (props?.extraUploadDocument) {
      setExtraUploadDocument(props.extraUploadDocument);
    }

    if (props?.extraUploadDocumentType) {
      setExtraUploadDocumentType(props.extraUploadDocumentType);
    }

    if (props?.deleteDocuments) {
      setDeleteDocuments(props.deleteDocuments);
    }

    formatTenantEmployment();

    if (props?.tenantDocuments) {
      setTenantDocuments(props.tenantDocuments);
    } else {
      if (lease.length === 0 || lease[0].lease_status === "ACTIVE" || lease[0].lease_status === "ACTIVE M2M") {
        setTenantDocuments(tenantProfile ? JSON.parse(tenantProfile.tenant_documents) : []);
      } else {
        setTenantDocuments(lease && lease.length > 0 ? JSON.parse(lease[0]?.lease_documents) : []);
      }
      //   setTenantDocuments(tenantProfile ? JSON.parse(tenantProfile.tenant_documents) : []);
    }

    setShowSpinner(false);
  }, [lease, tenantProfile]);

  const editOrUpdateLease = async () => {
    // console.log('--dhyey-- inside edit lease - ', modifiedData);
    try {
      if (modifiedData.length > 0) {
        setShowSpinner(true);
        // const headers = {
        //     "Access-Control-Allow-Origin": "*",
        //     "Access-Control-Allow-Methods": "*",
        //     "Access-Control-Allow-Headers": "*",
        //     "Access-Control-Allow-Credentials": "*",
        // };

        // const leaseApplicationFormData = new FormData();

        // Now set pets, adult, document, children all fields if they change

        modifiedData.forEach((item) => {
          // console.log(`Key: ${item.key}`);
          // if (item.key === "uploadedFiles") {
          //     console.log('uploadedFiles', item.value);
          //     if (item.value.length) {
          //         // const documentsDetails = [];
          //         // [...item.value].forEach((file, i) => {
          //         //     leaseApplicationFormData.append(`file_${i}`, file.file, file.name);
          //         //     const fileType = 'pdf';
          //         //     const documentObject = {
          //         //         // file: file,
          //         //         fileIndex: i,
          //         //         fileName: file.name,
          //         //         contentType: file.contentType,
          //         //         // type: file.type,
          //         //     };
          //         //     documentsDetails.push(documentObject);
          //         // });
          //         // leaseApplicationFormData.append("lease_documents_details", JSON.stringify(documentsDetails));
          //         setExtraUploadDocument(item.value)
          //     }
          // }

          if (item.key === "lease_adults") {
            setAdultOccupants(item.value);
            // setAdults(item.value)
          }

          if (item.key === "lease_children") {
            setChildOccupants(item.value);
            // setChildren(item.value)
          }

          if (item.key === "lease_pets") {
            setPetOccupants(item.value);
            // setPets(item.value)
          }

          if (item.key === "lease_vehicles") {
            setVehicles(item.value);
            // setOldVehicles(item.value)
          }

          // if(item.key === "lease_documents"){
          //     setTenantDocuments(item.value)
          //     setDocuments(item.value)
          // }
        });
        // leaseApplicationFormData.append('lease_uid', lease[0].lease_uid); // Here is the problem when upload new docs because there is no lease right now and it require lease_uid

        // axios.put('https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/leaseApplication', leaseApplicationFormData, headers)
        //     .then((response) => {
        //         console.log('Data updated successfullyyy', response);
        //         showSnackbar("Your lease application has been successfully updated.", "success");
        //         setIsReload((prev) => !prev);
        //         setShowSpinner(false);
        //     })
        //     .catch((error) => {
        //         setShowSpinner(false);
        //         showSnackbar("Cannot update the lease application. Please try again", "error");
        //         if (error.response) {
        //             console.log(error.response.data);
        //         }
        //     });
        setShowSpinner(false);
        setModifiedData([]);
      } else {
        // showSnackbar("You haven't made any changes to the form. Please save after changing the data.", "error");
        openDialog("Error", `You haven't made any changes to the form. Please save after changing the data.`, "error");
      }
    } catch (error) {
      // showSnackbar("Cannot update the lease application. Please try again", "error");
      openDialog("Error", `Cannot update the lease application. Please try again`, "error");
      console.log("Cannot Update the lease application", error);
      setShowSpinner(false);
    }
  };

  // const editOrUpdateTenant = async () => {
  //     console.log("inside editOrUpdateTenant", modifiedData);
  //     try {
  //         if (modifiedData.length > 0) {
  //             setShowSpinner(true);
  //             const headers = {
  //                 "Access-Control-Allow-Origin": "*",
  //                 "Access-Control-Allow-Methods": "*",
  //                 "Access-Control-Allow-Headers": "*",
  //                 "Access-Control-Allow-Credentials": "*",
  //             };

  //             const profileFormData = new FormData();

  //             modifiedData.forEach((item) => {
  //                 console.log(`Key: ${item.key}`);
  //                 if (item.key === "uploadedFiles") {
  //                     console.log("uploadedFiles", item.value);
  //                     if (item.value.length) {
  //                         const documentsDetails = [];
  //                         [...item.value].forEach((file, i) => {
  //                             profileFormData.append(`file_${i}`, file.file, file.name);
  //                             const fileType = "pdf";
  //                             const documentObject = {
  //                                 // file: file,
  //                                 fileIndex: i,
  //                                 fileName: file.name,
  //                                 contentType: file.contentType,
  //                                 // type: file.type,
  //                             };
  //                             documentsDetails.push(documentObject);
  //                         });
  //                         profileFormData.append("tenant_documents_details", JSON.stringify(documentsDetails));
  //                     }
  //                 } else {
  //                     profileFormData.append(item.key, JSON.stringify(item.value));
  //                 }
  //             });
  //             profileFormData.append("tenant_uid", profileData.tenant_uid);

  //             axios
  //                 .put("https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/profile", profileFormData, headers)
  //                 .then((response) => {
  //                     console.log("Data updated successfully", response);
  //                     showSnackbar("Your profile has been successfully updated.", "success");
  //                     setIsReload((prev) => !prev);
  //                     setShowSpinner(false);
  //                 })
  //                 .catch((error) => {
  //                     setShowSpinner(false);
  //                     showSnackbar("Cannot update your profile. Please try again", "error");
  //                     if (error.response) {
  //                         console.log(error.response.data);
  //                     }
  //                 });
  //             setShowSpinner(false);
  //             setModifiedData([]);
  //         } else {
  //             showSnackbar("You haven't made any changes to the form. Please save after changing the data.", "error");
  //         }
  //     } catch (error) {
  //         showSnackbar("Cannot update the lease!!. Please try again", "error");
  //         console.log("Cannot Update the lease", error);
  //         setShowSpinner(false);
  //     }
  // };

  const checkIsEqual = (arr1, arr2) => {
    if (arr1.length !== arr2.length) {
      return false;
    }
    return JSON.stringify(arr1) === JSON.stringify(arr2);
  };

  const updateLeaseData = async () => {
    try {
      if (
        !checkIsEqual(adultOccupants, JSON.parse(lease[0].lease_adults)) ||
        !checkIsEqual(petOccupants, JSON.parse(lease[0].lease_pets)) ||
        !checkIsEqual(childOccupants, JSON.parse(lease[0].lease_children)) ||
        !checkIsEqual(vehicles, JSON.parse(lease[0].lease_vehicles)) ||
        isPreviousFileChange ||
        deleteDocuments?.length > 0 ||
        extraUploadDocument?.length > 0 ||
        isEmployeChange
      ) {
        setShowSpinner(true);
        const headers = {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "*",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Credentials": "*",
        };

        const leaseApplicationFormData = new FormData();

        // Now set pets, adult, document, children all fields if they change
        // console.log("526 - status - ", status);

        if (status === "PROCESSING") {
          leaseApplicationFormData.append("lease_status", "NEW");
        } else if (status === "RENEW PROCESSING") {
          leaseApplicationFormData.append("lease_status", "RENEW NEW");
        }

        // modifiedData.forEach(item => {
        //     // console.log(`Key: ${item.key}`);
        //     // if (item.key === "uploadedFiles") {
        //     //     console.log('uploadedFiles', item.value);
        //     //     if (item.value.length) {
        //     //         // const documentsDetails = [];
        //     //         // [...item.value].forEach((file, i) => {
        //     //         //     leaseApplicationFormData.append(`file_${i}`, file.file, file.name);
        //     //         //     const fileType = 'pdf';
        //     //         //     const documentObject = {
        //     //         //         // file: file,
        //     //         //         fileIndex: i,
        //     //         //         fileName: file.name,
        //     //         //         contentType: file.contentType,
        //     //         //         // type: file.type,
        //     //         //     };
        //     //         //     documentsDetails.push(documentObject);
        //     //         // });
        //     //         // leaseApplicationFormData.append("lease_documents_details", JSON.stringify(documentsDetails));
        //     //         setExtraUploadDocument(item.value)
        //     //     }
        //     // }

        //     if(item.key === "lease_adults"){
        //         setAdultOccupants(item.value)
        //         setAdults(item.value)
        //     }

        //     if(item.key === "lease_children" ){
        //         setChildOccupants(item.value)
        //         setChildren(item.value)
        //     }

        //     if(item.key === "lease_pets"){
        //         setPetOccupants(item.value)
        //         setPets(item.value)
        //     }

        //     if(item.key === "lease_vehicles"){
        //         setOldVehicles(item.value)
        //         setVehicles(item.value)
        //     }

        //     // if(item.key === "lease_documents"){
        //     //     setTenantDocuments(item.value)
        //     //     setDocuments(item.value)
        //     // }
        // });

        if (isPreviousFileChange) {
          leaseApplicationFormData.append("lease_documents", JSON.stringify(tenantDocuments));
        }

        if (deleteDocuments && deleteDocuments?.length !== 0) {
          leaseApplicationFormData.append("delete_documents", JSON.stringify(deleteDocuments));
        }

        if (extraUploadDocument && extraUploadDocument?.length) {
          const documentsDetails = [];
          [...extraUploadDocument].forEach((file, i) => {
            leaseApplicationFormData.append(`file_${i}`, file);
            const fileType = extraUploadDocumentType[i] || "";
            const documentObject = {
              // file: file,
              fileIndex: i, //may not need fileIndex - will files be appended in the same order?
              fileName: file.name, //may not need filename
              contentType: fileType, // contentType = "contract or lease",  fileType = "pdf, doc"
            };
            documentsDetails.push(documentObject);
          });

          leaseApplicationFormData.append("lease_documents_details", JSON.stringify(documentsDetails));
        }

        leaseApplicationFormData.append("lease_adults", JSON.stringify(adultOccupants));
        leaseApplicationFormData.append("lease_children", JSON.stringify(childOccupants));
        leaseApplicationFormData.append("lease_pets", JSON.stringify(petOccupants));
        leaseApplicationFormData.append("lease_vehicles", JSON.stringify(vehicles));

        // console.log("selected jobs", selectedJobs);

        if (selectedJobs?.length > 0) {
          // console.log(JSON.stringify(selectedJobs));
          leaseApplicationFormData.append("lease_income", JSON.stringify(selectedJobs));
        } else if (selectedJobs?.length === 0 && JSON.parse(lease[0]?.lease_income).length > 0) {
          leaseApplicationFormData.append("lease_income", JSON.stringify(selectedJobs));
        }

        // console.log(lease_uid)
        leaseApplicationFormData.append("lease_uid", lease[0].lease_uid); // Here is the problem when upload new docs because there is no lease right now and it require lease_uid

        axios
          .put("https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/leaseApplication", leaseApplicationFormData, headers)
          .then((response) => {
            // console.log('Data updated successfullyyy', response);
            // showSnackbar("Your lease application has been successfully updated.", "success");
            openDialog("Success", `Your lease application has been successfully updated`, "success");
            setShowSpinner(false);
            // setIsReload((prev) => !prev);

            if (props.from === "PropertyInfo") {
              props.setRightPane({ type: "listings" });
              // props.setReload((prev) => !prev);
            } else {
              // props.setRightPane("");
              // props.setReload((prev) => !prev);
            }

            // console.log("--DEBUG--- ")
            props.setReload((prev) => !prev);
            // Navigate("/tenantDashboard")
          })
          .catch((error) => {
            setShowSpinner(false);
            // showSnackbar("Cannot update the lease application. Please try again", "error");
            openDialog("Error", `Cannot update the lease application. Please try again`, "error");
            if (error.response) {
              console.log(error.response.data);
            }
          });
        setShowSpinner(false);
        setIsEmployeChange(false);
        setModifiedData([]);
        setExtraUploadDocument([]);
        setExtraUploadDocumentType([]);
        setDeleteDocuments([]);
      } else {
        // showSnackbar("You haven't made any changes to the form. Please save after changing the data.", "error");
        openDialog("Error", `You haven't made any changes to the form. Please save after changing the data.`, "error");
      }
    } catch (error) {
      // showSnackbar("Cannot update the lease application. Please try again", "error");
      openDialog("Error", `Cannot update the lease application. Please try again`, "error");
      console.log("Cannot Update the lease application", error);
      setShowSpinner(false);
    }
  };

  const handleCloseButton = (e) => {
    e.preventDefault();
    if (lease[0].lease_uid !== null) {
      updateLeaseData().then(() => {
        const updatedState = {
          data: property,
          status: lease[0].lease_uid === null ? "" : lease[0].lease_status,
          lease: lease[0].lease_uid === null ? [] : lease[0],
          from: props.from,
          tenantDocuments: tenantDocuments, // Updated documents
          vehicles: vehicles, // Updated vehicles
          adultOccupants: adultOccupants, // Updated adult occupants
          petOccupants: petOccupants, // Updated pet occupants
          childOccupants: childOccupants, // Updated child occupants
          extraUploadDocument: extraUploadDocument, // Uploaded files
          extraUploadDocumentType: extraUploadDocumentType, // Uploaded file types
          deleteDocuments: deleteDocuments, // Deleted files
        };
        props.setRightPane?.({ type: "tenantApplication", state: updatedState });
      });
    } else {
      const updatedState = {
        data: property,
        status: lease[0].lease_uid === null ? "" : lease[0].lease_status,
        lease: lease[0].lease_uid === null ? [] : lease[0],
        from: props.from,
        tenantDocuments: tenantDocuments,
        vehicles: vehicles,
        adultOccupants: adultOccupants,
        petOccupants: petOccupants,
        childOccupants: childOccupants,
        extraUploadDocument: extraUploadDocument,
        extraUploadDocumentType: extraUploadDocumentType,
        deleteDocuments: deleteDocuments,
      };
      props.setRightPane?.({ type: "tenantApplication", state: updatedState });
    }
  };

  const handleSaveButton = async (e) => {
    e.preventDefault();

    console.log("status - ", status);
    if (status == null) {
      console.log("tenant creating new lease", status);
    } else if (status === "NEW" || status === "PROCESSING") {
      console.log("tenant updating lease", status);
    } else {
      console.log("tenant renewing lease", status);
    }
    if (status != null) {
      console.log("lease - ", lease[0]);
    }
    // if(lease == null) {
    //     console.log("tenant creating new lease");
    // } else {
    //     console.log("tenant updating / renewing new lease");
    // }
    if (lease[0]?.lease_uid == null || status === null || status === "" || status === "WITHDRAWN" || status === "REJECTED" || status === "REFUSED" || status === "RESCIND") {
      if (props.setFirstPage) {
        props.setFirstPage(false);
      }
      await handleApplicationSubmit();
    } else if(status === "RENEW NEW" || status === "RENEW PROCESSING" || status === "NEW" || status === "PROCESSING"  ){
      await updateLeaseData(); // Trigger the PUT request to save data
    } else {
      // await updateLeaseData(); 
      alert("Invalid status");
    }

    // Dhyey Code
    // console.log(status , " lease uid - ", lease[0])
    // if (lease[0]?.lease_uid == null || status === null || status === "" || status === "RENEW") {
    //     if(props.setFirstPage){
    //         props.setFirstPage(false)
    //     }

    // const updatedState = {
    //     data: property,
    //     status: lease[0].lease_uid === null ? "" : lease[0].lease_status,
    //     lease: lease[0].lease_uid === null ? [] : lease[0],
    //     from: props.from,
    //     tenantDocuments: tenantDocuments, // Updated documents
    //     vehicles: vehicles, // Updated vehicles
    //     adultOccupants: adultOccupants, // Updated adult occupants
    //     petOccupants: petOccupants, // Updated pet occupants
    //     childOccupants: childOccupants, // Updated child occupants
    //     extraUploadDocument: extraUploadDocument, // Uploaded files
    //     extraUploadDocumentType: extraUploadDocumentType, // Uploaded file types
    //     deleteDocuments: deleteDocuments, // Deleted files
    // };
    // console.log("updated state", updatedState);
    // props.setRightPane?.({ type: "tenantApplication", state: updatedState });
  };

  //everything from here -- Abhinav
  const getDecryptedSSN = (encryptedSSN) => {
    try {
      const decrypted = AES.decrypt(encryptedSSN, process.env.REACT_APP_ENKEY).toString(CryptoJS.enc.Utf8);
      // console.log("getDecryptedSSN - decrypted - ", decrypted.toString());
      return "***-**-" + decrypted.toString().slice(-4);
    } catch (error) {
      console.error("Error decrypting SSN:", error);
      return "";
    }
  };

  const [showWithdrawLeaseDialog, setShowWithdrawLeaseDialog] = useState(false);

  const getListDetails = () => {
    const relationships = getList("relationships");
    const states = getList("states");
    setRelationships(relationships);
    setStates(states);
  };

  function handleWithdrawLease() {

    if(lease[0].lease_status === "RENEW NEW"){
      const withdrawCurrentLeaseData = new FormData();    
      withdrawCurrentLeaseData.append("lease_uid", props.currentLease.lease_uid);    
      withdrawCurrentLeaseData.append("lease_renew_status", "WITHDRAWN");            

      // withdrawLeaseData.forEach((value, key) => {
      //   console.log(`${key}: ${value}`);
      // });

      const withdrawCurrentLeaseResponse = fetch(`${APIConfig.baseURL.dev}/leaseApplication`, {
        method: "PUT",
        body: withdrawCurrentLeaseData,
      });
      
    }

    const withdrawNewLeaseData = new FormData();    
    withdrawNewLeaseData.append("lease_uid", lease[0].lease_uid);    
    withdrawNewLeaseData.append("lease_status", "WITHDRAWN");            

    // withdrawLeaseData.forEach((value, key) => {
    //   console.log(`${key}: ${value}`);
    // });

    const withdrawNewLeaseResponse = fetch(`${APIConfig.baseURL.dev}/leaseApplication`, {
      method: "PUT",
      body: withdrawNewLeaseData,
    });

    Promise.all([withdrawNewLeaseResponse]).then((values) => {
      //navigate("/listings"); // send success data back to the propertyInfo page
      if (props.from === "PropertyInfo") {
        props.setRightPane({ type: "listings" });
        props.setReload((prev) => !prev);
        console.log("lease set right pane");
      } else {
        // props.setRightPane("");
        props.setReload((prev) => !prev);
        console.log("set right pane to nothing");
      }
    });
  }


  function formatDate(dateString) {
    const date = new Date(dateString);
    // console.log('check date', dateString, date)
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  }

  const handleApplicationSubmit = async () => {
    const currentLease = props.currentLease;
    // if (lease != null && lease[0]?.lease_status === "INACTIVE") {
    if (currentLease != null && currentLease?.lease_status === "INACTIVE") {
      alert("Lease status is INACTIVE");
      return;
    }
    try {
      let date = new Date();
      const receiverPropertyMapping = {
        [property.contract_business_id]: [property.contract_property_id],
      };

      const leaseApplicationData = new FormData();
      // leaseApplicationData.append("lease_property_id", property.property_uid != null ? property.property_uid : lease[0].lease_property_id);
      leaseApplicationData.append("lease_property_id", property.property_uid != null ? property.property_uid : currentLease?.lease_property_id);

      if (status === "RENEW NEW" || status === "RENEW PROCESSING" || currentLease?.lease_status === "ACTIVE" || currentLease?.lease_status === "ACTIVE M2M" || currentLease?.lease_status === "ENDED") {
        const updateLeaseData = new FormData();
        // updateLeaseData.append("lease_uid", lease[0].lease_uid);
        updateLeaseData.append("lease_uid", currentLease.lease_uid);
        updateLeaseData.append("lease_renew_status", "RENEW REQUESTED");

        // console.log(" inside update lease status - ", updateLeaseData)
        const updateLeaseResponse = await fetch(`${APIConfig.baseURL.dev}/leaseApplication`, {
          method: "PUT",
          body: updateLeaseData,
        });

        if (!updateLeaseResponse.ok) {
          throw new Error("Failed to update lease status to RENEW.");
        }
        leaseApplicationData.append("lease_status", "RENEW NEW");
      } else {
        leaseApplicationData.append("lease_status", "NEW");
      }

      leaseApplicationData.append("lease_assigned_contacts", JSON.stringify([getProfileId()]));
      leaseApplicationData.append("lease_income", JSON.stringify(selectedJobs));

      let index = -1;
      const documentsDetails = [];

      if (extraUploadDocument && extraUploadDocument.length !== 0) {
        [...extraUploadDocument].forEach((file, i) => {
          index++;
          leaseApplicationData.append(`file_${index}`, file, file.name);
          const contentType = extraUploadDocumentType[i] || "";
          const documentObject = {
            fileIndex: index,
            fileName: file.name,
            contentType: contentType,
          };
          documentsDetails.push(documentObject);
        });
      }

      leaseApplicationData.append("lease_documents_details", JSON.stringify(documentsDetails));

      if (tenantDocuments && tenantDocuments.length !== 0) {
        [...tenantDocuments].forEach((file, i) => {
          index++;
          const documentObject = {
            link: file.link,
            fileType: file.fileType,
            filename: file.filename,
            contentType: file.contentType,
          };
          leaseApplicationData.append(`file_${index}`, JSON.stringify(documentObject));
        });
      }

      if (deleteDocuments && deleteDocuments.length !== 0) {
        leaseApplicationData.append("delete_documents", JSON.stringify(deleteDocuments));
      }

      // Use the updated state values for occupancy details
      leaseApplicationData.append("lease_adults", JSON.stringify(adultOccupants));
      leaseApplicationData.append("lease_children", JSON.stringify(childOccupants));
      leaseApplicationData.append("lease_pets", JSON.stringify(petOccupants));
      leaseApplicationData.append("lease_vehicles", JSON.stringify(vehicles));

    //   console.log("880 - lease - ", lease);
      //   const leaseUtils = lease != null && lease?.length > 0 && lease[0].lease_utilities ? JSON.parse(lease[0].lease_utilities) : [];
      // const leaseUtils = currentLease != null && currentLease.lease_utilities != null ? JSON.parse(currentLease.lease_utilities) : [];

      // // leaseApplicationData.append("lease_utilities", leaseUtils.length > 0 ? lease[0]?.lease_utilities : JSON.stringify(propertyUtilities)) // propertyUtilities - property utilities from listing

      // //   if (lease == null || lease?.length === 0 || [null, "REFUSED", "RESCIND", "WITHDRAWN", "REJECTED"].includes(lease[0]?.lease_status)) {
      // if (currentLease == null || [null, "REFUSED", "RESCIND", "WITHDRAWN", "REJECTED"].includes(currentLease.lease_status)) {
      //   leaseApplicationData.append("lease_utilities", JSON.stringify(propertyUtilities)); // propertyUtilities - property utilities from listing
      // } else if (["ACTIVE", "ACTIVE M2M", "NEW", "PROCESSING", "ENDED", "EXPIRED", "RENEW PROCESSING", "RENEW NEW", "RENEW REQUESTED"].includes(currentLease?.lease_status)) {
      //   leaseApplicationData.append("lease_utilities", leaseUtils.length > 0 ? currentLease?.lease_utilities : JSON.stringify([]));
      // }

      leaseApplicationData.append("lease_referred", "[]");

      //   const leaseFees = lease != null && lease?.length > 0 && lease[0].lease_fees ? JSON.parse(lease[0].lease_fees) : [];
      const leaseFees = currentLease != null && currentLease.lease_fees != null ? JSON.parse(currentLease.lease_fees) : [];

      // leaseApplicationData.append("lease_fees", "[]");
      // leaseApplicationData.append("lease_fees", leaseFees.length > 0 ? lease[0]?.lease_fees : JSON.stringify([]));
      leaseApplicationData.append("lease_fees", leaseFees.length > 0 ? currentLease?.lease_fees : JSON.stringify([]));

      const leaseUtils = currentLease != null && currentLease.lease_utilities != null ? JSON.parse(currentLease.lease_utilities) : [];

      // leaseApplicationData.append("lease_fees", "[]");
      // leaseApplicationData.append("lease_fees", leaseFees.length > 0 ? lease[0]?.lease_fees : JSON.stringify([]));
      leaseApplicationData.append("lease_utilities", leaseUtils.length > 0 ? currentLease?.lease_utilities : JSON.stringify(propertyUtilities));

      leaseApplicationData.append("lease_application_date", formatDate(date.toLocaleDateString()));
      leaseApplicationData.append("tenant_uid", getProfileId());

      if(currentLease != null && (currentLease.lease_status === "ACTIVE" || currentLease.lease_status === "ACTIVE M2M")) {
        leaseApplicationData.append("lease_end_notice_period", currentLease.lease_end_notice_period ? currentLease.lease_end_notice_period : 30);
      }

      if(currentLease != null && (currentLease.lease_status === "ACTIVE" || currentLease.lease_status === "ACTIVE M2M")) {
        leaseApplicationData.append("lease_m2m", currentLease.lease_m2m ? currentLease.lease_m2m : 0);
      }

      // console.log("we are here -- ")

      // leaseApplicationData.forEach((value, key) => {
      //     console.log(`${key}: ${value}`);
      // });

      const leaseApplicationResponse = await fetch(`${APIConfig.baseURL.dev}/leaseApplication`, {
        method: "POST",
        body: leaseApplicationData,
      });

      if (leaseApplicationResponse.ok) { 

        props.setReload((prev) => !prev); 
        
        if (props.from === "PropertyInfo") {
          props.setRightPane({ type: "listings" });
        }

        const annoucementsResponse = await fetch(`${APIConfig.baseURL.dev}/announcements/${getProfileId()}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            announcement_title: "New Tenant Application",
            announcement_msg: "You have a new tenant application for your property",
            announcement_sender: getProfileId(),
            announcement_date: date.toDateString(),
            announcement_properties: JSON.stringify(receiverPropertyMapping),
            announcement_mode: "LEASE",
            announcement_receiver: [property.contract_business_id],
            announcement_type: ["Email", "Text"],
          }),
        });
    
        if (annoucementsResponse.ok) {
          
        } else {
          console.log("Failed to send announcements.");
        }

      } else {
        console.log("Failed to process lease application.");
      }

      // const annoucementsResponse = await fetch(`${APIConfig.baseURL.dev}/announcements/${getProfileId()}`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     announcement_title: "New Tenant Application",
      //     announcement_msg: "You have a new tenant application for your property",
      //     announcement_sender: getProfileId(),
      //     announcement_date: date.toDateString(),
      //     announcement_properties: JSON.stringify(receiverPropertyMapping),
      //     announcement_mode: "LEASE",
      //     announcement_receiver: [property.contract_business_id],
      //     announcement_type: ["Email", "Text"],
      //   }),
      // });

      // Promise.all([annoucementsResponse, leaseApplicationResponse]).then(() => {
      //   if (props.from === "PropertyInfo") {
      //     props.setReload((prev) => !prev);
      //     props.setRightPane({ type: "listings" });
      //   } else {
      //     props.setReload((prev) => !prev);
      //     // props.setRightPane("");
      //   }
      // });
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("We were unable to send the notification through text, but a notification was sent through the app.");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Paper
        style={{
          margin: "5px",
          padding: 20,
          backgroundColor: theme.palette.primary.main,
          borderRadius: "10px",
          boxShadow: "0px 2px 4px #00000040",
        }}
      >
        <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
          <CircularProgress color='inherit' />
        </Backdrop>
        <Grid container>
          <Grid container item xs={12} md={12}>
            <Grid item xs={11}>
              <Typography align='center' gutterBottom sx={{ fontSize: theme.typography.largeFont, fontWeight: "bold", color: "#1f1f1f" }}>
                Rental Application
              </Typography>
            </Grid>
            <Grid item xs={1}>
              <Button
                onClick={() => {
                  if (props.from && props.from === "accwidget") {
                    props.setRightPane("");
                  } else {
                    if (props.setFirstPage) {
                      props.setFirstPage(false);
                    }
                    props.setRightPane({ type: "listings" });
                  }
                }}
                sx={{
                  textTransform: "none",
                  textDecoration: "underline",
                }}
              >
                <CloseIcon sx={{ color: "black", fontSize: "30px" }} />
              </Button>
            </Grid>
          </Grid>
          <Grid item xs={12} md={12}>
            <Typography align='center' gutterBottom sx={{ fontSize: theme.typography.smallFont, fontWeight: "bold", color: "#1f1f1f" }}>
              Your changes will be saved to the Lease Application without impacting your profile.
            </Typography>
          </Grid>
          {/* <Grid item xs={1} md={1}>
                        <Box>
                            <Button onClick={(e) => handleCloseButton(e)}>
                                <CloseIcon sx={{ color: theme.typography.common.blue, fontSize: "30px" }} />
                            </Button>
                        </Box>
                    </Grid> */}
          {/* <Snackbar open={snackbarOpen} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%', height: "100%" }}>
                            <AlertTitle>{snackbarSeverity === "error" ? "Error" : "Success"}</AlertTitle>
                            {snackbarMessage}
                        </Alert>
                    </Snackbar> */}

          <GenericDialog
            isOpen={isDialogOpen}
            title={dialogTitle}
            contextText={dialogMessage}
            actions={[
              {
                label: "OK",
                onClick: closeDialog,
              },
            ]}
            severity={dialogSeverity}
          />

          {/* {lease_uid && ( -- Abhinav new change*/}
          <Box sx={{ padding: "10px" }}>
            <Accordion
              defaultExpanded
              sx={{
                marginBottom: "20px",
                backgroundColor: "#f0f0f0",
                borderRadius: "8px",
                margin: "auto",
                minHeight: "50px",
                // boxShadow: "none"
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography
                  sx={{
                    // fontWeight: theme.typography.primary.fontWeight,
                    // fontSize: "20px",
                    // textAlign: "center",
                    // paddingBottom: "10px",
                    // paddingTop: "5px",
                    // flexGrow: 1,
                    // // paddingLeft: "50px",
                    // color: "#160449",
                    fontWeight: theme.typography.medium.fontWeight,
                    color: theme.typography.primary.blue,
                  }}
                >
                  Applicant Personal Details
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ padding: "30px" }}>
                {" "}
                {/* Increased padding */}
                <Grid container spacing={3}>
                  {" "}
                  {/* Increased spacing */}
                  <Grid item xs={6}>
                    <Typography>
                      Name: {tenantProfile?.tenant_first_name} {tenantProfile?.tenant_last_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>Email: {tenantProfile?.tenant_email}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>Phone: {tenantProfile?.tenant_phone_number}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>SSN: {tenantProfile?.tenant_ssn ? getDecryptedSSN(tenantProfile.tenant_ssn) : "No SSN provided"}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>License #: {tenantProfile?.tenant_drivers_license_number}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>License State: {tenantProfile?.tenant_drivers_license_state}</Typography>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>

          <Grid container justifyContent='center' sx={{ backgroundColor: "#f0f0f0", borderRadius: "10px", padding: "10px", marginBottom: "10px" }}>
            <Grid item xs={12}>
              <Accordion
                sx={{
                  marginBottom: "20px",
                  backgroundColor: "#f0f0f0",
                  borderRadius: "8px",
                  margin: "auto", // Center the accordion
                  minHeight: "50px",
                }}
                expanded={employmentExpanded}
                onChange={() => setEmploymentExpanded((prev) => !prev)}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='employment-content' id='employment-header'>
                  <Grid container>
                    <Grid item md={11.2}>
                      <Typography
                        sx={{
                          fontWeight: theme.typography.medium.fontWeight,
                          color: theme.typography.primary.blue,
                          // color: "#160449",
                          // fontWeight: theme.typography.primary.fontWeight,
                          // fontSize: "20px",
                          // textAlign: "center",
                          // paddingBottom: "10px",
                          // paddingTop: "5px",
                          // flexGrow: 1,
                          // paddingLeft: "50px"
                        }}
                      >
                        Applicant Job Details
                      </Typography>
                    </Grid>
                  </Grid>
                </AccordionSummary>
                <AccordionDetails>
                  <EmploymentDataGrid
                    profileData={tenantProfile}
                    setIsEmployeChange={setIsEmployeChange}
                    // employmentDataT={
                    //   lease[0]?.lease_income && lease[0].lease_status !== "ACTIVE" && lease[0].lease_status !== "ACTIVE M2M" ? JSON.parse(lease[0]?.lease_income) : []
                    // }
                    employmentDataT={employmentData}
                    setSelectedJobs={setSelectedJobs}
                  />
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
          {/* )} */}

          {/* occupancy details*/}
          <Grid container justifyContent='center' sx={{ backgroundColor: "#f0f0f0", borderRadius: "10px", padding: "10px", marginBottom: "10px" }}>
            <Grid item xs={12}>
              <Accordion
                sx={{
                  marginBottom: "20px",
                  backgroundColor: "#f0f0f0",
                  borderRadius: "8px",
                  margin: "auto", // Center the accordion
                  minHeight: "50px",
                }}
                expanded={occupantsExpanded}
                onChange={() => setOccupantsExpanded((prevState) => !prevState)}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='occupants-content' id='occupants-header'>
                  <Grid container>
                    <Grid item md={11.2}>
                      <Typography
                        sx={{
                          fontWeight: theme.typography.medium.fontWeight,
                          color: theme.typography.primary.blue,
                          // color: "#160449",
                          // fontWeight: theme.typography.primary.fontWeight,
                          // fontSize: "20px",
                          // textAlign: "center",
                          // paddingBottom: "10px",
                          // paddingTop: "5px",
                          // flexGrow: 1,
                          // paddingLeft: "50px",
                        }}
                        paddingTop='5px'
                        paddingBottom='10px'
                      >
                        Occupancy Details
                      </Typography>
                    </Grid>
                    <Grid item md={0.5} />
                  </Grid>
                </AccordionSummary>
                <AccordionDetails>
                  {adultOccupants && (
                    <AdultOccupant
                      leaseAdults={adultOccupants}
                      relationships={relationships}
                      // editOrUpdateLease={lease_uid !== null ? editOrUpdateLease : editOrUpdateTenant}
                      editOrUpdateLease={editOrUpdateLease}
                      modifiedData={modifiedData}
                      setModifiedData={setModifiedData}
                      // dataKey={lease_uid !== null ? "lease_adults" : "tenant_adult_occupants"}
                      dataKey={"lease_adults"}
                      isEditable={true}
                    />
                  )}
                  {childOccupants && (
                    <ChildrenOccupant
                      leaseChildren={childOccupants}
                      relationships={relationships}
                      // editOrUpdateLease={lease_uid !== null ? editOrUpdateLease : editOrUpdateTenant}
                      editOrUpdateLease={editOrUpdateLease}
                      modifiedData={modifiedData}
                      setModifiedData={setModifiedData}
                      // dataKey={lease_uid !== null ? "lease_children" : "tenant_children_occupants"}
                      dataKey={"lease_children"}
                      isEditable={true}
                    />
                  )}
                  {petOccupants && (
                    <PetsOccupant
                      leasePets={petOccupants}
                      // editOrUpdateLease={lease_uid !== null ? editOrUpdateLease : editOrUpdateTenant}
                      editOrUpdateLease={editOrUpdateLease}
                      modifiedData={modifiedData}
                      setModifiedData={setModifiedData}
                      // dataKey={lease_uid !== null ? "lease_pets" : "tenant_pet_occupants"}
                      dataKey={"lease_pets"}
                      ownerOptions={[...adultOccupants, ...childOccupants]}
                      isEditable={true}
                    />
                  )}
                  {vehicles && (
                    <VehiclesOccupant
                      leaseVehicles={vehicles}
                      // setLeaseVehicles={setVehicles}
                      states={states}
                      // editOrUpdateLease={lease_uid !== null ? editOrUpdateLease : editOrUpdateTenant}
                      editOrUpdateLease={editOrUpdateLease}
                      modifiedData={modifiedData}
                      setModifiedData={setModifiedData}
                      // dataKey={lease_uid !== null ? "lease_vehicles" : "tenant_vehicle_info"}
                      dataKey={"lease_vehicles"}
                      ownerOptions={[...adultOccupants, ...childOccupants]}
                      isEditable={true}
                    />
                  )}
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>

          {/* documents details */}
          <Grid container direction='column' justifyContent='center' spacing={2} sx={{ backgroundColor: "#f0f0f0", borderRadius: "10px", padding: "10px", marginBottom: "10px" }}>
            <Grid item xs={12}>
              <Accordion
                sx={{
                  marginBottom: "20px",
                  backgroundColor: "#f0f0f0",
                  borderRadius: "8px",
                  margin: "auto", // Center the accordion
                  minHeight: "50px",
                }}
                expanded={documentsExpanded}
                onChange={() => setDocumentsExpanded((prev) => !prev)}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='documents-content' id='documents-header'>
                  <Typography
                    sx={{
                      fontWeight: theme.typography.medium.fontWeight,
                      color: theme.typography.primary.blue,
                      // color: "#160449",
                      // fontWeight: theme.typography.primary.fontWeight,
                      // fontSize: "20px",
                      // textAlign: "center",
                      // paddingBottom: "10px",
                      // paddingTop: "5px",
                      // flexGrow: 1,
                    }}
                  >
                    Document Details
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ width: "100%" }}>
                    <Documents
                      documents={tenantDocuments}
                      setDocuments={setTenantDocuments}
                      customName={"Application Documents"}
                      setContractFiles={setExtraUploadDocument}
                      setDeleteDocsUrl={setDeleteDocuments}
                      isAccord={false}
                      plusIconColor={theme.typography.primary.black}
                      plusIconSize={"18px"}
                      contractFiles={extraUploadDocument}
                      contractFileTypes={extraUploadDocumentType}
                      setContractFileTypes={setExtraUploadDocumentType}
                      setIsPreviousFileChange={setIsPreviousFileChange}
                    />
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>

          {/* <Grid item xs={12} md={12}>
                            <Typography>Documents</Typography>
                        <Documents
                            documents={documents}
                            setDocuments={setDocuments}
                            setContractFiles={setuploadedFiles}
                            // editOrUpdateLease={editOrUpdateTenant}
                            // documentsRef={documentsRef}
                            setDeleteDocsUrl={setDeletedFiles}
                            // setDeletedFiles={setDeletedFiles}
                            // modifiedData={modifiedData}
                            isAccord={true}
                            contractFiles={uploadedFiles}
                            contractFileTypes={uploadedFileTypes}
                            setContractFileTypes={setUploadedFileTypes}
                            setIsPreviousFileChange={setIsPreviousFileChange}
                            // setModifiedData={setModifiedData}
                            // dataKey={"tenant_documents"}
                        />
                        </Grid>
                    </Grid> */}

          <Grid container xs={12} flexDirection={"row"}>
            <Grid container justifyContent='center' item xs={12}>
              <Button
                variant='contained'
                sx={{
                  width: "40%",
                  fontSize: "16px",
                  backgroundColor: "#3D5CAC",
                  borderRadius: "5px",
                  marginRight: "20px",
                }}
                onClick={handleSaveButton}
              >
                <Typography sx={{ textTransform: "none", fontWeight: theme.typography.primary.fontWeight, color: "#FFFFFF" }}>
                  {props.lease == null ||
                  props.lease?.lease_status == null ||
                  props.lease?.lease_status == "WITHDRAWN" ||
                  props.lease?.lease_status == "REJECTED" ||
                  props.lease?.lease_status == "REFUSED" ||
                  props.lease?.lease_status == "RESCIND"
                    ? "Submit Application"
                    : ""}
                  {props.lease?.lease_status == "NEW" || props.lease?.lease_status == "PROCESSING" ? "Update Lease Application" : ""}
                  {(props.lease?.lease_status == "ACTIVE" ||
                    props.lease?.lease_status == "ACTIVE M2M" ||
                    props.lease?.lease_status == "ENDED" ||
                    props.lease?.lease_status == "EXPIRED" ||
                    props.lease?.lease_renew_status == "PM RENEW REQUESTED") &&
                  !(props.lease?.lease_renew_status === "RENEW PROCESSING" || props.lease?.lease_renew_status === "RENEW REQUESTED")
                    ? "Submit Lease Renewal"
                    : ""}
                  {props.lease?.lease_status == "RENEW REQUESTED" ||
                  props.lease?.lease_status == "RENEW NEW" ||
                  props.lease?.lease_status == "RENEW PROCESSING" ||
                  props.lease?.lease_renew_status == "RENEW PROCESSING" ||
                  props.lease?.lease_renew_status == "RENEW REQUESTED"
                    ? "Update Lease Renewal"
                    : ""}
                </Typography>
              </Button>
              {(status === "NEW" || status === "RENEW NEW") && (
                <Button
                  variant='contained'
                  sx={{
                    backgroundColor: "#ffe230",
                    color: "#160449",
                    fontWeight: theme.typography.medium.fontWeight,
                    borderRadius: "5px",
                    display: "flex",
                    width: "30%",
                    ":hover": {
                      backgroundColor: "#ffeb99",
                      color: "#160449",
                    },
                  }}
                  onClick={() => setShowWithdrawLeaseDialog(true)}
                >
                  <Typography
                    sx={{
                      fontWeight: theme.typography.primary.fontWeight,
                      fontSize: "16px",
                      color: "#160449",
                      textTransform: "none",
                    }}
                  >
                    Withdraw
                  </Typography>
                </Button>
              )}
            </Grid>
          </Grid>

          {/* From tenant application -- Abhinav Changes */}
          {/* {(status === null || status === "" || status === "NEW" || status === "RENEW") && (
                    <Grid>
                        <Button
                            variant="contained"
                            sx={{
                                backgroundColor: "#9EAED6",
                                textTransform: "none",
                                borderRadius: "5px",
                                display: "flex",
                                width: "45%",
                                marginRight: "10px",
                            }}
                            onClick={() => handleApplicationSubmit()}
                            >
                            <Typography
                                sx={{
                                fontWeight: theme.typography.primary.fontWeight,
                                fontSize: "14px",
                                color: "#FFFFFF",
                                textTransform: "none",
                                }}
                            >
                                Submit
                            </Typography>
                        </Button>
                    </Grid>
                    )} */}
        </Grid>

        {showWithdrawLeaseDialog && (
          <Dialog open={showWithdrawLeaseDialog} onClose={() => setShowWithdrawLeaseDialog(false)} aria-labelledby='alert-dialog-title' aria-describedby='alert-dialog-description'>
            <DialogContent>
              <DialogContentText
                id='alert-dialog-description'
                sx={{
                  fontWeight: theme.typography.common.fontWeight,
                  paddingTop: "10px",
                }}
              >
                Are you sure you want to withdraw your application for {property.property_address} {property.property_unit}?
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
                  onClick={() => handleWithdrawLease()}
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
                  onClick={() => setShowWithdrawLeaseDialog(false)}
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
        )}
      </Paper>
    </ThemeProvider>
  );
}

export const EmploymentDataGrid = ({ profileData, employmentDataT = [], setSelectedJobs, setIsEmployeChange }) => {
  // const parsedEmploymentDataT = Array.isArray(employmentDataT) ? employmentDataT : [];

  const [employmentData, setEmploymentData] = useState([]);

  const [parsedEmploymentDataT, setParsedEmploymentDataT] = useState([]);

  const [checkedJobs, setCheckedJobs] = useState([]);

  const handleJobSelection = (index) => {
    const updatedJobs = checkedJobs.map((job, i) => (i === index ? { ...job, checked: !job.checked } : job));
    setCheckedJobs(updatedJobs);

    const selectedJobs = updatedJobs.filter((job) => job.checked);
    // console.log("selected jobs - ", selectedJobs)
    setSelectedJobs(selectedJobs);
    setIsEmployeChange(true);
  };

  //   useEffect(() => {
  //     if (checkedJobs.length === 0) {
  //       const updateJobs = employmentData.map((job) => ({
  //         ...job,
  //         checked:
  //           parsedEmploymentDataT && parsedEmploymentDataT.length > 0
  //             ? parsedEmploymentDataT.some((leaseJob) => leaseJob.jobTitle === job.jobTitle && leaseJob.companyName === job.companyName)
  //             : false,
  //       }));

  //       setCheckedJobs(updateJobs);

  //       const selectedJobs = updateJobs.filter((job) => job.checked);
  //       setSelectedJobs(selectedJobs);
  //     }
  //   }, [parsedEmploymentDataT, employmentData]);
  useEffect(() => {    
    const updateJobs = employmentData.map((job) => {
      const matchingJob = parsedEmploymentDataT?.find((leaseJob) => leaseJob.jobTitle === job.jobTitle && leaseJob.companyName === job.companyName);

      return {
        ...job,
        checked: matchingJob ? Boolean(matchingJob.checked) : false, // Only mark checked if matching job has `checked: true`
      };
    });

    setCheckedJobs(updateJobs);

    const selectedJobs = updateJobs.filter((job) => job.checked);
    setSelectedJobs(selectedJobs);
    
  }, [parsedEmploymentDataT, employmentData]);

  useEffect(() => {
    if (profileData?.tenant_employment !== employmentData && parsedEmploymentDataT !== employmentDataT) {
      setEmploymentData(profileData?.tenant_employment ? JSON.parse(profileData.tenant_employment) : []);
      setParsedEmploymentDataT(employmentDataT ? employmentDataT : []);
    }
  }, [profileData, employmentDataT]);

  return (
    <Box sx={{ padding: "10px" }}>
      <Grid container spacing={2}>
        {checkedJobs.length > 0 ? (
          checkedJobs.map((job, index) => (
            <Grid item xs={12} key={index}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <FormControlLabel control={<Checkbox checked={job.checked} onChange={() => handleJobSelection(index)} />} label='' />
                <Box sx={{ flex: 1 }}>
                  <Typography variant='body1' sx={{ fontWeight: "bold" }}>
                    Job Title: {job.jobTitle}
                  </Typography>
                  <Typography variant='body2'>Company: {job.companyName}</Typography>
                  <Typography variant='body2'>Salary: ${job.salary}</Typography>
                  <Typography variant='body2'>Frequency: {job.frequency}</Typography>
                </Box>
              </Box>
              <Divider sx={{ marginTop: "10px", marginBottom: "10px" }} />
            </Grid>
          ))
        ) : (
          <Typography variant='body2' sx={{ textAlign: "center", width: "100%" }}>
            No employment data available.
          </Typography>
        )}
      </Grid>
    </Box>
  );
};
