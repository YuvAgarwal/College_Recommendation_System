"""
ML Recommendation Model
Uses cosine similarity and weighted scoring for college recommendations
"""

import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Any, Tuple
from preprocessor import CollegePreprocessor


class CollegeRecommender:
    """ML-based college recommendation system"""
    
    def __init__(self, preprocessor: CollegePreprocessor):
        self.preprocessor = preprocessor
        self.colleges_df = None
        self.feature_matrix = None
        self.is_trained = False
        
    def train(self, colleges_df: pd.DataFrame):
        """
        Train the recommendation model on college data
        """
        self.colleges_df = colleges_df.copy()
        
        # Preprocess data
        processed_df, feature_matrix = self.preprocessor.preprocess_data(colleges_df)
        self.colleges_df = processed_df
        self.feature_matrix = feature_matrix
        
        self.is_trained = True
        
        print(f"✅ Model trained on {len(colleges_df)} college records")
        print(f"   Features: {feature_matrix.shape[1]} dimensions")
    
    def recommend(
        self, 
        user_input: Dict[str, Any], 
        top_k: int = 5,
        weights: Dict[str, float] = None
    ) -> List[Dict[str, Any]]:
        """
        Recommend top K colleges based on user input
        
        Args:
            user_input: User preferences (marks, preferences, budget, etc.)
            top_k: Number of recommendations to return
            weights: Feature weights for scoring (optional)
        
        Returns:
            List of recommended colleges with scores
        """
        if not self.is_trained:
            raise ValueError("Model not trained. Call train() first.")
        
        # Default weights for different features
        if weights is None:
            weights = {
                'cutoff_match': 0.3,      # How well cutoff matches user marks
                'location_match': 0.2,    # Location preference
                'branch_match': 0.2,      # Branch/specialization match
                'college_type_match': 0.15,  # Government/Private preference
                'budget_match': 0.1,      # Budget compatibility
                'placement': 0.05,        # Placement record (if available)
            }
        
        # Preprocess user input
        user_features = self.preprocessor.preprocess_user_input(user_input, self.colleges_df)
        
        # Calculate similarity scores
        scores = self._calculate_scores(user_input, user_features, weights)
        
        # Get top K recommendations
        top_indices = np.argsort(scores)[::-1][:top_k]
        
        recommendations = []
        for idx in top_indices:
            college_data = self.colleges_df.iloc[idx].to_dict()
            recommendation = {
                'college_name': college_data.get('College Name', 'Unknown'),
                'location': college_data.get('Location', ''),
                'state': college_data.get('State', ''),
                'branch': college_data.get('Branch', ''),
                'college_type': college_data.get('College Type', ''),
                'cutoff': college_data.get('Cutoff', {}),
                'fees': college_data.get('Fees'),
                'placement': college_data.get('Placement'),
                'rating': college_data.get('Rating'),
                'website': college_data.get('Website'),
                'score': float(scores[idx]),
                'match_details': self._get_match_details(user_input, college_data)
            }
            recommendations.append(recommendation)
        
        return recommendations
    
    def _calculate_scores(
        self, 
        user_input: Dict[str, Any], 
        user_features: np.ndarray,
        weights: Dict[str, float]
    ) -> np.ndarray:
        """
        Calculate recommendation scores using hybrid approach:
        1. Cosine similarity on feature vectors
        2. Weighted scoring based on specific matches
        """
        # Cosine similarity component
        user_features_2d = user_features.reshape(1, -1)
        cosine_sim = cosine_similarity(user_features_2d, self.feature_matrix)[0]
        
        # Normalize cosine similarity to [0, 1]
        cosine_sim = (cosine_sim + 1) / 2
        
        # Weighted match scores
        match_scores = np.zeros(len(self.colleges_df))
        
        user_marks = user_input.get('board_percentage', 0)
        user_prefs = user_input.get('preferences', {})
        user_college_type = user_prefs.get('college_type', '')
        user_location = user_prefs.get('preferred_location', '')
        user_branch = user_prefs.get('specialization', '')
        user_budget = user_prefs.get('budget_range', '')
        
        for idx, row in self.colleges_df.iterrows():
            score = 0.0
            
            # Cutoff match (how well user marks match cutoff)
            if user_marks > 0:
                cutoff_avg = row.get('cutoff_avg', 999999)
                if cutoff_avg < 999999:
                    # Higher marks should match lower (better) cutoffs
                    # Score based on how close user marks expectation is to actual cutoff
                    expected_rank = max(1, int((100 - user_marks) * 1000))
                    rank_diff = abs(cutoff_avg - expected_rank)
                    # Normalize: smaller difference = higher score
                    cutoff_score = 1 / (1 + rank_diff / 10000)
                    score += weights['cutoff_match'] * cutoff_score
            
            # Location match
            if user_location:
                college_location = str(row.get('Location', '')).lower()
                college_state = str(row.get('State', '')).lower()
                user_loc_lower = user_location.lower()
                
                if user_loc_lower in college_location or user_loc_lower in college_state:
                    score += weights['location_match']
                elif user_location.lower() == 'any' or not user_location:
                    score += weights['location_match'] * 0.5  # Partial match for "any"
            
            # Branch match
            if user_branch:
                college_branch = str(row.get('Branch', '')).lower()
                user_branch_lower = user_branch.lower()
                
                if user_branch_lower in college_branch or college_branch in user_branch_lower:
                    score += weights['branch_match']
                # Partial matches for common variations
                elif any(keyword in college_branch for keyword in self._get_branch_keywords(user_branch_lower)):
                    score += weights['branch_match'] * 0.7
            
            # College type match
            if user_college_type:
                college_type = row.get('College Type', '')
                if college_type == user_college_type:
                    score += weights['college_type_match']
            
            # Budget match (if fees data available)
            if user_budget and row.get('fees_numeric', 0) > 0:
                budget_value = self.preprocessor._parse_budget_range(user_budget)
                fees = row.get('fees_numeric', 0)
                
                if budget_value > 0 and fees > 0:
                    # Score higher if fees are within or below budget
                    if fees <= budget_value:
                        score += weights['budget_match']
                    elif fees <= budget_value * 1.2:  # 20% over budget is acceptable
                        score += weights['budget_match'] * 0.5
            
            # Placement score (if available)
            placement = row.get('placement_numeric', 0.5)
            if placement > 0:
                score += weights['placement'] * placement
            
            match_scores[idx] = score
        
        # Combine cosine similarity with weighted matches
        # Normalize match scores to [0, 1]
        if match_scores.max() > 0:
            match_scores = match_scores / match_scores.max()
        
        # Hybrid score: 60% cosine similarity, 40% weighted matches
        final_scores = 0.6 * cosine_sim + 0.4 * match_scores
        
        return final_scores
    
    def _get_branch_keywords(self, branch: str) -> List[str]:
        """Get keywords for branch matching"""
        branch_keywords = {
            'computer': ['computer', 'cs', 'cse', 'it', 'information'],
            'mechanical': ['mechanical', 'mech'],
            'electrical': ['electrical', 'eee'],
            'electronics': ['electronics', 'ece', 'eec'],
            'civil': ['civil'],
            'chemical': ['chemical'],
            'aerospace': ['aerospace', 'aeronautical'],
            'biotechnology': ['biotechnology', 'bio'],
        }
        
        for key, keywords in branch_keywords.items():
            if key in branch:
                return keywords
        
        return [branch]
    
    def _get_match_details(self, user_input: Dict, college_data: Dict) -> Dict[str, Any]:
        """Get detailed match information"""
        details = {
            'cutoff_match': 'N/A',
            'location_match': False,
            'branch_match': False,
            'college_type_match': False,
            'budget_match': 'N/A'
        }
        
        user_prefs = user_input.get('preferences', {})
        user_marks = user_input.get('board_percentage', 0)
        
        # Cutoff match
        cutoff = college_data.get('Cutoff', {})
        if isinstance(cutoff, dict) and user_marks > 0:
            cutoff_avg = cutoff.get('avg_rank', 999999)
            if cutoff_avg < 999999:
                details['cutoff_match'] = f"Cutoff rank: {int(cutoff_avg)}"
        
        # Location match
        user_location = user_prefs.get('preferred_location', '')
        college_location = college_data.get('Location', '')
        details['location_match'] = user_location.lower() in college_location.lower() if user_location else True
        
        # Branch match
        user_branch = user_prefs.get('specialization', '')
        college_branch = college_data.get('Branch', '')
        details['branch_match'] = user_branch.lower() in college_branch.lower() if user_branch else True
        
        # College type match
        user_type = user_prefs.get('college_type', '')
        college_type = college_data.get('College Type', '')
        details['college_type_match'] = college_type == user_type if user_type else True
        
        return details

