export interface RegisterFormType {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  repeatPassword: string;
}

export interface LoginFormType {
  username: string;
  password: string;
}

export interface EditProfileFormType {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  bio: string;
  is_private: boolean;
}
