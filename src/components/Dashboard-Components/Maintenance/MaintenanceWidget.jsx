import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../contexts/UserContext.jsx";
import Status from "../../Templates/Status.jsx";
import theme from "../../../theme/theme.js";
import { Button, Box, ThemeProvider, Grid, List, ListItem, Typography } from "@mui/material";
import { ReactComponent as HomeIcon } from "../../../images/home_icon.svg";
import { ReactComponent as CalendarIcon } from "../../../images/calendar_icon.svg";

export default function MaintenanceWidget({ maintenanceData, onMaintenanceClick }) {
  // console.log("In MaintenanceWidget", maintenanceData);
  const navigate = useNavigate();
  const { maintenanceRoutingBasedOnSelectedRole, user, selectedRole } = useUser();
  const [isAddingNewMaintenance, setIsAddingNewMaintenance] = useState(false);

  // console.log("Role: ", user);
  // console.log("Selected Role: ", selectedRole);

  const [maintenanceRequestCounts, setMaintenanceRequestCounts] = useState({});
  const colorStatus = selectColorStatus();

  // useEffect(() => {
  //   console.log("maintenanceRequestCounts -  ", maintenanceRequestCounts);
  // }, [maintenanceRequestCounts]);

  // TODO: We need to make the /maintenanceRequests endpoint return the data in the format we need for the Status component
  useEffect(() => {
    const dataObject = {};
    // console.log("maintenanceData", maintenanceData);
    for (const item of maintenanceData) {
      // console.log(item)
      if (!dataObject[item.maintenance_status]) {
        dataObject[item.maintenance_status] = item.num;
      }
    }

    setMaintenanceRequestCounts((prevData) => ({ ...prevData, ...dataObject }));
  }, [maintenanceData]);

  // function routingWithSelectedRole() {
  //   // console.log("routingWithSelectedRole selectedRole", selectedRole)
  //   if (selectedRole === "MANAGER") {
  //     return "/managerMaintenance";
  //   } else if (selectedRole === "OWNER") {
  //     return "/ownerMaintenance";
  //   }
  // }

  function selectColorStatus() {
    // console.log("selectColorStatus selectedRole", selectedRole)
    if (selectedRole === "MANAGER" || selectedRole === "PM_EMPLOYEE") {
      return theme.colorStatusPMO;
    } else if (selectedRole === "OWNER" || selectedRole === "TENANT") {
      return theme.colorStatusO;
    }
  }

  const isEmptyObject = (obj) => {
    return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
  };

  return (
    <Grid
      container
      justifyContent='center'
      //   alignItems="center"
      style={{ padding: "15px" }}
      sx={{
        height: "100%",
        backgroundColor: "#f0f0f0",
        borderRadius: "10px",
        cursor: "pointer",
        padding: "20px",
        // marginBottom: '30px',
      }}
      // onClick={onMaintenanceClick}
      onClick={() => navigate(maintenanceRoutingBasedOnSelectedRole(), { state: { colorStatus, maintenanceRequestCounts } })}
    >
      <Grid item container xs={12}>
        <Grid item xs={2}></Grid>
        <Grid item xs={8} sx={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "flex-start" }}>
          <Typography variant='h5' sx={{ fontWeight: "bold", color: "#160449" }}>
            Maintenance
          </Typography>
        </Grid>
        <Grid item xs={2} container sx={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "flex-start" }}>
          <Button
            sx={{
              color: "#160449",
              fontSize: "30px",
              padding: "0px",
              lineHeight: "1",
              justifyContent: "center",
              "&:hover": {
                backgroundColor: "#F2F2F2",
              },
            }}
            variant='outlined'
            onClick={(e) => {
              e.stopPropagation();
              if (selectedRole === "MANAGER") {
                navigate("/managerMaintenance", {
                  state: {
                    showAddMaintenance: true,
                  },
                });
              } else if (selectedRole === "OWNER") {
                navigate("/ownerMaintenance", {
                  state: {
                    showAddMaintenance: true,
                  },
                });
              }
            }}
          >
            {"+"}
          </Button>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <List
          sx={{
            padding: "0",
            borderRadius: "10px",
            margin: "0",
          }}
        >
          {colorStatus?.map((item, index) => (
            <ListItem
              key={index}
              sx={{
                backgroundColor: item.color,
                color: "#FFFFFF",
                fontFamily: "Source Sans Pro",
                fontSize: "13px",
                fontWeight: 600,
                // padding: "10px 10px",
                borderTopLeftRadius: index === 0 ? "10px" : "0",
                borderTopRightRadius: index === 0 ? "10px" : "0",
                borderBottomLeftRadius: index === colorStatus.length - 1 ? "10px" : "0",
                borderBottomRightRadius: index === colorStatus.length - 1 ? "10px" : "0",
                marginTop: index === 0 ? "5px" : "0",
                marginBottom: "0px",
                height: "55px",
              }}
            >
              <Grid container justifyContent='space-between' alignItems='center'>
                <Grid item>{item.status}</Grid>
                <Grid item>
                  <Typography variant='body2' align='right'>
                    {maintenanceRequestCounts[item.mapping] ? maintenanceRequestCounts[item.mapping] : "0"}
                  </Typography>
                </Grid>
              </Grid>
            </ListItem>
          ))}
        </List>
      </Grid>
    </Grid>
  );
}
