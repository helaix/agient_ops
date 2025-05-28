"""
Performance Monitoring Framework for AI-Driven NBA Playoff Betting System

This module implements comprehensive performance tracking, ROI analysis,
risk-adjusted metrics, and continuous improvement processes.
"""

import logging
import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
from collections import defaultdict, deque
import statistics
from abc import ABC, abstractmethod


class PerformanceMetricType(Enum):
    """Types of performance metrics"""
    ROI = "roi"
    SHARPE_RATIO = "sharpe_ratio"
    WIN_RATE = "win_rate"
    AVERAGE_ODDS = "average_odds"
    KELLY_CRITERION = "kelly_criterion"
    MAXIMUM_DRAWDOWN = "maximum_drawdown"
    PROFIT_FACTOR = "profit_factor"
    EXPECTED_VALUE = "expected_value"


class AlertSeverity(Enum):
    """Alert severity levels"""
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"
    EMERGENCY = "emergency"


class ModelPerformanceStatus(Enum):
    """Model performance status"""
    EXCELLENT = "excellent"
    GOOD = "good"
    ACCEPTABLE = "acceptable"
    POOR = "poor"
    CRITICAL = "critical"


@dataclass
class BettingResult:
    """Individual betting result record"""
    bet_id: str
    timestamp: datetime
    game_id: str
    bet_type: str
    stake: float
    odds: float
    predicted_probability: float
    actual_outcome: bool
    payout: float
    profit_loss: float
    model_confidence: float
    features_used: Dict[str, float]


@dataclass
class PerformanceMetric:
    """Performance metric calculation result"""
    metric_type: PerformanceMetricType
    value: float
    timestamp: datetime
    period: str
    confidence_interval: Optional[Tuple[float, float]]
    benchmark_comparison: Optional[float]
    metadata: Dict[str, Any]


@dataclass
class PerformanceAlert:
    """Performance monitoring alert"""
    alert_id: str
    timestamp: datetime
    severity: AlertSeverity
    metric_type: PerformanceMetricType
    current_value: float
    threshold_value: float
    description: str
    recommended_actions: List[str]
    affected_models: List[str]


class MetricCalculator(ABC):
    """Abstract base class for metric calculators"""
    
    @abstractmethod
    def calculate(self, results: List[BettingResult]) -> PerformanceMetric:
        """Calculate the metric from betting results"""
        pass
    
    @abstractmethod
    def get_benchmark(self) -> Optional[float]:
        """Get benchmark value for this metric"""
        pass


class ROICalculator(MetricCalculator):
    """Calculate Return on Investment (ROI)"""
    
    def calculate(self, results: List[BettingResult]) -> PerformanceMetric:
        """Calculate ROI from betting results"""
        if not results:
            return PerformanceMetric(
                metric_type=PerformanceMetricType.ROI,
                value=0.0,
                timestamp=datetime.now(),
                period="empty",
                confidence_interval=None,
                benchmark_comparison=None,
                metadata={'total_bets': 0, 'total_stake': 0.0}
            )
        
        total_stake = sum(result.stake for result in results)
        total_profit = sum(result.profit_loss for result in results)
        
        roi = (total_profit / total_stake * 100) if total_stake > 0 else 0.0
        
        # Calculate confidence interval using bootstrap
        confidence_interval = self._calculate_confidence_interval(results)
        
        return PerformanceMetric(
            metric_type=PerformanceMetricType.ROI,
            value=roi,
            timestamp=datetime.now(),
            period=f"{len(results)}_bets",
            confidence_interval=confidence_interval,
            benchmark_comparison=roi - self.get_benchmark() if self.get_benchmark() else None,
            metadata={
                'total_bets': len(results),
                'total_stake': total_stake,
                'total_profit': total_profit,
                'winning_bets': sum(1 for r in results if r.profit_loss > 0)
            }
        )
    
    def get_benchmark(self) -> Optional[float]:
        """Get ROI benchmark (industry standard)"""
        return 5.0  # 5% ROI benchmark
    
    def _calculate_confidence_interval(self, results: List[BettingResult], 
                                     confidence_level: float = 0.95) -> Tuple[float, float]:
        """Calculate confidence interval for ROI using bootstrap"""
        if len(results) < 10:
            return (0.0, 0.0)
        
        bootstrap_rois = []
        n_bootstrap = 1000
        
        for _ in range(n_bootstrap):
            # Bootstrap sample
            sample = np.random.choice(results, size=len(results), replace=True)
            total_stake = sum(r.stake for r in sample)
            total_profit = sum(r.profit_loss for r in sample)
            roi = (total_profit / total_stake * 100) if total_stake > 0 else 0.0
            bootstrap_rois.append(roi)
        
        alpha = 1 - confidence_level
        lower_percentile = (alpha / 2) * 100
        upper_percentile = (1 - alpha / 2) * 100
        
        return (
            np.percentile(bootstrap_rois, lower_percentile),
            np.percentile(bootstrap_rois, upper_percentile)
        )


