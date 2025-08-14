# UI Icons and Playwright Directions Mapping

## 🎯 Navigation Elements

### Main Navigation Buttons
| Icon/Element | ID/Selector | Playwright Direction | Description |
|--------------|-------------|---------------------|-------------|
| Commander Dashboard | `text=Commander Dashboard` | `await page.click('text=Commander Dashboard')` | Main dashboard navigation |
| Live Map | `text=Live Map` | `await page.click('text=Live Map')` | Map view navigation |
| Command Center Logo | `h1:has-text("Command Center")` | `await page.waitForSelector('h1:has-text("Command Center")')` | Main title validation |

## 🗺️ Map Interface Elements

### Map Controls
| Icon/Element | ID/Selector | Playwright Direction | Description |
|--------------|-------------|---------------------|-------------|
| Map Container | `.mapboxgl-map` | `await page.waitForSelector('.mapboxgl-map')` | Main map validation |
| 3D Terrain Toggle | `text=3D Terrain` | `await page.locator('text=3D Terrain').click()` | Terrain view activation |
| Live Data Toggle | `text=Live Data` | `await page.locator('text=Live Data').click()` | Real-time data activation |
| Hazards Toggle | `text=Hazards` | `await page.locator('text=Hazards').click()` | Hazard layer activation |
| Routes Toggle | `text=Routes` | `await page.locator('text=Routes').click()` | Route display activation |
| Units Toggle | `text=Units` | `await page.locator('text=Units').click()` | Unit display activation |
| Buildings Toggle | `text=Buildings` | `await page.locator('text=Buildings').click()` | Building display activation |

### Map Layer Controls
| Icon/Element | ID/Selector | Playwright Direction | Description |
|--------------|-------------|---------------------|-------------|
| Overview Mode | `text=Overview` | `await page.locator('text=Overview').click()` | Overview view activation |
| Detailed Mode | `text=Detailed` | `await page.locator('text=Detailed').click()` | Detailed view activation |
| Predictive Mode | `text=Predictive` | `await page.locator('text=Predictive').click()` | Predictive view activation |

## 🚨 Emergency Response Elements

### Quick Action Buttons
| Icon/Element | ID/Selector | Playwright Direction | Description |
|--------------|-------------|---------------------|-------------|
| Clear Button | `.quick-button.clear` | `await page.locator('.quick-button.clear').click()` | Structure clear marking |
| Hazard Button | `.quick-button.hazard` | `await page.locator('.quick-button.hazard').click()` | Hazard detection marking |
| Victims Button | `.quick-button.victims` | `await page.locator('.quick-button.victims').click()` | Victims found marking |
| Caution Icon | `text=Caution` | `await page.locator('text=Caution').click()` | Caution indicator |
| Victims Icon | `text=👥` | `await page.locator('text=👥').click()` | Victims indicator |

### Emergency Controls
| Icon/Element | ID/Selector | Playwright Direction | Description |
|--------------|-------------|---------------------|-------------|
| Issue Alert | `text=Issue Alert` | `await page.locator('text=Issue Alert').click()` | Alert system activation |
| View Analytics | `text=View Analytics` | `await page.locator('text=View Analytics').click()` | Analytics panel |
| View on Map | `text=View on Map` | `await page.locator('text=View on Map').click()` | Map view activation |
| Optimize Route | `text=🔧 Optimize Route` | `await page.locator('text=🔧 Optimize Route').click()` | Route optimization |

## 🤖 AI Decision Support Elements

