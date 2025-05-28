"""
Test suite for the Value Bet Identification System

Basic tests to validate core functionality of the betting system components.
"""

import unittest
from datetime import datetime, timedelta
from unittest.mock import Mock, patch

from .models import (
    GameInfo, ModelPrediction, BookmakerOdds, BetType, 
    ValueBet, PortfolioState, BetPosition, BetOutcome
)
from .value_detector import ValueBetDetector
from .kelly_criterion import KellyCriterion, KellyParameters
from .risk_manager import RiskManager, RiskLimits
from .portfolio_manager import PortfolioManager, PortfolioConfig
from .betting_engine import BettingEngine, BettingEngineConfig


class TestValueDetector(unittest.TestCase):
    """Test the ValueBetDetector class"""
    
    def setUp(self):
        self.detector = ValueBetDetector(
            min_edge=0.05,
            min_confidence=0.7,
            max_odds=3.0,
            min_odds=1.5
        )
    
    def test_expected_value_calculation(self):
        """Test expected value calculation"""
        # Test positive EV
        ev = self.detector.calculate_expected_value(0.6, 2.0)
        self.assertGreater(ev, 0)
        
        # Test negative EV
        ev = self.detector.calculate_expected_value(0.4, 2.0)
        self.assertLess(ev, 0)
        
        # Test edge case
        with self.assertRaises(ValueError):
            self.detector.calculate_expected_value(1.1, 2.0)
    
    def test_edge_calculation(self):
        """Test edge calculation"""
        edge = self.detector.calculate_edge(0.6, 0.5)
        self.assertEqual(edge, 0.1)
        
        edge = self.detector.calculate_edge(0.4, 0.5)
        self.assertEqual(edge, -0.1)
    
    def test_bet_quality_assessment(self):
        """Test bet quality assessment"""
        prediction = ModelPrediction(
            game_id="test_game",
            bet_type=BetType.MONEYLINE,
            line=None,
            predicted_probability=0.65,
            confidence=0.8,
            model_version="test",
            timestamp=datetime.now()
        )
        
        odds = BookmakerOdds(
            bookmaker="TestBook",
            bet_type=BetType.MONEYLINE,
            line=None,
            odds=-150,  # 1.67 decimal
            timestamp=datetime.now()
        )
        
        ev, edge, is_value = self.detector.assess_bet_quality(prediction, odds)
        
        self.assertIsInstance(ev, float)
        self.assertIsInstance(edge, float)
        self.assertIsInstance(is_value, bool)


class TestKellyCriterion(unittest.TestCase):
    """Test the KellyCriterion class"""
    
    def setUp(self):
        self.kelly = KellyCriterion(KellyParameters())
    
    def test_kelly_fraction_calculation(self):
        """Test Kelly fraction calculation"""
        # Test positive Kelly
        fraction = self.kelly.calculate_kelly_fraction(0.6, 2.0)
        self.assertGreater(fraction, 0)
        self.assertLessEqual(fraction, 0.25)  # Max Kelly limit
        
        # Test negative Kelly (should return 0)
        fraction = self.kelly.calculate_kelly_fraction(0.4, 2.0)
        self.assertEqual(fraction, 0)
    
    def test_stake_calculation(self):
        """Test stake amount calculation"""
        stake = self.kelly.calculate_stake_amount(0.1, 1000.0)
        self.assertEqual(stake, 100.0)
        
        # Test with correlation adjustment
        stake = self.kelly.calculate_stake_amount(0.1, 1000.0, 0.5)
        self.assertEqual(stake, 50.0)
    
    def test_growth_rate_calculation(self):
        """Test growth rate calculation"""
        growth_rate = self.kelly.calculate_growth_rate(0.6, 2.0, 0.1)
        self.assertIsInstance(growth_rate, float)


class TestRiskManager(unittest.TestCase):
    """Test the RiskManager class"""
    
    def setUp(self):
        self.risk_manager = RiskManager(RiskLimits())
        
        # Create sample portfolio
        self.portfolio = PortfolioState(
            total_bankroll=10000.0,
            available_balance=8000.0,
            active_positions=[],
            total_exposure=2000.0,
            daily_risk_used=500.0,
            max_daily_risk=1000.0
        )
    
    def test_portfolio_limits_check(self):
        """Test portfolio limits checking"""
        violations = self.risk_manager.check_portfolio_limits(self.portfolio)
        self.assertIsInstance(violations, list)
    
    def test_position_correlation(self):
        """Test position correlation calculation"""
        # Create two value bets
        game1 = GameInfo("game1", "Lakers", "Celtics", datetime.now(), "2023-24")
        game2 = GameInfo("game2", "Lakers", "Warriors", datetime.now(), "2023-24")
        
        bet1 = Mock()
        bet1.game_info = game1
        bet1.bet_type = BetType.MONEYLINE
        
        bet2 = Mock()
        bet2.game_info = game2
        bet2.bet_type = BetType.MONEYLINE
        
        correlation = self.risk_manager.calculate_position_correlation(bet1, bet2)
        self.assertGreaterEqual(correlation, 0)
        self.assertLessEqual(correlation, 1)
    
    def test_drawdown_monitoring(self):
        """Test drawdown monitoring"""
        drawdown, risk_level = self.risk_manager.monitor_drawdown(
            self.portfolio, 12000.0
        )
        
        self.assertGreaterEqual(drawdown, 0)
        self.assertLessEqual(drawdown, 1)


