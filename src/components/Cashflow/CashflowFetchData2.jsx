// import React, { Component, useEffect, useState } from "react";
// import { useUser } from "../../contexts/UserContext";
// import axios from "axios";
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../utils/httpMiddleware";
import APIConfig from "../../utils/APIConfig";

// I want to create several functions that compute the cashflow
// data for the owner.
// I want one function to get all the data from the database
// I want other functions to compute the data for the selected month and year for each filter type.

async function fetchCashflow2(userProfileId, month, year) {
  try {
    // const cashflow = await axios.get(`${APIConfig.baseURL.dev}/cashflowByOwner/${userProfileId}/TTM`);
    // const cashflow = await axios.get(`${APIConfig.baseURL.dev}/cashflowByOwner/${userProfileId}/TTM`);
    // const cashflow = await axios.get(`${APIConfig.baseURL.dev}/cashflow/${userProfileId}/TTM`);
    // const cashflow = await axios.get(`${APIConfig.baseURL.dev}/cashflow/110-000003/TTM`);
    // const cashflow = await axios.get(`${APIConfig.baseURL.dev}/cashflowRevised/${userProfileId}`);
    const cashflow = await axios.get(`${APIConfig.baseURL.dev}/cashflowTransactions/${userProfileId}/new`)

    // //console.log("Endpoint returns: ", cashflow.data);
    return cashflow.data;
  } catch (error) {
    console.error("Error fetching cashflow data:", error);
  }
}

function getDataByProperty(data, propertyUID) {

  // Fetch only data which are related to this propertyUID, also re-calculate expense and revenue 
  // const newData = data?.result?.map((item) => {
  //   const properties = JSON.parse(item.property);

  //   // Filter properties according to UID
  //   const filteredProperties = properties.filter(p => p.property_uid === propertyUID);
    
  //   if (filteredProperties.length === 0) {
  //     return null;
  //   }

  //   // Calculate the total pur_amount_due again for this property only
  //   const totalPurAmountDue = filteredProperties.reduce((acc, property) => {
  //     const individualTotal = property.individual_purchase.reduce(
  //       (sum, purchase) => sum + parseFloat(purchase.pur_amount_due),
  //       0
  //     );
  //     return acc + individualTotal;
  //   }, 0);

  //   // Return the updated item with only this property and recalculated pur_amount_due
  //   return {
  //     ...item,
  //     property: JSON.stringify(filteredProperties),
  //     pur_amount_due: totalPurAmountDue.toFixed(2),
  //   };
  // });

  // // Remove null items which are not contain this property data
  // const filteredData = newData.filter(item => item !== null);

  const filteredData = data?.result?.filter(item => item.pur_property_id === propertyUID)

  return {
    code: data.code,
    message: data.message,
    result: filteredData
  };
}


function getRevenueList(data) {
  // return data.response_revenue.result;
  // //console.log("getRevenueList - data - ", data);
  // //console.log("revenueList - ",data?.result?.filter(item => item.pur_cf_type === "revenue"));
  return data?.result?.filter((item) => item.pur_receiver?.startsWith("110"));
}

function getExpenseList(data) {
  // return data.response_expense.result;
  // //console.log("getExpenseList - data - ", data);
  // //console.log("expenseList - ",data?.result?.filter(item => item.pur_cf_type === "expense"));
  return data?.result?.filter((item) => item.pur_payer?.startsWith("110"));
}

