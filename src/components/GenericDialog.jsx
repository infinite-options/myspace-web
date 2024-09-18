import React from "react";
import { Button } from "react-bootstrap";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContentText from "@mui/material/DialogContentText";

export default function GenericDialog(props) {
  const { isOpen, title, contextText, actions, severity } = props;

  // Function to set title color based on severity
  const getTitleStyle = () => {
    switch (severity) {
      case "error":
        return { color: "red" }; // Red for error
      case "success":
        return { color: "blue" }; // Blue for success
      default:
        return { color: "green" }; // Yellow for warnings and others
    }
  };

  return (
    <div>
      <Dialog open={isOpen} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title" style={getTitleStyle()}>
          {title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {contextText}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {actions.map((action, index) => (
            <Button key={index} type="button" onClick={action.onClick}>
              {action.label}
            </Button>
          ))}
        </DialogActions>
      </Dialog>
    </div>
  );
}
