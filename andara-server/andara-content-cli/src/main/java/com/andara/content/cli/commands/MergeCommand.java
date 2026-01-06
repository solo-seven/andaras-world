package com.andara.content.cli.commands;

import picocli.CommandLine;

import java.util.concurrent.Callable;

/**
 * Performs three-way merge of content versions.
 */
@CommandLine.Command(
    name = "merge",
    description = "Merge content versions"
)
public class MergeCommand implements Callable<Integer> {

    @CommandLine.Option(names = "--base", description = "Base version file")
    private String base;

    @CommandLine.Option(names = "--theirs", description = "Their version file")
    private String theirs;

    @CommandLine.Option(names = "--yours", description = "Your version file")
    private String yours;

    @CommandLine.Option(names = "--output", description = "Output file")
    private String output;

    @Override
    public Integer call() throws Exception {
        System.out.println("Merging content versions");
        System.out.println("TODO: Merge functionality not yet implemented");
        return 0;
    }
}
