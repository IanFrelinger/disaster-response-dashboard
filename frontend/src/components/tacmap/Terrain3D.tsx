import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoiaWNmcmVsaW5nZXIiLCJhIjoiY20zcW92ZnEyMHNqeTJtcTJ5c2Fza3hoNSJ9.12y7S2B9pkn4PzRPjvaGxw';

interface Terrain3DProps {
  center?: [number, number];
  zoom?: number;
  elevation?: number;
  onTerrainLoad?: () => void;
  className?: string;
}

interface Building {
  id: string;
  coordinates: [number, number];
  height: number;
  width: number;
  length: number;
  type: 'residential' | 'commercial' | 'industrial' | 'government';
}

interface Vegetation {
  id: string;
  coordinates: [number, number];
  type: 'tree' | 'forest' | 'brush' | 'grass';
  density: number;
  height: number;
}

export const Terrain3D: React.FC<Terrain3DProps> = ({
  center = [-122.4194, 37.7749], // San Francisco
  zoom = 16, // Closer zoom to see 3D buildings
  elevation = 1.5,
  onTerrainLoad,
  className = "h-full w-full"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const threeContainerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [terrainMode, setTerrainMode] = useState<'2d' | '3d'>('2d');

  // Initialize 3D terrain
  const init3DTerrain = async () => {
    if (!threeContainerRef.current) return;

    // Create Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0A0E27);
    scene.fog = new THREE.Fog(0x0A0E27, 1000, 10000);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      threeContainerRef.current.clientWidth / threeContainerRef.current.clientHeight,
      0.1,
      10000
    );
    camera.position.set(0, 1000, 1000);
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(
      threeContainerRef.current.clientWidth,
      threeContainerRef.current.clientHeight
    );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    threeContainerRef.current.appendChild(renderer.domElement);

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 100;
    controls.maxDistance = 5000;
    controls.maxPolarAngle = Math.PI / 2;
    controlsRef.current = controls;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1000, 1000, 500);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Create terrain geometry
    await createTerrainGeometry(scene, center);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    setIsLoading(false);
    onTerrainLoad?.();
  };

  // Create terrain geometry with heightmap
  const createTerrainGeometry = async (scene: THREE.Scene, center: [number, number]) => {
    const terrainSize = 2000;
    const terrainResolution = 256;
    
    // Create heightmap data
    const heightmap = await generateHeightmap(center, terrainResolution);
    
    // Create geometry
    const geometry = new THREE.PlaneGeometry(
      terrainSize,
      terrainSize,
      terrainResolution - 1,
      terrainResolution - 1
    );

    // Apply heightmap to geometry
    const positions = geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      const x = Math.floor((i / 3) % terrainResolution);
      const z = Math.floor((i / 3) / terrainResolution);
      const height = heightmap[x + z * terrainResolution] * elevation;
      positions[i + 1] = height; // Y coordinate
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    // Create material with terrain textures
    const material = new THREE.MeshLambertMaterial({
      color: 0x3a5f3a,
      transparent: true,
      opacity: 0.9
    });

    // Create terrain mesh
    const terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;
    scene.add(terrain);

    // Add mountain peaks
    addMountainPeaks(scene, heightmap, terrainSize, terrainResolution, elevation);

    // Add buildings with proper heights
    addBuildings(scene, terrainSize, elevation);

    // Add vegetation
    addVegetation(scene, terrainSize, elevation);

    // Add water bodies
    addWaterBodies(scene, terrainSize);

    // Add atmospheric effects
    addAtmosphericEffects(scene);
  };

  // Generate heightmap data
  const generateHeightmap = async (_center: [number, number], resolution: number): Promise<number[]> => {
    const heightmap = new Array(resolution * resolution);
    
    // Generate realistic terrain using multiple noise functions
    for (let x = 0; x < resolution; x++) {
      for (let z = 0; z < resolution; z++) {
        const nx = x / resolution;
        const nz = z / resolution;
        
        // Multiple layers of noise for realistic terrain
        const elevation = 
          // Base terrain
          (Math.sin(nx * 10) * Math.cos(nz * 10) * 0.3) +
          // Mountain ranges
          (Math.sin(nx * 20 + nz * 15) * 0.4) +
          // Hills
          (Math.sin(nx * 40) * Math.sin(nz * 30) * 0.2) +
          // Fine detail
          (Math.sin(nx * 80) * Math.cos(nz * 60) * 0.1);
        
        // Add some peaks
        const distanceFromCenter = Math.sqrt((nx - 0.5) ** 2 + (nz - 0.5) ** 2);
        const peakFactor = Math.max(0, 1 - distanceFromCenter * 2);
        const peak = Math.sin(peakFactor * Math.PI) * 0.5;
        
        heightmap[x + z * resolution] = Math.max(0, elevation + peak);
      }
    }
    
    return heightmap;
  };

  // Add buildings with proper heights
  const addBuildings = (scene: THREE.Scene, terrainSize: number, elevation: number) => {
    const buildings: Building[] = generateBuildingData();
    
    buildings.forEach(building => {
      // Convert coordinates to scene space
      const sceneX = (building.coordinates[0] - center[0]) * terrainSize * 0.5;
      const sceneZ = (building.coordinates[1] - center[1]) * terrainSize * 0.5;
      
      // Create building geometry
      const buildingGeometry = new THREE.BoxGeometry(
        building.width,
        building.height * elevation,
        building.length
      );
      
      // Create building material based on type
      const buildingMaterial = new THREE.MeshLambertMaterial({
        color: getBuildingColor(building.type),
        transparent: true,
        opacity: 0.8
      });
      
      const buildingMesh = new THREE.Mesh(buildingGeometry, buildingMaterial);
      buildingMesh.position.set(
        sceneX,
        (building.height * elevation) / 2, // Position on ground
        sceneZ
      );
      buildingMesh.castShadow = true;
      buildingMesh.receiveShadow = true;
      
      // Add building to scene
      scene.add(buildingMesh);
      
      // Add building label (optional)
      addBuildingLabel(scene, building, sceneX, building.height * elevation, sceneZ);
    });
  };

  // Generate building data
  const generateBuildingData = (): Building[] => {
    return [
      // Downtown buildings (tall)
      {
        id: 'building-1',
        coordinates: [-122.4194, 37.7749],
        height: 200,
        width: 40,
        length: 40,
        type: 'commercial'
      },
      {
        id: 'building-2',
        coordinates: [-122.4180, 37.7755],
        height: 150,
        width: 35,
        length: 35,
        type: 'commercial'
      },
      {
        id: 'building-3',
        coordinates: [-122.4208, 37.7743],
        height: 180,
        width: 30,
        length: 45,
        type: 'commercial'
      },
      // Residential buildings (medium)
      {
        id: 'building-4',
        coordinates: [-122.4170, 37.7760],
        height: 80,
        width: 25,
        length: 25,
        type: 'residential'
      },
      {
        id: 'building-5',
        coordinates: [-122.4218, 37.7737],
        height: 60,
        width: 20,
        length: 20,
        type: 'residential'
      },
      // Government buildings
      {
        id: 'building-6',
        coordinates: [-122.4160, 37.7765],
        height: 120,
        width: 50,
        length: 30,
        type: 'government'
      },
      // Industrial buildings
      {
        id: 'building-7',
        coordinates: [-122.4228, 37.7731],
        height: 40,
        width: 60,
        length: 40,
        type: 'industrial'
      }
    ];
  };

  // Get building color based on type
  const getBuildingColor = (type: Building['type']): number => {
    switch (type) {
      case 'commercial':
        return 0x4A90E2; // Blue
      case 'residential':
        return 0xE8A87C; // Tan
      case 'industrial':
        return 0x8B4513; // Brown
      case 'government':
        return 0xDC143C; // Red
      default:
        return 0x808080; // Gray
    }
  };

  // Add building labels
  const addBuildingLabel = (scene: THREE.Scene, building: Building, x: number, y: number, z: number) => {
    // Create a simple text label using a plane with texture
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;
    
    canvas.width = 256;
    canvas.height = 64;
    
    context.fillStyle = 'rgba(0, 0, 0, 0.8)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'white';
    context.font = '16px Arial';
    context.textAlign = 'center';
    context.fillText(building.type, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    const labelGeometry = new THREE.PlaneGeometry(20, 5);
    const labelMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide
    });
    
    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.position.set(x, y + 10, z);
    label.lookAt(cameraRef.current!.position);
    scene.add(label);
  };

  // Add vegetation
  const addVegetation = (scene: THREE.Scene, terrainSize: number, elevation: number) => {
    const vegetation: Vegetation[] = generateVegetationData();
    
    vegetation.forEach(veg => {
      // Convert coordinates to scene space
      const sceneX = (veg.coordinates[0] - center[0]) * terrainSize * 0.5;
      const sceneZ = (veg.coordinates[1] - center[1]) * terrainSize * 0.5;
      
      switch (veg.type) {
        case 'tree':
          addTree(scene, sceneX, sceneZ, veg.height * elevation, veg.density);
          break;
        case 'forest':
          addForest(scene, sceneX, sceneZ, veg.height * elevation, veg.density);
          break;
        case 'brush':
          addBrush(scene, sceneX, sceneZ, veg.height * elevation, veg.density);
          break;
        case 'grass':
          addGrass(scene, sceneX, sceneZ, veg.height * elevation, veg.density);
          break;
      }
    });
  };

  // Generate vegetation data
  const generateVegetationData = (): Vegetation[] => {
    return [
      // Trees
      {
        id: 'tree-1',
        coordinates: [-122.4185, 37.7752],
        type: 'tree',
        density: 0.8,
        height: 15
      },
      {
        id: 'tree-2',
        coordinates: [-122.4202, 37.7746],
        type: 'tree',
        density: 0.7,
        height: 12
      },
      // Forests
      {
        id: 'forest-1',
        coordinates: [-122.4165, 37.7768],
        type: 'forest',
        density: 0.9,
        height: 20
      },
      // Brush
      {
        id: 'brush-1',
        coordinates: [-122.4215, 37.7740],
        type: 'brush',
        density: 0.6,
        height: 3
      },
      // Grass
      {
        id: 'grass-1',
        coordinates: [-122.4175, 37.7758],
        type: 'grass',
        density: 0.5,
        height: 1
      }
    ];
  };

  // Add individual tree
  const addTree = (scene: THREE.Scene, x: number, z: number, height: number, _density: number) => {
    // Tree trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 1, height * 0.3, 8);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(x, height * 0.15, z);
    trunk.castShadow = true;
    scene.add(trunk);
    
    // Tree foliage
    const foliageGeometry = new THREE.SphereGeometry(height * 0.4, 8, 6);
    const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.set(x, height * 0.5, z);
    foliage.castShadow = true;
    scene.add(foliage);
  };

  // Add forest cluster
  const addForest = (scene: THREE.Scene, x: number, z: number, height: number, density: number) => {
    const treeCount = Math.floor(density * 10);
    for (let i = 0; i < treeCount; i++) {
      const offsetX = (Math.random() - 0.5) * 20;
      const offsetZ = (Math.random() - 0.5) * 20;
      const treeHeight = height * (0.8 + Math.random() * 0.4);
      addTree(scene, x + offsetX, z + offsetZ, treeHeight, density);
    }
  };

  // Add brush/scrub
  const addBrush = (scene: THREE.Scene, x: number, z: number, height: number, density: number) => {
    const brushCount = Math.floor(density * 15);
    for (let i = 0; i < brushCount; i++) {
      const offsetX = (Math.random() - 0.5) * 10;
      const offsetZ = (Math.random() - 0.5) * 10;
      const brushHeight = height * (0.5 + Math.random() * 0.5);
      
      const brushGeometry = new THREE.ConeGeometry(0.3, brushHeight, 6);
      const brushMaterial = new THREE.MeshLambertMaterial({ color: 0x556B2F });
      const brush = new THREE.Mesh(brushGeometry, brushMaterial);
      brush.position.set(x + offsetX, brushHeight / 2, z + offsetZ);
      brush.castShadow = true;
      scene.add(brush);
    }
  };

  // Add grass
  const addGrass = (scene: THREE.Scene, x: number, z: number, height: number, density: number) => {
    const grassCount = Math.floor(density * 50);
    for (let i = 0; i < grassCount; i++) {
      const offsetX = (Math.random() - 0.5) * 15;
      const offsetZ = (Math.random() - 0.5) * 15;
      const grassHeight = height * (0.3 + Math.random() * 0.7);
      
      const grassGeometry = new THREE.CylinderGeometry(0.05, 0.05, grassHeight, 4);
      const grassMaterial = new THREE.MeshLambertMaterial({ color: 0x90EE90 });
      const grass = new THREE.Mesh(grassGeometry, grassMaterial);
      grass.position.set(x + offsetX, grassHeight / 2, z + offsetZ);
      grass.castShadow = true;
      scene.add(grass);
    }
  };

  // Add mountain peaks
  const addMountainPeaks = (
    scene: THREE.Scene, 
    heightmap: number[], 
    terrainSize: number, 
    resolution: number, 
    elevation: number
  ) => {
    // Find peaks in heightmap
    const peaks: Array<{x: number, z: number, height: number}> = [];
    
    for (let x = 1; x < resolution - 1; x++) {
      for (let z = 1; z < resolution - 1; z++) {
        const currentHeight = heightmap[x + z * resolution];
        const isPeak = 
          currentHeight > heightmap[(x-1) + z * resolution] &&
          currentHeight > heightmap[(x+1) + z * resolution] &&
          currentHeight > heightmap[x + (z-1) * resolution] &&
          currentHeight > heightmap[x + (z+1) * resolution] &&
          currentHeight > 0.3; // Minimum height for a peak
        
        if (isPeak) {
          peaks.push({
            x: (x / resolution - 0.5) * terrainSize,
            z: (z / resolution - 0.5) * terrainSize,
            height: currentHeight * elevation
          });
        }
      }
    }

    // Create mountain peak geometries
    peaks.slice(0, 10).forEach(peak => { // Limit to 10 peaks for performance
      const mountainGeometry = new THREE.ConeGeometry(
        peak.height * 0.3, // Radius
        peak.height * 0.8, // Height
        8 // Segments
      );
      
      const mountainMaterial = new THREE.MeshLambertMaterial({
        color: 0x8B4513, // Brown color for mountains
        transparent: true,
        opacity: 0.8
      });
      
      const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
      mountain.position.set(peak.x, peak.height * 0.4, peak.z);
      mountain.castShadow = true;
      mountain.receiveShadow = true;
      scene.add(mountain);
    });
  };

  // Add water bodies
  const addWaterBodies = (scene: THREE.Scene, terrainSize: number) => {
    // Create water plane
    const waterGeometry = new THREE.PlaneGeometry(terrainSize * 0.8, terrainSize * 0.6);
    const waterMaterial = new THREE.MeshLambertMaterial({
      color: 0x006994,
      transparent: true,
      opacity: 0.6
    });
    
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 50; // Slightly above terrain
    scene.add(water);
  };

  // Add atmospheric effects
  const addAtmosphericEffects = (scene: THREE.Scene) => {
    // Add fog
    scene.fog = new THREE.Fog(0x87CEEB, 1000, 8000);
    
    // Add sky gradient
    const skyGeometry = new THREE.SphereGeometry(5000, 32, 32);
    const skyMaterial = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x0077ff) },
        bottomColor: { value: new THREE.Color(0xffffff) },
        offset: { value: 33 },
        exponent: { value: 0.6 }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
      `,
      side: THREE.BackSide
    });
    
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);
  };

  // Initialize 2D map with street style and 3D buildings
  const init2DMap = () => {
    if (!containerRef.current) return;

    console.log('Initializing 2D map...');
    setIsLoading(true);

    try {
      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12', // Street map style
        center: center,
        zoom: zoom,
        pitch: 45, // 3D perspective like Apple Maps
        bearing: 0,
        antialias: true
      });

      // Wait for map to load
      map.on('load', () => {
        console.log('Map loaded successfully');
        
        try {
          // Add 3D building extrusions using the existing composite source
          map.addLayer({
            'id': '3d-buildings',
            'source': 'composite',
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 15,
            'paint': {
              'fill-extrusion-color': '#aaa',
              'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'height']
              ],
              'fill-extrusion-base': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'min_height']
              ],
              'fill-extrusion-opacity': 0.6
            }
          });

          // Add our custom building data
          addBuildingFootprints(map);

          console.log('3D Terrain loaded');
          console.log('Setting loading to false...');
          
          // Set loading to false immediately
          setIsLoading(false);
          console.log('Loading state set to false');
          onTerrainLoad?.();
        } catch (error) {
          console.error('Error adding layers:', error);
          console.log('Setting loading to false due to layer error');
          setIsLoading(false);
        }
      });

      // Handle map errors
      map.on('error', (e) => {
        console.error('Mapbox error:', e);
        console.log('Setting loading to false due to mapbox error');
        setIsLoading(false);
      });

      // Set a timeout to prevent infinite loading
      setTimeout(() => {
        console.log('Timeout check - isLoading:', isLoading);
        if (isLoading) {
          console.log('Map loading timeout - forcing completion');
          setIsLoading(false);
        }
      }, 10000);

      mapRef.current = map;
    } catch (error) {
      console.error('Error initializing map:', error);
      console.log('Setting loading to false due to initialization error');
      setIsLoading(false);
    }
  };

  // Add building footprints to 2D map
  const addBuildingFootprints = (map: mapboxgl.Map) => {
    const buildings = generateBuildingData();
    
    map.addSource('buildings', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: buildings.map(building => ({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [building.coordinates[0] - 0.001, building.coordinates[1] - 0.001],
              [building.coordinates[0] + 0.001, building.coordinates[1] - 0.001],
              [building.coordinates[0] + 0.001, building.coordinates[1] + 0.001],
              [building.coordinates[0] - 0.001, building.coordinates[1] + 0.001],
              [building.coordinates[0] - 0.001, building.coordinates[1] - 0.001]
            ]]
          },
          properties: {
            height: building.height,
            type: building.type
          }
        }))
      }
    });

    map.addLayer({
      id: 'buildings-3d',
      type: 'fill-extrusion',
      source: 'buildings',
      paint: {
        'fill-extrusion-height': ['get', 'height'],
        'fill-extrusion-base': 0,
        'fill-extrusion-color': [
          'match',
          ['get', 'type'],
          'commercial', '#4A90E2',
          'residential', '#E8A87C',
          'industrial', '#8B4513',
          'government', '#DC143C',
          '#808080'
        ],
        'fill-extrusion-opacity': 0.8,
        'fill-extrusion-translate': [0, 0],
        'fill-extrusion-translate-anchor': 'map'
      }
    });
  };

  // Add vegetation layer to 2D map (commented out for now)
  // const addVegetationLayer = (map: mapboxgl.Map) => {
  //   const vegetation = generateVegetationData();
  //   
  //   map.addSource('vegetation', {
  //     type: 'geojson',
  //     data: {
  //       type: 'FeatureCollection',
  //       features: vegetation.map(veg => ({
  //         type: 'Feature',
  //         geometry: {
  //           type: 'Point',
  //           coordinates: veg.coordinates
  //         },
  //         properties: {
  //           type: veg.type,
  //           height: veg.height,
  //           density: veg.density
  //         }
  //       }))
  //     }
  //   });

  //   map.addLayer({
  //     id: 'vegetation-points',
  //     type: 'circle',
  //     source: 'vegetation',
  //     paint: {
  //       'circle-radius': [
  //         'match',
  //         ['get', 'type'],
  //         'tree', 8,
  //         'forest', 15,
  //         'brush', 5,
  //         'grass', 3,
  //         4
  //       ],
  //       'circle-color': [
  //         'match',
  //         ['get', 'type'],
  //         'tree', '#228B22',
  //         'forest', '#006400',
  //         'brush', '#556B2F',
  //         'grass', '#90EE90',
  //         '#228B22'
  //       ],
  //       'circle-opacity': 0.7
  //     }
  //   });
  // };

  // Toggle between 2D and 3D modes
  const toggleTerrainMode = () => {
    setTerrainMode(prev => prev === '2d' ? '3d' : '2d');
  };

  useEffect(() => {
    if (terrainMode === '2d') {
      init2DMap();
    } else {
      init3DTerrain();
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
      if (rendererRef.current && threeContainerRef.current) {
        threeContainerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [terrainMode, center, zoom, elevation]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (rendererRef.current && threeContainerRef.current) {
        const width = threeContainerRef.current.clientWidth;
        const height = threeContainerRef.current.clientHeight;
        
        rendererRef.current.setSize(width, height);
        if (cameraRef.current) {
          cameraRef.current.aspect = width / height;
          cameraRef.current.updateProjectionMatrix();
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`terrain-3d-container ${className}`}>
      {/* Mode Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={toggleTerrainMode}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
        >
          {terrainMode === '2d' ? 'Switch to 3D' : 'Switch to 2D'}
        </button>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-20">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading {terrainMode === '2d' ? '2D' : '3D'} Terrain...</p>
          </div>
        </div>
      )}

      {/* 2D Map Container */}
      {terrainMode === '2d' && (
        <div ref={containerRef} className="w-full h-full" />
      )}

      {/* 3D Terrain Container */}
      {terrainMode === '3d' && (
        <div ref={threeContainerRef} className="w-full h-full" />
      )}
    </div>
  );
};
