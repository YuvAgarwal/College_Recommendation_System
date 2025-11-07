import { type NextRequest, NextResponse } from "next/server"

// ML Backend URL - can be configured via environment variable
const ML_BACKEND_URL = process.env.ML_BACKEND_URL || "http://localhost:5000"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("📝 Received form data:", JSON.stringify(body, null, 2))

    console.log("🤖 Calling ML recommendation backend...")
    
    // Call Python ML backend
    const mlResponse = await fetch(`${ML_BACKEND_URL}/recommend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!mlResponse.ok) {
      const errorText = await mlResponse.text()
      console.error("❌ ML backend error:", errorText)
      throw new Error(`ML backend error: ${mlResponse.status} - ${errorText}`)
    }

    const mlResult = await mlResponse.json()
    console.log("✅ Received recommendations from ML backend")

    // Return response in the same format as before
    return NextResponse.json({
      success: mlResult.success || true,
      recommendations: mlResult.recommendations || "",
      isMockData: mlResult.isMockData || false,
      model: mlResult.model || "ML-Based Recommendation System",
    })
  } catch (error) {
    console.error("❌ Error getting recommendations:", error)
    console.error("Error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })

    // Parse the request body for fallback recommendations
    let body
    try {
      const requestClone = request.clone()
      body = await requestClone.json()
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError)
      body = {}
    }

    // Get specialization preference
    const specialization = body.preferences?.specialization || "Engineering"

    // Provide detailed fallback recommendations based on the error
    const fallbackRecommendations = `⚠️ **ML Backend Service Error - Showing Fallback Recommendations**

Error Details: ${error instanceof Error ? error.message : String(error)}

Here are some excellent engineering college suggestions for ${specialization}:

🏛️ **Top Government Engineering Colleges:**

1. **Indian Institute of Technology (IIT) Delhi**
   - Website: https://home.iitd.ac.in/
   - Admission: JEE Advanced
   - Known for: ${specialization}, Computer Science, Mechanical, Electrical Engineering
   - Cutoff: Top 1000 ranks in JEE Advanced

2. **Indian Institute of Technology (IIT) Bombay**
   - Website: https://www.iitb.ac.in/
   - Admission: JEE Advanced
   - Known for: All engineering branches including ${specialization}, excellent placements
   - Cutoff: Top 500 ranks in JEE Advanced

3. **National Institute of Technology (NIT) Trichy**
   - Website: https://www.nitt.edu/
   - Admission: JEE Main
   - Known for: Strong alumni network, good placements for ${specialization} graduates
   - Cutoff: JEE Main rank under 10,000

4. **Indian Institute of Technology (IIT) Madras**
   - Website: https://www.iitm.ac.in/
   - Admission: JEE Advanced
   - Known for: Research excellence in ${specialization}, industry partnerships
   - Cutoff: Top 800 ranks in JEE Advanced

🏢 **Top Private Engineering Colleges:**

1. **Birla Institute of Technology and Science (BITS) Pilani**
   - Website: https://www.bits-pilani.ac.in/
   - Admission: BITSAT
   - Known for: Flexible curriculum, excellent faculty for ${specialization}
   - Cutoff: BITSAT score 300+

2. **Vellore Institute of Technology (VIT)**
   - Website: https://vit.ac.in/
   - Admission: VITEEE
   - Known for: Modern infrastructure, international exposure, strong ${specialization} department
   - Cutoff: VITEEE rank under 20,000

3. **SRM Institute of Science and Technology**
   - Website: https://www.srmist.edu.in/
   - Admission: SRMJEEE
   - Known for: Industry connections, research opportunities in ${specialization}
   - Cutoff: SRMJEEE rank under 15,000

${
  body.board_percentage
    ? `
📊 **Based on your ${body.board_percentage}% in ${body.board_name}:**
${
  body.board_percentage >= 90
    ? "- Excellent score! You're eligible for top IITs and NITs with strong " + specialization + " programs"
    : body.board_percentage >= 80
      ? "- Good score! Consider NITs and top private colleges with " + specialization + " specialization"
      : "- Consider state colleges and private institutions offering " + specialization
}
`
    : ""
}

🔧 **Technical Error Details:**
- Error Type: ${error instanceof Error ? error.name : "Unknown"}
- Error Message: ${error instanceof Error ? error.message : String(error)}
- Timestamp: ${new Date().toISOString()}

To resolve this issue:
1. Ensure the ML backend server is running on ${ML_BACKEND_URL}
2. Check that the dataset files are in the dataset/ directory
3. Verify your internet connection
4. Try again in a few moments`

    return NextResponse.json({
      success: false,
      recommendations: fallbackRecommendations,
      isMockData: true,
      error: error instanceof Error ? error.message : String(error),
      errorType: error instanceof Error ? error.name : "Unknown",
      timestamp: new Date().toISOString(),
    })
  }
}
