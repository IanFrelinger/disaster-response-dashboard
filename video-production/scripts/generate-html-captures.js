#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class HTMLCaptureGenerator {
  constructor() {
    this.capturesDir = path.join(__dirname, '..', 'captures');
    this.ensureCapturesDirectory();
  }

  ensureCapturesDirectory() {
    if (!fs.existsSync(this.capturesDir)) {
      fs.mkdirSync(this.capturesDir, { recursive: true });
    }
  }

  generatePersonalIntro() {
    console.log('📹 Generating Personal Introduction HTML...');
    
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Personal Introduction - Ian Frelinger</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
    }
    .intro-container {
      text-align: center;
      max-width: 800px;
      padding: 40px;
    }
    .name {
      font-size: 4rem;
      font-weight: 300;
      margin-bottom: 20px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    .title {
      font-size: 2rem;
      margin-bottom: 30px;
      opacity: 0.9;
    }
    .mission {
      font-size: 1.4rem;
      line-height: 1.6;
      opacity: 0.8;
      max-width: 600px;
      margin: 0 auto;
    }
    .highlight {
      color: #ffd700;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="intro-container">
    <div class="name">Ian Frelinger</div>
    <div class="title">Software Engineer & Emergency Response Specialist</div>
    <div class="mission">
      I'm building this disaster response platform because I believe 
      <span class="highlight">emergency managers deserve better tools when lives are at stake</span>. 
      Every minute wasted in a disaster puts more people at risk, and I want to change that.
    </div>
  </div>
</body>
</html>`;
    
    const filePath = path.join(this.capturesDir, 'personal_intro.html');
    fs.writeFileSync(filePath, html);
    console.log('✅ Personal Introduction HTML generated');
  }

  generateUserPersona() {
    console.log('📹 Generating User Persona HTML...');
    
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>User Persona Definition</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
    }
    .persona-container {
      max-width: 1000px;
      padding: 40px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .main-title {
      font-size: 3rem;
      font-weight: 300;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    .subtitle {
      font-size: 1.5rem;
      opacity: 0.8;
    }
    .personas {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
      margin-top: 40px;
    }
    .persona-card {
      background: rgba(255,255,255,0.1);
      border-radius: 15px;
      padding: 25px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.2);
    }
    .persona-title {
      font-size: 1.8rem;
      margin-bottom: 15px;
      color: #3498db;
    }
    .persona-description {
      font-size: 1.1rem;
      line-height: 1.5;
      opacity: 0.9;
    }
    .challenges {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid rgba(255,255,255,0.2);
    }
    .challenge-title {
      font-size: 1.2rem;
      color: #e74c3c;
      margin-bottom: 10px;
    }
    .challenge-list {
      list-style: none;
      padding: 0;
    }
    .challenge-list li {
      margin-bottom: 8px;
      padding-left: 20px;
      position: relative;
    }
    .challenge-list li:before {
      content: "•";
      color: #e74c3c;
      position: absolute;
      left: 0;
    }
  </style>
</head>
<body>
  <div class="persona-container">
    <div class="header">
      <div class="main-title">Target Users & Their Needs</div>
      <div class="subtitle">This platform serves emergency professionals who face daily coordination challenges</div>
    </div>
    
    <div class="personas">
      <div class="persona-card">
        <div class="persona-title">Incident Commanders</div>
        <div class="persona-description">
          Senior emergency managers who need real-time visibility and rapid decision support during disasters.
        </div>
        <div class="challenges">
          <div class="challenge-title">Key Challenges:</div>
          <ul class="challenge-list">
            <li>Coordinating multiple agencies</li>
            <li>Making rapid decisions under pressure</li>
            <li>Managing limited resources effectively</li>
          </ul>
        </div>
      </div>
      
      <div class="persona-card">
        <div class="persona-title">Emergency Planners</div>
        <div class="persona-description">
          Strategic planners who develop response protocols and prepare for various disaster scenarios.
        </div>
        <div class="challenges">
          <div class="challenge-title">Key Challenges:</div>
          <ul class="challenge-list">
            <li>Scenario planning and preparation</li>
            <li>Resource allocation optimization</li>
            <li>Protocol development and training</li>
          </ul>
        </div>
      </div>
      
      <div class="persona-card">
        <div class="persona-title">Dispatchers</div>
        <div class="persona-description">
          First responders who need immediate access to critical information and coordination tools.
        </div>
        <div class="challenges">
          <div class="challenge-title">Key Challenges:</div>
          <ul class="challenge-list">
            <li>Real-time communication</li>
            <li>Rapid resource deployment</li>
            <li>Field unit coordination</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
    
    const filePath = path.join(this.capturesDir, 'user_persona.html');
    fs.writeFileSync(filePath, html);
    console.log('✅ User Persona HTML generated');
  }

  generateFoundryArchitecture() {
    console.log('📹 Generating Foundry Architecture HTML...');
    
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Foundry Architecture</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
    }
    .architecture-container {
      max-width: 1200px;
      padding: 40px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .main-title {
      font-size: 3.5rem;
      font-weight: 300;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      color: #00d4ff;
    }
    .subtitle {
      font-size: 1.5rem;
      opacity: 0.8;
    }
    .architecture-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-top: 40px;
    }
    .data-sources, .foundry-core, .processing, .outputs {
      background: rgba(0,212,255,0.1);
      border-radius: 15px;
      padding: 25px;
      border: 2px solid rgba(0,212,255,0.3);
    }
    .section-title {
      font-size: 1.8rem;
      margin-bottom: 20px;
      color: #00d4ff;
      text-align: center;
    }
    .data-item, .core-item, .process-item, .output-item {
      background: rgba(255,255,255,0.05);
      border-radius: 10px;
      padding: 15px;
      margin-bottom: 15px;
      border-left: 4px solid #00d4ff;
    }
    .item-title {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .item-description {
      font-size: 1rem;
      opacity: 0.8;
      line-height: 1.4;
    }
    .foundry-highlight {
      background: linear-gradient(45deg, #00d4ff, #0099cc);
      color: white;
      padding: 20px;
      border-radius: 15px;
      text-align: center;
      margin: 30px 0;
      font-size: 1.3rem;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="architecture-container">
    <div class="header">
      <div class="main-title">Palantir Foundry Architecture</div>
      <div class="subtitle">Real-time data streaming and ontology management for emergency response</div>
    </div>
    
    <div class="foundry-highlight">
      🚀 Foundry enables real-time data streaming, ontology management, and action workflows for emergency response
    </div>
    
    <div class="architecture-grid">
      <div class="data-sources">
        <div class="section-title">Data Sources</div>
        <div class="data-item">
          <div class="item-title">FIRMS Satellite Data</div>
          <div class="item-description">Real-time wildfire detection and monitoring</div>
        </div>
        <div class="data-item">
          <div class="item-title">NOAA Weather Feeds</div>
          <div class="item-description">Current conditions and forecasts</div>
        </div>
        <div class="data-item">
          <div class="item-title">911 Dispatch Systems</div>
          <div class="item-description">Emergency call data and response tracking</div>
        </div>
      </div>
      
      <div class="foundry-core">
        <div class="section-title">Foundry Core</div>
        <div class="core-item">
          <div class="item-title">Ontology Management</div>
          <div class="item-description">Unified data model for emergency response</div>
        </div>
        <div class="core-item">
          <div class="item-title">Data Fusion</div>
          <div class="item-description">Real-time integration of multiple sources</div>
        </div>
        <div class="core-item">
          <div class="item-title">Action Workflows</div>
          <div class="item-description">Automated response coordination</div>
        </div>
      </div>
      
      <div class="processing">
        <div class="section-title">Processing & ML</div>
        <div class="process-item">
          <div class="item-title">Hazard Spread Models</div>
          <div class="item-description">ML-powered prediction algorithms</div>
        </div>
        <div class="process-item">
          <div class="item-title">Risk Assessment</div>
          <div class="item-description">Real-time threat evaluation</div>
        </div>
        <div class="process-item">
          <div class="item-title">Route Optimization</div>
          <div class="item-description">A-Star algorithm for safe paths</div>
        </div>
      </div>
      
      <div class="outputs">
        <div class="section-title">API Endpoints</div>
        <div class="output-item">
          <div class="item-title">/api/hazards</div>
          <div class="item-description">Real-time hazard data and analysis</div>
        </div>
        <div class="output-item">
          <div class="item-title">/api/routes</div>
          <div class="item-description">Optimized evacuation paths</div>
        </div>
        <div class="output-item">
          <div class="item-title">/api/risk</div>
          <div class="item-description">Population and asset risk assessment</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
    
    const filePath = path.join(this.capturesDir, 'foundry_architecture.html');
    fs.writeFileSync(filePath, html);
    console.log('✅ Foundry Architecture HTML generated');
  }

  generateActionDemonstration() {
    console.log('📹 Generating Action Demonstration HTML...');
    
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Action Demonstration</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
    }
    .demo-container {
      max-width: 1200px;
      padding: 40px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .main-title {
      font-size: 3.5rem;
      font-weight: 300;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      color: #ffd700;
    }
    .subtitle {
      font-size: 1.5rem;
      opacity: 0.8;
    }
    .demo-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-top: 40px;
    }
    .interaction-demo, .foundry-workflow {
      background: rgba(255,255,255,0.1);
      border-radius: 15px;
      padding: 25px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.2);
    }
    .section-title {
      font-size: 1.8rem;
      margin-bottom: 20px;
      color: #ffd700;
      text-align: center;
    }
    .step-item {
      background: rgba(255,255,255,0.05);
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 20px;
      border-left: 4px solid #ffd700;
      position: relative;
    }
    .step-number {
      position: absolute;
      top: -10px;
      left: -10px;
      background: #ffd700;
      color: #2d1b69;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.2rem;
    }
    .step-title {
      font-size: 1.3rem;
      font-weight: 600;
      margin-bottom: 10px;
      margin-left: 25px;
    }
    .step-description {
      font-size: 1rem;
      opacity: 0.9;
      line-height: 1.4;
      margin-left: 25px;
    }
    .foundry-highlight {
      background: linear-gradient(45deg, #ffd700, #ffed4e);
      color: #2d1b69;
      padding: 20px;
      border-radius: 15px;
      text-align: center;
      margin: 30px 0;
      font-size: 1.3rem;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="demo-container">
    <div class="header">
      <div class="main-title">Live Hazard Interaction & User Actions</div>
      <div class="subtitle">See how Incident Commanders make decisions and take action through Foundry workflows</div>
    </div>
    
    <div class="foundry-highlight">
      🎯 Click on hazards to see risk analysis, population at risk, and recommended actions - all powered by Foundry's ontology
    </div>
    
    <div class="demo-grid">
      <div class="interaction-demo">
        <div class="section-title">User Interaction Flow</div>
        <div class="step-item">
          <div class="step-number">1</div>
          <div class="step-title">Hazard Detection</div>
          <div class="step-description">Click on any hazard on the map to see detailed information and risk assessment</div>
        </div>
        <div class="step-item">
          <div class="step-number">2</div>
          <div class="step-title">Risk Analysis</div>
          <div class="step-description">View population at risk, affected assets, and predicted spread patterns</div>
        </div>
        <div class="step-item">
          <div class="step-number">3</div>
          <div class="step-title">Decision Support</div>
          <div class="step-description">Get AI-powered recommendations for evacuation orders and resource deployment</div>
        </div>
        <div class="step-item">
          <div class="step-number">4</div>
          <div class="step-title">Action Execution</div>
          <div class="step-description">Execute evacuation orders, update hazard zones, and coordinate response units</div>
        </div>
      </div>
      
      <div class="foundry-workflow">
        <div class="section-title">Foundry-Powered Workflows</div>
        <div class="step-item">
          <div class="step-number">1</div>
          <div class="step-title">Ontology Updates</div>
          <div class="step-description">Automatically update hazard zones and risk polygons based on real-time data</div>
        </div>
        <div class="step-item">
          <div class="step-number">2</div>
          <div class="step-title">Action Coordination</div>
          <div class="step-description">Coordinate multiple agencies through Foundry's unified action system</div>
        </div>
        <div class="step-item">
          <div class="step-number">3</div>
          <div class="step-title">Data Synchronization</div>
          <div class="step-description">Keep all stakeholders updated with real-time information and status changes</div>
        </div>
        <div class="step-item">
          <div class="step-number">4</div>
          <div class="step-title">Audit Trail</div>
          <div class="step-description">Maintain complete records of all decisions and actions for post-incident review</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
    
    const filePath = path.join(this.capturesDir, 'action_demonstration.html');
    fs.writeFileSync(filePath, html);
    console.log('✅ Action Demonstration HTML generated');
  }

  generateStrongCTA() {
    console.log('📹 Generating Strong Call-to-Action HTML...');
    
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Strong Call-to-Action</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
    }
    .cta-container {
      text-align: center;
      max-width: 900px;
      padding: 40px;
    }
    .main-title {
      font-size: 4rem;
      font-weight: 300;
      margin-bottom: 30px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      color: #ffd700;
    }
    .subtitle {
      font-size: 1.8rem;
      margin-bottom: 40px;
      opacity: 0.9;
      line-height: 1.4;
    }
    .cta-message {
      font-size: 1.5rem;
      line-height: 1.6;
      margin-bottom: 40px;
      opacity: 0.9;
      max-width: 700px;
      margin-left: auto;
      margin-right: auto;
    }
    .next-steps {
      background: rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 30px;
      margin: 40px 0;
      backdrop-filter: blur(10px);
      border: 2px solid rgba(255,255,255,0.2);
    }
    .next-steps-title {
      font-size: 2rem;
      margin-bottom: 25px;
      color: #ffd700;
    }
    .step-list {
      list-style: none;
      padding: 0;
      text-align: left;
      max-width: 500px;
      margin: 0 auto;
    }
    .step-list li {
      margin-bottom: 15px;
      padding: 15px;
      background: rgba(255,255,255,0.05);
      border-radius: 10px;
      border-left: 4px solid #ffd700;
    }
    .step-text {
      font-size: 1.2rem;
      line-height: 1.4;
    }
    .contact-info {
      margin-top: 40px;
      padding: 25px;
      background: rgba(255,215,0,0.2);
      border-radius: 15px;
      border: 2px solid rgba(255,215,0,0.4);
    }
    .contact-title {
      font-size: 1.8rem;
      margin-bottom: 15px;
      color: #ffd700;
    }
    .contact-details {
      font-size: 1.3rem;
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="cta-container">
    <div class="main-title">Let's Transform Emergency Management Together</div>
    
    <div class="subtitle">
      This demo shows the core capabilities, but there's so much more to explore
    </div>
    
    <div class="cta-message">
      I'd love to show you a longer, more detailed demonstration that covers advanced features like scenario planning, resource optimization, and integration with your existing systems.
    </div>
    
    <div class="next-steps">
      <div class="next-steps-title">What's Next?</div>
      <ul class="step-list">
        <li>
          <div class="step-text">📋 Extended technical demonstration</div>
        </li>
        <li>
          <div class="step-text">🔧 Integration planning and customization</div>
        </li>
        <li>
          <div class="step-text">📊 ROI analysis and implementation roadmap</div>
        </li>
        <li>
          <div class="step-text">🤝 Partnership and development collaboration</div>
        </li>
      </ul>
    </div>
    
    <div class="contact-info">
      <div class="contact-title">Ready to Get Started?</div>
      <div class="contact-details">
        Let's discuss how this platform can transform your emergency management operations and help you save more lives. I'm excited to share more about the technical implementation and answer any questions you have.
      </div>
    </div>
  </div>
</body>
</html>`;
    
    const filePath = path.join(this.capturesDir, 'strong_cta.html');
    fs.writeFileSync(filePath, html);
    console.log('✅ Strong Call-to-Action HTML generated');
  }

  generateAllCaptures() {
    console.log('🎬 Starting HTML capture generation...');
    
    this.generatePersonalIntro();
    this.generateUserPersona();
    this.generateFoundryArchitecture();
    this.generateActionDemonstration();
    this.generateStrongCTA();
    
    console.log('🎉 All HTML captures generated successfully!');
    console.log('Files saved in:', this.capturesDir);
  }
}

// Run the generator
const generator = new HTMLCaptureGenerator();
generator.generateAllCaptures();
