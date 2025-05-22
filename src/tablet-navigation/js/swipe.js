/**
 * Swipe functionality for the tablet interface
 * Implements swipe navigation, swipe actions on list items, and swipe to reveal options
 */

class SwipeHandler {
    constructor() {
        this.swipeThreshold = 100; // px
        this.swipeTimeThreshold = 300; // ms
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchStartTime = 0;
        this.swipeTarget = null;
        this.isHorizontalSwipe = false;
        this.swipeLeftIndicator = document.querySelector('.swipe-left-indicator');
        this.swipeRightIndicator = document.querySelector('.swipe-right-indicator');
        
        // Initialize swipe handling
        this.init();
    }
    
    init() {
        // Add swipe event listeners to list items
        this.addSwipeListeners('.task-item');
        
        // Add swipe event listeners to cards
        this.addSwipeListeners('.card');
        
        // Setup swipe indicators
        this.setupSwipeIndicators();
    }
    
    addSwipeListeners(selector) {
        const elements = document.querySelectorAll(selector);
        
        elements.forEach(element => {
            // Touch start - record initial position and time
            element.addEventListener('touchstart', (e) => {
                this.touchStartX = e.touches[0].clientX;
                this.touchStartY = e.touches[0].clientY;
                this.touchStartTime = Date.now();
                this.swipeTarget = element;
                this.isHorizontalSwipe = false;
                
                // Reset element transform
                element.style.transform = 'translateX(0)';
                element.style.transition = 'none';
            }, { passive: true });
            
            // Touch move - determine if horizontal swipe and update element position
            element.addEventListener('touchmove', (e) => {
                if (!this.swipeTarget) return;
                
                const touchX = e.touches[0].clientX;
                const touchY = e.touches[0].clientY;
                
                // Calculate distance moved
                const deltaX = touchX - this.touchStartX;
                const deltaY = Math.abs(touchY - this.touchStartY);
                
                // If vertical movement is significant, this is not a horizontal swipe
                if (!this.isHorizontalSwipe && deltaY > 30) {
                    return;
                }
                
                // If horizontal movement is significant, mark as horizontal swipe
                if (Math.abs(deltaX) > 10 && deltaY < 30) {
                    this.isHorizontalSwipe = true;
                    
                    // Prevent default to avoid page scrolling
                    e.preventDefault();
                }
                
                // If this is a horizontal swipe, update element position
                if (this.isHorizontalSwipe) {
                    // Apply resistance to make swiping feel more natural
                    const resistance = 0.5;
                    const translateX = deltaX * resistance;
                    
                    // Update element position
                    element.style.transform = `translateX(${translateX}px)`;
                    
                    // Show appropriate swipe indicator
                    this.updateSwipeIndicators(deltaX);
                }
            }, { passive: false });
            
            // Touch end - determine if swipe action should be triggered
            element.addEventListener('touchend', (e) => {
                if (!this.swipeTarget || !this.isHorizontalSwipe) return;
                
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndTime = Date.now();
                
                // Calculate swipe distance and duration
                const deltaX = touchEndX - this.touchStartX;
                const deltaTime = touchEndTime - this.touchStartTime;
                
                // Reset swipe indicators
                this.resetSwipeIndicators();
                
                // Add transition for smooth return animation
                element.style.transition = 'transform 0.3s ease-out';
                
                // If swipe distance is greater than threshold or swipe was fast enough
                if (Math.abs(deltaX) > this.swipeThreshold || 
                    (Math.abs(deltaX) > 50 && deltaTime < this.swipeTimeThreshold)) {
                    
                    // Determine swipe direction
                    const isSwipeLeft = deltaX < 0;
                    
                    // Perform swipe action
                    this.performSwipeAction(isSwipeLeft);
                } else {
                    // Reset element position
                    element.style.transform = 'translateX(0)';
                }
                
                // Reset swipe state
                this.isHorizontalSwipe = false;
            }, { passive: true });
        });
    }
    
