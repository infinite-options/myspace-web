import { useNavigate } from 'react-router';
import React, { useEffect, useState, useRef, useContext } from 'react';
import {
	ThemeProvider,
	Box,
	Paper,
	Stack,
	Typography,
	Button,
	Avatar,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	DialogContentText,
	TextField,
	Radio,
	RadioGroup,
	FormControlLabel,
	Select,
	MenuItem,
	Grid,
	ImageList,
	ImageListItem,
  Checkbox,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useUser } from '../../../contexts/UserContext';
import theme from '../../../theme/theme';
import { DataGrid } from "@mui/x-data-grid";

// import ImageCarousel from '../../ImageCarousel';
import defaultHouseImage from '../../Property/defaultHouseImage.png';
import ChatIcon from '@mui/icons-material/Chat';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import { isValidDate } from '../../../utils/dates';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ReactComponent as CalendarIcon } from '../../../images/datetime.svg';
import dayjs from 'dayjs';
import IconButton from '@mui/material/IconButton';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
// import { DatePicker } from "@mui/x-date-pickers";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import APIConfig from '../../../utils/APIConfig';
import Documents from '../../Leases/Documents';
import { FeesDataGrid } from '../../Property/PMQuotesRequested';
import ManagementContractContext from '../../../contexts/ManagementContractContext';
import ListsContext from '../../../contexts/ListsContext';
import GenericDialog from '../../GenericDialog';
import { InputAdornment } from '@material-ui/core';
// import { gridColumnsTotalWidthSelector } from '@mui/x-data-grid';
// dhyey

//standard textfield style 

const textFieldInputProps = {  
  sx: {
    border: 'none',
    width: '100%',    
    height: '40px',
    fontFamily: 'inherit',
    fontWeight: 'inherit',
    color: '#3D5CAC',
    opacity: '1',
    paddingLeft: '2px',
    borderRadius: '5px',
    backgroundColor: '#FFFFFF',
  },
};

const textFieldSX = {
  width: '100%',
  "& .MuiInputBase-root": {
    borderRadius: "5px",    
    border: "1px solid #3D5CAC",
    // border: 'none',
  },              
  "& .MuiInputBase-root.Mui-focused": {
    borderColor: "#3D5CAC",
    border: "2px solid #3D5CAC"                
  },
  "& input": {
    padding: "5px",
    height: "40px",
    color: "#3D5CAC",
  },
  // "& .MuiFormControl-root": {
  //   width: '100%',
  // },
  // "& .MuiTextField-root": {
  //   width: '100%',
  // },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'white',
    },
    '&:hover fieldset': {
      borderColor: 'white',
    },
    '&.Mui-focused fieldset': {      
      border: 'none',
    },
  },
}

const datePickerSlotProps = {
  textField: {
    size: 'small',
    sx: {
      width: '100%',
      marginTop: '6px',
      height: '38px',
      fontSize: 24,
      backgroundColor: '#FFFFFF',
      borderRadius: '5px',
      border: '1px solid #3D5CAC',
      transition: 'border-color 0.3s',
      "& .MuiInputBase-root": {
        // borderRadius: '5px',
        borderColor: '#3D5CAC',                      
      },
      "&:hover .MuiInputBase-root": {
        borderColor: '#3D5CAC', // Change border color on hover
        
      },
      "& .MuiInputBase-root.Mui-focused": {
        borderColor: '#3D5CAC', // Change border color on focus                      
      },
      "& input": {
        padding: '0 10px',
        height: '38px',
        color: '#3D5CAC',
        // border: '1px solid #3D5CAC',
        // borderColor: '#3D5CAC',
        // borderRadius: '5px',                      
      },
      "& input:focus": {
        borderColor: '#3D5CAC',        

        // outline: 'none', // Remove the default outline
      },
      "& input:hover": {
        borderColor: '#3D5CAC', 
      },
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: 'white',
        },
        '&:hover fieldset': {
          borderColor: 'white',
        },
        '&.Mui-focused fieldset': {      
          // border: 'none',
          border: '1px solid #3D5CAC',
        },
      },

    },
  },
}

function TextInputField(props) {
	const inputStyle = {
		border: 'none',
		width: '100%',
		height: '40px',
		fontFamily: 'inherit',
		fontWeight: 'inherit',
		color: '#3D5CAC',
		opacity: '1',
		paddingLeft: '5px',
		borderRadius: '5px',
	};

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'row',
				alignItems: 'center',
				marginBottom: '7px',
				width: '100%',
			}}
		>
			<input
				type="text"
				style={inputStyle}
				name={props.name}
				placeholder={props.placeholder}
				value={props.value}
				onChange={props.onChange}
			/>
		</Box>
	);
}

function AddFeeDialog({ open, handleClose, onAddFee, }) {	
	const { getList, } = useContext(ListsContext);	
	const feeBases = getList("basis");
	const feeFrequencies = getList("frequency");	
	const [feeName, setFeeName] = useState('');	  

	// console.log("feeBases from Context - ", feeBases);

	// useEffect(() => {
	// 	console.log('FEE Name: ', feeName);
	// }, [feeName]);

	const [feeType, setFeeType] = useState('PERCENT');
	// useEffect(() => {
	// 	console.log('FEE TYPE: ', feeType);
	// }, [feeType]);

	const [isPercentage, setIsPercentage] = useState(true);
	// useEffect(() => {
	// 	console.log('IS PERCENTAGE?: ', isPercentage);
	// }, [isPercentage]);

	const [percentage, setPercentage] = useState('0');
	// useEffect(() => {
	// 	console.log('PERCENTAGE: ', percentage);
	// }, [percentage]);

	const [isFlatRate, setIsFlatRate] = useState(false);
	// useEffect(() => {
	// 	console.log('IS FLAT RATE?: ', isFlatRate);
	// }, [isFlatRate]);

	const [feeAmount, setFlatRate] = useState('0');
	// useEffect(() => {
	// 	console.log('FEE TYPE: ', feeAmount);
	// }, [feeAmount]);

	const [feeFrequency, setFeeFrequency] = useState('One Time');
	// useEffect(() => {
	// 	console.log('FEE FREQUENCY: ', feeFrequency);
	// }, [feeFrequency]);

	const [feeAppliedTo, setFeeAppliedTo] = useState('');
	// useEffect(() => {
	// 	console.log('FEE APPLIED TO: ', feeAppliedTo);
	// }, [feeAppliedTo]);

	const handleFeeTypeChange = (event) => {
		setFeeType(event.target.value);
		// console.log("FEE TYPE SELECTED", event.target.value);
		// console.log('FEE TYPE: ', selectedFeeType);		
	};

	const handleFrequencyChange = (event) => {
		setFeeFrequency(event.target.value);
	};

	const handleAppliedToChange = (event) => {
		setFeeAppliedTo(event.target.value);
	};

	const handleAddFee = (event) => {
		event.preventDefault();

		console.log('FORM SUBMITTED ');
		console.log('feeName:', feeName);
		console.log('feeFrequency:', feeFrequency);
		console.log('feeType:', feeType);
		console.log('Is percentage?:', isPercentage);
		console.log('percentage:', percentage);
		console.log('Is feeAmount?:', isFlatRate);
		console.log('feeAmount:', feeAmount);
		console.log('feeAppliedTo:', feeAppliedTo);

		const newFee = {
			fee_name: feeName,
			fee_type: feeType,
			frequency: feeFrequency,
			of: feeAppliedTo,
			...(feeType === 'PERCENT' && { charge: percentage }),
			...(feeType === 'FLAT-RATE' && { charge: feeAmount }),
		};

		onAddFee(newFee);
		handleClose();
	};

	return (
		<form onSubmit={handleAddFee}>
			<Dialog
				open={open}
				onClose={handleClose}				
				maxWidth="xl"
				sx={{
					'& .MuiDialog-paper': {
						width: '60%',
						maxWidth: 'none',
					},
				}}
			>
				<Box
					sx={{
						width: '100%',
						display: 'flex',
						flexDirection: 'row',
						justifyContent: 'center',
						fontSize: '15px',
						fontWeight: 'bold',
						padding: '5px',
						color: '#3D5CAC',
					}}
				>
					Management Fees
				</Box>
				<Box
					sx={{
						width: '100%',
						display: 'flex',
						flexDirection: 'row',

						fontSize: '15px',
						fontWeight: 'bold',
						padding: '5px',
						color: '#3D5CAC',
					}}
				>
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'space-between',
							fontSize: '13px',
							fontWeight: 'bold',
							padding: '5px',
							color: '#3D5CAC',
						}}
					>
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'column',
								marginRight: '50px',
							}}
						>
							<Box>Fee Name</Box>							
							<TextField
								name="fee_name"
								placeholder=""
								value={feeName}
								onChange={(event) => {
									setFeeName(event.target.value);
								}}
								InputProps={{
									sx: {
										backgroundColor: '#D6D5DA',
										height: '40px',
									},
								}}
							/>
						</Box>
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'column',
							}}
						>
							<Box>Frequency</Box>							
							<Select
								value={feeFrequency}
								label="Frequency"
								onChange={handleFrequencyChange}
								sx={{
									backgroundColor: '#D6D5DA',
									height: '40px',
									width: '200px', // Adjust the width as needed
									padding: '8px', // Adjust the padding as needed
								}}
							>
								{
									feeFrequencies?.map( (freq, index) => (
										<MenuItem key={index} value={freq.list_item}>{freq.list_item}</MenuItem>
									) )
								}
							</Select>
						</Box>
					</Box>
				</Box>
				<Box
					sx={{
						width: '100%',
						display: 'flex',
						flexDirection: 'row',
						fontSize: '13px',
						fontWeight: 'bold',
						padding: '15px',
						color: '#3D5CAC',
					}}
				>
					<RadioGroup
						row
						aria-label="fee-type-group-label"
						name="fee-type-radio-buttons-group"
						value={feeType}
						onChange={handleFeeTypeChange}
					>
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'column',
							}}
						>
							<FormControlLabel
								value="PERCENT"
								control={<Radio sx={{ '&.Mui-checked': { color: '#3D5CAC' } }} />}
								label="Percent"
							/>							
							{feeType === 'PERCENT' && (
								<Box>
									<TextField
										value={percentage}
										label=""
										variant="outlined"										
										InputProps={{
											sx: {
												backgroundColor: '#D6D5DA',
												width: '60px',
												height: '40px',
											},
										}}
										onChange={(event) => {
											setPercentage(event.target.value);
										}}
									/>
								</Box>
							)}
						</Box>

						<Box
							sx={{
								display: 'flex',
								flexDirection: 'column',
							}}
						>
							<FormControlLabel
								value="FLAT-RATE"
								control={<Radio sx={{ '&.Mui-checked': { color: '#3D5CAC' } }} />}
								label="Flat Rate"
							/>
							<Box sx={{ width: '60px', height: '40px' }}></Box>
						</Box>
						{feeType === 'FLAT-RATE' && (
							<Box
								sx={{
									display: 'flex',
									flexDirection: 'column',
									paddingLeft: '20px',
								}}
							>
								Amount
								<TextField
									name="flat-rate"
									value={feeAmount}
									placeholder=""
									label=""
									variant="outlined"
									

									InputProps={{
										sx: {
											backgroundColor: '#D6D5DA',
											width: '100px',
											height: '40px',
										},
									}}
									onChange={(event) => {
										setFlatRate(event.target.value);
									}}
								/>
							</Box>
						)}
						{feeType === 'PERCENT' && (
							<Box
								sx={{
									display: 'flex',
									flexDirection: 'column',
									paddingLeft: '20px',
									height: '40px',
								}}
							>
								Applied To
								<Select
									value={feeAppliedTo}
									label="Applied To"
									onChange={handleAppliedToChange}
									sx={{
										backgroundColor: '#D6D5DA',
										height: '40px',
										width: '200px', // Adjust the width as needed
										padding: '8px', // Adjust the padding as needed
									}}
								>
									{/* <MenuItem value={'Gross Rent'}>Gross Rent</MenuItem>
									<MenuItem value={'Utility Bill'}>Utility Bill</MenuItem>
									<MenuItem value={'Maintenance Bill'}>Maintenance Bill</MenuItem> */}
									{
										feeBases?.map( (basis, id) => (
											<MenuItem key={id} value={basis.list_item}>{basis.list_item}</MenuItem>
										))
									}
								</Select>
							</Box>
						)}
					</RadioGroup>
				</Box>
				<DialogActions>
					<Button
						onClick={handleClose}
						sx={{
							'&:hover': {
								backgroundColor: '#fff',
							},
							color: '#160449',
						}}
					>
						Close
					</Button>
					<Button
						type="submit"
						onClick={handleAddFee}
						sx={{
							'&:hover': {
								backgroundColor: '#fff',
							},
							color: '#160449',
						}}
					>
						Add Fee
					</Button>
				</DialogActions>
			</Dialog>
		</form>
	);
}