class SharpeRatioCalculator(MetricCalculator):
    """Calculate Sharpe Ratio for risk-adjusted returns"""
    
    def __init__(self, risk_free_rate: float = 0.02):
        self.risk_free_rate = risk_free_rate  # Annual risk-free rate
    
    def calculate(self, results: List[BettingResult]) -> PerformanceMetric:
        """Calculate Sharpe ratio from betting results"""
        if len(results) < 2:
            return PerformanceMetric(
                metric_type=PerformanceMetricType.SHARPE_RATIO,
                value=0.0,
                timestamp=datetime.now(),
                period="insufficient_data",
                confidence_interval=None,
                benchmark_comparison=None,
                metadata={'total_bets': len(results)}
            )
        
        # Calculate daily returns
        daily_returns = self._calculate_daily_returns(results)
        
        if len(daily_returns) < 2:
            return PerformanceMetric(
                metric_type=PerformanceMetricType.SHARPE_RATIO,
                value=0.0,
                timestamp=datetime.now(),
                period="insufficient_days",
                confidence_interval=None,
                benchmark_comparison=None,
                metadata={'trading_days': len(daily_returns)}
            )
        
        # Calculate excess returns
        daily_risk_free_rate = self.risk_free_rate / 365
        excess_returns = [r - daily_risk_free_rate for r in daily_returns]
        
        # Calculate Sharpe ratio
        mean_excess_return = statistics.mean(excess_returns)
        std_excess_return = statistics.stdev(excess_returns)
        
        sharpe_ratio = (mean_excess_return / std_excess_return) if std_excess_return > 0 else 0.0
        
        # Annualize the Sharpe ratio
        annualized_sharpe = sharpe_ratio * np.sqrt(365)
        
        return PerformanceMetric(
            metric_type=PerformanceMetricType.SHARPE_RATIO,
            value=annualized_sharpe,
            timestamp=datetime.now(),
            period=f"{len(daily_returns)}_days",
            confidence_interval=None,
            benchmark_comparison=annualized_sharpe - self.get_benchmark() if self.get_benchmark() else None,
            metadata={
                'trading_days': len(daily_returns),
                'mean_daily_return': mean_excess_return,
                'volatility': std_excess_return,
                'risk_free_rate': self.risk_free_rate
            }
        )
    
    def get_benchmark(self) -> Optional[float]:
        """Get Sharpe ratio benchmark"""
        return 1.0  # Sharpe ratio of 1.0 is considered good
    
    def _calculate_daily_returns(self, results: List[BettingResult]) -> List[float]:
        """Calculate daily returns from betting results"""
        # Group results by date
        daily_pnl = defaultdict(float)
        daily_stake = defaultdict(float)
        
        for result in results:
            date = result.timestamp.date()
            daily_pnl[date] += result.profit_loss
            daily_stake[date] += result.stake
        
        # Calculate daily returns
        daily_returns = []
        for date in sorted(daily_pnl.keys()):
            if daily_stake[date] > 0:
                daily_return = daily_pnl[date] / daily_stake[date]
                daily_returns.append(daily_return)
        
        return daily_returns


