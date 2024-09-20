import React, { useState, useEffect, useRef, useContext, } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Stack,
  Paper,
  Grid,
  Badge,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Snackbar,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Avatar,
} from "@mui/material";
import axios from "axios";
import theme from "../../theme/theme";
import propertyImage from "./propertyImage.png";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MobileStepper from "@mui/material/MobileStepper";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight"; // Ensure this is correctly imported

import LeaseIcon from "./leaseIcon.png";
import CreateIcon from "@mui/icons-material/Create";
import { getPaymentStatusColor, getPaymentStatus } from "./PropertyList.jsx";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import PostAddIcon from "@mui/icons-material/PostAdd";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { DataGrid } from "@mui/x-data-grid";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useUser } from "../../contexts/UserContext";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import ImageUploader from "../ImageUploader";
import { maintenanceOwnerDataCollectAndProcess } from "../Maintenance/MaintenanceOwner.jsx";
import { maintenanceManagerDataCollectAndProcess } from "../Maintenance/MaintenanceManager.jsx";

import APIConfig from "../../utils/APIConfig";
import { v4 as uuidv4 } from "uuid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";

import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { CollectionsBookmarkRounded } from "@mui/icons-material";
import PropertiesContext from '../../contexts/PropertiesContext';
import ListsContext from "../../contexts/ListsContext.js";
import ManagementDetailsComponent from "./ManagementDetailsComponent.jsx";

const getAppColor = (app) => (app.lease_status !== "REJECTED" ? (app.lease_status !== "REFUSED" ? "#778DC5" : "#874499") : "#A52A2A");

