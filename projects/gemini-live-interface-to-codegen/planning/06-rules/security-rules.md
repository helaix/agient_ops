# Security Rules for Gemini Live Interface to CodeGen

## Rule Activation Triggers

This rule set is activated when:
- Security considerations need to be evaluated
- Authentication and authorization flows are being implemented
- Data protection and privacy measures are being designed
- Security vulnerabilities need to be addressed
- Compliance requirements must be met

## Core Security Principles

### 1. Authentication and Authorization

#### Multi-Factor Authentication (MFA)
```typescript
interface AuthenticationService {
  // Primary authentication
  authenticateUser(credentials: UserCredentials): Promise<AuthResult>;
  
  // Multi-factor authentication
  initiateMFA(userId: string, method: MFAMethod): Promise<MFAChallenge>;
  verifyMFA(challengeId: string, response: string): Promise<MFAResult>;
  
  // Token management
  generateAccessToken(userId: string, scopes: string[]): Promise<AccessToken>;
  refreshToken(refreshToken: string): Promise<TokenPair>;
  revokeToken(token: string): Promise<void>;
}

class SecureAuthenticationService implements AuthenticationService {
  private readonly tokenService: TokenService;
  private readonly mfaService: MFAService;
  private readonly auditLogger: AuditLogger;
  
  async authenticateUser(credentials: UserCredentials): Promise<AuthResult> {
    // Rate limiting to prevent brute force attacks
    await this.rateLimiter.checkLimit(credentials.username, 'auth_attempts');
    
    try {
      // Hash and compare password securely
      const user = await this.userRepository.findByUsername(credentials.username);
      if (!user) {
        // Prevent username enumeration - same timing for invalid users
        await this.simulatePasswordCheck();
        throw new AuthenticationError('Invalid credentials');
      }
      
      const isValidPassword = await this.verifyPassword(credentials.password, user.passwordHash);
      if (!isValidPassword) {
        await this.auditLogger.logFailedLogin(credentials.username, 'invalid_password');
        throw new AuthenticationError('Invalid credentials');
      }
      
      // Check if MFA is required
      if (user.mfaEnabled) {
        const mfaChallenge = await this.initiateMFA(user.id, user.preferredMFAMethod);
        return {
          success: false,
          requiresMFA: true,
          challengeId: mfaChallenge.id,
          availableMethods: user.mfaMethods
        };
      }
      
      // Generate secure tokens
      const tokens = await this.generateTokenPair(user.id, user.permissions);
      
      await this.auditLogger.logSuccessfulLogin(user.id);
      
      return {
        success: true,
        user: this.sanitizeUserData(user),
        tokens
      };
    } catch (error) {
      await this.auditLogger.logFailedLogin(credentials.username, error.message);
      throw error;
    }
  }
  
  private async verifyPassword(plaintext: string, hash: string): Promise<boolean> {
    // Use bcrypt or Argon2 for secure password hashing
    return await bcrypt.compare(plaintext, hash);
  }
  
  private async simulatePasswordCheck(): Promise<void> {
    // Simulate password checking time to prevent timing attacks
    await bcrypt.compare('dummy', '$2b$12$dummy.hash.to.prevent.timing.attacks');
  }
}
```

#### Role-Based Access Control (RBAC)
```typescript
interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  inherits?: string[]; // Role inheritance
}

class AuthorizationService {
  private roleCache: Map<string, Role> = new Map();
  
  async checkPermission(
    userId: string,
    resource: string,
    action: string,
    context?: Record<string, any>
  ): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    
    for (const role of userRoles) {
      const hasPermission = await this.roleHasPermission(role, resource, action, context);
      if (hasPermission) {
        return true;
      }
    }
    
    return false;
  }
  
  private async roleHasPermission(
    role: Role,
    resource: string,
    action: string,
    context?: Record<string, any>
  ): Promise<boolean> {
    // Check direct permissions
    for (const permission of role.permissions) {
      if (this.matchesPermission(permission, resource, action, context)) {
        return true;
      }
    }
    
    // Check inherited roles
    if (role.inherits) {
      for (const inheritedRoleId of role.inherits) {
        const inheritedRole = await this.getRole(inheritedRoleId);
        if (await this.roleHasPermission(inheritedRole, resource, action, context)) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  private matchesPermission(
    permission: Permission,
    resource: string,
    action: string,
    context?: Record<string, any>
  ): boolean {
    // Resource matching (supports wildcards)
    if (!this.matchesPattern(permission.resource, resource)) {
      return false;
    }
    
    // Action matching
    if (!this.matchesPattern(permission.action, action)) {
      return false;
    }
    
    // Condition evaluation
    if (permission.conditions && context) {
      return this.evaluateConditions(permission.conditions, context);
    }
    
    return true;
  }
}
```

