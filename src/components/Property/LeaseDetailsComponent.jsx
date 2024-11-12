import React, { useEffect, useState, useContext } from 'react';
import {
	Box,
	Grid,
	Typography,
	Button,
	IconButton,
	Badge,
	Card,
	CardContent,
	Dialog,
	DialogActions,
	DialogTitle,
	DialogContent,
	ToolTip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { DataGrid } from '@mui/x-data-grid';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import theme from '../../theme/theme';
import FilePreviewDialog from '../Leases/FilePreviewDialog';
import { useNavigate } from 'react-router-dom';

import { datePickerSlotProps } from '../../styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ReactComponent as CalendarIcon } from '../../images/datetime.svg';
import useMediaQuery from '@mui/material/useMediaQuery';

import axios from 'axios';
import APIConfig from '../../utils/APIConfig';
import { useUser } from '../../contexts/UserContext';
import PropertiesContext from '../../contexts/PropertiesContext';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EndLeaseButton from '../Leases/EndLeaseButton';

export default function LeaseDetailsComponent({
	currentProperty,
	currentIndex,
	selectedRole,
	handleViewPMQuotesRequested,
	newContractCount,
	sentContractCount,
	handleOpenMaintenancePage,
	onShowSearchManager,
	handleViewContractClick,
	handleManageContractClick,
	handleAppClick,
	getAppColor,
}) {
  console.log('---currentProperty---', currentProperty);
	// console.log("---dhyey-- inside new component -", activeLease)
	// const { defaultContractFees, allContracts, currentContractUID, currentContractPropertyUID, isChange, setIsChange, fetchContracts,  } = useContext(LeaseContractContext);
	const { fetchProperties } = useContext(PropertiesContext);
	const [selectedPreviewFile, setSelectedPreviewFile] = useState(null);
	const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
	const navigate = useNavigate();
	const [showEndContractDialog, setShowEndContractDialog] = useState(false);
	const [showManagerEndContractDialog, setShowManagerEndContractDialog] = useState(false);
	const [showRenewContractDialog, setShowRenewContractDialog] = useState(false);
	const [contractEndNotice, setContractEndNotice] = useState(
		currentProperty?.lease_end_notice_period ? Number(currentProperty?.lease_end_notice_period) : 30
	);

	const tenant_detail =
		currentProperty && currentProperty.lease_start && currentProperty.tenant_uid
			? `${currentProperty.tenant_first_name} ${currentProperty.tenant_last_name}`
			: 'No Tenant';
	const activeLease = currentProperty.lease_status;
	const [isChange, setIsChange] = useState(false);
  const [isEndLeasePopupOpen, setIsEndLeasePopupOpen] = useState(false);
	// console.log("currentProperty?.maintenance - ", currentProperty?.maintenance);

	// useEffect(() => {
	//   // console.log("activeLease - ", activeLease);
	//   setContractEndNotice(currentProperty?.lease_end_notice_period ? Number(currentProperty?.lease_end_notice_period) : 30);
	// }, [activeLease]);

	const maintenanceGroupedByStatus = currentProperty?.maintenance?.reduce((acc, request) => {
		const status = request.maintenance_status;

		if (!acc[status]) {
			acc[status] = [];
		}

		acc[status].push(request);

		return acc;
	}, {});

	// console.log("maintenanceGroupedByStatus - ", maintenanceGroupedByStatus);

	const handleFileClick = (file) => {
		setSelectedPreviewFile(file);
		setPreviewDialogOpen(true);
	};

	const handlePreviewDialogClose = () => {
		setPreviewDialogOpen(false);
		setSelectedPreviewFile(null);
	};

	const handleManagerEndContractClick = (endDate) => {
		const formattedDate = endDate.format('MM-DD-YYYY');
		// console.log("handleEndContractClick - formattedDate - ", formattedDate);

		const formData = new FormData();

		// formData.append("contract_uid", currentContractUID);
		formData.append('lease_uid', currentProperty?.lease_uid);
		formData.append('lease_renew_status', 'ENDING');
		formData.append('lease_early_end_date', formattedDate);

		const url = `${APIConfig.baseURL.dev}/leaseApplication`;
		// const url = `http://localhost:4000/leaseApplication`;

		fetch(url, {
			method: 'PUT',
			body: formData,
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				} else {
					// console.log("Data updated successfully");
					setIsChange(false);
					fetchProperties();
				}
			})
			.catch((error) => {
				console.error('There was a problem with the fetch operation:', error);
			});
	};

	const handleRenewLease = () => {
		navigate('/tenantLease', {
			state: {
				page: 'renew_lease',
				application: currentProperty,
				property: currentProperty,
				managerInitiatedRenew: true,
			},
		});
	};

	return (
		<>
			<Card sx={{ backgroundColor: theme.palette.form.main, height: '100%' }}>
				<Box
					sx={{
						width: '100%',
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						marginBottom: '20px',
					}}
				>
					<Typography
						sx={{
							color: theme.typography.primary.black,
							fontWeight: theme.typography.primary.fontWeight,
							fontSize: theme.typography.largeFont,
							textAlign: 'center',
							paddingLeft: '100px',
							// flexGrow: 1
						}}
					>
						Lease Details
					</Typography>
				</Box>
				<CardContent>
					<Grid container spacing={3}>
						{/* Property Manager */}
						{selectedRole === 'OWNER' && (
							<Grid container item spacing={2}>
								<Grid item xs={6}>
									<Typography
										sx={{
											color: theme.typography.primary.black,
											fontWeight: theme.typography.secondary.fontWeight,
											fontSize: theme.typography.smallFont,
										}}
									>
										Tenant:
									</Typography>
								</Grid>
								<Grid item xs={6}>
									{activeLease ? (
										<Box display="flex" justifyContent="space-between" alignItems="center">
											<Typography
												sx={{
													color: theme.typography.primary.black,
													fontWeight: theme.typography.light.fontWeight,
													fontSize: theme.typography.smallFont,
												}}
											>
												{tenant_detail}
											</Typography>
											<KeyboardArrowRightIcon
												sx={{ color: 'blue', cursor: 'pointer' }}
												onClick={() => {
													if (activeLease && currentProperty.tenant_uid) {
														navigate('/ContactsPM', {
															state: {
																contactsTab: 'Tenant',
																tenantId: currentProperty.tenant_uid,
																fromPage: true,
																index: currentIndex,
															},
														});
													}
												}}
											/>
										</Box>
									) : (
										<Box display="flex" justifyContent="space-between" alignItems="center">
											<Typography
												sx={{
													color: theme.typography.primary.black,
													fontWeight: theme.typography.light.fontWeight,
													fontSize: theme.typography.smallFont,
												}}
											>
												No Tenant Selected
											</Typography>
										</Box>
									)}
								</Grid>
							</Grid>
						)}

						{/* Owner Info for Managers */}
						{selectedRole === 'MANAGER' && (
							<Grid container item spacing={2}>
								<Grid item xs={6}>
									<Typography
										sx={{
											color: theme.typography.primary.black,
											fontWeight: theme.typography.secondary.fontWeight,
											fontSize: theme.typography.smallFont,
										}}
									>
										Tenant:
									</Typography>
								</Grid>
								<Grid item xs={6}>
									<Box display="flex" justifyContent="space-between" alignItems="center">
										<Typography
											sx={{
												color: theme.typography.primary.black,
												fontWeight: theme.typography.light.fontWeight,
												fontSize: theme.typography.smallFont,
											}}
										>
											{tenant_detail}
										</Typography>
										<KeyboardArrowRightIcon
											sx={{ color: 'blue', cursor: 'pointer' }}
											onClick={() => {
												if (activeLease && currentProperty.tenant_uid) {
													navigate('/ContactsPM', {
														state: {
															contactsTab: 'Tenant',
															tenentId: currentProperty.tenant_uid,
														},
													});
												}
											}}
										/>
									</Box>
								</Grid>
							</Grid>
						)}

						{/* Lease Status */}
						<Grid container item spacing={2}>
							<Grid item xs={6}>
								<Typography
									sx={{
										color: theme.typography.primary.black,
										fontWeight: theme.typography.secondary.fontWeight,
										fontSize: theme.typography.smallFont,
									}}
								>
									Lease Status:
								</Typography>
							</Grid>
							<Grid item xs={6}>
								<Box display="flex" alignItems="center" justifyContent={'space-between'}>
									{currentProperty?.lease_status === 'ACTIVE' ? (
										<>
											<Typography
												sx={{
													color: theme.palette.success.main,
													fontWeight: theme.typography.secondary.fontWeight,
													fontSize: theme.typography.smallFont,
												}}
											>
												ACTIVE
											</Typography>
											{currentProperty?.lease_renew_status &&
												(currentProperty?.lease_renew_status === 'PM RENEW REQUESTED' ||
													currentProperty?.lease_renew_status.includes(
														'RENEW REQUESTED'
													)) && (
													<Typography
														sx={{
															color: currentProperty?.lease_renew_status?.includes(
																'RENEW'
															)
																? '#FF8A00'
																: '#A52A2A',
															fontWeight: theme.typography.secondary.fontWeight,
															fontSize: theme.typography.smallFont,
														}}
													>
														{currentProperty?.lease_renew_status?.includes('RENEW')
															? ' RENEWING'
															: currentProperty?.lease_renew_status}
													</Typography>
												)}
										</>
									) : (
										<Typography
											sx={{
												color: '#3D5CAC',
												fontWeight: theme.typography.secondary.fontWeight,
												fontSize: theme.typography.smallFont,
											}}
										>
											No Lease
										</Typography>
									)}
								</Box>
							</Grid>
						</Grid>

						{/* Lease Term */}
						{activeLease && (
							<Grid container item spacing={2}>
								<Grid item xs={6}>
									<Typography
										sx={{
											color: theme.typography.primary.black,
											fontWeight: theme.typography.secondary.fontWeight,
											fontSize: theme.typography.smallFont,
										}}
									>
										Lease Term:
									</Typography>
								</Grid>
								<Grid item xs={6}>
									<Typography
										sx={{
											color: theme.typography.primary.black,
											fontWeight: theme.typography.light.fontWeight,
											fontSize: theme.typography.smallFont,
										}}
									>
										{currentProperty?.lease_start}
										<span style={{ fontWeight: 'bold', margin: '0 10px' }}>to</span>
										{currentProperty?.lease_end}
									</Typography>
								</Grid>
							</Grid>
						)}

						{(selectedRole === 'OWNER' || selectedRole === 'MANAGER') && activeLease && (
							<Grid container item spacing={2} sx={{ marginTop: '3px', marginBottom: '5px' }}>
								<Grid
									item
									xs={6}
									sx={{
										display: 'flex',
										justifyContent: 'center',
										alignItems: 'center',
										height: '100%',
									}}
								>
									<Button
										onClick={() => setIsEndLeasePopupOpen(true)}
										variant="contained"
										sx={{
											background: '#3D5CAC',
											color: theme.palette.background.default,
											cursor: 'pointer',
											paddingX: '10px',
											textTransform: 'none',
											maxWidth: '120px', // Fixed width for the button
											maxHeight: '100%',
										}}
										size="small"
									>
										<Typography
											sx={{
												textTransform: 'none',
												color: '#FFFFFF',
												fontWeight: theme.typography.secondary.fontWeight,
												fontSize: '12px',
												whiteSpace: 'nowrap',
												//   marginLeft: "1%", // Adjusting margin for icon and text
											}}
										>
											{'End Lease'}
										</Typography>
									</Button>
								</Grid>
								<Grid
									item
									xs={6}
									sx={{
										display: 'flex',
										justifyContent: 'center',
										alignItems: 'center',
										height: '100%',
									}}
								>
									<Button
										onClick={() => {
											handleRenewLease();
										}}
										variant="contained"
										sx={{
											background: '#3D5CAC',
											color: theme.palette.background.default,
											cursor: 'pointer',
											paddingX: '10px',
											textTransform: 'none',
											maxWidth: '120px', // Fixed width for the button
											maxHeight: '100%',
										}}
										size="small"
									>
										<Typography
											sx={{
												textTransform: 'none',
												color: '#FFFFFF',
												fontWeight: theme.typography.secondary.fontWeight,
												fontSize: '12px',
												whiteSpace: 'nowrap',
												//   marginLeft: "1%", // Adjusting margin for icon and text
											}}
										>
											{'Edit/Renew Lease'}
										</Typography>
									</Button>
								</Grid>
							</Grid>
						)}

						{/* Lease Fees */}
						{activeLease && (
							<Grid item xs={12}>
								<Accordion theme={theme} sx={{ backgroundColor: '#e6e6e6', marginTop: '10px' }}>
									<AccordionSummary
										expandIcon={<ExpandMoreIcon />}
										aria-controls="lease-fees-content"
										id="lease-fees-header"
									>
										<Typography
											sx={{
												color: theme.typography.primary.black,
												fontWeight: theme.typography.secondary.fontWeight,
												fontSize: theme.typography.smallFont,
											}}
										>
											Lease Fees
										</Typography>
									</AccordionSummary>
									<AccordionDetails>
										<Grid container item spacing={2}>
											{currentProperty?.lease_fees ? (
												<FeesSmallDataGrid data={JSON.parse(currentProperty?.lease_fees)} />
											) : (
												<Box
													sx={{
														display: 'flex',
														justifyContent: 'center',
														alignItems: 'center',
														width: '100%',
														height: '40px',
														marginTop: '10px',
													}}
												>
													<Typography
														sx={{
															color: '#A9A9A9',
															fontWeight: theme.typography.primary.fontWeight,
															fontSize: theme.typography.smallFont,
														}}
													>
														No Fees
													</Typography>
												</Box>
											)}
										</Grid>
									</AccordionDetails>
								</Accordion>
							</Grid>
						)}

						{/* Lease Documents */}
            {activeLease && (
    <Grid item xs={12}>
        {currentProperty?.lease_documents && JSON.parse(currentProperty.lease_documents).length > 0 ? (
            <Accordion theme={theme} sx={{ backgroundColor: '#e6e6e6', marginTop: '10px' }}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="lease-documents-content"
                    id="lease-documents-header"
                >
                    <Typography
                        sx={{
                            color: theme.typography.primary.black,
                            fontWeight: theme.typography.secondary.fontWeight,
                            fontSize: theme.typography.smallFont,
                        }}
                    >
                        Lease Documents
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container item>
                        <DocumentSmallDataGrid
                            data={JSON.parse(currentProperty.lease_documents)}
                            handleFileClick={handleFileClick}
                        />
                    </Grid>
                </AccordionDetails>
            </Accordion>
        ) : (
            <Box sx={{ marginTop: '10px' }}>
                <Typography
                    sx={{
                        color: theme.typography.primary.black,
                        fontWeight: theme.typography.secondary.fontWeight,
                        fontSize: theme.typography.smallFont,
                    }}
                >
                    Lease Documents
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        height: '40px',
                        marginTop: '10px',
                    }}
                >
                    <Typography
                        sx={{
                            color: '#A9A9A9',
                            fontWeight: theme.typography.primary.fontWeight,
                            fontSize: theme.typography.smallFont,
                        }}
                    >
                        No Documents
                    </Typography>
                </Box>
            </Box>
        )}
    </Grid>
)}



						{currentProperty && currentProperty.applications.length > 0 && (
							<>
								<Grid item xs={12} >
									<Box sx={{ display: 'flex', alignItems: 'center' }}>
										<Typography
											sx={{
												textTransform: 'none',
												color: theme.typography.primary.black,
												fontWeight: theme.typography.secondary.fontWeight,
												fontSize: theme.typography.smallFont,
												paddingRight: '103px',
											}}
										>
											Applications:
										</Typography>
										<Box
											sx={{
												display: 'flex',
												alignItems: 'center',
												cursor: 'pointer',
											}}
										>
											<Badge
												color="success"
												badgeContent={
													currentProperty.applications.filter(
														(app) =>
															app.lease_status.includes('NEW') ||
															app.lease_status.includes('PROCESSING')
													).length
												}
												showZero
												sx={{
													paddingRight: '50px',
												}}
											/>
										</Box>
									</Box>
								</Grid>
								<Grid item xs={12} >
									<Accordion theme={theme} sx={{ backgroundColor: '#e6e6e6', marginLeft: '-5px' }}>
										<AccordionSummary
											expandIcon={<ExpandMoreIcon />}
											aria-controls="panel1-content"
											id="panel1-header"
										>
											<Typography
												sx={{
													textTransform: 'none',
													color: theme.typography.primary.black,
													fontWeight: theme.typography.secondary.fontWeight,
													fontSize: theme.typography.smallFont,
												}}
											>
												View All Applications
											</Typography>
										</AccordionSummary>
										<AccordionDetails
											sx={{
												display: 'flex',
												flexDirection: 'column',
												padding: '0px 5px 5px 5px',
											}}
										>
											{currentProperty.applications.map((app, index) => (
												<Button
													key={index}
													onClick={() => handleAppClick(index)}
													sx={{
														backgroundColor: getAppColor(app),
														color: '#FFFFFF',
														textTransform: 'none',
														width: '100%',
														height: '70px',
														display: 'flex',
														flexDirection: 'column',
														justifyContent: 'center',
														alignItems: 'center',
														marginBottom: 2,
														'&:hover, &:focus, &:active': {
															backgroundColor: getAppColor(app),
														},
													}}
												>
													{/* Box for full name and date on one line */}
													<Box
														sx={{
															display: 'flex',
															justifyContent: 'center',
															alignItems: 'center',
															width: '100%',
														}}
													>
														<Typography
															sx={{
																fontSize: theme.typography.smallFont,
																mr: 1,
															}}
														>
															{app.tenant_first_name + ' ' + app.tenant_last_name + ' '}
														</Typography>
														<Typography
															sx={{
																fontWeight: 'bold',
																fontSize: theme.typography.smallFont,
															}}
														>
															{app.lease_application_date}
														</Typography>
													</Box>

													{/* Box for status on the next line */}
													<Box
														sx={{
															display: 'flex',
															justifyContent: 'center',
															width: '100%',
														}}
													>
														<Typography
															sx={{
																fontWeight: 'bold',
																fontSize: theme.typography.smallFont,
															}}
														>
															{app.lease_status}
														</Typography>
													</Box>
												</Button>
											))}
										</AccordionDetails>
									</Accordion>
								</Grid>
							</>
						)}

