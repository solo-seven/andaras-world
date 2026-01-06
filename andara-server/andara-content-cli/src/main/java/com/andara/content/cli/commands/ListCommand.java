package com.andara.content.cli.commands;

import picocli.CommandLine;

import java.util.concurrent.Callable;

/**
 * Lists content items.
 */
@CommandLine.Command(
    name = "list",
    description = "List content items"
)
public class ListCommand implements Callable<Integer> {

    @CommandLine.Parameters(index = "0", description = "Content type")
    private String contentTypeStr;

    @CommandLine.Option(names = "--category", description = "Filter by category")
    private String category;

    @Override
    public Integer call() throws Exception {
        System.out.println("Listing " + contentTypeStr);
        System.out.println("TODO: List functionality not yet implemented");
        return 0;
    }
}
