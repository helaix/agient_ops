/**
 * Command Input Component
 * 
 * This component implements the unified command input interface that adapts
 * to different device form factors while maintaining consistent functionality.
 */

const CommandInputComponent = (function() {
    // DOM elements
    let containerElement = null;
    let inputElement = null;
    let suggestionsElement = null;
    let historyElement = null;
    
    // Component state
    let isInitialized = false;
    let isSuggestionsVisible = false;
    let currentSuggestions = [];
    let selectedSuggestionIndex = -1;
    
    /**
     * Initialize the command input component
     * @param {HTMLElement} container - The container element
     */
    function init(container) {
        if (isInitialized) {
            return;
        }
        
        containerElement = container;
        
        // Create component structure based on device type
        createComponentStructure();
        
        // Set up event listeners
        setupEventListeners();
        
        isInitialized = true;
        
        // Listen for device changes
        window.addEventListener('devicechange', function(event) {
            // Rebuild component when device changes
            createComponentStructure();
        });
    }
    
    /**
     * Create the component structure based on device type
     */
    function createComponentStructure() {
        // Clear container
        containerElement.innerHTML = '';
        
        // Get device info
        const deviceInfo = DeviceDetection.getDeviceInfo();
        
        // Create command input
        const inputContainer = document.createElement('div');
        inputContainer.className = 'command-input';
        
        // Create input element
        inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.className = 'command-input-field';
        inputElement.placeholder = '@agent action parameters';
        inputElement.setAttribute('aria-label', 'Command input');
        inputElement.setAttribute('autocomplete', 'off');
        inputElement.setAttribute('spellcheck', 'false');
        
        // Add device-specific classes
        if (deviceInfo.type === DeviceDetection.DEVICE_TYPES.DESKTOP) {
            inputContainer.classList.add('command-input-desktop');
        } else if (deviceInfo.type === DeviceDetection.DEVICE_TYPES.TABLET) {
            inputContainer.classList.add('command-input-tablet');
        } else {
            inputContainer.classList.add('command-input-mobile');
        }
        
        // Add voice input button for touch devices
        if (deviceInfo.touchEnabled) {
            const voiceButton = document.createElement('button');
            voiceButton.className = 'voice-input-button';
            voiceButton.setAttribute('aria-label', 'Voice input');
            voiceButton.textContent = '🎤';
            
            voiceButton.addEventListener('click', function() {
                startVoiceInput();
            });
            
            inputContainer.appendChild(voiceButton);
        }
        
        inputContainer.appendChild(inputElement);
        containerElement.appendChild(inputContainer);
        
        // Create suggestions element
        suggestionsElement = document.createElement('div');
        suggestionsElement.className = 'command-suggestions';
        containerElement.appendChild(suggestionsElement);
        
        // Create command history section
        historyElement = document.createElement('div');
        historyElement.className = 'command-history';
        
        const historyTitle = document.createElement('div');
        historyTitle.className = 'command-history-title';
        historyTitle.textContent = 'Recent Commands';
        historyElement.appendChild(historyTitle);
        
        const historyList = document.createElement('ul');
        historyList.className = 'command-history-list';
        
        // Get command history
        const commandHistory = CommandLanguage.getCommandHistory();
        
        commandHistory.forEach(command => {
            const historyItem = document.createElement('li');
            historyItem.className = 'command-history-item';
            historyItem.textContent = command.command;
            
            historyItem.addEventListener('click', function() {
                setInputValue(command.command);
                inputElement.focus();
            });
            
            historyList.appendChild(historyItem);
        });
        
        historyElement.appendChild(historyList);
        
        // Only show history on desktop by default
        if (deviceInfo.type === DeviceDetection.DEVICE_TYPES.DESKTOP) {
            containerElement.appendChild(historyElement);
        }
        
        // Add command templates section for tablet and mobile
        if (deviceInfo.type !== DeviceDetection.DEVICE_TYPES.DESKTOP) {
            const templatesElement = document.createElement('div');
            templatesElement.className = 'command-templates';
            
            const templatesTitle = document.createElement('div');
            templatesTitle.className = 'command-templates-title';
            templatesTitle.textContent = 'Command Templates';
            templatesElement.appendChild(templatesTitle);
            
            const templatesList = document.createElement('div');
            templatesList.className = 'command-templates-list';
            
            // Get command templates
            const commandTemplates = CommandLanguage.getCommandTemplates();
            
            commandTemplates.forEach(template => {
                const templateItem = document.createElement('div');
                templateItem.className = 'command-template-item';
                
                const templateTitle = document.createElement('div');
                templateTitle.className = 'command-template-title';
                templateTitle.textContent = template.description;
                templateItem.appendChild(templateTitle);
                
                const templatePattern = document.createElement('div');
                templatePattern.className = 'command-template-pattern';
                templatePattern.textContent = template.template;
                templateItem.appendChild(templatePattern);
                
                // Add example if available
                if (template.examples && template.examples.length > 0) {
                    const templateExample = document.createElement('div');
                    templateExample.className = 'command-template-example';
                    templateExample.textContent = `Example: ${template.examples[0]}`;
                    
                    templateExample.addEventListener('click', function() {
                        setInputValue(template.examples[0]);
                        inputElement.focus();
                    });
                    
                    templateItem.appendChild(templateExample);
                }
                
                templatesList.appendChild(templateItem);
            });
            
            templatesElement.appendChild(templatesList);
            containerElement.appendChild(templatesElement);
        }
    }
    
    /**
     * Set up event listeners
     */
    function setupEventListeners() {
        // Input event for suggestions
        inputElement.addEventListener('input', function() {
            updateSuggestions();
        });
        
        // Focus event to show suggestions
        inputElement.addEventListener('focus', function() {
            if (inputElement.value) {
                updateSuggestions();
            }
        });
        
        // Blur event to hide suggestions (with delay to allow clicking on suggestions)
        inputElement.addEventListener('blur', function() {
            setTimeout(function() {
                hideSuggestions();
            }, 200);
        });
        
        // Key events for navigation and execution
        inputElement.addEventListener('keydown', function(event) {
            switch (event.key) {
                case 'ArrowUp':
                    // Navigate up in suggestions
                    if (isSuggestionsVisible && currentSuggestions.length > 0) {
                        event.preventDefault();
                        navigateSuggestions(-1);
                    }
                    break;
                case 'ArrowDown':
                    // Navigate down in suggestions
                    if (isSuggestionsVisible && currentSuggestions.length > 0) {
                        event.preventDefault();
                        navigateSuggestions(1);
                    }
                    break;
                case 'Tab':
                    // Complete with selected suggestion
                    if (isSuggestionsVisible && currentSuggestions.length > 0 && selectedSuggestionIndex >= 0) {
                        event.preventDefault();
                        completeSuggestion(selectedSuggestionIndex);
                    }
                    break;
                case 'Enter':
                    // Execute command
                    if (inputElement.value.trim()) {
                        event.preventDefault();
                        executeCommand();
                    }
                    break;
                case 'Escape':
                    // Hide suggestions
                    if (isSuggestionsVisible) {
                        event.preventDefault();
                        hideSuggestions();
                    }
                    break;
            }
        });
        
        // Listen for data changes
        DataModel.addEventListener('dataChange', function(event) {
            // Update command history when commands change
            if (event.type === 'commands') {
                updateCommandHistory();
            }
        });
    }
    
    /**
     * Update suggestions based on current input
     */
    function updateSuggestions() {
        const input = inputElement.value;
        
        // Get suggestions from command language
        currentSuggestions = CommandLanguage.getSuggestions(input);
        
        // Clear suggestions element
        suggestionsElement.innerHTML = '';
        
        // If no suggestions, hide suggestions element
        if (currentSuggestions.length === 0) {
            hideSuggestions();
            return;
        }
        
        // Create suggestion elements
        currentSuggestions.forEach((suggestion, index) => {
            const suggestionElement = document.createElement('div');
            suggestionElement.className = 'command-suggestion';
            suggestionElement.textContent = suggestion.display;
            suggestionElement.dataset.index = index;
            
            // Add type-specific class
            suggestionElement.classList.add(`suggestion-type-${suggestion.type}`);
            
            // Add click handler
            suggestionElement.addEventListener('click', function() {
                completeSuggestion(index);
            });
            
            suggestionsElement.appendChild(suggestionElement);
        });
        
        // Show suggestions
        showSuggestions();
        
        // Reset selected suggestion
        selectedSuggestionIndex = -1;
    }
    
    /**
     * Show suggestions element
     */
    function showSuggestions() {
        suggestionsElement.style.display = 'block';
        isSuggestionsVisible = true;
    }
    
    /**
     * Hide suggestions element
     */
    function hideSuggestions() {
        suggestionsElement.style.display = 'none';
        isSuggestionsVisible = false;
        selectedSuggestionIndex = -1;
    }
    
    /**
     * Navigate through suggestions
     * @param {number} direction - Direction to navigate (1 for down, -1 for up)
     */
    function navigateSuggestions(direction) {
        // Calculate new index
        let newIndex = selectedSuggestionIndex + direction;
        
        // Wrap around
        if (newIndex < 0) {
            newIndex = currentSuggestions.length - 1;
        } else if (newIndex >= currentSuggestions.length) {
            newIndex = 0;
        }
        
        // Update selected suggestion
        selectedSuggestionIndex = newIndex;
        
        // Update UI
        const suggestionElements = suggestionsElement.querySelectorAll('.command-suggestion');
        
        suggestionElements.forEach((element, index) => {
            if (index === selectedSuggestionIndex) {
                element.classList.add('selected');
            } else {
                element.classList.remove('selected');
            }
        });
    }
    
    /**
     * Complete input with selected suggestion
     * @param {number} index - Index of the suggestion to complete with
     */
    function completeSuggestion(index) {
        if (index >= 0 && index < currentSuggestions.length) {
            const suggestion = currentSuggestions[index];
            setInputValue(suggestion.complete);
            hideSuggestions();
            inputElement.focus();
        }
    }
    
    /**
     * Set input value and position cursor at the end
     * @param {string} value - Value to set
     */
    function setInputValue(value) {
        inputElement.value = value;
        
        // Position cursor at the end
        setTimeout(function() {
            inputElement.selectionStart = inputElement.selectionEnd = value.length;
        }, 0);
    }
    
    /**
     * Execute the current command
     */
    function executeCommand() {
        const commandString = inputElement.value.trim();
        
        if (!commandString) {
            return;
        }
        
        // Parse command
        const command = CommandLanguage.parseCommand(commandString);
        
        // Validate command
        const validation = CommandLanguage.validateCommand(command);
        
        if (!validation.isValid) {
            // Show error
            NotificationSystem.showNotification({
                title: 'Invalid Command',
                message: validation.message,
                type: NotificationSystem.NOTIFICATION_TYPES.ERROR,
                autoClose: true
            });
            return;
        }
        
        // Execute command
        CommandLanguage.executeCommand(command)
            .then(result => {
                // Show success
                NotificationSystem.showNotification({
                    title: 'Command Executed',
                    message: result.result,
                    type: NotificationSystem.NOTIFICATION_TYPES.SUCCESS,
                    autoClose: true
                });
                
                // Clear input
                inputElement.value = '';
                
                // Update command history
                updateCommandHistory();
            })
            .catch(error => {
                // Show error
                NotificationSystem.showNotification({
                    title: 'Command Error',
                    message: error.message,
                    type: NotificationSystem.NOTIFICATION_TYPES.ERROR,
                    autoClose: true
                });
            });
    }
    
    /**
     * Update command history display
     */
    function updateCommandHistory() {
        // Get history list element
        const historyList = historyElement.querySelector('.command-history-list');
        
        if (!historyList) {
            return;
        }
        
        // Clear list
        historyList.innerHTML = '';
        
        // Get command history
        const commandHistory = CommandLanguage.getCommandHistory();
        
        // Create history items
        commandHistory.forEach(command => {
            const historyItem = document.createElement('li');
            historyItem.className = 'command-history-item';
            historyItem.textContent = command.command;
            
            historyItem.addEventListener('click', function() {
                setInputValue(command.command);
                inputElement.focus();
            });
            
            historyList.appendChild(historyItem);
        });
    }
    
    /**
     * Start voice input (if supported)
     */
    function startVoiceInput() {
        // Check if SpeechRecognition is available
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            NotificationSystem.showNotification({
                title: 'Voice Input Not Supported',
                message: 'Your browser does not support voice input.',
                type: NotificationSystem.NOTIFICATION_TYPES.ERROR,
                autoClose: true
            });
            return;
        }
        
        // Create recognition instance
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        
        // Show listening indicator
        const voiceIndicator = document.createElement('div');
        voiceIndicator.className = 'voice-input-indicator';
        voiceIndicator.textContent = 'Listening...';
        containerElement.appendChild(voiceIndicator);
        
        // Start recognition
        recognition.start();
        
        // Handle result
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            
            // Format as command if needed
            let command = transcript;
            
            // If doesn't start with @, try to extract agent and action
            if (!command.startsWith('@')) {
                const words = command.split(' ');
                
                if (words.length >= 2) {
                    // Assume first word is agent and second is action
                    command = `@${words[0]} ${words[1]} ${words.slice(2).join(' ')}`;
                }
            }
            
            // Set input value
            setInputValue(command);
            
            // Remove indicator
            containerElement.removeChild(voiceIndicator);
        };
        
        // Handle errors
        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            
            // Remove indicator
            if (voiceIndicator.parentNode) {
                containerElement.removeChild(voiceIndicator);
            }
            
            // Show error
            NotificationSystem.showNotification({
                title: 'Voice Input Error',
                message: `Error: ${event.error}`,
                type: NotificationSystem.NOTIFICATION_TYPES.ERROR,
                autoClose: true
            });
        };
        
        // Handle end
        recognition.onend = function() {
            // Remove indicator if still present
            if (voiceIndicator.parentNode) {
                containerElement.removeChild(voiceIndicator);
            }
        };
    }
    
    /**
     * Focus the command input
     */
    function focus() {
        if (inputElement) {
            inputElement.focus();
        }
    }
    
    /**
     * Clear the command input
     */
    function clear() {
        if (inputElement) {
            inputElement.value = '';
        }
    }
    
    // Public API
    return {
        init: init,
        focus: focus,
        clear: clear,
        executeCommand: executeCommand
    };
})();

