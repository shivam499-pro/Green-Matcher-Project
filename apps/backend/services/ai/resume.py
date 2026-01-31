"""
Resume Service
Handles resume skill extraction using NLP and rule-based approaches
"""

import logging
import re
from typing import List, Dict, Optional, Set
from dataclasses import dataclass

from .embeddings import EmbeddingService

logger = logging.getLogger(__name__)


# Common technical skills database (can be expanded)
TECHNICAL_SKILLS = {
    # Programming Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "go", "rust",
    "ruby", "php", "swift", "kotlin", "scala", "r", "matlab", "sql",
    
    # Web Development
    "html", "css", "react", "angular", "vue", "node.js", "express", "django",
    "flask", "spring", "laravel", "rails", "next.js", "nuxt.js",
    
    # Data Science & AI
    "machine learning", "deep learning", "nlp", "computer vision", "data science",
    "tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy",
    "matplotlib", "seaborn", "jupyter", "spark", "hadoop",
    
    # Cloud & DevOps
    "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "git", "ci/cd",
    "terraform", "ansible", "linux", "bash", "shell scripting",
    
    # Databases
    "mysql", "postgresql", "mongodb", "redis", "elasticsearch", "cassandra",
    "sqlite", "oracle", "mariadb",
    
    # Green/Sustainability Skills
    "renewable energy", "solar energy", "wind energy", "sustainability",
    "environmental science", "climate change", "carbon footprint", "esg",
    "green building", "waste management", "water conservation", "energy efficiency",
    "life cycle assessment", "carbon accounting", "sustainable development",
    
    # Soft Skills
    "leadership", "communication", "teamwork", "problem solving", "analytical",
    "project management", "agile", "scrum", "time management", "adaptability",
    "creativity", "critical thinking", "collaboration",
}

# Green job specific keywords
GREEN_KEYWORDS = {
    "solar", "wind", "hydro", "geothermal", "biomass", "tidal", "wave",
    "renewable", "sustainable", "green", "eco", "environmental", "climate",
    "carbon", "emissions", "recycling", "conservation", "efficiency",
    "clean energy", "low carbon", "net zero", "carbon neutral", "esg",
    "sustainability", "biodiversity", "pollution", "waste", "water",
}


@dataclass
class ExtractedSkills:
    """Represents extracted skills from a resume."""
    technical_skills: List[str]
    soft_skills: List[str]
    green_skills: List[str]
    all_skills: List[str]
    confidence_score: float


