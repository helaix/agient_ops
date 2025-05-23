/**
 * Linear API Client for Label Migration
 * 
 * Handles all Linear API interactions for the label migration process.
 * Uses the provided LINEAR_API_KEY environment variable.
 */

interface LinearApiResponse<T> {
  data: T;
  errors?: Array<{ message: string; extensions?: any }>;
}

interface LinearLabel {
  id: string;
  name: string;
  color?: string;
  description?: string;
  team?: {
    id: string;
    name: string;
  };
}

interface LinearIssue {
  id: string;
  identifier: string;
  title: string;
  description?: string;
  labels: {
    nodes: LinearLabel[];
  };
  team: {
    id: string;
    name: string;
  };
  state: {
    id: string;
    name: string;
    type: string;
  };
  priority: number;
  assignee?: {
    id: string;
    name: string;
  };
}

interface CreateLabelInput {
  name: string;
  color?: string;
  description?: string;
  teamId: string;
}

interface UpdateIssueInput {
  id: string;
  labelIds?: string[];
}

export class LinearApiClient {
  private apiKey: string;
  private baseUrl = 'https://api.linear.app/graphql';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.LINEAR_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('LINEAR_API_KEY environment variable is required');
    }
  }

  /**
   * Execute GraphQL query
   */
  private async query<T>(query: string, variables?: any): Promise<LinearApiResponse<T>> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`Linear API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.errors && result.errors.length > 0) {
      throw new Error(`GraphQL errors: ${result.errors.map((e: any) => e.message).join(', ')}`);
    }

    return result;
  }

  /**
   * Get all labels for a team
   */
  async getTeamLabels(teamId: string): Promise<LinearLabel[]> {
    const query = `
      query GetTeamLabels($teamId: String!) {
        team(id: $teamId) {
          labels {
            nodes {
              id
              name
              color
              description
            }
          }
        }
      }
    `;

    const response = await this.query<{ team: { labels: { nodes: LinearLabel[] } } }>(
      query,
      { teamId }
    );

    return response.data.team.labels.nodes;
  }

  /**
   * Get all issues for a team with their labels
   */
  async getTeamIssues(teamId: string, first: number = 100, after?: string): Promise<{
    issues: LinearIssue[];
    hasNextPage: boolean;
    endCursor?: string;
  }> {
    const query = `
      query GetTeamIssues($teamId: String!, $first: Int!, $after: String) {
        team(id: $teamId) {
          issues(first: $first, after: $after) {
            nodes {
              id
              identifier
              title
              description
              labels {
                nodes {
                  id
                  name
                  color
                  description
                }
              }
              team {
                id
                name
              }
              state {
                id
                name
                type
              }
              priority
              assignee {
                id
                name
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    `;

    const response = await this.query<{
      team: {
        issues: {
          nodes: LinearIssue[];
          pageInfo: {
            hasNextPage: boolean;
            endCursor?: string;
          };
        };
      };
    }>(query, { teamId, first, after });

    return {
      issues: response.data.team.issues.nodes,
      hasNextPage: response.data.team.issues.pageInfo.hasNextPage,
      endCursor: response.data.team.issues.pageInfo.endCursor,
    };
  }

  /**
   * Get all issues for a team (paginated)
   */
  async getAllTeamIssues(teamId: string): Promise<LinearIssue[]> {
    const allIssues: LinearIssue[] = [];
    let hasNextPage = true;
    let after: string | undefined;

    while (hasNextPage) {
      const result = await this.getTeamIssues(teamId, 100, after);
      allIssues.push(...result.issues);
      hasNextPage = result.hasNextPage;
      after = result.endCursor;

      // Add delay to avoid rate limiting
      if (hasNextPage) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return allIssues;
  }

  /**
   * Create a new label
   */
  async createLabel(input: CreateLabelInput): Promise<LinearLabel> {
    const mutation = `
      mutation CreateLabel($input: IssueLabelCreateInput!) {
        issueLabelCreate(input: $input) {
          issueLabel {
            id
            name
            color
            description
          }
          success
        }
      }
    `;

    const response = await this.query<{
      issueLabelCreate: {
        issueLabel: LinearLabel;
        success: boolean;
      };
    }>(mutation, { input });

    if (!response.data.issueLabelCreate.success) {
      throw new Error(`Failed to create label: ${input.name}`);
    }

    return response.data.issueLabelCreate.issueLabel;
  }

  /**
   * Update an issue's labels
   */
  async updateIssueLabels(issueId: string, labelIds: string[]): Promise<boolean> {
    const mutation = `
      mutation UpdateIssue($id: String!, $input: IssueUpdateInput!) {
        issueUpdate(id: $id, input: $input) {
          success
          issue {
            id
            identifier
            labels {
              nodes {
                id
                name
              }
            }
          }
        }
      }
    `;

    const response = await this.query<{
      issueUpdate: {
        success: boolean;
        issue: {
          id: string;
          identifier: string;
          labels: { nodes: LinearLabel[] };
        };
      };
    }>(mutation, {
      id: issueId,
      input: { labelIds }
    });

    return response.data.issueUpdate.success;
  }

  /**
   * Delete a label
   */
  async deleteLabel(labelId: string): Promise<boolean> {
    const mutation = `
      mutation DeleteLabel($id: String!) {
        issueLabelDelete(id: $id) {
          success
        }
      }
    `;

    const response = await this.query<{
      issueLabelDelete: {
        success: boolean;
      };
    }>(mutation, { id: labelId });

    return response.data.issueLabelDelete.success;
  }

  /**
   * Get team information
   */
  async getTeam(teamId: string): Promise<{ id: string; name: string; key: string }> {
    const query = `
      query GetTeam($teamId: String!) {
        team(id: $teamId) {
          id
          name
          key
        }
      }
    `;

    const response = await this.query<{
      team: { id: string; name: string; key: string };
    }>(query, { teamId });

    return response.data.team;
  }

  /**
   * Search for labels by name
   */
  async searchLabels(teamId: string, searchTerm: string): Promise<LinearLabel[]> {
    const query = `
      query SearchLabels($teamId: String!, $filter: IssueLabelFilter) {
        team(id: $teamId) {
          labels(filter: $filter) {
            nodes {
              id
              name
              color
              description
            }
          }
        }
      }
    `;

    const response = await this.query<{
      team: { labels: { nodes: LinearLabel[] } };
    }>(query, {
      teamId,
      filter: {
        name: { contains: searchTerm }
      }
    });

    return response.data.team.labels.nodes;
  }

  /**
   * Batch update multiple issues
   */
  async batchUpdateIssues(updates: Array<{ issueId: string; labelIds: string[] }>): Promise<{
    successful: number;
    failed: number;
    errors: string[];
  }> {
    const results = {
      successful: 0,
      failed: 0,
      errors: []
    };

    for (const update of updates) {
      try {
        const success = await this.updateIssueLabels(update.issueId, update.labelIds);
        if (success) {
          results.successful++;
        } else {
          results.failed++;
          results.errors.push(`Failed to update issue ${update.issueId}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`Error updating issue ${update.issueId}: ${error}`);
      }

      // Add delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    return results;
  }

  /**
   * Validate API connection and permissions
   */
  async validateConnection(): Promise<{ valid: boolean; user?: any; error?: string }> {
    try {
      const query = `
        query GetViewer {
          viewer {
            id
            name
            email
          }
        }
      `;

      const response = await this.query<{
        viewer: { id: string; name: string; email: string };
      }>(query);

      return {
        valid: true,
        user: response.data.viewer
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}

