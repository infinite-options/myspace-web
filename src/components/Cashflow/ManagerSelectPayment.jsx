import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { 
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Collapse,
    ThemeProvider,
    Grid,
    Container,
    Paper,
    Typography,
    Button,
    Stack,
    Divider,
    IconButton,
    Box,
    Menu,
    MenuItem,
    CardMedia,
    Backdrop,
    CircularProgress,
    TextField 
} from '@mui/material';
import theme from '../../theme/theme';
import { DataGrid, } from "@mui/x-data-grid";

const ManagerSelectPayment = ({ selectedPayment, selectedPurGroup, }) => {
    const navigate = useNavigate();
    const [paymentNotes, setPaymentNotes] = useState("");
    const [transactionsList, setTransactionsList] = useState(selectedPurGroup?.transactions);
    const [total, setTotal] = useState(selectedPayment?.total.toFixed(2));
    // useEffect(() => {
    //     const filteredTransactions = transactionsList?.filter(item => (!item.pur_payer.startsWith("350") && !item.pur_receiver.startsWith("350") ))
    //     const total = filteredTransactions?.reduce((acc, transaction) => {
    //         if(transaction.pur_payer.startsWith("110")){
    //             return acc + parseFloat(transaction.expected);
    //         } else if(transaction.pur_payer.startsWith("600")){
    //             return acc - parseFloat(transaction.expected);
    //         }
    //     }, 0);
        
    //     console.log("ROHIT - total - ", total);
    // }, [transactionsList]);
    const handlePaymentNotesChange = (event) => {
        setPaymentNotes(event.target.value);
    };
    console.log("selectedPayment - ", selectedPayment);
    console.log("selectedPurGroup - ", selectedPurGroup);
    console.log("payment Notes", paymentNotes);
  
    return (
        <>
            <Paper
                sx={{
                    margin: "10px",
                    padding: 20,
                    backgroundColor: theme.palette.primary.main,
                    width: '100%',
                }}
            >
                <Stack direction="row" justifyContent="left" m={2}>
                <Typography sx={{ color: theme.typography.primary.black, fontWeight: theme.typography.primary.fontWeight, fontSize: theme.typography.largeFont }}>
                    Balance
                </Typography>
                </Stack>
                <Stack direction="row" justifyContent="center" m={2}>
                <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                    <Grid item xs={6}>
                    <Typography sx={{ marginLeft: "20px", color: theme.typography.common.blue, fontWeight: theme.typography.primary.fontWeight, fontSize: "26px" }}>
                        ${selectedPayment?.total.toFixed(2)}
                    </Typography>
                    </Grid>
                    <Grid item xs={6}>
                    <Button
                        disabled={selectedPayment?.total <= 0}
                        sx={{
                        backgroundColor: "#3D5CAC",
                        borderRadius: "10px",
                        color: "#FFFFFF",
                        width: "100%",
                        }}
                        onClick={() => {
                            const updatedPaymentData = {
                                ...selectedPayment.paymentData,
                                business_code: paymentNotes, // Substituting business_code with paymentNotes
                              };
                        // const updatedPaymentData = { ...paymentData, business_code: paymentNotes };
                            navigate("/selectPayment", {
                            // state: {
                            //     paymentData: updatedPaymentData,
                            //     total: total,
                            //     selectedItems: selectedItems,
                            //     selectedProperty: selectedProperty,
                            //     leaseDetails: leaseDetails,
                            //     balanceDetails: balanceDetails,
                            // },
                                state: {
                                    ...selectedPayment, paymentData: updatedPaymentData,
                                },
                        });
                        }}
                    >
                        <Typography
                        variant="contained"
                        style={{
                            textTransform: "none",
                            color: "#FFFFFF",
                            fontSize: "18px",
                            fontFamily: "Source Sans Pro",
                            fontWeight: "600",
                        }}
                        >
                        Select Payment
                        </Typography>
                    </Button>
                    </Grid>
                </Grid>
                </Stack>
                <Stack direction="row" justifyContent="center" m={2} sx={{ paddingTop: "25px", paddingBottom: "15px" }}>
                    <TextField variant="filled" fullWidth={true} multiline={true} value={paymentNotes} onChange={handlePaymentNotesChange} label="Payment Notes" />
                </Stack>
                <Stack>
                  {/* Pass only the filtered unpaid data */}
                  <TransactionsTable data={transactionsList} total={total} />
                </Stack>
            </Paper>
        </>
    );
  }
  
  function TransactionsTable(props) {
    const [data, setData] = useState(props.data);
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectedPayments, setSelectedPayments] = useState([]);
    const [paymentDueResult, setPaymentDueResult] = useState([]);
  
    useEffect(() => {
      const filteredTransactions = props.data?.filter(item => (!item.pur_payer.startsWith("350") && !item.pur_receiver.startsWith("350") ))
      setData(filteredTransactions);
    }, [props.data]);
  
    useEffect(() => {
      if (data && data.length > 0) {
        setSelectedRows(data.map((row) => row.purchase_uid));
        setPaymentDueResult(
          data.map((item) => ({
            ...item,
            pur_amount_due: parseFloat(item.amountDue),
          }))
        );
      }
    }, [data]);
  
    useEffect(() => {
      let total = 0;
      let purchase_uid_mapping = [];
  
      for (const item of selectedRows) {
        let paymentItemData = paymentDueResult.find((element) => element.purchase_uid === item);
        purchase_uid_mapping.push({ purchase_uid: item, pur_amount_due: paymentItemData.pur_amount_due.toFixed(2) });
  
        // Adjust total based on pur_cf_type
        if (paymentItemData.pur_cf_type === "revenue") {
          total += parseFloat(paymentItemData.pur_amount_due);
        } else if (paymentItemData.pur_cf_type === "expense") {
          total -= parseFloat(paymentItemData.pur_amount_due);
        }
      }
  
    //   props.setTotal(total);
    //   props.setPaymentData((prevPaymentData) => ({
    //     ...prevPaymentData,
    //     balance: total.toFixed(2),
    //     purchase_uids: purchase_uid_mapping,
    //   }));
    }, [selectedRows, paymentDueResult, props]);
  
    // useEffect(() => {
    //   props.setSelectedItems(selectedPayments);
    // }, [selectedPayments, props]);
  
    // const handleSelectionModelChange = (newRowSelectionModel) => {
    //   const addedRows = newRowSelectionModel.filter((rowId) => !selectedRows.includes(rowId));
    //   const removedRows = selectedRows.filter((rowId) => !newRowSelectionModel.includes(rowId));
  
    //   if (addedRows.length > 0) {
    //     let newPayments = [];
    //     addedRows.forEach((item) => {
    //       const addedPayment = paymentDueResult.find((row) => row.purchase_uid === item);
    //       newPayments.push(addedPayment);
    //     });
  
    //     setSelectedPayments((prevState) => [...prevState, ...newPayments]);
    //   }
  
    //   if (removedRows.length > 0) {
    //     setSelectedPayments((prevState) => prevState.filter((payment) => !removedRows.includes(payment.purchase_uid)));
    //   }
  
    //   setSelectedRows(newRowSelectionModel);
    // };
  
    const columnsList = [
    //   {
    //     field: "description",
    //     headerName: "Description",
    //     flex: 2,
    //     renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
    //   },
      {
        field: "pur_payer",
        headerName: "Payer",
        flex: 1,
        renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
      },
      {
        field: "pur_receiver",
        headerName: "Receiver",
        flex: 1,
        renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
      },
      {
        field: "pur_property_id",
        headerName: "Property UID",
        flex: 1,
        renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
      },
      {
        field: "property_address",
        headerName: "Address",
        flex: 1,
        renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
      },
      
      {
        field: "purchase_type",
        headerName: "Purchase Type",
        flex: 1,
        renderCell: (params) => <Box sx={{ fontWeight: "bold" }}>{params.value}</Box>,
      },
      {
        field: "expected",
        headerName: "Expected",
        flex: 1,
        renderCell: (params) => (
          <Box
            sx={{
              fontWeight: "bold",
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            {/* {params.row.pur_cf_type === "revenue"
              ? `$ ${parseFloat(params.value)?.toFixed(2)}`
              : `($ ${parseFloat(params.value)?.toFixed(2)})`} */}
              {params.row.pur_payer.startsWith("600") ? `(${parseFloat(params.value).toFixed(2)})` : `${parseFloat(params.value).toFixed(2)}`}
          </Box>
        ),
        headerAlign: "right",
      },
      {
        field: "actual",
        headerName: "Actual",
        flex: 1,
        renderCell: (params) => (
          <Box
            sx={{
              fontWeight: "bold",
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            {/* {params.row.pur_cf_type === "revenue"
              ? `$ ${parseFloat(params.value)?.toFixed(2)}`
              : `($ ${parseFloat(params.value)?.toFixed(2)})`} */}
            {params.row.pur_payer.startsWith("600") ? `(${params.value? parseFloat(params.value).toFixed(2) : 0})` : `${params.value? parseFloat(params.value).toFixed(2) : 0}`}
          </Box>
        ),
        headerAlign: "right",
      },
    ];
  
    return (
      <>
        {paymentDueResult.length > 0 && (
          <DataGrid
            rows={paymentDueResult}
            columns={columnsList}
            pageSizeOptions={[10, 50, 100]}
            // checkboxSelection
            // disableRowSelectionOnClick
            // rowSelectionModel={selectedRows}
            // onRowSelectionModelChange={handleSelectionModelChange}
            getRowId={(row) => row.index}
            hideFooter={true}
          />
        )}
      </>
    );
  }

export default ManagerSelectPayment;