"use client";

import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { readCache, writeCache } from "@/app/lib/cache";
import {
  HISTORY_LIVE_DAY_CACHE_MINUTES,
  HISTORY_CLOSED_DAY_CACHE_MINUTES,
} from "@/app/lib/constants";
import posthog from "posthog-js";
import { PH_EVENTS } from "@/app/lib/constants";

dayjs.extend(utc);

interface Props {
  base: string;
  target: string;
}

interface DataPoint {
  date: string;
  rate: number;

   // OER's settled value, not a still-moving intraday snapshot.
   finalized?: boolean;
}

type Range = "1D" | "1W" | "2W" | "1M";

const RANGES: Range[] = ["1D", "1W", "2W", "1M"];

const RANGE_CONFIG: Record<Range, { subtractDays: number }> = {
  "1D": { subtractDays: 1 },
  "1W": { subtractDays: 7 },
  "2W": { subtractDays: 14 },
  "1M": { subtractDays: 30 },
};

const BRAND_GREEN = "#256F5C";

function buildDateList(range: Range): dayjs.Dayjs[] {
  const today = dayjs().utc();
  const { subtractDays } = RANGE_CONFIG[range];
  const dates: dayjs.Dayjs[] = [];

  for (let i = subtractDays; i >= 0; i--) {
    dates.push(today.subtract(i, "day"));
  }

  return dates;
}

function isTodayUTC(date: dayjs.Dayjs): boolean {
  const todayUTC = dayjs().utc().format("YYYY-MM-DD");
  return date.utc().format("YYYY-MM-DD") === todayUTC;
}

function getCacheKey(base: string, target: string, dateStr: string) {
  return `history_${base}_${target}_${dateStr}`;
}

function getHistoryCacheMinutes(date: dayjs.Dayjs): number {
  return isTodayUTC(date)
    ? HISTORY_LIVE_DAY_CACHE_MINUTES
    : HISTORY_CLOSED_DAY_CACHE_MINUTES;
}

