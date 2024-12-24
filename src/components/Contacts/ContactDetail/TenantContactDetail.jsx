import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import theme from '../../../theme/theme';
// import "./../../css/contacts.css";
import {
	ThemeProvider,
	Box,
	Paper,
	Stack,
	Typography,
	Button,
	InputAdornment,
	TextField,
	Card,
	CardContent,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Chip,
} from '@mui/material';
import { Message, Search } from '@mui/icons-material';
import { getStatusColor } from '../ContactsFunction';
// import axios from 'axios';
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../../utils/httpMiddleware";
import { useUser } from '../../../contexts/UserContext';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { Container, Grid, Tabs, Tab, Badge, Switch } from '@mui/material';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import defaultHouseImage from '../../Property/defaultHouseImage.png';
import { DataGrid } from '@mui/x-data-grid';
import useMediaQuery from '@mui/material/useMediaQuery';
import SearchIcon from '@mui/icons-material/Search';
import EmailIcon from '../../Property/messageIconDark.png';
import PhoneIcon from '../../Property/phoneIconDark.png';
import AddressIcon from '../../Property/addressIconDark.png';
import refundIcon from "../../Property/refundIcon.png"
import maintenanceIcon from '../../Property/maintenanceIcon.png';
import User_fill from '../../../images/User_fill_dark.png';
import { maskSSN, maskEIN, formattedPhoneNumber } from '../../utils/privacyMasking';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import dayjs from 'dayjs';

import AES from 'crypto-js/aes';

import APIConfig from '../../../utils/APIConfig';
import ContactDetails from '../ContactDetails';
import ContactsList from '../ContactsList';

import ProfileInformation from './ProfileInformation';

