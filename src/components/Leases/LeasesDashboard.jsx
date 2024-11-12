import React from 'react';
import { useEffect, useState, useContext } from 'react';
import { ThemeProvider, Container, Grid } from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import APIConfig from '../../utils/APIConfig';
import Leases from './Leases';
import axios from 'axios';
import theme from '../../theme/theme';
import RenewLease from './RenewLease';
import { useUser } from '../../contexts/UserContext';
import useMediaQuery from '@mui/material/useMediaQuery';
import EndLeaseButton from './EndLeaseButton';
import TenantApplicationNav from '../Applications/TenantApplicationNav';

export default function LeasesDashboard() {
	const [leaseDetails, setLeaseDetails] = useState([]);
	const [selectedLeaseId, setSelectedLeaseId] = useState(null);
	const [dataReady, setDataReady] = useState(false);
	const { getProfileId, isManager, roleName, selectedRole } = useUser();
	const [isEndClicked, setIsEndClicked] = useState(false);
	const [isUpdate, setIsUpdate] = useState(false);
	const [viewMode, setViewMode] = useState('default'); // New state for view mode
	const [applicationIndex, setApplicationIndex] = useState(0); // New state for application index
	const [propertyList, setPropertyList] = useState([]);
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const [viewRHS, setViewRHS] = useState(false);

    // useEffect(() => {
    //     console.log("LeasesDashboard - leaseDetails - ", leaseDetails);
    // }, [leaseDetails]);

    useEffect(() => {
        if (isEndClicked) {
            setViewMode('endlease');
        } else{
            setViewMode('default');
        }
    }, [isEndClicked]);

	const fetchProperties = async () => {
		const profileId = getProfileId();
		// PROPERTIES ENDPOINT
		const property_response = await fetch(`${APIConfig.baseURL.dev}/properties/${profileId}`);
		//const response = await fetch(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/properties/110-000003`)
		if (!property_response.ok) {
			// console.log("Error fetching Property Details data");
		}
		const propertyData = await property_response.json();

   
		console.log('---propertyData--', propertyData);
		setPropertyList(getPropertyList(propertyData)); // This combines Properties with Applications and Maitenance Items to enable the LHS screen
		// console.log("In Properties > Property Endpoint: ", propertyList);
	};

    useEffect(() => {
        console.log('useeffect called');
        axios.get(`${APIConfig.baseURL.dev}/leaseDetails/${getProfileId()}`).then((res) => {
            //axios.get(`${APIConfig.baseURL.dev}/leaseDetails/110-000003`).then((res) => {
            const fetchData = res.data["Lease_Details"].result;

            fetchData?.forEach( lease => {
                console.log("lease_uid - ", lease.lease_uid);
                console.log("lease_end - ", lease.lease_end);
            })
            if (res.status === 200) {
                console.log('In Leases dashboard', fetchData);
                setLeaseDetails(fetchData);
                // setSelectedLeaseId(fetchData[0].lease_uid);
                setDataReady(true);
            }
        }).catch(err => {
            console.log("Error in fetching lease details", err)
        })
    }, [isUpdate])

	function getPropertyList(data) {
		const propertyList = data['Property']?.result;
		const applications = data['Applications']?.result;
		const maintenance = data['MaintenanceRequests']?.result;

		const appsMap = new Map();
		applications.forEach((a) => {
			const appsByProperty = appsMap.get(a.property_uid) || [];
			appsByProperty.push(a);
			appsMap.set(a.property_uid, appsByProperty);
		});

		const maintMap = new Map();
		if (maintenance) {
			maintenance.forEach((m) => {
				const maintByProperty = maintMap.get(m.maintenance_property_id) || [];
				maintByProperty.push(m);
				maintMap.set(m.maintenance_property_id, maintByProperty);
			});
		}

		//   console.log(maintMap);
		return propertyList.map((p) => {
			p.applications = appsMap.get(p.property_uid) || [];
			p.applicationsCount = [...p.applications].filter((a) =>
				['NEW', 'PROCESSING'].includes(a.lease_status)
			).length;
			p.maintenance = maintMap.get(p.property_uid) || [];
			p.maintenanceCount = [...p.maintenance].filter(
				(m) => m.maintenance_request_status === 'NEW' || m.maintenance_request_status === 'PROCESSING'
			).length;
			// p.newContracts = contractsMap.get(p.property_uid) || [];
			// p.newContractsCount = [...p.newContracts].filter((m) => m.contract_status === "NEW").length;
			return p;
		});
	}

	useEffect(() => {
		console.log('useeffect called');
		axios
			.get(`${APIConfig.baseURL.dev}/leaseDetails/${getProfileId()}`)
			.then((res) => {
				//axios.get(`${APIConfig.baseURL.dev}/leaseDetails/110-000003`).then((res) => {
				const fetchData = res.data['Lease_Details'].result;
				if (res.status === 200) {
					console.log('In Leases dashboard', fetchData);
					setLeaseDetails(fetchData);
					// setSelectedLeaseId(fetchData[0].lease_uid);
					setDataReady(true);
				}
			})
			.catch((err) => {
				console.log('Error in fetching lease details', err);
			});
	}, [isUpdate]);

	useEffect(() => {
		fetchProperties();
	}, []);

	useEffect(() => {
		const handleBeforeUnload = (event) => {
			// Clear session storage when leaving the page
			sessionStorage.clear();
		};

		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => {
			sessionStorage.clear();
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, []);

	const handleUpdate = () => {
		setIsUpdate(!isUpdate);
	};

	const handleReviewRenewal = (index) => {
		// setApplicationIndex(index); // Set the application index to be reviewed
		setViewMode('reviewApplication'); // Change the view mode to show the application review
	};

	return (
		<ThemeProvider theme={theme}>
			<Container maxWidth="lg" sx={{ paddingTop: '10px', paddingBottom: '20px', marginTop: theme.spacing(2) }}>
				{!dataReady ? (
					<Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={true}>
						<CircularProgress color="inherit" />
					</Backdrop>
				) : (
					<Grid container spacing={5}>
						{(!isMobile || !viewRHS) && (
							<Grid item xs={12} md={leaseDetails && leaseDetails.length > 0 ? 4 : 12}>
								<Leases
									leaseDetails={leaseDetails}
									setSelectedLeaseId={setSelectedLeaseId}
									setViewRHS={setViewRHS}
								/>
							</Grid>
						)}

						{(!isMobile || viewRHS) && viewMode === 'default' && selectedLeaseId != null && (
							<Grid item xs={12} md={8}>
								<RenewLease
									setViewRHS={setViewRHS}
									leaseDetails={leaseDetails}
									selectedLeaseId={selectedLeaseId}
									setIsEndClicked={setIsEndClicked}
									handleUpdate={() => setIsUpdate(!isUpdate)}
									onReviewRenewal={handleReviewRenewal} // Pass callback to handle view change
								/>
							</Grid>
						)}

						{/* Show TenantApplicationNav when viewMode is 'reviewApplication' */}
						{console.log('---propertyList---', propertyList, selectedLeaseId)}

						{(!isMobile || viewRHS) && viewMode === 'reviewApplication' && applicationIndex != null && (
							<Grid item xs={12} md={8}>
								<TenantApplicationNav
									index={applicationIndex}
									propertyIndex={applicationIndex}
									property={propertyList.find((property) => property.lease_uid === selectedLeaseId)}
									isDesktop={true}
									onBackClick={() => {
										if (setViewRHS) {
											setViewRHS(false);
										}
										setViewMode('default');
									}} // Switch back to default view
								/>
							</Grid>
						)}

						{(!isMobile || viewRHS) && viewMode === 'endlease' && selectedLeaseId != null && isEndClicked === true && (
							<Grid item xs={12} md={8}>
								<EndLeaseButton
									theme={theme}
									leaseDetails={leaseDetails}
									selectedLeaseId={selectedLeaseId}
									setIsEndClicked={setIsEndClicked}
									handleUpdate={handleUpdate}
								/>
							</Grid>
						)}
					</Grid>
				)}
			</Container>
		</ThemeProvider>
	);
}
