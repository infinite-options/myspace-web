import { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import theme from "../../theme/theme";
import { ThemeProvider } from "@mui/material";
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
import { DataGrid } from '@mui/x-data-grid';
import { maskSSN, maskEIN, formattedPhoneNumber } from "../utils/privacyMasking";

import APIConfig from "../../utils/APIConfig";
import Documents from "../Leases/Documents";
import { getDateAdornmentString } from "../../utils/dates";

import ListsContext from "../../contexts/ListsContext";
import LeaseFees from "../Leases/LeaseFees";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Slider from "react-slick";  // Add react-slick for image slider

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiFilledInput-root": {
      backgroundColor: "#D6D5DA !important",
      borderRadius: "10px !import",
      height: "30px !important",
      marginBlock: 10,
      paddingBottom: "15px !important",
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
  console.log("--debug-- property", property);
  console.log("--debug-- application", application);
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
      due_by: application.lease_rent_due_by,
      late_by: application.lease_rent_late_by,
      late_fee: "50",
      perDay_late_fee: "10",
      available_topay: application.lease_rent_available_topay,
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
  const { application, property } = state;
  const { getList, } = useContext(ListsContext);	
	const feeFrequencies = getList("frequency");
  console.log("Property: ", property);
  console.log("Application: ", application);
  const [showSpinner, setShowSpinner] = useState(false);
  const [startDate, setStartDate] = useState(application.lease_start ? dayjs(application.lease_start) : dayjs());
  const [endDate, setEndDate] = useState(application.lease_end ? dayjs(application.lease_end) : dayjs().add(1, "year").subtract(1, "day"));
  const [moveInDate, setMoveInDate] = useState(dayjs()); // fix me

  const [noOfOccupants, setNoOfOccupants] = useState(1);
  const [endLeaseNoticePeriod, setEndLeaseNoticePeriod] = useState(application.lease_end_notice_period ? application.lease_end_notice_period : 30);

  const [leaseAdults, setLeaseAdults ] = useState([]);
  const [leaseChildren, setLeaseChildren ] = useState([]);
  const [leasePets, setLeasePets ] = useState([]);
  const [leaseVehicles, setLeaseVehicles ] = useState([]);
  const [deletedDocsUrl, setDeletedDocsUrl] = useState([])
  const [isPreviousFileChange, setIsPreviousFileChange] = useState(false)
  const [deleteFees, setDeleteFees] = useState([])


  // console.log("# of Occupants", noOfOccupants);

  const [fees, setFees] = useState([]);

  const [leaseDocuments, setLeaseDocuments] = useState(JSON.parse(application?.lease_documents));
  const [leaseFiles, setLeaseFiles] = useState([]);
  const [leaseFileTypes, setLeaseFileTypes] = useState([]);

  const [showMissingFileTypePrompt, setShowMissingFileTypePrompt] = useState(false);
  const [showMissingFieldsPrompt, setShowMissingFieldsPrompt] = useState(false);
  const [showInvalidDueDatePrompt, setShowInvalidDueDatePrompt] = useState(false);

  let propertyImage;
  if (property.property_favorite_image !== null) {
    propertyImage = property.property_favorite_image;
  } else if (property.property_images === null || property.property_images === "[]") {
    propertyImage = defaultHouseImage;
  } else {
    const images = JSON.parse(property?.property_images);
    propertyImage = images.length > 0 ? images[0] : defaultHouseImage;
  }

  useEffect(() => {
    console.log("leaseAdults - ", leaseAdults)
    console.log("leaseChildren - ", leaseChildren)
    console.log("leasePets - ", leasePets)
    console.log("leaseVehicles - ", leaseVehicles)

  }, [leaseAdults, leaseChildren, leasePets, leaseVehicles]);

  useEffect(() => {
    const getLeaseFees = () => {
      console.log('is it here---', property, application);
      let feesList = [];
      if (application?.lease_status === "PROCESSING" || application?.lease_status === "ACTIVE" ) {
        feesList = JSON.parse(application?.lease_fees);
      } else if (application?.lease_status === "NEW") {
        feesList = initialFees(property, application);
      }
      console.log("Fees: ", feesList);

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
        const adults = application.lease_adults ? JSON.parse(application?.lease_adults) : [];
        setLeaseAdults(adults);
        numOccupants += adults?.length;
      } catch (error) {
        console.log("Error parsing application.lease_adults:", error);
      }

      try {            
        const children = application.lease_children ? JSON.parse(application?.lease_children) : [];
        setLeaseChildren(children);
        numOccupants += children?.length;
      } catch (error) {
        console.log("Error parsing application.lease_children:", error);
      }

      try {            
        const pets = application.lease_pets ? JSON.parse(application?.lease_pets) : [];
        setLeasePets(pets);
      } catch (error) {
        console.log("Error parsing application.lease_pets:", error);
      }

      try {            
        const vehicles = application.lease_vehicles ? JSON.parse(application?.lease_vehicles) : [];
        setLeaseVehicles(vehicles);
      } catch (error) {
        console.log("Error parsing application.lease_adults:", error);
      }

      setNoOfOccupants(numOccupants);
    };


    getLeaseFees();
    getOccupants();
  }, []);

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

  const valueToDayMap = new Map(Array.from(daytoValueMap, ([key, value]) => [value, key]));

  const checkRequiredFields = () => {
    let retVal = true;
    fees.map((fee) => {
      if (
        fee.fee_name == null || fee.fee_name === "" || 
        fee.fee_type == null || fee.fee_type === "" || 
        fee.charge == null || fee.charge === "" || 
        fee.frequency == null || fee.frequency === "" || 
        ((fee.due_by == null || fee.due_by === "") && (fee.due_by_date == null || fee.due_by_date === "" || !isValidDate(fee.due_by_date))) ||
        fee.late_by == null || 
        fee.late_fee == null || fee.late_fee === "" || 
        fee.available_topay == null || 
        fee.perDay_late_fee == null || fee.perDay_late_fee === ""
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

  const handleCreateLease = async () => {
    try {
      setShowMissingFieldsPrompt(false);
      if (!checkRequiredFields()) {
        setShowMissingFieldsPrompt(true);
        return;
      }
      setShowSpinner(true);

      const leaseApplicationFormData = new FormData();

      leaseApplicationFormData.append("lease_uid", application.lease_uid);
      leaseApplicationFormData.append("lease_status", "PROCESSING");
      leaseApplicationFormData.append("lease_effective_date", startDate.format("MM-DD-YYYY"));
      leaseApplicationFormData.append("lease_start", startDate.format("MM-DD-YYYY"));
      leaseApplicationFormData.append("lease_end", endDate.format("MM-DD-YYYY"));
      leaseApplicationFormData.append("lease_fees", JSON.stringify(fees));
      leaseApplicationFormData.append("lease_move_in_date", moveInDate.format("MM-DD-YYYY"));
      leaseApplicationFormData.append("lease_end_notice_period", endLeaseNoticePeriod);
      if(deleteFees?.length > 0){
        leaseApplicationFormData.append("delete_fees", JSON.stringify(deleteFees));
      }

      if(deletedDocsUrl && deletedDocsUrl?.length !== 0){
        leaseApplicationFormData.append("delete_documents", JSON.stringify(deletedDocsUrl));
      }

      if(isPreviousFileChange){
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
      await fetch(`${APIConfig.baseURL.dev}/leaseApplication`, {
        method: "PUT",
        body: leaseApplicationFormData,
      });

      const receiverPropertyMapping = {
        [application.tenant_uid]: [property.property_uid],
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
          announcement_receiver: [application.tenant_uid],
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
    console.log('check date', dateString, date)
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  }

  const handleRenewLease = async () => {
    try {
      setShowMissingFieldsPrompt(false);
      if (!checkRequiredFields()) {
        setShowMissingFieldsPrompt(true);
        return;
      }
      setShowSpinner(true);

      const leaseApplicationFormData = new FormData();
      leaseApplicationFormData.append("lease_property_id", property.property_id);
      leaseApplicationFormData.append("lease_status", "RENEW PROCESSING");
      leaseApplicationFormData.append("lease_effective_date", startDate.format("MM-DD-YYYY"));
      leaseApplicationFormData.append("lease_start", startDate.format("MM-DD-YYYY"));
      leaseApplicationFormData.append("lease_end", endDate.format("MM-DD-YYYY"));
      leaseApplicationFormData.append("lease_fees", JSON.stringify(fees));
      leaseApplicationFormData.append("lease_move_in_date", moveInDate.format("MM-DD-YYYY"));
      leaseApplicationFormData.append("lease_end_notice_period", endLeaseNoticePeriod);
      if(deleteFees?.length > 0){
        leaseApplicationFormData.append("delete_fees", JSON.stringify(deleteFees));
      }

      if(deletedDocsUrl && deletedDocsUrl?.length !== 0){
        leaseApplicationFormData.append("delete_documents", JSON.stringify(deletedDocsUrl));
      }

      if(isPreviousFileChange){
        leaseApplicationFormData.append("lease_documents", JSON.stringify(leaseDocuments));
      }

      leaseApplicationFormData.append("lease_adults", JSON.stringify(leaseAdults));
      leaseApplicationFormData.append("lease_children", JSON.stringify(leaseChildren));
      leaseApplicationFormData.append("lease_pets", JSON.stringify(leasePets));
      leaseApplicationFormData.append("lease_vehicles", JSON.stringify(leaseVehicles));
let date = new Date();
      leaseApplicationFormData.append("lease_application_date", formatDate(date.toLocaleDateString()));
      
//       const parsedData = JSON.parse(property?.tenants);

// // Access the tenant_uid
// const tenantUID = parsedData[0].tenant_uid;

leaseApplicationFormData.append("tenant_uid", property.tenant_uid);


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
const leaseApplicationUpdateFormData = new FormData();
leaseApplicationUpdateFormData.append("lease_uid", application.lease_uid);
leaseApplicationUpdateFormData.append("lease_renew_status", "PM RENEW REQUESTED");

      await fetch(`${APIConfig.baseURL.dev}/leaseApplication`, {
        method: "PUT",
        body: leaseApplicationUpdateFormData,
      });

      await fetch(`${APIConfig.baseURL.dev}/leaseApplication`, {
        method: "POST",
        body: leaseApplicationFormData,
      });

      const receiverPropertyMapping = {
        [application.tenant_uid]: [property.property_uid],
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
          announcement_receiver: [application.tenant_uid],
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
            <img 
              src={propertyImage ? propertyImage: defaultHouseImage} 
              alt="Property Image" 
              style={{ width: "100%", height: "100%", borderRadius: "10px" }} 
            />
          </Box>
        </Box>
  
        {/* Property Address */}
        <Box sx={{ textAlign: "center", marginBottom: "20px" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {property.property_address}, {property.property_city}, {property.property_state} {property.property_zip}
          </Typography>
        </Box>
  
        {/* Lease Details Section */}
        <Accordion defaultExpanded sx={{ backgroundColor: theme.palette.form.main, marginBottom: "20px", marginTop: "20px", borderRadius: "10px" }}>
  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
    <Typography variant="h6" sx={{ fontWeight: "bold", color: "#302A68" }}>Lease Details</Typography>
  </AccordionSummary>
  <AccordionDetails sx={{ padding: "20px", borderRadius: "10px" }}>
    {/* First row: Owner, Tenant, Rent Status */}
    <Grid container spacing={4} sx={{ marginBottom: "20px" }} alignItems="center">
      <Grid item xs={6} sm={3}>
        <Typography sx={{ fontSize: "14px", fontWeight: "bold", color: "#302A68" }}>Owner</Typography>
        <Typography sx={{ fontSize: "14px", fontWeight: "400", color: "#302A68" }}>{property.owner_first_name} {property.owner_last_name}</Typography>
      </Grid>

      <Grid item xs={6} sm={3}>
        <Typography sx={{ fontSize: "14px", fontWeight: "bold", color: "#302A68" }}>Tenant</Typography>
        <Typography sx={{ fontSize: "14px", fontWeight: "400", color: "#302A68" }}>{property?.tenant_first_name} {property?.tenant_last_name}</Typography>
      </Grid>

      <Grid item xs={6} sm={3}>
        <Typography sx={{ fontSize: "14px", fontWeight: "bold", color: "#302A68" }}>Rent Status</Typography>
        <Typography sx={{ fontSize: "14px", fontWeight: "400", color: "#302A68" }}>
          {property.property_available_to_rent === 1 ? "Not Rented" : "Rented"}
        </Typography>
      </Grid>
    </Grid>

    {/* Second row: Start Date, End Date, Move-In Date, End Lease Notice */}
    <Grid container spacing={4} alignItems="center">
      <Grid item xs={6} sm={3}>
        <Typography sx={{ fontSize: "14px", fontWeight: "bold", color: "#302A68" }}>Start Date</Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            value={startDate}
            onChange={handleStartDateChange}
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
            onChange={handleEndDateChange}
            slots={{
              openPickerIcon: CalendarIcon,
            }}
            variant="desktop"
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
            onChange={handleMoveInDateChange}
            slots={{
              openPickerIcon: CalendarIcon,
            }}
            variant="desktop"
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
          name="endLeaseNotice"
          value={`${endLeaseNoticePeriod} days before`}
          variant="filled"
          InputProps={{
            disableUnderline: true,
            sx: { backgroundColor: "#FFFFFF", borderRadius: "10px", height: "40px" },
          }}
          sx={{
            "& .MuiFilledInput-root": {
              backgroundColor: "#FFFFFF",
              borderRadius: "10px",
              height: "40px",
            },
          }}
        />
      </Grid>
    </Grid>
  </AccordionDetails>
</Accordion>
{/* Occupancy Details Section */}
        <Accordion sx={{ backgroundColor: theme.palette.form.main, marginBottom: "20px", marginTop: "20px" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>Occupancy Details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>Adults</Typography>
                <OccupantsDataGrid data={leaseAdults} />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>Children</Typography>
                <OccupantsDataGrid data={leaseChildren} />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>Pets</Typography>
                <PetsDataGrid data={leasePets} />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>Vehicles</Typography>
                <VehiclesDataGrid data={leaseVehicles} />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
  
        {/* Fees Section */}
        <Accordion sx={{ backgroundColor: theme.palette.form.main, marginBottom: "20px", marginTop: "20px" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>Fees</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <LeaseFees startDate={startDate} leaseFees={fees} isEditable={true} setLeaseFees={setFees} setDeleteFees={setDeleteFees} />
          </AccordionDetails>
        </Accordion>
  
        {/* Documents Section */}
        {/* <Box marginTop={"20px"}>
          <Documents 
            setIsPreviousFileChange={setIsPreviousFileChange} 
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
          />
        </Box>
   */}
        {/* Submit Button */}
        <Grid item xs={12} sx={{ textAlign: "center", paddingBottom: 5 }}>
          <Button
            onClick={application?.lease_status === "NEW" ? handleCreateLease : handleRenewLease}
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
            {application?.lease_status === "NEW" ? "Create Lease" : "Renew Lease"}
          </Button>
        </Grid>
      </Box>
    </ThemeProvider>
  );
  
};

const OccupantsDataGrid = ({ data }) => {
  const columns = [
    { 
      field: "name",
      headerName: "First Name",
      width: 120,
      renderHeader: (params) => (
        <strong>{params.colDef.headerName}</strong>
      ),
    },
    { field: "last_name",
      headerName: "Last Name",
      width: 150,
      renderHeader: (params) => (
        <strong>{params.colDef.headerName}</strong>
      ),
    },
    { field: "dob",
      headerName: "Date of Birth",
      width: 150,
      renderHeader: (params) => (
        <strong>{params.colDef.headerName}</strong>
      ),
    },    
    { 
      field: "email",
      headerName: "Email",
      width: 120,
      renderHeader: (params) => (
        <strong>{params.colDef.headerName}</strong>
      ),
    },
    { 
      field: "phone_number",
      headerName: "Phone Number",
      width: 130,
      renderHeader: (params) => (
        <strong>{params.colDef.headerName}</strong>
      ),
      renderCell: (params) => {        
        const phone = params.value;

        return (
          <Typography>
            {phone ? formattedPhoneNumber(phone) : '-'}
          </Typography>
        );
      },
    },    
    { 
      field: "tenant_ssn",
      headerName: "SSN",
      width: 120,
      renderHeader: (params) => (
        <strong>{params.colDef.headerName}</strong>
      ),
      renderCell: (params) => {        
        const SSN = params.value;

        return (
          <Typography>
            {SSN ? maskSSN(SSN) : '-'}
          </Typography>
        );
      },
    },
    { 
      field: "relationship",
      headerName: "Relationship",
      width: 150,
      renderHeader: (params) => (
        <strong>{params.colDef.headerName}</strong>
      ),
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
        sx={{
          // border: "0px",
          // marginTop: '10px',
        }}
        hideFooter={true}
      />
    </>
  );
};

const PetsDataGrid = ({ data }) => {
  const columns = [
    { field: "name",
      headerName: "First Name",
      width: 120,
      renderHeader: (params) => (
        <strong>{params.colDef.headerName}</strong>
      ),
    },
    { field: "last_name",
      headerName: "Last Name",
      width: 150,
      renderHeader: (params) => (
        <strong>{params.colDef.headerName}</strong>
      ),
    },
    { field: "type",
      headerName: "Type",
      width: 150,
      renderHeader: (params) => (
        <strong>{params.colDef.headerName}</strong>
      ),
    },
    { field: "breed",
      headerName: "Breed",
      width: 150,
      renderHeader: (params) => (
        <strong>{params.colDef.headerName}</strong>
      ),
    },
    { 
      field: "weight",
      headerName: "Weight",
      width: 150,
      renderHeader: (params) => (
        <strong>{params.colDef.headerName}</strong>
      ),
      renderCell: (params) => {        
        const weight = params.value;

        return (
          <Typography>
            {weight} lbs
          </Typography>
        );
      },
    },
    { 
      field: "owner",
      headerName: "Owner",
      width: 150,
      renderHeader: (params) => (
        <strong>{params.colDef.headerName}</strong>
      ),
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
        sx={{
          // border: "0px",
          // marginTop: '10px',
        }}
        hideFooter={true}
      />
    </>
  );
};

const VehiclesDataGrid = ({ data }) => {
  const columns = [
    { field: "year",
      headerName: "Year",
      width: 150,
      renderHeader: (params) => (
        <strong>{params.colDef.headerName}</strong>
      ),
    },
    { field: "make",
      headerName: "Make",
      width: 120,
      renderHeader: (params) => (
        <strong>{params.colDef.headerName}</strong>
      ),
    },
    { field: "model",
      headerName: "Model",
      width: 150,
      renderHeader: (params) => (
        <strong>{params.colDef.headerName}</strong>
      ),
    },
    { field: "owner",
      headerName: "Owner",
      width: 150,
      renderHeader: (params) => (
        <strong>{params.colDef.headerName}</strong>
      ),
    },
    { field: "license",
      headerName: "License",
      width: 150,
      renderHeader: (params) => (
        <strong>{params.colDef.headerName}</strong>
      ),
    },
    { 
      field: "state",
      headerName: "State",
      width: 150,
      renderHeader: (params) => (
        <strong>{params.colDef.headerName}</strong>
      ),      
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
        sx={{
          // border: "0px",
          // marginTop: '10px',
        }}
        hideFooter={true}
      />
    </>
  );
};

export default TenantLease;
