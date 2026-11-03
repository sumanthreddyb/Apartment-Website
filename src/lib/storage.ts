import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.env.UPLOAD_DIR ?? "./data/uploads");
const maxBytes = 10 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

export async function saveUpload(file: File, apartmentId: string) {
  if (!allowedTypes.has(file.type)) throw new Error("Unsupported file type");
  if (file.size < 1 || file.size > maxBytes) throw new Error("File size must be under 10 MB");
  const tenantDirectory = path.resolve(root, apartmentId);
  if (!tenantDirectory.startsWith(`${root}${path.sep}`)) throw new Error("Invalid apartment identifier");
  await mkdir(tenantDirectory, { recursive: true });
  const extension = path.extname(file.name).toLowerCase().replace(/[^.a-z0-9]/g, "").slice(0, 10);
  const id = `${randomUUID()}${extension}`;
  await writeFile(path.join(tenantDirectory, id), Buffer.from(await file.arrayBuffer()), { flag: "wx", mode: 0o600 });
  return { id, name: file.name.slice(0, 180), type: file.type, size: file.size };
}

export async function readUpload(apartmentId: string, id: string) {
  if (!/^[0-9a-f-]{36}\.[a-z0-9]{1,10}$/i.test(id)) throw new Error("Invalid file identifier");
  const target = path.resolve(root, apartmentId, id);
  if (!target.startsWith(`${path.resolve(root, apartmentId)}${path.sep}`)) throw new Error("Invalid file path");
  return readFile(target);
}

export async function deleteUpload(apartmentId: string, id: string) {
  if (!/^[0-9a-f-]{36}\.[a-z0-9]{1,10}$/i.test(id)) throw new Error("Invalid file identifier");
  const target = path.resolve(root, apartmentId, id);
  if (!target.startsWith(`${path.resolve(root, apartmentId)}${path.sep}`)) throw new Error("Invalid file path");
  await unlink(target);
}
