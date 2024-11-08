import React, { useEffect, useState, useRef, useContext } from "react";
import {
    ThemeProvider, Box, Paper, Typography, Grid, Snackbar, Alert, AlertTitle, Accordion, AccordionSummary, AccordionDetails, FormControlLabel, Checkbox, Divider,
    Button
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


export default function TenantApplicationEdit({ profileData, lease, lease_uid, setRightPane, property, from, tenantDocuments, setTenantDocuments, oldVehicles, setOldVehicles, adultOccupants, setAdultOccupants, petOccupants, setPetOccupants, childOccupants, setChildOccupants, extraUploadDocument, setExtraUploadDocument, extraUploadDocumentType, setExtraUploadDocumentType, deleteDocuments, status }) {
    const { getList, } = useContext(ListsContext);
    console.log("profile data", profileData);
    const [adults, setAdults] = useState(adultOccupants? adultOccupants : []);
    const [children, setChildren] = useState(childOccupants? childOccupants : []);
    const [pets, setPets] = useState(petOccupants? petOccupants : []);
    const [vehicles, setVehicles] = useState(oldVehicles ? oldVehicles : []);
    const [documents, setDocuments] = useState(tenantDocuments? tenantDocuments : []);
    const documentsRef = useRef([]);
    const [uploadedFiles, setuploadedFiles] = useState(extraUploadDocument? extraUploadDocument : []);
    const [uploadedFileTypes, setUploadedFileTypes] = useState(extraUploadDocumentType? extraUploadDocumentType : []);
    const [deletedFiles, setDeletedFiles] = useState(deleteDocuments? deleteDocuments : []);
    const [relationships, setRelationships] = useState([]);
    const [states, setStates] = useState([]);
    const [modifiedData, setModifiedData] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const [showSpinner, setShowSpinner] = useState(false);
    // const [lease, setLease] = useState([]);
    const { user, getProfileId, roleName } = useUser();
    const [isReload, setIsReload] = useState(false);
    const [isPreviousFileChange, setIsPreviousFileChange] = useState(false)
    const [ occupantsExpanded, setOccupantsExpanded ] = useState(true);
    const [employmentExpanded, setEmploymentExpanded] = useState(true);
    const [documentsExpanded, setDocumentsExpanded] = useState(true); 
    const [selectedJobs, setSelectedJobs] = useState("[]");


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

    const showSnackbar = (message, severity) => {
        // console.log("Inside show snackbar");
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
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

    useEffect(() => {
        // console.log("calling profileData useEffect");

        // setIsSave(false);
        // setProfileData();
        getListDetails()
    }, []);

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


                modifiedData.forEach(item => {
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
                    
                    if(item.key === "lease_adults"){
                        // setAdultOccupants(item.value)
                        setAdults(item.value)
                    }
                    
                    if(item.key === "lease_children" ){
                        // setChildOccupants(item.value)
                        setChildren(item.value)
                    }
                    
                    if(item.key === "lease_pets"){
                        // setPetOccupants(item.value)
                        setPets(item.value)
                    }
                    
                    if(item.key === "lease_vehicles"){
                        // setOldVehicles(item.value)
                        setVehicles(item.value)
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
                showSnackbar("You haven't made any changes to the form. Please save after changing the data.", "error");
            }
        } catch (error) {
            showSnackbar("Cannot update the lease application. Please try again", "error");
            console.log("Cannot Update the lease application", error);
            setShowSpinner(false);
        }
    }

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

    const updateLeaseData = async () => {
        console.log("try", selectedJobs);
        try {
            if (adults?.length > 0 || pets?.length > 0 || children?.length > 0 || vehicles?.length > 0 || isPreviousFileChange || deletedFiles?.length > 0 || uploadedFiles?.length > 0 || selectedJobs?.length > 0) {
                setShowSpinner(true);
                const headers = {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "*",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Credentials": "*",
                };

                const leaseApplicationFormData = new FormData();

                // Now set pets, adult, document, children all fields if they change


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

                if(isPreviousFileChange){
                    leaseApplicationFormData.append("lease_documents", JSON.stringify(documents));
                }

                if(deletedFiles && deletedFiles?.length !== 0){
                    leaseApplicationFormData.append("delete_documents", JSON.stringify(deletedFiles));
                }

                if (uploadedFiles && uploadedFiles?.length) {

                    const documentsDetails = [];
                    [...uploadedFiles].forEach((file, i) => {
              
                      leaseApplicationFormData.append(`file_${i}`, file);
                      const fileType = uploadedFileTypes[i] || "";
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

                leaseApplicationFormData.append("lease_adults", JSON.stringify(adults));
                leaseApplicationFormData.append("lease_children", JSON.stringify(children));
                leaseApplicationFormData.append("lease_pets", JSON.stringify(pets));
                leaseApplicationFormData.append("lease_vehicles", JSON.stringify(vehicles));

                console.log("selected jobs", selectedJobs);

                if (selectedJobs?.length > 0) {
                    // console.log(JSON.stringify(selectedJobs));
                    leaseApplicationFormData.append("lease_income", JSON.stringify(selectedJobs));
                }    

                // console.log(lease_uid)
                leaseApplicationFormData.append('lease_uid', lease_uid); // Here is the problem when upload new docs because there is no lease right now and it require lease_uid

                axios.put('https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/leaseApplication', leaseApplicationFormData, headers)
                    .then((response) => {
                        // console.log('Data updated successfullyyy', response);
                        showSnackbar("Your lease application has been successfully updated.", "success");
                        setIsReload((prev) => !prev);
                        setShowSpinner(false);
                    })
                    .catch((error) => {
                        setShowSpinner(false);
                        showSnackbar("Cannot update the lease application. Please try again", "error");
                        if (error.response) {
                            console.log(error.response.data);
                        }
                    });
                setShowSpinner(false);
                setModifiedData([]);
                setuploadedFiles([]);
                setUploadedFileTypes([]);
                setDeletedFiles([]);

            } else {
                showSnackbar("You haven't made any changes to the form. Please save after changing the data.", "error");
            }
        } catch (error) {
            showSnackbar("Cannot update the lease application. Please try again", "error");
            console.log("Cannot Update the lease application", error);
            setShowSpinner(false);
        }
    }

    const handleCloseButton = (e) => {
        e.preventDefault();
        if (lease_uid !== null) {
            updateLeaseData().then(() => {
                const updatedState = {
                    data: property,
                    status: lease_uid === null ? "" : lease[0].lease_status,
                    lease: lease_uid === null ? [] : lease[0],
                    from: from,
                    tenantDocuments: documents, // Updated documents
                    vehicles: vehicles, // Updated vehicles
                    adultOccupants: adults, // Updated adult occupants
                    petOccupants: pets, // Updated pet occupants
                    childOccupants: children, // Updated child occupants
                    extraUploadDocument: uploadedFiles, // Uploaded files
                    extraUploadDocumentType: uploadedFileTypes, // Uploaded file types
                    deleteDocuments: deletedFiles, // Deleted files
                };
                setRightPane?.({ type: "tenantApplication", state: updatedState });
            });
        } else {
            const updatedState = {
                data: property,
                status: lease_uid === null ? "" : lease[0].lease_status,
                lease: lease_uid === null ? [] : lease[0],
                from: from,
                tenantDocuments: documents,
                vehicles: vehicles,
                adultOccupants: adults,
                petOccupants: pets,
                childOccupants: children,
                extraUploadDocument: uploadedFiles,
                extraUploadDocumentType: uploadedFileTypes,
                deleteDocuments: deletedFiles,
            };
            setRightPane?.({ type: "tenantApplication", state: updatedState });
        }
    };

    const handleSaveButton = async (e) => {
        e.preventDefault();
        if (lease_uid) {
            await updateLeaseData();  // Trigger the PUT request to save data
        }
        const updatedState = {
            data: property,
            status: lease_uid === null ? "" : lease[0].lease_status,
            lease: lease_uid === null ? [] : lease[0],
            from: from,
            tenantDocuments: documents, // Updated documents
            vehicles: vehicles, // Updated vehicles
            adultOccupants: adults, // Updated adult occupants
            petOccupants: pets, // Updated pet occupants
            childOccupants: children, // Updated child occupants
            extraUploadDocument: uploadedFiles, // Uploaded files
            extraUploadDocumentType: uploadedFileTypes, // Uploaded file types
            deleteDocuments: deletedFiles, // Deleted files
        };
        console.log("updated state", updatedState);
        setRightPane?.({ type: "tenantApplication", state: updatedState });
    };


    //everything from here -- Abhinav 
    const getDecryptedSSN = (encryptedSSN) => {
        try {
          const decrypted = AES.decrypt(encryptedSSN, process.env.REACT_APP_ENKEY).toString(CryptoJS.enc.Utf8);
          // console.log("getDecryptedSSN - decrypted - ", decrypted.toString());
          return "***-**-" + decrypted.toString().slice(-4);
        } catch (error) {
          console.error('Error decrypting SSN:', error);
          return '';
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
          const withdrawLeaseData = new FormData();
          if (lease[0].lease_uid) {
            withdrawLeaseData.append("lease_uid", lease[0].lease_uid);
          }
          else {
            withdrawLeaseData.append("lease_property_id", property.property_uid);
          }
          withdrawLeaseData.append("lease_status", "WITHDRAWN");
      
          withdrawLeaseData.forEach((value, key) => {
            console.log(`${key}: ${value}`);
          });
      
          const withdrawLeaseResponse = fetch(`${APIConfig.baseURL.dev}/leaseApplication`, {
            method: "PUT",
            body: withdrawLeaseData,
          });
      
          Promise.all([withdrawLeaseResponse]).then((values) => {
            //navigate("/listings"); // send success data back to the propertyInfo page
            if (from === "PropertyInfo") {
              setRightPane({ type: "listings" });
              console.log("lease set right pane")
            } else {
              setRightPane("");
              console.log("set right pane to nothing")
            }
          });
        }

    function formatDate(dateString) {
        const date = new Date(dateString);
        // console.log('check date', dateString, date)
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}-${day}-${year}`;
      }

      const handleApplicationSubmit = async () => {
        try {
            let date = new Date();
            const receiverPropertyMapping = {
                [property.contract_business_id]: [property.contract_property_id],
            };
    
            const leaseApplicationData = new FormData();
            leaseApplicationData.append("lease_property_id", property.property_uid);
    
            if (lease.lease_status === "RENEW") {
                const updateLeaseData = new FormData();
                updateLeaseData.append("lease_uid", lease[0].lease_uid);
                updateLeaseData.append("lease_renew_status", "TRUE");
    
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
    
            if (deletedFiles && deletedFiles.length !== 0) {
                leaseApplicationData.append("delete_documents", JSON.stringify(deletedFiles));
            }
    
            // Use the updated state values for occupancy details
            leaseApplicationData.append("lease_adults", JSON.stringify(adults));
            leaseApplicationData.append("lease_children", JSON.stringify(children));
            leaseApplicationData.append("lease_pets", JSON.stringify(pets));
            leaseApplicationData.append("lease_vehicles", JSON.stringify(vehicles));
            
            leaseApplicationData.append("lease_referred", "[]");
            leaseApplicationData.append("lease_fees", "[]");
            leaseApplicationData.append("lease_application_date", formatDate(date.toLocaleDateString()));
            leaseApplicationData.append("tenant_uid", getProfileId());
    
            const leaseApplicationResponse = await fetch(`${APIConfig.baseURL.dev}/leaseApplication`, {
                method: "POST",
                body: leaseApplicationData,
            });
    
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
    
            Promise.all([annoucementsResponse, leaseApplicationResponse]).then(() => {
                if (from === "PropertyInfo") {
                    setRightPane({ type: "listings" });
                } else {
                    setRightPane("");
                }
            });
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
                    borderRadius: '10px',
                    boxShadow: "0px 2px 4px #00000040"
                }}
            >
                <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
                    <CircularProgress color="inherit" />
                </Backdrop>
                <Grid container>
                    <Grid item xs={11} md={11}>
                        <Typography align='center' gutterBottom sx={{ fontSize: "24px", fontWeight: "bold", color: "#1f1f1f" }}>
                            Tenant Application Edit
                        </Typography>
                    </Grid>
                    <Grid item xs={11} md={11}>
                        <Typography align='center' gutterBottom sx={{ fontSize: "16px", fontWeight: "bold", color: "#1f1f1f" }}>                            
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
                    <Snackbar open={snackbarOpen} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%', height: "100%" }}>
                            <AlertTitle>{snackbarSeverity === "error" ? "Error" : "Success"}</AlertTitle>
                            {snackbarMessage}
                        </Alert>
                    </Snackbar>

                    {/* {lease_uid && ( -- Abhinav new change*/}
                    <Box sx={{ padding: "10px" }}>
                    <Accordion 
                        defaultExpanded 
                        sx={{
                        marginBottom: "20px", 
                        backgroundColor: "#f0f0f0", 
                        borderRadius: '8px',
                        margin: "auto", 
                        minHeight: "50px"
                        }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ fontWeight: theme.typography.medium.fontWeight, color: theme.typography.primary.blue }}>
                            Applicant Personal Details
                        </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ padding: "30px" }}> {/* Increased padding */}
                        <Grid container spacing={3}> {/* Increased spacing */}
                            <Grid item xs={6}>
                            <Typography>Name: {profileData?.tenant_first_name} {profileData?.tenant_last_name}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                            <Typography>Email: {profileData?.tenant_email}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                            <Typography>Phone: {profileData?.tenant_phone_number}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                            <Typography>SSN: {profileData?.tenant_ssn ? getDecryptedSSN(profileData.tenant_ssn) : "No SSN provided"}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                            <Typography>License #: {profileData?.tenant_drivers_license_number}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                            <Typography>License State: {profileData?.tenant_drivers_license_state}</Typography>
                            </Grid>
                        </Grid>
                        </AccordionDetails>
                    </Accordion>
                    </Box>

                    <Grid container justifyContent="center" sx={{ backgroundColor: "#f0f0f0", borderRadius: "10px", padding: "10px", marginBottom: "10px" }}>
                        <Grid item xs={12}>
                            <Accordion sx={{ backgroundColor: "#F0F0F0", boxShadow: "none" }} expanded={employmentExpanded} onChange={() => setEmploymentExpanded((prev) => !prev)}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="employment-content" id="employment-header">
                                    <Grid container>
                                        <Grid item md={11.2}>
                                            <Typography
                                                sx={{
                                                    color: "#160449",
                                                    fontWeight: theme.typography.primary.fontWeight,
                                                    fontSize: "20px",
                                                    textAlign: "center",
                                                    paddingBottom: "10px",
                                                    paddingTop: "5px",
                                                    flexGrow: 1,
                                                    paddingLeft: "50px"
                                                }}
                                            >
                                                Employment Details
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </AccordionSummary>
                                <AccordionDetails>
                                <EmploymentDataGrid
                                    profileData = {profileData}
                                    employmentDataT={lease?.[0]?.lease_income ? JSON.parse(lease[0].lease_income) : []}
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
                            <Accordion sx={{ backgroundColor: "#F0F0F0", boxShadow: "none" }} expanded={occupantsExpanded} onChange={() => setOccupantsExpanded(prevState => !prevState)}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='occupants-content' id='occupants-header'>
                                    <Grid container>
                                        <Grid item md={11.2}>
                                            <Typography
                                                sx={{
                                                    color: "#160449",
                                                    fontWeight: theme.typography.primary.fontWeight,
                                                    fontSize: "20px",
                                                    textAlign: "center",
                                                    paddingBottom: "10px",
                                                    paddingTop: "5px",
                                                    flexGrow: 1,
                                                    paddingLeft: "50px",
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
                                    {adults && (
                                        <AdultOccupant
                                            leaseAdults={adults}
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
                                    {children && (
                                        <ChildrenOccupant
                                            leaseChildren={children}
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
                                    {pets && (
                                        <PetsOccupant
                                            leasePets={pets}
                                            // editOrUpdateLease={lease_uid !== null ? editOrUpdateLease : editOrUpdateTenant}
                                            editOrUpdateLease={editOrUpdateLease}
                                            modifiedData={modifiedData}
                                            setModifiedData={setModifiedData}
                                            // dataKey={lease_uid !== null ? "lease_pets" : "tenant_pet_occupants"}
                                            dataKey={"lease_pets"}
                                            isEditable={true}
                                        />
                                    )}
                                    {vehicles && (
                                        <VehiclesOccupant
                                            leaseVehicles={vehicles}
                                            states={states}
                                            // editOrUpdateLease={lease_uid !== null ? editOrUpdateLease : editOrUpdateTenant}
                                            editOrUpdateLease={editOrUpdateLease}
                                            modifiedData={modifiedData}
                                            setModifiedData={setModifiedData}
                                            // dataKey={lease_uid !== null ? "lease_vehicles" : "tenant_vehicle_info"}
                                            dataKey={"lease_vehicles"}
                                            ownerOptions={[...adults, ...children]}
                                            isEditable={true}
                                        />
                                    )}
                                </AccordionDetails>
                            </Accordion>
                        </Grid>
                    </Grid>
                    
                    {/* documents details */}
                    <Grid container direction="column" spacing={2} sx={{ padding: '10px' }}>
                    <Grid item>
                        <Accordion sx={{ backgroundColor: "#F0F0F0", boxShadow: "none" }} expanded={documentsExpanded} onChange={() => setDocumentsExpanded((prev) => !prev)}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="documents-content" id="documents-header">
                            <Typography
                                sx={{
                                    color: "#160449",
                                    fontWeight: theme.typography.primary.fontWeight,
                                    fontSize: "20px",
                                    textAlign: "center",
                                    paddingBottom: "10px",
                                    paddingTop: "5px",
                                    flexGrow: 1,
                                }}
                                paddingTop='5px'
                                paddingBottom='10px'
                            >
                                Document Details
                            </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Documents
                                    documents={documents}
                                    setDocuments={setDocuments}
                                    setContractFiles={setuploadedFiles}
                                    setDeleteDocsUrl={setDeletedFiles}
                                    isAccord={true}
                                    contractFiles={uploadedFiles}
                                    contractFileTypes={uploadedFileTypes}
                                    setContractFileTypes={setUploadedFileTypes}
                                    setIsPreviousFileChange={setIsPreviousFileChange}
                                />
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

                    <Grid container justifyContent='center' item xs={11} md={11}>
                        <Button
                            variant="contained"
                            sx={{
                                backgroundColor: '#3D5CAC',                                
                            }}
                            onClick={handleSaveButton}
                        >
                            <Typography sx={{ textTransform: 'none', fontWeight: 'bold', color: "#FFFFFF",}}>
                                {lease_uid == null? "Return to Application" : "Save & Return"}
                            </Typography>

                        </Button>
                    </Grid>

                    {/* From tenant application -- Abhinav Changes */}
                    {(status === null || status === "" || status === "NEW" || status === "RENEW") && (
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
                    )}
                {(status === "NEW" || status === "RENEW NEW") && (
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#ffe230",
                    color: "#160449",
                    fontWeight: theme.typography.medium.fontWeight,
                    fontSize: "14px",
                    textTransform: "none",
                    borderRadius: "5px",
                    display: "flex",
                    width: "45%",
                    marginLeft: "10px",
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
                      fontSize: "14px",
                      color: "#160449",
                      textTransform: "none",
                    }}
                  >
                    Withdraw
                  </Typography>
                </Button>
              )}
                </Grid>

                {showWithdrawLeaseDialog && (
                <Dialog
                  open={showWithdrawLeaseDialog}
                  onClose={() => setShowWithdrawLeaseDialog(false)}
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
    )
}

export const EmploymentDataGrid = ({ profileData, employmentDataT, setSelectedJobs }) => {
    const employmentData = profileData?.tenant_employment 
        ? JSON.parse(profileData.tenant_employment)
        : [];

    const [checkedJobs, setCheckedJobs] = useState(() => 
        employmentData.map(job => ({
            ...job,
            checked: employmentDataT.some(leaseJob => leaseJob.jobTitle === job.jobTitle && leaseJob.companyName === job.companyName)
        }))
    );

    const handleJobSelection = (index) => {
        const updatedJobs = checkedJobs.map((job, i) =>
            i === index ? { ...job, checked: !job.checked } : job
        );
        setCheckedJobs(updatedJobs);

        const selectedJobs = updatedJobs.filter(job => job.checked);
        setSelectedJobs(selectedJobs);
    };

    return (
        <Box sx={{ padding: "10px" }}>
            <Grid container spacing={2}>
                {checkedJobs.map((job, index) => (
                    <Grid item xs={12} key={index}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={job.checked}
                                        onChange={() => handleJobSelection(index)}
                                    />
                                }
                                label=""
                            />
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                                    Job Title: {job.jobTitle}
                                </Typography>
                                <Typography variant="body2">Company: {job.companyName}</Typography>
                                <Typography variant="body2">Salary: ${job.salary}</Typography>
                                <Typography variant="body2">Frequency: {job.frequency}</Typography>
                            </Box>
                        </Box>
                        <Divider sx={{ marginTop: "10px", marginBottom: "10px" }} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};



