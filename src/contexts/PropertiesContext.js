import React, { createContext, useState, useEffect, useRef } from 'react';
import APIConfig from '../utils/APIConfig';
import { useUser } from './UserContext';
const PropertiesContext = createContext();

function getPropertyList(data) {
    const propertyList = data["Property"]?.result;
    const applications = data["Applications"]?.result;
    const maintenance = data["MaintenanceRequests"]?.result;

    const appsMap = new Map();
    applications?.forEach((a) => {
        const appsByProperty = appsMap.get(a.property_uid) || [];
        appsByProperty.push(a);
        appsMap.set(a.property_uid, appsByProperty);
    });

    const maintMap = new Map();
    if (maintenance) {
        maintenance?.forEach((m) => {
        const maintByProperty = maintMap.get(m.maintenance_property_id) || [];
        maintByProperty.push(m);
        maintMap.set(m.maintenance_property_id, maintByProperty);
        });
    }

    //   console.log(maintMap);
    return propertyList?.map((p) => {
        p.applications = appsMap.get(p.property_uid) || [];
        p.applicationsCount = [...p.applications].filter((a) => ["NEW", "PROCESSING"].includes(a.lease_status)).length;
        p.maintenance = maintMap.get(p.property_uid) || [];
        p.maintenanceCount = [...p.maintenance].filter((m) => m.maintenance_request_status === "NEW" || m.maintenance_request_status === "PROCESSING").length;
        // p.newContracts = contractsMap.get(p.property_uid) || [];
        // p.newContractsCount = [...p.newContracts].filter((m) => m.contract_status === "NEW").length;
        return p;
    });
}


export const PropertiesProvider = ({ children }) => {
  const { getProfileId } = useUser();
  const [ dataLoaded, setDataLoaded ] = useState(false);
  // const [ rawPropertyData, setRawPropertyData ] = useState([]);
  const [ propertyList, setPropertyList ] = useState([]);
  const propertyListRef = useRef();
  const [ allRentStatus, setAllRentStatus ] = useState([]);
  const [ allContracts, setAllContracts ] = useState([]);
  const [ contracts, setContracts ] = useState([]);
  const [ dataReady, setDataReady ] = useState(false);

  const [newContractUID, setNewContractUID] = useState(null);
  const [newContractPropertyUID, setNewContractPropertyUID] = useState(null);

  // const [currentContractUID, setCurrentContractUID] = useState(null);
  // const [currentContractPropertyUID, setCurrentContractPropertyUID] = useState(null);

  //add property
  const [ newPropertyUid,setNewPropertyUid ]=useState("");

  const [ returnIndex, setReturnIndex ] = useState(0);
  const [ currentPropertyID, setCurrentPropertyID ] = useState(null);
  const [ currentProperty, setCurrentProperty ] = useState(null);

  const handleSortPropertyList = (propertyList) => {
    // console.log("handleSorting called ");
    setPropertyList(propertyList);
  };

  function setPropertyTo(newPropertyUid){
    console.log("setPropertyTo - newPropertyUid - ", newPropertyUid);
    // setShowSpinner(true);

    if(newPropertyUid != ""){
      let foundIndex = -1; // Initialize with 0 to indicate not found

       for (let i = 0; i < propertyList.length; i++) {
         if (propertyList[i].property_uid === newPropertyUid) {
           foundIndex = i; // Found the index
           break; // Exit the loop since we found the matching object
         }
         }

      // Now, use setReturnIndex to set the found index       
       if(foundIndex >= 0){
        setReturnIndex(foundIndex);
       }
       
      //  setShowSpinner(false);
   }

  }

  useEffect(()=>{    
    if(newPropertyUid !== "" && propertyListRef.current != propertyList){
       setPropertyTo(newPropertyUid)
       setNewPropertyUid("")
    }
    propertyListRef.current = propertyList;
  },[propertyList, newPropertyUid])
//   useEffect(() => {
//     console.log("PropertiesProvider - propertyList - ",propertyList);
//   }, [propertyList]);

//   useEffect(() => {
//     console.log("PropertiesProvider - returnIndex - ",returnIndex);
//   }, [returnIndex]);

//   useEffect(() => {
//     console.log("PropertiesProvider - currentPropertyID - ",currentPropertyID);
//   }, [currentPropertyID]);

//   useEffect(() => {
//     console.log("PropertiesProvider - currentProperty - ",currentProperty);
//   }, [currentProperty]);

  const fetchProperties = async () => {        
    const property_response = await fetch(`${APIConfig.baseURL.dev}/properties/${getProfileId()}`);    
    if (!property_response.ok) {
      console.error("Error fetching Property Details data");
    }
    const propertyData = await property_response.json();
    const propertyList = getPropertyList(propertyData); // This combines Properties with Applications and Maitenance Items to enable the LHS screen
    // console.log("In Properties > Property Endpoint: ", propertyList);
    
    
    // setRawPropertyData(propertyData); // Sets rawPropertyData to be based into Edit Properties Function
    setPropertyList(propertyList)
    // setPropertyList([...propertyList]);
    // setDisplayedItems([...propertyList]);
    // setPropertyIndex(0);

    

    if (propertyData.Property.code === 200) {
      // console.log("Endpoint Data is Ready");
      setDataReady(true);
    }    
  };

  const fetchRentStatus = async () => {          
    const rent_response = await fetch(`${APIConfig.baseURL.dev}/rentDetails/${getProfileId()}`);    
    if (!rent_response.ok) {
        console.error("Error fetching Rent Details data");
    }
    const rentResponse = await rent_response.json();
    // console.log("In Properties > Rent Endpoint: ", rentResponse.RentStatus.result);
    setAllRentStatus(rentResponse.RentStatus.result);
}

const fetchContracts = async () => {
    const contract_response = await fetch(`${APIConfig.baseURL.dev}/contracts/${getProfileId()}`);    
    if (!contract_response.ok) {
        console.error("Error fetching Contract Details data");
    }
    const contractsResponse = await contract_response.json();
    // console.log("In Properties > Contract Endpoint: ", contractsResponse.result);
    setAllContracts(contractsResponse.result);
}

  useEffect(() => {
    if (!dataLoaded) {
           
      
      // fetchProperties();
      // fetchRentStatus();
      // fetchContracts();
      // setDataLoaded(true); 
      Promise.all([fetchProperties(), fetchRentStatus()])
      .then(() => {
        setDataLoaded(true);
      })
      .catch(error => {
        console.error("Error during data fetching:", error);
      });
      
    }
  }, [dataLoaded]);

  return (
    <PropertiesContext.Provider 
      value={{ 
        propertyList,
        setPropertyList,
        allRentStatus,
        // allContracts,
        // fetchContracts,
        fetchProperties, // refresh properties        
        newContractUID,
        setNewContractUID,
        newContractPropertyUID,
        setNewContractPropertyUID,
        returnIndex,
        setReturnIndex,
        currentPropertyID,
        setCurrentPropertyID,
        currentProperty,
        setCurrentProperty,
        setNewPropertyUid,
        dataLoaded, 
      }}
    >
      {children}
    </PropertiesContext.Provider>
  );
};


export default PropertiesContext;