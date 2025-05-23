import React from 'react';
import { FiX } from 'react-icons/fi';

interface KeyboardShortcutsHelpProps {
  onClose: () => void;
}

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ onClose }) => {
  const shortcuts = [
    { key: 'Delete / Backspace', description: 'Delete selected node or connection' },
    { key: 'G', description: 'Toggle grid layout' },
    { key: 'T', description: 'Toggle testing panel' },
    { key: '?', description: 'Show/hide keyboard shortcuts' },
    { key: 'Escape', description: 'Cancel connection, close panels, or deselect' },
    { key: 'Ctrl+Z / ⌘+Z', description: 'Undo (not implemented)' },
    { key: 'Ctrl+Y / ⌘+Y', description: 'Redo (not implemented)' },
    { key: 'Ctrl+S / ⌘+S', description: 'Save workflow (not implemented)' },
    { key: 'Ctrl+O / ⌘+O', description: 'Open workflow (not implemented)' },
    { key: 'Ctrl+N / ⌘+N', description: 'New workflow (not implemented)' },
    { key: 'Alt+[1-9]', description: 'Quick add agent from palette' },
    { key: 'Mouse Wheel', description: 'Zoom in/out' },
    { key: 'Ctrl+Mouse Drag / ⌘+Mouse Drag', description: 'Pan canvas' },
  ];

  return (
    <div className="keyboard-shortcuts-help">
      <div className="keyboard-shortcuts-header">
        <h3>Keyboard Shortcuts</h3>
        <button className="btn-icon" onClick={onClose}>
          <FiX />
        </button>
      </div>
      
      <div className="keyboard-shortcuts-content">
        <table className="shortcuts-table">
          <thead>
            <tr>
              <th>Shortcut</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {shortcuts.map((shortcut, index) => (
              <tr key={index}>
                <td className="shortcut-key">{shortcut.key}</td>
                <td className="shortcut-description">{shortcut.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="keyboard-shortcuts-footer">
        <p>
          These shortcuts are designed to enhance productivity when designing workflows.
          Additional shortcuts will be added in future updates.
        </p>
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp;

