// Auto-generated component map
// Generated at: 2025-09-04T06:09:10.527Z

export const DYNAMIC_COMPONENT_MAP = [
  {
    "componentName": "WeatherPanel",
    "filePath": "src/components/WeatherPanel.tsx",
    "props": [
      {
        "name": "weatherData",
        "type": "WeatherData",
        "required": true,
        "possibleValues": []
      },
      {
        "name": "onWeatherAlert",
        "type": "(alert: WeatherAlert) => void",
        "required": false,
        "possibleValues": [
          null,
          null,
          null,
          "not-a-function"
        ]
      },
      {
        "name": "className",
        "type": "string",
        "required": false,
        "possibleValues": [
          "",
          "test",
          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          null,
          null
        ]
      }
    ],
    "interactions": [
      {
        "type": "click",
        "selector": "button, [role=\"button\"], .clickable",
        "testId": "click-target"
      }
    ],
    "errorBoundary": false,
    "async": true,
    "lastModified": "2025-08-31T01:26:16.791Z"
  },
  {
    "componentName": "UnitManagement",
    "filePath": "src/components/UnitManagement.tsx",
    "props": [
      {
        "name": "units",
        "type": "EmergencyUnit[]",
        "required": true,
        "possibleValues": [
          [],
          [
            1,
            2,
            3
          ],
          null,
          null,
          "not-an-array"
        ]
      },
      {
        "name": "zones",
        "type": "EvacuationZone[]",
        "required": true,
        "possibleValues": [
          [],
          [
            1,
            2,
            3
          ],
          null,
          null,
          "not-an-array"
        ]
      },
      {
        "name": "routes",
        "type": "OperationalRoute[]",
        "required": true,
        "possibleValues": [
          [],
          [
            1,
            2,
            3
          ],
          null,
          null,
          "not-an-array"
        ]
      },
      {
        "name": "onUnitAssign",
        "type": "(unitId: string",
        "required": false,
        "possibleValues": [
          "",
          "test",
          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          null,
          null
        ]
      },
      {
        "name": "targetId",
        "type": "string",
        "required": true,
        "possibleValues": [
          "",
          "test",
          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          null,
          null
        ]
      },
      {
        "name": "targetType",
        "type": "'zone' | 'route') => void",
        "required": true,
        "possibleValues": [
          null,
          null,
          null,
          "not-a-function",
          null
        ]
      },
      {
        "name": "onUnitStatusUpdate",
        "type": "(unitId: string",
        "required": false,
        "possibleValues": [
          "",
          "test",
          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          null,
          null
        ]
      },
      {
        "name": "status",
        "type": "EmergencyUnit['status']) => void",
        "required": true,
        "possibleValues": [
          null,
          null,
          null,
          "not-a-function"
        ]
      },
      {
        "name": "className",
        "type": "string",
        "required": false,
        "possibleValues": [
          "",
          "test",
          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          null,
          null
        ]
      }
    ],
    "interactions": [
      {
        "type": "click",
        "selector": "button, [role=\"button\"], .clickable",
        "testId": "click-target"
      },
      {
        "type": "input",
        "selector": "input, textarea, select",
        "testId": "input-field"
      }
    ],
    "errorBoundary": false,
    "async": true,
    "lastModified": "2025-08-31T01:26:16.809Z"
  },
  {
    "componentName": "TechnicalArchitecture",
    "filePath": "src/components/TechnicalArchitecture.tsx",
    "props": [
      {
        "name": "className",
        "type": "string",
        "required": false,
        "possibleValues": [
          "",
          "test",
          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          null,
          null
        ]
      }
    ],
    "interactions": [
      {
        "type": "click",
        "selector": "button, [role=\"button\"], .clickable",
        "testId": "click-target"
      }
    ],
    "errorBoundary": false,
    "async": true,
    "lastModified": "2025-08-31T01:26:16.791Z"
  },
  {
    "componentName": "SimpleMap",
    "filePath": "src/components/SimpleMap.tsx",
    "props": [
      {
        "name": "showHazards",
        "type": "boolean",
        "required": false,
        "possibleValues": [
          true,
          false,
          null,
          null
        ]
      },
      {
        "name": "showUnits",
        "type": "boolean",
        "required": false,
        "possibleValues": [
          true,
          false,
          null,
          null
        ]
      },
      {
        "name": "showRoutes",
        "type": "boolean",
        "required": false,
        "possibleValues": [
          true,
          false,
          null,
          null
        ]
      }
    ],
    "interactions": [],
    "errorBoundary": false,
    "async": false,
    "lastModified": "2025-09-02T03:50:42.615Z"
  },
  {
    "componentName": "SearchMarkings",
    "filePath": "src/components/SearchMarkings.tsx",
    "props": [
      {
        "name": "searchMarkings",
        "type": "SearchMarking[]",
        "required": true,
        "possibleValues": [
          [],
          [
            1,
            2,
            3
          ],
          null,
          null,
          "not-an-array"
        ]
      },
      {
        "name": "onMarkingCreate",
        "type": "(marking: SearchMarking) => void",
        "required": false,
        "possibleValues": [
          null,
          null,
          null,
          "not-a-function"
        ]
      },
      {
        "name": "onMarkingUpdate",
        "type": "(markingId: string",
        "required": false,
        "possibleValues": [
          "",
          "test",
          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          null,
          null
        ]
      },
      {
        "name": "updates",
        "type": "Partial<SearchMarking>) => void",
        "required": true,
        "possibleValues": [
          null,
          null,
          null,
          "not-a-function"
        ]
      },
      {
        "name": "onMarkingDelete",
        "type": "(markingId: string) => void",
        "required": false,
        "possibleValues": [
          "",
          "test",
          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          null,
          null,
          null,
          "not-a-function"
        ]
      },
      {
        "name": "className",
        "type": "string",
        "required": false,
        "possibleValues": [
          "",
          "test",
          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          null,
          null
        ]
      }
    ],
    "interactions": [
      {
        "type": "click",
        "selector": "button, [role=\"button\"], .clickable",
        "testId": "click-target"
      },
      {
        "type": "input",
        "selector": "input, textarea, select",
        "testId": "input-field"
      }
    ],
    "errorBoundary": false,
    "async": true,
    "lastModified": "2025-08-31T01:26:16.791Z"
  },
  {
    "componentName": "RoleBasedRouting",
    "filePath": "src/components/RoleBasedRouting.tsx",
    "props": [
      {
        "name": "routes",
        "type": "OperationalRoute[]",
        "required": true,
        "possibleValues": [
          [],
          [
            1,
            2,
            3
          ],
          null,
          null,
          "not-an-array"
        ]
      },
      {
        "name": "units",
        "type": "EmergencyUnit[]",
        "required": true,
        "possibleValues": [
          [],
          [
            1,
            2,
            3
          ],
          null,
          null,
          "not-an-array"
        ]
      },
      {
        "name": "stagingAreas",
        "type": "StagingArea[]",
        "required": true,
        "possibleValues": [
          [],
          [
            1,
            2,
            3
          ],
          null,
          null,
          "not-an-array"
        ]
      },
      {
        "name": "onRouteSelect",
        "type": "(route: OperationalRoute) => void",
        "required": false,
        "possibleValues": [
          null,
          null,
          null,
          "not-a-function"
        ]
      },
      {
        "name": "onRouteUpdate",
        "type": "(routeId: string",
        "required": false,
        "possibleValues": [
          "",
          "test",
          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          null,
          null
        ]
      },
      {
        "name": "updates",
        "type": "Partial<OperationalRoute>) => void",
        "required": true,
        "possibleValues": [
          null,
          null,
          null,
          "not-a-function"
        ]
      },
      {
        "name": "className",
        "type": "string",
        "required": false,
        "possibleValues": [
          "",
          "test",
          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          null,
          null
        ]
      }
    ],
    "interactions": [
      {
        "type": "click",
        "selector": "button, [role=\"button\"], .clickable",
        "testId": "click-target"
      },
      {
        "type": "input",
        "selector": "input, textarea, select",
        "testId": "input-field"
      }
    ],
    "errorBoundary": false,
    "async": true,
    "lastModified": "2025-08-31T01:02:37.917Z"
  },
  {
    "componentName": "MultiHazardMap",
    "filePath": "src/components/MultiHazardMap.tsx",
    "props": [
      {
        "name": "hazards",
        "type": "HazardLayer[]",
        "required": true,
        "possibleValues": [
          [],
          [
            1,
            2,
            3
          ],
          null,
          null,
          "not-an-array"
        ]
      },
      {
        "name": "onHazardSelect",
        "type": "(hazard: HazardLayer) => void",
        "required": false,
        "possibleValues": [
          null,
          null,
          null,
          "not-a-function"
        ]
      },
      {
        "name": "onHazardUpdate",
        "type": "(hazardId: string",
        "required": false,
        "possibleValues": [
          "",
          "test",
          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          null,
          null
        ]
      },
      {
        "name": "updates",
        "type": "Partial<HazardLayer>) => void",
        "required": true,
        "possibleValues": [
          null,
          null,
          null,
          "not-a-function"
        ]
      },
      {
        "name": "className",
        "type": "string",
        "required": false,
        "possibleValues": [
          "",
          "test",
          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          null,
          null
        ]
      }
    ],
    "interactions": [
      {
        "type": "click",
        "selector": "button, [role=\"button\"], .clickable",
        "testId": "click-target"
      },
      {
        "type": "input",
        "selector": "input, textarea, select",
        "testId": "input-field"
      }
    ],
    "errorBoundary": false,
    "async": true,
    "lastModified": "2025-08-31T01:02:37.882Z"
  },
  {
    "componentName": "LayerTogglePanel",
    "filePath": "src/components/ui/LayerTogglePanel.tsx",
    "props": [
      {
        "name": "title",
        "type": "string",
        "required": false,
        "possibleValues": [
          "",
          "test",
          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          null,
          null
        ]
      },
      {
        "name": "className",
        "type": "string",
        "required": false,
        "possibleValues": [
          "",
          "test",
          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          null,
          null
        ]
      }
    ],
    "interactions": [
      {
        "type": "click",
        "selector": "button, [role=\"button\"], .clickable",
        "testId": "click-target"
      },
      {
        "type": "input",
        "selector": "input, textarea, select",
        "testId": "input-field"
      },
      {
        "type": "keyboard",
        "selector": "input, button, [tabindex]",
        "keyboardKeys": [
          "Tab",
          "Enter",
          "Space",
          "Escape"
        ]
      },
      {
        "type": "click",
        "selector": "[data-testid=\"layer-toggle-panel\"]",
        "testId": "layer-toggle-panel"
      },
      {
        "type": "click",
        "selector": "[data-testid=\"layer-toggle\"]",
        "testId": "layer-toggle"
      }
    ],
    "errorBoundary": false,
    "async": false,
    "lastModified": "2025-09-02T02:50:06.592Z"
  },
  {
    "componentName": "EvacuationDashboard",
    "filePath": "src/components/EvacuationDashboard.tsx",
    "props": [
      {
        "name": "zones",
        "type": "EvacuationZone[]",
        "required": true,
        "possibleValues": [
          [],
          [
            1,
            2,
            3
          ],
          null,
          null,
          "not-an-array"
        ]
      },
      {
        "name": "buildings",
        "type": "Building[]",
        "required": true,
        "possibleValues": [
          [],
          [
            1,
            2,
            3
          ],
          null,
          null,
          "not-an-array"
        ]
      },
      {
        "name": "weatherData",
        "type": "WeatherData",
        "required": false,
        "possibleValues": []
      },
      {
        "name": "className",
        "type": "string",
        "required": false,
        "possibleValues": [
          "",
          "test",
          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          null,
          null
        ]
      }
    ],
    "interactions": [
      {
        "type": "click",
        "selector": "button, [role=\"button\"], .clickable",
        "testId": "click-target"
      }
    ],
    "errorBoundary": false,
    "async": true,
    "lastModified": "2025-08-31T05:50:17.489Z"
  },
  {
    "componentName": "ErrorBoundary",
    "filePath": "src/components/ErrorBoundary.tsx",
    "props": [],
    "interactions": [
      {
        "type": "click",
        "selector": "button, [role=\"button\"], .clickable",
        "testId": "click-target"
      },
      {
        "type": "click",
        "selector": "[data-testid=\"error-boundary\"]",
        "testId": "error-boundary"
      }
    ],
    "errorBoundary": true,
    "async": false,
    "lastModified": "2025-09-02T02:50:06.463Z"
  },
  {
    "componentName": "EfficiencyMetrics",
    "filePath": "src/components/EfficiencyMetrics.tsx",
    "props": [
      {
        "name": "metrics",
        "type": "EfficiencyMetricsType",
        "required": true,
        "possibleValues": []
      },
      {
        "name": "onMetricsUpdate",
        "type": "(metrics: EfficiencyMetricsType) => void",
        "required": false,
        "possibleValues": [
          null,
          null,
          null,
          "not-a-function"
        ]
      },
      {
        "name": "className",
        "type": "string",
        "required": false,
        "possibleValues": [
          "",
          "test",
          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          null,
          null
        ]
      }
    ],
    "interactions": [
      {
        "type": "click",
        "selector": "button, [role=\"button\"], .clickable",
        "testId": "click-target"
      }
    ],
    "errorBoundary": false,
    "async": true,
    "lastModified": "2025-08-31T01:02:37.882Z"
  },
  {
    "componentName": "DrillDownCapability",
    "filePath": "src/components/DrillDownCapability.tsx",
    "props": [
      {
        "name": "detailLevels",
        "type": "DetailLevels",
        "required": true,
        "possibleValues": []
      },
      {
        "name": "currentZoom",
        "type": "number",
        "required": true,
        "possibleValues": [
          0,
          1,
          -1,
          100,
          0.5,
          null,
          null,
          null,
          null
        ]
      },
      {
        "name": "currentLocation",
        "type": "string",
        "required": true,
        "possibleValues": [
          "",
          "test",
          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          null,
          null
        ]
      },
      {
        "name": "onZoomChange",
        "type": "(zoom: number) => void",
        "required": false,
        "possibleValues": [
          0,
          1,
          -1,
          100,
          0.5,
          null,
          null,
          null,
          null,
          null
        ]
      },
      {
        "name": "onLocationSelect",
        "type": "(location: string) => void",
        "required": false,
        "possibleValues": [
          "",
          "test",
          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          null,
          null,
          null,
          "not-a-function"
        ]
      },
      {
        "name": "className",
        "type": "string",
        "required": false,
        "possibleValues": [
          "",
          "test",
          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          null,
          null
        ]
      }
    ],
    "interactions": [
      {
        "type": "click",
        "selector": "button, [role=\"button\"], .clickable",
        "testId": "click-target"
      }
    ],
    "errorBoundary": false,
    "async": true,
    "lastModified": "2025-08-31T01:02:37.882Z"
  },
  {
    "componentName": "ChallengeDemo",
    "filePath": "src/components/ChallengeDemo.tsx",
    "props": [],
    "interactions": [],
    "errorBoundary": false,
    "async": false,
    "lastModified": "2025-08-12T04:17:37.165Z"
  },
  {
    "componentName": "BuildingEvacuationTracker",
    "filePath": "src/components/BuildingEvacuationTracker.tsx",
    "props": [
      {
        "name": "zones",
        "type": "EvacuationZone[]",
        "required": true,
        "possibleValues": [
          [],
          [
            1,
            2,
            3
          ],
          null,
          null,
          "not-an-array"
        ]
      },
      {
        "name": "buildings",
        "type": "Building[]",
        "required": true,
        "possibleValues": [
          [],
          [
            1,
            2,
            3
          ],
          null,
          null,
          "not-an-array"
        ]
      },
      {
        "name": "onZoneUpdate",
        "type": "(zoneId: string",
        "required": false,
        "possibleValues": [
          "",
          "test",
          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          null,
          null
        ]
      },
      {
        "name": "updates",
        "type": "Partial<EvacuationZone>) => void",
        "required": true,
        "possibleValues": [
          null,
          null,
          null,
          "not-a-function"
        ]
      },
      {
        "name": "onBuildingUpdate",
        "type": "(buildingId: string",
        "required": false,
        "possibleValues": [
          "",
          "test",
          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          null,
          null
        ]
      },
      {
        "name": "updates",
        "type": "Partial<Building>) => void",
        "required": true,
        "possibleValues": [
          null,
          null,
          null,
          "not-a-function"
        ]
      },
      {
        "name": "className",
        "type": "string",
        "required": false,
        "possibleValues": [
          "",
          "test",
          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          null,
          null
        ]
      }
    ],
    "interactions": [
      {
        "type": "click",
        "selector": "button, [role=\"button\"], .clickable",
        "testId": "click-target"
      }
    ],
    "errorBoundary": false,
    "async": true,
    "lastModified": "2025-08-31T01:02:37.882Z"
  },
  {
    "componentName": "AIPDecisionSupport",
    "filePath": "src/components/AIPDecisionSupport.tsx",
    "props": [
      {
        "name": "onDecisionMade",
        "type": "(guidance: OperationalGuidance) => void",
        "required": false,
        "possibleValues": [
          null,
          null,
          null,
          "not-a-function"
        ]
      },
      {
        "name": "className",
        "type": "string",
        "required": false,
        "possibleValues": [
          "",
          "test",
          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          null,
          null
        ]
      }
    ],
    "interactions": [
      {
        "type": "click",
        "selector": "button, [role=\"button\"], .clickable",
        "testId": "click-target"
      },
      {
        "type": "input",
        "selector": "input, textarea, select",
        "testId": "input-field"
      },
      {
        "type": "focus",
        "selector": "input, button, [tabindex]",
        "testId": "focus-target"
      },
      {
        "type": "hover",
        "selector": ".hoverable, button, a",
        "testId": "hover-target"
      }
    ],
    "errorBoundary": false,
    "async": true,
    "lastModified": "2025-08-31T01:02:37.921Z"
  },
  {
    "componentName": "WaypointTooltip",
    "filePath": "src/components/tacmap/WaypointTooltip.tsx",
    "props": [
      {
        "name": "tooltip",
        "type": "TooltipData | null",
        "required": true,
        "possibleValues": []
      },
      {
        "name": "onClose",
        "type": "() => void",
        "required": true,
        "possibleValues": [
          null,
          null,
          null,
          "not-a-function"
        ]
      },
      {
        "name": "isHover",
        "type": "boolean",
        "required": false,
        "possibleValues": [
          true,
          false,
          null,
          null
        ]
      }
    ],
    "interactions": [
      {
        "type": "click",
        "selector": "button, [role=\"button\"], .clickable",
        "testId": "click-target"
      }
    ],
    "errorBoundary": false,
    "async": false,
    "lastModified": "2025-08-31T01:26:16.791Z"
  },
  {
    "componentName": "SimpleMapboxTest",
    "filePath": "src/components/tacmap/SimpleMapboxTest.tsx",
    "props": [
      {
        "name": "scenario",
        "type": "Scenario",
        "required": false,
        "possibleValues": []
      },
      {
        "name": "center",
        "type": "[number",
        "required": false,
        "possibleValues": [
          0,
          1,
          -1,
          100,
          0.5,
          null,
          null,
          null,
          null
        ]
      },
      {
        "name": "zoom",
        "type": "number",
        "required": false,
        "possibleValues": [
          0,
          1,
          -1,
          100,
          0.5,
          null,
          null,
          null,
          null
        ]
      },
      {
        "name": "pitch",
        "type": "number",
        "required": false,
        "possibleValues": [
          0,
          1,
          -1,
          100,
          0.5,
          null,
          null,
          null,
          null
        ]
      },
      {
        "name": "bearing",
        "type": "number",
        "required": false,
        "possibleValues": [
          0,
          1,
          -1,
          100,
          0.5,
          null,
          null,
          null,
          null
        ]
      },
      {
        "name": "showTerrain",
        "type": "boolean",
        "required": false,
        "possibleValues": [
          true,
          false,
          null,
          null
        ]
      },
      {
        "name": "showBuildings",
        "type": "boolean",
        "required": false,
        "possibleValues": [
          true,
          false,
          null,
          null
        ]
      },
      {
        "name": "showRoutes",
        "type": "boolean",
        "required": false,
        "possibleValues": [
          true,
          false,
          null,
          null
        ]
      },
      {
        "name": "showWaypoints",
        "type": "boolean",
        "required": false,
        "possibleValues": [
          true,
          false,
          null,
          null
        ]
      }
    ],
    "interactions": [
      {
        "type": "click",
        "selector": "button, [role=\"button\"], .clickable",
        "testId": "click-target"
      },
      {
        "type": "input",
        "selector": "input, textarea, select",
        "testId": "input-field"
      }
    ],
    "errorBoundary": false,
    "async": true,
    "lastModified": "2025-08-31T01:26:16.791Z"
  },
  {
    "componentName": "MapProvider",
    "filePath": "src/components/tacmap/MapProvider.tsx",
    "props": [],
    "interactions": [],
    "errorBoundary": false,
    "async": false,
    "lastModified": "2025-09-02T04:13:50.920Z"
  },
  {
    "componentName": "RealTimeDashboard",
    "filePath": "src/components/realtime/RealTimeDashboard.tsx",
    "props": [
      {
        "name": "className",
        "type": "string",
        "required": false,
        "possibleValues": [
          "",
          "test",
          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          null,
          null
        ]
      },
      {
        "name": "showSystemStatus",
        "type": "boolean",
        "required": false,
        "possibleValues": [
          true,
          false,
          null,
          null
        ]
      },
      {
        "name": "showDataFeeds",
        "type": "boolean",
        "required": false,
        "possibleValues": [
          true,
          false,
          null,
          null
        ]
      },
      {
        "name": "showLiveUpdates",
        "type": "boolean",
        "required": false,
        "possibleValues": [
          true,
          false,
          null,
          null
        ]
      },
      {
        "name": "maxUpdates",
        "type": "number",
        "required": false,
        "possibleValues": [
          0,
          1,
          -1,
          100,
          0.5,
          null,
          null,
          null,
          null
        ]
      }
    ],
    "interactions": [
      {
        "type": "click",
        "selector": "button, [role=\"button\"], .clickable",
        "testId": "click-target"
      },
      {
        "type": "input",
        "selector": "input, textarea, select",
        "testId": "input-field"
      }
    ],
    "errorBoundary": false,
    "async": true,
    "lastModified": "2025-08-31T01:26:16.791Z"
  },
  {
    "componentName": "iconMap",
    "filePath": "src/components/icons/IconMap.tsx",
    "props": [],
    "interactions": [],
    "errorBoundary": false,
    "async": false,
    "lastModified": "2025-09-01T04:26:16.263Z"
  },
  {
    "componentName": "MapContainer",
    "filePath": "src/components/maps/MapContainer.tsx",
    "props": [
      {
        "name": "className",
        "type": "string",
        "required": false,
        "possibleValues": [
          "",
          "test",
          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          null,
          null
        ]
      },
      {
        "name": "center",
        "type": "[number",
        "required": false,
        "possibleValues": [
          0,
          1,
          -1,
          100,
          0.5,
          null,
          null,
          null,
          null
        ]
      },
      {
        "name": "zoom",
        "type": "number",
        "required": false,
        "possibleValues": [
          0,
          1,
          -1,
          100,
          0.5,
          null,
          null,
          null,
          null
        ]
      },
      {
        "name": "style",
        "type": "string",
        "required": false,
        "possibleValues": [
          "",
          "test",
          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          null,
          null
        ]
      },
      {
        "name": "hazards",
        "type": "HazardZone[]",
        "required": false,
        "possibleValues": [
          [],
          [
            1,
            2,
            3
          ],
          null,
          null,
          "not-an-array"
        ]
      },
      {
        "name": "units",
        "type": "EmergencyUnit[]",
        "required": false,
        "possibleValues": [
          [],
          [
            1,
            2,
            3
          ],
          null,
          null,
          "not-an-array"
        ]
      },
      {
        "name": "routes",
        "type": "EvacuationRoute[]",
        "required": false,
        "possibleValues": [
          [],
          [
            1,
            2,
            3
          ],
          null,
          null,
          "not-an-array"
        ]
      },
      {
        "name": "onHazardClick",
        "type": "(hazard: HazardZone) => void",
        "required": false,
        "possibleValues": [
          null,
          null,
          null,
          "not-a-function"
        ]
      },
      {
        "name": "onUnitClick",
        "type": "(unit: EmergencyUnit) => void",
        "required": false,
        "possibleValues": [
          null,
          null,
          null,
          "not-a-function"
        ]
      },
      {
        "name": "onRouteClick",
        "type": "(route: EvacuationRoute) => void",
        "required": false,
        "possibleValues": [
          null,
          null,
          null,
          "not-a-function"
        ]
      }
    ],
    "interactions": [],
    "errorBoundary": false,
    "async": true,
    "lastModified": "2025-09-04T05:16:10.862Z"
  },
  {
    "componentName": "DataFusionDebugger",
    "filePath": "src/components/debug/DataFusionDebugger.tsx",
    "props": [],
    "interactions": [
      {
        "type": "click",
        "selector": "button, [role=\"button\"], .clickable",
        "testId": "click-target"
      }
    ],
    "errorBoundary": false,
    "async": true,
    "lastModified": "2025-08-31T18:46:28.400Z"
  },
  {
    "componentName": "TerrainLayer",
    "filePath": "src/components/maps/layers/TerrainLayer.tsx",
    "props": [
      {
        "name": "map",
        "type": "mapboxgl.Map | null",
        "required": true,
        "possibleValues": []
      },
      {
        "name": "enabled",
        "type": "boolean",
        "required": true,
        "possibleValues": [
          true,
          false,
          null,
          null
        ]
      },
      {
        "name": "exaggeration",
        "type": "number",
        "required": false,
        "possibleValues": [
          0,
          1,
          -1,
          100,
          0.5,
          null,
          null,
          null,
          null
        ]
      },
      {
        "name": "onLayerReady",
        "type": "() => void",
        "required": false,
        "possibleValues": [
          null,
          null,
          null,
          "not-a-function"
        ]
      },
      {
        "name": "onLayerError",
        "type": "(error: string) => void",
        "required": false,
        "possibleValues": [
          "",
          "test",
          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          null,
          null,
          null,
          "not-a-function"
        ]
      },
      {
        "name": "addSky",
        "type": "boolean",
        "required": false,
        "possibleValues": [
          true,
          false,
          null,
          null
        ]
      }
    ],
    "interactions": [],
    "errorBoundary": false,
    "async": true,
    "lastModified": "2025-09-04T05:16:10.862Z"
  },
  {
    "componentName": "LayerManager",
    "filePath": "src/components/maps/layers/LayerManager.tsx",
    "props": [
      {
        "name": "map",
        "type": "mapboxgl.Map | null",
        "required": true,
        "possibleValues": []
      },
      {
        "name": "layerToggles",
        "type": "{",
        "required": true,
        "possibleValues": []
      },
      {
        "name": "terrain",
        "type": "boolean",
        "required": true,
        "possibleValues": [
          true,
          false,
          null,
          null
        ]
      },
      {
        "name": "buildings",
        "type": "boolean",
        "required": true,
        "possibleValues": [
          true,
          false,
          null,
          null
        ]
      },
      {
        "name": "hazards",
        "type": "boolean",
        "required": true,
        "possibleValues": [
          true,
          false,
          null,
          null
        ]
      },
      {
        "name": "units",
        "type": "boolean",
        "required": true,
        "possibleValues": [
          true,
          false,
          null,
          null
        ]
      },
      {
        "name": "routes",
        "type": "boolean",
        "required": true,
        "possibleValues": [
          true,
          false,
          null,
          null
        ]
      }
    ],
    "interactions": [],
    "errorBoundary": false,
    "async": false,
    "lastModified": "2025-09-04T05:16:10.863Z"
  },
  {
    "componentName": "HazardsLayer",
    "filePath": "src/components/maps/layers/HazardsLayer.tsx",
    "props": [
      {
        "name": "map",
        "type": "mapboxgl.Map | null",
        "required": true,
        "possibleValues": []
      },
      {
        "name": "enabled",
        "type": "boolean",
        "required": true,
        "possibleValues": [
          true,
          false,
          null,
          null
        ]
      },
      {
        "name": "hazards",
        "type": "HazardZone[]",
        "required": true,
        "possibleValues": [
          [],
          [
            1,
            2,
            3
          ],
          null,
          null,
          "not-an-array"
        ]
      },
      {
        "name": "onLayerReady",
        "type": "() => void",
        "required": false,
        "possibleValues": [
          null,
          null,
          null,
          "not-a-function"
        ]
      },
      {
        "name": "onLayerError",
        "type": "(error: string) => void",
        "required": false,
        "possibleValues": [
          "",
          "test",
          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          null,
          null,
          null,
          "not-a-function"
        ]
      },
      {
        "name": "onHazardClick",
        "type": "(hazard: HazardZone) => void",
        "required": false,
        "possibleValues": [
          null,
          null,
          null,
          "not-a-function"
        ]
      }
    ],
    "interactions": [],
    "errorBoundary": false,
    "async": true,
    "lastModified": "2025-09-02T03:20:24.333Z"
  },
  {
    "componentName": "EvacuationRoutesLayer",
    "filePath": "src/components/maps/layers/EvacuationRoutesLayer.tsx",
    "props": [
      {
        "name": "map",
        "type": "mapboxgl.Map | null",
        "required": true,
        "possibleValues": []
      },
      {
        "name": "enabled",
        "type": "boolean",
        "required": true,
        "possibleValues": [
          true,
          false,
          null,
          null
        ]
      },
      {
        "name": "routes",
        "type": "EvacuationRoute[]",
        "required": true,
        "possibleValues": [
          [],
          [
            1,
            2,
            3
          ],
          null,
          null,
          "not-an-array"
        ]
      },
      {
        "name": "onLayerReady",
        "type": "() => void",
        "required": false,
        "possibleValues": [
          null,
          null,
          null,
          "not-a-function"
        ]
      },
      {
        "name": "onLayerError",
        "type": "(error: string) => void",
        "required": false,
        "possibleValues": [
          "",
          "test",
          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          null,
          null,
          null,
          "not-a-function"
        ]
      },
      {
        "name": "onRouteClick",
        "type": "(route: EvacuationRoute) => void",
        "required": false,
        "possibleValues": [
          null,
          null,
          null,
          "not-a-function"
        ]
      }
    ],
    "interactions": [],
    "errorBoundary": false,
    "async": true,
    "lastModified": "2025-09-01T04:32:59.000Z"
  },
  {
    "componentName": "EmergencyUnitsLayer",
    "filePath": "src/components/maps/layers/EmergencyUnitsLayer.tsx",
    "props": [
      {
        "name": "map",
        "type": "mapboxgl.Map | null",
        "required": true,
        "possibleValues": []
      },
      {
        "name": "enabled",
        "type": "boolean",
        "required": true,
        "possibleValues": [
          true,
          false,
          null,
          null
        ]
      },
      {
        "name": "units",
        "type": "EmergencyUnit[]",
        "required": true,
        "possibleValues": [
          [],
          [
            1,
            2,
            3
          ],
          null,
          null,
          "not-an-array"
        ]
      },
      {
        "name": "onLayerReady",
        "type": "() => void",
        "required": false,
        "possibleValues": [
          null,
          null,
          null,
          "not-a-function"
        ]
      },
      {
        "name": "onLayerError",
        "type": "(error: string) => void",
        "required": false,
        "possibleValues": [
          "",
          "test",
          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          null,
          null,
          null,
          "not-a-function"
        ]
      },
      {
        "name": "onUnitClick",
        "type": "(unit: EmergencyUnit) => void",
        "required": false,
        "possibleValues": [
          null,
          null,
          null,
          "not-a-function"
        ]
      }
    ],
    "interactions": [],
    "errorBoundary": false,
    "async": true,
    "lastModified": "2025-09-01T04:32:59.000Z"
  },
  {
    "componentName": "BuildingsLayer",
    "filePath": "src/components/maps/layers/BuildingsLayer.tsx",
    "props": [
      {
        "name": "map",
        "type": "mapboxgl.Map | null",
        "required": true,
        "possibleValues": []
      },
      {
        "name": "enabled",
        "type": "boolean",
        "required": true,
        "possibleValues": [
          true,
          false,
          null,
          null
        ]
      },
      {
        "name": "minZoom",
        "type": "number",
        "required": false,
        "possibleValues": [
          0,
          1,
          -1,
          100,
          0.5,
          null,
          null,
          null,
          null
        ]
      },
      {
        "name": "onLayerReady",
        "type": "() => void",
        "required": false,
        "possibleValues": [
          null,
          null,
          null,
          "not-a-function"
        ]
      },
      {
        "name": "onLayerError",
        "type": "(error: string) => void",
        "required": false,
        "possibleValues": [
          "",
          "test",
          "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          null,
          null,
          null,
          "not-a-function"
        ]
      }
    ],
    "interactions": [],
    "errorBoundary": false,
    "async": true,
    "lastModified": "2025-09-01T04:32:59.000Z"
  },
  {
    "componentName": "void",
    "filePath": "src/components/tacmap/MapEventManager.ts",
    "props": [],
    "interactions": [],
    "errorBoundary": false,
    "async": true,
    "lastModified": "2025-08-27T23:36:37.262Z"
  },
  {
    "componentName": "types",
    "filePath": "src/components/maps/layers/types.ts",
    "props": [],
    "interactions": [],
    "errorBoundary": false,
    "async": false,
    "lastModified": "2025-09-01T04:32:59.000Z"
  },
  {
    "componentName": "index",
    "filePath": "src/components/maps/layers/index.ts",
    "props": [],
    "interactions": [],
    "errorBoundary": false,
    "async": false,
    "lastModified": "2025-09-04T05:16:10.862Z"
  }
];

export const COMPONENT_COUNT = 31;
export const LAST_UPDATED = '2025-09-04T06:09:10.528Z';
