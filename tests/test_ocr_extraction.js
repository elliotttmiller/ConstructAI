/**
 * OCR Text Extraction Test Script
 * 
 * Tests Tesseract.js (images) and pdfjs-dist (PDFs) OCR processing
 * NO OPENAI REQUIRED - Uses only local libraries
 * 
 * Usage: node tests/test_ocr_extraction.js
 */

import { createWorker } from 'tesseract.js';
import { getDocument } from 'pdfjs-dist';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const TEST_CONFIG = {
  outputDir: path.join(process.cwd(), 'test_outputs', 'ocr_tests'),
  testFiles: {
    // Add your test file paths here
    image: path.join(process.cwd(), 'uploads', 'test-image.png'),
    pdf: path.join(process.cwd(), 'uploads', 'test-document.pdf'),
  },
  tesseractConfig: {
    workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@6/dist/worker.min.js',
    langPath: 'https://tessdata.projectnaptha.com/4.0.0',
    corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@v6/tesseract-core-simd.wasm.js',
  }
};

// Utility function for logging
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '✓',
    error: '✗',
    warn: '⚠',
    test: '🧪'
  }[type] || 'ℹ';
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

// Test 1: Tesseract.js Image OCR
async function testImageOCR(imagePath) {
  log('Starting Image OCR Test with Tesseract.js', 'test');
  
  try {
    const startTime = Date.now();
    
    // Check if file exists
    try {
      await readFile(imagePath);
      log(`✓ Test image found: ${imagePath}`);
    } catch (err) {
      log(`✗ Test image not found: ${imagePath}`, 'error');
      log(`  Please place a test image at this path or update TEST_CONFIG.testFiles.image`, 'warn');
      return { success: false, error: 'File not found' };
    }

    // Initialize Tesseract worker
    log('Initializing Tesseract worker...');
    const worker = await createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          const progress = (m.progress * 100).toFixed(0);
          log(`  Progress: ${progress}%`);
        }
      },
      ...TEST_CONFIG.tesseractConfig
    });
    
    log('Worker initialized successfully');

    // Perform OCR
    log('Recognizing text from image...');
    const { data: { text, confidence } } = await worker.recognize(imagePath);
    
    // Terminate worker
    await worker.terminate();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    // Results
    const result = {
      success: true,
      extractedText: text.trim(),
      confidence: Math.round(confidence),
      characterCount: text.trim().length,
      duration: `${duration}s`,
      filePath: imagePath
    };
    
    log(`✓ Image OCR completed in ${duration}s`, 'info');
    log(`  Confidence: ${result.confidence}%`);
    log(`  Extracted ${result.characterCount} characters`);
    log(`  Preview: ${result.extractedText.substring(0, 100)}...`);
    
    return result;
    
  } catch (error) {
    log(`✗ Image OCR failed: ${error.message}`, 'error');
    console.error(error);
    return { success: false, error: error.message };
  }
}

// Test 2: pdfjs-dist PDF Text Extraction
async function testPDFExtraction(pdfPath) {
  log('Starting PDF Text Extraction Test with pdfjs-dist', 'test');
  
  try {
    const startTime = Date.now();
    
    // Check if file exists
    let dataBuffer;
    try {
      dataBuffer = await readFile(pdfPath);
      log(`✓ Test PDF found: ${pdfPath}`);
    } catch (err) {
      log(`✗ Test PDF not found: ${pdfPath}`, 'error');
      log(`  Please place a test PDF at this path or update TEST_CONFIG.testFiles.pdf`, 'warn');
      return { success: false, error: 'File not found' };
    }

    // Load PDF document
    log('Loading PDF document...');
    const loadingTask = getDocument({
      data: new Uint8Array(dataBuffer),
      useSystemFonts: true,
    });
    
    const pdfDocument = await loadingTask.promise;
    const numPages = pdfDocument.numPages;
    
    log(`✓ PDF loaded successfully: ${numPages} pages`);

    // Extract text from all pages
    log('Extracting text from all pages...');
    const textPromises = [];
    
    for (let i = 1; i <= numPages; i++) {
      textPromises.push(
        pdfDocument.getPage(i).then(async (page) => {
          log(`  Processing page ${i}/${numPages}...`);
          const textContent = await page.getTextContent();
          return textContent.items.map((item) => item.str).join(' ');
        })
      );
    }
    
    const pageTexts = await Promise.all(textPromises);
    const extractedText = pageTexts.join('\n\n').trim();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    // Results
    const result = {
      success: true,
      extractedText,
      characterCount: extractedText.length,
      pageCount: numPages,
      duration: `${duration}s`,
      filePath: pdfPath,
      // Calculate confidence based on text extraction success
      confidence: extractedText.length > 0 ? 95 : 50
    };
    
    log(`✓ PDF extraction completed in ${duration}s`, 'info');
    log(`  Pages: ${result.pageCount}`);
    log(`  Extracted ${result.characterCount} characters`);
    log(`  Preview: ${result.extractedText.substring(0, 100)}...`);
    
    return result;
    
  } catch (error) {
    log(`✗ PDF extraction failed: ${error.message}`, 'error');
    console.error(error);
    return { success: false, error: error.message };
  }
}

