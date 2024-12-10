import { ThemeProvider } from "@emotion/react";
import React from "react";
import { Bar, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, ComposedChart, Cell, ReferenceLine } from "recharts";
import theme from "../../theme/theme";
import { Stack, Typography } from "@mui/material";

const MixedChart = (props) => {
  // I want props.revenueCashflowByMonth to be sorted in order of month and year

  const CustomLegend = (props) => {
    const { payload } = props;
  
    const renderLegendItem = (entry, index) => {
      if (entry.type === "line") {
        return (
          <div key={`item-${index}`} style={{ display: "flex", alignItems: "center", marginRight: 10 }}>
            <svg width="10" height="10" style={{ marginRight: 5 }}>
              <circle cx="5" cy="5" r="5" fill={entry.color} />
            </svg>
            <span style={{ color: entry.color }}>{entry.value}</span>
          </div>
        );
      } else {
        return (
          <div key={`item-${index}`} style={{ display: "flex", alignItems: "center", marginRight: 10 }}>
            <div style={{ width: 10, height: 10, backgroundColor: entry.color, marginRight: 5 }}></div>
            <span style={{ color: entry.color }}>{entry.value}</span>
          </div>
        );
      }
    };
  
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>{payload.slice(0, 2).map(renderLegendItem)}</div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: 5 }}>{payload.slice(2).map(renderLegendItem)}</div>
      </div>
    );
  };
  
  const data = props.revenueCashflowByMonth; // In the future Change <ComposedChart data={data1} --> <ComposedChart data={data}
  const activeButton = props.activeButton;
  const chart = props.showChart;
  // console.log("Input data to graph: ", data);
  // console.log("Active button: ", activeButton);

  // const selectedProperty = props.selectedProperty;
  // find max and min of data
  const max = Math.max.apply(
    Math,
    data.map(function (o) {
      // console.log("max: ", o.cashflow);
      return o.cashflow;
    })
  );
  const min = Math.min.apply(
    Math,
    data.map(function (o) {
      // console.log("min: ", o.cashflow);
      return o.cashflow;
    })
  );

  return (
    <ThemeProvider theme={theme}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 20, right: -10, left: -10, bottom: 5 }}>
          {/* <CartesianGrid vertical={false} />
          <XAxis
            dataKey="monthYear"
            axisLine={true}
            type="category"
            tickCount={12}
            style={{
              fontSize: "10px",
            }}
          />
          <YAxis
            yAxisId="left"
            axisLine={false}
            tickCount={8}
            domain={[(min - 1000) * 1.1, max * 2]}
            tickFormatter={(value) => `$${value}`}
            style={{
              fontSize: "10px",
            }}
          />
          <ReferenceLine yAxisId="left" y={0} stroke="#000000" strokeWidth={1} />
          <YAxis yAxisId="right" orientation="right" /> */}
          <CartesianGrid vertical={false} />
          <XAxis dataKey="monthYear" axisLine={true} type="category" tickCount={12} style={{ fontSize: "10px" }} />
          <YAxis yAxisId="left" axisLine={false} tickCount={8} domain={[(min - 100) * 1.1, max * 1.3]} tickFormatter={(value) => `$${value}`} style={{ fontSize: "10px" }} />
          <ReferenceLine yAxisId="left" y={0} stroke="#000000" strokeWidth={1} />
          <YAxis yAxisId="right" orientation="right" />
          <Legend content={CustomLegend} />

          {/* <Line
            yAxisId="left"
            type="monotone"
            dataKey="expected_revenue"
            stroke={theme.palette.primary.mustardYellow}
            strokeWidth={5}
            name="Revenue"
            dot={{ stroke: theme.palette.primary.mustardYellow }}
          /> */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="expectedRevenue"
            stroke={theme.palette.custom.red}
            strokeWidth={5}
            name="Expected Revenue"
            dot={{ stroke: theme.palette.custom.red }}
          />

          <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#000000" strokeWidth={5} name="Actual Revenue" dot={{ stroke: "#000000" }} />

          <Bar yAxisId="left" dataKey="expectedCashflow" fill={theme.palette.primary.mustardYellow} barCategoryGap={10} barSize={15} name="Expected Cashflow">
            {data?.map((entry, index) => (
              <Cell key={index} fill={entry.expected_cashflow < 0 ? theme.palette.custom.red : theme.palette.primary.mustardYellow} />
            ))}
          </Bar>
          <Bar
            yAxisId="left"
            dataKey={"cashflow"}
            fill={theme.typography.common.blue}
            barCategoryGap={10}
            barSize={15}
            name="Actual Cashflow"
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  (activeButton === "ExpectedCashflow" && entry.expectedCashflow < 0) || (activeButton === "Cashflow" && entry.cashflow < 0)
                    ? theme.palette.custom.red
                    : theme.typography.common.blue
                }
              />
            ))}
          </Bar>

         

          {/* <Line
          yAxisId="left"
          type="monotone"
          dataKey="expected_cashflow"
          stroke={theme.palette.primary.mustardYellow}
          strokeWidth={5}
          name="Expected Cashflow"
          dot={{ stroke: theme.palette.primary.mustardYellow }}
        />

        <Line
          yAxisId="left"
          type="monotone"
          dataKey="cashflow"
          stroke={theme.typography.common.blue}
          strokeWidth={5}
          name="Actual Cashflow"
          dot={{ stroke: theme.typography.common.blue }}
        /> */}

        </ComposedChart>
      </ResponsiveContainer>
    </ThemeProvider>
  );
};

export default MixedChart;
