import React, { useEffect, useState } from "react";
import theme from "../../theme/theme";
import { useNavigate } from "react-router-dom";
import { ThemeProvider, Box, Paper, Stack, Typography, Button, Menu, MenuItem, IconButton, InputBase, Card, CardContent, CardActions, Rating, Grid } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { ArrowDropDown, LocationOn, TurnedInNot } from "@mui/icons-material";
import ReactImageGallery from "react-image-gallery";
import { useUser } from "../../contexts/UserContext";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import defaultPropertyImage from "./paintedLadies.jpeg";
import PropertiesMap from "../Maps/PropertiesMap";
import APIConfig from "../../utils/APIConfig";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../utils/httpMiddleware";

const SearchBar = ({ propertyList, setFilteredItems, ...props }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchTerm(query);
    if (query.trim() === "") {
      setFilteredItems(propertyList); // Reset to the original list if the search bar is cleared
    } else {
      const terms = query.split(" ").map((term) => term.toLowerCase()); // Split the search term into individual terms
      const filtered = propertyList.filter((item) => terms.some((term) => item.property_address.toLowerCase().includes(term)));
      setFilteredItems(filtered); // Updating the state with filtered items
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setFilteredItems(propertyList);
  };

  return (
    <Box
      sx={{
        p: "2px 4px",
        alignItems: "center",
        backgroundColor: theme.palette.form.main,
        display: "flex",
      }}
    >
      <IconButton type='submit' sx={{ p: "10px" }} aria-label='search'>
        <SearchIcon />
      </IconButton>
      <InputBase
        sx={{ ml: 1, zIndex: 1000, flexGrow: 1 }}
        placeholder='Search...'
        inputProps={{ "aria-label": "search" }}
        value={searchTerm}
        onChange={handleSearchChange}
        color={theme.typography.common.blue}
      />
      {searchTerm && (
        <IconButton aria-label='clear' onClick={clearSearch}>
          <CloseIcon />
        </IconButton>
      )}
    </Box>
  );
};