class TestPortfolioManager(unittest.TestCase):
    """Test the PortfolioManager class"""
    
    def setUp(self):
        config = PortfolioConfig(initial_bankroll=10000.0)
        self.portfolio_manager = PortfolioManager(config)
    
    def test_add_position(self):
        """Test adding a position to portfolio"""
        # Create a mock value bet
        value_bet = Mock()
        value_bet.game_info = GameInfo("test", "A", "B", datetime.now(), "2023-24")
        value_bet.bookmaker_odds = Mock()
        value_bet.bookmaker_odds.decimal_odds = 2.0
        
        position_id = self.portfolio_manager.add_position(value_bet, 100.0)
        
        self.assertIsInstance(position_id, str)
        self.assertEqual(len(self.portfolio_manager.portfolio_state.active_positions), 1)
        self.assertEqual(self.portfolio_manager.portfolio_state.available_balance, 9900.0)
    
    def test_settle_position(self):
        """Test settling a position"""
        # First add a position
        value_bet = Mock()
        value_bet.game_info = GameInfo("test", "A", "B", datetime.now(), "2023-24")
        value_bet.bookmaker_odds = Mock()
        value_bet.bookmaker_odds.decimal_odds = 2.0
        
        position_id = self.portfolio_manager.add_position(value_bet, 100.0)
        
        # Settle as win
        self.portfolio_manager.settle_position(position_id, BetOutcome.WIN, 200.0)
        
        self.assertEqual(len(self.portfolio_manager.portfolio_state.active_positions), 0)
        self.assertEqual(self.portfolio_manager.portfolio_state.total_bankroll, 10100.0)
    
    def test_performance_metrics(self):
        """Test performance metrics calculation"""
        metrics = self.portfolio_manager.calculate_performance_metrics()
        
        self.assertIsInstance(metrics.total_bets, int)
        self.assertIsInstance(metrics.roi, float)
        self.assertIsInstance(metrics.win_rate, float)


class TestBettingEngine(unittest.TestCase):
    """Test the BettingEngine class"""
    
    def setUp(self):
        config = BettingEngineConfig(initial_bankroll=10000.0)
        self.engine = BettingEngine(config)
    
    def test_engine_initialization(self):
        """Test betting engine initialization"""
        self.assertIsNotNone(self.engine.value_detector)
        self.assertIsNotNone(self.engine.kelly_criterion)
        self.assertIsNotNone(self.engine.risk_manager)
        self.assertIsNotNone(self.engine.portfolio_manager)
    
    def test_portfolio_status(self):
        """Test getting portfolio status"""
        status = self.engine.get_portfolio_status()
        
        self.assertIn('portfolio_state', status)
        self.assertIn('performance', status)
        self.assertIn('diversification', status)
        self.assertIn('risk_violations', status)
    
    def test_process_empty_opportunities(self):
        """Test processing with no opportunities"""
        positions = self.engine.process_betting_opportunity([], [], {})
        self.assertEqual(len(positions), 0)


class TestModels(unittest.TestCase):
    """Test the data models"""
    
    def test_bookmaker_odds_conversion(self):
        """Test odds conversion in BookmakerOdds"""
        odds = BookmakerOdds(
            bookmaker="Test",
            bet_type=BetType.MONEYLINE,
            line=None,
            odds=-150,
            timestamp=datetime.now()
        )
        
        # Test decimal odds conversion
        decimal = odds.decimal_odds
        self.assertAlmostEqual(decimal, 1.67, places=2)
        
        # Test implied probability
        prob = odds.implied_probability
        self.assertGreater(prob, 0)
        self.assertLess(prob, 1)
    
    def test_portfolio_state_properties(self):
        """Test PortfolioState calculated properties"""
        portfolio = PortfolioState(
            total_bankroll=10000.0,
            available_balance=8000.0,
            active_positions=[Mock(), Mock()],
            total_exposure=2000.0,
            daily_risk_used=500.0,
            max_daily_risk=1000.0
        )
        
        self.assertEqual(portfolio.position_count, 2)
        self.assertEqual(portfolio.utilization_rate, 0.2)


def run_tests():
    """Run all tests"""
    unittest.main(verbosity=2)


if __name__ == "__main__":
    run_tests()

