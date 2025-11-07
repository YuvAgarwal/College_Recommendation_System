"use client"

import type React from "react"
import type { JSX } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronsUpDown, ExternalLink, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

const examsList = [
  "JEE Main",
  "JEE Advanced",
  "BITSAT",
  "VITEEE",
  "SRMJEEE",
  "WBJEE",
  "COMEDK",
  "MHT CET",
  "KCET",
  "AP EAMCET",
  "TS EAMCET",
  "Other",
]

const specializations = [
  "Computer Science and Engineering",
  "Artificial Intelligence and Machine Learning",
  "Data Science and Big Data Analytics",
  "Cyber Security",
  "Electronics and Communication Engineering",
  "Information Technology",
  "Mechanical Engineering (with Robotics and Automation)",
  "Electrical and Electronics Engineering",
  "Civil Engineering (with Smart Infrastructure and Environmental Engineering)",
  "Biotechnology and Biomedical Engineering",
  "Other",
]

const states = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
]

// Simple and clean function to format recommendations
const formatRecommendations = (text: string) => {
  const lines = text.split("\n").filter((line) => line.trim())
  const formattedElements: JSX.Element[] = []
  let currentSection = ""
  let collegeCount = 0
  let sectionHasColleges = false
  const additionalColleges: { [key: string]: Array<{ name: string; website: string }> } = {
    government: [],
    private: [],
  }

  // First pass: check if sections have colleges
  const governmentColleges = lines.filter(
    (line) =>
      line.match(/^\d+\./) &&
      lines.some(
        (prevLine, index) =>
          index < lines.indexOf(line) &&
          prevLine.toLowerCase().includes("government") &&
          prevLine.toLowerCase().includes("college"),
      ),
  )

  const privateColleges = lines.filter(
    (line) =>
      line.match(/^\d+\./) &&
      lines.some(
        (prevLine, index) =>
          index < lines.indexOf(line) &&
          prevLine.toLowerCase().includes("private") &&
          prevLine.toLowerCase().includes("college"),
      ),
  )

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // Section headers - only show if there are colleges in that section
    if (line.toLowerCase().includes("government") && line.toLowerCase().includes("college")) {
      if (governmentColleges.length === 0) continue // Skip if no government colleges

      currentSection = "government"
      collegeCount = 0
      sectionHasColleges = false
      formattedElements.push(
        <div key={i} className="mb-8 mt-8 first:mt-0">
          <h2 className="text-2xl font-bold text-emerald-700 mb-6 pb-3 border-b-2 border-emerald-200 flex items-center">
            🏛️ Government Engineering Colleges
          </h2>
        </div>,
      )
      continue
    }

    if (line.toLowerCase().includes("private") && line.toLowerCase().includes("college")) {
      if (privateColleges.length === 0) continue // Skip if no private colleges

      currentSection = "private"
      collegeCount = 0
      sectionHasColleges = false
      formattedElements.push(
        <div key={i} className="mb-8 mt-8">
          <h2 className="text-2xl font-bold text-blue-700 mb-6 pb-3 border-b-2 border-blue-200 flex items-center">
            🏢 Private Engineering Colleges
          </h2>
        </div>,
      )
      continue
    }

    // College entries (numbered)
    const collegeMatch = line.match(/^(\d+)\.\s*(.+)/)
    if (collegeMatch) {
      const number = collegeMatch[1]
      let collegeName = collegeMatch[2].replace(/\*\*/g, "").trim()
      sectionHasColleges = true

      // Extract website from the same line or next few lines
      let website = ""

      // Check current line for URL
      const urlMatch = line.match(/(https?:\/\/[^\s)]+)/g)
      if (urlMatch) {
        website = urlMatch[0].replace(/[.,;:)]+$/, "")
        collegeName = collegeName.replace(/(https?:\/\/[^\s)]+)/g, "").trim()
      }

      // Look for website in next few lines if not found
      if (!website) {
        for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
          const nextLine = lines[j].trim()
          if (nextLine.match(/^\d+\./)) break // Stop at next college

          // Look for URLs in various formats
          const nextUrlMatch = nextLine.match(/(https?:\/\/[^\s)]+)/g)
          if (nextUrlMatch) {
            website = nextUrlMatch[0].replace(/[.,;:)]+$/, "")
            break
          }

          // Look for "Website:" prefix
          const websiteMatch = nextLine.match(/Website:\s*(https?:\/\/[^\s)]+)/i)
          if (websiteMatch) {
            website = websiteMatch[1].replace(/[.,;:)]+$/, "")
            break
          }
        }
      }

      collegeCount++

      // Show first 4 colleges in detail, rest in "See More"
      if (collegeCount > 4 && currentSection) {
        additionalColleges[currentSection].push({ name: collegeName, website })
        continue
      }

      // Display college card
      formattedElements.push(
        <div key={i} className="mb-6">
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
                      🌐 Visit Website
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

    // Handle standalone URLs that might be on their own lines
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
            🌐 Visit Website
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>,
      )
      continue
    }

    // Handle other content (notes, descriptions, etc.)
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

    // Regular text - but skip if it's just a URL
    if (line.length > 10 && !line.match(/^https?:\/\//)) {
      formattedElements.push(
        <div key={i} className="mb-3">
          <p className="text-gray-700 leading-relaxed">{line}</p>
        </div>,
      )
    }
  }

  // Add "See More" sections only if there are additional colleges
  Object.keys(additionalColleges).forEach((section) => {
    if (additionalColleges[section].length > 0) {
      const sectionColor = section === "government" ? "emerald" : "blue"
      const sectionIcon = section === "government" ? "🏛️" : "🏢"

      formattedElements.push(
        <SeeMoreSection
          key={`see-more-${section}`}
          title={`${sectionIcon} More ${section.charAt(0).toUpperCase() + section.slice(1)} Colleges`}
          colleges={additionalColleges[section]}
          color={sectionColor}
        />,
      )
    }
  })

  return formattedElements
}

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