### 2. Data Protection and Privacy

#### Data Encryption
```typescript
class DataEncryptionService {
  private readonly encryptionKey: Buffer;
  private readonly algorithm = 'aes-256-gcm';
  
  constructor(encryptionKey: string) {
    this.encryptionKey = Buffer.from(encryptionKey, 'hex');
  }
  
  /**
   * Encrypts sensitive data using AES-256-GCM
   */
  encrypt(data: string): EncryptedData {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.encryptionKey);
    cipher.setAAD(Buffer.from('additional-auth-data'));
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      algorithm: this.algorithm
    };
  }
  
  /**
   * Decrypts data encrypted with encrypt()
   */
  decrypt(encryptedData: EncryptedData): string {
    const decipher = crypto.createDecipher(
      encryptedData.algorithm,
      this.encryptionKey
    );
    
    decipher.setAAD(Buffer.from('additional-auth-data'));
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  /**
   * Encrypts data at rest for database storage
   */
  async encryptForStorage(data: any): Promise<string> {
    const serialized = JSON.stringify(data);
    const encrypted = this.encrypt(serialized);
    return Buffer.from(JSON.stringify(encrypted)).toString('base64');
  }
  
  /**
   * Decrypts data retrieved from database
   */
  async decryptFromStorage(encryptedString: string): Promise<any> {
    const encryptedData = JSON.parse(Buffer.from(encryptedString, 'base64').toString());
    const decrypted = this.decrypt(encryptedData);
    return JSON.parse(decrypted);
  }
}
```

#### Personal Data Handling
```typescript
interface PersonalDataProcessor {
  // Data minimization
  collectOnlyNecessaryData(data: any, purpose: string): any;
  
  // Data retention
  scheduleDataDeletion(dataId: string, retentionPeriod: number): void;
  deleteExpiredData(): Promise<void>;
  
  // Data portability
  exportUserData(userId: string): Promise<UserDataExport>;
  
  // Right to be forgotten
  deleteUserData(userId: string): Promise<void>;
}

class GDPRCompliantDataProcessor implements PersonalDataProcessor {
  private readonly dataRetentionPolicies: Map<string, number>;
  private readonly encryptionService: DataEncryptionService;
  
  constructor(config: DataProcessingConfig) {
    this.dataRetentionPolicies = new Map(config.retentionPolicies);
    this.encryptionService = new DataEncryptionService(config.encryptionKey);
  }
  
  collectOnlyNecessaryData(data: any, purpose: string): any {
    const allowedFields = this.getAllowedFieldsForPurpose(purpose);
    const minimizedData: any = {};
    
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        minimizedData[field] = data[field];
      }
    }
    
    return minimizedData;
  }
  
  async storePersonalData(data: any, dataType: string, userId: string): Promise<string> {
    // Encrypt personal data before storage
    const encryptedData = await this.encryptionService.encryptForStorage(data);
    
    // Store with metadata for compliance
    const record = {
      id: crypto.randomUUID(),
      userId,
      dataType,
      encryptedData,
      createdAt: new Date(),
      purpose: data.purpose,
      legalBasis: data.legalBasis,
      retentionPeriod: this.dataRetentionPolicies.get(dataType) || 365
    };
    
    await this.dataRepository.store(record);
    
    // Schedule automatic deletion
    this.scheduleDataDeletion(record.id, record.retentionPeriod);
    
    return record.id;
  }
  
  async deleteUserData(userId: string): Promise<void> {
    // Find all data associated with user
    const userDataRecords = await this.dataRepository.findByUserId(userId);
    
    for (const record of userDataRecords) {
      // Secure deletion - overwrite data multiple times
      await this.secureDelete(record.id);
    }
    
    // Log deletion for audit purposes
    await this.auditLogger.logDataDeletion(userId, userDataRecords.length);
  }
  
  private async secureDelete(recordId: string): Promise<void> {
    // Overwrite data multiple times before deletion
    const randomData = crypto.randomBytes(1024).toString('hex');
    
    for (let i = 0; i < 3; i++) {
      await this.dataRepository.overwrite(recordId, randomData);
    }
    
    await this.dataRepository.delete(recordId);
  }
}
```

