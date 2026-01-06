package com.andara.content.cli.commands;

import picocli.CommandLine;

import java.util.concurrent.Callable;

/**
 * Exports content from database to files.
 */
@CommandLine.Command(
    name = "export",
    description = "Export content from database to files"
)
public class ExportCommand implements Callable<Integer> {

    @CommandLine.Parameters(index = "0", description = "Content type")
    private String contentTypeStr;

    @CommandLine.Option(names = "--output", description = "Output directory")
    private String outputDir = "./content-export";

    @CommandLine.Option(names = "--env", description = "Environment")
    private String environment = "dev";

    @Override
    public Integer call() throws Exception {
        System.out.println("Exporting " + contentTypeStr + " to " + outputDir);
        System.out.println("TODO: Export service integration not yet implemented");
        return 0;
    }
}
