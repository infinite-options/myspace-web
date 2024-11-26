import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Paper,
  Grid,
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
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import PropTypes from "prop-types";
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
import { getPaymentStatusColor, getPaymentStatus } from "./PropertiesList.jsx";
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
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import ImageUploader from "../ImageUploader";
import { maintenanceOwnerDataCollectAndProcess } from "../Maintenance/MaintenanceOwner.jsx";
import { maintenanceManagerDataCollectAndProcess } from "../Maintenance/MaintenanceManager.jsx";

import APIConfig from "../../utils/APIConfig";
import { v4 as uuidv4 } from "uuid";
import InfoIcon from "@mui/icons-material/Info";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";

import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import useMediaQuery from "@mui/material/useMediaQuery";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { CollectionsBookmarkRounded } from "@mui/icons-material";
import PropertiesContext from "../../contexts/PropertiesContext";
import ListsContext from "../../contexts/ListsContext.js";
import LeaseDetailsComponent from "./LeaseDetailsComponent.jsx";
import ManagementDetailsComponent from "./ManagementDetailsComponent.jsx";
import ManagementContractContext from "../../contexts/ManagementContractContext";

import { getFeesDueBy, getFeesAvailableToPay, getFeesLateBy } from "../../utils/fees";
import ReferTenantDialog from "../Referral/ReferTenantDialog.jsx";

const getAppColor = (app) => {
  if (app.lease_status === "RENEW NEW") {
    return "#2E7D32"; // Return green if lease_status contains 'RENEW'
  } else if (app.lease_status === "REJECTED" || app.lease_status === "RENEW WITHDRAWN") {
    return "#A52A2A"; // Red color for rejected
  } else if (app.lease_status === "REFUSED") {
    return "#874499"; // Purple color for refused
  } else {
    return "#778DC5"; // Default blue color for other statuses
  }
};

