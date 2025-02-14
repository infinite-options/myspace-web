import { ThemeProvider, Typography, Box, Tabs, Tab, Card, CardHeader, Slider, Stack, Button, Grid, Container, Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	DialogContentText } from "@mui/material";
// import documentIcon from "../../images/Subtract.png";
import Bell_fill from "../../images/Bell_fill.png";
import { useEffect, useState, useContext, } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import theme from "../../theme/theme";
// import refundIcon from "./refundIcon.png";
// import SearchIcon from "@mui/icons-material/Search";
// import axios from "axios";
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../utils/httpMiddleware";
// import { CustomTabPanel } from "../Maintenance/MaintenanceRequestDetail";
// import { useUser } from "../../contexts/UserContext";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import useMediaQuery from "@mui/material/useMediaQuery";
// import APIConfig from "../../utils/APIConfig";
import ManagementContractDetails from "../Contracts/OwnerManagerContracts/ManagementContractDetails";
import { ManagementContractProvider } from "../../contexts/ManagementContractContext";
import ManagementContractContext from "../../contexts/ManagementContractContext";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";



export default function PMQuotesList() {
  // let navigate = useNavigate();  
  const location = useLocation();
  const { contractRequests, updateContractUID, updateContractPropertyUID, dataLoaded} = useContext(ManagementContractContext); 
  const navigatingFrom = location.state?.navigatingFrom || null;
  // //console.log("In PMQuoteList");
  // //console.log("In PMQuoteList property_endpoint_resp: ", location.state?.property_endpoint_resp);
  // //console.log("contractRequests from context - ", contractRequests)

  const [showSpinner, setShowSpinner] = useState(dataLoaded);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [viewRHS, setViewRHS] = useState(false)

  useEffect(() => {
    setShowSpinner(!dataLoaded);
  }, [dataLoaded]);

  useEffect(() => {
    // //console.log("PMQuotesList - location.state - ",location.state);
    if (location.state?.selectedContractUID && location.state?.selectedContractPropertyUID) {
      updateContractUID(location.state.selectedContractUID);
      updateContractPropertyUID(location.state.selectedContractPropertyUID);
    } else if( contractRequests && contractRequests?.length > 0){
      updateContractUID(contractRequests[0]?.contract_uid);
      updateContractPropertyUID(contractRequests[0]?.contract_property_id);
    }
  // }, [location.state, updateContractUID, updateContractPropertyUID]);
  }, []);

  useEffect(() => {
    if (location.state?.selectedContractUID && location.state?.selectedContractPropertyUID) {
      updateContractUID(location.state.selectedContractUID);
      updateContractPropertyUID(location.state.selectedContractPropertyUID);
    } else if( contractRequests && contractRequests?.length > 0){
      updateContractUID(contractRequests[0]?.contract_uid);
      updateContractPropertyUID(contractRequests[0]?.contract_property_id);
    }    
  }, [contractRequests]);
  

  return (    
      <ThemeProvider theme={theme}>
        <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
          <CircularProgress color='inherit' />
        </Backdrop>
        <Container maxWidth='lg' sx={{ paddingTop: "10px", paddingBottom: "20px", marginTop: theme.spacing(2) }}>
          <Grid container spacing={4}
            rowGap={1}
            sx={{
              alignItems: "stretch", 
            }}
          >
            {(!isMobile || !viewRHS) && (<Grid item xs={12} md={4}>
              <QuotesList setViewRHS={setViewRHS}/>
            </Grid>)}

            {((!isMobile || viewRHS)) && (<Grid item xs={12} md={8}>
              <ManagementContractDetails navigatingFrom={navigatingFrom} setViewRHS={setViewRHS}/>
            </Grid>)}
          </Grid>
        </Container>
      </ThemeProvider>    
  );
}

