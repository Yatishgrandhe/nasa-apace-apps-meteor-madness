import type { Metadata } from "next";
import NEOClient from './NEOClient'

export const metadata: Metadata = {
  title: "Space Objects Monitor | NEOWatch",
  description: "Monitor Near-Earth Objects with real-time orbital data and impact analysis"
};

export default function NEOPage() {
  return <NEOClient />
}
