# About

## What is the Lexington Housing Dashboard?

The Lexington Housing Dashboard is a tool designed for visualizing and understanding high-level trends in housing in Lexington-Fayette County. It was developed by the 2014 [Code for America Lexington](http://www.codeforamerica.org/governments/lexington/) fellows.

The dashboard displays neighborhood-level data -- such as building permits, foreclosures, and code enforcement housing violations -- on a year-over-year basis, allowing users to not only see how neighborhoods compare to each other, but also how neighborhoods have changed over time. Data for the dashboard has been provided by the [Lexington-Fayette Urban County Government](http://lexingtonky.gov) and the [Fayette County Property Valuation Administrator](http://www.fayette-pva.com).

## How was it made?

The tool is built based on the development version of the [Charlotte Quality of Life Dashbaord](http://mcmap.org/qol/), built by Tobin Bradley for the City of Charlotte, NC, Mecklenburg County, and UNCC. That project is also in production and can be found on GitHub [here](http://github.com/tobinbradley/Mecklenburg-County-Quality-of-Life-Dashboard).

If you are interested in redeploying this for your city, see the ["Redepoying for Your City"](http://github.com/codeforamerica/lexington-qold#redeploying-for-your-city) section on the project's [GitHub Repo](http://github.com/codeforamerica/lexington-qold).

## How did you decide which data to include?

The Lexington Housing Dashboard includes housing code complaints, nuisance complaints, building permits, foreclosures, and average property value for each voting precinct in Lexington. Each of these datasets was determined to be an indicator of neighborhood health with respect to housing.

### Housing Code Complaints

The City of Lexington relies on the International Property Maintenance Code, which regulates the minimum maintenance requirements for existing buildings. The code is intended to "establish minimum maintenance standards for basic equipment, light, ventilation, heating, sanitation and fire safety," with the ultimate goal of providing for the "regulation and safe use of existing structures in the interest of the social and economic welfare of the community." Knowledge of areas with a high number of housing code violations can help target assistance to areas that may be unsafe or need rehabilitation, as well as indicate the quality of property maintenance in an area.

### Nuisance Violations

According to the Lexington Code of Ordinances, "Nuisance shall mean any condition or use of premises or of building exteriors which is detrimental to the property of others or which causes or tends to cause substantial diminution in the value of other property in the neighborhood in which such premises are located." The nuisance code exists to maintain a high quality physical environment, which is directly related to the perceptions of safety and desirability of a particular area. A high number of nuisance calls can mean a high level of discomfort in a particular area.

### Building Permits

Building permits are typically the most accurate available indicator of construction in a community, a metric that indicates both availability of developable land and economic trends related to market conditions. Building permits show areas where communities are growing and changing.

### Foreclosures

A high number of foreclosures in an area can indicate high levels of poverty, joblessness, and general neighborhood neglect. Foreclosures create abandoned properties, which are a blight on a community and can signal increases in crime.

### Property Value

Average residential property value is a good indicator of the health of individual properties themselves in a given area. High property value in an area indicates maintenance of properties in that area, but more importantly, it is a good indicator of desirability of an area.


## Why voting precincts?

The goal of the project is to indicate the health of neighborhoods, but Lexington does not have a list of official neighborhood boundaries. It does have boundaries of registered neighborhood associations, but those boundaries do not cover the entirety of Lexington (and some actually overlap each other). Additionally, each voting precinct represents approximately 1,000 people, which makes data comparisons more telling.

If you're curious which voting precinct your house falls in, search your address in [What's My District](http://whatsmydistrict.org), a project by [OpenLexington](http://openlexington.org).

## I have a question / complaint / compliment. Where should I direct it?


We love feedback! Please send us your thoughts at [lexington@codeforamerica.org](mailto:lexington+dashboard@codeforamerica.org).
