import React, { useState, useEffect, useContext, } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Typography, Box, Stack, Paper, Button, ThemeProvider, Grid, Container, InputBase, IconButton, Avatar, Badge } from "@mui/material";
import theme from "../../theme/theme";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import propertyImage from "./propertyImage.png";
import maintenanceIcon from "./maintenanceIcon.png";
import { useUser } from "../../contexts/UserContext";
import { get } from "../utils/api";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { DataGrid, gridClasses } from "@mui/x-data-grid";
import APIConfig from "../../utils/APIConfig";
import PropertyDetail from "./PropertyDetail";
import PropertyDetail2 from "./PropertyDetail2";
// import PMRent from "../Rent/PMRent/PMRent";
import PropertyForm from "../Property/PropertyForm";
import PropertiesSearch from "./PropertiesSearch";
import PMRent from "../Rent/PMRent/PMRent";

import PropertiesContext from '../../contexts/PropertiesContext';

export default function PropertiesList(props) {
  // console.log("In Property List: ", props.propertyList);  
  const location = useLocation();
  let navigate = useNavigate();
  const { getProfileId, selectedRole } = useUser();
  // const { propertyList, returnIndex, setReturnIndex, setCurrentPropertyID, setCurrentProperty  } = useContext(PropertiesContext); 

  const propertiesContext = useContext(PropertiesContext);
	const {
	  propertyList: propertyListFromContext,	  
    returnIndex: returnIndexFromContext,
    setReturnIndex,
    setCurrentPropertyID,
    setCurrentProperty,
    allContracts: allContractsFromContext,    	  
	} = propertiesContext || {};
  
	const propertyList = propertyListFromContext || [];		  
	const returnIndex = returnIndexFromContext || 0;  
  const allcontracts = allContractsFromContext || []
	

  // const [propertyList, setPropertyList] = useState([]);
  const [displayedItems, setDisplayedItems] = useState([]);
  const [citySortOrder, setCitySortOrder] = useState("asc");
  const [stateSortOrder, setStateSortOrder] = useState("asc");
  const [addressSortOrder, setAddressSortOrder] = useState("asc");
  const [statusSortOrder, setStatusSortOrder] = useState("asc");
  const [zipSortOrder, setZipSortOrder] = useState("asc");
  const [propertyIndex, setPropertyIndex] = useState(0);
  // const [allRentStatus, setAllRentStatus] = useState([]);
  const [LHS, setLHS] = useState("Rent");
  const [isFromRentWidget, setFromRentWidget] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 950);
  const [showPropertyForm, setShowPropertyForm] = useState(location.state?.showPropertyForm || false);
  const [showRentForm, setShowRentForm] = useState(location.state?.showRentForm || false);
  // const [allContracts, setAllContracts] = useState([]);
  const profileId = getProfileId();
  // const [returnIndex, setReturnIndex] = useState(0);
  const [initialPropInRent, setInitialPropInRent] = useState("");
  const [isDataReady, setIsDataReady] = useState(false);

  // console.log("In Property List - propertyList outside: ", propertyList);
  // console.log("In Property List - displayList outside: ", displayedItems);
  // console.log("In Property List - propertyIndex outside: ", propertyIndex);
  // console.log("In Property List - returnIndex outside: ", );
  // console.log("In Property List - rentStatus outside: ", allRentStatus);
  // console.log("In Property List - LHS outside: ", LHS);
  

  useEffect(() => { 
    console.log("ROHIT - 74 - props.showOnlyListings - ", props.showOnlyListings)       
    if(props.showOnlyListings && props.showOnlyListings === true){
      const onlyListings = propertyList?.filter( property => property.rent_status === "VACANT")
      setDisplayedItems(onlyListings);
    } else {
      setDisplayedItems(propertyList);
    }

    setPropertyIndex(returnIndex || 0);    
    setLHS(props.LHS);
    setIsDataReady(true);

  }, [props.LHS, returnIndex, propertyList, props.showOnlyListings]);  

  useEffect(() => {
    console.log("displayedItems changed - ", displayedItems);
    if (LHS === "Rent") {
      onPropertyInRentWidgetClicked(initialPropInRent);
    }
  }, [displayedItems]);

  const onPropertyClick = (params) => {
    const property = params.row;
    const i = displayedItems.findIndex((p) => p.property_uid === property.property_uid);
    // console.log("List Item Clicked", property, i, displayedItems);    
    setPropertyIndex(i);    
    setReturnIndex(i);
    setCurrentPropertyID(property.property_uid);
    setCurrentProperty(property);
  };

  const onPropertyInRentWidgetClicked = (property_uid) => {
    // console.log("onPropertyInRentWidgetClicked Clicked", property_uid, displayedItems);
    if (displayedItems.length > 0) {
      const i = displayedItems.findIndex((p) => p.property_uid === property_uid);
      // console.log("onPropertyInRentWidgetClicked Clicked", property_uid, i, displayedItems);
      setPropertyIndex(i);      
      setReturnIndex(i)
      setCurrentPropertyID(property_uid);
      setCurrentProperty(displayedItems[i]);
    }
  };  

  const getRowSpacing = React.useCallback((params) => {
    return {
      top: params.isFirstVisible ? 0 : 3,
      bottom: params.isLastVisible ? 0 : 3,
    };
  });

  function convertDataToRows(displayedItems) {
    // console.log("In convertDataToRows: ", displayedItems);
    return displayedItems.map((property, index) => ({
      id: index,
      ...property,
    }));
  }

  function getNumOfMaintenanceReqs(property) {
    return property?.maintenanceCount ?? 0;
  }

  function getNumOfApplications(property) {
    if(property.rent_status === "NO MANAGER"){
      var count = 0;

      if(allcontracts){

        const propertyId = property?.property_uid;
        const filtered = allcontracts?.filter((contract) => contract.property_id === propertyId);
        // console.log("--dhyey---322 - PropertyNavigator - filtered contracts - ", filtered);
        filtered.forEach((contract) => {
          if (contract.contract_status == "SENT") {
            count++;
          }
        }); 
      }

      return count
    }else{
      return property.applicationsCount ?? 0;
    }
  }

  function getCoverPhoto(property) {
    // console.log("In Property List >> In getCoverPhoto");
    // console.log(property.property_images);
    const imageArray = JSON.parse(property.property_images);
    // console.log("getCoverPhoto - imageArray - ", imageArray);
    if (property.property_favorite_image) {
      const index = imageArray.findIndex((image) => image === property.property_favorite_image);
      if (index !== -1) {
        return property.property_favorite_image;
      } else if (imageArray.length !== 0) {
        return imageArray[0];
      }else {
        return propertyImage;
      }
    } else if (imageArray != null && imageArray?.length !== 0) {
      return imageArray[0];
    } else {
      return propertyImage;
    }
  }

  function displayAddress(property) {
    if (property.property_unit !== "") {
      return (
        <Typography
          sx={{
            color: theme.typography.common.blue,
            fontWeight: theme.typography.primary.fontWeight,
            fontSize: "11px",
            margin: "0px", 
            padding: "0px",
            textAlign: "center",
            verticalAlign: "middle",
            alignItems: "center",
          }}
        >
          {property.property_address} #{property.property_unit}
          <br />
          {property.property_city + " " + property.property_state + " " + property.property_zip}
        </Typography>
      );
    } else {
      return (
        <Typography
          sx={{
            color: theme.typography.common.blue,
            fontWeight: theme.typography.primary.fontWeight,
            fontSize: "11px",
            margin: "0px",
            padding: "0px",
            textAlign: "center",
            verticalAlign: "middle",
            alignItems: "center",
          }}
        >
          {property.property_address} <br />
          {property.property_city + " " + property.property_state + " " + property.property_zip}
        </Typography>
      );
    }
  }

  const paymentStatusColorMap = {
    "Paid On Time": theme.palette.priority.clear,
    "Partially Paid": theme.palette.priority.medium,
    "Paid Late": theme.palette.priority.low,
    "Not Paid": theme.palette.priority.high,
    Vacant: "#160449",
    "No Manager": theme.palette.priority.low,
    "Not Listed": theme.palette.priority.medium,
  };

  const paymentStatusMap = {
    UNPAID: "Not Paid",
    "PAID LATE": "Paid Late",
    PAID: "Paid On Time",
    Partial: "Partially Paid",
    VACANT: "Vacant",
    "NOT LISTED": "Not Listed",
    "NO MANAGER": "No Manager",
  };

  function getPaymentStatusColor(paymentStatus, property) {
    console.log("ROHIT - 214 - property - ", property);
    if ((paymentStatus === null || paymentStatus === undefined || paymentStatus === "VACANT") && (property.property_available_to_rent && property.property_available_to_rent === 1)) {
      return paymentStatusColorMap["Vacant"];
    } else if((paymentStatus === null || paymentStatus === undefined || paymentStatus === "VACANT") && (property.property_available_to_rent == null || property.property_available_to_rent === 0)){
      return paymentStatusColorMap["Not Listed"];
    } else {
      const status = paymentStatusMap[paymentStatus];
      return paymentStatusColorMap[status];
    }
  }

  function getPaymentStatus(paymentStatus, property) {    
    if ((paymentStatus === null || paymentStatus === undefined || paymentStatus === "VACANT") && (property.property_available_to_rent && property.property_available_to_rent === 1)) {
      return paymentStatusMap["VACANT"];
    } else if((paymentStatus === null || paymentStatus === undefined || paymentStatus === "VACANT") && (property.property_available_to_rent == null || property.property_available_to_rent === 0)){
      return paymentStatusMap["NOT LISTED"];
    } else {
      const status = paymentStatusMap[paymentStatus];
      return status;
    }
  }

  const [rows, setRows ] = useState(convertDataToRows(displayedItems));

  useEffect(() => {
    setRows(displayedItems);
  }, [displayedItems])
  const columns = [
    {
      field: "avatar",
      headerName: "",
      flex: 0.4,
      renderCell: (params) => (
        <Avatar
          src={`${getCoverPhoto(params.row)}?${Date.now()}`}
          alt='property image'
          sx={{
            borderRadius: "0",
            width: "60px",
            height: "60px",
            margin: "0px",
            padding: "0px",
          }}
        />
      ),
    },
    {
      field: "address",
      headerName: "Address",
      headerAlign: "center",
      flex: 1,
      renderCell: (params) => displayAddress(params.row),
    },
    {
      field: "paymentStatus",
      headerName: "Status",
      headerAlign: "center",
      flex: 0.6,
      renderCell: (params) => (
        <Box
          sx={{
            backgroundColor: getPaymentStatusColor(params.row.rent_status, params.row),
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "0px",
            border: "none",
            margin: "0px",
          }}
        >
          <Badge
            overlap='circular'
            color='success'
            badgeContent={getNumOfApplications(params.row)}
            invisible={!getNumOfApplications(params.row)}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            style={{
              color: "#000000",
              width: "100%",
            }}
          >
            <Typography
              sx={{
                color: theme.palette.primary.main,
                fontWeight: theme.typography.primary.fontWeight,
                fontSize: "11px",
                margin: "0px",
                height: "50px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                textAlign: "center",
              }}
            >
              {getPaymentStatus(params.row.rent_status, params.row)}
            </Typography>
          </Badge>
        </Box>
      ),
    },
    {
      field: "maintenanceIcon",
      headerName: "Issues",
      headerAlign: "center",
      flex: 0.5,
      renderCell: (params) => {
        const numOfMaintenanceReqs = getNumOfMaintenanceReqs(params.row);
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <Badge
              overlap='circular'
              color='error'
              badgeContent={numOfMaintenanceReqs}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              sx={{
                color: "#000000",
              }}
              onClick={(e) => {
                // console.log("selected in", params);
                if (numOfMaintenanceReqs > 0) {
                  if (selectedRole === "OWNER") {
                    navigate("/ownerMaintenance", {
                      state: {
                        fromProperty: true,
                        index: params.id,
                        propertyId: displayedItems[params.id].property_uid,
                      },
                    });
                  } else {
                    navigate("/managerMaintenance", {
                      state: {
                        fromProperty: true,
                        index: params.id,
                        propertyId: displayedItems[params.id].property_uid,
                      },
                    });
                  }
                }
              }}
            >
              <img src={maintenanceIcon} alt='maintenance icon' style={{ width: "35px", height: "35px" }} />
            </Badge>
          </Box>
        );
      },
    },
  ];

  function sortByAddress() {
    let items = [...displayedItems];
    items.sort((property1, property2) => property1.property_address.localeCompare(property2.property_address));
    const sortedList = addressSortOrder === "asc" ? items : items.reverse();
    setDisplayedItems(sortedList);
    setAddressSortOrder(addressSortOrder === "asc" ? "desc" : "asc");
    props.handleSorting(sortedList);
    // props.onDataChange(0);
    setReturnIndex(0)
    setCurrentPropertyID(null);
    setCurrentProperty(null);
    
  }

  function sortByZip() {
    let items = [...displayedItems];
    items.sort((property1, property2) => property1.property_zip - property2.property_zip);
    const sortedList = zipSortOrder === "asc" ? items : items.reverse();
    setDisplayedItems(sortedList);
    setZipSortOrder(zipSortOrder === "asc" ? "desc" : "asc");
    props.handleSorting(sortedList);
    // props.onDataChange(0);
    setReturnIndex(0)
    setCurrentPropertyID(null);
    setCurrentProperty(null);
  }

  function sortByStatus() {
    let items = [...displayedItems];
    items.sort((property1, property2) => {
      if (property1.rent_status === "NO MANAGER") {
        return -1; // Property1 comes first
      } else if (property2.rent_status === "NO MANAGER") {
        return 1; // Property2 comes first
      } else {
        return property1.rent_status.localeCompare(property2.rent_status);
      }
    });
    const sortedList = statusSortOrder === "asc" ? items : items.reverse();
    setDisplayedItems(sortedList);
    setStatusSortOrder(statusSortOrder === "asc" ? "desc" : "asc");
    props.handleSorting(sortedList);
    // props.onDataChange(0);
    setReturnIndex(0);
    setCurrentPropertyID(null);
    setCurrentProperty(null);
  }

  return (
      <Grid item xs={12} md={12}>
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
              marginTop: "15px",
              backgroundColor: theme.palette.primary.main,
              width: "100%", 
              maxWidth: "800px", 
            }}
          >
            <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ padding: theme.spacing(2), position: "relative" }}>
              <Box sx={{ flex: 1 }} />
              <Box position='absolute' left='50%' sx={{ transform: "translateX(-50%)" }}>
                <Typography
                  sx={{
                    color: theme.typography.primary.black,
                    fontWeight: theme.typography.primary.fontWeight,
                    fontSize: theme.typography.largeFont,
                  }}
                >
                  All Properties PM
                </Typography>
              </Box>
              <Button position='absolute' right={0} sx={{ "&:hover, &:focus, &:active": { background: theme.palette.primary.main } }} onClick={props.onAddPropertyClick}>
                <AddIcon sx={{ color: theme.typography.primary.black, fontSize: "30px", margin: "5px" }} />
              </Button>
            </Stack>
    
            <Box sx={{ padding: "10px" }}>
              {LHS === "Rent" && isDataReady === true ? (
                <Box sx={{ marginTop: "20px" }}>
                  <Grid item xs={12} md={12}>
                    <PMRent setLHS={setLHS} onPropertyInRentWidgetClicked={onPropertyInRentWidgetClicked} setInitialPropInRent={setInitialPropInRent} />
                  </Grid>
                </Box>
              ) : (
                <>
                  <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ position: "relative" }}>
                  {/* New Buttons */}
                    <Box sx={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", padding: "0px 10px" }}>
                      <Button
                        onClick={sortByZip}
                        sx={{
                          background: "#3D5CAC",
                          fontWeight: theme.typography.secondary.fontWeight,
                          fontSize: theme.typography.smallFont,
                          cursor: "pointer",
                          textTransform: "none",
                          minWidth: "100px", // Fixed width for the button
                          minHeight: "35px",
                        }}
                        size='small'
                      >
                        Zip
                      </Button>
                      <Button
                        onClick={sortByAddress}
                        variant='outlined'
                        sx={{
                          background: "#3D5CAC",
                          color: theme.palette.background.default,
                          fontWeight: theme.typography.secondary.fontWeight,
                          fontSize: theme.typography.smallFont,
                          cursor: "pointer",
                          textTransform: "none",
                          minWidth: "100px", 
                          minHeight: "35px",
                        }}
                        size='small'
                      >
                        Address
                      </Button>
                      <Button
                        onClick={sortByStatus}
                        sx={{
                          background: "#3D5CAC",
                          fontWeight: theme.typography.secondary.fontWeight,
                          fontSize: theme.typography.smallFont,
                          cursor: "pointer",
                          textTransform: "none",
                          minWidth: "100px", // Fixed width for the button
                          minHeight: "35px",
                        }}
                        size='small'
                      >
                        Rent Status
                      </Button>
                    </Box>
                  </Stack>
                  <PropertiesSearch propertyList={propertyList} setFilteredItems={setDisplayedItems} sx={{ width: "100%" }} />
    
                  <Box sx={{ marginTop: "20px" }}>
                    <DataGrid
                      getRowHeight={() => "auto"}
                      getRowId={(row) => row.property_uid}
                      rows={rows}
                      columns={columns}
                      autoHeight
                      pageSizeOptions={[15]}
                      initialState={{
                        pagination: {
                          paginationModel: {
                            pageSize: 15,
                          },
                        },
                      }}
                      onRowClick={onPropertyClick}
                      rowSelectionModel={[propertyIndex]}
                  // onRowSelectionModelChange={(newSelection) => {
                  //   if (newSelection.length > 0) {
                  //     setPropertyIndex(newSelection[0]);
                  //   }
                  // }}
                      getRowSpacing={getRowSpacing}
                      sx={{
                        "& .MuiDataGrid-virtualScroller::-webkit-scrollbar": { display: "none" },
                        "& .MuiDataGrid-row:hover": {
                          cursor: "pointer",
                        },
                        "& .MuiDataGrid-cell": {
                          padding: "0px",
                          margin: "0px",
                          alignItems: "center",
                          justifyContent: "center",
                        },
                        "& .MuiDataGrid-row.Mui-selected": {
                          backgroundColor: "#949494",
                        },
                        [`& .${gridClasses.row}`]: {
                          bgcolor: theme.palette.form.main,
                          "&:before": {
                            content: '""',
                            display: "block",
                            height: "100%",
                            backgroundColor: "#ffffff",
                            position: "absolute",
                            left: "0",
                            right: "0",
                            zIndex: "-1",
                          },
                        },
                      }}
                    />
                  </Box>
                </>
              )}
            </Box>
          </Paper>
        </Box>
      </Grid>
    );    
}