    setupSwipeIndicators() {
        // Make sure the swipe indicators container is visible
        const swipeIndicators = document.querySelector('.swipe-indicators');
        if (swipeIndicators) {
            swipeIndicators.style.display = 'block';
        }
    }
    
    updateSwipeIndicators(deltaX) {
        if (!this.swipeLeftIndicator || !this.swipeRightIndicator) return;
        
        // Show left or right indicator based on swipe direction
        if (deltaX < -50) {
            this.swipeLeftIndicator.classList.add('active');
            this.swipeRightIndicator.classList.remove('active');
        } else if (deltaX > 50) {
            this.swipeRightIndicator.classList.add('active');
            this.swipeLeftIndicator.classList.remove('active');
        } else {
            this.resetSwipeIndicators();
        }
    }
    
    resetSwipeIndicators() {
        if (!this.swipeLeftIndicator || !this.swipeRightIndicator) return;
        
        this.swipeLeftIndicator.classList.remove('active');
        this.swipeRightIndicator.classList.remove('active');
    }
    
    performSwipeAction(isSwipeLeft) {
        if (!this.swipeTarget) return;
        
        // Get the type of element that was swiped
        const isTask = this.swipeTarget.classList.contains('task-item');
        const isCard = this.swipeTarget.classList.contains('card');
        
        // Complete the swipe animation
        const swipeDistance = isSwipeLeft ? -100 : 100;
        this.swipeTarget.style.transform = `translateX(${swipeDistance}%)`;
        
        // Trigger haptic feedback
        this.triggerHapticFeedback('medium');
        
        // Perform action based on the element type and swipe direction
        setTimeout(() => {
            if (isTask) {
                if (isSwipeLeft) {
                    // Swipe left on task - archive
                    this.simulateAction('Task archived');
                } else {
                    // Swipe right on task - complete
                    this.simulateAction('Task completed');
                    this.swipeTarget.style.backgroundColor = 'rgba(40, 167, 69, 0.2)';
                }
            } else if (isCard) {
                if (isSwipeLeft) {
                    // Swipe left on card - disable
                    this.simulateAction('Agent disabled');
                    this.swipeTarget.style.opacity = '0.5';
                } else {
                    // Swipe right on card - activate
                    this.simulateAction('Agent activated');
                    this.swipeTarget.querySelector('.card-status').textContent = 'Active';
                    this.swipeTarget.querySelector('.card-status').className = 'card-status active';
                }
            }
            
            // Reset element position after a delay
            setTimeout(() => {
                this.swipeTarget.style.transform = 'translateX(0)';
            }, 300);
        }, 300);
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
    
    // Swipe to reveal additional options
    setupSwipeToReveal(selector) {
        const elements = document.querySelectorAll(selector);
        
        elements.forEach(element => {
            // Create options container
            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'swipe-options';
            optionsContainer.style.position = 'absolute';
            optionsContainer.style.right = '0';
            optionsContainer.style.top = '0';
            optionsContainer.style.height = '100%';
            optionsContainer.style.display = 'flex';
            optionsContainer.style.transform = 'translateX(100%)';
            
            // Add options
            const option1 = document.createElement('div');
            option1.className = 'swipe-option';
            option1.innerHTML = '<i class="fas fa-edit"></i>';
            option1.style.backgroundColor = 'var(--primary-color)';
            
            const option2 = document.createElement('div');
            option2.className = 'swipe-option';
            option2.innerHTML = '<i class="fas fa-trash"></i>';
            option2.style.backgroundColor = 'var(--danger-color)';
            
            // Add options to container
            optionsContainer.appendChild(option1);
            optionsContainer.appendChild(option2);
            
            // Add container to element
            element.style.position = 'relative';
            element.style.overflow = 'hidden';
            element.appendChild(optionsContainer);
            
            // Add event listeners for option buttons
            option1.addEventListener('click', () => {
                this.simulateAction('Edit option selected');
                this.triggerHapticFeedback('light');
            });
            
            option2.addEventListener('click', () => {
                this.simulateAction('Delete option selected');
                this.triggerHapticFeedback('light');
            });
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

