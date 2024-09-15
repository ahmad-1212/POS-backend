export interface UserLoginDto {
  email: string;
  password: string;
}

export interface UserRegisterDto {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}
