import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [{
  path: 'config',
  loadChildren: () => import('./config/config.module').then(m => m.ConfigModule)
},
{
  path: ':id',
  loadChildren: () => import('./votar/votar.module').then(m => m.VotarModule)
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
