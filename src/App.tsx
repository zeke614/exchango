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
import { MOBILE_BREAKPOINT_PX, RATE_DECIMAL_PLACES } from "./constants";

const CurrencyDropdown = lazy(() => import("./components/currencies"));
const Footer = lazy(() => import("./components/footer"));

const DEFAULT_FROM = countriesData.currencies[0];
const DEFAULT_TO = countriesData.currencies[1];

export default function App() {
  const { t, ready } = useTranslation();

  const [fromCurrency, setFromCurrency] = useState(DEFAULT_FROM);
  const [toCurrency, setToCurrency] = useState(DEFAULT_TO);
  const [amount, setAmount] = useState("");

  const isMobile = window.innerWidth < MOBILE_BREAKPOINT_PX;

  const appId = import.meta.env.VITE_OPEN_EXCHANGE_RATES_APP_ID2;
  const ipInfoToken = import.meta.env.VITE_IPINFO_TOKEN;

  // Auto-detect the user's local currency and pre-fill toCurrency
  useDetectedCurrency(setToCurrency, ipInfoToken);

  const { rate, convertedAmount, lastUpdated, isLoading } = useExchangeRate(
    fromCurrency.code,
    toCurrency.code,
    amount,
    appId,
  );

  const relativeTime = useRelativeTime(lastUpdated);

  function handleAmountChange(raw: string) {
    // Strip formatting commas before storing
    setAmount(raw.replace(/,/g, ""));
  }

  function handleSwap() {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  }

  // Desktop
  if (!isMobile) {
    return (
      <>
        <PageMeta />
        <div className="min-h-screen flex items-center justify-center text-center p-6 bg-black text-white">
          <div className="text-xl">
            <h1 className="mb-2 text-2xl">
              The site is only accessible on mobile screens.
            </h1>
            <p className="flex items-center justify-center gap-1">
              Kindly visit on your mobile phone.{" "}
              <i className="bx bx-mobile-alt text-2xl" />
            </p>
            <p className="flex items-center justify-center gap-1">
              Thank you. <i className="bx bx-smile text-2xl" />
            </p>
          </div>
        </div>
      </>
    );
  }

  //  Main app
  return (
    <>
      <PageMeta />

      <div className="min-h-screen flex flex-col bg-[#fefefe] text-black">
        <Header />

        <main className="flex-grow px-[1rem]">
          <div className="pb-[3rem] pt-[4rem]">
            {/* Welcome message */}
            <h2 className="text-center text-[1.3125rem] mb-[1.5rem]">
              {t("welcome.welcomeLine1")}
              <span className="font-frozen text-xl">
                exchan<span className="text-[#256F5C]">go</span>,
              </span>
              <br />
              {t("welcome.welcomeLine2")}
            </h2>

            {/* How it works */}
            <section id="how-it-works" className="scroll-mt-[4.5rem]">
              <h3 className="text-center text-[#256F5C] text-2xl font-frozen">
                {t("welcome.guideTitle")}
              </h3>

              <div className="grid grid-rows-3 gap-[2.5rem] mb-[3.5rem] mt-[1.5rem] mx-[1.5rem] text-center">
                {["step1", "step2", "step3"].map((step, index) => (
                  <div
                    key={step}
                    className="bg-white px-[1.25rem] py-[1.875rem] flex flex-col justify-center items-center border border-black/5 rounded-3xl space-y-[1.5rem] shadow-md"
                  >
                    <h3 className="text-[2.075rem] font-frozen">
                      {index + 1}.
                    </h3>
                    <h4 className="text-[1.4375rem] text-gray-700 font-medium">
                      {t(`guide.${step}.title`)}
                    </h4>
                    <p className="text-[1.21875rem] text-gray-500">
                      {ready ? t(`guide.${step}.desc`) : "…"}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Converter */}
            <section id="converter" className="pt-[3rem]">
              <div className="bg-white py-[1.5rem] border-0 flex flex-col items-center gap-3">
                <h3 className="text-center text-2xl text-[#256F5C] font-frozen my-[0.75rem]">
                  {t("converterWords.title")}
                </h3>

                <div className="w-full max-w-xs">
                  <h4 className="text-lg text-center pb-[2.25rem]">
                    {t("converterWords.line1")}{" "}
                    <span className="font-medium text-xl">
                      {t("converterWords.highlight1")}
                    </span>{" "}
                    {t("converterWords.line2")}
                    <br />
                    <span className="font-medium text-[1.375rem] text-[#256F5C]">
                      {t("converterWords.highlight2")}
                    </span>
                    .
                  </h4>

                  {/* From currency + amount */}
                  <label className="block text-end text-[1.0625rem] text-gray-600 mb-[0.375rem]">
                    {t("converterWords.amount")}
                  </label>
                  <div className="flex items-center w-[20.5rem] justify-between border gap-5 border-black/5 rounded-xl px-3 py-[1.0625rem] bg-white shadow-sm">
                    <CurrencyDropdown
                      selected={fromCurrency}
                      setSelected={setFromCurrency}
                    />
                    <div className="w-[55%]" dir="ltr">
                      <input
                        type="text"
                        aria-label="Enter amount to convert"
                        value={amount.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        className="outline-none border-none w-full bg-transparent text-xl text-end font-medium appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Swap button / loading spinner */}
                {isLoading ? (
                  <div className="flex items-center justify-center animate-spin my-[1.75rem] text-[#256F5C]">
                    <FontAwesomeIcon
                      icon={faSackDollar}
                      className="text-[1.625rem]"
                    />
                  </div>
                ) : (
                  <button
                    onClick={handleSwap}
                    className="text-[1.625rem] my-[1.75rem] items-center bg-[#256F5C] rounded-full rotate-90 p-2 justify-center flex"
                    aria-label="Swap currencies"
                  >
                    <FontAwesomeIcon
                      icon={faRightLeft}
                      className="text-white text-lg"
                    />
                  </button>
                )}

                {/* To currency + converted amount */}
                <div className="w-full max-w-xs">
                  <label className="block text-end text-[1.0625rem] text-gray-600 mb-[0.5rem]">
                    {t("converterWords.convertedFigure")}
                  </label>
                  <div className="flex items-center justify-between gap-6 border border-black/5 rounded-xl px-3 py-[1.0625rem] bg-white shadow-sm">
                    <CurrencyDropdown
                      selected={toCurrency}
                      setSelected={setToCurrency}
                    />
                    <div className="w-[55%] min-w-0" dir="ltr">
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
                  <h5 className="text-center text-[1.375rem] font-frozen mt-[3rem]">
                    {t("converterWords.rate")}
                  </h5>
                  <p className="text-center text-[1.30rem] font-normal text-gray-600 mt-[0.375rem]">
                    {rate ? (
                      <>
                        {fromCurrency.symbol}1.00 {fromCurrency.code} ={" "}
                        {toCurrency.symbol}
                        {rate.toFixed(RATE_DECIMAL_PLACES)} {toCurrency.code}
                      </>
                    ) : (
                      "Could not fetch rate."
                    )}
                  </p>
                  {rate && relativeTime && (
                    <p className="text-center text-lg font-light text-gray-600 mt-[1rem] mb-[0.5rem]">
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
          </div>
        </main>

        <Suspense
          fallback={<span className="text-center font-light">Loading...</span>}
        >
          <Footer />
        </Suspense>
      </div>
    </>
  );
}
