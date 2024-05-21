export interface User {
  id?: number;
  name: string;
  lastName: string;
  password: string;
  email: string;
  confirmEmail?: string;
  username: string;
  imageid: string | File | number;
  image?: { contentUrl: string };
  address: string;
  phone: string;
  country: string;
  state: string;
}

export interface Token {
  id?: number;
  value: string;
  expiryDate?: Date;
  userId: number;
}
