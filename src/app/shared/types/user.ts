export interface User {
  name: string;
  lastName: string;
  password: string;
  email: string;
  confirmEmail?: string;
  username: string;
  imageid: string | File | number;
  address: string;
  phone: string;
  country: string;
  state: string;
  city: string;
}
