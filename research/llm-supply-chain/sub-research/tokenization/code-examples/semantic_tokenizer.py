"""
Semantic-Aware Tokenizer Prototype
==================================

This module demonstrates a proof-of-concept implementation of semantic-aware tokenization
that preserves meaning during the tokenization process.
"""

import re
import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from abc import ABC, abstractmethod

@dataclass
class Token:
    """Represents a token with semantic information."""
    text: str
    start: int
    end: int
    semantic_score: float
    domain_relevance: float
    token_type: str  # 'word', 'subword', 'domain_term', 'semantic_unit'

@dataclass
class SemanticBoundary:
    """Represents a semantic boundary in text."""
    position: int
    strength: float  # 0.0 to 1.0, higher means stronger boundary
    boundary_type: str  # 'word', 'phrase', 'concept', 'domain'

class DomainVocabulary:
    """Manages domain-specific vocabulary and terminology."""
    
    def __init__(self, domain: str):
        self.domain = domain
        self.terms = {}
        self.patterns = {}
        self.load_domain_vocabulary()
    
    def load_domain_vocabulary(self):
        """Load domain-specific vocabulary and patterns."""
        if self.domain == 'medical':
            self.terms = {
                'pneumonia': {'importance': 0.9, 'preserve': True},
                'myocardial infarction': {'importance': 0.95, 'preserve': True},
                'hypertension': {'importance': 0.8, 'preserve': True},
                'acetaminophen': {'importance': 0.85, 'preserve': True},
            }
            self.patterns = {
                r'\d+\s*mg': {'type': 'dosage', 'importance': 0.7},
                r'[A-Z]{2,}\d+': {'type': 'code', 'importance': 0.8},
            }
        elif self.domain == 'legal':
            self.terms = {
                'habeas corpus': {'importance': 0.9, 'preserve': True},
                'res ipsa loquitur': {'importance': 0.85, 'preserve': True},
                'force majeure': {'importance': 0.8, 'preserve': True},
            }
            self.patterns = {
                r'\d+\s+U\.S\.C\.\s+§\s+\d+': {'type': 'statute', 'importance': 0.9},
                r'[A-Z][a-z]+\s+v\.\s+[A-Z][a-z]+': {'type': 'case', 'importance': 0.85},
            }
    
    def get_term_importance(self, term: str) -> float:
        """Get the importance score for a domain term."""
        return self.terms.get(term.lower(), {}).get('importance', 0.0)
    
    def should_preserve(self, term: str) -> bool:
        """Check if a term should be preserved as a single token."""
        return self.terms.get(term.lower(), {}).get('preserve', False)

