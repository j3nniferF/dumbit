# Branch Protection Rulesets

This directory contains GitHub branch protection rulesets for the repository.

## 🎯 Personal Project - Minimal Protection

Since this is a **personal project with a single contributor**, the ruleset has been simplified to provide basic safety without restricting your workflow.

### Main Branch Protection Ruleset

The `main-branch-protection.json` file defines **minimal** protection rules for the main branch:

### Rules Applied (Minimal Safety Net):

1. **Branch Deletion Prevention**
   - Prevents accidentally deleting the main branch
   - You can still commit directly, create branches, and work freely

2. **Force Push Prevention (Non-Fast-Forward)**
   - Prevents accidental force pushes that could lose commit history
   - Normal pushes work without any restrictions

### What's NOT Required (For Solo Development):

❌ No pull request requirements - you can commit directly to main  
❌ No status checks required - you can push even if CI fails  
❌ No linear history requirement - use any merge strategy you prefer  
❌ No code reviews required - it's your project!

### Bypass Actors

- As the repository owner/administrator, you can bypass these rules in GitHub settings if needed

## When to Use Full Branch Protection

For **team projects** or **production repositories**, you might want stronger protections:

- ✅ Multiple contributors working together
- ✅ Need code review before merging
- ✅ Want to enforce passing tests/CI before deployment
- ✅ Need strict git history requirements

**To add full protection**, edit `main-branch-protection.json` and add rules like:
- `required_linear_history` - Enforce clean git history
- `required_status_checks` - Require CI/CD to pass
- `pull_request` - Require code reviews

## How to Remove All Protection

If you want **no restrictions at all**, simply delete this entire `.github/rulesets/` directory:

```bash
rm -rf .github/rulesets/
```

This will allow you to work on main with complete freedom (use with caution!).

## Additional Information

For more information about GitHub rulesets, see the [GitHub documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets).
