/**
 * Gesture handling for the tablet interface
 * Implements two-finger gestures for zoom, pan, rotation, and pinch-to-filter
 */

class GestureHandler {
    constructor(spatialCanvasId) {
        this.spatialCanvas = document.getElementById(spatialCanvasId);
        if (!this.spatialCanvas) {
            console.error(`Spatial canvas element with ID "${spatialCanvasId}" not found`);
            return;
        }
        
        // Gesture state
        this.scale = 1;
        this.rotation = 0;
        this.translateX = 0;
        this.translateY = 0;
        this.lastDistance = 0;
        this.lastAngle = 0;
        this.lastCenterX = 0;
        this.lastCenterY = 0;
        this.isGesturing = false;
        
        // Nodes in the spatial view
        this.nodes = [];
        this.edges = [];
        
        // Selected nodes (for multi-selection)
        this.selectedNodes = new Set();
        
        // Initialize gesture handling
        this.init();
    }
    
    init() {
        // Prevent default touch actions on the canvas
        this.spatialCanvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        // Setup gesture event listeners
        this.setupZoomAndPan();
        this.setupRotation();
        this.setupPinchToFilter();
        this.setupMultiSelection();
    }
    
    // Initialize the spatial view with nodes and edges
    initSpatialView(nodes, edges) {
        this.nodes = nodes;
        this.edges = edges;
        
        // Clear the canvas
        this.spatialCanvas.innerHTML = '';
        
        // Create edges first (so they appear behind nodes)
        edges.forEach(edge => {
            this.createEdge(edge);
        });
        
        // Create nodes
        nodes.forEach(node => {
            this.createNode(node);
        });
        
        // Reset view transformations
        this.resetView();
    }
    
    createNode(nodeData) {
        const nodeElement = document.createElement('div');
        nodeElement.className = `node node-${nodeData.type}`;
        nodeElement.id = nodeData.id;
        nodeElement.dataset.type = nodeData.type;
        nodeElement.dataset.refId = nodeData.refId;
        nodeElement.style.left = `${nodeData.x}px`;
        nodeElement.style.top = `${nodeData.y}px`;
        nodeElement.innerHTML = `<span>${nodeData.label}</span>`;
        
        // Add to the canvas
        this.spatialCanvas.appendChild(nodeElement);
        
        return nodeElement;
    }
    
    createEdge(edgeData) {
        const fromNode = this.nodes.find(node => node.id === edgeData.from);
        const toNode = this.nodes.find(node => node.id === edgeData.to);
        
        if (!fromNode || !toNode) {
            console.error(`Edge references non-existent node: ${edgeData.from} -> ${edgeData.to}`);
            return null;
        }
        
        // Calculate edge position and rotation
        const dx = toNode.x - fromNode.x;
        const dy = toNode.y - fromNode.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        
        // Create edge element
        const edgeElement = document.createElement('div');
        edgeElement.className = 'edge';
        edgeElement.style.width = `${length}px`;
        edgeElement.style.left = `${fromNode.x + 30}px`; // Adjust for node center
        edgeElement.style.top = `${fromNode.y + 30}px`; // Adjust for node center
        edgeElement.style.transform = `rotate(${angle}deg)`;
        
        // Add to the canvas
        this.spatialCanvas.appendChild(edgeElement);
        
        return edgeElement;
    }
    
