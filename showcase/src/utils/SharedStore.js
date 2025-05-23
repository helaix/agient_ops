/**
 * SharedStore
 * 
 * A simple shared state store for global state management.
 * Components can access and update shared state through this store.
 */

import eventBus from './EventBus';

class SharedStore {
  constructor() {
    this.state = {
      // Global application state
      activeScreen: null,
      selectedScreens: [],
      comparisonMode: false,
      deviceType: 'all',
      viewMode: 'grid',
      
      // Component states
      componentStates: new Map(),
      
      // Shared data models
      agents: [],
      tasks: [],
      workflows: [],
      contexts: []
    };
  }

  /**
   * Get the current state
   * @returns {Object} - Current state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Update the state
   * @param {Object} newState - New state to merge with current state
   * @param {boolean} notify - Whether to notify subscribers of the change
   */
  setState(newState, notify = true) {
    const oldState = { ...this.state };
    this.state = {
      ...this.state,
      ...newState
    };
    
    if (notify) {
      eventBus.publish('store:stateChanged', {
        oldState,
        newState: this.state
      });
    }
  }

  /**
   * Get component state
   * @param {string} componentId - Component ID
   * @returns {Object} - Component state
   */
  getComponentState(componentId) {
    if (!this.state.componentStates.has(componentId)) {
      return null;
    }
    return { ...this.state.componentStates.get(componentId) };
  }

  /**
   * Set component state
   * @param {string} componentId - Component ID
   * @param {Object} state - Component state
   * @param {boolean} notify - Whether to notify subscribers of the change
   */
  setComponentState(componentId, state, notify = true) {
    const oldState = this.getComponentState(componentId);
    const newState = {
      ...oldState,
      ...state
    };
    
    this.state.componentStates.set(componentId, newState);
    
    if (notify) {
      eventBus.publish(`component:${componentId}:stateChanged`, {
        oldState,
        newState
      });
    }
  }

  /**
   * Reset the store to its initial state
   */
  reset() {
    this.state = {
      activeScreen: null,
      selectedScreens: [],
      comparisonMode: false,
      deviceType: 'all',
      viewMode: 'grid',
      componentStates: new Map(),
      agents: [],
      tasks: [],
      workflows: [],
      contexts: []
    };
    
    eventBus.publish('store:reset', null);
  }
}

// Create and export a singleton instance
const sharedStore = new SharedStore();
export default sharedStore;

