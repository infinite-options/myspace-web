import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Grid,
  CircularProgress,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import PostAddIcon from "@mui/icons-material/PostAdd";
import { useUser } from "../../contexts/UserContext";
import theme from "../../theme/theme";
import APIConfig from "../../utils/APIConfig";
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../utils/httpMiddleware";

const PropertyOwnership = ({ propertyUid, onEditOwnership }) => {
  const { getProfileId, selectedRole } = useUser();
  const [currentOwner, setCurrentOwner] = useState(null);
  const [allOwners, setAllOwners] = useState([]);
  const [loading, setLoading] = useState(false);
  const profileId = getProfileId();

  useEffect(() => {
    console.log("PropertyOwnership mounted - PropertyUid:", propertyUid, "ProfileId:", profileId);
    if (propertyUid && profileId) {
      fetchOwnershipData();
    }
  }, [propertyUid, profileId]);

  const fetchOwnershipData = async () => {
    setLoading(true);
    console.log("=== Fetching Property Owners ===");
    console.log("Property UID:", propertyUid);
    console.log("Profile ID:", profileId);
    
    try {
      const response = await axios.get(`${APIConfig.baseURL.dev}/propertyOwners/${propertyUid}`);
      const ownersData = response.data?.result || [];
      console.log("PropertyOwners API Response:", ownersData);
      setAllOwners(ownersData);

      // Find current owner (logged-in user)
      const currentOwnerData = ownersData.find(
        owner => owner.property_owner_id === profileId
      );
      if (currentOwnerData) {
        setCurrentOwner({
          ...currentOwnerData,
          current_percent: parseFloat(currentOwnerData.po_owner_percent || 0) * 100,
        });
        console.log("Current owner found:", currentOwnerData);
      } else {
        setCurrentOwner(null);
        console.log("Current owner NOT found in list");
      }
    } catch (error) {
      console.error("Error fetching ownership data:", error);
      setCurrentOwner(null);
    } finally {
      setLoading(false);
    }
  };

  // Get status chip color
  const getStatusColor = (status) => {
    if (!status) return 'default';
    const statusUpper = status.toUpperCase();
    if (statusUpper === 'APPROVED' || statusUpper === 'ACCEPTED') return 'success';
    if (statusUpper === 'PENDING') return 'warning';
    if (statusUpper === 'DECLINED' || statusUpper === 'REJECTED') return 'error';
    if (statusUpper === 'CANCELLED') return 'default';
    return 'default';
  };

  // Get status label
  const getStatusLabel = (status) => {
    if (!status) return '';
    const statusUpper = status.toUpperCase();
    if (statusUpper === 'APPROVED' || statusUpper === 'ACCEPTED') return 'Approved';
    if (statusUpper === 'PENDING') return 'Pending';
    if (statusUpper === 'DECLINED' || statusUpper === 'REJECTED') return 'Declined';
    if (statusUpper === 'CANCELLED') return 'Cancelled';
    return status;
  };

  console.log("PropertyOwnership rendering - Loading:", loading, "CurrentOwner:", currentOwner);

  return (
    <Grid container item xs={12} justifyContent='center' sx={{ marginTop: "20px" }}>
      <Grid container item xs={11}>
        <Grid item xs={12}>
          <Card
            sx={{
              boxShadow: "none",
              elevation: "0",
              backgroundColor: "#FFFFFF",
            }}
          >
            <CardContent sx={{ padding: "30px" }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "20px",
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#160449",
                        fontWeight: theme.typography.primary.fontWeight,
                        fontSize: theme.typography.largeFont,
                        textAlign: "left",
                      }}
                    >
                      Property Owners
                    </Typography>
                    {selectedRole === "OWNER" && (
                      <Button
                        variant='contained'
                        sx={{
                          background: "#3D5CAC",
                          color: theme.palette.background.default,
                          cursor: "pointer",
                          textTransform: "none",
                          minWidth: "100px",
                          minHeight: "35px",
                          fontWeight: theme.typography.secondary.fontWeight,
                          fontSize: theme.typography.smallFont,
                        }}
                        size='small'
                        onClick={onEditOwnership}
                        startIcon={<PostAddIcon sx={{ color: "#FFFFFF", fontSize: "18px" }} />}
                      >
                        Edit Ownership
                      </Button>
                    )}
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", padding: "20px" }}>
                      <CircularProgress />
                    </Box>
                  ) : currentOwner ? (
                    <>
                      {/* Current Owner */}
                      <Box
                        sx={{
                          backgroundColor: "#F5F7FA",
                          borderRadius: "8px",
                          padding: "25px",
                        }}
                      >
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <Box>
                                  <Typography
                                    sx={{
                                      fontWeight: theme.typography.primary.fontWeight,
                                      fontSize: "18px",
                                      color: "#000000",
                                    }}
                                  >
                                    {currentOwner.owner_first_name} {currentOwner.owner_last_name}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontSize: "14px",
                                      color: "#111",
                                      marginTop: "4px",
                                    }}
                                  >
                                    {currentOwner.owner_email}
                                  </Typography>
                                </Box>
                                
                                <Chip 
                                  label="Current Owner"
                                  color="success"
                                  size="small"
                                  sx={{ 
                                    fontSize: "11px",
                                    height: "22px",
                                    fontWeight: 500
                                  }}
                                />
                              </Box>
                              
                              <Typography
                                sx={{
                                  fontWeight: theme.typography.primary.fontWeight,
                                  fontSize: "28px",
                                  color: "#0D1F4A",
                                }}
                              >
                                {parseFloat(currentOwner.current_percent || 0).toFixed(1)}%
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </>
                  ) : (
                    <Typography
                      sx={{
                        textAlign: "center",
                        color: "#666",
                        fontSize: theme.typography.mediumFont,
                        padding: "20px",
                      }}
                    >
                      You are not listed as an owner for this property
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default PropertyOwnership;