export interface IUser {
  username: string;
  email: string;
  role: "staff" | "cashier" | "manager";
  token?: string;
  password: string;
  confirmPassword: string | undefined;
}

export interface IUserInfo {
  username: string;
  email: string;
  role: string;
  token?: string;
}

export interface IUserMethods {
  correctPassword(
    enteredPassword: string,
    userPassword: string
  ): Promise<boolean>;
}
