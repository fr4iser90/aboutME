# Terminal Permission System - Playwright Tests

This directory contains comprehensive Playwright tests for the Terminal Permission System implementation.

## 🧪 Test Files

### Core Permission Tests
- **`test-terminal-permissions.js`** - Basic permission system functionality
- **`test-permission-errors.js`** - Permission error messages and helpful hints
- **`test-root-escalation.js`** - Root user switching and privilege escalation
- **`test-comprehensive-permissions.js`** - Complete test suite covering all scenarios

### Test Runner
- **`test-runner.js`** - Executable script to run all tests with options

## 🚀 Running Tests

### Prerequisites
1. Ensure the frontend development server is running on `localhost:3000`
2. Install Playwright: `npm install playwright`
3. Make sure the terminal permission system is implemented

### Run All Tests
```bash
node test-runner.js
```

### Run Specific Tests
```bash
# Run only comprehensive test
node test-runner.js --single

# Run only error message tests
node test-runner.js --errors

# Run only root escalation tests
node test-runner.js --escalation
```

### Run Individual Tests
```bash
# Basic permissions
node test-terminal-permissions.js

# Error messages
node test-permission-errors.js

# Root escalation
node test-root-escalation.js

# Comprehensive suite
node test-comprehensive-permissions.js
```

## 📋 Test Coverage

### Permission System Tests
- ✅ User authentication and session management
- ✅ File read/write/execute permissions
- ✅ Directory access control
- ✅ Permission error messages with helpful hints
- ✅ Root user escalation and privilege switching
- ✅ User context switching (fr4iser ↔ root)
- ✅ Path traversal protection
- ✅ Multiple file operations
- ✅ Edge cases and error handling

### Command-Specific Tests
- ✅ `cd` command with directory permissions
- ✅ `ls` command with read permissions
- ✅ `cat` command with file read permissions
- ✅ `rm` command with write permissions
- ✅ `su` command with user switching
- ✅ `whoami` command for user verification
- ✅ `logout` command for user switching

### Security Tests
- ✅ Permission bypass attempts
- ✅ Path traversal attacks
- ✅ Unauthorized file access
- ✅ System file protection
- ✅ Root privilege validation

## 📊 Test Results

Each test generates:
- **Console output** with detailed test progress
- **Screenshots** for visual verification
- **Success/failure indicators** for each test case
- **Performance metrics** (test duration)

### Screenshots Generated
- `permission-test.png` - Basic permission system test
- `permission-errors-test.png` - Error message tests
- `root-escalation-test.png` - Root user escalation tests
- `comprehensive-permission-test.png` - Complete test suite

## 🎯 Success Criteria

### Basic Permissions (80%+ success rate)
- Terminal opens and accepts input
- User authentication works
- Permission denied messages appear
- Helpful hints are provided

### Root Escalation (90%+ success rate)
- User switching works correctly
- Root password validation
- Privilege escalation functions
- Permission context switching

### Error Messages (85%+ success rate)
- Clear permission denied messages
- Helpful suggestions provided
- Consistent error formatting
- Educational hints for users

## 🔧 Test Configuration

### Browser Settings
- **Browser**: Chromium (Playwright)
- **Mode**: Non-headless (visible browser)
- **Timeout**: 2-3 seconds between commands
- **Screenshots**: Full page captures

### Test Data
- **Username**: fr4iser
- **Password**: kira
- **Root Password**: password123456789!kira
- **Test Paths**: /home/fr4iser, /root, /tmp, /etc

## 🐛 Troubleshooting

### Common Issues
1. **Terminal not opening**: Check if frontend server is running
2. **Login failures**: Verify user credentials in the system
3. **Permission errors not showing**: Check permission system implementation
4. **Root escalation failing**: Verify root password configuration

### Debug Mode
Run tests with `headless: false` to see browser interactions:
```javascript
const browser = await chromium.launch({ headless: false });
```

### Logging
All tests include detailed console logging:
- ✅ Success indicators
- ❌ Failure indicators
- 📋 Test progress
- 🎯 Final results

## 📈 Performance Metrics

### Expected Performance
- **Test Duration**: 30-60 seconds per test
- **Permission Checks**: < 10ms per check
- **Memory Usage**: < 100MB during tests
- **Success Rate**: 80%+ overall

### Monitoring
- Test execution time
- Permission check performance
- Error message quality
- User experience metrics

## 🔄 Continuous Integration

### Automated Testing
```bash
# Run in CI environment
npm run test:permissions

# Run with coverage
npm run test:permissions:coverage
```

### Integration with CI/CD
- Tests run automatically on code changes
- Screenshots uploaded as artifacts
- Performance metrics tracked
- Success rate monitoring

## 📚 Documentation

### Test Documentation
- Each test file includes detailed comments
- Test scenarios are clearly documented
- Expected outcomes are specified
- Error conditions are tested

### Maintenance
- Tests updated with permission system changes
- New test cases added for new features
- Performance benchmarks maintained
- Documentation kept current

## 🎉 Success Indicators

When all tests pass, you should see:
```
🎯 OVERALL RESULT: ✅ PERMISSION SYSTEM WORKING!
🎉 Congratulations! The Terminal Permission System is working correctly!
```

This indicates that:
- ✅ Permission validation is working
- ✅ Error messages are helpful
- ✅ Root escalation functions correctly
- ✅ User switching works properly
- ✅ Security measures are in place
- ✅ Performance requirements are met
