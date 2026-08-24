import { asyncHandler } from "@/helpers/async-handler";
import { AdminQuoteController } from "@/controllers/admin-quote.controller";

export const GET = asyncHandler(AdminQuoteController.list);
export const POST = asyncHandler(AdminQuoteController.create);