### 3. Voice Data Security

#### Audio Data Protection
```typescript
class SecureVoiceProcessor {
  private readonly encryptionService: DataEncryptionService;
  private readonly audioSanitizer: AudioSanitizer;
  
  async processVoiceCommand(audioData: ArrayBuffer, userId: string): Promise<VoiceProcessingResult> {
    try {
      // Sanitize audio data to remove potential malicious content
      const sanitizedAudio = await this.audioSanitizer.sanitize(audioData);
      
      // Encrypt audio data before processing
      const encryptedAudio = await this.encryptionService.encryptForStorage(sanitizedAudio);
      
      // Process with Gemini API using encrypted data
      const transcription = await this.geminiClient.transcribe(sanitizedAudio);
      
      // Immediately delete audio data after processing
      await this.secureDeleteAudioData(encryptedAudio);
      
      // Process transcription (which may be stored temporarily)
      const result = await this.processTranscription(transcription, userId);
      
      return result;
    } catch (error) {
      // Ensure audio data is cleaned up even on error
      await this.cleanupAudioData(audioData);
      throw error;
    }
  }
  
  private async secureDeleteAudioData(audioData: any): Promise<void> {
    // Overwrite audio data in memory
    if (audioData instanceof ArrayBuffer) {
      const view = new Uint8Array(audioData);
      crypto.getRandomValues(view);
    }
    
    // Clear any temporary files
    await this.cleanupTemporaryFiles();
  }
  
  /**
   * Implements voice data retention policy
   */
  async handleVoiceDataRetention(userId: string): Promise<void> {
    const retentionPeriod = 24 * 60 * 60 * 1000; // 24 hours
    const cutoffDate = new Date(Date.now() - retentionPeriod);
    
    // Find and delete old voice data
    const oldRecords = await this.voiceDataRepository.findOlderThan(cutoffDate);
    
    for (const record of oldRecords) {
      await this.secureDeleteAudioData(record.audioData);
      await this.voiceDataRepository.delete(record.id);
    }
  }
}
```

### 4. Code Generation Security