function UnsupportedBaseMessage() {
  const { t } = useTranslation();

  return (
    <div className="text-center py-10 px-6 text-black/65 dark:text-gray-200 flex flex-col items-center gap-2">
      <span className="text-3xl">😕</span>
      <p className="leading-relaxed max-w-xs">
        {t("chart.oops1")} <span className="font-bold">$ USD</span>{" "}
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
    <div className="flex justify-center gap-2.5 mb-12">
      {RANGES.map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={`
            px-3 py-0.5 rounded-none text-sm font-bold border-2 transition-all duration-200 cursor-pointer shadow-lg
            ${
              r === selected
                ? "bg-[#256F5C] text-white border-[#256F5C] shadow-sm"
                : "bg-white dark:bg-[#242424] text-black/65 dark:text-gray-200 border-black/6 dark:border-white/6 hover:border-[#256F5C] hover:text-[#256F5C]"
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
  const { resolvedTheme } = useTheme();
  const tooltipBackground = resolvedTheme === "dark" ? "#242424" : "#ffffff";
  const tooltipBorder = resolvedTheme === "dark" ? "#3f3f3f" : "#e5e5e5";

  const defaultIndex = data.length > 0 ? data.length - 1 : 0;
  const [activeIndex, setActiveIndex] = useState<number | null>(defaultIndex);

  // 1. Track if the user is actively touching/hovering the chart
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    setActiveIndex(data.length > 0 ? data.length - 1 : 0);
  }, [data]);

  const handleMouseMove = (state: any) => {
    if (state && state.activeTooltipIndex !== undefined) {
      setIsHovering(true);
      setActiveIndex(state.activeTooltipIndex);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setActiveIndex(defaultIndex);
  };

  const renderCustomDot = (props: any) => {
    if (isHovering) return null;

    const { cx, cy, index } = props;
    if (index !== activeIndex) return null;

    return (
      <circle
        key={`dot-${index}`}
        cx={cx}
        cy={cy}
        r={4}
        fill={BRAND_GREEN}
        className="drop-shadow-md"
        style={{ outline: "none" }}
      />
    );
  };

  return (
    <div className="w-full max-w-md px-1 sm:px-0">
      <ResponsiveContainer width="98%" height={200}>
        <AreaChart
          data={data}
          margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={BRAND_GREEN} stopOpacity={0.2} />
              <stop offset="95%" stopColor={BRAND_GREEN} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            horizontal={true}
            vertical={false}
            className="stroke-gray-100 dark:stroke-white/5"
          />
          <XAxis
            dataKey="date"
            interval="preserveStartEnd"
            minTickGap={2}
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            axisLine={{ className: "stroke-gray-200 dark:stroke-white/10" }}
            tickLine={{ className: "stroke-gray-200 dark:stroke-white/10" }}
            tickMargin={6}
            tickFormatter={(tick) => dayjs(tick).format("MMM D")}
          />
          <YAxis
            domain={["auto", "auto"]}
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            axisLine={{ className: "stroke-gray-200 dark:stroke-white/10" }}
            tickLine={{ className: "stroke-gray-200 dark:stroke-white/10" }}
            tickMargin={6}
            width={62}
            tickFormatter={(value) => Number(value).toFixed(4)}
          />
          <Tooltip
            defaultIndex={defaultIndex}
            formatter={(value) => {
              const numericValue = Array.isArray(value)
                ? Number(value)
                : Number(value);
              return [
                Number.isFinite(numericValue) ? numericValue.toFixed(4) : "",
              ];
            }}
            labelFormatter={(label) => {
              if (typeof label === "string" || typeof label === "number") {
                return dayjs(label.toString()).format("MMMM D, YYYY");
              }
              return label;
            }}
            contentStyle={{
              background: tooltipBackground,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: 0,
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              fontSize: 11,
              padding: "2px 6px",
              textAlign: "center",
            }}
            labelStyle={{
              fontSize: "11px",
              color: "#6b7280",
              marginBottom: "0",
            }}
            itemStyle={{ color: BRAND_GREEN, fontWeight: 600 }}
            cursor={{
              className: "stroke-gray-200 dark:stroke-neutral-700",
              strokeDasharray: "3 3",
              strokeWidth: 1.5,
            }}
          />
          <Area
            type="linear"
            dataKey="rate"
            stroke={BRAND_GREEN}
            strokeWidth={2.25}
            fill="url(#rateGradient)"
            dot={renderCustomDot}
            activeDot={{
              r: 4,
              fill: BRAND_GREEN,
              stroke: "none",
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function CurrencyHistoryChart({ base, target }: Props) {
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

    let cancelled = false;

    async function fetchHistory() {
      setLoading(true);

      const dates = buildDateList(range);
      const results: DataPoint[] = [];

      for (const date of dates) {
        if (cancelled) return; // bail mid-loop, don't keep fetching for a stale currency

        const dateStr = date.format("YYYY-MM-DD");

        const cacheKey = getCacheKey(base, target, dateStr);

         const dateIsClosed = !isTodayUTC(date);
       const cached = readCache<DataPoint>(
         cacheKey,
         getHistoryCacheMinutes(date),
      );

      const cacheIsUsable = cached && (!dateIsClosed || cached.finalized);

      if (cacheIsUsable) {
         results.push(cached as DataPoint);
         continue;
      }

        try {
          const url = `/api/history?date=${dateStr}&base=${base}&target=${target}`;
          const res = await axios.get<{ rates: Record<string, number> }>(url);
          const point: DataPoint = {
            date: dateStr,
            rate: res.data.rates[target],
            finalized: dateIsClosed, // mark closed days as finalized for caching
          };

          writeCache(cacheKey, point);
          results.push(point);
        } catch {
          // Skip days that fail — the chart will simply have a gap
        }
      }

      if (cancelled) return; // don't commit a stale currency's results over a newer fetch
      setData(results);
      setLoading(false);
    }

    fetchHistory();

    return () => {
      cancelled = true;
    };
  }, [base, target, range, isUnsupportedBase]);

  function handleRangeChange(r: Range) {
    if (r === range) return;
    posthog.capture(PH_EVENTS.chartViewed, {
      from_currency: base,
      to_currency: target,
      range: r,
    });
    setRange(r);
  }

  return (
    <div className="w-full flex flex-col items-center justify-center mt-18 mb-3">
      <h3 className="text-[1.375rem] font-bold mb-5 text-[#256F5C] text-center">
        {base} – {target} {t("chart.title")}
      </h3>

      {isUnsupportedBase ? (
        <UnsupportedBaseMessage />
      ) : (
        <>
          <RangeSelector selected={range} onChange={handleRangeChange} />{" "}
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
