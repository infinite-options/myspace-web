import React, { useState, useEffect, useContext } from "react";
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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import useMediaQuery from "@mui/material/useMediaQuery";
import APIConfig from "../../utils/APIConfig";
import PropertyDetail from "./PropertyDetail";
import PropertyDetail2 from "./PropertyDetail2";
// import PMRent from "../Rent/PMRent/PMRent";
import PropertyForm from "../Property/PropertyForm";
import PropertiesSearch from "./PropertiesSearch";
import PMRent from "../Rent/PMRent/PMRent";

import PropertiesContext from "../../contexts/PropertiesContext";
import ManagementContractContext from '../../contexts/ManagementContractContext';

const paymentStatusColorMap = {
  "Paid On Time": theme.palette.priority.clear,
  "Partially Paid": theme.palette.priority.medium,
  "Paid Late": theme.palette.priority.low,
  "Not Paid": theme.palette.priority.high,
  Vacant: "#160449",
  "No Manager": "#626264",
  // "Not Listed": theme.palette.priority.medium,
  "Not Listed": "#000000",
};

const paymentStatusMap = {
  UNPAID: "Not Paid",
  "PAID LATE": "Paid Late",
  PAID: "Paid On Time",
  "PARTIALLY PAID": "Partially Paid",
  VACANT: "Vacant",
  "NOT LISTED": "Vacant - Not Listed",
  "NO MANAGER": "No Manager",
};

export function getPaymentStatusColor(paymentStatus, property) {
  // //console.log("214 - property - ", property);
  if ((paymentStatus === null || paymentStatus === undefined || paymentStatus === "VACANT") && property?.property_available_to_rent && property?.property_available_to_rent === 1) {
    return paymentStatusColorMap["Vacant"];
  } else if (
    (paymentStatus === null || paymentStatus === undefined || paymentStatus === "VACANT") &&
    (property?.property_available_to_rent == null || property?.property_available_to_rent === 0)
  ) {
    return paymentStatusColorMap["Not Listed"];
  } else {
    const status = paymentStatusMap[paymentStatus];
    return paymentStatusColorMap[status];
  }
}

export function getPaymentStatus(paymentStatus, property) {
  if ((paymentStatus === null || paymentStatus === undefined || paymentStatus === "VACANT") && property?.property_available_to_rent && property?.property_available_to_rent === 1) {
    return paymentStatusMap["VACANT"];
  } else if (
    (paymentStatus === null || paymentStatus === undefined || paymentStatus === "VACANT") &&
    (property?.property_available_to_rent == null || property?.property_available_to_rent === 0)
  ) {
    return paymentStatusMap["NOT LISTED"];
  } else {
    const status = paymentStatusMap[paymentStatus];
    return status;
  }
}

