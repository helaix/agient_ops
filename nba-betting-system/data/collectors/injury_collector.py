"""
Injury Reports and Roster Changes Collector

Collects injury reports, roster changes, and player availability data
from multiple sources for NBA teams and players.
"""

import asyncio
import aiohttp
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import logging
import re
from bs4 import BeautifulSoup

from ..architecture import DataCollector, DataRecord, DataSourceType, DataQuality


class InjuryCollector(DataCollector):
    """Collector for injury reports and roster changes."""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(DataSourceType.INJURY_REPORTS, config)
        self.session: Optional[aiohttp.ClientSession] = None
        self.sources = config.get('sources', {
            'nba_official': 'https://www.nba.com/stats/players/injury',
            'espn': 'https://www.espn.com/nba/injuries',
            'rotoworld': 'https://www.rotoworld.com/basketball/nba/injury-report'
        })
        
    async def _ensure_session(self):
        """Ensure aiohttp session is available."""
        if self.session is None or self.session.closed:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            }
            timeout = aiohttp.ClientTimeout(total=self.config.get('timeout', 30))
            self.session = aiohttp.ClientSession(headers=headers, timeout=timeout)
    
    async def _make_request(self, url: str) -> str:
        """Make HTTP request and return response text."""
        await self._ensure_session()
        
        try:
            async with self.session.get(url) as response:
                if response.status == 200:
                    return await response.text()
                else:
                    self.logger.error(f"Request failed: {response.status} - {url}")
                    return ""
        except Exception as e:
            self.logger.error(f"Request failed: {e} - {url}")
            return ""
    
    def _parse_injury_status(self, status_text: str) -> Dict[str, Any]:
        """Parse injury status text into structured data."""
        status_text = status_text.lower().strip()
        
        # Define injury severity mapping
        severity_map = {
            'out': 'out',
            'doubtful': 'doubtful',
            'questionable': 'questionable',
            'probable': 'probable',
            'day-to-day': 'day_to_day',
            'gtd': 'game_time_decision',
            'game time decision': 'game_time_decision',
            'available': 'available',
            'healthy': 'available'
        }
        
        # Extract injury type/body part
        body_parts = [
            'ankle', 'knee', 'back', 'shoulder', 'wrist', 'hand', 'finger',
            'hip', 'groin', 'hamstring', 'calf', 'foot', 'toe', 'elbow',
            'neck', 'head', 'concussion', 'covid', 'illness', 'personal'
        ]
        
        injury_info = {
            'status': 'unknown',
            'body_part': None,
            'injury_type': None,
            'severity_score': 0,  # 0=available, 1=probable, 2=questionable, 3=doubtful, 4=out
            'estimated_return': None
        }
        
        # Determine status
        for key, value in severity_map.items():
            if key in status_text:
                injury_info['status'] = value
                break
        
        # Determine severity score
        severity_scores = {
            'available': 0,
            'probable': 1,
            'questionable': 2,
            'doubtful': 3,
            'out': 4,
            'day_to_day': 2,
            'game_time_decision': 2
        }
        injury_info['severity_score'] = severity_scores.get(injury_info['status'], 0)
        
        # Extract body part
        for part in body_parts:
            if part in status_text:
                injury_info['body_part'] = part
                break
        
        # Extract injury type (strain, sprain, fracture, etc.)
        injury_types = ['strain', 'sprain', 'fracture', 'tear', 'bruise', 'soreness', 'inflammation']
        for injury_type in injury_types:
            if injury_type in status_text:
                injury_info['injury_type'] = injury_type
                break
        
        return injury_info
    
    async def collect_nba_official_injuries(self) -> List[DataRecord]:
        """Collect injury data from NBA official sources."""
        records = []
        
        # This would typically involve API calls to NBA's injury endpoint
        # For now, we'll create a placeholder structure
        
        # Simulated NBA official injury data structure
        sample_injuries = [
            {
                'player_id': '2544',
                'player_name': 'LeBron James',
                'team_id': '1610612747',
                'team_name': 'Los Angeles Lakers',
                'injury_status': 'Questionable',
                'injury_description': 'Left ankle soreness',
                'last_updated': datetime.utcnow().isoformat()
            }
        ]
        
        for injury in sample_injuries:
            injury_info = self._parse_injury_status(injury['injury_description'])
            
            record = DataRecord(
                source_type=DataSourceType.INJURY_REPORTS,
                timestamp=datetime.utcnow(),
                player_id=injury['player_id'],
                team_id=injury['team_id'],
                data={
                    'player_name': injury['player_name'],
                    'team_name': injury['team_name'],
                    'injury_status': injury['injury_status'],
                    'injury_description': injury['injury_description'],
                    'parsed_injury': injury_info,
                    'source': 'nba_official',
                    'data_type': 'injury_report',
                    'last_updated': injury['last_updated']
                },
                quality=DataQuality.HIGH
            )
            records.append(record)
        
        return records
    
    async def collect_espn_injuries(self) -> List[DataRecord]:
        """Collect injury data from ESPN."""
        records = []
        url = self.sources.get('espn')
        
        if not url:
            return records
        
        html_content = await self._make_request(url)
        if not html_content:
            return records
        
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Parse ESPN injury report structure
            # This is a simplified example - actual implementation would need
            # to handle ESPN's specific HTML structure
            
            injury_tables = soup.find_all('table', class_='Table')
            
            for table in injury_tables:
                rows = table.find_all('tr')
                for row in rows[1:]:  # Skip header row
                    cells = row.find_all('td')
                    if len(cells) >= 4:
                        player_name = cells[0].get_text(strip=True)
                        team = cells[1].get_text(strip=True)
                        status = cells[2].get_text(strip=True)
                        injury_desc = cells[3].get_text(strip=True)
                        
                        injury_info = self._parse_injury_status(f"{status} {injury_desc}")
                        
                        record = DataRecord(
                            source_type=DataSourceType.INJURY_REPORTS,
                            timestamp=datetime.utcnow(),
                            data={
                                'player_name': player_name,
                                'team_name': team,
                                'injury_status': status,
                                'injury_description': injury_desc,
                                'parsed_injury': injury_info,
                                'source': 'espn',
                                'data_type': 'injury_report'
                            },
                            quality=DataQuality.MEDIUM
                        )
                        records.append(record)
        
        except Exception as e:
            self.logger.error(f"Failed to parse ESPN injury data: {e}")
        
        return records
    
    async def collect_roster_changes(self) -> List[DataRecord]:
        """Collect roster changes and transactions."""
        records = []
        
        # This would collect data about:
        # - Player signings
        # - Releases
        # - Trades
        # - G-League assignments
        # - Suspensions
        
        # Placeholder for roster change data
        sample_transactions = [
            {
                'transaction_type': 'signing',
                'player_name': 'Sample Player',
                'team_from': None,
                'team_to': 'Los Angeles Lakers',
                'transaction_date': datetime.utcnow().isoformat(),
                'details': '10-day contract'
            }
        ]
        
        for transaction in sample_transactions:
            record = DataRecord(
                source_type=DataSourceType.ROSTER_CHANGES,
                timestamp=datetime.utcnow(),
                data={
                    **transaction,
                    'source': 'nba_transactions',
                    'data_type': 'roster_change'
                },
                quality=DataQuality.HIGH
            )
            records.append(record)
        
        return records
    
    async def collect_player_availability(self, game_date: Optional[datetime] = None) -> List[DataRecord]:
        """Collect player availability for specific game date."""
        records = []
        
        if game_date is None:
            game_date = datetime.utcnow()
        
        # This would collect real-time player availability updates
        # including last-minute injury updates and game-time decisions
        
        availability_data = {
            'game_date': game_date.isoformat(),
            'last_updated': datetime.utcnow().isoformat(),
            'players': [],  # Would be populated with actual data
            'data_type': 'player_availability'
        }
        
        record = DataRecord(
            source_type=DataSourceType.INJURY_REPORTS,
            timestamp=datetime.utcnow(),
            data=availability_data,
            quality=DataQuality.HIGH
        )
        records.append(record)
        
        return records
    
    def _calculate_injury_impact_score(self, injury_data: Dict[str, Any]) -> float:
        """Calculate impact score of injury on team performance."""
        # This would analyze historical data to determine how specific
        # injuries to specific players affect team performance
        
        base_score = injury_data.get('severity_score', 0)
        
        # Factors that could increase impact:
        # - Player importance (starter vs bench)
        # - Position scarcity
        # - Recent performance
        # - Historical injury patterns
        
        impact_score = base_score * 0.25  # Simplified calculation
        
        return min(impact_score, 1.0)
    
    async def collect(self, **kwargs) -> List[DataRecord]:
        """Main collection method for injury and roster data."""
        game_date = kwargs.get('game_date')
        include_roster_changes = kwargs.get('include_roster_changes', True)
        
        all_records = []
        
        try:
            # Collect from different sources
            tasks = [
                self.collect_nba_official_injuries(),
                self.collect_espn_injuries(),
                self.collect_player_availability(game_date)
            ]
            
            if include_roster_changes:
                tasks.append(self.collect_roster_changes())
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for result in results:
                if isinstance(result, Exception):
                    self.logger.error(f"Injury collection task failed: {result}")
                else:
                    all_records.extend(result)
            
            # Add impact scores to injury records
            for record in all_records:
                if 'parsed_injury' in record.data:
                    impact_score = self._calculate_injury_impact_score(record.data['parsed_injury'])
                    record.data['impact_score'] = impact_score
            
            self.logger.info(f"Collected {len(all_records)} injury/roster records")
            
        except Exception as e:
            self.logger.error(f"Injury collection failed: {e}")
        
        finally:
            if self.session and not self.session.closed:
                await self.session.close()
        
        return all_records
    
    def validate_config(self) -> bool:
        """Validate injury collector configuration."""
        if not self.sources:
            self.logger.error("No injury data sources configured")
            return False
        
        return True
    
    def get_health_status(self) -> Dict[str, Any]:
        """Get health status of injury data sources."""
        return {
            'status': 'healthy',
            'configured_sources': len(self.sources),
            'sources': list(self.sources.keys()),
            'config_valid': self.validate_config()
        }

