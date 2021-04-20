import path from "path";
import { Command } from "commander";
import { serve } from "@jbook2-msl/local-api";

const isProduction = process.env.NODE_ENV === "production";

/*
  - [filename] indicates filename is optional
  - <number> indicates number is required
*/
export const serveCommand = new Command()
  .command("serve [filename]")
  /*
    - this is what will be shown when users use the -h or --help option
  */
  .description("Open a file for editing")
  /*
    - the third parameter is the default value
  */
  .option("-p, --port <number>", "port to run server on", "4005")
  .action(async (filename = "notebook.js", options: { port: string }) => {
    /*
      - process.cwd gives you the current dir
      - path.dirname gives you the relative path 
        of the file
      - path.basename gives you the file name
        without the path part  
    */
    try {
      const dir = path.join(process.cwd(), path.dirname(filename));

      await serve(
        parseInt(options.port),
        path.basename(filename),
        dir,
        !isProduction
      );
      console.log(
        `Opened ${filename}. Navigate to http://localhost:${options.port} to edit the file`
      );
    } catch (err) {
      if (err.code === "EADDRINUSE") {
        console.error("Port is in use. Try running on a different port.");
      } else {
        console.log(err.message);
      }
      // terminate cli
      process.exit(1);
    }
  });
