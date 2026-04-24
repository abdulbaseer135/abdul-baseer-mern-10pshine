const { scan } = require('sonarqube-scanner');

scan(
  {
    serverUrl: 'http://localhost:9000',
    token: 'sqp_6a3f010e09a12d940ae38a7acd3314d6237dee32',
    options: {
      'sonar.projectKey': 'Notes-App---Abdul-Baseer',
      'sonar.projectName': 'Notes App - Abdul Baseer',
      'sonar.projectVersion': '1.0.0',
      'sonar.sources': 'src',
      'sonar.tests': 'tests',
      'sonar.test.inclusions': '**/*.test.js',
      'sonar.exclusions': '**/node_modules/**,**/coverage/**,**/*.test.js,**/tests/**',
      'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info',
      'sonar.sourceEncoding': 'UTF-8',
    },
  },
  () => process.exit()
);