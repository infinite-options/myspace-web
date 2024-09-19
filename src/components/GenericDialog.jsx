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
        return { color: "orange" }; // Yellow for warnings and others
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

// Copy the lines below and add in file where GenericDialog is called

// import GenericDialog from "../GenericDialog";

// const [isDialogOpen, setIsDialogOpen] = useState(false);
// const [dialogTitle, setDialogTitle] = useState("");
// const [dialogMessage, setDialogMessage] = useState("");
// const [dialogSeverity, setDialogSeverity] = useState("info");

// const openDialog = (title, message, severity) => {
//   setDialogTitle(title); // Set custom title
//   setDialogMessage(message); // Set custom message
//   setDialogSeverity(severity); // Can use this if needed to control styles
//   setIsDialogOpen(true);
// };

// const closeDialog = () => {
//   setIsDialogOpen(false);
// };

// Replace all alert line with openDialog line

// alert(`Your file size is too large (${file_size} MB)`);
// openDialog("Alert",`Your file size is too large (${file_size} MB)`,"info");
// openDialog("Success",`Your file size is too large (${file_size} MB)`,"success");
// openDialog("Error",`Your file size is too large (${file_size} MB)`,"error");

// showSnackbar("Your profile has been successfully updated.", "success");
// openDialog("Success",`Your file size is too large (${file_size} MB)`,"success");

// showSnackbar("Cannot update your profile. Please try again", "error");
// openDialog("Error",`Your file size is too large (${file_size} MB)`,"error");
        
// need to replace Snackbar componet with Genericdialog component

/* <Snackbar open={snackbarOpen} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%', height: "100%" }}>
            <AlertTitle>{snackbarSeverity === "error" ? "Error" : "Success"}</AlertTitle>
            {snackbarMessage}
        </Alert>
  </Snackbar> */





/* <GenericDialog
      isOpen={isDialogOpen}
      title={dialogTitle}
      contextText={dialogMessage}
      actions={[
        {
          label: "OK",
          onClick: closeDialog,
        }
      ]}
      severity={dialogSeverity}
    /> */

    // actions={[
    //   {
    //     label: "Yes",
    //     onClick: yesAction,
    //   },
    //   {
    //     label: "No",
    //     onClick: NoAction,
    //   }
    // ]}