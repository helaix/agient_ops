"""
Legal Compliance Framework for AI-Driven NBA Playoff Betting System

This module implements comprehensive legal compliance monitoring,
regulatory adherence, and jurisdiction-specific requirements.
"""

import logging
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Set
from dataclasses import dataclass, asdict
from enum import Enum
import hashlib
from abc import ABC, abstractmethod


class ComplianceStatus(Enum):
    """Compliance status levels"""
    COMPLIANT = "compliant"
    WARNING = "warning"
    VIOLATION = "violation"
    CRITICAL = "critical"


class Jurisdiction(Enum):
    """Supported jurisdictions"""
    US_NEVADA = "us_nevada"
    US_NEW_JERSEY = "us_new_jersey"
    US_PENNSYLVANIA = "us_pennsylvania"
    UK = "uk"
    ONTARIO_CANADA = "ontario_canada"
    EUROPEAN_UNION = "european_union"
    AUSTRALIA = "australia"


class DataCategory(Enum):
    """Categories of data for privacy compliance"""
    PERSONAL_IDENTIFIABLE = "pii"
    FINANCIAL = "financial"
    BEHAVIORAL = "behavioral"
    BIOMETRIC = "biometric"
    LOCATION = "location"
    COMMUNICATION = "communication"


@dataclass
class ComplianceViolation:
    """Represents a legal compliance violation"""
    violation_id: str
    timestamp: datetime
    jurisdiction: Jurisdiction
    regulation: str
    severity: ComplianceStatus
    description: str
    affected_data: List[str]
    remediation_deadline: datetime
    remediation_actions: List[str]
    metadata: Dict[str, Any]


@dataclass
class AuditTrailEntry:
    """Individual audit trail entry"""
    entry_id: str
    timestamp: datetime
    user_id: Optional[str]
    action: str
    resource: str
    details: Dict[str, Any]
    ip_address: Optional[str]
    user_agent: Optional[str]
    result: str
    hash_chain: str


@dataclass
class DataRetentionPolicy:
    """Data retention policy configuration"""
    data_category: DataCategory
    retention_period: timedelta
    jurisdiction: Jurisdiction
    deletion_method: str
    exceptions: List[str]
    compliance_requirements: List[str]


