"""
Example usage of the Value Bet Identification System

This module demonstrates how to use the betting system components
with sample data and realistic scenarios.
"""

from datetime import datetime, timedelta
from typing import List, Dict

from .models import (
    GameInfo, ModelPrediction, BookmakerOdds, BetType
)
from .betting_engine import BettingEngine, BettingEngineConfig
from .utils import setup_logging


def create_sample_game_data() -> Dict[str, GameInfo]:
    """Create sample NBA playoff game data"""
    games = {}
    
    # Sample playoff games
    game_data = [
        ("game_001", "Lakers", "Celtics", "Conference Finals"),
        ("game_002", "Warriors", "Nuggets", "Conference Finals"),
        ("game_003", "Heat", "76ers", "Conference Semifinals"),
        ("game_004", "Suns", "Clippers", "Conference Semifinals"),
    ]
    
    for game_id, home, away, round_name in game_data:
        games[game_id] = GameInfo(
            game_id=game_id,
            home_team=home,
            away_team=away,
            game_time=datetime.now() + timedelta(hours=4),
            season="2023-24",
            playoff_round=round_name
        )
    
    return games


def create_sample_predictions() -> List[ModelPrediction]:
    """Create sample model predictions"""
    predictions = []
    
    # Sample predictions with varying confidence and probabilities
    prediction_data = [
        ("game_001", BetType.MONEYLINE, None, 0.65, 0.85),  # Lakers ML
        ("game_001", BetType.SPREAD, -3.5, 0.58, 0.75),     # Lakers -3.5
        ("game_001", BetType.TOTAL, 215.5, 0.52, 0.70),     # Over 215.5
        ("game_002", BetType.MONEYLINE, None, 0.72, 0.90),  # Warriors ML
        ("game_002", BetType.SPREAD, -7.0, 0.55, 0.80),     # Warriors -7.0
        ("game_003", BetType.MONEYLINE, None, 0.48, 0.65),  # Heat ML (underdog)
        ("game_004", BetType.TOTAL, 228.5, 0.61, 0.78),     # Over 228.5
    ]
    
    for game_id, bet_type, line, prob, confidence in prediction_data:
        predictions.append(ModelPrediction(
            game_id=game_id,
            bet_type=bet_type,
            line=line,
            predicted_probability=prob,
            confidence=confidence,
            model_version="v2.1.0",
            timestamp=datetime.now()
        ))
    
    return predictions


def create_sample_odds() -> List[BookmakerOdds]:
    """Create sample bookmaker odds"""
    odds_data = []
    
    # Sample odds from different bookmakers
    bookmaker_odds = [
        # Lakers vs Celtics
        ("DraftKings", "game_001", BetType.MONEYLINE, None, -150),
        ("FanDuel", "game_001", BetType.MONEYLINE, None, -145),
        ("BetMGM", "game_001", BetType.SPREAD, -3.5, -110),
        ("Caesars", "game_001", BetType.TOTAL, 215.5, -105),
        
        # Warriors vs Nuggets  
        ("DraftKings", "game_002", BetType.MONEYLINE, None, -280),
        ("FanDuel", "game_002", BetType.SPREAD, -7.0, -108),
        
        # Heat vs 76ers
        ("BetMGM", "game_003", BetType.MONEYLINE, None, +165),
        
        # Suns vs Clippers
        ("Caesars", "game_004", BetType.TOTAL, 228.5, -115),
    ]
    
    for bookmaker, game_id, bet_type, line, american_odds in bookmaker_odds:
        # Convert American odds to decimal
        if american_odds > 0:
            decimal_odds = (american_odds / 100) + 1
        else:
            decimal_odds = (100 / abs(american_odds)) + 1
        
        # Add game_id attribute to odds for matching
        odds = BookmakerOdds(
            bookmaker=bookmaker,
            bet_type=bet_type,
            line=line,
            odds=american_odds,
            timestamp=datetime.now()
        )
        # Manually add game_id for this example
        odds.game_id = game_id
        
        odds_data.append(odds)
    
    return odds_data


def example_basic_usage():
    """Example of basic betting engine usage"""
    print("=== Basic Value Bet Detection Example ===")
    
    # Set up logging
    logger = setup_logging("INFO")
    
    # Create betting engine with default configuration
    config = BettingEngineConfig(
        initial_bankroll=10000.0,
        min_edge=0.03,  # 3% minimum edge
        min_confidence=0.7
    )
    
    engine = BettingEngine(config)
    
    # Create sample data
    games = create_sample_game_data()
    predictions = create_sample_predictions()
    odds_data = create_sample_odds()
    
    print(f"Processing {len(predictions)} predictions with {len(odds_data)} odds")
    
    # Process betting opportunities
    executed_positions = engine.process_betting_opportunity(
        predictions, odds_data, games
    )
    
    print(f"\\nExecuted {len(executed_positions)} bets:")
    for position in executed_positions:
        bet = position.value_bet
        print(f"- {bet.game_info.home_team} vs {bet.game_info.away_team}")
        print(f"  {bet.bet_type.value} @ {bet.bookmaker_odds.decimal_odds:.2f}")
        print(f"  Stake: ${position.stake_amount:.2f}")
        print(f"  Expected Value: {bet.expected_value:.3f}")
        print(f"  Kelly Fraction: {bet.kelly_fraction:.3f}")
        print()
    
    # Get portfolio status
    status = engine.get_portfolio_status()
    print("Portfolio Status:")
    print(f"- Total Bankroll: ${status['portfolio_state']['total_bankroll']:.2f}")
    print(f"- Available Balance: ${status['portfolio_state']['available_balance']:.2f}")
    print(f"- Active Positions: {status['portfolio_state']['active_positions']}")
    print(f"- Utilization Rate: {status['portfolio_state']['utilization_rate']:.2%}")


