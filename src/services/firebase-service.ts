import { AuthService } from './auth-service';
import { autoinject, newInstance } from 'aurelia-framework';
import { HttpClient, json } from 'aurelia-fetch-client';
import { environment } from 'environment';
import firebase from 'firebase/app';

const http = new HttpClient();

export type UploadType = 'passport' | 'selfie';

@autoinject()
export class FirebaseService {
    constructor(private auth: AuthService) {
        http.configure(config => {
            config
                .useStandardConfiguration()
                .withBaseUrl(environment.FIREBASE_API)
                .withInterceptor({
                    request: async (request: Request): Promise<Request> => {
                        request.headers.append('authorization', await this.auth.getIdToken());

                        return request;
                    }
                })
        });
    }

    async uploadFile(file: File, type: UploadType) {
        const formData = new FormData();

        formData.append('document', file);
        formData.append('type', type);

        const res = await http.fetch(`uploadDocument`, {
            method: 'POST',
            body: formData,
            headers: new Headers()
        });

        const response = await res.json();

        return response;
    }

    async getIdToken() {
        return firebase.auth().currentUser.getIdToken();
    }

    async getUserAuthMemo(username: string) {
        const res = await http.fetch(`getUserAuthMemo/${username}/`);
        const obj = await res.json();

        return obj.memo;
    }

    async verifyUserAuthMemo(username, signedKey) {
        const res = await http.fetch('verifyUserAuthMemo/', {
            method: 'POST',
            body: json({
                username,
                signedKey
            })
        });

        const obj = await res.json();

        return obj.token;
    }
}