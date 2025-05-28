"""
Betting Odds Data Collector

Collects betting odds from multiple sportsbooks for NBA games.
Supports real-time odds tracking and historical odds data.
"""

import asyncio
import aiohttp
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import logging
import json

from ..architecture import DataCollector, DataRecord, DataSourceType, DataQuality


class BettingOddsCollector(DataCollector):
    """Collector for betting odds from multiple sportsbooks."""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(DataSourceType.BETTING_ODDS, config)
        self.api_key = config.get('api_key')
        self.base_url = config.get('base_url', 'https://api.the-odds-api.com/v4')
        self.session: Optional[aiohttp.ClientSession] = None
        self.supported_markets = ['h2h', 'spreads', 'totals']  # head-to-head, point spreads, over/under
        self.supported_bookmakers = config.get('bookmakers', [
            'draftkings', 'fanduel', 'betmgm', 'caesars', 'pointsbet'
        ])
        
    async def _ensure_session(self):
        """Ensure aiohttp session is available."""
        if self.session is None or self.session.closed:
            headers = {
                'User-Agent': 'NBA-Betting-System/1.0',
                'Accept': 'application/json'
            }
            timeout = aiohttp.ClientTimeout(total=self.config.get('timeout', 30))
            self.session = aiohttp.ClientSession(headers=headers, timeout=timeout)
    
    async def _make_request(self, endpoint: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Make request to odds API."""
        await self._ensure_session()
        
        # Add API key to params
        params['apiKey'] = self.api_key
        
        url = f"{self.base_url}/{endpoint}"
        
        try:
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return data
                elif response.status == 429:
                    # Rate limited
                    retry_after = int(response.headers.get('Retry-After', 60))
                    self.logger.warning(f"Rate limited, waiting {retry_after} seconds")
                    await asyncio.sleep(retry_after)
                    return await self._make_request(endpoint, params)
                else:
                    self.logger.error(f"Odds API request failed: {response.status} - {await response.text()}")
                    return {}
        except Exception as e:
            self.logger.error(f"Odds request failed: {e}")
            return {}
    
    async def collect_live_odds(self, sport: str = 'basketball_nba') -> List[DataRecord]:
        """Collect live betting odds for NBA games."""
        records = []
        
        for market in self.supported_markets:
            params = {
                'sport': sport,
                'regions': 'us',
                'markets': market,
                'oddsFormat': 'american',
                'bookmakers': ','.join(self.supported_bookmakers)
            }
            
            data = await self._make_request('sports/{}/odds'.format(sport), params)
            
            if isinstance(data, list):
                for game in data:
                    # Process each game's odds
                    game_id = game.get('id')
                    commence_time = datetime.fromisoformat(game.get('commence_time', '').replace('Z', '+00:00'))
                    
                    for bookmaker in game.get('bookmakers', []):
                        for market_data in bookmaker.get('markets', []):
                            if market_data.get('key') == market:
                                record = DataRecord(
                                    source_type=DataSourceType.BETTING_ODDS,
                                    timestamp=datetime.utcnow(),
                                    game_id=game_id,
                                    data={
                                        'game_info': {
                                            'home_team': game.get('home_team'),
                                            'away_team': game.get('away_team'),
                                            'commence_time': commence_time.isoformat(),
                                            'sport_title': game.get('sport_title')
                                        },
                                        'bookmaker': bookmaker.get('title'),
                                        'market': market,
                                        'outcomes': market_data.get('outcomes', []),
                                        'last_update': bookmaker.get('last_update'),
                                        'data_type': 'live_odds'
                                    },
                                    quality=DataQuality.HIGH
                                )
                                records.append(record)
        
        return records
    
    async def collect_historical_odds(self, sport: str = 'basketball_nba', 
                                    date_from: Optional[datetime] = None,
                                    date_to: Optional[datetime] = None) -> List[DataRecord]:
        """Collect historical betting odds for analysis."""
        records = []
        
        if date_from is None:
            date_from = datetime.utcnow() - timedelta(days=7)
        if date_to is None:
            date_to = datetime.utcnow()
        
        # Note: Historical odds typically require premium API access
        # This is a placeholder for the structure
        params = {
            'sport': sport,
            'regions': 'us',
            'markets': ','.join(self.supported_markets),
            'oddsFormat': 'american',
            'dateFormat': 'iso',
            'date': date_from.strftime('%Y-%m-%dT%H:%M:%SZ')
        }
        
        # For historical data, we would need to make multiple requests
        # for different dates or use a different endpoint
        self.logger.info(f"Historical odds collection requested from {date_from} to {date_to}")
        
        return records
    
    async def collect_line_movements(self, game_id: str) -> List[DataRecord]:
        """Collect line movement data for a specific game."""
        records = []
        
        # This would track how odds change over time for a specific game
        # Implementation depends on the specific odds API capabilities
        params = {
            'gameId': game_id,
            'markets': ','.join(self.supported_markets)
        }
        
        # Placeholder for line movement tracking
        self.logger.info(f"Line movement collection for game {game_id}")
        
        return records
    
    async def collect_market_analysis(self) -> List[DataRecord]:
        """Collect market analysis data including betting percentages and sharp money."""
        records = []
        
        # This would collect data about:
        # - Public betting percentages
        # - Sharp money indicators
        # - Line movement patterns
        # - Market efficiency metrics
        
        analysis_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'market_metrics': {
                'total_handle': None,  # Would be populated from API
                'sharp_indicators': [],
                'public_betting_percentages': {},
                'line_movement_velocity': {}
            },
            'data_type': 'market_analysis'
        }
        
        record = DataRecord(
            source_type=DataSourceType.BETTING_ODDS,
            timestamp=datetime.utcnow(),
            data=analysis_data,
            quality=DataQuality.MEDIUM
        )
        records.append(record)
        
        return records
    
    def _calculate_implied_probability(self, american_odds: int) -> float:
        """Calculate implied probability from American odds."""
        if american_odds > 0:
            return 100 / (american_odds + 100)
        else:
            return abs(american_odds) / (abs(american_odds) + 100)
    
    def _calculate_value_bet_indicator(self, odds_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate value betting indicators from odds data."""
        indicators = {
            'market_efficiency': None,
            'arbitrage_opportunities': [],
            'value_bets': [],
            'consensus_odds': {}
        }
        
        # Implementation would analyze odds across bookmakers
        # to identify value betting opportunities
        
        return indicators
    
    async def collect(self, **kwargs) -> List[DataRecord]:
        """Main collection method for betting odds data."""
        sport = kwargs.get('sport', 'basketball_nba')
        include_historical = kwargs.get('include_historical', False)
        
        all_records = []
        
        try:
            # Collect live odds
            live_odds = await self.collect_live_odds(sport)
            all_records.extend(live_odds)
            
            # Collect market analysis
            market_analysis = await self.collect_market_analysis()
            all_records.extend(market_analysis)
            
            # Optionally collect historical data
            if include_historical:
                historical_odds = await self.collect_historical_odds(sport)
                all_records.extend(historical_odds)
            
            # Add value betting indicators to each record
            for record in all_records:
                if 'outcomes' in record.data:
                    record.data['value_indicators'] = self._calculate_value_bet_indicator(record.data)
            
            self.logger.info(f"Collected {len(all_records)} betting odds records")
            
        except Exception as e:
            self.logger.error(f"Betting odds collection failed: {e}")
        
        finally:
            if self.session and not self.session.closed:
                await self.session.close()
        
        return all_records
    
    def validate_config(self) -> bool:
        """Validate betting odds collector configuration."""
        if not self.api_key:
            self.logger.error("API key is required for betting odds collection")
            return False
        
        if not self.supported_bookmakers:
            self.logger.error("At least one bookmaker must be configured")
            return False
        
        return True
    
    def get_health_status(self) -> Dict[str, Any]:
        """Get health status of betting odds API connection."""
        return {
            'status': 'healthy' if self.api_key else 'misconfigured',
            'api_key_configured': bool(self.api_key),
            'supported_bookmakers': len(self.supported_bookmakers),
            'supported_markets': len(self.supported_markets),
            'config_valid': self.validate_config()
        }

