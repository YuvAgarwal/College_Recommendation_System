"""
Flask API Server for College Recommendations
Replaces Gemini API with ML-based recommendations
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from data_loader import CollegeDataLoader
from preprocessor import CollegePreprocessor
from recommender import CollegeRecommender

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js frontend

# Global model instance
recommender = None
colleges_df = None


def initialize_model():
    """Initialize and train the recommendation model"""
    global recommender, colleges_df
    
    print("🔄 Initializing ML recommendation model...")
    
    # Load data (dataset directory is one level up from ml_backend)
    import os
    current_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(current_dir)
    dataset_dir = os.path.join(parent_dir, "dataset")
    data_loader = CollegeDataLoader(dataset_dir=dataset_dir)
    colleges_data = data_loader.load_all_datasets()
    
    if not colleges_data:
        raise ValueError("No college data loaded. Check dataset directory.")
    
    print(f"📊 Loaded {len(colleges_data)} college records")
    
    # Convert to DataFrame
    import pandas as pd
    colleges_df = pd.DataFrame(colleges_data)
    
    # Initialize preprocessor and recommender
    preprocessor = CollegePreprocessor()
    recommender = CollegeRecommender(preprocessor)
    
    # Train model
    recommender.train(colleges_df)
    
    print("✅ Model initialized and ready!")


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': recommender is not None
    })


@app.route('/recommend', methods=['POST'])
def recommend_colleges():
    """
    Main recommendation endpoint
    Accepts user input and returns top 5 college recommendations
    """
    try:
        if recommender is None:
            return jsonify({
                'success': False,
                'error': 'Model not initialized. Please restart the server.'
            }), 500
        
        # Get user input
        user_input = request.json
        
        if not user_input:
            return jsonify({
                'success': False,
                'error': 'No input data provided'
            }), 400
        
        print(f"📝 Received recommendation request: {json.dumps(user_input, indent=2)}")
        
        # Get recommendations
        recommendations = recommender.recommend(user_input, top_k=10)
        
        # Format response to match UI expectations
        formatted_response = format_recommendations_for_ui(recommendations, user_input)
        
        return jsonify({
            'success': True,
            'recommendations': formatted_response,
            'isMockData': False,
            'model': 'ML-Based Recommendation System'
        })
        
    except Exception as e:
        print(f"❌ Error in recommendation: {e}")
        import traceback
        traceback.print_exc()
        
        return jsonify({
            'success': False,
            'error': str(e),
            'recommendations': f"Error getting recommendations: {str(e)}\n\nPlease try again or contact support."
        }), 500


def format_recommendations_for_ui(recommendations: list, user_input: dict) -> str:
    """
    Format ML recommendations into text format expected by UI
    Matches the format from Gemini API response
    """
    if not recommendations:
        return "No colleges found matching your criteria. Please try adjusting your preferences."
    
    user_prefs = user_input.get('preferences', {})
    college_type = user_prefs.get('college_type', '')
    specialization = user_prefs.get('specialization', 'Engineering')
    
    # Separate government and private colleges
    govt_colleges = [r for r in recommendations if r.get('college_type') == 'Government']
    private_colleges = [r for r in recommendations if r.get('college_type') == 'Private']
    
    # Limit to top 10 per category
    govt_colleges = govt_colleges[:10]
    private_colleges = private_colleges[:10]
    
    lines = []
    
    # Header
    lines.append(f"Based on your profile, here are some recommended engineering colleges for {specialization}:")
    lines.append("")
    lines.append("🎓 **Top Recommendations:**")
    lines.append("")
    
    # Government colleges section
    if college_type in ['Government', ''] and govt_colleges:
        lines.append("🏛️ **Government Engineering Colleges:**")
        lines.append("")
        
        for i, college in enumerate(govt_colleges, 1):
            college_name = college.get('college_name', 'Unknown College')
            location = college.get('location', '')
            branch = college.get('branch', '')
            website = college.get('website', '')
            cutoff = college.get('cutoff', {})
            
            # Format college entry
            lines.append(f"{i}. **{college_name}**")
            
            if website:
                lines.append(f"   - Website: {website}")
            elif location:
                lines.append(f"   - Location: {location}")
            
            # Add justification
            justification = f"   - Excellent {branch} program"
            if isinstance(cutoff, dict) and cutoff.get('avg_rank', 999999) < 999999:
                justification += f" with cutoff rank around {int(cutoff.get('avg_rank', 0))}"
            if location:
                justification += f" in {location}"
            
            lines.append(justification)
            lines.append("")
    
    # Private colleges section
    if college_type in ['Private', ''] and private_colleges:
        lines.append("🏢 **Private Engineering Colleges:**")
        lines.append("")
        
        for i, college in enumerate(private_colleges, 1):
            college_name = college.get('college_name', 'Unknown College')
            location = college.get('location', '')
            branch = college.get('branch', '')
            website = college.get('website', '')
            fees = college.get('fees')
            
            # Format college entry
            lines.append(f"{i}. **{college_name}**")
            
            if website:
                lines.append(f"   - Website: {website}")
            elif location:
                lines.append(f"   - Location: {location}")
            
            # Add justification
            justification = f"   - Strong {branch} program"
            if location:
                justification += f" located in {location}"
            if fees:
                justification += f" with fees around {fees}"
            
            lines.append(justification)
            lines.append("")
    
    if not govt_colleges and not private_colleges:
        lines.append("No colleges found matching your criteria.")
        lines.append("Please try adjusting your preferences or contact support.")
    
    return "\n".join(lines)


if __name__ == '__main__':
    # Initialize model on startup
    try:
        initialize_model()
    except Exception as e:
        print(f"❌ Failed to initialize model: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
    
    # Run Flask server
    port = int(os.environ.get('PORT', 5000))
    print(f"🚀 Starting Flask server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)

