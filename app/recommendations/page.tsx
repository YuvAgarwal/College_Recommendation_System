"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronUp, ExternalLink, ArrowLeft } from "lucide-react"
import type { JSX } from "react"

const SeeMoreSection = ({
  title,
  colleges,
  color,
}: { title: string; colleges: Array<{ name: string; website: string }>; color: string }) => {
  const [expanded, setExpanded] = useState(false)

  const colorClasses = {
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-800",
    blue: "bg-blue-50 border-blue-200 text-blue-800",
  }

  const bgClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue

  return (
    <div className={`mb-6 p-4 ${bgClass} border rounded-xl`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left font-semibold hover:opacity-80 transition-opacity"
      >
        <span className="text-lg">
          {title} ({colleges.length})
        </span>
        {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {expanded && (
        <div className="mt-4 space-y-3">
          {colleges.map((college, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
              <span className="font-medium text-gray-800 flex-1 mr-4">{college.name}</span>
              {college.website && (
                <a
                  href={college.website.startsWith("http") ? college.website : `https://${college.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 rounded-lg text-sm font-medium transition-colors border border-blue-200 flex-shrink-0"
                >
                  Visit Website
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const formatRecommendations = (text: string) => {
  const lines = text.split("\n").filter((line) => line.trim())
  const formattedElements: JSX.Element[] = []
  let currentSection = ""
  let governmentHeaderAdded = false
  let privateHeaderAdded = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // Skip duplicate section headers
    if (line.toLowerCase().includes("government") && line.toLowerCase().includes("college")) {
      if (governmentHeaderAdded) continue

      currentSection = "government"
      governmentHeaderAdded = true
      formattedElements.push(
        <div key={`govt-header-${i}`} className="mb-8 mt-8 first:mt-0">
          <h2 className="text-2xl font-bold text-emerald-700 mb-6 pb-3 border-b-2 border-emerald-200 flex items-center">
            Government Engineering Colleges
          </h2>
        </div>,
      )
      continue
    }

    if (line.toLowerCase().includes("private") && line.toLowerCase().includes("college")) {
      if (privateHeaderAdded) continue

      currentSection = "private"
      privateHeaderAdded = true
      formattedElements.push(
        <div key={`private-header-${i}`} className="mb-8 mt-8">
          <h2 className="text-2xl font-bold text-blue-700 mb-6 pb-3 border-b-2 border-blue-200 flex items-center">
            Private Engineering Colleges
          </h2>
        </div>,
      )
      continue
    }

    const collegeMatch = line.match(/^(\d+)\.\s*(.+)/)
    if (collegeMatch && currentSection) {
      const number = collegeMatch[1]
      let collegeName = collegeMatch[2].replace(/\*\*/g, "").trim()

      let website = ""

      // Look for URL in current line
      const urlMatch = line.match(/(https?:\/\/[^\s)]+)/g)
      if (urlMatch) {
        website = urlMatch[0].replace(/[.,;:)]+$/, "")
        collegeName = collegeName.replace(/(https?:\/\/[^\s)]+)/g, "").trim()
      }

      // Look for URL in next few lines
      if (!website) {
        for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
          const nextLine = lines[j].trim()

          // Stop if we hit the next college number
          if (nextLine.match(/^\d+\./)) break

          // Stop if we hit a new section header
          if (nextLine.toLowerCase().includes("college")) break

          const nextUrlMatch = nextLine.match(/(https?:\/\/[^\s)]+)/g)
          if (nextUrlMatch) {
            website = nextUrlMatch[0].replace(/[.,;:)]+$/, "")
            break
          }

          const websiteMatch = nextLine.match(/Website:\s*(https?:\/\/[^\s)]+)/i)
          if (websiteMatch) {
            website = websiteMatch[1].replace(/[.,;:)]+$/, "")
            break
          }
        }
      }

      formattedElements.push(
        <div key={`college-${currentSection}-${number}-${i}`} className="mb-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold flex-shrink-0">
                {number}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{collegeName}</h3>

                {website && (
                  <div className="mb-3">
                    <a
                      href={website.startsWith("http") ? website : `https://${website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 rounded-lg text-sm font-medium transition-colors border border-blue-200"
                    >
                      Visit Website
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}

                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Excellent engineering programs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Strong industry connections</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span>Good placement opportunities</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
      )
      continue
    }

    const standaloneUrlMatch = line.match(/^(https?:\/\/[^\s)]+)/)
    if (standaloneUrlMatch && !line.match(/^\d+\./)) {
      const url = standaloneUrlMatch[1].replace(/[.,;:)]+$/, "")
      formattedElements.push(
        <div key={i} className="mb-3">
          <a
            href={url.startsWith("http") ? url : `https://${url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 rounded-lg text-sm font-medium transition-colors border border-blue-200"
          >
            Visit Website
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>,
      )
      continue
    }

    if (line.includes("**") || line.includes("Note:") || line.includes("Based on")) {
      formattedElements.push(
        <div key={i} className="mb-4">
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
            <p className="text-amber-800 text-sm font-medium">{line.replace(/\*\*/g, "")}</p>
          </div>
        </div>,
      )
      continue
    }

    if (line.length > 10 && !line.match(/^https?:\/\//)) {
      formattedElements.push(
        <div key={i} className="mb-3">
          <p className="text-gray-700 leading-relaxed">{line}</p>
        </div>,
      )
    }
  }

  return formattedElements
}

export default function RecommendationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [recommendations, setRecommendations] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const data = searchParams.get("data")
    if (data) {
      try {
        const decoded = JSON.parse(decodeURIComponent(data))
        setRecommendations(decoded.recommendations)
      } catch (error) {
        console.error("Error decoding recommendations:", error)
      }
    }
    setLoading(false)
  }, [searchParams])

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <Button onClick={() => router.push("/")} variant="outline" className="mb-8 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Form
          </Button>

          {loading ? (
            <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
              <CardContent className="p-8 flex items-center justify-center">
                <div className="text-center">
                  <svg
                    className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12V0L4 12H0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <p className="text-gray-600">Loading recommendations...</p>
                </div>
              </CardContent>
            </Card>
          ) : recommendations ? (
            <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-t-lg">
                <CardTitle className="flex items-center space-x-3 text-2xl font-bold text-gray-800">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138z"
                    />
                  </svg>
                  Your College Recommendations
                </CardTitle>
                <CardDescription>Based on your profile and preferences</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-4">{formatRecommendations(recommendations)}</div>
              </CardContent>
            </Card>
          ) : (
            <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
              <CardContent className="p-8 text-center">
                <p className="text-gray-600">No recommendations available. Please fill out the form first.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}