//LHS
const QuotesList = (props) => {  
  const { contractRequests } = useContext(ManagementContractContext); 
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  let navigate = useNavigate(); 

  const [sortedContracts, setSortedContracts] = useState([]);
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    let sorted = [...contractRequests];

    if (sortField === "owner") {
      sorted.sort((a, b) => {
        const ownerA = a.owner_first_name.toLowerCase() + a.owner_last_name.toLowerCase();
        const ownerB = b.owner_first_name.toLowerCase() + b.owner_last_name.toLowerCase();
        return sortOrder === "asc" ? ownerA.localeCompare(ownerB) : ownerB.localeCompare(ownerA);
      });
    } else if (sortField === "address") {
      sorted.sort((a, b) => {
        const addressA = a.property_address.toLowerCase();
        const addressB = b.property_address.toLowerCase();
        return sortOrder === "asc" ? addressA.localeCompare(addressB) : addressB.localeCompare(addressA);
      });
    } else if (sortField === "status") {
      sorted.sort((a, b) => {
        const statusA = a.contract_status.toLowerCase();
        const statusB = b.contract_status.toLowerCase();
        return sortOrder === "asc" ? statusA.localeCompare(statusB) : statusB.localeCompare(statusA);
      });
    }

    setSortedContracts(sorted);
  }, [contractRequests, sortField, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };

  
  return (
    <>
      <ThemeProvider theme={theme}>
        <Grid container item xs={12} sx={{ backgroundColor: "#F2F2F2", padding: "10px", borderRadius: "10px", height: "100%"}}>
          {/* sort button */}
          <Stack
              sx={{
                // backgroundColor: "#fff",
                width: "100%", // Occupy full width with 25px margins on each side
                maxWidth: "800px", // You can set a maxWidth if needed
                textAlign: "center", // Center align text
              }}
              spacing={2}
              p={2}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: "15px"}}>
                {isMobile && (<Box position={"absolute"} left={0}>
                    <Button onClick={() => {navigate(-1)}}>
                        <ArrowBackIcon
                            sx={{
                                color: "#160449",
                                fontSize: "20px",
                                margin: "5px",
                                paddingRight: "10px"
                            }}
                        />
                    </Button>
                </Box>)}
                <Typography
                  sx={{
                    color: "#160449",
                    fontWeight: theme.typography.primary.fontWeight,
                    fontSize: theme.typography.largeFont,
                  }}
                >
                  All Property Management Requests
                </Typography>
              </Box>
              <Stack direction="row" justifyContent="space-between" sx={{ padding: "0px 10px" }}>
            <Button
              variant="contained"
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
              onClick={() => {
                setSortField("owner");
                toggleSortOrder();
              }}
            >
              Owner
            </Button>
            <Button
              variant="contained"
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
              onClick={() => {
                setSortField("address");
                toggleSortOrder();
              }}
            >
              Address
            </Button>
            <Button
              variant="contained"
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
              onClick={() => {
                setSortField("status");
                toggleSortOrder();
              }}
            >
              Status
            </Button>
        </Stack>
          </Stack>
          <Stack
            direction='column'
            alignItems='center'
            justifyContent='flex-start'
            sx={{
              width: "100%", // Take up full screen width
              height: "100%", 
              overflowY: "auto",
              overflowX: "hidden",
              marginTop: "10px",              
              // marginTop: theme.spacing(2), // Set the margin to 20px
              "&::-webkit-scrollbar": {
                width: "6px",                
              },
              "&::-webkit-scrollbar-track": {
                background: "#f1f1f1", // track color
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#888", // thumb color
                borderRadius: "10px", 
              },
              "&::-webkit-scrollbar-thumb:hover": {
                backgroundColor: "#555",
              },
            }}
          >
            <Stack
              sx={{
                // backgroundColor: "#fff",
                width: "100%", // Occupy full width with 25px margins on each side
                maxWidth: "800px", // You can set a maxWidth if needed
                textAlign: "center", // Center align text
              }}
              spacing={2}
              p={2}
            >              
              <Stack
                  direction='column'
                  sx={{
                    width: "100%",
                    height: "100%",
                    overflow: "auto",
                    padding: "0px",  
                    margin: "0px",  
                    gap: "10px",  
                  }}
                >
              {/* Render sorted contracts */}
              {sortedContracts?.map((contract, index) => (
                <Grid item xs={12} key={index} sx={{ marginBottom: 0 }}>
                  <ContractCard
                    key={index}
                    setViewRHS={props.setViewRHS}
                    contract={contract}
                  />
                </Grid>
              ))}
              </Stack>
            </Stack>
          </Stack>
        </Grid>
      </ThemeProvider>
    </>
  );
};

