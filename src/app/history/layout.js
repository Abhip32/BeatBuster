import { SITE_NAME, SITE_URL } from "@/utils/siteConfig";

export const metadata = {
  title: `Recently Played - Jump Back In | ${SITE_NAME}`,
  description: `Revisit your recently played tracks, listening history, and favorite moments on ${SITE_NAME}.`,
  alternates: { canonical: `${SITE_URL}/history` },
  openGraph: {
    title: `Recently Played - Jump Back In | ${SITE_NAME}`,
    description: `Revisit your recently played tracks, listening history, and favorite moments on ${SITE_NAME}.`,
    url: `${SITE_URL}/history`,
  },
};

export default function HistoryLayout({ children }) {
  return children;
}
