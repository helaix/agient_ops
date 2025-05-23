# UI Design and Workflow Templates

## Overview

This directory provides reusable UI design prompts, workflow templates, and design guidelines for creating user interfaces and design-related workflows. These templates ensure consistency and efficiency in design-related tasks.

## UI Design Prompt Templates

### Basic UI Design Prompt

```markdown
# UI Design Request

## Project Context
- **Application**: [Application Name]
- **Target Users**: [User Demographics]
- **Platform**: [Web/Mobile/Desktop]
- **Framework**: [React/Vue/Angular/etc.]

## Design Requirements
- **Component Type**: [Button/Form/Modal/Page/etc.]
- **Functionality**: [What the component should do]
- **Interactions**: [User interactions required]
- **Responsive**: [Yes/No and breakpoints]

## Visual Guidelines
- **Brand Colors**: [Primary/Secondary colors]
- **Typography**: [Font families and sizes]
- **Spacing**: [Margin/padding standards]
- **Style**: [Modern/Classic/Minimalist/etc.]

## Technical Constraints
- **Accessibility**: [WCAG compliance level]
- **Browser Support**: [Supported browsers]
- **Performance**: [Loading time requirements]
- **Dependencies**: [Allowed libraries/frameworks]

## Deliverables
- [ ] Design mockups
- [ ] Component specifications
- [ ] Implementation code
- [ ] Documentation
```

### Advanced UI Design Prompt

```markdown
# Advanced UI Design Request

## Strategic Context
- **Business Goals**: [What business objectives does this support?]
- **User Journey**: [Where does this fit in the user experience?]
- **Success Metrics**: [How will success be measured?]
- **Timeline**: [Project deadlines and milestones]

## User Research
- **User Personas**: [Primary and secondary users]
- **Use Cases**: [Specific scenarios and workflows]
- **Pain Points**: [Current problems to solve]
- **User Feedback**: [Existing feedback or research]

## Design System Integration
- **Existing Components**: [Available design system components]
- **Brand Guidelines**: [Brand standards to follow]
- **Pattern Library**: [Established UI patterns]
- **Consistency Requirements**: [How to maintain consistency]

## Technical Architecture
- **Data Flow**: [How data moves through the component]
- **State Management**: [State requirements and patterns]
- **API Integration**: [Backend integration needs]
- **Error Handling**: [Error states and recovery]

## Accessibility Requirements
- **WCAG Level**: [A/AA/AAA compliance]
- **Screen Readers**: [Screen reader compatibility]
- **Keyboard Navigation**: [Keyboard accessibility]
- **Color Contrast**: [Contrast ratio requirements]

## Performance Requirements
- **Load Time**: [Maximum acceptable load time]
- **Bundle Size**: [Size constraints]
- **Optimization**: [Performance optimization needs]
- **Caching**: [Caching strategy requirements]

## Testing Strategy
- **Unit Tests**: [Component testing requirements]
- **Integration Tests**: [Integration testing needs]
- **User Testing**: [User testing plan]
- **Accessibility Testing**: [A11y testing approach]
```

## Design Workflow Templates

### Design Sprint Template

```markdown
# 5-Day Design Sprint

## Day 1: Understand
- [ ] Define the challenge
- [ ] Map the user journey
- [ ] Interview experts
- [ ] Identify target users
- [ ] Set sprint goals

## Day 2: Diverge
- [ ] Review existing solutions
- [ ] Sketch initial ideas
- [ ] Generate multiple concepts
- [ ] Share and discuss ideas
- [ ] Refine promising concepts

## Day 3: Decide
- [ ] Present all concepts
- [ ] Vote on best ideas
- [ ] Create storyboard
- [ ] Plan prototype
- [ ] Assign roles

## Day 4: Prototype
- [ ] Build testable prototype
- [ ] Create realistic interactions
- [ ] Prepare test scenarios
- [ ] Set up testing environment
- [ ] Recruit test users

## Day 5: Test
- [ ] Conduct user tests
- [ ] Gather feedback
- [ ] Analyze results
- [ ] Document learnings
- [ ] Plan next steps
```

### Component Design Workflow

