"""
Configuration settings for the Evaluation Framework

This module contains default configurations and settings for all
evaluation framework components.
"""

from datetime import timedelta
from .legal_compliance import Jurisdiction, DataCategory
from .performance_monitoring import PerformanceMetricType
from .continuous_improvement import ImprovementStrategy


# Default configuration for the entire evaluation framework
DEFAULT_CONFIG = {
    "ethical": {
        "bias_detection": {
            "demographic_parity_threshold": 0.1,
            "enable_continuous_monitoring": True,
            "monitoring_interval_hours": 6
        },
        "responsible_gambling": {
            "risk_thresholds": {
                "max_session_duration": timedelta(hours=4),
                "max_daily_loss": 1000.0,
                "max_bet_frequency": 50,
                "min_win_rate_concern": 0.1
            },
            "intervention_cooldowns": {
                "warning": timedelta(minutes=30),
                "session_limit": timedelta(hours=2),
                "account_suspension": timedelta(hours=24)
            }
        },
        "transparency": {
            "explanation_cache_size": 10000,
            "min_confidence_for_explanation": 0.5,
            "feature_importance_threshold": 0.1
        }
    },
    
    "legal": {
        "default_jurisdiction": Jurisdiction.US_NEVADA,
        "supported_jurisdictions": [
            Jurisdiction.US_NEVADA,
            Jurisdiction.US_NEW_JERSEY,
            Jurisdiction.US_PENNSYLVANIA,
            Jurisdiction.UK,
            Jurisdiction.ONTARIO_CANADA,
            Jurisdiction.EUROPEAN_UNION,
            Jurisdiction.AUSTRALIA
        ],
        "audit_trail": {
            "enable_hash_chain": True,
            "max_entries": 100000,
            "backup_interval_hours": 24
        },
        "data_privacy": {
            "auto_deletion_enabled": True,
            "deletion_check_interval_hours": 24,
            "data_subject_request_timeout_days": 30
        }
    },
    
    "performance": {
        "alert_thresholds": {
            PerformanceMetricType.ROI: {
                "warning": -5.0,
                "critical": -10.0
            },
            PerformanceMetricType.WIN_RATE: {
                "warning": 45.0,
                "critical": 40.0
            },
            PerformanceMetricType.SHARPE_RATIO: {
                "warning": 0.5,
                "critical": 0.0
            },
            PerformanceMetricType.MAXIMUM_DRAWDOWN: {
                "warning": 1000.0,
                "critical": 2000.0
            }
        },
        "monitoring": {
            "results_history_size": 10000,
            "trend_window_size": 100,
            "performance_check_interval_hours": 1
        },
        "benchmarks": {
            "roi_target": 5.0,
            "win_rate_target": 52.4,
            "sharpe_ratio_target": 1.0
        }
    },
    
    "improvement": {
        "improvement_cycle_hours": 24,
        "feedback_collection": {
            "performance_weight": 0.6,
            "market_weight": 0.3,
            "user_behavior_weight": 0.1
        },
        "action_execution": {
            "max_concurrent_actions": 3,
            "min_priority_for_execution": 7,
            "success_threshold": 0.1
        },
        "ab_testing": {
            "default_duration_days": 14,
            "default_traffic_split": 0.5,
            "minimum_sample_size": 100,
            "statistical_significance_level": 0.05
        },
        "strategy_priorities": {
            ImprovementStrategy.MODEL_RETRAINING: 9,
            ImprovementStrategy.HYPERPARAMETER_TUNING: 7,
            ImprovementStrategy.FEATURE_ENGINEERING: 6,
            ImprovementStrategy.ENSEMBLE_OPTIMIZATION: 5,
            ImprovementStrategy.DATA_AUGMENTATION: 4,
            ImprovementStrategy.ARCHITECTURE_CHANGE: 8
        }
    }
}


# Jurisdiction-specific configurations
JURISDICTION_CONFIGS = {
    Jurisdiction.US_NEVADA: {
        "min_age": 21,
        "max_single_bet": 50000.0,
        "max_daily_loss": 10000.0,
        "required_licenses": ["nevada_gaming_license"],
        "data_retention": {
            DataCategory.FINANCIAL: timedelta(days=2555),  # 7 years
            DataCategory.PERSONAL_IDENTIFIABLE: timedelta(days=1825),  # 5 years
            DataCategory.BEHAVIORAL: timedelta(days=1095),  # 3 years
        },
        "required_disclosures": [
            "Gambling problem? Call 1-800-522-4700",
            "Must be 21 or older to gamble",
            "Licensed by Nevada Gaming Control Board"
        ]
    },
    
    Jurisdiction.US_NEW_JERSEY: {
        "min_age": 21,
        "max_single_bet": 25000.0,
        "max_daily_loss": 5000.0,
        "required_licenses": ["nj_gaming_license"],
        "data_retention": {
            DataCategory.FINANCIAL: timedelta(days=2555),  # 7 years
            DataCategory.PERSONAL_IDENTIFIABLE: timedelta(days=1825),  # 5 years
            DataCategory.BEHAVIORAL: timedelta(days=1095),  # 3 years
        },
        "required_disclosures": [
            "Gambling problem? Call 1-800-GAMBLER",
            "Must be 21 or older to gamble",
            "Licensed by New Jersey Division of Gaming Enforcement"
        ]
    },
    
    Jurisdiction.EUROPEAN_UNION: {
        "min_age": 18,
        "gdpr_compliance": True,
        "data_retention": {
            DataCategory.PERSONAL_IDENTIFIABLE: timedelta(days=365),  # 1 year after account closure
            DataCategory.FINANCIAL: timedelta(days=2190),  # 6 years
            DataCategory.BEHAVIORAL: timedelta(days=730),  # 2 years
        },
        "required_consents": [
            "data_processing",
            "marketing",
            "profiling"
        ],
        "data_subject_rights": [
            "right_to_access",
            "right_to_rectification",
            "right_to_erasure",
            "right_to_restrict_processing",
            "right_to_data_portability",
            "right_to_object"
        ]
    },
    
    Jurisdiction.UK: {
        "min_age": 18,
        "max_single_bet": 100000.0,  # GBP
        "required_licenses": ["uk_gambling_commission_license"],
        "data_retention": {
            DataCategory.FINANCIAL: timedelta(days=2190),  # 6 years
            DataCategory.PERSONAL_IDENTIFIABLE: timedelta(days=1825),  # 5 years
            DataCategory.BEHAVIORAL: timedelta(days=1095),  # 3 years
        },
        "required_disclosures": [
            "When the fun stops, stop",
            "Must be 18 or older to gamble",
            "Licensed by UK Gambling Commission"
        ]
    }
}


