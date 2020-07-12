export class Votante {
  public id: string;
  public nome: string;
  public contato: string;
  public senha: string;
  public votou = false;
  constructor() {
    this.senha = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
  }
}
