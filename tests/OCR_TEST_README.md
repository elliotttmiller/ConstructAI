# OCR Text Extraction Test Suite

## Overview

This test suite validates OCR (Optical Character Recognition) and text extraction functionality using **local libraries only** - **NO OpenAI API calls required**.

## Libraries Tested

1. **Tesseract.js v6** - Image OCR (PNG, JPG, TIFF)
2. **pdfjs-dist v5** - PDF text extraction

## Test Files

- `test_ocr_extraction.js` - JavaScript/ES6 version
- `test_ocr_extraction.ts` - TypeScript version (preferred)

## Setup

### 1. Prepare Test Files

Place test files in the `uploads/` directory:

```bash
# Create uploads directory if it doesn't exist
mkdir -p uploads

# Add your test files
# - uploads/test-image.png (for image OCR)
# - uploads/test-document.pdf (for PDF extraction)
```

Or update the paths in the test configuration:

```typescript
const TEST_CONFIG = {
  testFiles: {
    image: path.join(process.cwd(), 'uploads', 'your-test-image.png'),
    pdf: path.join(process.cwd(), 'uploads', 'your-test-document.pdf'),
  }
};
```

### 2. Dependencies

All required dependencies are already in `package.json`:

```json
{
  "tesseract.js": "^6.0.1",
  "pdfjs-dist": "^5.4.394"
}
```

## Running Tests

### TypeScript Version (Recommended)

```bash
# Using ts-node
npx ts-node tests/test_ocr_extraction.ts

# Or with node --loader
node --loader ts-node/esm tests/test_ocr_extraction.ts
```

### JavaScript Version

```bash
node tests/test_ocr_extraction.js
```

## Test Output

The test suite will:

1. ✓ Validate library initialization
2. ✓ Test image OCR with Tesseract.js
3. ✓ Test PDF text extraction with pdfjs-dist
4. ✓ Generate detailed results JSON file

### Sample Output

```
=== OCR Text Extraction Test Suite ===
Testing Tesseract.js (images) and pdfjs-dist (PDFs)
NO OPENAI API CALLS - Local libraries only

[2025-11-07T...] ✓ Output directory ready: test_outputs/ocr_tests

--- Quick Validation Test ---
[2025-11-07T...] 🧪 Running Quick Validation Test
[2025-11-07T...] ✓ Tesseract.js is working correctly
[2025-11-07T...] ✓ pdfjs-dist is working correctly (v5.4.394)

--- Test 1: Image OCR (Tesseract.js) ---
[2025-11-07T...] 🧪 Starting Image OCR Test with Tesseract.js
[2025-11-07T...] ✓ Test image found: ...
[2025-11-07T...] ✓ Worker initialized successfully
[2025-11-07T...] ✓ Image OCR completed in 3.24s
  Confidence: 87%
  Extracted 245 characters
  Preview: This is sample text extracted from an image...

--- Test 2: PDF Text Extraction (pdfjs-dist) ---
[2025-11-07T...] 🧪 Starting PDF Text Extraction Test with pdfjs-dist
[2025-11-07T...] ✓ Test PDF found: ...
[2025-11-07T...] ✓ PDF loaded successfully: 3 pages
[2025-11-07T...] ✓ PDF extraction completed in 1.52s
  Pages: 3
  Extracted 1543 characters
  Preview: This is sample text from a PDF document...

=== Test Summary ===
Tests Passed: 2/2
[2025-11-07T...] ✓ All OCR tests passed!
```

## Results Location

Test results are saved to:
```
test_outputs/ocr_tests/ocr_test_results_[timestamp].json
```

### Sample Results JSON

```json
{
  "timestamp": "2025-11-07T12:34:56.789Z",
  "tests": [
    {
      "name": "Image OCR",
      "library": "tesseract.js",
      "success": true,
      "extractedText": "Full extracted text here...",
      "confidence": 87,
      "characterCount": 245,
      "duration": "3.24s",
      "filePath": "/path/to/test-image.png"
    },
    {
      "name": "PDF Extraction",
      "library": "pdfjs-dist",
      "success": true,
      "extractedText": "Full extracted text here...",
      "confidence": 95,
      "characterCount": 1543,
      "pageCount": 3,
      "duration": "1.52s",
      "filePath": "/path/to/test-document.pdf"
    }
  ]
}
```

## Configuration

### Tesseract.js CDN Configuration (v6)

```typescript
const tesseractConfig = {
  workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@6/dist/worker.min.js',
  langPath: 'https://tessdata.projectnaptha.com/4.0.0',
  corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@v6/tesseract-core-simd.wasm.js',
};
```

### Supported File Types

**Images (Tesseract.js):**
- PNG (`.png`)
- JPEG (`.jpg`, `.jpeg`)
- TIFF (`.tiff`, `.tif`)

**Documents (pdfjs-dist):**
- PDF (`.pdf`)

## Troubleshooting

### Test Files Not Found

If you see:
```
✗ Test image not found: uploads/test-image.png
```

**Solution:** Place test files in the correct location or update `TEST_CONFIG.testFiles` in the script.

### Tesseract.js Worker Error

If you see path configuration errors:

**Solution:** The script uses CDN-hosted worker files. Ensure you have internet connectivity.

### PDF Extraction Returns Empty Text

This can happen with:
- Scanned PDFs (images of text, not actual text)
- Complex PDF layouts
- Protected/encrypted PDFs

**Solution:** Use an actual text-based PDF for testing, or the script will provide helpful metadata instead.

## Integration with Upload Route

The OCR logic in this test suite matches the production code in:
```
src/app/api/upload/route.ts
```

The `processOCR()` function uses the same configuration and approach.

## Performance Notes

**Typical Processing Times:**
- Image OCR: 2-5 seconds per image (depends on size/complexity)
- PDF Extraction: 0.5-2 seconds per page

**Memory Usage:**
- Tesseract.js: ~100-200MB during processing
- pdfjs-dist: ~50-100MB per document

## Key Points

✅ **No OpenAI API required** - Uses only Tesseract.js and pdfjs-dist  
✅ **Local processing** - All OCR happens on your server  
✅ **No API costs** - Free, open-source libraries  
✅ **No rate limits** - Process as many documents as you want  
✅ **Privacy-friendly** - Documents never leave your server  

## Next Steps

After successful OCR extraction, the text can be:
1. Stored in the database (`extracted_text` field)
2. Passed to OpenAI for analysis (separate step)
3. Used for document search/indexing
4. Displayed in the UI

## Questions?

- Tesseract.js docs: https://tesseract.projectnaptha.com/
- PDF.js docs: https://mozilla.github.io/pdf.js/
- Issue tracker: See project README