function EditFeeDialog({ open, handleClose, onEditFee, feeIndex, fees }) {
	const { getList, } = useContext(ListsContext);	
	const feeBases = getList("basis");	
	const feeFrequencies = getList("frequency");	
	const [feeName, setFeeName] = useState(fees[feeIndex].fee_name);
	// useEffect(() => {
	// 	console.log('FEE Name: ', feeName);
	// }, [feeName]);

	const [feeType, setFeeType] = useState(fees[feeIndex].fee_type);
	// useEffect(() => {
	// 	console.log('FEE TYPE: ', feeType);
	// }, [feeType]);

	const [isPercentage, setIsPercentage] = useState(fees[feeIndex].isPercentage);
	// useEffect(() => {
	// 	console.log('IS PERCENTAGE?: ', isPercentage);
	// }, [isPercentage]);

	const [percentage, setPercentage] = useState(fees[feeIndex].charge);
	// useEffect(() => {
	// 	console.log('PERCENTAGE: ', percentage);
	// }, [percentage]);

	const [isFlatRate, setIsFlatRate] = useState(fees[feeIndex].isFlatRate);
	// useEffect(() => {
	// 	console.log('IS FLAT RATE?: ', isFlatRate);
	// }, [isFlatRate]);

	const [feeAmount, setFlatRate] = useState(fees[feeIndex].charge);
	// useEffect(() => {
	// 	console.log('FEE TYPE: ', feeAmount);
	// }, [feeAmount]);

	const [feeFrequency, setFeeFrequency] = useState(fees[feeIndex].frequency);
	// useEffect(() => {
	// 	console.log('FEE FREQUENCY: ', feeFrequency);
	// }, [feeFrequency]);

	const [feeAppliedTo, setFeeAppliedTo] = useState(fees[feeIndex].of);
	// useEffect(() => {
	// 	console.log('FEE APPLIED TO: ', feeAppliedTo);
	// }, [feeAppliedTo]);

	const handleFeeTypeChange = (event) => {
		setFeeType(event.target.value);
		// console.log('FEE TYPE: ', selectedFeeType);
		if (event.target.value === 'PERCENT') {
			setIsPercentage(true);
			setIsFlatRate(false);
		} else {
			setIsFlatRate(true);
			setIsPercentage(false);
		}
	};

	const handleFrequencyChange = (event) => {
		setFeeFrequency(event.target.value);
	};

	const handleAppliedToChange = (event) => {
		setFeeAppliedTo(event.target.value);
	};

	const handleEditFee = (event) => {
		event.preventDefault();

		console.log('FORM SUBMITTED ');
		console.log('feeName:', feeName);
		console.log('feeFrequency:', feeFrequency);
		console.log('feeType:', feeType);
		console.log('Is percentage?:', isPercentage);
		console.log('percentage:', percentage);
		console.log('Is feeAmount?:', isFlatRate);
		console.log('feeAmount:', feeAmount);
		console.log('feeAppliedTo:', feeAppliedTo);

		// const newFee = {
		//     fee_name: feeName,
		//     fee_type: feeType,
		//     frequency: feeFrequency,
		//     isPercentage: isPercentage,
		//     ...(isPercentage && { charge: percentage }),
		//     ...(isPercentage && { of: feeAppliedTo }),
		//     isFlatRate: isFlatRate,
		//     ...(isFlatRate && { charge: feeAmount }),
		// }
		// const newFee = {
		// 	fee_name: feeName,
		// 	fee_type: feeType,
		// 	frequency: feeFrequency,
		// 	...(feeType === 'PERCENT' && { charge: percentage }),
		// 	...(feeType === 'PERCENT' && { of: feeAppliedTo }),
		// 	...(feeType === 'FLAT-RATE' && { charge: feeAmount }),
		// };
		const newFee = {
			fee_name: feeName,
			fee_type: feeType,
			frequency: feeFrequency,
			of: feeAppliedTo,
			...(feeType === 'PERCENT' && { charge: percentage }),
			...(feeType === 'FLAT-RATE' && { charge: feeAmount }),
		};
		onEditFee(newFee, feeIndex); // pass index also
		handleClose();
	};

	return (
		<form onSubmit={handleEditFee}>
			<Dialog
				open={open}
				onClose={handleClose}
				// sx = {{
				//     width: '100%',
				//     maxWidth: 'none',
				// }}
				maxWidth="xl"
				sx={{
					'& .MuiDialog-paper': {
						width: '60%',
						maxWidth: 'none',
					},
				}}
			>
				<Box
					sx={{
						width: '100%',
						display: 'flex',
						flexDirection: 'row',
						justifyContent: 'center',
						fontSize: '15px',
						fontWeight: 'bold',
						padding: '5px',
						color: '#3D5CAC',
					}}
				>
					Management Fees
				</Box>
				<Box
					sx={{
						width: '100%',
						display: 'flex',
						flexDirection: 'row',

						fontSize: '15px',
						fontWeight: 'bold',
						padding: '5px',
						color: '#3D5CAC',
					}}
				>
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'space-between',
							fontSize: '13px',
							fontWeight: 'bold',
							padding: '5px',
							color: '#3D5CAC',
						}}
					>
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'column',
								marginRight: '50px',
							}}
						>
							<Box>Fee Name</Box>
							{/* <TextInputField name="fee_name" placeholder="" value={""} onChange={console.log("input changed")}>Fee Name</TextInputField> */}
							<TextField
								name="fee_name"
								placeholder=""
								value={feeName}
								onChange={(event) => {
									setFeeName(event.target.value);
								}}
								InputProps={{
									sx: {
										backgroundColor: '#D6D5DA',
										height: '40px',
									},
								}}
							/>
						</Box>
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'column',
							}}
						>
							<Box>Frequency</Box>
							{/* <TextInputField 
                                    name="fee_name"
                                    placeholder=""
                                    value={""} 
                                    onChange={console.log("input changed")}
                                    sx={{ backgroundColor: '#D6D5DA' }}
                                >
                                    Fee Name
                                </TextInputField> */}
							{/* <TextField
                                    name="frequency"
                                    placeholder=""
                                    value={""}
                                    onChange={console.log("input changed")}
                                    InputProps={{
                                        sx: {
                                            backgroundColor: '#D6D5DA',
                                            height: '40px',
                                        },
                                    }}
                                /> */}
							<Select
								value={feeFrequency}
								label="Frequency"
								onChange={handleFrequencyChange}
								sx={{
									backgroundColor: '#D6D5DA',
									height: '40px',
									width: '200px', // Adjust the width as needed
									padding: '8px', // Adjust the padding as needed
								}}
							>								
								{
									feeFrequencies?.map( (freq, index) => (
										<MenuItem key={index} value={freq.list_item}>{freq.list_item}</MenuItem>
									) )
								}
							</Select>
						</Box>
					</Box>
				</Box>
				<Box
					sx={{
						width: '100%',
						display: 'flex',
						flexDirection: 'row',
						fontSize: '13px',
						fontWeight: 'bold',
						padding: '15px',
						color: '#3D5CAC',
					}}
				>
					<RadioGroup
						row
						aria-label="fee-type-group-label"
						name="fee-type-radio-buttons-group"
						value={feeType}
						onChange={handleFeeTypeChange}
					>
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'column',
							}}
						>
							<FormControlLabel
								value="PERCENT"
								control={<Radio sx={{ '&.Mui-checked': { color: '#3D5CAC' } }} />}
								label="Percent"
							/>
							{/* <TextField value={percentage} label="" variant="outlined" onChange={(event) => {setPercentage(event.target.value)}}/> */}
							{feeType === 'PERCENT' && (
								<Box>
									<TextField
										value={percentage}
										label=""
										variant="outlined"
										// sx={{
										//     width: '45px',
										//     height: '3px',
										// }}
										InputProps={{
											sx: {
												backgroundColor: '#D6D5DA',
												width: '100px',
												height: '40px',
											},
										}}
										onChange={(event) => {
											setPercentage(event.target.value);
										}}
									/>
								</Box>
							)}
						</Box>

						<Box
							sx={{
								display: 'flex',
								flexDirection: 'column',
							}}
						>
							<FormControlLabel
								value="FLAT-RATE"
								control={<Radio sx={{ '&.Mui-checked': { color: '#3D5CAC' } }} />}
								label="Flat Rate"
							/>
							<Box sx={{ width: '60px', height: '40px' }}></Box>
						</Box>
						{feeType === 'FLAT-RATE' && (
							<Box
								sx={{
									display: 'flex',
									flexDirection: 'column',
									paddingLeft: '20px',
								}}
							>
								Amount
								<TextField
									name="flat-rate"
									value={feeAmount}
									placeholder=""
									label=""
									variant="outlined"
									// sx={{
									//     width: '45px',
									//     height: '3px',
									// }}

									InputProps={{
										sx: {
											backgroundColor: '#D6D5DA',
											width: '60px',
											height: '20px',
										},
									}}
									onChange={(event) => {
										setFlatRate(event.target.value);
									}}
								/>
							</Box>
						)}
						{feeType === 'PERCENT' && (
							<Box
								sx={{
									display: 'flex',
									flexDirection: 'column',
									paddingLeft: '20px',
								}}
							>
								Applied To								
								<Select
									value={feeAppliedTo}
									label="Applied To"
									onChange={handleAppliedToChange}
									sx={{
										backgroundColor: '#D6D5DA',
										height: '40px',
										width: '200px', // Adjust the width as needed
										padding: '8px', // Adjust the padding as needed
									}}
								>									
									{
										feeBases?.map( (basis, id) => (
											<MenuItem key={id} value={basis.list_item}>{basis.list_item}</MenuItem>
										))
									}
								</Select>
							</Box>
						)}
					</RadioGroup>
				</Box>
				<DialogActions>
					<Button
						sx={{
							'&:hover': {
								backgroundColor: '#3D5CAC',
							},
							backgroundColor: '#9EAED6',
							color: '#160449',
							textTransform: 'none',
						}}
						onClick={handleClose}
					>
						Close
					</Button>
					<Button
						sx={{
							'&:hover': {
								backgroundColor: '#3D5CAC',
							},
							backgroundColor: '#9EAED6',
							color: '#160449',
							textTransform: 'none',
						}}
						type="submit"
						onClick={handleEditFee}
					>
						Save Fee
					</Button>
				</DialogActions>
			</Dialog>
		</form>
	);
}

