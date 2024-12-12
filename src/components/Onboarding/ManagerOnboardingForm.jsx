import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AES from "crypto-js/aes";
import CryptoJS from "crypto-js";
import theme from "../../theme/theme";
import { useUser } from "../../contexts/UserContext";
import AddIcon from '@mui/icons-material/Add'; 
import DefaultProfileImg from "../../images/defaultProfileImg.svg";
import AddressAutocompleteInput from "../Property/AddressAutocompleteInput";
import DataValidator from "../DataValidator";
import { formatPhoneNumber, formatSSN, formatEIN, identifyTaxIdType, maskNumber, newmaskNumber,} from "./helper";
import { useOnboardingContext } from "../../contexts/OnboardingContext";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Button,
  TextField,
  Typography,  
  Stack,
  Checkbox,
  FormControlLabel,
  Grid,  
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
  Box,
} from "@mui/material";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
import useMediaQuery from "@mui/material/useMediaQuery";
// import DashboardTab from "../TenantDashboard/NewDashboardTab";
import APIConfig from "../../utils/APIConfig";
import { BeachAccessOutlined } from "@mui/icons-material";

import ListsContext from "../../contexts/ListsContext";
import GenericDialog from "../GenericDialog";
// import Documents from "../Leases/Documents";
// import { add } from "date-fns";
// import { changeSectionValueFormat } from "@mui/x-date-pickers/internals/hooks/useField/useField.utils";
// import { id } from "date-fns/locale";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiFilledInput-root": {
      backgroundColor: "#D6D5DA",
      borderRadius: 10,
      height: 30,
      marginBlock: 10,
      paddingBottom: "15px",
    },
    '& input:-webkit-autofill': {
      backgroundColor: '#D6D5DA !important',
      color: '#000000 !important',
      transition: 'background-color 0s 600000s, color 0s 600000s !important',
    },
    '& input:-webkit-autofill:focus': {
      transition: 'background-color 0s 600000s, color 0s 600000s !important',
    },
  },
  errorBorder: {
    border: '1px solid red',
  },
  error: {
    color: 'red',
  },
}));


