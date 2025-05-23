import { describe, it, expect, beforeEach } from 'vitest';
import { SignatureValidator } from '../../src/utils/signature-validator';
import { Env } from '../../src/types';

// Mock environment
const mockEnv: Env = {
  GITHUB_WEBHOOK_SECRET: 'github-secret-key',
  LINEAR_WEBHOOK_SECRET: 'linear-secret-key',
  SLACK_WEBHOOK_SECRET: 'slack-secret-key',
  AGENT_API_KEY: 'agent-api-key',
  ENVIRONMENT: 'test',
  MAX_EVENT_SIZE: '1048576',
  DEFAULT_RETRY_ATTEMPTS: '3',
  DEFAULT_RETRY_DELAY: '1000',
  MAX_QUEUE_SIZE: '10000',
  RATE_LIMIT_WINDOW: '60000',
  DEFAULT_RATE_LIMIT: '1000'
} as any;

describe('SignatureValidator', () => {
  let validator: SignatureValidator;

  beforeEach(() => {
    validator = new SignatureValidator(mockEnv);
  });

  describe('GitHub signature validation', () => {
    it('should validate correct GitHub signature', async () => {
      const payload = '{"test": "data"}';
      const secret = 'test-secret';
      
      // Create expected signature
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      
      const signatureBuffer = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(payload)
      );
      
      const signature = 'sha256=' + Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const isValid = await validator.validateGitHubSignature(payload, signature, secret);
      expect(isValid).toBe(true);
    });

    it('should reject invalid GitHub signature', async () => {
      const payload = '{"test": "data"}';
      const signature = 'sha256=invalid-signature';
      const secret = 'test-secret';

      const isValid = await validator.validateGitHubSignature(payload, signature, secret);
      expect(isValid).toBe(false);
    });

    it('should reject signature without sha256 prefix', async () => {
      const payload = '{"test": "data"}';
      const signature = 'invalid-format';
      const secret = 'test-secret';

      const isValid = await validator.validateGitHubSignature(payload, signature, secret);
      expect(isValid).toBe(false);
    });
  });

  describe('Linear signature validation', () => {
    it('should validate correct Linear signature', async () => {
      const payload = '{"test": "data"}';
      const secret = 'test-secret';
      
      // Create expected signature
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      
      const signatureBuffer = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(payload)
      );
      
      const signature = Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const isValid = await validator.validateLinearSignature(payload, signature, secret);
      expect(isValid).toBe(true);
    });

    it('should reject invalid Linear signature', async () => {
      const payload = '{"test": "data"}';
      const signature = 'invalid-signature';
      const secret = 'test-secret';

      const isValid = await validator.validateLinearSignature(payload, signature, secret);
      expect(isValid).toBe(false);
    });
  });

  describe('Slack signature validation', () => {
    it('should validate correct Slack signature with valid timestamp', async () => {
      const payload = '{"test": "data"}';
      const secret = 'test-secret';
      const timestamp = Math.floor(Date.now() / 1000).toString();
      
      // Create expected signature
      const signingString = `v0:${timestamp}:${payload}`;
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      
      const signatureBuffer = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(signingString)
      );
      
      const signature = 'v0=' + Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const isValid = await validator.validateSlackSignature(payload, signature, secret, timestamp);
      expect(isValid).toBe(true);
    });

    it('should reject Slack signature with old timestamp', async () => {
      const payload = '{"test": "data"}';
      const secret = 'test-secret';
      const oldTimestamp = (Math.floor(Date.now() / 1000) - 400).toString(); // 400 seconds ago
      const signature = 'v0=some-signature';

      const isValid = await validator.validateSlackSignature(payload, signature, secret, oldTimestamp);
      expect(isValid).toBe(false);
    });

    it('should reject signature without v0 prefix', async () => {
      const payload = '{"test": "data"}';
      const secret = 'test-secret';
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signature = 'invalid-format';

      const isValid = await validator.validateSlackSignature(payload, signature, secret, timestamp);
      expect(isValid).toBe(false);
    });
  });

  describe('extractSignature', () => {
    it('should extract GitHub signature from headers', () => {
      const headers = {
        'x-hub-signature-256': 'sha256=test-signature'
      };

      const result = validator.extractSignature('github', headers);
      expect(result.signature).toBe('sha256=test-signature');
      expect(result.timestamp).toBeUndefined();
    });

    it('should extract Linear signature from headers', () => {
      const headers = {
        'linear-signature': 'test-signature'
      };

      const result = validator.extractSignature('linear', headers);
      expect(result.signature).toBe('test-signature');
      expect(result.timestamp).toBeUndefined();
    });

    it('should extract Slack signature and timestamp from headers', () => {
      const headers = {
        'x-slack-signature': 'v0=test-signature',
        'x-slack-request-timestamp': '1234567890'
      };

      const result = validator.extractSignature('slack', headers);
      expect(result.signature).toBe('v0=test-signature');
      expect(result.timestamp).toBe('1234567890');
    });

    it('should return empty object for unknown source', () => {
      const headers = {
        'some-header': 'value'
      };

      const result = validator.extractSignature('unknown', headers);
      expect(result.signature).toBeUndefined();
      expect(result.timestamp).toBeUndefined();
    });
  });

  describe('validateSignatureHeaders', () => {
    it('should validate GitHub headers', () => {
      const headers = {
        'x-hub-signature-256': 'sha256=test-signature'
      };

      const isValid = validator.validateSignatureHeaders('github', headers);
      expect(isValid).toBe(true);
    });

    it('should validate Linear headers', () => {
      const headers = {
        'linear-signature': 'test-signature'
      };

      const isValid = validator.validateSignatureHeaders('linear', headers);
      expect(isValid).toBe(true);
    });

    it('should validate Slack headers', () => {
      const headers = {
        'x-slack-signature': 'v0=test-signature',
        'x-slack-request-timestamp': '1234567890'
      };

      const isValid = validator.validateSignatureHeaders('slack', headers);
      expect(isValid).toBe(true);
    });

    it('should reject missing GitHub signature', () => {
      const headers = {};

      const isValid = validator.validateSignatureHeaders('github', headers);
      expect(isValid).toBe(false);
    });

    it('should reject missing Slack timestamp', () => {
      const headers = {
        'x-slack-signature': 'v0=test-signature'
      };

      const isValid = validator.validateSignatureHeaders('slack', headers);
      expect(isValid).toBe(false);
    });

    it('should reject unknown source', () => {
      const headers = {
        'some-header': 'value'
      };

      const isValid = validator.validateSignatureHeaders('unknown', headers);
      expect(isValid).toBe(false);
    });
  });
});

