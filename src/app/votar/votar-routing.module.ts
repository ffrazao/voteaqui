import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VotarComponent } from './votar.component';
import { VotarResolver } from './votar.resolver';

const routes: Routes = [{
  path: '',
  component: VotarComponent,
  resolve: { identificacao: VotarResolver },
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VotarRoutingModule { }
