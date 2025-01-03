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
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import theme from '../../../theme/theme';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import ChatIcon from '@mui/icons-material/Chat';
import CancelTicket from '../../utils/CancelTicket';
import CompleteTicket from '../../utils/CompleteTicket';
import CancelButton from '../MaintenanceComponents/CancelButton';
import CompleteButton from '../MaintenanceComponents/CompleteButton';
import { useUser } from '../../../contexts/UserContext';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import TenantProfileLink from '../../Maintenance/MaintenanceComponents/TenantProfileLink';
import OwnerProfileLink from '../../Maintenance/MaintenanceComponents/OwnerProfileLink';
import useMediaQuery from '@mui/material/useMediaQuery';
import APIConfig from '../../../utils/APIConfig';
import { useMaintenance } from "../../../contexts/MaintenanceContext";
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../../utils/httpMiddleware";

export default function ScheduleMaintenance({ maintenanceItem,navigateParams, quotes, setRefresh, fetchAndUpdateQuotes }) {
	const location = useLocation();
	const navigate = useNavigate();
	const { maintenanceRoutingBasedOnSelectedRole } = useUser();
	const [showSpinner, setShowSpinner] = useState(false);
	const [showMessage, setShowMessage] = useState(false);
	const [maintenanceItemQuotes, setMaintenanceItemQuotes] = useState([]);
	const [message, setMessage] = useState('');
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const { quoteRequestView, setQuoteRequestView , maintenanceData , 
		navigateParams: contextNavigateParams,  rescheduleView, setRescheduleView, setMaintenanceQuotes, setNavigateParams, setMaintenanceData,setSelectedStatus, setSelectedRequestIndex, setAllMaintenanceData } = useMaintenance();
    

	useEffect(() => {
		setMaintenanceItemQuotes(quotes);
	}, [quotes]);

	function handleNavigate() {
		//console.log('navigate to Rescheduling Maintenance');
		//console.log('navigateParams to /scheduleMaintenance', navigateParams);
		if (isMobile){navigate('/scheduleMaintenance', {
			state: {
				maintenanceItem,
				navigateParams,
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
					setRescheduleView(true);
            } catch (error) {
                console.error('Error setting sessionStorage: ', error);
            }
        } else {
            console.error('maintenanceItem or navigateParams is undefined');
        }
    }
	}

	function handleNavigateToQuotesAccept() {
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
					//console.log('Storing data in sessionStorage: ', quotesStr);

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
			if (maintenanceItem && navigateParams && quotes) {
				try {
					// Save data to sessionStorage
					setMaintenanceData(maintenanceItem);
                    setNavigateParams(navigateParams);
					setMaintenanceQuotes(quotes);
                    setSelectedRequestIndex(navigateParams.maintenanceRequestIndex);
                    setSelectedStatus(navigateParams.status);
					setQuoteRequestView(true);

				} catch (error) {
					console.error('Error setting context: ', error);
				}
			} else {
				console.error('maintenanceItem or navigateParams is undefined');
			}
		}
	}

	const handleSubmit = () => {
		// TODO: REMOVE BECAUSE IT ISN'T BEING CALLED
		//console.log('handleSubmit');
		const changeMaintenanceRequestStatus = async () => {
			setShowSpinner(true);
			try {
				const response = await fetch(`${APIConfig.baseURL.dev}/maintenanceRequests`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						maintenance_request_uid: maintenanceItem.maintenance_request_uid,
						maintenance_request_status: 'COMPLETED',
					}),
				});

				const responseData = await response.json();
				//console.log(responseData);
				if (response.status === 200) {
					//console.log('success');
					navigate(maintenanceRoutingBasedOnSelectedRole());
				} else {
					//console.log('error setting status');
				}
			} catch (error) {
				//console.log('error', error);
			}
			setShowSpinner(false);
		};
		const changeMaintenanceQuoteStatus = async () => {
			setShowSpinner(true);
			const formData = new FormData();
			formData.append('maintenance_quote_uid', maintenanceItem?.maintenance_quote_uid); // 900-xxx
			formData.append('quote_maintenance_request_id', maintenanceItem.quote_maintenance_request_id);
			formData.append('quote_status', 'FINISHED');

			try {
				const response = await fetch(`${APIConfig.baseURL.dev}/maintenanceQuotes`, {
					method: 'PUT',
					body: formData,
				});

				const responseData = await response.json();
				//console.log(responseData);
				if (response.status === 200) {
					//console.log('success');
					changeMaintenanceRequestStatus();
					navigate(maintenanceRoutingBasedOnSelectedRole());
				} else {
					//console.log('error setting status');
				}
			} catch (error) {
				//console.log('error', error);
			}
			setShowSpinner(false);
		};
		changeMaintenanceQuoteStatus();
	};

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
			<Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
				<CircularProgress color="inherit" />
			</Backdrop>
		<Box
			sx={{
				display: 'flex', 
				alignItems: 'center',  // Flexbox for horizontal alignment
				justifyContent: 'center',  // Ensures space between buttons
				flexWrap: 'nowrap',  // Prevent wrapping on larger screens
				gap: 15,  // Space between buttons
				width: '100%',
				padding: '20px',
			}}
		>
			
			
				<Button
					variant="contained"
					sx={{
						backgroundColor: '#FFC614',
						color: '#160449',
						textTransform: 'none',
						fontWeight: 'bold',
						borderRadius: '8px',
						width: '200px',
						height: '120px',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						textAlign: 'center',
						padding: '10px',
						boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.3)',
						whiteSpace: 'normal',
						'&:hover': {
							backgroundColor: '#FFC614',
						},
					}}
					onClick={() => handleNavigate()}
				>
					Reschedule
				</Button>
				{(maintenanceItem?.quote_maintenance_request_id === null || maintenanceItem?.quote_status !== "SCHEDULED") && <Button
					variant="contained"
					sx={{
						backgroundColor: '#F87C7A',
						color: '#160449',
						textTransform: 'none',
						fontWeight: 'bold',
						borderRadius: '8px',
						width: '200px',
						height: '120px',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						textAlign: 'center',
						padding: '10px',
						boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.3)',
						whiteSpace: 'normal',
						'&:hover': {
							backgroundColor: '#F87C7A',
						},
					}}
					onClick={() => handleNavigateToQuotesRequested()}
				>
					Request Quotes
				</Button>}
			
				<CompleteButton maintenanceItem={maintenanceItem} quotes={quotes} setShowMessage={setShowMessage} setMessage={setMessage} setRefresh = {setRefresh} fetchAndUpdateQuotes={fetchAndUpdateQuotes}/>
			
		
		</Box>
		</Box>
	);
}
