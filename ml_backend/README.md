# ML-Based College Recommendation System

This is the machine learning backend that powers the college recommendation system. It replaces the Gemini API with a data-driven ML approach using your JSON datasets.

## Features

- **Content-Based Filtering**: Uses cosine similarity on college features
- **Weighted Scoring**: Combines multiple factors (cutoff, location, branch, budget, etc.)
- **Hybrid Recommendation**: Combines similarity scores with preference matching
- **Modular Architecture**: Easy to retrain and update when dataset changes

## Setup Instructions

### 1. Install Dependencies

```bash
cd ml_backend
pip install -r requirements.txt
```

### 2. Dataset Structure

Place your JSON dataset files in the `dataset/` directory (one level up from `ml_backend/`).

The system expects JSON files with the following structure:
```json
{
  "College Name": {
    "State": "State Name",
    "Programs": {
      "Branch Name": {
        "AI/HS": {
          "Category": {
            "Gender": ["rank1", "rank2"]
          }
        }
      }
    }
  }
}
```

### 3. Run the Flask Server

```bash
python app.py
```

The server will start on `http://localhost:5000` by default.

You can change the port by setting the `PORT` environment variable:
```bash
PORT=5001 python app.py
```

### 4. Configure Next.js Frontend

Add the ML backend URL to your `.env.local` file:

```env
ML_BACKEND_URL=http://localhost:5000
```

If not set, it defaults to `http://localhost:5000`.

## API Endpoints

### POST `/recommend`

Get college recommendations based on user input.

**Request Body:**
```json
{
  "name": "Student Name",
  "email": "student@example.com",
  "phone": "1234567890",
  "board_percentage": 85,
  "board_name": "CBSE",
  "passing_year": "2024",
  "competitive_exams": {},
  "preferences": {
    "college_type": "Government",
    "preferred_location": "West Bengal",
    "budget_range": "2-5 Lakhs",
    "specialization": "Computer Science"
  }
}
```

**Response:**
```json
{
  "success": true,
  "recommendations": "Formatted text recommendations...",
  "isMockData": false,
  "model": "ML-Based Recommendation System"
}
```

### GET `/health`

Health check endpoint to verify the server is running.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

## How It Works

1. **Data Loading**: Loads all JSON files from the `dataset/` directory
2. **Preprocessing**: 
   - Extracts features (cutoff ranks, location, branch, etc.)
   - Normalizes numeric values
   - Encodes categorical features
3. **Feature Engineering**:
   - Maps user marks to expected cutoff ranks
   - Encodes user preferences (location, branch, college type)
   - Parses budget ranges
4. **Recommendation**:
   - Calculates cosine similarity between user profile and colleges
   - Applies weighted scoring for specific matches (location, branch, etc.)
   - Combines both approaches for final ranking
5. **Formatting**: Converts recommendations to text format expected by UI

## Customization

### Adjusting Recommendation Weights

Edit `ml_backend/recommender.py` to modify the default weights:

```python
weights = {
    'cutoff_match': 0.3,      # How well cutoff matches user marks
    'location_match': 0.2,    # Location preference
    'branch_match': 0.2,      # Branch/specialization match
    'college_type_match': 0.15,  # Government/Private preference
    'budget_match': 0.1,      # Budget compatibility
    'placement': 0.05,        # Placement record (if available)
}
```

### Adding More Features

When you add more data fields (Fees, Placement, Rating, Website) to your JSON files, the system will automatically use them. The preprocessor handles missing fields gracefully.

### Retraining

The model retrains automatically when the server starts. To retrain with new data:
1. Update your JSON files in the `dataset/` directory
2. Restart the Flask server

## Troubleshooting

### Server won't start
- Check that all dependencies are installed: `pip install -r requirements.txt`
- Verify Python version (3.8+ required)
- Ensure dataset files exist in `dataset/` directory

### No recommendations returned
- Check that dataset files are valid JSON
- Verify the dataset structure matches expected format
- Check server logs for error messages

### Recommendations seem inaccurate
- Verify your dataset contains relevant colleges
- Adjust weights in `recommender.py` to prioritize different factors
- Check that user input is being parsed correctly (see server logs)

## Architecture

```
ml_backend/
├── app.py              # Flask API server
├── data_loader.py      # Loads and processes JSON datasets
├── preprocessor.py     # Feature engineering and preprocessing
├── recommender.py      # ML recommendation logic
├── requirements.txt    # Python dependencies
└── README.md          # This file
```

## Future Improvements

- Add caching for faster responses
- Implement model persistence (save/load trained models)
- Add more sophisticated ML algorithms (collaborative filtering, neural networks)
- Support for real-time dataset updates without server restart
- Add recommendation explanation/justification details

