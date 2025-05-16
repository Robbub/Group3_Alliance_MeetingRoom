import React from "react";
import { ToggleOption } from "../../components/ToggleOption/ToggleOption";

const SecuritySettings: React.FC = () => (
  <div>
    <h2>Security Settings</h2>
    <ToggleOption label="Enable two-factor authentication" />
    <ToggleOption label="Allow password reset via email" defaultChecked />
    <ToggleOption label="Login alerts" />
  </div>
);

export default SecuritySettings;