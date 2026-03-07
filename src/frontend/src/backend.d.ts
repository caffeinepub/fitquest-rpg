import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Profile {
    age: bigint;
    fitnessGoal: Type;
    displayName: string;
    heightCm: bigint;
    weightKg: bigint;
    skillLevel: Type__1;
    avatarChoice: bigint;
}
export enum Type {
    gainMuscle = "gainMuscle",
    general = "general",
    endurance = "endurance",
    loseWeight = "loseWeight"
}
export enum Type__1 {
    intermediate = "intermediate",
    beginner = "beginner",
    advanced = "advanced"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<Profile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<Profile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: Profile): Promise<void>;
}
