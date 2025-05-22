# Review Feedback Template

## Overview
Use this template to provide structured, actionable feedback during code reviews. This ensures consistency and helps maintain high-quality standards across the Gemini Live Interface to CodeGen project.

## Review Information

**Reviewer:** [Your Name]  
**Review Date:** [Date]  
**PR/Branch:** [PR Number or Branch Name]  
**Author:** [Author Name]  
**Review Type:** [Code Review | Architecture Review | Security Review | Performance Review | Documentation Review]

## Summary

### Overall Assessment
- [ ] **Approve** - Ready to merge
- [ ] **Approve with Minor Changes** - Minor issues that can be addressed post-merge
- [ ] **Request Changes** - Significant issues that must be addressed before merge
- [ ] **Needs Discussion** - Requires team discussion before proceeding

### Key Strengths
*Highlight positive aspects of the implementation*
- 
- 
- 

### Areas for Improvement
*Identify main areas that need attention*
- 
- 
- 

## Detailed Feedback

### 🔴 Must Fix (Blocking Issues)
*Critical issues that prevent merge*

#### Issue #1: [Brief Description]
**File:** `path/to/file.js:line-number`  
**Severity:** Critical  
**Category:** [Security | Performance | Functionality | Architecture]

**Description:**
[Detailed description of the issue]

**Impact:**
[Explanation of why this is critical]

**Suggested Solution:**
```javascript
// Example of suggested fix
function improvedImplementation() {
  // Better approach
}
```

**References:**
- [Link to documentation or best practices]

---

#### Issue #2: [Brief Description]
**File:** `path/to/file.js:line-number`  
**Severity:** Critical  
**Category:** [Security | Performance | Functionality | Architecture]

**Description:**
[Detailed description of the issue]

**Impact:**
[Explanation of why this is critical]

**Suggested Solution:**
[Specific guidance on how to fix]

---

### 🟡 Should Fix (Important Issues)
*Important improvements that should be addressed*

#### Issue #1: [Brief Description]
**File:** `path/to/file.js:line-number`  
**Severity:** High  
**Category:** [Code Quality | Performance | Maintainability | Documentation]

**Description:**
[Detailed description of the issue]

**Rationale:**
[Why this improvement is important]

**Suggested Solution:**
[How to improve the code]

---

### 🔵 Consider (Suggestions)
*Optional improvements and suggestions*

#### Suggestion #1: [Brief Description]
**File:** `path/to/file.js:line-number`  
**Category:** [Optimization | Best Practice | Style | Documentation]

**Description:**
[Description of the suggestion]

**Benefits:**
[Why this would be beneficial]

**Implementation:**
[How to implement the suggestion]

---

### 🟢 Nitpick (Minor Issues)
*Minor style or preference issues*

#### Nitpick #1: [Brief Description]
**File:** `path/to/file.js:line-number`  
**Category:** [Style | Formatting | Naming]

**Description:**
[Minor issue description]

**Suggestion:**
[Simple fix or improvement]

---

### ❓ Questions (Clarification Needed)
*Questions about implementation decisions or unclear code*

#### Question #1: [Brief Description]
**File:** `path/to/file.js:line-number`

**Question:**
[Specific question about the implementation]