#### Secure Code Generation
```typescript
class SecureCodeGenerator {
  private readonly codeValidator: SecurityCodeValidator;
  private readonly sanitizer: CodeSanitizer;
  
  async generateCode(prompt: string, context: GenerationContext): Promise<SecureGeneratedCode> {
    // Sanitize input prompt to prevent injection attacks
    const sanitizedPrompt = await this.sanitizer.sanitizePrompt(prompt);
    
    // Generate code with security constraints
    const generatedCode = await this.codeGenerator.generate(sanitizedPrompt, {
      ...context,
      securityLevel: 'high',
      allowedAPIs: this.getAllowedAPIs(context.userId),
      forbiddenPatterns: this.getForbiddenPatterns()
    });
    
    // Validate generated code for security issues
    const securityScan = await this.codeValidator.scanForVulnerabilities(generatedCode);
    
    if (securityScan.hasVulnerabilities) {
      throw new SecurityViolationError('Generated code contains security vulnerabilities', {
        vulnerabilities: securityScan.vulnerabilities,
        code: generatedCode
      });
    }
    
    // Additional static analysis
    const staticAnalysis = await this.performStaticAnalysis(generatedCode);
    
    return {
      code: generatedCode,
      securityScan,
      staticAnalysis,
      metadata: {
        generatedAt: new Date(),
        userId: context.userId,
        securityLevel: 'validated'
      }
    };
  }
  
  private async performStaticAnalysis(code: string): Promise<StaticAnalysisResult> {
    const issues: SecurityIssue[] = [];
    
    // Check for hardcoded secrets
    const secretPatterns = [
      /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi,
      /password\s*[:=]\s*['"][^'"]+['"]/gi,
      /secret\s*[:=]\s*['"][^'"]+['"]/gi,
      /token\s*[:=]\s*['"][^'"]+['"]/gi
    ];
    
    for (const pattern of secretPatterns) {
      const matches = code.match(pattern);
      if (matches) {
        issues.push({
          type: 'HARDCODED_SECRET',
          severity: 'HIGH',
          message: 'Potential hardcoded secret detected',
          matches
        });
      }
    }
    
    // Check for SQL injection vulnerabilities
    const sqlInjectionPatterns = [
      /query\s*\+\s*['"][^'"]*['"]/gi,
      /execute\s*\(\s*['"][^'"]*['"]\s*\+/gi
    ];
    
    for (const pattern of sqlInjectionPatterns) {
      const matches = code.match(pattern);
      if (matches) {
        issues.push({
          type: 'SQL_INJECTION_RISK',
          severity: 'HIGH',
          message: 'Potential SQL injection vulnerability',
          matches
        });
      }
    }
    
    // Check for XSS vulnerabilities
    const xssPatterns = [
      /innerHTML\s*=\s*[^;]+/gi,
      /document\.write\s*\(/gi,
      /eval\s*\(/gi
    ];
    
    for (const pattern of xssPatterns) {
      const matches = code.match(pattern);
      if (matches) {
        issues.push({
          type: 'XSS_RISK',
          severity: 'MEDIUM',
          message: 'Potential XSS vulnerability',
          matches
        });
      }
    }
    
    return {
      issues,
      riskLevel: this.calculateRiskLevel(issues),
      recommendations: this.generateSecurityRecommendations(issues)
    };
  }
}
```

### 5. API Security

#### Rate Limiting and DDoS Protection
```typescript
class SecurityMiddleware {
  private readonly rateLimiter: RateLimiter;
  private readonly ddosProtection: DDoSProtection;
  private readonly ipWhitelist: Set<string>;
  
  constructor(config: SecurityConfig) {
    this.rateLimiter = new RateLimiter(config.rateLimits);
    this.ddosProtection = new DDoSProtection(config.ddosConfig);
    this.ipWhitelist = new Set(config.whitelistedIPs);
  }
  
  async authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check IP whitelist for admin endpoints
      if (req.path.startsWith('/admin') && !this.ipWhitelist.has(req.ip)) {
        throw new SecurityError('Access denied from this IP address');
      }
      
      // Rate limiting
      await this.rateLimiter.checkLimit(req.ip, req.path);
      
      // DDoS protection
      await this.ddosProtection.checkRequest(req);
      
      // Validate JWT token
      const token = this.extractToken(req);
      if (!token) {
        throw new AuthenticationError('No authentication token provided');
      }
      
      const payload = await this.validateToken(token);
      
      // Check token expiration
      if (payload.exp < Date.now() / 1000) {
        throw new AuthenticationError('Token has expired');
      }
      
      // Check token permissions for this endpoint
      const hasPermission = await this.checkEndpointPermission(payload.userId, req.path, req.method);
      if (!hasPermission) {
        throw new AuthorizationError('Insufficient permissions for this endpoint');
      }
      
      // Add user context to request
      req.user = payload;
      next();
    } catch (error) {
      this.handleSecurityError(error, req, res);
    }
  }
  
  private async validateToken(token: string): Promise<JWTPayload> {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
      
      // Check if token is in blacklist (for logout/revocation)
      const isBlacklisted = await this.tokenBlacklist.isBlacklisted(token);
      if (isBlacklisted) {
        throw new AuthenticationError('Token has been revoked');
      }
      
      return payload;
    } catch (error) {
      throw new AuthenticationError('Invalid authentication token');
    }
  }
}
```