export default function ManagerOnboardingForm({ profileData, setIsSave }) {
  console.log("In ManagerOnboardingForm  - profileData", profileData);

  const { getList, } = useContext(ListsContext);	
  const classes = useStyles();
  const [cookies, setCookie] = useCookies(["default_form_vals"]);
  const cookiesData = cookies["default_form_vals"];
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
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
const [ paymentExpanded, setPaymentExpanded ] = useState(true);

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

  const states = getList("states");
  const feeBases = getList("basis");          
  const feeFrequencies = getList("frequency");          
  const feeTypes = getList("feeType");  

  const [fees, setFees] = useState([{ id: 1, fee_name: "", frequency: "", charge: "", of: "", fee_type: "" }]);
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

  const getIconForMethod = (type) => {
    console.log("payments icon ---", type);
    switch (type) {
      case "paypal":
        return PayPal;
      case "zelle":
        return ZelleIcon;
      case "venmo":
        return VenmoIcon;
      case "stripe":
        return Stripe;
      case "apple_pay":
        return ApplePay;
      case "bank_account":
        return ChaseIcon;
    }
  };

  const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

  const getFeeTypeValue = (item) => {
    switch(item){
      case "Percentage":
          return "PERCENT";          
      case "Flat Rate":
          return "FLAT-RATE";
      default: 
          return "INVALID FEE TYPE";
    }
  }

  // useEffect(() => {
  //   console.log("paymentMethods - ", paymentMethods);
  // }, [paymentMethods]);

  // useEffect(() => {
  //   console.log("fees - ", fees);
  // }, [fees]);

  // useEffect(() => {
  //   console.log("modifiedData - ", modifiedData);
  // }, [modifiedData]);
  
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
    
    // updateModifiedData({ key: "business_ein_number", value: AES.encrypt(event.target.value, process.env.REACT_APP_ENKEY).toString() });
    if(onchangeflag) {
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
    // console.log("handlePersonalAddressSelect - address - ", address);
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
      //     const profileResponse = await axios.get(`${APIConfig.baseURL.dev}/profile/${getProfileId()}`);
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
        const parsedFees = JSON.parse(profileData.business_services_fees);
        const feesWithId = parsedFees.map((fee, index) => ({
          ...fee,
          id: index, // You can use index as an id, or generate a unique id if necessary
        }));
        setFees(feesWithId);
      }
      if (profileData.business_locations) {
        const parsedLocations = JSON.parse(profileData.business_locations);
        const locationsWithId = parsedLocations?.map((loc, index) => ({
          ...loc,
          id: index,
        }));        
        setLocations(locationsWithId);
      }

      const paymentMethods = JSON.parse(profileData.paymentMethods);
      console.log("payment methods test", paymentMethods);
      const updatedPaymentMethods = {
        paypal: { value: "", checked: false, uid: "" },
        apple_pay: { value: "", checked: false, uid: "" },
        stripe: { value: "", checked: false, uid: "" },
        zelle: { value: "", checked: false, uid: "" },
        venmo: { value: "", checked: false, uid: "" },
        credit_card: { value: "", checked: false, uid: "" },
        bank_account: { account_number: "", routing_number: "", checked: false, uid: "" },
      };
      paymentMethods?.forEach((method) => {
        if (method.paymentMethod_type === "bank_account") {
          updatedPaymentMethods.bank_account = {
            account_number: method.paymentMethod_account_number || "",
            routing_number: method.paymentMethod_routing_number || "",
            checked: method.paymentMethod_status === "Active",
            uid: method.paymentMethod_uid,
          };
        } else {
          updatedPaymentMethods[method.paymentMethod_type] = {
            value: method.paymentMethod_name,
            checked: method.paymentMethod_status === "Active",
            uid: method.paymentMethod_uid,
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
      // const employeeResponse = await axios.get(`${APIConfig.baseURL.dev}/employee/${getProfileId()}`);
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

  // useEffect(() => {
  //   console.log("calling profileData useEffect");

  //   setIsSave(false);
  //   setProfileData();
  // }, [profileData]);

  const readImage = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      file.image = e.target.result;
      setPhoto(file);
    };
    reader.readAsDataURL(file.file);
  };

  const handlePhotoChange = async (e) => {
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
    await readImage(file);

    await updateModifiedData({ key: "business_photo_url", value: e.target.files[0] });
  };

  const readEmpImage = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      file.image = e.target.result;
      setEmployeePhoto(file);
    };
    reader.readAsDataURL(file.file);
  };

  const handleEmpPhotoChange = async (e) => {
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
    await readEmpImage(file);
    await updateModifiedData({ key: "employee_photo_url", value: e.target.files[0] });
    
  };

  const addFeeRow = () => {
    const updatedFees = [...fees, { id: fees.length + 1, fee_name: "", frequency: "", charge: "", of: "" }];
    // setFees((prev) => [...prev, { id: prev.length + 1, fee_name: "", frequency: "", charge: "", of: "" }]);

    setFees(updatedFees);

    updateModifiedData({ key: "business_services_fees", value: JSON.stringify(updatedFees) });
  };

  const removeFeeRow = (id) => {
    const updatedFees = fees.filter((fee) => fee.id !== id);
    setFees(updatedFees);

    updateModifiedData({ key: "business_services_fees", value: JSON.stringify(updatedFees) });
  };

  // const handleFeeChange = (event, index) => {
  //   const { name, value } = event.target;
  //   // setFees((prevFees) =>
  //   //   prevFees.map((fee) =>
  //   //     fee.id === id ? { ...fee, [name]: value } : fee
  //   //   )
  //   // );
  //   const list = [...fees];
  //   console.log("list - ", list);
  //   console.log("handleFeeChange - name - ", name);
  //   list[index][name] = value;
  //   console.log("list - ", list);
  //   setFees(list);
  // };

  const handleFeeChange = (event, id) => {
    const { name, value } = event.target;

    const updatedFees = fees.map((fee) => {
      if (fee.id === id) {
        const updatedFee = { ...fee, [name]: value };

        if (name === "fee_type") {
          updatedFee.of = null;
          updatedFee.charge = null;
        }

        return updatedFee;
      }
      return fee;
    });

    // Update the state with the modified fees array
    setFees(updatedFees);

    updateModifiedData({ key: "business_services_fees", value: JSON.stringify(updatedFees) });
  };

  const handleFrequencyChange = (event, id) => {
    const { value } = event.target;
    setFees((prevFees) => prevFees.map((fee) => (fee.id === id ? { ...fee, frequency: value } : fee)));
  };

  const renderManagementFees = () => {
    return fees?.map((row, index) => (
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} key={row.id} overflowX={"auto"} minWidth = {isMobile ? "650px" : "0px"}>
          <Grid item xs={3}>
            <Stack spacing={isMobile ? 1 : -2} m={2}>
              <Typography
                sx={{
                  color: theme.typography.common.blue,
                  fontWeight: theme.typography.primary.fontWeight,
                }}
              >
                {"Fee Name"}
              </Typography>
              <TextField
                name='fee_name'
                value={row.fee_name}
                variant='filled'
                fullWidth
                placeholder='Service Charge'
                className={classes.root}
                // onChange={(e) => handleFeeChange(e, row.id)}
                onChange={(e) => handleFeeChange(e, row.id)}
              />
            </Stack>
          </Grid>
          <Grid item xs={2.5}>
            <Stack spacing={isMobile ? 1 : -2} m={2}>
              <Typography
                sx={{
                  color: theme.typography.common.blue,
                  fontWeight: theme.typography.primary.fontWeight,
                }}
              >
                {"Fee Type"}
              </Typography>
              <Select 
                name='fee_type'
                value={row.fee_type}
                size='small'
                fullWidth
                onChange={(e) => handleFeeChange(e, row.id)}
                placeholder='Select Type'
                className={classes.select}                
              >
                {/* <MenuItem value='PERCENT'>Percentage</MenuItem>
                <MenuItem value='FLAT-RATE'>Flat-Rate</MenuItem> */}
                {
                  feeTypes?.map( type => (
                    <MenuItem key={type.list_uid} value={getFeeTypeValue(type.list_item)}>{type.list_item}</MenuItem>
                  ))
                }
              </Select>
            </Stack>
          </Grid>
          <Grid item xs={2}>
            <Stack spacing={isMobile ? 1 : -2} m={2}>
              <Typography
                sx={{
                  color: theme.typography.common.blue,
                  fontWeight: theme.typography.primary.fontWeight,
                }}
              >
                {"Frequency"}
              </Typography>
              <Select
                name='frequency'
                value={row.frequency}
                size='small'
                fullWidth
                onChange={(e) => handleFeeChange(e, row.id)}
                placeholder='Select frequency'
                className={classes.select}
              >
                {
									feeFrequencies?.map( (freq, index) => (
										<MenuItem key={index} value={freq.list_item}>{freq.list_item}</MenuItem>
									) )
								}
              </Select>
            </Stack>
          </Grid>
          {row.fee_type === "PERCENT" && (
            <>
              <Grid item xs={1.5}>
                <Stack spacing={isMobile ? 1 : -2} m={2}>
                  <Typography
                    sx={{
                      color: theme.typography.common.blue,
                      fontWeight: theme.typography.primary.fontWeight,
                    }}
                  >
                    {"Percent"}
                  </Typography>
                  <TextField
                    name='charge'
                    value={row.charge}
                    variant='filled'
                    fullWidth
                    // placeholder='15'
                    className={classes.root}
                    onChange={(e) => handleFeeChange(e, row.id)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment 
                          position='end'
                          sx={{
                            marginTop: '15px',
                          }} 
                        >
                          %
                        </InputAdornment>
                      ),
                      sx: {
                        height: '30px',
                      }
                    }}
                  />
                </Stack>
              </Grid>
              <Grid item xs={2}>
                <Stack spacing={isMobile ? 1 : -2} m={2}>
                  <Typography
                    sx={{
                      color: theme.typography.common.blue,
                      fontWeight: theme.typography.primary.fontWeight,
                    }}
                  >
                    {"Of"}
                  </Typography>
                  {/* <TextField name='of' value={row.of} variant='filled' fullWidth placeholder='Rent' className={classes.root} onChange={(e) => handleFeeChange(e, row.id)} /> */}
                  <Select 
                    name='of'
                    value={row.of}
                    size='small'
                    fullWidth
                    onChange={(e) => handleFeeChange(e, row.id)}
                    placeholder='Select Basis'
                    className={classes.select}                
                  >
                    {
                      feeBases?.map( basis => (
                        <MenuItem value={basis.list_item}>{basis.list_item}</MenuItem>    
                      ))
                    }                    
                  </Select>
                </Stack>
              </Grid>
            </>
          )}
          {row.fee_type === "FLAT-RATE" && (
            <>
              <Grid item xs={2}>
                <Stack spacing={isMobile ? 1 : -2} m={2}>
                  <Typography
                    sx={{
                      color: theme.typography.common.blue,
                      fontWeight: theme.typography.primary.fontWeight,
                    }}
                  >
                    {"Amount"}
                  </Typography>
                  <TextField name='charge' value={row.charge} variant='filled' fullWidth placeholder='Rent' className={classes.root} onChange={(e) => handleFeeChange(e, row.id)} />
                </Stack>
              </Grid>
              <Grid item xs={1.5}></Grid>
            </>
          )}
          <Grid container justifyContent='center' alignContent='center' item xs={1}>
            <Button
              aria-label='delete'
              sx={{
                marginTop: '10px',
                color: "#000000",
                fontWeight: "bold",
                "&:hover": {
                  color: "#FFFFFF",
                },
              }}
              onClick={() => removeFeeRow(row.id)}
            >
              <DeleteIcon sx={{ fontSize: 19, color: "#3D5CAC" }} />
            </Button>
          </Grid>

          {index !== 0 && (
            <IconButton aria-label='delete' sx={{ position: "absolute", top: 0, right: 0 }} onClick={() => removeFeeRow(row.id)}>
              <CloseIcon />
            </IconButton>
          )}
        </Grid>
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
    const updatedLocations = [...locations, { id: locations.length + 1, address: "", unit: "", city: "", state: "", miles: "" }];    

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
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} key={row.id} overflowX={"auto"} minWidth = {isMobile ? "650px" : "0px"}>
          <Grid item xs={4}>
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
          <Grid container item xs={1.5}>
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
                name='unit'
                value={row.unit}
                onChange={(e) => handleServiceLocationChange(e, row.id)}
                variant='filled'
                // placeholder='3'
                className={classes.root}                        
              ></TextField>
            </Grid>
          </Grid>

          <Grid item xs={2.5}>
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

          <Grid item xs={1}>
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

          <Grid item xs={2}>
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

  const paymentTypes = [
    { type: 'paypal', name: 'PayPal', icon: PayPal },
    { type: 'zelle', name: 'Zelle', icon: ZelleIcon },
    { type: 'venmo', name: 'Venmo', icon: VenmoIcon },
    { type: 'stripe', name: 'Stripe', icon: Stripe },
    { type: 'apple_pay', name: 'Apple Pay', icon: ApplePay },
    { type: 'bank_account', name: 'Bank Account', icon: ChaseIcon },
  ];

  const [modifiedPayment, setModifiedPayment] = useState(false);
  const [parsedPaymentMethods, setParsedPaymentMethods] = useState([]);

  useEffect(() => {
    console.log("calling useeffect");
    setIsSave(false);

    setProfileData();   

    if (profileData?.paymentMethods) {
      try {
        const methods = JSON.parse(profileData.paymentMethods).map((method) => ({
          ...method,
          checked: method.paymentMethod_status === "Active", 
        }));
        setParsedPaymentMethods(methods);
      } catch (error) {
        console.error("Error parsing payment methods:", error);
      }
    }
  }, [profileData]);

  const renderPaymentMethods = () => {
    return parsedPaymentMethods.map((method, index) => (
      <Grid
        container
        rowSpacing={1}
        columnSpacing={{ xs: 1, sm: 2, md: 3 }}
        key={method.paymentMethod_uid || index}
      >
        <Grid item xs={1.3} sm={1}>
          <Checkbox
            name={`${method.paymentMethod_type}_${method.paymentMethod_uid}`}
            checked={method.checked} // Use the checked state
            onChange={(e) => handleChangeChecked(e, method.paymentMethod_uid)}
          />
        </Grid>
  
        <Grid container alignContent="center" item xs={1.3} sm={1}>
          {method.paymentMethod_type ? (
            <img src={getIconForMethod(method.paymentMethod_type)} alt={method.paymentMethod_type} />
          ) : null}
        </Grid>
  
        {!method.paymentMethod_type ? (
          <Grid item xs={3} sx={{alignContent: "center"}}>
          <Select
            value={method.paymentMethod_type || ""}
            onChange={(e) => handleChangeValue(e, method.paymentMethod_uid, "type")}
            displayEmpty
            fullWidth
            variant="filled"
            className={classes.root}
            sx={{
              '.MuiSelect-select': {
                padding: '4px 8px', 
              },
              '.MuiOutlinedInput-root': {
                minHeight: '30px', 
              },
            }}
          >
            <MenuItem 
              value="" 
              disabled 
              sx={{
                padding: '4px 8px',
                minHeight: 'auto',
              }}
            >
              Select Payment Method
            </MenuItem>
              {paymentTypes.map((payment) => (
                <MenuItem key={payment.type} value={payment.type}>
                  <img src={payment.icon} alt={payment.name} style={{ width: 20, marginRight: 10 }} />
                  {payment.name}
                </MenuItem>
              ))}
            </Select>
          </Grid>
        ) : (
          <>
            {method.paymentMethod_type === "bank_account" ? (
              <>
                <Grid item xs={4}>
                  <TextField
                    name={`account_${method.paymentMethod_uid}`}
                    value={method.paymentMethod_acct || ""}
                    onChange={(e) => handleChangeValue(e, method.paymentMethod_uid, "acct")}
                    variant="filled"
                    fullWidth
                    placeholder="Enter Your Bank Account Number"
                    disabled={!method.checked} // Use checked state for disabled
                    className={classes.root}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    name={`routing_${method.paymentMethod_uid}`}
                    value={method.paymentMethod_routing_number || ""}
                    onChange={(e) => handleChangeValue(e, method.paymentMethod_uid, "routing_number")}
                    variant="filled"
                    fullWidth
                    placeholder="Enter Your Bank Routing Number"
                    disabled={!method.checked} // Use checked state for disabled
                    className={classes.root}
                  />
                </Grid>
              </>
            ) : (
              <Grid item xs={8} sm={9}>
                <TextField
                  name={`${method.paymentMethod_type}_${method.paymentMethod_uid}`}
                  value={method.paymentMethod_name || ""}
                  onChange={(e) => handleChangeValue(e, method.paymentMethod_uid, "name")}
                  variant="filled"
                  fullWidth
                  placeholder={`Enter ${capitalizeFirstLetter(method.paymentMethod_type)}`}
                  disabled={!method.checked} // Use checked state for disabled
                  className={classes.root}
                />
              </Grid>
            )}
          </>
        )}
  
        {method.paymentMethod_uid && !method.paymentMethod_uid.startsWith('new_') && (
          <Grid item xs={1}>
            <IconButton onClick={() => handleDeletePaymentMethod(method.paymentMethod_uid)} aria-label="delete">
              <DeleteIcon />
            </IconButton>
          </Grid>
        )}
      </Grid>
    ));
  };


  const handleChangeChecked = (e, uid) => {
    const { checked } = e.target;
    const updatedMethods = parsedPaymentMethods.map((method) =>
      method.paymentMethod_uid === uid ? { ...method, checked, paymentMethod_status: checked ? "Active" : "Inactive" } : method
    );
    setParsedPaymentMethods(updatedMethods);
    setModifiedPayment(true);
  };

  const handleChangeValue = (e, uid, field) => {
    const { value } = e.target;
    const updatedMethods = parsedPaymentMethods.map((method) =>
      method.paymentMethod_uid === uid
        ? { ...method, [`paymentMethod_${field}`]: value }
        : method
    );
    setParsedPaymentMethods(updatedMethods);
    setModifiedPayment(true);
  };

  const handleAddPaymentMethod = (event) => {
    // console.log("check", event)
    event.stopPropagation();
    const newPaymentMethod = {
      paymentMethod_uid: `new_${Date.now()}`, 
      paymentMethod_type: "", 
      paymentMethod_name: "", 
      paymentMethod_status: "Inactive", 
      checked: false,
    };
    setParsedPaymentMethods([...parsedPaymentMethods, newPaymentMethod]);
    console.log("parsed", parsedPaymentMethods);
  };

  const handlePaymentStep = async (validPaymentMethods = []) => {
    setShowSpinner(true);
    const existingMethods = profileData.paymentMethods
      ? JSON.parse(profileData.paymentMethods)
      : [];
  
    const putPayload = [];
    const postPayload = [];
  
    validPaymentMethods.forEach((method) => {
      if (method.paymentMethod_uid && !method.paymentMethod_uid.startsWith('new_')) {
        // Existing payment method (UID exists and doesn't start with 'new_')
        const existingMethod = existingMethods.find(
          (m) => m.paymentMethod_uid === method.paymentMethod_uid
        );
  
        if (existingMethod) {
          const hasChanged =
            method.paymentMethod_name !== existingMethod.paymentMethod_name ||
            method.paymentMethod_status !== existingMethod.paymentMethod_status ||
            (method.paymentMethod_type === "bank_account" &&
              (method.paymentMethod_routing_number !==
                existingMethod.paymentMethod_routing_number ||
                method.paymentMethod_account_number !==
                  existingMethod.paymentMethod_account_number));
  
          if (hasChanged) {
            putPayload.push({
              paymentMethod_uid: method.paymentMethod_uid,
              paymentMethod_name: method.paymentMethod_name,
              paymentMethod_profile_id: getProfileId(),
              paymentMethod_status: method.paymentMethod_status,
              paymentMethod_type: method.paymentMethod_type,
            });
          }
        }
      } else {
        // New payment method (no UID or UID starts with 'new_')
        postPayload.push({
          paymentMethod_type: method.paymentMethod_type,
          paymentMethod_name: method.paymentMethod_name,
          paymentMethod_status: method.checked ? "Active" : "Inactive",
          paymentMethod_profile_id: getProfileId(),
          ...(method.paymentMethod_type === "bank_account" && {
            paymentMethod_routing_number: method.paymentMethod_routing_number,
            paymentMethod_account_number: method.paymentMethod_account_number,
          }),
        });
      }
    });
  
    try {
      // Make PUT request if there are modified existing payment methods
      if (putPayload.length > 0) {
        await axios.put(
          `${APIConfig.baseURL.dev}/paymentMethod`,
          putPayload,
          { headers: { "Content-Type": "application/json" } }
        );
      }
  
      // Make POST request if there are new payment methods
      if (postPayload.length > 0) {
        await axios.post(
          `${APIConfig.baseURL.dev}/paymentMethod`,
          postPayload,
          { headers: { "Content-Type": "application/json" } }
        );
      }
  
      setCookie("default_form_vals", { ...cookiesData, paymentMethods });
    } catch (error) {
      console.error("Error handling payment methods:", error);
    } finally {
      setShowSpinner(false);
    }
  };

  const handleDeletePaymentMethod = async (paymentMethodUid) => {
    try {
      const tenantUid = getProfileId();
      console.log("paymentmethoduid", paymentMethodUid);
      const url = `${APIConfig.baseURL.dev}/paymentMethod/${tenantUid}/${paymentMethodUid}`;
  
      setShowSpinner(true); 
  
      await axios.delete(url, {
        headers: { "Content-Type": "application/json" },
      });
  
      setParsedPaymentMethods((prevMethods) =>
        prevMethods.filter((method) => method.paymentMethod_uid !== paymentMethodUid)
      );
  
      setShowSpinner(false);
  
      openDialog("Success", "Payment method deleted successfully.", "success");
    } catch (error) {
      setShowSpinner(false);
      openDialog("Error", "Failed to delete the payment method. Please try again.", "error");
      console.error("Error deleting payment method:", error);
    }
  };

  const handleNextStep = async () => {
    const newErrors = {};
    
    let isAddingPaymentMethod = parsedPaymentMethods.some(method => method.paymentMethod_uid.startsWith('new_') || modifiedPayment);
  
    // Payment method validation
    let paymentMethodsError = false;
    let atLeastOneActive = false;
  
    const validPaymentMethods = parsedPaymentMethods.filter((method) => method.paymentMethod_type !== "");
    console.log("payment methods valid", validPaymentMethods);
  
    validPaymentMethods.forEach((method) => {
      if (method.checked && method.paymentMethod_name === "") {
        paymentMethodsError = true;
      }
      if (method.checked) {
        atLeastOneActive = true;
      }
    });
  
    if (!atLeastOneActive) {
      newErrors.paymentMethods = "At least one active payment method is required";
      openDialog("Alert", "At least one active payment method is required", "info");
      return;
    }
  
    if (paymentMethodsError) {
      newErrors.paymentMethods = "Please check payment method details";
      openDialog("Alert", "Please check payment method details", "info");
      return;
    }
  
    // Business information validation (only if not just adding a payment method)
    if (!isAddingPaymentMethod) {
      // if (!firstName) newErrors.firstName = "First name is required";
      // if (!lastName) newErrors.lastName = "Last name is required";
      if (!businessName) newErrors.businessName = "Business name is required";
      if (!address) newErrors.address = "Address is required";
      if (!email) newErrors.email = "Email is required";
      if (!phoneNumber) newErrors.phoneNumber = "Phone Number is required";
      if (!ein) newErrors.ein = "Tax ID is required";
  
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        openDialog("Alert", "Please correct the errors", "info");
        return;
      }
  
      // Additional validation for business information fields
      if (!DataValidator.email_validate(email)) {
        openDialog("Alert", "Please enter a valid email", "info");
        return false;
      }
  
      if (!DataValidator.phone_validate(phoneNumber)) {
        openDialog("Alert", "Please enter a valid phone number", "info");
        return false;
      }
  
      if (!DataValidator.zipCode_validate(zip)) {
        openDialog("Alert", "Please enter a valid zip code", "info");
        return false;
      }
        
      if ((taxIDType === "EIN" && !DataValidator.ein_validate(ein)) || (taxIDType === "SSN" && !DataValidator.ssn_validate(ein))) {
        openDialog("Alert", "Please enter a valid Tax ID", "info");
        return false;
      }
    }
  
    setErrors({}); // Clear any previous errors
  
    setCookie("default_form_vals", { ...cookiesData, firstName, lastName });
  
    // Save the profile
    saveProfile();
  
    // Handle payment step if payment is modified
    if (modifiedPayment) {
      await handlePaymentStep(validPaymentMethods);
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
    // console.log("inside saveProfile", modifiedData);
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

        // profileFormData.append("business_uid", profileData.business_uid);
        // profileFormData.append("employee_uid", profileData.employee_uid);
        let hasEmployeeFields = false;
        let hasBusinessFields = false;

        modifiedData.forEach((item) => {
          console.log(`Key: ${item.key}`);
          if(hasBusinessFields === false && item.key.startsWith("business")) hasBusinessFields = true;
          if(hasEmployeeFields === false && item.key.startsWith("employee")) hasEmployeeFields = true;
          profileFormData.append(item.key, item.value);
        });                
        if (hasBusinessFields) {
          profileFormData.append("business_uid", profileData.business_uid);
        }
        if (hasEmployeeFields) {
          profileFormData.append("employee_uid", profileData.employee_uid);
        }
        

        axios
          .put(`${APIConfig.baseURL.dev}/profile`, profileFormData, headers)
          .then((response) => {
            console.log("Data updated successfully", response);
            openDialog("Success", "Your profile has been successfully updated.", "success");
            handleUpdate();
            setShowSpinner(false);
          })
          .catch((error) => {
            setShowSpinner(false);
            openDialog("Error", "Cannot update your profile. Please try again", "error");
            if (error.response) {
              console.log(error.response.data);
            }
          });
        setShowSpinner(false);
        setModifiedData([]);
      } else {
        openDialog("Warning", "You haven't made any changes to the form. Please save after changing the data.", "error");
      }
    } catch (error) {
      openDialog("Error", "Cannot update the lease. Please try again", "error");
      console.log("Cannot Update the lease", error);
      setShowSpinner(false);
    }
  };

  const [showMasked, setShowMasked] = useState(true);
  const displaySsn = showMasked ? newmaskNumber(ein) : formatSSN(ein);
  const [showSSNEIN, setshowSSNEIN] = useState(false); 
  const [showEmpSsn, setshowEmpSsn] = useState(false); 

  return (
    <>
      
        <Grid container sx={{ backgroundColor: "#f0f0f0", borderRadius: "10px", cursor: "pointer", marginBottom: "10px", padding: "10px" }}>
          <Grid item xs={12}>
            <Typography align='center' gutterBottom sx={{ fontSize: "24px", fontWeight: "bold", color: "#1f1f1f" }}>
              Property Manager Profile Information
            </Typography>
            <Grid container item xs={12}>
              <Grid container alignContent='center' item xs={12} md={3}>
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
                <Grid container justifyContent='center' item xs={12}>
                  <Button
                    component='label'
                    variant='contained'
                    sx={{
                      backgroundColor: "#3D5CAC",
                      width: "193px",
                      height: "35px",
                      color: "#FFFFFF",
                      fontWeight: "bold",
                      textTransform: "none",
                      marginTop: "10px",
                    }}
                  >
                    {" "}
                    Add Profile Pic
                    <input type='file' hidden accept='image/*' onChange={handlePhotoChange} />
                  </Button>
                </Grid>
              </Grid>
              <Grid item xs={12} md={9} marginTop={isMobile? "20px" : "0px"}>
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
                  <Grid container item xs={5} md={5.5}>
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
                  <Grid container item xs={1.5} md={2}>
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

                  <Grid container item xs={1.5} md={1}>
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

                  <Grid container item xs={2} md={1.5}>
                    <Grid item xs={12}>
                      <Typography
                        sx={{
                          color: theme.typography.common.blue,
                          fontWeight: theme.typography.primary.fontWeight,
                          width: "100%",
                          whiteSpace:'nowrap',
                        }}
                      >
                        {isMobile ? "Zip" : "Zip Code"}
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
                  <Grid container item xs={7.5} sm={6}>
                    <Grid item xs={4} sm={6}>
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
                    <Grid item xs={8} sm={6}>                    
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
                        value={showSSNEIN? ein : "***-**-****"} 
                        // onChange={(e) => setSsn(e.target.value)}
                        onChange={(e) => handleTaxIDChange(e.target.value, true)} 
                        variant='filled'
                        placeholder='Enter numbers only'
                        className={classes.root}
                        InputProps={{
                          className: errors.ein || !ein ? classes.errorBorder : '',
                          endAdornment: (
                            <InputAdornment position='end' style={{ marginRight: "8px", marginTop: "10px" }} >
                              <IconButton
                                aria-label='toggle password visibility'
                                onClick={() => setshowSSNEIN((show) => !show)}
                                edge='end'
                              >
                                {showSSNEIN ? <VisibilityOff style={{ fontSize: "20px"}}/> : <Visibility style={{ fontSize: "20px"  }}/>}
                              </IconButton>
                            </InputAdornment>
                          ),
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
              <Typography sx={{ fontSize: "24px", fontWeight: "bold", color: "#1f1f1f" }}>Management Fees</Typography>
            </Grid>
            <Grid container justifyContent='center' alignItems='center' item xs={1}>
              <Button
                onClick={() => addFeeRow()}
                sx={{
                  color: "#1f1f1f",
                  "&:hover": {
                    color: "#FFFFFF",
                  },
                }}
              >
                <Typography sx={{ fontSize: '24px', fontWeight: "bold" }}>+</Typography>
              </Button>
            </Grid>
          </Grid>
          <Grid container item xs={12}>
            <Box
              sx={{
                overflowX: "auto",
                
              }}
            >
              {renderManagementFees()}
            </Box>

          </Grid>
        </Grid>

        <Grid container sx={{ backgroundColor: "#f0f0f0", borderRadius: "10px", marginBottom: "10px", padding: "10px" }}>
          <Grid container item xs={12} sx={{ marginBottom: "10px" }}>
            <Grid item xs={1}></Grid>
            <Grid container justifyContent='center' alignItems='center' item xs={10}>
              <Typography sx={{ fontSize: "24px", fontWeight: "bold", color: "#1f1f1f" }}>Service Locations</Typography>
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
                <Typography sx={{  fontSize: '24px', fontWeight: "bold" }}>+</Typography>
              </Button>
            </Grid>
          </Grid>
          <Grid container item xs={12}>
            <Box
              sx={{
                overflowX : "auto"
              }}
            >
              {renderServiceLocations()}
            </Box>
          </Grid>
        </Grid>

        <Grid container justifyContent='center' sx={{ backgroundColor: "#f0f0f0", borderRadius: "10px", padding: "10px", marginBottom: "10px" }}>
        <Grid item xs={12}>
          <Accordion sx={{ backgroundColor: "#F0F0F0", boxShadow: "none" }} expanded={paymentExpanded} onChange={() => setPaymentExpanded(prevState => !prevState)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='payment-content' id='payment-header'>
              <Grid container justifyContent='center'>
                <Grid item md={11.5}>
                  <Typography
                    sx={{
                      color: "#160449",
                      fontWeight: theme.typography.primary.fontWeight,
                      fontSize: "24px",
                      textAlign: "center",
                      paddingBottom: "10px",
                      paddingTop: "5px",
                      flexGrow: 1,
                      paddingLeft: "50px",
                    }}
                    paddingTop='5px'
                    paddingBottom='10px'
                  >
                    Business Payment Information
                  </Typography>
                </Grid>
                <Grid item md={0.5}>
                  <IconButton onClick={handleAddPaymentMethod} aria-label="Add Payment Method">
                    <AddIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container item xs={12}>
                {renderPaymentMethods()}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>

        <Grid item xs={12} sx={{ backgroundColor: "#f0f0f0", borderRadius: "10px", marginBottom: "10px", padding: "10px" }}>
          <Typography align='center' gutterBottom sx={{ fontSize: "24px", fontWeight: "bold", color: "#1f1f1f" }}>
            Property Manager Personal Information
          </Typography>
          <Grid container item xs={12}>
            <Grid container alignContent='center' item xs={12} md={3}>
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
              <Grid container justifyContent='center' item xs={12}>
                <Button
                  component='label'
                  variant='contained'
                  sx={{
                    backgroundColor: "#3D5CAC",
                    width: "193px",
                    height: "35px",
                    color: "#FFFFFF",
                    fontWeight: "bold",
                    textTransform: "none",
                    marginTop: "10px",
                  }}
                >
                  {" "}
                  Add Profile Pic
                  <input type='file' hidden accept='image/*' onChange={handleEmpPhotoChange} />
                </Button>
              </Grid>
            </Grid>
            <Grid item xs={12} md={9} marginTop={isMobile? "20px" : "0px"}>
              <Grid item xs={12}>
                <Typography
                  sx={{
                    color: theme.typography.common.blue,
                    fontWeight: theme.typography.primary.fontWeight,
                    width: "100%",
                  }}
                >
                  {"Display Name"}
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
                    // className={`${classes.root} ${errors.empFirstName ? classes.requiredField : ''}`}
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
                <Grid container item xs={5} md={5.5}>
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
                    <AddressAutocompleteInput onAddressSelect={handlePersonalAddressSelect} gray={true} defaultValue={empAddress} />
                  </Grid>
                </Grid>
                <Grid container item xs={1.5} md={2}>
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
                    <TextField value={empUnit} onChange={handleEmpUnitChange} variant='filled' placeholder='3' className={classes.root}></TextField>
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
                    <TextField disabled name='City' value={empCity} onChange={(e) => setCity(e.target.value)} variant='filled' placeholder='City' className={classes.root} />
                  </Grid>
                </Grid>

                <Grid container item xs={1.5} md={1}>
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
                    <TextField disabled name='State' value={empState} onChange={(e) => setState(e.target.value)} variant='filled' placeholder='State' className={classes.root} />
                  </Grid>
                </Grid>

                <Grid container item xs={2} md={1.5}>
                  <Grid item xs={12}>
                    <Typography
                      sx={{
                        color: theme.typography.common.blue,
                        fontWeight: theme.typography.primary.fontWeight,
                        width: "100%",
                      }}
                    >
                      {isMobile ? "Zip" : "Zip Code"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField disabled name='Zip' value={empZip} onChange={(e) => setZip(e.target.value)} variant='filled' placeholder='Zip' className={classes.root} />
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
                      value={showEmpSsn? empSsn : "***-**-****"}
                      // onChange={(e) => setSsn(e.target.value)}
                      onChange={handleEmpSSNChange}
                      variant='filled'
                      placeholder='SSN'
                      className={classes.root}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position='end' style={{ marginRight: "8px", marginTop: "10px" }} >
                            <IconButton
                              aria-label='toggle password visibility'
                              onClick={() => setshowEmpSsn((show) => !show)}
                              edge='end'
                            >
                              {showEmpSsn ? <VisibilityOff style={{ fontSize: "20px"}}/> : <Visibility style={{ fontSize: "20px"  }}/>}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      // required
                    ></TextField>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
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
