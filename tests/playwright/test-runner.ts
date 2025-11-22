#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Terminal Permission System Test Runner\n');

const tests = [
  {
    name: 'Terminal Permissions',
    file: 'test-terminal-permissions.js',
    description: 'Basic permission system functionality'
  },
  {
    name: 'Permission Error Messages',
    file: 'test-permission-errors.js',
    description: 'Permission error messages and hints'
  },
  {
    name: 'Root User Escalation',
    file: 'test-root-escalation.js',
    description: 'Root user switching and escalation'
  },
  {
    name: 'Comprehensive Permissions',
    file: 'test-comprehensive-permissions.js',
    description: 'Complete permission system test suite'
  }
];

async function runTest(test: any) {
  return new Promise((resolve, reject) => {
    console.log(`\n🧪 Running ${test.name}...`);
    console.log(`   Description: ${test.description}`);
    console.log(`   File: ${test.file}`);
    
    const testPath = path.join(__dirname, test.file);
    const startTime = Date.now();
    
    exec(`node "${testPath}"`, (error: any, stdout: any, stderr: any) => {
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      
      if (error) {
        console.log(`❌ ${test.name} failed after ${duration}s`);
        console.log(`   Error: ${error.message}`);
        resolve({ name: test.name, success: false, duration, error: error.message });
      } else {
        console.log(`✅ ${test.name} completed in ${duration}s`);
        resolve({ name: test.name, success: true, duration });
      }
      
      if (stdout) {
        console.log('   Output:', stdout.trim());
      }
      
      if (stderr) {
        console.log('   Errors:', stderr.trim());
      }
    });
  });
}

async function runAllTests() {
  console.log('📋 Available Tests:');
  tests.forEach((test, index) => {
    console.log(`   ${index + 1}. ${test.name} - ${test.description}`);
  });
  
  console.log('\n🎯 Starting test execution...\n');
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await runTest(test);
      results.push(result);
      
      // Wait a bit between tests
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`❌ Failed to run ${test.name}:`, error);
      results.push({ name: test.name, success: false, duration: 0, error: (error as Error).message });
    }
  }
  
  // Summary
  console.log('\n📊 TEST EXECUTION SUMMARY:');
  console.log('='.repeat(50));
  
  const successfulTests = results.filter((r: any) => r.success).length;
  const totalTests = results.length;
  const successRate = (successfulTests / totalTests) * 100;
  
  results.forEach((result: any, index: number) => {
    const status = result.success ? '✅' : '❌';
    const duration = result.duration ? `${result.duration}s` : 'N/A';
    console.log(`${index + 1}. ${status} ${result.name} (${duration})`);
    
    if (!result.success && result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('='.repeat(50));
  console.log(`📈 Overall Success Rate: ${successRate.toFixed(1)}% (${successfulTests}/${totalTests})`);
  
  if (successRate >= 75) {
    console.log('🎉 Permission System Tests: PASSED!');
  } else if (successRate >= 50) {
    console.log('⚠️ Permission System Tests: PARTIAL SUCCESS');
  } else {
    console.log('❌ Permission System Tests: NEEDS ATTENTION');
  }
  
  console.log('\n📸 Screenshots saved:');
  console.log('   - permission-test.png');
  console.log('   - permission-errors-test.png');
  console.log('   - root-escalation-test.png');
  console.log('   - comprehensive-permission-test.png');
  
  console.log('\n🔍 Test completed! Check the screenshots for visual verification.');
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log('Terminal Permission System Test Runner');
  console.log('');
  console.log('Usage: node test-runner.js [options]');
  console.log('');
  console.log('Options:');
  console.log('  --help, -h     Show this help message');
  console.log('  --single       Run only the comprehensive test');
  console.log('  --errors       Run only error message tests');
  console.log('  --escalation   Run only root escalation tests');
  console.log('');
  console.log('Examples:');
  console.log('  node test-runner.js');
  console.log('  node test-runner.js --single');
  console.log('  node test-runner.js --errors');
  process.exit(0);
}

if (args.includes('--single')) {
  console.log('🎯 Running single comprehensive test...\n');
  runTest(tests[3]).then((result: any) => {
    console.log(`\n🎯 Result: ${result.success ? '✅ PASSED' : '❌ FAILED'}`);
    process.exit(result.success ? 0 : 1);
  });
} else if (args.includes('--errors')) {
  console.log('🎯 Running error message tests...\n');
  runTest(tests[1]).then((result: any) => {
    console.log(`\n🎯 Result: ${result.success ? '✅ PASSED' : '❌ FAILED'}`);
    process.exit(result.success ? 0 : 1);
  });
} else if (args.includes('--escalation')) {
  console.log('🎯 Running root escalation tests...\n');
  runTest(tests[2]).then((result: any) => {
    console.log(`\n🎯 Result: ${result.success ? '✅ PASSED' : '❌ FAILED'}`);
    process.exit(result.success ? 0 : 1);
  });
} else {
  runAllTests().then(() => {
    process.exit(0);
  });
}