def example_real_time_monitoring():
    """Example of real-time opportunity monitoring"""
    print("\\n=== Real-Time Opportunity Monitoring ===")
    
    # Create betting engine
    config = BettingEngineConfig(initial_bankroll=5000.0)
    engine = BettingEngine(config)
    
    # Create sample data
    games = create_sample_game_data()
    predictions = create_sample_predictions()
    odds_data = create_sample_odds()
    
    # Get real-time opportunities without executing
    opportunities = engine.get_real_time_opportunities(
        predictions, odds_data, games
    )
    
    print(f"Found {len(opportunities)} betting opportunities:")
    print()
    
    for i, opp in enumerate(opportunities, 1):
        print(f"{i}. {opp['game']} - {opp['bet_type']}")
        print(f"   Odds: {opp['odds']:.2f} ({opp['bookmaker']})")
        print(f"   Predicted Probability: {opp['predicted_probability']:.3f}")
        print(f"   Expected Value: {opp['expected_value']:.3f}")
        print(f"   Recommended Stake: ${opp['recommended_stake']:.2f}")
        print(f"   Risk Score: {opp['risk_score']:.3f}")
        print(f"   Action: {opp['recommended_action']}")
        print()


def example_risk_management():
    """Example demonstrating risk management features"""
    print("\\n=== Risk Management Example ===")
    
    # Create betting engine with conservative risk settings
    config = BettingEngineConfig(
        initial_bankroll=10000.0,
        max_daily_risk=0.05,  # 5% daily risk limit
        max_single_bet=0.02,  # 2% max single bet
        fractional_kelly=0.25  # Quarter Kelly for safety
    )
    
    engine = BettingEngine(config)
    
    # Simulate multiple betting sessions
    games = create_sample_game_data()
    
    for session in range(3):
        print(f"\\nSession {session + 1}:")
        
        predictions = create_sample_predictions()
        odds_data = create_sample_odds()
        
        # Process opportunities
        positions = engine.process_betting_opportunity(
            predictions, odds_data, games
        )
        
        print(f"Executed {len(positions)} bets")
        
        # Simulate some bet outcomes
        for i, position in enumerate(positions):
            # Simulate 60% win rate
            won = (i % 5) < 3
            
            if won:
                payout = position.stake_amount * position.value_bet.bookmaker_odds.decimal_odds
                engine.settle_bet(position.bet_id, True, payout)
            else:
                engine.settle_bet(position.bet_id, False, 0.0)
        
        # Check portfolio status
        status = engine.get_portfolio_status()
        portfolio = status['portfolio_state']
        performance = status['performance']
        
        print(f"Bankroll: ${portfolio['total_bankroll']:.2f}")
        print(f"ROI: {performance['roi']:.2f}%")
        print(f"Win Rate: {performance['win_rate']:.1f}%")
        
        if status['risk_violations']:
            print("Risk Violations:")
            for violation in status['risk_violations']:
                print(f"  - {violation}")


def example_portfolio_optimization():
    """Example of portfolio optimization"""
    print("\\n=== Portfolio Optimization Example ===")
    
    config = BettingEngineConfig(
        initial_bankroll=20000.0,
        max_positions=10
    )
    
    engine = BettingEngine(config)
    
    # Create larger set of opportunities
    games = create_sample_game_data()
    predictions = create_sample_predictions() * 2  # Duplicate for more opportunities
    odds_data = create_sample_odds() * 2
    
    print(f"Available opportunities: {len(predictions)}")
    
    # Get opportunities
    opportunities = engine.get_real_time_opportunities(
        predictions, odds_data, games
    )
    
    print(f"Value bets found: {len(opportunities)}")
    print("\\nTop 5 opportunities by expected value:")
    
    for i, opp in enumerate(opportunities[:5], 1):
        print(f"{i}. {opp['game']} - {opp['bet_type']}")
        print(f"   EV: {opp['expected_value']:.3f}, Stake: ${opp['recommended_stake']:.2f}")
    
    # Execute optimized portfolio
    positions = engine.process_betting_opportunity(
        predictions, odds_data, games
    )
    
    print(f"\\nExecuted {len(positions)} positions after optimization")
    
    # Show diversification
    status = engine.get_portfolio_status()
    diversification = status['diversification']
    
    print("\\nPortfolio Diversification:")
    print(f"- Total Positions: {diversification.get('total_positions', 0)}")
    print(f"- Unique Games: {diversification.get('unique_games', 0)}")
    print(f"- Unique Teams: {diversification.get('unique_teams', 0)}")
    print("- Bet Types:", diversification.get('bet_types', {}))


if __name__ == "__main__":
    # Run all examples
    example_basic_usage()
    example_real_time_monitoring()
    example_risk_management()
    example_portfolio_optimization()
    
    print("\\n=== Examples Complete ===")
    print("The Value Bet Identification System is ready for integration!")

