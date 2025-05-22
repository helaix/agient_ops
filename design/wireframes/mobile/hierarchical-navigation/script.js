// Mobile Hierarchical Navigation Implementation

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const listView = document.getElementById('list-view');
    const detailView = document.getElementById('detail-view');
    const modalOverlay = document.getElementById('modal-overlay');
    const agentCards = document.querySelectorAll('.agent-card');
    const backButton = document.querySelector('.back-button');
    const modalCancelButton = document.getElementById('modal-cancel');
    const actionButtons = document.querySelectorAll('.action-button');
    const contentContainer = document.querySelector('.content-container');
    const pullToRefresh = document.querySelector('.pull-to-refresh');
    const pullArrow = document.querySelector('.pull-arrow');
    const pullText = document.querySelector('.pull-text');
    const lastUpdated = document.querySelector('.last-updated');
    
    // State variables
    let currentView = 'list';
    let pullStartY = 0;
    let pullMoveY = 0;
    let isPulling = false;
    let isRefreshing = false;
    let pullThreshold = 80;
    let currentAgent = null;
    
    // ===== List → Detail Pattern Implementation =====
    
    // Navigate to detail view when an agent card is clicked
    agentCards.forEach(card => {
        card.addEventListener('click', function() {
            const agentId = this.getAttribute('data-agent-id');
            const agentName = this.querySelector('.agent-name').textContent;
            
            // Update breadcrumb
            document.querySelector('.breadcrumb-item.current').textContent = agentName;
            
            // Update detail view header
            detailView.querySelector('.header-title').textContent = agentName;
            
            // Update agent profile
            detailView.querySelector('.agent-title').textContent = agentName;
            
            // Store current agent
            currentAgent = agentId;
            
            // Show detail view with animation
            listView.classList.add('hidden');
            detailView.classList.remove('hidden');
            currentView = 'detail';
            
            // Simulate loading agent details
            simulateLoading();
        });
    });
    
    // Navigate back to list view
    backButton.addEventListener('click', function() {
        detailView.classList.add('hidden');
        listView.classList.remove('hidden');
        currentView = 'list';
    });
    
    // ===== Breadcrumb Navigation Implementation =====
    
    // Make breadcrumb items clickable
    document.querySelectorAll('.breadcrumb-item').forEach(item => {
        item.addEventListener('click', function() {
            if (!this.classList.contains('current')) {
                // Navigate back to list view if a parent breadcrumb is clicked
                detailView.classList.add('hidden');
                listView.classList.remove('hidden');
                currentView = 'list';
            }
        });
    });
    
    // ===== Modal Overlays Implementation =====
    
    // Show modal when action buttons are clicked
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            modalOverlay.classList.remove('hidden');
        });
    });
    
    // Close modal when cancel button is clicked
    modalCancelButton.addEventListener('click', function() {
        modalOverlay.classList.add('hidden');
    });
    
    // Close modal when clicking outside the modal
    modalOverlay.addEventListener('click', function(event) {
        if (event.target === modalOverlay) {
            modalOverlay.classList.add('hidden');
        }
    });
    
    // ===== Pull-to-Refresh Implementation =====
    
    // Touch start event
    contentContainer.addEventListener('touchstart', function(e) {
        if (isRefreshing) return;
        
        const touchY = e.touches[0].clientY;
        
        // Only enable pull-to-refresh when at the top of the content
        if (contentContainer.scrollTop === 0) {
            pullStartY = touchY;
            isPulling = true;
        }
    });
    
    // Touch move event
    contentContainer.addEventListener('touchmove', function(e) {
        if (!isPulling || isRefreshing) return;
        
        pullMoveY = e.touches[0].clientY;
        let pullDistance = pullMoveY - pullStartY;
        
        // Restrict pull distance and apply resistance
        if (pullDistance > 0) {
            pullDistance = Math.min(pullDistance * 0.5, pullThreshold * 1.5);
            
            // Update pull-to-refresh indicator
            pullToRefresh.style.transform = `translateY(${pullDistance}px)`;
            
            // Rotate arrow based on pull distance
            const rotationDegree = Math.min(180, (pullDistance / pullThreshold) * 180);
            pullArrow.style.transform = `rotate(${rotationDegree}deg)`;
            
            // Update text when threshold is reached
            if (pullDistance >= pullThreshold) {
                pullText.textContent = 'Release to refresh';
            } else {
                pullText.textContent = 'Pull to refresh';
            }
            
            // Prevent default scrolling behavior
            e.preventDefault();
        }
    });
    
    // Touch end event
    contentContainer.addEventListener('touchend', function() {
        if (!isPulling || isRefreshing) return;
        
        const pullDistance = pullMoveY - pullStartY;
        
        if (pullDistance >= pullThreshold) {
            // Start refresh
            startRefresh();
        } else {
            // Reset pull-to-refresh indicator
            resetPullToRefresh();
        }
        
        isPulling = false;
    });
    
    // Start refresh animation and data loading
    function startRefresh() {
        isRefreshing = true;
        
        // Update UI to show refreshing state
        pullText.textContent = 'Refreshing...';
        pullArrow.innerHTML = '<i class="fas fa-sync-alt"></i>';
        pullArrow.style.transform = 'rotate(0deg)';
        pullArrow.querySelector('i').style.animation = 'spin 1s infinite linear';
        
        // Simulate network request
        setTimeout(function() {
            // Update data
            updateData();
            
            // Reset pull-to-refresh indicator with a delay
            setTimeout(resetPullToRefresh, 300);
            
            // Update last updated timestamp
            lastUpdated.textContent = 'Last updated: Just now';
            
            isRefreshing = false;
        }, 1500);
    }
    
    // Reset pull-to-refresh indicator
    function resetPullToRefresh() {
        pullToRefresh.style.transform = 'translateY(0)';
        pullArrow.style.transform = 'rotate(0deg)';
        pullText.textContent = 'Pull to refresh';
        
        // Reset animation
        if (pullArrow.querySelector('i')) {
            pullArrow.querySelector('i').style.animation = '';
        }
        
        // Reset to original icon
        setTimeout(function() {
            pullArrow.innerHTML = '<i class="fas fa-arrow-down"></i>';
        }, 300);
    }
    
    // Update data after refresh
    function updateData() {
        // In a real app, this would fetch new data from an API
        // For this demo, we'll just simulate some changes
        
        // Update agent statuses
        const assistantCard = document.querySelector('[data-agent-id="assistant"]');
        const dataCard = document.querySelector('[data-agent-id="data"]');
        
        if (assistantCard) {
            // Update Assistant Agent status
            assistantCard.querySelector('.status-indicator').className = 'status-indicator active';
            assistantCard.querySelector('.agent-task').textContent = 'Task completed';
            assistantCard.querySelector('.agent-priority').className = 'agent-priority none';
            assistantCard.querySelector('.agent-priority').textContent = 'Priority: None';
        }
        
        if (dataCard) {
            // Update Data Analysis Agent status
            dataCard.querySelector('.status-indicator').className = 'status-indicator active';
            dataCard.querySelector('.agent-task').textContent = 'Starting data processing';
            dataCard.querySelector('.agent-priority').className = 'agent-priority medium';
            dataCard.querySelector('.agent-priority').textContent = 'Priority: Medium';
        }
        
        // Add animation to show changes
        const updatedCards = [assistantCard, dataCard];
        updatedCards.forEach(card => {
            if (card) {
                card.style.animation = 'fadeIn 0.5s';
                setTimeout(() => {
                    card.style.animation = '';
                }, 500);
            }
        });
    }
    
    // Simulate loading agent details
    function simulateLoading() {
        // In a real app, this would fetch agent details from an API
        // For this demo, we'll just simulate loading with a slight delay
        
        const detailSections = detailView.querySelectorAll('.detail-section');
        
        // Hide sections initially
        detailSections.forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
        });
        
        // Show sections with staggered animation
        detailSections.forEach((section, index) => {
            setTimeout(() => {
                section.style.transition = 'opacity 0.3s, transform 0.3s';
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }, 100 + (index * 100));
        });
    }
    
    // ===== Additional Mobile Interactions =====
    
    // Swipe to go back
    let touchStartX = 0;
    let touchEndX = 0;
    
    detailView.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
    });
    
    detailView.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].clientX;
        handleSwipeGesture();
    });
    
    function handleSwipeGesture() {
        const swipeThreshold = 100;
        
        // Right swipe (to go back)
        if (currentView === 'detail' && touchEndX - touchStartX > swipeThreshold) {
            detailView.classList.add('hidden');
            listView.classList.remove('hidden');
            currentView = 'list';
        }
    }
    
    // Long press on agent cards for quick actions
    agentCards.forEach(card => {
        let longPressTimer;
        
        card.addEventListener('touchstart', function() {
            longPressTimer = setTimeout(() => {
                modalOverlay.classList.remove('hidden');
            }, 800);
        });
        
        card.addEventListener('touchend', function() {
            clearTimeout(longPressTimer);
        });
        
        card.addEventListener('touchmove', function() {
            clearTimeout(longPressTimer);
        });
    });
    
    // ===== Accessibility Enhancements =====
    
    // Add keyboard navigation support
    document.addEventListener('keydown', function(e) {
        // ESC key to close modal
        if (e.key === 'Escape' && !modalOverlay.classList.contains('hidden')) {
            modalOverlay.classList.add('hidden');
        }
        
        // Backspace or left arrow to go back
        if ((e.key === 'Backspace' || e.key === 'ArrowLeft') && currentView === 'detail') {
            detailView.classList.add('hidden');
            listView.classList.remove('hidden');
            currentView = 'list';
        }
    });
    
    // Add ARIA attributes for screen readers
    function enhanceAccessibility() {
        // Update ARIA attributes based on current view
        if (currentView === 'list') {
            listView.setAttribute('aria-hidden', 'false');
            detailView.setAttribute('aria-hidden', 'true');
        } else {
            listView.setAttribute('aria-hidden', 'true');
            detailView.setAttribute('aria-hidden', 'false');
        }
        
        // Set modal dialog role
        document.querySelector('.modal-container').setAttribute('role', 'dialog');
        document.querySelector('.modal-container').setAttribute('aria-modal', 'true');
        
        // Announce view changes
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('class', 'sr-only');
        document.body.appendChild(liveRegion);
        
        // Function to announce view changes
        window.announceViewChange = function(message) {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 3000);
        };
    }
    
    // Initialize accessibility enhancements
    enhanceAccessibility();
    
    // Update accessibility attributes when view changes
    function updateAccessibility() {
        if (currentView === 'list') {
            window.announceViewChange('Showing agent list view');
        } else {
            window.announceViewChange(`Showing details for ${currentAgent} agent`);
        }
        
        enhanceAccessibility();
    }
    
    // ===== Responsive Behavior =====
    
    // Handle orientation changes
    window.addEventListener('resize', function() {
        // Adjust UI based on orientation
        const isLandscape = window.innerWidth > window.innerHeight;
        
        if (isLandscape) {
            // Optimize layout for landscape mode
            document.body.classList.add('landscape');
        } else {
            document.body.classList.remove('landscape');
        }
    });
    
    // Initialize orientation check
    if (window.innerWidth > window.innerHeight) {
        document.body.classList.add('landscape');
    }
});

