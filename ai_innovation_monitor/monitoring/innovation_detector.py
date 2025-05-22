"""
Innovation Detector - Core component for detecting AI innovations.

This module implements the main innovation detection logic that processes
data from multiple sources and identifies significant AI developments.
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any, Set
from dataclasses import dataclass
from datetime import datetime, timedelta
import json
import re
import hashlib
from collections import defaultdict

from ..core.decision_engine import Innovation


@dataclass
class SourceData:
    """Raw data from a monitoring source."""
    source_id: str
    source_type: str
    content: str
    metadata: Dict[str, Any]
    collected_at: datetime
    url: Optional[str] = None
    title: Optional[str] = None
    author: Optional[str] = None


@dataclass
class DetectionRule:
    """Rule for detecting innovations."""
    rule_id: str
    name: str
    description: str
    keywords: List[str]
    patterns: List[str]
    domains: List[str]
    weight: float
    confidence_threshold: float
    enabled: bool = True


class InnovationDetector:
    """
    Core innovation detection engine.
    
    Processes data from multiple sources and identifies significant
    AI innovations using a combination of keyword matching, pattern
    recognition, and machine learning techniques.
    """
    
    def __init__(self, config: Dict[str, Any]):
        """Initialize the innovation detector."""
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # Detection configuration
        self.detection_rules: List[DetectionRule] = []
        self.keyword_weights = config.get("keyword_weights", {})
        self.domain_weights = config.get("domain_weights", {})
        self.source_weights = config.get("source_weights", {})
        
        # Processing state
        self.processed_items: Set[str] = set()
        self.recent_innovations: List[Innovation] = []
        self.max_recent_items = config.get("max_recent_items", 1000)
        
        # Performance metrics
        self.metrics = {
            "items_processed": 0,
            "innovations_detected": 0,
            "false_positives": 0,
            "processing_time_avg": 0.0
        }
        
        # System state
        self.is_running = False
        
    async def start(self):
        """Start the innovation detector."""
        self.logger.info("Starting Innovation Detector")
        self.is_running = True
        
        # Load detection rules
        await self._load_detection_rules()
        
        # Load processed items cache
        await self._load_processed_cache()
        
        self.logger.info("Innovation Detector started")
        
    async def stop(self):
        """Stop the innovation detector."""
        self.logger.info("Stopping Innovation Detector")
        self.is_running = False
        
        # Save processed items cache
        await self._save_processed_cache()
        
        self.logger.info("Innovation Detector stopped")
        
    async def process_source_data(self, data: List[SourceData]) -> List[Innovation]:
        """
        Process data from sources and detect innovations.
        
        Args:
            data: List of source data to process
            
        Returns:
            List of detected innovations
        """
        if not self.is_running:
            return []
            
        start_time = datetime.now()
        innovations = []
        
        self.logger.info(f"Processing {len(data)} items from sources")
        
        for item in data:
            try:
                # Skip if already processed
                item_hash = self._generate_item_hash(item)
                if item_hash in self.processed_items:
                    continue
                    
                # Detect innovations in this item
                detected = await self._detect_innovations_in_item(item)
                innovations.extend(detected)
                
                # Mark as processed
                self.processed_items.add(item_hash)
                self.metrics["items_processed"] += 1
                
                # Limit cache size
                if len(self.processed_items) > self.max_recent_items:
                    # Remove oldest items (simplified approach)
                    oldest_items = list(self.processed_items)[:100]
                    for old_item in oldest_items:
                        self.processed_items.remove(old_item)
                        
            except Exception as e:
                self.logger.error(f"Error processing item from {item.source_id}: {e}")
                continue
                
        # Update metrics
        processing_time = (datetime.now() - start_time).total_seconds()
        self._update_processing_metrics(processing_time, len(innovations))
        
        # Store recent innovations
        self.recent_innovations.extend(innovations)
        if len(self.recent_innovations) > self.max_recent_items:
            self.recent_innovations = self.recent_innovations[-self.max_recent_items:]
            
        self.logger.info(f"Detected {len(innovations)} innovations from {len(data)} items")
        
        return innovations
        
    async def _detect_innovations_in_item(self, item: SourceData) -> List[Innovation]:
        """Detect innovations in a single source item."""
        innovations = []
        
        # Apply detection rules
        for rule in self.detection_rules:
            if not rule.enabled:
                continue
                
            matches = await self._apply_detection_rule(item, rule)
            if matches:
                innovation = await self._create_innovation_from_matches(
                    item, rule, matches
                )
                if innovation:
                    innovations.append(innovation)
                    
        # Apply ML-based detection if available
        ml_innovations = await self._apply_ml_detection(item)
        innovations.extend(ml_innovations)
        
        # Deduplicate innovations
        innovations = await self._deduplicate_innovations(innovations)
        
        return innovations
        
    async def _apply_detection_rule(self, item: SourceData, 
                                  rule: DetectionRule) -> Dict[str, Any]:
        """Apply a detection rule to an item."""
        matches = {
            "keyword_matches": [],
            "pattern_matches": [],
            "domain_match": False,
            "confidence_score": 0.0
        }
        
        content = item.content.lower()
        title = (item.title or "").lower()
        
        # Check keyword matches
        keyword_score = 0.0
        for keyword in rule.keywords:
            keyword_lower = keyword.lower()
            
            # Count occurrences in content and title
            content_count = content.count(keyword_lower)
            title_count = title.count(keyword_lower) * 2  # Title matches weighted higher
            
            if content_count > 0 or title_count > 0:
                matches["keyword_matches"].append({
                    "keyword": keyword,
                    "content_count": content_count,
                    "title_count": title_count
                })
                
                # Calculate keyword score
                keyword_weight = self.keyword_weights.get(keyword, 1.0)
                keyword_score += (content_count + title_count) * keyword_weight
                
        # Check pattern matches
        pattern_score = 0.0
        for pattern in rule.patterns:
            try:
                pattern_matches = re.findall(pattern, content, re.IGNORECASE)
                if pattern_matches:
                    matches["pattern_matches"].append({
                        "pattern": pattern,
                        "matches": pattern_matches
                    })
                    pattern_score += len(pattern_matches) * 2.0
                    
            except re.error as e:
                self.logger.warning(f"Invalid regex pattern '{pattern}': {e}")
                continue
                
        # Check domain match
        source_domain = item.metadata.get("domain", "general")
        if source_domain in rule.domains or "all" in rule.domains:
            matches["domain_match"] = True
            domain_score = self.domain_weights.get(source_domain, 1.0)
        else:
            domain_score = 0.0
            
        # Calculate overall confidence score
        source_weight = self.source_weights.get(item.source_type, 1.0)
        
        confidence_score = (
            (keyword_score * 0.4 + 
             pattern_score * 0.3 + 
             domain_score * 0.3) * 
            source_weight * rule.weight
        )
        
        matches["confidence_score"] = min(1.0, confidence_score / 10.0)  # Normalize to 0-1
        
        # Return matches if confidence threshold is met
        if matches["confidence_score"] >= rule.confidence_threshold:
            return matches
        else:
            return {}
            
    async def _create_innovation_from_matches(self, item: SourceData,
                                            rule: DetectionRule,
                                            matches: Dict[str, Any]) -> Optional[Innovation]:
        """Create an innovation object from detection matches."""
        
        # Generate unique ID
        innovation_id = hashlib.md5(
            f"{item.source_id}_{item.title}_{rule.rule_id}_{item.collected_at}".encode()
        ).hexdigest()
        
        # Determine domain
        domain = item.metadata.get("domain", "general")
        if rule.domains and rule.domains[0] != "all":
            domain = rule.domains[0]
            
        # Calculate impact score based on various factors
        impact_score = await self._calculate_impact_score(item, rule, matches)
        
        # Extract key information
        title = item.title or f"Innovation detected by {rule.name}"
        description = await self._generate_description(item, rule, matches)
        
        # Create innovation object
        innovation = Innovation(
            id=innovation_id,
            title=title,
            description=description,
            source=item.source_id,
            domain=domain,
            impact_score=impact_score,
            confidence=matches["confidence_score"],
            detected_at=datetime.now(),
            metadata={
                "source_data": {
                    "url": item.url,
                    "author": item.author,
                    "collected_at": item.collected_at.isoformat(),
                    "source_type": item.source_type
                },
                "detection_rule": {
                    "rule_id": rule.rule_id,
                    "rule_name": rule.name
                },
                "matches": matches,
                "keywords": [m["keyword"] for m in matches["keyword_matches"]],
                "patterns": [m["pattern"] for m in matches["pattern_matches"]]
            }
        )
        
        return innovation
        
    async def _calculate_impact_score(self, item: SourceData,
                                    rule: DetectionRule,
                                    matches: Dict[str, Any]) -> float:
        """Calculate impact score for an innovation."""
        
        # Base score from rule weight and confidence
        base_score = rule.weight * matches["confidence_score"] * 5.0
        
        # Adjust based on source credibility
        source_credibility = self.source_weights.get(item.source_type, 1.0)
        credibility_adjustment = source_credibility * 2.0
        
        # Adjust based on recency
        age_hours = (datetime.now() - item.collected_at).total_seconds() / 3600
        recency_adjustment = max(0.5, 2.0 - (age_hours / 24))  # Decay over 48 hours
        
        # Adjust based on keyword importance
        keyword_importance = 0.0
        for match in matches["keyword_matches"]:
            keyword = match["keyword"]
            importance = self.keyword_weights.get(keyword, 1.0)
            keyword_importance += importance * (match["content_count"] + match["title_count"])
            
        keyword_adjustment = min(3.0, keyword_importance / 5.0)
        
        # Adjust based on content length and quality
        content_length = len(item.content)
        length_adjustment = min(1.5, content_length / 1000)  # Longer content = higher quality
        
        # Calculate final impact score
        impact_score = (
            base_score + 
            credibility_adjustment + 
            recency_adjustment + 
            keyword_adjustment + 
            length_adjustment
        )
        
        return min(10.0, max(0.0, impact_score))
        
    async def _generate_description(self, item: SourceData,
                                  rule: DetectionRule,
                                  matches: Dict[str, Any]) -> str:
        """Generate a description for the innovation."""
        
        description_parts = []
        
        # Add source information
        description_parts.append(f"Detected from {item.source_type} source: {item.source_id}")
        
        # Add matched keywords
        if matches["keyword_matches"]:
            keywords = [m["keyword"] for m in matches["keyword_matches"]]
            description_parts.append(f"Key terms: {', '.join(keywords[:5])}")
            
        # Add content excerpt
        content_excerpt = item.content[:300] + "..." if len(item.content) > 300 else item.content
        description_parts.append(f"Content excerpt: {content_excerpt}")
        
        # Add detection rule information
        description_parts.append(f"Detected by rule: {rule.name}")
        
        return " | ".join(description_parts)
        
    async def _apply_ml_detection(self, item: SourceData) -> List[Innovation]:
        """Apply machine learning-based detection."""
        # Placeholder for ML-based detection
        # In a real implementation, this would use trained models
        # to detect innovations that might not match explicit rules
        
        innovations = []
        
        # Example: Simple heuristic for breakthrough detection
        content = item.content.lower()
        breakthrough_indicators = [
            "breakthrough", "revolutionary", "first time", "unprecedented",
            "game-changing", "paradigm shift", "major advance"
        ]
        
        indicator_count = sum(1 for indicator in breakthrough_indicators if indicator in content)
        
        if indicator_count >= 2:
            # Create innovation for potential breakthrough
            innovation_id = hashlib.md5(
                f"{item.source_id}_ml_breakthrough_{item.collected_at}".encode()
            ).hexdigest()
            
            innovation = Innovation(
                id=innovation_id,
                title=f"Potential Breakthrough: {item.title or 'Untitled'}",
                description=f"ML detection identified potential breakthrough with {indicator_count} indicators",
                source=item.source_id,
                domain=item.metadata.get("domain", "general"),
                impact_score=min(8.0, 5.0 + indicator_count),
                confidence=0.6,  # Lower confidence for ML detection
                detected_at=datetime.now(),
                metadata={
                    "detection_method": "ml_heuristic",
                    "indicators_found": indicator_count,
                    "source_data": {
                        "url": item.url,
                        "collected_at": item.collected_at.isoformat()
                    }
                }
            )
            
            innovations.append(innovation)
            
        return innovations
        
    async def _deduplicate_innovations(self, innovations: List[Innovation]) -> List[Innovation]:
        """Remove duplicate innovations."""
        if not innovations:
            return innovations
            
        # Group by similar titles and sources
        groups = defaultdict(list)
        
        for innovation in innovations:
            # Create a key based on title similarity and source
            title_key = re.sub(r'[^a-zA-Z0-9\s]', '', innovation.title.lower())
            title_words = set(title_key.split())
            
            # Find existing group with similar title
            matched_group = None
            for existing_key in groups.keys():
                existing_words = set(existing_key.split('_')[0].split())
                
                # Check for significant word overlap
                overlap = len(title_words & existing_words)
                total_words = len(title_words | existing_words)
                
                if total_words > 0 and overlap / total_words > 0.6:
                    matched_group = existing_key
                    break
                    
            if matched_group:
                groups[matched_group].append(innovation)
            else:
                new_key = f"{title_key}_{innovation.source}"
                groups[new_key] = [innovation]
                
        # Select best innovation from each group
        deduplicated = []
        for group in groups.values():
            if len(group) == 1:
                deduplicated.append(group[0])
            else:
                # Select innovation with highest confidence * impact_score
                best_innovation = max(
                    group, 
                    key=lambda x: x.confidence * x.impact_score
                )
                deduplicated.append(best_innovation)
                
        return deduplicated
        
    def _generate_item_hash(self, item: SourceData) -> str:
        """Generate a hash for an item to track processing."""
        content_hash = hashlib.md5(
            f"{item.source_id}_{item.title}_{item.content[:100]}".encode()
        ).hexdigest()
        return content_hash
        
    def _update_processing_metrics(self, processing_time: float, innovations_count: int):
        """Update processing performance metrics."""
        # Update average processing time
        total_processed = self.metrics["items_processed"]
        if total_processed == 0:
            self.metrics["processing_time_avg"] = processing_time
        else:
            current_avg = self.metrics["processing_time_avg"]
            self.metrics["processing_time_avg"] = (
                (current_avg * (total_processed - 1) + processing_time) / total_processed
            )
            
        # Update innovation count
        self.metrics["innovations_detected"] += innovations_count
        
    async def _load_detection_rules(self):
        """Load detection rules from configuration."""
        rules_config = self.config.get("detection_rules", [])
        
        # Default rules if none configured
        if not rules_config:
            rules_config = [
                {
                    "rule_id": "ai_breakthrough",
                    "name": "AI Breakthrough Detection",
                    "description": "Detects major AI breakthroughs and advances",
                    "keywords": [
                        "artificial intelligence", "machine learning", "deep learning",
                        "neural network", "transformer", "GPT", "LLM", "AGI",
                        "breakthrough", "state-of-the-art", "SOTA"
                    ],
                    "patterns": [
                        r"achieves?\s+(?:new\s+)?(?:state[- ]of[- ]the[- ]art|SOTA)",
                        r"(?:first|breakthrough|revolutionary)\s+(?:AI|artificial intelligence)",
                        r"(?:outperforms?|beats?|exceeds?)\s+(?:human|previous)\s+(?:performance|results)"
                    ],
                    "domains": ["ai", "ml", "research"],
                    "weight": 1.0,
                    "confidence_threshold": 0.3
                },
                {
                    "rule_id": "security_threat",
                    "name": "AI Security Threat Detection",
                    "description": "Detects AI-related security threats and vulnerabilities",
                    "keywords": [
                        "adversarial", "attack", "vulnerability", "exploit",
                        "security", "privacy", "bias", "fairness", "safety"
                    ],
                    "patterns": [
                        r"(?:AI|artificial intelligence)\s+(?:attack|vulnerability|exploit)",
                        r"(?:adversarial|malicious)\s+(?:AI|machine learning)",
                        r"(?:privacy|security)\s+(?:breach|violation|concern)"
                    ],
                    "domains": ["security", "privacy", "safety"],
                    "weight": 1.2,
                    "confidence_threshold": 0.4
                },
                {
                    "rule_id": "industry_adoption",
                    "name": "Industry AI Adoption",
                    "description": "Detects significant AI adoption in industries",
                    "keywords": [
                        "adoption", "deployment", "implementation", "integration",
                        "enterprise", "industry", "commercial", "production"
                    ],
                    "patterns": [
                        r"(?:company|enterprise|industry)\s+(?:adopts?|deploys?|implements?)\s+(?:AI|artificial intelligence)",
                        r"(?:AI|artificial intelligence)\s+(?:in\s+)?production",
                        r"commercial\s+(?:AI|artificial intelligence)\s+(?:solution|system)"
                    ],
                    "domains": ["industry", "business", "enterprise"],
                    "weight": 0.8,
                    "confidence_threshold": 0.3
                }
            ]
            
        # Convert to DetectionRule objects
        for rule_config in rules_config:
            rule = DetectionRule(
                rule_id=rule_config["rule_id"],
                name=rule_config["name"],
                description=rule_config["description"],
                keywords=rule_config["keywords"],
                patterns=rule_config["patterns"],
                domains=rule_config["domains"],
                weight=rule_config["weight"],
                confidence_threshold=rule_config["confidence_threshold"],
                enabled=rule_config.get("enabled", True)
            )
            self.detection_rules.append(rule)
            
        self.logger.info(f"Loaded {len(self.detection_rules)} detection rules")
        
    async def _load_processed_cache(self):
        """Load cache of processed items."""
        # Placeholder for loading from persistent storage
        self.logger.info("Processed items cache loaded (placeholder)")
        
    async def _save_processed_cache(self):
        """Save cache of processed items."""
        # Placeholder for saving to persistent storage
        self.logger.info("Processed items cache saved (placeholder)")
        
    async def get_recent_innovations(self, limit: int = 50) -> List[Innovation]:
        """Get recently detected innovations."""
        return self.recent_innovations[-limit:] if self.recent_innovations else []
        
    async def get_metrics(self) -> Dict[str, Any]:
        """Get detection metrics."""
        return self.metrics.copy()
        
    async def health_check(self) -> str:
        """Check health of the innovation detector."""
        if not self.is_running:
            return "stopped"
            
        if not self.detection_rules:
            return "no_rules"
            
        return "healthy"

