package com.andara.content.cli.commands;

import picocli.CommandLine;

import java.util.concurrent.Callable;

/**
 * Imports content files into the database.
 */
@CommandLine.Command(
    name = "import",
    description = "Import content files into database"
)
public class ImportCommand implements Callable<Integer> {

    @CommandLine.Parameters(index = "0", description = "Content type")
    private String contentTypeStr;

    @CommandLine.Option(names = "--source", description = "Source directory or file")
    private String source;

    @CommandLine.Option(names = "--env", description = "Environment (dev, staging, prod)")
    private String environment = "dev";

    @Override
    public Integer call() throws Exception {
        System.out.println("Importing " + contentTypeStr + " from " + source);
        System.out.println("TODO: Import service integration not yet implemented");
        return 0;
    }
}