export default function RecommendationForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    board_percentage: "",
    board_name: "",
    passing_year: "",
    has_taken_exams: false,
    college_type: "Either",
    preferred_location: "",
    budget_range: "₹2L – ₹5L/year",
    specialization: "",
    other_specialization: "",
  })

  const [selectedExams, setSelectedExams] = useState<string[]>([])
  const [examDetails, setExamDetails] = useState<Record<string, any>>({})
  const [openLocation, setOpenLocation] = useState(false)
  const [openSpecialization, setOpenSpecialization] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleExamSelection = (exam: string, checked: boolean) => {
    if (checked) {
      setSelectedExams([...selectedExams, exam])
      setExamDetails({
        ...examDetails,
        [exam]: {
          score_type: "Rank",
          value: 0,
          year: "",
          ...(exam === "Other" ? { exam_name: "" } : {}),
        },
      })
    } else {
      setSelectedExams(selectedExams.filter((e) => e !== exam))
      const newDetails = { ...examDetails }
      delete newDetails[exam]
      setExamDetails(newDetails)
    }
  }

  const updateExamDetail = (exam: string, field: string, value: any) => {
    setExamDetails({
      ...examDetails,
      [exam]: {
        ...examDetails[exam],
        [field]: value,
      },
    })
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters."
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address."
    }

    if (!formData.phone || !/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits."
    }

    if (
      !formData.board_percentage ||
      Number(formData.board_percentage) <= 0 ||
      Number(formData.board_percentage) > 100
    ) {
      newErrors.board_percentage = "Percentage is required and must be between 0 and 100."
    }

    if (!formData.board_name) {
      newErrors.board_name = "Please select a board."
    }

    if (!formData.passing_year) {
      newErrors.passing_year = "Please enter passing year."
    }

    if (!formData.preferred_location) {
      newErrors.preferred_location = "Please select a preferred location."
    }

    if (!formData.specialization) {
      newErrors.specialization = "Please select a specialization."
    }

    if (formData.specialization === "Other" && !formData.other_specialization) {
      newErrors.other_specialization = "Please specify your specialization."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const submitData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        board_percentage: Number(formData.board_percentage),
        board_name: formData.board_name,
        passing_year: formData.passing_year,
        competitive_exams: formData.has_taken_exams ? examDetails : {},
        preferences: {
          college_type: formData.college_type,
          preferred_location: formData.preferred_location,
          budget_range: formData.budget_range,
          specialization: formData.specialization === "Other" ? formData.other_specialization : formData.specialization,
        },
      }

      const response = await fetch("/api/get-recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        throw new Error("Failed to get recommendations")
      }

      const result = await response.json()

      const encodedData = encodeURIComponent(JSON.stringify(result))
      router.push(`/recommendations?data=${encodedData}`)

      if (result.isMockData) {
        console.log("Note: Using sample recommendations. Set up Gemini API key for personalized results.")
      }
    } catch (error) {
      console.error("Error:", error)
      const errorMessage = `Error getting recommendations: ${error instanceof Error ? error.message : "Unknown error"}`

      const encodedError = encodeURIComponent(
        JSON.stringify({
          recommendations: `${errorMessage}\n\nPlease try again or contact support.`,
        }),
      )
      router.push(`/recommendations?data=${encodedError}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-t-lg">
            <CardTitle className="flex items-center space-x-3 text-xl font-semibold text-gray-800">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              1. Personal Information
            </CardTitle>
            <CardDescription>Enter your basic contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-400"
              />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-400"
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-400"
              />
              {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-t-lg">
            <CardTitle className="flex items-center space-x-3 text-xl font-semibold text-gray-800">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                />
              </svg>
              2. Academic Information
            </CardTitle>
            <CardDescription>Enter your 12th grade academic details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="percentage">12th Board Percentage / CGPA</Label>
              <Input
                id="percentage"
                type="number"
                placeholder="Enter your percentage (0-100)"
                step="0.01"
                min="0"
                max="100"
                value={formData.board_percentage}
                onChange={(e) => handleInputChange("board_percentage", e.target.value)}
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-400"
              />
              {errors.board_percentage && <p className="text-sm text-red-500 mt-1">{errors.board_percentage}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="board">Board Name</Label>
                <Select value={formData.board_name} onValueChange={(value) => handleInputChange("board_name", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your board" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CBSE">CBSE</SelectItem>
                    <SelectItem value="ICSE">ICSE</SelectItem>
                    <SelectItem value="State Board">State Board</SelectItem>
                    <SelectItem value="International">International</SelectItem>
                  </SelectContent>
                </Select>
                {errors.board_name && <p className="text-sm text-red-500 mt-1">{errors.board_name}</p>}
              </div>

              <div>
                <Label htmlFor="year">Year of Passing</Label>
                <Input
                  id="year"
                  type="number"
                  placeholder="Enter passing year (e.g., 2024)"
                  min="2015"
                  max="2030"
                  value={formData.passing_year}
                  onChange={(e) => handleInputChange("passing_year", e.target.value)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-400"
                />
                {errors.passing_year && <p className="text-sm text-red-500 mt-1">{errors.passing_year}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Competitive Exams */}
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-t-lg">
            <CardTitle className="flex items-center space-x-3 text-xl font-semibold text-gray-800">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138z"
                />
              </svg>
              3. Competitive Exams
            </CardTitle>
            <CardDescription>Share your entrance exam results (optional)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Have you taken any Engineering entrance exams?</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle this if you have taken any engineering entrance exams
                </p>
              </div>
              <Switch
                checked={formData.has_taken_exams}
                onCheckedChange={(checked) => handleInputChange("has_taken_exams", checked)}
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-500"
              />
            </div>

            {formData.has_taken_exams && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {examsList.map((exam) => (
                    <div key={exam} className="flex items-center space-x-2">
                      <Checkbox
                        id={`exam-${exam}`}
                        checked={selectedExams.includes(exam)}
                        onCheckedChange={(checked) => handleExamSelection(exam, checked === true)}
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-500"
                      />
                      <label
                        htmlFor={`exam-${exam}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {exam}
                      </label>
                    </div>
                  ))}
                </div>

                {selectedExams.length > 0 && (
                  <div className="space-y-4 mt-4">
                    {selectedExams.map((exam) => (
                      <div
                        key={`details-${exam}`}
                        className="border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-white hover:border-blue-300 transition-all duration-300"
                      >
                        <h4 className="font-medium mb-3">{exam} Details</h4>

                        {exam === "Other" && (
                          <div className="mb-3">
                            <Label>Exam Name</Label>
                            <Input
                              placeholder="Enter exam name"
                              value={examDetails[exam]?.exam_name || ""}
                              onChange={(e) => updateExamDetail(exam, "exam_name", e.target.value)}
                              className="mt-1 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-400"
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label>Score Type</Label>
                            <Select
                              value={examDetails[exam]?.score_type || "Rank"}
                              onValueChange={(value) => updateExamDetail(exam, "score_type", value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Rank">Rank</SelectItem>
                                <SelectItem value="Percentile">Percentile</SelectItem>
                                <SelectItem value="Marks">Marks</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Value</Label>
                            <Input
                              type="number"
                              placeholder="Enter score/rank/marks"
                              value={examDetails[exam]?.value || ""}
                              onChange={(e) => updateExamDetail(exam, "value", Number(e.target.value))}
                              className="mt-1 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-400"
                            />
                          </div>

                          <div>
                            <Label>Exam Year</Label>
                            <Input
                              type="number"
                              placeholder="Enter year (e.g., 2024)"
                              min="2015"
                              max="2030"
                              value={examDetails[exam]?.year || ""}
                              onChange={(e) => updateExamDetail(exam, "year", e.target.value)}
                              className="mt-1 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-400"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-t-lg">
            <CardTitle className="flex items-center space-x-3 text-xl font-semibold text-gray-800">
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              4. Preferences
            </CardTitle>
            <CardDescription>Tell us your preferences for college recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Preferred College Type</Label>
              <RadioGroup
                value={formData.college_type}
                onValueChange={(value) => handleInputChange("college_type", value)}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Government" id="government" />
                  <Label htmlFor="government">Government</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Private" id="private" />
                  <Label htmlFor="private">Private</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Either" id="either" />
                  <Label htmlFor="either">Either</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex flex-col space-y-2">
              <Label>Preferred Location/State</Label>
              <Popover open={openLocation} onOpenChange={setOpenLocation}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn("justify-between", !formData.preferred_location && "text-muted-foreground")}
                  >
                    {formData.preferred_location
                      ? states.find((state) => state === formData.preferred_location)
                      : "Select a state"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[300px]">
                  <Command>
                    <CommandInput placeholder="Search state..." />
                    <CommandList>
                      <CommandEmpty>No state found.</CommandEmpty>
                      <CommandGroup className="max-h-[300px] overflow-y-auto">
                        {states.map((state) => (
                          <CommandItem
                            value={state}
                            key={state}
                            onSelect={() => {
                              handleInputChange("preferred_location", state)
                              setOpenLocation(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                state === formData.preferred_location ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {state}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.preferred_location && <p className="text-sm text-red-500 mt-1">{errors.preferred_location}</p>}
            </div>

            <div className="flex flex-col space-y-2">
              <Label>Preferred Specialization</Label>
              <Popover open={openSpecialization} onOpenChange={setOpenSpecialization}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn("justify-between", !formData.specialization && "text-muted-foreground")}
                  >
                    {formData.specialization
                      ? specializations.find((spec) => spec === formData.specialization)
                      : "Select a specialization"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[300px]">
                  <Command>
                    <CommandInput placeholder="Search specialization..." />
                    <CommandList>
                      <CommandEmpty>No specialization found.</CommandEmpty>
                      <CommandGroup className="max-h-[300px] overflow-y-auto">
                        {specializations.map((spec) => (
                          <CommandItem
                            value={spec}
                            key={spec}
                            onSelect={() => {
                              handleInputChange("specialization", spec)
                              setOpenSpecialization(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                spec === formData.specialization ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {spec}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.specialization && <p className="text-sm text-red-500 mt-1">{errors.specialization}</p>}
            </div>

            {formData.specialization === "Other" && (
              <div className="mt-2 pl-4 border-l-2 border-blue-200">
                <Label htmlFor="other-specialization">Specify Your Specialization</Label>
                <Input
                  id="other-specialization"
                  placeholder="Enter your preferred specialization"
                  value={formData.other_specialization}
                  onChange={(e) => handleInputChange("other_specialization", e.target.value)}
                  className="mt-1 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-gray-400"
                />
                {errors.other_specialization && (
                  <p className="text-sm text-red-500 mt-1">{errors.other_specialization}</p>
                )}
              </div>
            )}

            <div>
              <Label>Budget Range (Annual Tuition Fees)</Label>
              <Select value={formData.budget_range} onValueChange={(value) => handleInputChange("budget_range", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under-50k">Below ₹50,000</SelectItem>
                  <SelectItem value="50k-1L">₹50,000 – ₹1 Lakh</SelectItem>
                  <SelectItem value="1L-2L">₹1 Lakh – ₹2 Lakhs</SelectItem>
                  <SelectItem value="2L-5L">₹2 Lakhs – ₹5 Lakhs</SelectItem>
                  <SelectItem value="5L-10L">₹5 Lakhs – ₹10 Lakhs</SelectItem>
                  <SelectItem value="10L-plus">Above ₹10 Lakhs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Submission */}
        <div className="flex justify-center pt-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-30"></div>
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  Getting Recommendations...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Get College Recommendations
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
