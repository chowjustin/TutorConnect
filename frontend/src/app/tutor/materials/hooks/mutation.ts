'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '@/lib/api';
import { uploadFile } from '@/lib/upload';
import { notifyAxiosError, notifySuccess } from '@/lib/toast';

export function useUploadMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: {
      file: File;
      title?: string;
      subject?: string;
      level?: string;
      kind?: string;
      description?: string;
      allowedStudents?: string[];
      isPremium?: boolean;
    }) => {
      const uploaded = await uploadFile(values.file, 'material');
      const res = await api.post('/materials', {
        fileUrl: uploaded.file_url,
        originalName: values.title || values.file.name,
        subject: values.subject,
        level: values.level,
        kind: values.kind,
        description: values.description,
        allowedStudents: values.allowedStudents,
        isPremium: values.isPremium,
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/materials/tutor'] });
      notifySuccess('Materi diunggah');
    },
    onError: (e) => notifyAxiosError(e),
  });
}
