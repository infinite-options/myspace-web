import { useLocation, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@mui/system";
import { useState, useEffect } from "react";
import ReturnArrow from "../../images/refund_back.png";
import theme from "../../theme/theme";
// import axios from "axios";
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../utils/httpMiddleware";
import { Typography, Box, Avatar, Grid, Button } from "@mui/material";
import { ReactComponent as SearchIcon } from "../../images/search.svg";
import EmailIcon from "./messageIconDark.png";
import PhoneIcon from "./phoneIconDark.png";
import AddressIcon from "./addressIconDark.png";
import MapIcon from "./mapIcon.png";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import documentIcon from "../../images/Subtract.png";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import APIConfig from "../../utils/APIConfig";
import { useUser } from "../../contexts/UserContext";

const ManagerDetails = ({managerDetailsState, handleBackClick, handleShowSearchManager, setReturnIndexByProperty}) => {
  const navigate = useNavigate();
  const location = useLocation();  
  const { ownerId, managerBusinessId, managerData, propertyData, index, isDesktop } = managerDetailsState;
  const { user, selectedRole } = useUser();

  // //console.log("ownerId", ownerId);
  // //console.log("managerBusinessId", managerBusinessId);
  // //console.log("managerData", managerData);
  //console.log("propertyData", propertyData);
  // //console.log("index", index);

  propertyData?.sort((a, b) => {
    if (a.address < b.address) {
      return -1;
    }
    if (a.address > b.address) {
      return 1;
    }
    return 0;
  });

  if (managerData !== undefined) {
    let businessLocations = JSON.parse(managerData.business_locations !== undefined ? managerData.business_locations : "");
    if(businessLocations){
      let city = businessLocations[0] !== undefined ? businessLocations[0].location : "";
      let distance = businessLocations[0] !== undefined ? businessLocations[0].distance : "";
      let feesArray = JSON.parse(managerData.business_services_fees);
    }
  } else {
    let business_locations = "";
    let city = "";
    let distance = "";
    let feesArray = [];
  }

  const [showSpinner, setShowSpinner] = useState(false);
  const [properties, setProperties] = useState([
    {
      business_name: "",
      business_address: "",
      business_city: "",
      business_state: "",
      business_zip: "",
      business_photo_url: "",
      business_phone_number: "",
      business_email: "",
    },
  ]);


  function sortProperties(properties) {
    properties?.sort((a, b) => {
      if (a.property_address < b.property_address) {
        return -1;
      }
      if (a.property_address > b.property_address) {
        return 1;
      }
      return 0;
    });
  }

  const fetchManagerProperties = async () => {
    setShowSpinner(true);
    const url = `${APIConfig.baseURL.dev}/properties/${managerBusinessId}`;
    const response = await axios.get(url);
    //console.log("Properties endpoint results: ", response);
    sortProperties(response.data.Property.result);
    setProperties(response.data.Property.result);
    setShowSpinner(false);
  };

  const getManagerProperties = async () => {
    // setShowSpinner(true);    
    const managedProperties = propertyData?.filter( property => property.contract_business_id === managerBusinessId);
    // //console.log("managedProperties - ", managedProperties);
    setProperties(managedProperties);
    setShowSpinner(false);
  };
  useEffect(() => {    
    getManagerProperties();
  }, []);

  useEffect(() => {    
    getManagerProperties();
  }, [index]);

  function handleCancel(obj) {
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Credentials": "*",
    };

    try {
      const formData = new FormData();
      formData.append("contract_uid", obj.contract_uid);
      formData.append("contract_status", "INACTIVE");

      //console.log(formData.contract_uid);
      //console.log(formData.contract_status);

      const response = axios.put(`${APIConfig.baseURL.dev}/contracts`, formData, headers);
      //console.log("PUT result", response);
      if (response.code === 200) {
        return true;
      }
    } catch (error) {
      //console.log("error", error);
      return false;
    }

    setCancelContractDialogOpen(false);
  }

  const [cancelContractDialogOpen, setCancelContractDialogOpen] = useState(false);

  const openCancelContractDialog = () => {
    setCancelContractDialogOpen(true);
  };

  const closeCancelContractDialog = () => {
    setCancelContractDialogOpen(false);
  };

  const navigateToPrev = () => {
    if(isDesktop === true){
      handleBackClick();
    }else{
      navigate(-1);
    }
  }

  if(managerBusinessId == null ){
    return (
      <ThemeProvider theme={theme}>
        <Box
        sx={{
          fontFamily: "Source Sans Pro",
          color: "text.darkblue",
          padding: "15px",
          paddingLeft: "0px",
          paddingRight: "30px",
          backgroundColor: "background.gray",
          borderRadius: "10px",
          height: '100%',
        }}
      >
        <Box
          sx={{
            padding: "18px",
            backgroundColor: "#F2F2F2",
            borderRadius: "9px",
            height: '95%',
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              color: "text.darkblue",
            }}
          >
            <Typography sx={{ flex: 1, textAlign: "center", paddingLeft: "22px", fontSize: "25px", fontWeight: 700 }}>{"No Manager"}</Typography>
            
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "text.blue",
              fontWeight: "bold",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
              onClick={navigateToPrev}
            >
              <img src={ReturnArrow} style={{ verticalAlign: "middle", paddingRight: "5px" }} alt="back" />
              <Box>
                <Typography
                  sx={{
                    color: theme.typography.common.blue,
                    fontWeight: theme.typography.primary.fontWeight,
                    cursor: "pointer",
                  }}
                >
                  {"Return to Property"}
                </Typography>
              </Box>
            </Box>
          </Box>          
        </Box>
      </Box>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Box
        sx={{
          fontFamily: "Source Sans Pro",
          color: "text.darkblue",
          padding: "15px",
          paddingLeft: "0px",
          paddingRight: "30px",
          backgroundColor: "background.gray",
          borderRadius: "10px",
          height: '100%',
        }}
      >
        <Box
          sx={{
            padding: "18px",
            backgroundColor: "#F2F2F2",
            borderRadius: "10px",
            height: '95%',
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              color: "text.darkblue",
            }}
          >
            <Typography sx={{ flex: 1, textAlign: "center", paddingLeft: "22px", fontSize: "25px", fontWeight: 700 }}>{"Property Manager"}</Typography>
            {selectedRole !== "MANAGER" ? <SearchIcon onClick={handleShowSearchManager} /> : null}
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "text.blue",
              fontWeight: "bold",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
              onClick={navigateToPrev}
            >
              <img src={ReturnArrow} style={{ verticalAlign: "middle", paddingRight: "5px" }} alt="back" />
              <Box>
                <Typography
                  sx={{
                    color: theme.typography.common.blue,
                    fontWeight: theme.typography.primary.fontWeight,
                    cursor: "pointer",
                  }}
                >
                  {"Return to Property"}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              position: "relative",
              backgroundColor: "#FFFFFF",
              borderRadius: "10px",
              top: "10px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                padding: "13px",
                backgroundColor: "#3D5CAC",
                flex: 1,
                position: "relative",
                borderRadius: "10px 10px 0 0",
              }}
            >
              <Typography
                align="center"
                sx={{
                  fontSize: "15px",
                  fontFamily: "Source Sans 3, sans-serif",
                  margin: "0 18px",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  marginTop: "30px",
                  marginBottom: "30px",
                }}
              >
                {managerData && managerData.business_name}
              </Typography>
              <Avatar
                src={managerData?.business_photo_url}
                sx={{
                  width: "60px",
                  height: "60px",
                  position: "absolute",
                  bottom: "-30px",
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              />
            </Box>
            <Box
              sx={{
                backgroundColor: "#D6D5DA",
                flex: 3,
                border: "0 0 10px 10px",
                paddingTop: "35px",
                paddingBottom: "35px",
                borderRadius: "0 0 10px 10px ",
              }}
            >
              <Grid container>
                <Grid item xs={1}>
                  <img src={EmailIcon} alt="email" />
                </Grid>
                <Grid item xs={7}>
                  <Typography
                    sx={{
                      fontSize: 18,
                      paddingLeft: "10px",
                      fontFamily: "Source Sans Pro, sans-serif",
                      color: "#160449",
                    }}
                  >
                    {managerData?.business_email}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography
                    sx={{
                      fontSize: 15,
                      fontFamily: "Source Sans Pro, sans-serif",
                      fontWeight: 800,
                      color: "#160449",
                    }}
                  >
                    {"Manager since:"}
                  </Typography>
                </Grid>
                <Grid item xs={1}>
                  <img src={PhoneIcon} alt="phone" />
                </Grid>
                <Grid item xs={7}>
                  <Typography
                    sx={{
                      fontSize: 18,
                      paddingLeft: "10px",
                      fontFamily: "Source Sans Pro, sans-serif",
                      color: "#160449",
                    }}
                  >
                    {managerData?.business_phone_number}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography
                    sx={{
                      fontSize: 18,
                      paddingLeft: "10px",
                      fontFamily: "Source Sans Pro, sans-serif",
                      color: "#160449",
                    }}
                  >
                    {`${propertyData[index].contract_start_date}`}
                  </Typography>
                </Grid>
                <Grid item xs={1}>
                  <img src={AddressIcon} alt="address" />
                </Grid>
                <Grid item xs={11}>
                  <Typography
                    sx={{
                      fontSize: 18,
                      paddingLeft: "10px",
                      fontFamily: "Source Sans Pro, sans-serif",
                      color: "#160449",
                    }}
                  >
                    {`${managerData?.business_address}, ${managerData?.business_city}, ${managerData?.business_state} ${managerData?.business_zip}`}
                  </Typography>
                </Grid>
              </Grid>

              <Typography
                sx={{
                  paddingLeft: "10px",
                  fontFamily: "Source Sans Pro, sans-serif",
                  fontWeight: 800,
                  color: "#160449",
                  marginTop: '10px',
                }}
              >
                {/* {`Manages ${properties.length} of your properties`} */}

                {`Manages ${propertyData.filter((property) => property.business_uid === managerData.business_uid).length} of your properties`}
              </Typography>
              {properties
                .filter((property) => property.business_uid === managerData.business_uid)
                .map((p, i) => {
                  let index = properties.findIndex((property) => property.property_uid === p.property_uid);
                  let navIndex = propertyData.findIndex((property) => property.property_uid === p.property_uid);
                  // //console.log(p)
                  let docList = JSON.parse(p.contract_documents);
        
                  // //console.log(docList, typeof(docList))
                  const doc = docList && docList.find((document) => document.type === "contract");
                  const contractDocumentLink = doc ? doc.link : "";
                  return (
                    <>
                      <Grid container direction="row" key={i}>
                        <Grid item xs={8}>
                          <Box display="flex" alignItems="left">
                            <Typography
                              sx={{
                                paddingLeft: "15px",
                                fontFamily: "Source Sans Pro, sans-serif",
                                fontWeight: 600,
                                color: "#160449",
                                textDecoration: "underline",
                                cursor: "pointer", 
                              }}
                              onClick={() => setReturnIndexByProperty(p.property_uid)}
                            >
                              {`${p.property_address}, ${p.property_unit && p.property_unit + ", "} ${p.property_city}, ${p.property_state} ${p.property_zip}`}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={2}>
                          <Box display="flex" alignItems="right">
                            <Typography
                              sx={{
                                fontWeight: 800,
                                paddingLeft: "10px",
                                fontFamily: "Source Sans Pro, sans-serif",
                                color: "#160449",
                              }}
                            >
                              {p.contract_status === "NEW" ? "New" : p.contract_status === "ACTIVE" ? "Active" : "Inactive"}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={2}>
                          <Box display="flex" alignItems="right" alignContent="right">
                            {contractDocumentLink !== "" ? (
                              <Box
                                onClick={() => {
                                  window.open(contractDocumentLink, "_blank");
                                  // //console.log("we should show a document here")
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontWeight: 800,
                                    paddingLeft: "10px",
                                    fontFamily: "Source Sans Pro, sans-serif",
                                    color: "#160449",
                                    cursor: "pointer",
                                  }}
                                >
                                  <img src={documentIcon} alt="document-icon" style={{ width: "15px", height: "17px", margin: "0px", paddingLeft: "15px" }} />
                                </Typography>
                              </Box>
                            ) : null}
                          </Box>
                        </Grid>
                      </Grid>
                    </>
                  );
                })}             
              {managerData.contract_status === "ACTIVE" && selectedRole !== "MANAGER" ? (
                <>
                  <Button
                    sx={{
                      paddingLeft: "15px",
                      fontFamily: "Source Sans Pro, sans-serif",
                      fontWeight: 800,
                      backgroundColor: "#160449",
                      marginTop: '10px',
                      marginLeft: '10px',
                    }}
                    onClick={openCancelContractDialog}
                  >
                    Cancel Contract
                  </Button>
                  <Dialog open={cancelContractDialogOpen} onClose={closeCancelContractDialog} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                    <DialogTitle id="alert-dialog-title">Confirm Cancellation</DialogTitle>
                    <DialogContent>
                      <DialogContentText id="alert-dialog-description">Are you sure you want to cancel the contract?</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={closeCancelContractDialog} color="primary">
                        No
                      </Button>
                      <Button onClick={() => handleCancel(managerData)} color="primary" autoFocus>
                        Yes
                      </Button>
                    </DialogActions>
                  </Dialog>
                </>
              ) : null}
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default ManagerDetails;
