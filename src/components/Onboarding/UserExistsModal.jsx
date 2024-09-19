import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContentText from "@mui/material/DialogContentText";

export default function UserExistsModal(props) {
  const { isOpen, email, onSignup} = props;
  const navigate = useNavigate();
  return (
    <div>
      <Dialog open={isOpen} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">User Already Exists</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">The user {email} already exists!</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button type="submit" onClick={() => navigate("/", {state : {showEmail : true, user_email : email}})}>
            Login
          </Button>

          <Button type="submit" onClick={onSignup}>
            Signup
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
