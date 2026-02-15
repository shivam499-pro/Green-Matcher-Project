"""
Resume Service
Handles resume skill extraction using NLP and rule-based approaches
Supports TXT, JSON, and PDF formats
"""

import logging
import re
import json
import io
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

# Additional skill patterns for extraction
SKILL_PATTERNS = {
    # Programming with versions
    r'\b(python|java|javascript|typescript)\s*\d*(?:\.\d+)?\b',
    # Frameworks
    r'\b(react|angular|vue|django|flask|spring)\s*(?:js|native)?\b',
    # Cloud platforms
    r'\b(aws|azure|gcp|google cloud)\b',
    # Certifications
    r'\b(aws certified|azure certified|pmp|scrum master)\b',
    # Green certifications
    r'\b(leed|breeam|iso 14001|ghg protocol)\b',
}


@dataclass
class ExtractedSkills:
    """Represents extracted skills from a resume."""
    technical_skills: List[str]
    soft_skills: List[str]
    green_skills: List[str]
    all_skills: List[str]
    confidence_score: float
    sections: Dict[str, str]
    raw_text_length: int


class ResumeService:
    """
    Service for extracting skills from resumes using NLP and rule-based approaches.
    
    Combines keyword matching, pattern recognition, and semantic analysis
    to extract relevant skills from resume text.
    
    Supports:
    - Plain text (TXT)
    - JSON format
    - PDF (requires PyPDF2)
    """
    
    def __init__(self, embedding_service: EmbeddingService):
        self.embedding_service = embedding_service
    
    def extract_skills_from_text(
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
            return ExtractedSkills([], [], [], [], 0.0, {}, 0)
        
        # Normalize text
        normalized_text = self._normalize_text(resume_text)
        
        # Parse sections
        sections = self.parse_resume_sections(resume_text)
        
        # Extract skills using keyword matching
        technical_skills = self._extract_technical_skills(normalized_text)
        soft_skills = self._extract_soft_skills(normalized_text)
        green_skills = self._extract_green_skills(normalized_text)
        
        # Extract skills using patterns
        pattern_skills = self._extract_pattern_skills(normalized_text)
        
        # Combine all skills (remove duplicates)
        all_skills = list(set(technical_skills + soft_skills + green_skills + pattern_skills))
        
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
            confidence_score=confidence_score,
            sections=sections,
            raw_text_length=len(resume_text)
        )
    
    def extract_skills_from_json(self, resume_json: Dict) -> ExtractedSkills:
        """
        Extract skills from JSON-formatted resume.
        
        Args:
            resume_json: Dictionary containing resume data
            
        Returns:
            ExtractedSkills: Object containing extracted skills
        """
        # Combine all text fields from JSON
        text_parts = []
        
        # Common JSON resume fields
        text_fields = [
            'summary', 'objective', 'profile',
            'skills', 'technical_skills', 'competencies',
            'experience', 'work_experience', 'employment',
            'education', 'certifications', 'projects'
        ]
        
        for field in text_fields:
            if field in resume_json:
                value = resume_json[field]
                if isinstance(value, str):
                    text_parts.append(value)
                elif isinstance(value, list):
                    text_parts.extend(str(item) for item in value)
                elif isinstance(value, dict):
                    text_parts.extend(str(v) for v in value.values())
        
        combined_text = ' '.join(text_parts)
        return self.extract_skills_from_text(combined_text)
    
    def extract_skills_from_pdf(self, pdf_content: bytes) -> ExtractedSkills:
        """
        Extract skills from PDF content.
        
        Args:
            pdf_content: Raw PDF file bytes
            
        Returns:
            ExtractedSkills: Object containing extracted skills
        """
        try:
            import PyPDF2
            
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_content))
            text_parts = []
            
            for page in pdf_reader.pages:
                text = page.extract_text()
                if text:
                    text_parts.append(text)
            
            combined_text = ' '.join(text_parts)
            return self.extract_skills_from_text(combined_text)
            
        except ImportError:
            logger.error("PyPDF2 not installed. Install with: pip install PyPDF2")
            return ExtractedSkills([], [], [], [], 0.0, {}, 0)
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            return ExtractedSkills([], [], [], [], 0.0, {}, 0)
    
    def parse_resume_file(self, file_content: bytes, file_type: str) -> ExtractedSkills:
        """
        Parse resume file and extract skills.
        
        Args:
            file_content: Raw file bytes
            file_type: File type ('txt', 'json', 'pdf')
            
        Returns:
            ExtractedSkills: Object containing extracted skills
        """
        file_type = file_type.lower()
        
        if file_type == 'txt':
            text = file_content.decode('utf-8', errors='ignore')
            return self.extract_skills_from_text(text)
        
        elif file_type == 'json':
            try:
                data = json.loads(file_content.decode('utf-8'))
                return self.extract_skills_from_json(data)
            except json.JSONDecodeError as e:
                logger.error(f"Invalid JSON: {str(e)}")
                return ExtractedSkills([], [], [], [], 0.0, {}, 0)
        
        elif file_type == 'pdf':
            return self.extract_skills_from_pdf(file_content)
        
        else:
            logger.warning(f"Unsupported file type: {file_type}")
            return ExtractedSkills([], [], [], [], 0.0, {}, 0)
    
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
            (r'\bleadership\b', 'leadership'),
            (r'\bcommunication\b', 'communication'),
            (r'\bteamwork\b', 'teamwork'),
            (r'\bteam work\b', 'teamwork'),
            (r'\bproblem solving\b', 'problem solving'),
            (r'\banalytical\b', 'analytical'),
            (r'\bproject management\b', 'project management'),
            (r'\bagile\b', 'agile'),
            (r'\bscrum\b', 'scrum'),
            (r'\btime management\b', 'time management'),
            (r'\badaptability\b', 'adaptability'),
            (r'\bcreativity\b', 'creativity'),
            (r'\bcritical thinking\b', 'critical thinking'),
            (r'\bcollaboration\b', 'collaboration'),
        ]
        
        for pattern, skill_name in soft_skill_patterns:
            if re.search(pattern, text):
                found_skills.append(skill_name)
        
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
    
    def _extract_pattern_skills(self, text: str) -> List[str]:
        """
        Extract skills using regex patterns.
        
        Args:
            text: Normalized resume text
            
        Returns:
            List[str]: List of skills found via patterns
        """
        found_skills = []
        
        for pattern in SKILL_PATTERNS:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                if isinstance(match, tuple):
                    match = match[0] if match[0] else match[1] if len(match) > 1 else ''
                skill = match.lower().strip()
                if skill and skill not in found_skills:
                    found_skills.append(skill)
        
        return found_skills
    
    def _find_semantic_skills(self, known_skills: List[str]) -> List[str]:
        """
        Find additional skills using semantic similarity.
        
        Args:
            known_skills: List of already extracted skills
            
        Returns:
            List[str]: Additional semantically similar skills
        """
        # Semantic skill expansion using related skills
        skill_relations = {
            "python": ["django", "flask", "fastapi", "data science"],
            "javascript": ["node.js", "react", "vue", "angular"],
            "react": ["javascript", "typescript", "next.js"],
            "machine learning": ["deep learning", "tensorflow", "pytorch", "nlp"],
            "aws": ["cloud", "docker", "kubernetes", "devops"],
            "solar": ["renewable energy", "photovoltaic", "clean energy"],
            "wind": ["renewable energy", "turbine", "clean energy"],
            "sustainability": ["esg", "environmental", "green", "climate"],
        }
        
        additional_skills = []
        for skill in known_skills:
            if skill in skill_relations:
                for related in skill_relations[skill]:
                    if related not in known_skills and related not in additional_skills:
                        additional_skills.append(related)
        
        return additional_skills
    
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
        
        # Bonus for text length (longer resumes have more context)
        length_bonus = min(len(text) / 5000, 0.1)  # Max 0.1 bonus
        
        # Calculate final score
        confidence = skill_count_score + green_skill_bonus + tech_skill_bonus + length_bonus
        
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
    
    def get_extraction_summary(self, extracted: ExtractedSkills) -> Dict:
        """
        Get a summary of the extraction results.
        
        Args:
            extracted: ExtractedSkills object
            
        Returns:
            Dict: Summary of extraction
        """
        return {
            "total_skills": len(extracted.all_skills),
            "technical_skills_count": len(extracted.technical_skills),
            "soft_skills_count": len(extracted.soft_skills),
            "green_skills_count": len(extracted.green_skills),
            "confidence_score": round(extracted.confidence_score * 100, 2),
            "has_green_skills": len(extracted.green_skills) > 0,
            "top_skills": extracted.all_skills[:10],
            "sections_found": [k for k, v in extracted.sections.items() if v],
        }


# Singleton instance for dependency injection
resume_service = ResumeService(embedding_service=EmbeddingService())
