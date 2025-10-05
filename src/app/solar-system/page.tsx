import type { Metadata } from "next";
import SolarSystemClient from './SolarSystemClient'

export const metadata: Metadata = {
  title: "Solar System 3D | NEOWatch",
  description: "Interactive 3D visualization of our solar system"
};

export default function SolarSystemPage() {
  return <SolarSystemClient />
}
