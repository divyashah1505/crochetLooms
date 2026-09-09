import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { cloudinaryConfig } from '../../config/cloudinary.config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadsService {
  private hasCloudinary = false;

  constructor() {
    if (
      cloudinaryConfig.cloudName &&
      !cloudinaryConfig.cloudName.includes('demo') &&
      cloudinaryConfig.apiKey &&
      cloudinaryConfig.apiSecret
    ) {
      cloudinary.config({
        cloud_name: cloudinaryConfig.cloudName,
        api_key: cloudinaryConfig.apiKey,
        api_secret: cloudinaryConfig.apiSecret,
      });
      this.hasCloudinary = true;
    }
  }

  async uploadFile(file: any): Promise<{ imageUrl: string; url: string; publicId?: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (this.hasCloudinary) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'crochet-products' },
          (error, result) => {
            if (error) return reject(new BadRequestException(error.message));
            resolve({
              imageUrl: result.secure_url,
              url: result.secure_url,
              publicId: result.public_id,
            });
          },
        );
        uploadStream.end(file.buffer);
      });
    }

    // Local Disk fallback
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const ext = path.extname(file.originalname) || '.jpg';
    const filename = `crochet_${Date.now()}_${Math.floor(Math.random() * 10000)}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, file.buffer);

    const fullUrl = `http://localhost:5000/uploads/${filename}`;

    return {
      imageUrl: fullUrl,
      url: fullUrl,
      publicId: filename,
    };
  }
}
