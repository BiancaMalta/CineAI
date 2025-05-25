import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private url = 'https://cineai-njbu.onrender.com/usuarios/registrar'; // URL da sua API

  constructor(private http: HttpClient) {}
  //logar conseguir token e id do usuario
  login(email: string, senha: string): Observable<any> {
    const body = { email, senha};
    return this.http.post<any>('https://cineai-njbu.onrender.com/usuarios/login', body);
  }

  //registrar um novo usuario
  registrar(nome:string,email: string, senha: string): Observable<any> {
    const body = { nome, email, senha };
    return this.http.post<any>(this.url, body);
  }
  //pegar filmes filtrados por generos
  get_filme_genre(genre_id:string , limit:string): Observable<any> {
    return this.http.get<any>(`https://cineai-njbu.onrender.com/movies/genre/${genre_id}?limit=${limit}`);
  }
  //guarda as preferencias do usuario através do id
  put_preference(usuario_id:string , filme_id:string): Observable<any> {
    const body = { usuario_id, filme_id };
    return this.http.post<any>(`https://cineai-njbu.onrender.com/movies/preferencia`,body);
  }
  put_genre_preference(usuario_id:string , genero_id:string): Observable<any> {
    const body = { usuario_id, genero_id };
    return this.http.post<any>(`https://cineai-njbu.onrender.com/movies/genero/preferencia`,body);
  }
  //pegas as preferencias do usuario
  get_preference(user_id:string): Observable<any> {
    return this.http.get<any>(`https://cineai-njbu.onrender.com/preferencias/${user_id}`);
  }
    //pegas as preferencias do usuario
  get_genre_preference(user_id:string): Observable<any> {
    return this.http.get<any>(`https://cineai-njbu.onrender.com/preferencias/genero/${user_id}`);
  }
  //pega um filme similar de acordo com o id de um filme
  get_similar(filme_id:number, limit:number): Observable<any> {
    return this.http.get<any>(`https://cineai-njbu.onrender.com/movies/${filme_id}/similar?limit=${limit}`);
  }
  //pegar filme por genero
  get_film_genre(genre_id:number, limit:number): Observable<any> {
    return this.http.get<any>(`https://cineai-njbu.onrender.com/movies/genre/${genre_id}?limit=${limit}`);
  }
    //pegar filme por genero
  get_film(): Observable<any> {
    return this.http.get<any>(`https://cineai-njbu.onrender.com/movies?limit=24`);
  }
    //pegar filme por genero
  get_film_name(filme_nome:string): Observable<any> {
    return this.http.get<any>(`https://cineai-njbu.onrender.com/movies/name/${filme_nome}`);
  }

  //pegar filme por id
  get_film_by_id(filme_id:string): Observable<any> {
    return this.http.get<any>(`https://cineai-njbu.onrender.com/movies/${filme_id}`);
  }

  //pegar avaliações do filme
  get_rates(filme_id:string): Observable<any> {
    return this.http.get<any>(`https://cineai-njbu.onrender.com/movies/${filme_id}/avaliacoes`);
  }

  //atualizar avaliações do filme
  post_rate_user(filme_id: string, usuario_id: string, nota: number, comentario: string): Observable<any> {
    const body = {usuario_id: usuario_id, nota: nota, comentario: comentario};

    return this.http.post<any>(`https://cineai-njbu.onrender.com/movies/${filme_id}/avaliar`, body);
  }

  // buscar todas as avaliações de um usuário
  get_avaliacoes_usuario(user_id: number): Observable<any> {
    return this.http.get<any>(`https://cineai-njbu.onrender.com/usuarios/${user_id}/avaliacoes`);
  }
  
}