{isEndLeasePopupOpen && (
    <Dialog open={isEndLeasePopupOpen} onClose={() => setIsEndLeasePopupOpen(false)} maxWidth="md" fullWidth>
        <EndLeaseButton
            theme={theme}
            fromProperties={true}
            leaseDetails={currentProperty} // Pass the lease details as props
            selectedLeaseId={currentProperty?.lease_uid} // Adjust based on your lease ID reference
            setIsEndClicked={setIsEndLeasePopupOpen} // Close popup when done
            handleUpdate={fetchProperties} // Any update handler to refresh data
        />
    </Dialog>
)}

						{/* <Grid container item spacing={2}>
                        <Grid item xs={6}>
                        <Typography
                            sx={{
                                color: theme.typography.primary.black,
                                fontWeight: theme.typography.secondary.fontWeight,
                                fontSize: theme.typography.smallFont,
                            }}
                        >
                            Open Maintenance Tickets:
                        </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            {
                                maintenanceGroupedByStatus && Object.values(maintenanceGroupedByStatus)?.map( status => {
                                    return (
                                        <IconButton 
                                            sx={{marginLeft: "1.5px", paddingTop: "3px"}} 
                                            // onClick={() => {handleOpenMaintenancePage()}}
                                        >
                                            <Badge badgeContent={status?.length || 0} color="error" showZero/>
                                        </IconButton>
                                    );
                                })
                            }
                        </Grid>
                    </Grid> */}
					</Grid>
				</CardContent>
			</Card>
			{previewDialogOpen && selectedPreviewFile && (
				<FilePreviewDialog file={selectedPreviewFile} onClose={handlePreviewDialogClose} />
			)}
			<EndContractDialog
				open={showEndContractDialog}
				handleClose={() => setShowEndContractDialog(false)}
				contract={activeLease}
			/>
			{showManagerEndContractDialog && (
				<Box>
					<ManagerEndContractDialog
						open={showManagerEndContractDialog}
						handleClose={() => setShowManagerEndContractDialog(false)}
						onEndContract={handleManagerEndContractClick}
						noticePeriod={contractEndNotice}
					/>
				</Box>
			)}
			<RenewContractDialog
				open={showRenewContractDialog}
				handleClose={() => setShowRenewContractDialog(false)}
				contract={activeLease}
			/>{' '}
		</>
	);
}

