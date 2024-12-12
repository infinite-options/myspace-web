import React, { useState, useEffect, useRef, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import AES from "crypto-js/aes";
import CryptoJS from "crypto-js";
import theme from "../../theme/theme";
import { useUser } from "../../contexts/UserContext";
import DefaultProfileImg from "../../images/defaultProfileImg.svg";
import AddressAutocompleteInput from "../Property/AddressAutocompleteInput";
import DeleteIcon from '@mui/icons-material/Delete';
import DataValidator from "../DataValidator";
import AddIcon from '@mui/icons-material/Add'; 
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
  Radio,
  RadioGroup,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { makeStyles } from "@material-ui/core/styles";
import PayPal from "../../images/PayPal.png";
import ZelleIcon from "../../images/Zelle.png";
import VenmoIcon from "../../images/Venmo.png";
import Stripe from "../../images/Stripe.png";
import ApplePay from "../../images/ApplePay.png";
import ChaseIcon from "../../images/Chase.png";
import useMediaQuery from "@mui/material/useMediaQuery";
// import CloseIcon from "@mui/icons-material/Close";
import { useCookies } from "react-cookie";
import APIConfig from "../../utils/APIConfig";
import ListsContext from "../../contexts/ListsContext";
import GenericDialog from "../GenericDialog";
// import Documents from "../Leases/Documents";
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
  },
  errorBorder: {
    border: "1px solid red",
  },
  error: {
    color: "red",
  },
}));

