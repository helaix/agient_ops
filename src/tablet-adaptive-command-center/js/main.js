/**
 * Tablet Adaptive Command Center
 * Main JavaScript file for handling touch interactions, sidebar management,
 * and responsive behavior for tablet interfaces.
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const commandCenter = document.getElementById('commandCenter');
    const leftSidebar = document.getElementById('leftSidebar');
    const rightSidebar = document.getElementById('rightSidebar');
    const mainViewport = document.getElementById('mainViewport');
    const toggleSidebarsButton = document.getElementById('toggleSidebarsButton');
    const expandLeftButton = document.getElementById('expandLeftButton');
    const expandRightButton = document.getElementById('expandRightButton');
    const searchButton = document.getElementById('searchButton');
    const searchExpanded = document.getElementById('searchExpanded');
    const viewTabs = document.querySelectorAll('.view-tab');
    const viewContainers = document.querySelectorAll('.view-container');
    const quickActionButton = document.getElementById('quickActionButton');
    const quickActionPalette = document.getElementById('quickActionPalette');
    const closePalette = document.getElementById('closePalette');
    const mapView = document.getElementById('mapView');
    const contextualToolbar = document.getElementById('contextualToolbar');
    
    // State Management
    let sidebarState = {
        leftVisible: true,
        rightVisible: true
    };
    
    // Load saved state from localStorage if available
    loadSidebarState();
    
    // Apply initial state
    updateSidebarVisibility();
    
    // Event Listeners
    
    // Toggle Sidebars
    toggleSidebarsButton.addEventListener('click', () => {
        // Toggle both sidebars
        sidebarState.leftVisible = !sidebarState.leftVisible;
        sidebarState.rightVisible = !sidebarState.rightVisible;
        updateSidebarVisibility();
        saveSidebarState();
    });
    
    // Expand Left Sidebar
    expandLeftButton.addEventListener('click', () => {
        sidebarState.leftVisible = true;
        updateSidebarVisibility();
        saveSidebarState();
    });
    
    // Expand Right Sidebar
    expandRightButton.addEventListener('click', () => {
        sidebarState.rightVisible = true;
        updateSidebarVisibility();
        saveSidebarState();
    });
    
    // Search Expand/Collapse
    searchButton.addEventListener('click', () => {
        searchExpanded.classList.toggle('active');
        if (searchExpanded.classList.contains('active')) {
            searchExpanded.querySelector('input').focus();
        }
    });
    
    // Close search when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchButton.contains(e.target) && !searchExpanded.contains(e.target)) {
            searchExpanded.classList.remove('active');
        }
    });
    
    // View Tab Switching
    viewTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const viewName = tab.getAttribute('data-view');
            
            // Update active tab
            viewTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show corresponding view
            viewContainers.forEach(container => {
                container.classList.remove('active');
                if (container.id === `${viewName}View`) {
                    container.classList.add('active');
                }
            });
        });
    });
    
    // Quick Action Palette
    quickActionButton.addEventListener('click', () => {
        quickActionPalette.classList.add('active');
    });
    
    closePalette.addEventListener('click', () => {
        quickActionPalette.classList.remove('active');
    });
    
    // Close palette when clicking outside
    document.addEventListener('click', (e) => {
        if (!quickActionButton.contains(e.target) && 
            !quickActionPalette.contains(e.target)) {
            quickActionPalette.classList.remove('active');
        }
    });
    
    // Agent Selection
    const agentItems = document.querySelectorAll('.agent-item');
    agentItems.forEach(agent => {
        agent.addEventListener('click', () => {
            // Update active agent
            agentItems.forEach(a => a.classList.remove('active'));
            agent.classList.add('active');
            
            // Show contextual toolbar
            contextualToolbar.classList.add('active');
            
            // In a real implementation, this would update the context panel
            // with the selected agent's details
        });
    });
    
    // Touch Gestures for Sidebars
    
    // Variables for tracking touch
    let touchStartX = 0;
    let touchEndX = 0;
    
    // Add touch event listeners to the main viewport
    mainViewport.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, false);
    
    mainViewport.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipeGesture();
    }, false);
    
    // Handle swipe gestures
    function handleSwipeGesture() {
        const swipeDistance = touchEndX - touchStartX;
        const threshold = 100; // Minimum distance to trigger swipe
        
        if (swipeDistance > threshold) {
            // Swipe right - show left sidebar
            sidebarState.leftVisible = true;
            updateSidebarVisibility();
            saveSidebarState();
        } else if (swipeDistance < -threshold) {
            // Swipe left - show right sidebar
            sidebarState.rightVisible = true;
            updateSidebarVisibility();
            saveSidebarState();
        }
    }
    
    // Double tap to maximize viewport
    let lastTap = 0;
    mainViewport.addEventListener('click', (e) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        
        if (tapLength < 300 && tapLength > 0) {
            // Double tap detected
            sidebarState.leftVisible = false;
            sidebarState.rightVisible = false;
            updateSidebarVisibility();
            saveSidebarState();
            e.preventDefault();
        }
        
        lastTap = currentTime;
    });
    
    // Map View Touch Interactions
    if (mapView) {
        setupMapInteractions(mapView);
    }
    
    // Haptic Feedback
    function triggerHapticFeedback() {
        if (navigator.vibrate) {
            navigator.vibrate(20);
        }
    }
    
    // Add haptic feedback to all buttons
    const allButtons = document.querySelectorAll('button');
    allButtons.forEach(button => {
        button.addEventListener('click', triggerHapticFeedback);
    });
    
    // Split View Support
    window.addEventListener('resize', handleResize);
    
    // Initial resize handling
    handleResize();
    
    // Orientation Change Support
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Functions
    
    // Update sidebar visibility based on state
    function updateSidebarVisibility() {
        if (sidebarState.leftVisible) {
            leftSidebar.style.width = getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width');
            toggleSidebarsButton.querySelector('i').classList.remove('fa-chevron-right');
            toggleSidebarsButton.querySelector('i').classList.add('fa-chevron-left');
        } else {
            leftSidebar.style.width = getComputedStyle(document.documentElement).getPropertyValue('--sidebar-collapsed-width');
            toggleSidebarsButton.querySelector('i').classList.remove('fa-chevron-left');
            toggleSidebarsButton.querySelector('i').classList.add('fa-chevron-right');
        }
        
        if (sidebarState.rightVisible) {
            rightSidebar.style.width = getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width');
        } else {
            rightSidebar.style.width = getComputedStyle(document.documentElement).getPropertyValue('--sidebar-collapsed-width');
        }
        
        // Update expand button visibility
        expandLeftButton.style.display = sidebarState.leftVisible ? 'none' : 'flex';
        expandRightButton.style.display = sidebarState.rightVisible ? 'none' : 'flex';
    }
    
    // Save sidebar state to localStorage
    function saveSidebarState() {
        localStorage.setItem('tabletCommandCenterSidebarState', JSON.stringify(sidebarState));
    }
    
    // Load sidebar state from localStorage
    function loadSidebarState() {
        const savedState = localStorage.getItem('tabletCommandCenterSidebarState');
        if (savedState) {
            sidebarState = JSON.parse(savedState);
        }
    }
    
    // Handle window resize for split view support
    function handleResize() {
        const width = window.innerWidth;
        
        // Auto-collapse sidebars in narrow views
        if (width < 768) {
            sidebarState.leftVisible = false;
            sidebarState.rightVisible = false;
            updateSidebarVisibility();
        }
    }
    
    // Handle orientation change
    function handleOrientationChange() {
        // Adjust layout based on orientation
        if (window.orientation === 0 || window.orientation === 180) {
            // Portrait orientation
            document.body.classList.remove('landscape');
            document.body.classList.add('portrait');
        } else {
            // Landscape orientation
            document.body.classList.remove('portrait');
            document.body.classList.add('landscape');
        }
    }
    
    // Setup map view interactions (pinch zoom, pan, etc.)
    function setupMapInteractions(mapElement) {
        let scale = 1;
        let posX = 0;
        let posY = 0;
        let startX = 0;
        let startY = 0;
        let startDistance = 0;
        
        // Touch start event
        mapElement.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                // Two-finger gesture starting
                startDistance = getDistance(
                    e.touches[0].pageX, e.touches[0].pageY,
                    e.touches[1].pageX, e.touches[1].pageY
                );
            } else if (e.touches.length === 1) {
                // One-finger pan starting
                startX = e.touches[0].pageX - posX;
                startY = e.touches[0].pageY - posY;
            }
        });
        
        // Touch move event
        mapElement.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                // Handle pinch zoom
                const currentDistance = getDistance(
                    e.touches[0].pageX, e.touches[0].pageY,
                    e.touches[1].pageX, e.touches[1].pageY
                );
                
                if (startDistance > 0) {
                    const newScale = scale * (currentDistance / startDistance);
                    // Limit scale to reasonable bounds
                    if (newScale > 0.5 && newScale < 3) {
                        scale = newScale;
                        applyTransform(mapElement.querySelector('.map-placeholder'));
                    }
                }
                
                startDistance = currentDistance;
                e.preventDefault();
            } else if (e.touches.length === 1) {
                // Handle pan
                posX = e.touches[0].pageX - startX;
                posY = e.touches[0].pageY - startY;
                applyTransform(mapElement.querySelector('.map-placeholder'));
                e.preventDefault();
            }
        });
        
        // Apply transform to map element
        function applyTransform(element) {
            element.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
        }
        
        // Calculate distance between two points (for pinch)
        function getDistance(x1, y1, x2, y2) {
            return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        }
        
        // Reset map view button
        const resetViewButton = document.querySelector('.control-button[aria-label="Reset View"]');
        if (resetViewButton) {
            resetViewButton.addEventListener('click', () => {
                scale = 1;
                posX = 0;
                posY = 0;
                applyTransform(mapElement.querySelector('.map-placeholder'));
            });
        }
    }
});

