# Unit Economics Calculator Template

## Overview
This template provides a comprehensive framework for calculating and analyzing unit economics for different business models. Use this as a foundation for building your own unit economics model in Excel or Google Sheets.

## Basic Unit Economics Calculator

### Input Variables

#### Customer Revenue Metrics
- **Monthly Revenue per Customer (ARPU)**: $____
- **Annual Revenue per Customer**: $____
- **Average Contract Value (ACV)**: $____
- **Monthly Recurring Revenue (MRR)**: $____

#### Customer Lifecycle Metrics
- **Monthly Churn Rate**: ____%
- **Annual Churn Rate**: ____%
- **Average Customer Lifespan (months)**: ____
- **Customer Retention Rate**: ____%

#### Cost Metrics
- **Customer Acquisition Cost (CAC)**: $____
- **Cost of Goods Sold per Customer**: $____
- **Monthly Gross Margin per Customer**: $____
- **Gross Margin Percentage**: ____%

### Core Calculations

#### Customer Lifetime Value (LTV)

**Method 1: Simple LTV**
```
LTV = ARPU × Average Customer Lifespan × Gross Margin %
LTV = $____ × ____ months × ____% = $____
```

**Method 2: Churn-Based LTV**
```
LTV = (ARPU × Gross Margin %) / Monthly Churn Rate
LTV = ($____ × ____%) / ____% = $____
```

**Method 3: Cohort-Based LTV (Advanced)**
```
LTV = Σ(Monthly Revenue × Retention Rate × Gross Margin) for each month
```

#### Key Ratios

**LTV/CAC Ratio**
```
LTV/CAC = $____ / $____ = ____:1
```

**Payback Period**
```
Payback Period = CAC / (Monthly Revenue × Gross Margin %)
Payback Period = $____ / ($____ × ____%) = ____ months
```

**Monthly Gross Margin**
```
Monthly Gross Margin = Monthly Revenue × Gross Margin %
Monthly Gross Margin = $____ × ____% = $____
```

## Business Model Specific Calculators

### SaaS Business Model

#### SaaS-Specific Metrics
- **Monthly Recurring Revenue (MRR)**: $____
- **Annual Recurring Revenue (ARR)**: $____
- **Average Revenue Per User (ARPU)**: $____
- **Customer Acquisition Cost (CAC)**: $____
- **Monthly Churn Rate**: ____%
- **Net Revenue Retention (NRR)**: ____%

#### SaaS Calculations
```
LTV = ARPU / Monthly Churn Rate
LTV = $____ / ____% = $____

Payback Period = CAC / (ARPU × Gross Margin %)
Payback Period = $____ / ($____ × ____%) = ____ months

LTV/CAC = $____ / $____ = ____:1
```

#### SaaS Benchmarks
- **LTV/CAC Ratio**: >3:1 (excellent: >5:1)
- **Payback Period**: <12 months
- **Gross Margin**: >70%
- **Monthly Churn**: <5%
- **NRR**: >110%

### E-commerce Business Model

#### E-commerce Specific Metrics
- **Average Order Value (AOV)**: $____
- **Purchase Frequency (annual)**: ____
- **Customer Acquisition Cost (CAC)**: $____
- **Gross Margin per Order**: ____%
- **Repeat Purchase Rate**: ____%
- **Customer Lifespan (years)**: ____

#### E-commerce Calculations
```
Annual Revenue per Customer = AOV × Purchase Frequency
Annual Revenue per Customer = $____ × ____ = $____

LTV = Annual Revenue per Customer × Customer Lifespan × Gross Margin %
LTV = $____ × ____ years × ____% = $____

Payback Period = CAC / (AOV × Gross Margin % × Purchase Frequency / 12)
Payback Period = $____ / ($____ × ____% × ____ / 12) = ____ months
```

#### E-commerce Benchmarks
- **LTV/CAC Ratio**: >2:1 (excellent: >4:1)
- **Payback Period**: <6 months
- **Gross Margin**: >40%
- **Repeat Purchase Rate**: >25%
- **AOV Growth**: >10% annually

### Marketplace Business Model

#### Marketplace Specific Metrics
- **Gross Merchandise Value (GMV)**: $____
- **Take Rate**: ____%
- **Revenue per Transaction**: $____
- **Transactions per Customer (annual)**: ____
- **Customer Acquisition Cost (CAC)**: $____
- **Customer Lifespan (years)**: ____

#### Marketplace Calculations
```
Revenue per Customer = GMV per Customer × Take Rate
Revenue per Customer = $____ × ____% = $____

LTV = Revenue per Customer × Customer Lifespan
LTV = $____ × ____ years = $____

Payback Period = CAC / (Monthly Revenue per Customer)
Payback Period = $____ / $____ = ____ months
```

#### Marketplace Benchmarks
- **LTV/CAC Ratio**: >3:1 (excellent: >6:1)
- **Take Rate**: 10-30% of GMV
- **Network Effects**: Strong correlation
- **Annual Retention**: >80%

## Cohort Analysis Template

### Monthly Cohort Tracking

#### Cohort Definition
- **Cohort Month**: ____
- **New Customers Acquired**: ____
- **Initial Monthly Revenue**: $____
- **Customer Acquisition Cost**: $____

#### Monthly Retention Tracking
| Month | Customers Retained | Retention % | Revenue | Revenue per Customer |
|-------|-------------------|-------------|---------|---------------------|
| 0     | ____             | 100%        | $____   | $____              |
| 1     | ____             | ____%       | $____   | $____              |
| 2     | ____             | ____%       | $____   | $____              |
| 3     | ____             | ____%       | $____   | $____              |
| 6     | ____             | ____%       | $____   | $____              |
| 12    | ____             | ____%       | $____   | $____              |

