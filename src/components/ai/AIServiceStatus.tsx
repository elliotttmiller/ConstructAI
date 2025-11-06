'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, Settings, ExternalLink } from 'lucide-react';

interface AIServiceStatus {
  openai: boolean;
  google: boolean;
}

export default function AIServiceStatus() {
  const [serviceStatus, setServiceStatus] = useState<AIServiceStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSetupInstructions, setShowSetupInstructions] = useState(false);

  useEffect(() => {
    checkServiceStatus();
  }, []);

  const checkServiceStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'status check',
          agentType: 'ai-assistant'
        })
      });

      const data = await response.json();
      setServiceStatus(data.serviceStatus);
    } catch (error) {
      console.error('Failed to check AI service status:', error);
      setServiceStatus({ openai: false, google: false });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (isConfigured: boolean) => {
    if (isConfigured) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (isConfigured: boolean, serviceName: string) => {
    return (
      <Badge
        variant={isConfigured ? "default" : "destructive"}
        className="flex items-center gap-1"
      >
        {getStatusIcon(isConfigured)}
        {serviceName} {isConfigured ? 'Connected' : 'Not Configured'}
      </Badge>
    );
  };

  const allServicesConfigured = serviceStatus?.openai && serviceStatus?.google;
  const someServicesConfigured = serviceStatus?.openai || serviceStatus?.google;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              AI Service Configuration
            </CardTitle>
            <CardDescription>
              Status of integrated AI services for intelligent chat responses
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkServiceStatus}
            disabled={isLoading}
          >
            {isLoading ? 'Checking...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="font-medium">OpenAI GPT-4</div>
                {getStatusBadge(serviceStatus?.openai || false, 'OpenAI')}
                <p className="text-sm text-muted-foreground">
                  Powers AI chat, compliance checking, and project management insights
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-medium">Google Gemini</div>
                {getStatusBadge(serviceStatus?.google || false, 'Google AI')}
                <p className="text-sm text-muted-foreground">
                  Handles document analysis, BIM processing, and risk assessment
                </p>
              </div>
            </div>

            {!allServicesConfigured && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {!someServicesConfigured
                    ? 'No AI services are configured. Add your API keys to enable intelligent chat responses.'
                    : 'Some AI services are not configured. Configure all services for full functionality.'
                  }
                </AlertDescription>
              </Alert>
            )}

            {allServicesConfigured && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  All AI services are configured and ready! You now have access to intelligent, context-aware chat responses.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSetupInstructions(!showSetupInstructions)}
              >
                {showSetupInstructions ? 'Hide' : 'Show'} Setup Instructions
              </Button>
            </div>

            {showSetupInstructions && (
              <div className="space-y-4 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold">Setup Instructions</h4>

                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium flex items-center gap-2">
                      1. OpenAI API Key
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <a
                          href="https://platform.openai.com/api-keys"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1"
                        >
                          Get API Key <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </h5>
                    <p className="text-sm text-muted-foreground">
                      Add your OpenAI API key to the environment variable: <code className="bg-background px-1 rounded">OPENAI_API_KEY</code>
                    </p>
                  </div>

                  <div>
                    <h5 className="font-medium flex items-center gap-2">
                      2. Google AI API Key
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <a
                          href="https://makersuite.google.com/app/apikey"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1"
                        >
                          Get API Key <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </h5>
                    <p className="text-sm text-muted-foreground">
                      Add your Google AI API key to the environment variable: <code className="bg-background px-1 rounded">GOOGLE_AI_API_KEY</code>
                    </p>
                  </div>

                  <div className="p-3 bg-background rounded border">
                    <h6 className="font-medium mb-2">Environment File (.env.local)</h6>
                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
{`OPENAI_API_KEY=your-openai-key-here
GOOGLE_AI_API_KEY=your-google-ai-key-here`}
                    </pre>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      After updating your environment variables, restart your development server for changes to take effect.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
