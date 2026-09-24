# Test File

Testing branch name validation, starting  with passing branches and then will test on branches that should fail.

## Passing

### All lower case, has approve prefix, has ticket id, and description

`test/lbc-5-some-title`

`test/lbc-5-some-long-name-with-117-characters-long-will-be-accepted-as-the-schema-agreed-upon-by-the-team-is-120`


## Failing

### Upper case ticket id

`test/LBC-5-some-title`

### Prefix should end with `/`

`feature-lbc-5-some-title`

### Exceeds 120 characters long

`test/lbc-5-some-long-name-with-129-characters-long-will-be-rejected-as-it-violates-the-schema-agreed-upon-by-the-team-at-120`

### Missing ticket number
`bugfix/x`

### Uses prefix that is not approved

`ideas/lbc-5-title-description`

## Test Commands

```
//Set to main: 
git checkout main

//Report branches 
git branch -r

//See branches 
`git branch --all`

//Create branch
git checkout -b test/lbc-5-implement-global-config-change-for-feature-branches


//Stage everything
git add -A

//Commit wit title and description
git commit -m "Implement global config change for feature branches" -m "Adds global config handling for feature branches. Updates related setup and keeps existing behavior for main branch."

//Push changes to repo
git push -u origin test/lbc-5-implement-global-config-change-for-feature-branches

//create PR
gh pr create --base main --head test/lbc-5-implement-global-config-change-for-feature-branches --title "Implement global config change for feature branches" --body "Summary of changes and validation."

//Delete branch 
git branch -d test/lbc-5-implement-global-config-change-for-feature-branches

//Commit deletion 
git push origin test/lbc-5-implement-global-config-change-for-feature-branches

```

























