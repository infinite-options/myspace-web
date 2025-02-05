import React, { useState, useEffect, useRef, useContext, } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../utils/httpMiddleware";
import AES from "crypto-js/aes";
import CryptoJS from "crypto-js";
import theme from "../../theme/theme";
import { useUser } from "../../contexts/UserContext";
import DefaultProfileImg from "../../images/defaultProfileImg.svg";
import AddressAutocompleteInput from "../Property/AddressAutocompleteInput";
import AddIcon from '@mui/icons-material/Add';
import DataValidator from "../DataValidator";
import { formatPhoneNumber, formatSSN, formatEIN, identifyTaxIdType, headers, maskNumber, maskEin, roleMap, photoFields } from "./helper";
import { useOnboardingContext } from "../../contexts/OnboardingContext";
import DeleteIcon from "@mui/icons-material/Delete";
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
// import DashboardTab from "../TenantDashboard/NewDashboardTab";
import APIConfig from "../../utils/APIConfig";

import AdultOccupant from "../Leases/AdultOccupant";
import EmploymentInformation from "../Leases/EmploymentInformation";
import ChildrenOccupant from "../Leases/ChildrenOccupant";
import PetsOccupant from "../Leases/PetsOccupant";
import VehiclesOccupant from "../Leases/VehiclesOccupant";
import Documents from "../Leases/Documents";
import ListsContext from "../../contexts/ListsContext";
import GenericDialog from "../GenericDialog";
import IncomeDetails from "./IncomeDetails";

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

