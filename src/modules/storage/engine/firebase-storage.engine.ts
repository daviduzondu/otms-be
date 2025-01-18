import { StorageEngine } from 'multer';
import * as path from 'path';
import e from 'express';
import { FirebaseService } from '../../firebase/firebase.service';
import { addYears } from 'date-fns';
import { CustomException } from '../../../exceptions/custom.exception';
import { HttpStatus } from '@nestjs/common';

interface FirebaseStorageOptions {
  destination: string;
}

export class FirebaseStorageEngine implements StorageEngine {
  private readonly destination: string;
  private bucket: any;
  constructor(
    private readonly firebaseService: FirebaseService,
    options: FirebaseStorageOptions,
  ) {
    this.destination = options.destination || '';
    this.bucket = this.firebaseService.firebaseApp.storage().bucket();
  }

  _handleFile(req, file, callback) {
    const bucket = this.firebaseService.firebaseApp.storage().bucket();
    const fileName = path.join(this.destination, `${Date.now()}-${file.originalname}`);
    const fileUpload = bucket.file(fileName);

    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    if (!['image/jpeg', 'image/jpg', 'image/png', 'audio/mpeg', 'video/mp4'].includes(file.mimetype)) {
      callback(new CustomException('File type not supported', HttpStatus.UNPROCESSABLE_ENTITY), null);
      return;
    }

    file.stream
      .pipe(blobStream)
      .on('finish', async () => {
        // Generate signed URL for the uploaded file
        const [signedUrl] = await fileUpload.getSignedUrl({
          action: 'read',
          expires: addYears(new Date(), 30),
        });

        // Return the URL and file name
        callback(null, {
          path: signedUrl,
          mimetype: file.mimetype,
          filename: fileName,
        });
      })
      .on('error', (err) => {
        callback(err);
      });
  }
  _removeFile(req: e.Request, file: Express.Multer.File, cb: (error?: any) => void) {
    const blob = this.bucket.file(file.filename);

    blob
      .delete()
      .then(() => cb(null))
      .catch((err) => cb(err));
  }
}
