/**
 * Navigation functionality for the tablet interface
 * Handles the bottom tab bar navigation and view switching
 */

class TabNavigation {
    constructor() {
        this.tabs = document.querySelectorAll('.tab');
        this.views = document.querySelectorAll('.view');
        this.currentView = document.querySelector('.active-view').id;
        
        this.init();
    }
    
    init() {
        // Set the initial active tab based on the active view
        this.setActiveTab(this.currentView);
        
        // Add click event listeners to tabs
        this.tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetView = tab.dataset.view;
                this.switchView(targetView);
                
                // Simulate haptic feedback
                this.triggerHapticFeedback('light');
            });
        });
        
        // Add swipe event listeners for history navigation
        this.setupHistoryNavigation();
    }
    
    switchView(viewId) {
        // Hide all views
        this.views.forEach(view => {
            view.classList.remove('active-view');
        });
        
        // Show the selected view
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.add('active-view');
            this.currentView = viewId;
            this.setActiveTab(viewId);
            
            // Add to navigation history
            this.addToHistory(viewId);
        }
    }
    
    setActiveTab(viewId) {
        // Remove active class from all tabs
        this.tabs.forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Add active class to the selected tab
        const activeTab = Array.from(this.tabs).find(tab => tab.dataset.view === viewId);
        if (activeTab) {
            activeTab.classList.add('active');
        }
    }
    
    // Navigation history management
    navigationHistory = [];
    currentHistoryIndex = -1;
    
    addToHistory(viewId) {
        // If we're not at the end of the history, truncate it
        if (this.currentHistoryIndex < this.navigationHistory.length - 1) {
            this.navigationHistory = this.navigationHistory.slice(0, this.currentHistoryIndex + 1);
        }
        
        // Only add to history if it's different from the current view
        if (this.navigationHistory.length === 0 || 
            this.navigationHistory[this.navigationHistory.length - 1] !== viewId) {
            this.navigationHistory.push(viewId);
            this.currentHistoryIndex = this.navigationHistory.length - 1;
        }
    }
    
    goBack() {
        if (this.currentHistoryIndex > 0) {
            this.currentHistoryIndex--;
            const previousView = this.navigationHistory[this.currentHistoryIndex];
            this.switchView(previousView);
            return true;
        }
        return false;
    }
    
    goForward() {
        if (this.currentHistoryIndex < this.navigationHistory.length - 1) {
            this.currentHistoryIndex++;
            const nextView = this.navigationHistory[this.currentHistoryIndex];
            this.switchView(nextView);
            return true;
        }
        return false;
    }
    
    setupHistoryNavigation() {
        // Track touch start position for swipe detection
        let touchStartX = 0;
        let touchStartY = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            // Only trigger if horizontal swipe is more significant than vertical
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 100) {
                if (deltaX > 0) {
                    // Swipe right (go back)
                    if (this.goBack()) {
                        this.triggerHapticFeedback('medium');
                    }
                } else {
                    // Swipe left (go forward)
                    if (this.goForward()) {
                        this.triggerHapticFeedback('medium');
                    }
                }
            }
        }, { passive: true });
    }
    
    // Customizable tab order
    reorderTabs(newOrder) {
        const tabBar = document.querySelector('.bottom-tab-bar');
        
        // Validate the new order
        if (!newOrder || newOrder.length !== this.tabs.length) {
            console.error('Invalid tab order provided');
            return;
        }
        
        // Create a document fragment to hold the reordered tabs
        const fragment = document.createDocumentFragment();
        
        // Add tabs in the new order
        newOrder.forEach(viewId => {
            const tab = Array.from(this.tabs).find(tab => tab.dataset.view === viewId);
            if (tab) {
                // Clone the tab to avoid reference issues
                const clonedTab = tab.cloneNode(true);
                
                // Re-add event listener to the cloned tab
                clonedTab.addEventListener('click', () => {
                    this.switchView(viewId);
                    this.triggerHapticFeedback('light');
                });
                
                fragment.appendChild(clonedTab);
            }
        });
        
        // Clear the tab bar and append the reordered tabs
        tabBar.innerHTML = '';
        tabBar.appendChild(fragment);
        
        // Update the tabs reference
        this.tabs = document.querySelectorAll('.tab');
        
        // Set the active tab
        this.setActiveTab(this.currentView);
    }
    
    // Badge notifications
    updateBadge(viewId, count) {
        const tab = Array.from(this.tabs).find(tab => tab.dataset.view === viewId);
        if (tab) {
            const badge = tab.querySelector('.badge');
            
            if (count > 0) {
                if (badge) {
                    badge.textContent = count > 99 ? '99+' : count;
                    badge.style.display = 'flex';
                } else {
                    const newBadge = document.createElement('div');
                    newBadge.className = 'badge';
                    newBadge.textContent = count > 99 ? '99+' : count;
                    tab.appendChild(newBadge);
                }
            } else if (badge) {
                badge.style.display = 'none';
            }
        }
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

