import { useLocation, useNavigate } from "react-router";
import { useEffect, useState, useContext } from "react";
// import axios from "axios";
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../../utils/httpMiddleware";
// import { useUser } from "../../../contexts/UserContext";
// import Backdrop from "@mui/material/Backdrop";
import { ThemeProvider, Box, Stack, Typography, Button, Grid, Container } from "@mui/material";
import theme from "../../../theme/theme";
import CircularProgress from "@mui/material/CircularProgress";

import PropertyCard from "./PropertyCard";
import ManagementContractContext from "../../../contexts/ManagementContractContext";
import useMediaQuery from "@mui/material/useMediaQuery";

function ManagementContractDetails(props) {
  // console.log("In ManagementContractDetails.jsx - props - ", props);
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  // const propertiesContext = useContext(PropertiesContext);

  const {
    currentContractUID,
    currentContractPropertyUID,
    contractRequests: contractRequestsFromContext,
    allContracts: allContractsFromContext,
  } = useContext(ManagementContractContext);
  const [contractRequests, setContractRequests] = useState([]);

  useEffect(() => {
    if (props.page && props.page === "properties") {
      setContractRequests(allContractsFromContext);
    } else {
      setContractRequests(contractRequestsFromContext);
    }
  }, [props.page, contractRequestsFromContext, allContractsFromContext]);

  useEffect(() => {
    // console.log("ROHIT - contractRequests - ", contractRequests);
  }, [contractRequests]);

  const [isLoading, setIsLoading] = useState(true);
  const [filteredPropertiesData, setFilteredPropertiesData] = useState([]); // filter out the properties that aren't included in announcement_properties

  const [index, setIndex] = useState(0);

  // const property_endpoint_resp = contractRequests;

  console.log("ManagementContractDetails - currentContractUID - ", currentContractUID);

  console.log("ManagementContractDetails - currentContractPropertyID - ", currentContractPropertyUID);

  useEffect(() => {
    console.log("ManagementContractDetails - currentContractPropertyUID changed - ", currentContractPropertyUID);
    fetchData();
  }, [currentContractUID, currentContractPropertyUID, contractRequests]);

  // const [timeDiff, setTimeDiff] = useState(null);

  const fetchData = async () => {
    const properties = contractRequests ? contractRequests : [];
    // console.log("PROPERTIES", properties);
    // setPropertiesData(properties);

    const filteredProperties = properties.filter((property) => property.property_uid === currentContractPropertyUID);
    // console.log("FILTERED PROPERTIES - contractPropertyID - ", contractPropertyID);
    // console.log("FILTERED PROPERTIES", filteredProperties);
    setFilteredPropertiesData(filteredProperties);

    // console.log("FILTERED PROPERTIES DATA", filteredProperties);

    setIsLoading(false);
  };

  const calculateTimeDiff = () => {
    const announcement_date = new Date();
    if (announcement_date === null) {
      return "<TIME AGO>";
    }
    const now = new Date();
    const timeDiff = now - announcement_date;

    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    let durationString;
    if (days > 0) {
      durationString = `${days} days ago`;
    } else if (hours > 0) {
      durationString = `${hours} hours ago`;
    } else if (minutes > 0) {
      durationString = `${minutes} minutes ago`;
    } else {
      durationString = `${seconds} seconds ago`;
    }

    // console.log(now, announcement_date, announcementData["announcement_date"], durationString, seconds, minutes, hours, days);
    return durationString;
  };

  useEffect(() => {
    // console.log("Management Contract Details UseEffect in ManagementContractDetails");
    // console.log("New PM Requests in MCD: ", property_endpoint_resp);
    fetchData();
  }, []);

  const handleBackBtn = () => {
    if (isMobile && props.setViewRHS) {
      props.setViewRHS(false);
    } else {
      if (props.page && props.page === "properties" && props.handleBackClick) {
        props.handleBackClick();
      } else {
        navigate(-1);
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          backgroundColor: "#F2F2F2",
          // borderRadius: "10px",
          // marginTop: "15px",
          padding: "15px",
          // height: '100%',
          // width: "100%",
          overflowX: "hidden",
          fontFamily: "Source Sans Pro",
        }}
      >
        <Stack
          flexDirection='row'
          justifyContent='flex-start'
          alignItems='center'
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button sx={{ padding: "0", minWidth: "150px" }} onClick={handleBackBtn}>
            <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path
                d='M4 8L2.58579 9.41421L1.17157 8L2.58579 6.58579L4 8ZM9 21C7.89543 21 7 20.1046 7 19C7 17.8954 7.89543 17 9 17L9 21ZM7.58579 14.4142L2.58579 9.41421L5.41421 6.58579L10.4142 11.5858L7.58579 14.4142ZM2.58579 6.58579L7.58579 1.58579L10.4142 4.41421L5.41421 9.41421L2.58579 6.58579ZM4 6L14.5 6L14.5 10L4 10L4 6ZM14.5 21L9 21L9 17L14.5 17L14.5 21ZM22 13.5C22 17.6421 18.6421 21 14.5 21L14.5 17C16.433 17 18 15.433 18 13.5L22 13.5ZM14.5 6C18.6421 6 22 9.35786 22 13.5L18 13.5C18 11.567 16.433 10 14.5 10L14.5 6Z'
                fill='#3D5CAC'
              />
            </svg>
          </Button>
          <Box
            sx={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "text.darkblue",
              padding: "0",
              minWidth: "300px",
            }}
          >
            Management Contract MCD
          </Box>
        </Stack>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Typography
            sx={{
              fontWeight: theme.typography.primary.fontWeight,
            }}
          >
            Contract UID: {currentContractUID}
          </Typography>
        </Box>
        <PropertyCard data={filteredPropertiesData[index] ? filteredPropertiesData[index] : []} navigatingFrom={props.navigatingFrom} handleBackBtn={handleBackBtn} fetchContracts={props.fetchContracts}/>
      </Box>
      {/* <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
          <CircularProgress color='inherit' />
        </Backdrop> */}
      {/* <Stack sx={{ height: "100%", width: "100%" }}>
        <Grid container item xs={12} sx={{ height: "100%" }}>
          <Box
            sx={{
              backgroundColor: "#F2F2F2",
              borderRadius: "10px",
              // marginTop: "15px",
              padding: "15px",
              // height: '100%',
              width: "100%",
              fontFamily: "Source Sans Pro",
            }}
          >
            
            <Stack
              flexDirection='row'
              justifyContent='flex-start'
              alignItems='center'
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Button sx={{ padding: "0", minWidth: "150px" }} onClick={handleBackBtn}>
                <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M4 8L2.58579 9.41421L1.17157 8L2.58579 6.58579L4 8ZM9 21C7.89543 21 7 20.1046 7 19C7 17.8954 7.89543 17 9 17L9 21ZM7.58579 14.4142L2.58579 9.41421L5.41421 6.58579L10.4142 11.5858L7.58579 14.4142ZM2.58579 6.58579L7.58579 1.58579L10.4142 4.41421L5.41421 9.41421L2.58579 6.58579ZM4 6L14.5 6L14.5 10L4 10L4 6ZM14.5 21L9 21L9 17L14.5 17L14.5 21ZM22 13.5C22 17.6421 18.6421 21 14.5 21L14.5 17C16.433 17 18 15.433 18 13.5L22 13.5ZM14.5 6C18.6421 6 22 9.35786 22 13.5L18 13.5C18 11.567 16.433 10 14.5 10L14.5 6Z'
                    fill='#3D5CAC'
                  />
                </svg>
              </Button>
              <Box
                sx={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "text.darkblue",
                  padding: "0",
                  minWidth: "300px",
                }}
              >
                Management Contract MCD
              </Box>
            </Stack>

            
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{
                  fontWeight: theme.typography.primary.fontWeight,
                }}
              >
                Contract UID: {currentContractUID}
                
              </Typography>
            </Box>
            <PropertyCard data={filteredPropertiesData[index] ? filteredPropertiesData[index] : []} navigatingFrom={props.navigatingFrom} handleBackBtn={handleBackBtn} />
          </Box>
        </Grid>
      </Stack> */}
    </ThemeProvider>
  );
}

export default ManagementContractDetails;
