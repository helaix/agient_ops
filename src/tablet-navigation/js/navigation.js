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
            
            // Add keyboard support for tabs
            tab.addEventListener('keydown', (e) => {
                // Enter or Space to activate tab
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const targetView = tab.dataset.view;
                    this.switchView(targetView);
                }
                
                // Left/Right arrow keys to navigate between tabs
                if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.navigateTabsWithKeyboard(e.key === 'ArrowRight' ? 1 : -1);
                }
            });
        });
        
        // Add swipe event listeners for history navigation
        this.setupHistoryNavigation();
        
        // Update ARIA attributes when view changes
        this.updateAriaAttributes();
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
            
            // Update ARIA attributes
            this.updateAriaAttributes();
            
            // Add to navigation history
            this.addToHistory(viewId);
            
            // Announce view change for screen readers
            this.announceViewChange(viewId);
        }
    }
    
    setActiveTab(viewId) {
        // Remove active class from all tabs
        this.tabs.forEach(tab => {
            tab.classList.remove('active');
            tab.setAttribute('aria-selected', 'false');
        });
        
        // Add active class to the selected tab
        const activeTab = Array.from(this.tabs).find(tab => tab.dataset.view === viewId);
        if (activeTab) {
            activeTab.classList.add('active');
            activeTab.setAttribute('aria-selected', 'true');
        }
    }
    
    // Update ARIA attributes for accessibility
    updateAriaAttributes() {
        // Update tab panel relationships
        this.tabs.forEach(tab => {
            const viewId = tab.dataset.view;
            tab.setAttribute('aria-controls', viewId);
            
            // Set selected state
            const isSelected = viewId === this.currentView;
            tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
        });
        
        // Update view attributes
        this.views.forEach(view => {
            view.setAttribute('aria-hidden', view.id !== this.currentView ? 'true' : 'false');
            
            // Set role as tabpanel
            view.setAttribute('role', 'tabpanel');
            
            // Associate with controlling tab
            const controllingTab = Array.from(this.tabs).find(tab => tab.dataset.view === view.id);
            if (controllingTab) {
                view.setAttribute('aria-labelledby', controllingTab.querySelector('span').id || '');
            }
        });
    }
    
    // Keyboard navigation between tabs
    navigateTabsWithKeyboard(direction) {
        const tabsArray = Array.from(this.tabs);
        const currentIndex = tabsArray.findIndex(tab => tab.dataset.view === this.currentView);
        
        // Calculate new index with wrapping
        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = tabsArray.length - 1;
        if (newIndex >= tabsArray.length) newIndex = 0;
        
        // Switch to the new tab
        const newTab = tabsArray[newIndex];
        this.switchView(newTab.dataset.view);
        
        // Focus the new tab
        newTab.focus();
    }
    
    // Announce view change for screen readers
    announceViewChange(viewId) {
        // Create an aria-live region for announcements
        let announcer = document.getElementById('view-change-announcer');
        
        if (!announcer) {
            announcer = document.createElement('div');
            announcer.id = 'view-change-announcer';
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.className = 'sr-only'; // Screen reader only
            document.body.appendChild(announcer);
        }
        
        // Get view name from heading
        const view = document.getElementById(viewId);
        const heading = view ? view.querySelector('h1') : null;
        const viewName = heading ? heading.textContent : viewId.replace('-view', '');
        
        // Announce the view change
        announcer.textContent = `Switched to ${viewName} view`;
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
        
        // Add keyboard shortcuts for history navigation
        document.addEventListener('keydown', (e) => {
            // Alt+Left Arrow for back, Alt+Right Arrow for forward
            if (e.altKey) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.goBack();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.goForward();
                }
            }
        });
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
                
                // Add keyboard event listener
                clonedTab.addEventListener('keydown', (e) => {
                    // Enter or Space to activate tab
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.switchView(viewId);
                    }
                    
                    // Left/Right arrow keys to navigate between tabs
                    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                        e.preventDefault();
                        this.navigateTabsWithKeyboard(e.key === 'ArrowRight' ? 1 : -1);
                    }
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
        
        // Update ARIA attributes
        this.updateAriaAttributes();
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
                    badge.setAttribute('aria-label', `${count} unread notifications`);
                } else {
                    const newBadge = document.createElement('div');
                    newBadge.className = 'badge';
                    newBadge.textContent = count > 99 ? '99+' : count;
                    newBadge.setAttribute('aria-label', `${count} unread notifications`);
                    newBadge.setAttribute('role', 'status');
                    tab.appendChild(newBadge);
                }
            } else if (badge) {
                badge.style.display = 'none';
                badge.setAttribute('aria-hidden', 'true');
            }
        }
    }
    
    // Haptic feedback simulation
    triggerHapticFeedback(intensity = 'medium') {
        // Since we can't actually trigger haptic feedback in a web demo,
        // we'll simulate it with a visual indicator
        const hapticElement = document.createElement('div');
        hapticElement.className = 'haptic-feedback';
        hapticElement.setAttribute('aria-hidden', 'true');
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
