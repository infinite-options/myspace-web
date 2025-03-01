import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../utils/httpMiddleware";
import AES from "crypto-js/aes";
import CryptoJS from "crypto-js";
import theme from "../../theme/theme";
import { useUser } from "../../contexts/UserContext";
import DefaultProfileImg from "../../images/defaultProfileImg.svg";
import AddressAutocompleteInput from "../Property/AddressAutocompleteInput";
import DataValidator from "../DataValidator";
import { formatPhoneNumber, headers, maskNumber, maskEin, roleMap, photoFields } from "./helper";
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
} from "@mui/material";
import { makeStyles } from "@material-ui/core/styles";
import PayPal from "../../images/PayPal.png";
import ZelleIcon from "../../images/Zelle.png";
import VenmoIcon from "../../images/Venmo.png";
import Stripe from "../../images/Stripe.png";
import ApplePay from "../../images/ApplePay.png";
import ChaseIcon from "../../images/Chase.png";
import CloseIcon from "@mui/icons-material/Close";
import { useCookies } from "react-cookie";
import APIConfig from "../../utils/APIConfig";

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
}));

const TenantOnBoardDesktopForm = ({ profileData, setIsSave }) => {
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
  const [paymentMethods, setPaymentMethods] = useState({
    paypal: { value: "", checked: false, uid: "", status: "Inactive" },
    apple_pay: { value: "", checked: false, uid: "", status: "Inactive" },
    stripe: { value: "", checked: false, uid: "", status: "Inactive" },
    zelle: { value: "", checked: false, uid: "", status: "Inactive" },
    venmo: { value: "", checked: false, uid: "", status: "Inactive" },
    credit_card: { value: "", checked: false, uid: "", status: "Inactive" },
    bank_account: { account_number: "", routing_number: "", checked: false, uid: "", status: "Inactive" },
  });

  const [adults, setAdults] = useState([{ id: 1, name: "", lastName: "", relation: "", dob: "" }]);
  const [children, setChildren] = useState([{ id: 1, name: "", lastName: "", relation: "", dob: "" }]);
  const [pets, setPets] = useState([{ id: 1, name: "", breed: "", type: "", weight: "" }]);
  const [vehicles, setVehicles] = useState([{ id: 1, make: "", model: "", year: "", license: "", state: "" }]);

  // New state for job details
  const [currentSalary, setCurrentSalary] = useState("");
  const [salaryFrequency, setSalaryFrequency] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    //console.log("calling useeffect");
    setIsSave(false);
    const fetchProfileData = async () => {
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
        paymentMethodsData.forEach((method) => {
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
    };

    fetchProfileData();
  }, []);

  // useEffect(() => {
  //   //console.log("148 - ssn - ", ssn);
  // }, [ssn]);

  const saveProfile = async (form) => {
    const profileApi = "/profile";
    const { data } = await axios.put(`${APIConfig.baseURL.dev}${profileApi}`, form, headers);
    setIsSave(true);
    return data;
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
      alert(`Your file size is too large (${file_size} MB)`);
      return;
    }
    readImage(file);
  };

  const handleFirstNameChange = (event) => {
    setFirstName(event.target.value);
  };

  const handleLastNameChange = (event) => {
    setLastName(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleSsnChange = (event) => {
    let value = event.target.value;
    if (!value) {
      setSsn("");
      setMask("");
      return;
    }
    if (value.length > 11) return;
    const lastChar = value.charAt(value.length - 1);
    if (mask.length > value.length) {
      if (lastChar !== "-") setSsn(ssn.slice(0, ssn.length - 1));
      setMask(value);
    } else {
      setSsn(ssn + lastChar);
      setMask(maskNumber(ssn + lastChar));
    }
  };

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
          last_name: adult.lastName,
          relationship: adult.relation,
          dob: adult.dob,
        }))
      ),
      tenant_children_occupants: JSON.stringify(
        children.map((child) => ({
          name: child.name,
          last_name: child.lastName,
          relationship: child.relation,
          dob: child.dob,
        }))
      ),
      tenant_pet_occupants: JSON.stringify(
        pets.map((pet) => ({
          name: pet.name,
          breed: pet.breed,
          type: pet.type,
          weight: pet.weight,
        }))
      ),
      tenant_vehicle_info: JSON.stringify(
        vehicles.map((vehicle) => ({
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          license: vehicle.license,
          state: vehicle.state,
        }))
      ),
      tenant_current_salary: currentSalary,
      tenant_salary_frequency: salaryFrequency,
      tenant_current_job_title: jobTitle,
      tenant_current_job_company: companyName,
    };
  };

  const handlePhoneNumberChange = (event) => {
    setPhoneNumber(formatPhoneNumber(event.target.value));
  };

  const handleUnitChange = (event) => {
    setUnit(event.target.value);
  };

  const handleCityChange = (event) => {
    setCity(event.target.value);
  };

  const handleStateChange = (event) => {
    setState(event.target.value);
  };

  const handleAddressSelect = (address) => {
    setAddress(address.street ? address.street : "");
    setCity(address.city ? address.city : "");
    setState(address.state ? address.state : "");
    setZip(address.zip ? address.zip : "");
  };

  const readImage = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      file.image = e.target.result;
      setPhoto(file);
    };
    reader.readAsDataURL(file.file);
  };

  const handlePaymentStep = async () => {
    setShowSpinner(true);
    const keys = Object.keys(paymentMethods);
    const putPayload = [];
    const postPayload = [];
    keys.forEach((key) => {
      if (paymentMethods[key].uid) {
        let paymentMethodPayload = {
          paymentMethod_type: key,
          paymentMethod_profile_id: getProfileId(),
          paymentMethod_status: paymentMethods[key].status,
        };
        if (key === "bank_account") {
          const bankAccount = paymentMethods[key];
          paymentMethodPayload.paymentMethod_routing_number = bankAccount.routing_number;
          paymentMethodPayload.paymentMethod_account_number = bankAccount.account_number;
          paymentMethodPayload.paymentMethod_uid = bankAccount.uid;
        } else {
          paymentMethodPayload.paymentMethod_name = paymentMethods[key].value;
          paymentMethodPayload.paymentMethod_uid = paymentMethods[key].uid;
        }
        putPayload.push(paymentMethodPayload);
      } else if (paymentMethods[key].checked) {
        let paymentMethodPayload = {
          paymentMethod_type: key,
          paymentMethod_profile_id: getProfileId(),
          paymentMethod_status: "Active",
        };
        if (key === "bank_account") {
          const bankAccount = paymentMethods[key];
          paymentMethodPayload.paymentMethod_routing_number = bankAccount.routing_number;
          paymentMethodPayload.paymentMethod_account_number = bankAccount.account_number;
        } else {
          paymentMethodPayload.paymentMethod_name = paymentMethods[key].value;
        }
        postPayload.push(paymentMethodPayload);
      }
    });

    if (putPayload.length > 0) {
      await axios.put(`${APIConfig.baseURL.dev}/paymentMethod`, putPayload, { headers: { "Content-Type": "application/json" } });
    }

    if (postPayload.length > 0) {
      await axios.post(`${APIConfig.baseURL.dev}/paymentMethod`, postPayload, { headers: { "Content-Type": "application/json" } });
    }

    setShowSpinner(false);
    setCookie("default_form_vals", { ...cookiesData, paymentMethods });
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

  const renderPaymentMethods = () => {
    return paymentMethodsArray.map((method, index) => (
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} key={index}>
        <Grid item xs={2}>
          <Checkbox name={method.name.toLowerCase().replace(/\s/g, "_")} checked={method.state?.checked} onChange={handleChangeChecked} />
        </Grid>
        <Grid item xs={2}>
          <img src={method.icon} alt={method.name} />
        </Grid>
        {method.name === "Bank Account" ? (
          <>
            <Grid item xs={4}>
              <TextField
                name={`${method.name.toLowerCase().replace(/\s/g, "_")}_account`}
                value={method.state?.account_number}
                onChange={handleChangeValue}
                variant="filled"
                fullWidth
                placeholder={`Enter Your Bank Account Number`}
                className={classes.root}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                name={`${method.name.toLowerCase().replace(/\s/g, "_")}_routing`}
                value={method.state?.routing_number}
                onChange={handleChangeValue}
                variant="filled"
                fullWidth
                placeholder={`Enter Your Bank Routing Number`}
                className={classes.root}
              />
            </Grid>
          </>
        ) : (
          <Grid item xs={8}>
            <TextField
              name={method.name.toLowerCase().replace(/\s/g, "_")}
              value={method.state?.value}
              onChange={handleChangeValue}
              variant="filled"
              fullWidth
              placeholder={`Enter ${method.name}`}
              className={classes.root}
            />
          </Grid>
        )}
      </Grid>
    ));
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

  const handleNextStep = async () => {
    setCookie("default_form_vals", { ...cookiesData, firstName, lastName });
    if (firstName === "") {
      alert("Please enter first name");
      return;
    }
    if (lastName === "") {
      alert("Please enter last name");
      return;
    }

    if (!DataValidator.email_validate(email)) {
      alert("Please enter a valid email");
      return false;
    }

    if (!DataValidator.phone_validate(phoneNumber)) {
      alert("Please enter a valid phone number");
      return false;
    }

    if (!DataValidator.zipCode_validate(zip)) {
      alert("Please enter a valid zip code");
      return false;
    }

    if (!DataValidator.ssn_validate(ssn)) {
      alert("Please enter a valid SSN");
      return false;
    }

    const payload = getPayload();
    const form = encodeForm(payload);
    const data = await saveProfile(form);
    const paymentSetup = await handlePaymentStep();
    setIsSave(true);
    setShowSpinner(false);
    return;
  };

  const handleNavigation = (e) => {
    selectRole("TENANT");
    setLoggedIn(true);
    navigate("/tenantDashboard");
  };

  const handleChangeChecked = (e) => {
    const { name, checked } = e.target;
    const map = { ...paymentMethods };
    map[name].checked = checked;
    map[name].status = checked ? "Active" : "Inactive";
    setPaymentMethods(map);
  };

  useEffect(() => {
    let disable_state = Object.keys(paymentMethods).some((key) => {
      if (paymentMethods[key].checked && paymentMethods[key].value === "") {
        return true;
      }
      if (key === "bank_account" && paymentMethods[key].checked && (paymentMethods[key].account_number === "" || paymentMethods[key].routing_number === "")) {
        return true;
      }
      return false;
    });
    setNextStepDisabled(disable_state);
  }, [paymentMethods]);

  const handleAddRow = (setRows) => {
    setRows((prevRows) => [...prevRows, { id: prevRows.length + 1, name: "", lastName: "", relation: "", dob: "" }]);
  };

  const handleRemoveRow = (id, setRows) => {
    setRows((prevRows) => prevRows.filter((row) => row.id !== id));
  };

  const handleRowChange = (id, name, value, setRows) => {
    setRows((prevRows) => prevRows.map((row) => (row.id === id ? { ...row, [name]: value } : row)));
  };

  const renderRows = (rows, setRows, fields) => {
    const columnWidth = fields.length === 5 ? 2.4 : 3; // Adjust width based on the number of fields

    return rows.map((row, index) => (
      <div key={row.id} style={{ position: "relative" }}>
        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          {fields.map((field) => (
            <Grid item xs={columnWidth} key={field.name}>
              <Stack spacing={-2} m={2}>
                <Typography
                  sx={{
                    color: theme.typography.common.blue,
                    fontWeight: theme.typography.primary.fontWeight,
                  }}
                >
                  {field.label}
                </Typography>
                <TextField
                  name={field.name}
                  value={row[field.name]}
                  variant="filled"
                  fullWidth
                  placeholder={field.placeholder}
                  className={classes.root}
                  onChange={(e) => handleRowChange(row.id, e.target.name, e.target.value, setRows)}
                />
              </Stack>
            </Grid>
          ))}
        </Grid>
        {index !== 0 && (
          <IconButton aria-label="delete" sx={{ position: "absolute", top: 0, right: 0 }} onClick={() => handleRemoveRow(row.id, setRows)}>
            <CloseIcon />
          </IconButton>
        )}
        {row.id === rows.length && (
          <Stack direction="row" sx={{ display: "flex", justifyContent: "right" }}>
            <div onClick={() => handleAddRow(setRows)} style={{ cursor: "pointer" }}>
              <Typography
                sx={{
                  color: theme.typography.common.blue,
                  fontWeight: theme.typography.primary.fontWeight,
                }}
              >
                Add another row
              </Typography>
            </div>
          </Stack>
        )}
      </div>
    ));
  };

  const adultFields = [
    { name: "name", label: "Name", width: 3, placeholder: "Name" },
    { name: "lastName", label: "Last Name", width: 3, placeholder: "Last Name" },
    { name: "relation", label: "Relation", width: 3, placeholder: "Relation" },
    { name: "dob", label: "DOB (MM-DD-YYYY)", width: 3, placeholder: "MM-DD-YYYY" },
  ];

  const childrenFields = [
    { name: "name", label: "Name", width: 3, placeholder: "Name" },
    { name: "lastName", label: "Last Name", width: 3, placeholder: "Last Name" },
    { name: "relation", label: "Relation", width: 3, placeholder: "Relation" },
    { name: "dob", label: "DOB (MM-DD-YYYY)", width: 3, placeholder: "MM-DD-YYYY" },
  ];

  const petFields = [
    { name: "name", label: "Name", width: 3, placeholder: "Name" },
    { name: "breed", label: "Breed", width: 3, placeholder: "Breed" },
    { name: "type", label: "Type", width: 3, placeholder: "Type" },
    { name: "weight", label: "Weight", width: 3, placeholder: "Weight" },
  ];

  const vehicleFields = [
    { name: "make", label: "Make", width: 2.4, placeholder: "Make" },
    { name: "model", label: "Model", width: 2.4, placeholder: "Model" },
    { name: "year", label: "Year", width: 2.4, placeholder: "Year" },
    { name: "license", label: "License", width: 2.4, placeholder: "License" },
    { name: "state", label: "State", width: 2.4, placeholder: "State" },
  ];

  return (
    <div>
      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: "bold", color: "#1f1f1f" }}>
        Tenant Profile Info
      </Typography>
      <Box display="flex">
        <Box width="20%" p={2}>
          <Stack direction="row" justifyContent="center">
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
                alt="profile"
              />
            ) : (
              <img src={DefaultProfileImg} alt="default" style={{ width: "121px", height: "121px", borderRadius: "50%" }} />
            )}
          </Stack>
          <Box sx={{ paddingTop: "8%" }} />
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Button
              component="label"
              variant="contained"
              sx={{
                backgroundColor: "#3D5CAC",
                width: "193px",
                height: "35px",
              }}
            >
              {" "}
              Add Profile Pic
              <input type="file" hidden accept="image/*" onChange={handlePhotoChange} />
            </Button>
          </Box>
        </Box>
        <Box width="80%" p={3} sx={{ overflowY: "auto" }}>
          <Stack spacing={2} direction="row">
            <Typography
              sx={{
                color: theme.typography.common.blue,
                fontWeight: theme.typography.primary.fontWeight,
                width: "100%",
              }}
            >
              {"First Name"}
            </Typography>
            <Typography
              sx={{
                color: theme.typography.common.blue,
                fontWeight: theme.typography.primary.fontWeight,
                width: "100%",
              }}
            >
              {"Last Name"}
            </Typography>
          </Stack>
          <Stack spacing={2} direction="row">
            <TextField name="firstName" value={firstName} onChange={handleFirstNameChange} variant="filled" fullWidth placeholder="First name" className={classes.root} />
            <TextField name="lastName" value={lastName} variant="filled" onChange={handleLastNameChange} fullWidth placeholder="Last name" className={classes.root} />
          </Stack>

          <Stack spacing={2} direction="row">
            <Typography
              sx={{
                color: theme.typography.common.blue,
                fontWeight: theme.typography.primary.fontWeight,
                width: "50%",
              }}
            >
              {"Personal Address"}
            </Typography>
            <Typography
              sx={{
                color: theme.typography.common.blue,
                fontWeight: theme.typography.primary.fontWeight,
                width: "10%",
              }}
            >
              {"Unit"}
            </Typography>

            <Typography
              sx={{
                color: theme.typography.common.blue,
                fontWeight: theme.typography.primary.fontWeight,
                width: "20%",
              }}
            >
              {"City"}
            </Typography>
            <Typography
              sx={{
                color: theme.typography.common.blue,
                fontWeight: theme.typography.primary.fontWeight,
                width: "10%",
              }}
            >
              {"State"}
            </Typography>
            <Typography
              sx={{
                color: theme.typography.common.blue,
                fontWeight: theme.typography.primary.fontWeight,
                width: "10%",
              }}
            >
              {"Zip"}
            </Typography>
          </Stack>
          <Stack spacing={2} direction="row">
            <Box sx={{ width: "50%" }}>
              <AddressAutocompleteInput onAddressSelect={handleAddressSelect} gray={true} defaultValue={address} />
            </Box>
            <TextField value={unit} onChange={handleUnitChange} variant="filled" sx={{ width: "10%" }} placeholder="3" className={classes.root}></TextField>
            <TextField name="City" value={city} onChange={handleCityChange} variant="filled" sx={{ width: "20%" }} placeholder="City" className={classes.root} />
            <TextField name="State" value={state} onChange={handleStateChange} variant="filled" sx={{ width: "10%" }} placeholder="State" className={classes.root} />
            <TextField name="Zip" value={zip} variant="filled" sx={{ width: "10%" }} placeholder="Zip" className={classes.root} />
          </Stack>

          <Stack spacing={2} direction="row">
            <Typography
              sx={{
                color: theme.typography.common.blue,
                fontWeight: theme.typography.primary.fontWeight,
                width: "100%",
              }}
            >
              {"Personal Email"}
            </Typography>
            <Typography
              sx={{
                color: theme.typography.common.blue,
                fontWeight: theme.typography.primary.fontWeight,
                width: "100%",
              }}
            >
              {"Personal Phone"}
            </Typography>
          </Stack>
          <Stack spacing={2} direction="row">
            <TextField name="PersonalEmail" value={email} variant="filled" fullWidth onChange={handleEmailChange} placeholder="email@site.com" className={classes.root} />
            <TextField
              value={phoneNumber}
              type="tel"
              pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
              onChange={handlePhoneNumberChange}
              placeholder="(000)000-0000"
              variant="filled"
              fullWidth
              className={classes.root}
            ></TextField>
          </Stack>
          <Stack spacing={2} direction="row">
            <Typography
              sx={{
                color: theme.typography.common.blue,
                fontWeight: theme.typography.primary.fontWeight,
                width: "100%",
              }}
            >
              {"SSN"}
            </Typography>
          </Stack>
          <Stack spacing={2} direction="row">
            <TextField value={mask} onChange={handleSsnChange} variant="filled" sx={{ width: "50%" }} placeholder="Enter SSN" className={classes.root}></TextField>
          </Stack>
        </Box>
      </Box>

      <hr />

      {/* New section for Current Job Details */}
      <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: "bold", color: "#1f1f1f" }}>
        Current Job Details
      </Typography>
      <Box p={3}>
        <Paper elevation={3} sx={{ padding: 3, mb: 3 }}>
          <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
            <Grid item xs={3}>
              <Stack spacing={-2} m={2}>
                <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight }}>Current Salary</Typography>
                <TextField
                  name="currentSalary"
                  value={currentSalary}
                  onChange={(e) => setCurrentSalary(e.target.value)}
                  variant="filled"
                  fullWidth
                  placeholder="100000"
                  className={classes.root}
                />
              </Stack>
            </Grid>
            <Grid item xs={3}>
              <Stack spacing={-2} m={2}>
                <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight }}>Salary Frequency</Typography>
                <Select name="salaryFrequency" value={salaryFrequency} onChange={(e) => setSalaryFrequency(e.target.value)} variant="filled" fullWidth className={classes.root}>
                  <MenuItem value="Bi-weekly">Bi-weekly</MenuItem>
                  <MenuItem value="Semi-monthly">Semi-monthly</MenuItem>
                  <MenuItem value="Hourly">Hourly</MenuItem>
                  <MenuItem value="Daily">Daily</MenuItem>
                  <MenuItem value="Weekly">Weekly</MenuItem>
                  <MenuItem value="Monthly">Monthly</MenuItem>
                  <MenuItem value="Yearly">Yearly</MenuItem>
                </Select>
              </Stack>
            </Grid>
            <Grid item xs={3}>
              <Stack spacing={-2} m={2}>
                <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight }}>Job Title</Typography>
                <TextField name="jobTitle" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} variant="filled" fullWidth placeholder="SDE" className={classes.root} />
              </Stack>
            </Grid>
            <Grid item xs={3}>
              <Stack spacing={-2} m={2}>
                <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight }}>Company Name</Typography>
                <TextField
                  name="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  variant="filled"
                  fullWidth
                  placeholder="ABC"
                  className={classes.root}
                />
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      <hr />

      <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: "bold", color: "#1f1f1f" }}>
        Who plans to live in the house
      </Typography>
      <Box p={3}>
        <Paper elevation={3} sx={{ padding: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1f1f1f" }}>
            Adults
          </Typography>
          {renderRows(adults, setAdults, adultFields)}

          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1f1f1f", mt: 3 }}>
            Children
          </Typography>
          {renderRows(children, setChildren, childrenFields)}

          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1f1f1f", mt: 3 }}>
            Pets
          </Typography>
          {renderRows(pets, setPets, petFields)}

          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1f1f1f", mt: 3 }}>
            Vehicles
          </Typography>
          {renderRows(vehicles, setVehicles, vehicleFields)}
        </Paper>
      </Box>

      <hr />

      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: "bold", color: "#1f1f1f" }}>
        Payment Methods
      </Typography>
      <Box p={3} sx={{ maxWidth: "800px" }}>
        <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Paper elevation={3} sx={{ padding: 3, mb: 3 }}>
          {renderPaymentMethods()}
        </Paper>
      </Box>
      <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" p={5}>
        <Button variant="contained" color="primary" onClick={handleNextStep} disabled={nextStepDisabled} sx={{ mb: 2, backgroundColor: "#3D5CAC" }}>
          Save
        </Button>
        {/* <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleNavigation}
                    disabled={!dashboardButtonEnabled}
                >
                    Go to Dashboard
                </Button> */}
      </Box>
    </div>
  );
};

export default TenantOnBoardDesktopForm;
