"""
Real-Time Tokenization Processing Pipeline
==========================================

This module demonstrates a real-time streaming tokenization system
that can process continuous text streams with low latency.
"""

import asyncio
import time
import json
from typing import AsyncGenerator, Dict, List, Optional, Callable
from dataclasses import dataclass, asdict
from collections import deque
from abc import ABC, abstractmethod
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class StreamingToken:
    """Token with streaming metadata."""
    text: str
    timestamp: float
    sequence_id: int
    chunk_id: str
    confidence: float
    processing_time_ms: float

@dataclass
class ProcessingMetrics:
    """Metrics for real-time processing performance."""
    tokens_processed: int
    avg_latency_ms: float
    throughput_tokens_per_sec: float
    error_rate: float
    queue_depth: int

class ContextBuffer:
    """Maintains context across streaming chunks."""
    
    def __init__(self, max_size: int = 1000, overlap_size: int = 100):
        self.max_size = max_size
        self.overlap_size = overlap_size
        self.buffer = deque(maxlen=max_size)
        self.current_context = ""
    
    def add_chunk(self, chunk: str) -> str:
        """Add a new chunk and return context-aware text."""
        self.buffer.append(chunk)
        
        # Create context from recent chunks
        recent_chunks = list(self.buffer)[-3:]  # Last 3 chunks for context
        self.current_context = " ".join(recent_chunks)
        
        return self.current_context
    
    def get_overlap_text(self) -> str:
        """Get overlap text for maintaining continuity."""
        if not self.current_context:
            return ""
        
        words = self.current_context.split()
        if len(words) <= self.overlap_size:
            return self.current_context
        
        return " ".join(words[-self.overlap_size:])

class QualityGate:
    """Real-time quality assessment for tokenization."""
    
    def __init__(self, min_confidence: float = 0.7):
        self.min_confidence = min_confidence
        self.quality_history = deque(maxlen=100)
    
    def assess_quality(self, tokens: List[StreamingToken]) -> Dict[str, float]:
        """Assess quality of tokenized output."""
        if not tokens:
            return {'overall': 0.0, 'confidence': 0.0}
        
        # Calculate metrics
        avg_confidence = sum(token.confidence for token in tokens) / len(tokens)
        avg_processing_time = sum(token.processing_time_ms for token in tokens) / len(tokens)
        
        # Quality score based on confidence and processing time
        quality_score = avg_confidence * (1.0 - min(avg_processing_time / 100.0, 0.5))
        
        metrics = {
            'overall': quality_score,
            'confidence': avg_confidence,
            'processing_time': avg_processing_time,
            'token_count': len(tokens)
        }
        
        self.quality_history.append(quality_score)
        return metrics
    
    def should_reprocess(self, quality_metrics: Dict[str, float]) -> bool:
        """Determine if chunk should be reprocessed."""
        return quality_metrics['confidence'] < self.min_confidence

