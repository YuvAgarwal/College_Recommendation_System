# Setup Guide: ML-Based College Recommendation System

This guide will help you set up the upgraded ML-based recommendation system.

## Prerequisites

- Python 3.8 or higher
- Node.js and npm/pnpm (for Next.js frontend)
- Your college dataset JSON files in the `dataset/` folder

## Step-by-Step Setup

### 1. Install Python Dependencies

Navigate to the `ml_backend` directory and install required packages:

```bash
cd ml_backend
pip install -r requirements.txt
```

**Note for Windows users:** If `pip` is not recognized, try `python -m pip install -r requirements.txt`

### 2. Verify Dataset Files

Ensure your JSON dataset files are in the `dataset/` directory (at the project root, not inside `ml_backend/`).

The structure should be:
```
code/
├── dataset/
│   ├── govt_college.json
│   ├── wbjee.json
│   └── ... (other JSON files)
├── ml_backend/
│   └── ...
└── app/
    └── ...
```

### 3. Start the ML Backend Server

From the `ml_backend` directory:

```bash
python app.py
```

You should see output like:
```
🔄 Initializing ML recommendation model...
📊 Loaded X college records
✅ Model trained on X college records
   Features: Y dimensions
✅ Model initialized and ready!
🚀 Starting Flask server on port 5000...
```

**Keep this terminal window open** - the server needs to keep running.

### 4. Configure Frontend (Optional)

If your ML backend runs on a different port or URL, create/update `.env.local` in the project root:

```env
ML_BACKEND_URL=http://localhost:5000
```

### 5. Start the Next.js Frontend

In a **new terminal window**, from the project root:

```bash
pnpm install  # or npm install
pnpm dev      # or npm run dev
```

### 6. Test the System

1. Open your browser to `http://localhost:3000` (or the port shown in terminal)
2. Fill out the recommendation form
3. Submit and verify recommendations are returned

## Verification

### Check ML Backend Health

Visit `http://localhost:5000/health` in your browser. You should see:

```json
{
  "status": "healthy",
  "model_loaded": true
}
```

### Test Recommendation Endpoint

You can test the API directly using curl or Postman:

```bash
curl -X POST http://localhost:5000/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "board_percentage": 85,
    "preferences": {
      "college_type": "Government",
      "preferred_location": "West Bengal",
      "specialization": "Computer Science"
    }
  }'
```

## Troubleshooting

### Issue: "Module not found" errors

**Solution:** Make sure you're running Python commands from the `ml_backend` directory, or install dependencies globally.

### Issue: "No college data loaded"

**Solution:** 
- Verify JSON files are in `dataset/` directory (project root)
- Check that JSON files are valid (use a JSON validator)
- Check server logs for specific error messages

### Issue: Frontend can't connect to backend

**Solution:**
- Verify ML backend is running (check terminal)
- Check `ML_BACKEND_URL` in `.env.local` matches backend URL
- Verify CORS is enabled (it should be by default)
- Check firewall/antivirus isn't blocking port 5000

### Issue: Recommendations are empty or inaccurate

**Solution:**
- Check server logs for errors during data loading
- Verify your dataset structure matches expected format
- Ensure user input matches data in your dataset (e.g., location names, branch names)

## What Changed?

### Before (Gemini API)
- Used Google's Gemini API for recommendations
- Required API key setup
- Generated text-based recommendations

### After (ML System)
- Uses your actual dataset for recommendations
- No external API required
- Data-driven recommendations based on similarity and matching
- Can be easily retrained with new data

## Next Steps

1. **Add More Data**: Place additional JSON files in `dataset/` folder
2. **Customize Weights**: Adjust recommendation weights in `ml_backend/recommender.py`
3. **Add Features**: When you add Fees, Placement, Rating fields to your JSON, they'll be automatically used
4. **Improve Matching**: Enhance branch/location matching logic in `preprocessor.py`

## Support

If you encounter issues:
1. Check server logs in the terminal running `app.py`
2. Verify all files are in correct locations
3. Ensure Python and Node.js versions are compatible
4. Review error messages carefully - they often point to the issue

