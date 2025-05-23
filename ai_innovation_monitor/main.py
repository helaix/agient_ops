"""
Main entry point for the AI Innovation Monitoring & Adaptation System.

This module provides the main application that coordinates all components
and provides the primary interface for the autonomous monitoring system.
"""

import asyncio
import logging
import signal
import sys
from pathlib import Path
from typing import Dict, Any
import yaml
import argparse

from .core.orchestrator import SystemOrchestrator
from .monitoring.innovation_detector import InnovationDetector
from .monitoring.source_manager import SourceManager
from .adaptation.adaptation_engine import AdaptationEngine


class AIInnovationMonitor:
    """
    Main application class for the AI Innovation Monitoring System.
    
    Coordinates all components and provides the primary interface for
    autonomous AI innovation monitoring and system adaptation.
    """
    
    def __init__(self, config_path: str = "config/config.yaml"):
        """Initialize the AI Innovation Monitor."""
        self.config_path = config_path
        self.config = {}
        self.logger = self._setup_logging()
        
        # Core components
        self.orchestrator = None
        self.innovation_detector = None
        self.source_manager = None
        self.adaptation_engine = None
        
        # System state
        self.is_running = False
        self.shutdown_event = asyncio.Event()
        
    def _setup_logging(self) -> logging.Logger:
        """Setup logging configuration."""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.StreamHandler(sys.stdout),
                logging.FileHandler('ai_innovation_monitor.log')
            ]
        )
        return logging.getLogger(__name__)
        
    async def load_config(self):
        """Load configuration from file."""
        try:
            config_file = Path(self.config_path)
            if not config_file.exists():
                self.logger.warning(f"Config file {self.config_path} not found, using defaults")
                self.config = self._get_default_config()
            else:
                with open(config_file, 'r') as f:
                    self.config = yaml.safe_load(f)
                    
            self.logger.info(f"Configuration loaded from {self.config_path}")
            
        except Exception as e:
            self.logger.error(f"Error loading configuration: {e}")
            self.config = self._get_default_config()
            
    def _get_default_config(self) -> Dict[str, Any]:
        """Get default configuration."""
        return {
            "system": {
                "name": "AI Innovation Monitor",
                "version": "1.0.0",
                "environment": "development"
            },
            "orchestrator": {
                "max_concurrent_workflows": 10,
                "workflow_timeout": 3600
            },
            "innovation_detector": {
                "max_recent_items": 1000,
                "detection_rules": [],
                "keyword_weights": {
                    "artificial intelligence": 2.0,
                    "machine learning": 1.8,
                    "deep learning": 1.8,
                    "neural network": 1.5,
                    "breakthrough": 2.5,
                    "state-of-the-art": 2.0
                },
                "domain_weights": {
                    "ai": 1.0,
                    "ml": 1.0,
                    "security": 1.2,
                    "performance": 0.8
                },
                "source_weights": {
                    "arxiv": 1.0,
                    "github": 0.8,
                    "news": 0.6,
                    "social": 0.4
                }
            },
            "source_manager": {
                "sources": {
                    "arxiv": {
                        "enabled": True,
                        "categories": ["cs.AI", "cs.LG", "cs.CL"],
                        "check_interval": 3600
                    },
                    "github": {
                        "enabled": True,
                        "trending_languages": ["python", "javascript", "typescript"],
                        "check_interval": 1800
                    },
                    "news": {
                        "enabled": True,
                        "sources": ["techcrunch", "venturebeat", "wired"],
                        "check_interval": 1800
                    }
                }
            },
            "adaptation_engine": {
                "max_concurrent_adaptations": 3,
                "auto_execute_threshold": 0.8,
                "require_approval_above_risk": "high"
            },
            "decision_engine": {
                "impact_thresholds": {
                    "critical": 9.0,
                    "high": 7.0,
                    "medium": 5.0,
                    "low": 3.0
                },
                "confidence_thresholds": {
                    "high": 0.8,
                    "medium": 0.6,
                    "low": 0.4
                },
                "risk_tolerance": {
                    "security": 0.2,
                    "performance": 0.5,
                    "cost": 0.7,
                    "compliance": 0.1
                }
            },
            "monitoring": {
                "health_check_interval": 60,
                "metrics_collection_interval": 300,
                "alert_thresholds": {
                    "error_rate": 0.05,
                    "response_time": 5.0
                }
            },
            "storage": {
                "type": "file",
                "path": "data/",
                "retention_days": 90
            },
            "api": {
                "host": "0.0.0.0",
                "port": 8080,
                "enable_cors": True
            },
            "dashboard": {
                "enabled": True,
                "refresh_interval": 30
            }
        }
        
    async def initialize_components(self):
        """Initialize all system components."""
        self.logger.info("Initializing system components")
        
        try:
            # Initialize core orchestrator
            self.orchestrator = SystemOrchestrator(self.config.get("orchestrator", {}))
            
            # Initialize innovation detector
            self.innovation_detector = InnovationDetector(
                self.config.get("innovation_detector", {})
            )
            
            # Initialize source manager
            self.source_manager = SourceManager(
                self.config.get("source_manager", {})
            )
            
            # Initialize adaptation engine
            self.adaptation_engine = AdaptationEngine(
                self.config.get("adaptation_engine", {})
            )
            
            self.logger.info("All components initialized successfully")
            
        except Exception as e:
            self.logger.error(f"Error initializing components: {e}")
            raise
            
    async def start(self):
        """Start the AI Innovation Monitor system."""
        if self.is_running:
            self.logger.warning("System is already running")
            return
            
        self.logger.info("Starting AI Innovation Monitoring System")
        
        try:
            # Load configuration
            await self.load_config()
            
            # Initialize components
            await self.initialize_components()
            
            # Start components
            await self.orchestrator.start()
            await self.innovation_detector.start()
            await self.source_manager.start()
            await self.adaptation_engine.start()
            
            # Setup signal handlers
            self._setup_signal_handlers()
            
            # Start main monitoring loop
            asyncio.create_task(self._main_monitoring_loop())
            
            # Start API server if enabled
            if self.config.get("api", {}).get("enabled", True):
                asyncio.create_task(self._start_api_server())
                
            self.is_running = True
            self.logger.info("AI Innovation Monitoring System started successfully")
            
            # Wait for shutdown signal
            await self.shutdown_event.wait()
            
        except Exception as e:
            self.logger.error(f"Error starting system: {e}")
            raise
        finally:
            await self.stop()
            
    async def stop(self):
        """Stop the AI Innovation Monitor system."""
        if not self.is_running:
            return
            
        self.logger.info("Stopping AI Innovation Monitoring System")
        
        try:
            self.is_running = False
            
            # Stop components
            if self.adaptation_engine:
                await self.adaptation_engine.stop()
            if self.source_manager:
                await self.source_manager.stop()
            if self.innovation_detector:
                await self.innovation_detector.stop()
            if self.orchestrator:
                await self.orchestrator.stop()
                
            self.logger.info("AI Innovation Monitoring System stopped")
            
        except Exception as e:
            self.logger.error(f"Error stopping system: {e}")
            
    async def _main_monitoring_loop(self):
        """Main monitoring loop that coordinates system operations."""
        self.logger.info("Starting main monitoring loop")
        
        while self.is_running:
            try:
                # Collect data from sources
                source_data = await self.source_manager.collect_all_sources()
                
                if source_data:
                    # Detect innovations
                    innovations = await self.innovation_detector.process_source_data(source_data)
                    
                    # Process innovations through orchestrator
                    for innovation in innovations:
                        await self.orchestrator.submit_workflow(
                            workflow_type="research_coordination",
                            parameters={
                                "innovation": innovation.__dict__,
                                "research_areas": [innovation.domain],
                                "evaluation_criteria": {"relevance": 0.8, "urgency": 0.6}
                            },
                            priority=min(9, int(innovation.impact_score))
                        )
                        
                # Health check
                await self._perform_health_check()
                
                # Wait before next iteration
                await asyncio.sleep(self.config.get("monitoring", {}).get("check_interval", 300))
                
            except Exception as e:
                self.logger.error(f"Error in main monitoring loop: {e}")
                await asyncio.sleep(60)  # Wait before retrying
                
    async def _perform_health_check(self):
        """Perform system health check."""
        try:
            health_status = {
                "orchestrator": await self.orchestrator.health_check() if self.orchestrator else "not_initialized",
                "innovation_detector": await self.innovation_detector.health_check() if self.innovation_detector else "not_initialized",
                "source_manager": await self.source_manager.health_check() if self.source_manager else "not_initialized",
                "adaptation_engine": await self.adaptation_engine.health_check() if self.adaptation_engine else "not_initialized"
            }
            
            # Log any unhealthy components
            for component, status in health_status.items():
                if status != "healthy":
                    self.logger.warning(f"Component {component} health status: {status}")
                    
        except Exception as e:
            self.logger.error(f"Error performing health check: {e}")
            
    async def _start_api_server(self):
        """Start the API server for external access."""
        try:
            from .api.server import create_app
            
            app = create_app(self)
            
            # This would typically use a proper ASGI server like uvicorn
            # For now, just log that the API would be available
            api_config = self.config.get("api", {})
            host = api_config.get("host", "0.0.0.0")
            port = api_config.get("port", 8080)
            
            self.logger.info(f"API server would be available at http://{host}:{port}")
            
        except ImportError:
            self.logger.info("API server dependencies not available, skipping API startup")
        except Exception as e:
            self.logger.error(f"Error starting API server: {e}")
            
    def _setup_signal_handlers(self):
        """Setup signal handlers for graceful shutdown."""
        def signal_handler(signum, frame):
            self.logger.info(f"Received signal {signum}, initiating shutdown")
            self.shutdown_event.set()
            
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        
    async def get_system_status(self) -> Dict[str, Any]:
        """Get current system status."""
        status = {
            "running": self.is_running,
            "components": {},
            "metrics": {}
        }
        
        if self.is_running:
            # Get component health
            status["components"] = {
                "orchestrator": await self.orchestrator.health_check() if self.orchestrator else "not_initialized",
                "innovation_detector": await self.innovation_detector.health_check() if self.innovation_detector else "not_initialized",
                "source_manager": await self.source_manager.health_check() if self.source_manager else "not_initialized",
                "adaptation_engine": await self.adaptation_engine.health_check() if self.adaptation_engine else "not_initialized"
            }
            
            # Get metrics
            if self.innovation_detector:
                status["metrics"]["innovation_detector"] = await self.innovation_detector.get_metrics()
            if self.adaptation_engine:
                status["metrics"]["adaptation_engine"] = await self.adaptation_engine.get_metrics()
                
        return status


async def main():
    """Main entry point for the application."""
    parser = argparse.ArgumentParser(description="AI Innovation Monitoring & Adaptation System")
    parser.add_argument(
        "--config", 
        default="config/config.yaml",
        help="Path to configuration file"
    )
    parser.add_argument(
        "--log-level",
        default="INFO",
        choices=["DEBUG", "INFO", "WARNING", "ERROR"],
        help="Logging level"
    )
    
    args = parser.parse_args()
    
    # Set logging level
    logging.getLogger().setLevel(getattr(logging, args.log_level))
    
    # Create and start the monitor
    monitor = AIInnovationMonitor(config_path=args.config)
    
    try:
        await monitor.start()
    except KeyboardInterrupt:
        print("\nShutdown requested by user")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())

