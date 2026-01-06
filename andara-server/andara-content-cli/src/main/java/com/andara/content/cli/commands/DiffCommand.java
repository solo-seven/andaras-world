package com.andara.content.cli.commands;

import picocli.CommandLine;

import java.util.concurrent.Callable;

/**
 * Shows differences between file and database versions.
 */
@CommandLine.Command(
    name = "diff",
    description = "Show differences between file and database"
)
public class DiffCommand implements Callable<Integer> {

    @CommandLine.Parameters(index = "0", description = "Content file")
    private String filePath;

    @CommandLine.Option(names = "--env", description = "Environment")
    private String environment = "dev";

    @Override
    public Integer call() throws Exception {
        System.out.println("Diffing " + filePath + " against " + environment);
        System.out.println("TODO: Diff functionality not yet implemented");
        return 0;
    }
}