// Test 3: Performance benchmark
async function performanceBenchmark(filePath, fileType) {
  log(`Starting Performance Benchmark for ${fileType}`, 'test');
  
  const iterations = 3;
  const times = [];
  
  for (let i = 1; i <= iterations; i++) {
    log(`  Iteration ${i}/${iterations}...`);
    const startTime = Date.now();
    
    try {
      if (fileType === 'image') {
        await testImageOCR(filePath);
      } else if (fileType === 'pdf') {
        await testPDFExtraction(filePath);
      }
      
      const duration = Date.now() - startTime;
      times.push(duration);
      
    } catch (error) {
      log(`  ✗ Iteration ${i} failed: ${error.message}`, 'error');
    }
  }
  
  const avgTime = (times.reduce((a, b) => a + b, 0) / times.length / 1000).toFixed(2);
  const minTime = (Math.min(...times) / 1000).toFixed(2);
  const maxTime = (Math.max(...times) / 1000).toFixed(2);
  
  log(`✓ Benchmark completed`);
  log(`  Average: ${avgTime}s`);
  log(`  Min: ${minTime}s`);
  log(`  Max: ${maxTime}s`);
  
  return { avgTime, minTime, maxTime, iterations };
}

// Main test runner
async function runAllTests() {
  console.log('\n=== OCR Text Extraction Test Suite ===');
  console.log('Testing Tesseract.js (images) and pdfjs-dist (PDFs)');
  console.log('NO OPENAI API CALLS - Local libraries only\n');
  
  // Create output directory
  try {
    await mkdir(TEST_CONFIG.outputDir, { recursive: true });
    log(`✓ Output directory ready: ${TEST_CONFIG.outputDir}`);
  } catch (err) {
    log(`Failed to create output directory: ${err.message}`, 'error');
  }
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: []
  };
  
  // Test 1: Image OCR
  console.log('\n--- Test 1: Image OCR (Tesseract.js) ---');
  const imageResult = await testImageOCR(TEST_CONFIG.testFiles.image);
  results.tests.push({
    name: 'Image OCR',
    library: 'tesseract.js',
    ...imageResult
  });
  
  // Test 2: PDF Extraction
  console.log('\n--- Test 2: PDF Text Extraction (pdfjs-dist) ---');
  const pdfResult = await testPDFExtraction(TEST_CONFIG.testFiles.pdf);
  results.tests.push({
    name: 'PDF Extraction',
    library: 'pdfjs-dist',
    ...pdfResult
  });
  
  // Save results
  const resultsPath = path.join(TEST_CONFIG.outputDir, `ocr_test_results_${Date.now()}.json`);
  await writeFile(resultsPath, JSON.stringify(results, null, 2));
  log(`\n✓ Test results saved: ${resultsPath}`);
  
  // Summary
  console.log('\n=== Test Summary ===');
  const passed = results.tests.filter(t => t.success).length;
  const total = results.tests.length;
  console.log(`Tests Passed: ${passed}/${total}`);
  
  if (passed === total) {
    log('✓ All OCR tests passed!', 'info');
  } else {
    log('⚠ Some tests failed - check results above', 'warn');
  }
  
  console.log('\n');
  return results;
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests()
    .then(() => {
      log('Test suite completed');
      process.exit(0);
    })
    .catch((error) => {
      log(`Test suite failed: ${error.message}`, 'error');
      console.error(error);
      process.exit(1);
    });
}

export {
  testImageOCR,
  testPDFExtraction,
  performanceBenchmark,
  runAllTests
};