class SemanticAnalyzer:
    """Analyzes text for semantic boundaries and meaning preservation."""
    
    def __init__(self, domain_vocab: DomainVocabulary):
        self.domain_vocab = domain_vocab
        self.embedding_model = None  # Would load actual embedding model
    
    def detect_semantic_boundaries(self, text: str) -> List[SemanticBoundary]:
        """Detect semantic boundaries in text."""
        boundaries = []
        
        # Word boundaries (basic)
        for match in re.finditer(r'\b', text):
            boundaries.append(SemanticBoundary(
                position=match.start(),
                strength=0.3,
                boundary_type='word'
            ))
        
        # Domain-specific term boundaries
        for term in self.domain_vocab.terms:
            for match in re.finditer(re.escape(term), text, re.IGNORECASE):
                boundaries.append(SemanticBoundary(
                    position=match.start(),
                    strength=0.8,
                    boundary_type='domain'
                ))
                boundaries.append(SemanticBoundary(
                    position=match.end(),
                    strength=0.8,
                    boundary_type='domain'
                ))
        
        # Pattern-based boundaries
        for pattern, info in self.domain_vocab.patterns.items():
            for match in re.finditer(pattern, text):
                boundaries.append(SemanticBoundary(
                    position=match.start(),
                    strength=info['importance'],
                    boundary_type=info['type']
                ))
                boundaries.append(SemanticBoundary(
                    position=match.end(),
                    strength=info['importance'],
                    boundary_type=info['type']
                ))
        
        # Sort by position and remove duplicates
        boundaries.sort(key=lambda x: x.position)
        return self._merge_nearby_boundaries(boundaries)
    
    def _merge_nearby_boundaries(self, boundaries: List[SemanticBoundary]) -> List[SemanticBoundary]:
        """Merge boundaries that are very close to each other."""
        if not boundaries:
            return []
        
        merged = [boundaries[0]]
        for boundary in boundaries[1:]:
            if boundary.position - merged[-1].position <= 2:
                # Merge with previous boundary, keeping stronger one
                if boundary.strength > merged[-1].strength:
                    merged[-1] = boundary
            else:
                merged.append(boundary)
        
        return merged
    
    def calculate_semantic_score(self, text_segment: str) -> float:
        """Calculate semantic coherence score for a text segment."""
        # Simplified semantic scoring
        score = 0.5  # Base score
        
        # Boost for domain terms
        for term in self.domain_vocab.terms:
            if term.lower() in text_segment.lower():
                score += self.domain_vocab.get_term_importance(term) * 0.3
        
        # Penalty for fragmented words
        if len(text_segment) < 3 and text_segment.isalpha():
            score -= 0.2
        
        # Boost for complete words
        if text_segment.strip() and text_segment.strip().isalpha() and len(text_segment) >= 3:
            score += 0.2
        
        return min(1.0, max(0.0, score))

class SemanticTokenizer:
    """Main semantic-aware tokenizer class."""
    
    def __init__(self, domain: str = 'general', preserve_semantics: bool = True):
        self.domain = domain
        self.preserve_semantics = preserve_semantics
        self.domain_vocab = DomainVocabulary(domain)
        self.semantic_analyzer = SemanticAnalyzer(self.domain_vocab)
        self.fallback_tokenizer = self._load_fallback_tokenizer()
    
    def _load_fallback_tokenizer(self):
        """Load a fallback tokenizer (e.g., BPE) for comparison."""
        # In practice, this would load an actual tokenizer like GPT-2 BPE
        return None
    
    def tokenize(self, text: str, context: Optional[str] = None) -> List[Token]:
        """Tokenize text with semantic awareness."""
        if not self.preserve_semantics:
            return self._fallback_tokenize(text)
        
        # Detect semantic boundaries
        boundaries = self.semantic_analyzer.detect_semantic_boundaries(text)
        
        # Create segments based on boundaries
        segments = self._create_segments(text, boundaries)
        
        # Convert segments to tokens
        tokens = []
        for segment in segments:
            token = self._create_token(segment, text)
            tokens.append(token)
        
        return tokens
    
    def _create_segments(self, text: str, boundaries: List[SemanticBoundary]) -> List[str]:
        """Create text segments based on semantic boundaries."""
        if not boundaries:
            return [text]
        
        segments = []
        start = 0
        
        for boundary in boundaries:
            if boundary.position > start:
                segment = text[start:boundary.position].strip()
                if segment:
                    segments.append(segment)
            start = boundary.position
        
        # Add final segment
        if start < len(text):
            final_segment = text[start:].strip()
            if final_segment:
                segments.append(final_segment)
        
        return segments
    
    def _create_token(self, segment: str, full_text: str) -> Token:
        """Create a token from a text segment."""
        start = full_text.find(segment)
        end = start + len(segment)
        
        semantic_score = self.semantic_analyzer.calculate_semantic_score(segment)
        domain_relevance = self.domain_vocab.get_term_importance(segment)
        
        # Determine token type
        if self.domain_vocab.should_preserve(segment):
            token_type = 'domain_term'
        elif semantic_score > 0.7:
            token_type = 'semantic_unit'
        elif len(segment.split()) > 1:
            token_type = 'phrase'
        else:
            token_type = 'word'
        
        return Token(
            text=segment,
            start=start,
            end=end,
            semantic_score=semantic_score,
            domain_relevance=domain_relevance,
            token_type=token_type
        )
    
    def _fallback_tokenize(self, text: str) -> List[Token]:
        """Fallback to standard tokenization."""
        # Simple word-based tokenization for demonstration
        words = text.split()
        tokens = []
        start = 0
        
        for word in words:
            end = start + len(word)
            token = Token(
                text=word,
                start=start,
                end=end,
                semantic_score=0.5,
                domain_relevance=0.0,
                token_type='word'
            )
            tokens.append(token)
            start = end + 1  # +1 for space
        
        return tokens
    
    def evaluate_quality(self, tokens: List[Token]) -> Dict[str, float]:
        """Evaluate the quality of tokenization."""
        if not tokens:
            return {'overall': 0.0}
        
        # Calculate various quality metrics
        semantic_scores = [token.semantic_score for token in tokens]
        domain_scores = [token.domain_relevance for token in tokens]
        
        metrics = {
            'semantic_coherence': np.mean(semantic_scores),
            'domain_preservation': np.mean(domain_scores),
            'token_count': len(tokens),
            'avg_token_length': np.mean([len(token.text) for token in tokens]),
            'domain_term_ratio': sum(1 for t in tokens if t.token_type == 'domain_term') / len(tokens),
        }
        
        # Overall quality score (weighted combination)
        metrics['overall'] = (
            metrics['semantic_coherence'] * 0.4 +
            metrics['domain_preservation'] * 0.3 +
            min(1.0, 10.0 / metrics['token_count']) * 0.2 +  # Prefer fewer tokens
            metrics['domain_term_ratio'] * 0.1
        )
        
        return metrics