# Model-specific performance thresholds
MODEL_PERFORMANCE_THRESHOLDS = {
    "ensemble_model": {
        "roi_excellent": 12.0,
        "roi_good": 8.0,
        "roi_acceptable": 3.0,
        "win_rate_excellent": 65.0,
        "win_rate_good": 58.0,
        "win_rate_acceptable": 52.0
    },
    "neural_network": {
        "roi_excellent": 10.0,
        "roi_good": 6.0,
        "roi_acceptable": 2.0,
        "win_rate_excellent": 62.0,
        "win_rate_good": 56.0,
        "win_rate_acceptable": 51.0
    },
    "gradient_boosting": {
        "roi_excellent": 11.0,
        "roi_good": 7.0,
        "roi_acceptable": 3.0,
        "win_rate_excellent": 63.0,
        "win_rate_good": 57.0,
        "win_rate_acceptable": 52.0
    }
}


# Bias detection configurations
BIAS_DETECTION_CONFIG = {
    "protected_attributes": [
        "age_group",
        "geographic_region",
        "betting_history_length",
        "account_tier"
    ],
    "fairness_metrics": [
        "demographic_parity",
        "equalized_odds",
        "calibration"
    ],
    "thresholds": {
        "demographic_parity": 0.1,
        "equalized_odds": 0.1,
        "calibration": 0.05
    },
    "monitoring_frequency": "daily",
    "alert_on_violation": True
}


# Continuous improvement configurations
IMPROVEMENT_CONFIG = {
    "feedback_sources": {
        "performance_metrics": {
            "weight": 0.6,
            "update_frequency": "hourly"
        },
        "market_conditions": {
            "weight": 0.3,
            "update_frequency": "daily"
        },
        "user_behavior": {
            "weight": 0.1,
            "update_frequency": "daily"
        }
    },
    "improvement_strategies": {
        ImprovementStrategy.MODEL_RETRAINING: {
            "trigger_threshold": 0.15,  # 15% performance drop
            "estimated_effort": 8,
            "success_probability": 0.7
        },
        ImprovementStrategy.HYPERPARAMETER_TUNING: {
            "trigger_threshold": 0.10,  # 10% performance drop
            "estimated_effort": 4,
            "success_probability": 0.6
        },
        ImprovementStrategy.FEATURE_ENGINEERING: {
            "trigger_threshold": 0.12,  # 12% performance drop
            "estimated_effort": 6,
            "success_probability": 0.5
        }
    }
}


def get_config_for_jurisdiction(jurisdiction: Jurisdiction) -> dict:
    """Get configuration specific to a jurisdiction"""
    base_config = DEFAULT_CONFIG.copy()
    jurisdiction_config = JURISDICTION_CONFIGS.get(jurisdiction, {})
    
    # Merge jurisdiction-specific config
    if jurisdiction_config:
        base_config["legal"].update(jurisdiction_config)
    
    return base_config


def get_model_thresholds(model_type: str) -> dict:
    """Get performance thresholds for a specific model type"""
    return MODEL_PERFORMANCE_THRESHOLDS.get(model_type, MODEL_PERFORMANCE_THRESHOLDS["ensemble_model"])


def validate_config(config: dict) -> Tuple[bool, List[str]]:
    """
    Validate configuration settings
    
    Returns:
        Tuple of (is_valid, list_of_errors)
    """
    errors = []
    
    # Check required sections
    required_sections = ["ethical", "legal", "performance", "improvement"]
    for section in required_sections:
        if section not in config:
            errors.append(f"Missing required configuration section: {section}")
    
    # Validate ethical config
    if "ethical" in config:
        ethical_config = config["ethical"]
        if "bias_detection" in ethical_config:
            threshold = ethical_config["bias_detection"].get("demographic_parity_threshold")
            if threshold and (threshold < 0 or threshold > 1):
                errors.append("Bias detection threshold must be between 0 and 1")
    
    # Validate performance config
    if "performance" in config:
        perf_config = config["performance"]
        if "alert_thresholds" in perf_config:
            for metric, thresholds in perf_config["alert_thresholds"].items():
                if "warning" in thresholds and "critical" in thresholds:
                    if thresholds["warning"] <= thresholds["critical"]:
                        errors.append(f"Warning threshold must be higher than critical for {metric}")
    
    return len(errors) == 0, errors

