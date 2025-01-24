import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Container, Grid, ThemeProvider } from "@mui/material";
// import axios from "axios";
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../utils/httpMiddleware";
import { useUser } from "../../contexts/UserContext";
import APIConfig from "../../utils/APIConfig";
import ContactsList from "./ContactsList";
import TenantContactDetail from "./ContactDetail/TenantContactDetail";
import OwnerContactDetail from "./ContactDetail/OwnerContactDetail";
import MaintenanceContactDetail from "./ContactDetail/MaintenanceContactDetail";
import EmployeeContactDetail from "./ContactDetail/EmployeeContactDetail";
import useMediaQuery from "@mui/material/useMediaQuery";
import theme from "../../theme/theme";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import ManagerContactDetail from "./ContactDetail/ManagerContactDetail";

const ContactsPM = () => {
  const { getProfileId, selectedRole } = useUser();
  const location = useLocation();
  const { contactsTab: contactsTabState, managerId: managerIdState, tenantId, ownerId } = location.state;
  const [contactsTab, setContactsTab] = useState(location.state?.contactsTab);
  const prevContactsTabRef = useRef(location.state?.contactsTab);
  const [contactsData, setContactsData] = useState([]);
  const [showSpinner, setShowSpinner] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [viewRHS, setViewRHS] = useState(false)

  // const [propertyIndex, setPropertyIndex] = useState(location?.state?.index);
  const [managerId, setManagerId] = useState(null);

  const fetchData = async () => {
    
    setShowSpinner(true);
    const url = `${APIConfig.baseURL.dev}/contacts/${getProfileId()}`;
    const response = await axios.get(url);

    let data;
    switch (selectedRole) {
      case "MANAGER":
        data = response.data["management_contacts"];
        if (!contactsTab) {
          setContactsTab("Owner");
        }
        break;
      case "OWNER":
        data = response.data["owner_contacts"];
        if (!contactsTab) {
          setContactsTab("Manager");
        }
        break;
      case "TENANT":
        data = response.data["tenant_contacts"];
        if (!contactsTab) {
          setContactsTab("Manager");
        }
        break;
      case "MAINTENANCE":
        data = response.data["maintenance_contacts"];
        if (!contactsTab) {
          setContactsTab("Manager");
        }
        break;
      default:
        data = [];
        console.error("Unexpected role or no contacts found for this role");
    }

    setContactsData(data);
    setShowSpinner(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // //console.log("ROHIT - currentIndex - ", currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    if (location.state && contactsData) {
      let newTab = contactsTabState;
      let newIndex = 0;
      // //console.log("ROHIT - here 1")

      if (newTab === "Manager" && managerIdState) {
        const managerIndex = contactsData?.managers?.findIndex((manager) => manager.business_uid === managerIdState);

        newIndex = managerIndex >= 0 ? managerIndex : 0;
      } else if (newTab === "Tenant" && tenantId && selectedRole !== "TENANT") {
        // //console.log("ROHIT - here 2");
        const tenantIndex = contactsData?.tenants?.findIndex((tenant) => tenant.tenant_uid === tenantId);
        // //console.log("ROHIT - tenantIndex - ", tenantIndex);
        newIndex = tenantIndex >= 0 ? tenantIndex : 0;
      } else if (newTab === "Owner" && ownerId) {
        const ownerIndex = contactsData?.owners?.findIndex((owner) => owner.owner_uid === ownerId);
        newIndex = ownerIndex >= 0 ? ownerIndex : 0;
      }

      setContactsTab(newTab);
      setCurrentIndex(newIndex);
    }
  }, [location.state, contactsData, selectedRole]);

  // useEffect(() => {
  //   if (contactsTab) {
  //     setCurrentIndex(0); // Reset to the first item whenever the tab changes
  //   }
  // }, [contactsTab]);
  useEffect(() => {
    // //console.log("ROHIT - 103 - contactsTab - ", contactsTab)
    // //console.log("ROHIT - 103 - prevContactsTabRef.current - ", prevContactsTabRef.current)

    if (contactsTab !== prevContactsTabRef.current) {
      setCurrentIndex(0);
    }

    prevContactsTabRef.current = contactsTab;
  }, [contactsTab]);

  const renderContactDetail = () => {
    switch (contactsTab) {
      case "Owner":
        return <OwnerContactDetail data={contactsData?.owners} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} fromPage={location?.state?.fromPage} propertyIndex={location?.state?.index} setViewRHS={setViewRHS}/>;
      case "Tenant":
        return <TenantContactDetail data={contactsData?.tenants} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} fromPage={location?.state?.fromPage} propertyIndex={location?.state?.index} setViewRHS={setViewRHS}/>;
      case "Maintenance":
        return <MaintenanceContactDetail data={contactsData?.maintenance} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} fromPage={location?.state?.fromPage} propertyIndex={location?.state?.index} setViewRHS={setViewRHS}/>;
      case "Employee":
        return <EmployeeContactDetail data={contactsData?.employees} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} fromPage={location?.state?.fromPage} propertyIndex={location?.state?.index} setViewRHS={setViewRHS}/>;
      case "Manager":
        return (
          <ManagerContactDetail
            data={contactsData?.managers}
            fromPage={location?.state?.fromPage}
            propertyIndex={location?.state?.index}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            setViewRHS={setViewRHS}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      {showSpinner ? (
        <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={true}>
          <CircularProgress color='inherit' />
        </Backdrop>
      ) : (
        <Container disableGutters maxWidth='lg'>
          <Grid container sx={{ alignItems: "stretch"}}>
          {(!isMobile || !viewRHS) && (<Grid item xs={12} md={4} sx={{ display: "flex", flexDirection: "column", flex: 1, padding: "5px", height: "100%" }}>
              <ContactsList data={contactsData} tab={contactsTab} setTab={setContactsTab} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} setViewRHS={setViewRHS}/>
            </Grid>)}
            {(!isMobile || viewRHS) && (<Grid item xs={12} md={8} sx={{ display: "flex", flexDirection: "column", flex: 1, padding: "5px", height: "100%" }}>
              {renderContactDetail()}
            </Grid>)}
          </Grid>
        </Container>
      )}
    </ThemeProvider>
  );
};

export default ContactsPM;
