"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Upload, FileText, AlertTriangle, X, Loader2, CheckCircle } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { analyzeContractAction } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"

export function ContractAnalyzer() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<AnalysisResults | null>(null)
  const [progress, setProgress] = useState(0)
  const progressInterval = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
    setResults(null)

    if (selectedFile) {
      // Only create preview on client side
      if (typeof window !== "undefined") {
        const reader = new FileReader()
        reader.onload = (event) => {
          setPreview(event.target?.result as string)
        }

        if (selectedFile.type.startsWith("image/")) {
          reader.readAsDataURL(selectedFile)
        } else {
          // For PDFs or other documents, we'll just show the file name
          setPreview(null)
        }
      }
    } else {
      setPreview(null)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      setFile(droppedFile)
      setResults(null)

      // Only create preview on client side
      if (typeof window !== "undefined") {
        const reader = new FileReader()
        reader.onload = (event) => {
          setPreview(event.target?.result as string)
        }

        if (droppedFile.type.startsWith("image/")) {
          reader.readAsDataURL(droppedFile)
        } else {
          setPreview(null)
        }
      }
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const startProgressSimulation = () => {
    setProgress(0)

    // Clear any existing interval
    if (progressInterval.current) {
      clearInterval(progressInterval.current)
    }

    // Simulate progress
    progressInterval.current = setInterval(() => {
      setProgress((prevProgress) => {
        // Slowly increase up to 90%
        if (prevProgress >= 90) {
          clearInterval(progressInterval.current as NodeJS.Timeout)
          return 90
        }
        return prevProgress + Math.random() * 5
      })
    }, 300)
  }

  const stopProgressSimulation = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current)
      progressInterval.current = null
    }
    setProgress(100)

    // Reset progress after a short delay
    setTimeout(() => {
      setProgress(0)
    }, 500)
  }

  const handleAnalyze = async () => {
    if (!file) return

    setIsAnalyzing(true)
    setResults(null)
    startProgressSimulation()

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await analyzeContractAction(formData)

      if (response.success && response.data) {
        setResults(response.data)
      } else {
        toast({
          title: "Analysis Failed",
          description: response.error || "Failed to analyze the contract. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error analyzing contract:", error)

      // More user-friendly error message
      toast({
        title: "Analysis Failed",
        description:
          error instanceof Error
            ? error.message
            : "We couldn't analyze your contract. Please try again with a clearer image.",
        variant: "destructive",
      })
    } finally {
      stopProgressSimulation()
      setIsAnalyzing(false)
    }
  }

  const resetForm = () => {
    setFile(null)
    setPreview(null)
    setResults(null)
  }

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getTrustScoreText = (score: number) => {
    if (score >= 80) return "Good"
    if (score >= 60) return "Caution"
    return "Poor"
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card className="overflow-hidden bg-gray-900 border-gray-800">
        <CardContent className="p-0">
          {!file ? (
            <div
              className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-700 rounded-lg h-[400px]"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <Upload className="h-12 w-12 text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-200 mb-1">Upload your contract</h3>
              <p className="text-sm text-gray-400 text-center mb-4">Drag and drop your file here, or click to browse</p>
              <p className="text-xs text-gray-500 mb-4">Supports PDF, JPG, PNG (max 10MB)</p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <label>
                  Browse Files
                  <input type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
                </label>
              </Button>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute top-4 right-4 z-10">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={resetForm}
                  className="rounded-full h-8 w-8 bg-gray-800 hover:bg-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-6 bg-gray-900">
                <div className="flex items-center mb-4">
                  <FileText className="h-6 w-6 text-blue-500 mr-2" />
                  <span className="font-medium text-gray-200 truncate max-w-[250px]">{file.name}</span>
                </div>

                {preview && file.type.startsWith("image/") ? (
                  <div className="relative h-[300px] border border-gray-700 rounded-md overflow-hidden">
                    <Image src={preview || "/placeholder.svg"} alt="Contract preview" fill className="object-contain" />
                  </div>
                ) : (
                  <div className="h-[300px] border border-gray-700 rounded-md flex items-center justify-center bg-gray-800">
                    <FileText className="h-16 w-16 text-gray-600" />
                  </div>
                )}

                <div className="mt-4">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      "Analyze Contract"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          {isAnalyzing ? (
            <div className="h-full flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
              <h3 className="text-lg font-medium text-gray-200 mb-2">Analyzing your contract</h3>
              <p className="text-sm text-gray-400 text-center mb-6">
                Our AI is reviewing your document for terms and potential issues
              </p>
              <Progress value={progress} className="w-full max-w-xs bg-gray-800" />
            </div>
          ) : results ? (
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gray-800">
                <TabsTrigger
                  value="summary"
                  className="text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white"
                >
                  Summary
                </TabsTrigger>
                <TabsTrigger
                  value="terms"
                  className="text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white"
                >
                  Terms
                </TabsTrigger>
                <TabsTrigger
                  value="issues"
                  className="text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white"
                >
                  Issues
                </TabsTrigger>
                <TabsTrigger
                  value="score"
                  className="text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white"
                >
                  Score
                </TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="pt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-200">Contract Analysis</h3>
                    <div className={`font-bold text-lg ${getTrustScoreColor(results.trustworthinessScore)}`}>
                      {results.trustworthinessScore}/100
                    </div>
                  </div>
                  <p className="text-gray-300">{results.summary}</p>
                </div>
              </TabsContent>

              <TabsContent value="terms" className="pt-4">
                <h3 className="text-lg font-medium mb-4 text-gray-200">Contract Terms</h3>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {results.contractTerms.map((term, index) => (
                    <div key={index} className="border border-gray-800 rounded-md p-3 bg-gray-800/50">
                      <div className="flex justify-between items-center mb-1">
                        <div className="font-medium text-gray-200">{term.term}</div>
                        <div className="flex items-center">
                          <span
                            className={
                              term.flag === "high"
                                ? "text-red-400"
                                : term.flag === "warning"
                                  ? "text-yellow-400"
                                  : term.flag === "good"
                                    ? "text-green-400"
                                    : "text-gray-300"
                            }
                          >
                            {term.value}
                          </span>
                          {term.flag === "high" && <AlertTriangle className="ml-1 h-4 w-4 text-red-400" />}
                          {term.flag === "warning" && <AlertTriangle className="ml-1 h-4 w-4 text-yellow-400" />}
                          {term.flag === "good" && <CheckCircle className="ml-1 h-4 w-4 text-green-400" />}
                        </div>
                      </div>
                      {term.details && <p className="text-sm text-gray-400 mt-1">{term.details}</p>}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="issues" className="pt-4">
                <h3 className="text-lg font-medium mb-4 text-gray-200">Potential Issues</h3>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {results.potentialIssues.map((issue, index) => (
                    <div
                      key={index}
                      className={`border rounded-md p-3 ${
                        issue.severity === "high"
                          ? "border-red-900/50 bg-red-950/20"
                          : issue.severity === "warning"
                            ? "border-yellow-900/50 bg-yellow-950/20"
                            : "border-green-900/50 bg-green-950/20"
                      }`}
                    >
                      <div className="flex items-start">
                        {issue.severity === "high" && (
                          <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                        )}
                        {issue.severity === "warning" && (
                          <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                        )}
                        {issue.severity === "good" && (
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <h4 className="font-medium text-gray-200">{issue.title}</h4>
                          <p className="text-sm text-gray-400 mt-1">{issue.description}</p>
                          {issue.recommendation && (
                            <div className="mt-2">
                              <span className="text-sm font-medium text-gray-300">Recommendation: </span>
                              <span className="text-sm text-gray-400">{issue.recommendation}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="score" className="pt-4">
                <div className="text-center py-6">
                  <div className="relative inline-flex mb-6">
                    <div
                      className={`w-36 h-36 rounded-full border-8 ${
                        results.trustworthinessScore >= 80
                          ? "border-green-900/30"
                          : results.trustworthinessScore >= 60
                            ? "border-yellow-900/30"
                            : "border-red-900/30"
                      } flex items-center justify-center`}
                    >
                      <span className={`text-4xl font-bold ${getTrustScoreColor(results.trustworthinessScore)}`}>
                        {results.trustworthinessScore}
                      </span>
                    </div>
                    <div
                      className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full shadow-sm ${
                        results.trustworthinessScore >= 80
                          ? "bg-green-900/50 text-green-400"
                          : results.trustworthinessScore >= 60
                            ? "bg-yellow-900/50 text-yellow-400"
                            : "bg-red-900/50 text-red-400"
                      }`}
                    >
                      <span className="font-medium">{getTrustScoreText(results.trustworthinessScore)}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-medium mb-2 text-gray-200">Trustworthiness Score</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    This score represents the overall fairness and transparency of your contract based on industry
                    standards and consumer protection guidelines.
                  </p>

                  <div className="mt-6 grid grid-cols-3 gap-4 max-w-md mx-auto">
                    <div className="text-center p-3 bg-gray-800 rounded-md">
                      <div className="text-2xl font-bold text-red-500 mb-1">0-59</div>
                      <div className="text-sm text-gray-400">Poor</div>
                    </div>
                    <div className="text-center p-3 bg-gray-800 rounded-md">
                      <div className="text-2xl font-bold text-yellow-500 mb-1">60-79</div>
                      <div className="text-sm text-gray-400">Caution</div>
                    </div>
                    <div className="text-center p-3 bg-gray-800 rounded-md">
                      <div className="text-2xl font-bold text-green-500 mb-1">80-100</div>
                      <div className="text-sm text-gray-400">Good</div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-gray-700 mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">No contract analyzed yet</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                Upload a car purchase contract and click "Analyze" to get detailed feedback
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface AnalysisResults {
  contractTerms: {
    term: string
    value: string
    flag: "normal" | "warning" | "high" | "good"
    details?: string
  }[]
  potentialIssues: {
    title: string
    description: string
    severity: "high" | "warning" | "good"
    recommendation?: string
  }[]
  trustworthinessScore: number
  summary: string
}
