export class Participante {
  public id: number;
  public identificacao: string;
  public nome: string;
  public telefone: string;
  public email: string;
  public senha: string;
  public votou = false;
  constructor() {
    this.senha = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
  }
}