### AIP Commander Interface
| Icon/Element | ID/Selector | Playwright Direction | Description |
|--------------|-------------|---------------------|-------------|
| AIP Commander | `text=AIP Commander` | `await page.locator('text=AIP Commander').click()` | AI interface activation |
| AIP Button | `header button:has-text("🤖 AIP Commander")` | `await page.locator('header button:has-text("🤖 AIP Commander")').click()` | AI commander access |
| Example Queries | `.example-btn` | `await page.locator('.example-btn').click()` | Query examples |
| Highway 30 Query | `text=Highway 30 closure` | `await page.locator('text=Highway 30 closure').click()` | Specific query example |
| Pine Valley Query | `text=Pine Valley evacuation` | `await page.locator('text=Pine Valley evacuation').click()` | Evacuation query |
| Oak Ridge Query | `text=Oak Ridge status` | `await page.locator('text=Oak Ridge status').click()` | Status query |

### AI Support Features
| Icon/Element | ID/Selector | Playwright Direction | Description |
|--------------|-------------|---------------------|-------------|
| AI Decision Support | `text=AIP-Powered Decision Support` | `await page.locator('text=AIP-Powered Decision Support').isVisible()` | AI panel validation |
| Show Alternatives | `text=Show Alternatives` | `await page.locator('text=Show Alternatives').click()` | Alternative options |

## 🏢 Evacuation Management Elements

### Zone Management
| Icon/Element | ID/Selector | Playwright Direction | Description |
|--------------|-------------|---------------------|-------------|
| Evacuation Dashboard | `text=Evacuation` | `await page.locator('text=Evacuation').click()` | Evacuation interface |
| Zone Selection | `text=Zone` | `await page.locator('text=Zone').click()` | Zone management |
| Building Overview | `text=Building Overview` | `await page.locator('text=Building Overview').click()` | Building management |
| Weather Operations | `text=Weather Operations` | `await page.locator('text=Weather Operations').click()` | Weather integration |

### Building Status
| Icon/Element | ID/Selector | Playwright Direction | Description |
|--------------|-------------|---------------------|-------------|
| Evacuated Status | `text=Evacuated` | `await page.locator('text=Evacuated').click()` | Evacuation status |
| In Progress Status | `text=In Progress` | `await page.locator('text=In Progress').click()` | Progress status |
| Refused Status | `text=Refused` | `await page.locator('text=Refused').click()` | Refusal status |
| Uncontacted Status | `text=Uncontacted` | `await page.locator('text=Uncontacted').click()` | Contact status |

## 🛣️ Route Planning Elements

### Route Profiles
| Icon/Element | ID/Selector | Playwright Direction | Description |
|--------------|-------------|---------------------|-------------|
| All Profiles | `text=All Profiles` | `await page.locator('text=All Profiles').click()` | All route types |
| Civilian Profile | `text=Civilian` | `await page.locator('text=Civilian').click()` | Civilian routes |
| EMS Profile | `text=EMS` | `await page.locator('text=EMS').click()` | Emergency medical routes |
| Fire Tactical | `text=Fire Tactical` | `await page.locator('text=Fire Tactical').click()` | Fire response routes |
| Police Profile | `text=Police` | `await page.locator('text=Police').click()` | Police routes |

### Route Controls
| Icon/Element | ID/Selector | Playwright Direction | Description |
|--------------|-------------|---------------------|-------------|
| Route Selection | `text=Routes` | `await page.locator('text=Routes').click()` | Route management |
| Unit Assignment | `text=Units` | `await page.locator('text=Units').click()` | Unit management |
| Staging Areas | `text=Staging` | `await page.locator('text=Staging').click()` | Staging management |
| Deconfliction | `text=Deconfliction` | `await page.locator('text=Deconfliction').click()` | Conflict resolution |

## 🌤️ Weather Integration Elements

### Weather Controls
| Icon/Element | ID/Selector | Playwright Direction | Description |
|--------------|-------------|---------------------|-------------|
| Weather Panel | `text=Weather` | `await page.locator('text=Weather').click()` | Weather interface |
| Weather Alerts | `text=Weather Alerts` | `await page.locator('text=Weather Alerts').click()` | Alert system |
| Expand Weather | `text=Expand` | `await page.locator('text=Expand').click()` | Weather expansion |
| Close Weather | `text=Close` | `await page.locator('text=Close').click()` | Weather panel close |

