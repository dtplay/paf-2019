import { Component, ViewChild, ElementRef, ViewChildren } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UploadService } from './upload.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  //Inject the input:file as ElementRef
  //Reason is we need to access the DOM
  @ViewChild('imageFile', { static: false })
  imageFile: ElementRef;

  imageSrc = 'http://localhost:3000/search?q='

  constructor(private uploadSvc: UploadService) { }

  performUpload(form: NgForm) {
    console.info('#imageFile: ', this.imageFile.nativeElement.files);
    this.uploadSvc.upload(form, this.imageFile)
      .then(() => {
        console.info('uploaded');
        form.resetForm();
       })
      .catch(error => { console.error('upload error: ', error); });
  }

  findImage(form: NgForm) {
    this.imageSrc = 'http://localhost:3000/search?q=' + form.value['comment'];
    console.info('>>> ', this.imageSrc)
  }
}
