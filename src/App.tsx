import { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightLeft } from "@fortawesome/free-solid-svg-icons";
import { faSackDollar } from "@fortawesome/free-solid-svg-icons";
import Header from "./components/header";
import { lazy, Suspense } from "react";
import countriesData from "./components/data";
import CurrencyHistoryChart from "./components/historyChart";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import { NumericFormat } from "react-number-format";
const CurrencyDropdown = lazy(() => import("./components/currencies"));
const Footer = lazy(() => import("./components/footer"));

function App() {
  const { t, ready } = useTranslation();
  const [fromCurrency, setFromCurrency] = useState(countriesData.currencies[0]);
  const [toCurrency, setToCurrency] = useState(countriesData.currencies[1]);
  const [amount, setAmount] = useState("");
  const [convertedAmount, setConvertedAmount] = useState("");
  const [rate, setRate] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [relativeTime, setRelativeTime] = useState<string>("");
  const [isMobile, setIsMobile] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  //const currencyApiKey = import.meta.env.VITE_CURRENCY_FREAKS_API_KEY;
  const ipInfoToken = import.meta.env.VITE_IPINFO_TOKEN;
  const openExchangeRatesAppId = import.meta.env
    .VITE_OPEN_EXCHANGE_RATES_APP_ID2;

  interface APIResponse {
    rates: {
      [key: string]: string;
    };
  }

  function getRelativeTime(
    date: Date,
    t: (key: string, options?: any) => string
  ) {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return t("updated.relative.seconds", { count: seconds });
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return t("updated.relative.minutes", { count: minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t("updated.relative.hours", { count: hours });
    const days = Math.floor(hours / 24);
    return t("updated.relative.days", { count: days });
  }

  useEffect(() => {
    async function detectLocationCurrency() {
      const cached = localStorage.getItem("user_currency");

      if (cached) {
        const cachedCurrency = JSON.parse(cached);
        setToCurrency(cachedCurrency);
        return;
      }

      try {
        const res = await fetch(`https://ipinfo.io/json?token=${ipInfoToken}`);
        const data = await res.json();
        const countryCode = data.country?.toUpperCase();

        if (countriesData.euroZone.includes(countryCode)) {
          const euroCurrency = countriesData.currencies.find(
            (currency) => currency.code === "EUR"
          );

          if (euroCurrency) {
            setToCurrency(euroCurrency);
            localStorage.setItem("user_currency", JSON.stringify(euroCurrency));
            return;
          }
        }

        const detectedCurrency = countriesData.currencies.find(
          (currency) => currency.flag.toUpperCase() === countryCode
        );

        if (detectedCurrency) {
          setToCurrency(detectedCurrency);
          localStorage.setItem(
            "user_currency",
            JSON.stringify(detectedCurrency)
          );
        }
      } catch (error) {
        console.error("Error detecting location:", error);
      }
    }

    detectLocationCurrency();
  }, []);

  async function fetchRates(showLoader = false) {
    if (showLoader) setIsLoading(true);

    const cacheKey = "exchange_rates";
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      const now = new Date();
      const cachedTime = new Date(parsed.timestamp);

      // Use cached data if it's less than 1 hour old
      const ageInMinutes = (now.getTime() - cachedTime.getTime()) / (1000 * 60);
      if (ageInMinutes < 60) {
        useRates(parsed.rates);
        if (showLoader) setIsLoading(false);
        return;
      }
    }

    // Fetch fresh rates and cache them
    try {
      const res = await axios.get<APIResponse>(
        `https://openexchangerates.org/api/latest.json?app_id=${openExchangeRatesAppId}`
      );

      const rates = res.data.rates;
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          rates,
          timestamp: new Date().toISOString(),
        })
      );

      useRates(rates);
    } catch (error) {
      console.error("Error fetching rates:", error);

      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        useRates(parsed.rates); // Use stale data as a fallback
      }
    } finally {
      if (showLoader) setIsLoading(false);
    }

    function useRates(rates: Record<string, string>) {
      const rateFrom = parseFloat(rates[fromCurrency.code]);
      const rateTo = parseFloat(rates[toCurrency.code]);

      const conversionRate = rateTo / rateFrom;
      setRate(conversionRate);
      setLastUpdated(new Date());

      if (amount && !isNaN(parseFloat(amount))) {
        const result = parseFloat(amount) * conversionRate;
        setConvertedAmount(result.toFixed(2));
      }
    }
  }

  useEffect(() => {
    fetchRates(false);
  }, [fromCurrency, toCurrency]);

  useEffect(() => {
    if (amount.trim() === "") {
      setConvertedAmount("");
    }
  }, [amount]);

  useEffect(() => {
    if (amount.trim() === "") return;
    if (!isNaN(parseFloat(amount))) {
      fetchRates(true);
    }
  }, [amount, fromCurrency, toCurrency]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (lastUpdated) {
        setRelativeTime(getRelativeTime(lastUpdated, t));
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  useEffect(() => {
    if (lastUpdated) {
      setRelativeTime(getRelativeTime(lastUpdated, t));
    }
  }, [lastUpdated]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);

    if (amount && !isNaN(parseFloat(amount))) {
      fetchRates(true);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 770);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isMobile) {
    return (
      <>
        <Helmet>
          <title>exchango – Smart Currency Converter</title>
          <meta
            name="description"
            content="Convert currencies with real-time rates and a clean, mobile-first interface."
          />
          <meta
            name="keywords"
            content="currency converter, money exchange, exchango, exchange rates, convert currencies online"
          />
          <meta name="author" content="exchango" />

          <meta
            property="og:title"
            content="exchango – Smart Currency Converter"
          />
          <meta
            property="og:description"
            content="Convert currencies with real-time rates and a clean, mobile-first interface."
          />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://exchangoio.vercel.app" />
          <meta name="twitter:card" content="summary" />
          <meta
            name="twitter:title"
            content="exchango – Smart Currency Converter"
          />
          <meta
            name="twitter:description"
            content="Convert currencies with real-time rates and a clean, mobile-first interface."
          />

          <link rel="canonical" href="https://exchangoio.vercel.app" />
        </Helmet>

        <div className="min-h-screen flex items-center justify-center text-center p-6 bg-black text-white">
          <div className="text-xl">
            <h1 className="mb-2 text-2xl">
              The site is only accessible on mobile screens.
            </h1>
            <p className="flex items-center justify-center gap-1">
              Kindly visit on your mobile phone.{" "}
              <i className="bx bx-mobile-alt text-2xl"></i>
            </p>
            <p className="flex items-center justify-center gap-1">
              Thank you. <i className="bx bx-smile text-2xl"></i>
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>exchango – Smart Currency Converter</title>
        <meta
          name="description"
          content="Convert currencies with real-time rates and a clean, mobile-first interface."
        />
        <meta
          name="keywords"
          content="currency converter, money exchange, exchango, exchange rates, convert currencies online"
        />
        <meta name="author" content="exchango" />

        <meta
          property="og:title"
          content="exchango – Smart Currency Converter"
        />
        <meta
          property="og:description"
          content="Convert currencies with real-time rates and a clean, mobile-first interface."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://exchangoio.vercel.app" />

        <meta name="twitter:card" content="summary" />
        <meta
          name="twitter:title"
          content="exchango – Smart Currency Converter"
        />
        <meta
          name="twitter:description"
          content="Convert currencies with real-time rates and a clean, mobile-first interface."
        />

        <link rel="canonical" href="https://exchangoio.vercel.app" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-[#fefefe] text-black">
        <Header />
        <main className="flex-grow px-[1rem]">
          <div className="pb-[3rem] pt-[4rem]">
            <h2 className="text-center text-[1.3125rem] mb-[1.5rem]">
              {t("welcome.welcomeLine1")}
              <span className="font-medium text-[1.375rem]">
                exchan<span className="text-[#256F5C]">go</span>,
              </span>
              <br />
              {t("welcome.welcomeLine2")}
            </h2>

            <section id="how-it-works" className="scroll-mt-[4.5rem]">
              <h3 className="text-center text-[#256F5C] text-[1.875rem] font-medium">
                {t("welcome.guideTitle")}
              </h3>

              <div className="grid grid-rows-3 gap-[2.5rem] mb-[3.5rem] mt-[1.5rem] mx-[1.5rem] text-center">
                {["step1", "step2", "step3"].map((step, index) => (
                  <div
                    key={step}
                    className="bg-white px-[1.25rem] py-[1.875rem] flex flex-col justify-center items-center border border-gray-200 rounded-3xl space-y-[1.5rem] shadow-md"
                  >
                    <h3 className="text-[2.375rem] font-semibold">
                      {index + 1}.
                    </h3>
                    <h4 className="text-[1.4375rem] font-medium">
                      {t(`guide.${step}.title`)}
                    </h4>
                    <p className="text-[1.21875rem]">
                      {ready
                        ? t(`guide.${step}.desc`)
                        : "Use the dropdowns to choose the currency you're converting from (e.g. USD) and the one you're converting to (e.g. GHS)."}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section id="converter" className="pt-[3rem]">
              <div className="bg-white py-[1.5rem] border-0 flex flex-col items-center gap-3">
                <h3 className="text-center text-[1.625rem] text-[#256F5C] font-medium my-[0.75rem]">
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
                    <span>.</span>
                  </h4>

                  <label className="block text-end text-[1.0625rem] text-gray-600 mb-[0.375rem]">
                    {t("converterWords.amount")}
                  </label>
                  <div className="flex items-center justify-between border gap-5 border-gray-200 rounded-xl px-3 py-[1.0625rem] bg-white shadow-sm">
                    <CurrencyDropdown
                      selected={fromCurrency}
                      setSelected={setFromCurrency}
                    />
                    <div className="w-[55%]" dir="ltr">
                      <input
                        type="text"
                        aria-label="Enter amount to convert"
                        value={amount.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        onChange={(e) => {
                          const input = e.target.value.replace(/,/g, "");
                          setAmount(input);
                          if (input.trim() === "") {
                            setConvertedAmount("");
                            return;
                          }
                        }}
                        className="outline-none border-none w-full bg-transparent text-xl text-end font-medium appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

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

                <div className="w-full max-w-xs">
                  <label className="block text-end text-[1.0625rem] text-gray-600 mb-[0.5rem]">
                    {t("converterWords.convertedFigure")}
                  </label>
                  <div className="flex items-center justify-between gap-6 border border-gray-200 rounded-xl px-3 py-[1.0625rem] bg-white shadow-sm">
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

                <div>
                  <h5 className="text-center text-2xl font-medium mt-[3rem]">
                    {t("converterWords.rate")}
                  </h5>
                  <p className="text-center text-[1.375rem] font-medium text-gray-600 mt-[0.375rem]">
                    {rate
                      ? `${fromCurrency.symbol}1.00 ${fromCurrency.code} = ${
                          toCurrency.symbol
                        }${rate.toFixed(4)} ${toCurrency.code}`
                      : "Could not fetch rate."}
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
                  appId={openExchangeRatesAppId}
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

export default App;