function EndContractDialog({ open, handleClose, onEndContract, noticePeriod, }) {	

  const noticePeriodDays = parseInt(noticePeriod, 10);
  const minEndDate = dayjs().add(noticePeriodDays, 'day')
	
  const [earlyEndDate, setEarlyEndDate] = useState(minEndDate);
	

	

	const handleEndContract = (event) => {
		event.preventDefault();
		
		onEndContract(earlyEndDate);
		handleClose();
	};

	return (
		<form 
      onSubmit={handleEndContract}
    >
			<Dialog
				open={open}
				onClose={handleClose}				
				maxWidth="xl"
				sx={{
					'& .MuiDialog-paper': {
						width: '60%',
						maxWidth: 'none',
					},
				}}
			>
        <DialogTitle sx={{ justifyContent: 'center',}}>        
              End Current Contract        
        </DialogTitle>
        <DialogContent>
          <Grid container>
            <Grid item xs={12}>
              <Typography sx={{width: 'auto',}}>
                Are you sure you want to end this contract?
              </Typography>
            </Grid>
            <Grid container item xs={3} sx={{marginTop: '20px', }}>
              <Grid item xs={12}>
                <Typography sx={{fontWeight: 'bold', color: '#3D5CAC'}}>
                  End Date
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={earlyEndDate}
                    minDate={minEndDate}
                    onChange={(v) => setEarlyEndDate(v)}
                    slots={{
                      openPickerIcon: CalendarIcon,
                    }}
                    slotProps={datePickerSlotProps}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </Grid>

        </DialogContent>
				
				<DialogActions>
					<Button
						onClick={handleClose}
						sx={{
							'&:hover': {
								backgroundColor: '#fff',
							},
							color: '#160449',
						}}
					>
						No
					</Button>
					<Button
						type="submit"
						onClick={handleEndContract}
						sx={{
							'&:hover': {
								backgroundColor: '#fff',
							},
							color: '#160449',
						}}
					>
						Yes
					</Button>
				</DialogActions>
			</Dialog>
		</form>
	);
}