class AdaptiveTokenizer:
    """Tokenizer that adapts based on content type and performance."""
    
    def __init__(self):
        self.strategies = {
            'fast': self._fast_tokenize,
            'semantic': self._semantic_tokenize,
            'domain': self._domain_tokenize
        }
        self.current_strategy = 'fast'
        self.performance_history = deque(maxlen=50)
    
    async def tokenize(self, text: str, context: str = "", chunk_id: str = "") -> List[StreamingToken]:
        """Tokenize text with adaptive strategy selection."""
        start_time = time.time()
        
        # Select strategy based on content and performance
        strategy = self._select_strategy(text, context)
        tokenize_func = self.strategies[strategy]
        
        # Perform tokenization
        tokens = await tokenize_func(text, context, chunk_id)
        
        # Record performance
        processing_time = (time.time() - start_time) * 1000  # ms
        self.performance_history.append({
            'strategy': strategy,
            'processing_time': processing_time,
            'token_count': len(tokens),
            'text_length': len(text)
        })
        
        return tokens
    
    def _select_strategy(self, text: str, context: str) -> str:
        """Select tokenization strategy based on content and performance."""
        # Simple heuristics for strategy selection
        if len(text) > 1000:
            return 'fast'  # Use fast strategy for long texts
        elif self._contains_domain_terms(text):
            return 'domain'  # Use domain strategy for specialized content
        elif len(context) > 500:
            return 'semantic'  # Use semantic strategy when context is available
        else:
            return 'fast'
    
    def _contains_domain_terms(self, text: str) -> bool:
        """Check if text contains domain-specific terms."""
        medical_terms = ['diagnosis', 'treatment', 'patient', 'medication', 'symptoms']
        legal_terms = ['contract', 'liability', 'jurisdiction', 'plaintiff', 'defendant']
        
        text_lower = text.lower()
        return any(term in text_lower for term in medical_terms + legal_terms)
    
    async def _fast_tokenize(self, text: str, context: str, chunk_id: str) -> List[StreamingToken]:
        """Fast tokenization strategy."""
        words = text.split()
        tokens = []
        
        for i, word in enumerate(words):
            token = StreamingToken(
                text=word,
                timestamp=time.time(),
                sequence_id=i,
                chunk_id=chunk_id,
                confidence=0.9,  # High confidence for simple splitting
                processing_time_ms=0.1
            )
            tokens.append(token)
        
        return tokens
    
    async def _semantic_tokenize(self, text: str, context: str, chunk_id: str) -> List[StreamingToken]:
        """Semantic-aware tokenization strategy."""
        # Simulate more complex processing
        await asyncio.sleep(0.01)  # Simulate processing time
        
        # Simple semantic boundaries (demo)
        sentences = text.split('.')
        tokens = []
        sequence_id = 0
        
        for sentence in sentences:
            if sentence.strip():
                words = sentence.strip().split()
                for word in words:
                    token = StreamingToken(
                        text=word,
                        timestamp=time.time(),
                        sequence_id=sequence_id,
                        chunk_id=chunk_id,
                        confidence=0.85,  # Slightly lower due to complexity
                        processing_time_ms=2.0
                    )
                    tokens.append(token)
                    sequence_id += 1
        
        return tokens
    
    async def _domain_tokenize(self, text: str, context: str, chunk_id: str) -> List[StreamingToken]:
        """Domain-specific tokenization strategy."""
        # Simulate domain-specific processing
        await asyncio.sleep(0.005)
        
        # Preserve domain terms
        domain_terms = {
            'myocardial infarction': 'medical_term',
            'force majeure': 'legal_term',
            'pneumonia': 'medical_term'
        }
        
        tokens = []
        sequence_id = 0
        remaining_text = text
        
        # First, extract domain terms
        for term, term_type in domain_terms.items():
            if term in remaining_text.lower():
                # Create token for domain term
                token = StreamingToken(
                    text=term,
                    timestamp=time.time(),
                    sequence_id=sequence_id,
                    chunk_id=chunk_id,
                    confidence=0.95,  # High confidence for domain terms
                    processing_time_ms=1.5
                )
                tokens.append(token)
                sequence_id += 1
                remaining_text = remaining_text.replace(term, ' ')
        
        # Then tokenize remaining text
        words = remaining_text.split()
        for word in words:
            if word.strip():
                token = StreamingToken(
                    text=word.strip(),
                    timestamp=time.time(),
                    sequence_id=sequence_id,
                    chunk_id=chunk_id,
                    confidence=0.8,
                    processing_time_ms=1.0
                )
                tokens.append(token)
                sequence_id += 1
        
        return tokens

