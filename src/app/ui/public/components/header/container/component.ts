import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'public-header',
  templateUrl: './component.html',
  styleUrls: ['./component.css'],
  imports: [MatToolbarModule, MatButtonModule, RouterLink],
})
export class HeaderPublicComponent { }
