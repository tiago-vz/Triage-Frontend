import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LoginRequest, LoginResponse, RegisterRequest,
  UsuarioSesion, JwtPayload, SuccessResponse
} from '../models';
import { Rol } from '../models';

const TOKEN_KEY = 'triagre_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  // Señales reactivas (Angular 17+): toda la app reacciona automáticamente
  private _token = signal<string | null>(this.loadToken());
  private _usuario = signal<UsuarioSesion | null>(this.parseToken(this.loadToken()));

  readonly token = this._token.asReadonly();
  readonly usuario = this._usuario.asReadonly();
  readonly isAuthenticated = computed(() => this._token() !== null);
  readonly isCoordinador = computed(() => this._usuario()?.rol === Rol.COORDINADOR);
  readonly isGestor = computed(() => this._usuario()?.rol === Rol.COORDINADOR || this._usuario()?.rol === Rol.ADMINISTRATIVO);
  readonly rol = computed(() => this._usuario()?.rol ?? null);

  constructor(private http: HttpClient, private router: Router) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => this.setSession(response.token))
    );
  }

  register(request: RegisterRequest): Observable<SuccessResponse<void>> {
    return this.http.post<SuccessResponse<void>>(`${this.apiUrl}/register`, request);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this._token.set(null);
    this._usuario.set(null);
    this.router.navigate(['/auth/login']);
  }

  private setSession(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this._token.set(token);
    this._usuario.set(this.parseToken(token));
  }

  private loadToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  // Decodifica el JWT sin librería externa
  private parseToken(token: string | null): UsuarioSesion | null {
    if (!token) return null;
    try {
      const payload: JwtPayload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem(TOKEN_KEY);
        return null;
      }
      return {
        email: payload.sub,
        rol: payload.rol as Rol,
        nombre: payload.nombre ?? payload.sub,
      };
    } catch {
      return null;
    }
  }
}
