export enum UserRole {
  PREMIUM = 'premium',
  BASIC = 'basic',
}

export interface UserContext {
  userId: number;
  role: UserRole;
  exp: number;
}
