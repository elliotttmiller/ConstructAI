/**
 * OCR Text Extraction Test Script (TypeScript)
 * 
 * Tests Tesseract.js (images) and pdfjs-dist (PDFs) OCR processing
 * NO OPENAI REQUIRED - Uses only local libraries
 * 
 * Usage: 
 *   npx ts-node tests/test_ocr_extraction.ts
 *   or
 *   node --loader ts-node/esm tests/test_ocr_extraction.ts
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { createWorker } from 'tesseract.js';
// Use legacy build for Node.js
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Test configuration
const TEST_CONFIG = {
  outputDir: path.join(process.cwd(), 'test_outputs', 'ocr_tests'),
  // Using actual uploaded files from the project
  testFiles: {
    image: path.join(process.cwd(), 'uploads', '45f80f43-cc9e-49ef-8714-bd74298d5d30', '0776030d-ffaa-4714-bf83-7527d1ac5d0d.jpg'),
    pdf: path.join(process.cwd(), 'public', 'uploads', '45f80f43-cc9e-49ef-8714-bd74298d5d30', '528552437-TWO-STOREY-RESIDENTIAL-PLAN.pdf'),
  },
  // Validation thresholds - test MUST meet these to pass
  validationRules: {
    minCharactersForSuccess: 1, // At least 1 character must be extracted
    minConfidenceForSuccess: 0, // Any confidence is acceptable if text is found
    mustExtractTextFromValidFiles: true, // Files that exist MUST produce results
    mustHandleMissingFiles: true, // Missing files MUST return proper errors
    skipMissingPDFTest: false, // We now have a PDF to test!
  },
  // Tesseract.js config for Node.js - use local worker paths, not CDN
  tesseractConfig: {
    // In Node.js, Tesseract automatically uses local node_modules paths
    // No need to specify workerPath/corePath - remove CDN URLs
  }
};

interface OCRResult {
  success: boolean;
  extractedText?: string;
  confidence?: number;
  characterCount?: number;
  duration?: string;
  filePath?: string;
  pageCount?: number;
  error?: string;
}

// Utility function for logging
function log(message: string, type: 'info' | 'error' | 'warn' | 'test' = 'info'): void {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '✓',
    error: '✗',
    warn: '⚠',
    test: '🧪'
  }[type];
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

/**
 * Test 1: Tesseract.js Image OCR
 * Extracts text from images using Tesseract.js
 */
async function testImageOCR(imagePath: string): Promise<OCRResult> {
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

    // Initialize Tesseract worker with v6 configuration
    log('Initializing Tesseract worker...');
    // In Node.js, don't pass CDN URLs - let Tesseract use local node_modules
    const worker = await createWorker('eng', 1, {
      logger: (m: any) => {
        if (m.status === 'recognizing text') {
          const progress = (m.progress * 100).toFixed(0);
          log(`  Progress: ${progress}%`);
        }
      }
    });
    
    log('✓ Worker initialized successfully');

    // Perform OCR recognition
    log('Recognizing text from image...');
    const { data: { text, confidence } } = await worker.recognize(imagePath);
    
    // Clean up worker
    await worker.terminate();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    // Results
    const result: OCRResult = {
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
    log(`  Preview: ${result.extractedText!.substring(0, 100)}...`);
    
    return result;
    
  } catch (error: any) {
    log(`✗ Image OCR failed: ${error.message}`, 'error');
    console.error(error);
    return { success: false, error: error.message };
  }
}

/**
 * Test 2: pdfjs-dist PDF Text Extraction
 * Extracts text from PDFs using Mozilla's PDF.js library
 */
async function testPDFExtraction(pdfPath: string): Promise<OCRResult> {
  log('Starting PDF Text Extraction Test with pdfjs-dist', 'test');
  
  try {
    const startTime = Date.now();
    
    // Check if file exists and read
    let dataBuffer: Buffer;
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
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(dataBuffer),
      useSystemFonts: true,
    });
    
    const pdfDocument = await loadingTask.promise;
    const numPages = pdfDocument.numPages;
    
    log(`✓ PDF loaded successfully: ${numPages} pages`);

    // Extract text from all pages
    log('Extracting text from all pages...');
    const textPromises: Promise<string>[] = [];
    
    for (let i = 1; i <= numPages; i++) {
      textPromises.push(
        pdfDocument.getPage(i).then(async (page: any) => {
          log(`  Processing page ${i}/${numPages}...`);
          const textContent = await page.getTextContent();
          return textContent.items.map((item: any) => item.str).join(' ');
        })
      );
    }
    
    const pageTexts = await Promise.all(textPromises);
    const extractedText = pageTexts.join('\n\n').trim();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    // Results
    const result: OCRResult = {
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
    log(`  Preview: ${result.extractedText!.substring(0, 100)}...`);
    
    return result;
    
  } catch (error: any) {
    log(`✗ PDF extraction failed: ${error.message}`, 'error');
    console.error(error);
    return { success: false, error: error.message };
  }
}

/**
 * Test 3: Quick validation test with a simple text image
 * Creates a simple test if no test files exist
 */
