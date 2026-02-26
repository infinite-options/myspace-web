import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Grid,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import theme from "../../theme/theme";
import { useUser } from "../../contexts/UserContext";
import APIConfig from "../../utils/APIConfig";
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../utils/httpMiddleware";

const EditPropertyOwnership = ({ propertyUid, onClose }) => {
  const { getProfileId } = useUser();
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddOwner, setShowAddOwner] = useState(false);
  const [newOwnerEmail, setNewOwnerEmail] = useState("");
  const [proposedPercent, setProposedPercent] = useState("");
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [currentOwners, setCurrentOwners] = useState([]);
  const profileId = getProfileId();

  useEffect(() => {
    if (propertyUid) {
      fetchOwners();
    }
  }, [propertyUid]);

  useEffect(() => {
    // Auto-show popup when there are pending transfers for the current user
    const pendingTransfers = getPendingTransfersForCurrentUser();
    if (pendingTransfers.length > 0 && !showNotificationPopup) {
      setShowNotificationPopup(true);
    }
  }, [owners]);

  const fetchOwners = async () => {
    setLoading(true);
    setError("");
    
    console.log("=== EditPropertyOwnership: Fetching data ===");
    console.log("Property UID:", propertyUid);
    
    try {
      // Call both endpoints in parallel
      const [ownersResponse, transfersResponse] = await Promise.all([
        axios.get(`${APIConfig.baseURL.dev}/propertyOwners/${propertyUid}`),
        axios.get(`${APIConfig.baseURL.dev}/ownershipTransfer/${propertyUid}`),
      ]);

      const currentOwners = ownersResponse.data?.result || [];
      const transferData = transfersResponse.data?.result || [];
      console.log("PropertyOwners Response:", currentOwners);
      console.log("OwnershipTransfer Response:", transferData);

      // Combine: store transfer data as before (used by handlers/validation)
      setOwners(transferData);
      // Store current owners separately
      setCurrentOwners(currentOwners);
    } catch (error) {
      console.error("Error fetching ownership data:", error);
      setError("Error fetching ownership data");
    } finally {
      setLoading(false);
    }
  };

  const handleTransferAction = async (transferId, action) => {
    setError("");
    setSuccess("");
    setLoading(true);

    console.log(`=== ${action} Transfer ===`);
    console.log("Transfer ID:", transferId, "| type:", typeof transferId);
    console.log("Action:", action, "| type:", typeof action);
    console.log("User ID (profileId):", profileId, "| type:", typeof profileId);

    try {
      const formData = new FormData();
      formData.append("transfer_id", transferId);
      formData.append("action", action);
      formData.append("user_id", profileId);

      // Log all FormData entries
      console.log("=== FormData entries ===");
      for (const [key, value] of formData.entries()) {
        console.log(`  ${key}: "${value}" (type: ${typeof value})`);
      }

      const url = `${APIConfig.baseURL.dev}/ownershipTransfer`;
      console.log("PUT URL:", url);

      const response = await fetch(url, {
        method: "PUT",
        body: formData,
      });

      console.log("PUT Response Status:", response.status, response.statusText);
      console.log("PUT Response OK:", response.ok);

      const data = await response.json();
      console.log("PUT Response Data:", JSON.stringify(data, null, 2));

      if (response.ok) {
        setSuccess(`Transfer ${action.toLowerCase()}ed successfully`);
        await fetchOwners();
        
        // Close popup if no more pending transfers
        const pendingAfterAction = owners.filter(
          (owner) =>
            owner.transfer_status === "PENDING" &&
            owner.to_owner_email &&
            owner.ownerId !== profileId &&
            owner.transfer_id !== transferId
        );
        if (pendingAfterAction.length === 0) {
          setShowNotificationPopup(false);
        }
      } else {
        setError(data.message || `Failed to ${action.toLowerCase()} transfer`);
      }
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing transfer:`, error);
      setError(`Error ${action.toLowerCase()}ing transfer`);
    } finally {
      setLoading(false);
    }
  };

  const getPendingTransfersForCurrentUser = () => {
    return owners.filter(
      (owner) =>
        owner.transfer_status === "PENDING" &&
        owner.to_owner_email &&
        owner.ownerId !== profileId // Transfers where current user is the recipient
    );
  };

  const getDisplayRows = () => {
    const rows = [];

    // Current owners from /propertyOwners endpoint
    currentOwners.forEach((owner) => {
      rows.push({
        name: `${owner.owner_first_name || ""} ${owner.owner_last_name || ""}`.trim(),
        email: owner.owner_email,
        percent: parseFloat(owner.po_owner_percent || 0) * 100,
        status: "APPROVED",
        transfer_id: null,
        ownerId: owner.property_owner_id,
        isCurrent: owner.property_owner_id === profileId,
      });
    });

    // Pending/Approved transfers from /ownershipTransfer endpoint
    // Build a set of approved transfers to filter out their matching PENDING rows
    const approvedKeys = new Set();
    owners.forEach((owner) => {
      if ((owner.transfer_status || "").toUpperCase() === "APPROVED") {
        approvedKeys.add(`${owner.property_id}_${owner.ownerId}_${owner.to_owner_id}_${owner.proposed_percent}`);
      }
    });

    const addedTransfers = new Set();
    owners.forEach((owner) => {
      if (owner.to_owner_email && owner.transfer_id && !addedTransfers.has(owner.transfer_id)) {
        const status = (owner.transfer_status || "").toUpperCase();

        // Skip PENDING rows that already have a matching APPROVED row
        if (status === "PENDING") {
          const key = `${owner.property_id}_${owner.ownerId}_${owner.to_owner_id}_${owner.proposed_percent}`;
          if (approvedKeys.has(key)) return;
        }

        if (status === "PENDING" || status === "APPROVED" || status === "ACCEPTED") {
          addedTransfers.add(owner.transfer_id);
          rows.push({
            name: `${owner.to_owner_first_name || ""} ${owner.to_owner_last_name || ""}`.trim(),
            email: owner.to_owner_email,
            percent: parseFloat(owner.proposed_percent || 0),
            status: owner.transfer_status,
            transfer_id: owner.transfer_id,
            ownerId: owner.ownerId,
            isCurrent: false,
          });
        }
      }
    });

    // Sort: current user first, then approved owners, then transfers
    rows.sort((a, b) => {
      if (a.isCurrent && !b.isCurrent) return -1;
      if (!a.isCurrent && b.isCurrent) return 1;
      if (a.status === "APPROVED" && b.status !== "APPROVED") return -1;
      if (a.status !== "APPROVED" && b.status === "APPROVED") return 1;
      return 0;
    });

    return rows;
  };

  const getStatusColor = (status) => {
    if (!status) return "default";
    const statusUpper = status.toUpperCase();
    if (statusUpper === "APPROVED" || statusUpper === "ACCEPTED") return "success";
    if (statusUpper === "PENDING") return "warning";
    if (statusUpper === "REJECTED") return "error";
    if (statusUpper === "CANCELLED") return "default";
    return "default";
  };

  const calculateCurrentTotal = () => {
    return owners.reduce((sum, owner) => {
      return sum + parseFloat(owner.current_percent || 0);
    }, 0);
  };

  const handleAddOwner = async () => {
    setError("");
    setSuccess("");

    console.log("=== Submit Add Owner ===");
    console.log("New Owner Email:", newOwnerEmail);
    console.log("Proposed Percent:", proposedPercent);

    if (!newOwnerEmail || !proposedPercent) {
      setError("Please enter email and percentage");
      return;
    }

    const percentValue = parseFloat(proposedPercent);
    if (isNaN(percentValue) || percentValue <= 0 || percentValue > 100) {
      setError("Percentage must be between 0 and 100");
      return;
    }

    const currentOwner = currentOwners.find(owner => owner.property_owner_id === profileId);
    console.log("Current Owner:", currentOwner);
    
    if (!currentOwner) {
      setError("You are not an owner of this property");
      return;
    }

    const currentPercent = parseFloat(currentOwner.po_owner_percent || 0) * 100;
    console.log("Current Percent:", currentPercent);
    
    if (currentPercent < percentValue) {
      setError(`You only have ${currentPercent.toFixed(1)}% ownership`);
      return;
    }

    setLoading(true);

    try {
      console.log("=== POST Add Owner ===");
      console.log("property_id:", propertyUid, "| type:", typeof propertyUid);
      console.log("from_owner_email:", currentOwner.owner_email, "| type:", typeof currentOwner.owner_email);
      console.log("to_owner_email:", newOwnerEmail, "| type:", typeof newOwnerEmail);
      console.log("proposed_percent:", percentValue, "| type:", typeof percentValue);

      const formData = new FormData();
      formData.append("property_id", propertyUid);
      formData.append("from_owner_email", currentOwner.owner_email);
      formData.append("to_owner_email", newOwnerEmail);
      formData.append("proposed_percent", percentValue);

      // Log all FormData entries
      console.log("=== FormData entries ===");
      for (const [key, value] of formData.entries()) {
        console.log(`  ${key}: "${value}" (type: ${typeof value})`);
      }

      const url = `${APIConfig.baseURL.dev}/ownershipTransfer`;
      console.log("POST URL:", url);

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      console.log("POST Response Status:", response.status, response.statusText);
      console.log("POST Response OK:", response.ok);
      
      const data = await response.json();
      console.log("POST Response Data:", JSON.stringify(data, null, 2));

      if (response.ok) {
        setSuccess("Transfer request created successfully");
        setShowAddOwner(false);
        setNewOwnerEmail("");
        setProposedPercent("");
        await fetchOwners();
      } else {
        setError(data.message || "Failed to create transfer request");
      }
    } catch (error) {
      console.error("Error creating transfer request:", error);
      setError("Error creating transfer request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container justifyContent="center">
      <Grid item xs={12}>
        <Card
          sx={{
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
            backgroundColor: "#FFFFFF",
          }}
        >
          <CardContent sx={{ padding: "50px" }}>
            {/* Header */}
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
                }}
              >
                Property Ownership
              </Typography>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                {getPendingTransfersForCurrentUser().length > 0 && (
                  <IconButton
                    onClick={() => setShowNotificationPopup(true)}
                    sx={{
                      color: "#FF9800",
                      backgroundColor: "#FFF3E0",
                      "&:hover": {
                        backgroundColor: "#FFE0B2",
                      },
                    }}
                  >
                    <Badge badgeContent={getPendingTransfersForCurrentUser().length} color="error">
                      <NotificationsActiveIcon />
                    </Badge>
                  </IconButton>
                )}
                <Button
                  variant="contained"
                  sx={{
                    background: "#3D5CAC",
                    color: "#FFFFFF",
                    textTransform: "none",
                    fontWeight: theme.typography.secondary.fontWeight,
                    fontSize: theme.typography.smallFont,
                  }}
                  startIcon={<PersonAddIcon />}
                  onClick={() => setShowAddOwner(!showAddOwner)}
                >
                  {showAddOwner ? "Cancel" : "Add Owner"}
                </Button>
                {onClose && (
                  <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                  </IconButton>
                )}
              </Box>
            </Box>

            {/* Success/Error Messages */}
            {error && (
              <Alert severity="error" sx={{ marginBottom: "20px" }} onClose={() => setError("")}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ marginBottom: "20px" }} onClose={() => setSuccess("")}>
                {success}
              </Alert>
            )}

            {/* Add Owner Form */}
            {showAddOwner && (
              <Box
                sx={{
                  padding: "20px",
                  backgroundColor: "#F9FAFB",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  border: "1px solid #E0E0E0",
                }}
              >
                <Typography sx={{ fontWeight: "bold", marginBottom: "15px" }}>
                  Transfer Ownership
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="New Owner Email"
                      value={newOwnerEmail}
                      onChange={(e) => setNewOwnerEmail(e.target.value)}
                      placeholder="Enter email address"
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      label="Percentage"
                      value={proposedPercent}
                      onChange={(e) => setProposedPercent(e.target.value)}
                      placeholder="e.g., 20"
                      type="number"
                      fullWidth
                      size="small"
                      inputProps={{ min: 0, max: 100, step: 0.1 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Button
                      variant="contained"
                      onClick={handleAddOwner}
                      disabled={loading}
                      fullWidth
                      sx={{
                        background: "#3D5CAC",
                        color: "#FFFFFF",
                        textTransform: "none",
                        height: "40px",
                      }}
                    >
                      Submit
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Ownership Table */}
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", padding: "40px" }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ boxShadow: "none", border: "1px solid #E0E0E0" }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#F5F7FA" }}>
                      <TableCell sx={{ fontWeight: "bold", fontSize: "18px", color: "#160449", padding: "18px 24px" }}>
                        Owner
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", fontSize: "18px", color: "#160449", padding: "18px 24px" }}>
                        Ownership %
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", fontSize: "18px", color: "#160449", padding: "18px 24px" }}>
                        Status
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", fontSize: "18px", color: "#160449", padding: "18px 24px" }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getDisplayRows().length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} sx={{ textAlign: "center", padding: "40px" }}>
                          <Typography sx={{ color: "#666", fontSize: "14px" }}>
                            No owners found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      getDisplayRows().map((row, index) => (
                        <TableRow key={index} hover sx={row.isCurrent ? { backgroundColor: "#F0F7FF" } : {}}>
                          <TableCell sx={{ fontSize: "18px", padding: "18px 24px" }}>
                            <Box>
                              {row.name && (
                                <Typography sx={{ fontSize: "18px", fontWeight: 600, color: "#000" }}>
                                  {row.name} {row.isCurrent ? "(You)" : ""}
                                </Typography>
                              )}
                              <Typography sx={{ fontSize: "14px", color: "#444", marginTop: row.name ? "2px" : 0 }}>
                                {row.email}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontSize: "18px", padding: "18px 24px" }}>
                            {row.percent.toFixed(1)}%
                          </TableCell>
                          <TableCell sx={{ padding: "18px 24px" }}>
                            <Chip
                              label={row.status}
                              color={getStatusColor(row.status)}
                              size="medium"
                              sx={{ fontSize: "13px", height: "30px", fontWeight: 500 }}
                            />
                          </TableCell>
                          <TableCell sx={{ padding: "18px 24px" }}>
                            {row.status === "PENDING" && row.ownerId === profileId && (
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleTransferAction(row.transfer_id, "CANCEL")}
                                disabled={loading}
                                sx={{
                                  borderColor: "#999",
                                  color: "#666",
                                  textTransform: "none",
                                  fontSize: "13px",
                                  padding: "6px 16px",
                                  "&:hover": { borderColor: "#666", backgroundColor: "#F5F5F5" },
                                }}
                              >
                                Cancel
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default EditPropertyOwnership;
