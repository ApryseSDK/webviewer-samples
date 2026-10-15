#!/usr/bin/env bash
# Shared branch-name validation for local Git hooks and GitHub Actions on CI.
#
# Default behavior is soft validation (warning only). To enforce blocking behavior,
# set BRANCH_NAME_POLICY_MODE=strict before calling this script.
#
# Examples:
#   BRANCH_NAME_POLICY_MODE=soft ./check-branch-name.sh
#   BRANCH_NAME_POLICY_MODE=strict ./check-branch-name.sh
#
# GitHub Actions can also use this script and read the following outputs when
# GITHUB_OUTPUT is defined:
#   status=pass|fail
#   failed_rules=requiredPrefix|requiredTicketID|...

set -u

MODE="${BRANCH_NAME_POLICY_MODE:-strict}"
BRANCH_NAME="${1:-$(git symbolic-ref --short HEAD 2>/dev/null || echo "")}"

trimmed_branch="$BRANCH_NAME"

if [[ -z "$trimmed_branch" || "$trimmed_branch" == "HEAD" || "$trimmed_branch" == "DETACHED" ]]; then
  echo "Branch name validation skipped: no branch name available."
  exit 0
fi

# Default branches and explicitly ignored prefixes are excluded from validation.
# These are kept in the same shape as the repo ignore list (e.g. release, copilot),
# while still allowing branch names beneath those prefixes such as release/1.2.0.
ignored_branch_regex='^(main|master|staging|development|develop|integration|production|release|copilot)(/.*)?$'
if [[ "$trimmed_branch" =~ $ignored_branch_regex ]]; then
  if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
    echo "status=pass" >> "$GITHUB_OUTPUT"
    echo "failed_rules=" >> "$GITHUB_OUTPUT"
  fi
  echo "Branch '$trimmed_branch' is excluded from policy validation."
  exit 0
fi

allowed_prefixes=(
  feature
  feature-branch
  bugfix
  maintenance
  chore
  docs
  experiment
  test
)

# Keep the validation rule IDs in one place so the shell script and GitHub Actions label mapping stay aligned.
validation_rule_ids=(
  requiredPrefix
  requiredTicketID
  requiredTitle
  requiredLength
)

# Shared branch-name policy for repository-owned local and CI validation.
declare -a failed_rules=()
failed_rule_count=0

is_valid_rule_id() {
  local rule_name="$1"
  local valid_rule
  for valid_rule in "${validation_rule_ids[@]}"; do
    if [[ "$valid_rule" == "$rule_name" ]]; then
      return 0
    fi
  done
  return 1
}

add_failure() {
  local rule_name="$1"
  if ! is_valid_rule_id "$rule_name"; then
    return
  fi
  if (( failed_rule_count == 0 )); then
    failed_rules+=("$rule_name")
    ((failed_rule_count += 1))
    return
  fi
  local existing_rule
  for existing_rule in "${failed_rules[@]}"; do
    if [[ "$existing_rule" == "$rule_name" ]]; then
      return
    fi
  done
  failed_rules+=("$rule_name")
  ((failed_rule_count += 1))
}

get_rule_error_message() {
  local rule_name="$1"
  case "$rule_name" in
    "${validation_rule_ids[0]}")
      echo "ERROR: Branch name validation failed: invalid prefix." >&2
      ;;
    "${validation_rule_ids[1]}")
      echo "ERROR: Branch name validation failed: invalid ticket segment." >&2
      ;;
    "${validation_rule_ids[2]}")
      echo "ERROR: Branch name validation failed: invalid title format." >&2
      ;;
    "${validation_rule_ids[3]}")
      echo "ERROR: Branch name validation failed: length exceeds 120 characters." >&2
      ;;
    *)
      echo "Unknown validation rule: $rule_name" >&2
      return 1
      ;;
  esac
}

get_rule_warning_message() {
  local rule_name="$1"
  case "$rule_name" in
    "${validation_rule_ids[0]}")
      echo "WARNING: Branch name validation failed: invalid prefix."
      ;;
    "${validation_rule_ids[1]}")
      echo "WARNING: Branch name validation failed: invalid ticket segment."
      ;;
    "${validation_rule_ids[2]}")
      echo "WARNING: Branch name validation failed: invalid title format."
      ;;
    "${validation_rule_ids[3]}")
      echo "WARNING: Branch name validation failed: length exceeds 120 characters."
      ;;
    *)
      echo "Unknown validation rule: $rule_name" >&2
      return 1
      ;;
  esac
}

get_rule_help_message() {
  local rule_name="$1"
  case "$rule_name" in
    "${validation_rule_ids[0]}")
      printf '%s\n' 'Prefix must be one of: feature|feature-branch|bugfix|maintenance|chore|docs|experiment|test'
      printf '%s\n' 'Example: feature/as-123-enable-dark-mode'
      ;;
    "${validation_rule_ids[1]}")
      printf '%s\n' 'Must include at least 2 letters, a hyphen, and one or more digits.'
      printf '%s\n' 'Example ticket segment: as-123'
      ;;
    "${validation_rule_ids[2]}")
      printf '%s\n' 'After the first /, use letters and numbers joined by hyphens.'
      printf '%s\n' 'Example: maintenance/as-123-enable-dark-mode'
      ;;
    "${validation_rule_ids[3]}")
      echo "Shorten the branch name to 120 characters or less."
      ;;
    *)
      echo "Unknown validation rule: $rule_name" >&2
      return 1
      ;;
  esac
}

