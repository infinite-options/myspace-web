import "./App.css";
import Main from "./components/Main";
import { SettingsACHContextProvider } from "../src/contexts/SettingsACHContext";
import { BrowserRouter } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import { OnboardingProvider } from "./contexts/OnboardingContext";
import { CookiesProvider } from "react-cookie";
import { MaintenanceProvider } from "./contexts/MaintenanceContext";  // Import the MaintenanceProvider
import { ListsProvider } from "./contexts/ListsContext";
import ScrollToTop from "./components/ScrollToTop";
import { useEffect, useState } from "react";

function App() {
  // const [token, setToken] = useState(sessionStorage.getItem('authToken'));

  // useEffect(() => {

  //   const handleSessionStorageUpdate = () => {
  //     console.log(" === ok we are calling == ")
  //     const authToken = sessionStorage.getItem('authToken');
  //     setToken(authToken);
  //   };

  //   window.addEventListener('sessionStorageUpdated', handleSessionStorageUpdate);

  //   return () => {
  //     window.removeEventListener('sessionStorageUpdated', handleSessionStorageUpdate);
  //   };
  // }, []);

  // console.log("App.js");
  return (
    <CookiesProvider defaultSetOptions={{ path: "/" }}>
      <UserProvider>
        <OnboardingProvider>
          <ListsProvider>
            <SettingsACHContextProvider>
              <MaintenanceProvider>               
                <BrowserRouter>
                <ScrollToTop/>
                  <Main />
                </BrowserRouter>              
              </MaintenanceProvider>
            </SettingsACHContextProvider>
          </ListsProvider>
        </OnboardingProvider>
      </UserProvider>
    </CookiesProvider>
  );
}

export default App;