function getPast12MonthsCashflow(data, month, year) {
  var pastTwelveMonths = [];
  let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  var currentMonth = month;
  var currentYear = year;

  // create a loop that goes back 12 months
  for (var i = 0; i < 12; i++) {
    // //console.log(currentMonth, currentYear)

    // let expectedMonthRevenue = getTotalExpectedRevenueByMonthYear(data, currentMonth, currentYear)
    // let expectedMonthExpense = getTotalExpectedExpenseByMonthYear(data, currentMonth, currentYear)
    let expectedMonthRevenue = getTotalExpectedRevenueByMonthYear(data, currentMonth, currentYear)
    let expectedMonthExpense = getTotalExpectedExpenseByMonthYear(data, currentMonth, currentYear)
    let currentMonthRevenue = getTotalRevenueByMonthYear(data, currentMonth, currentYear);
    let currentMonthExpense = getTotalExpenseByMonthYear(data, currentMonth, currentYear);

    // //console.log("currentMonthRevenue", currentMonthRevenue)
    // //console.log("currentMonthExpense", currentMonthExpense)
    // //console.log("expectedMonthRevenue", expectedMonthRevenue)
    // //console.log("expectedMonthExpense", expectedMonthExpense)

    pastTwelveMonths.push({
      month: currentMonth,
      year: currentYear,
      revenue: currentMonthRevenue,
      cashflow: currentMonthRevenue - currentMonthExpense,
      monthYear: currentMonth.slice(0, 3) + " " + currentYear.slice(2, 4),
      // expected_revenue: expectedMonthRevenue,
      // expected_cashflow: expectedMonthRevenue - expectedMonthExpense,
      expectedRevenue: expectedMonthRevenue,
      expectedCashflow: expectedMonthRevenue - expectedMonthExpense,
    });
    if (currentMonth === "January") {
      currentMonth = "December";
      currentYear = (parseInt(currentYear) - 1).toString();
      // //console.log(currentYear)
    } else {
      currentMonth = months[months.indexOf(currentMonth) - 1];
    }
  }
  // //console.log("Past 12 months: ", pastTwelveMonths);

  pastTwelveMonths.reverse();

  return pastTwelveMonths;
}

function getNext12MonthsCashflow(data, month, year) {
  var nextTwelveMonths = [];
  let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var currentMonth = month;
  var currentYear = year;

  // create a loop that goes forward 12 months and if

  for (var i = 0; i < 12; i++) {
    let expectedMonthRevenue = getTotalExpectedRevenueByMonthYear(data, currentMonth, currentYear);
    let expectedMonthExpense = getTotalExpectedExpenseByMonthYear(data, currentMonth, currentYear);
    let currentMonthRevenue = getTotalRevenueByMonthYear(data, currentMonth, currentYear);
    let currentMonthExpense = getTotalExpenseByMonthYear(data, currentMonth, currentYear);

    // //console.log("expectedMonthRevenue", expectedMonthRevenue)
    // //console.log("expectedMonthExpense", expectedMonthExpense)

    nextTwelveMonths.push({
      month: currentMonth,
      year: currentYear,
      revenue: currentMonthRevenue,
      cashflow: currentMonthRevenue - currentMonthExpense,
      monthYear: currentMonth.slice(0, 3) + " " + currentYear.slice(2, 4),
      expectedRevenue: expectedMonthRevenue,
      expectedCashflow: expectedMonthRevenue - expectedMonthExpense,
    });

    if (currentMonth === "December") {
      currentMonth = "January";
      currentYear = (parseInt(currentYear) + 1).toString();
    } else {
      currentMonth = months[months.indexOf(currentMonth) + 1];
    }
  }
  // //console.log(nextTwelveMonths)
  return nextTwelveMonths;
}

function getPast12MonthsExpectedCashflowWidget(data, month, year) {
  // //console.log("In getPast12MonthsExpectedCashflow: ", data, month, year);
  var pastTwelveMonths = [];
  let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  var currentMonth = month;
  var currentYear = year;

  // create a loop that goes back 12 months
  for (var i = 0; i < 12; i++) {
    // //console.log(currentMonth, currentYear)

    let expectedMonthRevenue = getTotalExpectedRevenueByMonthYearWidget(data, currentMonth, currentYear);
    let expectedMonthExpense = getTotalExpectedExpenseByMonthYearWidget(data, currentMonth, currentYear);
    let currentMonthRevenue = getTotalRevenueByMonthYearWidget(data, currentMonth, currentYear);
    let currentMonthExpense = getTotalExpenseByMonthYearWidget(data, currentMonth, currentYear);

    // //console.log("expectedMonthRevenue", expectedMonthRevenue);
    // //console.log("expectedMonthExpense", expectedMonthExpense);
    // //console.log("currentMonthRevenue", currentMonthRevenue);
    // //console.log("currentMonthExpense", currentMonthExpense);

    pastTwelveMonths.push({
      month: currentMonth,
      year: currentYear,
      expected_cashflow: expectedMonthRevenue - expectedMonthExpense,
      cashflow: currentMonthRevenue - currentMonthExpense,

      expected_revenue: expectedMonthRevenue,
      revenue: currentMonthRevenue,
      expected_expense: expectedMonthExpense,
      expense: currentMonthExpense,

      monthYear: currentMonth.slice(0, 3) + " " + currentYear.slice(2, 4),
      // "expected_revenue": expectedMonthRevenue,
      // "expected_cashflow": expectedMonthRevenue - expectedMonthExpense,
    });
    if (currentMonth === "January") {
      currentMonth = "December";
      currentYear = (parseInt(currentYear) - 1).toString();
      // //console.log(currentYear)
    } else {
      currentMonth = months[months.indexOf(currentMonth) - 1];
    }
  }
  // //console.log("Past 12 months: ", pastTwelveMonths);

  pastTwelveMonths.reverse();

  return pastTwelveMonths;
}

