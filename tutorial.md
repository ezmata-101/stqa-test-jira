# JIRA - API Testing Assignment Tutorial
### Using Postman with a Node.js/Express Project

---

> This tutorial markdown is created by AI from the subtitle of the tutorial: https://www.youtube.com/watch?v=42yofv00Obg
> Google Drive (If you face any audio issues): https://drive.google.com/file/d/1kIsId9_YFL16xBlI2F3mdmd6Z2vhPSGX/view?usp=sharing 

## Introduction

This video was created to clarify how to complete the API testing assignment, as there was some confusion following the earlier Postman class (possibly due to audio issues). This tutorial explains exactly what needs to be done, step by step.

---

## Where to Find Assignment Requirements

There are two key documents you need to read before starting:

1. **Assignment Announcement (README/MBJ file)** — This clearly describes what your report should contain and exactly what tasks need to be completed.
2. **`documentation.md` file** — This explains how to run the project, what each API endpoint does, and how to work with the project in general.

---

## Step 1: Get the Project

You have two options:

- **Download as ZIP** — simply download and extract the project folder.
- **Clone via Git** — copy the repository link and run:

```bash
git clone <repository-url>
```

Once cloned, open the project folder in **VS Code** (or any editor you prefer). You will see folders and files such as:
- `helpers/`
- `middleware/`
- `models/`
- `routes/`
- and some stored data files.

---

## Step 2: Install Node.js

If you haven't worked with JavaScript/Node.js before, you need to install **Node.js** first.

1. Search for **"Node.js download"** in your browser.
2. Select the installer for your OS (e.g., Windows x86 → download the MSI), **or** use the install command provided on the website.

> Node.js is already installed on the instructor's machine, so it won't be reinstalled in this demo.

---

## Step 3: Install Dependencies and Run the Server

The documentation already explains how to do this under **"How to Run"**.

**Install dependencies:**
```bash
npm install
```

This reads `package.json` and installs the listed dependencies, which include:
- `bcryptjs`
- `cors`
- `express`
- `jsonwebtoken`

**Start the server:**
```bash
npm start
```

The server will start running. If you encounter any issues during testing, stop the server with `Ctrl + C` and restart it — this resets all in-memory data.

---

## Step 4: Set Up Postman

### Option A: Desktop App (Recommended)
Download and install Postman on your PC. Use `http://localhost:3000` as your base URL.

### Option B: GitHub Codespaces (No Installation Needed)
If you don't want to install Postman or run the project locally:

1. Fork the repository to your own GitHub account.
2. Create a **Codespace** from your fork.
3. Open the Codespace in VS Code Desktop.
4. Run `npm install` then `npm start` in the terminal.
5. In the **Ports** tab, change the port visibility from **Private** to **Public**.
6. Copy the generated public URL — use this as your base URL in Postman (web version).

---

## Step 5: Create a Postman Workspace and Collection

1. Open Postman and create a new **Workspace** (Blank type).
2. Name it something like: `Jira API Test`
3. Inside the workspace, create a **Collection** named `API Test`.
4. Set your **Base URL** as a collection variable (e.g., `http://localhost:3000` or your Codespace URL).
5. Save the base URL as a collection-level variable so all requests can reuse it.

---

## Step 6: Test the API Endpoints

### Available Endpoints
The `documentation.md` file lists all available endpoints, including:
- `POST /auth/register` — Register a new user
- `POST /auth/login` — Login (returns JWT token)
- Issue-related routes (create, update, delete issues)

### Example: Testing User Registration (`POST /auth/register`)

**Create a new request** in your collection:
- Method: `POST`
- URL: `{{baseURL}}/auth/register`
- Body → Raw → JSON:

```json
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "pass123"
}
```

**Expected result (success):**
- Status: `201 Created`
- Response body contains: `id`, `username`, `email`

> **Note:** If you get a double slash (`//auth/register`), remove the trailing slash from your base URL variable.

---

## Step 7: Write Test Scripts in Postman

After sending a request, go to the **Scripts** tab in Postman and write assertions.

