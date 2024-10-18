import React, { useEffect, useState, useRef } from "react";
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


export default function TenantApplicationEdit({ profileData, lease, lease_uid, setRightPane, property, from, tenantDocuments, setTenantDocuments, oldVehicles, setOldVehicles, adultOccupants, setAdultOccupants, petOccupants, setPetOccupants, childOccupants, setChildOccupants, extraUploadDocument, setExtraUploadDocument, extraUploadDocumentType, setExtraUploadDocumentType, deleteDocuments, selectedJobs, setSelectedJobs }) {
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

    console.log("tenant emp", lease[0].lease_income);


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
        console.log("Inside show snackbar");
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
        console.log("calling profileData useEffect");

        // setIsSave(false);
        // setProfileData();
    }, [lease_uid, isReload]);

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
        try {
            if (adults?.length > 0 || pets?.length > 0 || children?.length > 0 || vehicles?.length > 0 || isPreviousFileChange || deletedFiles?.length > 0 || uploadedFiles?.length > 0) {
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

                // console.log(lease_uid)
                leaseApplicationFormData.append('lease_uid', lease_uid); // Here is the problem when upload new docs because there is no lease right now and it require lease_uid

                axios.put('https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/leaseApplication', leaseApplicationFormData, headers)
                    .then((response) => {
                        console.log('Data updated successfullyyy', response);
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
                    <Grid item xs={1} md={1}>
                        <Box>
                            <Button onClick={(e) => handleCloseButton(e)}>
                                <CloseIcon sx={{ color: theme.typography.common.blue, fontSize: "30px" }} />
                            </Button>
                        </Box>
                    </Grid>
                    <Snackbar open={snackbarOpen} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%', height: "100%" }}>
                            <AlertTitle>{snackbarSeverity === "error" ? "Error" : "Success"}</AlertTitle>
                            {snackbarMessage}
                        </Alert>
                    </Snackbar>

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
                                    selectedJobs={selectedJobs}
                                    setSelectedJobs={setSelectedJobs}
                                />
                                </AccordionDetails>
                            </Accordion>
                        </Grid>
                    </Grid>

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
                    <Grid container justifyContent='center' sx={{ backgroundColor: "#f0f0f0", borderRadius: "10px", padding: "10px", marginBottom: "10px" }}>
                    <Accordion sx={{ backgroundColor: "#F0F0F0", boxShadow: "none" }} expanded={documentsExpanded} onChange={() => setDocumentsExpanded((prev) => !prev)}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="documents-content" id="documents-header">
                            <Typography sx={{ color: "#160449", fontWeight: theme.typography.primary.fontWeight, fontSize: "20px" }}>
                                Document Details
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid item xs={12} md={12}>
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
                        </AccordionDetails>
                    </Accordion>
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
                            sx={{
                                backgroundColor: '#3D5CAC',                                
                            }}
                            onClick={(e) => handleCloseButton(e)}
                        >
                            <Typography sx={{ textTransform: 'none', fontWeight: 'bold', color: "#FFFFFF",}}>
                                {lease_uid == null? "Return to Application" : "Save & Return"}
                            </Typography>

                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </ThemeProvider>
    )
}

export const EmploymentDataGrid = ({ profileData, employmentDataT }) => {
    const employmentData = profileData?.tenant_employment 
      ? JSON.parse(profileData.tenant_employment)
      : [];

    const [checkedJobs, setCheckedJobs] = useState(() => 
      employmentData.map(job => ({ ...job, checked: false }))
    );

    const handleJobSelection = (index) => {
      setCheckedJobs(prevJobs =>
        prevJobs.map((job, i) => i === index ? { ...job, checked: !job.checked } : job)
      );
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


