# 🚀 SonarQube Analysis - Quick Start Guide

## Your npm Scripts Are Ready!

Added to `package.json`:
- `npm run sonar:coverage` - Generate test coverage only
- `npm run sonar:scan` - Run scanner only  
- `npm run sonar:analyze` - Generate coverage + run scanner ⭐
- `npm run sonar:backend:coverage` - Backend tests only
- `npm run sonar:frontend:coverage` - Frontend tests only

---

## 🎯 Option 1: PowerShell Script (Easiest)

```powershell
# Show help
.\sonar-scan.ps1 -Help

# Run with token parameter
.\sonar-scan.ps1 -Token "your_token_here"

# Or set environment variable first
$env:SONAR_TOKEN = "your_token_here"
.\sonar-scan.ps1
```

**Advantages:**
- ✅ Colorful output with progress indicators
- ✅ Step-by-step execution
- ✅ Automatic error handling
- ✅ Helpful troubleshooting tips

---

## 🎯 Option 2: npm Scripts (Cross-platform)

### Full Analysis (Recommended)
```bash
$env:SONAR_TOKEN = "your_token_here"
npm run sonar:analyze
```

### Coverage + Scan Separately
```bash
# Generate coverage reports
npm run sonar:coverage

# Then run scanner
$env:SONAR_TOKEN = "your_token_here"
npm run sonar:scan
```

---

## 🎯 Option 3: Direct Command (Most Control)

```bash
$env:SONAR_TOKEN = "your_token_here"
npx sonarqube-scanner `
  -Dsonar.projectKey=Notes-App---Abdul-Baseer `
  -Dsonar.sources=backend/src,frontend/src `
  -Dsonar.tests=backend/tests `
  -Dsonar.javascript.lcov.reportPaths=backend/coverage/lcov.info,frontend/coverage/lcov.info `
  -Dsonar.host.url=http://localhost:9000
```

---

## 🔑 How to Get Your Token

1. Go to **http://localhost:9000**
2. Click **your avatar** (top-right)
3. Select **"My Account"**
4. Click **"Security"** tab
5. Under **"Tokens"**, click **"Generate"**
6. Enter name: `sonar-scanner-token`
7. Select type: `Global Analysis Token`
8. Click **"Generate"**
9. **Copy the token** (appears only once!)

---

## 💡 Environment Variable Setup (Permanent)

To avoid entering the token every time:

### Windows PowerShell (Current Session Only)
```powershell
$env:SONAR_TOKEN = "sqp_xxxxxxxxxxxxxxxxxxxxx"
```

### Windows PowerShell (Permanent)
```powershell
[Environment]::SetEnvironmentVariable("SONAR_TOKEN", "sqp_xxxxxxxxxxxxxxxxxxxxx", "User")

# Restart PowerShell after this
```

### Then Simply Run
```bash
npm run sonar:analyze
# Or
.\sonar-scan.ps1
```

---

## 📊 What to Expect

After analysis completes, you'll see:
- **Code Smells** - Code quality issues
- **Bugs** - Potential bugs found
- **Vulnerabilities** - Security issues
- **Coverage** - Test coverage percentage
- **Duplications** - Code duplication analysis
- **Lines of Code** - Total LOC metrics

---

## 🐛 Troubleshooting

### "Connection refused"
```
❌ SonarQube not running at http://localhost:9000
✅ Start SonarQube (Docker or local installation)
```

### "401 Unauthorized"
```
❌ Token is invalid or expired
✅ Generate a new token: http://localhost:9000 → My Account → Security
```

### "No coverage data found"
```
❌ Tests didn't run or coverage files missing
✅ Run: npm run sonar:coverage
✅ Check: backend/coverage/lcov.info and frontend/coverage/lcov.info exist
```

### "Project not found"
```
❌ Project key doesn't match
✅ Project key: Notes-App---Abdul-Baseer
✅ Create project manually if needed in SonarQube UI
```

---

## 📝 Recommended Workflow

```bash
# 1. One-time setup
$env:SONAR_TOKEN = "your_token_from_sonarqube"

# 2. Simple analysis
npm run sonar:analyze

# 3. View results
# Open: http://localhost:9000/projects
# Click: Notes App - Abdul Baseer
```

---

## 🔒 Security Best Practices

⚠️ **Never commit your token to version control!**

Included in `.gitignore`:
- `sonar-project.properties` (contains token)
- `.env` files

Safe alternatives:
- ✅ Use environment variables
- ✅ Use `.env.local` (in .gitignore)
- ✅ Use CI/CD secrets (GitHub Actions, GitLab CI, etc.)

---

## 📚 Additional Resources

- [SonarQube Docs](https://docs.sonarqube.org/)
- [SonarQube Scanner](https://docs.sonarqube.org/latest/analyzing-source-code/scanners/sonarscanner/)
- [JavaScript Plugin](https://docs.sonarqube.org/latest/analyzing-source-code/languages/javascript/)

---

**Ready? Follow Option 1 or 2 above! 🚀**
