import React from "react";
import { ToggleOption } from "../../components/ToggleOption/ToggleOption";

const AppearanceSettings: React.FC = () => (
  <div>
    <h2>Appearance Settings</h2>
    <ToggleOption label="Enable dark mode" />
    <ToggleOption label="Use system theme" defaultChecked />
    <ToggleOption label="Large text" />
  </div>
);

export default AppearanceSettings;