import { HardPuller } from "../../utils/hardPuller.js";

export default defineEventHandler(async () => {
  try {
    const hardPuller = new HardPuller();
    const status = await hardPuller.getLocalFiles();

    return {
      success: true,
      data: status,
    };
  } catch (error) {
    console.error("Failed to get local data status:", error);

    return {
      success: false,
      message: "Failed to get local data status",
      error: error.message,
    };
  }
});
