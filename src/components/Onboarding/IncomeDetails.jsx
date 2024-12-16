import React, { useState } from 'react';
import {
    Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography,
    FormControl, InputLabel, Select, MenuItem, Grid, Snackbar, Alert, AlertTitle
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { makeStyles } from '@material-ui/core/styles';
import GenericDialog from '../GenericDialog';
// import axios from 'axios';
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../utils/httpMiddleware";
import { useUser } from '../../contexts/UserContext';
import APIConfig from '../../utils/APIConfig';

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
    const [showSpinner, setShowSpinner] = useState(false);
    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentRow, setCurrentRow] = useState({ jobTitle: "", companyName: "", salary: "", frequency: "" });
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogTitle, setDialogTitle] = useState('');
    const [dialogMessage, setDialogMessage] = useState('');
    const [dialogSeverity, setDialogSeverity] = useState('info');
    const { user, getProfileId } = useUser();

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setCurrentRow({ jobTitle: "", companyName: "", salary: "", frequency: "" });
        setIsEditing(false);
    };

    const handleDialogClose = () => setDialogOpen(false);

    const handleAddClick = () => {
        setIsEditing(false);
        handleOpen();
    };

    const handleEditClick = (job, index) => {
        setIsEditing(true);
        console.log("currentrow", job, index);
        setCurrentRow({ ...job, index });
        handleOpen();
    };

    // const handleChange = (index, field, value) => {
    //     const updatedList = [...employmentList];
    //     updatedList[index] = { ...updatedList[index], [field]: value };
    
    //     setEmploymentList(updatedList);
    
    //     // console.log("Updated Employment List:", updatedList);
    // };

    const handleChange = (field, value) => {
        setCurrentRow(prevRow => ({
            ...prevRow,
            [field]: value
        }));
    };

    const handleSave = async () => {
        const updatedList = [...employmentList];
        console.log("updated list", updatedList);

        if (isEditing) {
            updatedList[currentRow.index] = { ...currentRow };
        } else {
            updatedList.push({ ...currentRow });
        }
    
        console.log("updated list 2", updatedList);
        setEmploymentList(updatedList);
    
        const profileFormData = new FormData();
        console.log("tenant emp7", updatedList);
        profileFormData.append("tenant_uid", getProfileId());
        profileFormData.append("tenant_employment", JSON.stringify(updatedList));
    
        try {
            setShowSpinner(true);
            await axios.put(`${APIConfig.baseURL.dev}/profile`, profileFormData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
    
            setDialogTitle('Success');
            setDialogMessage(isEditing ? "Income details updated successfully." : "Income added successfully.");
            setDialogSeverity('success');
        } catch (error) {
            console.error("Error updating employment data:", error);
            setDialogTitle('Error');
            setDialogMessage("Error updating employment data. Please try again.");
            setDialogSeverity('error');
        } finally {
            setShowSpinner(false);
            setDialogOpen(true);
            handleClose();
        }
    };
    
    
    
    const handleDeleteClick = async (job) => {
        const updatedList = employmentList.filter(
            (income) => income.jobTitle !== job.jobTitle || income.companyName !== job.companyName
        );
        await setEmploymentList(updatedList);
        const profileFormData = new FormData();
        profileFormData.append("tenant_uid", getProfileId());
        profileFormData.append("tenant_employment", JSON.stringify(updatedList));
    
        try {
            setShowSpinner(true);
            await axios.put(`${APIConfig.baseURL.dev}/profile`, profileFormData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
    
            setDialogTitle('Success');
            setDialogMessage("Income removed successfully.");
            setDialogSeverity('success');
        } catch (error) {
            console.error("Error removing employment data:", error);
            setDialogTitle('Error');
            setDialogMessage("Error removing employment data. Please try again.");
            setDialogSeverity('error');
        } finally {
            setShowSpinner(false);
            setDialogOpen(true);
            handleClose();
        }
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
                        <Button onClick={() => handleEditClick(job, index)} sx={{ marginRight: 1 }}>
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
                        label="Company Name"
                        InputLabelProps={{
                            style: { color: 'black' },
                        }}
                        fullWidth
                        value={currentRow.firstName}
                        onChange={(e) => handleChange("companyName", e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={6}>
                        <TextField
                        className={classes.textField}
                        margin="dense"
                        label="Job Title"
                        InputLabelProps={{
                            style: { color: 'black' },
                        }}
                        fullWidth
                        value={currentRow.lastName}
                        onChange={(e) => handleChange("jobTitle", e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={6}>
                        <TextField
                        className={classes.textField}
                        margin="dense"
                        label="Salary"
                        InputLabelProps={{
                            style: { color: 'black' },
                        }}
                        fullWidth
                        value={currentRow.email}
                        onChange={(e) => handleChange("salary", e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={6}>
                        <FormControl margin="dense" fullWidth variant="outlined">
                        <InputLabel style={{ color: 'black' }}>Frequency</InputLabel>
                        <Select
                            className={classes.select}
                            label="Frequency"
                            value={currentRow.frequency}
                            onChange={(e) => handleChange("frequency", e.target.value)}
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
                    <Button
                    onClick={handleSave}
                    style={{ color: 'white', backgroundColor: "#3D5CAC" }}
                    variant="contained"
                    >
                    Save
                    </Button>
                    <Button onClick={handleClose} color="secondary">
                    Cancel
                    </Button>
                </DialogActions>
            </Dialog>


            <GenericDialog
                isOpen={dialogOpen}
                title={dialogTitle}
                contextText={dialogMessage}
                actions={[
                    {
                        label: "OK",
                        onClick: handleDialogClose,
                    },
                ]}
                severity={dialogSeverity}
            />
        </Box>
    );
};

export default IncomeDetails;
