/**
 * Priority Management
 * 
 * This module implements a visual system for managing priorities:
 * - Color coding: Red (urgent), Orange (high), Yellow (medium), Green (low)
 * - Size variation in spatial views
 * - Position-based priority in list views
 */

const PriorityManagement = (function() {
    // Priority levels
    const PRIORITY_LEVELS = {
        URGENT: 3,
        HIGH: 2,
        MEDIUM: 1,
        LOW: 0,
        NONE: -1
    };
    
    // Priority colors
    const PRIORITY_COLORS = {
        [PRIORITY_LEVELS.URGENT]: '#e74c3c', // Red
        [PRIORITY_LEVELS.HIGH]: '#f39c12',   // Orange
        [PRIORITY_LEVELS.MEDIUM]: '#f1c40f', // Yellow
        [PRIORITY_LEVELS.LOW]: '#2ecc71',    // Green
        [PRIORITY_LEVELS.NONE]: '#bdc3c7'    // Light Gray
    };
    
    // Priority labels
    const PRIORITY_LABELS = {
        [PRIORITY_LEVELS.URGENT]: 'Urgent',
        [PRIORITY_LEVELS.HIGH]: 'High',
        [PRIORITY_LEVELS.MEDIUM]: 'Medium',
        [PRIORITY_LEVELS.LOW]: 'Low',
        [PRIORITY_LEVELS.NONE]: 'None'
    };
    
    // Priority icons (for accessibility)
    const PRIORITY_ICONS = {
        [PRIORITY_LEVELS.URGENT]: '🔴',
        [PRIORITY_LEVELS.HIGH]: '🟠',
        [PRIORITY_LEVELS.MEDIUM]: '🟡',
        [PRIORITY_LEVELS.LOW]: '🟢',
        [PRIORITY_LEVELS.NONE]: '⚪'
    };
    
    /**
     * Get priority color for a priority level
     * @param {number} priorityLevel - The priority level
     * @returns {string} The color for the priority level
     */
    function getPriorityColor(priorityLevel) {
        return PRIORITY_COLORS[priorityLevel] || PRIORITY_COLORS[PRIORITY_LEVELS.NONE];
    }
    
    /**
     * Get priority label for a priority level
     * @param {number} priorityLevel - The priority level
     * @returns {string} The label for the priority level
     */
    function getPriorityLabel(priorityLevel) {
        return PRIORITY_LABELS[priorityLevel] || PRIORITY_LABELS[PRIORITY_LEVELS.NONE];
    }
    
    /**
     * Get priority icon for a priority level
     * @param {number} priorityLevel - The priority level
     * @returns {string} The icon for the priority level
     */
    function getPriorityIcon(priorityLevel) {
        return PRIORITY_ICONS[priorityLevel] || PRIORITY_ICONS[PRIORITY_LEVELS.NONE];
    }
    
    /**
     * Get CSS class for a priority level
     * @param {number} priorityLevel - The priority level
     * @returns {string} The CSS class for the priority level
     */
    function getPriorityClass(priorityLevel) {
        const label = PRIORITY_LABELS[priorityLevel]?.toLowerCase() || 'none';
        return `priority-${label}`;
    }
    
    /**
     * Create a priority indicator element
     * @param {number} priorityLevel - The priority level
     * @param {boolean} includeLabel - Whether to include the label
     * @returns {HTMLElement} The priority indicator element
     */
    function createPriorityIndicator(priorityLevel, includeLabel = false) {
        const indicator = document.createElement('div');
        indicator.className = `priority-indicator ${getPriorityClass(priorityLevel)}`;
        
        if (includeLabel) {
            const label = document.createElement('span');
            label.className = 'priority-label';
            label.textContent = getPriorityLabel(priorityLevel);
            indicator.appendChild(label);
        }
        
        // Add aria label for accessibility
        indicator.setAttribute('aria-label', `Priority: ${getPriorityLabel(priorityLevel)}`);
        
        return indicator;
    }
    
    /**
     * Sort items by priority (highest to lowest)
     * @param {Array} items - Array of items with priority property
     * @returns {Array} Sorted array of items
     */
    function sortByPriority(items) {
        return [...items].sort((a, b) => {
            // Handle undefined priorities
            const priorityA = typeof a.priority === 'number' ? a.priority : PRIORITY_LEVELS.NONE;
            const priorityB = typeof b.priority === 'number' ? b.priority : PRIORITY_LEVELS.NONE;
            
            // Sort by priority (highest to lowest)
            return priorityB - priorityA;
        });
    }
    
    /**
     * Get size multiplier based on priority (for spatial views)
     * @param {number} priorityLevel - The priority level
     * @param {number} baseSize - The base size
     * @param {number} maxMultiplier - The maximum size multiplier
     * @returns {number} The size adjusted for priority
     */
    function getSizeByPriority(priorityLevel, baseSize = 1, maxMultiplier = 1.5) {
        // Calculate multiplier based on priority level
        // NONE = 1x, LOW = 1.1x, MEDIUM = 1.2x, HIGH = 1.3x, URGENT = 1.5x
        const multiplier = 1 + ((priorityLevel + 1) / 10) * maxMultiplier;
        
        return baseSize * multiplier;
    }
    
    /**
     * Apply priority styling to an element
     * @param {HTMLElement} element - The element to style
     * @param {number} priorityLevel - The priority level
     * @param {object} options - Styling options
     */
    function applyPriorityStyles(element, priorityLevel, options = {}) {
        const {
            applyColor = true,
            applyBorder = false,
            applySize = false,
            baseSize = null,
            maxSizeMultiplier = 1.5
        } = options;
        
        // Apply priority class
        element.classList.add(getPriorityClass(priorityLevel));
        
        // Apply color
        if (applyColor) {
            element.style.setProperty('--priority-color', getPriorityColor(priorityLevel));
        }
        
        // Apply border
        if (applyBorder) {
            element.style.borderColor = getPriorityColor(priorityLevel);
        }
        
        // Apply size
        if (applySize && baseSize) {
            const size = getSizeByPriority(priorityLevel, baseSize, maxSizeMultiplier);
            element.style.width = `${size}px`;
            element.style.height = `${size}px`;
        }
    }
    
    /**
     * Create a priority selector element
     * @param {number} currentPriority - The current priority level
     * @param {function} onChange - Callback function when priority changes
     * @returns {HTMLElement} The priority selector element
     */
    function createPrioritySelector(currentPriority, onChange) {
        const container = document.createElement('div');
        container.className = 'priority-selector';
        
        // Create label
        const label = document.createElement('label');
        label.textContent = 'Priority:';
        label.setAttribute('for', 'priority-select');
        container.appendChild(label);
        
        // Create select element
        const select = document.createElement('select');
        select.id = 'priority-select';
        select.className = 'priority-select';
        
        // Add options for each priority level
        for (const level in PRIORITY_LEVELS) {
            if (level !== 'NONE') { // Exclude NONE from selectable options
                const value = PRIORITY_LEVELS[level];
                const option = document.createElement('option');
                option.value = value;
                option.textContent = PRIORITY_LABELS[value];
                
                // Set selected option
                if (value === currentPriority) {
                    option.selected = true;
                }
                
                select.appendChild(option);
            }
        }
        
        // Add change event listener
        select.addEventListener('change', function() {
            const newPriority = parseInt(this.value, 10);
            
            if (typeof onChange === 'function') {
                onChange(newPriority);
            }
            
            // Update the select element's class
            select.className = `priority-select ${getPriorityClass(newPriority)}`;
        });
        
        // Set initial class
        select.className = `priority-select ${getPriorityClass(currentPriority)}`;
        
        container.appendChild(select);
        
        return container;
    }
    
    /**
     * Create a visual priority legend
     * @returns {HTMLElement} The priority legend element
     */
    function createPriorityLegend() {
        const legend = document.createElement('div');
        legend.className = 'priority-legend';
        
        const title = document.createElement('h4');
        title.textContent = 'Priority Levels';
        legend.appendChild(title);
        
        const list = document.createElement('ul');
        list.className = 'priority-legend-list';
        
        // Create legend items for each priority level
        for (const level in PRIORITY_LEVELS) {
            if (level !== 'NONE') { // Exclude NONE from legend
                const value = PRIORITY_LEVELS[level];
                const item = document.createElement('li');
                item.className = 'priority-legend-item';
                
                const indicator = document.createElement('span');
                indicator.className = `priority-indicator ${getPriorityClass(value)}`;
                
                const label = document.createElement('span');
                label.textContent = PRIORITY_LABELS[value];
                
                item.appendChild(indicator);
                item.appendChild(label);
                list.appendChild(item);
            }
        }
        
        legend.appendChild(list);
        
        return legend;
    }
    
    // Public API
    return {
        PRIORITY_LEVELS: PRIORITY_LEVELS,
        PRIORITY_COLORS: PRIORITY_COLORS,
        PRIORITY_LABELS: PRIORITY_LABELS,
        PRIORITY_ICONS: PRIORITY_ICONS,
        
        getPriorityColor: getPriorityColor,
        getPriorityLabel: getPriorityLabel,
        getPriorityIcon: getPriorityIcon,
        getPriorityClass: getPriorityClass,
        
        createPriorityIndicator: createPriorityIndicator,
        sortByPriority: sortByPriority,
        getSizeByPriority: getSizeByPriority,
        applyPriorityStyles: applyPriorityStyles,
        
        createPrioritySelector: createPrioritySelector,
        createPriorityLegend: createPriorityLegend
    };
})();

