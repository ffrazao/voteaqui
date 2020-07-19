import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from './../material/material.module';

import { CedulaRoutingModule } from './cedula-routing.module';
import { CedulaComponent } from './cedula.component';
import { CedulaService } from './cedula.service';
import { CedulaResolver } from './cedula.resolver';
import { PipeModule } from '../comum/pipe/pipe.module';
import { ConfirmarVotoComponent } from './confirmar-voto/confirmar-voto.component';


@NgModule({
  declarations: [
    CedulaComponent,
    ConfirmarVotoComponent,
    ConfirmarVotoComponent,
  ],
  imports: [
    CommonModule,
    CedulaRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    PipeModule,
    MatDialogModule,
  ],
  providers: [
    CedulaService,
    CedulaResolver,
  ],
  entryComponents: [
    ConfirmarVotoComponent,
  ]
})
export class CedulaModule { }
