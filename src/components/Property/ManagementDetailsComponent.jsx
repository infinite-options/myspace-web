import React, { useState } from 'react';
import { Box, Grid, Typography, Button, IconButton, Badge, Card, CardContent } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { DataGrid } from "@mui/x-data-grid";
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import theme from '../../theme/theme';
import FilePreviewDialog from '../Leases/FilePreviewDialog';
import { useNavigate } from "react-router-dom";

export default function ManagementDetailsComponent({activeContract, currentProperty, currentIndex, selectedRole, handleViewPMQuotesRequested, newContractCount, sentContractCount, handleOpenMaintenancePage, onShowSearchManager}){
    // console.log("---dhyey-- inside new component -", activeContract)
    const [selectedPreviewFile, setSelectedPreviewFile] = useState(null)
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false) 
    const navigate = useNavigate();

    const handleFileClick = (file)=>{
        setSelectedPreviewFile(file)
        setPreviewDialogOpen(true)
      }
    
      const handlePreviewDialogClose = () => {
        setPreviewDialogOpen(false)
        setSelectedPreviewFile(null)
      }

    return (
    <>
        <Card sx={{ backgroundColor: theme.palette.form.main, height: "100%" }}>
            <Box sx={{width:"100%", display: "flex", justifyContent:"space-between", alignItems: "center", marginBottom: "20px" }}>
                <Typography 
                    sx={{
                        color: theme.typography.primary.black,
                        fontWeight: theme.typography.primary.fontWeight,
                        fontSize: theme.typography.largeFont,
                        textAlign: "center",
                        paddingLeft: "100px",
                        // flexGrow: 1
                    }}
                >
                    Management Details
                </Typography>
                {selectedRole === "OWNER" && (<Box sx={{display: "flex", justifyContent: "space-evenly", alignItems: "center"}}>
                    <IconButton onClick={() => {handleViewPMQuotesRequested(1)}}>
                        <SearchIcon />
                    </IconButton>
                    <IconButton
                        onClick={()=>{
                            console.log("ROHIT - newContractCount - ", newContractCount);
                            if(newContractCount === 0){
                                onShowSearchManager();
                            } else {
                                handleViewPMQuotesRequested(0)
                            }                            
                        }} 
                        sx={{marginRight: "10px"}}
                    >
                        <Badge badgeContent={newContractCount || 0} color="error" showZero/>
                    </IconButton>
                    <IconButton 
                        onClick={()=>{
                            if(sentContractCount && sentContractCount > 0){
                                handleViewPMQuotesRequested(0)
                            }
                        }}
                        sx={{marginRight: "10px"}}
                    >
                        <Badge badgeContent={sentContractCount || 0} color="warning" showZero/>
                    </IconButton>
                </Box>)}
            </Box>
            <CardContent>
                <Grid container spacing={3}>
                    {/* Property Manager */}
                    {selectedRole === "OWNER" && (
                        <Grid container item spacing={2}>
                        <Grid item xs={6}>
                            <Typography
                                sx={{
                                    color: theme.typography.primary.black,
                                    fontWeight: theme.typography.secondary.fontWeight,
                                    fontSize: theme.typography.smallFont,
                                }}
                            >
                                Property Manager:
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            {activeContract ? (
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography
                                        sx={{
                                            color: theme.typography.primary.black,
                                            fontWeight: theme.typography.light.fontWeight,
                                            fontSize: theme.typography.smallFont,
                                        }}
                                    >
                                        {activeContract?.business_name}
                                    </Typography>
                                    <KeyboardArrowRightIcon
                                        sx={{ color: "blue", cursor: "pointer" }}
                                        onClick={() => {
                                            if (activeContract && activeContract.business_uid) {
                                                navigate("/ContactsPM", {
                                                    state: {
                                                        contactsTab: "Manager",
                                                        managerId: activeContract.business_uid,
                                                        fromPage: true,
                                                        index: currentIndex
                                                    },
                                                });
                                            }
                                        }}
                                    />
                                </Box>
                            ) : (
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography
                                        sx={{
                                            color: theme.typography.primary.black,
                                            fontWeight: theme.typography.light.fontWeight,
                                            fontSize: theme.typography.smallFont,
                                        }}
                                    >
                                        No Manager Selected
                                    </Typography>
                                </Box>
                            )}
                        </Grid>
                        </Grid>
                    )}

                    {/* Owner Info for Managers */}
                    {selectedRole === "MANAGER" && (
                        <Grid container item spacing={2}>
                        <Grid item xs={6}>
                            <Typography
                                sx={{
                                    color: theme.typography.primary.black,
                                    fontWeight: theme.typography.secondary.fontWeight,
                                    fontSize: theme.typography.smallFont,
                                }}
                            >
                            Property Owner:
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography
                                sx={{
                                    color: theme.typography.primary.black,
                                    fontWeight: theme.typography.light.fontWeight,
                                    fontSize: theme.typography.smallFont,
                                }}
                            >
                                {currentProperty ? `${currentProperty.owner_first_name} ${currentProperty.owner_last_name}` : "-"}
                            </Typography>
                            <KeyboardArrowRightIcon
                                sx={{ color: "blue", cursor: "pointer" }}
                                onClick={()=>{
                                    if (activeContract && activeContract.business_uid) {
                                        navigate("/ContactsPM", {
                                            state: {
                                                contactsTab: "Owner",
                                                ownerId: currentProperty.owner_uid,
                                            },
                                        });
                                    }
                                }}
                            />
                            </Box>
                        </Grid>
                        </Grid>
                    )}

                    {/* Contract Status */}
                    <Grid container item spacing={2}>
                        <Grid item xs={6}>
                        <Typography
                            sx={{
                                color: theme.typography.primary.black,
                                fontWeight: theme.typography.secondary.fontWeight,
                                fontSize: theme.typography.smallFont,
                            }}
                        >
                            Contract Status:
                        </Typography>
                        </Grid>
                        <Grid item xs={6}>
                        <Box display="flex" alignItems="center" justifyContent={"space-between"}>
                            {currentProperty?.contract_status === "ACTIVE" ? (<Typography
                                sx={{
                                    color: theme.palette.success.main,
                                    fontWeight: theme.typography.secondary.fontWeight,
                                    fontSize: theme.typography.smallFont,
                                }}
                            >
                                ACTIVE
                            </Typography>) : (
                                <Typography
                                    sx={{
                                        color: "#3D5CAC",
                                        fontWeight: theme.typography.secondary.fontWeight,
                                        fontSize: theme.typography.smallFont,
                                    }}
                                >
                                    No Contract
                                </Typography>)}
                            {currentProperty?.contract_status === "ACTIVE" && <Button
                            variant='outlined'
                            sx={{
                                background: "#3D5CAC",
                                color: theme.palette.background.default,
                                cursor: "pointer",
                                paddingX:"10px",
                                textTransform: "none",
                                maxWidth: "120px", // Fixed width for the button
                                maxHeight: "100%",
                            }}
                            size='small'
                            >
                            <Typography
                                sx={{
                                textTransform: "none",
                                color: "#FFFFFF",
                                fontWeight: theme.typography.secondary.fontWeight,
                                fontSize: "12px",
                                whiteSpace: "nowrap",
                                //   marginLeft: "1%", // Adjusting margin for icon and text
                                }}
                            >
                                {"End Contract"}
                            </Typography>
                            </Button>}
                        </Box>
                        </Grid>
                    </Grid>

                    {/* Contract Term */}
                    {activeContract && <Grid container item spacing={2}>
                        <Grid item xs={6}>
                        <Typography
                            sx={{
                                color: theme.typography.primary.black,
                                fontWeight: theme.typography.secondary.fontWeight,
                                fontSize: theme.typography.smallFont,
                            }}
                        >
                            Contract Term:
                        </Typography>
                        </Grid>
                        <Grid item xs={6}>
                        <Typography
                            sx={{
                                color: theme.typography.primary.black,
                                fontWeight: theme.typography.light.fontWeight,
                                fontSize: theme.typography.smallFont,
                            }}
                        >
                            {activeContract?.contract_start_date} 
                            <span style={{ fontWeight: 'bold', margin:"0 10px"}}>
                                to
                            </span> 
                            {activeContract?.contract_end_date}
                        </Typography>
                        </Grid>
                    </Grid>}

                    {/* Management Fees */}
                    {activeContract && <Grid container item spacing={2}>
                        <Grid item xs={6}>
                        <Typography
                            sx={{
                                color: theme.typography.primary.black,
                                fontWeight: theme.typography.secondary.fontWeight,
                                fontSize: theme.typography.smallFont,
                            }}
                        >
                            Management Fees:
                        </Typography>
                        </Grid>
                    </Grid>}

                    {activeContract && <Grid container item spacing={2}>
                        {activeContract?.contract_fees ? <FeesSmallDataGrid data={JSON.parse(activeContract?.contract_fees)}/> : (
                            <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: '7px',
                                marginBottom: "10px",
                                width: '100%',
                                height:"40px"
                            }}
                        >
                            <Typography
                                sx={{
                                color: "#A9A9A9",
                                fontWeight: theme.typography.primary.fontWeight,
                                fontSize: theme.typography.smallFont,
                                }}
                            >
                                No Fees
                            </Typography>
                        </Box>
                        )}
                    </Grid>}

                    {/* Contract Documents */}
                    {activeContract && <Grid container item spacing={2}>
                        <Grid item xs={6}>
                        <Typography
                            sx={{
                                color: theme.typography.primary.black,
                                fontWeight: theme.typography.secondary.fontWeight,
                                fontSize: theme.typography.smallFont,
                            }}
                        >
                            Contract Documents:
                        </Typography>
                        </Grid>
                    </Grid>}

                    {activeContract && <Grid container item >
                        {activeContract?.contract_documents ? <DocumentSmallDataGrid data={JSON.parse(activeContract?.contract_documents)} handleFileClick={handleFileClick} /> : (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginTop: '7px',
                                    marginBottom: "10px",
                                    width: '100%',
                                    height:"40px"
                                }}
                            >
                                <Typography
                                    sx={{
                                    color: "#A9A9A9",
                                    fontWeight: theme.typography.primary.fontWeight,
                                    fontSize: theme.typography.smallFont,
                                    }}
                                >
                                    No Document
                                </Typography>
                            </Box>
                        )}
                    </Grid>}


                    {/* Open Maintenance Tickets */}
                    <Grid container item spacing={2}>
                        <Grid item xs={6}>
                        <Typography
                            sx={{
                                color: theme.typography.primary.black,
                                fontWeight: theme.typography.secondary.fontWeight,
                                fontSize: theme.typography.smallFont,
                            }}
                        >
                            Open Maintenance Tickets:
                        </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <IconButton sx={{marginLeft: "1.5px", paddingTop: "3px"}} onClick={() => {handleOpenMaintenancePage()}}>
                                <Badge badgeContent={currentProperty?.maintenance?.length || 0} color="error" showZero/>
                            </IconButton>
                        </Grid>
                    </Grid>
                
                </Grid>
            </CardContent>
        </Card>
        {previewDialogOpen && selectedPreviewFile && <FilePreviewDialog file={selectedPreviewFile} onClose={handlePreviewDialogClose}/>}
    </>
    );
}

