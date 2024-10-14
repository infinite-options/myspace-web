import React, { useEffect, useState, useContext } from "react";
import {
  Paper,
  DialogContent,
  Grid,
  Box,
  Modal,
  Stack,
  ThemeProvider,
  Button,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Dialog,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Container,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
// import HomeWorkIcon from "@mui/icons-material/HomeWork";
// import CloseIcon from "@mui/icons-material/Close";
import theme from "../../theme/theme";
// import RevenueTable from "./RevenueTable";
// import ExpectedRevenueTable from "./ExpectedRevenueTable";
// import SelectMonthComponent from "../SelectMonthComponent";
// import ExpenseTable from "./ExpenseTable";
// import ExpectedExpenseTable from "./ExpectedExpenseTable";
// import MixedChart from "../Graphs/OwnerCashflowGraph";
// import SelectProperty from "../Leases/SelectProperty";
// import AddRevenueIcon from "../../images/AddRevenueIcon.png";
// import AllOwnerIcon from "../Rent/RentComponents/AllOwnerIcon.png";
import { useUser } from "../../contexts/UserContext"; // Import the UserContext
import Backdrop from "@mui/material/Backdrop";
// import DeleteIcon from "@mui/icons-material/Delete";
// import EditIcon from "@mui/icons-material/Edit";
import CircularProgress from "@mui/material/CircularProgress";
import "../../css/selectMonth.css";

import ManagerCashflowWidget from "../Dashboard-Components/Cashflow/ManagerCashflowWidget";
import ManagerProfitability from "./ManagerProfitability";
import ManagerTransactions from "./ManagerTransactions";
import PaymentsManager from "../Payments/PaymentsManager";
import MakePayment from "./MakePayment";
import AddRevenue from "./AddRevenue";
import AddExpense from "./AddExpense";
import ListsContext from "../../contexts/ListsContext";
import APIConfig from "../../utils/APIConfig";

import axios from "axios";
import { ConstructionOutlined, PersonOff } from "@mui/icons-material";

// import {
//   getTotalRevenueByType,
//   getTotalExpenseByType,
//   fetchCashflow2,
//   getTotalExpenseByMonthYear,
//   getTotalRevenueByMonthYear,
//   getTotalExpectedRevenueByMonthYear,
//   getTotalExpectedExpenseByMonthYear,
//   getPast12MonthsCashflow,
//   getNext12MonthsCashflow,
//   getRevenueList,
//   getExpenseList,
// } from "../Cashflow/CashflowFetchData2";

export default function ManagerCashflow() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, getProfileId } = useUser(); // Access the user object from UserContext

  const profileId = getProfileId();
  const selectedRole = user.selectedRole; // Get the selected role from user object
  const [showSpinner, setShowSpinner] = useState(false);

  const [activeButton, setActiveButton] = useState("Cashflow");

  const { getList, } = useContext(ListsContext);	
	const profitCategories = getList("purchaseType");
  console.log("profit categories - ", profitCategories)

  const [showChart, setShowChart] = useState("Current");

  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear().toString();

  const [month, setMonth] = useState(location.state?.month || currentMonth);
  const [year, setYear] = useState(location.state?.year || currentYear);  
  const cashflowWidgetData = location.state?.cashflowWidgetData;

  const [cashflowData, setCashflowData] = useState(null); // Cashflow data from API

  const [cashflowTransactionsData, setCashflowTransactionsData] = useState(null); // Cashflow data from API

  const [rentsByProperty, setRentsByProperty] = useState([]); //current month
  const [profits, setProfits] = useState([]); //current month
  const [payouts, setPayouts] = useState([]); //current month
  const [cashFlowData, setCashFlowData] = useState([])
  
  const [cashFlowTotal, setCashFlowTotal] = useState({})
  const [profitsTotal, setProfitsTotal] = useState({}); //current month
  const [rentsTotal, setRentsTotal] = useState({}); //current month
  const [payoutsTotal, setPayoutsTotal] = useState({}); //current month
  const [unsortedPayouts, setUnsortedPayouts] = useState([])
  const [unsortedRentsData, setUnsortedRentsData] = useState([])

  const [rentsByPropertyCurrentYear, setRentsByPropertyCurrentYear] = useState([]); //current Year
  const [profitsCurrentYear, setProfitsCurrentYear] = useState([]); //current Year
  const [payoutsCurrentYear, setPayoutsCurrentYear] = useState([]); //current Year

  const [profitsTotalCurrentYear, setProfitsTotalCurrentYear] = useState({}); //current Year
  const [rentsTotalCurrentYear, setRentsTotalCurrentYear] = useState({}); //current Year
  const [payoutsTotalCurrentYear, setPayoutsTotalCurrentYear] = useState({}); //current Year
  const [unsortedPayoutsCurrentYear, setUnsortedPayoutsCurrentYear] = useState([])
  const [unsortedRentsDataCurrentYear, setUnsortedRentsDataCurrentYear] = useState([])
  const [revenueByType, setRevenueByType] = useState({});
  const [expenseByType, setExpenseByType] = useState({});
  const [revenueByTypeForView, setRevenueByTypeForView] = useState({});
  const [expenseByTypeForView, setExpenseByTypeForView] = useState({});
  const [expectedRevenueByType, setExpectedRevenueByType] = useState([]);
  const [expectedExpenseByType, setExpectedExpenseByType] = useState([]);
  const [expectedRevenueByTypeForView, setExpectedRevenueByTypeForView] = useState([]);
  const [expectedExpenseByTypeForView, setExpectedExpenseByTypeForView] = useState([]);
  const [expectedExpenseByMonth, setExpectedExpenseByMonth] = useState([])
  const [totalExpenseByMonth, setTotalExpenseByMonth] = useState([])
  const [expectedRevenueByMonth, setExpectedRevenueByMonth] = useState([])
  const [totalRevenueByMonth, setTotalRevenueByMonth] = useState([])
  const [revenueList, setRevenueList] = useState([])
  const [expenseList, setExpenseList] = useState([])
  const [totalDepositByProperty, setTotalDepositByProperty] = useState([])
  const [totalDeposit, setTotalDeposit] = useState({})
  const [totalDepositByPropertyByMonth, setTotalDepositByPropertyByMonth] = useState([])
  const [totalDepositByMonth, setTotalDepositByMonth] = useState({})
  const [revenueByMonthByType, setRevenueByMonthByType] = useState([])
  const [expenseByMonthByType, setExpenseByMonthByType] = useState([])
  const [revenueDataForManager, setRevenueDataForManager] = useState([]);
  const [view, setView] = useState("profit")

  const [profitabilityData, setProfitabilityData] = useState([]);
  const [transactionsData, setTransactionsData] = useState([]);

  const [currentWindow, setCurrentWindow] = useState(location.state?.currentWindow || "PROFITABILITY");

  const [selectedPayment, setSelectedPayment] = useState(null);

  const [propertyList, setPropertyList] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState("ALL");
  const [getTotalValueByTypeMapping, setGetTotalValueByTypeMapping] = useState({})
  const [getExpectedTotalByTypeMapping, setGetExpectedTotalByTypeMapping] = useState({})
  const [allProfitDataItems, setAllProfitDataItems] = useState([])
  const [getSortedTotalValueByMapping, setGetSortedTotalValueByMapping] = useState({})
  const [getSortedExpectedTotalByMapping, setGetSortedExpectedTotalByMapping] = useState({})
  const [paymentVerificationData, setPaymentVerificationData] = useState([])
  const [paymentVerificationByProperty, setPaymentVerificationByProperty] = useState({})
  const [totalRevenueData, setTotalRevenueData] = useState({})
  const [allCashflowData, setAllCashflowData] = useState([])
  const [totalCashflowValueByType, setTotalCashflowValueByType] = useState({})
  const [expectedCashflowValueByType, setExpectedCashflowValueByType] = useState({})


  //ROHIT - remove this function
  // async function fetchCashflow(userProfileId, month, year) {
  //   setShowSpinner(true);
  //   try {
  //     // const cashflow = await axios.get(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/cashflowByOwner/${userProfileId}/TTM`);
  //     // const cashflow = await axios.get(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/cashflowByOwner/${userProfileId}/TTM`);
  //     // const cashflow = await axios.get(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/cashflow/${userProfileId}/TTM`);
  //     // const cashflow = await axios.get(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/cashflow/110-000003/TTM`);
  //     const cashflow = await axios.get(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/cashflowRevised/${userProfileId}`);
  //     console.log("Manager Cashflow Data: ", cashflow.data);
  //     setShowSpinner(false);
  //     return cashflow.data;
  //   } catch (error) {
  //     console.error("Error fetching cashflow data:", error);
  //     setShowSpinner(false);
  //   }
  // }

  async function fetchCashflowTransactions(userProfileId, month, year) {
    setShowSpinner(true);
    try {

      const cashflow = await axios.get(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/cashflowTransactions/${userProfileId}/payment`);
      console.log("Manager Cashflow Data: ", cashflow.data);
      setShowSpinner(false);
      return cashflow.data;
    } catch (error) {
      console.error("Error fetching cashflow data:", error);
      setShowSpinner(false);
    }
  }

  async function fetchProperties(userProfileId, month, year) {
    setShowSpinner(true);
    try {
      const properties = await axios.get(`https://l0h6a9zi1e.execute-api.us-west-1.amazonaws.com/dev/properties/${userProfileId}`);
      // console.log("Manager Properties: ", properties.data);
      setShowSpinner(false);
      return properties.data;
    } catch (error) {
      console.error("Error fetching properties data:", error);
      setShowSpinner(false);
    }
  }

  async function fecthPaymentVerification(profileId){
    try{
      const res = await axios.get(`${APIConfig.baseURL.dev}/paymentVerification/${getProfileId()}`);
      // return res.data.result;
      setPaymentVerificationData(res.data.result);

      console.log(" res data - ", res.data.result)

      const groupedByProperty = groupDataByKey(res.data.result, "pur_property_id");
      setPaymentVerificationByProperty(groupedByProperty);

      refreshCashFlowAfterVerified()

      console.log(" after refreshcashflow data - ", groupedByProperty)

      return res.data.result
    }catch(error){
      console.error("Error fetching properties data:", error);
    }
  }

  // useEffect(() => {
  //   console.log("ROHIT - currentWindow - ", currentWindow);
  // }, [currentWindow]);

  useEffect(() => {
    // console.log("cashflowData - ", cashflowData);
  }, [cashflowData]);

  useEffect(() => {
    // console.log("propertyList - ", propertyList);
  }, [propertyList]);

  useEffect(() => {
    // console.log("ManagerCashflow - selectedProperty - ", selectedProperty);
  }, [selectedProperty]);

  useEffect(() => {
    console.log("ROHIT - cashflowTransactionsData - ", cashflowTransactionsData);
  }, [cashflowTransactionsData]);
  

  //   useEffect(() => {
  //     console.log("rentsByProperty - ", rentsByProperty);
  //   }, [rentsByProperty]);

  //   useEffect(() => {
  //     console.log("profits - ", profits);
  //   }, [profits]);
  //   useEffect(() => {
  //     console.log("payouts - ", payouts);
  //   }, [payouts]);
  const groupDataByKey = (data, key) => {
    // console.log("ROHIT - data - ", data);
    const groupedByKey = {};

    data?.forEach(payment => {
        const dataKey = payment[key];
        if(!groupedByKey[dataKey]){
            groupedByKey[dataKey] = [];
        }
        groupedByKey[dataKey].push(payment)
    })

    return groupedByKey;
}

  useEffect(() => {
    // fetchCashflow(profileId)
    //   .then((data) => {
    //     setCashflowData(data);
    //     setProfitabilityData(data?.Profit);
    //     setTransactionsData(data?.Transactions);
    //     // let currentMonthYearRevenueExpected = get
    //   })
    //   .catch((error) => {
    //     console.error("Error fetching cashflow data:", error);
    //   });

      fetchCashflowTransactions(profileId)
      .then((data) => {        
        setCashflowTransactionsData(data);
        setCashflowData(data);
        // setProfitabilityData(data?.Profit);
        // setTransactionsData(data?.Transactions);
        // let currentMonthYearRevenueExpected = get
      })
      .catch((error) => {
        console.error("Error fetching cashflow data:", error);
      });

    

    fetchProperties(profileId)
      .then((data) => {
        setPropertyList(data?.Property?.result);
      })
      .catch((error) => {
        console.error("Error fetching PropertyList:", error);
      });


      fecthPaymentVerification(getProfileId())
      .then((data) => {
        console.log("successfully fetch payment verification")
        // setPaymentVerificationData(data);

        // const groupedByProperty = groupDataByKey(data, "pur_property_id");
        // setPaymentVerificationByProperty(groupedByProperty);

      }).catch((error) => {
        console.error("Error fetching payment verification:", error);
      })

  }, []);

  const refreshCashflowData = () => {
    // fetchCashflow(profileId)
    //   .then((data) => {
    //     setCashflowData(data);
    //     setProfitabilityData(data?.Profit);
    //     setTransactionsData(data?.Transactions);
    //     // let currentMonthYearRevenueExpected = get
    //   })
    //   .catch((error) => {
    //     console.error("Error fetching cashflow data:", error);
    //   });
    fetchCashflowTransactions(profileId)
      .then((data) => {
        
        setCashflowTransactionsData(data); 
               
      })
      .catch((error) => {
        console.error("Error fetching cashflow transactions data:", error);
      });
  };

  const refreshCashFlowAfterVerified = () => {
    fetchCashflowTransactions(profileId)
      .then((data) => {        
        setCashflowTransactionsData(data);
        setCashflowData(data);
        // setProfitabilityData(data?.Profit);
        // setTransactionsData(data?.Transactions);
        // let currentMonthYearRevenueExpected = get
      })
      .catch((error) => {
        console.error("Error fetching cashflow data:", error);
      });
  }

  const getTotalRevenueByType = (data, month, year, expected) => {
    // console.log(data, month, year)
  
    var key = "total_paid";
  
    if (expected === true) {
      key = "pur_amount_due";
    } else {
      key = "total_paid";
    }
  
    let revenueItems = data
    let totalRent = revenueItems?.reduce((acc, revenue) => {
      if (revenue[key] !== null && revenue.purchase_type.toUpperCase() === "RENT") {
        // console.log("revenue", revenue[key])
        // console.log("acc", acc)
        return acc + parseFloat(revenue[key]);
      }
      return acc;
    }, 0.0);
    let totalDeposits = revenueItems?.reduce((acc, revenue) => {
      if (revenue[key] !== null && revenue.purchase_type.toUpperCase() === "DEPOSIT") {
        return acc + parseFloat(revenue[key]);
      }
      return acc;
    }, 0.0);
    let totalExtraCharges = revenueItems?.reduce((acc, revenue) => {
      if (revenue[key] !== null && revenue.purchase_type.toUpperCase() === "EXTRA CHARGE") {
        return acc + parseFloat(revenue[key]);
      }
      return acc;
    }, 0.0);
    let totalUtilities = revenueItems?.reduce((acc, revenue) => {
      if (revenue[key] !== null && revenue.purchase_type.toUpperCase() === "UTILITIES") {
        return acc + parseFloat(revenue[key]);
      }
      return acc;
    }, 0.0);
    let totalLateFee = revenueItems?.reduce((acc, revenue) => {
      if (revenue[key] !== null && revenue.purchase_type.toUpperCase() === "LATE FEE") {
        return acc + parseFloat(revenue[key]);
      }
      return acc;
    }, 0.0);
    let totalMaintenance = revenueItems?.reduce((acc, revenue) => {
      if (revenue[key] !== null && revenue.purchase_type.toUpperCase() === "MAINTENANCE") {
        return acc + parseFloat(revenue[key]);
      }
      return acc;
    }, 0.0);
    let totalRepairs = revenueItems?.reduce((acc, revenue) => {
      if (revenue[key] !== null && revenue.purchase_type.toUpperCase() === "REPAIRS") {
        return acc + parseFloat(revenue[key]);
      }
      return acc;
    }, 0.0);
  
    let totalOther = revenueItems?.reduce((acc, revenue) => {
      if (revenue[key] !== null && revenue.purchase_type.toUpperCase() === "OTHER") {
        return acc + parseFloat(revenue[key]);
      }
      return acc;
    }, 0.0);
  
    return {
      RENT: totalRent,
      DEPOSIT: totalDeposits,
      "EXTRA CHARGE": totalExtraCharges,
      UTILITIES: totalUtilities,
      "LATE FEE": totalLateFee,
      MAINTENANCE: totalMaintenance,
      REPAIRS: totalRepairs,
      OTHER: totalOther
    };
  }

  const getTotalExpenseByType = (data, month, year, expected) => {
    
  
    var key = "total_paid";
  
    if (expected === true) {
      key = "pur_amount_due";
    } else {
      key = "total_paid";
    }
  
    let expenseItems = data;
  
    let totalMaintenance = expenseItems?.reduce((acc, expense) => {
      if (expense[key] !== null && expense.purchase_type.toUpperCase() === "MAINTENANCE") {
        return acc + parseFloat(expense[key]);
      }
      return acc;
    }, 0.0);
  
    let totalRepairs = expenseItems?.reduce((acc, expense) => {
      if (expense[key] !== null && expense.purchase_type.toUpperCase() === "REPAIRS") {
        return acc + parseFloat(expense[key]);
      }
      return acc;
    }, 0.0);
  
    let totalMortgage = expenseItems?.reduce((acc, expense) => {
      if (expense[key] !== null && expense.purchase_type.toUpperCase() === "MORTGAGE") {
        return acc + parseFloat(expense[key]);
      }
      return acc;
    }, 0.0);
  
    let totalTaxes = expenseItems?.reduce((acc, expense) => {
      if (expense[key] !== null && expense.purchase_type.toUpperCase() === "TAXES") {
        return acc + parseFloat(expense[key]);
      }
      return acc;
    }, 0.0);
  
    let totalInsurance = expenseItems?.reduce((acc, expense) => {
      if (expense[key] !== null && expense.purchase_type.toUpperCase() === "INSURANCE") {
        return acc + parseFloat(expense[key]);
      }
      return acc;
    }, 0.0);
  
    let totalUtilities = expenseItems?.reduce((acc, expense) => {
      if (expense[key] !== null && expense.purchase_type.toUpperCase() === "UTILITIES") {
        return acc + parseFloat(expense[key]);
      }
      return acc;
    }, 0.0);
  
    let totalManagement = expenseItems?.reduce((acc, expense) => {
      if (expense[key] !== null && expense.purchase_type.toUpperCase() === "MANAGEMENT") {
        return acc + parseFloat(expense[key]);
      }
      return acc;
    }, 0.0);
  
    let totalBillPosting = expenseItems?.reduce((acc, expense) => {
      if (expense[key] !== null && expense.purchase_type.toUpperCase() === "BILL POSTING") {
        return acc + parseFloat(expense[key]);
      }
      return acc;
    }, 0.0);
  
    let totalOther = expenseItems?.reduce((acc, expense) => {
      if (expense[key] !== null && expense.purchase_type.toUpperCase() === "OTHER") {
        return acc + parseFloat(expense[key]);
      }
      return acc;
    }, 0.0);
  
    console.log("inside expense mapping - ", totalMaintenance)
    return {
      MAINTENANCE: totalMaintenance,
      REPAIRS: totalRepairs,
      MORTGAGE: totalMortgage,
      TAXES: totalTaxes,
      INSURANCE: totalInsurance,
      UTILITIES: totalUtilities,
      MANAGEMENT: totalManagement,
      "BILL POSTING": totalBillPosting,
      OTHER : totalOther
    };
  }

  const getRevenueByType = (data, month, year, expected) => {
    // console.log(data, month, year)
  
    var key = "total_paid";
  
    if (expected === true) {
      key = "pur_amount_due";
    } else {
      key = "total_paid";
    }
  
    let revenueItems = data?.filter((item) => item.pur_receiver === profileId && item.cf_month === month && item.cf_year === year && item.purchase_type.toUpperCase() !== "DEPOSIT");

    let totals = {};
    profitCategories.forEach(category => {
    
      totals[category.list_item.toUpperCase()] = 0.0; 
    });

    revenueItems?.forEach(item => {
      const purchaseType = item.purchase_type.toUpperCase();
      
      if (item[key] !== null && totals.hasOwnProperty(purchaseType)) {
        totals[purchaseType] += parseFloat(item[key]);
      }else if(item[key] !== null ){
        totals["OTHER"] += parseFloat(item[key])
      }
    });

    const sortedTotals = Object.fromEntries(
      Object.entries(totals).sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    );

    return sortedTotals

    // let totalRent = revenueItems?.reduce((acc, revenue) => {
    //   if (revenue[key] !== null && revenue.purchase_type.toUpperCase() === "RENT") {
    //     // console.log("revenue", revenue[key])
    //     // console.log("acc", acc)
    //     return acc + parseFloat(revenue[key]);
    //   }
    //   return acc;
    // }, 0.0);
    // let totalDeposits = revenueItems?.reduce((acc, revenue) => {
    //   if (revenue[key] !== null && revenue.purchase_type.toUpperCase() === "DEPOSIT") {
    //     return acc + parseFloat(revenue[key]);
    //   }
    //   return acc;
    // }, 0.0);
    // let totalExtraCharges = revenueItems?.reduce((acc, revenue) => {
    //   if (revenue[key] !== null && revenue.purchase_type.toUpperCase() === "EXTRA CHARGE") {
    //     return acc + parseFloat(revenue[key]);
    //   }
    //   return acc;
    // }, 0.0);
    // let totalUtilities = revenueItems?.reduce((acc, revenue) => {
    //   if (revenue[key] !== null && revenue.purchase_type.toUpperCase() === "UTILITIES") {
    //     return acc + parseFloat(revenue[key]);
    //   }
    //   return acc;
    // }, 0.0);
    // let totalLateFee = revenueItems?.reduce((acc, revenue) => {
    //   if (revenue[key] !== null && revenue.purchase_type.toUpperCase() === "LATE FEE") {
    //     return acc + parseFloat(revenue[key]);
    //   }
    //   return acc;
    // }, 0.0);
    // let totalMaintenance = revenueItems?.reduce((acc, revenue) => {
    //   if (revenue[key] !== null && revenue.purchase_type.toUpperCase() === "MAINTENANCE") {
    //     return acc + parseFloat(revenue[key]);
    //   }
    //   return acc;
    // }, 0.0);
    // let totalRepairs = revenueItems?.reduce((acc, revenue) => {
    //   if (revenue[key] !== null && revenue.purchase_type.toUpperCase() === "REPAIRS") {
    //     return acc + parseFloat(revenue[key]);
    //   }
    //   return acc;
    // }, 0.0);
  
    // let totalOther = revenueItems?.reduce((acc, revenue) => {
    //   if (revenue[key] !== null && revenue.purchase_type.toUpperCase() === "OTHER") {
    //     return acc + parseFloat(revenue[key]);
    //   }
    //   return acc;
    // }, 0.0);
  
    // return {
    //   RENT: totalRent,
    //   DEPOSIT: totalDeposits,
    //   "EXTRA CHARGE": totalExtraCharges,
    //   UTILITIES: totalUtilities,
    //   "LATE FEE": totalLateFee,
    //   MAINTENANCE: totalMaintenance,
    //   REPAIRS: totalRepairs,
    //   OTHER: totalOther
    // };
  }

  const getExpenseByType = (data, month, year, expected) => {
    
  
    var key = "total_paid";
  
    if (expected === true) {
      key = "pur_amount_due";
    } else {
      key = "total_paid";
    }
  
    let expenseItems = data?.filter((item) => item.pur_payer === profileId && item.cf_month === month && item.cf_year === year && item.purchase_type.toUpperCase() !== "DEPOSIT");
  
    
    let totals = {};
    profitCategories.forEach(category => {
    
      totals[category.list_item.toUpperCase()] = 0.0; 
    });

    expenseItems?.forEach(item => {
      const purchaseType = item.purchase_type.toUpperCase();
      
      if (item[key] !== null && totals.hasOwnProperty(purchaseType)) {
        totals[purchaseType] += parseFloat(item[key]);
      }else if(item[key] !== null ){
        totals["OTHER"] += parseFloat(item[key])
      }
    });

    const sortedTotals = Object.fromEntries(
      Object.entries(totals).sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    );

    return sortedTotals
    // let totalMaintenance = expenseItems?.reduce((acc, expense) => {
    //   if (expense[key] !== null && expense.purchase_type.toUpperCase() === "MAINTENANCE") {
    //     return acc + parseFloat(expense[key]);
    //   }
    //   return acc;
    // }, 0.0);
  
    // let totalRepairs = expenseItems?.reduce((acc, expense) => {
    //   if (expense[key] !== null && expense.purchase_type.toUpperCase() === "REPAIRS") {
    //     return acc + parseFloat(expense[key]);
    //   }
    //   return acc;
    // }, 0.0);
  
    // let totalMortgage = expenseItems?.reduce((acc, expense) => {
    //   if (expense[key] !== null && expense.purchase_type.toUpperCase() === "MORTGAGE") {
    //     return acc + parseFloat(expense[key]);
    //   }
    //   return acc;
    // }, 0.0);
  
    // let totalTaxes = expenseItems?.reduce((acc, expense) => {
    //   if (expense[key] !== null && expense.purchase_type.toUpperCase() === "TAXES") {
    //     return acc + parseFloat(expense[key]);
    //   }
    //   return acc;
    // }, 0.0);
  
    // let totalInsurance = expenseItems?.reduce((acc, expense) => {
    //   if (expense[key] !== null && expense.purchase_type.toUpperCase() === "INSURANCE") {
    //     return acc + parseFloat(expense[key]);
    //   }
    //   return acc;
    // }, 0.0);
  
    // let totalUtilities = expenseItems?.reduce((acc, expense) => {
    //   if (expense[key] !== null && expense.purchase_type.toUpperCase() === "UTILITIES") {
    //     return acc + parseFloat(expense[key]);
    //   }
    //   return acc;
    // }, 0.0);
  
    // let totalManagement = expenseItems?.reduce((acc, expense) => {
    //   if (expense[key] !== null && expense.purchase_type.toUpperCase() === "MANAGEMENT") {
    //     return acc + parseFloat(expense[key]);
    //   }
    //   return acc;
    // }, 0.0);
  
    // let totalBillPosting = expenseItems?.reduce((acc, expense) => {
    //   if (expense[key] !== null && expense.purchase_type.toUpperCase() === "BILL POSTING") {
    //     return acc + parseFloat(expense[key]);
    //   }
    //   return acc;
    // }, 0.0);
  
    // let totalOther = expenseItems?.reduce((acc, expense) => {
    //   if (expense[key] !== null && expense.purchase_type.toUpperCase() === "OTHER") {
    //     return acc + parseFloat(expense[key]);
    //   }
    //   return acc;
    // }, 0.0);
  
    // console.log("inside expense mapping - ", totalMaintenance)
    // return {
    //   MAINTENANCE: totalMaintenance,
    //   REPAIRS: totalRepairs,
    //   MORTGAGE: totalMortgage,
    //   TAXES: totalTaxes,
    //   INSURANCE: totalInsurance,
    //   UTILITIES: totalUtilities,
    //   MANAGEMENT: totalManagement,
    //   "BILL POSTING": totalBillPosting,
    //   OTHER : totalOther
    // };
  }

  const getTotalByType = (data, month, year, expected, sorting) => {
    var key = expected === true ? "pur_amount_due" : "total_paid";
  
    let items = data;
  
    let totals = {};
    profitCategories.forEach(category => {
    
      totals[category.list_item.toUpperCase()] = 0.0; 
    });

    items?.forEach(item => {
      const purchaseType = item.purchase_type.toUpperCase();
      
      if (item[key] !== null && totals.hasOwnProperty(purchaseType)) {
        totals[purchaseType] += parseFloat(item[key]);
      }else if(item[key] !== null ){
        totals["OTHER"] += parseFloat(item[key])
      }
    });

    let sortedTotals;

    if(sorting){
      const priority = ["RENT", "LATE FEE", "EXTRA CHARGE", "DEPOSIT"];

      sortedTotals = Object.fromEntries(
        Object.entries(totals).sort(([keyA], [keyB]) => {
          const indexA = priority.indexOf(keyA);
          const indexB = priority.indexOf(keyB);

          if (indexA !== -1 && indexB !== -1) {
            // Both keys are in priority list, maintain their relative order
            return indexA - indexB;
          } else if (indexA !== -1) {
            // keyA is in priority, keyB is not
            return -1;
          } else if (indexB !== -1) {
            // keyB is in priority, keyA is not
            return 1;
          } else {
            // Both keys are not in priority, sort alphabetically
            return keyA.localeCompare(keyB);
          }
        })
      );

    }else{
      sortedTotals = Object.fromEntries(
        Object.entries(totals).sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      );
    }


  
    return sortedTotals;
    // Revenue and Expense Calculations
    // let totalRent = items?.reduce((acc, item) => {
    //   if (item[key] !== null && item.purchase_type.toUpperCase() === "RENT") {
    //     return acc + parseFloat(item[key]);
    //   }
    //   return acc;
    // }, 0.0);
  
    // let totalDeposits = items?.reduce((acc, item) => {
    //   if (item[key] !== null && item.purchase_type.toUpperCase() === "DEPOSIT") {
    //     return acc + parseFloat(item[key]);
    //   }
    //   return acc;
    // }, 0.0);
  
    // let totalExtraCharges = items?.reduce((acc, item) => {
    //   if (item[key] !== null && item.purchase_type.toUpperCase() === "EXTRA CHARGE") {
    //     return acc + parseFloat(item[key]);
    //   }
    //   return acc;
    // }, 0.0);
  
    // let totalUtilities = items?.reduce((acc, item) => {
    //   if (item[key] !== null && item.purchase_type.toUpperCase() === "UTILITIES") {
    //     return acc + parseFloat(item[key]);
    //   }
    //   return acc;
    // }, 0.0);
  
    // let totalLateFee = items?.reduce((acc, item) => {
    //   if (item[key] !== null && item.purchase_type.toUpperCase() === "LATE FEE") {
    //     return acc + parseFloat(item[key]);
    //   }
    //   return acc;
    // }, 0.0);
  
    // let totalMaintenance = items?.reduce((acc, item) => {
    //   if (item[key] !== null && item.purchase_type.toUpperCase() === "MAINTENANCE") {
    //     return acc + parseFloat(item[key]);
    //   }
    //   return acc;
    // }, 0.0);
  
    // let totalRepairs = items?.reduce((acc, item) => {
    //   if (item[key] !== null && item.purchase_type.toUpperCase() === "REPAIRS") {
    //     return acc + parseFloat(item[key]);
    //   }
    //   return acc;
    // }, 0.0);
  
    // let totalMortgage = items?.reduce((acc, item) => {
    //   if (item[key] !== null && item.purchase_type.toUpperCase() === "MORTGAGE") {
    //     return acc + parseFloat(item[key]);
    //   }
    //   return acc;
    // }, 0.0);
  
    // let totalTaxes = items?.reduce((acc, item) => {
    //   if (item[key] !== null && item.purchase_type.toUpperCase() === "TAXES") {
    //     return acc + parseFloat(item[key]);
    //   }
    //   return acc;
    // }, 0.0);
  
    // let totalInsurance = items?.reduce((acc, item) => {
    //   if (item[key] !== null && item.purchase_type.toUpperCase() === "INSURANCE") {
    //     return acc + parseFloat(item[key]);
    //   }
    //   return acc;
    // }, 0.0);
  
    // let totalManagement = items?.reduce((acc, item) => {
    //   if (item[key] !== null && item.purchase_type.toUpperCase() === "MANAGEMENT") {
    //     return acc + parseFloat(item[key]);
    //   }
    //   return acc;
    // }, 0.0);
  
    // let totalBillPosting = items?.reduce((acc, item) => {
    //   if (item[key] !== null && item.purchase_type.toUpperCase() === "BILL POSTING") {
    //     return acc + parseFloat(item[key]);
    //   }
    //   return acc;
    // }, 0.0);
  
    // let totalOther = items?.reduce((acc, item) => {
    //   if (item[key] !== null && item.purchase_type.toUpperCase() === "OTHER") {
    //     return acc + parseFloat(item[key]);
    //   }
    //   return acc;
    // }, 0.0);
  
    // return {
    //   RENT: totalRent,
    //   DEPOSIT: totalDeposits,
    //   "EXTRA CHARGE": totalExtraCharges,
    //   UTILITIES: totalUtilities,
    //   "LATE FEE": totalLateFee,
    //   MAINTENANCE: totalMaintenance,
    //   REPAIRS: totalRepairs,
    //   MORTGAGE: totalMortgage,
    //   TAXES: totalTaxes,
    //   INSURANCE: totalInsurance,
    //   MANAGEMENT: totalManagement,
    //   "BILL POSTING": totalBillPosting,
    //   OTHER: totalOther
    // };
  };

  function getTotalRevenueByMonthYear(data, month, year) {
    // console.log("In getTotalRevenueByMonthYear: ", data, month, year);
    let revenueItems = data?.filter((item) => item.cf_month === month && item.cf_year === year && item.pur_receiver === profileId && item.purchase_type.toUpperCase() !== "DEPOSIT");
    // console.log("After filter revenueItems: ", revenueItems);
    let totalRevenue = revenueItems?.reduce((acc, item) => {
      return acc + parseFloat(item["total_paid"] ? item["total_paid"] : 0.0);
    }, 0.0);
    // console.log("Cashflow Fetch Data total Revenue: ", totalRevenue);
    return totalRevenue;
  }

  function getTotalExpenseByMonthYear(data, month, year) {
    let expenseItems = data?.filter((item) => item.cf_month === month && item.cf_year === year && item.pur_payer === profileId && item.purchase_type.toUpperCase() !== "DEPOSIT");
    let totalExpense = expenseItems?.reduce((acc, item) => {
      return acc + parseFloat(item["total_paid"] ? item["total_paid"] : 0.0);
    }, 0.0);
    return totalExpense;
  }

  function getTotalExpectedRevenueByMonthYear(data, month, year) {
    // console.log("In getTotalExpectedRevenueByMonthYear: ", data, month, year);
    let revenueItems = data?.filter((item) => item.cf_month === month && item.cf_year === year && item.pur_receiver === profileId && item.purchase_type.toUpperCase() !== "DEPOSIT");
    let totalRevenue = revenueItems?.reduce((acc, item) => {
      return acc + parseFloat(item["pur_amount_due"] ? item["pur_amount_due"] : 0.0);
    }, 0.0);
    return totalRevenue;
  }

  function getTotalExpectedExpenseByMonthYear(data, month, year) {
    // console.log(data)
    let expenseItems = data?.filter((item) => item.cf_month === month && item.cf_year === year && item.pur_payer === profileId && item.purchase_type.toUpperCase() !== "DEPOSIT");
    let totalExpense = expenseItems?.reduce((acc, item) => {
      return acc + parseFloat(item["pur_amount_due"] ? item["pur_amount_due"] : 0.0);
    }, 0.0);
    return totalExpense;
  }
  
  useEffect(() => {
    //PROFITS
    const allProfitData = cashflowData?.result;
    let filteredProfitData = [];
    if (selectedProperty === "ALL") {
      filteredProfitData = allProfitData;
      // console.log("filteredProfitData - ", filteredProfitData);
    } else {
      filteredProfitData = allProfitData?.filter((item) => item.pur_property_id === selectedProperty);
      // console.log("filteredProfitData - ", filteredProfitData);
    }
    
    // const profitDatacurrentMonth = filteredProfitData;
    const profitDatacurrentMonth = filteredProfitData?.filter((item) => item.cf_month === month && item.cf_year === year); 
    const profitDataCurrentYear = filteredProfitData?.filter((item) => item.cf_year === year);

    // console.table("226 - profitDatacurrentMonth - ", profitDatacurrentMonth)
    
    // const rentDataCurrentMonth = profitDatacurrentMonth?.filter((item) => item.pur_payer?.startsWith("350") && item.pur_receiver?.startsWith("600"));
    const rentDataCurrentMonth = profitDatacurrentMonth?.filter((item) => item.pur_receiver === profileId);
    const rentDataCurrentYear = profitDataCurrentYear?.filter((item) => item.pur_receiver === profileId);

    
    const payoutsCurrentMonth = profitDatacurrentMonth?.filter((item) => item.pur_payer === profileId);
    const payoutsCurrentYear = profitDataCurrentYear?.filter((item) => item.pur_payer === profileId);

    const revenueDataForManager = profitDataCurrentYear?.filter((item) => item.pur_payer === profileId || item.pur_receiver === profileId)
    // setRevenueDataForManager(revenueDataForManager);
    const revenueList = rentDataCurrentMonth?.filter((item) => item.purchase_type.toUpperCase() !== "DEPOSIT")

    setRevenueList(revenueList)
    setExpenseList(payoutsCurrentMonth)


    // expense by property
    const payoutsByProperty = payoutsCurrentMonth?.reduce((acc, item) => {
      if (item.purchase_type.toUpperCase() !== "DEPOSIT") {
      
        const propertyUID = item.pur_property_id;
        const propertyInfo = {
          property_id: item.pur_property_id,
          property_address: item.property_address,
          property_unit: item.property_unit,
        };
  
        const totalExpected = parseFloat(item.pur_amount_due?item.pur_amount_due : 0.00) || 0;
        const totalActual = parseFloat(item.total_paid) || 0;
  
        if (!acc[propertyUID]) {
          // acc[propertyUID] = [];
          acc[propertyUID] = {
            propertyInfo: propertyInfo,
            payoutItems: [],
            totalExpected: 0,
            totalActual: 0,
          };
        }
  
        acc[propertyUID].payoutItems.push(item);
        acc[propertyUID].totalExpected += totalExpected;
        acc[propertyUID].totalActual += totalActual;
      }

      return acc;
    }, {});

    // setPayouts(payoutsByProperty);
    
    setUnsortedPayouts(payoutsByProperty)

    const totalPayouts = payoutsByProperty
      ? Object.values(payoutsByProperty).reduce(
          (acc, property) => {
            acc.totalExpected += property.totalExpected;
            acc.totalActual += property.totalActual;
            return acc;
          },
          { totalExpected: 0, totalActual: 0 }
        )
      : { totalExpected: 0, totalActual: 0 };

    setPayoutsTotal(totalPayouts);
    

    const rentsDataByProperty = rentDataCurrentMonth?.reduce((acc, item) => {
      if (item.purchase_type.toUpperCase() !== "DEPOSIT") {

        const propertyUID = item.pur_property_id;
        const propertyInfo = {
          property_id: item.pur_property_id,
          property_address: item.property_address,
          property_unit: item.property_unit,
        };
        
        const totalExpected = parseFloat(item.pur_amount_due?item.pur_amount_due : 0.00) || 0;
        const totalActual = parseFloat(item.total_paid) || 0;;

        // if(item.pur_payer.startsWith("110")){
          
        // }
  
        if (!acc[propertyUID]) {
          // acc[propertyUID] = [];
          acc[propertyUID] = {
            propertyInfo: propertyInfo,
            rentItems: [],
            totalExpected: 0,
            totalActual: 0,
          };
        }
  
        acc[propertyUID].rentItems.push(item);
        acc[propertyUID].totalExpected += totalExpected;
        acc[propertyUID].totalActual += totalActual;
      }

      return acc;
    }, {});

    // console.log("rents data by property - ", rentsDataByProperty)

    setUnsortedRentsData(rentsDataByProperty)

    const totalRents = rentsDataByProperty
      ? Object.values(rentsDataByProperty).reduce(
          (acc, property) => {
            acc.totalExpected += property.totalExpected;
            acc.totalActual += property.totalActual;
            return acc;
          },
          { totalExpected: 0, totalActual: 0 }
        )
      : { totalExpected: 0, totalActual: 0 };

    setRentsTotal(totalRents);


    // By month 
    // for revenue by month
    const rentsDataByPropertyCurrentYear = rentDataCurrentYear?.reduce((acc, item) => {
      const month = item.cf_month;
      const year = item.cf_year;
      const monthYearKey = `${month}`;
    
      const propertyUID = item.pur_property_id;
      const propertyInfo = {
        property_id: item.pur_property_id,
        property_address: item.property_address,
        property_unit: item.property_unit,
      };
    
      const expectedProfit = parseFloat(item.pur_amount_due?item.pur_amount_due : 0.00) || 0;
      const actualProfit = parseFloat(item.total_paid) || 0;
    
      // Initialize month entry if not present
      if (!acc[monthYearKey]) {
        acc[monthYearKey] = {
          month: month,
          year: year,
          totalExpectedProfit: 0,
          totalActualProfit: 0,
          properties: {},
        };
      }
    
      // Initialize property entry within the month if not present
      if (!acc[monthYearKey].properties[propertyUID]) {
        acc[monthYearKey].properties[propertyUID] = {
          propertyInfo: propertyInfo,
          expectedProfit: 0,
          actualProfit: 0,
          profitItems: [],
        };
      }
    
      // Add the current item to the appropriate property under the month
      acc[monthYearKey].properties[propertyUID].profitItems.push(item);
    
      // Update the total profits for the property
      acc[monthYearKey].properties[propertyUID].expectedProfit += expectedProfit;
      acc[monthYearKey].properties[propertyUID].actualProfit += actualProfit;
    
      // Update the total profits for the month
      acc[monthYearKey].totalExpectedProfit += expectedProfit;
      acc[monthYearKey].totalActualProfit += actualProfit;
    
      return acc;
    }, {});

    setUnsortedRentsDataCurrentYear(rentsDataByPropertyCurrentYear)

    const totalRentsCurrentYear = rentsDataByPropertyCurrentYear
      ? Object.values(rentsDataByPropertyCurrentYear).reduce(
        (acc, property) => {
          acc.totalExpected += property.totalExpectedProfit;
          acc.totalActual += property.totalActualProfit;
          return acc;
        },
        { totalExpected: 0, totalActual: 0 }
      )
    : { totalExpected: 0, totalActual: 0 };
          
    setRentsTotalCurrentYear(totalRentsCurrentYear);

    // expense by months
    const payoutsByPropertyCurrentYear = payoutsCurrentYear?.reduce((acc, item) => {
      
      const month = item.cf_month;
      const year = item.cf_year;
      const monthYearKey = `${month}`;
    
      const propertyUID = item.pur_property_id;
      const propertyInfo = {
        property_id: item.pur_property_id,
        property_address: item.property_address,
        property_unit: item.property_unit,
      };
    
      const expectedProfit = parseFloat(item.pur_amount_due?item.pur_amount_due : 0.00) || 0;
      const actualProfit = parseFloat(item.total_paid) || 0;
    
      // Initialize month entry if not present
      if (!acc[monthYearKey]) {
        acc[monthYearKey] = {
          month: month,
          year: year,
          totalExpectedProfit: 0,
          totalActualProfit: 0,
          properties: {},
        };
      }
    
      // Initialize property entry within the month if not present
      if (!acc[monthYearKey].properties[propertyUID]) {
        acc[monthYearKey].properties[propertyUID] = {
          propertyInfo: propertyInfo,
          expectedProfit: 0,
          actualProfit: 0,
          profitItems: [],
        };
      }
    
      // Add the current item to the appropriate property under the month
      acc[monthYearKey].properties[propertyUID].profitItems.push(item);
    
      // Update the total profits for the property
      acc[monthYearKey].properties[propertyUID].expectedProfit += expectedProfit;
      acc[monthYearKey].properties[propertyUID].actualProfit += actualProfit;
    
      // Update the total profits for the month
      acc[monthYearKey].totalExpectedProfit += expectedProfit;
      acc[monthYearKey].totalActualProfit += actualProfit;
    
      return acc;
    }, {})

    setUnsortedPayoutsCurrentYear(payoutsByPropertyCurrentYear)

    const totalPayoutsCurrentYear = payoutsByPropertyCurrentYear
      ? Object.values(payoutsByPropertyCurrentYear).reduce(
          (acc, property) => {
            acc.totalExpected += property.totalExpectedProfit;
            acc.totalActual += property.totalActualProfit;
            return acc;
          },
          { totalExpected: 0, totalActual: 0 }
        )
      : { totalExpected: 0, totalActual: 0 };

    setPayoutsTotalCurrentYear(totalPayoutsCurrentYear);



    // mapping revenue
    let revenueMapping = getTotalRevenueByType(rentDataCurrentMonth, month, year, false);
    let expectedRevenueMapping = getTotalRevenueByType(rentDataCurrentMonth, month, year, true);
    setRevenueByType(revenueMapping)
    setExpectedRevenueByType(expectedRevenueMapping)
    
    // mapping expense
    let expenseMapping = getTotalExpenseByType(payoutsCurrentMonth, month, year, false);
    let expectedExpenseMapping = getTotalExpenseByType(payoutsCurrentMonth, month, year, true);
    setExpenseByType(expenseMapping)
    setExpectedExpenseByType(expectedExpenseMapping)

    // console.log("revenue by type - ", revenueMapping, " expense by type - ", expenseMapping)


    //for type page ---- 

    let revenueByType = getRevenueByType(rentDataCurrentMonth, month, year, false)
    let expectedRevenueByType = getRevenueByType(rentDataCurrentMonth, month, year, true)
    setRevenueByTypeForView(revenueByType)
    setExpectedRevenueByTypeForView(expectedRevenueByType)

    let expenseByType = getExpenseByType(payoutsCurrentMonth, month, year, false);
    let expectedExpenseByType = getExpenseByType(payoutsCurrentMonth, month, year, true);
    setExpenseByTypeForView(expenseByType)
    setExpectedExpenseByTypeForView(expectedExpenseByType)

    let totalExpenseByMonth = getTotalExpenseByMonthYear(payoutsCurrentMonth, month, year)
    let totalRevenueByMonth = getTotalRevenueByMonthYear(rentDataCurrentMonth, month, year)

    let expectedExpenseByMonth = getTotalExpectedExpenseByMonthYear(payoutsCurrentMonth, month, year)
    let expectedRevenueByMonth = getTotalExpectedRevenueByMonthYear(rentDataCurrentMonth, month, year)
    setTotalExpenseByMonth(totalExpenseByMonth)
    setTotalRevenueByMonth(totalRevenueByMonth)
    setExpectedExpenseByMonth(expectedExpenseByMonth)
    setExpectedRevenueByMonth(expectedRevenueByMonth)
    // const revenueByMonth = rentDataCurrentYear?.reduce((acc, item) => {
    //   if (item.cf_year !== year) {
    //     return acc;
    //   }
    
    //   const monthKey = item.cf_month; // Use the month as the key
    //   const totalExpected = parseFloat(item.pur_amount_due) || 0;
    //   const totalActual = parseFloat(item.total_paid) || 0;
    
    //   if (!acc[monthKey]) {
    //     acc[monthKey] = {
    //       revenueItems: [],
    //       RevenueByType: {},
    //       expectedRevenueByType: {},
    //       totalExpected: 0,
    //       totalActual: 0,
    //     };
    //   }
    
    //   acc[monthKey].revenueItems.push(item);
    //   acc[monthKey].totalExpected += totalExpected;
    //   acc[monthKey].totalActual += totalActual;
    
    //   return acc;
    // }, {});
    
    // // Now process each month's revenue
    // Object.keys(revenueByMonth).forEach((monthKey) => {
    //   const monthData = revenueByMonth[monthKey];
    //   const revenueItems = monthData.revenueItems;
    
    //   const RevenueByType = getTotalRevenueByType(revenueItems, month, year, false);
    //   const expectedRevenueByType = getTotalRevenueByType(revenueItems, month, year, true);
    
    //   revenueByMonth[monthKey].RevenueByType = RevenueByType;
    //   revenueByMonth[monthKey].expectedRevenueByType = expectedRevenueByType;
    // });
    
    // setRevenueByMonthByType(revenueByMonth);

    // const expenseByMonth = payoutsCurrentYear?.reduce((acc, item) => {
    //   const monthKey = item.cf_month; // Use the month as the key
    //   const totalExpected = parseFloat(item.pur_amount_due) || 0;
    //   const totalActual = parseFloat(item.total_paid) || 0;
    
    //   if (!acc[monthKey]) {
    //     acc[monthKey] = {
    //       expenseItems: [],
    //       ExpenseByType: {},
    //       expectedExpenseByType: {},
    //       totalExpected: 0,
    //       totalActual: 0,
    //     };
    //   }
    
    //   acc[monthKey].expenseItems.push(item);
    //   acc[monthKey].totalExpected += totalExpected;
    //   acc[monthKey].totalActual += totalActual;
    
    //   return acc;
    // }, {});
    
    // // Now process each month's expenses
    // Object.keys(expenseByMonth).forEach((monthKey) => {
    //   const monthData = expenseByMonth[monthKey];
    //   const expenseItems = monthData.expenseItems;
    
    //   const ExpenseByType = getTotalExpenseByType(expenseItems, month, year, false);
    //   const expectedExpenseByType = getTotalExpenseByType(expenseItems, month, year, true);
    
    //   expenseByMonth[monthKey].ExpenseByType = ExpenseByType;
    //   expenseByMonth[monthKey].expectedExpenseByType = expectedExpenseByType;
    // });

    // setExpenseByMonthByType(expenseByMonth)

    // console.log("revenue by month by type - ", revenueByMonth, "expense by minth by type - ", expenseByMonth)


    // for all deposits
    const totalDepositsByProperty = rentDataCurrentYear?.reduce((acc, item) => {
      if (item.purchase_type === "Deposit") {
        const propertyUID = item.pur_property_id;
        const propertyInfo = {
          property_id: item.pur_property_id,
          property_address: item.property_address,
          property_unit: item.property_unit,
        };
  
        const totalExpected = parseFloat(item.pur_amount_due?item.pur_amount_due : 0.00) || 0;
        const totalActual = parseFloat(item.total_paid) || 0;
  
        if (!acc[propertyUID]) {
          // acc[propertyUID] = [];
          acc[propertyUID] = {
            propertyInfo: propertyInfo,
            rentItems: [],
            totalExpected: 0,
            totalActual: 0,
          };
        }
  
        acc[propertyUID].rentItems.push(item);
        acc[propertyUID].totalExpected += totalExpected;
        acc[propertyUID].totalActual += totalActual;
      }

      return acc;
    }, {});

    setTotalDepositByProperty(totalDepositsByProperty)

    const totalDeposits = totalDepositsByProperty
      ? Object.values(totalDepositsByProperty).reduce(
          (acc, property) => {
            acc.totalExpected += property.totalExpected;
            acc.totalActual += property.totalActual;
            return acc;
          },
          { totalExpected: 0, totalActual: 0 }
        )
      : { totalExpected: 0, totalActual: 0 };

    setTotalDeposit(totalDeposits)

    // console.log(" total deposits - ", totalDeposits, " deposits by property - ", totalDepositsByProperty)
    const totalDepositsByPropertyByMonth = rentDataCurrentMonth?.reduce((acc, item) => {
      if (item.purchase_type === "Deposit") {
        const propertyUID = item.pur_property_id;
        const propertyInfo = {
          property_id: item.pur_property_id,
          property_address: item.property_address,
          property_unit: item.property_unit,
        };
  
        const totalExpected = parseFloat(item.pur_amount_due?item.pur_amount_due : 0.00) || 0;
        const totalActual = parseFloat(item.total_paid) || 0;
  
        if (!acc[propertyUID]) {
          // acc[propertyUID] = [];
          acc[propertyUID] = {
            propertyInfo: propertyInfo,
            rentItems: [],
            totalExpected: 0,
            totalActual: 0,
          };
        }
  
        acc[propertyUID].rentItems.push(item);
        acc[propertyUID].totalExpected += totalExpected;
        acc[propertyUID].totalActual += totalActual;
      }

      return acc;
    }, {});

    setTotalDepositByPropertyByMonth(totalDepositsByPropertyByMonth)

    const totalDepositsByMonth = totalDepositsByPropertyByMonth
      ? Object.values(totalDepositsByPropertyByMonth).reduce(
          (acc, property) => {
            acc.totalExpected += property.totalExpected;
            acc.totalActual += property.totalActual;
            return acc;
          },
          { totalExpected: 0, totalActual: 0 }
        )
      : { totalExpected: 0, totalActual: 0 };

    setTotalDepositByMonth(totalDepositsByMonth)



    //For unverified
    const dataListForUnverified = revenueDataForManager?.filter((item) => item.verified === "unverified");

    console.log("dataList for unverified - ", dataListForUnverified)
    const result = {};

    dataListForUnverified?.forEach(data => {
      const paymentDetails = JSON.parse(data.payment_ids);

      paymentDetails.forEach(payment => {
        const key = `${data.pur_payer}${payment.payment_date}${payment.payment_intent}`;
        const payAmount = parseFloat(payment.pay_amount);

        if (!result[key]) {
          result[key] = {
            transactions: [],
            total_paid: 0
          };
        }

        result[key].transactions.push(data);
        result[key].total_paid += payAmount;
      });
    });

    console.log("result mapping for unverified - ", result);
  
    const finalListForUnverified = [];

    dataListForUnverified?.forEach(data => {
      const paymentDetails = JSON.parse(data.payment_ids);

      // Iterate over each payment inside payment_ids array
      paymentDetails.forEach(payment => {
        const key = `${data.pur_payer}${payment.payment_date}${payment.payment_intent}`;

        // Create a new object for each payment item
        const newObject = {
          ...payment,                     // Spread all the fields from payment_ids item
          total_paid: result[key].total_paid,   // Add total_paid from the result
          pur_payer: data.pur_payer,            // Add pur_payer from the parent data
          pur_property_id: data.pur_property_id, // Add pur_property_id from the parent data
          pur_group: data.pur_group,
          cf_month : data.cf_month,
          cf_year : data.cf_year,
          purchase_type: data.purchase_type,
          items: [data]                         // Add the parent data into an array named 'items'
        };

        // Push the newly created object into the final list
        finalListForUnverified.push(newObject);
      });
    });

    console.log(" DataForUnverified - ", finalListForUnverified)

    const filteredItems = finalListForUnverified.filter(data => {
      
      return data.items.some(item => {
        return item.pur_payer.startsWith("350") && item.verified === "unverified";
      });
    });

    const DataForUnverified = filteredItems?.filter((item) => item.payment_verify === "Unverified")

    // setPaymentVerificationData(DataForUnverified);

    const groupedByProperty = groupDataByKey(DataForUnverified, "pur_property_id");
    // setPaymentVerificationByProperty(groupedByProperty);



    // Manager revenue
    const revenueDataForManagerByProperty = revenueDataForManager?.reduce((acc, item) => {
      const propertyUID = item.pur_property_id;
      const propertyInfo = {
        property_id: item.pur_property_id,
        property_address: item.property_address,
        property_unit: item.property_unit,
      };
      
      // const totalExpected = parseFloat(item.pur_amount_due) || 0;
      // const totalActual = parseFloat(item.total_paid) || 0;
      let totalExpected =  0;
      let totalActual = 0;

      if(item.cf_month === month && item.cf_year === year && item.purchase_type !== "Deposit"){

        if (item.pur_payer.startsWith("110")) {
          totalActual = parseFloat(item.total_paid) || 0;
          totalExpected = parseFloat(item.pur_amount_due?item.pur_amount_due : 0.00) || 0;
        } else {
          totalActual = 0;
          totalExpected = 0
        }
      
        // if (item.pur_payer.startsWith("600")) {
        //   totalExpected = -(parseFloat(item.pur_amount_due) || 0);
        // } else {
        //   totalExpected = parseFloat(item.pur_amount_due) || 0;
        // }
      }
      
    

      if (!acc[propertyUID]) {
        // acc[propertyUID] = [];
        acc[propertyUID] = {
          propertyInfo: propertyInfo,
          rentItems: [],
          totalExpected: 0,
          totalActual: 0,
          payments : groupedByProperty[propertyUID],
        };
      }

      acc[propertyUID].rentItems.push(item);
      acc[propertyUID].totalExpected += totalExpected;
      acc[propertyUID].totalActual += totalActual;

      return acc;
    }, {});

    setRevenueDataForManager(revenueDataForManagerByProperty)

    const totalrevenueData = revenueDataForManagerByProperty
    ? Object.values(revenueDataForManagerByProperty).reduce(
        (acc, property) => {
          acc.totalExpected += property.totalExpected;
          acc.totalActual += property.totalActual;
          return acc;
        },
        { totalExpected: 0, totalActual: 0 }
      )
    : { totalExpected: 0, totalActual: 0 };

      
    setTotalRevenueData(totalrevenueData)


   
    // console.log("final result for unverified - ", DataForUnverified);

    console.log("revenue data for manager by property - ", revenueDataForManagerByProperty)

  }, [month, year, cashflowData, selectedProperty]);

  useEffect(() => {
    
    if(unsortedPayouts && unsortedRentsData){
      
      // sort payouts

      const payoutsArray = Object.entries(unsortedPayouts);
      const sortedPayoutsArray = payoutsArray.sort((a, b) => {
        return a[0]?.localeCompare(b[0]);  // a[0] and b[0] represent propertyUID keys
      });

      const sortedPayoutsByProperty = Object.fromEntries(sortedPayoutsArray);
      setPayouts(sortedPayoutsByProperty);


      // sort rent data

      const rentArray = Object.entries(unsortedRentsData);

      const sortedRentArray = rentArray.sort((a, b) => {
        return a[0]?.localeCompare(b[0]);  // a[0] and b[0] represent propertyUID keys
      });

      const sortedRentData = Object.fromEntries(sortedRentArray);
      setRentsByProperty(sortedRentData)


      const [profitDataByProperty, allProfitData] = calculateProfitsByProperty(unsortedRentsData, unsortedPayouts);

      const profitData = Object.entries(profitDataByProperty);
      const sortedProfitData = profitData.sort((a, b) => {
        return a[0]?.localeCompare(b[0]);  // a[0] and b[0] represent propertyUID keys
      });

      const sortedProfitByProperty = Object.fromEntries(sortedProfitData);
      setProfits(sortedProfitByProperty);

      const getTotalValueByType = getTotalByType(allProfitData, month, year, false, false)
      const getExpectedTotalByType = getTotalByType(allProfitData, month, year, true, false)
      setGetExpectedTotalByTypeMapping(getExpectedTotalByType)
      setGetTotalValueByTypeMapping(getTotalValueByType)
      setAllProfitDataItems(allProfitData)

      const sortedTotalValueByType = getTotalByType(allProfitData, month, year, false, true)
      const sortedExpectedByType = getTotalByType(allProfitData, month, year, true, true)
      setGetSortedTotalValueByMapping(sortedTotalValueByType)
      setGetSortedExpectedTotalByMapping(sortedExpectedByType)


      const totalProfits = Object.values(profitDataByProperty).reduce(
        (acc, property) => {
          acc.totalExpectedProfit += property.expectedProfit;
          acc.totalActualProfit += property.actualProfit;
          return acc;
        },
        { totalExpectedProfit: 0, totalActualProfit: 0 }
      );

      setProfitsTotal(totalProfits);



      const [cashflowDataByProperty, allcashflowData] = calculateCashflowByProperty(unsortedRentsData, unsortedPayouts)

      const cashflowdata = Object.entries(cashflowDataByProperty);
      const sortedcashFlowData = cashflowdata.sort((a, b) => {
        return a[0]?.localeCompare(b[0]);  // a[0] and b[0] represent propertyUID keys
      });

      const sortedCashFlowDataByProperty = Object.fromEntries(sortedcashFlowData);
      setCashFlowData(sortedCashFlowDataByProperty);

      const totalCashflowValueByType = getTotalByType(allcashflowData, month, year, false, false)
      const expectedCashflowTotalByType = getTotalByType(allcashflowData, month, year, true, false)
      setTotalCashflowValueByType(totalCashflowValueByType)
      setExpectedCashflowValueByType(expectedCashflowTotalByType)
      setAllCashflowData(allcashflowData)


      const totalCashFlow = Object.values(cashflowDataByProperty).reduce(
        (acc, property) => {
          acc.totalExpectedProfit += property.expectedProfit;
          acc.totalActualProfit += property.actualProfit;
          return acc;
        },
        { totalExpectedProfit: 0, totalActualProfit: 0 }
      );

      setCashFlowTotal(totalCashFlow);
    }

  }, [unsortedPayouts, unsortedRentsData])

  useEffect(() => {
    if(unsortedPayoutsCurrentYear && unsortedRentsDataCurrentYear){
      const monthOrder = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      
      const payoutsArray = Object.entries(unsortedPayoutsCurrentYear);
      const sortedPayoutsArray = payoutsArray.sort((a, b) => {
        return monthOrder.indexOf(a[0]) - monthOrder.indexOf(b[0]);  // sort base on months
      });

      const sortedPayoutsByProperty = sortedPayoutsArray.map(([month, monthData]) => {
        const sortedProperties = Object.entries(monthData.properties)
          .sort(([uidA], [uidB]) => uidA.localeCompare(uidB));  // Sort by property_uid
        return [month, {
          ...monthData,
          properties: Object.fromEntries(sortedProperties), 
        }];
      });
      setPayoutsCurrentYear(Object.fromEntries(sortedPayoutsByProperty));



      const rentArray = Object.entries(unsortedRentsDataCurrentYear);
      const sortedRentArray = rentArray.sort((a, b) => {
        return monthOrder.indexOf(a[0]) - monthOrder.indexOf(b[0]);  // a[0] and b[0] represent propertyUID keys
      });

      const sortedRentData = sortedRentArray.map(([month, monthData]) => {
        const sortedProperties = Object.entries(monthData.properties)
          .sort(([uidA], [uidB]) => uidA.localeCompare(uidB));  // Sort by property_uid
        return [month, {
          ...monthData,
          properties: Object.fromEntries(sortedProperties),  
        }];
      });
      setRentsByPropertyCurrentYear(Object.fromEntries(sortedRentData))


      const profitDataByProperty = calculateProfitsByMonth(unsortedRentsDataCurrentYear, unsortedPayoutsCurrentYear);

      const profitArray = Object.entries(profitDataByProperty);
      const sortedProfitarray = profitArray.sort((a, b) => {
        return monthOrder.indexOf(a[0]) - monthOrder.indexOf(b[0]);  // sort base on months
      });
      
      const sortedProfitData = sortedProfitarray.map(([month, monthData]) => {
        const sortedProperties = Object.entries(monthData.properties)
          .sort(([uidA], [uidB]) => uidA.localeCompare(uidB));  // Sort by property_uid
        return [month, {
          ...monthData,
          properties: Object.fromEntries(sortedProperties),  
        }];
      });
      setProfitsCurrentYear(Object.fromEntries(sortedProfitData));

      const totalProfits = Object.values(profitDataByProperty).reduce(
        (acc, property) => {
          acc.totalExpectedProfit += property.totalExpectedProfit;
          acc.totalActualProfit += property.totalActualProfit;
          return acc;
        },
        { totalExpectedProfit: 0, totalActualProfit: 0 }
      );

      setProfitsTotalCurrentYear(totalProfits);
    }

  }, [unsortedPayoutsCurrentYear, unsortedRentsDataCurrentYear])

  const calculateProfitsByProperty = (rentsDataByProperty, payoutsByProperty) => {
    // const profitDataByProperty = {};
  
    // Object.keys(rentsDataByProperty).forEach((propertyUID) => {
    //   const rentData = rentsDataByProperty[propertyUID];
    //   const payoutData = payoutsByProperty[propertyUID] || {
    //     totalExpected: 0,
    //     totalActual: 0,
    //     payoutItems: [],
    //   };
  
    //   const totalRentExpected = rentData.totalExpected || 0;
    //   const totalRentActual = rentData.totalActual || 0;
  
    //   const totalPayoutExpected = payoutData.totalExpected || 0;
    //   const totalPayoutActual = payoutData.totalActual || 0;
  
    //   const profitRentItems = rentData.rentItems.filter(
    //     (item) => parseFloat(item.pur_amount_due) > 0 || parseFloat(item.total_paid) > 0
    //   );
  
    //   const profitPayoutItems = payoutData.payoutItems.filter(
    //     (item) => parseFloat(item.pur_amount_due) > 0 || parseFloat(item.total_paid) > 0
    //   );
  
    //   const expectedProfit = totalRentExpected - totalPayoutExpected;
    //   const actualProfit = totalRentActual - totalPayoutActual;

    //   profitDataByProperty[propertyUID] = {
    //     propertyInfo: rentData.propertyInfo,
    //     totalRentExpected,
    //     totalRentActual,
    //     totalPayoutExpected,
    //     totalPayoutActual,
    //     expectedProfit,
    //     actualProfit,
    //     profitItems: [...profitRentItems, ...profitPayoutItems],
    //   };
    // });
  
    // Object.keys(payoutsByProperty).forEach((propertyUID) => {
    //   if (!profitDataByProperty[propertyUID]) {
    //     const payoutData = payoutsByProperty[propertyUID];
    //     const totalPayoutExpected = payoutData.totalExpected || 0;
    //     const totalPayoutActual = payoutData.totalActual || 0;
  
    //     const totalRentExpected = 0;
    //     const totalRentActual = 0;
  
    //     const profitPayoutItems = payoutData.payoutItems.filter(
    //       (item) => parseFloat(item.pur_amount_due) > 0 || parseFloat(item.total_paid) > 0
    //     );
  
    //     const expectedProfit = totalRentExpected - totalPayoutExpected;
    //     const actualProfit = totalRentActual - totalPayoutActual;
  
    //     profitDataByProperty[propertyUID] = {
    //       propertyInfo: payoutData.propertyInfo,
    //       totalRentExpected,
    //       totalRentActual,
    //       totalPayoutExpected,
    //       totalPayoutActual,
    //       expectedProfit,
    //       actualProfit,
    //       profitItems: profitPayoutItems,
    //     };
    //   }
    // });
  
    // return profitDataByProperty;
    const profitDataByProperty = {};
    const allProfitItems = [];

    Object.keys(rentsDataByProperty).forEach((propertyUID) => {
      const rentData = rentsDataByProperty[propertyUID];
      const payoutData = payoutsByProperty[propertyUID] || {
        totalExpected: 0,
        totalActual: 0,
        payoutItems: [],
      };

      // const totalRentExpected = rentData.totalExpected || 0;
      // const totalRentActual = rentData.totalActual || 0;
      const totalRentExpected = rentData.rentItems.reduce((total, item) => {
        if (item.pur_payer && item.pur_payer.startsWith("110")) {
          return total + parseFloat(item.pur_amount_due?item.pur_amount_due : 0.00 || 0);
        }
        return total;
      }, 0);

      const totalRentActual = rentData.rentItems.reduce((total, item) => {
        if (item.pur_payer && item.pur_payer.startsWith("110")) {
          return total + parseFloat(item.total_paid || 0);
        }
        return total;
      }, 0);

      const totalPayoutExpected = (payoutData.totalExpected || 0) * -1;
      const totalPayoutActual = (payoutData.totalActual || 0) * -1;

      // Filter rent items
      const profitRentItems = rentData.rentItems.filter(
        (item) => parseFloat(item.pur_amount_due?item.pur_amount_due : 0.00) >= 0 || parseFloat(item.total_paid) >= 0
      );

      // Filter payout items and convert expected/total_paid to negative
      const profitPayoutItems = payoutData.payoutItems
        .filter((item) => parseFloat(item.pur_amount_due?item.pur_amount_due : 0.00) >= 0 || parseFloat(item.total_paid) >= 0)
        .map((item) => ({
          ...item,
          pur_amount_due: (parseFloat(item.pur_amount_due?item.pur_amount_due : 0.00) || 0.00) * -1, // Negative value for expected for display
          total_paid: (parseFloat(item.total_paid) || 0.00) * -1,     
        }));

      // const expectedProfit = totalRentExpected + totalPayoutExpected;
      // const actualProfit = totalRentActual + totalPayoutActual;
      const expectedProfit = totalRentExpected;
      const actualProfit = totalRentActual;
      
      allProfitItems.push(...profitRentItems)
      allProfitItems.push(...profitPayoutItems)

      profitDataByProperty[propertyUID] = {
        propertyInfo: rentData.propertyInfo,
        totalRentExpected,
        totalRentActual,
        totalPayoutExpected,
        totalPayoutActual,
        expectedProfit,
        actualProfit,
        profitItems: [...profitRentItems, ...profitPayoutItems], 
      };
    });

    Object.keys(payoutsByProperty).forEach((propertyUID) => {
      if (!profitDataByProperty[propertyUID]) {
        const payoutData = payoutsByProperty[propertyUID];
        
        const totalPayoutExpected = (payoutData.totalExpected || 0) * -1;
        const totalPayoutActual = (payoutData.totalActual || 0) * -1;

        const totalRentExpected = 0;
        const totalRentActual = 0;

        // Filter payout items and convert expected/total_paid to negative
        const profitPayoutItems = payoutData.payoutItems
          .filter((item) => parseFloat(item.pur_amount_due?item.pur_amount_due : 0.00) >= 0 || parseFloat(item.total_paid) >= 0)
          .map((item) => ({
            ...item,
            pur_amount_due: (parseFloat(item.pur_amount_due?item.pur_amount_due : 0.00) || 0.00) * -1, 
            total_paid: (parseFloat(item.total_paid) || 0.00) * -1,    
          }));

        allProfitItems.push(...profitPayoutItems)

        const expectedProfit = totalRentExpected; 
        // const actualProfit = totalRentActual + totalPayoutActual;
        const actualProfit = totalRentActual;       

        profitDataByProperty[propertyUID] = {
          propertyInfo: payoutData.propertyInfo,
          totalRentExpected,
          totalRentActual,
          totalPayoutExpected,
          totalPayoutActual,
          expectedProfit,
          actualProfit,
          profitItems: profitPayoutItems, 
        };
      }
    });

    console.log("profit data - ", profitDataByProperty)

    return [profitDataByProperty, allProfitItems];
  };

  const calculateCashflowByProperty = (rentsDataByProperty, payoutsByProperty) => {
    // const profitDataByProperty = {};
  
    // Object.keys(rentsDataByProperty).forEach((propertyUID) => {
    //   const rentData = rentsDataByProperty[propertyUID];
    //   const payoutData = payoutsByProperty[propertyUID] || {
    //     totalExpected: 0,
    //     totalActual: 0,
    //     payoutItems: [],
    //   };
  
    //   const totalRentExpected = rentData.totalExpected || 0;
    //   const totalRentActual = rentData.totalActual || 0;
  
    //   const totalPayoutExpected = payoutData.totalExpected || 0;
    //   const totalPayoutActual = payoutData.totalActual || 0;
  
    //   const profitRentItems = rentData.rentItems.filter(
    //     (item) => parseFloat(item.pur_amount_due) > 0 || parseFloat(item.total_paid) > 0
    //   );
  
    //   const profitPayoutItems = payoutData.payoutItems.filter(
    //     (item) => parseFloat(item.pur_amount_due) > 0 || parseFloat(item.total_paid) > 0
    //   );
  
    //   const expectedProfit = totalRentExpected - totalPayoutExpected;
    //   const actualProfit = totalRentActual - totalPayoutActual;

    //   profitDataByProperty[propertyUID] = {
    //     propertyInfo: rentData.propertyInfo,
    //     totalRentExpected,
    //     totalRentActual,
    //     totalPayoutExpected,
    //     totalPayoutActual,
    //     expectedProfit,
    //     actualProfit,
    //     profitItems: [...profitRentItems, ...profitPayoutItems],
    //   };
    // });
  
    // Object.keys(payoutsByProperty).forEach((propertyUID) => {
    //   if (!profitDataByProperty[propertyUID]) {
    //     const payoutData = payoutsByProperty[propertyUID];
    //     const totalPayoutExpected = payoutData.totalExpected || 0;
    //     const totalPayoutActual = payoutData.totalActual || 0;
  
    //     const totalRentExpected = 0;
    //     const totalRentActual = 0;
  
    //     const profitPayoutItems = payoutData.payoutItems.filter(
    //       (item) => parseFloat(item.pur_amount_due) > 0 || parseFloat(item.total_paid) > 0
    //     );
  
    //     const expectedProfit = totalRentExpected - totalPayoutExpected;
    //     const actualProfit = totalRentActual - totalPayoutActual;
  
    //     profitDataByProperty[propertyUID] = {
    //       propertyInfo: payoutData.propertyInfo,
    //       totalRentExpected,
    //       totalRentActual,
    //       totalPayoutExpected,
    //       totalPayoutActual,
    //       expectedProfit,
    //       actualProfit,
    //       profitItems: profitPayoutItems,
    //     };
    //   }
    // });
  
    // return profitDataByProperty;
    const profitDataByProperty = {};
    const allProfitData = [];

    Object.keys(rentsDataByProperty).forEach((propertyUID) => {
      const rentData = rentsDataByProperty[propertyUID];
      const payoutData = payoutsByProperty[propertyUID] || {
        totalExpected: 0,
        totalActual: 0,
        payoutItems: [],
      };

      const totalRentExpected = rentData.totalExpected || 0;
      const totalRentActual = rentData.totalActual || 0;
      // const totalRentActual = rentData.rentItems.reduce((total, item) => {
      //   if (item.pur_payer && item.pur_payer.startsWith("110")) {
      //     return total + parseFloat(item.total_paid || 0);
      //   }
      //   return total;
      // }, 0);

      const totalPayoutExpected = (payoutData.totalExpected || 0) * -1;
      const totalPayoutActual = (payoutData.totalActual || 0) * -1;

      // Filter rent items
      const profitRentItems = rentData.rentItems.filter(
        (item) => parseFloat(item.pur_amount_due?item.pur_amount_due : 0.00) >= 0 || parseFloat(item.total_paid) >= 0
      );

      // Filter payout items and convert expected/total_paid to negative
      const profitPayoutItems = payoutData.payoutItems
        .filter((item) => parseFloat(item.pur_amount_due?item.pur_amount_due : 0.00) >= 0 || parseFloat(item.total_paid) >= 0)
        .map((item) => ({
          ...item,
          pur_amount_due: (parseFloat(item.pur_amount_due?item.pur_amount_due : 0.00) || 0.00) * -1, // Negative value for expected for display
          total_paid: (parseFloat(item.total_paid) || 0.00) * -1,     
        }));

      allProfitData.push(...profitRentItems)
      allProfitData.push(...profitPayoutItems)

      const expectedProfit = totalRentExpected + totalPayoutExpected;
      const actualProfit = totalRentActual + totalPayoutActual;
      // const actualProfit = totalRentActual;

      profitDataByProperty[propertyUID] = {
        propertyInfo: rentData.propertyInfo,
        totalRentExpected,
        totalRentActual,
        totalPayoutExpected,
        totalPayoutActual,
        expectedProfit,
        actualProfit,
        profitItems: [...profitRentItems, ...profitPayoutItems], 
      };
    });

    Object.keys(payoutsByProperty).forEach((propertyUID) => {
      if (!profitDataByProperty[propertyUID]) {
        const payoutData = payoutsByProperty[propertyUID];
        
        const totalPayoutExpected = (payoutData.totalExpected || 0) * -1;
        const totalPayoutActual = (payoutData.totalActual || 0) * -1;

        const totalRentExpected = 0;
        const totalRentActual = 0;

        // Filter payout items and convert expected/total_paid to negative
        const profitPayoutItems = payoutData.payoutItems
          .filter((item) => parseFloat(item.pur_amount_due?item.pur_amount_due : 0.00) >= 0 || parseFloat(item.total_paid) >= 0)
          .map((item) => ({
            ...item,
            pur_amount_due: (parseFloat(item.pur_amount_due?item.pur_amount_due : 0.00) || 0.00) * -1, 
            total_paid: (parseFloat(item.total_paid) || 0.00) * -1,    
          }));

        allProfitData.push(...profitPayoutItems)

        const expectedProfit = totalRentExpected + totalPayoutExpected; 
        const actualProfit = totalRentActual + totalPayoutActual;
        // const actualProfit = totalRentActual;       

        profitDataByProperty[propertyUID] = {
          propertyInfo: payoutData.propertyInfo,
          totalRentExpected,
          totalRentActual,
          totalPayoutExpected,
          totalPayoutActual,
          expectedProfit,
          actualProfit,
          profitItems: profitPayoutItems, 
        };
      }
    });

    console.log("profit data - ", profitDataByProperty)

    return [profitDataByProperty, allProfitData];
  };

  const calculateProfitsByMonth = (rentsDataByMonth, payoutsByMonth) => {
    // const profitDataByMonth = {};
  
    // // Iterate through rent data by month
    // Object.keys(rentsDataByMonth).forEach((monthYearKey) => {
    //   const rentDataForMonth = rentsDataByMonth[monthYearKey];
    //   const payoutDataForMonth = payoutsByMonth[monthYearKey] || {
    //     totalExpectedProfit: 0,
    //     totalActualProfit: 0,
    //     properties: {},
    //   };
  
    //   profitDataByMonth[monthYearKey] = {
    //     month: rentDataForMonth.month,
    //     year: rentDataForMonth.year,
    //     totalExpectedProfit: 0,
    //     totalActualProfit: 0,
    //     properties: {},
    //   };
  
    //   // Process each property within the month
    //   Object.keys(rentDataForMonth.properties).forEach((propertyUID) => {
    //     const rentData = rentDataForMonth.properties[propertyUID];
    //     const payoutData = payoutDataForMonth.properties[propertyUID] || {
    //       expectedProfit: 0,
    //       actualProfit: 0,
    //       profitItems: [],
    //     };
  
    //     const totalRentExpected = rentData.expectedProfit || 0;
    //     const totalRentActual = rentData.actualProfit || 0;
  
    //     const totalPayoutExpected = (payoutData.totalExpected || 0) * -1;
    //     const totalPayoutActual = (payoutData.totalActual || 0) * -1;
  
    //     const profitRentItems = rentData.profitItems.filter(
    //       (item) => parseFloat(item.pur_amount_due) >= 0 || parseFloat(item.total_paid) >= 0
    //     );
  
    //     const profitPayoutItems = payoutData.profitItems.filter(
    //       (item) => parseFloat(item.pur_amount_due) > 0 || parseFloat(item.total_paid) > 0
    //     );
  
    //     const expectedProfit = totalRentExpected - totalPayoutExpected;
    //     const actualProfit = totalRentActual - totalPayoutActual;
  
    //     profitDataByMonth[monthYearKey].properties[propertyUID] = {
    //       propertyInfo: rentData.propertyInfo,
    //       totalRentExpected,
    //       totalRentActual,
    //       totalPayoutExpected,
    //       totalPayoutActual,
    //       expectedProfit,
    //       actualProfit,
    //       profitItems: [...profitRentItems, ...profitPayoutItems],
    //     };
  
    //     // Update the total profits for the month
    //     profitDataByMonth[monthYearKey].totalExpectedProfit += expectedProfit;
    //     profitDataByMonth[monthYearKey].totalActualProfit += actualProfit;
    //   });
  
    //   // Now, process any properties that exist in payouts but not in rents
    //   Object.keys(payoutDataForMonth.properties).forEach((propertyUID) => {
    //     if (!profitDataByMonth[monthYearKey].properties[propertyUID]) {
    //       const payoutData = payoutDataForMonth.properties[propertyUID];
    //       const totalPayoutExpected = payoutData.expectedProfit || 0;
    //       const totalPayoutActual = payoutData.actualProfit || 0;
  
    //       const totalRentExpected = 0;
    //       const totalRentActual = 0;
  
    //       const profitPayoutItems = payoutData.profitItems.filter(
    //         (item) => parseFloat(item.pur_amount_due) > 0 || parseFloat(item.total_paid) > 0
    //       );
  
    //       const expectedProfit = totalRentExpected - totalPayoutExpected;
    //       const actualProfit = totalRentActual - totalPayoutActual;
  
    //       profitDataByMonth[monthYearKey].properties[propertyUID] = {
    //         propertyInfo: payoutData.propertyInfo,
    //         totalRentExpected,
    //         totalRentActual,
    //         totalPayoutExpected,
    //         totalPayoutActual,
    //         expectedProfit,
    //         actualProfit,
    //         profitItems: profitPayoutItems,
    //       };
  
    //       // Update the total profits for the month
    //       profitDataByMonth[monthYearKey].totalExpectedProfit += expectedProfit;
    //       profitDataByMonth[monthYearKey].totalActualProfit += actualProfit;
    //     }
    //   });
    // });
  
    // console.log("profit data By month - ", profitDataByMonth)
    // return profitDataByMonth;

    const profitDataByMonth = {};

    Object.keys(rentsDataByMonth).forEach((monthYearKey) => {
      const rentDataForMonth = rentsDataByMonth[monthYearKey];
      const payoutDataForMonth = payoutsByMonth[monthYearKey] || {
        totalExpectedProfit: 0,
        totalActualProfit: 0,
        properties: {},
      };

      profitDataByMonth[monthYearKey] = {
        month: rentDataForMonth.month,
        year: rentDataForMonth.year,
        totalExpectedProfit: 0,
        totalActualProfit: 0,
        properties: {},
      };

      Object.keys(rentDataForMonth.properties).forEach((propertyUID) => {
        const rentData = rentDataForMonth.properties[propertyUID];
        const payoutData = payoutDataForMonth.properties[propertyUID] || {
          expectedProfit: 0,
          actualProfit: 0,
          profitItems: [],
        };

        const totalRentExpected = rentData.expectedProfit || 0;
        const totalRentActual = rentData.actualProfit || 0;

        const totalPayoutExpected = (payoutData.expectedProfit || 0) * -1;
        const totalPayoutActual = (payoutData.actualProfit || 0) * -1;

        // Filter rent items
        const profitRentItems = rentData.profitItems.filter(
          (item) => parseFloat(item.pur_amount_due?item.pur_amount_due : 0.00) >= 0 || parseFloat(item.total_paid) >= 0
        );

        const profitPayoutItems = payoutData.profitItems
          .filter((item) => parseFloat(item.pur_amount_due?item.pur_amount_due : 0.00) >= 0 || parseFloat(item.total_paid) >= 0)
          .map((item) => ({
            ...item,
            pur_amount_due: (parseFloat(item.pur_amount_due?item.pur_amount_due : 0.00) || 0) * -1,
            total_paid: (parseFloat(item.total_paid) || 0) * -1,
          }));

        const expectedProfit = totalRentExpected + totalPayoutExpected; 
        const actualProfit = totalRentActual + totalPayoutActual;       

        profitDataByMonth[monthYearKey].properties[propertyUID] = {
          propertyInfo: rentData.propertyInfo,
          totalRentExpected,
          totalRentActual,
          totalPayoutExpected,
          totalPayoutActual,
          expectedProfit,
          actualProfit,
          profitItems: [...profitRentItems, ...profitPayoutItems], 
        };

        profitDataByMonth[monthYearKey].totalExpectedProfit += expectedProfit;
        profitDataByMonth[monthYearKey].totalActualProfit += actualProfit;
      });

      Object.keys(payoutDataForMonth.properties).forEach((propertyUID) => {
        if (!profitDataByMonth[monthYearKey].properties[propertyUID]) {
          const payoutData = payoutDataForMonth.properties[propertyUID];
          const totalPayoutExpected = (payoutData.expectedProfit || 0) * -1;
          const totalPayoutActual = (payoutData.actualProfit || 0) * -1;

          const totalRentExpected = 0;
          const totalRentActual = 0;

          const profitPayoutItems = payoutData.profitItems
            .filter((item) => parseFloat(item.pur_amount_due?item.pur_amount_due : 0.00) >= 0 || parseFloat(item.total_paid) >= 0)
            .map((item) => ({
              ...item,
              pur_amount_due: (parseFloat(item.pur_amount_due?item.pur_amount_due : 0.00) || 0) * -1, 
              total_paid: (parseFloat(item.total_paid) || 0) * -1,     
            }));

          const expectedProfit = totalRentExpected + totalPayoutExpected; 
          const actualProfit = totalRentActual + totalPayoutActual;      

          profitDataByMonth[monthYearKey].properties[propertyUID] = {
            propertyInfo: payoutData.propertyInfo,
            totalRentExpected,
            totalRentActual,
            totalPayoutExpected,
            totalPayoutActual,
            expectedProfit,
            actualProfit,
            profitItems: profitPayoutItems,
          };

          profitDataByMonth[monthYearKey].totalExpectedProfit += expectedProfit;
          profitDataByMonth[monthYearKey].totalActualProfit += actualProfit;
        }
      });
    });

    console.log("profit data By month - ", profitDataByMonth);
    return profitDataByMonth;

  };

  // useEffect(() => {
  //     console.log("revenueByType", revenueByType)
  //     console.log("expenseByType", expenseByType)
  // }, [revenueByType, expenseByType])

  return (
    <ThemeProvider theme={theme}>
      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
        <CircularProgress color='inherit' />
      </Backdrop>

      <Container maxWidth='lg' sx={{ paddingTop: "10px", height: "90vh" }}>
        <Grid container spacing={6} sx={{ height: "90%" }}>
          <Grid item xs={12} md={4}>
            <ManagerCashflowWidget
              propsMonth={month}
              propsYear={year}
              setView={setView}
              profitsTotal={profitsTotal}
              rentsTotal={rentsTotal}
              payoutsTotal={payoutsTotal}
              totalDeposit={totalDepositByMonth}
              graphData={cashflowTransactionsData?.result}
              setCurrentWindow={setCurrentWindow}
              propertyList={propertyList}
              selectedProperty={selectedProperty}
              setSelectedProperty={setSelectedProperty}
            />
          </Grid>

          <Grid container item xs={12} md={8} columnSpacing={6}>
            {currentWindow === "PROFITABILITY" && (
              <ManagerProfitability
                propsMonth={month}
                propsYear={year}
                profitsTotal={profitsTotal}
                profits={profits}
                view={view}
                cashFlowData={cashFlowData}
                cashFlowtotal={cashFlowTotal}
                rentsTotal={rentsTotal}
                rentsByProperty={rentsByProperty}
                payoutsTotal={payoutsTotal}
                payouts={payouts}
                
                profitsCurrentYear = {profitsCurrentYear}
                profitsTotalCurrentYear = {profitsTotalCurrentYear}
                rentsTotalCurrentYear = {rentsTotalCurrentYear}
                rentsByPropertyCurrentYear = {rentsByPropertyCurrentYear}
                payoutsCurrentYear = {payoutsCurrentYear}
                payoutsTotalCurrentYear = {payoutsTotalCurrentYear}

                revenueByType={revenueByType}
                expenseByType={expenseByType}
                expectedExpenseByType={expectedExpenseByType}
                expectedRevenueByType={expectedRevenueByType}
                revenueList={revenueList}
                expenseList={expenseList}

                revenueByTypeForView={revenueByTypeForView}
                expenseByTypeForView={expenseByTypeForView}
                expectedRevenueByTypeForView={expectedRevenueByTypeForView}
                expectedExpenseByTypeForView={expectedExpenseByTypeForView}

                revenueByMonthByType={revenueByMonthByType}
                expenseByMonthByType={expenseByMonthByType}
                totalExpenseByMonth={totalExpenseByMonth}
                totalRevenueByMonth={totalRevenueByMonth}
                expectedExpenseByMonth={expectedExpenseByMonth}
                expectedRevenueByMonth={expectedRevenueByMonth}

                getTotalValueByTypeMapping={getTotalValueByTypeMapping}
                getExpectedTotalByTypeMapping={getExpectedTotalByTypeMapping}
                allProfitDataItems={allProfitDataItems}
                getSortedExpectedTotalByMapping={getSortedExpectedTotalByMapping}
                getSortedTotalValueByMapping={getSortedTotalValueByMapping}

                totalCashflowValueByType={totalCashflowValueByType}
                expectedCashflowValueByType={expectedCashflowValueByType}
                allCashflowData={allCashflowData}

                totalDepositByProperty={totalDepositByProperty}
                totalDeposit={totalDeposit}

                revenueDataForManager={revenueDataForManager}
                totalRevenueData={totalRevenueData}

                selectedProperty={selectedProperty}

                fecthPaymentVerification={refreshCashFlowAfterVerified}

                setMonth={setMonth}
                setYear={setYear}

                uid={revenueByType ? revenueByType : expenseByType}
              />
            )}
            {currentWindow === "TRANSACTIONS" && (
              <ManagerTransactions
                propsMonth={month}
                propsYear={year}
                setMonth={setMonth}
                setYear={setYear}
                // transactionsData={transactionsData}
                transactionsData={cashflowTransactionsData}
                setSelectedPayment={setSelectedPayment}
                setCurrentWindow={setCurrentWindow}
                selectedProperty={selectedProperty}
              />
            )}
            {currentWindow === "PAYMENTS" && <PaymentsManager />}
            {currentWindow === "MAKE_PAYMENT" && <MakePayment selectedPayment={selectedPayment} refreshCashflowData={refreshCashflowData} setCurrentWindow={setCurrentWindow} />}
            {currentWindow === "ADD_REVENUE" && <AddRevenue propertyList={propertyList} setCurrentWindow={setCurrentWindow} />}
            {currentWindow === "ADD_EXPENSE" && <AddExpense propertyList={propertyList} setCurrentWindow={setCurrentWindow} />}
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

// This is the function that controls what and how the cashflow data is displayed
function StatementTable(props) {
  console.log("In Statement Table: ", props);
  const navigate = useNavigate();

  const activeView = props.activeView;
  const tableType = props.tableType;

  const month = props.month;
  const year = props.year;

  const categoryTotalMapping = props.categoryTotalMapping;
  const allItems = props.allItems;

  const categoryExpectedTotalMapping = props.categoryExpectedTotalMapping;
  const allExpectedItems = [];

  const navigateType = "/edit" + tableType;

  function handleNavigation(type, item) {
    console.log(item);
    navigate(type, { state: { itemToEdit: item, edit: true } });
  }

  // console.log("--debug-- tableType categoryTotalMapping", tableType, categoryTotalMapping)
  // console.log("activeView", activeView)
  // console.log("statement table year/month", year, month)

  function getCategoryCount(category) {
    console.log("getCategoryCount - allItems - ", allItems);
    let items = allItems.filter((item) => item.purchase_type.toUpperCase() === category.toUpperCase() && item.cf_month === month && item.cf_year === year);
    return "(" + items.length + ")";
  }

  function getCategoryItems(category, type) {
    let filteredIitems = allItems.filter((item) => item.purchase_type.toUpperCase() === category.toUpperCase() && item.cf_month === month && item.cf_year === year);
    let items = filteredIitems?.map((item) => ({ ...item, property: JSON.parse(item.property) }));

    console.log("getCategoryItems", items);
    var key = "total_paid";
    if (activeView === "Cashflow") {
      key = "total_paid";
    } else {
      key = "pur_amount_due";
    }
    return (
      <>
        {items.map((item, index) => {
          return activeView === "Cashflow" ? (
            <TableRow key={index} onClick={() => handleNavigation(type, item)}>
              <TableCell></TableCell>
              <TableCell>
                <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
                  {" "}
                  {item.property_address} {item.property_unit}{" "}
                </Typography>
              </TableCell>
              {/* <TableCell>
                <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>${item[key] ? item[key] : 0}</Typography>
              </TableCell> */}
              <TableCell>
                <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
                  ${item["pur_amount_due"] ? item["pur_amount_due"] : 0}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
                  ${item["total_paid"] ? item["total_paid"] : 0}
                </Typography>
              </TableCell>
              {/* <TableCell align="right">
                <DeleteIcon />
              </TableCell> */}
            </TableRow>
          ) : (
            //   <>
            //   <Accordion
            //       sx={{
            //         backgroundColor: theme.palette.custom.pink,
            //         boxShadow: "none",
            //       }}
            //       key={category}
            //     >
            //       <AccordionSummary sx={{ flexDirection: "space-between" }} expandIcon={<ExpandMoreIcon />} onClick={(e) => e.stopPropagation()}>
            //         <TableRow key={index}>
            //           <TableCell>{item.purchase_uid}</TableCell>
            //           <TableCell>{item.pur_property_id}</TableCell>
            //           <TableCell>{item.pur_payer}</TableCell>
            //           <TableCell>
            //             <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
            //               {" "}
            //               {item.property_address} {item.property_unit}{" "}
            //             </Typography>
            //           </TableCell>
            //           <TableCell>{item.pur_notes}</TableCell>
            //           <TableCell>{item.pur_description}</TableCell>
            //           <TableCell>
            //             <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
            //               ${item["pur_amount_due"] ? item["pur_amount_due"] : 0}
            //             </Typography>
            //           </TableCell>
            //           <TableCell>
            //             <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
            //               ${item["total_paid"] ? item["total_paid"] : 0}
            //             </Typography>
            //           </TableCell>
            //           {/* <TableCell align="right">
            //             <EditIcon />
            //           </TableCell> */}
            //         </TableRow>
            //       </AccordionSummary>
            //       <AccordionDetails>
            //           {
            //             item?.property?.map( property => {
            //               return (
            //                 <TableRow>
            //                   <TableCell>
            //                     <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
            //                       {property.property_uid}
            //                     </Typography>
            //                   </TableCell>
            //                   <TableCell>
            //                     <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
            //                       {property.property_address}
            //                     </Typography>
            //                   </TableCell>
            //                   <TableCell>
            //                     <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
            //                       {property.property_unit}
            //                     </Typography>
            //                   </TableCell>
            //                   <TableCell>
            //                     <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
            //                       ${property.individual_purchase[0]?.pur_amount_due? property.individual_purchase[0]?.pur_amount_due : 0}
            //                     </Typography>
            //                   </TableCell>
            //                   <TableCell>
            //                     <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
            //                       ${property.individual_purchase[0]?.total_paid? property.individual_purchase[0]?.total_paid : 0}
            //                     </Typography>
            //                   </TableCell>

            //                 </TableRow>
            //               );
            //             })
            //           }
            //       </AccordionDetails>
            //     </Accordion>

            // </>
            <>
              <TableRow>
                <TableCell>
                  <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight, marginLeft: "25px" }}>Property UID</Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>Property Address</Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>Property Unit</Typography>
                </TableCell>
                <TableCell align='right'>
                  <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>Expected</Typography>
                </TableCell>
                <TableCell align='right'>
                  <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight, marginRight: "25px" }}>Actual</Typography>
                </TableCell>
              </TableRow>

              {item?.property?.map((property) => {
                return (
                  <TableRow sx={{}}>
                    <TableCell>
                      <Typography sx={{ fontSize: theme.typography.smallFont, marginLeft: "25px" }}>{property.property_uid}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: theme.typography.smallFont }}>{property.property_address}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: theme.typography.smallFont }}>{property.property_unit}</Typography>
                    </TableCell>
                    <TableCell align='right'>
                      <Typography sx={{ fontSize: theme.typography.smallFont }}>
                        ${property.individual_purchase[0]?.pur_amount_due ? property.individual_purchase[0]?.pur_amount_due : 0}
                      </Typography>
                    </TableCell>
                    <TableCell align='right'>
                      <Typography sx={{ fontSize: theme.typography.smallFont, marginRight: "25px" }}>
                        ${property.individual_purchase[0]?.total_paid ? property.individual_purchase[0]?.total_paid : 0}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </>
          );
        })}
      </>
    );
  }

  return (
    <>
      {activeView === "Cashflow" ? (
        <>
          {Object.entries(categoryTotalMapping).map(([category, value]) => {
            return (
              <Accordion
                sx={{
                  backgroundColor: theme.palette.custom.pink,
                  boxShadow: "none",
                }}
                key={category}
              >
                <AccordionSummary sx={{ flexDirection: "row-reverse" }} expandIcon={<ExpandMoreIcon />} onClick={(e) => e.stopPropagation()}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
                            {" "}
                            {category} {getCategoryCount(category)}{" "}
                          </Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>${value ? value : 0}</Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>${value ? value : 0}</Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                  </Table>
                </AccordionSummary>
                <AccordionDetails>
                  <Table>
                    <TableBody>{getCategoryItems(category, navigateType)}</TableBody>
                  </Table>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </>
      ) : (
        <>
          {Object.entries(categoryExpectedTotalMapping).map(([category, value]) => {
            return (
              <Accordion
                sx={{
                  backgroundColor: theme.palette.custom.pink,
                  boxShadow: "none",
                }}
                key={category}
              >
                <AccordionSummary sx={{ flexDirection: "space-between" }} expandIcon={<ExpandMoreIcon />} onClick={(e) => e.stopPropagation()}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: "150px" }}>
                          <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
                            {" "}
                            {category} {getCategoryCount(category)}{" "}
                          </Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight, width: "250px" }}>
                            ${value ? value : 0}
                          </Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Typography sx={{ fontSize: theme.typography.smallFont, fontWeight: theme.typography.primary.fontWeight }}>
                            ${categoryTotalMapping[category] ? categoryTotalMapping[category] : 0}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                  </Table>
                </AccordionSummary>
                <AccordionDetails>
                  <Table>
                    <TableBody>{getCategoryItems(category)}</TableBody>
                  </Table>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </>
      )}
    </>
  );
}
