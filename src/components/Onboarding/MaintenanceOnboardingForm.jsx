import React, { useState, useEffect, useRef, useContext, } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import AES from "crypto-js/aes";
import CryptoJS from "crypto-js";
import theme from "../../theme/theme";
import { useUser } from "../../contexts/UserContext";
import DefaultProfileImg from "../../images/defaultProfileImg.svg";
import AddressAutocompleteInput from "../Property/AddressAutocompleteInput";
import DataValidator from "../DataValidator";
import { formatPhoneNumber, formatSSN, formatEIN, identifyTaxIdType, headers, maskNumber, maskEin, roleMap, photoFields } from "./helper";
import { useOnboardingContext } from "../../contexts/OnboardingContext";
import {
  Box,
  Button,
  TextField,
  Typography,
  Avatar,
  Stack,
  Checkbox,
  FormControlLabel,
  Grid,
  CircularProgress,
  Backdrop,
  Paper,
  IconButton,
  MenuItem,
  Select,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
  Alert,
  AlertTitle,
  RadioGroup,
  Radio,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { makeStyles } from "@material-ui/core/styles";
import PayPal from "../../images/PayPal.png";
import ZelleIcon from "../../images/Zelle.png";
import VenmoIcon from "../../images/Venmo.png";
import Stripe from "../../images/Stripe.png";
import ApplePay from "../../images/ApplePay.png";
import ChaseIcon from "../../images/Chase.png";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { useCookies } from "react-cookie";
// import DashboardTab from "../TenantDashboard/NewDashboardTab";
import APIConfig from "../../utils/APIConfig";

// import AdultOccupant from "../Leases/AdultOccupant";
// import ChildrenOccupant from "../Leases/ChildrenOccupant";
// import PetsOccupant from "../Leases/PetsOccupant";
// import VehiclesOccupant from "../Leases/VehiclesOccupant";
import Documents from "../Leases/Documents";
// import { add } from "date-fns";

import ListsContext from "../../contexts/ListsContext";
import GenericDialog from "../GenericDialog";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiFilledInput-root": {
      backgroundColor: "#D6D5DA",
      borderRadius: 10,
      height: 30,
      marginBlock: 10,
      paddingBottom: "15px",
    },
  },
  errorBorder: {
    border: '1px solid red',
  },
  error: {
    color: 'red',
  },
}));

