import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-votar',
  templateUrl: './votar.component.html',
  styleUrls: ['./votar.component.scss']
})
export class VotarComponent implements OnInit {

  private identificacao: string;

  constructor(
    private route: ActivatedRoute
  ) {

  }

  ngOnInit(): void {
    this.route.data.subscribe((v) => console.log(v));
  }

}
