"""
Embedding Service
Handles text-to-vector conversion using sentence-transformers
Model: all-mpnet-base-v2 (768-dim vectors)
"""

import json
import logging
from typing import List, Optional
from functools import lru_cache

import numpy as np
from sentence_transformers import SentenceTransformer

from core.config import settings

logger = logging.getLogger(__name__)


class EmbeddingService:
    """
    Service for generating text embeddings using sentence-transformers.
    
    Uses all-mpnet-base-v2 model which produces 768-dimensional vectors
    optimized for semantic similarity tasks.
    """
    
    _model: Optional[SentenceTransformer] = None
    _model_name = "all-mpnet-base-v2"
    _embedding_dim = 768
    
    @classmethod
    def get_model(cls) -> SentenceTransformer:
        """
        Lazy-load the sentence-transformer model.
        
        Returns:
            SentenceTransformer: The loaded embedding model
        """
        if cls._model is None:
            logger.info(f"Loading embedding model: {cls._model_name}")
            cls._model = SentenceTransformer(cls._model_name)
            logger.info(f"Model loaded successfully. Embedding dimension: {cls._embedding_dim}")
        return cls._model
    
    @classmethod
    def encode_text(cls, text: str) -> List[float]:
        """
        Convert a single text string to an embedding vector.
        
        Args:
            text: Input text to encode
            
        Returns:
            List[float]: 768-dimensional embedding vector
        """
        if not text or not text.strip():
            logger.warning("Empty text provided for encoding")
            return [0.0] * cls._embedding_dim
        
        model = cls.get_model()
        embedding = model.encode(text, convert_to_numpy=True)
        
        # Ensure float32 for database compatibility
        return embedding.astype(np.float32).tolist()
    
    @classmethod
    def encode_texts(cls, texts: List[str]) -> List[List[float]]:
        """
        Convert multiple text strings to embedding vectors.
        
        Args:
            texts: List of input texts to encode
            
        Returns:
            List[List[float]]: List of 768-dimensional embedding vectors
        """
        if not texts:
            return []
        
        # Filter out empty texts
        valid_texts = [t for t in texts if t and t.strip()]
        if not valid_texts:
            return [[0.0] * cls._embedding_dim] * len(texts)
        
        model = cls.get_model()
        embeddings = model.encode(valid_texts, convert_to_numpy=True)
        
        # Convert to list of lists
        return [emb.astype(np.float32).tolist() for emb in embeddings]
    
    @classmethod
    def encode_job(cls, title: str, description: str, requirements: str = "") -> List[float]:
        """
        Generate embedding for a job by combining title, description, and requirements.
        
        Args:
            title: Job title
            description: Job description
            requirements: Job requirements (optional)
            
        Returns:
            List[float]: 768-dimensional embedding vector
        """
        # Combine text fields with weights
        combined_text = f"{title}. {description}"
        if requirements:
            combined_text += f" Requirements: {requirements}"
        
        return cls.encode_text(combined_text)
    
    @classmethod
    def encode_career(cls, title: str, description: str, required_skills: List[str]) -> List[float]:
        """
        Generate embedding for a career path.
        
        Args:
            title: Career title
            description: Career description
            required_skills: List of required skills
            
        Returns:
            List[float]: 768-dimensional embedding vector
        """
        # Combine title, description, and skills
        skills_text = " ".join(required_skills) if required_skills else ""
        combined_text = f"{title}. {description}"
        if skills_text:
            combined_text += f" Skills: {skills_text}"
        
        return cls.encode_text(combined_text)
    
    @classmethod
    def encode_user_skills(cls, skills: List[str]) -> List[float]:
        """
        Generate embedding for user skills.
        
        Args:
            skills: List of user skills
            
        Returns:
            List[float]: 768-dimensional embedding vector
        """
        if not skills:
            return [0.0] * cls._embedding_dim
        
        # Combine all skills into a single text
        skills_text = " ".join(skills)
        return cls.encode_text(skills_text)
    
    @classmethod
    def vector_to_json(cls, vector: List[float]) -> str:
        """
        Convert embedding vector to JSON string for database storage.
        
        Args:
            vector: Embedding vector
            
        Returns:
            str: JSON string representation
        """
        return json.dumps(vector)
    
    @classmethod
    def json_to_vector(cls, json_str: str) -> List[float]:
        """
        Convert JSON string from database to embedding vector.
        
        Args:
            json_str: JSON string representation
            
        Returns:
            List[float]: Embedding vector
        """
        try:
            return json.loads(json_str)
        except (json.JSONDecodeError, TypeError) as e:
            logger.error(f"Failed to parse embedding JSON: {e}")
            return [0.0] * cls._embedding_dim
    
    @classmethod
    def get_embedding_dim(cls) -> int:
        """
        Get the embedding dimension.
        
        Returns:
            int: Embedding dimension (768)
        """
        return cls._embedding_dim
    
    @classmethod
    def cosine_similarity(cls, vec1: List[float], vec2: List[float]) -> float:
        """
        Calculate cosine similarity between two vectors.
        
        Args:
            vec1: First embedding vector
            vec2: Second embedding vector
            
        Returns:
            float: Cosine similarity score (-1 to 1)
        """
        # Convert to numpy arrays
        v1 = np.array(vec1, dtype=np.float32)
        v2 = np.array(vec2, dtype=np.float32)
        
        # Calculate dot product and norms
        dot_product = np.dot(v1, v2)
        norm1 = np.linalg.norm(v1)
        norm2 = np.linalg.norm(v2)
        
        # Avoid division by zero
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return float(dot_product / (norm1 * norm2))
    
    @classmethod
    def batch_cosine_similarity(
        cls, 
        query_vector: List[float], 
        target_vectors: List[List[float]]
    ) -> List[float]:
        """
        Calculate cosine similarity between a query vector and multiple target vectors.
        
        Args:
            query_vector: Query embedding vector
            target_vectors: List of target embedding vectors
            
        Returns:
            List[float]: List of cosine similarity scores
        """
        if not target_vectors:
            return []
        
        query = np.array(query_vector, dtype=np.float32)
        targets = np.array(target_vectors, dtype=np.float32)
        
        # Calculate norms
        query_norm = np.linalg.norm(query)
        target_norms = np.linalg.norm(targets, axis=1)
        
        # Avoid division by zero
        if query_norm == 0:
            return [0.0] * len(target_vectors)
        
        # Calculate dot products
        dot_products = np.dot(targets, query)
        
        # Calculate similarities
        similarities = dot_products / (target_norms * query_norm + 1e-8)
        
        return similarities.tolist()


# Singleton instance for dependency injection
embedding_service = EmbeddingService()
