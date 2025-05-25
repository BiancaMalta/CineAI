import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstadoService } from '../../services/estado.service';
import { CadastroService, Filme, Genero } from '../../services/cadastro.services';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, forkJoin } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { Router, NavigationEnd } from '@angular/router';
import { ViewChild } from '@angular/core';
import { FilmePopupComponent } from '../../core/filme-popup/filme-popup.component'; 

interface DadosPagina {
  filmesIndicados: Filme[];
  filmesGeneros: Filme[];
  filmesTops: Filme[];
  filmesAvaliados: Filme[];
}

interface PreferenciaFilme {
  filme_id: number;
  usuario_id: number;
}

@Component({
  selector: 'app-avaliacoes',
  standalone: true,
  imports: [CommonModule, FilmePopupComponent],
  templateUrl: './avaliacoes.component.html',
  styleUrls: ['./avaliacoes.component.css'],
})

export class AvaliacoesComponent {
  generos: Genero[];
  filmesSelecionados: Filme[];
  idEscolha:string | undefined;
  idUser:string | undefined;
  

    constructor(
      private cadastroService: CadastroService,
      private movieService: ApiService,
      private router: Router,
      private estadoService: EstadoService,
      @Inject(PLATFORM_ID) private platformId: Object
    ) {
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
    filmesAvaliados: Filme[] = [];

  ngOnInit(): void {
    console.log(this.estadoService.dadosPagina)
    if (this.estadoService.dadosPagina) {
      console.log("aqui")
      this.meusDados = this.estadoService.dadosPagina as DadosPagina;
      this.filmesIndicados = this.meusDados.filmesIndicados || [];
      this.filmesTops = this.meusDados.filmesTops || [];
      this.filmesGeneros = this.meusDados.filmesGeneros || [];
      this.filmesAvaliados = this.meusDados.filmesAvaliados || [];
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
    filmesGeneros: this.filmesGeneros,
    filmesAvaliados: this.filmesAvaliados,
  };
  this.salvarEstado();
}

CarregarFilmes() {
  if (!this.idUser) return;

  this.movieService.get_avaliacoes_usuario(Number(this.idUser)).subscribe((avaliacoes) => {
    console.log('Avaliações recebidas:', avaliacoes);

    if (!avaliacoes.length) {
      this.filmesAvaliados = [];
      return;
    }

    const request: Observable<Filme>[] = avaliacoes.map((avaliacao: any) =>
      this.movieService.get_film_by_id(avaliacao.filme_id.toString())
    );

    forkJoin(request).subscribe((filmes: Filme[]) => {
      this.filmesAvaliados = filmes;
      this.atualizarMeusDados();
    });
  });
}

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
