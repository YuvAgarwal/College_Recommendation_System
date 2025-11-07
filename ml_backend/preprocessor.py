"""
Data Preprocessing Module
Handles feature engineering, normalization, and encoding for ML model
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from typing import Dict, Any, Tuple
import re


class CollegePreprocessor:
    """Preprocesses college data for ML model"""
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_columns = []
        self.is_fitted = False
        
    def preprocess_data(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, np.ndarray]:
        """
        Preprocess the college dataset
        Returns: (processed_df, feature_matrix)
        """
        # Create a copy to avoid modifying original
        processed_df = df.copy()
        
        # Feature engineering
        processed_df = self._engineer_features(processed_df)
        
        # Extract numeric features
        feature_matrix = self._extract_features(processed_df)
        
        # Store feature columns for later use
        self.feature_columns = list(processed_df.columns)
        
        return processed_df, feature_matrix
    
    def _engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create engineered features from raw data"""
        df = df.copy()
        
        # Extract cutoff features
        df['cutoff_min'] = df['Cutoff'].apply(lambda x: x.get('min_rank', 999999) if isinstance(x, dict) else 999999)
        df['cutoff_max'] = df['Cutoff'].apply(lambda x: x.get('max_rank', 0) if isinstance(x, dict) else 0)
        df['cutoff_avg'] = df['Cutoff'].apply(lambda x: x.get('avg_rank', 999999) if isinstance(x, dict) else 999999)
        
        # Normalize cutoff (lower rank = better, so invert)
        df['cutoff_score'] = 1 / (df['cutoff_avg'] + 1)  # Add 1 to avoid division by zero
        
        # Encode categorical features
        df['college_type_encoded'] = self._encode_column(df, 'College Type', ['Government', 'Private'])
        df['state_encoded'] = self._encode_column(df, 'State')
        df['branch_encoded'] = self._encode_column(df, 'Branch')
        
        # Handle fees (if available)
        if 'Fees' in df.columns:
            df['fees_numeric'] = df['Fees'].apply(self._parse_fees)
        else:
            df['fees_numeric'] = 0
        
        # Handle placement (if available)
        if 'Placement' in df.columns:
            df['placement_numeric'] = df['Placement'].apply(self._parse_placement)
        else:
            df['placement_numeric'] = 0.5  # Default neutral value
        
        # Handle rating (if available)
        if 'Rating' in df.columns:
            df['rating_numeric'] = df['Rating'].apply(self._parse_rating)
        else:
            df['rating_numeric'] = 3.0  # Default neutral rating
        
        return df
    
    def _encode_column(self, df: pd.DataFrame, column: str, categories: list = None) -> pd.Series:
        """Encode categorical column"""
        if column not in df.columns:
            return pd.Series([0] * len(df))
        
        if column not in self.label_encoders:
            self.label_encoders[column] = LabelEncoder()
            if categories:
                # Fit with known categories
                all_categories = list(df[column].unique()) + categories
                self.label_encoders[column].fit(all_categories)
            else:
                self.label_encoders[column].fit(df[column].fillna('Unknown'))
        
        encoded = self.label_encoders[column].transform(df[column].fillna('Unknown'))
        return pd.Series(encoded)
    
    def _parse_fees(self, fees_value: Any) -> float:
        """Parse fees string to numeric value"""
        if pd.isna(fees_value) or fees_value is None:
            return 0
        
        if isinstance(fees_value, (int, float)):
            return float(fees_value)
        
        if isinstance(fees_value, str):
            # Extract numbers from string (e.g., "Rs. 1,50,000" -> 150000)
            numbers = re.findall(r'[\d,]+', fees_value.replace(',', ''))
            if numbers:
                try:
                    return float(numbers[0].replace(',', ''))
                except:
                    return 0
        
        return 0
    
    def _parse_placement(self, placement_value: Any) -> float:
        """Parse placement percentage to numeric value"""
        if pd.isna(placement_value) or placement_value is None:
            return 0.5
        
        if isinstance(placement_value, (int, float)):
            return float(placement_value) / 100.0 if placement_value > 1 else float(placement_value)
        
        if isinstance(placement_value, str):
            # Extract percentage
            numbers = re.findall(r'[\d.]+', placement_value)
            if numbers:
                try:
                    value = float(numbers[0])
                    return value / 100.0 if value > 1 else value
                except:
                    return 0.5
        
        return 0.5
    
    def _parse_rating(self, rating_value: Any) -> float:
        """Parse rating to numeric value (0-5 scale)"""
        if pd.isna(rating_value) or rating_value is None:
            return 3.0
        
        if isinstance(rating_value, (int, float)):
            return float(rating_value)
        
        if isinstance(rating_value, str):
            numbers = re.findall(r'[\d.]+', rating_value)
            if numbers:
                try:
                    return float(numbers[0])
                except:
                    return 3.0
        
        return 3.0
    
    def _extract_features(self, df: pd.DataFrame) -> np.ndarray:
        """Extract feature matrix for ML model"""
        feature_cols = [
            'cutoff_min', 'cutoff_max', 'cutoff_avg', 'cutoff_score',
            'college_type_encoded', 'state_encoded', 'branch_encoded',
            'fees_numeric', 'placement_numeric', 'rating_numeric'
        ]
        
        # Only use columns that exist
        available_cols = [col for col in feature_cols if col in df.columns]
        
        feature_matrix = df[available_cols].fillna(0).values
        
        return feature_matrix
    
    def preprocess_user_input(self, user_input: Dict[str, Any], df: pd.DataFrame) -> np.ndarray:
        """
        Preprocess user input to match feature space
        Returns feature vector for user preferences
        """
        # Create a dummy row with user preferences
        user_row = {
            'cutoff_min': 999999,
            'cutoff_max': 0,
            'cutoff_avg': 999999,
            'cutoff_score': 0,
            'college_type_encoded': 0,
            'state_encoded': 0,
            'branch_encoded': 0,
            'fees_numeric': 0,
            'placement_numeric': 0.5,
            'rating_numeric': 3.0
        }
        
        # Map user marks to cutoff expectation (inverse relationship)
        marks = user_input.get('board_percentage', 0)
        if marks > 0:
            # Higher marks = expect lower (better) cutoff rank
            # Rough mapping: 90%+ = rank < 10000, 80%+ = rank < 50000, etc.
            expected_rank = max(1, int((100 - marks) * 1000))
            user_row['cutoff_avg'] = expected_rank
            user_row['cutoff_score'] = 1 / (expected_rank + 1)
        
        # Encode college type
        college_type = user_input.get('preferences', {}).get('college_type', '')
        if college_type in ['Government', 'Private']:
            user_row['college_type_encoded'] = 0 if college_type == 'Government' else 1
        
        # Encode state/location
        location = user_input.get('preferences', {}).get('preferred_location', '')
        if location and 'State' in df.columns:
            # Find matching state encoding
            state_encoder = self.label_encoders.get('State')
            if state_encoder:
                try:
                    user_row['state_encoded'] = state_encoder.transform([location])[0]
                except:
                    # If location not in training data, use 0
                    user_row['state_encoded'] = 0
        
        # Encode branch/specialization
        specialization = user_input.get('preferences', {}).get('specialization', '')
        if specialization and 'Branch' in df.columns:
            branch_encoder = self.label_encoders.get('Branch')
            if branch_encoder:
                try:
                    user_row['branch_encoded'] = branch_encoder.transform([specialization])[0]
                except:
                    user_row['branch_encoded'] = 0
        
        # Parse budget
        budget_range = user_input.get('preferences', {}).get('budget_range', '')
        if budget_range:
            user_row['fees_numeric'] = self._parse_budget_range(budget_range)
        
        # Create feature vector
        feature_cols = [
            'cutoff_min', 'cutoff_max', 'cutoff_avg', 'cutoff_score',
            'college_type_encoded', 'state_encoded', 'branch_encoded',
            'fees_numeric', 'placement_numeric', 'rating_numeric'
        ]
        
        feature_vector = np.array([user_row.get(col, 0) for col in feature_cols])
        
        return feature_vector
    
    def _parse_budget_range(self, budget_range: str) -> float:
        """Parse budget range string to numeric value"""
        if not budget_range or pd.isna(budget_range):
            return 0
        
        budget_lower = budget_range.lower()
        
        # Common budget ranges
        if 'lakh' in budget_lower or 'lac' in budget_lower:
            numbers = re.findall(r'[\d.]+', budget_range)
            if numbers:
                try:
                    return float(numbers[0]) * 100000  # Convert lakhs to rupees
                except:
                    pass
        
        # Extract any numbers
        numbers = re.findall(r'[\d,]+', budget_range.replace(',', ''))
        if numbers:
            try:
                return float(numbers[0])
            except:
                pass
        
        return 0

