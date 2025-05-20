export type Role = "user" | "admin" | "super admin";

export interface User {
  username: string;
  role: Role;
}
