import React, { useState, useEffect, useRef, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Typography, Box, Stack, Paper, Button, ThemeProvider, Grid, Container, InputBase, IconButton, Avatar, Badge } from "@mui/material";
import theme from "../../theme/theme";
import { useUser } from "../../contexts/UserContext";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import APIConfig from "../../utils/APIConfig";
import PropertiesList from "./PropertiesList";
import PropertyNavigator from "./PropertyNavigator";
import PropertyNavigator2 from "./PropertyNavigator2";
import EditProperty from "./EditProperty";
import ViewLease from "../Leases/ViewLease";
import ViewManagementContract from "../Contracts/OwnerManagerContracts/ViewManagementContract";
import TenantApplicationNav from "../Applications/TenantApplicationNav";
import PropertyForm from "./PropertyForm";
import ManagementContractDetails from "../Contracts/OwnerManagerContracts/ManagementContractDetails";
import PMQuotesRequested from "./PMQuotesRequested";
// import SearchManager from "./SearchManager";
import RequestQuotes from "./RequestQuotes";
import AddListing from "./AddListing";
import ManagerDetails from "./ManagerDetails";
import useMediaQuery from "@mui/material/useMediaQuery";

import PropertiesContext from "../../contexts/PropertiesContext";
import ManagementContractContext from "../../contexts/ManagementContractContext";
import CloseIcon from "@mui/icons-material/Close";
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../utils/httpMiddleware";

