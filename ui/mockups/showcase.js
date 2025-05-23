// Showcase Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // View data
    const views = [
        {
            id: 'desktop-agent-detail',
            title: 'Desktop: Agent Detail View',
            description: 'This view provides detailed information and controls when focusing on a specific agent. It includes agent profile, task queue, context access, performance metrics, and command terminal sections.',
            path: 'desktop/agent-detail-view.html'
        },
        {
            id: 'desktop-command-center',
            title: 'Desktop: Command Center View',
            description: 'The desktop experience offers a comprehensive "God Mode" view inspired by RTS games with a top bar, left sidebar, main viewport, right sidebar, and bottom bar.',
            path: 'desktop/command-center-view.html'
        },
        {
            id: 'desktop-workflow',
            title: 'Desktop: Workflow Designer',
            description: 'For creating multi-agent workflows with a canvas, agent palette, connection tools, validation tools, and testing interface.',
            path: 'desktop/workflow-designer-view.html'
        },
        {
            id: 'tablet-command-center',
            title: 'Tablet: Adaptive Command Center',
            description: 'The tablet interface maintains most desktop functionality with touch-optimized controls, collapsible sidebars, and contextual toolbars.',
            path: 'tablet/command-center-view.html'
        },
        {
            id: 'tablet-navigation',
            title: 'Tablet: Navigation Patterns',
            description: 'Specialized navigation for touch interfaces with bottom tab bar, long-press actions, two-finger gestures, and swipe navigation.',
            path: 'tablet/navigation-patterns-view.html'
        },
        {
            id: 'mobile-interface',
            title: 'Mobile: Focused Interface',
            description: 'The mobile experience prioritizes essential information and actions with agent cards, status dashboard, action button, and bottom navigation.',
            path: 'mobile/focused-interface-view.html'
        },
        {
            id: 'mobile-navigation',
            title: 'Mobile: Hierarchical Navigation',
            description: 'Optimized for small screens with list to detail pattern, breadcrumb navigation, modal overlays, and pull-to-refresh.',
            path: 'mobile/hierarchical-navigation-view.html'
        }
    ];
    
    // DOM elements
    const viewSelector = document.getElementById('viewSelector');
    const viewFrame = document.getElementById('viewFrame');
    const currentViewTitle = document.getElementById('currentViewTitle');
    const currentViewDescription = document.getElementById('currentViewDescription');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    
    // Current view index
    let currentViewIndex = 0;
    
    // Initialize view
    function initView() {
        // Set initial view (first one in the array)
        updateView(currentViewIndex);
        
        // Set options in the selector
        views.forEach(view => {
            const option = document.createElement('option');
            option.value = view.id;
            option.textContent = view.title;
            viewSelector.appendChild(option);
        });
        
        // Set initial selector value
        viewSelector.value = views[currentViewIndex].id;
    }
    
    // Update view based on index
    function updateView(index) {
        const view = views[index];
        
        // Update iframe source if the view exists
        // For now, only the Agent Detail View is implemented
        if (view.id === 'desktop-agent-detail') {
            viewFrame.src = view.path;
        } else {
            // For other views that aren't implemented yet, show a placeholder
            viewFrame.src = 'about:blank';
            
            // Create a placeholder message
            const frameDoc = viewFrame.contentDocument || viewFrame.contentWindow.document;
            frameDoc.body.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: 'Segoe UI', sans-serif; color: #6c757d; text-align: center; padding: 2rem;">
                    <h2 style="margin-bottom: 1rem; color: #4a6cf7;">${view.title}</h2>
                    <p style="max-width: 600px; margin-bottom: 2rem;">${view.description}</p>
                    <div style="padding: 1rem 2rem; background-color: #f8f9fa; border-radius: 4px; font-weight: 500;">
                        This view is not yet implemented
                    </div>
                </div>
            `;
        }
        
        // Update title and description
        currentViewTitle.textContent = view.title;
        currentViewDescription.textContent = view.description;
        
        // Update selector value
        viewSelector.value = view.id;
        
        // Update navigation buttons
        prevBtn.disabled = index === 0;
        nextBtn.disabled = index === views.length - 1;
    }
    
    // Event Listeners
    
    // View selector change
    viewSelector.addEventListener('change', function() {
        const selectedId = this.value;
        const newIndex = views.findIndex(view => view.id === selectedId);
        
        if (newIndex !== -1) {
            currentViewIndex = newIndex;
            updateView(currentViewIndex);
        }
    });
    
    // Previous button
    prevBtn.addEventListener('click', function() {
        if (currentViewIndex > 0) {
            currentViewIndex--;
            updateView(currentViewIndex);
        }
    });
    
    // Next button
    nextBtn.addEventListener('click', function() {
        if (currentViewIndex < views.length - 1) {
            currentViewIndex++;
            updateView(currentViewIndex);
        }
    });
    
    // Fullscreen button
    fullscreenBtn.addEventListener('click', function() {
        const iframe = document.getElementById('viewFrame');
        
        if (iframe.requestFullscreen) {
            iframe.requestFullscreen();
        } else if (iframe.webkitRequestFullscreen) { /* Safari */
            iframe.webkitRequestFullscreen();
        } else if (iframe.msRequestFullscreen) { /* IE11 */
            iframe.msRequestFullscreen();
        }
    });
    
    // Initialize the view
    initView();
});

