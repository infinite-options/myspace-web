import React, { useState, useEffect } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import {
    Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, TextField,
    Typography, FormControl, InputLabel, Select, MenuItem, Grid, Snackbar, Alert, AlertTitle
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import theme from "../../theme/theme";
import useMediaQuery from "@mui/material/useMediaQuery";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { makeStyles } from '@material-ui/core/styles';
import DataValidator from "../DataValidator";
import Close from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import { formatPhoneNumber, formatSSN, formatEIN, identifyTaxIdType, maskNumber, } from '../Onboarding/helper.js';

const useStyles = makeStyles((theme) => ({
    paper: {
        position: 'absolute',
        width: 500,
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
    alert: {
        marginTop: theme.spacing(2),
    },
    select: {
        '& .MuiInputBase-root': {
            backgroundColor: '#D6D5DA',
            height: '30px',
            padding: '0 14px',
            fontSize: '14px',
        },
        '& .MuiInputLabel-root': {
            fontSize: '10px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'translate(14px, 10px) scale(1)',
        },
        '& .MuiSvgIcon-root': {
            fontSize: '20px',
        },
    },
}));

const AdultOccupant = ({ leaseAdults, setLeaseAdults, relationships, editOrUpdateLease, setModifiedData, modifiedData, dataKey, isEditable }) => {
    // //console.log('Inside Adult occupants', leaseAdults, relationships);
    const [adults, setAdults] = useState([]);
    const [open, setOpen] = useState(false);
    const [currentRow, setCurrentRow] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const color = theme.palette.form.main;
    const classes = useStyles();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [isUpdated, setIsUpdated] = useState(false);

    useEffect(() => {
        //console.log('inside mod', modifiedData);
        if (modifiedData && modifiedData.length > 0) {
            //console.log('hap1', modifiedData);
            editOrUpdateLease();
            handleClose();
        }
    }, [isUpdated]);

    useEffect(() => {
        if (leaseAdults && leaseAdults.length > 0) {
            // //console.log('leaseAdults', leaseAdults, typeof (leaseAdults));
            //Need Id for datagrid
            if(!setLeaseAdults){
                const adultsWithIds = leaseAdults.map((adult, index) => ({ ...adult, id: index }));
                setAdults(adultsWithIds);            
            }else{
                setAdults(leaseAdults);            
            }
        }
    }, [leaseAdults]);

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setCurrentRow(null);
        setIsEditing(false);
        setIsUpdated(false);
    };

    const isRowModified = (originalRow, currentRow) => {
        return JSON.stringify(originalRow) !== JSON.stringify(currentRow);
    };

    const showSnackbar = (message, severity) => {
        //console.log('Inside show snackbar');
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleSave = () => {
        const numericPhone = currentRow.phone_number.replace(/\D/g, '');        
        if (isEditing) {
            if (isRowModified(adults[currentRow['id']], currentRow)) {
                const updatedRow = adults.map(adult => (adult.id === currentRow.id ? currentRow : adult));
                const rowWithoutId = updatedRow.map(({ id, ...rest }) => rest);
               

                // //console.log("129 - updatedRow - ", updatedRow);
                if(setLeaseAdults){
                    setLeaseAdults((prevLeaseAdults) =>
                        prevLeaseAdults.map((adult) => 
                            adult.id === currentRow.id 
                                ? { ...adult, ...currentRow }
                                : adult
                        )
                    );
                }
                
                
                // //console.log("--- DEBUG -- rows without id in edit adult - ", rowWithoutId)
                // //console.log("--- DEBUG -- modified data - ", modifiedData)
                // Check if `prev` is an array before spreading it
                // setModifiedData((prev) => Array.isArray(prev) ? [...prev, { key: dataKey, value: rowWithoutId }] : [{ key: dataKey, value: rowWithoutId }]);
                setModifiedData((prev) => {
                    if (Array.isArray(prev)) {
                      const existingIndex = prev.findIndex((item) => item.key === dataKey);
                      
                      if (existingIndex > -1) {
                        const updatedData = [...prev];
                        updatedData[existingIndex] = {
                          ...updatedData[existingIndex],
                          value: rowWithoutId,
                        };
                        return updatedData;
                      } else {
                        return [...prev, { key: dataKey, value: rowWithoutId }];
                      }
                    }
                    return [{ key: dataKey, value: rowWithoutId }];
                  });
                setIsUpdated(true);
            } else {
                showSnackbar("You haven't made any changes to the form. Please save after changing the data.", "error");
            }
        } else {
            const { id, ...newRowWithoutId } = currentRow;

            // //console.log("139 - currentRow - ", currentRow);
    
            // Check if `prev` is an array before spreading it
            // //console.log("--- DEBUG -- rows without id in add adult - ", newRowWithoutId)
            // //console.log("--- DEBUG -- modified data - ", modifiedData)
            // setModifiedData((prev) => Array.isArray(prev) ? [...prev, { key: dataKey, value: [...leaseAdults, newRowWithoutId] }] : [{ key: dataKey, value: [...leaseAdults, newRowWithoutId] }]);            
            if(setLeaseAdults){
                setLeaseAdults((prevLeaseAdults) => [
                    // ...prevLeaseAdults.filter(adult => !Array.isArray(adult)),
                    ...prevLeaseAdults,
                    currentRow,
                ]);
            }
            setModifiedData((prev) => {
                if (Array.isArray(prev)) {
                  const existingIndex = prev.findIndex((item) => item.key === dataKey);
                  if (existingIndex > -1) {
                    const updatedData = [...prev];
                    updatedData[existingIndex] = {
                      ...updatedData[existingIndex],
                      value: [...leaseAdults, newRowWithoutId],
                    };
                    return updatedData;
                  }
                  return [...prev, { key: dataKey, value: [...leaseAdults, newRowWithoutId] }];
                }
                return [{ key: dataKey, value: [...leaseAdults, newRowWithoutId] }];
            });
            setIsUpdated(true);
        }
    };
    

    const handleEditClick = (row) => {
        setCurrentRow(row);
        setIsEditing(true);
        handleOpen();
    };

    const handleDelete = () => {
        const filtered = adults.filter(adult => adult.id !== currentRow.id);
        const rowWithoutId = filtered.map(({ id, ...rest }) => rest);

        setModifiedData((prev) => {
            if (Array.isArray(prev)) {
              const existingIndex = prev.findIndex((item) => item.key === dataKey);
          
              if (existingIndex > -1) {
                const updatedData = [...prev];
                updatedData[existingIndex] = {
                  ...updatedData[existingIndex],
                  value: rowWithoutId,
                };
                return updatedData;
              } else {
                return [...prev, { key: dataKey, value: rowWithoutId }];
              }
            }
            return [{ key: dataKey, value: rowWithoutId }];
          });

        // setModifiedData((prev) => [...prev, {key: dataKey, value:rowWithoutId}]);
        setIsUpdated(true);
    };

    const handleDeleteClick = () => {
        setOpenDeleteConfirmation(true);
    };

    const handleDeleteClose = () => {
        setOpenDeleteConfirmation(false);
    };

    const handleDeleteConfirm = () => {
        handleDelete();
        setOpenDeleteConfirmation(false);
    }

    const handlePhoneNumberChange = (e) => {
        let input = e.target.value;
        const formattedPhone = formatPhoneNumber(input);
        const numericPhone = formattedPhone.replace(/\D/g, '');

        if (numericPhone.length <= 10) {
            setCurrentRow({ ...currentRow, phone_number: formattedPhone });
        }
    };

    const handleSSNChange = (e) => {
        const input = e.target.value;
        const formattedSSN = formatSSN(input); // Format SSN
        setCurrentRow({ ...currentRow, tenant_ssn: formattedSSN }); // Update with formatted SSN
    };


    const columns = isEditable? [
        { field: 'name', headerName: 'First Name', flex: 1, editable: true },
        { field: 'last_name', headerName: 'Last Name', flex: 1, editable: true },
        { field: 'email', headerName: 'Email', flex: 1, editable: true },
        { field: 'phone_number', headerName: 'Phone Number', flex: 1, editable: true },
        { field: 'relationship', headerName: 'Relationship', flex: 1, editable: true },
        { field: 'dob', headerName: 'DoB', flex: 1, editable: true },
        {
            field: 'actions',
            headerName: 'Actions',
            type: 'actions',
            width: 100,
            getActions: (params) => [
                <GridActionsCellItem icon={<EditIcon sx={{ color: "#3D5CAC" }} />} label="Edit" onClick={() => handleEditClick(params.row)} />,
                // <GridActionsCellItem icon={<DeleteIcon sx={{color:"#3D5CAC"}}/>} label="Delete" onClick={() => handleDeleteClick(params.id)} />,
            ],
        },
    ] : [
        { field: 'name', headerName: 'First Name', flex: 1, editable: true },
        { field: 'last_name', headerName: 'Last Name', flex: 1, editable: true },
        { field: 'email', headerName: 'Email', flex: 1, editable: true },
        { field: 'phone_number', headerName: 'Phone Number', flex: 1, editable: true },
        { field: 'relationship', headerName: 'Relationship', flex: 1, editable: true },
        { field: 'dob', headerName: 'DoB', flex: 1, editable: true },
    ];

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <Typography sx={{ fontSize: "14px", fontWeight: "bold", color: "#3D5CAC", marginLeft: '5px' }}>Adults ({leaseAdults.length})</Typography>
                {isEditable && <Button
                    sx={{
                        "&:hover, &:focus, &:active": { background: theme.palette.primary.main },
                        cursor: "pointer",
                        textTransform: "none",
                        minWidth: "40px",
                        minHeight: "40px",
                        width: "40px",
                        fontWeight: theme.typography.secondary.fontWeight,
                        fontSize: theme.typography.smallFont,
                        margin: "5px",
                    }}
                    onClick={() => {
                        setCurrentRow({
                            id: adults?.length + 1, name: '', last_name: '', dob: '', email: '', phone_number: '',
                            relationship: '', tenant_drivers_license_number: "", tenant_ssn: ""
                        }); handleOpen();
                    }}>
                    <AddIcon sx={{ color: theme.typography.primary.black, fontSize: "18px" }} />
                </Button>}
            </Box>
            {leaseAdults && leaseAdults.length > 0 &&
                <DataGrid
                    rows={adults}
                    // columns={columns}
                    columns={isMobile ? columns.map(column => ({ ...column, minWidth: 150 })) : columns}
                    hideFooter={true}
                    getRowId={(row) => row.id}
                    autoHeight
                    disableSelectionOnClick
                    sx={{
                        '& .MuiDataGrid-columnHeader': {
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: "#160449",
                        },
                        '& .MuiDataGrid-columnHeaderTitle': {
                            font: "bold",
                            width: '100%',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontWeight: "bold",
                        },
                        '& .MuiDataGrid-cell': {
                            color: "#160449",
                            // fontWeight: "bold",
                        },

                    }}
                />}
            <Dialog open={open} onClose={handleClose} maxWidth="md">
                <DialogTitle
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: "#160449",
                        fontWeight: theme.typography.primary.fontWeight,
                        fontSize: theme.typography.small,
                    }}
                >
                    <span style={{ flexGrow: 1, textAlign: 'center' }}>Occupancy Details</span>
                    <Button onClick={handleClose}>
                        <Close variant="icon"/>
                    </Button>
                </DialogTitle>
                <Snackbar open={snackbarOpen} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%', height: "100%" }}>
                            <AlertTitle>{snackbarSeverity === "error" ? "Error" : "Success"}</AlertTitle>
                            {snackbarMessage}
                        </Alert>
                    </Snackbar>
                <DialogContent>
                    <Grid container columnSpacing={6}>
                        <Grid item xs={12} md={12} sx={{ marginTop: '20px' }}>
                            <Typography sx={{ fontSize: "14px", fontWeight: "bold", color: "#3D5CAC", }}>
                                Resident Name
                            </Typography>
                        </Grid>
                        <Grid item xs={6} md={6}>
                            <TextField
                                className={classes.textField}
                                margin="dense"
                                label="First Name"
                                fullWidth
                                required
                                variant="outlined"
                                InputLabelProps={{
                                    style: { color: 'black'}
                                }}
                                value={currentRow?.name || ''}
                                onChange={(e) => setCurrentRow({ ...currentRow, name: e.target.value })}
                                sx={{backgroundColor: '#D6D5DA',}}
                            />
                        </Grid>

                        <Grid item xs={6} md={6}>
                            <TextField
                                className={classes.textField}
                                margin="dense"
                                label="Last Name"
                                fullWidth
                                required
                                variant="outlined"
                                InputLabelProps={{
                                    style: { color: 'black'}
                                }}
                                value={currentRow?.last_name || ''}
                                onChange={(e) => setCurrentRow({ ...currentRow, last_name: e.target.value })}
                                sx={{backgroundColor: '#D6D5DA',}}
                            />
                        </Grid>

                        <Grid item xs={12} md={12} sx={{ marginTop: '20px' }}>
                            <Typography sx={{ fontSize: "14px", fontWeight: "bold", color: "#3D5CAC", }}>
                                Contact Info
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                className={classes.textField}
                                margin="dense"
                                label="Email"
                                fullWidth
                                required
                                variant="outlined"
                                InputLabelProps={{
                                    style: { color: 'black'}
                                }}
                                value={currentRow?.email || ''}
                                onChange={(e) => setCurrentRow({ ...currentRow, email: e.target.value })}
                                sx={{backgroundColor: '#D6D5DA',}}
                            />
                        </Grid>
                        <Grid item xs={6}>
                        <TextField
                            className={classes.textField}
                            margin="dense"
                            label="Phone Number"
                            fullWidth
                            required
                            variant="outlined"
                            InputLabelProps={{
                                style: { color: 'black'}
                            }}
                            value={currentRow?.phone_number || ''}
                            onChange={handlePhoneNumberChange} // Updated
                            sx={{backgroundColor: '#D6D5DA',}}
                        />
                        </Grid>

                        <Grid item xs={12} sx={{ marginTop: '20px' }}>
                            <Typography sx={{ fontSize: "14px", fontWeight: "bold", color: "#3D5CAC", }}>
                                Details
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                className={classes.textField}
                                margin="dense"
                                label="Drivers License"
                                fullWidth
                                variant="outlined"
                                InputLabelProps={{
                                    style: { color: 'black'}
                                }}
                                value={currentRow?.tenant_drivers_license_number || ''}
                                onChange={(e) => setCurrentRow({ ...currentRow, tenant_drivers_license_number: e.target.value })}
                                sx={{backgroundColor: '#D6D5DA',}}
                            />
                        </Grid>
                        <Grid item xs={6}>
                        <TextField
                            className={classes.textField}
                            margin="dense"
                            label="Social Security Number"
                            fullWidth
                            variant="outlined"
                            InputLabelProps={{
                                style: { color: 'black'}
                            }}
                            value={currentRow?.tenant_ssn || ''}
                            onChange={handleSSNChange} // Updated
                            sx={{backgroundColor: '#D6D5DA',}}
                        />
                        </Grid>
                        <Grid item xs={6}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Date Of Birth" // Label for the DatePicker
                            value={currentRow?.dob ? dayjs(currentRow.dob) : null}
                            onChange={(e) => {
                            const formattedDate = e ? e.format("MM-DD-YYYY") : null;
                            setCurrentRow({ ...currentRow, dob: formattedDate });
                            }}
                            sx={{
                            marginTop: "8px",
                            backgroundColor: '#D6D5DA',
                            width: isMobile ? "100%" : '450px',
                            '& .MuiInputLabel-root': {
                                color: 'black', 
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: 'black', 
                            },
                            '& .MuiInputLabel-root.MuiInputLabel-shrink': {
                                color: 'black', 
                            },
                            }}
                            fullWidth
                        />
                        </LocalizationProvider>
                        </Grid>

                        <Grid item xs={6}>
                            <FormControl margin="dense" fullWidth variant="outlined" sx={{ height: "30px" }}>
                                <InputLabel required style={{color: 'black'}}>
                                    Relationship
                                </InputLabel>
                                <Select
                                    className={classes.select}
                                    margin="dense"
                                    label="Relationship"
                                    fullWidth
                                    required
                                    variant="outlined"
                                    value={currentRow?.relationship || ''}
                                    onChange={(e) => setCurrentRow({ ...currentRow, relationship: e.target.value })}
                                    sx={{ backgroundColor: '#D6D5DA', }}
                                >
                                    {relationships && relationships.map((reln) => (
                                        <MenuItem key={reln.list_uid} value={reln.list_item}>
                                            {reln.list_item}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                {/* <DialogActions> */}
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '10px' }}>
                    <Button variant= "contained"
                        sx={{
                            marginRight: '5px', background: "#3D5CAC",
                            color: "white",
                            cursor: "pointer",
                            width: "100px",
                            height: "31px",
                            fontWeight: theme.typography.secondary.fontWeight,
                            fontSize: theme.typography.smallFont,
                            textTransform: 'none',
                        }}
                        onClick={handleSave} color="primary">
                        Save
                    </Button>
                    {isEditing && 
                    <>
                    <Button
                        sx={{
                            background: "#F87C7A",
                            color: "#160449",
                            cursor: "pointer",
                            width: "100px",
                            height: "31px",
                            fontWeight: theme.typography.secondary.fontWeight,
                            fontSize: theme.typography.smallFont,
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: '#f76462',
                            },
                        }}
                        onClick={handleDeleteClick} color="secondary">
                        Delete
                    </Button>
                    <Dialog
                        open={openDeleteConfirmation}
                        onClose={handleDeleteClose}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                Are you sure you want to delete this Occupant?
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleDeleteClose} color="primary" sx={{
                                textTransform: "none", background: "#F87C7A",
                                color: "#160449",
                                cursor: "pointer", fontWeight: theme.typography.secondary.fontWeight,
                                fontSize: theme.typography.smallFont, '&:hover': {
                                    backgroundColor: '#f76462',
                                },
                            }}>
                                Cancel
                            </Button>
                            <Button onClick={handleDeleteConfirm} color="primary" autoFocus sx={{
                                textTransform: "none", background: "#FFC614",
                                color: "#160449",
                                cursor: "pointer", fontWeight: theme.typography.secondary.fontWeight,
                                fontSize: theme.typography.smallFont,
                                '&:hover': {
                                    backgroundColor: '#fabd00',
                                },
                            }}>
                                Confirm
                            </Button>
                        </DialogActions>
                    </Dialog>
                    </>}
                </Box>
                {/* </DialogActions> */}
            </Dialog>
        </Box>
    );
};

export default AdultOccupant;
