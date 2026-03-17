# Git Workflow

Complete workflow guide for contributing to Hazon Bible App. For quick reference, see [AGENTS.md](../AGENTS.md).

---

## Critical Rules

- **ALWAYS create a new branch BEFORE making any changes**
- **ALWAYS pull latest from main** before creating the branch
- **NEVER make changes directly on main branch**
- **Never auto commit** - wait for user to instruct when to commit
- **Each PR must have CHANGELOG.md updated** before creating PR

---

## Branch Naming

| Type | Naming Convention | Example |
|------|------------------|---------|
| Feature | `feature/description` | `feature/notes-annotations` |
| Fix | `fix/description` | `fix/search-scroll` |
| Enhancement | `enhancement/description` | `enhancement/journal-icons` |

---

## Workflow Steps

### 1. Create Branch

```bash
git checkout main && git pull && git checkout -b enhancement/description
```

### 2. Implement Changes
- Make code changes
- Run typecheck: `pnpm run typecheck`
- Test with user - Do NOT commit yet

### 3. Wait for Approval
- User reviews and tests
- User says "commit" or "proceed"

### 4. Update Documentation
- Update CHANGELOG.md with changes
- Update docs/TODOS.md (mark as completed)

### 5. Commit and Push

```bash
git add .
git commit -m "Description of changes"
git push -u origin branch-name
```

### 6. Create PR
- Create PR on GitHub
- User manually approves and merges

---

## Feature Branching Strategy

### Atomic Branching Rules

1. **One concern per branch** - Each branch should address exactly one enhancement or feature
2. **Quick wins first** - Start with smallest enhancements to build momentum  
3. **Branch from `main`** - Always branch from latest main
4. **Wait for user approval** - Never commit or merge without explicit user instruction
5. **Fast-follow PRs** - After user approval, create PR quickly

### Enhancement Breakdown Example

**Bad**: One branch with "All UI improvements"  
**Good**: Separate branches:
- `enhancement/journal-icon-change` (5 min work)
- `enhancement/note-card-styling` (10 min work)  
- `enhancement/note-typography` (10 min work)
- `enhancement/note-count-badge` (20 min work)

---

## PR Guidelines

| PR Size | Lines | Review Process |
|---------|-------|----------------|
| Small | 1-50 | Quick review, user manually approves |
| Medium | 50-200 | User reviews and approves |
| Large | 200+ | Break into smaller branches |

---

## Pre-PR Checklist

- [ ] Run typecheck: `pnpm run typecheck`
- [ ] Update CHANGELOG.md with changes
- [ ] Wait for user to approve commit
- [ ] Create PR

---

## Post-Feature Checklist

After completing any feature/enhancement:
- [ ] Confirm next task with user - Get explicit confirmation before starting next enhancement/feature

---

*See [AGENTS.md](../AGENTS.md) for critical reminders and quick reference.*