export default function PropertyNavigator2({
  rawPropertyData,
  contracts,
  isDesktop = true,
  onEditClick,
  onViewLeaseClick,
  onViewContractClick,
  onManageContractClick,
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
  setViewRHS,
}) {
  // console.log("In Property Navigator", onEditClick);
  // console.log(index, propertyList);
  // console.log("props contracts", contracts);
  const navigate = useNavigate();
  const { getList } = useContext(ListsContext);
  const { getProfileId, isManager, roleName, selectedRole } = useUser();

  const propertiesContext = useContext(PropertiesContext);
  const {
    propertyList: propertyListFromContext,
    allRentStatus: allRentStatusFromContext,
    // allContracts: allContractsFromContext,
    returnIndex: returnIndexFromContext,
    updateAppliances: updateAppliancesFromContext,
  } = propertiesContext || {};

  const managementContractContext = useContext(ManagementContractContext);
  const { allContracts: allContractsFromContext, fetchContracts } = managementContractContext || {};

  const propertyList = propertyListFromContext || [];
  const allRentStatus = allRentStatusFromContext || [];
  const allContracts = allContractsFromContext || [];
  const allLeases = allContractsFromContext || [];
  const returnIndex = returnIndexFromContext || 0;
  const updateAppliances = updateAppliancesFromContext;

  const [currentTab, setCurrentTab] = useState(0);
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
  const [showReferTenantDialog, setShowReferTenantDialog] = useState(false);
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
  const [isReadOnly, setIsReadOnly] = useState(false);

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // console.log("PropertyNavigator - location state allRentStatus - ", allRentStatus);

  // const getDataFromAPI = async () => {
  //   const url = `${APIConfig.baseURL.dev}/contacts/${getProfileId()}`;
  //   // const url = `${APIConfig.baseURL.dev}/contacts/600-000003`;
  //   try {
  //     const response = await axios.get(url);
  //     // console.log("--response in nav----", response);
  //     const data = response["management_contacts"];
  //     // console.log("--response data----", data);
  //     const ownerContacts = data["owners"];
  //     // console.log("--response ownerContacts----", ownerContacts);
  //     setContactDetails(ownerContacts);
  //   } catch (error) {
  //     // console.log("Error fetching owner contacts: ", error);
  //   }
  // };

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
    console.log("210 - PropertyNavigator - allRentStatus - ", allRentStatus);
  }, [allRentStatus]);

  useEffect(() => {
    console.log("210 - PropertyNavigator - propertyRentStatus - ", propertyRentStatus);
  }, [propertyRentStatus]);

  useEffect(() => {
    // getDataFromAPI();
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

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setSelectedImageList([]);
    setOpen(false);
  };

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
  const [renewContracts, setRenewContracts] = useState([]);
  const [contractsNewSent, setContractsNewSent] = useState(0);
  const [maintenanceReqData, setMaintenanceReqData] = useState([{}]);
  // console.log('Maintenance Request Data1: ', maintenanceReqData);
  const [displayMaintenanceData, setDisplayMaintenanceData] = useState([{}]);
  const [newContractCount, setNewContractCount] = useState(0);
  const [sentContractCount, setSentContractCount] = useState(0);

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
    // console.log("parsedPropertyImages - ", parsedPropertyImages);
    // console.log("propertyList[nextIndex].property_favorite_image - ", propertyList[nextIndex]?.property_favorite_image);
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
      var newContractCount = 0;
      var sentContractCount = 0;
      // console.log("PropertyNavigator - allContracts - ", allContracts);
      // console.log("PropertyNavigator - propertyId - ", propertyId);
      const filtered = allContracts?.filter((contract) => {
        const contractPropertyID = contract.property_id || contract.property_uid;
        return contractPropertyID === propertyId;
      });
      console.log("PropertyNavigator - filtered - ", filtered);
      const active = filtered?.filter((contract) => contract.contract_status === "ACTIVE");

      if (filtered?.length > 1 && active?.length > 0) {
        const renew = filtered?.filter(
          (contract) =>
            (contract.contract_status === "SENT" || contract.contract_status === "NEW" || contract.contract_status === "APPROVED" || contract.contract_status === "REJECTED") &&
            contract.business_uid === active[0].business_uid
        );
        setRenewContracts(renew);
      } else {
        setRenewContracts([]);
      }
      // console.log("322 - PropertyNavigator - filtered contracts - ", filtered);
      filtered.forEach((contract) => {
        if (contract.contract_status === "SENT") {
          count++;
          sentContractCount++;
        }
        if (contract.contract_status === "NEW") {
          count++;
          newContractCount++;
        }
      });
      // console.log("PropertyNavigator - Active contract - ", active);
      setContractsNewSent(count);
      setContractsData(allContracts);
      setActiveContracts(active);
      setNewContractCount(newContractCount);
      setSentContractCount(sentContractCount);

      const rentDetails = getRentStatus();
      // console.log("rentDetails - ", rentDetails);
      setpropertyRentStatus(rentDetails);

      if (property.lease_fees !== null) {
        const rent = JSON.parse(propertyData[currentIndex].lease_fees).find((fee) => fee.fee_name === "Rent");
        setrentFee(rent);
        // console.log('check rent', rent);
      } else {
        setrentFee(null);
      }

      const propertyApplicances = JSON.parse(propertyData[currentIndex].appliances);
      // console.log("Appliances ****", propertyApplicances);
      // console.log("applianceUIDToCategoryMap is %%", applianceUIDToCategoryMap);
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
  // useEffect(() => {
  //   const fetchDashboardData = async () => {
  //     setShowSpinner(true);
  //     try {
  //       const response = await fetch(`${APIConfig.baseURL.dev}/dashboard/${getProfileId()}`);
  //       // const response = await fetch(`${APIConfig.baseURL.dev}/dashboard/600-000003`);
  //       if (!response.ok) {
  //         throw new Error("Failed to fetch dashboard data");
  //       }
  //       const jsonData = await response.json();
  //       setHappinessData(jsonData.HappinessMatrix);
  //       setdataforhappiness(jsonData);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //     setShowSpinner(false);
  //   };
  //   fetchDashboardData();
  // }, [dashboard_id]);

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

  const handleBackButton = () => {
    if (isMobile && setViewRHS) {
      setViewRHS(false);
    }
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
  };

  const handleAppClick = (index) => {
    handleViewApplication(index);
    const state = { index: index, propertyIndex: currentIndex, property: property, isDesktop: isDesktop };
    // setTenantAppNavState(state);
  };

  const getRentStatus = () => {
    try {
      const rentStatus = allRentStatus.filter((data) => data.property_uid == currentId && data?.rent_status != "VACANT");
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const formatData = (data) => {
        return data.map((item, index) => {
          // console.log("item - ", item.rent_detail_index);
          // console.log("Latest Data Formatted to catch SPLIT Issue: ", item.latest_date);
          return {
            ...item,
            // idx: index,
            cf_monthName: monthNames[item.cf_month - 1],
            total_paid_formatted: item.total_paid ? `$${item.total_paid}` : "-",
            latest_date_formatted: item.latest_date ? item.latest_date : "-",
            // latest_date_formatted: item.latest_date || "-",
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
    } else if (value === "PARTIALLY PAID") {
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
      flex: isMobile ? 0.3 : 0.5,
      minWidth: 60,
      renderCell: (params) => {
        return <Box sx={{ width: "100%", color: "#3D5CAC" }}>{params.value}</Box>;
      },
    },
    {
      field: "purchase_type",
      headerName: "Category",
      sortable: isDesktop,
      flex: 1,
      minWidth: 100,
      renderCell: (params) => {
        return <Box sx={{ width: "100%", color: "#3D5CAC" }}>{params.value}</Box>;
      },
    },
    {
      field: "latest_date_formatted",
      headerName: "Date Paid",
      sortable: isDesktop,
      // flex: 1,
      // renderCell: (params) => {
      //   return <Box sx={{ width: "100%", color: "#3D5CAC" }}>{params.value.split(" ")[0]}</Box>;
      // },
      minWidth: 100,
      renderCell: (params) => {
        const value = params.value || "-";
        return <Box sx={{ width: "100%", color: "#3D5CAC" }}>{value.split(" ")[0]}</Box>;
      },
    },
    {
      // field: 'total_paid_formatted',\
      field: "pur_amount_due",
      headerName: "Amount",
      sortable: isDesktop,
      flex: 0.7,
      minWidth: 90,
      renderCell: (params) => {
        return <Box sx={{ width: "100%", color: "#3D5CAC" }}>{params.value}</Box>;
      },
    },
    {
        // field: 'total_paid_formatted',\
        field: "total_paid",
        headerName: "Total Paid",
        sortable: isDesktop,
        flex: 0.7,
        minWidth: 90,
        renderCell: (params) => {
          return <Box sx={{ width: "100%", color: "#3D5CAC" }}>{params.value ? params.value : "-"}</Box>;
        },
    },    

    {
      field: "rent_status",
      headerName: "Rent Status",
      sortable: isDesktop,
      flex: 1,
      minWidth: 100,
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
        // field: 'total_paid_formatted',\
        field: "pur_due_date",
        headerName: "Due Date",
        sortable: isDesktop,
        flex: 0.7,
        minWidth: 90,
        renderCell: (params) => {
          return <Box sx={{ width: "100%", color: "#3D5CAC" }}>{params.value?.split(" ")[0]}</Box>;
        },
    },
    // {
    //   field: "fees",
    //   headerName: "Late Fees",
    //   sortable: isDesktop,
    //   flex: 1,
    //   renderCell: (params) => {
    //     return <Box sx={{ width: "100%", color: getLateFeesColor(params.row) }}>{params.row.lf_pur_amount_due}</Box>;
    //   },
    // },
    ...(!isMobile
      ? [
          {
            field: "pur_description",
            headerName: "Notes",
            sortable: isDesktop,
            flex: 3,
            minWidth: 250,
            renderCell: (params) => {
              return <Box sx={{ width: "100%", color: "#3D5CAC" }}>{params.value}</Box>;
            },
          },
        ]
      : []),
    // {
    //   field: "pur_description",
    //   headerName: "Notes",
    //   sortable: isDesktop,
    //   flex: 3,
    //   renderCell: (params) => {
    //     return <Box sx={{ width: "100%", color: "#3D5CAC" }}>{params.value}</Box>;
    //   },
    // },
  ];

  const handleEditClick = async (row) => {
    const sortedImages = sortByFavImage(row.appliance_favorite_image, row.appliance_images);
    if (sortedImages) {
      row.appliance_images = sortedImages;
    }
    console.log("handleEditClick - row - ", row);
    await setIsReadOnly(false);
    await setInitialApplData(row);
    await setcurrentApplRow(row);
    await setModifiedApplRow({ appliance_uid: row.appliance_uid });
    // console.log("---currentApplRow?.appliance_favorite_image---", row);
    await setFavImage(row?.appliance_favorite_image);
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
        const updatedData = appliances.filter((appliance) => appliance.appliance_uid !== id);
        setAppliances(updatedData);
        updateAppliances(propertyId, updatedData);
      } else {
        console.error("Failed to delete the appliance. Status code:", response.status);
      }
    } catch (error) {
      console.error("Error deleting the appliance:", error);
    }
  };

  const [dataGridKey, setDataGridKey] = useState(0);
  const [forceRender, setForceRender] = useState(false);

  const getAppliances = async () => {
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Credentials": "*",
    };
    axios
      .get(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/appliances/${propertyId}`)
      .then((response) => {
        // console.log(typeof (response.data.result));
        // console.log(response.data.result);
        const updatedData = response.data.result.map((appln) => {
          const { list_item, list_uid, list_category, appliance_images, ...rest } = appln;
          return {
            appliance_item: list_item,
            appliance_type: list_uid,
            appliance_category: list_category,
            appliance_images: JSON.parse(appliance_images),
            ...rest,
          };
        });
        console.log("updatedData", updatedData);
        setAppliances(updatedData);
        // Call the function to update appliances in the properties context for the specified property
        updateAppliances(propertyId, updatedData);
        setDeletedIcons(currentApplRow?.appliance_images ? new Array(currentApplRow.appliance_images.length).fill(false) : []);
      })
      .catch((err) => {
        console.log(err);
      });
  };

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
        if (appliance[key] !== "") {
          applianceFormData.append(key, appliance[key]);
        }
      });
      // console.log(" editOrUpdateProfile - profileFormData - ");
      // for (var pair of profileFormData.entries()) {
      //   console.log(pair[0]+ ', ' + pair[1]);
      // }
      let i = 0;
      console.log("selectedimage", selectedImageList);
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
            applianceFormData.append("appliance_favorite_image", key);
          }
        }
      }
      axios
        .post("https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/appliances", applianceFormData, headers)
        .then((response) => {
          // Check if the response contains the `appliance_uid`
          const newApplianceUID = response?.data?.appliance_UID;
          if (newApplianceUID) {
            if (selectedImageList.length == 0) {
              // console.log("Data updated successfully", response);
              // showSnackbar("Your profile has been successfully updated.", "success");
              // handleUpdate();
              // console.log("Appliance befor", appliance);
              // console.log("applianceUIDToCategoryMap is %%", applianceUIDToCategoryMap);
              const applianceCategory = applianceUIDToCategoryMap[appliance.appliance_type];
              // console.log("Appliance is $$", applianceCategory);
              setAppliances([...appliances, { ...appliance, appliance_uid: newApplianceUID, appliance_item: applianceCategory }]);
            } else {
              getAppliances();
            }
          }
          setShowSpinner(false);
          setSelectedImageList([]);
          handleClose();
          // window.location.reload(); //change here for alt referesh
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

      if (currentApplRow.appliance_images.length > 0) {
        applianceFormData.append("appliance_images", JSON.stringify(currentApplRow.appliance_images));
      }

      // if (favImage != null) {
      //   applianceFormData.append("appliance_favorite_image", favImage);
      // }
      console.log(favImage);
      let i = 0;
      for (const file of selectedImageList) {
        console.log("file prop", file);
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
          if (selectedImageList.length === 0 && imagesTobeDeleted.length === 0) {
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
          } else {
            getAppliances();
          }

          setShowSpinner(false);
          setSelectedImageList([]);
          setImagesTobeDeleted([]);
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
    setFavImage("");
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
  // const ImageCell = (params) => {
  //   // console.log("---params----", params);
  //   let images;
  //   try {
  //     images = JSON.parse(params.value); // Try to parse as JSON
  //   } catch (e) {
  //     images = params.value; // If parsing fails, treat as a single URL string
  //   }
  //   // console.log("---images----", images);
  //   const imageUrl = images?.length > 0 ? images[0] : ""; // Get the first image URL
  //   const appliance = params.row;
  //   const favImage = appliance.appliance_favorite_image;

  //   return (
  //     <Avatar
  //       src={favImage}
  //       alt='Appliance'
  //       sx={{
  //         borderRadius: "0",
  //         width: "60px",
  //         height: "60px",
  //         margin: "0px",
  //         padding: "0px",
  //       }}
  //     />
  //   );
  // };

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

  const handleInfoClick = (row) => {
    const sortedImages = sortByFavImage(row.appliance_favorite_image, row.appliance_images);
    if (sortedImages) {
      row.appliance_images = sortedImages;
    }
    setcurrentApplRow(row);
    setIsEditing(false); // This will ensure that edit options are disabled
    setIsReadOnly(true); // Set read-only mode for Info button click
    handleOpen(); // Open the dialog
  };

  const applnColumns = [
    // { field: "appliance_uid", headerName: "UID", width: 80 },
    { field: "appliance_item", headerName: "Appliance", flex: 1 },
    {
      field: "avatar",
      headerName: "",
      // width: 80,
      flex: 0.8,
      renderCell: (params) => (
        <Box
          sx={{
            width: "70px",
            height: "70px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden", // Ensures no overflow
          }}
        >
          <img
            src={`${params.row.appliance_favorite_image}`}
            alt='Appliance'
            style={{
              width: "100%", // Ensures the image takes full width
              height: "auto", // Maintain aspect ratio
            }}
          />
        </Box>
      ),
    },
    ...(!isMobile
      ? [
          {
            field: "appliance_purchased_from",
            headerName: "Purchased From",
            flex: 1,
          },
          {
            field: "appliance_purchased",
            headerName: "Purchased On",
            flex: 1,
          },
          {
            field: "appliance_warranty_till",
            headerName: "Warranty Till",
            flex: 1,
          },
        ]
      : []),
    // { field: "appliance_desc", headerName: "Description", width: 80 },
    // { field: "appliance_manufacturer", headerName: "Manufacturer", width: 80 },
    // { field: "appliance_purchased_from", headerName: "Purchased From", flex:1 },
    // { field: "appliance_purchased", headerName: "Purchased On", flex: 1},
    //{ field: "appliance_purchase_order", headerName: "Purchase Order Number", width: 80 },
    // { field: "appliance_installed", headerName: "Installed On", flex: 1 },
    //{ field: "appliance_serial_num", headerName: "Serial Number", width: 80 },
    //{ field: "appliance_model_num", headerName: "Model Number", width: 80 },
    // { field: "appliance_warranty_till", headerName: "Warranty Till", flex: 1 },
    //{ field: "appliance_warranty_info", headerName: "Warranty Info", width: 80 },
    //{ field: "appliance_url", headerName: "URLs", width: 80 },
    //{ field: "appliance_images", headerName: "Image", width: 100, renderCell: ImageCell }, //appliance_favorite_image needs to be added
    //{ field: "appliance_documents", headerName: "Documents", width: 80 },

    {
      field: "actions",
      headerName: "Actions",
      // width: 120,
      flex: 1,
      renderCell: (params) => {
        return (
          <Box sx={{ display: "flex", width: "100%" }}>
            <IconButton onClick={() => handleInfoClick(params.row)}>
              <InfoIcon />
            </IconButton>
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
      // console.log("Favorite Icons Updated:", newFavoriteIcons);
    }
  }, [currentApplRow, propertyData, currentIndex]);

  // console.log("Favorite Icons:", favoriteIcons);

  const handleDelete = (index) => {
    const updatedDeletedIcons = [...deletedIcons];
    updatedDeletedIcons[index] = !updatedDeletedIcons[index];
    setDeletedIcons(updatedDeletedIcons);

    const imageToDelete = currentApplRow.appliance_images[index];
    setImagesTobeDeleted((prev) => [...prev, imageToDelete]);

    // console.log("Delete image at index:", deletedIcons);
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

    // console.log(`Favorite image at index: ${index}`);
  };

  const handleUpdateFavoriteIcons = () => {
    setFavoriteIcons(new Array(favoriteIcons.length).fill(false));
  };

  const sortByFavImage = (favImage, imageList) => {
    if (!favImage || !imageList) return;

    const sortedImages = [favImage, ...imageList.filter((img) => img !== favImage)];
    return sortedImages;
  };

  const handleTenantClick = (tenantId) => {
    if (selectedRole === "MANAGER" || selectedRole === "OWNER") {
      if (tenant_detail === "No Tenant") {
        // console.log("There is no tenant");
      } else {
        // console.log("Else statement for if there is a tenant");
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
      // console.error("Missing appliance_uid for row:", row);
    }
  });

  const tabSX = {
    height: "30px",
    minHeight: "30px",
    maxHeight: "30px",
    backgroundColor: "#C5C6C7",
    textTransform: "none",
    fontWeight: "bold",
    color: "#FFFFFF",
    borderTopLeftRadius: "8px",
    borderTopRightRadius: "8px",
    "&.Mui-selected": {
      color: "#160449",
      backgroundColor: "#FFFFFF",
    },
  };

  return (
    <Paper
      style={{
        marginTop: "10px",
        backgroundColor: theme.palette.primary.main,
        height: "96%",
        width: "100%", // Occupy full width with 25px margins on each side
        paddingBottom: "20px",
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
          // height: "100%",
        }}
      >
        {isMobile && (
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={handleBackButton}>
              <CloseIcon sx={{ color: theme.typography.common.blue, fontSize: "30px" }} />
            </Button>
          </Box>
        )}

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
                ? property.property_unit
                  ? `${property.property_address} #${property.property_unit}, ${property.property_city} ${property.property_state} ${property.property_zip}`
                  : `${property.property_address}, ${property.property_city} ${property.property_state} ${property.property_zip}`
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
      </Box>
      <Box sx={{ marginTop: "26px", padding: isMobile ? "0px" : "20px" }}>
        <Box sx={{ height: "30px" }}>
          <Tabs sx={{ height: "30px" }} value={currentTab} onChange={handleTabChange} aria-label='property details' variant='fullWidth' indicatorColor='none'>
            <Tab label='Property' {...a11yProps(0)} sx={tabSX} />
            <Tab label='Lease' {...a11yProps(1)} sx={tabSX} />
            <Tab label={isMobile ? "PM" : "Management"} {...a11yProps(2)} sx={tabSX} />
            <Tab label={isMobile ? "Rent" : "Rent History"} {...a11yProps(2)} sx={tabSX} />
            <Tab label='Appliances' {...a11yProps(2)} sx={tabSX} />
          </Tabs>
        </Box>
        <CustomTabPanel value={currentTab} index={0}>
          <PropertyTabPanel
            activeStep={activeStep}
            images={images}
            maxSteps={maxSteps}
            property={property}
            onAddListingClick={onAddListingClick}
            onShowSearchManager={onShowSearchManager}
            onEditClick={onEditClick}
          />
        </CustomTabPanel>
        <CustomTabPanel value={currentTab} index={1}>
          <Grid item xs={12} sx={{ padding: "10px" }}>
            <LeaseDetailsComponent
              handleViewContractClick={handleViewContractClick}
              handleManageContractClick={onManageContractClick}
              activeLease={activeContracts[0]}
              currentProperty={property}
              selectedRole={selectedRole}
              handleViewPMQuotesRequested={handleViewPMQuotesRequested}
              newContractCount={newContractCount}
              sentContractCount={sentContractCount}
              currentIndex={currentIndex}
              handleOpenMaintenancePage={handleOpenMaintenancePage}
              onShowSearchManager={onShowSearchManager}
              handleAppClick={handleAppClick}
              getAppColor={getAppColor}
            />
          </Grid>
        </CustomTabPanel>
        <CustomTabPanel value={currentTab} index={2}>
          <Grid item xs={12} sx={{ padding: "10px" }}>
            <ManagementDetailsComponent
              handleViewContractClick={handleViewContractClick}
              handleManageContractClick={onManageContractClick}
              activeContract={activeContracts[0]}
              renewContract={renewContracts[0]}
              currentProperty={property}
              selectedRole={selectedRole}
              handleViewPMQuotesRequested={handleViewPMQuotesRequested}
              newContractCount={newContractCount}
              sentContractCount={sentContractCount}
              currentIndex={currentIndex}
              handleOpenMaintenancePage={handleOpenMaintenancePage}
              onShowSearchManager={onShowSearchManager}
            />
          </Grid>
        </CustomTabPanel>
        <CustomTabPanel value={currentTab} index={3}>
          <Grid item xs={12} sx={{ padding: "10px" }}>
            <Card sx={{ height: "100%" }}>
              <Typography
                sx={{
                  color: theme.typography.primary.black,
                  fontWeight: theme.typography.primary.fontWeight,
                  fontSize: theme.typography.largeFont,
                  textAlign: "center",
                  marginTop: "10px",
                }}
              >
                Rent History by Category
              </Typography>
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-around",
                  width: "100%",
                  overflowX: "auto",
                }}
              >
                <Grid item xs={12} sx={{overflowX: 'auto', }}>
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
                        minWidth: "700px",
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
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </CustomTabPanel>
        <CustomTabPanel value={currentTab} index={4}>
          <Grid item xs={12} md={12} sx={{ padding: "10px" }}>
            <Card sx={{ height: "100%" }}>
              <Box sx={{ margin: "0px 15px 15px 15px" }}>
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
                  <IconButton
                    variant='outlined'
                    sx={{
                      cursor: "pointer",
                      textTransform: "none",
                      minWidth: "30px",
                      minHeight: "30px",
                      fontWeight: theme.typography.secondary.fontWeight,
                      fontSize: theme.typography.smallFont,
                    }}
                    size='small'
                    onClick={() => {
                      setIsReadOnly(false);
                      setcurrentApplRow({
                        appliance_uid: "",
                        appliance_url: "",
                        appliance_type: "",
                        appliance_desc: "",
                        appliance_images: "",
                        appliance_available: 0,
                        appliance_installed: "",
                        appliance_model_num: "",
                        appliance_purchased: "",
                        appliance_serial_num: "",
                        appliance_property_id: propertyId,
                        appliance_manufacturer: "",
                        appliance_warranty_info: "",
                        appliance_warranty_till: "",
                        appliance_purchase_order: "",
                        appliance_purchased_from: "",
                        appliance_favorite_image: "",
                      });
                      setIsEditing(false);
                      handleOpen();
                    }}
                  >
                    <AddIcon sx={{ color: "black", fontSize: "24px" }} />
                  </IconButton>
                </Box>
                <Box>
                  <DataGrid
                    rows={appliances}
                    columns={applnColumns}
                    pageSize={5}
                    rowsPerPageOptions={[5, 10, 15]}
                    initialState={{
                      pagination: {
                        paginationModel: {
                          pageSize: 5,
                          page: 0,
                        },
                      },
                    }}
                    getRowId={(row) => row.appliance_uid}
                    autoHeight
                    sx={{
                      // minWidth: "700px",
                      fontSize: "14px",
                      "& .wrap-text": {
                        whiteSpace: "normal !important",
                        wordWrap: "break-word !important",
                        overflow: "visible !important",
                      },
                    }}
                  />
                </Box>
                <Snackbar open={snackbarOpen} onClose={handleSnackbarClose} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
                  <Alert onClose={handleSnackbarClose} severity='error' sx={{ width: "100%" }}>
                    Please fill in all required fields.
                  </Alert>
                </Snackbar>
                <Dialog open={open} onClose={handleClose}>
                  <DialogTitle>{isReadOnly ? "View Appliance" : isEditing ? "Edit Appliance" : "Add New Appliance"}</DialogTitle>
                  <DialogContent>
                    {/* Appliance UID */}
                    <TextField margin='dense' label='Appliance UID' fullWidth variant='outlined' value={currentApplRow?.appliance_uid || ""} disabled={isReadOnly} />
                    <FormControl margin='dense' fullWidth variant='outlined' sx={{ marginTop: "10px" }}>
                      <InputLabel required>Appliance Type</InputLabel>
                      <Select
                        margin='dense'
                        label='Appliance Type'
                        fullWidth
                        required
                        disabled={isReadOnly}
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
                    {(isEditing || isReadOnly) && (
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
                                      position: "relative",
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

                                    {/* Conditionally render delete icon if not read-only */}
                                    {!isReadOnly && (
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
                                    )}

                                    {/* Conditionally render favorite icon if not read-only */}
                                    {!isReadOnly && (
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
                                    )}
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
                    {!isReadOnly && (
                      <ImageUploader
                        selectedImageList={selectedImageList}
                        setSelectedImageList={setSelectedImageList}
                        page={"Add"}
                        setDeletedImageList={setDeletedImageList}
                        setFavImage={setFavImage}
                        favImage={favImage}
                        updateFavoriteIcons={handleUpdateFavoriteIcons}
                      />
                    )}
                    <TextField
                      margin='dense'
                      label='Description'
                      fullWidth
                      variant='outlined'
                      disabled={isReadOnly}
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
                      disabled={isReadOnly}
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
                      disabled={isReadOnly}
                    />
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DesktopDatePicker
                        label='Purchased On'
                        value={currentApplRow?.appliance_purchased ? dayjs(currentApplRow.appliance_purchased) : null}
                        onChange={(date) => {
                          const formattedDate = dayjs(date).format("MM-DD-YYYY");
                          setcurrentApplRow({
                            ...currentApplRow,
                            appliance_purchased: formattedDate,
                          });
                        }}
                        disabled={isReadOnly}
                        textField={(params) => (
                          <TextField
                            {...params}
                            margin='dense'
                            fullWidth
                            size='small'
                            disabled={isReadOnly}
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
                        slotProps={{ textField: { fullWidth: true } }}
                        sx={{ marginTop: "10px" }}
                      />
                    </LocalizationProvider>
                    <TextField
                      margin='dense'
                      label='Purchase Order Number'
                      fullWidth
                      variant='outlined'
                      disabled={isReadOnly}
                      value={currentApplRow?.appliance_purchase_order || ""}
                      onChange={(e) =>
                        setcurrentApplRow({
                          ...currentApplRow,
                          appliance_purchase_order: e.target.value,
                        })
                      }
                    />

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DesktopDatePicker
                        label='Installed On'
                        disabled={isReadOnly}
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
                            disabled={isReadOnly}
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
                        slotProps={{ textField: { fullWidth: true } }}
                        sx={{ marginTop: "10px" }}
                      />
                    </LocalizationProvider>

                    <TextField
                      margin='dense'
                      label='Serial Number'
                      fullWidth
                      variant='outlined'
                      value={currentApplRow?.appliance_serial_num || ""}
                      disabled={isReadOnly}
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
                      disabled={isReadOnly}
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
                      disabled={isReadOnly}
                      onChange={(e) =>
                        setcurrentApplRow({
                          ...currentApplRow,
                          appliance_warranty_info: e.target.value,
                        })
                      }
                    />
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DesktopDatePicker
                        label='Warranty Till'
                        disabled={isReadOnly}
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
                            disabled={isReadOnly}
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
                        slotProps={{ textField: { fullWidth: true } }}
                        sx={{ marginTop: "10px" }}
                      />
                    </LocalizationProvider>
                    <TextField
                      margin='dense'
                      label='URLs'
                      disabled={isReadOnly}
                      fullWidth
                      variant='outlined'
                      value={currentApplRow?.appliance_url || ""}
                      onChange={(e) => setcurrentApplRow({ ...currentApplRow, appliance_url: e.target.value })}
                    />
                  </DialogContent>
                  <DialogActions sx={{ alignContent: "center", justifyContent: "center" }}>
                    {isReadOnly ? (
                      // Show "Close" button only if it's read-only
                      <IconButton onClick={handleClose} sx={{ position: "absolute", top: 8, right: 8 }}>
                        <CloseIcon variant='icon' />
                      </IconButton>
                    ) : (
                      // Show "Cancel" and "Save" buttons if not read-only
                      <>
                        <Button
                          variant='contained'
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
                          variant='contained'
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
                      </>
                    )}
                  </DialogActions>
                </Dialog>
                {<ReferTenantDialog open={showReferTenantDialog} onClose={() => setShowReferTenantDialog(false)} setShowSpinner={setShowSpinner} property={property} />}
              </Box>
            </Card>
          </Grid>
        </CustomTabPanel>
      </Box>
    </Paper>
  );
}

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div role='tabpanel' hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {/* {value === index && <Box sx={{ p: 3 }}>{children}</Box>} */}
      {value === index && (
        <Grid sx={{ paddingBottom: "10px", backgroundColor: "#FFFFFF", borderBottomLeftRadius: "8px", borderBottomRightRadius: "8px" }} container>
          {children}
        </Grid>
      )}
    </div>
  );
}
CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const PropertyTabPanel = (props) => {
  const property = props.property;
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { getProfileId, isManager, roleName, selectedRole } = useUser();

  const [activeStep, setActiveStep] = useState(props.activeStep);

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

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  useEffect(() => {
    setActiveStep(props.activeStep);
  }, [props.activeStep]);

  return (
    <Grid container sx={{ padding: "10px" }}>
      <Grid item xs={12} sx={{ marginBottom: "40px" }}>
        <Card
          sx={{
            // backgroundColor: theme.palette.form.main,
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
            <Grid item xs={12} sx={{ maxHeight: "40px" }}>
              <Typography
                sx={{
                  color: "#160449",
                  fontWeight: theme.typography.primary.fontWeight,
                  fontSize: theme.typography.largeFont,
                  textAlign: "center",
                }}
              >
                Property Details
              </Typography>
            </Grid>
            {/* <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "space-between",
                            height: isMobile ? "300px" : "500px",
                            width: "100%",
                        }}
                    >                        
                        <CardMedia
                        component='img'
                        image={props.images[activeStep]}
                        sx={{
                            elevation: "0",
                            boxShadow: "none",
                            flexGrow: 1,
                            // objectFit: isMobile ? "contain" : "cover",
                            // objectFit: "contain",
                            objectFit: "cover",
                            // objectFit: "none",
                            // objectFit: "scale-down",
                            width: "100%",
                            height: isMobile ? "200px" : "400px",
                        }}
                        />                        
                        <MobileStepper
                            steps={props.maxSteps}
                            position='static'
                            activeStep={activeStep}
                            variant='text'
                            sx={{
                                // backgroundColor: theme.palette.form.main,
                                width: "100%",
                                justifyContent: "center",
                                alignContent: "center",
                                alignItems: "center",
                                elevation: "0",
                                boxShadow: "none",
                            }}
                            nextButton={
                                <Button size='small' onClick={handleNext} disabled={activeStep === props.maxSteps - 1} sx={{ minWidth: "40px", width: "40px" }}>
                                    {theme.direction === "rtl" ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
                                </Button>
                            }
                            backButton={
                                <Button size='small' onClick={handleBack} disabled={activeStep === 0} sx={{ minWidth: "40px", width: "40px" }}>
                                    {theme.direction === "rtl" ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
                                </Button>
                            }
                        />
                    </Box> */}
            <Grid item xs={12}>
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
                      {props.images?.map((image, index) => (
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
                              height: isMobile ? "200px" : "150px",
                              width: isMobile ? "350px" : "150px",
                              objectFit: "cover",
                            }}
                          />
                        </ImageListItem>
                      ))}
                    </ImageList>
                  </Box>
                </Box>
                <IconButton onClick={() => handleScroll("right")}>
                  <ArrowForwardIosIcon />
                </IconButton>
              </Box>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid container item xs={12} justifyContent='center'>
        <Grid container item xs={10}>
          <Grid container item xs={8} sx={{ height: "550px", alignContent: "space-between" }}>
            <Grid container item xs={12}>
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
                  Type:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                {property ? property.property_type : "-"}
              </Grid>
            </Grid>
            <Grid container item xs={12}>
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
                  Sqft:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                {property ? property.property_area : "-"}
              </Grid>
            </Grid>
            <Grid container item xs={12}>
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
                  Bedrooms:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                {property ? property.property_num_beds : "-"}
              </Grid>
            </Grid>
            <Grid container item xs={12}>
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
                  Bathrooms:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                {property ? property.property_num_baths : "-"}
              </Grid>
            </Grid>
            <Grid container item xs={12}>
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
                  Property Value:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                {property ? `$${property.property_value}` : "-"}
              </Grid>
            </Grid>
            <Grid container item xs={12}>
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
                  Assessment Year:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                {property && property.property_value_year ? `${property.property_value_year}` : "-"}
              </Grid>
            </Grid>
            <Grid container item xs={12}>
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
                  $ Per Sq Ft:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                {property && property.property_area ? `$${(property?.property_value / property?.property_area).toFixed(2)}` : "-"}
              </Grid>
            </Grid>
            <Grid container item xs={12}>
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
                  Unit Ammenities:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                {property && property.property_amenities_unit ? `${(property?.property_amenities_unit)}` : "-"}
              </Grid>
            </Grid>
            <Grid container item xs={12}>
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
                  Community Ammenities:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                {property && property.property_amenities_community ? `${(property?.property_amenities_community)}` : "-"}
              </Grid>
            </Grid>
            <Grid container item xs={12}>
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
                  Nearby Ammenities:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                {property && property.property_amenities_nearby ? `${(property?.property_amenities_nearby)}` : "-"}
              </Grid>
            </Grid>
            <Grid container item xs={12}>
        <PropertyDetailsGrid propertyDetails={property?.property_details || '{}'} />
      </Grid></Grid>
          <Grid container item xs={4} justifyContent='center' sx={{ height: "250px", alignContent: "space-between" }}>
            <Grid item xs={10} sx={{ minHeight: "35px" }}>
              {property && property?.property_available_to_rent === 1 && (property.lease_status == null || property.lease_status !== "ACTIVE") && (
                // padding extra on the bottom
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      flexWrap: "wrap",
                      alignContent: "center",
                      justifyContent: "center",
                      backgroundColor: "#76B148",
                      borderRadius: "5px",
                      textTransform: "none",
                      minWidth: "100px",
                      minHeight: "35px",
                      width: "100%",
                    }}
                  >
                    {!isMobile && <CheckIcon sx={{ color: "#FFFFFF", fontSize: isMobile ? "10px" : "18px" }} />}
                    <Typography
                      sx={{
                        textTransform: "none",
                        color: "#FFFFFF",
                        fontWeight: theme.typography.secondary.fontWeight,
                        fontSize: isMobile ? "10px" : theme.typography.smallFont,
                        whiteSpace: "nowrap",
                        marginLeft: "1%", // Adjusting margin for icon and text
                      }}
                    >
                      {"Listed For Rent"}
                    </Typography>
                  </Box>
                </Box>
              )}
              {property &&
                (property?.property_available_to_rent === 0 || property?.property_available_to_rent == null) &&
                (property.business_uid == null || property.business_uid == "") && (
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        flexWrap: "wrap",
                        alignContent: "center",
                        justifyContent: "center",
                        backgroundColor: "none",
                        borderRadius: "5px",
                        textTransform: "none",
                        minWidth: "100px",
                        minHeight: "35px",
                        width: "100%",
                      }}
                    >
                      {/* <CloseIcon sx={{ color: "#FFFFFF", fontSize: "18px" }} />
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
                              </Typography> */}
                    </Box>
                  </Box>
                )}
              {property &&
                property.lease_status &&
                property.lease_status !== "ACTIVE" &&
                (property?.property_available_to_rent === 0 || property?.property_available_to_rent == null) &&
                property.business_uid != null &&
                property.business_uid !== "" && (
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        flexWrap: "wrap",
                        alignContent: "center",
                        justifyContent: "center",
                        backgroundColor: "#A52A2A",
                        borderRadius: "5px",
                        textTransform: "none",
                        minWidth: "100px",
                        minHeight: "35px",
                        width: "100%",
                      }}
                    >
                      <CloseIcon sx={{ color: "#FFFFFF", fontSize: "18px" }} />
                      <Typography
                        sx={{
                          textTransform: "none",
                          color: "#FFFFFF",
                          fontWeight: theme.typography.secondary.fontWeight,
                          fontSize: isMobile ? "10px" : theme.typography.smallFont,
                          whiteSpace: "nowrap",
                          marginLeft: "1%", // Adjusting margin for icon and text
                        }}
                      >
                        {"Not Listed"}
                      </Typography>
                    </Box>
                  </Box>
                )}
              {property && property.lease_status && (property.lease_status === "ACTIVE" || property.lease_status === "ACTIVE M2M") && (
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      flexWrap: "wrap",
                      alignContent: "center",
                      justifyContent: "center",
                      backgroundColor: "#3D5CAC",
                      borderRadius: "5px",
                      textTransform: "none",
                      minWidth: "100px",
                      minHeight: "35px",
                      width: "100%",
                    }}
                  >
                    {!isMobile && <CheckIcon sx={{ color: "#FFFFFF", fontSize: "18px" }} />}
                    <Typography
                      sx={{
                        textTransform: "none",
                        color: "#FFFFFF",
                        fontWeight: theme.typography.secondary.fontWeight,
                        fontSize: isMobile ? "10px" : theme.typography.smallFont,
                        whiteSpace: "nowrap",
                        marginLeft: "1%", // Adjusting margin for icon and text
                      }}
                    >
                      {"Rented"}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Grid>
            <Grid item xs={10}>
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    alignContent: "center",
                    justifyContent: "center",
                    backgroundColor: getPaymentStatusColor(property?.rent_status, property),
                    borderRadius: "5px",
                    textTransform: "none",
                    minWidth: "100px",
                    minHeight: "35px",
                    width: "100%",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    if (getPaymentStatus(property?.rent_status, property) === "Vacant - Not Listed") {
                      props.onAddListingClick("create_listing");
                    } else if (getPaymentStatus(property?.rent_status, property) === "No Manager") {
                      props.onShowSearchManager(1);
                    }
                  }}
                >
                  {/* <CheckIcon sx={{ color: "#FFFFFF", fontSize: "18px" }} /> */}
                  <Typography
                    sx={{
                      textTransform: "none",
                      color: "#FFFFFF",
                      fontWeight: theme.typography.secondary.fontWeight,
                      fontSize: isMobile ? "10px" : theme.typography.smallFont,
                      whiteSpace: "nowrap",
                      marginLeft: "1%", // Adjusting margin for icon and text
                    }}
                  >
                    {getPaymentStatus(property?.rent_status, property)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={10}>
              <Box sx={{ pb: isMobile ? 5 : 0 }}>
                {/* Edit Property Button */}
                <Button
                  variant='contained'
                  sx={{
                    background: "#3D5CAC",
                    color: theme.palette.background.default,
                    cursor: "pointer",
                    textTransform: "none",
                    minWidth: "100px", // Fixed width for the button
                    minHeight: "35px",
                    height: "35px",
                    width: "100%",
                  }}
                  size='small'
                  onClick={() => {
                    // console.log('typeof edit', typeof(onEditClick));
                    props.onEditClick("edit_property");
                  }}
                  // onClick={handleEditButton}
                >
                  {!isMobile && <PostAddIcon sx={{ color: "#FFFFFF", fontSize: "18px", margin: "5px" }} />}
                  <Typography
                    sx={{
                      textTransform: "none",
                      color: "#FFFFFF",
                      fontWeight: theme.typography.secondary.fontWeight,
                      fontSize: isMobile ? "10px" : theme.typography.smallFont,
                      whiteSpace: "nowrap",
                      marginLeft: "1%", // Adjusting margin for icon and text
                    }}
                  >
                    {"Edit Property"}
                  </Typography>
                </Button>
              </Box>
            </Grid>
            <Grid item xs={10}>
              {selectedRole === "MANAGER" && property && property?.property_available_to_rent !== 1 && (
                <Grid item xs={12}>
                  <Button
                    variant='contained'
                    sx={{
                      background: "#3D5CAC",
                      color: theme.palette.background.default,
                      cursor: "pointer",
                      textTransform: "none",
                      minWidth: "100px",
                      minHeight: "35px",
                      width: "100%",
                    }}
                    size='small'
                    onClick={() => props.onAddListingClick("create_listing")}
                  >
                    {!isMobile && <PostAddIcon sx={{ color: "#FFFFFF", fontSize: "18px", margin: "5px" }} />}
                    <Typography
                      sx={{
                        textTransform: "none",
                        color: "#FFFFFF",
                        fontWeight: theme.typography.secondary.fontWeight,
                        fontSize: isMobile ? "10px" : theme.typography.smallFont,
                      }}
                    >
                      {"Create Listing"}
                    </Typography>
                  </Button>
                </Grid>
              )}
              {selectedRole === "MANAGER" && property && property?.property_available_to_rent === 1 && (
                <Grid item xs={12}>
                  <Button
                    variant='contained'
                    sx={{
                      background: "#3D5CAC",
                      color: theme.palette.background.default,
                      cursor: "pointer",
                      textTransform: "none",
                      minWidth: "100px",
                      minHeight: "35px",
                      width: "100%",
                    }}
                    size='small'
                    onClick={() => props.onAddListingClick("edit_listing")}
                  >
                    {!isMobile && <PostAddIcon sx={{ color: "#FFFFFF", fontSize: "18px", margin: "5px" }} />}
                    <Typography
                      sx={{
                        textTransform: "none",
                        color: "#FFFFFF",
                        fontWeight: theme.typography.secondary.fontWeight,
                        fontSize: isMobile ? "10px" : theme.typography.smallFont,
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
        </Grid>
      </Grid>
    </Grid>
  );
};

const PropertyDetailsGrid = ({ propertyDetails }) => {
  const parsedDetails = JSON.parse(propertyDetails);

  const { otherDetails = [], propertyCodes = [], propertyAmenities = [] } = parsedDetails;

  const rows = [
    { type: "Other Details", details: otherDetails },
    { type: "Property Codes", details: propertyCodes },
    { type: "Property Amenities", details: propertyAmenities },
  ];

  return (
    <>
      {rows.map((row, index) => (
        <Grid container item xs={12} key={index} sx={{ marginBottom: 2 }}>
          <Grid item xs={12}>
          <Typography
                  sx={{
                    textTransform: "none",
                    color: theme.typography.primary.black,
                    fontWeight: theme.typography.secondary.fontWeight,
                    fontSize: theme.typography.smallFont,
                    textAlign: "left",
                  }}
                >
              {row.type}:
            </Typography>
          </Grid>
          {row.details.length > 0 ? (
            <>
              {/* Render Headers Once */}
              <Grid container item xs={12} sx={{ fontWeight: "bold", marginBottom: 1 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    Description
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    Days
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    Start Time
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    End Time
                  </Typography>
                </Grid>
              </Grid>
              {/* Render Data Rows */}
              {row.details.map((detail, detailIndex) => (
                <Grid container item xs={12} key={detailIndex} sx={{ marginBottom: 1 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2">{detail.description || "-"}</Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="body2">{detail.days || "-"}</Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="body2">{detail.startTime || "-"}</Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="body2">{detail.endTime || "-"}</Typography>
                  </Grid>
                </Grid>
              ))}
            </>
          ) : '-'}
        </Grid>
      ))}
    </>
  );
};

export const FeesSmallDataGrid = ({ data }) => {
  const commonStyles = {
    color: theme.typography.primary.black,
    fontWeight: theme.typography.light.fontWeight,
    fontSize: theme.typography.smallFont,
  };

  const columns = [
    {
      field: "frequency",
      headerName: "Frequency",
      flex: 1,
      renderHeader: (params) => <strong style={{ fontSize: theme.typography.smallFont }}>{params.colDef.headerName}</strong>,
      renderCell: (params) => <Typography sx={commonStyles}>{params.value}</Typography>,
    },
    {
      field: "fee_name",
      headerName: "Name",
      flex: 1.2,
      renderHeader: (params) => <strong style={{ fontSize: theme.typography.smallFont }}>{params.colDef.headerName}</strong>,
      renderCell: (params) => <Typography sx={commonStyles}>{params.value}</Typography>,
    },
    {
      field: "charge",
      headerName: "Amount",
      flex: 0.8,
      renderHeader: (params) => <strong style={{ fontSize: theme.typography.smallFont }}>{params.colDef.headerName}</strong>,
      renderCell: (params) => {
        const feeType = params.row?.fee_type;
        const charge = params.value;

        return <Typography sx={commonStyles}>{feeType === "PERCENT" ? `${charge}%` : feeType === "FLAT-RATE" ? `$${charge}` : `$${charge}`}</Typography>;
      },
    },
  ];

  // State to store rows with unique id
  const [rowsWithId, setRowsWithId] = useState([]);

  // useEffect to update rowsWithId when data changes
  useEffect(() => {
    if (Array.isArray(JSON.parse(data))) {
      const updatedRows = JSON.parse(data).map((row, index) => ({
        ...row,
        id: row.leaseFees_uid || index, // Ensure unique id
      }));
      setRowsWithId(updatedRows);
    } else {
      setRowsWithId([]); // Fallback if data is not an array
    }
  }, [data]);

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      {" "}
      {/* Adjust height and width as needed */}
      <DataGrid
        rows={rowsWithId}
        columns={columns}
        sx={{
          marginY: "5px",
          overflow: "auto",
          "& .MuiDataGrid-columnHeaders": {
            minHeight: "35px !important",
            maxHeight: "35px !important",
            height: 35,
          },
        }}
        autoHeight
        rowHeight={35}
        hideFooter
      />
    </Box>
  );
};
