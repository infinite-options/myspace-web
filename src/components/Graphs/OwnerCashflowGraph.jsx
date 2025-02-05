import { ThemeProvider } from "@emotion/react";
import React from "react";
import { Bar, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, ComposedChart, Cell, ReferenceLine, Tooltip } from "recharts";
import theme from "../../theme/theme";
import { Stack, Typography } from "@mui/material";

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
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        {payload.slice(0, 2).map(renderLegendItem)}
      </div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: 5 }}>
        {payload.slice(2).map(renderLegendItem)}
      </div>
    </div>
  );
};

const MixedChart = (props) => {
  const data = props.revenueCashflowByMonth;
  const activeButton = props.activeButton;

  // Sort the data by month and year (assuming monthYear is in the format "MM-YYYY")
  const sortedData = [...data].sort((a, b) => {
    const [monthA, yearA] = a.monthYear.split('-').map(Number);
    const [monthB, yearB] = b.monthYear.split('-').map(Number);
    if (yearA === yearB) {
      return monthA - monthB;
    }
    return yearA - yearB;
  });


  // Find max and min of data for cashflow
  const allValues = data?.flatMap(o => [
    o.cashflow, 
    o.expectedCashflow, 
    o.revenue, 
    o.expectedRevenue
  ]);

  const maxValue = Math.max(...allValues); //Max value from data, e.g., 6179
  // console.log("maxValue", maxValue);
  const roundFactor = Math.pow(10, Math.floor(Math.log10(maxValue))); // e.g., 1000, 
  const maxNiceValue = Math.ceil(maxValue / roundFactor) * roundFactor; // 7000
  const tickInterval = roundFactor;

  return (
    <ThemeProvider theme={theme}>
      <ResponsiveContainer>
        <ComposedChart data={sortedData} margin={{ top: 20, right: 0, left: 5, bottom: 5 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="monthYear" axisLine={true} type="category" tickCount={12} style={{ fontSize: "10px" }} />
          <YAxis
            yAxisId="left"
            axisLine={false}
            domain={[0, maxNiceValue]}
            tickCount={maxNiceValue / tickInterval + 1}
            tickFormatter={tick => `$${tick}`}
            interval={0}
            style={{ fontSize: "10px" }}
          />
          <ReferenceLine yAxisId="left" y={0} stroke="#000000" strokeWidth={1} />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip
            formatter={(value, name, props) => `X: ${props.payload.monthYear}, Y: ${value.toFixed(2)}`}
            contentStyle={{
              backgroundColor: '#ffffff',
              opacity: 1
            }}
          />

          <Legend content={CustomLegend} />

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
            {sortedData?.map((entry, index) => (
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
            {sortedData.map((entry, index) => (
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
        </ComposedChart>
      </ResponsiveContainer>
    </ThemeProvider>
  );
};


export default MixedChart;
