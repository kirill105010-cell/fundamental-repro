import { Component, AfterContentChecked } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent implements AfterContentChecked {

  isOpen = false;
  isRightColumnHidden = false;

  ngAfterContentChecked(): void {
    console.log('ngAfterContentChecked');
  }

  openPopover(): void {
    this.isOpen = true;
  }

  closePopover(): void {
    this.isOpen = false;
  }

  toggleRightColumn(): void {
    this.isRightColumnHidden = !this.isRightColumnHidden;
  }

}
