import { ThemeProvider } from "@emotion/react";
import React from "react";
import { Bar, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, ComposedChart, Cell, ReferenceLine, Tooltip } from "recharts";
import theme from "../../theme/theme";

// Custom Legend Component
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

const ProfitChart = (props) => {
  const data = props.revenueCashflowByMonth;
  const activeButton = props.activeButton;

  const allValues = data?.flatMap(o => [
    o.profit, 
    o.expected_profit, 
    o.rent, 
    o.expected_rent
  ]);


  const max = Math.max(...allValues);
  const min = Math.min(...allValues);

  return (
    <ThemeProvider theme={theme}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 5 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="monthYear" axisLine={true} type="category" tickCount={12} style={{ fontSize: "10px" }} />
          <YAxis yAxisId="left" axisLine={false} tickCount={10} domain={[(min - 100) * 1.1, max * 1.1]}
            tickFormatter={(value) => {
              if (value >= 1000000) {
                return `$${(value / 1000000).toFixed(2)}M`; // For millions
              }
              if (value >= 1000) {
                return `$${(value / 1000).toFixed(2)}K`; // For thousands
              }
              return `$${value.toFixed(2)}`; 
            }} 
            style={{ fontSize: "10px" }} 
          />
          <ReferenceLine yAxisId="left" y={0} stroke="#000000" strokeWidth={1} />
          <Tooltip
            formatter={(value, name, props) => `X: ${props.payload.monthYear}, Y: ${value.toFixed(2)}`}
            contentStyle={{
              backgroundColor: '#ffffff',
              opacity: 1
            }}
          />
          <YAxis yAxisId="right" orientation="right" />
          <Legend content={CustomLegend} />

          <Line
            yAxisId="left"
            type="monotone"
            dataKey="expected_rent"
            stroke={theme.palette.custom.red}
            strokeWidth={5}
            name="Expected Revenue"
            dot={{ stroke: theme.palette.custom.red }}
          />

          <Line yAxisId="left" type="monotone" dataKey="rent" stroke="#000000" strokeWidth={5} name="Actual Revenue" dot={{ stroke: "#000000" }} />

          <Bar yAxisId="left" dataKey="expected_profit" fill={theme.palette.primary.mustardYellow} barCategoryGap={10} barSize={15} name="Expected Profit">
            {data?.map((entry, index) => (
              <Cell key={index} fill={theme.palette.primary.mustardYellow} />
            ))}
          </Bar>

          <Bar yAxisId="left" dataKey="profit" fill={theme.typography.common.blue} barCategoryGap={10} barSize={15} name="Actual Profit">
            {data?.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  (activeButton === "ExpectedCashflow" && entry.expectedCashflow < 0) || (activeButton === "Cashflow" && entry.cashflow < 0)
                    ? theme.typography.common.blue
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

export default ProfitChart;
