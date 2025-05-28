"""
NBA API Data Collector

Collects official NBA statistics, game data, player performance metrics,
and team analytics from the NBA.com API using the nba_api package.
"""

import asyncio
import aiohttp
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import logging
from dataclasses import asdict

from ..architecture import DataCollector, DataRecord, DataSourceType, DataQuality


class NBACollector(DataCollector):
    """Collector for NBA official statistics and game data."""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(DataSourceType.NBA_API, config)
        self.base_url = "https://stats.nba.com/stats"
        self.session: Optional[aiohttp.ClientSession] = None
        self.rate_limiter = self._create_rate_limiter()
        
    def _create_rate_limiter(self):
        """Create rate limiter based on NBA API limits."""
        return {
            'requests_per_minute': self.config.get('rate_limit', 60),
            'last_request_time': None,
            'request_count': 0,
            'window_start': datetime.utcnow()
        }
    
    async def _ensure_session(self):
        """Ensure aiohttp session is available."""
        if self.session is None or self.session.closed:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.nba.com/',
                'Origin': 'https://www.nba.com'
            }
            timeout = aiohttp.ClientTimeout(total=self.config.get('timeout', 30))
            self.session = aiohttp.ClientSession(headers=headers, timeout=timeout)
    
    async def _rate_limit_check(self):
        """Check and enforce rate limiting."""
        now = datetime.utcnow()
        window_duration = timedelta(minutes=1)
        
        # Reset window if needed
        if now - self.rate_limiter['window_start'] > window_duration:
            self.rate_limiter['request_count'] = 0
            self.rate_limiter['window_start'] = now
        
        # Check if we're at the limit
        if self.rate_limiter['request_count'] >= self.rate_limiter['requests_per_minute']:
            sleep_time = 60 - (now - self.rate_limiter['window_start']).seconds
            if sleep_time > 0:
                self.logger.info(f"Rate limit reached, sleeping for {sleep_time} seconds")
                await asyncio.sleep(sleep_time)
                self.rate_limiter['request_count'] = 0
                self.rate_limiter['window_start'] = datetime.utcnow()
        
        self.rate_limiter['request_count'] += 1
        self.rate_limiter['last_request_time'] = now
    
    async def _make_request(self, endpoint: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Make rate-limited request to NBA API."""
        await self._ensure_session()
        await self._rate_limit_check()
        
        url = f"{self.base_url}/{endpoint}"
        
        try:
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return data
                elif response.status == 429:
                    # Rate limited, wait and retry
                    retry_after = int(response.headers.get('Retry-After', 60))
                    self.logger.warning(f"Rate limited, waiting {retry_after} seconds")
                    await asyncio.sleep(retry_after)
                    return await self._make_request(endpoint, params)
                else:
                    self.logger.error(f"API request failed: {response.status} - {await response.text()}")
                    return {}
        except Exception as e:
            self.logger.error(f"Request failed: {e}")
            return {}
    
    async def collect_game_data(self, season: str = "2023-24", season_type: str = "Playoffs") -> List[DataRecord]:
        """Collect game data for specified season and type."""
        records = []
        
        # Get scoreboard data
        params = {
            'LeagueID': '00',
            'Season': season,
            'SeasonType': season_type,
            'GameDate': datetime.now().strftime('%m/%d/%Y')
        }
        
        data = await self._make_request('scoreboardV2', params)
        
        if 'resultSets' in data:
            for result_set in data['resultSets']:
                if result_set['name'] == 'GameHeader':
                    headers = result_set['headers']
                    for row in result_set['rowSet']:
                        game_data = dict(zip(headers, row))
                        
                        record = DataRecord(
                            source_type=DataSourceType.NBA_API,
                            timestamp=datetime.utcnow(),
                            game_id=str(game_data.get('GAME_ID', '')),
                            data={
                                'game_header': game_data,
                                'data_type': 'game_data',
                                'season': season,
                                'season_type': season_type
                            },
                            quality=DataQuality.HIGH
                        )
                        records.append(record)
        
        return records
    
    async def collect_player_stats(self, season: str = "2023-24", season_type: str = "Playoffs") -> List[DataRecord]:
        """Collect player statistics for specified season."""
        records = []
        
        params = {
            'LeagueID': '00',
            'Season': season,
            'SeasonType': season_type,
            'PerMode': 'PerGame'
        }
        
        data = await self._make_request('leaguedashplayerstats', params)
        
        if 'resultSets' in data and len(data['resultSets']) > 0:
            result_set = data['resultSets'][0]
            headers = result_set['headers']
            
            for row in result_set['rowSet']:
                player_data = dict(zip(headers, row))
                
                record = DataRecord(
                    source_type=DataSourceType.NBA_API,
                    timestamp=datetime.utcnow(),
                    player_id=str(player_data.get('PLAYER_ID', '')),
                    team_id=str(player_data.get('TEAM_ID', '')),
                    data={
                        'player_stats': player_data,
                        'data_type': 'player_stats',
                        'season': season,
                        'season_type': season_type
                    },
                    quality=DataQuality.HIGH
                )
                records.append(record)
        
        return records
    
    async def collect_team_stats(self, season: str = "2023-24", season_type: str = "Playoffs") -> List[DataRecord]:
        """Collect team statistics for specified season."""
        records = []
        
        params = {
            'LeagueID': '00',
            'Season': season,
            'SeasonType': season_type,
            'PerMode': 'PerGame'
        }
        
        data = await self._make_request('leaguedashteamstats', params)
        
        if 'resultSets' in data and len(data['resultSets']) > 0:
            result_set = data['resultSets'][0]
            headers = result_set['headers']
            
            for row in result_set['rowSet']:
                team_data = dict(zip(headers, row))
                
                record = DataRecord(
                    source_type=DataSourceType.NBA_API,
                    timestamp=datetime.utcnow(),
                    team_id=str(team_data.get('TEAM_ID', '')),
                    data={
                        'team_stats': team_data,
                        'data_type': 'team_stats',
                        'season': season,
                        'season_type': season_type
                    },
                    quality=DataQuality.HIGH
                )
                records.append(record)
        
        return records
    
    async def collect_playoff_specific_data(self, season: str = "2023-24") -> List[DataRecord]:
        """Collect playoff-specific data including series standings and matchups."""
        records = []
        
        # Playoff series data
        params = {
            'LeagueID': '00',
            'Season': season,
            'SeasonType': 'Playoffs'
        }
        
        data = await self._make_request('playoffpicture', params)
        
        if 'resultSets' in data:
            for result_set in data['resultSets']:
                headers = result_set['headers']
                for row in result_set['rowSet']:
                    playoff_data = dict(zip(headers, row))
                    
                    record = DataRecord(
                        source_type=DataSourceType.NBA_API,
                        timestamp=datetime.utcnow(),
                        data={
                            'playoff_data': playoff_data,
                            'data_type': 'playoff_series',
                            'season': season,
                            'result_set_name': result_set['name']
                        },
                        quality=DataQuality.HIGH
                    )
                    records.append(record)
        
        return records
    
    async def collect(self, **kwargs) -> List[DataRecord]:
        """Main collection method that gathers all NBA data."""
        season = kwargs.get('season', '2023-24')
        season_type = kwargs.get('season_type', 'Playoffs')
        
        all_records = []
        
        try:
            # Collect different types of data
            tasks = [
                self.collect_game_data(season, season_type),
                self.collect_player_stats(season, season_type),
                self.collect_team_stats(season, season_type)
            ]
            
            if season_type == 'Playoffs':
                tasks.append(self.collect_playoff_specific_data(season))
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for result in results:
                if isinstance(result, Exception):
                    self.logger.error(f"Collection task failed: {result}")
                else:
                    all_records.extend(result)
            
            self.logger.info(f"Collected {len(all_records)} NBA records")
            
        except Exception as e:
            self.logger.error(f"NBA collection failed: {e}")
        
        finally:
            if self.session and not self.session.closed:
                await self.session.close()
        
        return all_records
    
    def validate_config(self) -> bool:
        """Validate NBA collector configuration."""
        required_fields = ['rate_limit', 'timeout']
        for field in required_fields:
            if field not in self.config:
                self.logger.error(f"Missing required config field: {field}")
                return False
        
        if self.config['rate_limit'] > 60:
            self.logger.warning("Rate limit exceeds NBA API recommendations")
        
        return True
    
    def get_health_status(self) -> Dict[str, Any]:
        """Get health status of NBA API connection."""
        return {
            'status': 'healthy' if self.session is None or not self.session.closed else 'disconnected',
            'last_request': self.rate_limiter.get('last_request_time'),
            'requests_in_window': self.rate_limiter.get('request_count', 0),
            'rate_limit': self.rate_limiter.get('requests_per_minute', 60),
            'config_valid': self.validate_config()
        }

