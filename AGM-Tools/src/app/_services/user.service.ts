import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { User } from "../_models/user";

@Injectable({ providedIn: "root" })
export class UserService {
  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<User[]>(`localhost:4200/users`);
  }

  getById(id: number) {
    return this.http.get(`localhost:4200/users/${id}`);
  }

  register(user: User) {
    return this.http.post(`localhost:4200/users/register`, user);
  }

  update(user: User) {
    return this.http.put(`localhost:4200/users/${user.id}`, user);
  }

  delete(id: number) {
    return this.http.delete(`localhost:4200/users/${id}`);
  }
}
