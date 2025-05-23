import { BaseAgent } from './base-agent';
import { AgentTask, TaskResult, AgentMessage, AgentConfig, WorkflowPattern } from '../types';

/**
 * Pattern Bridge Agent - Apply and evolve workflow patterns for continuous improvement
 * 
 * Purpose: Apply and evolve workflow patterns for continuous improvement
 * Key Capabilities:
 * - Pattern matching and recommendation
 * - Real-time effectiveness tracking
 * - Dynamic pattern adaptation
 * - Pattern library evolution
 */
export class PatternBridgeAgent extends BaseAgent {
  private patternLibrary: Map<string, WorkflowPattern> = new Map();
  private activePatterns: Map<string, {
    pattern: WorkflowPattern;
    appliedAt: Date;
    workflowId: string;
    metrics: {
      startTime: Date;
      expectedDuration: number;
      actualDuration?: number;
      successRate: number;
      userSatisfaction?: number;
    };
  }> = new Map();

  private patternMetrics: {
    totalApplications: number;
    successfulApplications: number;
    averageEffectivenessImprovement: number;
    patternEvolutionCount: number;
  } = {
    totalApplications: 0,
    successfulApplications: 0,
    averageEffectivenessImprovement: 0,
    patternEvolutionCount: 0
  };

  private learningData: Array<{
    patternId: string;
    context: any;
    outcome: 'success' | 'failure' | 'partial';
    metrics: any;
    feedback: string;
    timestamp: Date;
  }> = [];

  protected async getDefaultConfig(): Promise<AgentConfig> {
    return {
      type: 'pattern-bridge',
      name: 'Pattern Bridge Agent',
      description: 'Apply and evolve workflow patterns for continuous improvement',
      maxConcurrentTasks: 12,
      timeoutMs: 30000,
      retryAttempts: 3,
      capabilities: [
        'pattern_matching',
        'pattern_recommendation',
        'effectiveness_tracking',
        'pattern_adaptation',
        'library_evolution',
        'machine_learning'
      ],
      dependencies: []
    };
  }

  protected async onInitialize(): Promise<void> {
    // Initialize pattern library with base patterns
    await this.loadBasePatterns();
    
    // Set up event listeners
    this.on('pattern_applied', this.handlePatternApplied.bind(this));
    this.on('workflow_completed', this.handleWorkflowCompleted.bind(this));
    this.on('pattern_feedback', this.handlePatternFeedback.bind(this));
    
    // Start periodic pattern evolution
    this.startPatternEvolution();
  }

