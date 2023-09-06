import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { CategoriesComponent } from './categories/categories.component';
import { LandingPageRoutingModule } from './landing-page-routing.module';
import { AuthenticationModule } from '../authentication/authentication.module';

@NgModule({
  declarations: [HomeComponent, CategoriesComponent],
  imports: [
    CommonModule,
    LandingPageRoutingModule,
    AuthenticationModule
  ],
  exports: [HomeComponent, CategoriesComponent]
})
export class LandingPageModule { }
