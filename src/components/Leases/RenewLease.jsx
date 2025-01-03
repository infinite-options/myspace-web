import React from "react";
import { useEffect, useState, useRef, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Typography, Box, IconButton, Paper, Grid, Accordion, AccordionSummary, AccordionDetails, Button, Snackbar, Alert, AlertTitle } from "@mui/material";
import dayjs from "dayjs";
import { makeStyles } from "@material-ui/core/styles";
import theme from "../../theme/theme";
import LeaseIcon from "../Property/leaseIcon.png";
import AdultOccupant from "./AdultOccupant";
import ChildrenOccupant from "./ChildrenOccupant";
import PetsOccupant from "./PetsOccupant";
import VehiclesOccupant from "./VehiclesOccupant";
import Documents from "./Documents";
// import axios from "axios";
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../utils/httpMiddleware";
import { useUser } from "../../contexts/UserContext";
import RenewLeaseButton from "./RenewLeaseButton";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import APIConfig from "../../utils/APIConfig";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import TenantDetails from "./TenantDetails";
import UtilitiesManager from "./Utilities";
import useMediaQuery from "@mui/material/useMediaQuery";
import FeesDetails from "./FeesDetails";
import LeaseSummary from "./LeaseSummary";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getDateAdornmentString } from "../../utils/dates";
import CloseIcon from "@mui/icons-material/Close";
import ListsContext from "../../contexts/ListsContext";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiOutlinedInput-input": {
      border: 0,
      borderRadius: 3,
      color: "#3D5CAC",
      fontSize: 50,
    },
  },
}));