export default function PropertyNavigator({  
  rawPropertyData,
  contracts,
  isDesktop = true,
  onEditClick,
  onViewLeaseClick,
  onViewContractClick,
  setEditPropertyState,
  setTenantAppNavState,
  setPmQuoteRequestedState,
  setManagerDetailsState,
  onShowSearchManager,
  handleViewApplication,
  handleViewPMQuotesRequested,
  onAddListingClick,
  handleViewManagerDetailsClick,
  props,
}) {
  // console.log("In Property Navigator", onEditClick);
  // console.log(index, propertyList);
  // console.log("props contracts", contracts);
  const navigate = useNavigate();
  const { getList, } = useContext(ListsContext);
  const { getProfileId, isManager, roleName, selectedRole } = useUser();
  // const { propertyList, allRentStatus, allContracts, returnIndex, setReturnIndex  } = useContext(PropertiesContext); 
  const propertiesContext = useContext(PropertiesContext);
	const {
	  propertyList: propertyListFromContext,	  
    allRentStatus: allRentStatusFromContext,	  
    allContracts: allContractsFromContext,    
	  returnIndex: returnIndexFromContext,
    setReturnIndex,
	} = propertiesContext || {};
  
	const propertyList = propertyListFromContext || [];	
  const allRentStatus = allRentStatusFromContext || [];		
  const allContracts = allContractsFromContext || [];	  
	const returnIndex = returnIndexFromContext || 0;

  const [propertyData, setPropertyData] = useState(propertyList || []);
  const [currentIndex, setCurrentIndex] = useState(returnIndex !== undefined ? returnIndex : 0);
  const [property, setProperty] = useState(propertyList ? propertyList[currentIndex] : null);
  const { property_uid } = property || { property_uid: null };
  const [currentId, setCurrentId] = useState(property_uid);
  const [contactDetails, setContactDetails] = useState([]);
  const [maintenanceData, setMaintenanceData] = useState([{}]);
  const [propertyRentStatus, setpropertyRentStatus] = useState(allRentStatus);
  const [rentFee, setrentFee] = useState({});
  const [appliances, setAppliances] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentApplRow, setcurrentApplRow] = useState(null);
  const [modifiedApplRow, setModifiedApplRow] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [applianceCategories, setApplianceCategories] = useState([]);
  const [applianceCategoryToUIDMap, setApplianceCategoryToUIDMap] = useState({});
  const [applianceUIDToCategoryMap, setApplianceUIDToCategoryMap] = useState({});

  const [happinessData, setHappinessData] = useState([]);
  const [dataforhappiness, setdataforhappiness] = useState([]);

  const [applianceList, setApplianceList] = useState([]);
  const [initialApplData, setInitialApplData] = useState(null);

  const [selectedImageList, setSelectedImageList] = useState([]);

  // console.log("PropertyNavigator - location state allRentStatus - ", allRentStatus);

  const getDataFromAPI = async () => {
    const url = `${APIConfig.baseURL.dev}/contacts/${getProfileId()}`;
    // const url = `${APIConfig.baseURL.dev}/contacts/600-000003`;
    try {
      const response = await axios.get(url);
      // console.log("--response in nav----", response);
      const data = response["management_contacts"];
      // console.log("--response data----", data);
      const ownerContacts = data["owners"];
      // console.log("--response ownerContacts----", ownerContacts);
      setContactDetails(ownerContacts);
    } catch (error) {
      // console.log("Error fetching owner contacts: ", error);
    }
  };
  
  // useEffect(() => {
  //   console.log("PropertyNavigator - property - ", property);
  // }, [property]);

  // useEffect(() => {
  //   console.log("PropertyNavigator - allContracts - ", allContracts);
  // }, [allContracts]);

  // useEffect(() => {
  //   setCurrentIndex(returnIndex !== undefined ? returnIndex : 0);
  // }, [returnIndex]);

  // useEffect(() => {
  //   console.log("PropertyNavigator - property - ", property)
  // }, [property]);

  useEffect(() => {
    getDataFromAPI();
    // fetchApplianceList();
    getApplianceCategories();
  }, []);

  // useEffect(() => {
  //   console.log("appliances - ", appliances);
  // }, [appliances]);

  // useEffect(() => {
  //   console.log("currentApplRow - ", currentApplRow);
  // }, [currentApplRow]);

  // useEffect(() => {
  //   console.log("modifiedApplRow - ", modifiedApplRow);
  // }, [modifiedApplRow]);

  // useEffect(() => {
  //   console.log("PropertyNavigator - propertyRentStatus - ", propertyRentStatus);
  // }, [propertyRentStatus]);

  // useEffect(() => {
  //   console.log("PropertyNavigator - currentId - ", currentId);
  // }, [currentId]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Parse property images once outside the component
  const parsedPropertyImages =
    propertyData && propertyData[currentIndex] && propertyData[currentIndex].property_images ? JSON.parse(propertyData[currentIndex].property_images) : [];
  // console.log('parsedImages:', parsedPropertyImages);
  // console.log('parsedImages.length:', parsedPropertyImages.length);

  // Initialize state with parsed images or fallback to propertyImage if empty
  const [images, setImages] = useState(parsedPropertyImages.length === 0 ? [propertyImage] : parsedPropertyImages);

  // Initialize maxSteps state
  const [maxSteps, setMaxSteps] = useState(0);

  // Log images and its length after it's updated
  useEffect(() => {
    // console.log("What's in Images: ", images, images.length);
    setMaxSteps(images.length); // Update maxSteps state
    // console.log('MaxSteps: ', images.length); // Log maxSteps within useEffect
  }, [images]); // This useEffect will re-run whenever the 'images' state changes

  // console.log('MaxSteps: ', maxSteps); // Log maxSteps outside of useEffect

  const [activeStep, setActiveStep] = useState(0);
  const [showSpinner, setShowSpinner] = useState(false);
  const [contractsData, setContractsData] = useState(allContracts);
  const [activeContracts, setActiveContracts] = useState([]);
  const [contractsNewSent, setContractsNewSent] = useState(0);
  const [maintenanceReqData, setMaintenanceReqData] = useState([{}]);
  // console.log('Maintenance Request Data1: ', maintenanceReqData);
  const [displayMaintenanceData, setDisplayMaintenanceData] = useState([{}]);
  const [newContractCount, setNewContractCount] = useState(0)
  const [sentContractCount, setSentContractCount] = useState(0)

  const color = theme.palette.form.main;
  const [propertyId, setPropertyId] = useState(propertyData && propertyData[currentIndex] ? propertyData[currentIndex].property_uid : null);
  let data = "";
  const role = roleName();
  if (role === "Manager") {
    data = "maintenance_status";
  } else if (role === "Owner") {
    data = "maintenance_request_status";
  }

  const maintenanceColumns = [
    {
      field: "maintenance_request_uid",
      headerName: "UID",
      flex: 1,
    },
    {
      field: "maintenance_request_created_date",
      headerName: "Created Date",
      flex: 1,
    },
    {
      field: "maintenance_title",
      headerName: "Title",
      flex: 1,
    },

    {
      field: data,
      headerName: "Status",
      flex: 1,
    },
  ];  

  useEffect(() => {
    setPropertyData(propertyList || []);
    const nextIndex = returnIndex !== undefined ? returnIndex : 0;
    setCurrentIndex(nextIndex);
    const nextId = propertyList && propertyList[nextIndex] ? propertyList[nextIndex].property_uid : null;
    setCurrentId(nextId);
    setProperty(propertyList && propertyList[nextIndex]);
    const parsedPropertyImages = propertyList && propertyList[nextIndex] && propertyList[nextIndex].property_images ? JSON.parse(propertyList[nextIndex].property_images) : [];
    setImages(parsedPropertyImages.length === 0 ? [propertyImage] : parsedPropertyImages);
    setContractsData(allContracts);
    console.log("parsedPropertyImages - ", parsedPropertyImages);
    console.log("propertyList[nextIndex].property_favorite_image - ", propertyList[nextIndex]?.property_favorite_image);
    let favImageIndex = null;
    if (propertyList && propertyList[nextIndex] && propertyList[nextIndex].property_favorite_image) {
      favImageIndex = parsedPropertyImages.findIndex((url) => url === propertyList[nextIndex].property_favorite_image);
    }
    if (favImageIndex) {
      setActiveStep(favImageIndex);
    } else {
      setActiveStep(0);
    }
  }, [returnIndex, propertyList]);

  useEffect(() => {
    if (propertyData && propertyData[currentIndex]) {
      // console.log("propertyId use Effect called ***************************************************");
      // console.log("setting propertyId - ", propertyData[currentIndex]);
      // console.log("setting propertyId - ", propertyData[currentIndex].property_uid);
      setPropertyId(propertyData[currentIndex].property_uid);
      
      var count = 0;
      var newContractCount = 0
      var sentContractCount = 0
      const filtered = allContracts?.filter((contract) => contract.property_id === propertyId);
      const active = filtered?.filter((contract) => contract.contract_status === "ACTIVE");
      // console.log("322 - PropertyNavigator - filtered contracts - ", filtered);
      filtered.forEach((contract) => {
        if (contract.contract_status === "SENT") {
          count++;
          sentContractCount++;
        }
        if(contract.contract_status === "NEW"){
          count++;
          newContractCount++;
        }
      });
      // console.log("PropertyNavigator - Active contract - ", active);
      setContractsNewSent(count);
      setContractsData(allContracts);
      setActiveContracts(active);
      setNewContractCount(newContractCount)
      setSentContractCount(sentContractCount)

      const rentDetails = getRentStatus();
      // console.log("rentDetails - ", rentDetails);
      setpropertyRentStatus(rentDetails);

      if (property.leaseFees !== null) {
        const rent = JSON.parse(propertyData[currentIndex].leaseFees).find((fee) => fee.fee_name === "Rent");
        setrentFee(rent);
        // console.log('check rent', rent);
      } else {
        setrentFee(null);
      }

      const propertyApplicances = JSON.parse(propertyData[currentIndex].appliances);
      console.log("Appliances ****", propertyApplicances);
      console.log("applianceUIDToCategoryMap is %%", applianceUIDToCategoryMap);
      if (property.appliances != null) {
        setAppliances(propertyApplicances);

        //   console.log('Appliances categories', applianceCategories, typeof (applianceCategories));
      } else {
        setAppliances([]);
      }
    }
  }, [currentIndex, propertyId, allRentStatus, returnIndex, propertyList, allContracts, propertyData]);
  // }, [currentIndex, propertyId, allRentStatus]);

  const tenant_detail = property && property.lease_start && property.tenant_uid ? `${property.tenant_first_name} ${property.tenant_last_name}` : "No Tenant";
  const manager_detail = property && property.business_uid ? `${property.business_name}` : "No Manager";
  const [arrowButton1_color, set_arrow1_color] = useState(
    tenant_detail === "No Tenant" && manager_detail === "No Manager" ? theme.typography.common.gray : theme.typography.common.blue
  );


  let dashboard_id = getProfileId();
  useEffect(() => {
    const fetchDashboardData = async () => {
      setShowSpinner(true);
      try {
        const response = await fetch(`${APIConfig.baseURL.dev}/dashboard/${getProfileId()}`);
        // const response = await fetch(`${APIConfig.baseURL.dev}/dashboard/600-000003`);
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        const jsonData = await response.json();
        setHappinessData(jsonData.HappinessMatrix);
        setdataforhappiness(jsonData);
      } catch (error) {
        console.error(error);
      }
      setShowSpinner(false);
    };
    fetchDashboardData();
  }, [dashboard_id]);
 

  

  const handleNextCard = () => {
    let nextIndex = (currentIndex + 1) % (propertyData ? propertyData.length : 1);
    setCurrentIndex(nextIndex);
    const nextId = propertyData && propertyData[nextIndex] ? propertyData[nextIndex].property_uid : null;
    setCurrentId(nextId);
    setProperty(propertyData && propertyData[nextIndex]);

    const parsedPropertyImages = propertyData && propertyData[nextIndex] && propertyData[nextIndex].property_images ? JSON.parse(propertyData[nextIndex].property_images) : [];
    // console.log('parsedImages:', parsedPropertyImages);
    // console.log('parsedImages.length:', parsedPropertyImages.length);
    setImages(parsedPropertyImages.length === 0 ? [propertyImage] : parsedPropertyImages);

    setActiveStep(0);
  };

  const handlePreviousCard = () => {
    let previousIndex = (currentIndex - 1 + (propertyData ? propertyData.length : 1)) % (propertyData ? propertyData.length : 1);
    setCurrentIndex(previousIndex);
    const previousId = propertyData && propertyData[previousIndex] ? propertyData[previousIndex].property_uid : null;
    setCurrentId(previousId);
    setProperty(propertyData && propertyData[previousIndex]);

    const parsedPropertyImages =
      propertyData && propertyData[previousIndex] && propertyData[previousIndex].property_images ? JSON.parse(propertyData[previousIndex].property_images) : [];
    // console.log('parsedImages:', parsedPropertyImages);
    // console.log('parsedImages.length:', parsedPropertyImages.length);
    setImages(parsedPropertyImages.length === 0 ? [propertyImage] : parsedPropertyImages);

    setActiveStep(0);
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };  

  // const handleManagerChange = () => {
  //   // if (property && property.business_uid) {
  //   //   navigate("/ContactsPM", {
  //   //     state: {
  //   //       contactsTab: "Manager",
  //   //       managerId: property.business_uid,
  //   //     },
  //   //   });
  //   // } else {
  //     // const state = { index: currentIndex, propertyData, isDesktop };
  //     // onShowSearchManager(state);
  //   // }
  // };

  const handleOpenMaintenancePage = () => {
    if (property && property.maintenance?.length > 0) {
      if (selectedRole === "OWNER") {
        navigate("/ownerMaintenance", {
          state: {
            propertyId: propertyId,
            fromProperty: true,
            index: currentIndex,
          },
        });
      } else {
        navigate("/managerMaintenance", {
          state: {
            propertyId: propertyId,
            fromProperty: true,
            index: currentIndex,
          },
        });
      }
    }
  }

  const handleAppClick = (index) => {    
    handleViewApplication(index);
    const state = { index: index, propertyIndex: currentIndex, property: property, isDesktop: isDesktop };
    // setTenantAppNavState(state);
  };

  const getRentStatus = () => {
    try {
      const rentStatus = allRentStatus.filter((data) => data.property_uid == currentId && data.rent_status != "VACANT");
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const formatData = (data) => {
        return data.map((item, index) => {
          // console.log("item - ", item.rent_detail_index);
          return {
            ...item,
            // idx: index,
            cf_monthName: monthNames[item.cf_month - 1],
            total_paid_formatted: item.total_paid ? `$${item.total_paid}` : "-",
            latest_date_formatted: item.latest_date || "-",
            fees: "-",
          };
        });
      };

      // console.log("getRentStatus - rentStatus - ", rentStatus);
      // console.log("getRentStatus - propertyRentStatus - ", propertyRentStatus);
      const formattedData = propertyRentStatus ? formatData(rentStatus) : [];
      // console.log("getRentStatus - formattedData - ", formattedData);
      return formattedData;
    } catch (error) {
      console.log(error);
    }
  };

  const paymentStatusColorMap = (value) => {
    if (value === "PAID") {
      return theme.palette.priority.clear;
    } else if (value === "UNPAID") {
      return theme.palette.priority.high;
    } else if (value === "PARTAILLY PAID") {
      return theme.palette.priority.medium;
    } else if (value === "PAID LATE" || "NO MANAGER") {
      return theme.palette.priority.low;
    }
  };

  const getLateFeesColor = (fee) => {
    if (fee.lf_purchase_status === "PAID") return "green";
    else return "red";
  };

  const rentStatusColumns = [
    {
      field: "cf_monthName",
      headerName: "Month",
      sortable: isDesktop,
      flex: 1,
      renderCell: (params) => {
        return <Box sx={{ width: "100%", color: "#3D5CAC" }}>{params.value}</Box>;
      },
    },
    {
      field: "latest_date_formatted",
      headerName: "Date Paid",
      sortable: isDesktop,
      // flex: 1,
      renderCell: (params) => {
        return <Box sx={{ width: "100%", color: "#3D5CAC" }}>{params.value}</Box>;
      },
    },
    {
      // field: 'total_paid_formatted',\
      field: "pur_amount_due",
      headerName: "Amount",
      sortable: isDesktop,
      flex: 1,
      renderCell: (params) => {
        return <Box sx={{ width: "100%", color: "#3D5CAC" }}>{params.value}</Box>;
      },
    },

    {
      field: "rent_status",
      headerName: "Rent Status",
      sortable: isDesktop,
      flex: 1,
      renderCell: (params) => {
        return (
          <Box
            sx={{
              width: "100%",
              margin: "0px",
              textAlign: "center",
              color: "#F2F2F2",
              backgroundColor: paymentStatusColorMap(params.value),
              overflowWrap: "break-word",
              whiteSpace: "break-spaces",
              fontSize: "13px",
            }}
          >
            {params.value}
          </Box>
        );
      },
    },
    {
      field: "fees",
      headerName: "Late Fees",
      sortable: isDesktop,
      flex: 1,
      renderCell: (params) => {        
        return <Box sx={{ width: "100%", color: getLateFeesColor(params.row) }}>{params.row.lf_pur_amount_due}</Box>;
      },
    },
    {
      field: "purchase_type",
      headerName: "Type",
      sortable: isDesktop,
      flex: 2,
      renderCell: (params) => {
        return <Box sx={{ width: "100%", color: "#3D5CAC" }}>{params.value}</Box>;
      },
    },
    {
      field: "pur_notes",
      headerName: "Notes",
      sortable: isDesktop,
      flex: 2,
      renderCell: (params) => {
        return <Box sx={{ width: "100%", color: "#3D5CAC" }}>{params.value}</Box>;
      },
    },    
  ];

  const handleEditClick = async (row) => {
    // console.log("handleEditClick - row - ", row);
    await setInitialApplData(row);
    await setcurrentApplRow(row);
    await setModifiedApplRow({ appliance_uid: row.appliance_uid });
    console.log("---currentApplRow?.appliance_favorite_image---", row);
    await setFavImage(currentApplRow?.appliance_favorite_image);
    await setIsEditing(true);
    await handleOpen();
  };

  const handleViewLeaseClick = () => {
    onViewLeaseClick("ViewLease");
  };

  const handleViewContractClick = () => {
    onViewContractClick("ViewContract");
  };

  // check here
  const handleDeleteClick = async (id) => {
    try {
      const response = await axios.delete(`${APIConfig.baseURL.dev}/appliances/${id}`);

      if (response.status === 200) {
        setAppliances(appliances.filter((appliance) => appliance.appliance_uid !== id));
      } else {
        console.error("Failed to delete the appliance. Status code:", response.status);
      }
    } catch (error) {
      console.error("Error deleting the appliance:", error);
    }
  };

  const [dataGridKey, setDataGridKey] = useState(0);
  const [forceRender, setForceRender] = useState(false);

  const addAppliance = async (appliance) => {
    // console.log("inside editOrUpdateAppliance", appliance);
    try {
      setShowSpinner(true);
      const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Credentials": "*",
      };

      const applianceFormData = new FormData();

      Object.keys(appliance).forEach((key) => {
        // console.log(`Key: ${key}`);

        applianceFormData.append(key, appliance[key]);
      });      
      // console.log(" editOrUpdateProfile - profileFormData - ");
      // for (var pair of profileFormData.entries()) {
      //   console.log(pair[0]+ ', ' + pair[1]);
      // }
      let i = 0;
      if (selectedImageList.length > 0) {
        for (const file of selectedImageList) {
          // let key = file.coverPhoto ? "img_cover" : `img_${i++}`;
          let key = `img_${i++}`;
          if (file.file !== null) {
            // newProperty[key] = file.file;
            applianceFormData.append(key, file.file);
          } else {
            // newProperty[key] = file.image;
            applianceFormData.append(key, file.image);
          }
          if (file.coverPhoto) {
            applianceFormData.append("img_favorite", key);
          }
        }
      }
      axios
        .post("https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/appliances", applianceFormData, headers)
        .then((response) => {
          // Check if the response contains the `appliance_uid`
          const newApplianceUID = response?.data?.appliance_uid;
          if (newApplianceUID) {
            // console.log("Data updated successfully", response);
            // showSnackbar("Your profile has been successfully updated.", "success");
            // handleUpdate();
            console.log("Appliance befor", appliance);
            console.log("applianceUIDToCategoryMap is %%", applianceUIDToCategoryMap);
            const applianceCategory = applianceUIDToCategoryMap[appliance.appliance_type];
            console.log("Appliance is $$", applianceCategory);
            setAppliances([...appliances, { ...appliance, appliance_uid: newApplianceUID }]);
          }
          setShowSpinner(false);
          setSelectedImageList([]);
          handleClose();
          window.location.reload(); //change here for alt referesh
        })
        .catch((error) => {
          setShowSpinner(false);
          console.error(error.response?.data || error.message);
        });
    } catch (error) {
      console.error("Cannot Update Appliances", error);
      setShowSpinner(false);
    }
  };

  const getAppliancesChanges = () => {
    const changes = {};

    if (!initialApplData) {
      return changes;
    }

    Object.keys(currentApplRow).forEach((key) => {
      if (initialApplData[key] != currentApplRow[key]) {
        changes[key] = currentApplRow[key];
      }
    });

    if (initialApplData.appliance_favorite_image !== favImage) {
      changes["appliance_favorite_image"] = favImage;
    }

    return changes;
  };

  const editAppliance = async (appliance) => {
    console.log("inside editAppliance", appliance);
    try {
      setShowSpinner(true);
      const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Credentials": "*",
      };

      const changedFields = getAppliancesChanges();

      if (Object.keys(changedFields).length == 0 && selectedImageList.length === 0 && imagesTobeDeleted.length === 0) {
        console.log("No changes detected.");
        setShowSpinner(false);
        return;
      }

      const applianceFormData = new FormData();
      
      if (imagesTobeDeleted.length > 0) {
        let updatedImages = currentApplRow.appliance_images;
        updatedImages = updatedImages.filter((image) => !imagesTobeDeleted.includes(image));
        currentApplRow.appliance_images = updatedImages;
        applianceFormData.append("delete_images", JSON.stringify(imagesTobeDeleted));
      }

      applianceFormData.append("appliance_images", JSON.stringify(currentApplRow.appliance_images));
      applianceFormData.append("appliance_favorite_image", favImage);
      console.log(favImage);
      let i = 0;
      for (const file of selectedImageList) {        
        let key = `img_${i++}`;
        if (file.file !== null) {          
          applianceFormData.append(key, file.file);
        } else {          
          applianceFormData.append(key, file.image);
        }
        if (file.coverPhoto) {
          applianceFormData.set("appliance_favorite_image", key);
        }
      }

      for (const [key, value] of Object.entries(changedFields)) {
        applianceFormData.append(key, value);
      }

      for (let [key, value] of applianceFormData.entries()) {
        console.log("check here:", key, value);
      }

      if (appliance.appliance_uid) {
        applianceFormData.append("appliance_uid", appliance.appliance_uid);
      }

      axios
        .put("https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/appliances", applianceFormData, headers)
        .then((response) => {          
          setAppliances((prevAppliances) => {
            const index = prevAppliances.findIndex((item) => item.appliance_uid === appliance.appliance_uid);
            if (index !== -1) {
              const updatedAppliances = [...prevAppliances];
              updatedAppliances[index] = { ...appliance, appliance_favorite_image: favImage };
              return updatedAppliances;
            } else {
              return prevAppliances;
            }
          });
          
          setShowSpinner(false);
          setSelectedImageList([]);
          handleClose(); 
        })
        .catch((error) => {
          setShowSpinner(false);
          // showSnackbar("Cannot update your profile. Please try again", "error");
          if (error.response) {
            console.log(error.response.data);
          }
        });
      setShowSpinner(false);
      // setModifiedData([]);
    } catch (error) {
      // showSnackbar("Cannot update the lease. Please try again", "error");
      // console.log("Cannot Update Appliances", error);
      setShowSpinner(false);
    }    
  };

  const handleAddAppln = () => {
    const newError = {};
    if (!currentApplRow.appliance_type) newError.appliance_type = "Type is required";

    setError(newError);
    if (Object.keys(newError).length === 0) {
      if (isEditing) {        
        editAppliance(currentApplRow);
      } else {        
        // console.log("---currentApplRow---", currentApplRow);
        addAppliance(currentApplRow);
      }
      handleClose();
    } else {
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const getApplianceCategories = () => {          
      const applnCategories = getList("appliances");
      // console.log("appliance categories - ", applnCategories);
      setApplianceCategories(applnCategories);
      const listItemToUidMapping = applnCategories.reduce((acc, item) => {
        acc[item.list_item] = item.list_uid;
        return acc;
      }, {});
      // console.log("appliance categories to UIDs- ", listItemToUidMapping);
      setApplianceCategoryToUIDMap(listItemToUidMapping);
      const listUidToItemMapping = applnCategories.reduce((acc, item) => {
        acc[item.list_uid] = item.list_item;
        return acc;
      }, {});
      // console.log("appliance UIDs to categories- ", listUidToItemMapping);
      setApplianceUIDToCategoryMap(listUidToItemMapping);    
  };

  // Define the custom cell renderer for the appliance_images column
  const ImageCell = (params) => {
    // console.log("---params----", params);
    let images;
    try {
      images = JSON.parse(params.value); // Try to parse as JSON
    } catch (e) {
      images = params.value; // If parsing fails, treat as a single URL string
    }
    // console.log("---images----", images);
    const imageUrl = images?.length > 0 ? images[0] : ""; // Get the first image URL
    const appliance = params.row;
    const favImage = appliance.appliance_favorite_image;

    return (
      <Avatar
        src={favImage}
        alt='Appliance'
        sx={{
          borderRadius: "0",
          width: "60px",
          height: "60px",
          margin: "0px",
          padding: "0px",
        }}
      />
    );
  };

  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollPosition;
    }
  }, [scrollPosition]);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      setScrollPosition((prevScrollPosition) => {
        const currentScrollPosition = scrollRef.current.scrollLeft;
        let newScrollPosition;

        if (direction === "left") {
          newScrollPosition = Math.max(currentScrollPosition - scrollAmount, 0);
        } else {
          newScrollPosition = currentScrollPosition + scrollAmount;
        }

        return newScrollPosition;
      });
    }
  };

  const applnColumns = [
    { field: "appliance_uid", headerName: "UID", width: 80 },
    { field: "appliance_item", headerName: "Appliance", width: 100 },
    { field: "appliance_desc", headerName: "Description", width: 80 },
    { field: "appliance_manufacturer", headerName: "Manufacturer", width: 80 },
    { field: "appliance_purchased_from", headerName: "Purchased From", width: 80 },
    { field: "appliance_purchased", headerName: "Purchased On", width: 80 },
    { field: "appliance_purchase_order", headerName: "Purchase Order Number", width: 80 },
    { field: "appliance_installed", headerName: "Installed On", width: 80 },
    { field: "appliance_serial_num", headerName: "Serial Number", width: 80 },
    { field: "appliance_model_num", headerName: "Model Number", width: 80 },
    { field: "appliance_warranty_till", headerName: "Warranty Till", width: 80 },
    { field: "appliance_warranty_info", headerName: "Warranty Info", width: 80 },
    { field: "appliance_url", headerName: "URLs", width: 80 },
    { field: "appliance_images", headerName: "Image", width: 100, renderCell: ImageCell }, //appliance_favorite_image needs to be added
    { field: "appliance_documents", headerName: "Documents", width: 80 },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params) => {
        return (
          <Box>
            <IconButton onClick={() => handleEditClick(params.row)}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => handleDeleteClick(params.row.appliance_uid)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        );
      },
    },
  ];

  const [imagesTobeDeleted, setImagesTobeDeleted] = useState([]);
  const [favImage, setFavImage] = useState("");

  const [deletedImageList, setDeletedImageList] = useState([]);
  const [deletedIcons, setDeletedIcons] = useState(currentApplRow?.appliance_images ? new Array(currentApplRow.appliance_images.length).fill(false) : []);
  //console.log("---currentApplRow before fav---", currentApplRow);
  const [favoriteIcons, setFavoriteIcons] = useState([]);

  useEffect(() => {
    if (currentApplRow?.appliance_images && propertyData[currentIndex]) {
      const newFavoriteIcons = currentApplRow.appliance_images.map((image) => {
        return image === currentApplRow.appliance_favorite_image;
      });
      setFavoriteIcons(newFavoriteIcons);
      console.log("Favorite Icons Updated:", newFavoriteIcons);
    }
  }, [currentApplRow, propertyData, currentIndex]);
  
  console.log("Favorite Icons:", favoriteIcons);

  const handleDelete = (index) => {
    const updatedDeletedIcons = [...deletedIcons];
    updatedDeletedIcons[index] = !updatedDeletedIcons[index];
    setDeletedIcons(updatedDeletedIcons);

    const imageToDelete = currentApplRow.appliance_images[index];
    setImagesTobeDeleted((prev) => [...prev, imageToDelete]);

    console.log("Delete image at index:", deletedIcons);
  };

  const handleFavorite = (index) => {
    const updatedFavoriteIcons = new Array(favoriteIcons.length).fill(false);
    updatedFavoriteIcons[index] = true;
    setFavoriteIcons(updatedFavoriteIcons);

    const newFavImage = currentApplRow.appliance_images[index];
    setFavImage(newFavImage);
    setSelectedImageList((prevState) =>
      prevState.map((file, i) => ({
        ...file,
        coverPhoto: i === index,
      }))
    );

    console.log(`Favorite image at index: ${index}`);
  };

  const handleUpdateFavoriteIcons = () => {
    setFavoriteIcons(new Array(favoriteIcons.length).fill(false));
  };

  const handleTenantClick = (tenantId) => {
    if (selectedRole === "MANAGER" || selectedRole === "OWNER") {
      if (tenant_detail === "No Tenant") {
        console.log("There is no tenant");
      } else {
        console.log("Else statement for if there is a tenant");
        navigate("/ContactsPM", {
          state: {
            contactsTab: "Tenant",
            tenantId: tenantId,
          },
        });
      }
    }
  };

  appliances.forEach((row) => {
    if (!row.appliance_uid) {
      console.error("Missing appliance_uid for row:", row);
    }
  });

  return (
    <Paper
      style={{
        marginTop: "10px",
        backgroundColor: theme.palette.primary.main,
        width: "100%", // Occupy full width with 25px margins on each side
      }}
    >
      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
        <CircularProgress color='inherit' />
      </Backdrop>
      <Box
        sx={{
          flexDirection: "column", // Added this to stack children vertically
          justifyContent: "center",
          width: "100%", // Take up full screen width
          height: "100%",
        }}
      >
        {/* Property Navigator Header Including Address and x of y Properties */}
        <Grid container sx={{ marginTop: "15px", alignItems: "center", justifyContent: "center" }}>
          <Grid item md={1} xs={2} sx={{ display: "flex", justifyContent: "center" }}>
            <Button onClick={handlePreviousCard} disabled={currentIndex === 0 || !propertyData || propertyData.length === 0}>
              {currentIndex === 0 ? (
                <ArrowBackIcon sx={{ color: "#A0A0A0", width: "25px", height: "25px", margin: "0px" }} />
              ) : (
                <ArrowBackIcon sx={{ color: "#000000", width: "25px", height: "25px", margin: "0px" }} />
              )}
            </Button>
          </Grid>
          <Grid
            item
            md={8}
            xs={8}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              sx={{
                color: theme.typography.primary.black,
                fontWeight: theme.typography.primary.fontWeight,
                fontSize: theme.typography.largeFont,
                textAlign: "center",
              }}
              paddingBottom='10px'
            >
              {property
                ? property.property_unit ? `${property.property_address} #${property.property_unit}, ${property.property_city} ${property.property_state} ${property.property_zip}` : `${property.property_address}, ${property.property_city} ${property.property_state} ${property.property_zip}`
                : "No Property Selected"}
            </Typography>
            <Typography
              sx={{
                color: "#3D5CAC",
                fontWeight: theme.typography.propertyPage.fontWeight,
                fontSize: "16px",
                textAlign: "center",
              }}
            >
              Property UID: {property?.property_uid}
            </Typography>
            <Typography
              sx={{
                color: "#3D5CAC",
                fontWeight: theme.typography.propertyPage.fontWeight,
                fontSize: "16px",
                textAlign: "center",
              }}
            >
              {currentIndex + 1} of {propertyData ? propertyData.length : 0} Properties
            </Typography>
          </Grid>
          <Grid item md={1} xs={2} sx={{ display: "flex", justifyContent: "center" }}>
            <Button onClick={handleNextCard} disabled={currentIndex === propertyData.length - 1 || !propertyData || propertyData.length === 0}>
              {currentIndex === propertyData.length - 1 ? (
                <ArrowForwardIcon sx={{ color: "#A0A0A0", width: "25px", height: "25px", margin: "0px" }} />
              ) : (
                <ArrowForwardIcon sx={{ color: "#000000", width: "25px", height: "25px", margin: "0px" }} />
              )}
            </Button>
          </Grid>
        </Grid>
        {/* End Property Navigator Header Including Address and x of y Properties */}
        {/* Property Detail Cards */}
        <Box
          sx={{
            alignItems: "center",
            justifyContent: "center",
            margin: "10px",
          }}
        >
          <Grid container rowSpacing={4} columnSpacing={4} justify='space-between' alignItems='stretch'>
            {/* Top Card */}
            <Grid item xs={12} md={12}>
              <Card
                sx={{
                  backgroundColor: color,
                  boxShadow: "none",
                  elevation: "0",
                  padding: "16px",
                }}
              >
                {/* Top Container */}
                <Grid container spacing={2}>
                  {/* Image with Image Arrows */}
                  <Grid item xs={12} md={3}>
                    <Card
                      sx={{
                        backgroundColor: color,
                        boxShadow: "none",
                        elevation: "0",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%", // Ensure card takes full height of its container
                      }}
                    >
                      <CardContent
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                          height: "100%",
                          padding: "0 !important",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "space-between",
                            height: "200px",
                            width: "100%",
                          }}
                        >
                          {/* Image */}
                          <CardMedia
                            component='img'
                            image={images[activeStep]}
                            sx={{
                              elevation: "0",
                              boxShadow: "none",
                              flexGrow: 1,
                              objectFit: "fill",
                              width: "100%",
                              height: "100px",
                            }}
                          />
                          {/* End Image */}
                          <MobileStepper
                            steps={maxSteps}
                            position='static'
                            activeStep={activeStep}
                            variant='text'
                            sx={{
                              backgroundColor: color,
                              width: "100%",
                              justifyContent: "center",
                              alignContent: "center",
                              alignItems: "center",
                              elevation: "0",
                              boxShadow: "none",
                            }}
                            nextButton={
                              <Button size='small' onClick={handleNext} disabled={activeStep === maxSteps - 1} sx={{ minWidth: "40px", width: "40px" }}>
                                {theme.direction === "rtl" ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
                              </Button>
                            }
                            backButton={
                              <Button size='small' onClick={handleBack} disabled={activeStep === 0} sx={{ minWidth: "40px", width: "40px" }}>
                                {theme.direction === "rtl" ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
                              </Button>
                            }
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  {/* End Image with Image Arrows */}
                  <Grid item xs={0} md={0.5} />
                  {/* Middle Column with Property Details */}
                  <Grid item xs={12} md={5}>
                    <Grid container spacing={2} sx={{ height: "100%" }}>
                      <Grid item xs={6}>
                        <Typography
                          sx={{
                            textTransform: "none",
                            color: theme.typography.primary.black,
                            fontWeight: theme.typography.secondary.fontWeight,
                            fontSize: theme.typography.smallFont,
                            textAlign: "left",
                          }}
                        >
                          Type
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography
                          sx={{
                            textTransform: "none",
                            color: theme.typography.primary.black,
                            fontWeight: theme.typography.light.fontWeight,
                            fontSize: theme.typography.smallFont,
                            textAlign: "left",
                          }}
                        >
                          {property ? property.property_type : "-"}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography
                          sx={{
                            textTransform: "none",
                            color: theme.typography.primary.black,
                            fontWeight: theme.typography.secondary.fontWeight,
                            fontSize: theme.typography.smallFont,
                            textAlign: "left",
                          }}
                        >
                          Sqft
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography
                          sx={{
                            textTransform: "none",
                            color: theme.typography.primary.black,
                            fontWeight: theme.typography.light.fontWeight,
                            fontSize: theme.typography.smallFont,
                            textAlign: "left",
                          }}
                        >
                          {property ? property.property_area : "-"}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography
                          sx={{
                            textTransform: "none",
                            color: theme.typography.primary.black,
                            fontWeight: theme.typography.secondary.fontWeight,
                            fontSize: theme.typography.smallFont,
                            textAlign: "left",
                          }}
                        >
                          Bedrooms
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography
                          sx={{
                            textTransform: "none",
                            color: theme.typography.primary.black,
                            fontWeight: theme.typography.light.fontWeight,
                            fontSize: theme.typography.smallFont,
                            textAlign: "left",
                          }}
                        >
                          {property ? property.property_num_beds : "-"}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography
                          sx={{
                            textTransform: "none",
                            color: theme.typography.primary.black,
                            fontWeight: theme.typography.secondary.fontWeight,
                            fontSize: theme.typography.smallFont,
                            textAlign: "left",
                          }}
                        >
                          Bathrooms
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography
                          sx={{
                            textTransform: "none",
                            color: theme.typography.primary.black,
                            fontWeight: theme.typography.light.fontWeight,
                            fontSize: theme.typography.smallFont,
                            textAlign: "left",
                          }}
                        >
                          {property ? property.property_num_baths : "-"}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography
                          sx={{
                            textTransform: "none",
                            color: theme.typography.primary.black,
                            fontWeight: theme.typography.secondary.fontWeight,
                            fontSize: theme.typography.smallFont,
                          }}
                        >
                          Property Value
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography
                          sx={{
                            textTransform: "none",
                            color: theme.typography.primary.black,
                            fontWeight: theme.typography.light.fontWeight,
                            fontSize: theme.typography.smallFont,
                          }}
                        >
                          {property ? `$${property.property_value}` : "-"}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography
                          sx={{
                            textTransform: "none",
                            color: theme.typography.primary.black,
                            fontWeight: theme.typography.secondary.fontWeight,
                            fontSize: theme.typography.smallFont,
                          }}
                        >
                          Assessment Year
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography
                          sx={{
                            textTransform: "none",
                            color: theme.typography.primary.black,
                            fontWeight: theme.typography.light.fontWeight,
                            fontSize: theme.typography.smallFont,
                          }}
                        >
                          {property && property.property_value_year ? `${property.property_value_year}` : "-"}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography
                          sx={{
                            textTransform: "none",
                            color: theme.typography.primary.black,
                            fontWeight: theme.typography.secondary.fontWeight,
                            fontSize: theme.typography.smallFont,
                          }}
                        >
                          $ Per Sqft
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography
                          sx={{
                            textTransform: "none",
                            color: theme.typography.primary.black,
                            fontWeight: theme.typography.light.fontWeight,
                            fontSize: theme.typography.smallFont,
                          }}
                        >
                          {property && property.property_area ? `$${(property?.property_value / property?.property_area).toFixed(2)}` : "-"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  {/* End Middle Column with Property Details */}
                  {/* Buttons */}
                  <Grid item xs={12} md={3.5}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        {property && property.property_available_to_rent === 1 && (property.lease_status == null || property.lease_status !== "ACTIVE") && (
                          // padding extra on the bottom
                          <Box sx={{ pb: 40 }}>
                            <Button
                              variant='outlined'
                              sx={{
                                background: "#3D5CAC",
                                backgroundColor: "#FFC85C",
                                cursor: "pointer",
                                textTransform: "none",
                                minWidth: "150px", // Fixed width for the button
                                minHeight: "35px",
                                width: "100%",
                                "&:hover": {
                                  backgroundColor: theme.palette.success.dark,
                                },
                              }}
                              size='small'
                            >
                              <CheckIcon sx={{ color: "#FFFFFF", fontSize: "18px" }} />
                              <Typography
                                sx={{
                                  textTransform: "none",
                                  color: "#FFFFFF",
                                  fontWeight: theme.typography.secondary.fontWeight,
                                  fontSize: theme.typography.smallFont,
                                  whiteSpace: "nowrap",
                                  marginLeft: "1%", // Adjusting margin for icon and text
                                }}
                              >
                                {"Listed For Rent"}
                              </Typography>
                            </Button>
                          </Box>
                        )}
                        {
                          (property && (property.property_available_to_rent === 0 || property.property_available_to_rent == null) && (property.business_uid == null || property.business_uid == "") ) && 
                        (
                          <Box sx={{ pb: 40 }}>
                            <Button
                              variant='outlined'
                              sx={{
                                background: "#3D5CAC",
                                backgroundColor: "#626264",
                                cursor: "pointer",
                                textTransform: "none",
                                minWidth: "150px", // Fixed width for the button
                                minHeight: "35px",
                                width: "100%",
                              }}
                              size='small'
                            >
                              <CloseIcon sx={{ color: "#FFFFFF", fontSize: "18px" }} />
                              <Typography
                                sx={{
                                  textTransform: "none",
                                  color: "#FFFFFF",
                                  fontWeight: theme.typography.secondary.fontWeight,
                                  fontSize: theme.typography.smallFont,
                                  whiteSpace: "nowrap",
                                  marginLeft: "1%", // Adjusting margin for icon and text
                                }}
                              >
                                {"No Manager"}
                              </Typography>
                            </Button>
                          </Box>
                        )}
                        {
                          (property && (property.property_available_to_rent === 0 || property.property_available_to_rent == null) && (property.business_uid != null && property.business_uid !== "") ) && 
                        (
                          <Box sx={{ pb: 40 }}>
                            <Button
                              variant='outlined'
                              sx={{
                                background: "#3D5CAC",
                                backgroundColor: theme.palette.priority.high,
                                cursor: "pointer",
                                textTransform: "none",
                                minWidth: "150px", // Fixed width for the button
                                minHeight: "35px",
                                width: "100%",
                              }}
                              size='small'
                            >
                              <CloseIcon sx={{ color: "#FFFFFF", fontSize: "18px" }} />
                              <Typography
                                sx={{
                                  textTransform: "none",
                                  color: "#FFFFFF",
                                  fontWeight: theme.typography.secondary.fontWeight,
                                  fontSize: theme.typography.smallFont,
                                  whiteSpace: "nowrap",
                                  marginLeft: "1%", // Adjusting margin for icon and text
                                }}
                              >
                                {"Not Listed"}
                              </Typography>
                            </Button>
                          </Box>
                        )}
                        {property && property.lease_status && property.lease_status === "ACTIVE" && (
                          // padding extra on the bottom
                          <Box sx={{ pb: 40 }}>
                            <Button
                              variant='outlined'
                              sx={{
                                background: "#3D5CAC",
                                backgroundColor: theme.palette.success.main,
                                cursor: "pointer",
                                textTransform: "none",
                                minWidth: "150px", // Fixed width for the button
                                minHeight: "35px",
                                width: "100%",
                                "&:hover": {
                                  backgroundColor: theme.palette.success.dark,
                                },
                              }}
                              size='small'
                            >
                              <CheckIcon sx={{ color: "#FFFFFF", fontSize: "18px" }} />
                              <Typography
                                sx={{
                                  textTransform: "none",
                                  color: "#FFFFFF",
                                  fontWeight: theme.typography.secondary.fontWeight,
                                  fontSize: theme.typography.smallFont,
                                  whiteSpace: "nowrap",
                                  marginLeft: "1%", // Adjusting margin for icon and text
                                }}
                              >
                                {"Rented"}
                              </Typography>
                            </Button>
                          </Box>
                        )}
                      </Grid>
                      <Grid item xs={12}>
                        <Box>
                          {/* Edit Property Button */}
                          <Button
                            variant='outlined'
                            sx={{
                              background: "#3D5CAC",
                              color: theme.palette.background.default,
                              cursor: "pointer",
                              textTransform: "none",
                              minWidth: "150px", // Fixed width for the button
                              minHeight: "35px",
                              width: "100%",
                            }}
                            size='small'
                            onClick={() => {
                              // console.log('typeof edit', typeof(onEditClick));
                              onEditClick("edit_property");
                            }}
                            // onClick={handleEditButton}
                          >
                            <PostAddIcon sx={{ color: "#FFFFFF", fontSize: "18px" }} />
                            <Typography
                              sx={{
                                textTransform: "none",
                                color: "#FFFFFF",
                                fontWeight: theme.typography.secondary.fontWeight,
                                fontSize: theme.typography.smallFont,
                                whiteSpace: "nowrap",
                                marginLeft: "1%", // Adjusting margin for icon and text
                              }}
                            >
                              {"Edit Property"}
                            </Typography>
                          </Button>
                        </Box>
                      </Grid>
                      {selectedRole === "MANAGER" && property && property.property_available_to_rent !== 1 && (
                        <Grid item xs={12}>
                          <Button
                            variant='outlined'
                            sx={{
                              background: "#3D5CAC",
                              color: theme.palette.background.default,
                              cursor: "pointer",
                              textTransform: "none",
                              minWidth: "150px",
                              minHeight: "35px",
                              width: "100%",
                            }}
                            size='small'
                            onClick={() => onAddListingClick("create_listing")}
                          >
                            <PostAddIcon sx={{ color: "#FFFFFF", fontSize: "18px", margin: "5px" }} />
                            <Typography
                              sx={{
                                textTransform: "none",
                                color: "#FFFFFF",
                                fontWeight: theme.typography.secondary.fontWeight,
                                fontSize: theme.typography.smallFont,
                              }}
                            >
                              {"Create Listing"}
                            </Typography>
                          </Button>
                        </Grid>
                      )}
                      {selectedRole === "MANAGER" && property && property.property_available_to_rent === 1 && (
                        <Grid item xs={12}>
                          <Button
                            variant='outlined'
                            sx={{
                              background: "#3D5CAC",
                              color: theme.palette.background.default,
                              cursor: "pointer",
                              textTransform: "none",
                              minWidth: "150px",
                              minHeight: "35px",
                              width: "100%",
                            }}
                            size='small'
                            onClick={() => onAddListingClick("edit_listing")}
                          >
                            <PostAddIcon sx={{ color: "#FFFFFF", fontSize: "18px", margin: "5px" }} />
                            <Typography
                              sx={{
                                textTransform: "none",
                                color: "#FFFFFF",
                                fontWeight: theme.typography.secondary.fontWeight,
                                fontSize: theme.typography.smallFont,
                                whiteSpace: "nowrap",
                                marginLeft: "1%", // Adjusting margin for icon and text
                              }}
                            >
                              {"Edit Listing"}
                            </Typography>
                          </Button>
                        </Grid>
                      )}
                    </Grid>
                  </Grid>
                  {/* End Buttons */}
                </Grid>
                {/* End Top Container */}
              </Card>
            </Grid>
            {/* End Top Card */}

            {/* Lease Details and Management Details Cards */}
            {/* Left component */}
            <Grid item xs={12} md={6}>
              <Card sx={{ backgroundColor: color, height: "100%" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: "10px",
                  }}
                >
                  <Typography
                    sx={{
                      color: theme.typography.primary.black,
                      fontWeight: theme.typography.primary.fontWeight,
                      fontSize: theme.typography.largeFont,
                      textAlign: "center",
                    }}
                  >
                    Lease Details
                  </Typography>
                  {property?.lease_uid && (
                    <Button
                      sx={{
                        padding: "0px",
                        "&:hover": {
                          backgroundColor: theme.palette.form.main,
                        },
                      }}
                      className='.MuiButton-icon'
                      onClick={handleViewLeaseClick}                      
                    >
                      <img src={LeaseIcon} />
                    </Button>
                  )}
                </Box>
                <CardContent
                  sx={{
                    flexDirection: "column",
                    alignItems: "left",
                    justifyContent: "left",
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography
                        sx={{
                          color: theme.typography.primary.black,
                          fontWeight: theme.typography.secondary.fontWeight,
                          fontSize: theme.typography.smallFont,
                        }}
                      >
                        Rent:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        sx={{
                          color: theme.typography.primary.black,
                          fontWeight: theme.typography.light.fontWeight,
                          fontSize: theme.typography.smallFont,
                        }}
                      >
                        {property ? (property.property_listed_rent ? "$" + property.property_listed_rent : "No Rent Listed") : "-"}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        sx={{
                          color: theme.typography.primary.black,
                          fontWeight: theme.typography.secondary.fontWeight,
                          fontSize: theme.typography.smallFont,
                        }}
                      >
                        Available To Pay:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        sx={{
                          color: theme.typography.primary.black,
                          fontWeight: theme.typography.light.fontWeight,
                          fontSize: theme.typography.smallFont,
                        }}
                      >
                        {rentFee ? rentFee.available_topay + " days in advance" : "-"}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        sx={{
                          color: theme.typography.primary.black,
                          fontWeight: theme.typography.secondary.fontWeight,
                          fontSize: theme.typography.smallFont,
                        }}
                      >
                        Frequency:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        sx={{
                          color: theme.typography.primary.black,
                          fontWeight: theme.typography.light.fontWeight,
                          fontSize: theme.typography.smallFont,
                        }}
                      >
                        {rentFee ? rentFee.frequency : "-"}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        sx={{
                          color: theme.typography.primary.black,
                          fontWeight: theme.typography.secondary.fontWeight,
                          fontSize: theme.typography.smallFont,
                        }}
                      >
                        Lease Expires:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        sx={{
                          color: theme.typography.primary.black,
                          fontWeight: theme.typography.light.fontWeight,
                          fontSize: theme.typography.smallFont,
                        }}
                      >
                        {property ? (property.lease_end ? property.lease_end : "No Lease") : "-"}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        sx={{
                          textTransform: "none",
                          color: theme.typography.primary.black,
                          fontWeight: theme.typography.secondary.fontWeight,
                          fontSize: theme.typography.smallFont,
                          // cursor: "pointer",
                        }}
                        onClick={() => handleTenantClick(property.tenant_uid)}
                      >
                        Tenant:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          sx={{
                            textTransform: "none",
                            color: theme.typography.primary.black,
                            fontWeight: theme.typography.light.fontWeight,
                            fontSize: theme.typography.smallFont,
                            cursor: "pointer",
                          }}
                          onClick={() => handleTenantClick(property.tenant_uid)}
                        >
                          {tenant_detail}
                        </Typography>
                        <KeyboardArrowRightIcon
                          sx={{
                            color: theme.typography.common.blue,
                            cursor: "pointer",
                          }}
                          onClick={() => handleTenantClick(property.tenant_uid)}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        sx={{
                          color: theme.typography.primary.black,
                          fontWeight: theme.typography.secondary.fontWeight,
                          fontSize: theme.typography.smallFont,
                        }}
                      >
                        Due:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        sx={{
                          color: theme.typography.primary.black,
                          fontWeight: theme.typography.light.fontWeight,
                          fontSize: theme.typography.smallFont,
                        }}
                      >
                        {rentFee ? rentFee.due_by : "No Due Date Listed"}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        sx={{
                          color: theme.typography.primary.black,
                          fontWeight: theme.typography.secondary.fontWeight,
                          fontSize: theme.typography.smallFont,
                        }}
                      >
                        Late Fee:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        sx={{
                          color: theme.typography.primary.black,
                          fontWeight: theme.typography.light.fontWeight,
                          fontSize: theme.typography.smallFont,
                        }}
                      >
                        {rentFee ? rentFee.late_fee : "-"}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        sx={{
                          color: theme.typography.primary.black,
                          fontWeight: theme.typography.secondary.fontWeight,
                          fontSize: theme.typography.smallFont,
                        }}
                      >
                        Late Fee Per Day:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        sx={{
                          color: theme.typography.primary.black,
                          fontWeight: theme.typography.light.fontWeight,
                          fontSize: theme.typography.smallFont,
                        }}
                      >
                        {rentFee ? rentFee.perDay_late_fee : "-"}
                      </Typography>
                    </Grid>

                    {property && property.applications.length > 0 && (
                      <>
                        <Grid item xs={12} md={12}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography
                              sx={{
                                textTransform: "none",
                                color: theme.typography.primary.black,
                                fontWeight: theme.typography.secondary.fontWeight,
                                fontSize: theme.typography.smallFont,
                                paddingRight: "103px",
                              }}
                            >
                              Applications:
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                cursor: "pointer",
                              }}
                            >
                              <Badge
                                color='success'
                                badgeContent={property.applications.filter((app) => app.lease_status === "NEW" || app.lease_status === "PROCESSING").length}
                                showZero
                                sx={{
                                  paddingRight: "50px",
                                }}
                              />
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={12}>
                          <Accordion theme={theme} sx={{ backgroundColor: "#e6e6e6", marginLeft: "-5px" }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='panel1-content' id='panel1-header'>
                              <Typography
                                sx={{
                                  textTransform: "none",
                                  color: theme.typography.primary.black,
                                  fontWeight: theme.typography.secondary.fontWeight,
                                  fontSize: theme.typography.smallFont,
                                }}
                              >
                                View All Applications
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                padding: "0px 5px 5px 5px",
                              }}
                            >
                              {property.applications.map((app, index) => (
                                <Button
                                  key={index}
                                  onClick={() => handleAppClick(index)}
                                  sx={{
                                    backgroundColor: getAppColor(app),
                                    color: "#FFFFFF",
                                    textTransform: "none",
                                    width: "100%",
                                    height: "70px",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    marginBottom: 2,
                                    "&:hover, &:focus, &:active": {
                                      backgroundColor: getAppColor(app),
                                    },
                                  }}
                                >
                                  <Box sx={{ display: "flex" }}>
                                    <Typography
                                      sx={{
                                        fontSize: theme.typography.smallFont,
                                        mr: 1,
                                      }}
                                    >
                                      {app.tenant_first_name + " " + app.tenant_last_name + " "}
                                    </Typography>
                                    <Typography
                                      sx={{
                                        fontWeight: "bold",
                                        fontSize: theme.typography.smallFont,
                                        mr: 1,
                                      }}
                                    >
                                      {app.lease_status + " "}
                                    </Typography>
                                    <Typography
                                      sx={{
                                        fontWeight: "bold",
                                        fontSize: theme.typography.smallFont,
                                      }}
                                    >
                                      {app.lease_application_date}
                                    </Typography>
                                  </Box>
                                </Button>
                              ))}
                            </AccordionDetails>
                          </Accordion>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Right component */}
            <Grid item xs={12} md={6}>
              <ManagementDetailsComponent activeContract={activeContracts[0]} currentProperty={property} selectedRole={selectedRole} handleViewPMQuotesRequested={handleViewPMQuotesRequested} newContractCount={newContractCount} sentContractCount={sentContractCount} handleOpenMaintenancePage={handleOpenMaintenancePage}/>
              {/* <Card sx={{ backgroundColor: color, height: "100%" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: "10px",
                  }}
                >
                  <Typography
                    sx={{
                      color: theme.typography.primary.black,
                      fontWeight: theme.typography.primary.fontWeight,
                      fontSize: theme.typography.largeFont,
                      textAlign: "center",
                    }}
                  >
                    Management Details
                  </Typography>
                  {property?.contract_uid && (
                    <Button
                      sx={{
                        padding: "0px",
                        "&:hover": {
                          backgroundColor: theme.palette.form.main,
                        },
                      }}
                      className='.MuiButton-icon'
                      onClick={handleViewContractClick}                      
                    >
                      <img src={LeaseIcon} />
                    </Button>
                  )}
                </Box>
                <CardContent
                  sx={{
                    flexDirection: "column",
                    alignItems: "left",
                    justifyContent: "left",
                  }}
                >
                  <Grid container spacing={2}>
                    {selectedRole === "OWNER" && (
                      <Grid container item spacing={2}>
                        <Grid item xs={6}>
                          <Typography
                            sx={{
                              textTransform: "none",
                              color: theme.typography.primary.black,
                              fontWeight: theme.typography.secondary.fontWeight,
                              fontSize: theme.typography.smallFont,
                              paddingRight: "15px",
                            }}
                          >
                            Property Manager:
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography
                              sx={{
                                textTransform: "none",
                                color: theme.typography.primary.black,
                                fontWeight: theme.typography.light.fontWeight,
                                fontSize: theme.typography.smallFont,
                              }}
                            > */}
                              {/* {property && property.business_uid ? `${property.business_name}` : "No Manager Selected"} */}
                              {/* {activeContracts?.length > 0 ? activeContracts[0]?.business_name : "No Manager Selected"}
                            </Typography>
                            <KeyboardArrowRightIcon
                              sx={{
                                color: theme.typography.common.blue,
                                cursor: "pointer",
                              }}
                              onClick={() => handleManagerChange(currentIndex)}
                            />
                          </Box>
                        </Grid>
                      </Grid>
                    )}
                    {selectedRole === "MANAGER" && (
                      <Grid container item spacing={2}>
                        <Grid item xs={6}>
                          <Typography
                            sx={{
                              textTransform: "none",
                              color: theme.typography.primary.black,
                              fontWeight: theme.typography.secondary.fontWeight,
                              fontSize: theme.typography.smallFont,
                            }}
                          >
                            Owner:
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              navigate("/ownerContactDetailsHappinessMatrix", {
                                state: {
                                  ownerUID: property.owner_uid,
                                  navigatingFrom: "PropertyNavigator",
                                  // index: index,
                                  happinessData: happinessData,
                                  // happinessMatrixData: dataforhappiness,
                                },
                              })
                            }
                          >
                            <Typography
                              sx={{
                                textTransform: "none",
                                color: theme.typography.primary.black,
                                fontWeight: theme.typography.light.fontWeight,
                                fontSize: theme.typography.smallFont,
                              }}
                            >
                              {property ? `${property.owner_first_name}  ${property.owner_last_name}` : "-"}
                            </Typography>
                            <KeyboardArrowRightIcon
                              sx={{
                                color: theme.typography.common.blue,
                                cursor: "pointer",
                              }}
                            />
                          </Box>
                        </Grid>
                      </Grid>
                    )}

                    {contractsData && contractsData.length > 0 && selectedRole !== "MANAGER" ? (
                      <>
                        <Grid item xs={10.7} md={10.7}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography
                              sx={{
                                textTransform: "none",
                                color: theme.typography.primary.black,
                                fontWeight: theme.typography.secondary.fontWeight,
                                fontSize: theme.typography.smallFont,
                                paddingRight: "88px", // here padding
                              }}
                            >
                              PM Quotes Requested:
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                cursor: contractsNewSent ? "pointer" : "default",
                              }}
                              onClick={contractsNewSent ? handleViewPMQuotesRequested : null}
                            >
                              <Badge color='success' badgeContent={contractsNewSent} showZero />
                            </Box>
                          </Box>
                        </Grid>
                        {contractsNewSent ? (
                          <Grid item xs={1.3} md={1.3}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "0px 0px 0px 8px",
                              }}
                            >
                              <KeyboardArrowRightIcon
                                sx={{ color: arrowButton1_color, cursor: "pointer" }}
                                onClick={() => {                                  
                                  handleViewPMQuotesRequested();
                                }}
                              />
                            </Box>
                          </Grid>
                        ) : (
                          <></>
                        )}
                      </>
                    ) : null}
                    <Grid container item spacing={2}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography
                          sx={{
                            textTransform: "none",
                            color: theme.typography.primary.black,
                            fontWeight: theme.typography.secondary.fontWeight,
                            fontSize: theme.typography.smallFont,
                            paddingRight: "50px",
                            paddingLeft: "4px",
                          }}
                        >
                          Open Maintenance Tickets:
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            if (property && property.maintenanceCount > 0) {
                              if (selectedRole === "OWNER") {
                                navigate("/ownerMaintenance", {
                                  state: {
                                    propertyId: propertyId,
                                    fromProperty: true,
                                    index: currentIndex,
                                  },
                                });
                              } else {
                                navigate("/managerMaintenance", {
                                  state: {
                                    propertyId: propertyId,
                                    fromProperty: true,
                                    index: currentIndex,
                                  },
                                });
                              }
                            }
                          }}
                        >
                          <Badge
                            badgeContent={property?.maintenanceCount || 0}
                            showZero
                            color='error'
                            sx={{
                              paddingRight: "10px",
                            }}
                          />
                        </Box>
                      </Box>
                    </Grid>
                    {property && property.applications.length > 0 && (
                      <>
                        <Grid item xs={12} md={12}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography
                              sx={{
                                textTransform: "none",
                                color: theme.typography.primary.black,
                                fontWeight: theme.typography.secondary.fontWeight,
                                fontSize: theme.typography.smallFont,
                                paddingRight: "103px",
                              }}
                            >
                              Applications:
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                cursor: "pointer",
                              }}
                            >
                              <Badge
                                color='success'
                                badgeContent={property.applications.filter((app) => app.lease_status === "NEW" || app.lease_status === "PROCESSING").length}
                                showZero
                                sx={{
                                  paddingRight: "50px",
                                }}
                              />
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={12}>
                          <Accordion theme={theme} sx={{ backgroundColor: "#e6e6e6", marginLeft: "-5px" }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='panel1-content' id='panel1-header'>
                              <Typography
                                sx={{
                                  textTransform: "none",
                                  color: theme.typography.primary.black,
                                  fontWeight: theme.typography.secondary.fontWeight,
                                  fontSize: theme.typography.smallFont,
                                }}
                              >
                                View All Applications
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                padding: "0px 5px 5px 5px",
                              }}
                            >
                              {property.applications.map((app, index) => (
                                <Button
                                  key={index}
                                  onClick={() => handleAppClick(index)}
                                  sx={{
                                    backgroundColor: getAppColor(app),
                                    color: "#FFFFFF",
                                    textTransform: "none",
                                    width: "100%",
                                    height: "70px",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    marginBottom: 2,
                                    "&:hover, &:focus, &:active": {
                                      backgroundColor: getAppColor(app),
                                    },
                                  }}
                                >
                                  <Box sx={{ display: "flex" }}>
                                    <Typography
                                      sx={{
                                        fontSize: theme.typography.smallFont,
                                        mr: 1,
                                      }}
                                    >
                                      {app.tenant_first_name + " " + app.tenant_last_name + " "}
                                    </Typography>
                                    <Typography
                                      sx={{
                                        fontWeight: "bold",
                                        fontSize: theme.typography.smallFont,
                                        mr: 1,
                                      }}
                                    >
                                      {app.lease_status + " "}
                                    </Typography>
                                    <Typography
                                      sx={{
                                        fontWeight: "bold",
                                        fontSize: theme.typography.smallFont,
                                      }}
                                    >
                                      {app.lease_application_date}
                                    </Typography>
                                  </Box>
                                </Button>
                              ))}
                            </AccordionDetails>
                          </Accordion>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </CardContent>
              </Card> */}
            </Grid>
            {/* End Lease Details and Management Details Cards */}
          </Grid>

          {/* Rent history grid */}
          <Grid item xs={12} sx={{ pt: "10px" }}>
            <Card sx={{ backgroundColor: color, height: "100%" }}>
              <Typography
                sx={{
                  color: theme.typography.primary.black,
                  fontWeight: theme.typography.primary.fontWeight,
                  fontSize: theme.typography.largeFont,
                  textAlign: "center",
                  marginTop: "10px",
                }}
              >
                Rent History 31
              </Typography>
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-around",
                  width: "100%",
                }}
              >
                <DataGrid
                  rows={propertyRentStatus}
                  columns={rentStatusColumns}
                  disableColumnMenu={!isDesktop}
                  autoHeight
                  initialState={{
                    pagination: {
                      paginationModel: {
                        pageSize: 12,
                      },
                    },
                  }}
                  getRowId={(row) => row.rent_detail_index}
                  pageSizeOptions={[12]}
                  sx={{
                    "& .MuiDataGrid-cell": {
                      justifyContent: "center",
                      alignItems: "center",
                    },
                    "& .MuiDataGrid-columnHeader": {
                      justifyContent: "center",
                      alignItems: "center",
                      color: "#3D5CAC",
                      textAlign: "center",
                    },
                    "& .MuiDataGrid-columnHeaderTitle": {
                      textAlign: "center",
                      font: "bold",
                      width: "100%",
                    },
                    "& .MuiDataGrid-virtualScroller::-webkit-scrollbar": { display: "none" },
                    "@media (maxWidth: 600px)": {
                      "& .MuiDataGrid-columnHeaderTitle": {
                        width: "100%",
                        margin: "0px",
                        padding: "0px",
                      },
                    },
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
          {/* End Rent history grid */}

          {/* Appliances grid */}
          <Grid item xs={12} md={12} sx={{ pt: "10px" }}>
            <Card sx={{ backgroundColor: color, height: "100%" }}>
              <Box sx={{ width: "100%" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    margin: "0px 15px 0px 10px",
                  }}
                >
                  <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
                    <Typography
                      sx={{
                        color: theme.typography.primary.black,
                        fontWeight: theme.typography.primary.fontWeight,
                        fontSize: theme.typography.largeFont,
                        textAlign: "center",
                        marginTop: "10px",
                      }}
                    >
                      Appliances
                    </Typography>
                  </Box>
                  <Button
                    variant='outlined'
                    sx={{
                      background: "#3D5CAC",
                      color: theme.palette.background.default,
                      cursor: "pointer",
                      textTransform: "none",
                      minWidth: "30px",
                      minHeight: "30px",
                      fontWeight: theme.typography.secondary.fontWeight,
                      fontSize: theme.typography.smallFont,
                    }}
                    size='small'
                    onClick={() => {
                      setcurrentApplRow({
                        appliance_uid: "",
                        appliance_url: "",
                        appliance_type: "",
                        appliance_desc: "",
                        appliance_images: "",
                        appliance_available: 0,
                        appliance_installed: null,
                        appliance_model_num: "",
                        appliance_purchased: null,
                        appliance_serial_num: "",
                        appliance_property_id: propertyId,
                        appliance_manufacturer: "",
                        appliance_warranty_info: "",
                        appliance_warranty_till: null,
                        appliance_purchase_order: "",
                        appliance_purchased_from: "",
                      });
                      setIsEditing(false);
                      handleOpen();
                    }}
                  >
                    <AddIcon sx={{ color: "#FFFFFF", fontSize: "18px" }} />
                  </Button>
                </Box>
                <DataGrid
                  rows={appliances}
                  columns={applnColumns}
                  pageSize={5}
                  getRowId={(row) => row.appliance_uid}
                  autoHeight
                  sx={{
                    fontSize: "10px",
                    "& .wrap-text": {
                      whiteSpace: "normal !important",
                      wordWrap: "break-word !important",
                      overflow: "visible !important",
                    },
                  }}
                />
                <Snackbar open={snackbarOpen} onClose={handleSnackbarClose} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
                  <Alert onClose={handleSnackbarClose} severity='error' sx={{ width: "100%" }}>
                    Please fill in all required fields.
                  </Alert>
                </Snackbar>
                <Dialog open={open} onClose={handleClose}>
                  <DialogTitle>{isEditing ? "Edit Appliance" : "Add New Appliance"}</DialogTitle>
                  <DialogContent>
                    <FormControl margin='dense' fullWidth variant='outlined' sx={{ marginTop: "10px" }}>
                      <InputLabel required>Appliance Type</InputLabel>
                      <Select
                        margin='dense'
                        label='Appliance Type'
                        fullWidth
                        required
                        variant='outlined'
                        value={applianceUIDToCategoryMap[currentApplRow?.appliance_type] || ""}
                        onChange={(e) => {
                          const selectedItem = applianceCategories.find((appln) => appln.list_item === e.target.value);
                          if (selectedItem) {
                            setcurrentApplRow({
                              ...currentApplRow,
                              appliance_type: selectedItem.list_uid,
                            });
                          }
                        }}
                      >
                        {applianceCategories &&
                          applianceCategories.map((appln) => (
                            <MenuItem key={appln.list_uid} value={appln.list_item}>
                              {appln.list_item}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                    {isEditing && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 2,
                        }}
                      >
                        <IconButton onClick={() => handleScroll("left")} disabled={scrollPosition === 0}>
                          <ArrowBackIosIcon />
                        </IconButton>
                        <Box
                          sx={{
                            display: "flex",
                            overflowX: "auto",
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                            "&::-webkit-scrollbar": {
                              display: "none",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              overflowX: "auto",
                              scrollbarWidth: "none",
                              msOverflowStyle: "none",
                              "&::-webkit-scrollbar": {
                                display: "none",
                              },
                            }}
                          >
                            <ImageList ref={scrollRef} sx={{ display: "flex", flexWrap: "nowrap" }} cols={5}>
                              {currentApplRow.appliance_images ? (
                                currentApplRow.appliance_images.map((image, index) => (
                                  <ImageListItem
                                    key={index}
                                    sx={{
                                      width: "auto",
                                      flex: "0 0 auto",
                                      border: "1px solid #ccc",
                                      margin: "0 2px",
                                      position: "relative", // Added to position icons
                                    }}
                                  >
                                    <img
                                      src={image}
                                      alt={`maintenance-${index}`}
                                      style={{
                                        height: "150px",
                                        width: "150px",
                                        objectFit: "cover",
                                      }}
                                    />
                                    <Box sx={{ position: "absolute", top: 0, right: 0 }}>
                                      <IconButton
                                        onClick={() => handleDelete(index)}
                                        sx={{
                                          color: deletedIcons[index] ? "red" : "black",
                                          backgroundColor: "rgba(255, 255, 255, 0.7)",
                                          "&:hover": {
                                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                                          },
                                          margin: "2px",
                                        }}
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </Box>
                                    <Box sx={{ position: "absolute", bottom: 0, left: 0 }}>
                                      <IconButton
                                        onClick={() => handleFavorite(index)}
                                        sx={{
                                          color: favoriteIcons[index] ? "red" : "black",
                                          backgroundColor: "rgba(255, 255, 255, 0.7)",
                                          "&:hover": {
                                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                                          },
                                          margin: "2px",
                                        }}
                                      >
                                        {favoriteIcons[index] ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                      </IconButton>
                                    </Box>
                                  </ImageListItem>
                                ))
                              ) : (
                                <></>
                              )}
                            </ImageList>
                          </Box>
                        </Box>
                        <IconButton onClick={() => handleScroll("right")}>
                          <ArrowForwardIosIcon />
                        </IconButton>
                      </Box>
                    )}
                    <ImageUploader
                      selectedImageList={selectedImageList}
                      setSelectedImageList={setSelectedImageList}
                      page={"Add"}
                      setDeletedImageList={setDeletedImageList}
                      setFavImage={setFavImage}
                      favImage={favImage}
                      updateFavoriteIcons={handleUpdateFavoriteIcons}
                    />
                    <TextField
                      margin='dense'
                      label='Description'
                      fullWidth
                      variant='outlined'
                      value={currentApplRow?.appliance_desc || ""}
                      onChange={(e) => setcurrentApplRow({ ...currentApplRow, appliance_desc: e.target.value })}
                    />
                    <TextField
                      margin='dense'
                      label='Manufacturer Name'
                      fullWidth
                      variant='outlined'
                      value={currentApplRow?.appliance_manufacturer || ""}
                      onChange={(e) =>
                        setcurrentApplRow({
                          ...currentApplRow,
                          appliance_manufacturer: e.target.value,
                        })
                      }
                    />
                    <TextField
                      margin='dense'
                      label='Purchased From'
                      fullWidth
                      variant='outlined'
                      value={currentApplRow?.appliance_purchased_from || ""}
                      onChange={(e) =>
                        setcurrentApplRow({
                          ...currentApplRow,
                          appliance_purchased_from: e.target.value,
                        })
                      }
                    />
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label='Purchased On'
                        value={currentApplRow?.appliance_purchased ? dayjs(currentApplRow.appliance_purchased) : null}                        
                        onChange={(date) => {
                          const formattedDate = dayjs(date).format("MM-DD-YYYY");
                          setcurrentApplRow({
                            ...currentApplRow,
                            appliance_purchased: formattedDate,
                          });
                        }}
                        textField={(params) => (
                          <TextField
                            {...params}
                            margin='dense'
                            fullWidth
                            size='small'
                            variant='outlined'
                            sx={{
                              "& .MuiInputBase-root": {
                                fontSize: "14px",
                              },
                              "& .MuiSvgIcon-root": {
                                fontSize: "20px",
                              },
                            }}
                          />
                        )}
                        sx={{ marginTop: "10px", width: "535px" }}
                      />
                    </LocalizationProvider>
                    <TextField
                      margin='dense'
                      label='Purchase Order Number'
                      fullWidth
                      variant='outlined'
                      value={currentApplRow?.appliance_purchase_order || ""}
                      onChange={(e) =>
                        setcurrentApplRow({
                          ...currentApplRow,
                          appliance_purchase_order: e.target.value,
                        })
                      }
                    />

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label='Installed On'
                        value={currentApplRow?.appliance_installed ? dayjs(currentApplRow.appliance_installed) : null}
                        onChange={(date) => {
                          const formattedDate = dayjs(date).format("MM-DD-YYYY");
                          setcurrentApplRow({
                            ...currentApplRow,
                            appliance_installed: formattedDate,
                          });
                        }}
                        textField={(params) => (
                          <TextField
                            {...params}
                            size='small'
                            sx={{
                              "& .MuiInputBase-root": {
                                fontSize: "14px",
                              },
                              "& .MuiSvgIcon-root": {
                                fontSize: "20px",
                              },
                            }}
                          />
                        )}
                        sx={{ marginTop: "10px", width: "535px" }}
                      />
                    </LocalizationProvider>

                    <TextField
                      margin='dense'
                      label='Serial Number'
                      fullWidth
                      variant='outlined'
                      value={currentApplRow?.appliance_serial_num || ""}
                      onChange={(e) =>
                        setcurrentApplRow({
                          ...currentApplRow,
                          appliance_serial_num: e.target.value,
                        })
                      }
                    />
                    <TextField
                      margin='dense'
                      label='Model Number'
                      fullWidth
                      variant='outlined'
                      value={currentApplRow?.appliance_model_num || ""}
                      onChange={(e) =>
                        setcurrentApplRow({
                          ...currentApplRow,
                          appliance_model_num: e.target.value,
                        })
                      }
                    />
                    <TextField
                      margin='dense'
                      label='Warranty Info'
                      fullWidth
                      variant='outlined'
                      value={currentApplRow?.appliance_warranty_info || ""}
                      onChange={(e) =>
                        setcurrentApplRow({
                          ...currentApplRow,
                          appliance_warranty_info: e.target.value,
                        })
                      }
                    />
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label='Warranty Till'
                        value={currentApplRow?.appliance_warranty_till ? dayjs(currentApplRow.appliance_warranty_till) : null}
                        onChange={(date) => {
                          const formattedDate = dayjs(date).format("MM-DD-YYYY");
                          setcurrentApplRow({
                            ...currentApplRow,
                            appliance_warranty_till: formattedDate,
                          });
                        }}
                        textField={(params) => (
                          <TextField
                            {...params}
                            size='small'
                            sx={{
                              "& .MuiInputBase-root": {
                                fontSize: "14px",
                              },
                              "& .MuiSvgIcon-root": {
                                fontSize: "20px",
                              },
                            }}
                          />
                        )}
                        sx={{ marginTop: "10px", width: "535px" }}
                      />
                    </LocalizationProvider>
                    <TextField
                      margin='dense'
                      label='URLs'
                      fullWidth
                      variant='outlined'
                      value={currentApplRow?.appliance_url || ""}
                      onChange={(e) => setcurrentApplRow({ ...currentApplRow, appliance_url: e.target.value })}
                    />
                  </DialogContent>
                  <DialogActions sx={{ alignContent: "center", justifyContent: "center" }}>
                    <Button
                      variant='outlined'
                      sx={{
                        background: "#3D5CAC",
                        color: theme.palette.background.default,
                        cursor: "pointer",
                        textTransform: "none",
                        width: "30%",
                        fontWeight: theme.typography.secondary.fontWeight,
                        fontSize: theme.typography.smallFont,
                      }}
                      size='small'
                      onClick={handleClose}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant='outlined'
                      sx={{
                        background: "#3D5CAC",
                        color: theme.palette.background.default,
                        cursor: "pointer",
                        textTransform: "none",
                        width: "30%",
                        fontWeight: theme.typography.secondary.fontWeight,
                        fontSize: theme.typography.smallFont,
                      }}
                      size='small'
                      onClick={handleAddAppln}
                    >
                      Save
                    </Button>
                  </DialogActions>
                </Dialog>
              </Box>
            </Card>
          </Grid>
          {/* End Appliances grid */}
        </Box>
        {/* End Property Detail Cards */}
      </Box>
    </Paper>
  );
}
