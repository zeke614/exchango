import Converter from "@/app/components/converter";
import { getExchangeRates } from "@/app/lib/rates";
import OfflineBanner from "./components/offlineBanner";
import InstallPrompt from "./components/installPrompt";

export default async function Home() {
  const { rates, fetchedAt } = await getExchangeRates();

  return (
    <>
      <OfflineBanner fetchedAt={fetchedAt} />

      <main className="mx-auto max-w-5xl pt-16.5 pb-12 px-5 sm:px-8 lg:px-0">
        <Converter initialRates={rates} fetchedAt={fetchedAt} />
      </main>

      <InstallPrompt />
    </>
  );
}
