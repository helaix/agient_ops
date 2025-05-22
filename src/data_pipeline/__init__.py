"""
Data Pipeline

A comprehensive framework for ingesting, transforming, storing, processing, and visualizing data from various sources.
"""

from . import ingestion
from . import transformation
from . import storage
from . import processing
from . import visualization

__version__ = "1.0.0"
__author__ = "Data Pipeline Team"
__email__ = "datapipeline@example.com"

__all__ = [
    'ingestion',
    'transformation',
    'storage',
    'processing',
    'visualization',
]

