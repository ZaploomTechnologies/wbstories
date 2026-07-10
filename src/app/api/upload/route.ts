import { asyncHandler } from "@/helpers/async-handler";
import { UploadController } from "@/controllers/upload.controller";

// Local disk writes (node:fs) require the Node runtime — explicit so this
// route can never be accidentally deployed to the Edge.
export const runtime = "nodejs";

export const POST = asyncHandler(UploadController.uploadImage);
