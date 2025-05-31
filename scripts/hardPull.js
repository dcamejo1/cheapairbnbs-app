// TODO: Need to add the option to pull a specific city
//  It should take in a name, take the link from sources.js, and populate the csvs directory with the csv file
import { HardPuller } from "../server/utils/hardPuller.js";

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const hardPuller = new HardPuller();

  const command = process.argv[2];

  switch (command) {
    case "pull":
      await hardPuller.pullAllCSVs();
      break;
    case "pullMissing":
    case "pull-missing":
      await hardPuller.pullMissingCSVs();
      break;
    case "status": {
      const status = await hardPuller.getLocalFiles();
      console.log(`📁 Local CSV files: ${status.totalCSVs}`);
      console.log(`📂 Data directory: ${status.dataDirectory}`);
      if (status.csvFiles.length > 0) {
        console.log(
          "Files:",
          status.csvFiles.slice(0, 5).join(", ") +
            (status.csvFiles.length > 5
              ? `... and ${status.csvFiles.length - 5} more`
              : "")
        );
      }
      break;
    }
    case "clear":
      await hardPuller.clearLocalFiles();
      break;
    default:
      console.log("Usage:");
      console.log(
        "  node scripts/hardPull.js pull         - Download all CSVs"
      );
      console.log(
        "  node scripts/hardPull.js pullMissing  - Download only missing CSVs (recommended)"
      );
      console.log(
        "  node scripts/hardPull.js status       - Check local files"
      );
      console.log(
        "  node scripts/hardPull.js clear        - Clear local files"
      );
  }
}

export { HardPuller };