export default function RenewLease({ leaseDetails, selectedLeaseId, setIsEndClicked, handleUpdate, onReviewRenewal, setViewRHS }) {
  const navigate = useNavigate();
  const { getList } = useContext(ListsContext);
  const classes = useStyles();
  const [currentLease, setCurrentLease] = useState("");
  const [tenantWithId, setTenantWithId] = useState([]);
  const [utilities, setUtilities] = useState([]);
  const [newUtilities, setNewUtilities] = useState([]);
  const [leaseFees, setLeaseFees] = useState([]);
  const [rent, setRent] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [signedLease, setSignedLease] = useState(null);
  const [remainingUtils, setRemainingUtils] = useState([]);
  const { selectedRole } = useUser();
  // //console.log("---in renewlease page - selected role ", selectedRole)
  //New contract states
  const [newRent, setNewRent] = useState(null);
  const [newFreq, setNewFreq] = useState(null);
  const [newStartDate, setNewStartDate] = useState(null);
  const [newEndDate, setNewEndDate] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [leaseAdults, setLeaseAdults] = useState([]);
  const [leaseChildren, setLeaseChildren] = useState([]);
  const [leasePets, setLeasePets] = useState([]);
  const [leaseVehicles, setLeaseVehicles] = useState([]);
  const color = theme.palette.form.main;
  const [relationships, setRelationships] = useState([]);
  const [states, setStates] = useState([]);
  const [uploadedFiles, setuploadedFiles] = useState([]);
  const [showSpinner, setShowSpinner] = useState(false);

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [modifiedData, setModifiedData] = useState([]);
  const [isPreviousFileChange, setIsPreviousFileChange] = useState(false);

  const [rightPane, setRightPane] = useState({ type: "tenantApplication" });

  // //console.log('RenewLease - leaseDetails - ', leaseDetails);

  useEffect(() => {
    setShowSpinner(true);
    const filtered = leaseDetails.find((lease) => lease.lease_uid === selectedLeaseId);
    setCurrentLease(filtered);
    //console.log("In Renew Lease", leaseDetails, selectedLeaseId);
    // //console.log('filtered - ', filtered);
    const tenantsRow = JSON.parse(filtered.tenants);
    setTenantWithId(tenantsRow);
    // //console.log('----dhyey---- tenantRow', tenantsRow);

    //Set utilities details
    const utils = JSON.parse(filtered.property_utilities);
    if (utils === null) {
      setUtilities([]);
      setNewUtilities([]);
    } else {
      setUtilities(utils);
      setNewUtilities(utils);
    }
    // setUtilities(utils);
    // setNewUtilities(utils);
    // //console.log('utils', utils);

    //Set fees details
    const fees = JSON.parse(filtered.lease_fees);
    setLeaseFees(fees);

    // Get the rent details from the list of fees
    const rentFee = fees?.find((fee) => fee.fee_name === "Rent");
    //console.log("All lease fees", fees);
    //console.log("rent values", rentFee);
    setRent(rentFee);

    const newUtilityIds = utils !== null ? new Set(utils.map((utility) => utility.utility_type_id)) : null;
    // Create a map of items that are present in utilitiesMap but not in newUtilities
    let missingUtilitiesMap = new Map();

    if (newUtilityIds) {
      for (const [key, value] of utilitiesMap) {
        if (!newUtilityIds.has(key)) {
          missingUtilitiesMap.set(key, value);
        }
      }
    } else {
      missingUtilitiesMap = utilitiesMap;
    }

    setRemainingUtils(missingUtilitiesMap);
    //console.log("missing", typeof missingUtilitiesMap, missingUtilitiesMap);

    const parsedDocs = JSON.parse(filtered.lease_documents);
    const docs = parsedDocs.map((doc, index) => ({
      ...doc,
      id: index,
    }));
    //console.log("initial docs", docs);
    setDocuments(docs);

    //lease link
    const leaseDoc = docs.find((doc) => doc.type && doc.type === "Lease Agreement");
    //console.log("leaselink", leaseDoc);
    setSignedLease(leaseDoc);

    // Set all new contract values
    // setMoveoutDate(dayjs(filtered.lease_end));
    setNewStartDate(dayjs(filtered.lease_end).add(1, "day"));
    setNewEndDate(dayjs(filtered.lease_end).add(1, "year"));
    setNewRent(rentFee?.charge);
    setNewFreq(rentFee?.frequency);
    const adults = JSON.parse(filtered.lease_adults);
    const children = JSON.parse(filtered.lease_children);
    const pets = JSON.parse(filtered.lease_pets);
    const vehicles = JSON.parse(filtered.lease_vehicles);
    setLeaseAdults(adults);
    setLeaseChildren(children);
    setLeasePets(pets);
    setLeaseVehicles(vehicles);
    getListDetails();

    setShowSpinner(false);
  }, [leaseDetails, selectedLeaseId]);

  const utilitiesMap = new Map([
    ["050-000001", "electricity"],
    ["050-000002", "water"],
    ["050-000003", "gas"],
    ["050-000004", "trash"],
    ["050-000005", "sewer"],
    ["050-000006", "internet"],
    ["050-000007", "cable"],
    ["050-000008", "hoa dues"],
    ["050-000009", "security system"],
    ["050-000010", "pest control"],
    ["050-000011", "gardener"],
    ["050-000012", "maintenance"],
  ]);

  const formatUtilityName = (utility) => {
    const formattedUtility = utility.replace(/_/g, " ");
    return formattedUtility.charAt(0).toUpperCase() + formattedUtility.slice(1);
  };

  const handleNewUtilityChange = (e, newUtility, utilityIndex) => {
    //console.log("change", utilityIndex, newUtility);
    const { value } = e.target;
    setNewUtilities((prevUtilities) => {
      const updatedUtilities = [...prevUtilities];
      const toChange = { ...updatedUtilities[utilityIndex], utility_payer_id: value === "owner" ? "050-000280" : "050-000282" };
      updatedUtilities[utilityIndex] = toChange;
      //console.log("updated util", updatedUtilities);
      return updatedUtilities;
    });
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  function formatDate(dateString) {
    const date = new Date(dateString);
    //console.log("check date", dateString, date);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    const hrs = String(date.getHours()).padStart(2, "0");
    const mins = String(date.getMinutes()).padStart(2, "0");
    const secs = String(date.getSeconds()).padStart(2, "0");

    if (hrs !== "00" || mins !== "00" || secs !== "00") {
      return `${month}-${day}-${year} ${hrs}:${mins}:${secs}`;
    } else {
      return `${month}-${day}-${year}`;
    }
  }

  const handleRenewLease = () => {
    try {
      setShowSpinner(true);
      //Renew the lease by creating a new lease row in DB with lease status - "PROCESSING" if requested by Manager
      //or "NEW" if requested by tenant
      const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Credentials": "*",
      };
      //console.log("tenantWithId", tenantWithId, typeof tenantWithId);
      const leaseApplicationFormData = new FormData();
      let date = new Date();
      for (let i = 0; i < tenantWithId.length; i++) {
        leaseApplicationFormData.append("lease_property_id", currentLease.property_uid);
        leaseApplicationFormData.append("lease_start", formatDate(newStartDate));
        leaseApplicationFormData.append("lease_end", formatDate(newEndDate));
        leaseApplicationFormData.append("lease_end_notice_period", currentLease.lease_end_notice_period);
        leaseApplicationFormData.append("lease_assigned_contacts", currentLease.lease_assigned_contacts);
        leaseApplicationFormData.append("lease_adults", leaseAdults ? JSON.stringify(leaseAdults) : null);
        leaseApplicationFormData.append("lease_children", leaseChildren ? JSON.stringify(leaseChildren) : null);
        leaseApplicationFormData.append("lease_pets", leasePets ? JSON.stringify(leasePets) : null);
        leaseApplicationFormData.append("lease_vehicles", leaseVehicles ? JSON.stringify(leaseVehicles) : null);
        leaseApplicationFormData.append("lease_application_date", formatDate(date.toLocaleDateString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit',
      })));
        leaseApplicationFormData.append("tenant_uid", tenantWithId[i].tenant_uid);
        leaseApplicationFormData.append("lease_referred", currentLease.lease_referred);
        leaseApplicationFormData.append("lease_move_in_date", currentLease.lease_move_in_date);
        // leaseApplicationFormData.append("property_listed_rent", newRent);
        // leaseApplicationFormData.append("frequency", newFreq);
        const feesJSON = JSON.stringify(leaseFees);
        leaseApplicationFormData.append("lease_fees", feesJSON);

        if (selectedRole === "MANAGER") {
          leaseApplicationFormData.append("lease_status", "PROCESSING");
        } else {
          leaseApplicationFormData.append("lease_status", "NEW");
        }

        if (uploadedFiles.length) {
          //console.log("count", uploadedFiles.length);
          const documentsDetails = [];
          [...uploadedFiles].forEach((file, i) => {
            //console.log("file", file, typeof file);
            leaseApplicationFormData.append(`file_${i}`, file.file, file.name);
            const fileType = file.name.split(".").pop();
            const documentObject = {
              // file: file,
              fileIndex: i,
              fileName: file.name,
              contentType: file.type, //lease or other type
              // type: file.type,
            };
            documentsDetails.push(documentObject);
          });
          leaseApplicationFormData.append("lease_documents", JSON.stringify(documentsDetails));
          //console.log("docs", documentsDetails);
        }

        //console.log("leaseApplicationFormData", leaseApplicationFormData);

        axios
          .post(`${APIConfig.baseURL.dev}/leaseApplication`, leaseApplicationFormData, headers)
          .then((response) => {
            setuploadedFiles([]);
            setShowSpinner(false);
            //console.log("Data updated successfully");
            showSnackbar("Your lease has been renewed successfully.", "success");
          })
          .catch((error) => {
            setShowSpinner(false);
            if (error.response) {
              //console.log(error.response.data);
              showSnackbar("Cannot Renew the lease. Please Try Again", "error");
            }
          });
      }
    } catch (error) {
      //console.log("Cannot Renew the lease", error);
    }
  };

  const editOrUpdateLease = async () => {
    //console.log("inside edit", modifiedData);
    try {
      if (modifiedData.length > 0 || isPreviousFileChange) {
        setShowSpinner(true);
        const headers = {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "*",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Credentials": "*",
        };

        const leaseApplicationFormData = new FormData();

        // const feesJSON = JSON.stringify(leaseFees)
        // leaseApplicationFormData.append("lease_fees", feesJSON);
        // leaseApplicationFormData.append('lease_adults', leaseAdults ? JSON.stringify(adultsRef.current) : null);
        modifiedData?.forEach((item) => {
          //console.log(`Key: ${item.key}`);
          if (item.key === "uploadedFiles") {
            //console.log("uploadedFiles", item.value);
            if (item.value.length) {
              const documentsDetails = [];
              [...item.value].forEach((file, i) => {
                leaseApplicationFormData.append(`file_${i}`, file.file, file.name);
                const fileType = "pdf";
                const documentObject = {
                  // file: file,
                  fileIndex: i,
                  fileName: file.name,
                  contentType: file.contentType,
                  // type: file.type,
                };
                documentsDetails.push(documentObject);
              });
              leaseApplicationFormData.append("lease_documents_details", JSON.stringify(documentsDetails));
            }
          } else {
            leaseApplicationFormData.append(item.key, JSON.stringify(item.value));
          }
        });
        if (isPreviousFileChange) {
          leaseApplicationFormData.append("lease_documents", JSON.stringify(documents));
        }
        leaseApplicationFormData.append("lease_uid", currentLease.lease_uid);

        axios
          .put(`${APIConfig.baseURL.dev}/leaseApplication`, leaseApplicationFormData, headers)
          .then((response) => {
            //console.log("Data updated successfully", response);
            showSnackbar("Your lease has been successfully updated.", "success");
            handleUpdate();
            setShowSpinner(false);
          })
          .catch((error) => {
            setShowSpinner(false);
            showSnackbar("Cannot update the lease. Please try again", "error");
            if (error.response) {
              //console.log(error.response.data);
            }
          });
        setShowSpinner(false);
        setModifiedData([]);
      } else {
        showSnackbar("You haven't made any changes to the form. Please save after changing the data.", "error");
      }
    } catch (error) {
      showSnackbar("Cannot update the lease. Please try again", "error");
      //console.log("Cannot Update the lease", error);
      setShowSpinner(false);
    }
  };

  const showSnackbar = (message, severity) => {
    //console.log("Inside show snackbar");
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleLeaseEarlyTermination = (action) => {
    try {
      setShowSpinner(true);
      const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Credentials": "*",
      };
      const leaseApplicationFormData = new FormData();
      let date = new Date();
      for (let i = 0; i < tenantWithId.length; i++) {
        leaseApplicationFormData.append("lease_uid", currentLease.lease_uid);

        if (action === "ACCEPT_EARLY_TERMINATION") {
          leaseApplicationFormData.append("lease_end", formatDate(currentLease.move_out_date));
          leaseApplicationFormData.append("lease_renew_status", "ENDING");
        }

        if (action === "ALLOW_RE_RENTAL") {
          // leaseApplicationFormData.append("lease_end", formatDate(currentLease.move_out_date));
          leaseApplicationFormData.append("move_out_date", formatDate(currentLease.move_out_date));
          leaseApplicationFormData.append("lease_renew_status", "EARLY MOVE-OUT");
        }

        if (action === "DECLINE") {
          leaseApplicationFormData.append("lease_renew_status", "EARLY TERMINATION REJECTED");
        }

        // //console.log("leaseApplicationFormData", leaseApplicationFormData);

        axios
          .put(`${APIConfig.baseURL.dev}/leaseApplication`, leaseApplicationFormData, headers)
          .then((response) => {
            setShowSpinner(false);
            // //console.log('Data updated successfully');
            showSnackbar("The lease has been ended successfully.", "success");
          })
          .catch((error) => {
            setShowSpinner(false);
            if (error.response) {
              //console.log(error.response.data);
              showSnackbar("Could not end the lease. Please Try Again", "error");
            }
          });
      }
    } catch (error) {
      //console.log("Request Failed. Lease was not updated", error);
    }
  };

  const getListDetails = async () => {
    const relationships = getList("relationships");
    const states = getList("states");
    setRelationships(relationships);
    setStates(states);
  };

  const handleDeleteButtonClick = () => {
    setIsEndClicked(true);
  };

  // use this for renew button
  const handleEditLease = () => {
    if (currentLease.lease_renew_status === "PM RENEW REQUESTED" || currentLease.lease_renew_status === "RENEW REQUESTED") {
      if (onReviewRenewal) {
        const applicationIndex = leaseDetails.findIndex((lease) => lease.lease_uid === selectedLeaseId);
        onReviewRenewal(applicationIndex); // Pass the index to the parent component
        // //console.log("---on renew---", currentLease);
      }
    } else {
      ////console.log("---on renew---", currentLease);
      navigate("/tenantLease", { state: { page: "renew_lease", lease: currentLease, property: currentLease, managerInitiatedRenew: true } });
    }
  };

  const handleBackButton = () => {
    if (isMobile && setViewRHS) {
      setViewRHS(false);
    }
  };

  return (
    <Box
      style={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <Paper
        style={{
          marginTop: !isMobile && "10px",
          marginBottom : isMobile && "10px",
          // marginTop: "10px",
          backgroundColor: theme.palette.primary.main,
          width: "100%", // Occupy full width with 25px margins on each side
        }}
      >
        <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
          <CircularProgress color='inherit' />
        </Backdrop>
        {rightPane.type === "tenantApplication" && (
          <Grid container sx={{ marginTop: "15px", marginBottom: "15px", alignItems: "center", justifyContent: "center" }}>
            <Grid item xs={12} md={12}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: "10px" }}>
                {isMobile && (
                  <Box position={"absolute"} left={0}>
                    <Button onClick={handleBackButton}>
                      <ArrowBackIcon
                        sx={{
                          color: "#160449",
                          fontSize: "25px",
                          margin: "5px",
                        }}
                      />
                    </Button>
                  </Box>
                )}
                <Typography
                  sx={{
                    color: "#160449",
                    fontWeight: theme.typography.primary.fontWeight,
                    fontSize: theme.typography.largeFont,
                    textAlign: "center",
                  }}
                >
                  {currentLease.property_address} {currentLease.property_unit}, <br></br>
                  {currentLease.property_city} {currentLease.property_state}, {currentLease.property_zip}
                </Typography>
                {signedLease && (
                  <Button
                    sx={{
                      padding: "0px",
                      "&:hover": {
                        backgroundColor: theme.palette.form.main,
                      },
                    }}
                    className='.MuiButton-icon'
                    onClick={() => window.open(signedLease.link, "_blank", "rel=noopener noreferrer")}
                  >
                    <img src={LeaseIcon} />
                  </Button>
                )}
              </Box>
              <Box sx={{ display: "block" }}>
                <Typography
                  sx={{
                    color: "#160449",
                    fontWeight: theme.typography.primary.fontWeight,
                    fontSize: theme.typography.largeFont,
                    textAlign: "center",
                  }}
                >
                  {currentLease.lease_property_id}
                </Typography>
              </Box>
              <Box sx={{ display: "block" }}>
                <Typography
                  sx={{
                    color: "#160449",
                    fontWeight: theme.typography.primary.fontWeight,
                    fontSize: theme.typography.largeFont,
                    textAlign: "center",
                  }}
                >
                  {currentLease.lease_uid}
                </Typography>
              </Box>
            </Grid>
            {/* Start */}
            <Grid item xs={12} md={12}>
              {selectedRole === "OWNER" && (
                <LeaseSummary
                  currentLease={currentLease}
                  rent={rent}
                  setNewStartDate={setNewStartDate}
                  setNewEndDate={setNewEndDate}
                  newStartDate={newStartDate}
                  newEndDate={newEndDate}
                  isEditable={false}
                />
              )}
              {selectedRole !== "OWNER" && (
                <LeaseSummary
                  currentLease={currentLease}
                  rent={rent}
                  setNewStartDate={setNewStartDate}
                  setNewEndDate={setNewEndDate}
                  newStartDate={newStartDate}
                  newEndDate={newEndDate}
                  isEditable={true}
                />
              )}
            </Grid>
            {/* End */}

            {tenantWithId && tenantWithId.length > 0 && (
              <Grid item xs={12} md={12}>
                <Paper sx={{ margin: "0px 10px 10px 10px", backgroundColor: color }}>
                  <TenantDetails isMobile={isMobile} tenantWithId={tenantWithId} setTenantWithId={setTenantWithId} />
                </Paper>
              </Grid>
            )}
            <Grid item xs={12} md={12}>
              <Paper sx={{ margin: "0px 10px 10px 10px", backgroundColor: color }}>
                {selectedRole === "OWNER" && (
                  <FeesDetails isMobile={isMobile} isEditable={false} getDateAdornmentString={getDateAdornmentString} leaseFees={leaseFees} setLeaseFees={setLeaseFees} />
                )}
                {selectedRole !== "OWNER"&& (
                  <FeesDetails isMobile={isMobile} isEditable={true} getDateAdornmentString={getDateAdornmentString} leaseFees={leaseFees} setLeaseFees={setLeaseFees} />
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={12}>
              <Paper sx={{ margin: "0px 10px 10px 10px", backgroundColor: color }}>
                <Accordion sx={{ backgroundColor: color }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='occupants-content' id='occupants-header'>
                    <Grid container>
                      <Grid item md={11.2}>
                        <Typography
                          sx={{
                            color: "#160449",
                            fontWeight: theme.typography.primary.fontWeight,
                            fontSize: theme.typography.small,
                            width: "100%",
                            textAlign: isMobile ? "left" : "center",
                            paddingBottom: "10px",
                            paddingTop: "5px",
                            flexGrow: 1,
                            paddingLeft: isMobile ? "5px" : "50px",
                          }}
                          paddingTop='5px'
                          paddingBottom='10px'
                        >
                          Occupants Details
                        </Typography>
                      </Grid>
                      <Grid item md={0.5} />
                    </Grid>
                  </AccordionSummary>
                  <AccordionDetails>
                    {selectedRole === "OWNER" && leaseAdults && (
                      <AdultOccupant
                        isEditable={false}
                        leaseAdults={leaseAdults}
                        relationships={relationships}
                        editOrUpdateLease={editOrUpdateLease}
                        setModifiedData={setModifiedData}
                        modifiedData={modifiedData}
                        dataKey={"lease_adults"}
                      />
                    )}
                    {selectedRole !== "OWNER" && leaseAdults && (
                      <AdultOccupant
                        isEditable={true}
                        leaseAdults={leaseAdults}
                        relationships={relationships}
                        editOrUpdateLease={editOrUpdateLease}
                        setModifiedData={setModifiedData}
                        modifiedData={modifiedData}
                        dataKey={"lease_adults"}
                      />
                    )}
                    {selectedRole === "OWNER" && leaseChildren && (
                      <ChildrenOccupant
                        isEditable={false}
                        leaseChildren={leaseChildren}
                        relationships={relationships}
                        editOrUpdateLease={editOrUpdateLease}
                        setModifiedData={setModifiedData}
                        modifiedData={modifiedData}
                        dataKey={"lease_children"}
                      />
                    )}
                    {selectedRole !== "OWNER" && leaseChildren && (
                      <ChildrenOccupant
                        isEditable={true}
                        leaseChildren={leaseChildren}
                        relationships={relationships}
                        editOrUpdateLease={editOrUpdateLease}
                        setModifiedData={setModifiedData}
                        modifiedData={modifiedData}
                        dataKey={"lease_children"}
                      />
                    )}
                    {selectedRole === "OWNER" && leasePets && (
                      <PetsOccupant
                        isEditable={false}
                        leasePets={leasePets}
                        editOrUpdateLease={editOrUpdateLease}
                        setModifiedData={setModifiedData}
                        modifiedData={modifiedData}
                        dataKey={"lease_pets"}
                      />
                    )}
                    {selectedRole !== "OWNER" && leasePets && (
                      <PetsOccupant
                        isEditable={true}
                        leasePets={leasePets}
                        editOrUpdateLease={editOrUpdateLease}
                        setModifiedData={setModifiedData}
                        modifiedData={modifiedData}
                        dataKey={"lease_pets"}
                      />
                    )}
                    {selectedRole === "OWNER" && leaseVehicles && (
                      <VehiclesOccupant
                        isEditable={false}
                        leaseVehicles={leaseVehicles}
                        states={states}
                        editOrUpdateLease={editOrUpdateLease}
                        setModifiedData={setModifiedData}
                        modifiedData={modifiedData}
                        dataKey={"lease_vehicles"}
                      />
                    )}
                    {selectedRole !== "OWNER" && leaseVehicles && (
                      <VehiclesOccupant
                        isEditable={true}
                        leaseVehicles={leaseVehicles}
                        states={states}
                        editOrUpdateLease={editOrUpdateLease}
                        setModifiedData={setModifiedData}
                        modifiedData={modifiedData}
                        dataKey={"lease_vehicles"}
                      />
                    )}
                  </AccordionDetails>
                </Accordion>
              </Paper>
            </Grid>
            <Grid item xs={12} md={12}>
              <Paper sx={{ margin: "0px 10px 10px 10px", backgroundColor: color }}>
                {selectedRole === "OWNER" && (
                  <Documents
                    setRightPane={setRightPane}
                    isMobile={isMobile}
                    fromRenew={true}
                    isEditable={false}
                    setIsPreviousFileChange={setIsPreviousFileChange}
                    documents={documents}
                    setDocuments={setDocuments}
                    editOrUpdateLease={editOrUpdateLease}
                    setModifiedData={setModifiedData}
                    modifiedData={modifiedData}
                    dataKey={"lease_documents"}
                    isCenter={true}
                  />
                )}
                {selectedRole !== "OWNER" && (
                  <Documents
                    setRightPane={setRightPane}
                    isMobile={isMobile}
                    fromRenew={true}
                    isEditable={true}
                    setIsPreviousFileChange={setIsPreviousFileChange}
                    documents={documents}
                    setDocuments={setDocuments}
                    editOrUpdateLease={editOrUpdateLease}
                    setModifiedData={setModifiedData}
                    modifiedData={modifiedData}
                    dataKey={"lease_documents"}
                    isCenter={true}
                  />
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={12}>
              <Paper sx={{ margin: "0px 10px 10px 10px", backgroundColor: color }}>
                <UtilitiesManager
                  newUtilities={newUtilities}
                  utils={utilities}
                  utilitiesMap={utilitiesMap}
                  handleNewUtilityChange={handleNewUtilityChange}
                  remainingUtils={remainingUtils}
                  setRemainingUtils={setRemainingUtils}
                  setNewUtilities={setNewUtilities}
                />
              </Paper>
            </Grid>

            <Snackbar open={snackbarOpen} onClose={handleSnackbarClose} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
              <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%", height: "100%" }}>
                <AlertTitle>{snackbarSeverity === "error" ? "Error" : "Success"}</AlertTitle>
                {snackbarMessage}
              </Alert>
            </Snackbar>

            {selectedRole !== "OWNER" && currentLease.lease_early_end_date === null && (
              <Grid item xs={12} md={12}>
                <Grid container sx={{ alignItems: "center", justifyContent: "center" }} spacing={2}>
                  <Grid item xs={6} md={6} container sx={{ alignItems: "right", justifyContent: "right" }}>
                    <Button
                      variant='contained'
                      sx={{
                        background: "#ffa500",
                        color: theme.palette.background.default,
                        cursor: "pointer",
                        textTransform: "none",
                        width: "150px",
                        minHeight: "35px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        "&:hover": {
                          background: "#ffc04d",
                        },
                      }}
                      onClick={handleEditLease}
                      size='small'
                    >
                      <Typography
                        sx={{
                          textTransform: "none",
                          color: theme.typography.primary.black,
                          fontWeight: theme.typography.secondary.fontWeight,
                          fontSize: theme.typography.smallFont,
                          whiteSpace: "nowrap",
                          marginLeft: "1%",
                        }}
                      >
                        {currentLease.lease_renew_status === "PM RENEW REQUESTED" || currentLease.lease_renew_status === "RENEW REQUESTED"
                          ? "Review Renewal Application"
                          : "Edit/Renew Lease"}
                      </Typography>
                    </Button>
                  </Grid>

                  <Grid item xs={6} md={6} container sx={{ alignItems: "left", justifyContent: "left" }}>
                    <Button
                      variant='contained'
                      sx={{
                        background: "#D4736D",
                        color: theme.palette.background.default,
                        cursor: "pointer",
                        textTransform: "none",
                        width: "150px",
                        minHeight: "35px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        "&:hover": {
                          background: "#DEA19C",
                        },
                      }}
                      size='small'
                      onClick={handleDeleteButtonClick}
                    >
                      <Typography
                        sx={{
                          textTransform: "none",
                          color: theme.typography.primary.black,
                          fontWeight: theme.typography.secondary.fontWeight,
                          fontSize: theme.typography.smallFont,
                          whiteSpace: "nowrap",
                          marginLeft: "1%",
                        }}
                      >
                        End Lease
                      </Typography>
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            )}

            {selectedRole !== "OWNER" && currentLease.lease_early_end_date != null && (
              <Grid item xs={12} md={12}>
                <Grid container sx={{ alignItems: "center", justifyContent: "center" }} spacing={2}>
                  <Grid item xs={4} md={4} container sx={{ alignItems: "center", justifyContent: "center" }}>
                    <Button
                      variant='contained'
                      sx={{
                        background: "#ffa500",
                        color: theme.palette.background.default,
                        cursor: "pointer",
                        textTransform: "none",
                        minWidth: "150px",
                        minHeight: "35px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        "&:hover": {
                          background: "#ffc04d",
                        },
                      }}
                      onClick={() => handleLeaseEarlyTermination("ACCEPT_EARLY_TERMINATION")}
                      size='small'
                    >
                      <Typography
                        sx={{
                          textTransform: "none",
                          color: theme.typography.primary.black,
                          fontWeight: theme.typography.secondary.fontWeight,
                          fontSize: theme.typography.smallFont,
                          whiteSpace: "nowrap",
                          marginLeft: "1%",
                        }}
                      >
                        Accept Early Termination
                      </Typography>
                    </Button>
                  </Grid>

                  <Grid item xs={4} md={4} container sx={{ alignItems: "center", justifyContent: "center" }}>
                    <Button
                      variant='contained'
                      sx={{
                        background: "#D4736D",
                        color: theme.palette.background.default,
                        cursor: "pointer",
                        textTransform: "none",
                        minWidth: "150px",
                        minHeight: "35px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        "&:hover": {
                          background: "#DEA19C",
                        },
                      }}
                      size='small'
                      onClick={() => handleLeaseEarlyTermination("ALLOW_RE_RENTAL")}
                    >
                      <Typography
                        sx={{
                          textTransform: "none",
                          color: theme.typography.primary.black,
                          fontWeight: theme.typography.secondary.fontWeight,
                          fontSize: theme.typography.smallFont,
                          whiteSpace: "nowrap",
                          marginLeft: "1%",
                        }}
                      >
                        Allow Re-Rental
                      </Typography>
                    </Button>
                  </Grid>

                  <Grid item xs={4} md={4} container sx={{ alignItems: "center", justifyContent: "center" }}>
                    <Button
                      variant='contained'
                      sx={{
                        background: "#D4736D",
                        color: theme.palette.background.default,
                        cursor: "pointer",
                        textTransform: "none",
                        minWidth: "150px",
                        minHeight: "35px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        "&:hover": {
                          background: "#DEA19C",
                        },
                      }}
                      size='small'
                      onClick={() => handleLeaseEarlyTermination("DECLINE")}
                    >
                      <Typography
                        sx={{
                          textTransform: "none",
                          color: theme.typography.primary.black,
                          fontWeight: theme.typography.secondary.fontWeight,
                          fontSize: theme.typography.smallFont,
                          whiteSpace: "nowrap",
                          marginLeft: "1%",
                        }}
                      >
                        Decline
                      </Typography>
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </Grid>
        )}

        {rightPane.type === "filePreview" && (
          <Grid container sx={{ marginTop: "15px", marginBottom: "15px", alignItems: "center", justifyContent: "center" }}>
            <Grid item xs={12} md={12}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: "10px" }}>
                <Typography
                  sx={{
                    color: "#160449",
                    fontWeight: theme.typography.primary.fontWeight,
                    fontSize: theme.typography.largeFont,
                    textAlign: "center",
                  }}
                >
                  {currentLease.property_address} {currentLease.property_unit}, {currentLease.property_city} {currentLease.property_state} {currentLease.property_zip}
                </Typography>
                {signedLease && (
                  <Button
                    sx={{
                      padding: "0px",
                      "&:hover": {
                        backgroundColor: theme.palette.form.main,
                      },
                    }}
                    className='.MuiButton-icon'
                    onClick={() => window.open(signedLease.link, "_blank", "rel=noopener noreferrer")}
                  >
                    <img src={LeaseIcon} />
                  </Button>
                )}
              </Box>
              <Box sx={{ display: "block" }}>
                <Typography
                  sx={{
                    color: "#160449",
                    fontWeight: theme.typography.primary.fontWeight,
                    fontSize: theme.typography.largeFont,
                    textAlign: "center",
                  }}
                >
                  {currentLease.lease_property_id}
                </Typography>
              </Box>
              <Box sx={{ display: "block" }}>
                <Typography
                  sx={{
                    color: "#160449",
                    fontWeight: theme.typography.primary.fontWeight,
                    fontSize: theme.typography.largeFont,
                    textAlign: "center",
                  }}
                >
                  {currentLease.lease_uid}
                </Typography>
              </Box>
            </Grid>

            <DocumentPreview file={rightPane.file} onClose={rightPane.onClose} />
          </Grid>
        )}
      </Paper>
    </Box>
  );
}