## 🔍 Search and Marking Elements

### Search Interface
| Icon/Element | ID/Selector | Playwright Direction | Description |
|--------------|-------------|---------------------|-------------|
| Search Markings | `text=Search Markings` | `await page.locator('text=Search Markings').click()` | Search interface |
| Create Marking | `text=Create Marking` | `await page.locator('text=Create Marking').click()` | New marking creation |
| Marking Details | `text=Marking Details` | `await page.locator('text=Marking Details').click()` | Marking information |
| FEMA X-Code | `text=FEMA X-Code` | `await page.locator('text=FEMA X-Code').click()` | FEMA standards |

### Structural Damage Indicators
| Icon/Element | ID/Selector | Playwright Direction | Description |
|--------------|-------------|---------------------|-------------|
| No Damage | `text=🟢` | `await page.locator('text=🟢').click()` | No structural damage |
| Light Damage | `text=🟡` | `await page.locator('text=🟡').click()` | Minor damage |
| Moderate Damage | `text=🟠` | `await page.locator('text=🟠').click()` | Moderate damage |
| Heavy Damage | `text=🔴` | `await page.locator('text=🔴').click()` | Heavy damage |
| Destroyed | `text=⚫` | `await page.locator('text=⚫').click()` | Structure destroyed |

## 📊 Dashboard Elements

### View Mode Controls
| Icon/Element | ID/Selector | Playwright Direction | Description |
|--------------|-------------|---------------------|-------------|
| Overview Mode | `text=Overview` | `await page.locator('text=Overview').click()` | Overview view |
| Detailed Mode | `text=Detailed` | `await page.locator('text=Detailed').click()` | Detailed view |
| Projections Mode | `text=Projections` | `await page.locator('text=Projections').click()` | Projections view |
| Assets View | `text=Assets` | `await page.locator('text=Assets').click()` | Assets management |

### Interactive Features
| Icon/Element | ID/Selector | Playwright Direction | Description |
|--------------|-------------|---------------------|-------------|
| Location Selection | `text=📍` | `await page.locator('text=📍').click()` | Location picker |
| Detail Expansion | `text=🔍` | `await page.locator('text=🔍').click()` | Detail expansion |
| Data Visualization | `text=📊` | `await page.locator('text=📊').click()` | Data charts |
| Quick Actions | `text=🚨` | `await page.locator('text=🚨').click()` | Quick actions |

## 🎮 Control Panel Elements

### Map Controls
| Icon/Element | ID/Selector | Playwright Direction | Description |
|--------------|-------------|---------------------|-------------|
| Control Panel Toggle | `.control-panel-toggle` | `await page.locator('.control-panel-toggle').click()` | Panel visibility |
| Refresh Button | `text=Refresh` | `await page.locator('text=Refresh').click()` | Data refresh |
| Settings Icon | `text=Settings` | `await page.locator('text=Settings').click()` | Settings panel |
| Info Icon | `text=Info` | `await page.locator('text=Info').click()` | Information panel |
| Layers Icon | `text=Layers` | `await page.locator('text=Layers').click()` | Layer management |

## 🚑 Responder Interface Elements

### Responder Controls
| Icon/Element | ID/Selector | Playwright Direction | Description |
|--------------|-------------|---------------------|-------------|
| Responder View | `text=Responder` | `await page.locator('text=Responder').click()` | Responder interface |
| First Responder | `text=First` | `await page.locator('text=First').click()` | First responder view |
| Public Information | `text=Public` | `await page.locator('text=Public').click()` | Public interface |
| Information Panel | `text=Information` | `await page.locator('text=Information').click()` | Info display |

## 🎯 Playwright Automation Sequences