export default function PropertiesList(props) {
  // //console.log("In Property List: ", props.propertyList);
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
    // allContracts: allContractsFromContext,
  } = propertiesContext || {};

  const managementContractContext = useContext(ManagementContractContext);
  const {
    allContracts: allContractsFromContext,
  } = managementContractContext || {};

  const propertyList = propertyListFromContext || [];
  const returnIndex = returnIndexFromContext || 0;
  const allcontracts = allContractsFromContext || [];

  // //console.log("ROHIT - PropertiesList - returnIndex - ", returnIndex);
  // const [propertyList, setPropertyList] = useState([]);
  const [displayedItems, setDisplayedItems] = useState([]);
  const [citySortOrder, setCitySortOrder] = useState("asc");
  const [stateSortOrder, setStateSortOrder] = useState("asc");
  const [addressSortOrder, setAddressSortOrder] = useState("asc");
  const [statusSortOrder, setStatusSortOrder] = useState("asc");
  const [zipSortOrder, setZipSortOrder] = useState("asc");
  const [propertyIndex, setPropertyIndex] = useState(returnIndex);
  // const [allRentStatus, setAllRentStatus] = useState([]);
  const [LHS, setLHS] = useState("Rent");
  const [isFromRentWidget, setFromRentWidget] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 950);
  const [showPropertyForm, setShowPropertyForm] = useState(location.state?.showPropertyForm || false);
  const [showRentForm, setShowRentForm] = useState(location.state?.showRentForm || false);
  // const [allContracts, setAllContracts] = useState([]);
  const profileId = getProfileId();
  // const [returnIndex, setReturnIndex] = useState(0);
  const [initialPropInRent, setInitialPropInRent] = useState(0);
  const [isDataReady, setIsDataReady] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // //console.log("In Property List - propertyList outside: ", propertyList);
  // //console.log("In Property List - displayList outside: ", displayedItems);
  // //console.log("In Property List - propertyIndex outside: ", propertyIndex);
  // //console.log("In Property List - returnIndex outside: ", );
  // //console.log("In Property List - rentStatus outside: ", allRentStatus);
  // //console.log("In Property List - LHS outside: ", LHS);

  //datagrid current page and page size
  const [page, setPage] = useState(0);
  // const [pageSize, setPageSize] = useState(15);

  const [paginationModel, setPaginationModel] = React.useState({
    pageSize: 15,
    page: 0,
  });

  useEffect(() => {
    //set current page in datagrid
    // Calculate the page based on the current index and page size
    // //console.log("ROHIT - PropertiesList - propertyIndex - ", propertyIndex);
    if (propertyList.length > 0 && propertyIndex !== null) {
      const calculatedPage = Math.floor(propertyIndex / 15);
      // //console.log("ROHIT - PropertiesList - calculatedPage - ", calculatedPage);
      // setPage(calculatedPage); // Update the current page
      setPaginationModel({
        pageSize: 15,
        page: calculatedPage,
        pageSizeOptions: [5, 10, 15],
      });
    }
  }, [propertyIndex, propertyList]);

  useEffect(() => {
    // //console.log("74 - props.showOnlyListings - ", propertyList);
    const returnIndex = returnIndexFromContext || 0;
    if (props.showOnlyListings && props.showOnlyListings === true) {
      const onlyListings = propertyList?.filter((property) => property.rent_status === "VACANT");
      setDisplayedItems(onlyListings);
    } else {
      setDisplayedItems(propertyList);
    }

    setPropertyIndex(returnIndex || 0);
    // setCurrentRowIndex(propertyList[0].property_uid)
    setLHS(props.LHS);
    setIsDataReady(true);

    // }, [props.LHS, returnIndex, propertyList, props.showOnlyListings]);
  }, [props.LHS, propertyList, props.showOnlyListings, returnIndexFromContext]);

  useEffect(() => {
    // //console.log("displayedItems changed - ", displayedItems);
    if (displayedItems && displayedItems.length > 0) {
      const firstItem = displayedItems[0];
      const i = propertyList?.findIndex((p) => p.property_uid === firstItem.property_uid);
      if (returnIndex === 0) {
        setReturnIndex(i);
      }

      if (LHS === "Rent" && !isMobile) {
        onPropertyInRentWidgetClicked(initialPropInRent);
      }
    }
  }, [displayedItems]);

  const onPropertyClick = (params) => {
    const property = params.row;
    // const i = displayedItems.findIndex((p) => p.property_uid === property.property_uid);
    const i = propertyList?.findIndex((p) => p.property_uid === property.property_uid);
    // //console.log("List Item Clicked", property, i, displayedItems);
    setPropertyIndex(property.id);
    setReturnIndex(i);
    setCurrentPropertyID(property.property_uid);
    setCurrentProperty(property);
    props.setRHS("PropertyNavigator");
    props.setViewRHS(true);
  };

  const onPropertyInRentWidgetClicked = (property_uid) => {
    //console.log("onPropertyInRentWidgetClicked Clicked", property_uid, displayedItems);
    if (displayedItems.length > 0) {
      const i = displayedItems.findIndex((p) => p.property_uid === property_uid);
      // //console.log("onPropertyInRentWidgetClicked Clicked", property_uid, i, displayedItems);
      setPropertyIndex(i);
      setReturnIndex(i);
      setCurrentPropertyID(property_uid);
      setCurrentProperty(displayedItems[i]);
      props.setRHS("PropertyNavigator");
      props.setViewRHS(true);
    }
  };

  const getRowSpacing = React.useCallback((params) => {
    return {
      top: params.isFirstVisible ? 0 : 3,
      bottom: params.isLastVisible ? 0 : 3,
    };
  });

  function convertDataToRows(displayedItems) {
    // //console.log("In convertDataToRows: ", displayedItems);
    return displayedItems.map((property, index) => ({
      ...property,
      id: index,
    }));
  }

  function getNumOfMaintenanceReqs(property) {
    return property?.maintenanceCount ?? 0;
  }

  function getNumOfApplications(property) {
    if (property.rent_status === "NO MANAGER") {
      var count = 0;

      if (allcontracts) {
        const propertyId = property?.property_uid;
        const filtered = allcontracts?.filter((contract) => contract.property_uid === propertyId);
        // //console.log("--dhyey---322 - PropertyNavigator - filtered contracts - ", filtered);
        filtered.forEach((contract) => {
          if (contract.contract_status == "SENT") {
            count++;
          }
        });
      }
      return count;
    } else {
      return property.leases ? property.leases.filter((app) => app.lease_status === "NEW").length : 0;
    }
  }

  function getCoverPhoto(property) {
    // console.log("In Property List >> In getCoverPhoto");
    // //console.log(property.property_images);
    const imageArray = JSON.parse(property.property_images);
    // //console.log("getCoverPhoto - imageArray - ", imageArray);
    if (property.property_favorite_image) {
      const index = imageArray.findIndex((image) => image === property.property_favorite_image);
      if (index !== -1) {
        return property.property_favorite_image;
      } else if (imageArray.length !== 0) {
        return imageArray[0];
      } else {
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

  const [rows, setRows] = useState(convertDataToRows(displayedItems));

  useEffect(() => {
    setRows(convertDataToRows(displayedItems));
  }, [displayedItems]);

  const columns = [
    {
      field: "avatar",
      headerName: "",
      flex: 0.4,
      renderCell: (params) => (
        <Box
          sx={{
            width: "60px",
            height: "60px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden", // Ensures no overflow
          }}
        >
          <img
            // src={`${getCoverPhoto(params.row)}?${Date.now()}`}
            src={`${getCoverPhoto(params.row)}`}
            alt='property'
            style={{
              width: "100%", // Ensures the image takes full width
              height: "auto", // Maintain aspect ratio
            }}
          />
        </Box>
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
      renderCell: (params) => {
        //console.log("Payment Status params:", params); // Log params
        return (
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
              overlap="circular"
              color= {params.row.rent_status === "NO MANAGER" ? "warning" : "success"}
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
              onClick={(e) => {params.row.rent_status === "NO MANAGER" ? props.handleTabChange(e, 2) : props.handleTabChange(e, 1)}}
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

            {(params.row.contract_renew_status === "ENDING" || params.row.contract_renew_status === "EARLY TERMINATION") && (
              <Badge
                overlap="circular"
                color="info"
                badgeContent="E"
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                style={{
                  color: "#000000",
                  // width: "100%",
                  backgroundColor:"yellow",
                  transform: 'translate(-70px, -17px)',
                }}
              />
            )}

            {(params.row.contract_renew_status === "RENEW REQUESTED" || params.row.contract_renew_status === "PM RENEW REQUESTED") && (
              <Badge
                overlap="circular"
                color="warning"
                badgeContent="R"
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                style={{
                  color: "#000000",
                  // width: "100%",
                  backgroundColor:"yellow",
                  transform: 'translate(-70px, -17px)',
                }}
              />
            )}
          </Box>
        );
      },
    },
    {
      field: "maintenanceIcon",
      headerName: "Issues",
      headerAlign: "center",
      flex: 0.5,
      renderCell: (params) => {
        const numOfMaintenanceReqs = getNumOfMaintenanceReqs(params.row);
        // //console.log("params -- ", params)
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
                // //console.log("selected in", params);
                if (numOfMaintenanceReqs > 0) {
                  if (selectedRole === "OWNER") {
                    navigate("/ownerMaintenance", {
                      state: {
                        fromProperty: true,
                        index: params.row.id,
                        propertyId: displayedItems[params.row.id].property_uid,
                      },
                    });
                  } else {
                    navigate("/managerMaintenance", {
                      state: {
                        fromProperty: true,
                        index: params.row.id,
                        propertyId: displayedItems[params.row.id].property_uid,
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
    setReturnIndex(0);
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
    setReturnIndex(0);
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
    // <Grid item xs={12} md={12}>
      
    // </Grid>
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
          maxWidth: "800px",
        }}
      >
        <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ padding: theme.spacing(2), position: "relative" }}>
          {!isMobile && <Box sx={{ flex: 1 }} />}
          {isMobile && (
            <Box component='span' display='flex' justifyContent='flex-start' alignItems='flex-start' position='relative' flex={"1"}>
              <Button
                onClick={() => {
                  if (selectedRole === "OWNER") {
                    navigate("/ownerDashboard");
                  } else if (selectedRole === "MANAGER") {
                    navigate("/managerDashboard");
                  }
                }}
              >
                <ArrowBackIcon
                  sx={{
                    color: theme.typography.primary.black,
                    fontSize: "30px",
                    margin: "5px",
                  }}
                />
              </Button>
            </Box>
          )}
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
                <Box sx={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", paddingBottom: "10px" }}>
                  <Button
                    onClick={sortByZip}
                    variant='contained'
                    sx={{
                      background: "#3D5CAC",
                      fontWeight: theme.typography.secondary.fontWeight,
                      color: theme.palette.background.default,
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
                    variant='contained'
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
                    variant='contained'
                    sx={{
                      background: "#3D5CAC",
                      fontWeight: theme.typography.secondary.fontWeight,
                      color: theme.palette.background.default,
                      fontSize: theme.typography.smallFont,
                      cursor: "pointer",
                      textTransform: "none",
                      minWidth: "100px", // Fixed width for the button
                      minHeight: "35px",
                      whiteSpace: "nowrap",
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
                  rows={rows}
                  columns={columns}
                  autoHeight
                  // pageSizeOptions={[15, 20, 25]}
                  // pageSize={pageSize}
                  // page={page}
                  // pagination
                  // onPaginationModelChange={(newModel) => {
                  //   setPage(newModel.page || 0);
                  //   setPageSize(newModel.pageSize || 15);
                  // }}
                  paginationModel={paginationModel}

                  pageSizeOptions={[5, 10, 15]}
                  onPaginationModelChange={setPaginationModel}
                  // initialState={{
                  //   pagination: {
                  //     paginationModel: {
                  //       pageSize: 15,
                  //       page: 0,
                  //     },
                  //   },
                  // }}
                  onRowClick={onPropertyClick}
                  rowSelectionModel={[propertyIndex]}
                  getRowSpacing={getRowSpacing}
                  hideHeader={true} // This hides the headers
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
                      backgroundColor: "#ffffff !important",
                    },
                    [`& .${gridClasses.row}`]: {
                      bgcolor: (row) => (row.id === propertyIndex ? "#ffffff" : theme.palette.form.main), // White for selected row
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
                    "& .MuiDataGrid-columnHeaders": {
                      display: "none", // This ensures headers are hidden
                    },
                  }}
                />
              </Box>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