function DocumentPreview({ file, onClose }) {
  const previewRef = useRef(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    const preview = previewRef.current;
    if (preview) {
      const shiftX = e.clientX - preview.getBoundingClientRect().left;
      const shiftY = e.clientY - preview.getBoundingClientRect().top;

      setDragOffset({ x: shiftX, y: shiftY });

      const onMouseMove = (e) => {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;

        preview.style.left = `${newX}px`;
        preview.style.top = `${newY}px`;
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "500px",
        backgroundColor: "white",
        boxShadow: 3,
        borderRadius: 2, // Rounded edges for the outer box
        overflow: "hidden", // Ensures rounded corners are applied to content
      }}
      onMouseDown={handleMouseDown}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px",
          backgroundColor: "#f0f0f0",
        }}
      >
        <Typography variant='h6'>{file?.filename || "File Preview"}</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Box
        sx={{
          height: "100%",
          width: "100%",
          overflowY: "auto",
          // padding: "1px",
        }}
      >
        {file ? (
          <iframe
            src={file.link}
            width='100%'
            height='100%'
            title='File Preview'
            style={{
              border: "none",
              borderBottomLeftRadius: 8, // Rounded bottom left corner
              borderBottomRightRadius: 8, // Rounded bottom right corner
            }}
          />
        ) : (
          <Typography>No file selected</Typography>
        )}
      </Box>
    </Box>
  );
}
