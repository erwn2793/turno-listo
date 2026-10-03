"use client";

import _ from "lodash";
import moment from "moment";
import "moment/locale/es";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

moment.locale("es");

const SAMPLE_MONTHS = [
  { mes: "2026-01", total: 84 },
  { mes: "2026-02", total: 96 },
  { mes: "2026-03", total: 110 },
  { mes: "2026-04", total: 102 },
  { mes: "2026-05", total: 128 },
  { mes: "2026-06", total: 141 },
  { mes: "2026-07", total: 136 },
  { mes: "2026-08", total: 158 },
  { mes: "2026-09", total: 171 },
  { mes: "2026-10", total: 98 },
];

export function MonthlyChart() {
  const data = _.sortBy(SAMPLE_MONTHS, (item) => item.mes).map((item) => ({
    mes: moment(item.mes, "YYYY-MM").format("MMM"),
    total: item.total,
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="#ccfbf1" vertical={false} />
          <XAxis dataKey="mes" tick={{ fill: "#334155", fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fill: "#334155", fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="total" fill="#0f766e" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