export const FeesSmallDataGrid = ({data}) => {

    const commonStyles = {
        color: theme.typography.primary.black,
        fontWeight: theme.typography.light.fontWeight,
        fontSize: theme.typography.smallFont,
    };

    const columns = [
        {
          field: "frequency",
          headerName: "Frequency",
          flex: 1,
          renderHeader: (params) => (
            <strong style={{fontSize: theme.typography.smallFont}}>{params.colDef.headerName}</strong>
          ),
          renderCell: (params) => (
            <Typography sx={commonStyles}>{params.value}</Typography>
          ),
        },
        {
          field: "fee_name",
          headerName: "Name",
          flex: 1.2,
          renderHeader: (params) => (
            <strong style={{fontSize: theme.typography.smallFont}}>{params.colDef.headerName}</strong>
          ),
          renderCell: (params) => (
            <Typography sx={commonStyles}>{params.value}</Typography>
          ),
        },
        {
          field: "charge",
          headerName: "Charge",
          flex: 0.8,
          renderHeader: (params) => (
            <strong style={{fontSize: theme.typography.smallFont}}>{params.colDef.headerName}</strong>
          ),
          renderCell: (params) => {
            const feeType = params.row?.fee_type;
            const charge = params.value;

            return (
              <Typography sx={commonStyles}>
                {feeType === "PERCENT"
                  ? `${charge}%`
                  : feeType === "FLAT-RATE"
                  ? `$${charge}`
                  : charge}
              </Typography>
            );
          },
        },
        {
          field: "of",
          headerName: "Of",
          flex: 1,
          renderHeader: (params) => (
            <strong style={{fontSize: theme.typography.smallFont}}>{params.colDef.headerName}</strong>
          ),
          renderCell: (params) => {
            const feeType = params.row?.fee_type;
            const of = params.value;

            return (
              <Typography sx={commonStyles}>
                {of === null || of === undefined || of === ""
                  ? feeType === "FLAT-RATE"
                    ? "Flat-Rate"
                    : "-"
                  : `${of}`}
              </Typography>
            );
          },
        },
    ];

  // Adding a unique id to each row using map if the data doesn't have an id field
  const rowsWithId = data.map((row, index) => ({
    ...row,
    id: row.id ? index : index,
  }));

  return (
    <DataGrid
        rows={rowsWithId}
        columns={columns}
        sx={{
          marginY: "5px",
          overflow: "auto",
          '& .MuiDataGrid-columnHeaders': {
            minHeight: '35px !important',
            maxHeight: '35px !important',
            height: 35, 
          },
        }}
        autoHeight
        rowHeight={35}
        hideFooter={true} // Display footer with pagination
    />
  );
}

