import React, { useEffect, useState } from "react";
import theme from "../../theme/theme";
import {Checkbox, FormControlLabel, ThemeProvider, Box, Paper, Stack, Typography, Grid, Divider, Button, ButtonGroup, Rating, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { Form, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import backButton from "../Payments/backIcon.png";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import CloseIcon from "@mui/icons-material/Close";
import APIConfig from "../../utils/APIConfig";
import axios from "axios";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Documents from "../Leases/Documents";
import { DataGrid } from "@mui/x-data-grid";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CryptoJS from "crypto-js";
import AES from "crypto-js/aes";

export default function TenantApplication(props) {
  console.log("In Tenant Application", props);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, getProfileId, roleName } = useUser();

  // console.log("props in tenantApplication", props);

  const [property, setProperty] = useState([]);
  const [status, setStatus] = useState("");
  const [lease, setLease] = useState([]);
  console.log("in tenant application status", status);
  // console.log("lease", lease);
  // console.log("property", property);

  const [tenantProfile, setTenantProfile] = useState(null);
  const [showSpinner, setShowSpinner] = useState(false);
  const [vehicles, setVehicles] = useState(null);
  const [adultOccupants, setAdultOccupants] = useState(null);
  const [petOccupants, setPetOccupants] = useState(null);
  const [childOccupants, setChildOccupants] = useState(null);

  const [tenantDocuments, setTenantDocuments] = useState([]);
  const [formattedAddress, setFormattedAddress] = useState("");
  const [extraUploadDocument, setExtraUploadDocument] = useState([]);
  const [extraUploadDocumentType, setExtraUploadDocumentType] = useState([]);
  const [deleteDocuments, setDeleteDocuments] = useState([]);
  const [selectedJobs, setSelectedJobs] = useState([]);



  // useEffect(() => {
  //     console.log("tenantDocuments - ", tenantDocuments);
  // }, [tenantDocuments])
  

  // useEffect(() => {
  //   const updateData = () => {
  //       setShowSpinner(true);
  
  //       // First, set the property state
  //       setProperty(props.data);
  
  //       // Then, set the status state
  //       setStatus(props.status);
  
  //       // Once the address is formatted, update the address state
  //       const address = formatAddress();
  //       setFormattedAddress(address);
  
  //       // Finally, set the spinner to false after a 2-second delay
  //       setTimeout(() => {
  //         setShowSpinner(false);
  //       }, 2000); // 2 seconds delay
  //   };
  
  //   updateData();
  // }, [props.data]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setShowSpinner(true); // Start the spinner before loading data
  
        // Fetch lease details asynchronously
        const leaseResponse = await axios.get(
          `https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/leaseDetails/${getProfileId()}`
        );
        
        const fetchedLease = leaseResponse.data["Lease_Details"].result.filter(
          (lease) => lease.lease_uid === props.lease.lease_uid
        );
        
        setLease(fetchedLease);
  
        // Fetch tenant profile information asynchronously
        const profileResponse = await fetch(`${APIConfig.baseURL.dev}/profile/${getProfileId()}`);
        const profileData = await profileResponse.json();
        setTenantProfile(profileData.profile.result[0]);
  
        // Set other properties after all data is fetched
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
  }, [props.data]);
  

  const [showWithdrawLeaseDialog, setShowWithdrawLeaseDialog] = useState(false);

  function formatDocumentType(type) {
    switch (type) {
      case "income_proof":
        return "Proof of Income";
      case "bank_statement":
        return "Bank Statement";
      case "id":
        return "ID";
      case "renters_insurance_proof":
        return "Proof of Renter's Insurance";
      case "ssn":
        return "SSN";
      case "credit_report":
        return "Credit Report";
      case "reference":
        return "Reference";
      case "other":
        return "Other";
      case "Lease Agreement":
        return "Lease Agreement";

      default:
        return "";
    }
  }
  function formatAddress() {
    return `${props.data.property_address} ${props.data.property_unit} ${props.data.property_city} ${props.data.property_state} ${props.data.property_zip}`;
  }

  function formatTenantAddress() {
    if (!tenantProfile) {
      return "No Previous Address";
    } else {
      return `${tenantProfile.tenant_address}`;
    }
  }

  function formatTenantCityState() {
    if (!tenantProfile) {
      return "No Previous Address";
    } else {
      return `${tenantProfile.tenant_city}, ${tenantProfile.tenant_state}`;
    }
  }

  function formatTenantZip() {
    if (!tenantProfile) {
      return "No Previous Address";
    } else {
      return `${tenantProfile.tenant_zip}`;
    }
  }

  function formatTenantUnit() {
    if (!tenantProfile) {
      return "No Previous Address";
    } else {
      return `${tenantProfile.tenant_unit}`;
    }
  }

  function formatTenantVehicleInfo() {
    if (lease.length === 0) {
      let info = tenantProfile && tenantProfile.tenant_vehicle_info ? JSON.parse(tenantProfile.tenant_vehicle_info) : [];
      setVehicles(info);
    } else {
      let info = JSON.parse(lease[0].lease_vehicles);
      setVehicles(info);
      // for (const vehicle of info){
      //     console.log(vehicle)
      // }
    }
  }

  function formatTenantAdultOccupants() {
    if (lease.length === 0) {
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
  }

  function formatTenantPetOccupants() {
    if (lease.length === 0) {
      let info = tenantProfile && tenantProfile.tenant_pet_occupants ? JSON.parse(tenantProfile.tenant_pet_occupants) : [];
      setPetOccupants(info);
    } else {
      let info = JSON.parse(lease[0].lease_pets);
      setPetOccupants(info);
      // for (const pet of info){
      //     console.log(pet)
      // }
    }
  }
  function formatTenantChildOccupants() {
    if (lease.length === 0) {
      let info = tenantProfile && tenantProfile.tenant_children_occupants ? JSON.parse(tenantProfile.tenant_children_occupants) : [];
      setChildOccupants(info);
    } else {
      let info = JSON.parse(lease[0].lease_children);
      setChildOccupants(info);
      // for (const child of info){
      //     console.log(child)
      // }
    }
  }

  const deleteTenantDocument = (index) => {
    setTenantDocuments((prevFiles) => {
      const filesArray = Array.from(prevFiles);
      filesArray.splice(index, 1);
      return filesArray;
    });
  };

  useEffect(() => {
    const getTenantProfileInformation = async () => {
      const response = await fetch(`${APIConfig.baseURL.dev}/profile/${getProfileId()}`);
      const data = await response.json();
      const tenantProfileData = data.profile.result[0];
      setTenantProfile(tenantProfileData);
      console.log("tenantProfileData", tenantProfileData);
    };
    getTenantProfileInformation();
  }, []);

  useEffect(() => {

    // console.log("---dhyey--- props data for property - ", lease)
    
    if(props?.vehicles){
      setVehicles(props.vehicles)
    }else{
      formatTenantVehicleInfo();
    }

    if(props?.adultOccupants){
      setAdultOccupants(props.adultOccupants)
    }else{
      formatTenantAdultOccupants();
    }

    if(props?.petOccupants){
      setPetOccupants(props.petOccupants)
    }else{
      formatTenantPetOccupants();
    }

    if(props?.childOccupants){
      setChildOccupants(props.childOccupants)
    }else{
      formatTenantChildOccupants();
    }

    if(props?.extraUploadDocument){
      setExtraUploadDocument(props.extraUploadDocument)
    }

    if(props?.extraUploadDocumentType){
      setExtraUploadDocumentType(props.extraUploadDocumentType)
    }

    if(props?.deleteDocuments){
      setDeleteDocuments(props.deleteDocuments)
    }

    if(props?.tenantDocuments){
      setTenantDocuments(props.tenantDocuments)
    }else{
      if (lease.length === 0) {
        setTenantDocuments(tenantProfile ? JSON.parse(tenantProfile.tenant_documents) : []);
      } else {
        setTenantDocuments(lease && lease.length > 0 ? JSON.parse(lease[0]?.lease_documents) : []);
      }
    }

  }, [lease, tenantProfile]);

  function getApplicationDate() {
    return "10-31-2023";
  }

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

  function displaySSN() {
    // console.log('ssn is', tenantProfile)
    if (tenantProfile && (tenantProfile.tenant_ssn != null || tenantProfile.tenant_ssn != "")) {
      return `${tenantProfile?.tenant_ssn?.slice(-4)}`;
    } else {
      return "-";
    }
  }

  function handleWithdrawLease() {
    const withdrawLeaseData = new FormData();
    withdrawLeaseData.append("lease_uid", lease.lease_uid);
    withdrawLeaseData.append("lease_status", "WITHDRAWN");

    const withdrawLeaseResponse = fetch(`${APIConfig.baseURL.dev}/leaseApplication`, {
      method: "PUT",
      body: withdrawLeaseData,
    });

    Promise.all([withdrawLeaseResponse]).then((values) => {
      //navigate("/listings"); // send success data back to the propertyInfo page
      if (props.from === "PropertyInfo") {
        props.setRightPane({ type: "listings" });
      } else {
        props.setRightPane("");
      }
    });
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    console.log('check date', dateString, date)
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  }

  // useEffect(() => {
  //   if (props.status !== "NEW" && tenantProfile?.selected_jobs) {
  //     console.log("in here");
  //     setSelectedJobs(tenantProfile.selected_jobs);
  //   }
  // }, [props.status, tenantProfile]);

  async function handleApplicationSubmit() {
    //submit to backend
    // console.log("Application Submitted")
    // console.log("should call /annoucements")
    // console.log("should call /leases")
    console.log("lease status", status);
    try {
      let date = new Date();

      const receiverPropertyMapping = {
        [property.contract_business_id]: [property.contract_property_id],
      };

      const leaseApplicationData = new FormData();

      leaseApplicationData.append("lease_property_id", property.property_uid);
      if (status === "RENEW") {
        const updateLeaseData = new FormData();
        updateLeaseData.append("lease_uid", lease[0].lease_uid);
        updateLeaseData.append("lease_renew_status", "RENEW REQUESTED");
  
        // const updateLeaseResponse = await fetch(`${APIConfig.baseURL.dev}/leaseApplication`, {
        //   method: "PUT",
        //   body: updateLeaseData,
        // });
  
        // if (!updateLeaseResponse.ok) {
        //   throw new Error("Failed to update lease status to RENEW.");
        // }
  
        leaseApplicationData.append("lease_status", "RENEW NEW");
      } else {
        leaseApplicationData.append("lease_status", "NEW");
      }
      // if (status === "RENEW" ) {
      //   leaseApplicationData.append("lease_status", "RENEW NEW");
      // }
      // else {
      //   leaseApplicationData.append("lease_status", "NEW");
      // }
      leaseApplicationData.append("lease_assigned_contacts", JSON.stringify([getProfileId()]));
      leaseApplicationData.append("lease_income", JSON.stringify(selectedJobs));
      const documentsDetails = [];
      let index = -1

      if(extraUploadDocument && extraUploadDocument?.length !== 0){
        [...extraUploadDocument].forEach((file, i) => {
            index++;
            leaseApplicationData.append(`file_${index}`, file, file.name);
            const contentType = extraUploadDocumentType[i]?extraUploadDocumentType[i] : "" 
            const documentObject = {
                // file: file,
                fileIndex: index,
                fileName: file.name,
                contentType: contentType,
                // type: file.type,
            };
            documentsDetails.push(documentObject);
        });
        
      }

      leaseApplicationData.append("lease_documents_details", JSON.stringify(documentsDetails));
      
      // console.log("----dhyey ---- leaseApplication payload before passing- ", leaseApplicationData)

      if(tenantDocuments && tenantDocuments.length !== 0){
        [...tenantDocuments].forEach((file, i) => {
          index++;
          // const details = []
          // console.log(`file_${index}`,file.link)
          
          // https://s3-us-west-1.amazonaws.com/io-pm/tenants/350-000010/file_0_20240910221710Z

          // [{"link": "https://s3-us-west-1.amazonaws.com/io-pm/leases/300-000049/file_0_20240910200747Z", "fileType": "application/pdf", "filename": "Sample Document 1.pdf", "contentType": "Drivers License"}]
         
          // leaseApplicationData.append(`file_${index}`, file.link);
          const documentObject = {
              // file: file,
              link : file.link,
              fileType: file.fileType,
              filename: file.filename,
              contentType: file.contentType,
              // type: file.type,
          };
          // details.push(documentObject);
          leaseApplicationData.append(`file_${index}`, JSON.stringify(documentObject));
      });
      }

      // console.log("----dhyey ---- leaseApplication payload after passing - ", leaseApplicationData)

      if(deleteDocuments && deleteDocuments?.length !== 0){
        leaseApplicationData.append("delete_documents", JSON.stringify(deleteDocuments));
      }

      // leaseApplicationData.append("lease_documents", JSON.stringify(tenantDocuments));

      leaseApplicationData.append("lease_adults", JSON.stringify(adultOccupants));
      leaseApplicationData.append("lease_children", JSON.stringify(childOccupants));
      leaseApplicationData.append("lease_pets", JSON.stringify(petOccupants));
      leaseApplicationData.append("lease_vehicles", JSON.stringify(vehicles));

      // if (status === "") {
      //   leaseApplicationData.append("lease_adults", tenantProfile?.tenant_adult_occupants);
      //   leaseApplicationData.append("lease_children", tenantProfile?.tenant_children_occupants);
      //   leaseApplicationData.append("lease_pets", tenantProfile?.tenant_pet_occupants);
      //   leaseApplicationData.append("lease_vehicles", tenantProfile?.tenant_vehicle_info);
      // } else {
      //   leaseApplicationData.append("lease_adults", lease[0]?.lease_adults);
      //   leaseApplicationData.append("lease_children", lease[0]?.lease_children);
      //   leaseApplicationData.append("lease_pets", lease[0]?.lease_pets);
      //   leaseApplicationData.append("lease_vehicles", lease[0]?.lease_vehicles);
      // }

      leaseApplicationData.append("lease_referred", "[]");
      leaseApplicationData.append("lease_fees", "[]");
      leaseApplicationData.append("lease_application_date", formatDate(date.toLocaleDateString()));
      leaseApplicationData.append("tenant_uid", getProfileId());

      // console.log("----dhyey ---- leaseApplication payload - ", leaseApplicationData)
      

      // const leaseApplicationResponse = await fetch(`${APIConfig.baseURL.dev}/leaseApplication`, {
      //   method: "POST",
      //   body: leaseApplicationData,
      // });

      leaseApplicationData.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });

      const annoucementsResponse = await fetch(`${APIConfig.baseURL.dev}/announcements/${getProfileId()}`, {
        // const annoucementsResponse = await fetch(`http://localhost:4000/announcements/${getProfileId()}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          announcement_title: "New Tenant Application",
          announcement_msg: "You have a new tenant application for your property",
          announcement_sender: getProfileId(),
          announcement_date: date.toDateString(),
          // "announcement_properties": property.contract_property_id,
          announcement_properties: JSON.stringify(receiverPropertyMapping),
          announcement_mode: "LEASE",
          announcement_receiver: [property.contract_business_id],
          announcement_type: ["Email", "Text"],
        }),
      });

      // Promise.all([annoucementsResponse, leaseApplicationResponse]).then((values) => {
      //   // navigate("/listings"); // send success data back to the propertyInfo page
      //   if (props.from === "PropertyInfo") {
      //     props.setRightPane({ type: "listings" });
      //     props.setReload(prev => !prev);
      //   } else {
      //     props.setRightPane("");
      //     props.setReload(prev => !prev);
      //   }
      // });
    } catch (error) {
      console.log("Error submitting application:", error);
      alert("We were unable to Text the Property Manager but we were able to send them a notification through the App");

      // navigate("/listings");
      // if (props.from === "PropertyInfo") {
      //   props.setRightPane({ type: "listings" });
      //   props.setReload(prev => !prev);
      // } else {
      //   props.setRightPane("");
      //   props.setReload(prev => !prev);
      // }
    }
  }

  const handleCloseButton = (e) => {
    e.preventDefault();
    props.setRightPane?.("");
  };

  return (
    <ThemeProvider theme={theme}>
       {showSpinner ? (
        <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={true}>
          <CircularProgress color='inherit' />
        </Backdrop>
      ) : (
      <Paper
        style={{
          padding: 20,
          backgroundColor: '#F2F2F2',
          borderRadius: '10px',
          boxShadow: "0px 2px 4px #00000040"
        }}
      >
        <Box
          sx={{
            paddingBottom: "50px",
          }}
        >
          <Box
            component='span'
            display='flex'
            justifyContent='center'
            alignItems='center'
            position='relative'
            sx={{
              paddingTop: "20px",
            }}
          >
            {props.from === "accwidget" &&
              <Box sx={{ position: "absolute", top: 0, right: 0 }}>
                <Button onClick={(e) => handleCloseButton(e)}>
                  <CloseIcon sx={{ color: theme.typography.common.blue, fontSize: "30px" }} />
                </Button>
              </Box>
            }
            <Typography
              sx={{
                justifySelf: "center",
                color: theme.typography.primary.black,
                fontWeight: theme.typography.primary.fontWeight,
                fontSize: theme.typography.largeFont,
              }}
            >
              Your Application For
            </Typography>
          </Box>
          
          <Box component='span' display='flex' justifyContent='center' alignItems='center' position='relative'>
            <Typography
              sx={{
                justifySelf: "center",
                color: theme.typography.primary.black,
                fontWeight: theme.typography.medium.fontWeight,
                fontSize: theme.typography.smallFont,
              }}
            >
              {formattedAddress}
            </Typography>
          </Box>
            
            <Box sx={{padding: "10px"}}>
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
                <Typography sx={{ fontWeight: theme.typography.medium.fontWeight, color: theme.typography.primary.blue}}>Applicant Personal Details</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ padding: "30px" }}> {/* Increased padding */}
                <Grid container spacing={3}> {/* Increased spacing */}
                  <Grid item xs={6}>
                    <Typography>Name: {tenantProfile?.tenant_first_name} {tenantProfile?.tenant_last_name}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>Email: {tenantProfile?.tenant_email}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>Phone: {tenantProfile?.tenant_phone_number}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>SSN: {tenantProfile?.tenant_ssn ? (getDecryptedSSN(tenantProfile?.tenant_ssn)) : "No SSN provided"}</Typography>  
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

            <Box sx={{padding: "10px"}}>
            <Accordion 
              sx={{
                marginBottom: "20px", 
                backgroundColor: "#f0f0f0", 
                borderRadius: '8px',
                margin: "auto", // Center the accordion
                minHeight: "50px" // Increase minimum height for better content display
              }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: theme.typography.medium.fontWeight, color: theme.typography.primary.blue}}>Applicant Job Details</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ padding: "30px" }}>
              <EmploymentDataGrid
                  tenantProfile={tenantProfile}
                  lease={lease}
                  selectedJobs={selectedJobs}
                  setSelectedJobs={setSelectedJobs}
                  leaseStatus={status}
                />
              </AccordionDetails>
            </Accordion>
            </Box>

            <Box sx={{padding: "10px"}}>
            <Accordion 
              sx={{
                marginBottom: "20px", 
                backgroundColor: "#f0f0f0", 
                borderRadius: '8px',
                margin: "auto", // Center the accordion
                minHeight: "50px" // Increase minimum height for better content display
              }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: theme.typography.medium.fontWeight, color: theme.typography.primary.blue}}>Occupancy Details</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ padding: "30px" }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography>Adults</Typography>
                    <AdultDataGrid adults={adultOccupants} />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography>Children</Typography>
                    <ChildDataGrid children={childOccupants} />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography>Pets</Typography>
                    <PetDataGrid pets={petOccupants} />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography>Vehicles</Typography>
                    <VehicleDataGrid vehicles={vehicles} />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
            </Box>

            <Box sx={{padding: "10px"}}>
            <Accordion 
              sx={{
                marginBottom: "20px", 
                backgroundColor: "#f0f0f0", 
                borderRadius: '8px',
                margin: "auto", // Center the accordion
                minHeight: "50px" // Increase minimum height for better content display
              }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: theme.typography.medium.fontWeight, color: theme.typography.primary.blue}}>Documents</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ padding: "30px" }}>
                <Documents documents={tenantDocuments} setDocuments={setTenantDocuments} isEditable={false} isAccord={false} contractFiles={extraUploadDocument} contractFileTypes={extraUploadDocumentType}/>
              </AccordionDetails>
            </Accordion>
            </Box>

            <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  paddingTop: "10px",
                  marginTop: "20px",
                  marginBottom: "7px",
                  width: "100%",
                }}
              >
                {(status == null || status === "" || status === "REJECTED" || status === "RESCIND" || status === "RENEW") &&
                  <Button
                    variant='contained'
                    sx={{
                      backgroundColor: "#9EAED6",
                      textTransform: "none",
                      borderRadius: "5px",
                      display: "flex",
                      width: "45%",
                      marginRight: "10px"
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
                  </Button>}
                {(status == null || status === "" || status === "NEW" || status === "REJECTED" || status === "RESCIND" || status === "RENEW") &&
                <Button
                  variant='contained'
                  sx={{
                    backgroundColor: "#CB8E8E",
                    textTransform: "none",
                    borderRadius: "5px",
                    display: "flex",
                    width: "45%",
                  }}
                  onClick={() => props.setRightPane({ type: "tenantApplicationEdit", state: { profileData: tenantProfile, lease: lease?lease : [], lease_uid: lease.length > 0 ? lease[0].lease_uid : null, setRightPane: props.setRightPane, property: property, from: props.from, tenantDocuments : tenantDocuments, setTenantDocuments : setTenantDocuments, oldVehicles : vehicles, setOldVehicles : setVehicles, adultOccupants : adultOccupants, setAdultOccupants, setAdultOccupants, petOccupants : petOccupants, setPetOccupants : setPetOccupants, childOccupants : childOccupants, setChildOccupants : setChildOccupants, extraUploadDocument : extraUploadDocument, setExtraUploadDocument : setExtraUploadDocument, extraUploadDocumentType : extraUploadDocumentType, setExtraUploadDocumentType : setExtraUploadDocumentType, deleteDocuments : deleteDocuments },})}
                >
                  <Typography
                    sx={{
                      fontWeight: theme.typography.primary.fontWeight,
                      fontSize: "14px",
                      color: "#FFFFFF",
                      textTransform: "none",
                    }}
                  >
                    Edit
                  </Typography>
                </Button>
                }
            </Box>

            {status && status === "NEW" ? (
                <>
                  <Grid item xs={12} sx={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
                    <Button
                      sx={{
                        marginTop: "10px",
                        color: "#160449",
                        backgroundColor: "#ffe230",
                        fontWeight: theme.typography.medium.fontWeight,
                        fontSize: "14px",
                        textTransform: "none",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        ":hover": {
                          color: "white",
                        },
                      }}
                      onClick={() => setShowWithdrawLeaseDialog(true)}
                    >
                      Withdraw
                    </Button>
                  </Grid>
                </>
            ) : null}
            
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
            </Box>
      </Paper>)}
    </ThemeProvider>
  );
}