class WinRateCalculator(MetricCalculator):
    """Calculate win rate percentage"""
    
    def calculate(self, results: List[BettingResult]) -> PerformanceMetric:
        """Calculate win rate from betting results"""
        if not results:
            return PerformanceMetric(
                metric_type=PerformanceMetricType.WIN_RATE,
                value=0.0,
                timestamp=datetime.now(),
                period="empty",
                confidence_interval=None,
                benchmark_comparison=None,
                metadata={'total_bets': 0}
            )
        
        winning_bets = sum(1 for result in results if result.actual_outcome)
        win_rate = (winning_bets / len(results)) * 100
        
        # Calculate confidence interval for win rate
        confidence_interval = self._calculate_binomial_confidence_interval(
            winning_bets, len(results)
        )
        
        return PerformanceMetric(
            metric_type=PerformanceMetricType.WIN_RATE,
            value=win_rate,
            timestamp=datetime.now(),
            period=f"{len(results)}_bets",
            confidence_interval=confidence_interval,
            benchmark_comparison=win_rate - self.get_benchmark() if self.get_benchmark() else None,
            metadata={
                'total_bets': len(results),
                'winning_bets': winning_bets,
                'losing_bets': len(results) - winning_bets
            }
        )
    
    def get_benchmark(self) -> Optional[float]:
        """Get win rate benchmark"""
        return 52.4  # Break-even win rate for typical odds
    
    def _calculate_binomial_confidence_interval(self, successes: int, trials: int,
                                              confidence_level: float = 0.95) -> Tuple[float, float]:
        """Calculate confidence interval for binomial proportion"""
        if trials == 0:
            return (0.0, 0.0)
        
        p = successes / trials
        z = 1.96  # 95% confidence level
        
        margin_of_error = z * np.sqrt((p * (1 - p)) / trials)
        
        lower = max(0, (p - margin_of_error) * 100)
        upper = min(100, (p + margin_of_error) * 100)
        
        return (lower, upper)


class MaximumDrawdownCalculator(MetricCalculator):
    """Calculate maximum drawdown"""
    
    def calculate(self, results: List[BettingResult]) -> PerformanceMetric:
        """Calculate maximum drawdown from betting results"""
        if not results:
            return PerformanceMetric(
                metric_type=PerformanceMetricType.MAXIMUM_DRAWDOWN,
                value=0.0,
                timestamp=datetime.now(),
                period="empty",
                confidence_interval=None,
                benchmark_comparison=None,
                metadata={'total_bets': 0}
            )
        
        # Calculate cumulative P&L
        cumulative_pnl = []
        running_total = 0.0
        
        for result in sorted(results, key=lambda x: x.timestamp):
            running_total += result.profit_loss
            cumulative_pnl.append(running_total)
        
        # Calculate maximum drawdown
        peak = cumulative_pnl[0]
        max_drawdown = 0.0
        drawdown_start = 0
        drawdown_end = 0
        
        for i, value in enumerate(cumulative_pnl):
            if value > peak:
                peak = value
            
            drawdown = peak - value
            if drawdown > max_drawdown:
                max_drawdown = drawdown
                drawdown_end = i
                # Find the start of this drawdown
                for j in range(i, -1, -1):
                    if cumulative_pnl[j] == peak:
                        drawdown_start = j
                        break
        
        return PerformanceMetric(
            metric_type=PerformanceMetricType.MAXIMUM_DRAWDOWN,
            value=max_drawdown,
            timestamp=datetime.now(),
            period=f"{len(results)}_bets",
            confidence_interval=None,
            benchmark_comparison=None,
            metadata={
                'total_bets': len(results),
                'drawdown_start_index': drawdown_start,
                'drawdown_end_index': drawdown_end,
                'peak_value': peak,
                'final_value': cumulative_pnl[-1] if cumulative_pnl else 0.0
            }
        )
    
    def get_benchmark(self) -> Optional[float]:
        """Get maximum drawdown benchmark"""
        return None  # No standard benchmark for maximum drawdown


