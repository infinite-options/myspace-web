import React, { createContext, useState, useEffect } from 'react';
import APIConfig from '../utils/APIConfig';
import { useUser } from './UserContext';
const ManagementContractContext = createContext();


export const ManagementContractProvider = ({ children }) => {
  const { getProfileId } = useUser();
  const [ dataLoaded, setDataLoaded ] = useState(false);  
  const [ defaultContractFees, setDefaultContractFees ] = useState([]);
  const [ allContracts, setAllContracts ] = useState([]);
  const [ currentContractUID, setCurrentContractUID  ] = useState("");
  const [ currentContractPropertyUID, setCurrentContractPropertyUID ] = useState("");
  const [ contractRequests, setContractRequests ] = useState([]);
  const [isChange, setIsChange] = useState(false)

  const fetchDefaultContractFees = async () => {
    try {
        const response = await fetch(`${APIConfig.baseURL.dev}/profile/${getProfileId()}`);
        const data = await response.json();
        // console.log("DATA PROFILE", data);

        if (data?.profile?.result && data?.profile?.result?.length > 0) {
            const profileFees = data?.profile?.result[0].business_services_fees
                ? JSON.parse(data?.profile?.result[0].business_services_fees)
                : [];
            
            setDefaultContractFees(profileFees);
        }
    } catch (error) {
        console.error("Error fetching profile data: ", error);
    }
  };

  const fetchContracts = async () => {						
		  const result = await fetch(`${APIConfig.baseURL.dev}/contracts/${getProfileId()}`);
		  const data = await result.json();		  
	
		  if (data !== "No records for this Uid") {
			  setAllContracts(data["result"]);
        if(currentContractUID === "" && currentContractPropertyUID === ""){
          setCurrentContractUID(data?.result[0]?.contract_uid)
          setCurrentContractPropertyUID(data?.result[0]?.contract_property_id)
        }
		  }
		
	};

  const fetchContractRequests = async () => {    
    const response = await fetch(`${APIConfig.baseURL.dev}/dashboard/${getProfileId()}`);
    // const response = await fetch(`${APIConfig.baseURL.dev}/dashboard/600-000003`);

    try {
      const jsonData = await response.json();      
      const requests = jsonData?.NewPMRequests?.result;
      setContractRequests(requests);      
    } catch (error) {
      console.error(error);
    }
  };
  
  useEffect(() => {
    if (!dataLoaded) {
      setDataLoaded(true);      
            
      fetchDefaultContractFees();
      fetchContracts();
      fetchContractRequests();
    }
  }, [dataLoaded]);

  return (
    <ManagementContractContext.Provider 
      value={{         
        defaultContractFees,
        allContracts,
        contractRequests,
        currentContractUID,
        setCurrentContractUID,
        currentContractPropertyUID,
        setCurrentContractPropertyUID,
        isChange,
        setIsChange,
        dataLoaded 
      }}
    >
      {children}
    </ManagementContractContext.Provider>
  );
};


export default ManagementContractContext;
