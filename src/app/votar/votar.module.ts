import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from './../material/material.module';

import { VotarRoutingModule } from './votar-routing.module';
import { VotarComponent } from './votar.component';
import { VotarService } from './votar.service';
import { VotarResolver } from './votar.resolver';


@NgModule({
  declarations: [VotarComponent],
  imports: [
    CommonModule,
    MaterialModule,
    VotarRoutingModule,
  ],
  providers: [
    VotarService,
    VotarResolver,
  ]
})
export class VotarModule { }
