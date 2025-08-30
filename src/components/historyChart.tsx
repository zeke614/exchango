import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

interface Props {
  base: string;
  target: string;
  appId: string;
}

interface DataPoint {
  date: string;
  rate: number;
  cachedAt?: string;
}

const getExpiryDays = (range: string) => {
  switch (range) {
    case "1D":
      return 1;
    case "1W":
      return 7;
    case "2W":
      return 14;
    case "1M":
      return 30;
    default:
      return 1;
  }
};

const ranges: ("1D" | "1W" | "2W" | "1M")[] = ["1D", "1W", "2W", "1M"];

const CurrencyHistoryChart = ({ base, target, appId }: Props) => {
  const [range, setRange] = useState<"1D" | "1W" | "2W" | "1M">("1W");
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const unsupportedBase = base !== "USD";

  useEffect(() => {
    if (unsupportedBase) {
      setData([]);
      setLoading(false);
      return;
    }

    async function fetchHistory() {
      setLoading(true);

      const today = dayjs();
      let startDate = today;

      switch (range) {
        case "1D":
          startDate = today.subtract(1, "day");
          break;
        case "1W":
          startDate = today.subtract(7, "day");
          break;
        case "2W":
          startDate = today.subtract(14, "day");
          break;
        case "1M":
          startDate = today.subtract(1, "month");
          break;
      }

      const expiryDays = getExpiryDays(range);
      const results: DataPoint[] = [];

      for (
        let date = startDate;
        date.isBefore(today) || date.isSame(today);
        date = date.add(1, "day")
      ) {
        const dateStr = date.format("YYYY-MM-DD");
        const cacheKey = `history_${base}_${target}_${dateStr}_${range}`;
        const cachedRaw = localStorage.getItem(cacheKey);

        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw) as DataPoint;
          const cachedAt = dayjs(cached.cachedAt);

          if (dayjs().diff(cachedAt, "day") < expiryDays) {
            results.push(cached);
            continue;
          } else {
            localStorage.removeItem(cacheKey); // expired
          }
        }

        try {
          const url = `https://openexchangerates.org/api/historical/${dateStr}.json?app_id=${appId}&base=${base}&symbols=${target}`;
          const res = await axios.get(url);
          const data = res.data as { rates: Record<string, number> };
          const rate = data.rates[target];

          const point: DataPoint = {
            date: dateStr,
            rate,
            cachedAt: new Date().toISOString(),
          };

          localStorage.setItem(cacheKey, JSON.stringify(point));
          results.push(point);
        } catch (err) {
          console.warn(`Failed for ${dateStr}`, err);
        }
      }

      setData(results);
      setLoading(false);
    }

    fetchHistory();
  }, [base, target, range, appId]);

  return (
    <div className="w-full mt-10 mb-3 bg-white">
      <h3 className="text-[1.625rem] font-medium mb-5 text-[#256F5C] text-center">
        {base} — {target} History
      </h3>

      {!unsupportedBase && (
        <div className="flex justify-center gap-3 mb-10">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2 py-0 rounded-full text-[0.938rem] font-medium border transition ${
                range === r
                  ? "bg-[#256F5C] text-white"
                  : "bg-white text-gray-800 border hover:bg-gray-200"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      )}

      {unsupportedBase ? (
        <div className="text-center py-8 px-4 text-gray-600 flex flex-col items-center gap-2">
          <p className="text-[1.063rem] font-light leading-relaxed max-w-xs">
            Oops... <span className="text-[1.156rem]">😕</span> <br />
            Historical data is only available for currency pairs that include{" "}
            <span className="text-lg font-medium">USD</span> as the base
            currency.
          </p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center animate-bounce py-[2rem] text-[#256F5C]">
          <i className="bx bx-chart-spline text-[1.625rem]"></i>
        </div>
      ) : (
        <ResponsiveContainer width="92%" height={210}>
          <LineChart data={data}>
            <CartesianGrid horizontal={true} vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              minTickGap={10}
              tickFormatter={(tick) => dayjs(tick).format("MMM D")}
            />
            <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value: any) => [`${value}`, `${base} → ${target}`]}
              labelFormatter={(label: any) =>
                dayjs(label).format("MMMM D, YYYY")
              }
              contentStyle={{
                fontSize: "12px",
                padding: "5px 8px",
                backgroundColor: "#fff",
                borderRadius: "6px",
              }}
              labelStyle={{
                fontSize: "13px",
                fontWeight: "normal",
                textAlign: "center",
              }}
              cursor={{ strokeDasharray: "3 3", strokeWidth: 2 }}
            />
            <Line
              type="bumpX"
              dataKey="rate"
              stroke="#256F5C"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default CurrencyHistoryChart;
