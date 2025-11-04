"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Sparkles } from "lucide-react";

interface DomainItem {
  type: string;
  mention: string;
  category?: string;
  specifications?: string[];
}

interface DomainSpecification {
  category: string;
  values: string[];
  standards?: string[];
}

interface DomainSummary {
  total_items: number;
  item_types: number;
  has_specifications: boolean;
  completeness_score: number;
}

interface DomainData {
  [key: string]: unknown;
  items?: DomainItem[];
  specifications?: DomainSpecification[];
  standards?: string[];
  summary?: DomainSummary;
}

interface UniversalDomainViewerProps {
  domainAnalysis: {
    [domain: string]: DomainData;
  };
}

export function UniversalDomainViewer({ domainAnalysis }: UniversalDomainViewerProps) {
  const domains = Object.entries(domainAnalysis || {});

  if (domains.length === 0) {
    return null;
  }

  // Helper function to format domain name for display
  const formatDomainName = (domain: string): string => {
    return domain
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper function to get color scheme for different domains
  const getDomainColors = (domain: string) => {
    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
      hvac: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
      plumbing: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      electrical: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
      structural: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
      mechanical: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
      architectural: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
    };
    
    return colorMap[domain.toLowerCase()] || { 
      bg: 'bg-gray-50', 
      text: 'text-gray-700', 
      border: 'border-gray-200' 
    };
  };

  return (
    <div className="space-y-6">
      <div className="border-t pt-6">
        <h3 className="text-xl font-semibold text-primary mb-4">
          Domain Analysis
        </h3>
        <p className="text-sm text-neutral-500">
          Extracted specifications and standards across {domains.length} domain{domains.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {domains.map(([domainName, domainData]) => {
          const colors = getDomainColors(domainName);
          const summary = domainData.summary;
          const items = domainData.items || [];
          const specifications = domainData.specifications || [];
          const standards = domainData.standards || [];

          // Group items by category if available
          const itemsByCategory: Record<string, DomainItem[]> = {};
          items.forEach(item => {
            const category = item.category || 'General';
            if (!itemsByCategory[category]) {
              itemsByCategory[category] = [];
            }
            itemsByCategory[category].push(item);
          });

          return (
            <Card key={domainName} className={`shadow-lg ${colors.border}`}>
              <CardHeader className="pb-4">
                <CardTitle className={`flex items-center gap-2 ${colors.text}`}>
                  <Sparkles className="h-5 w-5" />
                  {formatDomainName(domainName)}
                </CardTitle>
                {summary && summary.completeness_score !== undefined && (
                  <p className="text-sm text-neutral-500 mt-1">
                    {summary.completeness_score.toFixed(0)}% Complete
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items by Category */}
                {Object.entries(itemsByCategory).length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">
                      Items {summary?.total_items ? `(${summary.total_items} total)` : ''}
                    </h4>
                    <div className="space-y-3">
                      {Object.entries(itemsByCategory).map(([category, categoryItems]) => (
                        <div key={category}>
                          <p className="text-xs font-medium text-neutral-600 mb-1.5">
                            {category}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {categoryItems.slice(0, 8).map((item, idx) => (
                              <span 
                                key={idx} 
                                className={`text-xs px-2 py-1 ${colors.bg} ${colors.text} rounded-md`}
                                title={item.mention}
                              >
                                {item.type}
                              </span>
                            ))}
                            {categoryItems.length > 8 && (
                              <span className="text-xs px-2 py-1 bg-neutral-100 text-neutral-600 rounded-md">
                                +{categoryItems.length - 8} more
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Specifications */}
                {specifications.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">
                      Specifications
                    </h4>
                    <div className="space-y-2">
                      {specifications.slice(0, 5).map((spec, idx) => (
                        <div key={idx} className="text-sm">
                          <p className="font-medium text-neutral-700">{spec.category}</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {spec.values.slice(0, 4).map((value, vIdx) => (
                              <span 
                                key={vIdx}
                                className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md"
                              >
                                {value}
                              </span>
                            ))}
                            {spec.values.length > 4 && (
                              <span className="text-xs px-2 py-1 bg-neutral-100 text-neutral-600 rounded-md">
                                +{spec.values.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      {specifications.length > 5 && (
                        <p className="text-xs text-neutral-500 italic">
                          +{specifications.length - 5} more specification categories
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Standards */}
                {standards.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">
                      Standards Compliance
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {standards.slice(0, 6).map((std, idx) => (
                        <span 
                          key={idx} 
                          className="text-xs px-2 py-1 bg-warning/10 text-warning rounded-md"
                        >
                          {std}
                        </span>
                      ))}
                      {standards.length > 6 && (
                        <span className="text-xs px-2 py-1 bg-neutral-100 text-neutral-600 rounded-md">
                          +{standards.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Item Types Summary - if item_types is a number, show count instead */}
                {summary && typeof summary.item_types === 'number' && summary.item_types > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">
                      Detected Types
                    </h4>
                    <p className="text-sm text-neutral-600">
                      {summary.item_types} unique item types found
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
