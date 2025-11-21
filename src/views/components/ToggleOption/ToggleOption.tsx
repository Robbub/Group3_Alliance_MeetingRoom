import React, { useState } from "react";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";

interface ToggleOptionProps {
  label: string;
  defaultChecked?: boolean;
}

export const ToggleOption: React.FC<ToggleOptionProps> = ({ label, defaultChecked = false }) => {
  const [enabled, setEnabled] = useState(defaultChecked);

  return (
    <FormControlLabel
      control={
        <Switch
          checked={enabled}
          onChange={() => setEnabled(!enabled)}
          color="primary"
        />
      }
      label={label}
      sx={{ marginBottom: 2 }}
    />
  );
};