const PropertyCard = (props) => {
  const navigate = useNavigate();
  const { getProfileId } = useUser();
  const { defaultContractFees, allContracts, currentContractUID, currentContractPropertyUID, isChange, setIsChange, fetchContracts} = useContext(ManagementContractContext);  
  console.log("PropertyCard - props - ", props);
  

  const [propertyData, setPropertyData] = useState(props.data);
//   const timeDiff = props.timeDifference;
//   const contractBusinessID = props.contractBusinessID;
//   const [contractPropertyID, setContractPropertyID] = useState(props.contractPropertyID);
  const today = dayjs(new Date()); // Convert new Date() to Day.js object

  // console.log("--debug-- PropertyCard props", props);

  const [showAddFeeDialog, setShowAddFeeDialog] = useState(false);
  const [showEditFeeDialog, setShowEditFeeDialog] = useState(false);
  const [showAddContactDialog, setShowAddContactDialog] = useState(false);
  const [showEditContactDialog, setShowEditContactDialog] = useState(false);
  const [showEndContractDialog, setShowEndContractDialog] = useState(false);
  const [showMissingFileTypePrompt, setShowMissingFileTypePrompt] = useState(false);
  const [showInvalidEndDatePrompt, setShowInvalidEndDatePrompt] = useState(false);
  const [showInvalidStartDatePrompt, setShowInvalidStartDatePrompt] = useState(false);

  const [indexForEditFeeDialog, setIndexForEditFeeDialog] = useState(false);
  const [indexForEditContactDialog, setIndexForEditContactDialog] = useState(false);
  

//   const [allContracts, setAllContracts] = useState(contracts); //from context
//   const [businessProfile, setBusinessProfile] = useState(null);

  //Contract Details
  const [contractUID, setContractUID] = useState(currentContractUID);
  const [contractName, setContractName] = useState("");
  const [contractStartDate, setContractStartDate] = useState(dayjs());
  const [contractEndDate, setContractEndDate] = useState(dayjs());
  const [contractEndNotice, setContractEndNotice] = useState(30);
  const [continueM2M, setContinueM2M] = useState(true);
  const [contractStatus, setContractStatus] = useState(null);
  const [contractFees, setContractFees] = useState([]);
//   const [defaultContractFees, setDefaultContractFees] = useState([]);
  const [contractFiles, setContractFiles] = useState([]);
  const [previouslyUploadedDocs, setPreviouslyUploadedDocs] = useState([]);
  const [contractDocument, setContractDocument] = useState(null);
  const [contractFileTypes, setContractFileTypes] = useState([]);
  const [contractAssignedContacts, setContractAssignedContacts] = useState([]);
  const [propertyOwnerName, setPropertyOwnerName] = useState("");
  const [deletedDocsUrl, setDeletedDocsUrl] = useState([]);
  const [documentDetails, setDocumentDetails] = useState([]);
  const [isPreviousFileChange, setIsPreviousFileChange] = useState(false)
  const[contactRowsWithId, setContactRowsWithId] = useState([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogSeverity, setDialogSeverity] = useState("info");

  const openDialog = (title, message, severity) => {
    setDialogTitle(title);  // Set the dialog title
    setDialogMessage(message);  // Set the dialog message
    setDialogSeverity(severity);  // Optionally set the severity for styling
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };


  const setContractDetails = () => {
	if (allContracts !== null && allContracts !== undefined) {
	  const contractData = allContracts?.find((contract) => contract.contract_uid === currentContractUID);
	//   console.log("setContractDetails - contractData - ", contractData);	  
	  // setContractUID(contractData["contract_uid"]? contractData["contract_uid"] : "");
	  if (contractData) {
		setContractName(contractData["contract_name"] ? contractData["contract_name"] : "");
		setContractStartDate(contractData["contract_start_date"] ? dayjs(contractData["contract_start_date"]) : dayjs());
		// setContractEndDate(contractData["contract_end_date"] ? dayjs(contractData["contract_end_date"]) : contractStartDate.add(1, "year").subtract(1, "day"));
		setContractStatus(contractData["contract_status"] ? contractData["contract_status"] : "");
    setContractEndNotice(contractData["contract_end_notice_period"] ? contractData["contract_end_notice_period"] : "");
    setContinueM2M(contractData["contract_m2m"] && contractData["contract_m2m"] === 1 ? true : false);

		// setContractAssignedContacts(contractData["contract_assigned_contacts"] ? JSON.parse(contractData["contract_assigned_contacts"]) : []);
		const defaultContacts = [];
		const managerContact = {
		  contact_first_name: contractData["business_name"],
		  contact_last_name: "",
		  contact_email: contractData["business_email"],
		  contact_phone_number: contractData["business_phone_number"],
		};
		defaultContacts.push(managerContact);
		const assignedContacts = contractData["contract_assigned_contacts"];
		if (assignedContacts && assignedContacts.length) {
		  setContractAssignedContacts(JSON.parse(contractData["contract_assigned_contacts"]));
		} else {
		  setContractAssignedContacts(defaultContacts);
		}

		const fees = JSON.parse(contractData["contract_fees"])? JSON.parse(contractData["contract_fees"]) : [];
		// setContractFees(fees);

		// console.log("---dhyey--- contract fees - ", contractFees, "fees is - ", fees);
		if(fees?.length === 0 && contractData["contract_status"] === "NEW"){
			const feesWithoutId = defaultContractFees.map(({ id, ...rest }) => rest);
			setContractFees([...feesWithoutId]);
		}else{
			setContractFees(fees);
		}
		// } else {
		// 	setContractFees(defaultContractFees);
		// }
		
		const oldDocs = contractData["contract_documents"] ? JSON.parse(contractData["contract_documents"]) : [];
		setPreviouslyUploadedDocs(oldDocs);
		const contractDoc = oldDocs?.find((doc) => doc.type === "contract");
		if (contractDoc) {
		  setContractDocument(contractDoc);
		}
		setPropertyOwnerName(`${contractData["owner_first_name"]} ${contractData["owner_last_name"]}`);
	  }
	}
};	

  useEffect(() => {
	setContractFiles([])
	setContractFileTypes([])
	setIsPreviousFileChange(false)
	
	
    setContractDetails();
	console.log("contract files - ", contractFiles, " isPReviousChange - ", isPreviousFileChange);

	//debug
	const contractData = allContracts?.find((contract) => contract.contract_uid === currentContractUID);
	// console.log("946 - contractData - ", contractData);
	

  }, [currentContractUID, allContracts, defaultContractFees]);

  useEffect(() => {
	const contractData = allContracts?.find((contract) => contract.contract_uid === currentContractUID);
		  // console.log("setData - CONTRACT - ", contractData);
		  // setContractUID(contractData["contract_uid"]? contractData["contract_uid"] : "");
	if (contractData) {
		setContractEndDate(contractData["contract_end_date"] ? dayjs(contractData["contract_end_date"]) : contractStartDate.add(1, "year").subtract(1, "day"));
	}
  }, [contractStartDate]);

  useEffect(() => {
	console.log("props.data - ", props.data)
    setPropertyData(props.data);
  }, [props.data]);

  useEffect(() => {
    if (isValidDate(contractStartDate.format("MM-DD-YYYY"))) {
      setShowInvalidStartDatePrompt(false);
    } else {
      setShowInvalidStartDatePrompt(true);
    }
  }, [contractStartDate]);

  useEffect(() => {
    if (isValidDate(contractEndDate.format("MM-DD-YYYY"))) {
      setShowInvalidEndDatePrompt(false);
    } else {
      setShowInvalidEndDatePrompt(true);
    }
  }, [contractEndDate]);

  useEffect(() => {
    // console.log("CONTRACT ASSIGNED CONTACTS - ", contractAssignedContacts);
  }, [contractAssignedContacts]);

  useEffect(()=>{
	// console.log("yess here ---- dhyey ---- ")
		if(isPreviousFileChange || contractFiles?.length > 0){
			setIsChange(true)
		}
  }, [isPreviousFileChange, contractFiles])



//   useEffect(() => {
    // console.log("DEFAULT CONTRACT FEES - ", defaultContractFees);
    // let JSONstring = JSON.stringify(defaultContractFees);
    // console.log("DEFAULT CONTRACT FEES JSON string- ", JSONstring);
	
	// console.log("contractFees.length - ", contractFees.length);
	// console.log("contractFees - ", contractFees);
//     if (!contractFees.length) {
//       setContractFees([...defaultContractFees]);
//     }	
//   }, [defaultContractFees, currentContractUID]);

  useEffect(() => {
	setImages(
		propertyData.property_images && JSON.parse(propertyData.property_images).length > 0
			? JSON.parse(propertyData.property_images)
			: [defaultHouseImage]
	)
  }, [propertyData]); 

  const saveContacts = async () => {    
    const formData = new FormData();	            
    let contractContactsJSONString = JSON.stringify(contractAssignedContacts);
    // console.log("Send Quote - contractContactsJSONString : ", contractContactsJSONString);        

    

    formData.append("contract_uid", currentContractUID);    
    formData.append("contract_assigned_contacts", contractContactsJSONString);
    
  	const url = `${APIConfig.baseURL.dev}/contracts`;
    // const url = `http://localhost:4000/contracts`;

    fetch(url, {
      method: "PUT",	
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        } else {
          // console.log("Data updated successfully");
		      setIsChange(false)		      
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });

  }

//   When contacts change reassign contacts to contacts array
  useEffect(()=>{
    if(isChange === true){
      saveContacts();
    }
    
	  const temp = contractAssignedContacts.map((row, index) => ({
      ...row,
      id: row.id ? index : index,
    }));

	  setContactRowsWithId(temp);

  },[contractAssignedContacts])
//   useEffect(() => {
//     // console.log("CONTRACT FEES - ", contractFees);
//     // let JSONstring = JSON.stringify(contractFees);
//     // console.log("CONTRACT FEES JSON string- ", JSONstring);
//   }, [contractFees]);

//   useEffect(() => {
//     // console.log("CONTRACT FILE TYPES - ", contractFileTypes);
//     // let JSONstring = JSON.stringify(contractFileTypes);
//     // console.log("CONTRACT FILE TYPES JSON string- ", JSONstring);	
//   }, [contractFileTypes]);

//   useEffect(() => {
//     // console.log("PREVIOUSLY UPLOADED DOCS - ", previouslyUploadedDocs);
//     // let JSONstring = JSON.stringify(previouslyUploadedDocs);
//     // console.log("PREVIOUSLY UPLOADED DOCS JSON string- ", JSONstring);
//   }, [previouslyUploadedDocs]);

  const handleAddFee = (newFee) => {
    // const newFee = {
    //     // Add properties for the new fee item here
    //     feeName: 'New Fee',
    //     feeAmount: 0,
    // };
	// console.log("---dhyey--- inside adding fee old fee - ", contractFees, " new fee - ", newFee)
	setIsChange(true)
    setContractFees((prevContractFees) => [...prevContractFees, newFee]);
  };

  const handleEditFee = (newFee, index) => {
    // const newFee = {
    //     // Add properties for the new fee item here
    //     feeName: 'New Fee',
    //     feeAmount: 0,
    // };
    // setContractFees((prevContractFees) => [...prevContractFees, newFee]);
    // console.log("IN handleEditFee of PropertyCard");
    // console.log(newFee, index);
	  setIsChange(true)
    setContractFees((prevContractFees) => {
      const updatedContractFees = prevContractFees.map((fee, i) => {
        if (i === index) {
          return newFee;
        }
        return fee;
      });
      return updatedContractFees;
    });
  };

  const handleDeleteFee = (index, event) => {
    // console.log("Contract Fees", contractFees);
	setIsChange(true)
    setContractFees((prevFees) => {
      const feesArray = Array.from(prevFees);
      feesArray.splice(index, 1);
      return feesArray;
    });
    event.stopPropagation();
  };

  const handleOpenAddFee = () => {
    setShowAddFeeDialog(true);
  };

  const handleCloseAddFee = () => {
    setShowAddFeeDialog(false);
  };

  const handleOpenEditFee = (feeIndex) => {
    setShowEditFeeDialog(true);
    // console.log("EDITING FEE, Index", feeIndex);
    setIndexForEditFeeDialog(feeIndex);
  };

  const handleCloseEditFee = () => {
    setShowEditFeeDialog(false);
  };

  const handleCloseAddContact = () => {
    setShowAddContactDialog(false);
  };

  const handleOpenEditContact = (contactIndex) => {
    setIndexForEditContactDialog(contactIndex);
    setShowEditContactDialog(true);
    // console.log("EDITING CONTACT, Index", contactIndex);
  };

  const handleCloseEditContact = () => {
    setShowEditContactDialog(false);
  };

  const handleContractNameChange = (event) => {
	setIsChange(true)
    setContractName(event.target.value);
  };

  const handleStartDateChange = (v) => {
	setIsChange(true)
    setContractStartDate(v);
    if (contractEndDate < v) setContractEndDate(v);
  };

  const handleEndDateChange = (v) => {
	setIsChange(true)
	if (v.isBefore(contractStartDate)) {
		setShowInvalidEndDatePrompt(true);
	}
	else {
		setShowInvalidEndDatePrompt(false);
		setContractEndDate(v);
	}
	// setContractEndDate(v);
  };

  // const handleContractFeesChange = (feesList) => {
  //     console.log("In handleContractFeesChange()");
  //     //setContractFees() // map to the correct keys
  // }

  const handleNoticePeriodChange = (e) => {
    setIsChange(true)
    setContractEndNotice(e.target.value);    
  }            

  const handleAddContact = (newContact) => {
    // console.log("newContact - ", newContact);
	  setIsChange(true)
    setContractAssignedContacts((prevContractContacts) => [...prevContractContacts, newContact]);
  };
  
  const handleEditContact = (newContact, index) => {
    // console.log("In handleEditContact of PropertyCard");
    // console.log(newContact, index);
	  setIsChange(true)
    setContractAssignedContacts((prevContacts) => {
      const updatedContacts = prevContacts.map((contact, i) => {
        if (i === index) {
          return newContact;
        }
        return contact;
      });
      return updatedContacts;
    });
  };

  const handleDeleteContact = (index, event) => {
    // console.log("Contract Assigned Contacts", contractAssignedContacts);
	setIsChange(true)
    setContractAssignedContacts((prevContacts) => {
      const contactsArray = Array.from(prevContacts);
      contactsArray.splice(index, 1);
      return contactsArray;
    });
    event.stopPropagation();
  };

  const sendPutRequest = (data) => {
    const url = `${APIConfig.baseURL.dev}/contracts`;
    // const url = `http://localhost:4000/contracts`;

	console.log(data)
    fetch(url, {
      method: "PUT",
	//   headers: {
	// 	"Content-Type": "application/json", // Ensure the server expects JSON
	//   },
	//   body: JSON.stringify(data),
      body: data,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        } else {
          // console.log("Data updated successfully");
          navigate("/managerDashboard");
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

//   const handleRemoveFile = (index) => {
//     setContractFiles((prevFiles) => {
//       const filesArray = Array.from(prevFiles);
//       filesArray.splice(index, 1);
//       return filesArray;
//     });
//     setContractFileTypes((prevTypes) => {
//       const typesArray = [...prevTypes];
//       typesArray.splice(index, 1);
//       return typesArray;
//     });
//   };

//   const handleDeletePrevUploadedFile = (doc_url, index) => {
// 	setDeletedDocsUrl(prevList => [...prevList, doc_url])
//     setPreviouslyUploadedDocs((prevFiles) => {
//       const filesArray = Array.from(prevFiles);
//       filesArray.splice(index, 1);
//       return filesArray;
//     });
//   };

  const handleDeclineOfferClick = () => {
    // console.log("Decline Offer Clicked");
    // let contractFeesJSONString = JSON.stringify(contractFees);
    // console.log("Decline Offer - contractFeesJSONString : ", contractFeesJSONString);
    // const data = {
    //     "contract_uid": contractUID,
    //     "contract_name": contractName,
    //     "contract_start_date": contractStartDate,
    //     "contract_end_date": contractEndDate,
    //     "contract_fees": contractFeesJSONString,
    //     "contract_status": "REFUSED"
    // };

    const formData = new FormData();
    formData.append("contract_uid", contractUID);
    formData.append("contract_status", "REFUSED");

    // console.log("Declined offer. Data sent - ", formData);

    sendPutRequest(formData);
  };

  const checkFileTypeSelected = () => {
    for (let i = 0; i < contractFiles.length; i++) {
      if (i >= contractFileTypes.length) {
        return false; // Return false if the index is out of bounds
      }
      const fileType = contractFileTypes[i];
      // console.log("FILE TYPE: ", fileType);
      if (!fileType || fileType.trim() === "") {
        return false;
      }
    }
    setShowMissingFileTypePrompt(false);
    return true;
  };

  const handleSendQuoteClick = () => {
    // console.log("Send Quote Clicked");
    const formData = new FormData();	
    
    const hasInvalidCharge = contractFees.some(fee => fee.charge === null || fee.charge === "");
    if(hasInvalidCharge){
      openDialog("Invalid Fee Charges", "Please enter valid charges for all fees.", "Error");
      return;
    }
    
    let contractFeesJSONString = JSON.stringify(contractFees);
    // console.log("Send Quote - contractFeesJSONString : ", contractFeesJSONString);
    let contractContactsJSONString = JSON.stringify(contractAssignedContacts);
    // console.log("Send Quote - contractContactsJSONString : ", contractContactsJSONString);
    // const data = {
    //     "contract_uid": contractUID,
    //     "contract_name": contractName,
    //     "contract_start_date": contractStartDate,
    //     "contract_end_date": contractEndDate,
    //     "contract_fees": contractFeesJSONString,
    //     "contract_status": "SENT"
    // };

    //Check here -- Abhinav

    if(deletedDocsUrl && deletedDocsUrl?.length !== 0){
      formData.append("delete_documents", JSON.stringify(deletedDocsUrl));
    }

    formData.append("contract_uid", currentContractUID);
    formData.append("contract_name", contractName);
    formData.append("contract_start_date", contractStartDate.format("MM-DD-YYYY"));
    formData.append("contract_end_date", contractEndDate.format("MM-DD-YYYY"));
    formData.append("contract_fees", contractFeesJSONString);
    formData.append("contract_status", "SENT");
    formData.append("contract_assigned_contacts", contractContactsJSONString);
    formData.append("contract_end_notice_period", contractEndNotice);
    formData.append("contract_m2m", continueM2M === true? 1 : 0);

    if(isPreviousFileChange){
      formData.append("contract_documents", JSON.stringify(previouslyUploadedDocs));
    }

    // formData.append("contract_documents_details", JSON.stringify(contractFileTypes));

    const endDateIsValid = isValidDate(contractEndDate.format("MM-DD-YYYY"));
    if (!isValidDate(contractEndDate.format("MM-DD-YYYY")) || !isValidDate(contractStartDate.format("MM-DD-YYYY"))) {
      return;
    }

    const hasMissingType = !checkFileTypeSelected();

    if (hasMissingType) {
      setShowMissingFileTypePrompt(true);
      return;
    }

    if (contractFiles && contractFiles?.length) {

      const documentsDetails = [];
      [...contractFiles].forEach((file, i) => {
		
		// console.log(JSON.stringify(file));
		

        formData.append(`file_${i}`, file);
        const fileType = contractFileTypes[i] || "";
		// formData.append("contract")
        const documentObject = {
          // file: file,
          fileIndex: i, //may not need fileIndex - will files be appended in the same order?
          fileName: file.name, //may not need filename
          contentType: fileType, // contentType = "contract or lease",  fileType = "pdf, doc"
        };
        documentsDetails.push(documentObject);
      });

      formData.append("contract_documents_details", JSON.stringify(documentsDetails));
    }

    // console.log("Quote sent. Data sent - ");
    // for (const pair of formData.entries()) {
    //   console.log(`${pair[0]}, ${pair[1]}`);
    // }

    // sendPutRequest(formData);
	const url = `${APIConfig.baseURL.dev}/contracts`;
    // const url = `http://localhost:4000/contracts`;

    fetch(url, {
      method: "PUT",
	//   headers: {
	// 	"Content-Type": "application/json", // Ensure the server expects JSON
	//   },
	//   body: JSON.stringify(data),
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        } else {
          // console.log("Data updated successfully");
		  setIsChange(false)
		  sendAnnouncement();
        //   navigate("/managerDashboard");
		  
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };


  const handleEndContractClick = (endDate) => {
    const formattedDate = endDate.format('MM-DD-YYYY');
    // console.log("handleEndContractClick - formattedDate - ", formattedDate);
    
    
    const formData = new FormData();	            
    
    formData.append("contract_uid", currentContractUID);    
    formData.append("contract_status", "ENDING");
    formData.append("contract_early_end_date", formattedDate);
    
    
  	const url = `${APIConfig.baseURL.dev}/contracts`;
    // const url = `http://localhost:4000/contracts`;

    fetch(url, {
      method: "PUT",	
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        } else {
          // console.log("Data updated successfully");
		      setIsChange(false)		      
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };
  
  const handleCreateNewContractClick = () => {    
	if(!isChange || isChange === false){
		return;
	}

    const formData = new FormData();
    let contractFeesJSONString = JSON.stringify(contractFees);
    let contractContactsJSONString = JSON.stringify(contractAssignedContacts);


	if(deletedDocsUrl && deletedDocsUrl?.length !== 0){
		formData.append("delete_documents", JSON.stringify(deletedDocsUrl));
	}
    
    formData.append("contract_name", contractName);
    formData.append("contract_start_date", contractStartDate.format("MM-DD-YYYY"));
    formData.append("contract_end_date", contractEndDate.format("MM-DD-YYYY"));
    formData.append("contract_fees", contractFeesJSONString);
    formData.append("contract_status", "SENT");
    formData.append("contract_assigned_contacts", contractContactsJSONString);
	formData.append("contract_business_id", getProfileId());
	formData.append("contract_property_ids", JSON.stringify([currentContractPropertyUID]));


	if(isPreviousFileChange){
		formData.append("contract_documents", JSON.stringify(previouslyUploadedDocs));
	}

	// formData.append("contract_documents_details", JSON.stringify(contractFileTypes));

    const endDateIsValid = isValidDate(contractEndDate.format("MM-DD-YYYY"));
    if (!isValidDate(contractEndDate.format("MM-DD-YYYY")) || !isValidDate(contractStartDate.format("MM-DD-YYYY"))) {
      return;
    }

    const hasMissingType = !checkFileTypeSelected();

    if (hasMissingType) {
      setShowMissingFileTypePrompt(true);
      return;
    }

    if (contractFiles && contractFiles?.length) {

      const documentsDetails = [];
      [...contractFiles].forEach((file, i) => {
		
		// console.log(JSON.stringify(file));
		

        formData.append(`file_${i}`, file);
        const fileType = contractFileTypes[i] || "";
		// formData.append("contract")
        const documentObject = {
          // file: file,
          fileIndex: i, //may not need fileIndex - will files be appended in the same order?
          fileName: file.name, //may not need filename
          contentType: fileType, // contentType = "contract or lease",  fileType = "pdf, doc"
        };
        documentsDetails.push(documentObject);
      });

      formData.append("contract_documents_details", JSON.stringify(documentsDetails));
    }

    // console.log("Quote sent. Data sent - ");
    // for (const pair of formData.entries()) {
    //   console.log(`${pair[0]}, ${pair[1]}`);
    // }

    // sendPutRequest(formData);
	const url = `${APIConfig.baseURL.dev}/contracts`;
    // const url = `http://localhost:4000/contracts`;

    fetch(url, {
      method: "POST",
	//   headers: {
	// 	"Content-Type": "application/json", // Ensure the server expects JSON
	//   },
	//   body: JSON.stringify(data),
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        } else {
          // console.log("Data updated successfully");
		  setIsChange(false)
		  sendAnnouncement("CREATE_NEW_CONTRACT");
        //   navigate("/managerDashboard");
		  
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  const sendAnnouncement = async (action) => {    
	const contractData = allContracts?.find((contract) => contract.contract_uid === currentContractUID);
	console.log("sendAnnouncement - contract - ", contractData)
    const receiverPropertyMapping = {
        // [contractData.property_owner_id]: [contractData.property_id],
		[contractData.owner_uid]: [contractData.property_uid],
    };

	let announcementTitle;
	let announcementMessage;
	if(contractStatus === "NEW") {
		announcementTitle = `New Quote for Management Contract`
		announcementMessage = `You have received a new quote for a Management contract (Property - ${contractData.property_address}${contractData.property_unit ? (", " + contractData.property_unit) : ""}) from ${contractData.business_name}.`
	} else if (contractStatus === "SENT") {
		announcementTitle = "Quote Updated by Property Manager"
		announcementMessage = `Quote for Management contract (Property - ${contractData.property_address}${contractData.property_unit ? (", " + contractData.property_unit) : ""}) has been updated by ${contractData.business_name}.`
	} else if (contractStatus === "ACTIVE" && action === "UPDATE_CONTACT_INFO") {
		announcementTitle = "Contact Info Updated by Property Manager"
		announcementMessage = `Contact Info for Management contract (Property - ${contractData.property_address}${contractData.property_unit ? (", " + contractData.property_unit) : ""}) has been updated by ${contractData.business_name}.`
	} else if (contractStatus === "ACTIVE" && action === "RENEW_CONTRACT") {
		announcementTitle = "Contract Renewed by Property Manager"
		announcementMessage = `Management contract (Property - ${contractData.property_address}${contractData.property_unit ? (", " + contractData.property_unit) : ""}) has been renewed by ${contractData.business_name}. Please review the updated contract.`
	} else if (contractStatus === "ACTIVE" && action === "CREATE_NEW_CONTRACT") {
		announcementTitle = "New Quote from Property Manager"
		announcementMessage = `New Quote Management contract (Property - ${contractData.property_address}${contractData.property_unit ? (", " + contractData.property_unit) : ""}) has been sent by ${contractData.business_name}.`
	} else{
		return;
	}

	try {
		const response = await fetch(`${APIConfig.baseURL.dev}/announcements/${getProfileId()}`, {
			method: "POST",
			headers: {
			  "Content-Type": "application/json",
			},
			body: JSON.stringify({
			  announcement_title: announcementTitle,
			  announcement_msg: announcementMessage,
			  announcement_sender: getProfileId(),
			  announcement_date: new Date().toDateString(),			  
			  announcement_properties: JSON.stringify(receiverPropertyMapping),
			  announcement_mode: "CONTRACT",
			//   announcement_receiver: [contractData.property_owner_id],
			  announcement_receiver: [contractData.owner_uid],
			  announcement_type: ["App", "Email", "Text"],
			}),
		  });

		  if (response.ok) {
			if(props.navigatingFrom && props.navigatingFrom === "PropertyForm"){
				// navigate("/properties"); 					
			} else if(props.navigatingFrom && props.navigatingFrom === "ManageContract" && props.handleBackBtn){
				props.handleBackBtn();
			} 			
			else {
				navigate("/managerDashboard"); 
			}			
		  } else {
			throw new Error(`Failed to send the announcement: ${response.statusText}`);
		  }
	} catch(error) {
		alert("Error sending announcement to Property Owner");
		console.error("Error sending announcement to Property Owner - ", error);
	}
  };

  const getFormattedFeeFrequency = (frequency) => {
    // console.log("getFormattedFeeFrequency(), frequency", frequency);
    let freq = "";
    switch (frequency) {
      case "one_time":
        freq = "One Time";
        break;
      case "One Time":
        freq = "One Time";
        break;
      case "hourly":
        freq = "Hourly";
        break;
      case "daily":
        freq = "Daily";
        break;
      case "weekly":
        freq = "Weekly";
        break;
      case "bi-weekly":
        freq = "Bi-weekly";
        break;
      case "biweekly":
        freq = "Bi-weekly";
        break;
      case "monthly":
        freq = "Monthly";
        break;
      case "Monthly":
        freq = "Monthly";
        break;
      case "annually":
        freq = "Annual";
        break;
      case "Annually":
        freq = "Annual";
        break;
      default:
        freq = "<FREQUENCY>";
    }
    return freq;
  };
// Parse property images or use the default image if none are available
	const [images, setImages] = useState(
	propertyData.property_images && JSON.parse(propertyData.property_images).length > 0
		? JSON.parse(propertyData.property_images)
		: [defaultHouseImage]);

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
	const currentScrollPosition = scrollRef.current.scrollLeft;

	if (direction === 'left') {
		const newScrollPosition = Math.max(currentScrollPosition - scrollAmount, 0);
		setScrollPosition(newScrollPosition);
	} else {
		const newScrollPosition = currentScrollPosition + scrollAmount;
		setScrollPosition(newScrollPosition);
	}
}
	};

	const ContactColumns = [
		{
		  field: "contact_first_name",
		  headerName: "Name",
		  flex:1.5,
		  renderCell : (params) => (
			<Typography fontSize={"14px"}>{params.row.contact_first_name} {params.row.contact_last_name}</Typography>
		  ),
		  renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
		},
		{
		  field: "contact_email",
		  headerName: "Email",
		  flex:1.5,
		  renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
		},
		{
		  field: "contact_phone_number",
		  headerName: "Phone Number",
		  flex:1,
		  renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
		},
		{
			field: "editactions",
			headerName: "",
			flex: 0.5,
			renderCell: (params) => (
			  <Box>
				<IconButton onClick={() => handleOpenEditContact(params.row.id)}>
				  <EditIcon sx={{ fontSize: '19px', color: '#3D5CAC'}} />
				</IconButton>
			  </Box>
			),
		},
		{
		  field: "deleteactions",
		  headerName: "",
		  flex: 0.5,
		  renderCell: (params) => (
			<Box>
			  <IconButton onClick={(e) => handleDeleteContact(params.row.id, e)}>
				<DeleteIcon sx={{ fontSize: '19px', color: '#3D5CAC' }} />
			  </IconButton>
			</Box>
		  ),
		}
	];

return (
    <>
      {/* Time since Inquiry was created */}
      <Box
        sx={{
          display: "flex",
          padding: "5px",
		  flexDirection: "column",
          justifyContent: "flex-end",
          alignItems: "center",
          fontSize: "20px",
          color: "#160449",
		  backgroundColor: "#D6D5DA",
		  borderRadius: "10px",
          // color: '#3D5CAC',
        }}
      >
		{/* For image list */}
		<Grid item xs={12}>
		  <Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						padding: 2,						
					}}
				>
					<IconButton onClick={() => handleScroll('left')} disabled={scrollPosition === 0}>
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
							<ImageList ref={scrollRef} sx={{ display: 'flex', flexWrap: 'nowrap' }} cols={5}>
								{images.map((image, index) => (
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
        {/* <Box
          sx={{
            fontSize: "13px",
          }}
        >
          {timeDiff}
        </Box> */}
		</Grid>
		<Grid item xs={12}>
		<Box
				sx={{
					display: 'flex',
					padding: '5px',
					justifyContent: 'space-evenly',
					alignItems: 'center',
					fontSize: '20px',
					color: '#160449',
					// color: '#3D5CAC',
				}}
			>
				<Box
					sx={{
						fontSize: '16px',
						fontWeight: '600',
					}}
				>
					{/* {getProperties(propertyStatus).length > 0 ? (`${getProperties(propertyStatus)[index].property_address}, ${(getProperties(propertyStatus)[index].property_unit !== null && getProperties(propertyStatus)[index].property_unit !== '' ? (getProperties(propertyStatus)[index].property_unit + ',') : (''))} ${getProperties(propertyStatus)[index].property_city} ${getProperties(propertyStatus)[index].property_state} ${getProperties(propertyStatus)[index].property_zip}`) : (<></>)} */}
					{/* 789 Maple Lane, San Diego, CA 92101, USA */}
					{propertyData?.property_unit ? (
						<span>
							{propertyData.property_address}
							{', Unit - '}
							{propertyData.property_unit}
							{', '}
							{propertyData.property_city}
							{', '}
							{propertyData.property_state} {propertyData.property_zip}
						</span>
					) : (
						<span>
							{propertyData.property_address}
							{', '}
							{propertyData.property_city}
							{', '}
							{propertyData.property_state} {propertyData.property_zip}
						</span>
					)}
				</Box>
			</Box>

		</Grid>
        
      </Box>
	  <Box
        sx={{
          display: "flex",
          padding: "5px",
		  marginTop: "10px",
		  flexDirection: "column",
          justifyContent: "flex-end",
          alignItems: "center",
          fontSize: "15px",
          color: "#3D5CAC",
		  backgroundColor: "#D6D5DA",
		  borderRadius: "10px",
          // color: '#3D5CAC',
        }}
      >
		<Grid container sx={{marginTop: '10px', }}>
			<Grid item container direction="row" xs={4} sx={{justifyContent: 'center', }}>
				<Grid item xs={12}>
					<Typography sx={{fontWeight: 'bold', textAlign: 'center',}}>
						Owner
					</Typography>					
				</Grid>
				<Grid item xs={12}>
					<Typography sx={{color: '#160449', textAlign: 'center',}}>
						{propertyOwnerName} <ChatIcon sx={{ fontSize: 16, color: '#3D5CAC' }} />
					</Typography>					
				</Grid>
				

			</Grid>
			<Grid item container direction="row" xs={4} sx={{justifyContent: 'center', }}>
				<Grid item xs={12}>
					<Typography sx={{fontWeight: 'bold', textAlign: 'center',}}>
						Type
					</Typography>					
				</Grid>
				<Grid item xs={12}>
					<Typography sx={{color: '#160449', textAlign: 'center',}}>
						{propertyData.property_type ? propertyData.property_type : '<TYPE>'}
					</Typography>					
				</Grid>
			</Grid>
			<Grid item container direction="row" xs={4} sx={{justifyContent: 'center', }}>
				<Grid item xs={12}>
					<Typography sx={{fontWeight: 'bold', textAlign: 'center',}}>
						Property Value
					</Typography>					
				</Grid>
				<Grid item xs={12}>
					<Typography sx={{color: '#160449', textAlign: 'center',}}>
						{'$'}
						{propertyData.property_value ? propertyData.property_value : 'No Property Value'}{' '}
						{propertyData.property_value_year ? `(${propertyData.property_value_year})` : ''}
					</Typography>					
				</Grid>
			</Grid>
			
		</Grid>
		<Grid container sx={{marginTop: '10px', }}>
			<Grid item container direction="row" xs={4} sx={{justifyContent: 'center', }}>
				<Grid item xs={12}>
					<Typography sx={{fontWeight: 'bold', textAlign: 'center',}}>
						PM Contract Status
					</Typography>					
				</Grid>
				<Grid item xs={12}>
					<Typography sx={{color: '#160449', textAlign: 'center',}}>
						{contractStatus ? contractStatus : '<CONTRACT_STATUS>'}
					</Typography>					
				</Grid>
				

			</Grid>
			<Grid item container direction="row" xs={4} sx={{justifyContent: 'center', }}>
				<Grid item xs={12}>
					<Typography sx={{fontWeight: 'bold', textAlign: 'center',}}>
						Sq Ft
					</Typography>					
				</Grid>
				<Grid item xs={12}>
					<Typography sx={{color: '#160449', textAlign: 'center',}}>
						{propertyData.property_area ? propertyData.property_area : '<SFT>'}
					</Typography>					
				</Grid>
			</Grid>
			<Grid item container direction="row" xs={4} sx={{justifyContent: 'center', }}>
				<Grid item xs={12}>
					<Typography sx={{fontWeight: 'bold', textAlign: 'center',}}>
						Value per Sqft
					</Typography>					
				</Grid>
				<Grid item xs={12}>
					<Typography sx={{color: '#160449', textAlign: 'center',}}>
						{'$'}
						{propertyData.property_value && propertyData.property_area
							? (propertyData.property_value / propertyData.property_area).toFixed(2)
							: 'No SqFt available'}
					</Typography>					
				</Grid>
			</Grid>
			
		</Grid>
		<Grid container sx={{marginTop: '10px', marginBottom: '10px',}}>
			<Grid item container direction="row" xs={4} sx={{justifyContent: 'center', }}>
				<Grid item xs={12}>
					<Typography sx={{fontWeight: 'bold', textAlign: 'center',}}>
						Expiration Date
					</Typography>					
				</Grid>
				<Grid item xs={12}>
					<Typography sx={{color: '#160449', textAlign: 'center',}}>
						{contractEndDate ? contractEndDate.format('MM-DD-YYYY') : dayjs().format('MM-DD-YYYY')}
					</Typography>					
				</Grid>
				

			</Grid>
			<Grid item container direction="row" xs={4} sx={{justifyContent: 'center', }}>
				<Grid item xs={12}>
					<Typography sx={{fontWeight: 'bold', textAlign: 'center',}}>
						Beds
					</Typography>					
				</Grid>
				<Grid item xs={12}>
					<Typography sx={{color: '#160449', textAlign: 'center',}}>
						{propertyData.property_num_beds >= 0 ? Number(propertyData.property_num_beds) : '<BEDS>'}
					</Typography>					
				</Grid>
			</Grid>
			<Grid item container direction="row" xs={4} sx={{justifyContent: 'center', }}>
				<Grid item xs={12}>
					<Typography sx={{fontWeight: 'bold', textAlign: 'center',}}>
						Baths
					</Typography>					
				</Grid>
				<Grid item xs={12}>
					<Typography sx={{color: '#160449', textAlign: 'center',}}>
						{propertyData.property_num_baths >= 0 ? propertyData.property_num_baths : '<BATHS>'}
					</Typography>					
				</Grid>
			</Grid>
			
		</Grid>
		
	  </Box>  

	  <Box
        sx={{
          display: "flex",
          padding: "5px",
		  marginTop: "10px",
		  flexDirection: "column",
          justifyContent: "flex-end",
          alignItems: "center",
          fontSize: "15px",
          color: "#3D5CAC",
		  backgroundColor: "#D6D5DA",
		  borderRadius: "10px",
          // color: '#3D5CAC',
        }}
      >    
			
		<Grid container columnGap={6} sx={{marginTop: '10px', }}>
			<Grid item container direction="row" xs={6.5} sx={{justifyContent: 'center', }}>
				<Grid item xs={12}>
					<Typography sx={{fontWeight: 'bold', textAlign: 'center',}}>
						Management Agreement Name
					</Typography>					
				</Grid>
				<Grid item xs={12} sx={{marginTop: '5px', }}>
					<TextField
						name="management_agreement_name"
						placeholder="Enter contract name"
						value={contractName}
						onChange={handleContractNameChange}
						required						
            InputProps={textFieldInputProps}
            sx={textFieldSX}
					>						
					</TextField>
				</Grid>
				

			</Grid>
			<Grid item container direction="row" xs={2.5} sx={{justifyContent: 'center', }}>
				<Grid item xs={12}>
					<Typography sx={{fontWeight: 'bold', textAlign: 'center',}}>
						Start Date
					</Typography>					
				</Grid>
				<Grid item xs={12}>
					<LocalizationProvider dateAdapter={AdapterDayjs}>
						<DatePicker
							value={contractStartDate}
							// minDate={dayjs()}
							onChange={handleStartDateChange}
							slots={{
								openPickerIcon: CalendarIcon,
							}}
							slotProps={datePickerSlotProps}
						/>
					</LocalizationProvider>
				</Grid>
			</Grid>
			<Grid item container direction="row" xs={2.5} sx={{justifyContent: 'center', }}>
				<Grid item xs={12}>
					<Typography sx={{fontWeight: 'bold', textAlign: 'center',}}>
						End Date
					</Typography>					
				</Grid>
				<Grid item xs={12}>
					<LocalizationProvider dateAdapter={AdapterDayjs}>
						<DatePicker
							value={contractEndDate}
							// minDate={dayjs()}
							onChange={handleEndDateChange}
							slots={{
								openPickerIcon: CalendarIcon,
							}}
              // sx={{
              //   height: '40px',
              // }}
							// slotProps={{
							// 	textField: {
							// 		size: 'small',
							// 		style: {
							// 			width: '100%',
							// 			fontSize: 24,
							// 			backgroundColor: '#FFFFFF',
							// 			// borderRadius: "10px !important",
							// 			borderRadius: '10px',
							// 			border: '1px solid #3D5CAC',
							// 			// border: "10px solid green",
							// 			input: {
							// 				// border: '1px solid black', // Ensure input border is black
							// 			},
							// 		},
							// 	},
							// }}
              slotProps={datePickerSlotProps}
						/>
					</LocalizationProvider>
				</Grid>
			</Grid>

		</Grid>			
    <Grid container item xs={12} columnGap={3} sx={{marginTop: '10px', }}>      
			<Grid item container direction="row" xs={3} sx={{justifyContent: 'flex-start', }}>
				<Grid item xs={12}>
					<Typography sx={{fontWeight: 'bold', textAlign: 'center',}}>
						Notice Period
					</Typography>					
				</Grid>
				<Grid item xs={12} sx={{marginTop: '5px', }}>
					<TextField
						name="contract_notice_period"
						// placeholder="days"
						value={contractEndNotice}
						onChange={handleNoticePeriodChange}
						required            
            InputProps={{
              ...textFieldInputProps,
              endAdornment: (
                <InputAdornment position="end">days</InputAdornment>
              ),
            }}
            sx={textFieldSX}
					>						
					</TextField>
				</Grid>
      </Grid>      
      <Grid item container direction="row" xs={6} sx={{justifyContent: 'center', }}>
				<Grid item xs={12}>					
				</Grid>
				<Grid item xs={12} sx={{marginTop: '5px', }}>          
          <FormControlLabel 
            sx={{
              marginTop: '25px',
            }}        
            control={
              <Checkbox
                checked={continueM2M}
                onChange={() => {
                  setContinueM2M( prevState => !prevState)
                }}
                inputProps={{ 'aria-label': 'controlled' }}
              />	          
            } 
            label="Continue Month-to-Month" 
          />				
				</Grid>
      </Grid>            
    </Grid>    
			{showInvalidStartDatePrompt && (
				<Box
					sx={{
						color: 'red',
						fontSize: '13px',
					}}
				>
					Please enter a valid start date in "MM-DD-YYYY" format.
				</Box>
			)}
			{showInvalidEndDatePrompt && (
				<Box
					sx={{
						color: 'red',
						fontSize: '13px',
					}}
				>
					Please enter a valid end date in "MM-DD-YYYY" format. End date cannot be before contract start date.
				</Box>
			)}

			{/* For management Fees */}
			<Box sx={{width: '100%'}}>			
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'row',
						justifyContent: 'space-between',
						fontSize: '15px',
						fontWeight: 'bold',
						paddingRight: '10px',
						color: '#3D5CAC',
					}}
				>
					<Typography
						sx={{
							color: "#160449",
							fontWeight: theme.typography.primary.fontWeight,
							fontSize: "18px",
							paddingBottom: "5px",
							paddingTop: "5px",
							marginTop:"10px"
						}}
					>
						{"Management Fees* "}
					</Typography>
					{/* <Box>Management Fees 1*</Box> */}
					<Box onClick={handleOpenAddFee} marginTop={"10px"} marginLeft={"10px"} paddingTop={"5px"}>
						<AddIcon sx={{ fontSize: 20, color: '#3D5CAC' }} />
					</Box>
				</Box>
			</Box>
			{contractFees?.length !== 0 ? <Box sx={{width: '100%', }}><FeesDataGrid data={contractFees} isDeleteable={true} handleEditFee={handleOpenEditFee} handleDeleteFee={handleDeleteFee}/> </Box> : 
				<>
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center',
								marginBottom: '7px',
								width: '100%',
								height:"100px"
							}}
						>
							<Typography
								sx={{
								color: "#A9A9A9",
								fontWeight: theme.typography.primary.fontWeight,
								fontSize: "15px",
								}}
							>
								No Fees
							</Typography>
						</Box>
				</>
			}
			

			

			{/* previously Uploaded docs */}
			<Box sx={{width: '100%', marginLeft: '10px', paddingRight: '10px',}}>				
				<Documents isEditable={true} setIsPreviousFileChange={setIsPreviousFileChange} isAccord={false} documents={previouslyUploadedDocs} setDocuments={setPreviouslyUploadedDocs} setDeleteDocsUrl={setDeletedDocsUrl} contractFiles={contractFiles} contractFileTypes={contractFileTypes} setContractFiles={setContractFiles} setContractFileTypes={setContractFileTypes}/>				
			</Box>

			{/* Contact details */}
			<Box sx={{width: '100%'}}>				
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'row',
					justifyContent: 'space-between',
					fontSize: '15px',
					fontWeight: 'bold',
					paddingRight: '10px',
					color: '#3D5CAC',
				}}
			>
				<Typography
					sx={{
						color: "#160449",
						fontWeight: theme.typography.primary.fontWeight,
						fontSize: "18px",
						paddingBottom: "5px",
						paddingTop: "5px",
						marginY:"10px"
					}}
				>
					{"Contract Assigned Contacts: "}
				</Typography>
				<Box onClick={()=>{setShowAddContactDialog(true)}} marginTop={"10px"} paddingTop={"5px"} paddingRight={"0px"}>
					<AddIcon sx={{ fontSize: 20, color: '#3D5CAC' }} />
				</Box>
			</Box>
			{contractAssignedContacts?.length !== 0 ? (				
				<DataGrid
					rows={contactRowsWithId}
					columns={ContactColumns}
					sx={{
					// minHeight:"100px",
					// height:"100px",
					// maxHeight:"100%",
					marginTop: "10px",
					}}
					autoHeight
					rowHeight={50} 
					hideFooter={true}
				/>
			) : (
				<></>
			)}
			</Box>	
			{
				(contractStatus === "NEW" || contractStatus === "SENT" || contractStatus === "REJECTED") && (
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'space-between',
							alignItems: 'center',
							paddingTop: '10px',
							marginBottom: '7px',
							marginTop:"10px",
							width: '100%',
						}}
					>
						{contractStatus !== 'REJECTED' && (
						<>
						<Button
							variant="contained"
							sx={{
								backgroundColor: '#CB8E8E',
								textTransform: 'none',
								borderRadius: '5px',
								display: 'flex',
								width: '45%',
								'&:hover': {
									backgroundColor: '#CB8E8E',
								},
							}}
							onClick={handleDeclineOfferClick}
						>
							<Typography
								sx={{
									fontWeight: theme.typography.primary.fontWeight,
									fontSize: '14px',
									color: '#160449',
									textTransform: 'none',
								}}
							>
								{contractStatus === 'NEW' ? 'Decline Offer' : 'Withdraw Offer 1'}
							</Typography>
						</Button>
						</>
						)}
						<Button
							variant="contained"
							sx={{
								backgroundColor: '#9EAED6',
								textTransform: 'none',
								borderRadius: '5px',
								display: 'flex',
								width: contractStatus === 'REJECTED' ? '100%' : '45%',
								'&:hover': {
									backgroundColor: '#9EAED6',
								},
							}}
							onClick={handleSendQuoteClick}
							disabled={!contractName || !contractStartDate || !contractEndDate || !contractFees}
						>
							<Typography
								sx={{
									fontWeight: theme.typography.primary.fontWeight,
									fontSize: '14px',
									color: '#160449',
									textTransform: 'none',
								}}
							>
								{contractStatus === 'NEW' ? 'Send Quote' : 'Update Quote'}
							</Typography>
						</Button>
					</Box>
				)
			}							
			{
				(contractStatus === "ACTIVE") && (
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'space-between',
							alignItems: 'center',
							paddingTop: '10px',
							marginBottom: '7px',
							marginTop:"10px",
							width: '100%',
						}}
					>
						
						
							
						<Button
							variant="contained"
							sx={{
								backgroundColor: '#9EAED6',
								textTransform: 'none',
								borderRadius: '5px',
								display: 'flex',
								width: '30%',
								'&:hover': {
									backgroundColor: '#9EAED6',
								},
							}}
							onClick={() => setShowEndContractDialog(true)}							
							// disabled={!contractName || !contractStartDate || !contractEndDate || !contractFees}
						>
							<Typography
								sx={{
									fontWeight: theme.typography.primary.fontWeight,
									fontSize: '14px',
									color: '#160449',
									textTransform: 'none',
								}}
							>
								{'End Contract'}
							</Typography>
						</Button>

						<Button
							variant="contained"
							sx={{
								backgroundColor: '#9EAED6',
								textTransform: 'none',
								borderRadius: '5px',
								display: 'flex',
								width: '30%',
								'&:hover': {
									backgroundColor: '#9EAED6',
								},
							}}
							onClick={handleCreateNewContractClick}
							disabled={!contractName || !contractStartDate || !contractEndDate || !contractFees}
						>
							<Typography
								sx={{
									fontWeight: theme.typography.primary.fontWeight,
									fontSize: '14px',
									color: '#160449',
									textTransform: 'none',
								}}
							>
								{'Create New Contract'}
							</Typography>
						</Button>
					</Box>
				)
			}							
			
			</Box>
			{showAddFeeDialog && (
				<Box>
					<AddFeeDialog open={showAddFeeDialog} handleClose={handleCloseAddFee} onAddFee={handleAddFee} />
				</Box>
			)}
			{showEditFeeDialog && (
				<Box>
					<EditFeeDialog
						open={showEditFeeDialog}
						handleClose={handleCloseEditFee}
						onEditFee={handleEditFee}
						feeIndex={indexForEditFeeDialog}
						fees={contractFees}
					/>
				</Box>
			)}
			{showAddContactDialog && (
				<Box>
					<AddContactDialog
						open={showAddContactDialog}
						handleClose={handleCloseAddContact}
						onAddContact={handleAddContact}
					/>
				</Box>
			)}
			{showEditContactDialog && (
				<Box>
					<EditContactDialog
						open={showEditContactDialog}
						handleClose={handleCloseEditContact}
						onEditContact={handleEditContact}
						contactIndex={indexForEditContactDialog}
						contacts={contractAssignedContacts}
					/>
				</Box>
			)}
      {showEndContractDialog && (
				<Box>
					<EndContractDialog open={showEndContractDialog} handleClose={() => setShowEndContractDialog(false)} onEndContract={handleEndContractClick} noticePeriod={contractEndNotice} />
				</Box>
			)}
      <GenericDialog
        isOpen={isDialogOpen}
        title={dialogTitle}
        contextText={dialogMessage}
        actions={[
          {
            label: "OK",
            onClick: closeDialog,
          }
        ]}
        severity={dialogSeverity}
      />

			
		</>
	);
};

