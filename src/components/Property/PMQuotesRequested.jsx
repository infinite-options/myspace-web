import {
  ThemeProvider,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Stack,
  Button,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  DialogTitle,
  TextField,
  InputAdornment,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState, useContext, } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import theme from "../../theme/theme";
import refundIcon from "./refundIcon.png";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
// import axios from "axios";
import { useUser } from "../../contexts/UserContext";
import APIConfig from "../../utils/APIConfig";
import useMediaQuery from "@mui/material/useMediaQuery";
import { makeStyles } from "@material-ui/core/styles";
import Backdrop from "@mui/material/Backdrop";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccordionDetails from '@mui/material/AccordionDetails';
import Documents from "../Leases/Documents";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import PropertiesContext from '../../contexts/PropertiesContext';
import { CheckBox, KeyboardReturnOutlined } from "@mui/icons-material";
import { id } from "date-fns/locale";
import ManagementContractContext from '../../contexts/ManagementContractContext';
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../utils/httpMiddleware";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiFilledInput-root": {
      backgroundColor: "#F2F2F2",
      borderRadius: 10,
      height: 30,
      marginBlock: 10,
      paddingBottom: "15px",
    }
  },
}));

export default function PMQuotesRequested(props) {  
  const location = useLocation();
  let navigate = useNavigate();
  const { getProfileId } = useUser();
  // const PMQuotesDetails = props;
  const handleBackClick = props.handleBackClick;
  const classes = useStyles();
  // const { propertyList, allContracts, fetchContracts, returnIndex,  } = useContext(PropertiesContext); 

  const propertiesContext = useContext(PropertiesContext);
	const {
	  propertyList: propertyListFromContext,	  
    // allContracts: allContractsFromContext,
    fetchProperties : fetchPropertiesFromContext,
    // fetchContracts: fetchContractsFromContext,	  
	  returnIndex: returnIndexFromContext,
	} = propertiesContext || {};

  const managementContractContext = useContext(ManagementContractContext);
	const {	  
    allContracts: allContractsFromContext,
    fetchContracts: fetchContractsFromContext,
	} = managementContractContext || {};
  
	const propertyList = propertyListFromContext || [];		
  const allContracts = allContractsFromContext || [];	
  const fetchContracts = fetchContractsFromContext;  
  const refreshProperties = fetchPropertiesFromContext;
	const returnIndex = returnIndexFromContext || 0;

  // //console.log("allContracts - ", allContracts);
  
  const index = returnIndex || location.state?.index;
  

  const [contracts, setContracts] = useState([]);
  const refreshContracts = fetchContracts;  
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(true); // New loading state  
  const property = propertyList;  
  const propertyId = property[returnIndex]?.property_uid;  
  const isDesktop = useMediaQuery(theme.breakpoints.up("sm"));

  const statusColor = ["#3D5CAC", "#160449"];
  const [tabStatus, setTabStatus] = useState(props?.tabStatus || 0);
  const [activeContracts, setActiveContracts] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [conflictingContract, setConflictingContract] = useState(null);
  const [newContract, setNewContract] = useState(null);

  const [displayed_managers, set_displayed_managers] = useState([]);
  const [all_managers, set_all_managers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ownerId, setOwnerId] = useState(getProfileId());

  const setManagersList = props.setManagersList;

  const handleRequestQuotes = props.handleRequestQuotes;

  const filteredContracts = contracts.filter(contract => 
    contract.property_uid === propertyId && 
    (contract.contract_status === "NEW" || 
     contract.contract_status === "ACTIVE" || 
     contract.contract_status === "SENT")
  );
    
  // const contractBusinessIds = filteredContracts.map(contract => contract.contract_business_id);

  const sentContractsIds = filteredContracts
  .filter(contract => contract.contract_status === "SENT")
  .map(contract => contract.contract_business_id);

  const newContractsIds = filteredContracts
  .filter(contract => contract.contract_status === "NEW")
  .map(contract => contract.contract_business_id);

  const activeContractsIds = filteredContracts
  .filter(contract => contract.contract_status === "ACTIVE")
  .map(contract => contract.contract_business_id);

  function getColor(status) {
    return statusColor[status];
  }

  const get_manager_info = async () => {
    setLoading(true);
    const url = `${APIConfig.baseURL.dev}/searchManager`;
    const args = {};
    const response = await axios.get(url);
    const managers = response.data.result;
    set_all_managers(managers);
    set_displayed_managers(managers);
    setManagersList(managers);
    setLoading(false);
  };

  const handleSearch = (search_string) => {
    const managers = all_managers.filter((manager) =>
      manager.business_name.toLowerCase().includes(search_string.toLowerCase())
    );
    set_displayed_managers(managers);

  };
  
  useEffect(() => {
    get_manager_info();
  }, []);

  useEffect(() => {
    const validContracts = getActiveContracts(contracts);
    setActiveContracts(validContracts);
  }, [contracts]);

  useEffect(() => {    
    // //console.log("166 - propertyId - ", propertyId);
    const contractsData = allContracts?.filter(
      (contract) => contract.property_uid === propertyId
    );
    // //console.log("166 - contractsData - ", contractsData);
    setContracts(contractsData);
  }, [allContracts]);

  function getActiveContracts(contracts) {
    return contracts?.filter((contract) => contract.contract_status === "ACTIVE");
  }

  useEffect(() => {
    const getContractsForOwner = async () => {
      setLoading(true); // Start loading
      try {
        const response = await fetch(`${APIConfig.baseURL.dev}/contracts/${getProfileId()}`);
        const contractsResponse = await response.json();
        const contractsData = contractsResponse.result.filter(
          (contract) => contract.property_uid === propertyId
        );
        setContracts(contractsData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false); // Stop loading
      }
    };
    getContractsForOwner();
  }, [refresh]);

  function displayPMQuotesRequested() {
    return (
      <div>
        {contracts?.length > 0 ? activeContractsIds?.length !== contracts?.length ?(
          contracts.map((contract) => {
            const manager = displayed_managers.find((m) => m.business_uid === contract.contract_business_id);
            if (contract.contract_status === "SENT" || contract.contract_status === "REFUSED"  || contract.contract_status === "WITHDRAW" || contract.contract_status === "REJECTED") {
              return (
                <div key={contract.contract_uid}>
                  <DocumentCard data={contract} manager={manager}/>
                  {
                    contract.contract_status === "SENT" && (                    
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ padding: "8px" }}
                      >
                        <Button
                          variant="contained"
                          sx={{
                            textTransform: "none",
                            background: "#CB8E8E",
                            color: "#160449",
                            fontWeight: 'bold',
                            fontSize: '15px',
                            width: "40%",
                            height: "85%",
                            borderRadius: "10px",
                            "&:hover": {
                              backgroundColor: "#D32F2F",
                              color: "#FFFFFF",
                            }                        
                          }}
                          onClick={() => handleDecline(contract)}
                        >
                          Decline
                        </Button>
                        <Button
                          variant="contained"
                          sx={{
                            textTransform: "none",
                            background: "#9EAED6",
                            color: "#160449",
                            width: "40%",
                            height: "85%",
                            borderRadius: "10px",
                            fontWeight: 'bold',
                            fontSize: '15px',
                            "&:hover": {
                              backgroundColor: "#160449",
                              color: "#FFFFFF",
                            }
                          }}
                          onClick={() => handleAccept(contract)}
                        >
                          Accept
                        </Button>
                      </Stack>
                    )
                  }
                </div>
              );
            }
            // if (
            //    contract.contract_status === "REJECTED"
            // ) {
            //   return (
            //     <div key={contract.contract_uid}>
            //       <p>This contract is withdrawn/rejected</p>
            //     </div>
            //   );
            // }
            if (contract.contract_status === "NEW") {
              return (
                <div key={contract.contract_uid}>
                  <DocumentCard data={contract} manager={manager}/>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ padding: "8px" }}
                  >
                    <Button
                      variant="contained"
                      sx={{
                        textTransform: "none",
                        background: "#A52A2A",
                        color: "#160449",
                        width: "40%",
                        height: "85%",
                        borderRadius: "10px",
                        fontWeight: 'bold',
                        fontSize: '15px',
                        "&:hover": {
                          backgroundColor: "#D32F2F",
                          color: "#FFFFFF",
                        }     
                      }}
                      onClick={async () => {
                        await handleStatusChange(contract, "CANCELLED");                        
                      }}
                    >
                      Cancel
                    </Button>
                  </Stack>
                </div>
              );
            }
            return null;
          })
        ): (
          <>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '7px',
                width: '100%',
                height:"50px"
              }}
            >
              <Typography
                sx={{
                  color: "#A9A9A9",
                  fontWeight: theme.typography.primary.fontWeight,
                  fontSize: "15px",
                }}
              >
                No Contract Quotes Requested
              </Typography>
            </Box>
          </>) : (
          <div>No Contract Quotes Requested</div>
        )}
      </div>
    );
  }

  function displaySearchManager() {
    return (
      // <div>
      //   {activeContracts?.length > 0 ? (
      //     activeContracts.map((contract, index) => (
      //       <div key={index}>
      //         <DocumentCard data={contract} />              
      //       </div>
      //     ))
      //   ) : (
      //     <div>No active contracts</div>
      //   )}
      // </div>

      <Box
        sx={{
          position: "relative",
          backgroundColor: "#FFFFFF",
          borderRadius: "10px",
          // top: "10px",
        }}
      >
        <Box
          sx={{
            padding: "13px",
            backgroundColor: "#D6D5DA",
            borderRadius: "0px 0px 10px 10px",
          }}
        >
          <TextField
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              handleSearch(e.target.value);
            }}
            variant="filled"
            fullWidth
            placeholder="Search for new Property Manager"
            className={classes.root}
            InputProps={{
              endAdornment: (
                <InputAdornment
                  position="end"
                  sx={{
                    alignItems: "baseline",
                    paddingBottom: "5px",
                    cursor: "pointer",
                  }}
                >
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          {displayed_managers.map((m) => (
            <SearchManagerDocumentCard
              key={m.business_uid} 
              data={m} 
              ownerId={ownerId} 
              propertyData={property} 
              index={index} 
              onRequestQuotes={handleRequestQuotes}
              sentContractsIds={sentContractsIds}
              newContractsIds={newContractsIds}
              activeContractsIds={activeContractsIds}
            />
          ))}
        </Box>
      </Box>
    );
  }

  const sendAnnouncement = async (status, obj, earlyEndDate) => {    
    // const contractData = allContracts?.find((contract) => contract.contract_uid === currentContractUID);
    // //console.log("sendAnnouncement - obj - ", obj);
    // //console.log("sendAnnouncement - property - ", property[returnIndex]);

    // //console.log("sendAnnouncement - status - ", status);
    
    // return;

    const contractProperty = property[returnIndex];    

    const receiverPropertyMapping = {
        [obj.business_uid]: [obj.contract_property_id],
    };
  
    let announcementTitle;
    let announcementMessage;
    
    if(status === "ACTIVE") {
      announcementTitle = `Management Contract Quote Accepted`;
      announcementMessage = `Your quote for Management contract - ${obj.contract_name} (Property - ${contractProperty.property_address}${contractProperty.property_unit ? (", " + contractProperty.property_unit) : ""}) has been accepted by the Owner - ${obj.owner_first_name || ""} ${obj.owner_last_name || ""}. The contract is active.`;
    } else if(status === "INACTIVE") {
      announcementTitle = `Management Contract Ended`;
      announcementMessage = `Management contract - ${obj.contract_name} (Property - ${contractProperty.property_address}${contractProperty.property_unit ? (", " + contractProperty.property_unit) : ""}) has been ended by the Owner - ${obj.owner_first_name || ""} ${obj.owner_last_name || ""}.`;
    } else if(status === "ENDING") {
      announcementTitle = `Management Contract will be ended`;
      announcementMessage = `Management contract - ${obj.contract_name} (Property - ${contractProperty.property_address}${contractProperty.property_unit ? (", " + contractProperty.property_unit) : ""}) will be ended on ${earlyEndDate}.`;
    } else if(status === "APPROVED") {
      announcementTitle = `Management Contract Quote Approved`;
      announcementMessage = `Your quote for Management contract - ${obj.contract_name} (Property - ${contractProperty.property_address}${contractProperty.property_unit ? (", " + contractProperty.property_unit) : ""}) has been accepted by the Owner - ${obj.owner_first_name || ""} ${obj.owner_last_name || ""}. The contract will be active from ${obj.contract_start_date}.`;
    } else if(status === "DECLINED") {
      announcementTitle = `Management Contract Quote Declined`;
      announcementMessage = `Your quote for Management contract - ${obj.contract_name} (Property - ${contractProperty.property_address}${contractProperty.property_unit ? (", " + contractProperty.property_unit) : ""}) has been declined by the Owner - ${obj.owner_first_name || ""} ${obj.owner_last_name || ""}.`;
    }
  
    try {
      const response = await fetch(`${APIConfig.baseURL.dev}/announcements/${getProfileId()}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            announcement_title: announcementTitle,
            announcement_msg: announcementMessage,
            announcement_sender: getProfileId(),
            announcement_date: new Date().toDateString(),			  
            announcement_properties: JSON.stringify(receiverPropertyMapping),
            announcement_mode: "CONTRACT",
            announcement_receiver: [obj.business_uid],
            announcement_type: ["App", "Email", "Text"],
          }),
        });
  
        if (response.ok) {
        
        // navigate("/managerDashboard"); 
        } else {
        throw new Error(`Failed to send the announcement: ${response.statusText}`);
        }
    } catch(error) {
        alert("Error sending announcement to the Manager");
        console.error("Error sending announcement to Property Manager - ", error);
    }
  };

  // function handleAccept(obj) {          
  //   try {
  //     const newContractStart = new Date(obj.contract_start_date);
  //     const newContractEnd = new Date(obj.contract_end_date);
  //     const newPropertyId = obj.property_id;

  //     for (let i = 0; i < activeContracts.length; i++) {
  //       const existingContract = activeContracts[i];

  //       if (existingContract.property_id === newPropertyId) {
  //         const existingContractStart = new Date(existingContract.contract_start_date);
  //         const existingContractEnd = new Date(existingContract.contract_end_date);

  //         if (
  //           (newContractStart <= existingContractEnd && newContractStart >= existingContractStart) ||
  //           (newContractEnd <= existingContractEnd && newContractEnd >= existingContractStart) ||
  //           (newContractStart <= existingContractStart && newContractEnd >= existingContractEnd)
  //         ) {
  //           setConflictingContract(existingContract);
  //           setNewContract(obj);
  //           setDialogOpen(true);
  //           return;
  //         }
  //       }
  //     }

  //     const formData = new FormData();
  //     formData.append("contract_uid", obj.contract_uid);
  //     formData.append("contract_status", "ACTIVE");

  //     fetch(`${APIConfig.baseURL.dev}/contracts`, {
  //       method: "PUT",
  //       body: formData,
  //     })
  //       .then((response) => {
  //         if (!response.ok) {
  //           throw new Error("Network response was not ok");
  //         } else {
  //           //console.log("Data added successfully");
  //           sendAnnouncement("ACCEPTED", obj);
  //           refreshContracts();
  //           refreshProperties();            
  //         }
  //       })
  //       .catch((error) => {
  //         console.error("There was a problem with the fetch operation:", error);
  //       });
  //   } catch (error) {
  //     console.error(error);
  //   }    
  //   setTabStatus(1);    
  // }

  const updateExistingContractStatus = ( contractObj, status, earlyEndDate) => {

    const actualEndDate = new Date(contractObj.contract_end_date)      
    const formattedEarlyEndDate = `${String(earlyEndDate.getMonth() + 1).padStart(2, '0')}-${String(earlyEndDate.getDate()).padStart(2, '0')}-${earlyEndDate.getFullYear()}`;

    const formData = new FormData();
    formData.append("contract_uid", contractObj.contract_uid);
    
    if(status === "INACTIVE"){
      formData.append("contract_status", status);            

      if(earlyEndDate < actualEndDate) {
        formData.append("contract_early_end_date", formattedEarlyEndDate);
        formData.append("contract_renew_status", "EARLY TERMINATION");
      }else {
        formData.append("contract_renew_status", "RENEWED");
      }
    } else if(status === "ACTIVE"){
      // formData.append("contract_early_end_date", formattedEarlyEndDate);      
      // //console.log("earlyEndDate - ", earlyEndDate)
      // //console.log("actualEndDate - ", actualEndDate)
      
      if(earlyEndDate < actualEndDate) {
        formData.append("contract_early_end_date", formattedEarlyEndDate);
        formData.append("contract_renew_status", "EARLY TERMINATION");
      } else {
        // return;
        formData.append("contract_renew_status", "ENDING");
      }
      
    }

    try {
      fetch(`${APIConfig.baseURL.dev}/contracts`, {
        method: "PUT",
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          } else {
            //console.log("Data added successfully");
            if(status === "ENDING"){
              sendAnnouncement(status, contractObj, formattedEarlyEndDate);  
            } else {
              sendAnnouncement(status, contractObj);
            }
            
            refreshContracts();
            refreshProperties();            
          }
        })
        .catch((error) => {
          console.error("There was a problem with the fetch operation:", error);
        });
    } catch (error) {
      console.error(error);
    } 


  }

  const acceptNewContract = (contract, status) => {
    const formData = new FormData();
    formData.append("contract_uid", contract.contract_uid);
    formData.append("contract_status", status);

    try {
      fetch(`${APIConfig.baseURL.dev}/contracts`, {
        method: "PUT",
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          } else {
            //console.log("Data added successfully");
            sendAnnouncement(status, contract);
            refreshContracts();
            refreshProperties();            
          }
        })
        .catch((error) => {
          console.error("There was a problem with the fetch operation:", error);
        });
    } catch (error) {
      console.error(error);
    } 
  }

  function handleAccept(obj) {          
    
      const newContractStart = new Date(obj.contract_start_date);
      const newContractEnd = new Date(obj.contract_end_date);
      const newPropertyId = obj.property_uid;

      

      const existingContractIndex = activeContracts.findIndex(contract => contract.property_uid === newPropertyId && contract.contract_status === "ACTIVE");

      if (existingContractIndex < 0){
        // //console.log("ERROR - existing contract not found.");
        acceptNewContract(obj, "ACTIVE");
        return;
      }

      
      const existingContract = activeContracts[existingContractIndex];
      let newContractStatus = "";

      if (existingContract.property_uid === newPropertyId && existingContract.contract_status === "ACTIVE") {
        const existingContractStart = new Date(existingContract.contract_start_date);
        const existingContractEnd = new Date(existingContract.contract_end_date);
        const today = new Date();

        // //console.log("514 - newContractStart - ", newContractStart)
        // //console.log("514 - existingContractEnd - ", existingContractEnd)
        // //console.log("514 - today - ", today)        

        
        const earlyEndDate = new Date(newContractStart)
        earlyEndDate.setDate(newContractStart.getDate() - 1)
        

        if(newContractStart <= today){
            newContractStatus = "ACTIVE";

            //end current contract                        
            updateExistingContractStatus(existingContract, "INACTIVE", earlyEndDate);
                 
        } else {
          newContractStatus = "APPROVED";
          
          //update existing contract status to ending
          const earlyEndDate = new Date(newContractStart)
          earlyEndDate.setDate(newContractStart.getDate() - 1)
          // const formattedarlyEndDate = `${String(earlyEndDate.getMonth() + 1).padStart(2, '0')}-${String(earlyEndDate.getDate()).padStart(2, '0')}-${earlyEndDate.getFullYear()}`;
          updateExistingContractStatus(existingContract, "ACTIVE", earlyEndDate);          
        }
        acceptNewContract(obj, newContractStatus);   
      }      
      
      
      setTabStatus(1);    
  }

  function handleDecline(obj) {        
    try {
      const formData = new FormData();
      formData.append("contract_uid", obj.contract_uid);
      formData.append("contract_status", "REJECTED");

      axios
        .put(`${APIConfig.baseURL.dev}/contracts`, formData)
        .then((response) => {
          //console.log("PUT result", response);
          sendAnnouncement("DECLINED", obj);
          refreshContracts();
        })
        .catch((error) => {
          console.error("There was a problem with the decline operation:", error);
        });
    } catch (error) {
      console.error(error);
    }
    
  }

  const handleStatusChange = async (obj, status) => {
    try {
      const formData = new FormData();
      formData.append("contract_uid", obj.contract_uid);
      formData.append("contract_status", status);

      axios
        .put(`${APIConfig.baseURL.dev}/contracts`, formData)
        .then((response) => {
          //console.log("PUT result", response);
          refreshContracts();
        })
        .catch((error) => {
          console.error("There was a problem with the status change operation:", error);
        });
    } catch (error) {
      console.error(error);
    }    
  };

  const viewAllProperties = () => {
    // if (isDesktop) {
    //   handleBackClick();
    // } else {
    //   navigate(-1);
    // }
    handleBackClick();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setConflictingContract(null);
    setNewContract(null);
  };

  return (
    // <ThemeProvider theme={theme}>
    <>
      {loading ? (
      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={true}>
          <CircularProgress color='inherit' />
        </Backdrop> ) :(
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          height: "100%",
        }}
      >
        <Paper
          sx={{
            backgroundColor: theme.palette.primary.main,
            width: "100%",
            paddingTop: "10px",
          }}
        >
          {/* Search for property manager section */}
          <Stack 
            direction="row" 
            justifyContent="space-between" 
            alignItems="center" 
            sx={{ paddingBottom: "0px", position: "relative", marginBottom: "10px" }}
          >
            {/* Left Section - Icon */}
            <Box onClick={viewAllProperties} sx={{ position: "absolute", left: "10px" }}>
              <Button
                sx={{
                  textTransform: "none",
                  color: theme.typography.common.blue,
                  fontWeight: theme.typography.common.fontWeight,
                  fontSize: "16px",
                  "&:hover, &:focus, &:active": { background: theme.palette.primary.main },
                }}
              >
                <ArrowBackIcon
                    sx={{
                        color: "#160449",
                        fontSize: "25px",
                        margin: "5px",
                    }}
                />
              </Button>
            </Box>

            {/* Center Section - Text */}
            <Typography
              sx={{
                color: theme.typography.primary.black,
                fontWeight: theme.typography.primary.fontWeight,
                fontSize: theme.typography.largeFont,
                textAlign: "center",
                flexGrow: 1, // Ensures the text is centered
              }}
            >
              {tabStatus === 0 ? "All Requested Quotes" : "Search for Properties Manager"}
            </Typography>
          </Stack>
          {/* <Stack direction="column" justifyContent="center" alignItems="center" sx={{ paddingBottom: "0px" }}>
            <Box onClick={viewAllProperties} position="absolute" left={10}>
              <Button
                sx={{
                  textTransform: "none",
                  color: theme.typography.common.blue,
                  fontWeight: theme.typography.common.fontWeight,
                  fontSize: "16px",
                  "&:hover, &:focus, &:active": { background: theme.palette.primary.main },
                }}
              >
                <img src={refundIcon} style={{ width: "25px", height: "25px", margin: "5px" }} />
              </Button>
            </Box>
            <Box direction="row" justifyContent="center" alignItems="center">
              <Typography
                sx={{
                  color: theme.typography.primary.black,
                  fontWeight: theme.typography.primary.fontWeight,
                  fontSize: theme.typography.largeFont,
                }}
              >
                {tabStatus === 0? "All Requested Quotes" : "Search for Properties Manager"}
              </Typography>
            </Box> */}
            {/* <Box position="absolute" right={30}>
              <Button>
                <SearchIcon />
              </Button>
            </Box> */}
          {/* </Stack> */}

          {/* return to all property section */}
          {/* <Stack direction="column" justifyContent="center" alignItems="center">
            <Box onClick={viewAllProperties}>
              <Button
                sx={{
                  textTransform: "none",
                  color: theme.typography.common.blue,
                  fontWeight: theme.typography.common.fontWeight,
                  fontSize: "16px",
                  "&:hover, &:focus, &:active": { background: theme.palette.primary.main },
                }}
              >
                <img src={refundIcon} style={{ width: "25px", height: "25px", margin: "5px" }} />
                <Typography>Return to All Properties</Typography>
              </Button>
            </Box>
          </Stack> */}

          {/* tab section */}
          <Stack
            sx={{
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                borderBottom: 0,
                width: "95%",
              }}
            >
              <Tabs
                variant="fullWidth"
                value={tabStatus}
                // onChange={(e) => console.log(e)}
                TabIndicatorProps={{
                  style: {
                    backgroundColor: "transparent",
                    border: "0px",
                    minWidth: "5px",
                    height: "10px",
                    padding: "0px",
                  },
                }}
                sx={{
                  [theme.breakpoints.up("sm")]: {
                    height: "5px",
                  },
                }}
              >
                <Tab
                  sx={{
                    backgroundColor: statusColor[0],
                    borderTopLeftRadius: "10px",
                    borderTopRightRadius: "10px",
                    height: "10%",
                    minWidth: "5px",
                    padding: "0px",
                    "&.Mui-selected": {
                      color: "#FFFFFF",
                    },
                    "&.MuiTab-root": {
                      color: "#FFFFFF",
                    },
                    textTransform: "none",
                  }}
                  onClick={() => setTabStatus(0)}
                  label="Quotes Requested"
                />
                <Tab
                  sx={{
                    backgroundColor: statusColor[1],
                    borderTopLeftRadius: "10px",
                    borderTopRightRadius: "10px",
                    height: "10%",
                    minWidth: "5px",
                    padding: "0px",
                    "&.Mui-selected": {
                      color: "#FFFFFF",
                    },
                    "&.MuiTab-root": {
                      color: "#FFFFFF",
                    },
                    textTransform: "none",
                  }}
                  onClick={() => setTabStatus(1)}
                  label="Search Manager"
                />
              </Tabs>
              <Box
                sx={{
                  backgroundColor: getColor(tabStatus),
                  height: "15px",
                }}
              ></Box>
            </Box>
          </Stack>

          <Stack direction="column" justifyContent="center" alignItems="center">
            <Box
              sx={{
                borderBottom: 0,
                width: "95%",
              }}
            >
              <Box
                sx={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "0px 0px 10px 10px",
                  bottom: "40px",
                }}
              >
                <Box
                  sx={{
                    padding: "0px",
                  }}
                >
                  {loading ? (
                    <CircularProgress />
                  ) : tabStatus === 0 ? (
                    displayPMQuotesRequested()
                  ) : (
                    displaySearchManager()
                  )}
                </Box>
              </Box>
            </Box>
          </Stack>
        </Paper>
      </Box>
    )}

      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ textAlign: "center", fontWeight: "bold", color: theme.typography.common.blue }}>
          CONFLICTING CONTRACTS
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", padding: 2 }}>
            <Box sx={{ width: "45%", padding: 2, backgroundColor: theme.palette.background.paper, borderRadius: "10px" }}>
              <Typography sx={{ fontWeight: "bold", marginBottom: 2, color: theme.typography.common.blue }}>
                PropertyManager
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography  sx={{ fontWeight: "bold", marginBottom: 2, color: theme.typography.common.blue }}>
                    Contract Name
                  </Typography>
                  <TextField
                    fullWidth
                    value={conflictingContract?.contract_name}
                    variant="filled"
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{ marginBottom: 2 }}
                    className={classes.root}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography sx={{ fontWeight: "bold", marginBottom: 2, color: theme.typography.common.blue }}>
                    Start Date
                  </Typography>
                  <TextField
                    fullWidth
                    value={conflictingContract?.contract_start_date}
                    variant="filled"
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{ marginBottom: 2 }}
                    className={classes.root}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography  sx={{ fontWeight: "bold", marginBottom: 2, color: theme.typography.common.blue }}>
                    End Date
                  </Typography>
                  <TextField
                    fullWidth
                    value={conflictingContract?.contract_end_date}
                    variant="filled"
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{ marginBottom: 2 }}
                    className={classes.root}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography  sx={{ fontWeight: "bold", marginBottom: 2, color: theme.typography.common.blue }}>
                    Status
                  </Typography>
                  <TextField
                    fullWidth
                    value={conflictingContract?.contract_status}
                    variant="filled"
                    InputProps={{
                      readOnly: true,
                    }}
                    className={classes.root}
                  />
                </Grid>
              </Grid>
              <Stack direction="row" spacing={2} sx={{ marginTop: 2 }}>
              <Button fullWidth variant='contained' color='primary'  onClick={() => {
                  navigate("/ownerContacts");
                }} sx={{ mb: 2, backgroundColor: "#3D5CAC" }}>
             <Typography sx={{ fontWeight: "bold", color: "#FFFFFF", textTransform: "none" }}>Contact PM</Typography>
             </Button>
              </Stack>
            </Box>

            <Box sx={{ width: "45%", padding: 2, backgroundColor: theme.palette.background.paper, borderRadius: "10px" }}>
              <Typography sx={{ fontWeight: "bold", marginBottom: 2, color: theme.typography.common.blue }}>
                PropertyManager
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography  sx={{ fontWeight: "bold", marginBottom: 2, color: theme.typography.common.blue }}>
                    Contract Name
                  </Typography>
                  <TextField
                    fullWidth
                    value={newContract?.contract_name}
                    variant="filled"
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{ marginBottom: 2 }}
                    className={classes.root}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography  sx={{ fontWeight: "bold", marginBottom: 2, color: theme.typography.common.blue }}>
                    Start Date
                  </Typography>
                  <TextField
                    fullWidth
                    value={newContract?.contract_start_date}
                    variant="filled"
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{ marginBottom: 2 }}
                    className={classes.root}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography  sx={{ fontWeight: "bold", marginBottom: 2, color: theme.typography.common.blue }}>
                    End Date
                  </Typography>
                  <TextField
                    fullWidth
                    value={newContract?.contract_end_date}
                    variant="filled"
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{ marginBottom: 2 }}
                    className={classes.root}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography  sx={{ fontWeight: "bold", marginBottom: 2, color: theme.typography.common.blue }}>
                    Status
                  </Typography>
                  <TextField
                    fullWidth
                    value={newContract?.contract_status}
                    variant="filled"
                    InputProps={{
                      readOnly: true,
                    }}
                    className={classes.root}
                  />
                </Grid>
              </Grid>
              <Stack direction="row" spacing={2} sx={{ marginTop: 2 }}>
                <Button fullWidth variant='contained'   onClick={() => {
                    handleDecline(newContract);
                    handleDialogClose(); // Optional: Close dialog after rejecting
                    // setRefresh(!refresh); // Optional: Refresh contracts list
                  }} sx={{ mb: 2, backgroundColor: "#A52A2A" }}>
             <Typography sx={{ fontWeight: "bold", color: "#FFFFFF", textTransform: "none" }}>Decline</Typography>
             </Button>
                <Button fullWidth variant='contained' color='primary'  onClick={() => {
                  navigate("/ownerContacts");
                }} sx={{ mb: 2, backgroundColor: "#3D5CAC" }}>
             <Typography sx={{ fontWeight: "bold", color: "#FFFFFF", textTransform: "none" }}>Contact PM</Typography>
             </Button>
              </Stack>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button  variant='contained' color='primary' onClick={handleDialogClose}  sx={{ mb: 2, backgroundColor: "#3D5CAC" }}>
             <Typography sx={{ fontWeight: "bold", color: "#FFFFFF", textTransform: "none" }}>Close</Typography>
          </Button>
        </DialogActions>
      </Dialog>

    {/* </ThemeProvider> */}
    </>
  );
}

function DocumentCard(props) {
  const data = props.data;
  const manager = props.manager;
  // console.log("data -", data, manager);

  const [fees, setFees] = useState(JSON.parse(data.contract_fees) ? JSON.parse(data.contract_fees) : []);
  const [locations, setLocations] = useState(manager?.business_locations ? JSON.parse(manager?.business_locations) : []);
  const [contractDocuments, setContractDocuments] = useState(JSON.parse(data.contract_documents)? JSON.parse(data.contract_documents) : [])

  const [feesExpanded, setFeesExpanded ] = useState(false);
  const [documentsExpanded, setDocumentsExpanded ] = useState(false);
  

  let navigate = useNavigate();

  const getContractDocumentLink = () => {
    const documents = JSON.parse(data.contract_documents);
    if (documents === null || documents === undefined) return null;
    const contractDocument = documents.find((doc) => doc.type === "contract");
    return contractDocument ? contractDocument.link : "";
  };

  const contractDocumentLink = getContractDocumentLink();

  const getBusinessProfileFees = async () => {
    try {      
      setFees(JSON.parse(data.business_services_fees)? JSON.parse(data.business_services_fees) : []);      
    } catch (error) {
      //console.log("error", error);
    }
  };

  useEffect(() => {    
    if (data.contract_status === "NEW") {
      getBusinessProfileFees(data);
    }
  }, []);

  const textStyle = {
    textTransform: "none",
    color: theme.typography.propertyPage.color,
    fontWeight: theme.typography.light.fontWeight,
    fontSize: theme.typography.secondaryFont,
  };

  const getContractStatusColor = () => {
    switch(data.contract_status.trim()){
      case "SENT":
        return theme.palette.success.main;
      case "REFUSED":
        return "#D32F2F";
      case "REJECTED":
        return "#D32F2F"
      default:
        return "#160449";
    }
  }

  const getContractStatusText = () => {
    switch(data.contract_status.trim()){
      case "SENT":
        return "New Contract Received";
      case "NEW":
        return "Management Quote Requested";
      case "REJECTED":
        return "REJECTED";
      case "CANCELLED":
        return "CANCELLED";
      case "REFUSED":
        return "Property Manager Declined";
      case "WITHDRAW":
        return "Contract WIthdrawn";  
      default:
        return "";
    }
  }

  return (
    <Box
      sx={{
        backgroundColor: "#D6D5DA",
        borderRadius: "10px",
        padding: "5px",
        marginBottom: "10px",
        fontSize: "13px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography sx={{ fontWeight: "bold", fontSize: "20px" }}>
          {data.business_name}
        </Typography>
      </Box>
      {/* <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Typography sx={{fontSize: "14px" }}>
        <span style={{ fontWeight: "bold"}}></span>
        </Typography> 
        <Typography sx={{fontSize: "14px" }}>
          <span style={{ fontWeight: "bold"}}></span>
        </Typography>
        <Typography sx={{fontSize: "14px"}}>
        <span style={{ fontWeight: "bold"}}></span>
        </Typography>
        <Typography sx={{fontSize: "14px"}}>
        <span style={{ fontWeight: "bold"}}></span>
        </Typography>    
      </Box> */}
      {/* <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "flex-start",
        }}
      >            
          <FormControlLabel 
            sx={{
              marginLeft: '-2px',
              alignItems: 'flex-start',                            
            }}     
            control={
              <Checkbox
                sx={{alignSelf: 'flex-start', padding: '2px 0px', fontSize: '14px',}}
                checked={data.contract_m2m && data.contract_m2m === 1 ? true : false}
                // onChange={() => {
                //   setContinueM2M( prevState => !prevState)
                // }}                
                inputProps={{ 
                  'aria-label': 'controlled',
                  style: { alignSelf: 'flex-start', margin: '0' }
                }}
              />	          
            } 
            label={<Typography sx={{fontWeight: "bold", fontSize: '14px',}}>Continues Month-to-Month</Typography> }
          />
          <FormControlLabel 
            sx={{
              marginLeft: '-2px',
              alignItems: 'flex-start',                            
            }}     
            control={
              <Checkbox
                sx={{alignSelf: 'flex-start', padding: '2px 0px',}}
                checked={data.contract_m2m && data.contract_m2m === 2 ? true : false}
                // onChange={() => {
                //   setContinueM2M( prevState => !prevState)
                // }}                
                inputProps={{ 
                  'aria-label': 'controlled',
                  style: { alignSelf: 'flex-start', margin: '0' }
                }}
              />	          
            } 
            label={<Typography sx={{fontWeight: "bold", fontSize: '14px',}}>Renews Automatically</Typography> }
          />                         
      </Box>       */}
      <Grid container alignItems="flex-start" spacing={2} marginTop={"10px"} marginBottom={"10px"}>
        <Grid container item xs={6}>
          <Grid item xs={12}>
            <Typography sx={{ color: '#3D5CAC', fontSize: '14px', fontWeight: 'bold' }}>
              Contract name: 
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography sx={{ color: '#160449', fontSize: '14px' }}>
              {data.contract_name}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography sx={{ color: '#3D5CAC', fontSize: '14px', fontWeight: 'bold' }}>
              Start Date: 
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography sx={{ color: '#160449', fontSize: '14px' }}>
              {data.contract_start_date}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography sx={{ color: '#3D5CAC', fontSize: '14px', fontWeight: 'bold' }}>
              Notice Period:  
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography sx={{ color: '#160449', fontSize: '14px' }}>
              {data.contract_end_notice_period ? data.contract_end_notice_period : "0"} days
            </Typography>
          </Grid>

          <Grid item xs={12} sx={{ marginTop: "10px" }}>
            <FormControlLabel 
              sx={{
                marginLeft: '-2px',
                alignItems: 'center',                            
              }}     
              control={
                <Checkbox
                  disabled
                  sx={{alignSelf: 'flex-start', padding: '2px 0px', '& .MuiSvgIcon-root': { fontSize: '18px',}, }}
                  checked={data.contract_m2m && data.contract_m2m === 1 ? true : false}
                  // onChange={() => {
                  //   setContinueM2M( prevState => !prevState)
                  // }}                
                  inputProps={{ 
                    'aria-label': 'controlled',
                    style: { alignSelf: 'flex-start', margin: '0' }
                  }}
                />	          
              } 
              label={<Typography sx={{fontWeight: "600", fontSize: '14px', marginLeft: "3px"}}>Continues Month-to-Month</Typography> }
            />
          </Grid>
        </Grid>

        <Grid container item xs={6}>
          <Grid item xs={12}>
            <Typography sx={{ color: '#3D5CAC', fontSize: '14px', fontWeight: 'bold' }}>
              Contract ID:
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography sx={{ color: '#160449', fontSize: '14px' }}>
              {data.contract_uid}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography sx={{ color: '#3D5CAC', fontSize: '14px', fontWeight: 'bold' }}>
              End Date: 
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography sx={{ color: '#160449', fontSize: '14px' }}>
              {data.contract_end_date}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography sx={{ color: '#3D5CAC', fontSize: '14px', fontWeight: 'bold' }}>
              Status:
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography sx={{ color: getContractStatusColor(), fontSize: '14px', fontWeight: 'bold' }}>
              {getContractStatusText().toUpperCase()}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sx={{ marginTop: "10px" }}>
            <FormControlLabel 
              sx={{
                marginLeft: '-2px',
                alignItems: 'center',                            
              }}     
              control={
                <Checkbox
                  disabled
                  sx={{alignSelf: 'flex-start', padding: '2px 0px', '& .MuiSvgIcon-root': { fontSize: '18px',}, }}
                  checked={data.contract_m2m && data.contract_m2m === 2 ? true : false}
                  // onChange={() => {
                  //   setContinueM2M( prevState => !prevState)
                  // }}                
                  inputProps={{ 
                    'aria-label': 'controlled',
                    style: { alignSelf: 'flex-start', margin: '0' }
                  }}
                />	          
              } 
              label={<Typography sx={{fontWeight: "bold", fontSize: '14px', marginLeft: "3px"}}>Renews Automatically</Typography> }
            /> 
          </Grid>
        </Grid>
      </Grid>
      
      <Accordion sx={{ backgroundColor: "#D6D5DA", boxShadow: "none", marginTop:"20px"}}>
        <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
        >
            <Typography 
              sx={{
                color: "#160449",
                fontWeight: '600',
                fontSize: "18px",
                // textAlign: "center",
                flexGrow: 1,
              }}
            >
                Service Locations
            </Typography>
        </AccordionSummary>
        <AccordionDetails>                        
            {
              locations && (
                <>
                  <LocationsDataGrid data={locations} />
                </>
              )
            }
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ backgroundColor: "#D6D5DA", boxShadow: "none" }} expanded={feesExpanded} onChange={() => setFeesExpanded(prevState => !prevState)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='fees-content' id='fees-header'>
            <Grid container>
                <Grid item xs={12}>
                    <Typography
                        sx={{
                            color: "#160449",
                            fontWeight: '600',
                            fontSize: "18px",
                            // textAlign: "center",
                            flexGrow: 1,
                            // paddingLeft: "50px",
                        }}
                        paddingTop='5px'
                    >
                        {data.contract_status === "NEW" ? "Estimated Fees" : "Quoted Fees"}
                    </Typography>
                </Grid>                
            </Grid>
        </AccordionSummary>
        <AccordionDetails>
            {data !== null ? fees?.length !== 0 ? (
              <>          
                <FeesDataGrid data={fees} />            
              </>
            ) : (          
              <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: '7px',
                    width: '100%',
                    height:"100px"
                  }}
                >
                  <Typography
                    sx={{
                      color: "#A9A9A9",
                      fontWeight: theme.typography.primary.fontWeight,
                      fontSize: "15px",
                    }}
                  >
                    No Fees
                  </Typography>
                </Box>
            )
          : (
            <Typography sx={textStyle}>No data available</Typography>
          )}
                                                      
        </AccordionDetails>
      </Accordion>

      {data.contract_status !== "NEW" && (
        <Accordion sx={{ backgroundColor: "#D6D5DA", boxShadow: "none" }} expanded={documentsExpanded} onChange={() => setDocumentsExpanded(prevState => !prevState)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='fees-content' id='fees-header'>
              <Grid container>
                  <Grid item xs={12}>
                      <Typography
                          sx={{
                              color: "#160449",
                              fontWeight: '600',
                              fontSize: "18px",
                              // textAlign: "center",
                              flexGrow: 1,
                              // paddingLeft: "50px",
                          }}
                          paddingTop='5px'
                      >
                          {"Attached Documents"}
                      </Typography>
                  </Grid>                
              </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <Documents isEditable={false} isAccord={false} documents={contractDocuments} setDocuments={setContractDocuments} customName={""}/>                                       
          </AccordionDetails>
        </Accordion>

      )}

      {/* {data.contract_status !== "NEW" ? 
      (<Box marginLeft={"5px"}>
        <Documents isEditable={false} isAccord={false} documents={contractDocuments} setDocuments={setContractDocuments} customName={"Attached Documents"}/>
      </Box>) : <></>} */}

    </Box>
  );
}

function SearchManagerDocumentCard(props){
  const obj = props.data;
  const ownerId = props.ownerId;
  const propertyData = props.propertyData;
  const index = props.index;
  const isDesktop = props.isDesktop;
  const onRequestQuotes = props.onRequestQuotes;
  const navigate = useNavigate();
  // const contractBusinessIds = props.contractBusinessIds;
  const sentContractsIds = props.sentContractsIds;
  const newContractsIds = props.newContractsIds;
  const activeContractsIds = props.activeContractsIds;

  // //console.log("BUSINESS Locations - ", obj.business_locations);
  let location1 = "";
  if(obj.business_locations !== null && obj.business_locations.length > 2){
    // //console.log("Valid business location");
    location1 = JSON.parse(obj.business_locations);
  }  
  let city = "";
  if(location1.length > 0){
    city = (location1[0]!==undefined && location1[0]!==null) ? location1[0]?.location : "";
  }  
  let distance = location1[0]!==undefined ? location1[0]?.distance : "";
  let feesArray = JSON.parse(obj.business_services_fees);
  let locationsArray = JSON.parse(obj.business_locations);

  const handleRequestQuotes = async (obj) => {
    // //console.log('---handle request quotes---', propertyData, index);

    navigate("/requestQuotes",{
      state:{
        managerData: obj,
        propertyData: propertyData,
        index: index,
        isDesktop: isDesktop,
      }
    }
    );    
  };

  return (
    <Box
      sx={{
        backgroundColor: "#FFFFFF",
        borderRadius: "10px",
        padding: "10px",
        marginBottom: "10px",
        fontSize: "13px",
      }}
    >
        <Grid container>
            <Grid item xs={8}>
                <Box
                    sx={{
                        fontWeight: "bold",
                    }}
                >
                    <Typography>{obj.business_name}</Typography>
                </Box>                
            </Grid>
            <Grid item xs={4}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                    }}
                >
                  {newContractsIds.includes(obj.business_uid) ? (
                    <Typography
                      sx={{
                        color: theme.palette.priority.high2,
                        fontWeight: "bold",
                      }}
                    >
                      Quote Requested
                    </Typography>
                  ) : sentContractsIds.includes(obj.business_uid) ? (
                    <Typography
                      sx={{
                        color: theme.palette.priority.medium,
                        fontWeight: "bold",
                      }}
                    >
                      Quote Received 
                    </Typography>
                  ) : activeContractsIds.includes(obj.business_uid) ? (
                    <Typography
                      sx={{
                        color: theme.palette.success.main,
                        fontWeight: "bold",
                      }}
                    >
                      Active
                    </Typography>
                  ) :(
                    <Button
                      variant="contained"
                      sx={{
                        textTransform: "none",
                        width: "100%",
                        background: "#3D5CAC",
                        color: theme.palette.background.default,
                        borderRadius: "10px 10px 10px 10px",
                      }}
                      onClick={() => onRequestQuotes(obj)}
                    >
                      Request Quote
                    </Button>
                  )}
                </Box>
            </Grid>
        </Grid>
        <Box sx={{paddingTop: "10px", paddingBottom: "10px"}}>
          <Accordion>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <Typography>
                    Service Locations
                </Typography>
            </AccordionSummary>
            <AccordionDetails>                        
                {
                  locationsArray && (
                    <>
                      <LocationsDataGrid data={locationsArray} />
                    </>
                  )
                }
            </AccordionDetails>
          </Accordion>
        </Box>
        <Box sx={{paddingTop: "10px", paddingBottom: "10px"}}>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography>
                        Estimated Fees
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>                    
                    {
                      feesArray && (
                        <>
                          <FeesDataGrid data={feesArray} />
                        </>
                      )
                    }
                </AccordionDetails>
            </Accordion>
        </Box>
    </Box>
  );
}

export const FeesDataGrid = ({ data, isDeleteable=false, handleDeleteFee, handleEditFee}) => {
  const columns = isDeleteable ? [
    {
      field: "frequency",
      headerName: "Frequency",
      flex:1,
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
    },
    {
      field: "fee_name",
      headerName: "Name",
      flex:1,
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
    },
    {
      field: "charge",
      headerName: "Charge",
      flex:1,
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
      renderCell: (params) => {
        const feeType = params.row?.fee_type;
        const charge = params.value;

        return (
          <Typography>
            {feeType === "PERCENT" ? `${charge}%` : feeType === "FLAT-RATE" ? `$${charge}` : charge}
          </Typography>
        );
      },
    },
    {
      field: "of",
      headerName: "Of",
      flex:1,
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
      renderCell: (params) => {
        const feeType = params.row?.fee_type;
        const of = params.value;
        return <Typography>{of === null || of === undefined || of === "" ? feeType === "FLAT-RATE" ? "FLAT-RATE" : `-` : `${of}`}</Typography>;
      },
    },
    {
      field: "editactions",
      headerName: "",
      flex: 0.5,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={(e) => handleEditFee(params.row.id)}>
            <EditIcon sx={{ fontSize: 19, color: '#3D5CAC' }} />
          </IconButton>
        </Box>
      ),
    },
    {
      field: "deleteactions",
      headerName: "",
      flex: 0.5,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={(e) => handleDeleteFee(params.row.id, e)}>
            <DeleteIcon sx={{ fontSize: 19, color: '#3D5CAC' }} />
          </IconButton>
        </Box>
      ),
    }
  ] : [
    {
      field: "frequency",
      headerName: "Frequency",
      flex:1,
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
    },
    {
      field: "fee_name",
      headerName: "Name",
      flex:1,
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
    },
    {
      field: "charge",
      headerName: "Charge",
      flex:1,
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
      renderCell: (params) => {
        const feeType = params.row?.fee_type;
        const charge = params.value;

        return (
          <Typography>
            {feeType === "PERCENT" ? `${charge}%` : feeType === "FLAT-RATE" ? `$${charge}` : charge}
          </Typography>
        );
      },
    },
    {
      field: "of",
      headerName: "Of",
      flex:1,
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
      renderCell: (params) => {
        const feeType = params.row?.fee_type;
        const of = params.value;

        return <Typography>{of === null || of === undefined || of === "" ? feeType === "FLAT-RATE" ? "FLAT-RATE" : `-` : `${of}`}</Typography>;
      },
    },
  ];


  // Adding a unique id to each row using map if the data doesn't have an id field
  const rowsWithId = data?.map((row, index) => ({
    ...row,
    id: row.id ? index : index,
  }));

  // //console.log("-- inside fee data grid - ", rowsWithId);

  return (
    <Box sx={{width: "100%", overflowX: "auto"}}>
      <DataGrid
        rows={rowsWithId}
        columns={columns}
        sx={{
          minWidth: "600px",        
          marginTop: "10px",
        }}
        autoHeight
        rowHeight={50} 
        hideFooter={true}
      />
    </Box>
  );
};

// function FeesTextCard(props) {
//   const textStyle = {
//     textTransform: "none",
//     color: theme.typography.propertyPage.color,
//     fontWeight: theme.typography.light.fontWeight,
//     fontSize: theme.typography.mediumFont,
//   };

//   let fee = props.fee;

//   function displayFee() {
//     if (fee.fee_type === "%" || fee.fee_type === "PERCENT") {
//       return (
//         <Typography sx={textStyle}>
//           <b>{fee.frequency}</b> - {fee.fee_name}: {fee.charge} % of {fee.of}           
//         </Typography>
//       );
//     } else if (fee.fee_type === "$") {
//       return (
//         <Typography sx={textStyle}>
//           {fee.fee_name} : {fee.fee_type}
//           {fee.charge} of {fee.of} <b>{fee.frequency}</b>
//         </Typography>
//       );
//     } else if (fee.fee_type === "FLAT-RATE") {
//       const type = "$";
//       return (
//         <Typography sx={textStyle}>
//           <b>{fee.frequency}</b> - {fee.fee_name} : {type} {fee.charge}           
//         </Typography>
//       );
//     } else {
//       return (
//         <Typography sx={textStyle}>
//           {fee.fee_name}: {fee.charge} of {fee.of} <b>{fee.frequency}</b>
//         </Typography>
//       );
//     }
//   }

//   return displayFee();
// }

const LocationsDataGrid = ({ data }) => {
  const columns = [
    { 
      field: "address",
      headerName: "Address",
      width: 200,
      renderHeader: (params) => (
        <strong>{params.colDef.headerName}</strong>
      ),
    },
    { field: "city",
      headerName: "City",
      width: 150,
      renderHeader: (params) => (
        <strong>{params.colDef.headerName}</strong>
      ),
    },
    {
      field: "state",
      headerName: "State",
      width: 100,
      renderHeader: (params) => (
        <strong>{params.colDef.headerName}</strong>
      ),      
    },    
    {
      field: "miles",
      headerName: "Area of Service",
      width: 150,
      renderHeader: (params) => (
        <strong>{params.colDef.headerName}</strong>
      ),      
      renderCell: (params) => (
        <Typography>
          +- {params.row.miles} miles
        </Typography>
      ),      
    },
  ];

  // //console.log("FeesDataGrid - props.data - ", data);

  return (
    <>
      <Box sx={{width: "100%", overflowX: "auto"}}>
        <DataGrid
          rows={data}
          getRowId={(fee) => fee.id}
          columns={columns}
          sx={{
            // border: "0px",
            minWidth: "600px",
            marginTop: '10px',
          }}
          hideFooter={true}
        />
      </Box>
    </>
  );
};