export const AdultDataGrid = ({ adults }) => {
  const columns = [
    { field: 'name', headerName: 'Name', renderHeader: (params) => <strong>{params.colDef.headerName}</strong>, flex: 2, renderCell : (params) => (<Typography>{params.row.name} {params.row.last_name}</Typography>)},
    { field: 'relationship', headerName: 'Relationship', renderHeader: (params) => <strong>{params.colDef.headerName}</strong>, flex: 1},
    { field: 'dob', headerName: 'DoB', renderHeader: (params) => <strong>{params.colDef.headerName}</strong>, flex: 1},
  ];

  let rowsWithId = []

  if(adults && adults?.length !== 0){
    rowsWithId = adults.map((row, index) => ({
      ...row,
      id: row.id ? index : index,
    }));
  }

  return (
    <DataGrid
      rows={rowsWithId}
      columns={columns}
      sx={{        
        marginTop: "10px",
      }}
      autoHeight
      rowHeight={50} 
      hideFooter={true}
    />
  );

}

export const ChildDataGrid = ({ children }) => {
  const columns = [
    { field: 'name', headerName: 'Name', renderHeader: (params) => <strong>{params.colDef.headerName}</strong>, flex: 2, renderCell : (params) => (<Typography>{params.row.name} {params.row.last_name}</Typography>)},
    { field: 'relationship', headerName: 'Relationship', renderHeader: (params) => <strong>{params.colDef.headerName}</strong>, flex: 1},
    { field: 'dob', headerName: 'DoB', renderHeader: (params) => <strong>{params.colDef.headerName}</strong>, flex: 1},
  ];

  let rowsWithId = []

  if(children && children?.length !== 0){
    rowsWithId = children.map((row, index) => ({
      ...row,
      id: row.id ? index : index,
    }));
  }

  return (
    <DataGrid
      rows={rowsWithId}
      columns={columns}
      sx={{        
        marginTop: "10px",
      }}
      autoHeight
      rowHeight={50} 
      hideFooter={true}
    />
  );

}

