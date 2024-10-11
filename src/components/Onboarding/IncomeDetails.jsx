import React, { useState, useEffect } from 'react';
import {
    Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography,
    FormControl, InputLabel, Select, MenuItem, Grid, Snackbar, Alert, AlertTitle
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import theme from "../../theme/theme";
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

    const handleEditClick = (row) => {
        setIsEditing(true);
        setCurrentRow(row);
        handleOpen();
    };

    const handleSave = () => {
        if (isEditing) {
            const updatedList = employmentList.map((income) =>
                income.id === currentRow.id ? currentRow : income
            );
            setEmploymentList(updatedList);
            setSnackbarMessage("Income details updated successfully");
        } else {
            const newIncome = { ...currentRow, id: Date.now() }; // Add unique ID for DataGrid
            setEmploymentList([...employmentList, newIncome]);
            setSnackbarMessage("Income added successfully");
        }
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        handleClose();
    };

    const handleDeleteClick = (row) => {
        const updatedList = employmentList.filter((income) => income.id !== row.id);
        setEmploymentList(updatedList);
        setSnackbarMessage("Income removed successfully");
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
    };

    const columns = [
        { field: 'jobTitle', headerName: 'Job Title', flex: 1 },
        { field: 'companyName', headerName: 'Company', flex: 1 },
        { field: 'salary', headerName: 'Salary', flex: 1 },
        { field: 'frequency', headerName: 'Frequency', flex: 1 },
        {
            field: 'actions',
            headerName: 'Actions',
            type: 'actions',
            width: 100,
            getActions: (params) => [
                <GridActionsCellItem
                    icon={<EditIcon sx={{ color: "#3D5CAC" }} />}
                    label="Edit"
                    onClick={() => handleEditClick(params.row)}
                />,
                <GridActionsCellItem
                    icon={<DeleteIcon sx={{ color: "#F87C7A" }} />}
                    label="Delete"
                    onClick={() => handleDeleteClick(params.row)}
                />,
            ],
        },
    ];

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

            <DataGrid
                rows={employmentList}
                columns={columns}
                getRowId={(row) => row.jobTitle || Date.now()}
                hideFooter={true}
                autoHeight
                disableSelectionOnClick
            />

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
