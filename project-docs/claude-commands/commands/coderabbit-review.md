---
description: CodeRabbit Review Analysis
argument-hint: [pr-number]
model: claude-sonnet-4-5-20250929
---

I need your help analyzing and addressing CodeRabbit review comments saved on review-comments/pr$ARGUMENTS.md for PR #$ARGUMENTS. Please review
the CodeRabbit comments from the file and help me understand and implement the
suggested fixes.

IMPORTANT: Please first analyze each comment critically - CodeRabbit AI can sometimes be wrong or make suggestions that
don't apply to our specific context. Don't assume all comments are valid.

Please help me with the following:

1. **Comment Validation**: For each comment, first determine if you:
    - **Agree**: The comment is valid and should be addressed
    - **Disagree**: The comment is incorrect, not applicable, or based on flawed assumptions
    - **Partially Agree**: Some aspects are valid but others are not

   Provide reasoning for your assessment.

2. **Prioritization**: For comments you agree with (fully or partially), suggest which ones should be addressed first
   based on:
    - Severity (critical > major > minor > info)
    - Impact on code quality and maintainability
    - Potential for introducing bugs or security issues

3. **Implementation Guidance**: For each comment you recommend addressing:
    - Explain the issue in simple terms
    - Provide specific code changes or implementation steps
    - If there are AI prompts included, use them as guidance for the implementation approach

4. **Code Quality Assessment**:
    - Are there any patterns or recurring issues across the valid comments?
    - What do the valid comments suggest about the overall code quality?
    - Are there any architectural or design improvements implied by the comments?

5. **Implementation Plan**:
    - Suggest a logical order for implementing the fixes
    - Identify any dependencies between different fixes
    - Estimate effort level (low/medium/high) for each fix

6. **Analysis Summary**: Create a structured summary in this format and save it as review-comments/pr$ARGUMENTS-analysis.md:

```markdown
# CodeRabbit Review Analysis - PR #$ARGUMENTS

## Comment Assessment Summary

| # | Comment Title | Agreement | Reason | Priority | Effort |
|---|---------------|-----------|--------|----------|---------|
| 1 | [Comment Title] | Agree/Disagree/Partial | [Brief reason] | High/Med/Low | Low/Med/High |
| 2 | [Comment Title] | Agree/Disagree/Partial | [Brief reason] | High/Med/Low | Low/Med/High |

## Recommended Actions

### High Priority

- [List of agreed-upon high priority items]

### Medium Priority

- [List of agreed-upon medium priority items]

### Low Priority

- [List of agreed-upon low priority items]

### Rejected Comments

- [List of disagreed comments with reasoning]

## Implementation Order

1. [First fix to implement]
2. [Second fix to implement]
3. [etc...]
```

Please be specific and actionable in your recommendations. If you need to see the current code to provide better
guidance, let me know which files to share.
