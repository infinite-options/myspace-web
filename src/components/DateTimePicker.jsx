import React, { useEffect, useState } from 'react';
import { Button, Modal, Box, Typography, Grid, RadioGroup, FormControlLabel, Radio, FormControl, IconButton, } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from "@mui/x-date-pickers";
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { ReactComponent as CalendarIcon } from "../images/datetime.svg"
import theme from '../theme/theme';
import { set } from 'date-fns';

dayjs.extend(customParseFormat);

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    padding: theme.spacing(2),
    // backgroundColor: theme.palette.form.main,
    backgroundColor: "#FFFFFF",
    width: {
      xs: '80%', // For extra-small screens
      sm: '50%', // For small screens and up
    },
    paddingTop: '25px',
    borderRadius: '15px',
    border: '2px solid #000',
    boxShadow: 24,
    padding: "25px"
};

function DateTimePickerModal(props) {
  const [availabilityDate, setAvailabilityDate] = useState(props.date || "");
  const [availabilityTime, setAvailabilityTime] = useState(props.time || "");
//   //console.log("--availability time - ", props)
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [cancelTicketFlag, setcancelTicketFlag] = useState(false);
  useEffect(() => {
    // if (availabilityDate && availabilityTime){
    //     if (props.maintenanceItem.maintenance_scheduled_date && props.maintenanceItem.maintenance_scheduled_time){
    //         setAvailabilityDate(props.maintenanceItem.maintenance_scheduled_date)
    //         setAvailabilityTime(props.maintenanceItem.maintenance_scheduled_time)
    //     }        
    // }
    // //console.log("props.maintenanceItem - ", props.maintenanceItem);
    const scheduledDate = props.maintenanceItem?.maintenance_scheduled_date;
    const scheduledTime = props.maintenanceItem?.maintenance_scheduled_time;
    setAvailabilityDate((scheduledDate !== "" && scheduledDate !== null && scheduledDate !== undefined && scheduledDate !== "null")  ? props.maintenanceItem.maintenance_scheduled_date : props.date);
    setAvailabilityTime((scheduledTime !== "" && scheduledTime !== null && scheduledTime !== undefined && scheduledTime !== "null") ? props.maintenanceItem.maintenance_scheduled_time : props.time);
    // setAvailabilityDate(props.maintenanceItem.maintenance_scheduled_date ? props.maintenanceItem.maintenance_scheduled_date : props.date)
    // setAvailabilityTime(props.maintenanceItem.maintenance_scheduled_time ? props.maintenanceItem.maintenance_scheduled_time : props.time)
  }, [])

  const handleOpen = () => props.setOpenModal(true);
  const handleClose = () => props.setOpenModal(false);

  const activeButton = availabilityDate !== "" || availabilityTime !== "";

  const handleAuxillaryButton = (selection) => {
    if (selection == "now"){
        setAvailabilityDate(dayjs().format("MM-DD-YYYY"));
        setAvailabilityTime(dayjs().format("HH:mm"));
    } else if (selection == "schedule"){
        setAvailabilityDate(props.maintenanceItem.maintenance_scheduled_date);
        setAvailabilityTime(props.maintenanceItem.maintenance_scheduled_time);
    }
  }

  const changeActiveDateSelector = (event) => {
    ////console.log("changeActiveDateSelector", event.target.value, event.target.checked)
    setShowDatePicker(event.target.checked && event.target.value === 'select');
    handleAuxillaryButton(event.target.value)
  }

  const showFormLabel = (selection) => {
    if (selection == "now"){
        return `Complete as of Today (${dayjs().format("MM-DD-YYYY")})`;
    } else if (selection == "schedule"){
        return `Complete on Scheduled Date (${props.maintenanceItem.maintenance_scheduled_date !== null && props.maintenanceItem.maintenance_scheduled_date !== "null" ? props.maintenanceItem.maintenance_scheduled_date : "Not Yet Scheduled"})`;
    }
  }

  function handleCancelFlag(){
    setcancelTicketFlag(true);
  }
  

  async function submit(){
    // //console.log("in submit for datetimepicker")
    if(cancelTicketFlag) {
        //console.log("Cancel ticket---", props.cancelTicket);
        await props.cancelTicket(props.maintenanceItem.maintenance_request_uid, JSON.parse(props.maintenanceItem.quote_info));
        await handleClose();
    }
    else if (props.completeTicket) {
        //console.log("complete ticket", props.maintenanceItem.maintenance_request_uid, props.maintenanceItem.quote_info, availabilityDate, availabilityTime)
        props.completeTicket(props.maintenanceItem.maintenance_request_uid, props.maintenanceItem.quote_info, availabilityDate, availabilityTime).then( () =>
            {
                handleClose();
                // if(props.refreshMaintenanceData){
                //     props.refreshMaintenanceData();
                // }
                
            }
        )
    } else{
        props.handleSubmit(props.maintenanceItem.maintenance_request_uid, availabilityDate, availabilityTime).then(
            handleClose()
        )
    }
  }

  return (
    <div>
      <Modal
        open={props.open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >        
        <Box sx={style}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                }}
            >
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    Close Ticket
                </Typography>
                <IconButton
						onClick={handleClose}
						sx={{
							position: 'absolute',
							top: 8,
							right: 8,
							color: '#3D5CAC',
						}}
					>
						<CloseIcon />
                </IconButton>

            </Box>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                {props.completeTicket ? (
                    <Grid container columnSpacing={5} padding={4} sx={{justifyContent: "left"}}>
                        <Grid item xs={12}>
                            <FormControl>
                                <RadioGroup
                                    defaultValue="now"
                                    name="completed-date-radio-buttons"
                                >
                                    <FormControlLabel value="cancel" control={<Radio sx={{'&.Mui-checked': { color: '#160449' }}} onChange={handleCancelFlag}/>}label={"Cancel Ticket without Completion"} />
                                    <FormControlLabel value="now" control={<Radio sx={{'&.Mui-checked': { color: '#160449' }}} onChange={changeActiveDateSelector}/>} label={showFormLabel("now")}/>
                                    <FormControlLabel value="schedule" control={<Radio sx={{'&.Mui-checked': { color: '#160449' }}} onChange={changeActiveDateSelector} disabled={props.maintenanceItem.maintenance_scheduled_date == null ? true : false}/>} label={showFormLabel("schedule")} />
                                    <FormControlLabel value="select" control={<Radio sx={{'&.Mui-checked': { color: '#160449' }}} onChange={changeActiveDateSelector}/>} label={"Select Completed Date"} />
                                </RadioGroup>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                        <Box sx={{paddingTop: "10px", paddingBottom: "10px"}}>
                            <DatePicker
                                value={dayjs(availabilityDate)}
                                minDate={dayjs()}
                                onChange={(v) => setAvailabilityDate(v.format("MM-DD-YYYY"))}
                                slots={{
                                    openPickerIcon: CalendarIcon,
                                }}
                                slotProps={{
                                    textField: {
                                        size: "small",
                                        style: {
                                            width: "100%",
                                            fontSize: 12,
                                            backgroundColor: "#F2F2F2",
                                            borderRadius: "10px",
                                        },
                                        label: "Date"
                                    },
                                }}
                                disabled={!showDatePicker}
                            />
                        </Box> 
                        </Grid>
                    </Grid>
                ) : (
                    <Grid container rowSpacing={6} padding={4}>
                        <Grid item xs={12}>
                            <DatePicker
                                value={dayjs(availabilityDate)}
                                minDate={dayjs()}
                                onChange={(v) => setAvailabilityDate(v.format("MM-DD-YYYY"))}
                                slots={{
                                    openPickerIcon: CalendarIcon,
                                }}
                                slotProps={{
                                    textField: {
                                        size: "small",
                                        style: {
                                            width: "100%",
                                            fontSize: 12,
                                            backgroundColor: "#F2F2F2 !important",
                                            borderRadius: "10px !important",
                                        },
                                        label: "Date"
                                    },
                                }}
                            />
                        </Grid> 
                        <Grid item xs={12}>
                            <TimePicker                                                        
                                slotProps={{ 
                                    textField: { 
                                        size: 'small',
                                        style: {
                                            width: "100%",
                                            fontSize: 12,
                                            backgroundColor: "#F2F2F2 !important",
                                            borderRadius: "10px !important",
                                        },
                                        label: 'Time (select AM or PM)'                                                                
                                    } 
                                }}                                                        
                                views={['hours', 'minutes']}
                                value={dayjs(availabilityTime,"HH:mm")}
                                onChange={(newValue) => setAvailabilityTime(newValue.format("HH:mm"))}
                            />
                        </Grid>
                    </Grid>
                )}
                
                <Grid container justifyContent="center" alignItems="center" sx={{ padding: "8px" }}>
                    <Grid item>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => submit()}
                            sx={{
                                // backgroundColor: !activeButton  ? "#B0B0B0" : "#FFC614", // Updated color to #FFC614
                                // pointerEvents: !activeButton ? "none" : "auto",
                                backgroundColor: "#FFC614",
                                pointerEvents: "auto",
                                width: "285px", // Set the width to match the image
                                height: "40px", // Set the height to match the image
                                borderRadius: "8px", // Rounded corners for the button
                                '&:hover': {
                                    backgroundColor: "#FFC614", // Ensure hover color is the same
                                },
                            }}
                        >
                            <Typography
                                sx={{
                                    color: "#160449", // Ensure the text color is #160449 as in your images
                                    fontWeight: theme.typography.primary.fontWeight,
                                    fontSize: theme.typography.mediumFont,
                                }}
                            >
                                Save
                            </Typography>
                        </Button>
                    </Grid>
                </Grid>
            </LocalizationProvider>
        </Box>
      </Modal>
    </div>
  );
}

export default DateTimePickerModal;