get_rule_label_message() {
  local rule_name="$1"
  case "$rule_name" in
    "${validation_rule_ids[0]}")
      echo '🚢 Branch Name: Invalid Prefix'
      ;;
    "${validation_rule_ids[1]}")
      echo '🔖 Branch Name: Invalid Ticket'
      ;;
    "${validation_rule_ids[2]}")
      echo '📋 Branch Name: Invalid Title'
      ;;
    "${validation_rule_ids[3]}")
      echo '📏 Branch Name: Too Long'
      ;;
    *)
      echo "Unknown validation rule: $rule_name" >&2
      return 1
      ;;
  esac
}

  # requiredPrefix: the first segment must match an approved branch prefix such as feature, bugfix, or hotfix.
  # Example passing name: feature/AS-123-some-decription
  # Example failing name: badprefix/AS-123-some-decription

if [[ "$trimmed_branch" =~ ^([^/]+)/ ]]; then
  branch_prefix="${BASH_REMATCH[1]}"
  prefix_is_allowed=0
  for allowed_prefix in "${allowed_prefixes[@]}"; do
    if [[ "$branch_prefix" == "$allowed_prefix" ]]; then
      prefix_is_allowed=1
      break
    fi
  done
  if [[ "$prefix_is_allowed" -eq 0 ]]; then
    add_failure "${validation_rule_ids[0]}"
  fi
else
  add_failure "${validation_rule_ids[0]}"
fi

# requiredTicketID: branch must contain a ticket segment like "as-123" after the prefix.
# Example passing name: feature/as-123-some-decription
# Example failing name: feature/123-some-decription
if [[ ! "$trimmed_branch" =~ ^[^/]+/[A-Za-z]{2,}-[0-9]+ ]]; then
  add_failure "${validation_rule_ids[1]}"
fi

# requiredTitle: branch title must be a hyphenated alphanumeric slug after the first slash.
# Example passing name: feature/as-123-some-decription
# Example failing name: feature/as-123_some_decription
if [[ ! "$trimmed_branch" =~ ^[^/]+/[A-Za-z0-9]+(-[A-Za-z0-9]+)*$ ]]; then
  add_failure "${validation_rule_ids[2]}"
fi

# requiredLength: total branch name must stay within the repo's 120-character limit.
# Example passing name: feature/as-123-some-decription
# Example failing name: feature/as-123-some-really-long-description-that-exceeds-the-120-character-limit-which-should-trigger-a-validation-error

if (( ${#trimmed_branch} > 120 )); then
  add_failure "${validation_rule_ids[3]}"
fi


# This is the logical failure handler: once validation records one or more failed rules,
# the script emits the rule details and exits with status 1 in strict mode or status 0 in soft mode.
if (( failed_rule_count > 0 )); then
  if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
    echo "status=fail" >> "$GITHUB_OUTPUT"
    printf 'failed_rules=%s\n' "$(IFS='|'; echo "${failed_rules[*]}")" >> "$GITHUB_OUTPUT"
    printf 'validation_rule_ids=%s\n' "$(IFS='|'; echo "${validation_rule_ids[*]}")" >> "$GITHUB_OUTPUT"
  fi

  all_label_output=()
  failed_label_output=()
  for rule_name in "${validation_rule_ids[@]}"; do
    all_label_output+=("$(get_rule_label_message "$rule_name")")
  done
  for rule_name in "${failed_rules[@]}"; do
    failed_label_output+=("$(get_rule_label_message "$rule_name")")
  done

  # Local hook runs still print each failed rule message directly to the terminal.
  # The GitHub output writes below are only used by CI workflows to read machine-readable results.
  if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
    printf 'all_labels=%s\n' "$(IFS='|'; echo "${all_label_output[*]}")" >> "$GITHUB_OUTPUT"
    printf 'failed_labels=%s\n' "$(IFS='|'; echo "${failed_label_output[*]}")" >> "$GITHUB_OUTPUT"
  fi

  for rule_name in "${failed_rules[@]}"; do
    if [[ "$MODE" == "strict" ]]; then
      get_rule_error_message "$rule_name"
    else
      echo "$(get_rule_warning_message "$rule_name")"
    fi
    get_rule_help_message "$rule_name"
    echo ""
  done

  if [[ "$MODE" == "strict" ]]; then
    exit 1
  fi

  exit 0
fi

# This success path runs only after the earlier failure guard determined that no rules were violated.
# Local shell runs print the success message directly; GitHub Actions also writes the pass result to GITHUB_OUTPUT.
if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  echo "status=pass" >> "$GITHUB_OUTPUT"
  echo "failed_rules=" >> "$GITHUB_OUTPUT"
  printf 'validation_rule_ids=%s\n' "$(IFS='|'; echo "${validation_rule_ids[*]}")" >> "$GITHUB_OUTPUT"

  all_label_output=()
  for rule_name in "${validation_rule_ids[@]}"; do
    all_label_output+=("$(get_rule_label_message "$rule_name")")
  done
  printf 'all_labels=%s\n' "$(IFS='|'; echo "${all_label_output[*]}")" >> "$GITHUB_OUTPUT"
  echo "failed_labels=" >> "$GITHUB_OUTPUT"
fi

echo "Branch name validation passed: $trimmed_branch"
exit 0