class ModelPerformanceTracker:
    """Tracks performance of individual models"""
    
    def __init__(self, model_id: str):
        self.model_id = model_id
        self.results_history = deque(maxlen=10000)  # Keep last 10k results
        self.performance_history = []
        self.calculators = {
            PerformanceMetricType.ROI: ROICalculator(),
            PerformanceMetricType.SHARPE_RATIO: SharpeRatioCalculator(),
            PerformanceMetricType.WIN_RATE: WinRateCalculator(),
            PerformanceMetricType.MAXIMUM_DRAWDOWN: MaximumDrawdownCalculator()
        }
    
    def add_result(self, result: BettingResult) -> None:
        """Add a new betting result"""
        self.results_history.append(result)
    
    def calculate_metrics(self, period_days: Optional[int] = None) -> Dict[PerformanceMetricType, PerformanceMetric]:
        """Calculate all performance metrics"""
        # Filter results by period if specified
        if period_days:
            cutoff_date = datetime.now() - timedelta(days=period_days)
            filtered_results = [r for r in self.results_history if r.timestamp >= cutoff_date]
        else:
            filtered_results = list(self.results_history)
        
        metrics = {}
        for metric_type, calculator in self.calculators.items():
            metrics[metric_type] = calculator.calculate(filtered_results)
        
        return metrics
    
    def get_performance_trend(self, metric_type: PerformanceMetricType,
                            window_size: int = 100) -> List[float]:
        """Get performance trend for a specific metric"""
        if len(self.results_history) < window_size:
            return []
        
        calculator = self.calculators.get(metric_type)
        if not calculator:
            return []
        
        trend_values = []
        results_list = list(self.results_history)
        
        for i in range(window_size, len(results_list) + 1):
            window_results = results_list[i - window_size:i]
            metric = calculator.calculate(window_results)
            trend_values.append(metric.value)
        
        return trend_values
    
    def detect_performance_degradation(self, metric_type: PerformanceMetricType,
                                     lookback_periods: int = 5) -> bool:
        """Detect if performance is degrading"""
        trend = self.get_performance_trend(metric_type)
        
        if len(trend) < lookback_periods * 2:
            return False
        
        recent_avg = statistics.mean(trend[-lookback_periods:])
        historical_avg = statistics.mean(trend[-lookback_periods * 2:-lookback_periods])
        
        # Define degradation thresholds by metric type
        degradation_thresholds = {
            PerformanceMetricType.ROI: -2.0,  # 2% drop in ROI
            PerformanceMetricType.WIN_RATE: -5.0,  # 5% drop in win rate
            PerformanceMetricType.SHARPE_RATIO: -0.5  # 0.5 drop in Sharpe ratio
        }
        
        threshold = degradation_thresholds.get(metric_type, -1.0)
        return (recent_avg - historical_avg) < threshold


