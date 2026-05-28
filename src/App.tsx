import { useState, lazy, Suspense } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightLeft, faSackDollar } from "@fortawesome/free-solid-svg-icons";
import { NumericFormat } from "react-number-format";
import { useTranslation } from "react-i18next";

import Header from "./components/header";
import countriesData from "./components/data";
import CurrencyHistoryChart from "./components/historyChart";
import { PageMeta } from "./pageMeta";
import { useExchangeRate } from "../src/hooks/useExchangeRate";
import { useDetectedCurrency } from "../src/hooks/useDetectedCurrency";
import { useRelativeTime } from "../src/hooks/useRelativeTime";
import { RATE_DECIMAL_PLACES } from "./constants";

const CurrencyDropdown = lazy(() => import("./components/currencies"));
const Footer = lazy(() => import("./components/footer"));

const DEFAULT_FROM = countriesData.currencies[0];
const DEFAULT_TO = countriesData.currencies[1];

const STEPS = ["step1", "step2", "step3"] as const;

export default function App() {
  const { t, ready } = useTranslation();

  const [fromCurrency, setFromCurrency] = useState(DEFAULT_FROM);
  const [toCurrency, setToCurrency] = useState(DEFAULT_TO);
  const [amount, setAmount] = useState("");

  const appId = import.meta.env.VITE_OPEN_EXCHANGE_RATES_APP_ID2;
  const ipInfoToken = import.meta.env.VITE_IPINFO_TOKEN;

  useDetectedCurrency(setToCurrency, ipInfoToken);

  const { rate, convertedAmount, lastUpdated, isLoading } = useExchangeRate(
    fromCurrency.code,
    toCurrency.code,
    amount,
    appId,
  );

  const relativeTime = useRelativeTime(lastUpdated);

  function handleAmountChange(raw: string) {
    setAmount(raw.replace(/,/g, ""));
  }

  function handleSwap() {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  }

  return (
    <>
      <PageMeta />

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-grow px-5 sm:px-8 lg:px-0">
          <section className="pt-14 sm:pt-24 pb-10">
            <div className="max-w-2xl mx-auto gap-y-2 text-center">
              <h2 className="text-center text-black/65 dark:text-gray-300 text-xl mb-6">
                {t("welcome.welcomeLine1")}
                <span className="font-bold text-xl">
                  exchan<span className="text-[#256F5C]">go</span>,
                </span>
                <br />
                {t("welcome.welcomeLine2")}
              </h2>
            </div>
          </section>

          {/* How It Works */}
          <section id="how-it-works" className="scroll-mt-16 pb-10">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-center text-[#256F5C] text-2xl font-bold mb-8">
                {t("welcome.guideTitle")}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {STEPS.map((step, index) => (
                  <div
                    key={step}
                    className="px-5 py-7.5 flex flex-col justify-center items-center border border-black/6 dark:border-white/6 rounded-3xl space-y-[1.5rem] shadow-md"
                  >
                    <h3 className="text-3xl font-frozen">{index + 1}.</h3>
                    <h4 className="text-xl font-semibold">
                      {t(`guide.${step}.title`)}
                    </h4>
                    <p className="text-black/65 dark:text-gray-200 text-center">
                      {ready ? t(`guide.${step}.desc`) : "…"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Converter */}
          <section id="converter" className="pt-12">
            <div className="py-[1.5rem] border-0 flex flex-col items-center gap-3">
              <h3 className="text-center text-2xl text-[#256F5C] font-bold my-3">
                {t("converterWords.title")}
              </h3>

              <div className="w-full max-w-md">
                <h4 className="text-lg text-center pb-9">
                  {t("converterWords.line1")}{" "}
                  <span className="font-medium text-xl">
                    {t("converterWords.highlight1")}
                  </span>{" "}
                  {t("converterWords.line2")}
                  <br />
                  <span className="font-medium text-xl text-[#256F5C]">
                    {t("converterWords.highlight2")}
                  </span>
                  .
                </h4>

                {/* From currency + amount */}
                <label className="block text-end text-[1.0625rem] text-black/65 dark:text-gray-200 mb-1.5">
                  {t("converterWords.amount")}
                </label>
                <div className="flex items-center justify-between border gap-5 border-black/6 dark:border-white/6 rounded-xl px-3 py-3.5 shadow-sm">
                  <CurrencyDropdown
                    selected={fromCurrency}
                    setSelected={setFromCurrency}
                  />
                  <div className="w-[65%]" dir="ltr">
                    <input
                      inputMode="decimal"
                      aria-label="Enter amount to convert"
                      value={amount.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className="outline-none border-none w-full bg-transparent text-xl text-end font-medium appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none placeholder:text-lg"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Swap button / loading spinner */}
              {isLoading ? (
                <div className="flex items-center justify-center animate-spin my-7 text-[#256F5C]">
                  <FontAwesomeIcon
                    icon={faSackDollar}
                    className="text-[1.625rem]"
                  />
                </div>
              ) : (
                <button
                  onClick={handleSwap}
                  className="text-2xl my-7 items-center bg-[#256F5C] rounded-full rotate-90 p-2 justify-center flex"
                  aria-label="Swap currencies"
                >
                  <FontAwesomeIcon
                    icon={faRightLeft}
                    className="text-white text-lg"
                  />
                </button>
              )}

              {/* To currency + converted amount */}
              <div className="w-full max-w-md">
                <label className="block text-end text-[1.0625rem] text-black/65 dark:text-gray-200 mb-[0.5rem]">
                  {t("converterWords.convertedFigure")}
                </label>
                <div className="flex items-center justify-between gap-6 border border-black/6 dark:border-white/6 rounded-xl px-3 py-3.5 shadow-sm">
                  <CurrencyDropdown
                    selected={toCurrency}
                    setSelected={setToCurrency}
                  />

                  <div className="w-[65%] min-w-0" dir="ltr">
                    <NumericFormat
                      value={convertedAmount}
                      displayType="text"
                      thousandSeparator=","
                      className="w-full text-end text-xl font-medium block whitespace-nowrap overflow-x-auto no-scrollbar"
                    />
                  </div>
                </div>
              </div>

              {/* Exchange rate display */}
              <div>
                <h5 className="text-center text-[1.375rem] font-bold mt-12">
                  {t("converterWords.rate")}
                </h5>
                <p className="text-center text-xl font-normal mt-1.5">
                  {rate ? (
                    <>
                      {fromCurrency.symbol}1.00 {fromCurrency.code} ={" "}
                      {toCurrency.symbol}
                      <span className="font-semibold">
                        {rate.toFixed(RATE_DECIMAL_PLACES)}
                      </span>{" "}
                      {toCurrency.code}
                    </>
                  ) : (
                    "Could not fetch rate."
                  )}
                </p>
                {rate && relativeTime && (
                  <p className="text-center font-light text-black/65 dark:text-gray-200 mt-[1rem] mb-[0.5rem]">
                    {relativeTime}
                  </p>
                )}
              </div>

              <CurrencyHistoryChart
                base={fromCurrency.code}
                target={toCurrency.code}
                appId={appId}
              />
            </div>
          </section>
        </main>

        <Suspense
          fallback={
            <span className="text-center font-light py-6 block text-black/40">
              Loading…
            </span>
          }
        >
          <Footer />
        </Suspense>
      </div>
    </>
  );
}