const TenantContactDetail = ({ data, currentIndex, setCurrentIndex, propertyIndex, fromPage, setViewRHS }) => {
	const { selectedRole, getProfileId } = useUser();
	const [propertiesData, setPropertiesData] = useState([]);
	const [contractsData, setContractsData] = useState([]);
	const [contactDetails, setContactDetails] = useState([]);
	let navigate = useNavigate();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

	useEffect(() => {
		setContactDetails(data);
	}, [data]);

	const getPropertiesData = async () => {
		const url = `${APIConfig.baseURL.dev}/properties/${getProfileId()}`;
		// setShowSpinner(true);

		await axios
			.get(url)
			.then((resp) => {
				const data = resp.data;
				// //console.log("properties endpoint - data - ", data);
				setPropertiesData(data);
				// setShowSpinner(false);
			})
			.catch((e) => {
				console.error(e);
				// setShowSpinner(false);
			});
	};

	const getContractsData = async () => {
		// const url = `http://localhost:4000/contracts/${getProfileId()}`;
		const url = `${APIConfig.baseURL.dev}/contracts/${getProfileId()}`;
		// setShowSpinner(true);

		await axios
			.get(url)
			.then((resp) => {
				const data = resp.data?.result;
				// //console.log("properties endpoint - data - ", data);
				setContractsData(data);
				// setShowSpinner(false);
			})
			.catch((e) => {
				console.error(e);
				// setShowSpinner(false);
			});
	};

	useEffect(() => {
		getPropertiesData();
		getContractsData();
	}, []);

	return (
		<Grid
			container
			sx={{
				backgroundColor: theme.palette.primary.main,
				borderRadius: '10px',
				padding: '10px',
				height: '85dvh',
				overflow: 'auto',
			}}
		>
			<Grid item xs={12} container justifyContent="center" sx={{ height: '50px' }}>
				<Button
					sx={{
					textTransform: "none",
					color: theme.typography.common.blue,
					fontWeight: theme.typography.common.fontWeight,
					fontSize: "16px",
					"&:hover, &:focus, &:active": { background: theme.palette.primary.main },
					}}
					onClick={() => {
						if(isMobile && setViewRHS){
							setViewRHS(false)
						}else if(fromPage && propertyIndex >= 0){
							navigate("/properties", { state: { index : propertyIndex } });
						}else{
							navigate(-1)
						}
					}}
				>
					<img src={refundIcon} style={{ width: "25px", height: "25px", margin: "5px" }} />
				</Button>
				<Typography sx={{ fontSize: '35px', fontWeight: 'bold', color: '#160449' }}>Tenant Contact</Typography>
			</Grid>
			<Grid item xs={12} container justifyContent="center">
				<Typography sx={{ fontSize: '20px', color: '#3D5CAC' }}>
					{currentIndex + 1} of {contactDetails?.length} Tenants
				</Typography>
			</Grid>
			<Grid
				container
				item
				xs={12}
				direction="row"
				alignContent="space-between"
				sx={{
					backgroundColor: '#160449',
					borderRadius: '10px',
					marginBottom: '10px',
					paddingTop: '5px',
					paddingBottom: '10px',
					minHeight: '120.5px',
				}}
			>
				<Grid item xs={1}>
					<Box
						onClick={() => {
							//console.log('Previous button clicked', currentIndex, contactDetails?.length);
							currentIndex > 0
								? setCurrentIndex(currentIndex - 1)
								: setCurrentIndex(contactDetails?.length - 1);
						}}
						sx={{
							paddingLeft: '10px',
						}}
					>
						<svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path
								d="M5.5 16.5L4.08579 15.0858L2.67157 16.5L4.08579 17.9142L5.5 16.5ZM26.125 18.5C27.2296 18.5 28.125 17.6046 28.125 16.5C28.125 15.3954 27.2296 14.5 26.125 14.5V18.5ZM12.3358 6.83579L4.08579 15.0858L6.91421 17.9142L15.1642 9.66421L12.3358 6.83579ZM4.08579 17.9142L12.3358 26.1642L15.1642 23.3358L6.91421 15.0858L4.08579 17.9142ZM5.5 18.5H26.125V14.5H5.5V18.5Z"
								fill={theme.typography.secondary.white}
							/>
						</svg>
					</Box>
				</Grid>
				<Grid container direction="row" item xs={10}>
					<Grid item xs={12} container justifyContent="center">
						<Typography sx={{ fontSize: '25px', fontWeight: 'bold', color: '#F2F2F2' }}>
							{`
                      ${
							contactDetails && contactDetails[currentIndex]?.tenant_first_name
								? contactDetails[currentIndex]?.tenant_first_name
								: ''
						}
                      ${
							contactDetails && contactDetails[currentIndex]?.tenant_last_name
								? contactDetails[currentIndex]?.tenant_last_name
								: ''
						}
                    `}
						</Typography>
					</Grid>
					<Grid item xs={12} container justifyContent="center">
						<Box
							sx={{
								backgroundColor: '#A9A9A9',
								height: '68px',
								width: '68px',
								borderRadius: '68px',
								// marginTop: "-34px",
							}}
						>
							<img
								src={
									contactDetails && contactDetails[currentIndex]?.tenant_photo_url
										? contactDetails[currentIndex].tenant_photo_url
										: User_fill
								}
								alt="profile placeholder"
								style={{
									height: '60px',
									width: '60px',
									borderRadius: '68px',
									margin: '4px',
								}}
							/>
						</Box>
					</Grid>
				</Grid>
				<Grid item xs={1} container justifyContent="flex-end">
					<Box
						onClick={() => {
							//console.log('Next button clicked');
							currentIndex < contactDetails?.length - 1
								? setCurrentIndex(currentIndex + 1)
								: setCurrentIndex(0);
						}}
						sx={{
							paddingRight: '10px',
						}}
					>
						<svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path
								d="M27.5 16.5L28.9142 17.9142L30.3284 16.5L28.9142 15.0858L27.5 16.5ZM6.875 14.5C5.77043 14.5 4.875 15.3954 4.875 16.5C4.875 17.6046 5.77043 18.5 6.875 18.5L6.875 14.5ZM20.6642 26.1642L28.9142 17.9142L26.0858 15.0858L17.8358 23.3358L20.6642 26.1642ZM28.9142 15.0858L20.6642 6.83579L17.8358 9.66421L26.0858 17.9142L28.9142 15.0858ZM27.5 14.5L6.875 14.5L6.875 18.5L27.5 18.5L27.5 14.5Z"
								fill={theme.typography.secondary.white}
							/>
						</svg>
					</Box>
				</Grid>
			</Grid>
			<Grid container item xs={12} columnSpacing={5} rowSpacing={1} sx={{}}>
				<Grid item xs={12}>
					<Paper
						elevation={0}
						style={{
							// margin: '50p', // Add margin here
							borderRadius: '10px',
							backgroundColor: '#D6D5DA',
							minHeight: 230,
							// maxHeight: 230,
							// [theme.breakpoints.down("sm")]: {
							//     width: "80%",
							// },
							// [theme.breakpoints.up("sm")]: {
							//     width: "50%",
							// },
							// width: "100%",
							padding: '10px',
						}}
					>
						{contactDetails && typeof currentIndex === 'number' && currentIndex >= 0 ? (
							<ProfileInformation contactDetails={contactDetails[currentIndex]} type="tenant" />
						) : (
							<></>
						)}
					</Paper>
				</Grid>
				<Grid item xs={12}>
					<Paper
						elevation={0}
						style={{
							// margin: '50p', // Add margin here
							borderRadius: '10px',
							backgroundColor: '#D6D5DA',
							minHeight: 370,

							// [theme.breakpoints.down("sm")]: {
							//     width: "80%",
							// },
							// [theme.breakpoints.up("sm")]: {
							//     width: "50%",
							// },
							// width: "100%",
							padding: '10px',
						}}
					>
						{contactDetails && typeof currentIndex === 'number' && currentIndex >= 0 ? (
							<TenantPropertyInformation
								// propertyData={contactDetails[currentIndex]?.property}
								propertyData={
									selectedRole === 'OWNER' || selectedRole === 'MAINTENANCE'
										? contactDetails[currentIndex]?.properties
										: contactDetails[currentIndex]?.property
								} //fix later
								index={0}
								selectedRole={selectedRole}
							/>
						) : (
							<></>
						)}
					</Paper>
				</Grid>
			</Grid>
		</Grid>
	);
};

