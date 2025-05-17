import React from "react";
import { ToggleOption } from "../../components/ToggleOption/ToggleOption";

const AccountSettings: React.FC = () => (
  <div>
    <h2>Account Settings</h2>
    <ToggleOption label="Enable email notifications" />
    <ToggleOption label="Show profile publicly" defaultChecked />
    <ToggleOption label="Enable dark mode" />
  </div>
);

export default AccountSettings;