const FilterButtons = ({ propertyList, filteredItems, setFilteredItems, ...props }) => {
  const [menuStates, setMenuStates] = useState({
    price: null,
    type: null,
    beds: null,
    bath: null,
  });
  const [param, setParam] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    price: "",
    type: "",
    beds: "",
    bath: "",
  });

  // useEffect(() => {
  //   //console.log(selectedFilters);
  // }, [selectedFilters]);

  const areAnyFiltersSet = Object.values(selectedFilters).some((value) => value !== "");

  const handleClick = (filterName, event) => {
    setMenuStates((prev) => ({ ...prev, [filterName]: event.currentTarget }));
  };

  const handleSelect = (filterName, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
    filterResults(filterName, value);
  };

  const sortPropertiesByRent = (propertyList, value) => {
    const sortedProperties = [...propertyList].sort((a, b) => {
      const rentA = Number(a.property_listed_rent);
      const rentB = Number(b.property_listed_rent);
      if (value === "Low-High") {
        return rentA - rentB;
      } else {
        //High-Low
        return rentB - rentA;
      }
    });
    return sortedProperties;
  };

  const filterResults = (filterName, value) => {
    let filtered = [...filteredItems];

    if (filterName === "price") {
      filtered = sortPropertiesByRent(filtered, value);
    }

    if (filterName === "type") {
      filtered = filtered.filter((item) => item.property_type === value);
    }

    if (filterName === "beds") {
      filtered = filtered.filter((item) => {
        if (value == "3+") {
          return item.property_num_beds >= 3;
        }
        return item.property_num_beds === parseInt(value);
      });
    }

    if (filterName === "bath") {
      filtered = filtered.filter((item) => {
        if (value == "3+") {
          return item.property_num_baths >= 3;
        }
        return item.property_num_baths === parseInt(value);
      });
    }
    setFilteredItems(filtered);
  };

  const clearFilters = (filterName) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterName]: "",
    }));
    setFilteredItems(propertyList);
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      price: "",
      type: "",
      beds: "",
      bath: "",
    });
    setFilteredItems(propertyList);
  };

  return (
    <>
      <Stack direction='row' justifyContent='space-between' alignItems='center' position='relative' sx={{ padding: "10px" }}>
        <Box>
          <Stack direction='column'>
            <Button
              variant='contained'
              sx={{
                color: theme.typography.secondary.white,
                fontWeight: theme.typography.common.fontWeight,
                backgroundColor: theme.palette.custom.blue,
                margin: "5px",
              }}
              onClick={(event) => handleClick("price", event)}
            >
              Price {selectedFilters.price}
              <ArrowDropDown />
            </Button>
            <Menu anchorEl={menuStates.price} open={Boolean(menuStates.price)} onClose={() => setMenuStates((prev) => ({ ...prev, price: null }))}>
              <MenuItem onClick={() => handleSelect("price", "Low-High")}>Low-High</MenuItem>
              <MenuItem onClick={() => handleSelect("price", "High-Low")}>High-Low</MenuItem>
              {selectedFilters.price !== "" ? <MenuItem onClick={() => clearFilters("price")}>Clear</MenuItem> : null}
            </Menu>
          </Stack>
        </Box>
        <Box>
          <Stack direction='column'>
            <Button
              variant='contained'
              sx={{
                color: theme.typography.secondary.white,
                fontWeight: theme.typography.common.fontWeight,
                backgroundColor: theme.palette.custom.blue,
                margin: "5px",
              }}
              onClick={(event) => handleClick("type", event)}
            >
              Type {selectedFilters.type}
              <ArrowDropDown />
            </Button>
            <Menu anchorEl={menuStates.type} open={Boolean(menuStates.type)} onClose={() => setMenuStates((prev) => ({ ...prev, type: null }))}>
              <MenuItem onClick={() => handleSelect("type", "House")}>House</MenuItem>
              <MenuItem onClick={() => handleSelect("type", "Apartment")}>Apartment</MenuItem>
              <MenuItem onClick={() => handleSelect("type", "Condo")}>Condo</MenuItem>
              <MenuItem onClick={() => handleSelect("type", "Multi Family")}>Multi Family</MenuItem>
              <MenuItem onClick={() => handleSelect("type", "Single Family")}>Single Family</MenuItem>
              <MenuItem onClick={() => handleSelect("type", "Townhome")}>Townhome</MenuItem>
              {selectedFilters.type !== "" ? <MenuItem onClick={() => clearFilters("type")}>Clear</MenuItem> : null}
            </Menu>
          </Stack>
        </Box>
        <Box>
          <Stack direction='column'>
            <Button
              variant='contained'
              sx={{
                color: theme.typography.secondary.white,
                fontWeight: theme.typography.common.fontWeight,
                backgroundColor: theme.palette.custom.blue,
                margin: "5px",
              }}
              onClick={(event) => handleClick("beds", event)}
            >
              Beds {selectedFilters.beds}
              <ArrowDropDown />
            </Button>
            <Menu anchorEl={menuStates.beds} open={Boolean(menuStates.beds)} onClose={() => setMenuStates((prev) => ({ ...prev, beds: null }))}>
              <MenuItem onClick={() => handleSelect("beds", "1")}>1</MenuItem>
              <MenuItem onClick={() => handleSelect("beds", "2")}>2</MenuItem>
              <MenuItem onClick={() => handleSelect("beds", "3+")}>3+</MenuItem>
              {selectedFilters.beds !== "" ? <MenuItem onClick={() => clearFilters("beds")}>Clear</MenuItem> : null}
            </Menu>
          </Stack>
        </Box>
        <Box>
          <Stack direction='column'>
            <Button
              variant='contained'
              sx={{
                color: theme.typography.secondary.white,
                fontWeight: theme.typography.common.fontWeight,
                backgroundColor: theme.palette.custom.blue,
                margin: "5px",
              }}
              onClick={(event) => handleClick("bath", event)}
            >
              Bath {selectedFilters.bath}
              <ArrowDropDown />
            </Button>
            <Menu anchorEl={menuStates.bath} open={Boolean(menuStates.bath)} onClose={() => setMenuStates((prev) => ({ ...prev, bath: null }))}>
              <MenuItem onClick={() => handleSelect("bath", "1")}>1</MenuItem>
              <MenuItem onClick={() => handleSelect("bath", "2")}>2</MenuItem>
              <MenuItem onClick={() => handleSelect("bath", "3+")}>3+</MenuItem>
              {selectedFilters.bath !== "" ? <MenuItem onClick={() => clearFilters("bath")}>Clear</MenuItem> : null}
            </Menu>
          </Stack>
        </Box>
      </Stack>
      {areAnyFiltersSet ? (
        <Stack direction='row' justifyContent='space-between' alignItems='center' position='relative' display='flex' sx={{ padding: "10px" }}>
          <Button
            variant='contained'
            sx={{
              color: theme.typography.secondary.white,
              fontWeight: theme.typography.common.fontWeight,
              backgroundColor: theme.palette.custom.blue,
              margin: "5px",
            }}
            onClick={clearAllFilters}
          >
            Clear All Filters
          </Button>
        </Stack>
      ) : null}
    </>
  );
};

