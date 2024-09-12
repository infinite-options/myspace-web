import React, { useState, useEffect, useContext } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Button,
  Modal,
  TextField,
  Grid,
  Alert,
  Snackbar,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import { DataGrid } from "@mui/x-data-grid";
import theme from "../../theme/theme";
import DescriptionIcon from "@mui/icons-material/Description";
import { makeStyles } from "@material-ui/core/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from '@mui/icons-material/Delete';
import LeaseIcon from "../Property/leaseIcon.png";
import { Close } from "@mui/icons-material";

import ManagementContractContext from "../../contexts/ManagementContractContext";
import axios from 'axios';
import FilePreviewDialog from "./FilePreviewDialog";

import ListsContext from "../../contexts/ListsContext";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiOutlinedInput-input": {
      border: 0,
      borderRadius: 3,
      color: "#3D5CAC",
      fontSize: 50,
    },
  },
}));

const Documents = ({ documents, setDocuments, setDeleteDocsUrl, setIsPreviousFileChange, isAccord=false, contractFiles=[], setContractFiles, contractFileTypes=[], setContractFileTypes, isEditable=true, customName }) => {

  const { getList, } = useContext(ListsContext);	

  const [open, setOpen] = useState(false);
  const [currentRow, setcurrentRow] = useState(null);
  const color = theme.palette.form.main;
  const [isEditing, setIsEditing] = useState(false);
  const [uploadedFiles, setuploadedFiles] = useState([]);
  const [newFiles, setNewFiles] = useState(null);
  const classes = useStyles();
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isUpdated, setIsUpdated] = useState(false);
  const [contentTypes, setContentTypes] = useState([]);
  const [ expanded, setExpanded ] = useState(true);
  // const [preview, setPreview] = useState(null)
  const [selectedPreviewFile, setSelectedPreviewFile] = useState(null)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false) 

  // useEffect(() => {
  //   console.log("inside documents mod", modifiedData);
  //   if (modifiedData && modifiedData?.length > 0) {
  //     // editOrUpdateLease();
  //     handleClose();
  //     setIsUpdated(false);
  //     setuploadedFiles([]);
  //   }
  // }, [isUpdated]);

  // Fetch contentTypes from endpoint
  useEffect(() =>{
    fetchContentTypes();
  }, []);

  const fetchContentTypes = async()=>{    
    const contentTypesList = getList("content");    
    setContentTypes(contentTypesList);
    
  }

  // Handle close 'X' or 'cancle' button
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setFilePreview(null);
    setOpen(false);
  };


  const checkRequiredFields = () => {
    let retVal = true;
    // console.log("name", currentRow.filename, currentRow.name);
    // console.log("type", currentRow.contentType);

    if (!currentRow.filename && !currentRow.name) {
      console.error("Filename is either empty, null, or undefined.");
      return false;
    }

    if (!currentRow.contentType) {
      console.error("Type is either empty, null, or undefined.");
      return false;
    }

    //update setDocuments
    if (isEditing === true) {
      // console.log("current row is", currentRow);
      
      // remove id of currentRow before adding to it
      // const docswithoutid = currentRow.map(({ id, ...rest }) => rest);
      const { id, ...docswithoutid} = currentRow;
      setDocuments((prevFiles)=>{
        return prevFiles.map((file) => file.link === docswithoutid.link? docswithoutid : file);
      });

      if(setIsPreviousFileChange){
        setIsPreviousFileChange(true)
      }
      handleClose();

    } else {
      // console.log("---dhyey--- arr", uploadedFiles);
      // const updatedDocsWithoutId = documents.map(({ id, ...rest }) => rest);

      // setModifiedData((prev) => [...prev, { key: dataKey, value: updatedDocsWithoutId }]);
      // setModifiedData((prev) => [...prev, { key: "uploadedFiles", value: uploadedFiles }]);
      // setIsUpdated(true);

      uploadedFiles?.map((file, i) => {
        setContractFiles((prevFiles) => [...prevFiles, file.file])
        setContractFileTypes((prevFiles) => [...prevFiles, file.contentType])
      })
      
      
      handleClose();
      setuploadedFiles([]);

    }
    return retVal;
  };

  const handleFileUpload = (e) => {
    // console.log("uploaded file", e.target.files);
    // console.log("documents", documents);
    if (isEditing === true) {
      const curr = { ...currentRow, filename: e.target.files[0].name };
      setcurrentRow(curr);
    } else {
      const curr = { ...currentRow, filename: e.target.files[0].name, id: documents?.length };
      // console.log("curr", curr);
      setcurrentRow(curr);
    }

    const filesArray = Array.from(e.target.files).map((file) => ({
      name: file.name,
      contentType: currentRow.contentType,
      file: file,
    }));
    // console.log("--dhyey--- filesArray", filesArray);
    setNewFiles(filesArray);
    setuploadedFiles(filesArray);
    // Create a URL for the file preview
    const file = e.target.files[0];
    setFilePreview(URL.createObjectURL(file));
  };

  const showSnackbar = (message, severity) => {
    console.log("Inside show snackbar");
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSubmit = () => {
    const isValid = checkRequiredFields();
    if (isValid === true) {
      console.log("success occured");
    } else {
      console.log("error occured");
      showSnackbar("Kindly enter all the required fields", "error");
      setSnackbarOpen(true);
    }
  };

  const handleEditClick = (row) => {
    console.log("on edit", row);
    setFilePreview(row.link);
    setcurrentRow(row);
    setIsEditing(true);
    handleOpen();
  };

  const handleDelete = async () => {
    setDeleteDocsUrl(prevList => [...prevList, currentRow.link])
    setDocuments((prevFiles) => {
        // console.log("deleted - ", currentRow.link);
        return prevFiles.filter((f)=> f.link !== currentRow.link);
    });
      // console.log("currentRow.id", currentRow.id);
      // const updatedDocuments = documents.filter((doc) => doc.id !== currentRow.id);
      // const updatedDocsWithoutId = updatedDocuments.map(({ id, ...rest }) => rest);
      // setModifiedData((prev) => [...prev, { key: dataKey, value: updatedDocsWithoutId }]);
      // setModifiedData((prev) => [...prev, { key: "delete_documents", value: [currentRow.link] }]);
      // setIsUpdated(true);
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
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleRemoveFile = (index) => {

    setContractFiles((prevFiles) => {
      const filesArray = Array.from(prevFiles);
      filesArray.splice(index, 1);
      return filesArray;
    });
    setContractFileTypes((prevTypes) => {
      const typesArray = [...prevTypes];
      typesArray.splice(index, 1);
      return typesArray;
    });
  };

  const docsColumns = isEditable?[
    {
      field: "filename",
      headerName: "Filename",
      renderCell:(params)=>{
        return (<Box
          				sx={{
          					cursor: 'pointer', // Change cursor to indicate clickability
          					color: '#3D5CAC',
          				}}
                  onClick={() => handleFileClick(params.row)}
          			>
          				{params.row.filename}
          			</Box>
              );
      },
      flex: 2,
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
    },
    {
      field: "contentType",
      headerName: "Content Type",
      flex: 1,
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
    },
    {
      field: "fileType",
      headerName: "File Type",
      flex: 1,
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
    },
    {
      field: "editactions",
      headerName: "",
      flex: 0.5,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleEditClick(params.row)}>
            <EditIcon sx={{ fontSize: '19px', color: '#3D5CAC'}} />
          </IconButton>
        </Box>
      ),
    },
    {
      field: "deleteactions",
      headerName: "",
      flex: 0.5,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => {
              setcurrentRow({...params.row})
              handleDeleteClick()
          }}>
            <DeleteIcon sx={{ fontSize: '19px', color: '#3D5CAC'}} />
          </IconButton>
        </Box>
      ),
    },
  ]:[
    {
      field: "filename",
      headerName: "Filename",
      renderCell:(params)=>{
        return (<Box
          				sx={{
          					cursor: 'pointer', // Change cursor to indicate clickability
          					color: '#3D5CAC',
          				}}
                  onClick={() => handleFileClick(params.row)}
          			>
          				{params.row.filename}
          			</Box>
              );
      },
      flex: 2,
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
    },
    {
      field: "contentType",
      headerName: "Content Type",
      flex: 1,
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
    },
    {
      field: "fileType",
      headerName: "File Type",
      flex: 1,
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
    },
  ];

  const uploadDocsColumns = isEditable? [
    {
      field: "name",
      headerName: "Filename",
      flex: 2,
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
    },
    {
      field: "contentType",
      headerName: "Content Type",
      flex: 2,
      renderCell: (params) => (
        <Select
          value={contractFileTypes[params.row.id]? contractFileTypes[params.row.id] : ""}
          label="Document Type"
          onChange={(e) => {
            const updatedTypes = [...contractFileTypes];
            updatedTypes[params.row.id] = e.target.value;
            setContractFileTypes(updatedTypes);
          }}
          required
          sx={{
            backgroundColor: '#D6D5DA',
            height: '40px',
            width: '90%', // Adjust the width as needed
            padding: '8px', // Adjust the padding as needed
          }}
        >
          {contentTypes.map((item, index) => {
            if (item.list_item != null) {
                return (
                  <MenuItem key={index} value={item.list_item}>
                      {item.list_item}
                  </MenuItem>
                );
            }
            return null;
          })}
        </Select>
      ),
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
    },
    {
      field: "deleteactions",
      headerName: "",
      flex: 0.5,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => {
              handleRemoveFile(params.row.id)
          }}>
            <DeleteIcon sx={{ fontSize: '19px', color: '#3D5CAC'}} />
          </IconButton>
        </Box>
      ),
    },

  ]:[
    {
      field: "name",
      headerName: "Filename",
      flex: 2,
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
    },
    {
      field: "contentType",
      headerName: "Content Type",
      flex: 2,
      renderCell: (params) => (
        <Typography>{contractFileTypes[params.row.id]}</Typography>
      ),
      renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
    }
  ];

  let rowsWithId = []
  let uploadRowsWithId = []

  if(documents && documents?.length !== 0){
    rowsWithId = documents.map((row, index) => ({
      ...row,
      id: row.id ? index : index,
    }));
  }

  if(contractFiles && contractFiles?.length !== 0){
    uploadRowsWithId = contractFiles.map((row, index) => ({
      name: row.name,
      fileType: row.type,
      id: row.id ? index : index,
    }));

    // setUploadRowsWithId(temp);
  }
 



  // const handleFileClick = (file)=>{
  //   setPreview(file);
  // }

  // const handlePreviewClose = () => {
  //   setPreview(null);
  // }

  const handleFileClick = (file)=>{
    setSelectedPreviewFile(file)
    setPreviewDialogOpen(true)
  }

  const handlePreviewDialogClose = () => {
    setPreviewDialogOpen(false)
    setSelectedPreviewFile(null)
  }


  if(isAccord){
    return (
      <>
        <Accordion sx={{ backgroundColor: '#F0F0F0', boxShadow: "none" }} expanded={expanded} onChange={() => setExpanded(prevState => !prevState)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="documents-content" id="documents-header">
            <Grid container justifyContent='ceneter'>
  
                {/* Document Text */}
                <Grid item md={11.2}>
                  <Typography
                    sx={{
                      color: "#160449",
                      fontWeight: theme.typography.primary.fontWeight,
                      fontSize: "24px",
                      textAlign: "center",
                      paddingBottom: "10px",
                      paddingTop: "5px",
                      flexGrow: 1,
                      paddingLeft: "50px",
                    }}
                    // paddingTop='5px'
                    // paddingBottom='10px'
                  >
                    Documents
                  </Typography>
                </Grid>
  
                {/* Add Icon button */}
                <Grid item md={0.5}>
                  {/* Add Icon */}
                  <Button
                    sx={{
                      "&:hover, &:focus, &:active": { background: theme.palette.primary.main },
                      cursor: "pointer",
                      textTransform: "none",
                      minWidth: "40px",
                      minHeight: "40px",
                      width: "40px",
                      marginTop:'5px',
                      fontWeight: theme.typography.secondary.fontWeight,
                      fontSize: theme.typography.smallFont,
                    }}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setcurrentRow({
                        filename: "",
                        type: "",
                        link: "",
                      });
                      setIsEditing(false);
                      handleOpen();
                    }}
                  >
                    <AddIcon sx={{ color: theme.typography.primary.black, fontSize: "24px" }} />
                  </Button>
                </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            {/*  */}
            {documents && documents.length ? (
              // <Box
              //   sx={{
              //     display: 'flex',
              //     flexDirection: 'row',
              //     justifyContent: 'space-between',
              //     alignItems: 'center',
              //     marginBottom: '7px',
              //     width: '100%',
              //   }}
              // >
              //   <Box
              //     sx={{
              //       fontSize: '15px',
              //       fontWeight: 'bold',
              //       paddingTop: '10px',
              //       paddingLeft: '5px',
              //       color: '#3D5CAC',
              //       width: '100%',
              //     }}
              //   >
              //     {/* Previously Uploaded Documents: */}
              //     <Box
              //       sx={{
              //         display: 'flex',
              //         flexDirection: 'row',
              //         alignItems: 'center',
              //         justifyContent: 'space-between',
              //         paddingTop: '5px',
              //         marginY:"7px",
              //         color: 'black',
              //       }}
              //     >
              //       <Box sx={{width:"30%"}}>Filename</Box>
              //       <Box sx={{width:"20%"}}>Content Type</Box>
              //       <Box sx={{width:"20%"}}>File Type</Box>
              //       <Box sx={{width:"15%"}}></Box>
              //     </Box>
              //     {[...documents].map((doc, i) => (
              //       <>
              //       {/* {console.log("details of doc-", doc)} */}
              //         <Box
              //           key={i}
              //           sx={{
              //             display: 'flex',
              //             flexDirection: 'row',
              //             alignItems: 'center',
              //             justifyContent: 'space-between',
              //           }}
              //         >
              //           <Box sx={{width:"30%"}}>
              //             {/* <a href={doc.link} target="_blank" rel="noopener noreferrer"> */}
              //               <Box
              //                 sx={{
              //                   // height: '40px',
              //                   width: '100%',
              //                   cursor: 'pointer', // Change cursor to indicate clickability
              //                   color: '#3D5CAC',
              //                 }}
              //                 onClick={()=>{handleFileClick(doc)}}
              //               >
              //                 {doc.filename}
              //               </Box>
              //             {/* </a> */}
              //           </Box>
              //           <Box sx={{width:"20%"}}>{doc.contentType ? doc.contentType : ""}</Box>
              //           <Box sx={{width:"20%"}}>{doc.fileType}</Box>
              //           <Box sx={{width:"15%", display: 'flex', justifyContent: 'center'}}>
              //             {/* Edit icon */}
              //             <Button
              //                 variant="text"
              //                 onClick={(event) => {
              //                   // setcurrentRow({...doc})
              //                   handleEditClick({...doc})
              //                   // handleDeletePrevUploadedFile(doc.link, i);
              //                 }}
              //                 sx={{
              //                   // width: '120px',
              //                   cursor: 'pointer',
              //                   fontSize: '14px',
              //                   fontWeight: 'bold',
              //                   color: '#3D5CAC',
              //                   '&:hover': {
              //                     backgroundColor: 'transparent', // Set to the same color as the default state
              //                   },
              //                 }}
              //               >
              //                 <EditIcon sx={{ fontSize: '19px', color: '#3D5CAC'}} />
              //             </Button>
  
              //             {/* Delete icon */}
              //             <Button
              //               variant="text"
              //               onClick={(event) => {
              //                 setcurrentRow({...doc})
              //                 handleDeleteClick()
              //                 // handleDeletePrevUploadedFile(doc.link, i);
              //               }}
              //               sx={{
              //                 // width: '120px',
              //                 cursor: 'pointer',
              //                 fontSize: '14px',
              //                 fontWeight: 'bold',
              //                 color: '#3D5CAC',
              //                 '&:hover': {
              //                   backgroundColor: 'transparent', // Set to the same color as the default state
              //                 },
              //               }}
              //             >
              //               <DeleteIcon sx={{ fontSize: 19, color: '#3D5CAC' }} />
              //             </Button>
              //           </Box>
              //         </Box>
              //       </>
              //     ))}
              //   </Box>
              // </Box>
              <DataGrid
                rows={rowsWithId}
                columns={docsColumns}
                hideFooter={true}
                autoHeight
                rowHeight={50}
                sx={{
                  marginTop:"10px"
                }}
              />
            ) : (
              <></>
            )}

            {/* contract files section */}
            {contractFiles && contractFiles?.length? (
              <Box
                sx={{
                  fontSize: '15px',
                  fontWeight: 'bold',
                  padding: '5px',
                  color: '#3D5CAC',
                  width: '100%',
                }}
              >
                <Typography
                    sx={{
                      color: "#160449",
                      fontWeight: theme.typography.primary.fontWeight,
                      fontSize: "18px",
                      paddingBottom: "5px",
                      paddingTop: "5px",
                      marginTop:"10px"
                    }}
                  >
                    Uploading Documents:
                </Typography>
              </Box>
            ):(
              <></>
            )}

            {contractFiles?.length ? (
              <DataGrid
              rows={uploadRowsWithId}
              columns={uploadDocsColumns}
              sx={{
                // minHeight:"100px",
                // height:"100px",
                // maxHeight:"100%",
                marginTop: "10px",
              }}
              autoHeight
              rowHeight={50} 
              hideFooter={true}
            />
            ) : (
              <></>
            )}
          </AccordionDetails>
        </Accordion>
  
        <Modal open={open} onClose={handleClose} aria-labelledby="add-document-modal" aria-describedby="add-document-description">
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 841,
              height: 500,
              bgcolor: "background.paper",
              border: "2px solid #000",
              boxShadow: 24,
              p: 4,
            }}
          >
            {/* Close button */}
            <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
              <Typography
                id="add-document-modal"
                variant="h6"
                component="h2"
                textAlign="center"
                sx={{
                  color: "#160449",
                  fontWeight: theme.typography.primary.fontWeight,
                  fontSize: theme.typography.small,
                  flexGrow: 1,
                  textAlign: "center",
                }}
              >
                Documents
              </Typography>
              <Button onClick={handleClose} 
                sx={{ ml: "auto", 
                    "&:hover": {
                      '& svg': {
                        color: '#ffffff',
                      },
                    }, 
              }}>
                <Close
                  sx={{
                    color: theme.typography.primary.black,
                    fontSize: "20px",
                  }}
                />
              </Button>
            </Box>
            
            <Snackbar open={snackbarOpen} onClose={handleSnackbarClose} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
              <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%", height: "100%" }}>
                {snackbarMessage}
              </Alert>
            </Snackbar>
  
            {/* Container with all fields */}
            <Grid container columnSpacing={8}>
              <Grid item md={1} />
              <Grid item md={5}>
                <Typography sx={{ fontSize: "14px", fontWeight: "bold", color: "#3D5CAC", marginTop: "10px" }}>
                  {"Document Name  "}
                  <span style={{ color: "red" }}>*</span>
                </Typography>
  
                <TextField
                  sx={{ marginTop: "5px" }}
                  name="file_name"
                  label="File Name"
                  fullWidth
                  margin="normal"
                  value={currentRow && (currentRow.filename || currentRow.name)}
                  disabled={true}
                  InputProps={{
                    style: {
                      height: "40px",
                    },
                  }}
                  InputLabelProps={{
                    shrink: true,
                    style: {
                      fontSize: "10px",
                      textAlign: "center",
                    },
                  }}
                />

                {/* document type */}
                <Typography sx={{ fontSize: "14px", fontWeight: "bold", color: "#3D5CAC", marginTop: "10px" }}>
                  {"Document Type  "}
                  <span style={{ color: "red" }}>*</span>
                </Typography>
                
                {/* Document type select options */}
                <FormControl fullWidth sx={{ marginTop: "10px" }}>
                  {/* <InputLabel sx={{ color: theme.palette.grey }}>Type</InputLabel> */}
                  <Select
                    value={(currentRow && currentRow?.contentType) || ""}
                    onChange={(e) => {
                      setcurrentRow({ ...currentRow, contentType: e.target.value });
                      if (newFiles) {
                        //update document type
                        let newArr = [...newFiles];
                      //   newArr[0].type = currentRow.type;
                        newArr[0].contentType = e.target.value;
                        setNewFiles(newArr);
                      //   setuploadedFiles((prevFiles) => [...prevFiles, ...newArr]);
                        setuploadedFiles(() => [...newArr]); 
                      }
                    }}
                    size="small"
                    fullWidth
                    className={classes.select}
                    required
                  >
                    {contentTypes.map((item, index) => {
                      if (item.list_item != null) {
                          return (
                            <MenuItem key={index} value={item.list_item}>
                                {item.list_item}
                            </MenuItem>
                          );
                      }
                      return null;
                    })}
                    {/* <MenuItem value="Lease Agreement">Lease Agreement</MenuItem>
                    <MenuItem value="Other">Other</MenuItem> */}
                  </Select>
                </FormControl>
                
                {/* Select file button */}
                {!isEditing && <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: "20px" }}>
                  <Button
                    variant="contained"
                    color="primary"
                    component="label"
                    sx={{
                      marginRight: "5px",
                      background:'#3D5CAC',
                      cursor: "pointer",
                      width: "130px",
                      height: "31px",
                      color:'#ffffff',
                      fontWeight: theme.typography.secondary.fontWeight,
                      fontSize: theme.typography.smallFont,
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "#3D5CAC",
                      },
                    }}
                  >
                    <DescriptionIcon sx={{ fontSize: 19, color: "#ffffff", paddingBottom: "2px", paddingRight:"2px"}} /> Select File
                    <input id="file-upload" type="file" accept=".doc,.docx,.txt,.pdf" hidden onChange={(e) => handleFileUpload(e)} />
                  </Button>
                </Box>}
              </Grid>
              {/* <Grid item md={0.5} /> */}
  
              {/* PDF Preview */}
              <Grid item md={5}>
                <Box sx={{ marginTop: "10px", backgroundColor: "#D9D9D9" }}>
                  <iframe src={filePreview} width="100%" height="322px" title="File Preview" />
                </Box>
              </Grid>
            </Grid>
  
            {/* Save button */}
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "40px" }}>
              <Button
                onClick={handleSubmit}
                sx={{
                  background: "#3D5CAC",
                  color: "#ffffff",
                  marginRight: "30px",
                  cursor: "pointer",
                  width: "100px",
                  height: "31px",
                  fontWeight: theme.typography.secondary.fontWeight,
                  fontSize: theme.typography.smallFont,
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#3D5CAC",
                  },
                }}
              >
                Save
              </Button>
              {/* {isEditing && (
                <>
                  <Button
                    onClick={handleDeleteClick}
                    sx={{
                      background: "#F87C7A",
                      color: "#160449",
                      cursor: "pointer",
                      width: "100px",
                      height: "31px",
                      fontWeight: theme.typography.secondary.fontWeight,
                      fontSize: theme.typography.smallFont,
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "#f76462",
                      },
                    }}
                  >
                    Delete
                  </Button>
                  
                </>
              )} */}
            </Box>
          </Box>
        </Modal>
  
        <Dialog open={openDeleteConfirmation} onClose={handleDeleteClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                    <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
                    <DialogContent>
                      <DialogContentText id="alert-dialog-description">Are you sure you want to delete this Document?</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                      <Button
                        onClick={handleDeleteClose}
                        color="primary"
                        sx={{
                          textTransform: "none",
                          background: "#F87C7A",
                          color: "#160449",
                          cursor: "pointer",
                          fontWeight: theme.typography.secondary.fontWeight,
                          fontSize: theme.typography.smallFont,
                          "&:hover": {
                            backgroundColor: "#f76462",
                          },
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleDeleteConfirm}
                        color="primary"
                        autoFocus
                        sx={{
                          textTransform: "none",
                          background: "#FFC614",
                          color: "#160449",
                          cursor: "pointer",
                          fontWeight: theme.typography.secondary.fontWeight,
                          fontSize: theme.typography.smallFont,
                          "&:hover": {
                            backgroundColor: "#fabd00",
                          },
                        }}
                      >
                        Confirm
                      </Button>
                    </DialogActions>
        </Dialog>

        {/* {preview && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '500px',
            height: '100vh',
            backgroundColor: '#f0f0f0',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            zIndex: 10,
            padding: '20px',
            overflowY: 'hidden',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <Typography variant="h6">{preview.filename}</Typography>
            <Button onClick={handlePreviewClose}>
              <Close sx={{
                    color: theme.typography.primary.black,
                    fontSize: "20px",
                  }}/>
            </Button>
          </Box>
          <iframe src={preview.link} width="100%" height="84%" title="File Preview"/>
        </Box>
        )} */}

        {previewDialogOpen && selectedPreviewFile && <FilePreviewDialog file={selectedPreviewFile} onClose={handlePreviewDialogClose}/>}
      </>
    );
  }else{
    return(
      <>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            fontSize: '15px',
            fontWeight: 'bold',
            color: '#3D5CAC',
          }}
        >
          <Typography
            sx={{
              color: "#160449",
              fontWeight: theme.typography.primary.fontWeight,
              fontSize: "18px",
              paddingBottom: "5px",
              paddingTop: "5px",
              marginTop:"10px"
            }}
          >
            {customName ? customName : "Documents: "}
          </Typography>
          {isEditable && <Box
						sx={{
							display: 'flex',
							flexDirection: 'row',
							fontSize: '18px',
							fontWeight: 'bold',
							paddingTop: '5px',
              marginTop:"10px",
							color: '#3D5CAC',
						}}
					>
						<label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
              <AddIcon sx={{ fontSize: 20, color: '#3D5CAC' }} />
						</label>
						<input
							id="file-upload"
							type="file"
							accept=".doc,.docx,.txt,.pdf"
							hidden
							// onChange={(e) => setContractFiles(e.target.files)}
							onChange={(e) => setContractFiles((prevFiles) => [...prevFiles, ...e.target.files])}
							multiple
						/>
					</Box>}
        </Box>

        {documents && documents.length ? (
				// <Box
				// 	sx={{
				// 		display: 'flex',
				// 		flexDirection: 'row',
				// 		justifyContent: 'space-between',
				// 		alignItems: 'center',
				// 		marginBottom: '7px',
				// 		width: '100%',
				// 	}}
				// >
				// 	<Box
				// 		sx={{
				// 			fontSize: '15px',
				// 			fontWeight: 'bold',
				// 			paddingTop: '10px',
				// 			paddingLeft: '5px',
				// 			color: '#3D5CAC',
				// 			width: '100%',
				// 		}}
				// 	>
				// 		{/* {customName ? customName : "Previously Uploaded Documents:"}  */}
				// 		<Box
				// 			sx={{
				// 				display: 'flex',
				// 				flexDirection: 'row',
				// 				alignItems: 'center',
				// 				justifyContent: 'space-between',
				// 				paddingTop: '5px',
				// 				marginY:"7px",
				// 				color: 'black',
				// 			}}
				// 		>
				// 			<Box sx={{width:"30%"}}>Filename</Box>
				// 			<Box sx={{width:"20%"}}>Content Type</Box>
				// 			<Box sx={{width:"20%"}}>File Type</Box>
				// 			{isEditable && <Box sx={{width:"15%"}}></Box>}
				// 		</Box>
				// 		{[...documents].map((doc, i) => (
				// 			<React.Fragment key={i}>
				// 			{/* {console.log("details of doc-", doc)} */}
				// 				<Box
				// 					// key={i}
				// 					sx={{
				// 						display: 'flex',
				// 						flexDirection: 'row',
				// 						alignItems: 'center',
				// 						justifyContent: 'space-between',
				// 					}}
				// 				>
				// 					<Box sx={{width:"30%"}}>
				// 						{/* <a href={doc.link} target="_blank" rel="noopener noreferrer"> */}
				// 							<Box
				// 								sx={{
				// 									// height: '40px',
				// 									width: '100%',
				// 									cursor: 'pointer', // Change cursor to indicate clickability
				// 									color: '#3D5CAC',
				// 								}}
        //                 onClick={() => handleFileClick(doc)}
				// 							>
				// 								{doc.filename}
				// 							</Box>
				// 						{/* </a> */}
				// 					</Box>
				// 					<Box sx={{width:"20%"}}>{doc.contentType ? doc.contentType : ""}</Box>
				// 					<Box sx={{width:"20%"}}>{doc.fileType}</Box>
				// 					{/* <Box sx={{width:"10%", display: 'flex', justifyContent: 'center' }}>
				// 						<Button
				// 								variant="text"
				// 								onClick={(event) => {
				// 									// handleDeletePrevUploadedFile(doc.link, i);
				// 								}}
				// 								sx={{
				// 									// width: '120px',
				// 									cursor: 'pointer',
				// 									fontSize: '14px',
				// 									fontWeight: 'bold',
				// 									color: '#3D5CAC',
				// 									'&:hover': {
				// 										backgroundColor: 'transparent', // Set to the same color as the default state
				// 									},
				// 								}}
				// 							>
												
				// 						</Button>
				// 					</Box> */}
				// 					{isEditable && <Box sx={{width:"15%", display: 'flex', justifyContent: 'center'}}>
				// 						{/* Edit icon */}
				// 						<Button
				// 								variant="text"
				// 								onClick={(event) => {
        //                   handleEditClick({...doc});
				// 									// handleDeleteClick(i);
				// 								}}
				// 								sx={{
				// 									// width: '120px',
				// 									cursor: 'pointer',
				// 									fontSize: '14px',
				// 									fontWeight: 'bold',
				// 									color: '#3D5CAC',
				// 									'&:hover': {
				// 										backgroundColor: 'transparent', // Set to the same color as the default state
				// 									},
				// 								}}
				// 							>
				// 								<EditIcon sx={{ fontSize: '19px', color: '#3D5CAC'}} />
				// 						</Button>

				// 						{/* Delete icon */}
				// 						<Button
				// 							variant="text"
				// 							onClick={(event) => {
				// 								// handleDeletePrevUploadedFile(doc.link, i);
        //                 setcurrentRow({...doc})
        //                 handleDeleteClick()
				// 							}}
				// 							sx={{
				// 								// width: '120px',
				// 								cursor: 'pointer',
				// 								fontSize: '14px',
				// 								fontWeight: 'bold',
				// 								color: '#3D5CAC',
				// 								'&:hover': {
				// 									backgroundColor: 'transparent', // Set to the same color as the default state
				// 								},
				// 							}}
				// 						>
				// 							<DeleteIcon sx={{ fontSize: 19, color: '#3D5CAC' }} />
				// 						</Button>
				// 					</Box>}
				// 				</Box>
				// 			</React.Fragment>
				// 		))}
				// 	</Box>
				// </Box>

          <DataGrid
            rows={rowsWithId}
            columns={docsColumns}
            sx={{
              // minHeight:"100px",
              // height:"100px",
              // maxHeight:"100%",
              marginTop: "10px",
            }}
            autoHeight
            rowHeight={50} 
            hideFooter={true}
          />
        ) : (
          <>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '7px',
                width: '100%',
                height:"100px"
              }}
            >
              <Typography
                sx={{
                  color: "#A9A9A9",
                  fontWeight: theme.typography.primary.fontWeight,
                  fontSize: "15px",
                }}
              >
                No Documents
              </Typography>
            </Box>
          </>
        )}

        {/* contract files section */}
        {contractFiles && contractFiles?.length? (
          <Box
            sx={{
              fontSize: '15px',
              fontWeight: 'bold',
              padding: '5px',
              color: '#3D5CAC',
              width: '100%',
            }}
          >
            <Typography
                sx={{
                  color: "#160449",
                  fontWeight: theme.typography.primary.fontWeight,
                  fontSize: "18px",
                  paddingBottom: "5px",
                  paddingTop: "5px",
                  marginTop:"10px"
                }}
              >
                Uploading Documents:
            </Typography>
          </Box>
        ):(
          <></>
        )}

        {contractFiles?.length ? (
          <DataGrid
          rows={uploadRowsWithId}
          columns={uploadDocsColumns}
          sx={{
            // minHeight:"100px",
            // height:"100px",
            // maxHeight:"100%",
            marginTop: "10px",
          }}
          autoHeight
          rowHeight={50} 
          hideFooter={true}
        />
        ) : (
          <></>
        )}

        <Modal open={open} onClose={handleClose} aria-labelledby="add-document-modal" aria-describedby="add-document-description">
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 841,
              height: 500,
              bgcolor: "background.paper",
              border: "2px solid #000",
              boxShadow: 24,
              p: 4,
            }}
          >
            {/* Close button */}
            <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
              <Typography
                id="add-document-modal"
                variant="h6"
                component="h2"
                textAlign="center"
                sx={{
                  color: "#160449",
                  fontWeight: theme.typography.primary.fontWeight,
                  fontSize: theme.typography.small,
                  flexGrow: 1,
                  textAlign: "center",
                }}
              >
                Documents
              </Typography>
              <Button onClick={handleClose} 
                sx={{ ml: "auto", 
                    "&:hover": {
                      '& svg': {
                        color: '#ffffff',
                      },
                    }, 
              }}>
                <Close
                  sx={{
                    color: theme.typography.primary.black,
                    fontSize: "20px",
                  }}
                />
              </Button>
            </Box>
            
            <Snackbar open={snackbarOpen} onClose={handleSnackbarClose} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
              <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%", height: "100%" }}>
                {snackbarMessage}
              </Alert>
            </Snackbar>
  
            {/* Container with all fields */}
            <Grid container columnSpacing={8}>
              <Grid item md={1} />
              <Grid item md={5}>
                <Typography sx={{ fontSize: "14px", fontWeight: "bold", color: "#3D5CAC", marginTop: "10px" }}>
                  {"Document Name  "}
                  <span style={{ color: "red" }}>*</span>
                </Typography>
  
                {/* document type */}
                <TextField
                  sx={{ marginTop: "5px" }}
                  name="file_name"
                  label="File Name"
                  fullWidth
                  margin="normal"
                  value={currentRow && (currentRow.filename || currentRow.name)}
                  disabled={true}
                  InputProps={{
                    style: {
                      height: "40px",
                    },
                  }}
                  InputLabelProps={{
                    shrink: true,
                    style: {
                      fontSize: "10px",
                      textAlign: "center",
                    },
                  }}
                />
                <Typography sx={{ fontSize: "14px", fontWeight: "bold", color: "#3D5CAC", marginTop: "10px" }}>
                  {"Document Type  "}
                  <span style={{ color: "red" }}>*</span>
                </Typography>
                
                {/* Document type select options */}
                <FormControl fullWidth sx={{ marginTop: "10px" }}>
                  {/* <InputLabel sx={{ color: theme.palette.grey }}>Type</InputLabel> */}
                  <Select
                    value={(currentRow && currentRow?.contentType) || ""}
                    onChange={(e) => {
                      setcurrentRow({ ...currentRow, contentType: e.target.value });

                      // if new file uplopad then
                      if (newFiles) {
                        //update document type
                        let newArr = [...newFiles];
                      //   newArr[0].type = currentRow.type;
                        newArr[0].contentType = e.target.value;
                        setNewFiles(newArr);
                      //   setuploadedFiles((prevFiles) => [...prevFiles, ...newArr]);
                        setuploadedFiles(() => [...newArr]); 
                      }
                    }}
                    size="small"
                    fullWidth
                    className={classes.select}
                    required
                  >
                    {contentTypes.map((item, index) => {
                      if (item.list_item != null) {
                          return (
                            <MenuItem key={index} value={item.list_item}>
                                {item.list_item}
                            </MenuItem>
                          );
                      }
                      return null;
                    })}
                    {/* <MenuItem value="Lease Agreement">Lease Agreement</MenuItem>
                    <MenuItem value="Other">Other</MenuItem> */}
                  </Select>
                </FormControl>
                
                {/* Select file button */}
                {!isEditing && <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: "20px" }}>
                  <Button
                    variant="contained"
                    color="primary"
                    component="label"
                    sx={{
                      marginRight: "5px",
                      background:'#3D5CAC',
                      cursor: "pointer",
                      width: "130px",
                      height: "31px",
                      color:'#ffffff',
                      fontWeight: theme.typography.secondary.fontWeight,
                      fontSize: theme.typography.smallFont,
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "#3D5CAC",
                      },
                    }}
                  >
                    <DescriptionIcon sx={{ fontSize: 19, color: "#ffffff", paddingBottom: "2px", paddingRight:"2px"}} /> Select File
                    <input id="file-upload" type="file" accept=".doc,.docx,.txt,.pdf" hidden onChange={(e) => handleFileUpload(e)} />
                  </Button>
                </Box>}
              </Grid>
              {/* <Grid item md={0.5} /> */}
  
              {/* PDF Preview */}
              <Grid item md={5}>
                <Box sx={{ marginTop: "10px", backgroundColor: "#D9D9D9" }}>
                  <iframe src={filePreview} width="100%" height="322px" title="File Preview" />
                </Box>
              </Grid>
            </Grid>
  
            {/* Save button */}
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "40px" }}>
              <Button
                onClick={handleSubmit}
                sx={{
                  background: "#3D5CAC",
                  color: "#ffffff",
                  marginRight: "30px",
                  cursor: "pointer",
                  width: "100px",
                  height: "31px",
                  fontWeight: theme.typography.secondary.fontWeight,
                  fontSize: theme.typography.smallFont,
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#3D5CAC",
                  },
                }}
              >
                Save
              </Button>
              {/* {isEditing && (
                <>
                  <Button
                    onClick={handleDeleteClick}
                    sx={{
                      background: "#F87C7A",
                      color: "#160449",
                      cursor: "pointer",
                      width: "100px",
                      height: "31px",
                      fontWeight: theme.typography.secondary.fontWeight,
                      fontSize: theme.typography.smallFont,
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "#f76462",
                      },
                    }}
                  >
                    Delete
                  </Button>
                  
                </>
              )} */}
            </Box>
          </Box>
        </Modal>
  
        <Dialog open={openDeleteConfirmation} onClose={handleDeleteClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                    <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
                    <DialogContent>
                      <DialogContentText id="alert-dialog-description">Are you sure you want to delete this Document?</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                      <Button
                        onClick={handleDeleteClose}
                        color="primary"
                        sx={{
                          textTransform: "none",
                          background: "#F87C7A",
                          color: "#160449",
                          cursor: "pointer",
                          fontWeight: theme.typography.secondary.fontWeight,
                          fontSize: theme.typography.smallFont,
                          "&:hover": {
                            backgroundColor: "#f76462",
                          },
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleDeleteConfirm}
                        color="primary"
                        autoFocus
                        sx={{
                          textTransform: "none",
                          background: "#FFC614",
                          color: "#160449",
                          cursor: "pointer",
                          fontWeight: theme.typography.secondary.fontWeight,
                          fontSize: theme.typography.smallFont,
                          "&:hover": {
                            backgroundColor: "#fabd00",
                          },
                        }}
                      >
                        Confirm
                      </Button>
                    </DialogActions>
        </Dialog>

        {/* {preview && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '500px',
            height: '100vh',
            backgroundColor: '#f0f0f0',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            zIndex: 10,
            padding: '20px',
            overflowY: 'hidden',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <Typography variant="h6">{preview.filename}</Typography>
            <Button onClick={handlePreviewClose}>
              <Close sx={{
                    color: theme.typography.primary.black,
                    fontSize: "20px",
                  }}/>
            </Button>
          </Box>
          <iframe src={preview.link} width="100%" height="84%" title="File Preview"/>
        </Box>
        )} */}

        {previewDialogOpen && selectedPreviewFile && <FilePreviewDialog file={selectedPreviewFile} onClose={handlePreviewDialogClose}/>}
      </>
    );
  }
};

export default Documents;
