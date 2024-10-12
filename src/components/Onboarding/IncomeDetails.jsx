import React, { useState } from 'react';
import {
    Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography,
    FormControl, InputLabel, Select, MenuItem, Grid, Snackbar, Alert, AlertTitle
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    textField: {
        backgroundColor: '#D6D5DA',
    },
    select: {
        backgroundColor: '#D6D5DA',
        '& .MuiInputLabel-root': {
            fontSize: '12px',
        },
        '& .MuiSvgIcon-root': {
            fontSize: '20px',
        },
    },
}));

const IncomeDetails = ({ employmentList, setEmploymentList, salaryFrequencies }) => {
    const classes = useStyles();
    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentRow, setCurrentRow] = useState({ jobTitle: "", companyName: "", salary: "", frequency: "" });
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setCurrentRow({ jobTitle: "", companyName: "", salary: "", frequency: "" });
        setIsEditing(false);
    };

    const handleSnackbarClose = () => setSnackbarOpen(false);

    const handleAddClick = () => {
        setIsEditing(false);
        handleOpen();
    };

    const handleEditClick = (job) => {
        setIsEditing(true);
        setCurrentRow(job);
        handleOpen();
    };

    const handleSave = () => {
        if (isEditing) {
            const updatedList = employmentList.map((income) =>
                income.jobTitle === currentRow.jobTitle && income.companyName === currentRow.companyName
                    ? currentRow
                    : income
            );
            setEmploymentList(updatedList);
            setSnackbarMessage("Income details updated successfully");
        } else {
            setEmploymentList([...employmentList, currentRow]);
            setSnackbarMessage("Income added successfully");
        }
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        handleClose();
    };

    const handleDeleteClick = (job) => {
        const updatedList = employmentList.filter(
            (income) => income.jobTitle !== job.jobTitle || income.companyName !== job.companyName
        );
        setEmploymentList(updatedList);
        setSnackbarMessage("Income removed successfully");
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontSize: "14px", fontWeight: "bold", color: "#3D5CAC" }}>
                    Job Information
                </Typography>
                <Button
                    sx={{
                        cursor: "pointer",
                        textTransform: "none",
                        fontWeight: "bold",
                        minWidth: "40px",
                        minHeight: "40px",
                        width: "40px",
                    }}
                    onClick={handleAddClick}
                >
                    <AddIcon sx={{ color: "#3D5CAC" }} />
                </Button>
            </Box>

            {/* Display job information as a list */}
            {employmentList.map((job, index) => (
                <Box
                    key={`${job.jobTitle}-${job.companyName}-${index}`}  // Using job title, company name, and index for key
                    sx={{
                        padding: "10px",
                        borderRadius: "5px",
                        marginBottom: "15px",
                        backgroundColor: "#f0f0f0",
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Box>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            Job Title: {job.jobTitle}
                        </Typography>
                        <Typography variant="body2">Company: {job.companyName}</Typography>
                        <Typography variant="body2">Salary: ${job.salary}</Typography>
                        <Typography variant="body2">Frequency: {job.frequency}</Typography>
                    </Box>
                    <Box>
                        <Button onClick={() => handleEditClick(job)} sx={{ marginRight: 1 }}>
                            <EditIcon sx={{ color: "#3D5CAC" }} />
                        </Button>
                        <Button onClick={() => handleDeleteClick(job)}>
                            <DeleteIcon sx={{ color: "#F87C7A" }} />
                        </Button>
                    </Box>
                </Box>
            ))}

            {/* Add/Edit Income Dialog */}
            <Dialog open={open} onClose={handleClose} maxWidth="md">
                <DialogTitle>
                    {isEditing ? "Edit Income Details" : "Add Income Details"}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                className={classes.textField}
                                margin="dense"
                                label="Job Title"
                                fullWidth
                                value={currentRow.jobTitle}
                                onChange={(e) => setCurrentRow({ ...currentRow, jobTitle: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                className={classes.textField}
                                margin="dense"
                                label="Company Name"
                                fullWidth
                                value={currentRow.companyName}
                                onChange={(e) => setCurrentRow({ ...currentRow, companyName: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                className={classes.textField}
                                margin="dense"
                                label="Salary"
                                fullWidth
                                value={currentRow.salary}
                                onChange={(e) => setCurrentRow({ ...currentRow, salary: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl margin="dense" fullWidth variant="outlined">
                                <InputLabel>Frequency</InputLabel>
                                <Select
                                    className={classes.select}
                                    label="Frequency"
                                    value={currentRow.frequency}
                                    onChange={(e) => setCurrentRow({ ...currentRow, frequency: e.target.value })}
                                >
                                    {salaryFrequencies.map((freq) => (
                                        <MenuItem key={freq.list_uid} value={freq.list_item}>
                                            {freq.list_item}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSave} color="primary" variant="contained">
                        Save
                    </Button>
                    <Button onClick={handleClose} color="secondary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for feedback */}
            <Snackbar open={snackbarOpen} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
                    <AlertTitle>{snackbarSeverity === "error" ? "Error" : "Success"}</AlertTitle>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default IncomeDetails;
