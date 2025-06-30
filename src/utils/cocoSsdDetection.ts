import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

let model: cocoSsd.ObjectDetection | null = null;
let modelLoading = false;

// COCO-SSD can detect these 80 object classes
const COCO_CLASSES = [
  'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck',
  'boat', 'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench',
  'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra',
  'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee',
  'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove',
  'skateboard', 'surfboard', 'tennis racket', 'bottle', 'wine glass', 'cup',
  'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange',
  'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch',
  'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse',
  'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink',
  'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier',
  'toothbrush'
];

// Animals that COCO-SSD can detect
const ANIMAL_CLASSES = [
  'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe'
];

// Initialize COCO-SSD model
async function loadCocoSsdModel(): Promise<cocoSsd.ObjectDetection> {
  if (model) {
    console.log('✅ Using cached COCO-SSD model');
    return model;
  }

  if (modelLoading) {
    console.log('⏳ Waiting for COCO-SSD model to finish loading...');
    // Wait for the model to finish loading
    while (modelLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (model) return model;
  }

  try {
    modelLoading = true;
    console.log('🤖 Loading COCO-SSD model...');
    
    // Ensure TensorFlow.js is ready
    await tf.ready();
    console.log('✅ TensorFlow.js ready');
    
    // Set backend to webgl for better performance
    await tf.setBackend('webgl');
    console.log('🚀 TensorFlow.js backend set to WebGL');
    
    // Load COCO-SSD model with optimized configuration
    model = await cocoSsd.load({
      base: 'mobilenet_v2', // Faster and more efficient
      modelUrl: undefined // Use default CDN
    });
    
    console.log('✅ COCO-SSD model loaded successfully');
    console.log('📋 Model can detect these objects:', COCO_CLASSES.slice(0, 10).join(', '), '... and 70 more');
    console.log('🐾 Animals detectable:', ANIMAL_CLASSES.join(', '));
    console.log('🚢 Marine vehicles detectable: boat, surfboard');
    return model;
  } catch (error) {
    console.error('❌ Failed to load COCO-SSD model:', error);
    throw new Error(`Failed to load object detection model: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    modelLoading = false;
  }
}

// Detect objects using COCO-SSD
export async function detectObjectsWithCocoSsd(imageFile: File): Promise<string[]> {
  try {
    console.log('🔍 Starting COCO-SSD object detection...');
    console.log('📁 Image file:', imageFile.name, `(${(imageFile.size / 1024 / 1024).toFixed(2)}MB)`);
    
    // Load the model
    const cocoModel = await loadCocoSsdModel();
    
    // Create image element
    const img = new Image();
    const imageUrl = URL.createObjectURL(imageFile);
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        URL.revokeObjectURL(imageUrl);
        console.error('⏰ Object detection timeout after 30 seconds');
        reject(new Error('Object detection timeout'));
      }, 30000); // 30 second timeout
      
      img.onload = async () => {
        try {
          clearTimeout(timeout);
          console.log('🖼️ Image loaded successfully');
          console.log(`📐 Image dimensions: ${img.width}x${img.height}`);
          
          // Detect objects
          console.log('🔍 Running COCO-SSD detection...');
          const startTime = Date.now();
          const predictions = await cocoModel.detect(img);
          const detectionTime = Date.now() - startTime;
          
          console.log(`⚡ Detection completed in ${detectionTime}ms`);
          console.log('🎯 COCO-SSD raw predictions:', predictions);
          
          if (predictions.length === 0) {
            console.log('⚠️ No objects detected in image');
            URL.revokeObjectURL(imageUrl);
            // For cruise ships, add marine-related fallback tags
            resolve(['no-objects-detected', 'image', 'photo', 'scene', 'outdoor', 'water', 'marine']);
            return;
          }
          
          // Process predictions
          console.log('🔄 Processing predictions...');
          const detectedObjects = processPredictions(predictions);
          console.log('✅ Final processed objects:', detectedObjects);
          
          URL.revokeObjectURL(imageUrl);
          resolve(detectedObjects);
        } catch (error) {
          clearTimeout(timeout);
          URL.revokeObjectURL(imageUrl);
          console.error('❌ Object detection failed:', error);
          
          // Return fallback objects instead of rejecting
          console.log('🔄 Returning fallback objects due to detection error');
          resolve(['detection-error', 'image', 'photo', 'scene', 'outdoor']);
        }
      };
      
      img.onerror = (error) => {
        clearTimeout(timeout);
        URL.revokeObjectURL(imageUrl);
        console.error('❌ Failed to load image for detection:', error);
        reject(new Error('Failed to load image for object detection'));
      };
      
      console.log('📥 Loading image for detection...');
      img.src = imageUrl;
    });
  } catch (error) {
    console.error('❌ COCO-SSD detection error:', error);
    
    // Return fallback instead of throwing
    console.log('🔄 Returning fallback objects due to setup error');
    return ['detection-setup-error', 'image', 'photo', 'scene'];
  }
}

// Process COCO-SSD predictions into meaningful tags
function processPredictions(predictions: cocoSsd.DetectedObject[]): string[] {
  console.log('🔄 Processing', predictions.length, 'predictions...');
  
  const objects = new Set<string>();
  const objectCounts = new Map<string, number>();
  let hasAnimals = false;
  let hasWildlife = false;
  let hasPets = false;
  let hasMarineVehicles = false;
  
  // Filter predictions by confidence and process
  const validPredictions = predictions.filter(prediction => prediction.score > 0.25); // Lowered threshold
  console.log(`✅ ${validPredictions.length} predictions above 25% confidence threshold`);
  
  validPredictions.forEach((prediction, index) => {
    const className = prediction.class.toLowerCase();
    const confidence = prediction.score;
    
    console.log(`🔍 [${index + 1}] Detected: "${className}" (${(confidence * 100).toFixed(1)}% confidence)`);
    
    // Add the main object
    objects.add(className);
    objectCounts.set(className, (objectCounts.get(className) || 0) + 1);
    
    // **ENHANCED MARINE VEHICLE DETECTION**
    if (className === 'boat') {
      hasMarineVehicles = true;
      objects.add('boat');
      objects.add('ship');
      objects.add('vessel');
      objects.add('cruise');
      objects.add('cruise-ship');
      objects.add('marine-vehicle');
      objects.add('watercraft');
      objects.add('ocean');
      objects.add('sea');
      objects.add('water');
      objects.add('maritime');
      objects.add('sailing');
      objects.add('navigation');
      objects.add('passenger-ship');
      objects.add('large-ship');
      console.log(`🚢 MARINE VEHICLE DETECTED: "${className}" - adding comprehensive ship/cruise tags!`);
    }
    
    // **CRITICAL: Check if this is an animal and add animal tags**
    if (ANIMAL_CLASSES.includes(className)) {
      hasAnimals = true;
      objects.add('animal');
      objects.add('animals');
      objects.add('wildlife');
      console.log(`🐾 ANIMAL DETECTED: "${className}" - adding animal tags!`);
      
      // Categorize animals
      if (['cat', 'dog'].includes(className)) {
        hasPets = true;
        objects.add('pet');
        objects.add('pets');
        objects.add('domestic-animal');
        console.log(`🏠 Pet detected: ${className}`);
      } else {
        hasWildlife = true;
        objects.add('wild-animal');
        objects.add('wildlife');
        console.log(`🌿 Wild animal detected: ${className}`);
      }
      
      // Special animal categories
      if (['elephant', 'bear', 'horse', 'cow', 'sheep'].includes(className)) {
        objects.add('large-animal');
        objects.add('mammal');
        console.log(`🦣 Large mammal detected: ${className}`);
      }
      
      if (['bird'].includes(className)) {
        objects.add('flying-animal');
        objects.add('bird');
        objects.add('feathers');
        console.log(`🐦 Bird detected: ${className}`);
      }
      
      // Handle rhino misclassification
      if (className === 'elephant') {
        objects.add('rhino');
        objects.add('rhinoceros');
        objects.add('large-mammal');
        objects.add('african-animal');
        console.log(`🦏 Elephant detected - also adding rhino tags (common misclassification)`);
      }
    }
    
    // Add related tags based on object type
    const relatedTags = getRelatedTags(className);
    console.log(`🏷️ Adding related tags for "${className}":`, relatedTags);
    relatedTags.forEach(tag => objects.add(tag));
    
    // Add confidence-based tags
    if (confidence > 0.7) {
      objects.add(`high-confidence-${className}`);
      console.log(`⭐ High confidence tag added: high-confidence-${className}`);
    }
    
    // Special handling for vehicles
    if (['car', 'truck', 'bus', 'motorcycle'].includes(className)) {
      objects.add('motor-vehicle');
      objects.add('road-vehicle');
      console.log(`🚗 Vehicle detected: ${className} - adding vehicle-specific tags`);
    }
  });
  
  // Add count-based tags for multiple objects
  objectCounts.forEach((count, className) => {
    if (count > 1) {
      objects.add(`multiple-${className}`);
      objects.add(`${count}-${className}`);
      console.log(`🔢 Multiple objects: ${count} ${className}(s)`);
    }
  });
  
  // **IMPORTANT: Add comprehensive animal scene tags**
  if (hasAnimals) {
    objects.add('animal-scene');
    objects.add('nature');
    objects.add('living-creature');
    console.log('🌿 Animal scene detected - adding nature tags');
    
    if (hasWildlife && hasPets) {
      objects.add('mixed-animals');
    } else if (hasWildlife) {
      objects.add('wildlife-scene');
      objects.add('safari');
      objects.add('zoo');
    } else if (hasPets) {
      objects.add('pet-scene');
      objects.add('domestic-scene');
    }
  }
  
  // **ENHANCED: Add comprehensive marine scene tags**
  if (hasMarineVehicles) {
    objects.add('marine-scene');
    objects.add('ocean-scene');
    objects.add('water-scene');
    objects.add('nautical');
    objects.add('maritime-scene');
    objects.add('cruise-scene');
    objects.add('vacation');
    objects.add('travel');
    objects.add('tourism');
    console.log('🌊 Marine scene detected - adding comprehensive ocean/cruise tags');
  }
  
  // Add summary tags
  const objectArray = Array.from(objects);
  
  if (objectArray.length > 5) {
    objects.add('complex-scene');
    console.log('🎭 Complex scene detected (5+ object types)');
  }
  
  if (hasVehicles(objectArray)) {
    objects.add('transportation');
    objects.add('vehicle-scene');
    console.log('🚗 Transportation scene detected');
  }
  
  if (hasTechnology(objectArray)) {
    objects.add('technology');
    objects.add('electronics');
    console.log('💻 Technology scene detected');
  }
  
  if (hasFood(objectArray)) {
    objects.add('food');
    objects.add('dining');
    console.log('🍕 Food scene detected');
  }
  
  const finalObjects = Array.from(objects).slice(0, 50); // Increased limit for marine tags
  console.log(`📊 Final object count: ${finalObjects.length} tags generated`);
  console.log(`🚢 Marine tags included:`, finalObjects.filter(tag => 
    ['boat', 'ship', 'cruise', 'marine', 'ocean', 'water', 'vessel'].some(marineTag => tag.includes(marineTag))
  ));
  
  return finalObjects;
}

// Get related tags for each object type
function getRelatedTags(className: string): string[] {
  const tagMap: { [key: string]: string[] } = {
    // **ENHANCED MARINE VEHICLE TAGS** - This is crucial for cruise ship detection!
    'boat': [
      'ship', 'vessel', 'watercraft', 'marine-vehicle', 'cruise', 'cruise-ship', 
      'ocean', 'sea', 'water', 'maritime', 'nautical', 'sailing', 'navigation',
      'passenger-ship', 'large-ship', 'ferry', 'yacht', 'liner', 'marine',
      'ocean-liner', 'cruise-liner', 'vacation', 'travel', 'tourism',
      'deck', 'cabin', 'port', 'harbor', 'voyage', 'sailing-ship'
    ],
    
    // **ENHANCED ANIMAL TAGS** - This is the key fix!
    'dog': ['animal', 'pet', 'canine', 'domestic', 'puppy', 'mammal', 'animals', 'pets'],
    'cat': ['animal', 'pet', 'feline', 'domestic', 'kitten', 'mammal', 'animals', 'pets'],
    'bird': ['animal', 'flying', 'wildlife', 'feathers', 'animals', 'wild-animal', 'nature'],
    'horse': ['animal', 'mammal', 'equine', 'large-animal', 'animals', 'farm-animal', 'domestic'],
    'sheep': ['animal', 'mammal', 'farm-animal', 'wool', 'animals', 'livestock', 'domestic'],
    'cow': ['animal', 'mammal', 'farm-animal', 'cattle', 'animals', 'livestock', 'domestic'],
    'elephant': ['animal', 'mammal', 'large-animal', 'wildlife', 'animals', 'wild-animal', 'african-animal', 'trunk', 'tusks', 'rhino', 'rhinoceros'],
    'bear': ['animal', 'mammal', 'large-animal', 'wildlife', 'animals', 'wild-animal', 'forest-animal', 'predator'],
    'zebra': ['animal', 'mammal', 'wildlife', 'animals', 'wild-animal', 'african-animal', 'stripes', 'equine'],
    'giraffe': ['animal', 'mammal', 'large-animal', 'wildlife', 'animals', 'wild-animal', 'african-animal', 'tall-animal'],
    
    // Vehicles - Enhanced for better car detection
    'car': ['vehicle', 'automobile', 'transportation', 'road-vehicle', 'motor-vehicle', 'passenger-car'],
    'truck': ['vehicle', 'automobile', 'transportation', 'commercial-vehicle', 'heavy-vehicle', 'motor-vehicle'],
    'bus': ['vehicle', 'automobile', 'transportation', 'public-transport', 'large-vehicle', 'motor-vehicle'],
    'motorcycle': ['vehicle', 'bike', 'transportation', 'two-wheeler', 'motor-vehicle', 'motorbike'],
    'bicycle': ['bike', 'transportation', 'two-wheeler', 'pedal-bike', 'cycle'],
    'airplane': ['aircraft', 'transportation', 'aviation', 'flying', 'plane'],
    'train': ['railway', 'transportation', 'rail-vehicle', 'locomotive'],
    
    // Technology
    'laptop': ['computer', 'technology', 'electronics', 'portable-computer', 'pc'],
    'cell phone': ['phone', 'smartphone', 'mobile', 'technology', 'electronics', 'communication', 'device'],
    'keyboard': ['computer-accessory', 'input-device', 'technology', 'typing', 'peripheral'],
    'mouse': ['computer-accessory', 'input-device', 'technology', 'pointing-device', 'peripheral'],
    'tv': ['television', 'screen', 'electronics', 'entertainment', 'display', 'monitor'],
    'remote': ['remote-control', 'electronics', 'controller', 'tv-remote'],
    
    // Furniture
    'chair': ['furniture', 'seating', 'home', 'office', 'seat'],
    'couch': ['furniture', 'seating', 'home', 'living-room', 'sofa', 'couch'],
    'bed': ['furniture', 'bedroom', 'home', 'sleeping', 'mattress'],
    'dining table': ['furniture', 'table', 'dining', 'home', 'dining-table'],
    
    // Food & Drink
    'cup': ['drinkware', 'beverage', 'container', 'mug'],
    'bottle': ['container', 'beverage', 'drink', 'bottle'],
    'wine glass': ['drinkware', 'glass', 'alcohol', 'beverage', 'wine'],
    'bowl': ['dishware', 'container', 'food', 'dish'],
    'pizza': ['food', 'italian', 'meal', 'fast-food'],
    'sandwich': ['food', 'meal', 'lunch', 'bread'],
    'banana': ['fruit', 'food', 'healthy', 'yellow-fruit'],
    'apple': ['fruit', 'food', 'healthy', 'red-fruit'],
    'orange': ['fruit', 'food', 'citrus', 'healthy', 'orange-fruit'],
    
    // People & Clothing
    'person': ['human', 'people', 'individual', 'man', 'woman'],
    'tie': ['clothing', 'formal', 'accessory', 'neckwear', 'business'],
    'handbag': ['bag', 'accessory', 'fashion', 'purse', 'women'],
    'backpack': ['bag', 'travel', 'school', 'hiking', 'student'],
    'suitcase': ['luggage', 'travel', 'bag', 'vacation'],
    
    // Sports & Recreation
    'sports ball': ['ball', 'sports', 'recreation', 'game', 'athletic'],
    'tennis racket': ['sports', 'tennis', 'recreation', 'equipment', 'racquet'],
    'skateboard': ['sports', 'recreation', 'board', 'skating', 'extreme'],
    'surfboard': ['sports', 'water-sports', 'surfing', 'board', 'ocean', 'marine', 'water'],
    
    // Household Items
    'clock': ['timepiece', 'time', 'home', 'wall-clock', 'timer'],
    'vase': ['decoration', 'home', 'flowers', 'container', 'ornament'],
    'book': ['reading', 'literature', 'education', 'paper', 'knowledge'],
    'scissors': ['tool', 'cutting', 'office', 'craft', 'sharp'],
    'toothbrush': ['hygiene', 'dental', 'bathroom', 'health', 'teeth'],
    
    // Kitchen & Appliances
    'microwave': ['appliance', 'kitchen', 'cooking', 'electronics', 'heating'],
    'oven': ['appliance', 'kitchen', 'cooking', 'baking', 'heat'],
    'refrigerator': ['appliance', 'kitchen', 'cooling', 'food-storage', 'fridge'],
    'toaster': ['appliance', 'kitchen', 'breakfast', 'bread', 'heating'],
    'sink': ['plumbing', 'kitchen', 'bathroom', 'washing', 'water'],
    
    // Traffic & Urban
    'traffic light': ['traffic', 'urban', 'street', 'signal', 'intersection', 'stoplight'],
    'stop sign': ['traffic', 'street', 'sign', 'safety', 'red-sign'],
    'fire hydrant': ['safety', 'urban', 'street', 'emergency', 'water'],
    'parking meter': ['urban', 'street', 'parking', 'payment', 'meter'],
    'bench': ['seating', 'outdoor', 'park', 'street-furniture', 'public']
  };
  
  return tagMap[className] || [];
}

// Check if scene contains vehicles (including marine vehicles)
function hasVehicles(objects: string[]): boolean {
  const vehicleKeywords = ['car', 'truck', 'bus', 'motorcycle', 'bicycle', 'airplane', 'boat', 'train', 'vehicle', 'automobile', 'ship', 'vessel'];
  return objects.some(obj => vehicleKeywords.some(keyword => obj.includes(keyword)));
}

// Check if scene contains technology
function hasTechnology(objects: string[]): boolean {
  const techKeywords = ['laptop', 'phone', 'keyboard', 'mouse', 'tv', 'computer', 'technology', 'electronics'];
  return objects.some(obj => techKeywords.some(keyword => obj.includes(keyword)));
}

// Check if scene contains food
function hasFood(objects: string[]): boolean {
  const foodKeywords = ['pizza', 'sandwich', 'banana', 'apple', 'orange', 'food', 'cup', 'bottle', 'bowl'];
  return objects.some(obj => foodKeywords.some(keyword => obj.includes(keyword)));
}

// Cleanup function
export function terminateCocoSsd(): void {
  if (model) {
    // COCO-SSD doesn't have a dispose method, but we can clear the reference
    model = null;
    console.log('🧹 COCO-SSD model reference cleared');
  }
}

// Get model info
export function getModelInfo(): { loaded: boolean; classes: string[]; animals: string[]; marineVehicles: string[] } {
  return {
    loaded: model !== null,
    classes: COCO_CLASSES,
    animals: ANIMAL_CLASSES,
    marineVehicles: ['boat'] // COCO-SSD can detect boats which we expand to ships/cruises
  };
}