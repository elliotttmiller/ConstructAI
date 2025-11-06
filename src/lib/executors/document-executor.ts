/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Document Executor
 * Autonomously processes documents - uploads, OCR, analysis
 */

import { TaskExecutor, ExecutionContext } from '../autonomous-executor';
import { supabaseAdmin } from '../supabase';
import ConstructionAIService from '../ai-services';
import { createWorker } from 'tesseract.js';

export class DocumentExecutor implements TaskExecutor {
  private aiService: ConstructionAIService;

  constructor() {
    this.aiService = ConstructionAIService.getInstance();
  }

  async execute(payload: any, context: ExecutionContext): Promise<any> {
    const { action, data } = payload;

    switch (action) {
      case 'process_document':
        return await this.processDocument(data, context);
      case 'analyze_document':
        return await this.analyzeDocument(data, context);
      case 'extract_text':
        return await this.extractText(data, context);
      case 'classify_document':
        return await this.classifyDocument(data, context);
      default:
        throw new Error(`Unknown document action: ${action}`);
    }
  }

  /**
   * Autonomously process a document (full workflow)
   */
  private async processDocument(data: any, context: ExecutionContext): Promise<any> {
    const { documentId, filePath, fileType } = data;

    try {
      // 1. Extract text if needed
      let extractedText = '';
      if (this.needsOCR(fileType)) {
        const ocrResult = await this.performOCR(filePath, fileType);
        extractedText = ocrResult.text;

        // Update document with extracted text
        await supabaseAdmin
          .from('documents')
          .update({
            extracted_text: extractedText,
            confidence: ocrResult.confidence,
            status: 'processing'
          })
          .eq('id', documentId);
      }

      // 2. Analyze document content
      const analysis = await this.aiService.getDocumentAnalysis(
        extractedText || 'Document content',
        fileType
      );

      // 3. Extract structured insights
      const insights = this.extractInsights(analysis.content);
      const classifications = await this.determineClassifications(analysis.content);

      // 4. Update document with complete analysis
      await supabaseAdmin
        .from('documents')
        .update({
          status: 'completed',
          metadata: {
            ai_analysis: analysis.content,
            ai_insights: insights,
            classifications,
            processed_at: new Date().toISOString()
          }
        })
        .eq('id', documentId);

      return {
        documentId,
        extractedText: extractedText.substring(0, 500), // First 500 chars
        insights,
        classifications,
        analysisComplete: true
      };

    } catch (error) {
      // Mark document as error
      await supabaseAdmin
        .from('documents')
        .update({ status: 'error' })
        .eq('id', documentId);
      
      throw error;
    }
  }

  /**
   * Analyze an existing document
   */
  private async analyzeDocument(data: any, context: ExecutionContext): Promise<any> {
    const { documentId } = data;

    // Fetch document
    const { data: document, error } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error || !document) {
      throw new Error(`Document not found: ${documentId}`);
    }

    // Analyze with AI
    const analysis = await this.aiService.getDocumentAnalysis(
      document.extracted_text || document.name,
      document.type
    );

    // Extract insights
    const insights = this.extractInsights(analysis.content);

    // Update document
    await supabaseAdmin
      .from('documents')
      .update({
        metadata: {
          ...document.metadata,
          ai_analysis: analysis.content,
          ai_insights: insights,
          analyzed_at: new Date().toISOString()
        }
      })
      .eq('id', documentId);

    return {
      documentId,
      insights,
      analysis: analysis.content
    };
  }

  /**
   * Extract text from document
   */
  private async extractText(data: any, context: ExecutionContext): Promise<any> {
    const { documentId, filePath, fileType } = data;

    const ocrResult = await this.performOCR(filePath, fileType);

    // Update document
    await supabaseAdmin
      .from('documents')
      .update({
        extracted_text: ocrResult.text,
        confidence: ocrResult.confidence
      })
      .eq('id', documentId);

    return ocrResult;
  }

  /**
   * Classify document type
   */
  private async classifyDocument(data: any, context: ExecutionContext): Promise<any> {
    const { documentId, content } = data;

    const prompt = `Classify this construction document into one of these categories:
    - Blueprint/Drawing
    - Specification
    - Contract
    - RFI (Request for Information)
    - Submittal
    - Change Order
    - Safety Document
    - Permit
    - Other

Content preview: ${content.substring(0, 1000)}

Respond with just the category name.`;

    const response = await this.aiService.getSunaResponse(prompt, {});
    const classification = response.content.trim();

    // Update document
    await supabaseAdmin
      .from('documents')
      .update({
        category: classification,
        metadata: {
          classification_confidence: 'high',
          classified_at: new Date().toISOString()
        }
      })
      .eq('id', documentId);

    return { classification };
  }

  // Helper methods

  private needsOCR(fileType: string): boolean {
    return fileType.includes('image') || fileType === 'application/pdf';
  }

  private async performOCR(filePath: string, fileType: string): Promise<{ text: string; confidence: number }> {
    if (fileType === 'application/pdf') {
      // PDF processing
      const pdfParse = require('pdf-parse');
      const fs = require('fs');
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      
      return {
        text: pdfData.text,
        confidence: pdfData.text.length > 0 ? 95 : 50
      };
    } else {
      // Image OCR with Tesseract
      const worker = await createWorker('eng', 1, {
        workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js',
        langPath: 'https://tessdata.projectnaptha.com/4.0.0',
        corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5/tesseract-core.wasm.js',
      });
      
      const { data: { text, confidence } } = await worker.recognize(filePath);
      await worker.terminate();
      
      return {
        text: text.trim(),
        confidence: Math.round(confidence)
      };
    }
  }

  private extractInsights(content: string): string[] {
    const insights: string[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.match(/^[-•*]\s+/) || trimmed.match(/^\d+\.\s+/)) {
        insights.push(trimmed.replace(/^[-•*]\s+/, '').replace(/^\d+\.\s+/, ''));
      }
    }

    return insights.slice(0, 10);
  }

  private async determineClassifications(content: string): Promise<string[]> {
    const classifications: string[] = [];
    
    const keywords = {
      safety: ['safety', 'hazard', 'ppe', 'osha'],
      compliance: ['code', 'regulation', 'compliance', 'permit'],
      structural: ['structural', 'foundation', 'load', 'beam'],
      electrical: ['electrical', 'wiring', 'circuit', 'voltage'],
      plumbing: ['plumbing', 'pipe', 'water', 'drainage'],
      hvac: ['hvac', 'ventilation', 'heating', 'cooling']
    };

    const lowerContent = content.toLowerCase();
    
    for (const [category, terms] of Object.entries(keywords)) {
      if (terms.some(term => lowerContent.includes(term))) {
        classifications.push(category);
      }
    }

    return classifications;
  }
}
