# 🚀 Palantir Building Challenge - Deployment Guide

## 📋 Quick Start for Challenge Submission

This guide will get your disaster response dashboard running in Foundry for the Building Challenge in under 30 minutes.

## 🎯 What You'll Deploy

1. **Transforms** - Real-time wildfire data processing
2. **AIP Agents** - Natural language decision support
3. **Ontology** - Live data model with Actions
4. **Demo Script** - Showcase all capabilities

## ⚡ Step-by-Step Deployment

### **Step 1: Prepare Your Foundry Environment**
```bash
# Ensure you have access to:
# - Code Workspaces
# - Data Workspaces  
# - AI/ML Workspaces
# - Ontology Workspaces
```

### **Step 2: Upload Core Components**

#### **2.1 Upload Transforms**
- Go to **Code Workspaces** → **Transforms**
- Create new workspace: `disaster-response-transforms`
- Upload `backend/transforms/challenge_winning_transform.py`
- Deploy to your data processing pipeline

#### **2.2 Upload AIP Agents**
- Go to **AI/ML Workspaces** → **AIP**
- Create new workspace: `disaster-response-aip`
- Upload `backend/aip/challenge_winning_aip.py`
- Deploy AIP agents to your AI workspace

#### **2.3 Upload Ontology**
- Go to **Ontology Workspaces**
- Create new workspace: `disaster-response-ontology`
- Upload `backend/ontology/challenge_winning_ontology.py`
- Deploy ontology objects to your data model

### **Step 3: Configure Data Sources**

#### **3.1 Wildfire Data Feed**
```python
# In your Foundry environment, create a data source:
# - Type: REST API or File Upload
# - Format: GeoJSON or CSV
# - Update frequency: Real-time or hourly
```

#### **3.2 Terrain and Population Data**
```python
# Upload sample data files:
# - admin_boundaries.geojson
# - california_counties.geojson
# - mock_hazards.geojson
# - mock_routes.geojson
```

### **Step 4: Run the Demo**

#### **4.1 Upload Demo Script**
- Upload `scripts/challenge_winning_demo.py` to your Code Workspace
- Ensure all dependencies are available (pandas, numpy, h3)

#### **4.2 Execute Demo**
```python
# In your Foundry Python environment:
python challenge_winning_demo.py --mode full --verbose
```

## 🎭 Demo Presentation Script

### **Opening (2 minutes)**
"Today I'll demonstrate a complete disaster response dashboard built entirely on Palantir Foundry. This isn't just a concept - it's production-ready code that processes real wildfire data, makes AI-powered evacuation decisions, and updates live ontology objects."

### **Component Showcase (8 minutes)**

#### **1. Transforms (3 minutes)**
- Show `process_wildfire_data()` processing live feeds
- Demonstrate `compute_hazard_zones()` with terrain analysis
- Highlight `optimize_evacuation_routes()` AI optimization

#### **2. AIP Agents (3 minutes)**
- Run `EvacuationCommander` with natural language queries
- Show `WildfireSpreadPredictor` ML predictions
- Demonstrate `quick_evacuation_check()` rapid assessment

#### **3. Ontology (2 minutes)**
- Display live `ChallengeHazardZone` updates
- Show `ChallengeEvacuationOrder` Actions
- Highlight real-time relationship updates

### **Live Demo (5 minutes)**
- Process new wildfire data
- Generate evacuation recommendations
- Update hazard zones in real-time
- Show route optimization results

### **Closing (2 minutes)**
"This demonstrates Foundry's power for real-world applications. We've built a system that could save lives during disasters, using Foundry's native capabilities for data processing, AI, and real-time updates."

## 🔧 Troubleshooting

### **Common Issues**

#### **Import Errors**
```python
# If you see Palantir import errors:
# 1. Ensure you're in the right Foundry workspace
# 2. Check that dependencies are available
# 3. Verify code is deployed to the correct workspace type
```

#### **Data Source Issues**
```python
# If transforms can't access data:
# 1. Check data source permissions
# 2. Verify data format matches expectations
# 3. Ensure data is in the correct workspace
```

#### **AIP Agent Issues**
```python
# If AIP agents aren't responding:
# 1. Verify agent deployment in AI/ML workspace
# 2. Check agent configuration and permissions
# 3. Ensure ontology objects are accessible
```

## 📊 Success Metrics

### **What Judges Will See**
- ✅ **Real-time data processing** with live wildfire feeds
- ✅ **AI-powered decisions** using natural language
- ✅ **Dynamic ontology updates** during emergencies
- ✅ **Production-ready code** (not prototypes)
- ✅ **Complete Foundry integration** (all layers)

### **Key Differentiators**
- **Live Actions**: Real-time ontology updates
- **H3 Geospatial Indexing**: Performance optimization
- **Natural Language Interface**: User-friendly AI agents
- **Terrain-Aware Analysis**: Sophisticated hazard modeling

## 🎉 Ready to Win!

Your disaster response dashboard demonstrates:
- **Technical Excellence**: Production-ready Foundry code
- **Business Value**: Real-world disaster response capabilities  
- **Innovation**: AI + real-time + geospatial integration
- **Platform Mastery**: Deep understanding of Foundry capabilities

**This is exactly what Palantir wants to see in the Building Challenge!** 🏆

## 📞 Support

If you encounter any issues during deployment:
1. Check the validation script: `python scripts/validate_implementations.py`
2. Review the comprehensive demo: `python scripts/challenge_winning_demo.py --help`
3. Consult the main documentation in the project root

**Good luck with your Building Challenge submission!** 🚀
