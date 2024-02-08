export enum Roles {
  User = 'User',
  Admin = 'Admin',
}

export type JwtUSer = {
  sub: number;
  name: string;
  role: Roles;
};

export class AuthorizedUser {
  id: number;
  name: string;
  role: Roles;

  isAdmin = () => {
    return this.role === Roles.Admin;
  };

  constructor(data: JwtUSer) {
    this.id = data.sub;
    this.name = data.name;
    this.role = data.role;
  }
}
