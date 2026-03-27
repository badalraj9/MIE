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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FinancialChartsProps {
  exhibits: FinancialExhibit[];
}

export default function FinancialCharts({ exhibits }: FinancialChartsProps) {
  return (
    <div className="flex flex-col gap-8 pb-8">
      {exhibits.map((exhibit, index) => {
        let parsedData = [];
        try {
          parsedData = JSON.parse(exhibit.data);
        } catch (e) {
          console.error("Failed to parse exhibit data", e);
          return null;
        }

        return (
          <Card key={exhibit.id} className="overflow-hidden border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50 border-b border-slate-100 py-4 px-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Exhibit {index + 1}
              </div>
              <CardTitle className="text-base font-serif font-bold text-slate-800">
                {exhibit.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-6 bg-white">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {exhibit.chartType === "LINE" ? (
                    <LineChart
                      data={parsedData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                      <Tooltip contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#0f172a"
                        strokeWidth={2}
                        dot={{ r: 4, fill: "#0f172a" }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  ) : exhibit.chartType === "BAR" ? (
                    <BarChart
                      data={parsedData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                      <Tooltip contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{fill: '#f1f5f9'}} />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                      <Bar dataKey="value" fill="#334155" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : (
                    <div className="overflow-x-auto rounded-md border border-slate-200">
                      <table className="w-full text-sm text-left text-slate-700">
                        <thead className="text-xs text-slate-600 uppercase bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th scope="col" className="px-6 py-3">Metric</th>
                            <th scope="col" className="px-6 py-3">Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsedData.map((row: { name: string; value: string | number }, i: number) => (
                            <tr key={i} className="bg-white border-b border-slate-100 last:border-0 hover:bg-slate-50">
                              <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                {row.name}
                              </td>
                              <td className="px-6 py-4">{row.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
