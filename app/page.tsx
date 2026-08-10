import dynamic from "next/dynamic";
import Header from "@/app/components/header";
import Converter from "@/app/components/converter";
import { getExchangeRates } from "@/app/lib/rates";

const Footer = dynamic(() => import("@/app/components/footer"), {
  loading: () => (
    <span className="text-center font-light py-6 block text-black/40">
      Loading…
    </span>
  ),
});

export default async function Home() {
  const { rates, fetchedAt } = await getExchangeRates();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="grow mx-auto max-w-5xl py-14 sm:py-21 px-5 sm:px-8 lg:px-0">
        <Converter initialRates={rates} fetchedAt={fetchedAt} />
      </main>

      <Footer />
    </div>
  );
}
