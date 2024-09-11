import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { getAuth } from 'firebase-admin/auth';

@Injectable()
export class AuthService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async registerUserWithEmailAndPassword(credentials) {
    getAuth().createUser({});
  }
}
