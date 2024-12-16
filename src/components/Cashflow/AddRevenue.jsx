import React, { useContext, useEffect, useState } from "react";
import { Radio, RadioGroup, Paper, Box, Stack, ThemeProvider, FormControl, Switch, Select, MenuItem, FormControlLabel, Typography, TextField, IconButton, Checkbox, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import theme from "../../theme/theme";
import File_dock_add from "../../images/File_dock_add.png";
import { useNavigate, useLocation } from "react-router-dom";
// import { post, put } from "../utils/api";
// import PropertyListData from "../Property/PropertyListData";
import { makeStyles } from "@material-ui/core/styles";
import { useUser } from "../../contexts/UserContext";
// import PropertyData from "../Property/PropertyData";
import Backdrop from "@mui/material/Backdrop"; 
import CircularProgress from "@mui/material/CircularProgress";
import ListsContext from "../../contexts/ListsContext";
import APIConfig from "../../utils/APIConfig";
import { fetchMiddleware as fetch } from "../../utils/httpMiddleware";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiFilledInput-root": {
      backgroundColor: "#F2F2F2", // Update the background color here
      borderRadius: 10,
      height: 30,
      marginBlock: 10,
      paddingBottom: '15px', // Add this line for vertically center alignment
      "&:hover, &:focus, &:active": {
        backgroundColor: "#F2F2F2", // Change background color on hover, focus and active states
      },
    },
  },
}));

