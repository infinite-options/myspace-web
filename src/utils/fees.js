import { getDateAdornmentString } from "./dates";


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

export const getFeesDueBy = (fee) => {
    if (fee.frequency === "Bi-Weekly") {
      return fee.due_by !== ""? biweeklyDueByValuetoDayMap[fee.due_by] : "-";
    } else if (fee.frequency === "Weekly") {
      return fee.due_by !== "" ? weeklyDueByValuetoDayMap[fee.due_by] : "-";
    } else if (fee.frequency === "Monthly" || fee.frequency === "Quarterly" || fee.frequency === "Semi-Monthly") {
      return fee.due_by !== "" ? `${fee.due_by}${getDateAdornmentString(fee.due_by)} of the month` : "-";
    } else if (fee.frequency === "One Time" || fee.frequency === "Annually" || fee.frequency === "Semi-Annually") {
      // return fee.due_by_date !== "" ? `${fee.due_by_date}` : "No Due Date";
      return (fee.due_by_date !== "") ? `${fee.due_by_date}` : "";
    } else{
      return "-";
    }
  };

 export const getFeesLateBy = (fee) => {
    if (fee.frequency === "Bi-Weekly" || fee.frequency === "Weekly" || fee.frequency === "Monthly" || fee.frequency === "Annually" || fee.frequency === "One Time" || fee.frequency === "Semi-Annually" || fee.frequency === "Quarterly" || fee.frequency === "Semi-Monthly") {
      return fee.late_by !== "" ? `${fee.late_by}${getDateAdornmentString(fee.late_by)} day after due` : "-";
    } else {
      return "-";
    }
  };

export const getFeesAvailableToPay = (fee) => {
    if (fee.frequency === "Bi-Weekly" || fee.frequency === "Weekly" || fee.frequency === "Monthly" || fee.frequency === "Annually" || fee.frequency === "One Time" || fee.frequency === "Semi-Annually" || fee.frequency === "Quarterly" || fee.frequency === "Semi-Monthly") {
      return fee.available_topay !== "" ? `${fee.available_topay} days before due` : "-";
    } else {
      return "-";
    }
  };