### Test 1: Successful Registration
```javascript
pm.test("Successful Registration", function () {
    pm.response.to.have.status(201);
    pm.expect(pm.response.json().id).to.not.be.null;
});
```

### Test 2: Duplicate Username
```javascript
pm.test("Duplicate Username Returns 409", function () {
    pm.response.to.have.status(409);
    pm.expect(pm.response.json().error).to.equal("Username already taken");
});
```

### Test 3: Duplicate Email
```javascript
pm.test("Duplicate Email Returns 409", function () {
    pm.response.to.have.status(409);
    pm.expect(pm.response.json().error).to.equal("Email already in use");
});
```

> **Tip:** Restart the server before running the full test suite to reset all data. Otherwise, duplicate-check tests may behave unexpectedly on a clean run.

---

## Step 8: Run All Tests

1. In Postman, select your collection (`API Test`).
2. Click **Run** → **Start Run**.
3. All saved requests will execute in sequence.
4. You will see a summary: how many **Passed** and how many **Failed**.

> Make sure all requests are **saved** before running, otherwise they won't appear in the test runner.

---

## Step 9: Document Your Test Cases (Test Plan)

Create a table in **Google Docs** or **Microsoft Word** with the following columns (as specified in the assignment announcement):

| ID | Title | Pre-condition | Steps | Expected Output | Actual Output | Evidence | Status (Pass/Fail) |
|----|-------|---------------|-------|-----------------|---------------|----------|--------------------|
| 1  | Successful Registration | None | POST /auth/register with valid data | 201 + user ID returned | 201 + ID received | screenshot.png | Pass |
| 2  | Duplicate Username | User "alice" already exists | POST /auth/register with username "alice" | 409 + "Username already taken" | 409 + correct message | screenshot.png | Pass |
| 3  | Duplicate Email | User with email exists | POST /auth/register with same email | 409 + "Email already in use" | 201 (bug!) | screenshot.png | **Fail** |

You should create as many test cases as possible — 50, 100, or more.

---

## Step 10: Document Defects (Bug Report)

For every **failed** test case, create a separate **Defects Table** with these columns (as listed in the announcement):

| ID | Title | Severity | Steps to Reproduce | Expected Result | Actual Result | Test Case # |
|----|-------|----------|--------------------|-----------------|---------------|-------------|
| 1  | Duplicate email not rejected | Major | Create user with email X, then create another with email X | 409 Error | 201 Created | TC-3 |

---

## Step 11: Collect Evidence (Screenshots)

For each test case (pass or fail):

1. Take a **screenshot** of the Postman response.
2. Create a folder named `evidence/` in your project.
3. Save screenshots with descriptive names (e.g., `tc1_success_registration.png`).
4. Reference the filename in your test case table's **Evidence** column.

Alternatively, you can export the full Postman collection documentation via **Publish Docs** inside Postman.

---

## Step 12: Individual Reflections

Each team member must write an **Individual Reflection** section in the report, structured like:

| Student ID | Work Done |
|------------|-----------|
| [Your ID]  | Tested auth routes (register, login) |
| [Partner ID] | Tested issue routes (create, update, delete) |

Each person should mention which routes/endpoints they personally tested.

---

## Final Submission

- Compile your **Test Plan**, **Test Cases**, **Defects**, and **Individual Reflections** into a single document.
- Export/save it as a **PDF**.
- Submit the PDF as required.

---

## Summary Checklist

- [ ] Project cloned/downloaded and running locally or in Codespaces
- [ ] Node.js installed and `npm install` + `npm start` completed
- [ ] Postman workspace and collection created
- [ ] All API endpoints tested with multiple test cases
- [ ] Postman test scripts written for each request
- [ ] Full test run executed (Pass/Fail summary obtained)
- [ ] Test Cases table completed with evidence screenshots
- [ ] Defects table completed for failed tests
- [ ] Individual Reflections written for each team member
- [ ] Final document exported as PDF and submitted

---

*If you have any confusion, ask in the group — those who have already completed the assignment can help.*
