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
import CancelButton from '../MaintenanceComponents/CancelButton';
import CompleteButton from '../MaintenanceComponents/CompleteButton';
import RequestMoreInfo from '../Worker/RequestMoreInfo';
import AlertMessage from '../AlertMessage';
import DateTimePickerModal from '../../DateTimePicker';
import { useUser } from '../../../contexts/UserContext';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import TenantProfileLink from '../../Maintenance/MaintenanceComponents/TenantProfileLink';
import OwnerProfileLink from '../../Maintenance/MaintenanceComponents/OwnerProfileLink';
import useMediaQuery from '@mui/material/useMediaQuery';
import APIConfig from '../../../utils/APIConfig';
import { useMaintenance } from "../../../contexts/MaintenanceContext";
import RequestInfoModal from '../RequestInfoModal';
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../../utils/httpMiddleware";

export default function NewRequestAction({ setRefresh, maintenanceItem, navigateParams, quotes }) {
    const navigate = useNavigate();
    const { maintenanceRoutingBasedOnSelectedRole, getProfileId } = useUser();
    const { setMaintenanceData, setSelectedRequestIndex, setSelectedStatus, setQuoteRequestView, setMaintenanceItem, setNavigateParams } = useMaintenance();
    
    const [schedulerDate, setSchedulerDate] = useState();
    const [showRequestMoreInfo, setShowRequestMoreInfo] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    const [message, setMessage] = useState('');
    const [showSpinner, setShowSpinner] = useState(false);
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    function handleNavigateToQuotesRequested() {
        if (isMobile) {
            navigate('/quoteRequest', {
                state: {
                    maintenanceItem,
                    navigateParams,
                },
            });
        } else {
            if (maintenanceItem && navigateParams) {
                try {
                    setQuoteRequestView(true);
                    setMaintenanceData(maintenanceItem);
                    setNavigateParams(navigateParams);
                    setSelectedRequestIndex(navigateParams.maintenanceRequestIndex);
                    setSelectedStatus(navigateParams.status);

                } catch (error) {
                    console.error('Error setting sessionStorage: ', error);
                }
            } else {
                console.error('maintenanceItem or navigateParams is undefined');
            }
        }
    }

    async function handleSubmit(maintenanceItemUID, date, time) {
        const changeMaintenanceRequestStatus = async () => {
            setShowSpinner(true);
            const formData = new FormData();
            formData.append('maintenance_request_uid', maintenanceItemUID);
            formData.append('maintenance_scheduled_date', date);
            formData.append('maintenance_scheduled_time', time);
            formData.append('maintenance_request_status', 'SCHEDULED');
            if (!maintenanceItem.maint_business_uid) {
                formData.append('maintenance_assigned_business', getProfileId());
            }
            try {
                const response = await fetch(`${APIConfig.baseURL.dev}/maintenanceRequests`, {
                    method: 'PUT',
                    body: formData,
                });
            } catch (error) {
                //console.log('error', error);
            }
            setShowSpinner(false);
        };
        await changeMaintenanceRequestStatus();
        navigate(maintenanceRoutingBasedOnSelectedRole());
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
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
              display: 'flex',  // Flexbox for horizontal alignment
              justifyContent: 'space-between',  // Ensures space between buttons
              flexWrap: 'nowrap',  // Prevent wrapping on larger screens
              gap: 5,  // Space between buttons
              width: '100%',
              padding: '20px',
            }}
          >
            {/* ask for details button */}
            <Button
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
              disabled={maintenanceItem?.maintenance_request_status === "INFO"}
              onClick={() => setShowRequestMoreInfo(true)}
            >
              Ask For Details
            </Button>
            
            {/* schedule button */}
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
            
            {/* request quote button */}
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
            
            {/* complete button */}
            <CompleteButton maintenanceItem={maintenanceItem} quotes={quotes} setShowMessage={setShowMessage} setMessage={setMessage} setRefresh = {setRefresh}/>
          </Box>

          <AlertMessage showMessage={showMessage} setShowMessage={setShowMessage} message={message} />
          <DateTimePickerModal
              setOpenModal={setShowModal}
              open={showModal}
              maintenanceItem={maintenanceItem}
              date={''}
              time={''}
              handleSubmit={handleSubmit}
          />

          {showRequestMoreInfo && <RequestInfoModal maintenanceItem={maintenanceItem} onRequestClose={()=>{setShowRequestMoreInfo(false)}} setShowSpinner={setShowSpinner} setRefresh = {setRefresh} getProfileId={getProfileId}/>}
        </Box>
    );
}
