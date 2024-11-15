import {
  ThemeProvider,
  Box,
  Paper,
  Stack,
  Typography,
  Grid,
  Divider,
  Button,
  ButtonGroup,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableContainer,
  FormControlLabel,
  Checkbox,
  Radio,
  Menu,
  TableRow,
} from "@mui/material";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState, Fragment, useContext } from "react";
import { useUser } from "../../../contexts/UserContext";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import backButton from "../../Payments/backIcon.png";
import CloseIcon from "@mui/icons-material/Close";
import theme from "../../../theme/theme";
import LeaseIcon from "../../Property/leaseIcon.png";
import APIConfig from "../../../utils/APIConfig";
import Documents from "../Documents";
import AdultOccupant from "../AdultOccupant";
import ChildrenOccupant from "../ChildrenOccupant";
import PetsOccupant from "../PetsOccupant";
import VehiclesOccupant from "../VehiclesOccupant";
import { getDateAdornmentString } from "../../../utils/dates";
import LeaseFees from "../LeaseFees";
import GenericDialog from "../../GenericDialog";
import ListsContext from "../../../contexts/ListsContext";

function TenantLeases(props) {
  // console.log("In Tenant Leases", props);
  const location = useLocation();
  const navigate = useNavigate();
  const { getProfileId } = useUser();
  const { getList } = useContext(ListsContext);
  const [tenantLeases, setTenantLeases] = useState([]);
  const [showSpinner, setShowSpinner] = useState(false);
  const [property, setProperty] = useState(props.property);
  const [status, setStatus] = useState("01-01-2024");
  const [lease, setLease] = useState(props?.lease);
  const [tenantUtilities, setTenantUtilities] = useState([]);
  const [ownerUtilities, setOwnerUtilities] = useState([]);
  // const [pets, setPets] = useState(JSON.parse(lease.lease_pets));
  // const [vehicles, setVehicles] = useState(JSON.parse(lease.lease_vehicles));
  // const [adultOccupants, setAdultOccupants] = useState(JSON.parse(lease.lease_adults));
  // const [childrenOccupants, setChildrenOccupants] = useState(JSON.parse(lease.lease_children));
  const [pets, setPets] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [adultOccupants, setAdultOccupants] = useState([]);
  const [childrenOccupants, setChildrenOccupants] = useState([]);
  const [leaseUtilities, setLeaseUtilities] = useState(null);
  const [fees, setFees] = useState([]);
  const [signedLease, setSignedLease] = useState(null);
  const [prevLeaseId, setPrevLeaseId] = useState(null);
  const [occupantsExpanded, setOccupantsExpanded] = useState(true);
  const [employmentExpanded, setEmploymentExpanded] = useState(true);
  const [utilitiesExpanded, setUtilitiesExpanded] = useState(true);
  const [documentsExpanded, setDocumentsExpanded] = useState(true);
  const [leaseFeesExpanded, setLeaseFeesExpanded] = useState(true); 
  const [mappedUtilitiesPaidBy, setMappedUtilitiesPaidBy] = useState({});
  const [utilitiesRole, setUtilitiesRole] = useState([]);
  const [utilities, setUtilities] = useState([]);
  const [utilitiesMap, setUtilitiesMap] = useState({});
  const [utilitiesRoleMap, setUtilitiesRoleMap] = useState({});
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

  let utilitiesInUIDForm = {};
  let mappedUtilities2 = {};

  const [managerID, setManagerID] = useState("");

  useEffect(() => {
    // console.log("Props passed to TenantLeases: ", props.oldLeaseUid);
    setPrevLeaseId(props.oldLeaseUid);
    setProperty(props.property);
    setLease(props.lease);
  }, [props.property, props.lease]);

  // useEffect(() => {
  //   console.log("62 - lease - ", lease);
  // }, [lease]);

  // useEffect(() => {
  //   console.log("68 - managerID - ", managerID);
  // }, [managerID]);

  const getListDetails = () => {
    const utilitiesRole = getList("role");
    const utilities = getList("utilities");

    setUtilitiesMap(new Map(utilities.map((utility) => [utility.list_uid, utility.list_item])));
    setUtilitiesRoleMap(new Map(utilitiesRole.map((role) => [role.list_uid, role.list_item])));
    console.log(" list here -- ", utilitiesMap, utilitiesRoleMap);
    setUtilities(utilities);
    setUtilitiesRole(utilitiesRole);
  };

  const mapUIDsToUtilities = (propertyUtilities) => {
    if (!propertyUtilities) {
      return {};
    }
    // console.log("----- in mapUIDsToUtilities, input - ", utilitiesMap);
    const mappedUtilities = {};
    for (const key of Object.keys(propertyUtilities)) {
      const utilityName = utilitiesMap.get(key);
      const entityName = utilitiesRoleMap.get(propertyUtilities[key]);

      if (utilityName && entityName) {
        mappedUtilities[utilityName] = entityName;
      }
    }

    // console.log("----- in mapUIDsToUtilities, mappedUtilities - ", mappedUtilities);
    return mappedUtilities;
  };

  useEffect(() => {
    setShowSpinner(true);
    // console.log("property", property);
    // console.log("status", status);
    console.log("lease", lease);
    // console.log("fees", fees);

    async function fetchData() {
      console.log("In fetch data");
      const leaseResponse = await fetch(`${APIConfig.baseURL.dev}/leaseDetails/${getProfileId()}`);

      if (!leaseResponse.ok) {
        // Handle the error as needed (maybe set an error state or log the error)
        console.error("API call failed");
        setShowSpinner(false);
        return;
      }
      const leaseData = await leaseResponse.json();
      console.log("leaseData.Lease_Details.result", leaseData);
      console.log("leaseData.Lease_Details.result", leaseData.Lease_Details.result);

      const properties_with_details = leaseData.Lease_Details.result;
      console.log("properties_with_details", properties_with_details);
      console.log("Lease id: ", lease.lease_uid);
      let detailed_property = properties_with_details.filter((p) => p.lease_uid === lease.lease_uid);
      console.log("Lease: ", lease);
      console.log("detailed_property", detailed_property);

      if (Array.isArray(detailed_property) && detailed_property.length > 0) {
        detailed_property = detailed_property[0];
        console.log("inside if Detailed Property: ", detailed_property);
        setPets(detailed_property.lease_pets ? JSON.parse(detailed_property?.lease_pets) : []);
        setVehicles(detailed_property.lease_vehicles ? JSON.parse(detailed_property?.lease_vehicles) : []);
        setAdultOccupants(detailed_property.lease_adults ? JSON.parse(detailed_property?.lease_adults) : []);
        setChildrenOccupants(detailed_property.lease_children ? JSON.parse(detailed_property?.lease_children) : []);
        setFees(detailed_property?.lease_fees ? JSON.parse(detailed_property.lease_fees) : []);
        setStatus(detailed_property?.lease_effective_date ?? null);
        setLeaseUtilities(JSON.parse(lease?.lease_utilities));

        if (detailed_property?.property_utilities) {
          // Parse the utilities JSON
          const utilities = JSON.parse(detailed_property.property_utilities);

          // Separate utilities by payer
          const tenantUtilities = utilities.filter((utility) => utility.utility_payer_id === "050-000282").map((utility) => utility.utility_desc);

          const ownerUtilities = utilities.filter((utility) => utility.utility_payer_id === "050-000280").map((utility) => utility.utility_desc);

          // Update state
          setTenantUtilities(tenantUtilities);
          setOwnerUtilities(ownerUtilities);
        }
        //lease link
        const parsedDocs = JSON.parse(detailed_property.lease_documents);
        const leaseDoc = parsedDocs.find((doc) => doc.type && doc.type === "Lease Agreement");
        console.log("leaselink", leaseDoc);
        setSignedLease(leaseDoc);
        setManagerID(detailed_property.contract_business_id);
      }
    }

    getListDetails();
    fetchData();

    setShowSpinner(false);
  }, []);

  useEffect(() => {
    console.log("UTILITIES - ", leaseUtilities);
    if (leaseUtilities && leaseUtilities?.length > 0) {
      console.log("484 - utilitiesObject - ");
      for (const utility of leaseUtilities) {
        // console.log(utility.utility_type_id, utility.utility_payer_id);
        utilitiesInUIDForm[utility.utility_type_id] = utility.utility_payer_id;
      }
      // console.log("UTILTIES IN UID FORM", utilitiesInUIDForm);

      mappedUtilities2 = mapUIDsToUtilities(utilitiesInUIDForm);
      console.log("----- Mapped UIDs to Utilities, mappedUtilities2", mappedUtilities2);
      // console.log("   ", mappedUtilities2);
      setMappedUtilitiesPaidBy(mappedUtilities2);
    }
  }, [leaseUtilities]);

  const CenteringBox = ({ children, flexDirection = "column", justifyContent = "flex-start" }) => (
    <Box
      sx={{
        display: "flex",
        justifyContent: justifyContent,
        alignItems: "center",
        flexDirection: flexDirection,
        height: "100%",
      }}
    >
      {children}
    </Box>
  );

  function getDayText(day) {
    switch (day % 10) {
      case 1:
        return day + "st";
      case 2:
        return day + "nd";
      case 3:
        return day + "rd";
      default:
        return day + "th";
    }
  }

  function displayPropertyAddress() {
    console.log("leases", lease);
    if (lease.property_unit) {
      return (
        <>
          {lease.property_address} #{lease.property_unit} {lease.property_city}, {lease.property_state} {lease.property_zipcode}
        </>
      );
    } else {
      return (
        <>
          {lease.property_address} {lease.property_city} {lease.property_state} {lease.property_zipcode}
        </>
      );
    }
  }

  async function handleTenantRefuse() {
    const leaseApplicationFormData = new FormData();

    leaseApplicationFormData.append("lease_uid", lease.lease_uid);
    leaseApplicationFormData.append("lease_status", "REFUSED");

    const sendAnnouncement = async () => {
      try {
        const receiverPropertyMapping = {
          [managerID]: [property.property_uid],
        };

        await fetch(`${APIConfig.baseURL.dev}/announcements/${getProfileId()}`, {
          // await fetch(`http://localhost:4000/announcements/${getProfileId()}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            announcement_title: "Lease Rejected by Tenant",
            announcement_msg: `Lease for ${property.property_address}, Unit -${property.property_unit} has been rejected by the Tenant.`,
            announcement_sender: getProfileId(),
            announcement_date: new Date().toDateString(),
            // announcement_properties: property.property_uid,
            announcement_properties: JSON.stringify(receiverPropertyMapping),
            announcement_mode: "LEASE",
            announcement_receiver: [managerID],
            announcement_type: ["Email", "Text"],
          }),
        });
      } catch (error) {
        console.log("Error in Tenant refuse announcements:", error);
        // alert("We were unable to Text the Property Manager but we were able to send them a notification through the App");
        openDialog("Error",`We were unable to Text the Property Manager but we were able to send them a notification through the App`,"error");
      }
    };

    try {
      const response = await fetch(`${APIConfig.baseURL.dev}/leaseApplication`, {
        method: "PUT",
        body: leaseApplicationFormData,
      });
      const data = await response.json();
      if (data.lease_update.code === 200) {
        // alert("You have successfully Rejected the lease.");
        openDialog("Success",`You have successfully Rejected the lease`,"success");
        await sendAnnouncement();
        props.setRightPane({ type: "", state: { property: property, lease: lease } });
        props.setReload((prev) => !prev);
      } else {
        console.log(data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function handleTenantAccept() {
    console.log("Data we have1: ", lease);
    console.log("Data we have2: ", property);
    console.log("Data we have3: ", status);
    console.log("Data we have4: ", pets);
    // console.log("Lease Application Data1: ", leaseApplicationFormData);
    // console.log("In handle Accept: ", detailed_property?.lease_effective_date);
    const leaseApplicationFormData = new FormData();
    leaseApplicationFormData.append("lease_uid", lease.lease_uid);
    console.log("Lease Application Data2: ", leaseApplicationFormData);

    console.log("221 - property: ", property);
    console.log("221 - lease: ", lease);

    const sendAnnouncement = async () => {
      try {
        console.log("Announcements ID: ", property);
        console.log("Announcements ID: ", property.contract_business_id);
        const receiverPropertyMapping = {
          [managerID]: [property.property_uid],
        };

        await fetch(`${APIConfig.baseURL.dev}/announcements/${getProfileId()}`, {
          // await fetch(`http://localhost:4000/announcements/${getProfileId()}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            announcement_title: "Lease Accepted by Tenant",
            announcement_msg: `Lease for ${property.property_address}, Unit -${property.property_unit} has been accepted by the Tenant.`,
            announcement_sender: getProfileId(),
            announcement_date: new Date().toDateString(),
            // announcement_properties: property.property_uid,
            announcement_properties: JSON.stringify(receiverPropertyMapping),
            announcement_mode: "LEASE",
            announcement_receiver: [managerID],
            announcement_type: ["Email", "Text"],
          }),
        });
      } catch (error) {
        console.log("Error in Tenant accept announcements:", error);
        // alert("We were unable to Text the Property Manager but we were able to send them a notification through the App");
        openDialog("Error",`We were unable to Text the Property Manager but we were able to send them a notification through the App`,"error");
      }
    };

    const sendRenewalStatus = async () => {
      const renewalFormData = new FormData();
      renewalFormData.append("lease_uid", prevLeaseId);
      renewalFormData.append("lease_renew_status", "RENEWED");

      try {
        const response = await fetch(`${APIConfig.baseURL.dev}/leaseApplication`, {
          method: "PUT",
          body: renewalFormData,
        });
        const data = await response.json();
        // console.log("Renewal status updated:", data);
        if (data?.code === 200) {
          console.log("Lease renewal successfully updated.");
        } else {
          console.log("Failed to update lease renewal status:", data);
        }
      } catch (error) {
        console.log("Error updating lease renewal status:", error);
      }
    };

    try {
      var lease_status = "APPROVED"; // Abhinav - Tenant Approved
      // var status = "TENANT APPROVED";
      const date = new Date();
      // console.log("Date: ", date);
      // console.log("Lease Effective Date, ", status);
      if (status) {
        const [month, day, year] = status.split("-").map(Number);
        const leaseDate = new Date(year, month - 1, day); // Month is 0-indexed in JavaScript Date objects
        // console.log("Lease Effective Date, ", leaseDate);

        if (leaseDate <= date) {
          lease_status = "ACTIVE";
          console.log("Lease Status Changed: ", lease_status);
          // if (lease.lease_effective_date <= date) {
          // status = "ACTIVE";
        }
      }
      console.log("Status: ", status);
      leaseApplicationFormData.append("lease_status", lease_status);
      const response = await fetch(`${APIConfig.baseURL.dev}/leaseApplication`, {
        method: "PUT",
        body: leaseApplicationFormData,
      });
      const data = await response.json();
      console.log("Divyy", data);
      if (data.lease_docs.code === 200) {
        // alert("You have successfully Accepted the lease.");
        openDialog("Success",`You have successfully Accepted the lease.`,"success");
        //don';t send announcemnt twice
        await sendRenewalStatus();
        await sendAnnouncement();
        props.setRightPane({ type: "" });
        props.setReload((prev) => !prev);
      } else {
        console.log(data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const biweeklyDueByValuetoDayMap = {
    0: "Monday - week 1",
    1: "Tuesday - week 1",
    2: "Wednesday - week 1",
    3: "Thursday - week 1",
    4: "Friday - week 1",
    5: "Saturday - week 1",
    6: "Sunday - week 1",
    7: "Monday - week 2",
    8: "Tuesday - week 2",
    9: "Wednesday - week 2",
    10: "Thursday - week 2",
    11: "Friday - week 2",
    12: "Saturday - week 2",
    13: "Sunday - week 2",
  };

  const weeklyDueByValuetoDayMap = {
    0: "Monday",
    1: "Tuesday",
    2: "Wednesday",
    3: "Thursday",
    4: "Friday",
    5: "Saturday",
    6: "Sunday",
  };

  const getFeesDueBy = (fee) => {
    if (fee.frequency === "Bi-Weekly") {
      return biweeklyDueByValuetoDayMap[fee.due_by];
    } else if (fee.frequency === "Weekly") {
      return weeklyDueByValuetoDayMap[fee.due_by];
    } else if (fee.frequency === "Monthly") {
      return `${fee.due_by}${getDateAdornmentString(fee.due_by)} of the month`;
    } else if (fee.frequency === "One Time" || fee.frequency === "Annually") {
      return `${fee.due_by_date ?? "No Due Date"}`;
    } else {
      return "-";
    }
  };

  const getFeesLateBy = (fee) => {
    if (fee.frequency === "Bi-Weekly" || fee.frequency === "Weekly" || fee.frequency === "Monthly" || fee.frequency === "Annually" || fee.frequency === "One Time") {
      return `${fee.late_by}${getDateAdornmentString(fee.late_by)} day after due`;
    } else {
      return "-";
    }
  };

  const formatUtilityName = (utility) => {
    const formattedUtility = utility.replace(/_/g, " ");
    return formattedUtility.charAt(0).toUpperCase() + formattedUtility.slice(1);
  };

  return (
    <Paper sx={{ marginTop: "7px", backgroundColor: theme.palette.primary.main, borderRadius: "5px", boxShadow: "0px 2px 4px #00000040" }}>
      <Box
        sx={{
          fontFamily: "Source Sans Pro",
          padding: "20px",
        }}
      >
        <Grid container>
          <Grid item xs={11}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                color: "#160449",
              }}
            >
              <Typography
                sx={{
                  justifySelf: "center",
                  color: theme.typography.primary.black,
                  fontWeight: theme.typography.medium.fontWeight,
                  fontSize: "25px",
                }}
              >
                Lease
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={1}>
            <Button
              onClick={() => {
                if (props.from && props.from === "accwidget") {
                  props.setRightPane("");
                } else {
                  props.setRightPane({ type: "listings" });
                }
              }}
              sx={{
                textTransform: "none",
                textDecoration: "underline",
              }}
            >
              <CloseIcon sx={{ color: theme.typography.common.blue, fontSize: "30px" }} />
            </Button>
          </Grid>
          <Grid item xs={12}>
            <CenteringBox>
              <Typography sx={{ color: theme.typography.common.black, fontWeight: theme.typography.light.fontWeight, fontSize: theme.typography.mediumFont.fontSize }}>
                {displayPropertyAddress()}
              </Typography>
            </CenteringBox>
          </Grid>
        </Grid>
        <Paper
          elevation={0}
          style={{
            // margin: "30px",
            backgroundColor: theme.palette.primary.main,
            padding: "10px",
          }}
        >
          <Box sx={{ padding: "10px" }}>
            <Accordion
              defaultExpanded
              sx={{
                marginBottom: "20px",
                backgroundColor: "#f0f0f0",
                borderRadius: "8px",
                margin: "auto",
                minHeight: "50px",
                // boxShadow: "none"
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography
                  sx={{
                    // fontWeight: theme.typography.primary.fontWeight,
                    // fontSize: "20px",
                    // textAlign: "center",
                    // paddingBottom: "10px",
                    // paddingTop: "5px",
                    // flexGrow: 1,
                    // // paddingLeft: "50px",
                    // color: "#160449",
                    fontWeight: theme.typography.medium.fontWeight,
                    color: theme.typography.primary.blue,
                  }}
                >
                  Viewing Current Lease
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ padding: "30px" }}>
                {" "}
                {/* Increased padding */}
                <Grid container spacing={3}>
                  {" "}
                  {/* Increased spacing */}
                  <Grid item xs={6}>
                    <Typography sx={{ fontWeight: "bold", color: "#160449" }}>Start Date</Typography>
                    <Typography>{lease?.lease_start || "N/A"}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography sx={{ fontWeight: "bold", color: "#160449" }}>Rent Amount</Typography>
                    <Typography>${lease?.property_listed_rent.toFixed(2) || "$0.00"}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography sx={{ fontWeight: "bold", color: "#160449" }}>End Date</Typography>
                    <Typography>{lease?.lease_end || "N/A"}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography sx={{ fontWeight: "bold", color: "#160449" }}>Frequency</Typography>
                    <Typography>{lease?.frequency || "Monthly"}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography sx={{ fontWeight: "bold", color: "#160449" }}>Move-In Date</Typography>
                    <Typography>{lease?.lease_move_in_date || "N/A"}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography sx={{ fontWeight: "bold", color: "#160449" }}>Due Date</Typography>
                    <Typography>{lease?.due_date || "1st of month"}</Typography>
                  </Grid>
                  {/* <Grid item xs={6}>
                        <Typography sx={{ fontWeight: "bold", color: "#160449" }}>
                          Utilities Paid By Tenant
                        </Typography>
                        <Typography>
                          {JSON.parse(lease.lease_utilities).length > 0
                              ? JSON.parse(lease.lease_utilities)
                                  .map((utility) => utility.utility_desc)
                                  .join(", ")
                              : "None"}
                        </Typography>
                      </Grid> */}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>

          {/* utiltiies */}
          <Grid container justifyContent='center' sx={{ backgroundColor: "#f0f0f0", borderRadius: "10px", padding: "10px", marginBottom: "10px" }}>
            <Grid item xs={12}>
              <Accordion
                sx={{
                  marginBottom: "20px",
                  backgroundColor: "#f0f0f0",
                  borderRadius: "8px",
                  margin: "auto", // Center the accordion
                  minHeight: "50px",
                }}
                expanded={utilitiesExpanded}
                onChange={() => setUtilitiesExpanded((prev) => !prev)}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='employment-content' id='employment-header'>
                  <Grid container>
                    <Grid item md={11.2}>
                      <Typography
                        sx={{
                          fontWeight: theme.typography.medium.fontWeight,
                          color: theme.typography.primary.blue,
                          // color: "#160449",
                          // fontWeight: theme.typography.primary.fontWeight,
                          // fontSize: "20px",
                          // textAlign: "center",
                          // paddingBottom: "10px",
                          // paddingTop: "5px",
                          // flexGrow: 1,
                          // paddingLeft: "50px"
                        }}
                      >
                        Lease Utilities
                      </Typography>
                    </Grid>
                  </Grid>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container columnSpacing={2} rowSpacing={3} sx={{ padding: "10px" }}>
                    {Object.entries(mappedUtilitiesPaidBy).length > 0 ? (
                      Object.entries(mappedUtilitiesPaidBy).map(([utility, selectedValue]) => (
                        <Fragment key={utility}>
                          <Grid item xs={6}>
                            <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.mediumFont }}>
                              {formatUtilityName(utility)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <FormControlLabel
                              value='owner'
                              control={
                                <Radio
                                  checked={selectedValue === "owner"}
                                  disabled
                                  sx={{
                                    // color: '#160449', // Changes the color of the disabled radio button
                                    "&.Mui-checked": {
                                      color: "#160449 !important", // Changes the color when checked and disabled
                                    },
                                    "&.Mui-disabled": {
                                      color: "#160449 !important", // Changes the color when disabled
                                    },
                                  }}
                                />
                              }
                              label='Owner'
                              sx={{
                                "& .MuiTypography-root": {
                                  color: "#160449 !important", // Ensures label stays black even when disabled
                                },
                              }}
                            />
                            <FormControlLabel
                              value='tenant'
                              control={
                                <Radio
                                  checked={selectedValue === "tenant"}
                                  disabled
                                  sx={{
                                    // color: '#160449', // Changes the color of the disabled radio button
                                    "&.Mui-checked": {
                                      color: "#160449 !important", // Changes the color when checked and disabled
                                    },
                                    "&.Mui-disabled": {
                                      color: "#160449 !important", // Changes the color when disabled
                                    },
                                  }}
                                />
                              }
                              label='Tenant'
                              sx={{
                                "& .MuiTypography-root": {
                                  color: "black !important", // Ensures label stays black even when disabled
                                },
                              }}
                            />
                          </Grid>
                        </Fragment>
                      ))
                    ) : (
                      <Typography variant='body2' sx={{ textAlign: "center", width: "100%" }}>
                        No Utilities data available.
                      </Typography>
                    )}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>

          <Grid container justifyContent='center' sx={{ backgroundColor: "#f0f0f0", borderRadius: "10px", padding: "10px", marginBottom: "10px" }}>
            <Grid item xs={12}>
              <Accordion
                sx={{
                  marginBottom: "20px",
                  backgroundColor: "#f0f0f0",
                  borderRadius: "8px",
                  margin: "auto", // Center the accordion
                  minHeight: "50px",
                }}
                expanded={employmentExpanded}
                onChange={() => setEmploymentExpanded((prev) => !prev)}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='employment-content' id='employment-header'>
                  <Grid container>
                    <Grid item md={11.2}>
                      <Typography
                        sx={{
                          fontWeight: theme.typography.medium.fontWeight,
                          color: theme.typography.primary.blue,
                          // color: "#160449",
                          // fontWeight: theme.typography.primary.fontWeight,
                          // fontSize: "20px",
                          // textAlign: "center",
                          // paddingBottom: "10px",
                          // paddingTop: "5px",
                          // flexGrow: 1,
                          // paddingLeft: "50px"
                        }}
                      >
                        Applicant Job Details
                      </Typography>
                    </Grid>
                  </Grid>
                </AccordionSummary>
                <AccordionDetails>
                  <EmploymentDataGrid employmentDataT={lease?.lease_income ? JSON.parse(lease?.lease_income) : []} />
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
          {/* )} */}

          {/* occupancy details*/}
          <Grid container justifyContent='center' sx={{ backgroundColor: "#f0f0f0", borderRadius: "10px", padding: "10px", marginBottom: "10px" }}>
            <Grid item xs={12}>
              <Accordion
                sx={{
                  marginBottom: "20px",
                  backgroundColor: "#f0f0f0",
                  borderRadius: "8px",
                  margin: "auto", // Center the accordion
                  minHeight: "50px",
                }}
                expanded={occupantsExpanded}
                onChange={() => setOccupantsExpanded((prevState) => !prevState)}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='occupants-content' id='occupants-header'>
                  <Grid container>
                    <Grid item md={11.2}>
                      <Typography
                        sx={{
                          fontWeight: theme.typography.medium.fontWeight,
                          color: theme.typography.primary.blue,
                          // color: "#160449",
                          // fontWeight: theme.typography.primary.fontWeight,
                          // fontSize: "20px",
                          // textAlign: "center",
                          // paddingBottom: "10px",
                          // paddingTop: "5px",
                          // flexGrow: 1,
                          // paddingLeft: "50px",
                        }}
                        paddingBottom='10px'
                      >
                        Occupancy Details
                      </Typography>
                    </Grid>
                    <Grid item md={0.5} />
                  </Grid>
                </AccordionSummary>
                <AccordionDetails>
                  {adultOccupants && (
                    <Box sx={{ marginBottom: "20px" }}>
                      <AdultOccupant
                        leaseAdults={adultOccupants}
                        // relationships={relationships}
                        // editOrUpdateLease={lease_uid !== null ? editOrUpdateLease : editOrUpdateTenant}
                        // editOrUpdateLease={editOrUpdateLease}
                        // modifiedData={modifiedData}
                        // setModifiedData={setModifiedData}
                        // dataKey={lease_uid !== null ? "lease_adults" : "tenant_adult_occupants"}
                        dataKey={"lease_adults"}
                        isEditable={false}
                      />
                    </Box>
                  )}
                  {childrenOccupants && (
                    <Box sx={{ marginBottom: "20px" }}>
                      <ChildrenOccupant
                        leaseChildren={childrenOccupants}
                        // relationships={relationships}
                        // editOrUpdateLease={lease_uid !== null ? editOrUpdateLease : editOrUpdateTenant}
                        // editOrUpdateLease={editOrUpdateLease}
                        // modifiedData={modifiedData}
                        // setModifiedData={setModifiedData}
                        // dataKey={lease_uid !== null ? "lease_children" : "tenant_children_occupants"}
                        dataKey={"lease_children"}
                        isEditable={false}
                      />
                    </Box>
                  )}
                  {pets && (
                    <Box sx={{ marginBottom: "20px" }}>
                      <PetsOccupant
                        leasePets={pets}
                        // editOrUpdateLease={lease_uid !== null ? editOrUpdateLease : editOrUpdateTenant}
                        // editOrUpdateLease={editOrUpdateLease}
                        // modifiedData={modifiedData}
                        // setModifiedData={setModifiedData}
                        // dataKey={lease_uid !== null ? "lease_pets" : "tenant_pet_occupants"}
                        dataKey={"lease_pets"}
                        isEditable={false}
                      />
                    </Box>
                  )}
                  {vehicles && (
                    <Box sx={{ marginBottom: "20px" }}>
                      <VehiclesOccupant
                        leaseVehicles={vehicles}
                        // setLeaseVehicles={setVehicles}
                        // states={states}
                        // editOrUpdateLease={lease_uid !== null ? editOrUpdateLease : editOrUpdateTenant}
                        // editOrUpdateLease={editOrUpdateLease}
                        // modifiedData={modifiedData}
                        // setModifiedData={setModifiedData}
                        // dataKey={lease_uid !== null ? "lease_vehicles" : "tenant_vehicle_info"}
                        dataKey={"lease_vehicles"}
                        // ownerOptions={[...adultOccupants, ...childOccupants]}
                        isEditable={false}
                      />
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>

          {/* lease fees */}
          <Grid container justifyContent='center' sx={{ backgroundColor: "#f0f0f0", borderRadius: "10px", padding: "10px", marginBottom: "10px" }}>
            <Grid item xs={12}>
              <Accordion
                sx={{
                  marginBottom: "20px",
                  backgroundColor: "#f0f0f0",
                  borderRadius: "8px",
                  margin: "auto", // Center the accordion
                  minHeight: "50px",
                }}
                expanded={leaseFeesExpanded}
                onChange={() => setLeaseFeesExpanded((prev) => !prev)}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='employment-content' id='employment-header'>
                  <Grid container>
                    <Grid item md={11.2}>
                      <Typography
                        sx={{
                          fontWeight: theme.typography.medium.fontWeight,
                          color: theme.typography.primary.blue,
                          // color: "#160449",
                          // fontWeight: theme.typography.primary.fontWeight,
                          // fontSize: "20px",
                          // textAlign: "center",
                          // paddingBottom: "10px",
                          // paddingTop: "5px",
                          // flexGrow: 1,
                          // paddingLeft: "50px"
                        }}
                      >
                        Lease Fees
                      </Typography>
                    </Grid>
                  </Grid>
                </AccordionSummary>
                <AccordionDetails>
                  <LeaseFees leaseFees={fees} />
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>

          {/* documents details */}
          <Grid container direction='column' justifyContent='center' spacing={2} sx={{ backgroundColor: "#f0f0f0", borderRadius: "10px", padding: "10px", marginBottom: "10px" }}>
            <Grid item xs={12}>
              <Accordion
                sx={{
                  marginBottom: "20px",
                  backgroundColor: "#f0f0f0",
                  borderRadius: "8px",
                  margin: "auto", // Center the accordion
                  minHeight: "50px",
                }}
                expanded={documentsExpanded}
                onChange={() => setDocumentsExpanded((prev) => !prev)}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='documents-content' id='documents-header'>
                  <Typography
                    sx={{
                      fontWeight: theme.typography.medium.fontWeight,
                      color: theme.typography.primary.blue,
                      // color: "#160449",
                      // fontWeight: theme.typography.primary.fontWeight,
                      // fontSize: "20px",
                      // textAlign: "center",
                      // paddingBottom: "10px",
                      // paddingTop: "5px",
                      // flexGrow: 1,
                    }}
                  >
                    Document Details
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Documents
                    documents={JSON.parse(lease.lease_documents)}
                    // setDocuments={setTenantDocuments}
                    customName={"Lease Documents"}
                    // setContractFiles={setExtraUploadDocument}
                    // setDeleteDocsUrl={setDeleteDocuments}
                    isAccord={false}
                    isEditable={false}
                    // plusIconColor={ theme.typography.primary.black}
                    // plusIconSize= {"18px"}
                    // contractFiles={extraUploadDocument}
                    // contractFileTypes={extraUploadDocumentType}
                    // setContractFileTypes={setExtraUploadDocumentType}
                    // setIsPreviousFileChange={setIsPreviousFileChange}
                  />
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>

          {/* Accept and reject lease button */}
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <CenteringBox>
                <Button
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#CB8E8E",
                    borderRadius: "5px",
                    padding: "5px 10px",
                    minWidth: "90px",
                    width: "150px",
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#FFFFFF",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "#A75A5A",
                    },
                  }}
                  onClick={() => handleTenantRefuse()}
                >
                  Reject Lease
                </Button>
              </CenteringBox>
            </Grid>
            <Grid item xs={6}>
              <CenteringBox>
                <Button
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#9EAED6",
                    borderRadius: "5px",
                    padding: "5px 10px",
                    minWidth: "90px",
                    width: "150px",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#FFFFFF",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "#6A8AB3",
                    },
                  }}
                  onClick={() => handleTenantAccept()}
                >
                  Accept Lease
                </Button>
              </CenteringBox>
            </Grid>
          </Grid>

          {/* <Grid
            container
            rowSpacing={2}
            sx={{
              // paddingLeft: "20px",
              // paddingRight: "20px",
            }}
          > */}
          {/* <Grid item xs={12}>
              <CenteringBox>
                <Typography sx={{ color: theme.typography.common.black, fontWeight: theme.typography.common.fontWeight, fontSize: theme.typography.largeFont }}>
                  Viewing Current Lease
                </Typography>
              </CenteringBox>
            </Grid> */}

          {/* Lease Details Grid */}
          {/* <Grid container spacing={2} mt={2}> */}
          {/* <Grid item xs={6}>
              <Typography sx={{ fontWeight: "bold", color: "#160449" }}>Start Date</Typography>
              <Typography>{lease?.lease_start || "N/A"}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography sx={{ fontWeight: "bold", color: "#160449" }}>Rent Amount</Typography>
              <Typography>${lease?.property_listed_rent.toFixed(2) || "$0.00"}</Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography sx={{ fontWeight: "bold", color: "#160449" }}>End Date</Typography>
              <Typography>{lease?.lease_end || "N/A"}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography sx={{ fontWeight: "bold", color: "#160449" }}>Frequency</Typography>
              <Typography>{lease?.frequency || "Monthly"}</Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography sx={{ fontWeight: "bold", color: "#160449" }}>Move-In Date</Typography>
              <Typography>{lease?.lease_move_in_date || "N/A"}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography sx={{ fontWeight: "bold", color: "#160449" }}>Due Date</Typography>
              <Typography>{lease?.due_date || "1st of month"}</Typography>
            </Grid> */}

          {/* <Grid item xs={6}>
              <Typography sx={{ fontWeight: "bold", color: "#160449" }}>Move-Out Date</Typography>
              <Typography>{lease?.move_out_date || "N/A"}</Typography>
            </Grid> */}

          {/* <Grid item xs={6}>
            <Typography sx={{ fontWeight: "bold", color: "#160449" }}>
              Utilities Paid By Tenant
            </Typography>
            <Typography>
              {tenantUtilities.length > 0
                ? tenantUtilities.join(", ")
                : "None"}
            </Typography>
            </Grid> */}
          {/* <Grid item xs={6}>
              <Typography sx={{ fontWeight: "bold", color: "#160449" }}>Late Fee</Typography>
              <Typography>{lease?.lease_fees || "%95"}</Typography>
            </Grid> */}
          {/* <Grid item xs={6}>
              <Typography sx={{ fontWeight: "bold", color: "#160449" }}>Lease Status</Typography>
              <Typography>{lease?.lease_status}</Typography>
            </Grid> */}

          {/* <Grid item xs={6}>
            <Typography sx={{ fontWeight: "bold", color: "#160449" }}>
              Utilities Paid By Owner
            </Typography>
            <Typography>
              {ownerUtilities.length > 0
                ? ownerUtilities.join(", ")
                : "None"}
            </Typography>
            </Grid> */}
          {/* <Grid item xs={6}>
              <Typography sx={{ fontWeight: "bold", color: "#160449" }}>Late Fee Per Day</Typography>
              <Typography>{lease?.late_fee_per_day || "$0"}</Typography>
            </Grid> */}
          {/* </Grid> */}

          {/* <Grid item xs={12}>
              <LeaseFees leaseFees={fees} />
            </Grid> */}

          {/* <Grid item xs={6}>
              <CenteringBox justifyContent="flex-start">
                {signedLease &&
                  <Box>
                    <Button
                      sx={{
                        padding: "0px",
                        '&:hover': {
                          backgroundColor: theme.palette.form.main,
                        },
                      }}
                      className=".MuiButton-icon"
                      onClick={() =>
                        window.open(signedLease.link, "_blank", "rel=noopener noreferrer")
                      }
                    > <img src={LeaseIcon} />


                    </Button>
                    <Typography
                      sx={{
                        color: theme.typography.common.blue,
                        fontWeight: theme.typography.common.fontWeight,
                        fontSize: '14px',
                        display: 'inline-flex', // Ensure inline-flex to keep elements on the same line
                        alignItems: 'center',  // Vertically align items
                        textTransform: 'none'
                      }}
                    >

                      View Lease
                    </Typography>
                  </Box>}
              </CenteringBox>
            </Grid> */}
          {/* </Grid> */}

          {/* <Grid container spacing={1}>            
          <Typography sx={{ fontWeight: "bold", color: "#160449", padding:"5px" }}>Occupants:</Typography>
            <Grid item xs={12}>
              <Typography>Adults</Typography>
              <AdultDataGrid adults={adultOccupants} />
            </Grid>
            <Grid item xs={12}>
              <Typography>Children</Typography>
              <ChildDataGrid children={childrenOccupants} />
            </Grid>
            <Grid item xs={12}>
              <Typography>Pets</Typography>
              <PetDataGrid pets={pets} />
            </Grid>
            <Grid item xs={12} sx={{paddingBottom: "20px"}}>
              <Typography>Vehicles</Typography>
              <VehicleDataGrid vehicles={vehicles} />
            </Grid>
          </Grid> */}

          {/* <Grid container spacing={2}>
            <Grid item xs={6}>
              <CenteringBox>
                <Button
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#CB8E8E",
                    borderRadius: "5px",
                    padding: "5px 10px",
                    minWidth: "90px",
                    width: "150px",
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#FFFFFF",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "#A75A5A",
                    },
                  }}
                  onClick={() => handleTenantRefuse()}
                >
                  Reject Lease
                </Button>
              </CenteringBox>
            </Grid>
            <Grid item xs={6}>
              <CenteringBox>
                <Button
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#9EAED6",
                    borderRadius: "5px",
                    padding: "5px 10px",
                    minWidth: "90px",
                    width: "150px",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#FFFFFF",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "#6A8AB3",
                    },
                  }}
                  onClick={() => handleTenantAccept()}
                >
                  Accept Lease
                </Button>
              </CenteringBox>
            </Grid>
          </Grid> */}
        </Paper>
      </Box>

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
    </Paper>
  );
}

