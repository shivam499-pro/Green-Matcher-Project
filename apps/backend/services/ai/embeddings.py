"""
Embedding Service
Handles text-to-vector conversion using sentence-transformers
Model: all-mpnet-base-v2 (768-dim vectors)

Production-ready with error handling, caching, and performance monitoring.
"""

import json
import logging
import time
import hashlib
from typing import List, Optional, Dict
from functools import lru_cache

import numpy as np
from sentence_transformers import SentenceTransformer

from core.config import settings

logger = logging.getLogger(__name__)


class AIServiceError(Exception):
    """Base exception for AI service errors."""
    pass


class ModelLoadError(AIServiceError):
    """Exception raised when model fails to load."""
    pass


class EmbeddingError(AIServiceError):
    """Exception raised when embedding generation fails."""
    pass


class PerformanceMonitor:
    """Monitor AI service performance."""
    
    def __init__(self):
        self.metrics: Dict[str, List[float]] = {}
    
    def record_time(self, operation: str, duration: float):
        """Record operation duration."""
        if operation not in self.metrics:
            self.metrics[operation] = []
        self.metrics[operation].append(duration)
    
    def get_stats(self, operation: str) -> Dict[str, float]:
        """Get statistics for an operation."""
        if operation not in self.metrics or not self.metrics[operation]:
            return {}
        
        times = self.metrics[operation]
        return {
            'count': len(times),
            'min': round(min(times), 3),
            'max': round(max(times), 3),
            'avg': round(sum(times) / len(times), 3),
            'p50': round(sorted(times)[len(times) // 2], 3),
            'p95': round(sorted(times)[int(len(times) * 0.95)], 3),
            'p99': round(sorted(times)[int(len(times) * 0.99)], 3)
        }
    
    def get_all_stats(self) -> Dict[str, Dict[str, float]]:
        """Get statistics for all operations."""
        return {op: self.get_stats(op) for op in self.metrics}


# Global performance monitor
perf_monitor = PerformanceMonitor()


class EmbeddingService:
    """
    Service for generating text embeddings using sentence-transformers.
    
    Uses all-mpnet-base-v2 model which produces 768-dimensional vectors
    optimized for semantic similarity tasks.
    
    Production-ready with error handling, caching, and performance monitoring.
    """
    
    _model: Optional[SentenceTransformer] = None
    _model_name = "all-mpnet-base-v2"
    _model_version = "2.3.1"
    _embedding_dim = 768
    _model_loaded = False
    _cache: Dict[str, List[float]] = {}
    _cache_size = 1000
    _cache_hits = 0
    _cache_misses = 0
    
    @classmethod
    def get_model(cls) -> SentenceTransformer:
        """
        Lazy-load the sentence-transformer model with error handling.
        
        Returns:
            SentenceTransformer: The loaded embedding model
            
        Raises:
            ModelLoadError: If model fails to load
        """
        if cls._model is None:
            try:
                logger.info(f"Loading embedding model: {cls._model_name} (version: {cls._model_version})")
                start_time = time.time()
                
                cls._model = SentenceTransformer(cls._model_name)
                
                # Validate embedding dimension
                test_embedding = cls._model.encode("test")
                if len(test_embedding) != cls._embedding_dim:
                    raise ValueError(
                        f"Model dimension mismatch: expected {cls._embedding_dim}, "
                        f"got {len(test_embedding)}"
                    )
                
                # Validate embedding values are in expected range
                if not all(-1.0 <= x <= 1.0 for x in test_embedding):
                    raise ValueError(
                        f"Model produces values outside expected range [-1.0, 1.0]"
                    )
                
                load_time = time.time() - start_time
                perf_monitor.record_time('model_load', load_time)
                
                cls._model_loaded = True
                logger.info(
                    f"Model loaded successfully in {load_time:.2f}s. "
                    f"Embedding dimension: {cls._embedding_dim}"
                )
            except Exception as e:
                cls._model_loaded = False
                logger.error(f"Failed to load embedding model: {str(e)}")
                raise ModelLoadError(f"Failed to load AI model: {str(e)}")
        
        return cls._model
    
    @classmethod
    def is_model_loaded(cls) -> bool:
        """Check if model is loaded."""
        return cls._model_loaded
    
    @classmethod
    def get_model_info(cls) -> Dict[str, any]:
        """Get model information."""
        return {
            'model_name': cls._model_name,
            'model_version': cls._model_version,
            'embedding_dim': cls._embedding_dim,
            'model_loaded': cls._model_loaded,
            'cache_size': len(cls._cache),
            'cache_hits': cls._cache_hits,
            'cache_misses': cls._cache_misses,
            'cache_hit_rate': round(
                (cls._cache_hits / (cls._cache_hits + cls._cache_misses) * 100), 2
            ) if (cls._cache_hits + cls._cache_misses) > 0 else 0.0
        }
    
    @classmethod
    def _get_cache_key(cls, text: str) -> str:
        """Generate cache key for text."""
        return hashlib.md5(text.encode()).hexdigest()
    
    @classmethod
    def _get_from_cache(cls, cache_key: str) -> Optional[List[float]]:
        """Get embedding from cache."""
        if cache_key in cls._cache:
            cls._cache_hits += 1
            return cls._cache[cache_key]
        return None
    
    @classmethod
    def _add_to_cache(cls, cache_key: str, embedding: List[float]):
        """Add embedding to cache."""
        if len(cls._cache) < cls._cache_size:
            cls._cache[cache_key] = embedding
        cls._cache_misses += 1
    
    @classmethod
    def encode_text(cls, text: str) -> List[float]:
        """
        Convert a single text string to an embedding vector.
        
        Args:
            text: Input text to encode
            
        Returns:
            List[float]: 768-dimensional embedding vector
            
        Raises:
            EmbeddingError: If encoding fails
        """
        # Input validation
        if not text or not text.strip():
            logger.warning("Empty text provided for encoding")
            return [0.0] * cls._embedding_dim
        
        # Length validation
        if len(text) > 10000:
            logger.warning(f"Text exceeds maximum length of 10000 characters: {len(text)}")
            raise EmbeddingError(f"Text exceeds maximum length of 10000 characters")
        
        # Check cache
        cache_key = cls._get_cache_key(text)
        cached_embedding = cls._get_from_cache(cache_key)
        if cached_embedding is not None:
            return cached_embedding
        
        # Encode text
        try:
            start_time = time.time()
            
            model = cls.get_model()
            embedding = model.encode(text, convert_to_numpy=True)
            
            # Validate embedding
            if len(embedding) != cls._embedding_dim:
                raise ValueError(
                    f"Embedding dimension mismatch: expected {cls._embedding_dim}, "
                    f"got {len(embedding)}"
                )
            
            # Ensure float32 for database compatibility
            embedding = embedding.astype(np.float32)
            
            # Validate embedding values
            if not all(-1.0 <= x <= 1.0 for x in embedding):
                raise ValueError("Embedding values outside expected range [-1.0, 1.0]")
            
            duration = time.time() - start_time
            perf_monitor.record_time('encode_text', duration)
            
            # Add to cache
            cls._add_to_cache(cache_key, embedding.tolist())
            
            return embedding.tolist()
        except Exception as e:
            logger.error(f"Failed to encode text: {str(e)}")
            raise EmbeddingError(f"Failed to encode text: {str(e)}")
    
    @classmethod
    def encode_text_with_fallback(cls, text: str) -> List[float]:
        """
        Encode text with fallback to zero vector on error.
        
        Args:
            text: Input text to encode
            
        Returns:
            List[float]: 768-dimensional embedding vector or zero vector on error
        """
        try:
            return cls.encode_text(text)
        except Exception as e:
            logger.warning(f"Using fallback embedding for text: {str(e)}")
            return [0.0] * cls._embedding_dim
    
    @classmethod
    def encode_user_skills(cls, skills: List[str]) -> List[float]:
        """
        Encode a list of user skills into a single embedding vector.
        
        Args:
            skills: List of skill strings
            
        Returns:
            List[float]: 768-dimensional embedding vector
            
        Raises:
            EmbeddingError: If encoding fails
        """
        if not skills:
            logger.warning("Empty skills list provided for encoding")
            return [0.0] * cls._embedding_dim
        
        # Combine skills into a single text
        skills_text = " ".join(skills)
        
        return cls.encode_text(skills_text)
    
    @classmethod
    def encode_batch(cls, texts: List[str]) -> List[List[float]]:
        """
        Encode multiple texts in a batch for better performance.
        
        Args:
            texts: List of text strings to encode
            
        Returns:
            List[List[float]]: List of 768-dimensional embedding vectors
            
        Raises:
            EmbeddingError: If encoding fails
        """
        if not texts:
            return []
        
        # Validate input
        for i, text in enumerate(texts):
            if not text or not text.strip():
                logger.warning(f"Empty text at index {i} in batch")
                texts[i] = ""
            elif len(text) > 10000:
                logger.warning(f"Text at index {i} exceeds maximum length")
                raise EmbeddingError(f"Text at index {i} exceeds maximum length of 10000 characters")
        
        try:
            start_time = time.time()
            
            model = cls.get_model()
            embeddings = model.encode(texts, convert_to_numpy=True)
            
            # Validate embeddings
            if len(embeddings) != len(texts):
                raise ValueError(
                    f"Number of embeddings ({len(embeddings)}) does not match "
                    f"number of texts ({len(texts)})"
                )
            
            for i, embedding in enumerate(embeddings):
                if len(embedding) != cls._embedding_dim:
                    raise ValueError(
                        f"Embedding at index {i} has wrong dimension: "
                        f"expected {cls._embedding_dim}, got {len(embedding)}"
                    )
            
            # Ensure float32 for database compatibility
            embeddings = embeddings.astype(np.float32)
            
            duration = time.time() - start_time
            perf_monitor.record_time('encode_batch', duration)
            
            return [emb.tolist() for emb in embeddings]
        except Exception as e:
            logger.error(f"Failed to encode batch: {str(e)}")
            raise EmbeddingError(f"Failed to encode batch: {str(e)}")
    
    @classmethod
    def json_to_vector(cls, json_str: str) -> List[float]:
        """
        Convert JSON string to vector.
        
        Args:
            json_str: JSON string containing vector
            
        Returns:
            List[float]: Vector as list of floats
            
        Raises:
            ValueError: If JSON is invalid or vector is malformed
        """
        try:
            vector = json.loads(json_str)
            
            if not isinstance(vector, list):
                raise ValueError("Vector must be a list")
            
            if len(vector) != cls._embedding_dim:
                raise ValueError(
                    f"Vector dimension mismatch: expected {cls._embedding_dim}, "
                    f"got {len(vector)}"
                )
            
            if not all(isinstance(x, (int, float)) for x in vector):
                raise ValueError("Vector must contain only numbers")
            
            return [float(x) for x in vector]
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON: {str(e)}")
        except Exception as e:
            raise ValueError(f"Failed to parse vector: {str(e)}")
    
    @classmethod
    def vector_to_json(cls, vector: List[float]) -> str:
        """
        Convert vector to JSON string.
        
        Args:
            vector: Vector as list of floats
            
        Returns:
            str: JSON string representation of vector
            
        Raises:
            ValueError: If vector is malformed
        """
        if not isinstance(vector, list):
            raise ValueError("Vector must be a list")
        
        if len(vector) != cls._embedding_dim:
            raise ValueError(
                f"Vector dimension mismatch: expected {cls._embedding_dim}, "
                f"got {len(vector)}"
            )
        
        if not all(isinstance(x, (int, float)) for x in vector):
            raise ValueError("Vector must contain only numbers")
        
        return json.dumps(vector)
    
    @classmethod
    def cosine_similarity(cls, vec1: List[float], vec2: List[float]) -> float:
        """
        Calculate cosine similarity between two vectors.
        
        Args:
            vec1: First vector
            vec2: Second vector
            
        Returns:
            float: Cosine similarity score between -1.0 and 1.0
            
        Raises:
            ValueError: If vectors are malformed
        """
        # Validate vectors
        if len(vec1) != cls._embedding_dim or len(vec2) != cls._embedding_dim:
            raise ValueError(
                f"Vector dimension mismatch: expected {cls._embedding_dim}, "
                f"got {len(vec1)} and {len(vec2)}"
            )
        
        if not all(isinstance(x, (int, float)) for x in vec1):
            raise ValueError("vec1 must contain only numbers")
        
        if not all(isinstance(x, (int, float)) for x in vec2):
            raise ValueError("vec2 must contain only numbers")
        
        v1 = np.array(vec1, dtype=np.float32)
        v2 = np.array(vec2, dtype=np.float32)
        
        dot_product = np.dot(v1, v2)
        norm1 = np.linalg.norm(v1)
        norm2 = np.linalg.norm(v2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        similarity = float(dot_product / (norm1 * norm2))
        
        # Clamp to valid range
        similarity = max(-1.0, min(1.0, similarity))
        
        return similarity
    
    @classmethod
    def get_performance_stats(cls) -> Dict[str, any]:
        """
        Get performance statistics for the embedding service.
        
        Returns:
            Dict[str, any]: Performance statistics
        """
        return {
            'model_info': cls.get_model_info(),
            'performance': perf_monitor.get_all_stats()
        }
    
    @classmethod
    def clear_cache(cls):
        """Clear the embedding cache."""
        cls._cache.clear()
        cls._cache_hits = 0
        cls._cache_misses = 0
        logger.info("Embedding cache cleared")


# Singleton instance for dependency injection
embedding_service = EmbeddingService()
