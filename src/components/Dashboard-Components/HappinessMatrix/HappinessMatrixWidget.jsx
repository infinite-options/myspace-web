import React, { useState, useEffect } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Button, Box, ThemeProvider, Grid, List, ListItem, Typography, Paper } from "@mui/material";
import theme from "../../../theme/theme";
import { useNavigate } from "react-router-dom";
import CustomImage from "./CustomImage";

function HappinessMatrixWidget(props) {
  const navigate = useNavigate();
  // const chartWidth = 400;
  // const chartHeight = 350;
  const chartMargin = { top: 20, right: 30, bottom: 10, left: 0 };
  const { happinessData, contactDetails, page, setHappinessData, setOwnerUID, currentOwnerUID } = props;
  const [data, setData] = useState([]);

  // //console.log("happiness data initial", happinessData);
  // //console.log("happiness data initial1", happinessData.matrix_data);
  // //console.log("happiness data initial2", happinessData.matrix_data.result[0]);

  const getBorderColor = (x, y) => {
    let quarter;
    if (x < -50 && y > -50) {
      return "#FF8A00"; //orange
    } else if (x < -50 && y < -50) {
      return "#D22B2B";
    } else if (x > -50 && y < -50) {
      return "#FFC85C";
    } else if (x > -50 && y > -50) {
      return "#006400";
    } else {
      return "#000000";
    }

    // orange - upper left
    // red - lower left
    // yellow - lower right
    // green - upper right
  };

  const adjustPoints = (points) => {
    const margin = 5;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        while (overlap(points[i], points[j], margin)) {
          points[j].x += margin;
          points[j].y += margin;
        }
      }
    }
    return points;
  };

  const overlap = (point1, point2, margin) => {
    const distance = Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    return distance < margin;
  };

  useEffect(() => {
    // //console.log("In UseEffect: ", happinessData.matrix_data.result);
    setData(happinessData?.result);

    const matrixData = happinessData?.result;

    const points = [];
    matrixData?.forEach((owner) => {
      // //console.log("In get points: ", owner.vacancy_perc, owner.percent_delta_cashflow);
      let x = Number(owner.vacancy_perc);
      let y = Number(owner.percent_delta_cashflow);

      let pointObject = {
        x: -x,
        y: -y,
        ...owner,
        color: getBorderColor(x, -y),
        photo: owner.owner_photo_url ? owner.owner_photo_url : null,
        name: `${owner.owner_first_name} ${owner.owner_last_name}`,
      };

      points.push(pointObject);
    });

    const adjustedPoints = adjustPoints(points);

    // //console.log("points to plot", points);
    setPointsToPlot(adjustedPoints);
  }, [props.happinessData]);

  const [pointsToPlot, setPointsToPlot] = useState([]);

  useEffect(() => {
    // //console.log("ROHIT - pointsToPlot - ", pointsToPlot);
  }, [pointsToPlot]);

  const axisLabelStyle = {
    fontFamily: "Source Sans Pro",
    color: "#160449",
    fontWeight: "bold",
  };

  const [clickedIndex, setClickedIndex] = useState(null);
  const [hiddenPoints, setHiddenPoints] = useState([]);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const handlePointClick = (payload) => {
    // //console.log("In handlePointClick - payload: ", payload);
    let { index } = payload;
    if (clickedIndex === index) {
      // setHiddenPoints((prevHiddenPoints) => [...prevHiddenPoints, index]);
    } else {
      setClickedIndex(index);
      // let owner = data.find((o) => o.index === index);
      // dataSetter(owner);
    }
    setTooltipVisible(true);
  };

  const handleShowAllPoints = () => {
    setHiddenPoints([]);
  };

  return (
    <ThemeProvider theme={theme}>
      <Paper
        elevation={0}
        sx={{
          // margin: '50p', // Add margin here
          borderRadius: "10px",
          backgroundColor: theme.palette.primary.main,
          height: 450,
          // [theme.breakpoints.down("sm")]: {
          //   width: "80%",
          // },
          // [theme.breakpoints.up("sm")]: {
          //   width: "50%",
          // },
        }}
      >
        <Grid container style={{ paddingTop: "10px" }}>
          <Grid item xs={12} sx={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: "10px" }}>
            <Typography variant='h5' sx={{ fontSize: "24px", fontWeight: "bold", color: "#160449" }}>
              Happiness Matrix
            </Typography>
          </Grid>
          <Grid item xs={12} sx={{ backgroundColor: "", borderRadius: "15px" }}>
            <ResponsiveContainer width='100%' height={370}>
              <ScatterChart
                // width={chartWidth}
                // height={chartHeight}
                margin={chartMargin}
                onClick={() => setTooltipVisible(!tooltipVisible)}
              >
                {/* <CartesianGrid /> */}
                <YAxis
                  type='number'
                  dataKey='x' // Now vacancy percentage is plotted on the Y-axis
                  name='Vacancies'
                  axisLine={false}
                  tickLine={false}
                  style={axisLabelStyle}
                  domain={[-100, 0]} // Adjust this if necessary for vacancy percentage
                  label={{
                    value: "Vacancy %",
                    angle: -90,
                    position: "insideLeft",
                    offset: 10,
                    fill: "#160449",
                    fontSize: 14,
                    fontWeight: "bold",
                  }}
                />

                <XAxis
                  type='number'
                  dataKey='y' // Now cashflow percentage is plotted on the X-axis
                  name='Delta Cashflow'
                  axisLine={false}
                  tickLine={false}
                  style={axisLabelStyle}
                  domain={[-100, 0]} // Adjust this if necessary for cashflow percentage
                  label={{
                    value: "Delta Cashflow %",
                    position: "insideBottom",
                    offset: -5,
                    fill: "#160449",
                    fontSize: 14,
                    fontWeight: "bold",
                  }}
                />

                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ payload }) => {
                    if (payload && payload.length && tooltipVisible) {
                      const dataPoint = payload[0].payload;
                      return (
                        <div style={{ backgroundColor: "white", padding: "10px", border: "1px solid #ccc" }}>
                          <p>
                            <strong>Name:</strong> {dataPoint.name}
                          </p>
                          <p>
                            <strong>Delta Cashflow:</strong> {dataPoint.delta_cashflow}
                          </p>
                          <p>
                            <strong>Vacancies:</strong> {dataPoint.vacancy_num}
                          </p>
                          <p>
                            <strong>x - vacancy_perc:</strong> {dataPoint.x}
                          </p>
                          <p>
                            <strong>y - delta_cashflow_perc:</strong> {dataPoint.y}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter
                  name='happiness_matrix'
                  data={pointsToPlot}
                  fill='#8884d8'
                  shape={(props) => (
                    <CustomImage
                      {...props}
                      onClick={() => handlePointClick(props.payload)}
                      happinessData={happinessData}
                      contactDetails={contactDetails}
                      page={page}
                      setHappinessData={setHappinessData}
                      setOwnerUID={setOwnerUID}
                      // setIndex={setIndex}
                      isClicked={props.payload.index === clickedIndex}
                      isVisible={!hiddenPoints.includes(props.payload.index)}
                      currentOwnerUID={currentOwnerUID} // Pass current owner UID
                    />
                  )}
                />

                <ReferenceLine y={-50} stroke='#000000' strokeDasharray='3 3' />

                <ReferenceLine x={-50} stroke='#000000' strokeDasharray='3 3' />

                <ReferenceLine
                  segment={[
                    { x: -100, y: -100 },
                    { x: 0, y: 0 },
                  ]}
                  stroke='#000000'
                  strokeWidth={1}
                  ifOverflow='hidden'
                />
              </ScatterChart>
            </ResponsiveContainer>
          </Grid>
        </Grid>
      </Paper>
    </ThemeProvider>
  );
}

export default HappinessMatrixWidget;

// CustomImage Widget
// const CustomImage = (props) => {
//   // //console.log("In CustomImage");
//   const navigate = useNavigate();
//   const { cx, cy, payload, onClick, isClicked, isVisible, index, dataforhappiness, page, setIndex, contactDetails, happinessData } = props;

//   const [isClickedState, setIsClickedState] = useState(isClicked);

//   // useEffect(() => {
//   //   //console.log("isClickedState - ", isClickedState);
//   // }, [isClickedState]);

//   // //console.log("CustomImage - props - ", props);
//   if (!isVisible) {
//     return null;
//   }

//   const diameter = 30;
//   const outlineWidth = isClicked ? 4 : 2;

//   const handleClick = (payload) => {
//     //console.log("input to  handleClick: ", payload);
//     setIsClickedState(true);
//     //console.log("CustomImage - handeClick");
//     if (onClick) {
//       onClick(payload); // Call the passed onClick function
//     }
//     //console.log("CustomImage - handleClick - payload - ", payload);
//     if (page === "OwnerContactDetails") {
//       const idx = contactDetails.findIndex((contact) => contact.owner_uid === payload?.owner_uid);
//       setIndex(idx);
//       return;
//     }

//     navigate(`/ownerContactDetailsHappinessMatrix`, {
//       state: {
//         ownerUID: payload.owner_uid,
//         navigatingFrom: "HappinessMatrixWidget",
//         index: index,
//         happinessMatrixData: dataforhappiness,
//         happinessData: happinessData,
//       },
//     });
//   };

//   return (
//     // <g onClick={() => onClick(payload.name)}>
//     <g onClick={() => handleClick(payload)}>
//       <foreignObject x={cx - diameter / 2} y={cy - diameter / 2} width={diameter} height={diameter}>
//         {![null, undefined, ""].includes(payload?.photo) ? (
//           <img
//             src={payload.photo}
//             alt='scatter-image'
//             style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", filter: isClickedState ? "brightness(0.7)" : "none" }}
//           />
//         ) : (
//           <AccountCircleIcon
//             sx={{
//               color: payload.color,
//               width: "100%",
//               height: "100%",
//               borderRadius: "50%",
//               borderWidth: outlineWidth,
//               borderStyle: "solid",
//               filter: isClickedState ? "brightness(0.7)" : "none",
//             }}
//           />
//         )}
//       </foreignObject>
//       {payload?.photo && <circle cx={cx} cy={cy} r={diameter / 2 + outlineWidth / 2} fill='none' stroke={payload.color} strokeWidth={outlineWidth} />}
//     </g>
//   );
// };

// function getPoints(data) {
//   const points = [];
//   data?.forEach((owner) => {
//     // //console.log("In get points: ", owner.vacancy_perc, owner.delta_cashflow_perc);
//     let x = Number(owner.vacancy_perc);
//     let y = Number(owner.delta_cashflow_perc);

//     let pointObject = {
//       x: x,
//       y: -y,
//       ...owner,
//     };

//     points.push(pointObject);
//   });

//   //console.log("points to plot", points);
//   setPointsToPlot(points);
// }

// useEffect(() => {

//   const setting_matrix_data = () => {
//     // //console.log("In Setting Happiness Matrix", happiness_response);
//     // Transforming the data
//     // //console.log("setting_matrix_data - happiness_response - ", happiness_response);
//     // const transformedData = matrixData.result.map((vacancyItem, i) => {
//       // //console.log("In Happiness Matrix before vacancy");
//       // //console.log("setting_matrix_data - vacancyItem - ", vacancyItem);
//       const deltaCashflowItem = matrixData.result.find((item) => item.owner_uid === vacancyItem.owner_uid);
//       // //console.log("setting_matrix_data - deltaCashflowItem - ", deltaCashflowItem);

//       let fullName = "";
//       let ownerUID = "";
//       let percent_delta_cashflow = 0;
//       let owner_photo_url = "";
//       let cashflow = 0;
//       let expected_cashflow = 0;
//       let actual_cashflow = 0;

//       if (deltaCashflowItem) {
//         // //console.log("deltaCashflowItem - ", deltaCashflowItem);
//         fullName = `${deltaCashflowItem.owner_first_name} ${deltaCashflowItem.owner_last_name}`;
//         ownerUID = deltaCashflowItem.owner_uid;
//         percent_delta_cashflow = deltaCashflowItem.percent_delta_cashflow;
//         owner_photo_url = deltaCashflowItem.owner_photo_url;
//         cashflow = deltaCashflowItem.cashflow;
//         expected_cashflow = deltaCashflowItem.expected_cashflow;
//         actual_cashflow = deltaCashflowItem.actual_cashflow;
//       }

//       let quarter;
//       let vacancy_perc = parseFloat(vacancyItem.vacancy_perc);
//       let delta_cf_perc = -1 * parseFloat(percent_delta_cashflow);

//       if (delta_cf_perc > -0.5 && vacancy_perc > -50) {
//         quarter = 1;
//       } else if (delta_cf_perc < -0.5 && vacancy_perc > -50) {
//         quarter = 2;
//       } else if (delta_cf_perc < -0.5 && vacancy_perc < -50) {
//         quarter = 3;
//       } else if (delta_cf_perc > -0.5 && vacancy_perc < -50) {
//         quarter = 4;
//       }

//       // //console.log("delta_cf_perc, vacancy_perc  - ", delta_cf_perc, vacancy_perc);
//       // //console.log("quarter - ", fullName, quarter);

//       let borderColor;

//       switch (quarter) {
//         case 1:
//           borderColor = "#006400"; // Green
//           break;
//         case 2:
//           borderColor = "#FF8A00"; // Orange color
//           break;
//         case 3:
//           borderColor = "#D22B2B"; // Red color
//           break;
//         case 4:
//           borderColor = "#FFC85C"; // Yellow color
//           break;
//         default:
//           borderColor = "#000000"; // Black color
//       }

//       return {
//         owner_uid: ownerUID,
//         name: fullName.trim(),
//         photo: owner_photo_url,
//         vacancy_perc: parseFloat(vacancyItem.vacancy_perc).toFixed(2),
//         delta_cashflow_perc: percent_delta_cashflow || 0,
//         vacancy_num: vacancyItem.vacancy_num || 0,
//         cashflow: cashflow || 0,
//         expected_cashflow: expected_cashflow || 0,
//         actual_cashflow: actual_cashflow || 0,
//         delta_cashflow: actual_cashflow - expected_cashflow,
//         index: i,
//         color: borderColor,
//         total_properties: vacancyItem.total_properties || 0,
//       };
//     // });

//     setData(transformedData);
//     //console.log('transformedData', transformedData);
//     shift(adjustPoints(transformedData));
//   };
//   setting_matrix_data();
// }, [])

// let [shifted_data, shift] = useState(JSON.parse(JSON.stringify(data)));
// let [shifted_data, shift] = useState(data);

// Function to check if two points overlap
// function overlap(owner1, owner2, margin) {
//   const { vacancy_perc: x1, delta_cashflow_perc: y1 } = owner1;
//   const { vacancy_perc: x2, delta_cashflow_perc: y2 } = owner2;
//   //console.log("checking distance1", x1, y1, x2, y2);
//   const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
//   //console.log("checking distance", distance);
//   return distance < margin;
// }

// Function to adjust points
// function adjustPoints(owners, margin = 5) {
//   for (let i = 0; i < owners.length; i++) {
//     for (let j = i + 1; j < owners.length; j++) {
//       while (overlap(owners[i], owners[j], margin)) {
//         // Move points slightly in both x and y directions
//         //console.log("checking i", owners[i]);
//         //console.log("checking j", owners[j]);
//         if (owners[j].vacancy_perc > -50) {
//           owners[j].vacancy_perc -= 5;
//         } else {
//           owners[j].vacancy_perc += 5;
//         }

//         if (owners[j].delta_cashflow_perc > -50) {
//           owners[j].delta_cashflow_perc -= 5;
//         } else {
//           owners[j].delta_cashflow_perc += 5;
//         }
//       }
//     }
//   }
//   return owners;
// }

//  Adjust points before rendering
// useEffect(() => {
//   shift(adjustPoints(shifted_data));
// }, []);

// useEffect(() => {
//   adjustPoints(data);
//   getPoints(data);
// }, [data]);
