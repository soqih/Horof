import Link from "next/link";
import { NeoButton } from "../components/ui/NeoButton";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--color-neo-bg)] flex flex-col items-center justify-center p-8 gap-12">

      <div className="max-w-2xl text-center flex flex-col gap-6 p-8 border-8 border-black bg-white shadow-neo-lg transform -rotate-1">
        <h1 className="text-6xl sm:text-7xl font-black uppercase text-black drop-shadow-[4px_4px_0px_var(--color-neo-pink)] rotate-2">
          حروف صب
        </h1>
        <p className="text-2xl font-bold">صبهم صب</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-8 mt-8">
        <Link href="/board">
          <NeoButton variant="primary" size="xl" className="w-full">
            لوحة اللعبة
          </NeoButton>
        </Link>

        <Link href="/buzzer">
          <NeoButton variant="red" size="xl" className="w-full">
            الجرس
          </NeoButton>
        </Link>
      </div>

    </div>
  );
}
