import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'sidebar-splitter',
    templateUrl: './sidebar-splitter.component.html',
    styleUrls: ['./sidebar-splitter.component.scss'],
    standalone: false,
})
export class SidebarSplitterComponent {
  @Input()
  public isOpen = true;

  @Output() public toggle = new EventEmitter<boolean>();

  public toggleOpen() {
    this.toggle.emit();
  }
}
