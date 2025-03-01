import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardMedia, Typography, Button, Box, Stack } from "@mui/material";
import theme from "../../../theme/theme";
import maintenanceRequestImage from "../maintenanceRequest.png";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MobileStepper from "@mui/material/MobileStepper";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import dayjs from "dayjs";


async function getInitialImages(requestData, currentIndex) {
  try {
    if (requestData[currentIndex] && requestData[currentIndex].maintenance_images && requestData[currentIndex].maintenance_images !== "[]") {
      const parsedData = JSON.parse(requestData[currentIndex].maintenance_images);
      return parsedData;
    }
  } catch (error) {
    console.error("Error parsing maintenance_images:", error);
  }
  return [maintenanceRequestImage];
}

export default function WorkerMaintenanceRequestNavigator({ requestIndex, backward_active_status, forward_active_status, updateRequestIndex, requestData, color, item, allData, currentTabValue, status, tabs }) {
  ////console.log('----inside WorkerMaintenanceRequestNavigator----');
  // //console.log("124 - requestData - ", requestData);
  const [currentIndex, setCurrentIndex] = useState(requestIndex);
  const [activeStep, setActiveStep] = useState(0);
  const [formattedDate, setFormattedDate] = useState("");
  const [numOpenRequestDays, setNumOpenRequestDays] = useState("");
  const [images, setImages] = useState([]);
  let [currentTab, setCurrentTab]=useState(currentTabValue);
  // const [maxSteps, setMaxSteps] = useState(images.length);
  const navigate = useNavigate();

  const data = requestData[currentIndex];

  useEffect(() => {
      setCurrentIndex(requestIndex);
    
  }, [requestIndex]);

  useEffect(() => {
    const fetchImages = async () => {
        const initialImages = await getInitialImages(requestData, currentIndex);
        if(initialImages.length === 1 && initialImages[0] === maintenanceRequestImage && JSON.parse(data?.quote_maintenance_images).length > 0 && item.status === "Quotes Requested"){
          setImages([])
        }else{
          setImages(initialImages);
        }
        setActiveStep(0);
    };
    
    fetchImages();
  }, [currentIndex]);

  const maxSteps = images.length;


  const handleNextCard = () => {
    setCurrentIndex((prevIndex) => {
      let newIndex = (Number(prevIndex) + 1);
      if(prevIndex < requestData.length-1){
        //console.log('----requestData[newIndex]---',requestData );
        //console.log('----[newIndex]---',newIndex );
        
        let nextMaintenanceId = requestData[newIndex].maintenance_request_uid;

        updateRequestIndex(newIndex, {changeTab:'noChange'})
        return newIndex;
      }
      else{
        updateRequestIndex(newIndex, {changeTab:'forward'});
        return newIndex;
      }
  });
  };

  const handlePreviousCard = () => {
    setCurrentIndex((prevIndex) => {
        let newIndex = (Number(prevIndex) - 1);
        if(prevIndex > 0){
            let nextMaintenanceId = requestData[newIndex].maintenance_request_uid;
            updateRequestIndex(newIndex, {changeTab:'noChange'})
            return newIndex;
        }
        else{
            if (newIndex === -1){
                newIndex = 1
            }
            updateRequestIndex(newIndex, {changeTab:'backward'});
            return newIndex;
        }
    });
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  function formatDate(date) {
    let formattedDate = "";
    let openTime = "";
    if (date) {
      const postDate = new Date(date);
      let currentDate = new Date();
      formattedDate = postDate.toLocaleDateString();
      const diffInMilliseconds = currentDate.getTime() - postDate.getTime();
      openTime = Math.floor(diffInMilliseconds / (1000 * 3600 * 24));
    }
    // //console.log("formattedDate", formattedDate, "openTime", openTime);
    setNumOpenRequestDays(openTime);
    setFormattedDate(formattedDate);
  }

  
  // //console.log("124 - data - ", data);

   useEffect(() => {
    // //console.log("data - ", data);
    if(data){
      formatDate(data.maintenance_request_created_date);
    }
  }, [data]);  

  
  // //console.log("124 - data?.quote_maintenance_images - ", data?.quote_maintenance_images);
  const quoteMaintenanceImages = data?.quote_maintenance_images? JSON.parse(data?.quote_maintenance_images) : []

  return (
    <div style={{ paddingBottom: "10px" }}>
      <Box
        sx={{
          flexDirection: "column", // Added this to stack children vertically
          justifyContent: "center",
          width: "100%", // Take up full screen width
          marginTop: theme.spacing(2), // Set the margin to 20px
          // backgroundColor: '#3D5CAC80',
          backgroundColor: color,
        }}
      >
        <Typography sx={{ color: theme.typography.secondary.white, fontWeight: theme.typography.secondary.fontWeight, fontSize: theme.typography.largeFont }}>
            {item.status}
        </Typography>        
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={2}
        >
            <Button onClick={handlePreviousCard} disabled={backward_active_status}>
                <ArrowBackIcon />
            </Button>
            <Stack
                direction="column"
                justifyContent="center"
                alignItems="center"
                spacing={1}
            >
                <Typography sx={{ color: theme.typography.secondary.white, fontWeight: theme.typography.secondary.fontWeight, fontSize: theme.typography.largeFont }}>
                    {Number(currentIndex) + 1} of {requestData.length}
                </Typography>
            </Stack>
            <Button onClick={handleNextCard} disabled={forward_active_status}>
                <ArrowForwardIcon />
            </Button>
        </Stack>

        {/* title */}
        <Stack
          justifyContent="center"
          alignItems="center"
        >
          <Typography sx={{ color: theme.typography.secondary.white, fontWeight: theme.typography.secondary.fontWeight, fontSize: theme.typography.largeFont }}>
            { data !== undefined ? (data.maintenance_title !== undefined ? data.maintenance_title : "No Data") : "No data"}
          </Typography>
        </Stack>

        {/* image and info */}
        <Stack alignItems="center" justifyContent="center" sx={{paddingBottom: "0px"}}>
          <Card
            sx={{
              backgroundColor: color,
              boxShadow: "none",
              elevation: "0",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "0px"
            }}
          >
            {/* request image */}
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                paddingBottom: "0px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <CardMedia
                  component="img"
                  image={data?.maintenance_status !== "REQUESTED" ? [...images][activeStep] : [...images, ...quoteMaintenanceImages][activeStep]}
                  sx={{
                    elevation: "0",
                    boxShadow: "none",
                    maxWidth: "500px",
                    minWidth: "300px",
                    maxHeight: "500px",
                    minHeight: "100px",
                    height: "300px",
                    objectFit: "cover",
                    center: "true",
                    alignContent: "center",
                    justifyContent: "center",
                  }}
                />
              </div>
              <MobileStepper
                steps={data?.maintenance_status !== "REQUESTED" ? maxSteps : maxSteps + quoteMaintenanceImages?.length}
                position="static"
                activeStep={activeStep}
                variant="text"
                sx={{
                  color: "white",
                  backgroundColor: color,
                  width: "100%",
                  justifyContent: "center",
                  alignContent: "center",
                  alignItems: "center",
                  elevation: "0",
                  boxShadow: "none",
                }}
                nextButton={
                  <Button size="small" onClick={handleNext} disabled={data?.maintenance_status !== "REQUESTED" ? activeStep === maxSteps -1 : activeStep === maxSteps + quoteMaintenanceImages?.length - 1} 
                    sx={{color: "white"}}
                  > 
                    <KeyboardArrowRight sx={{color: "white"}} />
                  </Button>
                }
                backButton={
                  <Button size="small" onClick={handleBack} disabled={activeStep === 0} 
                    sx={{color: "white"}}
                  >
                  <KeyboardArrowLeft sx={{color: "white"}} />
                </Button>
                }
              />
            </CardContent>

            {/* info about request */}
            <CardContent
              sx={{
                flexDirection: "column",
                alignItems: "left",
                justifyContent: "left",
                width: "100%",
                padding: "0px"
              }}
            >
              <div
                style={{
                  // paddingLeft: "10px",
                  alignContent: "left",
                  justifyContent: "left",
                  alignItems: "left",
                }}
              >
                <Typography
                    sx={{
                    color: theme.typography.secondary.white,
                    fontWeight: theme.typography.secondary.fontWeight,
                    fontSize: theme.typography.mediumFont,
                    paddingBottom: "10px",
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    }}
                >
                    <b>{data?.maintenance_priority.toUpperCase()[0] + data?.maintenance_priority.slice(1)} Priority</b>
                </Typography>
                <Typography
                  sx={{
                    color: theme.typography.secondary.white,
                    fontWeight: theme.typography.primary.fontWeight,
                    fontSize: theme.typography.mediumFont,
                    paddingBottom: "10px",
                  }}
                >
                  { data !== undefined ? (data.maintenance_title!==undefined ? "Title: " + data.maintenance_title :"No Data") : "No data"} - {data?.maintenance_request_uid}
                </Typography>
                <Typography
                  sx={{
                    color: theme.typography.secondary.white,
                    fontWeight: theme.typography.primary.fontWeight,
                    fontSize: theme.typography.mediumFont,
                    paddingBottom: "10px",
                  }} 
                  underline="always"
                >
                  <u>{data?.property_address}, {data?.property_city} {data?.property_state} {data?.property_zip}</u>
                </Typography>
                <Typography
                  sx={{
                    color: theme.typography.secondary.white,
                    fontWeight: theme.typography.secondary.fontWeight,
                    fontSize: theme.typography.mediumFont,
                    paddingBottom: "10px",
                  }}
                >
                  Reported: {formattedDate} | Open: {numOpenRequestDays} days
                </Typography>
                <Typography
                  sx={{
                    color: theme.typography.secondary.white,
                    fontWeight: theme.typography.light.fontWeight,
                    fontSize: theme.typography.mediumFont,
                    paddingBottom: "10px",
                  }}
                >
                  Issue Notes: {data!==undefined ? (data.maintenance_desc===null ? "None" : data.maintenance_desc) : ""}
                </Typography>
                <Typography
                  sx={{
                    color: theme.typography.secondary.white,
                    fontWeight: theme.typography.light.fontWeight,
                    fontSize: theme.typography.mediumFont,
                    paddingBottom: "10px",
                  }}
                >
                Manager Notes:  {data!==undefined ? (data.quote_pm_notes===null ? "None" : data.quote_pm_notes) : "None"}
                </Typography>
                <Typography
                  sx={{
                    overflowWrap: "break-word",
                    color: theme.typography.secondary.white,
                    fontWeight: theme.typography.secondary.fontWeight,
                    fontSize: theme.typography.mediumFont,
                  }}
                >
                  {requestData[currentIndex].maintenance_request_status === "SCHEDULED" ? "Scheduled for " + requestData[currentIndex].maintenance_scheduled_date + " at " + dayjs(requestData[currentIndex].maintenance_scheduled_time,"HH:mm").format("h:mm A"): null}
                </Typography>

                {/* Info requested indication */}
                {data?.quote_status === "MORE INFO" && <Typography
                  sx={{
                    color: "red",
                    fontWeight: theme.typography.secondary.fontWeight,
                    fontSize: theme.typography.mediumFont,
                    paddingBottom: "10px",
                  }}
                >
                  * You asked for more info from manager
                </Typography>}
              </div>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </div>
  );
}
