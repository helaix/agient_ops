import { Env } from '@/types';

/**
 * Signature validation utilities for webhook security
 * Supports GitHub, Linear, and Slack webhook signature validation
 */
export class SignatureValidator {
  constructor(private env: Env) {}

  /**
   * Validate GitHub webhook signature using HMAC-SHA256
   */
  async validateGitHubSignature(
    payload: string,
    signature: string,
    secret: string
  ): Promise<boolean> {
    try {
      // GitHub signature format: sha256=<hash>
      if (!signature.startsWith('sha256=')) {
        return false;
      }

      const expectedSignature = signature.slice(7); // Remove 'sha256=' prefix
      
      // Create HMAC-SHA256 hash
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

      const computedSignature = Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Constant-time comparison to prevent timing attacks
      return this.constantTimeCompare(expectedSignature, computedSignature);
    } catch (error) {
      console.error('GitHub signature validation error:', error);
      return false;
    }
  }

  /**
   * Validate Linear webhook signature using HMAC-SHA256
   */
  async validateLinearSignature(
    payload: string,
    signature: string,
    secret: string
  ): Promise<boolean> {
    try {
      // Linear uses similar format to GitHub
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

      const computedSignature = Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      return this.constantTimeCompare(signature, computedSignature);
    } catch (error) {
      console.error('Linear signature validation error:', error);
      return false;
    }
  }

  /**
   * Validate Slack webhook signature using HMAC-SHA256
   * Slack uses a different format with timestamp validation
   */
  async validateSlackSignature(
    payload: string,
    signature: string,
    secret: string,
    timestamp: string
  ): Promise<boolean> {
    try {
      // Check timestamp to prevent replay attacks (within 5 minutes)
      const currentTime = Math.floor(Date.now() / 1000);
      const requestTime = parseInt(timestamp, 10);
      
      if (Math.abs(currentTime - requestTime) > 300) {
        console.warn('Slack webhook timestamp too old');
        return false;
      }

      // Slack signature format: v0=<hash>
      if (!signature.startsWith('v0=')) {
        return false;
      }

      const expectedSignature = signature.slice(3); // Remove 'v0=' prefix
      
      // Create the signing string: version:timestamp:body
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

      const computedSignature = Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      return this.constantTimeCompare(expectedSignature, computedSignature);
    } catch (error) {
      console.error('Slack signature validation error:', error);
      return false;
    }
  }

  /**
   * Validate webhook signature based on source
   */
  async validateWebhookSignature(
    source: string,
    payload: string,
    signature: string,
    timestamp?: string
  ): Promise<boolean> {
    try {
      let secret: string;
      
      switch (source.toLowerCase()) {
        case 'github':
          secret = this.env.GITHUB_WEBHOOK_SECRET;
          return await this.validateGitHubSignature(payload, signature, secret);
          
        case 'linear':
          secret = this.env.LINEAR_WEBHOOK_SECRET;
          return await this.validateLinearSignature(payload, signature, secret);
          
        case 'slack':
          secret = this.env.SLACK_WEBHOOK_SECRET;
          if (!timestamp) {
            throw new Error('Timestamp required for Slack signature validation');
          }
          return await this.validateSlackSignature(payload, signature, secret, timestamp);
          
        default:
          console.warn(`Unknown webhook source: ${source}`);
          return false;
      }
    } catch (error) {
      console.error(`Webhook signature validation error for ${source}:`, error);
      return false;
    }
  }

  /**
   * Constant-time string comparison to prevent timing attacks
   */
  private constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  /**
   * Extract signature from request headers based on source
   */
  extractSignature(source: string, headers: Record<string, string>): {
    signature?: string;
    timestamp?: string;
  } {
    switch (source.toLowerCase()) {
      case 'github':
        return {
          signature: headers['x-hub-signature-256'] || headers['X-Hub-Signature-256']
        };
        
      case 'linear':
        return {
          signature: headers['linear-signature'] || headers['Linear-Signature']
        };
        
      case 'slack':
        return {
          signature: headers['x-slack-signature'] || headers['X-Slack-Signature'],
          timestamp: headers['x-slack-request-timestamp'] || headers['X-Slack-Request-Timestamp']
        };
        
      default:
        return {};
    }
  }

  /**
   * Validate request headers for required signature fields
   */
  validateSignatureHeaders(source: string, headers: Record<string, string>): boolean {
    const { signature, timestamp } = this.extractSignature(source, headers);
    
    switch (source.toLowerCase()) {
      case 'github':
      case 'linear':
        return !!signature;
        
      case 'slack':
        return !!(signature && timestamp);
        
      default:
        return false;
    }
  }
}

