import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Paper,
  Box,
  Stack,
  ThemeProvider,
  Button,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Container,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  List,
  ListItem,
  OutlinedInput,
  Select,
  MenuItem,
} from "@mui/material";
import theme from "../../theme/theme";
// import AccountCircleIcon from "@mui/icons-material/AccountCircle";
// import UTurnLeftIcon from "@mui/icons-material/UTurnLeft";
// import { makeStyles } from "@material-ui/core/styles";
// import { TextField } from "@mui/material";
import GoogleSignup from "./GoogleSignup";
// import axios from "axios";
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../utils/httpMiddleware";
import { useCookies } from "react-cookie";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import ConstructionOutlinedIcon from "@mui/icons-material/ConstructionOutlined";
import PersonIcon from "@mui/icons-material/Person";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useUser } from "../../contexts/UserContext";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import { roleMap } from "./helper";
import DataValidator from "../DataValidator";
import UserExistsModal from "./UserExistsModal";
import APIConfig from "../../utils/APIConfig";
import useMediaQuery from "@mui/material/useMediaQuery";
import ListsContext from "../../contexts/ListsContext";

const NewUser = () => {
  //console.log("In NewUser2");
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState(null);
  const [showEmailSignup, setShowEmailSignup] = useState(false);
  const { setAuthData, selectRole, setLoggedIn } = useUser();
  const [cookies, setCookie] = useCookies(["user"]);
  const [showPassword, setShowPassword] = useState(false);
  const [googleInfoAvailable, setGoogleInfoAvailable] = useState(false);
  const { fetchLists } = useContext(ListsContext);
  const [user, setUser] = useState(location.state?.user ? location.state?.user : null);

  useEffect(() => {
    if (user) {
      setGoogleInfoAvailable(true);
    }
  }, [user]);

  //console.log("ROHIT - user - ", user);

  const [email, setEmail] = useState(location.state?.user_email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState();
  const [userExists, setUserExists] = useState(false);

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const onSignupModal = () => {
    setUserExists(false);
    setPassword("");
    setConfirmPassword("");
  };

  // useEffect(() => {
  //   //console.log("role -  ", role);
  // }, [role]);

  // useEffect(() => {
  //   //console.log("email -  ", email);
  // }, [email]);

  // useEffect(() => {
  //   //console.log("businesses -  ", businesses);
  // }, [businesses]);

  useEffect(() => {
    // //console.log("selectedBusiness -  ", selectedBusiness);
    if (selectedBusiness?.business_type === "MANAGEMENT") {
      setRole("PM_EMPLOYEE");
    } else if (selectedBusiness?.business_type === "MAINTENANCE") {
      setRole("MAINT_EMPLOYEE");
    }
  }, [selectedBusiness]);

  const fetchBusinesses = async () => {
    const url = `${APIConfig.baseURL.dev}/businessProfile`;
    // const args = {
    //   business_type: isManagementEmployee() ? "MANAGEMENT" : "MAINTENANCE",
    // };
    // const response = await axios.get(url + objToQueryString(args));
    const response = await axios.get(url);
    setBusinesses(response.data.result);
  };

  const handleRoleChange = (event, newRole) => {
    // //console.log("handleRoleChange - newRole - ", newRole);
    if (newRole !== null) {
      setRole(newRole);
      if (newRole === "EMPLOYEE") {
        fetchBusinesses();
      }
    }
  };

  const validate_form = () => {
    if (googleInfoAvailable) {
      return true;
    }
    if (email === "" || password === "" || confirmPassword === "") {
      alert("Please fill out all fields");
      return false;
    }

    if (!DataValidator.email_validate(email)) {
      alert("Please enter a valid email");
      return false;
    }

    if (password !== confirmPassword) {
      alert("Passwords must match");
      return false;
    }

    if (role === "EMPLOYEE" || (selectedBusiness == null && (role === "PM_EMPLOYEE" || role === "MAINT_EMPLOYEE"))) {
      alert("Please select the business that you are an employee of.");
      return false;
    }
  };

  const checkIfUserExists = async (email) => {
    if (email) {
      try {
        const response = await axios.get(`${APIConfig.baseURL.dev}/userInfo/${email}`);
        if (response) {
          return response;
        } else {
          return null;
        }
      } catch (error) {
        if (error.response && error.response.status === 404 && error.response.data.message === "User not found") {
          return null;
        } else {
          throw error;
        }
      }
    } else if (user?.email) {
      try {
        const response = await axios.get(`${APIConfig.baseURL.dev}/userInfo/${user.email}`);
        if (response) {
          return response;
        } else {
          return null;
        }
      } catch (error) {
        if (error.response && error.response.status === 404 && error.response.data.message === "User not found") {
          return null;
        } else {
          throw error;
        }
      }
    }
  };

  const handleLogin = async () => {
    let newRole = role;
    if (email === "" || password === "") {
      alert("Please fill out all fields");
      return;
    }
    // setShowSpinner(true);
    axios
      .post("https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/AccountSalt/MYSPACE", {
        email: email,
      })
      .then((res) => {
        let saltObject = res;
        if (saltObject.data.code === 200) {
          let hashAlg = saltObject.data.result[0].password_algorithm;
          let salt = saltObject.data.result[0].password_salt;

          if (hashAlg != null && salt != null) {
            // Make sure the data exists
            if (hashAlg !== "" && salt !== "") {
              // Rename hash algorithm so client can understand
              switch (hashAlg) {
                case "SHA256":
                  hashAlg = "SHA-256";
                  break;
                default:
                  break;
              }
              // Salt plain text password
              let saltedPassword = password + salt;
              // Encode salted password to prepare for hashing
              const encoder = new TextEncoder();
              const data = encoder.encode(saltedPassword);
              //Hash salted password
              crypto.subtle.digest(hashAlg, data).then((res) => {
                let hash = res;
                // Decode hash with hex digest
                let hashArray = Array.from(new Uint8Array(hash));
                let hashedPassword = hashArray
                  .map((byte) => {
                    return byte.toString(16).padStart(2, "0");
                  })
                  .join("");
                //console.log(hashedPassword);
                let loginObject = {
                  email: email,
                  password: hashedPassword,
                };

                axios
                  .post("https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/Login/MYSPACE", loginObject)
                  .then(async (response) => {
                    // //console.log(response.data.message);
                    const { message, result } = response.data;
                    if (message === "Incorrect password") {
                      // alert(response.data.message);
                      // alert("User already exist")
                      setUserExists(true);
                      // navigate("/userLogin", { state: { user_email: email } });
                      // setShowSpinner(false);
                    } else if (message === "User email does not exist") {
                      //setUserDoesntExist(true);
                      // setShowSpinner(false);
                    } else if (message === "Login successful") {
                      localStorage.removeItem("hasRedirected");
                      sessionStorage.setItem("authToken", result.access_token);
                      sessionStorage.setItem("refreshToken", result.refresh_token);
                      //console.log("Login successfull moving to dashboard");

                      await fetchLists();
                      const { role } = result.user;

                      const existingRoles = role.split(",");
                      // //console.log("----dhyey---- exisiting role for current user - ", existingRoles)

                      setLoggedIn(true);
                      // Check if the new role already exists
                      if (!existingRoles.includes(newRole)) {
                        // Add the new role
                        existingRoles.push(newRole);
                        const updatedRole = existingRoles.join(",");
                        // Send the update request to the server
                        const response = await axios.put("https://mrle52rri4.execute-api.us-west-1.amazonaws.com/dev/api/v2/UpdateUserByUID/MYSPACE", {
                          user_uid: result.user.user_uid,
                          role: updatedRole,
                        });
                        // Check if the response is successful
                        if (response.status === 200) {
                          let updatedUser = result;
                          updatedUser.user.role = updatedRole;
                          setAuthData(updatedUser);
                          //setCookie("user", { ...cookies.user, role: updatedRole }, { path: "/" });
                          // //console.log("----dhyey---- before navigating addNewRole updateduser- ", updatedUser, " --- user_id - ", result.user.user_uid, " -- newRole - ", newRole)
                          alert("Role updated successfully");
                          navigate("/addNewRole", { state: { user_uid: result.user.user_uid, newRole: newRole } });
                          return;
                        } else {
                          alert("An error occurred while updating the role.");
                        }
                      }
                      const openingRole = role.split(",")[0];
                      selectRole(openingRole);
                      setAuthData(result);
                      // setTimeout(() => {
                      //   setAuthData(result); // Delay the context update to avoid the rendering issue
                      // }, 0);
                      setLoggedIn(true);
                      const { dashboardUrl } = roleMap[openingRole];
                      // //console.log("---after if condition of exisitingRole Login successfull moving to dashboard ", dashboardUrl);
                      navigate(dashboardUrl);
                    }
                  })
                  .catch((err) => {
                    if (err.response) {
                      //console.log(err.response);
                    }
                    //console.log(err);
                  });
              });
            }
          }
        } else {
          // setUserDoesntExist(true);
          // setShowSpinner(false);
        }
      });
  };

  const handleSignup = async () => {
    //console.log("signup clicked");
    //confirmPassword password
    if (confirmPassword != password) {
      alert("Passwords don't match. Please check and try again!");
      return;
    }
    const userExists = await checkIfUserExists(email);
    let userObject = null;

    if (googleInfoAvailable) {
      userObject = {
        ...user,
        role: role,
        // isEmailSignup: false,
      };
    } else {
      userObject = {
        email: email,
        password: password,
        role: role,
        isEmailSignup: true,
      };
    }

    // console.log("user Exists", userExists);
    console.log("Prashant Current User Info: ", user);
    console.log("Prashant Current Business Info: ", selectedBusiness);
    if (userExists != null) {
      handleLogin();
    } else {
      if (validate_form() === false) return;
      navigate(`/createProfile`, { state: { user: userObject, selectedBusiness: selectedBusiness } });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth='lg' sx={{ height: "100vh", backgroundColor: "#FFFFFF" }}>
        <Grid container>
          <Grid container item xs={12} justifyContent='center'>
            <Typography sx={{ fontSize: "35px", color: "#160449" }}>Select a Role</Typography>
          </Grid>
          {/* <Grid item xs={12}>
            <ToggleButtonGroup value={role} exclusive onChange={handleRoleChange} aria-label='select role' sx={{ display: "flex", justifyContent: "center", gap: "10px"}}>
              <ToggleButton value='OWNER' aria-label='owner' sx={{ backgroundColor: "#FFFFFF", color: "#000000", height: "150px", width: "200px" }}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <HomeOutlinedIcon sx={{ height: "50%", width: "50%" }} />
                  <Typography sx={{ fontSize: "20px", fontWeight: "bold" }}>Owner</Typography>
                </Box>
              </ToggleButton>

              <ToggleButton value='MANAGER' aria-label='manager' sx={{ backgroundColor: "#FFFFFF", color: "#000000", height: "150px", width: "200px" }}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <ManageAccountsOutlinedIcon sx={{ height: "50%", width: "50%" }} />
                  <Typography sx={{ fontSize: "20px", fontWeight: "bold" }}>Manager</Typography>
                </Box>
              </ToggleButton>

              <ToggleButton value='TENANT' aria-label='tenant' sx={{ backgroundColor: "#FFFFFF", color: "#000000", height: "150px", width: "200px" }}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <PersonOutlineOutlinedIcon sx={{ height: "50%", width: "50%" }} />
                  <Typography sx={{ fontSize: "20px", fontWeight: "bold" }}>Tenant</Typography>
                </Box>
              </ToggleButton>

              <ToggleButton value='MAINTENANCE' aria-label='maintenance' sx={{ backgroundColor: "#FFFFFF", color: "#000000", height: "150px", width: "200px" }}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <ConstructionOutlinedIcon sx={{ height: "50%", width: "50%" }} />
                  <Typography sx={{ fontSize: "20px", fontWeight: "bold" }}>Maintenance</Typography>
                </Box>
              </ToggleButton>
              <ToggleButton value='EMPLOYEE' aria-label='employee' sx={{ backgroundColor: "#FFFFFF", color: "#000000", height: "150px", width: "200px" }}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <PersonIcon sx={{ height: "50%", width: "50%" }} />
                  <Typography sx={{ fontSize: "20px", fontWeight: "bold" }}>Employee</Typography>
                </Box>
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid> */}

          <Grid item xs={12} sx={{ marginTop: "20px" }}>
            <ToggleButtonGroup
              value={role}
              exclusive
              onChange={handleRoleChange}
              aria-label="select role"
              sx={{
                display: "grid",
                gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "10px",
                justifyContent: "center",
              }}
            >
              <ToggleButton
                value="OWNER"
                aria-label="owner"
                sx={{
                  backgroundColor: "#FFFFFF",
                  color: "#000000",
                  height: "150px",
                  width: "200px",
                }}
              >
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <HomeOutlinedIcon sx={{ height: "50%", width: "50%" }} />
                  <Typography sx={{ fontSize: "20px", fontWeight: "bold" }}>Owner</Typography>
                </Box>
              </ToggleButton>

              <ToggleButton
                value="MANAGER"
                aria-label="manager"
                sx={{
                  backgroundColor: "#FFFFFF",
                  color: "#000000",
                  height: "150px",
                  width: "200px",
                }}
              >
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <ManageAccountsOutlinedIcon sx={{ height: "50%", width: "50%" }} />
                  <Typography sx={{ fontSize: "20px", fontWeight: "bold" }}>Manager</Typography>
                </Box>
              </ToggleButton>

              <ToggleButton
                value="TENANT"
                aria-label="tenant"
                sx={{
                  backgroundColor: "#FFFFFF",
                  color: "#000000",
                  height: "150px",
                  width: "200px",
                }}
              >
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <PersonOutlineOutlinedIcon sx={{ height: "50%", width: "50%" }} />
                  <Typography sx={{ fontSize: "20px", fontWeight: "bold" }}>Tenant</Typography>
                </Box>
              </ToggleButton>

              <ToggleButton
                value="MAINTENANCE"
                aria-label="maintenance"
                sx={{
                  backgroundColor: "#FFFFFF",
                  color: "#000000",
                  height: "150px",
                  width: "200px",
                }}
              >
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <ConstructionOutlinedIcon sx={{ height: "50%", width: "50%" }} />
                  <Typography sx={{ fontSize: "20px", fontWeight: "bold" }}>Maintenance</Typography>
                </Box>
              </ToggleButton>

              <ToggleButton
                value="EMPLOYEE"
                aria-label="employee"
                sx={{
                  backgroundColor: "#FFFFFF",
                  color: "#000000",
                  height: "150px",
                  width: "200px",
                }}
              >
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <PersonIcon sx={{ height: "50%", width: "50%" }} />
                  <Typography sx={{ fontSize: "20px", fontWeight: "bold" }}>Employee</Typography>
                </Box>
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          {role != null && (role === "EMPLOYEE" || role === "PM_EMPLOYEE" || role === "MAINT_EMPLOYEE") && (
            <>
              <Grid container item xs={12} justifyContent='center' sx={{ marginTop: "40px" }}>
                <Grid container item xs={12} justifyContent='center'>
                  <Typography sx={{ fontSize: "20px", color: "#3D5CAC", fontWeight: "bold", marginTop: "20px" }}>Please select a Business</Typography>
                </Grid>
                <Grid container item xs={7.25} justifyContent='center' sx={{ marginTop: "10px" }}>
                  <Select value={selectedBusiness} onChange={(e) => setSelectedBusiness(e.target.value)} size='small' fullWidth>
                    {businesses?.map((row) => (
                      <MenuItem value={row}>{row.business_name}</MenuItem>
                    ))}
                  </Select>
                </Grid>
              </Grid>
            </>
          )}
          {/* {role != null && (user == null || user.google_auth_token == null) && (
            <>
              <Grid container item xs={12} justifyContent='center' sx={{ marginTop: "50px" }}>
                <Grid container direction='column' item xs={4} alignItems='center'>
                  <GoogleSignup role={role}/>
                  <Typography sx={{ fontSize: "20px", color: "#3D5CAC", fontWeight: "bold", marginTop: "20px" }}>Recommended</Typography>
                  <List sx={{ listStyleType: "disc" }}>
                    <ListItem sx={{ display: "list-item" }}>No Separate Password</ListItem>
                    <ListItem sx={{ display: "list-item" }}>Makes Scheduling Easier</ListItem>
                    <ListItem sx={{ display: "list-item" }}>Faster Setup Process</ListItem>
                    <ListItem sx={{ display: "list-item" }}>Secured by Google</ListItem>
                  </List>
                </Grid>
                <Grid container direction='row' item xs={4} sx={{ padding: "7px" }}>
                  <Grid item xs={12}>
                    <Button
                      onClick={() => setShowEmailSignup((prevState) => !prevState)}
                      sx={{
                        width: "350px",
                        height: "57px",
                        borderRadius: "15px",
                        fontSize: "20px",
                        backgroundColor: "#F2F2F2",
                        textTransform: "none",
                        color: "grey",
                        fontWeight: "bold",
                        "&:hover": {
                          backgroundColor: "#F2F2F2",
                          color: "#160449",
                        },
                        boxShadow: 1,
                        justifyContent: "space-evenly",
                      }}
                    >
                      Signup with Email <KeyboardArrowDownIcon />
                    </Button>
                  </Grid>
                  {showEmailSignup && (
                    <Grid container direction='column' item xs={12} sx={{ marginTop: "30px" }}>
                      <OutlinedInput
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        id='filled-basic'
                        variant='filled'
                        placeholder='Enter Email Address'
                        sx={{ marginTop: "5px", width: "350px", backgroundColor: "#F2F2F2" }}
                      />
                      <OutlinedInput
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        id='filled-basic'
                        variant='filled'
                        placeholder='Enter Password'
                        sx={{ marginTop: "5px", width: "350px", backgroundColor: "#F2F2F2" }}
                        endAdornment={
                          <InputAdornment position='end'>
                            <IconButton aria-label='toggle password visibility' onClick={() => setShowPassword((show) => !show)} edge='end'>
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                      <OutlinedInput
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        id='filled-basic'
                        variant='filled'
                        placeholder='Verify Password'
                        sx={{ marginTop: "5px", width: "350px", backgroundColor: "#F2F2F2" }}
                        endAdornment={
                          <InputAdornment position='end'>
                            <IconButton aria-label='toggle password visibility' onClick={() => setShowPassword((show) => !show)} edge='end'>
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                      <Button
                        onClick={handleSignup}
                        sx={{
                          width: "350px",
                          height: "57px",
                          borderRadius: "5px",
                          fontSize: "16px",
                          backgroundColor: "#3D5CAC",
                          textTransform: "none",
                          color: "#FFFFFF",
                          fontWeight: "bold",
                          "&:hover": {
                            backgroundColor: "#160449",
                            color: "#FFFFFF",
                          },
                          marginTop: "10px",
                        }}
                      >
                        Sign Up
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </>
          )}

          {role != null && user != null && user.google_auth_token != null && (
            <>
              <Grid container direction='row' justifyContent='center' item xs={12} sx={{}}>
                <Grid item xs={4}></Grid>
                <Grid item xs={4}>
                  <Button
                    onClick={handleSignup}
                    sx={{
                      // margin: 'auto',
                      width: "100%",
                      height: "57px",
                      borderRadius: "15px",
                      fontSize: "20px",
                      backgroundColor: "#F2F2F2",
                      textTransform: "none",
                      color: "#160449",
                      fontWeight: "bold",
                      "&:hover": {
                        backgroundColor: "#F2F2F2",
                        color: "#3d5cac"
                      },
                      boxShadow: 1,
                      justifyContent: "space-evenly",
                    }}
                  >
                    Continue
                  </Button>
                </Grid>
                <Grid item xs={4}></Grid>
              </Grid>
            </>
          )} */}

          {role != null && (user == null || user.google_auth_token == null) && (
            <>
              <Grid container item xs={12} justifyContent="center" sx={{ marginTop: "50px" }}>
                <Grid container direction="column" item xs={isMobile ? 12 : 4} alignItems="center">
                  <GoogleSignup role={role} />
                  <Typography sx={{ fontSize: "20px", color: "#3D5CAC", fontWeight: "bold", marginTop: "20px" }}>
                    Recommended
                  </Typography>
                  <List sx={{ listStyleType: "disc" }}>
                    <ListItem sx={{ display: "list-item" }}>No Separate Password</ListItem>
                    <ListItem sx={{ display: "list-item" }}>Makes Scheduling Easier</ListItem>
                    <ListItem sx={{ display: "list-item" }}>Faster Setup Process</ListItem>
                    <ListItem sx={{ display: "list-item" }}>Secured by Google</ListItem>
                  </List>
                </Grid>
                <Grid container direction="row" item xs={isMobile ? 12 : 4} sx={{ padding: "7px" }}>
                  <Grid item xs={12}>
                    <Button
                      onClick={() => setShowEmailSignup((prevState) => !prevState)}
                      sx={{
                        width: isMobile ? "100%" : "350px",
                        height: "57px",
                        borderRadius: "15px",
                        fontSize: "20px",
                        backgroundColor: "#F2F2F2",
                        textTransform: "none",
                        color: "grey",
                        fontWeight: "bold",
                        "&:hover": {
                          backgroundColor: "#F2F2F2",
                          color: "#160449",
                        },
                        boxShadow: 1,
                        justifyContent: "space-evenly",
                      }}
                    >
                      Signup with Email <KeyboardArrowDownIcon />
                    </Button>
                  </Grid>
                  {showEmailSignup && (
                    <Grid container direction="column" item xs={12} sx={{ marginTop: "30px" }}>
                      <OutlinedInput
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter Email Address"
                        sx={{
                          marginTop: "5px",
                          width: isMobile ? "100%" : "350px",
                          backgroundColor: "#F2F2F2",
                        }}
                      />
                      <OutlinedInput
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter Password"
                        sx={{
                          marginTop: "5px",
                          width: isMobile ? "100%" : "350px",
                          backgroundColor: "#F2F2F2",
                        }}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setShowPassword((show) => !show)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                      <OutlinedInput
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Verify Password"
                        sx={{
                          marginTop: "5px",
                          width: isMobile ? "100%" : "350px",
                          backgroundColor: "#F2F2F2",
                        }}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setShowPassword((show) => !show)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                      <Button
                        onClick={handleSignup}
                        sx={{
                          width: isMobile ? "100%" : "350px",
                          height: "57px",
                          borderRadius: "5px",
                          fontSize: "16px",
                          backgroundColor: "#3D5CAC",
                          textTransform: "none",
                          color: "#FFFFFF",
                          fontWeight: "bold",
                          "&:hover": {
                            backgroundColor: "#160449",
                            color: "#FFFFFF",
                          },
                          marginTop: "10px",
                        }}
                      >
                        Sign Up
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </>
          )}

          {role != null && user != null && user.google_auth_token != null && (
            <>
              <Grid container direction="row" justifyContent="center" item xs={12}>
                <Grid item xs={isMobile ? 12 : 4}></Grid>
                <Grid item xs={isMobile ? 12 : 4}>
                  <Button
                    onClick={handleSignup}
                    sx={{
                      width: "100%",
                      height: "57px",
                      borderRadius: "15px",
                      fontSize: "20px",
                      backgroundColor: "#F2F2F2",
                      textTransform: "none",
                      color: "#160449",
                      fontWeight: "bold",
                      "&:hover": {
                        backgroundColor: "#F2F2F2",
                        color: "#3d5cac",
                      },
                      boxShadow: 1,
                      justifyContent: "space-evenly",
                    }}
                  >
                    Continue
                  </Button>
                </Grid>
                <Grid item xs={isMobile ? 12 : 4}></Grid>
              </Grid>
            </>
          )}

          <Grid container item xs={12} justifyContent='center' sx={{ marginTop: "20px" }}>
            <Typography
              sx={{
                color: theme.typography.common.default,
                fontWeight: theme.typography.light.fontWeight,
                fontSize: theme.typography.primary.smallFont,
              }}
            >
              Already have an account ?{" "}
              <u>
                <a href='/'>Log In</a>
              </u>
            </Typography>
          </Grid>
        </Grid>
      </Container>
      <UserExistsModal isOpen={userExists} onSignup={onSignupModal} email={email} />
    </ThemeProvider>
  );
};

export default NewUser;