export const AdultDataGrid = ({ adults }) => {
  const columns = [
    {
      field: "name",
      headerName: "Name",
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
      flex: 2,
      renderCell: (params) => (
        <Typography>
          {params.row.name} {params.row.last_name}
        </Typography>
      ),
    },
    { field: "relationship", headerName: "Relationship", renderHeader: (params) => <strong>{params.colDef.headerName}</strong>, flex: 1 },
    { field: "dob", headerName: "DoB", renderHeader: (params) => <strong>{params.colDef.headerName}</strong>, flex: 1 },
  ];

  let rowsWithId = [];

  if (adults && adults?.length !== 0) {
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
        marginTop: "5px",
      }}
      autoHeight
      rowHeight={50}
      hideFooter={true}
    />
  );
};

export const ChildDataGrid = ({ children }) => {
  const columns = [
    {
      field: "name",
      headerName: "Name",
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
      flex: 2,
      renderCell: (params) => (
        <Typography>
          {params.row.name} {params.row.last_name}
        </Typography>
      ),
    },
    { field: "relationship", headerName: "Relationship", renderHeader: (params) => <strong>{params.colDef.headerName}</strong>, flex: 1 },
    { field: "dob", headerName: "DoB", renderHeader: (params) => <strong>{params.colDef.headerName}</strong>, flex: 1 },
  ];

  let rowsWithId = [];

  if (children && children?.length !== 0) {
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
};

export const PetDataGrid = ({ pets }) => {
  const columns = [
    {
      field: "name",
      headerName: "Name",
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
      flex: 2,
      renderCell: (params) => (
        <Typography>
          {params.row.name} {params.row.last_name}
        </Typography>
      ),
    },
    { field: "type", headerName: "Type", renderHeader: (params) => <strong>{params.colDef.headerName}</strong>, flex: 1 },
    { field: "dob", headerName: "DoB", renderHeader: (params) => <strong>{params.colDef.headerName}</strong>, flex: 1 },
  ];

  let rowsWithId = [];

  if (pets && pets?.length !== 0) {
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
};

export const VehicleDataGrid = ({ vehicles }) => {
  const columns = [
    {
      field: "name",
      headerName: "Name",
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
      flex: 2,
      renderCell: (params) => (
        <Typography>
          {params.row.make} {params.row.model}
        </Typography>
      ),
    },
    {
      field: "license",
      headerName: "License",
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
      flex: 1,
      renderCell: (params) => (
        <Typography>
          {params.row.license} {params.row.state}
        </Typography>
      ),
    },
    { field: "year", headerName: "Year", renderHeader: (params) => <strong>{params.colDef.headerName}</strong>, flex: 1 },
  ];

  let rowsWithId = [];

  if (vehicles && vehicles?.length !== 0) {
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
};

const EmploymentDataGrid = ({ employmentDataT = [] }) => {
  // const parsedEmploymentDataT = Array.isArray(employmentDataT) ? employmentDataT : [];

  const [employmentData, setEmploymentData] = useState([]);

  const [parsedEmploymentDataT, setParsedEmploymentDataT] = useState([]);

  // useEffect(()=>{

  //     if(checkedJobs.length === 0){
  //         const updateJobs = employmentData.map(job => ({
  //             ...job,
  //             checked: parsedEmploymentDataT && parsedEmploymentDataT.length > 0
  //                 ? parsedEmploymentDataT.some(
  //                     leaseJob =>
  //                         leaseJob.jobTitle === job.jobTitle &&
  //                         leaseJob.companyName === job.companyName
  //                   )
  //                 : false
  //         }));

  //         setCheckedJobs(updateJobs);

  //         const selectedJobs = updateJobs.filter(job => job.checked);
  //         setSelectedJobs(selectedJobs);
  //     }

  // }, [parsedEmploymentDataT, employmentData])

  // useEffect(()=>{
  //     if(profileData?.tenant_employment !== employmentData && parsedEmploymentDataT !== employmentDataT){
  //         setEmploymentData(profileData?.tenant_employment ? JSON.parse(profileData.tenant_employment): [])
  //         setParsedEmploymentDataT(employmentDataT ? employmentDataT : [])
  //     }
  // }, [profileData, employmentDataT])

  return (
    <Box sx={{ padding: "10px" }}>
      <Grid container spacing={2}>
        {employmentDataT.length > 0 ? (
          employmentDataT.map((job, index) => (
            <Grid item xs={12} key={index}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant='body1' sx={{ fontWeight: "bold" }}>
                    Job Title: {job.jobTitle}
                  </Typography>
                  <Typography variant='body2'>Company: {job.companyName}</Typography>
                  <Typography variant='body2'>Salary: ${job.salary}</Typography>
                  <Typography variant='body2'>Frequency: {job.frequency}</Typography>
                </Box>
              </Box>
              <Divider sx={{ marginTop: "10px", marginBottom: "10px" }} />
            </Grid>
          ))
        ) : (
          <Typography variant='body2' sx={{ textAlign: "center", width: "100%" }}>
            No employment data available.
          </Typography>
        )}
      </Grid>
    </Box>
  );
};
export default TenantLeases;