function ContractCard(props) {
  let navigate = useNavigate();
  const { currentContractUID, updateContractUID, updateContractPropertyUID, isChange, setIsChange} = useContext(ManagementContractContext);
  const [showGoBackDialog, setShowGoBackDialog] = useState(false)

  // //console.log("props for contract card", props);
  const contract = props.contract;
  // //console.log("ContractCard - contract", contract);  

  
  // Define a dictionary to map contract_status to text color
  const statusTextColorMap = {
    REJECTED: "#A52A2A",
    REFUSED: "#A52A2A",
    CANCELLED: "#A52A2A",
    WITHDRAW: "#A52A2A",
    SENT: "#0CAA25",
  };

  // Determine text color based on contract_status or use default blue
  const textColor = statusTextColorMap[contract.contract_status] || "#3D5CAC";
  // let announcements = JSON.parse(contract.announcements);
  // // //console.log("Annoncements", announcements);
  // if (Array.isArray(announcements)) announcements.sort((a, b) => new Date(b.announcement_date) - new Date(a.announcement_date));

  // Extract the first owner's photo (if available) or use a default placeholder
  const owners = JSON.parse(contract.owners || "[]");
  const ownerPhotoUrl = owners.length > 0 ? owners[0].owner_photo_url : "/default-photo.jpg";

  return (
    <>
      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={!contract}>
        <CircularProgress color='inherit' />
      </Backdrop>

      <Grid
        container
        item
        xs={12}
        sx={{
          backgroundColor: contract.contract_uid === currentContractUID ? "#A5D6A7" : "#D6D5DA", 
          borderRadius: "10px",
          padding: "10px",
          marginBottom: "0px",
          fontSize: "11px",
          cursor: "pointer",
          border: contract.contract_uid === currentContractUID ? "2px solid #4CAF50" : "none", 
        }}
        onClick={() => {
          //console.log("inside pmquote.js - isChange - ", isChange);
          if(isChange){
            setShowGoBackDialog(true)
          }else{
            if(props.setViewRHS){
              props.setViewRHS(true)
            }
            updateContractUID(contract.contract_uid);
            updateContractPropertyUID(contract.contract_property_id);          
          }
        }}
      >
      <Grid container alignItems='center'>
        <Grid item xs={4}></Grid>

        <Grid item xs={4} style={{ display: "flex", justifyContent: "center" }}>
          <img
            src={ownerPhotoUrl}
            alt='Business Photo'
            style={{
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              objectFit: "cover",
            }}
          />
        </Grid>

        <Grid container item xs={4} sx={{ textAlign: "center", alignItems: "center", justifyContent: "flex-end" }}>
        <Typography sx={{ color: textColor, fontWeight: "bold", fontSize: "16px" }}>
            {contract.contract_status}
          </Typography>
          {/* {announcements?.length && (
            <img
              src={Bell_fill}
              alt="Bell Icon"
              style={{ display: "block", cursor: "pointer", marginTop: "5px", marginLeft: "10px" }}
              onClick={(e) => {
                e.stopPropagation();
                navigate("/announcements", { state: { owner_uid: contract.owner_uid } });
              }}
            />
          )} */}
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Typography sx={{ color: "#160449", fontSize: "14px" }}>
          <span style={{ fontWeight: "bold" }}>Contract UID:</span> {`${contract.contract_uid}`}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography sx={{ color: "#160449", fontSize: "14px" }}>
          <span style={{ fontWeight: "bold" }}>Contract Property ID:</span> {`${contract.contract_property_id}`}
        </Typography>
      </Grid>
      {/* <Grid item xs={12}>
        <Typography sx={{ color: "#160449", fontSize: "14px" }}>
          <span style={{ fontWeight: "bold" }}>Title:</span> {`${announcements?.length ? announcements[0]?.announcement_title : "No title"}`}
        </Typography>
      </Grid> */}
      {/* <Grid item xs={12}>
        <Typography sx={{ color: "#160449", fontSize: "14px" }}>
          <span style={{ fontWeight: "bold" }}>Message:</span> {`${announcements?.length ? announcements[0]?.announcement_msg : "No message"}`}
        </Typography>
      </Grid> */}
      <Grid container spacing={2}>
      <Grid container spacing={2}>
  {contract.owners
    ? JSON.parse(contract.owners).map((owner, index) => (
        <Grid item xs={12} key={index}>
          <Typography sx={{ color: "#160449", fontSize: "14px" }}>
            <span style={{ fontWeight: "bold" }}>Owner:</span> {`${owner.owner_first_name} ${owner.owner_last_name}`}
          </Typography>
          <Typography sx={{ color: "#160449", fontSize: "14px" }}>
            <span style={{ fontWeight: "bold" }}>Email:</span> {owner.owner_email}
          </Typography>
        <Typography sx={{ color: "#160449", fontSize: "14px" }}>
          <span style={{ fontWeight: "bold" }}>Phone Number:</span> {owner.owner_phone_number}
        </Typography>
        </Grid>
      ))
    : (
      <Typography>No owners available.</Typography>
    )}
</Grid>

</Grid>
      <Grid item xs={12}>
        <Typography sx={{ color: "#160449", fontSize: "14px" }}>
          <span style={{ fontWeight: "bold" }}>Address:</span> {contract.property_address}{contract.property_unit ? `, #${contract.property_unit}` : ""}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography sx={{ color: "#160449", fontSize: "14px" }}>
          <span style={{ fontWeight: "bold" }}>City:</span> {contract.property_city} {contract.property_state} {contract.property_zip}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography sx={{ color: "#160449", fontSize: "14px" }}>
          <span style={{ fontWeight: "bold" }}>Beds:</span> {contract.property_num_beds} <span style={{ fontWeight: "bold", marginLeft: "15px" }}>Baths:</span>{" "}
          {contract.property_num_baths}
        </Typography>
      </Grid>
      </Grid>

      <Dialog
					open={showGoBackDialog}
					onClose={() => setShowGoBackDialog(false)}
					aria-labelledby='alert-dialog-title'
					aria-describedby='alert-dialog-description'
				>
					<DialogContent>
						<DialogContentText
							id='alert-dialog-description'
							sx={{
							fontWeight: theme.typography.common.fontWeight,
							paddingTop: "10px",
							}}
						>
							Are you sure you want to leave without saving the your changes?
						</DialogContentText>
					</DialogContent>
					<DialogActions>
					<Box
						sx={{
						width: "100%",
						display: "flex",
						flexDirection: "row",
						justifyContent: "center",
						}}
					>
						<Button
							onClick={() => {
                updateContractUID(contract.contract_uid);
                updateContractPropertyUID(contract.contract_property_id);  
                setShowGoBackDialog(false)
                setIsChange(false)
              }}
							sx={{
								color: "white",
								backgroundColor: "#3D5CAC80",
								":hover": {
								backgroundColor: "#3D5CAC",
								},
								marginRight: "10px",
							}}
							autoFocus
						>
							Yes
						</Button>
						<Button
						onClick={() => {
              setShowGoBackDialog(false)
            }}
						sx={{
							color: "white",
							backgroundColor: "#3D5CAC80",
							":hover": {
							backgroundColor: "#3D5CAC",
							},
							marginLeft: "10px",
						}}
						>
						No
						</Button>
					</Box>
					</DialogActions>
			</Dialog>
    </>
  );
}
