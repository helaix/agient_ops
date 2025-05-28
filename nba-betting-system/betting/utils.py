"""
Utility functions for the Value Bet Identification System
"""

import logging
import json
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP


def setup_logging(log_level: str = "INFO", 
                 log_format: Optional[str] = None) -> logging.Logger:
    """
    Set up logging configuration for the betting system.
    
    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR)
        log_format: Custom log format string
        
    Returns:
        Configured logger
    """
    if log_format is None:
        log_format = (
            '%(asctime)s - %(name)s - %(levelname)s - '
            '%(funcName)s:%(lineno)d - %(message)s'
        )
    
    logging.basicConfig(
        level=getattr(logging, log_level.upper()),
        format=log_format,
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    logger = logging.getLogger('betting_system')
    return logger


def convert_american_to_decimal(american_odds: float) -> float:
    """
    Convert American odds to decimal format.
    
    Args:
        american_odds: American odds (e.g., +150, -200)
        
    Returns:
        Decimal odds
    """
    if american_odds > 0:
        return (american_odds / 100) + 1
    else:
        return (100 / abs(american_odds)) + 1


def convert_decimal_to_american(decimal_odds: float) -> float:
    """
    Convert decimal odds to American format.
    
    Args:
        decimal_odds: Decimal odds (e.g., 2.5)
        
    Returns:
        American odds
    """
    if decimal_odds >= 2.0:
        return (decimal_odds - 1) * 100
    else:
        return -100 / (decimal_odds - 1)


def calculate_implied_probability(decimal_odds: float) -> float:
    """
    Calculate implied probability from decimal odds.
    
    Args:
        decimal_odds: Decimal odds
        
    Returns:
        Implied probability (0-1)
    """
    return 1 / decimal_odds


def calculate_no_vig_probability(odds_list: List[float]) -> List[float]:
    """
    Calculate no-vig (true) probabilities from a set of odds.
    
    Args:
        odds_list: List of decimal odds for all outcomes
        
    Returns:
        List of no-vig probabilities
    """
    implied_probs = [calculate_implied_probability(odds) for odds in odds_list]
    total_implied = sum(implied_probs)
    
    # Remove vig by normalizing
    no_vig_probs = [prob / total_implied for prob in implied_probs]
    
    return no_vig_probs


def round_currency(amount: float, decimals: int = 2) -> float:
    """
    Round currency amounts to specified decimal places.
    
    Args:
        amount: Amount to round
        decimals: Number of decimal places
        
    Returns:
        Rounded amount
    """
    decimal_amount = Decimal(str(amount))
    rounded = decimal_amount.quantize(
        Decimal('0.' + '0' * decimals), 
        rounding=ROUND_HALF_UP
    )
    return float(rounded)


def format_percentage(value: float, decimals: int = 2) -> str:
    """
    Format a decimal value as a percentage string.
    
    Args:
        value: Decimal value (e.g., 0.15)
        decimals: Number of decimal places
        
    Returns:
        Formatted percentage string (e.g., "15.00%")
    """
    return f"{value * 100:.{decimals}f}%"


def format_odds(decimal_odds: float, format_type: str = "decimal") -> str:
    """
    Format odds for display.
    
    Args:
        decimal_odds: Decimal odds
        format_type: "decimal", "american", or "fractional"
        
    Returns:
        Formatted odds string
    """
    if format_type == "decimal":
        return f"{decimal_odds:.2f}"
    elif format_type == "american":
        american = convert_decimal_to_american(decimal_odds)
        return f"{american:+.0f}"
    elif format_type == "fractional":
        # Convert to fractional (simplified)
        if decimal_odds >= 2.0:
            numerator = decimal_odds - 1
            return f"{numerator:.1f}/1"
        else:
            denominator = 1 / (decimal_odds - 1)
            return f"1/{denominator:.1f}"
    else:
        raise ValueError(f"Unknown format type: {format_type}")


def calculate_roi(profit: float, investment: float) -> float:
    """
    Calculate return on investment.
    
    Args:
        profit: Net profit
        investment: Total investment
        
    Returns:
        ROI as decimal (0.15 = 15%)
    """
    if investment == 0:
        return 0.0
    return profit / investment


def calculate_compound_growth_rate(initial: float, 
                                 final: float, 
                                 periods: int) -> float:
    """
    Calculate compound annual growth rate.
    
    Args:
        initial: Initial value
        final: Final value
        periods: Number of periods
        
    Returns:
        Compound growth rate
    """
    if initial <= 0 or periods <= 0:
        return 0.0
    
    return (final / initial) ** (1 / periods) - 1


def validate_probability(probability: float) -> bool:
    """
    Validate that a probability is between 0 and 1.
    
    Args:
        probability: Probability value to validate
        
    Returns:
        True if valid, False otherwise
    """
    return 0 <= probability <= 1


def validate_odds(decimal_odds: float) -> bool:
    """
    Validate that decimal odds are greater than 1.
    
    Args:
        decimal_odds: Decimal odds to validate
        
    Returns:
        True if valid, False otherwise
    """
    return decimal_odds > 1.0


def safe_divide(numerator: float, denominator: float, default: float = 0.0) -> float:
    """
    Safely divide two numbers, returning default if denominator is zero.
    
    Args:
        numerator: Numerator
        denominator: Denominator
        default: Default value if division by zero
        
    Returns:
        Result of division or default value
    """
    if denominator == 0:
        return default
    return numerator / denominator


def serialize_datetime(dt: datetime) -> str:
    """
    Serialize datetime to ISO format string.
    
    Args:
        dt: Datetime object
        
    Returns:
        ISO format string
    """
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat()


def deserialize_datetime(dt_string: str) -> datetime:
    """
    Deserialize ISO format string to datetime.
    
    Args:
        dt_string: ISO format datetime string
        
    Returns:
        Datetime object
    """
    return datetime.fromisoformat(dt_string)


def calculate_correlation_matrix(data: List[List[float]]) -> List[List[float]]:
    """
    Calculate correlation matrix for a dataset.
    
    Args:
        data: List of data series
        
    Returns:
        Correlation matrix
    """
    import math
    
    n = len(data)
    if n == 0:
        return []
    
    correlation_matrix = [[0.0 for _ in range(n)] for _ in range(n)]
    
    for i in range(n):
        for j in range(n):
            if i == j:
                correlation_matrix[i][j] = 1.0
            else:
                # Calculate Pearson correlation coefficient
                x, y = data[i], data[j]
                
                if len(x) != len(y) or len(x) < 2:
                    correlation_matrix[i][j] = 0.0
                    continue
                
                mean_x = sum(x) / len(x)
                mean_y = sum(y) / len(y)
                
                numerator = sum((x[k] - mean_x) * (y[k] - mean_y) for k in range(len(x)))
                
                sum_sq_x = sum((x[k] - mean_x) ** 2 for k in range(len(x)))
                sum_sq_y = sum((y[k] - mean_y) ** 2 for k in range(len(y)))
                
                denominator = math.sqrt(sum_sq_x * sum_sq_y)
                
                if denominator == 0:
                    correlation_matrix[i][j] = 0.0
                else:
                    correlation_matrix[i][j] = numerator / denominator
    
    return correlation_matrix


def export_to_json(data: Any, filename: str, indent: int = 2) -> None:
    """
    Export data to JSON file.
    
    Args:
        data: Data to export
        filename: Output filename
        indent: JSON indentation
    """
    def json_serializer(obj):
        """Custom JSON serializer for datetime and other objects"""
        if isinstance(obj, datetime):
            return serialize_datetime(obj)
        elif hasattr(obj, '__dict__'):
            return obj.__dict__
        else:
            return str(obj)
    
    with open(filename, 'w') as f:
        json.dump(data, f, indent=indent, default=json_serializer)


def load_from_json(filename: str) -> Any:
    """
    Load data from JSON file.
    
    Args:
        filename: Input filename
        
    Returns:
        Loaded data
    """
    with open(filename, 'r') as f:
        return json.load(f)


class PerformanceTimer:
    """Context manager for timing code execution"""
    
    def __init__(self, name: str = "Operation"):
        self.name = name
        self.start_time = None
        self.end_time = None
        self.logger = logging.getLogger(__name__)
    
    def __enter__(self):
        self.start_time = datetime.now()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.end_time = datetime.now()
        duration = (self.end_time - self.start_time).total_seconds()
        self.logger.debug(f"{self.name} completed in {duration:.3f} seconds")
    
    @property
    def duration(self) -> Optional[float]:
        """Get duration in seconds"""
        if self.start_time and self.end_time:
            return (self.end_time - self.start_time).total_seconds()
        return None

