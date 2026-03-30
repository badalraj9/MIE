"use client";

import { FinancialExhibit } from "@prisma/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface FinancialChartsProps {
  exhibits: FinancialExhibit[];
}

export default function FinancialCharts({ exhibits }: FinancialChartsProps) {
  return (
    <div className="flex flex-col gap-6 pb-8">
      {exhibits.map((exhibit, index) => {
        let parsedData: { name: string; value: string | number }[] = [];
        try {
          parsedData = JSON.parse(exhibit.data);
        } catch (e) {
          console.error("Failed to parse exhibit data", e);
          return null;
        }

        const isChart = exhibit.chartType === "BAR" || exhibit.chartType === "LINE";
        const chartColors = {
          primary: "oklch(0.25 0.02 285)",
          secondary: "oklch(0.55 0.12 280)",
          grid: "oklch(0.92 0.002 285)",
          muted: "oklch(0.55 0.015 285)",
        };

        return (
          <div key={exhibit.id} className="floating-tile overflow-hidden">
            <div className="bg-secondary/20 px-5 py-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Exhibit {index + 1}
                </div>
                <span className="inline-flex items-center rounded-full bg-card px-2 py-0.5 text-xs font-medium text-muted-foreground border border-border/40">
                  {exhibit.chartType}
                </span>
              </div>
              <div className="font-serif text-base font-semibold text-foreground mt-1">
                {exhibit.title}
              </div>
            </div>
            <div className="p-5 bg-card">
              {isChart ? (
                <div style={{ width: "100%", height: 256, minWidth: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    {exhibit.chartType === "LINE" ? (
                      <LineChart
                        data={parsedData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: chartColors.muted, fontSize: 12 }} 
                          dy={10} 
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: chartColors.muted, fontSize: 12 }} 
                          dx={-10} 
                        />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: "12px", 
                            border: "1px solid oklch(0.92 0.002 285)", 
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            background: "oklch(1 0 0)",
                          }} 
                        />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke={chartColors.primary} 
                          strokeWidth={2.5} 
                          dot={{ r: 5, fill: chartColors.primary }} 
                          activeDot={{ r: 7 }} 
                        />
                      </LineChart>
                    ) : (
                      <BarChart
                        data={parsedData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: chartColors.muted, fontSize: 12 }} 
                          dy={10} 
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: chartColors.muted, fontSize: 12 }} 
                          dx={-10} 
                        />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: "12px", 
                            border: "1px solid oklch(0.92 0.002 285)", 
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            background: "oklch(1 0 0)",
                          }} 
                          cursor={{ fill: "oklch(0.97 0.008 285)" }} 
                        />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />
                        <Bar 
                          dataKey="value" 
                          fill={chartColors.primary} 
                          radius={[6, 6, 0, 0]} 
                        />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border/40">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-secondary/30 text-xs uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-5 py-3 font-medium">Metric</th>
                        <th className="px-5 py-3 font-medium">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.map((row, i) => (
                        <tr key={i} className="border-t border-border/30 hover:bg-secondary/10 transition-colors">
                          <td className="px-5 py-3.5 font-medium text-foreground">{row.name}</td>
                          <td className="px-5 py-3.5 text-muted-foreground">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