export const PetDataGrid = ({ pets }) => {
  const columns = [
    { field: 'name', headerName: 'Name', renderHeader: (params) => <strong>{params.colDef.headerName}</strong>, flex: 2, renderCell : (params) => (<Typography>{params.row.name} {params.row.last_name}</Typography>)},
    { field: 'type', headerName: 'Type', renderHeader: (params) => <strong>{params.colDef.headerName}</strong>, flex: 1},
    { field: 'dob', headerName: 'DoB', renderHeader: (params) => <strong>{params.colDef.headerName}</strong>, flex: 1},
  ];

  let rowsWithId = []

  if(pets && pets?.length !== 0){
    rowsWithId = pets.map((row, index) => ({
      ...row,
      id: row.id ? index : index,
    }));
  }

  return (
    <DataGrid
      rows={rowsWithId}
      columns={columns}
      sx={{        
        marginTop: "10px",
      }}
      autoHeight
      rowHeight={50} 
      hideFooter={true}
    />
  );

}

export const VehicleDataGrid = ({ vehicles }) => {
  const columns = [
    { field: 'name', headerName: 'Name', renderHeader: (params) => <strong>{params.colDef.headerName}</strong>, flex: 2, renderCell : (params) => (<Typography>{params.row.make} {params.row.model}</Typography>)},
    { field: 'license', headerName: 'License', renderHeader: (params) => <strong>{params.colDef.headerName}</strong>, flex: 1, renderCell : (params) => (<Typography>{params.row.license} {params.row.state}</Typography>)},
    { field: 'year', headerName: 'Year', renderHeader: (params) => <strong>{params.colDef.headerName}</strong>, flex: 1},
  ];

  let rowsWithId = []

  if(vehicles && vehicles?.length !== 0){
    rowsWithId = vehicles.map((row, index) => ({
      ...row,
      id: row.id ? index : index,
    }));
  }

  return (
    <DataGrid
      rows={rowsWithId}
      columns={columns}
      sx={{        
        marginTop: "10px",
      }}
      autoHeight
      rowHeight={50} 
      hideFooter={true}
    />
  );

}

