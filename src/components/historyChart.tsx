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
import { useTranslation } from "react-i18next";

// Types

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

type Range = "1D" | "1W" | "2W" | "1M";

// Constants

const RANGES: Range[] = ["1D", "1W", "2W", "1M"];

// How many days back each range covers, and how long its cache is valid
const RANGE_CONFIG: Record<
  Range,
  { subtractDays: number; cacheExpiryDays: number }
> = {
  "1D": { subtractDays: 1, cacheExpiryDays: 1 },
  "1W": { subtractDays: 7, cacheExpiryDays: 7 },
  "2W": { subtractDays: 14, cacheExpiryDays: 14 },
  "1M": { subtractDays: 30, cacheExpiryDays: 30 },
};

const BRAND_GREEN = "#256F5C";

// Helpers

function buildDateList(range: Range): dayjs.Dayjs[] {
  const today = dayjs();
  const { subtractDays } = RANGE_CONFIG[range];
  const dates: dayjs.Dayjs[] = [];

  for (let i = subtractDays; i >= 0; i--) {
    dates.push(today.subtract(i, "day"));
  }

  return dates;
}

function getCacheKey(
  base: string,
  target: string,
  dateStr: string,
  range: Range,
) {
  return `history_${base}_${target}_${dateStr}_${range}`;
}

function readFreshCache(key: string, expiryDays: number): DataPoint | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  const cached = JSON.parse(raw) as DataPoint;
  const isExpired = dayjs().diff(dayjs(cached.cachedAt), "day") >= expiryDays;

  if (isExpired) {
    localStorage.removeItem(key);
    return null;
  }

  return cached;
}

// Subcomponents

function UnsupportedBaseMessage() {
  const { t } = useTranslation();

  return (
    <div className="text-center py-10 px-6 text-gray-500 flex flex-col items-center gap-2">
      <span className="text-3xl">😕</span>
      <p className="text-[1rem] font-light leading-relaxed max-w-xs">
        {t("chart.oops1")}{" "}
        <span className="font-semibold text-gray-700">$ USD</span>{" "}
        {t("chart.oops2")}
      </p>
    </div>
  );
}

function LoadingIndicator() {
  return (
    <div className="flex items-center justify-center py-12 text-[#256F5C]">
      <i className="bx bx-chart-spline text-[1.625rem] animate-bounce" />
    </div>
  );
}

function RangeSelector({
  selected,
  onChange,
}: {
  selected: Range;
  onChange: (r: Range) => void;
}) {
  return (
    <div className="flex justify-center gap-2 mb-8">
      {RANGES.map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={`
            px-3 py-[2px] rounded-full text-[0.875rem] font-frozen border transition-all duration-200
            ${
              r === selected
                ? "bg-[#256F5C] text-white border-[#256F5C] shadow-sm"
                : "bg-white text-gray-500 border-gray-200 hover:border-[#256F5C] hover:text-[#256F5C]"
            }
          `}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

function RateChart({
  data,
  base,
  target,
}: {
  data: DataPoint[];
  base: string;
  target: string;
}) {
  return (
    <ResponsiveContainer width="94%" height={200}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid horizontal={true} vertical={false} stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          axisLine={{ stroke: "#e5e7eb" }}
          tickLine={{ stroke: "#e5e7eb" }}
          tickMargin={6}
          minTickGap={10}
          tickFormatter={(tick) => dayjs(tick).format("MMM D")}
        />
        <YAxis
          domain={["auto", "auto"]}
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          axisLine={{ stroke: "#e5e7eb" }}
          tickLine={{ stroke: "#e5e7eb" }}
          tickMargin={6}
          width={54}
        />
        <Tooltip
          formatter={(value: number) => [
            value.toFixed(4),
            `${base} → ${target}`,
          ]}
          labelFormatter={(label: string) =>
            dayjs(label).format("MMMM D, YYYY")
          }
          contentStyle={{
            fontSize: "12px",
            padding: "6px 10px",
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
          labelStyle={{
            fontSize: "11px",
            color: "#6b7280",
            marginBottom: "2px",
          }}
          itemStyle={{ color: BRAND_GREEN, fontWeight: 600 }}
          cursor={{
            stroke: "#e5e7eb",
            strokeDasharray: "3 3",
            strokeWidth: 1.5,
          }}
        />
        <Line
          type="monotone"
          dataKey="rate"
          stroke={BRAND_GREEN}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: BRAND_GREEN, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Main component

export default function CurrencyHistoryChart({ base, target, appId }: Props) {
  const { t } = useTranslation();
  const [range, setRange] = useState<Range>("1W");
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const isUnsupportedBase = base !== "USD";

  useEffect(() => {
    if (isUnsupportedBase) {
      setData([]);
      setLoading(false);
      return;
    }

    async function fetchHistory() {
      setLoading(true);

      const { cacheExpiryDays } = RANGE_CONFIG[range];
      const dates = buildDateList(range);
      const results: DataPoint[] = [];

      for (const date of dates) {
        const dateStr = date.format("YYYY-MM-DD");
        const cacheKey = getCacheKey(base, target, dateStr, range);

        // Use cache if fresh
        const cached = readFreshCache(cacheKey, cacheExpiryDays);
        if (cached) {
          results.push(cached);
          continue;
        }

        // Otherwise fetch from API
        try {
          const url = `https://openexchangerates.org/api/historical/${dateStr}.json?app_id=${appId}&base=${base}&symbols=${target}`;
          const res = await axios.get<{ rates: Record<string, number> }>(url);
          const point: DataPoint = {
            date: dateStr,
            rate: res.data.rates[target],
            cachedAt: new Date().toISOString(),
          };
          localStorage.setItem(cacheKey, JSON.stringify(point));
          results.push(point);
        } catch {
          // Skip days that fail — the chart will simply have a gap
        }
      }

      setData(results);
      setLoading(false);
    }

    fetchHistory();
  }, [base, target, range, appId]);

  return (
    <div className="w-full mt-10 mb-3">
      {/* Header */}
      <h3 className="text-[1.375rem] font-frozen mb-5 text-[#256F5C] text-center">
        {base} — {target} {t("chart.title")}
      </h3>

      {isUnsupportedBase ? (
        <UnsupportedBaseMessage />
      ) : (
        <>
          <RangeSelector selected={range} onChange={setRange} />
          {loading ? (
            <LoadingIndicator />
          ) : (
            <RateChart data={data} base={base} target={target} />
          )}
        </>
      )}
    </div>
  );
}
