import { asyncHandler } from "@/helpers/async-handler";
import { AdminQuoteController } from "@/controllers/admin-quote.controller";

export const GET = asyncHandler(AdminQuoteController.getById);
export const PUT = asyncHandler(AdminQuoteController.update);
export const DELETE = asyncHandler(AdminQuoteController.remove);