const TenantPropertyInformation = ({ propertyData, index, selectedRole }) => {
	const properties =
		propertyData != null ? JSON.parse(propertyData).filter((property) => property.lease_status === "ACTIVE" || property.lease_status === "ACTIVE M2M") : [];
	const [currentIndex, setCurrentIndex] = useState(index);
	const navigate = useNavigate();
	//console.log('TenantPropertyInformation - properties - ', properties);

	return (
		<Grid container sx={{ borderRadius: '10px', padding: '0px' }}>
			<Grid item xs={12} container justifyContent="center">
				<Typography sx={{ fontSize: '15px', color: '#3D5CAC' }}>
					{properties?.length > 0 ? currentIndex + 1 : 0} of {properties?.length} Properties
				</Typography>
			</Grid>
			<Grid
				container
				item
				xs={12}
				direction="row"
				alignContent="space-between"
				sx={{
					borderRadius: '10px',
					marginBottom: '10px',
					paddingTop: '5px',
					paddingBottom: '10px',
					minHeight: '120.5px',
				}}
			>
				<Grid item xs={1} justifyContent="flex-start" alignContent="center">
					<Box
						onClick={() => {
							//console.log('Previous button clicked', currentIndex, properties?.length);
							currentIndex > 0
								? setCurrentIndex(currentIndex - 1)
								: setCurrentIndex(properties?.length - 1);
						}}
						sx={{
							paddingLeft: '10px',
						}}
					>
						<KeyboardArrowLeft
							// fontSize="large"
							sx={{ color: '#3D5CAC', fontSize: '48px' }}
						/>
					</Box>
				</Grid>
				<Grid item xs={2}>
					<Box>
						<img
							src={
								properties && properties[currentIndex]?.property_favorite_image
									? properties[currentIndex]?.property_favorite_image
									: defaultHouseImage
							}
							alt="Description"
							style={{ width: '100%', height: 'auto' }}
						/>
					</Box>
				</Grid>

				<Grid container direction="row" item xs={7} alignContent="center">
					<Grid item xs={12} container justifyContent="center">
						<Typography sx={{ fontSize: '20px', fontWeight: 'bold', color: '#160449', margin: '20px' }}>
							{`
                      ${
							properties && properties[currentIndex]?.property_address
								? properties[currentIndex]?.property_address
								: ''
						}
                      # ${
							properties && properties[currentIndex]?.property_unit
								? properties[currentIndex]?.property_unit
								: ''
						},
                      ${
							properties && properties[currentIndex]?.property_city
								? properties[currentIndex]?.property_city
								: ''
						},
                      ${
							properties && properties[currentIndex]?.property_state
								? properties[currentIndex]?.property_state
								: ''
						}
                      ${
							properties && properties[currentIndex]?.property_zip
								? properties[currentIndex]?.property_zip
								: ''
						}
                    `}
						</Typography>
					</Grid>
					{/* <Grid item xs={12} container justifyContent="center">
                    <Box
                      sx={{
                        backgroundColor: "#A9A9A9",
                        height: "68px",
                        width: "68px",
                        borderRadius: "68px",
                        // marginTop: "-34px",
                      }}
                    >
                    <img
                      src={(contactDetails && contactDetails[currentIndex]?.contact_photo_url) ? contactDetails[currentIndex].contact_photo_url : User_fill}
                      alt="profile placeholder"
                      style={{
                        height: "60px",
                        width: "60px",
                        borderRadius: "68px",
                        margin: "4px",
                      }}
                    />
                    </Box>
                  </Grid> */}
				</Grid>
				<Grid item xs={1} alignContent="center">
					<Badge
						overlap="circular"
						color="error"
						badgeContent={
							properties && properties[currentIndex]?.maintenance_count
								? properties[currentIndex]?.maintenance_count
								: 0
						}
						anchorOrigin={{
							vertical: 'top',
							horizontal: 'right',
						}}
						style={{
							color: '#000000',
							width: '35px',
							height: '20px',
							fontSize: '5px',
						}}
					>
						<Button
							// onClick={() => navigate("/maintenance")}
							onClick={() => {
								if (selectedRole === 'MANAGER') {
									navigate('/managerMaintenance', {
										state: {
											selectedProperty: {
												address: properties[currentIndex]?.property_address,
												property_uid: properties[currentIndex]?.contract_property_id,
												checked: true,
											},
										},
									});
								} else {
									navigate('/ownerMaintenance', {
										state: {
											selectedProperty: {
												address: properties[currentIndex]?.property_address,
												property_uid: properties[currentIndex]?.property_id,
												checked: true,
											},
										},
									});
								}
							}}
							sx={{
								border: 'none',
								'&:hover, &:focus, &:active': { backgroundColor: '#d6d5da' },
								alignContent: 'left',
								justifyContent: 'left',
							}}
						>
							<img
								src={maintenanceIcon}
								alt="maintenance icon"
								style={{ width: '45px', height: '45px' }}
							/>
						</Button>
					</Badge>
				</Grid>
				<Grid item xs={1} container justifyContent="flex-end" alignContent="center">
					<Box
						onClick={() => {
							//console.log('Next button clicked');
							currentIndex < properties?.length - 1
								? setCurrentIndex(currentIndex + 1)
								: setCurrentIndex(0);
						}}
						sx={{
							paddingRight: '10px',
						}}
					>
						<KeyboardArrowRight sx={{ color: '#3D5CAC', fontSize: '48px' }} />
					</Box>
				</Grid>
			</Grid>
			<Grid container xs={12} sx={{ paddingLeft: '10px' }}>
					<Grid container item xs={12} justifyContent="center">
						<Typography sx={{ fontSize: '20px', color: '#160449', fontWeight: 'bold' }}>
							Occupants
						</Typography>
					</Grid>
					<Grid container item xs={12} columnSpacing={5} rowSpacing={1} sx={{}}>
						<Grid item xs={12}>
							<Paper
								elevation={0}
								style={{
									borderRadius: '10px',
									backgroundColor: '#D6D5DA',
									minHeight: 370,
									padding: '10px',
								}}
							>
								{properties && typeof currentIndex === 'number' && currentIndex >= 0 ? (
									<>
										{/* Add the new OccupantsSection */}
										<OccupantsSection contactDetails={properties[currentIndex]} />
									</>
								) : (
									<></>
								)}
							</Paper>
						</Grid>
					</Grid>
					{/* <Grid container item xs={12} justifyContent='center'>
                <Typography sx={{fontSize: '20px', color: '#160449', fontWeight: 'bold', }}>
                  Lease Details
                </Typography>
              </Grid>               */}
				</Grid>
			<Grid container xs={12} rowSpacing={0} columnGap={0} columnSpacing={0} rowGap={0}>
					<Grid container item xs={12} justifyContent="center" sx={{ height: '25px' }}>
						<Typography sx={{ fontSize: '20px', color: '#160449', fontWeight: 'bold', margin: '0px' }}>
							Rent History
						</Typography>
					</Grid>
					<Grid item xs={12} sx={{ padding: '0px' }}>
						<RentHistoryDataGrid
							data={properties[currentIndex]?.rent_payments || properties[currentIndex]?.rents_paid}
						/>
					</Grid>
				</Grid>
			
			{/* <Grid container item xs={12} columnSpacing={5} rowSpacing={1} sx={{ }}>
              <Grid item xs={12}>
                  <Paper
                      elevation={0}
                      style={{
                          // margin: '50p', // Add margin here
                          borderRadius: "10px",
                          backgroundColor: "#D6D5DA",
                          minHeight: 230,
                          // maxHeight: 230, 
                          // [theme.breakpoints.down("sm")]: {
                          //     width: "80%",
                          // },
                          // [theme.breakpoints.up("sm")]: {
                          //     width: "50%",
                          // },
                          // width: "100%",
                          padding: '10px',
                      }}
                  >
                      {
                        contactDetails && typeof currentIndex === 'number' && currentIndex >=0 ? (
                          <ProfileInformation contactDetails={contactDetails[currentIndex]} type="tenant" />
                        ) :
                        <></>
                      }
                      
                  </Paper>
              </Grid>
              <Grid item xs={12}>
                  <Paper
                      elevation={0}
                      style={{
                          // margin: '50p', // Add margin here
                          borderRadius: "10px",
                          backgroundColor: "#D6D5DA",
                          minHeight: 370,
  
                          // [theme.breakpoints.down("sm")]: {
                          //     width: "80%",
                          // },
                          // [theme.breakpoints.up("sm")]: {
                          //     width: "50%",
                          // },
                          // width: "100%",
                          padding: '10px',
                      }}
                  >
                      {
                        contactDetails && typeof currentIndex === 'number' && currentIndex >=0 ? (
                          <TenantPropertyInformation 
                            propertyData={contactDetails[currentIndex]?.property}
                          />
                        ) :
                        <></>
                      }
                      
                  </Paper>
              </Grid>                     
          </Grid>                      */}
		</Grid>
	);
};

