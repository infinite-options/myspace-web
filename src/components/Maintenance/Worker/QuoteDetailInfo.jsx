import { 
    ThemeProvider, 
    Typography,
    Box,
    Tabs,
    Tab,
    Paper,
    Card,
    CardHeader,
    Slider,
    Stack,
    Button,
    Grid,
    Checkbox,
    responsiveFontSizes,
    Chip,
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';

import { useEffect, useState, useRef } from "react";
import theme from '../../../theme/theme';
import documentIcon from "./../Business/documentIcon.png"
import { useUser } from "../../../contexts/UserContext";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { getChipColor } from "./WorkerMaintenanceStatusTable";
import DateTimePickerModal from "../../DateTimePicker";
import AreYouSureModal from "../../AreYouSureModal";

import APIConfig from "../../../utils/APIConfig";
import IconButton from '@mui/material/IconButton';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';

import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Documents from "../../Leases/Documents";
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../../utils/httpMiddleware";

function LaborTableReadOnly({labor, setLabor}){

    const calculateTotal = (hours, cost) => {
        return parseInt(hours) * parseInt(cost)
    }

    useEffect(() => {
        //console.log("labor", labor)
    }, [labor])

    return (
        <>
        <Grid container sx={{paddingTop: "10px"}}>
            <Grid item xs={3}>
                <Typography sx={{color: "#3D5CAC", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "14px"}}>
                    Title
                </Typography>
            </Grid>
            <Grid item xs={3}>
                <Typography sx={{color: "#3D5CAC", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "16px"}}>
                    # of Hours
                </Typography>
            </Grid>
            <Grid item xs={3}>
                <Typography sx={{color: "#3D5CAC", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "16px"}}>
                    Charge / Hour
                </Typography>
            </Grid>
            <Grid item xs={3}>
                <Typography sx={{color: "#3D5CAC", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "16px"}}>
                    Total
                </Typography>
            </Grid>
            
            {labor && labor.map((laborItem, index) => (
                <Grid container key={index}>
                    <Grid item xs={3}>
                        <Typography sx={{color: "#000000", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "14px"}}>
                            {laborItem.description ? laborItem.description : "Labor"}
                        </Typography>
                    </Grid>
                    <Grid item xs={3}>
                        <Typography sx={{color: "#000000", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "14px"}}>
                            {laborItem?.event_type === "Fixed Bid" ? "Fixed Bid" : (laborItem.hours ? laborItem.hours : 1)}
                        </Typography>
                    </Grid>
                    <Grid item xs={3}>
                        <Typography sx={{color: "#000000", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "14px"}}>
                            ${laborItem.charge || laborItem.rate}
                        </Typography>
                    </Grid>
                    <Grid item xs={3}>
                        <Typography sx={{color: "#000000", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "14px"}}>
                            ${calculateTotal(laborItem.hours || 1, laborItem.charge || laborItem.rate)}
                        </Typography>
                    </Grid>
                </Grid>
                )
            )}
        </Grid>
        </>
    )
}

function PartsTableReadOnly({parts, setParts}){

    const calculateTotal = (qty, cost) => {
        return parseInt(qty) * parseInt(cost)
    }
    return (
        <>
        <Grid container sx={{paddingTop: "10px"}}>
            <Grid item xs={3}>
                <Typography sx={{color: "#3D5CAC", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "16px"}}>
                    Parts
                </Typography>
            </Grid>
            <Grid item xs={3}>
                <Typography sx={{color: "#3D5CAC", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "16px"}}>
                    Qty
                </Typography>
            </Grid>
            <Grid item xs={3}>
                <Typography sx={{color: "#3D5CAC", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "16px"}}>
                    Cost
                </Typography>
            </Grid>
            <Grid item xs={3}>
                <Typography sx={{color: "#3D5CAC", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "16px"}}>
                    Total
                </Typography>
            </Grid>
            {parts && parts.map((part, index) => (
                <Grid container key={index}>
                    <Grid item xs={3}>
                        <Typography sx={{color: "#000000", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "14px"}}>
                            {part.part}
                        </Typography>
                    </Grid>
                    <Grid item xs={3}>
                        <Typography sx={{color: "#000000", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "14px"}}>
                            {part.quantity}
                        </Typography>
                    </Grid>
                    <Grid item xs={3}>
                        <Typography sx={{color: "#000000", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "14px"}}>
                            ${part.cost}
                        </Typography>
                    </Grid>
                    <Grid item xs={3}>
                        <Typography sx={{color: "#000000", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "14px"}}>
                            ${calculateTotal(part.quantity, part.cost)}
                        </Typography>
                    </Grid>
                </Grid>
                )
            )}
        </Grid>
        </>
    )
}

export default function QuoteDetailInfo({maintenanceItem, refreshMaintenanceData}){
    //console.log('inside QuoteDetailInfo - maintenanceItem - ', maintenanceItem);
    const { roleName } = useUser();

    const location = useLocation();
    const navigate = useNavigate();

    let costData;

    // set cost data from quote_Service_expense
    try {
        // //console.log('----maintenanceItem in quotedetailinfo---', maintenanceItem);
        if (maintenanceItem?.quote_services_expenses) {
            costData = JSON.parse(maintenanceItem?.quote_services_expenses);
        } else {
            costData = {}; 
        }
    } catch (error) {
        console.error('Error parsing quote_services_expenses:', error);
        costData = {}; 
    } 

    const [parts, setParts] = useState([]);
    const [labor, setLabor] = useState([]);

    const [estimatedCost, setEstimatedCost] = useState(0);
    const [estimatedLaborCost, setEstimatedLaborCost] = useState(0);
    const [estimatedPartsCost, setEstimatedPartsCost] = useState(0);
    const [estimatedTime, setEstimatedTime] = useState("");
    const [earliestAvailability, setEarliestAvailability] = useState("");
    const [quoteImages, setQuoteImages] = useState([])
    const [showModal, setShowModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const date = maintenanceItem.maintenance_scheduled_date;
    const time = maintenanceItem.maintenance_scheduled_time;

    const handleWithdraw = async () => {
        // PUT to withdraw request

        // //console.log("handleWithdraw")
        var formData = new FormData();
        formData.append("maintenance_quote_uid",  maintenanceItem.maintenance_quote_uid);
        formData.append("quote_status", "WITHDRAW");

        try {
            // //console.log("in try block")
            const response = await fetch(`${APIConfig.baseURL.dev}/maintenanceQuotes`, {
                method: 'PUT',
                body: formData
            });
            if(response.ok){
                await refreshMaintenanceData()
            }
        } catch (error){
            //console.log("error", error)
        }
    }

    useEffect(() => {
        const parseServicesExpenses = (expenses) => {
            let servicesObject = JSON.parse(expenses)
            // //console.log("servicesObject", servicesObject)
            var partsCost = 0
            var laborCost = 0
            for (const item in servicesObject?.parts){
                partsCost += parseInt(servicesObject.parts[item].cost) * parseInt(servicesObject.parts[item].quantity)
            }

            // for (const item in servicesObject?.labor){
            //     laborCost += parseInt(servicesObject.labor[item].hours) * parseInt(servicesObject.labor[item].charge || servicesObject.labor[item].rate)
            // }

            if (servicesObject?.event_type === "Fixed") {
                // For fixed event type, sum up the rates without multiplying by hours
                for (const item in servicesObject?.labor) {
                    laborCost += parseInt(servicesObject.labor[item].rate || servicesObject.labor[item].charge || 0);
                }
            } else if (servicesObject?.event_type === "Hourly") {
                // For hourly event type, multiply rate by hours
                for (const item in servicesObject?.labor) {
                    laborCost += parseInt(servicesObject.labor[item].hours || 0) * parseInt(servicesObject.labor[item].rate || servicesObject.labor[item].charge ||  0);
                }
            }else{
                for (const item in servicesObject?.labor) {
                    laborCost += parseInt(servicesObject.labor[item].hours || 1) * parseInt(servicesObject.labor[item].rate || servicesObject.labor[item].charge ||  0);
                }
            }


            setEstimatedLaborCost(laborCost)
            setEstimatedPartsCost(partsCost)

            setEstimatedCost(laborCost + partsCost)
        }

        setParts(costData?.parts || [{hours: 0, rate: 0, description: ""}])
        setLabor(costData?.labor || [{part: "", cost: 0, quantity: ""}])
        
        try{
            parseServicesExpenses(maintenanceItem?.quote_services_expenses)
            let quoteImageArray = JSON.parse(maintenanceItem?.quote_maintenance_images || '[]');
            setQuoteImages(quoteImageArray);

            setEstimatedTime(maintenanceItem?.quote_event_type)
            setEarliestAvailability(maintenanceItem?.quote_earliest_availability)
        } catch (error){
            //console.log("error", error)
            setQuoteImages([]);
        }

    }, [maintenanceItem])

    const handleUpdateScheduleDateTime = () => {
        //console.log("handleUpdateScheduleDateTime")

    }

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
	
				if (direction === 'left') {
					newScrollPosition = Math.max(currentScrollPosition - scrollAmount, 0);
				} else {
					newScrollPosition = currentScrollPosition + scrollAmount;
				}
	
				return newScrollPosition;
			});
		}
	};

    return (
        <Stack
            direction="column"
            justifyContent="center"
            alignItems="center"
            sx={{
                paddingBottom: "5px",
            }}
        >
        {/* edit icon, status, image    */}
        <Grid container direction="column" rowSpacing={2}>

            {/* edit icon & status chip */}
            <Grid container direction="row">

                {/* quote status & maintenance status */}
                <Grid item xs={11}>
                    <Typography sx={{color: "#3D5CAC", fontWeight: theme.typography.primary.fontWeight, fontSize: "18px"}}>
                        Maintenance Quote Details
                    </Typography>
                    <Chip
                        label={maintenanceItem.quote_status}
                        size="small"
                        style={{ backgroundColor: getChipColor(maintenanceItem.quote_status), color: 'white' }}
                    />
                    {maintenanceItem.maintenance_request_status === "COMPLETED" && maintenanceItem.maintenance_status === "SUBMITTED" && <Chip
                        label={maintenanceItem.maintenance_request_status}
                        size="small"
                        style={{ backgroundColor: getChipColor(maintenanceItem.maintenance_request_status), color: 'white', marginLeft: "20px"}}
                    />}
                </Grid>
                
                {/* edit icon */}
                <Grid item xs={1}>
                    <Box sx={{alignItems: "right", justifyContent: "right"}}>
                        {roleName() === "Manager"  || maintenanceItem?.quote_status === "REFUSED" || maintenanceItem.maintenance_request_status === "COMPLETED" ? null : (
                            <Button 
                                onClick={() => navigate("/businessEditQuoteForm", {state: {maintenanceItem: maintenanceItem}})}
                                sx={{background: "#FFFFFF", color: "#3D5CAC"}}
                            >
                                <EditIcon/>
                            </Button>
                        )}
                    </Box>
                </Grid>
            </Grid>
            
            {/* quote id */}
            <Grid item xs={12}>
                    <Typography sx={{color: "#3D5CAC", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "14px"}}>
                        {maintenanceItem?.maintenance_quote_uid}
                    </Typography>
            </Grid>
            
            {/* quote images */}
            <Grid item xs={12}>
                {quoteImages.length > 0  ? (
                    <Typography sx={{color: "#3D5CAC", fontWeight: theme.typography.primary.fontWeight, fontSize: "18px"}}>
                        Maintenance Quote Images
                    </Typography>
                ) : null}
            </Grid>
            <Grid item xs={12}>
                {quoteImages.length > 0 ? (
                  <Grid item xs={12}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 2,
                        }}
                    >
                        <IconButton
                            onClick={() => handleScroll('left')}
                            disabled={scrollPosition === 0}
                        >
                            <ArrowBackIosIcon />
                        </IconButton>
                        <Box
                            sx={{
                                display: 'flex',
                                overflowX: 'auto',
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                                '&::-webkit-scrollbar': {
                                    display: 'none',
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    overflowX: 'auto',
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none',
                                    '&::-webkit-scrollbar': {
                                        display: 'none',
                                    },
                                }}
                            >
                                <ImageList 
                                ref={scrollRef}
                                sx={{ display: 'flex', flexWrap: 'nowrap' }} cols={5}>
                                    {quoteImages?.map((image, index) => (
                                        <ImageListItem
                                            key={index}
                                            sx={{
                                                width: 'auto',
                                                flex: '0 0 auto',
                                                border: '1px solid #ccc',
                                                margin: '0 2px',
                                                position: 'relative', // Added to position icons
                                            }}
                                        >
                                            <img
                                                src={image}
                                                alt={`maintenance-${index}`}
                                                style={{
                                                    height: '150px',
                                                    width: '150px',
                                                    objectFit: 'cover',
                                                }}
                                            />
                                        </ImageListItem>
                                    ))}
                                </ImageList>
                            </Box>
                        </Box>
                        <IconButton onClick={() => handleScroll('right')}>
                            <ArrowForwardIosIcon />
                        </IconButton>
                    </Box>
                  </Grid>
                )
                : "No Images" }
            </Grid>
        </Grid>
        
        {/* estimate */}
        {maintenanceItem?.quote_status !== "REFUSED" && <Grid container direction="column" rowSpacing={2}>
            <Grid item xs={12}>
                <Typography sx={{color: "#3D5CAC", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "18px"}}>
                    Estimate
                </Typography>
            </Grid>
        </Grid>}
        
        {/* labor expense */}
        {maintenanceItem?.quote_status !== "REFUSED" && (
            JSON.parse(maintenanceItem?.quote_services_expenses)?.event_type === "Fixed" ? (
                <Grid container sx={{ paddingTop: "10px" }}>
                    <Grid item xs={6}>
                        <Typography sx={{ color: "#3D5CAC", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "16px" }}>
                            Fixed Bid
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography sx={{ color: "#000000", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "16px" }}>
                            ${labor[0]?.rate || 0}
                        </Typography>
                    </Grid>
                </Grid>
            ) : (
                labor.length > 0 ? (
                    <LaborTableReadOnly labor={labor} setLabor={setLabor} />
                ) : (
                    <Grid container sx={{ paddingTop: "10px" }}>
                        <Grid item xs={12}>
                            <Typography sx={{ color: "#3D5CAC", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "16px" }}>
                                No Labor
                            </Typography>
                        </Grid>
                    </Grid>
                )
            )
        )}

        {/* parts expense */}
        {maintenanceItem?.quote_status !== "REFUSED" && (
            parts.length > 0 ? (
                <PartsTableReadOnly parts={parts} setParts={setParts} />
            ) : (
                <Grid container sx={{ paddingTop: "10px" }}>
                    <Grid item xs={12}>
                        <Typography sx={{ color: "#3D5CAC", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "16px" }}>
                            No Parts
                        </Typography>
                    </Grid>
                </Grid>
            )
        )}

        {/* estimate, document */}
        {maintenanceItem?.quote_status !== "REFUSED" && <Grid container direction="column" rowSpacing={2} paddingTop={"20px"}>
            <Grid item xs={12}>
                <Typography sx={{color: "#000000", fontWeight: theme.typography.medium.fontWeight, fontSize: "18px"}}>
                    Quote Total: ${estimatedCost}
                </Typography>
                {/* <Typography sx={{color: "#3D5CAC", fontWeight: theme.typography.medium.fontWeight, fontSize: "16px"}}>
                    Your Estimated Time: {maintenanceItem?.quote_event_type}
                </Typography> */}
                <Typography sx={{color: "#3D5CAC", fontWeight: theme.typography.medium.fontWeight, fontSize: "16px"}}>
                    {/* I would like this to be stored as time and date */}
                    Earliest Availability: {maintenanceItem.quote_earliest_available_date} {dayjs(maintenanceItem.quote_earliest_available_time, "HH:mm").format("h:mm A")}
                </Typography>
            </Grid>

            {/* schedule date and time */}
            {maintenanceItem?.maintenance_request_status === "SCHEDULED" ? (
                <Grid item xs={12} sx={{paddingBottom: "15px"}}>
                  <Box sx={{paddingTop: "15px"}}>
                      <Typography sx={{color: "#3D5CAC", fontWeight: theme.typography.primary.fontWeight, fontSize: "18px"}}>
                          Scheduled Date: {maintenanceItem?.maintenance_scheduled_date}
                      </Typography>
                      <Typography sx={{color: "#3D5CAC", fontWeight: theme.typography.primary.fontWeight, fontSize: "18px"}}>
                          Scheduled Time: {dayjs(maintenanceItem?.maintenance_scheduled_time, "HH:mm").format("h:mm A")} 
                      </Typography>
                  </Box>
              </Grid>
            ) : null}


            {/* checkbox Diagnostic */}
            <Grid item xs={12} sx={{paddingLeft: "0px"}}>
                <Box 
                    display="flex" 
                    flexDirection="row" 
                    alignItems="center" 
                    justifyContent="left"
                >
                    <Checkbox
                        checked={true}
                        sx={{paddingLeft: "0px", cursor: "default"}}
                    />
                    <Typography
                        sx={{
                            color: theme.palette.text.primary,
                            fontWeight: theme.typography.medium.fontWeight,
                            fontSize: "18px",  // Example size, adjust as needed
                            fontFamily: 'Source Sans Pro',
                            // marginLeft: 2,  // Optionally add some spacing between the checkbox and the text
                        }}
                    >
                        Diagnostic fees included or extra
                    </Typography>
                </Box>
            </Grid>

            {/* document */}
            <Grid item xs={12} sx={{paddingLeft: "0px"}}>
                {/* <Button sx={{
                    color: "#3D5CAC",
                    textTransform: "none",
                    margin: "1px",
                }}>
                    <img src={documentIcon} style={{width: '20px', height: '25px', margin:'0px', paddingLeft: "0px", paddingRight: "15px"}}/>
                    <Typography sx={{color: "#3D5CAC", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "16px"}}>
                        View Document
                    </Typography>
                </Button> */}
                <Documents isAccord={false} isEditable={false} customName={"View Document"} documents={maintenanceItem?.quote_documents? JSON.parse(maintenanceItem?.quote_documents) : []}/>
            </Grid>
            
            {/* withdraw button */}
            {maintenanceItem.quote_status !== "REJECTED" && maintenanceItem.maintenance_request_status !== "COMPLETED" && maintenanceItem.quote_status !== "FINISHED" && (roleName() === "Maintenance" || roleName() === "Maintenance Employee") ? (
                <Grid item xs={12} sx={{paddingLeft: "0px"}}>
                    <Button sx={{
                        backgroundColor: "#A52A2A",
                        textTransform: "none",
                        margin: "1px",
                        }}
                        variant="contained"
                        
                        onClick={() => setShowWithdrawModal(true)}
                    >
                        <Typography sx={{color: "#FFFFFF", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "16px"}}>
                            Withdraw
                        </Typography>
                    </Button>
                </Grid>
            ) : null}
        </Grid>}

        <DateTimePickerModal
            setOpenModal={setShowModal}
            open={showModal}
            maintenanceItem={maintenanceItem}
            date={date}
            time={time}
            handleSubmit={handleUpdateScheduleDateTime}
        />
        <AreYouSureModal
            setOpenModal={setShowWithdrawModal}
            open={showWithdrawModal}
            maintenanceItem={maintenanceItem}
            action={"WITHDRAW"}
            handleSubmit={handleWithdraw}
        />
    </Stack>
    )


}