class BiasDetector:
    """Detects potential biases in tokenization."""
    
    def __init__(self):
        self.demographic_terms = self._load_demographic_terms()
        self.bias_patterns = self._load_bias_patterns()
    
    def _load_demographic_terms(self) -> Dict[str, List[str]]:
        """Load demographic terms for bias detection."""
        return {
            'gender': ['he', 'she', 'man', 'woman', 'male', 'female'],
            'race': ['black', 'white', 'asian', 'hispanic', 'latino'],
            'religion': ['christian', 'muslim', 'jewish', 'hindu', 'buddhist'],
            'age': ['young', 'old', 'elderly', 'teenager', 'senior'],
        }
    
    def _load_bias_patterns(self) -> List[str]:
        """Load patterns that might indicate bias."""
        return [
            r'\b(he|she)\s+is\s+(aggressive|emotional|logical)',
            r'\b(black|white|asian)\s+(person|people)\s+(are|is)',
            r'\b(old|young)\s+(people|person)\s+(can\'t|cannot)',
        ]
    
    def detect_bias(self, tokenizer: SemanticTokenizer, test_texts: List[str]) -> Dict[str, float]:
        """Detect potential biases in tokenization."""
        bias_scores = {
            'demographic_fragmentation': 0.0,
            'length_bias': 0.0,
            'representation_bias': 0.0,
        }
        
        all_tokens = []
        for text in test_texts:
            tokens = tokenizer.tokenize(text)
            all_tokens.extend(tokens)
        
        # Check demographic term fragmentation
        demographic_fragmentation = self._check_demographic_fragmentation(all_tokens)
        bias_scores['demographic_fragmentation'] = demographic_fragmentation
        
        # Check length bias (different tokenization for similar concepts)
        length_bias = self._check_length_bias(all_tokens)
        bias_scores['length_bias'] = length_bias
        
        # Check representation bias
        representation_bias = self._check_representation_bias(all_tokens)
        bias_scores['representation_bias'] = representation_bias
        
        return bias_scores
    
    def _check_demographic_fragmentation(self, tokens: List[Token]) -> float:
        """Check if demographic terms are fragmented differently."""
        fragmentation_scores = []
        
        for category, terms in self.demographic_terms.items():
            for term in terms:
                term_tokens = [t for t in tokens if term.lower() in t.text.lower()]
                if term_tokens:
                    # Calculate average fragmentation
                    avg_fragmentation = np.mean([
                        len(t.text) / len(term) for t in term_tokens
                    ])
                    fragmentation_scores.append(1.0 - avg_fragmentation)
        
        return np.mean(fragmentation_scores) if fragmentation_scores else 0.0
    
    def _check_length_bias(self, tokens: List[Token]) -> float:
        """Check for length bias in tokenization."""
        # Simplified: check if similar-length words have very different token counts
        word_lengths = {}
        for token in tokens:
            if token.token_type == 'word':
                length = len(token.text)
                if length not in word_lengths:
                    word_lengths[length] = []
                word_lengths[length].append(1)  # Each word is 1 token in this simple case
        
        # Calculate variance in tokenization for similar-length words
        variances = []
        for length, counts in word_lengths.items():
            if len(counts) > 1:
                variances.append(np.var(counts))
        
        return np.mean(variances) if variances else 0.0
    
    def _check_representation_bias(self, tokens: List[Token]) -> float:
        """Check for representation bias across different groups."""
        # Simplified: check if certain demographic terms appear more frequently
        term_counts = {}
        total_tokens = len(tokens)
        
        for token in tokens:
            for category, terms in self.demographic_terms.items():
                for term in terms:
                    if term.lower() in token.text.lower():
                        if category not in term_counts:
                            term_counts[category] = 0
                        term_counts[category] += 1
        
        # Calculate representation variance
        if not term_counts:
            return 0.0
        
        frequencies = [count / total_tokens for count in term_counts.values()]
        return np.var(frequencies)