class PerformanceMonitoringFramework:
    """Main performance monitoring framework"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.model_trackers = {}
        self.alerts = []
        self.alert_thresholds = config.get('alert_thresholds', {
            PerformanceMetricType.ROI: {'warning': -5.0, 'critical': -10.0},
            PerformanceMetricType.WIN_RATE: {'warning': 45.0, 'critical': 40.0},
            PerformanceMetricType.SHARPE_RATIO: {'warning': 0.5, 'critical': 0.0}
        })
        self.logger = logging.getLogger(__name__)
    
    def register_model(self, model_id: str) -> None:
        """Register a new model for tracking"""
        if model_id not in self.model_trackers:
            self.model_trackers[model_id] = ModelPerformanceTracker(model_id)
            self.logger.info(f"Registered model for tracking: {model_id}")
    
    def record_betting_result(self, model_id: str, result: BettingResult) -> None:
        """Record a betting result for a specific model"""
        if model_id not in self.model_trackers:
            self.register_model(model_id)
        
        self.model_trackers[model_id].add_result(result)
        
        # Check for alerts
        self._check_performance_alerts(model_id)
    
    def get_model_performance(self, model_id: str, 
                            period_days: Optional[int] = None) -> Dict[str, Any]:
        """Get comprehensive performance report for a model"""
        if model_id not in self.model_trackers:
            return {'error': f'Model {model_id} not found'}
        
        tracker = self.model_trackers[model_id]
        metrics = tracker.calculate_metrics(period_days)
        
        # Calculate performance status
        status = self._determine_performance_status(metrics)
        
        # Get trends
        trends = {}
        for metric_type in [PerformanceMetricType.ROI, PerformanceMetricType.WIN_RATE]:
            trends[metric_type.value] = tracker.get_performance_trend(metric_type)
        
        return {
            'model_id': model_id,
            'performance_status': status.value,
            'metrics': {k.value: asdict(v) for k, v in metrics.items()},
            'trends': trends,
            'total_bets': len(tracker.results_history),
            'last_updated': datetime.now().isoformat()
        }
    
    def get_portfolio_performance(self, period_days: Optional[int] = None) -> Dict[str, Any]:
        """Get aggregated performance across all models"""
        if not self.model_trackers:
            return {'error': 'No models registered'}
        
        # Aggregate all results
        all_results = []
        for tracker in self.model_trackers.values():
            if period_days:
                cutoff_date = datetime.now() - timedelta(days=period_days)
                filtered_results = [r for r in tracker.results_history if r.timestamp >= cutoff_date]
            else:
                filtered_results = list(tracker.results_history)
            all_results.extend(filtered_results)
        
        if not all_results:
            return {'error': 'No betting results found'}
        
        # Calculate portfolio metrics
        calculators = {
            PerformanceMetricType.ROI: ROICalculator(),
            PerformanceMetricType.SHARPE_RATIO: SharpeRatioCalculator(),
            PerformanceMetricType.WIN_RATE: WinRateCalculator(),
            PerformanceMetricType.MAXIMUM_DRAWDOWN: MaximumDrawdownCalculator()
        }
        
        portfolio_metrics = {}
        for metric_type, calculator in calculators.items():
            portfolio_metrics[metric_type.value] = asdict(calculator.calculate(all_results))
        
        # Model breakdown
        model_breakdown = {}
        for model_id in self.model_trackers.keys():
            model_performance = self.get_model_performance(model_id, period_days)
            if 'error' not in model_performance:
                model_breakdown[model_id] = {
                    'status': model_performance['performance_status'],
                    'roi': model_performance['metrics'].get('roi', {}).get('value', 0.0),
                    'win_rate': model_performance['metrics'].get('win_rate', {}).get('value', 0.0),
                    'total_bets': model_performance['total_bets']
                }
        
        return {
            'portfolio_metrics': portfolio_metrics,
            'model_breakdown': model_breakdown,
            'total_models': len(self.model_trackers),
            'total_bets': len(all_results),
            'active_alerts': len([a for a in self.alerts if a.severity in [AlertSeverity.WARNING, AlertSeverity.CRITICAL]]),
            'report_timestamp': datetime.now().isoformat()
        }
    
    def _check_performance_alerts(self, model_id: str) -> None:
        """Check for performance alerts for a specific model"""
        tracker = self.model_trackers[model_id]
        
        # Calculate recent metrics (last 100 bets or 7 days)
        recent_metrics = tracker.calculate_metrics(period_days=7)
        
        for metric_type, metric in recent_metrics.items():
            thresholds = self.alert_thresholds.get(metric_type, {})
            
            # Check for critical alerts
            if 'critical' in thresholds and metric.value <= thresholds['critical']:
                alert = PerformanceAlert(
                    alert_id=f"alert_{model_id}_{metric_type.value}_{datetime.now().timestamp()}",
                    timestamp=datetime.now(),
                    severity=AlertSeverity.CRITICAL,
                    metric_type=metric_type,
                    current_value=metric.value,
                    threshold_value=thresholds['critical'],
                    description=f"Critical performance degradation in {metric_type.value} for model {model_id}",
                    recommended_actions=[
                        "Immediately review model performance",
                        "Consider suspending model predictions",
                        "Investigate potential data or model issues"
                    ],
                    affected_models=[model_id]
                )
                self.alerts.append(alert)
                self.logger.critical(f"Critical performance alert for model {model_id}: {metric_type.value} = {metric.value}")
            
            # Check for warning alerts
            elif 'warning' in thresholds and metric.value <= thresholds['warning']:
                alert = PerformanceAlert(
                    alert_id=f"alert_{model_id}_{metric_type.value}_{datetime.now().timestamp()}",
                    timestamp=datetime.now(),
                    severity=AlertSeverity.WARNING,
                    metric_type=metric_type,
                    current_value=metric.value,
                    threshold_value=thresholds['warning'],
                    description=f"Performance warning for {metric_type.value} in model {model_id}",
                    recommended_actions=[
                        "Monitor model performance closely",
                        "Review recent predictions and outcomes",
                        "Consider model retraining if trend continues"
                    ],
                    affected_models=[model_id]
                )
                self.alerts.append(alert)
                self.logger.warning(f"Performance warning for model {model_id}: {metric_type.value} = {metric.value}")
    
    def _determine_performance_status(self, metrics: Dict[PerformanceMetricType, PerformanceMetric]) -> ModelPerformanceStatus:
        """Determine overall performance status based on metrics"""
        roi_metric = metrics.get(PerformanceMetricType.ROI)
        win_rate_metric = metrics.get(PerformanceMetricType.WIN_RATE)
        sharpe_metric = metrics.get(PerformanceMetricType.SHARPE_RATIO)
        
        # Score based on individual metrics
        score = 0
        
        if roi_metric:
            if roi_metric.value >= 10.0:
                score += 2
            elif roi_metric.value >= 5.0:
                score += 1
            elif roi_metric.value >= 0.0:
                score += 0
            else:
                score -= 1
        
        if win_rate_metric:
            if win_rate_metric.value >= 60.0:
                score += 2
            elif win_rate_metric.value >= 55.0:
                score += 1
            elif win_rate_metric.value >= 50.0:
                score += 0
            else:
                score -= 1
        
        if sharpe_metric:
            if sharpe_metric.value >= 2.0:
                score += 2
            elif sharpe_metric.value >= 1.0:
                score += 1
            elif sharpe_metric.value >= 0.5:
                score += 0
            else:
                score -= 1
        
        # Determine status based on score
        if score >= 4:
            return ModelPerformanceStatus.EXCELLENT
        elif score >= 2:
            return ModelPerformanceStatus.GOOD
        elif score >= 0:
            return ModelPerformanceStatus.ACCEPTABLE
        elif score >= -2:
            return ModelPerformanceStatus.POOR
        else:
            return ModelPerformanceStatus.CRITICAL
    
    def generate_performance_report(self, period_days: int = 30) -> Dict[str, Any]:
        """Generate comprehensive performance report"""
        portfolio_performance = self.get_portfolio_performance(period_days)
        
        # Recent alerts
        recent_alerts = [
            asdict(alert) for alert in self.alerts
            if alert.timestamp > datetime.now() - timedelta(days=period_days)
        ]
        
        # Performance summary
        summary = {
            'report_period_days': period_days,
            'total_models': len(self.model_trackers),
            'portfolio_performance': portfolio_performance,
            'recent_alerts': recent_alerts,
            'alert_summary': {
                'total': len(recent_alerts),
                'critical': len([a for a in recent_alerts if a['severity'] == AlertSeverity.CRITICAL.value]),
                'warning': len([a for a in recent_alerts if a['severity'] == AlertSeverity.WARNING.value])
            },
            'recommendations': self._generate_performance_recommendations(portfolio_performance, recent_alerts),
            'generated_at': datetime.now().isoformat()
        }
        
        return summary
    
    def _generate_performance_recommendations(self, portfolio_performance: Dict[str, Any],
                                           recent_alerts: List[Dict[str, Any]]) -> List[str]:
        """Generate performance improvement recommendations"""
        recommendations = []
        
        # Check portfolio ROI
        portfolio_roi = portfolio_performance.get('portfolio_metrics', {}).get('roi', {}).get('value', 0.0)
        if portfolio_roi < 0:
            recommendations.append("Portfolio showing negative ROI - review betting strategy and model performance")
        elif portfolio_roi < 5.0:
            recommendations.append("Portfolio ROI below target - consider model optimization or strategy adjustment")
        
        # Check for critical alerts
        critical_alerts = [a for a in recent_alerts if a['severity'] == 'critical']
        if critical_alerts:
            recommendations.append(f"Address {len(critical_alerts)} critical performance alerts immediately")
        
        # Check model diversity
        model_breakdown = portfolio_performance.get('model_breakdown', {})
        if len(model_breakdown) < 3:
            recommendations.append("Consider diversifying with additional models to reduce risk")
        
        # Check for underperforming models
        poor_models = [model_id for model_id, data in model_breakdown.items() 
                      if data.get('status') in ['poor', 'critical']]
        if poor_models:
            recommendations.append(f"Review and potentially retrain underperforming models: {', '.join(poor_models)}")
        
        return recommendations