const PropertyListings = ({ setRightPane, isMobile, setViewRHS, setListingsData }) => {
  const [propertyData, setPropertyData] = useState([]);
  const [userLeases, setUserLeases] = useState([]);
  const [tenantLeaseDetails, setTenantLeaseDetails] = useState([]);
  const [sortedProperties, setSortedProperties] = useState([]);
  const [displayProperties, setDisplayProperties] = useState([]);
  const { getProfileId } = useUser();
  const profileId = getProfileId();
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    setShowSpinner(true);
    fetchData();
  }, []);

  async function fetchData() {
    // const propertyResponse = await fetch(`http://localhost:4000/listings/${getProfileId()}`);
    const propertyResponse = await fetch(`${APIConfig.baseURL.dev}/listings/${getProfileId()}`);
    const propertyData = await propertyResponse.json();
    setUserLeases(propertyData?.Tenant_Leases.result);
    setPropertyData(propertyData?.Available_Listings.result);
    setListingsData(propertyData?.Available_Listings.result);
    sortProperties(propertyData?.Tenant_Leases.result, propertyData?.Available_Listings.result);
    setShowSpinner(false);
  }

  function sortProperties(leaseData, propertyData) {
    // //console.log("Lease Data in PropertyListings.jsx: ", leaseData);
    // //console.log("Property Data in PropertyListings.jsx: ", propertyData);
    if (JSON.stringify(leaseData) !== "{}") {
      var activePropertyArray = [];
      const leases = leaseData;
      var sortedProperties = [...propertyData]; // Create a shallow copy to avoid mutating the original array
      leases.forEach((lease) => {
        const appliedPropertyIndex = sortedProperties.findIndex((property) => property.property_uid === lease.property_id);
        // //console.log("applied to property at index", appliedPropertyIndex, lease.lease_status)
        if (appliedPropertyIndex > -1) {
          const appliedProperty = sortedProperties.splice(appliedPropertyIndex, 1)[0];
          if (appliedProperty.lease_status === "ACTIVE" || appliedProperty.lease_status === "ACTIVE M2M") {
            activePropertyArray.push(appliedProperty);
          } else {
            sortedProperties.unshift(appliedProperty);
          }
        }
      });
      setSortedProperties([...activePropertyArray, ...sortedProperties]);
      setDisplayProperties([...activePropertyArray, ...sortedProperties]);
    } else {
      setSortedProperties(propertyData);
      setDisplayProperties(propertyData);
    }
  }

  const handleMarkerClick = (selectedProperty) => {
    setDisplayProperties([selectedProperty]);
  };

  const resetProperties = () => {
    setDisplayProperties(sortedProperties);
  };

  const handleBack = () => {
    if (isMobile) {
      setViewRHS(false)
    }
    setRightPane("");
  };


  return (
    <div>
      <ThemeProvider theme={theme}>
        <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
          <CircularProgress color='inherit' />
        </Backdrop>
        <Box
          style={{
            borderRadius: "10px",
            display: "flex",
            fontFamily: "Source Sans Pro",
            justifyContent: "center",
            width: "100%",
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            marginTop: theme.spacing(2),
            // padding: '5px',
          }}
        >
          <Paper
            sx={{
              // margin: "30px",
              padding: theme.spacing(2),
              backgroundColor: theme.palette.primary.main,
              height: "100%",
              width: "100%",
              // [theme.breakpoints.down("sm")]: {
              //   width: "80%",
              // },
              // [theme.breakpoints.up("sm")]: {
              //   width: "50%",
              // },
              // paddingTop: "10px",
            }}
          >
            <Grid Container sx={{ alignItems: "center", justifyContent: "center", display: "flex" }}>
              <Grid item xs={1} md={1}>
                <Button onClick={handleBack}>
                  <ArrowBackIcon
                    sx={{
                      color: "#160449",
                      fontSize: "30px",
                      margin: "5px",
                    }}
                  />
                </Button>
              </Grid>
              <Grid item xs={10} md={10}>
                <Typography
                  sx={{
                    color: theme.typography.primary.black,
                    fontWeight: theme.typography.primary.fontWeight,
                    fontSize: "18px",
                    textAlign: "center"
                  }}
                >
                  Search For Your New Home
                </Typography>
              </Grid>
              <Grid item xs={1} md={1} />

            </Grid>
            <Stack>
              <SearchBar propertyList={sortedProperties} setFilteredItems={setDisplayProperties} sx={{ width: "100%" }} />
            </Stack>
            <Stack>
              <FilterButtons propertyList={sortedProperties} filteredItems={displayProperties} setFilteredItems={setDisplayProperties} />
            </Stack>
            {/* <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ padding: "5px 15px" }}>
              <Box position='relative' left={0}>
                <Typography
                  sx={{
                    color: theme.typography.common.blue,
                    fontWeight: theme.typography.common.fontWeight,
                    ...(isMobile ? {} : { fontSize: theme.typography.largeFont, }),
                  }}
                >
                  Map
                  <LocationOn
                    sx={{
                      ...(isMobile ? {} : { fontSize: theme.typography.largeFont, }),
                    }}
                  />
                </Typography>
              </Box>
              <Box position='relative' right={0}>
                <Typography
                  sx={{
                    color: theme.typography.common.blue,
                    fontWeight: theme.typography.common.fontWeight,
                    ...(isMobile ? {} : { fontSize: theme.typography.largeFont, }),
                  }}
                >
                  Saved Search
                  <TurnedInNot
                    sx={{
                      ...(isMobile ? {} : { fontSize: theme.typography.largeFont, }),
                    }}
                  />
                </Typography>
              </Box>
            </Stack> */}
            <Stack alignItems='flex-start' sx={{ padding: "10px 15px" }}>
              <Typography
                sx={{
                  color: theme.typography.primary.black,
                  fontWeight: theme.typography.primary.fontWeight,
                  fontSize: "16px",
                }}
              >
                Apartments For Rent In San Jose CA
              </Typography>
              <Typography
                sx={{
                  color: theme.typography.primary.black,
                  fontSize: theme.typography.smallFont,
                }}
              >
                {displayProperties.length} Available
              </Typography>
            </Stack>
            <Stack sx={{ padding: 5 }}>
              <PropertiesMap properties={displayProperties} onMarkerClick={handleMarkerClick} />
            </Stack>
            {/* <Stack alignItems='center' justifyContent='center' sx={{ marginTop: "20px" }}>
              <Button
                variant='contained'
                sx={{
                  backgroundColor: theme.palette.custom.blue,
                  color: theme.typography.secondary.white,
                  marginTop: "10px",
                  textTransform: "none",
                }}
                onClick={resetProperties} // Reset properties to original list
              >
                Reset Listings
              </Button>
            </Stack> */}
            {displayProperties.length > 0 &&
              displayProperties.map((property, index) => {
                var status = "";
                let i = sortedProperties.findIndex((p) => p.property_uid === property.property_uid);
                const appliedData = userLeases
                  .filter((lease) => lease.lease_property_id === property.property_uid && lease.lease_uid !== null)
                  .sort((a, b) => {
                    const uidA = parseInt(a.lease_uid.split("-")[1]);
                    const uidB = parseInt(b.lease_uid.split("-")[1]);
                    return uidB - uidA;
                  })[0];

                if (appliedData) {
                  status = appliedData.lease_status;
                }
                return <PropertyCard data={property} key={i} status={status} leaseData={appliedData} setRightPane={setRightPane} appliedData={appliedData} />;
              })}
          </Paper>
        </Box>
      </ThemeProvider>
    </div>
  );
};