# Example usage and demonstration
def demonstrate_semantic_tokenizer():
    """Demonstrate the semantic tokenizer with examples."""
    
    print("Semantic Tokenizer Demonstration")
    print("=" * 50)
    
    # Medical domain example
    medical_text = "The patient was diagnosed with pneumonia and prescribed acetaminophen 500 mg twice daily."
    
    print(f"\nMedical Text: {medical_text}")
    print("-" * 30)
    
    # Standard tokenization (simulated)
    standard_tokenizer = SemanticTokenizer(domain='medical', preserve_semantics=False)
    standard_tokens = standard_tokenizer.tokenize(medical_text)
    
    print("Standard Tokenization:")
    for token in standard_tokens:
        print(f"  '{token.text}' (score: {token.semantic_score:.2f})")
    
    # Semantic tokenization
    semantic_tokenizer = SemanticTokenizer(domain='medical', preserve_semantics=True)
    semantic_tokens = semantic_tokenizer.tokenize(medical_text)
    
    print("\nSemantic Tokenization:")
    for token in semantic_tokens:
        print(f"  '{token.text}' (score: {token.semantic_score:.2f}, type: {token.token_type})")
    
    # Quality evaluation
    standard_quality = standard_tokenizer.evaluate_quality(standard_tokens)
    semantic_quality = semantic_tokenizer.evaluate_quality(semantic_tokens)
    
    print(f"\nQuality Comparison:")
    print(f"Standard - Overall: {standard_quality['overall']:.3f}, Tokens: {standard_quality['token_count']}")
    print(f"Semantic - Overall: {semantic_quality['overall']:.3f}, Tokens: {semantic_quality['token_count']}")
    
    # Bias detection
    bias_detector = BiasDetector()
    test_texts = [
        medical_text,
        "The elderly patient showed symptoms of hypertension.",
        "Young doctors often prescribe modern medications."
    ]
    
    bias_scores = bias_detector.detect_bias(semantic_tokenizer, test_texts)
    print(f"\nBias Detection:")
    for bias_type, score in bias_scores.items():
        print(f"  {bias_type}: {score:.3f}")

if __name__ == "__main__":
    demonstrate_semantic_tokenizer()

