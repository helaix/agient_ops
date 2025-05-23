/**
 * Long-press functionality for the tablet interface
 * Implements context menus, preview functionality, and haptic feedback
 */

class LongPressHandler {
    constructor() {
        this.longPressDelay = 500; // ms
        this.longPressTimer = null;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchThreshold = 10; // px
        this.isLongPressing = false;
        this.longPressTarget = null;
        
        // Context menu elements
        this.contextMenu = document.getElementById('context-menu');
        this.previewPanel = document.getElementById('preview-panel');
        
        // Initialize long-press handling
        this.init();
    }
    
    init() {
        // Add long-press event listeners to interactive elements
        this.addLongPressListeners('.card');
        this.addLongPressListeners('.task-item');
        this.addLongPressListeners('.node');
        
        // Setup context menu actions
        this.setupContextMenuActions();
        
        // Setup preview panel actions
        this.setupPreviewPanelActions();
        
        // Close context menu and preview panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.contextMenu.contains(e.target) && 
                this.contextMenu.style.display === 'flex') {
                this.hideContextMenu();
            }
            
            if (!this.previewPanel.contains(e.target) && 
                this.previewPanel.classList.contains('active') &&
                e.target.id !== 'close-preview') {
                this.hidePreviewPanel();
            }
        });
    }
    
    addLongPressListeners(selector) {
        const elements = document.querySelectorAll(selector);
        
        elements.forEach(element => {
            // Touch start - start long-press timer
            element.addEventListener('touchstart', (e) => {
                this.touchStartX = e.touches[0].clientX;
                this.touchStartY = e.touches[0].clientY;
                this.longPressTarget = element;
                
                this.longPressTimer = setTimeout(() => {
                    this.isLongPressing = true;
                    
                    // Trigger haptic feedback
                    this.triggerHapticFeedback('medium');
                    
                    // Show context menu or preview based on element type
                    if (element.classList.contains('task-item') || 
                        element.classList.contains('card')) {
                        this.showContextMenu(e.touches[0].clientX, e.touches[0].clientY);
                    } else if (element.classList.contains('node')) {
                        this.showPreviewPanel(element);
                    }
                }, this.longPressDelay);
            }, { passive: true });
            
            // Touch move - cancel long-press if moved too far
            element.addEventListener('touchmove', (e) => {
                if (this.longPressTimer) {
                    const touchX = e.touches[0].clientX;
                    const touchY = e.touches[0].clientY;
                    
                    // Calculate distance moved
                    const deltaX = Math.abs(touchX - this.touchStartX);
                    const deltaY = Math.abs(touchY - this.touchStartY);
                    
                    // If moved beyond threshold, cancel long-press
                    if (deltaX > this.touchThreshold || deltaY > this.touchThreshold) {
                        clearTimeout(this.longPressTimer);
                        this.longPressTimer = null;
                    }
                }
            }, { passive: true });
            
            // Touch end - cancel long-press timer
            element.addEventListener('touchend', () => {
                clearTimeout(this.longPressTimer);
                this.longPressTimer = null;
                
                // Small delay to allow click events to fire if this wasn't a long press
                setTimeout(() => {
                    this.isLongPressing = false;
                }, 10);
            }, { passive: true });
            
            // Prevent context menu from showing on right-click
            element.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                return false;
            });
        });
    }
    
    showContextMenu(x, y) {
        // Position the context menu
        this.contextMenu.style.display = 'flex';
        
        // Adjust menu position to ensure it stays within viewport
        const menuWidth = this.contextMenu.offsetWidth || 200; // Fallback width
        const menuHeight = this.contextMenu.offsetHeight || 200; // Fallback height
        
        // Check if menu would go off the right edge
        if (x + menuWidth > window.innerWidth) {
            x = window.innerWidth - menuWidth - 10;
        }
        
        // Check if menu would go off the bottom edge
        if (y + menuHeight > window.innerHeight) {
            y = window.innerHeight - menuHeight - 10;
        }
        
        this.contextMenu.style.left = `${x}px`;
        this.contextMenu.style.top = `${y}px`;
    }
    
    hideContextMenu() {
        this.contextMenu.style.display = 'none';
    }
    
    setupContextMenuActions() {
        const contextMenuItems = this.contextMenu.querySelectorAll('.context-menu-item');
        
        contextMenuItems.forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                
                // Perform action based on the clicked item
                this.performContextAction(action);
                
                // Hide the context menu
                this.hideContextMenu();
                
                // Trigger haptic feedback
                this.triggerHapticFeedback('light');
            });
        });
    }
    
    performContextAction(action) {
        if (!this.longPressTarget) return;
        
        // Get the type of element that was long-pressed
        const isCard = this.longPressTarget.classList.contains('card');
        const isTask = this.longPressTarget.classList.contains('task-item');
        const isNode = this.longPressTarget.classList.contains('node');
        
        // Perform action based on the element type and action
        switch (action) {
            case 'view':
                // Show preview panel with details
                this.showPreviewPanel(this.longPressTarget);
                break;
                
            case 'edit':
                // Simulate edit action
                console.log(`Edit action on ${isCard ? 'card' : isTask ? 'task' : 'node'}`);
                // In a real app, this would open an edit form or modal
                this.simulateAction('Editing item...');
                break;
                
            case 'duplicate':
                // Simulate duplicate action
                console.log(`Duplicate action on ${isCard ? 'card' : isTask ? 'task' : 'node'}`);
                // In a real app, this would clone the item
                this.simulateAction('Duplicating item...');
                break;
                
            case 'delete':
                // Simulate delete action
                console.log(`Delete action on ${isCard ? 'card' : isTask ? 'task' : 'node'}`);
                // In a real app, this would delete the item or show a confirmation
                this.simulateAction('Deleting item...');
                
                // Visual feedback for deletion
                this.longPressTarget.style.opacity = '0.5';
                setTimeout(() => {
                    this.longPressTarget.style.display = 'none';
                }, 500);
                break;
        }
    }
    
    showPreviewPanel(element) {
        // Get element details
        let title = '';
        let content = '';
        
        if (element.classList.contains('card')) {
            // Card preview
            title = element.querySelector('.card-title').textContent;
            content = `
                <div class="preview-item">
                    <strong>Status:</strong> ${element.querySelector('.card-status').textContent}
                </div>
                <div class="preview-item">
                    <strong>Description:</strong> ${element.querySelector('.card-content').textContent}
                </div>
                <div class="preview-item">
                    <strong>Last Activity:</strong> ${element.querySelector('.card-footer').textContent}
                </div>
            `;
        } else if (element.classList.contains('task-item')) {
            // Task preview
            title = element.querySelector('.task-title').textContent;
            content = `
                <div class="preview-item">
                    <strong>Description:</strong> ${element.querySelector('.task-description').textContent}
                </div>
                <div class="preview-item">
                    <strong>Priority:</strong> ${element.querySelector('.task-priority').textContent}
                </div>
                <div class="preview-item">
                    <strong>Due:</strong> ${element.querySelector('.task-due').textContent}
                </div>
            `;
        } else if (element.classList.contains('node')) {
            // Node preview
            title = `Node ${element.textContent.trim()}`;
            const nodeType = element.dataset.type;
            content = `
                <div class="preview-item">
                    <strong>Type:</strong> ${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)}
                </div>
                <div class="preview-item">
                    <strong>ID:</strong> ${element.id}
                </div>
                <div class="preview-item">
                    <strong>Connected to:</strong> ${this.getNodeConnections(element.id)}
                </div>
            `;
        }
        
        // Update preview panel content
        document.getElementById('preview-title').textContent = title;
        document.getElementById('preview-content').innerHTML = content;
        
        // Show the preview panel
        this.previewPanel.classList.add('active');
        
        // Trigger haptic feedback
        this.triggerHapticFeedback('light');
    }
    
    hidePreviewPanel() {
        this.previewPanel.classList.remove('active');
    }
    
    setupPreviewPanelActions() {
        // Close button
        document.getElementById('close-preview').addEventListener('click', () => {
            this.hidePreviewPanel();
            this.triggerHapticFeedback('light');
        });
        
        // Action buttons
        const previewActions = document.querySelectorAll('.preview-action');
        previewActions.forEach(action => {
            action.addEventListener('click', () => {
                const actionType = action.dataset.action;
                
                // Perform action
                if (actionType === 'open') {
                    this.simulateAction('Opening item...');
                } else if (actionType === 'edit') {
                    this.simulateAction('Editing item...');
                }
                
                // Hide the preview panel
                this.hidePreviewPanel();
                
                // Trigger haptic feedback
                this.triggerHapticFeedback('light');
            });
        });
    }
    
    getNodeConnections(nodeId) {
        // This would normally query the actual data model
        // For demo purposes, we'll return a placeholder
        return 'Node-2, Node-5, Node-8';
    }
    
    simulateAction(message) {
        // Create a toast notification
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        toast.style.position = 'fixed';
        toast.style.bottom = '100px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        toast.style.color = 'white';
        toast.style.padding = '10px 20px';
        toast.style.borderRadius = '20px';
        toast.style.zIndex = '1000';
        
        // Add to the document
        document.body.appendChild(toast);
        
        // Remove after a delay
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.5s';
            
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 500);
        }, 2000);
    }
    
    // Customizable long-press actions
    setCustomLongPressAction(selector, action) {
        const elements = document.querySelectorAll(selector);
        
        elements.forEach(element => {
            element.dataset.customAction = action;
        });
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