export default function MaintenanceOnboardingForm({ profileData, setIsSave }) {
  console.log("In MaintenanceOnboardingForm  - profileData", profileData);

  const { getList, } = useContext(ListsContext);	
  const classes = useStyles();
  const [cookies, setCookie] = useCookies(["default_form_vals"]);
  const cookiesData = cookies["default_form_vals"];
  const navigate = useNavigate();
  const [showSpinner, setShowSpinner] = useState(false);
  const [addPhotoImg, setAddPhotoImg] = useState();
  const [nextStepDisabled, setNextStepDisabled] = useState(false);
  const [dashboardButtonEnabled, setDashboardButtonEnabled] = useState(false);
  const { user, isBusiness, isManager, roleName, selectRole, setLoggedIn, selectedRole, updateProfileUid, isLoggedIn, getProfileId } = useUser();
  const { firstName, setFirstName, lastName, setLastName, email, setEmail, phoneNumber, setPhoneNumber, businessName, setBusinessName, photo, setPhoto } = useOnboardingContext();
  const { ein, setEin, ssn, setSsn, mask, setMask, address, setAddress, unit, setUnit, city, setCity, state, setState, zip, setZip } = useOnboardingContext();
  
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
  };

  
  const [ taxIDType, setTaxIDType ] = useState("SSN");  
  useEffect(()=> {    
    if(ein && identifyTaxIdType(ein) === "EIN") setTaxIDType("EIN");
  }, [ein])

  useEffect(()=> {        
    handleTaxIDChange(ein, false);    
  }, [taxIDType])


  const [employeePhoto, setEmployeePhoto] = useState("");
  const [paymentMethods, setPaymentMethods] = useState({
    paypal: { value: "", checked: false, uid: "" },
    apple_pay: { value: "", checked: false, uid: "" },
    stripe: { value: "", checked: false, uid: "" },
    zelle: { value: "", checked: false, uid: "" },
    venmo: { value: "", checked: false, uid: "" },
    credit_card: { value: "", checked: false, uid: "" },
    bank_account: { account_number: "", routing_number: "", checked: false, uid: "" },
  });

  const [documents, setDocuments] = useState([]);
  const [uploadedFiles, setuploadedFiles] = useState([]);
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [isPreviousFileChange, setIsPreviousFileChange] = useState(false)
  const [uploadedFileTypes, setUploadedFileTypes] = useState([]);

  const [states, setStates] = useState([]);

  const [fees, setFees] = useState([{ id: 1, fee_name: "", frequency: "", charge: "", of: "" }]);
  const [services, setServices] = useState([{ id: 1, service_name: "", hours: "", charge: "", total_cost: "" }]);
  // const [locations, setLocations] = useState([{ id: 1, address: "", city: "", state: "", miles: "" }]);
  const [locations, setLocations] = useState([]);
  const [ein_mask, setEinMask] = useState("");

  // Personal info state variables
  const [empFirstName, setEmpFirstName] = useState("");
  const [empLastName, setEmpLastName] = useState("");
  const [empPhoneNumber, setEmpPhoneNumber] = useState("");
  const [empEmail, setEmpEmail] = useState("");
  const [empAddress, setEmpAddress] = useState("");
  const [empUnit, setEmpUnit] = useState("");
  const [empCity, setEmpCity] = useState("");
  const [empState, setEmpState] = useState("");
  const [empZip, setEmpZip] = useState("");
  const [empSsn, setEmpSsn] = useState("");
  const [empMask, setEmpMask] = useState("");

  const [modifiedData, setModifiedData] = useState([]);

  const [isUpdate, setIsUpdate] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const [ errors, setErrors ] = useState({})

  const getListDetails = async () => {        
    const states = getList("states");
    setStates(states);    
  };

  // useEffect(() => {
  //   console.log("paymentMethods - ", paymentMethods);
  // }, [paymentMethods]);

  // useEffect(() => {
  //   console.log("fees - ", fees);
  // }, [fees]);

  // useEffect(() => {
  //   console.log("modifiedData - ", modifiedData);
  // }, [modifiedData]);

  // useEffect(() => {
  //   console.log("documents - ", documents);
  // }, [documents]);

  const updateModifiedData = (updatedItem) => {
    setModifiedData((prev) => {
      const existingKeyIndex = prev.findIndex((item) => item.key === updatedItem.key);

      if (existingKeyIndex !== -1) {
        return prev.map((item, index) => (index === existingKeyIndex ? { ...item, value: updatedItem.value } : item));
      }
      return [...prev, { key: updatedItem.key, value: updatedItem.value }];
    });
  };

  const handleBusinessNameChange = (event) => {
    setBusinessName(event.target.value);
    updateModifiedData({ key: "business_name", value: event.target.value });
  };

  const handleBusinessAddressSelect = (address) => {
    setAddress(address.street ? address.street : "");
    updateModifiedData({ key: "business_address", value: address.street ? address.street : "" });
    setCity(address.city ? address.city : "");
    updateModifiedData({ key: "business_city", value: address.city ? address.city : "" });
    setState(address.state ? address.state : "");
    updateModifiedData({ key: "business_state", value: address.state ? address.state : "" });
    setZip(address.zip ? address.zip : "");
    updateModifiedData({ key: "business_zip", value: address.zip ? address.zip : "" });
  };

  const handleBusinessUnitChange = (event) => {
    setUnit(event.target.value);
    updateModifiedData({ key: "business_unit", value: event.target.value });
  };

  const handleBusinessEmailChange = (event) => {
    setEmail(event.target.value);
    updateModifiedData({ key: "business_email", value: event.target.value });
  };

  const handleBusinessPhoneNumberChange = (event) => {
    setPhoneNumber(formatPhoneNumber(event.target.value));
    updateModifiedData({ key: "business_phone_number", value: formatPhoneNumber(event.target.value) });
  };

  // const handleEINChange = (event) => {
  //   let value = event.target.value;
  //   if (value.length > 11) return;
  //   setEin(value);

  //   updateModifiedData({ key: "business_ein_number", value: AES.encrypt(event.target.value, process.env.REACT_APP_ENKEY).toString() });
  // };

  const handleTaxIDChange = (value, onchangeflag) => {
    // let value = event.target.value;
    if (value?.length > 11) return;

    let updatedTaxID = ""
    if(taxIDType === "EIN"){
      updatedTaxID = formatEIN(value)      
    } else {
      updatedTaxID = formatSSN(value)      
    }
    setEin(updatedTaxID);
    if(onchangeflag){
  // updateModifiedData({ key: "business_ein_number", value: AES.encrypt(event.target.value, process.env.REACT_APP_ENKEY).toString() });
  updateModifiedData({ key: "business_ein_number", value: AES.encrypt(updatedTaxID, process.env.REACT_APP_ENKEY).toString() });
  
    }
  };

  const handleEmpFirstNameChange = (event) => {
    setEmpFirstName(event.target.value);
    updateModifiedData({ key: "employee_first_name", value: event.target.value });
  };

  const handleEmpLastNameChange = (event) => {
    setEmpLastName(event.target.value);
    updateModifiedData({ key: "employee_last_name", value: event.target.value });
  };

  const handlePersonalAddressSelect = (address) => {
    setEmpAddress(address.street ? address.street : "");

    updateModifiedData({ key: "employee_address", value: address.street ? address.street : "" });
    setEmpCity(address.city ? address.city : "");
    updateModifiedData({ key: "employee_city", value: address.city ? address.city : "" });
    setEmpState(address.state ? address.state : "");
    updateModifiedData({ key: "employee_state", value: address.state ? address.state : "" });
    setEmpZip(address.zip ? address.zip : "");
    updateModifiedData({ key: "employee_zip", value: address.zip ? address.zip : "" });
  };

  const handleEmpUnitChange = (event) => {
    setEmpUnit(event.target.value);
    updateModifiedData({ key: "employee_unit", value: event.target.value });
  };

  const handleEmpEmailChange = (event) => {
    setEmpEmail(event.target.value);
    updateModifiedData({ key: "employee_email", value: event.target.value });
  };

  const handleEmpPhoneNumberChange = (event) => {
    setEmpPhoneNumber(formatPhoneNumber(event.target.value));
    updateModifiedData({ key: "employee_phone_number", value: formatPhoneNumber(event.target.value) });
  };

  const handleEmpSSNChange = (event) => {
    let value = event.target.value;
    if (value.length > 11) return;
    setEmpSsn(formatSSN(value));
    updateModifiedData({ key: "employee_ssn", value: AES.encrypt(event.target.value, process.env.REACT_APP_ENKEY).toString() });
  };

  const setProfileData = async () => {
    setShowSpinner(true);
    try {
      //     const profileResponse = await axios.get(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/profile/${getProfileId()}`);
      // const profileData = profileResponse.data.profile.result[0];

      setBusinessName(profileData.business_name || "");
      setEmail(profileData.business_email || "");
      setPhoneNumber(formatPhoneNumber(profileData.business_phone_number || ""));
      setPhoto(profileData.business_photo_url ? { image: profileData.business_photo_url } : null);
      setEin(profileData.business_ein_number ? AES.decrypt(profileData.business_ein_number, process.env.REACT_APP_ENKEY).toString(CryptoJS.enc.Utf8) : "");
      setMask(profileData.business_ein_number ? maskNumber(AES.decrypt(profileData.business_ein_number, process.env.REACT_APP_ENKEY).toString(CryptoJS.enc.Utf8)) : "");
      setAddress(profileData.business_address || "");
      setUnit(profileData.business_unit || "");
      setCity(profileData.business_city || "");
      setState(profileData.business_state || "");
      setZip(profileData.business_zip || "");
      if (profileData.business_services_fees) {
        const parsedServices = JSON.parse(profileData.business_services_fees);
        const servicesWithId = parsedServices.map((service, index) => ({
          ...service,
          id: index, // You can use index as an id, or generate a unique id if necessary
        }));
        setServices(servicesWithId);
      }
      if (profileData.business_locations) {
        const parsedLocations = JSON.parse(profileData.business_locations);
        const locationsWithId = parsedLocations?.map((loc, index) => ({
          ...loc,
          id: index,
        }));        
        setLocations(locationsWithId);
      }

      const parsedDocs = JSON.parse(profileData.business_documents);
      // console.log("parsedDocs - ", parsedDocs);
      // const docs = parsedDocs
      //   ? parsedDocs.map((doc, index) => ({
      //       ...doc,
      //       id: index,
      //     }))
      //   : [];
      // console.log('initial docs', docs);
      setDocuments(parsedDocs || []);

      const paymentMethodsData = JSON.parse(profileData.paymentMethods);
      const updatedPaymentMethods = {
        paypal: { value: "", checked: false, uid: "", status: "Inactive" },
        apple_pay: { value: "", checked: false, uid: "", status: "Inactive" },
        stripe: { value: "", checked: false, uid: "", status: "Inactive" },
        zelle: { value: "", checked: false, uid: "", status: "Inactive" },
        venmo: { value: "", checked: false, uid: "", status: "Inactive" },
        credit_card: { value: "", checked: false, uid: "", status: "Inactive" },
        bank_account: { account_number: "", routing_number: "", checked: false, uid: "", status: "Inactive" },
      };
      paymentMethodsData?.forEach((method) => {
        const status = method.paymentMethod_status || "Inactive";
        if (method.paymentMethod_type === "bank_account") {
          updatedPaymentMethods.bank_account = {
            account_number: method.paymentMethod_account_number || "",
            routing_number: method.paymentMethod_routing_number || "",
            checked: status === "Active",
            uid: method.paymentMethod_uid,
            status,
          };
        } else {
          updatedPaymentMethods[method.paymentMethod_type] = {
            value: method.paymentMethod_name,
            checked: status === "Active",
            uid: method.paymentMethod_uid,
            status,
          };
        }
      });
      setPaymentMethods(updatedPaymentMethods);

      setShowSpinner(false);
    } catch (error) {
      console.error("Error fetching profile data:", error);
      setShowSpinner(false);
    }
    try {
      // const employeeResponse = await axios.get(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/employee/${getProfileId()}`);
      // const employeeData = employeeResponse.data.employee.result[0];

      setEmpFirstName(profileData.employee_first_name || "");
      setEmpLastName(profileData.employee_last_name || "");
      setEmpPhoneNumber(formatPhoneNumber(profileData.employee_phone_number || ""));
      setEmpEmail(profileData.employee_email || "");
      setEmployeePhoto(profileData.employee_photo_url ? { image: profileData.employee_photo_url } : null);
      setEmpSsn(profileData.employee_ssn ? AES.decrypt(profileData.employee_ssn, process.env.REACT_APP_ENKEY).toString(CryptoJS.enc.Utf8) : "");
      setEmpMask(profileData.employee_ssn ? maskNumber(AES.decrypt(profileData.employee_ssn, process.env.REACT_APP_ENKEY).toString(CryptoJS.enc.Utf8)) : "");
      setEmpAddress(profileData.employee_address || "");
      setEmpUnit(profileData.employee_unit || "");
      setEmpCity(profileData.employee_city || "");
      setEmpState(profileData.employee_state || "");
      setEmpZip(profileData.employee_zip || "");

      setShowSpinner(false);
    } catch (error) {
      console.error("Error fetching employee data:", error);
      setShowSpinner(false);
    }
  };

  useEffect(() => {
    console.log("calling useeffect");
    setIsSave(false);

    setProfileData();

    getListDetails();
  }, []);

  useEffect(() => {
    console.log("calling profileData useEffect");

    setIsSave(false);
    setProfileData();
  }, [profileData]);

  const readImage = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      file.image = e.target.result;
      setPhoto(file);
    };
    reader.readAsDataURL(file.file);
  };

  const handlePhotoChange = (e) => {
    const file = {
      index: 0,
      file: e.target.files[0],
      image: null,
    };
    let isLarge = file.file.size > 5000000;
    let file_size = (file.file.size / 1000000).toFixed(1);
    if (isLarge) {
      openDialog("Alert",`Your file size is too large (${file_size} MB)`,"info");
      return;
    }
    updateModifiedData({ key: "business_photo", value: e.target.files[0] })
    readImage(file);
  };

  const readEmpImage = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      file.image = e.target.result;
      setEmployeePhoto(file);
    };
    reader.readAsDataURL(file.file);
  };

  const handleEmpPhotoChange = (e) => {
    const file = {
      index: 0,
      file: e.target.files[0],
      image: null,
    };
    let isLarge = file.file.size > 5000000;
    let file_size = (file.file.size / 1000000).toFixed(1);
    if (isLarge) {
      openDialog("Alert",`Your file size is too large (${file_size} MB)`,"info");
      return;
    }
    updateModifiedData({ key: "employee_photo_url", value: e.target.files[0] });
    
    readEmpImage(file);
  };

  const addFeeRow = () => {
    setFees((prev) => [...prev, { id: prev.length + 1, fee_name: "", frequency: "", charge: "", of: "" }]);
  };

  const removeFeeRow = (id) => {
    setFees(fees.filter((fee) => fee.id !== id));
  };

  const handleServiceChange = (event, id) => {
    const { name, value } = event.target;

    const updatedServices = services.map((service) => {
      if (service.id === id) {
        const updatedService = { ...service, [name]: value };

        if (name === "charge" || name === "hours") {
          if (updatedService.hours && updatedService.hours > 0 && value > 0) {
            updatedService.total_cost = updatedService.hours * updatedService.charge;
          }
        }

        return updatedService;
      }
      return service;
    });

    // Update the state with the modified fees array
    setServices(updatedServices);

    updateModifiedData({ key: "business_services_fees", value: JSON.stringify(updatedServices) });
  };

  const addServiceRow = () => {
    // setServices((prev) => [...prev, { id: prev.length + 1, service_name: "", hours: "", charge: "", total_cost: "" }]);

    const updatedServices = [...services, { id: services.length + 1, service_name: "", hours: "", charge: "", total_cost: "" }];

    setServices(updatedServices);

    updateModifiedData({ key: "business_services_fees", value: JSON.stringify(updatedServices) });
  };

  const removeServiceRow = (id) => {
    const updatedServices = services.filter((service) => service.id !== id);
    setServices(updatedServices);

    updateModifiedData({ key: "business_services_fees", value: JSON.stringify(updatedServices) });
  };

  const handleFrequencyChange = (event, id) => {
    const { value } = event.target;
    setFees((prevFees) => prevFees.map((fee) => (fee.id === id ? { ...fee, frequency: value } : fee)));
  };

  const renderMaintenanceServices = () => {
    return services.map((row, index) => (
      <>
        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} key={row.id}>
          <Grid item xs={3}>
            <Stack spacing={-2} m={2}>
              <Typography
                sx={{
                  color: theme.typography.common.blue,
                  fontWeight: theme.typography.primary.fontWeight,
                }}
              >
                {"Service"}
              </Typography>
              <TextField
                name='service_name'
                value={row.service_name}
                variant='filled'
                fullWidth
                placeholder='Service Name'
                className={classes.root}
                onChange={(e) => handleServiceChange(e, row.id)}
              />
            </Stack>
          </Grid>
          <Grid item xs={2}>
            <Stack spacing={-2} m={2}>
              <Typography
                sx={{
                  color: theme.typography.common.blue,
                  fontWeight: theme.typography.primary.fontWeight,
                }}
              >
                {"# of Hours"}
              </Typography>
              <TextField name='hours' value={row.hours} variant='filled' fullWidth placeholder='Hours' className={classes.root} onChange={(e) => handleServiceChange(e, row.id)} />
            </Stack>
          </Grid>
          <Grid item xs={3}>
            <Stack spacing={-2} m={2}>
              <Typography
                sx={{
                  color: theme.typography.common.blue,
                  fontWeight: theme.typography.primary.fontWeight,
                }}
              >
                {"Charge / Hr "}
              </Typography>
              <TextField
                name='charge'
                value={row.charge}
                variant='filled'
                fullWidth
                placeholder='Service Charge'
                className={classes.root}
                onChange={(e) => handleServiceChange(e, row.id)}
              />
            </Stack>
          </Grid>
          <Grid item xs={3}>
            <Stack spacing={-2} m={2}>
              <Typography
                sx={{
                  color: theme.typography.common.blue,
                  fontWeight: theme.typography.primary.fontWeight,
                }}
              >
                {"Total Cost"}
              </Typography>
              <TextField
                disabled
                name='total_cost'
                value={row.total_cost}
                variant='filled'
                fullWidth
                placeholder='Total Cost'
                className={classes.root}
                // onChange={(e) => handleServiceChange(e, row.id)}
              />
            </Stack>
          </Grid>
          <Grid container justifyContent='center' alignContent='center' item xs={1}>
            <Button
              aria-label='delete'
              sx={{
                color: "#000000",
                fontWeight: "bold",
                "&:hover": {
                  color: "#FFFFFF",
                },
              }}
              onClick={() => removeServiceRow(row.id)}
            >
              <DeleteIcon sx={{ fontSize: 19, color: "#3D5CAC" }} />
            </Button>
          </Grid>
        </Grid>
      </>
    ));
  };

  const handleServiceLocationChange = (event, id) => {
    const { name, value } = event.target;

    const updatedLocations = locations?.map((loc) => {
      if (loc.id === id) {
        const updatedLoc = { ...loc, [name]: value };
        return updatedLoc;
      }
      return loc;
    });

    // Update the state with the modified fees array
    setLocations(updatedLocations);

    updateModifiedData({ key: "business_locations", value: JSON.stringify(updatedLocations) });
  }

  const addServiceLocationRow = () => {
    const updatedLocations = [...locations, { id: locations.length + 1, address: "", city: "", state: "", miles: "" }];    

    setLocations(updatedLocations);

    updateModifiedData({ key: "business_locations", value: JSON.stringify(updatedLocations) });
  };

  const removeServiceLocationRow = (id) => {
    const updatedLocations = locations?.filter((loc) => loc.id !== id);
    setLocations(updatedLocations);

    updateModifiedData({ key: "business_locations", value: JSON.stringify(updatedLocations) });
  };
  
  const handleServiceLocationAddressSelect = (id, address) => {      
    const updatedLocations = locations?.map((loc) => {
      if (loc.id === id) {
        const updatedLoc = { 
          ...loc,
          ['address']: address.street ? address.street : "",
          ['city']: address.city ? address.city : "",
          ['state']: address.state ? address.state : ""
        };
        return updatedLoc;
      }
      return loc;
    });

    // Update the state with the modified fees array
    setLocations(updatedLocations);

    updateModifiedData({ key: "business_locations", value: JSON.stringify(updatedLocations) });


  };

  const renderServiceLocations = () => {
    return locations?.map((row, index) => (
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} key={row.id}>
          <Grid item xs={3}>
            <Stack spacing={-2} m={2}>
              <Typography
                sx={{
                  color: theme.typography.common.blue,
                  fontWeight: theme.typography.primary.fontWeight,
                }}
              >
                {"Address"}
              </Typography>
              {/* <TextField
                name='address'
                value={row.address}
                variant='filled'
                fullWidth
                placeholder='Address'
                className={classes.root}
                // onChange={(e) => handleFeeChange(e, row.id)}
                onChange={(e) => handleServiceLocationChange(e, row.id)}
              /> */}
              <Grid item xs={12} sx={{ paddingTop: '10px',}}>
                <AddressAutocompleteInput onAddressSelect={handleServiceLocationAddressSelect} gray={true} defaultValue={row.address} rowID={row.id}/>
              </Grid>
            </Stack>
          </Grid>

          <Grid item xs={3}>
            <Stack spacing={-2} m={2}>
              <Typography
                sx={{
                  color: theme.typography.common.blue,
                  fontWeight: theme.typography.primary.fontWeight,
                }}
              >
                {"City"}
              </Typography>
              <TextField
                disabled
                name='city'
                value={row.city}
                variant='filled'
                fullWidth
                placeholder='City'
                className={classes.root}
                // onChange={(e) => handleFeeChange(e, row.id)}
                onChange={(e) => handleServiceLocationChange(e, row.id)}
              />
            </Stack>
          </Grid>

          <Grid item xs={2}>
            <Stack spacing={-2} m={2}>
              <Typography
                sx={{
                  color: theme.typography.common.blue,
                  fontWeight: theme.typography.primary.fontWeight,
                }}
              >
                {"State"}
              </Typography>
              <TextField
                disabled
                name='state'
                value={row.state}
                variant='filled'
                fullWidth
                placeholder='State'
                className={classes.root}
                // onChange={(e) => handleFeeChange(e, row.id)}
                onChange={(e) => handleServiceLocationChange(e, row.id)}
              />
            </Stack>
          </Grid>

          <Grid item xs={3}>
            <Stack spacing={-2} m={2}>
              <Typography
                sx={{
                  color: theme.typography.common.blue,
                  fontWeight: theme.typography.primary.fontWeight,
                }}
              >
                {"Miles"}
              </Typography>
              <TextField
                name='miles'
                value={row.miles}
                variant='filled'
                fullWidth
                placeholder='Miles'
                className={classes.root}
                // onChange={(e) => handleFeeChange(e, row.id)}
                onChange={(e) => handleServiceLocationChange(e, row.id)}
              />
            </Stack>
          </Grid>
                            
          <Grid container justifyContent='center' alignContent='center' item xs={1}>
            <Button
              aria-label='delete'
              sx={{
                color: "#000000",
                fontWeight: "bold",
                "&:hover": {
                  color: "#FFFFFF",
                },
              }}
              onClick={() => removeServiceLocationRow(row.id)}
            >
              <DeleteIcon sx={{ fontSize: 19, color: "#3D5CAC" }} />
            </Button>
          </Grid>

          {index !== 0 && (
            <IconButton aria-label='delete' sx={{ position: "absolute", top: 0, right: 0 }} onClick={() => removeServiceLocationRow(row.id)}>
              <CloseIcon />
            </IconButton>
          )}
        </Grid>
    ));
  };

  const paymentMethodsArray = [
    { name: "PayPal", icon: PayPal, state: paymentMethods.paypal },
    { name: "Apple Pay", icon: ApplePay, state: paymentMethods.apple_pay },
    { name: "Stripe", icon: Stripe, state: paymentMethods.stripe },
    { name: "Zelle", icon: ZelleIcon, state: paymentMethods.zelle },
    { name: "Venmo", icon: VenmoIcon, state: paymentMethods.venmo },
    { name: "Credit Card", icon: ChaseIcon, state: paymentMethods.credit_card },
    { name: "Bank Account", icon: ChaseIcon, state: paymentMethods.bank_account },
  ];
  const [modifiedPayment, setModifiedPayment] = useState(false);
  const renderPaymentMethods = () => {
    return paymentMethodsArray.map((method, index) => (
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} key={index}>
        <Grid item xs={1}>
          <Checkbox name={method.name.toLowerCase().replace(/\s/g, "_")} checked={method.state?.checked} onChange={handleChangeChecked} />
        </Grid>
        {/* {
          (method.name !== "Credit Card" && method.name !== "Bank Account") && (
            <Grid container alignContent='center' item xs={1}>
              <img src={method.icon} alt={method.name} />
            </Grid>
          )
        } */}

        <Grid container alignContent='center' item xs={1}>
          <img src={method.icon} alt={method.name} />
        </Grid>

        {method.name === "Bank Account" ? (
          <>
            <Grid item xs={5}>
              <TextField
                name={`${method.name.toLowerCase().replace(/\s/g, "_")}_account`}
                value={method.state?.account_number}
                onChange={handleChangeValue}
                variant='filled'
                fullWidth
                placeholder={`Enter Your Bank Account Number`}
                disabled={!method.state?.checked}
                className={classes.root}
                InputProps={{
                  className: method.state?.value === "" && method.state?.checked ? classes.errorBorder : '',
                }}
                required
              />
            </Grid>
            <Grid item xs={5}>
              <TextField
                name={`${method.name.toLowerCase().replace(/\s/g, "_")}_routing`}
                value={method.state?.routing_number}
                onChange={handleChangeValue}
                variant='filled'
                fullWidth
                placeholder={`Enter Your Bank Routing Number`}
                disabled={!method.state?.checked}
                className={classes.root}                
              />
            </Grid>
          </>
        ) : (
          <Grid item xs={10}>
            <TextField
              name={method.name.toLowerCase().replace(/\s/g, "_")}
              value={method.state?.value}
              onChange={handleChangeValue}
              variant='filled'
              fullWidth
              placeholder={`Enter ${method.name}`}
              disabled={!method.state?.checked}
              className={classes.root}
              InputProps={{
                className: method.state?.value === "" && method.state?.checked ? classes.errorBorder : '',
              }}
              required
            />
          </Grid>
        )}
      </Grid>
    ));
  };

  const handleChangeChecked = (e) => {
    const { name, checked } = e.target;
    const map = { ...paymentMethods };
    map[name].checked = checked;
    // console.log("handleChangeChecked - map[name]", map[name])
    // if (name === "bank_account") {
    //   if (!checked) {
    //     map.bank_account.account_number = "";
    //     map.bank_account.routing_number = "";
    //   }
    // } else {
    //   if (!checked) {
    //     map[name].value = "";
    //   }
    // }
    setPaymentMethods(map);
    setModifiedPayment(true);
  };

  const handleChangeValue = (e) => {
    const { name, value } = e.target;
    if (name === "bank_account_account" || name === "bank_account_routing") {
      setPaymentMethods((prevState) => ({
        ...prevState,
        bank_account: {
          ...prevState.bank_account,
          [name === "bank_account_account" ? "account_number" : "routing_number"]: value,
        },
      }));
    } else {
      setPaymentMethods((prevState) => ({
        ...prevState,
        [name]: { ...prevState[name], value },
      }));
    }
    setModifiedPayment(true);
  };

  const handlePaymentStep = async () => {
    setShowSpinner(true);
    const keys = Object.keys(paymentMethods);
    const putPayload = [];
    const postPayload = [];
    keys.forEach((key) => {
      if (paymentMethods[key].value !== "" || (key === "bank_account" && paymentMethods[key].checked)) {
        let paymentMethodPayload = {
          paymentMethod_type: key,
          paymentMethod_profile_id: getProfileId(),
        };
        if (key === "bank_account") {
          const bankAccount = paymentMethods[key];
          if (bankAccount.routing_number && bankAccount.account_number) {
            paymentMethodPayload.paymentMethod_routing_number = bankAccount.routing_number;
            paymentMethodPayload.paymentMethod_account_number = bankAccount.account_number;
            paymentMethodPayload.paymentMethod_status = bankAccount.checked ? "Active" : "Inactive";
            if (bankAccount.uid) {
              putPayload.push({ ...paymentMethodPayload, paymentMethod_uid: bankAccount.uid });
            } else {
              postPayload.push(paymentMethodPayload);
            }
          }
        } else {
          paymentMethodPayload.paymentMethod_name = paymentMethods[key].value;
          paymentMethodPayload.paymentMethod_status = paymentMethods[key].checked ? "Active" : "Inactive";
          if (paymentMethods[key].uid) {
            putPayload.push({ ...paymentMethodPayload, paymentMethod_uid: paymentMethods[key].uid });
          } else {
            postPayload.push(paymentMethodPayload);
          }
        }
      }
    });

    if (putPayload.length > 0) {
      await axios.put("https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/paymentMethod", putPayload, { headers: { "Content-Type": "application/json" } });
    }

    if (postPayload.length > 0) {
      await axios.post("https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/paymentMethod", postPayload, { headers: { "Content-Type": "application/json" } });
    }

    setShowSpinner(false);
    setCookie("default_form_vals", { ...cookiesData, paymentMethods });
  };

  const handleNextStep = async () => {
    const newErrors = {};
    if (!businessName) newErrors.businessName = 'Business name is required';    
    if (!address) newErrors.address = 'Address is required';        
    if (!email) newErrors.email = 'Email is required';
    if (!phoneNumber) newErrors.phoneNumber = 'Phone Number is required';
    if (!ein) newErrors.ein = 'SSN is required';

    if (!empFirstName) newErrors.empFirstName = 'First name is required';
    if (!empLastName) newErrors.empLastName = 'Last name is required';
    // if (!empEmail) newErrors.empEmail = 'Email is required';
    // if (!empPhoneNumber) newErrors.empPhoneNumber = 'Email is required';
    // if (!empSsn) newErrors.empSsn = 'SSN is required';
    
    let paymentMethodsError = false;
    let atleaseOneActive = false;
    Object.keys(paymentMethods)?.forEach( method => {
      // console.log("payment method - ", paymentMethods[method]);
      const payMethod = paymentMethods[method];
      
      if(payMethod.value === '' && payMethod.checked === true ){
        paymentMethodsError = true;
      }
      if(payMethod.checked === true ){
        atleaseOneActive = true;
      }      

    })

    if(!atleaseOneActive){
      newErrors.paymentMethods = 'Atleast one active payment method is required';
      openDialog("Alert",'Atleast one active payment method is required',"info");
      return;
    }

    if(paymentMethodsError){
      newErrors.paymentMethods = 'Please check payment method details';
      openDialog("Alert",'Please check payment method details',"info");
      return;
    }
    
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors); // Show errors if any field is empty
      openDialog("Alert","Please enter all required fields","info");
      return;
    }

    setErrors({}); // Clear any previous errors


    if (!DataValidator.email_validate(email)) {
      openDialog("Alert","Please enter a valid email","info");
      return false;
    }

    if (!DataValidator.phone_validate(phoneNumber)) {
      openDialog("Alert","Please enter a valid phone number","info");
      return false;
    }

    if (!DataValidator.zipCode_validate(zip)) {
      openDialog("Alert","Please enter a valid zip code","info");
      return false;
    }

    if (empSsn && !DataValidator.ssn_validate(empSsn)) {
      openDialog("Alert","Please enter a valid SSN","info");
      return false;
    }

    if((taxIDType === "EIN" && !DataValidator.ein_validate(ein)) || (taxIDType === "SSN" && !DataValidator.ssn_validate(ein))){
      openDialog("Alert","Please enter a valid Tax ID","info");
      return false;
    }

    setCookie("default_form_vals", { ...cookiesData, firstName, lastName });

    // const payload = getPayload();
    // const form = encodeForm(payload);
    // const data = await saveProfile(form);

    saveProfile();

    if(modifiedPayment){
      const paymentSetup = await handlePaymentStep();
    }
    setShowSpinner(false);
    return;
  };

  const showSnackbar = (message, severity) => {
    console.log("Inside show snackbar");
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleUpdate = () => {
    // setIsUpdate( prevState => !prevState);
    console.log("handleUpdate called");
    setIsSave(true);
  };

  const saveProfile = async () => {
    console.log("inside saveProfile", modifiedData);
    try {
      if (modifiedData.length > 0 || isPreviousFileChange || deletedFiles?.length > 0 || uploadedFiles?.length > 0) {
        setShowSpinner(true);
        const headers = {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "*",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Credentials": "*",
        };

        const profileFormData = new FormData();

        // const feesJSON = JSON.stringify(leaseFees)
        // leaseApplicationFormData.append("lease_fees", feesJSON);
        // leaseApplicationFormData.append('lease_adults', leaseAdults ? JSON.stringify(adultsRef.current) : null);
        let hasEmployeeKey = false;
        let hasBusinessKey = false;
        modifiedData.forEach((item) => {
          console.log(`Key: ${item.key}`);
          profileFormData.append(item.key, item.value);

          if (item.key.startsWith("employee_")) {
            hasEmployeeKey = true;
          }
          if (item.key.startsWith("business_")) {
            hasBusinessKey = true;
          }
        });

        if(isPreviousFileChange){
          hasBusinessKey = true
          profileFormData.append("business_documents", JSON.stringify(documents));
        }

        if(deletedFiles && deletedFiles?.length !== 0){
          hasBusinessKey = true
          profileFormData.append("delete_documents", JSON.stringify(deletedFiles));
        }

        if (uploadedFiles && uploadedFiles?.length) {
          hasBusinessKey = true
          const documentsDetails = [];
          [...uploadedFiles].forEach((file, i) => {
    
            profileFormData.append(`file_${i}`, file);
            const fileType = uploadedFileTypes[i] || "";
            const documentObject = {
              // file: file,
              fileIndex: i, //may not need fileIndex - will files be appended in the same order?
              fileName: file.name, //may not need filename
              contentType: fileType, // contentType = "contract or lease",  fileType = "pdf, doc"
            };
            documentsDetails.push(documentObject);
          });
    
          profileFormData.append("business_documents_details", JSON.stringify(documentsDetails));
        }

        if (hasBusinessKey) {
          profileFormData.append("business_uid", profileData.business_uid);
        }

        if (hasEmployeeKey) {
          profileFormData.append("employee_uid", profileData.employee_uid);
        }

        axios
          .put("https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/profile", profileFormData, headers)
          // axios.put('http://localhost:4000/profile', profileFormData, headers)
          .then((response) => {
            console.log("Data updated successfully", response);
            openDialog("Success","Your profile has been successfully updated.", "success");
            handleUpdate();
            setShowSpinner(false);
          })
          .catch((error) => {
            setShowSpinner(false);
            openDialog("Error","Cannot update your profile. Please try again", "error");
            if (error.response) {
              console.log(error.response.data);
            }
          });
        setShowSpinner(false);
        setModifiedData([]);
        setuploadedFiles([]);
        setUploadedFileTypes([]);
        setDeletedFiles([]);
        setIsPreviousFileChange(false)
      }
      // else {
      //     showSnackbar("You haven't made any changes to the form. Please save after changing the data.", "error");
      // }
    } catch (error) {
      openDialog("Error","Cannot update your profile. Please try again", "error");
      console.log("Cannot Update your profile", error);
      setShowSpinner(false);
    }
  };

  const editOrUpdateProfile = async () => {
    console.log("inside editOrUpdateProfile", modifiedData);
    try {
      if (modifiedData.length > 0) {
        setShowSpinner(true);
        const headers = {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "*",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Credentials": "*",
        };

        const profileFormData = new FormData();

        // const feesJSON = JSON.stringify(leaseFees)
        // leaseApplicationFormData.append("lease_fees", feesJSON);
        // leaseApplicationFormData.append('lease_adults', leaseAdults ? JSON.stringify(adultsRef.current) : null);
        modifiedData.forEach((item) => {
          console.log(`Key: ${item.key}`);
          // if (item.key === "uploadedFiles") {
          //   console.log("uploadedFiles", item.value);
          //   if (item.value.length) {
          //     const documentsDetails = [];
          //     [...item.value].forEach((fileItem, i) => {
          //       profileFormData.append(`file_${i}`, fileItem.file, fileItem.name);
          //       const fileType = "pdf";
          //       const documentObject = {
          //         // file: file,
          //         fileIndex: i,
          //         fileName: fileItem.name,
          //         contentType: fileItem.contentType,
          //       };
          //       documentsDetails.push(documentObject);
          //     });
          //     profileFormData.append("business_documents_details", JSON.stringify(documentsDetails));
          //   }
          // } else {

            // If key is ein_number then we should have to pass value directly instead of converting into string
            if(item.key !== "business_ein_number"){
              profileFormData.append(item.key, JSON.stringify(item.value));
            }else{
              profileFormData.append(item.key, item.value);
            }
          // }
        });

        profileFormData.append("business_uid", profileData.business_uid);

        // console.log("editOrUpdateProfile - profileFormData - ");
        for (var pair of profileFormData.entries()) {
          console.log(pair[0] + ", " + pair[1]);
        }

        axios
          .put("https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/profile", profileFormData, headers)
          .then((response) => {
            // console.log("Data updated successfully", response);
            openDialog("Success","Your profile has been successfully updated.", "success");
            handleUpdate();
            setShowSpinner(false);
          })
          .catch((error) => {
            setShowSpinner(false);
            openDialog("Error","Cannot update your profile. Please try again", "error");
            if (error.response) {
              console.log(error.response.data);
            }
          });
        setShowSpinner(false);
        setModifiedData([]);
      } else {
        openDialog("Warning","You haven't made any changes to the form. Please save after changing the data.", "error");
      }
    } catch (error) {
      openDialog("Error","Cannot update the lease. Please try again", "error");
      // console.log("Cannot Update the lease", error);
      setShowSpinner(false);
    }
  };

  return (
    <>
      <Grid container sx={{ backgroundColor: "#f0f0f0", borderRadius: "10px", cursor: "pointer", marginBottom: "10px", padding: "10px" }}>
        <Grid item xs={12}>
          <Typography align='center' gutterBottom sx={{ fontSize: "24px", fontWeight: "bold", color: "#1f1f1f" }}>
            Maintenance Profile Information
          </Typography>
          <Grid container item xs={12}>
            <Grid container alignContent='center' item xs={3}>
              <Grid container justifyContent='center' item xs={12}>
                {photo && photo.image ? (
                  <img
                    key={Date.now()}
                    src={photo.image}
                    style={{
                      width: "121px",
                      height: "121px",
                      objectFit: "cover",
                      borderRadius: "50%",
                    }}
                    alt='profile'
                  />
                ) : (
                  <img src={DefaultProfileImg} alt='default' style={{ width: "121px", height: "121px", borderRadius: "50%" }} />
                )}
              </Grid>
              <Grid container justifyContent='center' item xs={12} sx={{ marginTop: "20px" }}>
                <Button
                  component='label'
                  variant='contained'
                  sx={{
                    backgroundColor: "#3D5CAC",
                    width: "193px",
                    height: "35px",
                    color: "#FFFFFF",
                    textTransform: "none",
                    fontWeight: "bold",
                  }}
                >
                  {" "}
                  Add Profile Pic
                  <input type='file' hidden accept='image/*' onChange={handlePhotoChange} />
                </Button>
              </Grid>
            </Grid>
            <Grid item xs={9}>
              <Grid item xs={12}>
                <Typography
                  sx={{
                    color: theme.typography.common.blue,
                    fontWeight: theme.typography.primary.fontWeight,
                    width: "100%",
                  }}
                >
                  {"Business Name"}
                </Typography>
              </Grid>
              <Grid container item xs={12} columnSpacing={2}>
                <Grid item xs={12}>
                  <TextField
                    name='businessName'
                    value={businessName}
                    onChange={(e) => handleBusinessNameChange(e)}
                    variant='filled'
                    fullWidth
                    placeholder='Business name'
                    className={classes.root}
                    InputProps={{
                      className: errors.businessName || !businessName ? classes.errorBorder : '',
                    }}
                    required
                  />
                </Grid>
              </Grid>
              <Grid container item xs={12} columnSpacing={4}>
                <Grid container item xs={3}>
                  <Grid item xs={12}>
                    <Typography
                      sx={{
                        color: theme.typography.common.blue,
                        fontWeight: theme.typography.primary.fontWeight,
                        width: "100%",
                      }}
                    >
                      {"Business Address"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <AddressAutocompleteInput 
                      onAddressSelect={handleBusinessAddressSelect}
                      gray={true} 
                      defaultValue={address} 
                      isRequired={true}
                    />
                  </Grid>
                </Grid>
                <Grid container item xs={2}>
                  <Grid item xs={12}>
                    <Typography
                      sx={{
                        color: theme.typography.common.blue,
                        fontWeight: theme.typography.primary.fontWeight,
                        width: "100%",
                      }}
                    >
                      {"Unit"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField 
                      value={unit}
                      onChange={handleBusinessUnitChange}
                      variant='filled'
                      placeholder='3'
                      className={classes.root}                      
                    ></TextField>
                  </Grid>
                </Grid>
                <Grid container item xs={2}>
                  <Grid item xs={12}>
                    <Typography
                      sx={{
                        color: theme.typography.common.blue,
                        fontWeight: theme.typography.primary.fontWeight,
                        width: "100%",
                      }}
                    >
                      {"City"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField disabled name='City' value={city} onChange={(e) => setCity(e.target.value)} variant='filled' placeholder='City' className={classes.root} />
                  </Grid>
                </Grid>

                <Grid container item xs={2}>
                  <Grid item xs={12}>
                    <Typography
                      sx={{
                        color: theme.typography.common.blue,
                        fontWeight: theme.typography.primary.fontWeight,
                        width: "100%",
                      }}
                    >
                      {"State"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField disabled name='State' value={state} onChange={(e) => setState(e.target.value)} variant='filled' placeholder='State' className={classes.root} />
                  </Grid>
                </Grid>

                <Grid container item xs={3}>
                  <Grid item xs={12}>
                    <Typography
                      sx={{
                        color: theme.typography.common.blue,
                        fontWeight: theme.typography.primary.fontWeight,
                        width: "100%",
                      }}
                    >
                      {"Zip Code"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField disabled name='Zip' value={zip} onChange={(e) => setZip(e.target.value)} variant='filled' placeholder='Zip' className={classes.root} />
                  </Grid>
                </Grid>
              </Grid>

              <Grid container item xs={12} columnSpacing={4}>
                <Grid container item xs={6}>
                  <Grid item xs={12}>
                    <Typography
                      sx={{
                        color: theme.typography.common.blue,
                        fontWeight: theme.typography.primary.fontWeight,
                        width: "100%",
                      }}
                    >
                      {"Business Email"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      value={email}
                      onChange={handleBusinessEmailChange}
                      variant='filled'
                      placeholder='Business Email'
                      className={classes.root}
                      InputProps={{
                        className: errors.email || !email ? classes.errorBorder : '',
                      }}
                      required
                    ></TextField>
                  </Grid>
                </Grid>
                <Grid container item xs={6}>
                  <Grid item xs={12}>
                    <Typography
                      sx={{
                        color: theme.typography.common.blue,
                        fontWeight: theme.typography.primary.fontWeight,
                        width: "100%",
                      }}
                    >
                      {"Business Phone Number"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      value={phoneNumber}
                      onChange={handleBusinessPhoneNumberChange}
                      variant='filled'
                      placeholder='Business Phone Number'
                      className={classes.root}
                      InputProps={{
                        className: errors.phoneNumber || !phoneNumber ? classes.errorBorder : '',
                      }}
                      required
                    ></TextField>
                  </Grid>
                </Grid>
              </Grid>

              <Grid container item xs={12} columnSpacing={4}>
                <Grid container item xs={6}>
                  <Grid item xs={6}>
                    <Typography
                      sx={{
                        color: theme.typography.common.blue,
                        fontWeight: theme.typography.primary.fontWeight,
                        width: "100%",
                      }}
                    >
                      {"Tax ID (EIN or SSN)"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>                  
                  <RadioGroup aria-label='taxIDType' name='announctax_id_typeementType' value={taxIDType} onChange={(e) => setTaxIDType(e.target.value)} row>
                    <FormControlLabel 
                      value='SSN'
                      control={
                        <Radio
                          sx={{
                            color: 'defaultColor', 
                            '&.Mui-checked': {
                              color: '#3D5CAC',
                            },
                          }}
                        />
                      }
                      label='SSN' />
                    <FormControlLabel
                      value='EIN'
                      control={
                        <Radio
                          sx={{
                            color: 'defaultColor', 
                            '&.Mui-checked': {
                              color: '#3D5CAC', 
                            },
                          }}
                        />
                      }
                      label='EIN' />                    
                  </RadioGroup>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      // value={mask}
                      value={ein}
                      // onChange={(e) => setSsn(e.target.value)}
                      // onChange={handleEINChange}
                      onChange={(e) => handleTaxIDChange(e.target.value, true)}
                      variant='filled'
                      placeholder='SSN'
                      className={classes.root}
                      InputProps={{
                        className: errors.ein || !ein ? classes.errorBorder : '',
                      }}
                      required
                    ></TextField>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Grid container sx={{ backgroundColor: "#f0f0f0", borderRadius: "10px", marginBottom: "10px", padding: "10px" }}>
        <Grid container item xs={12} sx={{ marginBottom: "10px" }}>
          <Grid item xs={1}></Grid>

          <Grid container justifyContent='center' alignItems='center' item xs={10}>
            <Typography align='center' gutterBottom sx={{ fontSize: "24px", fontWeight: "bold", color: "#1f1f1f" }}>
              Maintenance Services
            </Typography>
          </Grid>
          <Grid container justifyContent='center' alignItems='center' item xs={1}>
            <Button
              onClick={() => addServiceRow()}
              sx={{
                color: "#1f1f1f",
                "&:hover": {
                  color: "#FFFFFF",
                },
              }}
            >
              <Typography sx={{ fontWeight: "bold" }}>+</Typography>
            </Button>
          </Grid>
        </Grid>
        <Grid container item xs={12}>
          {renderMaintenanceServices()}
        </Grid>
      </Grid>

      <Grid container sx={{ backgroundColor: "#f0f0f0", borderRadius: "10px", marginBottom: "10px", padding: "10px" }}>
        <Grid container item xs={12} sx={{ marginBottom: "10px" }}>
          <Grid item xs={1}></Grid>

          <Grid container justifyContent='center' alignItems='center' item xs={10}>
            <Typography align='center' gutterBottom sx={{ fontSize: "24px", fontWeight: "bold", color: "#1f1f1f" }}>
              Service Locations
            </Typography>
          </Grid>
          <Grid container justifyContent='center' alignItems='center' item xs={1}>
            <Button
              onClick={() => addServiceLocationRow()}
              sx={{
                color: "#1f1f1f",
                "&:hover": {
                  color: "#FFFFFF",
                },
              }}
            >
              <Typography sx={{ fontWeight: "bold" }}>+</Typography>
            </Button>
          </Grid>
        </Grid>
        <Grid container item xs={12}>
          {renderServiceLocations()}
        </Grid>
      </Grid>

      <Grid container sx={{ backgroundColor: "#f0f0f0", borderRadius: "10px", marginBottom: "10px", padding: "10px" }}>
        <Grid item xs={12}>
          <Typography align='center' gutterBottom sx={{ fontSize: "24px", fontWeight: "bold", color: "#1f1f1f" }}>
            Business Payment Methods
          </Typography>
        </Grid>
        <Grid container item xs={12}>
          {renderPaymentMethods()}
        </Grid>
      </Grid>

      <Grid item xs={12} sx={{ backgroundColor: "#f0f0f0", borderRadius: "10px", marginBottom: "10px", padding: "10px" }}>
        <Typography align='center' gutterBottom sx={{ fontSize: "24px", fontWeight: "bold", color: "#1f1f1f" }}>
          Maintenance Personal Information
        </Typography>
        <Grid container item xs={12}>
          <Grid container alignContent='center' item xs={3}>
            <Grid container justifyContent='center' item xs={12}>
              {employeePhoto && employeePhoto.image ? (
                <img
                  key={Date.now()}
                  src={employeePhoto.image}
                  style={{
                    width: "121px",
                    height: "121px",
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                  alt='profile'
                />
              ) : (
                <img src={DefaultProfileImg} alt='default' style={{ width: "121px", height: "121px", borderRadius: "50%" }} />
              )}
            </Grid>
            <Grid container justifyContent='center' item xs={12} sx={{ marginTop: "20px" }}>
              <Button
                component='label'
                variant='contained'
                sx={{
                  backgroundColor: "#3D5CAC",
                  width: "193px",
                  height: "35px",
                  color: "#FFFFFF",
                  textTransform: "none",
                  fontWeight: "bold",
                }}
              >
                {" "}
                Add Profile Pic
                <input type='file' hidden accept='image/*' onChange={handleEmpPhotoChange} />
              </Button>
            </Grid>
          </Grid>
          <Grid container item xs={9} columnSpacing={2}>
            <Grid item xs={6}>
              <Typography
                sx={{
                  color: theme.typography.common.blue,
                  fontWeight: theme.typography.primary.fontWeight,
                  width: "100%",
                }}
              >
                {"First Name"}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography
                sx={{
                  color: theme.typography.common.blue,
                  fontWeight: theme.typography.primary.fontWeight,
                  width: "100%",
                }}
              >
                {"Last Name"}
              </Typography>
            </Grid>
            <Grid container item xs={12} columnSpacing={2}>
              <Grid item xs={6}>
                <TextField
                  name='emp_first_name'
                  value={empFirstName}
                  onChange={(e) => handleEmpFirstNameChange(e)}
                  variant='filled'
                  fullWidth
                  placeholder='First name'
                  className={classes.root}
                  InputProps={{
                    className: errors.empFirstName || !empFirstName ? classes.errorBorder : '',
                  }}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name='emp_last_name'
                  value={empLastName}
                  variant='filled'
                  onChange={handleEmpLastNameChange}
                  fullWidth
                  placeholder='Last name'
                  className={classes.root}
                  InputProps={{
                    className: errors.empLastName || !empLastName ? classes.errorBorder : '',
                  }}
                  required
                />
              </Grid>
            </Grid>
            <Grid container item xs={12} columnSpacing={4}>
              <Grid container item xs={3}>
                <Grid item xs={12}>
                  <Typography
                    sx={{
                      color: theme.typography.common.blue,
                      fontWeight: theme.typography.primary.fontWeight,
                      width: "100%",
                    }}
                  >
                    {"Personal Address"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <AddressAutocompleteInput onAddressSelect={handlePersonalAddressSelect} gray={true} defaultValue={address} />
                </Grid>
              </Grid>
              <Grid container item xs={2}>
                <Grid item xs={12}>
                  <Typography
                    sx={{
                      color: theme.typography.common.blue,
                      fontWeight: theme.typography.primary.fontWeight,
                      width: "100%",
                    }}
                  >
                    {"Unit"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField value={unit} onChange={handleEmpUnitChange} variant='filled' placeholder='3' className={classes.root}></TextField>
                </Grid>
              </Grid>
              <Grid container item xs={2}>
                <Grid item xs={12}>
                  <Typography
                    sx={{
                      color: theme.typography.common.blue,
                      fontWeight: theme.typography.primary.fontWeight,
                      width: "100%",
                    }}
                  >
                    {"City"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField disabled name='City' value={city} onChange={(e) => setCity(e.target.value)} variant='filled' placeholder='City' className={classes.root} />
                </Grid>
              </Grid>

              <Grid container item xs={2}>
                <Grid item xs={12}>
                  <Typography
                    sx={{
                      color: theme.typography.common.blue,
                      fontWeight: theme.typography.primary.fontWeight,
                      width: "100%",
                    }}
                  >
                    {"State"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField disabled name='State' value={state} onChange={(e) => setState(e.target.value)} variant='filled' placeholder='State' className={classes.root} />
                </Grid>
              </Grid>

              <Grid container item xs={3}>
                <Grid item xs={12}>
                  <Typography
                    sx={{
                      color: theme.typography.common.blue,
                      fontWeight: theme.typography.primary.fontWeight,
                      width: "100%",
                    }}
                  >
                    {"Zip Code"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField disabled name='Zip' value={zip} onChange={(e) => setZip(e.target.value)} variant='filled' placeholder='Zip' className={classes.root} />
                </Grid>
              </Grid>
            </Grid>

            <Grid container item xs={12} columnSpacing={4}>
              <Grid container item xs={6}>
                <Grid item xs={12}>
                  <Typography
                    sx={{
                      color: theme.typography.common.blue,
                      fontWeight: theme.typography.primary.fontWeight,
                      width: "100%",
                    }}
                  >
                    {"Personal Email"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    value={empEmail}
                    onChange={handleEmpEmailChange}
                    variant='filled'
                    placeholder='Email'
                    className={classes.root}
                    // InputProps={{
                    //   className: errors.empEmail ? classes.errorBorder : '',
                    // }}
                    // required
                  ></TextField>
                </Grid>
              </Grid>
              <Grid container item xs={6}>
                <Grid item xs={12}>
                  <Typography
                    sx={{
                      color: theme.typography.common.blue,
                      fontWeight: theme.typography.primary.fontWeight,
                      width: "100%",
                    }}
                  >
                    {"Personal Phone Number"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    value={empPhoneNumber}
                    onChange={handleEmpPhoneNumberChange}
                    variant='filled'
                    placeholder='Phone Number'
                    className={classes.root}
                    // InputProps={{
                    //   className: errors.empPhoneNumber ? classes.errorBorder : '',
                    // }}
                    // required
                  ></TextField>
                </Grid>
              </Grid>
            </Grid>

            <Grid container item xs={12} columnSpacing={4}>
              <Grid container item xs={6}>
                <Grid item xs={12}>
                  <Typography
                    sx={{
                      color: theme.typography.common.blue,
                      fontWeight: theme.typography.primary.fontWeight,
                      width: "100%",
                    }}
                  >
                    {"SSN"}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    // value={mask}
                    value={empSsn}
                    // onChange={(e) => setSsn(e.target.value)}
                    onChange={handleEmpSSNChange}
                    variant='filled'
                    placeholder='SSN'
                    className={classes.root}
                    // InputProps={{
                    //   className: errors.empSsn ? classes.errorBorder : '',
                    // }}
                    // required
                  ></TextField>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Grid container justifyContent='center' sx={{ backgroundColor: "#f0f0f0", borderRadius: "10px", padding: "10px", marginBottom: "10px" }}>
        <Grid item xs={12} md={12}>
          {/* <Documents
            documents={documents}
            setDocuments={setDocuments}
            setuploadedFiles={setuploadedFiles}
            editOrUpdateLease={editOrUpdateProfile}
            setDeletedFiles={setDeletedFiles}
            isAccord={true}
            modifiedData={modifiedData}
            setModifiedData={setModifiedData}
            dataKey={"business_documents"}
          /> */}
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
            // dataKey={"business_documents"}
          />
        </Grid>
      </Grid>
      <Grid container justifyContent='center' item xs={12}>
        <Button variant='contained' color='primary' onClick={handleNextStep} disabled={nextStepDisabled} sx={{ mb: 2, backgroundColor: "#3D5CAC" }}>
          <Typography sx={{ fontWeight: "bold", color: "#FFFFFF", textTransform: "none" }}>Save</Typography>
        </Button>
      </Grid>

      <GenericDialog
      isOpen={isDialogOpen}
      title={dialogTitle}
      contextText={dialogMessage}
      actions={[
        {
          label: "OK",
          onClick: closeDialog,
        }
      ]}
      severity={dialogSeverity}
    />
    </>
  );
}