    // Zoom and Pan functionality
    setupZoomAndPan() {
        let initialDistance = 0;
        let initialScale = 1;
        let initialTranslateX = 0;
        let initialTranslateY = 0;
        let initialTouchX = 0;
        let initialTouchY = 0;
        
        // Touch start - record initial values
        this.spatialCanvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                // Two-finger gesture starting
                this.isGesturing = true;
                
                // Calculate initial distance between touch points
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                initialDistance = this.getDistance(touch1, touch2);
                initialScale = this.scale;
                
                // Calculate center point between touches
                const centerX = (touch1.clientX + touch2.clientX) / 2;
                const centerY = (touch1.clientY + touch2.clientY) / 2;
                this.lastCenterX = centerX;
                this.lastCenterY = centerY;
                
                // Record initial transform values
                initialTranslateX = this.translateX;
                initialTranslateY = this.translateY;
                
                // Trigger haptic feedback
                this.triggerHapticFeedback('light');
            } else if (e.touches.length === 1) {
                // Single-finger pan
                initialTouchX = e.touches[0].clientX;
                initialTouchY = e.touches[0].clientY;
                initialTranslateX = this.translateX;
                initialTranslateY = this.translateY;
            }
        }, { passive: false });
        
        // Touch move - update zoom and pan
        this.spatialCanvas.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2 && this.isGesturing) {
                // Two-finger gesture for zoom
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const currentDistance = this.getDistance(touch1, touch2);
                
                // Calculate new scale based on distance change
                const scaleFactor = currentDistance / initialDistance;
                this.scale = initialScale * scaleFactor;
                
                // Limit scale to reasonable bounds
                this.scale = Math.max(0.5, Math.min(3, this.scale));
                
                // Calculate center point between touches
                const centerX = (touch1.clientX + touch2.clientX) / 2;
                const centerY = (touch1.clientY + touch2.clientY) / 2;
                
                // Pan based on center point movement
                this.translateX = initialTranslateX + (centerX - this.lastCenterX);
                this.translateY = initialTranslateY + (centerY - this.lastCenterY);
                
                // Update last center point
                this.lastCenterX = centerX;
                this.lastCenterY = centerY;
                
                // Apply transformations
                this.applyTransformations();
                
                // Prevent default to avoid page scrolling
                e.preventDefault();
            } else if (e.touches.length === 1 && !this.isGesturing) {
                // Single-finger pan
                const touchX = e.touches[0].clientX;
                const touchY = e.touches[0].clientY;
                
                // Calculate pan distance
                this.translateX = initialTranslateX + (touchX - initialTouchX);
                this.translateY = initialTranslateY + (touchY - initialTouchY);
                
                // Apply transformations
                this.applyTransformations();
                
                // Prevent default to avoid page scrolling
                e.preventDefault();
            }
        }, { passive: false });
        
        // Touch end - reset gesture state
        this.spatialCanvas.addEventListener('touchend', (e) => {
            if (this.isGesturing && e.touches.length < 2) {
                this.isGesturing = false;
                
                // Trigger haptic feedback
                this.triggerHapticFeedback('light');
            }
        }, { passive: true });
    }
    
    // Rotation functionality
    setupRotation() {
        let initialAngle = 0;
        let initialRotation = 0;
        
        this.spatialCanvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                initialAngle = this.getAngle(touch1, touch2);
                initialRotation = this.rotation;
            }
        }, { passive: true });
        
        this.spatialCanvas.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2 && this.isGesturing) {
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const currentAngle = this.getAngle(touch1, touch2);
                
                // Calculate rotation change
                const angleDiff = currentAngle - initialAngle;
                this.rotation = initialRotation + angleDiff;
                
                // Apply transformations
                this.applyTransformations();
            }
        }, { passive: false });
    }
    
    // Pinch-to-filter functionality
    setupPinchToFilter() {
        let pinchStartDistance = 0;
        let isPinchingToFilter = false;
        
        // Only apply to list views
        const taskList = document.querySelector('.task-list');
        if (!taskList) return;
        
        taskList.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                pinchStartDistance = this.getDistance(touch1, touch2);
                isPinchingToFilter = true;
                
                // Trigger haptic feedback
                this.triggerHapticFeedback('light');
            }
        }, { passive: true });
        
        taskList.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2 && isPinchingToFilter) {
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const currentDistance = this.getDistance(touch1, touch2);
                
                // Calculate pinch factor (1 = no change, <1 = pinch in, >1 = pinch out)
                const pinchFactor = currentDistance / pinchStartDistance;
                
                if (pinchFactor < 0.7) {
                    // Pinch in - filter to high priority tasks
                    this.filterTasks('high');
                    isPinchingToFilter = false;
                    
                    // Trigger haptic feedback
                    this.triggerHapticFeedback('medium');
                } else if (pinchFactor > 1.3) {
                    // Pinch out - show all tasks
                    this.filterTasks('all');
                    isPinchingToFilter = false;
                    
                    // Trigger haptic feedback
                    this.triggerHapticFeedback('medium');
                }
            }
        }, { passive: true });
        
        taskList.addEventListener('touchend', (e) => {
            isPinchingToFilter = false;
        }, { passive: true });
    }
    
    // Filter tasks by priority
    filterTasks(priority) {
        const taskItems = document.querySelectorAll('.task-item');
        
        taskItems.forEach(item => {
            if (priority === 'all') {
                item.style.display = 'flex';
            } else {
                const taskPriority = item.querySelector('.task-priority').classList.contains(`priority-${priority}`);
                item.style.display = taskPriority ? 'flex' : 'none';
            }
        });
    }
    
    // Multi-selection capabilities
    setupMultiSelection() {
        let selectionStartX = 0;
        let selectionStartY = 0;
        let isMultiSelecting = false;
        let selectionBox = null;
        
        this.spatialCanvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                // Start multi-selection with two fingers held slightly apart
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const distance = this.getDistance(touch1, touch2);
                
                // Only trigger if fingers are close together (not for zoom/pan)
                if (distance < 100) {
                    isMultiSelecting = true;
                    
                    // Calculate starting point (between the two touches)
                    selectionStartX = (touch1.clientX + touch2.clientX) / 2;
                    selectionStartY = (touch1.clientY + touch2.clientY) / 2;
                    
                    // Create selection box
                    selectionBox = document.createElement('div');
                    selectionBox.className = 'selection-box';
                    selectionBox.style.position = 'absolute';
                    selectionBox.style.border = '2px dashed var(--primary-color)';
                    selectionBox.style.backgroundColor = 'rgba(74, 108, 247, 0.1)';
                    selectionBox.style.left = `${selectionStartX}px`;
                    selectionBox.style.top = `${selectionStartY}px`;
                    selectionBox.style.width = '0';
                    selectionBox.style.height = '0';
                    
                    this.spatialCanvas.appendChild(selectionBox);
                    
                    // Trigger haptic feedback
                    this.triggerHapticFeedback('light');
                    
                    e.preventDefault();
                }
            }
        }, { passive: false });
        
        this.spatialCanvas.addEventListener('touchmove', (e) => {
            if (isMultiSelecting && e.touches.length === 2) {
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                
                // Calculate current center point
                const currentX = (touch1.clientX + touch2.clientX) / 2;
                const currentY = (touch1.clientY + touch2.clientY) / 2;
                
                // Update selection box
                const left = Math.min(selectionStartX, currentX);
                const top = Math.min(selectionStartY, currentY);
                const width = Math.abs(currentX - selectionStartX);
                const height = Math.abs(currentY - selectionStartY);
                
                selectionBox.style.left = `${left}px`;
                selectionBox.style.top = `${top}px`;
                selectionBox.style.width = `${width}px`;
                selectionBox.style.height = `${height}px`;
                
                // Check which nodes are in the selection box
                this.updateSelection(left, top, width, height);
                
                e.preventDefault();
            }
        }, { passive: false });
        
        this.spatialCanvas.addEventListener('touchend', (e) => {
            if (isMultiSelecting) {
                isMultiSelecting = false;
                
                // Remove selection box
                if (selectionBox && selectionBox.parentNode) {
                    selectionBox.parentNode.removeChild(selectionBox);
                }
                
                // Trigger haptic feedback if nodes were selected
                if (this.selectedNodes.size > 0) {
                    this.triggerHapticFeedback('medium');
                }
            }
        }, { passive: true });
    }
    
    // Update node selection based on selection box
    updateSelection(left, top, width, height) {
        const right = left + width;
        const bottom = top + height;
        
        // Clear previous selection
        document.querySelectorAll('.node.selected').forEach(node => {
            node.classList.remove('selected');
        });
        
        this.selectedNodes.clear();
        
        // Check each node
        document.querySelectorAll('.node').forEach(nodeElement => {
            const rect = nodeElement.getBoundingClientRect();
            const nodeLeft = rect.left;
            const nodeTop = rect.top;
            const nodeRight = rect.right;
            const nodeBottom = rect.bottom;
            
            // Check if node is inside selection box
            if (nodeLeft >= left && nodeRight <= right && nodeTop >= top && nodeBottom <= bottom) {
                nodeElement.classList.add('selected');
                this.selectedNodes.add(nodeElement.id);
            }
        });
    }
    
    // Apply all transformations to the spatial canvas
    applyTransformations() {
        const transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale}) rotate(${this.rotation}deg)`;
        
        // Apply to all nodes and edges
        document.querySelectorAll('.node, .edge').forEach(element => {
            element.style.transform = transform;
        });
    }
    
    // Reset view to initial state
    resetView() {
        this.scale = 1;
        this.rotation = 0;
        this.translateX = 0;
        this.translateY = 0;
        this.applyTransformations();
    }
    
    // Utility function to calculate distance between two touch points
    getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // Utility function to calculate angle between two touch points
    getAngle(touch1, touch2) {
        return Math.atan2(
            touch2.clientY - touch1.clientY,
            touch2.clientX - touch1.clientX
        ) * 180 / Math.PI;
    }
    
    // Haptic feedback simulation
    triggerHapticFeedback(intensity = 'medium') {
        // Since we can't actually trigger haptic feedback in a web demo,
        // we'll simulate it with a visual indicator
        const hapticElement = document.createElement('div');
        hapticElement.className = 'haptic-feedback';
        document.body.appendChild(hapticElement);
        
        // Remove the element after animation completes
        setTimeout(() => {
            hapticElement.remove();
        }, 150);
        
        // If the device supports vibration, use it
        if ('vibrate' in navigator) {
            switch (intensity) {
                case 'light':
                    navigator.vibrate(10);
                    break;
                case 'medium':
                    navigator.vibrate(20);
                    break;
                case 'heavy':
                    navigator.vibrate([20, 30, 20]);
                    break;
                default:
                    navigator.vibrate(20);
            }
        }
    }
}

