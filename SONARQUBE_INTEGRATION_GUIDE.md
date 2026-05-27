# SonarQube Integration Guide for MERN Project

## Prerequisites

This guide will help you set up SonarQube Community Edition on your localhost and integrate your MERN project.

---

## Step 1: Install SonarQube Community Edition

### Option A: Docker (Recommended - Easiest)

```bash
# Pull and run SonarQube in Docker
docker run -d --name sonarqube -p 9000:9000 sonarqube:latest
```

Access it at: `http://localhost:9000`

Default credentials:
- Username: `admin`
- Password: `admin`

### Option B: Direct Installation (Windows)

1. **Download SonarQube Community Edition**
   - Visit: https://www.sonarqube.org/downloads/
   - Download the Windows ZIP file
   - Extract to a folder (e.g., `C:\sonarqube`)

2. **Start SonarQube**
   ```bash
   cd C:\sonarqube\bin\windows-x86-64
   StartSonar.bat
   ```

3. Access at: `http://localhost:9000`

---

## Step 2: Initial SonarQube Setup

1. **Login to SonarQube**
   - Go to `http://localhost:9000`
   - Login with default credentials (admin/admin)
   - Change your password

2. **Create a Project**
   - Click "Create project" or "Projects" → "Create"
   - Select "Manually"
   - Enter:
     - **Project key**: `Notes-App---Abdul-Baseer`
     - **Project name**: `Notes App - Abdul Baseer`
   - Click "Create project"

3. **Generate Token**
   - Click your avatar → "My Account" → "Security"
   - Click "Generate Tokens"
   - Name: `sonar-scanner-token`
   - Type: `Global Analysis Token`
   - Save the token (you'll need it)

---

## Step 3: Install Required Dependencies

### Backend
```bash
cd backend
npm install --save-dev sonarqube-scanner
```

### Frontend
```bash
cd ../frontend
npm install --save-dev sonarqube-scanner
```

### Root
```bash
cd ..
npm install --save-dev sonarqube-scanner
```

---

## Step 4: Generate Test Coverage Reports

### Backend
```bash
cd backend
npm test -- --coverage
```

### Frontend
```bash
cd ../frontend
npm test -- --watchAll=false --coverage
```

---

## Step 5: Update Configuration Files

### Update `sonar-project.properties`

```properties
sonar.projectKey=Notes-App---Abdul-Baseer
sonar.projectName=Notes App - Abdul Baseer
sonar.projectVersion=1.0.0

# Source and test directories
sonar.sources=backend/src,frontend/src
sonar.tests=backend/tests,frontend/src

# Exclusions
sonar.exclusions=**/node_modules/**,**/coverage/**,**/build/**,**/dist/**,**/.env,**/tests/**,**/.next/**

# Test inclusions
sonar.test.inclusions=**/*.test.js,**/*.test.jsx,**/*.spec.js,**/*.spec.jsx

# Coverage reports
sonar.javascript.lcov.reportPaths=backend/coverage/lcov.info,frontend/coverage/lcov.info

# Encoding and host
sonar.sourceEncoding=UTF-8
sonar.host.url=http://localhost:9000
sonar.token=YOUR_TOKEN_HERE
```

**Replace `YOUR_TOKEN_HERE` with your actual token from Step 2**

---

## Step 6: Run SonarQube Scanner

### Option A: Using the scanner directly (from root directory)

```bash
npx sonarqube-scanner
```

### Option B: Using npm script (Recommended)

Add to your root `package.json`:

```json
{
  "scripts": {
    "sonar": "sonarqube-scanner",
    "sonar:backend": "cd backend && npm test -- --coverage && cd .. && npx sonarqube-scanner",
    "sonar:frontend": "cd frontend && npm test -- --watchAll=false --coverage && cd .. && npx sonarqube-scanner",
    "sonar:full": "npm run sonar:backend && npm run sonar:frontend && npm run sonar"
  }
}
```

Then run:
```bash
npm run sonar:full
```

---

## Step 7: View Results

1. Go to `http://localhost:9000`
2. Click on your project "Notes App - Abdul Baseer"
3. View the code quality metrics including:
   - Code Smells
   - Bugs
   - Vulnerabilities
   - Coverage
   - Duplications
   - Lines of Code

---

## Troubleshooting

### Issue: "Connection refused" or "Cannot connect to localhost:9000"
- **Solution**: Ensure SonarQube is running
  - If using Docker: `docker ps` (should show sonarqube container running)
  - If local: Check if StartSonar.bat process is running

### Issue: "Invalid token" or "Unauthorized"
- **Solution**: 
  - Verify the token in sonar-project.properties
  - Generate a new token in SonarQube → My Account → Security
  - Update the configuration file

### Issue: "No coverage data found"
- **Solution**:
  - Run tests with coverage: `npm test -- --coverage`
  - Verify lcov.info files exist in coverage folders
  - Check paths in sonar-project.properties

### Issue: "Project not found"
- **Solution**:
  - Verify project key matches: `Notes-App---Abdul-Baseer`
  - Create the project manually in SonarQube if not auto-created

---

## Complete Workflow

```bash
# 1. Ensure SonarQube is running (Docker or direct)
# For Docker: docker run -d --name sonarqube -p 9000:9000 sonarqube:latest

# 2. Generate coverage reports
cd backend
npm test -- --coverage

cd ../frontend
npm test -- --watchAll=false --coverage

# 3. Run scanner from root
cd ..
npx sonarqube-scanner

# 4. View results at http://localhost:9000
```

---

## Security Note

⚠️ **Do not commit the token to version control**

Add to `.gitignore`:
```
sonar-project.properties
.env
```

Or use environment variables:
```bash
set SONAR_TOKEN=your_token_here
npx sonarqube-scanner
```

---

## Additional Resources

- [SonarQube Documentation](https://docs.sonarqube.org/)
- [SonarQube Scanner](https://docs.sonarqube.org/latest/analyzing-source-code/scanners/sonarscanner/)
- [JavaScript Plugin](https://docs.sonarqube.org/latest/analyzing-source-code/languages/javascript/)
