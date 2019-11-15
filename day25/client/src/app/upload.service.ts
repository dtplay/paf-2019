import { Injectable, ElementRef } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';

@Injectable()
export class UploadService {

  constructor(private http: HttpClient) { }

  upload(form: NgForm, fileRef: ElementRef): Promise<any> {
    // multipart/form-data
    const formData = new FormData();
    // normal non file files
    formData.set('comments', form.value['comments']);
    // file
    formData.set('myImage', fileRef.nativeElement.files[0]);

    return (
      this.http.post<any>('http://localhost:3000/upload', formData)
        .toPromise()
    );
  }

}
