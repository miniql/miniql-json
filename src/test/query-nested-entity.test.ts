import { createQueryResolver, IQueryResolverConfig, IJsonFileConfig } from "..";

describe("query nested entity", () => {

    it("can create function to retreive a nested entity", async ()  => {

        const config: IQueryResolverConfig = {
            entities: {
                movie: {
                    primaryKey: "name",
                    nested: {
                        director: {
                            parentKey: "directorId",
                        },
                    },
                },
                director: {
                    primaryKey: "id",
                },
            },
        };

        const directorsTestData = [
            {
                id: "1234",
                name: "Doug Liman",
            },
        ];

        async function loadTestData(jsonFilePath: string): Promise<any[]> {
            if (jsonFilePath === "directors.json") {
                return directorsTestData;
            }
            else {
                throw new Error(`Unexpected JSON file path "${jsonFilePath}".`);
            }
        }

        const jsonFiles: IJsonFileConfig = {
            movie: "movies.json",
            director: "directors.json",
        };

        const resolver = await createQueryResolver(config, jsonFiles, loadTestData);
        
        const parentEntity = {
            name: "The Bourne Identity",
            year: 2002,
            directorId: "1234",
        };

        const result = await resolver.get.movie.nested!.director.invoke(parentEntity, {}, {});
        expect(result).toEqual({
            id: "1234",
            name: "Doug Liman",
        });
    });

    it("can create function to retreive multiple nested entities", async ()  => {

        const config: IQueryResolverConfig = {
            entities: {
                movie: {
                    primaryKey: "name",
                    nested: {
                        director: {
                            multiple: true,
                            parentKey: "name", //TODO: I kind of feel like this should be implied from the primaryKey.
                            foreignKey: "movie",
                        },
                    },
                },
                director: {
                    primaryKey: "name",
                },
            },
        };

        const moviesTestData = [
            {
                name: "The Bourne Identity",
                year: 2002,
            },
        ];

        const directorsTestData = [
            {
                name: "Doug Liman",
                movie: "The Bourne Identity",
            },
        ];

        async function loadTestData(jsonFilePath: string): Promise<any[]> {
            if (jsonFilePath === "movies.json") {
                return moviesTestData;
            }
            else if (jsonFilePath === "directors.json") {
                return directorsTestData;
            }
            else {
                throw new Error(`Unexpected JSON file path "${jsonFilePath}".`);
            }
        }

        const jsonFiles: IJsonFileConfig = {
            movie: "movies.json",
            director: "directors.json",
        };

        const resolver = await createQueryResolver(config, jsonFiles, loadTestData);
        
        const parentEntity = { 
            name: "The Bourne Identity",
        };

        const result = await resolver.get.movie.nested!.director.invoke(parentEntity, {}, {});
        expect(result).toEqual([ 
            {
                name: "Doug Liman",
                movie: "The Bourne Identity",
            },
        ]);
    });
});
