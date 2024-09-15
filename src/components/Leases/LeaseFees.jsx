import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";

import Grid from "@mui/material/Grid";

import { DataGrid } from '@mui/x-data-grid';
import { getDateAdornmentString } from "../../utils/dates";



const LeaseFees = ({ leaseFees }) => {  
    // const valueToDayMap = new Map([
    //   [0, "Monday"],
    //   [1, "Tuesday"],
    //   [2, "Wednesday"],
    //   [3, "Thursday"],
    //   [4, "Friday"],
    //   [5, "Saturday"],
    //   [6, "Sunday"],
    //   [7, "Monday - Week 2"],
    //   [8, "Tuesday - Week 2"],
    //   [9, "Wednesday - Week 2"],
    //   [10, "Thursday - Week 2"],
    //   [11, "Friday - Week 2"],
    //   [12, "Saturday - Week 2"],
    //   [13, "Sunday - Week 2"],
    // ]);

    const biweeklyDueByValuetoDayMap = {
        0: "Monday - week 1",
        1: "Tuesday - week 1",
        2: "Wednesday - week 1",
        3: "Thursday - week 1",
        4: "Friday - week 1",
        5: "Saturday - week 1",
        6: "Sunday - week 1",
        7: "Monday - week 2",
        8: "Tuesday - week 2",
        9: "Wednesday - week 2",
        10: "Thursday - week 2",
        11: "Friday - week 2",
        12: "Saturday - week 2",
        13: "Sunday - week 2",
    };
    
    const weeklyDueByValuetoDayMap = {
        0: "Monday",
        1: "Tuesday",
        2: "Wednesday",
        3: "Thursday",
        4: "Friday",
        5: "Saturday",
        6: "Sunday",
    };
  
    const getFeesDueBy = (fee) => {
        if (fee.frequency === "Bi-Weekly") {
        return biweeklyDueByValuetoDayMap[fee.due_by];
        } else if (fee.frequency === "Weekly") {
        return weeklyDueByValuetoDayMap[fee.due_by];
        } else if (fee.frequency === "Monthly") {
        return `${fee.due_by}${getDateAdornmentString(fee.due_by)} of the month`;
        } else if (fee.frequency === "One Time" || fee.frequency === "Annually") {
        return `${fee.due_by_date ?? "No Due Date"}`;
        } else {
        return "-";
        }
    };

    const getFeesLateBy = (fee) => {
        if (fee.frequency === "Bi-Weekly" || fee.frequency === "Weekly" || fee.frequency === "Monthly" || fee.frequency === "Annually" || fee.frequency === "One Time") {
            return `${fee.late_by}${getDateAdornmentString(fee.late_by)} day after due`;
        } else {
            return "-";
        }
        };

    const getFeesAvailableToPay = (fee) => {
        if (fee.frequency === "Bi-Weekly" || fee.frequency === "Weekly" || fee.frequency === "Monthly" || fee.frequency === "Annually" || fee.frequency === "One Time") {
            return `${fee.late_by} days before due`;
        } else {
            return "-";
        }
    };
  
    const columns = [
      {
        field: "fee_name",
        headerName: "Name",
        flex:1,
        renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
      }, 
      {
        field: "frequency",
        headerName: "Frequency",
        flex:1,
        renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
      },
      {
        field: "charge",
        headerName: "Amount",
        flex:0.8,
        renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
        renderCell: (params) => (
          <Typography>
            {params.row.fee_type === "$" && `$ ${params.row.charge}`}
          </Typography>
        )
      },
      {
        field: "due_by",
        headerName: "Due By",
        flex: 1.5,
        renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
        renderCell: (params) => (
          <Typography>
            {/* {params.row.frequency === "Monthly" && `${params.row.due_by}${getDateAdornmentString(params.row.due_by)} of every month`}
            {params.row.frequency === "One Time" && `${params.row.due_by_date}`}
            {(params.row.frequency === "Weekly"  || params.row.frequency === "Bi-Weekly") && `${valueToDayMap.get(params.row.due_by)}`} */}
            {getFeesDueBy(params.row)}
          </Typography>
        )
      },
      {
        field: "available_topay",
        headerName: "Available To Pay",
        flex: 1.5,
        renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
        renderCell: (params) => (
          <Typography>
            {/* { (
                params.row.frequency === "Monthly" || 
                params.row.frequency === "Weekly" ||
                params.row.frequency === "Bi-Weekly" ||
                params.row.frequency === "One Time"
              )
              && `${params.row.available_topay} days before`} */}
            {
                getFeesAvailableToPay(params.row)
            }
          </Typography>
        )
      },
      {
        field: "late_by",
        headerName: "Late By",
        flex: 1.4,
        renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
        renderCell: (params) => (
          <Typography>
            {/* {(
                params.row.frequency === "Monthly" || 
                params.row.frequency === "Weekly" ||
                params.row.frequency === "Bi-Weekly" ||
                params.row.frequency === "One Time"
              ) 
            && `${params.row.available_topay} days after`} */}
            {
                getFeesLateBy(params.row)
            }
          </Typography>
        )
      },
      {
        field: "late_fee",
        headerName: "Late Fee",
        flex:0.7,
        renderHeader: (params) => <strong>{params.colDef.headerName}</strong>,
        renderCell: (params) => (
          <Typography>
            {params.row.fee_type === "$" && `$ ${params.row.late_fee}`}
          </Typography>
        )
      },
      {
        field: "perDay_late_fee",      
        flex: 1,
        renderHeader: (params) => (
          <strong style={{ lineHeight: 1.2, display: "inline-block", textAlign: "center" }}>
            Late Fee <br /> Per Day
          </strong>
        ),
        renderCell: (params) => (
          <Typography>
            {params.row.fee_type === "$" && `$ ${params.row.perDay_late_fee}`}
          </Typography>
        )
      },
  
  
                     
    ];
  
    return (
      <>
        <Typography
          sx={{
            color: "#160449",
            fontWeight: "bold",
            fontSize: "18px",
            paddingBottom: "5px",
            paddingTop: "5px",
            marginTop:"10px"
          }}
        >
          Lease Fees:
        </Typography>
  
        <Grid item xs={12} sx={{overflowX: "auto",}}>
          <DataGrid
            rows={leaseFees}
            columns={columns}
            sx={{        
              marginTop: "10px",
              minWidth: '1000px',
            }}
            getRowId={ (row) => row.leaseFees_uid}
            // autoHeight
            rowHeight={30} 
            hideFooter={true}
          />
        </Grid>          
      </>
    );
  
  }


export default LeaseFees;