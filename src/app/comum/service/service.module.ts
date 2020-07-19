import { MensagemModule } from './mensagem/mensagem.module';
import { NgModule } from '@angular/core';

@NgModule({
  exports: [
    MensagemModule
  ],
})
export class ServiceModule { }
