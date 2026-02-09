# Branch Protection Rulesets

This directory contains GitHub branch protection rulesets for the repository.

## Main Branch Protection Ruleset

The `main-branch-protection.json` file defines protection rules for the main branch:

### Rules Applied:

1. **Branch Deletion Prevention**
   - Prevents anyone from deleting the main branch

2. **Force Push Prevention (Non-Fast-Forward)**
   - Prevents force pushes to maintain commit history integrity
   - Ensures no commits are lost through forced updates

3. **Required Linear History**
   - Enforces a linear commit history
   - Requires merge commits or rebase to maintain clean history

4. **Required Status Checks**
   - Requires the following GitHub Actions workflows to pass before merging:
     - `deploy / upload` - Upload artifacts for GitHub Pages
     - `deploy / deploy` - Deploy to GitHub Pages
   - Uses strict status checks policy (branch must be up-to-date before merging)

5. **Pull Request Requirements**
   - Requires at least 1 approving review before merging
   - Dismisses stale reviews when new commits are pushed
   - Requires all review threads to be resolved before merging

### Bypass Actors

- Repository administrators can bypass these rules when necessary

## How to Apply This Ruleset

This ruleset is automatically applied when the JSON file is present in the repository. GitHub will read and enforce these rules for the specified branches.

To modify the ruleset:
1. Edit the JSON file in `.github/rulesets/`
2. Commit and push the changes
3. GitHub will automatically update the ruleset

## Additional Information

For more information about GitHub rulesets, see the [GitHub documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets).
