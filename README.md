# Crimson Programming Language

Welcome to Crimson! This guide will help you get started with installing and using the Crimson programming language.

## Installation

Follow these steps to install Crimson on your Windows (64-bit) system:

1.  **Download the Installer:**
    Navigate to the [release page on GitHub](https://github.com/ModMaker101/crimson/releases/) (replace `your-repo` with the actual repository path). Download the `CrimsonInstaller.zip` file from the latest release.

2.  **Extract the Installer:**
    Unzip the downloaded `CrimsonInstaller.zip` file to a location of your choice.

3.  **Run the Installer (as Administrator):**
    Inside the extracted folder, locate and navigate into the `win64x` folder. **You must run the installer as an administrator** ```Crimson.Installer.exe``` for it to auto-install and configure the system path correctly. The installer should automatically begin the installation process for you.

4.  **Path Configuration:**
    The installer will automatically add Crimson to your system's PATH environment variable. This allows you to run Crimson commands directly from your command prompt.

## Usage

Once installed, you can use `crimson` as a command in your Command Prompt (CMD).

To verify your installation or see available commands, open a new Command Prompt window and type:
```
crimson help
```

This will display a list of available commands and their usage.

## Basic Syntax Examples

Here are a few basic examples to give you a taste of Crimson's syntax:

### Variable Declaration

Variables can be declared using `var` (or `let`) and optionally include type annotations.

This will display a list of available commands and their usage.

## Basic Syntax Examples

Here are a few basic examples to give you a taste of Crimson's syntax:

### Variable Declaration

Variables can be declared using `var` (or `let`) and optionally include type annotations.
```
var greeting = "Hello, Crimson!";
var Number = 100;
```

### Function Definition

Functions are defined using the `func` keyword, with optional parameter and return type annotations.
```
func add(a: Number, b: Number) {
    return a + b;
}

func sayHello(name: String) {
print ($"Hello, {name}!");
}
```

### Printing to Console

Use the `print` statement to output values to the console. Interpolated strings (prefixed with `$`) are supported.

```
print ("This is a simple message.");
var value = 42;
print ($"The answer is: {value}");
```
### Conditional Statements

Crimson supports standard `if-else` conditional logic.
```
if (count > 50) {
print "Count is greater than 50.";
} else {
print "Count is 50 or less.";
}
```