  protected async processTask(task: AgentTask): Promise<TaskResult> {
    switch (task.type) {
      case 'recommend_patterns':
        return await this.recommendPatterns(task);
      case 'apply_pattern':
        return await this.applyPattern(task);
      case 'track_pattern_effectiveness':
        return await this.trackPatternEffectiveness(task);
      case 'evolve_pattern':
        return await this.evolvePattern(task);
      case 'analyze_pattern_performance':
        return await this.analyzePatternPerformance(task);
      case 'create_new_pattern':
        return await this.createNewPattern(task);
      case 'update_pattern_library':
        return await this.updatePatternLibrary(task);
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  protected async handleMessage(message: AgentMessage): Promise<void> {
    switch (message.type) {
      case 'workflow_context_request':
        await this.handleWorkflowContextRequest(message);
        break;
      case 'pattern_library_query':
        await this.handlePatternLibraryQuery(message);
        break;
      case 'pattern_effectiveness_query':
        await this.handlePatternEffectivenessQuery(message);
        break;
      case 'submit_pattern_feedback':
        await this.handleSubmitPatternFeedback(message.payload);
        break;
      default:
        await super.handleMessage(message);
    }
  }

  // Task processing methods

  private async recommendPatterns(task: AgentTask): Promise<TaskResult> {
    const { workflowContext, requirements = {}, constraints = {} } = task.payload;
    
    try {
      const matchingPatterns = await this.findMatchingPatterns(workflowContext, requirements);
      const rankedPatterns = await this.rankPatternsByEffectiveness(matchingPatterns, workflowContext);
      const recommendations = await this.generateRecommendations(rankedPatterns, constraints);

      return {
        taskId: task.id,
        success: true,
        data: {
          recommendations,
          totalPatternsConsidered: matchingPatterns.length,
          context: workflowContext
        },
        completedAt: new Date(),
        duration: 0
      };
    } catch (error) {
      throw new Error(`Failed to recommend patterns: ${(error as Error).message}`);
    }
  }

  private async applyPattern(task: AgentTask): Promise<TaskResult> {
    const { patternId, workflowId, context, customizations = {} } = task.payload;
    
    try {
      const pattern = this.patternLibrary.get(patternId);
      if (!pattern) {
        throw new Error(`Pattern ${patternId} not found in library`);
      }

      // Apply customizations to pattern
      const customizedPattern = await this.customizePattern(pattern, customizations);
      
      // Track application
      const applicationId = `${patternId}-${workflowId}-${Date.now()}`;
      this.activePatterns.set(applicationId, {
        pattern: customizedPattern,
        appliedAt: new Date(),
        workflowId,
        metrics: {
          startTime: new Date(),
          expectedDuration: customizedPattern.components.reduce((sum, c) => sum + (c.config.estimatedDuration || 0), 0),
          successRate: pattern.effectiveness,
        }
      });

      // Execute pattern application
      const applicationResult = await this.executePatternApplication(customizedPattern, context);
      
      // Update metrics
      this.patternMetrics.totalApplications++;
      pattern.usageCount++;
      pattern.lastUsed = new Date();

      await this.emitEvent('pattern_applied', {
        patternId,
        workflowId,
        applicationId,
        context,
        result: applicationResult
      });

      return {
        taskId: task.id,
        success: true,
        data: {
          applicationId,
          pattern: customizedPattern,
          result: applicationResult
        },
        completedAt: new Date(),
        duration: 0
      };
    } catch (error) {
      throw new Error(`Failed to apply pattern: ${(error as Error).message}`);
    }
  }

  private async trackPatternEffectiveness(task: AgentTask): Promise<TaskResult> {
    const { applicationId, metrics, outcome } = task.payload;
    
    try {
      const application = this.activePatterns.get(applicationId);
      if (!application) {
        throw new Error(`Application ${applicationId} not found`);
      }

      // Update application metrics
      application.metrics.actualDuration = metrics.duration;
      application.metrics.userSatisfaction = metrics.userSatisfaction;
      
      // Calculate effectiveness
      const effectiveness = await this.calculatePatternEffectiveness(application, outcome, metrics);
      
      // Update pattern effectiveness
      const pattern = application.pattern;
      pattern.effectiveness = (pattern.effectiveness * 0.8) + (effectiveness * 0.2); // Exponential moving average

      // Store learning data
      this.learningData.push({
        patternId: pattern.id,
        context: metrics.context,
        outcome,
        metrics,
        feedback: metrics.feedback || '',
        timestamp: new Date()
      });

      return {
        taskId: task.id,
        success: true,
        data: {
          applicationId,
          effectiveness,
          updatedPatternEffectiveness: pattern.effectiveness
        },
        completedAt: new Date(),
        duration: 0
      };
    } catch (error) {
      throw new Error(`Failed to track pattern effectiveness: ${(error as Error).message}`);
    }
  }

  private async evolvePattern(task: AgentTask): Promise<TaskResult> {
    const { patternId, evolutionTrigger, learningData } = task.payload;
    
    try {
      const pattern = this.patternLibrary.get(patternId);
      if (!pattern) {
        throw new Error(`Pattern ${patternId} not found`);
      }

      const evolutionAnalysis = await this.analyzePatternEvolution(pattern, learningData);
      
      if (evolutionAnalysis.shouldEvolve) {
        const evolvedPattern = await this.createEvolvedPattern(pattern, evolutionAnalysis);
        
        // Update library
        this.patternLibrary.set(evolvedPattern.id, evolvedPattern);
        
        // Update metrics
        this.patternMetrics.patternEvolutionCount++;
        
        return {
          taskId: task.id,
          success: true,
          data: {
            originalPattern: pattern,
            evolvedPattern,
            evolutionReason: evolutionAnalysis.reason,
            improvements: evolutionAnalysis.improvements
          },
          completedAt: new Date(),
          duration: 0
        };
      } else {
        return {
          taskId: task.id,
          success: true,
          data: {
            patternId,
            evolved: false,
            reason: 'No significant improvement opportunity found'
          },
          completedAt: new Date(),
          duration: 0
        };
      }
    } catch (error) {
      throw new Error(`Failed to evolve pattern: ${(error as Error).message}`);
    }
  }

  private async analyzePatternPerformance(task: AgentTask): Promise<TaskResult> {
    const { timeframe = '30d', patternIds } = task.payload;
    
    const analysis = {
      timeframe,
      timestamp: new Date(),
      overallMetrics: { ...this.patternMetrics },
      patternAnalysis: [] as any[],
      trends: {} as any,
      recommendations: [] as string[]
    };

    const patternsToAnalyze = patternIds || Array.from(this.patternLibrary.keys());
    
    for (const patternId of patternsToAnalyze) {
      const pattern = this.patternLibrary.get(patternId);
      if (!pattern) continue;

      const patternData = this.learningData.filter(d => d.patternId === patternId);
      const performanceMetrics = await this.calculatePatternPerformanceMetrics(pattern, patternData);
      
      analysis.patternAnalysis.push({
        patternId,
        pattern: {
          name: pattern.name,
          description: pattern.description,
          effectiveness: pattern.effectiveness,
          usageCount: pattern.usageCount
        },
        performance: performanceMetrics
      });
    }

    // Generate trends and recommendations
    analysis.trends = await this.identifyPerformanceTrends(analysis.patternAnalysis);
    analysis.recommendations = await this.generatePerformanceRecommendations(analysis);

    return {
      taskId: task.id,
      success: true,
      data: analysis,
      completedAt: new Date(),
      duration: 0
    };
  }

  private async createNewPattern(task: AgentTask): Promise<TaskResult> {
    const { patternDefinition, sourceWorkflows, validationCriteria } = task.payload;
    
    try {
      // Validate pattern definition
      await this.validatePatternDefinition(patternDefinition);
      
      // Create pattern from definition
      const newPattern: WorkflowPattern = {
        id: `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: patternDefinition.name,
        description: patternDefinition.description,
        applicability: patternDefinition.applicability || [],
        effectiveness: 0.5, // Start with neutral effectiveness
        usageCount: 0,
        lastUsed: new Date(),
        components: patternDefinition.components || []
      };

      // Add to library
      this.patternLibrary.set(newPattern.id, newPattern);
      
      // If source workflows provided, analyze them for initial effectiveness
      if (sourceWorkflows && sourceWorkflows.length > 0) {
        const initialEffectiveness = await this.calculateInitialEffectiveness(newPattern, sourceWorkflows);
        newPattern.effectiveness = initialEffectiveness;
      }

      return {
        taskId: task.id,
        success: true,
        data: {
          pattern: newPattern,
          librarySize: this.patternLibrary.size
        },
        completedAt: new Date(),
        duration: 0
      };
    } catch (error) {
      throw new Error(`Failed to create new pattern: ${(error as Error).message}`);
    }
  }

  private async updatePatternLibrary(task: AgentTask): Promise<TaskResult> {
    const { updates, source = 'manual' } = task.payload;
    
    const updateResults = [];
    
    for (const update of updates) {
      try {
        const pattern = this.patternLibrary.get(update.patternId);
        if (!pattern) {
          updateResults.push({
            patternId: update.patternId,
            success: false,
            error: 'Pattern not found'
          });
          continue;
        }

        // Apply updates
        if (update.name) pattern.name = update.name;
        if (update.description) pattern.description = update.description;
        if (update.applicability) pattern.applicability = update.applicability;
        if (update.components) pattern.components = update.components;
        if (update.effectiveness !== undefined) pattern.effectiveness = update.effectiveness;

        updateResults.push({
          patternId: update.patternId,
          success: true,
          updatedFields: Object.keys(update).filter(k => k !== 'patternId')
        });
      } catch (error) {
        updateResults.push({
          patternId: update.patternId,
          success: false,
          error: (error as Error).message
        });
      }
    }

    return {
      taskId: task.id,
      success: true,
      data: {
        updateResults,
        totalUpdates: updates.length,
        successfulUpdates: updateResults.filter(r => r.success).length
      },
      completedAt: new Date(),
      duration: 0
    };
  }

  // Event handlers

  private async handlePatternApplied(event: any): Promise<void> {
    const { patternId, workflowId, applicationId } = event.data;
    console.log(`Pattern ${patternId} applied to workflow ${workflowId} as ${applicationId}`);
  }

  private async handleWorkflowCompleted(event: any): Promise<void> {
    const { workflowId, duration, success, metrics } = event.data;
    
    // Find active patterns for this workflow
    for (const [applicationId, application] of this.activePatterns) {
      if (application.workflowId === workflowId) {
        // Track effectiveness
        await this.trackPatternEffectiveness({
          id: `track-${applicationId}`,
          type: 'track_pattern_effectiveness',
          priority: 1,
          payload: {
            applicationId,
            metrics: { duration, ...metrics },
            outcome: success ? 'success' : 'failure'
          },
          createdAt: new Date()
        });
        
        // Remove from active patterns
        this.activePatterns.delete(applicationId);
      }
    }
  }

  private async handlePatternFeedback(event: any): Promise<void> {
    const { patternId, feedback, rating } = event.data;
    
    // Store feedback for pattern evolution
    this.learningData.push({
      patternId,
      context: { feedback, rating },
      outcome: rating > 3 ? 'success' : 'failure',
      metrics: { userRating: rating },
      feedback,
      timestamp: new Date()
    });
  }

  // Message handlers

  private async handleWorkflowContextRequest(message: AgentMessage): Promise<void> {
    const { workflowId } = message.payload;
    
    // Find patterns applied to this workflow
    const appliedPatterns = Array.from(this.activePatterns.values())
      .filter(app => app.workflowId === workflowId);
    
    await this.sendMessage(message.from, 'workflow_context_response', {
      workflowId,
      appliedPatterns: appliedPatterns.map(app => ({
        pattern: app.pattern,
        appliedAt: app.appliedAt,
        metrics: app.metrics
      }))
    });
  }

  private async handlePatternLibraryQuery(message: AgentMessage): Promise<void> {
    const { query, filters = {} } = message.payload;
    
    let patterns = Array.from(this.patternLibrary.values());
    
    // Apply filters
    if (filters.minEffectiveness) {
      patterns = patterns.filter(p => p.effectiveness >= filters.minEffectiveness);
    }
    
    if (filters.applicability) {
      patterns = patterns.filter(p => 
        p.applicability.some(a => filters.applicability.includes(a))
      );
    }
    
    // Sort by effectiveness
    patterns.sort((a, b) => b.effectiveness - a.effectiveness);
    
    await this.sendMessage(message.from, 'pattern_library_response', {
      patterns: patterns.slice(0, filters.limit || 10),
      totalCount: patterns.length
    });
  }

  private async handlePatternEffectivenessQuery(message: AgentMessage): Promise<void> {
    const { patternId } = message.payload;
    
    const pattern = this.patternLibrary.get(patternId);
    if (!pattern) {
      await this.sendMessage(message.from, 'pattern_effectiveness_response', {
        patternId,
        found: false
      });
      return;
    }

    const recentData = this.learningData
      .filter(d => d.patternId === patternId)
      .slice(-10); // Last 10 applications

    const effectiveness = {
      current: pattern.effectiveness,
      usageCount: pattern.usageCount,
      lastUsed: pattern.lastUsed,
      recentPerformance: recentData.map(d => ({
        outcome: d.outcome,
        timestamp: d.timestamp,
        feedback: d.feedback
      }))
    };

    await this.sendMessage(message.from, 'pattern_effectiveness_response', {
      patternId,
      found: true,
      effectiveness
    });
  }

  private async handleSubmitPatternFeedback(payload: any): Promise<void> {
    const { patternId, feedback, rating, context } = payload;
    
    await this.handlePatternFeedback({
      data: { patternId, feedback, rating, context }
    });
  }

  // Helper methods

  private async loadBasePatterns(): Promise<void> {
    // Load base patterns - in a real implementation, this would load from a database
    const basePatterns: WorkflowPattern[] = [
      {
        id: 'review-parallel-tracks',
        name: 'Parallel Review Tracks',
        description: 'Coordinate multiple review tracks for faster PR processing',
        applicability: ['code_review', 'pull_request'],
        effectiveness: 0.85,
        usageCount: 0,
        lastUsed: new Date(),
        components: [
          { type: 'reviewer_assignment', config: { parallel: true, tracks: 2 } },
          { type: 'conflict_resolution', config: { automated: true } }
        ]
      },
      {
        id: 'context-time-blocking',
        name: 'Context-Based Time Blocking',
        description: 'Group similar tasks to minimize context switching',
        applicability: ['task_management', 'productivity'],
        effectiveness: 0.78,
        usageCount: 0,
        lastUsed: new Date(),
        components: [
          { type: 'task_clustering', config: { similarity_threshold: 0.7 } },
          { type: 'time_block_optimization', config: { min_duration: 30 } }
        ]
      },
      {
        id: 'adaptive-escalation',
        name: 'Adaptive Escalation',
        description: 'Dynamic escalation based on context and urgency',
        applicability: ['escalation', 'sla_management'],
        effectiveness: 0.82,
        usageCount: 0,
        lastUsed: new Date(),
        components: [
          { type: 'urgency_detection', config: { factors: ['deadline', 'priority', 'stakeholders'] } },
          { type: 'escalation_routing', config: { adaptive: true } }
        ]
      }
    ];

    for (const pattern of basePatterns) {
      this.patternLibrary.set(pattern.id, pattern);
    }
  }

  private async findMatchingPatterns(context: any, requirements: any): Promise<WorkflowPattern[]> {
    const patterns = Array.from(this.patternLibrary.values());
    
    return patterns.filter(pattern => {
      // Check applicability
      if (context.domain && !pattern.applicability.includes(context.domain)) {
        return false;
      }
      
      // Check requirements
      if (requirements.minEffectiveness && pattern.effectiveness < requirements.minEffectiveness) {
        return false;
      }
      
      return true;
    });
  }

  private async rankPatternsByEffectiveness(patterns: WorkflowPattern[], context: any): Promise<WorkflowPattern[]> {
    // Sort by effectiveness, but also consider context relevance
    return patterns.sort((a, b) => {
      const aScore = a.effectiveness + this.calculateContextRelevance(a, context);
      const bScore = b.effectiveness + this.calculateContextRelevance(b, context);
      return bScore - aScore;
    });
  }

  private calculateContextRelevance(pattern: WorkflowPattern, context: any): number {
    // Mock implementation - would use ML in real system
    let relevance = 0;
    
    if (context.domain && pattern.applicability.includes(context.domain)) {
      relevance += 0.2;
    }
    
    if (context.urgency === 'high' && pattern.name.toLowerCase().includes('fast')) {
      relevance += 0.1;
    }
    
    return relevance;
  }

  private async generateRecommendations(patterns: WorkflowPattern[], constraints: any): Promise<any[]> {
    return patterns.slice(0, 5).map(pattern => ({
      pattern,
      confidence: pattern.effectiveness,
      reasoning: `Pattern has ${Math.round(pattern.effectiveness * 100)}% effectiveness rate`,
      customizations: this.suggestCustomizations(pattern, constraints)
    }));
  }

  private suggestCustomizations(pattern: WorkflowPattern, constraints: any): any[] {
    const customizations = [];
    
    if (constraints.timeLimit && pattern.components.some(c => c.type === 'time_block_optimization')) {
      customizations.push({
        component: 'time_block_optimization',
        parameter: 'max_duration',
        value: constraints.timeLimit
      });
    }
    
    return customizations;
  }

  private async customizePattern(pattern: WorkflowPattern, customizations: any): Promise<WorkflowPattern> {
    const customized = JSON.parse(JSON.stringify(pattern)); // Deep clone
    
    for (const customization of Object.values(customizations)) {
      // Apply customizations to pattern components
      // This would be more sophisticated in a real implementation
    }
    
    return customized;
  }

  private async executePatternApplication(pattern: WorkflowPattern, context: any): Promise<any> {
    // Mock implementation - would execute actual pattern logic
    return {
      success: true,
      appliedComponents: pattern.components.map(c => c.type),
      estimatedImpact: 'Improved efficiency by 15-20%'
    };
  }

  private async calculatePatternEffectiveness(application: any, outcome: string, metrics: any): Promise<number> {
    let effectiveness = 0.5; // Base effectiveness
    
    // Factor in outcome
    if (outcome === 'success') {
      effectiveness += 0.3;
    } else if (outcome === 'partial') {
      effectiveness += 0.1;
    }
    
    // Factor in duration vs expected
    if (metrics.duration && application.metrics.expectedDuration) {
      const durationRatio = metrics.duration / application.metrics.expectedDuration;
      if (durationRatio < 1) {
        effectiveness += 0.2 * (1 - durationRatio);
      }
    }
    
    // Factor in user satisfaction
    if (metrics.userSatisfaction) {
      effectiveness += (metrics.userSatisfaction - 0.5) * 0.2;
    }
    
    return Math.min(1, Math.max(0, effectiveness));
  }

  private async analyzePatternEvolution(pattern: WorkflowPattern, learningData: any[]): Promise<any> {
    const recentData = learningData.slice(-20); // Last 20 applications
    
    const successRate = recentData.filter(d => d.outcome === 'success').length / recentData.length;
    const averageRating = recentData.reduce((sum, d) => sum + (d.metrics.userRating || 3), 0) / recentData.length;
    
    const shouldEvolve = successRate < 0.7 || averageRating < 3.5 || pattern.effectiveness < 0.6;
    
    return {
      shouldEvolve,
      reason: shouldEvolve ? 'Performance below threshold' : 'Performance acceptable',
      improvements: shouldEvolve ? ['optimize_components', 'adjust_parameters'] : []
    };
  }

  private async createEvolvedPattern(originalPattern: WorkflowPattern, analysis: any): Promise<WorkflowPattern> {
    const evolved: WorkflowPattern = {
      ...originalPattern,
      id: `${originalPattern.id}-evolved-${Date.now()}`,
      name: `${originalPattern.name} (Evolved)`,
      effectiveness: Math.min(1, originalPattern.effectiveness + 0.1), // Slight improvement
      usageCount: 0,
      lastUsed: new Date()
    };
    
    // Apply improvements based on analysis
    // This would be more sophisticated in a real implementation
    
    return evolved;
  }

  private async calculatePatternPerformanceMetrics(pattern: WorkflowPattern, data: any[]): Promise<any> {
    if (data.length === 0) {
      return {
        applications: 0,
        successRate: 0,
        averageRating: 0,
        trend: 'insufficient_data'
      };
    }
    
    const successRate = data.filter(d => d.outcome === 'success').length / data.length;
    const averageRating = data.reduce((sum, d) => sum + (d.metrics.userRating || 3), 0) / data.length;
    
    // Calculate trend
    const recentData = data.slice(-10);
    const olderData = data.slice(-20, -10);
    const recentSuccess = recentData.filter(d => d.outcome === 'success').length / Math.max(1, recentData.length);
    const olderSuccess = olderData.filter(d => d.outcome === 'success').length / Math.max(1, olderData.length);
    
    let trend = 'stable';
    if (recentSuccess > olderSuccess + 0.1) trend = 'improving';
    else if (recentSuccess < olderSuccess - 0.1) trend = 'declining';
    
    return {
      applications: data.length,
      successRate,
      averageRating,
      trend,
      effectiveness: pattern.effectiveness
    };
  }

  private async identifyPerformanceTrends(analysis: any[]): Promise<any> {
    return {
      improvingPatterns: analysis.filter(a => a.performance.trend === 'improving').length,
      decliningPatterns: analysis.filter(a => a.performance.trend === 'declining').length,
      stablePatterns: analysis.filter(a => a.performance.trend === 'stable').length
    };
  }

  private async generatePerformanceRecommendations(analysis: any): Promise<string[]> {
    const recommendations = [];
    
    if (analysis.trends.decliningPatterns > 0) {
      recommendations.push('Review and evolve declining patterns');
    }
    
    if (analysis.overallMetrics.averageEffectivenessImprovement < 0.1) {
      recommendations.push('Focus on pattern optimization');
    }
    
    return recommendations;
  }

  private async validatePatternDefinition(definition: any): Promise<void> {
    if (!definition.name) {
      throw new Error('Pattern name is required');
    }
    
    if (!definition.description) {
      throw new Error('Pattern description is required');
    }
    
    if (!definition.components || definition.components.length === 0) {
      throw new Error('Pattern must have at least one component');
    }
  }

  private async calculateInitialEffectiveness(pattern: WorkflowPattern, sourceWorkflows: any[]): Promise<number> {
    // Mock implementation - would analyze source workflows
    return 0.6 + Math.random() * 0.2; // Random between 0.6 and 0.8
  }

  private startPatternEvolution(): void {
    // Run pattern evolution analysis every 24 hours
    setInterval(async () => {
      for (const [patternId, pattern] of this.patternLibrary) {
        try {
          const patternData = this.learningData.filter(d => d.patternId === patternId);
          if (patternData.length >= 10) { // Minimum data for evolution
            await this.evolvePattern({
              id: `evolution-${patternId}`,
              type: 'evolve_pattern',
              priority: 2,
              payload: { patternId, learningData: patternData },
              createdAt: new Date()
            });
          }
        } catch (error) {
          console.error(`Error evolving pattern ${patternId}:`, error);
        }
      }
    }, 24 * 60 * 60 * 1000);
  }

  // Public methods for other agents

  public getPatternLibrary(): WorkflowPattern[] {
    return Array.from(this.patternLibrary.values());
  }

  public getPatternEffectiveness(patternId: string): number | null {
    const pattern = this.patternLibrary.get(patternId);
    return pattern ? pattern.effectiveness : null;
  }

  public getActivePatterns(): any[] {
    return Array.from(this.activePatterns.values());
  }

  public getPatternMetrics(): any {
    return { ...this.patternMetrics };
  }
}
