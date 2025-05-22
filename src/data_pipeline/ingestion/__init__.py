"""
Data Ingestion Layer

This package provides a flexible framework for ingesting data from various sources
including REST APIs, databases, file systems, and streaming platforms.
"""

from .ingestion_layer import (
    DataSource,
    RESTAPISource,
    DatabaseSource,
    FileSystemSource,
    StreamingSource,
    DataIngestionManager,
)

__all__ = [
    'DataSource',
    'RESTAPISource',
    'DatabaseSource',
    'FileSystemSource',
    'StreamingSource',
    'DataIngestionManager',
]