export const FeesSmallDataGrid = ({ data }) => {
	const commonStyles = {
		color: theme.typography.primary.black,
		fontWeight: theme.typography.light.fontWeight,
		fontSize: theme.typography.smallFont,
	};

	const columns = [
		{
			field: 'frequency',
			headerName: 'Frequency',
			flex: 1,
			renderHeader: (params) => (
				<strong style={{ fontSize: theme.typography.smallFont }}>{params.colDef.headerName}</strong>
			),
			renderCell: (params) => <Typography sx={commonStyles}>{params.value}</Typography>,
		},
		{
			field: 'fee_name',
			headerName: 'Name',
			flex: 1.2,
			renderHeader: (params) => (
				<strong style={{ fontSize: theme.typography.smallFont }}>{params.colDef.headerName}</strong>
			),
			renderCell: (params) => <Typography sx={commonStyles}>{params.value}</Typography>,
		},
		{
			field: 'charge',
			headerName: 'Charge',
			flex: 0.8,
			renderHeader: (params) => (
				<strong style={{ fontSize: theme.typography.smallFont }}>{params.colDef.headerName}</strong>
			),
			renderCell: (params) => {
				const feeType = params.row?.fee_type;
				const charge = params.value;

				return <Typography sx={commonStyles}>{charge}</Typography>;
			},
		},
		{
			field: 'fee_type',
			headerName: 'fee_type',
			flex: 1,
			renderHeader: (params) => (
				<strong style={{ fontSize: theme.typography.smallFont }}>{params.colDef.headerName}</strong>
			),
			renderCell: (params) => {
				const feeType = params.row?.fee_type;
				const fee_type = params.value;

				return <Typography sx={commonStyles}>{fee_type}</Typography>;
			},
		},
	];

	// Adding a unique id to each row using map if the data doesn't have an id field
	const rowsWithId = data.map((row, index) => ({
		...row,
		id: row.id ? index : index,
	}));

	return (
		<DataGrid
			rows={rowsWithId}
			columns={columns}
			sx={{
				marginY: '5px',
				overflow: 'auto',
				'& .MuiDataGrid-columnHeaders': {
					minHeight: '35px !important',
					maxHeight: '35px !important',
					height: 35,
				},
			}}
			autoHeight
			rowHeight={35}
			hideFooter={true} // Display footer with pagination
		/>
	);
};

