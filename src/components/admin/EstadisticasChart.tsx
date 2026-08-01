"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function EstadisticasChart({ data }: { data: { nombre: string; reservas: number }[] }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EDE3CE" />
          <XAxis dataKey="nombre" fontSize={12} stroke="#6B7280" />
          <YAxis fontSize={12} stroke="#6B7280" allowDecimals={false} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #EDE3CE" }} />
          <Bar dataKey="reservas" fill="#189AA6" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
