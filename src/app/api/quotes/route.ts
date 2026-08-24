import { asyncHandler } from "@/helpers/async-handler";
import { QuoteController } from "@/controllers/quote.controller";

export const GET = asyncHandler(QuoteController.list);