```markdown
# Component Design Workflow

## 1. Discovery Phase
- [ ] Understand requirements
- [ ] Research existing solutions
- [ ] Identify constraints
- [ ] Define success criteria
- [ ] Create project timeline

## 2. Design Phase
- [ ] Create wireframes
- [ ] Design visual mockups
- [ ] Define interactions
- [ ] Specify responsive behavior
- [ ] Document design decisions

## 3. Review Phase
- [ ] Stakeholder review
- [ ] Design system review
- [ ] Accessibility review
- [ ] Technical feasibility review
- [ ] Incorporate feedback

## 4. Implementation Phase
- [ ] Create component structure
- [ ] Implement styling
- [ ] Add interactions
- [ ] Ensure responsiveness
- [ ] Test across browsers

## 5. Testing Phase
- [ ] Unit testing
- [ ] Visual regression testing
- [ ] Accessibility testing
- [ ] User acceptance testing
- [ ] Performance testing

## 6. Documentation Phase
- [ ] Component documentation
- [ ] Usage guidelines
- [ ] Code examples
- [ ] Design rationale
- [ ] Maintenance notes
```

## Design System Templates

### Component Specification Template

```markdown
# Component Specification: [Component Name]

## Overview
- **Purpose**: [What problem does this component solve?]
- **Usage**: [When and where should this be used?]
- **Variants**: [Different versions or states]

## Visual Design
- **Appearance**: [Visual description]
- **Dimensions**: [Size specifications]
- **Colors**: [Color usage]
- **Typography**: [Text styling]
- **Spacing**: [Margin and padding]

## Behavior
- **Interactions**: [How users interact with it]
- **States**: [Default, hover, active, disabled, etc.]
- **Animations**: [Transition and animation specs]
- **Responsive**: [Behavior on different screen sizes]

## Technical Specifications
- **Props/Attributes**: [Available configuration options]
- **Events**: [Events the component emits]
- **Dependencies**: [Required libraries or components]
- **Browser Support**: [Supported browsers]

## Accessibility
- **ARIA Labels**: [Required ARIA attributes]
- **Keyboard Support**: [Keyboard interactions]
- **Screen Reader**: [Screen reader considerations]
- **Focus Management**: [Focus behavior]

## Examples
```jsx
// Basic usage
<ComponentName prop1="value1" prop2="value2" />

// Advanced usage
<ComponentName
  prop1="value1"
  prop2="value2"
  onEvent={handleEvent}
  variant="primary"
/>
```

## Testing
- **Unit Tests**: [Test scenarios]
- **Visual Tests**: [Visual regression tests]
- **Accessibility Tests**: [A11y test cases]
- **Integration Tests**: [Integration scenarios]
```

### Design Token Template

```markdown
# Design Tokens: [Category]

## Color Tokens
```css
:root {
  /* Primary Colors */
  --color-primary-50: #f0f9ff;
  --color-primary-100: #e0f2fe;
  --color-primary-500: #0ea5e9;
  --color-primary-900: #0c4a6e;
  
  /* Semantic Colors */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
}
```

## Typography Tokens
```css
:root {
  /* Font Families */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'Fira Code', monospace;
  
  /* Font Sizes */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  
  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

## Spacing Tokens
```css
:root {
  /* Spacing Scale */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-8: 2rem;
  --space-16: 4rem;
  
  /* Component Spacing */
  --spacing-component-xs: var(--space-1);
  --spacing-component-sm: var(--space-2);
  --spacing-component-md: var(--space-4);
  --spacing-component-lg: var(--space-8);
}
```
```

## User Experience Guidelines

### UX Principles

1. **User-Centered Design**
   - Always prioritize user needs and goals
   - Base decisions on user research and feedback
   - Test designs with real users
   - Iterate based on user insights

2. **Accessibility First**
   - Design for all users, including those with disabilities
   - Follow WCAG guidelines
   - Test with assistive technologies
   - Provide alternative interaction methods

3. **Performance Matters**
   - Optimize for fast loading and smooth interactions
   - Minimize cognitive load
   - Provide immediate feedback for user actions
   - Design for various network conditions

4. **Consistency and Predictability**
   - Use established patterns and conventions
   - Maintain consistency across the application
   - Provide clear navigation and information architecture
   - Use familiar interaction patterns

### Design Process Guidelines

1. **Research and Discovery**
   - Understand the problem space
   - Research existing solutions
   - Identify user needs and pain points
   - Define success criteria

2. **Ideation and Exploration**
   - Generate multiple design concepts
   - Explore different approaches
   - Consider edge cases and error states
   - Validate ideas with stakeholders

3. **Design and Prototyping**
   - Create detailed designs and prototypes
   - Test interactions and flows
   - Validate design decisions
   - Iterate based on feedback

4. **Implementation and Testing**
   - Work closely with developers
   - Ensure design fidelity
   - Test with real users
   - Monitor and optimize post-launch

## Related Documentation

- [Quick References](../reference/quick_reference/README.md)
- [Workflow Checklists](../reference/workflow_checklists/README.md)
- [Decision Trees](../reference/decision_trees/README.md)
- [Integration Guidelines](../reference/integration_guidelines/README.md)

