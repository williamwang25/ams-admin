import { resolveAssetImageUrls, uploadAssetImageFiles } from "@/modules/asset/api";

const MAX_ASSET_IMAGE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const ASSET_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";
export const ASSET_IMAGE_MAX_COUNT = 8;

export interface UploadAssetImageProgress {
  index: number;
  fileName: string;
  percent: number;
}

export const validateAssetImageFiles = (files: File[], currentCount: number): void => {
  if (currentCount + files.length > ASSET_IMAGE_MAX_COUNT) {
    throw new Error(`资产图片最多上传 ${ASSET_IMAGE_MAX_COUNT} 张`);
  }

  for (const file of files) {
    if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
      throw new Error("仅支持 JPG、PNG、WebP 图片");
    }
    if (file.size > MAX_ASSET_IMAGE_SIZE) {
      throw new Error("单张图片不能超过 5MB");
    }
  }
};

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error(`${file.name} 读取失败`));
        return;
      }
      const [, base64 = ""] = result.split(",", 2);
      if (!base64) {
        reject(new Error(`${file.name} 图片内容为空`));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error(`${file.name} 读取失败`));
    reader.readAsDataURL(file);
  });

const resolveUploadedFileID = (fileIDs: string[], fallbackIndex = 0): string => {
  const fileID = fileIDs[fallbackIndex];
  if (!fileID) throw new Error("上传成功但未返回 fileID");
  return fileID;
};

export const uploadAssetImages = async (
  assetNo: string,
  files: File[],
  onProgress?: (progress: UploadAssetImageProgress) => void
): Promise<string[]> => {
  validateAssetImageFiles(files, 0);
  const uploadFiles = [];

  for (const [index, file] of files.entries()) {
    onProgress?.({ index, fileName: file.name, percent: 20 });
    const base64 = await fileToBase64(file);
    uploadFiles.push({
      name: file.name,
      content_type: file.type,
      base64,
    });
    onProgress?.({ index, fileName: file.name, percent: 60 });
  }

  const lastFile = files[files.length - 1];
  if (lastFile) onProgress?.({ index: files.length - 1, fileName: lastFile.name, percent: 85 });

  const result = await uploadAssetImageFiles({
    asset_no: assetNo,
    files: uploadFiles,
  });

  for (const [index, file] of files.entries()) {
    resolveUploadedFileID(result.fileIDs, index);
    onProgress?.({ index, fileName: file.name, percent: 100 });
  }

  return result.fileIDs;
};

export const resolveAssetImageTempUrls = async (
  fileIDs: string[],
  maxAge = 3600
): Promise<Map<string, string>> => {
  const uniqueIDs = Array.from(new Set(fileIDs.filter(Boolean)));
  if (uniqueIDs.length === 0) return new Map();

  const result = await resolveAssetImageUrls({ fileIDs: uniqueIDs, maxAge });
  const output = new Map<string, string>();
  for (const item of result.urls) {
    output.set(item.fileID, item.url);
  }

  return output;
};