function PropertyCard({ data, status, leaseData, setRightPane, appliedData }) {
  //console.log("ROHIT - 510 - status - ", status);
  //console.log("ROHIT - 510 - appliedData - ", appliedData);
  const navigate = useNavigate();
  const [lease, setLease] = useState(leaseData || {});
  // //console.log("In PropertyCard: ", data);
  // //console.log("In PropertyCard: ", leaseData);
  const property = data;
  const propertyImages = property?.property_images && JSON.parse(property?.property_images).length > 0 ? JSON.parse(property?.property_images) : [defaultPropertyImage];
  // const ppt_images = propertyImages.split(",");

  function parseImageData(data) {
    if (data === undefined) {
      return;
    }
    const s = data.indexOf("http");
    const l = data.indexOf('"', s);
    const imageString = data.slice(s, l);
    return imageString;
  }

  const sortByFavImage = (favImage, imageList) => {
    if (!favImage || !imageList) return imageList;
    const sortedImages = [favImage, ...imageList.filter((img) => img !== favImage)];
    return sortedImages;
  };

  // const images = ppt_images.map((data) => {
  //   try {
  //     const url = parseImageData(data);
  //     if (url == "") {
  //       // return { original: defaultPropertyImage };
  //       return defaultPropertyImage
  //     }
  //     return { original: url };
  //   } catch (e) {
  //     console.error(e);
  //   }
  // });

  // //console.log("Images before sorting", propertyImages, property);
  const favImage = property?.property_favorite_image;
  const sortedByFavImgLst = sortByFavImage(favImage, propertyImages)

  const listed_rent = Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(property?.property_listed_rent);

  const handleDetailsButton = () => {
    setRightPane({
      type: "propertyInfo",
      state: {
        index: data.property_uid,
        data: property,
        status: status,
        lease: lease,
      },
    });
  };

  const handleTenantApplicationButton = () => {
    setRightPane({
      type: "tenantApplicationEdit",
      state: {
        index: data.property_uid,
        data: property,
        status: status,
        lease: lease,
        from: "PropertyInfo",
      },
    });
  };

  const handleTenantLeasesButton = () => {
    setRightPane({
      type: "tenantLeases",
      state: {
        property: property,
        lease: lease,
      },
    });
  };

  function formatAddress() {
    if (property?.property_unit !== "") {
      return property?.property_address + " Unit " + property?.property_unit;
    }
    return property?.property_address;
  }

  const new_label = (
    <Box
      sx={{
        backgroundColor: theme.typography.common.blue,
        color: theme.typography.secondary.white,
        boxShadow: "0 8px 8px 0 rgba(0, 0, 0, 0.4)",
        zIndex: 5,
        width: "fit-content",
        position: "relative",
        borderRadius: "8px",
        margin: "-20px 15px 5px",
        padding: "3px 5px",
        alignSelf: "flex-start",
        textTransform: "none",
        cursor: "pointer",
      }}
      onClick={handleTenantApplicationButton}
    >
      <Typography
        sx={{
          padding: "5px",
          fontSize: "18px",
          fontWeight: "800px",
        }}
      >
        Applied {lease.lease_application_date?.split(' ')[0]}
      </Typography>
    </Box>
  );
  const processing_label = (
    <Box
      sx={{
        backgroundColor: "#7AD15B",
        color: theme.typography.secondary.white,
        boxShadow: "0 8px 8px 0 rgba(0, 0, 0, 0.4)",
        zIndex: 5,
        width: "fit-content",
        position: "relative",
        borderRadius: "8px",
        margin: "-20px 15px 5px",
        padding: "3px 5px",
        alignSelf: "flex-start",
        textTransform: "none",
        cursor: "pointer",
      }}
      onClick={handleTenantLeasesButton}
    >
      <Typography
        sx={{
          padding: "5px",
          fontSize: "18px",
          fontWeight: "800px",
        }}
      >
        Approved {lease.lease_application_date?.split(' ')[0]}
      </Typography>
    </Box>
  );
  const rejected_label = (
    <Box
      sx={{
        backgroundColor: "#490404",
        color: theme.typography.secondary.white,
        boxShadow: "0 8px 8px 0 rgba(0, 0, 0, 0.4)",
        zIndex: 5,
        width: "fit-content",
        position: "relative",
        borderRadius: "8px",
        margin: "-20px 15px 5px",
        padding: "3px 5px",
        alignSelf: "flex-start",
        textTransform: "none",
      }}
      // onClick={() => console.log("Clicked Approved Button for Property", property, "with lease", lease, "and status", status)}
    >
      <Typography
        sx={{
          padding: "5px",
          fontSize: "18px",
          fontWeight: "800px",
        }}
      >
        Not Approved {lease.lease_application_date?.split(' ')[0]}
      </Typography>
    </Box>
  );
  const refused_label = (
    <Box
      sx={{
        backgroundColor: "#CB8E8E",
        color: theme.typography.secondary.white,
        boxShadow: "0 8px 8px 0 rgba(0, 0, 0, 0.4)",
        zIndex: 5,
        width: "fit-content",
        position: "relative",
        borderRadius: "8px",
        margin: "-20px 15px 5px",
        padding: "3px 5px",
        alignSelf: "flex-start",
        textTransform: "none",
      }}
      // onClick={() => console.log("Clicked Approved Button for Property", property, "with lease", lease, "and status", status)}
    >
      <Typography
        sx={{
          padding: "5px",
          fontSize: "18px",
          fontWeight: "800px",
        }}
      >
        Declined {lease.lease_application_date?.split(' ')[0]}
      </Typography>
    </Box>
  );

  const rescinded_label = (
    <Box
      sx={{
        backgroundColor: "#CB8E8E",
        color: theme.typography.secondary.white,
        boxShadow: "0 8px 8px 0 rgba(0, 0, 0, 0.4)",
        zIndex: 5,
        width: "fit-content",
        position: "relative",
        borderRadius: "8px",
        margin: "-20px 15px 5px",
        padding: "3px 5px",
        alignSelf: "flex-start",
        textTransform: "none",
      }}
      // onClick={() => console.log("Clicked Approved Button for Property", property, "with lease", lease, "and status", status)}
    >
      <Typography
        sx={{
          padding: "5px",
          fontSize: "18px",
          fontWeight: "800px",
        }}
      >
        Lease Rescinded {lease.lease_application_date?.split(' ')[0]}
      </Typography>
    </Box>
  );

  const withdrawn_label = (
    <Box
      sx={{
        backgroundColor: "#CB8E8E",
        color: theme.typography.secondary.white,
        boxShadow: "0 8px 8px 0 rgba(0, 0, 0, 0.4)",
        zIndex: 5,
        width: "fit-content",
        position: "relative",
        borderRadius: "8px",
        margin: "-20px 15px 5px",
        padding: "3px 5px",
        alignSelf: "flex-start",
        textTransform: "none",
      }}
      // onClick={() => console.log("Clicked Approved Button for Property", property, "with lease", lease, "and status", status)}
    >
      <Typography
        sx={{
          padding: "5px",
          fontSize: "18px",
          fontWeight: "800px",
        }}
      >
        Lease Withdrawn{lease.lease_application_date?.split(' ')[0]}
      </Typography>
    </Box>
  );

  const tenant_approved_label = (
    <Box
      sx={{
        backgroundColor: "#CB8E8E",
        color: theme.typography.secondary.white,
        boxShadow: "0 8px 8px 0 rgba(0, 0, 0, 0.4)",
        zIndex: 5,
        width: "fit-content",
        position: "relative",
        borderRadius: "8px",
        margin: "-20px 15px 5px",
        padding: "3px 5px",
        alignSelf: "flex-start",
        textTransform: "none",
      }}
      // onClick={() => console.log("Clicked Approved Button for Property", property, "with lease", lease, "and status", status)}
    >
      <Typography
        sx={{
          padding: "5px",
          fontSize: "18px",
          fontWeight: "800px",
        }}
      >
        Tenant Approved {lease.lease_application_date?.split(' ')[0]}
      </Typography>
    </Box>
  );
  const active_label = (
    <Box
      sx={{
        backgroundColor: "#412591",
        color: theme.typography.secondary.white,
        boxShadow: "0 8px 8px 0 rgba(0, 0, 0, 0.4)",
        zIndex: 5,
        width: "fit-content",
        position: "relative",
        borderRadius: "8px",
        margin: "-20px 15px 5px",
        padding: "3px 5px",
        alignSelf: "flex-start",
        textTransform: "none",
      }}
      // onClick={() => console.log("Clicked Approved Button for Property", property, "with lease", lease, "and status", status)}
    >
      <Typography
        sx={{
          padding: "5px",
          fontSize: "18px",
          fontWeight: "800px",
        }}
      >
        Active {lease.lease_application_date?.split(' ')[0]}
      </Typography>
    </Box>
  );

  let status_label = {
    NEW: new_label,
    ACTIVE: active_label,
    REFUSED: refused_label,
    RESCIND: rescinded_label,
    WITHDRAWN: withdrawn_label,
    REJECTED: rejected_label,
    "TENANT APPROVED": tenant_approved_label,
    PROCESSING: processing_label,
  };

  const imageStyle = {
    height: '400px', // Set the desired height
    objectFit: 'cover', // Ensures the image covers the container without stretching
  };

  return (
    <div>
      <Card sx={{ margin: 5 }}>
        <ReactImageGallery
          // items={images}
          items={sortedByFavImgLst}
          showFullscreenButton={false}
          showPlayButton={false}
          showThumbnails={false}
          renderItem={(item) => (
            <div style={{ height: '400px' }}>
              <img src={item} style={imageStyle} alt="" />
            </div>
          )}
        />

        <Stack direction='row' justifyContent='space-between'>
          <Box
            sx={{
              backgroundColor: "#8897BA",
              color: theme.typography.secondary.white,
              boxShadow: "0 8px 8px 0 rgba(0, 0, 0, 0.4)",
              zIndex: 5,
              width: "fit-content",
              position: "relative",
              borderRadius: "8px",
              margin: "-20px 15px 5px",
              padding: "3px 5px",
              alignSelf: "flex-start",
            }}
          >
            <Typography
              sx={{
                padding: "5px",
                fontSize: "18px",
              }}
            >
              {listed_rent}
              <span style={{ opacity: "60%" }}> / Month</span>
            </Typography>
          </Box>
          {status_label[status]}
        </Stack>
        <CardContent>
          <Stack
            direction='row'
            justifyContent={"space-between"}
            sx={{
              color: theme.typography.common.blue,
            }}
          >
            <Box>
              <Stack
                direction={"row"}
                sx={{
                  color: theme.palette.primary.lightYellow,
                }}
              >
                <Rating name='read-only' precision={0.5} value={5} />
                <Typography
                  sx={{
                    color: theme.typography.common.blue,
                  }}
                >
                  (2)
                </Typography>
              </Stack>
            </Box>
            {/* <Box>
              <LocationOn /> <TurnedInNot />
            </Box> */}
          </Stack>
          <Stack>
            <Typography
              sx={{
                color: theme.typography.common.blue,
                fontWeight: theme.typography.common.fontWeight,
                fontSize: "18px",
              }}
            >
              {formatAddress()}
            </Typography>
            <Typography
              sx={{
                color: theme.typography.primary.black,
                fontSize: "16px",
              }}
            >
              {property?.property_city + ", " + property?.property_state + " " + property?.property_zip}
            </Typography>
            <Stack justifyContent={"center"} alignItems={"center"} direction={"row"} sx={{ padding: "5px 10px" }}>
              <Stack justifyContent='center' alignItems='center' sx={{ margin: "5px 15px" }}>
                <Typography
                  sx={{
                    color: theme.typography.primary.black,
                    fontWeight: theme.typography.primary.fontWeight,
                    fontSize: "16px",
                  }}
                >
                  {property?.property_type}
                </Typography>
                <Typography
                  sx={{
                    color: theme.typography.primary.black,
                    fontSize: "16px",
                  }}
                >
                  Type
                </Typography>
              </Stack>
              <Stack justifyContent='center' alignItems='center' sx={{ margin: "5px 15px" }}>
                <Typography
                  sx={{
                    color: theme.typography.primary.black,
                    fontWeight: theme.typography.primary.fontWeight,
                    fontSize: "16px",
                  }}
                >
                  {property?.property_num_beds}
                </Typography>
                <Typography
                  sx={{
                    color: theme.typography.primary.black,
                    fontSize: "16px",
                  }}
                >
                  Bed
                </Typography>
              </Stack>
              <Stack justifyContent='center' alignItems='center' sx={{ margin: "5px 15px" }}>
                <Typography
                  sx={{
                    color: theme.typography.primary.black,
                    fontWeight: theme.typography.primary.fontWeight,
                    fontSize: "16px",
                  }}
                >
                  {property?.property_num_baths}
                </Typography>
                <Typography
                  sx={{
                    color: theme.typography.primary.black,
                    fontSize: "16px",
                  }}
                >
                  Bath
                </Typography>
              </Stack>
              <Stack justifyContent='center' alignItems='center' sx={{ margin: "5px 15px" }}>
                <Typography
                  sx={{
                    color: theme.typography.primary.black,
                    fontWeight: theme.typography.primary.fontWeight,
                    fontSize: "16px",
                  }}
                >
                  {property?.property_area}
                </Typography>
                <Typography
                  sx={{
                    color: theme.typography.primary.black,
                    fontSize: "16px",
                  }}
                >
                  Sq Ft
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
        <CardActions
          sx={{
            justifyContent: "center",
            flexWrap: { xs: "wrap", sm: "wrap", md: "nowrap" },
            display: "flex",
            width: "100%",
          }}
        >
          <Stack
            alignItems='center'
            justifyContent='space-evenly'
            direction='row'
            spacing={2}
            sx={{
              flexWrap: "wrap",
              rowGap: "10px",
            }}
          >
            <Button
              variant='text'
              sx={{
                border: "1px solid",
                color: theme.typography.common.blue,
                marginRight: "5px",
                textTransform: "none",
                whiteSpace: "nowrap",
              }}
            >
              Contact Property Manager
            </Button>
            <Button
              variant='contained'
              sx={{
                backgroundColor: "#97A7CF",
                color: theme.typography.secondary.white,
                marginLeft: "5px",
                textTransform: "none",
                whiteSpace: "nowrap",
              }}
              onClick={handleDetailsButton}
            >
              View Details
            </Button>
            {status === "NEW" ? (
              <Button
                variant='contained'
                sx={{
                  backgroundColor: theme.typography.common.blue,
                  color: theme.typography.secondary.white,
                  marginLeft: "5px",
                  textTransform: "none",
                  whiteSpace: "nowrap",
                }}
                // onClick={() => navigate("/tenantApplication", { state: { property: property, status: status, lease: lease } })}
                onClick={handleTenantApplicationButton}
              >
                View Application
              </Button>
            ) : null}
            {status === "PROCESSING" ? (
              <Button
                variant='contained'
                sx={{
                  backgroundColor: "#7AD15B",
                  color: theme.typography.secondary.white,
                  marginLeft: "5px",
                  textTransform: "none",
                  whiteSpace: "nowrap",
                }}
                // onClick={() => navigate("/tenantLeases", { state: { property: property, status: status, lease: lease } })}
                onClick={handleTenantLeasesButton}
              >
                View Lease
              </Button>
            ) : null}
          </Stack>
        </CardActions>
      </Card>
    </div>
  );
}

export { PropertyListings, PropertyCard };
