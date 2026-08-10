"use client";

import i18n from "@/app/lib/i18n";
import { I18nextProvider } from "react-i18next";

// i18n.ts's i18n.use(...).init(...) runs at module import time (side
// effect of the "@/lib/i18n" import above) — same as the old main.tsx
// side-effect import, just relocated into a client component since it
// touches i18next singleton/browser state.
//
// Rendering isn't gated on init completion: resources are bundled
// synchronously (see lib/i18n.ts), so init resolves before first paint
// in practice. useTranslation()'s own `ready` flag (already used in
// App.tsx for the guide step descriptions) covers any edge-case gap.

export function I18nProvider({ children }: { children: React.ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
