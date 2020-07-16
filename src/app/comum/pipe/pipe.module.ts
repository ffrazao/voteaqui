import { NgModule } from '@angular/core';
import { CallbackPipe } from './callback.pipe';

@NgModule({
  declarations: [
    CallbackPipe,
  ],
  exports: [
    CallbackPipe,
  ],
})
export class PipeModule { }