### Complete Demo Sequence
```typescript
// 1. Navigation Sequence
await page.click('text=Commander Dashboard');
await page.waitForTimeout(2000);

// 2. Map Activation
await page.click('text=Live Map');
await page.waitForSelector('.mapboxgl-map', { timeout: 10000 });

// 3. Hazard Layer Activation
const liveDataToggle = page.locator('text=Live Data').first();
if (await liveDataToggle.isVisible()) {
  await liveDataToggle.click();
  await page.waitForTimeout(1000);
}

// 4. Route Planning
const routeControls = page.locator('text=Routes').or(page.locator('text=Evacuation'));
if (await routeControls.first().isVisible()) {
  await routeControls.first().click();
  await page.waitForTimeout(2000);
}

// 5. 3D Terrain Activation
const terrainToggle = page.locator('text=3D Terrain').first();
if (await terrainToggle.isVisible()) {
  await terrainToggle.click();
  await page.waitForTimeout(3000);
}

// 6. AI Commander Access
const aipButton = page.locator('header button:has-text("🤖 AIP Commander")');
if (await aipButton.isVisible()) {
  await aipButton.click();
  await page.waitForTimeout(2000);
}

// 7. Weather Integration
const weatherPanel = page.locator('text=Weather Operations');
if (await weatherPanel.isVisible()) {
  await weatherPanel.click();
  await page.waitForTimeout(2000);
}
```

### Validation Checks
```typescript
// Page Load Validation
await page.waitForSelector('#root', { timeout: 10000 });
await page.locator('h1:has-text("Command Center")').first().isVisible();

// Map Validation
await page.locator('.mapboxgl-map').isVisible();

// AI Panel Validation
await page.locator('text=AIP-Powered Decision Support').isVisible();

// Content Validation
const contentVisible = await page.locator('#root').isVisible();
```

## 📋 Element Categories Summary

### Primary Navigation (4 elements)
- Commander Dashboard
- Live Map
- Command Center Logo
- Navigation Container

### Map Interface (12 elements)
- Map Container
- 3D Terrain Toggle
- Live Data Toggle
- Hazards Toggle
- Routes Toggle
- Units Toggle
- Buildings Toggle
- Overview Mode
- Detailed Mode
- Predictive Mode
- Layer Controls
- Map Validation

### Emergency Response (8 elements)
- Clear Button
- Hazard Button
- Victims Button
- Caution Icon
- Victims Icon
- Issue Alert
- View Analytics
- View on Map

### AI Decision Support (8 elements)
- AIP Commander
- AIP Button
- Example Queries
- Highway 30 Query
- Pine Valley Query
- Oak Ridge Query
- AI Decision Support
- Show Alternatives

### Evacuation Management (8 elements)
- Evacuation Dashboard
- Zone Selection
- Building Overview
- Weather Operations
- Evacuated Status
- In Progress Status
- Refused Status
- Uncontacted Status

### Route Planning (9 elements)
- All Profiles
- Civilian Profile
- EMS Profile
- Fire Tactical
- Police Profile
- Route Selection
- Unit Assignment
- Staging Areas
- Deconfliction

### Weather Integration (4 elements)
- Weather Panel
- Weather Alerts
- Expand Weather
- Close Weather

### Search and Marking (8 elements)
- Search Markings
- Create Marking
- Marking Details
- FEMA X-Code
- No Damage
- Light Damage
- Moderate Damage
- Heavy Damage

### Dashboard Elements (8 elements)
- Overview Mode
- Detailed Mode
- Projections Mode
- Assets View
- Location Selection
- Detail Expansion
- Data Visualization
- Quick Actions

### Control Panel (6 elements)
- Control Panel Toggle
- Refresh Button
- Settings Icon
- Info Icon
- Layers Icon
- Panel Validation

### Responder Interface (4 elements)
- Responder View
- First Responder
- Public Information
- Information Panel

## 🎯 Total Elements: 79 UI Elements

This comprehensive mapping covers all major UI elements in the disaster response dashboard, providing both the visual identifiers and the corresponding Playwright automation commands for each element.
