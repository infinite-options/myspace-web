import {
  ThemeProvider,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Card,
  CardHeader,
  Slider,
  Stack,
  Button,
  Grid,
  TextField,
  MenuItem,
  Checkbox,
  Select,
  Radio,
  FormControlLabel,
  InputAdornment,
} from "@mui/material";

import { useEffect, useState } from "react";
import { Form, useLocation, useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import theme from "../../../theme/theme";
import ImageUploader from "../../ImageUploader";
import documentIcon from "./documentIcon.png";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { set } from "date-fns";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { useUser } from "../../../contexts/UserContext";
import DocumentUploader from "../../DocumentUploader";
import dayjs from "dayjs";

import APIConfig from "../../../utils/APIConfig";
import Documents from "../../Leases/Documents";
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../../utils/httpMiddleware";

function LaborTable({ labor, setLabor }) {
  const [indexToggle, setIndexToggle] = useState(-1);
  const [editToggle, setEditToggle] = useState(false);

  const [laborDescription, setLaborDescription] = useState("Labor");
  const [laborHours, setLaborHours] = useState("1");
  const [laborCharge, setLaborCharge] = useState("0");

  function addRow() {
    let newRow = {
      hours: "1",
      rate: "0",
      description: "",
    };
    setLabor((prevLabor) => [...prevLabor, newRow]);
  }

  function deleteRow(index) {
    let newLabor = [...labor];
    newLabor.splice(index, 1);
    setLabor(newLabor);
  }

  function editRow(index) {

    setLaborDescription(labor[index].description);
    setLaborHours(labor[index].hours);
    setLaborCharge(labor[index].rate);

    setIndexToggle(index);
    setEditToggle(!editToggle);
  }

  function saveRow(index) {
    //console.log("saveRow", index);
    let updatedRow = {
      hours: laborHours,
      rate: laborCharge,
      description: laborDescription,
    };
    let newLabor = [...labor];
    newLabor[index] = updatedRow;
    setLabor(newLabor);
    setIndexToggle(-1);
    setEditToggle(!editToggle);
    setLaborDescription("");
    setLaborCharge("0");
    setLaborHours("1");
  }

  const calculateTotal = (hours, cost) => {
    //console.log("calculateTotal", hours, cost);
    return parseInt(hours) * parseInt(cost);
  };

  const handleKeyDown = (event, index) => {
    if (event.key === "Enter") {
      saveRow(index);
    }
  };

  return (
    <>
      <Grid container sx={{ paddingTop: "10px" }}>
        <Grid item xs={1}></Grid>
        <Grid item xs={3}>
          <Typography sx={{ color: "#3D5CAC", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "14px" }}>Title</Typography>
        </Grid>
        <Grid item xs={2}>
          <Typography sx={{ color: "#3D5CAC", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "14px" }}># of Hours</Typography>
        </Grid>
        <Grid item xs={2}>
          <Typography sx={{ color: "#3D5CAC", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "14px" }}>Charge / Hour</Typography>
        </Grid>
        <Grid item xs={2}>
          <Typography sx={{ color: "#3D5CAC", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "14px" }}>Total</Typography>
        </Grid>
        <Grid item xs={1}></Grid>
        {labor.map((laborItem, index) => (
          <Grid container sx={{ paddingTop: "10px" }}>
            <Grid item xs={1}>
              <Button
                sx={{
                  color: "#3D5CAC",
                  textTransform: "none",
                }}
                onClick={() => editRow(index, true)}
              >
                <EditIcon />
              </Button>
            </Grid>
            <Grid item xs={3}>
              {indexToggle === index && editToggle === true ? (
                <TextField size="small" value={laborDescription} defaultValue={laborItem.description} onChange={(e) => setLaborDescription(e.target.value)} />
              ) : (
                <Typography sx={{ color: "#000000", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "14px" }}>
                  {laborItem.description === "" ? "Labor" : laborItem.description}
                </Typography>
              )}
            </Grid>
            <Grid item xs={2}>
              {indexToggle === index && editToggle === true ? (
                <TextField size="small" value={laborHours} defaultValue={laborItem.hours} onChange={(e) => setLaborHours(e.target.value)} />
              ) : (
                <Typography sx={{ color: "#000000", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "14px" }}>{laborItem.hours}</Typography>
              )}
            </Grid>
            <Grid item xs={2}>
              {indexToggle === index && editToggle === true ? (
                <TextField
                  size="small"
                  value={laborCharge}
                  defaultValue={laborItem.rate}
                  onChange={(e) => setLaborCharge(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    disableUnderline: true,
                  }}
                />
              ) : (
                <Typography sx={{ color: "#000000", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "14px" }}>${laborItem.rate}</Typography>
              )}
            </Grid>
            <Grid item xs={3}>
              <Typography sx={{ color: "#000000", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "14px" }}>
                ${calculateTotal(laborItem.hours, laborItem.rate)}
              </Typography>
            </Grid>
            <Grid item xs={1}>
              {indexToggle === index && editToggle === true ? (
                <Button
                  sx={{
                    color: "#3D5CAC",
                    textTransform: "none",
                  }}
                  onClick={() => saveRow(indexToggle)}
                  onKeyDown={(event) => handleKeyDown(event, indexToggle)}
                >
                  <SaveIcon />
                </Button>
              ) : (
                <Button
                  sx={{
                    color: "#3D5CAC",
                    textTransform: "none",
                  }}
                  onClick={() => deleteRow(index)}
                >
                  <DeleteIcon fontSize="small" />
                </Button>
              )}
            </Grid>
          </Grid>
        ))}
      </Grid>

      {/* add row */}
      {/* <Grid container>
        <Grid item xs={12}>
          <Button
            sx={{
              color: "#3D5CAC",
              textTransform: "none",
            }}
            onClick={() => addRow()}
          >
            <AddIcon />
            <Typography sx={{ color: "#3D5CAC", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "12px" }}>Add Labor</Typography>
          </Button>
        </Grid>
      </Grid> */}
    </>
  );
}

function PartsTable({ parts, setParts }) {
  const [indexToggle, setIndexToggle] = useState(-1);
  const [editToggle, setEditToggle] = useState(false);

  const [partName, setPartName] = useState("");
  const [partCost, setPartCost] = useState("0");
  const [partQuantity, setPartQuantity] = useState("1");

  function addRow() {
    let newRow = {
      part: "",
      quantity: "1",
      cost: "0",
    };
    setParts((prevParts) => [...prevParts, newRow]);
  }

  function deleteRow(index) {
    let newParts = [...parts];
    newParts.splice(index, 1);
    setParts(newParts);
  }

  function editRow(index) {

    setPartName(parts[index].part);
    setPartCost(parts[index].cost);
    setPartQuantity(parts[index].quantity);

    setIndexToggle(index);
    setEditToggle(!editToggle);
  }

  function saveRow(index) {
    //console.log("saveRow", index);
    let updatedRow = {
      part: partName,
      quantity: partQuantity,
      cost: partCost,
    };
    let newParts = [...parts];
    newParts[index] = updatedRow;
    setParts(newParts);
    setIndexToggle(-1);
    setEditToggle(!editToggle);
    setPartName("");
    setPartCost("0");
    setPartQuantity("1");
  }

  const calculateTotal = (qty, cost) => {
    return parseInt(qty) * parseInt(cost);
  };

  const handleKeyDown = (event, index) => {
    if (event.key === "Enter") {
      saveRow(index);
    }
  };

  return (
    <>
      <Grid container sx={{ paddingTop: "10px" }}>
        <Grid item xs={1}></Grid>
        <Grid item xs={3}>
          <Typography sx={{ color: "#3D5CAC", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "14px" }}>Parts</Typography>
        </Grid>
        <Grid item xs={2}>
          <Typography sx={{ color: "#3D5CAC", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "14px" }}>Cost</Typography>
        </Grid>
        <Grid item xs={2}>
          <Typography sx={{ color: "#3D5CAC", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "14px" }}>Qty</Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography sx={{ color: "#3D5CAC", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "14px" }}>Total</Typography>
        </Grid>
        <Grid item xs={1}></Grid>
        {parts.map((part, index) => (
          <Grid container sx={{ paddingTop: "10px" }}>
            <Grid item xs={1}>
              <Button
                sx={{
                  color: "#3D5CAC",
                  textTransform: "none",
                }}
                onClick={() => editRow(index, true)}
              >
                <EditIcon />
              </Button>
            </Grid>
            <Grid item xs={3}>
              {indexToggle === index && editToggle === true ? (
                <TextField size="small" value={partName} defaultValue={part.part} onChange={(e) => setPartName(e.target.value)} />
              ) : (
                <Typography sx={{ color: "#000000", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "14px" }}>{part.part}</Typography>
              )}
            </Grid>
            <Grid item xs={2}>
              {indexToggle === index && editToggle === true ? (
                <TextField
                  size="small"
                  value={partCost}
                  defaultValue={part.cost}
                  onChange={(e) => setPartCost(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    disableUnderline: true,
                  }}
                />
              ) : (
                <Typography sx={{ color: "#000000", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "14px" }}>${part.cost}</Typography>
              )}
            </Grid>
            <Grid item xs={2}>
              {indexToggle === index && editToggle === true ? (
                <TextField size="small" value={partQuantity} defaultValue={part.quantity} onChange={(e) => setPartQuantity(e.target.value)} />
              ) : (
                <Typography sx={{ color: "#000000", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "14px" }}>{part.quantity}</Typography>
              )}
            </Grid>
            <Grid item xs={3}>
              <Typography sx={{ color: "#000000", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "14px" }}>${calculateTotal(part.quantity, part.cost)}</Typography>
            </Grid>
            <Grid item xs={1}>
              {indexToggle === index && editToggle === true ? (
                <Button
                  sx={{
                    color: "#3D5CAC",
                    textTransform: "none",
                  }}
                  onClick={() => saveRow(indexToggle)}
                  onKeyDown={(event) => handleKeyDown(event, indexToggle)}
                >
                  <SaveIcon />
                </Button>
              ) : (
                <Button
                  sx={{
                    color: "#3D5CAC",
                    textTransform: "none",
                  }}
                  onClick={() => deleteRow(index)}
                >
                  <DeleteIcon fontSize="small" />
                </Button>
              )}
            </Grid>
          </Grid>
        ))}
      </Grid>
      <Grid container>
        <Grid item xs={12}>
          <Button
            sx={{
              color: "#3D5CAC",
              textTransform: "none",
            }}
            onClick={() => addRow()}
          >
            <AddIcon />
            <Typography sx={{ color: "#3D5CAC", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "12px" }}>Add Additional Parts</Typography>
          </Button>
        </Grid>
      </Grid>
    </>
  );
}

export default function BusinessInvoiceForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getProfileId } = useUser();
  const [showSpinner, setShowSpinner] = useState(false);
  const [editMode, setEditMode] = useState(location.state?.edit || false);
  const [profileInfo, setProfileInfo] = useState({});
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedDocumentList, setSelectedDocumentList] = useState([]);
  const [uploadedFiles, setuploadedFiles] = useState([])
  const [uploadedFilesType, setuploadedFilesType] = useState([])
  const [isPreviousFileChange, setIsPreviousFileChange] = useState(false)
  const [deleteDocuments, setDeleteDocuments] = useState([])

  const maintenanceItem = location.state.maintenanceItem;

  //console.log("maintenanceItem", maintenanceItem);

  const costData = JSON.parse(maintenanceItem?.quote_services_expenses);

  

  const [parts, setParts] = useState(costData.parts);
  const [labor, setLabor] = useState([
    {
      description: "Labor",
      // hours: costData.event_type,
      hours: costData.event_type === "Fixed" ? 1 : costData.labor[0].hours,
      rate: costData.labor[0].rate || costData.labor[0].charge,
    },
  ]);
  // const [numParts, setNumParts] = useState(costData.parts.length);
  const [selectedImageList, setSelectedImageList] = useState([]);
  // const [amountDue, setAmountDue] = useState(0);
  const [notes, setNotes] = useState("");
  const [total, setTotal] = useState(0);

  const [diagnosticToggle, setDiagnosticToggle] = useState(false);

  const handleNotesChange = (e) => {
    // //console.log("handleNotesChange", e.target.value);
    setNotes(e.target.value);
  };

  const handleDiagnosticToggle = () => {
    setDiagnosticToggle(!diagnosticToggle);
  };

  // const createPaymentMethodList = (businessProfileObject) => {
  //   const buisnessObject = JSON.parse(businessProfileObject)
  //   let paymentMethods = [];
  //   paymentMethods.push({
  //     method: "Venmo",
  //     account: buisnessObject.business_venmo ? buisnessObject.business_venmo : "Not Provided",
  //   });
  //   paymentMethods.push({
  //     method: "Cash App",
  //     account: buisnessObject.business_cash_app ? buisnessObject.business_cash_app : "Not Provided",
  //   });
  //   paymentMethods.push({
  //     method: "PayPal",
  //     account: buisnessObject.business_paypal ? buisnessObject.business_paypal : "Not Provided",
  //   });
  //   paymentMethods.push({
  //     method: "Zelle",
  //     account: buisnessObject.business_zelle ? buisnessObject.business_zelle : "Not Provided",
  //   });

  //   setPaymentMethods(paymentMethods);
  // };

  const createPaymentMethodList = (businessProfileObject) => {
    const businessArray = JSON.parse(businessProfileObject); // Parse the JSON input
    const predefinedMethods = ["Venmo", "Cash App", "PayPal", "Zelle"]; // Predefined payment methods
    const paymentMethods = [];
  
    predefinedMethods.forEach((method) => {
      // Find the corresponding object in the businessArray
      const matchingObject = businessArray.find(
        (item) => item.paymentMethod_type.toLowerCase() === method.toLowerCase()
      );
      
      paymentMethods.push({
        method,
        account_status: matchingObject? matchingObject.paymentMethod_status : "Not Provided",
        account: matchingObject ? matchingObject.paymentMethod_name : "Not Provided", // If found, use the account; otherwise, "Not Provided"
      });
    });
  
    setPaymentMethods(paymentMethods);
  };
  
  useEffect(()=>{
    //console.log("selected images - ", selectedImageList)
  }, [selectedImageList])

  useEffect(() => {
    const getMaintenanceProfileInfo = async () => {
      setShowSpinner(true);
      try {
        // const response = await fetch(`${APIConfig.baseURL.dev}/businessProfile/${getProfileId()}`, {
        const response = await fetch(`${APIConfig.baseURL.dev}/profile/${getProfileId()}`, {
          method: "GET",
        });
        const responseData = await response.json();
        // //console.log("[DEBUG] Business Profile:", responseData?.profile.result[0]);
        
        createPaymentMethodList(responseData?.profile?.result[0]?.paymentMethods);
        setProfileInfo(responseData?.profile?.result[0]);

      } catch (error) {
        //console.log("error", error);
      }
      setShowSpinner(false);
    };
    // //console.log("running get maintenance profile info")
    getMaintenanceProfileInfo();

    if(editMode){
      setSelectedDocumentList(maintenanceItem?.bill_documents ? JSON.parse(maintenanceItem?.bill_documents) : [])
      // setSelectedImageList(JSON.parse(maintenanceItem?.bill_images).length > 0 ? JSON.parse(maintenanceItem?.bill_images) : [])
      setNotes(maintenanceItem?.bill_notes)
    }

  }, []);

  useEffect(() => {
    let partsTotal = 0;
    let laborTotal = 0;

    for (let i = 0; i < parts.length; i++) {
      partsTotal += parseInt(parts[i].cost) * parseInt(parts[i].quantity);
    }


    for (let i = 0; i < labor.length; i++) {
      laborTotal += parseInt(labor[i].hours) * parseInt(labor[i].rate);
    }
    setTotal(partsTotal + laborTotal);
  }, [parts, labor]);

  function computeTotalCost({hours, rate}){
    if (!hours || hours === 0) {
        return parseInt(rate || 0);
    }

    return parseInt(hours || 0) * parseInt(rate || 0);
  }

  function compileExpenseObject(){
    let expenseObject = {
        "per Hour Charge": labor[0].rate,
        "event_type": "Hourly",
        "service_name": labor[0].description || "Labor",
        "parts": parts.length === 0 ? [] : parts,
        "labor": labor,
        "total_estimate": computeTotalCost({hours: labor[0].hours, rate: labor[0].rate})

    }
    return JSON.stringify(expenseObject)
  }

  const handleSendInvoice = async () => {
    // //console.log("handleSendInvoice");
    // //console.log("selectedImageList", selectedImageList);
    // //console.log("parts", parts);
    // //console.log("total", total);

    const updateMaintenanceQuote = async () => {
      var formData = new FormData();
      formData.append("maintenance_quote_uid", maintenanceItem.maintenance_quote_uid);
      formData.append("quote_services_expenses", compileExpenseObject());

      setShowSpinner(true);
      try {
        const response = await fetch(`${APIConfig.baseURL.dev}/maintenanceQuotes`, {
          method: "PUT",
          body: formData,
        });
      } catch (error) {
        //console.log("error", error);
      }
      setShowSpinner(false);
    };
    
    const uploadBillDocuments = async () => {
      // Get the current date and time
      const currentDatetime = new Date();

      // Format the date and time
      const formattedDatetime =
        (currentDatetime.getMonth() + 1).toString().padStart(2, "0") +
        "-" +
        currentDatetime.getDate().toString().padStart(2, "0") +
        "-" +
        currentDatetime.getFullYear() +
        " " +
        currentDatetime.getHours().toString().padStart(2, "0") +
        ":" +
        currentDatetime.getMinutes().toString().padStart(2, "0") +
        ":" +
        currentDatetime.getSeconds().toString().padStart(2, "0");
      try {
        var formData = new FormData();
        formData.append("document_type", "pdf");
        formData.append("document_date_created", formattedDatetime);
        formData.append("document_property", maintenanceItem.property_id);

        for (let i = 0; i < selectedDocumentList.length; i++) {
          formData.append("document_file", selectedDocumentList[i]);
          formData.append("document_title", selectedDocumentList[i].name);
        }
        const response = await fetch(`${APIConfig.baseURL.dev}/documents/${getProfileId()}`, {
          method: "POST",
          body: formData,
        });
        // const responseData = await response.json();
      } catch (error) {
        //console.log("error", error);
      }
    };

    const createBill = async () => {
      setShowSpinner(true);
      try {
        var formData = new FormData();
        formData.append("bill_description", "Invoice from " + maintenanceItem.business_name + " for " + maintenanceItem.maintenance_title);
        formData.append("bill_created_by", maintenanceItem.quote_business_id);
        formData.append("bill_utility_type", "maintenance");
        formData.append("bill_amount", total);
        formData.append("bill_split", "Uniform");
        formData.append(
          "bill_property_id",
          JSON.stringify([
            {
              property_uid: maintenanceItem.property_id,
            },
          ])
        );
        // formData.append("bill_docs", JSON.stringify(selectedImageList));
        formData.append("bill_notes", notes);
        formData.append("bill_maintenance_quote_id", maintenanceItem.maintenance_quote_uid);
        formData.append("bill_maintenance_request_id", maintenanceItem.maintenance_request_uid);

        if(isPreviousFileChange){
          formData.append("bill_documents", JSON.stringify(selectedDocumentList));
        }

        // if new file uploaded in documents
        if (uploadedFiles && uploadedFiles?.length) {

            const documentsDetails = [];
            [...uploadedFiles].forEach((file, i) => {
              
              // //console.log(JSON.stringify(file));
              
      
              formData.append(`file_${i}`, file);
              const fileType = uploadedFilesType[i] || "";
              // formData.append("contract")
              const documentObject = {
                // file: file,
                fileIndex: i, //may not need fileIndex - will files be appended in the same order?
                fileName: file.name, //may not need filename
                contentType: fileType, // contentType = "contract or lease",  fileType = "pdf, doc"
              };
              documentsDetails.push(documentObject);
            });
      
            formData.append("bill_documents_details", JSON.stringify(documentsDetails));
        }

        // if any previous document delete
        if(deleteDocuments && deleteDocuments?.length !== 0){
            formData.append("delete_documents", JSON.stringify(deleteDocuments));
        }

        //For images
        let i = 0;
        for (const file of selectedImageList) {
          //console.log(" inside image uplaod in formdata - ", file)
        // let key = file.coverPhoto ? "img_cover" : `img_${i++}`;
            let key = `img_${i++}`;
            if (file.file !== null) {
                // newProperty[key] = file.file;
                formData.append(key, file.file);
            } else {
                // newProperty[key] = file.image;
                formData.append(key, file.image);
            }
            
            if (file.coverPhoto) {
                formData.append("img_favorite", key);
            }
        }

        // TODO: Change this to form data
        const response = await fetch(`${APIConfig.baseURL.dev}/bills`, {
          method: "POST",
          body: formData,
        });

        const responseData = await response.json();
        //console.log(responseData);
        if (response.status === 200) {
          //console.log("success");

          navigate("/maintenanceDashboard2", {state: {refresh: true}})
          // uploadBillDocuments();
        } else {
          //console.log("error setting status");
        }
      } catch (error) {
        //console.log("error", error);
      }
      setShowSpinner(false);
    };

    const updateBill = async () => {
      setShowSpinner(true);
      try {
        var formData = new FormData();
        formData.append("bill_amount", total);

        // formData.append("bill_docs", JSON.stringify(selectedImageList));
        formData.append("bill_notes", notes);
        formData.append("bill_maintenance_quote_id", maintenanceItem.maintenance_quote_uid);
        formData.append("bill_maintenance_request_id", maintenanceItem.maintenance_request_uid);
        formData.append("bill_uid", maintenanceItem.bill_uid)

        if(isPreviousFileChange){
          formData.append("bill_documents", JSON.stringify(selectedDocumentList));
        }

        // if new file uploaded in documents
        if (uploadedFiles && uploadedFiles?.length) {

            const documentsDetails = [];
            [...uploadedFiles].forEach((file, i) => {
              
              // //console.log(JSON.stringify(file));
              
      
              formData.append(`file_${i}`, file);
              const fileType = uploadedFilesType[i] || "";
              // formData.append("contract")
              const documentObject = {
                // file: file,
                fileIndex: i, //may not need fileIndex - will files be appended in the same order?
                fileName: file.name, //may not need filename
                contentType: fileType, // contentType = "contract or lease",  fileType = "pdf, doc"
              };
              documentsDetails.push(documentObject);
            });
      
            formData.append("bill_documents_details", JSON.stringify(documentsDetails));
        }

        // if any previous document delete
        if(deleteDocuments && deleteDocuments?.length !== 0){
            formData.append("delete_documents", JSON.stringify(deleteDocuments));
        }

        //For images
        let i = 0;
        for (const file of selectedImageList) {
          //console.log(" inside image uplaod in formdata - ", file)
        // let key = file.coverPhoto ? "img_cover" : `img_${i++}`;
            let key = `img_${i++}`;
            if (file.file !== null) {
                // newProperty[key] = file.file;
                formData.append(key, file.file);
            } else {
                // newProperty[key] = file.image;
                formData.append(key, file.image);
            }
            
            if (file.coverPhoto) {
                formData.append("img_favorite", key);
            }
        }

        // TODO: Change this to form data
        const response = await fetch(`${APIConfig.baseURL.dev}/bills`, {
          method: "PUT",
          body: formData,
        });

        const responseData = await response.json();
        //console.log(responseData);
        if (response.status === 200) {
          //console.log("success");

          navigate("/maintenanceDashboard2", {state: {refresh: true}})
          // uploadBillDocuments();
        } else {
          //console.log("error setting status");
        }
      } catch (error) {
        //console.log("error", error);
      }
      setShowSpinner(false);
    };

    await updateMaintenanceQuote();
    
    if(editMode){
      updateBill()
    }else{
      createBill();
    }

  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
      }}
    >
      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Box
        style={{
          display: "flex",
          justifyContent: "center",
          width: "80%",
          minHeight: "100vh", // Set the Box height to full height
          marginTop: theme.spacing(2), // Set the margin to 20px
        }}
      >
        <Paper
          sx={{
            margin: "10px",
            backgroundColor: theme.palette.primary.main,
            width: "100%", // Occupy full width with 25px margins on each side
            paddingTop: "10px",
            paddingBottom: "30px",
          }}
        >
          <Stack
            direction="column"
            justifyContent="center"
            alignItems="center"
            sx={{
              paddingBottom: "20px",
              paddingLeft: "10px",
              paddingRight: "10px",
            }}
          >
            {/* Invoice heading and close icon */}
            <Box sx={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
              <Typography sx={{ paddingBottom: "20px", color: "#000000", fontWeight: 800, fontSize: "36px" }}>Invoice</Typography>
              <Box sx={{ position: "absolute", right: 0 }}>
                <Button
                  sx={{
                    color: "#3D5CAC",
                    textTransform: "none",
                  }}
                  onClick={() => navigate(-1)}
                >
                  <CloseIcon />
                </Button>
              </Box>
            </Box>
            
            {/* Estimate */}
            <Grid container direction="column" rowSpacing={2}>
              <Grid item xs={12}>
                <Typography sx={{ color: "#3D5CAC", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "16px" }}>Estimate</Typography>
              </Grid>
            </Grid>

            <LaborTable labor={labor} setLabor={setLabor} />

            <PartsTable parts={parts} setParts={setParts} />
            
            {/* earliest date and time, document, payment */}
            <Grid container direction="row" rowSpacing={2} marginTop={"10px"}>
              
              {/* new Total */}
              <Grid item xs={12} marginY={"5px"}>
                <Typography sx={{ color: "#000000", fontWeight: theme.typography.medium.fontWeight, fontSize: "14px" }}>New Total</Typography>
                <Typography sx={{ color: "#000000", fontWeight: theme.typography.medium.fontWeight, fontSize: "18px" }}>$ {total}</Typography>
                {/* <TextField
                  required
                  rows={1}
                  borderRadius="10px"
                  variant="outlined"
                  fullWidth
                  size="small"
                  disabled={true}
                  InputProps={{
                    style: {
                      backgroundColor: "white",
                      borderColor: "#000000",
                    },
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  value={total}
                /> */}
              </Grid>

              {/* quote_earliest_available_date */}
              <Grid item xs={12}>
                {/* <Typography sx={{ color: "#3D5CAC", fontWeight: theme.typography.medium.fontWeight, fontSize: "14px" }}>
                  Estimated Time: {maintenanceItem.quote_event_type}
                </Typography> */}
                <Typography sx={{ color: "#3D5CAC", fontWeight: theme.typography.medium.fontWeight, fontSize: "14px" }}>
                  Earliest Availability: {maintenanceItem.quote_earliest_available_date} {dayjs(maintenanceItem.quote_earliest_available_time, "HH:mm").format("hh:mm A")}
                </Typography>
              </Grid>
              
              {/* Diagnostic checkbox */}
              <Grid item xs={12}>
                <Box display="flex" flexDirection="row" alignItems="center" justifyContent="left">
                  <Checkbox checked={diagnosticToggle} onChange={handleDiagnosticToggle} />
                  <Typography
                    sx={{
                      color: theme.palette.text.primary,
                      fontWeight: theme.typography.medium.fontWeight,
                      fontSize: theme.typography.pxToRem(14), // Example size, adjust as needed
                      fontFamily: "Source Sans Pro",
                      marginLeft: 2, // Optionally add some spacing between the checkbox and the text
                    }}
                  >
                    Diagnostic fees included or extra
                  </Typography>
                </Box>
              </Grid>

              {/* document */}
              <Grid item xs={12}>
                <Documents isEditable={false} isAccord={false} documents={maintenanceItem?.quote_documents? JSON.parse(maintenanceItem?.quote_documents) : []} customName={"Quote Documents"}/>
              </Grid>

              {/* payment Method */}
              <Grid item xs={12}>
                <Typography sx={{ color: "#000000", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "16px" }}>Payment Methods</Typography>
                <Grid container direction="row" spacing={2} alignContent="center" marginY={"5px"}>
                  {paymentMethods.map((method) => (
                    <>
                      <Grid item xs={4}>
                        {method.method}
                      </Grid>
                      <Grid item xs={8} sx={{color: method.account === "Not Provided" ? "black" : method.account_status === "Active" ? "#3D5CAC" : "red"}}>
                        {method.account}
                      </Grid>
                    </>
                  ))}
                </Grid>
              </Grid>

              {/* payment notes */}
              <Grid item xs={12}>
                <Typography sx={{ color: "#000000", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "16px" }}>Payment Notes</Typography>
                <TextField
                  required
                  rows={1}
                  value={notes}
                  borderRadius="10px"
                  variant="outlined"
                  fullWidth
                  size="small"
                  InputProps={{
                    readOnly: false,
                    style: {
                      backgroundColor: "white",
                      borderColor: "#000000",
                    },
                  }}
                  onChange={handleNotesChange}
                />
              </Grid>

              {/* Image uploader */}
              <Grid item xs={12}>
                <Typography sx={{ color: "#000000", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "16px" }}>Add Photos</Typography>
                <ImageUploader selectedImageList={selectedImageList} setSelectedImageList={setSelectedImageList} page={"QuoteRequestForm"} />
              </Grid>

              {/* Invoice document */}
              <Grid item xs={12}>
                <Documents isAccord={false} isEditable={true} documents={selectedDocumentList} setDocuments={setSelectedDocumentList} contractFiles={uploadedFiles} setContractFiles={setuploadedFiles} contractFileTypes={uploadedFilesType} setContractFileTypes={setuploadedFilesType} setDeleteDocsUrl={setDeleteDocuments} setIsPreviousFileChange={setIsPreviousFileChange} customName={"Invoice Documents"} customUploadingName={"Uploading Invoice Documents:"}/>
                {/* <Typography sx={{ color: "#000000", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "16px" }}>Add Documents</Typography>
                <DocumentUploader selectedDocumentList={selectedDocumentList} setSelectedDocumentList={setSelectedDocumentList} /> */}
              </Grid>

              {/* send invoice button */}
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#3D5CAC",
                    textTransform: "none",
                    borderRadius: "10px",
                    display: "flex",
                    width: "100%",
                  }}
                  onClick={() => handleSendInvoice()}
                >
                  <Typography sx={{ color: "#FFFFFF", fontWeight: theme.typography.propertyPage.fontWeight, fontSize: "16px" }}>Send Invoice</Typography>
                </Button>
              </Grid>
            </Grid>
          </Stack>
        </Paper>
      </Box>
    </div>
  );
}
