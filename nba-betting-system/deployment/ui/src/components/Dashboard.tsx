import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  TrendingUpIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { io, Socket } from 'socket.io-client';

import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { LoadingSkeleton } from './ui/LoadingSkeleton';
import { api } from '../lib/api';
import { formatCurrency, formatPercentage } from '../lib/utils';

interface BettingOpportunity {
  id: string;
  game_id: string;
  market: string;
  bet_type: string;
  recommended_stake: number;
  expected_value: number;
  confidence: number;
  risk_level: 'low' | 'medium' | 'high';
  bookmaker_odds: number;
  fair_odds: number;
  edge: number;
  expires_at: string;
}

interface PortfolioMetrics {
  total_bets: number;
  win_rate: number;
  roi: number;
  profit_loss: number;
  sharpe_ratio: number;
}

interface DashboardData {
  opportunities: BettingOpportunity[];
  portfolio: PortfolioMetrics;
  performance_history: Array<{
    date: string;
    roi: number;
    profit_loss: number;
  }>;
}

export const Dashboard: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [liveUpdates, setLiveUpdates] = useState<BettingOpportunity[]>([]);

  // Fetch dashboard data
  const { data, isLoading, error, refetch } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const [opportunities, portfolio, performance] = await Promise.all([
        api.get('/betting/opportunities'),
        api.get('/betting/portfolio'),
        api.get('/betting/performance-history')
      ]);
      
      return {
        opportunities: opportunities.data,
        portfolio: portfolio.data.performance,
        performance_history: performance.data
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Setup WebSocket connection for real-time updates
  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080');
    
    newSocket.on('connect', () => {
      console.log('Connected to real-time updates');
    });

    newSocket.on('betting_opportunity', (opportunity: BettingOpportunity) => {
      setLiveUpdates(prev => [opportunity, ...prev.slice(0, 4)]);
    });

    newSocket.on('opportunity_expired', (opportunityId: string) => {
      setLiveUpdates(prev => prev.filter(opp => opp.id !== opportunityId));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load dashboard</h3>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  const { opportunities, portfolio, performance_history } = data!;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">NBA Betting Dashboard</h1>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live Updates</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total ROI"
          value={formatPercentage(portfolio.roi)}
          icon={TrendingUpIcon}
          trend={portfolio.roi > 0 ? 'up' : 'down'}
          color={portfolio.roi > 0 ? 'green' : 'red'}
        />
        <MetricCard
          title="Profit/Loss"
          value={formatCurrency(portfolio.profit_loss)}
          icon={CurrencyDollarIcon}
          trend={portfolio.profit_loss > 0 ? 'up' : 'down'}
          color={portfolio.profit_loss > 0 ? 'green' : 'red'}
        />
        <MetricCard
          title="Win Rate"
          value={formatPercentage(portfolio.win_rate)}
          icon={ChartBarIcon}
          color="blue"
        />
        <MetricCard
          title="Total Bets"
          value={portfolio.total_bets.toString()}
          icon={ChartBarIcon}
          color="purple"
        />
      </div>

      {/* Performance Chart */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Performance History</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performance_history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'roi' ? formatPercentage(value as number) : formatCurrency(value as number),
                  name === 'roi' ? 'ROI' : 'Profit/Loss'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="roi" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6' }}
              />
              <Line 
                type="monotone" 
                dataKey="profit_loss" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Opportunities */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Current Opportunities</h2>
            <Badge variant="secondary">{opportunities.length} available</Badge>
          </div>
          <div className="space-y-4">
            {opportunities.slice(0, 5).map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
            {opportunities.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No opportunities available at the moment
              </div>
            )}
          </div>
        </Card>

        {/* Live Updates */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Live Updates</h2>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Real-time</span>
            </div>
          </div>
          <div className="space-y-4">
            {liveUpdates.map((opportunity, index) => (
              <motion.div
                key={opportunity.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <OpportunityCard opportunity={opportunity} isNew />
              </motion.div>
            ))}
            {liveUpdates.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Waiting for live updates...
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down';
  color: 'green' | 'red' | 'blue' | 'purple';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, trend, color }) => {
  const colorClasses = {
    green: 'text-green-600 bg-green-100',
    red: 'text-red-600 bg-red-100',
    blue: 'text-blue-600 bg-blue-100',
    purple: 'text-purple-600 bg-purple-100'
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-2">
          <span className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? '↗' : '↘'} Trending {trend}
          </span>
        </div>
      )}
    </Card>
  );
};

interface OpportunityCardProps {
  opportunity: BettingOpportunity;
  isNew?: boolean;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity, isNew }) => {
  const riskColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  return (
    <div className={`p-4 border rounded-lg ${isNew ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="font-medium">{opportunity.market}</span>
          <Badge className={riskColors[opportunity.risk_level]}>
            {opportunity.risk_level} risk
          </Badge>
          {isNew && <Badge className="bg-green-100 text-green-800">NEW</Badge>}
        </div>
        <span className="text-sm text-gray-500">
          {formatPercentage(opportunity.edge)} edge
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Expected Value:</span>
          <span className="ml-1 font-medium">{formatCurrency(opportunity.expected_value)}</span>
        </div>
        <div>
          <span className="text-gray-600">Confidence:</span>
          <span className="ml-1 font-medium">{formatPercentage(opportunity.confidence)}</span>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        Expires: {new Date(opportunity.expires_at).toLocaleTimeString()}
      </div>
    </div>
  );
};

const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    <LoadingSkeleton className="h-8 w-64" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <LoadingSkeleton key={i} className="h-24" />
      ))}
    </div>
    <LoadingSkeleton className="h-80" />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <LoadingSkeleton className="h-96" />
      <LoadingSkeleton className="h-96" />
    </div>
  </div>
);