class StreamingTokenizationPipeline:
    """Main pipeline for real-time tokenization processing."""
    
    def __init__(self, 
                 buffer_size: int = 1000,
                 quality_threshold: float = 0.7,
                 max_latency_ms: float = 100.0):
        self.context_buffer = ContextBuffer(max_size=buffer_size)
        self.quality_gate = QualityGate(min_confidence=quality_threshold)
        self.tokenizer = AdaptiveTokenizer()
        self.max_latency_ms = max_latency_ms
        
        # Performance tracking
        self.metrics = ProcessingMetrics(
            tokens_processed=0,
            avg_latency_ms=0.0,
            throughput_tokens_per_sec=0.0,
            error_rate=0.0,
            queue_depth=0
        )
        self.processing_times = deque(maxlen=100)
        self.error_count = 0
        self.total_requests = 0
    
    async def process_stream(self, 
                           text_stream: AsyncGenerator[str, None],
                           callback: Optional[Callable] = None) -> AsyncGenerator[List[StreamingToken], None]:
        """Process a stream of text chunks."""
        chunk_id = 0
        
        async for chunk in text_stream:
            start_time = time.time()
            chunk_id += 1
            
            try:
                # Add chunk to context buffer
                context_text = self.context_buffer.add_chunk(chunk)
                
                # Tokenize with context
                tokens = await self.tokenizer.tokenize(
                    text=chunk,
                    context=context_text,
                    chunk_id=f"chunk_{chunk_id}"
                )
                
                # Quality assessment
                quality_metrics = self.quality_gate.assess_quality(tokens)
                
                # Reprocess if quality is too low
                if self.quality_gate.should_reprocess(quality_metrics):
                    logger.warning(f"Reprocessing chunk {chunk_id} due to low quality")
                    tokens = await self.tokenizer.tokenize(
                        text=chunk,
                        context=context_text,
                        chunk_id=f"chunk_{chunk_id}_reprocessed"
                    )
                
                # Update metrics
                processing_time = (time.time() - start_time) * 1000
                self._update_metrics(tokens, processing_time)
                
                # Call callback if provided
                if callback:
                    await callback(tokens, quality_metrics, self.metrics)
                
                yield tokens
                
            except Exception as e:
                logger.error(f"Error processing chunk {chunk_id}: {e}")
                self.error_count += 1
                self.total_requests += 1
                continue
    
    def _update_metrics(self, tokens: List[StreamingToken], processing_time: float):
        """Update performance metrics."""
        self.processing_times.append(processing_time)
        self.metrics.tokens_processed += len(tokens)
        self.total_requests += 1
        
        # Calculate averages
        if self.processing_times:
            self.metrics.avg_latency_ms = sum(self.processing_times) / len(self.processing_times)
        
        # Calculate throughput (tokens per second)
        if processing_time > 0:
            current_throughput = len(tokens) / (processing_time / 1000.0)
            # Exponential moving average
            if self.metrics.throughput_tokens_per_sec == 0:
                self.metrics.throughput_tokens_per_sec = current_throughput
            else:
                alpha = 0.1  # Smoothing factor
                self.metrics.throughput_tokens_per_sec = (
                    alpha * current_throughput + 
                    (1 - alpha) * self.metrics.throughput_tokens_per_sec
                )
        
        # Calculate error rate
        if self.total_requests > 0:
            self.metrics.error_rate = self.error_count / self.total_requests
    
    async def get_metrics(self) -> ProcessingMetrics:
        """Get current processing metrics."""
        return self.metrics

