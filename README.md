# @miniql/csv

A [MiniQL](https://github.com/miniql/miniql) query resolver that loads data from CSV files.

Any problems? Please log an issue on this repo.

Love this? Please [star the repo](https://github.com/miniql/miniql) and [follow the developer on Twitter](https://twitter.com/ashleydavis75).

## Example

Find a complete and working Node.js example of using MiniQL with a CSV file dataset here:

https://github.com/miniql/miniql-csv-example

## Using it

Install the modules in your Node.js project:

```bash
npm install --save miniql
npm install --save @miniql/csv
```

Import the modules (JavaScript):

```javascript
const { miniql } = require("miniql");
const { createQueryResolver } = require("@miniql/csv");
```

Import the modules (TypeScript):

```typescript
import { miniql } from "miniql";
import { createQueryResolver } from "@miniql/csv";
```

Configure and create the CSV files query resolver:

```javascript
    //
    // Configures CSV files to be loaded and how they relate to each other.
    //
    const csvFilesConfig = {
        species: {
            primaryKey: "name",
            csvFilePath: "./data/species.csv",
            nested: {
                homeworld: {
                    parentKey: "homeworld",
                    from: "planet",
                },
            },
        },
        planet: {
            primaryKey: "name",
            csvFilePath: "./data/planets.csv",
            nested: {
                species: {
                    foreignKey: "homeworld",
                },
            },
        },
    };
    
    // 
    // Loads CSV files and creates a MiniQL query resolver.
    //
    const queryResolver = await createQueryResolver(csvFilesConfig);
```

Now you can make queries against the dataset, for example:

```javascript
    const query = {
        get: {
            species: { // Query for "species" entity.
            
                // No arguments gets all entities.

                resolve: {
                    homeworld: { // Resolves the homeworld of each species as a nested lookup.
                    },
                }
            },
        },
    };

    // Invokes MiniQL.
    const result = await miniql(query, queryResolver, {});  

    // Displays the query result.
    console.log(JSON.stringify(result, null, 4));
```

Please see [MiniQL](https://github.com/miniql/miniql) for more information on how to make queries.

Don't forget to [star the repo](https://github.com/miniql/miniql) and [follow the developer on Twitter](https://twitter.com/ashleydavis75).