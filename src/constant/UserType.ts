export type Role = "user" | "admin" | "super admin";

export interface User {
  id: number;
  userId: string;
  username: string;
  role: Role;
  email?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
}