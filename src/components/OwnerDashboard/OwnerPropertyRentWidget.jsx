import { PieChart, Pie, Legend, Cell, ResponsiveContainer } from "recharts";
import { Chart } from "react-google-charts";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Grid, List, ListItem, Typography } from "@mui/material";
import { useUser } from "../../contexts/UserContext.jsx";
import useMediaQuery from "@mui/material/useMediaQuery";

export default function OwnerPropertyRentWidget(props) {
  // //console.log("In Owner Property Rent Widget ");
  const isMediumScreen = useMediaQuery("(min-width:1241px)");
  // const isSmallScreen = useMediaQuery("(maxWidth:1240px)");
  // const isXSmallScreen = useMediaQuery("(maxWidth:960px)");
  const isSmallScreen = useMediaQuery("(min-width:1131px) and (max-width:1240px)");
  const isXSmallScreen = useMediaQuery("(min-width: 961px) and (max-width:1130px)");
  const isMobileScreen = useMediaQuery("(max-width:960px)");

  const navigate = useNavigate();
  const { propertyRoutingBasedOnSelectedRole, user, selectedRole } = useUser();
  // //console.log("In OwnerPropertyRentWidget Selected Role: ", selectedRole);
  // //console.log("In OwnerPropertyRentWidget: Routing Based on Role", propertyRoutingBasedOnSelectedRole);
  // //console.log(props.rentData);

  // //console.log("Role: ", user);
  // //console.log("Selected Role: ", selectedRole);

  let rentStatusData = props.rentData;

  let unpaidCount = rentStatusData ? rentStatusData.find((rs) => rs.rent_status === "UNPAID") : 0;
  // //console.log(unpaidCount);
  unpaidCount = unpaidCount ? unpaidCount.num : 0;

  let partialPaidCount = rentStatusData ? rentStatusData.find((rs) => rs.rent_status === "PARTIALLY PAID") : 0;
  partialPaidCount = partialPaidCount ? partialPaidCount.num : 0;

  let paidLateCount = rentStatusData ? rentStatusData.find((rs) => rs.rent_status === "PAID LATE") : 0;
  paidLateCount = paidLateCount ? paidLateCount.num : 0;

  let paidCount = rentStatusData ? rentStatusData.find((rs) => rs.rent_status === "PAID") : 0;
  paidCount = paidCount ? paidCount.num : 0;

  let vacantCount = rentStatusData ? rentStatusData.find((rs) => rs.rent_status === "VACANT") : 0;
  vacantCount = vacantCount ? vacantCount.num : 0;

  let noManagerCount = rentStatusData ? rentStatusData.find((rs) => rs.rent_status === "NO MANAGER") : 0;
  // //console.log(noManagerCount);
  noManagerCount = noManagerCount ? noManagerCount.num : 0;

  // no check if rentSatus does not exist so this could result in a failure
  let totalPropertiesCount = unpaidCount + partialPaidCount + paidLateCount + vacantCount + paidCount + noManagerCount;

  let data = [
    { rent_status: "not paid", number: unpaidCount, fill: "#A52A2A" },
    { rent_status: "partially paid", number: partialPaidCount, fill: "#FF8A00" },
    { rent_status: "paid late", number: paidLateCount, fill: "#FFC85C" },
    { rent_status: "paid on time", number: paidCount, fill: "#3D5CAC" },
    { rent_status: "vacant", number: vacantCount, fill: "#160449" },
  ];

  // Add object conditionally only if selectedRole is "OWNER"
  if (selectedRole === "OWNER") {
    data.push({ rent_status: "no manager", number: noManagerCount, fill: "#111111" });
  }

  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const renderColorfulLegendText = (value, entry) => {
    const { color } = entry;
    const status = data.find((item) => item.fill === color)?.rent_status;
    const num = data.find((item) => item.fill === color)?.number;
    const capitalizedStatus = status ? capitalizeWords(status) : "";
    return (
      <span
        style={{
          color: "#160449",
          fontFamily: "Source Sans Pro",
          fontSize: "18px",
          alignItems: isMediumScreen ? "flex-start" : "center",
          justifyContent: "flex-start",
        }}
      >
        {num} {capitalizedStatus}
      </span>
    );
  };

  const defaultData = [{ rent_status: "no properties", number: 1, fill: "#3D5CAC" }];

  const renderDefaultLegendText = (value, entry) => {
    return <span style={{ color: "#160449", fontFamily: "Source Sans Pro", fontSize: "18px" }}>No properties</span>;
  };

  const getChartLeftMargin = () => {
    if(isMediumScreen){
      return 20;
    } else if (isSmallScreen){
      return 10;
    } else if (isMobileScreen){
      return -50;
    } else {
      return 0;
    }        
  }

  const getChartRightMargin = () => {
    if(isMediumScreen){
      return 30;
    } else if (isSmallScreen){
      return 20;
    } else if (isMobileScreen){
      return 50;
    } else {
      return 0;
    }        
  }

  const getPositions = () => {
    if (isMobileScreen) {
      return {
        pieX: 190,
        pieY: 100,
        x: 140,
        tspanX: 140,
        y: 145,
        tspanY: 160,
      };
    } else if (isXSmallScreen) {
      return {
        pieX: 200,
        pieY: 100,
        x: 200,
        tspanX: 200,
        y: 145,
        tspanY: 160,
      };
    } else if (isSmallScreen) {
      return {              
        pieX: 100,
        pieY: 100,
        x: 110,
        y: 142,  
        tspanX: 110,
        tspanY: 155,
      };
    } else if (isMediumScreen) {
      return {
        // x: 120,
        // tspanX: 120,
        // y: 145,
        // tspanY: 160,
        pieX: 100,
        pieY: 100,
        x: 120,
        y: 142,  
        tspanX: 120,
        tspanY: 155,
      };
    } else {
      return {
        x: 250,
        tspanX: 250,
        y: 100,
        tspanY: 112,
      };
    }
  };

  const { x, y, tspanX, tspanY,pieX, pieY, } = getPositions();


  return (
    <Grid container style={{ backgroundColor: "#F2F2F2", borderRadius: "10px", height: "100%", alignContent: "flex-start" }}>
      <Grid item xs={12} style={{ display: "flex", justifyContent: "center", height: "50px" }}>
        <Typography variant='h5' sx={{ fontWeight: "bold", paddingTop: "15px", color: "#160449" }}>
          Property Rent
        </Typography>
      </Grid>
      {/* <Grid item xs={12}> */}
      <Grid container justifyContent="center" alignItems="center">
        <ResponsiveContainer 
          // width='100%'
          width={isMobileScreen? 450 : 400}
          height={300}
        >
          {totalPropertiesCount > 0 ? (
            <PieChart
              width={400}              
              height={250}
              margin={{
                top: 50,
                // right: 30,
                // right: isMediumScreen ? 20 : 50,
                // left: isMediumScreen ? 20 : 50,
                left: getChartLeftMargin(),
                right: getChartRightMargin(),                
                bottom: 40,
              }}
            >
              <Pie
                data={data}
                // cx={70}
                // cx={!isMediumScreen ? 200 : 70}
                cx={pieX}
                // cy={78}
                // cy={!isMediumScreen ? 48 : 100}
                cy={pieY}
                innerRadius={isXSmallScreen ? 65 : 55}
                outerRadius={isXSmallScreen ? 95 : 80}
                paddingAngle={0}
                dataKey='number'
                // filter='url(#shadow)'
                // onClick={() => navigate(propertyRoutingBasedOnSelectedRole())}
                // onClick={() => navigate("/properties", { state: { showPropertyForm: true } })} - PM Changed
                onClick={() => navigate("/properties", { state: { showPropertyForm: true, showRHS: "PropertyNavigator" } })}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={3} />
                ))}
              </Pie>

                {!isXSmallScreen &&  (
                  <Legend
                  height={50}
                  iconType='circle'
                  layout='vertical'
                  align='right'
                  verticalAlign='top'
                  // layout={!isMediumScreen ? "horizontal" : "vertical"}
                  // align={!isMediumScreen ? "center" : "right"}
                  // verticalAlign={!isMediumScreen ? "bottom" : "middle"}
                  iconSize={15}
                  padding={5}
                  formatter={renderColorfulLegendText}
                  wrapperStyle={{
                    marginTop: "25px",
                    display: "flex",
                    flexWrap: "wrap",
                    // justifyContent: !isMediumScreen ? "flex-start" : "center",
                    justifyContent: "flex-end", // Align items to flex-start for small screens
                    // alignContent: 'flex-start',
                    // flexDirection: !isMediumScreen ? "row" : "column", // Set direction based on layout
                    flexDirection: "row",
                    width: "auto", // Full width for small screens to align items properly
                    textAlign: !isMediumScreen ? "left" : "center", // Text alignment for small screens
                  }}
                  // wrapperStyle={{
                  //   display: "flex",
                  //   justifyContent: "flex-start", // Align items to the left
                  //   flexWrap: "wrap", // Allow items to wrap to the next row
                  //   flexDirection: "row",
                  //   width: "90%", // Ensure the legend spans the full width
                  // }}
                  itemStyle={{
                    flexBasis: !isMediumScreen ? "45%" : "100%", // 2 items per row for medium screens, 1 item per row for large
                    margin: "5px", // Add some margin to create spacing between items
                    textAlign: "left",
                  }}
                  // onClick={() => navigate("/pmRent")}
                  // onClick={() => navigate("/properties")} - PM Changed
                  onClick={() => navigate("/properties")}
                  // onClick={() => navigate("/properties", { state: { showRentForm: true } })}
                />
                )}
              

              <text
                // x={isMediumScreen ? 220 : 120}
                x={x}
                // y={isMediumScreen ? 93 : 145}
                y={y}
                textAnchor='middle'
                dominantBaseline='middle'
                cursor='pointer'
                style={{
                  fontFamily: "Source Sans Pro",
                  fontSize: "14px",
                  fill: "#160449",
                  fontWeight: "800",
                }}
                onClick={() => navigate(propertyRoutingBasedOnSelectedRole())}
              >
                View all {totalPropertiesCount}
                <tspan 
                  // x={isMediumScreen ? 220 : 120}
                  x={tspanX}
                  // y={isMediumScreen ? 105 : 157}
                  y={tspanY}
                >
                  properties
                </tspan>
              </text>
            </PieChart>
          ) : (
            <PieChart width={400} height={250} margin={{ top: 40, right: 30, left: 50, bottom: 40 }}>
              <Pie data={defaultData} cx={70} cy={78} innerRadius={55} outerRadius={80} paddingAngle={0} dataKey='number' filter='url(#shadow)'>
                {defaultData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={3} />
                ))}
              </Pie>
              <Legend height={36} iconType='circle' layout='vertical' align='right' verticalAlign='top' iconSize={15} padding={5} formatter={renderDefaultLegendText} />
              <text
                x={120}
                y={113}
                textAnchor='middle'
                dominantBaseline='middle'
                cursor='pointer'
                style={{
                  fontFamily: "Source Sans Pro",
                  fontSize: "14px",
                  fill: "#160449",
                  fontWeight: "800",
                }}
                // onClick={() => navigate("/properties", { state: { showPropertyForm: true } })} - PM Changed
                onClick={() => navigate("/properties", { state: { showPropertyForm: true } })}
              >
                Add your first
                <tspan x={120} y={125}>
                  property here
                </tspan>
              </text>
            </PieChart>
          )}
        </ResponsiveContainer>
      </Grid>
    </Grid>
  );
}