function Properties() {
  const location = useLocation();
  // //console.log("In Properties");
  // //console.log("In Properties LHS: ", location.state?.showLHS);
  // //console.log("In Properties RHS: ", location.state?.showRHS);
  // //console.log("location.state", location.state);
  const [showOnlyListings, setShowOnlyListings] = useState(location.state?.showOnlyListings ? location.state?.showOnlyListings : false);
  // //console.log("Properties - showOnlyListings", showOnlyListings);
  // const { propertyList, setPropertyList, returnIndex, setReturnIndex  } = useContext(PropertiesContext);
  const propertiesContext = useContext(PropertiesContext);
  const {
    propertyList: propertyListFromContext,
    setPropertyList: setPropertyListFromContext,
    returnIndex: returnIndexFromContext,
    setReturnIndex: setReturnIndexFromContext,
    dataLoaded: dataload,
  } = propertiesContext || {};

  const propertyList = propertyListFromContext;
  const setPropertyList = setPropertyListFromContext;
  const returnIndex = returnIndexFromContext || 0;
  const setReturnIndex = setReturnIndexFromContext;

  // console.log("----loading issue - propertyList - ", propertyList, dataload)
  // //console.log("returnIndexFromContext - ", returnIndexFromContext);

  const { updateContractUID, updateContractPropertyUID, fetchContracts} = useContext(ManagementContractContext);

  const [dataReady, setDataReady] = useState(false);
  const [showSpinner, setShowSpinner] = useState(true);

  let navigate = useNavigate();
  const { getProfileId, selectedRole } = useUser();
  // const [propertyList, setPropertyList] = useState([]);
  const [displayedItems, setDisplayedItems] = useState([]);
  const [propertyIndex, setPropertyIndex] = useState(0);
  const [isFromRentWidget, setFromRentWidget] = useState(false);
  const [reloadPropertyList, setReloadPropertyList] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 950);

  const profileId = getProfileId();
  const [rawPropertyData, setRawPropertyData] = useState([]);

  // const [returnIndexTest, setReturnIndexTest] = useState(location.state?.index || 0);
  const [returnIndexByProp, setReturnIndexByProperty] = useState("");
  const [applicationIndex, setApplicationIndex] = useState(0);

  const [newContractUID, setNewContractUID] = useState(null);
  const [newContractPropertyUID, setNewContractPropertyUID] = useState(null);

  const [managersList, setManagersList] = useState([]);
  const [managerData, setManagerData] = useState(null); // for request quotes

  const [managerDetailsState, setManagerDetailsState] = useState(null);
  const [newPropertyUid, setNewPropertyUid] = useState("");
  const [selectedDocument, setSelectedDocument] = useState("");
  const [currentTab, setCurrentTab] = useState(0);

  // const [ currentProperty, setCurrentProperty ] = useState(location?.state?.currentProperty? location?.state?.currentProperty : null);

  if (location?.state?.currentProperty) {
    setPropertyTo(location?.state?.currentProperty);
  }

  // takes index from location.state and sets the current index
  useEffect(() => {
    if (location.state?.index) {
      // //console.log("location.state?.index - ", location.state?.index);
      setReturnIndex(location.state?.index || 0);
    }
  }, [location?.state]);

  // when propertyList changes, checks if location.state.currentProperty is not null and sets the current index
  useEffect(() => {
    // if(currentProperty){
    if (location?.state?.currentProperty) {
      // setShowSpinner(true);
      // //console.log("currentProperty - ", currentProperty);
      setPropertyTo(location?.state?.currentProperty);
      // setShowSpinner(false)
    }
  }, [propertyList]);

  //hides the spinner after data is loaded.
  useEffect(() => {
    if (dataload) {
      setShowSpinner(false);
    }
  }, [dataload]);

  useEffect(() => {
    if (rawPropertyData && rawPropertyData.property) {
      setShowSpinner(true);
      // //console.log("returnIndex - ", returnIndex);

      const properties = rawPropertyData?.Property?.result;
      // //console.log("returnIndex useEffect - properties - ", properties);
      if (properties != null) {
        const state = {
          ownerId: properties[returnIndex]?.owner_uid,
          managerBusinessId: properties[returnIndex]?.business_uid,
          managerData: properties[returnIndex],
          propertyData: properties,
          index: returnIndex,
          isDesktop: isDesktop,
        };
        //console.log("---inside prop nav state---", state);
        setManagerDetailsState(state);
      }
      setShowSpinner(false);
    }
  }, [returnIndex]);

  // For propertyRentWidget to show filtered vacant properties
  const [filteredPropertyList, setFilteredPropertyList] = useState([]);

  useEffect(() => {
    let filteredList = propertyList;
    if (location.state?.filterVacant) {
      filteredList = propertyList.filter((property) => property.rent_status === "VACANT");
    }
    setFilteredPropertyList(filteredList);
  }, [propertyList, location.state?.filterVacant]);

  useEffect(() => {
    // //console.log("Properties - managerDetailsState - ", managerDetailsState);
    // if (managerDetailsState !== null) {
    //   setRHS("ManagerDetails");
    // }
  }, [managerDetailsState]);

  function updateNavPage() {
    if (returnIndexByProp != "") {
      setPropertyTo(returnIndexByProp);
      setReturnIndexByProperty("");
    }
    setRHS("PropertyNavigator");
  }

  useEffect(() => {
    updateNavPage();
  }, [returnIndexByProp]);

  useEffect(() => {
    // //console.log("Properties - newContractUID - ", newContractUID);
  }, [newContractUID]);

  // useEffect(() => {
  //   //console.log("Properties - newContractPropertyUID - ", newContractPropertyUID);
  // }, [newContractPropertyUID]);

  // useEffect(() => {
  //   //console.log("Properties - managersList - ", managersList);
  // }, [managersList]);

  // LHS , RHS
  const [LHS, setLHS] = useState(location.state?.showLHS || "List");
  const [RHS, setRHS] = useState(location.state?.showRHS || "PropertyNavigator");
  const [page, setPage] = useState("");
  const [tabStatus, SetTabStatus] = useState(0);
  const [viewRHS, setViewRHS] = useState(false);

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // //console.log("View RETURN INDEX : ", returnIndex);

  // //console.log("propertyIndex at the beginning 1: ", propertyIndex);

  // //console.log("LEASE", propertyList[propertyIndex].lease_id)

  function setPropertyTo(newPropertyUid) {
    // //console.log("setPropertyTo - newPropertyUid - ", newPropertyUid);
    // setShowSpinner(true);

    if (newPropertyUid != "") {
      let foundIndex = -1; // Initialize with 0 to indicate not found

      for (let i = 0; i < propertyList.length; i++) {
        if (propertyList[i].property_uid === newPropertyUid) {
          foundIndex = i; // Found the index
          break; // Exit the loop since we found the matching object
        }
      }

      // Now, use setReturnIndex to set the found index
      //  //console.log("setting Return Index 215 - propertyList - ", propertyList);
      //  //console.log("setting Return Index 215 - foundIndex - ", foundIndex);
      if (foundIndex >= 0) {
        setReturnIndex(foundIndex);
      }

      //  setShowSpinner(false);
    }
  }

  // useEffect(()=>{
  //   //console.log("newPropertyUid - ", newPropertyUid)
  //   if(newPropertyUid !== ""){
  //      setPropertyTo(newPropertyUid)
  //      setNewPropertyUid("")
  //   }
  // },[propertyList, newPropertyUid])

  const fetchProperties = async () => {
    setShowSpinner(true);

    // PROPERTIES ENDPOINT
    const property_response = await fetch(`${APIConfig.baseURL.dev}/properties/${profileId}`);
    //const response = await fetch(`${APIConfig.baseURL.dev}/properties/110-000003`)
    if (!property_response.ok) {
      // //console.log("Error fetching Property Details data");
    }
    const propertyData = await property_response.json();
    const propertyList = getPropertyList(propertyData); // This combines Properties with Applications and Maitenance Items to enable the LHS screen
    // //console.log("In Properties > Property Endpoint: ", propertyList);
    setRawPropertyData(propertyData); // Sets rawPropertyData to be based into Edit Properties Function
    setPropertyList([...propertyList]);
    setDisplayedItems([...propertyList]);
    setPropertyIndex(0);

    if (propertyData.Property.code === 200) {
      // //console.log("Endpoint Data is Ready");
      setDataReady(true);
    }
    setShowSpinner(false);
  };

  function getPropertyList(data) {
    const propertyList = data["Property"]?.result;
    const applications = data["Applications"]?.result;
    const maintenance = data["MaintenanceRequests"]?.result;

    const appsMap = new Map();
    applications.forEach((a) => {
      const appsByProperty = appsMap.get(a.property_uid) || [];
      appsByProperty.push(a);
      appsMap.set(a.property_uid, appsByProperty);
    });

    const maintMap = new Map();
    if (maintenance) {
      maintenance.forEach((m) => {
        const maintByProperty = maintMap.get(m.maintenance_property_id) || [];
        maintByProperty.push(m);
        maintMap.set(m.maintenance_property_id, maintByProperty);
      });
    }

    //   //console.log(maintMap);
    return propertyList.map((p) => {
      p.applications = appsMap.get(p.property_uid) || [];
      p.applicationsCount = [...p.applications].filter((a) => ["NEW", "PROCESSING"].includes(a.lease_status)).length;
      p.maintenance = maintMap.get(p.property_uid) || [];
      p.maintenanceCount = [...p.maintenance].filter((m) => m.maintenance_request_status === "NEW" || m.maintenance_request_status === "PROCESSING").length;
      // p.newContracts = contractsMap.get(p.property_uid) || [];
      // p.newContractsCount = [...p.newContracts].filter((m) => m.contract_status === "NEW").length;
      return p;
    });
  }

  const handleEditClick = (editPage) => {
    setPage(editPage);
    setRHS("EditProperty");
  };

  const handleListClick = (newData) => {
    if (isMobile) {
      setViewRHS(true);
    }

    // //console.log("handleListClick - newData - ", newData);
    setReturnIndex(newData);
    // //console.log("View leases RETURN INDEX : ", returnIndex);
  };

  const handleViewLeaseClick = () => {
    // setPage("ViewLease");
    // //console.log("View leases before before: ", propertyList);  // Shows entire Property List with Appliances and Maintenance
    // //console.log("View leases before before Index: ", propertyIndex);  // Shows the selected Property
    // //console.log("View leases before: ", propertyList[propertyIndex]); // Shows the Property List details of the selected Property
    // //console.log("View leases", propertyList[propertyIndex].lease_uid);  // Shows the specific Lease UID
    setRHS("ViewLease");
  };

  const handleAddPropertyClick = () => {
    // setPage("ViewLease");
    // //console.log("View leases before before: ", propertyList);  // Shows entire Property List with Appliances and Maintenance
    // //console.log("View leases before before Index: ", propertyIndex);  // Shows the selected Property
    // //console.log("View leases before: ", propertyList[propertyIndex]); // Shows the Property List details of the selected Property
    // //console.log("View leases", propertyList[propertyIndex].lease_uid);  // Shows the specific Lease UID
    if (isMobile) {
      setViewRHS(true);
    }
    setRHS("AddProperty");
  };

  const handleViewContractClick = () => {
    // setPage("ViewLease");
    // //console.log("View Contract before before: ", propertyList);
    // //console.log("View Contract before before Index: ", propertyIndex);
    // //console.log("View Contract before: ", propertyList[propertyIndex]);
    // //console.log("View Contract", propertyList[propertyIndex].contract_uid);
    setRHS("ViewContract");
  };

  const showNewContract = () => {
    setRHS("CreateContract");
  };

  const handleBackClick = () => {
    if (isMobile) {
      setViewRHS(true);
    }
    setRHS("PropertyNavigator");
  };

  const handleViewApplication = (index) => {
    setApplicationIndex(index);
    setRHS("Applications");
  };

  const handleViewPMQuotesRequested = (tab) => {
    SetTabStatus(tab);
    setRHS("ViewPMQuotesRequested");
  };

  // const handleShowSearchManager = () => {
  //   setRHS("SearchManager");
  // };

  const handleShowSearchManager = () => {
    SetTabStatus(1);
    setRHS("ViewPMQuotesRequested");
  };

  const handleShowRequestQuotes = () => {
    setRHS("RequestQuotes");
  };

  const handleRequestQuotes = (manager) => {
    // //console.log("Properties - handleRequestQuotes - managerData - ", manager);
    setManagerData(manager);
    setRHS("RequestQuotes");
  };
  const handleSorting = (propertyList) => {
    // //console.log("handleSorting called ");
    setPropertyList(propertyList);
  };

  const handleAddListingClick = (mode) => {
    setPage(mode);
    setRHS("AddListing");
  };

  const handleViewManagerDetailsClick = (mode) => {
    setRHS("ManagerDetails");
  };

  const handleManageContract = (contractUID, contractPropertyUID) => {
    // //console.log("handleManageContract - ", contractUID, contractPropertyUID);
    updateContractUID(contractUID);
    updateContractPropertyUID(contractPropertyUID);
    setRHS("ManageContract");
  };

  const handleTabChange = (event, newValue) => {
    // console.log('called tab change', event, newValue);
    setCurrentTab(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      {showSpinner ? (
        <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={true}>
          <CircularProgress color='inherit' />
        </Backdrop>
      ) : (
        <Container maxWidth='lg' sx={{ paddingTop: isMobile ? "0px" : "10px", paddingBottom: "20px", marginTop: theme.spacing(2) }}>
          <Grid container spacing={4} rowGap={1}
            sx={{
              marginTop: isMobile ? "0px" : "15px",
              alignItems: "stretch", 
            }} 
          >
            {(!isMobile || !viewRHS) && (
              <Grid item xs={12} md={4}>
                <PropertiesList
                  LHS={LHS}
                  isDesktop={isDesktop}
                  onDataChange={handleListClick}
                  onAddPropertyClick={handleAddPropertyClick}
                  handleSorting={handleSorting}
                  setRHS={setRHS}
                  setViewRHS={setViewRHS}
                  showOnlyListings={showOnlyListings}
                  handleTabChange={handleTabChange}
                />
              </Grid>
            )}

            {(!isMobile || viewRHS) && (
              <Grid item xs={12} md={8}>
                {RHS === "AddProperty" || (dataload && propertyList.length === 0) ? (
                  <PropertyForm
                    onBack={handleBackClick}
                    showNewContract={showNewContract}
                    setReloadPropertyList={setReloadPropertyList}
                    setNewPropertyUid={setNewPropertyUid}
                    setPropertyTo={setPropertyTo}
                  />
                ) : (
                  <>
                    {RHS === "PropertyNavigator" && (
                      // <PropertyNavigator
                      //   isDesktop={isDesktop}
                      //   onEditClick={handleEditClick}
                      //   onViewLeaseClick={handleViewLeaseClick}
                      //   onViewContractClick={handleViewContractClick}
                      //   onManageContractClick={handleManageContract}
                      //   handleViewApplication={handleViewApplication}
                      //   handleViewPMQuotesRequested={handleViewPMQuotesRequested}
                      //   onShowSearchManager={handleShowSearchManager}
                      //   // onShowSearchManager={handleViewPMQuotesRequested}
                      //   handleShowRequestQuotes={handleShowRequestQuotes}
                      //   onAddListingClick={handleAddListingClick}
                      //   setManagerDetailsState={setManagerDetailsState}
                      //   handleViewManagerDetailsClick={handleViewManagerDetailsClick}
                      //   showOnlyListings={showOnlyListings}
                      //   setViewRHS={setViewRHS}
                      // />
                      <PropertyNavigator2
                        isDesktop={isDesktop}
                        onEditClick={handleEditClick}
                        onViewLeaseClick={handleViewLeaseClick}
                        onViewContractClick={handleViewContractClick}
                        onManageContractClick={handleManageContract}
                        handleViewApplication={handleViewApplication}
                        handleViewPMQuotesRequested={handleViewPMQuotesRequested}
                        onShowSearchManager={handleShowSearchManager}
                        // onShowSearchManager={handleViewPMQuotesRequested}
                        handleShowRequestQuotes={handleShowRequestQuotes}
                        onAddListingClick={handleAddListingClick}
                        setManagerDetailsState={setManagerDetailsState}
                        handleViewManagerDetailsClick={handleViewManagerDetailsClick}
                        showOnlyListings={showOnlyListings}
                        setViewRHS={setViewRHS}
                        handleTabChange={handleTabChange}
                        currentTab={currentTab}
                        setCurrentTab={setCurrentTab}
                      />
                    )}
                    {RHS === "EditProperty" && (
                      <EditProperty
                        currentId={propertyList[returnIndex].property_uid}
                        property={propertyList[returnIndex]}
                        page={page}
                        isDesktop={isDesktop}
                        onBackClick={handleBackClick}
                        setRHS={setRHS}
                      />
                    )}
                    {RHS === "ViewLease" && <ViewLease lease_id={propertyList[0].lease_uid} isDesktop={isDesktop} onBackClick={handleBackClick} />}
                    {RHS === "ViewContract" && <ViewManagementContract isDesktop={isDesktop} onBackClick={handleBackClick} />}
                    {RHS === "Applications" && (
                      <TenantApplicationNav
                        index={applicationIndex}
                        propertyIndex={applicationIndex}
                        property={propertyList[returnIndex]}
                        isDesktop={isDesktop}
                        onBackClick={handleBackClick}
                        setRHS={setRHS}
                        setSelectedDocument={setSelectedDocument}
                      />
                    )}
                    {RHS === "filePreview" && <DocumentPreview file={selectedDocument.file} onClose={selectedDocument.onClose} />}

                    {RHS === "CreateContract" && <ManagementContractDetails />}
                    {RHS === "ViewPMQuotesRequested" && (
                      <PMQuotesRequested tabStatus={tabStatus} handleBackClick={handleBackClick} setManagersList={setManagersList} handleRequestQuotes={handleRequestQuotes} />
                    )}
                    {/* {RHS === "SearchManager" && (
                <SearchManager                     
                    setManagersList={setManagersList}
                    handleBackClick={handleBackClick}
                    handleRequestQuotes={handleRequestQuotes}                    
                    propertyId={propertyList[returnIndex].property_uid}
                  />
              )} */}
                    {RHS === "RequestQuotes" && <RequestQuotes managerData={managerData} onShowSearchManager={handleViewPMQuotesRequested} />}
                    {RHS === "AddListing" && (
                      <AddListing
                        page={page}
                        propertyId={propertyList[returnIndex]?.property_uid}
                        onBackClick={handleBackClick}
                        setRHS={setRHS}
                        showPropertyNavigator={updateNavPage}
                      />
                    )}
                    {RHS === "ManagerDetails" && (
                      <ManagerDetails
                        managerDetailsState={managerDetailsState}
                        handleBackClick={handleBackClick}
                        handleShowSearchManager={handleShowSearchManager}
                        setReturnIndexByProperty={setReturnIndexByProperty}
                      />
                    )}
                    {RHS === "ManageContract" && <ManagementContractDetails page={"properties"} handleBackClick={handleBackClick} navigatingFrom={"ManageContract"} fetchContracts={fetchContracts}/>}
                  </>
                )}
              </Grid>
            )}
          </Grid>
        </Container>
      )}
    </ThemeProvider>
  );
}

export default Properties;

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
        height: "100%",
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
