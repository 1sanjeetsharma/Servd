import { Button } from "@/components/ui/button";
import { PricingTable } from "@clerk/nextjs";
import Image from "next/image";

export default function Home() {
  return (
    <div className=" min-h-screen bg-stone-50 text-stone-900">
      <PricingTable />
      <section className="pt-32 pb-20 px-4">
        <Button variant="primary" size="xl">
          subscribe
        </Button>
      </section>
    </div>
  );
}
