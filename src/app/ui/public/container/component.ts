// POO
// PersonaEstudiante Objeto Entidad Clase
// Atributos caracteristicas
// (Nombre: string, Apellido: string, Edad: number, Sexo: string, Correo: string, Telefono: string, Direccion: string)
// Metodos Comportamiento (Estudiar, Dormir, Comer, Jugar, Leer, Escribir, Correr, Caminar)
// estudiar( nombre: string, tema: string ): retroalimentacion: 80
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderPublicComponent } from '../components/header/container/component';

@Component({
  selector: 'public',
  templateUrl: './component.html',
  styleUrls: ['./component.css'],
  imports: [RouterOutlet, HeaderPublicComponent],
})
export class PublicComponent { }