export const DocumentSmallDataGrid = ({data, handleFileClick}) => {
    const commonStyles = {
        color: theme.typography.primary.black,
        fontWeight: theme.typography.light.fontWeight,
        fontSize: theme.typography.smallFont,
    };

    const DocColumn = [
        {
          field: "filename",
          headerName: "Filename",
          renderCell:(params)=>{
            return (<Box
                              sx={{
                                  ...commonStyles,
                                  cursor: 'pointer', // Change cursor to indicate clickability
                                  color: '#3D5CAC',
                              }}
                      onClick={() => handleFileClick(params.row)}
                          >
                              {params.row.filename}
                          </Box>
                  );
          },
          flex: 2.2,
          renderHeader: (params) => <strong >{params.colDef.headerName}</strong>,
        },
        {
          field: "contentType",
          headerName: "Content Type",
          flex: 1.8,
          renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
          renderCell: (params) => (
            <Typography sx={commonStyles}>{params.value}</Typography>
          ),
        },
    ]


    const rowsWithId = data.map((row, index) => ({
        ...row,
        id: row.id ? index : index,
    }));

    return (
        <DataGrid
                rows={rowsWithId}
                columns={DocColumn}
                hideFooter={true}
                autoHeight
                rowHeight={35}
                sx={{
                    marginY: "5px",
                    overflow: "auto",
                    '& .MuiDataGrid-columnHeaders': {
                        minHeight: '35px !important',
                        maxHeight: '35px !important',
                        height: 35, 
                    },
                }}
        />
    );
}