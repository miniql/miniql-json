import { createQueryResolver, IQueryResolverConfig, IJsonFileConfig } from "..";

describe("query entities", () => {

    it("can create resolver to retreive multiple entities", async ()  => {

        const config: IQueryResolverConfig = {
            entities: {
                movie: {
                    primaryKey: "name",
                },
            },
        };

        const testJsonData = [
            {
                name: "The Bourne Identity",
                year: 2002,
            },
            {
                name: "Minority Report",
                year: 2002,
            },
        ];

        const jsonFiles: IJsonFileConfig = {
            movie: "movies.json",
        };

        const resolver = await createQueryResolver(config, jsonFiles, async (jsonFilePath: string) => testJsonData);
        
        const result = await resolver.get.movie.invoke({}, {});
        expect(result).toEqual([
            {
                name: "The Bourne Identity",
                year: 2002,
            },
            {
                name: "Minority Report",
                year: 2002,
            },
        ]);
    });

    it("can create resolver for multiple entity types", async ()  => {

        const config: IQueryResolverConfig = {
            entities: {
                movie: {
                    primaryKey: "name",
                },
                actor: {
                    primaryKey: "name",
                },
            },
        };

        const movieTestData = [
            {
                name: "The Bourne Identity",
                year: 2002,
            },
            {
                name: "Minority Report",
                year: 2002,
            },
        ];

        const actorTestData = [
            {
                name: "Matt Daemon",
            },
            {
                name: "Tom Cruise",
            },
        ];

        async function loadTestData(jsonFilePath: string): Promise<any[]> {
            if (jsonFilePath === "movies.json") {
                return movieTestData;
            }
            else if (jsonFilePath === "actors.json") {
                return actorTestData;
            }
            else {
                throw new Error(`Unexpected JSON file path "${jsonFilePath}".`);
            }
        }

        const jsonFiles: IJsonFileConfig = {
            movie: "movies.json",
            actor: "actors.json",
        };

        const resolver = await createQueryResolver(config, jsonFiles, loadTestData);

        const movies = await resolver.get.movie.invoke({}, {});
        expect(movies).toEqual([
            {
                name: "The Bourne Identity",
                year: 2002,
            },
            {
                name: "Minority Report",
                year: 2002,
            },
        ]);

        const actors = await resolver.get.actor.invoke({}, {});
        expect(actors).toEqual([
            {
                name: "Matt Daemon",
            },
            {
                name: "Tom Cruise",
            },
        ]);
    });
});
