import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';

import { MensagemService } from './mensagem.service';
import { ConfirmeComponent } from './confirme.component';
import {
  MatSnackBarModule
} from '@angular/material/snack-bar';

@NgModule({
  declarations: [ConfirmeComponent],
  imports: [
    CommonModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  providers: [MensagemService]
})
export class MensagemModule { }
