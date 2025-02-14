import { useEffect, useState } from "react";
import "../../css/announcement.css";
import AnnouncementCard from "./AnnouncementCard";
// import Searchbar from "./Searchbar";
// import axios from "axios";
// import SearchFilter from "./SearchFilter";
import { useUser } from "../../contexts/UserContext";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import theme from "../../theme/theme";
import { ThemeProvider, Box, TextField, Alert, AlertTitle, Snackbar, IconButton, Paper, Grid, Typography } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import AnnouncementPopUp from "./AnnouncementPopUp";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";

import APIConfig from "../../utils/APIConfig";
import { fetchMiddleware as fetch, axiosMiddleware as axios } from '../../utils/httpMiddleware';

export default function Announcements({ sentAnnouncementData, recvAnnouncementData, setView, handleBack }) {
  // //console.log("intial commit");
  const { user, getProfileId, selectedRole, selectRole, Name } = useUser();
  const [announcementData, setAnnouncementData] = useState([]);
  const [sentData, setSentData] = useState(sentAnnouncementData ? sentAnnouncementData : []);
  const [receivedData, setReceivedData] = useState(recvAnnouncementData ? recvAnnouncementData : []);
  const [filteredSentData, setFilteredSentData] = useState([]);
  const [filteredReceivedData, setFilteredReceivedData] = useState([]);
  const [showSpinner, setShowSpinner] = useState(false);
  const navigate = useNavigate();
  // If announcements need to be filtered by owner_uid after navigation from PmQuotesLists.jsx
  const location = useLocation();
  const owner_uid_filter = location?.state?.owner_uid;
  //
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [annData, setAnnData] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [isMsgRead, setIsMsgRead] = useState(false);
  const [readAll, setReadAll] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredSentData(sentData);
      setFilteredReceivedData(receivedData);
    } else {
      setFilteredSentData(sentData.filter((announcement) => announcement.announcement_title.toLowerCase().includes(searchTerm.toLowerCase())));
      setFilteredReceivedData(receivedData.filter((announcement) => announcement.announcement_title.toLowerCase().includes(searchTerm.toLowerCase())));
    }
  }, [searchTerm, sentData, receivedData]);

  useEffect(() => {
    setShowSpinner(true);
    axios.get(`${APIConfig.baseURL.dev}/announcements/${getProfileId()}`).then((res) => {
      //   setAnnouncementData(res.data?.received?.result || res.data?.result || []);
      // setAnnouncementData(res.data);
      let sent_data = res.data.sent.result;
      let received_data = res.data.received.result;
      if (owner_uid_filter) {
        // If announcements need to be filtered by owner_uid after navigation from PmQuotesLists.jsx
        received_data = received_data.filter((record) => record.announcement_sender === owner_uid_filter);
        sent_data = sent_data.filter((record) => record.announcement_receiver === owner_uid_filter);
      }
      sent_data.sort((a, b) => {
        if (a.announcement_uid < b.announcement_uid) return 1;
        if (a.announcement_uid > b.announcement_uid) return -1;
        return 0;
      });
      received_data.sort((a, b) => {
        if (a.announcement_uid < b.announcement_uid) return 1;
        if (a.announcement_uid > b.announcement_uid) return -1;
        return 0;
      });
      setSentData(sent_data);
      setReceivedData(received_data);

      setShowSpinner(false);
    });
  }, [isMsgRead]);

  // Handle Navigation to the Contacts

  const [dataDetails, setDataDetails] = useState({});

  // useEffect(() => {
  //     //console.log("dataDetails - ", dataDetails);
  // }, [dataDetails]);

  const fetchContactData = async () => {
    const url = `${APIConfig.baseURL.dev}/contacts/${getProfileId()}`;
    setShowSpinner(true);
    let data = null;

    await axios
      .get(url)
      .then((resp) => {
        // //console.log("selectedRole - ", selectedRole);
        if (selectedRole === "MANAGER") {
          data = resp.data["management_contacts"];
          setDataDetails((prev) => {
            return { ...prev, Tenant: data["tenants"], Owner: data["owners"], Maintenance: data["maintenance"] };
          });
        } else if (selectedRole === "OWNER") {
          data = resp.data["owner_contacts"];
          setDataDetails((prev) => {
            return { ...prev, Tenant: data["tenants"], Manager: data["managers"] };
          });
        } else if (selectedRole === "MAINTENANCE") {
          data = resp.data["maintenance_contacts"];
          setDataDetails((prev) => {
            return { ...prev, Tenant: data["tenants"], Manager: data["managers"] };
          });
        }

        setShowSpinner(false);
      })
      .catch((e) => {
        console.error(e);
        setShowSpinner(false);
      });
    // //console.log(dataDetails);
  };

  useEffect(() => {
    fetchContactData();
  }, []);

  // function onClick
  //

  const handleAnnouncements = async (announcement) => {
    //console.log("divya", announcement)
    if (announcement.announcement_mode == "PROPERTIES") {
      // //console.log(announcement.announcement_title);
      navigate("/newOwnerInquiry", { state: { announcementData: announcement } });
    } else if (announcement.announcement_mode == "CONTRACT") {
      // //console.log(announcement.announcement_title)
      // navigate("/propertyContract",{state: {announcementData: announcement}});
      setAnnData(announcement);
      setShowAnnouncement(true);
      await markAnnouncementAsRead([announcement.announcement_uid]);
    } else if (announcement.announcement_mode == "LEASE") {
      // //console.log(announcement.announcement_title);
      setAnnData(announcement);
      await setShowAnnouncement(true);
      await markAnnouncementAsRead([announcement.announcement_uid]);
    }
    else if (announcement.announcement_mode == "MAINTENANCE") {
      // //console.log(announcement.announcement_title);
      setAnnData(announcement);
      await setShowAnnouncement(true);
      await markAnnouncementAsRead([announcement.announcement_uid]);
    }
  };

  const markAnnouncementAsRead = (announcementList) => {
    fetch(`${APIConfig.baseURL.dev}/announcements`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        announcement_uid: announcementList
      }),
    }).then((res) => {
      //console.log('res is', res);
      if (res.status === 200) {
        setIsMsgRead(prev => !prev);
        return res.status
      }

    }).catch((err) => {
      //console.log('Cannot update read', err)
    })
  }

  const handleReadAll = () => {
    setReadAll(prev => !prev);
    const announcementList = [];

    receivedData.forEach((ann) => {
      // //console.log(ann);
      if (ann.announcement_read === null) {
        announcementList.push(ann.announcement_uid);
      }
    })
    //console.log('read all', announcementList, readAll);
    if (readAll === false) { //check with prev state
      if (announcementList.length === 0) {
        showSnackbar("You do not have any unread announcements", "error");
      } else {
        markAnnouncementAsRead(announcementList);
      }
    }
  }

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const showSnackbar = (message, severity) => {
    //console.log('Inside show snackbar');
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleBackButton = () => {
    if (selectedRole === "OWNER" && setView) {
      setView("dashboard")
      // navigate("/ownerDashboard")
    } else if (selectedRole === "MANAGER") {
      navigate("/managerDashboard")
    } else if (selectedRole === "TENANT" && handleBack) {
      handleBack()
    }
  }

  return (
    <div className='announcement-container'>
      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
        <CircularProgress color='inherit' />
      </Backdrop>
      {/* <Box
        className='announcement-title'
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Box component='span' display='flex' justifyContent='flex-start' alignItems='flex-start' position='relative'>
          <Button onClick={handleBackButton}>
            <ArrowBackIcon
              sx={{
                color: "black",
                fontSize: "30px",
                margin: "5px",
              }}
            />
          </Button>
        </Box>
        <Box
          className='announcement-title-text'
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            flex: 1
          }}
        >
          <Box className='announcement-title-text'>{"Announcements 1"}</Box>
          <Snackbar open={snackbarOpen} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
            <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%', height: "100%" }}>
              <AlertTitle>{snackbarSeverity === "error" ? "Error" : "Success"}</AlertTitle>
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Box>
        <Box
          sx={{
            width: "5%",
            height: "30px",
            paddingTop: "15px",
            paddingBottom: "5px",
            paddingRight: "10px",
            paddingLeft: "10px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
            position: "relative",
          }}
        >
          <Button
            onClick={() => {
              navigate("/managerCreateAnnouncement");
            }}
            sx={{
              backgroundColor: "#3F51B5",
              color: "#fff",
              fontWeight: "bold",
              textTransform: "none",
              width: "100%",
              "&:hover, &:focus, &:active": {
                backgroundColor: "#3F51B5",
              },
            }}
          >
            +
          </Button>
        </Box>
      </Box> */}
      <Paper sx={{ backgroundColor: "#f0f0f0", borderRadius:"10px" }}>
      <Box sx={{ margin: "0px 10px 0px 0px" }}>
        <Grid Container sx={{ alignItems: "center", justifyContent: "space-between", display: "flex" }}>
          <Grid item xs={1} md={1}>
            <Button onClick={handleBackButton}>
              <ArrowBackIcon
                sx={{
                  color: "black",
                  fontSize: "30px",
                  margin: "5px",
                }}
              />
            </Button>
          </Grid>
          <Grid item xs={10} md={10}>
            <Typography
              sx={{
                color: theme.typography.primary.black,
                fontWeight: theme.typography.primary.fontWeight,
                fontSize: "18px",
                textAlign: "center"
              }}
            >
              Announcements
            </Typography>
          </Grid>
          <Grid item xs={1} md={1}>
            <Button
              onClick={() => {
                navigate("/managerCreateAnnouncement");
              }}>
              <AddIcon
                sx={{
                  color: "#160449",
                  fontSize: "30px",
                  margin: "5px",
                }}
              />
            </Button>
          </Grid>
        </Grid>
      </Box>
      <hr />
      {/* <div className="announcement-location">
                <div className="announcement-location-icon">
                    <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="14.5" cy="14.5" r="14.5" fill="#D9D9D9" />
                    </svg>
                </div>
                <div className="announcement-location-text">
                    103 N. Abel St unit #104
                </div>
            </div> */}
      <div className='announcement-searchbar-container'>
        {/* <Searchbar /> */}
        <div className='announcement-searchbar'>
          <TextField
            type='small'
            placeholder='Search announcements...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              width: "100%",
              "& input": {
                height: "20px",
                padding: "5px",
              },
            }}
          />
        </div>
      </div>
      <div className='announcement-menu-container'>
      {/* <Paper> */}
        <div className='announcement-menu-bar'>
          <div className='announcement-view'>
            <div className='announcement-view-icon'>
              <svg width='19' height='19' viewBox='0 0 19 19' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <rect x='2.375' y='4.75' width='14.25' height='11.875' rx='2' stroke='#3D5CAC' strokeWidth='2' />
                <path
                  d='M2.375 7.91667C2.375 6.828 2.375 6.28367 2.58125 5.86542C2.77598 5.47056 3.09556 5.15098 3.49042 4.95625C3.90867 4.75 4.453 4.75 5.54167 4.75H13.4583C14.547 4.75 15.0913 4.75 15.5096 4.95625C15.9044 5.15098 16.224 5.47056 16.4187 5.86542C16.625 6.28367 16.625 6.828 16.625 7.91667V7.91667H2.375V7.91667Z'
                  fill='#3D5CAC'
                />
                <path d='M5.54169 2.375L5.54169 4.75' stroke='#3D5CAC' strokeWidth='2' strokeLinecap='round' />
                <path d='M13.4583 2.375L13.4583 4.75' stroke='#3D5CAC' strokeWidth='2' strokeLinecap='round' />
              </svg>
            </div>
            <div className='announcement-view-text'>View Last 30 Days</div>
          </div>
          <div className='announcement-readall'>
            <div className='announcement-readall-text'>Read All</div>
            <div className='announcement-readall-checkbox'>
              <input type='checkbox' onChange={handleReadAll} checked={readAll} />
            </div>
          </div>
        </div>

        <Paper elevation={2} sx={{ width: "98%", margin: "10px" }}>
          <div style={{ marginBottom: "20px", fontSize: "20px", textAlign: "center", marginTop: "10px" }} className='announcement-view-text'>
            Received
          </div>
          <div style={{ marginBottom: "30px", width: "100%", height: "420px", overflow: "auto" }}>
            <div className='announcement-list-container' style={{ maxHeight: "100%", overflowY: "auto" }}>
              {filteredReceivedData.length > 0
                ? filteredReceivedData.map((announcement, i) => {
                  let role = announcement?.sender_role;
                  let pageToNavigate;
                  let navigationParams;
                  try {
                    let indx = dataDetails[role].findIndex((contact) => contact.contact_uid === announcement?.announcement_sender);
                    if (indx >= 0) {
                      pageToNavigate = `/${role.toLowerCase()}ContactDetails`;
                      navigationParams = {
                        state: {
                          dataDetails: dataDetails[role],
                          tab: role,
                          index: indx,
                          viewData: dataDetails[role],
                        },
                      };
                    }
                  } catch (e) {
                    // //console.log(e);
                  }

                  return (
                    <div key={i}>
                      <Box
                        onClick={() => {
                          handleAnnouncements(announcement);
                        }}
                      >
                        {
                          <AnnouncementCard
                            data={announcement}
                            role={getProfileId}
                            isContract={announcement.announcement_mode == "CONTRACT"}
                            isLease={announcement.announcement_mode == "LEASE"}
                            pageToNavigate={pageToNavigate}
                            navigationParams={navigationParams}
                            sent_or_received={"Received"}
                          />
                        }
                      </Box>
                    </div>
                  );
                })
                : "No announcements"}
            </div>
          </div>
        </Paper>

        <Paper elevation={2} sx={{ width: "98%", margin: "10px" }}>
          <div style={{ marginBottom: "30px", fontSize: "20px", textAlign: "center", marginTop: "10px" }} className='announcement-view-text'>
            Sent
          </div>
          <div style={{ width: "100%", height: "420px", overflow: "auto", backgroundColor: "white" }}>
            <div className='announcement-list-container'>
              {filteredSentData.length > 0
                ? filteredSentData.map((announcement, i) => {
                  let role = announcement?.receiver_role;
                  let pageToNavigate;
                  let navigationParams;
                  try {
                    let indx = dataDetails[role].findIndex((contact) => contact.contact_uid === announcement?.announcement_receiver);
                    if (indx >= 0) {
                      pageToNavigate = `/${role.toLowerCase()}ContactDetails`;
                      navigationParams = {
                        state: {
                          dataDetails: dataDetails[role],
                          tab: role,
                          index: indx,
                          viewData: dataDetails[role],
                        },
                      };
                    }
                  } catch (e) {
                    // //console.log(e);
                  }

                  return (
                    <div key={i}>
                      <Box
                        onClick={() => {
                          handleAnnouncements(announcement);
                        }}
                      >
                        {
                          <AnnouncementCard
                            data={announcement}
                            role={getProfileId}
                            isContract={announcement.announcement_mode == "CONTRACT"}
                            isLease={announcement.announcement_mode == "LEASE"}
                            pageToNavigate={pageToNavigate}
                            navigationParams={navigationParams}
                            sent_or_received={"Sent"}
                          />
                        }
                      </Box>
                    </div>
                  );
                })
                : "No announcements"}
            </div>
          </div>
        </Paper>
      </div>
      {/* </Paper> */}

      {/**
            <hr/>
            <SearchFilter/>
             */}
      <AnnouncementPopUp
        showAnnouncement={showAnnouncement}
        setShowAnnouncement={setShowAnnouncement}
        annData={annData}
        sx={{ width: "50%", height: "50%" }} // Adjust the width and height here
      />
      </Paper>
    </div>
  );
}
