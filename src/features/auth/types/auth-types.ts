export type AuthSession =
  | {
      authenticated: true;
      user: {
        id: string;
        email: string;
        username: string;
        profileImgUrl?: string | null;
        hasPassword?: boolean;
      };
    }
  | {
      authenticated: false;
      user: null;
    };

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  affiliateCode?: string;
}

export interface RegisterResult {
  verificationToken: string;
}

export interface VerifyEmailPayload {
  verificationToken: string;
  code: string;
}
