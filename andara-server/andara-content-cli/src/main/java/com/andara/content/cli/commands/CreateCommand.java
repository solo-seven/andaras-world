package com.andara.content.cli.commands;

import picocli.CommandLine;

import java.io.File;
import java.nio.file.Files;
import java.util.concurrent.Callable;

/**
 * Creates a new content file from a template.
 */
@CommandLine.Command(
    name = "create",
    description = "Create new content file from template"
)
public class CreateCommand implements Callable<Integer> {

    @CommandLine.Parameters(index = "0", description = "Content type")
    private String contentTypeStr;

    @CommandLine.Option(names = "--output", description = "Output file path")
    private File outputFile;

    @Override
    public Integer call() throws Exception {
        System.out.println("Creating " + contentTypeStr + " content");
        System.out.println("TODO: Template generation not yet implemented");
        
        if (outputFile != null) {
            Files.createDirectories(outputFile.getParentFile().toPath());
            Files.writeString(outputFile.toPath(), "{}");
            System.out.println("Created: " + outputFile);
        }
        
        return 0;
    }
}
