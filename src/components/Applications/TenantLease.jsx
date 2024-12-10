import { useState, useEffect, useContext, useRef, Fragment } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import theme from "../../theme/theme";
import { ThemeProvider, Paper, FormControlLabel, Checkbox, Radio, Menu } from "@mui/material";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers";
import { ReactComponent as CalendarIcon } from "../../images/datetime.svg";
import { calculateAge } from "../utils/helper";
import { useUser } from "../../contexts/UserContext";
import { makeStyles } from "@material-ui/core/styles";
import AddFeeRowImg from "../../images/AddFeeRowImg.svg";
import DescriptionIcon from "@mui/icons-material/Description";
import DeleteIcon from "@mui/icons-material/Delete";
import InputAdornment from "@mui/material/InputAdornment";
import defaultHouseImage from "../Property/defaultHouseImage.png";
import { isValidDate } from "../../utils/dates";
import { DataGrid } from "@mui/x-data-grid";
import { maskSSN, maskEIN, formattedPhoneNumber } from "../utils/privacyMasking";

import APIConfig from "../../utils/APIConfig";
import Documents from "../Leases/Documents";
import { getDateAdornmentString } from "../../utils/dates";

import ListsContext from "../../contexts/ListsContext";
import LeaseFees from "../Leases/LeaseFees";
import { Accordion, AccordionSummary, AccordionDetails, IconButton } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import AddIcon from "@mui/icons-material/Add";
import Slider from "react-slick"; // Add react-slick for image slider
import UtilitiesManager from "../../components/Leases/Utilities";
import AdultOccupant from "../Leases/AdultOccupant";
import ChildrenOccupant from "../Leases/ChildrenOccupant";
import PetsOccupant from "../Leases/PetsOccupant";
import VehiclesOccupant from "../Leases/VehiclesOccupant";
import GenericDialog from "../GenericDialog";
import Switch from '@mui/material/Switch';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiFilledInput-root": {
      backgroundColor: "#D6D5DA !important",
      borderRadius: "10px !import",
      height: "30px !important",
      marginBlock: 10,
      paddingBottom: "15px !important",
    },
    "& input:-webkit-autofill": {
      backgroundColor: "#D6D5DA !important",
      color: "#000000 !important",
      transition: "background-color 0s 600000s, color 0s 600000s !important",
    },
    "& input:-webkit-autofill:focus": {
      transition: "background-color 0s 600000s, color 0s 600000s !important",
    },
  },
  textField: {
    "& .MuiFilledInput-root": {
      backgroundColor: "#FFFFFF !important",
      borderRadius: "10px !import",
      height: "30px !important",
      marginBlock: 10,
      paddingBottom: "15px !important",
    },
    "& input:-webkit-autofill": {
      backgroundColor: "#FFFFFF !important",
      color: "#000000 !important",
      transition: "background-color 0s 600000s, color 0s 600000s !important",
    },
    "& input:-webkit-autofill:focus": {
      transition: "background-color 0s 600000s, color 0s 600000s !important",
    },
  },
  select: {
    backgroundColor: "#D6D5DA",
    height: 30,
    borderRadius: "10px !important",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#D6D5DA",
    },
  },
}));

const initialFees = (property, application) => {
  const fees = [];
  if (property.property_listed_rent) {
    fees.push({
      id: fees.length + 1,
      fee_name: "Rent",
      fee_type: "Rent",
      frequency: "Monthly",
      charge: property.property_listed_rent,
      due_by: 1,
      due_by_date: "",
      late_by: 5,
      late_fee: "50",
      perDay_late_fee: "10",
      available_topay: 10,
    });
  }
  if (property.property_deposit) {
    fees.push({
      id: fees.length + 1,
      fee_name: "Deposit",
      fee_type: "Deposit",
      frequency: "One Time",
      charge: property.property_deposit,
      due_by: 1,
      due_by_date: "",
      late_by: 2,
      late_fee: "50",
      perDay_late_fee: "10",
      available_topay: 10,
    });
  }
  if (fees.length === 0) {
    fees.push({
      id: fees.length + 1,
      fee_name: "",
      fee_type: "$",
      frequency: "Monthly",
      charge: "",
      due_by: 1,
      due_by_date: "",
      late_by: 2,
      late_fee: "",
      perDay_late_fee: "",
      available_topay: 1,
    });
  }
  return fees;
};