export const EmploymentDataGrid = ({ tenantProfile, selectedJobs, setSelectedJobs, leaseStatus, lease }) => {
  const employmentData =
    leaseStatus === "PROCESSING" || leaseStatus === "ACTIVE" || leaseStatus === "NEW"
      ? (lease?.[0]?.lease_income ? JSON.parse(lease[0].lease_income) : [])
      : (tenantProfile?.tenant_employment ? JSON.parse(tenantProfile.tenant_employment) : []);

  const handleJobSelection = (job, isChecked) => {
    setSelectedJobs((prevSelectedJobs) => {
      if (isChecked) {
        return [...prevSelectedJobs, job];
      } else {
        return prevSelectedJobs.filter((selectedJob) => selectedJob.companyName !== job.companyName);
      }
    });
  };

  // useEffect(() => {
  //     setSelectedJobs(employmentData);
  // }, [employmentData, selectedJobs, setSelectedJobs]);

  return (
    <Box sx={{ padding: '10px' }}>
      <Grid container spacing={2}>
        {employmentData.map((job, index) => (
          <Grid item xs={12} key={index}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {(leaseStatus == null || leaseStatus === "" || leaseStatus === "REJECTED" || leaseStatus === "RESCIND" || leaseStatus === "RENEW") && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedJobs.some((selectedJob) => selectedJob.companyName === job.companyName)}
                      onChange={(e) => handleJobSelection(job, e.target.checked)}
                    />
                  }
                  label=""
                />
              )}

              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  Job Title: {job.jobTitle}
                </Typography>
                <Typography variant="body2">Company: {job.companyName}</Typography>
                <Typography variant="body2">Salary: ${job.salary}</Typography>
                <Typography variant="body2">Frequency: {job.frequency}</Typography>
              </Box>
            </Box>
            <Divider sx={{ marginTop: '10px', marginBottom: '10px' }} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};


