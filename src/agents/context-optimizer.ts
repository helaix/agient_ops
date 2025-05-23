import { BaseAgent } from './base-agent';
import { AgentTask, TaskResult, AgentMessage, AgentConfig, ContextSwitchEvent, ProductivityMetrics } from '../types';

/**
 * Context Optimizer Agent - Minimize context switching and optimize developer productivity
 * 
 * Purpose: Minimize context switching and optimize developer productivity
 * Key Capabilities:
 * - Context switch detection and analysis
 * - Intelligent time-blocking recommendations
 * - Context preservation and restoration
 * - Productivity pattern learning
 */
export class ContextOptimizerAgent extends BaseAgent {
  private contextSwitches: ContextSwitchEvent[] = [];
  private activeContexts: Map<string, {
    startTime: Date;
    taskType: string;
    metadata: any;
    interruptions: number;
  }> = new Map();
  
  private productivityMetrics: ProductivityMetrics = {
    focusTime: 0,
    contextSwitches: 0,
    taskCompletionRate: 0,
    timeBlocks: []
  };

  private contextPatterns: Map<string, {
    frequency: number;
    averageDuration: number;
    productivityScore: number;
    optimalTimeBlocks: Array<{
      startHour: number;
      endHour: number;
      dayOfWeek: number;
    }>;
  }> = new Map();

  private recommendations: Array<{
    id: string;
    type: 'time_blocking' | 'context_grouping' | 'interruption_reduction';
    description: string;
    impact: 'low' | 'medium' | 'high';
    createdAt: Date;
    applied: boolean;
  }> = [];

  protected async getDefaultConfig(): Promise<AgentConfig> {
    return {
      type: 'context-optimizer',
      name: 'Context Optimizer Agent',
      description: 'Minimize context switching and optimize developer productivity',
      maxConcurrentTasks: 8,
      timeoutMs: 20000,
      retryAttempts: 3,
      capabilities: [
        'context_switch_detection',
        'time_blocking_optimization',
        'context_preservation',
        'productivity_analysis',
        'pattern_learning',
        'interruption_management'
      ],
      dependencies: []
    };
  }

  protected async onInitialize(): Promise<void> {
    // Set up event listeners for context-related events
    this.on('context_switch_detected', this.handleContextSwitch.bind(this));
    this.on('task_completed', this.handleTaskCompleted.bind(this));
    this.on('task_assigned', this.handleTaskAssigned.bind(this));
    
    // Start periodic analysis
    this.startPeriodicAnalysis();
  }

