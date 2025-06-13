import { useState, useEffect } from "react";
import axios from "axios";
import Header from "./components/header";
import { lazy, Suspense } from "react";
import countriesData from "./components/data";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
const CurrencyDropdown = lazy(() => import("./components/currencies"));
const Footer = lazy(() => import("./components/footer"));

function App() {
  const { t } = useTranslation();
  const [fromCurrency, setFromCurrency] = useState(countriesData.currencies[0]);
  const [toCurrency, setToCurrency] = useState(countriesData.currencies[1]);
  const [amount, setAmount] = useState("");
  const [convertedAmount, setConvertedAmount] = useState("");
  const [rate, setRate] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [relativeTime, setRelativeTime] = useState<string>("");
  const [isMobile, setIsMobile] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const currencyApiKey = import.meta.env.VITE_CURRENCY_FREAKS_API_KEY;
  const ipInfoToken = import.meta.env.VITE_IPINFO_TOKEN;

  interface CurrencyFreaksResponse {
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

    try {
      const res = await axios.get<CurrencyFreaksResponse>(
        `https://api.currencyfreaks.com/v2.0/rates/latest?apikey=${currencyApiKey}`
      );

      const rates = res.data.rates;
      const rateFrom = parseFloat(rates[fromCurrency.code]);
      const rateTo = parseFloat(rates[toCurrency.code]);

      const conversionRate = rateTo / rateFrom;
      setRate(conversionRate);
      setLastUpdated(new Date());

      if (amount && !isNaN(parseFloat(amount))) {
        const result = parseFloat(amount) * conversionRate;
        setConvertedAmount(result.toFixed(2));
      }
    } catch (error) {
      console.error("Error fetching rates:", error);
    } finally {
      if (showLoader) setIsLoading(false);
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
    if (amount && !isNaN(parseFloat(amount))) {
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
        <main className="flex-grow px-4">
          <div className="pb-12 pt-16">
            <h2 className="text-center text-[21px] mb-6">
              {t("welcome.welcomeLine1")}
              <span className="font-medium text-[22px]">
                exchan<span className="text-[#256F5C]">go</span>,
              </span>
              <br />
              {t("welcome.welcomeLine2")}
            </h2>

            <section id="converter" className="pt-12">
              <div className="bg-white px-3.5 py-6 border border-gray-200 rounded-2xl flex flex-col items-center gap-3 shadow-md">
                <h3 className="text-center text-[26px] text-[#256F5C] font-medium my-3">
                  {t("converterWords.title")}
                </h3>

                <div className="w-full max-w-xs">
                  <label className="block text-end text-[17px] text-gray-600 mb-1.5">
                    {t("converterWords.amount")}
                  </label>
                  <div className="flex items-center justify-between border gap-6 border-gray-200 rounded-xl px-4 py-[17px] bg-white shadow-sm">
                    <Suspense
                      fallback={
                        <span className="text-center font-light">
                          Loading...
                        </span>
                      }
                    >
                      <CurrencyDropdown
                        selected={fromCurrency}
                        setSelected={setFromCurrency}
                      />
                    </Suspense>
                    <div className="w-[52%]">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="outline-none border-none w-full bg-transparent text-xl text-end font-medium appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center animate-spin mt-6 mb-4 text-[#256F5C]">
                    <span className="material-symbols-outlined text-[40px]">
                      currency_exchange
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={handleSwap}
                    className="text-[26px] my-7 items-center bg-[#256F5C] rounded-full rotate-90 p-2 justify-center flex"
                    title="Swap currencies"
                  >
                    <span className="material-symbols-outlined text-white">
                      sync_alt
                    </span>
                  </button>
                )}

                <div className="w-full max-w-xs">
                  <label className="block text-end text-[17px] text-gray-600 mb-2">
                    {t("converterWords.convertedFigure")}
                  </label>
                  <div className="flex items-center justify-between gap-6 border border-gray-200 rounded-xl px-4 py-[17px] bg-white shadow-sm">
                    <Suspense
                      fallback={
                        <span className="text-center font-light">
                          Loading...
                        </span>
                      }
                    >
                      <CurrencyDropdown
                        selected={toCurrency}
                        setSelected={setToCurrency}
                      />
                    </Suspense>
                    <div className="w-[52%]">
                      <input
                        type="text"
                        value={convertedAmount}
                        readOnly
                        className="outline-none border-none w-full bg-transparent text-xl text-end font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-center text-2xl font-medium mt-12">
                    {t("converterWords.rate")}
                  </h5>
                  <p className="text-center text-[22px] font-medium text-gray-600 mt-1.5">
                    {rate
                      ? `${fromCurrency.symbol}1.00 ${fromCurrency.code} = ${
                          toCurrency.symbol
                        }${rate.toFixed(4)} ${toCurrency.code}`
                      : "Could not fetch rate."}
                  </p>

                  {rate && relativeTime && (
                    <p className="text-center text-lg font-light text-gray-600 mt-4 mb-2">
                      {relativeTime}
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>
        </main>
        <Suspense
          fallback={<span className="text-center font-light">Loading...</span>}
        >
          <Footer />
        </Suspense>{" "}
      </div>
    </>
  );
}

export default App;
