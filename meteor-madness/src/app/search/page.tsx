import type { Metadata } from "next";
import SearchClient from './SearchClient'

export const metadata: Metadata = {
  title: "Search Objects | NEOWatch",
  description: "Search and explore near-Earth objects and comets"
};

export default function SearchPage() {
  return <SearchClient />
}