#### Cohort LTV Calculation
```
Cohort LTV = Σ(Monthly Revenue × Retention Rate) for all months
Cohort LTV = $____
```

### Revenue Cohort Analysis

#### Net Revenue Retention (NRR)
```
NRR = (Starting ARR + Expansion - Contraction - Churn) / Starting ARR
NRR = ($____ + $____ - $____ - $____) / $____ = ____%
```

#### Gross Revenue Retention (GRR)
```
GRR = (Starting ARR - Churn - Contraction) / Starting ARR  
GRR = ($____ - $____ - $____) / $____ = ____%
```

## Advanced Unit Economics Analysis

### Customer Segmentation Analysis

#### Segment 1: [Segment Name]
- **Customer Count**: ____
- **ARPU**: $____
- **CAC**: $____
- **LTV**: $____
- **LTV/CAC**: ____:1
- **Payback Period**: ____ months

#### Segment 2: [Segment Name]
- **Customer Count**: ____
- **ARPU**: $____
- **CAC**: $____
- **LTV**: $____
- **LTV/CAC**: ____:1
- **Payback Period**: ____ months

#### Segment 3: [Segment Name]
- **Customer Count**: ____
- **ARPU**: $____
- **CAC**: $____
- **LTV**: $____
- **LTV/CAC**: ____:1
- **Payback Period**: ____ months

### Channel-Specific Analysis

#### Channel 1: [Channel Name]
- **CAC**: $____
- **Conversion Rate**: ____%
- **Customer Quality Score**: ____/10
- **LTV**: $____
- **LTV/CAC**: ____:1
- **Channel ROI**: ____%

#### Channel 2: [Channel Name]
- **CAC**: $____
- **Conversion Rate**: ____%
- **Customer Quality Score**: ____/10
- **LTV**: $____
- **LTV/CAC**: ____:1
- **Channel ROI**: ____%

## Scenario Analysis

### Base Case Scenario
- **LTV**: $____
- **CAC**: $____
- **LTV/CAC**: ____:1
- **Payback Period**: ____ months
- **Monthly Gross Margin**: $____

### Optimistic Scenario (+20% improvement)
- **LTV**: $____
- **CAC**: $____
- **LTV/CAC**: ____:1
- **Payback Period**: ____ months
- **Monthly Gross Margin**: $____

### Pessimistic Scenario (-20% performance)
- **LTV**: $____
- **CAC**: $____
- **LTV/CAC**: ____:1
- **Payback Period**: ____ months
- **Monthly Gross Margin**: $____

## Unit Economics Dashboard

### Key Performance Indicators

#### Health Metrics
- [ ] **LTV/CAC Ratio**: ____:1 (Target: >3:1)
- [ ] **Payback Period**: ____ months (Target: <12)
- [ ] **Gross Margin**: ____% (Target: >40%)
- [ ] **Monthly Churn**: ____% (Target: <5%)

#### Growth Metrics
- [ ] **Customer Growth Rate**: ____% monthly
- [ ] **Revenue Growth Rate**: ____% monthly
- [ ] **ARPU Growth Rate**: ____% monthly
- [ ] **LTV Growth Rate**: ____% quarterly

#### Efficiency Metrics
- [ ] **CAC Trend**: Decreasing/Stable/Increasing
- [ ] **Sales Efficiency**: ____% (Target: >100%)
- [ ] **Marketing ROI**: ____% (Target: >300%)
- [ ] **Customer Success Score**: ____/10

### Red Flag Indicators
- [ ] LTV/CAC ratio declining
- [ ] Payback period increasing
- [ ] Churn rate accelerating
- [ ] CAC increasing faster than LTV
- [ ] Gross margin compressing

## Implementation Guide

### Data Collection Requirements

#### Customer Data
- [ ] Customer acquisition dates
- [ ] Revenue by customer by month
- [ ] Customer churn events
- [ ] Customer segment classifications
- [ ] Product usage metrics

#### Financial Data
- [ ] Marketing spend by channel
- [ ] Sales team costs
- [ ] Cost of goods sold
- [ ] Customer support costs
- [ ] Payment processing fees

#### Operational Data
- [ ] Conversion rates by channel
- [ ] Sales cycle lengths
- [ ] Customer onboarding metrics
- [ ] Product engagement scores
- [ ] Support ticket volumes

### Tool Recommendations

#### Spreadsheet Tools
- Google Sheets with automated formulas
- Excel with pivot tables and charts
- Airtable for data organization
- Numbers for Mac users

#### Software Solutions
- ChartMogul for SaaS metrics
- Mixpanel for user analytics
- Amplitude for product analytics
- Looker for business intelligence

### Update Frequency

#### Daily Updates
- New customer acquisitions
- Daily revenue recognition
- Marketing spend tracking
- Customer activity monitoring

#### Weekly Updates
- Cohort performance review
- Channel effectiveness analysis
- Customer health scoring
- Revenue trend analysis

#### Monthly Updates
- Complete unit economics review
- Cohort analysis refresh
- Benchmark comparison
- Strategic recommendations

## Validation Checklist

### Data Quality Checks
- [ ] Revenue recognition accuracy
- [ ] Customer attribution verification
- [ ] Cost allocation validation
- [ ] Timing consistency checks

### Calculation Verification
- [ ] Formula accuracy review
- [ ] Cross-reference with financial statements
- [ ] Benchmark comparison validation
- [ ] Peer review completion

### Assumption Documentation
- [ ] Key assumptions documented
- [ ] Data source references
- [ ] Methodology explanations
- [ ] Limitation acknowledgments

---

**Template Version**: 1.0
**Last Updated**: May 2025
**Created By**: Financial Evaluation Framework Team