### 6. Security Monitoring and Incident Response

#### Security Event Monitoring
```typescript
class SecurityMonitor {
  private readonly alertThresholds: Map<string, number>;
  private readonly incidentResponse: IncidentResponseService;
  
  constructor(config: SecurityMonitorConfig) {
    this.alertThresholds = new Map(config.alertThresholds);
    this.incidentResponse = new IncidentResponseService(config.incidentConfig);
  }
  
  async monitorSecurityEvents(): Promise<void> {
    // Monitor failed authentication attempts
    const failedLogins = await this.getFailedLoginCount(5 * 60 * 1000); // Last 5 minutes
    if (failedLogins > this.alertThresholds.get('failed_logins')!) {
      await this.triggerAlert('BRUTE_FORCE_ATTACK', {
        count: failedLogins,
        timeWindow: '5 minutes'
      });
    }
    
    // Monitor unusual API usage patterns
    const apiUsage = await this.getAPIUsagePatterns();
    const anomalies = this.detectAnomalies(apiUsage);
    if (anomalies.length > 0) {
      await this.triggerAlert('UNUSUAL_API_USAGE', { anomalies });
    }
    
    // Monitor for potential data exfiltration
    const dataTransfers = await this.getDataTransferVolumes();
    if (dataTransfers.volume > this.alertThresholds.get('data_transfer')!) {
      await this.triggerAlert('POTENTIAL_DATA_EXFILTRATION', dataTransfers);
    }
  }
  
  private async triggerAlert(alertType: string, details: any): Promise<void> {
    const alert: SecurityAlert = {
      id: crypto.randomUUID(),
      type: alertType,
      severity: this.calculateSeverity(alertType, details),
      timestamp: new Date(),
      details,
      status: 'ACTIVE'
    };
    
    // Log the alert
    await this.securityLogger.logAlert(alert);
    
    // Trigger automated response if configured
    await this.incidentResponse.handleAlert(alert);
    
    // Notify security team
    await this.notificationService.notifySecurityTeam(alert);
  }
  
  async handleSecurityIncident(incident: SecurityIncident): Promise<void> {
    // Immediate containment actions
    if (incident.severity === 'CRITICAL') {
      await this.emergencyContainment(incident);
    }
    
    // Evidence collection
    await this.collectEvidence(incident);
    
    // Forensic analysis
    const analysis = await this.performForensicAnalysis(incident);
    
    // Recovery actions
    await this.executeRecoveryPlan(incident, analysis);
    
    // Post-incident review
    await this.schedulePostIncidentReview(incident);
  }
}
```

### 7. Compliance and Audit

#### Audit Logging
```typescript
class SecurityAuditLogger {
  private readonly auditDatabase: AuditDatabase;
  private readonly encryptionService: DataEncryptionService;
  
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    const auditRecord: AuditRecord = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      eventType: event.type,
      userId: event.userId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      resource: event.resource,
      action: event.action,
      outcome: event.outcome,
      details: await this.encryptionService.encryptForStorage(event.details),
      riskLevel: this.calculateRiskLevel(event)
    };
    
    // Store in tamper-evident audit log
    await this.auditDatabase.store(auditRecord);
    
    // Real-time alerting for high-risk events
    if (auditRecord.riskLevel === 'HIGH') {
      await this.triggerRealTimeAlert(auditRecord);
    }
  }
  
  async generateComplianceReport(
    startDate: Date,
    endDate: Date,
    complianceFramework: string
  ): Promise<ComplianceReport> {
    const auditRecords = await this.auditDatabase.findByDateRange(startDate, endDate);
    
    const report: ComplianceReport = {
      framework: complianceFramework,
      period: { start: startDate, end: endDate },
      totalEvents: auditRecords.length,
      securityEvents: this.categorizeSecurityEvents(auditRecords),
      complianceStatus: await this.assessCompliance(auditRecords, complianceFramework),
      recommendations: await this.generateRecommendations(auditRecords)
    };
    
    return report;
  }
}
```

---

*These security rules must be strictly followed and regularly updated to address emerging threats and maintain compliance with security standards and regulations.*

