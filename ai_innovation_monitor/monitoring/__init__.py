"""
Monitoring Framework for AI Innovation Detection.

This module provides comprehensive monitoring capabilities for detecting
AI innovations across multiple sources and channels.
"""

__version__ = "1.0.0"

from .innovation_detector import InnovationDetector
from .source_manager import SourceManager
from .trend_analyzer import TrendAnalyzer
from .threat_detector import ThreatDetector

__all__ = [
    "InnovationDetector",
    "SourceManager", 
    "TrendAnalyzer",
    "ThreatDetector"
]

