import { Pauta } from './pauta';
import { Votante } from './votante';

export class Votacao {
  public id: number;
  public codigo: string;
  public nome: string;
  public descricao: string;
  public senha: string;
  public inicio: string;
  public termino: string;
  public pautaLista: Pauta[] = [];
  public votanteLista: Votante[] = [];
}
