import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import theme from "../../../theme/theme";
// import "./../../css/contacts.css";
import {
  ThemeProvider,
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  InputAdornment,
  TextField,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from "@mui/material";
import { Message, Search } from "@mui/icons-material";
import { getStatusColor } from "../ContactsFunction";
// import axios from "axios";
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../../utils/httpMiddleware";
import { useUser } from "../../../contexts/UserContext";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { Container, Grid, Tabs, Tab, Badge, Switch } from "@mui/material";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import defaultHouseImage from "../../Property/defaultHouseImage.png";
import { DataGrid } from "@mui/x-data-grid";
import useMediaQuery from "@mui/material/useMediaQuery";
import SearchIcon from "@mui/icons-material/Search";
import EmailIcon from "../../Property/messageIconDark.png";
import PhoneIcon from "../../Property/phoneIconDark.png";
import AddressIcon from "../../Property/addressIconDark.png";
import maintenanceIcon from "../../Property/maintenanceIcon.png";
import User_fill from "../../../images/User_fill_dark.png";
import { maskSSN, maskEIN, formattedPhoneNumber } from "../../utils/privacyMasking";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import dayjs from "dayjs";

import AES from "crypto-js/aes";

import APIConfig from "../../../utils/APIConfig";
import ContactDetails from "../ContactDetails";
import ContactsList from "../ContactsList";

import TenantContactDetail from "../ContactDetail/TenantContactDetail";
import OwnerContactDetail from "../ContactDetail/OwnerContactDetail";
import MaintenanceContactDetail from "../ContactDetail/MaintenanceContactDetail";
import EmployeeContactDetail from "../ContactDetail/EmployeeContactDetail";

import ProfileInformation from "../ContactDetail/ProfileInformation";
import PaymentsInformation from "../ContactDetail/PaymentsInformation";

const PMContacts = () => {
  const { getProfileId, selectedRole } = useUser();
  const location = useLocation();
  const [showSpinner, setShowSpinner] = useState(true);
  const [contactsTab, setContactsTab] = useState(location.state?.contactsTab || "Owner");
  const [contactsData, setContactsData] = useState([]);

  const [currentIndex, setCurrentIndex] = useState(0);

  // useEffect(() => {
  //   //console.log("contactsData - ", contactsData);
  // }, [contactsData]);

  // useEffect(() => {
  //   //console.log("currentIndex", currentIndex)
  // }, [currentIndex]);
  // useEffect(() => {
  //   //console.log("contactsTab", contactsTab)
  //   setCurrentIndex(0);
  // }, [contactsTab]);

  const fetchData = async () => {
    const url = `${APIConfig.baseURL.dev}/contacts/${getProfileId()}`;
    // const url = `${APIConfig.baseURL.dev}/contacts/600-000003`;
    // //console.log("In PMContracts.jsx");
    // setShowSpinner(true);

    await axios
      .get(url)
      .then((resp) => {
        const data = resp.data["management_contacts"];
        setContactsData(data);
        
      })
      .catch((e) => {
        console.error(e);
        // setShowSpinner(false);
      });

      // setShowSpinner(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (location?.state) {
      const { contactsTab, tenantId } = location.state;

      if (contactsTab) {
        setContactsTab(contactsTab);
      }

      if (tenantId && contactsTab === "Tenant") {
        const tenantIndex = contactsData?.tenants?.findIndex(
          (tenant) => tenant.tenant_uid === tenantId
        );
        if (tenantIndex >= 0) {
          setCurrentIndex(tenantIndex);
        }
      }
    }
  }, [location.state, contactsData]);

  return (
    <ThemeProvider theme={theme}>
      {showSpinner ? (
        <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={true}>
          <CircularProgress color='inherit' />
        </Backdrop>
      ) : (
        <Container disableGutters maxWidth='lg'>
          <Grid container>
            <Grid container item xs={12} md={4}>
              <Grid item xs={12} sx={{ padding: "5px", height: "100%" }}>
                <ContactsList data={contactsData} tab={contactsTab} setTab={setContactsTab} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} />
              </Grid>
            </Grid>
            <Grid container item xs={12} md={8}>
              <Grid item xs={12} sx={{ padding: "5px" }}>
                {contactsTab === "Owner" && <OwnerContactDetail data={contactsData?.owners} contacsTab={contactsTab} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} />}
                {contactsTab === "Tenant" && (
                  <TenantContactDetail data={contactsData?.tenants} contacsTab={contactsTab} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} />
                )}
                {contactsTab === "Maintenance" && (
                  <MaintenanceContactDetail data={contactsData?.maintenance} contacsTab={contactsTab} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} />
                )}
                {contactsTab === "Employee" && (
                  <EmployeeContactDetail data={contactsData?.employees} contacsTab={contactsTab} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} />
                )}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      )}
    </ThemeProvider>
  );
};

// export default ContactsList;
export default PMContacts;
