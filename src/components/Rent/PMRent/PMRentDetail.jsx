import { Box } from "@mui/system";
import { MainContainer, RentTitle, ViewOptionText, getStatusColor } from "../RentComponents/RentComponents";
import { BackIcon, RentDetailBody, RentDetailNavbarTab } from "../RentComponents/RentDetailComponents";
import { useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
// import axios from "axios";
import { fetchMiddleware as fetch, axiosMiddleware as axios } from "../../../utils/httpMiddleware";
import { useUser } from "../../../contexts/UserContext";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import APIConfig from "../../../utils/APIConfig";

function PMRentDetail(props) {
  // //console.log("in PMRentDetail: ", props);
  const location = useLocation();
  const [index, setIndex] = useState(location.state.index);
  // //console.log("in PMRentDetail Index: ", index);
  const [propertyStatus, setPropertyStatus] = useState(location.state.status);
  // //console.log("in PMRentDetail Status: ", propertyStatus);
  const rentDetailIndexList = location.state.rentDetailIndexList;
  // //console.log("in PMRentDetail rentDetailIndexList - : ", rentDetailIndexList);
  const [showSpinner, setShowSpinner] = useState(false);
  // const rentData = location.state.data;
  // //console.log("in PMRentDetail Rent Data: ", rentData);
  const [propertiesData, setPropertiesData] = useState([]);
  // useEffect(() => {
  //   //console.log("propertiesData - ", propertiesData);
  // }, [propertiesData]);

  const months = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
  };

  const navigate = useNavigate();

  const getProperties = (status) => {
    switch (status) {
      case "UNPAID":
        return propertiesData ? propertiesData.unpaid : [];
      case "PARTIALLY PAID":
        return propertiesData ? propertiesData.partial : [];
      case "PAID LATE":
        return propertiesData ? propertiesData.late : [];
      case "PAID":
        return propertiesData ? propertiesData.paid : [];
      case "VACANT":
        return propertiesData ? propertiesData.vacant : [];
      default:
        return [];
    }
  };
  function incrementIndex() {
    if (index < getProperties(propertyStatus).length - 1) {
      setIndex(index + 1);
    }
  }
  function decrementIndex() {
    if (0 < index) {
      setIndex(index - 1);
    }
  }

  const [rentDetailsData, setRentDetailsData] = useState({});
  const [propertyID, setPropertyID] = useState("");
  const { getProfileId } = useUser();

  useEffect(() => {
    setShowSpinner(true);
    const requestURL = `${APIConfig.baseURL.dev}/rentDetails/${getProfileId()}`;
    // const requestURL = `${APIConfig.baseURL.dev}/rentDetails/600-000003`;
    axios.get(requestURL).then((res) => {
      // //console.log(res.data.RentStatus.result);
      const fetchData = res.data.RentStatus.result;
      //console.log("After fetchData: ", fetchData);

      fetchData.sort((a, b) => {
        const comp1 = b.cf_year - a.cf_year;
        const comp2 = b.cf_month - a.cf_month;
        return comp1 !== 0 ? comp1 : comp2;
      });

      // const filteredData = fetchData.reduce((unique, item) => {
      //   return unique.some(entry => entry.property_uid === item.property_uid) ? unique : [...unique, item];
      // }, []);

      const filteredData = fetchData.filter((data) => rentDetailIndexList.includes(data.rent_detail_index));
      //console.log("filteredData -  ", filteredData);

      const not_paid = [];
      const partial_paid = [];
      const late_paid = [];
      const paid = [];
      const vacant = [];
      for (let i = 0; i < filteredData.length; i++) {
        const data = filteredData[i];
        switch (data.rent_status) {
          case "UNPAID":
            not_paid.push(data);
            break;
          case "PARTIALLY PAID":
            partial_paid.push(data);
            break;
          case "PAID LATE":
            late_paid.push(data);
            break;
          case "PAID":
            paid.push(data);
            break;
          case "VACANT":
            vacant.push(data);
            break;
          default:
            break;
        }
      }
      setPropertiesData({ unpaid: not_paid, partial: partial_paid, late: late_paid, paid: paid, vacant: vacant });
      setRentDetailsData(fetchData);
      //console.log("rentDetailsData: ", rentDetailsData);
      setShowSpinner(false);
    });
  }, []);

  useEffect(() => {
    let property;
    switch (propertyStatus) {
      case "UNPAID":
        property = propertiesData.unpaid;
        break;
      case "PARTIALLY PAID":
        property = propertiesData.partial;
        break;
      case "PAID LATE":
        property = propertiesData.late;
        break;
      case "PAID":
        property = propertiesData.paid;
        break;
      case "VACANT":
        property = propertiesData.vacant;
        break;
      default:
        property = [];
        break;
    }
    if (property?.length > 0) {
      setPropertyID(property[index].property_id);
    }
  }, [propertyStatus, index]);

  // useEffect(() => {
  //   setShowSpinner(true);
  //   const requestURL = `${APIConfig.baseURL.dev}/rentDetails/${getProfileId()}`;
  //   axios.get(requestURL).then((res) => {
  //     // //console.log(res.data.RentStatus.result);
  //     const fetchData = res.data.RentStatus.result;
  //     // //console.log("After fetchData: ", fetchData);
  //     fetchData.sort((a, b) => {
  //       const comp1 = b.cf_year - a.cf_year;
  //       const comp2 = b.cf_month - a.cf_month;
  //       return comp1 !== 0 ? comp1 : comp2;
  //     });
  //     setRentDetailsData(fetchData);
  //     // //console.log("rentDetailsData: ", rentDetailsData);
  //     setShowSpinner(false);
  //   });

  //   let property;
  //   switch (propertyStatus) {
  //     case "UNPAID":
  //       property = rentData.unpaid;
  //       break;
  //     case "PARTIALLY PAID":
  //       property = rentData.partial;
  //       break;
  //     case "PAID LATE":
  //       property = rentData.late;
  //       break;
  //     case "PAID":
  //       property = rentData.paid;
  //       break;
  //     case "VACANT":
  //       property = rentData.vacant;
  //       break;
  //     default:
  //       property = [];
  //       break;
  //   }
  //   //console.log("In PMRentDetail switch: ", property, index);
  //   if (property.length > 0) {
  //     setPropertyID(property[index].property_uid);
  //   }
  //   //console.log("Property ID: ", propertyID);
  // }, [propertyStatus, index, rentData]);

  // //console.log('nav', getProperties(propertyStatus)[index]);
  // //console.log('nav', rentDetailsData, propertyID);
  return (
    <MainContainer>
      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={showSpinner}>
        <CircularProgress color='inherit' />
      </Backdrop>
      <RentTitle>Property Rent 4</RentTitle>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
        onClick={() => {
          navigate("/pmRent");
        }}
      >
        <BackIcon />
        <ViewOptionText>Return to Viewing All Listings</ViewOptionText>
      </Box>
      <Box
        sx={{
          display: "flex",
          marginTop: "10px",
        }}
      >
        <RentDetailNavbarTab
          style={getStatusColor("UNPAID")}
          update={() => {
            setPropertyStatus("UNPAID");
            setIndex(0);
          }}
          title={"Unpaid"}
        />
        <RentDetailNavbarTab
          style={getStatusColor("PARTIALLY PAID")}
          update={() => {
            setPropertyStatus("PARTIALLY PAID");
            setIndex(0);
          }}
          title={"Partially Paid"}
        />
        <RentDetailNavbarTab
          style={getStatusColor("PAID LATE")}
          update={() => {
            setPropertyStatus("PAID LATE");
            setIndex(0);
          }}
          title={"Paid Late"}
        />
        <RentDetailNavbarTab
          style={getStatusColor("PAID")}
          update={() => {
            setPropertyStatus("PAID");
            setIndex(0);
          }}
          title={"Paid"}
        />
        <RentDetailNavbarTab
          style={getStatusColor("VACANT")}
          update={() => {
            setPropertyStatus("VACANT");
            setIndex(0);
          }}
          title={"Vacant"}
        />
      </Box>
      <RentDetailBody data={[rentDetailsData, propertyID, index, propertyStatus, propertiesData]} updator={[decrementIndex, incrementIndex]} methods={[getProperties]} />
    </MainContainer>
  );
}
export default PMRentDetail;
