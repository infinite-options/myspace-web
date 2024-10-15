import { PieChart, Pie, Legend, Cell, ResponsiveContainer } from "recharts";
import { Chart } from "react-google-charts";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Grid, List, ListItem, Typography } from "@mui/material";
import { useUser } from "../../contexts/UserContext.jsx";
import useMediaQuery from "@mui/material/useMediaQuery";

export default function OwnerPropertyRentWidget(props) {
  // console.log("In Owner Property Rent Widget ");
  const isMediumScreen = useMediaQuery('(max-width:1200px)');
  const navigate = useNavigate();
  const { propertyRoutingBasedOnSelectedRole, user, selectedRole } = useUser();
  // console.log("In OwnerPropertyRentWidget Selected Role: ", selectedRole);
  // console.log("In OwnerPropertyRentWidget: Routing Based on Role", propertyRoutingBasedOnSelectedRole);
  // console.log(props.rentData);

  // console.log("Role: ", user);
  // console.log("Selected Role: ", selectedRole);

  let rentStatusData = props.rentData;

  let unpaidCount = rentStatusData ? rentStatusData.find((rs) => rs.rent_status === "UNPAID") : 0;
  // console.log(unpaidCount);
  unpaidCount = unpaidCount ? unpaidCount.num : 0;

  let partialPaidCount = rentStatusData ? rentStatusData.find((rs) => rs.rent_status === "PAID PARTIALLY") : 0;
  partialPaidCount = partialPaidCount ? partialPaidCount.num : 0;

  let paidLateCount = rentStatusData ? rentStatusData.find((rs) => rs.rent_status === "PAID LATE") : 0;
  paidLateCount = paidLateCount ? paidLateCount.num : 0;

  let paidCount = rentStatusData ? rentStatusData.find((rs) => rs.rent_status === "PAID") : 0;
  paidCount = paidCount ? paidCount.num : 0;

  let vacantCount = rentStatusData ? rentStatusData.find((rs) => rs.rent_status === "VACANT") : 0;
  vacantCount = vacantCount ? vacantCount.num : 0;

  let noManagerCount = rentStatusData ? rentStatusData.find((rs) => rs.rent_status === "NO MANAGER") : 0;
  // console.log(noManagerCount);
  noManagerCount = noManagerCount ? noManagerCount.num : 0;

  // no check if rentSatus does not exist so this could result in a failure
  let totalPropertiesCount = unpaidCount + partialPaidCount + paidLateCount + vacantCount + paidCount + noManagerCount;

  let data = [
    { rent_status: "not paid", number: unpaidCount, fill: "#A52A2A" },
    { rent_status: "paid partially", number: partialPaidCount, fill: "#FF8A00" },
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
 
  return (
    <Grid container style={{ backgroundColor: "#F2F2F2", borderRadius: "10px", height: "100%", alignContent: "flex-start", }}>
      <Grid item xs={12} style={{ display: "flex", justifyContent: "center", height: '50px', }}>
        <Typography variant='h5' sx={{ fontWeight: "bold", paddingTop: "15px", color: "#160449" }}>
          Property Rent 589
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <ResponsiveContainer width="100%" height={300}>
          {totalPropertiesCount > 0 ? (
            <PieChart
              width={400}
              height={250}
              margin={{ 
                top: 50,
                // right: 30,
                right: isMediumScreen? 20 : 50,
                left: isMediumScreen? 20 : 50,
                bottom: 40 
              }}
            >
              <Pie
                data={data}
                // cx={70}
                cx={isMediumScreen ? 135 : 70}
                // cy={78}
                cy={isMediumScreen ? 48 : 100}
                innerRadius={55}
                outerRadius={80}
                paddingAngle={0}
                dataKey='number'
                filter='url(#shadow)'
                // onClick={() => navigate(propertyRoutingBasedOnSelectedRole())}
                // onClick={() => navigate("/properties", { state: { showPropertyForm: true } })} - PM Changed
                onClick={() => navigate("/properties", { state: { showPropertyForm: true , showRHS: "PropertyNavigator"} })}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={3} />
                ))}
              </Pie>

              <Legend
                height={50}
                iconType='circle'
                // layout='vertical'
                // align='right'
                // verticalAlign='top'
                layout={isMediumScreen ? 'horizontal' : 'vertical'}
                align={isMediumScreen ? 'center' : 'right'}                
                verticalAlign={isMediumScreen ? 'bottom' : 'middle'}
                iconSize={15}
                padding={5}
                formatter={renderColorfulLegendText}
                wrapperStyle={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: isMediumScreen ? "flex-start" : "center", // Align items to flex-start for small screens
                  // alignContent: 'flex-start',
                  flexDirection: isMediumScreen ? "row" : "column", // Set direction based on layout
                  width: isMediumScreen ? "90%" : "auto", // Full width for small screens to align items properly
                  textAlign: isMediumScreen ? "left" : "center", // Text alignment for small screens
                }}
                // wrapperStyle={{
                //   display: "flex",
                //   justifyContent: "flex-start", // Align items to the left
                //   flexWrap: "wrap", // Allow items to wrap to the next row
                //   flexDirection: "row",
                //   width: "90%", // Ensure the legend spans the full width
                // }}
                itemStyle={{
                  flexBasis: isMediumScreen ? "45%" : "100%", // 2 items per row for medium screens, 1 item per row for large
                  margin: "5px", // Add some margin to create spacing between items
                  textAlign: "left",
                }}
                // onClick={() => navigate("/pmRent")}
                // onClick={() => navigate("/properties")} - PM Changed
                onClick={() => navigate("/properties")}
                // onClick={() => navigate("/properties", { state: { showRentForm: true } })}
              />

              <text
                x={isMediumScreen ? 155 : 120}
                y={isMediumScreen ? 93 : 145}
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
                  x={isMediumScreen ? 155 : 120} 
                  y={isMediumScreen ? 105 : 157}
                >
                  properties 98
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