export default function TenantOnBoardingForm({ profileData, setIsSave }) {
  //console.log("In TenenatOnBoardingForm  - profileData", profileData);

  const { getList, } = useContext(ListsContext)
  const salaryFrequencies = getList("frequency");
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
  useEffect(() => {
    if (ssn && identifyTaxIdType(ssn) === "EIN") setTaxIDType("EIN");
  }, [ssn])

  useEffect(() => {
    handleTaxIDChange(ssn, false);
  }, [taxIDType])


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
  const [isPreviousFileChange, setIsPreviousFileChange] = useState(false)
  const [uploadedFileTypes, setUploadedFileTypes] = useState([]);

  const adultsRef = useRef(adults);
  const childrenRef = useRef(children);
  const petsRef = useRef(pets);
  const vehiclesRef = useRef(vehicles);
  const documentsRef = useRef([]);

  const [relationships, setRelationships] = useState([]);
  const [states, setStates] = useState([]);

  // Old state for job details
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

  const [errors, setErrors] = useState({});

  const [occupancyExpanded, setOccupancyExpanded] = useState(true);
  const [empinfoExpanded, setEmpinfoExpanded] = useState(true);
  const [paymentExpanded, setPaymentExpanded] = useState(true);
  const [documentsExpanded, setDocumentsExpanded] = useState(true);

  const getListDetails = () => {
    const relationships = getList("relationships");
    const states = getList("states");
    setRelationships(relationships);
    setStates(states);
  };

  const [employmentList, setEmploymentList] = useState([
    { id: Date.now(), jobTitle: "", companyName: "", salary: "", frequency: "" }
  ]);

  // useEffect(() => {
  //   if (profileData) {
  //     const employmentData = {
  //       jobTitle: profileData.tenant_current_job_title || "",
  //       companyName: profileData.tenant_current_job_company || "",
  //       salary: profileData.tenant_current_salary || "",
  //       frequency: profileData.tenant_salary_frequency || "",
  //     };
  //     setEmploymentList([employmentData]);
  //   }
  // }, [profileData]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      console.log(" ok im here in unload")
      if (modifiedData) {
        console.log("modifiedData - in unloaded", modifiedData);
        const message = "You have unsaved changes. Are you sure you want to leave?";
        event.returnValue = message; // Standard message for browsers
        return message; // For modern browsers
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [modifiedData]);

  useEffect(() => {
    if (profileData) {
      const employmentData = profileData.tenant_employment ? JSON.parse(profileData.tenant_employment) : [];
      setEmploymentList(employmentData);
    }
  }, [profileData]);

  // useEffect(() => {
  //   //console.log("adults - ", adults);
  // }, [adults]);

  // useEffect(() => {
  //   //console.log("paymentMethods - ", paymentMethods);
  // }, [paymentMethods]);

  // useEffect(() => {
  //   //console.log("modifiedData - ", modifiedData);
  // }, [modifiedData]);

  // useEffect(() => {
  //   //console.log("148 - ssn - ", ssn);
  //   //console.log("148 - profileData.tenant_ssn - ", profileData.tenant_ssn);

  // }, [ssn]);

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
    updateModifiedData({ key: "tenant_first_name", value: event.target.value });
  };

  const handleLastNameChange = (event) => {
    setLastName(event.target.value);
    updateModifiedData({ key: "tenant_last_name", value: event.target.value });
  };

  const handleAddressSelect = (address) => {
    setAddress(address.street ? address.street : "");
    updateModifiedData({ key: "tenant_address", value: address.street ? address.street : "" });
    setCity(address.city ? address.city : "");
    updateModifiedData({ key: "tenant_city", value: address.city ? address.city : "" });
    setState(address.state ? address.state : "");
    updateModifiedData({ key: "tenant_state", value: address.state ? address.state : "" });
    setZip(address.zip ? address.zip : "");
    updateModifiedData({ key: "tenant_zip", value: address.zip ? address.zip : "" });
  };

  const handleUnitChange = (event) => {
    setUnit(event.target.value);
    updateModifiedData({ key: "tenant_unit", value: event.target.value });
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    updateModifiedData({ key: "tenant_email", value: event.target.value });
  };

  const handlePhoneNumberChange = (event) => {
    setPhoneNumber(formatPhoneNumber(event.target.value));
    updateModifiedData({ key: "tenant_phone_number", value: formatPhoneNumber(event.target.value) });
  };

  const handleLicenseChange = (event) => {
    setLicense(event.target.value);
    updateModifiedData({ key: "tenant_drivers_license_number", value: event.target.value });
  };

  const handleLicenseStateChange = (event) => {
    setLicenseState(event.target.value);
    updateModifiedData({ key: "tenant_drivers_license_state", value: event.target.value });
  };

  const handleLicenseExpChange = (event) => {
    setLicenseExp(event.target.value);
    updateModifiedData({ key: "tenant_drivers_license_exp", value: event.target.value });
  };

  // const handleSSNChange = (event) => {
  //   let value = event.target.value;
  //   if (value.length > 11) return;
  //   setSsn(value);
  //   updateModifiedData({ key: "tenant_ssn", value: AES.encrypt(event.target.value, process.env.REACT_APP_ENKEY).toString() });
  // };

  const handleTaxIDChange = (value, onchangeflag) => {
    // let value = event.target.value;
    if (value?.length > 11) return;

    let updatedTaxID = ""
    if (taxIDType === "EIN") {
      updatedTaxID = formatEIN(value)
    } else {
      updatedTaxID = formatSSN(value)
    }
    setSsn(updatedTaxID);
    if (onchangeflag) {
      // updateModifiedData({ key: "business_ein_number", value: AES.encrypt(event.target.value, process.env.REACT_APP_ENKEY).toString() });
      updateModifiedData({ key: "tenant_ssn", value: AES.encrypt(updatedTaxID, process.env.REACT_APP_ENKEY).toString() });

    }
  };

  const handleJobTitleChange = (event) => {
    setJobTitle(event.target.value);
    updateModifiedData({ key: "tenant_current_job_title", value: event.target.value });
  };

  const handleCompanyChange = (event) => {
    setCompanyName(event.target.value);
    updateModifiedData({ key: "tenant_current_job_company", value: event.target.value });
  };

  const handleSalaryChange = (event) => {
    setCurrentSalary(event.target.value);
    updateModifiedData({ key: "tenant_current_salary", value: event.target.value });
  };

  const handleSalaryFrequencyChange = (event) => {
    setSalaryFrequency(event.target.value);
    updateModifiedData({ key: "tenant_salary_frequency", value: event.target.value });
  };

  const setProfileData = async () => {
    setShowSpinner(true);
    try {
      // const profileResponse = await axios.get(`${APIConfig.baseURL.dev}/profile/${getProfileId()}`);
      // const profileData = profileResponse.data.profile.result[0];
      setFirstName(profileData.tenant_first_name || "");
      setLastName(profileData.tenant_last_name || "");
      setEmail(profileData.tenant_email || "");
      setPhoneNumber(formatPhoneNumber(profileData.tenant_phone_number || ""));
      setPhoto(profileData.tenant_photo_url ? { image: profileData.tenant_photo_url } : null);
      setSsn(profileData.tenant_ssn ? AES.decrypt(profileData.tenant_ssn, process.env.REACT_APP_ENKEY).toString(CryptoJS.enc.Utf8) : "");
      setMask(profileData.tenant_ssn ? maskNumber(AES.decrypt(profileData.tenant_ssn, process.env.REACT_APP_ENKEY).toString(CryptoJS.enc.Utf8)) : "");
      setAddress(profileData.tenant_address || "");
      setUnit(profileData.tenant_unit || "");
      setCity(profileData.tenant_city || "");
      setState(profileData.tenant_state || "");
      setZip(profileData.tenant_zip || "");
      setCurrentSalary(profileData.tenant_current_salary || "");
      setSalaryFrequency(profileData.tenant_salary_frequency || "");
      setJobTitle(profileData.tenant_current_job_title || "");
      setCompanyName(profileData.tenant_current_job_company || "");

      setLicense(profileData.tenant_drivers_license_number || "");
      setLicenseState(profileData.tenant_drivers_license_state || "");
      setLicenseExp(profileData.tenant_drivers_license_exp || "");

      // setAdults(JSON.parse(profileData.tenant_adult_occupants) || []);
      const parsedAdults = JSON.parse(profileData.tenant_adult_occupants) || [];
      setAdults(parsedAdults?.map((adult, index) => {
        return {
          ...adult,
          id: index + 1,
        }
      }));

      // setChildren(JSON.parse(profileData.tenant_children_occupants) || []);
      const parsedChildren = JSON.parse(profileData.tenant_children_occupants) || [];
      setChildren(parsedChildren?.map((child, index) => {
        return {
          ...child,
          id: index + 1,
        }
      }));

      // setPets(JSON.parse(profileData.tenant_pet_occupants) || []);
      const parsedPets = JSON.parse(profileData.tenant_pet_occupants) || [];
      setPets(parsedPets?.map((pet, index) => {
        return {
          ...pet,
          id: index + 1,
        }
      }));

      // setVehicles(JSON.parse(profileData.tenant_vehicle_info) || []);
      const parsedVehicles = JSON.parse(profileData.tenant_vehicle_info) || [];
      setVehicles(parsedVehicles?.map((vehicle, index) => {
        return {
          ...vehicle,
          id: index + 1,
        }
      }));

      const parsedDocs = JSON.parse(profileData.tenant_documents);
      // //console.log("parsedDocs - ", parsedDocs);
      // const docs = parsedDocs
      //   ? parsedDocs.map((doc, index) => ({
      //       ...doc,
      //       id: index,
      //     }))
      //   : [];
      // //console.log('initial docs', docs);
      setDocuments(parsedDocs);
      documentsRef.current = parsedDocs;

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
    //console.log("calling useeffect");
    setIsSave(false);

    setProfileData();

    getListDetails();
  }, []);

  useEffect(() => {
    //console.log("calling profileData useEffect");

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
    // let isLarge = file.file.size > 5000000;
    // let file_size = (file.file.size / 1000000).toFixed(1);
    // if (isLarge) {
    //   openDialog("Alert",`Your file size is too large (${file_size} MB)`,"info");
    //   return;
    // }

    const maxSize = 2.5 * 1024 * 1024; // 2.5 MB in bytes
    const isLarge = file.file.size > maxSize;
    const fileSizeMB = (file.file.size / 1024 / 1024).toFixed(1);

    // Check file format
    const allowedFormats = ["image/jpeg", "image/png"];
    const isInvalidFormat = !allowedFormats.includes(file.file.type);

    if (isLarge || isInvalidFormat) {
      let errorMessage = "";
      if (isLarge) {
        errorMessage += `File size is too large (${fileSizeMB} MB). Max allowed size is 2.5 MB.`;
      }
      if (isInvalidFormat) {
        errorMessage += `Invalid file format. Only JPEG and PNG formats are allowed.`;
      }

      openDialog("Alert", errorMessage, "info");
      return;
    }

    updateModifiedData({ key: "tenant_photo_url", value: e.target.files[0] });
    readImage(file);
  };

  const [parsedPaymentMethods, setParsedPaymentMethods] = useState([]);

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

  const [modifiedPayment, setModifiedPayment] = useState(false);

  const paymentTypes = [
    { type: 'paypal', name: 'PayPal', icon: PayPal },
    { type: 'zelle', name: 'Zelle', icon: ZelleIcon },
    { type: 'venmo', name: 'Venmo', icon: VenmoIcon },
    { type: 'stripe', name: 'Stripe', icon: Stripe },
    { type: 'apple_pay', name: 'Apple Pay', icon: ApplePay },
    { type: 'bank_account', name: 'Bank Account', icon: ChaseIcon },
  ];

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
          <Grid item xs={3} sx={{ alignContent: "center" }}>
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
              <Grid item xs={8} sm={8}>
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

        <Grid item xs={1}>
          <IconButton onClick={() => handleDeletePaymentMethod(method.paymentMethod_uid)} aria-label="delete">
            <DeleteIcon />
          </IconButton>
        </Grid>
        {/* {method.paymentMethod_uid && !method.paymentMethod_uid.startsWith('new_') && (
          
        )} */}
      </Grid>
    ));
  };

  const getIconForMethod = (type) => {
    //console.log("payments icon ---", type);
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

  const getPayload = () => {
    return {
      tenant_user_id: user.user_uid,
      tenant_uid: getProfileId(),
      tenant_first_name: firstName,
      tenant_last_name: lastName,
      tenant_phone_number: phoneNumber,
      tenant_email: email,
      tenant_ssn: AES.encrypt(ssn, process.env.REACT_APP_ENKEY).toString(),
      tenant_address: address,
      tenant_unit: unit,
      tenant_city: city,
      tenant_state: state,
      tenant_zip: zip,
      tenant_photo_url: photo,
      tenant_adult_occupants: JSON.stringify(
        adults.map((adult) => ({
          name: adult.name,
          last_name: adult.last_name,
          relationship: adult.relationship,
          dob: adult.dob,
          email: adult.email,
          phone_number: adult.phone_number,
        }))
      ),
      tenant_children_occupants: JSON.stringify(
        children.map((child) => ({
          name: child.name,
          last_name: child.last_name,
          relationship: child.relationship,
          dob: child.dob,
          email: child.email,
          phone_number: child.phone_number,
        }))
      ),
      tenant_pet_occupants: JSON.stringify(
        pets.map((pet) => ({
          name: pet.name,
          last_name: pet.last_name,
          breed: pet.breed,
          type: pet.type,
          weight: pet.weight,
          owner: pet.owner,
        }))
      ),
      tenant_vehicle_info: JSON.stringify(
        vehicles.map((vehicle) => ({
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          license: vehicle.license,
          state: vehicle.state,
          owner: vehicle.owner,
        }))
      ),
      tenant_current_salary: currentSalary,
      tenant_salary_frequency: salaryFrequency,
      tenant_current_job_title: jobTitle,
      tenant_current_job_company: companyName,

      tenant_drivers_license_number: license,
      tenant_drivers_license_state: licenseState,
      tenant_drivers_license_exp: licenseExp,
    };
  };

  const encodeForm = (payload) => {
    const form = new FormData();
    for (let key in payload) {
      if (photoFields.has(key)) {
        if (payload[key] && payload[key].file instanceof File) {
          form.append(key, payload[key].file);
        }
      } else {
        form.append(key, payload[key]);
      }
    }
    return form;
  };

  // const saveProfile = async (form) => {
  //   const profileApi = "/profile";
  //   const { data } = await axios.put(`${APIConfig.baseURL.dev}${profileApi}`, form, headers);
  //   setIsSave(true);
  //   return data;
  // };


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

  const handlePaymentStep = async (validPaymentMethods) => {
    setShowSpinner(true);
    const existingMethods = profileData.paymentMethods
      ? JSON.parse(profileData.paymentMethods)
      : [];

    const putPayload = [];
    const postPayload = [];

    validPaymentMethods.forEach((method) => {

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
              method.paymentMethod_acct !==
                  existingMethod.paymentMethod_acct));

        if (hasChanged) {
          // Only send the required fields along with paymentMethod_uid
          putPayload.push({
            paymentMethod_uid: method.paymentMethod_uid,
            paymentMethod_name: method.paymentMethod_name,
            paymentMethod_profile_id: getProfileId(),
            paymentMethod_status: method.paymentMethod_status,
            paymentMethod_type: method.paymentMethod_type,
            ...(method.paymentMethod_type === "bank_account" && {
              paymentMethod_routing_number: method.paymentMethod_routing_number,
              paymentMethod_acct: method.paymentMethod_acct,
            }),
          });
        }
      } else {
        // New payment method: Add to POST payload
        postPayload.push({
          paymentMethod_type: method.paymentMethod_type,
          paymentMethod_name: method.paymentMethod_name,
          paymentMethod_status: method.checked ? "Active" : "Inactive",
          paymentMethod_profile_id: getProfileId(),
          ...(method.paymentMethod_type === "bank_account" && {
            paymentMethod_routing_number: method.paymentMethod_routing_number,
            paymentMethod_acct: method.paymentMethod_acct,
          }),
        });
      }
    });

    try {
      // Make PUT request if there are modified payment methods
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

      if(putPayload.length > 0 || postPayload.length > 0){
        handleUpdate();
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
    if (!firstName) newErrors.firstName = 'First name is required';
    if (!lastName) newErrors.lastName = 'Last name is required';
    if (!address) newErrors.address = 'Address is required';
    if (!email) newErrors.email = 'Email is required';
    if (!phoneNumber) newErrors.phoneNumber = 'Phone Number is required';
    if (!ssn) newErrors.ssn = 'SSN is required';

    let paymentMethodsError = false;
    let atLeastOneActive = false;

    const validPaymentMethods = parsedPaymentMethods.filter((method) => method.paymentMethod_type !== "");

    validPaymentMethods.forEach(method => {
      if ((method.paymentMethod_type !== "bank_account" && method.paymentMethod_name === '') || (method.paymentMethod_type === "bank_account" && (method.paymentMethod_acct === '' || method.paymentMethod_routing_number === ''))) {
        paymentMethodsError = true;
      }
      if (method.checked) {
        atLeastOneActive = true; // Found at least one active
      }
    });

    if (!atLeastOneActive) {
      newErrors.paymentMethods = 'Atleast one active payment method is required';
      openDialog(
        "Alert",
        'Atleast one active payment method is required. Please select and activate a payment method.',
        "info"
      );
      return;
    }

    if (paymentMethodsError) {
      newErrors.paymentMethods = 'Please check payment method details';
      openDialog("Alert", 'Please check payment method details', "info");
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

    if (modifiedPayment) {
      await handlePaymentStep(validPaymentMethods);
    }

    await saveProfile();

    setShowSpinner(false);
    return;
  };

  const showSnackbar = (message, severity) => {
    //console.log("Inside show snackbar");
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleUpdate = () => {
    // setIsUpdate( prevState => !prevState);
    //console.log("handleUpdate called");
    setIsSave(true);
  };

  const editOrUpdateTenant = async () => {
    //console.log("inside editOrUpdateTenant", modifiedData);
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
          //console.log(`Key: ${item.key}`);
          // if (item.key === "uploadedFiles") {
          //   //console.log("uploadedFiles", item.value);
          //   if (item.value.length) {
          //     const documentsDetails = [];
          //     [...item.value].forEach((file, i) => {
          //       profileFormData.append(`file_${i}`, file.file, file.name);
          //       const fileType = "pdf";
          //       const documentObject = {
          //         // file: file,
          //         fileIndex: i,
          //         fileName: file.name,
          //         contentType: file.contentType
          //       };
          //       documentsDetails.push(documentObject);
          //     });
          //     profileFormData.append("tenant_documents_details", JSON.stringify(documentsDetails));
          //   }
          // } else {
          if (item.key !== "tenant_income_1" && item.key !== "tenant_employment" && item.key !== 'tenant_adult_occupants' &&
            item.key !== 'tenant_children_occupants' &&
            item.key !== 'tenant_pet_occupants' &&
            item.key !== 'tenant_vehicle_info') {
            profileFormData.append(item.key, item.value);
          } else {
            profileFormData.append(item.key, JSON.stringify(item.value));
          }
          // }
        });
        profileFormData.append("tenant_uid", profileData.tenant_uid);

        await axios.put(`${APIConfig.baseURL.dev}/profile`, profileFormData, headers);
        setIsDialogOpen(true);
        setDialogTitle("Success");
        setDialogMessage("Your profile has been successfully updated.");
        setDialogSeverity("success");
        setModifiedData([]);
        handleUpdate();
        setShowSpinner(false);
      } else {
        setIsDialogOpen(true);
        setDialogTitle("Warning");
        setDialogMessage("You haven't made any changes to the form. Please save after changing the data.");
        setDialogSeverity("error");
      }
    } catch (error) {
      setShowSpinner(false);
      setIsDialogOpen(true);
      setDialogTitle("Error");
      setDialogMessage("Cannot update your profile. Please try again.");
      setDialogSeverity("error");
      //console.log("Cannot Update the lease", error);
    }
  };

  const saveProfile = async () => {
    //console.log("inside saveProfile", modifiedData);
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

        // Append modified data only
        modifiedData.forEach((item) => {
          // Ensure tenant_employment is appended only once and avoid appending tenant_income_1
          if (item.key !== "tenant_income_1" && item.key !== "tenant_employment" && item.key !== 'tenant_adult_occupants' &&
            item.key !== 'tenant_children_occupants' &&
            item.key !== 'tenant_pet_occupants' &&
            item.key !== 'tenant_vehicle_info') {
            profileFormData.append(item.key, item.value);
          }
        });

        // If employment data has changed, append tenant_employment only once
        // if (employmentList && employmentList.length > 0) {
        //   profileFormData.append("tenant_employment", JSON.stringify(employmentList));
        // }

        // Handle documents, files, and tenant_uid as before
        if (isPreviousFileChange) {
          profileFormData.append("tenant_documents", JSON.stringify(documents));
        }

        if (deletedFiles && deletedFiles?.length !== 0) {
          profileFormData.append("delete_documents", JSON.stringify(deletedFiles));
        }

        if (uploadedFiles && uploadedFiles?.length) {
          const documentsDetails = [];
          [...uploadedFiles].forEach((file, i) => {
            profileFormData.append(`file_${i}`, file);
            const fileType = uploadedFileTypes[i] || "";
            const documentObject = {
              fileIndex: i,
              fileName: file.name,
              contentType: fileType,
            };
            documentsDetails.push(documentObject);
          });
          profileFormData.append("tenant_documents_details", JSON.stringify(documentsDetails));
        }

        profileFormData.append("tenant_uid", profileData.tenant_uid);

        // Send the API request
        await axios.put(`${APIConfig.baseURL.dev}/profile`, profileFormData, { headers });

        setIsDialogOpen(true);
        setDialogTitle("Success");
        setDialogMessage("Your profile has been successfully updated.");
        setDialogSeverity("success");
        setModifiedData([]);
        setuploadedFiles([]);
        handleUpdate();
        setShowSpinner(false);
      }else if(modifiedPayment){
        setIsDialogOpen(true);
        setDialogTitle("Success");
        setDialogMessage("Your payment method has been successfully updated.");
        setDialogSeverity("success");
      } else {
        setIsDialogOpen(true);
        setDialogTitle("Warning");
        setDialogMessage("You haven't made any changes to the form. Please save after changing the data.");
        setDialogSeverity("error");
      }
    } catch (error) {
      setShowSpinner(false);
      setIsDialogOpen(true);
      setDialogTitle("Error");
      setDialogMessage("Cannot update your profile. Please try again.");
      setDialogSeverity("error");
    }
  };

  const handleIncomeChange = (event, index, field) => {
    const updatedList = [...employmentList];
    updatedList[index][field] = event.target.value;
    setEmploymentList(updatedList);

    // Check for changes and update modifiedData
    const hasChanges = employmentList.some((emp, i) =>
      emp.jobTitle !== updatedList[i].jobTitle ||
      emp.companyName !== updatedList[i].companyName ||
      emp.salary !== updatedList[i].salary ||
      emp.frequency !== updatedList[i].frequency
    );

    if (hasChanges) {
      updateModifiedData({ key: "tenant_employment", value: updatedList });
    }
  };

  const handleAddIncome = () => {
    const newIncome = { jobTitle: "", companyName: "", salary: "", frequency: "" };
    const updatedList = [...employmentList, newIncome];
    setEmploymentList(updatedList);

    // Update tenant_employment in modifiedData
    updateModifiedData({ key: "tenant_employment", value: updatedList });
  };

  const handleRemoveIncome = (index) => {
    const updatedList = employmentList.filter((_, i) => i !== index);
    setEmploymentList(updatedList);

    // Update tenant_employment in modifiedData
    updateModifiedData({ key: "tenant_employment", value: updatedList });
  };
  const [showSsn, setShowSsn] = useState(ssn?.length > 0 ? false : true);

  return (
    <>
      <Grid container sx={{ backgroundColor: "#f0f0f0", borderRadius: "10px", cursor: "pointer", marginBottom: "10px", padding: "10px" }}>
        <Grid item xs={12}>
          <Typography align='center' gutterBottom sx={{ fontSize: "24px", fontWeight: "bold", color: "#1f1f1f" }}>
            Tenant Profile Information
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
            <Grid item xs={12} md={9} marginTop={isMobile ? "20px" : "0px"}>
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
                    name='firstName'
                    value={firstName}
                    onChange={(e) => handleFirstNameChange(e)}
                    variant='filled'
                    fullWidth
                    placeholder='First name'
                    className={classes.root}
                    InputProps={{
                      className: errors.firstName || !firstName ? classes.errorBorder : '',
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
                      className: errors.lastName || !lastName ? classes.errorBorder : '',
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
                    <AddressAutocompleteInput
                      onAddressSelect={handleAddressSelect}
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
                      onChange={handleUnitChange}
                      variant='filled'
                      placeholder='Unit'
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
                    <TextField disabled name='City' value={city} onChange={(e) => setCity(e.target.value)} variant='filled' placeholder='City' className={classes.root} 
                      sx={{
                        '& .MuiInputBase-input.Mui-disabled': {
                        color: 'black',
                        '-webkit-text-fill-color': 'black !important',
                      },
                    }}/>
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
                    <TextField disabled name='State' value={state} onChange={(e) => setState(e.target.value)} variant='filled' placeholder='State' className={classes.root} 
                      sx={{
                        '& .MuiInputBase-input.Mui-disabled': {
                        color: 'black',
                        '-webkit-text-fill-color': 'black !important',
                      },
                    }}/>
                  </Grid>
                </Grid>

                <Grid container item xs={2} md={1.5}>
                  <Grid item xs={12}>
                    <Typography
                      sx={{
                        color: theme.typography.common.blue,
                        fontWeight: theme.typography.primary.fontWeight,
                        width: "100%",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {isMobile ? "Zip" : "Zip Code"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField disabled name='Zip' value={zip} onChange={(e) => setZip(e.target.value)} variant='filled' placeholder='Zip' className={classes.root} 
                      sx={{
                        '& .MuiInputBase-input.Mui-disabled': {
                        color: 'black',
                        '-webkit-text-fill-color': 'black !important',
                      },
                    }}/>
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
                        className: errors.phoneNumber || !phoneNumber ? classes.errorBorder : '',
                      }}
                      required
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
                      {"Drivers License"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth value={license} onChange={handleLicenseChange} variant='filled' placeholder='License Number' className={classes.root}></TextField>
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
                      {"State"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth value={licenseState} onChange={handleLicenseStateChange} variant='filled' placeholder='License State' className={classes.root}></TextField>
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
                      {"Exp Date"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth value={licenseExp} onChange={handleLicenseExpChange} variant='filled' placeholder='License Exp' className={classes.root}></TextField>
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
                      {"SSN"}
                    </Typography>
                  </Grid>
                  <Grid item xs={8} sm={6}>
                    {/* <Select name='tax_id_type' value={taxIDType} size='small' fullWidth onChange={(e) => setTaxIDType(e.target.value)} placeholder='Select Tax ID Type' className={classes.select}>
                    <MenuItem value='SSN'>SSN</MenuItem>
                    <MenuItem value='EIN'>EIN</MenuItem>
                  </Select> */}

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
                      value={ssn.length > 0 ? showSsn ? ssn : "***-**-****" : ""}
                      // onChange={(e) => setSsn(e.target.value)}
                      // onChange={handleSSNChange}
                      onChange={(e) => handleTaxIDChange(e.target.value, true)}
                      variant='filled'
                      placeholder={taxIDType === "SSN" ? 'SSN' : "EIN"}
                      className={classes.root}
                      InputProps={{
                        className: errors.ssn || !ssn ? classes.errorBorder : '',
                        endAdornment: (
                          <InputAdornment position='end' style={{ marginRight: "8px", marginTop: "10px" }} >
                            <IconButton
                              aria-label='toggle password visibility'
                              onClick={() => setShowSsn((show) => !show)}
                              edge='end'
                            >
                              {showSsn ? <VisibilityOff style={{ fontSize: "20px" }} /> : <Visibility style={{ fontSize: "20px" }} />}
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


      {/* <Grid container justifyContent='center' sx={{ backgroundColor: "#f0f0f0", borderRadius: "10px", padding: "10px", marginBottom: "10px" }}>
      <Grid item xs={12}>
         <Accordion sx={{ backgroundColor: "#F0F0F0", boxShadow: "none" }} expanded={empinfoExpanded} onChange={() => setEmpinfoExpanded(prevState => !prevState)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='occupants-content' id='occupants-header'>
        <Grid item xs={12}>
          <Typography align='center' gutterBottom sx={{ fontSize: "24px", fontWeight: "bold", color: "#1f1f1f" }}>
            Employment Information
          </Typography>
      </Grid></AccordionSummary>
            <AccordionDetails>
            <Grid container item xs={12} columnSpacing={2}>
          <Grid container item xs={6} columnSpacing={2}>
            <Grid item xs={12}>
              <Typography
                sx={{
                  color: theme.typography.common.blue,
                  fontWeight: theme.typography.primary.fontWeight,
                  width: "100%",
                }}
              >
                {"Job Title"}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField name='jobTitle' value={jobTitle} onChange={handleJobTitleChange} variant='filled' fullWidth placeholder='Job Title' className={classes.root} />
            </Grid>
          </Grid>

          <Grid container item xs={6} columnSpacing={2}>
            <Grid item xs={12}>
              <Typography
                sx={{
                  color: theme.typography.common.blue,
                  fontWeight: theme.typography.primary.fontWeight,
                  width: "100%",
                }}
              >
                {"Company"}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField name='company' value={companyName} onChange={handleCompanyChange} variant='filled' fullWidth placeholder='Company Name' className={classes.root} />
            </Grid>
          </Grid>
        </Grid>

        <Grid container item xs={12} columnSpacing={2}>
          <Grid container item xs={6} columnSpacing={2}>
            <Grid item xs={12}>
              <Typography
                sx={{
                  color: theme.typography.common.blue,
                  fontWeight: theme.typography.primary.fontWeight,
                  width: "100%",
                }}
              >
                {"Current Salary"}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                InputProps={{ startAdornment: <InputAdornment position='start'>$</InputAdornment> }}
                name='salary'
                value={currentSalary}
                onChange={handleSalaryChange}
                variant='filled'
                fullWidth
                placeholder='Current Salary'
                className={classes.root}
              />
            </Grid>
          </Grid>

          <Grid container item xs={6} columnSpacing={2}>
            <Grid item xs={12}>
              <Typography
                sx={{
                  color: theme.typography.common.blue,
                  fontWeight: theme.typography.primary.fontWeight,
                  width: "100%",
                }}
              >
                {"Frequency"}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Select
                name='salaryFrequency'
                value={salaryFrequency}
                onChange={handleSalaryFrequencyChange}
                variant='filled'
                fullWidth
                className={classes.root}
                sx={{
                  height: "30px", // Set your desired height
                  borderRadius: "8px", // Set your desired border radius
                  ".MuiFilledInput-root": {
                    padding: "0 12px", // Adjust padding if necessary
                  },
                  ".MuiSelect-filled.MuiSelect-filled": {
                    height: "30px", // Ensure the inner input matches the desired height
                    borderRadius: "8px", // Ensure the inner input matches the desired border radius
                  },
                }}
              >
                {
									salaryFrequencies?.map( (freq, index) => (
										<MenuItem key={index} value={freq.list_item}>{freq.list_item}</MenuItem>
									) )
								}
              </Select>
            </Grid>
          </Grid>
        </Grid>
      
            </AccordionDetails>
          </Accordion>
          </Grid>
          </Grid> */}

      {/* <Grid container justifyContent='center' sx={{ backgroundColor: "#f0f0f0", borderRadius: "10px", padding: "10px", marginBottom: "10px" }}>
          <Grid item xs={12}>
            <Accordion sx={{ backgroundColor: "#F0F0F0", boxShadow: "none" }} expanded={empinfoExpanded} onChange={() => setEmpinfoExpanded(prevState => !prevState)}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='employment-content' id='employment-header'>
                <Grid item xs={12}>
                  <Typography align='center' gutterBottom sx={{ fontSize: "24px", fontWeight: "bold", color: "#1f1f1f" }}>
                    Income Information
                  </Typography>
                </Grid>
              </AccordionSummary>
              <AccordionDetails>
                <EmploymentInformation
                  employmentList={employmentList}
                  setEmploymentList={setEmploymentList}
                  salaryFrequencies={salaryFrequencies}
                />
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid> */}

      <Grid container justifyContent='center' sx={{ backgroundColor: "#f0f0f0", borderRadius: "10px", padding: "10px", marginBottom: "10px" }}>
        <Grid item xs={12}>
          <Accordion sx={{ backgroundColor: "#F0F0F0", boxShadow: "none" }} expanded={empinfoExpanded} onChange={() => setEmpinfoExpanded(prevState => !prevState)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='income-details-content' id='income-details-header'>
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
                    }}
                    paddingTop='5px'
                    paddingBottom='10px'
                  >
                    Income Details
                  </Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <IncomeDetails
                employmentList={employmentList}
                setEmploymentList={(newList) => {
                  setEmploymentList(newList);
                  // updateModifiedData({ key: "tenant_employment", value: newList });
                }}
                salaryFrequencies={salaryFrequencies}
              />
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>

      <Grid container justifyContent='center' sx={{ backgroundColor: "#f0f0f0", borderRadius: "10px", padding: "10px", marginBottom: "10px" }}>
        <Grid item xs={12}>
          <Accordion sx={{ backgroundColor: "#F0F0F0", boxShadow: "none" }} expanded={occupancyExpanded} onChange={() => setOccupancyExpanded(prevState => !prevState)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='occupants-content' id='occupants-header'>
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
                  setLeaseAdults={setAdults}
                  relationships={relationships}
                  editOrUpdateLease={editOrUpdateTenant}
                  adultsRef={adultsRef}
                  modifiedData={modifiedData}
                  setModifiedData={setModifiedData}
                  dataKey={"tenant_adult_occupants"}
                  isEditable={true}
                />
              )}
              {children && (
                <ChildrenOccupant
                  leaseChildren={children}
                  setLeaseChildren={setChildren}
                  relationships={relationships}
                  editOrUpdateLease={editOrUpdateTenant}
                  childrenRef={childrenRef}
                  modifiedData={modifiedData}
                  setModifiedData={setModifiedData}
                  dataKey={"tenant_children_occupants"}
                  isEditable={true}
                />
              )}
              {pets && (
                <PetsOccupant
                  leasePets={pets}
                  setLeasePets={setPets}
                  editOrUpdateLease={editOrUpdateTenant}
                  petsRef={petsRef}
                  modifiedData={modifiedData}
                  setModifiedData={setModifiedData}
                  dataKey={"tenant_pet_occupants"}
                  ownerOptions={[...adults, ...children]}
                  isEditable={true}
                />
              )}
              {vehicles && (
                <VehiclesOccupant
                  leaseVehicles={vehicles}
                  setLeaseVehicles={setVehicles}
                  states={states}
                  editOrUpdateLease={editOrUpdateTenant}
                  vehiclesRef={vehiclesRef}
                  modifiedData={modifiedData}
                  setModifiedData={setModifiedData}
                  dataKey={"tenant_vehicle_info"}
                  ownerOptions={[...adults, ...children]}
                  isEditable={true}
                />
              )}
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>

      <Grid container justifyContent='center' sx={{ backgroundColor: "#f0f0f0", borderRadius: "10px", padding: "10px", marginBottom: "10px" }}>
        <Grid item xs={12}>
          <Accordion sx={{ backgroundColor: "#F0F0F0", boxShadow: "none" }} expanded={documentsExpanded} onChange={() => setDocumentsExpanded(prevState => !prevState)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='documents-content' id='documents-header'>
              <Grid container justifyContent='center'>
                <Grid item md={11.5}>
                  <Typography
                    sx={{
                      color: "#160449",
                      fontWeight: theme.typography.primary.fontWeight,
                      fontSize: "24px",
                      textAlign: "center",
                      // paddingBottom: "10px",
                      paddingTop: "5px",
                      flexGrow: 1,
                      paddingLeft: "50px",
                    }}
                    paddingTop='5px'
                    // paddingBottom='10px'
                  >
                    Documents
                  </Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              {/* <Typography>Tenant Documents</Typography> */}
              <Typography sx={{ fontSize: '14px', fontWeight: 'bold', color: '#3D5CAC', marginLeft: '5px' }}>
                Tenant Documents
              </Typography>
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


      <Grid container justifyContent='center' item xs={12} sx={{ backgroundColor: "#F2F2F2", borderRadius: "10px", }} paddingTop='10px'
        paddingBottom='10px'>
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
