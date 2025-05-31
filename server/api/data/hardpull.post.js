import { HardPuller } from "../../utils/hardPuller.js";

export default defineEventHandler(async () => {
  console.log("🚀 Hard pull triggered via API");

  try {
    const hardPuller = new HardPuller();
    const result = await hardPuller.pullAllCSVs();

    return {
      success: true,
      message: "Hard pull completed successfully",
      data: result,
    };
  } catch (error) {
    console.error("Hard pull failed:", error);

    return {
      success: false,
      message: "Hard pull failed",
      error: error.message,
    };
  }
});
