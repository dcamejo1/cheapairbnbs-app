import { HardPuller } from "../../utils/hardPuller.js";

export default defineEventHandler(async () => {
  console.log("🎯 Pull missing cities triggered via API");

  try {
    const hardPuller = new HardPuller();
    const result = await hardPuller.pullMissingCSVs();

    return {
      success: true,
      message:
        result.missingCount === 0
          ? "All cities already in cache - no downloads needed"
          : `Successfully pulled ${result.successful} missing cities`,
      data: result,
    };
  } catch (error) {
    console.error("Pull missing failed:", error);

    return {
      success: false,
      message: "Pull missing failed",
      error: error.message,
    };
  }
});
