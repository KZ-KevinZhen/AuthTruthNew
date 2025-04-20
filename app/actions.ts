"use server"
import { GoogleGenerativeAI } from "@google/generative-ai"


const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)

export async function analyzeContractAction(formData: FormData) {
  try {
    const file = formData.get("file") as File

    if (!file) {
      throw new Error("No file provided")
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error("File size exceeds 10MB limit")
    }

    // Check file type
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      throw new Error("Only image and PDF files are supported")
    }

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Data = buffer.toString("base64")

    // Use Gemini 1.5 Flash model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
      Analyze this car purchase contract image in detail. 
      
      Provide a comprehensive analysis with the following sections:
      
      1. CONTRACT TERMS: Extract all key terms from the contract including purchase price, interest rate, loan term, down payment, monthly payment, dealer fees, documentation fees, warranties, insurance, and any add-ons. For each term, provide:
         - The exact value
         - Whether the term is normal, concerning (warning), or highly concerning (high)
         - A detailed explanation of why this term is flagged (if applicable)
         
      2. POTENTIAL ISSUES: Identify any concerning elements in the contract such as:
         - Above-market interest rates
         - Overpriced warranties or add-ons
         - Excessive fees
         - Unfavorable clauses
         - Below-market trade-in values
         - missing information
         For each issue, provide:
         - A clear title
         - A detailed description
         - The severity (high, warning, or good)
         - A specific recommendation to address the issue
         
      3. TRUSTWORTHINESS SCORE: Provide a numerical score from 0-100 representing the overall fairness and transparency of the contract, where:
         - 0-59: Poor (many concerning terms)
         - 60-79: Caution (some concerning terms)
         - 80-100: Good (few or no concerning terms)
         
      4. SUMMARY: A concise paragraph summarizing the key findings and recommendations.
      
      Format your response as a JSON object with the following structure:
      {
        "contractTerms": [
          {
            "term": "string",
            "value": "string",
            "flag": "normal|warning|high|good",
            "details": "string"
          }
        ],
        "potentialIssues": [
          {
            "title": "string",
            "description": "string",
            "severity": "high|warning|good",
            "recommendation": "string"
          }
        ],
        "trustworthinessScore": number,
        "summary": "string"
      }
      
      Ensure your response is ONLY the JSON object with no additional text.
    `

    // Create the generative part for the image
    const generativePart = {
      inlineData: {
        data: base64Data,
        mimeType: file.type,
      },
    }

    const result = await model.generateContent([prompt, generativePart])
    const response = await result.response
    const text = response.text()

    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/{[\s\S]*}/)
      const jsonString = jsonMatch ? jsonMatch[0].replace(/```json|```/g, "") : text

      // Parse the JSON
      return { success: true, data: JSON.parse(jsonString) }
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError)
      throw new Error("Failed to parse the AI response. Please try again.")
    }
  } catch (error) {
    console.error("Error in analyzeContractAction:", error)

    // Provide more specific error messages for common issues
    if (error instanceof Error) {
      if (error.message.includes("deprecated")) {
        return {
          success: false,
          error: "The AI model is being updated. Please try again in a few moments.",
        }
      } else if (error.message.includes("rate limit")) {
        return {
          success: false,
          error: "Too many requests. Please try again in a few minutes.",
        }
      } else if (error.message.includes("parse")) {
        return {
          success: false,
          error: "Unable to analyze the contract. Please try a clearer image or a different file.",
        }
      }

      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: "An unknown error occurred while analyzing the contract.",
    }
  }
}
