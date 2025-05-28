"""
Ethical, Legal, and Performance Evaluation Framework

This package provides comprehensive frameworks for ensuring ethical compliance,
legal adherence, and performance monitoring of AI-driven betting systems.
"""

from .ethical_framework import (
    EthicalFramework,
    EthicalViolationSeverity,
    UserRiskLevel,
    BiasDetector,
    DemographicParityDetector,
    ResponsibleGamblingMonitor,
    TransparencyEngine
)

from .legal_compliance import (
    LegalComplianceFramework,
    ComplianceStatus,
    Jurisdiction,
    DataCategory,
    JurisdictionCompliance,
    USNevadaCompliance,
    EUGDPRCompliance,
    AuditTrailManager,
    DataPrivacyManager
)

from .performance_monitoring import (
    PerformanceMonitoringFramework,
    PerformanceMetricType,
    ModelPerformanceStatus,
    AlertSeverity,
    BettingResult,
    PerformanceMetric,
    PerformanceAlert,
    ModelPerformanceTracker
)

from .continuous_improvement import (
    ContinuousImprovementFramework,
    ImprovementStrategy,
    ExperimentStatus,
    FeedbackType,
    ImprovementEngine,
    ABTestManager,
    FeedbackCollector
)

__version__ = "1.0.0"
__author__ = "NBA Betting System Team"

__all__ = [
    # Ethical Framework
    "EthicalFramework",
    "EthicalViolationSeverity",
    "UserRiskLevel",
    "BiasDetector",
    "DemographicParityDetector",
    "ResponsibleGamblingMonitor",
    "TransparencyEngine",
    
    # Legal Compliance
    "LegalComplianceFramework",
    "ComplianceStatus",
    "Jurisdiction",
    "DataCategory",
    "JurisdictionCompliance",
    "USNevadaCompliance",
    "EUGDPRCompliance",
    "AuditTrailManager",
    "DataPrivacyManager",
    
    # Performance Monitoring
    "PerformanceMonitoringFramework",
    "PerformanceMetricType",
    "ModelPerformanceStatus",
    "AlertSeverity",
    "BettingResult",
    "PerformanceMetric",
    "PerformanceAlert",
    "ModelPerformanceTracker",
    
    # Continuous Improvement
    "ContinuousImprovementFramework",
    "ImprovementStrategy",
    "ExperimentStatus",
    "FeedbackType",
    "ImprovementEngine",
    "ABTestManager",
    "FeedbackCollector"
]

