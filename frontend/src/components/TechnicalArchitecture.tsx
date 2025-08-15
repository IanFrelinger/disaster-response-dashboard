import React, { useState } from 'react';
import './TechnicalArchitecture.css';

interface TechnicalArchitectureProps {
  className?: string;
}

export const TechnicalArchitecture: React.FC<TechnicalArchitectureProps> = ({
  className = ''
}) => {
  const [activeView, setActiveView] = useState<'overview' | 'data-flow' | 'foundry' | 'metrics'>('overview');
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  // System architecture data
  const architectureData = {
    overview: {
      title: "System Architecture Overview",
      description: "High-level view of the disaster response platform components and their interactions",
      components: [
        {
          id: "frontend",
          name: "React Frontend",
          type: "UI Layer",
          description: "Modern web interface with real-time updates",
          status: "active",
          technologies: ["React", "TypeScript", "Mapbox", "Playwright"]
        },
        {
          id: "backend",
          name: "Python Backend",
          type: "API Layer",
          description: "RESTful API with real-time data processing",
          status: "active",
          technologies: ["FastAPI", "Python", "PostgreSQL", "Redis"]
        },
        {
          id: "foundry",
          name: "Foundry Integration",
          type: "Data Layer",
          description: "Data fusion and ontology management",
          status: "active",
          technologies: ["Foundry", "Ontology", "Data Pipelines", "AI/ML"]
        },
        {
          id: "aip",
          name: "AIP Decision Support",
          type: "AI Layer",
          description: "Intelligent decision support and recommendations",
          status: "active",
          technologies: ["LLM", "Decision Engine", "Confidence Scoring"]
        }
      ]
    },
    dataFlow: {
      title: "Data Flow Architecture",
      description: "Real-time data ingestion, processing, and distribution throughout the system",
      flows: [
        {
          id: "ingestion",
          name: "Data Ingestion",
          source: "External Feeds",
          destination: "Data Pipeline",
          dataTypes: ["Satellite", "Weather", "Traffic", "Population"],
          frequency: "Real-time",
          volume: "High"
        },
        {
          id: "processing",
          name: "Data Processing",
          source: "Data Pipeline",
          destination: "Analysis Engine",
          dataTypes: ["Hazard Detection", "Risk Assessment", "Route Optimization"],
          frequency: "Continuous",
          volume: "Medium"
        },
        {
          id: "distribution",
          name: "Data Distribution",
          source: "Analysis Engine",
          destination: "Frontend",
          dataTypes: ["Alerts", "Updates", "Recommendations"],
          frequency: "Real-time",
          volume: "Low"
        }
      ]
    },
    foundry: {
      title: "Foundry Integration & Ontology",
      description: "How Foundry's data pipelines and ontology drive intelligent decision support",
      features: [
        {
          id: "data-fusion",
          name: "Multi-Source Data Fusion",
          description: "Integrates satellite, weather, traffic, and demographic data",
          benefits: ["Unified data model", "Real-time updates", "Context awareness"],
          status: "implemented"
        },
        {
          id: "ontology",
          name: "Semantic Ontology",
          description: "Defines relationships between hazards, zones, routes, and resources",
          benefits: ["Intelligent queries", "Context-aware AI", "Data relationships"],
          status: "implemented"
        },
        {
          id: "ai-pipeline",
          name: "AI/ML Pipeline",
          description: "Processes data through machine learning models for predictions",
          benefits: ["Hazard prediction", "Route optimization", "Risk assessment"],
          status: "implemented"
        },
        {
          id: "real-time",
          name: "Real-Time Processing",
          description: "Streaming data processing with minimal latency",
          benefits: ["Instant updates", "Live monitoring", "Quick response"],
          status: "implemented"
        }
      ]
    },
    metrics: {
      title: "Performance Metrics & ROI",
      description: "Quantified impact and performance indicators for the disaster response platform",
      categories: [
        {
          id: "response-time",
          name: "Response Time Improvements",
          metrics: [
            { name: "Hazard Detection", before: "15 minutes", after: "2 minutes", improvement: "87%" },
            { name: "Route Planning", before: "45 minutes", after: "5 minutes", improvement: "89%" },
            { name: "Unit Assignment", before: "30 minutes", after: "3 minutes", improvement: "90%" },
            { name: "Decision Support", before: "60 minutes", after: "10 minutes", improvement: "83%" }
          ]
        },
        {
          id: "efficiency",
          name: "Operational Efficiency",
          metrics: [
            { name: "Staffing Requirements", before: "12 personnel", after: "8 personnel", improvement: "33%" },
            { name: "Data Processing", before: "Manual", after: "Automated", improvement: "100%" },
            { name: "Coordination Time", before: "90 minutes", after: "15 minutes", improvement: "83%" },
            { name: "Information Accuracy", before: "85%", after: "98%", improvement: "15%" }
        ]
        },
        {
          id: "cost-savings",
          name: "Cost Savings & ROI",
          metrics: [
            { name: "Annual Operational Costs", before: "$2.4M", after: "$1.6M", savings: "$800K" },
            { name: "Staffing Costs", before: "$1.8M", after: "$1.2M", savings: "$600K" },
            { name: "Equipment Utilization", before: "65%", after: "85%", improvement: "31%" },
            { name: "Response Efficiency", before: "70%", after: "92%", improvement: "31%" }
          ]
        }
      ]
    }
  };

  // Get active data based on current view
  const getActiveData = () => {
    return architectureData[activeView as keyof typeof architectureData];
  };

  // Type guard functions for different view types
  const isOverviewView = (data: any): data is typeof architectureData.overview => {
    return 'components' in data;
  };

  const isDataFlowView = (data: any): data is typeof architectureData.dataFlow => {
    return 'flows' in data;
  };

  const isFoundryView = (data: any): data is typeof architectureData.foundry => {
    return 'features' in data;
  };

  const isMetricsView = (data: any): data is typeof architectureData.metrics => {
    return 'categories' in data;
  };

  // Handle component selection
  const handleComponentSelect = (componentId: string) => {
    setSelectedComponent(componentId);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#34C759';
      case 'implemented': return '#34C759';
      case 'pending': return '#FF9500';
      case 'planned': return '#007AFF';
      default: return '#8E8E93';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '🟢';
      case 'implemented': return '✅';
      case 'pending': return '🟡';
      case 'planned': return '🔵';
      default: return '⚪';
    }
  };

  const activeData = getActiveData();

  return (
    <div className={`technical-architecture ${className}`} style={{
      padding: '20px',
      backgroundColor: '#f5f5f7',
      borderRadius: '12px',
      minHeight: '600px',
      margin: '0',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div className="ios-card" style={{ margin: '0 0 var(--ios-spacing-lg) 0' }}>
        <div className="ios-container" style={{ padding: 0 }}>
          <div className="ios-flex-between">
            <div>
              <h1 className="ios-headline" style={{ color: 'var(--ios-blue)', margin: 0, marginBottom: 'var(--ios-spacing-xs)' }}>
                Technical Architecture
              </h1>
              <p className="ios-caption" style={{ margin: 0 }}>
                System design, data flow, and Foundry integration overview
              </p>
            </div>
            
            <div className="ios-flex" style={{ gap: 'var(--ios-spacing-md)' }}>
              <button 
                className={`ios-button ${activeView === 'overview' ? 'primary' : 'secondary'} small`}
                onClick={() => setActiveView('overview')}
              >
                Overview
              </button>
              <button 
                className={`ios-button ${activeView === 'data-flow' ? 'primary' : 'secondary'} small`}
                onClick={() => setActiveView('data-flow')}
              >
                Data Flow
              </button>
              <button 
                className={`ios-button ${activeView === 'foundry' ? 'primary' : 'secondary'} small`}
                onClick={() => setActiveView('foundry')}
              >
                Foundry
              </button>
              <button 
                className={`ios-button ${activeView === 'metrics' ? 'primary' : 'secondary'} small`}
                onClick={() => setActiveView('metrics')}
              >
                Metrics
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="architecture-content">
        {/* Overview View */}
        {activeView === 'overview' && isOverviewView(activeData) && (
          <div className="overview-view">
            <div className="ios-card">
              <div className="ios-container">
                <div className="view-header">
                  <h3>{activeData.title}</h3>
                  <p>{activeData.description}</p>
                </div>
                
                <div className="components-grid">
                  {activeData.components.map(component => (
                    <div
                      key={component.id}
                      className={`component-card ${selectedComponent === component.id ? 'selected' : ''}`}
                      onClick={() => handleComponentSelect(component.id)}
                    >
                      <div className="component-header">
                        <div className="component-type">{component.type}</div>
                        <div className="component-status">
                          <span className="status-icon">{getStatusIcon(component.status)}</span>
                          <span className="status-text">{component.status}</span>
                        </div>
                      </div>
                      
                      <div className="component-name">{component.name}</div>
                      <div className="component-description">{component.description}</div>
                      
                      <div className="component-technologies">
                        {component.technologies.map((tech, index) => (
                          <span key={index} className="technology-tag">{tech}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Flow View */}
        {activeView === 'data-flow' && isDataFlowView(activeData) && (
          <div className="data-flow-view">
            <div className="ios-card">
              <div className="ios-container">
                <div className="view-header">
                  <h3>{activeData.title}</h3>
                  <p>{activeData.description}</p>
                </div>
                
                <div className="flow-diagram">
                  {activeData.flows.map((flow, index) => (
                    <div key={flow.id} className="flow-item">
                      <div className="flow-header">
                        <div className="flow-name">{flow.name}</div>
                        <div className="flow-arrow">→</div>
                      </div>
                      
                      <div className="flow-details">
                        <div className="flow-source">
                          <span className="label">Source:</span>
                          <span className="value">{flow.source}</span>
                        </div>
                        <div className="flow-destination">
                          <span className="label">Destination:</span>
                          <span className="value">{flow.destination}</span>
                        </div>
                        <div className="flow-data">
                          <span className="label">Data Types:</span>
                          <div className="data-types">
                            {flow.dataTypes.map((type, typeIndex) => (
                              <span key={typeIndex} className="data-type-tag">{type}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flow-metrics">
                          <div className="metric">
                            <span className="label">Frequency:</span>
                            <span className="value">{flow.frequency}</span>
                          </div>
                          <div className="metric">
                            <span className="label">Volume:</span>
                            <span className="value">{flow.volume}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Foundry View */}
        {activeView === 'foundry' && isFoundryView(activeData) && (
          <div className="foundry-view">
            <div className="ios-card">
              <div className="ios-container">
                <div className="view-header">
                  <h3>{activeData.title}</h3>
                  <p>{activeData.description}</p>
                </div>
                
                <div className="features-grid">
                  {activeData.features.map(feature => (
                    <div
                      key={feature.id}
                      className={`feature-card ${selectedComponent === feature.id ? 'selected' : ''}`}
                      onClick={() => handleComponentSelect(feature.id)}
                    >
                      <div className="feature-header">
                        <div className="feature-name">{feature.name}</div>
                        <div className="feature-status">
                          <span className="status-icon">{getStatusIcon(feature.status)}</span>
                          <span className="status-text">{feature.status}</span>
                        </div>
                      </div>
                      
                      <div className="feature-description">{feature.description}</div>
                      
                      <div className="feature-benefits">
                        <span className="label">Benefits:</span>
                        <div className="benefits-list">
                          {feature.benefits.map((benefit, index) => (
                            <span key={index} className="benefit-tag">{benefit}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Metrics View */}
        {activeView === 'metrics' && isMetricsView(activeData) && (
          <div className="metrics-view">
            <div className="ios-card">
              <div className="ios-container">
                <div className="view-header">
                  <h3>{activeData.title}</h3>
                  <p>{activeData.description}</p>
                </div>
                
                <div className="metrics-categories">
                  {activeData.categories.map(category => (
                    <div key={category.id} className="category-section">
                      <h4 className="category-title">{category.name}</h4>
                      <div className="metrics-grid">
                        {category.metrics.map((metric, index) => (
                          <div key={index} className="metric-card">
                            <div className="metric-name">{metric.name}</div>
                            <div className="metric-comparison">
                              <div className="metric-before">
                                <span className="label">Before:</span>
                                <span className="value">{metric.before}</span>
                              </div>
                              <div className="metric-after">
                                <span className="label">After:</span>
                                <span className="value">{metric.after}</span>
                              </div>
                            </div>
                            <div className="metric-improvement">
                              <span className="label">Improvement:</span>
                              <span className="value improvement">{metric.improvement}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Component Details Panel */}
      {selectedComponent && (
        <div className="component-details-panel">
          <div className="ios-card">
            <div className="ios-container">
              <div className="ios-flex-between">
                <h3>Component Details</h3>
                <button 
                  className="ios-button secondary small"
                  onClick={() => setSelectedComponent(null)}
                >
                  ✕
                </button>
              </div>
              
              <div className="component-details-content">
                <div className="detail-section">
                  <h4>Component Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">ID:</span>
                      <span className="value">{selectedComponent}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Status:</span>
                      <span className="value">Active</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Type:</span>
                      <span className="value">Core Component</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Technical Specifications</h4>
                  <div className="specs-list">
                    <div className="spec-item">
                      <span className="label">Architecture:</span>
                      <span className="value">Microservices</span>
                    </div>
                    <div className="spec-item">
                      <span className="label">Scalability:</span>
                      <span className="value">Horizontal</span>
                    </div>
                    <div className="spec-item">
                      <span className="label">Reliability:</span>
                      <span className="value">99.9%</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Integration Points</h4>
                  <div className="integration-list">
                    <div className="integration-item">
                      <span className="label">Data Sources:</span>
                      <span className="value">Multiple APIs</span>
                    </div>
                    <div className="integration-item">
                      <span className="label">External Services:</span>
                      <span className="value">Foundry, Weather APIs</span>
                    </div>
                    <div className="integration-item">
                      <span className="label">Monitoring:</span>
                      <span className="value">Prometheus, Grafana</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Component Actions</h4>
                  <div className="component-actions">
                    <button className="ios-button primary">
                      View Logs
                    </button>
                    <button className="ios-button secondary">
                      Monitor Health
                    </button>
                    <button className="ios-button secondary">
                      View Metrics
                    </button>
                    <button className="ios-button secondary">
                      Documentation
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicalArchitecture;
