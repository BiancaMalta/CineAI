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
  
    this.movieService.get_avaliacoes_usuario(Number(this.idUser)).subscribe((avaliacoes) => {
      console.log('Avaliações recebidas:', avaliacoes);
      
      if (!avaliacoes.length) {
        this.filmesAvaliados = [];
        this.atualizarMeusDados();
        return;
      }
  
      // Remove duplicatas baseado no filme_id, mantendo apenas a avaliação mais recente
      const avaliacoesUnicas = avaliacoes.reduce((acc: any[], avaliacao: any) => {
        const existente = acc.find(item => item.filme_id === avaliacao.filme_id);
        
        if (!existente) {
          // Se não existe, adiciona
          acc.push(avaliacao);
        } else {
          // Se existe, verifica qual é mais recente (assumindo que tem data ou id maior)
          if (avaliacao.id > existente.id || 
              (avaliacao.data_avaliacao && avaliacao.data_avaliacao > existente.data_avaliacao)) {
            // Substitui pelo mais recente
            const index = acc.findIndex(item => item.filme_id === avaliacao.filme_id);
            acc[index] = avaliacao;
          }
        }
        
        return acc;
      }, []);
  
      console.log('Avaliações únicas:', avaliacoesUnicas);
  
      // Extrai apenas os IDs únicos dos filmes
      const filmesIds = avaliacoesUnicas.map((avaliacao: any) => avaliacao.filme_id.toString());
      
      // Faz uma única requisição com todos os IDs
      if (filmesIds.length > 0) {
        // Se a API suporta busca por múltiplos IDs
        if (this.movieService.get_films_by_ids) {
          this.movieService.get_films_by_ids(filmesIds).subscribe((filmes: Filme[]) => {
            this.filmesAvaliados = filmes;
            this.atualizarMeusDados();
          });
        } else {
          // Fallback: múltiplas requisições individuais com forkJoin
          const requests: Observable<Filme>[] = filmesIds.map(id =>
            this.movieService.get_film_by_id(id)
          );
          
          forkJoin(requests).subscribe((filmes: Filme[]) => {
            this.filmesAvaliados = filmes.filter(filme => filme !== null); // Remove possíveis null
            this.atualizarMeusDados();
          });
        }
      } else {
        this.filmesAvaliados = [];
        this.atualizarMeusDados();
      }
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