  protected async processTask(task: AgentTask): Promise<TaskResult> {
    switch (task.type) {
      case 'detect_context_switches':
        return await this.detectContextSwitches(task);
      case 'analyze_productivity_patterns':
        return await this.analyzeProductivityPatterns(task);
      case 'generate_time_blocking_recommendations':
        return await this.generateTimeBlockingRecommendations(task);
      case 'optimize_task_clustering':
        return await this.optimizeTaskClustering(task);
      case 'preserve_context_state':
        return await this.preserveContextState(task);
      case 'restore_context_state':
        return await this.restoreContextState(task);
      case 'calculate_productivity_metrics':
        return await this.calculateProductivityMetrics(task);
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  protected async handleMessage(message: AgentMessage): Promise<void> {
    switch (message.type) {
      case 'context_change_notification':
        await this.handleContextChangeNotification(message.payload);
        break;
      case 'productivity_metrics_request':
        await this.handleProductivityMetricsRequest(message);
        break;
      case 'optimization_recommendations_request':
        await this.handleOptimizationRecommendationsRequest(message);
        break;
      case 'apply_recommendation':
        await this.handleApplyRecommendation(message.payload);
        break;
      default:
        await super.handleMessage(message);
    }
  }

  // Task processing methods

  private async detectContextSwitches(task: AgentTask): Promise<TaskResult> {
    const { userId, timeWindow = 3600000 } = task.payload; // Default 1 hour window
    
    const now = new Date();
    const windowStart = new Date(now.getTime() - timeWindow);
    
    const recentSwitches = this.contextSwitches.filter(
      cs => cs.timestamp >= windowStart && cs.timestamp <= now
    );

    const analysis = {
      totalSwitches: recentSwitches.length,
      averageSwitchDuration: this.calculateAverageSwitchDuration(recentSwitches),
      mostFrequentContexts: this.getMostFrequentContexts(recentSwitches),
      switchPatterns: this.analyzeSwitchPatterns(recentSwitches),
      productivityImpact: this.calculateProductivityImpact(recentSwitches)
    };

    // Update metrics
    this.productivityMetrics.contextSwitches = recentSwitches.length;

    return {
      taskId: task.id,
      success: true,
      data: analysis,
      completedAt: new Date(),
      duration: 0
    };
  }

  private async analyzeProductivityPatterns(task: AgentTask): Promise<TaskResult> {
    const { userId, analysisDepth = 'week' } = task.payload;
    
    const patterns = {
      peakProductivityHours: this.identifyPeakProductivityHours(),
      optimalContextDurations: this.calculateOptimalContextDurations(),
      interruptionPatterns: this.analyzeInterruptionPatterns(),
      taskTypeEfficiency: this.analyzeTaskTypeEfficiency(),
      recommendations: this.generateProductivityRecommendations()
    };

    // Update context patterns
    this.updateContextPatterns(patterns);

    return {
      taskId: task.id,
      success: true,
      data: patterns,
      completedAt: new Date(),
      duration: 0
    };
  }

  private async generateTimeBlockingRecommendations(task: AgentTask): Promise<TaskResult> {
    const { userId, preferences = {} } = task.payload;
    
    const recommendations = [];

    // Analyze current time blocks
    const currentBlocks = this.productivityMetrics.timeBlocks;
    const blockAnalysis = this.analyzeTimeBlocks(currentBlocks);

    // Generate recommendations based on patterns
    if (blockAnalysis.averageBlockDuration < 30 * 60 * 1000) { // Less than 30 minutes
      recommendations.push({
        id: `time-block-${Date.now()}-1`,
        type: 'time_blocking' as const,
        description: 'Increase minimum time block duration to 45-60 minutes for better focus',
        impact: 'high' as const,
        createdAt: new Date(),
        applied: false,
        details: {
          currentAverage: blockAnalysis.averageBlockDuration,
          recommendedMinimum: 45 * 60 * 1000,
          expectedImpact: 'Reduce context switching overhead by 25%'
        }
      });
    }

    // Recommend context grouping
    const contextGroups = this.identifyContextGroups();
    if (contextGroups.length > 0) {
      recommendations.push({
        id: `context-group-${Date.now()}-2`,
        type: 'context_grouping' as const,
        description: 'Group similar tasks together to minimize context switches',
        impact: 'medium' as const,
        createdAt: new Date(),
        applied: false,
        details: {
          suggestedGroups: contextGroups,
          potentialSavings: '15-20 minutes per day'
        }
      });
    }

    // Add to recommendations list
    this.recommendations.push(...recommendations);

    return {
      taskId: task.id,
      success: true,
      data: { recommendations, analysis: blockAnalysis },
      completedAt: new Date(),
      duration: 0
    };
  }

  private async optimizeTaskClustering(task: AgentTask): Promise<TaskResult> {
    const { tasks, constraints = {} } = task.payload;
    
    // Cluster tasks by context similarity
    const clusters = this.clusterTasksByContext(tasks);
    
    // Optimize cluster ordering
    const optimizedSchedule = this.optimizeClusterSchedule(clusters, constraints);
    
    // Calculate expected productivity improvement
    const improvement = this.calculateClusteringImprovement(tasks, optimizedSchedule);

    return {
      taskId: task.id,
      success: true,
      data: {
        originalTasks: tasks,
        clusters,
        optimizedSchedule,
        expectedImprovement: improvement
      },
      completedAt: new Date(),
      duration: 0
    };
  }

  private async preserveContextState(task: AgentTask): Promise<TaskResult> {
    const { contextId, state } = task.payload;
    
    const preservedState = {
      contextId,
      timestamp: new Date(),
      state: {
        openFiles: state.openFiles || [],
        activeWindows: state.activeWindows || [],
        workspaceLayout: state.workspaceLayout || {},
        environmentVariables: state.environmentVariables || {},
        notes: state.notes || '',
        progress: state.progress || {}
      }
    };

    // Store context state (in a real implementation, this would persist to storage)
    await this.storeContextState(contextId, preservedState);

    return {
      taskId: task.id,
      success: true,
      data: { contextId, preserved: true, stateSize: JSON.stringify(preservedState).length },
      completedAt: new Date(),
      duration: 0
    };
  }

  private async restoreContextState(task: AgentTask): Promise<TaskResult> {
    const { contextId } = task.payload;
    
    try {
      const preservedState = await this.retrieveContextState(contextId);
      
      if (!preservedState) {
        throw new Error(`No preserved state found for context ${contextId}`);
      }

      // Restore context (in a real implementation, this would restore the actual environment)
      const restorationSteps = [
        'restore_workspace_layout',
        'reopen_files',
        'restore_environment_variables',
        'restore_progress_state'
      ];

      return {
        taskId: task.id,
        success: true,
        data: {
          contextId,
          restored: true,
          restorationSteps,
          state: preservedState.state
        },
        completedAt: new Date(),
        duration: 0
      };
    } catch (error) {
      throw new Error(`Failed to restore context state: ${(error as Error).message}`);
    }
  }

  private async calculateProductivityMetrics(task: AgentTask): Promise<TaskResult> {
    const { timeframe = '24h' } = task.payload;
    
    const metrics = {
      ...this.productivityMetrics,
      timestamp: new Date(),
      timeframe,
      derived: {
        focusEfficiency: this.calculateFocusEfficiency(),
        contextSwitchCost: this.calculateContextSwitchCost(),
        optimalWorkingHours: this.identifyOptimalWorkingHours(),
        interruptionImpact: this.calculateInterruptionImpact()
      }
    };

    return {
      taskId: task.id,
      success: true,
      data: metrics,
      completedAt: new Date(),
      duration: 0
    };
  }

  // Event handlers

  private async handleContextSwitch(event: any): Promise<void> {
    const { fromContext, toContext, reason, timestamp } = event.data;
    
    const contextSwitch: ContextSwitchEvent = {
      timestamp: timestamp || new Date(),
      fromContext,
      toContext,
      duration: 0, // Will be calculated when context ends
      reason
    };

    this.contextSwitches.push(contextSwitch);

    // Update active contexts
    if (this.activeContexts.has(fromContext)) {
      const context = this.activeContexts.get(fromContext)!;
      context.interruptions++;
    }

    this.activeContexts.set(toContext, {
      startTime: new Date(),
      taskType: toContext,
      metadata: {},
      interruptions: 0
    });

    // Emit analysis if too many switches
    if (this.contextSwitches.length > 10) {
      await this.emitEvent('context_switch_detected', {
        recentSwitches: this.contextSwitches.slice(-10),
        analysis: 'high_frequency_switching'
      });
    }
  }

  private async handleTaskCompleted(event: any): Promise<void> {
    const { taskId, duration, context } = event.data;
    
    // Update productivity metrics
    this.productivityMetrics.taskCompletionRate = 
      (this.productivityMetrics.taskCompletionRate * 0.9) + (0.1);

    // Add to time blocks
    this.productivityMetrics.timeBlocks.push({
      start: new Date(Date.now() - duration),
      end: new Date(),
      context,
      productivity: this.calculateTaskProductivity(duration, context)
    });

    // Update focus time
    if (duration > 25 * 60 * 1000) { // More than 25 minutes
      this.productivityMetrics.focusTime += duration;
    }
  }

  private async handleTaskAssigned(event: any): Promise<void> {
    const { taskId, context, priority } = event.data;
    
    // Check if this creates a context switch
    const currentContext = Array.from(this.activeContexts.keys())[0];
    if (currentContext && currentContext !== context) {
      await this.emitEvent('context_switch_detected', {
        fromContext: currentContext,
        toContext: context,
        reason: 'task_assignment',
        timestamp: new Date()
      });
    }
  }

  // Message handlers

  private async handleContextChangeNotification(payload: any): Promise<void> {
    const { userId, fromContext, toContext, timestamp } = payload;
    
    await this.handleContextSwitch({
      data: { fromContext, toContext, reason: 'manual', timestamp }
    });
  }

  private async handleProductivityMetricsRequest(message: AgentMessage): Promise<void> {
    const metrics = await this.calculateProductivityMetrics({
      id: 'metrics-request',
      type: 'calculate_productivity_metrics',
      priority: 1,
      payload: {},
      createdAt: new Date()
    });
    
    await this.sendMessage(message.from, 'productivity_metrics_response', metrics.data);
  }

  private async handleOptimizationRecommendationsRequest(message: AgentMessage): Promise<void> {
    const activeRecommendations = this.recommendations.filter(r => !r.applied);
    
    await this.sendMessage(message.from, 'optimization_recommendations_response', {
      recommendations: activeRecommendations,
      totalCount: this.recommendations.length,
      appliedCount: this.recommendations.filter(r => r.applied).length
    });
  }

  private async handleApplyRecommendation(payload: any): Promise<void> {
    const { recommendationId } = payload;
    
    const recommendation = this.recommendations.find(r => r.id === recommendationId);
    if (recommendation) {
      recommendation.applied = true;
      
      // In a real implementation, this would apply the actual recommendation
      console.log(`Applied recommendation: ${recommendation.description}`);
    }
  }

  // Helper methods

  private calculateAverageSwitchDuration(switches: ContextSwitchEvent[]): number {
    if (switches.length === 0) return 0;
    
    const totalDuration = switches.reduce((sum, cs) => sum + cs.duration, 0);
    return totalDuration / switches.length;
  }

  private getMostFrequentContexts(switches: ContextSwitchEvent[]): Array<{context: string, count: number}> {
    const contextCounts = new Map<string, number>();
    
    switches.forEach(cs => {
      contextCounts.set(cs.toContext, (contextCounts.get(cs.toContext) || 0) + 1);
    });
    
    return Array.from(contextCounts.entries())
      .map(([context, count]) => ({ context, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private analyzeSwitchPatterns(switches: ContextSwitchEvent[]): any {
    return {
      peakSwitchHours: this.identifyPeakSwitchHours(switches),
      commonSwitchReasons: this.getCommonSwitchReasons(switches),
      switchFrequency: switches.length / Math.max(1, switches.length > 0 ? 
        (switches[switches.length - 1].timestamp.getTime() - switches[0].timestamp.getTime()) / (60 * 60 * 1000) : 1)
    };
  }

  private calculateProductivityImpact(switches: ContextSwitchEvent[]): number {
    // Estimate productivity loss: each switch costs ~23 minutes on average
    const switchCost = 23 * 60 * 1000; // 23 minutes in milliseconds
    return switches.length * switchCost;
  }

  private identifyPeakProductivityHours(): Array<{hour: number, productivity: number}> {
    // Mock implementation - would analyze actual productivity data
    return [
      { hour: 9, productivity: 0.85 },
      { hour: 10, productivity: 0.92 },
      { hour: 11, productivity: 0.88 },
      { hour: 14, productivity: 0.78 },
      { hour: 15, productivity: 0.82 }
    ];
  }

  private calculateOptimalContextDurations(): Record<string, number> {
    const durations: Record<string, number> = {};
    
    for (const [context, pattern] of this.contextPatterns) {
      durations[context] = pattern.averageDuration;
    }
    
    return durations;
  }

  private analyzeInterruptionPatterns(): any {
    return {
      averageInterruptionsPerHour: 3.2,
      mostCommonInterruptionSources: ['slack', 'email', 'meetings'],
      interruptionRecoveryTime: 15 * 60 * 1000 // 15 minutes
    };
  }

  private analyzeTaskTypeEfficiency(): Record<string, number> {
    return {
      'coding': 0.85,
      'review': 0.78,
      'documentation': 0.72,
      'meetings': 0.65,
      'planning': 0.80
    };
  }

  private generateProductivityRecommendations(): string[] {
    return [
      'Schedule deep work during peak hours (9-11 AM)',
      'Batch similar tasks together',
      'Limit interruptions during focus blocks',
      'Use time-boxing for better task completion'
    ];
  }

  private updateContextPatterns(patterns: any): void {
    // Update internal context patterns based on analysis
    // This would be more sophisticated in a real implementation
  }

  private analyzeTimeBlocks(blocks: any[]): any {
    if (blocks.length === 0) {
      return { averageBlockDuration: 0, totalBlocks: 0 };
    }
    
    const totalDuration = blocks.reduce((sum, block) => 
      sum + (block.end.getTime() - block.start.getTime()), 0);
    
    return {
      averageBlockDuration: totalDuration / blocks.length,
      totalBlocks: blocks.length,
      longestBlock: Math.max(...blocks.map(b => b.end.getTime() - b.start.getTime())),
      shortestBlock: Math.min(...blocks.map(b => b.end.getTime() - b.start.getTime()))
    };
  }

  private identifyContextGroups(): Array<{contexts: string[], similarity: number}> {
    // Mock implementation - would use ML to identify similar contexts
    return [
      { contexts: ['coding', 'debugging'], similarity: 0.85 },
      { contexts: ['documentation', 'planning'], similarity: 0.72 }
    ];
  }

  private clusterTasksByContext(tasks: any[]): any[] {
    // Group tasks by similar contexts
    const clusters = new Map<string, any[]>();
    
    tasks.forEach(task => {
      const context = task.context || 'general';
      if (!clusters.has(context)) {
        clusters.set(context, []);
      }
      clusters.get(context)!.push(task);
    });
    
    return Array.from(clusters.entries()).map(([context, tasks]) => ({
      context,
      tasks,
      estimatedDuration: tasks.reduce((sum, t) => sum + (t.estimatedDuration || 0), 0)
    }));
  }

  private optimizeClusterSchedule(clusters: any[], constraints: any): any[] {
    // Sort clusters by priority and context switching cost
    return clusters.sort((a, b) => {
      const aPriority = a.tasks.reduce((sum: number, t: any) => sum + (t.priority || 0), 0);
      const bPriority = b.tasks.reduce((sum: number, t: any) => sum + (t.priority || 0), 0);
      return bPriority - aPriority;
    });
  }

  private calculateClusteringImprovement(originalTasks: any[], optimizedSchedule: any[]): any {
    return {
      contextSwitchReduction: '35%',
      estimatedTimeSavings: '45 minutes',
      productivityIncrease: '15%'
    };
  }

  private async storeContextState(contextId: string, state: any): Promise<void> {
    // Mock implementation - would persist to database
    console.log(`Storing context state for ${contextId}`);
  }

  private async retrieveContextState(contextId: string): Promise<any> {
    // Mock implementation - would retrieve from database
    return {
      contextId,
      timestamp: new Date(),
      state: {}
    };
  }

  private calculateFocusEfficiency(): number {
    const totalTime = this.productivityMetrics.timeBlocks.reduce((sum, block) => 
      sum + (block.end.getTime() - block.start.getTime()), 0);
    
    return totalTime > 0 ? this.productivityMetrics.focusTime / totalTime : 0;
  }

  private calculateContextSwitchCost(): number {
    return this.productivityMetrics.contextSwitches * 23 * 60 * 1000; // 23 minutes per switch
  }

  private identifyOptimalWorkingHours(): Array<{start: number, end: number}> {
    return [
      { start: 9, end: 12 },
      { start: 14, end: 17 }
    ];
  }

  private calculateInterruptionImpact(): number {
    const interruptions = Array.from(this.activeContexts.values())
      .reduce((sum, context) => sum + context.interruptions, 0);
    
    return interruptions * 15 * 60 * 1000; // 15 minutes recovery per interruption
  }

  private calculateTaskProductivity(duration: number, context: string): number {
    // Mock calculation based on duration and context
    const baseProductivity = 0.7;
    const durationFactor = Math.min(1.0, duration / (60 * 60 * 1000)); // Normalize to 1 hour
    const contextFactor = this.contextPatterns.get(context)?.productivityScore || 0.8;
    
    return baseProductivity * durationFactor * contextFactor;
  }

  private identifyPeakSwitchHours(switches: ContextSwitchEvent[]): number[] {
    const hourCounts = new Map<number, number>();
    
    switches.forEach(cs => {
      const hour = cs.timestamp.getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });
    
    return Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => hour);
  }

  private getCommonSwitchReasons(switches: ContextSwitchEvent[]): Array<{reason: string, count: number}> {
    const reasonCounts = new Map<string, number>();
    
    switches.forEach(cs => {
      reasonCounts.set(cs.reason, (reasonCounts.get(cs.reason) || 0) + 1);
    });
    
    return Array.from(reasonCounts.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count);
  }

  private startPeriodicAnalysis(): void {
    // Run productivity analysis every hour
    setInterval(async () => {
      try {
        await this.analyzeProductivityPatterns({
          id: 'periodic-analysis',
          type: 'analyze_productivity_patterns',
          priority: 2,
          payload: {},
          createdAt: new Date()
        });
      } catch (error) {
        console.error('Error in periodic productivity analysis:', error);
      }
    }, 60 * 60 * 1000);
  }

  // Public methods for other agents

  public getCurrentProductivityMetrics(): ProductivityMetrics {
    return { ...this.productivityMetrics };
  }

  public getActiveRecommendations(): any[] {
    return this.recommendations.filter(r => !r.applied);
  }

  public getContextSwitchHistory(timeframe: number = 24 * 60 * 60 * 1000): ContextSwitchEvent[] {
    const cutoff = new Date(Date.now() - timeframe);
    return this.contextSwitches.filter(cs => cs.timestamp >= cutoff);
  }
}

