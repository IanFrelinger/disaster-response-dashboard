import React, { useState, useRef, useEffect } from 'react';

// Add CSS animations
const styles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export interface OperationalGuidance {
  recommendation: string;
  confidence: number;
  dataSources: string[];
  alternativeScenarios: AlternativeScenario[];
  reasoning: string;
  timestamp: string;
}

export interface AlternativeScenario {
  description: string;
  pros: string[];
  cons: string[];
  impact: string;
  probability: number;
}

export interface AIPDecisionSupportProps {
  onDecisionMade?: (guidance: OperationalGuidance) => void;
  className?: string;
}

export const AIPDecisionSupport: React.FC<AIPDecisionSupportProps> = ({ 
  onDecisionMade
}) => {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentGuidance, setCurrentGuidance] = useState<OperationalGuidance | null>(null);
  const [chatHistory, setChatHistory] = useState<Array<{query: string, response: OperationalGuidance}>>([]);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Mock AIP agent function - in real implementation this would call the backend AIP
  const mockAIPAgent = async (query: string): Promise<OperationalGuidance> => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const queryLower = query.toLowerCase();
    
    // Highway 30 scenario (from the user's example)
    if (queryLower.includes('highway 30') || queryLower.includes('lose highway')) {
      return {
        recommendation: "Immediate evacuation of Zone B required. Highway 30 closure would trap 3,241 residents. Alternative routes add 23 minutes to evacuation time.",
        confidence: 0.94,
        dataSources: [
          "Traffic analysis system",
          "Population density data", 
          "Fire spread model",
          "Route capacity assessment"
        ],
        alternativeScenarios: [
          {
            description: "Maintain Highway 30 access with fire suppression",
            pros: ["Faster evacuation", "Maintains primary route", "Reduces total evacuation time"],
            cons: ["High risk to fire crews", "Resource intensive", "May not be sustainable"],
            impact: "High - could save 15-20 minutes",
            probability: 0.35
          },
          {
            description: "Immediate evacuation via alternative routes",
            pros: ["Safe for all personnel", "Guaranteed evacuation", "No additional risk"],
            cons: ["Longer evacuation time", "Higher traffic congestion", "More complex coordination"],
            impact: "Medium - 23 minute delay",
            probability: 0.65
          },
          {
            description: "Staged evacuation with Highway 30 as last resort",
            pros: ["Balanced approach", "Maintains options", "Flexible timing"],
            cons: ["Complex coordination", "Potential confusion", "May delay critical decisions"],
            impact: "Medium - 10-15 minute delay",
            probability: 0.45
          }
        ],
        reasoning: "Highway 30 is the primary evacuation route for Zone B. Closure analysis shows 3,241 residents would be trapped with only 2 alternative routes available. Fire spread model predicts 94% probability of route blockage within 2 hours. Alternative routes add 23 minutes to evacuation time but provide 100% evacuation guarantee.",
        timestamp: new Date().toISOString()
      };
    }
    
    // Pine Valley evacuation scenario
    if (queryLower.includes('pine valley') || queryLower.includes('evacuate pine')) {
      return {
        recommendation: "YES, evacuate Pine Valley immediately. CRITICAL risk hazard detected. Fire predicted to reach Pine Valley in 47 minutes. Affected population: 3,241 people.",
        confidence: 0.87,
        dataSources: [
          "Satellite heat detection",
          "Wind pattern analysis",
          "Population census data",
          "Fire spread model"
        ],
        alternativeScenarios: [
          {
            description: "Immediate evacuation via primary routes",
            pros: ["Fastest evacuation", "Uses established routes", "Minimal coordination needed"],
            cons: ["Route congestion", "May overwhelm shelters", "Resource strain"],
            impact: "High - 15 minute evacuation",
            probability: 0.75
          },
          {
            description: "Staged evacuation by priority zones",
            pros: ["Orderly process", "Better resource allocation", "Reduced panic"],
            cons: ["Slower overall", "Complex coordination", "May delay critical cases"],
            impact: "Medium - 25 minute evacuation",
            probability: 0.60
          }
        ],
        reasoning: "Satellite detection shows fire front advancing at 0.8 mph with 25 mph winds. Pine Valley has 3,241 residents with 3 evacuation routes available. Fire spread model predicts arrival in 47 minutes with 87% confidence. Immediate evacuation provides 15-minute safety margin.",
        timestamp: new Date().toISOString()
      };
    }
    
    // Oak Ridge monitoring scenario
    if (queryLower.includes('oak ridge') || queryLower.includes('oak ridge status')) {
      return {
        recommendation: "MONITOR: Oak Ridge has medium risk. Prepare evacuation plans and monitor conditions closely. Available evacuation routes: 2. Available emergency units: 4.",
        confidence: 0.72,
        dataSources: [
          "Ground sensor network",
          "Weather monitoring",
          "Route availability check",
          "Emergency unit status"
        ],
        alternativeScenarios: [
          {
            description: "Continue monitoring with current resources",
            pros: ["Maintains current operations", "No disruption", "Cost effective"],
            cons: ["Limited response capability", "May miss escalation", "Delayed action if needed"],
            impact: "Low - maintain current status",
            probability: 0.80
          },
          {
            description: "Pre-position additional resources",
            pros: ["Faster response if needed", "Better preparedness", "Reduced risk"],
            cons: ["Resource allocation", "Cost increase", "May be unnecessary"],
            impact: "Medium - improved readiness",
            probability: 0.65
          }
        ],
        reasoning: "Oak Ridge shows medium risk indicators with stable conditions. Two evacuation routes are available with 4 emergency units in range. Current monitoring provides adequate coverage with 72% confidence. Recommend maintaining current posture while preparing contingency plans.",
        timestamp: new Date().toISOString()
      };
    }
    
    // Default response for other queries
    return {
      recommendation: "I understand your query about disaster response. Please provide more specific details about the location, hazard type, or decision you need assistance with.",
      confidence: 0.50,
      dataSources: ["General disaster response protocols", "Basic hazard assessment"],
      alternativeScenarios: [
        {
          description: "Continue gathering information",
          pros: ["Better understanding", "More accurate assessment", "Informed decision making"],
          cons: ["Time delay", "May miss critical window", "Resource allocation uncertainty"],
          impact: "Medium - improved decision quality",
          probability: 0.70
        }
      ],
      reasoning: "Your query requires more specific information to provide accurate operational guidance. I can help with evacuation decisions, resource allocation, route optimization, and hazard assessment once I have more context.",
      timestamp: new Date().toISOString()
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isProcessing) return;

    setIsProcessing(true);
    
    try {
      const guidance = await mockAIPAgent(query);
      setCurrentGuidance(guidance);
      
      // Add to chat history
      setChatHistory(prev => [...prev, { query, response: guidance }]);
      
      // Notify parent component
      if (onDecisionMade) {
        onDecisionMade(guidance);
      }
      
      // Clear input
      setQuery('');
    } catch (error) {
      console.error('AIP processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatConfidence = (confidence: number) => {
    if (confidence >= 0.9) return 'Very High';
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.7) return 'Moderate';
    if (confidence >= 0.6) return 'Fair';
    return 'Low';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#34C759';
    if (confidence >= 0.6) return '#FF9500';
    return '#FF3B30';
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.98)',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(0, 0, 0, 0.06)',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
        color: 'white',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{
          fontSize: '32px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          width: '56px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)'
        }}>🤖</div>
        <div style={{ flex: 1 }}>
          <h2 style={{
            margin: '0 0 4px 0',
            fontSize: '24px',
            fontWeight: '700',
            lineHeight: '1.2',
            letterSpacing: '-0.02em'
          }}>Disaster Commander</h2>
          <p style={{
            margin: '0',
            fontSize: '14px',
            opacity: '0.9',
            fontWeight: '400'
          }}>AI-Powered Decision Support System</p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#34C759',
            animation: 'pulse 2s infinite'
          }}></div>
          <span>Active</span>
        </div>
      </div>

      {/* Chat Interface */}
      <div style={{
        maxHeight: '400px',
        overflowY: 'auto',
        padding: '20px',
        background: 'rgba(248, 249, 250, 0.8)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {chatHistory.map((chat, index) => (
            <div key={index} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <div style={{
                  fontSize: '20px',
                  background: 'rgba(0, 122, 255, 0.1)',
                  borderRadius: '8px',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#007AFF'
                }}>👤</div>
                <div style={{
                  background: 'rgba(0, 122, 255, 0.05)',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(0, 122, 255, 0.1)',
                  flex: 1,
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}>{chat.query}</div>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <div style={{
                  fontSize: '20px',
                  background: 'rgba(88, 86, 214, 0.1)',
                  borderRadius: '8px',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#5856D6'
                }}>🤖</div>
                <div style={{
                  background: 'rgba(88, 86, 214, 0.05)',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(88, 86, 214, 0.1)',
                  flex: 1
                }}>
                  <div style={{
                    marginBottom: '16px',
                    padding: '12px',
                    background: 'rgba(52, 199, 89, 0.05)',
                    borderRadius: '8px',
                    border: '1px solid rgba(52, 199, 89, 0.1)'
                  }}>
                    <strong style={{ color: '#34C759' }}>Recommendation:</strong> 
                    <div style={{ marginTop: '8px', lineHeight: '1.4' }}>{chat.response.recommendation}</div>
                  </div>
                  
                  <div style={{
                    marginBottom: '16px',
                    padding: '12px',
                    background: 'rgba(255, 149, 0, 0.05)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 149, 0, 0.1)'
                  }}>
                    <span>Confidence: </span>
                    <span style={{ 
                      color: getConfidenceColor(chat.response.confidence),
                      fontWeight: '600'
                    }}>
                      {formatConfidence(chat.response.confidence)} ({Math.round(chat.response.confidence * 100)}%)
                    </span>
                  </div>
                  
                  <div style={{
                    marginBottom: '16px',
                    padding: '12px',
                    background: 'rgba(0, 122, 255, 0.05)',
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 122, 255, 0.1)'
                  }}>
                    <strong style={{ color: '#007AFF' }}>Data Sources:</strong>
                    <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                      {chat.response.dataSources.map((source, idx) => (
                        <li key={idx} style={{ marginBottom: '4px' }}>{source}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div style={{
                    marginBottom: '16px',
                    padding: '12px',
                    background: 'rgba(88, 86, 214, 0.05)',
                    borderRadius: '8px',
                    border: '1px solid rgba(88, 86, 214, 0.1)'
                  }}>
                    <strong style={{ color: '#5856D6' }}>Reasoning:</strong> 
                    <div style={{ marginTop: '8px', lineHeight: '1.4' }}>{chat.response.reasoning}</div>
                  </div>
                  
                  <button 
                    style={{
                      background: 'rgba(88, 86, 214, 0.1)',
                      color: '#5856D6',
                      border: '1px solid rgba(88, 86, 214, 0.2)',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      marginTop: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(88, 86, 214, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(88, 86, 214, 0.1)';
                    }}
                    onClick={() => setShowAlternatives(!showAlternatives)}
                  >
                    {showAlternatives ? 'Hide' : 'Show'} Alternative Scenarios
                  </button>
                  
                  {showAlternatives && (
                    <div style={{
                      marginTop: '16px',
                      padding: '16px',
                      background: 'rgba(88, 86, 214, 0.05)',
                      borderRadius: '12px',
                      border: '1px solid rgba(88, 86, 214, 0.1)'
                    }}>
                      <strong style={{ color: '#5856D6', fontSize: '16px' }}>Alternative Scenarios:</strong>
                      {chat.response.alternativeScenarios.map((scenario, idx) => (
                        <div key={idx} style={{
                          marginTop: '16px',
                          padding: '16px',
                          background: 'rgba(255, 255, 255, 0.8)',
                          borderRadius: '8px',
                          border: '1px solid rgba(88, 86, 214, 0.1)'
                        }}>
                          <h4 style={{
                            margin: '0 0 12px 0',
                            color: '#5856D6',
                            fontSize: '15px',
                            fontWeight: '600'
                          }}>{scenario.description}</h4>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '16px'
                          }}>
                            <div style={{
                              padding: '12px',
                              background: 'rgba(52, 199, 89, 0.05)',
                              borderRadius: '8px',
                              border: '1px solid rgba(52, 199, 89, 0.1)'
                            }}>
                              <strong style={{ color: '#34C759' }}>Pros:</strong>
                              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                                {scenario.pros.map((pro, proIdx) => (
                                  <li key={proIdx} style={{ marginBottom: '4px', fontSize: '13px' }}>{pro}</li>
                                ))}
                              </ul>
                            </div>
                            <div style={{
                              padding: '12px',
                              background: 'rgba(255, 59, 48, 0.05)',
                              borderRadius: '8px',
                              border: '1px solid rgba(255, 59, 48, 0.1)'
                            }}>
                              <strong style={{ color: '#FF3B30' }}>Cons:</strong>
                              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                                {scenario.cons.map((con, conIdx) => (
                                  <li key={conIdx} style={{ marginBottom: '4px', fontSize: '13px' }}>{con}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          <div style={{
                            marginTop: '12px',
                            padding: '12px',
                            background: 'rgba(255, 149, 0, 0.05)',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 149, 0, 0.1)',
                            display: 'flex',
                            justifyContent: 'space-between'
                          }}>
                            <div><strong style={{ color: '#FF9500' }}>Impact:</strong> {scenario.impact}</div>
                            <div><strong style={{ color: '#FF9500' }}>Probability:</strong> {Math.round(scenario.probability * 100)}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} style={{
        padding: '20px',
        background: 'rgba(248, 249, 250, 0.8)',
        borderTop: '1px solid rgba(0, 0, 0, 0.06)'
      }}>
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask the Disaster Commander: 'What happens if we lose Highway 30?'"
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              fontSize: '14px',
              fontFamily: 'inherit',
              background: 'white',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#007AFF';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)';
            }}
            disabled={isProcessing}
          />
          <button 
            type="submit" 
            style={{
              background: 'linear-gradient(135deg, #007AFF, #5856D6)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '120px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 122, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            disabled={isProcessing || !query.trim()}
          >
            {isProcessing ? (
              <>
                <span style={{
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginRight: '8px'
                }}></span>
                Processing...
              </>
            ) : (
              'Ask Commander'
            )}
          </button>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: '14px', color: '#6c757d', fontWeight: '500' }}>Example queries:</span>
          <button 
            type="button" 
            style={{
              background: 'rgba(0, 122, 255, 0.1)',
              color: '#007AFF',
              border: '1px solid rgba(0, 122, 255, 0.2)',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 122, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 122, 255, 0.1)';
            }}
            onClick={() => setQuery("What happens if we lose Highway 30?")}
          >
            Highway 30 closure
          </button>
          <button 
            type="button" 
            style={{
              background: 'rgba(52, 199, 89, 0.1)',
              color: '#34C759',
              border: '1px solid rgba(52, 199, 89, 0.2)',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(52, 199, 89, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(52, 199, 89, 0.1)';
            }}
            onClick={() => setQuery("Should we evacuate Pine Valley?")}
          >
            Pine Valley evacuation
          </button>
          <button 
            type="button" 
            style={{
              background: 'rgba(255, 149, 0, 0.1)',
              color: '#FF9500',
              border: '1px solid rgba(255, 149, 0, 0.2)',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 149, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 149, 0, 0.1)';
            }}
            onClick={() => setQuery("What's the status of Oak Ridge?")}
          >
            Oak Ridge status
          </button>
        </div>
      </form>

      {/* Current Decision Display */}
      {currentGuidance && (
        <div style={{
          padding: '20px',
          background: 'rgba(248, 249, 250, 0.8)',
          borderTop: '1px solid rgba(0, 0, 0, 0.06)'
        }}>
          <h3 style={{
            margin: '0 0 16px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: '#1d1d1f'
          }}>Latest Decision</h3>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <span style={{
                backgroundColor: getConfidenceColor(currentGuidance.confidence),
                color: 'white',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {Math.round(currentGuidance.confidence * 100)}% Confidence
              </span>
              <span style={{
                fontSize: '12px',
                color: '#6c757d'
              }}>
                {new Date(currentGuidance.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div style={{
              fontSize: '14px',
              lineHeight: '1.4',
              color: '#1d1d1f'
            }}>
              {currentGuidance.recommendation}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
