package com.andara.content.cli;

import com.andara.content.cli.commands.CreateCommand;
import com.andara.content.cli.commands.ValidateCommand;
import com.andara.content.cli.commands.ImportCommand;
import com.andara.content.cli.commands.ExportCommand;
import com.andara.content.cli.commands.ListCommand;
import com.andara.content.cli.commands.DiffCommand;
import com.andara.content.cli.commands.MergeCommand;
import picocli.CommandLine;
import picocli.CommandLine.Command;
import picocli.CommandLine.HelpCommand;

/**
 * Main CLI entry point for content management operations.
 */
@Command(
    name = "andara-content",
    description = "Content Management CLI for Andara's World",
    subcommands = {
        CreateCommand.class,
        ValidateCommand.class,
        ImportCommand.class,
        ExportCommand.class,
        ListCommand.class,
        DiffCommand.class,
        MergeCommand.class,
        HelpCommand.class
    },
    mixinStandardHelpOptions = true
)
public class ContentCLI implements Runnable {

    @CommandLine.Spec
    CommandLine.Model.CommandSpec spec;

    public static void main(String[] args) {
        int exitCode = new CommandLine(new ContentCLI()).execute(args);
        System.exit(exitCode);
    }

    @Override
    public void run() {
        // If no subcommand provided, show help
        spec.commandLine().usage(System.out);
    }
}
