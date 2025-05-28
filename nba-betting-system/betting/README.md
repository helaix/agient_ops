# Value Bet Identification System

## Overview
Sophisticated betting logic that identifies value bets by comparing model predictions with bookmaker odds to maximize ROI while minimizing risk through advanced mathematical frameworks.

## Architecture

The system consists of five core components working together:

### 1. Value Bet Detection (`value_detector.py`)
- **Expected Value Calculations**: Compares model predictions with bookmaker odds
- **Edge Detection**: Identifies positive expected value opportunities
- **Quality Assessment**: Multi-factor confidence scoring
- **Staleness Filtering**: Removes outdated odds data

### 2. Kelly Criterion Implementation (`kelly_criterion.py`)
- **Optimal Bet Sizing**: Mathematical optimization for long-term growth
- **Risk-Adjusted Sizing**: Fractional Kelly for safety
- **Correlation Adjustments**: Reduces bet sizes for correlated positions
- **Portfolio Constraints**: Respects bankroll and risk limits

### 3. Risk Management (`risk_manager.py`)
- **Multi-Dimensional Risk Assessment**: Kelly, correlation, concentration, liquidity
- **Portfolio Limit Monitoring**: Daily risk, exposure, drawdown tracking
- **Correlation Analysis**: Identifies and manages related positions
- **Dynamic Risk Scoring**: Real-time risk evaluation

### 4. Portfolio Management (`portfolio_manager.py`)
- **Position Tracking**: Complete bet lifecycle management
- **Performance Analytics**: ROI, Sharpe ratio, drawdown analysis
- **Diversification Optimization**: Balanced exposure across games/teams
- **Automated Rebalancing**: Dynamic bankroll adjustments

### 5. Betting Engine (`betting_engine.py`)
- **Orchestration**: Coordinates all system components
- **Real-Time Processing**: End-to-end opportunity evaluation
- **Execution Management**: Automated bet placement and tracking
- **Monitoring & Reporting**: Comprehensive system status

## Key Features

### Mathematical Frameworks
- **Kelly Criterion**: Optimal bet sizing for maximum long-term growth
- **Expected Value**: Rigorous probability vs. odds comparison
- **Risk Assessment**: Multi-factor risk scoring and management
- **Correlation Analysis**: Portfolio diversification optimization

### Risk Management
- **Daily Risk Limits**: Configurable exposure controls
- **Concentration Limits**: Game and team exposure caps
- **Drawdown Protection**: Automatic risk reduction triggers
- **Position Correlation**: Intelligent diversification

### Real-Time Capabilities
- **Opportunity Detection**: Sub-minute value bet identification
- **Stale Data Filtering**: Automatic odds freshness validation
- **Dynamic Sizing**: Real-time Kelly fraction calculation
- **Portfolio Optimization**: Continuous position rebalancing

## Integration Points

### Input Interfaces
- **Feature Engineering**: Receives probability predictions via `ModelPrediction` objects
- **Data Collection**: Consumes real-time odds via `BookmakerOdds` objects
- **Game Information**: Processes NBA game data via `GameInfo` objects

### Output Interfaces
- **Deployment**: Provides betting recommendations via `ValueBet` objects
- **Evaluation**: Supplies performance metrics via `PerformanceMetrics` objects
- **Monitoring**: Exports portfolio state via `PortfolioState` objects

## Usage Examples

### Basic Value Bet Detection
```python
from betting import BettingEngine, BettingEngineConfig

# Initialize engine
config = BettingEngineConfig(
    initial_bankroll=10000.0,
    min_edge=0.05,
    min_confidence=0.7
)
engine = BettingEngine(config)

# Process opportunities
positions = engine.process_betting_opportunity(
    predictions, odds_data, game_info
)
```

### Real-Time Monitoring
```python
# Get opportunities without execution
opportunities = engine.get_real_time_opportunities(
    predictions, odds_data, game_info
)

for opp in opportunities:
    print(f"EV: {opp['expected_value']:.3f}")
    print(f"Stake: ${opp['recommended_stake']:.2f}")
```

### Portfolio Status
```python
status = engine.get_portfolio_status()
print(f"ROI: {status['performance']['roi']:.2f}%")
print(f"Active Positions: {status['portfolio_state']['active_positions']}")
```

## Configuration

### Environment Variables
```bash
# Betting Parameters
MIN_EDGE=0.05
MIN_CONFIDENCE=0.7
MAX_ODDS=3.0

# Kelly Criterion
MAX_KELLY_FRACTION=0.25
FRACTIONAL_KELLY=0.5

# Risk Management
MAX_DAILY_RISK=0.1
MAX_SINGLE_BET=0.05

# Portfolio
INITIAL_BANKROLL=10000.0
MAX_POSITIONS=20
```

### Risk Limits
- **Daily Risk**: 10% of bankroll maximum
- **Single Bet**: 5% of bankroll maximum
- **Game Exposure**: 15% of bankroll per game
- **Team Exposure**: 20% of bankroll per team
- **Drawdown Threshold**: 20% triggers review

## Performance Metrics

### Core Metrics
- **ROI**: Return on investment percentage
- **Win Rate**: Percentage of winning bets
- **Sharpe Ratio**: Risk-adjusted returns
- **Maximum Drawdown**: Peak-to-trough decline

### Advanced Analytics
- **Kelly Efficiency**: Actual vs. optimal bet sizing
- **Edge Realization**: Predicted vs. actual edge capture
- **Correlation Impact**: Portfolio diversification effectiveness
- **Risk-Adjusted Returns**: Performance per unit of risk

## Testing

Run the test suite:
```bash
python -m betting.tests
```

Run examples:
```bash
python -m betting.examples
```

## Dependencies

### Required Components
- **Feature Engineering**: Model predictions (HLX-1301)
- **Data Collection**: Real-time odds data (HLX-1300)

### Integration Requirements
- **Deployment**: Betting execution system
- **Evaluation**: Performance monitoring system

## Implementation Status

✅ **Completed Components**:
- Value bet detection algorithms
- Kelly Criterion implementation
- Risk assessment frameworks
- Portfolio management system
- Betting engine orchestration
- Configuration management
- Utility functions
- Example usage
- Test suite

🔄 **Ready for Integration**:
- Feature Engineering interface
- Data Collection interface
- Deployment system interface
- Real-time monitoring dashboard

## Next Steps

1. **Integration Testing**: Connect with Feature Engineering and Data Collection components
2. **Performance Validation**: Backtest on historical NBA playoff data
3. **Production Deployment**: Deploy to live betting environment
4. **Monitoring Setup**: Implement real-time performance tracking
5. **Optimization**: Fine-tune parameters based on live performance

---

**Focus**: Building sophisticated algorithms that identify profitable betting opportunities while managing risk effectively using proven mathematical frameworks.
