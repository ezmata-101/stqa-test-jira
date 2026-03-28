# Assignment Announcement — System Testing (Jira-Lite API)

## Deadline
* **April 10, 2026 (Friday) - 11:59 pm**

## Presentation
* **Section B, C: April 11, 2026 (Saturday)**
* **Section A, D: April 12, 2026 (Sunday)**
    * Each team will do a short in-class presentation of the key defects they found.

## What you'll do

You will perform **system testing** on the **Jira-Lite API** — a system that handles users, teams, projects, issues, and comments, secured with **JWT-based authentication** and running on **in-memory storage**.

* **Specifications & how to run:** Everything you need is in **`documentation.md`** — endpoints, expected behaviors, and setup instructions.
* **Do not** copy API specs into your report. Just **reference `documentation.md`**.

## Important context

The API may have bugs — some intentional, some not. **Your job is to find them, reproduce them, and report them.** That's it. You're not here to fix the code.

Use whatever tools work for you — Postman, REST-assured, custom scripts, anything.

> Quality over quantity. A handful of well-documented, reproducible defects is worth far more than a long list of shallow ones.

> [!CAUTION]
> ## Collaboration & Plagiarism Policy
> 
> **This section is strictly enforced. Please read it.**
> 
> There's a clear line between what's allowed and what isn't:
> 
> * You can talk to other teams about general approaches — tool setup, how to structure a test plan, how JWT works.
> * **Do NOT share** test cases, test data, or specific test ideas with anyone outside your team — not verbally, not in writing, not in any form.
> * **Do not use AI tools**, the internet, or peers to generate your test cases or defect ideas. Your work must come from your own hands-on analysis of the system.
> * **Do not copy or paraphrase** anything from external sources. Rewriting someone else's test case in your own words is still plagiarism.
> * If your team is caught sharing or receiving specific testing content, **everyone involved will be penalized** — regardless of who started it.
> 
> If you're unsure whether something is okay, it probably isn't. **Don't share. Don't copy.**


## Deliverables

Grading will be split between **report quality** and **testing coverage/effectiveness** — both matter.

Submit one PDF report and an evidence folder. Your report must have these sections:

1. **Test Plan**
    * For each endpoint or behavior, document your input choices and what you expect back (output + HTTP status code). Use the class slides as a guide.

2. **Test Cases**
    * Use a table or list format with: **ID, Short Title, Pre-conditions, Steps, Expected, Actual, Status, Evidence link, Pass/Fail**.
    * Cover the full range: happy paths, bad inputs, auth failures, permission checks, membership rules, issue lifecycle transitions, comment restrictions, filter behavior, and edge cases.

3. **Defect Reports**
    * For each defect: ID, Title, Severity, **Steps to Reproduce**, Expected, Actual, Test Case No.
    * Group related defects together and flag cascading or duplicate issues where relevant.

4. **Individual Reflections** *(1 page total for the whole team)*
    * A short paragraph from each team member on what they personally contributed to the testing effort.

### Evidence folder
Attach screenshots, raw JSON responses, and logs — named and organized by test or defect ID. Postman exports are fine. If you wrote scripts, include the relevant snippets.

## Bonus

Build something genuinely useful — a reusable test harness, a scenario runner that covers auth + issue lifecycle + permissions, a fuzzer, anything that goes beyond a basic fetch-and-check script — and you may earn bonus credit. Include the repo link in your report.

## Submission

Name your archive exactly as specified in ELMS:
**`<StudentID1>_..._<StudentIDn>_SystemTesting.zip`**

Inside:
* `<StudentID1>_..._<StudentIDn>_SystemTestingReport.pdf`
* `evidence/` folder

## A Few Last Things

* Don't touch the code. If something is broken, **report it**.
* Every defect should be reproducible and backed by evidence.
* When in doubt about anything technical, check **`documentation.md`** first.
