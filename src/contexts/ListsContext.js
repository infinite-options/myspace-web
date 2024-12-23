import React, { createContext, useState, useEffect } from 'react';
import APIConfig from '../utils/APIConfig';
import { fetchMiddleware as fetch, axiosMiddleware as axios } from '../utils/httpMiddleware';

const ListsContext = createContext();


export const ListsProvider = ({ children }) => {  
  const [ dataLoaded, setDataLoaded ] = useState(false);
  
  const [ allLists, setAllLists ] = useState([]);
  

  const fetchLists = async () => {
    try {
        const response = await fetch(`${APIConfig.baseURL.dev}/lists`);
        const data = await response.json();        
        const lists = data.result.filter(item => (item.list_item != null && item.list_item.trim() !== ""));
        setAllLists(lists);
    } catch (error) {
        console.error("Error fetching fee bases:", error);
    }
  };  

  const getList = ( category ) => {
    const list = allLists?.filter( item => item.list_category === category);    
    return list;
  }
    
  // useEffect(() => {
  //   if (!dataLoaded) {
  //     setDataLoaded(true);            
  //     fetchLists();      
  //   }
  // }, [dataLoaded]);

  useEffect(() => {
    if (allLists.length === 0) {
      fetchLists();
    }
  }, [allLists]);

  // useEffect(() => {
  //   if (!dataLoaded) {
  //     setDataLoaded(true);            
  //     fetchLists();      
  //   }
  // }, []);

  return (
    <ListsContext.Provider 
      value={{         
        getList,
        dataLoaded: allLists.length > 0, 
      }}
    >
      {children}
    </ListsContext.Provider>
  );
};


export default ListsContext;
