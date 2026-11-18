import type { Metadata } from "next";
import Museum from "@/components/museum/Museum";

export const metadata: Metadata = {
  title: "Clémentine Sanchez — Le musée (prototype)",
  robots: { index: false, follow: false },
};

export default function MuseumPrototype() {
  return <Museum />;
}
