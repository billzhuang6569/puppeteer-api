const axios = require('axios');
const fs = require('fs');

async function testAPI() {
  const baseURL = 'http://localhost:8000';
  
  console.log('Testing Puppeteer API...\n');
  
  // Test health check
  try {
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Health check:', healthResponse.data);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return;
  }
  
  // Test image download
  const testURL = 'https://httpbin.org/image/png';
  
  try {
    console.log(`\nTesting image download from: ${testURL}`);
    
    const response = await axios.post(`${baseURL}/v1/download_pic_from_url`, {
      url: testURL
    }, {
      responseType: 'arraybuffer'
    });
    
    console.log('✅ Image downloaded successfully');
    console.log(`   - Content-Type: ${response.headers['content-type']}`);
    console.log(`   - Size: ${response.data.length} bytes`);
    
    // Save to file
    fs.writeFileSync('test_output.png', response.data);
    console.log('   - Saved as test_output.png');
    
  } catch (error) {
    console.log('❌ Image download failed:', error.response?.data || error.message);
  }
  
  // Test with Gartner URL
  const gartnerURL = 'https://www.gartner.com/ngw/globalassets/en/articles/images/2025-top-10-strategic-technology-trends.png';
  
  try {
    console.log(`\nTesting Gartner image download from: ${gartnerURL}`);
    
    const response = await axios.post(`${baseURL}/v1/download_pic_from_url`, {
      url: gartnerURL
    }, {
      responseType: 'arraybuffer'
    });
    
    console.log('✅ Gartner image downloaded successfully');
    console.log(`   - Content-Type: ${response.headers['content-type']}`);
    console.log(`   - Size: ${response.data.length} bytes`);
    
    // Save to file
    fs.writeFileSync('gartner_test.png', response.data);
    console.log('   - Saved as gartner_test.png');
    
  } catch (error) {
    console.log('❌ Gartner image download failed:', error.response?.data || error.message);
  }
}

testAPI();