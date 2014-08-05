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

	Doing Pseudo-localization
		In order to perform pseudo-localization for a project, you need to run the localization script and execute the "export" method, as follows...

		.........................................................................................
		node [pathToUize]build.js Uize.Build.Loc project=ServiceWeb method=export console=verbose
		.........................................................................................

		If this command executes correctly, you will find various language resources files, as follows...

		- en-GB.json
		- en-US.json -- the primary language resource strings
		- fr-CA.json
		- en-ZZ.json -- the pseudo-localized resource strings

		If no previous translations have been made for the non-primary languages, then the string values for all the strings will be empty / blank. The pseudo-localized string are automatically generated during the export process, since no translation is needed as they are derived from the primary language strings.

		Importing the Pseudo-localized Strings
			Once you have executed the "export" method and you have the generated pseudo-localized resources file, you need to import the pseudo-localized strings back into your project's codebase.

			Ideally, the project being localized would fully support pseudo-locales, so that the pseudo-locale is selectable at runtime.

			Poor Man's Pseudo-localization
				If the project does not support pseudo-locale as one of the possible locales that the application can be switched into, pseudo-localization can be performed in a less elegant way by following these steps...

				- you will be temporarily changing all the primary language resource files, so make sure you can revert your changes later once you've tested pseudo-localization
				- use the "pseudoLocalize" localization method to pseudo-localize the resource strings in the resource files of the primary language
				- now, build and launch the application as you normally would in the primary language - you should see all the pseudo-localized strings in the UI

