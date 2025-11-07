"""
Data Loader Module
Loads and preprocesses college datasets from JSON files
"""

import json
import os
from typing import Dict, List, Any
import pandas as pd


class CollegeDataLoader:
    """Loads and processes college data from JSON files"""
    
    def __init__(self, dataset_dir: str = None):
        if dataset_dir is None:
            # Default to dataset directory one level up from ml_backend
            import os
            current_dir = os.path.dirname(os.path.abspath(__file__))
            parent_dir = os.path.dirname(current_dir)
            dataset_dir = os.path.join(parent_dir, "dataset")
        self.dataset_dir = dataset_dir
        self.colleges_data = []
        
    def load_all_datasets(self) -> List[Dict[str, Any]]:
        """
        Load all JSON files from the dataset directory
        Returns a flattened list of college records
        """
        self.colleges_data = []
        
        # Get all JSON files in dataset directory
        json_files = [f for f in os.listdir(self.dataset_dir) if f.endswith('.json')]
        
        for json_file in json_files:
            file_path = os.path.join(self.dataset_dir, json_file)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self._process_json_data(data, json_file)
            except Exception as e:
                print(f"Error loading {json_file}: {e}")
                continue
                
        return self.colleges_data
    
    def _process_json_data(self, data: Dict, source_file: str):
        """
        Process nested JSON structure and flatten into college records
        Expected structure: { "College Name": { "State": "...", "Programs": {...} } }
        """
        for college_name, college_info in data.items():
            state = college_info.get("State", "")
            programs = college_info.get("Programs", {})
            
            # Extract college type from filename or name
            college_type = self._infer_college_type(college_name, source_file)
            
            # Process each program/branch
            for program_name, program_data in programs.items():
                # Extract branch name (clean up program name)
                branch = self._extract_branch_name(program_name)
                
                # Extract cutoff information
                cutoff_info = self._extract_cutoff_info(program_data)
                
                # Create a record for each branch
                record = {
                    "College Name": college_name,
                    "Location": state,
                    "State": state,
                    "Branch": branch,
                    "Full Program Name": program_name,
                    "College Type": college_type,
                    "Cutoff": cutoff_info,
                    "Source File": source_file,
                    # Placeholder fields (can be updated when more data is available)
                    "Fees": None,
                    "Placement": None,
                    "Rating": None,
                    "Website": None
                }
                
                self.colleges_data.append(record)
    
    def _infer_college_type(self, college_name: str, source_file: str) -> str:
        """Infer college type from name or filename"""
        name_lower = college_name.lower()
        file_lower = source_file.lower()
        
        # Check for government indicators
        if any(keyword in name_lower for keyword in ['government', 'govt', 'iit', 'nit', 'iiit', 'central university']):
            return "Government"
        elif 'govt' in file_lower or 'government' in file_lower:
            return "Government"
        else:
            return "Private"
    
    def _extract_branch_name(self, program_name: str) -> str:
        """Extract clean branch name from program name"""
        # Remove common suffixes
        branch = program_name
        branch = branch.replace("(4 Years, Bachelor of Technology)", "").strip()
        branch = branch.replace("(B.Tech)", "").strip()
        branch = branch.replace("(B.E.)", "").strip()
        return branch.strip()
    
    def _extract_cutoff_info(self, program_data: Dict) -> Dict[str, Any]:
        """
        Extract cutoff ranks from nested structure
        Structure: { "AI/HS": { "Category": { "Gender": [rank] } } }
        """
        cutoff_info = {
            "min_rank": float('inf'),
            "max_rank": 0,
            "avg_rank": 0,
            "ranks": []
        }
        
        all_ranks = []
        
        for exam_type, exam_data in program_data.items():
            if isinstance(exam_data, dict):
                for category, category_data in exam_data.items():
                    if isinstance(category_data, dict):
                        for gender, ranks in category_data.items():
                            if isinstance(ranks, list):
                                for rank_str in ranks:
                                    try:
                                        rank = int(rank_str)
                                        all_ranks.append(rank)
                                    except (ValueError, TypeError):
                                        continue
        
        if all_ranks:
            cutoff_info["min_rank"] = min(all_ranks)
            cutoff_info["max_rank"] = max(all_ranks)
            cutoff_info["avg_rank"] = sum(all_ranks) / len(all_ranks)
            cutoff_info["ranks"] = sorted(all_ranks)
        
        return cutoff_info
    
    def to_dataframe(self) -> pd.DataFrame:
        """Convert loaded data to pandas DataFrame"""
        if not self.colleges_data:
            self.load_all_datasets()
        
        df = pd.DataFrame(self.colleges_data)
        return df