export const DocumentSmallDataGrid = ({ data, handleFileClick }) => {
	const commonStyles = {
		color: theme.typography.primary.black,
		fontWeight: theme.typography.light.fontWeight,
		fontSize: theme.typography.smallFont,
	};

	const DocColumn = [
		{
			field: 'filename',
			headerName: 'Filename',
			renderCell: (params) => {
				return (
					<Box
						sx={{
							...commonStyles,
							cursor: 'pointer', // Change cursor to indicate clickability
							color: '#3D5CAC',
						}}
						onClick={() => handleFileClick(params.row)}
					>
						{params.row.filename}
					</Box>
				);
			},
			flex: 2.2,
			renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
		},
		{
			field: 'contentType',
			headerName: 'Content Type',
			flex: 1.8,
			renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
			renderCell: (params) => <Typography sx={commonStyles}>{params.value}</Typography>,
		},
	];

	const rowsWithId = data.map((row, index) => ({
		...row,
		id: row.id ? index : index,
	}));

	return (
		<DataGrid
			rows={rowsWithId}
			columns={DocColumn}
			hideFooter={true}
			autoHeight
			rowHeight={35}
			sx={{
				marginY: '5px',
				overflow: 'auto',
				'& .MuiDataGrid-columnHeaders': {
					minHeight: '35px !important',
					maxHeight: '35px !important',
					height: 35,
				},
			}}
		/>
	);
};

