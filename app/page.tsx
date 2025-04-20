import { ContractAnalyzer } from "@/components/contract-analyzer"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950">
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <header className="mb-8 text-center">
          <img src="/autotruthclear.png" alt="AutoTruth Clear" className="mx-auto mb-6 h-32 w-auto" />
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-2">AutoTruth Contract Analyzer</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Upload your car purchase contract to get an instant analysis of terms, potential scams, and trustworthiness
            score.
          </p>
        </header>

        <ContractAnalyzer />
      </div>
    </main>
  )
}
