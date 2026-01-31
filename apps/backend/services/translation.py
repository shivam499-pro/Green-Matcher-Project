"""
Translation Service
Handles text translation using Google Translate API
"""

import logging
from typing import List, Dict, Optional
from functools import lru_cache

from google.cloud import translate_v2 as translate

from core.config import settings

logger = logging.getLogger(__name__)


# Supported languages
SUPPORTED_LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "ta": "Tamil",
    "te": "Telugu",
    "bn": "Bengali",
    "mr": "Marathi",
}

# Default language
DEFAULT_LANGUAGE = "en"


class TranslationService:
    """
    Service for translating text using Google Cloud Translation API.
    
    Provides translation for job titles, descriptions, career paths,
    and recommendations with fallback logic.
    """
    
    _client: Optional[translate.Client] = None
    
    @classmethod
    def get_client(cls) -> translate.Client:
        """
        Lazy-load the Google Translate client.
        
        Returns:
            translate.Client: The translation client
        """
        if cls._client is None:
            if settings.GOOGLE_TRANSLATE_CREDENTIALS:
                cls._client = translate.Client.from_service_account_json(
                    settings.GOOGLE_TRANSLATE_CREDENTIALS
                )
            else:
                # Use default credentials (from environment or ADC)
                cls._client = translate.Client()
            logger.info("Google Translate client initialized")
        return cls._client
    
    @classmethod
    def translate_text(
        cls,
        text: str,
        target_language: str,
        source_language: str = "auto"
    ) -> str:
        """
        Translate a single text string.
        
        Args:
            text: Text to translate
            target_language: Target language code (e.g., 'hi', 'ta')
            source_language: Source language code (default: auto-detect)
            
        Returns:
            str: Translated text
        """
        if not text or not text.strip():
            return text
        
        # Check if target language is supported
        if target_language not in SUPPORTED_LANGUAGES:
            logger.warning(f"Unsupported language: {target_language}")
            return text
        
        # If target is English and source is auto, check if text is already English
        if target_language == "en" and source_language == "auto":
            # Simple heuristic: if text contains mostly ASCII, assume English
            if cls._is_likely_english(text):
                return text
        
        try:
            client = cls.get_client()
            
            result = client.translate(
                text,
                target_language=target_language,
                source_language=source_language
            )
            
            translated_text = result["translatedText"]
            logger.debug(f"Translated '{text[:50]}...' to {target_language}")
            
            return translated_text
            
        except Exception as e:
            logger.error(f"Translation failed: {e}")
            # Fallback: return original text
            return text
    
    @classmethod
    def translate_texts(
        cls,
        texts: List[str],
        target_language: str,
        source_language: str = "auto"
    ) -> List[str]:
        """
        Translate multiple text strings.
        
        Args:
            texts: List of texts to translate
            target_language: Target language code
            source_language: Source language code
            
        Returns:
            List[str]: List of translated texts
        """
        if not texts:
            return []
        
        # Filter out empty texts
        valid_texts = [t for t in texts if t and t.strip()]
        if not valid_texts:
            return texts
        
        # Check if target language is supported
        if target_language not in SUPPORTED_LANGUAGES:
            logger.warning(f"Unsupported language: {target_language}")
            return texts
        
        try:
            client = cls.get_client()
            
            results = client.translate(
                valid_texts,
                target_language=target_language,
                source_language=source_language
            )
            
            translated_texts = [r["translatedText"] for r in results]
            
            # Map back to original indices
            final_results = []
            valid_idx = 0
            for text in texts:
                if text and text.strip():
                    final_results.append(translated_texts[valid_idx])
                    valid_idx += 1
                else:
                    final_results.append(text)
            
            return final_results
            
        except Exception as e:
            logger.error(f"Batch translation failed: {e}")
            # Fallback: return original texts
            return texts
    
    @classmethod
    def translate_job(
        cls,
        job_data: Dict,
        target_language: str
    ) -> Dict:
        """
        Translate job data to target language.
        
        Args:
            job_data: Dictionary containing job information
            target_language: Target language code
            
        Returns:
            Dict: Translated job data
        """
        if target_language == "en":
            return job_data
        
        translated = job_data.copy()
        
        # Translate title
        if "title" in job_data:
            translated["title"] = cls.translate_text(
                job_data["title"],
                target_language
            )
        
        # Translate description
        if "description" in job_data:
            translated["description"] = cls.translate_text(
                job_data["description"],
                target_language
            )
        
        # Translate requirements
        if "requirements" in job_data:
            translated["requirements"] = cls.translate_text(
                job_data["requirements"],
                target_language
            )
        
        return translated
    
    @classmethod
    def translate_career(
        cls,
        career_data: Dict,
        target_language: str
    ) -> Dict:
        """
        Translate career data to target language.
        
        Args:
            career_data: Dictionary containing career information
            target_language: Target language code
            
        Returns:
            Dict: Translated career data
        """
        if target_language == "en":
            return career_data
        
        translated = career_data.copy()
        
        # Translate title
        if "title" in career_data:
            translated["title"] = cls.translate_text(
                career_data["title"],
                target_language
            )
        
        # Translate description
        if "description" in career_data:
            translated["description"] = cls.translate_text(
                career_data["description"],
                target_language
            )
        
        # Translate skills
        if "required_skills" in career_data:
            translated["required_skills"] = cls.translate_texts(
                career_data["required_skills"],
                target_language
            )
        
        return translated
    
    @classmethod
    def translate_recommendations(
        cls,
        recommendations: List[Dict],
        target_language: str
    ) -> List[Dict]:
        """
        Translate career recommendations to target language.
        
        Args:
            recommendations: List of recommendation dictionaries
            target_language: Target language code
            
        Returns:
            List[Dict]: Translated recommendations
        """
        if target_language == "en":
            return recommendations
        
        translated = []
        for rec in recommendations:
            translated_rec = rec.copy()
            
            # Translate title
            if "title" in rec:
                translated_rec["title"] = cls.translate_text(
                    rec["title"],
                    target_language
                )
            
            # Translate description
            if "description" in rec:
                translated_rec["description"] = cls.translate_text(
                    rec["description"],
                    target_language
                )
            
            # Translate skills
            if "required_skills" in rec:
                translated_rec["required_skills"] = cls.translate_texts(
                    rec["required_skills"],
                    target_language
                )
            
            translated.append(translated_rec)
        
        return translated
    
    @classmethod
    def _is_likely_english(cls, text: str) -> bool:
        """
        Simple heuristic to check if text is likely English.
        
        Args:
            text: Text to check
            
        Returns:
            bool: True if text is likely English
        """
        # Check if most characters are ASCII
        ascii_chars = sum(1 for c in text if ord(c) < 128)
        ratio = ascii_chars / len(text) if text else 0
        
        return ratio > 0.8
    
    @classmethod
    def get_supported_languages(cls) -> Dict[str, str]:
        """
        Get list of supported languages.
        
        Returns:
            Dict[str, str]: Dictionary of language codes to names
        """
        return SUPPORTED_LANGUAGES.copy()
    
    @classmethod
    def is_language_supported(cls, language_code: str) -> bool:
        """
        Check if a language is supported.
        
        Args:
            language_code: Language code to check
            
        Returns:
            bool: True if language is supported
        """
        return language_code in SUPPORTED_LANGUAGES


# Singleton instance for dependency injection
translation_service = TranslationService()