const AddRevenue = (props) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const { getProfileId, selectedRole } = useUser();
  const { getList, } = useContext(ListsContext);	
	const feeFrequencies = getList("frequency");
  const expenseCategories = getList("expense");

  const [category, setCategory] = useState("Insurance");
  const [frequency, setFrequency] = useState("Monthly"); // TODO: Monthly and Yearly fees need to be added to the lease in lease_fees
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [propertyList, setPropertyList] = useState(props.propertyList);
  const [payable, setPayable] = useState("Property Manager");
  const [selectedProperty, setSelectedProperty] = useState("");
  const [showSpinner, setShowSpinner] = useState(false);
  const [purPayerId, setPurPayerId] = useState(null); // this needs to be the tenant_id or the PM business_id
  const [isCheckedOne, setIsCheckedOne] = useState(false);
  const [isCheckedTwo, setIsCheckedTwo] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [partialAmount, setPartialAmount] = useState(null);
  const setCurrentWindow = props.setCurrentWindow;
  const [selectedFinalPayer, setSelectedFinalPayer] = useState(null);
  console.log("props", props);

  useEffect(() => {
    setPropertyList(props.propertyList);
    console.log(props.propertyList);
  }, [props.propertyList]);

  const handleCheckboxChange = (option) => {
    // console.log(option)
    if (option === "already_paid") {
      setIsCheckedOne(!isCheckedOne);
      setIsCheckedTwo(false);
      setSelectedOption("already_paid");
    } else if (option === "partially_paid") {
      setIsCheckedTwo(!isCheckedTwo);
      setIsCheckedOne(false);
      setSelectedOption("partially_paid");
    }
  };

  const [notes, setNotes] = useState("");

  const [edit, setEdit] = useState(location?.state?.edit || false);

  const [itemToEdit, setItemToEdit] = useState(location?.state?.itemToEdit || null);

  useEffect(() => {
    if (edit && itemToEdit){
      // console.log("itemToEdit", itemToEdit)
      // setSelectedProperty(itemToEdit.property_uid)
      setCategory(itemToEdit.purchase_type)
      if(!itemToEdit.pur_frequency){
        setFrequency("One Time")
      } else{
        setFrequency(itemToEdit.pur_frequency)
      }
      setAmount(itemToEdit.pur_amount_due)
      setPayable(itemToEdit.pur_payer)
      // setDate(itemToEdit.purchase_date.replace("-", "/"))
      propertyList.find((property) => {
        // console.log(property)
        if (property.property_address === itemToEdit.property_address && property.property_unit === itemToEdit.property_unit){
          setSelectedProperty(property)
        }
      })

    }
  }, [edit, itemToEdit]);

  useEffect(() => {
    if (payable === "Property Manager") {
      // console.log("Set purPayerId to", selectedProperty.business_uid)
      setPurPayerId(selectedProperty.business_uid)
    } else if (payable === "Tenant") {
      // console.log("Set purPayerId to", selectedProperty.tenant_uid)
      setPurPayerId(selectedProperty.tenant_uid)
    } else if (payable === "Owner") {
      // console.log("Set purPayerId to", selectedProperty.owner_uid)
      setPurPayerId(selectedProperty.owner_uid)
    }
  }, [payable, selectedProperty]);

  const handlePropertyChange = (event) => {
    setSelectedProperty(event.target.value);
  };
  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };
  const handleFrequencyChange = (event) => {
    setFrequency(event.target.value);
  };
  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  };
  const handlePartialAmountChange = (event) => {
    setPartialAmount(event.target.value);
  }
  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };
  const handleNotesChange = (event) => {
    setNotes(event.target.value);
  };

  const handleDateChange = (event) => {
    setDate(event.target.value);
  };

  const handlePayerChange = (event) => {
    const selectedPayer = event.target.value;
    setSelectedPayer(selectedPayer);

    // If the receiver is the same as the payer, reset receiver
    if (selectedReceiver === selectedPayer) {
      setSelectedReceiver(null);
    }
  };

  // Handle receiver selection
  const handleReceiverChange = (event) => {
    const selectedReceiver = event.target.value;

    // Ensure payer and receiver are not the same
    if (selectedReceiver !== selectedPayer) {
      setSelectedReceiver(selectedReceiver);
    }
  };
  
  const handleFinalPayerChange = (event) => {
    setSelectedFinalPayer(event.target.value);
  };

  const determinePurchaseStatus = () => {
    if (selectedOption === "already_paid") {
      return "PAID";
    } else if (selectedOption === "partially_paid") {
      return "PARTIALLY PAID";
    } else {
      return "UNPAID";
    }
  }

  const [selectedPayer, setSelectedPayer] = useState(null);
  const [selectedReceiver, setSelectedReceiver] = useState(null);

  const handleId = (value) => {
    if (value === "Tenant") {
      return selectedProperty.tenant_uid;
    }
    else if (value == "Property Manager") {
      return selectedProperty.business_uid;
    }
    else if (value == "Owner") {
      return selectedProperty.owner_uid;
    }
    else {
      return value
    }
  }
  
  const handleExpenseChange = async () => {
    const [year, month, day] = date.split('-');
    const formattedDate = `${month}-${day}-${year}`;

    let formattedDueDate;
    if (dueDate) {
      const [dueYear, dueMonth, dueDay] = dueDate.split('-');
      formattedDueDate = `${dueMonth}-${dueDay}-${dueYear}`;
    } else {
      formattedDueDate = formattedDate;
    }

    const formData = new FormData();

    // if (edit && itemToEdit){
    //   console.log("itemToEdit", itemToEdit)
    // }

    formData.append("pur_property_id", selectedProperty.property_uid);
    formData.append("purchase_type", category);
    // formData.append("pur_cf_type", "expense");
    formData.append("purchase_date", formattedDate);
    formData.append("pur_due_date", formattedDueDate);
    formData.append("pur_amount_due", Number(amount));
    formData.append("pur_notes", notes);
    formData.append("pur_receiver", handleId(selectedReceiver));
    formData.append("pur_payer", handleId(selectedPayer));
    //formData.append("pur_frequency", frequency);
    formData.append("pur_initiator", getProfileId());
    formData.append("pur_description", description);
    formData.append("purchase_status", determinePurchaseStatus());

    if (determinePurchaseStatus() === "PARTIALLY PAID"){
      // data["partial_amount"] = Number(partialAmount)
      formData.append("partial_amount", Number(partialAmount));
    }

    formData.forEach((value, key) => {
      console.log(key, value);
    });
    
    // const config = {
    //   method: 'post',
    //   maxBodyLength: Infinity,
    //   url: '${APIConfig.baseURL.dev}/addPurchase',
    //   headers: { 'Content-Type': 'multipart/form-data' },
    //   data: formData
    // };

    setShowSpinner(true);
    try {
      setShowSpinner(true);
      const response = await fetch(`${APIConfig.baseURL.dev}/addPurchase`, {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
  
      const data = await response.json();
      console.log(data);
  
      if (selectedRole === "OWNER") {
        setCurrentWindow("CASHFLOW_DETAILS");
      } else if (selectedRole === "MANAGER") {
        setCurrentWindow("PROFITABILITY");
      }
    } catch (error) {
      console.error("There was an error with the request", error);
    } finally {
      setShowSpinner(false);
    }
  };

    // let currentDate = new Date();
    // let currentMonth = currentDate.toLocaleString("default", { month: "long" });
    // let currentYear = currentDate.getFullYear().toString();
    
    // if(selectedRole === "OWNER"){
    //   // navigate("/", {state: { month: currentMonth, year: currentYear, currentWindow: "CASHFLOW_DETAILS"}});
    //   setCurrentWindow("CASHFLOW_DETAILS");
      
    // } else if (selectedRole === "MANAGER"){
    //   // navigate("/managerCashflow", {state: { currentWindow: "PROFITABILITY" }});
    //   setCurrentWindow("PROFITABILITY");
    // }

  const [payFromCycle, setPayFromCycle] = useState(false);
  const handlePayFromCycleChange = (event) => {
    setPayFromCycle(event.target.checked);
  };

  const handleClosePopup = (event) => {
    if(selectedRole === "OWNER"){
      // navigate("/", {state: { month: currentMonth, year: currentYear, currentWindow: "CASHFLOW_DETAILS"}});
      setCurrentWindow("CASHFLOW_DETAILS");
      
    } else if (selectedRole === "MANAGER"){
      // navigate("/managerCashflow", {state: { currentWindow: "PROFITABILITY" }});
      setCurrentWindow("PROFITABILITY");
    }
  }

  const [reimbursable, setReimbursable] = useState(false);

  const handleReimbursableChange = (event) => {
    setReimbursable(event.target.checked);
  };

  const [dueDate, setDueDate] = useState("");
  const handleDueDateChange = (event) => setDueDate(event.target.value); 

  
  return (
    
      <ThemeProvider theme={theme}>
        <Backdrop
            sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={showSpinner}
        >
            <CircularProgress color="inherit" />
        </Backdrop>
        {/* <PropertyListData setShowSpinner={setShowSpinner} setPropertyList={setPropertyList}/> */}
        <Paper
          sx={{
            // margin: "30px",
            padding: 20,
            borderRadius: "10px",
            marginTop: "2px",
            boxShadow: "none",
            // backgroundColor: theme.palette.primary.main,
            backgroundColor: theme.palette.custom.yellow,
            width: "85%", // Occupy full width with 25px margins on each side
            height: "100%"
          }}
        >
          <IconButton
            aria-label="close"
            onClick={handleClosePopup}
            sx={{
              position: "sticky",
              left: "90vw",
              top: 1,
              color: theme.typography.common.blue,
              fontWeight: theme.typography.common.fontWeight,
            }}
          >
            <CloseIcon />
          </IconButton>
          <Stack direction="row" justifyContent="center">
            <Typography sx={{ color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight }}>{edit ? "Edit" : "Add"} Revenue</Typography>
          </Stack>
          {/* <form onSubmit={handleExpenseChange}> */}
          <Stack spacing={-2}>
            <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight }}>Property</Typography>
            <FormControl variant="filled" fullWidth className={classes.root}>
              <Select value={selectedProperty} onChange={handlePropertyChange} variant="filled" displayEmpty>
                <MenuItem value="" disabled>
                  Select Property
                </MenuItem>
                {propertyList?.map((option, index) => (
                  <MenuItem key={index} value={option}>
                    {option.property_address}
                    {", "}
                    {option.property_unit}
                    {", "}
                    {option.property_city}, {option.property_state} {option.property_zip}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Stack spacing={-2}>
            <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight }}>Category</Typography>
            <FormControl variant="filled" fullWidth className={classes.root}>
              <Select labelId="category-label" id="category" defaultValue="Insurance" value={category} onChange={handleCategoryChange}>
                {/* <MenuItem value="Insurance">Insurance</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
                <MenuItem value="Management">Management</MenuItem>
                <MenuItem value="Mortgage">Mortgage</MenuItem>
                <MenuItem value="Repairs">Repairs</MenuItem>
                <MenuItem value="Taxes">Taxes</MenuItem>
                <MenuItem value="Utilities">Utilities</MenuItem>
                <MenuItem value="BILL POSTING">BILL POSTING</MenuItem> */}
                {
                  expenseCategories?.map( (freq ) => (
                    <MenuItem key={freq.list_uid} value={freq.list_item}>{freq.list_item}</MenuItem>
                  ))
                }
              </Select>
            </FormControl>
          </Stack>

          <Stack spacing={-2}>
            <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight }}>Amount</Typography>
            <TextField
              variant="filled"
              fullWidth
              inputProps={{ 
                autoComplete: 'off'
              }}
              placeholder="$"
              type="number"
              value={amount}
              className={classes.root}
              onChange={handleAmountChange}>
            </TextField>
          </Stack>

          <Stack spacing={-2}>
            <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight }}>Transaction Date</Typography>
            <TextField
              className={classes.root}
              type="date"
              variant="filled"
              fullWidth
              placeholder="mm/dd/yyyy"
              value={date}
              onChange={handleDateChange}>
            </TextField>
          </Stack>

          {/* New Due By Date field */}
          <Stack spacing={-2}>
            <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight }}>Due by Date</Typography>
            <TextField
              className={classes.root}
              type="date"
              variant="filled"
              fullWidth
              placeholder="mm/dd/yyyy"
              value={dueDate}
              onChange={handleDueDateChange}
              disabled={isCheckedOne}
            />
          </Stack>

        {/* Already Paid, Partially Paid, and Reimbursable */}
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControlLabel
            control={
              <Checkbox
                checked={isCheckedOne}
                onChange={() => handleCheckboxChange("already_paid")}
                sx={{ color: theme.typography.common.blue }}
              />
            }
            label="Already Paid"
            sx={{ color: theme.typography.common.blue }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isCheckedTwo}
                onChange={() => handleCheckboxChange("partially_paid")}
                sx={{ color: theme.typography.common.blue }}
              />
            }
            label="Partially Paid"
            sx={{ color: theme.typography.common.blue }}
          />
          {/* <Stack direction="row" alignItems="center">
            <Typography
              sx={{
                color: theme.typography.common.blue,
                fontWeight: theme.typography.primary.fontWeight,
              }}
            >
              Reimbursable?
            </Typography>
            <Switch
              checked={reimbursable}
              onChange={handleReimbursableChange}
              sx={{ color: theme.typography.common.blue }}
            />
          </Stack> */}
        </Stack>

        {isCheckedTwo && (
          <Stack spacing={-2}>
            <Typography sx={{ color: theme.typography.common.blue }}>
              Partial Payment Amount
            </Typography>
            <TextField
              variant="filled"
              fullWidth
              placeholder="$"
              type="number"
              value={partialAmount}
              className={classes.root}
              onChange={handlePartialAmountChange}
            />
          </Stack>
        )}

