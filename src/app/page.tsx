import MemecoinCalculator from "@/components/MemecoinCalculator"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f1faff] py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-text-primary">
          Memecoin Calculator
        </h1>
        <MemecoinCalculator />
      </div>
    </main>
  )
} 