**Context:**
[Why you're asking this question]

---

## Specific Review Areas

### Code Quality
- [ ] **Readability:** Code is clear and easy to understand
- [ ] **Maintainability:** Code is well-structured and maintainable
- [ ] **Consistency:** Code follows established patterns and conventions
- [ ] **Documentation:** Adequate inline comments and documentation
- [ ] **Error Handling:** Comprehensive error handling implemented
- [ ] **Testing:** Adequate test coverage and quality

**Comments:**
[Specific feedback about code quality]

### Security
- [ ] **Input Validation:** All inputs are properly validated
- [ ] **Authentication:** Authentication mechanisms are secure
- [ ] **Authorization:** Access controls are properly implemented
- [ ] **Data Protection:** Sensitive data is properly protected
- [ ] **Vulnerability Prevention:** Common vulnerabilities are prevented

**Comments:**
[Specific feedback about security]

### Performance
- [ ] **Efficiency:** Code is efficient and performant
- [ ] **Scalability:** Implementation scales appropriately
- [ ] **Resource Usage:** Optimal use of system resources
- [ ] **Caching:** Appropriate caching strategies implemented
- [ ] **Database Optimization:** Database queries are optimized

**Comments:**
[Specific feedback about performance]

### Architecture
- [ ] **Design Patterns:** Appropriate design patterns are used
- [ ] **Modularity:** Code is properly modularized
- [ ] **Integration:** Integrates well with existing architecture
- [ ] **Extensibility:** Design supports future extensions
- [ ] **Dependencies:** Dependencies are appropriate and minimal

**Comments:**
[Specific feedback about architecture]

## Gemini Live Interface Specific Areas

### Real-time Communication
- [ ] **WebSocket Handling:** WebSocket connections are properly managed
- [ ] **Message Validation:** Real-time messages are validated
- [ ] **Error Recovery:** Connection recovery mechanisms work correctly
- [ ] **State Synchronization:** Client-server state is synchronized
- [ ] **Performance:** Real-time operations are optimized

**Comments:**
[Specific feedback about real-time features]

### Voice Processing
- [ ] **Audio Handling:** Audio processing is implemented correctly
- [ ] **Speech Recognition:** Integration with speech services works well
- [ ] **Latency:** Voice processing latency is acceptable
- [ ] **Quality:** Audio quality is maintained
- [ ] **Privacy:** Voice data privacy is protected

**Comments:**
[Specific feedback about voice processing]

### CodeGen Integration
- [ ] **Function Calling:** Dynamic function calling works correctly
- [ ] **API Integration:** CodeGen API integration is robust
- [ ] **Error Handling:** Integration errors are handled properly
- [ ] **Authentication:** Secure authentication with CodeGen
- [ ] **Monitoring:** Integration health is monitored

**Comments:**
[Specific feedback about CodeGen integration]

## Testing Feedback

### Test Coverage
- [ ] **Unit Tests:** Adequate unit test coverage
- [ ] **Integration Tests:** Integration scenarios are tested
- [ ] **Edge Cases:** Edge cases and error conditions are tested
- [ ] **Performance Tests:** Performance requirements are validated
- [ ] **Security Tests:** Security aspects are tested

**Comments:**
[Specific feedback about testing]

### Test Quality
- [ ] **Test Clarity:** Tests are clear and well-written
- [ ] **Test Maintainability:** Tests are maintainable and robust
- [ ] **Test Data:** Test data is realistic and comprehensive
- [ ] **Mock Usage:** Mocks and stubs are used appropriately
- [ ] **Test Organization:** Tests are well-organized

**Comments:**
[Specific feedback about test quality]

## Documentation Feedback

### Code Documentation
- [ ] **Inline Comments:** Complex logic is well-documented
- [ ] **Function Documentation:** Functions have proper documentation
- [ ] **API Documentation:** APIs are documented appropriately
- [ ] **Architecture Documentation:** Architectural decisions are documented

**Comments:**
[Specific feedback about documentation]

## Action Items

### For Author
1. [ ] [Specific action item with deadline]
2. [ ] [Specific action item with deadline]
3. [ ] [Specific action item with deadline]

### For Team
1. [ ] [Team-level action item]
2. [ ] [Team-level action item]

### Follow-up Required
- [ ] **Re-review needed** after changes are made
- [ ] **Architecture discussion** required with team
- [ ] **Security review** needed from security team
- [ ] **Performance testing** required before merge
- [ ] **Documentation update** needed

## Additional Notes

### Learning Opportunities
[Highlight learning opportunities for the author or team]

### Best Practices Reinforcement
[Reinforce good practices observed in the code]

### Process Improvements
[Suggest improvements to the development or review process]

## Review Completion

**Estimated Time to Address Feedback:** [Time estimate]  
**Next Review Date:** [If re-review is needed]  
**Reviewer Availability:** [When you're available for follow-up]

---

## Template Usage Guidelines

### Severity Levels
- **🔴 Must Fix:** Critical issues that block merge
- **🟡 Should Fix:** Important issues that should be addressed
- **🔵 Consider:** Suggestions for improvement
- **🟢 Nitpick:** Minor style or preference issues
- **❓ Questions:** Requests for clarification

### Best Practices
1. **Be Specific:** Point to exact lines and provide specific suggestions
2. **Be Constructive:** Focus on helping the author improve
3. **Be Educational:** Explain the reasoning behind suggestions
4. **Be Respectful:** Maintain a professional and respectful tone
5. **Be Balanced:** Acknowledge good practices alongside suggestions

### Review Categories
- **Security:** Authentication, authorization, data protection, vulnerabilities
- **Performance:** Efficiency, scalability, resource usage, optimization
- **Functionality:** Business logic, feature implementation, edge cases
- **Architecture:** Design patterns, modularity, integration, extensibility
- **Code Quality:** Readability, maintainability, consistency, documentation
- **Testing:** Coverage, quality, edge cases, performance validation

