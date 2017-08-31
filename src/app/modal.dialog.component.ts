import {Component} from '@angular/core';

@Component({
  selector: 'app-modal-dialog',
  templateUrl: './modal.dialog.component.html'
})
export class ModalDialogComponent {
  content: string;
  destroyButton: string;
  positiveButton: string;
  cancelButton: string;
  constructor(
    // public dialogRef: MdDialogRef<ModalDialogComponent>
  ) { }
}