class JurisdictionCompliance(ABC):
    """Abstract base class for jurisdiction-specific compliance"""
    
    @abstractmethod
    def validate_user_eligibility(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate user eligibility for betting in this jurisdiction"""
        pass
    
    @abstractmethod
    def validate_betting_limits(self, bet_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate betting limits compliance"""
        pass
    
    @abstractmethod
    def get_data_retention_requirements(self) -> List[DataRetentionPolicy]:
        """Get data retention requirements for this jurisdiction"""
        pass
    
    @abstractmethod
    def get_required_disclosures(self) -> List[str]:
        """Get required legal disclosures"""
        pass


class USNevadaCompliance(JurisdictionCompliance):
    """Nevada Gaming Control Board compliance implementation"""
    
    def __init__(self):
        self.min_age = 21
        self.max_single_bet = 50000.0
        self.max_daily_loss = 10000.0
        self.required_licenses = ["nevada_gaming_license"]
    
    def validate_user_eligibility(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate user eligibility under Nevada regulations"""
        violations = []
        
        # Age verification
        age = user_data.get('age', 0)
        if age < self.min_age:
            violations.append(f"User under minimum age of {self.min_age}")
        
        # Location verification
        location = user_data.get('location', {})
        if location.get('state') != 'Nevada':
            violations.append("User not physically located in Nevada")
        
        # Self-exclusion check
        if user_data.get('self_excluded', False):
            violations.append("User is on self-exclusion list")
        
        return {
            'eligible': len(violations) == 0,
            'violations': violations,
            'jurisdiction': Jurisdiction.US_NEVADA.value
        }
    
    def validate_betting_limits(self, bet_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate betting limits under Nevada regulations"""
        violations = []
        
        bet_amount = bet_data.get('amount', 0.0)
        if bet_amount > self.max_single_bet:
            violations.append(f"Bet amount exceeds maximum of ${self.max_single_bet}")
        
        daily_loss = bet_data.get('daily_loss', 0.0)
        if daily_loss > self.max_daily_loss:
            violations.append(f"Daily loss exceeds maximum of ${self.max_daily_loss}")
        
        return {
            'compliant': len(violations) == 0,
            'violations': violations,
            'jurisdiction': Jurisdiction.US_NEVADA.value
        }
    
    def get_data_retention_requirements(self) -> List[DataRetentionPolicy]:
        """Get Nevada data retention requirements"""
        return [
            DataRetentionPolicy(
                data_category=DataCategory.FINANCIAL,
                retention_period=timedelta(days=2555),  # 7 years
                jurisdiction=Jurisdiction.US_NEVADA,
                deletion_method="secure_deletion",
                exceptions=["ongoing_investigation", "legal_hold"],
                compliance_requirements=["Nevada Gaming Control Act"]
            ),
            DataRetentionPolicy(
                data_category=DataCategory.PERSONAL_IDENTIFIABLE,
                retention_period=timedelta(days=1825),  # 5 years
                jurisdiction=Jurisdiction.US_NEVADA,
                deletion_method="secure_deletion",
                exceptions=["active_account", "legal_hold"],
                compliance_requirements=["Nevada Gaming Control Act", "Nevada Privacy Law"]
            )
        ]
    
    def get_required_disclosures(self) -> List[str]:
        """Get required legal disclosures for Nevada"""
        return [
            "Gambling problem? Call 1-800-522-4700",
            "Must be 21 or older to gamble",
            "Licensed by Nevada Gaming Control Board",
            "Odds and payouts subject to change",
            "Responsible gambling resources available"
        ]


class EUGDPRCompliance(JurisdictionCompliance):
    """GDPR compliance implementation for European Union"""
    
    def __init__(self):
        self.min_age = 18
        self.data_subject_rights = [
            "right_to_access", "right_to_rectification", "right_to_erasure",
            "right_to_restrict_processing", "right_to_data_portability",
            "right_to_object", "rights_related_to_automated_decision_making"
        ]
    
    def validate_user_eligibility(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate user eligibility under GDPR and EU regulations"""
        violations = []
        
        # Age verification
        age = user_data.get('age', 0)
        if age < self.min_age:
            violations.append(f"User under minimum age of {self.min_age}")
        
        # Consent verification
        consent = user_data.get('gdpr_consent', {})
        required_consents = ['data_processing', 'marketing', 'profiling']
        for consent_type in required_consents:
            if not consent.get(consent_type, False):
                violations.append(f"Missing GDPR consent for {consent_type}")
        
        return {
            'eligible': len(violations) == 0,
            'violations': violations,
            'jurisdiction': Jurisdiction.EUROPEAN_UNION.value
        }
    
    def validate_betting_limits(self, bet_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate betting limits under EU regulations"""
        # EU regulations vary by member state
        # This is a simplified implementation
        violations = []
        
        # Check for responsible gambling limits
        user_limits = bet_data.get('user_set_limits', {})
        if not user_limits:
            violations.append("User has not set responsible gambling limits")
        
        return {
            'compliant': len(violations) == 0,
            'violations': violations,
            'jurisdiction': Jurisdiction.EUROPEAN_UNION.value
        }
    
    def get_data_retention_requirements(self) -> List[DataRetentionPolicy]:
        """Get GDPR data retention requirements"""
        return [
            DataRetentionPolicy(
                data_category=DataCategory.PERSONAL_IDENTIFIABLE,
                retention_period=timedelta(days=365),  # 1 year after account closure
                jurisdiction=Jurisdiction.EUROPEAN_UNION,
                deletion_method="gdpr_compliant_deletion",
                exceptions=["legal_obligation", "legitimate_interest"],
                compliance_requirements=["GDPR Article 5", "GDPR Article 17"]
            ),
            DataRetentionPolicy(
                data_category=DataCategory.FINANCIAL,
                retention_period=timedelta(days=2190),  # 6 years for financial records
                jurisdiction=Jurisdiction.EUROPEAN_UNION,
                deletion_method="gdpr_compliant_deletion",
                exceptions=["legal_obligation"],
                compliance_requirements=["GDPR Article 5", "Anti-Money Laundering Directive"]
            )
        ]
    
    def get_required_disclosures(self) -> List[str]:
        """Get required legal disclosures for EU"""
        return [
            "Data processing based on legitimate interest and consent",
            "Right to withdraw consent at any time",
            "Data may be transferred to third countries with adequate protection",
            "Automated decision-making may affect betting recommendations",
            "Contact Data Protection Officer for privacy concerns"
        ]


class AuditTrailManager:
    """Manages comprehensive audit trails for compliance"""
    
    def __init__(self):
        self.audit_entries = []
        self.hash_chain = ""
        self.logger = logging.getLogger(__name__)
    
    def log_action(self, user_id: Optional[str], action: str, resource: str,
                   details: Dict[str, Any], ip_address: Optional[str] = None,
                   user_agent: Optional[str] = None, result: str = "success") -> str:
        """
        Log an action to the audit trail
        
        Args:
            user_id: User performing the action
            action: Action being performed
            resource: Resource being acted upon
            details: Additional details about the action
            ip_address: User's IP address
            user_agent: User's browser/client information
            result: Result of the action
            
        Returns:
            Entry ID for the audit log entry
        """
        entry_id = f"audit_{datetime.now().timestamp()}_{hashlib.md5(f'{user_id}{action}{resource}'.encode()).hexdigest()[:8]}"
        
        # Create hash chain for integrity
        entry_data = f"{entry_id}{user_id}{action}{resource}{json.dumps(details, sort_keys=True)}{result}"
        current_hash = hashlib.sha256(f"{self.hash_chain}{entry_data}".encode()).hexdigest()
        
        entry = AuditTrailEntry(
            entry_id=entry_id,
            timestamp=datetime.now(),
            user_id=user_id,
            action=action,
            resource=resource,
            details=details,
            ip_address=ip_address,
            user_agent=user_agent,
            result=result,
            hash_chain=current_hash
        )
        
        self.audit_entries.append(entry)
        self.hash_chain = current_hash
        
        self.logger.info(f"Audit log entry created: {entry_id}")
        return entry_id
    
    def verify_integrity(self) -> Dict[str, Any]:
        """Verify the integrity of the audit trail"""
        if not self.audit_entries:
            return {'valid': True, 'message': 'No entries to verify'}
        
        hash_chain = ""
        for i, entry in enumerate(self.audit_entries):
            entry_data = f"{entry.entry_id}{entry.user_id}{entry.action}{entry.resource}{json.dumps(entry.details, sort_keys=True)}{entry.result}"
            expected_hash = hashlib.sha256(f"{hash_chain}{entry_data}".encode()).hexdigest()
            
            if entry.hash_chain != expected_hash:
                return {
                    'valid': False,
                    'message': f'Integrity violation at entry {i}: {entry.entry_id}',
                    'expected_hash': expected_hash,
                    'actual_hash': entry.hash_chain
                }
            
            hash_chain = entry.hash_chain
        
        return {'valid': True, 'message': 'Audit trail integrity verified'}
    
    def get_audit_report(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Generate audit report for specified date range"""
        filtered_entries = [
            entry for entry in self.audit_entries
            if start_date <= entry.timestamp <= end_date
        ]
        
        # Aggregate statistics
        action_counts = {}
        user_activity = {}
        resource_access = {}
        
        for entry in filtered_entries:
            # Action counts
            action_counts[entry.action] = action_counts.get(entry.action, 0) + 1
            
            # User activity
            if entry.user_id:
                user_activity[entry.user_id] = user_activity.get(entry.user_id, 0) + 1
            
            # Resource access
            resource_access[entry.resource] = resource_access.get(entry.resource, 0) + 1
        
        return {
            'report_period': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat()
            },
            'total_entries': len(filtered_entries),
            'action_summary': action_counts,
            'user_activity': user_activity,
            'resource_access': resource_access,
            'integrity_check': self.verify_integrity(),
            'entries': [asdict(entry) for entry in filtered_entries]
        }


class DataPrivacyManager:
    """Manages data privacy and protection compliance"""
    
    def __init__(self, retention_policies: List[DataRetentionPolicy]):
        self.retention_policies = retention_policies
        self.data_inventory = {}
        self.deletion_queue = []
        self.logger = logging.getLogger(__name__)
    
    def register_data(self, data_id: str, data_category: DataCategory,
                     jurisdiction: Jurisdiction, creation_date: datetime,
                     metadata: Dict[str, Any]) -> None:
        """Register data for privacy compliance tracking"""
        self.data_inventory[data_id] = {
            'data_category': data_category,
            'jurisdiction': jurisdiction,
            'creation_date': creation_date,
            'metadata': metadata,
            'access_log': [],
            'deletion_scheduled': False
        }
    
    def schedule_data_deletion(self) -> List[str]:
        """Schedule data for deletion based on retention policies"""
        scheduled_deletions = []
        current_time = datetime.now()
        
        for data_id, data_info in self.data_inventory.items():
            if data_info['deletion_scheduled']:
                continue
            
            # Find applicable retention policy
            applicable_policy = None
            for policy in self.retention_policies:
                if (policy.data_category == data_info['data_category'] and
                    policy.jurisdiction == data_info['jurisdiction']):
                    applicable_policy = policy
                    break
            
            if applicable_policy:
                deletion_date = data_info['creation_date'] + applicable_policy.retention_period
                if current_time >= deletion_date:
                    # Check for exceptions
                    has_exception = any(
                        exception in data_info['metadata'].get('tags', [])
                        for exception in applicable_policy.exceptions
                    )
                    
                    if not has_exception:
                        self.deletion_queue.append({
                            'data_id': data_id,
                            'deletion_method': applicable_policy.deletion_method,
                            'scheduled_date': current_time,
                            'policy': applicable_policy
                        })
                        data_info['deletion_scheduled'] = True
                        scheduled_deletions.append(data_id)
        
        return scheduled_deletions
    
    def process_data_subject_request(self, request_type: str, user_id: str,
                                   data_categories: List[DataCategory]) -> Dict[str, Any]:
        """Process data subject rights requests (GDPR, CCPA, etc.)"""
        user_data = {data_id: info for data_id, info in self.data_inventory.items()
                    if info['metadata'].get('user_id') == user_id}
        
        if request_type == "access":
            return self._process_access_request(user_data, data_categories)
        elif request_type == "deletion":
            return self._process_deletion_request(user_data, data_categories)
        elif request_type == "portability":
            return self._process_portability_request(user_data, data_categories)
        else:
            return {'error': f'Unsupported request type: {request_type}'}
    
    def _process_access_request(self, user_data: Dict[str, Any],
                              data_categories: List[DataCategory]) -> Dict[str, Any]:
        """Process data access request"""
        accessible_data = {}
        for data_id, info in user_data.items():
            if info['data_category'] in data_categories:
                accessible_data[data_id] = {
                    'category': info['data_category'].value,
                    'creation_date': info['creation_date'].isoformat(),
                    'metadata': info['metadata']
                }
        
        return {
            'request_type': 'access',
            'data_count': len(accessible_data),
            'data': accessible_data,
            'processed_date': datetime.now().isoformat()
        }
    
    def _process_deletion_request(self, user_data: Dict[str, Any],
                                data_categories: List[DataCategory]) -> Dict[str, Any]:
        """Process data deletion request"""
        deleted_data = []
        for data_id, info in user_data.items():
            if info['data_category'] in data_categories:
                # Check if deletion is allowed
                has_legal_hold = 'legal_hold' in info['metadata'].get('tags', [])
                if not has_legal_hold:
                    deleted_data.append(data_id)
                    info['deletion_scheduled'] = True
        
        return {
            'request_type': 'deletion',
            'deleted_count': len(deleted_data),
            'deleted_data_ids': deleted_data,
            'processed_date': datetime.now().isoformat()
        }
    
    def _process_portability_request(self, user_data: Dict[str, Any],
                                   data_categories: List[DataCategory]) -> Dict[str, Any]:
        """Process data portability request"""
        portable_data = {}
        for data_id, info in user_data.items():
            if info['data_category'] in data_categories:
                portable_data[data_id] = info['metadata']
        
        return {
            'request_type': 'portability',
            'data_count': len(portable_data),
            'portable_data': portable_data,
            'format': 'json',
            'processed_date': datetime.now().isoformat()
        }


class LegalComplianceFramework:
    """Main legal compliance framework coordinator"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.jurisdiction_handlers = self._initialize_jurisdiction_handlers()
        self.audit_manager = AuditTrailManager()
        self.privacy_manager = self._initialize_privacy_manager()
        self.violations = []
        self.logger = logging.getLogger(__name__)
    
    def _initialize_jurisdiction_handlers(self) -> Dict[Jurisdiction, JurisdictionCompliance]:
        """Initialize jurisdiction-specific compliance handlers"""
        return {
            Jurisdiction.US_NEVADA: USNevadaCompliance(),
            Jurisdiction.EUROPEAN_UNION: EUGDPRCompliance()
            # Add more jurisdictions as needed
        }
    
    def _initialize_privacy_manager(self) -> DataPrivacyManager:
        """Initialize data privacy manager with all retention policies"""
        all_policies = []
        for handler in self.jurisdiction_handlers.values():
            all_policies.extend(handler.get_data_retention_requirements())
        
        return DataPrivacyManager(all_policies)
    
    def validate_user_compliance(self, user_data: Dict[str, Any],
                               jurisdiction: Jurisdiction) -> Dict[str, Any]:
        """Validate user compliance for specific jurisdiction"""
        handler = self.jurisdiction_handlers.get(jurisdiction)
        if not handler:
            return {'error': f'Unsupported jurisdiction: {jurisdiction.value}'}
        
        # Log the compliance check
        self.audit_manager.log_action(
            user_id=user_data.get('user_id'),
            action='compliance_check',
            resource='user_eligibility',
            details={'jurisdiction': jurisdiction.value},
            result='completed'
        )
        
        return handler.validate_user_eligibility(user_data)
    
    def validate_betting_compliance(self, bet_data: Dict[str, Any],
                                  jurisdiction: Jurisdiction) -> Dict[str, Any]:
        """Validate betting compliance for specific jurisdiction"""
        handler = self.jurisdiction_handlers.get(jurisdiction)
        if not handler:
            return {'error': f'Unsupported jurisdiction: {jurisdiction.value}'}
        
        # Log the betting compliance check
        self.audit_manager.log_action(
            user_id=bet_data.get('user_id'),
            action='betting_compliance_check',
            resource='betting_limits',
            details={'jurisdiction': jurisdiction.value, 'bet_amount': bet_data.get('amount')},
            result='completed'
        )
        
        return handler.validate_betting_limits(bet_data)
    
    def generate_compliance_report(self, jurisdiction: Optional[Jurisdiction] = None) -> Dict[str, Any]:
        """Generate comprehensive compliance report"""
        report = {
            'report_timestamp': datetime.now(),
            'total_violations': len(self.violations),
            'audit_integrity': self.audit_manager.verify_integrity(),
            'data_privacy_status': self._get_privacy_status(),
            'jurisdictions': {}
        }
        
        # Generate jurisdiction-specific reports
        jurisdictions_to_report = [jurisdiction] if jurisdiction else self.jurisdiction_handlers.keys()
        
        for juris in jurisdictions_to_report:
            handler = self.jurisdiction_handlers.get(juris)
            if handler:
                report['jurisdictions'][juris.value] = {
                    'required_disclosures': handler.get_required_disclosures(),
                    'data_retention_policies': [asdict(policy) for policy in handler.get_data_retention_requirements()],
                    'recent_violations': [
                        asdict(v) for v in self.violations
                        if v.jurisdiction == juris and v.timestamp > datetime.now() - timedelta(days=30)
                    ]
                }
        
        return report
    
    def _get_privacy_status(self) -> Dict[str, Any]:
        """Get current data privacy status"""
        scheduled_deletions = self.privacy_manager.schedule_data_deletion()
        
        return {
            'total_data_records': len(self.privacy_manager.data_inventory),
            'scheduled_deletions': len(scheduled_deletions),
            'deletion_queue_size': len(self.privacy_manager.deletion_queue),
            'compliance_status': 'compliant' if len(scheduled_deletions) == 0 else 'action_required'
        }
    
    def handle_regulatory_inquiry(self, inquiry_data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle regulatory inquiry or investigation"""
        inquiry_id = f"inquiry_{datetime.now().timestamp()}"
        
        # Log the regulatory inquiry
        self.audit_manager.log_action(
            user_id=None,
            action='regulatory_inquiry',
            resource='compliance_framework',
            details=inquiry_data,
            result='received'
        )
        
        # Generate comprehensive response package
        response = {
            'inquiry_id': inquiry_id,
            'received_date': datetime.now(),
            'jurisdiction': inquiry_data.get('jurisdiction'),
            'regulator': inquiry_data.get('regulator'),
            'compliance_report': self.generate_compliance_report(),
            'audit_trail': self.audit_manager.get_audit_report(
                start_date=datetime.now() - timedelta(days=90),
                end_date=datetime.now()
            ),
            'data_inventory': len(self.privacy_manager.data_inventory),
            'response_deadline': datetime.now() + timedelta(days=30)
        }
        
        return response

