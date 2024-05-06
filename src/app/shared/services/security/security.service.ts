import { Injectable } from '@angular/core';
import { environment } from 'environments/development';
import * as CryptoJS from 'crypto-js';

function splitEncryptedText(encryptedText: string) {
  return {
    ivString: encryptedText.slice(0, 32),
    encryptedDataString: encryptedText.slice(32),
  };
}

@Injectable({
  providedIn: 'root',
})
export default class Security {
  private key: any = environment.CRYPTO_KEY;

  encrypt(text: any) {
    return CryptoJS.AES.encrypt(text, this.key).toString();
  }

  decrypt(encryptedBase64: any) {
    const decrypted = CryptoJS.AES.decrypt(encryptedBase64, this.key);
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
}