class ResumeService:
    """
    Service for extracting skills from resumes using NLP and rule-based approaches.
    
    Combines keyword matching, pattern recognition, and semantic analysis
    to extract relevant skills from resume text.
    """
    
    def __init__(self, embedding_service: EmbeddingService):
        self.embedding_service = embedding_service
    
    def extract_skills(
        self,
        resume_text: str,
        use_semantic: bool = True
    ) -> ExtractedSkills:
        """
        Extract skills from resume text.
        
        Args:
            resume_text: Raw text from resume
            use_semantic: Whether to use semantic matching for additional skills
            
        Returns:
            ExtractedSkills: Object containing extracted skills
        """
        if not resume_text or not resume_text.strip():
            logger.warning("Empty resume text provided")
            return ExtractedSkills([], [], [], [], 0.0)
        
        # Normalize text
        normalized_text = self._normalize_text(resume_text)
        
        # Extract skills using keyword matching
        technical_skills = self._extract_technical_skills(normalized_text)
        soft_skills = self._extract_soft_skills(normalized_text)
        green_skills = self._extract_green_skills(normalized_text)
        
        # Combine all skills (remove duplicates)
        all_skills = list(set(technical_skills + soft_skills + green_skills))
        
        # Calculate confidence score based on number of skills found
        confidence_score = self._calculate_confidence(all_skills, normalized_text)
        
        # Use semantic matching to find additional related skills
        if use_semantic and all_skills:
            additional_skills = self._find_semantic_skills(all_skills)
            all_skills.extend(additional_skills)
            all_skills = list(set(all_skills))  # Remove duplicates
        
        return ExtractedSkills(
            technical_skills=technical_skills,
            soft_skills=soft_skills,
            green_skills=green_skills,
            all_skills=all_skills,
            confidence_score=confidence_score
        )
    
    def _normalize_text(self, text: str) -> str:
        """
        Normalize text for processing.
        
        Args:
            text: Input text
            
        Returns:
            str: Normalized text
        """
        # Convert to lowercase
        text = text.lower()
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters (keep letters, numbers, and basic punctuation)
        text = re.sub(r'[^\w\s\.\,\-\+]', '', text)
        
        return text.strip()
    
    def _extract_technical_skills(self, text: str) -> List[str]:
        """
        Extract technical skills using keyword matching.
        
        Args:
            text: Normalized resume text
            
        Returns:
            List[str]: List of technical skills found
        """
        found_skills = []
        
        for skill in TECHNICAL_SKILLS:
            # Check for exact match or word boundary match
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, text):
                found_skills.append(skill)
        
        return found_skills
    
    def _extract_soft_skills(self, text: str) -> List[str]:
        """
        Extract soft skills using keyword matching.
        
        Args:
            text: Normalized resume text
            
        Returns:
            List[str]: List of soft skills found
        """
        found_skills = []
        
        # Look for soft skill keywords
        soft_skill_patterns = [
            r'\bleadership\b',
            r'\bcommunication\b',
            r'\bteamwork\b',
            r'\bteam work\b',
            r'\bproblem solving\b',
            r'\banalytical\b',
            r'\bproject management\b',
            r'\bagile\b',
            r'\bscrum\b',
            r'\btime management\b',
            r'\badaptability\b',
            r'\bcreativity\b',
            r'\bcritical thinking\b',
            r'\bcollaboration\b',
        ]
        
        for pattern in soft_skill_patterns:
            if re.search(pattern, text):
                # Extract the skill name from the pattern
                skill = pattern.replace(r'\b', '').replace(r'\b', '')
                found_skills.append(skill)
        
        return found_skills
    
    def _extract_green_skills(self, text: str) -> List[str]:
        """
        Extract green/sustainability skills.
        
        Args:
            text: Normalized resume text
            
        Returns:
            List[str]: List of green skills found
        """
        found_skills = []
        
        for keyword in GREEN_KEYWORDS:
            pattern = r'\b' + re.escape(keyword) + r'\b'
            if re.search(pattern, text):
                found_skills.append(keyword)
        
        return found_skills
    
    def _find_semantic_skills(self, known_skills: List[str]) -> List[str]:
        """
        Find additional skills using semantic similarity.
        
        Args:
            known_skills: List of already extracted skills
            
        Returns:
            List[str]: Additional semantically similar skills
        """
        # This is a simplified version - in production, you would:
        # 1. Create embeddings for known skills
        # 2. Compare with a comprehensive skill database
        # 3. Return skills above a similarity threshold
        
        # For now, return empty list
        # This can be enhanced with a skill database and semantic search
        return []
    
    def _calculate_confidence(self, skills: List[str], text: str) -> float:
        """
        Calculate confidence score for skill extraction.
        
        Args:
            skills: List of extracted skills
            text: Normalized resume text
            
        Returns:
            float: Confidence score (0-1)
        """
        if not skills:
            return 0.0
        
        # Base score from number of skills
        skill_count_score = min(len(skills) / 10, 1.0)  # Max 1.0 at 10+ skills
        
        # Bonus for green skills (more relevant for our platform)
        green_skill_bonus = 0.1 if any(s in GREEN_KEYWORDS for s in skills) else 0.0
        
        # Bonus for technical skills
        tech_skill_bonus = 0.1 if len([s for s in skills if s in TECHNICAL_SKILLS]) >= 3 else 0.0
        
        # Calculate final score
        confidence = skill_count_score + green_skill_bonus + tech_skill_bonus
        
        return min(confidence, 1.0)
    
    def parse_resume_sections(self, resume_text: str) -> Dict[str, str]:
        """
        Parse resume into sections (experience, education, skills, etc.).
        
        Args:
            resume_text: Raw resume text
            
        Returns:
            Dict[str, str]: Dictionary of section names to content
        """
        sections = {
            "experience": "",
            "education": "",
            "skills": "",
            "summary": "",
            "projects": "",
        }
        
        # Normalize text
        text = resume_text.lower()
        
        # Find section boundaries using common headers
        section_patterns = {
            "experience": [
                r'(work experience|experience|employment history|professional experience)',
                r'(work history|career history)'
            ],
            "education": [
                r'(education|educational background|academic background)',
                r'(qualifications|degrees)'
            ],
            "skills": [
                r'(skills|technical skills|core skills|key skills)',
                r'(competencies|technologies|tools)'
            ],
            "summary": [
                r'(summary|profile|objective|about me)',
                r'(professional summary|career summary)'
            ],
            "projects": [
                r'(projects|portfolio|work samples)',
                r'(key projects|major projects)'
            ],
        }
        
        # Find section positions
        section_positions = {}
        for section_name, patterns in section_patterns.items():
            for pattern in patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    section_positions[section_name] = match.start()
                    break
        
        # Extract section content
        sorted_sections = sorted(section_positions.items(), key=lambda x: x[1])
        
        for i, (section_name, start_pos) in enumerate(sorted_sections):
            # Find end position (start of next section or end of text)
            if i < len(sorted_sections) - 1:
                end_pos = sorted_sections[i + 1][1]
            else:
                end_pos = len(text)
            
            # Extract content
            content = text[start_pos:end_pos].strip()
            # Remove the section header
            for pattern in section_patterns[section_name]:
                content = re.sub(pattern, '', content, flags=re.IGNORECASE)
                break
            
            sections[section_name] = content.strip()
        
        return sections
    
    def generate_skill_embedding(self, skills: List[str]) -> List[float]:
        """
        Generate embedding for a list of skills.
        
        Args:
            skills: List of skills
            
        Returns:
            List[float]: 768-dimensional embedding vector
        """
        return self.embedding_service.encode_user_skills(skills)


# Singleton instance for dependency injection
resume_service = ResumeService(embedding_service=EmbeddingService())
