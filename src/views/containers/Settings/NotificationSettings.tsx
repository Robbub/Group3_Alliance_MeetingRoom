import React from "react";
import { ToggleOption } from "../../components/ToggleOption/ToggleOption";

const NotificationSettings: React.FC = () => (
  <div>
    <h2>Notification Settings</h2>
    <ToggleOption label="Email notifications" defaultChecked />
    <ToggleOption label="SMS notifications" />
    <ToggleOption label="Push notifications" />
  </div>
);

export default NotificationSettings;