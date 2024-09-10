import React, { useRef, useState } from "react";
import { Box, Button, Typography, TextField, Paper, Grid } from "@mui/material";
import SignatureCanvas from "react-signature-canvas";

export default function WaiverForm({ lease_uid, onSubmit }) { // Accept onSubmit as prop
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [initials1, setInitials1] = useState("");
  const [initials2, setInitials2] = useState("");
  const [initials3, setInitials3] = useState("");
  const sigCanvas = useRef({});
  console.log("LEASE UID", lease_uid);

  const clearSignature = () => sigCanvas.current.clear();
  const saveSignature = () => sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");

  const handleSubmit = () => {
    const signature = saveSignature();
    console.log("Signature data:", signature);
    onSubmit(); // Call onSubmit prop after saving the form
  };

  return (
    <Paper sx={{ padding: "20px", backgroundColor: "#f4f4f4" }}>
      <Typography variant="h4" gutterBottom>
        Waiver Form
      </Typography>

      <Box sx={{ marginBottom: "20px" }}>
        <TextField
          label="Full Name"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Box>

      <Box sx={{ marginBottom: "20px" }}>
        <TextField
          label="Address"
          fullWidth
          variant="outlined"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </Box>

      <Typography variant="h6" gutterBottom>
        By initialing below, you agree to the following:
      </Typography>

      <Grid container spacing={2} alignItems="center">
        <Grid item xs={10}>
          <Typography>
            I authorize the manager to perform a background check, credit check, and verification of all provided information.
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <TextField
            label="Initials"
            variant="outlined"
            value={initials1}
            onChange={(e) => setInitials1(e.target.value)}
          />
        </Grid>

        <Grid item xs={10}>
          <Typography>
            I acknowledge that the provided information is accurate to the best of my knowledge.
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <TextField
            label="Initials"
            variant="outlined"
            value={initials2}
            onChange={(e) => setInitials2(e.target.value)}
          />
        </Grid>

        <Grid item xs={10}>
          <Typography>
            I agree to the terms of the lease agreement as discussed and provided.
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <TextField
            label="Initials"
            variant="outlined"
            value={initials3}
            onChange={(e) => setInitials3(e.target.value)}
          />
        </Grid>
      </Grid>

      <Box sx={{ marginTop: "30px", textAlign: "center" }}>
        <Typography variant="h6" gutterBottom>
          Please provide your signature below:
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", position: "relative", marginBottom: "20px" }}>
          <Box sx={{ position: "absolute", top: "-30px", right: "-10px", zIndex: 1 }}>
            <Button variant="outlined" onClick={clearSignature}>
              Clear
            </Button>
          </Box>

          <SignatureCanvas
            ref={sigCanvas}
            canvasProps={{ width: 500, height: 200, className: "sigCanvas" }}
            backgroundColor="white"
            penColor="black"
            style={{ border: "1px solid black", width: "100%" }}
          />
        </Box>
      </Box>

      <Box sx={{ marginTop: "30px", textAlign: "center" }}>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Submit Waiver
        </Button>
      </Box>
    </Paper>
  );
}
