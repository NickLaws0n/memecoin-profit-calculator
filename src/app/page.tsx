import MemecoinCalculator from "@/components/MemecoinCalculator"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B1120] py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">
          Memecoin Calculator
        </h1>
        <MemecoinCalculator />
      </div>
    </main>
  )
} 