const ContactListItem = ({ contact, i, handleOpenEditContact, handleDeleteContact }) => {	
	return (
		<Grid container key={i} onClick={() => handleOpenEditContact(i)}>
			<Grid item xs={3}>
				{contact.contact_first_name} {contact.contact_last_name}
			</Grid>
			<Grid item xs={4}>
				{contact.contact_email}
			</Grid>
			<Grid item xs={4}>
				{contact.contact_phone_number}
			</Grid>
			<Grid item xs={1}>
				<Button
					variant="text"
					onClick={(event) => {
						handleDeleteContact(i, event);
					}}
					sx={{
						width: '10%',
						cursor: 'pointer',
						fontSize: '14px',
						fontWeight: 'bold',
						color: '#3D5CAC',
						'&:hover': {
							backgroundColor: 'transparent', // Set to the same color as the default state
						},
					}}
				>
					<DeleteIcon sx={{ fontSize: 19, color: '#3D5CAC' }} />
				</Button>
			</Grid>
		</Grid>
	);
};

function AddContactDialog({ open, handleClose, onAddContact }) {
	const [contactFirstName, setContactFirstName] = useState('');
	const [contactLastName, setContactLastName] = useState('');
	const [contactEmail, setContactEmail] = useState('');
	const [contactPhone, setContactPhone] = useState('');

	const handleSaveContact = (event) => {
		event.preventDefault();

		// console.log("Adding Contact ");
		// console.log("   firstName:", contactFirstName);
		// console.log("   lastName:", contactLastName);
		// console.log("   email:", contactEmail);
		// console.log("   phone:", contactPhone);

		const newContact = {
			contact_first_name: contactFirstName,
			contact_last_name: contactLastName,
			contact_email: contactEmail,
			contact_phone_number: contactPhone,
		};
		onAddContact(newContact);
		handleClose();
	};

	return (
		<form onSubmit={handleSaveContact}>
			<Dialog
				open={open}
				onClose={handleClose}
				fullWidth
				maxWidth="sm"
				sx={{
					fontSize: '13px',
					fontWeight: 'bold',
					padding: '5px',
					color: '#3D5CAC',
				}}
			>
				<DialogContent>
					{/* Dialog Title */}
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<Box
								sx={{
									width: '100%',
									display: 'flex',
									flexDirection: 'row',
									justifyContent: 'center',
									fontSize: '15px',
									fontWeight: 'bold',
									padding: '5px',
									color: '#3D5CAC',
								}}
							>
								Add Contact
							</Box>
						</Grid>
					</Grid>
					{/* First name and last name */}
					<Grid container spacing={2}>
						<Grid item xs={12} sm={6}>
							<Box sx={{ color: '#3D5CAC' }}>First Name</Box>							
							<TextField
								name="contact_first_name"
								placeholder=""
								value={contactFirstName}
								onChange={(event) => {
									setContactFirstName(event.target.value);
								}}
								InputProps={{
									sx: {
										backgroundColor: '#D6D5DA',
										height: '40px',
									},
								}}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<Box sx={{ color: '#3D5CAC' }}>Last Name</Box>
							<TextField
								name="contact_last_name"
								placeholder=""
								value={contactLastName}
								onChange={(event) => {
									setContactLastName(event.target.value);
								}}
								InputProps={{
									sx: {
										backgroundColor: '#D6D5DA',
										height: '40px',
									},
								}}
							/>
						</Grid>
					</Grid>
					{/* Email and phone */}
					<Grid container spacing={2} sx={{ paddingTop: '10px' }}>
						<Grid item xs={12} sm={6}>
							<Box sx={{ color: '#3D5CAC' }}>Email</Box>
							<TextField
								name="contact_email"
								placeholder=""
								value={contactEmail}
								onChange={(event) => {
									setContactEmail(event.target.value);
								}}
								InputProps={{
									sx: {
										backgroundColor: '#D6D5DA',
										height: '40px',
									},
								}}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<Box sx={{ color: '#3D5CAC' }}>Phone Number</Box>
							<TextField
								name="contact_phone_number"
								placeholder=""
								value={contactPhone}
								onChange={(event) => {
									setContactPhone(event.target.value);
								}}
								InputProps={{
									sx: {
										backgroundColor: '#D6D5DA',
										height: '40px',
									},
								}}
							/>
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleClose}
						sx={{
							'&:hover': {
								backgroundColor: '#3D5CAC',
							},
							backgroundColor: '#9EAED6',
							color: '#160449',
							textTransform: 'none',
						}}
					>
						Close
					</Button>
					<Button
						type="submit"
						onClick={handleSaveContact}
						sx={{
							'&:hover': {
								backgroundColor: '#3D5CAC',
							},
							backgroundColor: '#9EAED6',
							color: '#160449',
							textTransform: 'none',
						}}
					>
						Save
					</Button>
				</DialogActions>
			</Dialog>
		</form>
	);
}

