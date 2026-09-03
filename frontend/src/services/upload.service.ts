import { apiClient } from './api';

export const uploadService = {
  async uploadSingle(file: File): Promise<{ url: string; imageUrl: string; publicId?: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const res: any = await apiClient.post('/uploads/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = res?.data || res;
    const url = data?.imageUrl || data?.url || '';
    return { url, imageUrl: url, publicId: data?.publicId };
  },

  async uploadMultiple(
    files: FileList | File[],
  ): Promise<{ url: string; imageUrl: string; publicId?: string }[]> {
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append('files', f));

    const res: any = await apiClient.post('/uploads/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const dataList = res?.data || res || [];
    if (Array.isArray(dataList)) {
      return dataList.map((item: any) => {
        const url = item?.imageUrl || item?.url || item;
        return { url, imageUrl: url, publicId: item?.publicId };
      });
    }

    return [];
  },
};