const RentHistoryDataGrid = ({ data }) => {
	//console.log('RentHistoryDataGrid - props.data -', data);

	const paymentStatusColorMap = {
		'Paid On Time': theme.palette.priority.clear,
		'Partially Paid': theme.palette.priority.medium,
		'Paid Late': theme.palette.priority.low,
		'Not Paid': theme.palette.priority.high,
		Vacant: '#160449',
		'No Manager': theme.palette.priority.low,
	};

	const paymentStatusMap = {
		UNPAID: 'Not Paid',
		'PAID LATE': 'Paid Late',
		PAID: 'Paid On Time',
		Partial: 'Partially Paid',
		VACANT: 'Vacant',
		'NO MANAGER': 'No Manager',
	};

	function getPaymentStatusColor(paymentStatus) {
		if (paymentStatus === null || paymentStatus === undefined) {
			return paymentStatusColorMap['Vacant'];
		} else {
			const status = paymentStatusMap[paymentStatus];
			return paymentStatusColorMap[status];
		}
	}

	const columns = [
		{
			field: 'cf_month',
			headerName: 'Month',
			renderHeader: () => (
				<Typography sx={{ fontSize: '15px', color: '#160449', fontWeight: 'bold' }}>{'Month'}</Typography>
			),
			// width: 200,
			flex: 0.5,
			renderCell: (params) => (
				<Typography sx={{ fontSize: '14px', color: '#160449' }}>{`${params.row.cf_month}`}</Typography>
			),
		},
		{
			field: 'latest_date',
			headerName: 'Paid',
			renderHeader: () => (
				<Typography sx={{ fontSize: '15px', color: '#160449', fontWeight: 'bold' }}>{'Paid'}</Typography>
			),
			// width: 200,
			flex: 0.5,
			renderCell: (params) => (
				<Typography sx={{ fontSize: '14px', color: '#160449' }}>
					{params.row.latest_date ? dayjs(params.row.latest_date).format('MM/DD/YYYY') : '-'}
				</Typography>
			),
		},
		{
			field: 'total_paid',
			headerName: 'Amount',
			renderHeader: () => (
				<Typography sx={{ fontSize: '15px', color: '#160449', fontWeight: 'bold' }}>{'Amount'}</Typography>
			),
			// width: 200,
			flex: 0.5,
			renderCell: (params) => (
				<Typography sx={{ fontSize: '14px', color: '#160449', textAlign: 'right', width: '100%' }}>
					{params.row.purchase_status === 'UNPAID'
						? params.row.pur_amount_due?.toFixed(2)
						: params.row.total_paid?.toFixed(2) || '-'}
				</Typography>
			),
		},
		{
			field: 'purchase_status',
			headerName: 'Rent Status',
			renderHeader: () => (
				<Typography sx={{ fontSize: '15px', color: '#160449', fontWeight: 'bold' }}>{'Rent Status'}</Typography>
			),
			// width: 200,
			flex: 0.5,
			renderCell: (params) => (
				<Box
					sx={{
						backgroundColor: getPaymentStatusColor(params.row.purchase_status || params.row.payment_status),
						width: '100%',
						height: '100%',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						padding: '0px',
						border: 'none',
						margin: '0px',
					}}
				>
					<Typography
						sx={{
							color: theme.palette.primary.main,
							fontWeight: theme.typography.primary.fontWeight,
							fontSize: '12px',
							margin: '0px',
							padding: '0px',
							height: '35px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							width: '100%',
							textAlign: 'center',
						}}
					>
						{params.row.purchase_status || params.row.payment_status}
					</Typography>
				</Box>
			),
		},
	];

	if (!data) {
		return <></>;
	}

	return (
		<>
			<DataGrid
				rows={data}
				columns={columns}
				getRowHeight={() => 'auto'}
				// slots={{
				//   columnHeaders: () => null,
				// }}
				getRowId={(row) => row.cf_month}
				initialState={{
					pagination: {
						paginationModel: {
							pageSize: 12,
						},
					},
				}}
				// pageSizeOptions={[5]}
				sx={{
					border: '0px',
				}}
				hideFooter={true}
			/>
		</>
	);
};


