#!/usr/bin/env node

/**
 * Test script for the Promotion Parser API
 * 
 * Usage: node test-promotion-parser.js
 * 
 * Make sure the backend server is running on http://localhost:3000
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

async function testPromotionParser() {
  const csvPath = path.join(__dirname, '../src/data/sample-employees.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error('❌ CSV file not found:', csvPath);
    process.exit(1);
  }

  console.log('📄 Reading CSV file:', csvPath);
  
  const form = new FormData();
  form.append('file', fs.createReadStream(csvPath));

  const apiUrl = 'http://localhost:3000/api/promotion-parser';
  
  console.log('🚀 Sending request to:', apiUrl);
  console.log('⏳ Processing CSV...\n');

  try {
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ API Error:', error);
      process.exit(1);
    }

    const data = await response.json();
    
    console.log('✅ CSV parsed successfully!\n');
    console.log(`📊 Results:`);
    console.log(`   - Employees processed: ${data.employees.length}`);
    console.log(`   - Employee details: ${Object.keys(data.employeeDetails).length}\n`);
    
    console.log('👤 Sample Employee:');
    console.log(JSON.stringify(data.employees[0], null, 2));
    
    console.log('\n📋 Sample Employee Detail:');
    console.log(JSON.stringify(data.employeeDetails['1'], null, 2));
    
    console.log('\n✨ Full response saved to: promotion-parser-response.json');
    fs.writeFileSync(
      path.join(__dirname, 'promotion-parser-response.json'),
      JSON.stringify(data, null, 2)
    );

  } catch (error) {
    console.error('❌ Request failed:', error.message);
    console.error('\n💡 Make sure the backend server is running:');
    console.error('   cd backend && npm run start:dev');
    process.exit(1);
  }
}

testPromotionParser();