{/* <Stack spacing={-2}>
            <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight }}>Frequency</Typography>
            <FormControl variant='filled' fullWidth className={classes.root}>
              <Select defaultValue='One Time' value={frequency} onChange={handleFrequencyChange}>
                {
                  feeFrequencies?.map( (freq ) => (
                    <MenuItem key={freq.list_uid} value={freq.list_item}>{freq.list_item}</MenuItem>
                  ))
                }
              </Select>
            </FormControl>
          </Stack> */}

          <Stack spacing={-2}>
            <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight }}>Description</Typography>
            <TextField
              className={classes.root}
              variant="filled"
              inputProps={{ 
                autoComplete: 'off'
              }}
              fullWidth
              placeholder="Add Description"
              value={description}
              onChange={handleDescriptionChange}
              required
            >
            </TextField>
          </Stack>
          
          <Stack spacing={-2}>
            <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight }}>Notes</Typography>
            <TextField
              className={classes.root}
              variant="filled"
              inputProps={{ 
                autoComplete: 'off'
              }}
              fullWidth
              placeholder="Add Notes"
              value={notes}
              onChange={handleNotesChange}>
            </TextField>
          </Stack>

          <Box
            component="span"
            display="flex"
            flexDirection="row" 
            justifyContent="space-between"
            alignItems="center"
            width="100%"
          >
          <Stack spacing={-2}>
            {/* Payer RadioGroup */}
            <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight }}>
              Payer
            </Typography>
            <RadioGroup value={selectedPayer} onChange={handlePayerChange}>
              <FormControlLabel 
                control={<Radio sx={{ 
                  '&.Mui-checked': { color: theme.palette.custom.blue } 
                }} />} 
                value="Tenant" label="Tenant" 
              />
              <FormControlLabel 
                control={<Radio sx={{ 
                  '&.Mui-checked': { color: theme.palette.custom.blue } 
                }} />} 
                value="Owner" label="Owner" 
              />
              <FormControlLabel 
                control={<Radio sx={{ 
                  '&.Mui-checked': { color: theme.palette.custom.blue } 
                }} />} 
                value="Property Manager" label="Property Manager" 
              />
              <FormControlLabel 
                control={<Radio sx={{ 
                  '&.Mui-checked': { color: theme.palette.custom.blue } 
                }} />} 
                value="Third Party" label="Third Party" 
              />
            </RadioGroup>
          </Stack>

          <Stack spacing={-2}>
            {/* Receiver RadioGroup */}
            <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight }}>
              Receiver
            </Typography>
            <RadioGroup value={selectedReceiver} onChange={handleReceiverChange}>
              <FormControlLabel 
                control={<Radio sx={{ 
                  '&.Mui-checked': { color: theme.palette.custom.blue } 
                }} />} 
                value="Tenant" label="Tenant" 
                disabled={selectedPayer === "Tenant"} 
              />
              <FormControlLabel 
                control={<Radio sx={{ 
                  '&.Mui-checked': { color: theme.palette.custom.blue } 
                }} />} 
                value="Owner" label="Owner" 
                disabled={selectedPayer === "Owner"} 
              />
              <FormControlLabel 
                control={<Radio sx={{ 
                  '&.Mui-checked': { color: theme.palette.custom.blue } 
                }} />} 
                value="Property Manager" label="Property Manager" 
                disabled={selectedPayer === "Property Manager"} 
              />
              <FormControlLabel 
                control={<Radio sx={{ 
                  '&.Mui-checked': { color: theme.palette.custom.blue } 
                }} />} 
                value="Third Party" label="Third Party" 
                disabled={selectedPayer === "Third Party"} 
              />
            </RadioGroup>
          </Stack>

            {/* Add Receipt button on the same row */}
            <Stack direction="row" alignItems="center">
              <Typography sx={{ color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight, marginRight: 2 }}>Add Receipt</Typography>
              <IconButton sx={{ backgroundColor: "white", width: 70, height: 70, borderRadius: 0 }}>
                <img src={File_dock_add}></img>
              </IconButton>
            </Stack>
          </Box>

          <Button
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: theme.palette.custom.blue,
              color: theme.typography.secondary.white,
              fontWeight: theme.typography.primary.fontWeight,
            }}
            onClick={handleExpenseChange}
          >
            {edit ? "Edit" : "+ Add"} Revenue
          </Button>
          {/* </form> */}
        </Paper>
      </ThemeProvider>
  );
};
export default AddRevenue;