export default function OwnerOnboardingForm({ profileData, setIsSave }) {
  console.log("In TenenatOnBoardingForm  - profileData", profileData);

  const { getList } = useContext(ListsContext);
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
  const [taxIDType, setTaxIDType] = useState("SSN");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogSeverity, setDialogSeverity] = useState("info");
  const [showPassword, setShowPassword] = useState(false); 

  const openDialog = (title, message, severity) => {
    setDialogTitle(title); // Set custom title
    setDialogMessage(message); // Set custom message
    setDialogSeverity(severity); // Can use this if needed to control styles
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  useEffect(() => {
    if (ssn && identifyTaxIdType(ssn) === "EIN") setTaxIDType("EIN");
  }, [ssn]);

  useEffect(() => {
    handleTaxIDChange(ssn, false);
  }, [taxIDType]);

  const [paymentMethods, setPaymentMethods] = useState({
    paypal: { value: "", checked: false, uid: "" },
    apple_pay: { value: "", checked: false, uid: "" },
    stripe: { value: "", checked: false, uid: "" },
    zelle: { value: "", checked: false, uid: "" },
    venmo: { value: "", checked: false, uid: "" },
    credit_card: { value: "", checked: false, uid: "" },
    bank_account: { account_number: "", routing_number: "", checked: false, uid: "" },
  });

  const [adults, setAdults] = useState([{ id: 1, name: "", lastName: "", relation: "", dob: "" }]);
  const [children, setChildren] = useState([{ id: 1, name: "", lastName: "", relation: "", dob: "" }]);
  const [pets, setPets] = useState([{ id: 1, name: "", breed: "", type: "", weight: "" }]);
  const [vehicles, setVehicles] = useState([{ id: 1, make: "", model: "", year: "", license: "", state: "" }]);
  const [documents, setDocuments] = useState([]);
  const [uploadedFiles, setuploadedFiles] = useState([]);
  const [deletedFiles, setDeletedFiles] = useState([]);

  const adultsRef = useRef(adults);
  const childrenRef = useRef(children);
  const petsRef = useRef(pets);
  const vehiclesRef = useRef(vehicles);
  const documentsRef = useRef([]);

  const [relationships, setRelationships] = useState([]);
  const [states, setStates] = useState([]);

  // New state for job details
  const [currentSalary, setCurrentSalary] = useState("");
  const [salaryFrequency, setSalaryFrequency] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");

  const [license, setLicense] = useState("");
  const [licenseState, setLicenseState] = useState("");
  const [licenseExp, setLicenseExp] = useState("");

  const [modifiedData, setModifiedData] = useState([]);

  const [isUpdate, setIsUpdate] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [ paymentExpanded, setPaymentExpanded ] = useState(true);

  const [errors, setErrors] = useState({});

  const [parsedPaymentMethods, setParsedPaymentMethods] = useState([]);

  const getListDetails = async () => {
    const relationships = getList("relationships");
    const states = getList("states");
    setRelationships(relationships);
    setStates(states);
  };

  // useEffect(() => {
  //   console.log("adults - ", adults);
  // }, [adults]);

  // useEffect(() => {
  //   console.log("paymentMethods - ", paymentMethods);
  // }, [paymentMethods]);

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

  const handleFirstNameChange = (event) => {
    setFirstName(event.target.value);
    updateModifiedData({ key: "owner_first_name", value: event.target.value });
  };

  const handleLastNameChange = (event) => {
    setLastName(event.target.value);
    updateModifiedData({ key: "owner_last_name", value: event.target.value });
  };

  const handleAddressSelect = (address) => {
    setAddress(address.street ? address.street : "");
    updateModifiedData({ key: "owner_address", value: address.street ? address.street : "" });
    setCity(address.city ? address.city : "");
    updateModifiedData({ key: "owner_city", value: address.city ? address.city : "" });
    setState(address.state ? address.state : "");
    updateModifiedData({ key: "owner_state", value: address.state ? address.state : "" });
    setZip(address.zip ? address.zip : "");
    updateModifiedData({ key: "owner_zip", value: address.zip ? address.zip : "" });
  };

  const handleUnitChange = (event) => {
    setUnit(event.target.value);
    updateModifiedData({ key: "owner_unit", value: event.target.value });
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    updateModifiedData({ key: "owner_email", value: event.target.value });
  };

  const handlePhoneNumberChange = (event) => {
    setPhoneNumber(formatPhoneNumber(event.target.value));
    updateModifiedData({ key: "owner_phone_number", value: formatPhoneNumber(event.target.value) });
  };

  // const handleSSNChange = (event) => {
  //   let value = event.target.value;
  //   if (value.length > 11) return;
  //   setSsn(value);
  //   updateModifiedData({ key: "owner_ssn", value: AES.encrypt(event.target.value, process.env.REACT_APP_ENKEY).toString() });
  // };

  const handleTaxIDChange = (value, onchangeflag) => {
    // let value = event.target.value;
    if (value?.length > 11) return;

    let updatedTaxID = "";
    if (taxIDType === "EIN") {
      updatedTaxID = formatEIN(value);
    } else {
      updatedTaxID = formatSSN(value);
    }
    setSsn(updatedTaxID);
    if (onchangeflag) {
      // updateModifiedData({ key: "business_ein_number", value: AES.encrypt(event.target.value, process.env.REACT_APP_ENKEY).toString() });
      updateModifiedData({ key: "owner_ssn", value: AES.encrypt(updatedTaxID, process.env.REACT_APP_ENKEY).toString() });
    }
  };

  const setProfileData = async () => {
    setShowSpinner(true);
    try {
      // const profileResponse = await axios.get(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/profile/${getProfileId()}`);
      // const profileData = profileResponse.data.profile.result[0];
      setFirstName(profileData.owner_first_name || "");
      setLastName(profileData.owner_last_name || "");
      setEmail(profileData.owner_email || "");
      setPhoneNumber(formatPhoneNumber(profileData.owner_phone_number || ""));
      setPhoto(profileData.owner_photo_url ? { image: profileData.owner_photo_url } : null);
      setSsn(profileData.owner_ssn ? AES.decrypt(profileData.owner_ssn, process.env.REACT_APP_ENKEY).toString(CryptoJS.enc.Utf8) : "");
      setMask(profileData.owner_ssn ? maskNumber(AES.decrypt(profileData.owner_ssn, process.env.REACT_APP_ENKEY).toString(CryptoJS.enc.Utf8)) : "");
      setAddress(profileData.owner_address || "");
      setUnit(profileData.owner_unit || "");
      setCity(profileData.owner_city || "");
      setState(profileData.owner_state || "");
      setZip(profileData.owner_zip || "");

      const paymentMethods = JSON.parse(profileData.paymentMethods);
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
  };

  useEffect(() => {
    console.log("calling useeffect");
    setIsSave(false);

    setProfileData();

    // getListDetails();
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
      openDialog("Alert", `Your file size is too large (${file_size} MB)`, "info");
      return;
    }
    updateModifiedData({ key: "owner_photo_url", value: e.target.files[0] });
    readImage(file);
  };

  useEffect(() => {
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

  const paymentTypes = [
    { type: 'paypal', name: 'PayPal', icon: PayPal },
    { type: 'zelle', name: 'Zelle', icon: ZelleIcon },
    { type: 'venmo', name: 'Venmo', icon: VenmoIcon },
    { type: 'stripe', name: 'Stripe', icon: Stripe },
    { type: 'apple_pay', name: 'Apple Pay', icon: ApplePay },
    { type: 'bank_account', name: 'Bank Account', icon: ChaseIcon },
  ];

  const [modifiedPayment, setModifiedPayment] = useState(false);

  //http://127.0.0.1:4000/paymentMethod/350-000007/070-000076 - DELETE

  const handleDeletePaymentMethod = async (paymentMethodUid) => {
    try {
      const tenantUid = getProfileId();
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
          "https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/paymentMethod",
          putPayload,
          { headers: { "Content-Type": "application/json" } }
        );
      }
  
      // Make POST request if there are new payment methods
      if (postPayload.length > 0) {
        await axios.post(
          "https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/paymentMethod",
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
  
  const handleNextStep = async () => {
    const newErrors = {};
    if (!firstName) newErrors.firstName = "First name is required";
    if (!lastName) newErrors.lastName = "Last name is required";
    if (!address) newErrors.address = "Address is required";
    if (!email) newErrors.email = "Email is required";
    if (!phoneNumber) newErrors.phoneNumber = "Phone Number is required";
    if (!ssn) newErrors.ssn = "SSN is required";

    let paymentMethodsError = false;
    let atLeastOneActive = false;
    // Object.keys(paymentMethods)?.forEach((method) => {
    //   const payMethod = paymentMethods[method];

    //   if (payMethod.value === "" && payMethod.checked === true) {
    //     paymentMethodsError = true;
    //   }
    //   if (payMethod.checked === true) {
    //     atleaseOneActive = true;
    //   }
    // });

    const validPaymentMethods = parsedPaymentMethods.filter((method) => method.paymentMethod_type !== "");

    validPaymentMethods.forEach(method => {
      if (method.checked && method.paymentMethod_name === '') {
        paymentMethodsError = true;
      }
      if (method.checked) {
        atLeastOneActive = true; // Found at least one active
      }
    });

    if (!atLeastOneActive) {
      newErrors.paymentMethods = "Atleast one active payment method is required";
      openDialog("Alert", "Atleast one active payment method is required", "info");
      return;
    }

    if (paymentMethodsError) {
      newErrors.paymentMethods = "Please check payment method details";
      openDialog("Alert", "Please check payment method details", "info");
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      openDialog("Alert", "Please enter all required fields", "info");
      return;
    }

    setErrors({}); // Clear any previous errors

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

    // if (!DataValidator.ssn_validate(ssn)) {
    //   alert("Please enter a valid SSN");
    //   return false;
    // }
    if ((taxIDType === "EIN" && !DataValidator.ein_validate(ssn)) || (taxIDType === "SSN" && !DataValidator.ssn_validate(ssn))) {
      openDialog("Alert", "Please enter a valid Tax ID", "info");
      return false;
    }

    setCookie("default_form_vals", { ...cookiesData, firstName, lastName });

    // const payload = getPayload();
    // const form = encodeForm(payload);
    // const data = await saveProfile(form);

    saveProfile();

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

  const editOrUpdateOwner = async () => {
    console.log("inside editOrUpdateOwner", modifiedData);
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
          profileFormData.append(item.key, JSON.stringify(item.value));
        });
        profileFormData.append("owner_uid", profileData.owner_uid);

        axios
          .put("https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/profile", profileFormData, headers)
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

  const saveProfile = async () => {
    console.log("inside saveProfile", modifiedData);
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
          profileFormData.append(item.key, item.value);
        });
        profileFormData.append("owner_uid", profileData.owner_uid);

        axios
          .put("https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/profile", profileFormData, headers)
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
    event.stopPropagation();
    const newPaymentMethod = {
      paymentMethod_uid: `new_${Date.now()}`, 
      paymentMethod_type: "", 
      paymentMethod_name: "", 
      paymentMethod_status: "Inactive", 
      checked: false,
    };
    setParsedPaymentMethods([...parsedPaymentMethods, newPaymentMethod]);
  };

  return (
    <>
      <Grid container sx={{ backgroundColor: "#f0f0f0", borderRadius: "10px", cursor: "pointer", marginBottom: "10px", padding: "10px" }}>
        <Grid item xs={12}>
          <Typography align='center' gutterBottom sx={{ fontSize: "24px", fontWeight: "bold", color: "#1f1f1f" }}>
            Owner Profile Information
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
              <Grid container justifyContent='center' item xs={12} sx={{ marginTop: "20px" }}>
                <Button
                  component='label'
                  variant='contained'
                  sx={{
                    backgroundColor: "#3D5CAC",
                    width: "193px",
                    height: "35px",
                    textTransform: "none",
                    fontWeight: "bold",
                    color: "#FFFFFF",
                  }}
                >
                  {" "}
                  Add Profile Pic
                  <input type='file' hidden accept='image/*' onChange={handlePhotoChange} />
                </Button>
              </Grid>
            </Grid>
            <Grid container item xs={12} md={9} columnSpacing={2} marginTop={isMobile ? "20px" : ""}>
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
                    name='firstName'
                    value={firstName}
                    onChange={(e) => handleFirstNameChange(e)}
                    variant='filled'
                    fullWidth
                    placeholder='First name'
                    className={classes.root}
                    InputProps={{
                      className: errors.firstName || !firstName ? classes.errorBorder : "",
                    }}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    name='lastName'
                    value={lastName}
                    variant='filled'
                    onChange={handleLastNameChange}
                    fullWidth
                    placeholder='Last name'
                    className={classes.root}
                    InputProps={{
                      className: errors.lastName || !lastName ? classes.errorBorder : "",
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
                    <AddressAutocompleteInput onAddressSelect={handleAddressSelect} gray={true} defaultValue={address} isRequired={true} />
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
                    <TextField value={unit} onChange={handleUnitChange} variant='filled' placeholder='3' className={classes.root}></TextField>
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
                        whiteSpace : 'nowrap',
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
                      {"Personal Email"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      value={email}
                      onChange={handleEmailChange}
                      variant='filled'
                      placeholder='Email'
                      className={classes.root}
                      InputProps={{
                        className: errors.email || !email ? classes.errorBorder : "",
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
                      {"Personal Phone Number"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      value={phoneNumber}
                      onChange={handlePhoneNumberChange}
                      variant='filled'
                      placeholder='Phone Number'
                      className={classes.root}
                      InputProps={{
                        className: errors.phoneNumber || !phoneNumber ? classes.errorBorder : "",
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
                      {"Tax ID (SSN or EIN)"}
                    </Typography>
                  </Grid>
                  <Grid item xs={8} sm={6}>
                    <RadioGroup aria-label='taxIDType' name='announctax_id_typeementType' value={taxIDType} onChange={(e) => setTaxIDType(e.target.value)} row>
                      <FormControlLabel
                        value='SSN'
                        control={
                          <Radio
                            sx={{
                              color: "defaultColor",
                              "&.Mui-checked": {
                                color: "#3D5CAC",
                              },
                            }}
                          />
                        }
                        label='SSN'
                      />
                      <FormControlLabel
                        value='EIN'
                        control={
                          <Radio
                            sx={{
                              color: "defaultColor",
                              "&.Mui-checked": {
                                color: "#3D5CAC",
                              },
                            }}
                          />
                        }
                        label='EIN'
                      />
                    </RadioGroup>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      // value={mask}
                      value= {showPassword ? ssn : '***-**-****'} 
                      // onChange={(e) => setSsn(e.target.value)}
                      // onChange={handleSSNChange}
                      onChange={(e) => handleTaxIDChange(e.target.value, true)}
                      variant='filled'
                      placeholder='SSN'
                      className={classes.root}
                      InputProps={{
                        className: errors.ssn || !ssn ? classes.errorBorder : "",
                        endAdornment: (
                          <InputAdornment position='end' style={{ marginRight: "8px", marginTop: "10px" }} >
                            <IconButton
                              aria-label='toggle password visibility'
                              onClick={() => setShowPassword((show) => !show)}
                              edge='end'
                            >
                              {showPassword ? <VisibilityOff style={{ fontSize: "20px"}}/> : <Visibility style={{ fontSize: "20px"  }}/>}
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
                    Payment Information
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

      <Grid container justifyContent='center' item xs={12} sx= {{ backgroundColor:"#F2F2F2", borderRadius: "10px",}}>
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
          },
        ]}
        severity={dialogSeverity}
      />
    </>
  );
}
