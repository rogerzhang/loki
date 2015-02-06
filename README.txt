Quick Start Guide
	Environment Setup
		In order to use the Loki project, you will need to follow these steps for setting up your environment...

		- make sure you have the loki project - you can put it anywhere, but having it directly off the root may make config paths a bit shorter
		- make sure you have NodeJS installed - you can get it here... http://nodejs.org/
		- create a local clone of the UIZE project - you can get it here... https://github.com/UIZE/UIZE-JavaScript-Framework
		- have the code you want to localize checked out - the code can be checked out anywhere, but having it closer to the root will make config paths a bit shorter
		- modify the loc configuration (see below)

	Loc Configuration
		To configure the Loki project, follow these steps...

		- in the "loki" folder, find the "uize-config.json" file and open it in your text editor
		- modify the value of the "uizePath" config option according to where the UIZE project is in your environment - the path can be a relative path and must point to the "site-source" folder of the UIZE project
		- go to the "moduleConfigs" section of the JSON object, and then go to the "Uize.Build.Loc" subsection - this section contains all the configuration for the localization script
		- the configuration data already contains configuration for various projects, and the only options you will need to modify are the "rootFolderPath" values for each localization project - you can start with just one project that you care about for initial testing
		- modify the path in the "rootFolderPath" option so that it points to the equivalent folder of a project you want to localize, based upon where that project's code is checked out on your machine

	Running the Localization Script
		Once your environment has been set up correctly, you can run the various localization scripts by following these steps...

		- open up a terminal / console window and set the current working directory to the loki folder
		- once in the loki folder, perform a command of the form...

		..........................................................................................
		node [pathToUize]build.js Uize.Build.Loc project=ServiceWeb method=metrics console=verbose
		..........................................................................................

		If this command executes correctly, you will find the metrics report in the "loki/loc/ServiceWeb/metrics/en-US.json" file.

		[pathToUize]
			When pointing NodeJS to the "build.js" script that it should run, you should specify the path to this file in the root folder of the UIZE project in your local environment.

			The value of "[pathToUize]" should not contain the "site-source" folder like the "uizePath" config option - it should point to the root folder in your environment, since the "build.js" file is in the root folder.

		Executing a Method for Multiple Projects
			As a convenience, a comma-separated list of projects can be specified for the "project" parameter in order to execute a localization service method for multiple projects in a single line.

			................................................................................................................
			node [pathToUize]build.js Uize.Build.Loc project=ServiceWeb,ServiceWebJedi,ServiceWebHtmlTemplates method=export console=verbose
			................................................................................................................

			In the above example, resource strings are being exported from the "ServiceWeb", "ServiceWebJedi", and "ServiceWebHtmlTemplates" projects in a single command.

	Exporting Translation Jobs
		In order to export translation job files that can be sent to translators for translation, you should perform the following steps...

		Export the latest resource strings from the project...

		.........................................................................................
		node [pathToUize]build.js Uize.Build.Loc project=ServiceWeb method=export console=verbose
		.........................................................................................

		Export the translation jobs for the project...

		.............................................................................................
		node [pathToUize]build.js Uize.Build.Loc project=ServiceWeb method=exportJobs console=verbose
		.............................................................................................

		You should find various translation job files, as follows...

		- loc/ServiceWeb/jobs/en-GB.xlf
		- loc/ServiceWeb/jobs/fr-CA.xlf

		You will not find translation job files in the "jobs" folder for "en-US" (the primary language) or "en-ZZ" (the pseudo-locale).

	Importing Translation Jobs
		In order to import translation job files that were previously sent to translators for translation and have been returned with translated strings, you should perform the following steps...

		Export the latest resource strings from the project, in order to make sure that the .json files are up-to-date...

		.........................................................................................
		node [pathToUize]build.js Uize.Build.Loc project=ServiceWeb method=export console=verbose
		.........................................................................................

		Once you have have exported the resource strings and the .json files are up-to-date, then you can import the translation job files...

		.............................................................................................
		node [pathToUize]build.js Uize.Build.Loc project=ServiceWeb method=importJobs console=verbose
		.............................................................................................

		After the translation job files have been imported and the .json files have been updated with the translations from those files, the resource files in the codebase can be updated by importing the resource strings from the .json files...

		.........................................................................................
		node [pathToUize]build.js Uize.Build.Loc project=ServiceWeb method=import console=verbose
		.........................................................................................

	Doing Pseudo-localization
		There are two ways that pseudo-localization can be performed: one is through the regular translation process (using the "export -> exportJobs -> translate -> importJobs -> import" flow), and the other is a convenient short cut that can be used iteratively during development by using the special "pseudoLocalize" method.

		Pseudo-localizing Resources During Development
			At any time during development, the pseudo-localized resource strings can easily be generated / updated by executing the "pseudoLocalize" method in the local development environment.

			EXAMPLE
			.................................................................................................
			node [pathToUize]build.js Uize.Build.Loc project=ServiceWeb method=pseudoLocalize console=verbose
			.................................................................................................

			Executing the "pseudoLocalize" method will generate the pseudo-localized resource strings from the primary language resource strings (en-US, typically) and generate pseudo-localized resource files as necessary. Executing this method will not modify the JSON master resource files from the previous translation flow - the previous versions of those files will remain untouched.

			Target
				The optional target parameter lets you specify whether the pseudo-localized strings should be written to the resource files of the pseudo-locale or the resource files of the primary language.

				- "pseudo" (default) - the pseudo-localized resource strings will be written to the resource files for the pseudo-locale
				- "primary" - the pseudo-localized resource strings will be written to the resource files for the primary language

			Poor Man's Pseudo-localization (not recommended)
				If the project does not support the pseudo-locale as one of the possible locales that the application can be switched into at runtime, then the value "primary" can be specified for the target parameter.

				This approach is *not* the preferred approach, but if you need to do it this way, then follow these steps...

				- you will be temporarily changing all the primary language resource files, so make sure to commit any uncommited changes first
				- use the "pseudoLocalize" method to pseudo-localize the resource strings in the resource files of the primary language, by specifying target=primary
				- now, build and launch the application as you normally would in the primary language - you should see all the pseudo-localized strings in the UI
				- remember to revert the changes to the primary language resource files once you've tested with the pseudo-localized strings

		Pseudo-localizing Resources During Translation
			During the normal translation flow, there is nothing special that needs to be done in order to update the pseudo-localized strings in the resource files for the pseudo-locale.

			This is because the resource files for the pseudo-locale are automatically updated as a consequence of executing the "export" and then "import" methods.