function EditContactDialog({ open, handleClose, onEditContact, contactIndex, contacts }) {
	// console.log("--dhyey-- contactIndex - ", contactIndex, "contacts - ", contacts);
	const [contactFirstName, setContactFirstName] = useState(contacts[contactIndex].contact_first_name);
	const [contactLastName, setContactLastName] = useState(contacts[contactIndex].contact_last_name);
	const [contactEmail, setContactEmail] = useState(contacts[contactIndex].contact_email);
	const [contactPhone, setContactPhone] = useState(contacts[contactIndex].contact_phone_number);

	const handleSaveContact = (event) => {
		event.preventDefault();

		console.log('Editing Contact ');
		console.log('   firstName:', contactFirstName);
		console.log('   lastName:', contactLastName);
		console.log('   email:', contactEmail);
		console.log('   phone:', contactPhone);

		const newContact = {
			contact_first_name: contactFirstName,
			contact_last_name: contactLastName,
			contact_email: contactEmail,
			contact_phone_number: contactPhone,
		};
		onEditContact(newContact, contactIndex);
		handleClose();
	};

	return (
		<form onSubmit={handleSaveContact}>
			<Dialog
				open={open}
				onClose={handleClose}
				fullWidth
				maxWidth="sm"
				sx={{
					fontSize: '13px',
					fontWeight: 'bold',
					padding: '5px',
					color: '#3D5CAC',
				}}
			>
				<DialogContent>
					{/* Dialog Title */}
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<Box
								sx={{
									width: '100%',
									display: 'flex',
									flexDirection: 'row',
									justifyContent: 'center',
									fontSize: '15px',
									fontWeight: 'bold',
									padding: '5px',
									color: '#3D5CAC',
								}}
							>
								Edit Contact
							</Box>
						</Grid>
					</Grid>
					{/* First name and last name */}
					<Grid container spacing={2}>
						<Grid item xs={12} sm={6}>
							<Box sx={{ color: '#3D5CAC' }}>First Name</Box>							
							<TextField
								name="contact_first_name"
								placeholder=""
								value={contactFirstName}
								onChange={(event) => {
									setContactFirstName(event.target.value);
								}}
								InputProps={{
									sx: {
										backgroundColor: '#D6D5DA',
										height: '40px',
									},
								}}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<Box sx={{ color: '#3D5CAC' }}>Last Name</Box>
							<TextField
								name="contact_last_name"
								placeholder=""
								value={contactLastName}
								onChange={(event) => {
									setContactLastName(event.target.value);
								}}
								InputProps={{
									sx: {
										backgroundColor: '#D6D5DA',
										height: '40px',
									},
								}}
							/>
						</Grid>
					</Grid>
					{/* Email and phone */}
					<Grid container spacing={2} sx={{ paddingTop: '10px' }}>
						<Grid item xs={12} sm={6}>
							<Box sx={{ color: '#3D5CAC' }}>Email</Box>
							<TextField
								name="contact_email"
								placeholder=""
								value={contactEmail}
								onChange={(event) => {
									setContactEmail(event.target.value);
								}}
								InputProps={{
									sx: {
										backgroundColor: '#D6D5DA',
										height: '40px',
									},
								}}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<Box sx={{ color: '#3D5CAC' }}>Phone Number</Box>
							<TextField
								name="contact_phone_number"
								placeholder=""
								value={contactPhone}
								onChange={(event) => {
									setContactPhone(event.target.value);
								}}
								InputProps={{
									sx: {
										backgroundColor: '#D6D5DA',
										height: '40px',
									},
								}}
							/>
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleClose}
						sx={{
							'&:hover': {
								backgroundColor: '#3D5CAC',
							},
							backgroundColor: '#9EAED6',
							color: '#160449',
							textTransform: 'none',
						}}
					>
						Close
					</Button>
					<Button
						type="submit"
						onClick={handleSaveContact}
						sx={{
							'&:hover': {
								backgroundColor: '#3D5CAC',
							},
							backgroundColor: '#9EAED6',
							color: '#160449',
							textTransform: 'none',
						}}
					>
						Save
					</Button>
				</DialogActions>
			</Dialog>
		</form>
	);
}

export default PropertyCard;