const EndContractDialog = ({ open, handleClose, contract }) => {
	const ONE_DAY_MS = 1000 * 60 * 60 * 24;

	const [contractEndDate, setContractEndDate] = useState(
		contract?.contract_end_date ? new Date(contract?.contract_end_date) : null
	);
	const today = new Date();
	const noticePeriod = contract?.contract_notice_period || 30;
	// console.log("noticePeriod - ", noticePeriod);
	const [selectedEndDate, setSelectedEndDate] = useState(dayjs(contractEndDate));

	useEffect(() => {
		// console.log("selectedEndDate - ", selectedEndDate);
		setContractEndDate(contract?.contract_end_date ? new Date(contract?.contract_end_date) : null);
	}, [contract]);

	useEffect(() => {
		// console.log("selectedEndDate - ", selectedEndDate);
		// console.log("contractEndDate - noticePeriod - ", new Date(contractEndDate?.getTime() - noticePeriod * ONE_DAY_MS));
		setSelectedEndDate(dayjs(contractEndDate));
	}, [contractEndDate]);

	let contractRenewStatus = '';

	const handleEndContract = (event) => {
		event.preventDefault();

		if (selectedEndDate.toDate() >= contractEndDate) {
			if (today <= new Date(contractEndDate.getTime() - noticePeriod * ONE_DAY_MS)) {
				contractRenewStatus = 'ENDING';
			} else {
				contractRenewStatus = 'EARLY TERMINATION';
			}
		} else {
			contractRenewStatus = 'EARLY TERMINATION';
		}

		const formData = new FormData();
		formData.append('contract_uid', contract.contract_uid);
		// formData.append("contract_status", "ENDING");
		formData.append('contract_renew_status', contractRenewStatus);
		if (contractRenewStatus === 'EARLY TERMINATION') {
			formData.append('contract_early_end_date', selectedEndDate.format('MM-DD-YYYY'));
		}

		try {
			fetch(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/contracts`, {
				method: 'PUT',
				body: formData,
			})
				.then((response) => {
					if (!response.ok) {
						throw new Error('Network response was not ok');
					} else {
						console.log('Data added successfully');
					}
				})
				.catch((error) => {
					console.error('There was a problem with the fetch operation:', error);
				});
		} catch (error) {
			console.error(error);
		}

		handleClose();
	};

	return (
		<form onSubmit={handleEndContract}>
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
				<DialogTitle sx={{ justifyContent: 'center' }}>
					End Current Contract
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
				</DialogTitle>
				<DialogContent>
					<Grid container>
						<Grid container item xs={12} sx={{ marginTop: '10px' }}>
							<Grid item xs={12}>
								<Typography sx={{ fontWeight: 'bold', color: '#3D5CAC' }}>
									This contract is scheduled to end on {contract?.contract_end_date}.
								</Typography>
							</Grid>
						</Grid>
						<Grid item xs={12} sx={{ marginTop: '15px' }}>
							<Typography sx={{ width: 'auto' }}>Please select the desired end date.</Typography>
						</Grid>
					</Grid>
					<Grid container item xs={3} sx={{ marginTop: '10px' }}>
						<Grid item xs={12}>
							<Typography sx={{ fontWeight: 'bold', color: '#3D5CAC' }}>End Date</Typography>
						</Grid>
						<Grid item xs={12}>
							<LocalizationProvider dateAdapter={AdapterDayjs}>
								<DatePicker
									value={selectedEndDate}
									// minDate={minEndDate}
									onChange={(v) => setSelectedEndDate(v)}
									slots={{
										openPickerIcon: CalendarIcon,
									}}
									slotProps={datePickerSlotProps}
								/>
							</LocalizationProvider>
						</Grid>
					</Grid>
					<Grid container>
						<Grid container item xs={12} sx={{ marginTop: '10px' }}>
							<Grid item xs={12}>
								{/* <Typography sx={{fontWeight: 'bold', color: 'red'}}>
                                    DEBUG - notice period is 30 days by default if not specified.
                                </Typography> */}
								<Typography sx={{ fontWeight: 'bold', color: 'red' }}>
									Contract UID - {contract?.contract_uid}
								</Typography>
							</Grid>
						</Grid>
					</Grid>
				</DialogContent>

				<DialogActions>
					<Button
						type="submit"
						onClick={handleEndContract}
						sx={{
							'&:hover': {
								backgroundColor: '#160449',
							},
							backgroundColor: '#3D5CAC',
							color: '#FFFFFF',
							fontWeight: 'bold',
						}}
					>
						End Contract
					</Button>
					<Button
						onClick={handleClose}
						sx={{
							'&:hover': {
								backgroundColor: '#160449',
							},
							backgroundColor: '#3D5CAC',
							color: '#FFFFFF',
							fontWeight: 'bold',
						}}
					>
						Keep Existing Contract
					</Button>
				</DialogActions>
			</Dialog>
		</form>
	);
};

function ManagerEndContractDialog({ open, handleClose, onEndContract, noticePeriod }) {
	const noticePeriodDays = parseInt(noticePeriod, 10);
	const minEndDate = dayjs().add(noticePeriodDays, 'day');
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	// console.log("minEndDate - ", minEndDate);
	const formattedMinEndDate = minEndDate.format('MM/DD/YYYY');

	const [earlyEndDate, setEarlyEndDate] = useState(minEndDate);

	const handleEndContract = (event) => {
		event.preventDefault();

		onEndContract(earlyEndDate);
		handleClose();
	};

	return (
		<form onSubmit={handleEndContract}>
			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="xl"
				sx={{
					'& .MuiDialog-paper': {
						width: isMobile ? '75%' : '60%',
						maxWidth: 'none',
					},
				}}
			>
				<DialogTitle sx={{ justifyContent: 'center' }}>End Current Contract</DialogTitle>
				<DialogContent>
					<Grid container>
						<Grid item xs={12}>
							{/* <Typography sx={{width: 'auto', color: 'red'}}>
                {`DEBUG - Notice period is 30 days by default if not specified.`}
            </Typography> */}
							<Typography sx={{ width: 'auto' }}>
								{`The notice period to end this contract is ${noticePeriod} days. The earliest possible end date is ${formattedMinEndDate}.`}
							</Typography>
						</Grid>
						<Grid container item xs={12} md={5} sx={{ marginTop: '10px' }}>
							<Grid item xs={12}>
								<Typography sx={{ fontWeight: 'bold', color: '#3D5CAC' }}>
									Please select contract end date
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
						<Grid item xs={12} sx={{ marginTop: '15px' }}>
							<Typography
								sx={{ width: 'auto' }}
							>{`Are you sure you want to end this contract?`}</Typography>
						</Grid>
					</Grid>
				</DialogContent>

				<DialogActions>
					<Button
						type="submit"
						onClick={handleEndContract}
						sx={{
							'&:hover': {
								backgroundColor: '#160449',
							},
							backgroundColor: '#3D5CAC',
							color: '#FFFFFF',
							fontWeight: 'bold',
						}}
					>
						Yes
					</Button>
					<Button
						onClick={handleClose}
						sx={{
							'&:hover': {
								backgroundColor: '#160449',
							},
							backgroundColor: '#3D5CAC',
							color: '#FFFFFF',
							fontWeight: 'bold',
						}}
					>
						No
					</Button>
				</DialogActions>
			</Dialog>
		</form>
	);
}

const RenewContractDialog = ({ open, handleClose, contract }) => {
	const { getProfileId } = useUser();
	const ONE_DAY_MS = 1000 * 60 * 60 * 24;

	const [contractEndDate, setContractEndDate] = useState(
		contract?.contract_end_date ? new Date(contract?.contract_end_date) : null
	);
	const today = new Date();
	const noticePeriod = contract?.contract_notice_period || 30;
	// console.log("noticePeriod - ", noticePeriod);
	const [selectedEndDate, setSelectedEndDate] = useState(dayjs(contractEndDate));

	useEffect(() => {
		// console.log("selectedEndDate - ", selectedEndDate);
		setContractEndDate(contract?.contract_end_date ? new Date(contract?.contract_end_date) : null);
	}, [contract]);

	useEffect(() => {
		// console.log("selectedEndDate - ", selectedEndDate);
		// console.log("contractEndDate - noticePeriod - ", new Date(contractEndDate?.getTime() - noticePeriod * ONE_DAY_MS));
		setSelectedEndDate(dayjs(contractEndDate));
	}, [contractEndDate]);

	const sendAnnouncement = async () => {
		const currentDate = new Date();
		const formattedDate = `${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(
			currentDate.getDate()
		).padStart(2, '0')}-${currentDate.getFullYear()}`;
		const announcementTitle = `Contract Renewal Request`;
		const propertyUnit = contract.property_unit ? ' Unit - ' + contract.property_unit : '';
		const announcementMsg = `The owner(${contract.owner_uid}) of ${contract.property_address}${propertyUnit} has requested a renewal of the Lease contract.`;

		let annProperties = JSON.stringify({ [contract.business_uid]: [contract.property_uid] });

		let announcement_data = JSON.stringify({
			announcement_title: announcementTitle,
			announcement_msg: announcementMsg,
			announcement_sender: getProfileId(),
			announcement_date: formattedDate,
			announcement_properties: annProperties,
			announcement_mode: 'CONTRACT',
			announcement_receiver: [contract.business_uid],
			announcement_type: ['App', 'Email', 'Text'],
		});

		let config = {
			method: 'post',
			maxBodyLength: Infinity,
			url: `https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/announcements/${getProfileId()}`,
			// url: `http://localhost:4000/announcements/${ownerId}`,
			headers: {
				'Content-Type': 'application/json',
			},
			data: announcement_data,
		};

		try {
			const response = await axios.request(config);
			console.log(JSON.stringify(response.data));
		} catch (error) {
			console.log(error);
		}
	};

	const handleRenewContract = (event) => {
		event.preventDefault();

		const contractRenewStatus = 'RENEW REQUESTED';

		const formData = new FormData();
		formData.append('contract_uid', contract.contract_uid);
		formData.append('contract_renew_status', contractRenewStatus);

		try {
			fetch(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/contracts`, {
				method: 'PUT',
				body: formData,
			})
				.then((response) => {
					if (!response.ok) {
						throw new Error('Network response was not ok');
					} else {
						console.log('Data added successfully');
					}
				})
				.catch((error) => {
					console.error('There was a problem with the fetch operation:', error);
				});
		} catch (error) {
			console.error(error);
		}

		sendAnnouncement();

		handleClose();
	};

	return (
		<form onSubmit={handleRenewContract}>
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
				<DialogTitle sx={{ justifyContent: 'center' }}>
					Renew Current Contract
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
				</DialogTitle>
				<DialogContent>
					<Grid container>
						<Grid container item xs={12} sx={{ marginTop: '10px' }}>
							<Grid item xs={12}>
								<Typography sx={{ fontWeight: 'bold', color: '#3D5CAC' }}>
									This contract is scheduled to end on {contract?.contract_end_date}.
								</Typography>
							</Grid>
						</Grid>
						<Grid item xs={12} sx={{ marginTop: '15px' }}>
							<Typography sx={{ width: 'auto' }}>
								Would you like to renew this contract with {contract?.business_name}?
							</Typography>
						</Grid>
					</Grid>
				</DialogContent>

				<DialogActions>
					<Button
						type="submit"
						onClick={handleRenewContract}
						sx={{
							'&:hover': {
								backgroundColor: '#160449',
							},
							backgroundColor: '#3D5CAC',
							color: '#FFFFFF',
							fontWeight: 'bold',
						}}
					>
						Request Renewal
					</Button>
					<Button
						onClick={handleClose}
						sx={{
							'&:hover': {
								backgroundColor: '#160449',
							},
							backgroundColor: '#3D5CAC',
							color: '#FFFFFF',
							fontWeight: 'bold',
						}}
					>
						Cancel
					</Button>
				</DialogActions>
			</Dialog>
		</form>
	);
};