function getPast12MonthsExpectedCashflow(data, month, year) {
  // //console.log("In getPast12MonthsExpectedCashflow: ", data, month, year);
  var pastTwelveMonths = [];
  let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  var currentMonth = month;
  var currentYear = year;

  // create a loop that goes back 12 months
  for (var i = 0; i < 12; i++) {
    // //console.log(currentMonth, currentYear)

    let expectedMonthRevenue = getTotalExpectedRevenueByMonthYear(data, currentMonth, currentYear);
    let expectedMonthExpense = getTotalExpectedExpenseByMonthYear(data, currentMonth, currentYear);
    let currentMonthRevenue = getTotalRevenueByMonthYear(data, currentMonth, currentYear);
    let currentMonthExpense = getTotalExpenseByMonthYear(data, currentMonth, currentYear);

    // //console.log("expectedMonthRevenue", expectedMonthRevenue);
    // //console.log("expectedMonthExpense", expectedMonthExpense);
    // //console.log("currentMonthRevenue", currentMonthRevenue);
    // //console.log("currentMonthExpense", currentMonthExpense);

    pastTwelveMonths.push({
      month: currentMonth,
      year: currentYear,
      expected_cashflow: expectedMonthRevenue - expectedMonthExpense,
      cashflow: currentMonthRevenue - currentMonthExpense,

      expected_revenue: expectedMonthRevenue,
      revenue: currentMonthRevenue,
      expected_expense: expectedMonthExpense,
      expense: currentMonthExpense,

      monthYear: currentMonth.slice(0, 3) + " " + currentYear.slice(2, 4),
      // "expected_revenue": expectedMonthRevenue,
      // "expected_cashflow": expectedMonthRevenue - expectedMonthExpense,
    });
    if (currentMonth === "January") {
      currentMonth = "December";
      currentYear = (parseInt(currentYear) - 1).toString();
      // //console.log(currentYear)
    } else {
      currentMonth = months[months.indexOf(currentMonth) - 1];
    }
  }
  // //console.log("Past 12 months: ", pastTwelveMonths);

  pastTwelveMonths.reverse();

  return pastTwelveMonths;
}

function getRevenueByMonth(data) {
  // //console.log("revenue by month", data);
}

function getExpenseByMonth(data) {
  // //console.log("expense by month", data);
}

function revenueCashflowByMonth(data) {
  // //console.log("revenueCashflowByMonth", data);
}

function getExpectedRevenueByType(data, month, year) {
  let revenueItems = data.response_revenue_by_month.result.filter((item) => item.cf_month === month && item.cf_year === year);
  return revenueItems;
}

