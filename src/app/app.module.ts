// import { BrowserModule } from '@angular/platform-browser';
// import { NgModule } from '@angular/core';
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { FormsModule } from '@angular/forms';
// import { HttpClientModule } from '@angular/common/http';

// import { AppComponent } from './app.component';
// import { RebalanceRowComponent } from './rebalance-row.component';

// @NgModule({
//   declarations: [AppComponent, RebalanceRowComponent],
//   imports: [BrowserModule, FormsModule, HttpClientModule, NgbModule.forRoot()],
//   providers: [],
//   bootstrap: [AppComponent],
// })
// export class AppModule {}




import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { RebalanceRowComponent } from './rebalance-row.component';

@NgModule({
  declarations: [
    AppComponent,
    RebalanceRowComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    NgbModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