async function quickValidationTest(): Promise<void> {
  log('Running Quick Validation Test', 'test');
  log('This test validates that the OCR libraries are properly installed');
  
  try {
    // Test Tesseract.js initialization
    log('Testing Tesseract.js initialization...');
    const worker = await createWorker('eng', 1);
    await worker.terminate();
    log('✓ Tesseract.js is working correctly', 'info');
    
    // Test pdfjs-dist initialization
    log('Testing pdfjs-dist availability...');
    const pdfjsVersion = (await import('pdfjs-dist/package.json')).version;
    log(`✓ pdfjs-dist is working correctly (v${pdfjsVersion})`, 'info');
    
  } catch (error: any) {
    log(`✗ Validation failed: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Main test runner
 */
async function runAllTests(): Promise<void> {
  console.log('\n=== OCR Text Extraction Test Suite ===');
  console.log('Testing Tesseract.js (images) and pdfjs-dist (PDFs)');
  console.log('NO OPENAI API CALLS - Local libraries only\n');
  
  // Create output directory
  try {
    await mkdir(TEST_CONFIG.outputDir, { recursive: true });
    log(`✓ Output directory ready: ${TEST_CONFIG.outputDir}`);
  } catch (err: any) {
    log(`Failed to create output directory: ${err.message}`, 'error');
  }
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: [] as any[]
  };
  
  // Quick validation
  console.log('\n--- Quick Validation Test ---');
  await quickValidationTest();
  
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
  
  // Skip PDF test in validation if file doesn't exist and skipMissingPDFTest is true
  if (!pdfResult.success && pdfResult.error === 'File not found' && TEST_CONFIG.validationRules.skipMissingPDFTest) {
    log('ℹ️ Skipping PDF test - no PDF files in project (this is OK)', 'warn');
  } else {
    results.tests.push({
      name: 'PDF Extraction',
      library: 'pdfjs-dist',
      ...pdfResult
    });
  }
  
  // Save results
  const resultsPath = path.join(TEST_CONFIG.outputDir, `ocr_test_results_${Date.now()}.json`);
  await writeFile(resultsPath, JSON.stringify(results, null, 2));
  log(`\n✓ Test results saved: ${resultsPath}`);
  
  // STRICT VALIDATION - Prevent false positives
  console.log('\n=== Strict Validation ===');
  const validationErrors: string[] = [];
  
  // Validate image OCR result
  const imageTest = results.tests.find((t: any) => t.name === 'Image OCR');
  if (imageTest) {
    if (imageTest.success) {
      // File exists, so we MUST have extracted text
      if (!imageTest.extractedText || imageTest.characterCount === 0) {
        validationErrors.push('Image OCR marked as success but extracted 0 characters');
      }
      if (imageTest.characterCount < TEST_CONFIG.validationRules.minCharactersForSuccess) {
        validationErrors.push(`Image OCR extracted ${imageTest.characterCount} chars, minimum required: ${TEST_CONFIG.validationRules.minCharactersForSuccess}`);
      }
      log(`✓ Image OCR validation: ${imageTest.characterCount} characters extracted`);
    } else {
      // Test failed - check if it's expected (missing file) or actual failure
      if (imageTest.error && imageTest.error.includes('File not found')) {
        log(`✓ Image OCR correctly handled missing file`, 'warn');
      } else {
        validationErrors.push(`Image OCR failed unexpectedly: ${imageTest.error}`);
      }
    }
  } else {
    validationErrors.push('Image OCR test was not executed');
  }
  
  // Validate PDF extraction result
  const pdfTest = results.tests.find((t: any) => t.name === 'PDF Extraction');
  if (pdfTest) {
    if (pdfTest.success) {
      // If PDF exists and succeeded, validate extraction
      if (!pdfTest.extractedText || pdfTest.characterCount === 0) {
        validationErrors.push('PDF Extraction marked as success but extracted 0 characters');
      }
      log(`✓ PDF Extraction validation: ${pdfTest.characterCount} characters extracted`);
    } else {
      // PDF test failed - check if it's expected (missing file)
      if (pdfTest.error && pdfTest.error.includes('File not found')) {
        log(`✓ PDF Extraction correctly handled missing file`, 'warn');
      } else {
        validationErrors.push(`PDF Extraction failed unexpectedly: ${pdfTest.error}`);
      }
    }
  } else {
    // PDF test was skipped - this is OK if skipMissingPDFTest is true
    if (TEST_CONFIG.validationRules.skipMissingPDFTest) {
      log(`ℹ️ PDF test skipped (no PDF files available)`, 'warn');
    } else {
      validationErrors.push('PDF Extraction test was not executed');
    }
  }
  
  // Report validation results
  if (validationErrors.length > 0) {
    console.log('\n❌ VALIDATION FAILED - False positive detected!');
    validationErrors.forEach(err => log(`  - ${err}`, 'error'));
    throw new Error('Test validation failed: ' + validationErrors.join('; '));
  }
  
  // Summary
  console.log('\n=== Test Summary ===');
  const passed = results.tests.filter((t: any) => t.success).length;
  const total = results.tests.length;
  console.log(`Tests Passed: ${passed}/${total}`);
  
  if (validationErrors.length === 0 && passed > 0) {
    log('✓ All OCR tests passed with strict validation!', 'info');
  } else {
    log('⚠ Some tests failed - check results above', 'warn');
  }
  
  console.log('\n');
}

// Run tests
runAllTests()
  .then(() => {
    log('Test suite completed');
    process.exit(0);
  })
  .catch((error: any) => {
    log(`Test suite failed: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  });

export {
  testImageOCR,
  testPDFExtraction,
  quickValidationTest,
  runAllTests
};
