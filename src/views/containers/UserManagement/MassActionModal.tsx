import React from "react";
import "./MassActionModal.css";

interface MassActionModalProps {
  selectedUserIds: number[];
  onChangeRole: (role: string) => void;
  onDeleteSelected: () => void;
  onCancel: () => void;
}

const MassActionModal: React.FC<MassActionModalProps> = ({
  selectedUserIds,
  onChangeRole,
  onDeleteSelected,
  onCancel,
}) => {
  return (
    <div className="mass-action-modal">
      <span>{selectedUserIds.length} user(s) selected</span>

      <select
        className="mass-role-dropdown"
        onChange={(e) => {
          const newRole = e.target.value;
          if (newRole) onChangeRole(newRole);
        }}
      >
        <option value="">Change Role To...</option>
        <option value="Member">Member</option>
        <option value="Admin">Admin</option>
        <option value="Super Admin">Super Admin</option>
      </select>

      <button className="delete-selected-btn" onClick={onDeleteSelected}>
        Delete Selected
      </button>

      <button className="cancel-selection-btn" onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
};

export default MassActionModal;