class PerformanceMonitor:
    """Monitors and reports on pipeline performance."""
    
    def __init__(self, pipeline: StreamingTokenizationPipeline):
        self.pipeline = pipeline
        self.alert_thresholds = {
            'max_latency_ms': 200.0,
            'min_throughput': 100.0,  # tokens per second
            'max_error_rate': 0.05    # 5%
        }
    
    async def monitor(self, interval_seconds: float = 5.0):
        """Continuously monitor pipeline performance."""
        while True:
            await asyncio.sleep(interval_seconds)
            
            metrics = await self.pipeline.get_metrics()
            
            # Check for alerts
            alerts = self._check_alerts(metrics)
            
            # Log metrics
            logger.info(f"Performance Metrics: "
                       f"Latency: {metrics.avg_latency_ms:.1f}ms, "
                       f"Throughput: {metrics.throughput_tokens_per_sec:.1f} tokens/s, "
                       f"Error Rate: {metrics.error_rate:.3f}")
            
            # Log alerts
            for alert in alerts:
                logger.warning(f"Performance Alert: {alert}")
    
    def _check_alerts(self, metrics: ProcessingMetrics) -> List[str]:
        """Check for performance alerts."""
        alerts = []
        
        if metrics.avg_latency_ms > self.alert_thresholds['max_latency_ms']:
            alerts.append(f"High latency: {metrics.avg_latency_ms:.1f}ms")
        
        if metrics.throughput_tokens_per_sec < self.alert_thresholds['min_throughput']:
            alerts.append(f"Low throughput: {metrics.throughput_tokens_per_sec:.1f} tokens/s")
        
        if metrics.error_rate > self.alert_thresholds['max_error_rate']:
            alerts.append(f"High error rate: {metrics.error_rate:.3f}")
        
        return alerts

# Example usage and demonstration
async def simulate_text_stream() -> AsyncGenerator[str, None]:
    """Simulate a stream of text chunks."""
    sample_texts = [
        "The patient was diagnosed with pneumonia and requires immediate treatment.",
        "Medical records indicate a history of hypertension and diabetes.",
        "The contract includes a force majeure clause for unforeseen circumstances.",
        "Legal proceedings will commence next week in federal court.",
        "Real-time processing enables immediate response to changing conditions.",
        "Machine learning models require continuous optimization and monitoring.",
        "Data quality assessment is crucial for reliable AI systems.",
        "Tokenization efficiency directly impacts model performance and costs."
    ]
    
    for i, text in enumerate(sample_texts):
        await asyncio.sleep(0.5)  # Simulate streaming delay
        yield text
        logger.info(f"Streamed chunk {i+1}: {text[:50]}...")

async def process_callback(tokens: List[StreamingToken], 
                          quality_metrics: Dict[str, float],
                          performance_metrics: ProcessingMetrics):
    """Callback function for processing results."""
    logger.info(f"Processed {len(tokens)} tokens, "
               f"Quality: {quality_metrics['overall']:.3f}, "
               f"Confidence: {quality_metrics['confidence']:.3f}")

async def demonstrate_real_time_processing():
    """Demonstrate the real-time tokenization pipeline."""
    print("Real-Time Tokenization Pipeline Demonstration")
    print("=" * 60)
    
    # Create pipeline
    pipeline = StreamingTokenizationPipeline(
        buffer_size=1000,
        quality_threshold=0.7,
        max_latency_ms=100.0
    )
    
    # Create performance monitor
    monitor = PerformanceMonitor(pipeline)
    
    # Start monitoring in background
    monitor_task = asyncio.create_task(monitor.monitor(interval_seconds=2.0))
    
    # Process stream
    text_stream = simulate_text_stream()
    
    print("\nProcessing text stream...")
    print("-" * 30)
    
    token_count = 0
    async for tokens in pipeline.process_stream(text_stream, process_callback):
        token_count += len(tokens)
        
        # Display some tokens
        if tokens:
            print(f"Tokens: {[token.text for token in tokens[:5]]}")
            if len(tokens) > 5:
                print(f"... and {len(tokens) - 5} more tokens")
    
    # Cancel monitoring
    monitor_task.cancel()
    
    # Final metrics
    final_metrics = await pipeline.get_metrics()
    print(f"\nFinal Metrics:")
    print(f"Total tokens processed: {final_metrics.tokens_processed}")
    print(f"Average latency: {final_metrics.avg_latency_ms:.2f}ms")
    print(f"Throughput: {final_metrics.throughput_tokens_per_sec:.1f} tokens/s")
    print(f"Error rate: {final_metrics.error_rate:.3f}")

if __name__ == "__main__":
    asyncio.run(demonstrate_real_time_processing())

