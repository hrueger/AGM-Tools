import { Pipe, PipeTransform } from "@angular/core";

import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";

@Pipe({
    name: "secureRequest",
  })
  export class SecureRequestPipe implements PipeTransform {

    constructor(
      private http: HttpClient,
    ) {}

    public async transform(src: string): Promise<string> {
        try {
          const imageBlob = await this.http.get(`${environment.apiUrl}${src}`, {responseType: "blob"}).toPromise();
          const reader = new FileReader();
          return new Promise((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(imageBlob);
          });
        } catch (e) {
            return "assets/loading.gif";
        }
      }

  }