function getTotalRevenueByType(data, month, year, expected) {
  // //console.log(data, month, year)

  var key = "actual";

  if (expected === true) {
    key = "expected";
  } else {
    key = "actual";
  }

  let revenueItems = data?.result?.filter((item) => item.pur_receiver?.startsWith("110") && item.cf_month === month && item.cf_year === year);
  let totalRent = revenueItems?.reduce((acc, revenue) => {
    if (revenue[key] !== null && revenue.purchase_type.toUpperCase() === "RENT") {
      // //console.log("revenue", revenue[key])
      // //console.log("acc", acc)
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

  let totalRentDueOwner = revenueItems?.reduce((acc, revenue) => {
    if (revenue[key] !== null && revenue.purchase_type.toUpperCase() === "RENT DUE OWNER") {
      return acc + parseFloat(revenue[key]);
    }
    return acc;
  }, 0.0);

  return {
    "RENT" : parseFloat(totalRentDueOwner).toFixed(2),
    DEPOSIT: parseFloat(totalDeposits).toFixed(2),
    "EXTRA CHARGE": parseFloat(totalExtraCharges).toFixed(2),
    UTILITIES: parseFloat(totalUtilities).toFixed(2),
    "LATE FEE": parseFloat(totalLateFee).toFixed(2),
    MAINTENANCE: parseFloat(totalMaintenance).toFixed(2),
    REPAIRS: parseFloat(totalRepairs).toFixed(2),
    OTHER: parseFloat(totalOther).toFixed(2),
  };
}

function getTotalExpenseByType(data, month, year, expected) {
  // //console.log(data, month, year)

  var key = "actual";

  if (expected === true) {
    key = "expected";
  } else {
    key = "actual";
  }

  let expenseItems = data?.result?.filter((item) => item.pur_payer?.startsWith("110") && item.cf_month === month && item.cf_year === year);

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

  return {
    MAINTENANCE: parseFloat(totalMaintenance).toFixed(2),
    REPAIRS: parseFloat(totalRepairs).toFixed(2),
    MORTGAGE: parseFloat(totalMortgage).toFixed(2),
    TAXES: parseFloat(totalTaxes).toFixed(2),
    INSURANCE: parseFloat(totalInsurance).toFixed(2),
    UTILITIES: parseFloat(totalUtilities).toFixed(2),
    MANAGEMENT: parseFloat(totalManagement).toFixed(2),
    "BILL POSTING": parseFloat(totalBillPosting).toFixed(2),
    OTHER : parseFloat(totalOther).toFixed(2),
  };
}

function getTotalRevenueByTypeByProperty(data, month, year, expected, propertyId) {
  // //console.log(data, month, year)

  var key = "actual";

  if (expected === true) {
    key = "expected";
  } else {
    key = "actual";
  }

  let revenueItems = data?.result?.filter((item) => item.pur_receiver?.startsWith("110") && item.cf_month === month && item.cf_year === year && item.pur_property_id === propertyId);
  let totalRent = revenueItems?.reduce((acc, revenue) => {
    if (revenue[key] !== null && revenue.purchase_type.toUpperCase() === "RENT") {
      // //console.log("revenue", revenue[key])
      // //console.log("acc", acc)
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

  let totalRentDueOwner = revenueItems?.reduce((acc, revenue) => {
    if (revenue[key] !== null && revenue.purchase_type.toUpperCase() === "RENT DUE OWNER") {
      return acc + parseFloat(revenue[key]);
    }
    return acc;
  }, 0.0);

  return {
    // RENT: parseFloat(totalRent).toFixed(2),
    "RENT" : parseFloat(totalRentDueOwner).toFixed(2),
    DEPOSIT: parseFloat(totalDeposits).toFixed(2),
    "EXTRA CHARGE": parseFloat(totalExtraCharges).toFixed(2),
    UTILITIES: parseFloat(totalUtilities).toFixed(2),
    "LATE FEE": parseFloat(totalLateFee).toFixed(2),
    MAINTENANCE: parseFloat(totalMaintenance).toFixed(2),
    REPAIRS: parseFloat(totalRepairs).toFixed(2),
    OTHER: parseFloat(totalOther).toFixed(2),
  };
}

function getTotalExpenseByTypeByProperty(data, month, year, expected, propertyId) {
  // //console.log(data, month, year)

  var key = "actual";

  if (expected === true) {
    key = "expected";
  } else {
    key = "actual";
  }

  let expenseItems = data?.result?.filter((item) => item.pur_payer?.startsWith("110") && item.cf_month === month && item.cf_year === year && item.pur_property_id === propertyId);

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

  return {
    MAINTENANCE: parseFloat(totalMaintenance).toFixed(2),
    REPAIRS: parseFloat(totalRepairs).toFixed(2),
    MORTGAGE: parseFloat(totalMortgage).toFixed(2),
    TAXES: parseFloat(totalTaxes).toFixed(2),
    INSURANCE: parseFloat(totalInsurance).toFixed(2),
    UTILITIES: parseFloat(totalUtilities).toFixed(2),
    MANAGEMENT: parseFloat(totalManagement).toFixed(2),
    "BILL POSTING": parseFloat(totalBillPosting).toFixed(2),
    OTHER : parseFloat(totalOther).toFixed(2),
  };
}

function getTotalRevenueByMonthYearWidget(data, month, year){
  let revenueItems = data?.result?.filter((item) => item.cf_month === month && item.cf_year === year && item.pur_cf_type === "revenue");
  // //console.log("After filter revenueItems: ", revenueItems);
  let totalRevenue = revenueItems?.reduce((acc, item) => {
    return acc + parseFloat(item["total_paid"] ? item["total_paid"] : 0.0);
  }, 0.0);
  // //console.log("Cashflow Fetch Data total Revenue: ", totalRevenue);
  return totalRevenue;
}

function getTotalRevenueByMonthYear(data, month, year) {
  // //console.log("In getTotalRevenueByMonthYear: ", data, month, year);
  let revenueItems = data?.result?.filter((item) => item.cf_month === month && item.cf_year === year && item.pur_receiver?.startsWith("110"));
  // //console.log("After filter revenueItems: ", revenueItems);
  let totalRevenue = revenueItems?.reduce((acc, item) => {
    return acc + parseFloat(item["actual"] ? item["actual"] : 0.0);
  }, 0.0);
  // //console.log("Cashflow Fetch Data total Revenue: ", totalRevenue);
  return totalRevenue;
}

function getTotalExpenseByMonthYearWidget(data, month, year){
  let expenseItems = data?.result?.filter((item) => item.cf_month === month && item.cf_year === year && item.pur_cf_type === "expense");
  let totalExpense = expenseItems?.reduce((acc, item) => {
    return acc + parseFloat(item["total_paid"] ? item["total_paid"] : 0.0);
  }, 0.0);
  return totalExpense;
}

function getTotalExpenseByMonthYear(data, month, year) {
  let expenseItems = data?.result?.filter((item) => item.cf_month === month && item.cf_year === year && item.pur_payer?.startsWith("110"));
  let totalExpense = expenseItems?.reduce((acc, item) => {
    return acc + parseFloat(item["actual"] ? item["actual"] : 0.0);
  }, 0.0);
  return totalExpense;
}

function getTotalExpectedRevenueByMonthYearWidget(data, month, year){
  let revenueItems = data?.result?.filter((item) => item.cf_month === month && item.cf_year === year && item.pur_cf_type === "revenue");
  let totalRevenue = revenueItems?.reduce((acc, item) => {
    return acc + parseFloat(item["pur_amount_due"] ? item["pur_amount_due"] : 0.0);
  }, 0.0);
  return totalRevenue;
}

function getTotalExpectedRevenueByMonthYear(data, month, year) {
  // //console.log("In getTotalExpectedRevenueByMonthYear: ", data, month, year);
  let revenueItems = data?.result?.filter((item) => item.cf_month === month && item.cf_year === year && item.pur_receiver?.startsWith("110"));
  let totalRevenue = revenueItems?.reduce((acc, item) => {
    return acc + parseFloat(item["expected"] ? item["expected"] : 0.0);
  }, 0.0);
  return totalRevenue;
}

function getTotalExpectedExpenseByMonthYearWidget(data, month, year){
  let expenseItems = data?.result?.filter((item) => item.cf_month === month && item.cf_year === year && item.pur_cf_type === "expense");
  let totalExpense = expenseItems?.reduce((acc, item) => {
    return acc + parseFloat(item["pur_amount_due"] ? item["pur_amount_due"] : 0.0);
  }, 0.0);
  return totalExpense;
}

function getTotalExpectedExpenseByMonthYear(data, month, year) {
  // //console.log(data)
  let expenseItems = data?.result?.filter((item) => item.cf_month === month && item.cf_year === year && item.pur_payer?.startsWith("110"));
  let totalExpense = expenseItems?.reduce((acc, item) => {
    return acc + parseFloat(item["expected"] ? item["expected"] : 0.0);
  }, 0.0);
  return totalExpense;
}

export {
  getTotalRevenueByType,
  getTotalExpenseByType,
  getPast12MonthsCashflow,
  getPast12MonthsExpectedCashflow,
  revenueCashflowByMonth,
  getRevenueList,
  getExpenseList,
  fetchCashflow2,
  getTotalRevenueByMonthYear,
  getTotalExpenseByMonthYear,
  getRevenueByMonth,
  getExpenseByMonth,
  getTotalExpectedRevenueByMonthYear,
  getTotalExpectedExpenseByMonthYear,
  getNext12MonthsCashflow,
  getDataByProperty,
  getTotalExpectedExpenseByMonthYearWidget,
  getTotalExpenseByMonthYearWidget,
  getTotalExpectedRevenueByMonthYearWidget,
  getTotalRevenueByMonthYearWidget,
  getPast12MonthsExpectedCashflowWidget,
  getTotalExpenseByTypeByProperty,
  getTotalRevenueByTypeByProperty
};