// Occupants Section
const OccupantsSection = ({ contactDetails }) => {
  //console.log('---contactDetails---', contactDetails);
	return (
		<Grid container spacing={2}>
			{/* Adults Section */}
			<OccupantsCategory
				label="Adults"
				occupants={contactDetails?.lease_adults || []}
				columns={['First Name', 'Last Name', 'Email', 'Phone Number', 'Relationship']}
			/>

			{/* Children Section */}
			<OccupantsCategory
				label="Children"
				occupants={contactDetails?.lease_children || []}
				columns={['First Name', 'Last Name', 'Email', 'Phone Number', 'Relationship']}
			/>

			{/* Pets Section */}
			<OccupantsCategory
				label="Pets"
				occupants={contactDetails?.lease_pets || []}
				columns={['Type', 'First Name', 'Last Name', 'Breed']}
			/>

			{/* Vehicles Section */}
			<OccupantsCategory
				label="Vehicles"
				occupants={contactDetails?.lease_vehicles || []}
				columns={['Year', 'Company', 'Model', 'License Plate', 'State', 'Owner']}
			/>
		</Grid>
	);
};

// Occupants Category (Reusable for different categories)
const OccupantsCategory = ({ label, occupants, columns }) => (
  <Grid item xs={12}>
    <Typography variant="h6" gutterBottom>{label} ({occupants.length})</Typography>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          {columns.map((column, index) => (
            <th key={index} style={{ borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left" }}>{column}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {occupants.map((occupant, index) => (
          <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
            {/* Ensure that the order of occupant data matches the column headers */}
            <td style={{ padding: "8px" }}>{occupant.name || occupant.type}</td>
            <td style={{ padding: "8px" }}>{occupant.last_name || occupant.name}</td>
            <td style={{ padding: "8px" }}>{occupant.email || occupant.last_name}</td>
            <td style={{ padding: "8px" }}>{occupant.phone_number || occupant.breed}</td>
            <td style={{ padding: "8px" }}>{occupant.relationship}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </Grid>
);


export default TenantContactDetail;