const TenantLease = () => {
  console.log("In Tenant Lease");
  const classes = useStyles();
  const navigate = useNavigate();
  const { getProfileId } = useUser();
  const { state } = useLocation();
  const { page, lease, property, managerInitiatedRenew = false } = state;
  const { getList, dataLoaded } = useContext(ListsContext);
  const feeFrequencies = getList("frequency");
  console.log("Property: ", property);
  console.log("Lease: ", lease);
  const [showSpinner, setShowSpinner] = useState(false);
  // Intermediate variables to calculate the initial dates
  let initialStartDate, initialEndDate, initialMoveInDate;
  console.log("158 - In Tenant Lease -  page - ", page);

  const setDates = () => {
    if (datesToggle === "current_lease") {
      if (page === "create_lease" || page === "refer_tenant") {
        initialStartDate = dayjs();
        // initialEndDate = dayjs().add(1, "year").subtract(1, "day");
        initialEndDate = lease.lease_end ? dayjs(lease.lease_end) : dayjs().add(1, "year").subtract(1, "day");
        initialMoveInDate = initialStartDate;
      } else if (page === "edit_lease") {
        initialStartDate = lease.lease_start ? dayjs(lease.lease_start) : dayjs();
        initialEndDate = lease.lease_end ? dayjs(lease.lease_end) : dayjs().add(1, "year").subtract(1, "day");
        initialMoveInDate = lease.lease_move_in_date ? dayjs(lease.lease_move_in_date) : dayjs();
      } else if (page === "renew_lease") {
        // Calculate the duration between lease_start and lease_end
        const oldDuration = dayjs(lease.lease_end).diff(dayjs(lease.lease_start), "day"); // Duration in days
        let leaseStartDate = dayjs(lease.lease_end).add(1, "day");
        let leaseEndDate = leaseStartDate.add(oldDuration, "day");

        if ((lease.lease_status === "RENEW PROCESSING" || lease.lease_status === "APPROVED") && lease.lease_start != null) {
          leaseStartDate = dayjs(lease.lease_start);
        }
        if ((lease.lease_status === "RENEW PROCESSING" || lease.lease_status === "APPROVED") && lease.lease_end != null) {
          leaseEndDate = dayjs(lease.lease_end);
        }
        // const leaseEndDate = leaseStartDate + (dayjs(property.lease_end) - dayjs(property.lease_start));
        // console.log("In Tenant Lease leaseStartDate", leaseStartDate);

        // const duration = leaseEndDate.diff(leaseStartDate, "day"); // Duration in days

        // Set the start date to remain same as lease_start
        initialStartDate = leaseStartDate;
        // console.log("In Tenant Lease initialStartDate", initialStartDate);
        // console.log("In Tenant Lease duration", duration);
        // Set the new end date to be initialStartDate + duration
        // console.log("In Tenant Lease initialEndDate", initialStartDate.add(duration, "days"));
        // initialEndDate = leaseEndDate.add(duration, "day");
        initialEndDate = leaseEndDate;
        // console.log("In Tenant Lease initialEndDate", initialEndDate);
        // Set move-in date same as the start date
        initialMoveInDate = initialStartDate;
      }
    } else if (datesToggle === "active_lease") {
      if (page === "create_lease" || page === "refer_tenant") {
        initialStartDate = dayjs();
        // initialEndDate = dayjs().add(1, "year").subtract(1, "day");
        initialEndDate = lease.lease_end ? dayjs(lease.lease_end) : dayjs().add(1, "year").subtract(1, "day");
        initialMoveInDate = initialStartDate;
      } else if (page === "edit_lease") {
        initialStartDate = lease.lease_start ? dayjs(lease.lease_start) : dayjs();
        initialEndDate = lease.lease_end ? dayjs(lease.lease_end) : dayjs().add(1, "year").subtract(1, "day");
        initialMoveInDate = lease.lease_move_in_date ? dayjs(lease.lease_move_in_date) : dayjs();
      } else if (page === "renew_lease") {
        // Calculate the duration between lease_start and lease_end
        const oldDuration = dayjs(lease.lease_end).diff(dayjs(lease.lease_start), "day"); // Duration in days
        let leaseStartDate = dayjs(lease.lease_start);
        let leaseEndDate = dayjs(lease.lease_end);
        initialStartDate = leaseStartDate;

        initialEndDate = leaseEndDate;
        initialMoveInDate = initialStartDate;
      }

    } else if (datesToggle === "select") {
      // initialStartDate = null;                
      // initialEndDate = null;        
      // initialMoveInDate = null;
      if (page === "renew_lease") {
        // Calculate the duration between lease_start and lease_end
        const oldDuration = dayjs(lease.lease_end).diff(dayjs(lease.lease_start), "day"); // Duration in days
        let leaseStartDate = dayjs(lease.lease_end).add(1, "day");
        let leaseEndDate = leaseStartDate.add(oldDuration, "day");

        if ((lease.lease_status === "RENEW PROCESSING" || lease.lease_status === "APPROVED") && lease.lease_start != null) {
          leaseStartDate = dayjs(lease.lease_start);
        }
        if ((lease.lease_status === "RENEW PROCESSING" || lease.lease_status === "APPROVED") && lease.lease_end != null) {
          leaseEndDate = dayjs(lease.lease_end);
        }
        // const leaseEndDate = leaseStartDate + (dayjs(property.lease_end) - dayjs(property.lease_start));
        // console.log("In Tenant Lease leaseStartDate", leaseStartDate);

        // const duration = leaseEndDate.diff(leaseStartDate, "day"); // Duration in days

        // Set the start date to remain same as lease_start
        initialStartDate = initialStartDate != null ? initialStartDate : leaseStartDate;
        // console.log("In Tenant Lease initialStartDate", initialStartDate);
        // console.log("In Tenant Lease duration", duration);
        // Set the new end date to be initialStartDate + duration
        // console.log("In Tenant Lease initialEndDate", initialStartDate.add(duration, "days"));
        // initialEndDate = leaseEndDate.add(duration, "day");
        initialEndDate = initialEndDate != null ? initialEndDate : leaseEndDate;
        // console.log("In Tenant Lease initialEndDate", initialEndDate);
        // Set move-in date same as the start date
        initialMoveInDate = initialStartDate;
      } else if (page === "create_lease") {
        initialStartDate = dayjs();
        initialEndDate = dayjs().add(1, "year").subtract(1, "day");
        initialMoveInDate = initialStartDate;
      }
    } else {
      //fall back to default
      initialStartDate = dayjs();
      initialEndDate = dayjs().add(1, "year").subtract(1, "day");
      initialMoveInDate = initialStartDate;
    }

    setStartDate(initialStartDate);
    setEndDate(initialEndDate);
    setMoveInDate(initialMoveInDate);
  }

  // if (page === "create_lease" || page === "refer_tenant") {
  //   initialStartDate = dayjs();
  //   // initialEndDate = dayjs().add(1, "year").subtract(1, "day");
  //   initialEndDate = property.lease_end ? dayjs(property.lease_end) : dayjs().add(1, "year").subtract(1, "day");
  //   initialMoveInDate = initialStartDate;
  // } else if (page === "edit_lease") {
  //   initialStartDate = application.lease_start ? dayjs(application.lease_start) : dayjs();
  //   initialEndDate = application.lease_end ? dayjs(application.lease_end) : dayjs().add(1, "year").subtract(1, "day");
  //   initialMoveInDate = application.lease_move_in_date ? dayjs(application.lease_move_in_date) : dayjs();
  // } else if (page === "renew_lease") {
  //   // Calculate the duration between lease_start and lease_end
  //   const oldDuration = dayjs(property.lease_end).diff(dayjs(property.lease_start), "day"); // Duration in days
  //   let leaseStartDate = dayjs(property.lease_end).add(1, "day");
  //   let leaseEndDate = leaseStartDate.add(oldDuration, "day");

  //   if((application.lease_status === "RENEW PROCESSING" || application.lease_status === "APPROVED") && application.lease_start != null){
  //     leaseStartDate = dayjs(application.lease_start);
  //   }
  //   if((application.lease_status === "RENEW PROCESSING" || application.lease_status === "APPROVED") && application.lease_end != null){
  //     leaseEndDate = dayjs(application.lease_end);
  //   }
  //   // const leaseEndDate = leaseStartDate + (dayjs(property.lease_end) - dayjs(property.lease_start));
  //   // console.log("In Tenant Lease leaseStartDate", leaseStartDate);

  //   // const duration = leaseEndDate.diff(leaseStartDate, "day"); // Duration in days

  //   // Set the start date to remain same as lease_start
  //   initialStartDate = leaseStartDate;
  //   // console.log("In Tenant Lease initialStartDate", initialStartDate);
  //   // console.log("In Tenant Lease duration", duration);
  //   // Set the new end date to be initialStartDate + duration
  //   // console.log("In Tenant Lease initialEndDate", initialStartDate.add(duration, "days"));
  //   // initialEndDate = leaseEndDate.add(duration, "day");
  //   initialEndDate = leaseEndDate;
  //   // console.log("In Tenant Lease initialEndDate", initialEndDate);
  //   // Set move-in date same as the start date
  //   initialMoveInDate = initialStartDate;
  // }

  // Set state using intermediate variables
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [moveInDate, setMoveInDate] = useState(initialMoveInDate);
  const [noOfOccupants, setNoOfOccupants] = useState(1);
  const [endLeaseNoticePeriod, setEndLeaseNoticePeriod] = useState(lease.lease_end_notice_period ? lease.lease_end_notice_period : 30);
  const [leaseContinueM2M, setLeaseContinueM2M] = useState(lease.lease_m2m && lease.lease_m2m === 1 ? true : false);

  const [leaseAdults, setLeaseAdults] = useState([]);
  const [leaseChildren, setLeaseChildren] = useState([]);
  const [leasePets, setLeasePets] = useState([]);
  const [leaseVehicles, setLeaseVehicles] = useState([]);
  const [deletedDocsUrl, setDeletedDocsUrl] = useState([]);
  const [isPreviousFileChange, setIsPreviousFileChange] = useState(false);
  const [deleteFees, setDeleteFees] = useState([]);

  // console.log("# of Occupants", noOfOccupants);

  const [fees, setFees] = useState([]);

  const [leaseDocuments, setLeaseDocuments] = useState(lease?.lease_documents ? JSON.parse(lease?.lease_documents) : []);

  const [leaseFiles, setLeaseFiles] = useState([]);
  const [leaseFileTypes, setLeaseFileTypes] = useState([]);

  const [tenants, setTenants] = useState([
    {
      id: 1,
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      lease_perc: 100,
    },
  ]);
  // const [adults, setAdults] = useState([{ id: 1, name: "", lastName: "", relation: "", dob: "" }]);
  // const [children, setChildren] = useState([{ id: 1, name: "", lastName: "", relation: "", dob: "" }]);
  // const [pets, setPets] = useState([{ id: 1, name: "", breed: "", type: "", weight: "" }]);
  // const [vehicles, setVehicles] = useState([{ id: 1, make: "", model: "", year: "", license: "", state: "" }]);
  const [adults, setAdults] = useState([]);
  const [children, setChildren] = useState([]);
  const [pets, setPets] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const adultsRef = useRef(adults);
  const childrenRef = useRef(children);
  const petsRef = useRef(pets);
  const vehiclesRef = useRef(vehicles);
  const documentsRef = useRef([]);

  const [relationships, setRelationships] = useState([]);
  const [states, setStates] = useState([]);
  const [utilityNames, setUtilityNames] = useState([]);
  const [utilityEntities, setUtilityEntities] = useState([]);
  const [utilitiesMap, setUtilitiesMap] = useState(new Map());
  const [entitiesMap, setEntitiesMap] = useState(new Map());
  const [reverseUtilitiesMap, setReverseUtilitiesMap] = useState(new Map());
  const [reverseEntitiesMap, setReverseEntitiesMap] = useState(new Map());
  const [keysNotInUtilitiesMap, setKeysNotInUtilitiesMap] = useState([]);

  const [isDefaultUtilities, setIsDefaultUtilities] = useState(false);
  const [mappedUtilitiesPaidBy, setMappedUtilitiesPaidBy] = useState({});
  const [newUtilitiesPaidBy, setNewUtilitiesPaidBy] = useState({});
  const [hasUtilitiesChanges, setHasUtilitiesChanges] = useState(false);
  const [addUtilityAnchorElement, setAddUtilityAnchorElement] = useState(null);

  const [modifiedData, setModifiedData] = useState([]); // not being

  const editOrUpdateTenant = () => { }; // being passed to AdultOccupant, ChildrenOccupant etc but not used in this page.

  const [showMissingFileTypePrompt, setShowMissingFileTypePrompt] = useState(false);
  const [showMissingFieldsPrompt, setShowMissingFieldsPrompt] = useState(false);
  const [showInvalidDueDatePrompt, setShowInvalidDueDatePrompt] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogSeverity, setDialogSeverity] = useState("info");


  const getDatesToggleInitialValue = () => {
    if (["NEW", "RENEW NEW"].includes(lease?.lease_status)) {
      return "select";
    }
    //  else if(["RENEW NEW", "PROCESSING", "RENEW PROCESSING", "WITHDRAWN", "RENEW WITHDRAWN", "REJECTED", "RENEW REJECTED", "REFUSED", "RENEW REFUSED", "RESCIND", "RENEW RESCINDED"].includes(application.lease_status)) {
    //   return "current_lease";
    // } 
    else {
      return "current_lease";
    }
  }

  const [datesToggle, setDatesToggle] = useState(getDatesToggleInitialValue());



  const openDialog = (title, message, severity) => {
    setDialogTitle(title); // Set custom title
    setDialogMessage(message); // Set custom message
    setDialogSeverity(severity); // Can use this if needed to control styles
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  let propertyImage;
  if (property.property_favorite_image !== null) {
    propertyImage = property.property_favorite_image;
  } else if (property.property_images === null || property.property_images === "[]") {
    propertyImage = defaultHouseImage;
  } else {
    const images = JSON.parse(property?.property_images);
    propertyImage = images.length > 0 ? images[0] : defaultHouseImage;
  }

  // useEffect(() => {
  //   console.log("260 - leaseAdults - ", leaseAdults)
  //   console.log("260 - leaseChildren - ", leaseChildren)
  //   console.log("260 - leasePets - ", leasePets)
  //   console.log("260 - leaseVehicles - ", leaseVehicles)

  // }, [leaseAdults, leaseChildren, leasePets, leaseVehicles]);

  useEffect(() => {
    setDates();
  }, []);

  useEffect(() => {
    console.log("ROHIT - 403 - datesToggle - ", datesToggle);
    if (datesToggle !== "select") {
      setDates();
    }
  }, [datesToggle]);

  useEffect(() => {
    const names = utilityNames?.reduce((map, item) => {
      map.set(item.list_uid, item.list_item);
      return map;
    }, new Map());

    // console.log("278 - names - ", names)
    setUtilitiesMap(names);
  }, [utilityNames]);

  useEffect(() => {
    const entities = utilityEntities?.reduce((map, item) => {
      map.set(item.list_uid, item.list_item);
      return map;
    }, new Map());

    // console.log("278 - entities - ", entities)
    setEntitiesMap(entities);
  }, [utilityEntities]);

  useEffect(() => {
    const reverseMap = new Map(Array.from(utilitiesMap ? utilitiesMap : [], ([key, value]) => [value, key]));
    // console.log("296 - reverseMap - ", reverseMap)
    setReverseUtilitiesMap(reverseMap);
  }, [utilitiesMap]);

  useEffect(() => {
    const reverseMap = new Map(Array.from(entitiesMap ? entitiesMap : [], ([key, value]) => [value, key]));
    // console.log("303 - reverseMap - ", reverseMap)
    setReverseEntitiesMap(reverseMap);
  }, [entitiesMap]);

  useEffect(() => {
    setKeysNotInUtilitiesMap(Array.from(utilitiesMap?.values()).filter((utility) => !(utility in mappedUtilitiesPaidBy)));
  }, [utilitiesMap, mappedUtilitiesPaidBy]);

  const getListDetails = () => {
    // console.log("543 - getListDetails called");
    const relationships = getList("relationships");
    const states = getList("states");
    const utilNames = getList("utilities");
    const utilEntities = getList("role");
    // console.log("285 - utilityNames - ", utilityNames)
    // console.log("285 - utilityEntities - ", utilityEntities)
    setRelationships(relationships);
    setStates(states);
    setUtilityNames(utilNames);
    setUtilityEntities(utilEntities);
  };

  const defaultUtilities = {
    electricity: "owner",
    trash: "owner",
    water: "owner",
    internet: "owner",
    gas: "owner",
  };

  // const utilitiesMap = new Map([
  //   ["050-000001", "electricity"],
  //   ["050-000002", "water"],
  //   ["050-000003", "gas"],
  //   ["050-000004", "trash"],
  //   ["050-000005", "sewer"],
  //   ["050-000006", "internet"],
  //   ["050-000007", "cable"],
  //   ["050-000008", "hoa_dues"],
  //   ["050-000009", "security_system"],
  //   ["050-000010", "pest_control"],
  //   ["050-000011", "gardener"],
  //   ["050-000012", "maintenance"],
  // ]);

  // const entitiesMap = new Map([
  //   ["050-000280", "owner"],
  //   ["050-000281", "property manager"],
  //   ["050-000282", "tenant"],
  //   ["050-000289", "user"],
  // ]);

  // const reverseUtilitiesMap = new Map(Array.from(utilitiesMap, ([key, value]) => [value, key]));
  // const reverseEntitiesMap = new Map(Array.from(entitiesMap, ([key, value]) => [value, key]));

  // useEffect(() => {
  //   console.log("newUtilitiesPaidBy - ", newUtilitiesPaidBy);
  // }, [newUtilitiesPaidBy]);

  // useEffect(() => {
  //   console.log("332 - mappedUtilitiesPaidBy - ", mappedUtilitiesPaidBy);
  // }, [mappedUtilitiesPaidBy]);

  const formatUtilityName = (utility) => {
    const formattedUtility = utility.replace(/_/g, " ");
    return formattedUtility.charAt(0).toUpperCase() + formattedUtility.slice(1);
  };

  const handleAddUtilityButtonClick = (event) => {
    setAddUtilityAnchorElement(event.currentTarget);
  };

  const handleAddUtilityClose = () => {
    setAddUtilityAnchorElement(null);
  };

  const handleAddUtility = (utility) => {
    const updatedMappedUtilities = { ...mappedUtilitiesPaidBy };
    updatedMappedUtilities[utility] = "owner";
    setMappedUtilitiesPaidBy(updatedMappedUtilities);

    const updatedNewUtilitiesMappedBy = { ...newUtilitiesPaidBy };
    updatedNewUtilitiesMappedBy[utility] = "owner";
    setNewUtilitiesPaidBy(updatedNewUtilitiesMappedBy);

    // console.log(`Adding utility: ${utility}`);
    handleAddUtilityClose();
  };

  const mapUIDsToUtilities = (propertyUtilities) => {
    if (!propertyUtilities) {
      return {};
    }
    // console.log("----- in mapUIDsToUtilities, input - ", propertyUtilities);
    // console.log("----- in mapUIDsToUtilities, entitiesMap - ", entitiesMap);
    const mappedUtilities = {};
    for (const key of Object.keys(propertyUtilities)) {
      const utilityName = utilitiesMap.get(key);
      const entityName = entitiesMap.get(propertyUtilities[key]);

      if (utilityName && entityName) {
        mappedUtilities[utilityName] = entityName;
      }
    }

    // console.log("----- in mapUIDsToUtilities, mappedUtilities - ", mappedUtilities);
    return mappedUtilities;
  };

  // const utilitiesObject = JSON.parse(property.property_utilities);
  const [utilitiesObject, setUtilitiesObject] = useState(lease?.lease_utilities ? JSON.parse(lease.lease_utilities) : []);
  // console.log("392 - utilitiesObject - ", utilitiesObject);
  // const [utilitiesObject, setUtilitiesObject] = useState(() => {
  //   const utilities = application?.lease_utilities;
  //   return utilities && utilities !== "" ? JSON.parse(utilities) : [];
  // });
  // console.log("392 - utilitiesObject - ", utilitiesObject);
  let utilitiesInUIDForm = {};
  let mappedUtilities2 = {};

  const handleUtilityChange = (utility, entity) => {
    const utilityObject = { [utility]: `${entity}` };
    setHasUtilitiesChanges(true);

    // console.log("392 - mappedUtilitiesPaidBy - ", mappedUtilitiesPaidBy);
    // console.log("392 - utilityObject - ", utilityObject);

    setMappedUtilitiesPaidBy((prevState) => ({
      ...prevState,
      [utility]: prevState.hasOwnProperty(utility) ? entity : prevState[utility],
    }));
    setNewUtilitiesPaidBy((prevState) => ({
      ...(prevState.hasOwnProperty(utility) ? { ...prevState, [utility]: entity } : prevState),
    }));
  };

  const mapUtilitiesAndEntitiesToUIDs = (utilitiesObject) => {
    const mappedResults = {};

    for (const [key, value] of Object.entries(utilitiesObject)) {
      const utilityUID = reverseUtilitiesMap.get(key);
      const entityUID = reverseEntitiesMap.get(value);

      if (utilityUID && entityUID) {
        mappedResults[utilityUID] = entityUID;
      }
    }

    return mappedResults;
  };

  useEffect(() => {

    const getLeaseFees = () => {
      console.log(" -- DEBUG -- in fees - ", lease)
      let feesList = [];
      if (
        lease?.lease_status === "PROCESSING" ||
        lease?.lease_status === "RENEW PROCESSING" ||
        lease?.lease_status === "ACTIVE" ||
        lease?.lease_status === "ACTIVE M2M" ||
        lease?.lease_status === "RENEW NEW" ||
        lease?.lease_status === "APPROVED"
      ) {

        feesList = JSON.parse(lease?.lease_fees);
      } else if (lease?.lease_status === "NEW" || lease?.lease_status === "REJECTED" || lease?.lease_status === "REFUSED" || lease?.lease_status === "RENEW REFUSED" || lease?.lease_status === "WITHDRAWN" || lease?.lease_status === "RESCIND") {
        const parsedleaseFees = lease.lease_fees ? JSON.parse(lease.lease_fees) : []
        if (parsedleaseFees?.length === 0) {
          feesList = initialFees(property, lease);
        } else {
          // feesList = JSON.parse(application?.lease_fees);
          feesList = parsedleaseFees;
        }
      }
      // console.log("Fees: ", feesList);

      // let i = 0;
      // feesList.forEach((fee) => {
      //   fee.id = i + 1;
      //   i += 1;
      // });

      setFees(feesList);
    };

    const getOccupants = () => {
      let numOccupants = 0;
      try {
        const adults = lease.lease_adults ? JSON.parse(lease?.lease_adults) : [];
        setLeaseAdults(adults);
        numOccupants += adults?.length;
      } catch (error) {
        console.log("Error parsing lease.lease_adults:", error);
      }

      try {
        const children = lease.lease_children ? JSON.parse(lease?.lease_children) : [];
        setLeaseChildren(children);
        numOccupants += children?.length;
      } catch (error) {
        console.log("Error parsing lease.lease_children:", error);
      }

      try {
        const pets = lease.lease_pets ? JSON.parse(lease?.lease_pets) : [];
        setLeasePets(pets);
      } catch (error) {
        console.log("Error parsing lease.lease_pets:", error);
      }

      try {
        const vehicles = lease.lease_vehicles ? JSON.parse(lease?.lease_vehicles) : [];
        setLeaseVehicles(vehicles);
      } catch (error) {
        console.log("Error parsing lease.lease_adults:", error);
      }

      setNoOfOccupants(numOccupants);
    };

    getLeaseFees();
    getOccupants();
    // getListDetails();

    // //*************************************UTILITIES********************************************************* */
    // if (utilitiesObject && utilitiesObject?.length > 0) {
    //   // console.log("484 - utilitiesObject - ", utilitiesObject);
    //   for (const utility of utilitiesObject) {
    //     // console.log(utility.utility_type_id, utility.utility_payer_id);
    //     utilitiesInUIDForm[utility.utility_type_id] = utility.utility_payer_id;
    //   }
    //   // console.log("UTILTIES IN UID FORM", utilitiesInUIDForm);

    //   mappedUtilities2 = mapUIDsToUtilities(utilitiesInUIDForm);
    //   // console.log("----- Mapped UIDs to Utilities, mappedUtilities2");
    //   // console.log("   ", mappedUtilities2);
    //   setMappedUtilitiesPaidBy(mappedUtilities2);
    // } else {
    //   setMappedUtilitiesPaidBy(defaultUtilities);
    //   setIsDefaultUtilities(true);
    // }
    // //******************************************************************************************************* */
  }, []);

  useEffect(() => {
    // console.log("543 - dataLoaded - ", dataLoaded);
    if (dataLoaded === true) {
      getListDetails();
    }
  }, [dataLoaded, getList]);

  useEffect(() => {
    // console.log("551 - entitiesMap - ", entitiesMap);
    // console.log("551 - utilitiesMap - ", utilitiesMap);
    //*************************************UTILITIES********************************************************* */
    if (utilitiesObject && utilitiesObject?.length > 0) {
      console.log("UTILITIES - utilitiesObject - ", utilitiesObject);
      for (const utility of utilitiesObject) {
        // console.log(utility.utility_type_id, utility.utility_payer_id);
        utilitiesInUIDForm[utility.utility_type_id] = utility.utility_payer_id;
      }
      console.log("UTILTIES IN UID FORM", utilitiesInUIDForm);

      mappedUtilities2 = mapUIDsToUtilities(utilitiesInUIDForm);
      console.log("----- Mapped UIDs to Utilities, mappedUtilities2");
      console.log("   ", mappedUtilities2);
      setMappedUtilitiesPaidBy(mappedUtilities2);
    } else {
      console.log("UTILITIES setting else");
      setMappedUtilitiesPaidBy(defaultUtilities);
      setIsDefaultUtilities(true);
    }
    //******************************************************************************************************* */
  }, [utilitiesObject, utilitiesMap, entitiesMap]);

  // const addFeeRow = () => {
  //   setFees((prev) => [
  //     ...prev,
  //     {
  //       id: prev.length + 1,
  //       fee_name: "",
  //       fee_type: "$",
  //       frequency: "Monthly",
  //       charge: "",
  //       due_by: 1,
  //       late_by: 2,
  //       late_fee: "",
  //       perDay_late_fee: "",
  //       available_topay: 1,
  //     },
  //   ]);
  // };

  // const deleteFeeRow = (index) => {
  //   const list = [...fees];
  //   list.splice(index - 1, 1);
  //   setFees(list);
  // };

  const handleFeeChange = (e, index) => {
    const { name, value } = e.target;
    const list = [...fees];

    if (name === "due_by" || name === "late_by" || name === "available_topay") {
      if (typeof parseInt(value) === "number" && !isNaN(parseInt(value))) {
        list[index - 1][name] = parseInt(value);
      } else {
        list[index - 1][name] = null;
      }
    } else {
      list[index - 1][name] = value;
    }
    setFees(list);
  };
  const handleFrequencyChange = (e, index) => {
    const value = e.target.value;
    let list = [...fees];
    list[index - 1].frequency = value;
    list[index - 1].available_topay = 1;
    if (value === "One Time") {
      list[index - 1].due_by = null;
      list[index - 1].due_by_date = "";
    } else {
      list[index - 1].due_by = 1;
      list[index - 1].due_by_date = null;
    }
    list[index - 1].late_by = 2;
    setFees(list);
  };
  const handleDueByChange = (e, index) => {
    const value = e.target.value;
    let list = [...fees];
    list[index - 1].due_by = daytoValueMap.get(value);
    setFees(list);
  };

  const handleLateByChange = (e, index) => {
    const value = e.target.value;
    let list = [...fees];
    // list[index - 1].late_by = daytoValueMap.get(value);
    list[index - 1].late_by = value;
    setFees(list);
  };

  const handleAvailableToPayChange = (e, index) => {
    const value = e.target.value;
    let list = [...fees];
    // list[index - 1].available_topay = daytoValueMap.get(value);
    list[index - 1].available_topay = value;
    setFees(list);
  };

  const handleStartDateChange = (v) => {
    setStartDate(v);
    if (endDate < v) setEndDate(v);
  };
  const handleEndDateChange = (v) => {
    setEndDate(v);
  };
  const handleMoveInDateChange = (v) => {
    setMoveInDate(v);
  };
  const handleNoOfOccupantsChange = (e) => {
    setNoOfOccupants(e.target.value);
  };
  // const handleRentChange = (e) => {
  //   setRent(e.target.value);
  // };
  // const handleRentFrequencyChange = (e) => {
  //   setRentFrequency(e.target.value);
  // };
  // const handleLateFeesAfterChange = (e) => {
  //   setLateFeesAfter(e.target.value);
  // };
  // const handleLateFeesPerDayChange = (e) => {
  //   setLateFeesPerDay(e.target.value);
  // };
  // const handleRentDueDateChange = (e) => {
  //   setRentDueDate(e.target.value);
  // };
  // const handleAvailableToPayChange = (e) => {
  //   setAvailableToPay(e.target.value);
  // };
  const handleDueByDateChange = (v, index) => {
    // console.log("handleDueByDateChange - v, index - ", v.format("MM-DD-YYYY"), index);
    const list = [...fees];
    list[index - 1].due_by_date = v.format("MM-DD-YYYY");
    setFees(list);
  };

  const dayOptionsForWeekly = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" },
  ];

  const dayOptionsForBiWeekly = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" },
    { value: "monday-week-2", label: "Monday - week 2" },
    { value: "tuesday-week-2", label: "Tuesday - week 2" },
    { value: "wednesday-week-2", label: "Wednesday - week 2" },
    { value: "thursday-week-2", label: "Thursday - week 2" },
    { value: "friday-week-2", label: "Friday - week 2" },
    { value: "saturday-week-2", label: "Saturday - week 2" },
    { value: "sunday-week-2", label: "Sunday - week 2" },
  ];

  const lateByOptionsForWeekly = [
    { value: 1, label: "1st day after due date" },
    { value: 2, label: "2nd day after due date" },
    { value: 3, label: "3rd day after due date" },
    { value: 4, label: "4th day after due date" },
    { value: 5, label: "5th day after due date" },
    { value: 6, label: "6th day after due date" },
    { value: 7, label: "7th day after due date" },
  ];

  const lateByOptionsForBiWeekly = [
    { value: 1, label: "1st day after due date" },
    { value: 2, label: "2nd day after due date" },
    { value: 3, label: "3rd day after due date" },
    { value: 4, label: "4th day after due date" },
    { value: 5, label: "5th day after due date" },
    { value: 6, label: "6th day after due date" },
    { value: 7, label: "7th day after due date" },
    { value: 8, label: "8th day after due date" },
    { value: 9, label: "9th day after due date" },
    { value: 10, label: "10th day after due date" },
    { value: 11, label: "11th day after due date" },
    { value: 12, label: "12th day after due date" },
    { value: 13, label: "13th day after due date" },
    { value: 14, label: "14th day after due date" },
  ];

  const availableToPayOptionsForWeekly = [
    { value: 1, label: "1 day before due date" },
    { value: 2, label: "2 days before due date" },
    { value: 3, label: "3 days before due date" },
    { value: 4, label: "4 days before due date" },
    { value: 5, label: "5 days before due date" },
    { value: 6, label: "6 days before due date" },
    { value: 7, label: "7 days before due date" },
  ];

  const availableToPayOptionsForBiWeekly = [
    { value: 1, label: "1 day before due date" },
    { value: 2, label: "2 days before due date" },
    { value: 3, label: "3 days before due date" },
    { value: 4, label: "4 days before due date" },
    { value: 5, label: "5 days before due date" },
    { value: 6, label: "6 days before due date" },
    { value: 7, label: "7 days before due date" },
    { value: 8, label: "8 days before due date" },
    { value: 9, label: "9 days before due date" },
    { value: 10, label: "10 days before due date" },
    { value: 11, label: "11 days before due date" },
    { value: 12, label: "12 days before due date" },
    { value: 13, label: "13 days before due date" },
    { value: 14, label: "14 days before due date" },
  ];

  const daytoValueMap = new Map([
    ["monday", 0],
    ["tuesday", 1],
    ["wednesday", 2],
    ["thursday", 3],
    ["friday", 4],
    ["saturday", 5],
    ["sunday", 6],
    ["monday-week-2", 7],
    ["tuesday-week-2", 8],
    ["wednesday-week-2", 9],
    ["thursday-week-2", 10],
    ["friday-week-2", 11],
    ["saturday-week-2", 12],
    ["sunday-week-2", 13],
  ]);

  const tenantColumns = [
    {
      field: "tenant_uid",
      headerName: "UID",
      flex: 1,
    },
    {
      field: "tenant_first_name",
      headerName: "First Name",
      flex: 1,
    },
    {
      field: "tenant_last_name",
      headerName: "Last Name",
      flex: 1,
    },
    {
      field: "tenant_email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "tenant_phone_number",
      headerName: "Phone Number",
      flex: 1,
    },
    {
      field: "lt_responsibility",
      headerName: "Responsibility",
      flex: 1,
    },
  ];

  const valueToDayMap = new Map(Array.from(daytoValueMap, ([key, value]) => [value, key]));

  const checkValidDueDate = (fee) => {
    console.log("ROHIT - fee - ", fee);
    // ((fee.due_by == null || fee.due_by === "") && (fee.due_by_date == null || fee.due_by_date === "" || !isValidDate(fee.due_by_date))) 

    if (fee.frequency === "Monthly" || fee.frequency === "Quarterly" || fee.frequency === "Semi-Monthly" || fee.frequency === "Bi-Weekly" || fee.frequency === "Weekly") {
      if (fee.due_by === "" || fee.due_by == null) {
        console.log("due_by is invalid")
        return true;
      } else {
        return false;
      }

    } else if (fee.frequency === "One Time" || fee.frequency === "Annually" || fee.frequency === "Semi-Annually") {
      // return fee.due_by_date !== "" ? `${fee.due_by_date}` : "No Due Date";
      if (fee.due_by_date === "" || fee.due_by_date == null) {
        console.log("due_by_date is invalid - ", fee.due_by_date)
        return true;
      } else {
        return false;
      }
    } else {
      alert("DEBUG - 1012 - INVALID FEE FREQUENCY - ", fee.frequency);
    }

  }

  const checkRequiredFields = () => {
    if (fees.length === 0) {
      return false;
    }
    let retVal = true;
    fees.forEach((fee) => {
      // console.log("859 - fee.due_by_date - ", fee.due_by_date);
      if (
        fee.fee_name == null ||
        fee.fee_name === "" ||
        fee.fee_type == null ||
        fee.fee_type === "" ||
        fee.charge == null ||
        fee.charge === "" ||
        fee.frequency == null ||
        fee.frequency === "" ||
        checkValidDueDate(fee) ||
        fee.late_by == null ||
        fee.late_fee == null ||
        fee.late_fee === "" ||
        fee.available_topay == null ||
        fee.perDay_late_fee == null ||
        fee.perDay_late_fee === ""
      ) {
        retVal = false;
      }
    });
    return retVal;
  };

  // useEffect(() => {
  //   let isValid = true;
  //   fees.forEach((fee) => {
  //     if (fee.frequency === "One Time" || fee.frequency === "Annually") {
  //       if (fee.due_by_date == null || fee.due_by_date === "" || !isValidDate(fee.due_by_date)) {
  //         isValid = false;
  //       }
  //     }
  //   });
  //   if (isValid) {
  //     setShowInvalidDueDatePrompt(false);
  //   } else {
  //     setShowInvalidDueDatePrompt(true);
  //   }
  // }, [fees]);

  const handleRemoveFile = (index) => {
    setLeaseFiles((prevFiles) => {
      const filesArray = Array.from(prevFiles);
      filesArray.splice(index, 1);
      return filesArray;
    });
    setLeaseFileTypes((prevTypes) => {
      const typesArray = [...prevTypes];
      typesArray.splice(index, 1);
      return typesArray;
    });
  };

  const checkFileTypeSelected = () => {
    for (let i = 0; i < leaseFiles.length; i++) {
      if (i >= leaseFileTypes.length) {
        return false; // Return false if the index is out of bounds
      }
      const fileType = leaseFileTypes[i];
      // console.log("FILE TYPE: ", fileType);
      if (!fileType || fileType.trim() === "") {
        return false;
      }
    }
    setShowMissingFileTypePrompt(false);
    return true;
  };

  // const putUtilitiesData = async () => {
  //   if (hasUtilitiesChanges) {
  //     const utilitiesJSONString = JSON.stringify(mapUtilitiesAndEntitiesToUIDs(mappedUtilitiesPaidBy));
  //     const utilitiesFormData = new FormData();
  //     utilitiesFormData.append("property_uid", property.property_uid);
  //     utilitiesFormData.append("property_utility", utilitiesJSONString);

  //     setShowSpinner(true);
  //     await fetch(`${APIConfig.baseURL.dev}/utilities`, {
  //       method: "PUT",
  //       body: utilitiesFormData,
  //     });
  //     setShowSpinner(false);

  //     console.log("Utilities changes saved.");
  //   } else {
  //     console.log("No changes for utilities.");
  //   }
  // };

  const createUpdatedUtilitesArray = (obj) => {
    // console.log("840 - obj - ", obj);
    const utilitiesArray = [];

    Object.keys(obj)?.forEach((key) => {
      // console.log("844 - util - ", key, obj[key]);
      const utilObj = {
        utility_desc: key,
        utility_payer: null,
        utility_type_id: reverseUtilitiesMap.get(key),
        utility_payer_id: reverseEntitiesMap.get(obj[key]),
      };

      utilitiesArray.push(utilObj);
    });
    // console.log("854 - utilitiesArray - ", utilitiesArray);
    return utilitiesArray;
  };

  async function updateCurrentLease(renewStatus) {
    const leaseApplicationFormData = new FormData();

    leaseApplicationFormData.append("lease_uid", lease.lease_uid);
    // leaseApplicationFormData.append("lease_renew_status", "RENEW REQUESTED");    
    leaseApplicationFormData.append("lease_renew_status", renewStatus);

    try {
      const response = await fetch(`${APIConfig.baseURL.dev}/leaseApplication`, {
        method: "PUT",
        body: leaseApplicationFormData,
      });
      const data = await response.json();
      // if (data.lease_update.code === 200) {
      if (response.ok) {
        // alert("You have successfully Rejected the lease.");
        openDialog("Success", `You have successfully Rejected the lease`, "success");

      } else {
        console.log(data);
      }
    } catch (error) {
      console.log(error);
    }
  }


  const handleCreateNewLease = async () => {
    //POST call
    try {
      // setShowMissingFieldsPrompt(false);
      if (!checkRequiredFields()) {
        // console.log("check here -- error no fees");
        // setShowMissingFieldsPrompt(true);
        openDialog("Error", `Please check lease fees.`, "error");
        return;
      }
      setShowSpinner(true);

      const leaseApplicationFormData = new FormData();

      console.log("---insdie DEBUG Lease fees - ", fees)

      if (lease?.lease_status === "RENEW REFUSED" || lease?.lease_status === "RENEW WITHDRAWN") {
        leaseApplicationFormData.append("lease_status", "RENEW PROCESSING");
      } else {
        leaseApplicationFormData.append("lease_status", "PROCESSING");
      }
      leaseApplicationFormData.append("lease_property_id", lease.lease_property_id);
      leaseApplicationFormData.append("tenant_uid", lease?.tenant_uid);
      leaseApplicationFormData.append("lease_assigned_contacts", lease?.lease_assigned_contacts);
      leaseApplicationFormData.append("lease_application_date", lease?.lease_application_date);
      leaseApplicationFormData.append("lease_effective_date", startDate.format("MM-DD-YYYY"));
      leaseApplicationFormData.append("lease_start", startDate.format("MM-DD-YYYY"));
      leaseApplicationFormData.append("lease_end", endDate.format("MM-DD-YYYY"));
      leaseApplicationFormData.append("lease_fees", JSON.stringify(fees));
      leaseApplicationFormData.append("lease_move_in_date", moveInDate.format("MM-DD-YYYY"));
      leaseApplicationFormData.append("lease_end_notice_period", endLeaseNoticePeriod);
      leaseApplicationFormData.append("lease_m2m", leaseContinueM2M === true ? 1 : 0);
      leaseApplicationFormData.append("lease_documents", JSON.stringify(leaseDocuments));


      const hasMissingType = !checkFileTypeSelected();
      // console.log("HAS MISSING TYPE", hasMissingType);

      if (hasMissingType) {
        setShowMissingFileTypePrompt(true);
        setShowSpinner(false);
        return;
      }

      if (leaseFiles.length) {
        const documentsDetails = [];
        [...leaseFiles].forEach((file, i) => {
          leaseApplicationFormData.append(`file_${i}`, file, file.name);
          const fileType = leaseFileTypes[i] || "";
          const documentObject = {
            // file: file,
            fileIndex: i, //may not need fileIndex - will files be appended in the same order?
            fileName: file.name, //may not need filename
            contentType: fileType,
          };
          documentsDetails.push(documentObject);
        });
        leaseApplicationFormData.append("lease_documents_details", JSON.stringify(documentsDetails));
      }

      // for (let [key, value] of leaseApplicationFormData.entries()) {
      //   console.log(key, value);
      // }

      // await fetch(
      //   `http://localhost:4000/leaseApplication`,
      //   {
      //     method: "PUT",
      //     body: leaseApplicationFormData
      //   }
      // );

      // await putUtilitiesData();
      const updatedUtilitiesArray = createUpdatedUtilitesArray(mappedUtilitiesPaidBy);
      const utilitiesJSONString = JSON.stringify(updatedUtilitiesArray);
      leaseApplicationFormData.append("lease_utilities", utilitiesJSONString);

      leaseApplicationFormData.append("lease_adults", lease.lease_adults);
      leaseApplicationFormData.append("lease_children", lease.lease_children);
      leaseApplicationFormData.append("lease_pets", lease.lease_pets);
      leaseApplicationFormData.append("lease_vehicles", lease.lease_vehicles);
      leaseApplicationFormData.append("lease_income", lease?.lease_income)

      await fetch(`${APIConfig.baseURL.dev}/leaseApplication`, {
        method: "POST",
        body: leaseApplicationFormData,
      });



      if (lease.lease_status === "RENEW REFUSED" || lease.lease_status === "RENEW WITHDRAWN") {
        await updateCurrentLease("RENEW REQUESTED");
      }

      const receiverPropertyMapping = {
        [lease.tenant_uid]: [property.property_uid],
      };

      await fetch(`${APIConfig.baseURL.dev}/announcements/${getProfileId()}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          announcement_title: "New Lease created",
          announcement_msg: "You have a new lease to be approved for your property",
          announcement_sender: getProfileId(),
          announcement_date: new Date().toDateString(),
          // announcement_properties: property.property_uid,
          announcement_properties: JSON.stringify(receiverPropertyMapping),
          announcement_mode: "LEASE",
          announcement_receiver: [lease.tenant_uid],
          announcement_type: ["Email", "Text"],
        }),
      });
      navigate("/managerDashboard");
      setShowSpinner(false);
    } catch (error) {
      console.log("Error Creating Lease:", error);
      alert("We were unable to Text the Property Manager but we were able to send them a notification through the App");

      navigate("/managerDashboard");
      setShowSpinner(false);
    }
  };

  const handleCreateLease = async () => {
    try {
      // setShowMissingFieldsPrompt(false);
      if (!checkRequiredFields()) {
        // console.log("check here -- error no fees");
        // setShowMissingFieldsPrompt(true);
        openDialog("Error", `Please check lease fees.`, "error");
        return;
      }
      setShowSpinner(true);

      const leaseApplicationFormData = new FormData();

      console.log("---insdie DEBUG Lease fees - ", fees)

      leaseApplicationFormData.append("lease_uid", lease.lease_uid);
      if (lease.lease_status === "NEW") {
        leaseApplicationFormData.append("lease_status", "PROCESSING");
      } else if (lease.lease_status === "RENEW NEW") {
        leaseApplicationFormData.append("lease_status", "RENEW PROCESSING");
      } else if (lease.lease_status === "APPROVED") {
        // console.log("968 - property - ", property);
        if (lease.lease_status === "ACTIVE") {
          leaseApplicationFormData.append("lease_status", "RENEW PROCESSING");
          await updateCurrentLease("PM RENEW REQUESTED");
        } else {
          leaseApplicationFormData.append("lease_status", "PROCESSING");
        }

      }

      leaseApplicationFormData.append("lease_effective_date", startDate.format("MM-DD-YYYY"));
      leaseApplicationFormData.append("lease_start", startDate.format("MM-DD-YYYY"));
      leaseApplicationFormData.append("lease_end", endDate.format("MM-DD-YYYY"));
      leaseApplicationFormData.append("lease_fees", JSON.stringify(fees));
      leaseApplicationFormData.append("lease_move_in_date", moveInDate.format("MM-DD-YYYY"));
      leaseApplicationFormData.append("lease_end_notice_period", endLeaseNoticePeriod);
      leaseApplicationFormData.append("lease_m2m", leaseContinueM2M === true ? 1 : 0);
      if (deleteFees?.length > 0) {
        leaseApplicationFormData.append("delete_fees", JSON.stringify(deleteFees));
      }

      if (deletedDocsUrl && deletedDocsUrl?.length !== 0) {
        leaseApplicationFormData.append("delete_documents", JSON.stringify(deletedDocsUrl));
      }

      if (isPreviousFileChange) {
        leaseApplicationFormData.append("lease_documents", JSON.stringify(leaseDocuments));
      }

      const hasMissingType = !checkFileTypeSelected();
      // console.log("HAS MISSING TYPE", hasMissingType);

      if (hasMissingType) {
        setShowMissingFileTypePrompt(true);
        setShowSpinner(false);
        return;
      }

      if (leaseFiles.length) {
        const documentsDetails = [];
        [...leaseFiles].forEach((file, i) => {
          leaseApplicationFormData.append(`file_${i}`, file, file.name);
          const fileType = leaseFileTypes[i] || "";
          const documentObject = {
            // file: file,
            fileIndex: i, //may not need fileIndex - will files be appended in the same order?
            fileName: file.name, //may not need filename
            contentType: fileType,
          };
          documentsDetails.push(documentObject);
        });
        leaseApplicationFormData.append("lease_documents_details", JSON.stringify(documentsDetails));
      }

      // for (let [key, value] of leaseApplicationFormData.entries()) {
      //   console.log(key, value);
      // }

      // await fetch(
      //   `http://localhost:4000/leaseApplication`,
      //   {
      //     method: "PUT",
      //     body: leaseApplicationFormData
      //   }
      // );
      if (hasUtilitiesChanges) {
        // await putUtilitiesData();
        const updatedUtilitiesArray = createUpdatedUtilitesArray(mappedUtilitiesPaidBy);
        const utilitiesJSONString = JSON.stringify(updatedUtilitiesArray);
        leaseApplicationFormData.append("lease_utilities", utilitiesJSONString);
      }
      await fetch(`${APIConfig.baseURL.dev}/leaseApplication`, {
        method: "PUT",
        body: leaseApplicationFormData,
      });

      const receiverPropertyMapping = {
        [lease.tenant_uid]: [property.property_uid],
      };

      await fetch(`${APIConfig.baseURL.dev}/announcements/${getProfileId()}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          announcement_title: "New Lease created",
          announcement_msg: "You have a new lease to be approved for your property",
          announcement_sender: getProfileId(),
          announcement_date: new Date().toDateString(),
          // announcement_properties: property.property_uid,
          announcement_properties: JSON.stringify(receiverPropertyMapping),
          announcement_mode: "LEASE",
          announcement_receiver: [lease.tenant_uid],
          announcement_type: ["Email", "Text"],
        }),
      });
      navigate("/managerDashboard");
      setShowSpinner(false);
    } catch (error) {
      // console.log("Error Creating Lease:", error);
      alert("We were unable to Text the Property Manager but we were able to send them a notification through the App");

      navigate("/managerDashboard");
      setShowSpinner(false);
    }
  };

  function formatDate(dateString) {
    const date = new Date(dateString);
    // console.log('check date', dateString, date)
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

  const sendAnnouncements = async (tenant_uid) => {
    const receiverPropertyMapping = {
      [tenant_uid]: [property.property_uid],
    };

    await fetch(`${APIConfig.baseURL.dev}/announcements/${getProfileId()}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        announcement_title: "New Lease created",
        announcement_msg: "You have a new lease to be approved for your property",
        announcement_sender: getProfileId(),
        announcement_date: new Date().toDateString(),
        // announcement_properties: property.property_uid,
        announcement_properties: JSON.stringify(receiverPropertyMapping),
        announcement_mode: "LEASE",
        announcement_receiver: [tenant_uid],
        announcement_type: ["Email", "Text"],
      }),
    });
  }

  const handleRenewLease = async () => {
    // console.log('inside handleRenewLease');            
    try {
      // setShowMissingFieldsPrompt(false);
      if (!checkRequiredFields()) {
        // console.log('is it inside !checkRequiredFields');
        // setShowMissingFieldsPrompt(true);
        openDialog("Error", `Please fill out all required fields.`, "error");
        return;
      }
      setShowSpinner(true);

      const leaseApplicationFormData = new FormData();
      // console.log('created leaseApplicationFormData');
      leaseApplicationFormData.append("lease_property_id", property.property_id);
      leaseApplicationFormData.append("lease_status", "RENEW PROCESSING");
      leaseApplicationFormData.append("lease_renew_status", "TRUE");
      leaseApplicationFormData.append("lease_effective_date", startDate.format("MM-DD-YYYY"));
      leaseApplicationFormData.append("lease_start", startDate.format("MM-DD-YYYY"));
      leaseApplicationFormData.append("lease_end", endDate.format("MM-DD-YYYY"));
      leaseApplicationFormData.append("lease_fees", JSON.stringify(fees));
      leaseApplicationFormData.append("lease_move_in_date", moveInDate.format("MM-DD-YYYY"));
      leaseApplicationFormData.append("lease_end_notice_period", endLeaseNoticePeriod);
      leaseApplicationFormData.append("lease_m2m", leaseContinueM2M === true ? 1 : 0);
      // if(deleteFees?.length > 0){
      //   leaseApplicationFormData.append("delete_fees", JSON.stringify(deleteFees));
      // }

      if (deletedDocsUrl && deletedDocsUrl?.length !== 0) {
        leaseApplicationFormData.append("delete_documents", JSON.stringify(deletedDocsUrl));
      }

      if (isPreviousFileChange) {
        leaseApplicationFormData.append("lease_documents", JSON.stringify(leaseDocuments));
      }

      leaseApplicationFormData.append("lease_adults", JSON.stringify(leaseAdults));
      leaseApplicationFormData.append("lease_children", JSON.stringify(leaseChildren));
      leaseApplicationFormData.append("lease_pets", JSON.stringify(leasePets));
      leaseApplicationFormData.append("lease_vehicles", JSON.stringify(leaseVehicles));
      const updatedUtilitiesArray = createUpdatedUtilitesArray(mappedUtilitiesPaidBy);
      const utilitiesJSONString = JSON.stringify(updatedUtilitiesArray);
      leaseApplicationFormData.append("lease_utilities", utilitiesJSONString);

      let date = new Date();
      leaseApplicationFormData.append("lease_application_date", formatDate(date.toLocaleDateString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })));
      // console.log('before tenant id leaseApplicationFormData', property);
      if (property?.tenants) {
        try {
          // Safely parse the tenants data
          const parsedData = JSON.parse(property.tenants);

          // Collect all tenant_uid as an array
          let tenantUIDs = parsedData.map((tenant) => tenant.tenant_uid);

          // Log for debugging
          // console.log('Collected tenant UIDs:', tenantUIDs);

          // Append tenant_uid array to the form data as a list of array
          if (lease?.lease_status === "RENEW NEW") {
            leaseApplicationFormData.append("lease_assigned_contacts", JSON.stringify(tenantUIDs));
          } else {
            leaseApplicationFormData.append("tenant_uid", tenantUIDs.join(","));
          }
        } catch (error) {
          // Handle JSON parse errors
          // console.error("Error parsing tenants data: ", error);

          // Append the property.tenant_uid as fallback
          if (lease?.lease_status === "RENEW NEW") {
            leaseApplicationFormData.append("lease_assigned_contacts", JSON.stringify([property.tenant_uid]));
          } else {
            leaseApplicationFormData.append("tenant_uid", property.tenant_uid);
          }
        }
      } else {
        // If 'tenants' field is not available, append property.tenant_uid as a single value array
        if (lease?.lease_status === "RENEW NEW") {
          leaseApplicationFormData.append("lease_assigned_contacts", JSON.stringify([property.tenant_uid]));
        } else if (lease?.lease_status === "ACTIVE") {
          leaseApplicationFormData.append("lease_assigned_contacts", JSON.stringify([property.tenant_uid]));
          leaseApplicationFormData.append("tenant_uid", property?.tenant_uid);
        } else {
          leaseApplicationFormData.append("tenant_uid", property?.tenant_uid);
        }
      }

      const hasMissingType = !checkFileTypeSelected();
      // console.log("HAS MISSING TYPE", hasMissingType);

      if (hasMissingType) {
        // console.log('inside hasMissingType');
        setShowMissingFileTypePrompt(true);
        setShowSpinner(false);
        return;
      }

      let documentsDetails = [];
      let index = -1;

      if (leaseFiles.length) {
        // console.log('inside leaseFiles.length');

        [...leaseFiles].forEach((file, i) => {
          index += 1;
          leaseApplicationFormData.append(`file_${index}`, file, file.name);
          const fileType = leaseFileTypes[i] || "";
          const documentObject = {
            // file: file,
            fileIndex: index, //may not need fileIndex - will files be appended in the same order?
            fileName: file.name, //may not need filename
            contentType: fileType,
          };
          documentsDetails.push(documentObject);
        });
        // leaseleaseFormData.append("lease_documents_details", JSON.stringify(documentsDetails));
      }

      if (lease?.lease_status === "RENEW NEW") {
        leaseApplicationFormData.append("lease_uid", lease.lease_uid);
        await fetch(`${APIConfig.baseURL.dev}/leaseApplication`, {
          method: "PUT",
          body: leaseApplicationFormData,
        });
      } else {
        const leaseApplicationUpdateFormData = new FormData();
        leaseApplicationUpdateFormData.append("lease_uid", lease.lease_uid);
        leaseApplicationUpdateFormData.append("lease_renew_status", "PM RENEW REQUESTED");

        await fetch(`${APIConfig.baseURL.dev}/leaseApplication`, {
          method: "PUT",
          body: leaseApplicationUpdateFormData,
        });

        if (leaseDocuments && leaseDocuments.length !== 0) {
          [...leaseDocuments].forEach((file, i) => {
            index++;
            const documentObject = {
              link: file.link,
              fileType: file.fileType,
              filename: file.filename,
              contentType: file.contentType,
            };
            leaseApplicationFormData.append(`file_${index}`, JSON.stringify(documentObject));
          });
        }

        leaseDocuments.forEach((doc) => {
          documentsDetails.push(doc);
        });

        leaseApplicationFormData.append("lease_documents_details", JSON.stringify(documentsDetails));

        // console.log("---DEBUG --- leaseapplication form data ---");
        // for (let [key, value] of leaseApplicationFormData.entries()) {
        //   console.log(`${key}: ${value}`);
        // }

        await fetch(`${APIConfig.baseURL.dev}/leaseApplication`, {
          method: "POST",
          body: leaseApplicationFormData,
        });
      }

      if (!Array.isArray(lease.tenants) || lease.tenants.length === 0) {
        sendAnnouncements(lease.tenant_uid)
      } else {
        lease.tenants.forEach((tenant) => {
          if (tenant?.tenant_uid) {
            sendAnnouncements(tenant.tenant_uid);
          }
        });
      }

      navigate("/managerDashboard");
      setShowSpinner(false);
    } catch (error) {
      // console.log("Error Creating Lease:", error);
      alert("We were unable to Text the Property Manager but we were able to send them a notification through the App");

      navigate("/managerDashboard");
      setShowSpinner(false);
    }
  };

  const [newUtilities, setNewUtilities] = useState([]);
  const [utilities, setUtilities] = useState([]);
  const [remainingUtils, setRemainingUtils] = useState([]);

  const handleNewUtilityChange = (e, newUtility, utilityIndex) => {
    const { value } = e.target;
    setNewUtilities((prevUtilities) => {
      const updatedUtilities = [...prevUtilities];
      const toChange = { ...updatedUtilities[utilityIndex], utility_payer_id: value === "owner" ? "050-000280" : "050-000282" };
      updatedUtilities[utilityIndex] = toChange;
      return updatedUtilities;
    });
  };

  // Fetch utilities data when loading the component
  useEffect(() => {
    const utils = JSON.parse(property.property_utilities); // Assuming `property.property_utilities` contains the utilities data
    if (utils === null) {
      setUtilities([]);
      setNewUtilities([]);
    } else {
      setUtilities(utils);
      setNewUtilities(utils);
    }

    const newUtilityIds = utils !== null ? new Set(utils.map((utility) => utility.utility_type_id)) : null;
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
  }, [property]);

  const addTenantRow = () => {
    const newTenant = {
      id: tenants.length + 1,
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      lease_perc: 100,
    };
    setTenants((prevState) => {
      return [...prevState, newTenant];
    });
  };

  const removeTenantRow = (id) => {
    const updatedTenants = tenants.filter((tenant) => tenant.id !== id);
    setTenants(updatedTenants);
  };

  const handleTenantChange = (event, id) => {
    const { name, value } = event.target;

    const updatedTenants = tenants.map((tenant) => {
      if (tenant.id === id) {
        const updatedTenant = { ...tenant, [name]: value };

        return updatedTenant;
      }
      return tenant;
    });

    setTenants(updatedTenants);
  };

  const getLeaseStatusText = (status, renewStatus) => {
    console.log("ROHIT - 1638 - status - ", status, renewStatus);
    switch (status) {
      case "RENEW PROCESSING":
        return "Extended";
      case "WITHDRAWN":
        return "Withdrawn";
      case "REFUSED":
        return "Refused";
      case "RENEW REFUSED":
        return "Refused";
      case "REJECTED":
        return "Rejected";
      case "RENEW REJECTED":
        return "Rejected";
      case "RESCIND":
        return "Rescinded";
      case "RENEW RESCINDED":
        return "Rescinded";
      case "APPROVED":
        if (renewStatus == null || renewStatus === "EARLY TERMINATION") {
          return "Approved";
        } else {
          return "Renewed";
        }

    }
  }

  const handleDatesRadioChange = (value) => {
    console.log("Selected value:", value);
    // Add your logic here based on the selected radio button
    setDatesToggle(value);
  };


  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ backgroundColor: "#F2F2F2", borderRadius: "10px", margin: "10px", padding: "15px", fontFamily: "Source Sans Pro" }}>
        <Grid item xs={11} textAlign='center' sx={{ paddingTop: "5px" }}>
          <Typography
            sx={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#160449",
            }}
          >
            {"New Tenant Lease"}
          </Typography>
        </Grid>
        {/* Single Property Image */}
        <Box sx={{ marginBottom: "20px", textAlign: "center" }}>
          <Box sx={{ display: "inline-block", width: "130px", height: "130px", backgroundColor: "grey" }}>
            <img src={propertyImage ? propertyImage : defaultHouseImage} alt='Property Image' style={{ width: "100%", height: "100%", borderRadius: "10px" }} />
          </Box>
        </Box>

        {/* Property Address */}
        <Box sx={{ textAlign: "center", marginBottom: "20px" }}>
          <Typography variant='h6' sx={{ fontWeight: "bold" }}>
            {property.property_address}, {property.property_city}, {property.property_state} {property.property_zip}
          </Typography>
        </Box>

        {/* Lease Details Section */}
        <Paper sx={{ marginBottom: "20px", marginTop: "20px", borderRadius: "10px", backgroundColor: theme.palette.form.main }}>
          <Accordion defaultExpanded sx={{ backgroundColor: theme.palette.form.main, marginBottom: "20px", marginTop: "20px", borderRadius: "10px" }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='h6' sx={{ fontWeight: "bold" }}>
                Lease Details (UID: {lease.lease_uid})
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ padding: "20px", borderRadius: "10px" }}>
              {/* First row: Owner, Tenant, Rent Status */}
              <Grid container spacing={4} sx={{ marginBottom: "20px" }} alignItems='center'>
                <Grid item xs={6} sm={3}>
                  <Typography sx={{ fontSize: "14px", fontWeight: "bold", color: "#302A68" }}>Owner</Typography>
                  <Typography sx={{ fontSize: "14px", fontWeight: "400", color: "#302A68" }}>
                    {property.owner_first_name} {property.owner_last_name}
                  </Typography>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Typography sx={{ fontSize: "14px", fontWeight: "bold", color: "#302A68" }}>Tenant</Typography>
                  <Typography sx={{ fontSize: "14px", fontWeight: "400", color: "#302A68" }}>
                    {property?.tenant_first_name ? property?.tenant_first_name : "No Tenant"} {property?.tenant_last_name ? property?.tenant_last_name : ""}
                  </Typography>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Typography sx={{ fontSize: "14px", fontWeight: "bold", color: "#302A68" }}>Rent Status</Typography>
                  <Typography sx={{ fontSize: "14px", fontWeight: "400", color: "#302A68" }}>{property.rent_status}</Typography>
                </Grid>
              </Grid>

              {/* Second row: Start Date, End Date, Move-In Date, End Lease Notice */}
              <Grid container spacing={4} alignItems='center'>
                <Grid item xs={6} sm={3}>
                  <Typography sx={{ fontSize: "14px", fontWeight: "bold", color: "#302A68" }}>Start Date</Typography>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      value={startDate}
                      onChange={(newValue) => {
                        setDatesToggle("select");
                        handleStartDateChange(newValue);
                      }}
                      slots={{
                        openPickerIcon: CalendarIcon,
                      }}
                      slotProps={{
                        textField: {
                          size: "small",
                          style: {
                            width: "100%",
                            fontSize: 12,
                            backgroundColor: "#FFFFFF",
                            borderRadius: "10px",
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Typography sx={{ fontSize: "14px", fontWeight: "bold", color: "#302A68" }}>End Date</Typography>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      value={endDate}
                      minDate={startDate}
                      onChange={(newValue) => {
                        setDatesToggle("select");
                        handleEndDateChange(newValue);
                      }}
                      slots={{
                        openPickerIcon: CalendarIcon,
                      }}
                      variant='desktop'
                      slotProps={{
                        textField: {
                          size: "small",
                          style: {
                            width: "100%",
                            fontSize: 12,
                            backgroundColor: "#FFFFFF",
                            borderRadius: "10px",
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Typography sx={{ fontSize: "14px", fontWeight: "bold", color: "#302A68" }}>Move-In Date</Typography>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      value={moveInDate}
                      minDate={startDate}
                      onChange={(newValue) => {
                        setDatesToggle("select");
                        handleMoveInDateChange(newValue);
                      }}
                      slots={{
                        openPickerIcon: CalendarIcon,
                      }}
                      variant='desktop'
                      slotProps={{
                        textField: {
                          size: "small",
                          style: {
                            width: "100%",
                            fontSize: 12,
                            backgroundColor: "#FFFFFF",
                            borderRadius: "10px",
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Typography sx={{ fontSize: "14px", fontWeight: "bold", color: "#302A68" }}>End Lease Notice</Typography>
                  <TextField
                    name='endLeaseNoticePeriod'
                    value={endLeaseNoticePeriod}
                    onChange={(e) => setEndLeaseNoticePeriod(e.target.value)}
                    variant='outlined' // Use outlined for a similar look
                    fullWidth
                    size='small'
                    placeholder=''
                    InputProps={{
                      style: {
                        fontSize: 14, // Adjust font size
                        padding: "2px", // Adjust padding to make it look like the date picker
                        backgroundColor: "#FFFFFF",
                        borderRadius: "10px", // Rounded corners like the date picker
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": {
                          borderColor: "#6e6e6e", // Same hover behavior
                        },
                      },
                      width: "100%",
                      backgroundColor: "#FFFFFF", // Background same as date picker
                      borderRadius: "10px", // Same rounded corners
                    }}
                  />
                </Grid>
              </Grid>
              {
                (!(["NEW", "PROCESSING", "WITHDRAWN", "REJECTED",].includes(lease.lease_status))) && (
                  <Grid container item xs={12} sx={{ marginTop: "10px", justifyContent: "space-evenly" }}>
                    <Grid item container direction='row' xs={12}>
                      <Grid item xs={12} sx={{ marginTop: "5px", justifyContent: "flex-start" }}>
                        <FormControl>

                          <RadioGroup
                            row
                            sx={{
                              '& .MuiFormControlLabel-root': {
                                marginRight: '20px',
                              },
                            }}
                            aria-labelledby="dates-radio-buttons-group-label"
                            defaultValue="female"
                            name="radio-buttons-group"
                            value={datesToggle}
                            onChange={(event) => handleDatesRadioChange(event.target.value)}
                          >
                            <FormControlLabel
                              value="select"
                              control={<Radio />}
                              label={
                                <Typography
                                  sx={{
                                    color: "#160449",
                                    fontWeight: "bold",
                                    fontSize: "14px",
                                  }}
                                >
                                  Select New Lease Dates
                                </Typography>
                              }

                            />
                            {
                              property?.lease_status != null && (
                                <FormControlLabel
                                  value="active_lease"
                                  control={<Radio />}
                                  label={
                                    <Typography
                                      sx={{
                                        color: "#160449",
                                        fontWeight: "bold",
                                        fontSize: "14px",
                                      }}
                                    >
                                      Dates from Active Lease: {property?.lease_uid}
                                    </Typography>
                                  }
                                />
                              )
                            }
                            {
                              lease?.lease_status != "RENEW NEW" || lease?.lease_status !== "ACTIVE" && (


                                <FormControlLabel
                                  value="current_lease"
                                  control={<Radio />}
                                  label={
                                    <Typography
                                      sx={{
                                        color: "#160449",
                                        fontWeight: "bold",
                                        fontSize: "14px",
                                      }}
                                    >
                                      {`Dates from ${getLeaseStatusText(lease.lease_status, lease.lease_renew_status)} Lease: ${lease?.lease_uid}`}
                                    </Typography>
                                  }
                                />
                              )
                            }
                          </RadioGroup>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Grid>
                )
              }
              <Grid container item xs={12} sx={{ marginTop: "10px", justifyContent: "space-evenly" }}>
                <Grid item container direction='row' xs={12}>
                  <Grid item xs={12} sx={{ marginTop: "5px", justifyContent: "flex-start" }}>
                    <FormControlLabel
                      sx={
                        {
                          // marginTop: '25px',
                        }
                      }
                      control={
                        <Checkbox
                          checked={leaseContinueM2M}
                          onChange={(event) => {
                            if (event.target.checked) {
                              setLeaseContinueM2M(true);
                            } else {
                              setLeaseContinueM2M(false);
                            }
                          }}
                          inputProps={{ "aria-label": "controlled" }}
                        />
                      }
                      label='Lease Renews Month-to-Month'
                      componentsProps={{
                        typography: {
                          sx: {
                            color: "#160449",
                            fontWeight: "bold",
                            fontSize: "14px",
                          },
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Paper>
        <Paper sx={{ marginBottom: "20px", marginTop: "20px", borderRadius: "10px", backgroundColor: theme.palette.form.main }}>
          <Accordion sx={{ backgroundColor: theme.palette.form.main, marginBottom: "20px", marginTop: "20px", borderRadius: "10px" }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='h6' sx={{ fontWeight: "bold" }}>
                Tenant Details
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ paddingLeft: "15px", paddingRight: "15px", paddingBottom: "20px", borderRadius: "10px" }}>
              {/* Display tenant details */}
              {page !== "refer_tenant" && (
                <>
                  {/* {console.log('--application details in tenant---', application)}
          {console.log('--property details in tenant---', property)} */}

                  {/* Check if managerInitiatedRenew is true */}
                  {managerInitiatedRenew && lease.tenants ? (
                    // Parse tenants if managerInitiatedRenew is true
                    (() => {
                      try {
                        const parsedTenants = JSON.parse(lease.tenants);

                        return parsedTenants.length > 0 ? (
                          parsedTenants.map((tenant, index) => (
                            <Grid container spacing={2} key={index} sx={{ marginBottom: "20px" }}>
                              <Grid item xs={6}>
                                <Typography sx={{ fontWeight: "bold" }}>First Name:</Typography>
                                <Typography>{tenant.tenant_first_name || "N/A"}</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography sx={{ fontWeight: "bold" }}>Last Name:</Typography>
                                <Typography>{tenant.tenant_last_name || "N/A"}</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography sx={{ fontWeight: "bold" }}>Email:</Typography>
                                <Typography>{tenant.tenant_email || "N/A"}</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography sx={{ fontWeight: "bold" }}>Phone Number:</Typography>
                                <Typography>{tenant.tenant_phone_number || "N/A"}</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography sx={{ fontWeight: "bold" }}>Responsibility:</Typography>
                                <Typography>{tenant.lt_responsibility ? `${tenant.lt_responsibility * 100}%` : "N/A"}</Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography sx={{ fontWeight: "bold" }}>Address:</Typography>
                                <Typography>
                                  {lease.tenant_address || "N/A"}, {lease.tenant_city || "N/A"}, {lease.tenant_state || "N/A"}, {lease.tenant_zip || "N/A"}
                                </Typography>
                              </Grid>
                            </Grid>
                          ))
                        ) : (
                          <Typography>No Tenant Data Available</Typography>
                        );
                      } catch (error) {
                        console.error("Error parsing tenant data:", error);
                        return <Typography>Invalid Tenant Data</Typography>;
                      }
                    })()
                  ) : // Display data from `application` directly if `managerInitiatedRenew` is false
                    lease ? (
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography sx={{ fontWeight: "bold" }}>First Name:</Typography>
                          <Typography>{lease.tenant_first_name || "N/A"}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography sx={{ fontWeight: "bold" }}>Last Name:</Typography>
                          <Typography>{lease.tenant_last_name || "N/A"}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography sx={{ fontWeight: "bold" }}>Email:</Typography>
                          <Typography>{lease.tenant_email || "N/A"}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography sx={{ fontWeight: "bold" }}>Phone Number:</Typography>
                          <Typography>{lease.tenant_phone_number || "N/A"}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography sx={{ fontWeight: "bold" }}>Address:</Typography>
                          <Typography>
                            {lease.tenant_address || "N/A"}, {lease.tenant_city || "N/A"}, {lease.tenant_state || "N/A"}, {lease.tenant_zip || "N/A"}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography sx={{ fontWeight: "bold" }}>Responsibility:</Typography>
                          <Typography>{lease.lt_responsibility ? `${lease.lt_responsibility * 100}%` : "N/A"}</Typography>
                        </Grid>
                      </Grid>
                    ) : (
                      <Typography>No Tenant Data Available</Typography>
                    )}
                </>
              )}
              {page === "refer_tenant" && (
                <>
                  <Grid container direction='column' sx={{ marginTop: "10px" }}>
                    <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                      <Grid item xs={2.5}>
                        <Stack spacing={-2} m={2}>
                          <Typography
                            sx={{
                              color: theme.typography.common.blue,
                              fontWeight: theme.typography.primary.fontWeight,
                            }}
                          >
                            {"First Name"}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={2.5}>
                        <Stack spacing={-2} m={2}>
                          <Typography
                            sx={{
                              color: theme.typography.common.blue,
                              fontWeight: theme.typography.primary.fontWeight,
                            }}
                          >
                            {"Last Name"}
                          </Typography>
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
                            {"Email"}
                          </Typography>
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
                            {"Phone Number"}
                          </Typography>
                        </Stack>
                      </Grid>

                      <Grid item xs={1.5}>
                        <Stack spacing={-2} m={2}>
                          <Typography
                            sx={{
                              color: theme.typography.common.blue,
                              fontWeight: theme.typography.primary.fontWeight,
                            }}
                          >
                            {"Lease %"}
                          </Typography>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Grid>
                  {tenants?.map((row, index) => (
                    <>
                      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} key={row.id}>
                        <Grid item xs={2.5}>
                          <Stack spacing={-2} m={2}>
                            <TextField
                              name='first_name'
                              value={row.first_name}
                              variant='filled'
                              fullWidth
                              className={classes.textField}
                              onChange={(e) => handleTenantChange(e, row.id)}
                              InputProps={{
                                style: {
                                  fontSize: 14,
                                  borderRadius: "5px",
                                },
                              }}
                            />
                          </Stack>
                        </Grid>
                        <Grid item xs={2.5}>
                          <Stack spacing={-2} m={2}>
                            <TextField
                              name='last_name'
                              value={row.last_name}
                              variant='filled'
                              fullWidth
                              className={classes.textField}
                              onChange={(e) => handleTenantChange(e, row.id)}
                              InputProps={{
                                style: {
                                  fontSize: 14,
                                  borderRadius: "5px",
                                },
                              }}
                            />
                          </Stack>
                        </Grid>

                        <Grid item xs={3}>
                          <Stack spacing={-2} m={2}>
                            <TextField
                              name='email'
                              value={row.email}
                              variant='filled'
                              fullWidth
                              className={classes.textField}
                              onChange={(e) => handleTenantChange(e, row.id)}
                              InputProps={{
                                style: {
                                  fontSize: 14,
                                  borderRadius: "5px",
                                },
                              }}
                            />
                          </Stack>
                        </Grid>
                        <Grid item xs={2}>
                          <Stack spacing={-2} m={2}>
                            <TextField
                              name='phone_number'
                              value={row.phone_number}
                              variant='filled'
                              fullWidth
                              className={classes.textField}
                              onChange={(e) => handleTenantChange(e, row.id)}
                              InputProps={{
                                style: {
                                  fontSize: 14,
                                  borderRadius: "5px",
                                },
                              }}
                            />
                          </Stack>
                        </Grid>

                        <Grid item xs={1.5}>
                          <Stack spacing={-2} m={2}>
                            <TextField
                              name='lease_perc'
                              value={row.lease_perc}
                              variant='filled'
                              fullWidth
                              // placeholder='15'
                              className={classes.textField}
                              onChange={(e) => handleTenantChange(e, row.id)}
                              sx={
                                {
                                  // paddingBottom: '15px',
                                }
                              }
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment
                                    position='end'
                                    sx={{
                                      marginTop: "15px",
                                    }}
                                  >
                                    %
                                  </InputAdornment>
                                ),
                                sx: {
                                  height: "30px",
                                },
                                style: {
                                  fontSize: 14,
                                  borderRadius: "5px",
                                },
                              }}
                            />
                          </Stack>
                        </Grid>

                        <Grid container justifyContent='center' alignContent='center' item xs={0.5}>
                          <Button
                            aria-label='delete'
                            sx={{
                              color: "#000000",
                              fontWeight: "bold",
                              "&:hover": {
                                color: "#FFFFFF",
                              },
                            }}
                            onClick={() => removeTenantRow(row.id)}
                          >
                            <DeleteIcon sx={{ fontSize: 25, color: "#3D5CAC" }} />
                          </Button>
                        </Grid>
                      </Grid>
                    </>
                  ))}
                  <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} sx={{ paddingLeft: "10px", marginTop: "20px" }}>
                    <IconButton
                      aria-label='delete'
                      sx={{
                        backgroundColor: "#3D5CAC",
                        color: "#FFFFFF",
                        width: "80px",
                        borderRadius: "5px",
                        "&:hover": {
                          backgroundColor: "#160449",
                        },
                      }}
                      onClick={addTenantRow}
                    >
                      <AddIcon />
                    </IconButton>
                  </Grid>
                </>
              )}
            </AccordionDetails>
          </Accordion>
        </Paper>

        <Paper sx={{ marginBottom: "20px", marginTop: "20px", borderRadius: "10px", backgroundColor: theme.palette.form.main }}>
          <Accordion sx={{ backgroundColor: theme.palette.form.main, marginBottom: "20px", marginTop: "20px", borderRadius: "10px" }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='h6' sx={{ fontWeight: "bold" }}>
                Income Details
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ padding: "20px", borderRadius: "10px" }}>
              {page !== "refer_tenant" && (
                <>
                  {lease?.lease_income ? (
                    <>
                      {/* Parse the JSON string and map the income details */}
                      {JSON.parse(lease.lease_income).map((income, index) => (
                        <Grid container spacing={2} key={index}>
                          <Grid item xs={6}>
                            <Typography sx={{ fontWeight: "bold" }}>Company name:</Typography>
                            <Typography>{income.companyName || "N/A"}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography sx={{ fontWeight: "bold" }}>Job Title:</Typography>
                            <Typography>{income.jobTitle || "N/A"}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography sx={{ fontWeight: "bold" }}>Amount:</Typography>
                            <Typography>{income.salary || "N/A"}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography sx={{ fontWeight: "bold" }}>Amount Frequency:</Typography>
                            <Typography>{income.frequency || "N/A"}</Typography>
                          </Grid>
                        </Grid>
                      ))}
                    </>
                  ) : (
                    <Typography>No Income Data Available</Typography>
                  )}
                </>
              )}
              {page === "refer_tenant" && (
                <>
                  <Grid container direction='column' sx={{ marginTop: "10px" }}>
                    <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                      <Grid item xs={2.5}>
                        <Stack spacing={-2} m={2}>
                          <Typography
                            sx={{
                              color: theme.typography.common.blue,
                              fontWeight: theme.typography.primary.fontWeight,
                            }}
                          >
                            {"Company Name"}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={2.5}>
                        <Stack spacing={-2} m={2}>
                          <Typography
                            sx={{
                              color: theme.typography.common.blue,
                              fontWeight: theme.typography.primary.fontWeight,
                            }}
                          >
                            {"Job Title"}
                          </Typography>
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
                            {"Salary"}
                          </Typography>
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
                            {"Frequency"}
                          </Typography>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Grid>
                  {tenants?.map((row, index) => (
                    <>
                      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} key={row.id}>
                        <Grid item xs={2.5}>
                          <Stack spacing={-2} m={2}>
                            <TextField
                              name='company_name'
                              value={row.company_name}
                              variant='filled'
                              fullWidth
                              className={classes.textField}
                              onChange={(e) => handleTenantChange(e, row.id)}
                              InputProps={{
                                style: {
                                  fontSize: 14,
                                  borderRadius: "5px",
                                },
                              }}
                            />
                          </Stack>
                        </Grid>
                        <Grid item xs={2.5}>
                          <Stack spacing={-2} m={2}>
                            <TextField
                              name='job_title'
                              value={row.job_title}
                              variant='filled'
                              fullWidth
                              className={classes.textField}
                              onChange={(e) => handleTenantChange(e, row.id)}
                              InputProps={{
                                style: {
                                  fontSize: 14,
                                  borderRadius: "5px",
                                },
                              }}
                            />
                          </Stack>
                        </Grid>

                        <Grid item xs={3}>
                          <Stack spacing={-2} m={2}>
                            <TextField
                              name='salary'
                              value={row.salary}
                              variant='filled'
                              fullWidth
                              className={classes.textField}
                              onChange={(e) => handleTenantChange(e, row.id)}
                              InputProps={{
                                style: {
                                  fontSize: 14,
                                  borderRadius: "5px",
                                },
                              }}
                            />
                          </Stack>
                        </Grid>
                        <Grid item xs={2}>
                          <Stack spacing={-2} m={2}>
                            <TextField
                              name='salary_frequency'
                              value={row.salary_frequency}
                              variant='filled'
                              fullWidth
                              className={classes.textField}
                              onChange={(e) => handleTenantChange(e, row.id)}
                              InputProps={{
                                style: {
                                  fontSize: 14,
                                  borderRadius: "5px",
                                },
                              }}
                            />
                          </Stack>
                        </Grid>
                      </Grid>
                    </>
                  ))}
                </>
              )}
            </AccordionDetails>
          </Accordion>
        </Paper>

        {/* Occupancy Details Section */}
        <Paper sx={{ marginBottom: "20px", marginTop: "20px", borderRadius: "10px", backgroundColor: theme.palette.form.main }}>
          <Accordion sx={{ backgroundColor: theme.palette.form.main, marginBottom: "20px", marginTop: "20px" }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='h6' sx={{ fontWeight: "bold" }}>
                Occupancy Details
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {page !== "refer_tenant" && (
                <Box sx={{ padding: "10px", overflowX: "auto" }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant='subtitle1' sx={{ fontWeight: "bold" }}>
                        Adults
                      </Typography>
                      <OccupantsDataGrid data={leaseAdults} />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant='subtitle1' sx={{ fontWeight: "bold" }}>
                        Children
                      </Typography>
                      <OccupantsDataGrid data={leaseChildren} />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant='subtitle1' sx={{ fontWeight: "bold" }}>
                        Pets
                      </Typography>
                      <PetsDataGrid data={leasePets} />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant='subtitle1' sx={{ fontWeight: "bold" }}>
                        Vehicles
                      </Typography>
                      <VehiclesDataGrid data={leaseVehicles} />
                    </Grid>
                  </Grid>
                </Box>
              )}
              {page === "refer_tenant" && (
                <>
                  {adults && (
                    <AdultOccupant
                      leaseAdults={adults}
                      setLeaseAdults={setAdults}
                      relationships={relationships}
                      editOrUpdateLease={editOrUpdateTenant}
                      adultsRef={adultsRef}
                      modifiedData={modifiedData}
                      setModifiedData={setModifiedData}
                      dataKey={"lease_adult_occupants"}
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
                      dataKey={"lease_children_occupants"}
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
                      dataKey={"lease_pet_occupants"}
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
                      dataKey={"lease_vehicle_info"}
                      ownerOptions={[...adults, ...children]}
                      isEditable={true}
                    />
                  )}
                </>
              )}
            </AccordionDetails>
          </Accordion>
        </Paper>
        {/* Fees Section */}
        <Paper sx={{ marginBottom: "20px", marginTop: "20px", borderRadius: "10px", backgroundColor: theme.palette.form.main }}>
          <Accordion sx={{ backgroundColor: theme.palette.form.main, marginBottom: "20px", marginTop: "20px" }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='h6' sx={{ fontWeight: "bold" }}>
                Fees
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ paddingLeft: "15px", paddingRight: "15px" }}>
              <LeaseFees startDate={startDate} leaseFees={fees} isEditable={true} setLeaseFees={setFees} setDeleteFees={setDeleteFees} titleFontSize={"16px"} />
            </AccordionDetails>
          </Accordion>
        </Paper>
        {/* Documents Section */}
        <Paper sx={{ marginBottom: "20px", marginTop: "20px", borderRadius: "10px", backgroundColor: theme.palette.form.main }}>
          <Accordion sx={{ backgroundColor: theme.palette.form.main, marginBottom: "20px", marginTop: "20px", borderRadius: "10px" }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='h6' sx={{ fontWeight: "bold" }}>
                Documents
              </Typography>
            </AccordionSummary>

            <AccordionDetails>
              <Box sx={{ paddingLeft: "10px", paddingRight: "10px" }}>
                <Documents
                  setIsPreviousFileChange={setIsPreviousFileChange}
                  customName={"Tenant Documents"}
                  documents={leaseDocuments}
                  setDocuments={setLeaseDocuments}
                  deletedDocsUrl={deletedDocsUrl}
                  setDeleteDocsUrl={setDeletedDocsUrl}
                  contractFiles={leaseFiles}
                  setContractFiles={setLeaseFiles}
                  contractFileTypes={leaseFileTypes}
                  setContractFileTypes={setLeaseFileTypes}
                  isAccord={false}
                  isEditable={true}
                  titleFontSize={"16px"}
                />
              </Box>
            </AccordionDetails>
          </Accordion>
        </Paper>
        <Paper sx={{ marginBottom: "20px", marginTop: "20px", borderRadius: "10px", backgroundColor: theme.palette.form.main }}>
          <Accordion sx={{ backgroundColor: theme.palette.form.main, marginBottom: "20px", marginTop: "20px", borderRadius: "10px" }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Grid container columnSpacing={2} rowSpacing={3}>
                <Grid item xs={12}>
                  <Typography variant='h6' sx={{ fontWeight: "bold" }}>
                    Utilities
                  </Typography>
                </Grid>
              </Grid>
            </AccordionSummary>

            <AccordionDetails>
              <Grid container columnSpacing={2} rowSpacing={3} sx={{ padding: "10px" }}>
                {isDefaultUtilities && (
                  <Grid item xs={12}>
                    <Typography sx={{ fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.smallFont }}>{`<--Displaying Default Utilities!-->`}</Typography>
                  </Grid>
                )}
                {Object.entries(mappedUtilitiesPaidBy).length > 0
                  ? Object.entries(mappedUtilitiesPaidBy).map(([utility, selectedValue]) => (
                    <Fragment key={utility}>
                      <Grid item xs={6}>
                        <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.mediumFont }}>
                          {formatUtilityName(utility)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <FormControlLabel
                          value='owner'
                          control={<Radio checked={selectedValue === "owner"} onChange={() => handleUtilityChange(utility, "owner")} />}
                          label='Owner'
                        />
                        <FormControlLabel
                          value='tenant'
                          control={<Radio checked={selectedValue === "tenant"} onChange={() => handleUtilityChange(utility, "tenant")} />}
                          label='Tenant'
                        />
                      </Grid>
                    </Fragment>
                  ))
                  : Object.entries(defaultUtilities).map(([utility, selectedValue]) => (
                    <Fragment key={utility}>
                      <Grid item xs={6}>
                        <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.mediumFont }}>
                          {formatUtilityName(utility)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <FormControlLabel
                          value='owner'
                          control={<Radio checked={selectedValue === "owner"} onChange={() => handleUtilityChange(utility, "owner")} />}
                          label='Owner'
                        />
                        <FormControlLabel
                          value='tenant'
                          control={<Radio checked={selectedValue === "tenant"} onChange={() => handleUtilityChange(utility, "tenant")} />}
                          label='Tenant'
                        />
                      </Grid>
                    </Fragment>
                  ))}
                <Grid item xs={12}>
                  <Button
                    variant='outlined'
                    onClick={handleAddUtilityButtonClick}
                    sx={{
                      backgroundColor: "#3D5CAC",
                      fontWeight: theme.typography.primary.fontWeight,
                      fontSize: theme.typography.smallFont,
                      textTransform: "none",
                    }}
                  >
                    Add Utility <ArrowDropDownIcon />
                  </Button>
                  <Menu anchorEl={addUtilityAnchorElement} open={Boolean(addUtilityAnchorElement)} onClose={handleAddUtilityClose}>
                    {keysNotInUtilitiesMap.map((utility, index) => (
                      <MenuItem key={index} onClick={() => handleAddUtility(utility)}>
                        {formatUtilityName(utility)}
                      </MenuItem>
                    ))}
                  </Menu>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Paper>

        {/* Submit Button */}
        <Grid item xs={12} sx={{ textAlign: "center", paddingBottom: 5, marginBottom: "20px", marginTop: "20px" }}>
          <Button
            // onClick={application?.lease_status === "NEW" ? handleCreateLease : handleRenewLease}
            onClick={() => {
              if (lease?.lease_status === "NEW" || lease?.lease_status === "PROCESSING" || lease?.lease_status === "RENEW NEW" || lease?.lease_status === "RENEW PROCESSING" || lease?.lease_status === "APPROVED") {
                handleCreateLease(); //PUT
              } else if (lease?.lease_status === "REJECTED" || lease?.lease_status === "REFUSED" || lease?.lease_status === "RESCIND" || lease?.lease_status === "WITHDRAWN" || lease?.lease_status === "RENEW REFUSED" || lease?.lease_status === "RENEW WITHDRAWN") {
                handleCreateNewLease(); //POST
              } else if (lease?.lease_status === "ACTIVE" || lease?.lease_status === "ACTIVE M2M") {
                handleRenewLease();
              }
            }}
            sx={{
              backgroundColor: "#9EAED6",
              color: "#160449",
              textTransform: "none",
              width: "80%",
              "&:hover, &:focus, &:active": {
                backgroundColor: "#9EAED6",
              },
            }}
          >
            {(lease?.lease_status === "NEW" || lease?.lease_status === "REJECTED" || lease?.lease_status === "REFUSED" || lease?.lease_status === "RENEW REFUSED" || lease?.lease_status === "WITHDRAWN" || lease?.lease_status === "RESCIND") ? "Create Lease" : ""}
            {lease?.lease_status === "PROCESSING" ? "Modify Lease" : ""}
            {lease?.lease_status === "ACTIVE" || lease?.lease_status === "ACTIVE M2M" ? "Renew Lease" : ""}
            {lease?.lease_status === "RENEW NEW" ? "Create Lease Renewal" : ""}
            {lease?.lease_status === "RENEW PROCESSING" || lease?.lease_status === "APPROVED" ? "Modify Lease Renewal" : ""}
          </Button>
        </Grid>
      </Box>
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
    </ThemeProvider>
  );
};

const OccupantsDataGrid = ({ data }) => {
  const columns = [
    {
      field: "name",
      headerName: "First Name",
      width: 120,
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
    },
    { field: "last_name", headerName: "Last Name", width: 150, renderHeader: (params) => <strong>{params.colDef.headerName}</strong> },
    { field: "dob", headerName: "Date of Birth", width: 150, renderHeader: (params) => <strong>{params.colDef.headerName}</strong> },
    {
      field: "email",
      headerName: "Email",
      width: 120,
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
    },
    {
      field: "phone_number",
      headerName: "Phone Number",
      width: 130,
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
      renderCell: (params) => {
        const phone = params.value;

        return <Typography>{phone ? formattedPhoneNumber(phone) : "-"}</Typography>;
      },
    },
    {
      field: "tenant_ssn",
      headerName: "SSN",
      width: 120,
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
      renderCell: (params) => {
        const SSN = params.value;

        return <Typography>{SSN ? SSN : "-"}</Typography>;
      },
    },
    {
      field: "relationship",
      headerName: "Relationship",
      width: 150,
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
    },
  ];

  // console.log("FeesDataGrid - props.data - ", data);
  const dataWithIds = data.map((row, index) => ({ ...row, id: index }));

  return (
    <>
      <DataGrid
        rows={dataWithIds}
        getRowId={(row) => row.id}
        columns={columns}
        sx={
          {
            // border: "0px",
            // marginTop: '10px',
          }
        }
        hideFooter={true}
      />
    </>
  );
};

const PetsDataGrid = ({ data }) => {
  const columns = [
    { field: "name", headerName: "First Name", width: 120, renderHeader: (params) => <strong>{params.colDef.headerName}</strong> },
    { field: "last_name", headerName: "Last Name", width: 150, renderHeader: (params) => <strong>{params.colDef.headerName}</strong> },
    { field: "type", headerName: "Type", width: 150, renderHeader: (params) => <strong>{params.colDef.headerName}</strong> },
    { field: "breed", headerName: "Breed", width: 150, renderHeader: (params) => <strong>{params.colDef.headerName}</strong> },
    {
      field: "weight",
      headerName: "Weight",
      width: 150,
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
      renderCell: (params) => {
        const weight = params.value;

        return <Typography>{weight} lbs</Typography>;
      },
    },
    {
      field: "owner",
      headerName: "Owner",
      width: 150,
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
    },
  ];

  // console.log("FeesDataGrid - props.data - ", data);
  const dataWithIds = data.map((row, index) => ({ ...row, id: index }));

  return (
    <>
      <DataGrid
        rows={dataWithIds}
        getRowId={(row) => row.id}
        columns={columns}
        sx={
          {
            // border: "0px",
            // marginTop: '10px',
          }
        }
        hideFooter={true}
      />
    </>
  );
};

const VehiclesDataGrid = ({ data }) => {
  const columns = [
    { field: "year", headerName: "Year", width: 150, renderHeader: (params) => <strong>{params.colDef.headerName}</strong> },
    { field: "make", headerName: "Make", width: 120, renderHeader: (params) => <strong>{params.colDef.headerName}</strong> },
    { field: "model", headerName: "Model", width: 150, renderHeader: (params) => <strong>{params.colDef.headerName}</strong> },
    { field: "owner", headerName: "Owner", width: 150, renderHeader: (params) => <strong>{params.colDef.headerName}</strong> },
    { field: "license", headerName: "License", width: 150, renderHeader: (params) => <strong>{params.colDef.headerName}</strong> },
    {
      field: "state",
      headerName: "State",
      width: 150,
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
    },
  ];

  // console.log("FeesDataGrid - props.data - ", data);
  const dataWithIds = data.map((row, index) => ({ ...row, id: index }));

  return (
    <>
      <DataGrid
        rows={dataWithIds}
        getRowId={(row) => row.id}
        columns={columns}
        sx={
          {
            // border: "0px",
            // marginTop: '10px',
          }
        }
        hideFooter={true}
      />
    </>
  );
};

export default TenantLease;
