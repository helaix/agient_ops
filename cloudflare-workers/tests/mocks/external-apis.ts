import { vi } from 'vitest';

/**
 * Mock GitHub API for testing
 */
export class MockGitHubAPI {
  private pullRequests = new Map<string, any>();
  private comments = new Map<string, any[]>();
  private reviewers = new Map<string, string[]>();
  
  // Mock methods
  getPullRequest = vi.fn(async (owner: string, repo: string, number: number): Promise<any> => {
    const key = `${owner}/${repo}/${number}`;
    return this.pullRequests.get(key) || {
      id: number,
      number,
      title: `Mock PR ${number}`,
      body: 'Mock PR description',
      user: { login: 'mock-user' },
      base: { ref: 'main' },
      head: { ref: 'feature-branch' },
      state: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  });
  
  assignReviewers = vi.fn(async (owner: string, repo: string, number: number, reviewers: string[]): Promise<any> => {
    const key = `${owner}/${repo}/${number}`;
    this.reviewers.set(key, reviewers);
    return {
      requested_reviewers: reviewers.map(login => ({ login }))
    };
  });
  
  createComment = vi.fn(async (owner: string, repo: string, number: number, body: string): Promise<any> => {
    const key = `${owner}/${repo}/${number}`;
    const comments = this.comments.get(key) || [];
    const comment = {
      id: Math.random(),
      body,
      user: { login: 'mock-bot' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    comments.push(comment);
    this.comments.set(key, comments);
    return comment;
  });
  
  getReviews = vi.fn(async (owner: string, repo: string, number: number): Promise<any[]> => {
    return [
      {
        id: 1,
        user: { login: 'reviewer1' },
        state: 'APPROVED',
        submitted_at: new Date().toISOString()
      }
    ];
  });
  
  createReview = vi.fn(async (owner: string, repo: string, number: number, review: any): Promise<any> => {
    return {
      id: Math.random(),
      user: { login: 'mock-bot' },
      state: review.event || 'COMMENTED',
      body: review.body,
      submitted_at: new Date().toISOString()
    };
  });
  
  // Test utilities
  setPullRequest(owner: string, repo: string, number: number, pr: any): void {
    const key = `${owner}/${repo}/${number}`;
    this.pullRequests.set(key, pr);
  }
  
  getComments(owner: string, repo: string, number: number): any[] {
    const key = `${owner}/${repo}/${number}`;
    return this.comments.get(key) || [];
  }
  
  getAssignedReviewers(owner: string, repo: string, number: number): string[] {
    const key = `${owner}/${repo}/${number}`;
    return this.reviewers.get(key) || [];
  }
  
  reset(): void {
    this.pullRequests.clear();
    this.comments.clear();
    this.reviewers.clear();
    vi.clearAllMocks();
  }
}

/**
 * Mock Linear API for testing
 */
export class MockLinearAPI {
  private issues = new Map<string, any>();
  private comments = new Map<string, any[]>();
  private teams = new Map<string, any>();
  private users = new Map<string, any>();
  
  // Mock methods
  getIssue = vi.fn(async (issueId: string): Promise<any> => {
    return this.issues.get(issueId) || {
      id: issueId,
      title: `Mock Issue ${issueId}`,
      description: 'Mock issue description',
      state: { name: 'Todo' },
      assignee: { name: 'Mock User' },
      team: { name: 'Mock Team' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });
  
  updateIssue = vi.fn(async (issueId: string, update: any): Promise<any> => {
    const existing = this.issues.get(issueId) || {};
    const updated = { ...existing, ...update, updatedAt: new Date().toISOString() };
    this.issues.set(issueId, updated);
    return updated;
  });
  
  createComment = vi.fn(async (issueId: string, body: string): Promise<any> => {
    const comments = this.comments.get(issueId) || [];
    const comment = {
      id: `comment-${Math.random()}`,
      body,
      user: { name: 'Mock Bot' },
      createdAt: new Date().toISOString()
    };
    comments.push(comment);
    this.comments.set(issueId, comments);
    return comment;
  });
  
  getComments = vi.fn(async (issueId: string): Promise<any[]> => {
    return this.comments.get(issueId) || [];
  });
  
  getTeams = vi.fn(async (): Promise<any[]> => {
    return Array.from(this.teams.values());
  });
  
  getUsers = vi.fn(async (): Promise<any[]> => {
    return Array.from(this.users.values());
  });
  
  createIssue = vi.fn(async (issue: any): Promise<any> => {
    const newIssue = {
      id: `issue-${Math.random()}`,
      ...issue,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.issues.set(newIssue.id, newIssue);
    return newIssue;
  });
  
  // Test utilities
  setIssue(issueId: string, issue: any): void {
    this.issues.set(issueId, issue);
  }
  
  setTeam(teamId: string, team: any): void {
    this.teams.set(teamId, team);
  }
  
  setUser(userId: string, user: any): void {
    this.users.set(userId, user);
  }
  
  getIssueComments(issueId: string): any[] {
    return this.comments.get(issueId) || [];
  }
  
  reset(): void {
    this.issues.clear();
    this.comments.clear();
    this.teams.clear();
    this.users.clear();
    vi.clearAllMocks();
  }
}

/**
 * Mock Slack API for testing
 */
export class MockSlackAPI {
  private channels = new Map<string, any>();
  private messages = new Map<string, any[]>();
  private users = new Map<string, any>();
  
  // Mock methods
  sendMessage = vi.fn(async (channel: string, message: string): Promise<any> => {
    const messages = this.messages.get(channel) || [];
    const msg = {
      ts: Date.now().toString(),
      text: message,
      user: 'mock-bot',
      channel
    };
    messages.push(msg);
    this.messages.set(channel, messages);
    return msg;
  });
  
  createChannel = vi.fn(async (name: string): Promise<any> => {
    const channel = {
      id: `C${Math.random().toString(36).substr(2, 9)}`,
      name,
      created: Math.floor(Date.now() / 1000),
      creator: 'mock-bot'
    };
    this.channels.set(channel.id, channel);
    return channel;
  });
  
  inviteToChannel = vi.fn(async (channel: string, users: string[]): Promise<any> => {
    return {
      ok: true,
      channel: {
        id: channel,
        members: users
      }
    };
  });
  
  getChannelInfo = vi.fn(async (channel: string): Promise<any> => {
    return this.channels.get(channel) || {
      id: channel,
      name: 'mock-channel',
      created: Math.floor(Date.now() / 1000)
    };
  });
  
  getUserInfo = vi.fn(async (user: string): Promise<any> => {
    return this.users.get(user) || {
      id: user,
      name: 'mock-user',
      real_name: 'Mock User'
    };
  });
  
  postEphemeral = vi.fn(async (channel: string, user: string, text: string): Promise<any> => {
    return {
      ok: true,
      message_ts: Date.now().toString()
    };
  });
  
  // Test utilities
  setChannel(channelId: string, channel: any): void {
    this.channels.set(channelId, channel);
  }
  
  setUser(userId: string, user: any): void {
    this.users.set(userId, user);
  }
  
  getChannelMessages(channel: string): any[] {
    return this.messages.get(channel) || [];
  }
  
  reset(): void {
    this.channels.clear();
    this.messages.clear();
    this.users.clear();
    vi.clearAllMocks();
  }
}

