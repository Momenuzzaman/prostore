// "use client";

// import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

// const Charts = ({
//   data: { salesData },
// }: {
//   data: { salesData: { month: string; totalSales: number }[] };
// }) => {
//   return (
//     <ResponsiveContainer width="100%" height={350}>
//       <BarChart data={salesData}>
//         <XAxis
//           dataKey="month"
//           stroke="#888888"
//           fontSize={12}
//           tickLine={false}
//           axisLine={false}
//         />
//         <YAxis
//           dataKey="month"
//           stroke="#888888"
//           fontSize={12}
//           tickLine={false}
//           axisLine={false}
//           tickFormatter={(value) => `$${value}`}
//         />
//         <Bar
//           dataKey="totalSales"
//           fill="currentColor
//           "
//           radius={[4, 4, 0, 0]}
//           className="fill-primary"
//         ></Bar>
//       </BarChart>
//     </ResponsiveContainer>
//   );
// };

// export default Charts;

"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

const Charts = ({
  data: { salesData },
}: {
  data: { salesData: { month: string; totalSales: number }[] };
}) => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={salesData}>
        <XAxis
          dataKey="month"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />

        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />

        {/* ✅ Bar must be inside BarChart */}
        <Bar
          dataKey="totalSales"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default Charts;
