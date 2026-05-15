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

export interface HasFirstName {
  firstName: string;
}
export interface HasLastName {
  lastName: string;
}
export interface HasUsername {
  username: string;
}
export interface HasEmail {
  email: string;
}
export interface HasBio {
  bio: string;
}
export interface HasPrivate {
  is_private: boolean;
}