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
	responsiveFontSizes,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import theme from '../../../theme/theme';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import ChatIcon from '@mui/icons-material/Chat';
import CancelButton from '../MaintenanceComponents/CancelButton';
import CompleteButton from '../MaintenanceComponents/CompleteButton';
import { useUser } from '../../../contexts/UserContext';
import TenantProfileLink from '../../Maintenance/MaintenanceComponents/TenantProfileLink';
import OwnerProfileLink from '../../Maintenance/MaintenanceComponents/OwnerProfileLink';
import DateTimePickerModal from '../../DateTimePicker';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import handleScheduleStatusChange from './QuotesAccepted';
import APIConfig from '../../../utils/APIConfig';
import useMediaQuery from '@mui/material/useMediaQuery';
import AlertMessage from "../AlertMessage";
import { useMaintenance } from "../../../contexts/MaintenanceContext";

export default function QuotesRequestAction({ maintenanceItem, navigateParams, quotes, setRefresh }) {
	const navigate = useNavigate();
	const { maintenanceRoutingBasedOnSelectedRole } = useUser();
	const [showMessage, setShowMessage] = useState(false);
	const [maintenanceItemQuotes, setMaintenanceItemQuotes] = useState([]);
	const [message, setMessage] = useState('');
	const [showModal, setShowModal] = useState(false);
	const [date, setDate] = useState(maintenanceItem?.earliest_available_date || '');
	const [time, setTime] = useState(maintenanceItem?.earliest_available_time || '');
	const [showSpinner, setShowSpinner] = useState(false);
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const { quoteRequestView, setQuoteRequestView ,    maintenanceData: contextMaintenanceItem, 
		navigateParams: contextNavigateParams,  maintenanceQuotes, setMaintenanceQuotes, setNavigateParams, setMaintenanceData,setSelectedStatus, setSelectedRequestIndex, setAllMaintenanceData } = useMaintenance();
    

	useEffect(() => {
		setMaintenanceItemQuotes(quotes);
		// console.log("--debug-- maintenanceItemQuotes", maintenanceItemQuotes, quotes)
	}, [quotes]);

	async function handleScheduleStatusChange(id, date, time) {
		const changeMaintenanceRequestStatus = async () => {
			setShowSpinner(true);
			const formData = new FormData();
			formData.append('maintenance_request_uid', id);
			formData.append('maintenance_request_status', 'SCHEDULED');
			formData.append('maintenance_scheduled_date', date);
			formData.append('maintenance_scheduled_time', time);
			formData.append('maintenance_assigned_business', maintenanceItem.maint_business_uid);
			try {
				const response = await fetch(`${APIConfig.baseURL.dev}/maintenanceRequests`, {
					method: 'PUT',
					body: formData,
				});

				const responseData = await response.json();
				console.log(responseData);
				if (response.status === 200) {
					console.log('success');
				} else {
					console.log('error setting status');
				}
			} catch (error) {
				console.log('error', error);
			}
			setShowSpinner(false);
		};
		const changeMaintenanceQuoteStatus = async () => {
			console.log(maintenanceItemQuotes.length !== 0, quotes.length !== 0);
			setShowSpinner(true);
			const formData = new FormData();
			let quote = quotes.find((quote) => quote.quote_status === 'ACCEPTED'); // see number 16 in "Testing Maintenance Flow" ticket
			if (quote) {
				console.log('changeMaintenanceQuoteStatus maintenanceItemQuotes', maintenanceItemQuotes);
				console.log(quote);
				formData.append('maintenance_quote_uid', quote.maintenance_quote_uid); // 900-xxx
				formData.append('quote_maintenance_request_id', id); //quote_maintenance_request_id maintenance_request_uid
				formData.append('quote_status', 'SCHEDULED');

				try {
					const response = await fetch(`${APIConfig.baseURL.dev}/maintenanceQuotes`, {
						method: 'PUT',
						body: formData,
					});

					const responseData = await response.json();
					console.log(responseData);
					if (response.status === 200) {
						console.log('success');
						changeMaintenanceRequestStatus();
						navigate(maintenanceRoutingBasedOnSelectedRole(), { state: { refresh: true } });
					} else {
						console.log('error setting status');
					}
				} catch (error) {
					console.log('error', error);
				}
			} else {
				changeMaintenanceRequestStatus();
				navigate(maintenanceRoutingBasedOnSelectedRole(), { state: { refresh: true } });
			}
			setShowSpinner(false);
		};
		await changeMaintenanceQuoteStatus();
		// navigate(maintenanceRoutingBasedOnSelectedRole())
	}

	function handleNavigateToQuotesAccept() {
		console.log('NewRequestAction', maintenanceItem);
		console.log(navigateParams);
		if (isMobile) {
			navigate('/quoteAccept', {
				state: {
					maintenanceItem,
					navigateParams,
					quotes,
				},
			});
		} else {
			if (maintenanceItem && navigateParams) {
				try {
					const maintenanceItemStr = JSON.stringify(maintenanceItem);
					const navigateParamsStr = JSON.stringify(navigateParams);
					const quotesStr = JSON.stringify(quotes);
					console.log('Storing data in sessionStorage: ', quotesStr);

					// Save data to sessionStorage
					sessionStorage.setItem('maintenanceItem', maintenanceItemStr);
					sessionStorage.setItem('navigateParams', navigateParamsStr);
					sessionStorage.setItem('quotes', quotesStr);
					sessionStorage.setItem('selectedRequestIndex', navigateParams.maintenanceRequestIndex);
					sessionStorage.setItem('selectedStatus', navigateParams.status);
					sessionStorage.setItem('quoteAcceptView', 'true');
					window.dispatchEvent(new Event('storage'));
					setTimeout(() => {
						window.dispatchEvent(new Event('maintenanceRequestSelected'));
					}, 0);
				} catch (error) {
					console.error('Error setting sessionStorage: ', error);
				}
			} else {
				console.error('maintenanceItem or navigateParams is undefined');
			}
		}
	}

	function handleNavigateToQuotesRequested() {
		if (isMobile) {
			navigate('/quoteRequest', {
				state: {
					maintenanceItem,
					navigateParams,
					quotes,
				},
			});
		} else {
			if (maintenanceItem && navigateParams) {

				try {
                    setMaintenanceData(maintenanceItem);
                    setNavigateParams(navigateParams);
					setMaintenanceQuotes(quotes);
                    setSelectedRequestIndex(navigateParams.maintenanceRequestIndex);
                    setSelectedStatus(navigateParams.status);
					setQuoteRequestView(true);
				} catch (error) {
					console.error('Error setting sessionStorage: ', error);
				}
			} else {
				console.error('maintenanceItem or navigateParams is undefined');
			}
		}
	}

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'center',
				width: '100%',
			}}
		>
			<Box
				sx={{
					display: 'flex',  // Flexbox for horizontal alignment
					justifyContent: 'space-between',  // Ensures space between buttons
					flexWrap: 'nowrap',  // Prevent wrapping on larger screens
					gap: 5,  // Space between buttons
					width: '100%',
					padding: '20px',
				}}
			>
				{/* <Button
					variant="contained"
					sx={{
					backgroundColor: '#a7b8e6',
					color: '#160449',
					textTransform: 'none',
					fontWeight: 'bold',
					borderRadius: '8px',
					height: '120px',
					width: '200px', 
					padding: '10px',
					'&:hover': {
						backgroundColor: '#a7b8e6',
					},
					}}
					onClick={() => handleNavigateToQuotesAccept()}
				>
					View Quotes
				</Button> */}

				<Button
					variant="contained"
					sx={{
					backgroundColor: '#FFC614',
					color: '#160449',
					textTransform: 'none',
					fontWeight: 'bold',
					borderRadius: '8px',
					height: '120px',
					width: '200px',   
					padding: '10px',
					'&:hover': {
						backgroundColor: '#FFC614',
					},
					}}
					onClick={() => setShowModal(true)}
				>
					Schedule
				</Button>

				<Button
					variant="contained"
					sx={{
					backgroundColor: '#F87C7A',
					color: '#160449',
					textTransform: 'none',
					fontWeight: 'bold',
					borderRadius: '8px',
					height: '120px',
					width: '200px',   
					padding: '10px',
					'&:hover': {
						backgroundColor: '#F87C7A',
					},
					}}
					onClick={() => handleNavigateToQuotesRequested()}
				>
					Request Quotes
				</Button>

				<CompleteButton maintenanceItem={maintenanceItem} quotes={quotes} setShowMessage={setShowMessage} setMessage={setMessage} setRefresh = {setRefresh}/>
			</Box>

            <AlertMessage showMessage={showMessage} setShowMessage={setShowMessage} message={message} />
			<DateTimePickerModal
				setOpenModal={setShowModal}
				open={showModal}
				maintenanceItem={maintenanceItem}
				date={date}
				time={time}
				handleSubmit={handleScheduleStatusChange}
			/>
		</Box>
	);
}
