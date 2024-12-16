import React, { useState } from 'react';
import { Modal, Box, Typography, IconButton, RadioGroup, FormControlLabel, Radio, Button, Grid } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
// import axios from 'axios';
import APIConfig from '../../utils/APIConfig';
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../utils/httpMiddleware";

export default function RequestInfoModal({ maintenanceItem, onRequestClose, setShowSpinner, setRefresh, getProfileId }){
  const [selectedRole, setSelectedRole] = useState(maintenanceItem?.maintenance_request_status === "INFO OWNER"? 'tenant' : 'owner');

  console.log("request info --- ", maintenanceItem)

  const sendAnnouncement = async () => {
    try {
      const receiverPropertyMapping = {
        [maintenanceItem.business_uid]: [maintenanceItem.property_id],
      };

      const recevier = selectedRole === "owner" ? maintenanceItem.owner_uid : maintenanceItem.tenant_uid;

      await fetch(`${APIConfig.baseURL.dev}/announcements/${getProfileId()}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          announcement_title: "Ask for more info about maintenance Request",
          announcement_msg: `Manager ask for more information about maintenance request ${maintenanceItem.maintenance_title} - ${maintenanceItem.maintenance_request_uid}`,
          announcement_sender: getProfileId(),
          announcement_date: new Date().toDateString(),
          announcement_properties: JSON.stringify(receiverPropertyMapping),
          announcement_mode: "LEASE",
          announcement_receiver: [recevier],
          announcement_type: ["App", "Email", "Text"],
        }),
      });
    } catch (error) {
        console.log("Error in sending announcements:", error);
        alert("We were unable to Text the Property Manager but we were able to send them a notification through the App");
    }
  };

  const handleRequestMoreInfo = async () => {
    // const payload = {
    //   maintenance_request_uid: maintenanceItem.maintenance_request_uid,
    //   maintenance_request_status: "INFO",
    // };

    // try {
    //   await axios.put('/maintenanceRequest', payload);
    //   alert('Request sent successfully!');
    //   onRequestClose(); // Close the modal after request is sent
    // } catch (error) {
    //   console.error('Error sending request:', error);
    //   alert('Failed to send request. Please try again.');
    // }
        setShowSpinner(true)
        const formData = new FormData();
        formData.append('maintenance_request_uid', maintenanceItem.maintenance_request_uid);
        const maintenance_status = (maintenanceItem.maintenance_request_status === "INFO OWNER" && selectedRole === "tenant" ? "INFO" : maintenanceItem.maintenance_request_status === "INFO TENANT" && selectedRole === "owner" ? "INFO" : `INFO ${selectedRole.toUpperCase()}`);
        formData.append('maintenance_request_status', maintenance_status);

        try {
            const response = await fetch(`${APIConfig.baseURL.dev}/maintenanceRequests`, {
                method: 'PUT',
                body: formData,
            });
            
            if(response.ok){
                console.log(" update status to info")
                sendAnnouncement();
                onRequestClose()
                setShowSpinner(false)
                setRefresh()
            }
        } catch (error) {
            console.log('error', error);
        }
  };

  return (
    <Modal
      open={true}
      onClose={onRequestClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          backgroundColor: "#FFFFFF",
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          padding: "25px"
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography id="modal-title" variant="h6" component="h2">
                Ask For Details To
            </Typography>
            <IconButton
                onClick={onRequestClose}
                sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    color: '#3D5CAC',
                }}
            >
                <CloseIcon />
            </IconButton>
        </Box>
        {/* <Typography id="modal-description" sx={{ mt: "30px", fontSize: "16px", fontWeight: "bold"}}>
          Ask for details to:
        </Typography> */}
        <RadioGroup
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          sx={{ mt: 5 }}
        >
          <FormControlLabel
            value="owner"
            control={<Radio sx={{'&.Mui-checked': { color: '#160449' }}} />}
            disabled={maintenanceItem?.maintenance_request_status === "INFO OWNER"}
            label={`Owner: ${maintenanceItem.owner_first_name} ${maintenanceItem.owner_last_name}`}
          />
          <FormControlLabel
            value="tenant"
            control={<Radio sx={{'&.Mui-checked': { color: '#160449' }}} />}
            disabled={maintenanceItem?.maintenance_request_status === "INFO TENANT"}
            label={`Tenant: ${maintenanceItem.tenant_first_name} ${maintenanceItem.tenant_last_name}`}
          />
          {/* <FormControlLabel
            value="manager"
            control={<Radio />}
            label={`Manager: ${maintenanceItem.manager_name}`}
          /> */}
        </RadioGroup>

        {/* submit button */}
        <Grid container justifyContent="center" alignItems="center" sx={{ padding: "8px" }}>
            <Button
                type='submit'
                color="primary"
                onClick={handleRequestMoreInfo}
                sx={{
                    "&:hover": {
                    backgroundColor: "#160449",
                    },
                    backgroundColor: "#3D5CAC",
                    color: "#FFFFFF",
                    fontWeight: "bold",
                    mt: "30px"
                }}
                disabled={!selectedRole} // Disable if no role is selected
            >
                Request More Info
            </Button>
        </Grid>
      </Box>
    </Modal>
  );
}