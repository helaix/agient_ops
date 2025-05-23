/**
 * ComponentRegistry
 * 
 * A registry for managing and loading screen components dynamically.
 * This allows components to register themselves and be loaded on demand.
 */

class ComponentRegistry {
  constructor() {
    this.components = new Map();
    this.loadedComponents = new Map();
  }

  /**
   * Register a component with the registry
   * @param {string} id - Unique identifier for the component
   * @param {Function} importFn - Dynamic import function that returns a Promise resolving to the component
   * @param {Object} metadata - Additional metadata about the component
   */
  register(id, importFn, metadata = {}) {
    this.components.set(id, {
      importFn,
      metadata,
      loaded: false
    });
    return this;
  }

  /**
   * Load a component by its ID
   * @param {string} id - Component ID to load
   * @returns {Promise} - Promise resolving to the loaded component
   */
  async load(id) {
    if (!this.components.has(id)) {
      throw new Error(`Component with ID "${id}" not registered`);
    }

    const component = this.components.get(id);
    
    if (this.loadedComponents.has(id)) {
      return this.loadedComponents.get(id);
    }

    try {
      const loadedComponent = await component.importFn();
      this.loadedComponents.set(id, loadedComponent);
      component.loaded = true;
      return loadedComponent;
    } catch (error) {
      console.error(`Failed to load component "${id}":`, error);
      throw error;
    }
  }

  /**
   * Get metadata for a component
   * @param {string} id - Component ID
   * @returns {Object} - Component metadata
   */
  getMetadata(id) {
    if (!this.components.has(id)) {
      return null;
    }
    return this.components.get(id).metadata;
  }

  /**
   * Check if a component is loaded
   * @param {string} id - Component ID
   * @returns {boolean} - True if component is loaded
   */
  isLoaded(id) {
    if (!this.components.has(id)) {
      return false;
    }
    return this.components.get(id).loaded;
  }

  /**
   * Get all registered component IDs
   * @returns {Array} - Array of component IDs
   */
  getAllComponentIds() {
    return Array.from(this.components.keys());
  }

  /**
   * Get all registered components with their metadata
   * @returns {Array} - Array of components with metadata
   */
  getAllComponents() {
    return Array.from(this.components.entries()).map(([id, component]) => ({
      id,
      ...component.metadata,
      loaded: component.loaded
    }));
  }

  /**
   * Get all components matching a filter
   * @param {Function} filterFn - Filter function
   * @returns {Array} - Filtered array of components
   */
  getFilteredComponents(filterFn) {
    return this.getAllComponents().filter(filterFn);
  }
}

// Create and export a singleton instance
const componentRegistry = new ComponentRegistry();
export default componentRegistry;

