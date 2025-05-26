import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstadoService } from '../../services/estado.service';
import { CadastroService, Filme, Genero } from '../../services/cadastro.services';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { Router, NavigationEnd } from '@angular/router';
import { ViewChild } from '@angular/core';
import { FilmePopupComponent } from '../../core/filme-popup/filme-popup.component'; 

interface DadosPagina {
  filmesIndicados: Filme[];
  filmesGeneros: Filme[];
  filmesTops: Filme[];
}

@Component({
  selector: 'app-indicacoes',
  standalone: true,
  imports: [CommonModule, FilmePopupComponent],
  templateUrl: './indicacoes.component.html',
  styleUrls: ['./indicacoes.component.css'],
})

export class IndicacoesComponent {
  generos: Genero[];
  filmesSelecionados: Filme[];
  idEscolha:string | undefined;
  idUser:string | undefined;

  constructor(
  private cadastroService: CadastroService,
  private movieService: ApiService,
  private router: Router,
  private estadoService: EstadoService,
  @Inject(PLATFORM_ID) private platformId: Object) {
    this.generos = this.cadastroService.generos;
    this.filmesSelecionados = this.cadastroService.filmesSelecionados;

    if (isPlatformBrowser(this.platformId)) {
      const dados = this.cadastroService.dadosCadastro;
      if (dados && dados.idUser) {
        this.idUser = dados.idUser;
      } else {
        console.warn('⚠️ dadosCadastro ou idUser está vazio.');
      }
    }
  }

  meusDados: DadosPagina | null = null;

  filmesIndicados: Filme[] = [];
  filmesGeneros: Filme[] = [];
  filmesTops: Filme[] = [];

  ngOnInit(): void {
    console.log(this.estadoService.dadosPagina)
    if (this.estadoService.dadosPagina) {
      console.log("aqui")
      this.meusDados = this.estadoService.dadosPagina as DadosPagina;
      this.filmesIndicados = this.meusDados.filmesIndicados || [];
      this.filmesTops = this.meusDados.filmesTops || [];
      this.filmesGeneros = this.meusDados.filmesGeneros || [];
    } else if (this.idUser) {
      console.log("aqui")
      this.CarregarFilmes();
    }
  }

  salvarEstado() {
    this.estadoService.dadosPagina = this.meusDados;
  }

  atualizarMeusDados() {
    this.meusDados = {
      filmesTops: this.filmesTops,
      filmesIndicados: this.filmesIndicados,
      filmesGeneros: this.filmesGeneros
    };
    this.salvarEstado();
  }

  CarregarFilmes() {
    if (!this.idUser) return;

    forkJoin({
      preferencias: this.movieService.get_preference(this.idUser),
      generos: this.movieService.get_genre_preference(this.idUser)
    }).subscribe(({ preferencias, generos }) => {
      const indicacaoFilme = preferencias[Math.floor(Math.random() * preferencias.length)]?.filme_id;
      const indicacaoGenero = generos[Math.floor(Math.random() * generos.length)]?.id_genero;

      forkJoin({
        filmesIndicados: this.movieService.get_similar(indicacaoFilme, 24),
        filmesGeneros: this.movieService.get_film_genre(indicacaoGenero, 24),
        filmesTops: this.movieService.get_film()
      }).subscribe(({ filmesIndicados, filmesGeneros,filmesTops }) => {
        this.filmesIndicados = filmesIndicados;
        this.filmesGeneros = filmesGeneros;
        this.filmesTops = filmesTops;
        this.atualizarMeusDados(); // só atualiza depois que os dois chegaram

      });
    });
  }

  perfilMatches = new Array(8);
  generoFav = new Array(8);
  recomendacaoRelaci = new Array(8);

  @ViewChild('popup', { static: false }) popupComponent!: FilmePopupComponent;
  abrirPopup(filme: any) {
    if (!filme?.id_filme_tmdb) {
      console.error('Filme inválido ou sem ID', filme);
      return;
    }
    this.popupComponent.open(filme.id_filme_tmdb.toString(), this.cadastroService.dadosCadastro);
  }

  logout(): void {
    this.cadastroService.limparDadosUsuario();
    this.router.navigate(['/login']);
  }
}
